# Action 652A — Execution Intent Risk-Envelope Admission

## Scope

Action 652A is a local, default-off admission successor for synthetic execution
intent. It evaluates a verified Action 650S preparation against an externally
owned, read-only risk envelope before any manual-confirmation step. It neither
submits nor prepares a live broker request.

The normative artifacts are exactly:

1. `lib/action-652a-execution-risk-envelope-admission.ts`
2. `tests/fixtures/action-652a-execution-risk-envelope-admission-fixtures.ts`
3. `tests/e2e/action-652a-execution-risk-envelope-admission.spec.ts`
4. `docs/action-652a-execution-risk-envelope-admission.md`
5. `docs/action-652a-execution-risk-envelope-admission-golden-report.json`

## Default-off gate

`runAction652aExecutionIntentAdmission(gate, request)` evaluates `gate` before
touching `request`. Disabled and kill-switch paths return frozen static evidence
with zero request reads, authority reads, digest work, provider calls, broker
requests, database operations, process spawning, and mutations.

## External authority and immutable input

The risk-policy owner calls `createAction652aExternalRiskAuthority`. The returned
handle is deeply frozen, policy/snapshot/envelope-digest-bound, and registered in
a private provenance set. Admission callers may supply only that opaque handle.
Clones, caller-created policy/limit fields, additional request keys, and
self-consistent recomputation without provenance fail closed.

An enabled request is captured once through property descriptors. Accessors are
rejected without executing getters. Proxies, cycles, non-plain data, descriptor
failures, excessive depth, nodes, properties, or string bytes produce sanitized,
digest-bound failure evidence. Only the frozen snapshot bytes are used for the
admission decision; original references are used only for preparation and
authority provenance checks.

## Bound projections

The terminal evidence binds:

- execution, lifecycle, preparation, handoff, payload, idempotency, and session
  identity;
- instrument and side;
- quantity in scale-0 units, price in scale-6 SEK micros per unit, and notional
  in scale-6 SEK micros;
- caller intent creation and strict expiry;
- external policy identity, version, digest, allowlist, and all risk limits;
- finalized cash, exposure, open-intent, daily-order, and daily-notional snapshot
  identity and digest;
- market/session/calendar authority identity, version, digest, open, and close;
- observed preparation, intent, authority, request, and rejected-input digests;
- admission reason, failure provenance, manual-confirmation gate identity, and
  independently rebuildable terminal digest.

Scaled values are unsigned canonical decimal strings bounded by signed 128-bit
range. Notional is recomputed with integer arithmetic as `quantity × price`.
Overflow, negatives, malformed values, unit or scale mismatch, prepared-payload
conflicts, and post-verification mutation fail closed.

## Closed decision taxonomy

The only statuses are:

- `admitted`: every lineage, authority, numeric, temporal, snapshot, and limit
  check passed;
- `rejected`: a valid intent exceeded the external risk envelope;
- `incomplete`: required or safely capturable evidence was absent;
- `conflicting`: identities, provenance, digests, scales, units, or recomputed
  values disagreed;
- `not_point_in_time_safe`: policy, intent, market session, or finalized snapshot
  could not support the admission instant.

Only an original, frozen, provenance-registered `admitted` result whose terminal
digest independently rebuilds can pass
`canAction652aProceedToManualConfirmation`. All other statuses and all clones are
blocked.

## Temporal rules

All instants use the Action 650U nanosecond parser and canonical UTC projection:

```text
policy_effective_at <= admission_at < policy_expires_at
intent_created_at <= admission_at < intent_expires_at
session_open_at <= admission_at < session_close_at
snapshot_observed_at <= snapshot_finalized_at <= admission_at
admission_at < snapshot_expires_at
admission_at - snapshot_observed_at <= maximum_snapshot_age_nanoseconds
```

The golden matrix proves equivalent output across UTC forms, Europe/Stockholm,
America/New_York offsets, and reversed allowlist order. Exact boundary,
minus-one-nanosecond, and plus-one-nanosecond cases are covered.

## Synthetic interoperation and exclusions

The focused suite proves the local chain:

```text
intent admitted
→ identity-bound manual-confirmation gate
→ existing confirmed synthetic replay
→ Action 651C diagnostic audit
```

The contract contains no Avanza, broker transport, credential, BankID, browser,
CDP, live provider data, database, persistence, process, order, trade, position,
or production-write capability. It permits no automatic execution and makes no
real-fill, performance, execution-quality, or causal claim.

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```
