# Avanza Guarded API Route Call Intent Plan

Status: `avanza_guarded_api_route_call_intent_planned_no_wiring`

Implementation status:
`avanza_guarded_api_route_call_intent_model_added`

Fixture/harness visibility status:
`avanza_guarded_api_route_call_intent_fixtures_harness_route_section_added`

Visibility completion status:
`avanza_guarded_api_route_call_intent_visibility_phase_complete`

Hard-disabled Trade UI wiring plan status:
`avanza_hard_disabled_trade_ui_api_call_intent_wiring_planned`

## Purpose

Plan a future internal/dev-only API route call intent for Avanza fill-only
preparation.

The intent may describe when Trade UI could call the disabled local-only API
route in a later phase. This phase does not call the route, does not add fetch,
does not call localhost directly, does not call a bridge directly, does not
control a browser, does not fill a form, and does not submit an order.

The intent must be disabled by default. Final human confirmation remains
mandatory.

## Phase Boundary

This is planning only.

No app code is changed by this plan. No Trade UI route call is added. No route
path is introduced into the normal/default Trade UI path. No active button or
visible default UI is added.

The first pure model/helper now exists:

- `lib/avanza-guarded-api-route-call-intent.ts`

It is explicit-input only and remains unwired from Trade UI, the dev QA route,
and the disabled local-only API route. It adds no fetch, route call, localhost
call, bridge call, Avanza/browser control, real fill, order behavior,
credential/session handling, or Supabase execution write.

The fixture/model-only visibility layer now exists:

- `lib/avanza-guarded-api-route-call-intent-fixtures.ts`
- `components/execution/AvanzaGuardedApiRouteCallIntentHarness.tsx`
- dev QA route section in `app/dev/avanza-visual-qa/page.tsx`

The dev QA route section renders static fixtures only. It remains unlinked from
main navigation, does not read Trade UI state, does not call the API route, and
adds no fetch, localhost, bridge, polling, Avanza/browser control, real fill,
order behavior, credential/session handling, or Supabase execution write.

## Future Allowed Shape

A later implementation may add a pure model/helper first.

That first model/helper has been added as
`lib/avanza-guarded-api-route-call-intent.ts`.

The helper may consume explicit inputs only:

- visible shell model
- prepare intent model
- disabled API route state if explicitly provided
- safe handoff/adapter metadata if explicitly provided

The helper may output:

- `api_call_intent_disabled`
- `route_unavailable`
- `route_disabled`
- `visible_shell_unavailable`
- `api_call_ready_internal_disabled`
- `api_call_blocked`
- `api_call_failed`
- `unknown`

The helper must not perform an actual network call. It must not fetch, poll,
call the API route, call localhost, call a bridge, control a browser, fill a
form, submit an order, or render an active button.

The current helper follows this boundary and only returns model data.

## Future Fields

A future intent model may include:

- `apiCallIntentId`
- `createdAt`
- `sourceRecommendationId`
- `packageId`
- side
- ticker/symbol
- quantity
- orderType
- limitPrice if applicable
- accountLabel if safe/present
- routeStatus if explicit
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- warnings
- blockedReasons
- safety flags

## Required Safety Flags

The future model must keep:

- `apiCallIntentEnabled: false` by default
- `canCreateApiCallIntent: false` by default
- `canCallApiRoute: false` by default
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
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `controlsEnabled: false`
- `gateLocked: true`

## Absolute Forbidden Behavior

This phase and the future pure intent model must not:

- call the API route in the planning phase
- add fetch
- add an active prepare button
- add active handoff
- add buy/sell CTA
- call localhost
- call bridge
- call Avanza/browser
- add real fill
- submit order
- click broker review buy controls
- click broker review sell controls
- open review modal
- click broker confirm buy controls
- click broker confirm sell controls
- handle credentials
- handle BankID
- read cookies/session/localStorage
- store Avanza session state
- bypass manual confirmation
- write Supabase execution records from the API call intent phase

No production readiness is claimed.

## Later Implementation Sequence

Recommended sequence:

1. Pure guarded API route call intent model/helper. Completed as
   `lib/avanza-guarded-api-route-call-intent.ts`.
2. Fixtures, harness, and dev QA route section. Completed as
   `lib/avanza-guarded-api-route-call-intent-fixtures.ts`,
   `components/execution/AvanzaGuardedApiRouteCallIntentHarness.tsx`, and a
   fixture/model-only section in `app/dev/avanza-visual-qa/page.tsx`.
3. Hard-disabled Trade UI metadata wiring.
4. Safety audit.
5. Explicit internal/dev-only disabled action shell.
6. Guarded fetch planning.

Each later phase must keep route calls, localhost calls, bridge calls,
fetch/polling, Avanza/browser control, fill, review, confirmation, submit,
order, credential/session handling, and Supabase writes forbidden unless a
separate checkpoint explicitly scopes and audits that next boundary.

