# Execution UI Component Extraction Inventory

## Action 930 Update - Extraction Summary Created

- Created `docs/execution-ui-component-extraction-summary.md`.
- The summary consolidates Actions 924-929 and keeps the inventory direction:
  live position execution UI should be inventoried before any extraction.
- Status: `execution_ui_component_extraction_summary_created`.
- Recommended next action: Action 931 - Create Live Position Execution UI
  Coupling Inventory.

## Action 929 Update - Local Persistence Viewers Extracted

- Extracted `ExecutionAuditLogViewer` to
  `components/execution/execution-audit-log-viewer.tsx`.
- Extracted `ExecutionLocalRecordsViewer` to
  `components/execution/execution-local-records-viewer.tsx`.
- `app/settings/page.tsx` still owns local persistence state, effects,
  helper calls, refresh/clear callbacks, visible item derivation, and messages.
- Dev/mock broker result controls and live position UI remain inventoried as
  later seams.
- Status: `execution_local_persistence_viewers_extracted`.
- Recommended next action: Action 930 - Continue Execution UI Component
  Extraction With Remaining Approved Seam.

## Action 928 Update - Execution Settings Panel Extracted

- Extracted the execution settings panel to
  `components/execution/execution-settings-panel.tsx`.
- `app/settings/page.tsx` still owns execution mode state, automatic-mode
  feature-gate evaluation, execution authority derivation, persistence helper
  calls, and save/status messages.
- Audit/local records viewers, dev/mock controls, live position UI, and
  remaining settings surfaces stay inventoried as later seams.
- Status: `execution_settings_panel_extracted`.
- Recommended next action: Action 929 - Extract Execution Local Persistence
  Viewer Components.

## Action 927 Update - Handoff Preview Modal Extracted

- Extracted `ExecutionHandoffPreviewModal` to
  `components/execution/execution-handoff-preview-modal.tsx`.
- The modal-local state/effect/helper usage moved with the modal component; live
  position UI, settings UI, audit/local records viewers, and dev/mock broker
  viewers remain deferred.
- `app/trade-app.tsx` keeps the sandbox fixture panel, live position cards,
  settings page surfaces, app-level state, and route-free caller wiring.
- Status: `execution_handoff_preview_modal_extracted`.
- Recommended next action: Action 928 - Extract Execution Settings Panel
  Component.

## Action 926 Update - Sandbox Fixture Card Extracted

- Extracted the first recommended seam to
  `components/execution/execution-sandbox-fixture-card.tsx`.
- `app/trade-app.tsx` now keeps the sandbox fixture list/panel and passes the
  existing `ExecutionHandoffPreviewModal` through `renderHandoffPreviewModal`.
- The extracted card remains client-safe, sandbox/dev oriented, and uses the
  same orchestrator/status/lifecycle adapter/modal helper behavior.
- Deferred seams remain deferred: `ExecutionHandoffPreviewModal`, live position
  UI, settings UI, audit log/local records viewers, and dev/mock broker result
  viewers.
- Status: `execution_sandbox_fixture_card_extracted`.
- Recommended next action: Action 927 - Extract Execution Handoff Preview Modal
  Component.

## Action 925 Update - Baseline Tests Added

- Added `tests/e2e/execution-ui-component-extraction-baseline.spec.ts`.
- Created `docs/execution-ui-component-extraction-baseline-tests.md`.
- Baseline coverage now locks the selected first seam,
  `ExecutionSandboxFixtureCard`, before extraction. It covers current copy,
  fixture data, status surface derivation, lifecycle UI adapter output, modal
  open/close helper behavior, modal copy, prepare/capture helper behavior where
  testable, deferred live/settings/viewer seams, and client-safe/no-server
  import boundaries.
- No JSX was moved and no component extraction was performed.
- Status: `execution_ui_component_extraction_baseline_tests_added`.
- Recommended next action: Action 926 - Extract Read-Only Execution Sandbox
  Fixture Card Component.

Action: 924
Date: 2026-06-27
Status: `execution_ui_component_extraction_inventory_created`

## Purpose

This inventory maps the current execution UI/component seams before any JSX
extraction work. It follows the completed lifecycle UI adapter, modal state,
local persistence, and settings persistence refactors, and is intentionally
documentation-only.

