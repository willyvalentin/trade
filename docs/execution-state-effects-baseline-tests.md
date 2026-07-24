# Execution State/Effects Baseline Tests

Action: 941
Status: execution_state_effects_baseline_tests_added
Date: 2026-06-27

## Purpose

Action 941 adds baseline tests before any execution state/effects refactor. This action is tests/docs only. It does not extract hooks, reducers, state containers, JSX, components, handlers, effects, modal helper wiring, local persistence wiring, settings persistence wiring, lifecycle adapter wiring, audit writer paths, rollout flags, broker/Avanza behavior, automatic mode behavior, Supabase access, migrations, type generation, generated types, or `.env.local`.

## Selected First Seam

The selected first seam remains the modal state container behavior because it is the smallest safe state/effect seam:

- Modal helper functions already centralize initial closed state, open state, close/reset state, prepare result state, capture result state, and debug summaries.
- Sandbox and live-position open paths already call `openExecutionModalState(...)` and `closeExecutionModalState()`.
- `ExecutionHandoffPreviewModal` already applies prepare/capture results through helper calls.
- The seam is adjacent to execution lifecycle UI but does not require moving trade/position/PnL mutation paths.

Live-position mutation-adjacent state remains deferred because it sits beside close-position and position-update behavior.

## Current Baseline Scope

The new baseline spec is `tests/e2e/execution-state-effects-baseline.spec.ts`.

It locks:

- Modal initial closed state.
- Sandbox open path source and selected handoff/result preservation.
- Live-position open path source and selected handoff/result preservation.
- Close/reset state.
- Prepare pending/success/failure state shape.
- Capture pending/success/failure state shape.
- Already-computed lifecycle/capture adjacency through helper state.
- Local persistence viewer refresh/clear callback boundaries.
- Dev mock broker result refresh/clear/capture-complete callback boundaries.
- Execution mode settings persistence default, automatic-mode gate, and read/write error behavior.
- Execution settings panel callback boundary.
- Live-position status surface as read-only/presentational.
- Live-position handoff controls as callback-driven.
- Client-safe and audit-writer-free boundaries for the first extraction seam.

## Test Approach

The baseline uses:

- Real modal helper imports from `lib/execution-modal-state-helpers.ts`.
- Real execution orchestrator fixture output from `lib/execution-orchestrator.ts`.
- Real lifecycle UI adapter import from `lib/execution-lifecycle-ui-state-adapter.ts`.
- Real settings persistence helper imports from `lib/execution-settings-persistence-helpers.ts`.
- Static source assertions against `app/trade-app.tsx`, `app/settings/page.tsx`, and extracted execution components.
- No fixture-local production logic replicas beyond literal test fixtures for execution intents and storage values.

Existing related tests continue to cover the more granular helper/component scopes:

- `tests/e2e/execution-modal-state-baseline.spec.ts`
- `tests/e2e/execution-modal-open-path-baseline.spec.ts`
- `tests/e2e/execution-event-log-local-storage-baseline.spec.ts`
- `tests/e2e/execution-settings-persistence-baseline.spec.ts`
- `tests/e2e/execution-local-storage-helpers.spec.ts`
- `tests/e2e/execution-settings-persistence-helpers.spec.ts`
- `tests/e2e/live-position-execution-ui-baseline.spec.ts`
- `tests/e2e/execution-ui-component-extraction-baseline.spec.ts`
- `tests/e2e/dev-mock-broker-controls-baseline.spec.ts`
- `tests/e2e/execution-lifecycle-ui-state-adapter.spec.ts`
- `tests/e2e/execution-lifecycle-ui-state-baseline.spec.ts`

## Coverage Map

