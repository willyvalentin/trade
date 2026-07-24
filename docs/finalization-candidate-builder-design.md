# Finalization Candidate Builder Design

## 1. Purpose

This document defines a future design for a Finalization Candidate Builder.

The builder should eventually create a `FinalizationCandidate` from already
validated and matched evidence:

- provisional immediate broker readback evidence.
- final settlement note evidence.
- final settlement note matching result.
- `BrokerExecutionResultCandidate`.
- optional provisional trade or live trade context.
- settlement, fee, FX, and preview-only PnL summaries.

The builder is a candidate shaper only. A `FinalizationCandidate` is not
finalization approval, persistence approval, execution-record creation
approval, stats/PnL update approval, or trade mutation approval.

## 2. Scope

Included scope:

- input requirements.
- builder output shape.
- candidate status derivation.
- evidence, match, settlement, fee, FX, and PnL summary shaping.
- review, blocked, duplicate, partial-fill, and unsupported paths.
- conservative safety flags.

Excluded scope:

- implementation.
- finalization.
- persistence.
- execution-record creation.
- stats/PnL update.
- trade mutation.
- UI wiring.
- capture, browser automation, OCR, or Avanza behavior.

## 3. Builder Inputs

The future builder should require or accept:

- provisional immediate readback evidence from the two-stage broker evidence
  flow.
- final settlement note evidence.
- `FinalSettlementNoteMatchingResult`.
- `BrokerExecutionResultCandidate`.
- provisional trade or live trade context if available.
- handoff payload fingerprint.
- masked account/category context.
- optional execution-record candidate metadata.
- optional existing statistics or trade summary for preview-only PnL comparison.

Inputs must already be sanitized and provenance-bearing. The builder should not
retrieve evidence, capture notes, browse Avanza, inspect DOM state, call broker
automation, or read/write persistence.

## 4. Required Preconditions

The builder should create a candidate only after these checks are represented:

- matching result is exact/strong enough, or explicitly reviewable.
- final note source identity is present.
- source provenance is present.
- broker/source classification is compatible.
- side, instrument, quantity, and date are compatible or review-flagged.
- fee/commission data is present or explicitly flagged.
- FX data is present when currency conversion applies or explicitly flagged.
- settlement, business, and print dates are available or explicitly flagged.
- handoff fingerprint is available.
- no duplicate candidate conflict is detected, or duplicate review is required.
- partial-fill ambiguity is resolved or flagged as review-only.

If any critical precondition is missing, the candidate status should become
`blocked`, `needs_review`, `partial_fill_review`, `duplicate_review`, or
`unsupported`; it should not become finalization approval.

## 5. Builder Output

Expected future output:

- `status`.
- `source`.
- evidence summary.
- match summary.
- settlement summary.
- fee summary.
- FX summary.
- preview-only PnL adjustment summary.
- review flags.
- warnings.
- rejection reasons.
- safety policy.

The output should preserve upstream fingerprints and source references so a
future validator can explain why a candidate is ready, reviewable, blocked,
duplicated, partial-fill-only, or unsupported.

## 6. Candidate Status Rules

`candidate_ready`:

- Matching result is exact or strong.
- Required final note identity and provenance are present.
- Broker/source, side, instrument, quantity, and date are compatible.
- Settlement and amount data are usable.
- Fee/FX gaps are either not applicable or non-critical.
- No duplicate or partial-fill ambiguity remains.
- Still not safe to finalize or persist.

`needs_review`:

- Evidence is generally compatible but soft signals, fee/FX gaps, amount
  reconciliation, or non-critical metadata issues require manual review.
- Candidate may help a reviewer but cannot approve finalization.

`blocked`:

- Critical identity, provenance, side, instrument, quantity, date, settlement,
  or source data is missing or contradictory.
- Candidate cannot advance beyond blocked metadata.

`partial_fill_review`:

- Quantity or settlement details indicate partial-fill behavior.
- The partial-fill model is explicit enough to review but not enough to
  finalize automatically.

`duplicate_review`:

- Duplicate final notes, duplicate provisional trades, duplicate handoff
  fingerprints, or duplicate execution-record candidate metadata are present.
- Manual review is required before any future candidate can be trusted.

`unsupported`:

- Broker, source type, instrument category, settlement model, currency model, or
  evidence shape is outside supported design assumptions.

## 7. Settlement Summary Rules

The builder should shape settlement metadata from the final settlement note and
matching result:

- business date.
- settlement date.
- print date.
- note/reference number.
- total amount.
- consideration.
- currency.
- masked account/category.
- source provenance.

Missing or contradictory values should become review flags, warnings, or
rejection reasons. They must not be silently defaulted into finalization-ready
state.

## 8. Fee/Commission And FX Handling

Commission available:

- Include commission amount, commission currency, and provenance.
- Compare against provisional/broker candidate values when available.

Commission missing:

- Add a review flag and warning.
- Keep candidate non-finalizing.

FX rates available:

- Include rate, source, timestamp/date, and conversion direction.
- Distinguish trade currency, settlement currency, and account/base currency.

FX rates missing:

- If SEK-only with no conversion, record FX as not applicable.
- If non-SEK or conversion applies, add review flags and warnings.

