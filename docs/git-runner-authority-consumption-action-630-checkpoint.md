# Action 630 Checkpoint - Disposable Local Database Validation Plan

Action: 630 - Plan Disposable Local Database Validation of Git Runner Authority Consumption Migrations

Decision: `post_trade_git_runner_authority_consumption_local_database_validation_plan_ready`

Result status: `post_trade_git_runner_authority_consumption_action_630_planning_gate_completed`

Recommended next Action: Action 631 - Implement Disposable Postgres Validation Harness for Git Runner Authority Consumption Migrations

## Files Created

- `docs/git-runner-authority-consumption-local-database-validation-plan-action-630.md`
- `docs/git-runner-authority-consumption-local-harness-security-action-630.md`
- `docs/git-runner-authority-consumption-action-630-checkpoint.md`

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Static Baseline

Action 629 approved the Action 626-629 RPC migration package for static retention only. The Action 622 storage migration and Action 626 RPC migration are committed in the current branch and present in `supabase/migrations`.

## Execution Gap

No database execution has occurred. SQL parsing, function creation, catalog metadata, RLS/ACL execution, constraints, return-query behavior, transaction rollback, row locks, CAS, concurrency, and exact read row counts remain to be validated in a disposable local database.

## Tooling Inventory

- Supabase CLI: `/opt/homebrew/bin/supabase`, version `2.107.0` with disposable temp HOME. Normal HOME version attempt tried to write telemetry and was rejected by sandbox.
- Docker CLI: `/usr/local/bin/docker`, version `29.6.1`, build `8900f1d`.
- Podman: not found.
- `psql`: not found.
- `pg_isready`: not found.
- `supabase/config.toml`: absent.
- Repository DB scripts: absent.
- Compose/Dockerfile harness: absent.
- DB driver dependency: absent.

## Selected Harness

Preferred architecture: disposable plain Postgres container with exact application of only the two reviewed migrations.

Fallback: Supabase CLI local stack only if isolated config/no-link/manual two-migration behavior is separately proven.

Selected next Action: Action 631 - Implement Disposable Postgres Validation Harness for Git Runner Authority Consumption Migrations.

Reason: Docker CLI availability and the preferred disposable plain Postgres harness architecture are documented. Action 631 must still perform a fail-closed local runtime preflight before starting any container, including daemon availability, image strategy, explicit local port isolation, environment neutralization, and SQL execution mechanism checks. If those checks cannot prove a disposable no-remote harness, Action 631 must stop.

## Planning Verdicts

- Remote-exclusion posture: defined.
- Missing-migration handling: avoid full repository replay; apply only two reviewed migrations.
- Database version/extensions: require disposable Postgres version capture and `pgcrypto`/UUID prerequisite.
- Role bootstrap: defined for `anon`, `authenticated`, optional `service_role`, migration owner, and unprivileged test role.
- Migration application order: defined.
- Catalog validation: defined.
- Storage tests: defined.
- Privilege tests: defined.
- RPC tests: defined.
- Expiry matrix: defined.
- Concurrency/CAS plan: defined.
- Rollback/audit plan: defined.
- Read plan: defined.
- Error-leakage plan: defined.
- Fixture strategy: defined.
- Cleanup model: defined.
- Evidence package: defined.
- Future gates: defined.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-git-runner-authority-consumption-rpc-migration.spec.ts --reporter=dot`: first sandbox attempt failed with `.last-run.json` `EPERM`; minimum-permission rerun passed, 45 tests.
- `npx playwright test tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts --reporter=dot`: passed, 31 tests.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts --reporter=dot`: passed, 77 tests.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts --reporter=dot`: passed, 155 tests.
- Direct-spawn, executable-revalidation, executable-resolution, and resolver security group: first sandbox attempt failed with `.last-run.json` `EPERM`; minimum-permission rerun passed, 913 tests.
- Compatibility, parser, orchestrator, and observation group: first sandbox attempt failed with `.last-run.json` `EPERM`; minimum-permission rerun passed, 451 tests.
- Broad dormant/process/credential/CLI/authorization group excluding the known missing migration-static blocker: first sandbox attempt failed with `.last-run.json` `EPERM`; minimum-permission rerun passed, 804 tests.
- Action 533 cross-boundary integration suite: first sandbox attempt failed with `.last-run.json` `EPERM`; minimum-permission rerun passed, 181 tests.
- Scoped ESLint on changed TypeScript/JavaScript files: not applicable; Action 630/630R changed only Markdown documentation.
- `git diff --check`: passed.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.

## Non-Authorizations

Action 630 did not start a database, connect to a database, apply migrations, execute SQL against Postgres, register a package, consume authority, execute Git, create or observe a product process, inspect a repository through runtime behavior, activate runtime/API/UI/runner paths, read credentials, access network, add Avanza/trading/staging/deployment behavior, or implement retries/fallback/cache/reissue/reconciliation/reset behavior.

## Commit And Deploy

No deploy is recommended for Action 630.

Do not commit until the complete diff has been manually inspected.
