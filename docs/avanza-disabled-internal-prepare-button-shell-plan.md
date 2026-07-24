# Avanza Disabled Internal Prepare Button Shell Plan

Date: 2026-07-05

Plan status:
`avanza_disabled_internal_prepare_button_shell_planned`

Model/helper status:
`avanza_disabled_internal_prepare_button_shell_model_added`

Fixture/harness status:
`avanza_disabled_internal_prepare_button_shell_fixtures_harness_added`

Dev QA route section status:
`avanza_disabled_internal_prepare_button_shell_dev_route_section_added_fixture_model_only`

Visibility phase completion status:
`avanza_disabled_internal_prepare_button_shell_visibility_phase_complete`

Passive component plan status:
`avanza_passive_disabled_prepare_shell_component_planned`

Passive component implementation status:
`avanza_passive_disabled_prepare_shell_component_fixtures_harness_added`

Hard-disabled Trade UI prepare shell wiring status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_added_minimal_disabled`

Hard-disabled Trade UI prepare shell wiring safety audit status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_safety_audit_passed`

## Purpose

Plan a future internal/dev-only disabled prepare button shell in Trade UI.

The shell may visually communicate a future prepare capability, but it must be
disabled by default and must not perform any broker action.

The shell must not:

- call the API route initially
- call localhost
- call bridge
- call Avanza/browser
- fill a form
- submit an order

Final human confirmation remains mandatory.

## Implemented Model/Helper

The first phase is now implemented as a pure explicit-input model/helper:

- `lib/avanza-disabled-internal-prepare-button-shell.ts`
- `buildAvanzaDisabledInternalPrepareButtonShell(...)`

The helper accepts only explicit inputs:

- `shellEnabled`
- `mode`
- `prepareIntent`
- `now`
- `shellId`

Default output remains hidden:

- `shellEnabled: false`
- `mode: "hidden"`
- `status: "prepare_shell_hidden"`
- `canRenderShell: false`

The helper maps explicit prepare intent metadata into disabled shell states only:

- `prepare_shell_hidden`
- `prepare_shell_disabled`
- `prepare_shell_blocked`
- `prepare_shell_ready_internal_disabled`
- `prepare_shell_error`
- `unknown`

The pure model/helper step added no React component, no fixture harness, no dev
route section, no Trade UI wiring, no API route call, no active prepare button,
and no broker behavior.

## Implemented Fixtures, Harness, And Route Section

The fixture/model-only visibility layer now exists:

- `lib/avanza-disabled-internal-prepare-button-shell-fixtures.ts`
- `components/execution/AvanzaDisabledInternalPrepareButtonShellHarness.tsx`
- dev QA route section in `app/dev/avanza-visual-qa/page.tsx`

The fixtures cover:

- `prepare_shell_hidden`
- `prepare_shell_disabled`
- `prepare_shell_blocked`
- `prepare_shell_ready_internal_disabled`
- `prepare_shell_error`
- `unknown`
- safe BUY internal preview shell
- safe SELL internal preview shell
- disabled prepare intent
- blocked prepare intent
- ready internal prepare intent
- failed prepare intent
- missing prepare intent
- invalid prepare intent

The harness is fixture-only and explicit-input-only. It displays shell metadata,
copy lines, warnings, blocked reasons, and locked safety flags. It does not
render a real prepare button and does not include active controls.

The dev QA route section is fixture/model-only, remains unlinked from main
navigation, and does not read Trade UI state. It does not wire the shell into
Trade UI or the disabled API route.

This visibility layer added no API route call, localhost call, bridge call,
polling, Avanza/browser control, real fill, review, confirmation, submit, order,
credential/session handling, or Supabase execution write.

`app/trade-app.tsx` and `app/api/dev/avanza/fill-only/stub/route.ts` remain
unchanged by this visibility layer.

The visibility layer is closed in:

- `docs/avanza-disabled-internal-prepare-button-shell-visibility-phase-completion-checkpoint.md`

The next phase is planned in:

- `docs/avanza-passive-disabled-prepare-shell-component-plan.md`

That passive component phase now has isolated fixture/model-only artifacts:

- `components/execution/AvanzaPassiveDisabledPrepareShell.tsx`
- `lib/avanza-passive-disabled-prepare-shell-fixtures.ts`
- `components/execution/AvanzaPassiveDisabledPrepareShellHarness.tsx`
- fixture/model-only dev QA route section in `app/dev/avanza-visual-qa/page.tsx`
- phase completion checkpoint: `docs/avanza-passive-disabled-prepare-shell-component-phase-completion-checkpoint.md`
- next wiring plan: `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-plan.md`

The passive component accepts explicit shell model/result props only and renders
a disabled visual shell. It does not import the disabled API route, does not
create an active prepare button, and does not add API route calls, localhost,
bridge, fetch/polling, Avanza/browser, real fill, review, confirmation, submit,
order, credential/session handling, or Supabase writes. The dev QA route
section is fixture/model-only and remains unlinked from main navigation.

The hard-disabled Trade UI prepare shell wiring now invokes the shell helper and
passive component model inside the existing disabled/default-off branch only.
It requires `shellEnabled: false`, `componentEnabled: false`,
`canRenderShell: false`, and `canRenderComponent: false` by default, with no
visible shell, active button, route call, or active controls by default.

The safety audit is recorded in
`docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-safety-audit.md`. It
confirms the wiring remains hidden/disabled by default and adds no API route
call, localhost, bridge, fetch/polling, Avanza/browser control, real fill,
order, review, confirmation, submit, credential/session handling, or Supabase
write.

## Future Allowed Shape

A later phase may create a passive component or small Trade UI section.

Allowed shape:

- render only inside the existing hard-disabled/default-off branch initially
- no default visible UI
- no active click handler
- disabled button only if explicitly rendered in a future internal/dev-only path
- may display prepare intent status as metadata
- may display prepare intent safety flags as metadata
- must not display as ready for production

Required copy if a future disabled shell is rendered:

- internal preview
- disabled
- no broker action
- no order submission
- final human confirmation required

## Future Statuses

The future shell model should support:

- `prepare_shell_hidden`
- `prepare_shell_disabled`
- `prepare_shell_blocked`
- `prepare_shell_ready_internal_disabled`
- `prepare_shell_error`

## Required Safety Flags

The future shell must keep:

- `shellEnabled: false` by default
- `canRenderShell: false` by default
- `canClickPrepare: false`
- `canCallApiRoute: false`
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

## Absolute Forbidden Behavior

The disabled internal prepare button shell phase must not:

- add active prepare button behavior in the planning phase
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
- write Supabase execution records from prepare button shell phase

No production readiness is claimed.

## Later Implementation Sequence

Recommended sequence:

1. Pure disabled internal prepare button shell model/helper. Completed as `lib/avanza-disabled-internal-prepare-button-shell.ts`.
2. Fixtures and isolated harness. Completed as `lib/avanza-disabled-internal-prepare-button-shell-fixtures.ts` and `components/execution/AvanzaDisabledInternalPrepareButtonShellHarness.tsx`.
3. Dev QA route fixture/model-only section. Completed in `app/dev/avanza-visual-qa/page.tsx`.
4. Passive disabled component shell. Completed as `components/execution/AvanzaPassiveDisabledPrepareShell.tsx`, `lib/avanza-passive-disabled-prepare-shell-fixtures.ts`, and `components/execution/AvanzaPassiveDisabledPrepareShellHarness.tsx`.
5. Dev QA route fixture/model-only section. Completed in `app/dev/avanza-visual-qa/page.tsx`.
6. Passive disabled component phase completion checkpoint. Completed as `docs/avanza-passive-disabled-prepare-shell-component-phase-completion-checkpoint.md`.
7. Hard-disabled Trade UI shell wiring plan. Completed as `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-plan.md`.
8. Minimal hard-disabled Trade UI shell wiring. Completed as hidden/default-off
   branch-only invocation.
9. Safety audit. Completed as
   `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-safety-audit.md`.
10. Hard-disabled wiring phase completion checkpoint. Completed as
    `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-phase-completion-checkpoint.md`.
11. Explicit internal/dev-only visible disabled shell plan. Completed as
    `docs/avanza-explicit-internal-visible-disabled-prepare-shell-plan.md`.
12. Explicit internal/dev-only visible disabled shell implementation, only after
    audit and planning remain satisfied.
13. Guarded API route call planning, only after the disabled shell remains audited.

Every step must keep route calls, localhost calls, bridge calls,
Avanza/browser control, fill, review, confirmation, submit, order,
credential/session handling, and Supabase writes forbidden.
