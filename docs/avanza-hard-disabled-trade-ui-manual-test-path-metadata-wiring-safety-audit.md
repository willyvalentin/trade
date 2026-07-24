# Avanza Hard-Disabled Trade UI Manual Test Path Metadata Wiring Safety Audit

Status: `avanza_hard_disabled_trade_ui_manual_test_path_metadata_wiring_safety_audited`

## Scope

This audit covers the minimal hard-disabled Trade UI manual test path metadata
wiring in `app/trade-app.tsx`.

The wiring is metadata-only. It does not render manual test path UI, does not
call the disabled local-only API route, does not fetch, and does not introduce
active Avanza handoff behavior.

## Trade UI Wiring

Confirmed:

- `app/trade-app.tsx` contains minimal hard-disabled manual test path metadata
  wiring
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- `buildAvanzaDisabledLocalOnlyManualTestPath(...)` is invoked only inside the
  hard-disabled/default-off branch
- `manualTestPathEnabled` is false by default
- mode is hidden by default
- output is hidden/disabled metadata only
- output is discarded with `void hardDisabledManualTestPath`
- default Trade UI remains visually unchanged
- no manual test path UI renders by default

The hard-disabled/default-off branch remains unreachable in default Trade UI
because the guard remains false by default.

## Rendering Boundary

The wiring does not render:

- manual test path UI
- fetch intent UI
- action shell UI
- passive action shell component
- API call intent UI
- visible shell in normal/default UI
- shell UI by default
- prepare UI by default
- prepare button
- active handoff button
- buy/sell CTA

The passive component is not imported by `app/trade-app.tsx`.
The passive component is not rendered in Trade UI.
No `onClick` handler was added for manual test path.

Explicit render confirmations:

- no manual test path UI renders by default
- no fetch intent UI renders by default
- no action shell UI renders by default
- no API call intent UI renders by default
- no visible shell renders in normal/default UI
- no shell UI renders by default
- no prepare UI renders by default
- no prepare button exists
- no active handoff button exists
- no buy/sell CTA exists

## API Route Boundary

The disabled local-only API route remains separate:

- `app/trade-app.tsx` does not reference the API route path
- no API route call exists from Trade UI
- no fetch exists from Trade UI for this path
- no route path exposure exists
- `app/api/dev/avanza/fill-only/stub/route.ts` was not changed by this wiring task
- the API route still returns `api_stub_disabled` by default

## Safety Flags

Default hard-disabled manual test path metadata remains locked:

- `manualTestPathEnabled: false` by default
- `canCreateManualTestPath: false` by default
- `canExposeLocalRoute: false`
- `canFetch: false`
- `canCallApiRoute: false`
- `canFetchLocalhost: false`
- `canCallBridge: false`
- `canControlBrowser: false`
- `canFillForm: false`
- `canClickReview: false`
- `canClickConfirm: false`
- `canSubmitOrder: false`
- `canHandleCredentials: false`
- `canReadCookies: false`
- `canReadBankId: false`
- `canWriteSupabaseExecution: false`
- `controlsEnabled: false`
- `gateLocked: true`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`

## Forbidden Behavior Audit

This wiring adds no:

- localhost calls
- bridge calls
- polling/execution behavior
- Avanza/browser control
- real fill behavior
- order behavior
- review/confirm/submit behavior
- credential/session/BankID/cookies/storage handling
- Supabase execution write

It also adds no active handoff, active prepare button, buy/sell CTA, manual test
path `onClick`, active fetch behavior, API route path reference, route call,
fetch, route path exposure, or manual test path UI in normal/default Trade UI.

## Related Artifacts

- `docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-plan.md`
- `docs/avanza-disabled-local-only-manual-test-path-visibility-phase-completion-checkpoint.md`
- `docs/avanza-disabled-local-only-manual-test-path-plan.md`
- `lib/avanza-disabled-local-only-manual-test-path.ts`
- `app/trade-app.tsx`
- `app/api/dev/avanza/fill-only/stub/route.ts`
- `components/execution/AvanzaPassiveDisabledActionShell.tsx`

## Production Boundary

No production readiness is claimed.

Semi-auto human confirmation remains mandatory. `userMustConfirm` remains true
and `finalHumanClickRequired` remains true.

## Next Step

This audit supports the next phase completion checkpoint for the hard-disabled
Trade UI manual test path metadata wiring phase. Any future local-only disabled
fetch test must be planned separately, remain internal/dev-only, explicit,
disabled by default, local-only, non-broker-action, and human-confirmation
preserving.

Phase completion checkpoint:
`docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-phase-completion-checkpoint.md`.

Disabled local-only chain readiness closeout plan:
`docs/avanza-disabled-local-only-chain-readiness-closeout-plan.md`.

Disabled local-only chain readiness closeout checkpoint:
`docs/avanza-disabled-local-only-chain-readiness-closeout-checkpoint.md`.

Final global safety sweep:
`docs/avanza-disabled-local-only-chain-final-global-safety-sweep.md`.
