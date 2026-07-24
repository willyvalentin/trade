# Post-Trade Supabase Migration Draft Static Coverage Review

## Summary

Purpose: review the structural coverage of the automated static tests that protect the post-trade Supabase migration draft.

Scope: review/checkpoint only. The reviewed migration is `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql`, and the primary test artifact is `tests/e2e/post-trade-supabase-migration-draft-static.spec.ts`.

This review does not apply the migration, connect to a database, run SQL against Supabase, perform Supabase writes, activate API routes, open runtime gates, import Trade UI runtime, start browser automation, log in to Avanza, fetch a real settlement note, handle credentials/cookies/sessions/BankID, submit orders, click final BUY/SELL, mutate live trades, mutate live positions, or claim production readiness.

Review decision: `post_trade_supabase_migration_draft_static_coverage_review_complete_with_warnings`.

Warnings are expected because the migration remains draft-only, unapplied, unvalidated against Supabase, and intentionally lacks final app-auth/server-write RLS policies.

## Artifact Inventory

| Artifact | Exists? | Decision/result | Purpose | Coverage contribution | Warnings | Blockers |
| --- | --- | --- | --- | --- | --- | --- |
| `tests/e2e/post-trade-supabase-migration-draft-static.spec.ts` | Yes | 8 static tests | No-apply text-only test coverage for migration draft | Verifies table order, no executable writes, never-store exclusions, RLS enablement, constraints, indexes, artifact metadata-only shape, and source isolation | Static parsing only; no DB validation | None |
| `docs/post-trade-supabase-migration-draft-static-tests-checkpoint.md` | Yes | `post_trade_supabase_migration_draft_static_tests_complete_with_warnings` | Checkpoint for Task 389 static tests | Records scope, coverage, safety guarantees, search classification, and validation | Draft-only; no apply | None |
| `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql` | Yes | Draft/no-apply SQL artifact | Migration draft under review | Supplies the schema text covered by static tests | Not applied; no DB syntax validation; no final policies | None for static review |
| `docs/post-trade-supabase-migration-file-draft-review-checkpoint.md` | Yes | `post_trade_supabase_migration_file_draft_review_complete_with_warnings` | No-apply migration draft review | Confirms table order, no writes, never-store absence, RLS enablement, constraints/indexes, metadata-only artifact handling | No apply; no DB validation; no final RLS policies | None |
| `docs/post-trade-supabase-migration-file-draft-checkpoint.md` | Yes | `post_trade_supabase_migration_file_draft_complete_with_warnings` | Checkpoint for draft file creation | Records initial draft inventory, RLS approach, constraints, indexes, rollback notes, static-search classification | Draft-only | None |
| `docs/post-trade-supabase-pre-migration-approval-checklist-no-migration-file.md` | Yes | Approval checklist complete with warnings | Pre-file checklist | Confirms no-apply/no-write approval posture before draft creation | Checklist only | None |
| `docs/post-trade-supabase-migration-draft-plan-review-checkpoint.md` | Yes | Plan review complete with warnings | Plan review before migration file | Establishes intended table order, constraints, RLS posture, rollback and validation expectations | Plan-only | None |
| `tests/e2e/post-trade-schema-allowlist-alignment.spec.ts` | Yes | 11 tests | Schema allowlist alignment coverage | Covers safe schema fixtures, blocked fields, RLS/gate metadata, artifact metadata-only fixture shape, and source isolation | Fixture-level, not migration-SQL parser | None |
| `tests/e2e/post-trade-persistence-payload-allowlist.spec.ts` | Yes | 10 tests | Payload allowlist coverage | Blocks sensitive/raw/authority/runtime fields and keeps post-trade persistence payloads safe | Fixture-level, not migration-SQL parser | None |

## Static Test Coverage Review

