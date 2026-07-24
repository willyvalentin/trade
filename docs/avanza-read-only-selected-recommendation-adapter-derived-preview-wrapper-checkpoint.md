# Avanza Read-Only SelectedRecommendation Adapter/Derived-Preview Wrapper Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_wrapper_checkpoint_added`

## Current Status

The pure adapter/derived-preview wrapper skeleton, static fixtures, and harness
route-section phase is complete before any Trade UI wiring, real
selectedRecommendation read, real app/route preview derivation, or live
adapter/derived-preview invocation.

The wrapper harness remains isolated from Trade UI. It is not rendered in `app/trade-app.tsx`; it is rendered in `app/dev/avanza-visual-qa/page.tsx` as fixture/model-only content.

## Implemented Wrapper Skeleton

Implemented:

- `lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts`

The wrapper accepts explicit selectedRecommendation-like input and an explicit
integration decision. It returns a read-only wrapper state with safe status,
source mode, optional preview-safe normalized input summary, and hard safety
flags.

Contract summary: explicit selectedRecommendation-like input and explicit integration decision only.

The wrapper now calls adapter only for explicit static fixture normalization
when the explicit integration decision allows normalization. The wrapper calls
the derived-preview builder only for explicit static fixtures after adapter
normalization succeeds. `previewState` appears only for
`read_only_preview_ready`.

## Implemented Wrapper Fixtures

Implemented:

- `lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts`

