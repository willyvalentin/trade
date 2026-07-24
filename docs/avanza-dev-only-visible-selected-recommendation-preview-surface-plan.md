# Avanza Dev-Only Visible SelectedRecommendation Preview Surface Plan

Date: 2026-07-03

Plan status:
`avanza_dev_only_visible_selected_recommendation_preview_surface_component_added_no_wiring`

## Goal

Plan a future visible dev-only preview of selectedRecommendation-derived Avanza
handoff state.

The future surface must remain preview-only:

- no execution
- no bridge calls
- no localhost fetch
- no active controls
- no handoff button enablement
- no order placement path

## Current State

Current default behavior remains:

- default Trade UI source: `static_fixture`
- selectedRecommendation preview: disabled by default
- `explicitPreviewOnlyFlag`: false by default
- visible preview surface guard: `hidden` by default
- isolated visible surface component: added but not rendered
- static visible surface fixtures: hidden, blocked, and allowed passive preview
- fixture-only visible surface gallery: added but not rendered
- controls: disabled
- pre-activation gate: locked
- total-read: unresolved/advisory

The test-only path can render passive selectedRecommendation preview state, but
there is no visible dev route, no visible toggle, and no runtime environment
path.

## Allowed Future Surfaces

Allowed future surface options:

- dev-only panel inside Trade UI behind explicit test/dev config
- isolated dev-only route behind explicit guard
- existing test-only harness promoted to dev-only visual QA surface

All allowed options must be passive, preview-only, and disabled-control only.

## Forbidden Surfaces

Forbidden surface options:

- production-visible by default
- default Trade UI path
- enabled handoff button
- bridge call surface
- localhost fetch surface
- fill runner surface
- review/final/submit/order surface
- credential/session handling surface
- Supabase execution write surface

## Required Safety Behavior

Any future visible dev-only preview surface must preserve:

- `explicitPreviewOnlyFlag` false by default
- selectedRecommendation preview disabled by default
- source indicator shows `selected_recommendation_preview_only` only when
  explicitly enabled
- controls remain disabled
- pre-activation gate remains locked
- total-read remains advisory
- no production readiness claim
- no autonomous trading claim
- no bridge calls
- no localhost fetch from Trade UI
- no polling
- no runner/fill invocation
- no trigger phrase
- no click on `Granska köp`
- no review modal
- no final confirmation
- no submit
- no order placement
- no credential/session/BankID/cookie/storage handling
- no Supabase execution write

## Implementation Sequence

Recommended sequence:

1. Add a dev-only visible surface guard model. Done in
   `lib/avanza-dev-visible-preview-surface-guard.ts`.
2. Add an isolated visible surface component. Done in
   `components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurface.tsx`.
3. Keep default Trade UI `static_fixture`.
4. Add tests for the default hidden state. Done in
   `tests/e2e/avanza-dev-visible-preview-surface-guard.spec.ts`.
5. Add tests for explicit dev-only visible preview. Done for the pure guard
   model and isolated component.
6. Keep all execution paths forbidden.

No step should enable handoff execution, runner/fill invocation, click,
review, final confirmation, submit, or order placement.

## Guard Model

`lib/avanza-dev-visible-preview-surface-guard.ts` decides whether a future
visible dev-only selectedRecommendation preview surface may render.

Default output:

- `status: hidden`
- `canRenderVisiblePreviewSurface: false`
- `canReadSelectedRecommendationForPreview: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canExecute: false`

The dev/test candidate state may return `visible_dev_only_allowed` and permit
preview-state rendering, but it still forbids bridge calls, localhost fetches,
execution, enabled controls, and unlocked gates. Production-forbidden input
returns `blocked`.

This model is pure, is not wired into `app/trade-app.tsx`, renders no surface,
adds no route, and reads no runtime environment.

## Isolated Surface Component

`components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurface.tsx`
is a prop-driven component for future dev-only visual QA. It accepts a visible
preview surface guard decision and a selectedRecommendation preview state.

Behavior:

- hidden or blocked guard: renders hidden/blocked explanation only
- `visible_dev_only_allowed`: renders the passive
  `AvanzaSelectedRecommendationPreviewStatePanel`

The component shows dev-only visible preview copy, preview-only copy, no bridge
calls, no localhost fetch, no execution, controls disabled, and gate locked. It
does not fetch, does not call the bridge, does not read app state, contains no
active controls, is not rendered in `app/trade-app.tsx`, and has no route.

## Static Fixture States

`lib/avanza-dev-visible-preview-surface-fixtures.ts` defines reusable fixture
states for the isolated surface:

- hidden surface state
- blocked surface state
- `visible_dev_only_allowed` passive preview state

Each fixture includes a fixture id, label, guard decision, optional preview
state, and expected render state. The visible fixture uses the existing valid
selectedRecommendation preview state fixture and still carries preview-only
behavior, no bridge calls, no localhost fetch, no execution, disabled controls,
locked gate, and total-read advisory.

## Fixture-Only Gallery

`components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery.tsx`
renders the static visible preview surface fixtures for isolated test/dev
visibility.

The gallery shows:

- fixture label
- expected render state
- hidden, blocked, and `visible_dev_only_allowed` surface scenarios
- the isolated `AvanzaDevVisibleSelectedRecommendationPreviewSurface`

It is fixture-only, not rendered in `app/trade-app.tsx`, has no route, does not
fetch, does not call the bridge, does not read app state, contains no active
controls, and contains no live endpoint or trigger phrase.

## Checkpoint

The current modeling and fixture phase is summarized in
[Avanza dev-only visible preview surface checkpoint](avanza-dev-only-visible-preview-surface-checkpoint.md).

An optional future visual QA route is planned in
[Avanza dev-only visible preview surface route plan](avanza-dev-only-visible-preview-surface-route-plan.md).

The completed pre-route plan, guard, fixture, and harness phase is summarized
in
[Avanza dev-only visual QA pre-route final checkpoint](avanza-dev-visual-qa-pre-route-final-checkpoint.md).

## Validation Expectations

Future validation should prove:

- default Trade UI remains `static_fixture`
- selectedRecommendation preview remains disabled by default
- visible surface is hidden unless explicit dev-only guard allows it
- visible surface remains passive
- controls remain disabled
- gate remains locked
- no bridge calls
- no localhost fetch
- no polling
- no live runner/fill endpoint strings
- no exact trigger phrase
- no credential/session handling
- no Supabase execution write

## References

- [Avanza test-only selectedRecommendation preview final checkpoint](avanza-test-only-selected-recommendation-preview-final-checkpoint.md)
- [Avanza test-only selectedRecommendation preview activation checkpoint](avanza-test-only-selected-recommendation-preview-activation-checkpoint.md)
- [Avanza dev-only visible preview surface checkpoint](avanza-dev-only-visible-preview-surface-checkpoint.md)
- [Avanza dev-only visible preview surface route plan](avanza-dev-only-visible-preview-surface-route-plan.md)
- [Avanza dev-only visual QA pre-route final checkpoint](avanza-dev-visual-qa-pre-route-final-checkpoint.md)
- [Avanza dev/test explicit preview flag wiring plan](avanza-dev-test-explicit-preview-flag-wiring-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
- [Avanza handoff architecture checkpoint](avanza-handoff-architecture-checkpoint.md)
