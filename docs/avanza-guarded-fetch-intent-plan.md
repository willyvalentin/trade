# Avanza Guarded Fetch Intent Plan

Status: `avanza_guarded_fetch_intent_planned`

## Purpose

Plan a future internal/dev-only guarded fetch intent for the disabled local-only
API route.

The intent may describe whether a fetch could theoretically be requested later.
It must not perform fetch, must not call the API route, must not call localhost,
must not call bridge, must not control a browser, must not fill a form, and
must not submit an order.

Final human confirmation remains mandatory.

## Phase Boundary

This phase is planning only:

- no fetch is added
- no API route call is added
- no route path is used in normal/default Trade UI
- no active UI is added
- no bridge call is added
- no browser control is added
- no fill behavior is added
- no order behavior is added

## Future Allowed Shape

The future implementation may start with a pure model/helper.

Allowed explicit inputs:

- disabled action shell model
- guarded API route call intent model
- explicit route availability metadata, if provided
- explicit user/dev/internal guard metadata, if provided

Allowed output statuses:

- `fetch_intent_disabled`
- `fetch_intent_hidden`
- `fetch_intent_blocked`
- `route_unavailable`
- `route_disabled`
- `internal_guard_missing`
- `action_shell_unavailable`
- `fetch_intent_ready_internal_disabled`
- `fetch_intent_failed`
- `unknown`

Required boundaries:

- no actual network call
- no route path in normal/default Trade UI
- no fetch in model/helper
- no active button
- no default visible UI

## Future Fields

The future model may expose safe metadata:

- `fetchIntentId`
- `createdAt`
- `sourceRecommendationId`
- `packageId`
- `actionShellId` if present
- `apiCallIntentId` if present
- `side`
- `ticker`/`symbol`
- `quantity`
- `orderType`
- `limitPrice` if applicable
- `accountLabel` if safe/present
- `routeStatus` if explicit
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- warnings
- blockedReasons
- safety flags

## Required Safety Flags

The default and all blocked states must keep these flags locked:

- `fetchIntentEnabled: false` by default
- `canCreateFetchIntent: false` by default
- `canFetch: false` by default
- `canCallApiRoute: false` by default
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

The guarded fetch intent phase must not:

- add fetch in planning phase
- call API route
- reference route path from `app/trade-app.tsx`
- add active prepare button
- add active handoff
- add buy/sell CTA
- add `onClick`
- call localhost
- call bridge
- call Avanza/browser
- add real fill
- submit order
- never click Granska köp
- never click Granska sälj
- never open review modal
- never click Bekräfta köp
- never click Bekräfta sälj
- never handle credentials
- never handle BankID
- never read cookies/session/localStorage
- never store Avanza session state
- never bypass manual confirmation
- never write Supabase execution records from guarded fetch intent phase

## Later Implementation Sequence

1. Pure guarded fetch intent model/helper.
2. Fixtures/harness/dev QA route section.
3. Hard-disabled Trade UI metadata wiring.
4. Safety audit.
5. Phase completion checkpoint.
6. Only after that, explicit disabled local-only manual test path planning.
7. Only after that, any actual fetch is considered separately and must remain
   internal/dev-only, explicit, disabled by default, and human-confirmation
   preserving.

## Starting Point

The hard-disabled Trade UI action shell metadata wiring phase is complete:

- `docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-phase-completion-checkpoint.md`

Existing defaults remain:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- `apiCallIntentEnabled` remains `false`
- `actionShellEnabled` remains `false`
- action shell mode remains `"hidden"`
- default Trade UI remains visually unchanged
- no API call intent UI renders by default
- no action shell UI renders by default
- the disabled API route returns `api_stub_disabled` by default
- no Trade UI API route call exists
- no Trade UI fetch exists for this path

## Pure Helper Implementation

`lib/avanza-guarded-fetch-intent.ts` now implements the first allowed step from
this plan as a pure explicit-input model/helper.

The helper can model:

- disabled, hidden, blocked, unavailable, failed, unknown, and
  `fetch_intent_ready_internal_disabled` states
- explicit disabled action shell metadata
- explicit guarded API route call intent metadata
- explicit route availability metadata
- explicit internal/dev-only guard metadata
- safe handoff metadata such as package id, source recommendation id, ticker,
  side, quantity, order type, limit price, and safe account label

The helper still does not:

- perform fetch
- call the API route
- expose a live route path
- call localhost
- call bridge
- control Avanza/browser state
- fill forms
- click review or confirmation controls
- submit orders
- handle credentials, sessions, BankID, cookies, or storage
- write Supabase execution records

