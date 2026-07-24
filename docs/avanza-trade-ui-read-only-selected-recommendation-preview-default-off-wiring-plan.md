# Avanza Trade UI Read-Only SelectedRecommendation Preview Default-Off Wiring Plan

Date: 2026-07-04

Plan status:
`avanza_trade_ui_read_only_selected_recommendation_preview_default_off_wiring_planned_no_implementation`

## Purpose

This plan defines a future default-off wiring phase for a passive read-only
selectedRecommendation preview inside Trade UI.

The future wiring may use the existing pure Trade UI read-only
selectedRecommendation preview model:

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts`

The purpose is limited to passive preview visibility:

- allow future passive read-only preview inside Trade UI
- use the existing pure Trade UI preview model
- remain default-off
- add no active controls
- create no handoff package
- add no Avanza behavior
- add no execution path

## Strict Phase Boundary

This task is planning only.

This plan does not change app code and does not authorize implementation in
this phase.

Strict current boundary:

- no app code changes
- no `app/trade-app.tsx` changes
- no dev route changes
- no Trade UI wiring yet
- no selectedRecommendation state read yet
- no app/route preview derivation yet
- no real selectedRecommendation preview rendering in Trade UI
- no default Trade UI selectedRecommendation preview rendering

The isolated dev QA route remains fixture/model-only and unlinked from main
navigation.

## Allowed Future Implementation

A future implementation may touch `app/trade-app.tsx` only after a separate
default-off wiring pre-implementation checkpoint.

Allowed future implementation is limited to:

- importing a passive read-only preview component or model
- accepting explicit selectedRecommendation-like input only from an already
  present selectedRecommendation object
- using the pure preview model only when an explicit default-off guard/config
  allows it
- rendering passive read-only preview state only
- rendering `previewState` only for `read_only_preview_ready`
- rendering non-ready states as nothing or safe passive copy
- keeping source/status copy explicit and non-executing

The future implementation must not discover, search, fetch, poll, refresh, or
otherwise obtain selectedRecommendation state. It may only receive the already
present selectedRecommendation object through an explicit read-only boundary.

## Required Default-Off Guard

Future wiring requires a default-off guard before any Trade UI rendering.

The guard must enforce:

- default disabled/hidden
- no visible user toggle initially
- no runtime environment production enablement
- no localStorage enablement initially
- no accidental production enablement
- enabled path remains passive/read-only only
- no bridge calls
- no localhost fetch
- no polling
- no execution

## Required Future UI Behavior

Future UI behavior must stay passive and read-only.

Allowed UI:

- passive card or section only
- read-only source/status copy
- disabled-control and locked-gate indicators
- passive preview only for `read_only_preview_ready`

Forbidden UI:

- no active button
- no handoff button
- no prepare button
- no buy/sell CTA
- no broker execution wording
- no order submission copy
- no production-ready copy
- no credentials/account/session data

## Required Future Statuses

The future default-off Trade UI wiring must preserve these statuses:

- `hidden`
- `disabled`
- `no_selected_recommendation`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

## Required Future Output

The future output must include:

- `status`
- `label`
- `reason`
- `previewState` only for `read_only_preview_ready`
- `canRenderReadOnlyPreview: true` only for `read_only_preview_ready`
- `canProceedToHandoff: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

`read_only_preview_ready` is still passive/read-only. It must not become a
handoff-ready or execution-ready state.

## Forbidden Behavior

This plan and any future default-off wiring must continue to forbid:

- bridge calls
- localhost fetch
- polling
- execution
- trigger/fill/click/review/final/submit/order behavior
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- live Avanza
- production readiness claim
- active handoff controls

## Required Future Tests

Any future implementation must prove:

- default Trade UI keeps preview hidden or disabled
- read-only preview does not appear unless an explicit default-off guard is
  enabled in a test-only path
- `app/trade-app.tsx` does not import bridge, fetch, polling, or execution paths
- no handoff button appears
- no active controls appear
- `read_only_preview_ready` renders passive preview only
- non-ready statuses are safe/passive or hidden
- controls remain disabled
- gate remains locked
- no bridge/local fetch/polling/execution strings appear
- no live endpoint strings or exact trigger phrase appear

## Recommended Implementation Sequence

1. Add default-off Trade UI wiring pre-implementation checkpoint.
2. Add isolated passive Trade UI preview component.
3. Add component fixtures/harness if needed.
4. Add default-off wiring checkpoint before touching `app/trade-app.tsx`.
5. Touch `app/trade-app.tsx` only for passive/default-off rendering.
6. Add Trade UI passive read-only preview checkpoint.

