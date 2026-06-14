# History Tab Extraction Plan

## 1. Purpose

Plan a safe extraction path for the History tab after pausing the Execution
Handoff Modal, Recommendations, and Live Day Trades refactor phases.

This action is documentation-only. It inventories the current History tab,
identifies component boundaries, and recommends the first low-risk runtime
refactor without changing behavior.

## 2. Current History Tab Inventory

Approximate current file size:

- `app/trade-app.tsx`: about 40,078 lines.

Primary History tab render location:

- The active `History` tab body starts around `app/trade-app.tsx:14937`.
- The inline History tab section runs through the `Recommendation Decisions`
  block around `app/trade-app.tsx:15271`.

Major History tab UI sections:

- Tab heading and descriptive copy.
- `TradePrimaryStatusbar` for History refresh status.
- `DataModeClarityBanner`.
- Dev-gated recommendation outcome evaluation runner.
- Hidden agent-readable JSON blocks for recommendation snapshots, outcomes,
  and outcome evaluation runs.
- `DailySessionSummaryPanel`.
- `SetupExecutionFeedbackPanel`.
- `RecommendationCalibrationPanel`.
- `CalibrationGuardrailSummaryPanel`.
- Trade Journal intro block.
- `Performance Summary`.
- `Setup Performance`.
- `Closed Positions`.
- `Recommendation History`.
- `Discarded Setups`.
- `Recommendation Decisions`.

Closed trade card and detail cluster:

- Closed-trade detail panel helpers start around `app/trade-app.tsx:28866`.
- `HistoryJournalControls` starts around `app/trade-app.tsx:35065`.
- `ClosedPositionCard` starts around `app/trade-app.tsx:35162`.
- `HistorySection` starts around `app/trade-app.tsx:39550`.

Important existing local components/helpers:

- `HistorySection`
- `HistoryJournalControls`
- `HistorySelect`
- `ClosedPositionCard`
- `ClosedTradeResultStrip`
- `ClosedTradeJournalSummary`
- `ClosedTradePlanningSnapshotPanel`
- `ClosedTradePlanVsActualReviewPanel`
- `ClosedTradeExecutionReview`
- `ClosedTradePartialFillReview`
- `ClosedTradeOutcomeSummary`
- `ClosedTradeProcessQualitySummary`
- `ClosedTradeKeyLearnings`
- `RecommendationHistoryPanel`
- `RecommendationHistoryCard`

Major state and handler dependencies:

- `closedPositions`
- `historyOutcomeFilter`
- `historyDemoFilter`
- `historyPartialFilter`
- `historySortMode`
- recommendation history filters and sort state
- `refreshIslands(["history_statistics"], "manual")`
- `setActiveTab("History")` from adjacent app surfaces
- loading and island refresh state

Major derived data dependencies:

- `performanceSummary`
- `setupPerformance`
- `setupExecutionFeedback`
- `recommendationCalibration`
- `calibrationGuardrailSummary`
- `historyDashboard`
- `historyPositionById`
- `discardedSetups`
- `discardReviewSummary`
- `historyRecommendations`
- `recommendationHistory`
- recommendation snapshot/outcome diagnostic JSON

Statistics and plan-adherence dependencies:

- Closed trade cards use `HistoryTradeSummary` from `buildHistoryDashboard`.
- Detail panels derive plan-vs-actual review, execution quality, handoff
  replay, handoff quality, improvement suggestions, partial fill accounting,
  and trade outcome explanations.
- Several panels are statistics-adjacent and should not be separated from their
  data derivation until display mappers are isolated.

Persistence and app-wide dependencies:

- Closed positions come from demo localStorage and Supabase position rows.
- Demo closed positions are read/written through `readDemoClosedPositions()` and
  `writeDemoClosedPositions(...)`.
- Closing a live trade writes or updates closed positions, then switches to the
  History tab.
- History/statistics refresh uses the shared island refresh system.
- `ClosedPositionCard` currently reads local trade-management events through
  `readTradeManagementEvents()` to build timeline and replay data.

Interaction points:

- History refresh button through `TradePrimaryStatusbar`.
- History journal filters and sort selects.
- Click or keyboard activation on a `ClosedPositionCard` opens its details
  modal.
- Recommendation History filters and sort controls.
- Details blocks use `details`/`summary` disclosure UI.

## 3. Recommended Component Boundaries

Recommended first component:

- `HistoryTab`

Potential later components:

- `ClosedTradeCard`
- `ClosedTradeCardHeader`
- `ClosedTradeResultMetrics`
- `ClosedTradePlanAdherencePanel`
- `ClosedTradeExecutionTimeline`
- `ClosedTradeDetailsModal`
- `HistoryEmptyState`
- `HistoryFilters`
- `HistoryRecommendationDecisions`
- `HistoryDiscardedSetupsSection`

