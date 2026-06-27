# Execution Modal Open Path Sandbox Wiring

## Action 911 Summary Update

Action 911 created `docs/execution-modal-open-path-wiring-summary.md` to
summarize Actions 907-910. Sandbox and live-position open helper wiring remain
unchanged.

Status:
`execution_modal_open_path_wiring_summary_created`.

## Action 910 Live Position Wiring Update

Action 910 wired the second open path: `ActivePositionCard` now uses
`openExecutionModalState(...)` with `source: "live_position"`.

The sandbox open helper wiring from Action 909 remains unchanged. Close/reset
and prepare/capture helper wiring remain unchanged.

Current status:
`execution_modal_open_path_live_position_wired`.

## Purpose

Action 909 wires modal helper output into the sandbox execution modal open path
only.

This is limited wiring for `ExecutionSandboxFixtureCard`. It is not a broad
modal refactor, live-position wiring, or audit writer/runtime persistence
change.

Result status:
`execution_modal_open_path_sandbox_wired`.

## Selected Path

File:

`app/trade-app.tsx`

Selected component:

`ExecutionSandboxFixtureCard`

Previous open logic:

`LiveExecutionStatusSurface` opened the modal with inline boolean state:
`setIsExecutionPreviewOpen(true)`.

New helper-backed open logic:

`openExecutionModalState({ result: orchestratorResult, source: "fixture" })`
is called inside the sandbox open handler, and the existing local modal
visibility boolean is set from the helper output: `opened.isOpen`.

This is the smallest safe seam because it keeps the existing modal props,
visibility guard, selected `orchestratorResult`, close/reset helper wiring,
prepare/capture helper wiring, and fixture-only surface intact.

## Behavior Preservation

- Modal visibility remains controlled by `isExecutionPreviewOpen`.
- The modal still renders only when `uiStatus.visible` and
  `orchestratorResult.selectedIntent` are present.
- `ExecutionHandoffPreviewModal` still receives the same
  `orchestratorResult`.
- Selected handoff and payload semantics remain derived from the existing
  orchestrator result.
- Prepare and capture initial states remain idle.
- Dev/mock capture initial fields remain unchanged.
- Lifecycle snapshot pass-through remains unchanged.
- Close/reset helper wiring remains unchanged.
- Prepare/capture helper wiring remains unchanged.
- The live-position open path remains inline and deferred.
- Effects were not changed.

## Boundaries Verified

- No server-only import was added to the UI path.
- No audit writer server import was added.
- No service-role, env, Supabase, route/fetch, browser storage, or browser
  global access was added to the modal helper.
- No broker/Avanza behavior was added.
- Automatic mode was not enabled.
- Audit writer rollout and runtime persistence paths were not touched.

## Tests

Updated:

`tests/e2e/execution-modal-open-path-baseline.spec.ts`

`tests/e2e/execution-modal-state-helpers.spec.ts`

`tests/e2e/execution-modal-state-baseline.spec.ts`

The updated tests prove:

- `ExecutionSandboxFixtureCard` uses `openExecutionModalState(...)`;
- sandbox modal visibility uses helper output;
- sandbox modal props and selected result behavior remain unchanged;
- `ActivePositionCard` remains unwired and deferred;
- close/reset helper wiring remains present;
- prepare/capture helper wiring remains present;
- modal helper client-safety boundaries remain intact.

Focused validation passed for the new open-path spec with 8 tests after
rerunning outside the sandbox because the sandbox blocked Playwright's local
listener.

## Not Performed

- No live-position open path wiring.
- No component extraction.
- No broad UI wiring.
- No runtime behavior change beyond helper-equivalent sandbox open replacement.
- No audit writer path change.
- No DB query, live proof, live insert, migration, type generation, or
  generated type edit.
- No `.env.local` change.

## Recommended Next Action

Action 910 - Wire Modal Helpers Into Live Position Open Path.
