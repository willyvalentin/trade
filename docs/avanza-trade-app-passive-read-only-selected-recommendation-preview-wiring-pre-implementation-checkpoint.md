# Avanza Trade App Passive Read-Only SelectedRecommendation Preview Wiring Pre-Implementation Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_pre_implementation_checkpoint_added`

## Current Status

This checkpoint explicitly records the final boundary before any future
`app/trade-app.tsx` passive/default-off read-only selectedRecommendation preview
wiring.

Current state remains:

- no app code changes in this checkpoint
- `app/trade-app.tsx` was not changed
- no Trade UI wiring exists yet
- component/harness are not wired into Trade UI
- dev route remains fixture/model-only and unlinked from main navigation
- no real selectedRecommendation state is read/rendered from app/route
- no real app/route preview state is derived/rendered
- selectedRecommendation preview remains disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- no active execution is allowed

## Preconditions Met

Preconditions now met:

- `docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md`
  exists
- `docs/avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md`
  exists
- passive component/default-off wiring preparation phase is complete
- passive preview component exists
- pure Trade UI preview model exists
- dev QA route remains fixture/model-only

## Allowed Next Implementation Scope

The next implementation task may touch `app/trade-app.tsx` only after this
checkpoint.

Plain boundary: app/trade-app.tsx may be touched only after this checkpoint.

Allowed next implementation:

- integration must be passive/read-only
- integration must be default-off
- integration must render nothing by default
- integration may import the passive preview component only
- integration may import/use the pure Trade UI preview model only behind a
  hardcoded/internal disabled guard
- integration may pass only an already-present selectedRecommendation-like
  object
- integration must not discover/search/fetch selectedRecommendation
- integration must not introduce polling
- integration must not introduce refresh
- integration must not add active controls
- integration must not add handoff button
- integration must not add prepare button
- integration must not add buy/sell CTA

## Required app/trade-app.tsx Integration Boundary

Any future edit to `app/trade-app.tsx` must remain tightly scoped to a
default-off passive preview surface.

It must not alter existing Trade UI recommendation workflows, active trading
CTAs, bridge behavior, settings behavior, fetch behavior, route behavior, or
execution behavior.

## Required Default-Off Guard

The future guard must be:

- hardcoded false or equivalent disabled internal constant initially
- no visible user toggle
- no runtime environment production enablement
- no localStorage/sessionStorage enablement
- no accidental production enablement
- enabled path remains passive/read-only only

## Required Passive Rendering Behavior

Future passive rendering behavior:

- `hidden`/`disabled`/`no_selected_recommendation` render nothing or safe
  passive copy
- `read_only_preview_ready` may render passive preview only
- non-ready statuses render nothing or safe passive status copy
- previewState visible only for `read_only_preview_ready`
- `canProceedToHandoff: false`
- `controlsEnabled: false`
- `gateLocked: true`

## Required Placement Constraints

Future placement constraints:

- preview must not disrupt existing recommendation card CTAs
- preview must not be placed near active trading CTAs
- preview must not appear as an execution panel
- preview must not appear as a broker handoff panel
- preview must be visually labeled passive/read-only if rendered

## Required Safety Guarantees

Required safety guarantees:

- no bridge calls
- no localhost fetch
- no polling
- no refresh outside existing app behavior
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim

## Explicit Non-Goals

This checkpoint does not implement:

- `app/trade-app.tsx` changes
- Trade UI wiring
- selectedRecommendation reads from app/route
- selectedRecommendation preview rendering in Trade UI
- app/route preview derivation
- default Trade UI preview rendering
- dev route changes
- main navigation link to the dev route
- runtime environment config
- visible toggle
- active handoff button
- prepare button
- buy/sell CTA
- bridge, localhost, polling, runner, fill, click, review, final, submit,
  order, credential/session, BankID, cookies, storage, Supabase execution
  write, or live Avanza behavior

## Go/No-Go Checklist

Go only if all conditions remain true:

- `app/trade-app.tsx` remains unchanged before the future implementation task
- default path renders nothing new
- internal guard starts false
- no visible user toggle exists
- no runtime environment enablement exists
- no localStorage/sessionStorage enablement exists
- component import is passive only
- model usage is behind the disabled guard only
- selectedRecommendation-like input is already present
- no search/fetch/discovery is added
- no polling or refresh is added
- no active controls are added
- no handoff, prepare, or buy/sell CTA is added
- no broker execution wording or order submission copy is added

## Recommended Next Implementation Task

Recommended next implementation task:

Add a hardcoded/default-off passive Trade UI integration skeleton in
`app/trade-app.tsx` that renders nothing by default and proves the passive
read-only selectedRecommendation preview remains disabled unless an internal
test-only path is explicitly enabled.

That task must still forbid bridge/fetch/polling/refresh additions, handoff,
prepare, buy/sell CTA, execution wording, order behavior, credentials/session
handling, and Supabase execution writes.

## References

- [Avanza Trade app passive read-only selectedRecommendation preview wiring plan](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation pre-Trade-UI wiring architecture checkpoint](avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring plan](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview integration plan](avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Minimal Default-Off Wiring Follow-Up

Status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_minimal_default_off_wiring_added`

`app/trade-app.tsx` now contains a hardcoded internal guard,
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false`, and a passive
read-only preview branch behind that guard.

The branch uses only
`avanzaTradeUiReadOnlySelectedRecommendationPreviewDefaultModel`; it does not
read real selectedRecommendation state, does not derive previewState from app
state, and renders `null` by default. Default Trade UI behavior remains visually
unchanged and continues to show static fixture Avanza preview behavior with
selectedRecommendation preview disabled.

No visible toggle, runtime environment path, localStorage/sessionStorage path,
bridge call, localhost fetch, polling, refresh, active handoff, prepare button,
buy/sell CTA, fill/click/review/final/submit/order behavior,
credential/session/BankID/cookie/storage handling, Supabase execution write, or
live Avanza behavior was added.

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