| Coverage area | Status | Notes | Gaps | Blocker before future apply-readiness? |
| --- | --- | --- | --- | --- |
| Migration file read as text only | covered | Uses `readFileSync` on the local migration file | Does not prove SQL can run | No |
| Table existence | covered | All six expected `public.execution_*` tables are required | Does not inspect DB catalog | No |
| Table creation order | covered | Positions of `create table if not exists` statements are compared in dependency order | Static order only | No |
| No-write operation detection | covered_with_warning | Strips SQL comments and strings before statement-level blocking for write/policy/grant/function/trigger patterns | Regex-based; future SQL forms may require expansion | No, but expand before apply-readiness if new SQL shape appears |
| Never-store term detection | covered | Blocks never-store terms from executable schema/data after comments/strings are stripped | Does not inspect comment prose as blocker | No |
| RLS enablement | covered | Requires `alter table public.<table> enable row level security` for every table | Does not test policy behavior | No |
| Permissive policy blocking | covered | Blocks `create policy`, `grant`, `using (true)`, and `with check (true)` executable patterns | No real policy behavior exists to test | No |
| Constraint presence | covered_with_warning | Verifies core checks for side, quantity, non-negative amounts, redaction, manual review, sensitive false, raw artifact false, and learning gates | Does not validate SQL semantics or all possible future status fields | No, but add hardening before apply-readiness if statuses expand |
| Index presence | covered_with_warning | Verifies core lookup indexes across table, trade, plan, contract, ticker, side, status, deviation, settlement, learning, and created-at fields | Does not validate index performance or DB planner behavior | No |
| Optional artifact table metadata-only checks | covered | Verifies safe metadata/reference fields, no raw artifact columns, `sensitive_data_present = false`, `raw_artifact_stored = false` | Artifact storage strategy remains future work | No |
| Source isolation | covered | Static spec imports only Playwright, `node:fs`, and `node:path`, and blocks runtime API fragments | Does not inspect transitive packages because none are imported beyond allowed basics | No |

## No-Apply / No-DB Coverage Review

- The static tests do not run SQL.
- The static tests do not connect to Supabase.
- The static tests do not run Supabase CLI apply/push/reset commands.
- The static tests read the migration file as plain text.
- The static tests have no DB side effects because they use local file reads and assertions only.
- The coverage review itself does not run migration apply commands or connect to a database.

Status: covered for no-apply/no-DB boundaries.

## No-Write Coverage Review

| Write/action pattern | Covered? | Comment-only handling | Warning | Blocker? |
| --- | --- | --- | --- | --- |
| `insert into` | Yes | Comments stripped before check | Regex-based | No |
| `upsert` | Yes | Comments stripped before check | Regex-based | No |
| `update ... set` | Yes | Comments stripped before check | Pattern uses bounded wildcard for statement text | No |
| `delete from` | Yes | Comments stripped before check | Regex-based | No |
| Seed data patterns | Yes | Comments stripped before check | Blocks `seed` as executable statement text, not docs prose | No |
| `copy` | Yes | Comments stripped before check | Regex-based | No |
| Runtime write functions | Yes | Blocks `create function` / `create or replace function` | Future procedure syntax would need expansion if introduced | No |
| Triggers | Yes | Blocks `create trigger` | Future trigger variants should be covered before apply-readiness | No |
| Result/statistics/learning auto-update triggers | Covered by absence of triggers/functions and learning constraints | Comments/strings are ignored for executable blocker checks | Does not prove future trigger behavior because none exists | No |

Status: covered with regex-hardening warnings.

## Never-Store Coverage Review

The static spec blocks these never-store terms from executable schema/data:

| Term/category | Covered? |
| --- | --- |
| credentials | Yes |
| password | Yes |
| BankID | Yes |
| MFA | Yes |
| cookie | Yes |
| session | Yes |
| raw browser storage | Yes |
| network dumps | Yes |
| Supabase service keys | Yes |
| service role keys | Yes |
| API tokens | Yes |
| personal identity data | Yes |
| personnummer | Yes |
| Avanza customer ids | Yes |
| customer ids | Yes |
| account numbers | Yes |
| account balances | Yes |
| unrelated holdings | Yes |
| raw PDF | Yes |
| raw screenshot | Yes |
| raw HTML | Yes |
| raw broker page | Yes |
| unredacted settlement note | Yes |
| unredacted broker confirmation | Yes |

