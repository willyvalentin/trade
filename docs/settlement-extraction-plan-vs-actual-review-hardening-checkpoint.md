# Settlement Extraction to Plan-vs-Actual Review Hardening Checkpoint

## Purpose

Task 374 hardens the mock/test-only mapping from settlement extraction results to plan-vs-actual execution review.

The goal is to make BUY entry review and SELL exit review more explicit around planned package inputs, extracted settlement fields, slippage, commission/courtage, FX impact, gross amount reconciliation, total settlement amount / likvidbelopp reconciliation, partial fills, mismatch classification, manual-review classification, blocked sensitive evidence, and locked persistence authority.

Decision: `settlement_extraction_plan_vs_actual_review_hardening_complete_with_warnings`.

Task 375 follow-up: `docs/post-trade-persistence-gate-design-no-writes.md` documents the future persistence gate for post-trade settlement, broker confirmation, and plan-vs-actual review data. It does not add Supabase writes, migrations, API routes, Trade UI execution, or production persistence.

## Scope

In scope:

- test-only planned BUY/SELL package fixture fields
- hardened pure mock review helper in `tests/fixtures/execution-settlement-mock-fixtures.ts`
- focused structural assertions in `tests/e2e/execution-settlement-mock-fixtures.spec.ts`
- source isolation checks
- checkpoint documentation

Out of scope:

- real settlement extraction
- real avräkningsnota access
- browser automation
- Avanza login/order-prep
- credentials, cookies, sessions, or BankID
- order submission
- final KÖP/SÄLJ
- Supabase execution writes
- Trade UI execution
- API route activation
- production readiness

## Existing Coverage Inventory

Existing extraction assertions already covered required mock settlement fields, redacted mock broker evidence, safe authority flags, sensitive marker blocking, missing required fields, impossible math, duplicate confirmations, partial fill misuse, SELL position/exit mismatches, and source isolation.

Existing plan-vs-actual assertions covered basic BUY/SELL classification, partial fill manual review, ticker mismatch blocking, sensitive evidence blocking, and core classification states:

- `execution_match`
- `minor_execution_deviation`
- `major_execution_deviation`
- `requires_manual_review`
- `blocked_sensitive_or_mismatched_evidence`

The main gap was that extraction-to-review mapping did not expose enough review detail for plan package fields, gross reconciliation, total settlement reconciliation, FX impact, commission impact percent, and SELL realized PnL reconciliation.

## New Plan Package Fixtures

BUY planned package now explicitly includes:

- `side: BUY`
- ticker and instrument
- planned quantity
- planned entry price
- stop
- target
- planned risk
- planned reward
- currency
- plan id
- contract id
- `humanFinalRequired: true`
- `noSubmitNoFinalClickContext: true`

SELL planned exit package now explicitly includes:

- `side: SELL`
- ticker and instrument
- planned quantity
- planned exit price
- planned exit reason
- reference entry
- stop
- target
- currency
- position reference id
- plan id
- contract id
- `humanFinalRequired: true`
- `noSubmitNoFinalClickContext: true`
- `noLivePositionMutationContext: true`

## Extraction to Review Helper

`buildPlanVsActualExecutionReview` remains pure/test-only and now exposes:

- planned price
- execution price
- slippage amount
- slippage percent
- fee impact
- commission impact percent
- expected gross amount
- gross amount reconciliation
- expected settlement amount
- settlement amount delta
- settlement amount reconciliation
- FX rate when present
- FX impact
- FX mismatch flag
- expected realized PnL for SELL
- actual realized PnL for SELL
- realized PnL reconciliation
- no-live-position-mutation flag
- deviation classification
- blocked/manual-review reasons

`getSettlementExtractionViolations` now also verifies explicit plan package fields, plan currency, BUY/SELL no-submit/no-final-click context, SELL planned exit reason, SELL plan position reference, SELL reference entry, and SELL no-live-position-mutation context.

## BUY Review Coverage

BUY assertions now verify:

- side and ticker match
- planned quantity vs executed quantity
- planned entry vs execution price
- entry slippage amount and percent
- commission/courtage impact
- commission impact percent
- FX impact when present
- expected gross amount
- gross amount reconciliation
- expected settlement amount
- settlement amount delta
- total settlement reconciliation
- execution match classification
- major classification for gross/settlement/fee deviations
- blocked classification for sensitive evidence, wrong ticker/side, missing required fields, authority escalation, and persistence escalation
- Supabase write authority remains false
- final BUY authority remains false
- order submission authority remains false

## SELL Review Coverage

SELL assertions now verify:

