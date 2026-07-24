# BrokerExecutionResult Confirmation Validator Design

## 1. Purpose

Define the future `BrokerExecutionResult` Confirmation Validator boundary.

The future validator will decide whether validated broker evidence is eligible
to become a confirmed `BrokerExecutionResult` candidate. This document is
design-only and does not implement validator code, mapper code, broker result
creation, capture, OCR/browser extraction, persistence, Supabase behavior,
audit append, trade mutation, browser behavior, or Avanza behavior.

## 2. Scope

Included:

- confirmation eligibility validation.
- source classification validation.
- evidence validation dependency.
- evidence-to-result mapping precondition checks.
- provenance and idempotency requirements.
- rejection, needs-review, partial-fill, unsupported, and confirmed-candidate
  outcomes.
- separation from mapper, execution records, persistence, and trade mutation.

Excluded:

- evidence capture.
- OCR/browser extraction.
- conversion implementation.
- mapper implementation.
- execution record creation.
- persistence.
- Supabase reads or writes.
- audit append.
- trade mutation.
- automatic mode.

## 3. Validator inputs

Future inputs should include:

- validated Avanza confirmation evidence result from
  `validateAvanzaConfirmationEvidence(...)`.
- raw `AvanzaConfirmationEvidence`.
- broker result source classification.
- source classification validation result, if already computed.
- intended execution side.
- intended ticker/instrument/ISIN/instrument id when available.
- intended quantity.
- intended price/limit assumptions when available.
- handoff payload fingerprint.
- expected broker/account context when available.
- current execution mode, initially semi-auto/manual-confirmed only.
- optional mapping policy version.
- optional evidence-to-result mapping preflight result if a mapper contract
  later exists.

Input constraints:

- automatic mode must be rejected.
- preview/dev/mock/dry-run/local diagnostics must be rejected.
- raw user-entered data without broker-originating evidence must be rejected.
- evidence must be sanitized before it reaches this boundary.

## 4. Validator outputs

Future output statuses:

- `confirmed_candidate`
- `rejected`
- `needs_review`
- `partial_fill_review`
- `unsupported`

Output should include:

- status.
- rejection reasons.
- warnings.
- policy snapshot.
- evidence snapshot reference.
- source classification result.
- idempotency/fingerprint input summary.
- safe-to-convert flag.
- safe-to-persist flag.
- safe-to-mutate-trade flag.
- validated broker reference summary.
- handoff linkage summary.
- mapping readiness summary.

Safety flags:

- `safeToConvert` may be true only for `confirmed_candidate`.
- `safeToPersist` must remain false until a separate persistence boundary
  explicitly enables writes.
- `safeToMutateTrade` must remain false.

## 5. Validation layers

Layer 1: evidence validator result

- evidence validator status must be `valid`.
- `rejected` maps to `evidence_rejected`.
- `needs_review` maps to `evidence_needs_review` or a more specific review
  status.

Layer 2: source classification

- source classification must allow confirmation candidate use.
- source must not be `preview_only`, `dev_fixture`, `mock_broker`, `dry_run`,
  or `local_diagnostics`.
- `broker_confirmed` may be allowed for confirmation candidate review only.
- `production_safe_candidate` must not be assigned by this validator unless a
  future server policy explicitly owns that transition.

Layer 3: source/evidence origin

- source type must be final confirmation or account/order history.
- order form, order preview, and manual-only evidence reject.
- provenance must be present with evidence fingerprint.

Layer 4: broker references

- broker order id, confirmation id, fill id, execution id, broker reference,
  or reviewed strong equivalent must exist.
- missing broker references reject or require review depending on future
  missing-id policy, defaulting to rejection.

Layer 5: trade intent matching

- side must match intended side.
- instrument/ticker/ISIN/instrument id must match intended instrument policy.
- quantity must match intended quantity unless a reviewed partial-fill policy
  applies.
- price must be valid and tied to broker evidence; intended limit price alone
  is not enough.
- timestamp must be plausible and tied to broker evidence.

Layer 6: handoff linkage

- handoff payload fingerprint should match or be present.
- missing handoff fingerprint returns review or rejection depending on future
  policy, defaulting to review for diagnostics and rejection for production.

Layer 7: partial-fill clarity

- full fills may proceed if all other gates pass.
- partial/unclear/multiple-fill evidence returns `partial_fill_review` or
  `needs_review`.
- partial fills do not map to full execution candidates.

Layer 8: idempotency/fingerprint readiness

- evidence fingerprint, broker references, instrument, side, quantity, price,
  timestamp, and handoff fingerprint should be enough to form deterministic
  duplicate-check inputs.
- duplicate lookup remains separate in persistence.

## 6. Rejection reason mapping

Future rejection reasons should include:

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

Additional useful warning codes:

- `confidence_below_review_threshold`
- `account_context_missing`
- `optional_fee_missing`
- `optional_market_missing`
- `manual_review_required`
- `mapping_policy_missing`
- `persistence_not_attempted`
- `trade_mutation_not_attempted`

