# Statistics Dashboard Post-Shell Reassessment

## 1. Purpose

Reassess the Statistics/Dashboard area after Action 382 extracted
`components/statistics/StatisticsDashboard.tsx`.

The goal is to identify the safest next runtime extraction for metric cards and
dashboard panels without moving statistics calculations, PnL/result logic,
profit-factor/win-rate logic, plan-adherence logic, time-range filtering,
persistence, or cross-tab behavior.

## 2. Current Statistics/Dashboard Inventory

Current file inventory:

- `app/trade-app.tsx`: approximately 39,706 lines.
- `components/statistics/StatisticsDashboard.tsx`: approximately 101 lines.
- `StatisticsDashboardPanel`: still lives in `app/trade-app.tsx` around the
  17.4k line range and now delegates the outer shell to
  `StatisticsDashboardShell`.

Major visual sections still composed in `app/trade-app.tsx`:

- progress summary card with `View Full History`.
- primary metric grid for realized PnL, total R, win rate, trades, average R,
  profit factor, expectancy, winners/losers/breakeven, average winner/loser,
  best/worst trade, max daily gain/loss, average hold, and trades/day.
- recommendation engine analytics summary with `Review History`.
- recommendation learning insight panels.
- recommendation performance, tier performance, batch performance, data
  quality, calibration readiness, and improvement backlog details.
- plan-adherence statistics panel.
- chart panels for cumulative PnL, cumulative R, daily PnL, daily R, trade
  count, outcome breakdown, and setup type performance.
- recent closed trades statistics context.
- open positions statistics context.
- partial close accounting.
- period risk controls context.

Metric card groups:

- primary performance cards rendered as repeated `SummaryCard` calls inside the
  dashboard body.
- recommendation analytics headline cards, also rendered as `SummaryCard`
  calls.
- plan-adherence headline cards inside `PlanAdherenceStatisticsSummary`.
- legacy History/statistics summary cards in `PerformanceSummaryCards`.

PnL/result panels:

- primary realized PnL, total R, average R, expectancy, average winner/loser,
  best/worst trade, max daily gain/loss, and daily chart surfaces.
- recent closed trade rows showing PnL and R.
- partial-close and period-risk panels exposing realized PnL from exits and
  today/week totals.

Win/loss/profit-factor panels:

- primary win rate, winners, losers, breakeven, and profit factor cards.
- recommendation performance panels with entry, target, stop, best/worst R, and
  EOD R rates.
- setup type performance and outcome breakdown panels.

Plan-adherence panels:

- `PlanAdherenceStatisticsSummary` remains inline in `app/trade-app.tsx`.
- It derives display rows locally from `dashboard.planAdherenceSummary`.
- It renders status breakdown, grade breakdown, detail rows, and warning notes.

Execution/audit metrics panels:

- Recommendation engine analytics expose hidden JSON readbacks and details
  sections for performance, tier, batch, sample quality, calibration readiness,
  and improvement backlog.
- These panels are observational and sensitive to existing hidden IDs and
  `data-*` attributes.

Filters/time-range controls:

- The visible range controls moved into `StatisticsDashboard`.
- `selectedStatisticsRange`, `statisticsTimeRangeOptions`, and
  `setSelectedStatisticsRange` remain parent-owned.

State, handler, and calculation dependencies:

- `buildStatisticsDashboard(...)` and `buildHistoryDashboard(...)` remain in
  parent data construction.
- recommendation performance, tier, batch, learning, sample quality,
  calibration, and backlog builders remain parent-owned.
- the dashboard body receives already-built summary objects and JSON strings.
- `onViewHistory` remains parent-owned and is passed through to dashboard body
  buttons.
- persistence, localStorage, Supabase-backed reads, island refresh state, and
  app-wide effects remain outside the extracted shell.

## 3. Coupling Analysis

Metric calculation coupling:

- The primary grid renders values from `dashboard.metrics`.
- The safe boundary is rendering-only; recalculating card values in a component
  would risk changing decimal, fallback, and tone behavior.

PnL/result correctness coupling:

- Realized PnL, total R, average R, expectancy, average winner/loser, best/worst
  trade, max daily gain/loss, and daily chart values come from
  `buildStatisticsDashboard(...)`.
- These must remain calculated before any presentational component receives
  them.

Profit-factor/win-rate coupling:

- Profit factor has special infinite/null formatting through
  `formatStatisticsProfitFactor(...)`.
- Win rate uses existing percent formatting.
- A card extraction can preserve behavior by passing formatted strings and tone
  values instead of raw calculation inputs.

Plan-adherence/statistics coupling:

- Plan adherence is already aggregated inside the dashboard object.
- The inline plan-adherence panel also builds status/grade display rows.
- Moving the full panel is possible later, but the first next step should avoid
  plan-specific row construction and warning truncation.

History/live/recommendation data dependency:

- Statistics combines closed trade history, open-position context,
  recommendation snapshots/outcomes, scan logs, and diagnostics.
- The next extraction should not move dashboard construction or source-scope
  decisions.

Time-range/filtering coupling:

- Range UI is extracted, but state and filtering are parent-owned.
- Any metric-panel extraction should receive already-selected range data and not
  own range changes.

Persistence/localStorage/Supabase coupling:

- Dashboard values depend on app-wide loaded data and stored recommendation
  outcomes.
- No persistence reads/writes should move into metric components.

E2E-visible text/design coupling:

- Existing labels such as `Realized PnL`, `Profit Factor`, `Plan Adherence`,
  `Recommendation Engine Analytics`, `Cumulative PnL`, and hidden JSON IDs must
  remain stable.
- `SummaryCard` classNames and repeated grid structures are the safest first
  presentational target because they centralize design without changing data.

## 4. Candidate Component Boundaries

`StatisticsMetricCard`:

- A small presentational replacement or extraction of the existing `SummaryCard`
  shape.
- Safest boundary if parent passes `label`, formatted `value`, and optional
  numeric `tone`.
- Needs care because `SummaryCard` is shared outside the Statistics tab.

`StatisticsSummaryGrid`:

- A presentational grid that receives already-built metric card props.
- Higher payoff than a single card, but should wait until card props are stable.

`PnLSummaryPanel`:

- Could wrap the primary realized PnL/R/expectancy/average/best/worst cards.
- More coupled to metric formatting and should follow a reusable card
  extraction.

`ProfitFactorPanel`:

- Low visual complexity but calculation-sensitive because of infinite/null
  formatting.
- Better represented as a metric card prop, not a standalone panel yet.

`WinRatePanel`:

- Low visual complexity, but currently part of the primary grid and several
  analytics panels.
- Also better handled through a reusable metric card first.

`PlanAdherenceSummaryPanel`:

- Good future target after the basic metric card/grid extraction.
- It currently owns row arrays, status/grade breakdown bars, warning truncation,
  and plan-specific copy.

`ExecutionAuditMetricsPanel`:

- Recommendation analytics details and hidden JSON readbacks are broad and
  sensitive.
- Leave these in `app/trade-app.tsx` until simpler dashboard surfaces are
  extracted.

`StatisticsTimeRangeControls`:

- Already covered by the Action 382 shell extraction.
- No additional extraction needed unless the shell is split later.

`StatisticsEmptyState`:

- Already uses the shared `EmptyState`.
- Low payoff to extract separately now.

## 5. What Should Remain in trade-app.tsx Initially

Keep these parent-owned for the next runtime step:

- statistics input data construction.
- all metric calculations.
- PnL/result calculations.
- profit-factor and win-rate calculations.
- plan-adherence calculations and aggregation.
- time-range/filter logic.
- recommendation analytics construction.
- hidden JSON readback generation.
- persistence/localStorage/Supabase behavior.
- island refresh and cross-tab integration.
- History, Live Day Trades, Recommendations, and Market integration.

The next component should receive already-formatted display values where
possible and must not call builders or mutate state.

## 6. Recommended Next Action

Recommended next runtime refactor:

**Action 384 - Extract Statistics Metric Card Presentational Component**

Why this is the safest next step:

- Metric cards are repeated across the Statistics body and adjacent statistics
  surfaces.
- The card boundary is purely presentational when passed `label`, `value`, and
  optional `tone`.
- It does not require moving calculation logic, range state, recommendation
  analytics builders, chart logic, hidden JSON readbacks, or persistence.
- It creates a stable foundation before extracting larger grids or panels.

Implementation guidance for Action 384:

- Create a dedicated presentational metric card component under
  `components/statistics/`.
- Preserve the existing `SummaryCard` DOM, classNames, tone behavior, labels, and
  value typography exactly.
