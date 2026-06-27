# Execution Modal Open Path Live Position Wiring

## Action 911 Summary Update

Action 911 created `docs/execution-modal-open-path-wiring-summary.md` to
summarize Actions 907-910. No runtime code, modal wiring, handlers, effects,
component extraction, audit writer path, database action, migration, type
generation, generated type edit, or `.env.local` change was performed.

Status:
`execution_modal_open_path_wiring_summary_created`.

## Purpose

Action 910 wires modal helper output into the live-position execution modal
open path.

This is limited wiring for `ActivePositionCard`. It is not a broad modal
refactor, component extraction, audit writer/runtime persistence change, or
database action.

Result status:
`execution_modal_open_path_live_position_wired`.

## Selected Path

File:

`app/trade-app.tsx`

Selected component:

`ActivePositionCard`

Previous open logic:

`LiveExecutionStatusSurface` opened the modal with inline boolean state:
`setIsExecutionPreviewOpen(true)`.

New helper-backed open logic:

`openExecutionModalState({
  result: liveExecutionOrchestratorResult,
  source: "live_position",
})`
is called inside the live-position open handler when a live execution
orchestrator result exists, and the existing local modal visibility boolean is
set from the helper output: `opened.isOpen`.

This is the next safe seam after Action 909 because sandbox open wiring already
proved helper-backed visibility while preserving modal props and helper
boundaries.

## Behavior Preservation

- Modal visibility remains controlled by `isExecutionPreviewOpen`.
- The modal still renders only when `liveExecutionStatus?.visible` and
  `liveExecutionOrchestratorResult?.selectedIntent` are present.
- `ExecutionHandoffPreviewModal` still receives the same
  `liveExecutionOrchestratorResult`.
- Selected handoff and payload semantics remain derived from the existing live
  execution orchestrator result.
- Prepare and capture initial states remain idle.
- Dev/mock capture initial fields remain unchanged.
- Lifecycle snapshot pass-through remains unchanged.
- Sandbox open helper wiring remains unchanged.
- Close/reset helper wiring remains unchanged.
- Prepare/capture helper wiring remains unchanged.
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

- `ExecutionSandboxFixtureCard` still uses `openExecutionModalState(...)`;
- `ActivePositionCard` now uses `openExecutionModalState(...)`;
- live-position modal visibility uses helper output;
- live-position modal props and selected result behavior remain unchanged;
- close/reset helper wiring remains present;
- prepare/capture helper wiring remains present;
- modal helper client-safety boundaries remain intact.

Focused validation passed for the open-path spec with 8 tests.

## Not Performed

- No component extraction.
- No broad UI wiring.
- No runtime behavior change beyond helper-equivalent live-position open
  replacement.
- No audit writer path change.
- No DB query, live proof, live insert, migration, type generation, or
  generated type edit.
- No `.env.local` change.

## Recommended Next Action

Action 911 - Create Modal Open Path Wiring Summary.
