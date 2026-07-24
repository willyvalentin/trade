# Avanza Trade UI Read-Only SelectedRecommendation Preview Component Route Section Plan

Date: 2026-07-04

Plan status:
`avanza_trade_ui_read_only_selected_recommendation_preview_component_route_section_planned_no_wiring`

## Purpose

This plan defines a future route-visible section for the passive Trade UI
read-only selectedRecommendation preview component harness.

The future section is limited to the isolated dev-only Avanza visual QA route.
It may display passive component fixture states only.

Purpose:

- allow future route-visible display of passive preview component fixture states
- dev-only visual QA route only
- fixture/model-only
- explicit `modelResult` fixture only
- no real selectedRecommendation state
- no app/route preview derivation
- no Trade UI wiring
- no execution

## Strict Phase Boundary

This phase is planning only.

This plan does not change route code, Trade UI code, app code, or runtime
configuration.

Strict boundary:

- no route code changes
- no Trade UI changes
- no app code changes
- no `app/trade-app.tsx` changes
- no `app/dev/avanza-visual-qa/page.tsx` changes
- no real selectedRecommendation read
- no real selectedRecommendation render
- no real app/route preview derivation
- no app/route preview rendering from real state
- no default Trade UI selectedRecommendation preview

## Allowed Future Implementation

A future implementation task may render the isolated passive component harness
on the dev-only visual QA route.

Allowed future implementation:

- `app/dev/avanza-visual-qa/page.tsx` may import and render
  `AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness`
- only static passive preview component fixtures may be shown
- fixtures must use explicit `modelResult` values only
- route remains unlinked from main navigation
- component and harness remain not wired into Trade UI
- `app/trade-app.tsx` remains untouched unless a separate default-off Trade UI
  wiring checkpoint explicitly allows it later

The route section must clearly label:

- Passive Trade UI read-only selectedRecommendation preview
- Component fixture only
- Explicit modelResult only
- Default-off
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

## Required Visible Fixture Statuses

If the harness is rendered on the route later, these fixture statuses must be
visible:

- `hidden_default`
- `disabled_config`
- `no_selected_recommendation`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

## PreviewState Route-Visible Rule

The route-visible rule must remain strict:

- previewState visible only for `read_only_preview_ready`
- previewState absent/null for every other status
- `read_only_preview_ready` labeled passive/read-only/model-only, not active

`read_only_preview_ready` must not imply handoff readiness, execution readiness,
or production readiness.

## Forbidden Behavior

This plan and any future route section continue to forbid:

- real selectedRecommendation state read/rendered
- real app/route preview state derived/rendered
- default Trade UI selectedRecommendation preview
- active handoff button
- bridge calls
- localhost fetch
- polling
- trigger/fill/click/review/final/submit/order behavior
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- live Avanza behavior
- production readiness claim

## Future Test Requirements

Future implementation tests must prove:

- route renders passive preview component harness section
- route section says Component fixture only
- route section says Explicit modelResult only
- route section says Default-off
- route section says no real selectedRecommendation state is read/rendered
- route section says no app/route preview state is derived
- all eight passive preview component fixture statuses are visible
- `read_only_preview_ready` is labeled passive/read-only/model-only
- previewState exists only for `read_only_preview_ready`
- controls disabled
- gate locked
- no active handoff button
- no buy/sell CTA
- no prepare button
- no live endpoint strings or exact trigger phrase
- route remains unlinked from main navigation
- `app/trade-app.tsx` does not import the component or harness

## Recommended Implementation Sequence

1. Add this route section plan.
2. Add route section pre-implementation checkpoint.
3. Render the passive preview component harness on the dev QA route as
   fixture/model-only.
4. Add route section checkpoint.
5. Add passive component phase completion checkpoint.
6. Only later consider a separate default-off Trade UI wiring checkpoint before
   touching `app/trade-app.tsx`.

## Pre-Implementation Checkpoint Follow-Up

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_preview_component_route_section_pre_implementation_checkpoint_added`

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-pre-implementation-checkpoint.md`
now records the go/no-go boundary before rendering the passive component
harness on the dev-only visual QA route.

The checkpoint permits only a future fixture/model-only route section using
static component fixtures and explicit `modelResult` values. It still forbids
Trade UI wiring, `app/trade-app.tsx` changes, real selectedRecommendation reads
from app/route, app/route preview derivation, active controls,
bridge/fetch/polling, handoff, and execution.

## Route Section Implementation Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders the passive component harness
as a fixture/model-only section.

The section imports `AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness`
and static component fixtures only. It displays the passive component fixture
states with explicit `modelResult` values, keeps previewState exclusive to
`read_only_preview_ready`, keeps the route unlinked from main navigation, and
does not wire anything into Trade UI.

## Route Section Checkpoint Follow-Up

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_preview_component_route_section_checkpoint_added`

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md`
now records the completed route-visible fixture/model-only section.

The checkpoint confirms all eight component fixture statuses are visible,
`read_only_preview_ready` remains passive/read-only/model-only, previewState is
absent/null for every other status, and all bridge/fetch/polling/execution
paths remain forbidden.

## Current Non-Implementation Confirmation

Current state remains:

- `app/trade-app.tsx` unchanged
- passive component/harness not wired into Trade UI
- passive component/harness rendered only on the dev route as fixture/model-only
- no real selectedRecommendation state read/rendered from app/route
- no real app/route preview state derived/rendered
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- no Trade UI fetch, refresh, polling, trigger, fill, click, review, final,
  submit, order, credential/session handling, or Supabase write

## Phase Completion Follow-Up

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_preview_component_phase_completion_checkpoint_added`

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md`
now records the passive component/default-off wiring preparation phase as
complete at fixture/model-only scope.

## References

- [Avanza Trade UI read-only selectedRecommendation preview component phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring plan](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview integration plan](avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation architecture checkpoint before Trade UI](avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
