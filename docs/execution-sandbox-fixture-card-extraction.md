# Execution Sandbox Fixture Card Extraction

## Action 930 Update - Extraction Summary Created

- Created `docs/execution-ui-component-extraction-summary.md`.
- The sandbox fixture card extraction remains intact.
- Status: `execution_ui_component_extraction_summary_created`.
- Recommended next action: Action 931 - Create Live Position Execution UI
  Coupling Inventory.

## Action 929 Update - Local Persistence Viewers Extracted

- Extracted the execution event log viewer to
  `components/execution/execution-audit-log-viewer.tsx`.
- Extracted the local execution records viewer to
  `components/execution/execution-local-records-viewer.tsx`.
- The sandbox fixture card extraction remains intact.
- Status: `execution_local_persistence_viewers_extracted`.
- Recommended next action: Action 930 - Continue Execution UI Component
  Extraction With Remaining Approved Seam.

## Action 928 Update - Execution Settings Panel Extracted

- Extracted the execution settings panel to
  `components/execution/execution-settings-panel.tsx`.
- The sandbox fixture card extraction remains intact and still receives the
  handoff preview modal through `renderHandoffPreviewModal`.
- Status: `execution_settings_panel_extracted`.
- Recommended next action: Action 929 - Extract Execution Local Persistence
  Viewer Components.

## Action 927 Update - Handoff Preview Modal Extracted

- Extracted `ExecutionHandoffPreviewModal` to
  `components/execution/execution-handoff-preview-modal.tsx`.
- The sandbox card extraction remains intact; `app/trade-app.tsx` now imports
  both the sandbox card and the extracted handoff modal.
- The sandbox card still receives the modal through `renderHandoffPreviewModal`.
- Status: `execution_handoff_preview_modal_extracted`.
- Recommended next action: Action 928 - Extract Execution Settings Panel
  Component.

Action: 926
Date: 2026-06-27
Status: `execution_sandbox_fixture_card_extracted`

## Purpose

This action extracts the read-only, sandbox-oriented
`ExecutionSandboxFixtureCard` into a dedicated client-safe component. The scope
is intentionally narrow: only the sandbox fixture card JSX and its existing
local preview-open state moved.

No live position UI, settings UI, audit/local records viewer, handoff modal
component, route, writer path, database action, or broker/Avanza behavior was
added.

## Extracted Component

New component path:

- `components/execution/execution-sandbox-fixture-card.tsx`

Exports:

- `ExecutionSandboxFixturePosition`
- `ExecutionSandboxFixtureCardProps`
- `ExecutionSandboxFixtureCard`

Props:

- `fixture`: the existing sandbox fixture data shape.
- `executionMode`: current execution mode from the parent.
- `renderHandoffPreviewModal`: parent-provided render callback for the existing
  `ExecutionHandoffPreviewModal`.

Client-safe helper/adapter dependencies:

- `runExecutionOrchestrator(...)`
- `buildExecutionUiStatusFromOrchestratorResult(...)`
- `buildExecutionLifecycleUiState(...)`
- `openExecutionModalState(...)`
- `closeExecutionModalState()`
- `LiveExecutionStatusSurface`
- shared `Detail`

Parent-owned state/effects that remain in `app/trade-app.tsx`:

- execution fixture list and fixture panel rendering;
- `ExecutionHandoffPreviewModal` implementation and Escape-key effect;
- live position card state/effects;
- settings, local persistence viewers, audit log viewers, and dev mock broker
  controls.

## Behavior Preservation

- Rendered copy, labels, fixture data, class names, and local-only safety copy
  are preserved.
- Status surface derivation remains based on the same orchestrator result,
  status adapter, and lifecycle UI adapter.
- Modal open/close behavior still uses `openExecutionModalState(...)` and
  `closeExecutionModalState()`.
- Prepare/capture/dev mock behavior remains inside the existing handoff modal.
- Manual/semi-auto authority and automatic-mode safety boundaries are
  unchanged.
- No broker/Avanza behavior or automatic order submission behavior was added.

## Scope Preserved

- `ExecutionHandoffPreviewModal` was not extracted.
- Live position UI was not extracted.
- Settings UI was not extracted.
- Audit log, local records, and dev/mock broker result viewers were not
  extracted.
- Modal helper wiring was not changed beyond the existing card open/close
  calls moving with the card.
- Local persistence helper wiring was not changed.
- Settings persistence helper wiring was not changed.
- Lifecycle UI adapter wiring was not broadened.

## Boundaries Verified

- The extracted component is a Client Component with `"use client";`.
- No `server-only` import was added.
- No audit writer server import was added.
- No service-role, env, or Supabase client usage was added.
- No route/fetch call was added.
- No new browser storage usage was added.
- No market-loop/scanner invocation was added.
- No broker/Avanza behavior was added.
- No automatic mode or automatic submit enablement was added.
- Audit writer runtime persistence and rollout flags remain untouched.

## Tests

Updated:

- `tests/e2e/execution-ui-component-extraction-baseline.spec.ts`

Coverage added/updated:

- proves `ExecutionSandboxFixtureCard` is exported from the approved component
  path;
- proves `app/trade-app.tsx` imports the extracted component and no longer
  contains the inline card function;
- proves the existing modal remains rendered by the parent through
  `renderHandoffPreviewModal`;
- preserves rendered copy, status surface, modal helper behavior,
  prepare/capture helper behavior, deferred seams, and safety scans.

Focused result:

- `npx playwright test tests/e2e/execution-ui-component-extraction-baseline.spec.ts`
  passed with 8 tests.

## Not Performed

- No broad component extraction.
- No runtime behavior change beyond JSX relocation.
- No handler/effect/state mutation behavior change.
- No audit writer path change.
- No database query, live proof, or live insert.
- No migrations, type generation, or generated type edits.
- No `.env.local` change.

## Result Status

`execution_sandbox_fixture_card_extracted`

## Recommended Next Action

Action 927 - Extract Execution Handoff Preview Modal Component.
