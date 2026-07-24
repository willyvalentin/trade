# Post-Trade Supabase Non-Production Apply Dry-Run Command Plan, No Apply

## Summary

Purpose: document the dry-run command plan for a future Supabase non-production migration apply.

Scope: command-plan-only, no-apply, no database connection, no Supabase write. This task does not apply the migration, connect to any database, run Supabase apply/push/reset commands, write Supabase data, activate API routes, open runtime gates, run Trade UI execution, start browser automation, log in to Avanza, handle credentials/cookies/sessions/BankID, submit orders, click final KOP/SALJ, mutate live trades, mutate live positions, or claim production readiness.

Decision: `post_trade_supabase_non_production_apply_dry_run_command_plan_ready`.

This plan is a future-only command sequence. It is not approval to run the commands in this task.

## Current Inputs

| Input | Status | Notes |
| --- | --- | --- |
| Action 395 decision | Ready | `post_trade_supabase_non_production_apply_preflight_ready` |
| Migration draft | Present | `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql` |
| Non-production apply plan | Present | `docs/post-trade-supabase-non-production-apply-plan-no-apply.md` |
| Non-production approval checklist | Present | `docs/post-trade-supabase-non-production-apply-approval-checklist-no-apply.md` |
| Gate preflight checkpoint | Present | `docs/post-trade-supabase-non-production-apply-gate-preflight-no-apply.md` |
| Production apply | Blocked | No production target is approved |
| Non-production apply | Blocked | Requires explicit future approval |

## Current Gate State

- Non-production apply remains blocked until explicit user approval in a separate future task.
- Production apply remains blocked.
- No target is selected in this task.
- No database connection is allowed in this task.
- No Supabase write is allowed in this task.
- No API route, runtime write path, or Trade UI execution path is activated.
- No real data write path is introduced.

## Currently Allowed Validation Commands

These commands are allowed in this task because they are static/model validation only:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-supabase-migration-draft-static.spec.ts --reporter=line
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-schema-allowlist-alignment.spec.ts --reporter=line
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-persistence-payload-allowlist.spec.ts --reporter=line
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-settlement-mock-fixtures.spec.ts --reporter=line
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts --reporter=line
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-mock-boundary-contract-fixtures.spec.ts --reporter=line
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
git diff -- .env.local --exit-code
git diff -- app/trade-app.tsx --exit-code
find docs -type f -size 0
```

They do not connect to Supabase, apply migrations, write rows, activate runtime code, automate Avanza, or perform any order behavior.

## Future-Only Approved Apply Commands

The future command sequence below may be considered only after explicit user approval in a separate task, with an isolated non-production target already named and verified.

```bash
# FUTURE ONLY - DO NOT RUN IN THIS TASK
git status --short

# FUTURE ONLY - DO NOT RUN IN THIS TASK
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-supabase-migration-draft-static.spec.ts --reporter=line

# FUTURE ONLY - DO NOT RUN IN THIS TASK
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-schema-allowlist-alignment.spec.ts --reporter=line

# FUTURE ONLY - DO NOT RUN IN THIS TASK
PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-persistence-payload-allowlist.spec.ts --reporter=line

# FUTURE ONLY - DO NOT RUN IN THIS TASK
supabase db push --project-ref <non-production-project-ref>
```

Alternate future apply path if the project standardizes on migration-up semantics:

```bash
# FUTURE ONLY - DO NOT RUN IN THIS TASK
supabase migration up --linked --project-ref <non-production-project-ref>
```

The future task must choose one apply path, not both, and must record why that path is selected.

## Future-Only Pre-Command Safety Checks

Before any future apply command, the operator must confirm:

- target is explicitly named
- target is non-production
- production is not selected
- project reference is not production
- target contains no production data
- target contains no real broker/customer/account data
- target contains no raw artifacts
- backup/checkpoint is available
- rollback/restore path is available
- `.env.local` is not changed unexpectedly
- no service role key is printed
- no credentials are logged
- no runtime/API/UI write path is activated
- no Trade UI execution path is enabled
- no real data write path is introduced
- no Avanza/browser automation is started
- final KOP/SALJ remains human-only

Any uncertainty stops the future apply.

## Future-Only Rollback / Cleanup Expectations

If a future non-production apply fails, the future task must:

- stop immediately
- capture the error summary without secrets
- avoid retries until the cause is understood
- confirm no production target was touched
- confirm no runtime/API/UI gate was opened
- confirm no real data was written
- restore from backup/checkpoint if necessary
- document whether partial schema objects exist
- document cleanup commands before running any cleanup
- require explicit approval before destructive cleanup

Expected rollback order for the drafted post-trade tables:

1. `public.execution_redacted_artifacts`
2. `public.execution_learning_candidates`
3. `public.execution_deviation_reviews`
4. `public.execution_cost_breakdowns`
5. `public.execution_settlement_reviews`
6. `public.execution_confirmation_evidence`

Rollback and cleanup remain future-only.

## Future-Only Post-Apply Verification Expectations

After a separately approved non-production apply, verification should confirm:

- expected tables exist
- expected indexes exist
- expected constraints exist
- RLS is enabled on every post-trade table
- no permissive public policies exist
- no broad grants exist
- row counts are zero
- no seed data exists
- optional artifact table is metadata-only
- no raw artifact columns exist
- no API route write path is activated
- no Trade UI execution path is activated
- no runtime persistence gate is opened
- production readiness remains blocked

These checks are future-only and are not executed in this task.

## Forbidden Commands And Actions

Forbidden in this task:

```bash
supabase db push
supabase migration up
supabase db reset
```

Also forbidden:

- any DB connection
- any Supabase write
- any API route activation
- any Trade UI execution
- any browser automation
- any Avanza login
- any credential/cookie/session/BankID handling
- any order action
- any final KOP/SALJ by the agent
- any live trade mutation
- any live position mutation
- any production apply
- any production readiness claim

## Pass / Fail Decision Language

Pass:

`post_trade_supabase_non_production_apply_dry_run_command_plan_ready`

Use this only if the command plan is documented, safe validations pass, `.env.local` and `app/trade-app.tsx` remain unchanged, and no forbidden command/action occurs.

Pass with warnings:

`post_trade_supabase_non_production_apply_dry_run_command_plan_ready_with_warnings`

Use this if the plan is complete and validations pass, but warnings remain around future target selection, backup execution, SQL syntax validation, RLS runtime behavior, rollback execution, or post-apply inspection.

Fail:

`post_trade_supabase_non_production_apply_dry_run_command_plan_blocked`

Use this if any forbidden command/action occurs, any safe validation fails, production is selected, target isolation is unclear, credentials are exposed, or runtime/write/execution gates open.

## Final Decision

`post_trade_supabase_non_production_apply_dry_run_command_plan_ready`
