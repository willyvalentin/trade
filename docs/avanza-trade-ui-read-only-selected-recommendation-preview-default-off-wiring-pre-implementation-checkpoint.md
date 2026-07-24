# Avanza Trade UI Read-Only SelectedRecommendation Preview Default-Off Wiring Pre-Implementation Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_preview_default_off_wiring_pre_implementation_checkpoint_added`

## Current Status

The default-off Trade UI read-only selectedRecommendation preview wiring plan is
complete, but no Trade UI wiring exists yet.

Current state:

- `app/trade-app.tsx` is unchanged for this checkpoint
- the isolated dev QA route is unchanged for this checkpoint
- the harness remains not wired into Trade UI
- the dev route remains fixture/model-only and unlinked from main navigation
- no real selectedRecommendation state is read or rendered from app/route
- no real app/route preview state is derived or rendered
- selectedRecommendation preview remains disabled by default in Trade UI
- controls remain disabled
- pre-activation gate remains locked
- no active execution is allowed

## Preconditions Met

The following prerequisites are in place:

- default-off Trade UI wiring plan:
  `docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md`
- Trade UI read-only selectedRecommendation preview model phase completion
  checkpoint:
  `docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md`
- pure Trade UI preview model:
  `lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts`
- static Trade UI preview model fixtures:
  `lib/avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures.ts`
- isolated Trade UI preview model harness:
  `components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx`
- fixture/model-only dev-route section:
  `app/dev/avanza-visual-qa/page.tsx`

These preconditions permit planning the next implementation boundary. They do
not permit Trade UI wiring in this checkpoint.

## Allowed Next Implementation Scope

The next implementation task may add an isolated passive read-only Trade UI
preview component or model only.

Allowed next scope:

- add an isolated passive read-only Trade UI preview component/model only
- component/model accepts explicit model result or explicit
  selectedRecommendation-like input/config only
- no implicit app state reads
- no route state reads
- no React context/global reads
- no `process.env` reads
- no browser storage reads
- no Supabase, network, or fetch
- no Trade UI wiring yet
- no `app/trade-app.tsx` changes yet

Any future component/model must stay pure or prop-driven and must not discover,
search, fetch, poll, or refresh selectedRecommendation state.

## Required Default-Off Wiring Behavior

Future default-off wiring must enforce:

- default hidden/disabled
- no preview rendered by default
- no visible user toggle
- no runtime environment production enablement
- no localStorage enablement
- no accidental production enablement
- enabled path remains passive/read-only/model-only

## Required Passive Component/Model Behavior

A future passive component/model must:

- render passive read-only status only
- accept explicit input only
- avoid reading app, route, React context, browser, storage, environment,
  Supabase, network, or Avanza state
- never create a handoff package
- never create an execution action
- keep controls disabled
- keep the pre-activation gate locked

## Required Status Model

Future status coverage must include:

- `hidden`
- `disabled`
- `no_selected_recommendation`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

## Required Output Model

Future output must include:

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

`read_only_preview_ready` remains passive/read-only/model-only. It must not
imply handoff readiness or execution readiness.

## Required Rendering Boundary

Future rendering must be limited to a passive read-only card or section.

Rendering boundary:

- passive read-only card/section only
- no active button
- no handoff button
- no prepare button
- no buy/sell CTA
- no broker execution wording
- no order submission copy
- no production-ready copy
- no credentials/account/session data

## Required Safety Guarantees

Every future implementation in this line must preserve:

- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim
- controls disabled
- pre-activation gate locked

## Explicit Non-Goals

This checkpoint does not implement or permit:

- default-off Trade UI wiring
- `app/trade-app.tsx` changes
- dev route changes
- real selectedRecommendation reads from app/route
- real selectedRecommendation rendering in Trade UI
- app/route preview derivation
- default Trade UI preview rendering
- main navigation link to the dev route
- runtime environment config
- visible toggle
- active handoff button
- bridge, localhost, polling, runner, fill, click, review, final, submit,
  order, credential/session, BankID, cookies, storage, Supabase execution
  write, or live Avanza behavior

## Go/No-Go Checklist

Go for the next implementation task only if all are true:

- the task is limited to an isolated passive component/model
- the component/model is explicit-input only
- default behavior remains hidden/disabled
- no `app/trade-app.tsx` change is included
- no dev route change is included
- no implicit app/route/React/global/browser/env/storage/Supabase/network read
  is included
- no active control, handoff package, bridge call, fetch, polling, or execution
  path is included
- controls remain disabled
- gate remains locked

