# Avanza SelectedRecommendation Source Extraction Route Section Plan

Date: 2026-07-04

Plan status:
`avanza_selected_recommendation_source_extraction_route_section_rendered_fixture_model_only`

## Purpose

This plan defines how the isolated selectedRecommendation source extraction
harness may later be shown on the dev-only Avanza visual QA route.

The planned route section is:

- dev-only visual QA route only
- fixture/model-only
- explicit candidate input only
- source extraction fixture display only
- no real selectedRecommendation state read from app or route
- no real selectedRecommendation state rendered
- no preview model connection
- no app or route previewState derivation
- no Trade UI wiring
- no execution

The purpose is visual QA of source extraction fixture states before any later
connection to the hard-disabled Trade UI preview path.

## Strict Phase Boundary

This plan originally scoped route-section planning. The route section has now
been implemented as fixture/model-only content.

The implementation does not change Trade UI code, app runtime configuration, or
the passive/default-off Trade UI preview path.

Strict boundary:

- no Trade UI changes
- no app code changes
- no `app/trade-app.tsx` changes
- no real selectedRecommendation read
- no real selectedRecommendation render
- no real input connection
- no preview model connection
- no app or route previewState derivation
- no default Trade UI selectedRecommendation preview
- route section uses static source extraction fixtures only

## Allowed Future Implementation

The isolated source extraction harness is now rendered on the dev-only visual QA
route as a fixture/model-only section.

Implemented behavior:

- `app/dev/avanza-visual-qa/page.tsx` imports and renders
  `AvanzaSelectedRecommendationSourceExtractionHarness`
- only static source extraction fixtures are shown
- fixtures must use explicit candidate input only
- route remains unlinked from main navigation
- helper and harness remain not wired into Trade UI
- helper and harness remain not wired into the passive preview model path
- `app/trade-app.tsx` remains untouched unless a separate default-off Trade UI
  wiring checkpoint explicitly allows it later

The route section must clearly label:

- selectedRecommendation source extraction
- Source fixture only
- Explicit candidate input only
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

## Required Visible Fixture Statuses

The route-visible harness shows these source extraction fixture statuses:

- `no_source`
- `source_unavailable`
- `source_blocked`
- `source_invalid`
- `source_ready_read_only`

## Required Output Visibility Rules

The route-visible output rules remain strict:

- `selectedRecommendationLikeInput` visible only for `source_ready_read_only`
- `normalizedSourceSummary` visible only for `source_ready_read_only`
- `canProceedToPreviewModel` true only for `source_ready_read_only`
- `canProceedToHandoff` false for all statuses
- `canCallBridge` false for all statuses
- `canFetchLocalhost` false for all statuses
- `canPoll` false for all statuses
- `canExecute` false for all statuses
- controls disabled for all statuses
- gate locked for all statuses

`source_ready_read_only` must be labeled read-only/model-only. It must not imply
handoff readiness, execution readiness, or production readiness.

## Forbidden Behavior

This plan and any future route section continue to forbid:

- real selectedRecommendation state read/rendered
- preview model connection
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
- live Avanza behavior
- production readiness claim

## Test Requirements

Route-section tests must prove:

- route renders the selectedRecommendation source extraction harness section
- route section says Source fixture only
- route section says Explicit candidate input only
- route section says no real selectedRecommendation state is read/rendered
- route section says no previewState is derived
- all five source extraction fixture statuses are visible
- `source_ready_read_only` is labeled read-only/model-only
- `selectedRecommendationLikeInput` appears only for `source_ready_read_only`
- `normalizedSourceSummary` appears only for `source_ready_read_only`
- controls disabled
- gate locked
- no active handoff button exists
- no buy/sell CTA
- no prepare button
- no live endpoint strings appear
- no exact trigger phrase appears
- route remains unlinked from main navigation
- `app/trade-app.tsx` does not import the source extraction helper or harness

## Recommended Implementation Sequence

