# ClosedPositionCard Post-Plan-Adherence Panel Reassessment

## 1. Purpose

Reassess `ClosedPositionCard` after Action 377 extracted
`components/history/ClosedTradePlanAdherencePanel.tsx`.

The plan-vs-actual rendering is now extracted, while the card still owns the
review calculation and review JSON generation. This document identifies the
remaining History card responsibilities and the safest next runtime refactor.

## 2. Current History Component Inventory

Current file inventory:

- `app/trade-app.tsx`: approximately 39,766 lines.
- `components/history/HistoryTab.tsx`: extracted History tab shell.
- `components/history/closed-trade-display-mapper.ts`: extracted pure card
  display mapper.
- `components/history/ClosedTradeDetailsModal.tsx`: extracted details modal
  shell/header/body rendering.
- `components/history/ClosedTradePlanAdherencePanel.tsx`: extracted
  plan-vs-actual / plan-adherence rendering.
- inline `ClosedPositionCard`: still owns local card state, card wrapper
  behavior, detail node composition, and closed-trade derivation.

Remaining inline detail panels and helpers:

- `ClosedTradeResultStrip`.
- `ClosedTradeJournalSummary`.
- `ClosedTradePlanningSnapshotPanel`.
- `ClosedTradePlanVsActualReviewPanel` wrapper, which still derives the review
  and review JSON before rendering `ClosedTradePlanAdherencePanel`.
- `ClosedTradeExecutionReview`.
- `ClosedTradePartialFillReview` and `FillRows`.
- `ClosedTradeOutcomeSummary`.
- `ClosedTradeProcessQualitySummary`.
- `ClosedTradeKeyLearnings`.
- audit details composition inside the details modal body.

Remaining audit/timeline display:

- The `Audit details` disclosure block is still inline in
  `ClosedPositionCard`.
- It composes broker metadata, broker order preview, execution quality, handoff
  quality, improvement suggestions, outcome explainer, handoff replay, and
  execution timeline panels.
- Audit event reading and timeline/replay derivation remain card-owned.

## 3. Remaining ClosedPositionCard Responsibilities

Local UI state and open behavior:

- `isDetailsOpen`.
- click-to-open behavior on the card article.
- keyboard open behavior for `Enter` and space.
- close callback passed to `ClosedTradeDetailsModal`.

Display and derivation:

- `readTradeManagementEvents()`.
- `buildExecutionTimeline(...)`.
- `buildHandoffSessionReplay(...)`.
- `calculateExecutionQuality(...)`.
- `calculateHandoffQuality(...)`.
- `buildExecutionImprovementSuggestions(...)`.
- `explainTradeOutcome(...)`.
- `buildClosedTradeDisplayProps(...)`.
- outcome pill node construction.
- details panel node composition.

Plan-vs-actual ownership:

- `ClosedTradePlanVsActualReviewPanel` still calls
  `buildPlanVsActualReview(...)`.
- It still calls `planVsActualReviewJson(...)`.
- The extracted `ClosedTradePlanAdherencePanel` only renders the already-derived
  `review`, `reviewJson`, and `ticker`.

Card body/header/action rendering:

- `CompanyIdentity` placement.
- data mode badge placement.
- outcome pill placement.
- setup/direction/opened/closed copy.
- PnL/R display.
- `MiniMetricGrid`.
- outcome explanation summary.
- journal-note preview.
- `View details` affordance.

History/app-owned responsibilities that remain outside extracted components:

- History filtering, sorting, and grouping.
- closed trade data construction.
- PnL/result derivation.
- statistics/dashboard ownership.
- persistence, localStorage, and Supabase behavior.
- execution/audit integration.

## 4. Extraction Readiness

Full `ClosedPositionCard` extraction is closer, but still not the safest next
runtime step.

A full card extraction would need props for:

- closed position and history summary.
- card display props from `closed-trade-display-mapper`.
- local details-open state or state ownership inside the extracted card.
- card click and keyboard open behavior.
- modal identity/status slots.
- result/journal/planning/plan-adherence/execution/partial-fill/outcome/process
  quality/key-learning sections.
- audit details nodes or all audit/timeline derivation inputs.
- optional exit notes.

That boundary would still mix local UI state, card wrapper behavior, plan review
derivation, audit/timeline derivation, and many display panels.

Smaller safer extraction first:

- Extract the closed trade audit/timeline panel from the details modal body.
- Keep `readTradeManagementEvents()`, timeline/replay derivation, execution
  quality, handoff quality, improvement suggestions, and outcome explanation in
  `ClosedPositionCard`.
- Pass already-derived nodes or data into the extracted audit panel.
- Preserve the `Audit details` disclosure copy, nested panel order, and
  incomplete-data note exactly.

## 5. Candidate Next Refactor Targets

A. Extract Closed Trade audit/timeline panel

- Best safety/payoff balance now that the plan-adherence display is extracted.
- The current `Audit details` block is a discrete disclosure section inside the
  details modal.
- It can be extracted as a presentational component while keeping audit reads and
  derivation in the card.

B. Extract ClosedPositionCard presentational/body component

- Possible, but still risks changing the card click/keyboard behavior and
  details modal composition.
- Better after audit details are isolated.

C. Extract ClosedPositionCard container boundary

- Still broad.
- It would require moving or threading local state, detail nodes, audit/timeline
  derivation, and card wrapper behavior through a large prop surface.

D. Pause History and create Statistics/Dashboard extraction plan

- Reasonable later, but History still has a clear low-risk extraction target.

## 6. Recommended Next Action

**Action 379 - Extract Closed Trade Audit Timeline Panel**

Recommended scope:

- Extract the read-only `Audit details` disclosure block into a presentational
  History component.
- Parent/card should pass the already-rendered audit panel nodes or already
  derived display props.
- Keep audit event reads, timeline/replay derivation, quality calculations,
  improvement suggestions, outcome explanation, persistence, and History state in
  `ClosedPositionCard` / `app/trade-app.tsx`.
- Preserve disclosure behavior, panel order, visible copy, classNames, and the
  incomplete-data note exactly.

## 7. Risk Assessment

PnL/result display risk:

- PnL/R card display remains protected by `closed-trade-display-mapper.ts`.
- Do not move PnL/result derivation while extracting audit details.

Plan-adherence/statistics risk:

- The extracted plan-adherence panel is presentational.
- `buildPlanVsActualReview(...)` and `planVsActualReviewJson(...)` remain
  card-owned and should stay there for now.

Audit/timeline display risk:

- Audit reads and timeline/replay derivation are still behavior/data-coupled.
- The next extraction should move rendering only and pass nodes or already
  derived values from the card.

Details modal close behavior risk:

- `ClosedTradeDetailsModal` owns shell close behavior.
- `ClosedPositionCard` still owns details-open state and the close callback.

Card click/keyboard behavior risk:

- The card article still opens details on click, `Enter`, and space.
- Avoid full card extraction until the remaining details sections are smaller.

E2E-visible text/design risk:

- Preserve `Audit details`, nested panel labels, `History explanations are based
  on available structured data and may be incomplete.`, `View details`, and all
  existing section ordering.

Persistence/statistics coupling risk:

- Do not move History filtering, sorting, grouping, persistence,
  localStorage/Supabase behavior, statistics/dashboard ownership, or
  execution/audit integration in the next runtime extraction.

## 8. Verification

Action 378 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 379 Result

Action 379 added `components/history/ClosedTradeAuditTimelinePanel.tsx`.

Extraction result:

- Extracted the read-only `Audit details` disclosure wrapper into a
  presentational History component.
- Preserved the disclosure label, wrapper classNames, child panel order, and
  incomplete-data note.
- `ClosedPositionCard` still passes the existing rendered audit child panels as
  children.

Still parent/card-owned:

- audit event reads.
- execution timeline derivation.
- handoff replay derivation.
- execution quality and handoff quality derivation.
- improvement suggestion derivation.
- outcome explanation derivation.
- plan-vs-actual derivation and review JSON.
- PnL/result logic, filtering/sorting/grouping, persistence, localStorage,
  Supabase, execution/audit integration, and History state.

Next recommended action:

**Action 380 - Reassess ClosedPositionCard After Audit Timeline Panel Extraction**

## 10. Action 380 Result

Action 380 added
`docs/closed-position-card-post-audit-timeline-panel-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after the audit/timeline disclosure wrapper
  extraction.
- Confirmed History extraction is complete enough to pause for now.
- Documented that the remaining card work is mostly local state, click/keyboard
  open behavior, derivation, and child-node composition.
- Recommended moving to Statistics/Dashboard planning instead of extracting the
  full `ClosedPositionCard` boundary next.

Next recommended action:

**Action 381 - Create Statistics/Dashboard Extraction Plan**
