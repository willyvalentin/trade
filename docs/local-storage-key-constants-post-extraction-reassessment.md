# localStorage Key Constants Post-Extraction Reassessment

## 1. Purpose

Reassess the localStorage key constants extraction from Action 402. This confirms
the change stayed within the intended constants-only boundary and recommends
the next safe persistence-boundary step.

## 2. Current Constants Module Inventory

Action 402 created `lib/persistence/local-storage-keys.ts`.

Exported constants:

- `TRADE_DEMO_RECOMMENDATIONS_STORAGE_KEY` =
  `trade-demo-recommendations-v1`
- `TRADE_DEMO_ACTIVE_POSITIONS_STORAGE_KEY` =
  `trade-demo-active-positions-v1`
- `TRADE_DEMO_CLOSED_POSITIONS_STORAGE_KEY` =
  `trade-demo-closed-positions-v1`
- `TRADE_DEMO_LAST_ACTION_STORAGE_KEY` =
  `trade-demo-last-action-v1`
- `TRADE_DEMO_STORAGE_KEYS`
- `TRADE_MOCK_BROKER_LATEST_FILL_STORAGE_KEY` =
  `trade-mock-broker-latest-fill`
- `TRADE_DISMISSED_WARNINGS_STORAGE_KEY` =
  `trade-dismissed-warnings`
- `TRADE_LIVE_MARKET_TRIAL_RUNBOOK_STORAGE_KEY` =
  `trade-live-market-trial-runbook-v1`
- `TRADE_PROVIDER_PLAN_MODE_STORAGE_KEY` =
  `trade-provider-plan-mode-v1`
- `TRADE_DEV_PREVIEW_RECOMMENDATIONS_HIDDEN_STORAGE_KEY` =
  `trade-dev-preview-recommendations-hidden-v1`
- `TRADE_MANAGEMENT_EVENTS_STORAGE_KEY` =
  `trade-management-events`

Categories covered:

- demo/local trade state keys.
- mock broker latest-fill readback key.
- UI preference/dev workflow keys.
- shared trade management event-log key.

Files using the centralized constants:

- `app/trade-app.tsx`
- `lib/execution-timeline.ts`

Keys intentionally left inline or in existing owning modules:

- dynamic EOD acknowledgement keys remain in `app/trade-app.tsx` through
  `getEndOfDayAcknowledgementKey(positionId, date)`.
- recommendation snapshot, scan-run, batch, outcome, and evaluation-run keys
  remain in their recommendation persistence modules.
- execution event log, execution record store, Avanza agent run store,
  diagnostics stores, bridge config, risk controls, execution mode, broker
  costs, paper session protocol, and verification-note keys remain in their
  current modules.

## 3. Boundary Verification

Exact key strings unchanged:

- verified by inspecting `lib/persistence/local-storage-keys.ts`; strings match
  the Action 401 inventory.

No read/write helpers:

- the new constants module exports constants and one grouped demo-key object
  only.
- it contains no `localStorage` access.
- it contains no parsing, writing, deleting, or persistence helper logic.

No dynamic builders:

- dynamic EOD key generation remains in `app/trade-app.tsx`.
- `getEndOfDayAcknowledgementKey` still returns
  `eod_acknowledged_${positionId}_${date}`.

No migrations/defaults:

- no migration code was added.
- no default value code was moved or changed.

No behavior movement:

- `app/trade-app.tsx` still owns the same demo, warning, runbook, provider mode,
  dev preview, mock fill, EOD acknowledgement, and trade management event
  helper behavior.
- `lib/execution-timeline.ts` still only reads trade management events; it now
  reads with the shared exact constant.

No persistence semantics changed:

- no Supabase behavior moved.
- no trade mutation behavior moved.
- no execution/orchestrator persistence moved.
- no recommendation-learning persistence moved.
- no localStorage read/write/delete sites moved into new wrappers.

## 4. Test Status

Action 402 checks:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- `git diff --check` passed.

Action 402 e2e status:

- `npm run test:e2e` could not complete in the sandbox.
- first failure mode: Playwright web server could not bind
  `0.0.0.0:3010` due to `listen EPERM`.
- workaround attempted: start Next dev bound to `127.0.0.1:3010` and run
  Playwright with `PLAYWRIGHT_SKIP_WEB_SERVER=true`.
- second failure mode: Chromium launch failed before test logic with macOS
  sandbox permission errors:
  `MachPortRendezvousServer... Permission denied`.
- this is documented as an environment/sandbox limitation, not an observed app
  regression.

No known app regression was observed from the available checks.

## 5. Remaining Persistence Candidates

Ranked by safety and payoff:

1. Reassess EOD acknowledgement persistence wrapper.
2. Reassess recommendation discard persistence wrapper.
3. Reassess dev/diagnostics localStorage wrappers.
4. Supabase/trade persistence boundary later.
5. Execution metadata persistence much later.

EOD acknowledgement is the next best reassessment target because:

- its behavior is small and isolated compared with trade mutations.
- it already has a clear dynamic key builder and read/write pair.
- it is still persistence-sensitive enough to deserve a reassessment before
  runtime movement.

## 6. Recommended Next Action

Recommended next action:

**Action 404 - Reassess EOD Acknowledgement Persistence Wrapper**

## Action 404 Result

Action 404 added
`docs/eod-acknowledgement-persistence-wrapper-reassessment.md`.

