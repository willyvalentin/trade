# Avanza Read-Only SelectedRecommendation Static PreviewState Route Visibility Hardening Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_read_only_selected_recommendation_static_previewstate_route_visibility_hardening_checkpoint_added`

## Current Status

The isolated dev-only visual QA route may show wrapper fixture output that
includes read-only `previewState` for exactly one static fixture state:
`read_only_preview_ready`.

This checkpoint hardens that route-visible `previewState` behavior as
static-fixture-only. It does not authorize real selectedRecommendation reads,
real app/route preview derivation, Trade UI rendering, active controls, or
execution.

Current boundary:

- previewState may be visible only through wrapper harness static fixture output
- previewState is produced only for `read_only_preview_ready` static fixture
- route section remains fixture/model-only
- route remains unlinked from main navigation
- `app/trade-app.tsx` was not changed
- wrapper harness is not rendered in Trade UI
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## Route-Visible PreviewState Scope

Route-visible previewState is limited to the isolated dev-only visual QA route
section that renders:

- `components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx`

That harness displays static fixture outputs only. It may show that the
`read_only_preview_ready` fixture contains a read-only `previewState`, but it
does not make the route a real selectedRecommendation preview surface.

The route section must continue to say:

- wrapper fixture only
- static fixture output only
- no real selectedRecommendation state is read from app/route
- no real selectedRecommendation state is rendered
- no real app/route preview state is derived
- no real app/route preview state is rendered
- no bridge calls
- no localhost fetch
- no polling
- no execution
- controls disabled
- gate locked

## Static Fixture Guarantee

Static fixture behavior is constrained to wrapper fixture outputs:

- `read_only_preview_ready` is the only fixture with non-null `previewState`
- `read_only_preview_ready` is the only fixture with
  `canRenderReadOnlyPreview: true`
- every other wrapper status keeps `previewState` null
- every other wrapper status keeps `canRenderReadOnlyPreview: false`

This includes:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_rejected`
- `adapter_normalized_static_fixture`
- `derived_preview_failed`

## No Real SelectedRecommendation State Guarantee

No real selectedRecommendation state is read from app/route.

No real selectedRecommendation state is rendered.

The route must not read `app/trade-app.tsx` state, route state, runtime env, or
any production selectedRecommendation source for this previewState display.

## No Real App/Route Preview Derivation Guarantee

No real app/route preview state is derived.

No real app/route preview state is rendered.

The route-visible `previewState` is fixture output only. It is produced by the
pure wrapper fixtures and not by route state, app state, Trade UI state, or real
selectedRecommendation state.

## Trade UI Default Behavior

Trade UI remains default-safe:

- `app/trade-app.tsx` was not changed
- wrapper harness is not rendered in Trade UI
- selectedRecommendation preview disabled by default in Trade UI
- default Trade UI preview remains static fixture behavior
- no real selectedRecommendation state is read for Avanza preview in Trade UI
- no route-visible fixture previewState is rendered in Trade UI
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
- route link from main navigation
- runtime env config
- visible toggle
- active handoff button
- execution/fill/trigger behavior
- credential/session handling
- Supabase execution write

## Recommended Next Decision

Option A: stop here and keep route-visible previewState static-fixture-only.

Option B: visual polish only on the dev-only QA route sections.

Option C: add a route-section hardening/checkpoint for any future copy or
layout change, still fixture-only.

Option D: plan real selectedRecommendation read-only derivation separately.

All options must still forbid execution, fill, trigger, bridge calls, localhost
fetches, polling, active controls, credential/session handling, Supabase
execution writes, and production readiness claims.

## Phase Completion Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md`
now closes the static-fixture derived-preview phase. It confirms the phase is
complete and safe to pause before any future real selectedRecommendation
read-only input planning.

## References

- [Avanza read-only selectedRecommendation static-fixture derived-preview phase completion checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation plan](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper route section checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
