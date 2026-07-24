# Avanza Read-Only SelectedRecommendation Static-Fixture Derived-Preview Invocation Plan

Date: 2026-07-04

Plan status:
`avanza_read_only_selected_recommendation_static_fixture_derived_preview_invocation_plan_added`

## Purpose

This plan defines a future pure-wrapper step where the derived-preview builder
may be invoked with static fixtures only, after adapter normalization has
succeeded.

The purpose is narrow:

- allow derived-preview builder invocation only inside pure wrapper
  tests/fixtures
- use static selectedRecommendation-like fixtures only
- use adapter-normalized output only
- do not read app, route, or Trade UI state
- produce read-only `previewState` only
- keep controls disabled
- keep the pre-activation gate locked

## Implementation Update

The planned static-fixture derived-preview invocation has now been implemented
inside the pure wrapper only.

Current implemented behavior:

- `app/trade-app.tsx` remains unchanged
- the existing dev route remains fixture/model-only
- no route or Trade UI state is read
- no real selectedRecommendation state is read
- adapter normalization remains static-fixture-only
- the derived-preview builder is called only after successful static fixture
  adapter normalization
- `derived_preview_failed` keeps failures safe
- `read_only_preview_ready` is the only state that may include `previewState`
- `canRenderReadOnlyPreview: true` appears only for `read_only_preview_ready`
- controls remain disabled
- the pre-activation gate remains locked

This implementation does not add real selectedRecommendation wiring, route
state reads, Trade UI wiring, execution readiness, or production readiness.

## Strict Phase Boundary

This task originally defined the plan before implementation. The implementation
has now been completed under the same strict boundary.

This task does not add:

- app code changes
- wrapper code changes outside the pure wrapper
- route changes
- Trade UI changes
- derived-preview builder invocation outside the pure wrapper/static fixture
  path
- real selectedRecommendation state reads
- real preview state derivation
- real preview state rendering
- runtime environment configuration
- production/default enablement

The current wrapper behavior remains bounded: adapter and derived-preview
invocation are limited to explicit static fixture input, `previewState` appears
only for `read_only_preview_ready`, and all non-ready states keep
`previewState` null/undefined.

## Implemented Static-Fixture Invocation

The pure wrapper may call the derived-preview builder only after static fixture
adapter normalization.

Implemented behavior:

- pure wrapper may call derived-preview builder only after
  `adapter_normalized_static_fixture`
- derived-preview input must come from static fixture adapter-normalized output
- derived-preview output must be read-only
- derived-preview failure returns `derived_preview_failed`
- valid static fixture returns `read_only_preview_ready`
- no route wiring
- no Trade UI wiring
- no real selectedRecommendation state read
- no real selectedRecommendation render
- no active controls
- no execution readiness

## Required Statuses

The future static-fixture derived-preview invocation phase should support:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_rejected`
- `adapter_normalized_static_fixture`
- `derived_preview_failed`
- `read_only_preview_ready`

## Required Output

The future wrapper output should include:

- `status`
- `label`
- `reason`
- `sourceMode`
- `normalizedInputSummary`, if adapter succeeds
- `previewState`, only for `read_only_preview_ready`
- `canRenderReadOnlyPreview: true`, only for `read_only_preview_ready`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

Any future `previewState` must remain read-only and must not imply handoff,
execution, fill, review, submit, order, or production readiness.

## Forbidden Behavior

Forbidden for this plan and the future static-fixture derived-preview
invocation phase:

- real selectedRecommendation state
- route state reads
- Trade UI state reads
- route wiring
- Trade UI wiring
- bridge calls
- localhost fetch
- polling
- execution
- trigger phrase
- fill/click/review/final/submit/order
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production/default enablement
- production readiness claim
- execution readiness claim

## Test Requirements

Tests must prove:

- static valid fixture normalizes and produces read-only `previewState`
- invalid fixture returns `invalid_input` or `adapter_rejected`
- adapter failure is safe
- derived-preview failure is safe
- controls remain disabled
- pre-activation gate remains locked
- no bridge/local fetch/polling/execution strings appear
- no active handoff button exists
- wrapper is not wired into route or Trade UI beyond the existing
  fixture/model-only harness
- `app/trade-app.tsx` remains unchanged
- no real selectedRecommendation state is read or rendered
- no real preview state is derived or rendered

## Completed Implementation Sequence

1. Added a pre-implementation checkpoint before changing wrapper code.
2. Updated the pure wrapper to call the derived-preview builder only for static
   fixture normalized input.
3. Updated wrapper fixtures for `derived_preview_failed` and
   `read_only_preview_ready`.
4. Updated the wrapper harness to show previewState presence safely.
5. Added tests proving read-only previewState remains static-fixture-only.
6. Kept route and Trade UI behavior fixture/model-only and default-safe.

## Current Safety Boundary

Current behavior remains:

- `app/trade-app.tsx` unchanged
- `app/dev/avanza-visual-qa/page.tsx` remains fixture/model-only; only static
  route copy may mention the wrapper output state
- wrapper code changed only inside the pure wrapper
- derived-preview builder called only for explicit static fixture output
- `previewState` appears only for `read_only_preview_ready`
- existing dev route fixture/model-only
- route unlinked from main navigation
- no real selectedRecommendation state read or rendered from app/route
- no real preview state derived or rendered
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read advisory
- no bridge, localhost, polling, runner/fill, trigger, order, credential/session,
  or Supabase execution path

## Pre-Implementation Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md`
is the final checkpoint before any future pure wrapper code change that would
call the derived-preview builder with static fixtures. It keeps
`app/trade-app.tsx`, the existing dev route, and wrapper code unchanged for now,
requires adapter normalization to remain static-fixture-only, and limits the
next allowed implementation to pure wrapper code with static fixture input and
explicit integration decisions only.

## Completion Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md`
now records the completed implementation. The checkpoint confirms the
derived-preview builder is invoked only inside the pure wrapper with explicit
static fixture input, `previewState` is read-only and appears only for
`read_only_preview_ready`, no real selectedRecommendation state is read or
rendered from app/route, no real app/route preview state is derived or
rendered, Trade UI remains default static fixture behavior, controls remain
disabled, and the pre-activation gate remains locked.

The route-visible static previewState boundary is hardened by
`docs/avanza-read-only-selected-recommendation-static-previewstate-route-visibility-hardening-checkpoint.md`.
It confirms route-visible previewState remains wrapper harness static fixture
output only, never real app/route preview state.

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md`
now closes this phase as complete and safe to pause before planning any real
selectedRecommendation read-only input.

## References

- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation pre-implementation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static previewState route visibility hardening checkpoint](avanza-read-only-selected-recommendation-static-previewstate-route-visibility-hardening-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview phase completion checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation plan](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper plan](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
