# Post-Trade Supabase Migration Planning, No Migration Files

## Summary

Purpose: plan a future Supabase migration for post-trade persistence without creating migration files, writing data, or activating any runtime/API path.

Scope: migration-planning only. This document creates no migration file, performs no Supabase write, adds no Supabase client, adds no write helper, activates no API route, opens no runtime gate, imports no smoke script, starts no browser automation, performs no Avanza integration, reads no real settlement note, handles no credentials/cookies/sessions/BankID, and makes no production-readiness claim.

Planning decision: `post_trade_supabase_migration_planning_complete_with_warnings`.

Warning basis: migration goals, order, table checklists, RLS plan, safety gates, rollback/delete policy, seed policy, test strategy, write-path separation, and production blockers are documented. No real migration, SQL, RLS policy, table, generated type, write path, or production persistence exists.

## Design Inputs

| Artifact | Exists | Purpose | Migration planning input | Warnings | Blockers |
| --- | --- | --- | --- | --- | --- |
| `docs/post-trade-supabase-schema-rls-design-milestone-checkpoint.md` | Yes | Close the schema/RLS design milestone | Defines completed-with-warnings design state, warnings, blockers, and next phase | Checkpoint-only | None for planning |
| `docs/post-trade-supabase-schema-rls-design-no-migrations.md` | Yes | Design future table/RLS areas without migrations | Provides proposed tables, safe columns, never-store columns, RLS principles, write gates, flags, and migration strategy | Design-only | None for planning |
| `docs/post-trade-schema-allowlist-alignment-tests-checkpoint.md` | Yes | Checkpoint schema allowlist alignment tests | Provides alignment rules and test-only proof that schema metadata matches allowlist/safety rules | Test-only | None for planning |
| `tests/fixtures/post-trade-schema-allowlist-alignment-fixtures.ts` | Yes | Test-only schema metadata | Provides table/column metadata, required fields, forbidden fields, RLS/write/redaction/payload/rollback flags | Fixture-only | None for planning |
| `tests/e2e/post-trade-schema-allowlist-alignment.spec.ts` | Yes | Schema alignment structural tests | Provides regression coverage for safe columns, never-store blocks, RLS/gates, learning/artifact rules, source isolation | Structural-only | None for planning |
| `docs/post-trade-persistence-payload-allowlist-tests-checkpoint.md` | Yes | Payload allowlist checkpoint | Provides safe payload categories, never-persist fields, validator behavior, learning candidate safety | Test-only | None for planning |
| `tests/fixtures/post-trade-persistence-payload-allowlist-fixtures.ts` | Yes | Payload allowlist fixtures/helpers | Provides allowed payload keys and never-persist list for future schema alignment | Fixture-only | None for planning |
| `tests/e2e/post-trade-persistence-payload-allowlist.spec.ts` | Yes | Payload allowlist structural tests | Provides positive/negative payload safety coverage | Structural-only | None for planning |

## Future Migration Goals

A future migration may be considered only after separate approval. Goals would be:

- create post-trade tables
- add safe columns only
- add indexes for internal ids and review links
- enable RLS on every table
- define restrictive policies
- add rollback/delete strategy
- keep learning candidates staged
- preserve no raw artifact storage
- preserve no client direct writes
- preserve no production activation

Non-goals:

- no write helper in the migration task
- no API route in the migration task
- no Trade UI writes
- no production activation
- no raw sensitive artifact storage

## Proposed Migration Order

### Phase 1 - Foundation Tables

Tables:

- `execution_confirmation_evidence`
- `execution_settlement_reviews`

Prerequisites:

- schema design reviewed
- allowlist alignment tests passing
- never-store scan passing
- RLS draft reviewed
- rollback/drop plan drafted

RLS requirements:

- RLS enabled before any non-test use
- no public/anonymous access
- scoped read policies only
- no broad client writes
- future gated server insert policy planned but not activated

Rollback requirement:

- drop/tombstone strategy documented
- no raw artifacts exposed during rollback

Tests required before/after:

- schema shape tests
- forbidden column scan
- RLS enabled/policy existence tests
- rollback dry-run tests in non-production

Blockers:

- any raw artifact column
- any customer/account id column
- missing RLS
- missing rollback plan
- write path bundled with migration

### Phase 2 - Derived/Review Tables

Tables:

- `execution_cost_breakdowns`
- `execution_deviation_reviews`

Prerequisites:

- Phase 1 migration validated in non-production
- parent foreign key strategy reviewed
- manual review update policy drafted

