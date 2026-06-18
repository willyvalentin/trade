# Finalization Candidate Dev Preview Design

## 1. Purpose

This document defines a future design for safely previewing a
`FinalizationCandidate` in dev mode.

The preview should visualize output from `buildFinalizationCandidate(...)`
without implying that the candidate is finalization approval, persistence
approval, execution-record creation approval, stats/PnL update approval, or
trade mutation approval.

This is documentation/design only. No runtime code, refactor, behavior change,
UI implementation, preview implementation, builder change, finalization
validator, finalization implementation, persistence/write behavior,
Supabase/localStorage write, audit append, execution-record creation,
stats/PnL update, trade mutation, capture/browser automation, or Avanza
behavior was added.

## 2. Scope

Included scope:

- dev-gated finalization candidate preview.
- read-only visualization.
- candidate status display.
- settlement, fee, FX, and PnL summary display.
- review, block, and warning display.
- explicit safety labels.
- explicit non-authority messaging.
- future placement and interaction model.

Excluded scope:

- implementation.
- actual finalization.
- persistence.
- execution-record creation.
- stats/PnL update.
- trade mutation.
- capture/browser/Avanza behavior.
- production UI.
- automatic mode.

## 3. Placement Options

Existing execution handoff modal late-phase dev area:

- Pros: close to the current execution lifecycle and handoff context.
- Pros: can reuse the mental model of late-phase broker evidence review.
- Cons: risks visual overtrust if placed near execution controls.
- Requirement if chosen: strict visual separation and no action buttons.

Near final settlement note match preview:

- Pros: best conceptual adjacency because candidate building is downstream of
  final settlement note matching.
- Pros: makes it clear the candidate preview consumes matching output.
- Cons: still needs clear separation from the existing matching preview so a
  match is not mistaken for finalization.

Separate diagnostics/dev panel:

- Pros: safest isolation from workflow controls.
- Pros: good for fixture-driven QA.
- Cons: weaker workflow context and less useful for reviewing a specific
  handoff.

Recommended first placement:

- Dev-gated late-phase section near the final settlement note match preview.
- Visually separate from the matching preview.
- Labelled exactly: `Finalization Candidate Preview`.
- Collapsible by default unless explicitly opened by dev diagnostics.
- No production visibility.

## 4. Data Dependencies

Initial data dependencies should be controlled and explicit:

- controlled fixture or explicit trigger first.
- pure final settlement note matching result fixture.
- pure `BrokerExecutionResultCandidate` fixture.
- pure final settlement note evidence fixture.
- pure provisional immediate readback evidence fixture.
- `buildFinalizationCandidate(...)`.

Forbidden data dependencies:

- no live Avanza data.
- no browser-read state.
- no captured DOM/page text.
- no Supabase reads or writes for preview execution.
- no localStorage reads or writes for preview execution.
- no audit append.
- no execution-record creation.
- no stats/PnL update.
- no trade mutation.

The preview may eventually render a supplied `FinalizationCandidateBuilderResult`
object, but it must not fetch, persist, or mutate data to create one.

## 5. Preview Content

The preview should display:

- builder status.
- finalization candidate status.
- evidence summary.
- match summary.
- settlement summary.
- fee summary.
- FX summary.
- PnL adjustment summary.
- review flags.
- warnings.
- rejection reasons.
- precondition results.
- policy snapshot.
- safety policy.

Builder status content:

- raw builder status.
- human label.
- short explanation.
- whether a candidate object is present.

Candidate status content:

- raw candidate status when present.
- explicit note that `candidate_ready` is not finalization-ready.
- fallback display when no candidate is present.

Summary content:

- key source fingerprints.
- note reference number.
- instrument, side, quantity, dates, price, currency, consideration, and total.
- commission/fee availability.
- FX required/available/missing.
- preview-only PnL/cash-impact information.

Diagnostic content:

- ordered precondition results.
- review flags.
- warnings.
- rejection reasons.
- policy snapshot false-authority values.

## 6. Safety Labels

The preview must show visible labels:

- Dev preview only.
- Candidate only.
- Not finalization approval.
- Not persistence approval.
- Not execution record approval.
- Not stats/PnL update approval.
- Does not mutate trade state.
- `safeToFinalize=false`.
- `safeToPersist=false`.
- `safeToCreateExecutionRecord=false`.
- `safeToUpdateStats=false`.
- `safeToMutateTrade=false`.
- automatic mode disabled.

Safety labels must be visible near the preview header and near any status badge
that could otherwise look actionable.

## 7. Interaction Model

