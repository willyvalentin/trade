# BrokerExecutionResult Candidate Shape Reassessment

## 1. Purpose

Reassess the target BrokerExecutionResult/candidate shape before implementing
the Evidence-to-BrokerExecutionResult mapper.

Action 466 verified that
`lib/evidence-to-broker-execution-result-mapper-contract.ts` remains
type/constant-only and that its mapped candidate draft is not persistence
approval or trade mutation approval. This reassessment inventories the current
BrokerExecutionResult-related shapes, determines whether any existing shape is
suitable as the mapper target, and defines the required future candidate fields
and safety metadata.

This action is documentation-only. It adds no runtime code, no TypeScript
contract types, no mapper implementation, no BrokerExecutionResult creation,
no persistence/write behavior, no Supabase behavior, no audit append, no trade
mutation, no UI wiring, no capture/OCR/browser extraction, no browser
automation, and no Avanza behavior.

## 2. Current shape inventory

Runtime `BrokerExecutionResult`

- Location: `lib/execution.ts`
- Shape:
  - `broker_hint`
  - `status`
  - `captured_at`
  - `broker_order_id`
  - `submitted_at`
  - `filled_at`
  - `filled_quantity`
  - `average_fill_price`
  - `rejection_reason`
  - `cancellation_reason`
  - `raw_status`
  - `notes`
- Classification:
  - runtime shape.
  - used by execution intent/server capture flows.
  - too thin for the new Avanza evidence-to-result pipeline.

Execution server capture shape

- Location: `lib/execution-server-capture-contract.ts`
- Shape:
  - request requires `ExecutionIntent` and runtime `BrokerExecutionResult`.
  - includes source/environment/idempotency fields.
- Classification:
  - runtime capture request shape.
  - coupled to existing server capture boundary.
  - not suitable as mapper target before confirmation evidence provenance and
    no-write safety metadata are modeled.

Avanza BrokerExecutionResult preview shape

- Location: `lib/avanza-broker-execution-result-preview.ts`
- Shape:
  - `AvanzaBrokerExecutionResultPreviewShape`
  - metadata includes `previewOnly`, `notBrokerExecutionResult`,
    `noExecutionRecord`, `noSupabaseWrite`, and `noTradeMutation`.
- Classification:
  - preview-only shape.
  - useful as precedent for safety labels and non-persistence metadata.
  - unsafe as a confirmed mapper target because it is explicitly not a real
    BrokerExecutionResult.

Dev mock conversion shape

- Location: `lib/dev-mock-to-broker-execution-result.ts`
- Shape:
  - `DevMockBrokerConvertedBrokerExecutionResult`
  - extends runtime `BrokerExecutionResult` with mock/dev-only fields and
    metadata.
- Classification:
  - dev/mock conversion shape.
  - intentionally not production-safe.
  - unsafe as mapper target for Avanza broker confirmation evidence.

Execution record source broker result shape

- Location: `lib/execution-record-creation-contract.ts`
- Shape:
  - `ExecutionRecordSourceBrokerExecutionResult`
  - broad input shape for execution-record creation validation.
  - metadata supports preview/mock/synthetic/no-write flags.
- Classification:
  - execution-record input shape.
  - flexible bridge from broker result to execution record creation.
  - not a BrokerExecutionResult mapper target because it belongs downstream of
    broker result confirmation/conversion.

Execution record candidate shape

- Location: `lib/execution-record-creation-contract.ts`
- Shape:
  - `ExecutionRecordCandidate`
  - includes record id/fingerprint, idempotency, broker metadata, trade
    association, safety metadata, audit metadata, and persistence-oriented
    fields.
- Classification:
  - execution-record candidate shape.
  - not suitable as mapper target because it already assumes execution-record
    creation semantics.

Evidence-to-BrokerExecutionResult mapper draft candidate

- Location:
  `lib/evidence-to-broker-execution-result-mapper-contract.ts`
- Shape:
  - `EvidenceToBrokerExecutionResultCandidateDraft`
  - mirrors a subset of runtime `BrokerExecutionResult`.
  - metadata includes `draftOnly`, `notRuntimeBrokerExecutionResult`,
    `noPersistence`, and `noTradeMutation`.
- Classification:
  - type-only draft shape.
  - useful placeholder.
  - not sufficient as the final mapper target because it lacks many required
    evidence/provenance/fingerprint/source fields.

Gaps / no existing shape:

- no production-safe BrokerExecutionResult candidate contract exists.
- no shape combines broker execution fields with Avanza evidence provenance,
  confirmation validator output, source classification, field mapping snapshot,
  fingerprint contribution, partial-fill review metadata, and explicit
  no-persistence/no-trade-mutation safety.

