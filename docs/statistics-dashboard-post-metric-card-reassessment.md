# Statistics Dashboard Post-Metric Card Reassessment

## 1. Purpose

Reassess the Statistics/Dashboard area after Action 384 extracted
`components/statistics/StatisticsMetricCard.tsx`.

The goal is to determine the safest next runtime extraction while preserving
statistics calculations, PnL/result logic, profit-factor/win-rate logic,
plan-adherence logic, time-range filtering, persistence, and cross-tab
integration exactly.

## 2. Current Statistics Component Inventory

Current file inventory:

- `app/trade-app.tsx`: approximately 39,691 lines.
- `components/statistics/StatisticsDashboard.tsx`: approximately 101 lines.
- `components/statistics/StatisticsMetricCard.tsx`: approximately 29 lines.

Extracted Statistics components:

- `StatisticsDashboard`: presentational shell for the Statistics heading,
  time-range controls, range summary, progress pill, loading empty state, and
  body slot.
- `StatisticsMetricCard`: presentational metric-card wrapper, value/label
  markup, classNames, and positive/negative/neutral tone styling.

Compatibility layer:

- `SummaryCard` remains in `app/trade-app.tsx`.
- It now delegates to `StatisticsMetricCard` while preserving the existing
  `label`, `value`, and `tone` API for all current call sites.

Remaining inline metric groups and panels:

- primary Statistics metric grid inside `StatisticsDashboardPanel`.
- recommendation engine analytics headline metric grid.
- recommendation performance, tier, batch, sample quality, calibration, and
  backlog panels.
- plan-adherence statistics summary and its status/grade breakdown rows.
- chart panel composition and chart components.
- recent closed trades, open positions context, partial-close accounting, and
  period-risk context.
- legacy performance summary cards and setup performance table.

Parent-owned calculations and state:

- `selectedStatisticsRange` and `setSelectedStatisticsRange`.
- dashboard construction through `buildStatisticsDashboard(...)`.
- History dashboard construction through `buildHistoryDashboard(...)`.
- recommendation analytics summary construction and JSON readbacks.
- metric formatting helpers such as `formatSignedCurrency`, `formatSignedR`,
  `formatPercent`, `formatStatisticsProfitFactor`,
  `formatStatisticsDurationMinutes`, and `formatStatisticsCount`.
- app-wide persistence, localStorage/Supabase loading, refresh flows, and
  cross-tab integration.

## 3. Remaining Statistics Responsibilities in trade-app.tsx

Metric calculations:

- trade counts, realized PnL, total R, average R, expectancy, winners, losers,
  breakeven, best/worst trade, max daily gain/loss, average hold, and trades/day
  remain derived before rendering.

Formatted display values:

- Existing call sites continue formatting values before passing strings into
  `SummaryCard`.
- `StatisticsMetricCard` does not calculate or format values.

PnL/result derivation:

- PnL and R calculations remain in dashboard builders and app-level helpers.
- Chart data and recent-trade rows still consume already-derived dashboard data.

Profit-factor/win-rate derivation:

- Profit factor formatting, including null/infinite handling, remains in
  `formatStatisticsProfitFactor(...)`.
- Win-rate formatting remains in existing percent helpers.

Plan-adherence/statistics derivation:

- `PlanAdherenceStatisticsSummary` still derives status and grade display rows
  from `dashboard.planAdherenceSummary`.
- Plan-vs-actual aggregation and review semantics remain in the dashboard data.

Time-range/filter state:

- Time-range controls render in `StatisticsDashboard`, but range state and
  filtering remain parent-owned.

Persistence/localStorage/Supabase behavior:

- No storage, Supabase, or refresh behavior moved with the card extraction.

Cross-tab data integration:

- Statistics still integrates History, Live Day Trades, Recommendations, Market
  diagnostics, scan logs, and stored recommendation outcomes in
  `app/trade-app.tsx`.

## 4. Extraction Readiness

Are metric groups ready to extract as presentational panels?

- The primary Statistics metric grid is ready for a small presentational
  extraction if it receives already-rendered cards or already-formatted metric
  card props.
- The recommendation analytics headline grid is also possible, but it sits in a
  larger panel with details, buttons, and hidden JSON readbacks.
- Plan-adherence metrics should wait because that section still derives
  status/grade rows and warning truncation locally.

Is a display mapper needed first?

- Not for the next smallest step.
- A display mapper would be useful before extracting broader PnL/result or
  plan-adherence panels, but the immediate summary grid can preserve behavior by
  accepting `children` or explicit formatted card props.

Should `SummaryCard` stay as a local compatibility wrapper?

- Yes for now.
- It avoids touching widespread call sites outside the immediate Statistics
  dashboard and keeps broader diagnostics/history panels stable.
- A later action can reassess whether to replace call sites directly with
  `StatisticsMetricCard`.

Which pieces are too calculation-coupled to move now?

- chart components, because they derive SVG coordinates and titles from series
  values.
- plan-adherence summary, because it still creates breakdown rows and warnings.
- recommendation analytics details, because they contain hidden JSON contracts,
  `data-*` readbacks, and analytics-specific table logic.
- period-risk and partial-close summaries, because they encode risk copy and
  app-wide accounting context.

