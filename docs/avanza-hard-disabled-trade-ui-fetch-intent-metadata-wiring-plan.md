# Avanza Hard-Disabled Trade UI Fetch Intent Metadata Wiring Plan

Status: `avanza_hard_disabled_trade_ui_fetch_intent_metadata_wiring_planned`

## Purpose

Plan future minimal hard-disabled Trade UI wiring for guarded fetch intent
metadata.

The wiring must remain behind the existing disabled/default-off branch. The
fetch intent guard must remain `false` by default. No fetch intent UI may render
in normal/default UI. No active UI may appear by default.

Default Trade UI must remain visually unchanged. Final human confirmation
remains mandatory.

Purpose summary:

- future minimal hard-disabled Trade UI fetch intent metadata wiring
- existing disabled/default-off branch only
- fetch intent guard remains false by default
- no fetch intent UI in normal/default UI
- no active UI by default
- no active prepare button
- no click handler
- no API route call
- no fetch
- no route path reference
- no Avanza/browser/fill/order behavior
- default Trade UI remains visually unchanged
- final human confirmation remains mandatory

## Future Allowed Shape

`app/trade-app.tsx` may later import and use:

- `lib/avanza-guarded-fetch-intent.ts`

Any future usage must be inside the existing disabled/default-off guard only:

- base guard remains false by default
- `fetchIntentEnabled` remains false by default
- mode remains hidden/disabled by default
- no fetch intent renders by default
- no button renders by default
- no route call happens by default
- no fetch happens by default
- no active controls appear by default
- output may be inspected only inside the disabled/internal branch

## Future Allowed Metadata

The future metadata-only invocation may inspect:

- fetch intent status
- label/reason
- warnings
- blockedReasons
- fetchIntentId
- actionShellId if present
- apiCallIntentId if present
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

The future default output must remain:

- `fetch_intent_hidden` or `fetch_intent_disabled` by default
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
- `controlsEnabled: false`
- `gateLocked: true`

## Absolute Forbidden Behavior

The hard-disabled Trade UI fetch intent metadata wiring phase must not:

- render fetch intent in normal/default UI
- add active prepare button
- add active handoff
- add buy/sell CTA
- add `onClick`
- call API route
- add fetch
- reference route path from `app/trade-app.tsx`
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
- never write Supabase execution records from fetch intent metadata wiring phase

## Later Implementation Sequence

1. Minimal hard-disabled Trade UI fetch intent model invocation.
2. Safety audit.
3. Phase completion checkpoint.
4. Explicit disabled local-only manual test path planning.
5. Only after that, any actual fetch is considered separately and must remain
   internal/dev-only, explicit, disabled by default, local-only, and
   human-confirmation preserving.

## Starting Point

The guarded fetch intent visibility phase is complete:

- `docs/avanza-guarded-fetch-intent-visibility-phase-completion-checkpoint.md`

Existing defaults remain:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- `apiCallIntentEnabled` remains `false`
- `actionShellEnabled` remains `false`
- action shell mode remains `"hidden"`
- default Trade UI remains visually unchanged
- no API call intent UI renders by default
- no action shell UI renders by default
- no fetch intent UI renders by default
- the disabled API route returns `api_stub_disabled` by default
- no Trade UI API route call exists
- no Trade UI fetch exists for this path

## Production Boundary

No production readiness is claimed.

## Implementation Status

Minimal hard-disabled Trade UI fetch intent metadata wiring is now implemented
in `app/trade-app.tsx`.

The implementation imports `buildAvanzaGuardedFetchIntent(...)` and invokes it
only inside the existing `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
disabled/default-off branch. That branch remains unreachable by default because
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`.

The implementation invokes it only inside the existing disabled/default-off
branch.

The invocation passes:

- `fetchIntentEnabled: false`
- `mode: "hidden"`
- the existing hard-disabled action shell metadata
- the existing hard-disabled API call intent metadata

In other words, the implementation passes `fetchIntentEnabled: false`, passes
`mode: "hidden"`, and produces `fetch_intent_hidden` metadata only.
The implementation passes `mode: "hidden"`.

Default output remains `fetch_intent_hidden` metadata only. It is discarded as
metadata with `void hardDisabledFetchIntent` and is not rendered in normal or
default Trade UI.

The implementation still adds no fetch intent UI, active prepare button, active
handoff, buy/sell CTA, `onClick` handler, API route call, fetch, API route path
reference, localhost call, bridge call, Avanza/browser control, real fill,
order behavior, review/confirm/submit behavior, credential/session handling, or
Supabase execution write.

## Safety Audit

The focused safety audit for this wiring is recorded in:

- `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-safety-audit.md`

The audit confirms the metadata invocation remains isolated,
hard-disabled/default-off, hidden by default, non-rendering in normal/default
Trade UI, non-fetching, non-executing, and separate from API route calls,
localhost/bridge calls, Avanza/browser behavior, real fill, order behavior,
credential/session handling, and Supabase execution writes.

## Phase Completion And Next Plan

This phase is closed in:

- `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-phase-completion-checkpoint.md`

The next planning-only phase is:

- `docs/avanza-disabled-local-only-manual-test-path-plan.md`

That next phase may only plan a disabled local-only manual test path. It must
not add fetch, call the API route, reference the route path from normal/default
Trade UI, add active UI, call localhost or bridge, control Avanza/browser state,
fill forms, submit orders, handle credentials/sessions, or write Supabase
execution records.