| Area | State variable | Setter path | Render/read path | Boundary assertion |
| --- | --- | --- | --- | --- |
| Modal closed state | `ExecutionModalState` | `createClosedExecutionModalState()` / `closeExecutionModalState()` | modal helper debug summary | closed/reset values remain null/idle |
| Sandbox open path | `isExecutionPreviewOpen` and selected handoff/result | `openExecutionModalState({ source: "fixture" })` | `ExecutionHandoffPreviewModal` | helper-backed open, no direct `setIsExecutionPreviewOpen(true)` |
| Live-position open path | `isExecutionPreviewOpen` and selected handoff/result | `openExecutionModalState({ source: "live_position" })` | `ExecutionHandoffPreviewModal` | parent owns modal open/close |
| Prepare state | `preparation` | `applyExecutionPrepareResult(...)` | modal state/debug summary | pending/success/failure shape locked |
| Capture state | `capture` | `applyExecutionCaptureResult(...)` | modal state/debug summary | pending/success/failure shape locked |
| Local audit log viewer | `executionEventLog` | settings refresh/clear handlers | `ExecutionAuditLogViewer` | callbacks stay parent-owned |
| Local records viewer | `executionRecordStore` | settings refresh/clear handlers | `ExecutionLocalRecordsViewer` | callbacks stay parent-owned |
| Dev mock broker results | `devMockBrokerResultStore` | settings refresh/clear/capture-complete handlers | `ExecutionDevMockBrokerResultsPanel` | callbacks stay parent-owned |
| Settings persistence | `executionMode` | `readExecutionModePreference` / `writeExecutionModePreference` | `ExecutionSettingsPanel` | default/gate/error behavior locked |
| Live-position UI | local handoff state in `ActivePositionCard` | `openExecutionPreviewModal` / `closeExecutionPreviewModal` | `LivePositionExecutionStatusSurface` and `LivePositionHandoffControls` | read-only status surface; callback-only controls |
| Safety | extracted execution seam modules | static source scan | test assertions | no audit writer, service-role, route, Supabase table, or server-only imports |

## Boundaries Verified

- No audit writer server/client invocation was added.
- No service-role/env/Supabase table usage was added to the tested client-safe seam.
- No route/fetch path was added by Action 941.
- No broker/Avanza behavior was added.
- No automatic order submission enablement was added.
- No market-loop/scanner invocation was added.
- No trade/stats/PnL mutation was changed.
- No runtime behavior was changed.

## Gaps And Limitations

- Full `TradeApp` hydration, focus, visibility, interval refresh, and mutation-adjacent effects remain parent-owned and are not extracted.
- Add-trade and close-position modal submit paths remain high risk because they are trade/position/PnL mutation-adjacent.
- The new baseline uses static source assertions for parent-owned callbacks and effects because extracting testable hooks is not approved until Action 942 or later.
- Action 942 should avoid broad `TradeApp` refresh/mutation logic and focus on the modal state container seam covered here.

## Result

Result status: execution_state_effects_baseline_tests_added

Recommended next action: Action 942 - Extract Execution Modal State Container Hook.

## Validation

- New baseline test passed: `npx playwright test tests/e2e/execution-state-effects-baseline.spec.ts` passed with 6 tests.
- Related baseline/helper test pack passed: `npx playwright test tests/e2e/execution-state-effects-baseline.spec.ts tests/e2e/dev-mock-broker-controls-baseline.spec.ts tests/e2e/live-position-execution-ui-baseline.spec.ts tests/e2e/execution-ui-component-extraction-baseline.spec.ts tests/e2e/execution-settings-persistence-helpers.spec.ts tests/e2e/execution-settings-persistence-baseline.spec.ts tests/e2e/execution-local-storage-helpers.spec.ts tests/e2e/execution-event-log-local-storage-baseline.spec.ts tests/e2e/execution-modal-state-helpers.spec.ts tests/e2e/execution-modal-open-path-baseline.spec.ts tests/e2e/execution-modal-state-baseline.spec.ts tests/e2e/execution-lifecycle-ui-state-adapter.spec.ts tests/e2e/execution-lifecycle-ui-state-baseline.spec.ts` passed with 106 tests.
- Runtime denial harness import checks passed: `node --check scripts/verify-audit-table-anon-denial.mjs` and `node --check scripts/verify-audit-table-authenticated-denial.mjs`.
- Audit writer runtime path import search returned only negative assertions in the new baseline test.
- Route invocation, UI import, service-role, `NEXT_PUBLIC_*SERVICE*`, state/effects boundary, market-loop/scanner, and automatic-mode scans returned only expected guardrail text or pre-existing dev/preview copy; Action 941 added no runtime invocation path.
- `git diff --check` passed.
- Touched-file trailing whitespace scan passed.
- `find docs -type f -size 0` passed with no output.
- `.env.local` diff check passed with no output.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed; ESLint emitted the existing Babel code generator deopt note for the large `app/trade-app.tsx`.

