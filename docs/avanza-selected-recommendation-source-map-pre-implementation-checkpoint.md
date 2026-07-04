# Avanza SelectedRecommendation Source Map Pre-Implementation Checkpoint

## Current Status

The selectedRecommendation source map has moved from planning-only to an
isolated pure-helper implementation.

The pure source extraction helper exists at
`lib/avanza-selected-recommendation-source-extraction.ts`. It accepts explicit
candidate input only and remains unwired from `app/trade-app.tsx`, the dev
route, and the passive preview model path.

Static source extraction fixtures now exist at
`lib/avanza-selected-recommendation-source-extraction-fixtures.ts`, and the
isolated renderer exists at
`components/execution/AvanzaSelectedRecommendationSourceExtractionHarness.tsx`.
They cover `no_source`, `source_unavailable`, `source_blocked`,
`source_invalid`, and `source_ready_read_only` using explicit fixture input
only. They are not wired into `app/trade-app.tsx`, the dev route, or the passive
preview model path.

The route-section plan exists at
`docs/avanza-selected-recommendation-source-extraction-route-section-plan.md`.
It permits only a future fixture/model-only dev route section for the source
extraction harness and still forbids route changes in this task, Trade UI
wiring, real selectedRecommendation input, preview model connection, and
previewState derivation from app or route state.

The route-section pre-implementation checkpoint exists at
`docs/avanza-selected-recommendation-source-extraction-route-section-pre-implementation-checkpoint.md`.
It explicitly permits a future task to render the source extraction harness on
the dev-only visual QA route as fixture/model-only content, while keeping the
harness unwired for this task.

That route section has now been rendered on `app/dev/avanza-visual-qa/page.tsx`
using `AvanzaSelectedRecommendationSourceExtractionHarness` and static source
extraction fixtures only. It remains disconnected from Trade UI, real
selectedRecommendation input, the preview model, and app or route previewState
derivation.

Status facts: Default Trade UI remains visually unchanged; no real selectedRecommendation input is connected; no real selectedRecommendation state is read or rendered from app or route state; no previewState is derived from app or route state.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false. Default Trade
UI remains visually unchanged, no real selectedRecommendation state is read or
rendered from app or route state, and no previewState is derived from app or
route state.

## Preconditions Met

The source map plan exists and defines the boundary for finding an
already-present selectedRecommendation-like object in `app/trade-app.tsx`.

The passive/default-off Trade UI wiring phase is complete, but the wired branch
still uses only the default hidden model and cannot render by default.

The passive preview component and Trade UI read-only preview model exist, but
they are not connected to real selectedRecommendation input.

## Implemented Pure Helper Scope

The implemented scope is limited to a pure selectedRecommendation source
extraction helper.

Implemented scope fact: added only a pure selectedRecommendation source extraction helper.

That helper may:

- accept explicit candidate or source input only
- inspect explicitly passed objects only
- produce safe, minimal selectedRecommendation-like output
- return a typed source status model
- return a normalized source summary when a source is ready for read-only use

That helper must not:

- read app state implicitly
- read route state
- read React context or global state
- fetch, discover, or search for selectedRecommendation
- poll
- write Supabase
- call bridge or localhost endpoints
- connect to the preview model yet
- be wired into `app/trade-app.tsx` yet

## Source Extraction Helper Behavior

The helper is required to be pure and side-effect free. It must receive all input
explicitly, inspect only that input, and return a safe result that can be tested
without rendering the app.

The helper must avoid credentials, account/session data, cookies, storage,
BankID state, broker secrets, execution state, and anything that could mutate
trading state.

The helper does not enable the preview and does not derive previewState.

## Fixture And Harness Scope

The fixture module and harness are static and isolated. They render source
extraction decisions for test/dev visibility only and do not read real
selectedRecommendation state, read Trade UI state, read route state, call the
preview model, derive previewState, fetch, poll, call bridge or localhost, write
Supabase, or enable execution.

