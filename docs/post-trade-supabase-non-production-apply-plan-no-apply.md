# Post-Trade Supabase Non-Production Apply Plan, No Apply

## Summary

Purpose: plan how the post-trade Supabase migration draft could be applied in a future isolated non-production environment.

Scope: apply-plan/review-only. This task does not apply the migration, connect to a database, run Supabase CLI apply/push/reset commands, perform Supabase writes, activate API routes, open runtime gates, run smoke scripts, import Trade UI runtime, start browser automation, log in to Avanza, fetch a real settlement note, handle credentials/cookies/sessions/BankID, submit orders, click final BUY/SELL, mutate live trades, mutate live positions, or claim production readiness.

Plan decision: `post_trade_supabase_non_production_apply_plan_complete_with_warnings`.

This plan defines a future safe path. It does not approve actual apply.

## Artifact Inventory

| Artifact | Exists? | Decision/result | Purpose | Non-production apply planning contribution | Warnings | Blockers |
| --- | --- | --- | --- | --- | --- | --- |
| `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql` | Yes | Draft/no-apply SQL artifact | Migration draft under planning | Supplies future apply candidate and rollback order | Not syntax-validated against DB; no final policies | None for planning |
| `tests/e2e/post-trade-supabase-migration-draft-static.spec.ts` | Yes | 8 passing static tests | Migration static safety coverage | Future apply planning must run this before target selection/apply | Static only | None |
| `docs/post-trade-supabase-migration-apply-readiness-checklist-no-apply.md` | Yes | `post_trade_supabase_migration_apply_readiness_ready_with_warnings` | Apply-readiness checklist | Confirms ready for future non-production apply planning, not actual apply | Actual apply still blocked | None |
| `docs/post-trade-supabase-migration-draft-static-coverage-review.md` | Yes | `post_trade_supabase_migration_draft_static_coverage_review_complete_with_warnings` | Static coverage review | Defines coverage and gaps that future apply planning must respect | No DB behavior proof | None |
| `docs/post-trade-supabase-migration-draft-static-tests-checkpoint.md` | Yes | `post_trade_supabase_migration_draft_static_tests_complete_with_warnings` | Static tests checkpoint | Records no-apply static test outcomes and search classification | Draft-only | None |
| `docs/post-trade-supabase-migration-file-draft-review-checkpoint.md` | Yes | `post_trade_supabase_migration_file_draft_review_complete_with_warnings` | Manual migration draft review | Confirms table order, no writes, RLS posture, constraints/indexes, and artifact metadata-only shape | No final policies | None |
| `docs/post-trade-supabase-migration-file-draft-checkpoint.md` | Yes | `post_trade_supabase_migration_file_draft_complete_with_warnings` | Migration draft creation checkpoint | Records draft creation, RLS approach, constraints, indexes, rollback notes, and no-write state | Draft-only | None |

## Non-Production Target Plan

- No target is selected in this task.
- Future target must be explicitly non-production.
- Production target is forbidden.
- Target must contain no real broker, customer, account, or artifact data.
- Target must be isolated from production runtime.
- Target must not be connected to Trade UI.
- Target must not be connected to API route persistence.
- Target must be approved in a separate future task before any DB command.

Status: planned only.

## Environment Variable Policy

- `.env.local` must not be changed in this task.
- No env values may be printed.
- No service role keys may be exposed.
- Future apply task must use an explicit safe non-production credentials process.
- Service role exposure is a blocker.
- Production credentials are a blocker.
- Any uncertainty about target credentials stops the process.

Status: locked for this task.

## Backup / Checkpoint Plan

Future requirements before any non-production apply:

- create a backup/checkpoint before apply
- record migration baseline
- record schema state before apply
- ensure rollback path is available
- ensure no production data is involved
- confirm no seed data
- confirm no raw artifacts
- record expected table/index/RLS state before and after apply

Status: future-only.

## SQL Syntax Validation Plan

Future safe validation options:

- local isolated Supabase instance only after explicit approval
- SQL parser/linter if available
- non-production dry validation only after approval

Current static tests do not prove SQL syntax. Future validation must not hit production and must not perform data writes beyond schema apply in an isolated/non-production task.

No SQL syntax validation is run in this task.

## Non-Production Apply Command Plan

Future-only command placeholders may be documented here, but must not be run in this task:

```text
# FUTURE ONLY - DO NOT RUN IN THIS TASK
supabase db push --project-ref <non-production-project-ref>

# FUTURE ONLY - DO NOT RUN IN THIS TASK
supabase migration up --linked --project-ref <non-production-project-ref>
```

