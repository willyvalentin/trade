# Avanza Trade UI Read-Only SelectedRecommendation Preview Integration Plan

Date: 2026-07-04

Plan status:
`avanza_trade_ui_read_only_selected_recommendation_preview_integration_planning_only`

## Purpose

This plan defines a future passive read-only selectedRecommendation preview
inside Trade UI.

The future integration may use the existing pure real selectedRecommendation
read-only derivation helper, but it must remain:

- default-off
- passive/read-only
- without active controls
- without a handoff package
- without Avanza behavior
- without execution

## Strict Phase Boundary

This task is planning only.

Current boundaries:

- no app code changes
- no `app/trade-app.tsx` changes
- no dev route changes
- no Trade UI integration yet
- no selectedRecommendation state read yet
- no app/route preview derivation yet
- no default Trade UI preview rendering

The existing isolated dev QA route remains fixture/model-only and unlinked from
main navigation.

## Allowed Future Behavior

In a future implementation task, Trade UI may pass an explicit
selectedRecommendation-like object into the pure derivation helper only after an
explicit default-off read-only guard allows it.

Allowed future rendering is limited to passive preview labels and summary copy:

- passive read-only card or section only
- previewState may render only when status is `read_only_preview_ready`
- all non-ready states must render safe passive messages or nothing
- no buttons
- no active controls
- no handoff CTA
- no broker or Avanza action language that implies execution

## Required Future Trade UI Guard

The future Trade UI guard must be explicit and default disabled.

Required guard properties:

- default disabled
- no runtime env dependency for enabling in production
- no visible user toggle initially
- explicit local/dev-only/internal flag or hardcoded false until separately
  planned
- disabled state must render nothing or static disabled copy
- enabled state must still be read-only/passive only
- no bridge calls
- no localhost fetch
- no polling
- no execution

## Required Future Statuses

The future Trade UI read-only preview model must support these statuses:

- `hidden`
- `disabled`
- `no_selected_recommendation`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

## Required Future Output

The future output model must include:

- status
- label
- reason
- previewState only for `read_only_preview_ready`
- `canRenderReadOnlyPreview: true` only for `read_only_preview_ready`
- `canProceedToHandoff: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

## Trade UI Rendering Boundary

The Trade UI rendering boundary must stay passive and non-executing.

Forbidden UI affordances and copy:

- no active button
- no handoff button
- no prepare button
- no broker wording that implies execution
- no production-ready copy
- no credentials/account/session data
- no order submission copy
- no review/final/submit/order copy that behaves like an action

Allowed UI content is limited to read-only status, summary, source, and locked
gate/safety indicators.

## Forbidden Behavior

Forbidden behavior for this plan and any future passive preview implementation:

- no bridge/local fetch/polling/execution
- no trigger/fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution writes
- no live Avanza
- no production readiness claim
- no active handoff controls
- no runtime env production enablement

## Future Test Requirements

Any future implementation must prove:

- default Trade UI has preview disabled or hidden
- `app/trade-app.tsx` does not import the derivation helper until an explicit
  implementation task
- no handoff button appears
- no active controls appear
- read-only preview appears only behind an explicit guard
- `read_only_preview_ready` renders passive preview only
- non-ready statuses are safe/passive
- controls remain disabled
- gate remains locked
- no bridge/local fetch/polling/execution strings appear
- no live endpoint strings or exact trigger phrase appear
- no credential/session/BankID/cookies/storage handling appears
- no Supabase execution write appears

## Recommended Implementation Sequence

1. Add Trade UI read-only preview pre-implementation checkpoint.
2. Add Trade UI read-only preview guard/model.
3. Add Trade UI read-only preview fixtures.
4. Add isolated Trade UI preview component/harness.
5. Add default-off Trade UI wiring checkpoint.
6. Only then consider touching `app/trade-app.tsx` with passive/default-off
   rendering.

## Current Non-Implementation Confirmation

This plan does not implement Trade UI preview wiring.

Current state remains:

- `app/trade-app.tsx` unchanged
- existing dev route unchanged
- no real selectedRecommendation state read/rendered from app/route
- no real app/route preview state derived/rendered
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- no Trade UI fetch, refresh, polling, trigger, fill, click, review, final,
  submit, order, credential/session handling, or Supabase write

## Pre-Implementation Checkpoint

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-pre-implementation-checkpoint.md`
now records the go/no-go boundary before any pure Trade UI read-only preview
model implementation.

