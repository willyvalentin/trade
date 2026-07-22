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

## Validation Boundary

This change is local only. It does not issue or consume a production authorization, invoke a provider, create a production claim, apply a migration, deploy, or change any production flag. A production attempt remains separately authorized and must first deploy this source and migration, then repeat Action 582 checkpoints with a fresh authorization.
