# Avanza Disabled API Route Implementation Plan

Date: 2026-07-05

Plan status:
`avanza_disabled_api_route_implementation_planned`

Implementation status:
`avanza_disabled_api_route_stub_added_default_disabled`

Safety audit status:
`avanza_disabled_api_route_implementation_safety_audit_passed`

Phase completion status:
`avanza_disabled_api_route_implementation_phase_complete`

Next phase plan:
`avanza_trade_ui_prepare_intent_planned_no_wiring`

## Purpose

Plan a future disabled Next.js API route for local/internal development only.
The route may return mocked dry-run or fill-only status from safe request
payloads, but it must be disabled by default and must not be called by Trade UI
by default.

This phase follows
`docs/avanza-local-only-api-route-stub-phase-completion-checkpoint.md`.

The route must not control a browser, interact with Avanza, handle
credentials/session/BankID/cookies/storage, or submit orders. Final human
confirmation remains mandatory.

The first disabled route implementation now exists, but it remains disabled by
default and returns `api_stub_disabled`.

## Future Route Candidate

Implemented disabled candidate:

- `POST /api/dev/avanza/fill-only/stub`

The route exists at `app/api/dev/avanza/fill-only/stub/route.ts`. It must not
be referenced from `app/trade-app.tsx`, must not be referenced from normal
Trade UI, must be local/dev/internal only, and production behavior must remain
disabled.

## Disabled Implementation Boundary

The disabled API route may:

- return `api_stub_disabled` unless an explicit local-only guard is true
- use the pure model helper from `lib/avanza-local-only-api-route-stub.ts`
- validate and sanitize input
- return mock response data only
- use fixture-safe request payloads for tests

The route must:

- never import Trade UI
- never write Supabase
- never read browser, session, or cookie data
- never call external network
- never call localhost itself
- never control browser
- never interact with Avanza

## Future Response Statuses

The future route may return mocked states only:

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

These statuses must not imply that a real fill occurred, a review modal opened,
or an order exists.

## Hard Safety Flags

The future route implementation phase must preserve these flags:

- `apiRouteEnabled: false` by default
- `localOnly: true`
- `canExposeEndpoint: false` unless explicitly local-only enabled
- `canCallBridge: false` always in route implementation phase
- `canFetchLocalhost: false` always
- `canControlBrowser: false` always
- `canFillForm: false` always
- `canClickReview: false` always
- `canClickConfirm: false` always
- `canSubmitOrder: false` always
- `canHandleCredentials: false` always
- `canReadCookies: false` always
- `canReadBankId: false` always
- `canWriteSupabaseExecution: false`
- `userMustConfirm: true` always
- `finalHumanClickRequired: true` always
- `controlsEnabled: false`
- `gateLocked: true`

## Absolute Forbidden Behavior

The disabled API route implementation phase must never:

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
- never write Supabase execution records from the API route implementation phase
- never add route calls to normal Trade UI

## Later Implementation Sequence

Recommended sequence:

1. Disabled API route implementation. Completed as
   `app/api/dev/avanza/fill-only/stub/route.ts`.
2. API route tests for disabled/default behavior.
3. Local-only guarded mock response tests.
4. Safety checkpoint.
5. Disabled API route implementation phase completion checkpoint.
6. Trade UI prepare intent plan.
7. Only after that, consider disabled Trade UI prepare intent model.
8. Only after that, consider explicit internal prepare button, disabled by default.

Each step needs its own safety tests and checkpoint before any broader exposure.

## Non-Goals

This plan and implementation do not add:

- a localhost endpoint
- route calls from Trade UI
- active handoff
- prepare button
- buy/sell CTA
- localhost calls
- bridge calls
- fetch or polling
- browser or Avanza control
- real form fill
- review/confirm/final/submit behavior
- order submission
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness

## Implemented Route Behavior

`app/api/dev/avanza/fill-only/stub/route.ts` accepts `POST`, defensively parses
JSON, ignores activation input, and calls
`buildAvanzaLocalOnlyApiRouteStubModel` with:

- `apiRouteEnabled: false`
- `localOnlyEnabled: false`
- `mode: "disabled"`

The default response is `api_stub_disabled`. The route returns model output
only and adds no localhost call, bridge call, fetch, polling, Avanza/browser
control, real fill, order behavior, review/confirm/submit behavior,
credential/session/BankID/cookies/storage handling, or Supabase execution
write.

## Safety Audit

`docs/avanza-disabled-api-route-implementation-safety-audit.md` records the
focused safety audit for the disabled route. It confirms the route exists at
`app/api/dev/avanza/fill-only/stub/route.ts`, returns `api_stub_disabled` by
default, uses only `lib/avanza-local-only-api-route-stub.ts`, is not referenced
from `app/trade-app.tsx`, has no active caller, and cannot call localhost,
bridge, fetch, Avanza/browser, real fill, review, confirmation, submit, order,
credential/session handling, or Supabase execution write behavior.

## Phase Completion And Prepare Intent Planning

`docs/avanza-disabled-api-route-implementation-phase-completion-checkpoint.md`
closes the disabled route implementation phase. The next phase is planning a
Trade UI prepare intent in `docs/avanza-trade-ui-prepare-intent-plan.md`.

The prepare intent plan is planning only. It must not wire the route into Trade
UI, must not add an active prepare button, must not add a buy/sell CTA, must not
call localhost, bridge, fetch, Avanza/browser, or order behavior, and must keep
final human confirmation mandatory.
