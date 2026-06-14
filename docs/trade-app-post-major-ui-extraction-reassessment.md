# trade-app Post-Major-UI-Extraction Reassessment

## 1. Purpose

Reassess `app/trade-app.tsx` after the major UI/component extraction work from
Actions 317-387.

The goal is to inventory what remains in the parent file, identify the largest
risk-heavy domains, and choose the next strategic phase based on the current
file shape rather than continuing UI extraction by momentum.

## 2. Current File Inventory

Current approximate file size:

- `app/trade-app.tsx`: approximately 39,692 lines.

Major UI areas now decomposed enough to pause:

- Execution Handoff Modal:
  - shell, composition, core summary/request previews, readiness, bridge
    controls, early/middle/late previews, QA/progress/lifecycle panels, pure
    mappers, and bridge/phase/readiness hooks are extracted.
- Recommendations:
  - tab shell, card container, card, details modal, discard modal, and display
    mappers/helpers are extracted.
- Live Day Trades:
  - tab shell, display mapper, EOD safety panel, execution status surface, card
    body, and details modal are extracted.
- History:
  - tab shell, closed trade display mapper, details modal, plan-adherence panel,
    and audit timeline wrapper are extracted.
- Statistics/Dashboard:
  - dashboard shell, metric card, and summary grid are extracted.

Remaining top-level responsibilities:

- app-wide tab state and navigation.
- Supabase-backed data loading and refresh orchestration.
- local/demo storage reads and writes.
- recommendation snapshot/scan-run/batch/outcome diagnostics.
- recommendation filtering, visibility, scoring readbacks, and diagnostics.
- live trade monitoring and auto-refresh.
- history filtering/sorting and closed trade derivation.
- statistics/dashboard calculation inputs and derived summaries.
- execution handoff/orchestrator wiring.
- buy/sell trade mutation handlers.
- audit/event derivation and local event logging.
- market diagnostics and scanner/readiness panels.

Remaining local components/wrappers:

- `SummaryCard`, now a compatibility wrapper around `StatisticsMetricCard`.
- `StatsTodayPanel`.
- `StatisticsDashboardPanel` body composition and Statistics subpanels.
- `ExecutionSandboxFixturePanel`.
- `ActivePositionCard`.
- `ExecutionHandoffPreviewModal`.
- `ClosePositionModal`.
- History and diagnostics panels such as `ClosedPositionCard`,
  `RecommendationHistoryPanel`, `RecommendationScanRunDiagnosticsPanel`,
  `RecommendationEngineControlCenterPanel`, and Market diagnostics panels.
- shared visual helpers such as `CompanyIdentity`, `DataModePill`,
  `DataModePillRow`, `TradePrimaryStatusbar`, `MiniMetricGrid`, and
  `LiveMetricGrid`.

## 3. Remaining App-Owned Responsibilities

App-wide state:

- active tab and selected modal/trade state.
- recommendations, active positions, closed positions, user settings, market
  status, market regime, scan logs, broker cost model, risk controls, and
  execution mode.
- History filters, recommendation history filters, Statistics range, live-test
  readiness/runbook state, provider plan mode hint, and dev-preview preferences.
- loading/saving/updating flags and global messages.
- recommendation snapshot, scan-run, batch, outcome, backfill, dedupe, and
  evaluation diagnostics.

Recommendation data construction/filtering:

- recommendation visibility and source-mode derivation.
- daily recommendations and recommendation card inputs.
- recommendation freshness, eligibility, decision stack, calibration guardrails,
  pre-trade risk context, discard review summaries, and Market diagnostics
  inputs.
- recommendation snapshot/batch/scan-run/outcome construction and hidden JSON
  readbacks.

Live trade data construction/monitoring:

- live position item construction and take-profit grouping.
- latest position update signatures, action/urgency comparison, notification
  sound decisions, stale-price warnings, EOD safety, and auto-refresh intervals.
- risk-controls evaluation for live positions.
- close/sell modal wiring and execution preview wiring.

History data construction/filtering:

- closed position transformation and History dashboard input construction.
- History outcome/demo/partial/sort filters.
- closed trade result, plan-vs-actual review, audit timeline, replay,
  improvement suggestions, and outcome explanation derivation.

Statistics calculations:

- statistics dashboard input construction.
- PnL/R, win/loss, profit factor, expectancy, hold-time, daily risk, partial
  close, setup performance, and plan-adherence summary calculations.
- recommendation analytics summaries, calibration readiness, sample quality, and
  improvement backlog.

Selected modal/trade states:

- selected recommendation and add-trade modal values.
- selected live position and close-position modal values.
- validation status and latest validation messages.
- execution preview open state inside local card/modal components.

Persistence/localStorage/Supabase behavior:

- initial Supabase data load for recommendations, positions, closed positions,
  settings, updates, scan logs, recommendation records, market status, and
  market regime.
