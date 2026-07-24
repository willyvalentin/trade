# Avanza Hard-Disabled Trade UI Prepare Shell Wiring Plan

Date: 2026-07-05

Plan status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_planned`

Implementation status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_added_minimal_disabled`

Safety audit status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_safety_audit_passed`

Phase completion status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_phase_complete`

Next phase plan status:
`avanza_explicit_internal_visible_disabled_prepare_shell_planned`

## Purpose

Plan future minimal hard-disabled Trade UI wiring for the passive disabled
prepare shell component.

The wiring now exists as a minimal hard-disabled invocation behind the existing
disabled/default-off branch. It does not make a shell visible by default, does
not add an active prepare button, does not add a click handler, does not call
the API route, and does not add Avanza/browser/fill/order behavior.

Explicit default guarantees:

- no shell visible by default
- no active prepare button
- no click handler
- no API route call
- no Avanza/browser/fill/order behavior

Default Trade UI must remain visually unchanged. Final human confirmation
remains mandatory.

## Current Preconditions

The passive disabled prepare shell component phase is complete:

- `components/execution/AvanzaPassiveDisabledPrepareShell.tsx`
- `lib/avanza-passive-disabled-prepare-shell-fixtures.ts`
- `components/execution/AvanzaPassiveDisabledPrepareShellHarness.tsx`
- `app/dev/avanza-visual-qa/page.tsx` fixture/model-only section

The completion checkpoint is:

- `docs/avanza-passive-disabled-prepare-shell-component-phase-completion-checkpoint.md`

Before this minimal wiring phase, the component was not wired into
`app/trade-app.tsx`. The current wiring references it only inside the existing
disabled/default-off branch, where it remains hidden by default. The disabled
API route still returns `api_stub_disabled` by default and is not called by
Trade UI.

## Implemented Minimal Shape

`app/trade-app.tsx` now imports/uses:

- `components/execution/AvanzaPassiveDisabledPrepareShell.tsx`
- `lib/avanza-disabled-internal-prepare-button-shell.ts`
- `lib/avanza-passive-disabled-prepare-shell-fixtures.ts`

Usage is inside the existing disabled/default-off guard only:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- `buildAvanzaDisabledInternalPrepareButtonShell(...)` is invoked with
  `shellEnabled: false` and `mode: "hidden"`
- `buildAvanzaPassiveDisabledPrepareShellComponentModel(...)` receives the
  hidden shell model
- `AvanzaPassiveDisabledPrepareShell` is guarded by
  `hardDisabledPrepareShellComponent.canRenderComponent`

Because `canRenderComponent` is `false` by default, no shell UI renders by
default. Default Trade UI remains visually unchanged.

The guard must remain false by default.

Defaults must remain:

- `shellEnabled: false`
- `componentEnabled: false`
- `canRenderShell: false`
- `canRenderComponent: false`
- no shell visible by default
- no active button by default
- no route call by default
- no active controls by default

## Future Allowed Metadata

The future hard-disabled branch may expose metadata only:

- shell status
- label/reason
- blockedReasons
- warnings
- sourceRecommendationId
- packageId
- side
- ticker/symbol
- quantity
- orderType
- limitPrice if applicable
- accountLabel if safe/present
- userMustConfirm
- finalHumanClickRequired
- safety flags

## Required Output Guarantees

The future hard-disabled wiring must keep:

- shell hidden/disabled by default
- `shellEnabled: false` by default
- `componentEnabled: false` by default
- `canRenderShell: false` by default
- `canRenderComponent: false` by default
- `canClickPrepare: false`
- `canCallApiRoute: false`
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

This wiring phase must not:

- add active prepare button
- wire API route into Trade UI
- call API route from Trade UI
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
- write Supabase execution records from prepare shell wiring phase

No production readiness is claimed.

## Later Implementation Sequence

Recommended sequence:

1. Minimal hard-disabled Trade UI shell model/component invocation. Completed
   as `avanza_hard_disabled_trade_ui_prepare_shell_wiring_added_minimal_disabled`.
2. Safety audit. Completed as
   `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-safety-audit.md`.
3. Phase completion checkpoint. Completed as
   `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-phase-completion-checkpoint.md`.
4. Explicit internal/dev-only visible disabled shell plan. Completed as
   `docs/avanza-explicit-internal-visible-disabled-prepare-shell-plan.md`.
5. Explicit internal/dev-only visible disabled shell implementation.
6. Only after that, guarded API route call planning.

Every step must keep API route calls, localhost calls, bridge calls,
Avanza/browser control, fill, review, confirmation, submit, order,
credential/session handling, and Supabase writes forbidden unless a later
checkpoint explicitly scopes and audits that next boundary.