SEK vs non-SEK handling:

- SEK-to-SEK settlement can avoid FX review when all amounts are SEK.
- Non-SEK trades require explicit FX evidence or missing-FX review.

Amount mismatch/reconciliation:

- Compare consideration, commission, total, and FX converted totals when
  available.
- Minor tolerance may be metadata, but unresolved mismatch must produce review
  or blocked state.

## 9. PnL Adjustment Summary

The builder may describe preview-only PnL deltas caused by final fees, FX,
settlement amount, or final quantity.

Rules:

- provisional PnL may need adjustment after final fees/FX/settlement.
- candidate may describe a PnL delta.
- candidate must not update stats.
- candidate must not mutate trade state.
- stats/PnL update remains a separate future boundary.
- `safeToUpdateStats=false` remains required.

## 10. Review/Block Behavior

Review or block when any of these occur:

- missing critical fields.
- hard mismatches.
- duplicate candidates.
- partial-fill ambiguity.
- missing provenance.
- unsupported broker/source.
- missing final note identity.
- missing handoff fingerprint.
- missing or contradictory account/category context.
- missing fee, FX, settlement, or total amount data that affects final values.

The builder alone never grants finalization approval. Manual review remains
required unless a separate future finalization validator explicitly changes the
policy.

## 11. Relationship To Validators And Matching

Evidence validator:

- validates source evidence.

BrokerExecutionResult confirmation validator:

- validates confirmed broker execution result candidates.

Mapper:

- creates `BrokerExecutionResultCandidate`.

Final settlement note matching validator:

- produces the matching result.

Finalization Candidate Builder:

- shapes a `FinalizationCandidate` after upstream checks.
- does not validate finalization.
- does not finalize.
- does not persist.
- does not mutate trade/statistics state.

## 12. Relationship To Execution Records

A `FinalizationCandidate` is not an execution record.

Execution-record candidate creation remains separate. The builder may carry
optional execution-record candidate metadata as context, but:

- execution-record candidate creation remains a separate builder boundary.
- persistence validation remains separate.
- Supabase migration/application remains separate.
- no execution-record write path is enabled.
- `safeToCreateExecutionRecord=false` remains required.

## 13. Relationship To Trade/Statistics Mutation

The builder must not:

- update trade state.
- update statistics.
- adjust realized PnL.
- close live trade state.
- finalize historical state.
- mutate live/history records.

Trade and statistics mutation remain separate future designs requiring their own
validators, safety policies, and explicit approval.

## 14. Safety Policy

The future builder output must keep:

- `safeToFinalize=false`.
- `safeToPersist=false`.
- `safeToCreateExecutionRecord=false`.
- `safeToUpdateStats=false`.
- `safeToMutateTrade=false`.

Automatic mode is out of scope. Manual review is required unless a future
validator and approved state-transition boundary explicitly change that policy.

The builder must not append audit records, write Supabase/localStorage, create
execution records, update stats/PnL, mutate trades, drive browser automation, or
interact with Avanza.

## 15. Candidate Next Actions

A. Create Finalization Candidate Builder Contract Types

- Highest-value next step.
- Defines the input/output contract before implementation.
- Keeps work type-only and safely reviewable.

B. Create Finalization Candidate Builder

- Useful only after contract types are explicit.
- Must remain pure and non-persistent at first.

C. Create Finalization Validator Design

- Defines how a future validator would evaluate a candidate before any
  transition boundary.
- Should remain separate from persistence and trade mutation.

D. Create Finalization Candidate Dev Preview Design

- Useful after contract and builder semantics are stable.
- Must remain fixture/dry-run-first, read-only, explicit-trigger-only, and
  non-persistent.

## 16. Recommended Next Action

Recommended Action 499:

**Action 499 - Create Finalization Candidate Builder Contract Types**

Reason:

- Contract types are safer than builder implementation as the immediate next
  action.
- They can define builder input/output, status, review flag, warning, rejection,
  and safety-policy shapes without enabling runtime finalization, persistence,
  execution-record creation, stats/PnL updates, trade mutation, UI wiring,
  capture/browser automation, or Avanza behavior.

## 17. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No builder implementation, finalization
validator, persistence/write behavior, Supabase/localStorage write, audit
append, execution-record creation, stats/PnL update, trade mutation, UI wiring,
capture/browser/Avanza behavior, or order execution behavior was added.

## Action 499 - Finalization Candidate Builder Contract Types Created

Action 499 created `lib/finalization-candidate-builder-contract.ts`.

Design impact:

- The builder design now has a type-only contract surface for future builder
  inputs and results.
- The contract models builder status, preconditions, precondition results,
  warnings, rejection reasons, policy snapshot, settlement input summary, fee
  input summary, FX input summary, preview-only PnL input summary, and result
  safety policy.
- The result can carry an optional `FinalizationCandidate`, but the contract is
  not builder implementation and does not approve finalization.
- Safety remains disabled by default: `safeToFinalize=false`,
  `safeToPersist=false`, `safeToCreateExecutionRecord=false`,
  `safeToUpdateStats=false`, and `safeToMutateTrade=false`.

