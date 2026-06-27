# Execution State/Effects Coupling Inventory

Action: 940
Status: execution_state_effects_coupling_inventory_created
Date: 2026-06-27

## Purpose

This inventory documents the current execution-related state, effects, and handler coupling before any hook/container extraction. It is documentation-only. No runtime code, handlers, effects, JSX, persistence helpers, audit writer path, rollout flag, route, Supabase access, migration, type generation, or `.env.local` value changed in this action.

## State Map

### Settings Execution Persistence And Diagnostics

File/location: `app/settings/page.tsx:1110-1315`

Owner: `SettingsPage`

Initial values:

- `executionMode` initializes from `readExecutionModePreference()`.
- `executionEventLog`, `executionRecordStore`, `avanzaAgentRunStore`, `devMockBrokerResultStore`, and `safeBrowserActionDiagnosticsStore` initialize from their settings-safe local persistence readers.
- Message state is initialized empty for each viewer/control group.
- Derived latest lists and timestamps are built with `useMemo` from the local read results.

Setter paths:

- `updateExecutionModePreference` writes through `writeExecutionModePreference`, then updates `executionMode` and `executionModeMessage`.
- `refreshExecutionEventLog`, `refreshExecutionRecords`, `refreshAvanzaAgentRuns`, `refreshDevMockBrokerResults`, and `refreshSafeBrowserActionDiagnostics` reread local stores.
- Clear handlers confirm with `window.confirm`, call the relevant local clear helper, then reread state.
- `refreshAfterDevMockBrokerCapture` refreshes execution records and execution events after a dev mock capture completes.

Read/render paths:

- `ExecutionSettingsPanel` renders the mode/authority selection.
- `ExecutionAuditLogViewer`, `ExecutionLocalRecordsViewer`, and the settings-local viewer sections render latest local diagnostics, records, runs, mock broker results, and safe browser action diagnostics.

Persistence relation: all execution-specific persistence in this cluster goes through client-safe local helper wrappers, not direct Supabase or service-role access.

Helper relation: `lib/execution-settings-persistence-helpers.ts` owns execution mode local storage semantics; `lib/execution-local-storage-helpers.ts` owns execution event, record, agent-run, mock-result, and safe-action diagnostics storage.

Risk: medium. These handlers can clear browser-local execution diagnostics, so extraction should preserve confirmation prompts, reread behavior, and message wording.

### Settings Dev/Bridge/Smoke Controls

File/location: `app/settings/page.tsx:1171-1188`, `app/settings/page.tsx:1510-1696`

Owner: `SettingsPage`

Initial values:

- Avanza bridge health/config, localhost bridge diagnostics, execution sandbox smoke checklist, and dev-only stub result state initialize from safe local/default helpers.

Setter paths:

- Health checks set pending flags and diagnostic messages.
- Bridge/checklist updates write local helper state and update local messages.
- Clear/reset handlers confirm before deleting local diagnostics.

Read/render paths:

- Settings diagnostics sections render bridge health, local checklist status, stub outputs, and dev mock broker results.

Persistence relation: browser-local diagnostics only.

Helper relation: bridge/checklist helpers wrap local storage and default-state construction.

Risk: medium. Dev diagnostics touch local browser state and route-adjacent stubs; keep extraction explicitly dev-only.

### Trade App Core Runtime State

File/location: `app/trade-app.tsx:8080-8338`

Owner: `TradeApp`

Initial values:

- Selection/form state covers selected recommendation/position, entry/position/exit form values, validation status/result/message, loading/saving/updating flags, active tab refresh state, market status, risk controls, execution mode preference, recommendation persistence diagnostics, and position-update tracking refs.
- `selectedExecutionMode` initializes from `readExecutionModePreferenceForTradeApp()`.

Setter paths:

- `loadTradeData`, `refreshIslands`, `refreshCurrentSurface`, `updatePositions`, recommendation validation/update handlers, trade creation/close handlers, and focus/interval effects update this cluster.

Read/render paths:

