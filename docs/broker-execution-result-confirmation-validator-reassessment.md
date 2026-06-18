# BrokerExecutionResult Confirmation Validator Reassessment

## 1. Purpose

Reassess the BrokerExecutionResult confirmation validator after Action 463.

Action 463 created
`lib/broker-execution-result-confirmation-validator.ts`, a pure deterministic
validator that consumes already-validated Avanza confirmation evidence, source
classification policy, and intended trade/handoff context. This reassessment
verifies that the validator remains confirmation-only and disconnected from
mapper implementation, BrokerExecutionResult creation, persistence, Supabase,
audit append, trade mutation, UI wiring, capture/OCR/browser extraction,
browser automation, and Avanza behavior.

## 2. Current validator inventory

Validator module:

- `lib/broker-execution-result-confirmation-validator.ts`

Exported API:

- `validateBrokerExecutionResultConfirmation(input)`

Input contract usage:

- accepts `BrokerExecutionResultConfirmationValidatorInput`.
- consumes raw `AvanzaConfirmationEvidence`.
- consumes upstream `AvanzaConfirmationEvidenceValidationResult`.
- consumes `BrokerResultSourceClassification`.
- optionally consumes a precomputed source classification validation result.
- consumes intended side, instrument identity, quantity, expected price,
  handoff payload fingerprint, account context, and mapping policy version.
- supports automatic-mode input representation only so it can be rejected.

Output statuses:

- `confirmed_candidate`
- `rejected`
- `needs_review`
- `partial_fill_review`
- `unsupported`

Rejection reasons:

- evidence validator blockers:
  - `evidence_rejected`
  - `evidence_needs_review`
- source policy blockers:
  - `source_not_confirmation_capable`
  - `source_not_production_safe`
- handoff/reference/provenance blockers:
  - `missing_handoff_fingerprint`
  - `broker_reference_missing`
  - `provenance_missing`
- trade intent blockers:
  - `instrument_mismatch`
  - `side_mismatch`
  - `quantity_mismatch`
  - `price_invalid`
  - `timestamp_invalid`
- review/unsupported blockers:
  - `partial_fill_ambiguous`
  - `unsupported_broker`
  - `automatic_mode_not_allowed`

Warning behavior:

- always includes:
  - `persistence_not_attempted`
  - `trade_mutation_not_attempted`
- may include:
  - `account_context_missing`
  - `optional_fee_missing`
  - `optional_market_missing`
  - `manual_review_required`
  - `mapping_policy_missing`

Policy snapshot behavior:

- result includes a policy snapshot on every path.
- snapshot records contract version, mode, source classification, source
  policy rule, required evidence/reference/fingerprint flags, automatic-mode
  exclusion, and default no-persistence/no-trade-mutation policy.
- `safeToPersistDefault` remains `false`.
- `safeToMutateTradeDefault` remains `false`.

Evidence snapshot behavior:

- result includes an evidence snapshot reference on every path.
- snapshot records evidence fingerprint, capture id, request id, source type,
  source page flow identifier, source classification, captured timestamp,
  confirmation timestamp, upstream evidence validation status, upstream
  evidence rejection reasons, and upstream evidence warnings.

Fingerprint summary behavior:

- result includes a fingerprint input summary on every path.
- summary can carry handoff payload fingerprint, evidence fingerprint, broker
  order id, order number, confirmation id, fill id, execution id, broker
  reference, instrument identity, side, quantity, price, currency,
  confirmation timestamp, capture id, request id, and provenance hash.

E2E coverage summary:

- `tests/e2e/execution-sandbox.spec.ts` includes
  `validates BrokerExecutionResult confirmation without mapping or writes`.
- Covered paths:
  - valid context returns `confirmed_candidate`.
  - rejected evidence returns `rejected`.
  - low-confidence evidence returns `needs_review`.
  - partial fill ambiguity returns `partial_fill_review`.
  - missing handoff fingerprint rejects.
  - automatic mode rejects.
  - `broker_confirmed` source rejects as not production-safe.
  - preview-only source rejects as not confirmation-capable.
  - side, instrument, and quantity mismatches reject.
  - safety flags remain no-write/no-mutation.

## 3. Boundary verification

Pure validation only:

- The validator is deterministic for a given input.
- It reads no environment, storage, browser state, network state, or app state.
- It uses supplied input and static policy constants only.

No mapper:

- No evidence-to-BrokerExecutionResult mapper exists.
- The validator does not produce mapped BrokerExecutionResult fields or output.

No BrokerExecutionResult creation:

- The validator returns typed confirmation validation metadata only.
- `brokerExecutionResultCreated` is always `false`.

