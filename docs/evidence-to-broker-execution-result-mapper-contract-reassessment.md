# Evidence-to-BrokerExecutionResult Mapper Contract Reassessment

## 1. Purpose

Reassess the Evidence-to-BrokerExecutionResult mapper contract types before any
mapper implementation.

Action 465 created
`lib/evidence-to-broker-execution-result-mapper-contract.ts` as a
type/constant-only contract module. This reassessment verifies that the module
remains conservative, aligned with the mapping design, and disconnected from
runtime mapping/conversion, BrokerExecutionResult creation, persistence,
Supabase behavior, audit append, trade mutation, UI wiring, capture/OCR/browser
extraction, browser automation, and Avanza behavior.

## 2. Current contract inventory

Contract module:

- `lib/evidence-to-broker-execution-result-mapper-contract.ts`

Version:

- `EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_CONTRACT_VERSION`
- value: `evidence_to_broker_execution_result_mapper_v1`

Exported input types:

- `EvidenceToBrokerExecutionResultMapperInput`
- `EvidenceToBrokerExecutionResultIntendedContext`
- `EvidenceToBrokerExecutionResultMapperMode`

The input contract can represent:

- raw `AvanzaConfirmationEvidence`.
- upstream `AvanzaConfirmationEvidenceValidationResult`.
- upstream `BrokerExecutionResultConfirmationValidationResult`.
- source classification.
- handoff payload fingerprint.
- intended execution context, including side, ticker, instrument name, ISIN,
  instrument id, quantity, expected execution price, and currency.
- mapper mode.
- optional metadata.

Exported result/status types:

- `EvidenceToBrokerExecutionResultMapperResult`
- `EvidenceToBrokerExecutionResultMapperStatus`

Statuses:

- `mapped_candidate`
- `rejected`
- `needs_review`
- `partial_fill_review`
- `unsupported`

Rejection reasons:

- `confirmation_not_confirmed_candidate`
- `evidence_rejected`
- `evidence_needs_review`
- `source_not_mappable`
- `missing_handoff_fingerprint`
- `missing_broker_reference`
- `missing_required_field`
- `partial_fill_ambiguous`
- `unsupported_broker`
- `mapper_not_implemented`

Warnings:

- `candidate_shape_draft_only`
- `optional_fee_missing`
- `optional_market_missing`
- `optional_account_context_missing`
- `partial_fill_mapping_policy_missing`
- `persistence_not_attempted`
- `trade_mutation_not_attempted`

Field mapping snapshot:

- `EvidenceToBrokerExecutionResultFieldMappingSnapshot`
- records future BrokerExecutionResult field name, evidence path, required
  flag, optional mapped value preview, optional confidence, and warning.

Provenance snapshot:

- `EvidenceToBrokerExecutionResultProvenanceSnapshot`
- records evidence fingerprint, source classification, source type, source
  page flow identifier, capture method, capture mode, page identity, captured
  timestamp, confirmation timestamp, capture id, request id, handoff payload
  fingerprint, and confirmation validation status.

Fingerprint contribution summary:

- `EvidenceToBrokerExecutionResultFingerprintContribution`
- carries the confirmation validator fingerprint input summary, mapper
  contribution fields, evidence fingerprint, broker reference fingerprint
  input, handoff payload fingerprint, and optional conversion fingerprint
  draft.

Partial-fill mapping:

- `EvidenceToBrokerExecutionResultPartialFillMapping`
- represents `not_partial`, `partial_fill_review`, or
  `multiple_fill_review`.
- records partial-fill evidence, quantities, average fill price, fill ids,
  `mappingPolicyAvailable: false`, and whether review is required.

Draft candidate metadata:

- `EvidenceToBrokerExecutionResultCandidateDraft`
- models a future draft candidate shape without returning a runtime
  BrokerExecutionResult.
- metadata requires:
  - `draftOnly: true`
  - `notRuntimeBrokerExecutionResult: true`
  - `noPersistence: true`
  - `noTradeMutation: true`

Safety flags:

