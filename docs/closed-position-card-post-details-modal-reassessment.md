# ClosedPositionCard Post-Details Modal Reassessment

## 1. Purpose

Reassess `ClosedPositionCard` after Action 375 extracted
`components/history/ClosedTradeDetailsModal.tsx`.

The details modal shell is now presentational. This reassessment identifies the
remaining card responsibilities, whether the full card boundary is ready to
move, and the safest next runtime refactor target.

## 2. Current History Component Inventory

Current file inventory:

- `app/trade-app.tsx`: approximately 39,947 lines.
- `components/history/HistoryTab.tsx`: extracted History tab shell.
- `components/history/closed-trade-display-mapper.ts`: extracted pure card
  display mapper, approximately 221 lines.
- `components/history/ClosedTradeDetailsModal.tsx`: extracted details modal
  shell/rendering, approximately 75 lines.

Extracted History pieces:

- `HistoryTab` owns only the History tab layout/shell.
- `closed-trade-display-mapper.ts` owns display-only outcome label/tone, PnL/R
  display strings, metric rows, journal fallback, reality badges, and the
  History / Statistics surface notice metadata.
- `ClosedTradeDetailsModal` owns only the modal wrapper/header/body rendering,
  close button, Escape close, backdrop close, status slot, and body slot.

Still inline in `app/trade-app.tsx`:

- `ClosedPositionCard`.
- `ClosedTradeResultStrip`.
- `ClosedTradeJournalSummary`.
- `ClosedTradePlanningSnapshotPanel`.
- `ClosedTradePlanVsActualReviewPanel`.
- `ClosedTradeExecutionReview`.
- `ClosedTradePartialFillReview` and `FillRows`.
- `ClosedTradeOutcomeSummary`.
- `ClosedTradeProcessQualitySummary`.
- `ClosedTradeKeyLearnings`.
- Audit details composition using broker metadata, order preview, execution
  quality, handoff quality, improvement suggestions, outcome explainer, handoff
  replay, and execution timeline panels.

## 3. Remaining ClosedPositionCard Responsibilities

`ClosedPositionCard` still owns local UI state:

- `isDetailsOpen`.
- click-to-open behavior on the card wrapper.
- keyboard open behavior for `Enter` and space.
- close callback passed to `ClosedTradeDetailsModal`.

It still owns closed trade derivation:

- local trade management event reads via `readTradeManagementEvents()`.
- execution timeline derivation.
- handoff session replay derivation.
- execution quality calculation.
- handoff quality calculation.
- execution improvement suggestions.
- trade outcome explanation.
- closed trade display mapper invocation.

It still owns detail panel node composition:

- result strip.
- journal summary.
- planning snapshot.
- plan-vs-actual review panel.
- execution review.
- partial fill review.
- outcome summary.
- process quality summary.
- key learnings.
- audit details `details`/`summary` block.
- optional exit notes block.

The plan-vs-actual area remains especially important:

- `ClosedTradePlanVsActualReviewPanel` still builds the review via
  `buildPlanVsActualReview(...)`.
- It still emits the hidden `trade-plan-vs-actual-review-json` node used by
  agent-readable diagnostics.
- Its visible labels, warnings, deviations, checks, and summary copy remain
  inline and unchanged.

The audit/timeline area also remains card-owned:

- audit event reads are still local to `app/trade-app.tsx`.
- timeline/replay derivation stays in the card.
- the details modal receives already-composed audit display nodes.

## 4. Extraction Readiness

Full `ClosedPositionCard` extraction is safer than it was before Action 375, but
it is not the safest next step.

A full card boundary would need props for:

- the closed position.
- `HistoryTradeSummary`.
- open/close details state or state callbacks if state stayed parent-owned.
- identity/status render nodes or identity source data.
- card display props.
- result/journal/planning/plan-vs-actual/execution/partial-fill/outcome/process
  quality/key-learning panel data.
- audit timeline/replay/quality/explainer data or fully rendered audit nodes.
- exit notes.

That prop surface is still broad. It would also make it easier to accidentally
move audit reads, plan-vs-actual derivation, or details state while extracting a
component that appears presentational.

Smaller safer extraction first:

- Extract the plan-adherence panel boundary before extracting the whole card.
- Keep filtering, sorting, persistence, History state, and app-wide statistics
  ownership in `app/trade-app.tsx`.
- Preserve the hidden review JSON and all visible labels/copy exactly.
- Prefer passing already-derived review/display props into a presentational
  panel if the runtime action can separate derivation cleanly.
- If that separation is too tangled, extract only the current panel boundary with
  no behavior changes and document that the review builder moved unchanged.

## 5. Candidate Next Refactor Targets

A. Extract Closed Trade plan-adherence panel

- Highest safety/payoff balance.
- The panel is a discrete detail section with clear visible copy and a known
  hidden agent-readable JSON contract.
- Main caution: preserve `buildPlanVsActualReview(...)` inputs, status/grade
  output, row ordering, warnings/deviations truncation, and hidden JSON.

B. Extract Closed Trade audit/timeline panel

- Useful, but riskier than plan-adherence because it touches local event reads,
  timeline/replay derivation, broker metadata display, quality panels, and
  multiple audit-oriented child components.

C. Extract ClosedPositionCard presentational/body component

- Possible now, but lower payoff than the plan-adherence panel because the card
  body is already partly simplified by the display mapper.
