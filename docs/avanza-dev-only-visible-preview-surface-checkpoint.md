# Avanza Dev-Only Visible Preview Surface Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_dev_only_visible_preview_surface_modeling_complete_no_wiring`

## 1. Current Status

The dev-only visible selectedRecommendation preview surface modeling and
fixture phase is complete.

Current state:

- default guard is `hidden`
- component is not rendered in `app/trade-app.tsx`
- gallery is not rendered in `app/trade-app.tsx`
- no route exists
- selectedRecommendation preview is disabled by default
- `explicitPreviewOnlyFlag` is false by default
- controls are disabled
- pre-activation gate is locked
- total-read remains advisory

No active execution is enabled.

## 2. Implemented Guard And Model

Implemented:

- `lib/avanza-dev-visible-preview-surface-guard.ts`

The guard decides whether a future dev-only visible selectedRecommendation
preview surface may render.

Default output:

- `status: hidden`
- `canRenderVisiblePreviewSurface: false`
- `canReadSelectedRecommendationForPreview: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canExecute: false`

A dev/test candidate can return `visible_dev_only_allowed`, but still forbids
bridge calls, localhost fetch, execution, enabled controls, and unlocked gates.
Production-forbidden input returns `blocked`.

## 3. Implemented Isolated Component

Implemented:

- `components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurface.tsx`

The component is prop-driven:

- hidden or blocked guard: renders explanation only
- `visible_dev_only_allowed`: renders passive
  `AvanzaSelectedRecommendationPreviewStatePanel`

The component is not rendered in `app/trade-app.tsx`, has no route, does not
fetch, does not call the bridge, does not read app state, and contains no active
controls.

## 4. Implemented Fixtures

Implemented:

- `lib/avanza-dev-visible-preview-surface-fixtures.ts`

Fixture states:

- hidden
- blocked
- `visible_dev_only_allowed`

Each fixture includes a fixture id, label, guard decision, optional preview
state, and expected render state. The visible fixture uses the existing valid
selectedRecommendation preview state fixture and remains preview-only with no
bridge calls, no localhost fetch, no execution, disabled controls, locked gate,
and total-read advisory.

## 5. Implemented Fixture Gallery

Implemented:

- `components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery.tsx`

The gallery renders all static fixture states for isolated test/dev visibility.
It is fixture-only, is not rendered in `app/trade-app.tsx`, has no route, does
not fetch, does not call the bridge, does not read app state, and contains no
active controls.

## 6. Default Behavior

Default behavior remains unchanged:

- Trade UI remains `static_fixture`
- selectedRecommendation preview remains disabled by default
- `explicitPreviewOnlyFlag` remains false by default
- no runtime environment path exists
- no `.env.local` dependency exists
- controls remain disabled
- pre-activation gate remains locked
- total-read remains advisory

## 7. Safety Guarantees

This checkpoint preserves:

- no bridge calls
- no localhost fetch
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
- disabled controls
- locked pre-activation gate
- total-read advisory

No state in this checkpoint claims execution readiness, production readiness, or
autonomous trading.

## 8. What Remains Not Implemented

Not implemented:

- rendering the component in `app/trade-app.tsx`
- rendering the gallery in `app/trade-app.tsx`
- dev-only route
- visible toggle
- selectedRecommendation preview enabled by default
- runtime env config
- `.env.local` config
- active handoff button
- polling
- refresh outside Settings
- Trade UI bridge call
- Trade UI localhost fetch
- runner/fill invocation
- click/review/final/submit/order behavior
- credential/session handling
- Supabase execution write

## 9. Recommended Next Decision

Recommended decision:

1. Stop here and keep the visible preview surface fixture-only, or
2. Plan a dev-only route or visual QA surface.

If the second option is chosen, it must still forbid execution, fill, trigger,
click, review, final confirmation, submit, order placement, credential/session
handling, Supabase writes, bridge calls, localhost fetches, polling, and active
handoff controls.

## References

- [Avanza dev-only visible selectedRecommendation preview surface plan](avanza-dev-only-visible-selected-recommendation-preview-surface-plan.md)
- [Avanza test-only selectedRecommendation preview final checkpoint](avanza-test-only-selected-recommendation-preview-final-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
