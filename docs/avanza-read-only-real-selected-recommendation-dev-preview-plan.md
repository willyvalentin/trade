# Avanza Read-Only Real SelectedRecommendation Dev Preview Plan

Date: 2026-07-03

Plan status:
`avanza_read_only_real_selected_recommendation_dev_preview_planned_no_wiring`

Guard model status:
`avanza_read_only_selected_recommendation_dev_preview_guard_added`

Fixture status:
`avanza_read_only_selected_recommendation_dev_preview_fixtures_added`

Harness status:
`avanza_read_only_selected_recommendation_dev_preview_guard_harness_added`

Checkpoint status:
`avanza_read_only_selected_recommendation_dev_preview_guard_checkpoint_added`

Route harness status:
`avanza_read_only_selected_recommendation_dev_preview_guard_harness_added_to_dev_route_fixture_model_only`

Route section checkpoint status:
`avanza_read_only_selected_recommendation_dev_preview_route_section_checkpoint_added`

Derivation plan status:
`avanza_read_only_selected_recommendation_derivation_planned_no_wiring`

Derivation decision model status:
`avanza_read_only_selected_recommendation_derivation_decision_model_added`

Derivation decision fixture status:
`avanza_read_only_selected_recommendation_derivation_decision_fixtures_added`

Derivation decision harness status:
`avanza_read_only_selected_recommendation_derivation_decision_harness_added`

Derivation decision checkpoint status:
`avanza_read_only_selected_recommendation_derivation_decision_checkpoint_added`

Derivation decision route harness status:
`avanza_read_only_selected_recommendation_derivation_decision_harness_added_to_dev_route_fixture_model_only`

Derivation decision route section checkpoint status:
`avanza_read_only_selected_recommendation_derivation_decision_route_section_checkpoint_added`

Read-only dev preview phase completion checkpoint status:
`avanza_read_only_selected_recommendation_dev_preview_phase_completion_checkpoint_added`

Adapter/derived-preview integration plan status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_planned_no_wiring`

Adapter/derived-preview integration decision model status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_model_added`

Adapter/derived-preview integration decision fixture status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_fixtures_added`

Adapter/derived-preview integration decision harness status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_harness_added`

Adapter/derived-preview integration decision checkpoint status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_checkpoint_added`

Real selectedRecommendation read-only input plan status:
`avanza_real_selected_recommendation_read_only_input_plan_added`

Real selectedRecommendation read-only input guard model status:
`avanza_real_selected_recommendation_read_only_input_guard_model_added`

Real selectedRecommendation read-only input guard fixture status:
`avanza_real_selected_recommendation_read_only_input_guard_fixtures_added`

Real selectedRecommendation read-only input guard harness status:
`avanza_real_selected_recommendation_read_only_input_guard_harness_added`

Real selectedRecommendation read-only input guard route section plan status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_plan_added`

Real selectedRecommendation read-only input guard route section pre-implementation checkpoint status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_pre_implementation_checkpoint_added`

Real selectedRecommendation read-only input guard route section implementation status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_rendered_fixture_model_only`

