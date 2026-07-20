# Action 614 Checkpoint - Atomic Consumption Storage Schema And Transaction Plan

## Action

Action 614 - Design Atomic Consumption Storage Schema and Transaction Contract.

## Execution Environment

Local Codex workspace: `/Users/willysimonsson/Dev/trade-action-534`

Branch: `codex/action-534-live-resolver`

Baseline: committed Action 613 checkpoint at `2cf97d5 Add atomic Git authority consumption planning`.

## Artifacts Created

- `docs/dormant-git-runner-atomic-consumption-storage-schema-action-614.md`
- `docs/dormant-git-runner-atomic-consumption-transaction-architecture-action-614.md`
- `docs/dormant-git-runner-atomic-consumption-storage-action-614-checkpoint.md`

## Artifacts Updated

- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Scope Verdict

Documentation and architecture planning only.

No migration, SQL/RPC implementation, persistence adapter, pure transition contract, dormant runner, authority consumption, Git execution, process creation or observation, repository inspection, runtime/API/UI/cron/worker/CLI reachability, credentials, environment access, network access, Avanza/trading behavior, persistence behavior, staging activation, deployment, commit, push, merge, or deploy was added.

## Approved Baseline

Action 614 starts from the Action 613 approved atomic-consumption plan:

- final-approved pure dormant Git runner authority package;
- fixed six-stage read-only Git observation sequence;
- fixed `/usr/bin/git`;
- fixed 30000 ms lifetime;
- exact package, policy, session, executable, revalidation, worktree, and compatibility fingerprints;
- no storage, no replay prevention implementation, no server adapter, no runner, and no authority consumed live.

## Selected Table Architecture

Selected future schema:

- `public.git_runner_authority_consumption_records`;
- `public.git_runner_authority_consumption_stages`;
- `public.git_runner_authority_consumption_audit_events`.

This three-table shape was selected over embedded JSON, event-only reconstruction, stage-only rows, and reuse of `execution_authorization_consumptions`.

## Schema Identities

- schema family: `ture.execution.dormant-git-runner-authority-consumption-storage.schema-family.v1`
- package table: `ture.execution.dormant-git-runner-authority-consumption-record.table.v1`
- stage table: `ture.execution.dormant-git-runner-authority-consumption-stage.table.v1`
- audit table: `ture.execution.dormant-git-runner-authority-consumption-audit.table.v1`
- transaction contract: `ture.execution.dormant-git-runner-authority-consumption-transaction.contract.v1`

## States

Selected durable states:

- `issued`;
- `active`;
- `partially_consumed`;
- `consumed`;
- `failed_consumed`;
- `ambiguous_failed_consumed`;
- `expired`;
- `revoked`.

`ambiguous_failed_consumed` is included to preserve crash/process-start ambiguity without retry, replay, reset, or inferred success.

## Constraints Planned

Planned uniqueness includes consumption key, package ID, package fingerprint, package ID/fingerprint pair, package stage index, stage-consumption fingerprint, process-attempt fingerprint, direct-spawn request fingerprint, audit event sequence, and audit event fingerprint.

Planned CHECK constraints include fingerprint grammar, stage index range, stage counters, retry zero, fallback false, exact 30000 ms expiry window, terminal-state consistency, active-consumer nullability, and aggregate-fingerprint nullability.

Cross-row invariants remain transactional.

## RLS And Access

Planned posture:

- RLS enabled on all three future tables;
- no anon/authenticated client policies;
- no direct client table privileges;
- no browser/client Supabase path;
- SECURITY DEFINER transaction functions with fixed search path and schema-qualified table references;
- no dynamic SQL;
- no direct table mutation path for application callers;
- server-only reviewed adapter required in a later Action.

## Transaction Operations

Planned closed operation set:

1. `register_git_runner_authority_package`;
2. `claim_git_runner_authority_consumer`;
3. `consume_git_runner_authority_stage`;
4. `record_git_runner_authority_stage_completion`;
5. `terminalize_git_runner_authority_failure`;
6. `terminalize_git_runner_authority_expiry`;
7. `revoke_git_runner_authority_package`;
8. `finalize_git_runner_authority_aggregate`;
9. `read_git_runner_authority_consumption_state`.

Every mutating operation must update package/stage state and append sanitized audit in one transaction.

## Privacy And Retention

Permitted storage is limited to identities, fingerprints, states, reasons, stage indexes, counters, platform/fixed executable identity, and timestamps.

Forbidden storage includes raw paths, filenames, Git output, porcelain file entries, credentials, environment values, process handles, PIDs, raw SQL/Node errors, stack traces, and arbitrary caller metadata.

Retention duration remains unresolved and requires a separate future retention gate.

## Missing Migration Baseline

The absent `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains unrelated. It targets the older staging authorization-consumption path and `public.execution_authorization_consumptions`. Action 614 does not create or restore it.

## Validation

Validation commands and final counts are recorded in the completion report. Required validation includes TypeScript, relevant Playwright suites, `git diff --check`, static production-source diff review, runtime-reachability review, prohibited-operation review, quiet `.env.local` diff guard, zero-size docs check, and missing-migration baseline check.

## Decision

`post_trade_dormant_git_runner_atomic_consumption_storage_schema_plan_ready`

## Result Status

`post_trade_dormant_git_runner_atomic_consumption_storage_action_614_planning_gate_completed`

## Recommended Next Action

Action 615 - Implement Pure Atomic Dormant Git Authority Consumption Transition Contract.

## Commit And Deploy

No deploy is recommended for Action 614. A source-control checkpoint commit may be considered only after the documentation diff and validation are manually inspected.
