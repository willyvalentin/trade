# Avanza Dev-Only Visible Preview Surface Route Plan

Date: 2026-07-03

Plan status:
`avanza_dev_only_visible_preview_surface_route_planned_no_route`

## Purpose

Plan an optional future dev-only visual QA surface or route that can display
the fixture-only visible selectedRecommendation preview gallery.

This plan does not add a route, does not render anything in Trade UI, and does
not enable execution.

## Allowed Future Surfaces

Allowed future surfaces:

- dev-only visual QA route behind an explicit guard
- isolated component harness
- Storybook-like component surface if adopted later

Any future surface must remain fixture-first, passive, and preview-only.

## Forbidden Surfaces

Forbidden surfaces:

- production route
- default Trade UI render
- Settings render by default
- enabled handoff button
- active handoff control
- bridge call surface
- localhost fetch surface
- polling surface
- runner/fill invocation surface
- click/review/final/submit/order surface
- credential/session handling surface
- Supabase execution write surface

## Route Guard Requirements

If a route is added later, it must require:

- explicit dev-only visible preview surface guard
- pure dev-only visual QA route access guard
- fixture-only data by default
- no real selectedRecommendation state unless separately planned
- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no click on `Granska köp`
- no review modal
- no final confirmation
- no submit
- no order placement
- no credential/session/BankID/cookie/storage handling
- no Supabase execution write

The route must not claim production readiness or execution readiness.

## Route Access Guard Model

Current model status:
`avanza_dev_visual_qa_route_access_guard_added`

Fixture and harness status:
`avanza_dev_visual_qa_route_access_fixtures_harness_added`

Checkpoint status:
`avanza_dev_visual_qa_route_access_checkpoint_added`

Final pre-route checkpoint status:
`avanza_dev_visual_qa_pre_route_final_checkpoint_added`

Implementation plan status:
`avanza_isolated_dev_visual_qa_route_shell_added_fixture_only`

Route hardening status:
`avanza_isolated_dev_visual_qa_route_hardening_checkpoint_added`

`lib/avanza-dev-visual-qa-route-access.ts` defines a pure route access guard for
the optional future visual QA route. The default decision is `hidden`:

- cannot expose a route
- cannot link from main navigation
- cannot render the fixture gallery
- cannot use real selectedRecommendation state
- cannot call the bridge
- cannot fetch localhost
- cannot execute

A dev-only fixture/config may return `dev_route_allowed` and allow route
exposure plus fixture-gallery rendering, but it still forbids main navigation
links, real selectedRecommendation state, bridge calls, localhost fetches, and
execution. Production/default remains hidden or blocked.

`lib/avanza-dev-visual-qa-route-access-fixtures.ts` defines reusable fixture
states for hidden, production-forbidden blocked, and `dev_route_allowed`
fixture-gallery-only access. `components/execution/AvanzaDevVisualQaRouteAccessHarness.tsx`
renders those decisions in an isolated prop-driven harness for visual QA. The
harness is fixture-only, creates no route, is not linked from main navigation,
does not read app state, does not fetch, does not call the bridge, includes no
active controls, and does not enable execution.

The checkpoint for this modeled route access phase is recorded in
[Avanza dev-only visual QA route access checkpoint](avanza-dev-visual-qa-route-access-checkpoint.md).

The completed plan/guard/fixture/harness phase before any route implementation
is closed in
[Avanza dev-only visual QA pre-route final checkpoint](avanza-dev-visual-qa-pre-route-final-checkpoint.md).

The optional route implementation requirements are defined in
[Avanza isolated dev visual QA route implementation plan](avanza-isolated-dev-visual-qa-route-implementation-plan.md).

The isolated route shell now exists at `app/dev/avanza-visual-qa/page.tsx`. It
renders fixture-only route-access and visible preview surface scenarios, is not
linked from main navigation, does not read Trade UI state, does not read real
selectedRecommendation state, does not fetch, does not call the bridge, and
does not enable execution.

The route shell hardening checkpoint is recorded in
[Avanza isolated dev visual QA route hardening checkpoint](avanza-isolated-dev-visual-qa-route-hardening-checkpoint.md).

## Validation Requirements

Future validation must prove:

- default production build does not expose the route
- route is not linked from main navigation
- route does not include active controls
- route uses fixture-only data by default
- no live endpoint strings
- no exact trigger phrase
- UI safety guard scans the route if later added
- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no click/review/final/submit/order behavior
- no credential/session handling
- no Supabase execution write

## Implementation Sequence

Recommended future sequence:

1. Add route plan/checkpoint. This document.
2. Add a pure route access guard model. Done as
   `lib/avanza-dev-visual-qa-route-access.ts`.
3. Add route only behind explicit dev-only guard.
4. Render fixture-only gallery.
5. Keep all execution paths forbidden.

No step should add active execution, fill, trigger, click, review, final
confirmation, submit, or order placement.

## Current Non-Implementation

Current state remains:

- route shell exists only at `app/dev/avanza-visual-qa/page.tsx`
- no visible toggle exists
- component/gallery are not rendered in `app/trade-app.tsx`
- selectedRecommendation preview remains disabled by default
- controls remain disabled
- pre-activation gate remains locked
- no runtime environment path exists
- no `.env.local` dependency exists

## References

- [Avanza dev-only visible preview surface checkpoint](avanza-dev-only-visible-preview-surface-checkpoint.md)
- [Avanza dev-only visual QA route access checkpoint](avanza-dev-visual-qa-route-access-checkpoint.md)
- [Avanza dev-only visual QA pre-route final checkpoint](avanza-dev-visual-qa-pre-route-final-checkpoint.md)
- [Avanza isolated dev visual QA route implementation plan](avanza-isolated-dev-visual-qa-route-implementation-plan.md)
- [Avanza isolated dev visual QA route hardening checkpoint](avanza-isolated-dev-visual-qa-route-hardening-checkpoint.md)
- [Avanza dev-only visible selectedRecommendation preview surface plan](avanza-dev-only-visible-selected-recommendation-preview-surface-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