- `safeToPersist: false`
- `safeToMutateTrade: false`
- `brokerExecutionResultCreated: false`
- `mapperImplemented: false`
- `persistenceAttempted: false`
- `tradeMutationAttempted: false`
- `auditAppendAttempted: false`
- `browserAutomationAttempted: false`

## 3. Boundary verification

Type-only/constants-only:

- The module exports constants and TypeScript types.
- It has only type imports from Avanza evidence, Avanza evidence validation,
  source classification, and confirmation validator contract modules.
- It contains no executable mapper, converter, validator, persistence, or
  mutation function.

No mapper implementation:

- There is no `mapEvidenceToBrokerExecutionResult(...)` function.
- No field is read, transformed, or written at runtime.

No conversion:

- The module does not convert evidence to any runtime object.
- `mappedCandidateDraft` is an optional contract shape only.

No BrokerExecutionResult creation:

- The module does not import the runtime `BrokerExecutionResult` type.
- The draft candidate is explicitly marked as not a runtime
  BrokerExecutionResult.
- `brokerExecutionResultCreated` is typed as `false`.

No execution-record creation:

- The module does not import execution-record creation or candidate builder
  types.
- It does not model execution-record creation output.

No persistence/write:

- No Supabase client, localStorage, route, database, or write helper exists.
- `persistenceAttempted` is typed as `false`.

No Supabase/audit/trade/browser/Avanza behavior:

- No Supabase behavior exists.
- No audit append exists.
- No trade mutation exists.
- No browser automation exists.
- No Avanza behavior exists.

No UI wiring:

- The contract is not wired into `trade-app.tsx`, modal UI, route UI, or
  production flows.

No capture/OCR/browser extraction:

- The module does not import capture, OCR, browser runner, bridge, or Avanza
  page modules.

## 4. Alignment with mapping design

Statuses:

- The contract statuses align with the design's intended categories:
  successful mapped draft candidate, rejected, needs-review, partial-fill
  review, and unsupported.

Rejection reasons:

- The contract covers the design's key blockers:
  confirmation not approved, rejected/review evidence, unmappable source,
  missing handoff fingerprint, missing broker reference, missing required
  fields, ambiguous partial fill, unsupported broker, and unimplemented mapper.

Field mapping representation:

- `EvidenceToBrokerExecutionResultMappedFieldName` lists the intended future
  BrokerExecutionResult fields.
- `EvidenceToBrokerExecutionResultFieldMappingSnapshot` can document source
  evidence paths, required fields, preview values, confidence, and warnings.

Provenance representation:

- the provenance snapshot preserves evidence fingerprint, source
  classification, source type, source page flow, capture metadata, timestamps,
  capture/request ids, handoff fingerprint, and confirmation status.

Fingerprint/idempotency representation:

- the fingerprint contribution summary carries confirmation fingerprint inputs
  plus mapper-specific contribution fields.
- it does not claim durable duplicate protection or persistence idempotency.

Partial-fill representation:

- partial-fill mapping explicitly has no available mapping policy yet.
- review remains required for partial or multiple fill scenarios.

Rejection/needs-review behavior:

- the result contract can represent rejected, needs-review, partial-fill
  review, and unsupported outcomes without producing a runtime broker result.
- warning codes preserve missing optional data and safety metadata.

Separation from execution records and trade mutation:

- execution-record creation is not modeled as an output.
- trade mutation remains explicitly false.

## 5. Safety policy verification

Mapped candidate is not persistence approval:

- `mapped_candidate` is only a future mapper output status.
- The result contract still requires `safeToPersist=false`.

`safeToPersist` remains false:

- The result type requires `safeToPersist: false`.
- draft candidate metadata also records `noPersistence: true`.

`safeToMutateTrade` remains false:

- The result type requires `safeToMutateTrade: false`.
- draft candidate metadata also records `noTradeMutation: true`.

Mapper implementation still does not exist:

- The contract has no runtime function.
- `mapperImplemented` is typed as `false`.

BrokerExecutionResult creation still does not exist:

- The contract has no runtime `BrokerExecutionResult`.
- `brokerExecutionResultCreated` is typed as `false`.

Execution record creation remains separate:

- The contract does not import execution-record candidate types.
- Execution-record creation, validation, persistence, and duplicate lookup
  remain downstream boundaries.

Trade mutation remains separate:

- The contract does not open, close, or mutate trade state.
- `tradeMutationAttempted` remains `false`.

Automatic mode remains out of scope:

- the mapper modes are `contract_preview` and `manual_review_preview`.
- no automatic execution or automatic trade mutation path is represented.

## 6. Remaining gaps before runtime mapper

- No mapper implementation exists.
- No final BrokerExecutionResult candidate type/runtime shape has been
  reassessed for this new pipeline.
- No Avanza capture/readback implementation exists.
- No real broker evidence acquisition exists.
- No persistence integration exists.
- No trade mutation integration exists.
- No UI preview for mapped candidate exists.
- No partial-fill mapping policy exists.
- No durable idempotency/duplicate lookup exists at the mapper boundary.

## 7. Candidate next actions

A. Create Evidence-to-BrokerExecutionResult Mapper

- highest direct payoff but riskier because it starts runtime conversion.
- should wait until the BrokerExecutionResult candidate shape is reassessed.

B. Create BrokerExecutionResult Candidate Type/Shape Reassessment

- safest next step.
- clarifies whether the existing runtime `BrokerExecutionResult` type is
  sufficient for this pipeline or whether a separate candidate/draft type is
  needed before implementation.
- reduces the risk of mapper output being mistaken for persistence or trade
  mutation approval.

C. Reassess Avanza Broker Confirmation Capture Readiness

- important before production evidence acquisition.
- closer to browser/Avanza behavior and should wait until mapper output shape
  is clearer.

D. Create Mapped Candidate Preview Design

- useful after candidate shape is settled.
- UI preview should not come before output semantics are reassessed.

## 8. Recommended next action

**Action 467 - Create BrokerExecutionResult Candidate Type/Shape Reassessment**

Rationale:

- The mapper contract currently includes a draft candidate shape but does not
  import or create the runtime `BrokerExecutionResult`.
- Before implementing a mapper, the project should reassess whether the
  existing runtime shape is appropriate, whether a separate production-safe
  candidate type is needed, and how no-persistence/no-trade-mutation metadata
  should be represented.
- This keeps the next step documentation-only and avoids premature conversion.

## 9. Risk assessment

Contract mistaken for runtime mapper risk:

- medium/high. The module defines mapping shape only and does not convert
  evidence.

Mapped candidate mistaken for persistence approval risk:

- high. A mapped draft must not imply Supabase writes, execution-record
  persistence, audit append, or trade mutation.

`safeToConvert` overtrust risk:

- high. Confirmation `safeToConvert=true` only permits future mapper
  consideration, not writes or trade-state changes.

Mapper running on rejected/needs-review evidence risk:

- high. Future implementation must require confirmed-candidate input.

Partial-fill ambiguity risk:

- high. Partial-fill and multiple-fill mapping remain unresolved.

Provenance loss risk:

- high. Future mapping must preserve evidence fingerprint, capture metadata,
  source classification, and handoff linkage.

Idempotency mismatch risk:

- high. Mapper fingerprints must align with confirmation and persistence
  duplicate strategies.

Trade mutation coupling risk:

- high. Mapping must stay disconnected from trade state mutation.

## 10. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No mapper implementation, conversion,
BrokerExecutionResult creation, persistence/write behavior, Supabase behavior,
audit append, trade mutation, UI wiring, capture/OCR/browser extraction,
browser automation, or Avanza behavior was added.

## Action 467 Follow-Up

Action 467 created
`docs/broker-execution-result-candidate-shape-reassessment.md`.

Reassessment result:

- Inventoried the runtime `BrokerExecutionResult`, server capture request
  shape, Avanza preview shape, dev mock conversion shape, execution-record
  source/candidate shapes, and mapper draft candidate shape.
