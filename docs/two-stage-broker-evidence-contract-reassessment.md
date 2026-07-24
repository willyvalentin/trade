# Two-Stage Broker Evidence Contract Reassessment

## 1. Purpose

Reassess `lib/two-stage-broker-evidence-contract.ts` before any matching,
finalization, capture, persistence, execution-record, or trade-mutation design
or implementation.

This reassessment is documentation-only. It does not change runtime behavior,
capture, matching, finalization, persistence/write behavior,
Supabase/localStorage behavior, audit append, execution-record creation, trade
mutation, UI wiring, browser automation, or Avanza behavior.

## 2. Current contract inventory

Contract module:

- `lib/two-stage-broker-evidence-contract.ts`
- Contract version: `two_stage_broker_evidence_v1`

Stages:

- `immediate_readback`
- `final_settlement_note`

Lifecycle statuses:

- `pending_broker_confirmation`
- `immediate_readback_observed`
- `provisional_trade_registered`
- `final_note_pending`
- `final_note_available`
- `final_note_matched`
- `finalized`
- `needs_review`
- `final_note_missing`
- `final_note_mismatch`

Immediate readback evidence shape:

- `ImmediateBrokerReadbackEvidence`
- Models broker `avanza`, masked account context, instrument identity, side,
  quantity, visible price/currency if available, transaction/readback
  timestamp, source page identity, handoff payload fingerprint, provisional
  status, final-note-pending flag, missing fields, provisional fields,
  provenance, safety policy, review flags, warnings, and metadata.
- The type restricts `evidenceStage` to `immediate_readback`.
- The type restricts `finalNotePending` to `true`.
- The type restricts `provisionalStatus` to `provisional` or `needs_review`.

Final settlement note evidence shape:

- `FinalBrokerSettlementNoteEvidence`
- Models broker `avanza`, note/reference number, business date, settlement
  date, print date, instrument identity, ISIN, side, quantity, execution price,
  currency, execution time, order type, market/venue, commission,
  consideration, FX rates, total amount, masked account context, provenance,
  matching candidate metadata, finalized fields, missing fields, safety policy,
  review flags, warnings, and metadata.
- The type restricts `evidenceStage` to `final_settlement_note`.
- The type can represent final-note availability and match/review/mismatch
  states, but does not implement finalization.

Matching status/reasons:

- `BrokerEvidenceMatchingStatus`
- `BrokerEvidenceMatchingReason`
- `BrokerEvidenceMatchingCandidate`
- These model exact match, partial-review match, duplicate candidate review,
  mismatch blocking, missing final note, matching signals, and mismatch
  reasons.

Finalization status:

- `BrokerEvidenceFinalizationStatus`
- Models not allowed, not attempted, blocked pending final note, blocked review,
  blocked mismatch, blocked duplicate candidates, and readiness for a future
  finalization boundary.

Agent capability/manual boundary:

- `BrokerEvidenceAgentCapability`
- `BrokerEvidenceManualBoundary`
- Default capabilities include read-only collection/comparison and manual
  review request concepts.
- Default manual boundaries include semi-auto default, manual broker
  confirmation required, automatic final confirmation forbidden, read-only
  collection only, no trade mutation, and no persistence.

Field vocabulary:

- `BrokerEvidenceMissingField`
- `BrokerEvidenceProvisionalField`
- `BrokerEvidenceFinalizedField`
- These vocabularies cover immediate readback fields, official final note
  fields, and known missing-field categories.

Review flags/warnings:

- `BrokerEvidenceReviewFlag`
- `BrokerEvidenceWarning`
- These include immediate-readback-only, final-note-pending/missing/mismatch,
  duplicate candidates, partial match review, missing official fee/total,
  missing instrument identifier, missing handoff fingerprint, account context
  ambiguity, provenance incompleteness, and explicit safe-to-* false warnings.

Safety policy:

- `BrokerEvidenceSafetyPolicy`
- `TWO_STAGE_BROKER_EVIDENCE_DEFAULT_SAFETY_POLICY`
- The policy pins persistence, mutation, finalization, automatic mode, capture
  implementation, matching implementation, finalization implementation,
  execution-record creation, audit append, and browser automation to disabled
  values.

## 3. Boundary verification

Verified:

- The module contains type-only imports.
- The module exports string literal union types, object/array constants, and
  structural TypeScript types.
- The module contains no capture implementation.
- The module contains no matching implementation.
- The module contains no finalization implementation.
- The module contains no execution-record creation.
- The module contains no persistence/write behavior.
- The module contains no Supabase/localStorage behavior.
- The module contains no audit append.
- The module contains no trade mutation.
- The module contains no UI wiring.
- The module contains no browser/Avanza behavior.

The constants provide vocabulary and default metadata only. They do not enforce
runtime policy or perform side effects.

## 4. Alignment with two-stage design

Immediate readback provisional semantics:

- Aligned. `ImmediateBrokerReadbackEvidence` uses
  `evidenceStage: "immediate_readback"`, `finalNotePending: true`, and
  `provisionalStatus`.