No execution record creation:

- The validator does not import execution-record candidate builders.
- It does not create an `ExecutionRecordCandidate`.

No persistence/write:

- No Supabase client is imported.
- No route/client persistence helper is called.
- No localStorage or database access exists.
- `persistenceAttempted` is always `false`.

No Supabase/audit/trade mutation:

- No Supabase behavior exists.
- No audit append exists.
- No trade mutation exists.
- `auditAppendAttempted` and `tradeMutationAttempted` remain `false`.

No UI wiring:

- The validator is not wired into `trade-app.tsx`, modal UI, route UI, or
  production flows.
- Usage is currently test-only.

No capture/OCR/browser extraction:

- No capture module, OCR module, browser runner, localhost bridge capture, or
  Avanza page interaction is imported or called.

No browser/Avanza behavior:

- The validator does not control browsers.
- It does not touch Avanza.
- It treats Avanza evidence as already-supplied input.

## 4. Confirmation policy verification

Evidence rejected returns rejected:

- Upstream evidence validation status `rejected` adds
  `evidence_rejected`.
- Missing broker references are also detected directly as
  `broker_reference_missing`.

Evidence needs-review returns review:

- Upstream evidence validation status `needs_review` adds
  `evidence_needs_review`.
- Low-confidence evidence returns `needs_review` unless a higher-priority
  partial-fill review applies.

Source classification gates are enforced:

- The validator uses `validateBrokerResultSourceForUsage(...)` with
  `execution_record_creation` usage if no source result is supplied.
- Not confirmation-capable sources add `source_not_confirmation_capable`.
- Non-production-safe sources add `source_not_production_safe`.
- Current conservative policy means `broker_confirmed` alone still rejects;
  only `production_safe_candidate` can pass this source-safety gate.

Missing handoff fingerprint rejects:

- Missing or blank `handoffPayloadFingerprint` adds
  `missing_handoff_fingerprint`.

Automatic mode rejects:

- Input mode `automatic` adds `automatic_mode_not_allowed`.
- The result status is `rejected`.

Side/instrument/quantity/price mismatches reject or review conservatively:

- side mismatch adds `side_mismatch`.
- instrument mismatch adds `instrument_mismatch`.
- quantity mismatch adds `quantity_mismatch`.
- invalid or mismatched execution price adds `price_invalid`.
- invalid confirmation timestamp adds `timestamp_invalid`.

Partial-fill ambiguity returns review path:

- `partially_filled` order status or partial-fill statuses of `partial`,
  `multiple_fills`, or `unclear` add `partial_fill_ambiguous`.
- status becomes `partial_fill_review`.
- partial-fill review is not conversion-safe.

Confirmed candidate remains non-persistent and non-mutating:

- valid evidence/context returns `confirmed_candidate`.
- `safeToConvert` is true only for `confirmed_candidate`.
- `safeToPersist` remains false.
- `safeToMutateTrade` remains false.

## 5. Safety flag verification

`safeToConvert: true` only means eligible for future mapper:

- It does not create a BrokerExecutionResult.
- It does not imply persistence.
- It does not imply trade mutation.

`safeToPersist: false` always remains false:

- The result type requires `safeToPersist: false`.
- The validator sets `safeToPersist` to false on every path.
- Confirmed candidates do not become execution-record persistence approvals.

`safeToMutateTrade: false` always remains false:

- The result type requires `safeToMutateTrade: false`.
- The validator sets `safeToMutateTrade` to false on every path.
- Confirmed candidates do not become trade state mutation approvals.

Confirmed candidate is not execution record approval:

- Execution-record creation remains downstream and separate.
- Candidate building, persistence validation, duplicate lookup, schema
  readiness, and server-only write boundaries remain separate.

Confirmed candidate is not trade state mutation approval:

- Trade mutation remains a separate future boundary with its own policy,
  idempotency, audit, UX, and approval requirements.

## 6. Remaining gaps before conversion

- No Evidence-to-BrokerExecutionResult mapper contract types exist.
- No mapper implementation exists.
- No BrokerExecutionResult creation path exists.
- No Avanza capture/readback implementation exists.
- No real broker evidence acquisition exists.
- No persistence integration exists.
- No trade mutation integration exists.
- No partial-fill accounting or multiple-fill mapping policy exists.
- No production authority path for assigning `production_safe_candidate` is
  implemented.

## 7. Candidate next actions

A. Create Evidence-to-BrokerExecutionResult Mapper Contract Types

- safest next step.
- can define mapper input/output shape after confirmation validation without
  implementing mapping.
- can keep conversion, persistence, and mutation out of scope.

