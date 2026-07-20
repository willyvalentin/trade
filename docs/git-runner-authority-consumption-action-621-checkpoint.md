# Action 621 Checkpoint - Git Runner Authority Consumption Migration And RPC Plan

Action: 621 - Plan Migration and Transactional RPC Implementation for Dormant Git Authority Consumption

Decision: `post_trade_git_runner_authority_consumption_migration_rpc_plan_ready`

Result status: `post_trade_git_runner_authority_consumption_action_621_planning_gate_completed`

Recommended next Action: Action 622 - Implement Git Runner Authority Consumption Storage Schema Migration

## Files Created

- `docs/git-runner-authority-consumption-migration-rpc-plan-action-621.md`
- `docs/git-runner-authority-consumption-database-security-action-621.md`
- `docs/git-runner-authority-consumption-action-621-checkpoint.md`

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Approved Baseline

Baseline commit: `8f3a95b Add reviewed dormant Git authority consumption transitions`.

The baseline includes Action 614 storage architecture and Action 615-620 final-approved pure dormant Git authority-consumption transition contract.

## Migration Package

Selected future migration pair:

1. `supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql`
2. `supabase/migrations/20260720001000_create_git_runner_authority_consumption_rpcs.sql`

Action 622 should implement only the storage schema migration.

## Schema Architecture

Use three tables:

- `public.git_runner_authority_consumption_records`
- `public.git_runner_authority_consumption_stages`
- `public.git_runner_authority_consumption_audit_events`

Use CHECK-backed text, not Postgres enums. RLS is enabled with deny-all client posture. Mutations are planned only through later SECURITY DEFINER RPCs.

## Security Posture

- No anon/authenticated table access.
- No permissive client policies.
- SECURITY DEFINER RPCs in the later RPC migration.
- Fixed search path.
- No dynamic SQL.
- No raw SQL/database errors returned.
- No raw paths, Git output, process handles, environment values, or credentials stored.

## RPC Inventory

Future RPCs:

1. `register_git_runner_authority_package`
2. `claim_git_runner_authority_consumer`
3. `consume_git_runner_authority_stage`
4. `record_git_runner_authority_stage_completion`
5. `terminalize_git_runner_authority_failure`
6. `terminalize_git_runner_authority_ambiguous_failure`
7. `terminalize_git_runner_authority_expiry`
8. `revoke_git_runner_authority_package`
9. `finalize_git_runner_authority_aggregate`
10. `read_git_runner_authority_consumption_state`

## Locking And Isolation

Selected future mechanism:

- `select ... for update` on package rows;
- stage row locks for stage operations;
- transition-version CAS in transaction;
- unique constraints for package, stage, process request, and audit sequence;
- no application-only locks;
- no blind retry after ambiguous commit state.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts --reporter=dot`: first sandbox attempt reached completion but failed writing Playwright `.last-run.json` with `EPERM`; minimum-permission rerun passed, 77 tests.
- Authority-package suite: passed, 155 tests.
- Direct-spawn, executable revalidation, first-live resolver, resolver, and resolver security suites: passed, 564 tests.
- Compatibility policy, Git parsers, Git-version orchestrator, aggregate, porcelain, byte-completion, and simple-observation suites: passed, 451 tests.
- Neutralization, raw-completion, dormant composition, pure composition, and process-executor suites: passed, 103 tests.
- Action 533 cross-boundary integration suite: passed, 181 tests.
- Broad dormant/process/credential/CLI/authorization group: passed, 1540 tests.
- Scoped ESLint on changed TS/JS files: not applicable; Action 621 changed no TS/JS files.
- Static source diff guard for TS/JS/SQL/migration/production files: passed; no matching files changed.
- Static export-surface, runtime-reachability, prohibited-operation, migration-package, RPC-security, RLS/grant, transaction/locking, audit-atomicity, and implementation-order reviews: passed.
- `git diff --check`: passed.
- quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.

## Non-Authorizations

Action 621 does not authorize database readiness, migration application, RPC deployment, atomic replay safety, authority consumption, Git execution, process creation, process observation, repository inspection, runner implementation, runtime/API/UI activation, credentials, environment access, network access, Avanza/trading behavior, persistence writes, staging activation, deployment, retries, fallback, cache substitution, or automatic reissuance.

## Commit And Deploy

No deploy is recommended for Action 621.

Do not commit until the complete planning diff has been manually inspected.
