# Live Position Execution Status Surface Extraction

## Purpose

Action 933 extracted the read-only live position execution status surface into
a dedicated client-safe presentational component.

This action was intentionally narrow: it moved status display JSX/copy only.
Interactive live-position controls, modal behavior, close/reset behavior,
prepare/capture behavior, handlers, effects, state mutation, persistence helper
wiring, lifecycle adapter wiring, and audit writer runtime persistence remain
unchanged.

## Extracted Component

- New file:
  `components/execution/live-position-execution-status-surface.tsx`
- Exported component:
  `LivePositionExecutionStatusSurface`
- Props:
  - `status: ExecutionUiStatus`
  - `footerAction?: ReactNode`
- Client-safe dependencies:
  - React `ReactNode` type only
  - `ExecutionUiStatus`, `ExecutionUiSeverity`, and `ExecutionUiBadgeTone`
    types from `lib/execution-ui-status`

The component receives already-derived UI status from its parent. It does not
run the orchestrator, derive lifecycle state, open modals, call handlers,
write local storage, call routes, call Supabase, or import server-only modules.

`app/trade-app.tsx` still owns:

- `runExecutionOrchestrator(...)`
- `buildExecutionUiStatusFromOrchestratorResult(...)`
- `isExecutionPreviewOpen`
- `openExecutionPreviewModal`
- `closeExecutionPreviewModal`
- `ExecutionHandoffPreviewModal` rendering
- close/reset and close-position mutation paths

`components/live-day-trades/LiveExecutionStatusSurface.tsx` remains as a thin
compatibility wrapper for existing sandbox usage. It delegates the display
surface to the new component and keeps its existing `onViewHandoff` wrapper
behavior unchanged.

## Behavior Preservation

- Rendered status labels are unchanged.
- Severity and badge styling are unchanged.
- Mode labels remain `Automatic` and `Semi-auto`.
- Next-action copy remains derived from `status.ctaLabel` with the existing
  `Prepare in Avanza` fallback.
- The final-submit authority copy remains unchanged.
- The live-position `View handoff` button remains parent-owned in
  `ActivePositionCard`.
- Modal open/close behavior remains helper-backed and unchanged.
- Prepare/capture display and helper adjacency remain in
  `ExecutionHandoffPreviewModal`.
- No broker, Avanza, automatic order submission, or production write behavior
  was added.

## Scope Preserved

- Interactive live-position controls were not extracted.
- The live-position handoff CTA/control was not moved into the read-only
  component.
- Existing extracted components remain intact:
  - `ExecutionSandboxFixtureCard`
  - `ExecutionHandoffPreviewModal`
  - `ExecutionSettingsPanel`
  - `ExecutionAuditLogViewer`
  - `ExecutionLocalRecordsViewer`
- Modal helper wiring is unchanged.
- Local persistence helper wiring is unchanged.
- Settings persistence helper wiring is unchanged.
- Lifecycle UI adapter wiring is unchanged.
- Audit writer runtime persistence and rollout flags are untouched.

## Boundaries Verified

- No `server-only` import was added.
- No audit writer server import was added.
- No service-role, env, or Supabase access was added.
- No route or `fetch` call was added.
- No browser storage usage was added.
- No broker/Avanza behavior was added.
- No automatic mode enablement or automatic order submission behavior was
  added.
- No audit writer UI/browser/client/market-loop/scanner invocation was added.

## Tests

- Updated `tests/e2e/live-position-execution-ui-baseline.spec.ts` to prove the
  read-only status surface is extracted, rendered copy/styling is preserved,
  the handoff control remains parent-owned, and unsafe imports/write paths are
  absent.
- The focused live-position baseline spec passed with 10 tests after the
  extraction.
- Broader validation results are recorded in
  `docs/execution-agent-qa-notes.md`.

## Not Performed

- No broad component extraction.
- No runtime behavior change beyond JSX relocation.
- No handler/effect/state mutation changes.
- No modal helper wiring changes.
- No local/settings persistence helper wiring changes.
- No lifecycle adapter broadening.
- No audit writer path change.
- No database query, live proof, live insert, cleanup/backout, migration,
  typegen, or generated type edit.
- No `.env.local` change.

## Result Status

`live_position_execution_status_surface_extracted`

## Recommended Next Action

Action 934 - Extract Live Position Handoff CTA/Controls Surface

## Action 934 Follow-Up

- Extracted the live-position handoff CTA/control UI to
  `components/execution/live-position-handoff-controls.tsx`.
- `LivePositionExecutionStatusSurface` remains the read-only status surface.
- `ActivePositionCard` still owns `openExecutionPreviewModal`, modal state,
  lifecycle/orchestrator state, prepare/capture behavior, close/reset behavior,
  and mutation-adjacent callbacks.

## Action 935 Follow-Up

- Created `docs/live-position-execution-ui-extraction-summary.md`.
- Documented how the read-only status surface and handoff controls fit into the
  current parent-owned `ActivePositionCard` boundary.
- Status: `live_position_execution_ui_extraction_summary_created`.
- Recommended next action: Action 936 - Create Dev Mock Broker Controls
  Coupling Inventory.