## Pre-Implementation Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md`
now records the go/no-go boundary before any default-off Trade UI wiring work.

The checkpoint permits only a future isolated passive component/model with
explicit input/config. It still forbids `app/trade-app.tsx` changes, dev route
changes, Trade UI wiring, app/route state reads, React/global/browser/env/
storage/Supabase/network reads, active controls, bridge/fetch/polling,
handoff, and execution.

## Isolated Passive Component Follow-Up

`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx`
now implements the isolated passive component layer. It renders only an
explicit model result, does not call the model, and remains unwired from Trade
UI and the dev route. The component preserves default-off behavior by rendering
safe passive copy for non-ready states and preview content only for
`read_only_preview_ready`.

## Passive Component Fixture/Harness Follow-Up

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-component-fixtures.ts`
and
`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness.tsx`
now provide fixture-only coverage for the passive component. They reuse explicit
model results, cover all eight statuses, keep previewState exclusive to
`read_only_preview_ready`, and remain unwired from Trade UI and the dev route.

## Passive Component Route Section Plan Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-plan.md`
now plans how the passive component harness may later be shown on the dev-only
visual QA route.

That plan is fixture/model-only and explicit `modelResult` only. It still
forbids Trade UI wiring, route code changes in the planning phase, real
selectedRecommendation reads from app/route, real app/route preview derivation,
active controls, bridge/local fetch/polling, and execution.

## Passive Component Route Section Pre-Implementation Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-pre-implementation-checkpoint.md`
now records the go/no-go checkpoint before any future dev-route rendering of
the passive component harness.

The checkpoint allows only static component fixtures through explicit
`modelResult` values and keeps Trade UI default-off, unwired, disabled-control,
locked-gate, and non-executing.

## Passive Component Route Section Implementation Follow-Up

The passive component harness is now route-visible on
`app/dev/avanza-visual-qa/page.tsx` as fixture/model-only QA. It uses static
component fixtures only and does not change Trade UI default-off behavior.

## Passive Component Route Section Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md`
now records that route-visible fixture/model-only QA section as complete.

## Passive Component Phase Completion Follow-Up

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_preview_component_phase_completion_checkpoint_added`

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md`
now closes the passive component/default-off wiring preparation phase while
keeping Trade UI default-off.

## Pre-Trade-UI Wiring Architecture Follow-Up

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_pre_trade_ui_wiring_architecture_checkpoint_added`

`docs/avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md`
now records the required boundary before any future `app/trade-app.tsx`
default-off wiring work.

## app/trade-app.tsx Passive Wiring Plan Follow-Up

Plan status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_plan_added`

`docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md`
now narrows the default-off plan to the first possible passive
`app/trade-app.tsx` integration. It remains planning-only.

## app/trade-app.tsx Passive Wiring Pre-Implementation Follow-Up

Checkpoint status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_pre_implementation_checkpoint_added`

`docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md`
now records the pre-implementation gate before any future
`app/trade-app.tsx` change.

## Current Non-Implementation Confirmation

This plan does not implement Trade UI wiring.

Current state remains:

- `app/trade-app.tsx` unchanged
- existing dev route unchanged
- harness not wired into Trade UI
- no real selectedRecommendation state read/rendered from app/route
- no real app/route preview state derived/rendered
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- no Trade UI fetch, refresh, polling, trigger, fill, click, review, final,
  submit, order, credential/session handling, or Supabase write

## References

- [Avanza Trade app passive read-only selectedRecommendation preview wiring pre-implementation checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring plan](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation pre-Trade-UI wiring architecture checkpoint](avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section plan](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview integration plan](avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation architecture checkpoint before Trade UI](avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Minimal Default-Off Wiring Follow-Up

Status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_minimal_default_off_wiring_added`

The default-off wiring plan has its first implementation step: a hardcoded false
guard in `app/trade-app.tsx` and a passive preview branch that receives only the
default hidden model.

The default render remains unchanged and static fixture based. The read-only
selectedRecommendation preview does not appear by default, does not read real
selectedRecommendation state, and does not derive previewState from app state.

The branch remains passive: no visible toggle, runtime environment path,
localStorage/sessionStorage path, active handoff, prepare button, buy/sell CTA,
bridge call, localhost fetch, polling, refresh, trigger, fill, click, review,
final, submit, order, credential/session handling, or Supabase execution write.

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