The checkpoint permits only a future pure explicit-input model. It still
forbids `app/trade-app.tsx` changes, dev route changes, Trade UI wiring,
app/route selectedRecommendation reads, app/route preview derivation, active
controls, bridge/fetch/polling, handoff, and execution.

## Pure Preview Model Follow-Up

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts` now
adds the pure default-off Trade UI read-only preview model described by this
plan.

The model accepts explicit input and explicit config only. It remains unwired
from Trade UI: no Trade UI integration, no app/route state reads, no default
preview rendering, no active controls, no handoff package, no Avanza behavior,
and no execution.

## Static Fixture Follow-Up

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures.ts`
now records reusable static cases for the pure model. The cases preserve the
future integration boundary: preview state exists only for the explicit
read-only-ready fixture, every other fixture has no preview state, controls stay
disabled, the gate stays locked, and no handoff, bridge, fetch, polling, or
execution path is introduced.

## Isolated Harness Follow-Up

`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx`
now provides a passive fixture-only harness for the pure model fixtures. The
harness is not part of Trade UI wiring; the dev-only visual QA route renders it
only with static fixtures so model states are inspectable without app-state
reads or execution.

## Route Section Planning Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-plan.md`
now plans a future dev-route fixture/model-only section for that harness. The
plan requires all eight fixture statuses to remain visible, previewState to stay
exclusive to `read_only_preview_ready`, controls to remain disabled, and the
gate to remain locked.

## Route Section Pre-Implementation Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-pre-implementation-checkpoint.md`
now records the allowed next scope before any route edit: render only the
fixture/model-only harness on the dev QA route, with no Trade UI wiring and no
real selectedRecommendation or app/route preview state.

## Route Section Implementation Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders the Trade UI read-only preview
model harness using static fixtures only. This remains route-visible QA, not
Trade UI integration: `app/trade-app.tsx` is unchanged, selectedRecommendation
preview remains disabled by default, and no handoff/execution path is added.

## Route Section Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md`
now records that the harness route section is complete as fixture/model-only.
It keeps Trade UI unwired, the route unlinked from main navigation, previewState
visible only for `read_only_preview_ready`, controls disabled, the gate locked,
and all bridge/fetch/polling/execution paths forbidden.

## Phase Completion Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md`
now marks the Trade UI read-only preview model phase complete at the
fixture/model-only level. Any later Trade UI wiring still requires a separate
default-off passive/read-only plan.

## Default-Off Wiring Plan Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md`
now defines that separate default-off passive/read-only Trade UI wiring plan.

It remains planning-only: no app code changes, no `app/trade-app.tsx` changes,
no dev route changes, no Trade UI wiring, no selectedRecommendation state read,
and no app/route preview derivation. Any future implementation must accept only
already-present selectedRecommendation-like input, remain hidden/disabled by
default, render `previewState` only for `read_only_preview_ready`, keep controls
disabled, keep the gate locked, and forbid all bridge/fetch/polling/execution
behavior.

## Default-Off Wiring Pre-Implementation Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md`
now records the implementation boundary before any default-off Trade UI wiring.
It permits only a future isolated passive component/model with explicit input
or explicit model result. It still forbids `app/trade-app.tsx` changes, dev
route changes, implicit app/route/React/global/browser/env/storage reads,
bridge/fetch/polling, handoff, and execution.

## Isolated Passive Component Follow-Up

`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx`
now provides the passive renderer that a future default-off Trade UI wiring step
may use. It accepts only an explicit model result and remains outside
`app/trade-app.tsx`. It renders no buttons, no handoff action, no broker action
copy, and no order behavior.

