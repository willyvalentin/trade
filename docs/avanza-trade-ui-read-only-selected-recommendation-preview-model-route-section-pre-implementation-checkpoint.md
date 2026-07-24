# Avanza Trade UI Read-Only SelectedRecommendation Preview Model Route Section Pre-Implementation Checkpoint

## Current Status

The Trade UI read-only selectedRecommendation preview model, static model
fixtures, and isolated harness exist. The harness is not wired into Trade UI
and is now rendered on the dev-only Avanza visual QA route as a fixture/model-
only section.

`app/trade-app.tsx` remains unchanged. The dev-only visual QA route remains
unlinked from main navigation. selectedRecommendation preview remains disabled
by default in Trade UI.

## Preconditions Met

- Route section plan exists:
  `docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-plan.md`
- Pure model exists:
  `lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts`
- Static model fixtures exist:
  `lib/avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures.ts`
- Isolated harness exists:
  `components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx`
- The harness remains outside Trade UI and is rendered on the dev route only
  with static fixture/model data.
- No real selectedRecommendation state is read or rendered from app/route.
- No real app/route preview state is derived or rendered.

## Allowed Next Implementation Scope

A future explicit implementation task may update:

`app/dev/avanza-visual-qa/page.tsx`

only to import and render:

`AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness`

The future route section may render only static Trade UI preview model fixtures.
It must be fixture/model-only, default-off, explicit input/config only, and
non-executing.

`app/trade-app.tsx` must remain unchanged. The route must remain unlinked from
main navigation. No Trade UI wiring is allowed.

## Required Route Section Behavior

The future route section must:

- render static Trade UI preview model fixtures only
- clearly identify itself as fixture/model-only
- avoid reading real selectedRecommendation state
- avoid rendering real selectedRecommendation state
- avoid deriving real app/route preview state
- avoid rendering real app/route preview state
- avoid Trade UI wiring
- avoid bridge calls, localhost fetch, polling, handoff, and execution

## Required Fixture/Model-Only Labels

The route-visible section must include:

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

## Required Fixture Visibility

The future route section must show all eight fixture statuses:

- `hidden_default`
- `disabled_config`
- `no_selected_recommendation`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

## Required PreviewState Visibility Rules

The future route section must preserve these rules:

- previewState is visible only for `read_only_preview_ready`
- `previewState` is visible only for `read_only_preview_ready`
- `previewState` is absent for every other status
- `read_only_preview_ready` is labeled passive/read-only/model-only
- `read_only_preview_ready` is not active
- `canRenderReadOnlyPreview` is true only for `read_only_preview_ready`

## Required Default-Off Guarantees

Default behavior must remain:

- selectedRecommendation preview disabled by default in Trade UI
- no default Trade UI selectedRecommendation preview rendering
- no runtime environment enablement path
- no visible toggle
- no active control
- no handoff button

## Required Safety Guarantees

Every future route-visible fixture must preserve:

- `canProceedToHandoff: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`
- no active handoff button
- no bridge calls
- no localhost fetch
- no polling
- no trigger/fill/click/review/final/submit/order behavior
- no credential/session/BankID/cookies/storage handling
- no Supabase execution writes

## Explicit Non-Goals

This checkpoint does not permit:

- changing `app/trade-app.tsx`
- changing the dev route in this task
- wiring the harness into Trade UI in this task
- wiring the harness into the dev route in this task
- reading real selectedRecommendation state from app/route
- rendering real selectedRecommendation preview in Trade UI
- deriving preview from app/route state
- rendering preview in default Trade UI
- linking the dev route from main navigation
- enabling selectedRecommendation preview by default
- adding runtime env config
- adding active controls
- enabling a handoff button
- adding bridge/fetch/polling/execution behavior

## Go/No-Go Checklist

Before rendering the harness on the dev route, verify:

- `app/trade-app.tsx` remains unchanged
- the route remains unlinked from main navigation
- the route section will render static fixtures only
- the route section will say Preview model fixture only
- the route section will say Default-off
- the route section will say Explicit input/config only
- the route section will say no real selectedRecommendation state is read
- the route section will say no real selectedRecommendation state is rendered
- the route section will say no app/route preview state is derived
- all eight fixture statuses will be visible
- `previewState` remains exclusive to `read_only_preview_ready`
- controls remain disabled
- gate remains locked
- no active handoff button appears
- no live endpoint strings or exact trigger phrase appears

## Recommended Next Implementation Task

Next recommended task:

Render `AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness` on the
dev-only Avanza visual QA route as a fixture/model-only route section.

That task must not change Trade UI, must not read real selectedRecommendation
state, must not derive app/route preview state, must not add active controls,
and must not add bridge/fetch/polling/execution behavior.

## Route Section Implementation Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness` as a
fixture/model-only section using static Trade UI preview model fixtures.

The section is dev-route-only and remains unlinked from main navigation. It
does not change `app/trade-app.tsx`, does not wire Trade UI, does not read real
selectedRecommendation state, does not derive app/route preview state, keeps
controls disabled, keeps the gate locked, and adds no execution behavior.

## Route Section Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md`
now records the completed fixture/model-only dev-route section. It confirms
static fixtures only, previewState only for `read_only_preview_ready`, no real
selectedRecommendation state reads, no app/route preview derivation, no Trade
UI wiring, disabled controls, locked gate, and no execution behavior.

## Phase Completion Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md`
now closes the Trade UI read-only selectedRecommendation preview model phase as
fixture/model-only complete while preserving the same no-Trade-UI-wiring and
non-execution boundary.

## References

- [Avanza Trade UI read-only selectedRecommendation preview model phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section plan](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview integration plan](avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation architecture checkpoint before Trade UI](avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md)
- [Avanza real selectedRecommendation read-only derivation phase completion checkpoint](avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
