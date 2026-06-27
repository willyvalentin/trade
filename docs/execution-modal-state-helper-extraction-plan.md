# Execution Modal State Helper Extraction Plan

## Action 911 Summary Update

Action 911 summarized the completed open/close/prepare/capture helper wiring
scope. The next recommended step is inventorying event log/local storage
coupling before any extraction.

Status:
`execution_modal_open_path_wiring_summary_created`.

## Action 910 Live Position Open Path Wiring Update

The helper extraction plan now has both open-path wiring points completed:
sandbox fixture open behavior and live-position open behavior use
`openExecutionModalState(...)`.

No component extraction or broad modal state holder was added.

## Action 909 Sandbox Open Path Wiring Update

The helper extraction plan now has one additional completed production wiring
point: sandbox fixture open behavior uses `openExecutionModalState(...)`.

The live-position open path remains the next planned seam. No component
extraction or broad modal state holder was added.

## Action 908 Open Path Baseline Tests Update

Action 908 added baseline tests before runtime open-path wiring.

The extraction sequence remains staged: baseline tests first, sandbox fixture
open path wiring next, live-position open path later.

Status:
`execution_modal_open_path_baseline_tests_added`

Recommended next action: Action 909 - Wire Modal Helpers Into Sandbox Open
Path.

## Action 907 Open Path Wiring Plan Update

Action 907 created `docs/execution-modal-open-path-wiring-plan.md`.

The plan keeps the extraction sequence staged: baseline tests first, fixture
open path wiring second, live-position open path wiring third.

Status:
`execution_modal_open_path_wiring_plan_created`

Recommended next action: Action 908 - Add Execution Modal Open Path Baseline
Tests.

## Action 906 Refactor Summary Update

Action 906 created `docs/execution-modal-state-refactor-summary.md` as the
documentation-only summary of the plan and implementation sequence from Actions
901-905.

The open path remains the recommended next planning target before any runtime
wiring.

Status:
`execution_modal_state_refactor_summary_created`

Recommended next action: Action 907 - Create Execution Modal Open Path Wiring
Plan.

## Action 905 Prepare/Capture Wiring Update

Action 905 completed the next narrow wiring step by using
`applyExecutionPrepareResult(...)` and `applyExecutionCaptureResult(...)` for
modal-local prepare/capture result state.

The open path remains inline and unchanged.

Status:
`execution_modal_state_helpers_prepare_capture_wired`

Recommended next action: Action 906 - Create Execution Modal State Refactor
Summary.

## Action 904 Close/Reset Wiring Update

Action 904 completed the first production wiring step by using
`closeExecutionModalState().isOpen` in the two execution preview close handlers.

The open path and prepare/capture result paths remain inline and unchanged.

Status:
`execution_modal_state_helpers_close_reset_wired`

Recommended next action: Action 905 - Wire Modal Helpers Into Prepare/Capture
Result Path.

## Action 903 Helper Implementation Update

Action 903 implemented the planned client-safe helper boundary:

`lib/execution-modal-state-helpers.ts`

It also added focused helper coverage:

`tests/e2e/execution-modal-state-helpers.spec.ts`

The helpers are not wired into `app/trade-app.tsx` yet. Runtime modal behavior,
handlers, effects, and state mutation remain unchanged.

Status:
`execution_modal_state_helpers_implemented_client_safe`

Recommended next action: Action 904 - Wire Modal Helpers Into Close/Reset Path.

## Action 902 Baseline Tests Update

Action 902 added modal state baseline tests before helper implementation. The
tests use fixture-local state helpers and source characterization because
production modal state is still inline in `app/trade-app.tsx`.

Status:
`execution_modal_state_baseline_tests_added`

Recommended next action: Action 903 - Implement Execution Modal State Helpers.

## Purpose

Action 901 creates a documentation-only plan for extracting execution modal
state/helpers from the dense `app/trade-app.tsx` modal area.

This plan does not implement helper extraction. It does not modify runtime code,
extract components, change modal open/close behavior, change prepare/capture
handlers, change effects, change state mutation, broaden adapter wiring, or
change audit writer runtime persistence.

Result status:
`execution_modal_state_helper_extraction_plan_created`.

## Current Modal/State Coupling Summary