Fixture ids:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_rejected`
- `adapter_normalized_static_fixture`
- `derived_preview_failed`
- `read_only_preview_ready`

The normalized fixture returns `adapter_normalized_static_fixture` with a safe
normalized input summary. The ready fixture returns `read_only_preview_ready`
with a read-only preview state, while all non-ready fixture outputs keep
`previewState` null.

## Implemented Isolated Wrapper Harness

Implemented:

- `components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx`

The harness renders fixture labels, wrapper status, source mode, normalized
input summary when present, preview-state presence or absence, and hard safety
flags.

The harness is isolated from Trade UI. It is not rendered in
`app/trade-app.tsx`. It is rendered in `app/dev/avanza-visual-qa/page.tsx` as
fixture/model-only content. It is not wired to real selectedRecommendation
state, route state, Trade UI state, or execution.

## Current Wrapper Behavior

Current behavior:

- no input returns `no_input`
- blocked integration decision returns `blocked`
- invalid selectedRecommendation-like input returns `invalid_input`
- allowed static fixture input returns `adapter_normalized_static_fixture`
- simulated derived-preview failure returns `derived_preview_failed`
- valid static fixture derived-preview output returns `read_only_preview_ready`
- `previewState` appears only for `read_only_preview_ready`
- wrapper does not derive real app or route preview state
- wrapper does not render real preview state

## Fixture/Model-Only Guarantees

Guarantees:

- wrapper fixtures are static
- wrapper harness is fixture-only
- ready/failure states remain static fixture-only
- existing dev route remains fixture/model-only
- route remains unlinked from main navigation
- no wrapper harness is rendered in Trade UI
- wrapper harness is rendered in the dev route as fixture/model-only content

## Adapter/Derived-Preview Invocation Guarantee

Current guarantee:

- adapter is called only by the pure wrapper for static fixture normalization
- derived-preview builder is called only by the pure wrapper for explicit static
  fixture output
- adapter/derived-preview builder is not called by route or Trade UI flow
- wrapper fixtures may invoke adapter normalization only through explicit static
  fixture input
- wrapper fixtures may invoke derived-preview creation only through the pure
  wrapper and only after static fixture adapter normalization
- no wrapper harness invokes derived-preview creation directly
- dev route wrapper section invokes no real selectedRecommendation state and no
  derived-preview creation

## No Real SelectedRecommendation State Guarantee

Current guarantee:

- no real selectedRecommendation state is read from app/route
- no real selectedRecommendation state is rendered
- wrapper accepts explicit fixture/test input only
- harness renders static fixture states only
- Trade UI selectedRecommendation state remains untouched

## No Real Preview Derivation Guarantee

Current guarantee:

- no real app or route preview state is derived
- no real preview state is rendered in Trade UI
- `previewState` appears only for `read_only_preview_ready`
- read-only-ready behavior remains static fixture-only

## Trade UI Default Behavior

Trade UI remains default-safe:

- `app/trade-app.tsx` was not changed
- selectedRecommendation preview disabled by default in Trade UI
- `explicitPreviewOnlyFlag` false by default
- no wrapper harness is rendered in Trade UI
- wrapper harness route section remains fixture/model-only
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
- no execution readiness claim

## What Remains Not Implemented

Not implemented:

- Trade UI rendering of the wrapper harness
- real selectedRecommendation adapter invocation outside static wrapper fixtures
- derived-preview builder invocation outside static wrapper fixtures
- real selectedRecommendation read
- real selectedRecommendation render
- real preview derivation
- real preview render
- active handoff button
- execution/fill/trigger path
- Supabase execution records

## Recommended Next Decision

Option A: stop here and keep wrapper harness route section fixture/model-only.

Option B: add a route-section checkpoint for the fixture/model-only wrapper harness.

Option C: static-fixture adapter invocation behind pure wrapper fixtures has
now been implemented.

Option D: plan real selectedRecommendation read-only derivation separately.

All options must still forbid execution, fill, trigger, bridge calls, localhost
fetches, polling, active controls, credential/session handling, Supabase
execution writes, and production readiness claims.

Option C is now scoped by
`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-plan.md`.
The plan keeps adapter invocation limited to pure wrapper tests/fixtures with
static selectedRecommendation-like input only. It keeps derived-preview builder
calls forbidden and keeps `previewState` null until a separate future phase.

Option C is further gated by
`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-pre-implementation-checkpoint.md`.
The checkpoint records that the next implementation may touch only pure wrapper
code and static fixtures/tests, with no dev route change, no Trade UI change,
no real selectedRecommendation read, no derived-preview builder call, and
`previewState` remaining null.

Option C has now been implemented inside the pure wrapper only. The existing
dev route remains fixture/model-only, `app/trade-app.tsx` remains unchanged,
`previewState` remains null, and the derived-preview builder remains forbidden.

The implementation is recorded in
`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md`.
That checkpoint confirms adapter invocation remains explicit/static-fixture-only
inside the pure wrapper, `normalizedInputSummary` is safe/minimal, no real
preview state is derived or rendered, and no real selectedRecommendation state
is read from app, route, or Trade UI.

The next possible derived-preview step is now planned in
`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md`.
That plan has now been implemented inside the pure wrapper only: the
derived-preview builder is called only for explicit static fixtures,
`derived_preview_failed` keeps failures safe, `read_only_preview_ready` is the
only state with `previewState`, and no route or Trade UI wiring is introduced.

The pre-implementation boundary for that next step is recorded in
`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md`.
It confirms that any next implementation must be pure wrapper/static fixtures
only, with no app change, no route change, no real selectedRecommendation state,
disabled controls, and a locked gate.

The static-fixture derived-preview implementation keeps those boundaries:
`app/trade-app.tsx` remains unchanged, the existing dev route remains
fixture/model-only, the wrapper harness remains isolated, no real
selectedRecommendation state is read from app or route, no real app or route
preview state is derived, and no execution path is added.

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md`
now records that completed phase. It confirms read-only `previewState` remains
limited to static fixture output, no real selectedRecommendation state is read
or rendered from app/route, no real app/route preview state is derived or
rendered, controls remain disabled, and the pre-activation gate remains locked.

## References

- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation pre-implementation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation plan](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation pre-implementation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation plan](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper route section checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper plan](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper pre-implementation checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-phase-completion-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
