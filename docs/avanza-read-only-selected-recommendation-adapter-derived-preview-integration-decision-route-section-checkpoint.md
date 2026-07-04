# Avanza Read-Only SelectedRecommendation Adapter/Derived-Preview Integration Decision Route Section Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_route_section_checkpoint_added`

## Current Status

The adapter/derived-preview integration decision harness is rendered on
`app/dev/avanza-visual-qa/page.tsx` as a fixture/model-only route section.

This checkpoint records the route-section state before any real
selectedRecommendation read, adapter call, derived-preview builder call, real
preview derivation, real preview rendering, or Trade UI integration.

Current state:

- integration decision harness is rendered on
  `app/dev/avanza-visual-qa/page.tsx`
- route section is fixture/model-only
- route remains unlinked from main navigation
- `app/trade-app.tsx` was not changed
- integration decision harness is not rendered in Trade UI
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## Route Section Behavior

The route section is labeled as an adapter/derived-preview integration decision
section and states that it is a decision fixture only.

The section renders fixture/model-only integration decision states from the
existing harness. It does not read route state, Trade UI state, or real
selectedRecommendation state.

The section explicitly states:

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

## Integration Decision Harness Behavior

`components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness.tsx`
renders static adapter/derived-preview integration decision fixtures:

- `no_input`
- `blocked_derivation_decision`
- `invalid_input`
- `adapter_review_required`
- `integration_allowed`

The harness can display model flags for adapter review, input normalization,
derived-preview builder access, read-only preview rendering, fixture fallback,
bridge, localhost, polling, execution, controls, and gate state. Those flags
are fixture/model-only and do not activate any read, adapter, derivation, render,
or execution behavior.

## Fixture/Model-Only Guarantee

The route section uses fixture/model-only data.

It does not:

- import `app/trade-app.tsx`
- read app state
- read route state
- fetch data
- call bridge code
- call localhost
- poll
- expose active controls

## No Real SelectedRecommendation State Guarantee

The route section explicitly preserves:

- no real selectedRecommendation state is read
- no real selectedRecommendation state is read from app or route
- no real selectedRecommendation state is rendered
- selectedRecommendation preview disabled by default in Trade UI

## No Adapter/Derived-Preview Invocation Guarantee

The route section explicitly preserves:

- adapter is not called
- derived-preview builder is not called
- no selectedRecommendation adapter call happens
- no derived-preview helper call happens

## No Real Preview Derivation Guarantee

The route section explicitly preserves:

- no real preview state is derived
- no real preview state is rendered
- no route-gated adapter integration
- no route-gated derived-preview integration

## Trade UI Default Behavior

Trade UI behavior remains unchanged:

- `app/trade-app.tsx` was not changed
- integration decision harness is not rendered in Trade UI
- selectedRecommendation preview disabled by default in Trade UI
- default Trade UI remains guarded and disabled
- route remains unlinked from main navigation

## Safety Guarantees

This checkpoint preserves:

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

- no real selectedRecommendation read
- no real selectedRecommendation render
- no adapter call
- no derived-preview builder call
- no real preview derivation
- no real preview render
- no Trade UI integration decision rendering
- no route-gated adapter integration
- no route-gated derived-preview integration
- no main navigation link
- no active handoff button
- no execution path
- no production readiness claim

## Recommended Next Decision

Option A: stop here and keep integration decision harness as fixture/model-only
route section.

Option B: add visual polish to fixture/model-only route sections only.

Option C: plan actual adapter safety review separately.

Option D: plan actual adapter/derived-preview invocation behind explicit
read-only guard separately.

All options must still forbid execution, fill, trigger, bridge calls, localhost
fetches, polling, active controls, and production readiness claims.

## Phase Completion Checkpoint

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md`
closes the adapter/derived-preview integration decision route-visible
fixture/model phase. It records the completed model, fixtures, harness, and
route section before any adapter safety review or actual adapter/derived-preview
invocation.

## References

- [Avanza read-only selectedRecommendation adapter/derived-preview integration decision phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration decision checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration plan](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation derivation decision route section checkpoint](avanza-read-only-selected-recommendation-derivation-decision-route-section-checkpoint.md)
- [Avanza read-only selectedRecommendation dev preview phase completion checkpoint](avanza-read-only-selected-recommendation-dev-preview-phase-completion-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
