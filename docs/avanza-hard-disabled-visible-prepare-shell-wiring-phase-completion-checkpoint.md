# Avanza Hard-Disabled Visible Prepare Shell Wiring Phase Completion Checkpoint

Status: `avanza_hard_disabled_visible_prepare_shell_wiring_phase_complete`

## Current Status

The minimal hard-disabled visible prepare shell wiring phase is complete.

The wiring exists in `app/trade-app.tsx` as hidden/default-off metadata only.
The safety audit exists in
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-safety-audit.md`.

The pure visible shell helper/model exists in:

- `lib/avanza-explicit-internal-visible-disabled-prepare-shell.ts`

## Default Behavior

The default Trade UI remains visually unchanged:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- visible shell invocation exists only inside the hard-disabled/default-off branch
- `visibleShellEnabled` is false by default
- mode is hidden by default
- visible shell output is hidden/disabled metadata only
- no visible shell renders in normal/default UI
- no shell UI renders by default
- no prepare UI renders by default

## Safety Boundary

This completed phase adds no:

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

Semi-auto human confirmation remains mandatory:

- `userMustConfirm: true`
- `finalHumanClickRequired: true`

No production readiness is claimed.

## API Route Boundary

The disabled local-only API route remains separate:

- `app/api/dev/avanza/fill-only/stub/route.ts`
- default status remains `api_stub_disabled`
- the route is not wired into Trade UI
- no Trade UI API route call exists

## Next Phase

The next phase is planning-only:

- `docs/avanza-guarded-api-route-call-intent-plan.md`

That phase may plan a future internal/dev-only API route call intent model, but
must still forbid route calls, localhost calls, bridge calls, fetch, polling,
Avanza/browser control, real fill, order/review/confirm/submit behavior,
credential/session handling, and Supabase execution writes.

The pure guarded API route call intent model/helper now exists at
`lib/avanza-guarded-api-route-call-intent.ts`. It remains explicit-input only,
is not wired into Trade UI, is not wired into the dev QA route, does not import
or call the disabled API route, and adds no active controls, fetch, localhost,
bridge, Avanza/browser, real fill, order behavior, credential/session handling,
or Supabase execution writes.

The guarded API route call intent fixture/harness visibility layer now exists:

- `lib/avanza-guarded-api-route-call-intent-fixtures.ts`
- `components/execution/AvanzaGuardedApiRouteCallIntentHarness.tsx`
- fixture/model-only section in `app/dev/avanza-visual-qa/page.tsx`

The section remains dev QA fixture-only, unlinked from main navigation, unwired
from Trade UI, and non-executing.

The guarded API route call intent visibility phase completion checkpoint is
recorded in
`docs/avanza-guarded-api-route-call-intent-visibility-phase-completion-checkpoint.md`.

The next hard-disabled Trade UI API call intent wiring plan is recorded in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-plan.md`. It was
implemented as minimal hidden/default-off metadata only and must not add route
calls, fetch, localhost, bridge, Avanza/browser control, real fill, order
behavior, credential/session handling, or Supabase writes.

The minimal hard-disabled Trade UI API call intent metadata wiring has now been
implemented in `app/trade-app.tsx` as the follow-up to that plan. It invokes
`buildAvanzaGuardedApiRouteCallIntent(...)` only inside the same
hard-disabled/default-off branch, with `apiCallIntentEnabled: false` and
`mode: "disabled"`, and defaults to `api_call_intent_disabled`.

That wiring still renders no API call intent UI, does not reference the disabled
API route path, does not call the API route, and adds no fetch, localhost,
bridge, polling, Avanza/browser, real fill, order, review, confirmation,
submit, credential/session, or Supabase behavior.

The focused safety audit for that follow-up is recorded in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-safety-audit.md`.
It confirms the API call intent metadata remains disabled by default,
branch-only, visually inert, and non-executing.
