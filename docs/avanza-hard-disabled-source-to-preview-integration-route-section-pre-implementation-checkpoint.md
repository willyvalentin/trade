# Avanza Hard-Disabled Source-To-Preview Integration Route Section Pre-Implementation Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_hard_disabled_source_to_preview_integration_route_section_pre_implementation_checkpoint_added`

## Current Status

The hard-disabled source-to-preview integration route section plan exists, but
the integration harness has not been rendered on the dev-only Avanza visual QA
route.

Current state remains:

- `app/dev/avanza-visual-qa/page.tsx` does not import or render
  `AvanzaHardDisabledSourceToPreviewIntegrationHarness`
- `app/trade-app.tsx` does not import the integration helper or harness
- source extraction remains not wired into Trade UI
- real selectedRecommendation input is not connected, read, or rendered
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- selectedRecommendation preview remains disabled by default in Trade UI
- no previewState is derived from app or route state
- no active controls, handoff, prepare, buy/sell, bridge, fetch, polling, order,
  credential/session handling, or Supabase write exists

## Preconditions Met

The following artifacts already exist:

- `docs/avanza-hard-disabled-source-to-preview-integration-route-section-plan.md`
- `docs/avanza-hard-disabled-source-to-preview-integration-plan.md`
- `docs/avanza-hard-disabled-source-to-preview-integration-pre-implementation-checkpoint.md`
- `lib/avanza-hard-disabled-source-to-preview-integration.ts`
- `lib/avanza-hard-disabled-source-to-preview-integration-fixtures.ts`
- `components/execution/AvanzaHardDisabledSourceToPreviewIntegrationHarness.tsx`
- `lib/avanza-selected-recommendation-source-extraction.ts`
- `lib/avanza-selected-recommendation-source-extraction-fixtures.ts`
- `components/execution/AvanzaSelectedRecommendationSourceExtractionHarness.tsx`
- `lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts`

The source extraction harness is already rendered on the dev route as
fixture/model-only content. The hard-disabled source-to-preview integration
harness is still isolated and unwired.

## Allowed Next Implementation Scope

The next implementation may update only `app/dev/avanza-visual-qa/page.tsx` to
render the hard-disabled source-to-preview integration harness as a
fixture/model-only route section.

The future implementation may:

- import and render `AvanzaHardDisabledSourceToPreviewIntegrationHarness`
- use only static hard-disabled source-to-preview integration fixtures
- label the section fixture/model-only
- state that inputs are explicit only
- state that no real selectedRecommendation state is read or rendered
- state that no previewState is derived
- state that there is no Trade UI wiring
- keep the route unlinked from main navigation

The future implementation must keep `app/trade-app.tsx` unchanged and must not
create a real runtime preview model connection or preview enablement path.

## Required Route Section Behavior

The future route section must:

- render static integration fixtures only
- remain dev-route-only
- remain fixture/model-only
- remain explicit-input-only
- keep the dev route unlinked from main navigation
- keep the helper and harness unwired from Trade UI
- avoid reading app state, route state, React context, browser globals, storage,
  Supabase, bridge, or network
- avoid deriving previewState from app or route state
- avoid active controls and execution behavior

## Required Fixture/Model-Only Labels

The future route section must visibly include:

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

## Required Output Visibility Rules

The future route section must show all integration statuses:

- `integration_disabled`
- `source_not_ready`
- `source_ready_preview_blocked`
- `preview_model_ready_read_only`
- `integration_blocked`

The future route section must show that:

- `modelResult` is visible only for `preview_model_ready_read_only`
- `canRenderPreview` is true only for `preview_model_ready_read_only` with
  explicit `integrationEnabled: true`
- `canProceedToHandoff` is false for all statuses
- bridge/local fetch/polling/execution are false for all statuses
- controls are disabled for all statuses
- the gate is locked for all statuses

## Required Safety Guarantees

The future route section must preserve:

- no real selectedRecommendation state read or rendering
- no Trade UI source extraction wiring
- no real runtime preview model connection
- no previewState derivation from app or route state
- no default Trade UI selectedRecommendation preview
- no active handoff button
- no prepare button
- no buy/sell CTA
- no bridge calls
- no localhost fetch
- no polling
- no trigger/fill/click/review/final/submit/order behavior
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim

## Explicit Non-Goals

This checkpoint does not authorize:

- changing `app/trade-app.tsx`
- wiring the integration helper or harness into Trade UI
- connecting source extraction to real app state
- connecting real selectedRecommendation input
- enabling preview
- changing `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` to true
- reading real selectedRecommendation state from app or route
- rendering real selectedRecommendation preview in normal/default Trade UI
- deriving preview from app or route state
- adding runtime env config
- adding localStorage/sessionStorage enablement
- adding a visible toggle
- enabling a handoff button
- adding a prepare button
- adding a buy/sell CTA
- adding polling or new refresh behavior
- calling localhost or bridge endpoints
- invoking runner/fill/click/review/final/submit/order behavior
- handling credentials/session/BankID/cookies/storage
- writing Supabase execution records
- claiming production readiness

## Go/No-Go Checklist

Before rendering the route section, confirm:

- this pre-implementation checkpoint exists
- the route section plan exists
- the hard-disabled source-to-preview integration helper exists
- the integration fixtures cover all five statuses
- the integration harness exists and is isolated
- `app/trade-app.tsx` remains unchanged
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- the route remains unlinked from main navigation
- source extraction remains not wired into Trade UI
- real selectedRecommendation input is not connected
- no previewState is derived from app or route state
- no active controls or execution path exists

Do not proceed if the implementation requires Trade UI wiring, real
selectedRecommendation reads, preview enablement, app/route previewState
derivation, runtime enablement, bridge/local calls, polling, active controls,
credentials, session data, Supabase writes, or execution.

## Recommended Next Implementation Task

Render `AvanzaHardDisabledSourceToPreviewIntegrationHarness` on
`app/dev/avanza-visual-qa/page.tsx` as a fixture/model-only section.

That task must keep `app/trade-app.tsx` unchanged, keep the route unlinked from
main navigation, avoid real selectedRecommendation input, avoid preview
enablement, avoid app or route previewState derivation, keep controls disabled,
keep the gate locked, and avoid all handoff, bridge/fetch/polling, order, and
execution behavior.

## Post-Checkpoint Implementation Note

The permitted next task has now been completed as fixture/model-only route
visibility:

- `app/dev/avanza-visual-qa/page.tsx` renders
  `AvanzaHardDisabledSourceToPreviewIntegrationHarness`
- only static `avanzaHardDisabledSourceToPreviewIntegrationFixtures` are used
- the route remains unlinked from main navigation
- `app/trade-app.tsx` remains outside this route section
- source extraction remains not wired into Trade UI
- real selectedRecommendation input is not connected, read, or rendered
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- no previewState is derived from app or route state
- no active controls, handoff, prepare, buy/sell CTA, bridge/fetch/polling,
  order behavior, credential/session handling, or Supabase write was added

## Route Section Checkpoint Follow-Up

The completed fixture/model-only route section is now recorded in
`docs/avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md`.
It confirms the dev route renders only static integration fixtures, remains
unlinked from main navigation, keeps Trade UI unwired, keeps real
selectedRecommendation input disconnected, keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
false, and adds no active controls or execution behavior.

The phase completion checkpoint now exists at
`docs/avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md`.
It closes the hard-disabled source-to-preview planning/model phase and records
the next recommended phase as hard-disabled Trade UI branch wiring planning.

## References

- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section plan](avanza-hard-disabled-source-to-preview-integration-route-section-plan.md)
- [Avanza hard-disabled source-to-preview integration route section checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
- [Avanza hard-disabled source-to-preview integration pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-pre-implementation-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
- [Avanza selectedRecommendation source map plan](avanza-selected-recommendation-source-map-plan.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
