# Dev/Diagnostics localStorage Wrapper Reassessment

## 1. Purpose

Reassess dev/diagnostics localStorage usage before moving any wrappers. This
action determines whether any development, diagnostics, or local preview
read/write behavior can be extracted safely without affecting production trade
behavior, Supabase persistence, trade mutations, execution orchestration, or
Avanza/browser behavior.

## 2. Current Dev/Diagnostics Persistence Inventory

App-local dev/diagnostics and local-preview keys:

- `trade-mock-broker-latest-fill`
  - constant: `TRADE_MOCK_BROKER_LATEST_FILL_STORAGE_KEY`
  - local alias: `latestMockBrokerFillStorageKey`
  - location: `app/trade-app.tsx`
  - behavior: read latest mock broker fill payload from localStorage; removed
    during demo reset.
  - category: dev/mock broker preview, production-visible only as dev/mock
    tooling.
- `trade-dismissed-warnings`
  - constant: `TRADE_DISMISSED_WARNINGS_STORAGE_KEY`
  - local alias: `dismissedWarningsStorageKey`
  - location: `app/trade-app.tsx`
  - behavior: read JSON array into a `Set`, append a generated warning key,
    write the last 250 warning ids.
  - category: local UI preference/diagnostic warning dismissal.
- `trade-live-market-trial-runbook-v1`
  - constant: `TRADE_LIVE_MARKET_TRIAL_RUNBOOK_STORAGE_KEY`
  - location: `app/trade-app.tsx`
  - behavior: read normalized local runbook state; write current runbook state
    after initial load.
  - category: local trial/runbook notes and checklist state.
- `trade-provider-plan-mode-v1`
  - constant: `TRADE_PROVIDER_PLAN_MODE_STORAGE_KEY`
  - location: `app/trade-app.tsx`
  - behavior: read a provider plan mode hint with fallback `unknown`; write the
    selected hint after initial load.
  - category: diagnostics/local provider budget hint.
- `trade-dev-preview-recommendations-hidden-v1`
  - constant: `TRADE_DEV_PREVIEW_RECOMMENDATIONS_HIDDEN_STORAGE_KEY`
  - location: `app/trade-app.tsx`
  - behavior: read `true` as hidden and anything else as visible; write
    `"true"` or `"false"` after initial load.
  - category: dev-preview recommendation visibility preference.

Existing dedicated diagnostics/local execution modules:

- `lib/safe-browser-action-diagnostics-store.ts`
  - key: `ture_safe_browser_action_diagnostics_v1`
  - behavior: read normalized diagnostics list, append batches, cap to 500,
    clear via remove, return store read result with discarded count and error.
  - call sites: settings diagnostics, tests, localhost bridge diagnostics flow.
- `lib/dev-mock-broker-result-store.ts`
  - key: `ture_dev_mock_broker_results_v1`
  - behavior: read normalized mock broker execution results, append batches,
    cap to 500, clear via remove, filter by request/intent/position/
    recommendation.
  - call sites: mock broker confirmation save button, settings diagnostics,
    tests.
- `lib/avanza-agent-bridge-config.ts`
  - key: `ture_avanza_agent_bridge_config_v1`
  - behavior: read/write/clear selected local bridge transport config with
    fallback transport `none`.
  - call sites: settings page and `app/trade-app.tsx` bridge config reads.
- `lib/avanza-agent-run-store.ts`
  - local execution/agent run diagnostics store.
  - behavior: read/append/clear/filter stored agent runs.
  - risk: higher because it is execution-adjacent.
- `lib/execution-record-store.ts`
  - local execution record store.
  - behavior: read/append/clear/filter stored execution records.
  - risk: higher because it is record/result-adjacent.
- `lib/execution-event-log.ts`
  - key: `ture_execution_event_log_v1`
  - behavior: create/read/append/clear/filter execution audit events.
  - risk: higher because it is audit/idempotency-adjacent.

Read/write/remove behavior:

- Existing store modules already perform localStorage guards, normalization,
  append/cap behavior, and clear behavior.
- App-local preference helpers generally no-op or fallback on server/no-window
  and swallow localStorage errors.
- App-level runbook/provider/dev-preview writes are gated by
  `hasLoaded...Ref` guards to avoid overwriting before initial load.

Default/fallback behavior:

- mock latest fill: missing or malformed payload results in no imported fill
  at the call sites.
- dismissed warnings: malformed or unavailable storage returns an empty set.
- live market trial runbook: unavailable/malformed storage returns a default
  runbook state.
