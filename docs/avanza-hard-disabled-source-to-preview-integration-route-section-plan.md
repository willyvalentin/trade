# Avanza Hard-Disabled Source-To-Preview Integration Route Section Plan

Date: 2026-07-04

Plan status:
`avanza_hard_disabled_source_to_preview_integration_route_section_planned_only`

## Purpose

This plan defines how the isolated hard-disabled source-to-preview integration
harness may later be shown on the dev-only Avanza visual QA route.

The future route section is intended to display source-to-preview integration
fixture states only. It must remain:

- dev-only visual QA route only
- fixture/model-only
- explicit input only
- disconnected from real selectedRecommendation state
- disconnected from Trade UI runtime state
- unable to enable preview
- unable to derive previewState from app or route state
- unable to proceed to handoff
- unable to execute

## Strict Phase Boundary

This task is planning only.

This phase does not:

- change app code
- change `app/trade-app.tsx`
- change `app/dev/avanza-visual-qa/page.tsx`
- wire the integration helper or harness into Trade UI
- wire the integration helper or harness into the dev route
- read real selectedRecommendation state
- connect real selectedRecommendation input
- derive previewState from app or route state
- enable selectedRecommendation preview
- change `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` to true
- add active controls
- add handoff or execution behavior

## Allowed Future Implementation

A future implementation may update `app/dev/avanza-visual-qa/page.tsx` to
import and render:

- `AvanzaHardDisabledSourceToPreviewIntegrationHarness`
- `avanzaHardDisabledSourceToPreviewIntegrationFixtures`

The future route section may show only static hard-disabled source-to-preview
integration fixtures. It must not read real selectedRecommendation state from
app state, route state, React context, browser globals, storage, Supabase, or
network calls.

The future route section must clearly label:

- hard-disabled source-to-preview integration
- Integration fixture only
- Explicit input only
- No real selectedRecommendation state is read
- No real selectedRecommendation state is rendered
- No previewState is derived
- No Trade UI wiring
- No bridge calls
- No localhost fetch
- No polling
- No execution
- Controls disabled
- Gate locked

The route must remain unlinked from main navigation. The integration helper and
harness must remain not wired into Trade UI, and the integration must remain
disconnected from real Trade UI runtime state.

## Required Visible Fixture Statuses

The future route section must show all integration fixture statuses:

- `integration_disabled`
- `source_not_ready`
- `source_ready_preview_blocked`
- `preview_model_ready_read_only`
- `integration_blocked`

## Required Output Visibility Rules

The future route section must show that:

- `modelResult` exists only for `preview_model_ready_read_only`
- `canRenderPreview` is true only for `preview_model_ready_read_only` with
  explicit `integrationEnabled: true`
- `canProceedToHandoff` is false for all statuses
- bridge/local fetch/polling/execution are false for all statuses
- controls are disabled for all statuses
- the gate is locked for all statuses

## Forbidden Behavior

The future route section must not add:

- real selectedRecommendation state reads or rendering
- Trade UI source extraction wiring
- real runtime preview model connection
- previewState derivation from app or route state
- default Trade UI selectedRecommendation preview
- active handoff button
- prepare button
- buy/sell CTA
- bridge calls
- localhost fetch
- polling
- trigger/fill/click/review/final/submit/order behavior
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness claims

## Future Test Requirements

When the route section is implemented, tests must prove:

- the route renders the integration harness section
- the route section says Integration fixture only
- the route section says Explicit input only
- the route section says no real selectedRecommendation state is read/rendered
- the route section says no previewState is derived
- all five integration fixture statuses are visible
- `preview_model_ready_read_only` is labeled read-only/model-only
- `modelResult` appears only for `preview_model_ready_read_only`
- `canRenderPreview` is true only for `preview_model_ready_read_only` with
  explicit `integrationEnabled: true`
- controls are disabled
- the gate is locked
- no active handoff button exists
- no buy/sell CTA exists
- no prepare button exists
- no live endpoint strings or exact trigger phrase appear
- the route remains unlinked from main navigation
- `app/trade-app.tsx` does not import the integration helper or harness