No runtime code was modified. No JSX was moved. No handlers, effects, state
mutation, helper wiring, lifecycle adapter wiring, modal helper wiring, local
or settings persistence helper wiring, audit writer runtime path, rollout flag,
database action, migration, type generation, generated type file, `.env.local`,
broker/Avanza behavior, automatic order submission, automatic mode, or
trade/stats/PnL behavior was changed.

## Current UI Surface Map

### ExecutionSandboxFixtureCard

- Location: `app/trade-app.tsx` around `ExecutionSandboxFixtureCard(...)`,
  currently rendered by the execution sandbox fixture section near the
  `executionSandboxFixturePositions.map(...)` call.
- Category: dev-only fixture, mostly read-only, interactive only through a
  local preview modal open/close button.
- Responsibilities: render a local-only execution fixture card, derive one
  fixture orchestrator result, derive UI status, derive lifecycle UI state,
  expose `LiveExecutionStatusSurface`, and conditionally render the handoff
  preview modal.
- State dependencies: local `isExecutionPreviewOpen` boolean.
- Helper dependencies: `runExecutionOrchestrator(...)`,
  `buildExecutionUiStatusFromOrchestratorResult(...)`,
  `buildExecutionLifecycleUiState(...)`, `openExecutionModalState(...)`, and
  `closeExecutionModalState()`.
- Handler dependencies: local `openExecutionPreviewModal()` and
  `closeExecutionPreviewModal()`.
- Effect dependencies: none in the card itself.
- Safety notes: fixture copy explicitly states local-only, no Supabase write,
  no active-position insertion, no close/save trade path, and no broker order
  creation.

### ExecutionHandoffPreviewModal

- Location: `app/trade-app.tsx` around `ExecutionHandoffPreviewModal(...)`.
- Category: modal, interactive, dev diagnostics heavy.
- Responsibilities: render the execution handoff modal shell/composition,
  derive modal copy, manage local lifecycle preview state, run local-only
  preparation/capture/dev diagnostic flows, display Avanza/bridge readiness
  panels, and append browser-local execution audit events for diagnostics.
- State dependencies: `localLifecycle`, `captureBaseLifecycle`, preparation
  stub state, agent runner state, dev broker capture state, agent progress
  timeline state, localhost bridge hook state, and early/middle/late/readiness
  preview hook state.
- Helper dependencies: `buildExecutionLifecycleModalCopy(...)`,
  `applyExecutionPrepareResult(...)`, `applyExecutionCaptureResult(...)`,
  `transitionExecutionLifecycle(...)`, `createExecutionAuditEvent(...)`,
  `appendExecutionAuditEvents(...)`,
  `buildExecutionAuditEventFromLifecycleEvent(...)`,
  `buildTureExecutionRecord(...)`, `appendExecutionRecord(...)`, Avanza request
  and bridge preview builders, dry-run request builders, and multiple preview
  hooks/components.
- Handler dependencies: Escape close handler, preparation stub handlers,
  diagnostics runner handlers, progress event handlers, capture stub handler,
  and many child-panel callback adapters.
- Effect dependencies: Escape-key listener for modal close.
- Safety notes: the modal contains the highest coupling and should not be the
  first extraction unless protected by baseline tests. It must preserve local
  diagnostics-only behavior and must not add real broker, route, Supabase,
  service-role, or runtime audit-writer calls.

### ActivePositionCard Execution Area

- Location: `app/trade-app.tsx` around `ActivePositionCard(...)`, rendered for
  active/live positions.
- Category: live-position, mixed read-only/interactive.
- Responsibilities: render live day-trade card body, calculate live sell
  guidance, derive live execution orchestrator result for eligible long
  non-demo/non-mock positions, render `LiveExecutionStatusSurface`, and open the
  same `ExecutionHandoffPreviewModal` for eligible live execution handoffs.
- State dependencies: `eodRiskAcknowledged`, `isDetailsOpen`, and
  `isExecutionPreviewOpen`.
- Helper dependencies: `buildLiveSellGuidance(...)`,
  `runExecutionOrchestrator(...)`,
  `buildExecutionUiStatusFromOrchestratorResult(...)`,
  `openExecutionModalState(...)`, `closeExecutionModalState()`, live day-trade
  display helpers, audit timeline/replay/quality helpers, and risk-control
  display helpers.
