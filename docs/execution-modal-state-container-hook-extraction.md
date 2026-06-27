# Execution Modal State Container Hook Extraction

## Purpose

Action 942 extracts a narrow client-safe execution modal state container hook.
The extraction centralizes modal visibility and selected execution preview
state for existing handoff preview flows while preserving the surrounding
execution, persistence, lifecycle, and audit boundaries.

Result status: `execution_modal_state_container_hook_extracted`

Recommended next action: Action 943 - Extract Execution Local Persistence
Viewer State Hook.

## Extracted Hook

New file: `hooks/execution/useExecutionModalState.ts`

The hook returns:

- `isOpen`
- `modalState`
- `selectedResult`
- `selectedIntent`
- `selectedHandoff`
- `localLifecycle`
- `captureBaseLifecycle`
- `openFromSandbox(result)`
- `openFromLivePosition(result)`
- `close()`
- `reset()`

The hook depends only on React state, `lib/execution-modal-state-helpers.ts`,
and the existing `ExecutionOrchestratorResult` type. It starts with
`"use client";` and does not import server-only modules, audit writer modules,
Supabase helpers, service-role helpers, route helpers, browser storage, broker
adapters, or Avanza automation.

Parent-owned state/effects/callbacks that remain outside the hook:

- Prepare/capture execution logic inside the handoff preview modal.
- Lifecycle/orchestrator state and execution result construction.
- Local execution event/record/dev mock broker persistence state and effects.
- Execution settings persistence state and effects.
- Live-position details, close-position, acknowledgement, and audit display
  callbacks.
- All mutation-adjacent callbacks.

## Behavior Preservation

- Initial closed modal state still comes from
  `createClosedExecutionModalState()`.
- Sandbox open state still uses `openExecutionModalState` with
  `source: "fixture"`.
- Live-position open state still uses `openExecutionModalState` with
  `source: "live_position"`.
- Close and reset still use `closeExecutionModalState()` and clear the selected
  preview result.
- Selected handoff/result semantics remain tied to the same orchestrator result
  used by the existing sandbox and live-position preview flows.
- Prepare/capture state adjacency remains in the existing modal/helper path.
- No side effects were moved into the hook.
- No broker/Avanza behavior, automatic order submission behavior, market-loop
  invocation, scanner invocation, or trade/stats/PnL mutation was added.

## Scope Preserved

- `components/execution/execution-sandbox-fixture-card.tsx` now calls
  `useExecutionModalState()` for preview open/close state only.
- `app/trade-app.tsx` `ActivePositionCard` now calls
  `useExecutionModalState()` for the live-position preview open/close state
  only.
- JSX/component structure remains otherwise intact; no new component extraction
  was performed in Action 942.
- Local/settings persistence helper wiring remains unchanged.
- Lifecycle UI adapter wiring was not broadened.
- Audit writer runtime persistence, monitoring, rollout, route, writer,
  lifecycle caller, and service-role paths were not modified.

## Boundaries Verified

- The hook is client-safe and deterministic apart from React state.
- The hook contains no `fetch`, route call, `window`, `document`,
  `localStorage`, `sessionStorage`, Supabase client, service-role env access,
  audit writer import, or server-only import.
- No live proof, live insert, select/query, remote SQL, migration, type
  generation, generated type edit, cleanup/backout, `.env.local` edit, or
  service-role adapter call was performed.
- The extraction did not add UI/browser/client invocation of the audit writer.

## Validation

- `npx playwright test tests/e2e/execution-state-effects-baseline.spec.ts`
  passed with 6 tests after the hook extraction.
- The broader related baseline/helper pack passed with 106 tests and continues
  to cover the modal open path, modal helper state, extracted UI components,
  local persistence helpers, settings persistence helpers, and lifecycle UI
  adapter boundaries.
- Runtime denial import checks passed:
  `node --check scripts/verify-audit-table-anon-denial.mjs` and
  `node --check scripts/verify-audit-table-authenticated-denial.mjs`.
- Static safety scans found no unsafe imports or calls in
  `hooks/execution/useExecutionModalState.ts`; broader scans returned only
  existing app Supabase usage or test/doc guardrail text.
- `git diff --check` passed.
- Touched-file trailing whitespace scan passed with no output.
- `find docs -type f -size 0` passed with no output.
- `.env.local` diff check passed with no output.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the existing Babel deopt note for large
  `app/trade-app.tsx`.

## Not Performed

- No reducer extraction.
- No helper behavior change.
- No modal open/close semantic change.
- No selected result/handoff semantic change.
- No prepare/capture behavior change.
- No effect or async order change.
- No local/settings persistence change.
- No audit writer runtime persistence path change.
- No broker/Avanza behavior or automatic mode enablement.
- No live data action or database action.

## Action 943 Follow-Up

- Result status: `execution_local_persistence_viewer_state_hook_extracted`.
- Added `hooks/execution/useExecutionLocalPersistenceViewers.ts` and
  `docs/execution-local-persistence-viewer-state-hook-extraction.md`.
- The modal state hook and modal helper wiring remain unchanged by Action 943.
- No modal open/close behavior, selected handoff/result behavior,
  prepare/capture behavior, audit writer path, broker/Avanza behavior,
  automatic mode behavior, migration, type generation, generated type edit, or
  `.env.local` edit was performed.
- Recommended next action: Action 944 - Extract Execution Settings State Hook.

## Action 944 Follow-Up

- Result status: `execution_settings_state_hook_extracted`.
- Added `hooks/execution/useExecutionSettingsState.ts` and wired
  `app/settings/page.tsx` to consume it for execution settings state.
- Preserved execution mode storage key, semi-auto default,
  invalid/missing fallback, automatic-mode gating, save messages, hydration
  refresh behavior, and `ExecutionSettingsPanel` output.
- This modal state hook remains unchanged.
- Recommended next action: Action 945 - Extract Execution Live Position
  Handoff State Hook.

## Action 945 Follow-Up

- Result status: `execution_live_position_handoff_state_hook_extracted`.
- Added `hooks/execution/useExecutionLivePositionHandoffState.ts`, which
  consumes the existing modal state hook for live-position preview open/close
  forwarding.
- The modal state hook implementation remains unchanged.
- Modal selected result semantics, close/reset behavior, and prepare/capture
  behavior remain unchanged.
- Recommended next action: Action 946 - Create Execution State/Effects Refactor
  Summary.

## Action 946 Follow-Up

- Result status: `execution_state_effects_refactor_summary_created`.
- Created `docs/execution-state-effects-refactor-summary.md`.
- This modal state hook remains unchanged; Action 946 is documentation-only.
- Recommended next action: Action 947 - Create Final Execution Refactor
  Handoff Summary.

## Action 947 Final Handoff Link

- Result status: `final_execution_refactor_handoff_summary_created`.
- Created `docs/final-execution-refactor-handoff-summary.md`.
- This modal state hook is included in the final extracted hook map; modal
  wiring, prepare/capture adjacency, and parent-owned mutation boundaries remain
  unchanged.
- Recommended next action: Action 948 - Final Repo Safety Sweep and Dead-Doc
  Link Check.
