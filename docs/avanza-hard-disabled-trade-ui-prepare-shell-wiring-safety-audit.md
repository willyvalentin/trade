# Avanza Hard-Disabled Trade UI Prepare Shell Wiring Safety Audit

Date: 2026-07-05

Audit status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_safety_audit_passed`

Audit document:
`docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-safety-audit.md`

## Scope

This audit covers the minimal hard-disabled Trade UI prepare shell wiring in
`app/trade-app.tsx`.

The audit confirms:

- `app/trade-app.tsx` contains minimal hard-disabled prepare shell wiring
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- shell model invocation exists only inside the hard-disabled/default-off branch
- passive shell component render exists only inside the hard-disabled/default-off branch
- passive shell render is guarded by `canRenderComponent`
- `shellEnabled` is false by default
- `componentEnabled` is false by default
- shell output is hidden/disabled metadata only
- default Trade UI remains visually unchanged
- no shell UI renders by default
- no prepare UI renders by default

## Branch Isolation

The prepare shell wiring is inside the existing disabled/default-off branch
guarded by `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`.

The branch builds:

- a disabled prepare intent with `prepareEnabled: false`
- a hidden disabled internal prepare shell with `shellEnabled: false`
- a passive prepare shell component model with `componentEnabled: false`
- a passive component render guarded by `canRenderComponent`

Because the guard remains false by default and `canRenderComponent` is false by
default, the shell cannot render in the default Trade UI.

## API Route Boundary

The disabled local-only API route was not changed by this wiring task:

- `app/api/dev/avanza/fill-only/stub/route.ts`

The API route still returns `api_stub_disabled` by default.

`app/trade-app.tsx` does not reference the API route path and does not call the
API route from Trade UI.

## UI Boundary

The audit confirms:

- no prepare button exists
- no active handoff button exists
- no buy/sell CTA exists
- no shell UI renders by default
- no prepare UI renders by default
- default Trade UI remains visually unchanged

## Runtime Boundary

The wiring adds no:

- localhost calls
- bridge calls
- fetch/polling/execution behavior
- Avanza/browser control
- real fill behavior
- order behavior
- review/confirm/submit behavior
- credential/session/BankID/cookies/storage handling
- Supabase execution write

Semi-auto human confirmation remains mandatory.

## Required Safety Flags

The default hidden shell and passive component path keeps:

- `shellEnabled: false`
- `componentEnabled: false`
- `canRenderShell: false`
- `canRenderComponent: false`
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
- `controlsEnabled: false`
- `gateLocked: true`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`

## Safety Result

The minimal hard-disabled Trade UI prepare shell wiring is isolated, unreachable
by default, hidden/disabled by default, and incapable of API-route, bridge,
browser, fill, order, review, confirm, submit, credential, or Supabase behavior.

This audit is followed by:

- `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-phase-completion-checkpoint.md`
- `docs/avanza-explicit-internal-visible-disabled-prepare-shell-plan.md`
- `lib/avanza-explicit-internal-visible-disabled-prepare-shell.ts`

The explicit internal visible disabled shell helper is model-only. The
visibility layer kept it unwired from Trade UI; the follow-up hard-disabled
visible shell wiring now invokes it only inside the existing disabled/default-off
Trade UI branch with `mode: "hidden"` and `visibleShellEnabled: false`.

The explicit internal visible disabled shell now also has static fixtures, an
isolated harness, and a fixture/model-only section on the dev QA route. This
route visibility is not normal Trade UI wiring, is not linked from main
navigation, does not call the disabled API route, and keeps
`visibleShellEnabled: false` plus `canRenderVisibleShell: false` for the default
fixture. Every rendered state keeps `canClickPrepare`, `canCallApiRoute`,
`canCallBridge`, `canFetchLocalhost`, `canControlBrowser`, `canClickReview`,
`canClickConfirm`, and `canSubmitOrder` false, with controls disabled and the
gate locked.

The visibility layer is closed in
`docs/avanza-explicit-internal-visible-disabled-prepare-shell-visibility-phase-completion-checkpoint.md`.
The hard-disabled visible shell wiring phase is tracked in
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-plan.md` and remains
limited to hidden/disabled metadata behind the existing default-off branch.

The follow-up hard-disabled visible shell wiring safety audit is recorded in
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-safety-audit.md`. It
confirms the visible shell metadata invocation stays hidden by default with
`visibleShellEnabled: false`, mode hidden, `canRenderVisibleShell: false`, no
normal/default UI render, no Trade UI API route reference or call, and no
localhost/bridge/fetch/polling, Avanza/browser, fill, order,
credential/session, or Supabase behavior.

No production readiness is claimed.
