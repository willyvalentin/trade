# Live Position Execution UI Coupling Inventory

Action: 931
Date: 2026-06-27
Status: `live_position_execution_ui_coupling_inventory_created`

## Purpose

This documentation-only inventory maps the live-position execution UI coupling
inside `app/trade-app.tsx`. It identifies the current live-position execution
surfaces, state and callback dependencies, helper/adapter dependencies,
handler/effect coupling, candidate extraction boundaries, safety boundaries,
risks, and a staged extraction plan.

No runtime code, JSX, handlers, effects, state mutation, helper wiring, audit
writer path, rollout flag, broker/Avanza behavior, automatic mode behavior,
database behavior, type generation, generated type, or `.env.local` value was
changed by this action.

## Current Live Position Execution UI Surface Map

### Live Day Trades tab card instantiation

- File/location: `app/trade-app.tsx`, `LiveDayTradesTab` card mapping around
  lines 15201-15323.
- Current responsibilities: renders primary and continued live-position grids
  and instantiates `ActivePositionCard` for each position.
- State dependencies: `activePositions`, `latestPositionUpdates`,
  `takeProfitLivePositionItems`, `otherLivePositionItems`,
  `dailySessionDate`, `topMarketStatus`, `currentTime`,
  `selectedExecutionMode`, `riskControlsSettings`, `dailyClosedPositions`,
  `dailyRealizedPnl`, `dailyRealizedR`, `lastLossClosedAt`, `isSaving`, and
  `isLoading`.
- Helper dependencies: `evaluateRiskControlsForLiveTrade(...)`,
  `calculateUnrealizedPnl(...)`, and `calculateCurrentR(...)`.
- Handler dependencies: passes `openClosePositionModal` as
  `onClosePosition`.
- Effect dependencies: upstream live-trade refresh and island state are parent
  owned; this render path does not own effects.
- Surface classification: interactive, live-position related,
  mutation-adjacent because the close callback eventually opens a close/exit
  flow, but the card mapping itself is render/composition only.

### ActivePositionCard live execution status derivation

- File/location: `app/trade-app.tsx`, `ActivePositionCard` around lines
  30031-30175.
- Current responsibilities: derives current price/R/PnL, stale warnings,
  urgency, live sell guidance, partial-position status, display props,
  execution eligibility, live execution orchestrator result, and UI status.
- State dependencies: `position`, `latestUpdate`, `marketCloseWarning`,
  `eodSafetyStatus`, `eodSafetyDate`, `isMarketOpen`, `currentTime`,
  `executionMode`, `riskControlsEvaluation`, and `isSaving`.
- Helper dependencies: `calculateCurrentR(...)`,
  `calculateUnrealizedPnl(...)`, `getStalePositionStatus(...)`,
  `getStalePositionWarning(...)`, `getPositionUpdateUrgency(...)`,
  `buildLiveSellGuidance(...)`, `liveSellActionToLegacyAction(...)`,
  `setupTypeLabelFromActivePosition(...)`, `buildLiveDayTradeDisplayProps(...)`,
  `isDemoPosition(...)`, `isMockPosition(...)`, `runExecutionOrchestrator(...)`,
  and `buildExecutionUiStatusFromOrchestratorResult(...)`.
- Handler dependencies: none directly in this derivation block.
- Effect dependencies: none directly, but it consumes refreshed
  `latestUpdate` and execution settings selected by parent state.
- Surface classification: read-only derivation, live-position related, not
  mutation-adjacent by itself.

### Live execution handoff/open path

- File/location: `app/trade-app.tsx`, `ActivePositionCard` around lines
  30176-30188 and render usage around lines 30369-30409.
- Current responsibilities: owns `isExecutionPreviewOpen`, closes through
  `closeExecutionModalState()`, opens through `openExecutionModalState({
  source: "live_position" })`, renders `ExecutionHandoffPreviewModal`, and
  passes `openExecutionPreviewModal` to `LiveExecutionStatusSurface`.
