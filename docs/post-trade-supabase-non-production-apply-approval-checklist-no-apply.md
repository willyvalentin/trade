# Post-Trade Supabase Non-Production Apply Approval Checklist, No Apply

## Summary

Purpose: decide whether the post-trade Supabase migration package is ready for a future separate task where an isolated non-production apply may be considered.

Scope: approval-checklist/review-only. This task does not apply the migration, connect to a database, run Supabase CLI apply/push/reset commands, perform Supabase writes, activate API routes, open runtime gates, run smoke scripts, import Trade UI runtime, start browser automation, log in to Avanza, fetch a real settlement note, handle credentials/cookies/sessions/BankID, submit orders, click final BUY/SELL, mutate live trades, mutate live positions, or claim production readiness.

Approval decision: `post_trade_supabase_non_production_apply_approval_ready_with_warnings`.

This approves readiness for a future explicitly approved non-production apply task only. It does not approve apply in this task.

## Artifact Inventory

| Artifact | Exists? | Decision/result | Purpose | Approval contribution | Warnings | Blockers |
| --- | --- | --- | --- | --- | --- | --- |
| `docs/post-trade-supabase-non-production-apply-plan-no-apply.md` | Yes | `post_trade_supabase_non_production_apply_plan_complete_with_warnings` | Future non-production apply plan | Defines target, environment, backup, rollback, SQL/RLS/no-write, inspection, and stop-condition plan | Actual apply still blocked | None |
| `docs/post-trade-supabase-migration-apply-readiness-checklist-no-apply.md` | Yes | `post_trade_supabase_migration_apply_readiness_ready_with_warnings` | Apply-readiness checklist | Confirms migration package is ready for apply planning, not actual apply | DB behavior not proven | None |
| `docs/post-trade-supabase-migration-draft-static-coverage-review.md` | Yes | `post_trade_supabase_migration_draft_static_coverage_review_complete_with_warnings` | Static coverage review | Confirms no-apply static coverage for migration draft | Static-only coverage | None |
| `tests/e2e/post-trade-supabase-migration-draft-static.spec.ts` | Yes | 8 passing static tests | Text-only migration safety tests | Protects table order, no-write patterns, never-store fields, RLS enablement, constraints, indexes, artifact metadata-only shape, and source isolation | Does not prove DB syntax | None |
| `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql` | Yes | Draft/no-apply SQL artifact | Migration candidate | Supplies reviewed migration draft for future non-production apply consideration | No DB validation; no final policies | None for approval checklist |
| `docs/post-trade-supabase-migration-file-draft-review-checkpoint.md` | Yes | `post_trade_supabase_migration_file_draft_review_complete_with_warnings` | Manual migration review | Confirms table order, no writes, never-store exclusions, RLS posture, constraints/indexes, artifact metadata-only shape | No actual apply | None |
| `docs/post-trade-supabase-migration-file-draft-checkpoint.md` | Yes | `post_trade_supabase_migration_file_draft_complete_with_warnings` | Migration file draft checkpoint | Records draft creation, RLS approach, constraints, indexes, and rollback notes | Draft-only | None |
| `docs/post-trade-supabase-pre-migration-approval-checklist-no-migration-file.md` | Yes | Complete with warnings | Pre-file approval checklist | Establishes no-apply/no-write posture before SQL draft creation | Planning-only | None |

## Non-Production Apply Approval Checklist

Required before a future non-production apply task:

| Requirement | Status | Notes |
| --- | --- | --- |
| Migration draft file exists | approved_for_future_non_production_apply | Draft SQL exists |
| Migration draft reviewed | approved_for_future_non_production_apply | Manual review checkpoint exists |
| Static migration tests exist | approved_for_future_non_production_apply | Static spec exists |
| Static migration tests pass | approved_for_future_non_production_apply | Static spec passes |
| Static coverage review complete | approved_for_future_non_production_apply | Coverage review exists |
| Apply-readiness checklist complete | approved_for_future_non_production_apply | Task 391 checklist exists |
| Non-production apply plan complete | approved_for_future_non_production_apply | Task 392 plan exists |
| Non-production target requirements defined | approved_with_warning_for_future_non_production_apply | Target is not selected in this task |
| Environment policy defined | approved_with_warning_for_future_non_production_apply | Future credentials process still required |
| Backup/checkpoint plan defined | approved_with_warning_for_future_non_production_apply | Backup not executed in this task |
| Rollback test plan defined | approved_with_warning_for_future_non_production_apply | Rollback not executed in this task |
| SQL syntax validation plan defined | approved_with_warning_for_future_non_production_apply | Syntax not validated against DB |
| RLS behavior validation plan defined | approved_with_warning_for_future_non_production_apply | Behavior not validated against DB |
| No-write verification plan defined | approved_for_future_non_production_apply | Plan requires row-count/schema-only inspection |
| Post-apply inspection plan defined | approved_for_future_non_production_apply | Inspection checklist exists |
| Stop conditions defined | approved_for_future_non_production_apply | Stop conditions are explicit |
| Production blockers defined | approved_for_future_non_production_apply | Production remains blocked |
| `.env.local` unchanged | approved_for_future_non_production_apply | Diff check required and passes |
| `app/trade-app.tsx` unchanged | approved_for_future_non_production_apply | Diff check required and passes |

Overall approval: `approved_with_warning_for_future_non_production_apply`.

## Future Non-Production Apply Task Scope

Allowed only after explicit future approval:

- select isolated non-production target
- run preflight checks
- verify backup/checkpoint
- run static tests
- run migration apply against non-production only
- inspect schema
- inspect RLS status
- inspect row counts
- document result
- run rollback test only if explicitly approved in same or follow-up task

Still forbidden:

- production apply
- production DB connection
- real broker/customer/account data
- raw artifacts
- API route activation
- Trade UI execution
- runtime persistence
- write helper
- setting any feature flag true
- final BUY/SELL
- Avanza/browser automation
- credential/session/BankID handling

## Non-Production Target Approval

Future target checklist:

- target must be explicitly named in future task
- target must be non-production
- target must not contain production data
- target must not contain real broker/customer/account data
- target must not be connected to Trade UI runtime
- target must not be connected to API write path
- target must be isolated
- target must have rollback/restore strategy

Status: approved for future target selection only, not selected here.

## Environment Approval

Checklist:

- `.env.local` must remain unchanged unless separately approved
- no env values printed
- no service role key exposed
- no production credentials
- future task must use safe non-production credential handling process
- service role exposure is blocker
- unclear target credentials are blocker

Status: approved with warnings for future non-production credential planning only.

## Backup / Checkpoint Approval

Checklist:

- backup/restore point required before future apply
- schema baseline required before future apply
- migration baseline required before future apply
- no production data allowed
- no raw artifacts allowed
- checkpoint details documented
- rollback path verified before production consideration

Status: approved for future backup/checkpoint planning; no backup is executed here.

## SQL Syntax Validation Approval

Checklist:

- current static tests do not prove SQL syntax
- future task must validate SQL syntax safely
- validation must not use production
- validation must not introduce data writes beyond schema apply in isolated non-production
- SQL syntax failure is blocker
- migration apply failure is blocker

Status: approved for future non-production validation planning only.

## RLS Behavior Approval

Future apply task must verify:

- RLS enabled on all tables
- anonymous blocked
- public blocked
- direct client writes blocked
- no permissive policies
- no broad grants
- server-write policy remains absent or blocked until separate design
- app-auth/server-write model still pending

Status: approved for future validation checklist; behavior not validated here.

## No-Write Verification Approval

Future apply task must verify:

- no inserted rows
- no settlement rows
- no broker evidence rows
- no artifact rows
- no learning candidates
- no seed data
- schema-only changes
- no write helper/API/Trade UI path

Status: approved for future verification checklist.

## Rollback Approval

Checklist:

- rollback plan exists
- rollback command/path planned
- rollback test must be non-production only
- rollback must not expose raw artifacts
- rollback must remove tables in safe dependency order
- rollback result must be documented
- rollback failure is blocker before production consideration

Rollback dependency order:

1. `public.execution_redacted_artifacts`
2. `public.execution_learning_candidates`
3. `public.execution_deviation_reviews`
4. `public.execution_cost_breakdowns`
5. `public.execution_settlement_reviews`
6. `public.execution_confirmation_evidence`

