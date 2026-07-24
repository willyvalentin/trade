# Avanza Trade UI Prepare Intent Plan

Date: 2026-07-05

Plan status:
`avanza_trade_ui_prepare_intent_planned_no_wiring`

Pure model/helper status:
`avanza_trade_ui_prepare_intent_model_added`

Fixture/harness status:
`avanza_trade_ui_prepare_intent_fixtures_harness_added`

Dev QA route section status:
`avanza_trade_ui_prepare_intent_dev_route_section_added_fixture_model_only`

Visibility phase completion status:
`avanza_trade_ui_prepare_intent_visibility_phase_complete`

Next hard-disabled wiring plan status:
`avanza_hard_disabled_trade_ui_prepare_intent_wiring_planned`

## Purpose

Plan a future internal/dev-only prepare intent in Trade UI.

Prepare intent means the user indicates intent to prepare a fill-only handoff
package. It does not execute, does not call Avanza, does not call a browser,
does not submit an order, and does not click review or confirmation controls.

Final human confirmation remains mandatory. The prepare intent must be disabled
by default.

Default state: disabled by default.

## Future Allowed Shape

The pure prepare intent model/helper exists at:

- `lib/avanza-trade-ui-prepare-intent.ts`

It consumes explicit inputs only:

- handoff package result
- Trade UI handoff preview result
- adapter contract result
- disabled API route state if explicitly provided

It may output:

- `prepare_disabled`
- `package_unavailable`
- `package_blocked`
- `route_disabled`
- `prepare_ready_internal`
- `prepare_blocked`
- `prepare_failed`

It may expose disabled UI metadata only. It must not call the API route by
default, must not add an active button initially, and must not bypass existing
hard-disabled/default-off guards.

Boundary summary: must not call the API route by default; must not add an active
button initially.

## Future Prepare Intent Fields

Future model output may include:

- `prepareIntentId`
- `createdAt`
- `sourceRecommendationId`
- `packageId`
- `side`
- `ticker` / `symbol`
- `quantity`
- `orderType`
- `limitPrice` if applicable
- `accountLabel` if safe/present
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- warnings
- blocked reasons
- safety flags

## Hard Safety Flags

The future prepare intent phase must keep:

- `prepareEnabled: false` by default
- `canRenderPrepare: false` by default
- `canClickPrepare: false` by default
- `canCallApiRoute: false` by default
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
- `controlsEnabled: false` by default
- `gateLocked: true` by default

## Absolute Forbidden Behavior

This planning phase and the first future implementation steps must not:

- add an active prepare button
- wire the API route into Trade UI
- call the route from Trade UI
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
- write Supabase execution records from prepare intent

## Later Implementation Sequence

Recommended sequence:

1. Pure Trade UI prepare intent model/helper.
2. Fixtures and isolated harness.
3. Dev QA route fixture/model-only section.
4. Hard-disabled Trade UI prepare intent wiring.
5. Safety audit.
6. Explicit internal/dev-only disabled prepare button shell, only after the
   previous steps are complete.
7. Guarded API route call planning, only after the disabled shell is audited.

Every step must keep execution, fill, browser control, review, confirmation,
submit, order, credential/session handling, and Supabase writes forbidden.

## Current Boundary

The pure prepare intent model/helper and fixture visibility layer are complete.
The minimal hard-disabled Trade UI wiring now invokes the model only inside the
existing disabled/default-off branch with `mode: "disabled"` and
`prepareEnabled: false`. The existing disabled API route remains
`api_stub_disabled` by default, has no active caller from Trade UI, and is not
called by the hard-disabled prepare intent branch.

The pure model/helper is model-only. It does not render UI, does not add a
prepare button, does not call the disabled API route, does not call localhost or
bridge, does not call Avanza/browser, does not fill, review, confirm, submit,
or order, and does not handle credentials/session/BankID/cookies/storage or
write Supabase execution records.

## Fixture, Harness, And Dev QA Route Visibility

Static fixtures now exist at:

- `lib/avanza-trade-ui-prepare-intent-fixtures.ts`

The isolated harness now exists at:

- `components/execution/AvanzaTradeUiPrepareIntentHarness.tsx`

The dev-only Avanza visual QA route renders the harness as fixture/model-only
content:

- `app/dev/avanza-visual-qa/page.tsx`

The section shows disabled, unavailable, blocked, route-disabled,
ready-internal, failed, unknown, safe BUY/SELL internal preview, and safe
BUY/SELL internal prepare scenarios. It remains non-executable: no Trade UI
wiring, no active prepare button, no active handoff, no API route call, no
localhost/bridge/fetch/polling, no Avanza/browser control, no real fill, no
review/confirm/submit/order behavior, no credential/session handling, and no
Supabase execution write.

The visibility phase is closed in:

- `docs/avanza-trade-ui-prepare-intent-visibility-phase-completion-checkpoint.md`

The next phase is planned in:

- `docs/avanza-hard-disabled-trade-ui-prepare-intent-wiring-plan.md`

That future phase remains hard-disabled/default-off. It allows only metadata
inspection inside the existing disabled branch and keeps `prepareEnabled:
false`, `canRenderPrepare: false`, `canClickPrepare: false`,
`canCallApiRoute: false`, controls disabled, and the gate locked by default.

The minimal hard-disabled branch invocation has been added in `app/trade-app.tsx`.
It keeps those defaults, renders no prepare UI, and adds no active handoff,
prepare, buy/sell CTA, API route call, fetch, localhost, bridge, polling,
Avanza/browser, real fill, review, confirmation, submit, order,
credential/session, or Supabase behavior.

The safety audit for that hard-disabled wiring is recorded in:

- `docs/avanza-hard-disabled-trade-ui-prepare-intent-wiring-safety-audit.md`

The phase completion checkpoint is recorded in:

- `docs/avanza-trade-ui-prepare-intent-hard-disabled-wiring-phase-completion-checkpoint.md`

The next disabled internal prepare button shell phase is planned in:

- `docs/avanza-disabled-internal-prepare-button-shell-plan.md`

That shell visibility layer is closed in:

- `docs/avanza-disabled-internal-prepare-button-shell-visibility-phase-completion-checkpoint.md`

The next passive disabled prepare shell component phase is planned in:

- `docs/avanza-passive-disabled-prepare-shell-component-plan.md`
