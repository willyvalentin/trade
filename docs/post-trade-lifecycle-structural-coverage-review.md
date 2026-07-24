# Post-Trade Lifecycle Structural Coverage Review

## Summary

Purpose: review the post-trade settlement / broker-confirmation structural coverage added across Tasks 370-372 and decide the safest next step.

Scope: review/decision only. This review does not add runtime code, execute new scenarios, open runtime gates, start browser automation, access Avanza, fetch a real avräkningsnota, handle credentials/cookies/sessions/BankID, submit orders, click final KÖP/SÄLJ, write Supabase execution records, activate API routes, or add Trade UI execution.

Review decision: `post_trade_lifecycle_structural_coverage_review_complete_with_warnings`.

Task 374 follow-up: `docs/settlement-extraction-plan-vs-actual-review-hardening-checkpoint.md` now hardens the mock/test-only extraction-to-plan-vs-actual mapping with explicit BUY/SELL planned package fields, slippage, commission/courtage, FX impact, gross/settlement reconciliation, SELL realized PnL reconciliation, deviation thresholds, and expanded negative assertions.

Task 375 follow-up: `docs/post-trade-persistence-gate-design-no-writes.md` defines the future post-trade persistence gate. It remains docs/model only and adds no Supabase write, migration, API route, Trade UI execution path, or production persistence.

Warning basis: the track is structurally strong for mock/model safety, but it remains model/test-only. It has no real parser, no production sanitizer, no broker capture, no persistence gate, and no live settlement correctness proof.

## Coverage Inventory

| File | Exists | Purpose | Covers | Blocks | Does not cover | Last known result | Warnings | Blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `docs/settlement-broker-confirmation-lifecycle-checkpoint.md` | Yes | Lifecycle checkpoint | Planned package, human-final action, broker evidence, settlement artifact, reconciliation, Supabase gate | Agent final click, order submission, BankID, cookie/session export, Supabase writes, production readiness | Fixtures, extraction helpers, real parsing, persistence | `settlement_broker_confirmation_lifecycle_checkpoint_complete_with_warnings` | Docs/model only | None |
| `docs/settlement-mock-fixture-extraction-model-tests-checkpoint.md` | Yes | Task 371 checkpoint | Mock BUY/SELL fixtures, extraction assertions, plan-vs-actual model, redaction validator, source isolation | Sensitive markers, authority escalation, basic mismatches, Supabase write authority | Real parser, production sanitizer, real broker capture | Settlement spec 9 passed at Task 371; superseded by Task 372 11 passed | Model/test only | None |
| `docs/settlement-redaction-mismatch-negative-case-expansion-checkpoint.md` | Yes | Task 372 checkpoint | Expanded redaction, mismatch, partial-fill, SELL position/exit, deviation, authority/persistence coverage | Broader sensitive data leakage and persistence/authority escalation | Real parsing, live settlement, accounting/tax correctness | Settlement spec 11 passed | Model/test only | None |
| `tests/fixtures/execution-settlement-mock-fixtures.ts` | Yes | Test-only model/helper layer | Mock confirmation evidence, settlement artifact, extraction result, cost breakdown, review classification | Sensitive markers, required-field gaps, math mismatches, partial-fill misuse, SELL inconsistency, persistence authority | Production types, real sanitizer, real broker field mapping | Covered by settlement spec | Test-only marker-based model | None |
| `tests/e2e/execution-settlement-mock-fixtures.spec.ts` | Yes | Structural regression tests | BUY/SELL positives, negative redaction/mismatch/partial-fill/authority cases, source isolation | Runtime imports, unsafe authority, sensitive markers, clean classification for unsafe data | Real scenarios, browser automation, Avanza, Supabase writes | 11 passed | Static/structural only | None |

## Lifecycle Coverage Summary

| Lifecycle area | Covered by | Strength | Remaining limitation |
| --- | --- | --- | --- |
| Planned trade package | Task 370 docs, settlement fixtures | Medium | Mock-only shape; no production contract binding yet |
| Human-final broker action model | Task 370 docs, authority flags | Strong structurally | No real broker observation or audit trail |
| Broker confirmation evidence model | Task 370 docs, `MockBrokerConfirmationEvidence` | Medium | Mock-only; no real capture/readback |
| Settlement / avräkningsnota artifact model | Task 370 docs, `MockSettlementNoteArtifact` | Medium | No real PDF/screenshot/parser ingestion |
| Extraction result model | `MockSettlementExtractionResult`, settlement spec | Strong for required mock fields | No production extractor |
| Execution cost breakdown | `MockExecutionCostBreakdown`, gross/commission/total checks | Medium | Simplified fees/taxes/FX |
| Plan-vs-actual review | `buildPlanVsActualExecutionReview` | Strong for structural outcomes | Needs more mapping edge cases |
| Deviation classification | Settlement spec | Medium/strong | Thresholds are mock-only |
| Redaction policy | Docs plus marker validator | Strong for markers | Not a production sanitizer |
| Partial fill/mismatch handling | Fixtures/spec | Medium | Manual-review-first; remaining quantity simplified |
| Locked Supabase write gate | Docs, authority flags, tests | Strong | Schema/RLS gate not designed here |

