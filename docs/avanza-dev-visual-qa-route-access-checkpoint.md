# Avanza Dev-Only Visual QA Route Access Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_dev_visual_qa_route_access_checkpoint_added`

## Current Status

The dev-only visual QA route access phase is modeled and covered with fixtures
and an isolated harness only. No route exists, and no route access model is
wired into `app/trade-app.tsx`.

Current state remains:

- default route access guard is hidden
- default cannot expose a route
- default cannot link from main navigation
- default cannot render the fixture gallery
- selectedRecommendation preview is disabled by default
- controls remain disabled
- pre-activation gate remains locked
- total-read remains advisory

## Implemented Route Access Guard

Implemented helper:

- `lib/avanza-dev-visual-qa-route-access.ts`

The guard returns a typed route access decision with:

- `status`: `hidden`, `dev_route_allowed`, or `blocked`
- `canExposeRoute`
- `canLinkFromMainNavigation`
- `canRenderFixtureGallery`
- `canUseRealSelectedRecommendationState`
- `canCallBridge`
- `canFetchLocalhost`
- `canExecute`

Default output is `hidden` and keeps every route, navigation, real-state,
bridge, local-fetch, and execution capability disabled.

## Implemented Fixtures

Implemented fixture module:

- `lib/avanza-dev-visual-qa-route-access-fixtures.ts`

Fixture states:

- default hidden
- production-forbidden blocked
- `dev_route_allowed` fixture-gallery only

The `dev_route_allowed` state exists only as fixture/model state. It may expose
a fixture-gallery route in a future guarded dev-only route, but it still cannot
link from main navigation, use real selectedRecommendation state, call the
bridge, fetch localhost, or execute.

## Implemented Isolated Harness

Implemented harness:

- `components/execution/AvanzaDevVisualQaRouteAccessHarness.tsx`

The harness renders route access fixture decisions for isolated visual QA. It is
not rendered in `app/trade-app.tsx`, creates no route, and reads no app state.

Displayed fields include:

- fixture label
- access status
- `canExposeRoute`
- `canRenderFixtureGallery`
- `canLinkFromMainNavigation`
- `canUseRealSelectedRecommendationState`
- `canCallBridge`
- `canFetchLocalhost`
- `canExecute`

## Default Behavior

Default behavior remains:

- route access hidden
- no route exposed
- no main navigation link
- no fixture gallery render from a route
- no real selectedRecommendation state
- no bridge calls
- no localhost fetch
- no execution

## Dev-Only Allowed Fixture Behavior

The `dev_route_allowed` fixture may model a future dev-only visual QA route
candidate that renders fixture-gallery data only.

It still enforces:

- no main navigation link
- no real selectedRecommendation state
- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no trigger phrase
- no click/review/final/submit/order behavior
- no credential/session handling
- no Supabase execution write
- controls disabled
- gate locked
- total-read advisory

## Safety Guarantees

This checkpoint preserves:

- no app code changes
- no route
- no default selectedRecommendation preview rendering
- no runtime environment config
- no `.env.local` dependency
- no visible toggle
- no enabled handoff button
- no active handoff control
- no bridge endpoint calls
- no localhost fetch from Trade UI
- no polling
- no runner/fill invocation
- no trigger phrase
- no click/review/final/submit/order behavior
- no credential/session/BankID/cookie/storage handling
- no Supabase execution write

## Not Implemented

Not implemented:

- actual dev-only visual QA route
- route file
- route link
- route guard wiring in app code
- default selectedRecommendation preview rendering
- production route exposure
- live bridge or runner integration
- active handoff control
- order placement path

## Recommended Next Decision

Choose one:

1. Stop here and keep route access fixture-only.
2. Plan an actual dev-only visual QA route.

Either path must continue to forbid execution, fill, trigger, click, review,
final confirmation, submit, and order placement.

## References

- [Avanza dev-only visible preview surface route plan](avanza-dev-only-visible-preview-surface-route-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
