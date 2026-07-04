# Avanza Trade UI Read-Only SelectedRecommendation Preview Model Route Section Plan

## Purpose

This plan defines a future fixture/model-only section on the isolated dev-only
Avanza visual QA route for the Trade UI read-only selectedRecommendation preview
model harness.

The future section may display the static Trade UI preview model fixture states
for visual QA. It must remain dev-only, fixture/model-only, explicit
input/config only, and non-executing.

It must not read real selectedRecommendation state, must not derive app/route
preview state, must not wire Trade UI, and must not enable any handoff behavior.

## Strict Phase Boundary

This document is planning-only.

This phase does not permit:

- route code changes
- Trade UI changes
- app code changes
- real selectedRecommendation reads
- real selectedRecommendation rendering
- real app/route preview derivation
- default Trade UI selectedRecommendation preview
- bridge calls
- localhost fetch
- polling
- execution

`app/trade-app.tsx` must remain unchanged. `app/dev/avanza-visual-qa/page.tsx`
must not be changed by this planning phase.

## Allowed Future Implementation

A later explicit implementation may render
`AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness` from:

`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx`

on:

`app/dev/avanza-visual-qa/page.tsx`

Only static fixture data from
`lib/avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures.ts`
may be shown.

The route section must clearly label:

- Trade UI read-only selectedRecommendation preview model
- Preview model fixture only
- Default-off
- Explicit input/config only
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

The route must remain unlinked from main navigation. The harness must remain
outside Trade UI.

## Required Fixture Statuses

The future route-visible section must show all static model fixture statuses:

- `hidden_default`
- `disabled_config`
- `no_selected_recommendation`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

## PreviewState Rule

The route-visible section must preserve the model previewState rule:

- `previewState` exists only for `read_only_preview_ready`
- `previewState` is absent for every other status
- `read_only_preview_ready` is labeled passive/read-only/model-only, not active
- `canRenderReadOnlyPreview` is true only for `read_only_preview_ready`
- `canProceedToHandoff` remains false for every fixture

## Forbidden Behavior

The future route section must not add:

- real selectedRecommendation state reads or rendering
- real app/route preview state derivation or rendering
- default Trade UI selectedRecommendation preview
- active handoff button
- bridge calls
- localhost fetch
- polling
- trigger/fill/click/review/final/submit/order behavior
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness claims

Controls must remain disabled and the pre-activation gate must remain locked.

## Future Test Requirements

Any future implementation must prove:

- route renders the Trade UI preview model harness section
- route section says Preview model fixture only
- route section says Default-off
- route section says Explicit input/config only
- route section says no real selectedRecommendation state is read
- route section says no real selectedRecommendation state is rendered
- route section says no app/route preview state is derived
- all eight Trade UI preview model fixture statuses are visible
- `read_only_preview_ready` is labeled passive/read-only/model-only
- `previewState` exists only for `read_only_preview_ready`
- controls remain disabled
- gate remains locked
- no active handoff button exists
- no live endpoint strings or exact trigger phrase appears
- route remains unlinked from main navigation
- `app/trade-app.tsx` does not import the harness

## Recommended Implementation Sequence

1. Add this route section plan.
2. Add a route section pre-implementation checkpoint.
3. Render the Trade UI preview model harness on the dev QA route as
   fixture/model-only.
4. Add a route section checkpoint.
5. Add a Trade UI preview model phase completion checkpoint.
6. Only later consider a separate default-off Trade UI wiring plan.

## Pre-Implementation Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-pre-implementation-checkpoint.md`
now records the go/no-go boundary before rendering the harness on the dev-only
visual QA route.

The checkpoint permits only a future fixture/model-only route section. It still
forbids Trade UI changes, real selectedRecommendation reads, app/route preview
derivation, active controls, bridge/fetch/polling, handoff, and execution.

## Route Section Implementation Follow-Up

The dev-only visual QA route now renders the Trade UI read-only
selectedRecommendation preview model harness as a fixture/model-only section.
It uses only static model fixtures, remains unlinked from main navigation, and
does not wire the harness into Trade UI.

The visible section keeps `previewState` exclusive to
`read_only_preview_ready`, labels that state passive/read-only/model-only, keeps
controls disabled, keeps the gate locked, and preserves no handoff, bridge,
localhost fetch, polling, or execution behavior.

## Route Section Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md`
now closes the fixture/model-only route-section step. It records the visible
fixture states, previewState visibility rule, no real selectedRecommendation
state guarantee, no app/route preview derivation guarantee, and unchanged Trade
UI default behavior.

## Phase Completion Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md`
now marks the full preview model phase complete at fixture/model-only level:
model, fixtures, harness, and route section are complete, still without Trade UI
wiring or execution.

## Current Confirmation

Current state after the fixture/model-only route section:

- the harness is not wired into Trade UI
- `app/trade-app.tsx` remains unchanged
- `app/dev/avanza-visual-qa/page.tsx` renders the harness only with static
  fixtures
- no real selectedRecommendation state is read or rendered from app/route
- no real app/route preview state is derived or rendered
- selectedRecommendation preview remains disabled by default in Trade UI
- controls remain disabled
- gate remains locked
- no bridge calls, localhost fetch, polling, trigger/fill/order behavior, or
  Supabase execution writes are added

## References

- [Avanza Trade UI read-only selectedRecommendation preview model phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview integration plan](avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation architecture checkpoint before Trade UI](avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md)
- [Avanza real selectedRecommendation read-only derivation phase completion checkpoint](avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