## 3. Suitability assessment

Runtime `BrokerExecutionResult`:

- partial fit.
- suitable for legacy execution capture fields.
- missing source classification, confirmation validator status, confirmation
  id/equivalent, instrument name/ticker/ISIN/instrument id, currency, order
  type, field mapping snapshot, provenance snapshot, fingerprint contribution,
  handoff payload fingerprint, partial-fill metadata, and safety flags.
- unsafe as direct mapper target without a candidate wrapper.

Execution server capture shape:

- unsafe/too coupled.
- expects a runtime `BrokerExecutionResult`.
- belongs to capture/server request flow, not evidence-to-result mapping.

Avanza preview shape:

- preview-only.
- useful for labels and safety metadata.
- unsafe as mapper target because metadata explicitly says
  `notBrokerExecutionResult`.

Dev mock conversion shape:

- unsafe/too coupled.
- dev/mock-only and intentionally not production broker evidence.
- should remain separate from Avanza confirmation evidence mapping.

Execution record source broker result shape:

- partial fit for downstream ingestion.
- too broad for mapper target and can accept preview/mock/synthetic sources.
- belongs after broker result creation, not before it.

Execution record candidate shape:

- execution-record-only.
- unsuitable as mapper target because it includes persistence/idempotency and
  record-candidate semantics.

Mapper draft candidate metadata:

- partial fit.
- correctly includes draft/no-persistence/no-trade-mutation metadata.
- missing required broker-confirmation, provenance, field mapping, fingerprint,
  source classification, and partial-fill fields.

Conclusion:

- a new BrokerExecutionResult candidate contract type is needed before mapper
  implementation.
- the candidate should wrap or extend runtime-compatible broker result fields
  while adding provenance, mapping, source, fingerprint, partial-fill, review,
  and safety metadata.

## 4. Required candidate shape

Future mapped BrokerExecutionResult candidate fields should include:

- broker:
  - broker id/provider, currently `avanza`.
  - broker hint for compatibility with existing execution types.
- source classification:
  - source classification from evidence/provenance.
  - source classification validation result or policy reference.
- confirmation status:
  - confirmation validator status.
  - evidence validator status.
  - mapper status.
- broker order id/reference:
  - order id.
  - order number.
  - broker reference.
  - strong equivalent reference if reviewed.
- confirmation id/equivalent:
  - confirmation id.
  - fill id.
  - execution id.
- instrument identity:
  - instrument name.
  - ticker.
  - ISIN.
  - broker instrument id.
  - market/venue.
  - instrument type if available.
- side:
  - buy/sell.
- quantity:
  - full quantity.
  - filled quantity.
  - remaining quantity for partial fills.
- execution price/fill price:
  - execution price.
  - average fill price if applicable.
  - price field type.
- currency.
- order type if available.
- confirmation timestamp.
- captured timestamp.
- provenance snapshot:
  - evidence fingerprint.
  - capture method/mode/page identity.
  - capture id/request id.
  - sanitized source hashes if allowed.
  - privacy/sensitive-data flags or reference.
- field mapping snapshot:
  - field names.
  - source evidence paths.
  - required flags.
  - mapped preview values.
  - confidence/warnings.
- fingerprint contribution summary:
  - confirmation validator fingerprint summary.
  - broker references.
  - instrument identity.
  - side/quantity/price/currency/timestamp.
  - handoff payload fingerprint.
  - conversion fingerprint draft.
- handoff payload fingerprint.
- warnings/review flags:
  - warnings from evidence validator.
  - warnings from confirmation validator.
  - mapper warnings.
  - needs-review reason flags.
- partial-fill info:
  - partial status.
  - filled quantity.
  - remaining quantity.
  - average fill price.
  - fill ids.
  - explicit review requirement until policy exists.
- safety flags:
  - `safeToPersist: false`.
  - `safeToMutateTrade: false`.
  - `brokerExecutionResultCreated: false` until actual mapper implementation.
  - `executionRecordCreated: false`.
  - `supabaseWriteAttempted: false`.
  - `auditAppendAttempted: false`.
  - `tradeMutationAttempted: false`.
  - `browserAutomationAttempted: false`.

## 5. Separation from execution records

- BrokerExecutionResult candidate shape is not an execution record.
- Execution record candidate builder remains separate.
- Execution record creation validator remains separate.
- Persistence validator remains separate.
- Supabase migration/application remains separate.
- Duplicate lookup and durable idempotency remain persistence concerns.
- No write path is enabled by candidate shape design.