- State dependencies: `isExecutionPreviewOpen`,
  `liveExecutionOrchestratorResult`, `liveExecutionStatus`, and selected
  orchestrator intent.
- Helper dependencies: `openExecutionModalState(...)` and
  `closeExecutionModalState()`.
- Handler dependencies: `openExecutionPreviewModal` and
  `closeExecutionPreviewModal`.
- Effect dependencies: modal-local effects live in
  `ExecutionHandoffPreviewModal`; `ActivePositionCard` does not add effects for
  this path.
- Surface classification: interactive, live-position related, modal-related,
  not data-mutating, but sensitive because it controls prepare/capture preview
  visibility.

### Live execution status surface

- File/location: `app/trade-app.tsx`, render around lines 30403-30409;
  component implementation in
  `components/live-day-trades/LiveExecutionStatusSurface.tsx`.
- Current responsibilities: renders execution status copy, mode badge, next
  action copy, and optional "View handoff" button.
- State dependencies: receives derived `liveExecutionStatus`.
- Helper dependencies: status helper functions local to
  `LiveExecutionStatusSurface`; no Supabase, service-role, route, or storage
  dependency.
- Handler dependencies: optional `onViewHandoff` callback.
- Effect dependencies: none.
- Surface classification: mostly read-only with one UI callback, live-position
  related, modal-trigger related, not mutation-adjacent.

### Live position details modal

- File/location: `app/trade-app.tsx`, render around lines 30274-30365;
  component implementation in
  `components/live-day-trades/LiveTradeDetailsModal.tsx`.
- Current responsibilities: shows position details, data-mode notice, risk
  flags, risk controls, EOD acknowledgement panel, audit preview summary,
  timeline/replay/suggestions, and close/backdrop/Escape behavior.
- State dependencies: `isDetailsOpen`, derived R/PnL, `warnings`,
  `positionUrgency`, `riskControlsEvaluation`, `eodRiskAcknowledged`,
  `liveTradeRiskFlags`, audit timeline/replay/quality/suggestions, and
  `position.executionMetadata`.
- Helper dependencies: `calculateExecutionQuality(...)`,
  `buildExecutionTimeline(...)`, `readTradeManagementEvents()`,
  `buildHandoffSessionReplay(...)`, `calculateHandoffQuality(...)`,
  `buildExecutionImprovementSuggestions(...)`, formatting helpers, and
  `endOfDaySafetyLabel(...)`.
- Handler dependencies: `onClose={() => setIsDetailsOpen(false)}` and
  `acknowledgeEndOfDayRisk`.
- Effect dependencies: `LiveTradeDetailsModal` owns Escape-key listener and
  backdrop-close behavior.
- Surface classification: interactive, live-position related, modal-related,
  read-mostly, localStorage-adjacent through EOD acknowledgement callback, not
  trade/PnL mutating.

### Close/reset path

- File/location: `app/trade-app.tsx`, card close button callback around lines
  30387-30392; parent modal opener around lines 9732-9737.
- Current responsibilities: stops card click propagation, calls
  `onClosePosition(position)`, and parent `openClosePositionModal(...)` sets
  `selectedPosition`, clears exit fields, and clears message state.
- State dependencies: `position`, `isSaving`, `selectedPosition`, `exitPrice`,
  `exitNotes`, and app message state.
- Helper dependencies: none for the opener.
- Handler dependencies: `onClosePosition`, `openClosePositionModal(...)`, and
  downstream `ClosePositionModal`.
- Effect dependencies: none in the opener; downstream close modal owns timers,
  refs, copy state, validation, generated artifacts, and submit behavior.
- Surface classification: interactive, live-position related, modal-related,
  mutation-adjacent because it leads to close/partial-close flows.

### Close/partial-close mutation flow

- File/location: `app/trade-app.tsx`, `submitClosePosition(...)` around lines
  10137-10510.
