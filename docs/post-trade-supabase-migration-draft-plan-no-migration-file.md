# Post-Trade Supabase Migration Draft Plan, No Migration File

## Summary

Purpose: describe how a future Supabase migration file for post-trade persistence could be structured, without creating the migration.

Scope: draft-planning only. This is not SQL to run, not a migration file, and not production-ready instructions. It creates no migration file, performs no Supabase write, adds no Supabase client, adds no write helper, activates no API route, opens no runtime gate, imports no smoke script, starts no browser automation, performs no Avanza integration, reads no real settlement note, handles no credentials/cookies/sessions/BankID, and makes no production-readiness claim.

Draft decision: `post_trade_supabase_migration_draft_plan_complete_with_warnings`.

Warning basis: the future migration outline, table order, pseudo-schema, constraints, indexes, RLS policy intents, rollback plan, test plan, review gates, and no-go items are documented. No actual SQL, migration file, RLS policy, table, write path, runtime path, or production persistence exists.

## Inputs

| Artifact | Exists | Purpose | Draft-plan input | Warnings | Blockers |
| --- | --- | --- | --- | --- | --- |
| `docs/post-trade-supabase-migration-readiness-checklist-no-migration-files.md` | Yes | Decide migration readiness | Confirms ready-with-warnings for a future draft plan | Checklist-only | None |
| `docs/post-trade-supabase-migration-planning-no-migration-files.md` | Yes | Plan future migration without files | Provides migration phase order, table checklist, RLS plan, rollback/delete, seed/test policy, blockers | Planning-only | None |
| `docs/post-trade-supabase-schema-rls-design-milestone-checkpoint.md` | Yes | Close schema/RLS design milestone | Provides milestone status and warnings | Checkpoint-only | None |
| `docs/post-trade-supabase-schema-rls-design-no-migrations.md` | Yes | Design future schema/RLS | Provides table designs, safe columns, never-store list, RLS principles, write gates | Design-only | None |
| `docs/post-trade-schema-allowlist-alignment-tests-checkpoint.md` | Yes | Checkpoint alignment tests | Provides alignment rules and no-migration/no-write coverage | Test-only | None |
| `tests/fixtures/post-trade-schema-allowlist-alignment-fixtures.ts` | Yes | Test-only schema metadata | Provides table/column metadata and gate flags | Fixture-only | None |
| `tests/e2e/post-trade-schema-allowlist-alignment.spec.ts` | Yes | Schema alignment tests | Provides structural coverage for safe schema metadata | 11 passed, structural-only | None |
| `docs/post-trade-persistence-payload-allowlist-tests-checkpoint.md` | Yes | Payload allowlist checkpoint | Provides safe payload fields and never-persist fields | Test-only | None |
| `tests/fixtures/post-trade-persistence-payload-allowlist-fixtures.ts` | Yes | Payload allowlist fixtures/helpers | Provides allowed payload and blocked key source | Fixture-only | None |
| `tests/e2e/post-trade-persistence-payload-allowlist.spec.ts` | Yes | Payload allowlist tests | Provides sensitive/raw/authority/runtime blocking coverage | 10 passed, structural-only | None |

## Draft Migration File Outline

Future migration file outline, docs-only:

1. Transaction wrapper / safe execution notes.
2. Enum/type setup if needed.
3. Foundation tables.
4. Derived/review tables.
5. Staged learning table.
6. Optional artifact metadata table only if separately approved.
7. Indexes.
8. Constraints.
9. RLS enablement.
10. RLS policies.
11. Comments/documentation.
12. Rollback notes.

Warnings:

- This is not SQL to run.
- This is not a migration file.
- This must not be copied directly to production without separate review.
- The future migration task must remain separate from write helpers, API routes, Trade UI paths, runtime persistence, and production flags.

## Draft Table Order

