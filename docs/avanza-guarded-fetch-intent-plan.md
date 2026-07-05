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

## Production Boundary

No production readiness is claimed.
