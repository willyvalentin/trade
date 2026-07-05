# Avanza Disabled Localhost Bridge Stub Plan

Date: 2026-07-05

Plan status:
`avanza_disabled_localhost_bridge_stub_planned`

## Purpose

Plan a future disabled localhost bridge stub for local development only.

The stub may eventually expose a local endpoint for dry-run and fill-only status
simulation. The stub must be disabled by default. There is no implementation in
this task: this task does not implement the stub, does not add endpoints, does
not add a Trade UI call, does not control a browser, does not interact with
Avanza, does not handle credentials, session, BankID, cookies, or storage, and
does not submit orders.

There is no implementation in this task.

Final human confirmation remains mandatory.

## Future Local Stub Boundary

A future local stub may eventually:

- accept a safe bridge request
- return simulated status/progress
- report `fill_completed_waiting_manual_review`

The local stub must never receive:

- credentials
- cookies
- BankID data
- session tokens
- account ids
- broker secrets

The local stub must never click review, confirm, or submit controls. It must
never bypass manual confirmation. It must remain off unless explicitly enabled
in a local/dev environment. Trade UI must not call it by default.

## Future Endpoint Shape

Planning-only endpoint candidates:

- `POST /local/avanza/fill-only/dry-run`
- `POST /local/avanza/fill-only/prepare`

These endpoints are not implemented in this task. No code should introduce
these as live callable strings in Trade UI. Any future endpoint must be behind
an explicit local-only disabled guard. There must be no production route.

## Future Request

A future request may include:

- `bridgeRequestId`
- `broker: avanza`
- `action: fill_order_form_only`
- `mode: dry_run | fill_only`
- `packageId`
- `adapterRequestId`
- `side`
- `ticker`
- `symbol`
- `quantity`
- `orderType`
- `limitPrice` if applicable
- `accountLabel` if safe/present
- `userMustConfirm: true`
- `finalHumanClickRequired: true`

No account ids, credentials, cookies, BankID data, session tokens, browser
storage values, or broker secrets may be included.

## Future Response Statuses

The disabled localhost bridge stub may model:

- `stub_disabled`
- `request_unavailable`
- `request_invalid`
- `local_bridge_unavailable`
- `dry_run_ready`
- `fill_only_ready`
- `fill_started_mock`
- `fill_completed_waiting_manual_review_mock`
- `fill_blocked`
- `fill_failed`
- `cancelled`
- `unknown`

These are stub statuses only. They must not imply an order exists or that
review, confirmation, or submit behavior is available.

## Hard Safety Flags

The future stub contract must expose hard safety flags:

- `stubEnabled: false` by default
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

The disabled localhost bridge stub phase must never:

- never click Granska köp
- never click Granska sälj
- never open review modal
- never click Bekräfta köp
- never click Bekräfta sälj
- never submit order
- never handle credentials
- never handle BankID
- never read cookies/session/localStorage
- never store Avanza session state
- never bypass manual confirmation
- never write Supabase execution records from the stub phase

## Later Implementation Sequence

Recommended sequence:

1. Pure disabled localhost bridge stub model/helper. Completed as
   `lib/avanza-disabled-localhost-bridge-stub.ts`.
2. Static fixtures. Completed as
   `lib/avanza-disabled-localhost-bridge-stub-fixtures.ts`.
3. Isolated harness. Completed as
   `components/execution/AvanzaDisabledLocalhostBridgeStubHarness.tsx`.
4. Dev QA route section. Completed as a fixture/model-only section in
   `app/dev/avanza-visual-qa/page.tsx`.
5. Safety checkpoint. Completed as
   `docs/avanza-disabled-localhost-bridge-stub-phase-completion-checkpoint.md`.
6. Optional local-only API route stub, disabled by default. Planned in
   `docs/avanza-local-only-api-route-stub-plan.md`.
7. Only after that, isolated local fill-only POC.

Each step needs its own safety tests and checkpoint before any broader exposure.

## Non-Goals

This plan does not implement:

- localhost endpoints
- Trade UI calls
- polling
- browser control
- Avanza interaction
- form fill
- review/confirm/submit behavior
- order submission
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness

## Pure Model Implementation

`lib/avanza-disabled-localhost-bridge-stub.ts` now implements the pure
disabled localhost bridge stub model/helper. It accepts explicit input only:
`stubEnabled`, `mode`, `bridgeRequest`, `scenario`, `now`, and
`stubRequestId`.

