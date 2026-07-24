# Execution Lifecycle UI/State Coupling Inventory

## Action 903 Modal Helper Implementation Update

Action 903 implemented the planned client-safe helper boundary for modal-local
state. The inventory remains valid because `app/trade-app.tsx` still owns the
runtime modal state and no production UI wiring was performed.

Status:
`execution_modal_state_helpers_implemented_client_safe`

Recommended next action: Action 904 - Wire Modal Helpers Into Close/Reset Path.

## Action 902 Modal State Baseline Tests Update

Action 902 added fixture-local modal state baseline tests and source
characterization for the currently inline modal state cluster. No coupling was
moved yet.

Status:
`execution_modal_state_baseline_tests_added`

Recommended next action: Action 903 - Implement Execution Modal State Helpers.

## Action 901 Modal State Helper Plan Update

Action 901 converts the remaining modal state coupling into a staged extraction
plan. Modal open/close state, selected payload/handoff state, prepare/capture
status, dev/mock capture state, adapter modal copy, and local event-log
coupling remain unmodified until baseline tests are added.

Status:
`execution_modal_state_helper_extraction_plan_created`

Recommended next action: Action 902 - Add Execution Modal State Baseline Tests.

## Action 900 Integration Summary Update

Action 900 summarizes the reduced coupling from Actions 895-899 and keeps the
remaining coupling explicit: live position status display, modal
handlers/effects, preparation/capture controls, local event-log/localStorage,
and component extraction remain separate future work.

Status:
`execution_lifecycle_ui_state_adapter_integration_summary_created`

Recommended next action: Action 901 - Create Execution Modal State Helper
Extraction Plan.

## Action 899 Duplication Removal Update

One duplicated inline mapping was removed from the sandbox fixture card. The
adapter now owns the status-surface shape for that approved read-only surface.

Remaining coupling is intentionally unchanged: live position status display,
modal handlers/effects, preparation/capture controls, local event-log/
localStorage behavior, and audit writer runtime persistence.

Status:
`execution_lifecycle_ui_state_adapter_duplicated_inline_logic_removed`

Recommended next action: Action 900 - Create Execution Lifecycle UI Adapter
Integration Summary.

## Action 898 Modal Copy Expansion Update

One modal copy/readiness coupling item has been reduced:
`ExecutionHandoffPreviewModal` core summary copy now uses adapter output for
the selected status label/title/description seam.

Remaining coupling is intentionally unchanged: modal handlers/effects,
preparation/capture controls, local event-log/localStorage behavior, and audit
writer runtime persistence are not modified by this action.

Status:
`execution_lifecycle_ui_state_adapter_modal_copy_wired_one_surface`

Recommended next action: Action 899 - Remove Duplicated Inline Derived UI
Logic.

## Action 897 Read-Only Wiring Update

One read-only coupling item has been reduced: the sandbox fixture card status
display now uses the adapter output for preserved status display fields.

Remaining coupling is intentionally unchanged: live position status display,
modal copy, lifecycle handlers/effects, local event-log/localStorage behavior,
and audit writer runtime persistence are not modified by this action.

Status:
`execution_lifecycle_ui_state_adapter_wired_one_read_only_surface`

Recommended next action: Action 898 - Expand Adapter Coverage To Modal Copy.

## Action 896 Adapter Implementation Update

Action 896 implemented the client-safe execution lifecycle UI state adapter at
`lib/execution-lifecycle-ui-state-adapter.ts`.

The adapter now owns pure labels, severity, CTA metadata, disabled reasons,
manual-confirmation CTA split, readiness hints, summary rows, and debug-safe
metadata. It is not yet broadly wired into `app/trade-app.tsx`; Action 897 is
the next scoped wiring step.

Status:
`execution_lifecycle_ui_state_adapter_implemented_client_safe`

Recommended next action: Action 897 - Wire Adapter Into One Read-Only UI
Surface.

## Action 895 Baseline Test Update

Action 895 added baseline tests for current importable execution lifecycle
UI-derived state before the future adapter extraction.

Coverage now locks labels, severity, CTA metadata, enabled/disabled state,
blocked reasons, readiness copy exposed through pure status helpers, debug-safe
status shape, client-safe helper imports, and lifecycle state-machine
semantics. Full modal-local copy and local event-log display composition remain
documented as extraction-time gaps.

Status:
`execution_lifecycle_ui_state_baseline_tests_added`

