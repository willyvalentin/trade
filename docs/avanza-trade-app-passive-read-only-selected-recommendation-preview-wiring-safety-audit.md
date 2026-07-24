# Avanza Trade App Passive Read-Only SelectedRecommendation Preview Wiring Safety Audit

## Audit Scope

This audit covers the minimal passive/default-off read-only
selectedRecommendation preview wiring in `app/trade-app.tsx`.

It verifies the wiring remains disabled, invisible by default, read-only, and
non-executable.

## Current Wiring State

The current wiring state is intentionally minimal:

- `app/trade-app.tsx` contains the passive/default-off branch
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` is false
- preview is hard-disabled by default
- only `avanzaTradeUiReadOnlySelectedRecommendationPreviewDefaultModel` is
  passed to the passive component
- default Trade UI remains visually unchanged
- default path remains `static_fixture`

## Default-Off Guard Audit

The default-off guard is a hardcoded false constant.

There is no runtime environment enablement, no localStorage/sessionStorage
enablement, and no visible toggle. The audit confirms the preview guard is not
true and cannot enable the passive preview by default.

Guard facts: no runtime environment enablement; no localStorage/sessionStorage enablement; no visible toggle.

## Visual Behavior Audit

The passive preview component cannot render by default because the guarded
branch returns `null`.

Default Trade UI remains visually unchanged. The visible Avanza preview path
continues to use static fixture behavior, and selectedRecommendation preview
remains disabled by default in Trade UI.

## selectedRecommendation State-Read Audit

The passive/default-off branch does not read real selectedRecommendation state
from app or route state.

No real selectedRecommendation state is rendered for this path, and the branch
does not search, fetch, refresh, or poll for selectedRecommendation data.

State facts: does not read real selectedRecommendation state; does not render real selectedRecommendation state.

## previewState Derivation Audit

No previewState is derived from app/route state for this passive/default-off
branch.

The branch passes only the default hidden model and does not call the Trade UI
read-only preview builder from `app/trade-app.tsx`.

Derivation facts: No previewState is derived from app/route state; preview is not derived from app/route state.

Builder facts: does not call the Trade UI read-only preview builder from `app/trade-app.tsx`.

## Passive Component Audit

`AvanzaTradeUiReadOnlySelectedRecommendationPreview` remains a passive component
for explicit model results.

The Trade UI branch references the component only behind the hard-disabled
guard. It passes only the default model, not real app state, not real
selectedRecommendation state, and not an app-derived previewState.

## Safety Guarantees

The audit confirms:

- no new fetch/polling/refresh behavior
- no bridge/local calls
- no active controls
- no handoff button
- no prepare button
- no buy/sell CTA
- no order behavior
- no credential/session handling
- no Supabase execution write

## Forbidden Behavior Verification

Forbidden behavior remains absent:

- preview is not enabled
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` is not true
- real selectedRecommendation state is not read from app/route
- real selectedRecommendation preview is not rendered in normal/default Trade UI
- preview is not derived from app/route state
- selectedRecommendation preview is not enabled by default
- runtime env config was not added
- localStorage/sessionStorage enablement was not added
- visible toggle was not added
- handoff button, prepare button, and buy/sell CTA were not added
- bridge endpoints, localhost calls, live runner/fill endpoints, polling, and
  new refresh behavior were not added
- fill/click/review/final/submit/order behavior was not added
- credential/session/BankID/cookies/storage handling was not added
- Supabase execution records are not written
- no production readiness claim is made

## Remaining Risks

The remaining risk is future drift: a later change could make the guard true,
add environment-based enablement, pass real selectedRecommendation state into the
branch, derive previewState from app/route state, or place the passive component
near active trading controls.

Any future enablement must go through a separate checkpoint and safety audit.

## Recommended Next Step

Stop here unless a separate future task explicitly asks for a deeper
default-off source audit or an explicit dev/test-only read-only preview path.

Any next step must still prove no visible preview by default, no state read, no
preview derivation from app/route state, and no active execution paths.

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
`lib/avanza-hard-disabled-source-to-preview-integration.ts` now exists as a
pure, explicit-input helper. This safety audit still treats it as unwired:
Trade UI does not import it, the dev route does not import it, real
selectedRecommendation state is not read, and default preview behavior remains
disabled.

Hard-disabled source-to-preview fixtures and harness:
`lib/avanza-hard-disabled-source-to-preview-integration-fixtures.ts` and
`components/execution/AvanzaHardDisabledSourceToPreviewIntegrationHarness.tsx`
now exist only as isolated test/dev visibility artifacts. They do not fetch,
poll, call bridge/local endpoints, import Trade UI, import the dev route, or
enable execution.

