# Dev/Diagnostics localStorage Post-Extraction Reassessment

## 1. Purpose

Reassess the dev/diagnostics localStorage wrapper extraction from Action 409.
This verifies that the extraction stayed within the intended app-local
dev/preference boundary and recommends the next safe persistence-boundary step.

## 2. Current Wrapper Inventory

Wrapper module:

- `lib/persistence/dev-diagnostics-local-storage.ts`

Exported API:

- `normalizeProviderPlanMode(value)`
- `readProviderPlanModeHint()`
- `writeProviderPlanModeHint(mode)`
- `readDevPreviewRecommendationsHidden()`
- `writeDevPreviewRecommendationsHidden(hidden)`
- `readDismissedWarnings()`
- `writeDismissedWarning(key)`
- `readLatestMockBrokerFillRaw()`
- `removeLatestMockBrokerFill()`

Keys used:

- `TRADE_PROVIDER_PLAN_MODE_STORAGE_KEY`
  - exact key: `trade-provider-plan-mode-v1`
- `TRADE_DEV_PREVIEW_RECOMMENDATIONS_HIDDEN_STORAGE_KEY`
  - exact key: `trade-dev-preview-recommendations-hidden-v1`
- `TRADE_DISMISSED_WARNINGS_STORAGE_KEY`
  - exact key: `trade-dismissed-warnings`
- `TRADE_MOCK_BROKER_LATEST_FILL_STORAGE_KEY`
  - exact key: `trade-mock-broker-latest-fill`

Read/write/remove behavior:

- provider plan mode:
  - reads raw storage value and normalizes to
    `free`/`grow`/`pro`/`custom`/`unknown`.
  - falls back to `unknown`.
  - writes the selected mode string.
  - swallows write errors.
- dev-preview recommendation visibility:
  - reads `true` as hidden.
  - returns `false` for missing values, non-`true` values, server/no-window,
    and localStorage errors.
  - writes `"true"` or `"false"`.
  - swallows write errors.
- dismissed warnings:
  - reads a JSON array into `Set<string>`.
  - filters non-string entries.
  - returns an empty set on server/no-window, malformed JSON, or localStorage
    errors.
  - appends the requested warning id and writes the last 250 warning ids.
  - swallows write errors.
- latest mock broker fill:
  - reads the raw localStorage string for the latest mock broker fill key.
  - removes the latest mock broker fill key during demo clear.
  - intentionally does not swallow read/remove errors inside the wrapper,
    preserving the previous caller-owned try/catch behavior.

Files using the wrapper:

- `app/trade-app.tsx`

Call-site ownership:

- `app/trade-app.tsx` still owns provider plan mode state.
- `app/trade-app.tsx` still owns dev-preview recommendation visibility state.
- `app/trade-app.tsx` still owns warning id construction through
  `warningDismissKey(...)`.
- `app/trade-app.tsx` still owns mock broker fill validation/import UI flows.
- initial-load effect guards remain in `app/trade-app.tsx`.

## 3. Boundary Verification

Exact key strings unchanged:

- the wrapper imports key constants from
  `lib/persistence/local-storage-keys.ts`.
- no localStorage key was renamed.

Data shapes unchanged:

- provider plan mode remains a plain string.
- dev-preview visibility remains `"true"`/`"false"` on write and only `"true"`
  reads as hidden.
- dismissed warnings remain a JSON string array capped to 250 entries.
- latest mock broker fill remains raw JSON/string payload storage.

Defaults and fallbacks unchanged:

- provider plan mode fallback remains `unknown`.
- dev-preview hidden fallback remains `false`.
- dismissed warnings fallback remains an empty `Set`.
- latest mock broker fill missing value still produces the existing
  "No latest mock broker fill found in localStorage." UI messages.

Server/no-window behavior preserved:

- provider plan reads return `unknown` without `window`.
- dev-preview hidden reads return `false` without `window`.
- dismissed warning reads return an empty set without `window`.
- dismissed warning writes no-op without `window`.
- provider/dev-preview writes remain called from client effects, matching the
  prior app-local behavior.

Error handling preserved:

- provider plan reads catch and return `unknown`.
- provider plan writes swallow errors.
- dev-preview reads catch and return `false`.
- dev-preview writes swallow errors.
- dismissed warning reads catch and return an empty set.
- dismissed warning writes swallow errors.
- latest mock broker fill reads/removes preserve caller-owned try/catch behavior.

Production trade behavior:

- no production trade behavior moved.
- no ADD TRADE validation moved.
- no close/sell behavior moved.
- no selected trade or modal behavior moved.

Diagnostics/audit/record stores untouched:

- `lib/safe-browser-action-diagnostics-store.ts` unchanged.
- `lib/dev-mock-broker-result-store.ts` unchanged.
- `lib/avanza-agent-bridge-config.ts` unchanged.
- `lib/avanza-agent-run-store.ts` unchanged.
- `lib/execution-record-store.ts` unchanged.
- `lib/execution-event-log.ts` unchanged.

Live market trial runbook persistence untouched:

- `readLiveMarketTrialRunbookState(...)` remains in `app/trade-app.tsx`.
- `normalizeLiveMarketTrialRunbookState(...)` remains in `app/trade-app.tsx`.
- the live market trial runbook write effect remains in `app/trade-app.tsx`.

No Supabase/trade/execution/orchestrator movement:

- no Supabase behavior moved.
- no trade mutation behavior moved.
- no execution handoff/orchestrator behavior moved.
- no Avanza/browser automation behavior moved.

## 4. Test Status

Action 409 checks:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- `git diff --check` passed.

Action 409 e2e status:

- default sandbox `npm run test:e2e` was blocked before app test logic by
  `listen EPERM: operation not permitted 0.0.0.0:3010`.
- escalated `npm run test:e2e` passed: 64 tests.

No known app regression was observed from the available checks.

## 5. Remaining Persistence Candidates

Ranked by safety and payoff:

1. Reassess live market trial runbook persistence wrapper.
2. Reassess execution audit/event log persistence boundary.
3. Reassess Supabase/trade persistence boundary.
4. Reassess execution metadata persistence much later.

Live market trial runbook is the best next reassessment target because:

- it is still app-local localStorage behavior.
- it has a contained key and local state shape.
- it is more domain-shaped than the Action 409 helpers, so it needs its own
  boundary review before movement.
- execution audit/event and Supabase/trade persistence are higher-risk domains.

## 6. Recommended Next Action

Recommended next action:

**Action 411 - Reassess Live Market Trial Runbook Persistence Wrapper**

Reason:

- Action 409 stayed within the app-local dev/preference boundary.
- live market trial runbook persistence is the next localStorage wrapper
  candidate, but it has typed defaults and normalization that require a focused
  reassessment.
- execution audit/event and Supabase/trade persistence should wait.

## 7. Risk Assessment

Dev/prod boundary risk:

- provider plan hints, dev-preview visibility, dismissed warnings, and mock
  fill helpers are app-visible in some flows. The wrapper stayed local and did
  not change production trade behavior.

Hidden panel preference risk:

- dev-preview visibility defaults are sensitive. The extraction preserved
  `false` fallback and `"true"`-only hidden reads.

Stale localStorage risk:

- existing stored provider hints, warning arrays, dev-preview flags, and mock
  fill payloads remain compatible because keys and data shapes are unchanged.

Test coverage risk:

- e2e passed in an escalated run, but the default sandbox still cannot bind the
  Playwright web server.

Future wrapper extraction risk:

- live market trial runbook persistence has more domain-shaped normalization
  and should not be moved without a focused boundary reassessment.

Persistence semantics risk:

- execution audit/event, execution records, Supabase writes, and trade
  mutations remain high risk and should not be grouped with local UI preference
  wrappers.

## 8. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 411 Follow-Up

Action 411 created
`docs/live-market-trial-runbook-persistence-wrapper-reassessment.md`.

Boundary outcome:

- Inventoried the inline live market trial runbook persistence in
  `app/trade-app.tsx`.
- Confirmed the exact localStorage key remains
  `trade-live-market-trial-runbook-v1`.
- Confirmed read behavior returns a typed default on server/no-window, missing
  storage, malformed JSON, or localStorage errors.
- Confirmed normalization owns selected mode, trial outcome, checklist
  completion coercion, notes truncation, trial date fallback, and ended-at
  text/null behavior.
- Concluded wrapper extraction is safe only if the exact
  default/normalization/read/write contract moves together and the parent keeps
  state, hydration/write-effect guards, UI callbacks, live market workflow,
  Supabase/trade behavior, and execution/orchestrator behavior.

Next recommended action:

**Action 412 - Extract Live Market Trial Runbook Persistence Wrapper**

## Action 412 Follow-Up

Action 412 created
`lib/persistence/live-market-trial-runbook-persistence.ts`.

Boundary outcome:

- Extracted only the live market trial runbook persistence helpers that were
  explicitly reassessed as safe.
- Preserved exact key/type/default/normalization/read/write/error behavior.
- Left app-local dev/preference helpers in
  `lib/persistence/dev-diagnostics-local-storage.ts`.
- Left diagnostics stores, execution audit/event stores, execution record
  stores, Supabase behavior, trade mutations, and execution/orchestrator
  behavior untouched.

Checks:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- default sandbox `npm run test:e2e` was blocked on `0.0.0.0:3010`.
- escalated `npm run test:e2e` passed: 64 tests.

Next recommended action:

**Action 413 - Reassess Live Market Trial Runbook Persistence Wrapper Extraction**

## Action 413 Follow-Up

Action 413 created
`docs/live-market-trial-runbook-persistence-post-extraction-reassessment.md`.

Boundary outcome:

- Verified the live market trial runbook wrapper stayed separate from the
  app-local dev/preference wrapper.
- Confirmed no diagnostics stores, execution audit/event stores, execution
  record stores, Supabase behavior, trade mutations, or execution/orchestrator
  behavior moved.
- Confirmed the next persistence reassessment should move beyond low-risk
  app-local localStorage wrappers.

Next recommended action:

**Action 414 - Reassess Execution Audit/Event Log Persistence Boundary**
