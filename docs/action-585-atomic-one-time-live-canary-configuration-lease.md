# Action 585 - Atomic One-Time Live Canary Configuration Lease

## Decision

`atomic_one_time_live_canary_configuration_lease_ready`

This implementation removes the live manual path's dependency on production environment propagation. Global production defaults remain canary disabled and kill switch active. No flag mutation, provider request, production authorization, lease, claim, audit, ledger entry, schedule, migration application, commit, push, or deployment was performed by this Action.

## Durable Lease Contract

Action 585 adds `continuous_intelligence_shadow_canary_manual_execution_leases` and the versioned contract `continuous_intelligence_shadow_canary_manual_execution_lease_v1`.

- A lease is server-issued with a manual authorization through one service-role-only RPC.
- The lease is one-to-one with its authorization, single-use, and expires in no more than 60 seconds.
- It is bound to the immutable canonical request: `AAPL`, `5min`, exactly 30 minutes, one estimated credit, and policy `377` total / `57` hard reserve / `320` normal planned maximum.
- The table persists an opaque lease ID, not a raw lease credential or token hash. The ID is not an execution credential by itself: canonical admission also requires the matching short-lived authorization token and immutable binding.
- An authorization token alone is insufficient after this Action because manual execution also requires the matching opaque lease ID.

The authorization and lease therefore form a paired, non-transferable admission capability. Neither is accepted by the scheduled route, legacy gate route, or any direct RPC invocation.

## Atomic Issuance and Admission

`issue_ci_shadow_canary_manual_lease(...)` creates the authorization and lease in one database transaction. A failed lease insert rolls back the authorization creation.

`admit_ci_shadow_canary_manual_lease(...)` performs this in one database transaction:

1. Locks the matching authorization and lease.
2. Verifies the authorization token, lease ID, exact shared identity, expiry, request bounds, and policy facts.
3. Verifies the daily cap before any consumption.
4. Inserts the exact claim in `attempted` state.
5. Consumes the lease and authorization together.

The admission transaction fails closed on missing, malformed, expired, replayed, mismatched, or policy-invalid records. A replay can only return a non-admitting outcome; it cannot create a second claim or provider request.

## Narrow Global-Default Override

The canonical manual-execution route now requires the global defaults to remain unchanged:

- `TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED` must remain disabled.
- `TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH` must remain active.

After lease-aware admission succeeds, the route treats exactly these two existing preflight blockers as covered by the durable lease:

- `canary_disabled`
- `canary_kill_switch_active`

It does not override any other blocker. Schedule absence, calendar verification, completed range availability, provider configuration and accepted budget metadata, daily limits, planner authorization, runtime capacity, audit enablement, ledger enablement, exact request identity, and claim finalization remain mandatory.

The scheduled canary path remains unchanged and still requires the normal global enabled/released configuration. No environment variable is written by any Action 585 route or adapter.

## Execution and Terminal State

Only a successful lease-aware admission permits the existing bounded execution runtime. It preserves one provider request, one estimated credit, a five-second timeout, no retry, no cache mutation, no schedule activation, and no scanner, recommendation, ranking, broker, or execution side effect.

Every admitted path continues through identity-bound claim finalization before audit or ledger persistence. Provider rejection, timeout, malformed result, budget rejection after admission, policy rejection after admission, and internal exception retain a failed terminal claim. A provider call cannot begin when authorization, lease, claim admission, or immediate runtime recheck is not proven.

## Test Coverage

Focused Action 585 coverage verifies:

- only the two disabled defaults are lease-overridable;
- provider readiness remains non-overridable;
- lease records are non-secret, exact-bound, and TTL-bounded;
- authorization, lease, and claim are coupled in the service-role-only migration;
- manual execution requires an opaque lease ID and leaves global defaults unchanged;
- missing/malformed/mismatched/replayed/expired lease and authorization cases, wrong ticker, interval, window, policy, duplicate claims, and daily-cap failures fail closed before provider entry.

Action 580 and Action 583 regression tests remain part of the focused validation set.

## Production Verification (2026-07-22)

`atomic_one_time_live_canary_configuration_lease_production_verified`

Read-only production verification confirmed the deployed main lineage contains Action 585, and the lease table is available with zero rows. The table rejects anonymous and authenticated access, while service-role readback found no authorization, lease, claim, audit, or credit-ledger records. Probes for `raw_token`, `lease_token_hash`, and `token_hash` on the lease table each returned PostgreSQL's missing-column code, confirming that no raw lease or token credential column is present.

The deployed activation-readiness route returned `ready_for_one_manual_canary_attempt`. It reported canary disabled, kill switch enabled, and no repository, deployment, or remote schedule declaration. The non-mutating canary preflight returned only `canary_disabled` and `canary_kill_switch_active`, with daily usage `0` runs / `0` estimated credits, canonical `AAPL` / `5min` / 30-minute bounds, and zero provider calls or durable writes.

The deployed manual-authorization and canonical manual-execution routes both reject `HEAD` with `405`, so this verification did not issue credentials or submit execution. The legacy manual-execution-gate route is likewise non-executing. The migration contract binds issuance and admission to the service-role-only paired authorization/lease RPCs; admission locks the pair, validates the exact immutable contract, creates the attempted claim, and consumes both records in the same transaction.

Global defaults remain unchanged: canary disabled, kill switch active, and no schedule active. No production authorization, lease, claim, provider call, audit write, ledger write, flag change, or schedule activation occurred during this verification.

## Operational Status

The durable lease path is production-verified. It remains dormant behind the existing global defaults and requires a separately authorized, explicit one-time live canary action before any authorization or provider request may occur.