Only the `source_ready_read_only` fixture includes
`selectedRecommendationLikeInput`, `normalizedSourceSummary`, and
`canProceedToPreviewModel: true`. All fixtures keep `canProceedToHandoff`,
`canCallBridge`, `canFetchLocalhost`, `canPoll`, `canExecute`, and
`controlsEnabled` false, with `gateLocked` true.

## Route Section Planning Scope

The source extraction route section plan allowed
`AvanzaSelectedRecommendationSourceExtractionHarness` to be rendered on
`app/dev/avanza-visual-qa/page.tsx` using static source extraction fixtures
only. That fixture/model-only route section is now rendered.

That future route section must remain dev-only, fixture/model-only, unlinked
from main navigation, and disconnected from Trade UI, real selectedRecommendation
state, the preview model, app or route previewState derivation, bridge/local
fetches, polling, active controls, and execution.

## Source Status Model

The helper uses these statuses:

- `no_source`
- `source_unavailable`
- `source_blocked`
- `source_invalid`
- `source_ready_read_only`

Only `source_ready_read_only` may allow a later step to pass a
selectedRecommendation-like input toward the passive read-only preview model.

## Output Model

The output includes:

- `status`
- `label`
- `reason`
- `sourceName`
- `sourceKind`
- `selectedRecommendationLikeInput`, only for `source_ready_read_only`
- `normalizedSourceSummary`, only for `source_ready_read_only`
- `canProceedToPreviewModel`, true only for `source_ready_read_only`
- `canProceedToHandoff: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

The `normalizedSourceSummary` may include only safe display fields:

- id if available
- ticker or symbol if available
- direction or action if available
- entry or range if available
- stopLoss if available
- target if available
- quantity or shares if available
- confidence if available

It must not include credentials, account/session data, cookies, storage,
broker secrets, BankID state, or execution records.

## Safety Guarantees

The source extraction helper preserves:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- preview remains hard-disabled by default
- no previewState derived from app or route state
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

## Explicit Non-Goals

This checkpoint does not authorize:

- changing `app/trade-app.tsx`
- connecting real selectedRecommendation input
- enabling the preview
- changing `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` to true
- reading real selectedRecommendation state from app or route
- rendering real selectedRecommendation preview in normal/default Trade UI
- deriving previewState from app or route state
- adding runtime environment config
- adding localStorage/sessionStorage enablement
- adding a visible toggle
- adding handoff, prepare, or buy/sell controls
- adding bridge, localhost, runner, fill, order, credential, session, or
  Supabase write behavior

## Go/No-Go Checklist

Before any later connection to the passive preview model path, confirm:

- source map plan exists
- this pre-implementation checkpoint exists
- pure source extraction helper exists
- source extraction fixtures cover all source statuses
- isolated source extraction harness exists
- source extraction route section plan exists
- source extraction route section pre-implementation checkpoint exists
- `app/trade-app.tsx` is not changed by the source extraction helper
- helper input is explicit
- helper output is typed
- helper remains pure and side-effect free
- preview remains hard-disabled by default
- controls remain disabled
- gate remains locked
- no execution path is introduced

Do not proceed if the next implementation requires fetching, polling, bridge/local
calls, route state, React context/global state, credentials, session data, or
preview enablement.

## Recommended Next Implementation Task

The route section checkpoint has now been added at
`docs/avanza-selected-recommendation-source-extraction-route-section-checkpoint.md`.
It records the completed source extraction harness section and keeps the helper,
fixtures, and harness isolated from `app/trade-app.tsx` and the passive preview
model path.

The selectedRecommendation source mapping phase completion checkpoint has now
been added at
`docs/avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md`.
Only after that phase completion checkpoint should a later task consider
planning a hard-disabled connection from the helper to the default-off preview
model path.

## References

- [Avanza selectedRecommendation source map plan](avanza-selected-recommendation-source-map-plan.md)
- [Avanza selectedRecommendation source extraction route section plan](avanza-selected-recommendation-source-extraction-route-section-plan.md)
- [Avanza selectedRecommendation source extraction route section pre-implementation checkpoint](avanza-selected-recommendation-source-extraction-route-section-pre-implementation-checkpoint.md)
- [Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring plan](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation pre-Trade-UI wiring architecture checkpoint](avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