- It would still require slots for detail modal content and audit/status nodes.

D. Extract ClosedPositionCard container boundary

- Still too broad for the next safest step.
- It would combine local state, detail modal composition, display mapping,
  plan-adherence, audit/timeline, and outcome explanation concerns.

E. Pause History and move to Statistics/Dashboard extraction plan

- Reasonable later, but History still has low-risk detail-panel extraction work
  available.

## 6. Recommended Next Action

**Action 377 - Extract Closed Trade Plan-Adherence Panel**

Recommended scope:

- Extract the plan-vs-actual/adherence rendering into a dedicated History
  component.
- Preserve `trade-plan-vs-actual-review-json`, row order, labels, copy,
  `details`/`summary` behavior, status/grade pill, warnings/deviations truncation,
  and classNames.
- Keep History filtering/sorting, PnL/result calculation, persistence,
  Supabase/localStorage behavior, and app-wide statistics state in
  `app/trade-app.tsx`.
- Avoid changing any plan-adherence calculation or statistics behavior.

## 7. Risk Assessment

PnL/result display risk:

- The card-level PnL/R display is already protected by
  `closed-trade-display-mapper.ts`.
- Future panel extraction should not recalculate PnL or realized result values.

Plan-adherence/statistics risk:

- `ClosedTradePlanVsActualReviewPanel` currently derives the review and hidden
  JSON.
- Any extraction must preserve `buildPlanVsActualReview(...)` inputs and
  `planVsActualReviewJson(...)` output exactly.
- Do not change grade/status classification, warning/deviation truncation, or
  the visible explanatory copy.

Audit/timeline display risk:

- Audit reads and timeline/replay derivation should remain card-owned for now.
- Audit panels should be extracted only after the plan-adherence section is
  isolated.

Details modal close behavior risk:

- `ClosedTradeDetailsModal` now owns Escape/backdrop/close-button rendering
  behavior.
- `ClosedPositionCard` still owns details-open state and the close callback.

Card click/keyboard behavior risk:

- The card wrapper still opens details on click, `Enter`, and space.
- Full card extraction would need to preserve this behavior exactly.

E2E-visible text/design risk:

- Preserve `Closed Trade details`, `View details`, `Plan vs Actual Review`,
  `View plan-vs-actual checks`, and all existing section labels.
- Preserve details/summary blocks and hidden agent-readable JSON.

Persistence/statistics coupling risk:

- Do not move History filters, sorting, grouping, persistence, localStorage,
  Supabase, or app-wide statistics ownership during the next runtime refactor.

## 8. Verification

Action 376 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 377 Result

Action 377 added `components/history/ClosedTradePlanAdherencePanel.tsx`.

Extraction result:

- Extracted the plan-vs-actual / plan-adherence panel rendering into a
  presentational History component.
- Preserved the visible copy, status/grade pill, metric rows, deviations,
  warnings, `details`/`summary` checks block, classNames, and hidden
  `trade-plan-vs-actual-review-json` node.
- Kept `ClosedPositionCard` responsible for `buildPlanVsActualReview(...)` and
  `planVsActualReviewJson(...)`.

Still parent/card-owned:

- plan-vs-actual review derivation.
- statistics/adherence calculations.
- PnL/result calculations.
- audit/timeline derivation and local event reads.
- filtering/sorting/grouping logic.
- local details state and click/keyboard open behavior.
- persistence, localStorage/Supabase, execution/audit integration, and History
  state.

Next recommended action:

**Action 378 - Reassess ClosedPositionCard After Plan-Adherence Panel Extraction**

## 10. Action 378 Result

Action 378 added
`docs/closed-position-card-post-plan-adherence-panel-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after `ClosedTradePlanAdherencePanel`
  extraction.
- Confirmed the card still owns local details state, click/keyboard open
  behavior, PnL/result derivation, plan-vs-actual derivation and review JSON,
  audit/timeline derivation, detail panel nodes, display mapper usage, and card
  body/header/action rendering.
- Confirmed full card extraction is closer but still broader than the safest
  next step.
- Recommended extracting the closed trade audit/timeline disclosure panel next
  while keeping audit reads and derivation card-owned.

Next recommended action:

**Action 379 - Extract Closed Trade Audit Timeline Panel**

## 11. Action 379 Result

Action 379 added `components/history/ClosedTradeAuditTimelinePanel.tsx`.

Result:

- Extracted the closed trade audit/timeline disclosure wrapper.
- Preserved `Audit details`, the nested audit panel order, classNames, and the
  incomplete-data note.
- Kept `ClosedPositionCard` responsible for audit/timeline derivation, rendered
  audit child panels, plan-vs-actual derivation, PnL/result logic, persistence,
  and History state.

Next recommended action:

**Action 380 - Reassess ClosedPositionCard After Audit Timeline Panel Extraction**

## 12. Action 380 Result

Action 380 added
`docs/closed-position-card-post-audit-timeline-panel-reassessment.md`.

Result:

- Reassessed the remaining `ClosedPositionCard` responsibilities after the
  audit/timeline wrapper extraction.
- Confirmed History shell, closed trade display mapper, details modal,
  plan-adherence panel, and audit/timeline wrapper are now extracted.
- Confirmed History can pause because further card extraction has lower payoff
  and higher prop-drilling/interaction risk.

Next recommended action:

**Action 381 - Create Statistics/Dashboard Extraction Plan**
