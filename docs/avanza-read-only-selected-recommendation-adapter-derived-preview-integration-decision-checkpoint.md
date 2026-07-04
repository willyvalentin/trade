# Avanza Read-Only SelectedRecommendation Adapter/Derived-Preview Integration Decision Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_checkpoint_added`

## Current Status

The adapter/derived-preview integration decision model, fixtures, and route
visible fixture/model-only harness phase is complete before any actual adapter
and derived-preview calls.

Current state:

- integration decision model is pure
- integration decision fixtures are static
- integration decision harness is isolated
- integration decision harness is fixture/model-only
- harness is not rendered in `app/trade-app.tsx`
- harness is rendered in `app/dev/avanza-visual-qa/page.tsx` as a
  fixture/model-only section
- existing dev route remains fixture/model-only
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## Implemented Pure Integration Decision Model

`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision.ts`
defines whether an explicit selectedRecommendation-like input may proceed to
future adapter/derived-preview integration review.

The model returns:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_review_required`
- `integration_allowed`

Current valid-input behavior remains conservative and returns
`adapter_review_required` in model state only. The model does not call the
adapter, does not call the derived-preview builder, does not derive real
preview state, and does not render real preview state.

## Implemented Fixtures

`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-fixtures.ts`
adds static fixture states:

- `no_input`
- `blocked_derivation_decision`
- `invalid_input`
- `adapter_review_required`
- `integration_allowed`

The fixtures are pure, static, and not wired into Trade UI or the dev route.

## Implemented Isolated Harness

`components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness.tsx`
renders the integration decision fixtures for isolated visibility.

The harness renders:

- fixture label
- integration decision status
- source mode
- adapter review flag
- normalization flag
- derived-preview builder flag
- read-only preview render flag
- fixture fallback flag
- bridge, localhost, polling, and execution flags
- disabled controls
- locked gate

The harness is fixture/model-only. It is not rendered in `app/trade-app.tsx`
and is rendered in `app/dev/avanza-visual-qa/page.tsx` as a fixture/model-only
section.

The route section states:

- decision fixture only
- no adapter is called
- no derived-preview builder is called
- no real selectedRecommendation state is read from app or route
- no real selectedRecommendation state is rendered
- no real preview state is derived
- no real preview state is rendered
- no bridge calls
- no localhost fetch
- no polling
- no execution
- controls disabled
- gate locked

## Default/No-Input Behavior

The `no_input` fixture uses fixture fallback.

Default/no-input behavior:

- `status: no_input`
- `sourceMode: fixture_only`
- can use fixture fallback
- cannot normalize input
- cannot call derived-preview builder
- cannot render read-only preview
- controls disabled
- pre-activation gate locked

## Blocked/Invalid Behavior

The `blocked_derivation_decision` fixture blocks integration.

The `invalid_input` fixture blocks integration.

Both states keep:

- no normalization
- no derived-preview builder call
- no read-only preview render
- no bridge calls
- no localhost fetch
- no polling
- no execution
- controls disabled
- pre-activation gate locked

## Adapter Review Required Behavior

`adapter_review_required` exists only as fixture/model state.

It may mark adapter review as available, but it still keeps:

- no input normalization
- no derived-preview builder call
- no read-only preview render
- no real selectedRecommendation state read from app/route
- no real preview state derivation
- controls disabled
- pre-activation gate locked

## Integration Allowed Fixture/Model-Only Behavior

`integration_allowed` exists only as fixture/model state.

It may model future read-only capability only:

- can review adapter
- can normalize input as a future/model-only capability
- can call derived-preview builder as a future/model-only capability
- can render read-only preview as a future/model-only capability

It still does not call the adapter, does not call the derived-preview builder,
does not derive real preview state, and does not render real preview state.
Bridge calls, localhost fetches, polling, execution, enabled controls, and
unlocked gates remain forbidden.

## Safety Guarantees

This checkpoint preserves:

- no real selectedRecommendation state is read from app/route
- no real selectedRecommendation state is rendered
- adapter is not called
- derived-preview builder is not called
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
- no production readiness claim

## What Remains Not Implemented

Not implemented:

- no harness wiring into Trade UI
- no real selectedRecommendation read
- no real selectedRecommendation render
- no adapter call
- no derived-preview builder call
- no real preview derivation
- no real preview render
- no route-gated adapter integration
- no route-gated derived-preview integration
- no main navigation link
- no active handoff button
- no execution path
- no production readiness claim

## Recommended Next Decision

Option A: stop here and keep integration decision harness isolated on the dev
route as a fixture/model-only section.

Option B: add integration decision harness to the dev-only visual QA route was
completed as fixture/model-only route content; any next work here is visual
polish only.

Option C: plan actual adapter safety review separately.

Option D: plan actual adapter/derived-preview invocation behind explicit
read-only guard separately.

All options must still forbid execution, fill, trigger, bridge calls, localhost
fetches, polling, active controls, and production readiness claims.

## Route Section Checkpoint

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-route-section-checkpoint.md`
summarizes the isolated dev-only visual QA route section that renders this
integration decision harness. It confirms the route section is
fixture/model-only, remains unlinked from main navigation, is not rendered in
Trade UI, does not read or render real selectedRecommendation state, does not
call the adapter or derived-preview builder, and does not derive or render real
preview state.

## Phase Completion Checkpoint

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md`
summarizes the completed adapter/derived-preview integration decision
model/fixtures/harness/route-section phase before any future adapter safety
review or actual adapter/derived-preview invocation. It confirms the route
section remains fixture/model-only, `app/trade-app.tsx` was not changed, the
route remains unlinked from main navigation, the adapter and derived-preview
builder are not called, and no real selectedRecommendation or preview state is
read, derived, or rendered.

## References

- [Avanza read-only selectedRecommendation adapter/derived-preview integration decision phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration decision route section checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-route-section-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration plan](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation derivation decision route section checkpoint](avanza-read-only-selected-recommendation-derivation-decision-route-section-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
