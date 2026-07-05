# Avanza Hard-Disabled Trade UI API Call Intent Wiring Phase Completion Checkpoint

Status: `avanza_hard_disabled_trade_ui_api_call_intent_wiring_phase_complete`

## Current Status

The minimal hard-disabled Trade UI API call intent wiring phase is complete.

Completed artifacts:

- minimal hard-disabled Trade UI API call intent wiring in `app/trade-app.tsx`
- pure guarded API route call intent model/helper:
  `lib/avanza-guarded-api-route-call-intent.ts`
- focused safety audit:
  `docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-safety-audit.md`

## Default Behavior

The default Trade UI remains unchanged and disabled:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- `buildAvanzaGuardedApiRouteCallIntent(...)` invocation exists only inside the
  hard-disabled/default-off branch
- `apiCallIntentEnabled` is false by default
- `mode` is disabled by default
- output is `api_call_intent_disabled` metadata only
- default Trade UI remains visually unchanged
- no API call intent UI renders by default
- no visible shell renders in normal/default UI
- no shell UI renders by default
- no prepare UI renders by default

## Safety Guarantees

The completed phase adds no:

- active handoff
- active prepare button
- buy/sell CTA
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

Semi-auto human confirmation remains mandatory:

- `userMustConfirm: true`
- `finalHumanClickRequired: true`

## API Route Boundary

The disabled local-only API route remains separate and unwired:

- `app/api/dev/avanza/fill-only/stub/route.ts`
- default output remains `api_stub_disabled`
- the API route was not changed by this wiring phase
- `app/trade-app.tsx` does not reference the API route path
- no Trade UI API route call exists

## Production Boundary

No production readiness is claimed.

## Next Phase

The next phase is planning-only:

- `docs/avanza-explicit-internal-disabled-action-shell-plan.md`

That plan may define a future explicit internal/dev-only disabled action shell
around the prepare/API-call intent. It must remain disabled by default and
continue to forbid API route calls, fetch, localhost, bridge, Avanza/browser
control, real fill, order/review/confirm/submit behavior, credential/session
handling, and Supabase execution writes.

The pure model/helper for that next phase now exists at
`lib/avanza-explicit-internal-disabled-action-shell.ts`.

The fixture/model-only visibility layer also exists:

- `lib/avanza-explicit-internal-disabled-action-shell-fixtures.ts`
- `components/execution/AvanzaExplicitInternalDisabledActionShellHarness.tsx`
- dev-only visual QA section in `app/dev/avanza-visual-qa/page.tsx`

That section renders static fixtures only. It remains unwired from Trade UI,
separate from the disabled API route, unlinked from main navigation, and
incapable of API route calls, fetch, localhost, bridge, Avanza/browser control,
real fill, order/review/confirm/submit behavior, credential/session handling,
or Supabase writes.

The visibility layer is closed in
`docs/avanza-explicit-internal-disabled-action-shell-visibility-phase-completion-checkpoint.md`.
The next planning document is
`docs/avanza-passive-disabled-action-shell-component-plan.md`, which keeps the
future component passive, disabled, non-clickable, and separate from route calls,
fetch, localhost, bridge, Avanza/browser, real fill, order/review/confirm/submit
behavior, credential/session handling, and Supabase writes.

The passive disabled action shell component now exists at
`components/execution/AvanzaPassiveDisabledActionShell.tsx`. It is isolated,
prop-driven, display-only, not wired into Trade UI, and rendered only through
the isolated action shell harness/dev QA fixture route. It adds no active
button, no `onClick`, no `useEffect`, no API route path, no fetch, no
localhost/bridge call, no Avanza/browser control, no real fill, no
order/review/confirm/submit behavior, no credential/session handling, and no
Supabase write.

The passive disabled action shell component safety audit is recorded in
`docs/avanza-passive-disabled-action-shell-component-safety-audit.md`. It
confirms the component is not wired into Trade UI, the disabled API route was
not edited, and the isolated fixture rendering adds no active controls, route
calls, fetch, browser/Avanza behavior, order behavior, credential/session
handling, or Supabase writes.
