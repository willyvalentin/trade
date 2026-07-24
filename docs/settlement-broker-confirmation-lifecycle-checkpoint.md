# Settlement / Broker Confirmation Lifecycle Checkpoint

## 1. Summary

Purpose: define the future post-human-final trade lifecycle for broker confirmation evidence, settlement / avräkningsnota extraction, plan-vs-actual reconciliation, and later result/statistics/learning updates.

Scope: docs/model/checkpoint only. This checkpoint does not implement runtime code, route code, browser automation, Avanza access, settlement-note fetching, evidence storage, extraction helpers, Supabase writes, or Trade UI execution.

No real broker, Avanza, settlement, confirmation, account, credential, cookie, session, or BankID access occurs in this checkpoint. No new scenarios are run. No runtime gates are opened. No smoke scripts are run or imported.

Checkpoint decision: `settlement_broker_confirmation_lifecycle_checkpoint_complete_with_warnings`.

Warning basis: the lifecycle is defined only as documentation. Future implementation still needs mock settlement fixtures, extraction tests, redaction validators, and separate Supabase schema/RLS/persistence gates before any result mutation can exist.

## 2. Lifecycle Model

### A. Planned Trade Package

A future planned trade package is the pre-human-final intent record. It may be derived from a selected recommendation BUY or a live-position SELL/exit, but it must remain non-authoritative until the user manually performs the broker action.

Expected fields:

- selected recommendation id or live position exit id
- side: BUY or SELL
- ticker/instrument
- planned quantity
- planned entry price or planned exit price
- stop and target context
- reward:risk and risk summary
- plan id / contract id
- explicit `humanFinalRequired: true`
- explicit agent final-click prohibition

The planned package does not prove execution. It is the comparison baseline for later broker confirmation and settlement evidence.

### B. Human-Final Broker Action

The user manually clicks final KÖP/SÄLJ at the broker. The agent does not click the final button and does not submit an order.

Broker confirmation is external evidence of what the broker reports after the user action. It is not agent authority, not permission for automation, and not proof that future result/statistics writes may happen automatically.

### C. Broker Confirmation Evidence

Future broker confirmation evidence may include a confirmation screen, confirmation note, order receipt, or other broker-side receipt. It must be captured only if safe and redacted.

Evidence rules:

- no credentials, cookies, session tokens, BankID data, or browser storage
- no retained customer id, account number, or full personal identity data
- no sensitive screenshots unless fully redacted
- no network dumps
- broker/order references retained only if redacted or demonstrably safe
- local diagnostic evidence remains non-authoritative until reviewed

### D. Settlement / Avräkningsnota Artifact

A future settlement artifact may contain:

- execution date/time
- settlement date
- instrument, ticker, and ISIN if available
- side BUY/SELL
- quantity
- execution price
- gross amount
- courtage / commission
- FX rate
- currency
- total settlement amount / likvidbelopp
- fees or taxes if relevant
- broker reference / order id only if safe or redacted

Raw PDFs, screenshots, or broker exports are sensitive by default. They must be redacted before any storage or sharing.

### E. Plan-vs-Actual Reconciliation

Future reconciliation compares the planned package to broker/settlement evidence:

- planned price vs execution price
- planned quantity vs executed quantity
- planned risk basis vs realized risk basis
- slippage
- fee/courtage impact
- FX impact when relevant
- partial fill / mismatch detection
- wrong side, wrong ticker, wrong quantity, or wrong account indicators
- deviation classification: none, minor, major, blocker

Reconciliation can produce a local diagnostic review, but it must not mutate production result/statistics/learning state without a later explicit gate.

### F. Result / Statistics / Learning Update

Future Supabase execution, result, statistics, and learning writes remain locked until a separate gate. Future learning updates remain locked until a separate gate.

Local diagnostic/model-only evidence may exist, but it must be non-authoritative. Production result mutation remains blocked.

## 3. Data Model Proposal

The following TypeScript-like pseudocode is docs-only. It is not implemented here.

