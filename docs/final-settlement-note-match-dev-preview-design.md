# Final Settlement Note Match Dev Preview Design

## 1. Purpose

Define how a final settlement note matching result could be previewed safely in
dev mode.

The preview should let a developer inspect the output of
`validateFinalSettlementNoteMatch(...)` for a provisional immediate
readback/provisional trade and a final settlement note fixture. It must make the
boundary obvious: a match result is not finalization, persistence approval,
execution-record creation, trade mutation approval, capture automation, browser
automation, or Avanza behavior.

This document is design-only. It adds no runtime code, refactor, behavior
change, UI implementation, preview implementation, matching logic change,
finalization implementation, persistence/write behavior, Supabase/localStorage
write, audit append, execution-record creation, trade mutation,
capture/OCR/browser extraction, browser automation, or Avanza behavior.

## 2. Scope

Included:

- dev-gated match preview.
- read-only visualization.
- hard gate display.
- soft signal display.
- mismatch, duplicate, partial-fill, and insufficient-data display.
- safety labels.
- lifecycle transition suggestion display.
- fixture/dry-run-first data dependency design.

Excluded:

- implementation.
- production UI.
- finalization.
- persistence.
- Supabase/localStorage writes.
- audit append.
- execution-record creation.
- trade mutation.
- capture/OCR/browser extraction.
- browser automation.
- Avanza behavior.

## 3. Placement Options

A. Existing execution handoff modal late-phase dev area

- Best contextual fit.
- Already hosts late-phase execution previews.
- Already follows a dev-gated pattern through execution dev tools.
- Keeps match preview close to mapped BrokerExecutionResult candidate and
  execution-record preview concepts.
- Risk: the modal can become dense, so the match preview must be visually
  separate and explicitly labelled.

B. Separate diagnostics/dev panel

- Strong dev-only framing.
- Lower risk of being mistaken for a transactional user flow.
- Less contextual because it is separated from handoff intent and existing
  late-phase preview sequence.

C. Mapped BrokerExecutionResult candidate preview area

- Related to downstream candidate inspection.
- Could help show the boundary between matched final-note evidence and mapped
  broker-result candidates.
- Risk: placing match output inside the mapped candidate preview may imply the
  match automatically creates a candidate.

Recommended first placement:

- dev-gated late-phase section near the mapped BrokerExecutionResult candidate
  preview.
- visually separate from the mapped candidate preview.
- title: `Final settlement note match preview`.
- visible boundary label: `Match Preview Only`.

Rationale:

- The match result is upstream of finalization and downstream of evidence
  capture/retrieval.
- The late-phase dev area already teaches users that preview surfaces are
  diagnostic and non-transactional.
- Keeping it near but separate from mapped candidate preview reinforces that a
  match is not a runtime BrokerExecutionResult, execution record, persistence
  request, or trade mutation.

## 4. Data Dependencies

Initial data source:

- controlled fixture or explicit dry-run-style trigger first.
- no automatic run against live data.

Required inputs:

- provisional immediate readback fixture.
- optional provisional trade context fixture.
- final settlement note fixture.
- pure matching validator result from
  `validateFinalSettlementNoteMatch(...)`.

Forbidden dependencies:

- no live Avanza data.
- no Avanza browser session data.
- no OCR/capture/browser extraction.
- no Supabase writes.
- no localStorage writes.
- no audit append.
- no execution-record creation.
- no trade mutation.
- no persistence.

The preview may later accept manually supplied sanitized fixtures, but it must
not fetch final notes, scrape Avanza, write match results, create records, or
mutate trade state.

## 5. Preview Content

Match summary:

- match status.
- confidence.
- matched flag.
- evaluated timestamp.
- validator metadata.

Lifecycle:

- lifecycle transition suggestion.
- clear text that the suggestion is metadata only.
- no state transition action.

Hard gates:

- gate name.
- passed/blocked state.
- required flag.
- mismatch reason.
- expected preview value.
- actual preview value.
- comparison notes.

Soft signals:

- signal name.
- present/not present.
- supportive/not supportive.
- requires-review flag.
- expected preview value.
- actual preview value.
- comparison notes.

Review detail:

- mismatch reasons.
- duplicate reasons.
- partial-fill status.
- missing/insufficient-data state.
- review flags.
- warnings.

Evidence summaries:

- provisional evidence summary.
- provisional trade context summary.
- final note evidence summary.
- note/reference number.
- instrument comparison.
- side comparison.
- quantity comparison.
- price comparison.
- currency comparison.
- account/category comparison using masked values only.
- provenance/source comparison.
- handoff fingerprint comparison.

Safety policy:

- `matchingImplementationEnabled`.
- `safeToFinalize`.
- `safeToPersist`.
- `safeToMutateTrade`.
- finalization attempted flag.
- persistence attempted flag.
- trade mutation attempted flag.
- execution record created flag.
- audit append attempted flag.
- browser automation attempted flag.

