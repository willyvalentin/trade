# Statistics/Dashboard Extraction Plan

## 1. Purpose

Plan a safe Statistics/Dashboard extraction after pausing the History tab work.

The goal is to reduce `app/trade-app.tsx` by extracting presentational
Statistics/Dashboard sections without moving metric calculations, PnL/result
logic, plan-adherence logic, persistence, or cross-tab state.

## 2. Current Statistics/Dashboard Inventory

Current file size:

- `app/trade-app.tsx`: approximately 39,758 lines.

Approximate Statistics/Dashboard locations:

- Statistics tab render: around `app/trade-app.tsx:14851`.
- `StatisticsDashboardPanel`: around `app/trade-app.tsx:17483`.
- recommendation performance/tier/batch analytics panels: around
  `app/trade-app.tsx:17942` through `app/trade-app.tsx:18640`.
- recommendation learning/readiness/backlog panels: around
  `app/trade-app.tsx:18700` through `app/trade-app.tsx:20400`.
- `PlanAdherenceStatisticsSummary`: around `app/trade-app.tsx:20481`.
- statistics chart/detail panels: around `app/trade-app.tsx:20679` through
  `app/trade-app.tsx:21240`.
- legacy History-tab performance summary helpers:
  `PerformanceSummaryCards`, `SummaryCard`, and `SetupPerformanceTable` around
  `app/trade-app.tsx:21439`.

Major UI sections:

- Statistics header / progress dashboard shell.
- time-range selector.
- island/status surfaces and manual refresh wiring around the tab.
- progress summary block.
- primary metric card grid.
- recommendation engine analytics summary.
- recommendation learning insight panels.
- recommendation performance, tier performance, batch performance, data quality,
  calibration readiness, and improvement backlog details.
- plan-adherence statistics summary.
- chart panels for cumulative PnL, cumulative R, daily PnL, daily R, trade count,
  outcomes, and setup type performance.
- recent statistics trades.
- open positions context.
- partial-close summary.
- period-risk summary.
- legacy History performance summary cards and setup performance table.

Major metric groups:

- realized PnL and total R.
- win/loss/breakeven counts and win rate.
- average R, expectancy, average winner/loser, best/worst trade.
- profit factor.
- max daily gain/loss.
- holding time and trades/day.
- plan-adherence reviewed trades, status breakdown, grade breakdown, risk
  deviation, reward capture, and warning notes.
- recommendation outcome performance, confidence buckets, tier performance,
  batch performance, calibration readiness, sample quality, and improvement
  backlog.
- execution/audit-adjacent statistics surfaced through History and session
  summaries.

Major calculation/helper dependencies:

- `buildStatisticsDashboard(...)`.
- `buildHistoryDashboard(...)`.
- `calculatePerformanceSummary(...)`.
- `calculateSetupPerformance(...)`.
- `buildRecommendationPerformanceStatistics(...)`.
- `buildRecommendationTierPerformanceSummary(...)`.
- `buildRecommendationBatchPerformanceSummary(...)`.
- recommendation learning insight builders.
- confidence calibration readiness builders.
- plan-vs-actual review aggregation through `lib/statistics-dashboard`.
- formatting helpers such as `formatPercent`, `formatSignedCurrency`,
  `formatSignedR`, `formatStatisticsProfitFactor`,
  `formatStatisticsDurationMinutes`, `formatStatisticsCount`, and
  `formatStatisticsStatusLabel`.

App-wide dependencies:

- `selectedStatisticsRange` state and `setSelectedStatisticsRange`.
- closed positions and open positions.
- recommendation snapshots and outcomes.
- scan logs and diagnostics.
- island refresh state and manual refresh handlers.
- History tab navigation via `onViewHistory`.
- data-mode surface notices.
- local/demo state, localStorage, Supabase-backed reads, and app-wide refresh
  flows.

Interaction points:

- time-range buttons.
- `View Full History` / `Review History` navigation.
- recommendation analytics `details` disclosures.
- chart/details disclosure blocks.
- manual refresh controls outside the dashboard panel.

## 3. Recommended Component Boundaries

Initial safe boundaries:

- `StatisticsDashboard`: top-level presentational shell for the current
  `StatisticsDashboardPanel` JSX.
- `StatisticsMetricCard` or reuse/extract `SummaryCard` carefully once shared
  usage is mapped.
- `StatisticsProgressHeader`: title, copy, range description, and progress pill.
- `StatisticsTimeRangeFilters`: time-range button row with parent-owned
  `selectedRange` and `onRangeChange`.
- `StatisticsPrimaryMetricsGrid`: realized PnL, total R, win rate, profit
  factor, expectancy, winners/losers, hold time, and trades/day cards.
- `StatisticsRecommendationAnalyticsPanel`: shell around recommendation learning
  and analytics details, while all summaries/JSON remain parent-owned.
- `PlanAdherencePanel`: presentational wrapper for already-derived dashboard
  plan-adherence statistics.
- `StatisticsChartsGrid`: chart panel composition only; chart calculations stay
  with `StatisticsDashboard` data.
- `StatisticsEmptyState`: presentational empty/loading state if not already
  covered by `EmptyState`.

Later or riskier boundaries:

- `RecommendationPerformanceStatisticsPanel` and related advanced analytics
  panels, because they include hidden JSON contracts and detailed metric tables.
- chart components, because they translate data to SVG coordinates and labels.
- display mappers for statistics cards, only after the shell/card boundaries are
  stable.

## 4. What Should Remain in trade-app.tsx Initially

Keep these in `app/trade-app.tsx` for the first Statistics runtime refactors:

- statistics input data construction.
- `selectedStatisticsRange` state.
- time-range filtering logic.
- `buildStatisticsDashboard(...)`.
- `buildHistoryDashboard(...)`.
- PnL/result calculations.
- plan-adherence/statistics calculations.
- recommendation performance, tier, batch, learning, calibration, and backlog
  calculations.
- JSON readback generation for hidden agent-readable diagnostics.
- persistence/localStorage/Supabase effects.
- island refresh state and refresh handlers.
- cross-tab navigation and state.
- History, Live Day Trades, and Recommendations integration.

The first extraction should pass already-built dashboard and summary objects into
presentational components.

## 5. First Extraction Target

Recommended first runtime refactor:

**Action 382 - Extract Statistics Dashboard Shell**

Why:

- `StatisticsDashboardPanel` is a large JSX composition boundary.
- It already receives all calculated dashboard and recommendation analytics data
  as props.
- Extracting the shell can reduce `trade-app.tsx` without changing calculations
  or state ownership.
- Parent can continue to own range state, refresh state, dashboard construction,
  recommendation analytics construction, JSON generation, and navigation.

Scope guidance:

- Move only the current `StatisticsDashboardPanel` rendering into
  `components/statistics/StatisticsDashboard.tsx` or similarly named component.
- Keep prop types explicit.
- Keep calculation helpers and data construction in `app/trade-app.tsx`.
- If nested helper components are only used by the dashboard and are rendering
  only, move them with the dashboard only if it does not expand risk.
- Preserve visible copy, button labels, details/summary blocks, hidden JSON
  nodes, classNames, and row ordering.

## 6. Risk Assessment

Metric calculation drift:

- High risk if calculations move.
- First extractions must receive already-computed values and render them only.

PnL/result correctness risk:

- Realized PnL, R, win rate, profit factor, expectancy, and daily gain/loss
  values must not be recalculated during shell extraction.

Plan-adherence/statistics coupling:

- Plan adherence is tied to `lib/statistics-dashboard` and plan-vs-actual review
  semantics.
- Do not move aggregation or status/grade calculation in early runtime refactors.

History/live data dependency risk:

- Statistics combines closed trades, open positions context, recommendation
  outcomes, snapshots, scan logs, and dashboard data.
