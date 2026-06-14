# Statistics Dashboard Post-Summary Grid Reassessment

## 1. Purpose

Reassess the Statistics/Dashboard area after Action 386 extracted
`components/statistics/StatisticsSummaryGrid.tsx`.

The goal is to decide whether Statistics extraction should continue into body
panels/display mappers or pause so the project can reassess `app/trade-app.tsx`
after the major UI extraction work across Execution Handoff, Recommendations,
Live Day Trades, History, and Statistics.

## 2. Current Statistics Component Inventory

Extracted Statistics components:

- `StatisticsDashboard`: presentational shell for the Statistics heading,
  time-range controls, range summary, progress pill, loading empty state, and
  body slot.
- `StatisticsMetricCard`: presentational metric-card wrapper, value/label
  markup, classNames, and positive/negative/neutral tone styling.
- `StatisticsSummaryGrid`: presentational grid wrapper for the current
  five-column and six-column Statistics metric-grid variants.

Compatibility layer:

- `SummaryCard` remains in `app/trade-app.tsx` and delegates rendering to
  `StatisticsMetricCard`.
- Keeping it local preserves broad call sites outside the immediate Statistics
  dashboard.

Current file inventory:

- `app/trade-app.tsx`: approximately 39,692 lines.
- `components/statistics/StatisticsDashboard.tsx`: approximately 101 lines.
- `components/statistics/StatisticsMetricCard.tsx`: approximately 29 lines.
- `components/statistics/StatisticsSummaryGrid.tsx`: approximately 27 lines.

Remaining inline body panels in `app/trade-app.tsx`:

- `StatisticsDashboardPanel` body composition.
- progress summary card and `View Full History` action.
- recommendation analytics shell and `Review History` action.
- recommendation learning, batch learning, outcome learning, performance, tier,
  batch, data quality, calibration readiness, and improvement backlog panels.
- `PlanAdherenceStatisticsSummary` and `PlanAdherenceBreakdown`.
- `StatisticsChartPanel` plus chart/list components for cumulative PnL,
  cumulative R, daily PnL, daily R, trade count, outcome breakdown, and setup
  performance.
- recent closed trades context.
- open-position context.
- partial-close accounting.
- period-risk context.

Parent-owned calculations and state:

- `selectedStatisticsRange` and range filtering.
- `buildStatisticsDashboard(...)` and `buildHistoryDashboard(...)`.
- PnL, R, win/loss, profit factor, expectancy, hold-time, and trade-frequency
  derivation.
- recommendation performance/tier/batch/sample/calibration/backlog builders and
  JSON readbacks.
- plan-adherence aggregation and display row derivation.
- localStorage/Supabase-backed data loading, refresh flows, and cross-tab
  integration.

## 3. Remaining Statistics Responsibilities in trade-app.tsx

Metric calculations:

- All metric calculations remain parent-owned and should continue to do so.
- The extracted card and grid components receive only rendered children or
  already-computed display values.

Formatted display values:

- Formatting helpers remain in `app/trade-app.tsx`.
- Existing `SummaryCard` call sites still pass formatted strings and optional
  numeric tone values.

PnL/result derivation:

- Realized PnL, total R, average R, expectancy, average winner/loser, best/worst
  trade, daily PnL, and cumulative chart data remain derived before render.

Profit factor/win-rate derivation:

- Null/infinite profit factor handling remains in
  `formatStatisticsProfitFactor(...)`.
- Win-rate formatting remains with existing percent helpers.

Recommendation analytics derivation:

- Recommendation performance, tier, batch, sample quality, calibration, learning
  insights, and backlog calculations remain parent-owned.
- Hidden JSON readbacks and `data-*` attributes remain inside the existing
  analytics panels.

Plan-adherence/statistics derivation:

- `PlanAdherenceStatisticsSummary` still creates status and grade row arrays
  from `dashboard.planAdherenceSummary`.
- Warning truncation and plan-adherence copy remain inline.

Time-range/filter state:

- Range controls render in `StatisticsDashboard`, but range state and filtering
  remain parent-owned.

Persistence/localStorage/Supabase behavior:

- No persistence behavior has moved into Statistics components.

Cross-tab data integration:

- Statistics still integrates History, Live Day Trades, Recommendations, Market
  diagnostics, scan logs, and stored recommendation outcomes in
  `app/trade-app.tsx`.

## 4. Extraction Completeness Assessment

Statistics extraction is complete enough to pause.

Safe/low-risk work already completed:

- shell extraction.
- metric-card rendering extraction.
- summary-grid wrapper extraction.

Remaining panels are no longer simple wrappers:

- `PlanAdherenceStatisticsSummary` is display-heavy but still locally derives
  status/grade rows, warning truncation, and process-quality copy.