- Current responsibilities: validates broker exit confirmation, calculates
  partial accounting, updates demo local storage or Supabase `positions`,
  records closed positions, logs trade/broker exit events, refreshes
  `live_trades`, `stats_today`, and `history_statistics`, and updates user
  messages/tabs.
- State dependencies: `selectedPosition`, `exitPrice`, `exitNotes`, `isSaving`,
  active/closed position state, latest updates, selected tab, and refresh island
  state.
- Helper dependencies: `validateBrokerExitConfirmation(...)`,
  `normalizeExitFill(...)`, `buildPartialPositionState(...)`,
  `writeDemoActivePositions(...)`, `writeDemoClosedPositions(...)`,
  `writeDemoLastAction(...)`, `logTradeClosedEvent(...)`,
  `logBrokerExitConfirmationEvent(...)`, `supabase.from("positions").update`,
  and `refreshIslands(...)`.
- Handler dependencies: form submission from `ClosePositionModal`.
- Effect dependencies: downstream modal has its own generated payload/copy
  effects and interval state; submit path is async and mutation-heavy.
- Surface classification: mutation-heavy, trade/stats/PnL related,
  Supabase/localStorage related, not a candidate for Action 932-934 UI
  extraction.

## State And Callback Dependencies

- Position object dependencies: `id`, `recommendationId`, `ticker`,
  `companyName`, `direction`, `entryPrice`, `entryPriceValue`, `stopLoss`,
  `stopLossValue`, `target1`, `target1Value`, `target2Value`,
  `positionSize`, `positionSizeValue`, `openedAt`, `openedAtRaw`,
  `executionMetadata`, and partial-position fields such as
  `remaining_shares`.
- Recommendation/trade dependencies: `recommendationId`, setup type from
  execution metadata, trading date, active/closed position lists, and current
  recommendation-derived live trade grouping.
- Execution orchestrator result dependencies: non-demo, non-mock, long
  positions with current price, quantity, and target or stop; result is passed
  to `buildExecutionUiStatusFromOrchestratorResult(...)` and
  `ExecutionHandoffPreviewModal`.
- Lifecycle state dependencies: live status derives from the execution
  orchestrator and lifecycle UI status adapter; handoff modal owns its local
  lifecycle/capture state.
- Modal state dependencies: `isDetailsOpen` and `isExecutionPreviewOpen` are
  card-local; close modal selection is parent-owned through `selectedPosition`.
- Execution mode/settings dependencies: `selectedExecutionMode` is passed from
  parent into each `ActivePositionCard` and then to `runExecutionOrchestrator`.
- Local persistence/logging dependencies: EOD acknowledgement reads/writes,
  trade-management events, demo active/closed position stores, demo last-action
  store, and broker/trade event logs.
- Mutation callbacks: `openClosePositionModal(...)` starts the close flow;
  `submitClosePosition(...)` mutates demo storage or Supabase and refreshes
  live/stat/history islands.
- UI-only callbacks: `setIsDetailsOpen(true/false)`,
  `openExecutionPreviewModal`, `closeExecutionPreviewModal`, and
  `acknowledgeEndOfDayRisk` except for its local EOD acknowledgement
  persistence.

## Helper/Adapter Dependency Map

- Lifecycle UI adapter: `buildExecutionUiStatusFromOrchestratorResult(...)`
  adapts the live execution orchestrator result for `LiveExecutionStatusSurface`
  and `ExecutionHandoffPreviewModal`.
- Modal state helpers: `openExecutionModalState(...)` and
  `closeExecutionModalState()` govern live execution preview visibility.
- Execution settings persistence helpers: not directly imported by
  `ActivePositionCard`, but `selectedExecutionMode` is parent-owned and
  ultimately comes from execution settings state.
- Local storage helpers/stores: `readEndOfDayAcknowledgement(...)`,
  `writeEndOfDayAcknowledgement(...)`, demo active/closed position helpers, and
  trade-management event readers/loggers.
