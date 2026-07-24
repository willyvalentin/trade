# Execution Lifecycle State Adapter Refactor Plan

## Action 903 Modal Helper Implementation Update

Action 903 implemented pure execution modal state helpers without wiring them
into runtime UI. This advances the modal-state extraction track while
preserving the existing lifecycle UI adapter scope.

Status:
`execution_modal_state_helpers_implemented_client_safe`

Recommended next action: Action 904 - Wire Modal Helpers Into Close/Reset Path.

## Action 902 Modal State Baseline Tests Update

Action 902 added the baseline tests required before implementing the planned
execution modal state helper boundary. Helper implementation remains blocked
until Action 903.

Status:
`execution_modal_state_baseline_tests_added`

Recommended next action: Action 903 - Implement Execution Modal State Helpers.

## Action 901 Modal State Helper Plan Update

Action 901 created the next planning document for execution modal state/helper
extraction. It keeps the client-safe lifecycle UI adapter boundary intact and
requires baseline modal state tests before helper implementation.

Status:
`execution_modal_state_helper_extraction_plan_created`

Recommended next action: Action 902 - Add Execution Modal State Baseline Tests.

## Action 900 Integration Summary Update

The Actions 895-899 adapter integration summary is complete. The next refactor
step should remain planning-only and focus on modal state/helper extraction
boundaries before moving more inline behavior.

Status:
`execution_lifecycle_ui_state_adapter_integration_summary_created`

Recommended next action: Action 901 - Create Execution Modal State Helper
Extraction Plan.

## Action 899 Duplication Removal Update

The first duplicated inline derived UI mapping has been removed. The sandbox
fixture status surface now receives adapter-owned `statusSurface` output
instead of rebuilding status display fields inline.

Status:
`execution_lifecycle_ui_state_adapter_duplicated_inline_logic_removed`

Recommended next action: Action 900 - Create Execution Lifecycle UI Adapter
Integration Summary.

## Action 898 Modal Copy Expansion Update

The adapter now owns one modal/readiness copy output for
`ExecutionHandoffPreviewModal` core summary props. This completes the next
limited expansion step without changing modal handlers, effects, state
transitions, or persistence.

Status:
`execution_lifecycle_ui_state_adapter_modal_copy_wired_one_surface`

Recommended next action: Action 899 - Remove Duplicated Inline Derived UI
Logic.

## Action 897 Read-Only Wiring Update

The first adapter wiring stage is complete for one read-only UI surface:
`ExecutionSandboxFixtureCard` in `app/trade-app.tsx`.

The implementation does not broaden adapter coverage beyond that fixture card.
Modal copy, handler/effect extraction, localStorage helpers, lifecycle
transition behavior, and audit writer runtime persistence remain outside this
action.

Status:
`execution_lifecycle_ui_state_adapter_wired_one_read_only_surface`

Recommended next action: Action 898 - Expand Adapter Coverage To Modal Copy.

## Action 896 Adapter Implementation Update

Action 896 implemented the client-safe adapter at
`lib/execution-lifecycle-ui-state-adapter.ts` and documented it in
`docs/execution-lifecycle-ui-state-adapter-implementation.md`.

The adapter centralizes baseline-tested lifecycle UI-derived state as pure
helper logic. No broad UI wiring, runtime behavior change, audit writer path
change, rollout flag change, database work, broker/Avanza behavior, or
automatic mode enablement was performed.

Status:
`execution_lifecycle_ui_state_adapter_implemented_client_safe`

Recommended next action: Action 897 - Wire Adapter Into One Read-Only UI
Surface.

## Action 895 Baseline Test Update

Action 895 added
`tests/e2e/execution-lifecycle-ui-state-baseline.spec.ts` and
`docs/execution-lifecycle-ui-state-baseline-tests.md`.

The baseline tests lock current importable pure lifecycle UI-derived behavior
before adapter implementation. Full modal copy and modal-local state mappings
remain documented gaps because they are still inline in `app/trade-app.tsx` and
were not extracted.

Status:
`execution_lifecycle_ui_state_baseline_tests_added`

Recommended next action: Action 896 - Implement Execution Lifecycle UI State
Adapter.

## 1. Purpose

Action 894 plans the execution lifecycle state adapter/view-model extraction.

This is documentation-only. It does not modify runtime code, extract
components/helpers, change state behavior, change effects, modify the audit
writer runtime persistence path, change rollout flags, add audit writer
UI/browser/client invocation, add market-loop/scanner audit invocation, add
broker/Avanza behavior, enable automatic mode, mutate trades/stats/PnL, run a
live proof, run a live insert, run select/query/remote SQL, call the
service-role adapter, perform cleanup/backout, run migrations, run type
generation, edit generated types, modify `.env.local`, or print service-role
values.

## 2. Inventory Summary

Action 893 identified that execution lifecycle UI/state coupling is
concentrated in `app/trade-app.tsx`, with supporting pure helpers and
server-only audit persistence modules around it.

