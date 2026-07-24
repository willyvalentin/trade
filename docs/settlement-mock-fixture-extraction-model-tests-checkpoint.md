# Settlement Mock Fixture and Extraction Model Tests Checkpoint

## Purpose

Task 371 adds test-only mock settlement fixtures and extraction/model assertions for the settlement / broker confirmation lifecycle defined in Task 370.

This is structural test/model hardening only. It does not implement runtime settlement extraction, Avanza access, broker access, browser automation, credential/session handling, order submission, Supabase writes, API activation, or Trade UI execution.

Decision: `settlement_mock_fixture_extraction_model_tests_complete_with_warnings`.

Task 374 follow-up: `docs/settlement-extraction-plan-vs-actual-review-hardening-checkpoint.md` hardens the mock plan-vs-actual review helper beyond the original extraction model by adding explicit planned package fields, gross/settlement reconciliation outputs, FX impact, commission impact percent, SELL realized PnL reconciliation, and stronger negative assertions.

## Scope

In scope:

- mock broker confirmation evidence objects
- mock settlement note artifact objects
- BUY settlement extraction fixture
- SELL settlement extraction fixture
- plan-vs-actual review helper
- execution cost breakdown fields
- deviation classification
- redaction/sensitive field validator
- partial fill and mismatch modeling
- locked Supabase write authority assertions
- source isolation assertions

Out of scope:

- real settlement extraction
- real avräkningsnota access
- real PDF/screenshot extraction
- real browser automation
- real broker confirmation capture
- real Avanza login or order-prep
- BankID handling
- credential access
- cookie/session handling
- final KÖP/SÄLJ
- order submission
- Supabase execution writes
- live trade mutation
- live position mutation
- Trade UI execution
- API route activation
- production readiness

## Fixtures Created

Created `tests/fixtures/execution-settlement-mock-fixtures.ts`.

The fixture module defines test-only/pure models:

- `MockBrokerConfirmationEvidence`
- `MockSettlementNoteArtifact`
- `MockSettlementExtractionResult`
- `MockPlanVsActualExecutionReview`
- `MockExecutionCostBreakdown`
- `MockExecutionDeviationClassification`

Fixture coverage:

- `mockBuySettlementExtractionFixture`
- `mockSellSettlementExtractionFixture`
- `mockPartialFillSettlementExtractionFixture`
- `mockMismatchSettlementExtractionFixture`

BUY fixture highlights:

- side BUY
- mock ticker/instrument
- safe quantity
- planned entry and actual execution price
- execution timestamp and evidence timestamp
- currency, gross amount, commission/courtage, total settlement amount / likvidbelopp
- mock broker/source labels only
- redacted broker reference
- redaction status safe
- authority locks false
- redacted evidence only
- no credentials, BankID, cookie/session, browser storage, network dump, order submission, final click, or Supabase write

SELL fixture highlights:

- side SELL
- mock ticker/instrument
- safe quantity
- planned exit and actual execution price
- position reference and plan reference
- exit reason
- realized PnL mock
- round-trip fee summary
- live position mutation authority false
- no live position mutation true
- same safety and persistence locks as BUY

## Extraction Assertions

The fixture module exposes:

- `getSettlementExtractionViolations`
- `assertSettlementExtractionSafe`

Assertions verify:

- side exists and is BUY/SELL
- artifact/evidence side matches extraction side
- ticker/instrument exists
- quantity is positive
- execution price is positive
- execution timestamp exists
- currency exists
- gross amount exists
- commission/courtage exists
- total settlement amount exists
- broker/source label is mock-only
- evidence timestamp exists
- redaction status is safe
- forbidden sensitive data is absent
- broker authority is false
- account binding is false
- live order intent is false
- order submission authority is false
- final KÖP/SÄLJ authority is false
- Supabase execution write authority is false
- production persistence is false
- redacted evidence only is true
- credential/BankID/cookie-session/browser-storage/network-dump safety flags remain true

## Plan-vs-Actual Assertions

The fixture module exposes `buildPlanVsActualExecutionReview`.

BUY checks:

- ticker matches plan
- side matches plan
- quantity matches plan or is marked partial fill
- planned entry vs actual execution price calculates entry slippage
- commission is captured
- settlement amount reconciles
- deviation classification is produced

SELL checks:

- ticker matches plan and position reference
- side matches exit plan
- quantity matches plan/position or is marked partial fill
- planned exit vs actual execution price calculates exit slippage
- realized PnL is represented in the mock fixture
- commission is captured
- settlement amount reconciles
- live position mutation remains disabled
- deviation classification is produced

Deviation classes covered:

- `execution_match`
- `minor_execution_deviation`
- `requires_manual_review`
- `blocked_sensitive_or_mismatched_evidence`

`major_execution_deviation` is included in the model vocabulary for future expansion.

## Redaction Validator

The fixture module exposes:

- `containsForbiddenSettlementSensitiveData`
- `assertSettlementArtifactRedacted`

The validator blocks:

- credentials
- BankID data
- cookie/session token
- raw browser storage
- network dump
- account/customer id
- full personal identity data
- env secret
- Supabase service key
- unredacted raw PDF/screenshot artifact marker

## Negative Tests

Created `tests/e2e/execution-settlement-mock-fixtures.spec.ts`.

Negative coverage rejects or blocks:

- credentials present
- BankID data present
- cookie/session token present
- raw browser storage present
- network dump present
- account/customer id unredacted
- full personal identity data
- env secret
- Supabase service key
- unredacted raw artifact marker
- Supabase write authority true
- production persistence allowed true
- broker authority true
- account binding true
- live order intent true
- order submission authority true
- final BUY authority true
- final SELL authority true
- live position mutation authority true for SELL
- wrong side
- wrong ticker
- quantity mismatch without partial-fill marker
- missing execution price
- missing commission
- missing settlement amount
- impossible settlement math
- duplicate confirmation marker
- missing settlement artifact
- partial fill treated as full fill
- SELL missing position reference
- SELL missing exit reason

## Source Isolation

The focused spec verifies that settlement fixtures/spec imports avoid:

- smoke scripts
- Avanza bridge/runner modules
- browser helpers
- credential/session helpers
- Supabase clients
- env reads
- fetch calls
- storage APIs
- Trade UI imports
- API route imports
- app runtime imports
- process-spawn imports

## What This Proves

- Mock BUY/SELL settlement artifacts can be represented safely.
- Extraction models require the core settlement fields.
- Redaction validator blocks sensitive data markers.
- Plan-vs-actual review can classify basic deviations.
- Partial fill and mismatch cases are caught.
- Supabase write authority remains locked.
- Source isolation remains intact.

## What This Does Not Prove

- Real Avanza avräkningsnota parsing.
- Real PDF/screenshot extraction.
- Real browser automation.
- Real broker confirmation capture.
- Real Supabase persistence.
- Production readiness.
- Tax correctness.
- Full accounting correctness.
- Live settlement correctness.

## Remaining Warnings

- The fixtures are mock/test-only.
- The extraction model is not production code.
- The redaction validator is structural and marker-based, not a full sanitizer.
- No real settlement artifact parser exists from this task.
- Supabase persistence remains locked.
- Production readiness remains blocked.

## Validation

Validation run for this checkpoint:

| Check | Result |
| --- | --- |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-settlement-mock-fixtures.spec.ts --reporter=line` | Pass, 9 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts --reporter=line` | Pass, 5 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-mock-boundary-contract-fixtures.spec.ts --reporter=line` | Pass, 10 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line` | Pass, 27 passed |
| `./node_modules/.bin/tsc --noEmit` | Pass |
| `npm run lint` | Pass |
| `git diff --check` | Pass |
| `git diff -- .env.local --exit-code` | Pass |
| `git diff -- app/trade-app.tsx --exit-code` | Pass |
| `find docs -type f -size 0` | Pass |

Static search:

```text
rg -n "settlement|avräkningsnota|broker confirmation|execution price|commission|courtage|FX|likvidbelopp|plan-vs-actual|redacted|credential|BankID|cookie|session|browser storage|network dump|account id|customer id|Supabase write|productionPersistenceAllowed|finalBuyAuthority|finalSellAuthority|orderSubmissionAuthority|livePositionMutationAuthority|Trade UI execution|API route activation|production readiness" tests lib docs app scripts
```

Static search category counts:

```text
  21 app
 735 docs
 277 lib
   7 scripts
 114 tests
```

Expected classification:

- tests-only: new settlement spec and related structural tests
- fixtures-only: mock settlement fixture module
- docs-only: checkpoint and lifecycle documentation
- locked/blocked: authority and persistence gates
- future-gated: real settlement extraction and Supabase persistence
- warning: model-only limitations
- blocker: none expected

## Recommended Next Task

Recommended next task: Task 372 - Settlement redaction and mismatch negative-case expansion.

Alternative: Task 372 - Post-trade lifecycle structural coverage review.

## Final Decision

Final decision: `settlement_mock_fixture_extraction_model_tests_complete_with_warnings`.

The warnings are model/test-only warnings. No runtime gates were opened and no execution capability was introduced.

## Task 372 Follow-Up

Task 372 expanded redaction, mismatch, partial-fill, deviation-classification, SELL position/exit-risk, and authority/persistence negative cases in `tests/fixtures/execution-settlement-mock-fixtures.ts` and `tests/e2e/execution-settlement-mock-fixtures.spec.ts`.

The expansion remains structural/model-only. It does not add real settlement extraction, real avräkningsnota access, browser automation, Avanza access, order submission, final KÖP/SÄLJ, Supabase writes, API activation, or Trade UI execution.