Real selectedRecommendation read-only input guard route section checkpoint status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_checkpoint_added`

Real selectedRecommendation read-only input validation model status:
`avanza_real_selected_recommendation_read_only_input_validation_model_added`

Real selectedRecommendation read-only derivation plan status:
`avanza_real_selected_recommendation_read_only_derivation_plan_added`

Real selectedRecommendation read-only derivation pre-implementation checkpoint status:
`avanza_real_selected_recommendation_read_only_derivation_pre_implementation_checkpoint_added`

## Purpose

Plan a future dev-only/read-only phase that can safely preview Avanza handoff
state derived from a real selectedRecommendation.

This plan is not execution. It adds no bridge calls, no localhost fetches, and
no Avanza fill behavior.

Purpose:

- safely preview Avanza handoff state from a real selectedRecommendation
- keep the preview dev-only and read-only
- keep controls disabled
- keep the pre-activation gate locked
- keep total-read advisory

## Strict Phase Boundary

This is planning only.

This action does not:

- change app code
- change `app/trade-app.tsx`
- change the existing dev route
- wire real selectedRecommendation state
- render real selectedRecommendation preview
- add runtime environment config
- change `.env.local`
- enable selectedRecommendation preview by default

The existing dev visual QA route remains fixture-only.

## Allowed Future Behavior

Allowed future behavior, only after explicit dev-only guard approval:

- read selectedRecommendation for preview derivation only
- derive preview state through the existing adapter and derived-preview helper
- render read-only preview state
- show source as `read_only_selected_recommendation_dev_preview` or similar
- keep controls disabled
- keep the pre-activation gate locked
- keep total-read advisory

## Forbidden Behavior

Forbidden in this future phase:

- production/default enablement
- main Trade UI activation by default
- active handoff button
- bridge calls
- localhost fetch
- polling
- trigger phrase
- fill/click/review/final/submit/order behavior
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness claim

## Required Future Guard Layers

Future implementation must include these guard layers:

1. Dev-only route/access guard.
2. selectedRecommendation read-only preview guard.
3. Preview-state derivation guard.
4. Disabled-controls/gate-locked guard.

Every guard layer must forbid bridge calls, localhost fetches, execution, active
handoff controls, and production readiness claims.

## Read-Only Preview Guard Model

`lib/avanza-read-only-selected-recommendation-dev-preview-guard.ts` adds the
pure guard model for this future phase.

Default behavior:

- `status: hidden`
- cannot read real selectedRecommendation
- cannot derive preview state
- cannot render read-only preview
- can use fixture fallback
- cannot call bridge
- cannot fetch localhost
- cannot poll
- cannot execute
- controls disabled
- gate locked

A dev-only fixture/config may return `read_only_dev_preview_allowed` and allow
real selectedRecommendation reads for read-only preview derivation only. It
still forbids bridge calls, localhost fetches, polling, execution, enabled
controls, and unlocked gates. Production/default remains hidden or blocked.

## Read-Only Preview Guard Fixtures

`lib/avanza-read-only-selected-recommendation-dev-preview-fixtures.ts` adds
static fixture states for the guard model.

The fixtures cover:

- default hidden
- blocked production-forbidden
- `read_only_dev_preview_allowed`

The default hidden fixture cannot read real selectedRecommendation, cannot
derive preview state, cannot render read-only preview, and can use fixture
fallback. The allowed fixture may model real selectedRecommendation reads,
preview derivation, and read-only preview rendering for future dev-only
planning only.

All fixtures keep bridge calls, localhost fetches, polling, execution, enabled
controls, and unlocked gates forbidden. They are not wired into the dev route
or `app/trade-app.tsx`, and they do not read or render real
selectedRecommendation state.

## Read-Only Preview Guard Harness

`components/execution/AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness.tsx`
adds an isolated prop-driven harness for the guard fixtures.

The harness renders:

- fixture label
- guard status
- real selectedRecommendation read permission
- preview derivation permission
- read-only preview render permission
- fixture fallback permission
- bridge, localhost, polling, and execution flags
- disabled controls
- locked gate

The harness is fixture-only and passive. It is rendered in the isolated
dev-only visual QA route as a fixture/model-only section. It is not wired into
`app/trade-app.tsx`, does not read real selectedRecommendation state, does not
read Trade UI state, does not derive real preview state, does not fetch, does
not call the bridge, and does not render active controls.

## Guard/Fixtures/Harness Checkpoint

`docs/avanza-read-only-selected-recommendation-dev-preview-guard-checkpoint.md`
captures the completed guard, fixture, and harness phase. The checkpoint
records that the default guard is hidden, fixture fallback remains available,
`read_only_dev_preview_allowed` exists only as a fixture/model state, the
harness is rendered in `app/dev/avanza-visual-qa/page.tsx` as fixture/model-only
content, the harness is not rendered in `app/trade-app.tsx`, the existing dev
route remains fixture-only, and no real selectedRecommendation state is read or
rendered.

## Route Section Checkpoint

`docs/avanza-read-only-selected-recommendation-dev-preview-route-section-checkpoint.md`
summarizes the route section that renders the guard harness on the isolated
dev-only visual QA route. It records that the section is fixture/model-only,
the route remains unlinked from main navigation, `app/trade-app.tsx` was not
changed, no real selectedRecommendation state is read or rendered, no real
preview state is derived, controls remain disabled, the pre-activation gate
remains locked, and total-read remains advisory.

## Read-Only Derivation Plan

`docs/avanza-read-only-selected-recommendation-derivation-plan.md` plans the
future phase for actual read-only selectedRecommendation derivation in dev
preview. The plan requires an explicit selectedRecommendation source, adapter
normalization, the derived preview state builder, read-only presentation,
disabled controls, and a locked gate. It remains planning only: no app code,
route behavior, Trade UI behavior, real selectedRecommendation read, or real
preview derivation is added.

## Read-Only Derivation Decision Model

`lib/avanza-read-only-selected-recommendation-derivation-decision.ts` adds the
pure decision model for future read-only derivation. It can classify explicit
selectedRecommendation-like input as `no_input`, `blocked`, `invalid_input`, or
`derivation_allowed`. Even when derivation is allowed as model state, it still
forbids bridge calls, localhost fetches, polling, execution, enabled controls,
and unlocked gates. It is not wired into Trade UI or the dev route and does not
derive real preview state.

## Read-Only Derivation Decision Fixtures

`lib/avanza-read-only-selected-recommendation-derivation-decision-fixtures.ts`
adds static fixture states for the pure derivation decision model:
`no_input`, `blocked_guard`, `invalid_input`, and `derivation_allowed`. The
allowed fixture models read-only derivation capability only as fixture/model
state and still forbids bridge calls, localhost fetches, polling, execution,
enabled controls, and unlocked gates. The fixtures are not wired into Trade UI
or the dev route and do not derive real preview state.

## Read-Only Derivation Decision Harness

`components/execution/AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness.tsx`
adds an isolated harness for the derivation decision fixtures. It renders the
`no_input`, `blocked_guard`, `invalid_input`, and `derivation_allowed` model
states with source mode, read/derive/render flags, fixture fallback, disabled
controls, and locked gate state. It is rendered in the isolated dev-only visual
QA route as fixture/model-only content. It is not wired into Trade UI and does
not derive or render real preview state.

## Read-Only Derivation Decision Checkpoint

`docs/avanza-read-only-selected-recommendation-derivation-decision-checkpoint.md`
captures the decision model, fixture, and isolated harness phase before route
wiring or real derivation. It confirms that `no_input` uses fixture fallback,
blocked and invalid states block derivation/rendering, `derivation_allowed`
exists only as fixture/model state, the harness remains isolated from Trade UI
and real state, and no real selectedRecommendation state or preview state is
read, derived, or rendered.

## Read-Only Derivation Decision Route Section Checkpoint

`docs/avanza-read-only-selected-recommendation-derivation-decision-route-section-checkpoint.md`
captures the isolated dev-only visual QA route section that renders the
derivation decision harness as fixture/model-only content. It confirms that the
route remains unlinked from main navigation, `app/trade-app.tsx` was not
changed, the harness is not rendered in Trade UI, no real selectedRecommendation
state is read or rendered, no real preview state is derived or rendered,
controls remain disabled, the pre-activation gate remains locked, and
total-read remains advisory.


## Required Future Tests

Future tests must prove:

- default Trade UI remains disabled and `static_fixture`
- isolated QA route remains fixture-only until explicitly changed
- real selectedRecommendation preview is read-only only
- no bridge/local fetch/execution strings appear
- no active handoff button exists
- no main navigation link is added
- `app/trade-app.tsx` remains default-safe unless separately planned
- controls remain disabled
- pre-activation gate remains locked
- total-read remains advisory

## Recommended Implementation Sequence

Recommended sequence:

1. Add read-only selectedRecommendation dev preview guard model. Done in
   `lib/avanza-read-only-selected-recommendation-dev-preview-guard.ts`.
2. Add fixtures for allowed and blocked read-only states. Done in
   `lib/avanza-read-only-selected-recommendation-dev-preview-fixtures.ts`.
3. Add isolated component/harness. Done in
   `components/execution/AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness.tsx`.
4. Add pure derivation decision model. Done in
   `lib/avanza-read-only-selected-recommendation-derivation-decision.ts`.
5. Add fixtures for missing, invalid, and valid selectedRecommendation
   derivation cases. Done in
   `lib/avanza-read-only-selected-recommendation-derivation-decision-fixtures.ts`.
6. Add isolated derivation harness. Done in
   `components/execution/AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness.tsx`.
7. Add optional route section behind explicit dev-only read-only guard. Done as
   fixture/model-only content in `app/dev/avanza-visual-qa/page.tsx`.
8. Keep all controls disabled.
9. Add checkpoint before any broader Trade UI integration.

No step should enable execution, fill, trigger, click, review, final
confirmation, submit, or order placement.

## Current Non-Implementation

Current state remains:

- existing dev route is fixture-only
- route is not linked from main navigation
- `app/trade-app.tsx` is unchanged
- route does not use real selectedRecommendation state
- selectedRecommendation preview remains disabled by default in Trade UI
- controls remain disabled
- pre-activation gate remains locked
- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no Supabase execution write

## Phase Completion Checkpoint

`docs/avanza-read-only-selected-recommendation-dev-preview-phase-completion-checkpoint.md`
summarizes the completed guard, fixture, derivation decision, and route-visible
fixture/model phase before any real selectedRecommendation adapter or
derived-preview integration. It confirms both route sections are
fixture/model-only, the route remains unlinked from main navigation,
`app/trade-app.tsx` was not changed, no real selectedRecommendation state is
read or rendered, no real preview state is derived or rendered, controls remain
disabled, the pre-activation gate remains locked, and total-read remains
advisory.

## Adapter/Derived-Preview Integration Plan

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-plan.md`
plans the future adapter and derived-preview helper integration for explicit
selectedRecommendation-like input. It requires read-only guards, derivation
decision checks, adapter normalization, derived preview state building,
read-only presentation, disabled controls, and a locked gate. It does not
change app code, the dev route, Trade UI, or any runtime behavior.