No-go if the task includes any Trade UI wiring, state discovery, active control,
bridge/fetch/polling/execution behavior, runtime production enablement, or
order-related action.

## Recommended Next Implementation Task

Recommended next task:

Add an isolated passive Trade UI read-only selectedRecommendation preview
component/model harness, explicit-input only and not wired into Trade UI.

That task should still leave `app/trade-app.tsx` untouched and should add tests
proving default-off, disabled-control, locked-gate, non-executing behavior.

## Isolated Passive Component Follow-Up

`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx`
now adds the isolated passive read-only Trade UI preview component permitted by
this checkpoint.

The component accepts an explicit `modelResult` prop only. It does not call the
model, does not read app state, does not read route state, does not read React
context/global state, does not read environment or browser storage, does not
fetch, does not call the bridge, and does not call Supabase.

The component is not wired into Trade UI, is not rendered on the dev route, and
is not imported by `app/trade-app.tsx`. It renders passive preview content only
when `status` is `read_only_preview_ready`, `canRenderReadOnlyPreview` is true,
and `previewState` exists. All other states render safe passive status copy
with controls disabled and the gate locked.

## Isolated Passive Component Fixture/Harness Follow-Up

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-component-fixtures.ts`
now maps the existing model fixtures into component fixtures with explicit
`modelResult` values and expected render modes.

`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness.tsx`
now renders those component fixtures through the passive component.

The harness is fixture-only and explicit-model-result only. It is not wired
into Trade UI, is not rendered on the dev route, does not import
`app/trade-app.tsx`, does not read app or route state, and keeps previewState
visible only for `read_only_preview_ready`.

## Passive Component Route Section Planning Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-plan.md`
now plans a future dev-only visual QA route section for the passive component
harness.

The plan is route-section planning only. It does not change
`app/trade-app.tsx`, does not change `app/dev/avanza-visual-qa/page.tsx`, does
not wire the component or harness into Trade UI or the dev route, does not read
real selectedRecommendation state from app/route, and does not derive real
app/route preview state.

## Passive Component Route Section Pre-Implementation Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-pre-implementation-checkpoint.md`
now explicitly permits a future task to render the passive component harness on
the dev-only visual QA route as fixture/model-only.

The checkpoint still forbids Trade UI wiring, `app/trade-app.tsx` changes, real
selectedRecommendation reads from app/route, real app/route preview derivation,
active controls, bridge/fetch/polling, handoff, and execution.

## Passive Component Route Section Implementation Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders the passive component harness
as a fixture/model-only section using static component fixtures.

This remains dev-route visual QA only. `app/trade-app.tsx` is unchanged, the
route remains unlinked from main navigation, selectedRecommendation preview
remains disabled by default in Trade UI, and no execution path is added.

## Passive Component Route Section Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md`
now records the completed fixture/model-only dev-route section for the passive
component harness. It does not authorize Trade UI wiring.

## Current Non-Implementation Confirmation

This checkpoint does not implement wiring.

Current state remains:

- no app code changes
- `app/trade-app.tsx` unchanged
- existing dev route unchanged for this checkpoint
- no Trade UI wiring
- no real selectedRecommendation state read/rendered from app/route
- no real app/route preview state derived/rendered
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- no Trade UI fetch, refresh, polling, trigger, fill, click, review, final,
  submit, order, credential/session handling, or Supabase write

## Passive Component Phase Completion Follow-Up

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_preview_component_phase_completion_checkpoint_added`

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md`
now marks the passive component/default-off wiring preparation phase complete
without wiring the component into Trade UI.

## Pre-Trade-UI Wiring Architecture Follow-Up

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_pre_trade_ui_wiring_architecture_checkpoint_added`

`docs/avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md`
now records the broad architecture boundary before any `app/trade-app.tsx`
integration.

## app/trade-app.tsx Passive Wiring Plan Follow-Up

Plan status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_plan_added`

`docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md`
now defines the future app-specific passive/default-off wiring plan. This
checkpoint still does not implement wiring.

## app/trade-app.tsx Passive Wiring Pre-Implementation Follow-Up

Checkpoint status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_pre_implementation_checkpoint_added`

`docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md`
now explicitly permits a future task to touch `app/trade-app.tsx` only within
the passive/default-off constraints.

## References

- [Avanza Trade app passive read-only selectedRecommendation preview wiring pre-implementation checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring plan](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation pre-Trade-UI wiring architecture checkpoint](avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring plan](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section plan](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview integration plan](avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation architecture checkpoint before Trade UI](avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