- Replace only statistics-related usages if shared global replacement is too
  risky.
- Keep calculations and formatted values in `app/trade-app.tsx`.
- Avoid moving `PlanAdherenceStatisticsSummary`, chart panels, or recommendation
  analytics panels in the same action.

## 7. Risk Assessment

Metric drift:

- Low if Action 384 only moves card rendering and receives existing formatted
  strings.
- Higher if it starts deriving values from raw dashboard objects.

PnL/profit-factor correctness risk:

- Profit factor and PnL formatting must stay with existing helpers.
- The new card should not know how to calculate these values.

Plan-adherence/statistics risk:

- Plan adherence remains too broad for the immediate next step.
- Extracting it before the shared metric-card boundary would mix display
  extraction with plan-specific row derivation.

Time-range/filter behavior risk:

- Time-range controls are already in the shell.
- Further metric extractions must not touch range state or filtering.

Lost e2e selectors/text:

- Existing labels and hidden JSON IDs are likely e2e-visible or agent-readable.
- Preserve label text, ordering, and classNames.

Prop drilling:

- A metric card adds minimal prop surface.
- A summary grid or panel would require more props and should follow after the
  card boundary is stable.

Design/className drift:

- The existing card styling is compact and reused.
- Action 384 should copy the exact classes before considering any design cleanup.

Persistence/statistics safety:

- No persistence, Supabase, localStorage, or dashboard-builder logic should move.

## 8. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 384 Result

Action 384 added `components/statistics/StatisticsMetricCard.tsx`.

Extraction result:

- Moved the reusable metric card DOM, classNames, value typography, and numeric
  tone styling out of `app/trade-app.tsx`.
- Kept the local `SummaryCard` function in `app/trade-app.tsx` as a
  compatibility wrapper around `StatisticsMetricCard`, preserving the existing
  call sites and prop shape.
- Left all formatted values, metric calculations, PnL/result logic, profit
  factor/win-rate logic, plan-adherence logic, time-range state, persistence,
  and dashboard body composition parent-owned.

Behavior preservation:

- Preserved visible labels, values, classNames, value tone behavior, card
  ordering, and all existing call-site formatting.

What remained inline:

- `StatisticsDashboardPanel`, the primary metric grid, recommendation analytics,
  plan-adherence summary, chart panels, recent/open context, partial-close
  summary, and period-risk panels remain in `app/trade-app.tsx`.
- This avoids moving calculations, hidden JSON readbacks, chart coordinate
  generation, or broad panel props in the same action.

Next recommended action:

**Action 385 - Reassess Statistics Dashboard After Metric Card Extraction**

## 10. Action 385 Result

Action 385 added `docs/statistics-dashboard-post-metric-card-reassessment.md`.

Reassessment result:

- Confirmed `StatisticsDashboard` and `StatisticsMetricCard` are extracted.
- Confirmed `SummaryCard` remains in `app/trade-app.tsx` as a compatibility
  wrapper around `StatisticsMetricCard`.
- Confirmed the primary metric grid, recommendation analytics grids,
  plan-adherence summary, chart panels, recent/open context, partial-close
  summary, and period-risk summary remain in `app/trade-app.tsx`.
- Confirmed all calculations, formatted values, time-range state, filtering,
  persistence, and cross-tab integration remain parent-owned.

Next recommended action:

**Action 386 - Extract Statistics Summary Grid**

## 11. Action 386 Result

Action 386 added `components/statistics/StatisticsSummaryGrid.tsx`.

Result:

- Extracted the reusable Statistics summary grid wrapper.
- `app/trade-app.tsx` now uses it for the primary Statistics metrics,
  recommendation analytics headline metrics, and plan-adherence headline
  metrics.
- All card labels, formatted values, calculations, dashboard data derivation,
  filtering, persistence, and panel composition remain parent-owned.

Next recommended action:

**Action 387 - Reassess Statistics Dashboard After Summary Grid Extraction**

## 12. Action 387 Result

Action 387 added `docs/statistics-dashboard-post-summary-grid-reassessment.md`.

Result:

- Reassessed the Statistics dashboard after summary-grid extraction.
- Confirmed shell, metric card, and grid extraction are complete enough for the
  current Statistics phase.
- Recommended pausing Statistics before moving calculation-adjacent body panels.

Next recommended action:

**Action 388 - Reassess trade-app.tsx After Major UI Extraction Work**