RLS requirements:

- inherit project/user scope from parent review
- no public/anonymous access
- update policies limited to future manual-review path

Rollback requirement:

- rollback with parent settlement review
- audit reason strategy planned

Tests required before/after:

- parent/child schema shape tests
- deviation review blocked-state tests
- update policy tests
- delete/rollback relationship tests

Blockers:

- raw notes with PII
- reviewer workflow bypass
- broad update/delete policy

### Phase 3 - Staged Learning

Tables:

- `execution_learning_candidates`

Prerequisites:

- learning candidate gate reviewed
- no-auto-promotion invariant reviewed
- blocked/sensitive/partial-fill rules reviewed

RLS requirements:

- scoped internal access
- no automatic promotion policy
- no stats/results mutation policy

Rollback requirement:

- candidates removable/discardable without mutating statistics

Tests required before/after:

- staged-only schema tests
- separate gate required tests
- blocked deviation not eligible tests
- sensitive evidence not eligible tests

Blockers:

- automatic learning update allowed
- candidate promotion without separate gate
- statistics mutation coupled to insert

### Phase 4 - Optional Metadata-Only Artifacts

Tables:

- `execution_redacted_artifacts`, only if separately approved

Prerequisites:

- separate artifact storage strategy approved
- redaction/storage/retention/delete design complete
- raw artifact storage explicitly blocked unless separately designed

RLS requirements:

- no raw artifact access from client code
- metadata/reference-only access
- no public/anonymous access

Rollback requirement:

- artifact metadata delete/tombstone plan
- storage reference cleanup plan if references are introduced

Tests required before/after:

- metadata-only column scan
- raw PDF/screenshot/HTML/broker page forbidden tests
- retention/delete tests

Blockers:

- raw artifact storage requested
- unredacted broker/settlement artifact columns
- missing retention/delete strategy

## Table Migration Checklist

| Table | Purpose | Safe columns | Required columns | Forbidden columns | Primary key | Foreign key ideas | Indexes | Constraints | RLS required | Policies required | Rollback/delete path | Seed data policy | Test requirements | Production blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `execution_confirmation_evidence` | Redacted broker confirmation metadata | internal ids, side, ticker, evidence kind/timestamp, redacted artifact id, safe broker label, redaction/manual review fields, schema/gate versions | id, created_at, internal_trade_id, side, ticker, evidence_kind, evidence_timestamp, redaction_status, sensitive_data_present, manual_review_status | raw artifacts, customer/account ids, credentials/session/BankID, order authority | generated internal id | internal trade/plan; optional deviation review | internal_trade_id, plan_id, ticker, evidence_timestamp | sensitive_data_present false; redaction status enum; no raw artifact flags | Yes | scoped select; gated insert; restricted update/delete | drop/tombstone with reason | synthetic/redacted only | schema shape, forbidden column, RLS, rollback | no production until RLS/redaction/rollback validated |
| `execution_settlement_reviews` | Settlement extraction and plan-vs-actual review | internal ids, side/ticker, quantity, prices, slippage, currency, amounts, commission, FX, deviation/manual review, partial/duplicate status | id, created_at, internal_trade_id, plan_id, contract_id, side, ticker, quantity, planned_price, execution_price, deviation_classification, manual_review_status, redaction_status | raw artifacts, customer/account ids, account balance, unrelated holdings, credentials/session/BankID | generated internal id | internal trade/plan/contract | internal_trade_id, plan_id, contract_id, ticker, created_at | non-negative quantity/amounts; sensitive_data_present false | Yes | scoped select; gated insert; manual-review update; restricted delete | rollback by internal id | synthetic/redacted only | schema shape, constraints, RLS, allowlist alignment | no production without sanitizer and RLS verification |
| `execution_cost_breakdowns` | Derived cost details | settlement review id, commission, FX, fee impact, gross/settlement amounts, currency, redaction fields | id, created_at, settlement_review_id, commission, gross_amount, settlement_amount, currency, redaction_status | account balances, unrelated holdings, raw broker statement, raw artifacts | generated internal id | settlement_review_id | settlement_review_id, currency | sensitive_data_present false; numeric constraints | Yes | parent-scoped select; gated insert; restricted delete | rollback with parent | synthetic only | parent/child, forbidden column, RLS | no production without parent review validation |
| `execution_deviation_reviews` | Deviation classification and reason codes | settlement review id, classification, reason codes, manual review requirement, blocked reason, reviewer label/time, redaction fields | id, created_at, settlement_review_id, deviation_classification, reason_codes, requires_manual_review, manual_review_status, redaction_status | raw notes with PII, raw artifacts, credentials/session/BankID, live order authority | generated internal id | settlement_review_id | settlement_review_id, deviation_classification, manual_review_status | blocked/manual review state constraints | Yes | scoped select; reviewer-only update; restricted delete | audited update/delete | synthetic only | blocked-state, policy, rollback tests | no production without reviewer workflow |
| `execution_learning_candidates` | Staged learning candidates only | settlement review id, staged status, outcome eligible false, separate gate true, blocked reason, manual review/redaction fields | id, created_at, settlement_review_id, learning_candidate_status, outcome_eligible, requires_separate_learning_gate, manual_review_status, redaction_status | raw evidence, personal/account data, credentials, auto-promotion authority | generated internal id | settlement_review_id | settlement_review_id, learning_candidate_status | staged status only; outcome_eligible false by default | Yes | scoped select; gated insert; no promotion/update without separate gate | discard without stats mutation | synthetic only | staged-only, no-auto-update, gate tests | no production without learning gate |
| optional `execution_redacted_artifacts` | Metadata/reference only | artifact kind, redaction status, safe storage reference, sensitive false marker | id, created_at, artifact_kind, redaction_status, storage_reference_safe, sensitive_data_present | raw PDF/screenshot/HTML/broker page, unredacted artifacts, credentials/session/BankID, customer/account ids | generated internal id | optional internal artifact links | artifact_kind, created_at | sensitive_data_present false; metadata-only | Yes | no client raw access; scoped metadata select; gated insert | metadata delete/tombstone | synthetic only | raw artifact forbidden, retention/delete tests | no production without artifact strategy |

