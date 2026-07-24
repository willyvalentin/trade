# BrokerExecutionResult Candidate Contract Reassessment

## 1. Purpose

Reassess the BrokerExecutionResult candidate contract before mapper
implementation.

Action 468 created
`lib/broker-execution-result-candidate-contract.ts` as a type/constant-only
module. This reassessment verifies that the contract remains conservative,
aligned with the candidate shape reassessment and mapping design, and
disconnected from runtime mapping/conversion, BrokerExecutionResult creation,
execution records, persistence, and trade mutation.

This action is documentation-only. It adds no runtime code, no refactor, no
mapper implementation, no conversion implementation, no BrokerExecutionResult
creation, no execution-record creation, no persistence/write behavior, no
Supabase behavior, no audit append, no trade mutation, no UI wiring, no
capture/OCR/browser extraction, no browser automation, and no Avanza behavior.

## 2. Current contract inventory

Contract module:

- `lib/broker-execution-result-candidate-contract.ts`

Version and status exports:

- `BROKER_EXECUTION_RESULT_CANDIDATE_CONTRACT_VERSION`
- `BrokerExecutionResultCandidateContractVersion`
- `BROKER_EXECUTION_RESULT_CANDIDATE_STATUSES`
- `BrokerExecutionResultCandidateStatus`

Status values:

- `confirmed_candidate`
- `needs_review`
- `partial_fill_review`
- `unsupported`

Source and broker types:

- `BROKER_EXECUTION_RESULT_CANDIDATE_BROKERS`
- `BrokerExecutionResultCandidateBroker`
- `BrokerExecutionResultCandidateSource`

Instrument, execution, and price types:

- `BrokerExecutionResultCandidateInstrument`
- `BrokerExecutionResultCandidateExecution`
- `BrokerExecutionResultCandidatePrice`
- `BrokerExecutionResultCandidateBrokerReferences`
- `BrokerExecutionResultCandidateAccountContext`

Provenance and field mapping types:

- `BrokerExecutionResultCandidateProvenance`
- `BrokerExecutionResultCandidateFieldMapping`

Fingerprint input types:

- `BrokerExecutionResultCandidateFingerprintInput`

Partial-fill types:

- `BrokerExecutionResultCandidatePartialFill`

Warnings and review flags:

- `BROKER_EXECUTION_RESULT_CANDIDATE_WARNINGS`
- `BrokerExecutionResultCandidateWarning`
- `BROKER_EXECUTION_RESULT_CANDIDATE_REVIEW_FLAGS`
- `BrokerExecutionResultCandidateReviewFlag`

Safety policy:

- `BrokerExecutionResultCandidateSafetyPolicy`
- `BROKER_EXECUTION_RESULT_CANDIDATE_DEFAULT_SAFETY_POLICY`

Top-level candidate:

- `BrokerExecutionResultCandidate`

The candidate type includes broker/source classification, broker references,
instrument identity, side/quantity/order status, execution price/currency,
confirmation and captured timestamps, provenance, field mapping, fingerprint
input, optional account context, optional partial-fill data, warnings, review
flags, optional mapper provenance, and safety policy metadata.

## 3. Boundary verification

Type-only/constants-only:

- The module exports literal constants and TypeScript types.
- Imports are type-only except for the default safety policy constant.
- No functions or runtime mapping helpers were added.

No mapper implementation:

- No evidence-to-result mapper function exists.
- No Avanza evidence is transformed into a candidate at runtime.

No conversion:

- The contract does not convert evidence into runtime
  `BrokerExecutionResult` values.
- The existing mapper contract still has `mapperImplemented=false`.

No runtime BrokerExecutionResult creation:

- The candidate is explicitly documented as not a runtime
  BrokerExecutionResult.
- `brokerExecutionResultCreated` remains `false` in the safety policy.

No execution-record creation:

- The candidate is separate from `ExecutionRecordCandidate`.
- `executionRecordCreated` remains `false`.

No persistence/write:

- `safeToPersist` remains `false`.
- `persistenceAttempted` remains `false`.
- No Supabase client, insert route, durable duplicate lookup, or storage path
  was added.

No trade mutation:

- `safeToMutateTrade` remains `false`.
- `tradeMutationAttempted` remains `false`.
- The contract is not live/history trade state approval.

No audit/browser/Avanza behavior:

- `auditAppendAttempted` remains `false`.
- `browserAutomationAttempted` remains `false`.
- No capture, OCR, browser extraction, browser automation, or Avanza behavior
  was added.

No UI wiring:

- The contract is not displayed or invoked by UI.
- No mapped candidate preview UI exists yet.

## 4. Alignment verification

Candidate shape reassessment:

