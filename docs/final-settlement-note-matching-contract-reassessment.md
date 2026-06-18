# Final Settlement Note Matching Contract Reassessment

## 1. Purpose

Reassess `lib/final-settlement-note-matching-contract.ts` before any matching
validator implementation.

This reassessment is documentation-only. It does not change runtime behavior,
matching, finalization, capture, persistence/write behavior,
Supabase/localStorage behavior, audit append, execution-record creation, trade
mutation, UI wiring, browser automation, or Avanza behavior.

## 2. Current contract inventory

Contract module:

- `lib/final-settlement-note-matching-contract.ts`
- Contract version: `final_settlement_note_matching_v1`

Input type:

- `FinalSettlementNoteMatchingInput`
- References provisional immediate readback evidence, provisional trade context,
  handoff payload fingerprint, final settlement note evidence, masked account
  context, source metadata, optional execution candidate metadata, policy
  snapshot, and metadata.

Result type:

- `FinalSettlementNoteMatchingResult`
- Carries status, confidence, matched flag, hard-gate results, soft-signal
  results, mismatch reasons, duplicate reasons, partial-fill matching status,
  lifecycle transition suggestion, review flags, warnings, policy snapshot,
  safety policy, and explicit no-side-effect booleans.

Confidence/status values:

- `exact_match`
- `strong_match`
- `partial_match`
- `ambiguous_match`
- `mismatch`
- `duplicate_candidates`
- `insufficient_data`
- `needs_review`
- status values also include `not_attempted`, `matched`, `needs_review`,
  `mismatch`, `duplicate_candidates`, and `insufficient_data`.

Hard gates:

- `same_broker`
- `same_side`
- `compatible_instrument_identity`
- `compatible_quantity_or_explicit_partial_fill_model`
- `compatible_trade_or_business_date`
- `non_contradictory_account_or_category`
- `final_note_source_identity_present`
- `provenance_present`

Soft signals:

- `price_tolerance`
- `time_proximity`
- `currency_match`
- `order_type_match`
- `market_or_venue_match`
- `amount_or_commission_consistency`
- `fx_consistency`
- `handoff_fingerprint_linkage`
- `note_reference_uniqueness`

Mismatch reasons:

- instrument, side, quantity, date, price, account, currency, order type,
  market/venue, FX/commission mismatches.
- missing note reference.
- missing provenance.
- partial-fill ambiguity.
- insufficient data.

Duplicate reasons:

- duplicate note candidates.
- same note matches multiple provisional trades.
- duplicate note reference number.
- duplicate handoff payload fingerprint.
- duplicate provenance reference.

Partial-fill matching statuses:

- `not_partial`
- `single_note_full_fill`
- `single_note_partial_fill_requires_review`
- `multiple_notes_aggregate_requires_review`
- `multiple_fills_individual_review`
- `partial_fill_ambiguous`

Lifecycle transition suggestions:

- `final_note_pending_to_final_note_available`
- `final_note_available_to_final_note_matched`
- `final_note_available_to_needs_review`
- `final_note_available_to_final_note_mismatch`
- `final_note_pending_to_final_note_missing`
- `final_note_matched_to_finalization_candidate_only`

Policy snapshots:

- `FinalSettlementNoteMatchingPolicySnapshot`
- default policy requires broker/side/instrument/quantity/date/account/source
  identity/provenance gates.
- default policy allows partial-match review.
- default policy disallows duplicate auto-resolution, finalization,
  persistence, and trade mutation.

Safety policy:

- `FinalSettlementNoteMatchingSafetyPolicy`
- `FINAL_SETTLEMENT_NOTE_MATCHING_DEFAULT_SAFETY_POLICY`
- keeps finalization, persistence, trade mutation, matching implementation,
  finalization implementation, capture implementation, execution-record
  creation, audit append, and browser automation disabled.

Optional candidate/execution metadata references:

- `BrokerExecutionResultCandidate`
- `ExecutionRecordCandidate`
- candidate fingerprints and related metadata.

## 3. Boundary verification

Verified:

- The module contains type-only imports.
- The module exports string literal union types, arrays, metadata constants,
  safety constants, and structural TypeScript types.