- The main tab surfaces, recommendation cards, active position cards, trade modals, close-position modals, live position surfaces, and extracted execution components read this state through props or local derived values.

Persistence relation: mixed. Some values are in-memory, some are browser-local preferences, and trade/position data is mutation-adjacent through app actions and APIs outside this documentation action.

Helper relation: execution mode uses the settings persistence helper. Risk controls, paper-session/runbook/provider/dev-preview state use their own existing local helpers.

Risk: high. This is the broadest state owner and includes trade/position/PnL mutation-adjacent handlers. Do not start extraction here before baseline tests.

### Execution Modal State

File/location: `lib/execution-modal-state-helpers.ts:117-296`, `components/execution/execution-handoff-preview-modal.tsx:365-1863`, `app/trade-app.tsx:30021-30411`

Owner: modal state is modeled by `ExecutionModalState` helpers; the modal component currently owns prepare/capture helper calls for the extracted preview, while sandbox/live surfaces own open/close booleans and selected handoff/result values through helper calls.

Initial values:

- Closed state is created with `createClosedExecutionModalState()`.
- Open state is created with `openExecutionModalState(...)`.

Setter paths:

- Close flows call `closeExecutionModalState()`.
- Prepare/capture result flows call `applyExecutionPrepareResult(...)` and `applyExecutionCaptureResult(...)`.

Read/render paths:

- `ExecutionHandoffPreviewModal` renders selected result, selected handoff, local lifecycle, prepare/capture lifecycle, warnings, and debug summaries.
- `ExecutionSandboxFixtureCard` and `ActivePositionCard` pass opened state into the modal.

Persistence relation: no direct database persistence. Some prepare/capture paths may append browser-local execution diagnostics through existing helper paths.

Helper relation: modal state helpers centralize lifecycle transitions and debug summary construction.

Risk: medium. The helper seam is already present, so it is the safest first extraction target after baseline tests.

### Live Position Execution State

File/location: `app/trade-app.tsx:30135-30411`, `components/execution/live-position-execution-status-surface.tsx:9-69`, `components/execution/live-position-handoff-controls.tsx:1-11`

Owner: `ActivePositionCard`

Initial values:

- `eodRiskAcknowledged`, `isDetailsOpen`, and `isExecutionPreviewOpen` initialize locally.
- Live handoff/orchestrator results are derived from the active position, latest update, market status, execution mode, and UI adapter output.

Setter paths:

- Open/close preview handlers use modal state helpers.
- Acknowledge/details controls update local booleans.

Read/render paths:

- `LivePositionExecutionStatusSurface` renders read-only lifecycle/status details.
- `LivePositionHandoffControls` renders the handoff CTA/control boundary.
- `ExecutionHandoffPreviewModal` renders the selected live position handoff preview.

Persistence relation: no direct persistence in the extracted status/control components. The live position card remains adjacent to close-position and position update flows.

Helper relation: lifecycle UI state adapter and modal helpers are the primary seams.

Risk: medium-high. The UI is read-only, but it sits beside live position mutation paths; extract only after modal/local settings seams are covered.

### Prepare/Capture And Trade Creation Modal State

File/location: `app/trade-app.tsx:24570-25270`, `app/trade-app.tsx:25505-25680`

Owner: `AddTradeModal`

Initial values:

- Handoff status, broker confirmation booleans, order status, fill inputs, broker reference, preview costs, warning fields, dry-run result, mock fill JSON/import result, payload clock, generated-event refs, manual Avanza notes, payload creation timestamp, and handoff session id initialize inside the modal.

Setter paths:

- Field handlers update broker-confirmation and fill inputs.
- Prepare/dry-run and mock import/capture handlers update diagnostics and local capture state.
- `handleTradeSubmit` is the mutation-adjacent boundary for creating a live day trade after manual confirmation gates.

Read/render paths:

- Modal sections render generated payloads, readiness, hard-stop contract, form mapping, fill capture review, policy, and create-trade controls.

Persistence relation: generated diagnostics can append local execution events; create submit can affect trade/position/history/PnL through existing approved app behavior.

