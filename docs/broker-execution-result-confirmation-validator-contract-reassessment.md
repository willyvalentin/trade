# BrokerExecutionResult Confirmation Validator Contract Reassessment

## 1. Purpose

Reassess the BrokerExecutionResult confirmation validator contract types before
any runtime validator implementation.

Action 461 created
`lib/broker-execution-result-confirmation-validator-contract.ts` as a
type/constant-only contract module. This reassessment verifies that the module
remains conservative, aligned with the validator design, and disconnected from
runtime validation, mapping, BrokerExecutionResult creation, persistence, audit
append, trade mutation, browser automation, and Avanza behavior.

## 2. Current contract inventory

Contract module:

- `lib/broker-execution-result-confirmation-validator-contract.ts`

Version:

- `BROKER_EXECUTION_RESULT_CONFIRMATION_VALIDATOR_CONTRACT_VERSION`
- value: `broker_execution_result_confirmation_validator_v1`

Exported input types:

- `BrokerExecutionResultConfirmationValidatorInput`
- `BrokerExecutionResultConfirmationInstrumentExpectation`
- `BrokerExecutionResultConfirmationPriceExpectation`
- `BrokerExecutionResultConfirmationBrokerAccountExpectation`

The input contract can represent:

- raw `AvanzaConfirmationEvidence`.
- upstream `AvanzaConfirmationEvidenceValidationResult`.
- broker result source classification.
- optional source classification validation result.
- intended side.
- intended instrument identity, including ticker, instrument name, ISIN,
  instrument id, market, and currency.
- intended quantity.
- intended price/limit assumptions.
- handoff payload fingerprint.
- expected Avanza account context.
- mapping policy version.
- optional policy snapshot.

Exported result/status types:

- `BrokerExecutionResultConfirmationValidationResult`
- `BrokerExecutionResultConfirmationValidationStatus`

Statuses:

- `confirmed_candidate`
- `rejected`
- `needs_review`
- `partial_fill_review`
- `unsupported`

Rejection reasons:

- `evidence_rejected`
- `evidence_needs_review`
- `source_not_confirmation_capable`
- `source_not_production_safe`
- `missing_handoff_fingerprint`
- `broker_reference_missing`
- `instrument_mismatch`
- `side_mismatch`
- `quantity_mismatch`
- `price_invalid`
- `timestamp_invalid`
- `provenance_missing`
- `partial_fill_ambiguous`
- `unsupported_broker`
- `automatic_mode_not_allowed`

Warnings:

- `confidence_below_review_threshold`
- `account_context_missing`
- `optional_fee_missing`
- `optional_market_missing`
- `manual_review_required`
- `mapping_policy_missing`
- `persistence_not_attempted`
- `trade_mutation_not_attempted`

Policy snapshot:

- `BrokerExecutionResultConfirmationPolicySnapshot`
- records contract version, mode, source classification, optional source
  policy rule, required evidence/reference/fingerprint flags, automatic-mode
  exclusion, and default no-persistence/no-trade-mutation policy.

Evidence snapshot reference:

- `BrokerExecutionResultConfirmationEvidenceSnapshotReference`
- records evidence fingerprint, capture id, request id, source type, source
  page flow identifier, source classification, timestamps, upstream validation
  status, upstream rejection reasons, and upstream warnings.

Fingerprint input summary:

- `BrokerExecutionResultConfirmationFingerprintInputSummary`
- can carry handoff payload fingerprint, evidence fingerprint, broker order
  references, instrument identity, side, quantity, price, currency,
  confirmation timestamp, capture id, request id, and provenance hash.

Mode/execution assumptions:

- `BrokerExecutionResultConfirmationMode`
- allowed modes are `semi_auto_manual_confirmed` and `manual_confirmed`.
- automatic mode is not represented as an allowed mode and is also modeled as a
  rejection reason.

Safety flags:

- `safeToConvert: boolean`
- `safeToPersist: false`
- `safeToMutateTrade: false`
- `brokerExecutionResultCreated: false`
- `mapperRan: false`
- `persistenceAttempted: false`
- `tradeMutationAttempted: false`
- `auditAppendAttempted: false`
- `browserAutomationAttempted: false`

## 3. Boundary verification

Type-only/constants-only:

- The module exports constants and TypeScript types.
- It has only type imports from evidence, evidence validator, source
  classification, and source classification validator modules.
- It contains no executable validator, mapper, capture, persistence, or
  mutation function.

No runtime validator:

- There is no `validateBrokerExecutionResultConfirmation(...)` function.
- No validation ordering, timestamp parsing, source policy lookup, or field
  comparison logic was implemented.

No mapper:

- There is no evidence-to-BrokerExecutionResult mapper.
- The contract can describe mapper readiness, but does not create mapped
  output.

No BrokerExecutionResult creation:

- No BrokerExecutionResult object or candidate is built.
- `brokerExecutionResultCreated` is explicitly typed as `false`.

No capture/OCR/browser extraction:

- The module does not import browser, Avanza, OCR, bridge, or capture helpers.
- Evidence is represented only as an already-supplied input type.

No persistence/write:

- No Supabase client is imported.
- No localStorage, database, route, or write helper exists.
- `persistenceAttempted` is explicitly typed as `false`.

No Supabase/audit/trade/browser/Avanza behavior:

- No Supabase behavior exists.
- No audit append exists.
- No trade mutation exists.
- No browser automation exists.
- No Avanza behavior exists.

## 4. Alignment with validator design

Statuses:

- The contract statuses match the design exactly:
  `confirmed_candidate`, `rejected`, `needs_review`,
  `partial_fill_review`, and `unsupported`.

Rejection reasons:

- The contract includes the full rejection reason set from the design,
  including evidence status, source capability/safety, handoff fingerprint,
  broker references, intent mismatch, invalid price/timestamp/provenance,
  partial-fill ambiguity, unsupported broker, and automatic-mode rejection.

Validation layer representation:

- Evidence validation is represented by `evidenceValidationResult`.
- Source classification is represented by `sourceClassification` and optional
  `sourceClassificationResult`.
- Source/evidence origin is represented through the raw evidence and evidence
  snapshot reference fields.
- Broker references are represented in the raw evidence and fingerprint input
  summary.
- Trade intent matching is represented by intended side, intended instrument,
  intended quantity, and intended price.
- Handoff linkage is represented by `handoffPayloadFingerprint`.
- Policy and mapping readiness are represented by the policy snapshot and
  mapping policy version.

Needs-review behavior representation:

- `needs_review` is a first-class status.
- The warning list includes confidence, account context, manual review, and
  mapping policy warnings.
- Needs-review output still cannot be persistence-safe because
  `safeToPersist` remains typed as `false`.

Partial-fill review representation:

- `partial_fill_review` is a first-class status.
- `partial_fill_ambiguous` is a rejection reason.
- The contract does not model any full-fill conversion from partial-fill
  evidence.

Idempotency/fingerprint representation:

- `BrokerExecutionResultConfirmationFingerprintInputSummary` captures the
  intended deterministic ingredients for future duplicate checks and
  conversion provenance.
- Durable duplicate lookup remains outside this contract and belongs to later
  persistence boundaries.

Evidence snapshot/provenance representation:

- Evidence fingerprint, capture id, request id, source type, source page flow,
  source classification, captured timestamp, confirmation timestamp, upstream
  validation status, warnings, and rejection reasons are represented.
- Raw browser/session extraction is not represented as behavior.

Safe-to-convert/persist/mutate semantics:

- `safeToConvert` remains a boolean because the future runtime validator may
  allow conversion only for confirmed candidates.
- `safeToPersist` is typed as `false`.
- `safeToMutateTrade` is typed as `false`.

## 5. Safety policy verification

`confirmed_candidate` is not persistence approval:

- The status exists only as confirmation eligibility for future conversion.
- The result contract still forces `safeToPersist=false`.

`safeToPersist` remains false:

- The result type requires `safeToPersist: false`.
- The policy snapshot also records `safeToPersistDefault: false`.

`safeToMutateTrade` remains false:

- The result type requires `safeToMutateTrade: false`.
- The policy snapshot also records `safeToMutateTradeDefault: false`.

Mapper still does not exist:

- The contract can describe mapper readiness, but no mapper implementation or
  mapped BrokerExecutionResult output exists.

Execution record creation remains separate:

- The contract does not import or build `ExecutionRecordCandidate`.
- Execution-record creation, persistence validation, Supabase write readiness,
  and duplicate lookup remain downstream boundaries.

Trade mutation remains separate:

- `tradeMutationAttempted` is typed as `false`.
- No live/history trade state updates are modeled or implemented.

Automatic mode remains out of scope:

- Allowed modes are semi-auto/manual-confirmed only.
- `automatic_mode_not_allowed` remains an explicit rejection reason.

## 6. Remaining gaps before runtime validator

- No runtime BrokerExecutionResult confirmation validator exists.
- No evidence-to-BrokerExecutionResult mapper contract types exist.
- No mapper implementation exists.
- No Avanza capture/readback implementation exists.
- No real broker evidence acquisition exists.
- No persistence integration exists.
- No trade mutation integration exists.
- No production authority exists for assigning `production_safe_candidate`.
- No policy exists for partial-fill accounting or multiple-fill mapping.
- No durable duplicate lookup exists at this confirmation boundary.

## 7. Candidate next actions

A. Create BrokerExecutionResult Confirmation Validator

- highest direct payoff after contract creation.
- would implement pure validation against the newly defined contract.
- must remain no-mapper, no-persistence, no-trade-mutation, and no-browser.

B. Create Evidence-to-BrokerExecutionResult Mapper Contract Types

- safe type-only continuation.
- useful before mapper implementation, especially for output shape and
  partial-fill semantics.
- lower immediate payoff than validating the confirmation contract.

