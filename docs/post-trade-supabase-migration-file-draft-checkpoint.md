# Post-Trade Supabase Migration File Draft Checkpoint

## Summary

Purpose: checkpoint the first Supabase migration file draft for post-trade persistence without applying it or connecting to a database.

Scope: migration-file-draft only. The migration file exists as a code artifact, but it was not applied, not pushed, not reset, and not run against Supabase. This task performs no Supabase writes, adds no runtime write path, activates no API route, opens no runtime gate, imports or runs no smoke script, starts no browser automation, performs no Avanza integration, reads no real settlement note, handles no credentials/cookies/sessions/BankID, submits no order, clicks no final BUY/SELL, and makes no production-readiness claim.

Decision: `post_trade_supabase_migration_file_draft_complete_with_warnings`.

Migration file created:

- `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql`

## No Apply / No Write Confirmation

Confirmed for this task:

- migration file created as draft artifact only
- migration was not applied
- no Supabase CLI apply/push/reset was run
- no database connection was made
- no Supabase write occurred
- no inserts/upserts/updates/seeds were added
- no API route was activated
- no runtime persistence was enabled
- no Trade UI path was added
- no `.env.local` change was made
- no `app/trade-app.tsx` change was made
- no browser automation, credential/session handling, BankID automation, order submission, or final BUY/SELL behavior was introduced

## Tables Included

Tables are drafted in the approved safe order:

1. `execution_confirmation_evidence`
2. `execution_settlement_reviews`
3. `execution_cost_breakdowns`
4. `execution_deviation_reviews`
5. `execution_learning_candidates`
6. `execution_redacted_artifacts`

## Optional Artifact Table Decision

The optional `execution_redacted_artifacts` table is included because it is metadata/reference-only and constrained with:

- `sensitive_data_present = false`
- `raw_artifact_stored = false`
- no raw PDF, screenshot, HTML, broker page, or unredacted content columns
- no account/customer/person/session/credential columns
- RLS enabled

Warning: this remains the highest-risk table and still requires separate artifact-strategy review before any apply.

## RLS Approach

The draft uses the conservative RLS path:

- RLS is enabled for every drafted table.
- No permissive policies are created.
- No public/anonymous/client write policies are created.
- Exact app-auth/server-write policies remain future work.
- Future policy work must preserve scoped reads, gated server-context creation, manual-review/admin changes, rollback/admin removal, no anonymous access, no broad client writes, and no raw artifact access.

## Constraints Summary

The migration draft includes constraints for:

- side `BUY`/`SELL`
- positive quantity
- non-negative/positive numeric values where applicable
- `sensitive_data_present = false`
- `raw_artifact_stored = false` on the optional artifact table
- `learning_auto_update_allowed = false`
- `requires_separate_learning_gate = true`
- `outcome_eligible = false`
- redaction status enum/check
- manual review status enum/check
- deviation classification enum/check
- learning candidate status enum/check
- environment label enum/check where represented

## Indexes Summary

The migration draft includes indexes where matching columns exist:

- `internal_trade_id`
- `plan_id`
- `contract_id`
- `confirmation_evidence_id`
- `ticker`
- `side`
- `created_at`
- `manual_review_status`
- `deviation_classification`
- `settlement_review_id`
- `learning_candidate_status`
- `artifact_kind`

## Rollback Notes

Rollback notes are included as SQL comments in the migration file.

Required rollback direction:

1. `execution_redacted_artifacts`
2. `execution_learning_candidates`
3. `execution_deviation_reviews`
4. `execution_cost_breakdowns`
5. `execution_settlement_reviews`
6. `execution_confirmation_evidence`

Rollback still requires non-production testing before any production step and must not expose raw artifacts or sensitive broker/person/session material.

## Remaining Warnings

| Warning | Severity | Why not blocker now | Required before apply/write phase |
| --- | --- | --- | --- |
| Migration file exists but is not applied | Medium | This task is draft-only | Separate review before apply |
| RLS has no app-auth policies | High | Conservative no-policy RLS is safer than permissive placeholder policies | Auth/server-write policy review and tests |
| Optional artifact metadata table included | High | Metadata-only constraints keep it safe as draft | Separate artifact-strategy review |
| No real DB validation | High | DB connection/apply is forbidden | Non-production apply/rollback validation |
| No generated type review | Medium | Types not generated in this task | Type generation/review after apply in a safe environment |
| No write path exists | Medium | Writes remain locked | Separate write-path gate |
| Production remains blocked | High | Expected invariant | Separate production gate |

