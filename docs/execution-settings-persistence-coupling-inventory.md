# Execution Settings Persistence Coupling Inventory

## Action 923 Update - Refactor Summary Created

- Created `docs/execution-settings-persistence-refactor-summary.md`.
- The summary closes the settings persistence refactor loop that began with this
  Action 919 coupling inventory.
- No runtime code, settings defaults, storage keys, automatic-mode gating, or
  audit writer paths were changed.
- Status: `execution_settings_persistence_refactor_summary_created`.
- Recommended next action: Action 924 - Create Execution UI Component
  Extraction Inventory.

## Action 922 Update - Helper Wiring Completed

- The `ture_execution_mode` read/write seam is now helper-backed.
- `app/trade-app.tsx` keeps the same read/refresh behavior but delegates storage
  resolution and mode normalization to `lib/execution-settings-persistence-helpers.ts`.
- `app/settings/page.tsx` keeps the same settings state and save-message
  behavior but delegates execution mode storage reads/writes to the helper.
- No reset path, key rename, default change, automatic-mode gating change,
  broker/Avanza behavior, or audit writer path change was introduced.
- Status: `execution_settings_persistence_helpers_wired`.
- Recommended next action: Action 923 - Create Execution Settings Persistence
  Refactor Summary.

## Action 921 Update - Client-Safe Helpers Implemented

- Added client-safe execution settings persistence helpers in
  `lib/execution-settings-persistence-helpers.ts`.
- Helpers preserve the `ture_execution_mode` key, semi-automatic default,
  invalid/missing fallback, automatic-mode feature flag gating, read/write
  behavior, no reset path, and no broker/Avanza/order-submission implications.
- Helpers are not wired into runtime paths in this action.
- Status: `execution_settings_persistence_helpers_implemented_client_safe`.
- Recommended next action: Action 922 - Wire Execution Settings Helpers Into
  Read/Write Paths.

## Action 920 Update - Baseline Tests Added

- Added `tests/e2e/execution-settings-persistence-baseline.spec.ts`.
- Created `docs/execution-settings-persistence-baseline-tests.md`.
- Baseline coverage now locks the `ture_execution_mode` key, semi-automatic
  default, invalid/missing fallback, automatic-mode feature flag normalization,
  fixture-local read/write characterization, inline settings/trade-app storage
  surfaces, modeled orchestrator authority relationship, and client-safe
  boundaries.
- Status: `execution_settings_persistence_baseline_tests_added`.
- Recommended next action: Action 921 - Implement Client-Safe Execution
  Settings Persistence Helpers.

Action: 919
Date: 2026-06-27
Status: `execution_settings_persistence_coupling_inventory_created`

## Purpose

This inventory records the current execution settings persistence coupling before
any extraction or helper wiring. It focuses on execution mode preference
storage, automatic-mode gating, adjacent execution settings stores, settings UI
controls, localStorage keys, defaults, read/write/reset paths, validation and
normalization, feature-flag interaction, and relationships to modal,
orchestrator, handoff, and dev/mock controls.

This action is documentation-only. It does not modify runtime code, extract
settings helpers, change settings defaults, rename storage keys, change
read/write/reset behavior, change handlers/effects/state mutation, alter modal
helper wiring, alter local persistence helper wiring, broaden lifecycle UI
adapter wiring, modify audit writer runtime persistence, change rollout flags,
run Supabase queries, run live proof/insert, run migrations/typegen, edit
generated types, modify `.env.local`, add broker/Avanza behavior, enable
automatic mode, or mutate trades/stats/PnL.

## Settings Keys And Defaults