- The contract implements the candidate shape requirements from
  `docs/broker-execution-result-candidate-shape-reassessment.md`.
- It models broker, source classification, confirmation status, broker order
  references, confirmation/fill/execution identifiers, instrument identity,
  side, quantity, execution price, currency, order type, confirmation
  timestamp, captured timestamp, provenance, field mapping, fingerprint input,
  handoff fingerprint, warnings/review flags, partial-fill information, and
  explicit no-write/no-mutation policy.

Evidence-to-BrokerExecutionResult mapping design:

- Status values align with the design's conservative outcomes:
  `confirmed_candidate`, `needs_review`, `partial_fill_review`, and
  `unsupported`.
- Partial fills are modeled as review-oriented candidate state, not full-fill
  persistence approval.
- Provenance, field confidence, source classification, capture metadata, and
  fingerprint inputs are carried forward.

Mapper contract types:

- The candidate contract references mapper field mapping snapshots,
  mapper warnings, mapper contract version, mapped field names, and mapper
  provenance snapshots by type.
- The mapper itself remains unimplemented and still does not create runtime
  BrokerExecutionResults.

Confirmation validator output:

- The candidate can represent downstream outputs from confirmed validation by
  carrying confirmation validator status, warnings, fingerprint summaries, and
  validation timestamps.
- `confirmed_candidate` remains conversion eligibility, not persistence or
  trade mutation approval.

Execution-record boundary:

- The candidate is upstream of execution-record creation.
- It does not include persistence result semantics, Supabase write status,
  trade mutation status, or execution-record insert output.
- Execution-record validation, persistence validation, duplicate lookup, audit
  append, and trade mutation remain separate downstream boundaries.

## 5. Safety policy verification

The default safety policy explicitly states:

- `notExecutionRecord: true`
- `notPersistenceApproval: true`
- `notTradeMutationApproval: true`
- `safeToPersist: false`
- `safeToMutateTrade: false`
- `brokerExecutionResultCreated: false`
- `executionRecordCreated: false`
- `persistenceAttempted: false`
- `tradeMutationAttempted: false`
- `auditAppendAttempted: false`
- `browserAutomationAttempted: false`

Safety conclusions:

- The candidate is not a runtime BrokerExecutionResult execution.
- The candidate is not an execution record.
- The candidate is not persistence approval.
- The candidate is not trade mutation approval.
- Automatic mode remains out of scope.
- Persistence, audit append, and trade mutation require separate future
  validators, schemas, routes, and review.

## 6. Remaining gaps before mapper implementation

No mapper implementation:

- No function maps validated Avanza evidence into
  `BrokerExecutionResultCandidate`.

No runtime candidate creation:

- No runtime flow creates the new candidate type.

No mapped candidate preview UI:

- Existing preview UI remains separate from this contract.
- A mapped candidate preview would need explicit read-only/no-write labels.

No Avanza capture/readback implementation:

- Evidence capture/readback remains future work.
- No OCR/browser extraction or Avanza automation exists here.

No real broker evidence acquisition:

- The contract assumes evidence has already been captured and validated.
- Production-safe evidence acquisition remains unresolved.

No execution-record persistence integration:

- The execution-record persistence boundary, schema application, duplicate
  lookup, and server write route remain separate.

No trade mutation integration:

- Live/history trade mutation remains entirely separate and blocked.

## 7. Candidate next actions

A. Create Evidence-to-BrokerExecutionResult Mapper

- Highest direct payoff after contract reassessment.
- Should remain pure and conservative.
- Must return candidate/status metadata only and still avoid runtime
  BrokerExecutionResult creation, persistence, audit append, and trade
  mutation.

B. Create Mapped BrokerExecutionResult Candidate Preview Design

- Useful before UI wiring.
- Lower risk than implementation if mapper uncertainty remains high.

C. Reassess Avanza Broker Confirmation Capture Readiness

- Important for production evidence acquisition.
- Higher risk because capture/readback touches browser and Avanza readiness.

D. Create Avanza Confirmation Capture Manual QA Checklist

- Useful operational prep.
- Lower direct code payoff than mapper work.

## 8. Recommended next action

Recommended next action:

**Action 470 - Create Evidence-to-BrokerExecutionResult Mapper**

Rationale:

- The candidate contract is now explicit enough to serve as the mapper target.
- Existing validators and contracts already provide the upstream evidence and
  confirmation boundaries.
- The safest implementation should be a pure mapper only, with no runtime
  BrokerExecutionResult creation, persistence, audit append, trade mutation,
  capture/browser, or Avanza behavior.

## 9. Risk assessment

Candidate mistaken for persisted execution:

- high. The candidate shape looks close to broker execution data, so all
  future displays and mapper outputs must preserve no-write labels.

