# Avanza Hard-Disabled Trade UI Prepare Intent Wiring Plan

Date: 2026-07-05

Plan status:
`avanza_hard_disabled_trade_ui_prepare_intent_wiring_planned`

Implementation status:
`avanza_hard_disabled_trade_ui_prepare_intent_wiring_added`

Safety audit status:
`avanza_hard_disabled_trade_ui_prepare_intent_wiring_safety_audit_passed`

## Purpose

Plan future minimal hard-disabled Trade UI wiring for prepare intent metadata.

The future wiring must remain behind the existing disabled/default-off branch,
must add no active prepare button initially, must make no API route call
initially, and must add no Avanza/browser/fill/order behavior.

The minimal hard-disabled wiring is now present in `app/trade-app.tsx` inside
the existing `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` branch. That
guard remains `false` by default. The branch invokes
`buildAvanzaTradeUiPrepareIntent({ mode: "disabled", prepareEnabled: false })`
only as disabled metadata and renders no prepare UI.

Initial constraints:

- no active prepare button initially
- no API route call initially
- no Avanza/browser/fill/order behavior

Default Trade UI must remain visually unchanged. Final human confirmation
remains mandatory.

Final human confirmation remains mandatory.

## Future Allowed Shape

A later task may touch `app/trade-app.tsx` minimally to import/use:

- `lib/avanza-trade-ui-prepare-intent.ts`

That minimal import/use has been added. It remains quarantined inside the
disabled/default-off branch and does not call the disabled API route.

The safety audit is recorded in:

- `docs/avanza-hard-disabled-trade-ui-prepare-intent-wiring-safety-audit.md`

Any usage must be inside the existing disabled/default-off guard only. The guard
must remain false by default. `prepareEnabled` must remain false by default.
Mode must remain disabled by default.

Default guard constraints:

- guard must remain false by default
- `prepareEnabled` must remain false by default
- Mode must remain disabled by default

The prepare intent output may be inspected only inside the disabled branch.
There must be no visible prepare UI by default, no button by default, no route
call by default, and no active controls by default.

Default visibility constraints:

- no visible prepare UI by default
- no button by default
- no route call by default
- no active controls by default

## Future Allowed Metadata

The hard-disabled branch may produce metadata only:

- prepare status
- blocked reasons
- warnings
- `sourceRecommendationId`
- `packageId`
- side
- ticker / symbol
- quantity
- order type
- limit price if applicable
- `accountLabel` if safe/present
- `userMustConfirm`
- `finalHumanClickRequired`
- safety flags

## Required Output Guarantees

The future default output must be:

- `prepare_disabled` by default
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
- `controlsEnabled: false`
- `gateLocked: true`

## Absolute Forbidden Behavior

The hard-disabled wiring phase must not:

- add an active prepare button
- wire the API route into Trade UI
- call the API route from Trade UI
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
- write Supabase execution records from prepare intent wiring

No production readiness is claimed.

## Later Implementation Sequence

Recommended sequence:

1. Minimal hard-disabled Trade UI prepare intent model invocation.
2. Safety audit.
3. Phase completion checkpoint.
4. Internal disabled prepare button shell plan.
5. Internal disabled prepare button shell implementation.
6. Guarded API route call planning, only after the disabled shell is audited.

Every step must keep execution, fill, browser control, review, confirmation,
submit, order, credential/session handling, and Supabase writes forbidden.

The hard-disabled wiring phase completion checkpoint is:

- `docs/avanza-trade-ui-prepare-intent-hard-disabled-wiring-phase-completion-checkpoint.md`

The next disabled internal prepare button shell plan is:

- `docs/avanza-disabled-internal-prepare-button-shell-plan.md`