| Step | Table | Why this order | Dependencies | Rollback consideration | RLS requirement | Tests required |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `execution_confirmation_evidence` | Broker confirmation metadata is a foundation evidence concept | Internal trade/plan concepts only | Drop/tombstone before parent references are depended on | Enable RLS immediately | schema shape, forbidden columns, RLS enabled, no raw artifacts |
| 2 | `execution_settlement_reviews` | Central plan-vs-actual review table | Evidence metadata can be referenced; internal trade/plan/contract ids | Roll back after child tables are removed | Enable RLS immediately | schema shape, safe fields, constraints, allowlist alignment |
| 3 | `execution_cost_breakdowns` | Derived cost details depend on settlement review | `settlement_review_id` | Drop before settlement reviews | Parent-scoped RLS | FK/index, numeric constraints, no sensitive fields |
| 4 | `execution_deviation_reviews` | Review classification depends on settlement review | `settlement_review_id` | Drop before settlement reviews | Reviewer/manual-review scoped RLS | enum/checks, blocked/manual states, update policy tests |
| 5 | `execution_learning_candidates` | Staged learning depends on reviewed settlement/deviation concepts | `settlement_review_id` and separate learning gate | Drop before settlement reviews; no stats mutation | Scoped RLS; no auto-promotion | staged-only, separate gate, no auto-update tests |
| 6 optional | `execution_redacted_artifacts` | Optional metadata/reference table only after separate artifact strategy | Separate artifact storage approval | Drop metadata only; clean references if any | No raw client access | metadata-only, raw artifact forbidden, retention/delete tests |

## Draft Table Definitions, Docs-Only

### execution_confirmation_evidence

Pseudo-schema, not executable SQL:

- primary key: generated internal `id`
- timestamps: `created_at`, optional `updated_at`
- safe identifiers: `internal_trade_id`, optional `plan_id`
- trade fields: `side`, `ticker`
- review/status fields: `evidence_kind`, `evidence_timestamp`, optional `deviation_review_id`, `manual_review_status`
- redaction fields: `redaction_status`, `sensitive_data_present = false`, optional `redacted_artifact_id`
- manual review fields: `manual_review_status`
- foreign key ideas: internal trade/plan concepts; optional deviation review link after dependency review
- indexes: `internal_trade_id`, `plan_id`, `ticker`, `evidence_timestamp`, `created_at`
- forbidden fields: raw artifacts, customer/account ids, credentials, sessions, cookies, BankID/MFA, browser storage, network dumps, order/final-click authority
- constraints: side is BUY/SELL; redaction status safe; sensitive data false
- RLS notes: scoped select; gated insert; restricted update/delete
- rollback notes: drop/tombstone metadata only; never expose raw artifact

### execution_settlement_reviews

Pseudo-schema, not executable SQL:

- primary key: generated internal `id`
- timestamps: `created_at`, optional `updated_at`
- safe identifiers: `internal_trade_id`, `plan_id`, `contract_id`
- trade fields: `side`, `ticker`, `quantity`, `planned_price`, `execution_price`, `slippage`, `currency`
- review/status fields: `deviation_classification`, `manual_review_status`, `partial_fill_status`, `duplicate_confirmation_status`
- redaction fields: `redaction_status`, `sensitive_data_present = false`
- manual review fields: `manual_review_status`
- foreign key ideas: internal trade/plan/contract concepts; evidence metadata reference only if reviewed
- indexes: `internal_trade_id`, `plan_id`, `contract_id`, `ticker`, `side`, `created_at`, `manual_review_status`, `deviation_classification`
- forbidden fields: raw PDFs/screenshots/HTML/broker pages, customer/account ids, account balance, unrelated holdings, credentials/session/BankID
- constraints: side BUY/SELL; quantity positive; prices non-negative/positive as appropriate; redaction status safe; sensitive data false
- RLS notes: scoped select; gated insert; manual-review update only
- rollback notes: drop only after dependent derived/review/learning tables

### execution_cost_breakdowns

Pseudo-schema, not executable SQL:

- primary key: generated internal `id`
- timestamps: `created_at`, optional `updated_at`
- safe identifiers: `settlement_review_id`
- trade fields: `commission`, `fx_rate`, `fx_impact`, `fee_impact_percent`, `gross_amount`, `settlement_amount`, `currency`
- review/status fields: none beyond parent review
- redaction fields: `redaction_status`, `sensitive_data_present = false`
- foreign key ideas: `settlement_review_id` to settlement reviews
- indexes: `settlement_review_id`, `currency`, `created_at`
- forbidden fields: account balances, unrelated holdings, raw broker statements, raw artifacts, credentials/session data
- constraints: numeric values non-negative where appropriate; sensitive data false
- RLS notes: parent-scoped select; gated insert; restricted delete
- rollback notes: drop before settlement reviews

