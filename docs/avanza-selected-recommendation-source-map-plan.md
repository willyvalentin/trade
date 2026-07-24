# Avanza SelectedRecommendation Source Map Plan

## Purpose

This plan defines how a future task may identify an already-present
selectedRecommendation-like object inside `app/trade-app.tsx` before any real
Trade UI preview input is connected.

The purpose is to map existing in-memory UI data only. The plan avoids
discovery, search, fetch, new state sources, polling, refresh behavior, bridge
calls, localhost calls, and execution. It prepares for a later explicit
read-only source extraction step without implementing that extraction now.

## Strict Phase Boundary

This phase has progressed through a pure helper plus fixture/harness layer.

No app code changes are allowed from this source-map work. `app/trade-app.tsx`
must not be changed, no preview is enabled, no real selectedRecommendation input
is connected, and no previewState is derived from app or route state.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false. Default Trade
UI remains visually unchanged, and the passive read-only selectedRecommendation
preview remains hard-disabled by default.

## Source Mapping Rules

A future source map may consider only data that already exists in
`app/trade-app.tsx`.

The source must be selectedRecommendation-like and must be passed explicitly to a
future pure extraction helper or preview model. It must not be fetched,
discovered, searched, polled, refreshed, or inferred from broker/account/session
state.

The source must not contain credentials, cookies, storage data, BankID/session
material, broker account state, or any execution state.

## Required Future Source Extraction Behavior

If source extraction is implemented later, it must be pure and side-effect free.
It may use a small helper if needed, but that helper must accept explicit input
only and return a safe, minimal normalized summary.

The extraction path must not fetch, call bridge or localhost endpoints, poll,
refresh, write Supabase records, execute, fill, click, review, final, submit, or
order.

The output must keep controls disabled, the pre-activation gate locked, and
`canProceedToHandoff` false.

## Candidate Source Categories To Inspect Later

Future inspection may look for:

- currently selected recommendation in UI state
- recommendation card data already rendered
- active recommendation object already passed to detail or modal components
- existing `selectedRecommendation` variable or state if present
- existing recommendation preview, mock, or static fixture state

These candidates are only mapping targets. This plan does not authorize reading
or wiring any of them yet.

## Disallowed Source Categories

Future source mapping must reject:

- new network fetch
- Supabase query
- bridge query
- Avanza session or browser state
- `localStorage` or `sessionStorage`
- environment-based source
- polling scanner output
- any source that mutates trading state
- any source that requires credentials, cookies, storage, BankID, or account
  session data

## Future Source Statuses

A future source map helper should use explicit statuses:

- `no_source`
- `source_unavailable`
- `source_blocked`
- `source_invalid`
- `source_ready_read_only`

Only `source_ready_read_only` may carry selectedRecommendation-like input
forward to the passive read-only preview model path.

## Required Future Output

A future output model should include:

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

The output must exclude credentials, session material, account identifiers,
cookies, storage values, and broker execution state.

## Future Test Expectations

Future tests must prove:

- no source returns `no_source`
- missing current selection returns `source_unavailable`
- blocked source returns `source_blocked`
- invalid source returns `source_invalid`
- valid existing selectedRecommendation-like object returns
  `source_ready_read_only`
- output excludes credentials, session, account, cookies, and storage
- all outputs forbid bridge calls, localhost fetch, polling, and execution
- controls remain disabled
- gate remains locked
- preview remains disabled by default
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false unless a
  separate explicit future task changes it

## Recommended Implementation Sequence

1. Add this source map plan.
2. Add a source map pre-implementation checkpoint.
3. Add a pure selectedRecommendation source extraction helper.
4. Add source extraction fixtures and an isolated harness.
5. Add a source map checkpoint.
6. Only later connect source extraction to the default-off preview model path.

## Pre-Implementation Checkpoint

[Avanza selectedRecommendation source map pre-implementation checkpoint](avanza-selected-recommendation-source-map-pre-implementation-checkpoint.md)
records the pure source extraction helper, fixtures, and isolated harness. It
keeps source extraction unwired from Trade UI and the dev route, forbids preview
enablement, and keeps real selectedRecommendation input disconnected.

The pre-implementation checkpoint permits only isolated helper, fixture, and
harness work until a separate route-section checkpoint allows route rendering.

Historical boundary wording: the pre-implementation checkpoint permits only a
future pure source extraction helper. Current state has advanced to isolated
helper, fixture, and harness artifacts while still forbidding app wiring, route
wiring, preview enablement, real selectedRecommendation input, and previewState
derivation.

## Pure Source Extraction Helper

`lib/avanza-selected-recommendation-source-extraction.ts` implements the pure
selectedRecommendation source extraction helper. It accepts explicit candidate
input only, returns typed source statuses, emits safe normalized summaries only
for `source_ready_read_only`, and remains unwired from Trade UI, the dev route,
and the passive preview model path.

## Source Extraction Fixtures And Harness

`lib/avanza-selected-recommendation-source-extraction-fixtures.ts` covers
`no_source`, `source_unavailable`, `source_blocked`, `source_invalid`, and
`source_ready_read_only` with explicit fixture candidates only.

`components/execution/AvanzaSelectedRecommendationSourceExtractionHarness.tsx`
renders those static fixture results. It is not rendered in
`app/trade-app.tsx`, is not rendered on the dev route, does not call the preview
model, and does not derive previewState.

## Route Section Plan