- The module is type-only/constants-only.
- The module contains no matching implementation.
- The module contains no finalization implementation.
- The module contains no capture implementation.
- The module contains no execution-record creation.
- The module contains no persistence/write behavior.
- The module contains no Supabase/localStorage behavior.
- The module contains no audit append.
- The module contains no trade mutation.
- The module contains no UI wiring.
- The module contains no browser/Avanza behavior.

The contract provides vocabulary and result shapes only. It does not score,
compare, fetch, persist, finalize, or mutate.

## 4. Alignment with matching design

Matching inputs:

- Aligned. The input can reference immediate readback evidence, provisional
  trade context, handoff fingerprint, final settlement note evidence,
  account/category context, broker/source metadata, optional broker execution
  candidate, and optional execution record candidate metadata.

Matching fields:

- Aligned. Hard gates and soft signals cover broker, account/category,
  instrument identity, side, quantity, date/time, price, currency, order type,
  market/venue, amount/commission, FX, handoff fingerprint, note/reference, and
  provenance concepts.

Hard gates:

- Aligned. The required hard gate vocabulary matches the design's conservative
  same-broker, same-side, compatible instrument, quantity/partial-fill,
  date/account/source/provenance requirements.

Soft signals:

- Aligned. The soft signal vocabulary matches price tolerance, time proximity,
  currency, order type, venue, amount/commission, FX, handoff fingerprint, and
  note/reference uniqueness.

Confidence model:

- Aligned. Exact, strong, partial, ambiguous, mismatch, duplicate,
  insufficient-data, and needs-review concepts are represented.

Mismatch handling:

- Aligned. Mismatch reasons cover instrument, side, quantity, date, price,
  account, missing reference, missing provenance, partial fill ambiguity, and
  insufficient data.

Duplicate handling:

- Aligned. Duplicate note candidates, one note matching multiple provisional
  trades, duplicate note references, duplicate handoff fingerprints, and
  duplicate provenance references are represented.

Partial-fill handling:

- Aligned. Full-fill, single-note partial-fill review, multiple-note aggregate
  review, multiple-fill individual review, and ambiguous partial-fill states are
  represented.

Lifecycle transitions:

- Aligned. The contract models pending-to-available,
  available-to-matched/review/mismatch, pending-to-missing, and matched-to
  finalization-candidate-only suggestions.

Relationship to validators/mapper/execution records/live trade:

- Aligned. The contract can carry optional mapper/execution candidate metadata,
  but it does not invoke validators, create candidates, create execution
  records, persist, or mutate live trade state.

## 5. Safety policy verification

Explicitly confirmed:

- Matching result is not finalization approval.
- Matching result is not persistence approval.
- Matching result is not trade mutation approval.
- `safeToFinalize` remains `false`.
- `safeToPersist` remains `false`.
- `safeToMutateTrade` remains `false`.
- Matching implementation remains disabled.
- Finalization implementation remains disabled.
- Capture implementation remains disabled.
- Execution-record creation remains disabled.
- Audit append remains disabled.
- Browser automation remains disabled.
- Automatic mode remains out of scope.

This is the correct conservative stance before any matching validator
implementation.

## 6. Remaining gaps

Remaining gaps:

- no matching validator implementation.
- no finalization validator.
- no immediate readback capture contract/design.
- no final note retrieval contract/design.
- no real Avanza note retrieval.
- no state model implementation.
- no persistence integration.
- no trade mutation integration.

These gaps keep final-note matching, finalization, execution-record creation,
persistence, and trade mutation blocked.

## 7. Candidate next actions

A. Create Final Settlement Note Matching Validator.

- Highest priority because the matching contract is now stable enough to define
  a pure validator that can evaluate hard gates, soft signals, mismatch reasons,
  duplicate reasons, and review states without side effects.

B. Create Immediate Broker Readback Contract Design.

- Useful for refining provisional readback shape before capture, but matching
  now has enough vocabulary for a pure validator design.

C. Create Final Settlement Note Retrieval Contract Design.

- Useful before read-only retrieval, but should be informed by the matching
  validator requirements.

D. Create Provisional Trade State Design.

- Important later, after matching validator and retrieval contracts clarify
  evidence flow.

## 8. Recommended next action

Recommended next action:

**Action 491 - Create Final Settlement Note Matching Validator**

## 11. Action 491 - Matching Validator Created

