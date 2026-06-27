# Execution Lifecycle UI State Adapter Read-Only Wiring

## Action 900 Integration Summary Update

Action 900 summarized this read-only sandbox fixture wiring as the first
approved adapter UI surface. The live position status path remains unchanged.

Status:
`execution_lifecycle_ui_state_adapter_integration_summary_created`

Recommended next action: Action 901 - Create Execution Modal State Helper
Extraction Plan.

## Action 899 Duplication Removal Update

Action 899 removed the inline `uiStatusForSurface` status mapping from
`ExecutionSandboxFixtureCard`. The card now passes `uiState.statusSurface`
directly to `LiveExecutionStatusSurface`.

This preserves the Action 897 read-only surface while moving the duplicated
derived mapping into the adapter.

Status:
`execution_lifecycle_ui_state_adapter_duplicated_inline_logic_removed`

Recommended next action: Action 900 - Create Execution Lifecycle UI Adapter
Integration Summary.

## Action 898 Modal Copy Expansion Update

Action 898 preserves the Action 897 read-only sandbox fixture surface and adds
one modal-copy adapter surface in `ExecutionHandoffPreviewModal` core summary
props.

The Action 897 surface remains limited to `ExecutionSandboxFixtureCard`.

Status:
`execution_lifecycle_ui_state_adapter_modal_copy_wired_one_surface`

Recommended next action: Action 899 - Remove Duplicated Inline Derived UI
Logic.

## Purpose

Action 897 wires the execution lifecycle UI state adapter into exactly one
read-only UI surface. This is not broad UI wiring, not component extraction,
and not a runtime behavior change.

Result status:
`execution_lifecycle_ui_state_adapter_wired_one_read_only_surface`.

## Selected UI Surface

File: `app/trade-app.tsx`

UI area: `ExecutionSandboxFixtureCard` status display surface.

Previous inline logic:

- `ExecutionSandboxFixtureCard` ran `runExecutionOrchestrator(...)`;
- the card derived `uiStatus` directly with
  `buildExecutionUiStatusFromOrchestratorResult(orchestratorResult)`;
- the card passed `uiStatus` to `LiveExecutionStatusSurface`.

New adapter call:

- `ExecutionSandboxFixtureCard` still computes the same `uiStatus`;
- it also derives `uiState` with
  `buildExecutionLifecycleUiState({ source: "orchestrator", result })`;
- only the existing read-only `LiveExecutionStatusSurface` receives preserved
  display fields from the adapter output through `uiStatusForSurface`.

This is the smallest safe surface because the sandbox fixture card is local
QA/dev fixture display code, already read-only, already status-display focused,
and does not participate in trade mutation, effects, persistence, or lifecycle
transition handlers.

## Behavior Preservation

- labels are preserved through `uiState.statusLabel`;
- severity and badge tone are preserved through `uiState.severity` and
  `uiState.badgeTone`;
- CTA label/type and readiness flags are preserved through `uiState.cta`,
  `uiState.canPrepareOrder`, and `uiState.canSubmitFinalOrder`;
- the existing preview modal still receives the original `uiStatus`;
- no handlers were changed;
- no effects were changed;
- no local state was added;
- no persistence or lifecycle transition behavior was changed.

## Boundaries Verified

- no `server-only` import was added to UI;
- no audit writer server import was added to UI/client code;
- no service-role/env/Supabase access was added;
- no route/fetch call was added;
- no browser storage/global access was added;
- no broker/Avanza execution behavior was added;
- no automatic mode behavior was added or enabled;
- audit writer rollout and runtime persistence were untouched.

## Tests

Updated `tests/e2e/execution-lifecycle-ui-state-adapter.spec.ts` with a
source-boundary regression that proves:

- the adapter is imported by `app/trade-app.tsx`;
- the adapter is called from `ExecutionSandboxFixtureCard`;
- `LiveExecutionStatusSurface` receives `uiStatusForSurface` only in that
  sandbox fixture surface;
- the live position status surface remains on `liveExecutionStatus`;
- no `useEffect`, `localStorage`, or `fetch(...)` appears in the sandbox
  wiring block.

## Not Performed

- no broad UI wiring;
- no component extraction;
- no runtime behavior change;
- no handler/effect change;
- no localStorage or local event-log change;
- no audit writer path change;
- no rollout flag change;
- no database/query/live proof;
- no migration;
- no type generation;
- no generated type edit;
- no `.env.local` change;
- no service-role value printing.

## Recommended Next Action

Action 898 - Expand Adapter Coverage To Modal Copy.
