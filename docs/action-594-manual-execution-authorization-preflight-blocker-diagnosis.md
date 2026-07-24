# Action 594 - Manual Execution Authorization Preflight Blocker Diagnosis

## Decision

`execution_authorization_preflight_blocker_identified`

## Scope and Safety

This action was diagnostic only. It did not issue or consume an authorization or
lease, invoke the manual-execution route, call the provider, create a claim,
write audit or ledger data, change a flag, activate a schedule, deploy, commit,
or push. The production reads used non-secret metadata only; no raw token,
lease identifier, token hash, service key, or sensitive URL is recorded here.

## Observed Action 593 Result

The one authorized Action 593 execution request returned HTTP `409` with
`authorization_preflight_blocked`. That status is emitted only by the
authorization-read and binding-comparison branch in
`app/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution/route.ts`, before the
atomic authorization-plus-lease admission RPC.

The route had therefore already passed request authentication and shape
validation, built a non-null current binding, and accepted all global runtime
preconditions. No claim was admitted and no provider work started.

## Exact Root Cause

The authorization persistence reader returns `requested_start` and
`requested_end` directly from PostgreSQL `timestamptz` columns. Production
readback confirmed both strings parse to valid instants but neither is in the
canonical UTC serialization produced by `Date#toISOString()`.

The current binding is built from
`buildContinuousIntelligenceShadowCanaryRange()`, which normalizes its range
with `toISOString()`. The comparison in
`matchesContinuousIntelligenceShadowCanaryManualAuthorizationBinding()` then
uses strict string equality for both timestamps. Equivalent instants with
different legal ISO representations therefore fail the comparison.

This is an authorization persistence adapter/response-mapping defect, not a
failed provider, claim, lease, policy, calendar, deployment-identity, or
global-default gate. It is sufficient by itself to produce the observed `409`:

1. the row is found and parses;
2. the raw token hash can be valid;
3. raw persisted timestamp text differs from the freshly generated canonical
   timestamp text;
4. binding comparison returns false;
5. the route returns `authorization_preflight_blocked` before atomic admission.

The independently recomputed latest-completed 30-minute range is also a
separate time-boundary risk, but it was not needed to explain this failure.

## Canonical Route Trace

1. `POST /api/automation/continuous-intelligence/shadow-collector/canary/manual-execution`
   validates `x-automation-secret` and the exact three-field request body.
2. `buildContinuousIntelligenceShadowCanaryManualAuthorizationContext()` builds
   calendar, provider, planner, daily-usage, schedule, readiness, and
   deployment facts.
3. `buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding()` binds
   the canonical AAPL / `5min` / 30-minute request, lifecycle identity,
   calendar fingerprint, policy, and deployment identity.
4. The route requires a non-null binding, only the two disabled-default
   blockers, disabled canary, active kill switch, no schedule, capacity,
   resolved provider budget, durable audit enabled, and ledger enabled. A
   failure here would return HTTP `403` `execution_preflight_blocked`, not the
   observed `409`.
5. `readContinuousIntelligenceShadowCanaryManualAuthorization()` looks up the
   authorization by ID, validates its parsed shape, then verifies the supplied
   token hash.
6. `matchesContinuousIntelligenceShadowCanaryManualAuthorizationBinding()`
   compares every field. Its raw `requested_start` and `requested_end` string
   comparison rejects PostgreSQL/PostgREST timestamp serialization even when
   the instant is identical.
7. Only after that comparison would
   `admitContinuousIntelligenceShadowCanaryManualExecutionWithLease()` receive
   the lease ID, consume both credentials, and admit a claim. It was never
   reached in Action 593.

## Read-Only Execution-Preflight Diagnostic

A no-credential, read-only diagnostic compared the stored, expired Action 593
authorization and lease metadata with the current non-mutating canary
preflight. It performed no durable writes and no provider call.

| Check | Result |
| --- | --- |
| Production preflight | HTTP `403` with only `canary_disabled` and `canary_kill_switch_active` |
| Authorization rows | `1`; issued, unconsumed, expired |
| Lease rows | `1`; issued, unconsumed, expired |
| Authorization and lease contract | exact AAPL / `5min` / 30-minute / `377 / 57 / 320` |
| Authorization and lease shared binding metadata | match |
| Stored deployment identity | expected deployed identity |
| Authorization TTL | at most 60 seconds |
| Stored range timestamps parse | true |
| Stored range timestamps already canonical `toISOString()` text | false |
| Claims | `0` |
| Audit rows | `0` |
| Ledger rows | `0` |
| Daily usage | `0 / 0` |
| Provider calls in this diagnosis | `0` |

The read-only result also confirmed the stored range is not the current range,
which is expected after expiry and does not alter the more fundamental
serialization defect above.

## Preflight Conditions Accounted For

The route can reject before admission for these reasons:

- request authentication and exact three-field serialization;
- non-null canonical binding, including AAPL / `5min` / 30-minute contract,
  calendar, lifecycle fingerprint, and deployment marker;
- only the two safe-default blockers;
- canary disabled and kill switch active, as required by the lease path;
- schedule inactivity;
- daily usage/capacity availability;
- provider-budget resolution;
- durable audit and ledger feature readiness;
- authorization lookup, shape parsing, and token-hash verification;
- complete authorization binding equality, including request range, calendar,
  policy, contract versions, execution/claim identity, and deployment identity.

Lease binding, claim-admission identity, daily claim cap, replay handling, and
concurrency guards are evaluated only in the subsequent atomic admission RPC.
They cannot have caused the observed pre-admission HTTP `409`.

## Production Baseline After Diagnosis

- manual authorizations: `1`, expired and unconsumed;
- manual execution leases: `1`, expired and unconsumed;
- claims: `0`;
- audit rows: `0`;
- ledger rows: `0`;
- daily usage: `0 / 0`;
- provider calls: `0`;
- schedule: inactive;
- canary: disabled;
- kill switch: active.

The expired credentials remain unusable and were not read as raw values.

## Required Follow-Up

Fix the server persistence adapter to normalize database timestamp fields to
canonical UTC ISO strings before constructing or comparing an authorization
binding. The repair must retain strict instant equality, preserve the 60-second
TTL and full request binding, and add coverage for PostgREST `timestamptz`
serialization. A future live attempt requires separate explicit authorization.