Status: approved for future non-production rollback planning only.

## Post-Apply Inspection Approval

Future apply task must inspect:

- tables exist
- indexes exist
- constraints exist
- RLS enabled
- no broad policies
- row counts zero
- optional artifact table metadata-only
- no grants exposing writes
- no API/runtime/UI integration

Status: approved for future inspection checklist.

## Stop Conditions

Immediate stop if:

- target is production
- target contains real broker/customer/account data
- target contains raw artifacts
- env/service key uncertainty
- `.env.local` changes unexpectedly
- app runtime changes unexpectedly
- API route/write path introduced
- Trade UI path introduced
- migration contains writes/seeds
- RLS missing
- permissive policies present
- backup/checkpoint missing
- rollback unavailable
- validation fails

## Production Blocker Confirmation

- Production apply is blocked.
- Production writes are blocked.
- Production persistence is blocked.
- Production flags are blocked.
- Production target is blocked.
- Production readiness is not claimed.

## Approval Decision Logic

- `ready`: all future apply prerequisites are approved and no blockers exist.
- `ready_with_warnings`: future non-production apply task is approvable, but actual apply is not performed here and production remains blocked.
- `blocked`: any apply/write/DB/runtime/production action occurred or a required plan is missing.

Current decision: `post_trade_supabase_non_production_apply_approval_ready_with_warnings`.

## What This Approval Proves

- The project is ready for a future non-production apply task.
- Apply is still not performed.
- DB connection is still absent.
- Production remains blocked.
- Stop conditions and inspection plan exist.

## What This Approval Does Not Prove

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

| Warning | Severity | Why not blocker for this checklist | Required before apply/write phase |
| --- | --- | --- | --- |
| No DB apply | High | Apply is forbidden here | Explicit future apply approval |
| No DB connection | High | DB connection is forbidden here | Approved isolated non-production target |
| No SQL syntax validation against Supabase | High | No DB validation in this task | Syntax/apply validation in non-production |
| No real RLS behavior validation | High | Requires DB behavior test | RLS behavior inspection after non-production apply |
| No rollback execution | High | No migration applied | Non-production rollback test |
| No environment target selected | High | Selection deferred | Explicit target in future task |
| No backup/checkpoint executed | High | No DB touched | Backup/restore point before apply |
| No write path | Medium | Writes remain locked | Separate write-gate task |
| No production sanitizer | High | Production blocked | Sanitizer/redaction review |
| No real artifact strategy beyond metadata | High | Artifact table metadata-only | Separate artifact strategy |
| No broker confirmation capture | Medium | Capture future work | Broker confirmation capture review |
| No learning integration | Medium | Learning staged only | Separate learning gate |

## Next-Phase Options

| Option | Purpose | Risk | Assessment |
| --- | --- | --- | --- |
| Option A - Supabase non-production migration apply, isolated environment only | Actually apply in isolated non-production | Medium/high | Only if explicitly approved next time |
| Option B - Ture Agent Dev Chat 3 continuation summary | Package the whole long phase | Low | Recommended if context feels heavy |
| Option C - Return to Avanza-boundary planning, no execution | Resume broker-boundary planning | Medium/high | Wait until continuation summary or migration apply decision |

## Recommended Next Task

Recommended next task: Task 394 - Ture Agent Dev Chat 3 continuation summary.

Alternative if persistence work should continue immediately: Task 394 - Supabase non-production migration apply, isolated environment only.

If the next task is an apply task, it requires explicit user approval in the next message and must still be non-production, isolated, no runtime, no API, no Trade UI, and no real data.

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
- blocker: none found for this approval-checklist review-only task

Static search category counts:

```text
  15 app
 956 docs
 349 lib
   8 scripts
  13 supabase
 140 tests
```

## Safe Validations

Validation completed for this approval checklist:

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

Final decision: `post_trade_supabase_non_production_apply_approval_ready_with_warnings`.

The package is approved for a future explicitly approved isolated non-production apply task. This task does not approve or perform actual apply, DB connection, Supabase writes, runtime activation, Trade UI execution, or production persistence.

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
