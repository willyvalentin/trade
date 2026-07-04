# Avanza Real SelectedRecommendation Read-Only Derivation Route Section Plan

Date: 2026-07-04

Plan status:
`avanza_real_selected_recommendation_read_only_derivation_route_section_plan_added`

## Purpose

This plan defines how the isolated real selectedRecommendation read-only
derivation harness may later be shown on the dev-only Avanza visual QA route.

The future section is for visual QA only:

- dev-only visual QA route only
- fixture/model-only
- explicit fixture input only
- no real selectedRecommendation state
- no app/route preview derivation
- no Trade UI wiring
- no execution

The purpose is to make the derivation fixture states visible on the existing
isolated QA surface without changing the default Trade UI behavior or reading
real app/route state.

## Strict Phase Boundary

This task is planning only.

This plan does not authorize code changes:

- no route code changes
- no Trade UI changes
- no app code changes
- no `app/trade-app.tsx` changes
- no `app/dev/avanza-visual-qa/page.tsx` changes
- no real selectedRecommendation read
- no real selectedRecommendation render
- no real app/route preview derivation
- no real app/route preview render

The isolated derivation harness remains unwired from Trade UI and the dev
route until a later explicit implementation task.

## Allowed Future Implementation

A future implementation may update `app/dev/avanza-visual-qa/page.tsx` to
import and render:

`AvanzaRealSelectedRecommendationReadOnlyDerivationHarness`

That future route section may show only static derivation fixtures from:

`lib/avanza-real-selected-recommendation-read-only-derivation-fixtures.ts`

The section must clearly label:

- Real selectedRecommendation read-only derivation
- Derivation fixture only
- Explicit input only
- No real selectedRecommendation state is read
- No real selectedRecommendation state is rendered
- No app/route preview state is derived
- No Trade UI wiring
- No bridge calls
- No localhost fetch
- No polling
- No execution
- Controls disabled
- Gate locked

The route must remain unlinked from main navigation, and the harness must
remain unwired from Trade UI.

## Required Visible Fixture Statuses

After a future implementation, the route-visible section must show all
derivation statuses:

- `no_input`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

Each status must remain diagnostic/model-only and must not imply handoff or
execution readiness.

## PreviewState Route Rule

The route-visible section must preserve the fixture rule:

- `previewState` is visible only for `read_only_preview_ready`
- `previewState` is absent or null for every other status
- `read_only_preview_ready` is labeled read-only/model-only, not active

No route-visible fixture may derive preview state from app state, route state,
Trade UI state, or real selectedRecommendation state.

## Forbidden Behavior

This plan and any future route-section implementation forbid:

- real selectedRecommendation state read/rendered
- real app/route preview state derived/rendered
- default Trade UI selectedRecommendation preview
- active handoff button
- bridge calls
- localhost fetch
- polling
- trigger/fill/click/review/final/submit/order
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness claim
- execution readiness claim

## Future Test Requirements

A future implementation must add tests proving:

- route renders the derivation harness section
- route section says derivation fixture only
- route section says explicit input only
- route section says no real selectedRecommendation state is read
- route section says no real selectedRecommendation state is rendered
- route section says no app/route preview state is derived
- all six derivation fixture statuses are visible
- `read_only_preview_ready` is labeled model-only/read-only
- `previewState` exists only for `read_only_preview_ready`
- controls disabled
- gate locked
- no active handoff button
- no live endpoint strings or exact trigger phrase
- route remains unlinked from main navigation
- `app/trade-app.tsx` does not import the harness

## Recommended Implementation Sequence

1. Add this route section plan.
2. Add a route section pre-implementation checkpoint. Completed.
3. Render the derivation harness on the dev QA route as fixture/model-only.
4. Add a route section checkpoint.
5. Add a derivation phase completion checkpoint.

Every step must keep Trade UI default behavior unchanged, keep
selectedRecommendation preview disabled by default, keep controls disabled,
keep the pre-activation gate locked, and continue to forbid bridge/local/
poll/execution behavior.

## References

- [Avanza real selectedRecommendation read-only derivation plan](avanza-real-selected-recommendation-read-only-derivation-plan.md)
- [Avanza real selectedRecommendation read-only derivation pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-derivation-pre-implementation-checkpoint.md)
- [Avanza real selectedRecommendation read-only derivation route section pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-derivation-route-section-pre-implementation-checkpoint.md)
- [Avanza real selectedRecommendation read-only input plan](avanza-real-selected-recommendation-read-only-input-plan.md)
- [Avanza real selectedRecommendation read-only input guard route section checkpoint](avanza-real-selected-recommendation-read-only-input-guard-route-section-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview phase completion checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Pre-Implementation Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-derivation-route-section-pre-implementation-checkpoint.md`
now records the explicit go/no-go boundary before rendering the derivation
harness on the isolated dev QA route.

The checkpoint permits only a future fixture/model-only route section. It
keeps `app/trade-app.tsx` unchanged, keeps the current dev route unchanged in
this step, keeps the route unlinked from main navigation, and continues to
forbid real selectedRecommendation reads, app/route preview derivation, Trade
UI wiring, active controls, bridge calls, localhost fetches, polling, and
execution.

## Route Section Implementation Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders the real
selectedRecommendation read-only derivation harness as the fixture/model-only
section described by this plan.

The route imports the harness and the static derivation fixture list, passes
those fixtures explicitly, and remains unlinked from main navigation. The
section displays the fixture-only labels, all six derivation statuses through
the harness, and keeps `previewState` limited to the
`read_only_preview_ready` fixture. No real selectedRecommendation state is
read or rendered from app/route, no app/route preview state is derived, and
Trade UI remains unchanged.

## Route Section Checkpoint Status

`docs/avanza-real-selected-recommendation-read-only-derivation-route-section-checkpoint.md`
has been added for the completed route section.

It records the dev QA route as fixture/model-only, confirms all six derivation
statuses are route-visible through static fixtures, confirms
`read_only_preview_ready` is model-only/read-only and not active, and keeps
Trade UI wiring, real selectedRecommendation reads, app/route preview
derivation, bridge/local/polling behavior, and execution forbidden.

## Phase Completion Checkpoint Status

`docs/avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md`
has been added to mark this derivation phase complete at the fixture/model-only
level.

The completion checkpoint keeps the route section as static fixtures only and
keeps Trade UI wiring, real selectedRecommendation reads, active controls, and
execution out of scope.