### execution_deviation_reviews

Pseudo-schema, not executable SQL:

- primary key: generated internal `id`
- timestamps: `created_at`, optional `updated_at`, optional `reviewed_at`
- safe identifiers: `settlement_review_id`
- review/status fields: `deviation_classification`, `reason_codes`, `requires_manual_review`, optional `blocked_reason`, optional `reviewed_by_label`, `manual_review_status`
- redaction fields: `redaction_status`, `sensitive_data_present = false`
- manual review fields: `requires_manual_review`, `reviewed_by_label`, `reviewed_at`, `manual_review_status`
- foreign key ideas: `settlement_review_id` to settlement reviews
- indexes: `settlement_review_id`, `deviation_classification`, `manual_review_status`, `created_at`
- forbidden fields: raw PII notes, raw artifacts, credentials/session/BankID, live order/mutation authority
- constraints: classification enum/check; manual review status enum/check; sensitive data false
- RLS notes: scoped select; reviewer/manual-review update only; restricted delete
- rollback notes: drop before settlement reviews; audit update/delete strategy required later

### execution_learning_candidates

Pseudo-schema, not executable SQL:

- primary key: generated internal `id`
- timestamps: `created_at`, optional `updated_at`
- safe identifiers: `settlement_review_id`
- review/status fields: `learning_candidate_status`, `outcome_eligible = false`, `requires_separate_learning_gate = true`, optional `blocked_reason`, `manual_review_status`
- redaction fields: `redaction_status`, `sensitive_data_present = false`
- manual review fields: `manual_review_status`
- foreign key ideas: `settlement_review_id` to settlement reviews
- indexes: `settlement_review_id`, `learning_candidate_status`, `created_at`
- forbidden fields: raw evidence, personal/account data, credentials, learning auto-update/promotion authority, production persistence authority
- constraints: staged status only; outcome eligible false by default; separate gate true; sensitive data false
- RLS notes: scoped select; gated insert; no promotion without separate future gate
- rollback notes: removable/discardable without mutating statistics or results

### Optional execution_redacted_artifacts

Pseudo-schema, not executable SQL:

- primary key: generated internal `id`
- timestamps: `created_at`, optional `updated_at`
- safe identifiers: none beyond internal id unless separately approved
- review/status fields: `artifact_kind`
- redaction fields: `redaction_status`, `storage_reference_safe`, `sensitive_data_present = false`
- foreign key ideas: optional internal artifact references after separate artifact strategy
- indexes: `artifact_kind`, `created_at`
- forbidden fields: raw PDF, raw screenshot, raw HTML, raw broker page, unredacted settlement note, unredacted broker confirmation, credentials/session/BankID/cookies, customer/account ids
- constraints: metadata/reference only; sensitive data false
- RLS notes: no raw artifact access from client; scoped metadata access only
- rollback notes: metadata delete/tombstone plus future reference cleanup strategy

## Draft Constraints

Planned constraints, docs-only:

- `sensitive_data_present = false`
- `production_persistence_allowed = false`, if represented
- `raw_artifact_stored = false`, if represented
- `learning_auto_update_allowed = false`, if represented
- `requires_separate_learning_gate = true` for learning candidates
- deviation classifications restricted to approved enum/check values
- manual review statuses restricted to approved enum/check values
- side must be BUY/SELL
- quantity positive
- prices non-negative/positive as appropriate
- timestamps required
- `redaction_status` must be `redacted` or approved safe equivalent

## Draft Indexes

| Index target | Reason | Performance/privacy considerations |
| --- | --- | --- |
| `internal_trade_id` | Lookup by internal trade | Internal id only, no broker ids |
| `plan_id` | Link planned trade to review/evidence | Internal id only |
| `contract_id` | Link execution contract to settlement review | Internal id only |
| `ticker` | Review/search by instrument | Safe symbol only |
| `side` | Filter BUY/SELL reviews | Safe enum |
| `created_at` | Operational review ordering | No sensitive payload |
| `manual_review_status` | Queue manual review work | Internal workflow only |
| `deviation_classification` | Find blocked/major/minor deviations | No auto-learning |
| `settlement_review_id` | Parent/child joins | Internal foreign key |
| `learning_candidate_status` | Stage learning candidates | No auto-promotion |