Action 491 created
`lib/final-settlement-note-matching-validator.ts`.

Implementation result:

- `validateFinalSettlementNoteMatch(input)` now returns a typed
  `FinalSettlementNoteMatchingResult`.
- The validator evaluates the existing hard gates: same broker, same side,
  compatible instrument identity, compatible quantity or explicit partial-fill
  model, compatible trade/business date, non-contradictory account/category,
  final note source identity, and provenance.
- The validator evaluates the existing soft signals: price tolerance, time
  proximity, currency, order type, market/venue, amount/commission, FX,
  handoff fingerprint linkage, and note-reference uniqueness.
- Duplicate metadata and duplicate final-note review flags return
  `duplicate_candidates`.
- Missing required data returns `insufficient_data`.
- Hard contradictions return `mismatch`.
- Explicit or ambiguous partial-fill cases return review-oriented outcomes.
- Price/time soft-signal conflicts return `needs_review` with partial or
  ambiguous confidence.
- The safety policy type now allows `matchingImplementationEnabled` to reflect
  a pure validator implementation while keeping finalization, persistence,
  trade mutation, capture, audit append, execution-record creation, browser
  automation, and Avanza behavior disabled.

Safety result:

- The validator is pure and deterministic.
- It does not capture, finalize, persist, write Supabase/localStorage, append
  audit, create execution records, mutate trades, wire UI, automate a browser,
  or change Avanza behavior.
- `safeToFinalize=false`, `safeToPersist=false`, and
  `safeToMutateTrade=false` remain hard-coded in the result.

Recommended next action:

**Action 492 - Reassess Final Settlement Note Matching Validator**

## 12. Action 492 - Matching Validator Reassessed

Action 492 created
`docs/final-settlement-note-matching-validator-reassessment.md`.

Reassessment result:

- `validateFinalSettlementNoteMatch` remains pure, deterministic,
  conservative, and matching-only.
- The contract module remains type/constant-oriented; the validator is the
  separate pure implementation.
- `matchingImplementationEnabled=true` is scoped to the validator safety policy
  only and does not enable finalization, persistence, trade mutation, capture,
  audit append, execution-record creation, browser automation, or Avanza
  behavior.
- `safeToFinalize=false`, `safeToPersist=false`, and
  `safeToMutateTrade=false` remain explicit.

Recommended next action:

**Action 493 - Create Final Settlement Note Match Dev Preview Design**

## 13. Action 493 - Match Dev Preview Design Created

Action 493 created
`docs/final-settlement-note-match-dev-preview-design.md`.

Contract reassessment impact:

- The matching input/result contract now has a preview design that explains how
  status, confidence, hard gates, soft signals, mismatch reasons, duplicate
  reasons, partial-fill status, lifecycle suggestion, warnings, review flags,
  and safety policy should be displayed.
- Preview design keeps `safeToFinalize=false`, `safeToPersist=false`, and
  `safeToMutateTrade=false` visible.
- `matchingImplementationEnabled=true` remains scoped to pure validator logic.
- No contract behavior, validator behavior, UI implementation, persistence,
  finalization, trade mutation, execution-record creation, capture, browser
  automation, or Avanza behavior was added.

Recommended next action:

**Action 494 - Create Final Settlement Note Match Dev Preview**

## 14. Action 494 - Match Dev Preview Created

Action 494 created the fixture-only final settlement note match preview.

Contract reassessment impact:

- `FinalSettlementNoteMatchingResult` is now rendered in a dev preview without
  changing the contract.
- Hard gate results, soft signal results, mismatch reasons, duplicate reasons,
  partial-fill status, lifecycle transition suggestion, warnings, review flags,
  and safety policy are displayed as read-only metadata.
- `safeToFinalize=false`, `safeToPersist=false`, and
  `safeToMutateTrade=false` remain visible.
- No contract behavior, finalization, persistence, execution-record creation,
  trade mutation, capture/browser automation, or Avanza behavior was added.

Recommended next action:

**Action 495 - Reassess Final Settlement Note Match Dev Preview**

## 15. Action 495 - Match Dev Preview Reassessed

Action 495 created
`docs/final-settlement-note-match-dev-preview-reassessment.md`.

Contract reassessment impact:

- The preview renders `FinalSettlementNoteMatchingResult` as read-only metadata
  only.