Recommended first boundary details:

- `HistoryTab` should initially be a shell/composition component.
- It should own only layout, section ordering, and rendering of already-derived
  props or rendered nodes.
- It should not own History state, refresh handlers, data construction,
  Supabase/localStorage behavior, recommendation outcome evaluation, or closed
  trade detail calculations.

Recommended later card boundary details:

- `ClosedTradeCard` should wait until a pure closed-trade display mapper is
  extracted.
- The current `ClosedPositionCard` owns local detail-open state and derives
  timeline/replay/execution quality/improvement suggestions/outcome explanation
  inline.
- Moving the full card before isolating display derivation would be a larger
  behavior and prop-surface risk.

Recommended details boundary details:

- `ClosedTradeDetailsModal` should wait until the closed-trade detail helper
  cluster is split into pure display helpers and render-only panels.
- Plan-vs-actual, execution quality, partial fills, handoff quality, and audit
  panels should remain behavior-free and read-only when extracted.

## 4. What Should Remain In `trade-app.tsx` Initially

Keep these parent-owned for the first History refactor:

- Closed trade data construction.
- Demo and Supabase closed-position loading.
- History filtering/sorting state.
- `historyDashboard` construction.
- `historyPositionById` construction.
- Recommendation history construction and filters.
- Recommendation outcome evaluation state and handler.
- Refresh island state and `refreshIslands(...)` handler.
- Persistence/localStorage/Supabase effects.
- Statistics/dashboard calculation ownership where app-wide.
- Cross-tab state and `setActiveTab(...)`.
- Audit/event reading and timeline construction until a later dedicated
  closed-trade display mapper exists.

## 5. First Extraction Target

Recommended first runtime refactor:

**Action 371 - Extract History Tab Shell**

Why this is safest:

- It mirrors the proven `RecommendationsTab` and `LiveDayTradesTab` shell
  extraction pattern.
- The parent can keep all data/state/handlers and pass rendered section nodes or
  explicit display props.
- It reduces `app/trade-app.tsx` render complexity without touching
  closed-trade card behavior, statistics calculations, or persistence.

Alternative considered:

**Action 371 - Reassess Closed Trade Card Boundary**

This is useful but less valuable as the next step because the current card
couples local modal state, local event reading, timeline/replay derivation, and
several detail-panel calculations. A shell extraction gives lower risk and
better immediate file-shape improvement.

## 6. Risk Assessment

PnL/result display coupling:

- Closed trade cards combine `HistoryTradeSummary`, raw `ClosedPosition`
  values, execution metadata, and fallback parsing.
- Keep result display unchanged until a pure mapper can preserve the exact
  current fallbacks.

Plan-adherence/statistics coupling:

- Plan-vs-actual review depends on stored planning snapshots and execution
  metadata.
- Do not move review construction as part of a shell extraction.

History sorting/filtering coupling:

- `historyDashboard` owns filtered and sorted trade summaries.
- History filter state should remain parent-owned during the shell extraction.

Audit/timeline display coupling:

- `ClosedPositionCard` reads local trade-management events and builds execution
  timeline/replay data.
- Avoid moving event reads into presentational components.

Selected/expanded state:

- `ClosedPositionCard` currently owns local `isDetailsOpen` state.
- Keep that state with the card until a later card/container extraction plan.

E2E-visible text/design preservation:

- Preserve "History", "Closed Positions", "History v2 Journal",
  "Recommendation History", "Discarded Setups", "Recommendation Decisions",
  "View details", and all closed-trade modal text.

LocalStorage/Supabase risk:

- Do not move demo history reads/writes, Supabase closed-position loading, or
  trade close persistence in the History shell extraction.

Cross-tab history/statistics dependency:

- History and Statistics share many summaries and island refresh flows.
- Keep app-wide summary construction in `trade-app.tsx` for now.

## 7. Proposed Implementation Sequence

1. Action 371: Extract History tab shell.
2. Action 372: Reassess closed trade card boundary after shell extraction.
3. Action 373: Extract closed trade display mapper.
4. Action 374: Extract `ClosedTradeCard` presentational/container boundary if
   mapper extraction makes the prop surface safe.
5. Action 375: Reassess History area after card extraction.
6. Action 376: Extract details/timeline/plan-adherence panels if safe.
7. Action 377: Reassess whether to pause History and move to the next app-wide
   domain.

## 8. Verification Expectations For Future Runtime Refactors

Future runtime refactors should run:

- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`
- `git diff --check`
- `npm run test:e2e`

## 9. Recommended Next Action

**Action 371 - Extract History Tab Shell**

Recommended scope:

- Create `components/history/HistoryTab.tsx`.
- Move only the outer History tab layout/composition shell.
- Keep all History state, filters, refresh handlers, data construction,
  persistence, closed-trade card behavior, and app-wide statistics derivation in
  `app/trade-app.tsx`.

Action 370 verification:

- `git diff --check`

No runtime code changes are expected.

## 10. Action 371 Result

Action 371 added `components/history/HistoryTab.tsx`.

Extraction result:

- Extracted the outer History tab shell/layout.
- The shell now renders the History heading/copy plus slots for the statusbar,
  data-mode banner, optional outcome evaluation runner, hidden diagnostics, and
  the existing History section children.
- `app/trade-app.tsx` still constructs and owns all History section nodes,
  closed trade cards, filters, sort state, refresh handlers, data construction,
  recommendation outcome diagnostics, persistence, and app-wide statistics
  derivation.

Safety result:

- No filtering/sorting/grouping logic moved.
- No PnL/result calculation moved.
- No plan-adherence/statistics logic moved.
- No audit/timeline derivation moved.
- No selected/details state or persistence behavior moved.
- No Avanza/browser/execution behavior was added.

Next recommended action:

**Action 372 - Reassess History Tab After Shell Extraction**

## 11. Action 372 Result

Action 372 added `docs/history-tab-post-shell-reassessment.md`.

Result:

- Reassessed the History tab after `HistoryTab` shell extraction.
- Confirmed `ClosedPositionCard` remains local to `app/trade-app.tsx`.
- Confirmed the closed trade card mixes pure display mapping with local
  details-open state, local audit event reads, timeline/replay derivation,
  handoff/execution quality derivation, plan-vs-actual review construction, and
  expanded details modal rendering.
- Recommended extracting a pure closed trade display mapper before moving the
  full card boundary.

Next recommended action:

**Action 373 - Extract Closed Trade Display Mapper**

## 12. Action 373 Result

Action 373 added `components/history/closed-trade-display-mapper.ts`.

Result:

- Extracted pure display mapping for `ClosedPositionCard`.
- Moved card-level display props for outcome label/tone, PnL/R display,
  metric rows, journal-note fallback, reality badges, and History / Statistics
  surface notice metadata.
- Kept closed trade card state, audit/timeline derivation, plan-vs-actual
  review construction, details modal rendering, filtering/sorting, persistence,
  and app-wide statistics ownership in `app/trade-app.tsx`.

Next recommended action:

**Action 374 - Reassess ClosedPositionCard After Display Mapper Extraction**

## 13. Action 374 Result

Action 374 added
`docs/closed-position-card-post-display-mapper-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after Action 373.
- Confirmed the display mapper reduced card display complexity but did not move
  local state, audit/timeline derivation, plan-vs-actual review construction, or
  details modal rendering.
- Recommended extracting a presentational closed trade details modal next,
  keeping all derivation and state card-owned.

Next recommended action:

**Action 375 - Extract Closed Trade Details Modal Presentational Component**

## 14. Action 375 Result

Action 375 added `components/history/ClosedTradeDetailsModal.tsx`.

Result:

- Extracted the closed trade details modal shell/rendering as a presentational
  component.
- Kept `ClosedPositionCard` responsible for details-open state, PnL/result
  display derivation, audit/timeline derivation, plan-vs-actual review
  construction, details panel node composition, filtering/sorting, persistence,
  and app-wide statistics ownership.

Next recommended action:

**Action 376 - Reassess ClosedPositionCard After Details Modal Extraction**

## 15. Action 376 Result

