# Execution Live Position Handoff State Hook Extraction

## Purpose

Action 945 extracts a narrow client-safe hook for live-position handoff UI state.
The hook centralizes safe derived live-position execution handoff state,
orchestrator result/status derivation, and modal preview open/close forwarding.
Position/trade/PnL mutation logic, close-position callbacks, details modal
state, EOD acknowledgement, prepare/capture behavior, and side effects remain
parent-owned.

Result status: `execution_live_position_handoff_state_hook_extracted`

Recommended next action: Action 946 - Create Execution State/Effects Refactor
Summary.

## Extracted Hook

New file: `hooks/execution/useExecutionLivePositionHandoffState.ts`

The hook returns:

- `canOpenPreview`
- `closeExecutionPreviewModal()`
- `executionPreviewModal`
- `liveExecutionOrchestratorResult`
- `liveExecutionStatus`
- `openExecutionPreviewModal()`

The hook depends on:

- `hooks/execution/useExecutionModalState.ts`
- `lib/execution-orchestrator.ts`
- `lib/execution-ui-status.ts`

`app/trade-app.tsx` remains the owner of live-position card composition,
position close/exit callbacks, detail modal state, EOD acknowledgement state,
PnL and risk display derivation, audit timeline/detail derivation, and all
mutation-adjacent behavior.

## Behavior Preservation

- Live-position status output remains derived from the same orchestrator result
  and `buildExecutionUiStatusFromOrchestratorResult`.
- Handoff controls remain callback-driven and render the same CTA.
- Modal open still routes through `executionPreviewModal.openFromLivePosition`.
- Modal close still routes through `executionPreviewModal.close`.
- Selected preview/result semantics remain owned by the existing modal state
  hook.
- Prepare/capture behavior remains inside the existing handoff preview modal.
- Lifecycle/orchestrator semantics are unchanged.
- Stop-loss, target, exit priority, quantity, ticker, recommendation id,
  execution mode, and created-at inputs are passed through unchanged.
- Demo/mock/short/incomplete live positions still do not produce a handoff
  result.
- No broker/Avanza behavior or automatic order submission behavior was added.

## Scope Preserved

- Mutation-adjacent callbacks remain parent-owned.
- Position/trade/PnL mutation logic remains parent-owned.
- Close-position and exit submission logic remain parent-owned.
- Prepare/capture execution logic remains unchanged.
- Side effects remain parent-owned.
- Modal state hook implementation remains unchanged.
- Local persistence viewer hook remains unchanged.
- Settings state hook remains unchanged.
- No JSX movement or component extraction was performed.
- Audit writer runtime persistence, route, writer, lifecycle caller,
  monitoring, rollout, and service-role paths were not modified.

## Boundaries Verified

- The hook starts with `"use client";`.
- No server-only import was added.
- No audit writer server import was added.
- No service-role/env/Supabase helper was added.
- No route/fetch call was added.
- No browser storage usage was added.
- No broker/Avanza behavior or automatic submit enablement was added.
- No live proof, live insert, select/query, remote SQL, migration, type
  generation, generated type edit, cleanup/backout, `.env.local` edit, or
  service-role adapter call was performed.
- No UI/browser/client invocation of the audit writer was added.

## Deferred Seams

- Details modal state remains parent-owned because it coordinates display
  surfaces beyond execution handoff status.
- EOD acknowledgement state remains parent-owned because it writes local
  acknowledgement state.
- Close-position callbacks remain parent-owned because they lead to
  trade/stat/PnL mutation paths.
- Audit timeline, handoff quality, execution quality, and suggestion
  derivations remain parent-owned because they are adjacent to broader live
  trade detail surfaces.

## Validation

- Focused state/live-position baseline specs passed with 16 tests:
  `tests/e2e/execution-state-effects-baseline.spec.ts` and
  `tests/e2e/live-position-execution-ui-baseline.spec.ts`.
- The broader related baseline/helper pack passed with 106 tests after the
  extraction.
- Runtime denial import checks passed:
  `node --check scripts/verify-audit-table-anon-denial.mjs` and
  `node --check scripts/verify-audit-table-authenticated-denial.mjs`.
- Static safety scans passed for audit writer route/server imports,
  service-role exposure, Supabase/env/fetch usage, route invocation, market-loop
  or scanner invocation, browser storage usage, and automatic-mode safety.
- The automatic-order safety scan only matched existing human-confirmation
  guardrail copy in `app/trade-app.tsx`.
- `git diff --check`, zero-byte docs check, `.env.local` diff check,
  `tsc --noEmit`, and `npm run lint` passed. Lint emitted the existing Babel
  deopt note for large `app/trade-app.tsx`.

## Not Performed

- No broad live-position refactor.
- No reducer extraction.
- No JSX movement.
- No component extraction.
- No handler/effect behavior change beyond safe derived state ownership
  relocation.
- No modal state hook implementation change.
- No local persistence viewer hook wiring change.
- No settings state hook wiring change.
- No lifecycle UI adapter broadening.
- No audit writer path change.
- No broker/Avanza behavior.
- No automatic order submission enablement.
- No live data action or database action.

## Action 946 Follow-Up

- Result status: `execution_state_effects_refactor_summary_created`.
- Created `docs/execution-state-effects-refactor-summary.md`.
- This live-position handoff state hook remains unchanged; Action 946 is
  documentation-only.
- Recommended next action: Action 947 - Create Final Execution Refactor
  Handoff Summary.

## Action 947 Final Handoff Link

- Result status: `final_execution_refactor_handoff_summary_created`.
- Created `docs/final-execution-refactor-handoff-summary.md`.
- This live-position handoff state hook is included in the final extracted hook
  map; no hook wiring or live-position behavior changed in Action 947.
- Recommended next action: Action 948 - Final Repo Safety Sweep and Dead-Doc
  Link Check.