- Handler dependencies: end-of-day acknowledgement, details open/close, card
  close-position callback, and execution preview modal open/close.
- Effect dependencies: none in the card itself.
- Safety notes: this area sits near real live-position close/detail behavior.
  Extraction must keep the execution status/modal seam separate from close
  position, trade history, statistics, and PnL mutation handlers.

### Live Position Execution Status Surface

- Location: `components/live-day-trades/LiveExecutionStatusSurface.tsx`;
  consumed by `ExecutionSandboxFixtureCard` and `ActivePositionCard`.
- Category: read-only status surface with one callback for viewing handoff.
- Responsibilities: display execution lifecycle/status summary and expose a
  handoff preview affordance.
- State dependencies: receives derived status props; owns no app-level state.
- Helper dependencies: none beyond display props passed by parent.
- Handler dependencies: `onViewHandoff` callback supplied by parent.
- Effect dependencies: none.
- Safety notes: already extracted and a useful model for future card-level
  extraction: derived state should remain in parents or helper modules unless a
  new component receives all inputs explicitly.

### Settings Execution Mode Section

- Location: `app/settings/page.tsx` execution-mode section around the
  "Execution Mode" heading.
- Category: settings, interactive.
- Responsibilities: render semi-automatic/automatic mode controls, display
  modeled authority, enforce automatic-mode lock copy, and show persistence
  message.
- State dependencies: `executionMode`, `executionModeMessage`,
  `automaticExecutionEnabled`, and `executionAuthority`.
- Helper dependencies: `readStoredExecutionModePreference(...)`,
  `writeStoredExecutionModePreference(...)`,
  `getBrowserExecutionSettingsStorage()`, automatic feature flag helper, and
  authority resolution.
- Handler dependencies: `updateExecutionModePreference(...)`.
- Effect dependencies: settings page startup hydration effect that reads
  execution settings and related local execution stores.
- Safety notes: extraction must keep exact-string automatic gating,
  semi-automatic default, no reset path, and current error messaging.

### Execution Audit Log Viewer

- Location: `app/settings/page.tsx`, `ExecutionEventLogPanel` usage in the
  execution dev tools block; panel implementation is lower in the same file.
- Category: settings/dev-only local persistence viewer.
- Responsibilities: show browser-local execution audit events, refresh local
  read state, and clear only local browser storage after confirmation.
- State dependencies: `executionEventLog`, `latestExecutionAuditEvents`,
  `latestExecutionAuditTimestamp`, and `executionEventLogMessage`.
- Helper dependencies: `readExecutionEventLog()`,
  `clearExecutionAuditEvents()`, and local storage helper-backed event-log
  internals.
- Handler dependencies: `refreshExecutionEventLog()` and
  `clearExecutionEventLog()`.
- Effect dependencies: settings page startup hydration effect.
- Safety notes: this is not the server-side audit writer path and must not be
  wired to route invocation, service-role, Supabase, or production runtime
  persistence.

### Local Execution Records Viewer

- Location: `app/settings/page.tsx`, `ExecutionRecordsPanel` usage in the
  execution dev tools block; panel implementation is lower in the same file.
- Category: settings/dev-only local persistence viewer.
- Responsibilities: show browser-local execution records, refresh local read
  state, and clear local records after confirmation.
- State dependencies: `executionRecordStore`, `latestExecutionRecords`,
  `latestExecutionRecordTimestamp`, and `executionRecordStoreMessage`.
- Helper dependencies: `readExecutionRecordStoreResult()` and
  `clearExecutionRecords()`.
- Handler dependencies: `refreshExecutionRecords()` and
  `clearLocalExecutionRecords()`.
- Effect dependencies: settings page startup hydration effect.
- Safety notes: clearing local records must remain local-only and must not
  affect trades, broker state, History, Statistics, Supabase, or audit-writer
  rows.

### Dev/Mock Broker Result Controls

- Location: `app/settings/page.tsx`, `DevMockBrokerResultsPanel` usage in the
  execution dev tools block; dev broker capture UI is also present inside
  `ExecutionHandoffPreviewModal`.
