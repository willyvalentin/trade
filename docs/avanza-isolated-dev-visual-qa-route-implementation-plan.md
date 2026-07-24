# Avanza Isolated Dev Visual QA Route Implementation Plan

Date: 2026-07-03

Plan status:
`avanza_isolated_dev_visual_qa_route_shell_added_fixture_only`

Hardening status:
`avanza_isolated_dev_visual_qa_route_hardening_checkpoint_added`

Content checkpoint status:
`avanza_isolated_dev_visual_qa_route_content_checkpoint_added`

Final checkpoint status:
`avanza_isolated_dev_visual_qa_route_final_checkpoint_added`

Phase completion status:
`avanza_isolated_dev_visual_qa_route_phase_completion_checkpoint_added`

## Purpose Of The Route

Plan an optional isolated dev-only visual QA route that would render
fixture-only Avanza selectedRecommendation preview data.

The first route shell is now implemented at `app/dev/avanza-visual-qa/page.tsx`.
It renders fixture-only route-access and visible-preview-surface scenarios.
The hardening checkpoint is recorded in
[Avanza isolated dev visual QA route hardening checkpoint](avanza-isolated-dev-visual-qa-route-hardening-checkpoint.md).
The route also renders
`components/execution/AvanzaDevVisualQaRouteStatusPanel.tsx`, a static
fixture-only status panel that summarizes route isolation, disabled controls,
locked gate, no bridge calls, no localhost fetch, no polling, no execution, and
total-read advisory state.
The exact rendered route content is summarized in
[Avanza isolated dev visual QA route content checkpoint](avanza-isolated-dev-visual-qa-route-content-checkpoint.md).
The route phase final checkpoint is recorded in
[Avanza isolated dev visual QA route final checkpoint](avanza-isolated-dev-visual-qa-route-final-checkpoint.md).
The route phase completion checkpoint is recorded in
[Avanza isolated dev visual QA route phase completion checkpoint](avanza-isolated-dev-visual-qa-route-phase-completion-checkpoint.md).

## Exact Allowed Route Behavior

The route may only:

- be isolated from default Trade UI
- render fixture-only gallery/harness data
- use `AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery`
- optionally show `AvanzaDevVisualQaRouteAccessHarness`
- show static route-local status
- show guard and fixture status
- show preview-only safety copy
- remain passive and read-only

## Exact Forbidden Behavior

The route must not:

- be linked from main navigation
- read real Trade UI state
- read real selectedRecommendation state
- fetch
- call bridge endpoints
- call localhost
- poll
- expose active controls
- execute/fill/click/review/final/submit/order
- handle credentials/session/BankID/cookies/storage
- write Supabase execution records
- claim production readiness
- claim execution readiness

## Required Route Access Guard Behavior

The route must require `lib/avanza-dev-visual-qa-route-access.ts`.

Required guard behavior:

- default guard remains `hidden`
- default cannot expose the route
- default cannot link from main navigation
- default cannot render the fixture gallery
- `dev_route_allowed` may expose fixture-gallery route content only
- `dev_route_allowed` still cannot link from main navigation
- `dev_route_allowed` still cannot use real selectedRecommendation state
- `dev_route_allowed` still cannot call the bridge
- `dev_route_allowed` still cannot fetch localhost
- `dev_route_allowed` still cannot execute

## Fixture-Only Data Requirement

The route must use fixture-only data by default:

- `lib/avanza-dev-visible-preview-surface-fixtures.ts`
- `lib/avanza-dev-visual-qa-route-access-fixtures.ts`

No runtime Trade UI state may feed the route. No real selectedRecommendation
state may feed the route.

## No Real SelectedRecommendation State Requirement

Real selectedRecommendation preview remains a separate future plan.

This route plan does not permit:

- reading selectedRecommendation from `app/trade-app.tsx`
- passing selectedRecommendation into route components
- deriving route preview state from live app state
- switching default Trade UI away from `static_fixture`

## No Navigation Or Linking Requirement

If implemented later, the route must not be linked from:

- main navigation
- Trade UI dashboard navigation
- Settings by default
- execution cards
- handoff preview cards

The route may only be directly addressable behind an explicit dev-only route
guard if route implementation is approved later.

## Test Requirements

Future route tests must prove:

- default state does not expose the route
- route is not linked from main navigation
- route renders fixture-only gallery/harness data
- route does not read real Trade UI state
- route does not read real selectedRecommendation state
- route does not fetch
- route does not call bridge endpoints
- route does not call localhost
- route does not poll
- route exposes no active controls
- route does not execute/fill/click/review/final/submit/order
- route does not handle credentials/session/BankID/cookies/storage
- route does not write Supabase execution records
- route contains no live endpoint strings
- route contains no exact trigger phrase
- UI safety guard scans the route file if added

## Go/No-Go Checklist Before Route Implementation

Before route code is added, confirm:

- route access guard default is hidden
- route access guard can expose route only for dev-only fixture state
- route access guard cannot link from main navigation
- route access guard cannot use real selectedRecommendation state
- visible preview surface gallery remains fixture-only
- route access harness remains fixture-only
- controls remain disabled
- pre-activation gate remains locked
- total-read remains advisory
- no bridge calls are allowed
- no localhost fetch is allowed
- no polling is allowed
- no execution path is allowed
- no `.env.local` change is required
- no runtime environment config is required

## Route Options

Option A: remove the route and keep fixture-only component tests and harnesses
only.

Option B: keep the isolated dev-only QA route for fixtures only. Current state.

Option C: postpone real selectedRecommendation dev preview to a separate future
plan.

All options continue to forbid execution, fill, and trigger behavior.

## References

- [Avanza dev-only visual QA pre-route final checkpoint](avanza-dev-visual-qa-pre-route-final-checkpoint.md)
- [Avanza isolated dev visual QA route hardening checkpoint](avanza-isolated-dev-visual-qa-route-hardening-checkpoint.md)
- [Avanza isolated dev visual QA route content checkpoint](avanza-isolated-dev-visual-qa-route-content-checkpoint.md)
- [Avanza isolated dev visual QA route final checkpoint](avanza-isolated-dev-visual-qa-route-final-checkpoint.md)
- [Avanza isolated dev visual QA route phase completion checkpoint](avanza-isolated-dev-visual-qa-route-phase-completion-checkpoint.md)
- [Avanza dev-only visible preview surface route plan](avanza-dev-only-visible-preview-surface-route-plan.md)
- [Avanza dev-only visual QA route access checkpoint](avanza-dev-visual-qa-route-access-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