```ts
type BrokerConfirmationEvidence = {
  evidenceId: string;
  sourceLabel: "broker_confirmation_screen" | "broker_confirmation_note" | "order_receipt";
  capturedAt: string;
  brokerLabel: string;
  side?: "BUY" | "SELL";
  ticker?: string;
  quantity?: number;
  displayedPrice?: number;
  displayedCurrency?: string;
  redactedBrokerReference?: string;
  redactedArtifactRef?: string;
  redactionStatus: "redacted" | "safe_summary_only" | "blocked_sensitive";
  sensitiveFieldsPresent: string[];
  localDiagnosticAllowed: boolean;
  supabaseWriteBlockedUntilGate: true;
};

type SettlementNoteArtifact = {
  artifactId: string;
  sourceLabel: "settlement_note" | "avrakningsnota" | "broker_statement";
  evidenceTimestamp: string;
  executionTimestamp?: string;
  settlementDate?: string;
  instrument: string;
  ticker?: string;
  isin?: string;
  side: "BUY" | "SELL";
  quantity: number;
  executionPrice: number;
  currency: string;
  grossAmount: number;
  commission: number;
  fxRate?: number;
  totalSettlementAmount: number;
  fees?: ExecutionCostBreakdown;
  redactedBrokerReference?: string;
  redactionStatus: "redacted" | "safe_summary_only" | "blocked_sensitive";
  localDiagnosticAllowed: boolean;
  supabaseWriteBlockedUntilGate: true;
};

type SettlementExtractionResult = {
  extractionId: string;
  artifactId: string;
  status: "extracted" | "partial" | "blocked_sensitive" | "invalid";
  requiredFieldsPresent: string[];
  missingRequiredFields: string[];
  extracted: SettlementNoteArtifact;
  warnings: string[];
  blockedReasons: string[];
  localDiagnosticAllowed: boolean;
  supabaseWriteBlockedUntilGate: true;
};

type PlanVsActualExecutionReview = {
  reviewId: string;
  planId: string;
  contractId?: string;
  evidenceId: string;
  extractionId?: string;
  sideMatches: boolean;
  tickerMatches: boolean;
  quantityMatches: boolean;
  partialFill: boolean;
  plannedPrice: number;
  executionPrice: number;
  slippageAmount: number;
  slippagePercent: number;
  feeImpact: number;
  fxImpact?: number;
  deviationClassification: ExecutionDeviationClassification;
  requiresManualReview: boolean;
  blockedReasons: string[];
  supabaseWriteBlockedUntilGate: true;
};

type ExecutionCostBreakdown = {
  grossAmount: number;
  commission: number;
  fxRate?: number;
  fxAmount?: number;
  taxes?: number;
  exchangeFees?: number;
  totalSettlementAmount: number;
  currency: string;
};

type ExecutionDeviationClassification =
  | "execution_match"
  | "minor_execution_deviation"
  | "major_execution_deviation"
  | "requires_manual_review"
  | "blocked_sensitive_or_mismatched_evidence";
```

Sensitive fields include credentials, BankID data, cookies, session tokens, raw browser storage, Avanza customer ids, account numbers, full personal identity data, account balances, unrelated holdings, raw note files/screenshots, env secrets, Supabase service keys, unredacted broker references, and unredacted account/customer identifiers.

All proposed types are allowed only as local diagnostic models when redacted. All are blocked from Supabase until a separate persistence gate.

## 4. Required Extracted Fields

Minimum required for future correctness:

- side
- ticker/instrument
- quantity
- execution price
- execution timestamp/date
- currency
- gross amount
- commission/courtage
- total settlement amount
- broker/source label
- evidence timestamp

Useful optional fields:

- FX rate
- settlement date
- order id / broker reference, redacted
- ISIN
- venue
- order type
- partial fill marker
- taxes/fees
- exchange fee
- note file reference, redacted

## 5. Redaction Policy

Never save unredacted:

- credentials
- BankID data
- cookies
- session tokens
- raw browser storage
- network dumps
- Avanza customer id
- account number
- full personal identity data
- account balance
- holdings not relevant to the trade
- raw PDFs/screenshots containing sensitive account data
- env secrets
- Supabase service keys

May be stored only if redacted or safe:

- ticker
- side
- quantity
- execution price
- commission/courtage
- FX rate
- settlement amount
- timestamp
- redacted broker reference
- redacted note artifact id
- plan id / contract id

## 6. Plan-vs-Actual Checks

Future checks:

- ticker matches plan
- side matches plan
- quantity matches plan or is a valid partial fill
- execution price is within expected tolerance
- stop/target context is still valid
- commission/courtage is captured
- FX is captured if non-SEK/USD conversion is relevant
- settlement amount reconciles
- no unexpected fees
- no wrong account indicator
- no duplicate confirmation
- no missing settlement artifact
- no sensitive data retained

Deviation classes:

- `execution_match`
- `minor_execution_deviation`
- `major_execution_deviation`
- `requires_manual_review`
- `blocked_sensitive_or_mismatched_evidence`

## 7. BUY vs SELL Settlement Differences

BUY:

- confirms position opening
- compares actual entry against planned entry
- calculates entry slippage
- calculates initial cost basis
- confirms quantity for future risk/position tracking

SELL:

- confirms exit, close, or partial close
- compares actual exit against planned target, stop, or manual exit
- calculates realized PnL
- calculates exit slippage
- calculates total round-trip fees
- confirms position reduction or close
- is higher risk because position and exit consistency must be reconciled

## 8. Partial Fill and Mismatch Handling

Partial fill policy:

- must not be treated as full execution
- requires quantity reconciliation
- may require remaining position state
- must be marked manual review unless fully modeled

Mismatch policy:

- wrong ticker, side, quantity, account, or price outside tolerance blocks automatic result updates
- mismatch requires manual review
- mismatch must not update learning as a clean outcome

## 9. Supabase Write Gate

All Supabase execution, result, statistics, and learning writes remain locked.

Settlement extraction may be modeled docs/test-only first. Any future persistence requires a separate gate with:

- schema review
- RLS review
- sensitive data review
- redaction review
- rollback plan
- manual approval

No current state in this checkpoint allows Supabase execution writes, result writes, statistics writes, or learning writes.

## 10. Test Fixture Future Direction