- Category: settings/dev-only diagnostics and modal dev-only controls.
- Responsibilities: list local dev mock broker results, clear local mock
  diagnostics, and refresh local execution records/event log after local dev
  capture.
- State dependencies: `devMockBrokerResultStore`,
  `latestDevMockBrokerResults`, `latestDevMockBrokerResultTimestamp`,
  `devMockBrokerResultStoreMessage`, plus modal-local stub broker fields.
- Helper dependencies: `readDevMockBrokerResultStoreResult()`,
  `clearDevMockBrokerResults()`, modal capture helpers, local event log
  helpers, and local execution record store helpers.
- Handler dependencies: `refreshDevMockBrokerResults()`,
  `clearLocalDevMockBrokerResults()`, `refreshAfterDevMockBrokerCapture()`, and
  modal capture stub handlers.
- Effect dependencies: settings page startup hydration effect.
- Safety notes: this must remain dev/mock/local-only and must not become a real
  broker result, Supabase write, or trade mutation path.

### Additional Execution Dev Tools Surfaces

- Location: `app/settings/page.tsx` execution dev tools block and
  `components/execution/*`.
- Category: settings/dev-only diagnostics.
- Responsibilities: smoke checklist, bridge config/diagnostics, Avanza agent
  runs, safe browser action diagnostics, audit persistence stubs, and extracted
  execution preview panels.
- State dependencies: settings page local diagnostic store state and hook state
  from modal preview helpers.
- Helper dependencies: local storage helpers, bridge config helpers, Avanza
  diagnostics helpers, and extracted preview component props.
- Handler dependencies: refresh/clear/check/reset callbacks in settings and
  modal code.
- Effect dependencies: settings startup hydration and individual diagnostic
  async handlers.
- Safety notes: these surfaces should remain dev-tool gated and should not
  create automatic app runtime, market-loop, scanner, broker, or audit writer
  invocation paths.

## Candidate Component Boundaries

### `components/execution/ExecutionSandboxFixtureCard.tsx`

- Proposed props: `fixture`, `executionMode`, and injected display callbacks
  only if tests show they are needed.
- Callbacks: local `onViewHandoff` remains internal if the component owns the
  preview modal state; otherwise parent can pass `onOpenPreview`.
- Allowed helpers: orchestrator, UI status adapter, lifecycle UI adapter, modal
  open/close helpers, display formatters.
- Disallowed helpers: server-only audit writer, route invocation, Supabase
  clients, service-role helpers, broker submission helpers, trade mutation
  handlers.
- Risk: low to medium because it is local/dev-only and has one small local
  state seam.
- Priority: first.

### `components/execution/ExecutionHandoffPreviewModalContainer.tsx`

- Proposed props: `result`, `status`, `onClose`.
- Callbacks: existing modal child callbacks remain internal until they can be
  split further.
- Allowed helpers: current modal state helpers, local event-log helpers, local
  execution record store helpers, preview/dry-run diagnostics helpers.
- Disallowed helpers: live service-role adapter, audit writer route invocation,
  production runtime caller, direct Supabase mutation, real broker action.
- Risk: high because it contains many local states, effects, async diagnostics,
  local audit events, and dev capture flows.
- Priority: after sandbox card and focused baseline tests.

### `components/execution/ActivePositionExecutionStatusSection.tsx`

- Proposed props: derived live execution result/status, `onOpenPreview`, and
  `previewModal`.
- Callbacks: open/close preview only.
- Allowed helpers: UI status/lifecycle display helpers if deriving in the
  component is explicitly tested.
- Disallowed helpers: close-position handlers, stats/history mutation, audit
  writer path, broker action.
- Risk: medium to high because it sits inside the live-position card beside
  real close/detail behavior.
- Priority: later, after modal extraction is stable.

### `components/execution/ExecutionSettingsModePanel.tsx`

- Proposed props: `executionMode`, `automaticExecutionEnabled`,
  `executionAuthority`, `message`, `onUpdateMode`.
- Callbacks: `onUpdateMode(mode)`.
- Allowed helpers: display-only authority helpers if already imported by the
  page; persistence helpers should stay in page/container handlers.
- Disallowed helpers: direct localStorage access unless separately approved,
  reset/clear behavior, broker/Avanza behavior, audit writer route calls.