Helper relation: many pure builders produce payload, readiness, hard-stop, handoff, fill review, and risk control outputs. Local storage event logging still occurs in effects.

Risk: high. This cluster should not be refactored before modal helper and baseline test coverage because it mixes UI state, local diagnostics, and create-trade mutation adjacency.

### Close Position Modal State

File/location: `app/trade-app.tsx:30904-31624`

Owner: `ClosePositionModal`

Initial values:

- Copy statuses, actual sold shares, broker reference, commission/fx fee, manual confirmation booleans, confirmation message, mock exit fill JSON/import result, payload clock/timestamp, and manual notes initialize locally.

Setter paths:

- Manual confirmation and broker-plan match handlers update close handoff state.
- Capture/import handlers update local diagnostics.
- `handleCloseSubmit` is the close-position mutation-adjacent boundary.

Read/render paths:

- Close modal renders sell payloads, field verification, completion policy, and close-position controls.

Persistence relation: local diagnostic event logging plus existing close-position mutation behavior.

Helper relation: pure builders and local persistence helpers.

Risk: high. Keep this behind baseline tests and avoid early extraction.

## Effect Map

### Settings Initial Hydration

File/location: `app/settings/page.tsx:1374-1391`

Dependencies: `[]`

Reads: local execution event log, execution records, Avanza agent runs, dev mock broker results, safe browser action diagnostics, bridge config, smoke checklist, settings rows, automation runs.

Writes: local React state for the settings page.

Side effects: delayed `window.setTimeout`, local storage reads, settings/automation load calls.

Cleanup: `window.clearTimeout(timer)`.

Risk: medium. Keep delayed hydration semantics unchanged when extracting settings state.

### Settings Browser-Agent Plan Logging

File/location: `app/settings/page.tsx:1394-1403`

Dependencies: `[browserAgentPlan]`

Reads: generated browser-agent plan and once-only ref.

Writes: once-only ref.

Side effects: local prototype plan event logging.

Cleanup: none.

Risk: low-medium. Once-only logging should remain outside generic local viewer hooks unless explicitly tested.

### Trade App Initial Hydration

File/location: `app/trade-app.tsx:9087-9120`

Dependencies: `[]`

Reads: broker cost model, risk controls, execution mode preference, paper session protocol, live market runbook, provider plan hint, dev preview preference, demo action, recommendation snapshots/runs/batches/outcomes, and trade data.

Writes: many `TradeApp` state variables and loaded refs.

Side effects: delayed `window.setTimeout`, local storage reads, initial trade data load.

Cleanup: `window.clearTimeout(timer)`.

Risk: high. This effect is broad and should be split only after baseline tests.

### Trade App Execution Mode Sync

File/location: `app/trade-app.tsx:9121-9134`

Dependencies: `[]`

Reads: execution mode local preference.

Writes: `selectedExecutionMode`.

Side effects: `window` focus and storage listeners.

Cleanup: removes both listeners.

Risk: medium. Candidate for a settings/preference hook after tests.

### Trade App Local Preference Persistence Effects

File/location: `app/trade-app.tsx:9135-9177`

Dependencies: paper session protocol, live market trial runbook, provider plan hint, dev preview preference.

Reads: loaded refs and local preference state.

Writes: local storage through existing helper/direct local storage paths.

Side effects: browser-local persistence only.

Cleanup: none.

Risk: medium. Preserve loaded-ref guards to avoid overwriting storage before hydration.

### Trade App Clock, Visibility, Focus, And Auto Refresh

File/location: `app/trade-app.tsx:9178-9445`

Dependencies: current time, loading/updating flags, active tab, active position count, market status, visibility, latest position updates.

Reads: document visibility, recommendations, latest position updates, market status, active positions, refresh refs.

Writes: current time, document visibility, previous update refs, refresh/update state through ref callbacks.

Side effects: intervals, focus listener, visibility listener, notification sounds, auto refresh calls.

Cleanup: clears intervals and removes listeners.

Risk: high. This cluster is refresh and mutation-adjacent; refactor only after strong baseline tests.