## BUY Settlement Coverage

BUY coverage includes a safe mock settlement fixture with side, ticker/instrument, planned entry, actual execution price, quantity, timestamps, currency, gross amount, commission/courtage, total settlement amount / likvidbelopp, mock broker/source labels, redaction status, redacted reference, and all authority/persistence locks.

BUY assertions cover required extraction fields, entry slippage, commission capture, cost basis via gross/total settlement math, settlement amount reconciliation, sensitive data blocking, final BUY authority rejection, order submission authority rejection, and mismatch cases such as wrong side, wrong ticker, missing planned entry, missing actual entry, missing quantity, missing commission, missing settlement amount, impossible math, duplicate confirmation, and missing artifact.

Remaining BUY gaps:

- no real avräkningsnota parser
- no production sanitizer
- no real FX/courtage edge cases
- no real broker field mapping
- no Supabase persistence gate

## SELL Settlement Coverage

SELL coverage includes a safe mock settlement fixture with side, ticker/instrument, planned exit, actual execution price, quantity, timestamps, currency, gross amount, commission/courtage, settlement total, position reference, plan reference, exit reason, realized PnL mock, round-trip fee summary, no-live-position-mutation flags, and all authority/persistence locks.

SELL assertions cover exit slippage, realized PnL representation, commission capture, settlement reconciliation, position/exit consistency, no live position mutation, sensitive data blocking, final SELL authority rejection, order submission rejection, livePositionMutationAuthority rejection, missing position reference, missing exit reason, missing stop/target, missing realized PnL, position ticker/instrument mismatch, sell quantity greater than position, and SELL side/action mismatch.

Remaining SELL gaps:

- no real position ledger integration
- no production realized PnL accounting
- no tax/corporate-action adjustments
- partial close modeling remains simplified
- SELL remains higher risk and should stay manual-review-first for mismatches

## Redaction and Sensitive-Boundary Coverage

| Boundary | Covered by | Classification behavior | Remaining limitation |
| --- | --- | --- | --- |
| Credentials | Fixture sensitive markers/spec | Blocked sensitive/mismatched evidence | Marker-based only |
| Password-like fields | Task 372 expansion | Blocked | Marker-based only |
| BankID | Fixture sensitive markers/spec | Blocked | No real BankID handling, intentionally |
| MFA | Task 372 expansion | Blocked | Marker-based only |
| Cookies/sessions | Fixture sensitive markers/spec | Blocked | No real session inspection |
| Raw browser storage | Fixture sensitive markers/spec | Blocked | Static marker only |
| Network dumps | Fixture sensitive markers/spec | Blocked | Static marker only |
| Customer/account/person identifiers | Task 372 expansion | Blocked | No production PII scanner |
| Account balance | Task 372 expansion | Blocked | Marker-based only |
| Unrelated holdings | Task 372 expansion | Blocked | Marker-based only |
| Env secrets | Fixture sensitive markers/spec | Blocked | Static marker only |
| Supabase service keys | Fixture sensitive markers/spec | Blocked | Static marker only |
| API tokens | Task 372 expansion | Blocked | Marker-based only |
| Raw PDF markers | Task 372 expansion | Blocked | No real PDF parser |
| Sensitive screenshots | Task 372 expansion | Blocked | No image OCR/sanitizer |

## Deviation Classification Coverage