- recommendation analytics panels contain hidden JSON contracts, `data-*`
  attributes, detail disclosures, and analytics-specific tables.
- chart components derive SVG coordinates, bar heights, and labels from data
  series.
- recent/open/partial/risk panels encode accounting and risk-context copy.

Further Statistics extraction now has lower payoff and higher risk than a
broader reassessment:

- extracting plan-adherence or recommendation analytics would require larger
  prop surfaces or display mappers.
- extracting charts risks mixing display movement with coordinate derivation.
- extracting all body wrappers would reduce some JSX, but would not clarify the
  remaining app-wide state ownership.

The next safer step is to reassess the full `app/trade-app.tsx` file after the
major UI-area extraction work.

## 5. Candidate Next Refactor Targets

A. Extract Plan-Adherence Statistics Panel:

- Medium payoff.
- Higher risk because row derivation, warnings, and plan-adherence semantics are
  still local.
- Better deferred until a focused plan exists.

B. Extract Recommendation Analytics Statistics Panel:

- High payoff but high risk.
- Hidden JSON readbacks, `data-*` contracts, detailed analytics tables, and
  broad summary props make this too large for the next step.

C. Extract Statistics body section wrappers:

- Low-to-medium payoff.
- Could preserve behavior if limited to wrappers, but would likely create broad
  prop drilling without addressing app-wide state boundaries.

D. Extract Statistics display mapper:

- Useful before extracting plan-adherence or PnL/result panels.
- Not needed immediately because completed extractions already avoided moving
  calculations by passing children/formatted values.

E. Reassess full `trade-app.tsx` after major UI extraction work:

- Highest near-term value.
- The app has now paused/decomposed Execution Handoff, Recommendations, Live Day
  Trades, History, and Statistics.
- A current inventory can identify whether the next phase should target
  app-wide state hooks, diagnostics/settings, remaining tabs, or shared utility
  cleanup.

## 6. Recommended Next Action

Recommended next action:

**Action 388 — Reassess trade-app.tsx After Major UI Extraction Work**

## Action 393 Result

Action 393 added `docs/statistics-range-state-hook-boundary-reassessment.md`.

Result:

- Confirmed the next Statistics-related state hook can be limited to
  `selectedStatisticsRange` and its setter.
- Kept Statistics calculations, option labels, dashboard rendering, and
  recommendation analytics parent-owned.
- Recommended Action 394: extract the tiny Statistics range state hook.

Next recommended action:

**Action 394 - Extract Statistics Range State Hook**

Why:

- Statistics has reached a good pause point after shell, metric-card, and grid
  extraction.
- Remaining Statistics panels are calculation-adjacent and should not be moved
  without a more focused plan.
- A full reassessment can rank the next high-payoff area based on the current
  file shape rather than continuing local extraction by momentum.

## 7. Risk Assessment

Metric drift:

- Low for completed extractions because values remain formatted in parent.
- Higher if future panels start building values from raw dashboard objects.

PnL/profit-factor correctness risk:

- PnL, R, and profit-factor formatting must remain untouched unless a dedicated
  display-mapper action is planned.

Recommendation analytics risk:

- Hidden JSON IDs, `data-*` attributes, and analytics table rows are likely
  agent-readable and e2e-sensitive.
- Do not move broad analytics panels casually.

Plan-adherence/statistics risk:

- Plan-adherence row construction and warning truncation remain local.
- Moving this panel next would need a focused acceptance plan.

Time-range/filter behavior risk:

- Range controls are extracted, but range state remains parent-owned.
- Do not move filtering or selected range behavior.

Lost e2e selectors/text:

- Preserve `Progress Dashboard`, `Recommendation Engine Analytics`, `Plan
  Adherence`, chart titles, hidden JSON IDs, and details labels.

Prop drilling:

- Remaining Statistics panels would require broad props.
- A full `trade-app.tsx` reassessment can determine whether container boundaries
  or state hooks should come before more panel extraction.

Design/className drift:

- Existing card and grid classes are now extracted.
- Future panel extraction must preserve wrapper and chart classes exactly.

Persistence/statistics safety:

- Persistence, localStorage, Supabase, refresh flows, execution, and trade
  mutation behavior remain out of scope for further Statistics display work.

## 8. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 388 Result

Action 388 added `docs/trade-app-post-major-ui-extraction-reassessment.md`.

Result:

- Reassessed `app/trade-app.tsx` after the major UI extraction pass across
  Execution Handoff, Recommendations, Live Day Trades, History, and Statistics.
- Confirmed each major UI area is complete enough to pause.
- Identified app-wide state/effects/localStorage as the next highest-value
  strategic phase.

Next recommended action:

**Action 389 - Create App State/Effects Extraction Plan**
