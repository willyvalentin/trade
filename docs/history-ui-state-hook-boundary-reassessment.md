# History UI State Hook Boundary Reassessment

## 1. Purpose

Reassess History UI state as a possible state hook boundary after navigation,
Statistics range, modal UI, and Recommendation UI hook-boundary reassessments.

History has been decomposed into `HistoryTab`, `ClosedTradeDetailsModal`,
`ClosedTradePlanAdherencePanel`, `ClosedTradeAuditTimelinePanel`, and
`closed-trade-display-mapper`, but `app/trade-app.tsx` still owns History data,
filters, derived dashboard state, PnL/result derivation, plan-vs-actual review,
audit/timeline derivation, persistence, Statistics integration, and execution
audit integration.

## 2. Current History State Inventory

Parent-owned History state:

- `closedPositions`
- `historyOutcomeFilter`
- `historyDemoFilter`
- `historyPartialFilter`
- `historySortMode`

Parent-owned History handlers:

- `setHistoryOutcomeFilter`
- `setHistoryDemoFilter`
- `setHistoryPartialFilter`
- `setHistorySortMode`
- History refresh through `refreshIslands(["history_statistics"], "manual")`
- close-position submit/update flows that write closed positions.

Component/card-local state:

- `ClosedPositionCard` owns:
  - `isDetailsOpen`
  - `setIsDetailsOpen`
- `ClosedTradeDetailsModal` owns only modal wrapper close interactions:
  - Escape listener.
  - backdrop close.
  - close button.
- `ClosedTradePlanAdherencePanel` owns no state.
- `ClosedTradeAuditTimelinePanel` owns no React state; it renders a native
  `details` disclosure wrapper.
- `HistoryTab` owns no state.

Selected/expanded entities:

- there is no app-level selected closed-trade state.
- each `ClosedPositionCard` owns its own details-open boolean.
- the selected entity is implicit in the rendered card instance.

Data/filtering dependencies:

- `historyDashboard` is built in `app/trade-app.tsx` from `closedPositions` and
  the History filters/sort mode.
- `historyPositionById` maps dashboard summary ids back to closed positions.
- closed cards receive a `position` plus the corresponding
  `HistoryTradeSummary`.
- `RecommendationHistoryPanel` has separate recommendation-history filters and
  remains outside this History card boundary.

Plan-adherence and audit dependencies:

- `ClosedPositionCard` derives execution timeline, handoff replay, execution
  quality, handoff quality, improvement suggestions, outcome explanation, and
  display props.
- plan-vs-actual review and review JSON are still derived in card-level helper
  panels.
- audit child panels still compose in `app/trade-app.tsx` and read local audit
  events.

Persistence, execution, and statistics dependencies:

- `closedPositions` are loaded from Supabase/demo storage and updated by close
  flows.
- History filters feed a dashboard derived from closed positions.
- closed positions feed Statistics/Dashboard, daily session summaries, setup
  performance, recommendation learning surfaces, and execution audit views.
- audit/timeline display uses execution metadata and local trade-management
  events.

## 3. Coupling Analysis

Closed trade details modal state:

- `isDetailsOpen` is small and UI-only, but it lives inside
  `ClosedPositionCard`, which also derives PnL/result display,
  plan-vs-actual panels, audit/timeline data, and outcome explanations.
- moving only this boolean to a hook would add indirection with low payoff.
- there is no app-level selected closed trade to centralize.

Card click/keyboard behavior:

- `ClosedPositionCard` opens details through card click, `Enter`, and space.
- a hook extraction would need to preserve role, tab index, keyboard behavior,
  and event propagation exactly.
- the current local state is simple and appropriately scoped.

History filtering/sorting/grouping:

- `historyOutcomeFilter`, `historyDemoFilter`, `historyPartialFilter`, and
  `historySortMode` are UI-like state.
- however they directly feed `buildHistoryDashboard`, visible counts,
  filtered card ordering, empty states, and e2e-visible labels.
- they may be extractable later as a tiny `useHistoryFilterState` hook, but
  only after a focused boundary reassessment for History filters.

PnL/result derivation:

- result labels, PnL/R display, and outcome explanations are derived from
  `closedPositions`, `HistoryTradeSummary`, and execution metadata.
- no calculation should move with a UI-state hook.

Plan-adherence derivation:

- `ClosedTradePlanAdherencePanel` is presentational, but the review derivation
  and hidden review JSON remain card/helper-owned.
- hook extraction should not touch plan review calculation or JSON output.

Audit/timeline derivation:

- audit child panels derive timeline/replay/quality/suggestions and read local
  trade-management events.
- these are execution/audit-coupled and unsafe for UI-state hook extraction.

Statistics dependency:

- closed positions and History filters affect visible History output, while
  closed positions also feed Statistics and daily summaries.
- state movement must not alter metric inputs, filtered summaries, or card
  ordering.

localStorage/Supabase behavior:

- closed-position data comes from persistence-backed app state.
- close flows, demo storage, latest position cleanup, and Supabase sync remain
  parent-owned.

Execution/audit integration:

- History detail panels display execution metadata, handoff replay, timeline,
  broker preview, and improvement suggestions.
- these should remain in `app/trade-app.tsx` until audit/persistence
  boundaries are planned separately.

## 4. Proposed Hook Boundaries

`useHistoryUiState`

- not recommended as a broad hook.
- it would either be too small to matter if it only owned card detail-open state,
  or too risky if it also owned filters, dashboard state, selected entities, or
  audit-related data.

Potential later hook:

- `useHistoryFilterState` may be a candidate after a dedicated filter-boundary
  reassessment.
- potential responsibilities:
  - own `historyOutcomeFilter`
  - own `historyDemoFilter`
  - own `historyPartialFilter`
  - own `historySortMode`
  - expose setters.
- it must not own `buildHistoryDashboard`, filtered trades, `closedPositions`,
  PnL/result calculation, plan-adherence calculation, audit/timeline derivation,
  persistence, or Statistics integration.

Recommendation:

- do not extract History UI state in the next runtime action.
- reassess Live Day Trade UI state next, because Live Day Trades still has
  card-local UI state around details, EOD acknowledgement, execution preview,
  and close/sell flows that needs a fresh hook-boundary classification before
  any extraction.

## 5. What Should Remain In trade-app.tsx

- History data construction and filtering application.
- `closedPositions` state and setters.
- `buildHistoryDashboard` inputs and use.
- `historyPositionById`.
- PnL/result derivation.
- plan-vs-actual derivation and review JSON.
- audit/timeline derivation and local event reading.
- closed card details panel node composition.
- persistence/localStorage/Supabase behavior.
- Statistics and daily summary integration.
- execution/audit integration.
- Recommendation history data/filter construction.

## 6. Safe First Extraction Candidates

A. Tiny History UI-only hook if isolated:

- not recommended now.
- card details-open state is already local and low payoff to move.
- filter/sort state is plausible later, but should get a dedicated
  filter-boundary reassessment before runtime extraction.

B. Leave History state as-is and move to Live Day Trade UI state reassessment:

- recommended.
- Live Day Trade UI state is the next major tab-state area that has not been
  reassessed as a hook boundary.

C. Leave History state as-is and move to persistence boundary planning:

- useful later, but higher risk than another UI-state boundary reassessment.
- persistence planning should wait until small UI-state candidates are
  exhausted or clearly rejected.

## 7. Risk Assessment

Selected entity mismatch risk:

- low for app-level History state because there is no selected closed trade in
  the parent.
- medium if future extraction introduces selected closed trade state where local
  card state is currently sufficient.

Details modal behavior risk:

- medium because card click, keyboard open, Escape close, backdrop close, and
  close button behavior must remain exact.

Card click/keyboard behavior risk:

- medium/high for any full card/container extraction.
- role, tab index, `Enter`, space, and event propagation are e2e-visible.

Calculation drift risk:

- high if filter hooks move dashboard construction, PnL/R display, outcome
  explanation, or plan review logic.

Stale closure risk:

- medium around filter setters and dashboard construction.
- high around audit child panels if event reads or execution metadata derivation
  were moved.

Prop drilling risk:

- medium for a small filter hook.
- high for a broad `useHistoryUiState` hook that exposes dashboard summaries,
  selected entities, and audit-derived nodes.

E2E-visible behavior risk:

- high for filter labels, sorted card order, empty states, `View details`,
  modal close behavior, `Plan vs Actual Review`, and `Audit details`.

Persistence/statistics risk:

- high if `closedPositions`, close flows, Supabase/demo storage, Statistics
  inputs, or daily summaries move with UI state.

## 8. Recommended Next Action

Recommended next action:

**Action 399 - Reassess Live Day Trade UI State Hook Boundary**

## Action 399 Result

Action 399 added
`docs/live-day-trade-ui-state-hook-boundary-reassessment.md`.

Result:

- Reassessed Live Day Trade UI state after History UI state was found too
  coupled for extraction.
- Confirmed `ActivePositionCard` owns details-open, execution-preview-open, and
  EOD acknowledgement state.
- Confirmed details and execution preview booleans are low-payoff extraction
  targets, while EOD acknowledgement is localStorage-coupled.
- Confirmed close/sell/exit state, orchestrator output, execution preview
  wiring, active position monitoring, persistence, and trade mutation behavior
  must remain parent/card-owned.
- Recommended persistence boundary planning next.

Next recommended action:

**Action 400 - Create Persistence Boundary Plan**

Why:

- History detail state is already local enough.
- History filters are possible future candidates, but they feed dashboard
  construction and visible card ordering and deserve their own focused
  filter-state reassessment before extraction.
- Live Day Trades still has several UI-state clusters that should be classified
  before choosing the next hook boundary.

## 9. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.
