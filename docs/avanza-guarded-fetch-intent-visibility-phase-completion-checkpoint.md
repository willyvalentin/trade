# Avanza Guarded Fetch Intent Visibility Phase Completion Checkpoint

Status: `avanza_guarded_fetch_intent_visibility_phase_complete`

## Current Status

The guarded fetch intent visibility layer is complete as fixture/model-only
work. It does not wire fetch intent into Trade UI and does not add executable
behavior.

Implemented artifacts:

- pure guarded fetch intent model/helper:
  `lib/avanza-guarded-fetch-intent.ts`
- guarded fetch intent fixtures:
  `lib/avanza-guarded-fetch-intent-fixtures.ts`
- isolated guarded fetch intent harness:
  `components/execution/AvanzaGuardedFetchIntentHarness.tsx`
- fixture/model-only dev QA route section:
  `app/dev/avanza-visual-qa/page.tsx`

## Route Boundary

The dev QA route renders the guarded fetch intent section for visual inspection
only. The route remains unlinked from main navigation and remains
fixture/model-only.

The visibility layer did not edit:

- `app/trade-app.tsx`
- `app/api/dev/avanza/fill-only/stub/route.ts`
- `components/execution/AvanzaPassiveDisabledActionShell.tsx`

The passive action shell component was not imported into Trade UI, was not
rendered in Trade UI, and was not changed by this phase.

## Default Behavior

Default behavior remains locked:

- the visibility phase did not wire fetch intent into Trade UI
- no fetch intent renders in normal/default UI
- `fetchIntentEnabled` is `false` by default
- `canCreateFetchIntent` is `false` by default
- `canFetch` is `false`
- `canCallApiRoute` is `false`
- `canFetchLocalhost` is `false`
- `canCallBridge` is `false`
- `canControlBrowser` is `false`
- `canClickReview` is `false`
- `canClickConfirm` is `false`
- `canSubmitOrder` is `false`
- `userMustConfirm` is `true`
- `finalHumanClickRequired` is `true`

## Safety Guarantees

This phase added no:

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

The disabled local-only API route still returns `api_stub_disabled` by default
and remains unwired from Trade UI.

## Production Boundary

No production readiness is claimed. Semi-auto human confirmation remains
mandatory, and final human confirmation remains mandatory.

## Next Phase

The next phase is planning minimal hard-disabled Trade UI fetch intent metadata
wiring:

- `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-plan.md`

That future phase must remain default-off and metadata-only. It must not render
fetch intent in normal/default UI, add active controls, call the API route,
perform fetch, reference the API route path from `app/trade-app.tsx`, call
localhost or bridge, control Avanza/browser state, fill forms, submit orders,
handle credentials/sessions, or write Supabase execution records.

## Follow-Up Implementation

The minimal hard-disabled Trade UI fetch intent metadata wiring has now been
added in `app/trade-app.tsx`.

The guarded fetch intent helper is referenced only inside the existing
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` disabled/default-off branch,
with `fetchIntentEnabled: false` and `mode: "hidden"`. The resulting default
metadata is `fetch_intent_hidden`; no fetch intent UI renders in normal/default
Trade UI.

The follow-up implementation still did not edit
`app/api/dev/avanza/fill-only/stub/route.ts` or
`components/execution/AvanzaPassiveDisabledActionShell.tsx`, and it added no
API route call, fetch, route path reference, localhost call, bridge call,
polling, Avanza/browser behavior, real fill, order/review/confirm/submit
behavior, credential/session handling, or Supabase execution write.

The follow-up safety audit is recorded in:

- `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-safety-audit.md`

The hard-disabled Trade UI fetch intent metadata wiring phase is now closed in:

- `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-phase-completion-checkpoint.md`

The next planning-only phase is:

- `docs/avanza-disabled-local-only-manual-test-path-plan.md`

That next phase remains disabled, local-only, non-fetching, non-executing, and
separate from normal/default Trade UI.
