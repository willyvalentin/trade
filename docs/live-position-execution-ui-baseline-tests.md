# Live Position Execution UI Baseline Tests

Action: 932
Date: 2026-06-27
Status: `live_position_execution_ui_baseline_tests_added`

## Purpose

This tests/docs-only action adds baseline coverage before extracting any
live-position execution UI. The goal is to lock the first recommended seam from
Action 931: the read-only live position execution status surface.

No runtime code, JSX, handlers, effects, state mutation, helper wiring, audit
writer path, rollout flag, broker/Avanza behavior, automatic mode behavior,
database behavior, type generation, generated type, or `.env.local` value was
changed by this action.

## Selected Seam

Selected seam:

`ExecutionLivePositionStatusSurface`

This is the smallest safe first live-position extraction seam because it can
receive already-derived execution status, preserve the existing handoff CTA
callback, and avoid close/partial-close mutation callbacks.

Deferred:

- interactive live-position controls;
- close/partial-close submit behavior;
- EOD acknowledgement persistence;
- live execution orchestrator result construction;
- modal state helper wiring;
- `ExecutionHandoffPreviewModal` ownership;
- `LiveTradeDetailsModal` extraction.

## Current Baseline Scope

The baseline tests lock:

- stop-loss status label/copy/severity;
- target-reached status label/copy/severity;
- no-action hidden status behavior;
- semi-automatic CTA state and disabled final-submit state;
- automatic status metadata without adding automatic order submission behavior;
- current `LiveExecutionStatusSurface` class/copy source;
- current live-position handoff modal open/close helper wiring;
- current prepare/capture display ownership in `ExecutionHandoffPreviewModal`;
- close/reset and mutation-heavy close flow remaining parent-owned;
- extracted sandbox/modal/settings/viewer components remaining intact;
- no audit writer, service-role/env/Supabase, route/fetch, or storage access in
  the status surface/card body/`ActivePositionCard` seam.

## Test Approach

Created:

`tests/e2e/live-position-execution-ui-baseline.spec.ts`

The tests use:

- importable helper/adapter behavior from `runExecutionOrchestrator(...)`,
  `buildExecutionUiStatusFromOrchestratorResult(...)`,
  `openExecutionModalState(...)`, and `closeExecutionModalState()`;
- static source characterization of `app/trade-app.tsx`,
  `LiveExecutionStatusSurface`, `LiveDayTradeCardBody`,
  `LiveTradeDetailsModal`, and extracted execution components;
- fixture live positions created inside the spec for stop-loss, target, and
  no-action states.

No fixture-local production JSX replica was introduced. The tests do not
extract production JSX to make assertions possible.

## Coverage Map

| Surface | Baseline coverage |
| --- | --- |
| `ActivePositionCard` live execution derivation | Source asserts orchestrator construction, status adapter call, inline status surface, inline handoff modal, details modal, card body, and close callback wiring remain present. |
| Read-only status output | Helper assertions cover stop-loss, target, and no-action status labels, severity, CTA metadata, and final-submit flags. |
| `LiveExecutionStatusSurface` | Source asserts severity class mappings, mode labels, next-action copy, final-submit copy, handoff CTA, and `event.stopPropagation()`. |
| Handoff CTA/open path | Source and helper assertions cover `openExecutionModalState({ source: "live_position" })`, render guards, selected intent, selected handoff, idle prepare/capture state, and close reset. |
| Prepare/capture display | Source asserts `ExecutionHandoffPreviewModal` still owns prepare/capture helper use and display fields. |
| Close/reset path | Source asserts close button propagation stop, parent `openClosePositionModal(...)`, and mutation-heavy `submitClosePosition(...)` remain parent-owned. |
| Extracted components | Source asserts sandbox fixture card, handoff modal, settings panel, audit log viewer, and local records viewer remain extracted. |
| Safety boundary | Source asserts no server-only, audit writer, service-role/env/Supabase, route/fetch, storage, or write-operation fragments in the first seam. |

## Boundaries Verified

- No audit writer server import was added.
- No service-role/env/Supabase usage was added.
- No route/fetch access was added beyond existing documented app behavior.
- No broker/Avanza behavior was added.
- No automatic order submission enablement was added.
- No trade/stats/PnL mutation behavior changed.
- No modal helper wiring changed.
- No local persistence helper wiring changed.
- No settings persistence helper wiring changed.
- No lifecycle UI adapter wiring was broadened.
- No runtime behavior changed.

## Gaps And Limitations

- Full browser-rendered live-position UI is still difficult to assert before
  extraction because `ActivePositionCard` is local to the large app module.
- The tests characterize source and importable helper behavior rather than
  rendering `ActivePositionCard` directly.
- Close/partial-close behavior remains intentionally parent-owned and
  mutation-heavy; future extraction tests should keep it out of the first
  read-only seam.
- `LiveTradeDetailsModal` still has an existing Escape-key `window` listener;
  that is documented as existing behavior, not new behavior.
- Action 933 should keep orchestrator construction, modal state helpers, and
  `ExecutionHandoffPreviewModal` ownership in `ActivePositionCard` unless
  separately approved.

## Result Status

`live_position_execution_ui_baseline_tests_added`

## Recommended Next Action

Action 933 - Extract Read-Only Live Position Execution Status Surface

## Action 933 Update - Read-Only Status Surface Extracted

- Created
  `components/execution/live-position-execution-status-surface.tsx`.
- Updated the live-position baseline spec to prove the read-only status surface
  is extracted while the handoff control remains parent-owned.
- Preserved status labels, severity styling, mode labels, next-action copy,
  final-submit authority copy, modal open/close behavior, and prepare/capture
  adjacency.
- Status: `live_position_execution_status_surface_extracted`.
- Recommended next action: Action 934 - Extract Live Position Handoff
  CTA/Controls Surface.

## Action 934 Update - Live Position Handoff Controls Extracted

- Added coverage for
  `components/execution/live-position-handoff-controls.tsx`.
- Verified the extracted controls preserve the `View handoff` label, button
  classes, `event.stopPropagation()`, optional disabled state, and
  parent-provided callback invocation.
- Verified `ActivePositionCard` remains the owner of modal open/close state and
  mutation-adjacent callbacks.
- Status: `live_position_handoff_controls_extracted`.
- Recommended next action: Action 935 - Create Live Position Execution UI
  Extraction Summary.

## Action 935 Update - Live Position Extraction Summary Created

- Created `docs/live-position-execution-ui-extraction-summary.md`.
- Summarized the Action 932-934 test coverage, including baseline tests,
  source-characterization tests, status surface extraction tests, handoff
  controls extraction tests, broader regression coverage, and static safety
  scans.
- Status: `live_position_execution_ui_extraction_summary_created`.
- Recommended next action: Action 936 - Create Dev Mock Broker Controls
  Coupling Inventory.