- Contract fields for hard gates, soft signals, mismatch reasons, duplicate
  reasons, partial-fill status, lifecycle suggestion, warnings, review flags,
  and safety policy remain display-only.
- No contract behavior, finalization, persistence, execution-record creation,
  trade mutation, capture/browser automation, or Avanza behavior was added.

Recommended next action:

**Action 496 - Create Finalization Candidate Contract Types**

## 16. Action 496 - Finalization Candidate Contract Types Created

Action 496 created `lib/finalization-candidate-contract.ts`.

Contract reassessment impact:

- Final settlement note matching contracts remain unchanged.
- Matching result metadata can now be referenced by type-only finalization
  candidate contracts.
- The finalization candidate safety policy keeps `safeToFinalize=false`,
  `safeToPersist=false`, `safeToMutateTrade=false`,
  `safeToUpdateStats=false`, and `safeToCreateExecutionRecord=false`.
- No finalization validator or runtime behavior was added.

Recommended next action:

**Action 497 - Reassess Finalization Candidate Contract Types**

Rationale:

- The design and contracts now define the required matching vocabulary.
- A pure validator can be designed/implemented without capture, persistence,
  finalization, execution-record creation, or trade mutation.
- Validator behavior should be established before retrieval or state mutation
  designs depend on match results.

## 17. Action 497 - Finalization Candidate Contract Types Reassessed

Action 497 created
`docs/finalization-candidate-contract-reassessment.md`.

Contract reassessment impact:

- Final settlement note matching contracts remain unchanged.
- Finalization candidate contracts were verified as type-only/constants-only
  metadata downstream of matched final note evidence.
- Matching results can be referenced by candidates without approving
  finalization, persistence, execution-record creation, stats/PnL updates, or
  trade mutation.
- The candidate safety policy keeps `safeToFinalize=false`,
  `safeToPersist=false`, `safeToMutateTrade=false`,
  `safeToUpdateStats=false`, and `safeToCreateExecutionRecord=false`.

Recommended next action:

**Action 498 - Create Finalization Candidate Builder Design**

## 9. Risk assessment

Contract mistaken for implemented matching:

- Risk: callers assume the contract performs matching.
- Current control: module comments and reassessment state that it is
  type/constant-only.

Match mistaken for finalization approval:

- Risk: a future match result is treated as finalization approval.
- Current control: `safeToFinalize=false` and lifecycle transition says
  finalization candidate only.

Match mistaken for persistence approval:

- Risk: a future match result is treated as permission to write.
- Current control: `safeToPersist=false` and no persistence implementation.

False positive match:

- Risk: final note is assigned to the wrong provisional trade.
- Current control: hard gate and duplicate reason vocabulary.

False negative match:

- Risk: valid final note is blocked by missing/format-shifted soft fields.
- Current control: partial/ambiguous/needs-review confidence states.

Duplicate candidates:

- Risk: multiple notes or provisional trades claim the same match.
- Current control: duplicate reason vocabulary and duplicate-candidates status.

Partial-fill ambiguity:

- Risk: quantity mismatch is accepted without an explicit partial-fill model.
- Current control: partial-fill status vocabulary and quantity hard gate.

FX/commission mismatch:

- Risk: fees, FX, consideration, or totals conflict.
- Current control: soft signal and mismatch reason vocabulary.

Premature trade mutation/finalization:

- Risk: match outputs mutate live or historical trade state.
- Current control: `safeToMutateTrade=false`, `safeToFinalize=false`, and no
  trade mutation/finalization implementation.

## 10. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No matching implementation, finalization,
capture, persistence/write behavior, Supabase/localStorage behavior, audit
append, execution-record creation, trade mutation, UI wiring, browser
automation, or Avanza behavior was added.

## Action 498 - Finalization Candidate Builder Design Created

Action 498 created `docs/finalization-candidate-builder-design.md`.

Contract reassessment impact:

- Final settlement note matching contracts remain unchanged.
- The builder design consumes the matching result as upstream metadata but does
  not change matching semantics.
- Matching output remains separate from finalization approval, persistence,
  execution-record creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser automation, and Avanza behavior.
- The future builder must preserve conservative safety flags and review/block
  outcomes.

Recommended next action:

**Action 499 - Create Finalization Candidate Builder Contract Types**
