# Final Settlement Note Matching Design

## 1. Purpose

Define how Ture should later match a final Avanza settlement note /
`avrakningsnota` to a provisional immediate broker readback or provisional
trade.

This design is documentation-only. It does not implement matching,
finalization, capture/readback, browser automation, OCR/browser extraction,
persistence/write behavior, Supabase/localStorage writes, audit append,
execution-record creation, trade mutation, UI wiring, or Avanza behavior.

## 2. Scope

Included:

- final settlement note matching design.
- confidence scoring concepts.
- exact, strong, partial, ambiguous, mismatch, duplicate, and insufficient-data
  match outcomes.
- hard gates and soft matching signals.
- mismatch handling.
- duplicate note handling.
- partial-fill handling.
- final-note matching lifecycle transitions.

Excluded:

- implementation.
- capture/readback.
- finalization writes.
- execution-record creation.
- persistence.
- trade mutation.
- automatic mode.
- browser/Avanza automation.
- OCR/browser extraction.

## 3. Matching inputs

Matching should consume read-only evidence/context only:

- provisional immediate readback evidence.
- provisional trade context, if a future provisional state exists.
- handoff payload fingerprint.
- final settlement note evidence.
- masked account/category context.
- broker/source metadata.
- optional existing `BrokerExecutionResultCandidate`.
- optional existing execution candidate metadata.

The matcher should not require any persistence row to run conceptually, and a
match result should not create or update persistence by itself.

## 4. Matching fields

Primary matching fields:

- broker.
- masked account/category.
- instrument name.
- ISIN, ticker, or broker instrument id.
- side.
- quantity.
- business/trade date.
- execution time or approximate time.
- execution price.
- currency.
- order type.
- market/venue.
- note/reference number.
- total amount.
- commission/fee.
- FX rate if applicable.
- handoff payload fingerprint.
- provenance/source reference.

Field priority should favor broker-originating final note fields over
provisional or user-entered fields.

## 5. Matching confidence model

Possible confidence levels:

- `exact_match`.
- `strong_match`.
- `partial_match`.
- `ambiguous_match`.
- `mismatch`.
- `duplicate_candidates`.
- `insufficient_data`.

Exact match requirements:

- hard gates pass.
- broker, side, instrument identity, quantity, trade/business date, and account
  context are compatible.
- final note source identity and provenance are present.
- note/reference number is unique for the trade context.
- price/currency are compatible.
- no duplicate note candidates exist.
- no material commission/FX/total contradiction exists.

Strong match requirements:

- hard gates pass.
- instrument identity is strong but may use a different field combination
  between readback and final note, such as instrument name plus ISIN.
- price, time, currency, account/category, and note reference support the same
  trade.
- minor optional fields may be absent.
- no duplicate candidate exists.

Partial match rules:

- hard gates pass, but one or more soft signals are missing or weak.
- examples: missing exact time, missing handoff fingerprint, missing commission,
  or approximate price-only comparison.
- partial matches require review before finalization.

Ambiguous match rules:

- more than one provisional trade or final note could plausibly match.
- instrument/quantity/date are compatible but account, time, reference, or
  price context is not enough to choose one safely.
- ambiguous matches require review and must not finalize.

Blocked matching:

- hard gate failure.
- contradictory broker, side, account, instrument, date, or quantity without an
  explicit partial-fill model.
- duplicate candidate conflict.
- missing provenance/source identity.

## 6. Required hard gates

Hard gates:

- same broker.
- same side.
- compatible instrument identity.
- compatible quantity or explicit partial-fill model.
- compatible trade/business date.
- account/category not contradictory.
- final note source identity present.
- provenance present.

If a hard gate fails, the match should be `mismatch` or `needs_review` depending
on whether the conflict is explicit or the data is missing. Hard gates must not
be bypassed by soft signals.

## 7. Soft matching signals

Soft signals:

- price tolerance.
- time proximity.
- currency.
- order type.
- market/venue.
- amount/commission consistency.
- FX consistency.
- handoff fingerprint linkage.
- note/reference uniqueness.

Soft signals can raise confidence only after hard gates pass. Strong soft
signals can move a candidate from partial to strong match, but they must not
override hard-gate contradictions.

## 8. Mismatch handling

Instrument mismatch:

- Blocks matching unless a verified broker identifier proves both labels refer
  to the same instrument.

Side mismatch:

- Blocks matching.

Quantity mismatch:

- Blocks matching unless an explicit partial-fill model explains the mismatch.

Date mismatch:

- Requires review or blocks matching depending on settlement/trade date
  semantics.

Price mismatch:

- Requires review or blocks matching depending on tolerance, currency, and
  whether the final note shows execution price, average price, or converted
  amount.

Account mismatch:

- Blocks matching when account/category contexts contradict.

Missing note reference:

- Requires review because uniqueness cannot be proven.

Duplicate candidate notes:

- Requires review. No automatic tie-breaker should finalize a duplicate set.

## 9. Partial-fill handling

Single final note covering full fill:

- May match exactly or strongly if hard gates pass and quantity/price/date
  context is compatible.

Final note covering partial fill:

- Can match only if provisional evidence or broker note clearly supports a
  partial-fill model.
- Requires review unless the future partial-fill validator can prove the
  expected relationship.

Multiple final notes/fills:

- Match as a group only after aggregate quantity, weighted/average price,
  currency, fees, dates, and account context are coherent.
- Individual fill matching should preserve each note/reference number.

Aggregate vs individual fill matching:

- Aggregate matching can support final trade statistics later.
- Individual fill matching is better for audit lineage and duplicate
  prevention.
- When unclear, prefer review over aggregation.

Default conservative handling:

- If partial-fill visibility is unclear, classify as `partial_match` or
  `ambiguous_match`.
- Do not finalize.
- Do not persist.
- Do not mutate trade state.

## 10. Duplicate note handling

Multiple candidate notes for the same provisional trade:

- Mark `duplicate_candidates`.
- Require review.
- Do not finalize.

Same note matching multiple provisional trades:

- Mark conflict.
- Require review.
- Do not assign automatically.

Duplicate reference numbers:

- Treat as a blocking data-quality issue unless broker source/provenance
  explains the duplication.

Conflict resolution:

- Requires human review or a future explicit duplicate-resolution validator.
- Must retain all candidate evidence references and reasons.

## 11. Lifecycle transitions

Allowed conceptual transitions:

- `final_note_pending` -> `final_note_available`.
- `final_note_available` -> `final_note_matched`.
- `final_note_available` -> `needs_review`.
- `final_note_available` -> `final_note_mismatch`.
- `final_note_pending` -> `final_note_missing`.
- `final_note_matched` -> finalization candidate only, not actual
  finalization.

Transition notes:

- `final_note_matched` does not imply `finalized`.
- `final_note_matched` does not imply persistence.
- `final_note_matched` does not imply trade mutation.
- `needs_review`, `final_note_mismatch`, and `final_note_missing` must block
  automatic finalization.

## 12. Relationship to validators/mapper

- Avanza evidence validator validates final note evidence completeness,
  provenance, and field sanity.
- BrokerExecutionResult confirmation validator validates confirmation
  eligibility.
- Evidence-to-BrokerExecutionResult mapper creates
  `BrokerExecutionResultCandidate` only after its own gates.
- Final settlement note matching should run before any finalization decision.
- Matching does not persist or mutate.
- Matching does not create a `BrokerExecutionResultCandidate` by itself unless
  a future mapper boundary explicitly consumes the match result.

## 13. Relationship to execution records

- A matched note is not an execution record.
- A matched note does not create a persistence row.
- Execution record candidate builder remains separate.
- Persistence validator remains separate.
- Supabase migration/application remains separate.
- Matching evidence can become an input to future execution-record candidate
  creation only after a separate approved design.

## 14. Relationship to live trade management

- Matching a final note may later update final stats.
- Live trade management during the trading day may use provisional readback
  only after a separate provisional trade state design is approved.
- Matching does not open positions.
- Matching does not close positions.
- Matching does not change exits, targets, stops, or broker orders.
- Trade mutation remains separate.

## 15. Agent responsibilities

Future agent permissions:

- The agent may eventually retrieve final note evidence read-only.
- The agent may suggest match candidates.
- The agent may explain match confidence and review reasons.

Agent prohibitions:

- The agent must not finalize without a separate approved finalization
  boundary.
- The agent must not persist without a separate approved persistence boundary.
- The agent must not mutate trades without a separate approved trade-mutation
  boundary.
