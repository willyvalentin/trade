# Execution Audit Apply Readiness Review

Date: 2026-06-10

Status: Documentation-only readiness review. No Supabase migration command was run, no database state changed, no API route was modified, and no app behavior changed.

Related:

- `supabase/migrations/20260610000000_execution_audit_foundation.sql`
- `docs/execution-audit-migration-apply-plan.md`
- `docs/supabase-migration-tooling-setup-plan.md`
- `docs/execution-audit-persistence-flag-design.md`
- `docs/execution-persistence-schema-proposal.md`
- `docs/execution-persistence-schema-review.md`
- `lib/execution-audit-persistence-contract.ts`
- `lib/execution-audit-persistence-writer.ts`
- `lib/execution-audit-supabase-writer.ts`
- `lib/execution-persistence-flags.ts`

## Current Implementation State

- Migration draft exists for:
  - `execution_lifecycle_events`
  - `execution_agent_runs`
  - `execution_agent_progress_events`
- Dev-gated route stubs exist:
  - `POST /api/execution/audit/lifecycle-events`
  - `POST /api/execution/audit/agent-runs`
  - `POST /api/execution/audit/agent-progress-events`
- Frontend client helpers and Settings test buttons exist for manually exercising those stubs.
- Pure writer mapping helpers exist and can convert validated requests into insert-shaped payloads for the draft tables.
- A no-op writer interface exists and reports `persisted: false`.
- A server-only persistence flag helper exists for future route wiring and defaults to disabled.
- An injected-client Supabase writer implementation draft exists, but it is not used by routes by default.
- No API route is wired to the writer.
- No Supabase client is imported by the writer draft.
- No database writes are enabled.
- No broker execution, broker result persistence, trade mutation, History integration, or Statistics integration is implemented.

## Readiness Checklist

| Item | Status | Notes |
| --- | --- | --- |
| Migration SQL reviewed | Pass for local/staging | The draft creates only the three audit foundation tables, indexes, check constraints, and comments. |
| Writer mapping matches table columns | Pass | Action 223 maps validated lifecycle/run/progress requests into insert-shaped payloads for the draft columns. |
| Route stubs validate payloads | Pass | Action 220 route stubs return accepted/rejected/disabled responses and do not persist. |
| Client buttons remain test-only | Pass | Action 221 Settings buttons POST to stubs and display responses only. |
| No persistence enabled | Pass | Routes are not wired to writer mappings or Supabase writes. |
| Server-side persistence flag model exists | Pass | Action 225B defaults off and requires a second explicit production flag. |
| Supabase writer implementation draft exists | Pass with caveat | Action 227 uses dependency injection and fake-client tests only. It is not route-wired by default. |
| Rollback SQL exists | Pass | `docs/execution-audit-migration-apply-plan.md` includes reverse dependency drop statements. |
| Verification SQL exists | Pass | Apply plan includes table, column, index, RLS, and row-count checks. |
| RLS/user_id acceptable for local/staging | Pass with caveat | `user_id` is nullable and RLS is intentionally not enabled. This is acceptable only for local/staging readiness. |
| RLS/user_id acceptable for production | Pending | Production needs a finalized ownership/RLS strategy before apply. |
| Dev/mock separation understood | Pass | Draft tables include `source_environment`, `is_mock`, and `is_dev`. |
| `broker_execution_results` excluded | Pass | Broker result persistence remains out of scope. |
| `execution_records` excluded | Pass | Normalized execution records remain out of scope. |
| `execution_intents` and `broker_handoffs` excluded | Pass | Intent/handoff evidence tables remain future work. |
| History/Statistics linkage excluded | Pass | No product reporting integration is included. |
| Target Supabase project confirmed | Pending | Must be confirmed manually before any apply command. |
| Backup/snapshot confirmed | Pending | Must be confirmed manually for the target environment. |
| Manual approval captured | Pending | Required before local/staging apply. |

## Risks Before Apply

