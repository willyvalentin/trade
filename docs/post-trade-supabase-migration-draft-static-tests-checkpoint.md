# Post-Trade Supabase Migration Draft Static Tests Checkpoint

## Summary

Purpose: add automated static test coverage for the post-trade Supabase migration draft without applying the migration, connecting to Supabase, activating runtime code, or writing any data.

Scope: no-apply static tests only. The migration file is read as local text by Playwright. This task does not run `supabase db push`, `supabase migration up`, `supabase db reset`, or any other database/apply command. It performs no Supabase writes, starts no API route, imports no Trade UI runtime, opens no browser automation, performs no Avanza integration, reads no real settlement note, handles no credentials/cookies/sessions/BankID, submits no order, clicks no final BUY/SELL, and makes no production-readiness claim.

Decision: `post_trade_supabase_migration_draft_static_tests_complete_with_warnings`.

## Artifacts

| Artifact | Status | Purpose |
| --- | --- | --- |
| `tests/e2e/post-trade-supabase-migration-draft-static.spec.ts` | Added | Static text-only tests for the migration draft |
| `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql` | Read only | Test target; not applied |
| `docs/post-trade-supabase-migration-file-draft-review-checkpoint.md` | Updated | Records Task 389 static-test follow-up |
| `docs/post-trade-supabase-migration-file-draft-checkpoint.md` | Updated | Records Task 389 static-test follow-up |

## What The Static Tests Cover

- The migration file is read as text only.
- The static spec imports only Playwright, `node:fs`, and `node:path`.
- The test source avoids Supabase clients, app runtime imports, Trade UI imports, API route imports, smoke scripts, bridge/runner scripts, browser helpers, credential/session helpers, env reads, fetch, storage APIs, and process-spawn modules.
- The expected table order is enforced:
  1. `execution_confirmation_evidence`
  2. `execution_settlement_reviews`
  3. `execution_cost_breakdowns`
  4. `execution_deviation_reviews`
  5. `execution_learning_candidates`
  6. `execution_redacted_artifacts`
- Executable SQL is checked after stripping comments.
- Inserts, upserts, updates, deletes, copy commands, seed markers, runtime write functions, triggers, grants, policies, and permissive `using (true)` / `with check (true)` patterns are blocked.
- Never-store terms are blocked from executable schema/data fields.
- RLS enablement is required for every table.
- Policy implementation remains future-gated and no broad public/anonymous/client write policies are present.
- Constraints are checked for BUY/SELL side, positive quantity, non-negative amounts, redaction status, manual review status, sensitive-data false, raw-artifact false, and learning-gate false/true invariants.
- Expected indexes are checked for internal trade, plan, contract, ticker, side, created timestamp, manual review, deviation, settlement review, and learning candidate lookup fields.
- The optional artifact table is verified as metadata/reference-only with no raw artifact columns.

## Safety Guarantees

- No migration apply occurred.
- No database connection occurred.
- No Supabase write occurred.
- No API route was activated.
- No Trade UI execution path was added.
- No real settlement extraction occurred.
- No real settlement note or broker confirmation was accessed.
- No browser automation was started.
- No Avanza login or order-prep behavior occurred.
- No BankID, credential, cookie, session, storage, or account handling was added.
- No final BUY/SELL, order submission, live trade mutation, or live position mutation occurred.
- No production-readiness claim is made.

## Remaining Warnings

| Warning | Severity | Required before apply/write phase |
| --- | --- | --- |
| Migration remains draft-only | Medium | Separate apply-readiness review |
| Migration has not been applied | High | Explicit non-production apply approval and validation |
| SQL has not been tested against a database | High | Non-production DB validation |
| RLS policies are intentionally absent | High | Separate app-auth/server-write RLS design and tests |
| Rollback remains comments-only | High | Non-production rollback validation |
| Optional artifact table remains metadata-only | High | Separate artifact-strategy review |
| Runtime write path remains absent | Medium | Separate write-path gate and approval |

## Static Search Classification

Static search target:

```text
rg -l "insert into|upsert|update .* set|delete from|copy |trigger|create trigger|create function|grant |create policy|using \(true\)|with check \(true\)|service_role|service role|anon|public|raw_pdf|raw_screenshot|raw_html|raw_broker_page|unredacted|credentials|password|BankID|MFA|cookie|session|account_number|customer_id|personal_identity|personnummer|avanza_customer|api_token|service_key|production" supabase/migrations docs tests lib app scripts
```

Static search category counts:

```text
  15 app
 952 docs
 349 lib
   8 scripts
  13 supabase
 140 tests
```

Classification:

- migration-schema-only: the migration contains table creation, comments, indexes, and RLS enablement only
- comments-only: one migration `grant` hit is inside a `COMMENT ON TABLE` text string stating the artifact table does not grant client access
- docs-only: planning/checkpoint/warning/no-go text
- tests-only: static safety tests and boundary tests
- fixtures-only: schema/payload safety fixtures
- locked: no-write, no-apply, no-DB, no-runtime confirmations
- blocked: raw artifact/sensitive/runtime/production terms appear as explicit blockers in docs/tests
- future-gated: SQL apply, RLS policy implementation, write path, production sanitizer, rollback validation, and artifact strategy remain future work
- warning: draft-only, review-only, no-apply, no-write, no-production text
- blocker: none found for this no-apply static-test task

Migration-file-only static review found schema/RLS/comment hits only. It did not find executable inserts, upserts, updates, deletes, copy commands, triggers, functions, policies, broad grants, permissive RLS expressions, or never-store column/data terms.

## Validation

Validation completed for this checkpoint:

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

Final decision: `post_trade_supabase_migration_draft_static_tests_complete_with_warnings`.

The migration draft now has no-apply static test coverage. It remains unapplied, unwired, non-runtime, non-writing, and not production-ready.