- side, ticker, and position reference match
- planned quantity vs executed quantity
- planned exit price vs execution price
- exit slippage amount and percent
- realized PnL from reference entry, execution price, quantity, and commission
- realized PnL reconciliation
- commission/courtage impact
- FX impact when present
- expected gross amount
- gross amount reconciliation
- expected settlement amount
- settlement amount delta
- total settlement reconciliation
- minor deviation classification for the current safe SELL fixture
- major classification for wrong realized PnL and major FX impact
- blocked classification for sensitive evidence, wrong ticker/side, missing position reference, sell quantity greater than position, missing exit reason, authority escalation, and live position mutation authority
- Supabase write authority remains false
- final SELL authority remains false
- order submission authority remains false
- live position mutation authority remains false

## Deviation Threshold Notes

Mock/test-only thresholds are documented in `mockPlanVsActualDeviationThresholds`:

- exact/near match slippage threshold
- minor slippage threshold
- major fee impact threshold
- major settlement delta threshold
- major gross delta threshold
- major FX impact threshold
- FX mismatch tolerance

These thresholds are not production trading policy. They only protect structural review behavior in the mock settlement fixture layer.

## Negative Tests

Negative coverage includes:

- wrong ticker
- wrong side
- plan side mismatch
- missing ticker
- missing execution price
- missing commission/courtage
- missing settlement amount
- settlement amount mismatch
- gross amount mismatch
- FX impact cases
- partial fill without marker
- partial fill with missing remaining quantity/manual-review marker
- duplicate confirmation
- sensitive evidence
- Supabase write authority
- production persistence authority
- final BUY/SELL authority
- order submission authority
- SELL live position mutation authority
- SELL missing position/plan references
- SELL quantity greater than position
- SELL missing exit reason

## Source Isolation

The fixture/spec source isolation test verifies no restricted imports from:

- smoke scripts
- Avanza bridge/runner modules
- browser helpers
- credential/session helpers
- Supabase clients
- env reads
- fetch
- storage APIs
- Trade UI
- API routes
- app runtime
- process-spawn modules

## What This Proves

- Extracted mock settlement data can be mapped to plan-vs-actual review.
- BUY entry slippage and cost review can be modeled.
- SELL exit slippage and realized PnL review can be modeled.
- Deviation classification handles match, minor, major, manual-review, and blocked states.
- Sensitive or mismatched evidence blocks clean outcomes.
- Supabase and production persistence authority remain locked.
- Source isolation remains intact.

## What This Does Not Prove

- Real avräkningsnota parsing.
- Real PDF/screenshot extraction.
- Real broker confirmation capture.
- Real Avanza/browser interaction.
- Real Supabase persistence.
- Production readiness.
- Tax/accounting correctness.
- Live settlement correctness.
- Actual broker-field mapping.
- Production slippage thresholds.

## Remaining Warnings

- This remains model/test-only.
- Thresholds are mock/test-only and not trading policy.
- The redaction validator remains marker-based.
- No production sanitizer exists.
- No real settlement parser exists.
- No Supabase persistence gate is open.
- No Trade UI execution path is enabled.

## Recommended Next Task

Recommended next task: Task 375 - Post-trade persistence gate design, no writes.

Alternative: Task 375 - Post-trade lifecycle milestone checkpoint, if a summary checkpoint is preferred before persistence planning.

## Validation

Validation completed for this checkpoint:

| Check | Result |
| --- | --- |
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
rg -n "plan-vs-actual|slippage|commission|courtage|FX|gross amount|settlement amount|likvidbelopp|partial fill|duplicate confirmation|execution_match|minor_execution_deviation|major_execution_deviation|requires_manual_review|blocked_sensitive_or_mismatched_evidence|Supabase write|productionPersistenceAllowed|finalBuyAuthority|finalSellAuthority|orderSubmissionAuthority|livePositionMutationAuthority|credential|BankID|cookie|session|Trade UI execution|API route activation|production readiness" tests lib docs app scripts
```

Static search category counts:

```text
  21 app
 683 docs
 255 lib
   7 scripts
 112 tests
```

Classification:

- tests-only: settlement, mock-boundary, and import-boundary structural tests
- fixtures-only: mock settlement, mock boundary, and model helpers
- docs-only: checkpoints, plans, reviews, and warnings
- locked/blocked: authority, persistence, final-click, and Trade UI execution gates
- future-gated: real extraction, broker capture, Supabase persistence, and production readiness
- warning: mock/test-only thresholds and marker-based redaction
- blocker: none found for this structural hardening task