- Risk: medium because automatic-mode gating and copy are safety-sensitive.
- Priority: after baseline tests.

### `components/execution/ExecutionEventLogPanel.tsx`

- Proposed props: existing `ExecutionEventLogPanel` props from settings usage.
- Callbacks: `onRefresh`, `onClear`.
- Allowed helpers: display formatters only.
- Disallowed helpers: storage read/clear, Supabase, service-role, audit writer
  route/writer imports.
- Risk: low if extraction is pure presentational.
- Priority: after settings mode panel or together with local viewer components.

### `components/execution/ExecutionRecordsPanel.tsx`

- Proposed props: existing `ExecutionRecordsPanel` props from settings usage.
- Callbacks: `onRefresh`, `onClear`.
- Allowed helpers: display formatters only.
- Disallowed helpers: storage read/clear, trade/history/stats mutation,
  Supabase, service-role, audit writer route/writer imports.
- Risk: low if extraction is pure presentational.
- Priority: after event log panel.

### `components/execution/DevMockBrokerResultsPanel.tsx`

- Proposed props: existing `DevMockBrokerResultsPanel` props from settings
  usage.
- Callbacks: `onRefresh`, `onClear`, `onCaptureComplete`.
- Allowed helpers: display formatting and mock-result presentation helpers.
- Disallowed helpers: real broker result capture, Supabase writes, trade
  mutation, audit writer route/writer imports.
- Risk: medium because it neighbors local capture behavior and execution record
  refresh.
- Priority: after local viewer extraction and tests.

## Dependency Map

- Lifecycle UI adapter: `buildExecutionLifecycleUiState(...)` feeds sandbox
  status surface; `buildExecutionLifecycleModalCopy(...)` feeds modal copy.
- Modal state helpers: `openExecutionModalState(...)` and
  `closeExecutionModalState()` feed sandbox/live preview open paths;
  `applyExecutionPrepareResult(...)` and `applyExecutionCaptureResult(...)`
  feed modal preparation/capture result state.
- Local storage helpers: event log, execution records, dev mock broker results,
  Avanza agent runs, safe browser action diagnostics, and smoke checklist state
  are local browser persistence surfaces.
- Settings persistence helpers: `getBrowserExecutionSettingsStorage()`,
  `readExecutionModePreference(...)`, and `writeExecutionModePreference(...)`
  own the `ture_execution_mode` seam.
- Execution orchestrator/result types: sandbox and live-position execution
  surfaces derive `ExecutionOrchestratorResult` through
  `runExecutionOrchestrator(...)`.
- Execution lifecycle state machine: modal dev flows call
  `transitionExecutionLifecycle(...)` for local lifecycle preview transitions.
- Dev/mock helpers: modal stub runners, localhost bridge preview hooks,
  Avanza dry-run request builders, and dev mock broker result stores power the
  diagnostics surfaces.
- Audit log/local records stores: browser-local event log and execution record
  stores are used for local diagnostics only.
- Settings state: execution mode and dev-tool store state are hydrated in
  `app/settings/page.tsx` and refreshed by explicit handlers.
- App-level state/effects: `app/trade-app.tsx` hydrates execution mode on
  startup and refreshes it on focus/storage events; settings page hydrates local
  execution stores on mount.

## Handler And Effect Coupling

- Blockers: automatic mode remains gated by
  `NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION === "true"` and current helper
  normalization; extraction must not create an automatic submit path.
- Hydration/refresh/persistence effects: trade app startup/focus/storage reads
  execution mode; settings startup reads execution local stores and settings;
  these effects should stay outside presentational components.
- Trade/stats/PnL handlers: live-position close/details behavior sits near the
  live execution status surface and must remain outside any audit/execution UI
  extraction unless separately approved.
- Prepare/capture/dev mock flows: modal handlers update local lifecycle,
  browser-local event log, and local execution record store only; they must not
  become live Supabase/broker/write-path calls.
- App-level handlers: settings refresh/clear/check/reset handlers own store
  reads, confirmations, async diagnostics, and messages; extracted panels
  should receive callbacks instead of importing stores directly.

## Safety Boundaries Per Extraction

- Keep browser/client components away from `server-only` modules, service-role
  adapters, audit writer routes, and runtime persistence modules.
