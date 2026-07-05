# Avanza Hard-Disabled Trade UI Fetch Intent Metadata Wiring Safety Audit

Status: `avanza_hard_disabled_trade_ui_fetch_intent_metadata_wiring_safety_audited`

## Scope

This audit covers the minimal hard-disabled Trade UI fetch intent metadata
wiring in `app/trade-app.tsx`.

The wiring is metadata-only. It does not create a visible fetch intent surface,
does not call the disabled local-only API route, and does not introduce active
Avanza handoff behavior.

## Trade UI Wiring

`app/trade-app.tsx` contains minimal hard-disabled fetch intent metadata wiring.
app/trade-app.tsx contains minimal hard-disabled fetch intent metadata wiring.

Confirmed:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- `buildAvanzaGuardedFetchIntent(...)` is imported by `app/trade-app.tsx`
- `buildAvanzaGuardedFetchIntent(...)` invocation exists only inside the
  hard-disabled/default-off branch
- `fetchIntentEnabled` is false by default
- mode is hidden by default
- output is hidden/disabled metadata only
- output is discarded with `void hardDisabledFetchIntent`
- default Trade UI remains visually unchanged
- no fetch intent UI renders by default

The hard-disabled/default-off branch remains unreachable in default Trade UI
because the guard remains false by default.

## Rendering Boundary

The wiring does not render:

- fetch intent UI
- action shell UI
- passive action shell component
- API call intent UI
- visible shell UI in normal/default UI
- shell UI by default
- prepare UI by default
- prepare button
- active handoff button
- buy/sell CTA

The passive component is not imported by `app/trade-app.tsx`.
The passive component is not rendered in Trade UI.
No `onClick` handler was added for fetch intent.

Explicit render confirmations:

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
- `app/api/dev/avanza/fill-only/stub/route.ts` was not changed by this wiring task
- the API route still returns `api_stub_disabled` by default

## Safety Flags

Default hard-disabled fetch intent metadata remains locked:

- `fetchIntentEnabled: false` by default
- `canCreateFetchIntent: false` by default
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

It also adds no active handoff, active prepare button, buy/sell CTA, active
fetch behavior, API route path reference, route call, fetch, or fetch intent UI
in normal/default Trade UI.

## Related Artifacts

- `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-plan.md`
- `docs/avanza-guarded-fetch-intent-visibility-phase-completion-checkpoint.md`
- `lib/avanza-guarded-fetch-intent.ts`
- `app/trade-app.tsx`
- `app/api/dev/avanza/fill-only/stub/route.ts`
- `components/execution/AvanzaPassiveDisabledActionShell.tsx`

## Production Boundary

No production readiness is claimed.

Semi-auto human confirmation remains mandatory. Final human confirmation
remains mandatory.

## Phase Completion

This safety audit supports the phase completion checkpoint:

- `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-phase-completion-checkpoint.md`

The next planning-only phase is documented in:

- `docs/avanza-disabled-local-only-manual-test-path-plan.md`

That next phase remains disabled, local-only, planning-only, non-fetching,
non-executing, and separate from normal/default Trade UI.

The pure disabled local-only manual test path helper now exists at
`lib/avanza-disabled-local-only-manual-test-path.ts`. It is model-only and
unwired: no Trade UI wiring, dev route section, API route call, fetch, route
path exposure, localhost/bridge call, Avanza/browser control, real fill, order
behavior, credential/session handling, or Supabase execution write was added.

The disabled local-only manual test path fixture visibility layer now adds
static fixtures, an isolated harness, and a dev QA route section. The section is
fixture/model-only, unlinked from main navigation, and still adds no Trade UI
wiring, API route call, fetch, route path exposure, localhost/bridge call,
polling, Avanza/browser control, fill, order behavior, credential/session
handling, or Supabase execution write.

The visibility layer is closed by
`docs/avanza-disabled-local-only-manual-test-path-visibility-phase-completion-checkpoint.md`.
The follow-on hard-disabled Trade UI manual test path metadata wiring is planned
in `docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-plan.md`
and must remain hidden/default-off, metadata-only, non-rendering in
normal/default UI, non-fetching, and non-executing.

The first minimal manual test path metadata invocation now exists in
`app/trade-app.tsx` as hidden/default-off metadata only. It keeps
`manualTestPathEnabled: false`, uses `mode: "hidden"`, discards output with
`void hardDisabledManualTestPath`, references no route path, calls no API route,
performs no fetch, renders no manual test path UI, and adds no real fill,
review, confirmation, submit, order, credential/session handling, or Supabase
write.

The focused safety audit for the manual test path metadata wiring is recorded in
`docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-safety-audit.md`.

The hard-disabled Trade UI manual test path metadata wiring phase completion is
recorded in
`docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-phase-completion-checkpoint.md`.

The disabled local-only chain readiness closeout is planned in
`docs/avanza-disabled-local-only-chain-readiness-closeout-plan.md`.
