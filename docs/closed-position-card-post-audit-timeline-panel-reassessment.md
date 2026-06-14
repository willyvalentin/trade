# ClosedPositionCard Post-Audit Timeline Panel Reassessment

## 1. Purpose

Reassess `ClosedPositionCard` after Action 379 extracted
`components/history/ClosedTradeAuditTimelinePanel.tsx`.

The History tab now has a shell, display mapper, details modal shell,
plan-adherence panel, and audit/timeline disclosure wrapper. This document
decides whether to continue extracting the closed trade card or pause History
and move to the next app-wide refactor area.

## 2. Current History Component Inventory

Extracted History components/helpers:

- `HistoryTab`: tab shell/layout.
- `closed-trade-display-mapper.ts`: pure card display mapping.
- `ClosedTradeDetailsModal`: details modal shell/header/body.
- `ClosedTradePlanAdherencePanel`: plan-vs-actual / plan-adherence rendering.
- `ClosedTradeAuditTimelinePanel`: audit/timeline disclosure wrapper.

Current approximate sizes:

- `app/trade-app.tsx`: 39,758 lines.
- `HistoryTab.tsx`: 41 lines.
- `closed-trade-display-mapper.ts`: 221 lines.
- `ClosedTradeDetailsModal.tsx`: 75 lines.
- `ClosedTradePlanAdherencePanel.tsx`: 291 lines.
- `ClosedTradeAuditTimelinePanel.tsx`: 22 lines.

Still inline in `app/trade-app.tsx`:

- `ClosedPositionCard`.
- `ClosedTradeResultStrip`.
- `ClosedTradeJournalSummary`.
- `ClosedTradePlanningSnapshotPanel`.
- `ClosedTradePlanVsActualReviewPanel` wrapper and review derivation.
- `ClosedTradeExecutionReview`.
- `ClosedTradePartialFillReview` and `FillRows`.
- `ClosedTradeOutcomeSummary`.
- `ClosedTradeProcessQualitySummary`.
- `ClosedTradeKeyLearnings`.
- audit child panel nodes passed into `ClosedTradeAuditTimelinePanel`.

Parent/card-owned behavior:

- local details-open state.
- card click/keyboard open behavior.
- PnL/result derivation.
- plan-vs-actual derivation and review JSON generation.
- audit/timeline derivation and local audit event reads.
- persistence, localStorage/Supabase, History filtering/sorting/grouping, and
  app-wide statistics ownership.

## 3. Remaining ClosedPositionCard Responsibilities

Local UI state:

- `isDetailsOpen`.
- `setIsDetailsOpen`.
- click-to-open behavior on the card article.
- keyboard open behavior for `Enter` and space.
- close callback passed to `ClosedTradeDetailsModal`.

PnL/result dependencies:

- uses `HistoryTradeSummary` for realized PnL/R display.
- uses `closed-trade-display-mapper.ts` for display props.
- uses `explainTradeOutcome(...)` for the card summary and details modal
  outcome sections.

Plan-vs-actual dependencies:

- `ClosedTradePlanVsActualReviewPanel` still calls
  `buildPlanVsActualReview(...)`.
- `ClosedTradePlanVsActualReviewPanel` still calls
  `planVsActualReviewJson(...)`.
- `ClosedTradePlanAdherencePanel` receives only already-derived review data.

Audit/timeline dependencies:

- `readTradeManagementEvents()`.
- `buildExecutionTimeline(...)`.
- `buildHandoffSessionReplay(...)`.
- `calculateExecutionQuality(...)`.
- `calculateHandoffQuality(...)`.
- `buildExecutionImprovementSuggestions(...)`.
- rendered child nodes for broker metadata, order preview, execution quality,
  handoff quality, improvement suggestions, trade outcome explainer, handoff
  replay, and execution timeline.

Remaining card body/header/action rendering:

- `CompanyIdentity`.
- `DataModePillRow`.
- outcome pill.
- setup/direction/opened/closed summary.
- PnL/R block.
- `MiniMetricGrid`.
- outcome explanation preview.
- journal-note preview.
- `View details` affordance.

## 4. Extraction Completeness Assessment

History extraction is complete enough to pause for now.

The remaining `ClosedPositionCard` is no longer dominated by simple wrapper JSX.
It mostly coordinates local detail state, card click/keyboard behavior,
display-node assembly, and multiple derived review/audit values. Extracting the
full card next would require a broad prop surface and would risk changing
interaction behavior or accidentally moving derivation logic.

Low payoff / high risk to extract further now:

- Full `ClosedPositionCard` container boundary.
- audit child panel node extraction if it requires moving timeline/replay or
  quality derivation.
- plan-vs-actual wrapper extraction if it moves calculation responsibility.

Worth extracting later:

- A presentational closed trade card body component, if the next History pass
  wants to reduce JSX without moving state.
- A pure display mapper for detail panel props, if the remaining details panels
  become a maintenance hotspot.
- A dedicated audit child-node composition helper, but only if it stays
  side-effect-free and does not read local audit events.

## 5. Candidate Next Refactor Targets