- Keep all database, migration, typegen, generated type, and `.env.local`
  surfaces untouched during component extraction.
- Keep execution settings persistence behavior unchanged: same key, same
  default, same allowed values, same invalid/missing fallback, same no-reset
  behavior, and same automatic-mode lock.
- Keep local persistence viewers local-only; no Supabase read/write, no broad
  table dump, and no server audit writer invocation.
- Keep live-position extraction away from close-position, History, Statistics,
  and PnL mutation handlers.
- Keep dev/mock broker panels clearly mock/local-only; no real broker result,
  broker submission, Avanza browser action, or automatic mode enablement.
- Keep audit writer runtime persistence unchanged and server-only.

## Suggested Extraction Sequence

1. Action 925 - Add Execution UI Component Extraction Baseline Tests.
2. Action 926 - Extract Read-Only Execution Sandbox Fixture Card Component.
3. Action 927 - Extract Execution Handoff Preview Modal Component.
4. Action 928 - Extract Execution Settings Panel Component.
5. Action 929 - Extract Execution Local Persistence Viewer Components.
6. Action 930 - Create Execution UI Component Extraction Summary.

If baseline tests reveal a safer first seam, prefer the lower-risk seam. Based
on the current inventory, `ExecutionSandboxFixtureCard` is the first
recommended seam because it is local/dev-only, already helper-backed, has one
small local open/close state, and has no live-position close/statistics/PnL
handler adjacency.

## First Recommended Seam

First recommended seam: extract `ExecutionSandboxFixtureCard` from
`app/trade-app.tsx` into
`components/execution/ExecutionSandboxFixtureCard.tsx` after Action 925 adds
baseline coverage.

The extraction should preserve the current card copy, local-only badges,
orchestrator-derived status, lifecycle UI state adapter use, modal open/close
helper use, and conditional `ExecutionHandoffPreviewModal` rendering. It should
not move modal implementation logic yet.

## Risks

- `app/trade-app.tsx` is large, so extraction can accidentally disturb nearby
  imports, state, or JSX if not kept narrow.
- The modal has high coupling and should be protected by baseline tests before
  extraction.
- Live-position execution UI sits near real trade close/detail behavior and
  should not be extracted before its boundaries are locked.
- Settings execution mode copy is safety-sensitive because it explains
  automatic-mode lock semantics.
- Local persistence viewers are easy to make presentational, but their
  handlers must stay page-owned to preserve confirmation and local-only
  behavior.
- Audit writer runtime persistence is complete and server-only; any component
  extraction that imports audit writer modules would be a boundary regression.

## Result Status

`execution_ui_component_extraction_inventory_created`

## Recommended Next Action

Action 925 - Add Execution UI Component Extraction Baseline Tests.
# Action 931 Update - Live Position Execution UI Coupling Inventory

- Created `docs/live-position-execution-ui-coupling-inventory.md`.
- Documented the higher-risk live-position execution UI seams that were deferred
  from the Action 924 extraction inventory.
- Identified the first recommended live-position seam as a read-only live
  execution status surface extraction after baseline tests.
- Confirmed no runtime code, JSX, handlers, effects, state mutation, audit
  writer path, broker/Avanza behavior, automatic mode behavior, or data
  mutation changed.
- Status: `live_position_execution_ui_coupling_inventory_created`.
- Recommended next action: Action 932 - Add Live Position Execution UI Baseline
  Tests.

## Action 932 Update - Live Position Baseline Tests Added

- Added `tests/e2e/live-position-execution-ui-baseline.spec.ts` as the
  pre-extraction baseline for the first live-position seam.
- Confirmed the target extraction remains the read-only live execution status
  surface; close-modal mutation paths and handoff modal behavior remain
  parent-owned or already extracted.
- No runtime implementation, component extraction, audit writer, broker/Avanza,
  automatic mode, data mutation, migration, typegen, generated type edit, or
  `.env.local` change occurred.
- Status: `live_position_execution_ui_baseline_tests_added`.
- Recommended next action: Action 933 - Extract Read-Only Live Position
  Execution Status Surface.

## Action 933 Update - Live Position Status Surface Extracted

- Moved the read-only live-position execution status display into
  `components/execution/live-position-execution-status-surface.tsx`.