Requirements before any future command:

- explicit approval
- explicit non-production project reference
- no production project reference
- safe credential process
- backup/checkpoint plan
- rollback plan
- static tests passing
- no runtime/API/Trade UI activation

Forbidden in this task:

- `supabase db push`
- `supabase migration up`
- `supabase db reset`
- any DB command
- any DB connection

## Apply Execution Checklist, Future-Only

Future steps:

1. Verify branch/worktree state and scope.
2. Run static migration tests.
3. Verify `.env.local` unchanged.
4. Confirm explicit non-production target.
5. Confirm backup/checkpoint plan.
6. Confirm no production flag.
7. Confirm no write path, API route, or Trade UI activation.
8. Apply migration to isolated non-production only.
9. Inspect schema only.
10. Verify row counts are zero.
11. Verify RLS enabled.
12. Verify policies restrictive.
13. Run rollback test in a separate controlled step.
14. Document results.

No step in this checklist is executed in this task.

## No-Write Verification Plan

Future checks:

- confirm migration has no inserts/upserts/updates/deletes/seeds before apply
- after future apply, inspect row counts
- confirm only schema objects changed
- confirm no learning candidates inserted
- confirm no settlement rows inserted
- confirm no broker evidence rows inserted
- confirm no artifact rows inserted
- confirm no runtime write helper or API route was activated

## RLS Behavior Validation Plan

Future checks:

- anonymous cannot read
- anonymous cannot write
- public cannot read
- public cannot write
- direct client cannot write
- scoped read model remains unresolved until app-auth design
- insert/update/delete policies remain blocked until server-write/manual-review design
- service role is never exposed to client

No RLS behavior validation is run in this task.

## Rollback Test Plan

Future rollback plan:

- rollback in reverse dependency order
- verify dependent tables are removed safely
- verify no raw artifacts are exposed
- verify no data-loss issue because no real data should exist
- rollback test only in non-production
- production rollback test required before any production consideration

Rollback order:

1. `public.execution_redacted_artifacts`
2. `public.execution_learning_candidates`
3. `public.execution_deviation_reviews`
4. `public.execution_cost_breakdowns`
5. `public.execution_settlement_reviews`
6. `public.execution_confirmation_evidence`

## Post-Apply Inspection Plan

Future inspection should confirm:

- listed tables exist
- listed indexes exist
- RLS enabled
- no broad policies
- constraints exist
- no rows inserted
- no grants exposing write access
- optional artifact table remains metadata-only
- no runtime/API/Trade UI paths changed
- no production target or flag was used

## Stop Conditions

Immediate stop if:

- target is production
- env/service key uncertainty exists
- any real broker/customer/account data is present
- any raw artifact is present
- `.env.local` changed unexpectedly
- app runtime changed unexpectedly
- API route/write path introduced
- Trade UI path introduced
- migration contains data writes/seeds
- RLS missing
- permissive policies present
- rollback unavailable
- validation fails

## Production Blocker Confirmation

- Production apply is blocked.
- Production writes are blocked.
- Production persistence is blocked.
- Production flags are blocked.
- Production target is blocked.
- Production readiness is not claimed.

## Decision Logic

- `complete`: non-production apply plan exists and no blockers were introduced.
- `complete_with_warnings`: plan is complete, but actual apply is still blocked.
- `blocked`: any apply/write/DB/runtime/production action occurred.

Current decision: `post_trade_supabase_non_production_apply_plan_complete_with_warnings`.

## What This Proves

- Non-production apply can be planned safely.
- Target, backup, rollback, RLS, no-write inspection, and post-apply inspection are defined.
- Actual apply remains blocked.
- Production remains blocked.
- No runtime path was opened.

## What This Does Not Prove

- SQL syntax validity.
- Migration apply success.
- RLS runtime behavior.
- Rollback execution.
- Database state safety.
- Write path safety.
- Production persistence.
- Live settlement correctness.
- Avanza/browser integration.
- Production readiness.

## Remaining Warnings