- provider plan mode: unavailable/malformed storage returns `unknown`.
- dev-preview hidden flag: unavailable/missing/malformed storage returns
  `false`.
- store modules return empty arrays plus availability/error metadata.

Error handling:

- app-local helpers swallow errors to avoid blocking the app.
- existing diagnostics stores return `false` on failed writes and expose read
  errors in read-result objects where applicable.

Server/no-window behavior:

- app-local read helpers return defaults when `window` is unavailable.
- existing store modules use `getStorage()` or explicit `typeof window`
  checks.

## 3. Coupling Analysis

Diagnostics viewer state:

- settings diagnostics already consume existing store modules.
- safe browser diagnostics and dev mock broker result stores are already
  isolated enough as modules.

Execution sandbox previews:

- safe browser diagnostics, dev mock broker results, Avanza agent runs,
  execution records, and execution event logs are used by sandbox/dev preview
  surfaces.
- execution record/event/agent run stores are execution-adjacent and should be
  reassessed separately before any consolidation.

Localhost bridge/debug state:

- `avanza-agent-bridge-config` already owns local bridge transport persistence.
- bridge/client calls and bridge runner behavior must remain module-owned and
  untouched.

Hidden dev panels:

- `trade-dev-preview-recommendations-hidden-v1` is app-local and UI-preference
  oriented.
- It is a plausible wrapper candidate if the exact `true`/fallback semantics
  and initial-load guard stay in `app/trade-app.tsx`.

App settings/production UI coupling:

- provider plan mode and live market trial runbook are visible in app settings
  or dashboard surfaces, but they are local hints/checklists rather than trade
  mutation persistence.
- extracting tiny read/write helpers is safe only if calculation and rendering
  stay parent-owned.

E2E-visible UX behavior:

- warning dismissal, dev-preview visibility, mock broker fill import, and
  runbook/provider hints can affect visible UI.
- Exact default values and storage strings must be preserved.

localStorage compatibility risk:

- keys are already centralized as constants.
- data shapes must not change, especially runbook JSON, dismissed warnings
  arrays, and dev-preview `"true"`/`"false"` strings.

## 4. Proposed Wrapper Boundary

The safest next wrapper boundary is:

- `lib/persistence/dev-diagnostics-local-storage.ts`

Potential API:

- `readDismissedWarningKeys()`
- `writeDismissedWarningKey(key)`
- `readDevPreviewRecommendationsHidden()`
- `writeDevPreviewRecommendationsHidden(hidden)`
- `readProviderPlanModeHint()`
- `writeProviderPlanModeHint(mode)`
- possibly `readLatestMockBrokerFillRaw()` only if it mirrors existing call
  sites exactly.

Keep the boundary small:

- exported functions only for exact existing read/write behavior.
- no migration.
- no default changes.
- no UI state.
- no effect guard movement.
- no bridge/client calls.

Do not include in the first wrapper:

- `safe-browser-action-diagnostics-store`.
- `dev-mock-broker-result-store`.
- `avanza-agent-run-store`.
- `execution-record-store`.
- `execution-event-log`.
- `avanza-agent-bridge-config`.

Those modules already own their wrappers or are execution/audit-adjacent enough
to need separate reassessment.

Alternative module:

- `lib/persistence/execution-dev-preview-persistence.ts`

This is less safe as the immediate next step because the name could blur
execution-preview storage with execution audit/record persistence. Use the
broader dev/diagnostics wrapper only for local UI preference helpers first.

## 5. What Should Remain Parent/Module-Owned

- actual diagnostics computation.
- execution sandbox state.
- bridge/client calls.
- Avanza bridge config behavior.
- settings page refresh/state behavior.
- UI state and effect initial-load guards.
- local mock broker result validation and store behavior.
- safe browser action diagnostics normalization/store behavior.
- execution event log, execution record, and Avanza agent run persistence.
- production trade behavior.
- Supabase/trade/execution persistence.

## 6. What Should Not Happen

- no key name changes.
- no data shape changes.
- no migration.
- no production behavior changes.
- no bridge/execution behavior movement.
- no Supabase behavior.
- no trade mutation behavior.
- no execution audit/event log behavior movement.
- no execution record/result behavior movement.
- no removal of existing settings diagnostics store modules.

## 7. Risk Assessment

Dev/prod boundary risk:

- some dev/preferences are visible in production UI surfaces. Wrapper names and
  docs must make clear they are local UI preferences, not trade persistence.