## 6. Safety Labels

Required visible labels:

- `Dev preview only`.
- `Match result only`.
- `Match Preview Only`.
- `Not finalization`.
- `Not persistence approval`.
- `Not an execution record`.
- `Does not mutate trade state`.
- `safeToFinalize=false`.
- `safeToPersist=false`.
- `safeToMutateTrade=false`.
- `Automatic mode disabled`.
- `Manual broker confirmation boundary still applies`.

Suggested panel intro:

`Read-only preview of a final settlement note match result. This does not
finalize a trade, persist data, create an execution record, mutate trade state,
or interact with Avanza.`

Suggested exact/strong copy:

`Match appears strong. Finalization, persistence, execution-record creation, and
trade mutation remain disabled.`

Suggested review copy:

`Match requires review. No record was finalized, persisted, created, or used to
mutate trade state.`

Forbidden copy/buttons:

- `Finalize`.
- `Persist`.
- `Save`.
- `Create execution record`.
- `Mark trade finalized`.
- `Update trade`.
- `Apply to PnL`.
- `Send to broker`.
- `Open Avanza`.
- `Fetch final note`.

## 7. Interaction Model

The preview should be:

- read-only.
- collapsible.
- dev-gated.
- explicit-trigger-only.

Possible future trigger:

- `Run final note match preview`

The trigger should:

- use controlled fixtures first.
- call only pure matching helpers.
- update local preview state only.
- avoid automatic execution when the modal opens.

Forbidden interactions:

- no save.
- no finalize.
- no persist.
- no create execution record.
- no mark trade finalized.
- no mutate trade.
- no Avanza/browser action.
- no live final-note retrieval.
- no audit append.

## 8. Match State Display Rules

Exact/strong match:

- show success styling.
- show `matched=true`.
- show confidence.
- show a strong warning that finalization is not enabled.
- show disabled safety flags next to the success state.

Partial/ambiguous match:

- show review styling.
- emphasize weak/contradictory soft signals.
- keep all action flags disabled.

Mismatch:

- show blocked styling.
- highlight blocking hard gates and mismatch reasons.
- show no finalize/persist/mutate actions.

Duplicate candidates:

- show review/block styling.
- highlight duplicate reasons.
- warn that duplicate candidates are not auto-resolved.

Insufficient data:

- show missing-data styling.
- list missing/blocked gates.
- show missing note identity, missing provenance, or missing comparison data.

Partial-fill ambiguity:

- show review-only styling.
- display expected and actual quantity.
- display explicit partial-fill model status if present.
- state that partial-fill review does not authorize finalization or
  persistence.

## 9. Relationship To Finalization

The match preview is upstream of finalization.

- It does not finalize records.
- It does not mutate lifecycle state.
- It does not apply final stats or PnL.
- It does not convert a lifecycle transition suggestion into a transition.

Finalization candidate contracts, a finalization validator, and any
finalization state transition implementation remain future work.

## 10. Relationship To Execution Records

The match preview does not create an execution record.

- Execution record candidate builder remains separate.
- Execution record creation validator remains separate.
- Execution record persistence validator remains separate.
- Execution record insert route and Supabase migration/application remain
  separate.
- A matched note is evidence for future downstream design, not an execution
  record.

The preview must never display language that implies a match has already become
a durable execution record.

## 11. Relationship To Live Trade Management

The preview does not open, close, settle, or update trades.

- It does not update live trade state.
- It does not update historical trade state.
- It does not update stats or PnL.
- It does not change recommendations or positions.
- Immediate readback remains provisional.
- Final note matching may later support final stats only after a separate
  finalization design, validator, and persistence/trade-state boundary.

## 12. Candidate Next Actions

A. Create Final Settlement Note Match Dev Preview

- Highest-value next implementation step.
- Would create the dev-gated, read-only preview described here.
- Should use fixtures/dry-run-style trigger first.
- Must not add finalization, persistence, execution-record creation, trade
  mutation, capture, browser automation, or Avanza behavior.

B. Create Finalization Candidate Contract Types

- Useful after the match preview makes validator output inspectable.
- Should keep finalization candidate metadata separate from finalization
  execution.

C. Create Immediate Broker Readback Contract Design

- Useful for refining provisional readback evidence.
- Less urgent now that match output needs a safe inspection surface.

D. Create Final Settlement Note Retrieval Contract Design

- Important before real final note retrieval.
- Should come after previewing fixture-based match results, so retrieval design
  can target the fields the preview and validator require.

## 13. Recommended Next Action

Recommended next action:

**Action 494 - Create Final Settlement Note Match Dev Preview**

Rationale:

- The validator exists and has been reassessed.
- The design now defines a safe dev-only inspection surface.
- Implementing a fixture-only preview next makes validator output inspectable
  without adding finalization, persistence, execution-record creation, trade
  mutation, capture, browser automation, or Avanza behavior.