- Execution orchestrator/result types: `runExecutionOrchestrator(...)` builds
  the live execution preview result for eligible positions.
- Execution lifecycle state machine: used behind the orchestrator/status and
  handoff modal path; the card should not import server lifecycle boundaries.
- Dev/mock helpers: demo/mock detection gates live execution preview; close
  modal has mock broker fill import helpers and demo storage behavior.
- Audit log/local records stores: live details audit preview reads local trade
  management events; server audit writer runtime persistence remains separate
  and must not be imported into UI.

## Handler/Effect Coupling

- Handlers that block safe extraction: `submitClosePosition(...)`,
  `openClosePositionModal(...)`, `acknowledgeEndOfDayRisk()`,
  `openExecutionPreviewModal`, and `closeExecutionPreviewModal` are behavior
  sensitive and should remain parent/card-owned for the first extraction.
- Effects that hydrate/refresh live positions: parent refresh island effects
  populate `activePositions` and `latestPositionUpdates`; the Live Day Trades
  statusbar refreshes `market_status` and `live_trades`.
- Effects that persist execution logs/records: close/sell modal and event-log
  helpers record local trade/broker events; no server audit writer UI path
  should be added.
- Handlers that mutate live positions/trades/stats/PnL:
  `submitClosePosition(...)` performs demo storage or Supabase updates,
  partial-close accounting, closed-position creation, PnL/R calculations, and
  `refreshIslands(["live_trades", "stats_today", "history_statistics"], ...)`.
- Handlers that invoke prepare/capture/dev mock flows: live execution preview
  open path invokes a prepare/capture-capable modal in preview mode; close/sell
  modal owns sell payload generation, copy handlers, mock fill import, and
  broker exit validation.
- Handlers that should remain app-level for now: close/partial-close submit,
  selected close modal state, live-trade refresh, risk-control evaluation
  inputs, and execution mode selection.
- Stale closure risks: extracted callbacks must preserve current `position`,
  `latestUpdate`, `liveExecutionOrchestratorResult`, `liveExecutionStatus`,
  `isSaving`, and selected `executionMode` values; callback identity changes
  should be tested before moving interactive controls.

## Candidate Component Boundaries

### `ExecutionLivePositionStatusSurface`

- Proposed file path:
  `components/execution/execution-live-position-status-surface.tsx`.
- Props needed: derived `liveExecutionStatus`, optional
  `executionPreviewModal`, and `onViewHandoff`.
- Callbacks needed: `onViewHandoff`.
- Helper imports allowed: type-only imports from `@/lib/execution-ui-status`;
  presentational class helpers if local to the component.
- Helper imports not allowed: `runExecutionOrchestrator(...)`,
  `openExecutionModalState(...)`, `closeExecutionModalState()`, Supabase,
  service-role/env helpers, audit writer modules, route callers, storage
  helpers, broker/Avanza helpers, and market/scanner helpers.
- Risk level: low.
- Extraction priority: first, after baseline tests, because it can remain
  read-only plus one callback and avoids trade/PnL mutation callbacks.

### `ExecutionLivePositionHandoffSection`

- Proposed file path:
  `components/execution/execution-live-position-handoff-section.tsx`.
- Props needed: derived `liveExecutionStatus`,
  `liveExecutionOrchestratorResult`, `isExecutionPreviewOpen`, and rendered
  modal/status nodes or narrow callbacks.
- Callbacks needed: `onOpenHandoff`, `onCloseHandoff`.
- Helper imports allowed: ideally none beyond UI/status types; prefer passing
  rendered `ExecutionHandoffPreviewModal` as a node for the first pass.
- Helper imports not allowed: orchestrator, modal state helpers, Supabase,
  service-role/env helpers, audit writer modules, route callers, broker/Avanza
  helpers, and storage helpers.
