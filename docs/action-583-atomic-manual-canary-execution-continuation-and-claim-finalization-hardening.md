# Action 583 - Atomic Manual Canary Execution Continuation and Claim Finalization Hardening

## Implementation

Action 583 adds one canonical server-only entrypoint:

`POST /api/automation/continuous-intelligence/shadow-collector/canary/manual-execution`

It accepts only an authorization ID and raw authorization token under automation-secret authentication. The token is used only for the service-role admission RPC and is never returned, logged, persisted in a receipt, or included in a response.

The new migration `20260722002000_admit_continuous_intelligence_shadow_canary_manual_execution.sql` adds the service-role-only admission RPC. In one transaction it locks and validates the issued authorization, enforces its immutable binding and expiry, enforces the existing UTC daily caps, inserts the exact claim in `attempted` state, and consumes the authorization. A successful consumed state therefore has a matching admitted attempt. Replay returns a safe non-admitting result and cannot call the provider.

The legacy manual execution gate is now dry-run-only for a ready authorization. A normal request returns `execution_handoff_unavailable` before consumption. It can no longer create `gate_consumed_execution_not_started`.

## Execution And Finalization

The canonical route rebuilds the current canonical request and verifies the stored immutable binding before admission. It requires the exact `AAPL`, `5min`, completed 30-minute request, accepted provider metadata, enabled durable audit and ledger, a current calendar, absent schedule signals, and one normal-capacity planner authorization.

After atomic admission, all execution outcomes are converted to a safe result. Provider entry is explicitly tracked. The route finalizes the exact claim before attempting audit and ledger persistence, so provider rejection, timeout, malformed response, kill-switch/feature-gate recheck, and internal exceptions leave a terminal `completed` or `failed` claim rather than a new dangling `claimed` state.

The route preserves the `377 / 57 / 320` policy, one provider request, one estimated credit, zero reserve use, five-second timeout, no retry, no schedule, no cache mutation, and no recommendation, scanner, ranking, execution, or broker effects. Manual receipts use `entry_kind: bounded_manual_proof`.

## Production Verification

- Verification timestamp: `2026-07-22T15:08:55Z`.
- Deployment identity: Action 583 commit `3ed015a` is an ancestor of production `origin/main` at `494d76c396b766f8767cfad099194ea0e06bbe75`.
- Migration `20260722002000_admit_continuous_intelligence_shadow_canary_manual_execution.sql` is registered locally and remotely. Its reviewed SQL creates the admission RPC with a transaction-scoped authorization lock, inserts an `attempted` claim before consuming the authorization, and grants execution only to `service_role` after revoking `public`, `anon`, and `authenticated`.
- Canonical manual-execution and legacy gate `HEAD` requests returned HTTP `405`, confirming their deployed POST-only handlers without invoking either handler.
- A deliberately authorization-shaped request to the scheduled-canary route returned HTTP `409` with `manual_execution_continuation_not_implemented`, `provider_calls_executed: false`, `claims_created: false`, `attempts_begun: false`, and `audit_or_ledger_writes_executed: false`.
- Readiness returned `ready_for_one_manual_canary_attempt`. Non-mutating preflight returned only `canary_disabled` and `canary_kill_switch_active`, with daily usage `0` runs and `0` estimated credits.
- Production row readback: manual authorizations `0`, daily claims `0`, audits `0`, and credit-ledger rows `0`.
- A `raw_token` column probe returned PostgreSQL `42703`; the table has no raw-token column. The canonical route response and receipts expose no raw token.
- Direct production catalog inspection is unavailable because `SUPABASE_DB_URL` is unset. Service-role-only permissions, replay/expiry/identity rejection, exact `AAPL` / `5min` / 30-minute bounds, and `377 / 57 / 320` constraints are verified from the applied migration, its isolated PostgreSQL execution, and the deployed route contract; no mutation RPC was invoked to prove them dynamically.

## Final Decision

`atomic_manual_canary_execution_production_verified`

No production authorization, claim, attempt, provider request, audit write, ledger write, flag change, schedule action, deployment, or database mutation occurred during verification. A future live attempt still requires separate explicit authorization and a fresh read-only checkpoint.