## 5. Candidate Next Refactor Targets

A. Extract Statistics Summary Grid:

- Safest next runtime target.
- Can move only grid wrapper/layout while receiving existing cards as children,
  or receive already-formatted `StatisticsMetricCard` props.
- Does not require calculation, formatting, persistence, or hidden JSON changes.

B. Extract PnL/Result Summary Panel:

- Medium payoff but more calculation-sensitive.
- Should wait until the summary grid wrapper is stable or a display mapper is in
  place.

C. Extract Plan-Adherence Summary Panel:

- Higher payoff, higher risk.
- Needs careful handling of status/grade row derivation, warnings, and
  plan-adherence copy.

D. Extract Statistics Display Mapper:

- Useful before extracting larger metric panels.
- Not required before a grid-only extraction because current call sites already
  format values explicitly.

E. Reassess full `trade-app.tsx` after major tab extraction work:

- Valuable soon, but one more small Statistics extraction can reduce repeated
  JSX without changing behavior.

## 6. Recommended Next Action

Recommended next runtime refactor:

**Action 386 - Extract Statistics Summary Grid**

Why:

- The summary grid is the next smallest presentational boundary after the metric
  card.
- It can preserve all existing metric calculations and formatted values by
  accepting `children`.
- It reduces `StatisticsDashboardPanel` complexity without touching
  recommendation analytics, plan-adherence derivation, chart logic, persistence,
  or range state.

Scope guidance for Action 386:

- Create a presentational grid component under `components/statistics/`.
- Prefer an API such as `children` plus an optional `className`/column variant
  only if needed by current grids.
- Move only grid wrapper classNames and card placement.
- Keep all `SummaryCard` calls and formatted values in `app/trade-app.tsx` if
  that is the lowest-risk implementation.
- Do not move plan-adherence row derivation, chart coordinate logic,
  recommendation analytics details, hidden JSON readbacks, or persistence.

## 7. Risk Assessment

Metric drift:

- Low if a grid extraction receives already-rendered children.
- Higher if it starts building card props from raw dashboard metrics.

PnL/profit-factor correctness risk:

- Profit factor, PnL, R, and win-rate formatting must remain unchanged.
- Do not move `formatStatisticsProfitFactor(...)` or related helpers yet.

Plan-adherence/statistics risk:

- Plan-adherence summary should not be extracted together with the grid.
- Status/grade breakdown row construction remains parent-owned.

Time-range/filter behavior risk:

- Time-range controls are already in `StatisticsDashboard`; no next action
  should change range state or selected range behavior.

Lost e2e selectors/text:

- Preserve labels, card ordering, `Recommendation Engine Analytics`, `Plan
  Adherence`, chart titles, hidden JSON IDs, and `data-*` attributes.

Prop drilling:

- A children-based grid has minimal prop drilling.
- A display-props grid creates a larger prop surface and should only be used if
  it remains explicit and already formatted.

Design/className drift:

- Preserve existing grid classNames such as `grid gap-3 sm:grid-cols-2
  xl:grid-cols-5`.
- Do not consolidate unrelated grids with different column counts unless the
  component supports the exact current variants.

Persistence/statistics safety:

- No localStorage, Supabase, refresh, trade mutation, execution, or
  dashboard-builder logic should move.

## 8. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 386 Result

Action 386 added `components/statistics/StatisticsSummaryGrid.tsx`.

Extraction result:

- Extracted the reusable Statistics summary grid wrapper.
- Replaced the primary Statistics metric grid, recommendation analytics headline
  metric grid, and plan-adherence headline metric grid with
  `StatisticsSummaryGrid`.
- Kept every `SummaryCard` call, label, formatted value, tone, and ordering in
  `app/trade-app.tsx`.
- Supported the existing five-column and six-column responsive grid variants
  without changing classNames or layout behavior.

Behavior preservation:

- Preserved all metric labels, values, card order, responsive grid classes,
  plan-adherence copy, recommendation analytics copy, and dashboard composition.

What remained inline:

- `StatisticsDashboardPanel` still owns the dashboard body composition.
- `SummaryCard` remains a local compatibility wrapper around
  `StatisticsMetricCard`.
- Metric calculations, formatted display values, PnL/result logic,
  profit-factor/win-rate logic, plan-adherence derivation, time-range state,
  filtering, persistence, hidden JSON readbacks, charts, and recommendation
  analytics panels remain in `app/trade-app.tsx`.

Next recommended action:

**Action 387 - Reassess Statistics Dashboard After Summary Grid Extraction**

## 10. Action 387 Result

Action 387 added `docs/statistics-dashboard-post-summary-grid-reassessment.md`.

Reassessment result:

- Confirmed `StatisticsDashboard`, `StatisticsMetricCard`, and
  `StatisticsSummaryGrid` are extracted.
- Confirmed `SummaryCard` remains local as a compatibility wrapper.
- Confirmed remaining Statistics panels are now calculation-adjacent:
  plan-adherence row derivation, recommendation analytics readbacks, chart
  coordinate generation, recent/open context, partial-close accounting, and
  period-risk copy.
- Concluded Statistics extraction is complete enough to pause.

Next recommended action:

**Action 388 - Reassess trade-app.tsx After Major UI Extraction Work**