Recommended next action: Action 896 - Implement Execution Lifecycle UI State
Adapter.

## Action 894 Refactor Plan Update

Action 894 created
`docs/execution-lifecycle-state-adapter-refactor-plan.md` as the
documentation-only plan for extracting a client-safe execution lifecycle state
adapter/view-model.

The plan uses this inventory as its baseline and preserves the same boundaries:
no runtime code changes, no state/effect changes, no audit writer path changes,
no rollout flag changes, no database/query/live proof work, no broker/Avanza
behavior, no automatic mode enablement, and no `.env.local` changes.

Status:
`execution_lifecycle_state_adapter_refactor_plan_created`

Recommended next action: Action 895 - Add Execution Lifecycle UI State Baseline
Tests.

## 1. Purpose

Action 893 inventories execution lifecycle UI/state coupling before any
refactor.

This is documentation-only. It does not modify runtime code, extract
components/helpers, change state behavior, change effects, change the audit
writer runtime persistence path, change rollout flags, add client/browser/UI
audit writer invocation, add market-loop/scanner audit invocation, add
broker/Avanza behavior, enable automatic mode, mutate trades/stats/PnL, run a
live proof, run a live insert, run select/query/remote SQL, call the
service-role adapter, perform cleanup/backout, run migrations, run type
generation, edit generated types, modify `.env.local`, or print service-role
values.

## 2. Files Inspected

Primary files inspected:

- `app/trade-app.tsx`
- `lib/execution-state-machine.ts`
- `lib/execution-event-log.ts`
- `lib/execution-ui-status.ts`
- `lib/execution-orchestrator.ts`
- `lib/server/execution-lifecycle-transition-service.ts`
- `lib/server/execution-record-audit-writer-lifecycle-caller.ts`
- `lib/server/execution-record-audit-writer-lifecycle-hook.ts`

Related UI files inspected through import/search context:

- `components/live-day-trades/LiveExecutionStatusSurface.tsx`
- `components/live-day-trades/LiveDayTradeCardBody.tsx`
- `components/execution/ExecutionHandoffModalComposition.tsx`
- `components/execution/ExecutionLifecycleStatusPanel.tsx`
- `components/execution/AgentProgressStubPanel.tsx`
- `hooks/execution/useLocalhostBridgeControlsState.ts`
- `hooks/execution/useEarlyPhasePreviewState.ts`
- `hooks/execution/useMiddlePhasePreviewState.ts`
- `hooks/execution/useLatePhasePreviewState.ts`
- `hooks/execution/useAvanzaReadinessState.ts`

Relevant test surfaces identified but not edited:

- `tests/e2e/execution-lifecycle-transition-service.spec.ts`
- `tests/e2e/execution-record-audit-writer-lifecycle-caller.spec.ts`
- `tests/e2e/execution-record-audit-writer-lifecycle-hook.spec.ts`
- `tests/e2e/execution-record-audit-writer-runtime-persistence-rollout.spec.ts`
- existing execution modal, preview, and audit-writer boundary tests.

## 3. Current Lifecycle Concepts

Lifecycle states are defined in `lib/execution-state-machine.ts`:

- `idle`
- `intent_created`
- `candidate_selected`
- `handoff_created`
- `broker_order_preparing`
- `waiting_for_manual_confirmation`
- `broker_order_submitting`
- `broker_result_captured`
- `completed`
- `failed`
- `cancelled`
- `unknown`

Transition actions are defined as lifecycle event types:

- `create_intent`
- `select_candidate`
- `create_handoff`
- `start_broker_preparation`
- `wait_for_manual_confirmation`
- `submit_broker_order`
- `capture_broker_result`
- `complete_execution`
- `fail_execution`
- `cancel_execution`
- `mark_unknown`

Current UI lifecycle state is mostly local to `ExecutionHandoffPreviewModal`.
That modal receives an orchestrator result, initializes `localLifecycle` from
`result.lifecycle`, then mutates it through local dev preparation/progress/
capture actions.

Execution status display state is derived in `lib/execution-ui-status.ts` from
either an orchestrator result or a lifecycle snapshot. Display concepts include
severity, badge tone, label, title, description, CTA type, CTA label, action,
mode, trigger type, ticker, prepare ability, final-submit ability, and blocked
reason.

Modal states include:

- fixture-card execution preview open/closed;
- live-position execution preview open/closed;
- handoff modal local lifecycle snapshot;
- handoff modal capture base lifecycle;
- preparation stub message/error;
- local diagnostics runner state;
- broker capture stub state;
- agent progress stub state.

Settings/debug state includes the selected execution mode and execution dev
tools visibility. `selectedExecutionMode` is loaded from local preference state,
refreshed on focus/storage events, and passed into fixture/live execution
orchestrator calls.

Audit writer boundary relationship:

- Client UI uses the pure lifecycle state machine and local event log.
- The rolled-out server-only audit writer path starts at
  `lib/server/execution-lifecycle-transition-service.ts`.
- `app/trade-app.tsx`, client components, and hooks must not import the
  server-only lifecycle caller/hook/production write-path/service-role adapter.
- The server-only path remains the completed audit persistence dependency, not
  a UI refactor target.

Local storage/event-log relationship:

- `lib/execution-event-log.ts` writes local execution audit events to
  `ture_execution_event_log_v1`.
- Handoff modal dev actions append local audit events for progress,
  preparation, and capture stub flows.
- This local event log is separate from `public.execution_record_audit_events`.

## 4. State Reads

Lifecycle/execution state is read in these main places:

- `ExecutionSandboxFixtureCard`:
  - builds an orchestrator result from local fixture positions;
  - derives `uiStatus` with `buildExecutionUiStatusFromOrchestratorResult`;
  - displays `LiveExecutionStatusSurface`;
  - opens `ExecutionHandoffPreviewModal` with the orchestrator lifecycle.
- `ActivePositionCard`:
  - builds live sell guidance and a live execution orchestrator result when a
    real long position has enough current price/target/stop/quantity data;
  - derives `liveExecutionStatus`;
  - displays `LiveExecutionStatusSurface`;
  - opens `ExecutionHandoffPreviewModal` for the selected live execution.
- `ExecutionHandoffPreviewModal`:
  - reads `result.lifecycle`, `result.selectedIntent`, `result.handoff`, and
    `status`;
  - reads `localLifecycle.currentState` for current label, tone, preparation
    gating, capture gating, progress display, and readiness messages;
  - reads `captureBaseLifecycle` to decide whether capture should use the
    latest preparation transition snapshot or the current local lifecycle;
  - reads dev-tool and local preview state from extracted execution hooks.
- `ExecutionHandoffModalComposition` and panels:
  - receive lifecycle labels, tones, messages, enabled/disabled flags, and
    callback props from the modal;
  - render lifecycle status, readiness, agent progress, bridge previews,
    broker capture stub, and execution-record dry-run previews.
- Settings/debug surfaces:
  - read selected execution mode and execution dev-tool availability to decide
    which fixture and preview behaviors are visible.
- Derived labels/severity/CTA:
  - come from `buildExecutionUiStatusFromOrchestratorResult`,
    `buildExecutionUiStatusFromLifecycle`, and
    `getExecutionLifecycleDisplayLabel`.

## 5. State Writes And Mutations

Lifecycle/execution state is changed in these places:

- `selectedExecutionMode`:
  - initialized from execution mode preference;
  - refreshed on focus and storage events;
  - passed into sandbox/live orchestrator calls.
- Fixture/live preview open state:
  - `ExecutionSandboxFixtureCard` owns `isExecutionPreviewOpen`;
  - `ActivePositionCard` owns `isExecutionPreviewOpen`.
- `ExecutionHandoffPreviewModal` local state:
  - `setLocalLifecycle` updates local lifecycle snapshots after mapped progress,
    preparation, and capture transitions;
  - `setCaptureBaseLifecycle` stores the preparation follow-up snapshot for
    later broker-result capture;
  - preparation runner state setters update local messages/errors/results;
  - broker capture stub setters update local placeholder broker result fields;
  - agent progress setters update local progress timeline and messages.
- Lifecycle transition calls:
  - orchestrator initialization uses `transitionExecutionLifecycle` to create
    intent, select candidate, and create handoff;
  - modal preparation/progress/capture handlers call
    `transitionExecutionLifecycle` for local UI/dev lifecycle progression;
  - server-only audit persistence uses `transitionExecutionLifecycleOnServer`
    and `transitionExecutionLifecycleAndAppendAuditEvent`, but that path is not
    called from UI code.
- Local audit/event writes:
  - `appendExecutionAuditEvents` writes local UI/dev audit events to
    localStorage;
  - `buildExecutionAuditEventFromLifecycleEvent` maps local lifecycle events to
    local execution audit events;
  - `createExecutionAuditEvent` creates local stub/progress/capture events.