A. Extract ClosedPositionCard presentational/body component

- Possible, but modest payoff after the shell, details modal,
  plan-adherence panel, and audit wrapper extractions.
- Still needs careful handling of click/keyboard open behavior and display-node
  slots.

B. Extract remaining audit child panel nodes/helpers

- Riskier because the child panels are tied to metadata, quality, replay, and
  timeline derivation.
- Better deferred until a separate audit-display plan exists.

C. Extract ClosedPositionCard container boundary

- Highest risk in the History area.
- Would move or thread local state, click/keyboard behavior, detail nodes,
  plan-adherence derivation, and audit derivation through a large boundary.

D. Pause History and create Statistics/Dashboard extraction plan

- Best safety/payoff balance.
- The History-specific rendering has been decomposed enough to pause.
- Statistics/Dashboard remains a likely large app-wide domain in
  `app/trade-app.tsx`.

E. Reassess full `trade-app.tsx` after tab extraction work

- Useful after Statistics/Dashboard planning or extraction begins.
- A full reassessment now would likely repeat the same inventory without a new
  high-payoff target.

## 6. Recommended Next Action

**Action 381 - Create Statistics/Dashboard Extraction Plan**

Recommended scope:

- Inspect the statistics/dashboard sections in `app/trade-app.tsx`.
- Inventory summary cards, performance panels, plan-adherence statistics,
  recommendation outcome diagnostics, and any History-adjacent dashboards.
- Identify safe shell/card/panel boundaries.
- Keep calculations, persistence, Supabase/localStorage, and app-wide state in
  `app/trade-app.tsx` initially.

## 7. Risk Assessment

PnL/result display risk:

- PnL/R display is already protected by the closed trade display mapper.
- Avoid moving realized result calculations in any future card/body extraction.

Plan-adherence/statistics risk:

- The plan-adherence display panel is extracted, but review derivation and JSON
  generation remain card-owned.
- Statistics/dashboard extraction must avoid changing plan-adherence rates or
  review aggregation.

Audit/timeline display risk:

- The audit wrapper is extracted, but audit child nodes and derivation remain
  card-owned.
- Future audit extraction should not move `readTradeManagementEvents()` or
  timeline/replay derivation without a dedicated plan.

Details modal close behavior risk:

- `ClosedTradeDetailsModal` owns shell close interactions.
- `ClosedPositionCard` still owns details-open state and the close callback.

Card click/keyboard behavior risk:

- The card article still opens details on click, `Enter`, and space.
- Full card extraction would need exact preservation of role, tab index,
  keyboard behavior, and event propagation.

E2E-visible text/design risk:

- Preserve `View details`, `Closed Trade details`, `Plan vs Actual Review`,
  `Audit details`, and all History detail-section copy.
- Avoid className drift in any future card-body extraction.

Persistence/statistics coupling risk:

- History filtering/sorting, persistence, localStorage/Supabase behavior, and
  statistics/dashboard ownership remain app-level responsibilities.
- Statistics/Dashboard planning should start with documentation before runtime
  extraction.

## 8. Verification

Action 380 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 381 Result

Action 381 added `docs/statistics-dashboard-extraction-plan.md`.

Result:

- Created a documentation-only extraction plan for the Statistics/Dashboard
  area.
- Confirmed History extraction is paused/completed enough for now.
- Inventoried Statistics tab rendering, `StatisticsDashboardPanel`,
  recommendation analytics panels, plan-adherence statistics, chart panels, and
  app-wide data dependencies.
- Recommended extracting a Statistics dashboard shell first while keeping all
  calculations and data ownership in `app/trade-app.tsx`.

Next recommended action:

**Action 382 - Extract Statistics Dashboard Shell**

## 10. Action 382 Result

Action 382 added `components/statistics/StatisticsDashboard.tsx`.

Result:

- Extracted the Statistics dashboard shell while keeping calculations and
  Statistics body sections in `app/trade-app.tsx`.
- Preserved the current shell copy, range controls, loading state, status pill,
  classNames, and behavior.

Next recommended action:

**Action 383 - Reassess Statistics Dashboard After Shell Extraction**

## 11. Action 383 Result

Action 383 added `docs/statistics-dashboard-post-shell-reassessment.md`.

The reassessment confirmed the Statistics dashboard shell is extracted while all
metric calculations, range state, PnL/result logic, plan-adherence logic,
filtering, persistence, and dashboard body panels remain parent-owned in
`app/trade-app.tsx`.

Recommended next action:

**Action 384 - Extract Statistics Metric Card Presentational Component**

## 12. Action 398 Result

Action 398 added `docs/history-ui-state-hook-boundary-reassessment.md`.

Result:

- Confirmed History extraction remains complete enough to pause.
- Confirmed no History UI state hook should be extracted next.
- `ClosedPositionCard` detail state is already local, while History
  filter/sort state is dashboard- and e2e-visible-order-coupled.
- Recommended reassessing Live Day Trade UI state next.

Next recommended action:

**Action 399 - Reassess Live Day Trade UI State Hook Boundary**