- Risk level: medium.
- Extraction priority: second or third; it touches modal visibility and selected
  handoff result semantics.

### `ExecutionLivePositionControls`

- Proposed file path:
  `components/execution/execution-live-position-controls.tsx`.
- Props needed: display close button label/tone, disabled state, action label,
  and possibly status CTA copy.
- Callbacks needed: `onClosePositionClick`; optionally `onViewHandoff`.
- Helper imports allowed: display types only.
- Helper imports not allowed: close/partial-close submit logic, Supabase,
  storage helpers, audit writer modules, route callers, broker/Avanza helpers,
  market/scanner helpers, and execution orchestrator.
- Risk level: medium because the close button is mutation-adjacent and relies
  on `event.stopPropagation()`.
- Extraction priority: after the read-only status surface and baseline tests.

### `ExecutionLivePositionPanel`

- Proposed file path:
  `components/execution/execution-live-position-panel.tsx`.
- Props needed: full `LiveDayTradeCardBody` display props, identity, metric
  grid, status surface, details modal, execution preview modal, and all card
  callbacks.
- Callbacks needed: open details, keydown open details, close position, open
  handoff, close handoff, EOD acknowledgement.
- Helper imports allowed: presentational types only.
- Helper imports not allowed: orchestrator, modal helpers, storage helpers,
  Supabase, audit writer modules, route callers, broker/Avanza helpers, and
  close/partial-close submit logic.
- Risk level: medium-high because it is broader than a status surface and can
  accidentally move interactive card behavior.
- Extraction priority: later.

### `ExecutionLivePositionDetailsAuditPreview`

- Proposed file path:
  `components/execution/execution-live-position-details-audit-preview.tsx`.
- Props needed: already-derived audit summary, quality, replay/timeline counts,
  first suggestion, first timeline description, preview warning label, and
  rendered full audit trail node.
- Callbacks needed: none for the read-only portion.
- Helper imports allowed: display types only.
- Helper imports not allowed: `readTradeManagementEvents()`, timeline/replay
  builders, Supabase, service-role/env helpers, audit writer modules, route
  callers, broker/Avanza helpers, storage helpers, and close submit logic.
- Risk level: medium because it lives inside the details modal, but the
  read-only audit preview can be isolated after baseline coverage.
- Extraction priority: later than the status surface.

## Safety Boundaries Per Extraction

For every candidate extraction:

- Do not add audit writer client/UI/browser invocation.
- Do not import service-role, env, Supabase, server-only modules, route callers,
  lifecycle server boundaries, runtime proof harnesses, monitoring, cleanup, or
  rollout modules.
- Do not add broker/Avanza behavior.
- Do not enable automatic order submission.
- Do not invoke market-loop/scanner/automation paths.
- Do not mutate trade/stats/PnL behavior unless the mutation remains in the
  already-owned parent callback.
- Do not move `submitClosePosition(...)` or Supabase `positions` updates.
- Do not move demo storage writes or History/Statistics refresh behavior.
- Do not add route/fetch calls.
- Do not change storage keys.
- Do not broaden lifecycle UI adapter wiring.
- Do not run live proof, live insert, select/query/remote SQL, migration,
  typegen, or generated type edits.

## Suggested Extraction Sequence

1. Action 932 - Add Live Position Execution UI Baseline Tests.
2. Action 933 - Extract Read-Only Live Position Execution Status Surface.
3. Action 934 - Extract Live Position Handoff CTA/Controls Surface.
4. Action 935 - Create Live Position Execution UI Extraction Summary.

This sequence keeps the first runtime move read-only and avoids close/partial
close mutation callbacks until the status and modal-open seams are locked by
tests.

## First Recommended Seam

Recommended first seam:

`ExecutionLivePositionStatusSurface`

Why:

- It is lower risk than controls and close/partial-close behavior.
- It can preserve behavior with explicit derived props and one callback.
- It does not need PnL/trade/stat mutation callbacks.
- It benefits from the lifecycle UI adapter and modal helper groundwork already
  present.