B. Create Evidence-to-BrokerExecutionResult Mapper

- useful eventually, but should wait until mapper contract types define output
  shape, safety flags, partial-fill handling, and provenance semantics.

C. Reassess Avanza Broker Confirmation Capture Readiness

- important before production evidence acquisition.
- closer to browser/Avanza behavior, so it should wait until mapper contracts
  and conversion boundaries are clearer.

D. Create Avanza Confirmation Capture Manual QA Checklist

- useful for manual review and future capture testing.
- less foundational than mapper contract types.

## 8. Recommended next action

**Action 465 - Create Evidence-to-BrokerExecutionResult Mapper Contract Types**

Rationale:

- The confirmation validator now produces typed eligibility results.
- Mapper contract types are the safest next step before any mapper
  implementation.
- A type-only mapper contract can define conversion input/output shape,
  provenance, partial-fill handling, and no-persistence/no-trade-mutation
  metadata without creating BrokerExecutionResults or enabling writes.

## 9. Risk assessment

Confirmed candidate mistaken for persistence approval:

- high. Confirmed candidates are conversion candidates only; persistence
  remains a separate boundary.

`safeToConvert` overtrusted as write permission:

- high. `safeToConvert=true` must never imply Supabase write, audit append, or
  trade mutation permission.

Mapper running on rejected/needs-review evidence:

- high. Future mapper contracts and implementations must require
  `confirmed_candidate`.

Partial-fill ambiguity:

- high. Partial-fill evidence remains review-only until accounting and
  duplicate strategy exist.

Source classification overtrust:

- medium/high. Source classification policy is necessary but not sufficient;
  provenance, handoff linkage, broker references, and intent matching still
  matter.

Provenance gap:

- high. Missing evidence fingerprint, capture id, request id, or handoff
  fingerprint weakens duplicate prevention and anti-spoofing.

Trade mutation coupling risk:

- high. Confirmation validation must remain disconnected from live/history
  trade state changes.

Future browser/OCR extraction trust risk:

- high. Future capture/readback/OCR work must not bypass evidence validation
  and confirmation validation.

## 10. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No mapper implementation,
BrokerExecutionResult creation, persistence/write behavior, Supabase behavior,
audit append, trade mutation, UI wiring, capture/OCR/browser extraction,
browser automation, or Avanza behavior was added.

## Action 465 Follow-Up

Action 465 created
`lib/evidence-to-broker-execution-result-mapper-contract.ts`.

Mapper-boundary impact:

- Added type/constant-only contracts for a future
  Evidence-to-BrokerExecutionResult mapper.
- Modeled mapper input, result statuses, rejection reasons, warnings, field
  mapping snapshots, provenance snapshots, fingerprint contribution summaries,
  partial-fill mapping summaries, and a future candidate draft shape.
- Kept mapper implementation and BrokerExecutionResult creation absent.
- Preserved `safeToPersist=false` and `safeToMutateTrade=false` in the mapper
  result contract.

Next recommended action:

**Action 466 - Reassess Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 466 Follow-Up

Action 466 created
`docs/evidence-to-broker-execution-result-mapper-contract-reassessment.md`.

Reassessment result:

- Verified the mapper contract module is type/constant-only.
- Confirmed mapper statuses, rejection reasons, field snapshots, provenance
  snapshots, fingerprint contribution, partial-fill mapping, and draft
  candidate metadata align with the mapping design.
- Confirmed no runtime mapper, conversion, BrokerExecutionResult creation,
  persistence, audit append, trade mutation, UI wiring, capture/browser, or
  Avanza behavior exists.

Next recommended action:

**Action 467 - Create BrokerExecutionResult Candidate Type/Shape Reassessment**

## Action 467 Follow-Up

Action 467 created
`docs/broker-execution-result-candidate-shape-reassessment.md`.

Confirmation-validator impact:

- The validator remains upstream of mapping.
- The future mapper target needs a dedicated candidate contract rather than
  directly using the existing runtime `BrokerExecutionResult`.
- `confirmed_candidate` remains conversion eligibility only.

Next recommended action:

**Action 468 - Create BrokerExecutionResult Candidate Contract Types**

## Action 468 Follow-Up

Action 468 created
`lib/broker-execution-result-candidate-contract.ts`.

Confirmation-validator impact:

- The confirmed-candidate validation result now has a downstream type-only
  candidate target for future mapping.
- The candidate contract does not change validator behavior and does not
  create BrokerExecutionResult values.
- `safeToPersist=false` and `safeToMutateTrade=false` remain explicit.

Next recommended action:

**Action 469 - Reassess BrokerExecutionResult Candidate Contract Types**

## Action 469 Follow-Up

