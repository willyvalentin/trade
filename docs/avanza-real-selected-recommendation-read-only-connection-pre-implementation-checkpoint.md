# Avanza Real SelectedRecommendation Read-Only Connection Pre-Implementation Checkpoint

Status: `avanza_real_selected_recommendation_read_only_connection_pre_implementation_checkpoint_added`

## Current Status

The real selectedRecommendation read-only connection is not implemented yet.

The current system remains default-off:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- default Trade UI remains visually unchanged
- source extraction remains not wired into Trade UI
- real selectedRecommendation input is not connected, read, or rendered
- no previewState is derived from app or route state
- no active execution is allowed

## Preconditions Met

The following prerequisite phases are complete:

- selectedRecommendation source mapping phase
- hard-disabled source-to-preview integration phase
- hard-disabled Trade UI branch wiring phase
- test-only enabled branch phase
- real selectedRecommendation read-only connection planning

Relevant pure/passive artifacts already exist:

- `lib/avanza-selected-recommendation-source-extraction.ts`
- `lib/avanza-hard-disabled-source-to-preview-integration.ts`
- `lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts`
- `components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx`

## Allowed Next Implementation Scope

The next implementation may add a pure real selectedRecommendation read-only
connection model/helper only.

The helper must accept explicit arguments only. It may accept:

- `connectionEnabled: boolean`
- `selectedRecommendationCandidate?: unknown`
- optional `sourceName`
- optional `sourceKind`
- optional integration/test-only flags if explicit

The helper may call source extraction and hard-disabled source-to-preview
integration only in pure/model-only code.

The helper must not be wired into `app/trade-app.tsx` yet.

The helper must not be wired into the dev route yet.

The helper must not enable preview.

## Required Connection Model/Helper Behavior

The helper must not read app state implicitly.

The helper must not read route state.

The helper must not read React context/global state.

The helper must not read `process.env`.

The helper must not read localStorage, sessionStorage, browser storage,
cookies, credentials, sessions, BankID metadata, Supabase state, or execution
records.

The helper must not fetch.

The helper must not poll.

The helper must not call bridge endpoints, call localhost, call Supabase, call
live runner/fill endpoints, write execution records, or perform
fill/click/review/final/submit/order behavior.

## Required Status Model

The future helper must expose these statuses:

- `connection_disabled`
- `selected_recommendation_unavailable`
- `selected_recommendation_invalid`
- `selected_recommendation_ready_read_only`
- `preview_ready_read_only_blocked`
- `preview_ready_read_only`

## Required Output Model

The future helper must return:

- `status`
- `label`
- `reason`
- `selectedRecommendationSourceStatus`
- `integrationStatus`
- `modelResult` only for `preview_ready_read_only`
- `canRenderPreview` false by default
- `canProceedToHandoff` false
- `canCallBridge` false
- `canFetchLocalhost` false
- `canPoll` false
- `canExecute` false
- `controlsEnabled` false
- `gateLocked` true

## Required Data Safety Rules

Allowed recommendation fields are limited to:

- `id`
- `ticker` or `symbol`
- `action` or `direction`
- `entry` or entry range
- `stopLoss`
- `target`
- `quantity` or `shares`
- `confidence`
- `rationale` if already present and non-sensitive

The helper must exclude:

- account ids
- broker session data
- credentials
- cookies
- BankID/session metadata
- browser storage
- Supabase auth/session
- execution records
- order submission metadata

## Required Hard-Disabled/Default-Off Rules

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` must remain false.

Default Trade UI must remain visually unchanged.

selectedRecommendation preview must remain disabled by default.

No runtime env config, localStorage, sessionStorage, or visible toggle may
enable the feature.

Any future real connection may only run behind explicit model-only/test-only
inputs until separately planned.

## Explicit Non-Goals

This checkpoint does not permit:

- changing `app/trade-app.tsx`
- wiring the helper into Trade UI
- wiring the helper into the dev route
- connecting real selectedRecommendation input
- reading selectedRecommendation from app or route state
- enabling preview in normal/default UI
- changing `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` to true
- deriving previewState from app or route state
- adding runtime env config
- changing `.env.local`
- adding localStorage/sessionStorage enablement
- adding a visible toggle
- adding active handoff, prepare, buy/sell CTA, bridge/fetch/polling, order,
  credential/session handling, or Supabase write behavior

## Go/No-Go Checklist

Proceed only if the next implementation:

- adds a pure helper/model only
- accepts explicit arguments only
- keeps the helper unwired from Trade UI
- keeps the helper unwired from the dev route
- keeps real selectedRecommendation input disconnected from runtime surfaces
- keeps source extraction unwired from Trade UI
- keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false
- keeps selectedRecommendation preview disabled by default
- derives no previewState from app or route state
- adds no active controls
- adds no handoff, prepare, buy/sell CTA, bridge/fetch/polling, order behavior,
  credential/session handling, or Supabase write

Do not proceed if implementation requires app wiring, route wiring, runtime
state reads, storage reads, env enablement, preview enablement, handoff, bridge,
localhost, polling, execution, credentials, sessions, or Supabase writes.

## Recommended Next Implementation Task

Add a pure real selectedRecommendation read-only connection model/helper.

That task must keep `app/trade-app.tsx` unchanged, keep the helper unwired from
Trade UI and the dev route, keep source extraction unwired from Trade UI, keep
real selectedRecommendation input disconnected from runtime state, keep
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, keep default Trade UI
visually unchanged, derive no previewState from app or route state, and add no
execution behavior.

## Implementation Follow-Up

`lib/avanza-real-selected-recommendation-read-only-connection.ts` now implements
the pure real selectedRecommendation read-only connection model/helper.

The helper accepts explicit inputs only, maps source extraction and
hard-disabled source-to-preview integration into read-only statuses, exposes a
safe normalized selectedRecommendation summary, and keeps handoff, bridge,
localhost fetch, polling, execution, controls, and gate state hard-disabled.

The helper is not wired into `app/trade-app.tsx` or the dev route. Real
selectedRecommendation input remains disconnected from Trade UI,
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false, default Trade
UI remains visually unchanged, and no previewState is derived from app or route
state.

## Fixtures And Harness Follow-Up

`lib/avanza-real-selected-recommendation-read-only-connection-fixtures.ts` and
`components/execution/AvanzaRealSelectedRecommendationReadOnlyConnectionHarness.tsx`
now provide isolated fixture/model-only visibility for all six connection
statuses.

The fixtures and harness use explicit static candidates only. They are not
wired into `app/trade-app.tsx`. The harness is now rendered on the dev-only
visual QA route as fixture/model-only content, does not read real
selectedRecommendation state from app or route state, does not derive
previewState from app or route state, and keeps bridge, localhost fetch,
polling, execution, controls, and handoff unavailable.

## Route Section Planning Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-route-section-plan.md`
now defines the planning-only boundary for a future dev-only visual QA route
section that may render the connection harness with static fixtures only.