C. Reassess Avanza Broker Confirmation Capture Readiness

- useful, but closer to browser/Avanza behavior.
- should wait until pure validation has a stable contract and implementation.

D. Create Avanza Confirmation Capture Manual QA Checklist

- useful for manual review workflows.
- less foundational than a pure confirmation validator.

## 8. Recommended next action

**Action 463 - Create BrokerExecutionResult Confirmation Validator**

Rationale:

- The validator design and contract types now exist.
- A pure validator is the next safe implementation step because it can consume
  the existing evidence validator result and source classification policy
  without mapping, persistence, Supabase writes, audit append, trade mutation,
  browser automation, or Avanza behavior.
- The validator must remain conservative and should return typed confirmation
  results only.

## 9. Risk assessment

Contract mistaken for runtime validation risk:

- medium/high. The module is policy shape only; it does not enforce anything
  until a runtime validator consumes it.

`confirmed_candidate` mistaken for persistence approval risk:

- high. The contract mitigates this with `safeToPersist=false`, but future UI
  and docs must keep the copy explicit.

`safeToConvert` overtrust risk:

- medium/high. Even future `safeToConvert=true` must only mean mapper
  eligibility, not persistence or trade mutation approval.

Mapper running too early risk:

- high. Mapper implementation must require successful confirmation validation
  and must not run on rejected, unsupported, needs-review, or partial-fill
  review statuses.

Partial-fill ambiguity risk:

- high. Partial-fill evidence remains review-only until accounting, duplicate
  handling, and trade-state effects are designed.

Provenance gap risk:

- high. Missing evidence fingerprint, capture context, or handoff linkage can
  produce spoofing or duplicate-detection gaps.

Trade mutation coupling risk:

- high. Confirmation validation must not open, close, or mutate trades.

## 10. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No validator implementation, mapper
implementation, BrokerExecutionResult creation, capture/OCR/browser
extraction, persistence/write behavior, Supabase behavior, audit append, trade
mutation, browser behavior, or Avanza behavior was added.

## Action 463 Follow-Up

Action 463 created
`lib/broker-execution-result-confirmation-validator.ts`.

Validator result:

- Added a pure deterministic BrokerExecutionResult confirmation validator.
- The validator consumes the existing Avanza evidence validation result,
  source classification policy, raw evidence, intended trade context, handoff
  fingerprint, and execution mode.
- It returns typed confirmation validation results only.
- It rejects or routes to review for unsafe source policy, rejected/review
  evidence, missing handoff fingerprint, missing broker references, automatic
  mode, intent mismatches, invalid price/timestamp/provenance, and ambiguous
  partial fills.
- A valid path returns `confirmed_candidate` with `safeToConvert=true`,
  `safeToPersist=false`, and `safeToMutateTrade=false`.

Safety result:

- No mapper or BrokerExecutionResult creation was added.
- No capture/OCR/browser extraction was added.
- No persistence/write behavior, Supabase behavior, audit append, trade
  mutation, UI wiring, browser behavior, or Avanza behavior was added.

Next recommended action:

**Action 464 - Reassess BrokerExecutionResult Confirmation Validator**

## Action 464 Follow-Up

Action 464 created
`docs/broker-execution-result-confirmation-validator-reassessment.md`.

Reassessment result:

- Verified `lib/broker-execution-result-confirmation-validator.ts` is pure,
  deterministic, and confirmation-only.
- Confirmed it uses upstream evidence validation, source classification policy,
  and intended trade/handoff context.
- Confirmed it creates no BrokerExecutionResult, mapper output, execution
  record, persistence write, audit append, trade mutation, UI wiring, capture,
  browser automation, or Avanza behavior.
- Confirmed `confirmed_candidate` is conversion eligibility only:
  `safeToConvert=true`, `safeToPersist=false`, and
  `safeToMutateTrade=false`.

Next recommended action:

**Action 465 - Create Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 465 Follow-Up

Action 465 created
`lib/evidence-to-broker-execution-result-mapper-contract.ts`.

Contract-chain impact:

- The confirmation validator contract now has a downstream mapper contract
  target.
- Mapper result contracts keep `safeToPersist=false`,
  `safeToMutateTrade=false`, `brokerExecutionResultCreated=false`, and
  `mapperImplemented=false`.
- No runtime mapper, conversion, persistence, audit append, trade mutation, UI,
  capture/browser, or Avanza behavior was added.

Next recommended action:

**Action 466 - Reassess Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 466 Follow-Up

Action 466 created
`docs/evidence-to-broker-execution-result-mapper-contract-reassessment.md`.

Contract-chain impact:

- The mapper contract was verified as conservative and no-write/no-mutation.
- `safeToPersist=false`, `safeToMutateTrade=false`,
  `brokerExecutionResultCreated=false`, and `mapperImplemented=false` remain
  explicit.
- Runtime conversion remains absent.

Next recommended action:

**Action 467 - Create BrokerExecutionResult Candidate Type/Shape Reassessment**