No finalization validator, finalization implementation, persistence/write
behavior, execution-record creation, stats/PnL update, trade mutation, UI
wiring, capture/browser automation, or Avanza behavior was added.

Recommended next action:

**Action 500 - Reassess Finalization Candidate Builder Contract Types**

## Action 500 - Finalization Candidate Builder Contract Reassessed

Action 500 created
`docs/finalization-candidate-builder-contract-reassessment.md`.

Design impact:

- The builder contract types were verified as type-only/constants-only.
- The contract was verified to align with this builder design's inputs,
  preconditions, output shape, status rules, settlement/fee/FX/PnL summaries,
  and conservative safety policy.
- No builder implementation, validator, finalization, persistence,
  execution-record creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser automation, or Avanza behavior was added.

Recommended next action:

**Action 501 - Create Finalization Candidate Builder**

## Action 501 - Pure Finalization Candidate Builder Created

Action 501 created `lib/finalization-candidate-builder.ts`.

Design status update:

- The builder design now has a pure deterministic implementation.
- `buildFinalizationCandidate(...)` accepts
  `FinalizationCandidateBuilderInput` and returns
  `FinalizationCandidateBuilderResult`.
- The implementation evaluates all contract preconditions and shapes a
  `FinalizationCandidate` only for candidate/review paths.
- Clean exact/strong final-note matches can return `candidate_built` with a
  `candidate_ready` `FinalizationCandidate`.
- Review paths remain conservative:
  `needs_review`, `partial_fill_review`, and `duplicate_review`.
- Blocked and unsupported paths do not return a candidate.

Excluded scope remains excluded:

- No finalization.
- No persistence/write behavior.
- No Supabase/localStorage writes.
- No audit append.
- No execution-record creation.
- No stats/PnL update.
- No trade mutation.
- No UI wiring.
- No capture/browser automation.
- No Avanza behavior.

Next recommended action:

**Action 502 - Reassess Finalization Candidate Builder**

## Action 502 - Finalization Candidate Builder Reassessed

Action 502 created `docs/finalization-candidate-builder-reassessment.md`.

Design impact:

- The pure builder implementation was verified against this design.
- It remains deterministic and candidate-only.
- Clean exact/strong matched final notes can shape candidate metadata.
- Review, block, duplicate, partial-fill, and unsupported paths remain
  conservative.
- No finalization, persistence, execution-record creation, stats/PnL update,
  trade mutation, UI wiring, capture/browser automation, or Avanza behavior was
  added.

Next recommended action:

**Action 503 - Create Finalization Candidate Dev Preview Design**

## Action 503 - Finalization Candidate Dev Preview Design Created

Action 503 created `docs/finalization-candidate-dev-preview-design.md`.

Design impact:

- The builder now has a documented future dev-gated preview surface.
- The preview is read-only and visualizes builder output without changing the
  builder.
- It must show candidate status, settlement/fee/FX/PnL summaries, review
  flags, warnings, rejection reasons, preconditions, and safety policy.
- It must clearly state the candidate is not finalization, persistence,
  execution-record creation, stats/PnL update, or trade mutation approval.
- No UI implementation or runtime behavior was added.

Next recommended action:

**Action 504 - Create Finalization Candidate Dev Preview**

## Action 504 - Finalization Candidate Dev Preview Created

Action 504 implemented the dev-gated preview described by
`docs/finalization-candidate-dev-preview-design.md`.

Design impact:

- The preview is visually separate and labelled
  `Finalization Candidate Preview`.
- It uses controlled fixture data and an explicit run trigger.
- It displays candidate/builder diagnostics and false safety labels.
- It adds no save, finalize, persist, create execution record, update stats,
  update PnL, mutate trade, browser, Avanza, or broker-send action.

Next recommended action:

**Action 505 - Reassess Finalization Candidate Dev Preview**

## Action 505 - Finalization Candidate Dev Preview Reassessed

Action 505 created
`docs/finalization-candidate-dev-preview-reassessment.md`.

Design impact:

- The implemented preview was reassessed as dev-gated, fixture-only,
  explicit-trigger-only, read-only, and pure-builder-only.
- The preview remains a display surface for candidate metadata and false safety
  flags.
- The deterministic candidate-id helper remains browser-safe and has no builder
  side effects.
- No validator, finalization transition, persistence integration,
  execution-record integration, stats/PnL integration, trade mutation,
  browser/Avanza automation, broker behavior, or production runtime behavior
  was added.

Next recommended action:

**Action 506 - Create Finalization Validator Design**

## Action 506 - Finalization Validator Design Created

Action 506 created `docs/finalization-validator-design.md`.

Design impact:

- The future validator is designed as a separate boundary after candidate
  building.
- The builder remains responsible only for candidate metadata construction.
- Validator status can classify readiness, review, blocked, partial-fill,
  duplicate, unsupported, and not-ready paths without performing finalization.
- No implementation, finalization, persistence, execution-record creation,
  stats/PnL update, trade mutation, UI wiring, browser/Avanza behavior, or
  broker behavior was added.

Next recommended action:

**Action 507 - Create Finalization Validator Contract Types**