- localStorage demo data, runbook/protocol state, provider plan mode,
  dev-preview preference, dismissed warnings, EOD acknowledgement, execution
  audit events, and mock broker fill records.
- recommendation snapshot/scan-run/batch/outcome persistence and diagnostics.
- trade create/update/close mutations and fallback handling for missing
  execution metadata columns.

Execution/handoff/orchestrator wiring:

- live and fixture execution orchestrator calls.
- buy order handoff modal wiring.
- sell/close hard-stop, form-mapping, fill-capture, completion-policy, and
  mock-broker import wiring.
- Avanza agent request/bridge envelope previews.
- execution audit event appends, local execution record preview/store wiring,
  broker capture stubs, and localhost bridge hooks.

Audit/event derivation:

- `trade-management-events` local event reads/writes.
- execution timeline, handoff replay, handoff quality, execution quality, and
  improvement suggestions.
- scan/recommendation diagnostic event readbacks.

## 4. Remaining Local UI/Rendering

Compatibility wrappers:

- `SummaryCard` remains local to preserve broad call sites after extracting
  `StatisticsMetricCard`.

Render slots/shared visuals:

- `CompanyIdentity`, `DataModePill`, `DataModePillRow`, and source-badge slots
  are still app-local and shared by Recommendations, Live Day Trades, History,
  and diagnostics.
- `TradePrimaryStatusbar` is still app-local and shared across tabs.
- `MiniMetricGrid` and `LiveMetricGrid` are still app-local shared metric
  helpers.

Remaining inline panels:

- `StatsTodayPanel`.
- `StatisticsDashboardPanel` body panels and chart components.
- `ExecutionSandboxFixturePanel`.
- `ActivePositionCard`.
- `ExecutionHandoffPreviewModal`.
- `ClosePositionModal`.
- `ClosedPositionCard`.
- Recommendation History and Market diagnostics panels.

Remaining local card/container pieces:

- `ActivePositionCard` and `ClosedPositionCard` still own local UI state and
  behavior-coupled derivation.
- `ClosePositionModal` remains behavior-heavy and owns many local sell/close
  form states.
- `ExecutionHandoffPreviewModal` still owns local lifecycle/capture/progress
  states and calls extracted hooks/components.

## 5. Largest Remaining Risk-Heavy Domains

1. State/effects/localStorage:

- largest broad coupling point.
- includes initial load, focus/storage/visibility listeners, auto-refresh,
  local protocol/runbook/provider/dev preferences, EOD acknowledgements, and
  audit event storage.

2. Supabase/persistence:

- central data integrity surface for recommendations, positions, closed trades,
  recommendation snapshots/batches/outcomes, scan runs, and market records.
- mixed with local demo data and fallback handling.

3. Execution/handoff/orchestrator:

- safety-sensitive buy/sell execution previews, Avanza bridge diagnostics,
  capture stubs, audit appends, execution record previews, and completion
  policies.

4. Trade mutation flows:

- add trade, ignore/discard, close position, partial close/mock fill import,
  broker metadata capture, and live state refresh.

5. Statistics/PnL/plan-adherence calculations:

- calculation-sensitive and now intentionally left parent-owned after safe UI
  extraction.

6. Data construction/filtering:

- daily recommendation lists, History filters, recommendation history filters,
  Market diagnostics, scan histories, and cross-tab derived summaries.

## 6. Candidate Next Strategic Phases

A. State/hooks extraction phase:

- Extract app-wide state/effect clusters into planned hooks.
- Highest strategic value because UI areas are now decomposed but the parent
  still owns too many state/effect responsibilities.
- Needs careful sequencing to avoid hook-order bugs and accidental behavior
  changes.

B. Persistence/Supabase boundary phase:

- Extract Supabase/localStorage read/write boundaries and refresh orchestration.
- High value for data integrity and testability.
- Riskier than planning state/effects first because it can affect loaded data
  and mutation behavior.

C. Execution record/result creation boundary phase:

- Focus on execution record, broker result, audit append, and capture-result
  creation boundaries.
- Valuable for execution safety.
- Should follow a focused plan because execution behavior is high stakes.

D. Avanza runner preparation phase:

- Not recommended yet.
- Existing work is still diagnostics/safety scaffolding; real runner readiness
  should wait until state, persistence, and execution boundaries are clearer.

E. Final UI cleanup phase:

- Low-to-medium value.
- Remaining UI panels are mostly calculation- or behavior-adjacent, so more UI
  extraction has diminishing returns without state/persistence plans.

## 7. Recommended Next Phase

Recommended next phase:

**App-wide state/effects extraction planning.**

Why:

- Major UI/component areas are now paused at safe boundaries.
- `app/trade-app.tsx` still has dense state/effect ownership for data loading,
  auto-refresh, persistence preferences, diagnostics, selected modal state, and
  cross-tab integration.
- A plan can identify hook boundaries without moving state yet, preserving hook
  order and behavior.
