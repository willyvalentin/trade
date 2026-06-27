# Execution Settings State Hook Extraction

## Purpose

Action 944 extracts a narrow client-safe state/effect hook for execution
settings state in Settings. The hook centralizes execution mode preference
state, helper-backed read/write behavior, automatic-mode gating, save messages,
and hydration refresh behavior while keeping `ExecutionSettingsPanel`
presentational.

Result status: `execution_settings_state_hook_extracted`

Recommended next action: Action 945 - Extract Execution Live Position Handoff
State Hook.

## Extracted Hook

New file: `hooks/execution/useExecutionSettingsState.ts`

The hook returns:

- `automaticExecutionEnabled`
- `executionAuthority`
- `executionMode`
- `executionModeMessage`
- `updateExecutionModePreference(nextMode)`

The hook depends on React state/effect/memo APIs and the existing execution
settings persistence helper:

- `lib/execution-settings-persistence-helpers.ts`

`app/settings/page.tsx` remains the owner of Settings composition, settings form
load/save behavior, risk controls, Avanza verification notes, local persistence
viewer hook wiring, modal-related wiring, bridge diagnostics, and all
non-execution-mode Settings state.

## Behavior Preservation

- Execution mode reads still use
  `readExecutionModePreference(getBrowserExecutionSettingsStorage(), ...)`.
- Execution mode writes still use
  `writeExecutionModePreference(getBrowserExecutionSettingsStorage(), mode)`.
- The storage key remains `ture_execution_mode`.
- The default remains `semi_automatic`.
- Missing and invalid preferences still fall back to `semi_automatic`.
- Stored `automatic` still falls back to `semi_automatic` unless the automatic
  execution feature flag is enabled.
- Automatic-mode selection still shows the existing locked message when gated.
- Save success messages are unchanged for semi-automatic and automatic modes.
- Save failure still shows `Could not save execution mode locally.`
- Hydration still performs a browser-timer refresh after mount.
- `ExecutionSettingsPanel` receives the same mode, authority, gating, message,
  and callback props.
- No automatic order submission behavior was added.

## Scope Preserved

- The local persistence viewer hook remains unchanged.
- The modal state hook remains unchanged.
- Lifecycle/orchestrator state remains unchanged.
- Extracted viewer/settings components remain presentational/callback-driven.
- No JSX movement or component extraction was performed.
- Audit writer runtime persistence, route, writer, lifecycle caller,
  monitoring, rollout, and service-role paths were not modified.

## Boundaries Verified

- The hook starts with `"use client";`.
- No server-only import was added.
- No audit writer server import was added.
- No service-role/env/Supabase helper was added.
- No route/fetch call was added.
- Browser storage access remains through the existing execution settings
  persistence helper.
- No new storage key or persisted shape was introduced.
- No broker/Avanza behavior or automatic submit enablement was added.
- No live proof, live insert, select/query, remote SQL, migration, type
  generation, generated type edit, cleanup/backout, `.env.local` edit, or
  service-role adapter call was performed.
- No UI/browser/client invocation of the audit writer was added.

## Validation

- Focused settings/state baseline specs passed with 19 tests:
  `tests/e2e/execution-state-effects-baseline.spec.ts`,
  `tests/e2e/execution-settings-persistence-helpers.spec.ts`, and
  `tests/e2e/execution-settings-persistence-baseline.spec.ts`.
- The broader related baseline/helper pack passed with 106 tests across
  state/effects, settings persistence, local storage, dev mock broker controls,
  live-position UI, component extraction, modal helpers/open paths, and
  lifecycle UI adapter coverage.
- Runtime denial import checks passed:
  `node --check scripts/verify-audit-table-anon-denial.mjs` and
  `node --check scripts/verify-audit-table-authenticated-denial.mjs`.
- Static safety scans found no unsafe imports or calls in
  `hooks/execution/useExecutionSettingsState.ts`; broader scans returned only
  expected existing app routes, scanner code, visible KÖP/SÄLJ guardrail copy,
  and pre-existing Settings localStorage/Supabase/fetch areas outside this
  extraction.
- `git diff --check` passed.
- Touched-file trailing whitespace scan passed with no output.
- `find docs -type f -size 0` passed with no output.
- `.env.local` diff check passed with no output.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the existing Babel deopt note for large
  `app/trade-app.tsx`.

## Not Performed

- No broad state refactor.
- No reducer extraction.
- No JSX movement.
- No component extraction.
- No settings storage key or persisted shape change.
- No modal state hook wiring change.
- No local persistence viewer hook wiring change.
- No lifecycle UI adapter broadening.
- No audit writer path change.
- No broker/Avanza behavior.
- No automatic order submission enablement.
- No live data action or database action.

## Action 945 Follow-Up

- Result status: `execution_live_position_handoff_state_hook_extracted`.
- Added `hooks/execution/useExecutionLivePositionHandoffState.ts` for safe
  live-position handoff derived state, orchestrator result/status derivation,
  and modal preview open/close forwarding.
- This settings state hook remains unchanged.
- Mutation-adjacent close-position, trade/stat/PnL, details modal, EOD
  acknowledgement, and prepare/capture behavior remain outside the new hook.
- No audit writer path, Supabase/live call, migration, type generation,
  generated type edit, broker/Avanza behavior, automatic order submission
  enablement, or `.env.local` edit was performed.
- Recommended next action: Action 946 - Create Execution State/Effects Refactor
  Summary.

## Action 946 Follow-Up

- Result status: `execution_state_effects_refactor_summary_created`.
- Created `docs/execution-state-effects-refactor-summary.md`.
- This settings state hook remains unchanged; Action 946 is documentation-only.
- Recommended next action: Action 947 - Create Final Execution Refactor
  Handoff Summary.

## Action 947 Final Handoff Link

- Result status: `final_execution_refactor_handoff_summary_created`.
- Created `docs/final-execution-refactor-handoff-summary.md`.
- This settings state hook is included in the final extracted hook map;
  settings persistence behavior and automatic-mode gating remain unchanged.
- Recommended next action: Action 948 - Final Repo Safety Sweep and Dead-Doc
  Link Check.
