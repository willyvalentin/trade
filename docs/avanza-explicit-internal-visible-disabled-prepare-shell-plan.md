# Avanza Explicit Internal Visible Disabled Prepare Shell Plan

Date: 2026-07-05

Plan status:
`avanza_explicit_internal_visible_disabled_prepare_shell_planned`

Implementation status:
`avanza_explicit_internal_visible_disabled_prepare_shell_model_added`

Hard-disabled wiring status:
`avanza_hard_disabled_visible_prepare_shell_wiring_added_minimal_disabled`

## Purpose

Plan a future explicit internal/dev-only visible disabled prepare shell.

The shell may become visible only through an explicit internal/dev-only guard.
Even when visible, the shell must remain disabled. It must not create an active
prepare button, call the API route, call localhost, call a bridge, control a
browser, fill a form, submit an order, or perform broker action.

Final human confirmation remains mandatory.

## Phase Boundary

This is planning only.

The pure model/helper now exists:

- `lib/avanza-explicit-internal-visible-disabled-prepare-shell.ts`

The helper is explicit-input only and models hidden, disabled, blocked,
ready-internal-disabled, error, and unknown visible disabled shell states. It
does not enable shell visibility, does not change `app/trade-app.tsx`, does not
change the disabled API route, and does not wire the API route into
normal/default Trade UI.

Default Trade UI must remain visually unchanged.

The normal/default Trade UI must remain unchanged.

## Future Allowed Shape

A later implementation may introduce a separate explicit internal/dev-only
visibility guard.

The guard must be false by default.

The visible shell may render only when all of these are true:

- the base hard-disabled/default-off branch is explicitly enabled in a
  controlled internal/dev-only path
- the explicit visible shell guard is true
- the shell model remains disabled
- the component model remains disabled

The button must remain disabled and non-clickable:

- no `onClick` handler
- no API route call
- no fetch
- no route path reference in the normal/default path

## Required Copy

If a visible disabled shell is added later, it must show:

- Internal preview
- Disabled
- No broker action
- No order submission
- Final human confirmation required
- Not production ready
- Manual confirmation required in Avanza

## Required Future Statuses

The future visible disabled shell guard/model should support:

- `visible_shell_disabled`
- `visible_shell_blocked`
- `visible_shell_ready_internal_disabled`
- `visible_shell_error`

## Required Safety Flags

The future visible disabled shell path must keep:

- `visibleShellEnabled: false` by default
- `canRenderVisibleShell: false` by default
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

This visible disabled shell phase must not:

- add an active prepare button in the planning phase
- enable the shell by default
- wire the API route into normal Trade UI
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
- write Supabase execution records from the visible shell phase

No production readiness is claimed.

## Later Implementation Sequence

Recommended sequence:

1. Pure explicit visible disabled shell guard/model. Completed as
   `lib/avanza-explicit-internal-visible-disabled-prepare-shell.ts`.
2. Fixtures/harness. Completed as
   `lib/avanza-explicit-internal-visible-disabled-prepare-shell-fixtures.ts`
   and
   `components/execution/AvanzaExplicitInternalVisibleDisabledPrepareShellHarness.tsx`.
3. Dev QA route section. Completed as a fixture/model-only section in
   `app/dev/avanza-visual-qa/page.tsx`.
4. Hard-disabled Trade UI visible shell wiring. Completed as a
   hidden/default-off model invocation in `app/trade-app.tsx` with
   `visibleShellEnabled: false`.
5. Safety audit. Completed in
   `docs/avanza-hard-disabled-visible-prepare-shell-wiring-safety-audit.md`.
6. Phase completion checkpoint. Completed in
   `docs/avanza-hard-disabled-visible-prepare-shell-wiring-phase-completion-checkpoint.md`.
7. Only after that, guarded API route call planning. Started in
   `docs/avanza-guarded-api-route-call-intent-plan.md`.

Every step must keep API route calls, localhost calls, bridge calls,
Avanza/browser control, fill, review, confirmation, submit, order,
credential/session handling, and Supabase writes forbidden unless a later
checkpoint explicitly scopes and audits that next boundary.

## Fixture/Harness Route Visibility Status

The explicit internal visible disabled prepare shell now has static fixtures,
an isolated harness, and a dev-only visual QA route section. The fixtures cover
hidden, disabled, blocked, ready-internal-disabled, error, unknown, safe BUY,
safe SELL, missing base, and invalid base scenarios.

This visibility layer remains fixture/model-only. It is not wired into
`app/trade-app.tsx`, does not change the disabled local-only API route, does
not enable a visible shell in normal/default UI, and adds no active prepare
button, handoff, buy/sell CTA, API route call, localhost call, bridge call,
fetch/polling, Avanza/browser control, real fill, order/click/review/final/
submit behavior, credential/session handling, or Supabase write.

## Phase Completion And Next Plan

The visibility phase is closed in
`docs/avanza-explicit-internal-visible-disabled-prepare-shell-visibility-phase-completion-checkpoint.md`.

The follow-up hard-disabled wiring is recorded in
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-plan.md`. That wiring
remains behind the existing disabled/default-off Trade UI branch, keeps
`visibleShellEnabled: false` by default, renders no visible shell in
normal/default UI, and adds no active prepare button, click handler, API route
call, localhost/bridge/fetch/polling, Avanza/browser control, real fill, order
behavior, credential/session handling, or Supabase write.

The safety audit for that wiring is recorded in
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-safety-audit.md`. It
confirms the visible shell model invocation is hidden/default-off metadata only,
the disabled API route remains unchanged and unwired, and no active controls,
API route call, localhost/bridge/fetch/polling, Avanza/browser control, real
fill, order behavior, credential/session handling, or Supabase write was added.

The hard-disabled visible shell Trade UI wiring phase is closed in
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-phase-completion-checkpoint.md`.

The guarded API route call intent follow-up is planned in
`docs/avanza-guarded-api-route-call-intent-plan.md`. It remains model-only
planning and must not call the disabled API route, add fetch, call localhost,
call bridge, control Avanza/browser, fill, submit, handle credentials/session
state, or write Supabase execution records.