- Stage metadata marks immediate readback as not official final evidence and
  final-note-pending.

Final note official settlement semantics:

- Aligned. `FinalBrokerSettlementNoteEvidence` models official settlement note
  fields and can represent available, matched, finalized, review, or mismatch
  lifecycle statuses.
- Stage metadata marks final settlement note as official final evidence in the
  evidence taxonomy, while still keeping finalization not allowed by default.

Lifecycle status coverage:

- Aligned with Action 485. The contract includes the documented lifecycle from
  pending broker confirmation through readback, provisional state, final-note
  pending/available/matched, finalized, review, missing, and mismatch.

Matching concepts:

- Represented but not implemented. The contract includes matching statuses,
  reasons, and candidate metadata without match scoring or decision logic.

Finalization concepts:

- Represented but not implemented. The contract includes finalization statuses
  and default stage metadata, but no finalization validator or state transition
  implementation.

Agent responsibilities:

- Represented as capability and manual-boundary vocabularies.
- The contract preserves read-only collection/comparison language and manual
  broker confirmation requirements.

Manual confirmation boundary:

- Aligned. The default manual boundaries explicitly include
  `manual_broker_confirmation_required` and
  `automatic_final_confirmation_forbidden`.

Relationship to validators/mapper:

- Aligned. The contract gives future validators/mapper code stage-aware input
  vocabulary, but it does not wire into validators or mapper behavior.

Relationship to execution records/live trade management:

- Aligned. The contract distinguishes provisional and final note evidence, but
  does not create execution records or mutate live trade state.

## 5. Safety policy verification

Explicitly confirmed:

- Immediate readback is not final evidence.
- Final settlement note is not automatically persisted.
- Final settlement note is not automatic finalization approval.
- `safeToPersist` remains `false`.
- `safeToMutateTrade` remains `false`.
- `safeToFinalize` remains `false`.
- `automaticModeAllowed` remains `false`.
- `manualBrokerConfirmationRequired` remains `true`.
- Capture implementation remains disabled.
- Matching implementation remains disabled.
- Finalization implementation remains disabled.
- Execution-record creation remains disabled.
- Audit append remains disabled.
- Browser automation remains disabled.

This is the correct conservative stance before any future retrieval, matching,
validation, persistence, or trade-mutation design.

## 6. Remaining gaps

Remaining gaps:

- no immediate readback capture contract/design.
- no final settlement note retrieval contract/design.
- no note matching validator.
- no finalization validator.
- no state model implementation.
- no persistence integration.
- no trade mutation integration.
- no production agent/browser workflow.

These gaps keep capture/readback, official finalization, execution-record
creation, persistence, and trade mutation blocked.

## 7. Candidate next actions

A. Create Final Settlement Note Matching Design.

- Highest priority because the two-stage contract now has enough vocabulary to
  define conservative matching before any retrieval/finalization implementation.

B. Create Immediate Broker Readback Contract Design.

- Useful for refining the provisional readback shape and missing-field policy,
  but the current contract already covers the top-level semantics.

C. Create Final Settlement Note Retrieval Contract Design.

- Useful before read-only Avanza retrieval prototypes, but matching design
  should define what retrieval must prove.

D. Create Provisional Trade State Design.

- Important later, but should wait until matching/finalization boundaries are
  clearer.

## 8. Recommended next action

Recommended next action:

**Action 488 - Create Final Settlement Note Matching Design**

Rationale:

- The contract now distinguishes immediate readback from final note evidence.
- The highest-risk next boundary is deciding whether a final note belongs to a
  provisional trade.
- Matching design should specify exact/partial/mismatch/duplicate behavior
  before retrieval, finalization, execution-record, persistence, or live-trade
  work proceeds.

## 9. Risk assessment

Immediate readback mistaken for final evidence:

- Risk: provisional readback could be treated as official final settlement
  evidence.
- Current control: stage metadata, `finalNotePending: true`, provisional
  status, and default safety policy.

Final note mistaken for persistence approval:

- Risk: official settlement-note evidence could be treated as permission to
  write.
- Current control: `safeToPersist=false` and separate persistence boundary.

Matching ambiguity:

- Risk: final note candidate may only partially match the provisional trade.
- Current control: matching status/reason vocabularies and review flags.

Duplicate note candidates:

- Risk: more than one final note candidate may match.
- Current control: duplicate matching status and duplicate review flag.

Partial-fill ambiguity:

- Risk: one provisional order may produce partial or multiple final note
  records.
- Current control: review-oriented matching vocabulary; further design needed.

FX/commission mismatch:

- Risk: currency conversion, commission, or total amount fields may differ from
  provisional expectations.
- Current control: final-note fields and matching reason vocabulary.

Premature finalization:

- Risk: a final note could be treated as finalization approval without a
  validator.
- Current control: `safeToFinalize=false` and finalization implementation
  disabled.

Trade mutation coupling risk:

- Risk: evidence status could accidentally mutate live positions.
- Current control: `safeToMutateTrade=false` and no trade mutation boundary.

Agent over-permission risk:

- Risk: agent could infer permission to click final broker confirmation or
  automate Avanza.
- Current control: `automaticModeAllowed=false`,
  `manualBrokerConfirmationRequired=true`, and manual boundary constants.

## 10. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No capture, matching, finalization,
persistence/write behavior, Supabase/localStorage behavior, audit append,
execution-record creation, trade mutation, UI wiring, browser automation, or
Avanza behavior was added.

## Action 488 Follow-Up - Final Settlement Note Matching Design

Action 488 created `docs/final-settlement-note-matching-design.md`.

Reassessment impact:

- The matching design defines how future final settlement note evidence should
  be compared with provisional immediate readback/provisional trade context.
- The design keeps matching conceptual only; no matching implementation or
  finalization implementation was added.
- The design confirms `final_note_matched` is only a future finalization
  candidate state, not persistence, finalization, execution-record creation, or
  trade mutation approval.

Next recommended action:

**Action 489 - Create Final Settlement Note Matching Contract Types**

## Action 489 Follow-Up - Matching Contract Types Created

Action 489 created `lib/final-settlement-note-matching-contract.ts`.

Reassessment impact:

- The final settlement note matching design now has type-only contracts for
  inputs, results, hard gates, soft signals, mismatch reasons, duplicate
  reasons, partial-fill status, lifecycle transitions, policy snapshots, and
  safety policy.
- The two-stage broker evidence contract remains unchanged.
- Matching concepts remain typed only; no matching implementation or
  finalization implementation was added.

Next recommended action:

**Action 490 - Reassess Final Settlement Note Matching Contract Types**

## Action 490 Follow-Up - Matching Contract Reassessment

Action 490 created
`docs/final-settlement-note-matching-contract-reassessment.md`.

Reassessment impact:

- The matching contract was verified as type/constant-only and conservative.
- The two-stage broker evidence contract remains separate from matching
  implementation.
- Future matching validator work can use the matching contract without changing
  immediate readback or final settlement note evidence semantics.

Next recommended action:

**Action 491 - Create Final Settlement Note Matching Validator**

## Action 491 Follow-Up - Matching Validator Created

Action 491 created
`lib/final-settlement-note-matching-validator.ts`.

Reassessment impact:

- The two-stage evidence contract remains unchanged.
- Immediate readback evidence remains provisional.
- Final settlement-note evidence remains official settlement evidence only after
  separate matching/review; the validator does not finalize it.
- The validator consumes two-stage evidence records and returns a typed
  read-only matching result.
- The result keeps `safeToFinalize=false`, `safeToPersist=false`, and
  `safeToMutateTrade=false`.

Boundary:

- No capture, finalization, persistence, execution-record creation, trade
  mutation, UI wiring, browser automation, or Avanza behavior was added to the
  two-stage evidence contract.

Next recommended action:

**Action 492 - Reassess Final Settlement Note Matching Validator**

## Action 492 Follow-Up - Matching Validator Reassessed

Action 492 created
`docs/final-settlement-note-matching-validator-reassessment.md`.

Reassessment impact:

- The two-stage evidence contract remains unchanged.
- The validator consumes supplied two-stage evidence records but does not
  mutate their lifecycle state.
- Immediate readback remains provisional.
- Final settlement note evidence remains review/finalization-candidate evidence
  only after matching; the validator itself does not finalize or persist it.

Next recommended action:

**Action 493 - Create Final Settlement Note Match Dev Preview Design**

## Action 493 Follow-Up - Match Dev Preview Design Created

Action 493 created
`docs/final-settlement-note-match-dev-preview-design.md`.

Reassessment impact:

- The two-stage evidence contract remains unchanged.
- The preview design would display provisional immediate readback evidence and
  final settlement note evidence side by side without mutating either record.
- Immediate readback remains provisional and final note matching remains
  upstream of finalization.
- No two-stage contract behavior, lifecycle mutation, persistence,
  execution-record creation, trade mutation, capture/browser automation, or
  Avanza behavior was added.

Next recommended action:

**Action 494 - Create Final Settlement Note Match Dev Preview**

## Action 494 Follow-Up - Match Dev Preview Created

Action 494 created a fixture-only preview that supplies provisional immediate
readback evidence and final settlement note evidence to the pure matching
validator.

Reassessment impact:

- The two-stage evidence contract remains unchanged.
- The preview does not mutate immediate readback evidence or final settlement
  note evidence.
- Lifecycle suggestions remain display metadata only.
- No capture, finalization, persistence, execution-record creation, trade
  mutation, browser automation, or Avanza behavior was added.

Next recommended action:

**Action 495 - Reassess Final Settlement Note Match Dev Preview**

## Action 495 Follow-Up - Match Dev Preview Reassessed

Action 495 created
`docs/final-settlement-note-match-dev-preview-reassessment.md`.

Reassessment impact:

- The preview uses fixture two-stage evidence only.
- It does not mutate immediate readback evidence, final settlement note
  evidence, or lifecycle state.
- The two-stage evidence contract remains unchanged.

Next recommended action:

**Action 496 - Create Finalization Candidate Contract Types**
