# Avanza Hard-Disabled Trade UI API Call Intent Wiring Plan

Status: `avanza_hard_disabled_trade_ui_api_call_intent_wiring_planned`

## Purpose

Plan future minimal hard-disabled Trade UI wiring for guarded API route call
intent metadata.

The future wiring must remain behind the existing disabled/default-off branch.
The API call intent guard must remain false by default. Normal/default Trade UI
must remain visually unchanged.

Final human confirmation remains mandatory.

## Future Allowed Shape

`app/trade-app.tsx` may later import and use:

- `lib/avanza-guarded-api-route-call-intent.ts`

Allowed constraints:

- usage must be inside the existing disabled/default-off guard only
- base guard must remain false by default
- `apiCallIntentEnabled` must remain false by default
- mode must remain disabled by default
- no route call by default
- no fetch by default
- no active button by default
- no active controls by default
- no visible active UI by default
- output may be inspected only inside the disabled/internal branch

## Future Allowed Metadata

The hard-disabled branch may model:

- API call intent status
- label/reason
- warnings
- blockedReasons
- sourceRecommendationId
- packageId
- side
- ticker/symbol
- quantity
- orderType
- limitPrice if applicable
- accountLabel if safe/present
- routeStatus if explicit
- userMustConfirm
- finalHumanClickRequired
- safety flags

## Required Output Guarantees

The future branch must keep:

- `api_call_intent_disabled` by default
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
- `controlsEnabled: false`
- `gateLocked: true`

## Absolute Forbidden Behavior

The hard-disabled Trade UI API call intent wiring phase must not:

- call the API route
- add fetch
- add an active prepare button
- add active handoff
- add buy/sell CTA
- call localhost
- call bridge
- call Avanza/browser
- add real fill
- submit order
- click Granska kop
- click Granska salj
- open review modal
- click Bekrafta kop
- click Bekrafta salj
- handle credentials
- handle BankID
- read cookies/session/localStorage
- store Avanza session state
- bypass manual confirmation
- write Supabase execution records from the API call intent wiring phase

No production readiness is claimed.

## Later Implementation Sequence

Recommended sequence:

1. Minimal hard-disabled Trade UI API call intent model invocation.
2. Safety audit.
3. Phase completion checkpoint.
4. Explicit internal/dev-only disabled action shell plan.
5. Guarded fetch planning.
6. Only after that, local-only manual test path.

Each later step must keep API route calls, localhost calls, bridge calls,
fetch/polling, Avanza/browser control, fill, review, confirmation, submit,
order, credential/session handling, and Supabase writes forbidden unless a
later checkpoint explicitly scopes and audits that next boundary.

## Current Inputs

The guarded API route call intent visibility layer is complete:

- `docs/avanza-guarded-api-route-call-intent-visibility-phase-completion-checkpoint.md`
- `lib/avanza-guarded-api-route-call-intent.ts`
- `lib/avanza-guarded-api-route-call-intent-fixtures.ts`
- `components/execution/AvanzaGuardedApiRouteCallIntentHarness.tsx`
- fixture/model-only section in `app/dev/avanza-visual-qa/page.tsx`

The disabled local-only API route remains disabled and unwired:

- `app/api/dev/avanza/fill-only/stub/route.ts`
- default status: `api_stub_disabled`

## Implementation Status

The minimal hard-disabled Trade UI API call intent wiring is now implemented as
metadata only in `app/trade-app.tsx`.

The wiring:

- imports `buildAvanzaGuardedApiRouteCallIntent(...)`
- invokes it only inside the existing hard-disabled/default-off Trade UI branch
- passes `apiCallIntentEnabled: false`
- passes `mode: "disabled"`
- uses only already-built disabled/hidden prepare intent and visible shell
  metadata from that same branch
- produces `api_call_intent_disabled` by default

The wiring does not render an API call intent UI, does not reference the
disabled API route path, does not call the API route, does not fetch, does not
call localhost, does not call bridge, does not add polling, does not add
Avanza/browser control, does not add real fill behavior, does not add review,
confirmation, submit, or order behavior, and does not handle credentials,
session, BankID, cookies, storage, or Supabase execution writes.

The default Trade UI remains visually unchanged. The next step should be a
safety audit and checkpoint for this minimal hard-disabled wiring before any
explicit internal/dev-only action shell or guarded fetch planning.

## Safety Audit

The focused safety audit for the implemented hard-disabled Trade UI API call
intent wiring is recorded in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-safety-audit.md`.

The audit confirms the invocation remains branch-only, defaults to
`api_call_intent_disabled`, keeps `apiCallIntentEnabled: false` and
`mode: "disabled"`, renders no API call intent UI, references no disabled API
route path from Trade UI, and adds no API route call, fetch, localhost, bridge,
polling, Avanza/browser, real fill, order, review, confirmation, submit,
credential/session, or Supabase behavior.

## Phase Completion

The hard-disabled Trade UI API call intent wiring phase is closed in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-phase-completion-checkpoint.md`.

The next planning-only phase is recorded in
`docs/avanza-explicit-internal-disabled-action-shell-plan.md`. It may define a
future internal/dev-only disabled action shell around the prepare/API-call
intent, but it must remain disabled by default and must not call the API route,
fetch, call localhost, call bridge, control Avanza/browser, fill, review,
confirm, submit, place orders, handle credentials/session state, or write
Supabase execution records.