Candidate mistaken for execution record:

- high. Execution-record creation and persistence remain separate downstream
  flows and must not be skipped.

Candidate mistaken for trade mutation approval:

- high. `safeToMutateTrade=false` must remain visible and enforced by future
  validators.

Mapper target drift:

- medium/high. The old mapper draft candidate still exists and should be
  reconciled carefully when implementing the mapper.

Missing provenance/fingerprint:

- high. Future mapper logic must populate provenance and fingerprint fields
  rather than returning thin broker-result-shaped objects.

Partial-fill ambiguity:

- high. Partial fills remain review-only until accounting, duplicate, and
  trade association policy exists.

Safe flags omitted/ignored:

- high. Any future mapper, preview UI, or persistence boundary must preserve
  `safeToPersist=false` and `safeToMutateTrade=false` until separate approval
  gates exist.

Future UI overtrust risk:

- medium/high. A mapped candidate preview could look authoritative; copy and
  tests must make the no-persistence/no-mutation boundary explicit.

## 10. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No mapper implementation, conversion,
BrokerExecutionResult creation, execution-record creation, persistence/write
behavior, Supabase behavior, audit append, trade mutation, UI wiring,
capture/OCR/browser extraction, browser automation, or Avanza behavior was
added.

## Action 470 Follow-Up

Action 470 created
`lib/evidence-to-broker-execution-result-mapper.ts`.

Mapper result:

- Added a pure deterministic mapper from validated Avanza confirmation
  evidence plus a confirmed BrokerExecutionResult confirmation result to a
  `BrokerExecutionResultCandidate`.
- The mapper returns typed `EvidenceToBrokerExecutionResultMapperResult`
  values and conservatively rejects/reviews unsafe inputs.
- Mapped candidates carry broker/source, instrument, execution, price,
  provenance, field mapping, fingerprint input, warnings/review flags,
  partial-fill details, and safety policy metadata.

Boundary result:

- The mapper creates candidate objects only.
- The candidate is not a runtime BrokerExecutionResult.
- The candidate is not an execution record.
- The candidate is not persistence approval.
- The candidate is not trade mutation approval.
- `safeToPersist=false` and `safeToMutateTrade=false` remain explicit.
- No Supabase behavior, localStorage behavior, audit append, trade mutation,
  UI wiring, capture/OCR/browser extraction, browser automation, or Avanza
  behavior was added.

Next recommended action:

**Action 471 - Reassess Evidence-to-BrokerExecutionResult Mapper**

## Action 471 Follow-Up

Action 471 created
`docs/evidence-to-broker-execution-result-mapper-reassessment.md`.

Reassessment result:

- Verified the mapper remains pure, deterministic, and candidate-only.
- Confirmed mapped candidates are not runtime BrokerExecutionResults,
  execution records, persistence approval, or trade mutation approval.
- Confirmed `safeToPersist=false` and `safeToMutateTrade=false` remain
  explicit.

Next recommended action:

**Action 472 - Create Mapped BrokerExecutionResult Candidate Preview Design**

## Action 472 Follow-Up

Action 472 created
`docs/mapped-broker-execution-result-candidate-preview-design.md`.

Candidate-contract impact:

- The future preview design preserves candidate-only semantics.
- The design requires explicit safety labels for `safeToPersist=false` and
  `safeToMutateTrade=false`.
- The design keeps execution-record creation, persistence, audit append, trade
  mutation, capture/browser, and Avanza behavior out of scope.

Next recommended action:

**Action 473 - Create Mapped BrokerExecutionResult Candidate Dev Preview**

## Action 473 Follow-Up

Action 473 created a dev-gated read-only preview for
`BrokerExecutionResultCandidate` output.

Candidate-contract impact:

- Candidate fields are displayed as preview-only diagnostic metadata.
- Safety policy labels remain visible, including `safeToPersist=false` and
  `safeToMutateTrade=false`.
- The preview does not create runtime BrokerExecutionResults, execution
  records, persistence, audit append, or trade mutations.

Next recommended action:

**Action 474 - Reassess Mapped BrokerExecutionResult Candidate Dev Preview**

## Action 474 Follow-Up

Action 474 created
`docs/mapped-broker-execution-result-candidate-dev-preview-reassessment.md`.

Candidate-contract result:

- Verified the preview still displays candidate output as diagnostic metadata
  only.
- Confirmed `safeToPersist=false`, `safeToMutateTrade=false`, no runtime
  BrokerExecutionResult, no execution record, no persistence, and no trade
  mutation remain visible.
- No candidate contract change or runtime enforcement was added.

Next recommended action:

**Action 475 - Reassess Avanza Broker Confirmation Capture Readiness**