Recommended future test-only fixtures:

- mock broker confirmation evidence
- mock settlement note artifact
- mock BUY settlement extraction
- mock SELL settlement extraction
- mock partial fill
- mock mismatch
- mock redacted artifact

This checkpoint does not implement those fixtures. It recommends a follow-up fixture/model test task.

## 11. Safety Invariants

- Agent final KÖP/SÄLJ remains forbidden.
- Agent order submission remains forbidden.
- BankID automation remains forbidden.
- Cookie/session export remains forbidden.
- Credential logging/storage remains forbidden.
- Supabase writes remain locked.
- Production readiness remains blocked.
- Broker confirmation does not imply agent authority.
- Settlement evidence does not imply automatic result write.
- Live trade mutation remains forbidden.
- Live position mutation remains forbidden.
- Trade UI execution remains forbidden.
- API route activation remains forbidden.

## 12. Next-Phase Options

Option A: Settlement mock fixture and extraction model tests.

- Purpose: create test-only settlement fixtures and extraction assertions.
- Risk: low.
- Recommendation: next step.

Option B: Broker confirmation evidence redaction policy tests.

- Purpose: ensure sensitive fields are blocked or redacted.
- Risk: low.

Option C: Avanza-boundary planning, no execution.

- Purpose: plan more realistic Avanza-boundary behavior without running it.
- Risk: medium.
- Recommendation: wait until the settlement model exists.

Option D: Product/engine pause.

- Purpose: pause execution-track work.
- Risk: low.

## 13. Recommended Next Task

Recommended next task: Task 371 - Settlement mock fixture and extraction model tests.

Reasoning: this strengthens the post-trade lifecycle without opening Avanza, browser automation, runtime gates, Supabase writes, API activation, or Trade UI execution. It gives settlement/confirmation the same testable boundary shape as BUY/SELL mapping.

## 14. Blockers

Blockers for any future phase:

- language implying the agent may submit orders
- language implying the agent may click final KÖP/SÄLJ
- language allowing BankID automation
- language allowing cookie/session export
- unredacted sensitive data retention
- Supabase write activation
- production readiness claim
- runtime/browser/Avanza execution introduced without a separate gate

Current blockers: none for docs-only checkpoint completion.

Current warnings:

- no settlement fixtures exist from this checkpoint
- no extraction model is implemented from this checkpoint
- no redaction validator is implemented from this checkpoint
- no Supabase persistence gate is open

## 15. Validation

Validation run for this checkpoint:

| Check | Result |
| --- | --- |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts --reporter=line` | Pass, 5 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-mock-boundary-contract-fixtures.spec.ts --reporter=line` | Pass, 10 passed |
| `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line` | Pass, 27 passed |
| `./node_modules/.bin/tsc --noEmit` | Pass |
| `npm run lint` | Pass |
| `git diff --check` | Pass |
| `git diff -- .env.local --exit-code` | Pass |
| `git diff -- app/trade-app.tsx --exit-code` | Pass |
| `find docs -type f -size 0` | Pass |

Static search required:

```text
rg -n "settlement|avräkningsnota|broker confirmation|confirmation|execution price|commission|courtage|FX|likvidbelopp|plan-vs-actual|Supabase write|KÖP|SÄLJ|submit|BankID|credential|cookie|session|production readiness|Trade UI execution|API route activation" docs tests lib app scripts
```

Static search category counts:

```text
  24 app
 757 docs
 340 lib
   7 scripts
 135 tests
```

Classification expectation:

- docs-only: expected for checkpoint/planning material
- tests-only: expected for boundary fixtures/specs
- locked: expected for Supabase/API/Trade UI gate language
- blocked: expected for forbidden automation/submission language
- future-gated: expected for settlement extraction, redaction, and persistence
- warning: expected where docs mention readiness or future real-world paths
- blocker: none expected from this checkpoint

## 16. Out of Scope

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

## 17. Final Decision

Final decision: `settlement_broker_confirmation_lifecycle_checkpoint_complete_with_warnings`.

No runtime blockers were introduced. The warnings are implementation-readiness warnings only: settlement fixtures, extraction models, redaction validators, and Supabase persistence gates are still future work.

Recommended next task: Task 371 - Settlement mock fixture and extraction model tests.

## Task 371 Follow-Up

Task 371 added test-only settlement mock fixtures and extraction/model assertions in `tests/fixtures/execution-settlement-mock-fixtures.ts` and `tests/e2e/execution-settlement-mock-fixtures.spec.ts`, with checkpoint documentation in `docs/settlement-mock-fixture-extraction-model-tests-checkpoint.md`.

This follow-up remains structural/model-only. It does not add real settlement extraction, real avräkningsnota access, browser automation, Avanza access, order submission, final KÖP/SÄLJ, Supabase writes, API activation, or Trade UI execution.

## Task 372 Follow-Up

Task 372 hardened the test-only settlement redaction and mismatch layer with broader sensitive-data markers, stronger mismatch/partial-fill checks, explicit deviation-class coverage, and additional authority/persistence escalation blockers.

This follow-up remains structural/model-only and keeps the Task 370 lifecycle gates locked.