- This phase creates the safest bridge toward later Supabase/persistence and
  execution boundary work.

Do not start real Avanza runner preparation yet. It should wait until execution
state, persistence, and audit boundaries are clearer.

## 8. Recommended Next Action

Recommended next action:

**Action 389 - Create App State/Effects Extraction Plan**

Suggested scope:

- inventory current `useState`, `useEffect`, `useRef`, and refresh function
  clusters.
- group them by domain: base data load, recommendation diagnostics, live trade
  monitoring, History/Statistics filters, local preferences, execution modal
  state, and mutation status.
- propose safe hook boundaries and ordering.
- identify which state must remain parent-owned for now.
- do not move hooks or behavior in the planning action.

## 9. Risk Assessment

Hook order risk:

- High if hooks move before a plan.
- The next action should plan hook extraction boundaries only.

App-wide state coupling:

- High because many derived values combine recommendations, positions, History,
  Statistics, Market diagnostics, and execution state.

Persistence/data integrity risk:

- High around Supabase mutations, recommendation persistence, local demo data,
  and outcome evaluation records.

Execution safety risk:

- High around Avanza bridge diagnostics, broker capture stubs, execution record
  previews, close-position flow, and audit append logic.

Calculation drift risk:

- Medium-to-high around PnL/R, profit factor, plan adherence, recommendation
  performance, and Market diagnostics.

E2E coverage reliance:

- E2E coverage is strong for execution sandbox contracts, but broad app state
  extraction could still create subtle UI/data regressions.

Future production risk:

- Real Avanza runner work should remain blocked until state/effects,
  persistence, execution record, and audit boundaries are better isolated.

## 10. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 389 Result

Action 389 added `docs/app-state-effects-extraction-plan.md`.

Result:

- Inventoried the current app-wide state/effect clusters in
  `app/trade-app.tsx`.
- Classified likely hook boundaries by risk, from navigation/tab state through
  Statistics range state, modal state, domain state, persistence effects, and
  execution/handoff state.
- Confirmed persistence, Supabase writes, execution/orchestrator state, trade
  mutation flows, PnL/statistics calculations, plan-adherence ownership, and
  active position monitoring should not move yet.
- Recommended Action 390: reassess the Navigation/Tab State Hook boundary
  before any runtime hook extraction.

Next recommended action:

**Action 390 - Reassess Navigation/Tab State Hook Boundary**

## Action 390 Result

Action 390 added `docs/navigation-tab-state-hook-boundary-reassessment.md`.

Result:

- Reassessed the first state-hook boundary after major UI extraction.
- Confirmed navigation is safe to extract only as a tiny state hook because
  `activeTab` has no URL/hash/localStorage persistence.
- Confirmed refresh orchestration, nav rendering, tab labels, app layout,
  modals, persistence, and execution wiring should remain in `app/trade-app.tsx`.

Next recommended action:

**Action 391 - Extract Navigation/Tab State Hook**

## Action 391 Result

Action 391 added `hooks/trade-app/useTradeAppNavigationState.ts`.

Result:

- Began the app-wide state/effects phase with the smallest state hook boundary.
- Replaced the inline `activeTab` `useState` in `TradeApp` with
  `useTradeAppNavigationState`.
- Kept all app-wide refresh, persistence, execution, data, calculation, and UI
  rendering responsibilities parent-owned.

Next recommended action:

**Action 392 - Reassess Navigation/Tab State Hook Extraction**

## Action 392 Result

Action 392 added
`docs/navigation-tab-state-hook-post-extraction-reassessment.md`.

Result:

- Reassessed the first state-hook extraction after Action 391.
- Confirmed the navigation hook preserved default tab, setter call sites, nav
  rendering, e2e-visible labels, refresh effects, persistence, and execution
  behavior.
- Recommended the next boundary check: Statistics range state.

Next recommended action:

**Action 393 - Reassess Statistics Range State Hook Boundary**

## Action 393 Result

Action 393 added `docs/statistics-range-state-hook-boundary-reassessment.md`.

Result:

- Reassessed the next state-hook candidate after navigation.
- Confirmed Statistics range state is safe to extract only as state plus setter.
- Confirmed calculation builders, rendering, range options, persistence,
  Supabase/localStorage behavior, History/Live/Recommendations integration, and
  execution state must remain parent-owned.

Next recommended action:

**Action 394 - Extract Statistics Range State Hook**

## Action 394 Result

Action 394 added `hooks/trade-app/useStatisticsRangeState.ts`.

Result:

- Extracted the Statistics range state as the second small app-state hook.
- Replaced the inline `selectedStatisticsRange` `useState` with
  `useStatisticsRangeState`.
- Kept all range-driven calculations, options, rendering, persistence, data
  construction, and execution behavior parent-owned.

Next recommended action:

**Action 395 - Reassess Statistics Range State Hook Extraction**