Status: covered for executable schema/data. Comment-only warnings remain acceptable because comments document blockers and safety constraints.

## RLS / Static Security Coverage Review

| RLS/static security item | Status | Notes |
| --- | --- | --- |
| Every table must have RLS enabled | covered | Required for all six tables |
| No `using (true)` | covered | Blocked in executable statement text |
| No `with check (true)` | covered | Blocked in executable statement text |
| No broad public/anon policies | covered_with_warning | No policies exist; policy design remains future work |
| No broad client writes | covered_with_warning | No grants or write policies exist; runtime write path remains absent |
| No grants exposing write access | covered | Executable `grant` statements are blocked |
| Lack of final policies documented | covered_with_warning | SQL comments and docs state app-auth/server-write policies require separate review before apply |

Status: restrictive static posture covered. Final policy behavior is not covered because policies do not exist yet.

## Constraint / Index Coverage Review

Statically verified constraints:

- side must be `BUY` or `SELL`
- quantity must be positive
- planned price, execution price, gross amount, settlement amount, and commission must be non-negative where present
- FX rate must be positive or null where present
- redaction status is required and constrained
- manual review status is constrained where present
- deviation classification is constrained where present
- learning candidate status is constrained
- `sensitive_data_present = false`
- `raw_artifact_stored = false`
- `learning_auto_update_allowed = false`
- `requires_separate_learning_gate = true`
- `outcome_eligible = false`

Statically verified indexes:

- `internal_trade_id`
- `plan_id`
- `contract_id`
- `ticker`
- `side`
- `created_at`
- `manual_review_status`
- `deviation_classification`
- `settlement_review_id`
- `learning_candidate_status`

Not verified:

- DB execution of constraints.
- Numeric precision and scale.
- Query planner effectiveness.
- Foreign key behavior under real DB operations.
- Partial-fill and duplicate-confirmation enum checks, because those fields remain text placeholders in the current draft.

Missing checks are not blockers for the current no-apply coverage review, but partial-fill/duplicate status constraints, numeric precision, and DB-level validation should be reviewed before future apply-readiness.

## Artifact Table Coverage Review

For `execution_redacted_artifacts`:

| Coverage item | Status | Notes |
| --- | --- | --- |
| Metadata/reference-only shape | covered | Requires safe reference/status/version/timestamp fields |
| No raw artifact columns | covered | Blocks raw PDF, screenshot, HTML, broker page, and unredacted content columns |
| `sensitive_data_present = false` | covered | Constraint is statically required |
| `raw_artifact_stored = false` | covered | Constraint is statically required |
| RLS enabled | covered | RLS enablement required like every other table |
| Remaining warnings | covered_with_warning | Artifact storage strategy remains separate future work; no raw storage is approved |

## Source Isolation Review

The static spec does not import:

- Supabase clients
- API routes
- Trade UI
- app runtime
- smoke scripts
- bridge/runner scripts
- browser helpers
- credential/session helpers
- env helpers
- fetch helpers
- storage APIs
- process-spawn modules

The spec imports only:

- `@playwright/test`
- `node:fs`
- `node:path`

Status: covered.

## What This Static Coverage Proves

- The migration draft has automated no-apply static regression checks.
- Dangerous write operations are blocked by tests.
- Never-store terms are blocked by tests from executable schema/data.
- RLS enablement is checked for every table.
- Permissive policy and broad grant patterns are blocked.
- Core constraints and indexes are checked.
- Optional artifact table remains metadata/reference-only.
- Source isolation is checked.
- The migration remains unapplied.