- RLS TODOs: the migration intentionally does not enable RLS because the project ownership convention is not finalized.
- Nullable `user_id`: acceptable for local/staging table-shape validation, but not enough for production.
- Table names may become permanent once applied. Renaming later would require migration churn.
- Check constraints may be too strict if future modes/actions/brokers expand, or too loose if production policies need stronger environment/source validation.
- Future production migration may need RLS hardening, ownership constraints, and server-only write policies.
- No write route exists yet, so apply is lower-risk but also does not prove end-to-end database insertion.
- Future route writes must be guarded by `EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED` and must keep production blocked unless `EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true`.
- The injected Supabase writer can insert rows if supplied a real server DB client later, so route wiring must stay separate from migration apply and must be reviewed explicitly.
- Table bloat and retention rules are not implemented yet.
- Dev/mock rows must not be interpreted as real broker execution evidence.

## Apply Recommendation

Local/staging:

- OK to apply in local or staging only if the user explicitly approves the target environment and command, and the tooling path from `docs/supabase-migration-tooling-setup-plan.md` is configured.
- Apply local/staging before any route persistence wiring.
- Run the verification SQL from `docs/execution-audit-migration-apply-plan.md` immediately after apply.

Production:

- Not recommended yet.
- Production remains blocked until RLS, `user_id`, ownership, retention, and server-only write policies are finalized.

Route persistence:

- Do not enable route persistence in the same action as migration apply.
- Do not wire Action 223 writer mappings to Supabase until after migration verification passes.
- When route persistence is added later, use the Action 225B server-only flag model and keep it disabled by default.
- Do not route-wire the Action 227 Supabase writer until local/staging migration verification passes.

## Apply Command Placeholder

The exact command must be confirmed against the project's Supabase workflow and target environment.

Potential local command shape:

```bash
supabase db reset
```

Potential linked project command shape:

```bash
supabase db push
```

Do not run either command until the user confirms:

- target environment
- backup/snapshot status
- expected Supabase project
- whether local/staging test data may be inserted

## Post-Apply Verification Checklist

After local/staging apply:

- Verify all three tables exist.
- Verify expected columns exist.
- Verify expected indexes exist.
- Verify RLS state is intentionally disabled or otherwise matches the reviewed decision.
- Verify all three tables have zero rows immediately after apply.
- Verify Action 220 audit route stubs still return the same accepted/rejected/disabled responses.
- Verify Settings audit stub buttons still behave the same.
- Verify no app write path is active.
- Verify no local execution records, broker results, History records, Statistics records, or trade mutations are created.
- Run normal checks:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

## Go/No-Go

Go:

- Local/staging apply after explicit user approval.
- Target environment is confirmed.
- Backup/snapshot is confirmed.
- Apply and rollback SQL have both been reviewed.
- No route persistence is enabled.

No-go:

- Production apply.
- Unknown target Supabase project.
- Missing backup/snapshot confirmation.
- Unresolved production RLS/`user_id` ownership strategy.
- Any accidental API route persistence wiring.
- Any expectation that this creates broker results, execution records, History/Statistics updates, or trade mutations.

## Recommended Action 225

Preferred:

- Action 231A - Configure Local Supabase Tooling

Alternative:

- Action 231B - Configure Staging Supabase Link

Then retry:

- Action 229 retry - Apply Audit Migration Locally/Staging and Verify

All paths require explicit user approval before any Supabase command is run.

Next after successful local/staging apply:

- Action 226 - Audit Route Persistence Behind Server Flag

Route persistence should be server-gated, disabled by default, and added only after migration verification passes.

## Action 229 Attempt Result

Date: 2026-06-10

Target requested: staging/dev Supabase.

Result: blocked before apply.

The readiness review remains accurate for local/staging, but the workspace could not execute the migration because it has no Supabase CLI, no `psql`, no linked Supabase project config, and no admin SQL credential. `.env.local` only contains public/anon Supabase credentials.

No migration was applied, no verification SQL was run, no rows were inserted, and no route persistence flags were enabled.

Next retry needs a confirmed staging/dev SQL execution path. Production remains not recommended.

## Action 230 Tooling Plan

Date: 2026-06-10

Action 230 added `docs/supabase-migration-tooling-setup-plan.md` to define the missing setup required before retrying Action 229.

The plan covers:

- local Supabase setup for lowest-risk SQL validation
- staging/dev Supabase setup for remote non-production verification
- credential handling rules
- Supabase CLI, `psql`, and dashboard SQL editor tradeoffs
- preflight checklist before retrying Action 229
- placeholder commands that must not be run until a target is confirmed

No Supabase CLI or `psql` installation was performed. No migration was applied. No database state changed.