The current execution modal state is split across card-level open state,
selected orchestrator payloads, modal-local lifecycle state, dev preview hooks,
preparation/capture status, local event-log writes, and large prop assembly.

Modal open/close state:

- `ExecutionSandboxFixtureCard` owns `isExecutionPreviewOpen` for fixture
  handoff previews;
- `ActivePositionCard` owns `isExecutionPreviewOpen` for live-position handoff
  previews;
- both cards pass an `onClose` callback into `ExecutionHandoffPreviewModal`;
- the modal also has an Escape-key effect that calls the same close callback.

Selected execution payload/handoff state:

- the cards pass an `ExecutionOrchestratorResult` into the modal;
- the modal reads `result.selectedIntent`, `result.handoff`, `result.lifecycle`,
  and `status`;
- the modal exits early when status, intent, or handoff is not visible/ready for
  display;
- selected intent and handoff are re-aliased locally as `selectedIntent` and
  `selectedHandoff` for the large modal body.

Prepare/capture status state:

- `localLifecycle` starts from `result.lifecycle` and is mutated by local
  progress, preparation, and capture handlers;
- `captureBaseLifecycle` stores the preparation follow-up snapshot used by
  broker-result capture;
- preparation state includes messages, errors, runner status, runner result,
  and persisted runner-store messages;
- capture state includes broker status, executed price, order id, broker
  timestamp, capture result, capture message, and capture error.

Dev/mock capture state:

- agent progress stub state includes selected progress type, progress timeline,
  message, and error;
- extracted execution preview hooks under `hooks/execution/` manage
  bridge/preview/readiness state that is threaded through the modal;
- dev/mock flows append local execution audit events and may create local
  preview/store records, but they are not server-side audit persistence.

Modal copy/readiness relationship to adapter:

- `buildExecutionLifecycleModalCopy(...)` now owns the approved modal core
  summary status label/title/description and readiness hint;
- this adapter output is wired only into `ExecutionHandoffPreviewModal` core
  summary props;
- modal handler/effect/state behavior remains inline and unchanged.

Event log/local storage coupling:

- local progress, preparation, and capture handlers append events through
  `appendExecutionAuditEvents(...)`;
- those local events use `ture_execution_event_log_v1` and are separate from
  `public.execution_record_audit_events`;
- future modal helpers must avoid confusing local UI/dev event logging with the
  server-only audit writer path.

## Candidate Helper Responsibilities

A future client-safe helper module could own:

- modal state shape for local modal-only state;
- initial modal state creation from a selected orchestrator result;
- open modal action payload builders for fixture and live-position callers;
- close/reset modal helper output;
- preparation result reducer/helper output;
- capture result reducer/helper output;
- agent progress result reducer/helper output, if kept separate from command
  execution;
- debug-safe modal summary output;
- action availability/readiness flags derived from current modal state,
  selected handoff, selected intent, and dev-tool availability.

Candidate non-responsibilities:

- service-role calls;
- audit writer server calls;
- Supabase queries or mutations;
- route/fetch calls;
- broker/Avanza execution;
- automatic-mode execution;
- market-loop/scanner invocation;
- trade/stats/PnL mutation;
- localStorage reads/writes;
- UI rendering;
- component ownership;
- lifecycle transition execution unless a later action explicitly narrows that
  helper boundary.

## Proposed Module Boundary

Recommended future module:

`lib/execution-modal-state-helpers.ts`

Boundary rules:

- client-safe;
- pure functions where possible;
- deterministic input/output;
- no `server-only`;
- no audit writer server imports;
- no service-role/env/Supabase access;
- no `fetch(...)` or route invocation;
- no browser storage/global access;
- no broker/Avanza execution behavior;
- no automatic-mode execution behavior;
- no trade/stats/PnL mutation;
- no local event-log writes unless a later action explicitly scopes a separate
  local event-log helper.

## Proposed State/Action Contract

Potential modal state fields:

- `isOpen`;
- `source`, for fixture or live-position preview context;
- `selectedIntent`;
- `selectedHandoff`;
- `localLifecycle`;
- `captureBaseLifecycle`;
- `preparation`, containing message/error/running/result/store-message fields;
- `capture`, containing broker status, executed price, order id, timestamp,
  result, message, and error fields;
