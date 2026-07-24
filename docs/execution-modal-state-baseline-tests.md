# Execution Modal State Baseline Tests

## Action 911 Summary Update

Action 911 summarized current modal state baseline coverage. No tests or runtime
behavior were changed in this documentation-only action.

## Action 910 Live Position Open Path Wiring Update

Baseline coverage now reflects both open paths using modal helper output. The
tests prove `ExecutionSandboxFixtureCard` and `ActivePositionCard` use
`openExecutionModalState(...)`.

Close/reset and prepare/capture helper wiring remain present and unchanged.

## Action 909 Sandbox Open Path Wiring Update

Baseline coverage now reflects sandbox-only open path wiring. The tests prove
`ExecutionSandboxFixtureCard` uses `openExecutionModalState(...)`, while
`ActivePositionCard` remains unwired.

Close/reset and prepare/capture helper wiring remain present and unchanged.

## Action 908 Open Path Baseline Tests Update

Action 908 added `tests/e2e/execution-modal-open-path-baseline.spec.ts` for the
selected first open-path seam.

The original modal baseline tests remain in place.

Status:
`execution_modal_open_path_baseline_tests_added`

Recommended next action: Action 909 - Wire Modal Helpers Into Sandbox Open
Path.

## Action 907 Open Path Wiring Plan Update

Action 907 created `docs/execution-modal-open-path-wiring-plan.md`.

The next recommended test step is Action 908 baseline coverage for fixture and
live-position open paths before runtime wiring.

Status:
`execution_modal_open_path_wiring_plan_created`

Recommended next action: Action 908 - Add Execution Modal Open Path Baseline
Tests.

## Action 906 Refactor Summary Update

Action 906 created `docs/execution-modal-state-refactor-summary.md` to
summarize Actions 901-905 and capture the current modal helper coverage.

Baseline tests remain unchanged in Action 906.

Status:
`execution_modal_state_refactor_summary_created`

Recommended next action: Action 907 - Create Execution Modal Open Path Wiring
Plan.

## Action 905 Prepare/Capture Wiring Update

Action 905 wired helper-owned prepare/capture result-shape output into
`app/trade-app.tsx`.

The baseline tests now assert that close/reset and prepare/capture helpers are
wired while open helper wiring remains absent.

Status:
`execution_modal_state_helpers_prepare_capture_wired`

Recommended next action: Action 906 - Create Execution Modal State Refactor
Summary.

## Action 904 Close/Reset Wiring Update

Action 904 wired the helper-owned closed/reset `isOpen: false` value into the
two production execution preview close handlers.

The baseline tests now also assert that only close/reset is wired: open,
prepare, and capture helper result paths remain unwired.

Status:
`execution_modal_state_helpers_close_reset_wired`

Recommended next action: Action 905 - Wire Modal Helpers Into Prepare/Capture
Result Path.

## Action 903 Helper Implementation Update

Action 903 implemented `lib/execution-modal-state-helpers.ts` and added
`tests/e2e/execution-modal-state-helpers.spec.ts`.

The production modal remains unwired. The Action 902 baseline continues to
serve as the behavior lock for future UI wiring.

Status:
`execution_modal_state_helpers_implemented_client_safe`

Recommended next action: Action 904 - Wire Modal Helpers Into Close/Reset Path.

## Purpose

Action 902 adds baseline tests for current execution modal state behavior before
implementing `lib/execution-modal-state-helpers.ts`.

This is tests/docs only. It does not modify runtime code, implement modal
helpers, extract components, change modal open/close behavior, change
prepare/capture handlers, change effects, change state mutation, broaden
adapter wiring, or change audit writer runtime persistence.

Result status:
`execution_modal_state_baseline_tests_added`.

## Current Baseline Scope

The new baseline coverage locks these current modal-state expectations where
they are pure or fixture-testable:

- closed/reset modal state shape;
- open modal state with selected execution intent and Avanza handoff;
- close/reset clearing selected intent, handoff, local lifecycle, capture base,
  preparation state, capture state, and agent-progress state;
- semi-automatic preparation success reaching manual confirmation;
- automatic preparation reaching broker-order-submitting state without enabling
  runtime execution;
- preparation failure shape when selected modal payload is missing;
- capture success shape after preparation;
- capture failure shape when capture is attempted from the current handoff
  state too early;
- debug-safe modal summary shape;
- current inline modal state coupling in `app/trade-app.tsx`;
- planned helper boundary remains client-safe and unimplemented.

## Test Approach

Created:

`tests/e2e/execution-modal-state-baseline.spec.ts`

The modal state is currently inline inside `ExecutionHandoffPreviewModal`, so
the baseline uses fixture-local state helpers inside the test file. This avoids
extracting production logic early while still locking the planned state/action
contract for Action 903.

Imported production helpers/types:

- `runExecutionOrchestrator(...)`;
- `transitionExecutionLifecycle(...)`;
- `getExecutionLifecycleDisplayLabel(...)`;
- execution intent/action/mode/trigger types.

Source characterization:

- verifies `ExecutionHandoffPreviewModal` still owns `localLifecycle`,
  `captureBaseLifecycle`, preparation messages/errors, capture result state,
  `setLocalLifecycle(...)`, `setCaptureBaseLifecycle(...)`, local event-log
  appends, modal copy adapter use, and Escape-key close handling;
- verifies `execution-modal-state-helpers` is not imported yet.

Not extracted:

- no production modal helper module;
- no production state reducer;
- no component extraction;
- no handler/effect movement.

## Coverage Map

| Event/action | Locked baseline state |
| --- | --- |
| Initial closed/reset | `isOpen: false`, selected intent/handoff/lifecycle cleared, preparation/capture/progress idle |
| Open from fixture/live source | selected intent, selected handoff, local lifecycle, and source retained |
| Close/reset | selected payload, handoff, lifecycle, capture base, messages, errors, and result fields cleared |
| Preparation success, semi-automatic | `preparation.status: success`, lifecycle `waiting_for_manual_confirmation`, capture base set |
| Preparation success, automatic | `preparation.status: success`, lifecycle `broker_order_submitting`, no runtime execution strings |
| Preparation failure | `preparation.status: failure` with missing selected payload error |
| Capture success | `capture.status: success`, broker status `filled`, lifecycle `broker_result_captured` |
| Capture too early | `capture.status: failure` with current state-machine invalid transition error |
| Debug summary | safe identifiers/status categories only, no secrets/audit-table metadata |

## Boundaries Verified

- no audit writer server import added;
- no service-role/env/Supabase usage added;
- no route/fetch call added;
- no browser storage/global access added by a helper;
- no broker/Avanza behavior added;
- no automatic mode execution enabled;
- no trade/stats/PnL mutation changed;
- no audit writer rollout or runtime persistence change;
- no migration, type generation, generated type edit, live proof, live insert,
  query, remote SQL, cleanup, or backout performed.

## Gaps And Limitations

Some current modal behavior remains inline and cannot be tested as production
helper behavior until Action 903 creates the helper boundary:

- actual React state setter sequencing inside `ExecutionHandoffPreviewModal`;
- Escape-key behavior as a browser interaction;
- full preparation runner side effects;
- full broker capture stub side effects;
- local event-log writes;
- local execution record preview/store writes;
- extracted preview hook state under `hooks/execution/`.

Action 903 should implement the first helper slice conservatively, using this
baseline to keep helpers pure, client-safe, and side-effect-free.

## Recommended Next Action

Action 903 - Implement Execution Modal State Helpers.