Hard-disabled source-to-preview route section plan:
[Avanza hard-disabled source-to-preview integration route section plan](avanza-hard-disabled-source-to-preview-integration-route-section-plan.md)
keeps future harness visibility limited to fixture/model-only dev-route planning
and does not alter this safety audit boundary.

Hard-disabled source-to-preview route section pre-implementation checkpoint:
[Avanza hard-disabled source-to-preview integration route section pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md)
confirms the harness is still not imported by Trade UI or the dev route and
keeps the safety audit boundary default-off and non-executing.

## References

- [Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
- [Avanza hard-disabled source-to-preview integration pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-pre-implementation-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section plan](avanza-hard-disabled-source-to-preview-integration-route-section-plan.md)
- [Avanza hard-disabled source-to-preview integration route section pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md)

## Hard-Disabled Source-To-Preview Route Section Safety Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders the hard-disabled
source-to-preview integration harness with static fixtures only. The audit
boundary remains unchanged for Trade UI: `app/trade-app.tsx` does not import the
integration helper or harness, source extraction is not wired into Trade UI,
real selectedRecommendation input is not connected/read/rendered,
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false, and no active
controls, prepare/buy/sell CTA, bridge/fetch/polling, order behavior,
credential/session handling, or Supabase write is added.

`docs/avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md`
now records that route section as completed and verifies the static fixture
statuses remain read-only/model-only and non-executing.

`docs/avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md`
now records the completed hard-disabled source-to-preview planning/model phase.
The safety boundary remains unchanged: no Trade UI integration, no real
selectedRecommendation input, no app/route previewState derivation, and no
execution behavior.
- [Avanza selectedRecommendation source extraction route section plan](avanza-selected-recommendation-source-extraction-route-section-plan.md)
- [Avanza selectedRecommendation source extraction route section pre-implementation checkpoint](avanza-selected-recommendation-source-extraction-route-section-pre-implementation-checkpoint.md)
- [Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation source map pre-implementation checkpoint](avanza-selected-recommendation-source-map-pre-implementation-checkpoint.md)
- [Avanza selectedRecommendation source map plan](avanza-selected-recommendation-source-map-plan.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring pre-implementation checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring plan](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation pre-Trade-UI wiring architecture checkpoint](avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring plan](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview integration plan](avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Hard-Disabled Trade UI Branch Wiring Plan Follow-Up

[Avanza hard-disabled Trade UI branch wiring plan](avanza-hard-disabled-trade-ui-branch-wiring-plan.md)
adds the planning-only boundary for any future branch-only helper call in
`app/trade-app.tsx`. It keeps the safety audit posture unchanged: no default
preview enablement, no runtime activation, no real selectedRecommendation
input, no app/route previewState derivation, no active controls, no
bridge/fetch/polling, no order behavior, and no Supabase execution write.

[Avanza hard-disabled Trade UI branch wiring pre-implementation checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-pre-implementation-checkpoint.md)
keeps that safety audit posture for the next implementation task: helper use
only inside the hard-disabled branch, `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
false, no real selectedRecommendation state, no default visible preview, no
active controls, and no execution path.

The minimal branch-only wiring is now implemented and keeps this safety audit
posture: the helper call is false-guarded, `integrationEnabled` is false by
default, source extraction is not wired into Trade UI, real selectedRecommendation
input is not passed, and no previewState is derived from app or route state.

## Hard-Disabled Branch Integration Safety Audit Reference

`docs/avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md` extends this
passive/default-off safety audit with the hard-disabled integration helper
check. It confirms the helper call is inside the unreachable branch only,
`integrationEnabled` is false, static safe input is used, no real
selectedRecommendation state is connected/read/rendered, no previewState is
derived from app or route state, no `modelResult` renders by default, and no
active controls, bridge/fetch/polling, order behavior, credential/session
handling, or Supabase write was added.

## Hard-Disabled Branch Wiring Checkpoint Reference

`docs/avanza-hard-disabled-trade-ui-branch-wiring-checkpoint.md` now captures
the post-audit checkpoint for the minimal helper call. It confirms no default
preview render, no model result render by default, no source extraction wiring,
no real selectedRecommendation read/render, no app/route previewState
derivation, and no executable behavior.

## Hard-Disabled Branch Wiring Phase Completion Reference

`docs/avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md`
now marks the hard-disabled helper-call phase complete. The completed phase
adds no active controls, handoff, prepare, buy/sell CTA, bridge/fetch/polling,
order behavior, credential/session handling, or Supabase write.
