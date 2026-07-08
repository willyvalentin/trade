# Post-Trade Supabase Migration Apply-Readiness Checklist, No Apply

## Summary

Purpose: decide whether the post-trade Supabase migration draft is ready for a future separate non-production apply-planning task.

Scope: apply-readiness/review-only. The migration draft is reviewed as a local artifact only. This task does not apply the migration, connect to a database, run Supabase CLI apply/push/reset commands, perform Supabase writes, activate API routes, open runtime gates, run smoke scripts, import Trade UI runtime, start browser automation, log in to Avanza, fetch a real settlement note, handle credentials/cookies/sessions/BankID, submit orders, click final BUY/SELL, mutate live trades, mutate live positions, or claim production readiness.

Readiness decision: `post_trade_supabase_migration_apply_readiness_ready_with_warnings`.

This means the draft/static-coverage package is ready for a future no-apply non-production apply-planning task. It is not ready for actual apply.

## Artifact Inventory

| Artifact | Exists? | Decision/result | Purpose | Apply-readiness contribution | Warnings | Blockers |
| --- | --- | --- | --- | --- | --- | --- |
| `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql` | Yes | Draft/no-apply SQL artifact | Post-trade persistence schema draft | Primary migration artifact exists with table order, constraints, indexes, RLS enablement, and no executable writes | Not applied; no DB syntax validation; no final policies | None for apply-planning |
| `tests/e2e/post-trade-supabase-migration-draft-static.spec.ts` | Yes | 8 passing static tests | Text-only migration safety tests | Verifies table order, no writes, never-store exclusions, RLS enablement, policy/grant blockers, constraints/indexes, artifact metadata-only shape, and source isolation | Static parsing only | None |
| `docs/post-trade-supabase-migration-draft-static-tests-checkpoint.md` | Yes | `post_trade_supabase_migration_draft_static_tests_complete_with_warnings` | Static test checkpoint | Confirms no-apply static tests and validation | Draft-only | None |
| `docs/post-trade-supabase-migration-draft-static-coverage-review.md` | Yes | `post_trade_supabase_migration_draft_static_coverage_review_complete_with_warnings` | Static coverage review | Confirms static coverage is sufficient for apply-planning readiness | Does not prove DB behavior | None |
| `docs/post-trade-supabase-migration-file-draft-review-checkpoint.md` | Yes | `post_trade_supabase_migration_file_draft_review_complete_with_warnings` | Manual no-apply migration review | Confirms table order, no writes, never-store exclusions, RLS posture, constraints/indexes, and artifact metadata-only shape | No apply; no final policies | None |
| `docs/post-trade-supabase-migration-file-draft-checkpoint.md` | Yes | `post_trade_supabase_migration_file_draft_complete_with_warnings` | Migration draft creation checkpoint | Records draft inventory, RLS approach, constraints, indexes, rollback notes, and no-write state | Draft-only | None |
| `docs/post-trade-supabase-pre-migration-approval-checklist-no-migration-file.md` | Yes | Complete with warnings | Pre-file approval checklist | Establishes no-apply/no-write posture before migration file creation | Checklist-only | None |
| `docs/post-trade-supabase-migration-draft-plan-review-checkpoint.md` | Yes | Complete with warnings | Draft plan review | Confirms planned table order, constraints, RLS approach, rollback direction, and validation requirements | Plan-only | None |
| `docs/post-trade-supabase-migration-draft-plan-no-migration-file.md` | Yes | Complete with warnings | Draft plan before SQL file | Provides planning basis for schema/RLS/rollback/test expectations | Plan-only | None |

## Apply-Readiness Checklist

Required before a future non-production apply-planning task:

| Requirement | Status | Notes |
| --- | --- | --- |
| Migration draft file exists | ready | Draft SQL file exists |
| Migration draft manual review complete | ready | File draft review checkpoint exists |
| Static tests exist | ready | Static migration spec exists |
| Static tests pass | ready | Static migration spec passes |
| Static coverage review complete | ready | Task 390 coverage review exists |
| No-write/no-seed checks pass | ready | Executable writes/seeds/functions/triggers/grants/policies are blocked by static tests |
| Never-store checks pass | ready | Never-store terms are blocked from executable schema/data |
| RLS enablement checks pass | ready | All six tables require RLS enablement |
| Permissive policy blocking checks pass | ready | Broad `using (true)`, `with check (true)`, policies, and grants are blocked |
| Constraints/indexes checks pass | ready_with_warning | Core constraints and indexes are checked; DB semantics are not validated |
| Artifact table metadata-only checks pass | ready_with_warning | Metadata-only shape is checked; artifact strategy remains future work |
| Source isolation checks pass | ready | Static spec imports only Playwright, `node:fs`, and `node:path` |
| `.env.local` unchanged | ready | Diff check passes |
| `app/trade-app.tsx` unchanged | ready | Diff check passes |
| Production readiness blocked | ready | No production readiness claim |
| Production apply blocked | ready | No production target selected or approved |