`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision.ts`
adds the pure integration decision model for this path. It can classify explicit
input as `no_input`, `blocked`, `invalid_input`, or
`adapter_review_required` while still not invoking the selectedRecommendation
adapter, not invoking the derived-preview builder, not deriving real preview
state, and not rendering real preview state.

`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-fixtures.ts`
adds fixture states for the integration decision model, including future
model-only `integration_allowed`. The fixtures are not wired into Trade UI or
the dev route and do not call the adapter or derived-preview builder.

`components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness.tsx`
adds an isolated harness for the integration decision fixtures. The harness is
rendered in the isolated dev-only visual QA route as a fixture/model-only
section, is not wired into Trade UI, and does not call the adapter,
derived-preview builder, bridge, localhost, polling, execution, active controls,
or real selectedRecommendation state.

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-checkpoint.md`
summarizes the completed integration decision model, fixtures, and isolated
harness phase before actual adapter/derived-preview invocation. It confirms
`adapter_review_required` and `integration_allowed` remain fixture/model-only
states, the harness is rendered on the dev-only visual QA route as
fixture/model-only content, and no real preview state is derived or rendered.

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-route-section-checkpoint.md`
summarizes the isolated route section that renders the adapter/derived-preview
integration decision harness as fixture/model-only content. It confirms
`app/trade-app.tsx` was not changed, the route remains unlinked from main
navigation, no real selectedRecommendation state is read or rendered, the
adapter and derived-preview builder are not called, and no real preview state
is derived or rendered.

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md`
closes the adapter/derived-preview integration decision route-visible
fixture/model phase. It confirms the model, fixtures, harness, and route
section are complete before any future adapter safety review or actual
adapter/derived-preview invocation.

`docs/avanza-selected-recommendation-adapter-safety-review-plan.md` plans the
adapter safety review required before any actual selectedRecommendation adapter
or derived-preview builder invocation. It keeps the phase planning-only and
continues to forbid real selectedRecommendation reads, real preview derivation,
bridge calls, localhost fetches, polling, execution, active controls, and
production readiness claims.

`docs/avanza-selected-recommendation-adapter-safety-static-audit-checkpoint.md`
records the first static audit coverage for the adapter safety review targets.
It confirms the candidate adapter and derived-preview helper files are scanned
for forbidden live behavior patterns and that no route or Trade UI behavior is
changed by the audit phase.

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-phase-completion-checkpoint.md`
closes the adapter/derived-preview integration phase as
planning/decision/static-audit/wrapper-plan complete. It confirms the dev route
remains fixture/model-only, Trade UI remains default-safe, no real
selectedRecommendation state is read or rendered, and no adapter or
derived-preview builder is called.

`docs/avanza-real-selected-recommendation-read-only-input-plan.md` plans the
next possible input-only phase after the static-fixture derived-preview phase.
It defines how a future explicit dev/read-only selectedRecommendation-like
input may be classified as `no_input`, `blocked`, `invalid_input`, or valid
before any later read-only derivation model. It remains planning-only and does
not change app code, the dev route, Trade UI, or runtime behavior.

