# Avanza Real SelectedRecommendation Read-Only Input Guard Route Section Plan

Date: 2026-07-04

Plan status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_plan_added`

Pre-implementation checkpoint status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_pre_implementation_checkpoint_added`

Route section implementation status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_rendered_fixture_model_only`

Route section checkpoint status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_checkpoint_added`

## Purpose

This plan defines how the isolated real selectedRecommendation read-only input
guard harness may later be shown on the isolated dev-only Avanza visual QA
route.

The planned route section is:

- dev-only visual QA route only
- fixture/model-only
- guard fixture display only
- no real selectedRecommendation state
- no preview derivation
- no Trade UI wiring
- no execution

The purpose is visual QA of guard fixture states before any later real
selectedRecommendation input validation phase.

## Strict Phase Boundary

This plan originally scoped route-section planning. The route section has now
been implemented as fixture/model-only content.

The implementation keeps these boundaries:

- no Trade UI changes
- no app code changes
- no `app/trade-app.tsx` changes
- no real selectedRecommendation read
- no real selectedRecommendation render
- no real app/route preview state derivation
- no real app/route preview state render
- no Trade UI wiring
- harness is route-visible only as fixture/model-only content

The existing dev QA route remains fixture/model-only and unlinked from main
navigation.

## Allowed Future Implementation

A future route-section implementation may update
`app/dev/avanza-visual-qa/page.tsx` to import and render
`AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness`.

Allowed future behavior:

- render only static guard fixtures
- show hidden, blocked, and read-only input allowed guard states
- keep the section fixture/model-only
- keep the route unlinked from main navigation
- keep the harness unwired from Trade UI
- keep controls disabled
- keep the pre-activation gate locked

The future route section must clearly label:

- Real selectedRecommendation read-only input guard
- Guard fixture only
- No real selectedRecommendation state is read
- No real selectedRecommendation state is rendered
- No app/route preview state is derived
- No bridge calls
- No localhost fetch
- No polling
- No execution
- Controls disabled
- Gate locked

The route section may display `hidden_default`,
`blocked_production_forbidden`, and `read_only_input_allowed` fixture states.
The allowed fixture must be labeled as model-only/read-only.

## Forbidden Behavior

Forbidden for this plan and the future route section:

- no real selectedRecommendation state read
- no real selectedRecommendation state render
- no real app/route preview state derivation
- no real app/route preview state render
- no default Trade UI selectedRecommendation preview
- no active handoff button
- no bridge calls
- no localhost fetch
- no polling
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution writes
- no route link from main navigation
- no production readiness claim

## Future Test Requirements

Future route-section implementation tests must prove:

- route renders the real selectedRecommendation read-only input guard harness
  section
- route section says guard fixture only
- route section says no real selectedRecommendation state is read
- route section says no real selectedRecommendation state is rendered
- route section says no app/route preview state is derived
- `hidden_default` is visible
- `blocked_production_forbidden` is visible
- `read_only_input_allowed` is visible
- allowed fixture is labeled model-only/read-only
- controls disabled
- gate locked
- no active handoff button exists
- no live endpoint strings appear
- no exact trigger phrase appears
- route remains unlinked from main navigation
- `app/trade-app.tsx` does not import the harness

## Recommended Implementation Sequence

1. Add this route section plan.
2. Add route section pre-implementation checkpoint. Completed.
3. Render the harness on the dev QA route as fixture/model-only. Completed.
4. Add route section checkpoint. Completed.
5. Only later plan real selectedRecommendation input validation.

Each step must continue to forbid bridge calls, localhost fetches, polling,
execution, active controls, credential/session handling, Supabase execution
writes, real selectedRecommendation state reads, and real preview derivation.

## Current Non-Goals

Current non-goals:

- no route change
- no Trade UI change
- no `app/trade-app.tsx` change
- no harness route wiring
- no real selectedRecommendation state read
- no real selectedRecommendation state render
- no real preview derivation
- no active handoff button
- no execution/fill/trigger behavior

## References

- [Avanza real selectedRecommendation read-only input guard route section pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-input-guard-route-section-pre-implementation-checkpoint.md)
- [Avanza real selectedRecommendation read-only input guard route section checkpoint](avanza-real-selected-recommendation-read-only-input-guard-route-section-checkpoint.md)
- [Avanza real selectedRecommendation read-only input plan](avanza-real-selected-recommendation-read-only-input-plan.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview phase completion checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
