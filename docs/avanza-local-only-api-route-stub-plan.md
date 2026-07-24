# Avanza Local-Only API Route Stub Plan

Date: 2026-07-05

Plan status:
`avanza_local_only_api_route_stub_planned_no_implementation`

Pure model status:
`avanza_local_only_api_route_stub_model_added`

Fixture visibility status:
`avanza_local_only_api_route_stub_fixture_visibility_added`

Phase completion status:
`avanza_local_only_api_route_stub_visibility_phase_complete`

## Purpose

Plan a future local-only API route stub for internal development. The route may
eventually return mocked dry-run or fill-only status from safe request payloads,
but it must remain disabled by default and must not be used by Trade UI by
default.

The future local-only API route stub must not be used by Trade UI by default.

The original planning/model phase did not implement the route. The subsequent
disabled API route phase adds only `app/api/dev/avanza/fill-only/stub/route.ts`,
which remains disabled by default and returns `api_stub_disabled`. It adds no
browser control, no Avanza interaction, no credential/session/BankID/cookies or
storage handling, and no order submission. Final human confirmation remains
mandatory.

## Future Route Boundary

A future local-only route may eventually accept safe bridge request JSON and
return mocked status/progress only.

The future route must:

- remain off unless explicitly enabled in a local/dev environment
- return disabled unless the local-only flag is explicitly true
- reject or ignore credentials, cookies, BankID, session data, account ids, and
  broker secrets
- never click review, confirm, or submit
- never bypass manual confirmation
- never provide a production deployment guarantee
- never be called by normal Trade UI by default

Route strings must not be introduced into `app/trade-app.tsx`.

## Future Route Candidates

These original candidate endpoints remain planning-only and are not implemented:

- `POST /api/dev/avanza/fill-only/dry-run`
- `POST /api/dev/avanza/fill-only/prepare`

The dry-run and prepare endpoints are not implemented.

Any future endpoint must be behind an explicit local-only disabled guard. There
is no production route, no real browser control, and no real Avanza fill in
this phase.

## Future Request Shape

A future safe request may include:

- `bridgeRequestId`
- `broker: avanza`
- `action: fill_order_form_only`
- `mode: dry_run | fill_only`
- `packageId`
- `adapterRequestId`
- `side`
- `ticker` or `symbol`
- `quantity`
- `orderType`
- `limitPrice` when applicable
- `accountLabel` when safe and present
- `userMustConfirm: true`
- `finalHumanClickRequired: true`

The route must reject or ignore account ids, credentials, cookies, BankID,
session data, storage data, and broker secrets.

## Future Response Statuses

The future route stub may model:

- `api_stub_disabled`
- `request_unavailable`
- `request_invalid`
- `local_only_not_enabled`
- `dry_run_ready_mock`
- `fill_only_ready_mock`
- `fill_started_mock`
- `fill_completed_waiting_manual_review_mock`
- `fill_blocked`
- `fill_failed`
- `cancelled`
- `unknown`

These statuses are mocked route-stub states only. They must not imply an order
exists or that review, confirmation, or submit behavior is available.

## Hard Safety Flags

The future route stub must expose hard safety flags:

- `apiRouteEnabled: false` by default
- `localOnly: true`
- `canExposeEndpoint: false` by default
- `canCallBridge: false` by default
- `canFetchLocalhost: false` by default
- `canControlBrowser: false` by default
- `canFillForm: false` by default
- `canClickReview: false` always
- `canClickConfirm: false` always
- `canSubmitOrder: false` always
- `canHandleCredentials: false` always
- `canReadCookies: false` always
- `canReadBankId: false` always
- `canWriteSupabaseExecution: false` in this phase
- `userMustConfirm: true` always
- `finalHumanClickRequired: true` always
- `controlsEnabled: false` by default
- `gateLocked: true` by default

## Absolute Forbidden Behavior

The local-only API route stub phase must never:

- never click Granska kop
- never click Granska salj
- never open review modal
- never click Bekrafta kop
- never click Bekrafta salj
- never submit order
- never handle credentials
- never handle BankID
- never read cookies/session/localStorage
- never store Avanza session state
- never bypass manual confirmation
- never write Supabase execution records from the API route stub phase
- never add route calls to normal Trade UI

## Later Implementation Sequence

Recommended sequence:

1. Pure local-only API route stub model/helper. Completed as
   `lib/avanza-local-only-api-route-stub.ts`.
2. Static fixtures. Completed as
   `lib/avanza-local-only-api-route-stub-fixtures.ts`.
3. Isolated harness. Completed as
   `components/execution/AvanzaLocalOnlyApiRouteStubHarness.tsx`.
4. Dev QA route section. Completed as a fixture/model-only section in
   `app/dev/avanza-visual-qa/page.tsx`.