`lib/avanza-real-selected-recommendation-read-only-input-guard.ts` implements
the first pure model for that input boundary. The default decision is
`hidden` with `sourceMode: fixture_only`, cannot read real selectedRecommendation,
cannot validate input, cannot proceed to read-only derivation, and can use
fixture fallback. An explicit dev/read-only decision may return
`read_only_input_allowed` and
`sourceMode: real_selected_recommendation_read_only`, but still forbids bridge
calls, localhost fetches, polling, execution, enabled controls, and unlocked
gates.

The guard is not wired into Trade UI or the isolated dev QA route, does not read
real selectedRecommendation state, does not call any adapter, and does not call
any derived-preview builder.

`lib/avanza-real-selected-recommendation-read-only-input-guard-fixtures.ts`
adds static guard fixtures for hidden default, blocked production-forbidden,
and read-only input allowed states. These fixtures expose guard config and
decision output for tests and later harness work only. They remain unwired from
Trade UI and the dev route, do not read real selectedRecommendation state, and
do not derive or render real preview state.

`components/execution/AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness.tsx`
adds the isolated guard fixture harness. It renders guard status, source mode,
input capability flags, fixture fallback, and hard safety flags for the static
fixtures only. It is not wired into Trade UI or the dev route, does not read
app state, does not read or render real selectedRecommendation state, does not
call the adapter, and does not call a derived-preview builder.

`docs/avanza-real-selected-recommendation-read-only-input-guard-route-section-plan.md`
plans a future fixture/model-only section on the isolated dev QA route for the
guard harness. The plan does not change the route, does not wire the harness
yet, does not change Trade UI, does not read real selectedRecommendation state,
and does not derive or render real app/route preview state.

`docs/avanza-real-selected-recommendation-read-only-input-guard-route-section-pre-implementation-checkpoint.md`
records the go/no-go checklist before that route section is implemented. It
permits only future fixture/model-only route rendering of the guard harness and
continues to forbid Trade UI wiring, real selectedRecommendation reads,
preview derivation, bridge calls, localhost fetches, polling, active controls,
and execution.

`app/dev/avanza-visual-qa/page.tsx` now renders the real selectedRecommendation
read-only input guard harness as fixture/model-only route content. It displays
only static guard fixtures, includes the hidden, blocked, and read-only input
allowed model states, labels the allowed state model-only/read-only, and keeps
the route unlinked from main navigation. `app/trade-app.tsx` remains unchanged
and the harness is not wired into Trade UI.

`docs/avanza-real-selected-recommendation-read-only-input-guard-route-section-checkpoint.md`
records the completed route section boundary. It confirms the section uses
only static guard fixtures, reads and renders no real selectedRecommendation
state, derives and renders no real app/route preview state, keeps controls
disabled, keeps the pre-activation gate locked, and preserves bridge/localhost/
poll/execution as false.

`lib/avanza-real-selected-recommendation-read-only-input-validation.ts` adds a
pure validation model for explicit selectedRecommendation-like input. The model
does not read app state, route state, React state, browser storage, network, or
Trade UI state. It is not wired into Trade UI or the dev route, and it does not
call adapter or derived-preview helpers. Valid output only creates a safe
normalized input summary for future model-state adapter normalization planning.

`docs/avanza-real-selected-recommendation-read-only-derivation-plan.md` plans
the future real selectedRecommendation read-only derivation phase. It requires
explicit input, read-only input guard approval, validation approval, adapter
normalization after validation, and derived-preview generation only after
adapter normalization succeeds. It does not implement derivation and does not
change Trade UI or the dev route.

`docs/avanza-real-selected-recommendation-read-only-derivation-pre-implementation-checkpoint.md`
records the allowed next implementation scope. It permits only a pure helper
that accepts explicit input and explicit guard/validation context, and it keeps
Trade UI, the dev route, app state reads, route state reads, bridge calls,
localhost fetches, polling, active controls, Supabase writes, and execution
forbidden.

## References