## Action 942 Follow-Up

- Result status: `execution_modal_state_container_hook_extracted`.
- Added `hooks/execution/useExecutionModalState.ts` and
  `docs/execution-modal-state-container-hook-extraction.md`.
- Updated the baseline assertions to lock the hook-backed sandbox and
  live-position modal open/close paths, selected result semantics, and
  client-safe/no-audit-writer boundaries.
- The Action 941 baseline spec passed after extraction:
  `npx playwright test tests/e2e/execution-state-effects-baseline.spec.ts`
  passed with 6 tests.
- No prepare/capture logic, side effects, lifecycle/orchestrator state, local or
  settings persistence, audit writer path, route/fetch path, broker/Avanza
  behavior, automatic mode behavior, Supabase access, migration, type
  generation, generated type edit, or `.env.local` edit was performed.
- Recommended next action: Action 943 - Extract Execution Local Persistence
  Viewer State Hook.

## Action 943 Follow-Up

- Result status: `execution_local_persistence_viewer_state_hook_extracted`.
- Added `hooks/execution/useExecutionLocalPersistenceViewers.ts` and updated
  the baseline assertions to lock hook-owned local viewer refresh/clear/capture
  refresh wiring.
- The focused baseline specs passed with 14 tests, and the broader related
  baseline/helper pack passed with 106 tests.
- No storage behavior, storage key, persisted shape, settings persistence,
  modal helper wiring, lifecycle UI adapter wiring, audit writer path,
  broker/Avanza behavior, automatic mode behavior, migration, type generation,
  generated type edit, or `.env.local` edit was performed.
- Recommended next action: Action 944 - Extract Execution Settings State Hook.

## Action 944 Follow-Up

- Result status: `execution_settings_state_hook_extracted`.
- Updated baseline assertions to lock `useExecutionSettingsState` ownership of
  helper-backed settings read/write behavior, automatic-mode gating,
  save-error messaging, authority derivation, and client-safe boundaries.
- Existing execution mode defaults, storage key, fallback behavior, and
  `ExecutionSettingsPanel` presentational boundary remain unchanged.
- Recommended next action: Action 945 - Extract Execution Live Position
  Handoff State Hook.

## Action 945 Follow-Up

- Result status: `execution_live_position_handoff_state_hook_extracted`.
- Updated baseline assertions to lock
  `useExecutionLivePositionHandoffState` ownership of safe live-position
  handoff derived state while proving close-position mutation paths and
  details/EOD state remain parent-owned.
- Existing live-position status, handoff controls, modal open path,
  prepare/capture adjacency, lifecycle/orchestrator semantics, and client-safe
  guardrails remain locked.
- Recommended next action: Action 946 - Create Execution State/Effects Refactor
  Summary.

## Action 946 Follow-Up

- Result status: `execution_state_effects_refactor_summary_created`.
- Created `docs/execution-state-effects-refactor-summary.md`.
- The baseline test map is summarized in the new refactor summary; no test or
  runtime behavior was changed by Action 946.
- Recommended next action: Action 947 - Create Final Execution Refactor
  Handoff Summary.

## Action 947 Final Handoff Link

- Result status: `final_execution_refactor_handoff_summary_created`.
- Created `docs/final-execution-refactor-handoff-summary.md`.
- The baseline test posture is summarized in the final handoff; no tests or
  runtime behavior changed in Action 947.
- Recommended next action: Action 948 - Final Repo Safety Sweep and Dead-Doc
  Link Check.