## Static Search Classification

Static search target:

```text
rg -n "insert into|upsert|update .* set|delete from|service_role|service role|anon|public|raw_pdf|raw_screenshot|raw_html|raw_broker_page|unredacted|credentials|password|BankID|MFA|cookie|session|account_number|customer_id|personal_identity|personnummer|avanza_customer|api_token|service_key|production" supabase/migrations docs tests lib app scripts
```

Expected classification:

- migration-schema-only: schema/table/index/RLS/comment references in the draft migration
- docs-only: planning/checkpoint/warning/no-go text
- tests-only: safety tests and boundary tests
- blocked: raw artifact/sensitive/runtime/production terms that are explicitly forbidden
- future-gated: SQL apply, RLS policy implementation, write path, production sanitizer, rollback/delete implementation
- warning: draft-only, review-only, no-apply, no-write, no-production text
- blocker: inserts/upserts/updates/seeds, live writes, DB apply, permissive public policies, credentials/session data, or validation failure

Static search completed with the requested write/action, RLS, Supabase, sensitive-data, runtime-activation, and production terms.

Static search category counts:

```text
  15 app
 918 docs
 323 lib
   8 scripts
  13 supabase
 135 tests
```

Classification:

- migration-schema-only: the new migration draft contains table creation, indexes, comments, and RLS enablement only
- docs-only: planning/checkpoint/warning/no-go text, including this checkpoint
- tests-only: safety tests and boundary tests
- blocked: raw artifact/sensitive/runtime/production terms appear as explicit blockers in docs/tests
- future-gated: SQL apply, RLS policy implementation, write path, production sanitizer, and rollback/delete implementation remain future work
- warning: draft-only, review-only, no-apply, no-write, no-production text
- blocker: none found for this migration-file-draft-only task

Migration-file-only static review:

- no `insert into`, `upsert`, `update ... set`, or `delete from`
- no never-store terms for credentials/password/BankID/MFA/cookie/session/account/customer/personal identity/API key/raw broker artifact column names
- table creation and RLS enablement are present
- no draft policies, grants, runtime functions, triggers, seeds, or writes are present

## Safe Validations

Validation completed for this task:

| Check | Result |
| --- | --- |
| Migration file static review, no apply | Pass |
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

## Recommended Next Task

Recommended next task: Task 388 - Supabase migration file draft review, no apply/no writes.

Alternative: Task 388 - Ture Agent Dev Chat 3 continuation summary.

Task 388 follow-up: `docs/post-trade-supabase-migration-file-draft-review-checkpoint.md` reviews the migration file draft without applying it. It confirms table order, never-store exclusions, absence of writes/seeds/runtime paths, conservative RLS enablement, constraints/indexes, metadata-only artifact handling, and no-apply/no-write status.

Task 389 follow-up: `docs/post-trade-supabase-migration-draft-static-tests-checkpoint.md` and `tests/e2e/post-trade-supabase-migration-draft-static.spec.ts` add automated no-apply static coverage for the migration draft. The static spec reads the migration as text only and verifies table order, no executable writes, no permissive policies/grants, RLS enablement, constraints/indexes, never-store exclusions, artifact metadata-only shape, and source isolation from app/runtime/Supabase clients.

## Final Decision

Final decision: `post_trade_supabase_migration_file_draft_complete_with_warnings`.

The migration file draft is complete enough for a future no-apply/no-write review task. It is not applied, not connected to Supabase, not wired into runtime, not linked from Trade UI, and not production-ready.

Task 389 update: the migration draft now has no-apply static tests. This does not approve apply or runtime usage; the draft remains unapplied, unwired, and non-production.

## Out Of Scope

- No Supabase writes.
- No migration apply.
- No DB connection.
- No API route activation.
- No Trade UI execution.
- No real settlement extraction.
- No real settlement note access.
- No browser automation.
- No Avanza login.
- No Avanza order-prep.
- No BankID handling.
- No credential access.
- No cookie/session handling.
- No final BUY/SELL.
- No order submission.
- No live trade mutation.
- No live position mutation.
- No production readiness.
