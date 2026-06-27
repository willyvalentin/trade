# Execution Modal State Helpers Prepare/Capture Wiring

## Action 911 Summary Update

Action 911 summarized the completed modal helper wiring scope. Prepare/capture
result helper wiring remains unchanged and is now documented alongside both
open paths and close/reset wiring.

## Action 910 Live Position Open Path Wiring Update

Action 910 wired the live-position open path to
`openExecutionModalState(...)`. Prepare/capture result helper wiring from
Action 905 remains unchanged.

No prepare/capture handlers, effects, audit writer path, database action,
migration, type generation, generated type edit, or `.env.local` change was
performed.

## Action 909 Sandbox Open Path Wiring Update

Action 909 wired the sandbox open path to `openExecutionModalState(...)`.
Prepare/capture result helper wiring from Action 905 remains unchanged.

The live-position open path remains deferred. No prepare/capture handlers,
effects, audit writer path, database action, migration, type generation,
generated type edit, or `.env.local` change was performed.

## Action 908 Open Path Baseline Tests Update

Action 908 added open-path baseline tests. Prepare/capture result helper wiring
remains unchanged.

Status:
`execution_modal_open_path_baseline_tests_added`

Recommended next action: Action 909 - Wire Modal Helpers Into Sandbox Open
Path.

## Action 907 Open Path Wiring Plan Update

Action 907 created `docs/execution-modal-open-path-wiring-plan.md`.

Prepare/capture result wiring remains unchanged. Open path wiring remains
planned but not implemented.

Status:
`execution_modal_open_path_wiring_plan_created`

Recommended next action: Action 908 - Add Execution Modal Open Path Baseline
Tests.

## Action 906 Refactor Summary Update

Action 906 created `docs/execution-modal-state-refactor-summary.md` to
summarize Actions 901-905 and document current helper scope, wiring scope,
coverage, safety boundaries, remaining gaps, and the recommended next refactor
step.

Status:
`execution_modal_state_refactor_summary_created`

Recommended next action: Action 907 - Create Execution Modal Open Path Wiring
Plan.

## Purpose

Action 905 wires the client-safe execution modal state helpers into the
execution modal prepare/capture result-shape path.

This is limited wiring only. It is not a broad modal refactor, not open-path
wiring, and not component extraction.

Result status:
`execution_modal_state_helpers_prepare_capture_wired`.

## Selected Path

File:

`app/trade-app.tsx`

Selected prepare path:

- `runPreparationStub()`.

Previous inline result-shape logic:

- successful preparation set `localLifecycle`, `captureBaseLifecycle`, and
  `preparationStubMessage` directly;
- preparation failure set `preparationStubError` directly.

New helper wiring:

- successful preparation passes the already-produced follow-up lifecycle
  snapshot into `applyExecutionPrepareResult(...)`;
- preparation failure passes the already-produced error into
  `applyExecutionPrepareResult(...)`;
- setters consume the helper output for lifecycle, capture base, message, and
  error.

Selected capture path:

- `captureStubBrokerResult()`.

Previous inline result-shape logic:

- capture success set `localLifecycle`, cleared `captureBaseLifecycle`, and set
  `stubCaptureMessage` directly;
- capture failure set `stubCaptureError` directly.

New helper wiring:

- capture success passes the already-produced terminal lifecycle snapshot,
  broker status, entered dev/mock capture fields, and success message into
  `applyExecutionCaptureResult(...)`;
- capture failure passes the already-produced error into
  `applyExecutionCaptureResult(...)`;
- setters consume the helper output for lifecycle, capture base, capture
  message, and capture error.

This is the smallest safe seam because the existing handlers still own the
transition execution, local audit events, local record append, diagnostics
runner, and async ordering. The helpers only shape modal-local result state.

## Behavior Preservation

- prepare/capture transition semantics are unchanged;
- success/failure result shape is unchanged;
- dev/mock capture field shape is unchanged;
- diagnostics, warnings, and user-facing messages are preserved;
- async call order and side-effect order are preserved;
- close/reset helper wiring from Action 904 is preserved;
- open behavior remains unchanged;
- effects are unchanged;
- modal copy/readiness adapter wiring is unchanged.

## Boundaries Verified

- no server-only import;
- no audit writer server import;
- no service-role, env, or Supabase access;
- no route or network call;
- no browser storage/global access added;
- no broker behavior added;
- no automatic mode enabled;
- audit writer runtime persistence and rollout remain untouched.

## Tests

Updated:

- `tests/e2e/execution-modal-state-helpers.spec.ts`;
- `tests/e2e/execution-modal-state-baseline.spec.ts`.

Coverage:

- helper output accepts already-computed production lifecycle snapshots;
- production source uses `applyExecutionPrepareResult(...)` and
  `applyExecutionCaptureResult(...)`;
- close/reset helper wiring remains present;
- open path remains unchanged;
- helper source remains client-safe;
- existing modal baseline behavior remains locked.

## Not Performed

- no open path wiring;
- no component extraction;
- no broad UI wiring;
- no runtime behavior change beyond helper-equivalent prepare/capture result
  shape assignment;
- no audit writer path change;
- no database query or live proof;
- no migration, type generation, or generated type edit;
- no `.env.local` change;
- no service-role value printing.

## Recommended Next Action

Action 906 - Create Execution Modal State Refactor Summary.
