# Avanza SelectedRecommendation Source Extraction Route Section Pre-Implementation Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_selected_recommendation_source_extraction_route_section_pre_implementation_checkpoint_added`

## Current Status

The selectedRecommendation source extraction route section pre-implementation
boundary has been satisfied, and the route section has now been rendered as
fixture/model-only content.

The pure source extraction helper exists at
`lib/avanza-selected-recommendation-source-extraction.ts`.

The static source extraction fixtures exist at
`lib/avanza-selected-recommendation-source-extraction-fixtures.ts`.

The isolated source extraction harness exists at
`components/execution/AvanzaSelectedRecommendationSourceExtractionHarness.tsx`.

The harness is imported and rendered by `app/dev/avanza-visual-qa/page.tsx`
using static source extraction fixtures only. The helper and harness are not
imported by `app/trade-app.tsx`, are not wired into the preview model, and are
not connected to real selectedRecommendation input.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false. No previewState
is derived from app or route state, no real selectedRecommendation state is read
or rendered, and no active execution is allowed.

## Preconditions Met

Preconditions:

- source extraction route section plan exists
- pure source extraction helper exists
- static source extraction fixtures exist
- isolated source extraction harness exists
- source map plan exists
- source map pre-implementation checkpoint exists
- minimal passive/default-off Trade UI wiring exists from prior work
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- source extraction remains unwired from `app/trade-app.tsx`
- source extraction remains unwired from the dev route
- source extraction remains unwired from the preview model
- real selectedRecommendation input is not connected
- no previewState is derived from app or route state

## Allowed Next Implementation Scope

This checkpoint allowed a future implementation task to update
`app/dev/avanza-visual-qa/page.tsx` to import and render
`AvanzaSelectedRecommendationSourceExtractionHarness`.

Allowed next implementation:

- render only static source extraction fixtures
- keep the section fixture/model-only
- show explicit candidate input only
- label that no real selectedRecommendation state is read
- label that no real selectedRecommendation state is rendered
- label that no previewState is derived
- label that there is no Trade UI wiring
- keep the route unlinked from main navigation
- keep `app/trade-app.tsx` unchanged
- keep source extraction disconnected from the preview model

This checkpoint permits only fixture/model-only route visibility for the
existing harness. It does not permit Trade UI wiring, real selectedRecommendation
reads, preview model connection, previewState derivation, handoff, bridge/fetch,
polling, or execution behavior.

## Completed Route Section

`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaSelectedRecommendationSourceExtractionHarness` with
`avanzaSelectedRecommendationSourceExtractionFixtures`.

The completed section remains fixture/model-only, explicit-candidate-only,
unlinked from main navigation, disconnected from Trade UI, disconnected from the
preview model, and disconnected from real selectedRecommendation input.

## Required Route Section Behavior

The future route section must:

- render `AvanzaSelectedRecommendationSourceExtractionHarness`
- render static source extraction fixtures only
- remain dev-only visual QA content
- remain fixture/model-only
- remain unlinked from main navigation
- avoid reading app state
- avoid reading route state
- avoid reading real selectedRecommendation state
- avoid connecting to the preview model
- avoid deriving previewState from app or route state
- avoid active controls

## Required Fixture/Model-Only Labels

The route-visible section must clearly show:

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

## Required Fixture Visibility

The future route section must show every source extraction fixture status:

- `no_source`
- `source_unavailable`
- `source_blocked`
- `source_invalid`
- `source_ready_read_only`

## Required Output Visibility Rules

The future route-visible output must keep these rules:

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

`source_ready_read_only` must stay read-only/model-only and must not imply
handoff readiness, execution readiness, or production readiness.

## Required Safety Guarantees

The next implementation must preserve:

- no `app/trade-app.tsx` change
- no Trade UI wiring
- no real selectedRecommendation input connection
- no selectedRecommendation preview enablement
- no change to `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
- no previewState derived from app or route state
- no preview model connection
- no active handoff button
- no prepare button
- no buy/sell CTA
- no bridge calls
- no localhost fetch
- no polling
- no new refresh behavior
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim

## Explicit Non-Goals

This checkpoint does not authorize:

- changing `app/trade-app.tsx`
- connecting real selectedRecommendation input
- enabling the preview
- changing `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` to true
- reading real selectedRecommendation state from app or route
- rendering real selectedRecommendation preview in normal/default Trade UI
- deriving previewState from app or route state
- connecting source extraction to the preview model
- adding runtime environment config
- adding localStorage/sessionStorage enablement
- adding a visible toggle
- adding handoff, prepare, or buy/sell controls
- adding bridge, localhost, runner, fill, order, credential, session, or
  Supabase write behavior

## Go/No-Go Checklist

Before broadening beyond the route-visible fixture section, confirm:

- this pre-implementation checkpoint exists
- route section plan exists
- harness exists
- fixtures cover all five source statuses
- harness source is fixture/model-only
- dev route imports the harness only for fixture/model-only display
- Trade UI does not import the helper or harness
- source extraction is not connected to the preview model
- route remains fixture/model-only
- route remains unlinked from main navigation
- preview remains hard-disabled by default
- controls remain disabled
- gate remains locked
- no execution path is introduced

Do not proceed if the next implementation requires Trade UI wiring, preview
model connection, real selectedRecommendation reads, previewState derivation,
fetching, polling, bridge/local calls, active controls, credentials, session
data, or preview enablement.

## Recommended Next Implementation Task

The route section checkpoint has now been added at
`docs/avanza-selected-recommendation-source-extraction-route-section-checkpoint.md`.
It documents the completed fixture/model-only source extraction harness section.

That checkpoint must confirm `app/trade-app.tsx` remains untouched by the route
section, real selectedRecommendation input remains disconnected, the preview
model remains disconnected, no previewState is derived from app or route state,
controls remain disabled, and no execution behavior exists.

The selectedRecommendation source mapping phase completion checkpoint has also
been added at
`docs/avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md`.
It closes the pure helper, fixtures, isolated harness, and fixture/model-only dev
route section phase.

## References

- [Avanza selectedRecommendation source extraction route section plan](avanza-selected-recommendation-source-extraction-route-section-plan.md)
- [Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation source map plan](avanza-selected-recommendation-source-map-plan.md)
- [Avanza selectedRecommendation source map pre-implementation checkpoint](avanza-selected-recommendation-source-map-pre-implementation-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