## 6. Separation from trade mutation

- Candidate shape does not open or close trades.
- Candidate shape does not update live/history trade state.
- Trade mutation remains a separate future boundary.
- Semi-automatic final manual confirmation remains required.
- Automatic mode remains out of scope.
- Any future trade mutation path needs its own validator, audit policy,
  idempotency strategy, UX, and explicit approval.

## 7. Candidate next actions

A. Create BrokerExecutionResult Candidate Contract Types

- safest next step.
- can define the production-safe candidate contract before runtime mapper
  implementation.
- keeps mapper implementation, persistence, and trade mutation out of scope.

B. Create Evidence-to-BrokerExecutionResult Mapper

- useful eventually.
- too early before the candidate contract type is defined and reviewed.

C. Reassess Avanza Broker Confirmation Capture Readiness

- important before real broker evidence acquisition.
- closer to browser/Avanza behavior and should wait until mapper target shape
  is explicit.

D. Create Mapped BrokerExecutionResult Candidate Preview Design

- useful after candidate contract types exist.
- UI design should not precede final candidate shape.

## 8. Recommended next action

**Action 468 - Create BrokerExecutionResult Candidate Contract Types**

Rationale:

- No existing shape is suitable as the mapper target.
- Runtime `BrokerExecutionResult` is too thin.
- Preview and dev mock shapes are explicitly non-production.
- Execution-record shapes are downstream and too persistence-oriented.
- A new type-only candidate contract can preserve provenance, field mapping,
  fingerprint, partial-fill, and no-persistence/no-trade-mutation safety before
  mapper implementation.

## 9. Risk assessment

Using execution record shape as broker result shape:

- high. Execution-record candidates include persistence-oriented semantics and
  should remain downstream of BrokerExecutionResult mapping.

Preview shape mistaken for confirmed candidate:

- high. Preview shapes are explicitly not runtime broker results and are not
  production evidence.

Missing provenance/fingerprint:

- high. Candidate shape must preserve evidence fingerprint, broker references,
  source classification, capture/request ids, and handoff fingerprint.

Safety flags omitted:

- high. Missing no-persistence/no-trade-mutation metadata could blur runtime
  conversion with writes or trade state changes.

Partial-fill ambiguity:

- high. Partial-fill candidate representation must remain review-only until
  accounting policy exists.

Persistence/trade mutation coupling risk:

- high. Candidate shape must not authorize Supabase writes, audit append, or
  live/history trade mutations.

Future mapper target drift risk:

- medium/high. If mapper implementation starts before candidate contracts are
  settled, output shape may diverge from confirmation, persistence, and UI
  expectations.

## 10. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No TypeScript types were created in this
action. No mapper implementation, BrokerExecutionResult creation,
persistence/write behavior, Supabase behavior, audit append, trade mutation,
UI wiring, capture/OCR/browser extraction, browser automation, or Avanza
behavior was added.

## Action 468 Follow-Up

Action 468 created
`lib/broker-execution-result-candidate-contract.ts`.

Contract result:

- Added type/constant-only BrokerExecutionResult candidate contracts for the
  future mapper target shape.
- Modeled candidate status, broker/source, instrument, execution, price,
  broker references, provenance, field mapping, fingerprint input,
  partial-fill details, warnings, review flags, account context, and safety
  policy.
- Preserved explicit `safeToPersist=false` and
  `safeToMutateTrade=false`.

Boundary result:

- The candidate is not a runtime BrokerExecutionResult.
- The candidate is not an execution record.
- The candidate is not persistence approval.
- The candidate is not trade mutation approval.
- No mapper/conversion implementation, BrokerExecutionResult creation,
  persistence/write behavior, Supabase behavior, audit append, trade mutation,
  UI wiring, capture/OCR/browser extraction, browser automation, or Avanza
  behavior was added.

Next recommended action:

**Action 469 - Reassess BrokerExecutionResult Candidate Contract Types**

## Action 469 Follow-Up

Action 469 created
`docs/broker-execution-result-candidate-contract-reassessment.md`.

Reassessment result:

- Verified the candidate contract is type/constant-only.
- Confirmed status, source/broker, instrument, execution, price, provenance,
  field mapping, fingerprint input, partial-fill, warning/review flag, and
  safety policy fields align with this shape reassessment.
- Confirmed the candidate is not a runtime BrokerExecutionResult, not an
  execution record, not persistence approval, and not trade mutation approval.

Next recommended action:

**Action 470 - Create Evidence-to-BrokerExecutionResult Mapper**