| Key | Default | Allowed values | Owner | Read paths | Write/reset paths | Fallback and normalization | Surface |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ture_execution_mode` | `semi_automatic` | `semi_automatic`, `automatic` only when `NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION === "true"` | `lib/execution.ts`; app reader in `app/trade-app.tsx`; settings reader/writer in `app/settings/page.tsx` | `readExecutionModePreferenceForTradeApp()` reads during state initialization, initial load, focus, and storage events; `readExecutionModePreference()` reads in settings | `writeExecutionModePreference(mode)` writes in settings after `handleExecutionModeChange(...)` blocks feature-disabled automatic mode; no reset/remove path found | `normalizeExecutionMode(...)` maps invalid, missing, unreadable, or feature-disabled `automatic` values back to `DEFAULT_EXECUTION_MODE` | User-facing execution preference, feature-gated for `automatic` |
| `trade-paper-session-protocol-v1` | `createDefaultPaperSessionProtocolState("real_market_paper")` | `real_market_paper`, `demo_rehearsal`, `mock_broker_rehearsal`; outcomes `not_set`, `no_trade_valid`, `paper_trade_completed`, `blocked`, `needs_review` | `lib/paper-session-protocol.ts`; read/write in `app/trade-app.tsx` | `readPaperSessionProtocolState()` reads localStorage on initial load | `PaperSessionProtocolPanel` handlers update React state; effect writes JSON after `hasLoadedPaperSessionProtocolRef` is true; reset creates default state preserving selected mode | `normalizePaperSessionProtocolState(...)` filters step ids, validates mode/outcome, clamps notes to 2000 chars, and defaults malformed/unavailable storage | User-facing paper-session/local checklist, execution-adjacent |
| `trade-risk-controls-v1` | `createDefaultRiskControlsSettings()` with enabled `true`, mode `demo`, manual review for real mode `true`, daily stop enabled `true` | `demo`, `real_prep`, `strict` for risk mode; several numeric, ticker-list, and position sizing fields | `lib/risk-controls.ts`; read in `app/trade-app.tsx` | `readRiskControlsSettingsForTradeApp()` reads localStorage on initial load | No write/reset path found in the inspected Action 919 `app/trade-app.tsx` ranges; settings controls may exist outside this exact execution-mode seam | `normalizeRiskControlsSettings(...)` defaults malformed values, normalizes tickers, numbers, booleans, and modes | User-facing risk controls that influence execution readiness and recommendation/trade gates |
| demo storage keys from `TRADE_DEMO_STORAGE_KEYS` | empty arrays / no last action | demo recommendation, active position, closed position, last action payloads | `lib/persistence/local-storage-keys.ts`; demo helpers in `app/trade-app.tsx` | Demo read helpers only when `demoTradingFlowEnabled` | Demo clear removes recommendations, active positions, closed positions, and last action; demo writers cap lists at 25 | Disabled outside dev/demo flag; parse failures fall back to empty state | Dev/mock controls adjacent to execution QA |
| `trade-management-events` | empty array | heterogeneous local event objects | `lib/persistence/local-storage-keys.ts`; inline writers; `lib/execution-timeline.ts` | timeline readers and app local event reads | many inline append paths; clear/reset not part of Action 919 seam | best-effort parse/write logic; malformed values generally fall back to empty arrays | Broader local timeline, not settings preference |

## Execution Mode Preference Flow

- `lib/execution.ts` defines `ExecutionMode` as `semi_automatic | automatic`.
- `DEFAULT_EXECUTION_MODE` is `semi_automatic`.
- `EXECUTION_MODE_STORAGE_KEY` is `ture_execution_mode`.
- `isAutomaticExecutionModeFeatureEnabled(...)` reads
  `NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION` and returns true only for the exact
  string `"true"`.
- `normalizeExecutionMode(...)` accepts `semi_automatic`, accepts `automatic`
  only when automatic mode is feature-enabled, and otherwise returns
  `semi_automatic`.
- `app/trade-app.tsx` initializes `selectedExecutionMode` from
  `readExecutionModePreferenceForTradeApp()`.
- The same reader runs during the initial zero-delay startup effect and during
  browser `focus` and `storage` events.
- The current inspected app path passes `selectedExecutionMode` into
  `ExecutionSandboxFixturePanel` and each `ActivePositionCard`.
- `ExecutionSandboxFixtureCard` passes the mode into `runExecutionOrchestrator`
  as both input mode and live-position mode.
- `ActivePositionCard` passes the mode into `runExecutionOrchestrator` for live
  position exit handoffs.
- `runExecutionOrchestrator(...)` supplies the mode to
  `buildSellExecutionIntentsForLivePositions(...)`, which normalizes missing or
  unknown values to `semi_automatic` and preserves `automatic`.
- `ExecutionIntent.authority` is derived through
  `getExecutionAuthorityForMode(...)`: semi-automatic requires human final
  confirmation and blocks submit; automatic sets submit/final-submit flags true.
- Modal open helpers receive the orchestrator result. They do not read or write
  the persisted preference; they carry the selected intent, handoff, and
  lifecycle snapshot already built from the mode.
- No in-app execution mode selector write path was found in `app/trade-app.tsx`
  during Action 919 inspection.
- `app/settings/page.tsx` owns the current settings-page write path:
  `handleExecutionModeChange(...)` rejects `automatic` when
  `automaticExecutionEnabled` is false, then `writeExecutionModePreference(...)`
  stores the selected mode and updates settings page state/message.

## Automatic-Mode Gating

- Feature flag: `NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION`.
- Default disabled behavior: any stored `automatic` value is normalized back to
  `semi_automatic` unless the flag is exactly `"true"`.
- UI/runtime safety behavior:
  - semi-automatic authority has `can_submit_broker_order: false`,
    `allowFinalSubmit: false`, and `requires_human_final_confirmation: true`;
  - automatic authority has submit flags true in the model, but current modal
    copy still states that no broker connection or order execution is
    implemented in the preview;
  - `useAvanzaReadinessState` treats automatic mode as out of scope and keeps
    readiness checks focused on semi-automatic/manual confirmation;
  - many execution-record/audit writer validators and regression tests keep
    `automaticModeAllowed: false`.
- Stored preference interaction: storage may contain `"automatic"`, but the
  feature flag gate controls whether it can become selected runtime state.
- Safety copy boundary: current modal copy distinguishes automatic authority
  from implementation, and semi-automatic copy states that the user must
  manually press final Avanza buy/sell.
- No-submit/Avanza boundary: the inspected Action 919 path does not add broker
  submit behavior, Avanza automation, route calls, or audit writer client
  invocation.

## Settings UI Coupling

- `ExecutionSandboxFixturePanel` is shown only when execution dev tools are
  enabled. It displays local QA fixture cards and passes the selected execution
  mode into each fixture.
- `ActivePositionCard` receives the selected execution mode for live-position
  exit monitoring and handoff preview creation.
- `ExecutionHandoffPreviewModal` shows mode-dependent authority copy and
  exposes dev-only Avanza request/bridge/dry-run previews behind dev tools.
- `PaperSessionProtocolPanel` has a protocol mode selector, start/end/reset
  buttons, checklist checkboxes, outcome selector, and notes field. It is
  execution-adjacent but separate from `ture_execution_mode`.
- `LiveTestReadinessPanel` receives its selected mode separately from the paper
  protocol state and is synchronized only when paper protocol mode changes to
  `demo_rehearsal` or `real_market_paper`.
- Risk controls panels and evaluations consume `riskControlsSettings` and can
  influence readiness, recommendation empty-state summaries, and trade gates,
  but are not the same as execution mode preference.
- Dev/mock controls are gated by `demoTradingFlowEnabled` and execution dev
  tools; they must remain separate from production broker/Avanza behavior.
- Action 912 identified the settings page as a local store reader/clear surface
  and execution mode preference writer surface. Action 920 should baseline this
  exact settings-page behavior before any helper extraction.

## Runtime Coupling

- `readExecutionModePreferenceForTradeApp()` directly reads browser storage and
  normalizes against the automatic-mode feature flag.
- `selectedExecutionMode` state is initialized from that reader.
- Initial app effect refreshes selected execution mode alongside broker cost
  model, risk controls, paper session protocol, live-market trial runbook,
  provider plan hint, dev preview preferences, demo last action, and local
  recommendation stores.
- A second effect refreshes selected execution mode on browser `focus` and
  `storage` events.
- The selected mode feeds orchestrator inputs for sandbox fixtures and live
  position cards.
- The orchestrator result feeds UI status, lifecycle UI state, modal open state,
  Avanza handoff preview, and modal copy.
- Modal prepare/capture helpers use `selectedIntent.mode` for lifecycle follow-up
  transitions and messages, but do not own storage.
- Paper-session protocol state is read on startup, written by effect, and can
  update live-test readiness mode.
- Risk controls settings are read on startup and passed into readiness,
  recommendation empty-state, live-test readiness, position sizing, add-trade
  preflight, active-position risk evaluation, and trade modal surfaces.

## Boundary Risks

- The execution mode key string is centralized in `lib/execution.ts`, but
  browser read logic is inline in `app/trade-app.tsx` and settings-page behavior
  is separate.
- A stored `automatic` value can exist even when the feature flag is off; all
  readers must continue normalizing it back to `semi_automatic`.
- No app write path for `ture_execution_mode` was found in `app/trade-app.tsx`,
  which makes settings-page baseline coverage important before extraction.
- Settings state can diverge across tabs unless focus/storage refresh remains
  intact.
- Automatic authority model flags can be confused with implemented broker
  execution; copy/tests must keep "authority modeled" separate from "broker
  automation implemented".
- `PaperSessionProtocolMode`, `LiveTestReadinessMode`, `RiskControlsMode`, and
  `ExecutionMode` all use "mode" language but control different systems.
- Resetting paper-session protocol must not clear execution mode preference,
  risk controls, event logs, execution records, or dev mock broker result
  stores.
- Risk controls settings can affect trade/recommendation gates, but extracting
  execution preference helpers must not mutate risk-control behavior.
- Client storage helpers must not be imported into server-only audit writer
  modules.
- Execution settings persistence must remain separate from server-side audit
  persistence and service-role boundaries.

## Proposed Extraction Seams

1. Action 920 - Add Execution Settings Persistence Baseline Tests.
   Freeze `ture_execution_mode`, automatic flag normalization, app startup
   refresh, focus/storage refresh, settings-page read/write behavior, and
   paper-session/risk-control adjacency before helper extraction.
2. Action 921 - Implement Client-Safe Execution Settings Persistence Helpers.
   Add a small client-safe helper for reading/writing execution settings without
   importing server-only modules or changing defaults.
3. Action 922 - Wire Execution Settings Helpers Into Read/Write Paths.
   Replace inline execution settings reads/writes only after baseline tests prove
   behavior.
4. Action 923 - Create Execution Settings Persistence Refactor Summary.
   Summarize helper scope, wiring scope, tests, boundaries, and next refactor
   direction.

## Safety Boundaries

- Semi-automatic remains the default and recommended execution mode.
- Automatic mode remains gated by existing feature flag behavior and is not
  enabled by this action.
- No broker/Avanza execution behavior is added.
- No audit writer UI/browser/client invocation is added.
- No market/scanner invocation is added.
- No trade/stats/PnL mutation changes are made.
- No service-role value is exposed.
- No migrations, type generation, or generated type edits are performed.
- Audit writer server-only rollout remains untouched.
- Settings inventory is not approval to change keys, defaults, handlers,
  effects, state mutation, or reset semantics.

## Validation

- Runtime denial harness syntax checks passed.
- UI/app-shell audit writer/lifecycle/proof/monitoring/cleanup/rollout scan
  returned no matches.
- Route invocation scan returned only expected existing route, harness, and
  regression test references.
- Focused market/scanner scan for the Action 919 settings surface returned
  existing settings-page automation UI references plus documentation boundary
  statements only.
- `NEXT_PUBLIC_*SERVICE*` exposure scan returned no matches.
- Service-role leakage scan returned documentation boundary statements and
  historical action notes only with no values printed.
- Settings-persistence-specific unsafe import scan found existing settings
  Supabase reads/writes unrelated to this Action 919 inventory plus no new
  server-only/service-role helper target imports.
- Automatic-mode safety scan confirmed the existing disabled-by-default feature
  flag gate, settings lock message, and modeled authority boundary.
- Broad env/client/write scan returned expected documentation and existing
  settings/localStorage/env references only.
- `git diff --check`, touched-file trailing whitespace scan, and zero-byte docs
  check passed.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the existing Babel deopt note for large
  `app/trade-app.tsx`.

## Result Status

`execution_settings_persistence_coupling_inventory_created`

## Recommended Next Action

Action 920 - Add Execution Settings Persistence Baseline Tests.
