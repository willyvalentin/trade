# Avanza Read-Only SelectedRecommendation Adapter/Derived-Preview Wrapper Route Section Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_wrapper_route_section_checkpoint_added`

## Current Status

The pure adapter/derived-preview wrapper harness is now rendered on `app/dev/avanza-visual-qa/page.tsx` as a fixture/model-only route section.

The route section is fixture/model-only.

The route remains unlinked from main navigation.

The route remains isolated from Trade UI, unlinked from main navigation, and
safe to use only for static visual QA of wrapper fixture states.

## Route Section Behavior

The route section is labeled as the adapter/derived-preview wrapper surface and
renders:

- `components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx`
- static wrapper fixtures from
  `lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts`

The section remains wrapper fixture only. Static fixture outputs may now be
normalized by the pure wrapper adapter path and passed through the pure
derived-preview path only. No real selectedRecommendation state is read from app
or route, no real selectedRecommendation state is rendered, no real app or route
preview state is derived, no real preview state is rendered in Trade UI,
`previewState` appears only for `read_only_preview_ready` fixture output, no
bridge calls, no localhost fetch, no polling, no execution, controls disabled,
and gate locked.

## Wrapper Harness Behavior

The wrapper harness renders fixture labels, wrapper status, source mode,
preview-state presence or absence, normalized input summary when present, and
hard safety flags.

The harness does not fetch, call bridge, read app state, read real
selectedRecommendation state, directly call the derived-preview builder, derive
real app or route preview state, render real preview state in Trade UI, enable
controls, or expose an active handoff button. Adapter normalization and
derived-preview output are limited to pure wrapper fixture results.

## Fixture/Model-Only Guarantee

The route section uses fixture/model-only data. The wrapper fixtures remain
static and `previewState` appears only for `read_only_preview_ready` fixture
output.

Adapter-normalized and derived-preview fixture output remains static and does
not represent real selectedRecommendation state or real app/route preview
derivation.

## No Real SelectedRecommendation State Guarantee

No real selectedRecommendation state is read. No real selectedRecommendation
state is rendered. The route does not import `app/trade-app.tsx` and does not
read Trade UI state.

No real selectedRecommendation state is rendered.

## Adapter/Derived-Preview Invocation Guarantee

The wrapper may call the adapter and derived-preview builder only for explicit
static fixtures. The route section and wrapper harness do not read real
selectedRecommendation state and do not invoke derived-preview creation
directly.

## No Real Preview Derivation Guarantee

No real app or route preview state is derived. No real preview state is rendered
in Trade UI. `previewState` appears only for `read_only_preview_ready`, and
read-only-ready behavior remains static fixture-only.

No real app or route preview state is derived. No real preview state is
rendered in Trade UI.

## Trade UI Default Behavior

Trade UI remains default-safe:

- `app/trade-app.tsx` was not changed
- wrapper harness is not rendered in Trade UI
- selectedRecommendation preview disabled by default in Trade UI
- `explicitPreviewOnlyFlag` false by default
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
- real selectedRecommendation read
- real selectedRecommendation render
- real selectedRecommendation adapter invocation outside static wrapper fixtures
- derived-preview builder invocation outside static wrapper fixtures
- real preview derivation
- real preview render
- active handoff button
- execution/fill/trigger path
- Supabase execution records

## Recommended Next Decision

Option A: stop here and keep wrapper harness as fixture/model-only route section.

Option B: add visual polish to fixture/model-only route sections only.

Option C: static-fixture adapter invocation behind pure wrapper fixtures has
now been implemented.

Option D: postpone actual invocation until broader architecture checkpoint.

All options must still forbid execution, fill, trigger, bridge calls, localhost
fetches, polling, active controls, credential/session handling, Supabase
execution writes, and production readiness claims.

The implementation checkpoint is
`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md`.
It confirms the route section remains fixture/model-only, no real
selectedRecommendation state is read from app or route, and the wrapper harness
still exposes only fixture states.

The static-fixture derived-preview invocation is recorded by
`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md`
and
`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md`.
It keeps derived-preview invocation pure/static-fixture-only, limits
`previewState` to `read_only_preview_ready`, keeps controls disabled, and keeps
the gate locked.

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md`
now records the completed static-fixture derived-preview invocation phase. The
route section remains fixture/model-only and merely displays fixture output; it
does not read real selectedRecommendation state, derive real app/route preview
state, render real preview state in Trade UI, expose active controls, or enable
execution.

## Static Fixture PreviewState Visibility

The route section may show that `previewState` appears only for the
`read_only_preview_ready` wrapper fixture. That visibility remains
fixture/model-only and does not make the route a real selectedRecommendation
preview surface.

## Route Visibility Hardening Checkpoint

`docs/avanza-read-only-selected-recommendation-static-previewstate-route-visibility-hardening-checkpoint.md`
hardens this route-visible previewState boundary. It confirms the route section
continues to be fixture/model-only, the route remains unlinked from main
navigation, `app/trade-app.tsx` was not changed, wrapper harness is not rendered
in Trade UI, no real selectedRecommendation state is read or rendered, and no
real app/route preview state is derived or rendered.

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md`
now marks the static-fixture derived-preview phase complete and safe to pause
before any real selectedRecommendation read-only input planning.

## References

- [Avanza read-only selectedRecommendation static-fixture adapter invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static previewState route visibility hardening checkpoint](avanza-read-only-selected-recommendation-static-previewstate-route-visibility-hardening-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview phase completion checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation plan](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper plan](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper pre-implementation checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-phase-completion-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
