# Action 614 - Canonical Execution Admission Unavailable Diagnosis

## Decision

`execution_admission_unavailable_root_cause_identified`

## Exact Failure Chain

Action 613 reached the canonical manual-execution route with a valid,
unconsumed authorization and matching lease. The route passed its static
preflight and authorization-binding read, then called the lease admission
persistence adapter.

The deployed application calls this exact RPC name:

`admit_ci_shadow_canary_manual_lease`

The name is within PostgreSQL's identifier limit and the service-role PostgREST
OpenAPI catalog exposed the exact `/rpc/admit_ci_shadow_canary_manual_lease`
path. This rules out the prior long-name truncation class of defect, a missing
RPC path, and a stale PostgREST schema path for this admission function.

The expired Action 613 authorization/lease pair was read back without exposing
identifiers. Its execution identity, claim identity, and request fingerprint
matched an existing terminal, provider-attempted claim exactly. The lease
admission function attempts to insert the claim after validating this binding.
Because the claim and execution identity already existed, the table's unique
constraint raised `unique_violation`. The function catches that condition and
returns `daily_usage_unavailable`.

The server adapter recognizes these admission statuses:

- `attempt_started`
- `already_admitted`
- `authorization_expired`
- `authorization_replayed`
- `identity_mismatch`
- `daily_limit_reached`

It does not recognize `daily_usage_unavailable`. It therefore collapses that
typed duplicate-key outcome into its fail-closed `unavailable` status. The route
maps `unavailable` to HTTP `503`, which is the exact sanitized Action 613
response.

## Root Cause

The root cause has two connected parts:

1. The lifecycle execution and claim identity remains deterministic from UTC day
   and request fingerprint. A new same-day attempt with the same completed
   AAPL/`5min`/30-minute request range therefore reuses the existing claim key.
   Action 611 made receipt and ledger identity claim-scoped after admission, but
   did not make a second admission attempt with the same lifecycle key distinct.
2. The lease admission adapter omits `daily_usage_unavailable` from its explicit
   status mapping. The deterministic duplicate-key containment result is thus
   reported externally as generic `unavailable` rather than a precise,
   non-provider admission outcome.

## Branch Review

The adapter maps to `unavailable` when its service database is absent, a raw
credential is missing, the RPC returns an error or no object row, the RPC throws,
or the returned `admission_status` is not in its recognized list. For Action 613:

- The route had a valid pair and reached admission.
- The exact RPC is present in the production PostgREST catalog.
- The persisted pair was exact-bound and expired only after the request.
- The existing terminal claim exactly matched the pair's lifecycle identity.
- The migration's `unique_violation` branch deterministically returns
  `daily_usage_unavailable` for this collision.

No evidence supports an RPC lookup, schema-cache, signature, permission,
environment, connectivity, wrapper, or deployment identity failure.

## Production Containment

- Action 613 credentials remained unconsumed and are now past their 60-second
  TTL; no credential was reused.
- No claim was created, begun, or finalized by Action 613.
- No provider call, audit row, ledger row, or usage increment occurred.
- Existing historical claims and records remain unchanged.
- Canary remains disabled, the kill switch remains active, and no schedule is
  active.

## Local Verification

Focused Action 585 and Action 611 tests passed: `8/8`.
They verify the lease admission's fail-closed migration contract and the
attempt-scoped receipt behavior without invoking production resources.

## Required Follow-Up

A separate scoped repair must make retry/admission identity explicitly
attempt-scoped, or return a typed terminal duplicate outcome without consuming a
new authorization. The adapter must preserve `daily_usage_unavailable` as a
precise sanitized admission result rather than collapsing it to `unavailable`.
No new live attempt should be authorized until that behavior is corrected and
verified.
