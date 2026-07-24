# Avanza Read-Only SelectedRecommendation Static-Fixture Derived-Preview Invocation Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_read_only_selected_recommendation_static_fixture_derived_preview_invocation_checkpoint_added`

## Current Status

Static-fixture derived-preview invocation is now implemented inside the pure
read-only selectedRecommendation adapter/derived-preview wrapper.

This checkpoint closes the static-fixture derived-preview invocation phase
before any future route expansion, Trade UI expansion, or real
selectedRecommendation state usage.

Current boundary:

- derived-preview invocation exists only inside the pure wrapper
- derived-preview invocation uses explicit static fixture input only
- adapter normalization remains static-fixture-only
- wrapper harness remains fixture/model-only
- route remains fixture/model-only
- route remains unlinked from main navigation
- `app/trade-app.tsx` was not changed
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## Implemented Wrapper Behavior

The implementation lives in:

- `lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts`

The wrapper accepts explicit selectedRecommendation-like input and an explicit
integration decision. It does not read app state, route state, Trade UI state,
React state, runtime env, or real selectedRecommendation state from app/route.

The wrapper can now:

- reject missing input as `no_input`
- reject blocked decisions as `blocked`
- reject invalid static fixture input as `invalid_input`
- keep adapter rejection safe as `adapter_rejected`
- keep adapter-normalized output without preview state as
  `adapter_normalized_static_fixture`
- keep derived-preview failure safe as `derived_preview_failed`
- produce a read-only preview state for `read_only_preview_ready`

## Static Fixture Adapter Normalization Scope

Adapter normalization remains static-fixture-only.

The wrapper may call `adaptSelectedRecommendationToAvanzaHandoffSource(...)`
only for explicit fixture/test input after the explicit integration decision
allows normalization. It must not normalize real selectedRecommendation state
from app, route, Trade UI, or production runtime sources.

Adapter failure remains safe:

- `previewState` stays null
- `canRenderReadOnlyPreview` stays false
- controls remain disabled
- gate remains locked
- bridge, localhost, polling, and execution remain forbidden

## Static Fixture Derived-Preview Invocation Scope

Derived-preview invocation remains static-fixture-only.

The wrapper may call `buildAvanzaSelectedRecommendationPreviewState(...)` only
inside the pure wrapper after explicit static fixture adapter normalization
succeeds.

It does not call
`buildAvanzaPreviewStateFromSelectedRecommendation(...)`, does not read real
selectedRecommendation state, and does not derive preview state from app state,
route state, or Trade UI state.

Derived-preview failure remains safe:

- status becomes `derived_preview_failed`
- `previewState` stays null
- `canRenderReadOnlyPreview` stays false
- controls remain disabled
- gate remains locked
- no handoff or execution becomes available

## PreviewState Behavior

`previewState` is produced only for the `read_only_preview_ready` static
fixture output.

For every other wrapper status, `previewState` remains null and
`canRenderReadOnlyPreview` remains false.

The ready `previewState` is read-only. It keeps:

- source mode selected recommendation preview-only
- pre-activation gate locked
- controls disabled
- total-read advisory
- no bridge calls
- no localhost fetch
- no polling
- no execution
- no active handoff control

## Wrapper Fixture Behavior

Wrapper fixtures live in:

- `lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts`

The fixtures cover:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_rejected`
- `adapter_normalized_static_fixture`
- `derived_preview_failed`
- `read_only_preview_ready`

Only `read_only_preview_ready` includes a non-null read-only `previewState`.
Only `read_only_preview_ready` has `canRenderReadOnlyPreview: true`.

All wrapper fixture outputs keep:

- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

## Wrapper Harness Behavior

The wrapper harness lives in:

- `components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx`

The harness remains fixture/model-only. It renders fixture outputs and safety
copy only. It does not fetch, call a bridge, read app state, read route state,
read real selectedRecommendation state, expose active controls, or imply
execution readiness.

The isolated dev-only QA route may render the harness as fixture/model-only
content. That route section does not make the wrapper a Trade UI feature.

## No Real SelectedRecommendation State Guarantee

No real selectedRecommendation state is read from app/route.

No real selectedRecommendation state is rendered.

The wrapper invocation uses only explicit static fixture input. The dev route
does not read real selectedRecommendation state, does not read Trade UI state,
and does not derive preview state from route state.

## No Real App/Route Preview Derivation Guarantee

No real app/route preview state is derived.

No real app/route preview state is rendered.

The only preview output is the read-only `previewState` produced by the static
fixture `read_only_preview_ready` wrapper fixture.

## Trade UI Default Behavior

Trade UI remains default-safe:

- `app/trade-app.tsx` was not changed
- selectedRecommendation preview disabled by default in Trade UI
- active/default source remains static fixture
- wrapper is not wired into Trade UI beyond existing fixture/model-only harness
  visibility on the isolated dev QA route
- no real selectedRecommendation state is read by Trade UI for this wrapper
- no real preview state is rendered in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## Safety Guarantees

Safety guarantees remain:

- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no active handoff button
- no production readiness claim
- controls disabled
- gate locked
- total-read remains advisory

## What Remains Not Implemented

Still not implemented:

- real selectedRecommendation state read
- real selectedRecommendation render
- real app/route preview derivation
- real app/route preview render
- default Trade UI selectedRecommendation preview
- production/default enablement
- runtime env config
- main navigation link
- active handoff button
- execution/fill/trigger behavior
- credential/session handling
- Supabase execution write

## Recommended Next Decision

Option A: stop here and keep derived-preview invocation static-fixture only.

Option B: visual polish only on the dev-only QA route sections.

Option C: add route-section hardening/checkpoint for static previewState
visibility.

Option D: plan real selectedRecommendation read-only derivation separately.

All options must still forbid execution, fill, trigger, bridge calls, localhost
fetches, polling, active controls, credential/session handling, Supabase
execution writes, and production readiness claims.

## Route Visibility Hardening

`docs/avanza-read-only-selected-recommendation-static-previewstate-route-visibility-hardening-checkpoint.md`
now records the route-visible previewState hardening boundary. It confirms
previewState may be visible only through wrapper harness static fixture output,
only for `read_only_preview_ready`, while the route remains fixture/model-only,
unlinked from main navigation, disconnected from Trade UI, and forbidden from
reading real selectedRecommendation or deriving real app/route preview state.

## Phase Completion Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md`
marks the static-fixture derived-preview phase complete. It confirms the
wrapper, fixtures, harness, route-visible static previewState, and safety
boundaries are complete and safe to pause before any future real
selectedRecommendation read-only input planning.

`docs/avanza-real-selected-recommendation-read-only-input-plan.md` now defines
that future planning-only input phase. It does not implement real input
reading, does not change app or route code, does not derive real preview state,
and keeps selectedRecommendation preview disabled by default in Trade UI.

## References

- [Avanza real selectedRecommendation read-only input plan](avanza-real-selected-recommendation-read-only-input-plan.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview phase completion checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation static previewState route visibility hardening checkpoint](avanza-read-only-selected-recommendation-static-previewstate-route-visibility-hardening-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation pre-implementation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation plan](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper plan](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper route section checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
