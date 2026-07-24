# Avanza Read-Only SelectedRecommendation Adapter/Derived-Preview Wrapper Plan

Date: 2026-07-03

Plan status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_wrapper_plan_added`

## Purpose

This plan defines a future pure wrapper for read-only selectedRecommendation dev
preview. The wrapper would safely combine adapter normalization and
derived-preview creation for explicit selectedRecommendation-like input.

The intended output is read-only preview output only. Controls must remain
disabled, the pre-activation gate must remain locked, and all execution,
bridge, localhost, polling, and live Avanza paths must remain forbidden.

## Strict Phase Boundary

This task is planning only.

This task does not add:

- app code changes
- adapter invocation
- derived-preview builder invocation
- route changes
- Trade UI changes
- real selectedRecommendation state reads
- real selectedRecommendation rendering
- real preview state derivation
- real preview state rendering
- runtime environment configuration
- production/default enablement

## Required Wrapper Contract

A future wrapper must require:

- explicit selectedRecommendation-like input only
- explicit integration decision input
- no app state reads
- no route state reads
- no `process.env` reads
- no fetch, network, bridge, or localhost access
- no polling
- no Supabase writes
- read-only output only
- `controlsEnabled: false`
- `gateLocked: true`

The wrapper must not infer production readiness or execution readiness from a
successful preview result.

## Required Wrapper Statuses

The future wrapper should expose these statuses:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

## Required Output Shape

The future wrapper output should include:

- `status`
- `label`
- `reason`
- `sourceMode`
- `normalizedInputSummary`, only if preview-safe
- `previewState`, only if ready
- `canRenderReadOnlyPreview`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

## Allowed Future First Implementation

The first implementation may add:

- a pure wrapper module only
- static fixtures only
- no route wiring
- no Trade UI wiring
- no real selectedRecommendation read
- no live Avanza behavior

The first implementation should remain isolated and testable without app state,
route state, browser storage, runtime env, network, or Supabase.

## Forbidden Behavior

Forbidden for this plan and any first wrapper implementation:

- production/default enablement
- Trade UI enablement by default
- main navigation link
- active handoff button
- bridge calls
- localhost fetch
- polling
- trigger phrase
- fill/click/review/final/submit/order
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness claim
- execution readiness claim

## Future Wrapper Test Requirements

Future wrapper tests must prove:

- no input returns `no_input`
- blocked decision returns `blocked`
- invalid input returns `invalid_input`
- adapter rejection is safe
- derived-preview failure is safe
- valid static fixture returns `read_only_preview_ready`
- controls remain disabled
- gate remains locked
- no bridge/local fetch/polling/execution strings appear
- no active handoff button exists
- no route imports
- no Trade UI imports
- no runtime env reads
- no credential/session/BankID/cookies/storage handling
- no Supabase execution writes

## Recommended Implementation Sequence

1. Add pure wrapper model with static fixtures only.
2. Add wrapper fixtures for `no_input`, `invalid_input`, `adapter_rejected`,
   `derived_preview_failed`, and `read_only_preview_ready`.
3. Add isolated wrapper harness.
4. Add checkpoint.
5. Render the wrapper harness on the isolated dev-only visual QA route as a
   fixture/model-only section.

No step should enable execution, fill, trigger, bridge calls, localhost fetches,
polling, active controls, Supabase execution writes, or production readiness
claims.

## Current Boundary

Current boundary remains:

- existing dev route remains fixture/model-only
- route remains unlinked from main navigation
- `app/trade-app.tsx` was not changed
- adapter and derived-preview builder are called only by the pure wrapper for
  explicit static fixtures
- no real selectedRecommendation state is read or rendered from app/route
- no real app or route preview state is derived or rendered
- selectedRecommendation preview remains disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## Phase Completion

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-phase-completion-checkpoint.md`
closes the current adapter/derived-preview integration phase as a
plan/decision/static-audit/wrapper-plan phase before any future pure wrapper
implementation. It confirms no adapter call, no derived-preview builder call,
no real selectedRecommendation read, no real preview derivation, no route or
Trade UI behavior change, disabled controls, and locked gate.