Action 376 added
`docs/closed-position-card-post-details-modal-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after `ClosedTradeDetailsModal` extraction.
- Documented that History shell, closed trade display mapper, and closed trade
  details modal shell are extracted.
- Documented that `ClosedPositionCard` still owns local details state,
  plan-vs-actual review construction, audit/timeline derivation, detail panel
  node composition, filtering/sorting boundaries, persistence, and History
  state.
- Recommended the plan-adherence panel as the next safe History extraction.

Next recommended action:

**Action 377 - Extract Closed Trade Plan-Adherence Panel**

## 16. Action 377 Result

Action 377 added `components/history/ClosedTradePlanAdherencePanel.tsx`.

Result:

- Extracted the plan-adherence / plan-vs-actual panel rendering from
  `app/trade-app.tsx`.
- Left `buildPlanVsActualReview(...)` and `planVsActualReviewJson(...)` in the
  existing card-owned wrapper.
- Preserved the panel order, visible labels, hidden review JSON, warnings,
  deviations, checks details block, and classNames.
- Confirmed History data construction, filtering/sorting, PnL/result
  calculations, audit/timeline derivation, persistence, and statistics ownership
  remain in the parent/card area.

Next recommended action:

**Action 378 - Reassess ClosedPositionCard After Plan-Adherence Panel Extraction**

## 17. Action 378 Result

Action 378 added
`docs/closed-position-card-post-plan-adherence-panel-reassessment.md`.

Result:

- Reassessed the History card after plan-adherence panel extraction.
- Confirmed History shell, closed trade display mapper, details modal shell, and
  plan-adherence panel are extracted.
- Confirmed `ClosedPositionCard` still owns local details state, PnL/result
  derivation, plan-vs-actual derivation/review JSON, audit/timeline derivation,
  details panel composition, persistence boundaries, and History state.
- Recommended the audit/timeline disclosure panel as the next safe History
  extraction.

Next recommended action:

**Action 379 - Extract Closed Trade Audit Timeline Panel**

## 18. Action 379 Result

Action 379 added `components/history/ClosedTradeAuditTimelinePanel.tsx`.

Result:

- Extracted the closed trade audit/timeline disclosure rendering.
- Left audit event reads, timeline/replay derivation, quality calculations,
  improvement suggestions, outcome explanation, and rendered audit child panel
  creation in `ClosedPositionCard`.
- Preserved the audit disclosure behavior, visible copy, classNames, and child
  panel order.

Next recommended action:

**Action 380 - Reassess ClosedPositionCard After Audit Timeline Panel Extraction**

## 19. Action 380 Result

Action 380 added
`docs/closed-position-card-post-audit-timeline-panel-reassessment.md`.

Result:

- Reassessed the History card after audit/timeline wrapper extraction.
- Documented that the extracted History set now covers the tab shell, closed
  trade display mapper, details modal shell, plan-adherence panel, and
  audit/timeline disclosure wrapper.
- Recommended pausing History extraction and moving to Statistics/Dashboard
  planning.

Next recommended action:

**Action 381 - Create Statistics/Dashboard Extraction Plan**

## 20. Action 381 Result

Action 381 added `docs/statistics-dashboard-extraction-plan.md`.

Result:

- Created the Statistics/Dashboard extraction plan after pausing History.
- Documented that Statistics includes realized PnL/R, win/loss metrics, profit
  factor, plan adherence, recommendation analytics, chart panels, and
  History/Live/Recommendations integration.
- Recommended shell extraction first, with calculations and persistence
  remaining in `app/trade-app.tsx`.

Next recommended action:

**Action 382 - Extract Statistics Dashboard Shell**

## 21. Action 382 Result

Action 382 added `components/statistics/StatisticsDashboard.tsx`.

Result:

- Extracted the Statistics dashboard shell/header and loading wrapper.
- Kept all Statistics calculations, metric cards, analytics panels, chart panels,
  range state, persistence, and cross-tab behavior parent-owned.

Next recommended action:

**Action 383 - Reassess Statistics Dashboard After Shell Extraction**

## 22. Action 383 Result

Action 383 added `docs/statistics-dashboard-post-shell-reassessment.md`.

The reassessment inventoried the remaining Statistics body and found the safest
next runtime boundary is the repeated metric-card rendering, with all dashboard
calculations and persistence still intentionally parent-owned.

Recommended next action:

**Action 384 - Extract Statistics Metric Card Presentational Component**

## 23. Action 388 Result

Action 388 added `docs/trade-app-post-major-ui-extraction-reassessment.md`.

Result:

- Confirmed History extraction is complete enough to pause.
- Remaining History responsibilities in `app/trade-app.tsx` are calculation- or
  behavior-coupled: filtering/sorting, PnL/result derivation,
  plan-vs-actual derivation, audit/timeline derivation, persistence boundaries,
  and closed card local state.
- Recommended app-wide state/effects extraction planning next.

Next recommended action:

**Action 389 - Create App State/Effects Extraction Plan**

## 24. Action 389 Result

Action 389 added `docs/app-state-effects-extraction-plan.md`.

Result:

- Planned app-wide state/effects extraction after pausing History UI work.
- Confirmed History filter state may be a future UI-state hook candidate, but
  closed trade data, filtering/sorting behavior, PnL/result derivation,
  plan-vs-actual review, audit/timeline derivation, persistence, and
  Statistics integration should remain parent-owned.
- Recommended reassessing navigation/tab state first.

Next recommended action:

**Action 390 - Reassess Navigation/Tab State Hook Boundary**