Key lifecycle state reads:

- `ExecutionSandboxFixtureCard` reads fixture execution results, derives
  execution UI status, renders `LiveExecutionStatusSurface`, and opens
  `ExecutionHandoffPreviewModal`.
- `ActivePositionCard` reads live position data, derives sell guidance and live
  execution status, renders execution status, and opens the handoff modal.
- `ExecutionHandoffPreviewModal` reads `result.lifecycle`,
  `result.selectedIntent`, `result.handoff`, local lifecycle state,
  `captureBaseLifecycle`, status details, selected mode, dev-tool flags, and
  local preview state.
- Composition/panel components read labels, tones, messages, readiness flags,
  diagnostics, and callback props prepared by the modal/card layer.
- Settings/debug surfaces read selected execution mode and dev-tool
  availability.

Key lifecycle state writes:

- `selectedExecutionMode` is initialized from preference state and refreshed on
  focus/storage events.
- Fixture/live cards own local preview open/close state.
- `ExecutionHandoffPreviewModal` mutates `localLifecycle`,
  `captureBaseLifecycle`, preparation stub state, broker capture stub state,
  local diagnostics state, progress timeline state, and related messages.
- Local lifecycle transitions use the pure `transitionExecutionLifecycle`
  state machine.
- Local event-log entries are appended through `lib/execution-event-log.ts` to
  `ture_execution_event_log_v1`.

Effects and local event-log coupling:

- UI-local progress, preparation, and capture actions append local audit-style
  events for display/debug use.
- The local event log is separate from the server-side audit table
  `public.execution_record_audit_events`.
- The rolled-out audit writer runtime persistence path starts at the
  server-only lifecycle transition boundary and is not a UI refactor target.

Derived helpers:

- `lib/execution-state-machine.ts` owns lifecycle states, actions, transition
  validation, display labels, and lifecycle event construction.
- `lib/execution-ui-status.ts` derives status labels, severity, badge tone,
  CTA type/label/action, and blocked reasons from orchestrator results and
  lifecycle snapshots.
- `lib/execution-orchestrator.ts` builds execution intents, handoff data, and
  lifecycle snapshots for fixture/live flows.
- `lib/execution-event-log.ts` owns local event-log persistence.
- `app/trade-app.tsx` still contains additional inline display, readiness,
  disabled-state, modal-copy, and debug-summary derivation.

Major risk hotspots:

- `ExecutionHandoffPreviewModal` combines local lifecycle mutation, modal copy,
  local event-log append, diagnostics, preparation, capture, and preview state.
- `ActivePositionCard` and `ExecutionSandboxFixtureCard` mix domain inputs,
  status derivation, UI state, and modal launch behavior.
- Local event-log behavior can be confused with server-side audit persistence
  unless the boundary is kept explicit.
- Any extraction that imports server-only audit writer modules into UI-safe code
  would violate the completed audit writer boundary.
- Automatic-mode labels or CTA changes could imply broader automation authority
  if not tested carefully.

## 3. Refactor Goal

The state adapter refactor should:

- reduce `app/trade-app.tsx` responsibility;
- centralize lifecycle UI-derived state;
- separate display/view-model mapping from handlers and effects;
- preserve current runtime behavior;
- preserve the audit writer server-only boundary;
- improve testability before extraction;
- keep lifecycle semantics unchanged;
- keep local event-log behavior unchanged;
- avoid adding any production write path beyond the already approved
  server-only audit writer path.

The first implementation should be small and reversible. It should move
derived, client-safe lifecycle UI state behind a pure adapter without changing
where effects, local state setters, localStorage writes, or server-only audit
persistence are performed.

## 4. Proposed Adapter Responsibility

The adapter should own UI-derived lifecycle state only:

- lifecycle display labels;
- severity and status mapping;
- badge/tone mapping;
- CTA label, type, and action naming;
- disabled/enabled state;
- disabled reason text;
- modal-visible and readiness hints;
- safe lifecycle summary rows for UI;
- debug-safe metadata for display;
- event-log display summaries if those summaries are derived from already
  client-safe local event-log inputs.

The adapter must not own:

- service-role calls;
- production write-path calls;
- audit writer calls;
- audit writer route calls;
- Supabase or database queries/mutations;
- remote SQL;
- broker/Avanza behavior;
- automatic mode enablement;
- market/scanner invocation;
- trade/stats/PnL mutation;
- localStorage writes;
- lifecycle state mutation;
- retry loops;
- cleanup/backout behavior.

## 5. Proposed Module Boundary

Recommended module path:

`lib/execution-lifecycle-ui-state-adapter.ts`

Boundary rules:

- no `server-only` import;
- no service-role imports;
- no Supabase client imports;
- no audit writer server module imports;
- no route/fetch calls;
- no localStorage/sessionStorage access;
- pure functions wherever possible;
- deterministic input/output;
- safe for `app/trade-app.tsx`, UI components, and UI hooks to import;
- no mutation of lifecycle snapshots or input objects.