- The old `LiveExecutionStatusSurface` remains a compatibility wrapper for
  existing sandbox usage.
- Interactive live-position controls and mutation-adjacent paths remain
  unextracted.
- Status: `live_position_execution_status_surface_extracted`.
- Recommended next action: Action 934 - Extract Live Position Handoff
  CTA/Controls Surface.

## Action 934 Update - Live Position Handoff Controls Extracted

- Added `components/execution/live-position-handoff-controls.tsx` as the
  extracted live-position handoff CTA/control surface.
- The component owns only the `View handoff` button presentation,
  `event.stopPropagation()`, optional disabled state, optional label, and
  parent-provided callback invocation.
- `ActivePositionCard` remains responsible for visibility, modal state,
  callback definitions, lifecycle/orchestrator state, and mutation-adjacent
  behavior.
- Status: `live_position_handoff_controls_extracted`.
- Recommended next action: Action 935 - Create Live Position Execution UI
  Extraction Summary.

## Action 935 Update - Live Position Extraction Summary Created

- Created `docs/live-position-execution-ui-extraction-summary.md`.
- Recorded the current extracted live-position component map and remaining
  inline surfaces, including the full live-position panel and dev/mock controls.
- Status: `live_position_execution_ui_extraction_summary_created`.
- Recommended next action: Action 936 - Create Dev Mock Broker Controls
  Coupling Inventory.

## Action 936 Update - Dev Mock Broker Controls Inventory Created

- Created `docs/dev-mock-broker-controls-coupling-inventory.md`.
- Added the next extraction candidate to the inventory: the inline
  `DevMockBrokerResultsPanel` and `DevMockBrokerResultRow` in
  `app/settings/page.tsx`.
- Documented that baseline tests are required before extraction because row
  controls are local-mutation-adjacent and route-stub-adjacent.
- Status: `dev_mock_broker_controls_coupling_inventory_created`.
- Recommended next action: Action 937 - Add Dev Mock Broker Controls Baseline
  Tests.

## Action 937 Update - Dev Mock Broker Controls Baseline Tests Added

- Added tests locking current dev/mock broker panel copy, row details, local
  capture/stub boundaries, parent callbacks, helper wiring, and no-server-write
  boundaries.
- Extraction remains deferred.
- Status: `dev_mock_broker_controls_baseline_tests_added`.
- Recommended next action: Action 938 - Extract Dev Mock Broker Results Panel
  Component.
## Action 938 — Dev Mock Broker Results Panel Extraction

Status: `dev_mock_broker_results_panel_extracted`

- Extracted the Settings dev mock broker results panel and result row UI into
  `components/execution/execution-dev-mock-broker-results-panel.tsx`.
- Kept `app/settings/page.tsx` as the owner of dev mock broker result store
  state, visible result selection, latest timestamp, messages, refresh/clear
  callbacks, and capture-complete refresh callback.
- Preserved existing panel labels, row fields, local-only diagnostics copy,
  server capture route stub copy, and broker-result preview copy.
- Did not add audit writer route invocation, service-role code, Supabase table
  access, broker/Avanza behavior, automatic mode, migrations, type generation,
  generated type edits, or `.env.local` changes.
- Added extraction proof in
  `docs/dev-mock-broker-results-panel-extraction.md`.
- Recommended next action: Action 939 — Create Dev Mock Broker Controls
  Extraction Summary.
## Action 939 — Dev Mock Broker Controls Extraction Summary

Status: `dev_mock_broker_controls_extraction_summary_created`

- Created `docs/dev-mock-broker-controls-extraction-summary.md` as a
  documentation-only summary of Actions 936-938.
- Summarized the dev/mock broker controls coupling inventory, baseline tests,
  extracted panel/row component map, parent ownership, test coverage, safety
  boundaries, remaining gaps, and next refactor direction.
- Confirmed no runtime code, JSX, handlers, effects, state mutation, helper
  wiring, audit writer runtime path, rollout flags, broker/Avanza behavior,
  automatic mode behavior, migrations, type generation, generated types,
  live proof/query/insert, service-role adapter call, or `.env.local` changes
  were performed for Action 939.
- Recommended next action: Action 940 — Create Execution State/Effects
  Coupling Inventory.