The helper models `stub_disabled`, `request_unavailable`, `request_invalid`,
`local_bridge_unavailable`, `dry_run_ready`, `fill_only_ready`,
`fill_started_mock`, `fill_completed_waiting_manual_review_mock`,
`fill_blocked`, `fill_failed`, `cancelled`, and `unknown`.

The implementation remains model-only. It adds no Next.js route, no API route,
no localhost endpoint, no Trade UI wiring, no fetch, no polling, no bridge
call, no Avanza/browser control, no real fill behavior, no review/confirm/final
click behavior, no submit/order behavior, no credential/session/BankID/cookies
or storage handling, and no Supabase execution write. Semi-auto human
confirmation remains mandatory.

## Fixture Visibility Implementation

Static fixtures and an isolated harness now expose the disabled localhost
bridge stub for dev QA:

- `lib/avanza-disabled-localhost-bridge-stub-fixtures.ts`
- `components/execution/AvanzaDisabledLocalhostBridgeStubHarness.tsx`
- `app/dev/avanza-visual-qa/page.tsx` fixture/model-only section

The later local-only API route stub visibility phase is closed in
`docs/avanza-local-only-api-route-stub-phase-completion-checkpoint.md`. The next
planning-only phase is `docs/avanza-disabled-api-route-implementation-plan.md`;
it plans a disabled API route candidate without adding a route, endpoint, Trade
UI wiring, browser/Avanza control, real fill, order behavior,
credential/session handling, or Supabase writes.

The fixtures cover `stub_disabled`, `request_unavailable`, `request_invalid`,
`local_bridge_unavailable`, `dry_run_ready`, `fill_only_ready`,
`fill_started_mock`, `fill_completed_waiting_manual_review_mock`,
`fill_blocked`, `fill_failed`, `cancelled`, and `unknown`. They include safe
BUY/SELL `dry_run`, safe BUY/SELL `fill_only`, blocked unsafe bridge request,
invalid side, invalid quantity, missing ticker, and missing/unsafe price
states.

The harness and route section are display-only. They show explicit input,
request fields, statuses, scenarios, and hard safety flags. They add no API
route, no localhost endpoint, no Trade UI wiring, no active handoff, no prepare
button, no buy/sell CTA, no bridge calls, no localhost fetch, no polling, no
Avanza/browser control, no execution, no real fill, no order submission, no
review/confirm/final/submit click behavior, no credential/session/BankID/cookies
or storage handling, and no Supabase execution write.

## Phase Completion And Next Plan

The disabled localhost bridge stub visibility layer is closed in
[Avanza disabled localhost bridge stub phase completion checkpoint](avanza-disabled-localhost-bridge-stub-phase-completion-checkpoint.md).
The checkpoint confirms the pure model, static fixtures, isolated harness, and
fixture/model-only dev QA route section are complete, while no API route,
localhost endpoint, Trade UI wiring, active handoff, prepare button, buy/sell
CTA, bridge/local fetch, polling, Avanza/browser control, real fill, order
behavior, credential/session handling, or Supabase write was added.

The next phase is planned in
[Avanza local-only API route stub plan](avanza-local-only-api-route-stub-plan.md).
That plan is documentation only. It does not add endpoints, does not introduce
route strings into `app/trade-app.tsx`, and requires any future route to remain
disabled unless an explicit local-only guard is enabled.

The first pure model-only helper for that plan now exists as
`lib/avanza-local-only-api-route-stub.ts`. It remains disconnected from Trade
UI and the dev QA route, and it does not add an API route, localhost endpoint,
fetch/polling, bridge calls, Avanza/browser control, real fill, order behavior,
credential/session handling, or Supabase writes.

The local-only API route stub model now also has static fixtures, an isolated
harness, and a fixture/model-only dev QA route section:
`lib/avanza-local-only-api-route-stub-fixtures.ts`,
`components/execution/AvanzaLocalOnlyApiRouteStubHarness.tsx`, and
`app/dev/avanza-visual-qa/page.tsx`. This visibility layer remains unlinked
from main navigation and adds no API route, localhost endpoint, Trade UI
wiring, active handoff, prepare button, buy/sell CTA, bridge call, localhost
fetch, polling, Avanza/browser control, real fill, order behavior,
credential/session handling, or Supabase write.