[Avanza selectedRecommendation source extraction route section plan](avanza-selected-recommendation-source-extraction-route-section-plan.md)
defines a future fixture/model-only dev route section for the isolated source
extraction harness. It does not change the route, does not wire the harness into
Trade UI, does not connect real selectedRecommendation input, and does not
derive previewState from app or route state.

[Avanza selectedRecommendation source extraction route section pre-implementation checkpoint](avanza-selected-recommendation-source-extraction-route-section-pre-implementation-checkpoint.md)
records the go/no-go boundary before rendering that harness on the dev-only
visual QA route. It permits only future fixture/model-only route visibility and
still forbids Trade UI wiring, preview model connection, real selectedRecommendation
reads, previewState derivation, active controls, and execution.

The route section has now been rendered on `app/dev/avanza-visual-qa/page.tsx`
as fixture/model-only content using
`AvanzaSelectedRecommendationSourceExtractionHarness` and static source
extraction fixtures only. It remains unlinked from main navigation and remains
disconnected from Trade UI, real selectedRecommendation input, the preview
model, and app or route previewState derivation.

[Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
records the completed route section state and confirms all five source statuses
remain fixture/model-only, with `source_ready_read_only` read-only/model-only
and all handoff, bridge, fetch, polling, execution, control, and gate safety
values locked down.

[Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
marks the source mapping phase complete. The pure helper, fixtures, isolated
harness, and fixture/model-only dev route section are complete, while source
extraction remains disconnected from Trade UI, real selectedRecommendation
input, the preview model, and app or route previewState derivation.

[Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
plans a future source extraction to preview model connection only behind the
existing false guard. It is planning-only and does not implement integration,
enable preview, connect real selectedRecommendation input, or derive previewState
from app or route state.

[Avanza hard-disabled source-to-preview integration pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-pre-implementation-checkpoint.md)
permits only a future pure source-to-preview helper with explicit inputs. It
keeps source extraction unwired from Trade UI, disconnected from the preview
model in this task, and unable to activate preview, handoff, bridge/fetch,
polling, or execution behavior.

`lib/avanza-hard-disabled-source-to-preview-integration.ts` now implements that
pure helper as an unwired model-only boundary. It can model a hard-disabled
source extraction to read-only preview model result with explicit inputs, but it
does not read Trade UI state, route state, or real selectedRecommendation state.

`lib/avanza-hard-disabled-source-to-preview-integration-fixtures.ts` and
`components/execution/AvanzaHardDisabledSourceToPreviewIntegrationHarness.tsx`
now provide static fixture coverage and isolated rendering for all helper
statuses. They remain unwired from Trade UI and the dev route.

[Avanza hard-disabled source-to-preview integration route section plan](avanza-hard-disabled-source-to-preview-integration-route-section-plan.md)
defines a future fixture/model-only dev route section for the integration
harness. It does not change the route, wire the harness into Trade UI, connect
real selectedRecommendation input, or derive previewState from app or route
state.

[Avanza hard-disabled source-to-preview integration route section pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md)
records the go/no-go boundary before that route section is rendered. It permits
only future fixture/model-only route visibility and keeps preview enablement,
real selectedRecommendation reads, Trade UI wiring, handoff, bridge/fetch,
polling, and execution forbidden.

## Current Safety Boundary

The current implementation remains default-off and passive:

- no app code changed by this plan
- source extraction helper remains pure and unwired
- source extraction fixtures and harness remain isolated and unwired
- source extraction route section is rendered on the dev route as fixture/model-only
- hard-disabled source-to-preview helper remains pure and unwired
- hard-disabled source-to-preview fixtures and harness remain isolated and unwired
- no real selectedRecommendation input connected
- no preview enabled
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- default Trade UI remains visually unchanged
- no real selectedRecommendation state is read or rendered from app or route
- no previewState is derived from app or route state
- no active controls, handoff button, prepare button, or buy/sell CTA
- no bridge calls
- no localhost fetch
- no polling
- no order behavior
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim

## References

- [Avanza selectedRecommendation source extraction route section plan](avanza-selected-recommendation-source-extraction-route-section-plan.md)
- [Avanza selectedRecommendation source extraction route section pre-implementation checkpoint](avanza-selected-recommendation-source-extraction-route-section-pre-implementation-checkpoint.md)
- [Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
- [Avanza hard-disabled source-to-preview integration pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-pre-implementation-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section plan](avanza-hard-disabled-source-to-preview-integration-route-section-plan.md)
- [Avanza hard-disabled source-to-preview integration route section pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md)

## Hard-Disabled Source-To-Preview Route Section Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders the hard-disabled
source-to-preview integration harness with static fixtures only. The section is
fixture/model-only and explicitly avoids Trade UI wiring, real
selectedRecommendation reads, preview enablement, app or route previewState
derivation, bridge/local fetch/polling, handoff, order behavior, credentials,
and Supabase writes.

The rendered section is checkpointed in
`docs/avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md`.
That checkpoint confirms all five integration statuses are visible and every
status keeps handoff, bridge/local fetch, polling, execution, active controls,
and unlocked gates unavailable.

The completed hard-disabled source-to-preview integration phase is checkpointed
in
`docs/avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md`.
The next recommended phase is hard-disabled Trade UI branch wiring planning,
still with no preview enablement, runtime activation, bridge calls, handoff, or
execution.
- [Avanza selectedRecommendation source map pre-implementation checkpoint](avanza-selected-recommendation-source-map-pre-implementation-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring plan](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation pre-Trade-UI wiring architecture checkpoint](avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