- [Avanza real selectedRecommendation read-only input plan](avanza-real-selected-recommendation-read-only-input-plan.md)
- [Avanza real selectedRecommendation read-only input guard route section plan](avanza-real-selected-recommendation-read-only-input-guard-route-section-plan.md)
- [Avanza real selectedRecommendation read-only input guard route section pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-input-guard-route-section-pre-implementation-checkpoint.md)
- [Avanza real selectedRecommendation read-only input guard route section checkpoint](avanza-real-selected-recommendation-read-only-input-guard-route-section-checkpoint.md)
- [Avanza real selectedRecommendation read-only derivation plan](avanza-real-selected-recommendation-read-only-derivation-plan.md)
- [Avanza real selectedRecommendation read-only derivation pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-derivation-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration plan](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation dev preview phase completion checkpoint](avanza-read-only-selected-recommendation-dev-preview-phase-completion-checkpoint.md)
- [Avanza isolated dev visual QA route phase completion checkpoint](avanza-isolated-dev-visual-qa-route-phase-completion-checkpoint.md)
- [Avanza isolated dev visual QA route final checkpoint](avanza-isolated-dev-visual-qa-route-final-checkpoint.md)
- [Avanza read-only selectedRecommendation derivation plan](avanza-read-only-selected-recommendation-derivation-plan.md)
- [Avanza read-only selectedRecommendation derivation decision checkpoint](avanza-read-only-selected-recommendation-derivation-decision-checkpoint.md)
- [Avanza read-only selectedRecommendation derivation decision route section checkpoint](avanza-read-only-selected-recommendation-derivation-decision-route-section-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration decision route section checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-route-section-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration decision phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation adapter safety review plan](avanza-selected-recommendation-adapter-safety-review-plan.md)
- [Avanza selectedRecommendation adapter safety static audit checkpoint](avanza-selected-recommendation-adapter-safety-static-audit-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Pure Derivation Helper Status

`lib/avanza-real-selected-recommendation-read-only-derivation.ts` now provides a
pure explicit-input helper for read-only real selectedRecommendation preview
derivation.

The helper is intentionally not connected to the isolated dev route or Trade
UI. It accepts explicit input plus an explicit guard decision, validates before
adapter normalization, normalizes through the existing selectedRecommendation
adapter only after validation succeeds, and invokes derived-preview output only
after adapter normalization succeeds.

The only renderable helper state is `read_only_preview_ready`; all other
states return no `previewState`. Even the ready state remains passive: no
handoff progression, no bridge calls, no localhost fetch, no polling, no
execution, controls disabled, and gate locked.

Default Trade UI behavior remains static fixture, selectedRecommendation
preview remains disabled by default, and the existing dev route remains
fixture-only.

## Real Derivation Fixture Status

`lib/avanza-real-selected-recommendation-read-only-derivation-fixtures.ts`
adds static fixture states for the pure helper. The fixtures cover every helper
status and keep `previewState` limited to the explicit
`read_only_preview_ready` case.

The fixtures are not route content and are not Trade UI content. They use
explicit fixture input only, do not read app or route state, do not read real
selectedRecommendation from Trade UI, and keep bridge calls, localhost fetch,
polling, execution, enabled controls, and unlocked gates forbidden.

## Isolated Derivation Harness Status

`components/execution/AvanzaRealSelectedRecommendationReadOnlyDerivationHarness.tsx`
adds an isolated view over the static real selectedRecommendation read-only
derivation fixtures.

The harness renders all derivation statuses, including
`read_only_preview_ready`, as fixture/model-only output. It does not read real
selectedRecommendation state, does not derive app/route preview state, does
not call bridge or localhost paths, and is not wired into Trade UI or the dev
route. Default Trade UI selectedRecommendation preview remains disabled.

## Derivation Harness Route Section Plan

`docs/avanza-real-selected-recommendation-read-only-derivation-route-section-plan.md`
now defines the future read-only route section for displaying those derivation
fixtures on the isolated dev QA route.

The planned section remains dev-only, fixture/model-only, explicit-input only,
and non-executing. It does not authorize real selectedRecommendation reads,
Trade UI wiring, route code changes in this step, bridge calls, localhost
fetches, polling, active controls, or execution.

## Derivation Route Section Pre-Implementation Checkpoint

`docs/avanza-real-selected-recommendation-read-only-derivation-route-section-pre-implementation-checkpoint.md`
now defines the precise future permission to render the derivation harness on
the isolated dev QA route.

The checkpoint keeps the current task planning-only: no route code changes, no
Trade UI changes, no real selectedRecommendation reads, no app/route preview
derivation, no active controls, and no execution.

## Derivation Harness Route Section Implementation

The isolated dev QA route now includes the real selectedRecommendation
read-only derivation harness as a fixture/model-only section.

This remains a dev-only visual QA display. It renders static fixture results
only, labels `read_only_preview_ready` as model-only/read-only, keeps
`previewState` visible only for that explicit fixture result, and does not
read or render real selectedRecommendation state from app/route. Trade UI
remains unchanged and selectedRecommendation preview remains disabled by
default.

## Derivation Route Section Checkpoint

`docs/avanza-real-selected-recommendation-read-only-derivation-route-section-checkpoint.md`
now summarizes the completed route-visible derivation harness section.

The checkpoint keeps the dev preview path fixture/model-only, confirms no real
selectedRecommendation state is read or rendered, and preserves disabled
controls, locked gate, and no execution.

## Real Derivation Phase Completion

`docs/avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md`
now completes the real selectedRecommendation read-only derivation phase at
fixture/model-only level.

The completed phase remains dev-only and passive: static fixtures only on the
QA route, no Trade UI wiring, no real app/route state reads, no active
controls, and no execution.

## Architecture Checkpoint Before Trade UI

`docs/avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md`
now summarizes the completed safe preview architecture before any Trade UI
read-only selectedRecommendation preview planning.

The next Trade UI step, if any, must be planned separately and remain
default-off, passive/read-only, unlinked from execution, and free of bridge,
localhost, polling, handoff package, Avanza behavior, and Supabase execution
writes.

## Trade UI Read-Only Preview Integration Plan

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md`
now records that future Trade UI planning step.

It remains default-off and passive/read-only by design, with no active controls,
no handoff package, no Avanza behavior, no execution, and no production
readiness claim.

## Trade UI Preview Model Pre-Implementation Checkpoint

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-pre-implementation-checkpoint.md`
now records that the next implementation may only add a pure explicit-input
Trade UI read-only preview model.

No Trade UI wiring, dev route wiring, real app/route selectedRecommendation
reads, active controls, handoff behavior, or execution are permitted by that
checkpoint.

## Pure Trade UI Preview Model Follow-Up

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts` now
adds the pure Trade UI read-only selectedRecommendation preview model.

The model remains a non-wired library helper. It accepts explicit input/config
only and keeps selectedRecommendation preview disabled by default in Trade UI.

## Pure Trade UI Preview Model Fixture Follow-Up

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-model-fixtures.ts`
now provides static model-only fixtures for the Trade UI read-only preview
model. The fixtures use explicit inputs/config only, are not wired into Trade UI
or the dev route, and keep real app/route selectedRecommendation state outside
the preview path.

## Pure Trade UI Preview Model Harness Follow-Up

`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewModelHarness.tsx`
now provides isolated fixture rendering for those model states. The harness
remains unwired, reads no app or route state, does not read real
selectedRecommendation state, and keeps the ready fixture passive/read-only/
model-only.

## Pure Trade UI Preview Model Route Section Plan

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-plan.md`
now plans how that harness may later be shown on the dev-only visual QA route.
The plan keeps the route section fixture/model-only and still forbids real
selectedRecommendation reads, app/route preview derivation, bridge calls,
polling, handoff controls, and execution.

## Pure Trade UI Preview Model Route Section Checkpoint

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-pre-implementation-checkpoint.md`
now records the checkpoint before any future route rendering. It permits only
static model fixtures, default-off labels, explicit input/config labels,
disabled controls, a locked gate, and no execution.

## Pure Trade UI Preview Model Route Section Follow-Up

The fixture/model-only route section now renders on the dev-only visual QA
route. It remains static-fixture only and does not read real
selectedRecommendation state, does not derive app/route preview state, does not
wire Trade UI, and does not add execution.

## Pure Trade UI Preview Model Route Section Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md`
now records the completed fixture/model-only route section. It still does not
authorize real selectedRecommendation reads, real app/route preview derivation,
Trade UI wiring, bridge/fetch/polling, handoff, or execution.

## Pure Trade UI Preview Model Phase Completion Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md`
now marks the model/fixture/harness/dev-route fixture section phase complete.
It still does not authorize real selectedRecommendation reads, Trade UI wiring,
bridge/fetch/polling, handoff, or execution.

## Default-Off Trade UI Wiring Plan Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md`
now plans the future default-off Trade UI wiring step for passive read-only
selectedRecommendation preview. This is still planning-only: no app code
changes, no `app/trade-app.tsx` changes, no dev route changes, no real
selectedRecommendation reads from app/route, no real app/route preview
derivation, no active controls, no handoff package, and no execution.

## Default-Off Wiring Pre-Implementation Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md`
now marks the boundary before any implementation. It permits only a future
isolated passive component/model with explicit input/config and still forbids
Trade UI wiring, app/route state reads, dev route changes, active controls,
handoff, bridge/fetch/polling, and execution.

## Isolated Passive Component Follow-Up

`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx`
now adds the passive Trade UI preview renderer for explicit model results. It
does not read real selectedRecommendation state, does not call derivation
helpers, is not wired into Trade UI or the dev route, and keeps controls
disabled, the gate locked, and execution forbidden.

## Passive Component Fixture/Harness Follow-Up

`lib/avanza-trade-ui-read-only-selected-recommendation-preview-component-fixtures.ts`
and
`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreviewHarness.tsx`
now add static component fixtures and an isolated harness for the passive
renderer. They are explicit modelResult only, do not read real
selectedRecommendation state, and remain unwired from Trade UI and the dev
route.

## Passive Component Route Section Planning Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-plan.md`
now plans the optional future dev-only visual QA route section for the passive
component harness.

This follow-up is planning-only. It does not change the dev route, does not
wire the passive component into Trade UI, does not read real
selectedRecommendation state from app/route, does not derive app/route preview
state, and does not add bridge/fetch/polling or execution behavior.

## Passive Component Route Section Pre-Implementation Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-pre-implementation-checkpoint.md`
now records the go/no-go boundary before the passive component harness may be
rendered on the dev-only visual QA route. The checkpoint permits only
fixture/model-only route content and continues to forbid Trade UI wiring, real
selectedRecommendation reads from app/route, app/route preview derivation,
active controls, bridge/fetch/polling, and execution.

## Passive Component Route Section Implementation Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders the passive component harness
using static component fixtures. The section remains fixture/model-only and
does not read real selectedRecommendation state, derive app/route preview
state, wire Trade UI, or add execution behavior.

## Passive Component Route Section Checkpoint Follow-Up

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md`
now records the completed fixture/model-only route section. It keeps the
read-only real selectedRecommendation dev preview boundary intact: no real
selectedRecommendation state is read from app/route and no execution behavior
is added.

## Passive Component Phase Completion Follow-Up

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_preview_component_phase_completion_checkpoint_added`

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md`
now closes the passive component/default-off wiring preparation phase while
still forbidding real selectedRecommendation reads and execution.

## Pre-Trade-UI Wiring Architecture Follow-Up

Checkpoint status:
`avanza_trade_ui_read_only_selected_recommendation_pre_trade_ui_wiring_architecture_checkpoint_added`

`docs/avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md`
now records the broad pre-Trade-UI wiring boundary before any
`app/trade-app.tsx` change.

## app/trade-app.tsx Passive Wiring Plan Follow-Up

Plan status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_plan_added`

`docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md`
now plans a future default-off passive Trade UI rendering path while still
forbidding real state reads in this task.

## app/trade-app.tsx Passive Wiring Pre-Implementation Follow-Up

Checkpoint status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_pre_implementation_checkpoint_added`

`docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md`
now records the final checkpoint before any future `app/trade-app.tsx` passive
wiring.

## References

- [Avanza Trade app passive read-only selectedRecommendation preview wiring pre-implementation checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring plan](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation pre-Trade-UI wiring architecture checkpoint](avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring plan](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section plan](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-route-section-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview model route section checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-model-route-section-checkpoint.md)

## Minimal Trade UI Default-Off Wiring Follow-Up

Status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_minimal_default_off_wiring_added`

Trade UI now has a passive/default-off placeholder branch for the read-only
selectedRecommendation preview. This is not real selectedRecommendation
dev-preview activation: the guard is hardcoded false, the branch renders nothing
by default, and it uses only the default hidden preview model.

The real selectedRecommendation dev-preview plan remains future work. No real
selectedRecommendation state is read for this new branch, no app previewState is
derived, and there is no bridge, localhost fetch, polling, runner/fill,
trigger, click, review, final, submit, order, credential/session handling, or
Supabase execution write.

Checkpoint:
[Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
records the completed minimal/default-off app wiring state.

Safety audit:
[Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
confirms the minimal default-off branch remains disabled, invisible, read-only,
and non-executable.

Phase completion:
[Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
marks the first Trade UI passive/default-off wiring phase complete while the
preview remains hard-disabled, invisible by default, read-only, and
non-executable.

Source map planning:
[Avanza selectedRecommendation source map plan](avanza-selected-recommendation-source-map-plan.md)
requires a planning-only map of already-present `app/trade-app.tsx`
selectedRecommendation-like data before any real preview input is extracted or
connected.

Source map pre-implementation:
[Avanza selectedRecommendation source map pre-implementation checkpoint](avanza-selected-recommendation-source-map-pre-implementation-checkpoint.md)
permits only a future pure source extraction helper and still forbids preview
enablement, real input connection, app-state preview derivation, handoff, and
execution.

Pure source extraction helper:
`lib/avanza-selected-recommendation-source-extraction.ts` now implements that
pure helper with explicit candidate input only. It is not wired into
`app/trade-app.tsx`, the dev route, or the passive preview model path.

Source extraction fixtures and harness:
`lib/avanza-selected-recommendation-source-extraction-fixtures.ts` and
`components/execution/AvanzaSelectedRecommendationSourceExtractionHarness.tsx`
cover all source extraction statuses with explicit fixture input only. They are
not wired into `app/trade-app.tsx`, the dev route, or the passive preview model
path.

Source extraction route section plan:
[Avanza selectedRecommendation source extraction route section plan](avanza-selected-recommendation-source-extraction-route-section-plan.md)
defines a future fixture/model-only dev route section for the source extraction
harness. It does not change the route, does not wire the harness into Trade UI,
does not connect real selectedRecommendation input, and does not derive
previewState from app or route state.

Source extraction route section pre-implementation checkpoint:
[Avanza selectedRecommendation source extraction route section pre-implementation checkpoint](avanza-selected-recommendation-source-extraction-route-section-pre-implementation-checkpoint.md)
permits only a future fixture/model-only route section for the source extraction
harness and still forbids Trade UI wiring, real selectedRecommendation reads,
preview model connection, previewState derivation, handoff, bridge/fetch,
polling, and execution.

Source extraction route section implementation:
`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaSelectedRecommendationSourceExtractionHarness` with static source
extraction fixtures only. The section remains fixture/model-only, unlinked from
main navigation, disconnected from Trade UI, disconnected from the preview
model, and disconnected from real selectedRecommendation input.

Source extraction route section checkpoint:
[Avanza selectedRecommendation source extraction route section checkpoint](avanza-selected-recommendation-source-extraction-route-section-checkpoint.md)
records the completed fixture/model-only route section and confirms all five
source statuses remain static, read-only/model-only, non-executing, and
disconnected from Trade UI and the preview model.

Source mapping phase completion:
[Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
closes the pure source extraction helper, fixtures, isolated harness, and
fixture/model-only dev route section phase. It keeps source extraction
disconnected from Trade UI, real selectedRecommendation input, the preview
model, and app or route previewState derivation.

Hard-disabled source-to-preview integration plan:
[Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
plans a future source extraction to preview model connection only behind
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false`. It is planning-only
and does not wire source extraction into Trade UI, connect real
selectedRecommendation input, enable preview, or derive previewState from app or
route state.

Hard-disabled source-to-preview pre-implementation checkpoint:
[Avanza hard-disabled source-to-preview integration pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-pre-implementation-checkpoint.md)
permits only a future pure source-to-preview helper with explicit inputs. It
keeps Trade UI wiring, preview enablement, real selectedRecommendation input,
bridge/fetch/polling, handoff, and execution forbidden.

Hard-disabled source-to-preview pure helper:
`lib/avanza-hard-disabled-source-to-preview-integration.ts` now implements that
explicit-input boundary as pure model-only code. It can model a read-only
preview result from a ready source extraction result, but remains disconnected
from real selectedRecommendation state and Trade UI.

Hard-disabled source-to-preview fixtures and harness:
`lib/avanza-hard-disabled-source-to-preview-integration-fixtures.ts` and
`components/execution/AvanzaHardDisabledSourceToPreviewIntegrationHarness.tsx`
now cover the pure helper with static explicit-input fixtures. They remain
unwired from Trade UI and do not render real selectedRecommendation preview.

Hard-disabled source-to-preview route section plan:
[Avanza hard-disabled source-to-preview integration route section plan](avanza-hard-disabled-source-to-preview-integration-route-section-plan.md)
now records the fixture/model-only dev-route visibility boundary for the
integration harness. It still forbids real selectedRecommendation state reads,
Trade UI wiring, preview enablement, handoff, bridge/fetch/polling, and
execution.

Hard-disabled source-to-preview route section pre-implementation checkpoint:
[Avanza hard-disabled source-to-preview integration route section pre-implementation checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-pre-implementation-checkpoint.md)
permitted only fixture/model-only route rendering and keeps real
selectedRecommendation state disconnected.

Hard-disabled source-to-preview route section implementation:
`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaHardDisabledSourceToPreviewIntegrationHarness` with static integration
fixtures only. The route section is fixture/model-only, unlinked from main
navigation, does not read or render real selectedRecommendation state, does not
derive previewState from app or route state, and does not wire anything into
Trade UI.

Hard-disabled source-to-preview route section checkpoint:
[Avanza hard-disabled source-to-preview integration route section checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md)
records the completed fixture/model-only route section. It confirms
`preview_model_ready_read_only` remains read-only/model-only, `modelResult` is
visible only for that status, `canRenderPreview` is true only for explicit
static fixture input, and all handoff, bridge/local fetch, polling, execution,
active controls, and unlocked gates remain unavailable.

Hard-disabled source-to-preview integration phase completion:
[Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
closes the pure helper, fixture, harness, and dev route section phase. The next
recommended phase is hard-disabled Trade UI branch wiring planning, still with
no preview enablement, no runtime activation, no handoff, no bridge, and no
execution.

Hard-disabled Trade UI branch wiring plan:
[Avanza hard-disabled Trade UI branch wiring plan](avanza-hard-disabled-trade-ui-branch-wiring-plan.md)
plans only a future false-guarded Trade UI branch call with explicit/default
safe inputs. It does not permit real selectedRecommendation reads, source
extraction wiring, preview enablement, app or route previewState derivation,
handoff, bridge/local calls, execution, credentials, sessions, or Supabase
execution writes.

Hard-disabled Trade UI branch wiring pre-implementation checkpoint:
[Avanza hard-disabled Trade UI branch wiring pre-implementation checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-pre-implementation-checkpoint.md)
permits only a future minimal false-guarded branch implementation using
default/static safe input. It does not permit real selectedRecommendation
input, source extraction wiring into normal Trade UI, preview enablement, or
execution behavior.

Minimal hard-disabled Trade UI branch wiring:
`app/trade-app.tsx` now contains the minimal false-guarded integration helper
call. This remains separate from any read-only real selectedRecommendation dev
preview phase: no real selectedRecommendation input is passed, no previewState
is derived from app or route state, and default preview remains disabled.

Hard-disabled Trade UI branch wiring safety audit:
[Avanza hard-disabled Trade UI branch wiring safety audit](avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md)
now confirms the current Trade UI branch remains hard-disabled after the
minimal helper call. Real selectedRecommendation input remains disconnected,
source extraction remains not wired into Trade UI, no previewState is derived
from app or route state, default `static_fixture` behavior remains unchanged,
controls remain disabled, and the gate remains locked.

Hard-disabled Trade UI branch wiring checkpoint:
[Avanza hard-disabled Trade UI branch wiring checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-checkpoint.md)
now documents that the minimal branch-only helper call exists but remains
unreachable by default. It is separate from any real selectedRecommendation dev
preview phase: source extraction remains unwired, real selectedRecommendation
input remains disconnected, no previewState is derived from app or route state,
and no executable behavior was added.

Hard-disabled Trade UI branch wiring phase completion:
[Avanza hard-disabled Trade UI branch wiring phase completion checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md)
now marks the hard-disabled branch wiring phase complete. This remains separate
from any read-only real selectedRecommendation dev preview: no real
selectedRecommendation input is connected/read/rendered, source extraction
remains unwired, no previewState is derived from app or route state, and no
execution behavior was added.

Test-only enabled branch planning:
[Avanza test-only enabled branch planning](avanza-test-only-enabled-branch-planning.md)
plans only a possible future internal/test-only fixture branch with
`integrationEnabled: true`. It is not a real selectedRecommendation connection:
it permits static sanitized fixture input only, keeps default Trade UI
unchanged, keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false,
keeps source extraction unwired from Trade UI, derives no previewState from app
or route state, and still forbids active controls, handoff, bridge/fetch,
polling, order behavior, credential/session handling, and Supabase writes.

Test-only enabled branch pre-implementation checkpoint:
[Avanza test-only enabled branch pre-implementation checkpoint](avanza-test-only-enabled-branch-pre-implementation-checkpoint.md)
sets the go/no-go boundary before any test-only enabled branch implementation.
It allows only a pure fixture/model-only path using static sanitized input and
keeps real selectedRecommendation input, app/route previewState derivation,
normal Trade UI activation, active controls, handoff, bridge/fetch/polling,
order behavior, credential/session handling, and Supabase writes forbidden.

Test-only enabled preview fixture helper:
`lib/avanza-test-only-enabled-preview-fixture-model.ts` implements the pure
fixture-only helper for that boundary. It can exercise the source-to-preview
chain with `integrationEnabled: true` using static sanitized fixture input
only. It is not wired into Trade UI or the dev route and remains separate from
any real selectedRecommendation dev preview connection.

Test-only enabled preview fixtures and harness:
`lib/avanza-test-only-enabled-preview-fixture-model-fixtures.ts` and
`components/execution/AvanzaTestOnlyEnabledPreviewFixtureModelHarness.tsx`
provide fixture-only coverage for that helper. They do not connect real
selectedRecommendation input, do not derive previewState from app or route
state, and remain unwired from both Trade UI and the dev route.

Test-only enabled preview route section plan:
[Avanza test-only enabled preview route section plan](avanza-test-only-enabled-preview-route-section-plan.md)
plans only a future fixture/model-only dev-route section for those static
fixtures and harness. It is separate from any real selectedRecommendation
read-only preview phase: it reads no real selectedRecommendation state,
connects no real input, derives no previewState from app or route state, and
does not wire anything into Trade UI.

Test-only enabled preview route section pre-implementation checkpoint:
[Avanza test-only enabled preview route section pre-implementation checkpoint](avanza-test-only-enabled-preview-route-section-pre-implementation-checkpoint.md)
permits only a future fixture/model-only dev-route section for the isolated
test-only harness. It remains separate from real selectedRecommendation
read-only preview work and does not connect real input, derive previewState from
app or route state, or enable normal/default Trade UI preview.

Test-only enabled preview route section implementation:
`app/dev/avanza-visual-qa/page.tsx` now renders the isolated test-only enabled
preview harness with static fixtures only. This remains separate from any real
selectedRecommendation read-only preview phase: no real selectedRecommendation
input is connected/read/rendered, no previewState is derived from app or route
state, and normal/default Trade UI preview remains disabled.