- It can keep `runExecutionOrchestrator(...)`, modal visibility state,
  `openExecutionModalState(...)`, `closeExecutionModalState()`, and
  `ExecutionHandoffPreviewModal` owned by `ActivePositionCard` for the first
  extraction.

## Risks

- Active position action regression if `event.stopPropagation()` or close
  button wiring changes.
- Stale callback/closure behavior if extracted callbacks capture outdated
  position, status, execution mode, or orchestrator result values.
- Modal open/close regression if helper-backed live-position modal state is
  moved too early.
- Prepare/capture regression if `ExecutionHandoffPreviewModal` props or
  selected intent semantics change.
- PnL/trade/position mutation regression if close/partial-close logic moves
  with UI too soon.
- Live refresh/effect coupling regression if parent-owned refresh islands or
  latest update state are pulled into presentational components.
- Accidental audit writer/client boundary leak through server-only imports,
  route calls, or service-role/env references.
- Broker/Avanza implication if copy or labels imply automatic order submission.
- Automatic order submission implication if automatic mode copy or status CTA
  is broadened without approval.
- Style/layout drift in the live card, status surface, modal placement, or
  disabled button states.

## Result Status

`live_position_execution_ui_coupling_inventory_created`

## Recommended Next Action

Action 932 - Add Live Position Execution UI Baseline Tests

## Action 932 Update - Baseline Tests Added

- Created `docs/live-position-execution-ui-baseline-tests.md`.
- Added `tests/e2e/live-position-execution-ui-baseline.spec.ts`.
- Locked the current read-only live-position execution status surface,
  live-position handoff modal open/close behavior, close/reset ownership,
  extracted execution component adjacency, and client-safe/no-audit-writer
  boundaries before extraction.
- Confirmed no runtime code, JSX, handlers, effects, state helper wiring,
  audit writer path, broker/Avanza behavior, automatic mode behavior, data
  mutation, migration, typegen, generated type edit, or `.env.local` change.
- Status: `live_position_execution_ui_baseline_tests_added`.
- Recommended next action: Action 933 - Extract Read-Only Live Position
  Execution Status Surface.

## Action 933 Update - Read-Only Status Surface Extracted

- Added the dedicated read-only component
  `components/execution/live-position-execution-status-surface.tsx`.
- `ActivePositionCard` now renders `LivePositionExecutionStatusSurface` with
  already-derived `liveExecutionStatus`.
- The live-position `View handoff` control remains parent-owned in
  `ActivePositionCard`; interactive controls remain deferred.
- Status: `live_position_execution_status_surface_extracted`.
- Recommended next action: Action 934 - Extract Live Position Handoff
  CTA/Controls Surface.

## Action 934 Update - Live Position Handoff Controls Extracted

- `ActivePositionCard` now renders `LivePositionHandoffControls` inside the
  read-only status surface `footerAction` slot.
- The extracted control owns only button presentation and callback invocation;
  `ActivePositionCard` still defines and passes `openExecutionPreviewModal`.
- The full live position panel remains unextracted, and modal state,
  lifecycle/orchestrator state, prepare/capture behavior, close/reset behavior,
  and position/trade/PnL mutation-adjacent callbacks remain parent-owned.
- Status: `live_position_handoff_controls_extracted`.
- Recommended next action: Action 935 - Create Live Position Execution UI
  Extraction Summary.

## Action 935 Update - Live Position Extraction Summary Created

- Created `docs/live-position-execution-ui-extraction-summary.md`.
- Summarized the current coupling state after extracting the status surface and
  handoff controls while keeping full panel/state/mutation ownership in
  `ActivePositionCard`.
- Status: `live_position_execution_ui_extraction_summary_created`.
- Recommended next action: Action 936 - Create Dev Mock Broker Controls
  Coupling Inventory.
