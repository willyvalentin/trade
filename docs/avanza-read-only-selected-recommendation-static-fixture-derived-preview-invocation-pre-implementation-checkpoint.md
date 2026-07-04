# Avanza Read-Only SelectedRecommendation Static-Fixture Derived-Preview Invocation Pre-Implementation Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_read_only_selected_recommendation_static_fixture_derived_preview_invocation_pre_implementation_checkpoint_added`

## Current Status

The static-fixture derived-preview invocation pre-implementation checkpoint has
now been followed. The pure wrapper implementation exists and remains bounded
to static fixtures/tests only.

Current state:

- static-fixture adapter invocation is implemented inside the pure wrapper
- adapter normalization remains static-fixture-only
- derived-preview builder is called only inside the pure wrapper with static
  fixture adapter-normalized output
- `previewState` only for `read_only_preview_ready`
- all other wrapper states keep `previewState` null/undefined
- wrapper harness remains fixture/model-only
- `app/trade-app.tsx` remains unchanged
- `app/dev/avanza-visual-qa/page.tsx` remains fixture/model-only; only static
  copy may describe the ready fixture output
- route remains fixture/model-only
- route remains unlinked from main navigation
- selectedRecommendation preview remains disabled by default in Trade UI
- controls remain disabled
- pre-activation gate remains locked
- no active execution is allowed

## Preconditions Met

Preconditions already in place:

- static-fixture derived-preview invocation plan exists
- static-fixture adapter invocation checkpoint exists
- pure wrapper exists
- wrapper fixtures exist
- wrapper harness exists
- wrapper harness is rendered on the isolated dev-only visual QA route as
  fixture/model-only content
- adapter invocation is limited to explicit static fixture input
- no real selectedRecommendation state is read or rendered
- no real preview state is derived or rendered
- no live Avanza path is present

## Implemented Scope

The implementation changed only pure wrapper code, static wrapper
fixtures/tests, harness copy, and route-local static explanatory copy.

Implemented scope:

- pure wrapper code only
- static fixture input only
- explicit integration decision only
- adapter normalization must remain static-fixture-only
- derived-preview builder is called only inside the pure wrapper with static
  fixtures/tests
- derived-preview input must come from adapter-normalized static fixture output
- no route behavior wiring
- no Trade UI wiring
- no real selectedRecommendation state read
- no live Avanza
- no runtime environment configuration

## Current Wrapper Behavior

The wrapper remains pure and side-effect free.

Current wrapper behavior:

- accept explicit selectedRecommendation-like input only
- accept explicit integration decision input only
- call adapter only for allowed static fixture/test paths
- call derived-preview builder only after static fixture adapter normalization
- never read `app/trade-app.tsx`
- never read React state
- never read route state
- never fetch
- never call bridge or localhost
- never poll
- never execute
- keep controls disabled
- keep the gate locked

## Current Fixture Behavior

Static fixtures remain the only source for adapter and derived-preview
invocation.

Current fixture behavior:

- include valid static selectedRecommendation-like fixture input
- include invalid static fixture input
- include blocked decision fixture input
- include adapter-rejection fixture coverage
- include derived-preview failure fixture coverage
- include read-only preview-ready static fixture coverage
- never include real selectedRecommendation state
- never depend on route state
- never depend on Trade UI state
- never depend on `.env.local` or runtime environment state

## Current Output Behavior

The implementation supports these statuses:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_rejected`
- `adapter_normalized_static_fixture`
- `derived_preview_failed`
- `read_only_preview_ready`

Current safety output:

- `previewState` only for `read_only_preview_ready`
- `canRenderReadOnlyPreview: true` only for `read_only_preview_ready`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

Any future `previewState` must be read-only and must not imply execution
readiness, production readiness, order readiness, fill readiness, or handoff
readiness.

## Required Safety Guarantees

Safety guarantees required before and after the next implementation:

- `app/trade-app.tsx` must remain unchanged
- `app/dev/avanza-visual-qa/page.tsx` must remain unchanged
- existing dev route remains fixture/model-only
- route remains unlinked from main navigation
- selectedRecommendation preview remains disabled by default in Trade UI
- no active handoff button
- no bridge calls
- no localhost fetch
- no polling
- no execution
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no live Avanza
- no production readiness claim
- no execution readiness claim

## Explicit Non-Goals

This checkpoint does not authorize:

- app code changes
- dev route changes
- Trade UI wiring
- main navigation link
- real selectedRecommendation state read
- real selectedRecommendation render
- real preview state derivation
- real preview state render
- active handoff button
- execution/fill/trigger behavior
- Supabase execution records
- production/default enablement

## Go/No-Go Checklist

Go conditions for the next implementation:

- implementation is limited to pure wrapper code and static fixtures/tests
- all adapter inputs are static fixtures/tests
- all derived-preview inputs are adapter-normalized static fixtures/tests
- integration decision input is explicit
- route and Trade UI remain unchanged
- controls remain disabled
- gate remains locked
- no live endpoint, trigger, fill, order, credential/session, or Supabase paths
  are introduced

No-go conditions:

- real selectedRecommendation state is needed
- route changes are needed
- Trade UI changes are needed
- app state or React state is needed
- runtime environment configuration is needed
- execution readiness is implied
- controls become enabled
- gate becomes unlocked

## Implementation Result

The recommended next task has been implemented inside the pure wrapper only.
The implementation added `derived_preview_failed` and
`read_only_preview_ready` fixture states, keeps `previewState` limited to the
ready fixture output, keeps Trade UI unchanged, keeps the existing dev route
fixture/model-only, keeps controls disabled, keeps the gate locked, and keeps
all execution paths forbidden.

## Completion Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md`
now records the completed static-fixture derived-preview invocation phase. It
confirms derived-preview invocation exists only inside the pure wrapper, uses
explicit static fixture input only, produces read-only `previewState` only for
`read_only_preview_ready`, keeps no real app/route preview derivation or
rendering, keeps Trade UI unchanged, keeps controls disabled, and keeps the
gate locked.

## References

- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation plan](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper plan](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