Action 469 created
`docs/broker-execution-result-candidate-contract-reassessment.md`.

Confirmation-validator impact:

- The downstream candidate contract remains aligned with confirmation
  validator output.
- `confirmed_candidate` remains conversion eligibility only.
- No validator behavior, mapper behavior, persistence, or trade mutation was
  added.

Next recommended action:

**Action 470 - Create Evidence-to-BrokerExecutionResult Mapper**

## Action 470 Follow-Up

Action 470 created
`lib/evidence-to-broker-execution-result-mapper.ts`.

Confirmation-validator impact:

- The mapper treats confirmation validator output as a hard precondition.
- Only `confirmed_candidate` with `safeToConvert=true` can produce a mapped
  candidate.
- The mapper does not change confirmation validation behavior and does not
  create runtime BrokerExecutionResults, execution records, persistence, or
  trade mutations.

Next recommended action:

**Action 471 - Reassess Evidence-to-BrokerExecutionResult Mapper**

## Action 471 Follow-Up

Action 471 created
`docs/evidence-to-broker-execution-result-mapper-reassessment.md`.

Confirmation-validator impact:

- The mapper reassessment confirmed confirmation validation remains a hard
  precondition.
- `confirmed_candidate` plus `safeToConvert=true` allows candidate mapping
  only, not persistence or trade mutation.
- Confirmation validation behavior remains unchanged.

Next recommended action:

**Action 472 - Create Mapped BrokerExecutionResult Candidate Preview Design**

## Action 472 Follow-Up

Action 472 created
`docs/mapped-broker-execution-result-candidate-preview-design.md`.

Confirmation-validator impact:

- The preview design keeps confirmation validation upstream of mapper display.
- `safeToConvert=true` remains candidate-mapping eligibility only.
- The design requires labels that block persistence and trade mutation
  overtrust.

Next recommended action:

**Action 473 - Create Mapped BrokerExecutionResult Candidate Dev Preview**

## Action 475 Follow-Up

Action 475 created
`docs/avanza-broker-confirmation-capture-readiness-reassessment.md`.

Confirmation-validator impact:

- The confirmation validator remains downstream of capture and evidence
  validation.
- Capture/readback is not ready for implementation; real Avanza page/readback
  fields and provenance signals need manual QA first.
- No confirmation validator behavior, BrokerExecutionResult creation,
  persistence, audit append, trade mutation, browser, or Avanza behavior was
  added.

Next recommended action:

**Action 476 - Create Avanza Confirmation Capture Manual QA Checklist**

## Action 476 Follow-Up

Action 476 created
`docs/avanza-confirmation-capture-manual-qa-checklist.md`.

Confirmation-validator impact:

- Manual QA can now document whether real Avanza final confirmation or
  account/order-history evidence can satisfy confirmation validator
  preconditions.
- Confirmation validation remains unchanged and does not capture pages or create
  BrokerExecutionResults.
- Manual findings must be reassessed before changing confirmation validation.

Next recommended action:

**Action 477 - Reassess Manual QA Findings**

## Action 477 Follow-Up

Action 477 created
`docs/avanza-confirmation-capture-manual-qa-findings-reassessment.md`.

Confirmation-validator impact:

- No actual post-submit Avanza findings exist to relax or update confirmation
  validation.
- Broker order id, confirmation id/equivalent, fill status, timestamps, and
  provenance remain unknown for real final/history sources.
- Confirmation validation remains unchanged and disconnected from capture.

Next recommended action:

**Action 478 - Create Manual QA Findings Template**

## Action 478 Follow-Up

Action 478 created
`docs/avanza-confirmation-capture-manual-qa-findings-template.md`.

Confirmation-validator impact:

- The template can capture broker reference, source identity, timestamp,
  provenance, fill-status, and privacy observations needed by confirmation
  validation.
- Confirmation validation remains unchanged and disconnected from capture.

Next recommended action:

**Action 479 - Fill Manual QA Findings Template**

## Action 485 Follow-Up - Two-Stage Confirmation Validation Boundary

Action 485 created
`docs/two-stage-broker-evidence-flow-design.md`.

Confirmation-validator impact:

- Confirmation validation should distinguish provisional immediate readback
  from official final settlement-note evidence.
- Immediate readback should not satisfy final official confirmation/PnL
  requirements when final note fields are missing.
- Final note validation should include conservative matching against the
  provisional trade before finalization.
- Mismatch, duplicate final-note candidates, or missing final note should
  produce review/blocking statuses.
- No validator implementation or runtime behavior changed in this action.

Next recommended action:

**Action 486 - Create Two-Stage Broker Evidence Contract Types**