## Current Inputs

The current prior phase is complete:

- `docs/avanza-hard-disabled-visible-prepare-shell-wiring-phase-completion-checkpoint.md`
- `docs/avanza-hard-disabled-visible-prepare-shell-wiring-safety-audit.md`

The disabled local-only API route remains disabled and unwired:

- `app/api/dev/avanza/fill-only/stub/route.ts`
- default status: `api_stub_disabled`

## Model Added

`lib/avanza-guarded-api-route-call-intent.ts` exports:

- `AvanzaGuardedApiRouteCallIntentStatus`
- `AvanzaGuardedApiRouteCallIntentMode`
- `AvanzaGuardedApiRouteCallIntent`
- `AvanzaGuardedApiRouteCallIntentSafetyFlags`
- `buildAvanzaGuardedApiRouteCallIntent(...)`

The default output is `api_call_intent_disabled` with
`apiCallIntentEnabled: false`, `canCreateApiCallIntent: false`,
`canCallApiRoute: false`, `canFetch: false`, `canFetchLocalhost: false`,
`canCallBridge: false`, `canControlBrowser: false`, `canFillForm: false`,
`canClickReview: false`, `canClickConfirm: false`, `canSubmitOrder: false`,
`controlsEnabled: false`, and `gateLocked: true`.

Safe explicit `internal_preview` or `internal_call_intent` inputs may produce
`api_call_ready_internal_disabled` as metadata only. Even then, the model cannot
call the API route, fetch, call localhost, call a bridge, control a browser,
fill, review, confirm, submit, place an order, handle credentials/session
state, or write Supabase execution records.

## Fixture/Harness Route Visibility

`lib/avanza-guarded-api-route-call-intent-fixtures.ts` and
`components/execution/AvanzaGuardedApiRouteCallIntentHarness.tsx` expose static
fixture/model-only scenarios for:

- `api_call_intent_disabled`
- `route_unavailable`
- `route_disabled`
- `visible_shell_unavailable`
- `api_call_ready_internal_disabled`
- `api_call_blocked`
- `api_call_failed`
- `unknown`
- safe BUY and SELL internal preview intent metadata
- safe BUY and SELL internal call intent disabled metadata
- missing visible shell
- disabled route state
- blocked visible shell
- failed input
- unsafe input

The harness is rendered on the dev-only Avanza visual QA route as fixture-only
content. It is not wired into Trade UI, does not call the disabled API route,
does not expose an active handoff or prepare button, does not add buy/sell CTAs,
and does not add fetch, localhost, bridge, polling, Avanza/browser, real fill,
review, confirmation, submit, order, credential/session, or Supabase behavior.

## Visibility Completion And Next Plan

The fixture/model-only visibility phase is closed in
`docs/avanza-guarded-api-route-call-intent-visibility-phase-completion-checkpoint.md`.

The follow-up hard-disabled Trade UI API call intent wiring phase is tracked in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-plan.md`.

That plan now records the hidden/default-off metadata invocation inside the
existing disabled Trade UI branch. It keeps `apiCallIntentEnabled: false`, mode
disabled, no route call, no fetch, no active button, no active controls, no
Avanza/browser/fill/order behavior, and no credential/session or Supabase
behavior.

## Hard-Disabled Trade UI Metadata Wiring

The hard-disabled Trade UI API call intent metadata wiring has now been added.

`app/trade-app.tsx` invokes `buildAvanzaGuardedApiRouteCallIntent(...)` only
inside the existing hard-disabled/default-off branch. The invocation passes
`apiCallIntentEnabled: false`, `mode: "disabled"`, and already-built
disabled/hidden prepare intent and visible shell metadata. The default result is
`api_call_intent_disabled`.

This does not wire the disabled API route into Trade UI. It adds no route path
reference, no API route call, no fetch, no localhost call, no bridge call, no
polling, no Avanza/browser behavior, no real fill, no review/confirm/submit
behavior, no order behavior, no credential/session handling, and no Supabase
execution write.

The focused safety audit for this hard-disabled Trade UI metadata wiring is
recorded in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-safety-audit.md`.
It confirms the invocation remains disabled by default, branch-only,
metadata-only, and incapable of API-route, fetch, bridge, browser, fill, order,
review, confirm, submit, credential/session, or Supabase behavior.

The hard-disabled Trade UI API call intent wiring phase is closed in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-phase-completion-checkpoint.md`.

The next planning-only phase is
`docs/avanza-explicit-internal-disabled-action-shell-plan.md`. It may plan a
future internal/dev-only disabled shell around the prepare/API-call intent, but
must keep the shell disabled by default, non-clickable, and separate from API
route calls, fetch, localhost, bridge, Avanza/browser control, fill, order,
review, confirmation, submit, credential/session handling, and Supabase writes.