At helper creation time it was not wired into `app/trade-app.tsx`, not rendered
on the dev QA route, and not connected to any real selectedRecommendation
state.

## Fixture Visibility Layer

The fixture/model-only visibility layer now exists:

- `lib/avanza-guarded-fetch-intent-fixtures.ts`
- `components/execution/AvanzaGuardedFetchIntentHarness.tsx`
- guarded fetch intent section on `app/dev/avanza-visual-qa/page.tsx`

The fixtures cover disabled, hidden, blocked, route unavailable, route
disabled, internal guard missing, action shell unavailable, failed, unknown, and
`fetch_intent_ready_internal_disabled` states, including safe BUY/SELL internal
preview and internal fetch-intent-disabled scenarios.

The dev QA route section is fixture/model-only, unlinked from main navigation,
and still adds no Trade UI wiring, active prepare button, active handoff,
buy/sell CTA, API route call, fetch, localhost/bridge call, polling,
Avanza/browser control, real fill, order/review/confirm/submit behavior,
credential/session handling, or Supabase execution write.

## Disabled Local-Only Manual Test Path Follow-Up

The disabled local-only manual test path visibility layer is complete as
fixture/model-only content:

- `docs/avanza-disabled-local-only-manual-test-path-visibility-phase-completion-checkpoint.md`

The next planned phase is hard-disabled Trade UI manual test path metadata
wiring:

- `docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-plan.md`

That future phase must keep the guarded fetch intent metadata hidden/default-off
and must not add fetch, route calls, route path references in `app/trade-app.tsx`,
localhost/bridge calls, active UI, Avanza/browser control, fill, order behavior,
credential/session handling, or Supabase writes.

## Visibility Phase Completion

The guarded fetch intent visibility layer is closed in:

- `docs/avanza-guarded-fetch-intent-visibility-phase-completion-checkpoint.md`

The next planning-only phase is:

- `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-plan.md`

That future phase may only plan a metadata-only invocation inside the existing
hard-disabled/default-off Trade UI branch. It must keep `fetchIntentEnabled`
false by default, render no fetch intent in normal/default UI, add no active
controls, call no API route, perform no fetch, reference no route path from
`app/trade-app.tsx`, and add no localhost/bridge, Avanza/browser, fill, order,
credential/session, or Supabase behavior.

## Production Boundary

No production readiness is claimed.

## Hard-Disabled Trade UI Metadata Invocation

The minimal hard-disabled Trade UI fetch intent metadata invocation now exists
in `app/trade-app.tsx`. It imports `buildAvanzaGuardedFetchIntent(...)` and
uses it only inside the existing disabled/default-off branch guarded by
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`.

The guard remains `false` by default. The invocation passes
`fetchIntentEnabled: false` and `mode: "hidden"`, produces
`fetch_intent_hidden` metadata only, and does not render fetch intent UI in
normal/default Trade UI.

No API route call, fetch, API route path reference, localhost call, bridge call,
polling, Avanza/browser behavior, fill, order/review/confirm/submit behavior,
credential/session handling, or Supabase execution write was added.

The dedicated safety audit is recorded in
`docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-safety-audit.md`.

The hard-disabled Trade UI fetch intent metadata wiring phase is closed in
`docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-phase-completion-checkpoint.md`.

The next planning-only phase is
`docs/avanza-disabled-local-only-manual-test-path-plan.md`. It may only plan a
disabled local-only manual test path and must add no fetch, API route call,
localhost/bridge call, active UI, Avanza/browser control, fill, order,
credential/session handling, or Supabase execution write.

The pure disabled local-only manual test path helper now exists at
`lib/avanza-disabled-local-only-manual-test-path.ts`. It remains explicit-input
only and model-only, and it is not wired into Trade UI, the dev QA route, the
disabled API route, or the passive disabled action shell component.

The disabled local-only manual test path fixture visibility layer now adds
`lib/avanza-disabled-local-only-manual-test-path-fixtures.ts`,
`components/execution/AvanzaDisabledLocalOnlyManualTestPathHarness.tsx`, and a
fixture/model-only section on `app/dev/avanza-visual-qa/page.tsx`. The section
remains unlinked from main navigation and does not add Trade UI wiring, API
route calls, fetch, route path exposure, localhost/bridge calls, polling,
Avanza/browser control, fill, order behavior, credential/session handling, or
Supabase execution writes.