## What This Static Coverage Does Not Prove

- SQL executes successfully.
- Supabase accepts the syntax.
- RLS policies behave correctly.
- Real database schema works.
- Rollback works.
- Production security is correct.
- Runtime/write path is safe.
- Avanza/settlement ingestion works.
- Real broker confirmation capture works.
- Production readiness.

## Remaining Warnings

| Warning | Severity | Why not blocker now | Required before apply/write phase |
| --- | --- | --- | --- |
| No DB apply | High | Apply is forbidden in this task | Explicit non-production apply approval |
| No SQL syntax validation against Supabase | High | DB connection is forbidden | Non-production DB validation |
| No real RLS policy behavior | High | Final policies do not exist yet | App-auth/server-write policy design and tests |
| No rollback execution | High | No migration was applied | Non-production rollback test |
| No app-auth/server-write policy integration | High | Runtime write path is out of scope | Separate auth/RLS implementation plan |
| No write path | Medium | Writes remain intentionally locked | Separate write-gate task |
| No production sanitizer | High | Production remains blocked | Sanitizer/redaction review |
| No real artifact storage strategy | High | Artifact table is metadata-only | Separate artifact strategy |
| No broker confirmation capture | Medium | Capture remains future work | Broker confirmation capture review |
| No learning integration | Medium | Learning remains staged only | Separate learning gate |

## Next-Phase Options

| Option | Purpose | Risk | Assessment |
| --- | --- | --- | --- |
| Option A - Supabase migration apply-readiness checklist, no apply | Final readiness checklist before any non-production apply can be considered | Medium | Recommended |
| Option B - Supabase migration draft static negative-case expansion | Strengthen static tests with adversarial fixture cases | Low | Good follow-up if more static hardening is desired first |
| Option C - Ture Agent Dev Chat 3 continuation summary | Package the long phase | Low | Safe alternative |
| Option D - Return to Avanza-boundary planning, no execution | Plan broker-boundary work | Medium/high | Wait until apply-readiness checklist or continuation summary |

## Recommended Next Task

Recommended next task: Task 391 - Supabase migration apply-readiness checklist, no apply/no writes.

Alternative: Task 391 - Ture Agent Dev Chat 3 continuation summary.

## Static Search

Static search target:

```text
rg -n "insert into|upsert|update .* set|delete from|copy |trigger|create trigger|create function|grant |create policy|using \(true\)|with check \(true\)|service_role|service role|anon|public|raw_pdf|raw_screenshot|raw_html|raw_broker_page|unredacted|credentials|password|BankID|MFA|cookie|session|account_number|customer_id|personal_identity|personnummer|avanza_customer|api_token|service_key|production" supabase/migrations docs tests lib app scripts
```

Static search classification:

- migration-schema-only: table creation, comments, indexes, and RLS enablement in the migration draft
- comments-only: one migration `grant` hit is inside a table comment saying the artifact table does not grant client access
- docs-only: planning/checkpoint/warning/no-go text
- tests-only: static safety tests and boundary tests
- fixtures-only: schema/payload safety fixtures
- locked: no-write, no-apply, no-DB, no-runtime confirmations
- blocked: raw artifact/sensitive/runtime/production terms appear as explicit blockers in docs/tests
- future-gated: SQL apply, RLS policy implementation, write path, production sanitizer, rollback validation, and artifact strategy
- warning: draft-only, review-only, no-apply, no-write, no-production text
- blocker: none found for this static coverage review

Static search category counts:

```text
  15 app
 953 docs
 349 lib
   8 scripts
  13 supabase
 140 tests
```

## Safe Validations

Validation completed for this review:

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

Final decision: `post_trade_supabase_migration_draft_static_coverage_review_complete_with_warnings`.

The static coverage review is complete. The migration draft has useful no-apply static regression coverage, but it remains draft-only, unapplied, unconnected to Supabase, unwired from runtime, non-writing, and not production-ready.

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
