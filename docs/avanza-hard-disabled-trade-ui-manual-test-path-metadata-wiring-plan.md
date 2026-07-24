# Avanza Hard-Disabled Trade UI Manual Test Path Metadata Wiring Plan

Status: `avanza_hard_disabled_trade_ui_manual_test_path_metadata_wiring_planned`

Implementation status:
`avanza_hard_disabled_trade_ui_manual_test_path_metadata_wiring_added_minimal_disabled`

Safety audit status:
`avanza_hard_disabled_trade_ui_manual_test_path_metadata_wiring_safety_audited`

## Purpose

Plan future minimal hard-disabled Trade UI wiring for disabled local-only manual
test path metadata.

The wiring must remain behind the existing disabled/default-off branch.
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` must remain false by
default. The manual test path guard must remain false by default.

Default Trade UI must remain visually unchanged. No manual test path UI may
render in normal/default UI. No manual test path UI may render in normal/default UI.
Semi-auto human confirmation remains mandatory.

## Future Allowed Shape

A future `app/trade-app.tsx` task may import and use:

- `lib/avanza-disabled-local-only-manual-test-path.ts`

Allowed usage is limited to the existing disabled/default-off guard only.

Required defaults:

- base guard remains false by default
- `manualTestPathEnabled` remains false by default
- mode remains hidden or disabled by default
- no manual test path render by default
- no button by default
- no route call by default
- no fetch by default
- no active controls by default
- output may be inspected only inside the disabled/internal branch

`app/trade-app.tsx` must not reference the disabled local API route path.

## Future Allowed Metadata

Future metadata-only output may include:

- manual test path status
- label and reason
- warnings
- blockedReasons
- manualTestPathId
- fetchIntentId if present
- actionShellId if present
- apiCallIntentId if present
- sourceRecommendationId
- packageId
- side
- ticker or symbol
- quantity
- orderType
- limitPrice if applicable
- accountLabel if safe/present
- routeStatus if explicit
- localOnlyGuardStatus if explicit
- internalGuardStatus if explicit
- `userMustConfirm`
- `finalHumanClickRequired`
- safety flags

## Required Future Output Guarantees

Default future output must be `manual_test_path_hidden` or
`manual_test_path_disabled`.

Safety flags must stay locked:

- `manualTestPathEnabled: false` by default
- `canCreateManualTestPath: false` by default
- `canExposeLocalRoute: false`
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

The future metadata wiring must not:

- render manual test path in normal/default UI
- add active prepare button
- add active handoff
- add buy/sell CTA
- add `onClick`
- call the API route
- add fetch
- expose route path
- reference route path from `app/trade-app.tsx`
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
- write Supabase execution records from manual test path metadata wiring

## Later Implementation Sequence

1. Minimal hard-disabled Trade UI manual test path model invocation.
2. Safety audit.
3. Phase completion checkpoint.
4. Only after that, explicit disabled local-only fetch test planning.
5. Only after that, any actual local-only disabled fetch test is considered
   separately and must remain internal/dev-only, explicit, disabled by default,
   local-only, non-broker-action, and human-confirmation preserving.

## Current Non-Goals

This plan does not implement active Trade UI behavior. The minimal metadata
invocation below does not add UI, controls, fetch, route calls, localhost
calls, bridge calls, Avanza/browser control, real fill, order behavior,
credential/session handling, or Supabase writes.

No production readiness is claimed.

## Minimal Hard-Disabled Wiring

The minimal metadata-only invocation now exists in `app/trade-app.tsx`.

The invocation:

- imports `buildAvanzaDisabledLocalOnlyManualTestPath`
- runs only inside the existing
  `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` disabled/default-off branch
- uses `manualTestPathEnabled: false`
- uses `mode: "hidden"`
- may consume already-built hard-disabled action shell, API call intent, and
  guarded fetch intent metadata
- passes no route path strings
- passes no credentials, cookies, BankID/session metadata, broker secrets,
  Supabase auth/session, execution records, or order submission metadata
- produces `manual_test_path_hidden` or `manual_test_path_disabled` metadata by
  default
- discards the output with `void hardDisabledManualTestPath`

The invocation still renders no manual test path UI in normal/default Trade UI,
adds no button, adds no `onClick`, calls no API route, performs no fetch,
exposes no route path, calls no localhost or bridge, controls no
Avanza/browser state, performs no real fill, submits no order, handles no
credentials/session data, and writes no Supabase execution records.

The focused safety audit for this minimal hard-disabled wiring is recorded in:

- `docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-safety-audit.md`

The phase completion checkpoint is recorded in:

- `docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-phase-completion-checkpoint.md`

The next disabled local-only chain readiness closeout is planned in:

- `docs/avanza-disabled-local-only-chain-readiness-closeout-plan.md`
