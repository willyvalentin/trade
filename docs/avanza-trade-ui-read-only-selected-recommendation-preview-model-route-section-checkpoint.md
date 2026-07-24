# Avanza Trade UI Read-Only SelectedRecommendation Preview Model Route Section Checkpoint

## Current Status

The Trade UI read-only selectedRecommendation preview model route section is
complete as a fixture/model-only section on the isolated dev-only Avanza visual
QA route.

The section is rendered from `app/dev/avanza-visual-qa/page.tsx` using
`AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness` and static
Trade UI preview model fixtures only.

The route uses static Trade UI preview model fixtures only.

`app/trade-app.tsx` was not changed. The harness is not wired into Trade UI,
the route remains unlinked from main navigation, and selectedRecommendation
preview remains disabled by default in Trade UI.

## Implemented Route Section Behavior

The dev-only visual QA route now includes a section labeled:

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

The route section is passive and does not include active controls.

## Static Trade UI Preview Model Fixture Scope

The route section uses only static fixture data from:

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures.ts`

The route section does not read app state, route state, React state, browser
state, runtime environment state, or real selectedRecommendation state.

## Visible Fixture States

The visible fixture statuses are:

- `hidden_default`
- `disabled_config`
- `no_selected_recommendation`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

`read_only_preview_ready` is passive/read-only/model-only, not active.

## PreviewState Visibility Behavior

`previewState` is visible only for `read_only_preview_ready`.

previewState is visible only for `read_only_preview_ready`.

`previewState` is absent/null for every other status:

previewState is absent/null for every other status.

- `hidden_default`
- `disabled_config`
- `no_selected_recommendation`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`

No real app/route preview state is derived or rendered from real input.

## Harness Behavior

`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx`
renders the static model fixture states for visual QA only.

The harness shows each fixture status, source mode, previewState presence,
disabled controls, locked gate, and hard false execution boundaries.

The harness is not wired into Trade UI and is not imported by
`app/trade-app.tsx`.

## No Real SelectedRecommendation State Guarantee

The route section does not read real selectedRecommendation state.

The route section does not render real selectedRecommendation state.

The allowed input is static fixture/model data only.

## No Real App/Route Preview Derivation Guarantee

The route section does not derive preview state from app state or route state.

The route section does not render preview state from real app/route input.

The only visible previewState is the static fixture output for
`read_only_preview_ready`.

## Trade UI Default Behavior

Trade UI default behavior remains unchanged:

- `app/trade-app.tsx` was not changed
- selectedRecommendation preview disabled by default in Trade UI
- no default Trade UI selectedRecommendation preview rendering
- no visible user toggle
- no runtime environment enablement path
- no handoff button
- no active controls

## Safety Guarantees

All fixture states preserve:

- `canProceedToHandoff: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`
- controls disabled
- pre-activation gate locked
- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim

## What Remains Not Implemented

This checkpoint does not implement or permit:

- Trade UI wiring
- real selectedRecommendation reads from app/route
- real selectedRecommendation rendering in Trade UI
- app/route state preview derivation
- default Trade UI preview rendering
- main navigation link to the dev route
- runtime environment config
- visible toggle
- active handoff button
- bridge, localhost, polling, runner, fill, click, review, final, submit,
  order, credential/session, BankID, cookies, storage, Supabase execution
  write, or live Avanza behavior

## Recommended Next Step

Add a Trade UI read-only selectedRecommendation preview model phase completion
checkpoint.

Trade UI read-only selectedRecommendation preview model phase completion checkpoint.

That checkpoint should mark the model, fixtures, harness, and dev-route
fixture/model-only section as complete while continuing to forbid Trade UI
wiring, real app/route state reads, bridge/fetch/polling/execution, handoff,
and all order behavior.

## Phase Completion Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md`
now marks the Trade UI read-only selectedRecommendation preview model phase as
complete at the fixture/model-only level. It keeps Trade UI unwired, the route
fixture-only, previewState visible only for `read_only_preview_ready`, controls
disabled, the gate locked, and all execution paths forbidden.

## Default-Off Wiring Planning Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md`
now plans a future default-off Trade UI wiring phase. That plan still keeps the
current route section fixture/model-only, keeps `app/trade-app.tsx` unchanged in
this phase, forbids real app/route selectedRecommendation reads, and requires
any future Trade UI preview to stay passive, disabled-control, locked-gate, and
non-executing.

## Default-Off Wiring Pre-Implementation Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md`
now records that the next implementation may only add an isolated passive
component/model. The route section remains fixture/model-only, the existing dev
route is unchanged by that checkpoint, and nothing is wired into Trade UI.

## References

- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring plan](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section plan](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview integration plan](avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation architecture checkpoint before Trade UI](avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md)
- [Avanza real selectedRecommendation read-only derivation phase completion checkpoint](avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