- Determined no existing shape is suitable as the future mapper target.
- Recommended new BrokerExecutionResult candidate contract types before mapper
  implementation.

Next recommended action:

**Action 468 - Create BrokerExecutionResult Candidate Contract Types**

## Action 468 Follow-Up

Action 468 created
`lib/broker-execution-result-candidate-contract.ts`.

Mapper-contract impact:

- The future mapper now has a dedicated type-only target candidate contract to
  reference in a later action.
- The new candidate contract preserves provenance, field mapping, fingerprint,
  partial-fill, warning, review-flag, and no-write/no-mutation semantics.
- Runtime mapping and BrokerExecutionResult creation remain absent.

Next recommended action:

**Action 469 - Reassess BrokerExecutionResult Candidate Contract Types**

## Action 469 Follow-Up

Action 469 created
`docs/broker-execution-result-candidate-contract-reassessment.md`.

Mapper-contract impact:

- The dedicated candidate contract was reassessed and remains conservative.
- The contract is suitable as the future pure mapper target.
- Runtime mapping, BrokerExecutionResult creation, persistence, audit append,
  trade mutation, capture/browser, and Avanza behavior remain absent.

Next recommended action:

**Action 470 - Create Evidence-to-BrokerExecutionResult Mapper**

## Action 470 Follow-Up

Action 470 created
`lib/evidence-to-broker-execution-result-mapper.ts`.

Mapper-contract impact:

- The mapper contract now has a pure implementation that returns typed mapper
  results.
- The result can carry `BrokerExecutionResultCandidate` output for valid
  confirmed candidates only.
- No runtime BrokerExecutionResult creation, persistence, audit append, trade
  mutation, UI wiring, capture/browser, or Avanza behavior was added.

Next recommended action:

**Action 471 - Reassess Evidence-to-BrokerExecutionResult Mapper**

## Action 471 Follow-Up

Action 471 created
`docs/evidence-to-broker-execution-result-mapper-reassessment.md`.

Mapper-contract impact:

- The mapper implementation was reassessed against the contract.
- It returns typed mapper results and only attaches a
  `BrokerExecutionResultCandidate` for valid confirmed inputs.
- No runtime BrokerExecutionResult creation, execution-record creation,
  persistence, audit append, trade mutation, UI wiring, capture/browser, or
  Avanza behavior exists.

Next recommended action:

**Action 472 - Create Mapped BrokerExecutionResult Candidate Preview Design**

## Action 472 Follow-Up

Action 472 created
`docs/mapped-broker-execution-result-candidate-preview-design.md`.

Mapper-contract impact:

- The preview design defines how future UI should display typed mapper result
  output safely.
- It keeps mapper result display read-only, dev-gated, and candidate-only.
- It forbids persistence, trade mutation, execution-record creation, audit
  append, capture/browser, and Avanza behavior.

Next recommended action:

**Action 473 - Create Mapped BrokerExecutionResult Candidate Dev Preview**

## Action 473 Follow-Up

Action 473 created a dev-gated mapped candidate preview component and
controlled fixture helper.

Mapper-contract impact:

- The preview displays typed mapper result fields without changing the mapper
  contract.
- It uses an explicit trigger and controlled fixture data only.
- No production runtime wiring, persistence, audit append, trade mutation, or
  Avanza/browser behavior was added.

Next recommended action:

**Action 474 - Reassess Mapped BrokerExecutionResult Candidate Dev Preview**

## Action 474 Follow-Up

Action 474 created
`docs/mapped-broker-execution-result-candidate-dev-preview-reassessment.md`.

Mapper-contract result:

- Verified the dev preview displays typed mapper result output without changing
  the mapper contract.
- Confirmed the path remains dev-gated, fixture-only, explicit-trigger-only,
  and read-only.
- No runtime conversion, persistence, audit append, trade mutation,
  capture/browser, or Avanza behavior was added.

Next recommended action:

**Action 475 - Reassess Avanza Broker Confirmation Capture Readiness**
