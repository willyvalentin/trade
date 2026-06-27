# Execution Local Persistence Viewer State Hook Extraction

## Purpose

Action 943 extracts a narrow client-safe state/effect hook for execution local
persistence viewers in Settings. The hook centralizes local viewer state,
hydration, refresh, clear, and dev mock capture-refresh wiring for the execution
event log, local execution records, and dev mock broker results.

Result status: `execution_local_persistence_viewer_state_hook_extracted`

Recommended next action: Action 944 - Extract Execution Settings State Hook.

## Extracted Hook

New file: `hooks/execution/useExecutionLocalPersistenceViewers.ts`

The hook returns:

- `executionEventLog`
- `executionEventLogMessage`
- `latestExecutionAuditEvents`
- `latestExecutionAuditTimestamp`
- `executionRecordStore`
- `executionRecordStoreMessage`
- `latestExecutionRecords`
- `latestExecutionRecordTimestamp`
- `devMockBrokerResultStore`
- `devMockBrokerResultStoreMessage`
- `latestDevMockBrokerResults`
- `latestDevMockBrokerResultTimestamp`
- `refreshExecutionEventLog()`
- `clearExecutionEventLog()`
- `refreshExecutionRecords()`
- `clearLocalExecutionRecords()`
- `refreshDevMockBrokerResults()`
- `clearLocalDevMockBrokerResults()`
- `refreshAfterDevMockBrokerCapture()`

The hook depends on React state/effects/memos and the existing local
persistence store modules:

- `lib/execution-event-log.ts`
- `lib/execution-record-store.ts`
- `lib/dev-mock-broker-result-store.ts`

`app/settings/page.tsx` remains the owner of Settings UI composition,
execution settings persistence, Avanza agent run state, safe browser action
diagnostics state, bridge diagnostics, settings save/load behavior, and all
non-target local settings state.

## Behavior Preservation

- Execution event log refresh still reads the current local event log and sets
  the message `Execution event log refreshed.`
- Execution event log clear still confirms with the existing browser prompt,
  clears only local execution audit events, re-reads the store, and preserves
  existing success/failure messages.
- Local execution records refresh still reads the current local records store
  and sets the message `Execution records refreshed.`
- Local execution records clear still confirms with the existing browser
  prompt, clears only local execution records, re-reads the store, and preserves
  existing success/failure messages.
- Dev mock broker results refresh still reads the current local dev mock broker
  result store and sets the message `Dev mock broker results refreshed.`
- Dev mock broker results clear still confirms with the existing browser
  prompt, clears only local dev mock diagnostics, re-reads the store, and
  preserves existing success/failure messages.
- Dev mock broker capture completion still refreshes local execution records and
  local execution event log state.
- Visible list sorting, newest timestamp derivation, and 50-item limits are
  unchanged.
- Storage keys and persisted shapes are unchanged.
- The local-only/server-audit distinction is unchanged.
- No broker/Avanza behavior, automatic order submission behavior, or automatic
  mode enablement was added.

## Scope Preserved

- Settings persistence remains separate and unchanged.
- The execution modal state hook remains unchanged.
- Lifecycle/orchestrator state remains unchanged.
- Extracted viewer components remain presentational/callback-driven.
- No JSX movement or component extraction was performed.
- Avanza agent run store and safe browser action diagnostics remain parent-owned
  because they were adjacent but outside the named Action 943 target.
- Audit writer runtime persistence, route, writer, lifecycle caller,
  monitoring, rollout, and service-role paths were not modified.

## Boundaries Verified

- The hook starts with `"use client";`.
- No server-only import was added.
- No audit writer server import was added.
- No service-role/env/Supabase helper was added.
- No route/fetch call was added.
- Browser storage access remains through existing store/helper modules.
- Browser prompts are preserved only for existing local clear actions.
- No live proof, live insert, select/query, remote SQL, migration, type
  generation, generated type edit, cleanup/backout, `.env.local` edit, or
  service-role adapter call was performed.
- No UI/browser/client invocation of the audit writer was added.

## Validation

- Focused baseline specs passed:
  `npx playwright test tests/e2e/execution-state-effects-baseline.spec.ts tests/e2e/dev-mock-broker-controls-baseline.spec.ts`
  passed with 14 tests.
- The broader related baseline/helper pack passed with 106 tests.
- Runtime denial import checks passed:
  `node --check scripts/verify-audit-table-anon-denial.mjs` and
  `node --check scripts/verify-audit-table-authenticated-denial.mjs`.
- Static safety scans found no unsafe imports or calls in
  `hooks/execution/useExecutionLocalPersistenceViewers.ts`; broader scans
  returned only expected guardrail text, preserved local browser prompt/timer
  use, and pre-existing Settings Supabase/fetch/env code outside this action.
- `git diff --check` passed.
- Touched-file trailing whitespace scan passed with no output.
- `find docs -type f -size 0` passed with no output.
- `.env.local` diff check passed with no output.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the existing Babel deopt note for large
  `app/trade-app.tsx`.

## Not Performed

- No storage key or persisted shape change.
- No event log, execution record, or dev mock broker result behavior change.
- No Settings persistence behavior change.
- No modal helper or modal state hook change.
- No lifecycle UI adapter broadening.
- No audit writer path change.
- No broker/Avanza behavior.
- No automatic order submission enablement.
- No live data action or database action.

## Action 944 Follow-Up

- Result status: `execution_settings_state_hook_extracted`.
- Added `hooks/execution/useExecutionSettingsState.ts` to centralize
  execution mode preference state, helper-backed read/write behavior,
  automatic-mode gating, save messages, authority derivation, and hydration
  refresh behavior.
- `app/settings/page.tsx` now consumes the settings hook while this local
  persistence viewer hook remains unchanged.
- Execution mode storage key, semi-auto default, invalid/missing fallback,
  automatic-mode lock behavior, and settings panel output remain unchanged.
- No audit writer path, Supabase/live call, migration, type generation,
  generated type edit, broker/Avanza behavior, automatic order submission
  enablement, or `.env.local` edit was performed.
- Recommended next action: Action 945 - Extract Execution Live Position
  Handoff State Hook.

## Action 945 Follow-Up

- Result status: `execution_live_position_handoff_state_hook_extracted`.
- Added `hooks/execution/useExecutionLivePositionHandoffState.ts`.
- This local persistence viewer hook remains unchanged.
- The new live-position handoff hook owns only safe derived handoff UI state and
  modal preview forwarding; mutation-adjacent paths remain parent-owned.
- Recommended next action: Action 946 - Create Execution State/Effects Refactor
  Summary.

## Action 946 Follow-Up

- Result status: `execution_state_effects_refactor_summary_created`.
- Created `docs/execution-state-effects-refactor-summary.md`.
- This local persistence viewer hook remains unchanged; Action 946 is
  documentation-only.
- Recommended next action: Action 947 - Create Final Execution Refactor
  Handoff Summary.

## Action 947 Final Handoff Link

- Result status: `final_execution_refactor_handoff_summary_created`.
- Created `docs/final-execution-refactor-handoff-summary.md`.
- This local persistence viewer hook is included in the final extracted hook
  map; local-only persistence behavior and helper wiring remain unchanged.
- Recommended next action: Action 948 - Final Repo Safety Sweep and Dead-Doc
  Link Check.
