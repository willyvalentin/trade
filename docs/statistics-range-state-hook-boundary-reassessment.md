# Statistics Range State Hook Boundary Reassessment

## 1. Purpose

Reassess Statistics range/filter state as the next possible state hook
extraction after the clean navigation hook extraction.

The goal is to decide whether `selectedStatisticsRange` can move into a small
hook without moving metric calculations, time-range filtering logic, rendering,
persistence, or cross-tab behavior.

## 2. Current Range/Filter State Inventory

State variables:

- `selectedStatisticsRange`
  - type: `StatisticsTimeRange`
  - default: `"today"`

Setter/handler:

- `setSelectedStatisticsRange`
  - passed to `StatisticsDashboardPanel` as `onRangeChange`.
  - passed through to the extracted `StatisticsDashboard` shell.
  - invoked by range option buttons inside `components/statistics/StatisticsDashboard.tsx`.

Constants/options:

- `StatisticsTimeRange` is defined in `lib/statistics-dashboard.ts`.
- `statisticsTimeRangeOptions` is defined in `lib/statistics-dashboard.ts`.
- current visible option labels:
  - `Today`
  - `This week`
  - `This month`
  - `Last trading week`
  - `Last 7 days`
  - `Last 30 days`
  - `All`

Derived flags/labels:

- no derived range booleans are stored in `app/trade-app.tsx`.
- `rangeLabel` and `rangeDescription` are derived by
  `buildStatisticsDashboard` in `lib/statistics-dashboard.ts`, not by the state
  holder.
- active range styling is rendered in `StatisticsDashboard` by comparing
  `selectedRange === option.value`.

Calculation dependencies:

- `buildStatisticsDashboard` consumes `selectedStatisticsRange`.
- `buildRecommendationScanRunHistorySummary` consumes `selectedStatisticsRange`.
- `buildRecommendationPerformanceStatistics` consumes
  `selectedStatisticsRange`.
- `buildRecommendationTierPerformanceSummary` consumes
  `selectedStatisticsRange`.
- `buildRecommendationBatchPerformanceSummary` consumes
  `selectedStatisticsRange`.
- `buildRecommendationSampleQualitySummary` consumes
  `selectedStatisticsRange`.
- `buildConfidenceCalibrationReadinessSummary` consumes
  `selectedStatisticsRange`.
- `buildRecommendationEngineImprovementBacklog` consumes
  `selectedStatisticsRange`.

Rendering dependencies:

- `StatisticsDashboardPanel` receives `selectedRange` and `onRangeChange`.
- `StatisticsDashboard` renders the range option buttons, active styling,
  `rangeLabel`, and `rangeDescription`.
- current range labels and values are e2e-visible in the Statistics dashboard.

localStorage/URL coupling:

- no localStorage, URL, hash, router, or search-param coupling was found for
  `selectedStatisticsRange`.
- the current range resets to `"today"` on app reload.

## 3. Coupling Analysis

Range state is isolated as state:

- it is one `useState` call.
- the setter is passed as a direct callback.
- there are no local persistence effects.
- there are no URL/hash effects.
- there are no custom handlers around range changes.

Changing range does not trigger effects directly:

- no `useEffect` depends on `selectedStatisticsRange`.
- range changes re-render calculation builders because they consume the value.

Range affects metric calculations:

- this is the key risk.
- range changes affect Statistics dashboard metrics, series, progress summary,
  period risk, recommendation performance, tier performance, batch performance,
  sample quality, confidence readiness, and improvement backlog.
- extracting the state hook must not move these builders or alter their inputs.

Range affects cross-tab data:

- it does not mutate History/Live/Recommendations data.
- it filters or scopes Statistics/recommendation analytics derived from History
  and recommendation readback data.
- those data construction and calculation paths must remain parent-owned.

Range does not affect persistence:

- no Supabase read/write behavior depends on the setter.
- no localStorage persistence is tied to the selected range.
- no recommendation outcome persistence effect depends on the range.

E2E label/value risk:

- option labels and active styling are visible in the dashboard.
- `statisticsTimeRangeOptions` and `StatisticsDashboard` rendering should remain
  unchanged in the first hook extraction.

## 4. Proposed Hook Boundary

Recommended file:

- `hooks/trade-app/useStatisticsRangeState.ts`

Safe hook responsibilities:

- own `selectedStatisticsRange`.
- initialize to `"today"`.
- expose `selectedStatisticsRange`.
- expose `setSelectedStatisticsRange`.

Do not include in the first hook:

- `statisticsTimeRangeOptions`.
- range label/description derivation.
- `buildStatisticsDashboard`.
- recommendation performance builders.
- time-range filtering logic.
- dashboard rendering.
- persistence/localStorage/Supabase behavior.
- History/Live/Recommendations data construction.
- execution/handoff state.

The lowest-risk Action 394 implementation is:

- create `useStatisticsRangeState`.
- replace `useState<StatisticsTimeRange>("today")` with the hook in the same
  top-level state area.
- keep `StatisticsTimeRange` imported in `app/trade-app.tsx` unless moving the
  type import into the hook is mechanically cleaner.
- keep all range-consuming builders parent-owned.

## 5. What Should Remain In trade-app.tsx

- actual metric calculations.
- `buildStatisticsDashboard` input construction.
- recommendation performance and scan-run history builders.
- recommendation sample quality, confidence readiness, and backlog builders.
- Statistics dashboard rendering/composition.
- `statisticsTimeRangeOptions`.
- History/Live/Recommendations data construction.
- persistence/localStorage/Supabase effects.
- execution/handoff state.
- e2e-visible range labels and button rendering.

## 6. Risk Assessment

Hook order risk:

- low if Action 394 replaces one `useState` call with one custom hook call in
  the same top-level state area.

Stale closure risk:

- low if the hook only returns state and setter.
- avoid wrapping the setter in a custom callback during the first extraction.

Calculation drift risk:

- medium because range feeds multiple calculation builders.
- mitigate by moving only state ownership and leaving every builder call intact.

E2E value/label risk:

- medium because range controls and dashboard values are visible.
- keep option labels, button rendering, active styling, and range descriptions
  unchanged.

localStorage/URL coupling risk:

- low today because none exists.
- do not add persistence or deep-linking.

Accidental default range change:

- medium impact.
- the hook must initialize to `"today"` exactly.

Cross-tab dependency risk:

- medium because range scopes recommendation analytics and Statistics views that
  use History/recommendation readback data.
- keep cross-tab data construction parent-owned.

## 7. Recommended Next Action

Recommended next action:

**Action 394 - Extract Statistics Range State Hook**

Scope:

- create `hooks/trade-app/useStatisticsRangeState.ts`.
- move only `selectedStatisticsRange` state and the setter return value.
- preserve the `"today"` default.
- keep all calculations, options, rendering, persistence, data construction,
  and execution behavior in `app/trade-app.tsx`.

## 8. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 394 Result

Action 394 added `hooks/trade-app/useStatisticsRangeState.ts`.

Result:

- Extracted only `selectedStatisticsRange` state and its setter into a tiny hook.
- Preserved the default range as `"today"`.
- Kept `StatisticsTimeRange` sourced from `lib/statistics-dashboard`.
- Kept range options, option labels, dashboard rendering, calculation builders,
  time-range filtering logic, persistence, cross-tab data construction, and
  execution/handoff behavior parent-owned.

Next recommended action:

**Action 395 - Reassess Statistics Range State Hook Extraction**