Stale localStorage risk:

- users may already have old warning arrays, provider hints, runbook JSON, and
  dev-preview flags. Extraction must preserve exact parsing and fallbacks.

Hidden panel visibility risk:

- changing the dev-preview hidden default from `false` would visibly alter
  recommendation panels.

Diagnostics accuracy risk:

- existing store modules normalize and count discarded diagnostics. Do not
  consolidate them with app-local helpers without a separate plan.

E2E coverage limitation:

- recent e2e runs have been blocked by sandbox browser/server permissions.
- future runtime wrapper extraction should still run static checks and should be
  browser-verified in an environment that can launch Chromium.

Future wrapper extraction risk:

- execution audit/event and execution record stores look similar to
  diagnostics stores but have higher safety requirements.
- they should be the subject of a dedicated execution audit/event persistence
  boundary reassessment.

## 8. Recommended Next Action

Recommended next action:

**Action 409 - Extract Dev/Diagnostics localStorage Wrapper**

Reason:

- there are several app-local dev/preference helpers with exact, low-risk
  localStorage semantics.
- key constants are already centralized.
- existing diagnostics store modules should stay as-is.
- execution audit/event and execution record persistence should wait for a
  separate boundary reassessment.

## 9. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 409 Follow-Up

Action 409 created
`lib/persistence/dev-diagnostics-local-storage.ts`.

Helpers moved:

- `normalizeProviderPlanMode(...)`
- `readProviderPlanModeHint()`
- `writeProviderPlanModeHint(...)`
- `readDevPreviewRecommendationsHidden()`
- `writeDevPreviewRecommendationsHidden(...)`
- `readDismissedWarnings()`
- `writeDismissedWarning(...)`
- `readLatestMockBrokerFillRaw()`
- `removeLatestMockBrokerFill()`

Behavior preserved:

- exact static key constants from `lib/persistence/local-storage-keys.ts`.
- provider plan fallback remains `unknown`.
- dev-preview hidden fallback remains `false`.
- dismissed warning fallback remains an empty `Set`.
- dismissed warning writes still keep the last 250 ids.
- latest mock broker fill reads still throw to the existing caller catch if
  localStorage access fails.
- demo reset still removes the latest mock broker fill key inside the existing
  demo clear try/catch.

Left in `app/trade-app.tsx`:

- live market trial runbook read/write and normalization, because that helper
  is shaped by local runbook defaults and UI state.
- `warningDismissKey(...)`, because it is a UI-specific dynamic warning id
  builder rather than storage access.
- effect initial-load guards and all UI state.

Still module-owned:

- safe browser action diagnostics store.
- dev mock broker result store.
- Avanza agent bridge config.
- Avanza agent run store.
- execution record store.
- execution event log.

Verification for Action 409:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- `git diff --check` passed.
- default sandbox `npm run test:e2e` was blocked before app test logic by
  `listen EPERM: operation not permitted 0.0.0.0:3010`.
- escalated `npm run test:e2e` passed: 64 tests.

Next recommended action:

**Action 410 - Reassess Dev/Diagnostics localStorage Wrapper Extraction**

## Action 410 Follow-Up

Action 410 created
`docs/dev-diagnostics-local-storage-post-extraction-reassessment.md`.

Result:

- Verified the wrapper exports only app-local dev/preference helpers.
- Confirmed key strings, data shapes, fallbacks, no-window behavior, and error
  handling were preserved.
- Confirmed diagnostics stores, execution audit/event stores, execution record
  stores, live market trial runbook persistence, Supabase behavior, trade
  mutations, and execution/orchestrator behavior remain untouched.
- Documented Action 409 checks, including escalated e2e success.

Next recommended action:

**Action 411 - Reassess Live Market Trial Runbook Persistence Wrapper**

## Action 411 Follow-Up

Action 411 created
`docs/live-market-trial-runbook-persistence-wrapper-reassessment.md`.

Result:

- Confirmed live market trial runbook persistence is more locally
  typed/default-coupled than the Action 409 helpers.
- Inventoried exact key, default state, normalization, read/write behavior,
  error handling, and call sites.
- Concluded the next wrapper is safe only if the exact default,
  normalization, read, and write behavior moves together.
- Confirmed diagnostics stores, execution audit/event stores, execution record
  stores, Supabase behavior, trade mutations, and execution/orchestrator
  behavior remain untouched.

Next recommended action:

**Action 412 - Extract Live Market Trial Runbook Persistence Wrapper**