The preview should be:

- read-only.
- collapsible.
- dev-gated.
- explicit-trigger-only if implemented later.

Allowed future interaction:

- `Run finalization candidate preview` trigger.
- Expand/collapse sections.
- Copy diagnostic text in dev mode if needed.

Forbidden interaction:

- no save.
- no finalize.
- no persist.
- no create execution record.
- no update stats.
- no update PnL.
- no mark trade finalized.
- no mutate trade.
- no Avanza action.
- no browser action.

The trigger, if implemented later, should only run pure fixture/input mapping
and should not call persistence, broker, audit, stats, or trade mutation
boundaries.

## 8. Candidate State Display Rules

`candidate_ready`:

- Display as candidate-ready.
- Also display `Not finalization-ready`.
- Require visible false safety flags.

`needs_review`:

- Display review state.
- Prioritize review flags, warnings, and precondition results.
- No action buttons.

`blocked`:

- Display blocked state with rejection reasons.
- Show blocked preconditions first.
- No candidate approval language.

`partial_fill_review`:

- Display partial-fill review state.
- Show partial-fill status and matching details.
- State that partial-fill finalization remains future work.

`duplicate_review`:

- Display duplicate review state.
- Show duplicate reasons and affected fingerprints/references when available.
- State that duplicate resolution remains manual/future work.

`unsupported`:

- Display unsupported state.
- Show unsupported source/broker reason.
- Do not show candidate-ready styling.

## 9. Relationship To Finalization Validator

The preview is upstream of any future finalization validator.

The finalization validator remains future work.

`candidate_ready` does not bypass the future validator.

The preview does not perform state transition.

The preview should explicitly say:

- candidate preview is not validation approval.
- validator approval is not implemented.
- finalization transition is not implemented.

## 10. Relationship To Execution Records

The preview does not create an execution record.

The execution-record candidate builder remains separate.

The execution-record creation validator remains separate.

The persistence validator remains separate.

Supabase migration/application remains separate.

No write path is enabled.

If execution-record candidate metadata is present inside a
`FinalizationCandidate`, the preview should render it as context only and show:

- `safeToCreateExecutionRecord=false`.
- `executionRecordCreationAttempted=false`.
- `persistenceAttempted=false`.

## 11. Relationship To Statistics/PnL

The PnL adjustment summary is informational only.

The preview does not update statistics.

The preview does not update realized PnL.

The preview does not alter trade PnL fields.

Final PnL/statistics update requires a separate approved boundary.

The preview should show:

- `previewOnly=true`.
- `safeToUpdateStats=false`.
- `statsUpdateAttempted=false`.
- `tradeMutationAttempted=false`.

## 12. Relationship To Trade Mutation

The preview does not open trade state.

The preview does not close trade state.

The preview does not finalize trade state.

The preview does not update live state.

The preview does not update history state.

Trade mutation remains a separate future boundary.

Automatic mode remains out of scope.

The preview should show:

- `safeToMutateTrade=false`.
- `tradeMutationAttempted=false`.
- automatic mode disabled.

## 13. Candidate Next Actions

A. Create Finalization Candidate Dev Preview

- Highest-value next step.
- Implements the dev-gated, read-only preview described here.
- Must remain explicit-trigger-only and non-persistent.

B. Create Finalization Validator Design

- Useful after a preview exists or in parallel.
- Defines validation semantics before any future finalization state transition.

C. Create Provisional Trade State Design

- Useful later, after preview and validator boundaries are clearer.
- Should not be coupled directly to candidate preview.

D. Create Execution Record Integration Reassessment

- Useful before any future execution-record relationship is expanded.
- Should verify optional execution-record metadata remains context only.

## 14. Recommended Next Action

Recommended Action 504:

**Action 504 - Create Finalization Candidate Dev Preview**

Reason:

- The builder exists and has been reassessed.
- The preview design now defines the safe placement, content, safety labels,
  interaction model, and separation boundaries.
- A dev-gated, read-only implementation can be the next safe step if it adds no
  finalization, persistence, execution-record creation, stats/PnL update, trade
  mutation, capture/browser automation, or Avanza behavior.

## 15. Risk Assessment

Candidate preview mistaken for finalization:

- Risk: users or future code interpret the preview as approval.
- Control: visible `Not finalization approval` label and
  `safeToFinalize=false`.

`candidate_ready` overtrusted:

- Risk: `candidate_ready` is mistaken for finalization-ready.
- Control: display as candidate-ready but not finalization-ready.

PnL adjustment overtrusted:

- Risk: preview-only PnL summary is treated as final realized PnL.
- Control: show `previewOnly=true` and `safeToUpdateStats=false`.

Stats update assumed:

- Risk: preview creates expectation that statistics were updated.
- Control: show `statsUpdateAttempted=false`.

Execution-record creation assumed:

- Risk: execution-record metadata is mistaken for record creation.
- Control: show `safeToCreateExecutionRecord=false` and
  `executionRecordCreationAttempted=false`.

Persistence assumed:

- Risk: users assume preview output was saved.
- Control: show `safeToPersist=false` and `persistenceAttempted=false`.

Trade mutation assumed:

- Risk: users assume preview finalized or closed a trade.
- Control: show `safeToMutateTrade=false` and
  `tradeMutationAttempted=false`.

Future UI overtrust:

- Risk: visual styling makes preview look like an operational approval panel.
- Control: dev-only labels, muted non-authoritative styling, and no action
  buttons.

Automatic mode confusion:

- Risk: preview is mistaken for automatic finalization readiness.
- Control: show automatic mode disabled and keep all automatic actions out of
  scope.

## 16. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, UI
implementation, preview implementation, builder change, finalization validator,
finalization implementation, persistence/write behavior, Supabase/localStorage
write, audit append, execution-record creation, stats/PnL update, trade
mutation, capture/browser automation, or Avanza behavior was added.

## Action 504 Follow-Up - Finalization Candidate Dev Preview Created

Action 504 created:

- `components/execution/FinalizationCandidatePreview.tsx`
- `lib/finalization-candidate-dev-fixture.ts`

Implementation summary:

- Added dev-gated, read-only Finalization Candidate Preview near the final
  settlement note match preview.
- Added explicit `Run finalization candidate preview` trigger.
- Added controlled fixture data that calls only pure
  `buildFinalizationCandidate(...)`.
- Kept the pure builder browser-safe by using a deterministic candidate-id hash
  helper that does not import Node-only modules into the client preview.
- Rendered builder status, candidate status, evidence summary, match summary,
  settlement summary, fee summary, FX summary, PnL adjustment summary,
  precondition results, review flags, warnings, rejection reasons, policy
  snapshot, and safety policy.
- Added visible labels for dev preview only, candidate only, not finalization
  approval, not persistence approval, not execution-record approval, not
  stats/PnL update approval, no trade mutation, false safety flags, and
  automatic mode disabled.

Safety result:

- Fixture-only.
- Explicit-trigger-only.
- Browser-safe deterministic candidate-id helper only; no builder side effects
  were added.
- No live Avanza data.
- No capture.
- No browser/Avanza automation.
- No Supabase/localStorage writes.
- No audit append.
- No execution-record creation.
- No finalization.
- No stats/PnL update.
- No trade mutation.
- No production runtime behavior.

Next recommended action:

**Action 505 - Reassess Finalization Candidate Dev Preview**

## Action 505 Follow-Up - Finalization Candidate Dev Preview Reassessed

Action 505 created
`docs/finalization-candidate-dev-preview-reassessment.md`.

Design reassessment impact:

- The implemented preview was verified against this design.
- It remains dev-gated, fixture-only, explicit-trigger-only, read-only, and
  pure-builder-only.
- It displays the required candidate status, builder status, summaries,
  precondition results, warnings, rejection reasons, policy snapshot, safety
  policy, safety labels, and false safety flags.
- It exposes no save, finalize, persist, create execution record, update stats,
  update PnL, mark trade finalized, mutate trade, send to broker, Avanza
  browser, or automatic mode action.
- No runtime code changes, UI changes, fixture changes, builder changes,
  finalization, persistence/write behavior, execution-record creation,
  stats/PnL update, trade mutation, capture/browser automation, Avanza
  behavior, broker behavior, or production runtime behavior was added.

Next recommended action:

**Action 506 - Create Finalization Validator Design**

## Action 506 Follow-Up - Finalization Validator Design Created

Action 506 created `docs/finalization-validator-design.md`.

Design relationship:

- The preview remains a dev-gated display surface for candidate metadata.
- The future validator is designed as a separate upstream review/readiness
  boundary.
- Passing validator gates must not finalize, persist, create execution records,
  update stats/PnL, mutate trades, run browser automation, interact with Avanza,
  or send to broker.
- No runtime code changes, UI changes, fixture changes, builder changes,
  validator implementation, finalization implementation, persistence/write
  behavior, or broker behavior was added.

Next recommended action:

**Action 507 - Create Finalization Validator Contract Types**
