# Avanza Real SelectedRecommendation Read-Only Derivation Pre-Implementation Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_real_selected_recommendation_read_only_derivation_pre_implementation_checkpoint_added`

## Current Status

The real selectedRecommendation read-only derivation phase is planned but not
implemented.

Current state:

- real selectedRecommendation read-only derivation plan exists
- real selectedRecommendation read-only input guard exists
- real selectedRecommendation read-only input validation model exists
- static-fixture derived-preview phase is complete
- pure adapter/derived-preview wrapper exists for static fixtures
- validation is not wired into Trade UI
- validation is not wired into the dev route
- no real selectedRecommendation state is read or rendered from app/route
- no real app/route preview state is derived or rendered
- selectedRecommendation preview remains disabled by default in Trade UI
- controls remain disabled
- pre-activation gate remains locked

## Preconditions Met

Preconditions for a future pure derivation helper are met:

- `lib/avanza-real-selected-recommendation-read-only-input-guard.ts` exists
- `lib/avanza-real-selected-recommendation-read-only-input-validation.ts`
  exists
- `lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts`
  exists for static-fixture wrapper behavior
- `docs/avanza-real-selected-recommendation-read-only-derivation-plan.md`
  exists
- static-fixture adapter normalization and static-fixture derived-preview
  behavior are already modeled separately

These preconditions do not authorize app wiring, route wiring, execution, or
implicit selectedRecommendation state reads.

## Allowed Next Implementation Scope

The next implementation may add a pure derivation helper only.

Allowed scope:

- helper accepts explicit selectedRecommendation-like input only
- helper accepts explicit guard decision/result
- helper uses the read-only input validation model
- helper may call adapter normalization only after `valid_read_only_input`
- helper may call derived-preview builder only after successful adapter
  normalization
- helper returns read-only model state only
- helper remains unwired from Trade UI
- helper remains unwired from the dev route

The helper must not read app state, route state, React state, `process.env`,
browser storage, Supabase, network, or Trade UI state.

## Required Derivation Helper Behavior

The future helper must:

- evaluate missing input before adapter or derived-preview work
- respect the explicit guard decision/result
- call validation before adapter normalization
- stop safely when validation is not `valid_read_only_input`
- stop safely when adapter normalization rejects the input
- call derived-preview generation only after adapter normalization succeeds
- return `previewState` only for a read-only preview-ready result
- keep controls disabled
- keep the pre-activation gate locked
- never imply handoff readiness

## Required Status Model

The future helper must support these statuses:

- `no_input`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

All non-ready statuses must remain blocked or diagnostic model states only.

## Required Output Model

The future output model must include:

- `status`
- `label`
- `reason`
- `sourceMode`
- `normalizedInputSummary` only after valid input or adapter success
- `previewState` only for `read_only_preview_ready`
- `canRenderReadOnlyPreview: true` only for `read_only_preview_ready`
- `canProceedToHandoff: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

No output may imply execution readiness or production readiness.

## Required Safety Guarantees

The future helper and tests must preserve:

- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim
- no active handoff button
- no enabled controls
- locked pre-activation gate

## Explicit Non-Goals

This checkpoint does not permit:

- app code changes
- `app/trade-app.tsx` changes
- dev route changes
- Trade UI wiring
- dev route wiring
- real selectedRecommendation state reads from app/route
- real selectedRecommendation preview rendering
- default Trade UI selectedRecommendation preview
- active handoff controls
- bridge calls
- localhost fetches
- polling
- execution/fill/trigger behavior
- credential/session handling
- Supabase execution writes

## Go/No-Go Checklist

Go only if the next implementation:

- adds a pure helper only
- accepts explicit input and explicit guard/validation context only
- does not import `app/trade-app.tsx`
- does not import `app/dev/avanza-visual-qa/page.tsx`
- does not read `process.env`
- does not fetch
- does not call Supabase
- does not use browser storage or cookies
- keeps `canProceedToHandoff: false`
- keeps bridge/local/poll/execution false
- keeps controls disabled
- keeps the gate locked
- includes tests for every required status
- includes tests proving no live endpoint strings or exact trigger phrase appear

No-go if the implementation reads app/route state, wires Trade UI, wires the
dev route, enables controls, calls bridge/local/Supabase/network behavior, or
adds any execution/fill/trigger path.

## Required Future Tests

Future implementation tests must prove:

- no input returns `no_input`
- blocked guard returns `guard_blocked`
- invalid explicit input returns `invalid_input`
- adapter rejection returns `adapter_rejected`
- derived-preview failure returns `derived_preview_failed`
- valid explicit input can return `read_only_preview_ready`
- `previewState` exists only for `read_only_preview_ready`
- `canRenderReadOnlyPreview: true` only for `read_only_preview_ready`
- all outputs forbid bridge/local fetch/polling/execution
- controls disabled
- gate locked
- helper does not import `app/trade-app.tsx`
- helper does not import `app/dev/avanza-visual-qa/page.tsx`
- helper does not read `process.env` directly
- helper does not fetch
- helper does not call Supabase
- no live endpoint strings or exact trigger phrase appear

## Recommended Next Implementation Task

Add a pure real selectedRecommendation read-only derivation helper.

That helper must remain explicit-input only, guard-approved only,
validation-approved only, and must keep all adapter/derived-preview invocation
inside pure read-only model state. It must not be wired into Trade UI or the
dev route.

## References

- [Avanza real selectedRecommendation read-only derivation plan](avanza-real-selected-recommendation-read-only-derivation-plan.md)
- [Avanza real selectedRecommendation read-only input plan](avanza-real-selected-recommendation-read-only-input-plan.md)
- [Avanza real selectedRecommendation read-only input guard route section checkpoint](avanza-real-selected-recommendation-read-only-input-guard-route-section-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview phase completion checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Implementation Follow-Up

`lib/avanza-real-selected-recommendation-read-only-derivation.ts` has now been
added as the pure helper permitted by this checkpoint.

The helper accepts only explicit selectedRecommendation-like input, an explicit
read-only input guard decision, and an optional source label. It calls
`buildAvanzaRealSelectedRecommendationReadOnlyInputValidation(...)` first,
calls `adaptSelectedRecommendationToAvanzaHandoffSource(...)` only after
`valid_read_only_input`, and calls the derived-preview helper only after
adapter normalization succeeds.

The helper returns `no_input`, `guard_blocked`, `invalid_input`,
`adapter_rejected`, `derived_preview_failed`, or
`read_only_preview_ready`. `previewState` and
`canRenderReadOnlyPreview: true` are emitted only for
`read_only_preview_ready`. All states keep `canProceedToHandoff: false`,
bridge calls false, localhost fetch false, polling false, execution false,
controls disabled, and the gate locked.

This follow-up did not change `app/trade-app.tsx`, did not change
`app/dev/avanza-visual-qa/page.tsx`, did not wire the helper into Trade UI or
the dev route, and did not read/render real selectedRecommendation state from
app or route.

## Static Fixture Follow-Up

`lib/avanza-real-selected-recommendation-read-only-derivation-fixtures.ts` now
adds reusable static fixtures for all helper statuses: `no_input`,
`guard_blocked`, `invalid_input`, `adapter_rejected`,
`derived_preview_failed`, and `read_only_preview_ready`.

The fixtures use explicit inputs and explicit guard decisions only. They are
not wired into Trade UI or the isolated dev route. `previewState` exists only
for the `read_only_preview_ready` fixture, and every fixture keeps
`canProceedToHandoff: false`, bridge/local/poll/execution false, controls
disabled, and the gate locked.

## Isolated Derivation Harness Follow-Up

`components/execution/AvanzaRealSelectedRecommendationReadOnlyDerivationHarness.tsx`
now renders the static derivation fixture states for isolated test/dev
visibility only.

The harness shows fixture id, label, status, source mode, reason, normalized
input summary presence, preview state presence, and the safety booleans for
bridge calls, localhost fetch, polling, execution, controls, and gate state.
It renders all six derivation statuses: `no_input`, `guard_blocked`,
`invalid_input`, `adapter_rejected`, `derived_preview_failed`, and
`read_only_preview_ready`.

`read_only_preview_ready` is explicitly labeled read-only/model-only, not
active. `previewState` remains limited to that explicit fixture result. The
harness is not imported by `app/trade-app.tsx`, is not imported by
`app/dev/avanza-visual-qa/page.tsx`, and does not read or render real
selectedRecommendation state from app or route.

## Route Section Plan Follow-Up

`docs/avanza-real-selected-recommendation-read-only-derivation-route-section-plan.md`
now defines the future route-visible fixture/model-only section for the
derivation harness.

The plan permits only a later explicit update to the isolated dev QA route,
using static derivation fixtures only. This checkpoint remains unchanged for
app code: `app/trade-app.tsx` and `app/dev/avanza-visual-qa/page.tsx` are not
changed by the plan, and the harness remains unwired from both Trade UI and
the dev route.

## Route Section Pre-Implementation Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-derivation-route-section-pre-implementation-checkpoint.md`
now permits the next task to render the isolated derivation harness on the
dev-only visual QA route as fixture/model-only content.

That permission is narrow: only static derivation fixtures may be rendered,
the route must remain unlinked, `app/trade-app.tsx` must remain unchanged, and
real selectedRecommendation state plus app/route preview derivation remain
forbidden.

## Route Section Implementation Follow-Up

The isolated dev QA route now renders
`AvanzaRealSelectedRecommendationReadOnlyDerivationHarness` with
`avanzaRealSelectedRecommendationReadOnlyDerivationFixtures`.

This does not change Trade UI and does not broaden the helper scope. The route
section is fixture/model-only, uses explicit static fixtures only, keeps real
selectedRecommendation unread from app/route, keeps app/route preview state
underived, and preserves disabled controls, locked gate, and no execution.

## Route Section Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-derivation-route-section-checkpoint.md`
now captures the completed route section for the derivation harness.

The completed section remains limited to static fixtures on the isolated dev
QA route. It is not a Trade UI integration and does not read real
selectedRecommendation state from app/route.

## Phase Completion Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md`
now marks the real selectedRecommendation read-only derivation phase complete
for pure helper, fixtures, harness, and route-visible fixture/model-only
display.

The completion checkpoint does not authorize Trade UI wiring, real app/route
state reads, bridge/fetch/polling behavior, or execution.
