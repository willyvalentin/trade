# Avanza Guarded API Route Call Intent Visibility Phase Completion Checkpoint

Status: `avanza_guarded_api_route_call_intent_visibility_phase_complete`

## Current Status

The guarded API route call intent visibility layer is complete as a
fixture/model-only phase.

Implemented artifacts:

- pure guarded API route call intent model:
  `lib/avanza-guarded-api-route-call-intent.ts`
- guarded API route call intent fixtures:
  `lib/avanza-guarded-api-route-call-intent-fixtures.ts`
- isolated guarded API route call intent harness:
  `components/execution/AvanzaGuardedApiRouteCallIntentHarness.tsx`
- dev QA route fixture/model-only section:
  `app/dev/avanza-visual-qa/page.tsx`

The dev QA route renders the guarded API route call intent section using static
fixtures only. The route remains unlinked from main navigation.

## Files Not Changed By This Visibility Layer

The visibility layer did not edit:

- `app/trade-app.tsx`
- `app/api/dev/avanza/fill-only/stub/route.ts`

The visibility layer did not wire the API route call intent into Trade UI.

## Default Safety State

The default guarded API route call intent remains locked:

- `apiCallIntentEnabled: false`
- `canCreateApiCallIntent: false`
- `canCallApiRoute: false`
- `canFetch: false`
- `canFetchLocalhost: false`
- `canCallBridge: false`
- `canControlBrowser: false`
- `canClickReview: false`
- `canClickConfirm: false`
- `canSubmitOrder: false`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`

## Safety Guarantees

This phase adds no:

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

Semi-auto human confirmation remains mandatory.

## Production Boundary

No production readiness is claimed.

## Next Plan

The next phase is planning-only:

- `docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-plan.md`

That plan may later add minimal hard-disabled Trade UI metadata wiring for the
guarded API route call intent model. It must keep the existing disabled/default
branch, keep the API call intent guard false by default, and continue to forbid
API route calls, fetch, localhost, bridge, polling, Avanza/browser control,
real fill, order behavior, credential/session handling, and Supabase writes.

## Follow-Up Implementation Note

The planned minimal hard-disabled Trade UI metadata wiring has now been added in
`app/trade-app.tsx` after the visibility layer.

That follow-up wiring invokes `buildAvanzaGuardedApiRouteCallIntent(...)` only
inside the existing hard-disabled/default-off branch with
`apiCallIntentEnabled: false` and `mode: "disabled"`. It remains metadata-only
and defaults to `api_call_intent_disabled`.

The visibility-layer guarantees remain intact: no API call intent UI renders by
default, the disabled API route path is not referenced from Trade UI, the API
route is not called, and no fetch, localhost, bridge, polling, Avanza/browser,
real fill, review, confirmation, submit, order, credential/session, or Supabase
behavior was added.

The follow-up safety audit is recorded in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-safety-audit.md`.
It confirms the Trade UI metadata invocation remains hard-disabled, branch-only,
and non-executing.

The hard-disabled Trade UI API call intent wiring phase is now closed in
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-phase-completion-checkpoint.md`.
The next planning-only phase is
`docs/avanza-explicit-internal-disabled-action-shell-plan.md`, which must keep
any future action shell disabled by default and separate from API route calls,
fetch, localhost, bridge, Avanza/browser control, fill, order, credential/
session handling, and Supabase writes.