| Warning | Severity | Why not blocker for this plan | Required before actual apply/write phase |
| --- | --- | --- | --- |
| No DB apply | High | Apply is forbidden | Explicit future apply approval |
| No DB connection | High | DB connection is forbidden | Approved non-production target and credential process |
| No SQL syntax validation against Supabase | High | No DB validation in this task | Isolated/non-production syntax validation |
| No real RLS behavior validation | High | Policies/DB behavior require DB | RLS behavior validation in non-production |
| No rollback execution | High | No migration was applied | Non-production rollback test |
| No environment target selected | High | This is plan-only | Explicit non-production target selection |
| No backup/checkpoint executed | High | No DB touched | Backup/restore checkpoint before apply |
| No write path | Medium | Writes intentionally locked | Separate write-gate task |
| No production sanitizer | High | Production blocked | Sanitizer/redaction review |
| No real artifact strategy beyond metadata | High | Artifact table metadata-only | Separate artifact strategy |
| No broker confirmation capture | Medium | Capture future work | Broker confirmation capture review |
| No learning integration | Medium | Learning staged only | Separate learning gate |

## Next-Phase Options

| Option | Purpose | Risk | Assessment |
| --- | --- | --- | --- |
| Option A - Supabase non-production apply approval checklist, no apply | Final approval checklist before any non-production apply command could be considered | Medium | Recommended if persistence track continues |
| Option B - Ture Agent Dev Chat 3 continuation summary | Package the whole long phase | Low | Safe alternative |
| Option C - Return to Avanza-boundary planning, no execution | Resume broker-boundary planning | Medium/high | Consider after continuation summary or non-production apply approval |

## Recommended Next Task

Recommended next task: Task 393 - Supabase non-production apply approval checklist, no apply/no writes.

Alternative: Task 393 - Ture Agent Dev Chat 3 continuation summary.

## Static Search

Static search target:

```text
rg -n "supabase db push|supabase migration up|supabase db reset|insert into|upsert|update .* set|delete from|copy |trigger|create trigger|create function|grant |create policy|using \(true\)|with check \(true\)|service_role|service role|anon|public|raw_pdf|raw_screenshot|raw_html|raw_broker_page|unredacted|credentials|password|BankID|MFA|cookie|session|account_number|customer_id|personal_identity|personnummer|avanza_customer|api_token|service_key|production" supabase/migrations docs tests lib app scripts
```

Static search classification:

- migration-schema-only: table creation, comments, indexes, and RLS enablement in migration files
- comments-only: non-executable comments and notes, including migration artifact table text that does not grant client access
- docs-only: planning/checkpoint/warning/no-go text and future-only command placeholders
- tests-only: static safety tests and boundary tests
- fixtures-only: schema/payload safety fixtures
- locked: no-write, no-apply, no-DB, no-runtime confirmations
- blocked: raw artifact/sensitive/runtime/production terms appear as explicit blockers in docs/tests
- future-gated: SQL apply, RLS policy implementation, write path, production sanitizer, rollback validation, backup planning, and artifact strategy
- warning: draft-only, review-only, no-apply, no-write, no-production text
- blocker: none found for this apply-plan review-only task

Static search category counts:

```text
  15 app
 955 docs
 349 lib
   8 scripts
  13 supabase
 140 tests
```

## Safe Validations

Validation completed for this plan:

| Check | Result |
| --- | --- |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-supabase-migration-draft-static.spec.ts --reporter=line` | Pass, 8 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-schema-allowlist-alignment.spec.ts --reporter=line` | Pass, 11 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-persistence-payload-allowlist.spec.ts --reporter=line` | Pass, 10 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-settlement-mock-fixtures.spec.ts --reporter=line` | Pass, 15 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts --reporter=line` | Pass, 5 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-mock-boundary-contract-fixtures.spec.ts --reporter=line` | Pass, 10 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line` | Pass, 27 passed |
| `./node_modules/.bin/tsc --noEmit` | Pass |
| `npm run lint` | Pass |
| `git diff --check` | Pass |
| `git diff -- .env.local --exit-code` | Pass |
| `git diff -- app/trade-app.tsx --exit-code` | Pass |
| `find docs -type f -size 0` | Pass, no empty docs found |

## Final Decision

Final decision: `post_trade_supabase_non_production_apply_plan_complete_with_warnings`.

The future non-production apply plan is complete, but actual apply, DB connection, Supabase writes, runtime activation, Trade UI execution, and production persistence remain blocked.

## Out Of Scope

- No Supabase writes.
- No migration apply.
- No DB connection.
- No API route activation.
- No Trade UI execution.
- No real settlement extraction.
- No real avräkningsnota access.
- No browser automation.
- No Avanza login.
- No Avanza order-prep.
- No BankID handling.
- No credential access.
- No cookie/session handling.
- No final KÖP/SÄLJ.
- No order submission.
- No live trade mutation.
- No live position mutation.
- No production readiness.