## RLS Migration Plan

Future RLS requirements:

- RLS enabled by default for each table
- no public access
- no anonymous access
- no broad client writes
- scoped read access only
- insert only through a future gated server path
- update only through a future manual-review path
- delete/rollback restricted
- service role never exposed to client
- production policies require separate review

Policy draft principles:

- `select`: scoped internal/project read only
- `insert`: future gated server writer only, not client direct
- `update`: manual-review fields only where applicable
- `delete`: rollback-only path with audit reason

## Migration Safety Gates

Before any migration file may be created:

- explicit task approval
- schema design review complete
- allowlist alignment tests passing
- never-store scan passing
- migration draft reviewed before creation
- rollback strategy documented
- RLS policies drafted
- policy tests planned
- no sensitive seed data
- no write path bundled
- no API route bundled
- no Trade UI path bundled
- no production flag true

## Rollback/Delete Plan

Future migration planning must include:

- every table has rollback/drop strategy
- rollback must not expose raw artifacts
- delete path for bad/redaction-failed rows exists
- learning candidates are removable/staged
- audit trail strategy required before production
- migration rollback tested in non-production first
- parent/child rollback order documented
- optional artifact metadata cleanup documented before artifact table creation

## Seed Data Policy

Rules:

- no real broker data
- no real settlement note data
- no customer/account ids
- no credentials/session data
- no raw artifacts
- test seed data must be mock, synthetic, and redacted only
- production seed data forbidden
- no seed data containing personal identity values
- no seed data containing account balances or unrelated holdings

## Migration Test Strategy

Future tests should include:

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
- generated Supabase type review tests if types are generated
- non-production migration apply/rollback dry-run before any production step

## Write-Path Separation

Migration work must remain separate from write-path work:

- migration must not include write helper
- migration must not include API route
- migration must not include Trade UI writes
- migration must not enable runtime persistence
- migration only creates schema/RLS in a future separate task
- write path requires separate later gate
- write preview requires separate dry-run model
- production writes require separate production gate

## Feature Flag Separation

Rules:

- flags remain false
- no flag changes in migration planning
- future migration must not commit flags true
- future write path requires separate explicit flag review
- production requires separate production gate
- feature flags do not bypass RLS, redaction, allowlist, reviewer, or rollback gates

## Production Blockers

Production remains blocked by:

- no production migration without non-production validation
- no production write path
- no raw artifact strategy
- no production sanitizer
- no RLS verification
- no rollback test
- no audit trail strategy
- no learning gate review
- no broker confirmation capture review
- no security review
- no production feature flag approval
- no generated type review

## No-Migration/No-Write Confirmation

Confirmed for this task:

- no migration files created
- no Supabase client added
- no write helper added
- no API route added
- no Trade UI path added
- no env flags changed
- no `.env.local` values printed
- no app runtime changed
- no smoke scripts run or imported
- no browser automation
- no Avanza login/order-prep
- no credential/cookie/session/BankID handling
- no order submission or final BUY/SELL
- no live trade or position mutation

## Related Docs

This planning doc follows:

- `docs/post-trade-supabase-schema-rls-design-milestone-checkpoint.md`
- `docs/post-trade-supabase-schema-rls-design-no-migrations.md`
- `docs/post-trade-schema-allowlist-alignment-tests-checkpoint.md`

Follow-up references were added to:

- `docs/post-trade-supabase-schema-rls-design-milestone-checkpoint.md`
- `docs/post-trade-supabase-schema-rls-design-no-migrations.md`

Task 383 follow-up: `docs/post-trade-supabase-migration-readiness-checklist-no-migration-files.md` adds a readiness checklist for a future migration draft plan. It reviews artifact readiness, migration gates, phase/table readiness, RLS readiness, rollback/delete readiness, seed data readiness, test readiness, write-path separation, feature flag separation, production blockers, and static search classification without creating migration files or writes.

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

- docs-only: migration planning, schema/RLS design, checkpoints, persistence gate docs, warning language
- tests-only: schema alignment, payload allowlist, settlement, mock-boundary, route-boundary, import-boundary specs
- fixtures-only: schema alignment metadata and payload allowlist fixtures
- locked: no-write, no-migration-file, no-runtime gate confirmations
- blocked: raw artifacts, sensitive data, service-role exposure, API route activation, Trade UI execution, production persistence
- future-gated: real migrations, RLS policy implementation, write preview, production sanitizer, rollback/delete implementation
- warning: planning-only, design-only, structural-only, test-only coverage
- blocker: any live write, migration file, runtime activation, production-ready claim, or validation failure

Static search completed with the requested migration, SQL-shape, RLS, Supabase, sensitive-data, runtime-activation, and production-readiness terms.

Static search category counts:

```text
  22 app
 973 docs
 380 lib
   8 scripts
  13 supabase
 140 tests
```

Classification:

- docs-only: migration planning, schema/RLS design, checkpoints, persistence gate docs, planning, and warning language
- tests-only: schema alignment, payload allowlist, settlement, mock-boundary, route-boundary, import-boundary, and structural specs
- fixtures-only: schema alignment metadata and payload allowlist fixtures
- locked: no-write, no-migration-file, no-runtime gate confirmations
- blocked: raw artifacts, sensitive data, service-role exposure, API route activation, Trade UI execution, production persistence
- future-gated: real migrations, RLS policy implementation, write preview, production sanitizer, rollback/delete implementation
- warning: planning-only, design-only, structural-only, test-only coverage
- blocker: none found for this migration-planning-only task

## Final Decision

Final decision: `post_trade_supabase_migration_planning_complete_with_warnings`.

The future migration is planned at docs-only level. No migration files, writes, runtime/API paths, or production persistence were introduced.

Task 383 completed the migration readiness checklist without migration files.

Recommended next task: Task 384 - Supabase migration draft plan, no migration file.

Alternative: Task 384 - Ture Agent Dev Chat 3 continuation summary.

Task 384 follow-up: `docs/post-trade-supabase-migration-draft-plan-no-migration-file.md` adds the docs-only draft migration plan. It defines the future migration outline, table order, table definitions as pseudo-schema, constraints, indexes, RLS policy intents, rollback plan, test plan, review gates, explicit no-go items, static search classification, and no-migration/no-write confirmation without creating migration files, SQL, Supabase writes, API/runtime activation, Trade UI execution, smoke scripts, browser automation, credentials/session handling, or order behavior.

Task 385 follow-up: `docs/post-trade-supabase-migration-draft-plan-review-checkpoint.md` adds the review/checkpoint layer for the draft plan before any future pre-migration approval checklist. It confirms the draft plan is complete with warnings, while real migration files, SQL, Supabase writes, runtime/API activation, Trade UI execution, browser automation, credentials/session handling, and order behavior remain blocked.

Task 386 follow-up: `docs/post-trade-supabase-pre-migration-approval-checklist-no-migration-file.md` approves a future migration-file draft task with warnings and strict no-apply/no-write scope. Real SQL remains absent in this task, and Supabase writes, runtime/API activation, Trade UI execution, browser automation, credential/session handling, production apply, and order behavior remain blocked.

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
