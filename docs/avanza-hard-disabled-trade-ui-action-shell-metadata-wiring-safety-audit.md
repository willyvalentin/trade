# Avanza Hard-Disabled Trade UI Action Shell Metadata Wiring Safety Audit

Status: `avanza_hard_disabled_trade_ui_action_shell_metadata_wiring_safety_audited`

## Current Scope

This audit covers the minimal hard-disabled action shell metadata wiring in
`app/trade-app.tsx`.

The wiring imports and invokes
`buildAvanzaExplicitInternalDisabledActionShell(...)` from
`lib/avanza-explicit-internal-disabled-action-shell.ts` inside the existing
hard-disabled/default-off read-only selectedRecommendation preview branch only.

This is metadata-only wiring. It does not render action shell UI and does not
wire the passive action shell component into Trade UI.

## Default-Off Guard

The default guard remains locked:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- `apiCallIntentEnabled` remains `false`
- `actionShellEnabled` remains `false`
- action shell mode remains `"hidden"`
- default output remains `action_shell_hidden`
- the output is hidden/disabled metadata only
- default Trade UI remains visually unchanged
- no action shell UI renders by default
- no API call intent UI renders by default
- no visible shell renders in normal/default UI
- no shell UI renders by default
- no prepare UI renders by default

## Passive Component Boundary

`components/execution/AvanzaPassiveDisabledActionShell.tsx` remains isolated.

The passive component:

- is not imported by `app/trade-app.tsx`
- is not rendered in Trade UI
- remains rendered only in the isolated harness/dev QA fixture route
- remains display-only/read-only
- does not add button interactivity
- does not call an API route
- does not fetch

## API Route Boundary

The disabled local-only API route remains separate:

- `app/api/dev/avanza/fill-only/stub/route.ts` was not changed by this wiring
  task
- the API route still returns `api_stub_disabled` by default
- `app/trade-app.tsx` does not reference the API route path
- no Trade UI API route call exists
- no fetch exists from Trade UI
- no localhost call exists
- no bridge call exists

## Interaction Boundary

The metadata wiring adds no active UI:

- no prepare button exists
- no active handoff button exists
- no buy/sell CTA exists
- no `onClick` handler was added for action shell behavior
- no polling/execution behavior exists
- no Avanza/browser control exists
- no real fill behavior exists
- no order behavior exists
- no review/confirm/submit behavior exists

## Sensitive-State Boundary

The metadata wiring adds no sensitive-state handling:

- no credential handling
- no session handling
- no BankID handling
- no cookies handling
- no storage handling
- no Supabase execution write

## Required Safety Flags

The hard-disabled action shell metadata remains locked:

- `actionShellEnabled: false` by default
- `canRenderActionShell: false` by default
- `canClickAction: false`
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

## Isolation Result

The action shell metadata invocation is isolated, unreachable by default,
hidden/disabled by default, and incapable of rendering action shell UI, active
handoff, button interactivity, API-route calls, fetch, bridge, browser, fill,
order, review, confirm, submit, credential/session, or Supabase behavior.

No production readiness is claimed. Semi-auto human confirmation remains
mandatory, and final human confirmation remains mandatory.

## Phase Completion

The hard-disabled Trade UI action shell metadata wiring phase is closed in:

- `docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-phase-completion-checkpoint.md`

The next planning-only phase is:

- `docs/avanza-guarded-fetch-intent-plan.md`

That future phase must remain planning-only until separately implemented and
must not add fetch, API route calls, route path usage in Trade UI, active UI,
localhost/bridge calls, Avanza/browser control, real fill, order behavior,
credential/session handling, or Supabase writes.

## Guarded Fetch Intent Helper Boundary

`lib/avanza-guarded-fetch-intent.ts` now exists as a pure helper for the next
phase. It accepts only explicit model inputs and returns disabled/internal
metadata. It is not imported by `app/trade-app.tsx`, not imported by the
disabled API route, not rendered by the dev QA route, and contains no fetch,
route call, localhost call, bridge call, browser control, fill, order,
credential/session handling, or Supabase write behavior.

The guarded fetch intent fixtures and harness are now visible only through the
isolated dev QA route:
`lib/avanza-guarded-fetch-intent-fixtures.ts`,
`components/execution/AvanzaGuardedFetchIntentHarness.tsx`, and the route
section in `app/dev/avanza-visual-qa/page.tsx`. This route section is
fixture/model-only, unlinked from main navigation, and does not import into
Trade UI, call the API route, perform fetch, call localhost or bridge, poll,
control Avanza/browser state, fill, click review, click confirm, submit orders,
handle credentials/sessions, or write Supabase execution records.

The guarded fetch intent visibility layer is closed in
`docs/avanza-guarded-fetch-intent-visibility-phase-completion-checkpoint.md`.
The next planning-only phase is
`docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-plan.md`.
That future metadata wiring must stay behind the existing disabled/default-off
Trade UI branch and must not render fetch intent in normal/default UI, add
active controls, call routes, fetch, reference the route path, call localhost or
bridge, control Avanza/browser state, fill, submit orders, handle sensitive
state, or write Supabase execution records.

## Follow-Up Fetch Intent Metadata Wiring

The minimal hard-disabled Trade UI fetch intent metadata invocation has now been
added in `app/trade-app.tsx` inside the existing disabled/default-off branch
only. It passes `fetchIntentEnabled: false` and `mode: "hidden"` to
`buildAvanzaGuardedFetchIntent(...)`, produces `fetch_intent_hidden` metadata,
and does not render fetch intent UI in normal/default Trade UI.

This follow-up keeps the same safety boundary: no active controls, no API route
call, no fetch, no route path reference, no localhost/bridge call, no polling,
no Avanza/browser behavior, no real fill, no order/review/confirm/submit
behavior, no credential/session handling, and no Supabase execution write.

The focused follow-up safety audit is recorded in
`docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-safety-audit.md`.