- The agent must not click final broker confirmation in semi-auto mode.
- Automatic mode remains out of scope.

Semi-auto manual confirmation remains default.

## 16. Candidate next actions

A. Create Final Settlement Note Matching Contract Types.

- Highest priority because this design now defines match statuses, hard gates,
  soft signals, duplicate handling, partial-fill handling, and lifecycle
  transitions.

B. Create Immediate Broker Readback Contract Design.

- Useful for refining provisional evidence details and missing-field policy.

C. Create Final Settlement Note Retrieval Contract Design.

- Useful before read-only retrieval prototypes, but matching contracts should
  define what retrieval must produce.

D. Create Provisional Trade State Design.

- Important later, after matching and retrieval contracts are clearer.

## 17. Recommended next action

Recommended next action:

**Action 489 - Create Final Settlement Note Matching Contract Types**

Rationale:

- The design should be captured in pure TypeScript contract types before any
  validator or retrieval implementation is considered.
- Contract types can preserve the conservative boundary while giving future
  matching/review work a stable vocabulary.

## 18. Risk assessment

False positive match:

- Risk: final note is assigned to the wrong provisional trade.
- Control: hard gates, duplicate review, and provenance requirements.

False negative match:

- Risk: valid final note is not matched because a soft field is missing or
  formatted differently.
- Control: partial/ambiguous review states instead of immediate rejection.

Duplicate candidates:

- Risk: multiple notes or multiple provisional trades match the same evidence.
- Control: duplicate candidate status and review-only resolution.

Partial-fill ambiguity:

- Risk: quantity mismatch is incorrectly accepted or rejected.
- Control: explicit partial-fill model requirement.

FX/commission mismatch:

- Risk: converted totals, FX, or commission fields conflict.
- Control: review/block depending on tolerance and source field semantics.

Time/date mismatch:

- Risk: trade date, business date, settlement date, or execution time are
  confused.
- Control: distinguish date fields and require review on contradictions.

Account mismatch:

- Risk: note belongs to a different account/category.
- Control: account contradiction blocks matching.

Premature finalization:

- Risk: a matched note is treated as finalization approval.
- Control: `final_note_matched` is finalization candidate only.

Persistence coupling risk:

- Risk: match result is treated as permission to write.
- Control: matching does not persist and does not create execution records.

Agent over-permission risk:

- Risk: agent uses matching design as permission for broker/browser actions.
- Control: read-only retrieval and semi-auto manual confirmation boundaries.

## Action 489 - Matching Contract Types Created

Action 489 created `lib/final-settlement-note-matching-contract.ts`.

Contract coverage:

- `FinalSettlementNoteMatchingInput` models provisional immediate readback,
  provisional trade context, handoff payload fingerprint, final settlement note
  evidence, masked account/category context, broker/source metadata, optional
  `BrokerExecutionResultCandidate`, and optional `ExecutionRecordCandidate`
  metadata.
- `FinalSettlementNoteMatchingResult` models confidence/status, matched flag,
  hard-gate results, soft-signal results, mismatch reasons, duplicate reasons,
  partial-fill status, lifecycle transition suggestion, review flags, warnings,
  policy snapshot, and safety policy.
- Confidence/status vocabularies include exact, strong, partial, ambiguous,
  mismatch, duplicate candidates, insufficient data, and needs-review concepts.
- Hard-gate, soft-signal, mismatch, duplicate, partial-fill, lifecycle, policy,
  and safety concepts are typed only.
- The default safety policy keeps `safeToFinalize=false`,
  `safeToPersist=false`, and `safeToMutateTrade=false`.

Boundary:

- The contract does not implement matching.
- The contract does not implement finalization.
- The contract does not implement capture, persistence, audit append,
  execution-record creation, trade mutation, UI wiring, browser automation, or
  Avanza behavior.

Next recommended action:

**Action 490 - Reassess Final Settlement Note Matching Contract Types**

## Action 490 - Matching Contract Types Reassessed

Action 490 created
`docs/final-settlement-note-matching-contract-reassessment.md`.

Reassessment result:

- `lib/final-settlement-note-matching-contract.ts` remains type/constant-only.
- Matching input/output, confidence/status values, hard gates, soft signals,
  mismatch reasons, duplicate reasons, partial-fill statuses, lifecycle
  transitions, policy snapshot, and safety policy align with this design.
