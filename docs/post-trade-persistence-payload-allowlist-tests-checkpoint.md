# Post-Trade Persistence Payload Allowlist Tests Checkpoint

## Purpose

Task 377 adds a test-only payload allowlist model and structural assertions for future post-trade persistence payloads, with no Supabase writes and no runtime activation.

The goal is to prove that only safe, redacted, minimum fields would pass a future write gate, while sensitive fields, raw artifacts, authority escalation, production persistence, automatic learning updates, and unknown fields fail closed.

Decision: `post_trade_persistence_payload_allowlist_tests_complete_with_warnings`.

## Scope

In scope:

- `tests/fixtures/post-trade-persistence-payload-allowlist-fixtures.ts`
- `tests/e2e/post-trade-persistence-payload-allowlist.spec.ts`
- pure/test-only payload categories, fixtures, helpers, and assertions
- source isolation verification
- checkpoint documentation

Out of scope:

- Supabase writes
- migrations
- API routes
- Trade UI execution
- real settlement extraction
- real avräkningsnota access
- browser automation
- Avanza login/order-prep
- BankID, credentials, cookies, or sessions
- final KÖP/SÄLJ
- order submission
- live trade/position mutation
- production readiness

## Payload Categories

The allowlist fixture layer covers:

- settlement review payload
- broker confirmation evidence metadata payload
- cost breakdown payload
- deviation review payload
- manual review status payload
- learning candidate payload, staged only

Task 380 follow-up: `docs/post-trade-schema-allowlist-alignment-tests-checkpoint.md` adds test-only schema metadata and alignment tests that verify proposed post-trade schema columns map to this payload allowlist or explicit schema-only safe metadata. It keeps Supabase writes, migrations, API routes, Trade UI execution, and runtime activation absent.

All payloads remain test-only and do not write to Supabase.

## Allowlist Fields

Allowed core identifiers:

- `internalTradeId`
- `planId`
- `contractId`
- `reviewId`
- `extractionId`
- `redactedEvidenceArtifactId`

Allowed trade/review fields:

- `side`
- `ticker`
- `quantity`
- `plannedPrice`
- `executionPrice`
- `slippage`
- `currency`
- `commission`
- `fxRate`
- `grossAmount`
- `settlementAmount`
- `deviationClassification`
- `manualReviewStatus`
- `extractionTimestamp`
- `reviewedBySafeActorLabel`

Allowed safety fields:

- `redactionStatus`
- `sensitiveDataPresent: false`
- `supabaseWriteAuthority: false`
- `productionPersistenceAllowed: false`
- `rawArtifactStored: false`
- `learningAutoUpdateAllowed: false`

Allowed learning candidate fields, staged only:

- `learningCandidateStatus: staged_manual_review_only`
- `outcomeEligible: false`
- `requiresSeparateLearningGate: true`

## Never-Persist Fields

Sensitive fields rejected:

- credentials/password markers
- BankID/MFA markers
- cookies/session markers
- raw browser storage
- network dumps
- env secrets
- Supabase service keys
- API tokens
- personal identity numbers
- customer/account ids
- account balance
- unrelated holdings

Raw artifact fields rejected:

- raw PDF
- raw screenshot
- raw HTML
- raw broker page
- unredacted settlement note
- unredacted broker confirmation

Authority/runtime fields rejected:

- order submission authority
- final BUY/SELL authority
- broker authority
- account binding
- live order intent
- live trade mutation authority
- live position mutation authority
- Supabase write authority
- production persistence allowed
- raw artifact stored
- automatic learning update
- API route activation
- Trade UI execution
- browser automation
- Avanza bridge session
- cookie/session export
- BankID automation

Unknown fields fail closed unless explicitly added to the allowlist.

## Validator and Helper Summary

`assertPostTradePersistencePayloadAllowlisted` and `getPostTradePersistencePayloadAllowlistViolations` are pure/test-only helpers that:

- allow only explicit allowlisted keys
- reject unknown keys
- reject never-persist keys
- reject sensitive markers
- reject authority escalation
- reject raw artifact storage
- reject production persistence
- reject automatic learning updates
- require safe redaction status
- require `sensitiveDataPresent: false`
- require `supabaseWriteAuthority: false`
- require `productionPersistenceAllowed: false`
- require `rawArtifactStored: false`
- enforce category-specific required fields
- enforce staged learning candidate rules