## Passive Component Fixture/Harness Follow-Up

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-component-fixtures.ts`
and
`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness.tsx`
now provide fixture-only rendering for the passive component. They prove all
statuses remain passive, previewState appears only for
`read_only_preview_ready`, and the component is still not wired into Trade UI
or the dev route.

## Passive Component Route Section Planning Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-plan.md`
now records the optional future route-visible section for the passive component
harness.

The route section plan is not Trade UI integration. It keeps default Trade UI
preview disabled, keeps the harness fixture/model-only and explicit
`modelResult` only, and continues to forbid real app/route selectedRecommendation
reads, app/route preview derivation, bridge/fetch/polling, active controls, and
execution.

## Passive Component Route Section Pre-Implementation Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-pre-implementation-checkpoint.md`
now captures the implementation boundary before the passive component harness
is route-visible. It permits only dev-route fixture/model-only rendering and
does not authorize Trade UI wiring.

## Passive Component Route Section Implementation Follow-Up

The passive component harness is now rendered on the dev-only visual QA route
using static component fixtures only. This route section is not Trade UI
integration and does not authorize default Trade UI preview rendering.

## Passive Component Route Section Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md`
now records the completed route section. It confirms the section is
fixture/model-only and keeps Trade UI default behavior unchanged.

## Passive Component Phase Completion Follow-Up

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_preview_component_phase_completion_checkpoint_added`

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md`
now closes the passive component/default-off wiring preparation phase before
any future Trade UI wiring decision.

## Pre-Trade-UI Wiring Architecture Follow-Up

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_pre_trade_ui_wiring_architecture_checkpoint_added`

`docs/avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md`
now records the strict pre-`app/trade-app.tsx` boundary for any future passive
default-off Trade UI wiring.

## app/trade-app.tsx Passive Wiring Plan Follow-Up

Plan status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_plan_added`

`docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md`
now plans the first possible passive/default-off `app/trade-app.tsx` rendering
path while keeping implementation out of scope.

## app/trade-app.tsx Passive Wiring Pre-Implementation Follow-Up

Checkpoint status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_pre_implementation_checkpoint_added`

`docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md`
now records the required checkpoint before any future `app/trade-app.tsx`
integration.

## References

- [Avanza Trade app passive read-only selectedRecommendation preview wiring pre-implementation checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring plan](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation pre-Trade-UI wiring architecture checkpoint](avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring plan](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section plan](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section plan](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation architecture checkpoint before Trade UI](avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview phase completion checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md)
- [Avanza real selectedRecommendation read-only derivation phase completion checkpoint](avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md)
- [Avanza real selectedRecommendation read-only derivation route section checkpoint](avanza-real-selected-recommendation-read-only-derivation-route-section-checkpoint.md)
- [Avanza real selectedRecommendation read-only derivation plan](avanza-real-selected-recommendation-read-only-derivation-plan.md)
- [Avanza real selectedRecommendation read-only input plan](avanza-real-selected-recommendation-read-only-input-plan.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Minimal Default-Off Wiring Follow-Up

Status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_minimal_default_off_wiring_added`

`app/trade-app.tsx` now has the minimal passive/default-off read-only preview
branch. The guard is hardcoded false, the branch renders `null` by default, and
the only model passed to the component is the default hidden model.

The integration remains intentionally incomplete for real data: no real
selectedRecommendation state is read for this branch, no app previewState is
derived, and selectedRecommendation preview remains disabled by default in Trade
UI.

No bridge/fetch/polling/refresh, trigger, fill, click, review, final, submit,
order, credential/session handling, Supabase execution write, or active control
was introduced.

Checkpoint:
[Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
records the completed minimal/default-off app wiring state.

Safety audit:
[Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
confirms the minimal default-off branch remains disabled, invisible, read-only,
and non-executable.

Phase completion:
[Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
marks the first Trade UI passive/default-off wiring phase complete while the
preview remains hard-disabled, invisible by default, read-only, and
non-executable.