## 14. Risk Assessment

Match preview mistaken for finalization:

- Risk: users read a successful match as finalized.
- Control: require `Not finalization`, safety flags, and no finalize action.

Exact match overtrusted:

- Risk: exact/strong styling hides the remaining finalization boundary.
- Control: exact/strong state must show success styling with an adjacent
  warning that no finalization is enabled.

Safe flags ignored:

- Risk: users skim past `safeToFinalize=false`, `safeToPersist=false`, and
  `safeToMutateTrade=false`.
- Control: render flags as prominent safety labels, not buried metadata.

Duplicate candidates hidden:

- Risk: duplicate conflicts are collapsed or omitted in the preview.
- Control: duplicate reasons must have a dedicated review/block display.

Partial-fill ambiguity underplayed:

- Risk: partial-fill review appears like a normal match.
- Control: partial-fill status gets review-only styling and quantity comparison.

Future UI overtrust:

- Risk: later UI adds transactional language near the preview.
- Control: design forbids finalize/save/persist/create/mutate broker language.

Premature persistence/finalization/trade mutation coupling:

- Risk: future implementation wires match output directly to writes or state
  mutation.
- Control: data dependencies and interaction model require fixture-first,
  read-only, explicit-trigger-only behavior.

## 15. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No UI implementation, preview implementation,
matching change, finalization, capture, persistence/write behavior,
Supabase/localStorage behavior, audit append, execution-record creation, trade
mutation, browser automation, or Avanza behavior was added.

## Action 494 - Dev Preview Created

Action 494 created:

- `components/execution/FinalSettlementNoteMatchPreview.tsx`
- `lib/final-settlement-note-match-dev-fixture.ts`

Implementation result:

- The preview is dev-gated in the execution handoff modal late-phase area.
- It is visually separate from the mapped BrokerExecutionResult candidate
  preview and labelled `Final Settlement Note Match Preview` /
  `Match Preview Only`.
- It uses controlled fixture data only.
- It runs only from the explicit `Run final note match preview` trigger.
- The fixture calls only the pure `validateFinalSettlementNoteMatch(...)`
  validator.
- The preview displays match status/confidence, lifecycle suggestion, hard
  gates, soft signals, mismatch/duplicate reasons, partial-fill status,
  missing-data summary, evidence comparison, provenance/source comparison, and
  safety policy.

Safety result:

- No live Avanza data.
- No capture/OCR/browser extraction.
- No finalization.
- No persistence/write behavior.
- No Supabase/localStorage writes.
- No audit append.
- No execution-record creation.
- No trade mutation.
- No browser/Avanza behavior.

Recommended next action:

**Action 495 - Reassess Final Settlement Note Match Dev Preview**

## Action 495 - Dev Preview Reassessed

Action 495 created
`docs/final-settlement-note-match-dev-preview-reassessment.md`.

Reassessment result:

- The preview remains dev-gated, fixture-only, explicit-trigger-only,
  read-only, and pure-validator-only.
- The preview remains disconnected from finalization, persistence,
  execution-record creation, trade mutation, capture/OCR/browser extraction,
  browser automation, and Avanza behavior.
- Safety labels and forbidden-interaction boundaries were verified.
- The lifecycle transition suggestion remains display metadata only.

Recommended next action:

**Action 496 - Create Finalization Candidate Contract Types**

## Action 496 - Finalization Candidate Contract Types Created

Action 496 created `lib/finalization-candidate-contract.ts`.

Design impact:

- The dev preview remains a read-only inspection surface.
- The finalization candidate contract gives future work a type-only vocabulary
  for evidence, match, settlement, fee, FX, PnL adjustment, review, warning,
  rejection, and safety summaries.
- The candidate contract keeps finalization, persistence, execution-record
  creation, stats/PnL updates, and trade mutation disabled.
- No preview implementation changes or runtime finalization behavior was added.

Recommended next action:

**Action 497 - Reassess Finalization Candidate Contract Types**

## Action 497 - Finalization Candidate Contract Types Reassessed

Action 497 created
`docs/finalization-candidate-contract-reassessment.md`.

Design impact:

- The dev preview design remains read-only and non-finalizing.
- Finalization candidate contracts were verified as type-only/constants-only
  metadata downstream of matched final note evidence.
- Candidate summaries can cover evidence, match, settlement, fee, FX,
  preview-only PnL, review flags, warnings, rejection reasons, safety policy,
  and status metadata.
- The candidate contract keeps `safeToFinalize=false`,
  `safeToPersist=false`, `safeToMutateTrade=false`,
  `safeToUpdateStats=false`, and `safeToCreateExecutionRecord=false`.
- No preview implementation change, finalization, persistence,
  execution-record creation, stats/PnL update, trade mutation, capture/browser
  automation, or Avanza behavior was added.

Recommended next action:

**Action 498 - Create Finalization Candidate Builder Design**