- Dev/test capture actions:
  - preparation stub can move the lifecycle toward broker preparation/manual
    confirmation;
  - agent progress stubs can apply mapped lifecycle transitions;
  - broker capture stub can create a local execution record preview/store entry
    and then move lifecycle through broker result captured and terminal states.
- Mock/dev broker updates:
  - modal-local capture stubs create local placeholder broker result data;
  - these are explicitly local/dev and are not approved broker/Avanza behavior.

## 6. Effects And Side Effects

Effects tied to lifecycle/execution state include:

- initial boot effect in `TradeApp`:
  - reads execution mode preference and other local preferences;
  - calls initial data load;
  - sets `selectedExecutionMode`.
- focus/storage preference effect:
  - refreshes `selectedExecutionMode` on browser focus and storage events.
- `ExecutionHandoffPreviewModal` escape-key effect:
  - closes the modal on Escape.
- extracted execution preview hooks:
  - maintain local dev preview state for bridge controls and early/middle/late
    phase previews.
- local event-log writes:
  - append progress, preparation, capture, and lifecycle-mapped events to
    `ture_execution_event_log_v1`.
- local execution record preview/store writes:
  - broker capture stub can call local record store helpers for dev preview
    only.
- auto-refresh and persistence effects in `TradeApp` are broad and not specific
  to lifecycle state, but they share the same parent component and contribute
  to extraction risk.

Audit writer calls:

- no client/UI audit writer call was found;
- no route invocation from normal UI was added;
- no service-role adapter call occurs in UI;
- the server-only lifecycle transition boundary remains separate.

## 7. Derived Adapters And Helpers

Current derived helpers include:

- `lib/execution-state-machine.ts`:
  - lifecycle state/event types;
  - transition map;
  - terminal/manual-confirmation helpers;
  - display label helper;
  - pure transition function.
- `lib/execution-orchestrator.ts`:
  - builds live exit intents;
  - selects the next execution intent;
  - creates Avanza handoff;
  - creates initial lifecycle snapshot and initial transition sequence.
- `lib/execution-ui-status.ts`:
  - maps orchestrator and lifecycle state into visible UI status surfaces;
  - maps trigger labels, severity, badge tone, and CTA behavior.
- `lib/execution-event-log.ts`:
  - creates, normalizes, reads, writes, and maps local execution audit events.
- `app/trade-app.tsx` local helpers:
  - lifecycle stub tone mapping;
  - terminal event mapping for broker status;
  - fixture data and live execution input assembly.
- execution hooks under `hooks/execution/`:
  - local dev bridge and phase preview state;
  - readiness derivation for the handoff modal.

## 8. Coupling Map

Primary fixture path:

`executionSandboxFixturePositions` -> `runExecutionOrchestrator` ->
`buildExecutionUiStatusFromOrchestratorResult` ->
`LiveExecutionStatusSurface` -> open preview handler ->
`ExecutionHandoffPreviewModal` -> local lifecycle/dev actions ->
localStorage execution event log.

Primary live-position path:

`ActivePosition` + latest update + execution mode -> live sell guidance and
orchestrator input -> `runExecutionOrchestrator` ->
`buildExecutionUiStatusFromOrchestratorResult` ->
`LiveExecutionStatusSurface` -> open preview handler ->
`ExecutionHandoffPreviewModal` -> local lifecycle/dev actions ->
localStorage execution event log and local execution record preview/store.

Modal lifecycle path:

`result.lifecycle` -> `localLifecycle` state ->
derived labels/tones/can-run flags -> `ExecutionHandoffModalComposition`
props -> preparation/progress/capture handlers -> `transitionExecutionLifecycle`
-> `setLocalLifecycle` / `setCaptureBaseLifecycle` -> local audit events.

Server-only audit persistence path:

`transitionExecutionLifecycleOnServer` ->
`transitionExecutionLifecycleAndAppendAuditEvent` -> lifecycle hook ->
production write-path -> audit writer -> service-role adapter ->
`public.execution_record_audit_events`.

This server-only path is intentionally separate from the UI path and should not
be pulled into `app/trade-app.tsx` or client components.

