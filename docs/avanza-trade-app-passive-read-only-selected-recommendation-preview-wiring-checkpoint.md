# Avanza Trade App Passive Read-Only SelectedRecommendation Preview Wiring Checkpoint

## Current Status

The minimal passive/default-off read-only selectedRecommendation preview wiring
now exists in `app/trade-app.tsx`.

This checkpoint records the completed minimal wiring only. It does not mark the
preview as enabled, execution-ready, production-ready, or connected to real
selectedRecommendation state.

## Implemented app/trade-app.tsx Behavior

`app/trade-app.tsx` was touched only for minimal passive/default-off wiring.

The app now imports the passive preview component:

- `AvanzaTradeUiReadOnlySelectedRecommendationPreview`

The app also imports only the default hidden model:

- `avanzaTradeUiReadOnlySelectedRecommendationPreviewDefaultModel`

No builder is called from `app/trade-app.tsx` for this passive branch.

## Default-Off Guard Behavior

The guard is hard-disabled:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` is false
- preview is hard-disabled by default
- no runtime environment config exists
- no localStorage/sessionStorage enablement exists
- no visible toggle exists

Because the guard is false, the passive preview branch returns `null` by
default.

## Passive Component Wiring Behavior

The passive component is referenced only behind the hard-disabled guard.

Only the default model is passed. The branch does not receive real app state,
does not receive real selectedRecommendation state, and does not receive a
previewState derived from app/route state.

The passive preview component cannot render by default.

## Default UI Behavior

Default UI is visually unchanged.

The default path remains `static_fixture`. The Trade UI continues to show
selectedRecommendation preview disabled by default and the static fixture Avanza
preview remains the active/default visible preview path.

## No Real SelectedRecommendation State Guarantee

This wiring does not read real selectedRecommendation state for the passive
read-only preview path.

It does not render real selectedRecommendation state and it does not discover,
search, fetch, refresh, or poll for selectedRecommendation data.

## No App/Route Preview Derivation Guarantee

No previewState is derived from app/route state for this passive branch.

The branch passes only
`avanzaTradeUiReadOnlySelectedRecommendationPreviewDefaultModel`, which keeps
the default render hidden/disabled and does not imply handoff readiness.

No dev route changes were made.

## Safety Guarantees

The wiring preserves these guarantees:

- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- canProceedToHandoff false
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

## What Remains Not Implemented

Still not implemented:

- enabling the preview
- changing `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` to true
- rendering real selectedRecommendation preview in normal/default Trade UI
- reading real selectedRecommendation state from app/route for this path
- deriving previewState from app/route state
- runtime env config
- visible toggle
- active handoff button
- prepare button
- buy/sell CTA
- bridge endpoint calls
- live runner/fill endpoint calls
- order submission behavior
- credential/session handling
- Supabase execution writes
- live Avanza behavior

## Recommended Next Step

Add a default-off safety audit for the Trade UI wiring.

The audit should verify no visible preview, no state read, no preview
derivation, and no active execution paths while the hard-disabled guard remains
false.

In short: verify no visible preview, no state read, no preview derivation, and
no active execution paths.

Audit target: verify no visible preview, no state read, no preview derivation, and no active execution paths.

Safety audit:
[Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
confirms the minimal default-off branch remains disabled, invisible, read-only,
and non-executable.

Phase completion:
[Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
marks the first Trade UI passive/default-off wiring phase complete while the
preview remains hard-disabled, invisible by default, read-only, and
non-executable.

Source map planning:
[Avanza selectedRecommendation source map plan](avanza-selected-recommendation-source-map-plan.md)
requires a planning-only map of already-present `app/trade-app.tsx`
selectedRecommendation-like data before any real preview input is extracted or
connected.

Source map pre-implementation:
[Avanza selectedRecommendation source map pre-implementation checkpoint](avanza-selected-recommendation-source-map-pre-implementation-checkpoint.md)
permits only a future pure source extraction helper and still forbids preview
enablement, real input connection, app-state preview derivation, handoff, and
execution.

Pure source extraction helper:
`lib/avanza-selected-recommendation-source-extraction.ts` now implements that
pure helper with explicit candidate input only. It is not wired into
`app/trade-app.tsx`, the dev route, or the passive preview model path.

Source extraction fixtures and harness:
`lib/avanza-selected-recommendation-source-extraction-fixtures.ts` and
`components/execution/AvanzaSelectedRecommendationSourceExtractionHarness.tsx`
cover all source extraction statuses with explicit fixture input only. They are
not wired into `app/trade-app.tsx`, the dev route, or the passive preview model
path.

Source extraction route section plan:
[Avanza selectedRecommendation source extraction route section plan](avanza-selected-recommendation-source-extraction-route-section-plan.md)
defines a future fixture/model-only dev route section for the source extraction
harness. It does not change the route, does not wire the harness into Trade UI,
does not connect real selectedRecommendation input, and does not derive
previewState from app or route state.

Source extraction route section pre-implementation checkpoint:
[Avanza selectedRecommendation source extraction route section pre-implementation checkpoint](avanza-selected-recommendation-source-extraction-route-section-pre-implementation-checkpoint.md)
permits only a future fixture/model-only route section for the source extraction
harness and still forbids Trade UI wiring, real selectedRecommendation reads,
preview model connection, previewState derivation, handoff, bridge/fetch,
polling, and execution.

Source extraction route section implementation:
`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaSelectedRecommendationSourceExtractionHarness` with static source
extraction fixtures only. The section remains fixture/model-only, unlinked from
main navigation, disconnected from Trade UI, disconnected from the preview
model, and disconnected from real selectedRecommendation input.

Source extraction route section checkpoint:
[Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
records the completed fixture/model-only route section and confirms all five
source statuses remain static, read-only/model-only, non-executing, and
disconnected from Trade UI and the preview model.

Source mapping phase completion:
[Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
closes the pure source extraction helper, fixtures, isolated harness, and
fixture/model-only dev route section phase. It keeps source extraction
disconnected from Trade UI, real selectedRecommendation input, the preview
model, and app or route previewState derivation.

Hard-disabled source-to-preview integration plan:
[Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
plans a future source extraction to preview model connection only behind
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false`. It is planning-only
and does not wire source extraction into Trade UI or connect real
selectedRecommendation input.