### Add Trade Modal Generated Diagnostics Effects

File/location: `app/trade-app.tsx:25039-25254`

Dependencies: generated payloads, hard-stop contract, agent command, form mapping, handoff progress, fill capture spec, completion policy, field verification, risk controls evaluation, payload clock.

Reads: generated modal artifacts and once-only/dedupe refs.

Writes: dedupe refs, payload clock.

Side effects: local execution diagnostic logging and a one-second interval.

Cleanup: interval cleanup for payload clock.

Risk: high. This is noisy local diagnostic logging next to create-trade state.

## Handler Map

### Settings Refresh/Clear Handlers

File/location: `app/settings/page.tsx:1436-1496`, `app/settings/page.tsx:1634-1696`

Inputs: button clicks.

State read/write: reads local helper results; writes viewer state and messages.

Helper/store calls: `read*ForSettings`, `clearExecutionAuditEvents`, `clearExecutionRecords`, `clearAvanzaAgentRuns`, `clearDevMockBrokerResults`, `clearSafeBrowserActionDiagnostics`.

Side effects: confirmation prompts and browser-local clears.

Parent/child boundary: parent passes callbacks into extracted viewer components.

Risk: medium.

### Settings Execution Mode Handler

File/location: `app/settings/page.tsx:1415-1434`

Inputs: selected `ExecutionMode`.

State read/write: reads automatic-mode feature gate; writes execution mode and status message.

Helper/store calls: `writeExecutionModePreference`.

Side effects: browser-local preference write.

Parent/child boundary: passed to `ExecutionSettingsPanel`.

Risk: medium.

### Modal Open/Close Handlers

File/location: `components/execution/execution-sandbox-fixture-card.tsx:101-104`, `app/trade-app.tsx:30180-30186`

Inputs: explicit preview open/close clicks.

State read/write: writes local modal open state.

Helper/store calls: `closeExecutionModalState`, `openExecutionModalState`.

Side effects: none beyond React state.

Parent/child boundary: component-local handlers pass state into `ExecutionHandoffPreviewModal`.

Risk: low-medium.

### Prepare/Capture Result Handlers

File/location: `components/execution/execution-handoff-preview-modal.tsx:1372-1863`

Inputs: explicit prepare/capture actions in the preview modal.

State read/write: reads current modal state and writes prepared/captured modal state.

Helper/store calls: `applyExecutionPrepareResult`, `applyExecutionCaptureResult`.

Side effects: existing local diagnostics/capture behavior through already-approved helper paths.

Parent/child boundary: modal-local handler boundary.

Risk: medium.

### Dev Mock Broker Result Panel Handlers

File/location: `components/execution/execution-dev-mock-broker-results-panel.tsx`

Inputs: explicit row-level diagnostics/capture controls.

State read/write: component-local pending/result state and parent refresh callback.

Helper/store calls: dev mock broker result capture/stub helpers already isolated in the extracted component.

Side effects: browser-local diagnostics and dev-only route/stub behavior as previously documented.

Parent/child boundary: parent supplies read results and `onCaptureComplete`.

Risk: medium.

### Trade/Position/PnL Mutation-Adjacent Handlers

File/location: `app/trade-app.tsx:9448-9826`, `app/trade-app.tsx:25505-25680`, `app/trade-app.tsx:31481-31624`

Inputs: recommendation updates, position updates, add-trade submit, close-position submit, demo clear buttons.

State read/write: broad `TradeApp`, add-modal, and close-modal state.

Helper/store calls: trade/position/risk/persistence helpers and existing app APIs.

Side effects: trade/position/history/statistics/PnL mutation-adjacent behavior.

Parent/child boundary: modal submit callbacks cross from local modal state to parent runtime mutations.

Risk: high. Do not change in the first extraction seam.

## Dependency Graph

