# Avanza Hard-Disabled Visible Prepare Shell Wiring Safety Audit

Status: `avanza_hard_disabled_visible_prepare_shell_wiring_safety_audit_passed`

## Scope

This audit covers the minimal hard-disabled visible shell Trade UI wiring in
`app/trade-app.tsx`.

The wiring imports and invokes the pure explicit internal/dev-only visible
disabled prepare shell helper:

- `lib/avanza-explicit-internal-visible-disabled-prepare-shell.ts`

The invocation exists only inside the existing hard-disabled/default-off branch.
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`.

## Branch Isolation

Confirmed:

- `app/trade-app.tsx` contains minimal hard-disabled visible shell wiring
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- visible shell model invocation exists only inside the hard-disabled/default-off branch
- `visibleShellEnabled` is false by default
- mode is hidden by default
- visible shell output is hidden/disabled metadata only
- default Trade UI remains visually unchanged
- no visible shell renders in normal/default UI
- no shell UI renders by default
- no prepare UI renders by default

The branch builds hidden/default-off metadata only. The resulting visible shell
metadata is not rendered in normal/default UI.

## API Route Boundary

Confirmed:

- no API route call exists from Trade UI
- `app/trade-app.tsx` does not reference the API route path
- `app/api/dev/avanza/fill-only/stub/route.ts` was not changed by this wiring task
- the API route still returns `api_stub_disabled` by default

## UI And Execution Boundary

Confirmed:

- no prepare button exists
- no active handoff button exists
- no buy/sell CTA exists
- no localhost calls
- no bridge calls
- no fetch/polling/execution behavior
- no Avanza/browser control
- no real fill behavior
- no order behavior
- no review/confirm/submit behavior
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write

Semi-auto human confirmation remains mandatory:

- `userMustConfirm: true`
- `finalHumanClickRequired: true`

## Required Safety Flags

The default hidden visible shell model keeps:

- `visibleShellEnabled: false`
- `canRenderVisibleShell: false`
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

## Safety Result

The minimal hard-disabled visible shell Trade UI wiring is isolated, unreachable
by default, hidden by default, and incapable of API-route, bridge, browser,
fill, order, review, confirm, submit, credential, or Supabase behavior.

No production readiness is claimed.

## Phase Completion And Next Plan

The phase completion checkpoint is recorded in
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-phase-completion-checkpoint.md`.

The next planning-only phase is recorded in
`docs/avanza-guarded-api-route-call-intent-plan.md`. It may define a future
internal/dev-only API route call intent model, but must not call the disabled
route, add fetch, call localhost, call a bridge, control Avanza/browser, fill a
form, submit an order, handle credentials/session state, or write Supabase
execution records.

The pure model/helper for that phase now exists at
`lib/avanza-guarded-api-route-call-intent.ts`. It remains model-only,
explicit-input only, unwired from Trade UI and the disabled API route, and
incapable of route calls, fetch, localhost/bridge calls, browser control, fill,
review, confirmation, submit, order, credential/session handling, or Supabase
writes.

The fixture/harness visibility layer for the guarded API route call intent now
exists as `lib/avanza-guarded-api-route-call-intent-fixtures.ts`,
`components/execution/AvanzaGuardedApiRouteCallIntentHarness.tsx`, and a
fixture/model-only dev QA route section in
`app/dev/avanza-visual-qa/page.tsx`. The section remains unlinked from main
navigation, does not wire anything into Trade UI, does not call the disabled
API route, and adds no fetch, localhost, bridge, polling, Avanza/browser
control, real fill, order behavior, credential/session handling, or Supabase
writes.

The guarded API route call intent visibility phase is closed in
`docs/avanza-guarded-api-route-call-intent-visibility-phase-completion-checkpoint.md`.
The follow-up hard-disabled Trade UI API call intent wiring phase is planned in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-plan.md`. That plan
keeps future wiring hidden/default-off, metadata-only, non-fetching,
non-clicking, non-executing, and separate from route calls, localhost, bridge,
Avanza/browser, fill, order, credential/session, and Supabase behavior.

## Follow-Up Wiring Safety Note

The minimal hard-disabled Trade UI API call intent metadata wiring has now been
added in `app/trade-app.tsx`.

Safety result:

- invocation exists only inside the existing hard-disabled/default-off branch
- `apiCallIntentEnabled` remains `false`
- `mode` remains `disabled`
- default output remains `api_call_intent_disabled`
- no API call intent UI renders by default
- no disabled API route path is referenced from Trade UI
- no API route call, fetch, localhost, bridge, polling, Avanza/browser, real
  fill, review, confirmation, submit, order, credential/session, or Supabase
  behavior was added

The focused safety audit for this follow-up is recorded in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-safety-audit.md`.
It confirms the guarded API route call intent remains hard-disabled,
branch-only, metadata-only, visually inert, and non-executing.

## Related Checkpoints

- `docs/avanza-hard-disabled-visible-prepare-shell-wiring-plan.md`
- `docs/avanza-explicit-internal-visible-disabled-prepare-shell-visibility-phase-completion-checkpoint.md`
- `docs/avanza-explicit-internal-visible-disabled-prepare-shell-plan.md`
- `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-phase-completion-checkpoint.md`
- `docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-safety-audit.md`
- `docs/avanza-hard-disabled-visible-prepare-shell-wiring-phase-completion-checkpoint.md`
- `docs/avanza-guarded-api-route-call-intent-plan.md`