Suggested planned exports:

- `buildExecutionLifecycleUiState(input)`
- `ExecutionLifecycleUiStateInput`
- `ExecutionLifecycleUiState`
- `ExecutionLifecycleSummaryRow`
- `ExecutionLifecycleUiSeverity`

The adapter can depend on existing pure client-safe helpers such as
`lib/execution-state-machine.ts` and `lib/execution-ui-status.ts`, provided the
implementation remains side-effect-free and UI-safe.

## 6. Input/Output Contract

Proposed inputs:

- lifecycle state/status;
- lifecycle snapshot where already available in the UI;
- execution intent/action type;
- lifecycle result envelope where client-safe;
- current execution mode as display context only, without enabling automatic
  behavior;
- modal state flags such as open/visible/readiness booleans;
- preparation/capture/progress flags already owned by the caller;
- warnings and diagnostics summaries only when already client-safe;
- debug flags such as dev-tool visibility as display inputs only.

Proposed outputs:

- status label;
- lifecycle label;
- severity;
- badge tone;
- CTA label/type/action name;
- disabled/enabled booleans;
- disabled reason;
- readiness message;
- modal copy;
- summary rows;
- event-log display rows, if supplied as safe inputs;
- debug-safe metadata;
- no side effects.

The adapter should not return callbacks, mutate state, append events, write to
storage, call routes, call Supabase, or decide whether automatic execution is
allowed.

## 7. Test Strategy

Before implementation, add baseline tests around current visible lifecycle UI
state so extraction has a clear comparison target.

Planned tests:

- baseline tests for current UI-derived lifecycle status mapping;
- pure-function tests for the adapter;
- tests for status labels, severity, badge tone, CTA labels, disabled state,
  and disabled reasons;
- tests for readiness/modal copy derived from representative lifecycle states;
- tests that automatic-mode context remains display-only and does not enable
  automatic behavior;
- static import tests proving the adapter does not import server-only modules,
  audit writer modules, service-role helpers, Supabase clients, or routes;
- regression tests for existing visible states in fixture and live-position
  execution surfaces.

Tests that are out of scope:

- service-role/env/Supabase tests;
- audit writer live path tests;
- database mutation tests;
- broker/Avanza integration tests;
- automatic execution enablement tests;
- route invocation tests;
- migration/type-generation tests.

## 8. Implementation Stages

Recommended staged actions:

- Action 895 - Add Execution Lifecycle UI State Baseline Tests.
- Action 896 - Implement Execution Lifecycle UI State Adapter.
- Action 897 - Wire Adapter Into One Read-Only UI Surface.
- Action 898 - Expand Adapter Coverage To Modal Copy.
- Action 899 - Remove Duplicated Inline Derived UI Logic.

Stage rules:

- Each stage should keep runtime behavior equivalent unless separately
  approved.
- Each wiring stage should cover one surface or concern at a time.
- Static scans should continue proving no UI/client import of server-only audit
  writer modules.
- Any handler/effect/localStorage extraction should remain blocked until the
  adapter has baseline tests and at least one read-only UI surface is wired.

## 9. Risk Analysis

Display regression risk: moving labels, tone, CTA state, and disabled reasons
can subtly change user-facing lifecycle meaning. Baseline tests should capture
existing visible states first.

State reset risk: modal lifecycle state, capture base state, preparation
messages, and progress timeline state are tightly coupled. The first adapter
must avoid owning or resetting them.

Audit boundary risk: UI-safe adapter code must not import server-only audit
writer modules, the lifecycle caller, lifecycle hook, production write-path,
service-role adapter, route handler, or monitoring implementation.

Persistence confusion risk: local event-log display summaries must remain
clearly separate from `public.execution_record_audit_events`.

Automatic-mode risk: mode can be used as display context only. It must not
enable broker behavior, scanner behavior, market-loop behavior, automatic
submissions, or new runtime invocation.

Scope creep risk: extracting handlers/effects before the view-model is tested
would increase the chance of lifecycle behavior changes. Handler/effect work
should remain a later action.

## 10. Safety Boundaries

This plan does not approve:

- runtime code changes;
- component/helper extraction;
- state behavior changes;
- effect changes;
- audit writer runtime persistence changes;
- rollout flag changes;
- audit writer UI/browser/client invocation;
- audit writer market-loop/scanner invocation;
- broker/Avanza behavior;
- automatic mode enablement;
- trade/stats/PnL mutation;
- live proof;
- live insert;
- select/query/remote SQL;
- service-role adapter calls;
- cleanup/backout;
- migrations;
- type generation;
- generated type edits;
- `.env.local` changes;
- service-role value printing.

The future adapter must remain client-safe, deterministic, side-effect-free,
and separate from the completed server-only audit writer runtime persistence
path.

## 11. Result Status

`execution_lifecycle_state_adapter_refactor_plan_created`

## 12. Recommended Next Action

Action 895 - Add Execution Lifecycle UI State Baseline Tests.
