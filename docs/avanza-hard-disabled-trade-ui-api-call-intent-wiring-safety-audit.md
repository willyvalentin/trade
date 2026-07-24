# Avanza Hard-Disabled Trade UI API Call Intent Wiring Safety Audit

Status: `avanza_hard_disabled_trade_ui_api_call_intent_wiring_safety_audited`

## Scope

This audit covers the minimal hard-disabled Trade UI API call intent wiring in
`app/trade-app.tsx`.

The wiring imports and invokes `buildAvanzaGuardedApiRouteCallIntent(...)` from
`lib/avanza-guarded-api-route-call-intent.ts` only inside the existing
hard-disabled/default-off Trade UI branch.

## Branch Isolation

Audit result:

- `app/trade-app.tsx` contains minimal hard-disabled API call intent wiring
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- `buildAvanzaGuardedApiRouteCallIntent(...)` invocation exists only inside the
  hard-disabled/default-off branch
- `apiCallIntentEnabled` is false by default
- `mode` is disabled by default
- output is `api_call_intent_disabled` metadata only
- default Trade UI remains visually unchanged
- no API call intent UI renders by default
- no visible shell renders in normal/default UI
- no shell UI renders by default
- no prepare UI renders by default

## Disabled API Route Boundary

The disabled local-only API route remains separate:

- `app/api/dev/avanza/fill-only/stub/route.ts`
- the API route was not changed by this wiring task
- the API route still returns `api_stub_disabled` by default
- `app/trade-app.tsx` does not reference the API route path
- no API route call exists from Trade UI

## Safety Flags

The default hard-disabled API call intent output keeps:

- `apiCallIntentEnabled: false`
- `canCreateApiCallIntent: false`
- `canCallApiRoute: false`
- `canFetch: false`
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

- prepare button
- active handoff button
- buy/sell CTA
- API route call from Trade UI
- fetch from Trade UI
- localhost calls
- bridge calls
- polling/execution behavior
- Avanza/browser control
- real fill behavior
- order behavior
- review/confirm/submit behavior
- credential/session/BankID/cookies/storage handling
- Supabase execution write

Semi-auto human confirmation remains mandatory:

- `userMustConfirm: true`
- `finalHumanClickRequired: true`

## Production Boundary

No production readiness is claimed.

The hard-disabled Trade UI API call intent wiring is isolated, unreachable by
default, disabled by default, metadata-only, and incapable of API-route calls,
fetch, localhost calls, bridge calls, browser control, fill, order, review,
confirm, submit, credential/session handling, or Supabase writes.

## Related Documents

- `docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-plan.md`
- `docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-phase-completion-checkpoint.md`
- `docs/avanza-explicit-internal-disabled-action-shell-plan.md`
- `docs/avanza-guarded-api-route-call-intent-visibility-phase-completion-checkpoint.md`
- `docs/avanza-guarded-api-route-call-intent-plan.md`
- `docs/avanza-hard-disabled-visible-prepare-shell-wiring-phase-completion-checkpoint.md`
- `docs/avanza-hard-disabled-visible-prepare-shell-wiring-safety-audit.md`
- `docs/semi-auto-avanza-fill-only-poc-ui-integration-plan.md`
- `docs/avanza-read-only-real-selected-recommendation-dev-preview-plan.md`

## Phase Completion And Next Plan

The hard-disabled Trade UI API call intent wiring phase is closed in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-phase-completion-checkpoint.md`.

The next planning-only phase is
`docs/avanza-explicit-internal-disabled-action-shell-plan.md`. That phase must
remain disabled by default and must not add active controls, API route calls,
fetch, localhost, bridge, Avanza/browser control, real fill, order/review/
confirm/submit behavior, credential/session handling, or Supabase writes.

The pure helper for that phase now exists at
`lib/avanza-explicit-internal-disabled-action-shell.ts`. It is explicit-input
only and defaults hidden with `actionShellEnabled: false`.

The fixture/model-only visibility layer now exists at
`lib/avanza-explicit-internal-disabled-action-shell-fixtures.ts`,
`components/execution/AvanzaExplicitInternalDisabledActionShellHarness.tsx`, and
the dev-only visual QA route section. It renders static fixture states only,
remains unlinked from main navigation, is not wired into Trade UI, does not
change the disabled API route, does not import or call the disabled API route,
and adds no API route call, fetch, localhost, bridge, Avanza/browser, real fill,
order/review/confirm/submit behavior, credential/session handling, or Supabase
writes.

That visibility layer is closed in
`docs/avanza-explicit-internal-disabled-action-shell-visibility-phase-completion-checkpoint.md`.
The next planning document is
`docs/avanza-passive-disabled-action-shell-component-plan.md`. The planned
component must remain passive, disabled, non-clickable, prop-driven, and
incapable of API route calls, fetch, localhost, bridge, Avanza/browser control,
real fill, order/review/confirm/submit behavior, credential/session handling,
or Supabase writes.

The passive disabled action shell component now exists at
`components/execution/AvanzaPassiveDisabledActionShell.tsx`. The implementation
is still display-only and unwired: it has no button, no `onClick`, no
`useEffect`, no API route path, no fetch, no localhost/bridge call, no
Avanza/browser control, no real fill, no order/review/confirm/submit behavior,
no credential/session handling, and no Supabase write. It is not imported by
`app/trade-app.tsx` or the disabled API route. It is rendered only through the
isolated action shell harness/dev QA fixture route.

The focused passive component safety audit is recorded in
`docs/avanza-passive-disabled-action-shell-component-safety-audit.md`. It
confirms no `onClick`, no `useEffect`, no fetch, no API route path, no
localhost endpoint, no bridge call, no active button, no Supabase call, and no
production readiness claim.
