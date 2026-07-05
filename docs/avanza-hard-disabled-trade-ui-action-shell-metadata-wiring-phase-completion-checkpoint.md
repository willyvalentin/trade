# Avanza Hard-Disabled Trade UI Action Shell Metadata Wiring Phase Completion Checkpoint

Status: `avanza_hard_disabled_trade_ui_action_shell_metadata_wiring_phase_complete`

## Current Status

The minimal hard-disabled Trade UI action shell metadata wiring exists in
`app/trade-app.tsx`.

The completed phase includes:

- pure explicit internal/dev-only disabled action shell model/helper:
  `lib/avanza-explicit-internal-disabled-action-shell.ts`
- hard-disabled Trade UI action shell metadata wiring plan:
  `docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-plan.md`
- hard-disabled Trade UI action shell metadata wiring safety audit:
  `docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-safety-audit.md`

## Default Behavior

The Trade UI default remains locked:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- action shell model invocation exists only inside the hard-disabled/default-off
  branch
- `actionShellEnabled` is `false` by default
- mode is `"hidden"` by default
- output is hidden/disabled metadata only
- default Trade UI remains visually unchanged
- no action shell UI renders by default
- no API call intent UI renders by default
- no visible shell renders in normal/default UI
- no shell UI renders by default
- no prepare UI renders by default

## Passive Component Boundary

The passive disabled action shell component remains isolated:

- `components/execution/AvanzaPassiveDisabledActionShell.tsx` exists
- it is not imported by `app/trade-app.tsx`
- it is not rendered in Trade UI
- it is rendered only in the isolated harness/dev QA fixture route

## Safety Guarantees

This phase added no:

- active handoff
- active prepare button
- buy/sell CTA
- action shell `onClick` handler
- API route call
- fetch
- localhost calls
- bridge calls
- polling
- Avanza/browser control
- real fill behavior
- order/click/review/final/submit behavior
- credential/session/BankID/cookies/storage handling
- Supabase write

The disabled local-only API route remains separate:

- `app/api/dev/avanza/fill-only/stub/route.ts` was not changed by this phase
- the API route returns `api_stub_disabled` by default
- the API route is not wired into Trade UI

Confirmation boundaries remain:

- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- semi-auto human confirmation remains mandatory

## Production Boundary

No production readiness is claimed.

## Next Phase

The next phase is planning a pure guarded fetch intent model:

- `docs/avanza-guarded-fetch-intent-plan.md`

That future phase must not add fetch, must not call the API route, must not
reference the route path from `app/trade-app.tsx`, must not add active UI, and
must continue to forbid localhost/bridge calls, Avanza/browser behavior, real
fill, order behavior, credential/session handling, and Supabase writes.

## Guarded Fetch Intent Helper Status

The guarded fetch intent phase has now started with
`lib/avanza-guarded-fetch-intent.ts` as a pure explicit-input helper. It is not
wired into `app/trade-app.tsx`, not rendered on the dev QA route, does not call
the disabled API route, does not fetch, and adds no route path, localhost call,
bridge call, Avanza/browser behavior, fill, order, credential/session handling,
or Supabase write.

The guarded fetch intent visibility layer now adds
`lib/avanza-guarded-fetch-intent-fixtures.ts`,
`components/execution/AvanzaGuardedFetchIntentHarness.tsx`, and a
fixture/model-only section on `app/dev/avanza-visual-qa/page.tsx`. The section
remains unlinked from main navigation and still does not wire fetch intent into
Trade UI, call the API route, fetch, call localhost, call bridge, control
Avanza/browser state, fill, review, confirm, submit, handle credentials, or
write Supabase execution records.

The guarded fetch intent visibility layer is closed in
`docs/avanza-guarded-fetch-intent-visibility-phase-completion-checkpoint.md`.
The next planning-only phase is
`docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-plan.md`,
which permits only future hard-disabled/default-off metadata invocation and
still forbids normal/default UI rendering, active controls, route calls, fetch,
route path usage from Trade UI, localhost/bridge calls, Avanza/browser
behavior, fill, order behavior, credential/session handling, and Supabase
writes.

## Follow-Up Fetch Intent Metadata Wiring

The minimal hard-disabled Trade UI fetch intent metadata invocation has now been
added to the same disabled/default-off branch. It uses
`buildAvanzaGuardedFetchIntent(...)` with `fetchIntentEnabled: false` and
`mode: "hidden"`, produces `fetch_intent_hidden` metadata only, and renders no
fetch intent UI in normal/default Trade UI.

No API route call, fetch, route path reference, active controls,
Avanza/browser behavior, order/review/confirm/submit behavior,
credential/session handling, or Supabase execution write was added.

The focused follow-up safety audit is recorded in
`docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-safety-audit.md`.
