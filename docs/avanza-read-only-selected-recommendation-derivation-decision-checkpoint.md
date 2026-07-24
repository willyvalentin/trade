# Avanza Read-Only SelectedRecommendation Derivation Decision Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_read_only_selected_recommendation_derivation_decision_checkpoint_added`

Route section checkpoint status:
`avanza_read_only_selected_recommendation_derivation_decision_route_section_checkpoint_added`

## Current Status

The read-only selectedRecommendation derivation decision model, fixtures, and
harness phase is complete before any real derivation. The harness is now
rendered on the isolated dev-only visual QA route as a fixture/model-only
section.

Current state:

- derivation decision model is pure
- derivation decision fixtures are static
- derivation decision harness is fixture/model-only
- harness is not wired into Trade UI
- harness is rendered in the dev route as fixture/model-only content
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

## Implemented Fixture/Model-Only Harness

`components/execution/AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness.tsx`
renders the derivation decision fixtures for isolated visibility.

The harness remains isolated from Trade UI and real state:

- harness is not rendered in `app/trade-app.tsx`
- harness is rendered in `app/dev/avanza-visual-qa/page.tsx` as a
  fixture/model-only section
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
- no real selectedRecommendation wiring into the dev route
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

Option A: stop here and keep the derivation decision harness on the dev route
as fixture/model-only content.

Option B: add visual polish to the fixture/model-only derivation decision route
section.

Option C: plan actual adapter/derived-preview integration separately.

All options must still forbid execution, fill, trigger, bridge calls, localhost
fetches, polling, active controls, and production readiness claims.

## References

- [Avanza read-only selectedRecommendation derivation decision route section checkpoint](avanza-read-only-selected-recommendation-derivation-decision-route-section-checkpoint.md)
- [Avanza read-only selectedRecommendation derivation plan](avanza-read-only-selected-recommendation-derivation-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
