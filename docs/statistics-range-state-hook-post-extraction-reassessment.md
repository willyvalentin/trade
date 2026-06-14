# Statistics Range State Hook Post-Extraction Reassessment

## 1. Purpose

Reassess the Statistics range state hook extraction after Action 394.

Action 394 extracted `useStatisticsRangeState` and moved only the selected
Statistics range state out of `app/trade-app.tsx`. This document verifies that
the hook boundary stayed narrow and recommends the next safe state/effects
boundary to reassess.

## 2. Current Range Hook Inventory

Hook file:

- `hooks/trade-app/useStatisticsRangeState.ts`

Exported API:

- `useStatisticsRangeState()`

Hook return shape:

- `selectedStatisticsRange`
- `setSelectedStatisticsRange`

Default state:

- `"today"`

Type ownership:

- the hook imports `StatisticsTimeRange` from `lib/statistics-dashboard`.
- `app/trade-app.tsx` still imports `StatisticsTimeRange` for panel prop types
  and local Statistics rendering.

Call site in `app/trade-app.tsx`:

- `const { selectedStatisticsRange, setSelectedStatisticsRange } =
  useStatisticsRangeState();`
- the hook call replaced the previous inline
  `useState<StatisticsTimeRange>("today")` in the same top-level state area.

Remaining parent-owned range options/rendering/calculations:

- `statisticsTimeRangeOptions` remains imported from `lib/statistics-dashboard`.
- `StatisticsDashboardPanel` still receives `selectedRange` and
  `onRangeChange`.
- `StatisticsDashboard` still renders the visible range buttons, labels,
  active styling, range label, and range description.
- `app/trade-app.tsx` still owns all range-driven builder calls and data inputs.

## 3. Behavior Preservation Check

Default range:

- preserved as `"today"` in the hook.

Range switching:

- existing `setSelectedStatisticsRange` call shape is preserved.
- `StatisticsDashboardPanel` still passes the setter to the Statistics shell as
  `onRangeChange`.
- `StatisticsDashboard` still calls `onRangeChange(option.value)`.

Metric calculations:

- remained in `app/trade-app.tsx`.
- `selectedStatisticsRange` still feeds `buildStatisticsDashboard`.
- recommendation scan-run history, recommendation performance, tier
  performance, batch performance, sample quality, confidence readiness, and
  improvement backlog builders still receive the range in the parent.

Dashboard visible values:

- range-driven visible values are still produced by the existing dashboard and
  recommendation analytics builders.
- no formatting, label, or calculation helper moved with the hook.

E2E-visible labels:

- range option labels remain in `statisticsTimeRangeOptions`:
  - `Today`
  - `This week`
  - `This month`
  - `Last trading week`
  - `Last 7 days`
  - `Last 30 days`
  - `All`
- Statistics shell copy, button markup, and active range styling are unchanged.

Effects/persistence:

- no `useEffect` moved.
- no localStorage behavior moved or added.
- no URL/hash/router behavior moved or added.
- no Supabase behavior moved.

Execution/handoff:

- no execution modal state moved.
- no orchestrator calls moved.
- no handoff or Avanza behavior changed.

## 4. Lessons For Future Hook Extraction

Hook size:

- like navigation state, the safest state hook stayed tiny: one `useState` and
  one returned setter.
- this pattern is working for UI state that has no effects of its own.

Type ownership:

- importing the domain type from the existing pure module avoided duplicating
  the range union.
- future hooks should prefer importing existing stable types rather than moving
  broad app-only types.

Avoiding calculation movement:

- this extraction worked because range ownership moved without moving any
  range-consuming builders.
- future calculation-adjacent state hooks should keep calculation and display
  derivation parent-owned until a separate boundary exists.

Avoiding effect movement:

- no effects moved with the state.
- this is still the safest pattern for the state/effects extraction phase.

Testing expectations:

- runtime hook extractions should continue running:
  - `./node_modules/.bin/tsc --noEmit`
  - `npm run lint`
  - `git diff --check`
  - `npm run test:e2e`
- if Playwright cannot bind its local server in the sandbox, rerun the e2e
  command with the scoped escalation and document the port-bind reason.

## 5. Candidate Next State/Effects Targets

A. Modal UI state boundary:

- highest-value next reassessment target, but not obviously safe to extract yet.
- selected recommendation, selected position, add-trade form inputs,
  close-position form inputs, validation state, saving state, and mutation
  handlers are intertwined.
- should be reassessed before any runtime movement.

B. Recommendation UI-only state boundary:

- potential future target for filter-like UI state.
- currently close to recommendation history filters, diagnostics, ADD TRADE
  validation, discard persistence, and handoff entry points.

C. History UI-only state boundary:

- potential future target for History filters.
- still calculation-adjacent because filters feed History dashboard, closed
  trade card display, plan-vs-actual review, and audit/timeline context.

D. Persistence/localStorage effects later:

- high risk.
- should wait for a dedicated persistence boundary plan.

E. Execution/handoff/orchestrator state much later:

- very high risk and safety-sensitive.
- should remain parent/modal-owned until execution record and persistence
  boundaries are clearer.

## 6. Recommended Next Action

Recommended next action:

**Action 396 - Reassess Modal UI State Hook Boundary**

## Action 396 Result

Action 396 added `docs/modal-ui-state-hook-boundary-reassessment.md`.

Result:

- Inventoried app-owned and local modal state clusters.
- Confirmed Recommendation details/discard modal state is already local.
- Confirmed app-owned ADD TRADE and close-position modal state is behavior-
  coupled to selected entities, validation, form defaults, persistence, and
  trade mutations.
- Confirmed execution/close modal internals are safety-sensitive and should
  remain owned where they are.
- Recommended pivoting to Recommendation UI-only state boundary reassessment.

Next recommended action:

**Action 397 - Reassess Recommendation UI State Hook Boundary**

Why:

- it is the next visible app-shell state cluster after the two tiny UI-state
  hooks.
- it has meaningful payoff if a small isolated subset exists.
- it is coupled enough that the next step should be documentation-only
  reassessment, not extraction.

## 7. Risk Assessment

Hook order risk:

- low for the completed Statistics range hook.
- higher for modal state because selected modal/form state sits among many
  app-wide state values.

Stale closure risk:

- low for the completed range hook because no callbacks were wrapped.
- high for modal state if handlers or validation callbacks are moved.

Calculation drift risk:

- range calculation drift was avoided by keeping all builders parent-owned.
- future modal state work should similarly avoid moving risk sizing,
  validation, PnL, or close calculations.

Default value risk:

- `"today"` remained unchanged.
- future modal defaults, especially form fields and validation status, have
  higher behavior risk.

E2E reliance:

- Statistics range labels and dashboard values stayed unchanged.
- modal state is more e2e-visible because it affects dialog open/close,
  validation copy, button disabled state, and form defaults.

Future state extraction risk:

- the next easy state-only boundary is less obvious.
- modal, Recommendation, History, persistence, and execution state all need
  reassessment before movement.

## 8. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.