This does not permit route changes yet. The harness remains unwired from the
dev route and Trade UI, real selectedRecommendation input remains disconnected,
source extraction remains unwired from Trade UI, no previewState is derived
from app or route state, and no active controls, handoff, prepare, buy/sell CTA,
bridge/fetch/polling, order behavior, credential/session handling, or Supabase
write is added.

## Route Section Pre-Implementation Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-route-section-pre-implementation-checkpoint.md`
now records the go/no-go checklist before that fixture/model-only route section
may be implemented.

The checkpoint keeps the connection helper and harness unwired from Trade UI
and the dev route for now. It allows only a future static-fixture route section,
keeps real selectedRecommendation input disconnected, keeps source extraction
unwired from Trade UI, keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
false, derives no previewState from app or route state, and forbids active
controls, handoff, prepare, buy/sell CTA, bridge/fetch/polling, order behavior,
credential/session handling, and Supabase writes.

## Route Section Implementation Follow-Up

The real selectedRecommendation read-only connection harness is now rendered on
the dev-only Avanza visual QA route as fixture/model-only content.

Only static connection fixtures are rendered. `app/trade-app.tsx` remains
unchanged, the connection path remains unwired from Trade UI, real
selectedRecommendation input remains disconnected from Trade UI, source
extraction remains unwired from Trade UI, and no previewState is derived from
app or route state.

## Route Section Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-route-section-checkpoint.md`
now captures the completed route section. It confirms the section remains
fixture/model-only, route-only, unlinked from main navigation, unwired from
Trade UI, disconnected from real selectedRecommendation input, and
non-executable.

## References

- [Avanza real selectedRecommendation read-only connection route section plan](avanza-real-selected-recommendation-read-only-connection-route-section-plan.md)
- [Avanza real selectedRecommendation read-only connection route section pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-connection-route-section-pre-implementation-checkpoint.md)
- [Avanza real selectedRecommendation read-only connection route section checkpoint](avanza-real-selected-recommendation-read-only-connection-route-section-checkpoint.md)
- [Avanza real selectedRecommendation read-only connection safety audit](avanza-real-selected-recommendation-read-only-connection-safety-audit.md)
- [Avanza real selectedRecommendation read-only connection phase completion checkpoint](avanza-real-selected-recommendation-read-only-connection-phase-completion-checkpoint.md)
- [Avanza real selectedRecommendation read-only connection plan](avanza-real-selected-recommendation-read-only-connection-plan.md)
- [Avanza test-only enabled branch phase completion checkpoint](avanza-test-only-enabled-branch-phase-completion-checkpoint.md)
- [Avanza test-only enabled branch safety audit](avanza-test-only-enabled-branch-safety-audit.md)
- [Avanza test-only enabled preview route section checkpoint](avanza-test-only-enabled-preview-route-section-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring phase completion checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Safety Audit Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-safety-audit.md`
now verifies the connection path remains fixture/model-only, route-only,
unwired from Trade UI, disconnected from real selectedRecommendation input, and
non-executable. The pre-implementation boundary remains intact: no Trade UI
wiring, no app/route previewState derivation, no default preview enablement,
and no bridge/fetch/polling/order behavior.

## Phase Completion Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-phase-completion-checkpoint.md`
now records the phase as complete. The checkpoint confirms the pure helper,
fixtures, isolated harness, dev-route fixture/model-only section, and safety
audit are complete without relaxing any pre-implementation safety boundary.
