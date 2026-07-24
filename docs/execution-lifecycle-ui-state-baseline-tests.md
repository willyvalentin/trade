# Execution Lifecycle UI State Baseline Tests

## Action 900 Integration Summary Update

Action 900 summarized the baseline and adapter coverage from Actions 895-899.
The baseline remains the reference for future modal state/helper extraction
planning.

Status:
`execution_lifecycle_ui_state_adapter_integration_summary_created`

Recommended next action: Action 901 - Create Execution Modal State Helper
Extraction Plan.

## Action 899 Duplication Removal Update

Adapter tests now prove `ExecutionSandboxFixtureCard` consumes
`uiState.statusSurface` and no longer owns a local `uiStatusForSurface` mapping.
Baseline behavior remains unchanged.

Status:
`execution_lifecycle_ui_state_adapter_duplicated_inline_logic_removed`

Recommended next action: Action 900 - Create Execution Lifecycle UI Adapter
Integration Summary.

## Action 898 Modal Copy Expansion Update

Adapter tests now cover modal core summary copy preservation through
`buildExecutionLifecycleModalCopy(...)` and verify the modal wiring is limited
to exactly one `coreSummaryProps` surface.

The baseline behavior remains unchanged.

Status:
`execution_lifecycle_ui_state_adapter_modal_copy_wired_one_surface`

Recommended next action: Action 899 - Remove Duplicated Inline Derived UI
Logic.

## Action 897 Read-Only Wiring Update

The baseline now has a companion adapter regression proving
`app/trade-app.tsx` imports `buildExecutionLifecycleUiState(...)` and uses it
from exactly one read-only sandbox fixture status surface. The live position
status surface remains on the previous direct `liveExecutionStatus` path.

No baseline behavior, handlers, effects, persistence, lifecycle transitions,
audit writer path, rollout flags, broker/Avanza behavior, automatic mode,
migration, type generation, generated types, `.env.local`, or service-role
behavior changed.

Status:
`execution_lifecycle_ui_state_adapter_wired_one_read_only_surface`

Recommended next action: Action 898 - Expand Adapter Coverage To Modal Copy.

## Action 896 Adapter Implementation Update

Action 896 implemented
`lib/execution-lifecycle-ui-state-adapter.ts` and added
`tests/e2e/execution-lifecycle-ui-state-adapter.spec.ts`.

The baseline tests remain active and were updated only to confirm the adapter
boundary is now implemented and still client-safe.

Status:
`execution_lifecycle_ui_state_adapter_implemented_client_safe`

Recommended next action: Action 897 - Wire Adapter Into One Read-Only UI
Surface.

## 1. Purpose

Action 895 adds baseline tests before the execution lifecycle UI state
adapter/view-model extraction planned in Action 894.

This is tests/docs only. It does not modify runtime behavior, extract
components/helpers, change state behavior, change effects, modify the audit
writer runtime persistence path, change rollout flags, add audit writer
UI/browser/client invocation, add market-loop/scanner audit invocation, add
broker/Avanza behavior, enable automatic mode, mutate trades/stats/PnL, run a
live proof, run a live insert, run select/query/remote SQL, call the
service-role adapter, perform cleanup/backout, run migrations, run type
generation, edit generated types, modify `.env.local`, or print service-role
values.

## 2. Current Baseline Scope

The new baseline tests lock the currently importable pure lifecycle UI-derived
state surfaces:

- lifecycle status labels;
- severity and badge-tone mapping;
- CTA type and label mapping;
- enabled/disabled state for `canPrepareOrder` and `canSubmitFinalOrder`;
- blocked/disabled reasons for blocked, invalid, failed, cancelled, and
  unknown states;
- readiness/copy hints currently exposed through pure status titles and
  descriptions;
- manual-confirmation CTA distinction for buy and sell lifecycles;
- debug-safe, metadata-light status output shape;
- client-safe/no-server-import boundaries for current pure helpers;
- existing lifecycle state-machine transition semantics.

## 3. Test Approach

Tests added:

- `tests/e2e/execution-lifecycle-ui-state-baseline.spec.ts`

Fixtures used:

- local `ExecutionIntent` fixtures constructed in the test file;
- `runExecutionOrchestrator(...)` for current no-action, semi-automatic ready,
  and automatic ready status behavior;
- local blocked and invalid handoff fixtures for current blocked/review status;
- `createExecutionLifecycleSnapshot(...)` and
  `transitionExecutionLifecycle(...)` for lifecycle state-machine semantics.

Helpers imported:

- `buildExecutionUiStatusFromLifecycle(...)`;
- `buildExecutionUiStatusFromOrchestratorResult(...)`;
- `createExecutionLifecycleSnapshot(...)`;
- `transitionExecutionLifecycle(...)`;
- `getExecutionLifecycleDisplayLabel(...)`;
- `runExecutionOrchestrator(...)`.

No production logic was extracted. No adapter module was implemented. The
planned `lib/execution-lifecycle-ui-state-adapter.ts` path remains absent until
Action 896.

Mappings still buried inside `app/trade-app.tsx`:

- full modal copy assembly;
- handoff modal progress/capture/preparation messages;
- local event-log display composition;
- some disabled reasons assembled from modal-local state;
- debug panel row grouping and display ordering.

Those mappings are documented as gaps because extracting or exporting them
would be a runtime refactor and is outside Action 895.

## 4. Coverage Map

| Surface | Baseline locked |
| --- | --- |
| `idle` lifecycle | Hidden status, neutral severity, muted badge, no CTA, no prepare/final-submit ability |
| `intent_created` | `INTENT CREATED`, info severity, no CTA |
| `candidate_selected` | `CANDIDATE SELECTED`, info severity, no CTA |
| `handoff_created` | `HANDOFF READY`, info severity, `prepare_avanza_order`, `canPrepareOrder: true` |
| `broker_order_preparing` | `PREPARING`, info severity, no CTA |
| `waiting_for_manual_confirmation` buy | `MANUAL CONFIRMATION`, warning severity, `waiting_manual_buy` |
| `waiting_for_manual_confirmation` sell | `MANUAL CONFIRMATION`, warning severity, `waiting_manual_sell` |
| `broker_order_submitting` | `SUBMITTING`, info severity, no CTA |
| `broker_result_captured` | `RESULT CAPTURED`, success severity, no CTA |
| `completed` | `COMPLETED`, success severity, no blocked reason |
| `failed` | `FAILED`, danger severity, review CTA, blocked reason |
| `cancelled` | `CANCELLED`, warning severity, blocked reason |
| `unknown` | `UNKNOWN`, warning severity, review CTA, blocked reason |
| no-action orchestrator result | Hidden status, neutral severity, no CTA |
| semi-automatic ready handoff | `ENTRY READY`, `Prepare in Avanza`, prepare allowed, final-submit blocked |
| automatic ready handoff | `ENTRY READY`, `Automatic execution ready`, prepare allowed, final-submit allowed |
| blocked handoff | `BLOCKED`, danger severity, blocked CTA, blocked reason |
| invalid handoff | `REVIEW REQUIRED`, warning severity, review CTA, blocked reason |
| state-machine sequence | Existing ordered transition chain to `completed` |
| terminal transition block | Terminal `completed` blocks new transition |
| debug-safe output | Status output contains no service-role, Supabase, secret, token, or audit-table metadata |
| client-safe imports | Current pure helpers have no server-only/audit writer/service-role/Supabase/fetch/storage/write imports |

Automatic/semi-automatic safety:

- Automatic mode is characterized only as current display/status behavior.
- The tests do not enable automatic execution, submit orders, call broker code,
  call Avanza, or add runtime invocation.

## 5. Boundaries Verified

The baseline tests verify that current pure lifecycle UI helpers do not import
or reference:

- `server-only`;
- audit writer server modules;
- server-only lifecycle transition service;
- service-role values or aliases;
- Supabase clients;
- route/fetch calls;
- browser storage;
- insert/update/delete/upsert/select write-path methods.

This action also confirms:

- no audit writer server import was added;
- no service-role/env/Supabase usage was added;
- no broker/Avanza behavior was added;
- no automatic mode enablement was added;
- no trade/stats/PnL mutation was added;
- no runtime behavior changed.

## 6. Gaps And Limitations

Some UI-derived lifecycle state remains difficult to test directly before
extraction because it is assembled inline inside `app/trade-app.tsx`, especially
inside `ExecutionHandoffPreviewModal`.

Remaining gaps:

- full modal copy/readiness text beyond pure status title/description;
- modal-local progress/preparation/capture messages;
- local event-log display row grouping;
- debug panel grouping;
- modal-local disabled reasons that depend on several local state fields.

Action 896 should implement the adapter by moving only pure, deterministic,
client-safe derivation into `lib/execution-lifecycle-ui-state-adapter.ts`.
Handler/effect/localStorage changes should remain blocked until the adapter is
implemented and wired into one read-only surface.

## 7. Result Status

`execution_lifecycle_ui_state_baseline_tests_added`

## 8. Recommended Next Action

Action 896 - Implement Execution Lifecycle UI State Adapter.
