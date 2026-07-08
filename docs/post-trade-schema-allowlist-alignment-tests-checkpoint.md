# Post-Trade Schema Allowlist Alignment Tests Checkpoint

## Purpose

Task 380 adds test-only schema allowlist alignment fixtures and structural assertions for the future post-trade Supabase schema/RLS design.

The goal is to verify that the docs-only schema design can be represented as metadata, that proposed schema columns align with the existing payload allowlist or explicit schema-only safe metadata, and that never-store fields, authority escalation, raw artifacts, automatic learning promotion, production persistence, and unsafe write metadata remain blocked.

Decision: `post_trade_schema_allowlist_alignment_tests_complete_with_warnings`.

## Scope

In scope:

- `tests/fixtures/post-trade-schema-allowlist-alignment-fixtures.ts`
- `tests/e2e/post-trade-schema-allowlist-alignment.spec.ts`
- test-only schema metadata for proposed post-trade table areas
- schema-to-payload allowlist alignment
- never-store and authority field blocking
- RLS/write-gate metadata assertions
- learning candidate no-auto-promotion assertions
- optional redacted artifact metadata-only assertions
- source isolation verification

Out of scope:

- Supabase writes
- migrations
- API route activation
- Trade UI execution
- real settlement extraction
- real settlement note access
- browser automation
- Avanza login/order-prep
- BankID, credentials, cookies, or sessions
- final BUY/SELL
- order submission
- live trade/position mutation
- production readiness

## Schema Fixtures

The schema design is represented as test-only metadata, not SQL and not a migration.

Covered table areas:

- `execution_confirmation_evidence`
- `execution_settlement_reviews`
- `execution_cost_breakdowns`
- `execution_deviation_reviews`
- `execution_learning_candidates`
- optional `execution_redacted_artifacts`

Each table fixture includes:

- `tableName`
- `allowedColumns`
- `requiredColumns`
- `forbiddenColumns`
- `rlsRequired: true`
- `writeGateRequired: true`
- `productionWriteAllowed: false`
- `rawArtifactStorageAllowed: false`
- `learningAutoPromotionAllowed: false`
- `serviceRoleClientAllowed: false`
- `clientDirectWriteAllowed: false`
- `rollbackRequired: true`
- `redactionGateRequired: true`
- `payloadAllowlistRequired: true`

## Alignment Rules

The alignment tests verify:

- every schema allowed column maps to an existing payload allowlist field or explicit schema-only safe metadata
- required schema columns are present in allowed columns
- required schema columns are not forbidden
- unknown schema columns fail unless explicitly marked schema-safe
- all table fixtures pass `assertPostTradeSchemaAllowlistAligned`

Schema-only safe metadata includes internal database metadata and review metadata such as:

- `id`
- `createdAt`
- `updatedAt`
- `sourceType`
- `environmentLabel`
- `schemaVersion`
- `gateVersion`
- `evidenceKind`
- `evidenceTimestamp`
- `brokerLabel`
- `settlementReviewId`
- `reasonCodes`
- `requiresManualReview`
- `storageReferenceSafe`

## Never-Store Schema Tests

The tests fail if table columns include never-store fields such as:

- credentials/password markers
- BankID/MFA markers
- cookies/session markers
- raw browser storage
- network dumps
- env/service/API tokens
- personal identity numbers
- customer/account identifiers
- account balance
- unrelated holdings
- raw PDF/screenshot/HTML/broker page
- unredacted settlement note
- unredacted broker confirmation
- service role/access/refresh token fields

## Authority/Persistence Schema Tests

The tests fail if schema metadata includes or enables:

- order submission authority
- final BUY/SELL authority
- broker authority
- account binding
- live order intent
- live trade/position mutation authority
- Supabase write authority
- production persistence
- raw artifact storage
- learning auto-update or auto-promotion
- API route activation
- Trade UI execution
- browser automation
- Avanza bridge session
- cookie/session export
- BankID automation

## RLS/Gate Metadata Tests

Every table must require:

- RLS
- write gate
- rollback
- redaction gate
- payload allowlist

Every table must block:

- production writes
- service-role client usage
- client direct writes
- raw artifact storage
- learning auto-promotion

## Learning Candidate Schema Tests

The learning candidate table remains staged only:

- separate learning gate required
- automatic promotion false
- blocked deviation not eligible
- sensitive data not eligible
- partial fill requires manual review
- outcome eligibility default false
- no automatic statistics/learning update

## Optional Redacted Artifact Metadata Tests

The optional artifact table is metadata/reference-only:

- raw artifact storage false
- redaction status required
- sensitive data present false
- safe storage reference only
- no raw PDF/screenshot/HTML/broker page fields

## Source Isolation

The fixture/spec source isolation test verifies no imports from:

- Supabase clients
- migrations
- API routes
- Trade UI
- app runtime
- smoke scripts
- bridge/runner scripts
- browser helpers
- credential/session helpers
- env
- fetch
- storage APIs
- process-spawn modules

## What This Proves

- Schema design can be represented as test-only metadata.
- Schema columns align with the payload allowlist or explicit safe metadata.
- Never-store fields are blocked from schema metadata.
- Authority escalation columns are blocked.
- RLS/write-gate metadata is required.
- Learning candidates remain staged with no auto-promotion.
- Raw artifacts remain blocked.
- No migrations or writes are introduced.

## What This Does Not Prove

- Actual Supabase schema correctness.
- Actual SQL migration correctness.
- Actual RLS policy correctness.
- Real database writes.
- Production persistence.
- Runtime API security.
- Live settlement correctness.
- Real artifact redaction quality.

## Remaining Warnings

- The schema model is metadata-only and not generated from a real database.
- RLS is represented as required metadata, not enforced SQL.
- Future migrations still need independent review, rollback, generated type review, and RLS tests.
- Production persistence remains blocked.
- Raw artifact storage remains blocked.

## Recommended Next Task

Recommended next task: Task 381 - Supabase schema/RLS design milestone checkpoint, no migrations.

Alternative: Task 381 - Supabase migration planning, no migration files.

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

Static search completed with the requested schema/RLS, Supabase, migration, sensitive-data, persistence authority, runtime-activation, and production-readiness terms.

Static search category counts:

```text
  22 app
 971 docs
 366 lib
   8 scripts
  12 supabase
 139 tests
```

Classification:

- docs-only: schema/RLS design, persistence gate docs, checkpoints, planning, and warning language
- tests-only: schema alignment, payload allowlist, settlement, mock-boundary, route-boundary, import-boundary, and structural specs
- fixtures-only: schema alignment metadata and payload allowlist fixtures
- locked: no-write, no-migration, no-runtime gate confirmations
- blocked: raw artifacts, sensitive data, service-role exposure, API route activation, Trade UI execution, production persistence, learning auto-promotion
- future-gated: migrations, RLS policy implementation, write preview, production sanitizer, rollback/delete implementation
- warning: design-only, structural-only, test-only coverage
- blocker: none found for this structural/test-only task

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