## Draft RLS Policies, Docs-Only

| Policy intent name | Table | Purpose | Actor | Allowed action | Restrictions | Future test requirement |
| --- | --- | --- | --- | --- | --- | --- |
| `select_scoped_confirmation_evidence` | `execution_confirmation_evidence` | Read scoped safe evidence metadata | authenticated internal scoped context | select | no public/anonymous; no raw artifact | scoped select and anon denial |
| `insert_gated_confirmation_evidence` | `execution_confirmation_evidence` | Insert redacted metadata later | future gated server context | insert | payload allowlist/redaction gate; no client direct | insert blocked except gated context |
| `rollback_confirmation_evidence` | `execution_confirmation_evidence` | Rollback/delete metadata later | future rollback/admin context | delete | audited reason; no raw artifact exposure | rollback policy test |
| `select_scoped_settlement_reviews` | `execution_settlement_reviews` | Read scoped review summaries | authenticated internal scoped context | select | no public/anonymous | scoped select and anon denial |
| `insert_gated_settlement_reviews` | `execution_settlement_reviews` | Insert redacted review later | future gated server context | insert | allowlist/redaction/manual status required | gated insert test |
| `update_manual_review_settlement_reviews` | `execution_settlement_reviews` | Update manual-review status later | future manual-review context | update | limited fields only | update field-scope test |
| `select_child_review_tables` | cost/deviation/learning tables | Read child rows scoped via parent | authenticated internal scoped context | select | parent scope required | parent scope test |
| `insert_child_review_tables` | cost/deviation/learning tables | Insert derived/staged rows later | future gated server context | insert | no production writes, no auto-promotion | insert policy tests |
| `update_manual_deviation_reviews` | `execution_deviation_reviews` | Manual-review updates later | future manual-review context | update | reviewer fields only | restricted update test |
| `rollback_child_review_tables` | cost/deviation/learning tables | Rollback child rows later | future rollback/admin context | delete | audited and parent-safe | rollback order test |
| `select_redacted_artifact_metadata` | optional artifact table | Read metadata only | authenticated internal scoped context | select | no raw artifact data | metadata-only policy test |

Global RLS requirements:

- no anonymous access
- no public access
- no client direct writes
- service role never exposed to client

## Draft Rollback Plan

Future rollback plan:

- reverse order rollback
- drop dependent tables first
- remove policies before tables if needed
- ensure no raw artifact exposure
- bad/redaction-failed rows delete path
- staged learning candidate removal
- optional artifact metadata cleanup if separately approved
- rollback must be tested in non-production before production

Reverse order:

1. optional `execution_redacted_artifacts`
2. `execution_learning_candidates`
3. `execution_deviation_reviews`
4. `execution_cost_breakdowns`
5. `execution_settlement_reviews`
6. `execution_confirmation_evidence`

## Draft Migration Test Plan

Future tests:

- migration lint
- schema shape tests
- forbidden column scan
- RLS enabled tests
- policy existence tests
- rollback tests
- allowlist-to-schema alignment tests
- blocked sensitive field tests
- no service role exposure tests
- no client write path tests
- no Trade UI/API activation tests
- generated type review tests if types are generated
- non-production apply/rollback dry-run tests before production

## Draft Review Gates

Before a future migration file may be created:

- this draft plan complete
- readiness checklist complete
- schema alignment tests pass
- payload allowlist tests pass
- reviewer sign-off
- rollback plan approved
- RLS policy intent reviewed
- no sensitive seed data
- no write path bundled
- no API route bundled
- no Trade UI path bundled
- no production flag true

## Explicit No-Go Items

A future migration draft still must not contain:

- real Avanza data
- real settlement note data
- credentials/session/BankID
- raw artifacts
- customer/account ids
- service keys
- API tokens
- production flag true
- write helper
- API route
- Trade UI execution path
- live trade/position mutation authority
- final BUY/SELL authority

## No-Migration/No-Write Confirmation

Confirmed for this task:

- no migration files created
- no SQL migration added
- no Supabase client added
- no write helper added
- no API route added
- no Trade UI path added
- no env flags changed
- no `.env.local` values printed
- no app runtime changed
- no smoke scripts run or imported
- no browser automation
- no credential/cookie/session/BankID handling
- no order submission or final BUY/SELL

## Related Docs

This draft plan follows:

- `docs/post-trade-supabase-migration-readiness-checklist-no-migration-files.md`
- `docs/post-trade-supabase-migration-planning-no-migration-files.md`

Follow-up references were added to:

- `docs/post-trade-supabase-migration-readiness-checklist-no-migration-files.md`
- `docs/post-trade-supabase-migration-planning-no-migration-files.md`

## Validation

Validation completed for this task:

| Check | Result |
| --- | --- |
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

## Static Search Classification

Static search target:

```text
rg -n "migration|create table|alter table|drop table|insert|upsert|update|RLS|policy|service role|Supabase|execution_confirmation_evidence|execution_settlement_reviews|execution_cost_breakdowns|execution_deviation_reviews|execution_learning_candidates|execution_redacted_artifacts|rawPdf|rawScreenshot|rawHtml|rawBrokerPage|credentials|password|BankID|cookie|session|accountNumber|customerId|personalIdentityNumber|production readiness|Trade UI execution|API route activation" docs tests lib app scripts supabase
```

Expected classification:

- docs-only: draft plan, readiness/planning docs, schema/RLS design, checkpoints, warning language
- tests-only: schema alignment, payload allowlist, settlement, mock-boundary, route-boundary, import-boundary specs
- fixtures-only: schema alignment metadata and payload allowlist fixtures
- locked: no-write, no-migration-file, no-runtime gate confirmations
- blocked: raw artifacts, sensitive data, service-role exposure, API route activation, Trade UI execution, production persistence
- future-gated: real migrations, RLS policy implementation, write preview, production sanitizer, rollback/delete implementation
- warning: draft-planning-only, checklist-only, planning-only, design-only, structural-only, test-only coverage
- blocker: any live write, migration file, runtime activation, production-ready claim, or validation failure

Static search completed with the requested migration, SQL-shape, RLS, Supabase, sensitive-data, runtime-activation, and production-readiness terms.

Static search category counts:

```text
  22 app
 975 docs
 380 lib
   8 scripts
  13 supabase
 140 tests
```

Classification:

- docs-only: draft plan, readiness/planning docs, schema/RLS design, checkpoints, persistence gate docs, planning, and warning language
- tests-only: schema alignment, payload allowlist, settlement, mock-boundary, route-boundary, import-boundary, and structural specs
- fixtures-only: schema alignment metadata and payload allowlist fixtures
- locked: no-write, no-migration-file, no-runtime gate confirmations
- blocked: raw artifacts, sensitive data, service-role exposure, API route activation, Trade UI execution, production persistence
- future-gated: real migrations, RLS policy implementation, write preview, production sanitizer, rollback/delete implementation
- warning: draft-planning-only, checklist-only, planning-only, design-only, structural-only, test-only coverage
- blocker: none found for this draft-planning-only task

## Final Decision

Final decision: `post_trade_supabase_migration_draft_plan_complete_with_warnings`.

The draft plan is complete at docs-only level. It is not a migration file and does not authorize database changes, writes, API/runtime activation, or production persistence.

Recommended next task: Task 385 - Supabase migration draft plan review checkpoint, no migration file.

Alternative: Task 385 - Ture Agent Dev Chat 3 continuation summary.

Task 385 follow-up: `docs/post-trade-supabase-migration-draft-plan-review-checkpoint.md` reviews the draft migration plan for completeness before a future pre-migration approval checklist. It confirms the migration remains uncreated, writes remain absent, runtime/API activation remains inactive, no-go items remain locked, and production remains blocked.

Task 386 follow-up: `docs/post-trade-supabase-pre-migration-approval-checklist-no-migration-file.md` approves the project for a future separate migration-file draft task with strict no-apply/no-write scope. It still creates no SQL, no migration file, no Supabase writes, no runtime/API activation, and no Trade UI execution.

## Out of Scope

- No Supabase writes.
- No migrations.
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