Hard-disabled source-to-preview pre-implementation checkpoint:
[Avanza hard-disabled source-to-preview integration pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-pre-implementation-checkpoint.md)
permits only a future pure source-to-preview helper with explicit inputs. It
keeps Trade UI wiring, preview enablement, real selectedRecommendation input,
bridge/fetch/polling, handoff, and execution forbidden.

Hard-disabled source-to-preview pure helper:
`lib/avanza-hard-disabled-source-to-preview-integration.ts` now implements the
pure model-only helper. It remains unwired from `app/trade-app.tsx`, does not
read Trade UI state, and cannot enable preview because
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

Hard-disabled source-to-preview fixtures and harness:
`lib/avanza-hard-disabled-source-to-preview-integration-fixtures.ts` and
`components/execution/AvanzaHardDisabledSourceToPreviewIntegrationHarness.tsx`
now cover and render the helper statuses as isolated fixture/model-only content.
They are not imported by `app/trade-app.tsx` and cannot enable the passive
preview branch.

Hard-disabled source-to-preview route section plan:
[Avanza hard-disabled source-to-preview integration route section plan](avanza-hard-disabled-source-to-preview-integration-route-section-plan.md)
plans only future fixture/model-only visibility for the isolated harness on the
dev route. It does not import the harness into Trade UI or enable preview.

Hard-disabled source-to-preview route section pre-implementation checkpoint:
[Avanza hard-disabled source-to-preview integration route section pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md)
permits only a future fixture/model-only dev-route section and confirms
`app/trade-app.tsx` remains unchanged and preview remains disabled.

## References

- [Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
- [Avanza hard-disabled source-to-preview integration pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-pre-implementation-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section plan](avanza-hard-disabled-source-to-preview-integration-route-section-plan.md)
- [Avanza hard-disabled source-to-preview integration route section pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md)

## Hard-Disabled Source-To-Preview Route Section Follow-Up

The dev-only visual QA route now renders the hard-disabled source-to-preview
integration harness with static fixtures only. This does not change
`app/trade-app.tsx`: the passive/default-off Trade UI preview wiring remains
behind `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false`, no real
selectedRecommendation input is connected, and no previewState is derived from
app or route state.

The completed route section checkpoint is
`docs/avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md`.
It confirms the route remains fixture/model-only, unlinked from main navigation,
and disconnected from real Trade UI runtime state.

The phase completion checkpoint is
`docs/avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md`.
It confirms the hard-disabled source-to-preview helper, fixtures, harness, and
dev route section are complete without wiring the integration into
`app/trade-app.tsx`.
- [Avanza selectedRecommendation source extraction route section plan](avanza-selected-recommendation-source-extraction-route-section-plan.md)
- [Avanza selectedRecommendation source extraction route section pre-implementation checkpoint](avanza-selected-recommendation-source-extraction-route-section-pre-implementation-checkpoint.md)
- [Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation source map pre-implementation checkpoint](avanza-selected-recommendation-source-map-pre-implementation-checkpoint.md)
- [Avanza selectedRecommendation source map plan](avanza-selected-recommendation-source-map-plan.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring pre-implementation checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring plan](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation pre-Trade-UI wiring architecture checkpoint](avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring plan](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview integration plan](avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Hard-Disabled Trade UI Branch Wiring Plan Follow-Up

The hard-disabled Trade UI branch wiring plan is
`docs/avanza-hard-disabled-trade-ui-branch-wiring-plan.md`. It is a
planning-only document for a possible future helper call inside the existing
false-guarded Trade UI branch. It does not change `app/trade-app.tsx`, does not
wire integration or source extraction into Trade UI, and keeps
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false.

The related pre-implementation checkpoint is
`docs/avanza-hard-disabled-trade-ui-branch-wiring-pre-implementation-checkpoint.md`.
It permits a future minimal branch-only implementation while preserving default
Trade UI visual output and keeping preview disabled by default.

The minimal hard-disabled branch-only implementation now exists in
`app/trade-app.tsx`. It keeps the existing guard false, uses the integration
helper only with `integrationEnabled: false` and static safe input, and renders
no visible preview by default.

## Hard-Disabled Branch Wiring Safety Audit Reference

`docs/avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md` now audits
the minimal helper call inside the passive/default-off branch. It confirms the
branch is unreachable by default, `integrationEnabled` remains false, static
safe input is used, no `modelResult` renders by default, default Trade UI output
remains unchanged, and no source extraction, real selectedRecommendation read,
previewState derivation, bridge/fetch/polling, order behavior, or Supabase write
was added.

## Hard-Disabled Branch Wiring Checkpoint Reference

`docs/avanza-hard-disabled-trade-ui-branch-wiring-checkpoint.md` now documents
the minimal hard-disabled branch wiring in `app/trade-app.tsx`. It confirms the
passive/default-off branch remains unreachable by default, `integrationEnabled`
is false, no `modelResult` renders by default, default static fixture behavior
is unchanged, and no active controls or execution behavior were added.

## Hard-Disabled Branch Wiring Phase Completion Reference

`docs/avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md`
now closes the hard-disabled helper-call phase inside the passive/default-off
branch. The branch remains false-guarded, invisible by default, read-only,
static-input only, and non-executable.
