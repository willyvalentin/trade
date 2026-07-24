# Execution Lifecycle UI State Adapter Duplicated Inline Logic Removal

## Action 902 Modal State Baseline Tests Update

Action 902 added modal state baseline tests only. The Action 899 duplicated
inline status-surface removal remains unchanged.

Status:
`execution_modal_state_baseline_tests_added`

Recommended next action: Action 903 - Implement Execution Modal State Helpers.

## Action 901 Modal State Helper Plan Update

Action 901 is planning-only and does not alter the Action 899 duplicated inline
status-surface removal. The sandbox fixture continues to use adapter-owned
`statusSurface`.

Status:
`execution_modal_state_helper_extraction_plan_created`

Recommended next action: Action 902 - Add Execution Modal State Baseline Tests.

## Action 900 Integration Summary Update

Action 900 created the adapter integration summary for Actions 895-899. This
Action 899 removal remains the latest runtime cleanup step and is now included
in the summary as the duplicated inline status-surface mapping removal.

Status:
`execution_lifecycle_ui_state_adapter_integration_summary_created`

Recommended next action: Action 901 - Create Execution Modal State Helper
Extraction Plan.

## Purpose

Action 899 removes one duplicated inline derived lifecycle UI mapping after the
adapter wiring from Actions 897 and 898.

This is narrow behavior-preserving cleanup. It does not broaden adapter usage,
extract components, change handlers, change effects, change state mutation, or
change runtime behavior.

Result status:
`execution_lifecycle_ui_state_adapter_duplicated_inline_logic_removed`.

## Removed Duplication

File: `app/trade-app.tsx`

UI area: `ExecutionSandboxFixtureCard` status surface.

Previous inline logic:

- the card derived `uiState` with `buildExecutionLifecycleUiState(...)`;
- then it rebuilt an `ExecutionUiStatus` object inline as `uiStatusForSurface`;
- that object copied adapter fields such as label, severity, badge tone, title,
  description, CTA, and readiness flags back into status-surface shape.

Adapter output replacing it:

- `buildExecutionLifecycleUiState(...)` now exposes `statusSurface`;
- `ExecutionSandboxFixtureCard` passes `uiState.statusSurface` directly to
  `LiveExecutionStatusSurface`.

The behavior is equivalent because `statusSurface` uses the same source status,
CTA state, modal copy, and readiness flags that the removed inline object used.

## Scope Preserved

- Adapter usage remains limited to the approved surfaces:
  `ExecutionSandboxFixtureCard` and `ExecutionHandoffPreviewModal` core
  summary props.
- No live position status wiring was broadened.
- No modal wiring was broadened.
- No handlers were changed.
- No effects were changed.
- No state mutation was changed.

## Boundaries Verified

- no `server-only` import was added to UI;
- no audit writer server import was added to UI/client code;
- no service-role/env/Supabase usage was added;
- no route/fetch call was added;
- no browser storage/global access was added;
- no broker/Avanza execution behavior was added;
- no automatic mode behavior was added or enabled;
- audit writer rollout and runtime persistence were untouched.

## Tests

Updated `tests/e2e/execution-lifecycle-ui-state-adapter.spec.ts` to prove:

- `statusSurface` preserves the selected surface status fields;
- `ExecutionSandboxFixtureCard` uses `uiState.statusSurface`;
- the removed inline `uiStatusForSurface` object is absent;
- modal-copy adapter wiring remains limited to the existing core summary
  surface.

## Not Performed

- no broad UI wiring;
- no component extraction;
- no runtime behavior change;
- no handler/effect change;
- no state mutation change;
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

Action 900 - Create Execution Lifecycle UI Adapter Integration Summary.