Overall readiness: `ready_with_warning`.

## Apply Scope Approval

Allowed in a future apply-planning task only after explicit approval:

- plan a non-production apply
- define the exact Supabase project/environment target
- define backup/checkpoint plan
- define rollback test plan
- define SQL syntax validation approach
- define RLS behavior validation approach
- define no-write verification
- define post-apply inspection checklist

Still forbidden until a separate explicit apply task:

- actual migration apply
- production apply
- DB writes
- API route activation
- Trade UI execution
- runtime persistence
- write helper
- setting any feature flag true
- real broker data
- raw artifacts

## Apply Blockers

The following are blockers for any future apply or apply-planning advancement:

- migration file missing
- static tests failing
- static coverage incomplete
- never-store terms present in executable schema/data
- executable writes/seeds present
- permissive policies present
- RLS missing
- rollback plan missing
- DB target unspecified for an actual apply task
- backup/checkpoint plan missing for an actual apply task
- production target selected
- `.env.local` changed unexpectedly
- app runtime changed unexpectedly
- API route/write path introduced
- Trade UI path introduced
- feature flag true
- raw artifact storage enabled
- service key exposure
- credential/session/BankID handling

No blocker is present for a future no-apply non-production apply-planning task.

## Environment Readiness

- No environment target is selected in this task.
- No DB connection is made.
- A future non-production target must be explicit.
- Production target is blocked.
- `.env.local` must not be printed or changed.
- Any service key exposure is a blocker.
- No real broker/customer data may be used for planning validation.

Status: ready for future environment planning, not ready for actual apply.

## Backup / Checkpoint Planning

Future requirements before any non-production apply:

- define a non-production backup or restore point before apply
- review rollback path before apply
- apply only to an isolated/non-production database first
- ensure no real broker/customer data in the test environment
- ensure no raw artifacts in the test environment
- record before/after schema inspection steps

Status: not executed in this task; required before actual apply.

## Rollback Test Readiness

Checklist:

- rollback order documented
- dependent tables drop order known
- artifact metadata cleanup known
- learning candidate cleanup known
- RLS/policy cleanup known
- rollback must be tested in non-production before any production consideration

Known rollback order:

1. `public.execution_redacted_artifacts`
2. `public.execution_learning_candidates`
3. `public.execution_deviation_reviews`
4. `public.execution_cost_breakdowns`
5. `public.execution_settlement_reviews`
6. `public.execution_confirmation_evidence`

Status: ready for rollback planning, not ready for rollback execution.

## SQL Syntax Validation Readiness

- Current static tests do not prove SQL syntax validity in Supabase.
- A future task should validate SQL syntax without production apply.
- Acceptable future approaches after explicit approval:
  - local isolated Supabase instance
  - SQL parser/linter if available
  - non-production dry run only after approval
- No SQL syntax validation is run in this task.

Status: warning; required before actual apply.

## RLS Behavior Validation Readiness

- Current static tests only check RLS presence and blocked pattern classes.
- Future RLS behavior validation requires a non-production DB.
- Expected future checks:
  - anonymous access blocked
  - public access blocked
  - direct client writes blocked
  - scoped reads only
  - gated server context required for inserts
  - manual review/admin context required for updates/deletes
- No RLS behavior validation is run in this task.

Status: warning; required before actual apply.

## No-Write Verification Readiness

- Migration contains no inserts, upserts, updates, deletes, or seeds.
- Future apply should still verify no data rows were inserted.
- Future apply should inspect row counts.
- Future apply should confirm only schema changes occurred.

Status: ready for future no-write verification planning, not actual verification.

## Production Blocker Confirmation

- Production apply remains blocked.
- Production writes remain blocked.
- Production persistence remains blocked.
- No production environment is selected.
- No production flag is true.
- Production readiness is not claimed.