- `app/settings/page.tsx` owns settings-local execution persistence state and renders extracted settings/viewer components.
- `app/settings/page.tsx` depends on `lib/execution-settings-persistence-helpers.ts` and `lib/execution-local-storage-helpers.ts` for client-safe local storage.
- `app/trade-app.tsx` owns the broad runtime state graph, refresh effects, trade/position mutation-adjacent handlers, and live position execution UI composition.
- `app/trade-app.tsx` depends on `lib/execution-lifecycle-ui-state-adapter.ts` for read-only lifecycle copy/status derivation.
- `ExecutionHandoffPreviewModal`, `ExecutionSandboxFixtureCard`, and `ActivePositionCard` depend on `lib/execution-modal-state-helpers.ts`.
- Extracted `components/execution/*` components are mostly presentation/callback boundaries and should stay free of service-role, server-only, Supabase, and audit writer route imports.

## Safe Refactor Seams

1. Action 941 - Add Execution State/Effects Baseline Tests.
2. Action 942 - Extract Execution Modal State Container Hook.
3. Action 943 - Extract Execution Local Persistence Viewer State Hook.
4. Action 944 - Extract Execution Settings State Hook.
5. Action 945 - Extract Execution Live Position Handoff State Hook.
6. Action 946 - Create Execution State/Effects Refactor Summary.

Preferred ordering: modal/local persistence before live-position mutation-adjacent state. Modal helper seams already exist and can be covered with focused tests. Local persistence viewers have clear callback boundaries. Live position and trade/position/PnL mutation-adjacent areas should wait until test coverage is stronger.

## First Recommended Seam

Recommended next action: Action 941 - Add Execution State/Effects Baseline Tests.

Recommended implementation seam after tests: Action 942 - Extract Execution Modal State Container Hook.

Reason: modal state already has pure helper boundaries, explicit open/close/prepare/capture transitions, and a bounded render surface. Extracting it first reduces duplication and state sprawl without touching trade/position/PnL mutation-adjacent submit paths.

## Safety Boundaries

- This inventory is not a runtime implementation.
- This inventory is not a server-only audit writer change.
- This inventory is not a route, route call, live proof, live insert, Supabase query, remote SQL, migration, type generation, generated type edit, or `.env.local` edit.
- No service-role value is read or exposed.
- No browser/client path may import the audit writer, lifecycle hook/caller, service-role adapter, runtime proof harness, monitoring implementation, cleanup/backout tool, or rollout internals.
- Automatic mode, market-loop/scanner automation, broker/Avanza behavior, trade/stats/PnL mutation from audit writer, and production rollout remain out of scope.

## Risks

- `app/trade-app.tsx` still contains broad state/effect coupling and many refresh/mutation-adjacent handlers.
- Add/close modal generated diagnostics effects are numerous and can regress if dedupe refs or payload clocks are moved without tests.
- Settings local clear handlers are simple but destructive to browser-local diagnostics; confirmation and reread behavior need baseline coverage.
- Live position execution UI is read-only but sits near live close-position flows.
- Refresh/visibility/focus effects are timer/listener-heavy and should not be split without verifying cleanup behavior.

## Result

Result status: execution_state_effects_coupling_inventory_created

Recommended next action: Action 941 - Add Execution State/Effects Baseline Tests.

## Validation

- Runtime import checks: `node --check scripts/verify-audit-table-anon-denial.mjs` and `node --check scripts/verify-audit-table-authenticated-denial.mjs` passed.
- Audit writer runtime path import search across `app/trade-app.tsx`, `app/settings/page.tsx`, `components`, and `hooks` found no imports or calls to the audit writer route/path.
- `NEXT_PUBLIC_*SERVICE*`/service-role exposure scan found no exposure.
- Route invocation and automatic/broker/Avanza scans only returned existing guardrail or historical preview text; Action 940 added no runtime invocation path.
- State/effects boundary scan confirmed the inventory documents existing browser-local `window`/`localStorage` and app Supabase usage; Action 940 introduced no code usage.
- `git diff --check` passed.
- Touched-file trailing whitespace scan passed.
- `find docs -type f -size 0` passed with no output.
- `.env.local` diff check passed with no output.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed; ESLint emitted the existing Babel code generator deopt note for the large `app/trade-app.tsx`.

## Action 941 Follow-Up

