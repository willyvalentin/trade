# Avanza Read-Only SelectedRecommendation Static-Fixture Adapter Invocation Plan

Date: 2026-07-03

Plan status:
`avanza_read_only_selected_recommendation_static_fixture_adapter_invocation_plan_added`

## Purpose

This plan defines a future step where the pure adapter/derived-preview wrapper
may invoke the selectedRecommendation adapter with static fixtures only.

The purpose is narrow:

- allow adapter invocation only inside pure wrapper tests/fixtures
- use static selectedRecommendation-like fixtures only
- do not read app, route, or Trade UI state
- do not call the derived-preview builder yet unless separately planned
- keep `previewState` null until derived-preview invocation is explicitly added

## Strict Phase Boundary

This task is planning only.

This task does not add:

- app code changes
- wrapper code changes
- route changes
- Trade UI changes
- adapter invocation
- derived-preview builder invocation
- real selectedRecommendation state reads
- real selectedRecommendation rendering
- real preview state derivation
- real preview state rendering
- runtime environment configuration
- production/default enablement

## Allowed Future First Implementation

A future first implementation may allow the pure wrapper to call the adapter
only with static fixture input.

Allowed behavior:

- pure wrapper may call adapter only with static selectedRecommendation-like
  fixtures
- adapter output must be summarized safely
- adapter failure must return `adapter_rejected`
- invalid fixture input may return `invalid_input`
- no derived-preview builder call yet
- `previewState` remains null
- `controlsEnabled: false`
- `gateLocked: true`

## Required Statuses

The future static-fixture adapter invocation phase should support:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_rejected`
- `adapter_normalized_static_fixture`

## Required Output

The wrapper output should include:

- `status`
- `label`
- `reason`
- `sourceMode`
- `normalizedInputSummary`, if adapter succeeds
- `previewState: null`
- `canRenderReadOnlyPreview: false`, unless a later derived-preview phase is
  explicitly implemented
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

## Forbidden Behavior

Forbidden for this plan and the future static-fixture adapter invocation phase:

- real selectedRecommendation state
- route state reads
- Trade UI state reads
- derived-preview builder call
- previewState generation
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
- production readiness claim
- execution readiness claim

## Future Test Requirements

Future tests must prove:

- static valid fixture normalizes safely
- invalid fixture returns `adapter_rejected` or `invalid_input`
- adapter failure is safe
- derived-preview builder is not called
- `previewState` remains null
- no bridge/local fetch/polling/execution strings appear
- controls disabled
- gate locked
- wrapper is not wired into route or Trade UI beyond the existing
  fixture/model-only harness
- no real selectedRecommendation state is read or rendered
- no real preview state is derived or rendered

## Current Boundary

Current state after implementation:

- `app/trade-app.tsx` was not changed
- `app/dev/avanza-visual-qa/page.tsx` was not changed by this implementation
- wrapper code now allows adapter normalization only for explicit static
  fixture input behind an explicit integration decision
- existing dev route remains fixture/model-only
- route remains unlinked from main navigation
- no real selectedRecommendation state is read or rendered
- no real preview state is derived or rendered
- adapter is called only by the pure wrapper for static fixture normalization
- derived-preview builder is not called
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## Recommended Implementation Sequence

0. Add the pre-implementation checkpoint before changing wrapper code.
1. Add static adapter invocation fixtures for valid, invalid, and adapter-failure
   cases.
2. Update the pure wrapper to call the adapter only for those static fixtures.
3. Keep `previewState` null and keep derived-preview builder calls forbidden.
4. Add tests proving adapter normalization is fixture-only and safe.
5. Keep route and Trade UI behavior unchanged except the existing
   fixture/model-only harness rendering static wrapper states.
6. Add a checkpoint before any derived-preview builder invocation plan.

## Pre-Implementation Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-pre-implementation-checkpoint.md`
is the final checkpoint before any future pure wrapper change that would call
the adapter with static fixtures. It confirms the current task is still
planning/checkpoint-only, requires `app/trade-app.tsx`, the existing dev route,
and wrapper code to remain unchanged for now, and limits the next allowed
implementation to pure wrapper code with static fixture input only.

## Implementation Result

The pure wrapper now implements the planned static-fixture adapter invocation
path. A valid static fixture behind an explicit `integration_allowed` decision
can return `adapter_normalized_static_fixture` with a safe
`normalizedInputSummary`. The wrapper still returns `previewState: null`, keeps
`canRenderReadOnlyPreview: false`, does not call the derived-preview builder,
does not read real selectedRecommendation state from app or route, and is not
wired into Trade UI beyond the existing fixture/model-only harness.

## Implementation Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md`
records the completed static-fixture adapter invocation phase. It confirms the
adapter invocation exists only inside the pure wrapper with explicit static
fixture input, `normalizedInputSummary` remains safe/minimal, `previewState`
remains null/undefined, the derived-preview builder is not called, and no real
selectedRecommendation state is read or rendered from app, route, or Trade UI.

## Static-Fixture Derived-Preview Invocation Plan

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md`
plans the next possible pure wrapper step. It keeps this phase unchanged:
adapter invocation remains static-fixture-only, `previewState` remains
null/undefined, the derived-preview builder is not called yet, app and route
code remain unchanged, and no real selectedRecommendation state is read or
rendered.

## References

- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation plan](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation pre-implementation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper plan](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md)
- [Avanza selectedRecommendation adapter safety review result checkpoint](avanza-selected-recommendation-adapter-safety-review-result-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