## 7. Needs-review behavior

`needs_review` should be returned when:

- evidence validator returns `needs_review`.
- field confidence is low but core fields are present.
- handoff fingerprint is missing but evidence is otherwise internally
  consistent.
- account context is missing but broker references and core execution fields
  are present.
- timestamp is plausible but not strong enough for production policy.
- source wording is broker-like but not fully mapped by policy.

Needs-review is not persistence-safe:

- it must not set `safeToPersist=true`.
- it must not create execution records.
- it must not append audit as a persisted execution.
- it must not mutate trades.

Preview UI:

- a future read-only preview may display needs-review output.
- the UI must use language such as `Needs review`, `No persistence`, and
  `No trade mutation`.
- no automatic conversion, persistence, or mutation may follow needs-review.

## 8. Partial-fill handling

Full fill:

- may return `confirmed_candidate` only when evidence and mapping gates pass.
- result candidate should preserve filled/executed status and full quantity.

Partial fill:

- must be explicitly represented.
- should return `partial_fill_review` until partial-fill accounting is
  designed.
- should preserve filled quantity, remaining quantity, fill ids, average price,
  and order reference when present.

Ambiguous partial fill:

- returns `partial_fill_review` or `needs_review`.
- must not convert to full-fill candidate.

Multiple fills:

- remain future design.
- require policy for one aggregate result vs one result per fill, fee
  allocation, duplicate detection, and position state impact.

## 9. Idempotency and fingerprint requirements

The future validator should summarize idempotency inputs:

- broker order id / order number.
- confirmation id / fill id / execution id / strong equivalent.
- instrument/ticker/ISIN/instrument id.
- side.
- quantity.
- price.
- confirmation timestamp.
- handoff payload fingerprint.
- evidence fingerprint.
- capture id / request id.
- provenance hash/reference if later available.

Duplicate prevention:

- duplicate lookup remains a separate persistence concern.
- the confirmation validator should only report whether idempotency inputs are
  sufficient for a later duplicate check.
- local fingerprints must not be treated as durable production duplicate
  protection.

## 10. Relationship to Evidence-to-BrokerExecutionResult Mapper

- The confirmation validator runs before the mapper.
- The mapper must not run on rejected evidence.
- The mapper may produce a preview-only candidate from `confirmed_candidate`
  output once mapper types/implementation exist.
- Mapper output still does not persist or mutate.
- Mapper output must carry validator status, warnings, source classification,
  provenance, idempotency summary, and no-write/no-mutation metadata.

## 11. Relationship to execution records

- A confirmed `BrokerExecutionResult` candidate is not an execution record.
- The execution record candidate builder still runs separately.
- The execution record creation validator still runs separately.
- The persistence validator still runs separately.
- Supabase migration/application remains separate.
- No write path is enabled by this design.

## 12. Relationship to trade mutation

- The validator does not open or close trades.
- The validator does not update live/history trade state.
- Trade mutation remains a separate boundary.
- Semi-auto manual confirmation remains required.
- Automatic mode remains out of scope.
- A future trade mutation path needs its own validator, idempotency policy,
  audit policy, UX, and explicit approval.

## 13. Candidate next actions

A. Create BrokerExecutionResult Confirmation Validator Contract Types

- safest next step.
- can model input/output/status/reason contracts without runtime validation.
- keeps implementation, mapping, persistence, and trade mutation out of scope.

B. Create Evidence-to-BrokerExecutionResult Mapper Contract Types

- useful after validator contract types define confirmed-candidate semantics.
- should remain type-only before implementation.

C. Reassess Avanza Broker Confirmation Capture Readiness

- useful but closer to browser/Avanza behavior.
- should wait until validator and mapper contracts are clearer.

D. Create Avanza Confirmation Capture Manual QA Checklist

- useful for manual testing and evidence review.
- less foundational than validator contract types.

## 14. Recommended next action

**Action 461 - Create BrokerExecutionResult Confirmation Validator Contract Types**

Rationale:

- The validator boundary is now defined in prose.
- Contract types are the safest next step before any validator implementation.
- Type-only contracts can keep confirmation eligibility separate from mapping,
  execution-record creation, persistence, Supabase writes, audit append, trade
  mutation, browser automation, and Avanza behavior.

## 15. Risk assessment

Confirmed candidate mistaken for persistence approval:

- high. `confirmed_candidate` must not imply Supabase write eligibility.

Mapper running on rejected evidence:

- high. Mapper contracts and implementations must require confirmation
  validator success.

Partial-fill ambiguity:

- high. Partial fills remain review-only until accounting policy exists.

Missing provenance:

- high. Missing evidence fingerprint, source classification, capture context,
  or handoff linkage should block or require review.

Idempotency mismatch:

- high. Broker references, evidence fingerprints, and handoff fingerprints
  must align before duplicate checks can be reliable.

Source classification overtrust:

- medium/high. Source classification policy is necessary but not sufficient
  for confirmation.

Avanza UI drift:

- medium/high. Future capture may misread status/source if Avanza wording
  changes.

Trade mutation coupling risk:

- high. Confirmation validation must not mutate trades or imply mutation
  readiness.

## 16. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No validator implementation, mapper
implementation, `BrokerExecutionResult` creation, capture/OCR/browser
extraction, persistence/write behavior, Supabase behavior, audit append, trade
mutation, browser behavior, or Avanza behavior was added.

## Action 461 Follow-Up

Action 461 created
`lib/broker-execution-result-confirmation-validator-contract.ts`.

Contract impact:

- Added type/constant-only contracts for the future BrokerExecutionResult
  confirmation validator.
- Modeled validator input, validation statuses, rejection reasons, warnings,
  policy snapshots, evidence snapshot references, and fingerprint input
  summaries.
- Kept `safeToPersist=false` and `safeToMutateTrade=false` in the result
  contract so confirmed-candidate review cannot imply persistence or trade
  mutation readiness.
- Added no runtime validator, mapper, BrokerExecutionResult creation,
  capture/OCR/browser extraction, persistence/write behavior, Supabase
  behavior, audit append, trade mutation, browser behavior, or Avanza
  behavior.

Next recommended action:

**Action 462 - Reassess BrokerExecutionResult Confirmation Validator Contract Types**

## Action 462 Follow-Up

Action 462 created
`docs/broker-execution-result-confirmation-validator-contract-reassessment.md`.

Reassessment result:

- Verified `lib/broker-execution-result-confirmation-validator-contract.ts`
  remains type/constant-only.
- Confirmed statuses, rejection reasons, warnings, policy snapshots, evidence
  snapshot references, and fingerprint summaries align with this validator
  design.
- Confirmed `safeToPersist=false` and `safeToMutateTrade=false` remain
  explicit in the contract.
- Confirmed no runtime validator, mapper, BrokerExecutionResult creation,
  capture, persistence, Supabase, audit append, trade mutation, browser, or
  Avanza behavior was added.

Next recommended action:

**Action 463 - Create BrokerExecutionResult Confirmation Validator**

## Action 463 Follow-Up

Action 463 created
`lib/broker-execution-result-confirmation-validator.ts`.

Design implementation impact:

- Implemented the pure confirmation validator described by this design.
- The validator uses upstream evidence validation and source classification
  policy, then evaluates handoff fingerprint, broker references, intent
  matching, price/timestamp/provenance, partial-fill ambiguity, and execution
  mode.
- The validator returns typed results only and does not map or create a
  BrokerExecutionResult.
- `confirmed_candidate` remains conversion eligibility only:
  `safeToPersist=false` and `safeToMutateTrade=false`.

Next recommended action:

**Action 464 - Reassess BrokerExecutionResult Confirmation Validator**

## Action 464 Follow-Up

Action 464 created
`docs/broker-execution-result-confirmation-validator-reassessment.md`.

Design verification impact:

- Verified the implemented confirmation validator matches the design boundary:
  pure validation only, no mapper, no BrokerExecutionResult creation, no
  persistence, no audit append, no trade mutation, no UI/capture/browser/Avanza
  behavior.
- Confirmed conservative handling for rejected evidence, needs-review evidence,
  source policy failures, missing handoff fingerprint, automatic mode,
  mismatches, and partial-fill ambiguity.

Next recommended action:

**Action 465 - Create Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 465 Follow-Up

Action 465 created
`lib/evidence-to-broker-execution-result-mapper-contract.ts`.

Validator-design impact:

- The downstream mapper now has contract types that can consume confirmation
  validation results.
- The contract requires no runtime mapping and does not create
  BrokerExecutionResult values.
- Confirmation validation remains upstream of any future mapper
  implementation.

Next recommended action:

**Action 466 - Reassess Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 466 Follow-Up

Action 466 created
`docs/evidence-to-broker-execution-result-mapper-contract-reassessment.md`.

Validator-design impact:

- The downstream mapper contract was verified as type-only and still
  downstream of confirmation validation.
- No runtime mapper or BrokerExecutionResult creation exists.
- Confirmation validation remains the required upstream gate.

Next recommended action:

**Action 467 - Create BrokerExecutionResult Candidate Type/Shape Reassessment**

## Action 467 Follow-Up

Action 467 created
`docs/broker-execution-result-candidate-shape-reassessment.md`.

Validator-design impact:

- Candidate shape reassessment confirmed the mapper target should be a
  separate contract before runtime mapping.
- Existing runtime BrokerExecutionResult is too thin for the validated Avanza
  evidence pipeline.
- Confirmation validation remains separate from candidate construction.

Next recommended action:

**Action 468 - Create BrokerExecutionResult Candidate Contract Types**
