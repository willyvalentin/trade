# Post-Trade Supabase Schema/RLS Design, No Migrations

## Summary

Purpose: design a future Supabase schema and row-level security model for post-trade persistence.

Scope: docs/model/schema-design only. This document creates no migration, adds no Supabase client, writes no data, activates no API route, opens no runtime gate, adds no Trade UI execution path, starts no browser automation, performs no Avanza integration, reads no real settlement note, and makes no production-readiness claim.

Design decision: `post_trade_supabase_schema_rls_design_complete_with_warnings`.

Warning basis: the proposed schema/RLS design is concrete enough for future review and tests, but it remains design-only. It does not prove migration correctness, RLS enforcement, redaction quality, real writes, production persistence, real broker artifact safety, or post-trade learning correctness.

## Design Inputs

| Artifact | Exists | Purpose | Relevant schema/RLS input | Warnings | Blockers |
| --- | --- | --- | --- | --- | --- |
| `docs/post-trade-persistence-gate-design-no-writes.md` | Yes | Defines the future persistence gate before any writes | Proposed schema areas, minimum safe fields, never-persist fields, redaction gate, RLS/security gate, write authorization gate, false-by-default flags, rollback/delete needs | Does not implement schema, RLS, migration, or writer | None for design-only work |
| `docs/post-trade-persistence-payload-allowlist-tests-checkpoint.md` | Yes | Documents test-only payload allowlist coverage | Safe payload categories, allowed keys, never-persist keys, source isolation, and learning candidate safety | Test-only; no DB table alignment yet | None for design-only work |
| `docs/post-trade-persistence-gate-structural-coverage-review.md` | Yes | Reviews Tasks 375-377 structural coverage | Identifies schema/RLS as the next concrete gap and keeps no-write/no-migration boundaries explicit | Review-only; schema/RLS still unproven | None for design-only work |
| `docs/post-trade-lifecycle-milestone-checkpoint.md` | Yes | Closes the post-trade lifecycle milestone | Confirms settlement, broker confirmation, extraction, reconciliation, and persistence design remain non-runtime | Milestone-only; does not implement persistence | None for design-only work |
| `docs/settlement-extraction-plan-vs-actual-review-hardening-checkpoint.md` | Yes | Hardens settlement extraction to plan-vs-actual review | Provides deviation, mismatch, redaction, and manual review concepts that shape future review tables | Fixture/model-only; no production parser | None for design-only work |
| `tests/fixtures/post-trade-persistence-payload-allowlist-fixtures.ts` | Yes | Test-only safe payload fixtures and validators | Defines the safe field vocabulary that schema columns should align to | No Supabase schema, no writes | None for design-only work |
| `tests/e2e/post-trade-persistence-payload-allowlist.spec.ts` | Yes | Structural payload allowlist regression tests | Proves blocked sensitive/raw/authority fields and staged learning candidate behavior at fixture level | No RLS policy tests and no DB writer tests | None for design-only work |

## Proposed Schema Areas

Potential future tables:

- `execution_confirmation_evidence`
- `execution_settlement_reviews`
- `execution_cost_breakdowns`
- `execution_deviation_reviews`
- `execution_learning_candidates`
- optional: `execution_redacted_artifacts`

These table names are design placeholders. They are not migrations and are not runtime contracts until a later explicit migration/RLS task approves them.

## Shared Safe Columns

Candidate shared safe columns:

- `id`
- `created_at`
- `updated_at`
- `internal_trade_id`
- `plan_id`
- `contract_id`
- `side`
- `ticker`
- `source_type`
- `redaction_status`
- `sensitive_data_present` constrained to false for persisted rows
- `manual_review_status`
- `reviewer_label` or another safe internal actor label
- `environment_label`: `local`, `test`, or later approved production label
- `schema_version`
- `gate_version`

Rules:

- identifiers must be internal Ture ids, not broker customer/account ids
- `source_type` must describe safe provenance, not raw broker state
- `reviewer_label` must be a safe internal label and not a credential, email token, session marker, or personal identity value
- production labels remain future-gated

## Never-Store Columns

These fields must not appear as table columns, JSON keys, generated types, payload keys, or stored artifact metadata:

- credentials
- password
- BankID data
- MFA data
- cookies
- sessions
- raw browser storage
- network dumps
- Supabase service keys
- API tokens
- full personal identity data
- Avanza customer id
- account number
- account balance
- unrelated holdings
- raw PDF
- raw screenshot
- raw HTML
- raw broker page
- unredacted settlement note
- unredacted broker confirmation

Any future schema or migration that includes these fields is a blocker.

## Table: execution_confirmation_evidence

