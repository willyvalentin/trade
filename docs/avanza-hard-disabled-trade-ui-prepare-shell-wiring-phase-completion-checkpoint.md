# Avanza Hard-Disabled Trade UI Prepare Shell Wiring Phase Completion Checkpoint

Date: 2026-07-05

Phase status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_phase_complete`

## Current Status

The hard-disabled Trade UI prepare shell wiring phase is complete.

This checkpoint closes the minimal default-off wiring step before any explicit
internal/dev-only visible disabled shell work.

## Completed Artifacts

Completed artifacts:

- minimal hard-disabled Trade UI prepare shell wiring in `app/trade-app.tsx`
- safety audit:
  `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-safety-audit.md`
- passive shell component:
  `components/execution/AvanzaPassiveDisabledPrepareShell.tsx`
- shell model/helper:
  `lib/avanza-disabled-internal-prepare-button-shell.ts`

## Branch Boundary

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`.

The shell model invocation exists only inside the hard-disabled/default-off
branch. The passive shell render exists only inside that branch and is guarded
by `canRenderComponent`; in other words, render is guarded by
`canRenderComponent`.

Default values remain:

- `shellEnabled: false`
- `componentEnabled: false`
- `canRenderShell: false`
- `canRenderComponent: false`
- render is guarded by `canRenderComponent`

Because the branch is default-off and the component model is non-renderable by
default, no shell UI renders by default and no prepare UI renders by default.

## Default Trade UI Behavior

Default Trade UI remains visually unchanged.

The shell output is hidden/disabled metadata only. It does not create a visible
shell, active handoff, active prepare button, buy/sell CTA, API route call, or
broker action.

## Safety Guarantees

The completed phase adds no:

- active handoff
- active prepare button
- buy/sell CTA
- API route call
- localhost calls
- bridge calls
- fetch/polling
- Avanza/browser control
- real fill behavior
- order/click/review/final/submit behavior
- credential/session/BankID/cookies/storage handling
- Supabase write

The disabled local-only API route remains unchanged:

- `app/api/dev/avanza/fill-only/stub/route.ts`

It still returns `api_stub_disabled` by default and is not wired into Trade UI.

## Human Confirmation

Semi-auto human confirmation remains mandatory:

- `userMustConfirm: true`
- `finalHumanClickRequired: true`

No production readiness is claimed.

## Next Phase

The next planned phase is explicit internal/dev-only visible disabled shell
planning:

- `docs/avanza-explicit-internal-visible-disabled-prepare-shell-plan.md`
- `lib/avanza-explicit-internal-visible-disabled-prepare-shell.ts`

That phase must remain disabled by default, internal/dev-only, non-clickable,
non-executing, and forbidden from API route calls, localhost calls, bridge
calls, Avanza/browser control, real fill behavior, order behavior,
credential/session handling, and Supabase writes.

The pure model/helper has been added as explicit-input model-only code. The
visibility layer kept it out of Trade UI. The follow-up hard-disabled visible
shell wiring now invokes it only inside the existing disabled/default-off
branch with `mode: "hidden"` and `visibleShellEnabled: false`; no visible shell
renders in normal/default UI.

The explicit internal visible disabled shell fixture visibility layer now
exists as:

- `lib/avanza-explicit-internal-visible-disabled-prepare-shell-fixtures.ts`
- `components/execution/AvanzaExplicitInternalVisibleDisabledPrepareShellHarness.tsx`
- fixture/model-only route section in `app/dev/avanza-visual-qa/page.tsx`

This does not change the completed hard-disabled Trade UI shell wiring. The
normal Trade UI remains visually unchanged, `shellEnabled` remains false by
default, no shell UI renders by default, and there is still no active prepare
button, active handoff, API route call, localhost/bridge/fetch/polling,
Avanza/browser control, fill, order, credential/session handling, or Supabase
write.

The explicit internal visible disabled shell visibility phase is now closed in
`docs/avanza-explicit-internal-visible-disabled-prepare-shell-visibility-phase-completion-checkpoint.md`.
The hard-disabled visible shell wiring plan is
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-plan.md`; it records the
minimal hidden/default-off model invocation and keeps normal Trade UI visually
unchanged, the visible shell guard false by default, and no active control, API
route call, localhost/bridge/fetch, Avanza/browser, fill, order,
credential/session, or Supabase behavior.

The safety audit for that visible shell wiring is
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-safety-audit.md`. It
confirms the visible shell helper is invoked only inside the hard-disabled
branch, `visibleShellEnabled` remains false, mode remains hidden, no visible
shell renders in normal/default UI, the disabled API route remains unchanged,
and no active control, API route call, localhost/bridge/fetch/polling,
Avanza/browser, fill, order, credential/session, or Supabase behavior was
added.