| Class | Trigger examples | Test coverage | Remaining ambiguity | Future improvement |
| --- | --- | --- | --- | --- |
| `execution_match` | BUY fixture with clean math and tiny slippage | Explicit spec assertion | Threshold is mock-only | Bind thresholds to product/risk policy |
| `minor_execution_deviation` | SELL fixture with small exit slippage | Explicit spec assertion | Fee/FX tolerance simplified | Add fee/FX thresholds |
| `major_execution_deviation` | Large BUY price move or high fee ratio | Explicit spec assertion | Real thresholds not defined | Add policy-driven tolerance model |
| `requires_manual_review` | Partial fill | Explicit spec assertion | Partial fill reconciliation simplified | Model remaining quantity and follow-up actions |
| `blocked_sensitive_or_mismatched_evidence` | Sensitive marker, wrong ticker/side, missing required fields | Explicit spec assertion | Production sanitizer absent | Add production-grade redaction/mismatch design |

## Partial Fill and Duplicate Confirmation Coverage

Covered:

- partial fill cannot be treated as full fill
- partial fill requires a partial-fill marker
- partial fill requires executed quantity
- remaining quantity must be derivable or manual-review-marked
- wrong partial-fill ticker blocks clean review
- duplicate confirmation blocks
- missing settlement artifact blocks/manual-review classification

Future modeling still needed:

- remaining-position state
- multiple partial fills
- later completion of partial fill
- duplicate detection beyond explicit marker
- broker reference/idempotency strategy

Partial fills should remain manual-review-first until a dedicated remaining-quantity and follow-up-action model exists.

## Authority and Persistence Coverage

| Protection | Covered by | Current state | Remaining limitation |
| --- | --- | --- | --- |
| Supabase write authority | Fixture flags/spec | Locked false; true rejected | No schema/RLS persistence gate |
| Production persistence | Fixture flags/spec | Locked false; true rejected | No production persistence path |
| Broker authority | Fixture flags/spec | False; true rejected | No real broker authority model |
| Account binding | Fixture flags/spec | False; true rejected | No account matching allowed yet |
| Live order intent | Fixture flags/spec | False; true rejected | No runtime intent |
| Order submission authority | Fixture flags/spec | False; true rejected | Agent submit remains forbidden |
| Final KÖP/SÄLJ authority | BUY/SELL authority flags/spec | False; true rejected | Human-only final action remains invariant |
| `livePositionMutationAuthority` | SELL authority/spec | False; true rejected | No live position mutation |
| Automatic result/statistics/learning update | Task 372 coupling guard/spec | Absent/false; true rejected | Future gate required |

## Source Isolation Review

Current source isolation verifies settlement fixtures/tests do not import:

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

Confidence: high for static import isolation of the fixture/spec layer. It does not prove unrelated repo files are execution-safe.

## What This Track Proves

- Mock BUY/SELL settlement artifacts can be represented safely.
- Extraction model requires core fields.
- Redaction validator blocks broad sensitive data markers.
- Plan-vs-actual review can classify basic deviations.
- Partial fill/mismatch cases are caught.
- Authority/persistence escalation is blocked.
- SELL position/exit mismatch risks are better covered.
- Supabase write authority remains locked.
- Source isolation remains intact.

## What This Track Does Not Prove

- Real avräkningsnota parsing.
- Real PDF/screenshot extraction.
- Real broker confirmation capture.
- Real Avanza/browser interaction.
- Real Supabase persistence.
- Production readiness.
- Tax correctness.
- Accounting correctness.
- Live settlement correctness.
- Actual broker-field mapping.
- Real FX/courtage edge cases.

## Remaining Gaps

| Gap | Severity | Why not blocker now | Required before production/livelike phase | Suggested task |
| --- | --- | --- | --- | --- |
| No real parser | High | Current scope is model/test-only | Parser design, redaction-first extraction, fixture corpus | Settlement extraction mapping hardening |
| No production sanitizer | High | Marker validator is enough for structural tests | Redaction engine, PII scanner, artifact handling policy | Redaction policy tests/design |
| No real broker capture | High | Browser/broker access forbidden now | Capture contract, manual approval, redacted evidence flow | Broker confirmation capture planning |
| No Supabase persistence gate | High | Writes intentionally locked | Schema/RLS/redaction/rollback approval | Supabase persistence gate design |
| No schema/RLS review | High | No writes exist | Schema and RLS review | Supabase persistence gate design |
| No real settlement artifact ingestion | High | No artifact access allowed | Safe ingestion boundary and artifact quarantine | Artifact ingestion plan |
| No real broker confirmation UI detection | Medium/high | Mock-only is sufficient now | UI signal pack and redaction gate | Broker-boundary planning |
| No audit trail persistence | Medium/high | Persistence locked | Audit schema and append-only policy | Persistence gate design |
| No accounting/tax validation | Medium | Product MVP can stay manual-review-first | Accounting/tax domain model | Accounting correctness review |
| Partial fills simplified | Medium | Manual-review-first blocks unsafe clean outcomes | Remaining quantity and multi-fill model | Partial-fill lifecycle model |
| SELL higher risk | High | Current tests block common mismatches | Position ledger integration and stricter exit review | SELL reconciliation hardening |

