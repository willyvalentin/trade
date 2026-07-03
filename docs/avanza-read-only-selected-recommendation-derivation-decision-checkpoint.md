# Avanza Read-Only SelectedRecommendation Derivation Decision Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_read_only_selected_recommendation_derivation_decision_checkpoint_added`

## Current Status

The read-only selectedRecommendation derivation decision model, fixtures, and
isolated harness phase is complete before any route wiring or real derivation.

Current state:

- derivation decision model is pure
- derivation decision fixtures are static
- derivation decision harness is isolated
- harness is not wired into Trade UI
- harness is not wired into the dev route
- existing dev route remains fixture/model-only
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## Implemented Pure Derivation Decision Model

`lib/avanza-read-only-selected-recommendation-derivation-decision.ts` defines
whether an explicit selectedRecommendation-like input could be used for
read-only dev preview derivation.

The model returns:

- `no_input`
- `blocked`
- `invalid_input`
- `derivation_allowed`

Every status keeps bridge calls, localhost fetches, polling, execution, enabled
controls, and unlocked gates forbidden.

## Implemented Fixtures

`lib/avanza-read-only-selected-recommendation-derivation-decision-fixtures.ts`
adds fixture states for the decision model:

- `no_input`
- `blocked_guard`
- `invalid_input`
- `derivation_allowed`

The fixtures are pure, static, and not wired into Trade UI or the dev route.

## Implemented Isolated Harness

`components/execution/AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness.tsx`
renders the derivation decision fixtures for isolated visibility.

The harness is isolated:

- harness is not rendered in `app/trade-app.tsx`
- harness is not rendered in `app/dev/avanza-visual-qa/page.tsx`
- harness does not read app state
- harness does not read real selectedRecommendation state
- harness does not call the adapter
- harness does not call the derived-preview builder
- harness does not expose active controls

## Default/No-Input Behavior

The `no_input` fixture uses fixture fallback.

Default/no-input behavior:

- `status: no_input`
- `sourceMode: fixture_only`
- can use fixture fallback
- cannot derive preview state
- cannot render read-only preview
- controls disabled
- pre-activation gate locked

## Blocked/Invalid Behavior

The `blocked_guard` fixture blocks derivation and rendering.

The `invalid_input` fixture blocks derivation and rendering.

Both states keep:

- no bridge calls
- no localhost fetch
- no polling
- no execution
- controls disabled
- pre-activation gate locked

## Allowed Fixture/Model-Only Behavior

`derivation_allowed` exists only as fixture/model state.

The allowed fixture may model read-only capability only:

- can read explicit input in model state
- can derive preview state in model state
- can render read-only preview in model state

It still forbids bridge calls, localhost fetches, polling, execution, enabled
controls, and unlocked gates. It does not read real selectedRecommendation
state from app or route, and it does not derive or render real preview state.

## Safety Guarantees

This checkpoint preserves:

- no real selectedRecommendation state is read from app or route
- no real selectedRecommendation state is rendered
- no real preview state is derived
- no real preview state is rendered
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory
- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write

## What Remains Not Implemented

Not implemented:

- no harness wiring into Trade UI
- no harness wiring into the dev route
- no real selectedRecommendation read
- no real selectedRecommendation render
- no real preview derivation
- no real preview render
- no adapter integration
- no derived-preview builder integration
- no main navigation link
- no active handoff button
- no execution path
- no production readiness claim

## Recommended Next Decision

Option A: stop here and keep the derivation decision harness isolated.

Option B: add the derivation decision harness to the dev-only visual QA route as
a fixture/model-only section.

Option C: plan actual adapter/derived-preview integration separately.

All options must still forbid execution, fill, trigger, bridge calls, localhost
fetches, polling, active controls, and production readiness claims.