5. Safety checkpoint. Completed as
   `docs/avanza-local-only-api-route-stub-phase-completion-checkpoint.md`.
6. Optional disabled Next.js API route returning disabled/mock only. Planned in
   `docs/avanza-disabled-api-route-implementation-plan.md` and implemented as
   `app/api/dev/avanza/fill-only/stub/route.ts`, disabled by default.
7. Only after that, isolated local fill-only POC.

Each step needs its own safety tests and checkpoint before any broader
exposure.

## Non-Goals

This plan does not implement:

- an API route
- a localhost endpoint
- Trade UI calls
- active handoff
- prepare button
- buy/sell CTA
- localhost calls
- bridge calls
- fetch or polling
- browser or Avanza control
- real form fill
- review/confirm/submit behavior
- order submission
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness

## Pure Model Implementation

`lib/avanza-local-only-api-route-stub.ts` now implements the pure local-only
API route stub model/helper. It accepts explicit input only:
`apiRouteEnabled`, `localOnlyEnabled`, `mode`, `bridgeRequest`, `scenario`,
`now`, and `apiRequestId`.

The helper models `api_stub_disabled`, `request_unavailable`,
`request_invalid`, `local_only_not_enabled`, `dry_run_ready_mock`,
`fill_only_ready_mock`, `fill_started_mock`,
`fill_completed_waiting_manual_review_mock`, `fill_blocked`, `fill_failed`,
`cancelled`, and `unknown`.

The implementation remains model-only. It adds no Next.js route, no API route,
no localhost endpoint, no app route handler, no Trade UI wiring, no fetch, no
polling, no bridge call, no Avanza/browser control, no real fill behavior, no
review/confirm/final/submit click behavior, no order behavior, no
credential/session/BankID/cookies or storage handling, and no Supabase
execution write. Semi-auto human confirmation remains mandatory.

## Fixture Visibility Implementation

Static fixtures and an isolated harness now expose the local-only API route
stub model for dev QA:

- `lib/avanza-local-only-api-route-stub-fixtures.ts`
- `components/execution/AvanzaLocalOnlyApiRouteStubHarness.tsx`
- `app/dev/avanza-visual-qa/page.tsx` fixture/model-only section

The fixtures cover `api_stub_disabled`, `request_unavailable`,
`request_invalid`, `local_only_not_enabled`, `dry_run_ready_mock`,
`fill_only_ready_mock`, `fill_started_mock`,
`fill_completed_waiting_manual_review_mock`, `fill_blocked`, `fill_failed`,
`cancelled`, and `unknown`. They include safe BUY/SELL `dry_run`, safe
BUY/SELL `fill_only`, blocked unsafe bridge request, invalid side, invalid
quantity, missing ticker, and missing/unsafe price states.

The harness and route section are display-only. They show explicit input,
request fields, statuses, scenarios, and hard safety flags. They add no API
route, no localhost endpoint, no Trade UI wiring, no active handoff, no prepare
button, no buy/sell CTA, no bridge calls, no localhost fetch, no polling, no
Avanza/browser control, no execution, no real fill, no order submission, no
review/confirm/final/submit click behavior, no credential/session/BankID/cookies
or storage handling, and no Supabase execution write.

## Phase Completion And Next Plan

The fixture visibility layer is closed in
`docs/avanza-local-only-api-route-stub-phase-completion-checkpoint.md`. It
confirms the pure model, fixtures, isolated harness, and dev QA route section
exist while no API route, localhost endpoint, Trade UI wiring, active handoff,
prepare button, buy/sell CTA, browser/Avanza control, real fill, order
behavior, credential/session handling, or Supabase write exists.

The next phase is recorded in
`docs/avanza-disabled-api-route-implementation-plan.md`. The disabled route
candidate remains disabled by default, local/dev/internal only, and must return
mock response data only from safe request payloads.

## Disabled API Route Implementation

The disabled route now exists at
`app/api/dev/avanza/fill-only/stub/route.ts`. It accepts `POST` and returns
`api_stub_disabled` by default by calling
`buildAvanzaLocalOnlyApiRouteStubModel` with `apiRouteEnabled: false`,
`localOnlyEnabled: false`, and `mode: "disabled"`.

The route is not referenced by `app/trade-app.tsx` or normal Trade UI. It adds
no localhost endpoint beyond the disabled Next.js route handler itself, no
Trade UI wiring, no active handoff, no prepare button, no buy/sell CTA, no
bridge call, no localhost fetch, no polling, no Avanza/browser control, no real
fill, no order behavior, no review/confirm/final/submit behavior, no
credential/session/BankID/cookies/storage handling, and no Supabase execution
write.

The disabled route safety audit is documented in
`docs/avanza-disabled-api-route-implementation-safety-audit.md`.