- `agentProgress`, containing selected type, timeline, message, and error
  fields;
- `debugSummary`, derived from safe state only.

Potential action/event types:

- `open_from_fixture`;
- `open_from_live_position`;
- `close`;
- `reset`;
- `preparation_started`;
- `preparation_succeeded`;
- `preparation_failed`;
- `capture_started`;
- `capture_succeeded`;
- `capture_failed`;
- `agent_progress_added`;
- `agent_progress_failed`;
- `lifecycle_updated`.

Helper inputs:

- current modal state;
- selected orchestrator result;
- selected status;
- selected execution mode/dev-tool availability;
- lifecycle transition result objects supplied by existing runtime handlers;
- capture/preparation result objects supplied by existing runtime handlers.

Helper outputs:

- next modal state;
- debug-safe summary;
- display-only readiness flags;
- reset payloads;
- no side effects.

Reset behavior:

- close/reset should clear modal-local preparation, capture, progress, and
  error/message state;
- selected intent/handoff/lifecycle should reset to the next opened
  orchestrator result;
- reset helpers must not write localStorage or call routes.

Prepare/capture transition behavior:

- helpers may classify already-produced transition outcomes;
- helpers should not execute broker/Avanza actions;
- helpers should not call `transitionExecutionLifecycle(...)` until a later
  action explicitly scopes and tests that responsibility;
- helpers should preserve current no-retry behavior and user-facing messages.

Debug-safe summaries:

- include selected lifecycle state, intent/handoff identifiers, mode, action,
  can-run flags, and status category;
- exclude service-role values, Supabase metadata, secrets, tokens, route
  payloads, and broker credentials.

## Test Strategy

Before implementation, add baseline tests that lock current behavior:

- modal state initialization from fixture and live-position orchestrator
  results;
- open/close/reset behavior;
- Escape-key close behavior, if tested at the UI boundary;
- selected intent/handoff preservation;
- `localLifecycle` initialization and reset;
- `captureBaseLifecycle` reset and preservation after preparation;
- preparation reducer/helper outcomes;
- capture reducer/helper outcomes;
- agent progress timeline/message/error outcomes;
- modal summary output and debug-safety;
- no `server-only`, audit writer, Supabase, service-role, route/fetch, browser
  storage, broker/Avanza, market/scanner, or automatic execution imports;
- no side-effect tests for helper source.

## Implementation Stages

Recommended sequence:

1. Action 902 - Add Execution Modal State Baseline Tests. Complete.
2. Action 903 - Implement Execution Modal State Helpers.
3. Action 904 - Wire Modal Helpers Into Close/Reset Path.
4. Action 905 - Wire Modal Helpers Into Prepare/Capture Result Path.
5. Action 906 - Create Execution Modal State Refactor Summary.

The first implementation action should avoid touching preparation/capture
handlers until baseline tests prove current behavior.

## Risk Analysis

Key risks:

- accidental modal open/close behavior change;
- selected payload or handoff data being lost during reset;
- `localLifecycle` or `captureBaseLifecycle` reset regression;
- preparation status message/error regression;
- capture status/result/message/error regression;
- dev/mock capture regression;
- agent progress timeline regression;
- Escape-key behavior regression;
- local event-log/localStorage coupling confusion;
- accidental audit writer client boundary leak;
- accidental broker/Avanza behavior implication;
- accidental automatic-mode execution implication;
- component extraction becoming mixed with state extraction.

Mitigations:

- add baseline tests before moving helper logic;
- keep helper functions pure and client-safe;
- stage close/reset separately from prepare/capture reducers;
- scan helper source for forbidden imports and side effects;
- keep local event-log writes in existing handlers until separately planned.

## Safety Boundaries

This plan preserves these boundaries:

- no audit writer client invocation;
- no market/scanner invocation;
- no broker/Avanza behavior;
- no automatic mode;
- no trade/stats/PnL mutation changes;
- no service-role exposure;
- no Supabase query/mutation;
- no route/fetch call;
- no localStorage write from planned helpers;
- no migrations/typegen/generated type edits;
- audit writer server-only rollout remains untouched.

## Recommended Next Action

Action 902 - Add Execution Modal State Baseline Tests.