- Result status: `execution_state_effects_baseline_tests_added`.
- Added `tests/e2e/execution-state-effects-baseline.spec.ts`.
- Added `docs/execution-state-effects-baseline-tests.md`.
- The new baseline locks modal state container behavior, prepare/capture adjacency, local persistence viewer callback boundaries, settings persistence boundaries, live-position execution UI callback/read-only boundaries, and client-safe safety boundaries before Action 942.
- No runtime behavior, handlers, effects, JSX, component extraction, hook extraction, reducer extraction, audit writer path, route/fetch path, broker/Avanza behavior, automatic mode behavior, Supabase access, migration, type generation, generated type edit, or `.env.local` edit was performed.
- Recommended next action: Action 942 - Extract Execution Modal State Container Hook.

## Action 942 Follow-Up

- Result status: `execution_modal_state_container_hook_extracted`.
- Added `hooks/execution/useExecutionModalState.ts` as the first state/effects
  extraction seam, limited to modal visibility and selected execution preview
  state.
- Sandbox and live-position open paths now consume the hook while
  prepare/capture logic, lifecycle/orchestrator state, local/settings
  persistence, effects, and mutation-adjacent callbacks remain parent-owned.
- No reducer, JSX movement, component extraction, audit writer path, route/fetch
  path, Supabase access, broker/Avanza behavior, automatic mode behavior,
  migration, type generation, generated type edit, or `.env.local` edit was
  performed.
- Recommended next action: Action 943 - Extract Execution Local Persistence
  Viewer State Hook.

## Action 943 Follow-Up

- Result status: `execution_local_persistence_viewer_state_hook_extracted`.
- Added `hooks/execution/useExecutionLocalPersistenceViewers.ts` as the second
  state/effects extraction seam, limited to local execution event log, local
  execution records, and dev mock broker result viewer state.
- Settings persistence, Avanza agent run state, safe browser diagnostics,
  lifecycle/orchestrator state, modal state, effects outside the named local
  viewer seam, and mutation-adjacent callbacks remain outside the hook.
- No storage key/shape change, JSX movement, component extraction, audit writer
  path, route/fetch path, Supabase access, broker/Avanza behavior, automatic
  mode behavior, migration, type generation, generated type edit, or
  `.env.local` edit was performed.
- Recommended next action: Action 944 - Extract Execution Settings State Hook.

## Action 944 Follow-Up

- Result status: `execution_settings_state_hook_extracted`.
- The execution settings state seam now lives in
  `hooks/execution/useExecutionSettingsState.ts`.
- `app/settings/page.tsx` still owns Settings composition and adjacent settings
  concerns, while execution mode state/read/write/gating/messaging belongs to
  the hook.
- Recommended next action: Action 945 - Extract Execution Live Position
  Handoff State Hook.

## Action 945 Follow-Up

- Result status: `execution_live_position_handoff_state_hook_extracted`.
- The live-position handoff state seam now lives in
  `hooks/execution/useExecutionLivePositionHandoffState.ts`.
- `app/trade-app.tsx` still owns live-position mutation-adjacent callbacks,
  close-position flows, details state, EOD acknowledgement, PnL/risk display,
  and side effects.
- Recommended next action: Action 946 - Create Execution State/Effects Refactor
  Summary.

## Action 946 Follow-Up

- Result status: `execution_state_effects_refactor_summary_created`.
- Created `docs/execution-state-effects-refactor-summary.md`.
- The Action 940-945 inventory, baseline, hook map, parent ownership, safety
  boundaries, and remaining gaps are now consolidated.
- Recommended next action: Action 947 - Create Final Execution Refactor
  Handoff Summary.

## Action 947 Final Handoff Link

- Result status: `final_execution_refactor_handoff_summary_created`.
- Created `docs/final-execution-refactor-handoff-summary.md`.
- This inventory now feeds the final handoff's deferred-seams and parent-owned
  boundary sections; no runtime code changed in Action 947.
- Recommended next action: Action 948 - Final Repo Safety Sweep and Dead-Doc
  Link Check.
