# Execution Modal Open Path Wiring Plan

## Action 911 Summary Update

Action 911 created the modal open path wiring summary after both planned seams
were wired. The plan is now complete for open-path helper wiring.

Status:
`execution_modal_open_path_wiring_summary_created`.

Next:
Action 912 - Create Execution Event Log/Local Storage Coupling Inventory.

## Action 910 Live Position Wiring Update

The second planned seam is now wired: `ActivePositionCard` uses
`openExecutionModalState({ result: liveExecutionOrchestratorResult, source:
"live_position" })` and keeps the existing local visibility boolean by applying
`opened.isOpen`.

Both open paths are now helper-backed. No component extraction, effects change,
audit writer path change, DB/query/live proof, migration, type generation,
generated type edit, or `.env.local` change was performed.

Status:
`execution_modal_open_path_live_position_wired`.

Next:
Action 911 - Create Modal Open Path Wiring Summary.

## Action 909 Sandbox Wiring Update

The first planned seam is now wired: `ExecutionSandboxFixtureCard` uses
`openExecutionModalState({ result: orchestratorResult, source: "fixture" })`
and keeps the existing local visibility boolean by applying `opened.isOpen`.

`ActivePositionCard` remains the deferred live-position seam. No component
extraction, effects change, audit writer path change, DB/query/live proof,
migration, type generation, generated type edit, or `.env.local` change was
performed.

Status:
`execution_modal_open_path_sandbox_wired`.

Next:
Action 910 - Wire Modal Helpers Into Live Position Open Path.

## Action 908 Baseline Tests Update

Action 908 created `tests/e2e/execution-modal-open-path-baseline.spec.ts` and
`docs/execution-modal-open-path-baseline-tests.md`.

The baseline tests lock the selected first seam, `ExecutionSandboxFixtureCard`,
while documenting the live-position open path as the later seam.

Status:
`execution_modal_open_path_baseline_tests_added`

Recommended next action: Action 909 - Wire Modal Helpers Into Sandbox Open
Path.

## Purpose

Action 907 plans future wiring of the existing client-safe execution modal state
helpers into the execution modal open path.

This is documentation-only. It does not modify runtime code, wire the open path,
change close/reset wiring, change prepare/capture wiring, change handlers,
change effects, change state mutation behavior, extract components, broaden
adapter wiring, or touch audit writer runtime persistence.

Result status:
`execution_modal_open_path_wiring_plan_created`.

## Current Open Path Inventory

Primary file:

`app/trade-app.tsx`

Current open-path areas:

- `ExecutionSandboxFixtureCard` owns fixture-local execution preview visibility
  with `const [isExecutionPreviewOpen, setIsExecutionPreviewOpen] =
  useState(false)`.
- The sandbox fixture open path is
  `LiveExecutionStatusSurface` -> `onViewHandoff={() =>
  setIsExecutionPreviewOpen(true)}`.
- The sandbox fixture renders `ExecutionHandoffPreviewModal` when
  `isExecutionPreviewOpen`, `uiStatus.visible`, and
  `orchestratorResult.selectedIntent` are truthy.
- `ActivePositionCard` owns live-position execution preview visibility with
  `const [isExecutionPreviewOpen, setIsExecutionPreviewOpen] = useState(false)`.
- The live-position open path is
  `LiveExecutionStatusSurface` -> `onViewHandoff={() =>
  setIsExecutionPreviewOpen(true)}`.
- The live-position path renders `ExecutionHandoffPreviewModal` when
  `isExecutionPreviewOpen`, `liveExecutionStatus?.visible`, and
  `liveExecutionOrchestratorResult?.selectedIntent` are truthy.

Selected payload and handoff setup:

- Both open paths pass an `ExecutionOrchestratorResult` into
  `ExecutionHandoffPreviewModal`.
- The modal derives `intent` from `result.selectedIntent`.
- The modal derives `handoff` from `result.handoff`.
- The modal derives the starting lifecycle snapshot from `result.lifecycle`.

Preview visibility setup:

- Visibility remains a local boolean in the caller card.
- Opening currently sets only `isExecutionPreviewOpen` to `true`.
- Closing now consumes `closeExecutionModalState().isOpen`, preserving
  `false`.

Prepare/capture initial state setup:

- `ExecutionHandoffPreviewModal` initializes `localLifecycle` from
  `result.lifecycle`.
- `captureBaseLifecycle` initializes to `null`.
- preparation message/error initialize to empty strings.
- capture message/error initialize to empty strings.
- capture status defaults to empty modal copy until a dev/mock capture action
  runs.

Dev/mock capture initial state setup:

- `stubBrokerStatus` initializes to `"submitted"`.
- `stubExecutedPrice`, `stubOrderId`, and `stubBrokerTimestamp` initialize to
  empty strings.
- `stubCaptureResult` initializes to `null`.
- agent progress initializes to `"agent_started"`, empty timeline, and empty
  message/error fields.

Modal copy/readiness relationship:

- The modal receives `status: ExecutionUiStatus` from the current caller.
- Modal copy currently uses `buildExecutionLifecycleModalCopy({ status,
  lifecycle: localLifecycle })`.
- Readiness and action availability still depend on the existing modal-local
  lifecycle, handoff, dev-tools flags, and request previews.

Lifecycle snapshot pass-through:

- The initial lifecycle snapshot is passed through `result.lifecycle`.
- Future open-path wiring must preserve this exact snapshot handoff.

## Current Helper Readiness

Existing helper API:

- `openExecutionModalState({ result, source })` creates open helper state from an
  `ExecutionOrchestratorResult`.
- `createClosedExecutionModalState()` and `closeExecutionModalState()` define
  closed/reset shape.
- `applyExecutionPrepareResult(...)` and `applyExecutionCaptureResult(...)`
  already support already-computed lifecycle snapshots used by the production
  modal handlers.

Readiness assessment:

- The helper already models selected intent, selected handoff, initial
  lifecycle, closed/open visibility, preparation state, capture state, dev/mock
  capture fields, and agent progress shape.
- The helper currently requires a `source` value of `"fixture"` or
  `"live_position"` for open state.
- The helper can preserve current open behavior for tests and future production
  wiring if the caller maps fixture and live-position sources explicitly.

Potential missing inputs:

- Production callers currently store only a boolean visibility flag, not the
  full helper state.
- Future wiring may choose either to keep caller visibility booleans and consume
  `openExecutionModalState(...).isOpen`, or to introduce a fuller modal state
  holder in a later action.
- The first wiring action should avoid changing modal props or introducing a
  full state-holder refactor unless baseline tests prove it is safe.

## Proposed Wiring Strategy

There are two current open paths, so the staged strategy is:

1. Action 908 - Add Execution Modal Open Path Baseline Tests.
2. Action 909 - Wire Modal Helpers Into One Open Path.
3. Action 910 - Wire Modal Helpers Into Remaining Open Path.
4. Action 911 - Create Open Path Wiring Summary.

Action 908 should expand source-characterization and helper tests before any
runtime change. It should lock the current inline open behavior and prove that
the helper can reproduce the selected state for both fixture and live-position
sources.

Action 909 should wire one low-risk open path only.

Action 910 should wire the remaining path only after Action 909 coverage passes.

Action 911 should summarize what was wired, what remained unchanged, and what
future extraction seams still exist.

## Selected First Seam

Recommended first seam:

`ExecutionSandboxFixtureCard`

Why:

- it is fixture/dev-preview oriented;
- it uses the same `ExecutionHandoffPreviewModal` contract;
- it already has a single local visibility boolean;
- it is lower risk than the live-position card because it does not sit inside
  the live trade details/position card surface;
- it can prove helper-owned open visibility without changing live trade
  behavior.

Proposed first wiring shape:

- keep `ExecutionHandoffPreviewModal` props unchanged;
- keep selected payload/handoff derived from `orchestratorResult`;
- replace only the fixture open setter with helper-equivalent visibility output,
  such as `openExecutionModalState({ result: orchestratorResult, source:
  "fixture" }).isOpen`;
- do not introduce a full helper state holder in the first runtime wiring step.

## Behavior Preservation Requirements

Future wiring must preserve:

- selected handoff and selected payload;
- modal visibility behavior;
- preparation initial status/message/error;
- capture initial status/message/error;
- dev/mock capture initial fields;
- manual and semi-automatic mode copy boundaries;
- automatic-mode placeholder behavior without enabling real automatic
  execution;
- lifecycle snapshot data from `result.lifecycle`;
- existing async order;
- existing effects;
- existing modal rendering and props;
- existing close/reset helper wiring;
- existing prepare/capture result helper wiring.

## Test Strategy Before Wiring

Action 908 should add or expand tests for:

- fixture open state with selected handoff/payload;
- live-position open state with selected handoff/payload;
- open state visibility;
- preparation initial status/message/error;
- capture initial status/message/error and dev/mock capture defaults;
- lifecycle snapshot pass-through;
- manual and semi-automatic mode boundaries;
- automatic-mode placeholder staying non-executing;
- no broker/Avanza behavior;
- helper determinism;
- no server-only imports;
- no audit writer imports;
- no Supabase/env/service-role/fetch/browser-storage access in modal helpers;
- no production route or audit writer client invocation.

## Safety Boundaries

Future open-path wiring must preserve:

- no audit writer client invocation;
- no market/scanner invocation;
- no broker/Avanza behavior;
- no automatic mode enablement;
- no trade/stats/PnL mutation changes;
- no service-role exposure;
- no migrations or type generation;
- no generated type edits;
- no `.env.local` changes;
- no live proof, live insert, select/query, or remote SQL;
- audit writer server-only rollout remains untouched.

## Risks

Open-path wiring risks:

- modal opens without selected payload;
- modal opens without selected handoff;
- stale handoff data is preserved;
- preparation status is not reset correctly;
- capture status is not reset correctly;
- dev/mock capture fields are not reset correctly;
- lifecycle snapshot is lost or replaced;
- modal copy/readiness mismatches the current lifecycle;
- open/close behavior changes accidentally;
- helper source mapping is wrong for fixture or live-position paths;
- audit writer or server-only boundary leaks into client/modal code.

Mitigation:

- add baseline tests before runtime wiring;
- wire one open path at a time;
- keep modal props unchanged for the first wiring action;
- continue static scans after every step;
- stop before live-position wiring if the fixture seam reveals behavior drift.

## Recommended Next Action

Action 908 - Add Execution Modal Open Path Baseline Tests.