- Keep integration and data construction parent-owned.

E2E-visible text/design preservation:

- Preserve `Statistics`, `Progress Dashboard`, `View Full History`, `Review
  History`, `Plan Adherence`, chart titles, details labels, and hidden JSON IDs.
- Preserve classNames and responsive grid structure where practical.

LocalStorage/Supabase risk:

- Statistics depends on loaded app data and island refresh state.
- Do not move reads, writes, refresh flows, or persistence side effects.

Cross-tab dependency risk:

- Statistics links to History and shares data with History/Market diagnostics.
- Keep navigation callbacks and cross-tab state in `app/trade-app.tsx`.

## 7. Proposed Implementation Sequence

1. Action 382: Extract Statistics Dashboard Shell.
2. Action 383: Reassess Statistics Dashboard After Shell Extraction.
3. Action 384: Extract Statistics metric card/grid presentational components.
4. Action 385: Reassess metric card and chart boundaries.
5. Action 386: Extract Statistics display mappers only if safe.
6. Action 387: Reassess whether to pause Statistics or continue with advanced
   recommendation analytics panels.

## 8. Verification Expectations for Future Runtime Refactors

Future runtime refactors should run:

- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`
- `git diff --check`
- `npm run test:e2e`

If `npm run test:e2e` fails inside the sandbox with `listen EPERM
0.0.0.0:3010`, rerun the same command with the required approval/escalation.

## 9. Recommended Next Action

**Action 382 - Extract Statistics Dashboard Shell**

Acceptance for Action 382 should require:

- A dedicated Statistics dashboard shell component exists.
- `app/trade-app.tsx` still owns calculations, range state, dashboard
  construction, recommendation analytics construction, JSON generation,
  persistence, and cross-tab state.
- Existing Statistics UI/text/behavior is preserved.
- All e2e tests pass.

## 10. Action 382 Result

Action 382 added `components/statistics/StatisticsDashboard.tsx`.

Extraction result:

- Extracted the Statistics dashboard shell/header, range controls, range summary,
  progress status pill, and loading empty-state wrapper.
- Kept the metric grids, recommendation analytics panels, plan-adherence
  statistics, charts, recent trades, open-position context, partial-close
  summary, and period-risk summary composed in `app/trade-app.tsx`.
- Kept `app/trade-app.tsx` responsible for calculations, selected range state,
  dashboard construction, recommendation analytics construction, JSON generation,
  persistence, and cross-tab state.

Behavior preservation:

- Preserved `Statistics`, `Progress Dashboard`, range button labels, loading
  copy, range description copy, demo/real trade counts, status pill, ordering,
  and classNames.

Next recommended action:

**Action 383 - Reassess Statistics Dashboard After Shell Extraction**

## 11. Action 383 Result

Action 383 added `docs/statistics-dashboard-post-shell-reassessment.md`.

Reassessment result:

- Confirmed the shell extraction left the Statistics body in
  `app/trade-app.tsx`, including primary metric cards, recommendation analytics,
  plan-adherence statistics, charts, recent trades, open-position context,
  partial-close accounting, and period-risk context.
- Confirmed calculations, range state, PnL/result logic, profit-factor/win-rate
  logic, plan-adherence logic, filtering, persistence, and cross-tab integration
  remain parent-owned.
- Identified repeated metric-card rendering as the safest next low-risk
  boundary.

Next recommended action:

**Action 384 - Extract Statistics Metric Card Presentational Component**

## 12. Action 384 Result

Action 384 added `components/statistics/StatisticsMetricCard.tsx`.

Result:

- Extracted reusable metric card rendering and tone styling.
- Kept `SummaryCard` in `app/trade-app.tsx` as a thin compatibility wrapper so
  existing metric-card call sites continue to pass already-computed display
  values.
- Kept all calculations, range state, PnL/result logic, profit-factor/win-rate
  logic, plan-adherence logic, filtering, persistence, and dashboard panels
  parent-owned.

Next recommended action:

**Action 385 - Reassess Statistics Dashboard After Metric Card Extraction**

## 13. Action 385 Result

Action 385 added `docs/statistics-dashboard-post-metric-card-reassessment.md`.

Result:

- Reassessed the Statistics dashboard after extracting the metric card.
- Confirmed `SummaryCard` remains as a local compatibility wrapper and
  widespread metric-card call sites still pass already-computed display values.
- Identified a children-based Statistics summary grid as the safest next
  presentational boundary.

Next recommended action:

**Action 386 - Extract Statistics Summary Grid**

## 14. Action 386 Result

Action 386 added `components/statistics/StatisticsSummaryGrid.tsx`.

Result:

- Extracted a presentational summary grid wrapper with the current five-column
  and six-column variants.
- Replaced only Statistics-related grid wrappers while leaving `SummaryCard`
  children and all display values in `app/trade-app.tsx`.
- Kept calculations, range state, PnL/result logic, profit-factor/win-rate
  logic, plan-adherence logic, filtering, persistence, and dashboard body
  derivation parent-owned.

Next recommended action:

**Action 387 - Reassess Statistics Dashboard After Summary Grid Extraction**

## 15. Action 387 Result

Action 387 added `docs/statistics-dashboard-post-summary-grid-reassessment.md`.

Result:

- Confirmed the Statistics shell, metric card, and summary grid are extracted.
- Confirmed remaining Statistics panels have higher coupling to calculations,
  hidden analytics readbacks, chart derivation, or app-wide accounting context.
- Concluded Statistics extraction should pause.

Next recommended action:

**Action 388 - Reassess trade-app.tsx After Major UI Extraction Work**

## 16. Action 388 Result

Action 388 added `docs/trade-app-post-major-ui-extraction-reassessment.md`.

Result:

- Confirmed Statistics extraction is complete enough to pause after extracting
  the shell, metric card, and summary grid.
- Remaining Statistics responsibilities in `app/trade-app.tsx` are
  calculation-adjacent: dashboard builders, PnL/R, profit factor, plan
  adherence, recommendation analytics, charts, persistence, and cross-tab
  integration.
- Recommended app-wide state/effects extraction planning next.

Next recommended action:

**Action 389 - Create App State/Effects Extraction Plan**

## 17. Action 389 Result

Action 389 added `docs/app-state-effects-extraction-plan.md`.

Result:

- Planned the next phase after Statistics extraction pause: app-wide
  state/effects boundaries.
- Confirmed Statistics range state may be a later small hook candidate, but all
  Statistics calculations, formatted values, PnL/result logic, profit-factor
  logic, plan-adherence logic, filtering, persistence, and cross-tab data
  integration must remain parent-owned for now.
- Recommended reassessing navigation/tab state first before moving any hooks.

Next recommended action:

**Action 390 - Reassess Navigation/Tab State Hook Boundary**

## 18. Action 393 Result

Action 393 added `docs/statistics-range-state-hook-boundary-reassessment.md`.

Result:

- Reassessed the Statistics range state boundary.
- Confirmed range option labels and dashboard rendering should remain in the
  existing Statistics components.
- Confirmed all metric calculations, recommendation analytics builders,
  filtering/time-range logic, persistence, and cross-tab data construction
  should remain in `app/trade-app.tsx`.
- Recommended extracting only the selected range state and setter.

Next recommended action:

**Action 394 - Extract Statistics Range State Hook**

## 19. Action 394 Result

Action 394 added `hooks/trade-app/useStatisticsRangeState.ts`.

Result:

- Extracted only the selected Statistics range state and setter.
- Kept `statisticsTimeRangeOptions`, range labels/descriptions, dashboard
  rendering, calculations, recommendation analytics, persistence, and cross-tab
  data construction unchanged in the parent/component boundary.

Next recommended action:

**Action 395 - Reassess Statistics Range State Hook Extraction**