## Recommended Implementation Sequence

1. Add this route section plan.
2. Add a route section pre-implementation checkpoint.
3. Render the integration harness on the dev QA route as fixture/model-only.
4. Add a route section checkpoint.
5. Add a hard-disabled source-to-preview integration phase completion
   checkpoint.
6. Only later consider hard-disabled Trade UI branch wiring.

Every step must keep selectedRecommendation preview disabled by default, keep
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, avoid real runtime
activation, avoid handoff, avoid bridge/local calls, avoid Supabase writes, and
avoid execution.

## Pre-Implementation Checkpoint Follow-Up

Checkpoint status:
`avanza_hard_disabled_source_to_preview_integration_route_section_pre_implementation_checkpoint_added`

`docs/avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md`
now records the go/no-go boundary before rendering the isolated integration
harness on the dev-only visual QA route. It permits only future
fixture/model-only route visibility and still forbids Trade UI wiring, real
selectedRecommendation reads, preview enablement, app/route previewState
derivation, handoff, bridge/fetch/polling, and execution.

## Route Section Rendered Follow-Up

Route section status:
`avanza_hard_disabled_source_to_preview_integration_route_section_rendered_fixture_only`

`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaHardDisabledSourceToPreviewIntegrationHarness` with only static
`avanzaHardDisabledSourceToPreviewIntegrationFixtures`.

The route section is fixture/model-only and visibly states:

- hard-disabled source-to-preview integration
- Integration fixture only
- Explicit input only
- No real selectedRecommendation state is read
- No real selectedRecommendation state is rendered
- No previewState is derived
- No Trade UI wiring
- No bridge calls
- No localhost fetch
- No polling
- No execution
- Controls disabled
- Gate locked

All five integration statuses are visible:

- `integration_disabled`
- `source_not_ready`
- `source_ready_preview_blocked`
- `preview_model_ready_read_only`
- `integration_blocked`

`preview_model_ready_read_only` remains read-only/model-only. `modelResult` is
visible only for that status. `canRenderPreview` is true only for that status
with explicit fixture input, while `canProceedToHandoff`, bridge/local
fetch/polling/execution, active controls, and unlocked gates remain false or
locked for every fixture.

## Route Section Checkpoint Follow-Up

Checkpoint status:
`avanza_hard_disabled_source_to_preview_integration_route_section_checkpoint_added`

`docs/avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md`
now records the completed fixture/model-only dev-route section. It confirms the
route renders only static integration fixtures, all five statuses are visible,
`preview_model_ready_read_only` remains read-only/model-only, model output stays
exclusive to that status, Trade UI remains unwired, real selectedRecommendation
input remains disconnected, `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
remains false, and no active controls, handoff, prepare, buy/sell CTA,
bridge/fetch/polling, order behavior, credentials, sessions, or Supabase writes
were added.

## Phase Completion Checkpoint Follow-Up

Phase status:
`avanza_hard_disabled_source_to_preview_integration_phase_completion_checkpoint_added`

`docs/avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md`
now marks the hard-disabled source-to-preview integration planning/model phase
complete. It confirms the pure helper, fixtures, isolated harness, and
fixture/model-only dev route section are complete while keeping Trade UI
unwired and execution forbidden.

## Current Non-Implementation Confirmation

Current state remains:

- integration harness is not wired into Trade UI
- integration harness is rendered only on the dev route as fixture/model-only
  content
- source extraction remains not wired into Trade UI
- real selectedRecommendation input is not connected, read, or rendered
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- selectedRecommendation preview remains disabled by default in Trade UI
- no previewState is derived from app or route state
- no active controls, handoff button, prepare button, or buy/sell CTA exists
- no bridge/fetch/polling/order behavior exists
- no credential/session handling exists
- no Supabase execution write exists

## References

- [Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-pre-implementation-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
- [Avanza selectedRecommendation source map plan](avanza-selected-recommendation-source-map-plan.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