`app/trade-app.tsx` owns too much responsibility in the lifecycle area because
it assembles fixture/live execution inputs, owns modal open state, owns modal
local lifecycle state, derives display props, runs local transition handlers,
appends local event-log entries, stores dev preview execution records, and
threads a large number of props into extracted modal composition panels.

## 9. Risk Hotspots

- Large local lifecycle state cluster inside `ExecutionHandoffPreviewModal`.
- Mixed UI/domain logic in `ActivePositionCard`, where live position display,
  risk warnings, execution orchestration, status display, details modal, and
  handoff preview opening all meet.
- Mixed UI/domain logic in `ExecutionSandboxFixtureCard`, where fixture data,
  orchestrator result, status display, and modal lifecycle preview are coupled.
- Handlers that mutate several concerns:
  - lifecycle snapshot;
  - capture base lifecycle;
  - local audit event log;
  - progress timeline;
  - local execution record preview/store;
  - user-facing messages/errors.
- Local storage coupling through execution event log and many other app-wide
  storage effects in the same large parent file.
- Modal state coupling between open/close state, selected intent/handoff,
  local lifecycle, dev preview hooks, and capture/progress stubs.
- Mock/dev path coupling around preparation, bridge diagnostics, broker result
  capture, and local execution record previews.
- Audit writer boundary risk: future refactors must not import server-only
  audit writer modules into UI/client code.

## 10. Refactor Seam Candidates

| Rank | Candidate | Risk | Benefit | Test coverage needed | Audit writer path touch |
| --- | --- | --- | --- | --- | --- |
| 1 | Lifecycle UI state view-model | Medium | Creates a pure, client-safe object for labels, tones, can-run flags, visibility, and selected lifecycle display state. Reduces modal prop assembly without moving behavior. | Unit tests for state labels, tones, visibility, can-run flags, terminal/manual states, and no server-only/audit writer imports. | No. Must stay pure/client-safe. |
| 2 | Execution status adapter extraction/hardening | Low to medium | Builds on `lib/execution-ui-status.ts` and can reduce repeated status-surface assumptions in cards. | Existing adapter tests plus status/CTA regression for orchestrator and lifecycle snapshots. | No. |
| 3 | Modal state helper extraction | Medium to high | Could isolate open/close/reset behavior for lifecycle preview modal state. | Tests for open/close, reset, Escape behavior, no changed side effects. | No. Avoid server-only imports. |
| 4 | Settings/debug/audit panel extraction | Medium | Can remove bulky render prop assembly from `app/trade-app.tsx`. | Rendering/static import tests; no route/fetch/write additions. | No. |
| 5 | Local storage/event log helper extraction | Medium to high | Clarifies local event-log ownership and prevents accidental confusion with server audit persistence. | Storage read/write tests, browser/no-browser tests, event normalization tests. | No, but naming must avoid server audit confusion. |
| 6 | Handler command adapter | High | Could centralize transition commands, but handlers currently combine state, events, messages, and dev storage. | Handler regression tests before extraction; no retry/no broker/no Avanza checks. | No direct touch, but high boundary risk. |
| 7 | State-machine facade | Medium | Could provide UI-friendly state-machine wrappers while preserving pure transition semantics. | State-machine tests, invalid transition tests, terminal-state tests. | No. |

## 11. Recommended First Extraction

Recommended next step:

Action 894 - Create Execution Lifecycle State Adapter Refactor Plan.

The smallest safe first implementation target appears to be a pure lifecycle UI
state view-model, but the next action should plan its shape before code moves.
The adapter should initially derive labels, tones, visibility flags, can-run
flags, and warning/description strings from existing lifecycle/modal inputs.

Do not move transition handlers, local event-log writes, local execution record
preview/store writes, server-only audit writer calls, broker/Avanza paths, or
runtime persistence behavior in that first extraction.

## 12. Safety Boundaries

- No audit writer client invocation.
- No audit writer UI/browser invocation.
- No audit writer market/scanner invocation.
- No broker/Avanza behavior.
- No automatic mode enablement.
- No trade/stats/PnL mutation changes.
- No service-role exposure.
- No migrations or type generation.
- No generated type edits.
- No `.env.local` changes.
- No live proof, live insert, select/query/remote SQL, service-role adapter
  call, cleanup, or backout.
- Audit writer server-only rollout remains untouched.

## 13. Result Status

`execution_lifecycle_ui_state_coupling_inventory_created`

## 14. Recommended Next Action

Action 894 - Create Execution Lifecycle State Adapter Refactor Plan.
