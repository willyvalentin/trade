# Action 622 Checkpoint - Git Runner Authority Consumption Storage Schema Migration

Action: 622 - Git Runner Authority Consumption Storage Schema Migration

Decision: `post_trade_git_runner_authority_consumption_storage_schema_migration_ready_for_static_security_review`

Result status: `post_trade_git_runner_authority_consumption_storage_action_622_migration_implemented`

Recommended next Action: Action 623 - Static Security Review of Git Runner Authority Consumption Storage Schema Migration

## Files Created

- `supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql`
- `tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts`
- `docs/git-runner-authority-consumption-storage-migration-action-622.md`
- `docs/git-runner-authority-consumption-storage-action-622-checkpoint.md`

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Baseline

Baseline commit: `f577917 Plan Git authority consumption storage and RPCs`.

The baseline contains the committed Action 621 planning checkpoint, Action 614 storage architecture, and Action 615-620 final-approved pure authority-consumption transition contract.

## Migration Identity

Created:

`supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql`

No existing migration used timestamp `20260720000000`.

## Storage Tables

Created:

- `public.git_runner_authority_consumption_records`
- `public.git_runner_authority_consumption_stages`
- `public.git_runner_authority_consumption_audit_events`

The migration creates no RPCs, SECURITY DEFINER functions, runtime adapters, API/UI/runner reachability, Git execution, process creation/observation, repository inspection, or live authority consumption.

## Constraint Posture

- CHECK-backed text values, not Postgres enums.
- Lowercase SHA-256 grammar for all fingerprint columns.
- Exact package state, stage outcome, audit operation/status/reason closures.
- Exact six-stage identity mapping.
- Package state/count/version/expiry/terminal/consumer/aggregate checks.
- Stage consumption/completion/outcome/nullability checks.
- Audit version increment, prior-event, previous-state, runtime, authority, and TOCTOU checks.

## RLS And Grants

- RLS enabled on all three tables.
- No permissive policies.
- All table privileges revoked from `public`, `anon`, and `authenticated`.
- No direct application role grants.
- No RPC execute grants because no RPC exists in Action 622.

## Cross-Row Invariants Deferred

Deferred to future reviewed transactional RPCs:

- exactly six stages per package;
- package counters versus stage rows;
- prior accepted completions before later stage consumption;
- no duplicate terminalization;
- state mutation plus audit append atomicity;
- audit sequence allocation;
- transition-version CAS;
- expiry/revocation race precedence;
- one-winner concurrency.

## Validation

- `./node_modules/.bin/tsc --noEmit`: first sandbox attempt failed on `tsconfig.tsbuildinfo` `EPERM`; minimum-permission rerun passed.
- `npx playwright test tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts --reporter=dot`: first sandbox attempt failed on Playwright `.last-run.json` `EPERM`; after two assertion-tightening iterations, minimum-permission rerun passed, 20 tests.
- Pure authority-consumption transition suite: passed, 77 tests.
- Authority-package suite: passed, 155 tests.
- Direct-spawn, executable revalidation, resolver, and resolver-security group: passed, 564 tests.
- Compatibility policy, Git parsers, Git-version orchestrator, aggregate, porcelain, byte-completion, and simple-observation group: passed, 451 tests.
- Neutralization, raw-completion, dormant composition, pure composition, and process-executor group: passed, 103 tests.
- Action 533 cross-boundary integration suite: passed, 181 tests.
- Broad dormant/process/credential/CLI/authorization group: passed, 1540 tests.
- Scoped ESLint on changed TS/JS files: passed.
- Existing durable authorization-consumption migration-static baseline check: failed before discovery on known unrelated missing file `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`.
- Static SQL syntax review: repository-local `psql` was unavailable; static SQL clause and forbidden-clause scans passed.
- Static migration filename/order, table/column, closed-value CHECK, fingerprint CHECK, package-invariant, stage-invariant, audit-invariant, unique/FK/index, RLS/policy/grant, append-only, no-RPC/no-SECURITY-DEFINER, privacy-column, cross-row-deferred-invariant, production-reachability, and prohibited-operation reviews: passed.
- Quiet `.env.local` diff guard: passed.
- `git diff --check`: passed.
- `find docs -type f -size 0`: passed.

## Non-Authorizations

Action 622 does not authorize database readiness, applying the migration, RPC deployment, atomic replay safety, package registration, authority consumption, Git execution, process creation or observation, repository inspection, runner implementation, runtime/API/UI activation, credentials, environment access, network access, Avanza/trading behavior, staging activation, deployment, retries, fallback, caching, or automatic reissuance.

## Commit And Deploy

No deploy is recommended for Action 622.

Do not commit until the complete diff has been manually inspected.
