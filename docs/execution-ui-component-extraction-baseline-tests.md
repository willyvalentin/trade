# Execution UI Component Extraction Baseline Tests

## Action 930 Update - Extraction Summary Created

- Created `docs/execution-ui-component-extraction-summary.md`.
- Baseline/source-characterization coverage remains unchanged and continues to
  describe the extracted component map and safety boundaries.
- Status: `execution_ui_component_extraction_summary_created`.
- Recommended next action: Action 931 - Create Live Position Execution UI
  Coupling Inventory.

## Action 929 Update - Local Persistence Viewers Extracted

- Extracted the execution event log viewer and local execution records viewer to
  dedicated client-safe component paths.
- Updated baseline/source-characterization tests to prove the new component
  paths, parent imports, parent-owned refresh/clear callbacks, unchanged local
  persistence helper wiring, preserved local-only/no-real-broker copy, and no
  server write-path imports.
- Dev/mock broker result controls remain inline and unchanged.
- Status: `execution_local_persistence_viewers_extracted`.
- Recommended next action: Action 930 - Continue Execution UI Component
  Extraction With Remaining Approved Seam.

## Action 928 Update - Execution Settings Panel Extracted

- Extracted the execution settings panel to
  `components/execution/execution-settings-panel.tsx`.
- Updated baseline/source-characterization tests to prove the settings panel is
  exported from the dedicated client-safe path, imported by `app/settings/page.tsx`,
  and still receives the parent-owned execution mode update callback.
- Settings persistence helper wiring, automatic-mode gating, save/status
  behavior, audit/local viewers, dev/mock controls, and audit writer runtime
  paths remain unchanged.
- Status: `execution_settings_panel_extracted`.
- Recommended next action: Action 929 - Extract Execution Local Persistence
  Viewer Components.

## Action 927 Update - Handoff Preview Modal Extracted

- Extracted `ExecutionHandoffPreviewModal` to
  `components/execution/execution-handoff-preview-modal.tsx`.
- Updated baseline/source-characterization tests to prove the modal is exported
  from the dedicated client-safe path and no longer defined inline in
  `app/trade-app.tsx`.
- Preserved sandbox fixture card render path, live position modal render path,
  modal open/close helper behavior, modal copy, prepare/capture helper behavior,
  and safety boundaries.
- Status: `execution_handoff_preview_modal_extracted`.
- Recommended next action: Action 928 - Extract Execution Settings Panel
  Component.

## Action 926 Update - Sandbox Fixture Card Extracted

- Extracted `ExecutionSandboxFixtureCard` to
  `components/execution/execution-sandbox-fixture-card.tsx`.
- Updated the baseline spec to prove the component is exported from the
  dedicated client-safe path, `app/trade-app.tsx` imports it, and the inline
  card function no longer exists in the parent.
- The existing handoff modal remains in `app/trade-app.tsx` and is passed to
  the extracted card through `renderHandoffPreviewModal`.
- Focused baseline result: 8 tests passed.
- Status: `execution_sandbox_fixture_card_extracted`.
- Recommended next action: Action 927 - Extract Execution Handoff Preview Modal
  Component.

Action: 925
Date: 2026-06-27
Status: `execution_ui_component_extraction_baseline_tests_added`

## Purpose

This action adds baseline tests before execution UI component extraction. It is
tests/docs only: no runtime JSX was moved, no component was extracted, and no
runtime behavior was changed.

The baseline is designed to protect the first extraction seam selected by
Action 924 while preserving all existing helper wiring, state behavior, and
safety boundaries.

## Selected Seam

Selected seam: `ExecutionSandboxFixtureCard` in `app/trade-app.tsx`.

It remains the smallest safe first extraction seam because it is local/dev-only,
fixture-backed, already uses the orchestrator/UI status/lifecycle adapter/modal
helper boundaries, has one small modal open state, and does not sit on the live
trade close/stats/PnL mutation path.

Deferred seams:

- `ExecutionHandoffPreviewModal`, because it has dense local state, Escape-key
  effect, local lifecycle transitions, preparation/capture stubs, and dev
  diagnostics.
- `ActivePositionCard` execution area, because it sits beside real live-position
  close/detail behavior.
- Settings execution mode section, because automatic-mode lock copy and
  persistence behavior are safety-sensitive.
- Execution audit log, local records, and dev/mock broker result viewers,
  because their refresh/clear/capture callbacks remain page-owned local
  persistence handlers.

## Current Baseline Scope

The new baseline locks:

- sandbox fixture panel copy: `DEV FIXTURE`, `Not a real trade`, `Does not
  write Supabase`, `Execution Sandbox Fixture`, local in-memory QA copy, and
  Playwright QA copy;
- fixture card copy and fixture data for stop-loss and target fixtures;
- detail labels: Current, Target, Stop, Quantity;
- local-only/sandbox copy that the fixture cannot be closed or saved as a
  trade;
- status surface derivation through `runExecutionOrchestrator(...)`,
  `buildExecutionUiStatusFromOrchestratorResult(...)`, and
  `buildExecutionLifecycleUiState(...)`;
- lifecycle UI adapter output for the stop-loss fixture, including status,
  severity, CTA, readiness hint, summary rows, and debug metadata;
- modal open/close behavior through `openExecutionModalState(...)` and
  `closeExecutionModalState()`;
- modal copy through `buildExecutionLifecycleModalCopy(...)`;
- prepare/capture helper behavior through `applyExecutionPrepareResult(...)`
  and `applyExecutionCaptureResult(...)`;
- manual/semi-auto and automatic authority/status boundaries;
- static source wiring showing the sandbox card remains inline and not yet
  extracted.

## Test Approach

Added:

- `tests/e2e/execution-ui-component-extraction-baseline.spec.ts`

The test approach combines:

- static source characterization of the inline `ExecutionSandboxFixturePanel`
  and `ExecutionSandboxFixtureCard`;
- importable helper/adapter assertions for orchestrator result, status surface,
  lifecycle UI adapter output, modal state, modal copy, prepare/capture helper
  behavior, and execution authority;
- boundary assertions proving the sandbox card and client-safe helpers do not
  import server-only audit writer paths, service-role aliases, Supabase clients,
  audit writer routes, or direct table operations.

No fixture-local production JSX replica was added. No runtime test helper was
required.

## Coverage Map

| Surface | Coverage |
| --- | --- |
| Sandbox fixture panel | Static copy and fixture-map source assertions |
| Sandbox fixture card | Static card copy, detail labels, local-only copy, and source wiring assertions |
| Status surface | Orchestrator-derived stop-loss fixture status assertion |
| Lifecycle UI adapter | `buildExecutionLifecycleUiState(...)` status, CTA, readiness, summary, and debug assertions |
| Modal open/close | `openExecutionModalState(...)` and `closeExecutionModalState()` assertions |
| Modal copy | `buildExecutionLifecycleModalCopy(...)` assertions |
| Prepare/capture CTAs | `applyExecutionPrepareResult(...)` and `applyExecutionCaptureResult(...)` success/failure assertions |
| Manual/semi-auto boundary | Semi-auto authority and prepare-only status assertions |
| Automatic boundary | Automatic authority/status assertions with no order-submission behavior assertion |
| Deferred surfaces | Static assertions that live position, settings, audit log, records, and dev/mock viewers remain in place |
| Safety boundary | Static checks for no server-only/audit-writer/Supabase/service-role/route/table-operation imports |

## Boundaries Verified

- No audit writer server import was added.
- No service-role alias or value was used or printed.
- No Supabase client, query, insert, update, delete, upsert, select, migration,
  type generation, or generated type edit was performed.
- No route/fetch access was added to the sandbox fixture card baseline.
- Existing modal helper wiring remains unchanged.
- Existing local persistence helper wiring remains unchanged.
- Existing settings persistence helper wiring remains unchanged.
- Lifecycle UI adapter wiring was not broadened.
- No broker/Avanza behavior was added.
- No automatic order submission behavior was added.
- Automatic mode was not enabled.
- Live position UI, settings UI, audit log viewer, local records viewer, and
  dev/mock broker result controls remain deferred.
- No trade/stats/PnL behavior changed.
- Audit writer runtime persistence and rollout flags remain untouched.

## Gaps And Limitations

- Full DOM-level rendering of `ExecutionSandboxFixtureCard` is deferred until
  the component is extracted or a separately approved test harness exists.
- The modal body remains too coupled for full pre-extraction UI rendering
  coverage; current tests lock the helper-derived modal state/copy and static
  source wiring instead.
- Prepare/capture CTA click behavior is characterized through helper state
  transitions, not a browser click on the inline modal.
- Live-position execution UI, settings UI, and local viewer components remain
  parent-owned and deferred for later extraction actions.
- Action 926 should preserve the current parent-owned open/close state unless
  a tiny presentational prop boundary is explicitly chosen and covered by tests.

## Result Status

`execution_ui_component_extraction_baseline_tests_added`

## Recommended Next Action

Action 926 - Extract Read-Only Execution Sandbox Fixture Card Component.