Result:

- Inventoried EOD acknowledgement key generation, read behavior, write
  behavior, fallback behavior, error handling, and `ActivePositionCard` call
  sites.
- Confirmed the dynamic key format is
  `eod_acknowledged_${positionId}_${date}`.
- Confirmed extraction is safe only as a tiny wrapper that preserves the exact
  key format, `"true"` value, `false` read fallback, no-op server behavior, key
  removal behavior, and swallowed localStorage errors.
- Confirmed EOD safety calculation, acknowledgement UI state, close/sell flows,
  Supabase behavior, and execution/orchestrator behavior should remain
  parent/card-owned.

Next recommended action:

**Action 405 - Extract EOD Acknowledgement Persistence Wrapper**

## Action 405 Result

Action 405 created
`lib/persistence/eod-acknowledgement-persistence.ts`.

Result:

- Extracted the EOD acknowledgement dynamic key builder and read/write helpers
  into a tiny persistence wrapper.
- Preserved the exact key format, `"true"` value, `false` read fallback,
  server no-op behavior, remove-on-false behavior, and swallowed localStorage
  errors.
- Kept `ActivePositionCard` UI state, EOD safety calculation, close/sell flows,
  Supabase behavior, and execution/orchestrator behavior in place.

Next recommended action:

**Action 406 - Reassess EOD Acknowledgement Persistence Wrapper Extraction**

## Action 406 Result

Action 406 added
`docs/eod-acknowledgement-persistence-post-extraction-reassessment.md`.

Result:

- Reassessed the first extracted localStorage read/write wrapper.
- Confirmed EOD acknowledgement persistence behavior remained unchanged.
- Recommended recommendation discard persistence as the next boundary to
  reassess.

Next recommended action:

**Action 407 - Reassess Recommendation Discard Persistence Wrapper**

Reason:

- constants extraction stayed within bounds.
- the next boundary should still be reassessment-only.
- EOD acknowledgement is smaller than recommendation discard persistence,
  Supabase/trade persistence, or execution metadata persistence.

## 7. Risk Assessment

Key typo risk:

- lower after Action 402 for centralized static keys.
- still meaningful for any future movement of dynamic or helper-module keys.

Stale localStorage compatibility risk:

- unchanged. Existing browser profiles still depend on exact key names.

E2E environment limitation:

- current sandbox prevents a complete Playwright run because Chromium cannot
  launch under macOS Mach port permissions.
- available static checks passed, but e2e-visible behavior still needs a normal
  browser-capable environment.

Future read/write wrapper risk:

- higher than constants-only extraction because wrappers can change error
  swallowing, default values, parsing, deletion, or write ordering.

Persistence semantics risk:

- high for trade state, audit/event logs, recommendation learning, and
  execution metadata.
- medium/high for EOD acknowledgement because it controls whether warnings are
  considered acknowledged.

## 8. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 407 Follow-Up

Action 407 added
`docs/recommendation-discard-persistence-wrapper-reassessment.md`.

Boundary outcome:

- No additional key constants or localStorage helpers were moved.
- Recommendation discard persistence was found to be Supabase/status/metadata
  coupled rather than a static localStorage key boundary.
- Recommendation-learning persistence keys remain intentionally separate from
  discard confirmation persistence.

Next recommended action:

**Action 408 - Reassess Dev/Diagnostics localStorage Wrapper**

## Action 408 Follow-Up

Action 408 added
`docs/dev-diagnostics-local-storage-wrapper-reassessment.md`.

Boundary outcome:

- Static key constants remain unchanged.
- Dev/diagnostics wrapper reassessment found a safe next target only for exact
  app-local localStorage helper behavior.
- Existing diagnostics store modules and execution/audit stores should not be
  consolidated in the next action.

## Action 409 Follow-Up

Action 409 added
`lib/persistence/dev-diagnostics-local-storage.ts`.

Boundary outcome:

- The new wrapper consumes the existing static key constants without changing
  key strings.
- No additional constants were renamed.
- No diagnostics store, execution audit/event store, execution record store,
  Supabase behavior, or trade mutation behavior moved.

Next recommended action:

**Action 410 - Reassess Dev/Diagnostics localStorage Wrapper Extraction**

## Action 410 Follow-Up

Action 410 added
`docs/dev-diagnostics-local-storage-post-extraction-reassessment.md`.

Boundary outcome:

- Verified the dev/diagnostics wrapper still consumes exact static key
  constants.
- Confirmed no key strings or data shapes changed.
- Confirmed diagnostics/audit/record stores and trade persistence remain
  untouched.

Next recommended action:

**Action 411 - Reassess Live Market Trial Runbook Persistence Wrapper**

## Action 411 Follow-Up

Action 411 added
`docs/live-market-trial-runbook-persistence-wrapper-reassessment.md`.

Boundary outcome:

- Confirmed the live market trial runbook key still uses the exact static
  constant value `trade-live-market-trial-runbook-v1`.
- Confirmed no additional key constants, read/write helpers, dynamic builders,
  migrations, defaults, Supabase behavior, trade mutations, or execution
  persistence moved.
- Recommended extracting a dedicated runbook persistence wrapper next only if
  it preserves the current typed/default and normalization contract exactly.

Next recommended action:

**Action 412 - Extract Live Market Trial Runbook Persistence Wrapper**