## Regression Protection Assessment

| Area | Current protection | Confidence | Suggested improvement |
| --- | --- | --- | --- |
| Redaction regression | Broad marker tests for artifacts/evidence/extraction | Medium/high | Add production sanitizer design and fixtures |
| Mismatch regression | Side/ticker/quantity/price/cost/math tests | High for mock layer | Add extraction-to-review mapping edges |
| Partial fill regression | Manual-review-first and misuse tests | Medium | Add multi-fill and remaining-position fixtures |
| Authority escalation | Authority flags and negative tests | High | Keep adding source scans around future code |
| Supabase write protection | Flags, route/import boundary tests, diff checks | High for current scope | Add schema/RLS gate before any write |
| Source isolation | Import scan in settlement spec plus global boundary specs | High for fixture/spec layer | Add import boundary test if production module appears |
| `.env.local` / `app/trade-app.tsx` diff protection | Explicit `git diff --exit-code` checks | High | Keep mandatory validation |

## Next-Phase Options

Option A: Settlement extraction mapping to plan-vs-actual review hardening.

- Purpose: refine extraction-to-review mapping and add more edge cases.
- Risk: low.
- Assessment: best next step if continuing post-trade structural hardening.

Option B: Supabase persistence gate design, no writes.

- Purpose: plan schema/RLS/redaction/write-gate without writing.
- Risk: medium.
- Assessment: important before persistence, but less immediate than strengthening mapping.

Option C: Avanza-boundary planning, no execution.

- Purpose: plan more realistic broker boundary.
- Risk: medium/high.
- Assessment: should wait until persistence/redaction gate is designed.

Option D: Ture Agent Dev Chat 3 continuation summary.

- Purpose: package this work for a new chat.
- Risk: low.

Option E: Pause execution track and return to product/engine.

- Risk: low.

## Recommended Next Task

Recommended next task: Task 374 - Settlement extraction to plan-vs-actual review hardening.

Reasoning: it strengthens the post-trade lifecycle without runtime, binds extraction results more tightly to plan-vs-actual outcomes, and is safer than moving directly to Supabase persistence or Avanza-boundary work.

Alternative: Task 374 - Supabase persistence gate design, no writes, if the project wants to plan persistence next.

## Blockers

Current blockers: none for this review-only task.

Blockers for future phases:

- real sensitive data introduced
- real Avanza/settlement artifact accessed
- Supabase write path introduced without a gate
- production persistence allowed
- authority escalation accepted
- source isolation failure
- unexpected `.env.local` change
- unexpected `app/trade-app.tsx` change
- validation failure
- language implying production readiness

## Validation

Validation completed for this review:

| Check | Result |
| --- | --- |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-settlement-mock-fixtures.spec.ts --reporter=line` | Pass, 11 passed |
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
rg -n "settlement|avräkningsnota|broker confirmation|execution price|commission|courtage|FX|likvidbelopp|plan-vs-actual|redacted|credential|password|BankID|MFA|cookie|session|browser storage|network dump|account id|customer id|personnummer|Supabase write|service key|productionPersistenceAllowed|finalBuyAuthority|finalSellAuthority|orderSubmissionAuthority|livePositionMutationAuthority|Trade UI execution|API route activation|production readiness" tests lib docs app scripts
```

Static search category counts:

```text
  22 app
 760 docs
 278 lib
   7 scripts
 116 tests
```

Classification:

- tests-only: settlement and boundary tests
- fixtures-only: mock fixture/model helpers
- docs-only: lifecycle/review/checkpoints
- locked/blocked: authority and persistence gates
- future-gated: real extraction, broker capture, and Supabase persistence
- warning: model-only limitations
- blocker: none found for this review-only task

## Final Decision

Final decision: `post_trade_lifecycle_structural_coverage_review_complete_with_warnings`.

This review found no current blockers. The warnings are architectural readiness warnings: the post-trade lifecycle is structurally covered at mock/model level, but real parsing, real redaction, broker capture, persistence, accounting/tax correctness, and production readiness remain explicitly out of scope and future-gated.

## Out of Scope

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
- No Supabase execution write.
- No live trade mutation.
- No live position mutation.
- No Trade UI execution.
- No API route activation.
- No production readiness.