`containsForbiddenPersistenceField` detects exact never-persist keys.

`buildMockSafeSettlementReviewPayload` and `buildMockLearningCandidatePayload` return safe fixture copies and do not write anywhere.

## Positive Tests

Positive tests verify that these safe payloads pass:

- settlement review payload
- broker confirmation evidence metadata payload
- cost breakdown payload
- deviation review payload
- manual review status payload
- staged learning candidate payload

## Negative Tests

Negative tests reject:

- sensitive fields
- raw artifacts
- customer/account/person identifiers
- account balance and unrelated holdings
- env/service/API secrets
- authority escalation
- runtime/API activation markers
- production persistence
- raw artifact storage
- automatic learning update
- missing internal ids
- missing side/ticker/quantity/execution price
- missing deviation classification
- missing redaction status
- `sensitiveDataPresent: true`
- manual-review deviation not flagged for manual review
- blocked deviation not marked blocked
- unknown fields

## Learning Candidate Safety

Learning candidates pass only when:

- `learningCandidateStatus` is `staged_manual_review_only`
- `learningAutoUpdateAllowed` is false
- `requiresSeparateLearningGate` is true
- `outcomeEligible` is false
- no sensitive data is present
- production persistence is false
- deviation is not blocked

Learning candidates are rejected if they request automatic learning updates, skip the separate learning gate, mark blocked deviations eligible, include sensitive data, enable production persistence, or use a non-staged status.

## Source Isolation

The allowlist fixture/spec source isolation test verifies no restricted imports from:

- Supabase clients
- API routes
- Trade UI
- app runtime
- smoke scripts
- bridge/runner scripts
- browser helpers
- credential/session helpers
- env reads
- fetch
- storage APIs
- process-spawn modules

## What This Proves

- Future post-trade persistence payloads can be allowlist-validated.
- Sensitive fields are rejected.
- Raw artifacts are rejected.
- Authority escalation is rejected.
- Production persistence is rejected.
- Automatic learning update is rejected.
- Learning candidate payloads remain staged/manual-review-only.
- Supabase writes remain absent.
- Source isolation remains intact.

## What This Does Not Prove

- Real Supabase writes.
- Schema/RLS correctness.
- Migration correctness.
- Production persistence.
- Real settlement artifact storage.
- Real broker confirmation capture.
- Real avräkningsnota parser.
- Full accounting/tax correctness.
- Live trading correctness.

## Remaining Warnings

- This remains test-only.
- No schema or RLS policy exists for these payloads.
- No migration exists.
- No write preview route exists.
- No production sanitizer exists.
- Learning candidates remain staged only and cannot update learning automatically.
- Future persistence still requires a separate gate.

## Recommended Next Task

Recommended next task: Task 378 - Post-trade persistence gate structural coverage review.

Alternative: Task 378 - Supabase schema/RLS design, no migrations.

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

Static search completed:

```text
rg -n "post_trade|persistence|payload|allowlist|Supabase|insert|upsert|update|service key|credentials|password|BankID|MFA|cookie|session|rawPdf|rawScreenshot|rawHtml|rawBrokerPage|unredacted|customerId|accountNumber|personalIdentityNumber|orderSubmissionAuthority|finalBuyAuthority|finalSellAuthority|learningAutoUpdateAllowed|productionPersistenceAllowed|Trade UI execution|API route activation" tests lib docs app scripts
```

Static search category counts:

```text
  24 app
 968 docs
 406 lib
   8 scripts
 140 tests
```

Classification:

- tests-only: allowlist, settlement, mock-boundary, and route/import boundary tests
- fixtures-only: allowlist fixture/model helpers and mock settlement helpers
- docs-only: checkpoints, reviews, plans, and future-gated warnings
- locked/blocked: Supabase write, authority escalation, production persistence, raw artifacts, Trade UI execution, and API route activation
- future-gated: schema/RLS, migrations, write previews, real broker capture, and production persistence
- warning: no-write/test-only coverage
- blocker: none found for this structural hardening task

## Out of Scope

- No Supabase writes.
- No migrations.
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
