# Execution Audit Migration Apply Plan

Date: 2026-06-10

Status: Documentation-only apply/rollback plan. The migration has not been applied. No Supabase command was run, no database state was modified, and no app write path was added.

Related files:

- `supabase/migrations/20260610000000_execution_audit_foundation.sql`
- `docs/execution-audit-apply-readiness-review.md`
- `docs/execution-audit-persistence-flag-design.md`
- `docs/supabase-migration-tooling-setup-plan.md`
- `docs/execution-persistence-schema-proposal.md`
- `docs/execution-persistence-schema-review.md`
- `lib/execution-audit-persistence-contract.ts`
- `lib/execution-audit-persistence-client.ts`
- `lib/execution-audit-persistence-writer.ts`
- `lib/execution-audit-supabase-writer.ts`
- `lib/execution-persistence-flags.ts`

## Scope

This plan covers applying only the Action 219 audit foundation migration:

- `execution_lifecycle_events`
- `execution_agent_runs`
- `execution_agent_progress_events`

This plan does not include:

- `broker_execution_results`
- `execution_records`
- `execution_intents`
- `broker_handoffs`
- History or Statistics integration
- Live trade open/close mutation
- Broker execution or Avanza automation
- Supabase write wiring from the Action 220 route stubs

The Action 220/221 API stubs and Settings buttons should continue to validate payloads only. They should not write these tables until a later server writer action is explicitly approved.

Action 223 added a pure server-side writer draft in `lib/execution-audit-persistence-writer.ts`. It maps validated requests into insert-shaped payloads for this migration and includes a no-op writer interface, but it does not import Supabase, call Supabase, or wire route persistence.

Action 224 added `docs/execution-audit-apply-readiness-review.md`. That review marks local/staging apply as the next safe step only after explicit user approval, and production as not recommended until RLS and `user_id` ownership are resolved.

Action 225B added `docs/execution-audit-persistence-flag-design.md` and `lib/execution-persistence-flags.ts`. Future route persistence must use server-only flags and remain disabled by default.

Action 227 added `lib/execution-audit-supabase-writer.ts`, an injected-client Supabase writer draft. It is not route-wired by default and should not be used until this migration has been applied and verified.

Action 230 added `docs/supabase-migration-tooling-setup-plan.md` after the Action 229 apply attempt was blocked. That plan defines the required local or staging/dev Supabase tooling path before retrying this apply plan. It does not install tools, add credentials, apply migrations, or modify database state.

## Preflight Checklist

Before applying the migration anywhere:

- Confirm the git state is clean or intentionally scoped to this migration.
- Confirm the exact target Supabase project and environment: local, staging, or production.
- Confirm backup/snapshot availability for the target database.
- Confirm whether this is a local/staging dry run or a production deployment.
- Confirm the auth, `user_id`, and RLS decision for this environment.
- Inspect existing migrations for naming, extension, RLS, and ownership conflicts.
- Review `supabase/migrations/20260610000000_execution_audit_foundation.sql` line by line.
- Verify the migration only creates the three audit foundation tables and related indexes/comments.
- Verify no app write paths are enabled yet.
- Verify Action 220 route stubs still return validation-only responses.
- Verify Action 223 writer mappings are not imported by API routes for persistence yet.
- Verify Action 227 Supabase writer is not route-wired yet.
- Verify `EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED` is unset or false unless the next action explicitly wires server-side persistence.
- Confirm execution dev tools flags for the target app build.
- Review rollback SQL before applying.
- Confirm no one expects History, Statistics, live trades, broker results, or Avanza behavior to change.

Recommended preflight commands:

```bash
git status --short
git diff --check
```

Project-specific Supabase command names should be confirmed before use. Do not infer the target project from local environment variables without checking the Supabase dashboard or project config.

## Apply Steps

Recommended order:

1. Apply to local Supabase or a disposable database first.
2. Apply to staging only after local verification passes.
3. Apply to production only after the RLS/user ownership decision is resolved.
4. Keep app write paths disabled until post-apply verification is complete.

Likely command shapes, depending on project setup:

```bash
# Local database, if Supabase local dev is configured:
supabase db reset

# Linked staging or production project, only after confirming target:
supabase db push
```

If the project uses a different migration process, replace these with the project-specific command. The important rule is to confirm the target environment before running anything.

After applying:

- Verify all three tables exist.
- Verify expected columns and indexes exist.
- Verify RLS state matches the reviewed decision.
- Verify all three tables start with zero rows.
- Do not enable API route writes in the same step.

## Verification SQL

Table existence:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'execution_lifecycle_events',
    'execution_agent_runs',
    'execution_agent_progress_events'
  )
order by table_name;
```

Column existence:

```sql
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'execution_lifecycle_events',
    'execution_agent_runs',
    'execution_agent_progress_events'
  )
order by table_name, ordinal_position;
```

Index existence:

```sql
select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in (
    'execution_lifecycle_events',
    'execution_agent_runs',
    'execution_agent_progress_events'
  )
order by tablename, indexname;
```

RLS status:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'execution_lifecycle_events',
    'execution_agent_runs',
    'execution_agent_progress_events'
  )
order by tablename;
```

Initial row counts:

```sql
select 'execution_lifecycle_events' as table_name, count(*) as row_count
from public.execution_lifecycle_events
union all
select 'execution_agent_runs', count(*)
from public.execution_agent_runs
union all
select 'execution_agent_progress_events', count(*)
from public.execution_agent_progress_events;
```

Optional staging-only insert/select smoke test, only with explicit approval:

```sql
insert into public.execution_lifecycle_events (
  lifecycle_id,
  event_type,
  source,
  source_environment,
  is_mock,
  is_dev,
  message,
  payload,
  metadata
) values (
  'migration_smoke_lifecycle',
  'migration_smoke',
  'manual',
  'staging',
  true,
  true,
  'Migration smoke test only. Delete after verification.',
  '{}'::jsonb,
  '{"migration_smoke": true}'::jsonb
);

select id, lifecycle_id, event_type, source_environment, is_mock, is_dev
from public.execution_lifecycle_events
where lifecycle_id = 'migration_smoke_lifecycle';

delete from public.execution_lifecycle_events
where lifecycle_id = 'migration_smoke_lifecycle';
```

Do not run insert/select smoke tests in production unless there is an explicit approved production test-data policy.

## Rollback Strategy

Safest rollback before app writes:

- Drop the tables in reverse dependency order.
- `execution_agent_progress_events` must be dropped before `execution_agent_runs` because it references `execution_agent_runs(id)`.
- `execution_lifecycle_events` has no dependency on the other two tables.

Example rollback SQL:

```sql
drop table if exists public.execution_agent_progress_events;
drop table if exists public.execution_agent_runs;
drop table if exists public.execution_lifecycle_events;
```

Do not rollback blindly after production writes have started. If any real or staging data exists:

- Stop app writes first.
- Export or snapshot the affected tables.
- Confirm whether downstream jobs, dashboards, or diagnostics reference the tables.
- Decide whether to preserve rows in an archive table instead of dropping.
- Run rollback only after approval from the owner of the target environment.

## Post-Apply App Checks

Run normal app checks after the migration is applied:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Expected app behavior after applying the migration:

- Settings audit stub buttons still return accepted validation responses when dev tools are enabled.
- Dev-tools-disabled builds still hide the Settings audit stub panel and route stubs still return disabled responses.
- No route persists to Supabase yet.
- The Action 223 writer draft still maps payloads only and is not route-wired.
- The Action 225B persistence flags remain off unless route persistence is explicitly added later.
- The Action 227 Supabase writer remains injected-only and is not used by routes by default.
- No local execution records are created by audit stub tests.
- No broker result is created.
- No History or Statistics update occurs.
- No live trade state is mutated.

## Risk Notes

- RLS uncertainty remains the biggest production blocker. The draft migration intentionally does not enable RLS because the project-wide auth ownership convention is not finalized.
- `user_id` is nullable in the draft. That is acceptable for a local/staging foundation test, but production needs a clear ownership model.
- Dev/mock data separation must remain explicit through `source_environment`, `is_mock`, and `is_dev`.
- Lifecycle and progress tables can grow quickly. Retention and cleanup policy should be defined before high-volume agent testing.
- Future idempotency rules are not covered by this migration because broker result and execution record tables are out of scope.
- No real broker data should be stored in these tables yet.
- Raw payloads must remain minimized. Do not store credentials, browser cookies, raw broker pages, or session material.

## Go/No-Go Decision

Go for local/staging when:

- The target project is confirmed.
- Backup/snapshot is available.
- Migration SQL review is complete.
- Verification SQL has been reviewed.
- Rollback SQL has been reviewed.
- No app write path is enabled.
- Staging apply succeeds.
- Verification SQL passes.

No-go when:

- RLS or `user_id` ownership is unresolved for production.
- The target Supabase project cannot be confirmed.
- Backup/snapshot availability is unclear.
- App write paths are accidentally enabled.
- Any expected table, column, index, or constraint differs from the reviewed migration.
- A rollback/export owner is not identified.

## Recommended Next Action

Preferred:

- Action 231A - Configure Local Supabase Tooling

Alternative:

- Action 231B - Configure Staging Supabase Link

After one setup path exists:

- Action 229 retry - Apply Audit Migration Locally/Staging and Verify

This requires a concrete non-production Supabase execution path, such as a linked Supabase CLI project, a staging/dev database URL usable by `psql`, or another approved staging/dev SQL runner.

Do not wire route persistence before the migration has been applied and verified in local/staging.

## Action 229 Attempt

Date: 2026-06-10

Requested target: staging/dev Supabase, explicitly not production.

Preflight outcome:

- Confirmed the requested target was non-production.
- Confirmed the intended migration file exists:
  - `supabase/migrations/20260610000000_execution_audit_foundation.sql`
- Inspected the migration SQL and confirmed it targets only:
  - `execution_lifecycle_events`
  - `execution_agent_runs`
  - `execution_agent_progress_events`
- Confirmed the current app route persistence flags were not enabled or changed.
- Confirmed the working tree already contains expected in-progress Action 196-228 changes.

Apply outcome:

- Migration was not applied.
- No verification SQL was run against Supabase.
- No test rows were inserted.
- No test rows were deleted.

Blocker:

- No Supabase CLI is installed in the workspace.
- No `psql` binary is installed in the workspace.
- No `supabase/config.toml` or linked project config exists in the repo.
- `.env.local` exposes only public/anon Supabase variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- No service-role key, database URL, or other admin SQL execution credential is available in the shell environment.

Required to retry:

- A confirmed staging/dev Supabase project target, plus one approved execution path:
  - install/use Supabase CLI with a linked staging/dev project, or
  - provide/use a staging/dev database URL with `psql`, or
  - run the migration SQL through an approved staging/dev SQL runner.
- See `docs/supabase-migration-tooling-setup-plan.md` for the local and staging/dev setup options before retrying.

Production remains no-go.
