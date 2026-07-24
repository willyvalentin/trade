# Execution Modal Open Path Baseline Tests

## Action 911 Summary Update

Action 911 summarized the completed open-path wiring trail and did not change
the Action 908-910 test coverage. The recommended next action is Action 912 -
Create Execution Event Log/Local Storage Coupling Inventory.

Status:
`execution_modal_open_path_wiring_summary_created`.

## Action 910 Live Position Wiring Update

Action 910 wired `ActivePositionCard` to use
`openExecutionModalState(...)` for helper-backed live-position modal
visibility.

Both modal open paths now use helper output: sandbox with `source: "fixture"`
and live position with `source: "live_position"`. Close/reset and
prepare/capture helper wiring remain unchanged.

Result status:
`execution_modal_open_path_live_position_wired`.

## Action 909 Sandbox Wiring Update

Action 909 consumed this baseline for the first selected seam and wired
`ExecutionSandboxFixtureCard` to use `openExecutionModalState(...)` for
helper-backed modal visibility.

The live-position seam remains deferred and unwired. The baseline tests now
prove sandbox helper usage, live-position non-usage, unchanged modal props,
unchanged close/reset wiring, unchanged prepare/capture wiring, and unchanged
client-safety boundaries.

Result status:
`execution_modal_open_path_sandbox_wired`.

## Purpose

Action 908 adds baseline tests for execution modal open path behavior before
wiring modal helpers into the open path.

This is tests/docs only. It does not wire the open path, change runtime code,
change close/reset wiring, change prepare/capture wiring, change handlers,
change effects, change state mutation behavior, extract components, broaden the
lifecycle UI adapter, or touch audit writer runtime persistence.

Result status:
`execution_modal_open_path_baseline_tests_added`.

## Selected Seam

Selected first seam:

`ExecutionSandboxFixtureCard`

Why this is the smallest safe first seam:

- it is fixture/dev-preview oriented;
- it uses the same `ExecutionHandoffPreviewModal` contract;
- it owns one local `isExecutionPreviewOpen` boolean;
- it is lower risk than the live-position card;
- it can prove helper-owned open visibility in a later action without changing
  live trade behavior.

Deferred seam:

`ActivePositionCard`

The live-position open path remains a later seam because it sits inside the
live trade position surface and should be wired only after the fixture seam is
covered and proven.

## Current Baseline Scope

The new baseline locks:

- sandbox fixture open visibility remains inline and boolean-based;
- sandbox fixture open path passes `orchestratorResult` into
  `ExecutionHandoffPreviewModal`;
- live-position open path remains inline and documented as the later seam;
- selected handoff and selected payload shape from helper-equivalent open state;
- preparation initial status/message/error;
- capture initial status/message/error;
- dev/mock capture initial fields;
- lifecycle snapshot pass-through from `result.lifecycle`;
- modal copy/readiness compatibility with the existing lifecycle UI adapter;
- manual/semi-automatic readiness boundaries;
- automatic mode remains a non-executing placeholder baseline;
- no broker/Avanza behavior is introduced.

## Test Approach

Added:

`tests/e2e/execution-modal-open-path-baseline.spec.ts`

The tests combine:

- source characterization of the current inline open paths in
  `app/trade-app.tsx`;
- helper-equivalent open state checks using `openExecutionModalState(...)`;
- modal copy compatibility checks using
  `buildExecutionLifecycleModalCopy(...)`;
- client-safety scans against `lib/execution-modal-state-helpers.ts`.

Fixture-local replicas are used for helper state shape because the production
open path remains inline and unwired until Action 909.

Behavior that remains limited before wiring:

- direct production state assertions for helper-owned open state are not
  possible until the open setter consumes helper output;
- live-position helper wiring remains intentionally deferred;
- no full modal state holder is introduced in this action.

## Coverage Map

- open action -> modal visibility:
  source characterization locks `setIsExecutionPreviewOpen(true)` in both
  current open paths.
- open action -> selected payload/handoff:
  helper-equivalent fixture open state locks selected intent, handoff, payload
  id, and payload fingerprint.
- open action -> initial prepare/capture status:
  helper-equivalent open state locks idle preparation/capture state and empty
  message/error fields.
- open action -> dev/mock capture fields:
  helper-equivalent open state locks submitted broker status plus empty
  executed price, order id, and broker timestamp.
- open action -> lifecycle snapshot/modal copy compatibility:
  helper-equivalent open state locks `handoff_created` lifecycle pass-through,
  and adapter modal copy remains compatible with the existing status surface.

## Boundaries Verified

- no audit writer server import;
- no service-role/env/Supabase access;
- no route/fetch/browser storage access from modal helpers;
- no broker/Avanza behavior;
- no automatic mode enablement;
- no trade/stats/PnL mutation;
- no runtime behavior change;
- close/reset helper wiring remains unchanged;
- prepare/capture helper wiring remains unchanged;
- open path remains unwired.

## Gaps And Limitations

- live-position open path remains a later seam;
- direct production helper-open assertions remain limited until Action 909;
- current open behavior is inline in `app/trade-app.tsx`;
- production callers currently store only boolean visibility rather than full
  helper state;
- future wiring should keep modal props unchanged for the first seam.

## Recommended Next Action

Action 909 - Wire Modal Helpers Into Sandbox Open Path.
