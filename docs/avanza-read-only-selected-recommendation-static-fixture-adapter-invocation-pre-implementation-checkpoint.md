# Avanza Read-Only SelectedRecommendation Static-Fixture Adapter Invocation Pre-Implementation Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_read_only_selected_recommendation_static_fixture_adapter_invocation_pre_implementation_checkpoint_added`

## Current Status

The static-fixture adapter invocation checkpoint has now been followed by a
pure wrapper implementation.

The current wrapper remains pure and accepts only explicit input plus an
explicit integration decision. The wrapper may now call the
selectedRecommendation adapter only for explicit static fixture normalization.
The wrapper does not call the derived-preview builder. `previewState` remains
null/undefined.

The existing dev-only visual QA route remains fixture/model-only and unlinked
from main navigation. Trade UI remains unchanged and selectedRecommendation
preview remains disabled by default.

## Preconditions Met

Preconditions already in place:

- static-fixture adapter invocation plan exists
- wrapper phase completion checkpoint exists
- pure wrapper skeleton exists
- pure wrapper static-fixture adapter invocation now exists
- wrapper fixtures exist
- wrapper harness exists
- wrapper harness is rendered on the isolated dev-only visual QA route as
  fixture/model-only content
- route remains unlinked from main navigation
- `app/trade-app.tsx` remains unchanged for this phase
- no real selectedRecommendation state is read or rendered
- no real preview state is derived or rendered
- adapter invocation is limited to explicit static fixture wrapper inputs
- controls remain disabled
- pre-activation gate remains locked

## Allowed Next Implementation Scope

The next implementation, if approved, may change only pure wrapper code and
static wrapper fixtures/tests.

Allowed next implementation:

- pure wrapper code only
- static selectedRecommendation-like fixture input only
- explicit integration decision input only
- adapter may be called only inside the pure wrapper with static fixtures/tests
- no derived-preview builder call
- `previewState` remains null
- no route wiring
- no Trade UI wiring
- no real selectedRecommendation state read
- no app state read
- no route state read
- no runtime environment configuration

## Required Wrapper Behavior

After the implementation, the wrapper must remain pure and side-effect free.

Required wrapper behavior:

- accept explicit selectedRecommendation-like input only
- accept explicit integration decision input only
- call the adapter only for allowed static fixture/test paths
- never read `app/trade-app.tsx`
- never read React state
- never read route state
- never fetch
- never call bridge or localhost
- never poll
- never execute
- never call the derived-preview builder
- keep controls disabled
- keep the gate locked

## Required Fixture Behavior

Static fixtures must remain the only invocation source for the adapter in this
phase.

Required fixture behavior:

- include valid static selectedRecommendation-like fixture input
- include invalid static fixture input
- include blocked decision fixture input
- include adapter-rejection fixture coverage
- never include real selectedRecommendation state
- never depend on route state
- never depend on Trade UI state
- never depend on `.env.local` or runtime environment state

## Required Output Behavior

The implementation supports these statuses:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_rejected`
- `adapter_normalized_static_fixture`

Required safety output:

- `previewState: null`
- `canRenderReadOnlyPreview: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

Adapter-normalized output may expose only preview-safe summary fields. It must
not imply execution readiness, production readiness, or order readiness.

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
- derived-preview builder invocation
- active handoff button
- execution/fill/trigger behavior
- Supabase execution records

## Go/No-Go Checklist

Go conditions for the next implementation:

- adapter invocation is limited to pure wrapper code
- all adapter inputs are static fixtures/tests
- integration decision input is explicit
- `previewState` remains null
- derived-preview builder remains forbidden
- route and Trade UI remain unchanged
- no live endpoint, trigger, fill, order, credential/session, or Supabase paths
  are introduced

No-go conditions:

- real selectedRecommendation state is needed
- route changes are needed
- Trade UI changes are needed
- derived-preview builder is needed
- preview rendering is needed
- execution readiness is implied
- controls become enabled
- gate becomes unlocked

## Recommended Next Implementation Task

Recommended next task:

Add a post-implementation checkpoint for the static-fixture adapter invocation
phase. Keep `previewState` null, keep the derived-preview builder forbidden,
keep the existing dev route unchanged, keep `app/trade-app.tsx` unchanged, and
keep tests proving the adapter invocation is static-fixture-only and
non-executing.

## Post-Implementation Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md`
now records the completed static-fixture adapter invocation phase. It confirms
the implementation stayed inside the pure wrapper, accepts explicit static
fixture input only, keeps `previewState` null/undefined, keeps the
derived-preview builder uncalled, and adds no real selectedRecommendation state
read, route change, Trade UI wiring, or execution path.

## References

- [Avanza read-only selectedRecommendation static-fixture adapter invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation plan](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper plan](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
