# Avanza Disabled Local Bridge Contract Plan

Date: 2026-07-05

Plan status:
`avanza_disabled_local_bridge_contract_planned`

Implementation update:
`lib/avanza-disabled-local-bridge-contract.ts` now implements the pure
disabled local bridge contract helper for this phase. The helper is model-only,
explicit-input-only, disabled by default, and does not call localhost, bridge,
browser, Avanza, Supabase, or execution paths.

## Purpose

Plan a future disabled local bridge contract for a fill-only Avanza browser
agent.

This is planning only. It does not implement a bridge, does not call localhost,
does not control a browser, does not interact with Avanza, does not handle
credentials/session/BankID/cookies/storage in Ture, and does not submit orders.

The bridge must remain disabled by default. Final human confirmation remains
mandatory.

## Future Bridge Boundary

In a later phase, Ture may create a request payload for a local bridge. The
local bridge may eventually receive a safe fill-only adapter request and report
progress/status back.

The bridge contract must never receive:

- credentials
- cookies
- BankID data
- session tokens
- account ids
- broker secrets
- browser storage values

The bridge must never click review, confirm, or submit controls. It must never
bypass manual confirmation.

## Future Request Fields

A future bridge request may include:

- `bridgeRequestId`
- `createdAt`
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

## Future Statuses

The disabled local bridge contract may model:

- `bridge_disabled`
- `request_unavailable`
- `request_invalid`
- `bridge_unavailable`
- `dry_run_ready`
- `fill_only_ready`
- `fill_started`
- `fill_completed_waiting_manual_review`
- `fill_blocked`
- `fill_failed`
- `cancelled`
- `unknown`

These are contract statuses only. They must not imply an order exists or that
review, confirmation, or submit behavior is available.

## Hard Safety Flags

The contract must expose hard safety flags:

- `bridgeEnabled: false` by default
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

The disabled local bridge contract phase must never:

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
- never write Supabase execution records from the bridge contract phase

## Later Implementation Sequence

Recommended sequence:

1. Pure disabled bridge contract helper. Completed in
   `lib/avanza-disabled-local-bridge-contract.ts`.
2. Static fixtures.
3. Isolated harness.
4. Dev QA route section.
5. Safety checkpoint.
6. Only after that, explicit disabled localhost bridge adapter stub.
7. Only after that, isolated local fill-only POC.

Each step needs its own safety tests and checkpoint before any broader exposure.

## Non-Goals

This plan does not implement:

- localhost bridge calls
- polling
- browser control
- Avanza interaction
- form fill
- review/confirm/submit behavior
- order submission
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness

## Implemented Pure Helper Boundary

The implemented helper exports:

- `AvanzaLocalBridgeMode`
- `AvanzaLocalBridgeAction`
- `AvanzaLocalBridgeStatus`
- `AvanzaLocalBridgeRequest`
- `AvanzaLocalBridgeResponse`
- `AvanzaLocalBridgeSafetyFlags`
- `buildAvanzaLocalBridgeRequest`
- `buildAvanzaLocalBridgeResponse`

The helper accepts only explicit input:

- `bridgeEnabled`
- `mode`
- `adapterResponse`
- `now`
- `bridgeRequestId`

Default input returns `bridge_disabled`. Safe `dry_run` adapter responses can
model `dry_run_ready`; safe `fill_only` adapter responses can model
`fill_only_ready`. Display-only statuses such as `bridge_unavailable`,
`fill_started`, and `fill_completed_waiting_manual_review` are represented only
as modeled contract states. They never come from a real bridge call.

All outputs keep:

- `canCallBridge: false`
- `canFetchLocalhost: false`
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

The next phase remains fixtures, harness, and optional dev QA route visibility
only. No Trade UI wiring, active bridge, localhost call, browser control, real
fill, order behavior, credential/session handling, or Supabase write is allowed.

## Fixture Visibility Implementation

Static fixtures, an isolated harness, and a dev QA route section now exist:

- `lib/avanza-disabled-local-bridge-contract-fixtures.ts`
- `components/execution/AvanzaDisabledLocalBridgeContractHarness.tsx`
- `app/dev/avanza-visual-qa/page.tsx` fixture/model-only section

The fixtures cover `bridge_disabled`, `request_unavailable`,
`request_invalid`, `bridge_unavailable`, `dry_run_ready`, `fill_only_ready`,
`fill_started`, `fill_completed_waiting_manual_review`, `fill_blocked`,
`fill_failed`, `cancelled`, and `unknown`. They include safe BUY/SELL
`dry_run`, safe BUY/SELL `fill_only`, blocked unsafe adapter response, invalid
side, invalid quantity, missing ticker, and missing/unsafe price states.

The harness is display-only. It shows bridge request fields and safety flags,
and clearly labels the section as fixture only, explicit input only, no Trade
UI wiring, no bridge calls, no localhost fetch, no polling, no Avanza/browser
control, no execution, no real fill, no order submission, never clicks review,
never clicks confirm, never submits order, user must confirm, final human click
required, controls disabled by default, and gate locked by default.

The route section uses static fixtures only and remains unlinked from main
navigation. It does not wire the disabled bridge contract into Trade UI and
does not add active handoff, prepare, buy/sell CTA, localhost calls, bridge
calls, fetch/polling/execution, Avanza/browser control, real fill behavior,
order/click/review/final/submit behavior, credential/session handling, or
Supabase writes.

## Phase Completion And Next Plan

The disabled local bridge contract phase is closed in
[Avanza disabled local bridge contract phase completion checkpoint](avanza-disabled-local-bridge-contract-phase-completion-checkpoint.md).

The next phase is planned in
[Avanza disabled localhost bridge stub plan](avanza-disabled-localhost-bridge-stub-plan.md).
The first pure model-only step of that plan now exists as
`lib/avanza-disabled-localhost-bridge-stub.ts`. It keeps `stubEnabled` false by
default, `canExposeEndpoint` false, `canCallBridge` false,
`canFetchLocalhost` false, `canControlBrowser` false, `canFillForm` false,
`canClickReview` false, `canClickConfirm` false, and `canSubmitOrder` false.
It does not implement localhost endpoints, Trade UI calls, browser/Avanza
control, real fill, review/confirm/submit behavior, order behavior,
credential/session handling, or Supabase execution writes.

The disabled localhost bridge stub now also has static fixtures, an isolated
harness, and a fixture/model-only dev QA route section:
`lib/avanza-disabled-localhost-bridge-stub-fixtures.ts`,
`components/execution/AvanzaDisabledLocalhostBridgeStubHarness.tsx`, and
`app/dev/avanza-visual-qa/page.tsx`. This visibility layer remains unlinked
from main navigation and adds no API route, localhost endpoint, Trade UI
wiring, active handoff, prepare button, buy/sell CTA, bridge call, localhost
fetch, polling, Avanza/browser control, real fill, order behavior,
credential/session handling, or Supabase execution write.

The stub visibility phase is closed in
[Avanza disabled localhost bridge stub phase completion checkpoint](avanza-disabled-localhost-bridge-stub-phase-completion-checkpoint.md).
The following local-only API route stub phase is planned in
[Avanza local-only API route stub plan](avanza-local-only-api-route-stub-plan.md).
That plan does not add an API route, localhost endpoint, Trade UI calls,
browser/Avanza behavior, real fill, order behavior, credential/session
handling, or Supabase writes.
