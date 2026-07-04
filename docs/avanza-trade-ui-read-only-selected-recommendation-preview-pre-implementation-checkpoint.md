# Avanza Trade UI Read-Only SelectedRecommendation Preview Pre-Implementation Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_preview_pre_implementation_checkpoint`

## Current Status

This checkpoint explicitly permits a future pure Trade UI read-only
selectedRecommendation preview model, and nothing more.

No Trade UI integration exists yet. `app/trade-app.tsx` is not changed by this
checkpoint, the isolated dev QA route is not changed by this checkpoint, and
selectedRecommendation preview remains disabled by default in Trade UI.

## Preconditions Met

The following prerequisites are complete:

- Trade UI read-only selectedRecommendation preview integration plan
- architecture checkpoint before Trade UI planning
- static-fixture derived-preview phase completion
- real selectedRecommendation read-only input guard and validation model
- real selectedRecommendation read-only derivation helper
- real selectedRecommendation read-only derivation fixtures
- real selectedRecommendation read-only derivation harness
- isolated dev QA route fixture/model-only rendering

These prerequisites do not authorize Trade UI wiring, app-state reads, active
controls, bridge/fetch/polling behavior, handoff behavior, or execution.

## Allowed Next Implementation Scope

The next implementation task may add a pure Trade UI read-only preview model
only.

Allowed scope:

- add a pure Trade UI read-only preview model only
- model accepts explicit input only
- model accepts explicit preview-enabled config only
- model may call/use the pure real selectedRecommendation read-only derivation
  helper only after an explicit default-off guard allows it
- model must not read app state, route state, React state, process.env, browser
  storage, Supabase, network, or Trade UI state
- model must not be wired into Trade UI yet
- dev route section remains fixture/model-only if rendered later

## Required Future Trade UI Preview Model Behavior

The future model must be pure, explicit-input only, and side-effect free.

It may transform an explicitly supplied selectedRecommendation-like input into
a read-only preview decision only after an explicitly supplied guard/config says
the path is enabled.

It must never imply handoff readiness, Avanza readiness, execution readiness,
or production readiness.

## Required Default-Off Behavior

Default behavior must remain off:

- default status `hidden` or `disabled`
- no preview rendered by default
- selectedRecommendation preview remains disabled by default in Trade UI
- no visible user toggle
- no runtime env dependency for production enablement
- no `app/trade-app.tsx` wiring yet

## Required Status Model

The future model must support these statuses:

- `hidden`
- `disabled`
- `no_selected_recommendation`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

## Required Output Model

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

## Required Rendering Boundary

Future rendering, if later planned, must remain passive:

- passive read-only card/section only
- no active button
- no handoff button
- no prepare button
- no broker execution wording
- no order submission copy
- no production-ready copy
- no credentials/account/session data

## Required Safety Guarantees

The future model and any later rendering must preserve:

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
- gate locked
- `canProceedToHandoff: false`

## Explicit Non-Goals

This checkpoint does not permit:

- implementing Trade UI wiring
- reading real selectedRecommendation state from app/route
- deriving preview from app/route state
- rendering preview in default Trade UI
- changing `app/trade-app.tsx`
- changing `app/dev/avanza-visual-qa/page.tsx`
- linking the dev route from main navigation
- adding runtime env config
- adding a visible toggle
- enabling a handoff button or active control
- adding bridge, localhost, polling, runner, fill, click, review, final,
  submit, order, credential/session, BankID, cookies, storage, Supabase
  execution write, or live Avanza behavior

## Go/No-Go Checklist

Before implementing the pure model, verify:

- `app/trade-app.tsx` remains unchanged
- `app/dev/avanza-visual-qa/page.tsx` remains unchanged
- no Trade UI preview model exists yet
- selectedRecommendation preview remains disabled by default in Trade UI
- dev QA route remains fixture/model-only and unlinked
- no real selectedRecommendation state is read/rendered from app/route
- no real app/route preview state is derived/rendered
- no bridge/local fetch/polling/execution strings are introduced
- no live endpoint strings or exact trigger phrase are introduced

## Recommended Next Implementation Task

Next recommended task:

Add a pure Trade UI read-only selectedRecommendation preview model with static
fixtures and tests, without wiring it into `app/trade-app.tsx`.

That task must keep the model explicit-input only, default-off, passive, and
non-executing.

## Pure Model Implementation Follow-Up

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts` now
implements the pure Trade UI read-only selectedRecommendation preview model.

The model is explicit-input/config only, defaults to hidden/disabled, and calls
the pure real selectedRecommendation read-only derivation helper only after an
explicit dev/read-only preview config allows it. It is not wired into
`app/trade-app.tsx`, does not read app/route state, and does not render any
Trade UI preview.

## Static Fixture Follow-Up

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures.ts`
now adds static fixtures for the pure Trade UI read-only preview model.

The fixtures cover hidden, disabled, no selectedRecommendation, guard-blocked,
invalid input, adapter-rejected, derived-preview-failed, and read-only-preview-
ready states. They are explicit-input/config only, model-only, passive, and are
not wired into `app/trade-app.tsx`.

## Isolated Harness Follow-Up

`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx`
now renders the static model fixture states for isolated test/dev visibility.

The harness is prop-driven/static-fixture only. It shows the model status,
source mode, previewState presence, disabled controls, locked gate, and no
bridge/local/poll/execution flags. It is not imported by `app/trade-app.tsx`;
the dev-only visual QA route may render it only with static fixtures.

## Route Section Planning Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-plan.md`
now defines a future route-visible fixture/model-only section for the harness on
the dev-only Avanza visual QA route.

The plan was planning-only: it did not change `app/trade-app.tsx` and allowed a
later dev-route fixture/model-only section.

## Route Section Pre-Implementation Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-pre-implementation-checkpoint.md`
now explicitly permits a future fixture/model-only dev-route section for the
harness while continuing to forbid Trade UI wiring, real selectedRecommendation
reads, app/route preview derivation, bridge/fetch/polling, handoff, and
execution.

## Route Section Implementation Follow-Up

The harness is now rendered only on the dev-only visual QA route as a
fixture/model-only section with static fixtures. This does not change Trade UI,
does not enable selectedRecommendation preview by default, and does not add
active controls or execution behavior.

## Route Section Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md`
now summarizes the completed route section and preserves the boundary: static
Trade UI preview model fixtures only, previewState only for
`read_only_preview_ready`, no real selectedRecommendation reads, no app/route
preview derivation, no Trade UI wiring, disabled controls, locked gate, and no
execution.

## Phase Completion Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md`
now closes the preview model phase as fixture/model-only complete. It keeps the
pre-implementation boundary intact for any future Trade UI work: default-off,
passive, no bridge/fetch/polling, no handoff, and no order behavior.

## References

- [Avanza Trade UI read-only selectedRecommendation preview model phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section plan](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview integration plan](avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation architecture checkpoint before Trade UI](avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md)
- [Avanza real selectedRecommendation read-only derivation phase completion checkpoint](avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md)
- [Avanza real selectedRecommendation read-only derivation route section checkpoint](avanza-real-selected-recommendation-read-only-derivation-route-section-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