Purpose: store only redacted broker confirmation metadata. It must not store raw screenshots, PDFs, customer/account ids, credentials, sessions, or order submission authority.

Allowed fields:

- `id`
- `internal_trade_id`
- `plan_id`
- `side`
- `ticker`
- `evidence_kind`
- `evidence_timestamp`
- `redacted_artifact_id` nullable
- `broker_label` as a mock/safe label only
- `redaction_status`
- `sensitive_data_present`
- `manual_review_status`
- `deviation_review_id` nullable
- `created_at`
- `updated_at`

Forbidden fields:

- raw artifact bodies
- customer/account identifiers
- credentials, cookies, sessions, BankID, MFA, browser storage, network dumps
- order submission/final BUY/SELL authority markers

Primary key pattern: generated UUID or equivalent internal id.

Foreign key ideas: `internal_trade_id` and `plan_id` should point to existing internal trade/plan concepts if approved later; `deviation_review_id` should point to `execution_deviation_reviews` only after migration review.

Timestamps: `created_at` required; `updated_at` only for safe manual review metadata.

Redaction/manual review: `redaction_status` must be safe/complete before write; `manual_review_status` must be explicit.

RLS owner/project scoping: no public access; rows scoped to authenticated internal user/project context using the existing app auth model if applicable.

Write authorization: inserts only through a future service-reviewed gate; no client-side broad writes; service role never exposed to client code.

Delete/rollback: delete/rollback restricted, audited, and linked to an internal reason.

## Table: execution_settlement_reviews

Purpose: store safe extraction and plan-vs-actual review fields. It must not store raw artifacts, sensitive broker/account data, or automatic learning updates.

Allowed fields:

- `id`
- `internal_trade_id`
- `plan_id`
- `contract_id`
- `side`
- `ticker`
- `quantity`
- `planned_price`
- `execution_price`
- `slippage`
- `currency`
- `gross_amount`
- `settlement_amount`
- `commission`
- `fx_rate` nullable
- `deviation_classification`
- `manual_review_status`
- `partial_fill_status`
- `duplicate_confirmation_status`
- `redaction_status`
- `sensitive_data_present`
- `created_at`
- `updated_at`

Forbidden fields:

- raw PDF, screenshot, HTML, broker page, settlement note, or confirmation
- customer/account ids and account balances
- credentials/session/BankID data
- unrelated holdings

Primary key pattern: generated UUID or internal review id.

Foreign key ideas: internal trade/plan/contract ids only; never broker account ids.

Timestamps: `created_at` required; `updated_at` only for manual review state transitions.

Redaction/manual review: review rows require redacted source evidence and explicit manual-review state.

RLS owner/project scoping: scoped read/write; no public access.

Write authorization: insert gate required after future migration/RLS review.

Delete/rollback: rollback available by internal id and audit reason.

## Table: execution_cost_breakdowns

Purpose: store cost details derived from a settlement review. It must not store raw notes or sensitive identifiers.

Allowed fields:

- `id`
- `settlement_review_id`
- `commission`
- `fx_rate`
- `fx_impact`
- `fee_impact_percent`
- `gross_amount`
- `settlement_amount`
- `currency`
- `created_at`
- `updated_at`

Forbidden fields:

- account balances
- unrelated holdings
- raw broker statement text
- raw artifacts
- credentials/session data

Primary key pattern: generated UUID.

Foreign key ideas: `settlement_review_id` references `execution_settlement_reviews`.

RLS owner/project scoping: inherited from parent settlement review and restricted to scoped internal readers.

Write authorization: insert only through the same future gated server path as parent review.

Delete/rollback: rollback with parent review.

## Table: execution_deviation_reviews

Purpose: store classification and reason codes for plan-vs-actual review. Ambiguous cases remain manual-review-first.

Allowed fields:

- `id`
- `settlement_review_id`
- `deviation_classification`
- `reason_codes`
- `requires_manual_review`
- `blocked_reason` nullable
- `reviewed_by_label` nullable
- `reviewed_at` nullable
- `created_at`
- `updated_at`

Forbidden fields:

- raw notes containing personal data or broker identifiers
- raw artifacts
- credentials, cookies, sessions, BankID, MFA
- live order or mutation authority

Primary key pattern: generated UUID.

Foreign key ideas: `settlement_review_id` references `execution_settlement_reviews`.

RLS owner/project scoping: no public access; reviewer-only updates if a reviewer workflow is later approved.

Write authorization: blocked or ambiguous classifications cannot auto-progress.

Delete/rollback: update/delete must be audited and reversible.

## Table: execution_learning_candidates

