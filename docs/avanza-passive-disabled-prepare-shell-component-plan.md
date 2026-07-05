# Avanza Passive Disabled Prepare Shell Component Plan

Date: 2026-07-05

Plan status:
`avanza_passive_disabled_prepare_shell_component_planned`

Implementation status:
`avanza_passive_disabled_prepare_shell_component_fixtures_harness_added`

Dev QA route section status:
`avanza_passive_disabled_prepare_shell_dev_route_section_added_fixture_model_only`

Phase completion status:
`avanza_passive_disabled_prepare_shell_component_phase_complete`

Next hard-disabled wiring plan status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_planned`

Hard-disabled Trade UI wiring status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_added_minimal_disabled`

Hard-disabled Trade UI wiring safety audit status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_safety_audit_passed`

Hard-disabled Trade UI wiring phase completion status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_phase_complete`

Explicit internal visible disabled shell plan status:
`avanza_explicit_internal_visible_disabled_prepare_shell_planned`

## Purpose

Plan a passive disabled prepare shell component.

The component may display disabled internal prepare shell metadata, but it must
not create an active prepare button. It must not call the API route, call
localhost, call a bridge, control a browser, submit an order, or perform broker
action.

The component must be fixture/model-only first. Final human confirmation remains
mandatory.

## Future Component Behavior

The component layer now exists as isolated, fixture/model-only artifacts:

- `components/execution/AvanzaPassiveDisabledPrepareShell.tsx`
- `lib/avanza-passive-disabled-prepare-shell-fixtures.ts`
- `components/execution/AvanzaPassiveDisabledPrepareShellHarness.tsx`

The component accepts explicit shell model/result props only. It does not call
the API route, call localhost, call a bridge, call fetch, read app state, submit
forms, or perform broker action.

Minimal hard-disabled Trade UI wiring now references the component only inside
the existing disabled/default-off branch in `app/trade-app.tsx`. The branch
keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` as `false`, passes a
hidden shell model, keeps `shellEnabled: false`, keeps `componentEnabled:
false`, keeps `canRenderShell: false`, keeps `canRenderComponent: false`, and
renders no shell UI by default.

The isolated harness is now rendered on the dev-only visual QA route as a
fixture/model-only section:

- `app/dev/avanza-visual-qa/page.tsx`

The route section uses only static fixtures from
`lib/avanza-passive-disabled-prepare-shell-fixtures.ts`.

The completed phase is closed in:

- `docs/avanza-passive-disabled-prepare-shell-component-phase-completion-checkpoint.md`

The next hard-disabled Trade UI shell wiring phase is planned in:

- `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-plan.md`
- `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-safety-audit.md`

The component may:

- accept explicit shell model/result props only
- render hidden, disabled, blocked, ready-internal-disabled, and error states
- render a disabled visual shell only
- display shell metadata and locked safety flags

The component must not:

- build shell state internally unless explicitly passed safe fixture/model data
- include an `onClick` handler
- render an active button
- submit a form
- fetch
- call a route
- call a bridge
- perform broker action
- display production-ready copy

## Required Future Visible Copy

If the component is visible, it must show:

- Internal preview
- Disabled
- No broker action
- No order submission
- Final human confirmation required

## Required Future Visible Metadata

The component should show:

- shell status
- label/reason
- side
- ticker/symbol
- quantity
- orderType
- limitPrice if present
- accountLabel if safe/present
- warnings
- blockedReasons
- userMustConfirm
- finalHumanClickRequired
- safety flags

## Required Future Statuses

The component fixture model supports:

- `shell_component_hidden`
- `shell_component_disabled`
- `shell_component_blocked`
- `shell_component_ready_internal_disabled`
- `shell_component_error`

## Required Safety Flags

The component keeps:

- `componentEnabled: false` by default
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
- `canHandleCredentials: false`
- `canReadCookies: false`
- `canReadBankId: false`
- `canWriteSupabaseExecution: false`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `controlsEnabled: false`
- `gateLocked: true`

## Absolute Forbidden Behavior

The passive disabled prepare shell component phase must not:

- add active prepare button behavior in the planning phase
- wire the component into `app/trade-app.tsx` in this task
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
- write Supabase execution records from prepare shell component phase

No production readiness is claimed.

## Later Implementation Sequence

Recommended sequence:

1. Passive disabled prepare shell component. Completed as `components/execution/AvanzaPassiveDisabledPrepareShell.tsx`.
2. Component fixtures. Completed as `lib/avanza-passive-disabled-prepare-shell-fixtures.ts`.
3. Isolated harness. Completed as `components/execution/AvanzaPassiveDisabledPrepareShellHarness.tsx`.
4. Dev QA route fixture/model-only section. Completed in `app/dev/avanza-visual-qa/page.tsx`.
5. Phase completion checkpoint. Completed as `docs/avanza-passive-disabled-prepare-shell-component-phase-completion-checkpoint.md`.
6. Hard-disabled Trade UI shell wiring plan. Completed as `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-plan.md`.
7. Minimal hard-disabled Trade UI shell wiring. Completed as hidden/default-off
   branch-only invocation.
8. Safety audit. Completed as `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-safety-audit.md`.
9. Hard-disabled wiring phase completion checkpoint. Completed as
   `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-phase-completion-checkpoint.md`.
10. Explicit internal/dev-only visible disabled shell plan. Completed as
    `docs/avanza-explicit-internal-visible-disabled-prepare-shell-plan.md`.
11. Explicit internal/dev-only visible disabled shell implementation, only after
    audit and planning remain satisfied.
12. Guarded API route call planning, only after the disabled shell remains audited.

Every step must keep route calls, localhost calls, bridge calls,
Avanza/browser control, fill, review, confirmation, submit, order,
credential/session handling, and Supabase writes forbidden.