Status: blocked for production by design.

## Decision Logic

- `ready`: only if draft/static coverage is clean and no blockers exist, and readiness is only for a future planning task.
- `ready_with_warnings`: ready for future apply-planning but not actual apply because DB syntax, RLS behavior, rollback, backup, and target validation are not executed.
- `blocked`: any write/apply/DB/runtime/production issue exists.

Current decision: `post_trade_supabase_migration_apply_readiness_ready_with_warnings`.

## What This Proves

- Migration draft is ready for a future non-production apply-planning task.
- Migration draft is not ready for actual apply.
- Static guards exist and pass.
- Apply blockers are known.
- Production remains blocked.
- Runtime/write paths remain absent.

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

| Warning | Severity | Why not blocker for this task | Required before apply/write phase |
| --- | --- | --- | --- |
| No DB apply | High | Apply is forbidden | Explicit non-production apply task approval |
| No SQL syntax validation against Supabase | High | DB connection is forbidden | Syntax validation in isolated/non-production path |
| No real RLS behavior validation | High | Policies/DB behavior are future work | RLS behavior test plan and validation |
| No rollback execution | High | No migration was applied | Non-production rollback test |
| No environment target | High | This is no-apply planning readiness only | Explicit target selection in future planning |
| No backup/checkpoint plan executed | High | No DB touched | Backup/restore checkpoint before apply |
| No write path | Medium | Writes remain intentionally locked | Separate write-gate task |
| No production sanitizer | High | Production remains blocked | Sanitizer/redaction review |
| No real artifact strategy beyond metadata | High | Artifact table stores metadata only | Separate artifact strategy |
| No broker confirmation capture | Medium | Capture remains future work | Broker confirmation capture review |
| No learning integration | Medium | Learning remains staged only | Separate learning gate |

## Next-Phase Options

| Option | Purpose | Risk | Assessment |
| --- | --- | --- | --- |
| Option A - Supabase non-production apply plan, no apply | Plan exactly how a future non-production apply would be performed without doing it | Medium | Recommended if the persistence track continues |
| Option B - Supabase migration draft static negative-case expansion | Add more adversarial static test cases without apply | Low | Safe hardening alternative |
| Option C - Ture Agent Dev Chat 3 continuation summary | Package the long phase | Low | Safe alternative |
| Option D - Return to Avanza-boundary planning, no execution | Resume broker-boundary planning | Medium/high | Keep behind no-execution constraints |

## Recommended Next Task

Recommended next task: Task 392 - Supabase non-production apply plan, no apply/no writes.

Alternative: Task 392 - Ture Agent Dev Chat 3 continuation summary.

## Static Search

Static search target:

```text
rg -n "supabase db push|supabase migration up|supabase db reset|insert into|upsert|update .* set|delete from|copy |trigger|create trigger|create function|grant |create policy|using \(true\)|with check \(true\)|service_role|service role|anon|public|raw_pdf|raw_screenshot|raw_html|raw_broker_page|unredacted|credentials|password|BankID|MFA|cookie|session|account_number|customer_id|personal_identity|personnummer|avanza_customer|api_token|service_key|production" supabase/migrations docs tests lib app scripts
```

Static search classification:

- migration-schema-only: table creation, comments, indexes, and RLS enablement in migration files
- comments-only: non-executable comments and notes, including the migration artifact table comment that does not grant client access
- docs-only: planning/checkpoint/warning/no-go text
- tests-only: static safety tests and boundary tests
- fixtures-only: schema/payload safety fixtures
- locked: no-write, no-apply, no-DB, no-runtime confirmations
- blocked: raw artifact/sensitive/runtime/production terms appear as explicit blockers in docs/tests
- future-gated: SQL apply, RLS policy implementation, write path, production sanitizer, rollback validation, backup planning, and artifact strategy
- warning: draft-only, review-only, no-apply, no-write, no-production text
- blocker: none found for this apply-readiness review-only task

Static search category counts:

```text
  15 app
 954 docs
 349 lib
   8 scripts
  13 supabase
 140 tests
```

## Safe Validations

Validation completed for this checklist:

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

Final decision: `post_trade_supabase_migration_apply_readiness_ready_with_warnings`.

The migration draft is ready for a future non-production apply-planning task, but it is not approved for actual apply, DB connection, Supabase writes, runtime activation, Trade UI execution, or production persistence.

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
