# Execution Settings Persistence Baseline Tests

## Action 928 Update - Execution Settings Panel Extracted

- Updated settings persistence baseline coverage to include
  `components/execution/execution-settings-panel.tsx`.
- The tests now prove the settings page imports the extracted panel while
  retaining persistence helper ownership, automatic-mode lock handling, and
  status message behavior.
- The extracted component is checked for client-safe/no server-write-path
  boundaries.
- Status: `execution_settings_panel_extracted`.
- Recommended next action: Action 929 - Extract Execution Local Persistence
  Viewer Components.

## Action 923 Update - Refactor Summary Created

- Created `docs/execution-settings-persistence-refactor-summary.md`.
- The summary records how the Action 920 baseline tests continue to anchor the
  helper implementation and read/write wiring from Actions 921-922.
- This update is documentation-only and does not change tests or runtime code.
- Status: `execution_settings_persistence_refactor_summary_created`.
- Recommended next action: Action 924 - Create Execution UI Component
  Extraction Inventory.

## Action 922 Update - Helpers Wired

- Updated the baseline source checks to lock the new helper-backed settings and
  trade-app execution mode read/write surfaces.
- `app/trade-app.tsx` now reads through
  `readExecutionModePreference(getBrowserExecutionSettingsStorage(), ...)`.
- `app/settings/page.tsx` now reads through
  `readStoredExecutionModePreference(getBrowserExecutionSettingsStorage(), ...)`
  and writes through `writeStoredExecutionModePreference(...)`.
- Direct execution-mode `window.localStorage.getItem(EXECUTION_MODE_STORAGE_KEY)`
  and `window.localStorage.setItem(EXECUTION_MODE_STORAGE_KEY, mode)` paths are
  no longer expected in those app surfaces.
- Status: `execution_settings_persistence_helpers_wired`.
- Recommended next action: Action 923 - Create Execution Settings Persistence
  Refactor Summary.

## Action 921 Update - Helpers Implemented

- Added `lib/execution-settings-persistence-helpers.ts`.
- Added `tests/e2e/execution-settings-persistence-helpers.spec.ts`.
- Created `docs/execution-settings-persistence-helpers-implementation.md`.
- The Action 920 baseline remains the behavior contract for the new helper
  module; runtime wiring remains blocked until Action 922.
- Status: `execution_settings_persistence_helpers_implemented_client_safe`.
- Recommended next action: Action 922 - Wire Execution Settings Helpers Into
  Read/Write Paths.

Action: 920
Date: 2026-06-27
Status: `execution_settings_persistence_baseline_tests_added`

## Purpose

This document records the baseline tests added for current execution settings
persistence behavior before any settings persistence helper extraction. This
action is tests/docs only. It does not modify runtime behavior, extract
settings helpers, rename storage keys, change defaults, change read/write/reset
behavior, change handlers/effects/state mutation, change modal helper wiring,
change local persistence helper wiring, broaden lifecycle UI adapter wiring,
modify audit writer runtime persistence, run Supabase queries, run live proof or
insert, run migrations/typegen, edit generated types, modify `.env.local`, add
broker/Avanza behavior, enable automatic mode, or mutate trades/stats/PnL.

## Current Baseline Scope

- `EXECUTION_MODE_STORAGE_KEY` remains `ture_execution_mode`.
- `DEFAULT_EXECUTION_MODE` remains `semi_automatic`.
- Allowed execution modes remain `semi_automatic` and `automatic`.
- Missing, null, empty, invalid, and feature-disabled `automatic` values
  normalize to `semi_automatic`.
- Stored `semi_automatic` remains selected.
- Stored `automatic` remains persisted as a storage value but normalizes to
  `semi_automatic` unless the existing automatic feature flag permits it.
- `NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION` remains exact-string gated through
  `isAutomaticExecutionModeFeatureEnabled(...)`.
- Settings-page write behavior remains inline in `app/settings/page.tsx`.
- Trade-app read/refresh behavior remains inline in `app/trade-app.tsx`.
- No reset/clear path for `ture_execution_mode` was found or added.
- Mode-to-orchestrator authority behavior remains modeled only and does not add
  broker/Avanza order execution.

## Test Approach

Added `tests/e2e/execution-settings-persistence-baseline.spec.ts`.

The test imports pure execution constants and helpers from `lib/execution.ts`
and imports `runExecutionOrchestrator(...)` from
`lib/execution-orchestrator.ts`. It uses a fixture-local `MemoryStorage` and
fixture-local read/write replicas to characterize the current inline storage
behavior without extracting production logic.

The test also source-scans the current inline app/settings surfaces to lock:

- settings-page read/write function presence;
- `window.localStorage.getItem(EXECUTION_MODE_STORAGE_KEY)`;
- `window.localStorage.setItem(EXECUTION_MODE_STORAGE_KEY, mode)`;
- settings copy for feature-disabled automatic mode;
- settings copy that automatic mode is local and broker automation remains not
  connected;
- absence of an execution-mode remove/reset path;
- trade-app read/refresh function presence;
- trade-app `storage` and `focus` refresh listeners;
- modal copy that automatic authority does not mean broker connection or order
  execution is implemented.

The baseline keeps existing local persistence helper wiring unchanged by
asserting the adjacent local storage helper remains client-safe and separate
from server-only audit writer persistence.

## Coverage Map

| Behavior | Baseline coverage |
| --- | --- |
| Missing storage | Fixture-local read returns `DEFAULT_EXECUTION_MODE`. |
| Invalid storage | Fixture-local read normalizes to `semi_automatic`. |
| Stored semi-auto | Fixture-local read preserves `semi_automatic`. |
| Stored automatic, flag disabled | Storage value remains `automatic`; normalized selected mode is `semi_automatic`. |
| Stored automatic, flag enabled | Fixture-local read returns `automatic`. |
| Feature flag | `isAutomaticExecutionModeFeatureEnabled(...)` accepts only exact `"true"`. |
| Settings write | Source scan locks current inline `setItem(EXECUTION_MODE_STORAGE_KEY, mode)` write path. |
| Settings reset | Source scan locks absence of `removeItem(EXECUTION_MODE_STORAGE_KEY)`. |
| App read/refresh | Source scan locks current inline app reader and focus/storage refresh listeners. |
| Orchestrator authority | Pure orchestrator test proves semi-auto requires human confirmation and automatic remains modeled authority with no broker result. |
| Modal/readiness copy | Source scan locks current automatic-mode safety copy. |

## Boundaries Verified

- No audit writer server import was added.
- No service-role value, service-role alias use, or service-role exposure was
  added.
- No Supabase query, remote SQL, route call, or fetch path was added.
- No broker/Avanza behavior was added.
- No automatic order submission was enabled.
- No trade/stats/PnL mutation was added.
- No runtime behavior was changed.
- No settings helper extraction was performed.
- Existing modal helper wiring remains separated from storage.
- Existing local persistence helper wiring remains unchanged.

## Gaps And Limitations

- `readExecutionModePreferenceForTradeApp()` remains inline in
  `app/trade-app.tsx`; the baseline uses source checks and fixture-local
  replicas rather than importing private app functions.
- `readExecutionModePreference()` and `writeExecutionModePreference(...)`
  remain inline in `app/settings/page.tsx`; the baseline locks their source
  shape but does not extract or import them.
- Focus/storage event behavior is source-characterized, not browser-rendered,
  because helper extraction has not occurred yet.
- Settings UI interactions are not end-to-end clicked in this action; Action
  921 should introduce client-safe helpers before broader UI wiring tests are
  expanded.
- Existing unrelated settings-page Supabase reads/writes remain outside this
  execution mode persistence seam and were not modified.

## Validation

- `npx playwright test tests/e2e/execution-settings-persistence-baseline.spec.ts`
  passed with 5 tests after rerunning outside the sandbox because the sandbox
  blocked Playwright's local listener with `EPERM`.
- Related local storage, event log, records, dev mock, modal helper, modal open
  path, lifecycle UI adapter, lifecycle baseline, lifecycle service, lifecycle
  caller, and lifecycle hook regression bundle passed with 97 tests.
- Runtime denial harness syntax checks passed.
- UI/app-shell audit writer/lifecycle/proof/monitoring/cleanup/rollout scan
  returned no matches.
- Route invocation scan returned expected existing route/harness/regression
  references plus the new baseline's negative assertions only.
- `NEXT_PUBLIC_*SERVICE*` exposure scan returned no new public service-role env
  exposure.
- Service-role leakage scan returned documentation boundary statements,
  historical action notes, and new negative assertions only with no values
  printed.
- Settings-persistence-specific unsafe scan returned expected existing
  settings-page Supabase/automation references outside the execution-mode seam
  and no new unsafe helper target imports.
- Automatic-mode safety scan confirmed exact-string feature flag gating,
  disabled-by-default normalization, settings lock copy, and modeled authority
  boundaries.
- Focused market/scanner scan returned existing settings-page automation UI
  references and documentation/test safety copy only.
- `git diff --check`, touched-file trailing whitespace scan, zero-byte docs
  check, and `.env.local` diff check passed.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the existing Babel deopt note for large
  `app/trade-app.tsx`.

## Result Status

`execution_settings_persistence_baseline_tests_added`

## Recommended Next Action

Action 921 - Implement Client-Safe Execution Settings Persistence Helpers.
