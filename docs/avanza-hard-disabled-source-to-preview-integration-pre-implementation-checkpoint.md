# Avanza Hard-Disabled Source-To-Preview Integration Pre-Implementation Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_hard_disabled_source_to_preview_integration_pre_implementation_checkpoint_satisfied`

## Current Status

The hard-disabled source-to-preview integration plan exists, and the pure
integration model/helper has now been implemented without wiring it into Trade
UI or the dev route.

Current state remains:

- source extraction is not wired into `app/trade-app.tsx`
- source extraction is not connected to the preview model
- real selectedRecommendation input is not connected, read, or rendered
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- selectedRecommendation preview remains disabled by default in Trade UI
- no previewState is derived from app or route state
- no active controls, handoff, prepare, buy/sell, bridge, fetch, polling, order,
  credential/session handling, or Supabase write exists

## Preconditions Met

The following artifacts already exist:

- `docs/avanza-hard-disabled-source-to-preview-integration-plan.md`
- `docs/avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md`
- `lib/avanza-selected-recommendation-source-extraction.ts`
- `lib/avanza-selected-recommendation-source-extraction-fixtures.ts`
- `lib/avanza-hard-disabled-source-to-preview-integration.ts`
- `lib/avanza-hard-disabled-source-to-preview-integration-fixtures.ts`
- `components/execution/AvanzaHardDisabledSourceToPreviewIntegrationHarness.tsx`
- `components/execution/AvanzaSelectedRecommendationSourceExtractionHarness.tsx`
- `lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts`
- `components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx`

The source extraction harness is rendered on the dev-only Avanza visual QA route
as fixture/model-only content.

## Allowed Next Implementation Scope

The next implementation may add a pure source-to-preview integration
model/helper only.

The planned helper path is:

- `lib/avanza-hard-disabled-source-to-preview-integration.ts`

The helper may accept explicit arguments only, such as:

- `integrationEnabled` boolean
- source extraction result
- selectedRecommendation-like candidate if needed
- optional preview model input/result if explicit

The helper may call, or build input for, the existing Trade UI read-only preview
model only in a pure/model-only context.

The helper must not:

- read app state implicitly
- read route state
- read React context or global state
- read `process.env`
- read localStorage or sessionStorage
- fetch
- poll
- call bridge endpoints
- call localhost endpoints
- call Supabase
- be wired into `app/trade-app.tsx`
- be wired into the dev route yet
- enable preview

## Required Integration Model/Helper Behavior

The helper must be pure and side-effect free.

It must return a typed decision that explains why the integration is disabled,
blocked, not ready, or ready only as a read-only preview model result. It must
never imply handoff readiness, order readiness, execution readiness, or
production readiness.

`integrationEnabled: false` must always return `integration_disabled`.

## Required Status Model

The future status model must include:

- `integration_disabled`
- `source_not_ready`
- `source_ready_preview_blocked`
- `preview_model_ready_read_only`
- `integration_blocked`

## Required Output Model

The future output model must include:

- `status`
- `label`
- `reason`
- `sourceStatus`
- `previewModelStatus`
- `modelResult`, only when `preview_model_ready_read_only`
- `canRenderPreview`, false unless inside explicit hard-disabled/test-only branch
- `canProceedToHandoff: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

## Required Source-To-Preview Safety Rules

Required safety rules:

- `integrationEnabled: false` must always return `integration_disabled`
- source not ready must not call or build a preview model result
- `source_ready_read_only` may allow preview-model input only, not handoff
- preview model output must remain read-only
- `selectedRecommendationLikeInput` must be sanitized and minimal
- `normalizedSourceSummary` must exclude credentials, account/session data,
  cookies, storage values, and broker secrets
- no broker-specific session data may flow into the preview model
- no order-ready state may be produced
- `canProceedToHandoff` must be false for all statuses
- bridge/local fetch/polling/execution must be false for all statuses
- controls must be disabled for all statuses
- gate must be locked for all statuses

## Required Hard-Disabled Guard Rules

Hard-disabled guard rules:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- default Trade UI remains visually unchanged
- selectedRecommendation preview remains disabled by default in Trade UI
- no env, localStorage, sessionStorage, or visible toggle can enable it
- future integration may only run behind explicit test-only/model-only inputs

## Explicit Non-Goals

This checkpoint does not authorize:

- changing `app/trade-app.tsx`
- implementing source-to-preview integration in this task
- wiring source extraction into Trade UI
- connecting source extraction to the preview model
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

Before implementing the pure helper, confirm:

- this pre-implementation checkpoint exists
- the hard-disabled source-to-preview integration plan exists
- source mapping phase is complete
- source extraction helper is pure and explicit-input only
- Trade UI read-only preview model exists
- passive preview component exists
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- source extraction is not wired into Trade UI
- source extraction is not connected to the preview model
- real selectedRecommendation input is not connected
- no previewState is derived from app or route state
- no env/localStorage/sessionStorage/toggle enablement exists
- no active controls or execution path exists

Do not proceed if the implementation requires app state reads, route state
reads, runtime enablement, bridge/local calls, polling, active controls,
credentials, session data, Supabase writes, or execution.

## Recommended Next Implementation Task

The pure hard-disabled source-to-preview integration model/helper now exists at
`lib/avanza-hard-disabled-source-to-preview-integration.ts`.

The next task, if any, should add fixtures or an isolated harness for the helper.
That fixture/harness task has now been completed. Any next task must keep the
helper pure, explicit-input only, unwired from
`app/trade-app.tsx`, disconnected from real
selectedRecommendation input, default-off, read-only, and non-executing.

The route section plan now exists at
`docs/avanza-hard-disabled-source-to-preview-integration-route-section-plan.md`.
It permits only a future fixture/model-only dev route section and still forbids
Trade UI wiring, real selectedRecommendation input, preview enablement,
app/route previewState derivation, handoff, bridge/fetch/polling, and
execution.

The route section pre-implementation checkpoint now exists at
`docs/avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md`.
It must be satisfied before rendering the integration harness on the dev route
and keeps the allowed implementation limited to fixture/model-only visibility.

## Route Section Rendered Follow-Up

The allowed route section has now been rendered as fixture/model-only content:

- route: `app/dev/avanza-visual-qa/page.tsx`
- harness:
  `components/execution/AvanzaHardDisabledSourceToPreviewIntegrationHarness.tsx`
- fixtures: `lib/avanza-hard-disabled-source-to-preview-integration-fixtures.ts`

The route uses only static fixtures, remains unlinked from main navigation,
does not read real selectedRecommendation state, does not derive previewState
from app or route state, and does not wire anything into `app/trade-app.tsx`.

All output remains read-only/model-only: `canProceedToHandoff`, bridge/local
fetch, polling, execution, active controls, and unlocked gates stay disabled.

## Route Section Checkpoint Follow-Up

The completed route section checkpoint now exists at
`docs/avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md`.
It records the fixture/model-only dev-route section, confirms
`app/trade-app.tsx` was not changed for the route section, and keeps real
selectedRecommendation input, preview enablement, app/route previewState
derivation, bridge/fetch/polling, handoff, order behavior, credentials,
sessions, and Supabase writes forbidden.

## Phase Completion Checkpoint Follow-Up

The hard-disabled source-to-preview integration phase completion checkpoint now
exists at
`docs/avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md`.
It closes the pure helper, fixture, harness, and fixture/model-only dev route
section phase before any separate hard-disabled Trade UI branch wiring plan.

## References

- [Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section plan](avanza-hard-disabled-source-to-preview-integration-route-section-plan.md)
- [Avanza hard-disabled source-to-preview integration route section pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
- [Avanza selectedRecommendation source map plan](avanza-selected-recommendation-source-map-plan.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