1. Add this route section plan.
2. Add route section pre-implementation checkpoint. Completed.
3. Render the source extraction harness on the dev QA route as
   fixture/model-only. Completed.
4. Add route section checkpoint.
5. Add source mapping phase completion checkpoint.
6. Only later consider connecting source extraction to the hard-disabled Trade
   UI preview path.

Each step must continue to forbid bridge calls, localhost fetches, polling,
execution, active controls, credential/session handling, Supabase execution
writes, real selectedRecommendation state reads, preview model connection, and
real previewState derivation.

## Pre-Implementation Checkpoint Follow-Up

Checkpoint status:
`avanza_selected_recommendation_source_extraction_route_section_pre_implementation_checkpoint_added`

`docs/avanza-selected-recommendation-source-extraction-route-section-pre-implementation-checkpoint.md`
now records the go/no-go boundary before rendering the source extraction harness
on the dev-only visual QA route.

The checkpoint permits only a future fixture/model-only route section using
static source extraction fixtures and explicit candidate input. It still forbids
Trade UI wiring, `app/trade-app.tsx` changes, real selectedRecommendation reads
from app/route, preview model connection, previewState derivation, active
controls, bridge/fetch/polling, handoff, and execution.

## Route Section Implementation Follow-Up

Implementation status:
`avanza_selected_recommendation_source_extraction_route_section_rendered_fixture_model_only`

`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaSelectedRecommendationSourceExtractionHarness` as a fixture/model-only
section.

The section imports static source extraction fixtures only. It displays
`no_source`, `source_unavailable`, `source_blocked`, `source_invalid`, and
`source_ready_read_only`; keeps `selectedRecommendationLikeInput` and
`normalizedSourceSummary` exclusive to `source_ready_read_only`; keeps
`canProceedToPreviewModel` true only for `source_ready_read_only`; and keeps all
handoff, bridge/local fetch, polling, execution, control, and gate safety values
locked down.

## Route Section Checkpoint Follow-Up

Checkpoint status:
`avanza_selected_recommendation_source_extraction_route_section_checkpoint_added`

`docs/avanza-selected-recommendation-source-extraction-route-section-checkpoint.md`
now records the completed fixture/model-only route section. It confirms the
route renders `AvanzaSelectedRecommendationSourceExtractionHarness` with static
source extraction fixtures only, displays all five source statuses, keeps
`source_ready_read_only` read-only/model-only, keeps the route unlinked from main
navigation, and keeps source extraction disconnected from Trade UI, real
selectedRecommendation input, the preview model, and app or route previewState
derivation.

## Phase Completion Follow-Up

Phase status:
`avanza_selected_recommendation_source_mapping_phase_complete`

`docs/avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md`
now closes the source mapping phase. It confirms the pure helper, fixtures,
isolated harness, and fixture/model-only dev route section are complete while
source extraction remains disconnected from Trade UI, real selectedRecommendation
input, the preview model, and app or route previewState derivation.

## Current Non-Implementation Confirmation

Current state remains:

- `app/trade-app.tsx` unchanged by this plan
- source extraction helper not wired into Trade UI
- source extraction harness not wired into Trade UI
- source extraction harness rendered on the dev route as fixture/model-only
- source extraction not wired into the preview model
- no real selectedRecommendation state read/rendered from app or route
- no previewState derived from app or route state
- selectedRecommendation preview disabled by default in Trade UI
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- controls disabled
- pre-activation gate locked
- no Trade UI fetch, refresh, polling, trigger, fill, click, review, final,
  submit, order, credential/session handling, or Supabase write

## References

- [Avanza selectedRecommendation source map plan](avanza-selected-recommendation-source-map-plan.md)
- [Avanza selectedRecommendation source map pre-implementation checkpoint](avanza-selected-recommendation-source-map-pre-implementation-checkpoint.md)
- [Avanza selectedRecommendation source extraction route section pre-implementation checkpoint](avanza-selected-recommendation-source-extraction-route-section-pre-implementation-checkpoint.md)
- [Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