- `safeToFinalize=false`, `safeToPersist=false`, and
  `safeToMutateTrade=false` remain explicit.
- No matching implementation, finalization, capture, persistence,
  execution-record creation, trade mutation, UI wiring, browser automation, or
  Avanza behavior was added.

Next recommended action:

**Action 491 - Create Final Settlement Note Matching Validator**

## Action 491 - Matching Validator Created

Action 491 created
`lib/final-settlement-note-matching-validator.ts`.

Design impact:

- The matching design now has a pure deterministic validator implementation.
- Hard gates block or require review for broker, side, instrument, quantity,
  date, account/category, source identity, and provenance failures.
- Soft signals influence review confidence for price, time, currency, order
  type, venue, amounts/commission, FX, handoff fingerprint, and note-reference
  uniqueness.
- Exact/strong matches can be identified as matched, while partial, ambiguous,
  duplicate, insufficient-data, and mismatch cases remain conservative.
- `matchingImplementationEnabled` may now be true only for the pure validator
  safety policy; it does not enable finalization, persistence, trade mutation,
  capture, audit append, execution-record creation, browser automation, or
  Avanza behavior.
- Matching remains a decision surface only; it is not finalization,
  persistence, execution-record creation, trade mutation, browser automation,
  or Avanza automation.

Safety boundary:

- The validator always returns `safeToFinalize=false`,
  `safeToPersist=false`, and `safeToMutateTrade=false`.
- No entry point created by this action performs capture, finalization,
  persistence/write behavior, Supabase/localStorage behavior, audit append,
  execution-record creation, UI wiring, browser automation, or Avanza behavior.

Next recommended action:

**Action 492 - Reassess Final Settlement Note Matching Validator**

## Action 492 - Matching Validator Reassessed

Action 492 created
`docs/final-settlement-note-matching-validator-reassessment.md`.

Design impact:

- The validator was reassessed as a pure, deterministic matching decision
  surface.
- Hard gates remain conservative, soft signals remain confidence/review
  metadata, and duplicate/partial-fill/insufficient-data paths remain
  review-oriented.
- Exact/strong matches remain non-finalizing, non-persisting, and
  non-mutating.
- The next safe design step is a read-only dev preview for match results.

Next recommended action:

**Action 493 - Create Final Settlement Note Match Dev Preview Design**

## Action 493 - Match Dev Preview Design Created

Action 493 created
`docs/final-settlement-note-match-dev-preview-design.md`.

Design impact:

- The matching design now has a future read-only, dev-gated preview design.
- Preview placement is recommended near the mapped BrokerExecutionResult
  candidate preview, visually separate and labelled `Match Preview Only`.
- Preview content should include status/confidence, lifecycle suggestion, hard
  gates, soft signals, mismatch/duplicate reasons, partial-fill status,
  missing data, evidence summaries, provenance/source comparison, and safety
  policy.
- The design explicitly forbids save/finalize/persist/create execution record,
  trade mutation, Avanza/browser, and live retrieval actions.

Next recommended action:

**Action 494 - Create Final Settlement Note Match Dev Preview**

## Action 494 - Match Dev Preview Created

Action 494 implemented the future preview described by the design:

- dev-gated late-phase execution handoff modal placement.
- visually separate `Final Settlement Note Match Preview` panel.
- explicit `Run final note match preview` trigger.
- controlled fixture data only.
- pure matching validator only.
- no live Avanza data, capture, browser automation, finalization,
  persistence, execution-record creation, audit append, or trade mutation.

Next recommended action:

**Action 495 - Reassess Final Settlement Note Match Dev Preview**

## Action 495 - Match Dev Preview Reassessed

Action 495 created
`docs/final-settlement-note-match-dev-preview-reassessment.md`.

Design impact:

- The implemented preview matches the Action 493 design intent.
- It remains dev-gated, fixture-only, explicit-trigger-only, and read-only.
- It displays matching status, gates, signals, lifecycle suggestion, fixture
  evidence/provenance, and safety policy without adding transactional actions.
- The next safe design step is finalization candidate contract types.

Next recommended action:

**Action 496 - Create Finalization Candidate Contract Types**