## Pre-Implementation Checkpoint

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-pre-implementation-checkpoint.md`
is the final checkpoint before creating a future pure wrapper. It allows only a
pure wrapper module with static fixtures, explicit input, and explicit
integration decision input. It keeps route wiring, Trade UI wiring, real
selectedRecommendation reads, real preview rendering, live Avanza behavior,
active controls, and execution/fill/trigger behavior out of scope.

## Wrapper Skeleton Status

`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts`
adds the first pure wrapper implementation. The wrapper accepts explicit
selectedRecommendation-like input and an explicit integration decision, returns
the planned safe statuses and safety flags, and keeps `previewState` limited to
`read_only_preview_ready`.

The wrapper may call the adapter and derived-preview builder only for explicit
static fixtures. It does not read app or route state and is not wired into Trade
UI.

## Wrapper Fixture Status

`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts`
adds static fixture states for the wrapper skeleton: `no_input`, `blocked`,
`invalid_input`, `adapter_rejected`, `adapter_normalized_static_fixture`,
`derived_preview_failed`, and `read_only_preview_ready`.

The normalized fixture returns `adapter_normalized_static_fixture` with a safe
summary. The ready fixture returns `read_only_preview_ready` with read-only
static fixture preview output. The fixtures are not wired into Trade UI.
`previewState` appears only for `read_only_preview_ready`.

## Wrapper Harness Status

`components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx`
adds an isolated prop-driven harness for the wrapper fixtures. It renders
fixture labels, wrapper status, source mode, preview-state presence or absence,
normalized-input summary when present, and the hard safety flags.

The harness is not wired into Trade UI. It is rendered on the isolated dev-only
visual QA route as fixture/model-only content. It does not fetch, call the
bridge, read app state, read real selectedRecommendation state, directly call
the adapter, directly call the derived-preview builder, derive real app or
route preview state, or enable controls.

## Wrapper Checkpoint

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md`
summarizes the completed wrapper skeleton, fixtures, and isolated harness route
section phase. It now also records the static-fixture adapter/derived-preview
invocation result: `previewState` appears only for `read_only_preview_ready`,
the harness is not rendered in Trade UI, the route section is fixture/model-only,
and adapter/derived-preview invocation remains pure/static-fixture-only.

## Wrapper Route Section Checkpoint

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md`
records the isolated dev-only visual QA route section that renders the wrapper
harness. It confirms the route section is fixture/model-only, the route remains
unlinked from main navigation, `app/trade-app.tsx` was not changed, no real
selectedRecommendation state is read or rendered, `previewState` appears only
for `read_only_preview_ready`, no real app or route preview state is derived or
rendered, and adapter/derived-preview builder calls remain limited to pure
static wrapper fixtures.

## Wrapper Phase Completion Checkpoint

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md`
closes the pure wrapper skeleton/fixtures/harness/route-section phase. It
confirms the route section remains fixture/model-only, the route remains
unlinked from main navigation, `app/trade-app.tsx` was not changed, the wrapper
harness is not rendered in Trade UI, no real selectedRecommendation state is
read or rendered, adapter/derived-preview invocation is static-fixture-only,
`previewState` appears only for `read_only_preview_ready`, and no real app or
route preview state is derived or rendered.

## Static-Fixture Adapter Invocation Plan

`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-plan.md`
plans the next possible wrapper step. It allows a future pure wrapper
implementation to call the adapter only with static selectedRecommendation-like
fixtures. It keeps app code, route code, Trade UI code, real
selectedRecommendation reads, derived-preview builder calls, and previewState
generation out of scope.

This step is now implemented inside the pure wrapper only. Valid static
fixture input behind an explicit allowed integration decision can return
`adapter_normalized_static_fixture`; derived-preview invocation is handled by a
separate static-fixture-only step.

## Static-Fixture Adapter Invocation Pre-Implementation Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-pre-implementation-checkpoint.md`
is the final checkpoint before any future pure wrapper code change for
static-fixture adapter invocation. It keeps the existing dev route,
`app/trade-app.tsx`, and current wrapper code unchanged in this checkpoint
phase and defines the next allowed implementation as pure wrapper/static-fixture
adapter invocation only, with no derived-preview builder call and
`previewState` remaining null.

## Static-Fixture Adapter Invocation Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md`
records the completed static-fixture adapter invocation inside the pure wrapper.
The wrapper can produce `adapter_normalized_static_fixture` and a safe
`normalizedInputSummary` from explicit static fixture input only. The later
derived-preview invocation step keeps `previewState` limited to
`read_only_preview_ready`; no real selectedRecommendation state is read or
rendered, the route remains fixture/model-only, and Trade UI remains
default-disabled.

## Static-Fixture Derived-Preview Invocation Plan

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md`
plans a future pure wrapper step where the derived-preview builder may be called
only after static fixture adapter normalization. This has now been implemented
inside the pure wrapper only: no route code, app code, or Trade UI behavior is
changed, and no real selectedRecommendation state or real app/route preview
state is read, derived, or rendered.

## Static-Fixture Derived-Preview Pre-Implementation Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md`
locks the boundary before implementation. It allows only a future pure
wrapper/static-fixture change, keeps `app/trade-app.tsx` unchanged, requires
explicit integration decisions, and keeps all controls disabled and the gate
locked. That boundary has now been followed for the static-fixture-only
derived-preview implementation.

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md`
records the completed static-fixture derived-preview invocation phase. It
confirms `previewState` appears only for `read_only_preview_ready`, remains
read-only, and is not derived from app state, route state, Trade UI state, or
real selectedRecommendation state.

## References

- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation pre-implementation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation plan](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation pre-implementation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation plan](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper route section checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper pre-implementation checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation adapter safety review result checkpoint](avanza-selected-recommendation-adapter-safety-review-result-checkpoint.md)
- [Avanza selectedRecommendation adapter safety static audit checkpoint](avanza-selected-recommendation-adapter-safety-static-audit-checkpoint.md)
- [Avanza selectedRecommendation adapter safety review plan](avanza-selected-recommendation-adapter-safety-review-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration plan](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration decision phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