Purpose: stage possible learning candidates only. This table must not trigger automatic learning, statistics updates, or production persistence.

Allowed fields:

- `id`
- `settlement_review_id`
- `learning_candidate_status`
- `outcome_eligible`
- `requires_separate_learning_gate`
- `blocked_reason` nullable
- `created_at`
- `updated_at`

Rules:

- blocked deviations cannot be learning eligible
- sensitive evidence cannot be learning eligible
- partial fills require manual review before eligibility
- no automatic promotion to learning
- `requires_separate_learning_gate` must remain true unless a later learning-gate task changes the model

RLS owner/project scoping: scoped internal access only.

Write authorization: inserts require future gated server path plus learning candidate gate. Updates that promote eligibility require separate approval.

Delete/rollback: candidates must be discardable without mutating statistics or results.

## Optional Table: execution_redacted_artifacts

Purpose: only if a future artifact strategy requires safe references/metadata. Raw artifact storage remains high risk and should stay out of scope until separately designed.

Allowed fields:

- `id`
- `artifact_kind`
- `redaction_status`
- `storage_reference_safe`
- `sensitive_data_present`
- `created_at`
- `updated_at`

Forbidden fields:

- raw PDF
- raw screenshot
- raw HTML
- raw broker page
- unredacted settlement note
- unredacted broker confirmation
- credentials/session/BankID/cookie data
- customer/account ids

RLS owner/project scoping: no public or broad client access; no raw artifact access from client code.

Write authorization: raw artifact storage must remain disabled by default and requires a separate artifact storage design.

Warning: this optional area is the highest-risk part of the schema and should likely remain blocked until redaction, storage, retention, and deletion are separately reviewed.

## RLS Policy Design

Required RLS principles:

- no public access
- rows scoped by user/project/account context using the existing app auth model if applicable
- service role must not be exposed to client code
- inserts only through a future gated server path
- updates restricted to manual review workflows
- deletes/rollback restricted and audited
- learning candidate promotion requires a separate gate
- no raw artifact table access from client code
- test-only policies reviewed before production

Policy shape, docs-only:

- `select`: only scoped internal users/projects can read safe rows
- `insert`: only a future approved server writer may insert allowlisted/redacted payloads
- `update`: only approved review workflows may change manual-review fields
- `delete`: only approved rollback tooling may delete or tombstone rows with an audit reason

Blockers:

- any public policy
- any client service-role exposure
- any broad `update` or `delete`
- any raw artifact table readable from client code
- any insert path that accepts unallowlisted JSON dumps

## Write Gate Design

Future writes require all of the following:

- explicit task approval
- migration review
- RLS review
- payload allowlist pass
- redaction validator pass
- false-by-default feature flag
- dry-run payload preview
- reviewer sign-off
- rollback/delete plan
- non-production validation first
- separate production gate later

Writes remain blocked if sensitive data, raw artifacts, missing review state, unresolved mismatch, duplicate confirmation, unresolved partial fill, blocked deviation, automatic learning update, or client-side service role exposure is detected.

## Feature Flags

Potential future flags:

```text
ENABLE_POST_TRADE_SETTLEMENT_PERSISTENCE=false
ENABLE_EXECUTION_CONFIRMATION_EVIDENCE_WRITE=false
ENABLE_PLAN_VS_ACTUAL_REVIEW_WRITE=false
ENABLE_EXECUTION_LEARNING_CANDIDATE_WRITE=false
ENABLE_RAW_SETTLEMENT_ARTIFACT_STORAGE=false
```

Rules:

- no flags are changed in this task
- all defaults are false
- never commit these flags true
- raw artifact storage remains blocked by default
- production requires a separate gate
- flags do not bypass redaction, RLS, allowlist, reviewer, or rollback gates

## Migration Strategy, No Migrations

No migration is created in this task.

Future migration strategy:

- schema design doc first
- migration task must be separate
- migration must include rollback
- migration must include RLS
- migration must include tests
- migration must not include seed sensitive data
- migration must be reviewed before apply
- generated Supabase types must be reviewed before app integration
- migration must not add a write path in the same step unless separately approved

## Test Strategy

Future tests should include:

- schema shape tests, if possible
- allowlist-to-schema alignment tests
- forbidden field schema scan tests
- RLS policy text/static tests
- migration lint tests once migration exists
- payload preview tests
- no client/service-role exposure tests
- no Trade UI write path tests
- redaction status constraint tests
- learning candidate no-auto-update tests
- rollback/delete plan tests

## Blockers

Future migration/write is blocked if:

- schema includes never-store fields
- RLS is missing
- service role is exposed
- write path exists from client or Trade UI
- raw artifact storage is requested without separate design
- feature flag is true by default
- rollback/delete plan is missing
- redaction gate is missing
- payload allowlist is missing
- manual review handling is missing
- learning auto-update is allowed
- production write is attempted before non-production validation
- API route activation appears without separate gate
- browser automation, Avanza login, Avanza order-prep, or final order submission is connected to persistence

## No-Migration/No-Write Confirmation

Confirmed for this task:

- no migration files created
- no Supabase client added
- no write helper added
- no API route added
- no Trade UI path added
- no runtime gate opened
- no smoke script run/import added
- no env flags changed
- no `.env.local` values printed
- no app runtime changed
- no browser automation
- no credential, cookie, session, or BankID handling
- no order submission or final BUY/SELL behavior
- no live trade or position mutation

## Related Docs

This design follows:

- `docs/post-trade-persistence-gate-design-no-writes.md`
- `docs/post-trade-persistence-payload-allowlist-tests-checkpoint.md`
- `docs/post-trade-persistence-gate-structural-coverage-review.md`
- `docs/post-trade-lifecycle-milestone-checkpoint.md`
- `docs/settlement-extraction-plan-vs-actual-review-hardening-checkpoint.md`

Follow-up references were added to:

- `docs/post-trade-persistence-gate-structural-coverage-review.md`
- `docs/post-trade-persistence-gate-design-no-writes.md`

Task 380 follow-up: `docs/post-trade-schema-allowlist-alignment-tests-checkpoint.md` adds test-only schema metadata and alignment tests for the proposed table areas. It verifies proposed schema columns map to payload allowlist fields or explicit safe schema metadata, never-store fields remain blocked, RLS/write-gate metadata is required, learning candidates stay staged, and no migrations or writes are introduced.

Task 382 follow-up: `docs/post-trade-supabase-migration-planning-no-migration-files.md` adds a migration-planning-only layer. It defines future phase order, table migration checklists, RLS migration requirements, safety gates, rollback/delete policy, seed data policy, test strategy, write-path separation, feature flag separation, and production blockers while still creating no migration files and performing no writes.

## Static Search Classification

Static search target:

```text
rg -n "execution_confirmation_evidence|execution_settlement_reviews|execution_cost_breakdowns|execution_deviation_reviews|execution_learning_candidates|execution_redacted_artifacts|RLS|policy|migration|Supabase|insert|upsert|update|service role|raw artifact|credentials|password|BankID|cookie|session|accountNumber|customerId|Trade UI execution|API route activation|production readiness" docs tests lib app scripts supabase
```

Expected classification:

- docs-only: schema/RLS design, persistence gate docs, checkpoints, warning language
- tests-only: allowlist, settlement, mock-boundary, route-boundary, import-boundary, and structural specs
- locked: no-write, no-migration, no-runtime gate confirmations
- blocked: raw artifacts, sensitive data, service-role exposure, API route activation, Trade UI execution, production persistence
- future-gated: migrations, RLS policy implementation, write preview, production sanitizer, rollback/delete implementation
- warning: design-only, structural-only, test-only coverage
- blocker: any live write, migration, API activation, Trade UI execution, browser automation, credential/session/BankID handling, or production-ready claim

## Validation

Validation completed for this task:

| Check | Result |
| --- | --- |
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

Static search completed with the requested schema/RLS, Supabase, migration, sensitive-data, runtime-activation, and production-readiness terms.

Static search category counts:

```text
  22 app
 970 docs
 380 lib
   8 scripts
  12 supabase
 138 tests
```

Classification:

- docs-only: this schema/RLS design, persistence gate docs, checkpoints, planning, and warning language
- tests-only: allowlist, settlement, mock-boundary, route-boundary, import-boundary, and structural specs
- locked: no-write, no-migration, no-runtime gate confirmations
- blocked: raw artifacts, sensitive data, service-role exposure, API route activation, Trade UI execution, production persistence
- future-gated: migrations, RLS policy implementation, write preview, production sanitizer, rollback/delete implementation
- warning: design-only, structural-only, test-only coverage
- blocker: none found for this docs-only task

## Final Decision

Final decision: `post_trade_supabase_schema_rls_design_complete_with_warnings`.

The future schema/RLS design is documented. Persistence remains no-write, no-migration, non-runtime, and not production-ready.

Task 381 completed the schema/RLS design milestone checkpoint. Task 382 completed migration planning without migration files.

Recommended next task: Task 383 - Supabase migration readiness checklist, no migration files.

Alternative: Task 383 - Ture Agent Dev Chat 3 continuation summary.

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
