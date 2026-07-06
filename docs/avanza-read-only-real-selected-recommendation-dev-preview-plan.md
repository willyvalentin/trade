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

Disabled API route implementation phase completion status:
`avanza_disabled_api_route_implementation_phase_complete`

Trade UI prepare intent plan status:
`avanza_trade_ui_prepare_intent_planned_no_wiring`

Trade UI prepare intent model status:
`avanza_trade_ui_prepare_intent_model_added`

Trade UI prepare intent fixture/harness status:
`avanza_trade_ui_prepare_intent_fixtures_harness_added`

Trade UI prepare intent dev route section status:
`avanza_trade_ui_prepare_intent_dev_route_section_added_fixture_model_only`

Disabled internal prepare button shell model status:
`avanza_disabled_internal_prepare_button_shell_model_added`

Disabled internal prepare button shell fixture/harness status:
`avanza_disabled_internal_prepare_button_shell_fixtures_harness_added`

Disabled internal prepare button shell dev route section status:
`avanza_disabled_internal_prepare_button_shell_dev_route_section_added_fixture_model_only`

Disabled internal prepare button shell visibility completion status:
`avanza_disabled_internal_prepare_button_shell_visibility_phase_complete`

Passive disabled prepare shell component plan status:
`avanza_passive_disabled_prepare_shell_component_planned`

Passive disabled prepare shell component implementation status:
`avanza_passive_disabled_prepare_shell_component_fixtures_harness_added`

Passive disabled prepare shell dev route section status:
`avanza_passive_disabled_prepare_shell_dev_route_section_added_fixture_model_only`

Passive disabled prepare shell phase completion status:
`avanza_passive_disabled_prepare_shell_component_phase_complete`

Hard-disabled Trade UI prepare shell wiring plan status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_planned`

Hard-disabled Trade UI prepare shell wiring implementation status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_added_minimal_disabled`

Hard-disabled Trade UI prepare shell wiring safety audit status:
`avanza_hard_disabled_trade_ui_prepare_shell_wiring_safety_audit_passed`

## Purpose

Plan a future dev-only/read-only phase that can safely preview Avanza handoff
state derived from a real selectedRecommendation.

This plan is not execution. It adds no bridge calls, no localhost fetches, and
no Avanza fill behavior.

The disabled local-only API route implementation is closed in
`docs/avanza-disabled-api-route-implementation-phase-completion-checkpoint.md`.
The follow-on Trade UI prepare intent phase is planning-only in
`docs/avanza-trade-ui-prepare-intent-plan.md`; it does not wire route calls,
does not add a prepare button, and does not add Avanza/browser/order behavior.

The pure prepare intent helper `lib/avanza-trade-ui-prepare-intent.ts` consumes
explicit model outputs only and remains disconnected from real selectedRecommendation
state, Trade UI wiring, the disabled API route, bridge/local fetches, browser
control, fill behavior, order behavior, credential/session handling, and
Supabase execution writes.

The prepare intent fixtures and isolated harness are route-visible only as
fixture/model-only content on the dev QA route. They do not read or render real
selectedRecommendation state, do not call the disabled API route, and do not add
Trade UI wiring, active controls, fill behavior, order behavior,
credential/session handling, or Supabase execution writes.

The disabled internal prepare button shell helper
`lib/avanza-disabled-internal-prepare-button-shell.ts` is pure and
explicit-input only. It defaults to hidden with `shellEnabled: false` and
`canRenderShell: false`, is not wired into Trade UI, is not wired into the
disabled API route, and cannot call localhost, bridge, Avanza/browser, fill,
review, confirmation, submit, order, credential/session handling, or Supabase
execution writes.

The disabled internal prepare button shell visibility layer is closed in
`docs/avanza-disabled-internal-prepare-button-shell-visibility-phase-completion-checkpoint.md`.
The next passive disabled prepare shell component phase is planned in
`docs/avanza-passive-disabled-prepare-shell-component-plan.md`; it remains
separate from real selectedRecommendation preview work, must accept explicit
shell model props only, must render fixture/model-only first, and must not add
Trade UI API route calls, localhost, bridge, browser/Avanza control, real fill,
order behavior, credential/session handling, or Supabase execution writes.

The passive disabled prepare shell component layer now exists as isolated
fixture/model-only artifacts:
`components/execution/AvanzaPassiveDisabledPrepareShell.tsx`,
`lib/avanza-passive-disabled-prepare-shell-fixtures.ts`, and
`components/execution/AvanzaPassiveDisabledPrepareShellHarness.tsx`. The
isolated harness is rendered on `app/dev/avanza-visual-qa/page.tsx` as
fixture/model-only content using static fixtures. It is not wired into Trade UI
and remains separate from real selectedRecommendation reads, preview
derivation, API route calls, localhost/bridge/fetch, browser/Avanza control,
real fill, order behavior, credential/session handling, and Supabase execution
writes.

The passive disabled prepare shell phase is closed in
`docs/avanza-passive-disabled-prepare-shell-component-phase-completion-checkpoint.md`.
The hard-disabled Trade UI prepare shell wiring is tracked in
`docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-plan.md`. The minimal
wiring now exists inside the existing disabled/default-off branch only. It
keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` as `false`, builds a
hidden shell model with `shellEnabled: false`, maps it into a passive component
model with `componentEnabled: false` and `canRenderComponent: false`, and
renders no shell UI by default. It remains metadata-only, hidden by default,
with no active prepare button, no click handler, no API route call, and no
Avanza/browser/fill/order behavior.

The prepare shell wiring safety audit is recorded in
`docs/avanza-hard-disabled-trade-ui-prepare-shell-wiring-safety-audit.md`. It
confirms the wiring is isolated, unreachable by default, hidden/disabled by
default, and cannot call the disabled API route, localhost, bridge, fetch,
polling, Avanza/browser, fill, review, confirmation, submit, order,
credential/session handling, or Supabase writes.

The shell fixtures `lib/avanza-disabled-internal-prepare-button-shell-fixtures.ts`
and isolated harness
`components/execution/AvanzaDisabledInternalPrepareButtonShellHarness.tsx` are
route-visible only as fixture/model-only content on the dev QA route. They
render static hidden, disabled, blocked, ready-internal-disabled, error,
unknown, safe BUY, and safe SELL shell examples. They do not read real
selectedRecommendation state, do not call the disabled API route, and do not add
Trade UI wiring, active controls, fill behavior, order behavior,
credential/session handling, or Supabase execution writes.

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

Test-only enabled preview route section checkpoint:
[Avanza test-only enabled preview route section checkpoint](avanza-test-only-enabled-preview-route-section-checkpoint.md)
records the completed fixture/model-only route section. It remains separate
from real selectedRecommendation read-only preview work and confirms the
test-only path is not connected to Trade UI runtime state.

Test-only enabled branch safety audit:
[Avanza test-only enabled branch safety audit](avanza-test-only-enabled-branch-safety-audit.md)
audits the test-only enabled preview fixture path before any real
selectedRecommendation planning continues. It confirms the path remains
fixture/model-only, dev-route-only, static sanitized, read-only/model-only for
the ready status, default-disabled, disconnected from Trade UI and real
selectedRecommendation state, and non-executable.

Test-only enabled branch phase completion:
[Avanza test-only enabled branch phase completion checkpoint](avanza-test-only-enabled-branch-phase-completion-checkpoint.md)
marks the test-only enabled branch phase complete. It confirms the pure helper,
fixtures, isolated harness, dev-route fixture/model-only section, and safety
audit are complete while real selectedRecommendation input remains disconnected,
source extraction remains unwired from Trade UI, and no previewState is derived
from app or route state.

Real selectedRecommendation read-only connection planning:
[Avanza real selectedRecommendation read-only connection plan](avanza-real-selected-recommendation-read-only-connection-plan.md)
defines the next planning phase for explicitly mapping an already-existing
Trade UI selectedRecommendation-like object into the read-only preview chain.
It is planning-only: no app code changes, no source extraction wiring, no real
input read/render, no previewState derivation, no default preview enablement,
and no execution behavior.

Real selectedRecommendation read-only connection pre-implementation checkpoint:
[Avanza real selectedRecommendation read-only connection pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-connection-pre-implementation-checkpoint.md)
permits only a future pure explicit-argument connection model/helper. It still
forbids app/trade-app.tsx wiring, dev-route wiring, runtime real input reads,
preview enablement, app/route previewState derivation, bridge/fetch/polling,
handoff, execution, credential/session handling, and Supabase writes.

Real selectedRecommendation read-only connection helper:
`lib/avanza-real-selected-recommendation-read-only-connection.ts` now exists as
a pure explicit-input model/helper. It can model disabled, unavailable,
invalid, ready read-only, preview blocked, and preview ready states, with
`modelResult` only for the explicitly allowed read-only preview ready state.

The helper is not wired into Trade UI. Real selectedRecommendation input remains
disconnected from runtime surfaces, source extraction remains not wired into Trade UI,
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false, default Trade
UI remains visually unchanged, and no active controls or execution behavior
were added.

Real selectedRecommendation read-only connection fixtures and harness:
`lib/avanza-real-selected-recommendation-read-only-connection-fixtures.ts` and
`components/execution/AvanzaRealSelectedRecommendationReadOnlyConnectionHarness.tsx`
now provide fixture/model-only coverage for every connection status. They remain
unwired from Trade UI, are rendered on the dev-only visual QA route as
fixture/model-only content, use explicit fixture candidates only, and do not
read or render real selectedRecommendation state from app or route state.

Real selectedRecommendation read-only connection route section plan:
[Avanza real selectedRecommendation read-only connection route section plan](avanza-real-selected-recommendation-read-only-connection-route-section-plan.md)
planned the dev-only visual QA section for that isolated harness. The section
now renders static connection fixtures only, labels itself connection fixture
only and explicit candidate input only, and continues forbidding real
selectedRecommendation reads from app/route state, Trade UI wiring, previewState
derivation from app/route state, handoff, bridge/local fetch/polling, execution,
credential/session handling, and Supabase writes.

Real selectedRecommendation read-only connection route section pre-implementation checkpoint:
[Avanza real selectedRecommendation read-only connection route section pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-connection-route-section-pre-implementation-checkpoint.md)
permitted only a fixture/model-only render of the isolated connection harness on
the dev-only visual QA route. The implemented route section does not wire Trade
UI, does not read real selectedRecommendation state from app or route state,
does not derive previewState from app or route state, keeps
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, and keeps all active
controls and execution behavior forbidden.

Real selectedRecommendation read-only connection route section implementation:
`app/dev/avanza-visual-qa/page.tsx` now renders the isolated connection harness
with static fixtures only. The route remains unlinked from main navigation,
Trade UI remains unchanged, real selectedRecommendation input remains
disconnected from Trade UI, source extraction remains unwired from Trade UI, and
no previewState is derived from app or route state.

Real selectedRecommendation read-only connection route section checkpoint:
[Avanza real selectedRecommendation read-only connection route section checkpoint](avanza-real-selected-recommendation-read-only-connection-route-section-checkpoint.md)
records the completed fixture/model-only route section. It confirms all six
connection statuses are visible, `preview_ready_read_only` remains
read-only/model-only, safe summaries exclude credentials/session/account/
cookie/storage/broker-secret data, Trade UI remains unwired, default preview
remains disabled, and no execution behavior is available.

Real selectedRecommendation read-only connection safety audit:
[Avanza real selectedRecommendation read-only connection safety audit](avanza-real-selected-recommendation-read-only-connection-safety-audit.md)
confirms the connection path remains fixture/model-only, route-only, read-only,
disconnected from Trade UI, disconnected from real selectedRecommendation input,
and non-executable. It verifies `modelResult` exists only for
`preview_ready_read_only`, safe summaries exclude credential/session/account/
cookie/storage/broker-secret data, source extraction remains unwired from Trade
UI, `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false, and no
previewState is derived from app or route state.

Real selectedRecommendation read-only connection phase completion:
[Avanza real selectedRecommendation read-only connection phase completion checkpoint](avanza-real-selected-recommendation-read-only-connection-phase-completion-checkpoint.md)
marks the connection phase complete. The completed phase includes the pure
helper, fixtures, isolated harness, dev-route fixture/model-only section, and
safety audit, while keeping Trade UI unwired, source extraction unwired from
Trade UI, real selectedRecommendation input disconnected, and execution
forbidden.

Hard-disabled Trade UI real-source branch wiring plan:
[Avanza hard-disabled Trade UI real-source branch wiring plan](avanza-hard-disabled-trade-ui-real-source-branch-wiring-plan.md)
plans how a future app-level step may pass an already-existing
selectedRecommendation-like object into the read-only connection helper only
inside the existing disabled branch. This remains planning-only: no app code is
changed, no real selectedRecommendation input is connected or read in Trade UI,
and preview remains disabled by default.

Hard-disabled Trade UI real-source branch pre-implementation checkpoint:
[Avanza hard-disabled Trade UI real-source branch wiring pre-implementation checkpoint](avanza-hard-disabled-trade-ui-real-source-branch-wiring-pre-implementation-checkpoint.md)
permits only a future minimal `app/trade-app.tsx` change inside the existing
false-guarded branch. It requires explicit pass-through of an already-existing
selectedRecommendation-like source, keeps `connectionEnabled` and
`allowPreviewModel` false by default, and keeps default preview disabled.

Hard-disabled Trade UI real-source branch minimal wiring:
`app/trade-app.tsx` now calls the real selectedRecommendation read-only
connection helper only inside the existing false-guarded branch. It passes the
already-existing `selectedRecommendation` object explicitly, keeps
`connectionEnabled` false by default, keeps `allowPreviewModel` false by
default, and keeps selectedRecommendation preview disabled by default.

Hard-disabled Trade UI real-source branch safety audit:
[Avanza hard-disabled Trade UI real-source branch wiring safety audit](avanza-hard-disabled-trade-ui-real-source-branch-wiring-safety-audit.md)
confirms the minimal branch is isolated, unreachable by default, read-only,
visually unchanged by default, and non-executable. It also confirms source
extraction remains outside the default Trade UI path and no bridge/fetch,
polling, active control, order, credential/session, or Supabase write behavior
was added.

Hard-disabled Trade UI real-source branch phase completion:
[Avanza hard-disabled Trade UI real-source branch wiring phase completion checkpoint](avanza-hard-disabled-trade-ui-real-source-branch-wiring-phase-completion-checkpoint.md)
closes the minimal default-off Trade UI real-source branch phase. It confirms
the branch remains unreachable by default and non-executable.

Handoff package builder planning:
[Avanza handoff package builder plan](avanza-handoff-package-builder-plan.md)
starts the next planning-only phase for a future pure data package builder. It
does not enable handoff, browser control, bridge/local calls, polling, order
submission, credential/session handling, or Supabase execution writes.

Handoff package builder helper:
`lib/avanza-handoff-package-builder.ts` now implements that package builder as
a pure explicit-input helper. It can produce read-only or fill-only data package
models from safe recommendation-like input or ready read-only connection output,
but it remains unwired from Trade UI and the dev route. It does not read app
state, route state, process env, browser storage, credentials, sessions, BankID,
cookies, bridge, localhost, Avanza, or Supabase. `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
remains false and no default selectedRecommendation preview or execution path is
enabled.

Handoff package builder fixtures and harness:
`lib/avanza-handoff-package-builder-fixtures.ts` and
`components/execution/AvanzaHandoffPackageBuilderHarness.tsx` now provide
fixture-only visibility for the pure handoff package builder. The fixtures cover
blocked, BUY, SELL, read-only ready, fill-only ready, stale/expired, and warning
states. The harness is isolated and passive.

Handoff package builder dev route section:
`app/dev/avanza-visual-qa/page.tsx` now renders the harness with static handoff
package fixtures only. The section is fixture/model-only and is not linked from
main navigation. It is not rendered in Trade UI, does not read real
selectedRecommendation state, and does not add bridge, localhost, polling,
Avanza/browser, order, credential/session, or Supabase behavior.

Handoff package builder phase completion:
[Avanza handoff package builder phase completion checkpoint](avanza-handoff-package-builder-phase-completion-checkpoint.md)
closes the pure builder phase. It confirms helper, fixtures, harness, and dev
QA route fixture/model-only visibility are complete without Trade UI handoff
wiring or execution behavior.

Trade UI handoff preview planning:
[Avanza Trade UI handoff preview plan](avanza-trade-ui-handoff-preview-plan.md)
defines the next planning-only step for a future passive Trade UI package
preview. The plan keeps default Trade UI visually unchanged until explicit
future wiring and continues forbidding bridge, localhost, polling,
Avanza/browser, order, credential/session, and Supabase behavior.

Trade UI handoff preview component fixture step:
`components/execution/AvanzaTradeUiHandoffPreview.tsx`,
`lib/avanza-trade-ui-handoff-preview-fixtures.ts`, and
`components/execution/AvanzaTradeUiHandoffPreviewHarness.tsx` now exist as an
isolated read-only preview component, static fixture set, and harness. They are
not wired into Trade UI, do not read real selectedRecommendation state, do not
call bridge/local/Avanza/browser paths, and do not add handoff, prepare,
buy/sell CTA, order, credential/session, or Supabase behavior.

Trade UI handoff preview dev route section:
The isolated handoff preview harness is now visible on the dev-only Avanza
visual QA route using static fixtures only. This remains separate from real
selectedRecommendation dev preview work: the section does not read real
selectedRecommendation state, does not wire into `app/trade-app.tsx`, does not
derive app/route preview state, and does not add bridge/local/polling,
Avanza/browser, order, credential/session, or Supabase behavior.

Trade UI handoff preview hard-disabled branch:
`app/trade-app.tsx` now contains minimal hard-disabled handoff preview wiring
inside the existing false-guarded preview branch. This remains separate from
real selectedRecommendation dev preview work because the flag stays false, the
branch is unreachable by default, the model is disabled/empty, no real
selectedRecommendation handoff package is prepared by default, and no bridge,
localhost, polling, Avanza/browser, order, credential/session, or Supabase
behavior was added.

Trade UI handoff preview phase completion:
[Avanza Trade UI handoff preview phase completion checkpoint](avanza-trade-ui-handoff-preview-phase-completion-checkpoint.md)
closes the handoff preview phase. It keeps real selectedRecommendation preview
work separate from fill-only adapter planning and confirms no default preview,
handoff, bridge/browser, order behavior, credential/session handling, or
Supabase write was added.

Avanza fill-only adapter contract planning:
[Avanza fill-only adapter contract plan](avanza-fill-only-adapter-contract-plan.md)
defines the next planning-only boundary for a future fill-only adapter. That
plan does not implement an adapter and does not connect real selectedRecommendation
state to Avanza/browser behavior.

Pure Avanza fill-only adapter contract model:
`lib/avanza-fill-only-adapter-contract.ts` now defines the explicit-input
adapter request/response contract and hard safety flags for a future Avanza
fill-only adapter. It remains disconnected from Trade UI and the dev route,
does not read real selectedRecommendation state, and adds no bridge/local fetch,
polling, browser/Avanza, order, credential/session, or Supabase behavior.

Avanza fill-only adapter contract fixtures and route visibility:
`lib/avanza-fill-only-adapter-contract-fixtures.ts` and
`components/execution/AvanzaFillOnlyAdapterContractHarness.tsx` now provide a
static fixture/model-only inspection layer, and the dev-only Avanza visual QA
route renders that harness with static fixtures only. This remains separate
from real selectedRecommendation dev preview work: it does not read real
selectedRecommendation state, does not wire into Trade UI, does not call
bridge/local/Avanza/browser paths, and does not add order, credential/session,
or Supabase behavior.

Avanza fill-only adapter contract visibility completion and dry-run planning:
[Avanza fill-only adapter contract visibility phase completion checkpoint](avanza-fill-only-adapter-contract-visibility-phase-completion-checkpoint.md)
closes the fixture/model-only adapter contract visibility layer. The next
planning document,
[Avanza dry-run adapter layer plan](avanza-dry-run-adapter-layer-plan.md),
keeps the future dry-run adapter layer separate from real selectedRecommendation
preview work and continues to forbid bridge/local/Avanza/browser, real fill,
order, credential/session, and Supabase behavior.

Pure Avanza dry-run adapter helper:
`lib/avanza-dry-run-adapter-layer.ts` now models the first dry-run adapter
lifecycle step from explicit fill-only adapter response input only. It remains
separate from real selectedRecommendation dev preview work, is not wired into
Trade UI, does not read real selectedRecommendation state, and adds no
bridge/local fetch, polling, Avanza/browser control, real fill,
click/review/confirm/submit behavior, order behavior, credential/session
handling, or Supabase execution write.

Avanza dry-run adapter fixture visibility:
`lib/avanza-dry-run-adapter-layer-fixtures.ts` and
`components/execution/AvanzaDryRunAdapterLayerHarness.tsx` now expose the
dry-run adapter helper on the dev-only Avanza visual QA route as static
fixture/model-only content. This remains separate from real selectedRecommendation
dev preview work: it does not read real selectedRecommendation state, does not
wire into Trade UI, does not call bridge/local/Avanza/browser paths, and does
not add real fill, order, credential/session, or Supabase behavior.

Avanza dry-run adapter completion and disabled bridge planning:
[Avanza dry-run adapter layer phase completion checkpoint](avanza-dry-run-adapter-layer-phase-completion-checkpoint.md)
closes the dry-run adapter layer as fixture/model-only. The next plan,
[Avanza disabled local bridge contract plan](avanza-disabled-local-bridge-contract-plan.md),
keeps bridge work separate from real selectedRecommendation dev preview work
and disabled by default. It does not implement localhost calls, browser/Avanza
control, real fill, review/confirm/submit behavior, order behavior,
credential/session handling, or Supabase execution writes.

Pure disabled local bridge contract helper:
`lib/avanza-disabled-local-bridge-contract.ts` implements the disabled bridge
contract as pure model-only request/response mapping from explicit adapter
responses. It remains separate from real selectedRecommendation dev preview
work, is not wired into Trade UI, does not read real selectedRecommendation
state, and adds no localhost call, bridge call, polling, Avanza/browser
control, real fill, review/confirm/submit behavior, order behavior,
credential/session handling, or Supabase execution write.

Disabled local bridge contract fixture visibility:
`lib/avanza-disabled-local-bridge-contract-fixtures.ts` and
`components/execution/AvanzaDisabledLocalBridgeContractHarness.tsx` now expose
the disabled bridge contract on the dev-only Avanza visual QA route as static
fixture/model-only content. This remains separate from real selectedRecommendation
dev preview work: it does not read real selectedRecommendation state, does not
wire into Trade UI, does not call bridge/local/Avanza/browser paths, and does
not add real fill, order, credential/session, or Supabase behavior.

Disabled local bridge contract phase completion:
[Avanza disabled local bridge contract phase completion checkpoint](avanza-disabled-local-bridge-contract-phase-completion-checkpoint.md)
closes the disabled bridge contract phase as fixture/model-only and keeps it
separate from real selectedRecommendation dev preview work.

Disabled localhost bridge stub planning:
[Avanza disabled localhost bridge stub plan](avanza-disabled-localhost-bridge-stub-plan.md)
plans a future local/dev-only stub that remains disabled by default. It does
not connect real selectedRecommendation state, does not wire Trade UI, and does
not add localhost calls, bridge calls, Avanza/browser control, real fill,
review/confirm/submit behavior, order behavior, credential/session handling, or
Supabase writes.

Pure disabled localhost bridge stub model:
`lib/avanza-disabled-localhost-bridge-stub.ts` now models the disabled
localhost bridge stub from explicit disabled local bridge request input only.
This remains separate from real selectedRecommendation dev preview work: it
does not read real selectedRecommendation state, does not wire into Trade UI or
the dev route, does not expose a localhost endpoint, and does not add bridge
calls, fetch/polling, Avanza/browser control, real fill, review/confirm/submit
behavior, order behavior, credential/session handling, or Supabase writes.

Disabled localhost bridge stub fixture visibility:
`lib/avanza-disabled-localhost-bridge-stub-fixtures.ts` and
`components/execution/AvanzaDisabledLocalhostBridgeStubHarness.tsx` now expose
the disabled localhost bridge stub on the dev-only Avanza visual QA route as
static fixture/model-only content. This remains separate from real
selectedRecommendation dev preview work: it does not read real
selectedRecommendation state, does not wire into Trade UI, does not expose an
API route or localhost endpoint, and does not add bridge calls, localhost
fetches, polling, Avanza/browser control, real fill, review/confirm/submit
behavior, order behavior, credential/session handling, or Supabase writes.

Disabled localhost bridge stub completion and local-only API route planning:
[Avanza disabled localhost bridge stub phase completion checkpoint](avanza-disabled-localhost-bridge-stub-phase-completion-checkpoint.md)
closes the fixture/model-only stub visibility layer. The next planning document,
[Avanza local-only API route stub plan](avanza-local-only-api-route-stub-plan.md),
remains separate from real selectedRecommendation dev preview work and does not
implement an endpoint, Trade UI call, browser/Avanza behavior, real fill,
order behavior, credential/session handling, or Supabase write.

Pure local-only API route stub model:
`lib/avanza-local-only-api-route-stub.ts` now models a future local-only API
route stub from explicit disabled local bridge request input only. This remains
separate from real selectedRecommendation dev preview work: it does not read
real selectedRecommendation state, does not wire into Trade UI or the dev
route, does not expose a localhost endpoint, and does not add bridge calls,
fetch/polling, Avanza/browser control, real fill, review/confirm/submit
behavior, order behavior, credential/session handling, or Supabase writes.

Local-only API route stub fixture visibility:
`lib/avanza-local-only-api-route-stub-fixtures.ts` and
`components/execution/AvanzaLocalOnlyApiRouteStubHarness.tsx` now expose the
local-only API route stub model on the dev-only Avanza visual QA route as
static fixture/model-only content. This remains separate from real
selectedRecommendation dev preview work: it does not read real
selectedRecommendation state, does not wire into Trade UI, does not expose an
API route or localhost endpoint, and does not add bridge calls, localhost
fetches, polling, Avanza/browser control, real fill, review/confirm/submit
behavior, order behavior, credential/session handling, or Supabase writes.

Local-only API route stub visibility completion and disabled API route planning:
[Avanza local-only API route stub phase completion checkpoint](avanza-local-only-api-route-stub-phase-completion-checkpoint.md)
closes the fixture/model-only visibility layer. The next planning-only document,
[Avanza disabled API route implementation plan](avanza-disabled-api-route-implementation-plan.md),
keeps the disabled route local/dev/internal only and separate from real
selectedRecommendation preview work. The disabled route now exists at
`app/api/dev/avanza/fill-only/stub/route.ts`, returns `api_stub_disabled` by
default, is not called by Trade UI, and forbids localhost calls, bridge calls,
browser/Avanza control, real fill, order behavior, credential/session handling,
and Supabase writes.

Disabled API route implementation safety audit:
[Avanza disabled API route implementation safety audit](avanza-disabled-api-route-implementation-safety-audit.md)
confirms the disabled route remains separate from real selectedRecommendation
preview work, has no active Trade UI caller, and cannot call localhost, bridge,
fetch, Avanza/browser, real fill, review, confirmation, submit, order,
credential/session handling, or Supabase writes.

Trade UI prepare intent visibility completion:
[Avanza Trade UI prepare intent visibility phase completion checkpoint](avanza-trade-ui-prepare-intent-visibility-phase-completion-checkpoint.md)
closes the prepare intent model, fixtures, harness, and dev QA route section as
fixture/model-only. It remains disconnected from real selectedRecommendation
preview work and from Trade UI execution paths.

Hard-disabled Trade UI prepare intent wiring planning:
[Avanza hard-disabled Trade UI prepare intent wiring plan](avanza-hard-disabled-trade-ui-prepare-intent-wiring-plan.md)
now records a disabled model invocation inside the existing disabled/default-off
branch with `mode: "disabled"` and `prepareEnabled: false`. It does not
activate selectedRecommendation preview by default, does not add an active
prepare control, does not call the API route, and does not add
localhost/bridge/fetch/polling, Avanza/browser control, real fill, order
behavior, credential/session handling, or Supabase writes.

Hard-disabled Trade UI prepare intent wiring safety audit:
[Avanza hard-disabled Trade UI prepare intent wiring safety audit](avanza-hard-disabled-trade-ui-prepare-intent-wiring-safety-audit.md)
confirms that disabled invocation remains isolated, metadata-only, unreachable
by default, and separate from real selectedRecommendation preview work.

Trade UI prepare intent hard-disabled wiring phase completion:
[Avanza Trade UI prepare intent hard-disabled wiring phase completion checkpoint](avanza-trade-ui-prepare-intent-hard-disabled-wiring-phase-completion-checkpoint.md)
closes the prepare intent and hard-disabled wiring phase without enabling real
selectedRecommendation preview, API route calls, broker actions, or execution.

Disabled internal prepare button shell planning:
[Avanza disabled internal prepare button shell plan](avanza-disabled-internal-prepare-button-shell-plan.md)
plans a future disabled/internal-only shell that remains separate from real
selectedRecommendation preview work and must keep route calls, localhost,
bridge, Avanza/browser, fill, order, credential/session, and Supabase behavior
forbidden.

Hard-disabled Trade UI prepare shell wiring completion:
[Avanza hard-disabled Trade UI prepare shell wiring phase completion checkpoint](avanza-hard-disabled-trade-ui-prepare-shell-wiring-phase-completion-checkpoint.md)
closes the minimal hidden/default-off Trade UI shell wiring phase. The branch
keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, `shellEnabled`
false, `componentEnabled` false, no visible shell by default, no prepare UI by
default, and no API route call, localhost/bridge/fetch/polling,
Avanza/browser, fill, order, credential/session, or Supabase behavior.

Explicit internal visible disabled shell planning:
[Avanza explicit internal visible disabled prepare shell plan](avanza-explicit-internal-visible-disabled-prepare-shell-plan.md)
is the next planning-only step. It remains separate from real
selectedRecommendation preview work and requires any future visible shell to be
internal/dev-only, disabled, non-clickable, guarded false by default, and
forbidden from API route calls, localhost/bridge calls, Avanza/browser control,
real fill, review/confirm/submit/order behavior, credential/session handling,
or Supabase writes.

Pure explicit internal visible disabled shell model:
`lib/avanza-explicit-internal-visible-disabled-prepare-shell.ts` now exists as
model-only, explicit-input code. It remains separate from real
selectedRecommendation preview work, remains unwired from Trade UI and the dev
QA route, and keeps API route calls, localhost/bridge calls, browser control,
real fill, order behavior, credential/session handling, and Supabase writes
forbidden.

Explicit internal visible disabled shell fixture visibility:
`lib/avanza-explicit-internal-visible-disabled-prepare-shell-fixtures.ts`,
`components/execution/AvanzaExplicitInternalVisibleDisabledPrepareShellHarness.tsx`,
and the dev QA route fixture/model-only section now exist. This does not read
real selectedRecommendation state, does not wire the visible shell into default
Trade UI, does not call the disabled API route, and does not add localhost,
bridge, fetch/polling, Avanza/browser, fill, review, confirmation, submit,
order, credential/session, or Supabase behavior.

Explicit internal visible disabled shell visibility completion:
`docs/avanza-explicit-internal-visible-disabled-prepare-shell-visibility-phase-completion-checkpoint.md`
closes the fixture/model-only visibility layer without normal Trade UI wiring,
API route edits, active controls, Avanza/browser behavior, real fill, order
behavior, credential/session handling, or Supabase writes.

Hard-disabled visible prepare shell wiring planning:
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-plan.md` defines a
hidden/disabled metadata-only Trade UI branch invocation. The minimal
hard-disabled invocation is now present only inside the existing
disabled/default-off branch with `visibleShellEnabled: false` and
`mode: "hidden"`. It keeps the visible shell guard false by default, keeps
normal/default UI visually unchanged, renders no visible shell by default, and
continues to forbid API route calls, localhost/bridge/fetch/polling,
Avanza/browser control, real fill, order behavior, credential/session handling,
and Supabase writes.

Hard-disabled visible prepare shell wiring safety audit:
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-safety-audit.md`
confirms that invocation is isolated inside the hard-disabled/default-off
branch, remains hidden with `visibleShellEnabled: false` and mode hidden,
renders no visible shell in normal/default UI, leaves the disabled API route
unchanged and unwired, and adds no active controls, API route call,
localhost/bridge/fetch/polling, Avanza/browser control, real fill, order
behavior, credential/session handling, or Supabase writes.

Hard-disabled visible prepare shell wiring phase completion:
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-phase-completion-checkpoint.md`
closes the hard-disabled visible shell wiring phase with
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` still `false`,
`visibleShellEnabled: false`, mode hidden, no visible shell in normal/default
UI, no active prepare or handoff control, no API route call, no localhost,
bridge, fetch/polling, Avanza/browser, real fill, order, credential/session, or
Supabase behavior.

Guarded API route call intent plan:
`docs/avanza-guarded-api-route-call-intent-plan.md`
is planning-only for a future pure internal/dev-only intent model. It remains
disabled by default and must not call the disabled API route, add fetch, call
localhost, call bridge, control Avanza/browser, fill forms, submit orders,
handle credentials/session state, or write Supabase execution records.

Pure guarded API route call intent model:
`lib/avanza-guarded-api-route-call-intent.ts` now exists as explicit-input
metadata only. It can report disabled, route unavailable, route disabled,
visible shell unavailable, ready-internal-disabled, blocked, failed, and unknown
states while keeping route calls, fetch, localhost/bridge calls,
Avanza/browser control, real fill, review, confirmation, submit, order,
credential/session handling, and Supabase execution writes unavailable.

Guarded API route call intent fixtures and dev QA visibility:
`lib/avanza-guarded-api-route-call-intent-fixtures.ts`,
`components/execution/AvanzaGuardedApiRouteCallIntentHarness.tsx`, and the
dev-only Avanza visual QA route now render static guarded intent fixture states
for inspection. This remains fixture/model-only, unlinked from main navigation,
unwired from Trade UI and the disabled API route, and non-executing.

Guarded API route call intent visibility completion:
`docs/avanza-guarded-api-route-call-intent-visibility-phase-completion-checkpoint.md`
closes the guarded intent model, fixtures, harness, and dev QA route
fixture/model-only section without Trade UI wiring, API route edits, fetch,
localhost, bridge, Avanza/browser, real fill, order behavior,
credential/session handling, or Supabase writes.

Hard-disabled Trade UI API call intent wiring plan:
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-plan.md`
now records the minimal hidden/default-off metadata invocation inside
`app/trade-app.tsx`. The invocation is limited to the existing
hard-disabled/default-off branch, keeps `apiCallIntentEnabled: false`, keeps
`mode: "disabled"`, and defaults to `api_call_intent_disabled`.

It does not render API call intent UI, does not reference the disabled API route
path from Trade UI, and continues to forbid route calls, fetch, localhost/bridge
calls, polling, Avanza/browser control, real fill, review, confirmation,
submit, order behavior, credential/session handling, and Supabase writes.

Hard-disabled Trade UI API call intent wiring safety audit:
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-safety-audit.md`
confirms the minimal API call intent metadata invocation remains isolated inside
the hard-disabled/default-off branch, keeps `apiCallIntentEnabled: false`,
`mode: "disabled"`, and `api_call_intent_disabled` by default, renders no API
call intent UI, references no disabled API route path from Trade UI, and adds no
route call, fetch, localhost/bridge call, polling, Avanza/browser control, real
fill, review, confirmation, submit, order, credential/session handling, or
Supabase write.

Hard-disabled Trade UI API call intent wiring phase completion:
`docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-phase-completion-checkpoint.md`
closes the hard-disabled metadata wiring phase. The default output remains
`api_call_intent_disabled`, the disabled API route remains unwired, normal Trade
UI remains visually unchanged, and no active handoff, prepare button, buy/sell
CTA, API route call, fetch, localhost/bridge call, polling, Avanza/browser
control, real fill, order/review/confirm/submit behavior, credential/session
handling, or Supabase write was added.

Explicit internal/dev-only disabled action shell plan:
`docs/avanza-explicit-internal-disabled-action-shell-plan.md`
starts the next planning-only phase. A future shell may describe internal
preview state, but it must remain disabled by default, non-clickable, without an
`onClick` handler, and separate from API route calls, fetch, localhost/bridge
calls, Avanza/browser control, real fill, order behavior, credential/session
handling, and Supabase writes.

Pure explicit internal/dev-only disabled action shell model:
`lib/avanza-explicit-internal-disabled-action-shell.ts` now exists as
explicit-input model code only. It defaults to `action_shell_hidden` with
`actionShellEnabled: false`, keeps all execution and sensitive-state flags
locked, is not wired into Trade UI, does not import the disabled API route, and
adds no route call, fetch,
localhost/bridge call, Avanza/browser control, real fill, review, confirmation,
submit, order, credential/session handling, or Supabase write.

Explicit internal/dev-only disabled action shell fixtures and harness:
`lib/avanza-explicit-internal-disabled-action-shell-fixtures.ts`,
`components/execution/AvanzaExplicitInternalDisabledActionShellHarness.tsx`, and
the dev-only Avanza visual QA route section now render static action-shell
fixture states. This route visibility is fixture/model-only, unlinked from main
navigation, not wired into Trade UI, not connected to real selectedRecommendation
state, separate from the disabled API route, and still forbids route calls,
fetch, localhost/bridge calls, polling, Avanza/browser control, real fill,
review, confirmation, submit, order, credential/session handling, and Supabase
writes.

The visibility layer is closed in
`docs/avanza-explicit-internal-disabled-action-shell-visibility-phase-completion-checkpoint.md`.
The next planning phase is
`docs/avanza-passive-disabled-action-shell-component-plan.md`. That planned
component remains passive, prop-driven, disabled by default, non-clickable,
unwired from normal/default Trade UI, and still forbids API route calls, fetch,
localhost/bridge calls, Avanza/browser control, real fill, review,
confirmation, submit, order, credential/session handling, and Supabase writes.

The passive disabled action shell component now exists at
`components/execution/AvanzaPassiveDisabledActionShell.tsx`. It is still
display-only and receives a prebuilt action shell model as a prop. It is not
wired into Trade UI, rendered only through the isolated harness/dev QA fixture
route, not connected to real selectedRecommendation state, and adds no active
controls, button, `onClick`, `useEffect`, API route path, fetch, localhost/bridge call,
Avanza/browser control, real fill, review, confirmation, submit, order,
credential/session handling, or Supabase write.

The passive disabled action shell component safety audit is recorded in
`docs/avanza-passive-disabled-action-shell-component-safety-audit.md`. It
confirms the component and fixture route rendering remain display-only and do
not change the real selectedRecommendation preview boundary, Trade UI default
state, disabled API route, broker behavior, credential/session handling, or
Supabase write boundary.

The passive disabled action shell component phase is closed in
`docs/avanza-passive-disabled-action-shell-component-phase-completion-checkpoint.md`.
The next planning-only phase is
`docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-plan.md`. That
future plan remains separate from real selectedRecommendation reads and must
keep normal/default Trade UI visually unchanged, with no active controls, route
calls, fetch, Avanza/browser behavior, real fill, order behavior,
credential/session handling, or Supabase writes.

The hard-disabled Trade UI action shell metadata wiring phase has now added the
minimal model invocation in `app/trade-app.tsx`, still inside the existing
disabled/default-off branch only. It uses `actionShellEnabled: false` and
`mode: "hidden"`, does not render `AvanzaPassiveDisabledActionShell`, and does
not connect real selectedRecommendation state to action UI.

This remains separate from read-only real selectedRecommendation preview work:
no default preview enablement, no active controls, no route call, no fetch, no
localhost/bridge call, no polling, no Avanza/browser control, no fill, click,
review, final, submit, order behavior, credential/session handling, or Supabase
write was added.

The dedicated safety audit is recorded in
`docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-safety-audit.md`.
It confirms the action shell metadata wiring is isolated from real
selectedRecommendation preview work, remains hidden/default-off, and does not
render action shell UI or introduce route calls, fetch, bridge, browser, fill,
order, credential/session handling, or Supabase writes.

The hard-disabled Trade UI action shell metadata wiring phase is closed in
`docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-phase-completion-checkpoint.md`.
The next planning-only phase is `docs/avanza-guarded-fetch-intent-plan.md`.
That plan remains separate from real selectedRecommendation preview work and
must not add fetch, API route calls, active UI, Avanza/browser behavior, fill,
order, credential/session handling, or Supabase writes.

The guarded fetch intent phase now includes
`lib/avanza-guarded-fetch-intent.ts` as a pure explicit-input metadata helper.
It remains separate from read-only real selectedRecommendation preview work, is
not wired into Trade UI or the dev QA route, does not read real
selectedRecommendation state, and adds no fetch, API route call, localhost
call, bridge call, Avanza/browser control, fill, order behavior,
credential/session handling, or Supabase write.

The guarded fetch intent fixture visibility layer now includes
`lib/avanza-guarded-fetch-intent-fixtures.ts`,
`components/execution/AvanzaGuardedFetchIntentHarness.tsx`, and a
fixture/model-only dev QA route section. This remains separate from real
selectedRecommendation reads and does not wire into Trade UI, call the API
route, perform fetch, call localhost or bridge, poll, control Avanza/browser
state, fill, review, confirm, submit, handle credentials/sessions, or write
Supabase execution records.

The guarded fetch intent visibility layer is closed in
`docs/avanza-guarded-fetch-intent-visibility-phase-completion-checkpoint.md`.
The next planning-only phase is
`docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-plan.md`.
That plan remains separate from read-only real selectedRecommendation preview
work and must keep any future Trade UI fetch intent metadata invocation
hard-disabled, default-off, non-rendering in normal/default UI, non-fetching,
non-executing, and separate from credential/session handling and Supabase
writes.

The minimal hard-disabled Trade UI fetch intent metadata invocation is now
implemented in `app/trade-app.tsx` inside the existing
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` disabled/default-off branch
only. It keeps `fetchIntentEnabled: false`, uses `mode: "hidden"`, produces
`fetch_intent_hidden` metadata only, renders no fetch intent UI in
normal/default Trade UI, and remains separate from real selectedRecommendation
reads, API route calls, fetch, localhost/bridge calls, Avanza/browser control,
fill, order behavior, credential/session handling, and Supabase writes.

The focused safety audit for this hard-disabled metadata-only wiring is recorded
in `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-safety-audit.md`.

The hard-disabled Trade UI fetch intent metadata wiring phase is now closed in
`docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-phase-completion-checkpoint.md`.

The next planning-only phase is
`docs/avanza-disabled-local-only-manual-test-path-plan.md`. That plan remains
separate from read-only real selectedRecommendation preview work and must keep
any future disabled local-only manual test path non-fetching, non-executing,
disabled by default, internal/dev-only, and separate from credential/session
handling and Supabase writes.

The pure disabled local-only manual test path helper now exists at
`lib/avanza-disabled-local-only-manual-test-path.ts`. It remains model-only and
unwired, with no real selectedRecommendation read/render path, no Trade UI
fetch, no route call, no localhost/bridge call, no Avanza/browser control, no
fill or order behavior, and no Supabase execution write.

The disabled local-only manual test path fixture visibility layer now adds
static fixtures, an isolated harness, and a fixture/model-only dev QA route
section. It remains separate from read-only real selectedRecommendation preview
work and still adds no real selectedRecommendation read/render path, no Trade UI
fetch, no route call, no route path exposure, no localhost/bridge call, no
Avanza/browser control, no fill or order behavior, and no Supabase execution
write.

The disabled local-only manual test path visibility layer is closed in
`docs/avanza-disabled-local-only-manual-test-path-visibility-phase-completion-checkpoint.md`.
The next hard-disabled Trade UI manual test path metadata wiring phase is
planned in
`docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-plan.md`.
It remains separate from read-only real selectedRecommendation preview work,
must keep `manualTestPathEnabled` false by default, must render no manual test
path in normal/default UI, and must add no API route call, fetch, route path
exposure, localhost/bridge call, Avanza/browser control, real fill, order
behavior, credential/session handling, or Supabase writes.

The minimal hard-disabled manual test path metadata invocation now exists in
`app/trade-app.tsx` inside the existing disabled/default-off branch only. It is
not a real selectedRecommendation read/render path; it keeps
`manualTestPathEnabled: false`, uses `mode: "hidden"`, discards output with
`void hardDisabledManualTestPath`, references no route path, calls no API route,
performs no fetch, and adds no broker action.

The focused safety audit for this hard-disabled manual test path metadata wiring
is recorded in
`docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-safety-audit.md`.

The hard-disabled Trade UI manual test path metadata wiring phase completion is
recorded in
`docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-phase-completion-checkpoint.md`.

The disabled local-only chain readiness closeout is planned in
`docs/avanza-disabled-local-only-chain-readiness-closeout-plan.md`.

The disabled local-only chain readiness closeout checkpoint is recorded in
`docs/avanza-disabled-local-only-chain-readiness-closeout-checkpoint.md`.

The final global safety sweep is recorded in
`docs/avanza-disabled-local-only-chain-final-global-safety-sweep.md`.

The approval gate for any future disabled local-only chain progression is
recorded in `docs/avanza-disabled-local-only-chain-approval-gate.md`.

The final handoff summary and implementation index for the disabled local-only
Avanza chain is recorded in
`docs/avanza-disabled-local-only-chain-handoff-summary.md`.

The previous disabled local-only chain remains locked as the safety foundation.
A new explicit user-approved Sharp Semi Auto phase is now opened in
`docs/avanza-sharp-semi-auto-execution-agent-scope.md` and
`docs/ture-engine-execution-agent-contract.md`. The new phase allows planning
for local browser control, username/password login if logged out, BUY/SELL
limit form fill, result capture, and Ture registration while still forbidding
final order confirmation clicks, BankID bypass, credential logging,
cookie/session extraction, and production readiness claims. The Recommendation
Engine is the decision-maker, the Execution Agent is the broker-action
executor/preparer, and the Ture App is the registration, audit, and lifecycle
owner.

The first Sharp Semi Auto runtime foundation now exists at
`lib/avanza-local-browser-agent-runtime.ts`, with static fixtures in
`lib/avanza-local-browser-agent-runtime-fixtures.ts` and an isolated harness in
`components/execution/AvanzaLocalBrowserAgentRuntimeHarness.tsx`. It is rendered
on the dev-only Avanza visual QA route as fixture/model-only content.

This runtime layer models local browser runtime readiness only. It remains
non-executing: no Avanza navigation yet, no login yet, no credential handling
yet, no form fill yet, no API route call, no fetch, no order submission, no
final KÖP/SÄLJ click, no BankID automation/bypass, and no Supabase execution
write.

Login state detection is now modeled in
`lib/avanza-login-state-detector.ts`, and the secure credential provider
interface is now modeled in `lib/avanza-secure-credential-provider.ts`. Their
fixtures and combined harness are rendered on the dev-only Avanza visual QA
route as fixture/model-only content.

No actual credential access exists yet. No login exists yet. No Keychain access,
1Password CLI call, environment-variable read, credential material return,
cookies/session handling, Avanza navigation, form fill, order submission,
BankID automation/bypass, or Supabase write exists in this layer.
Username/password login remains allowed only after secure provider
implementation and explicit local-dev guard. BankID/MFA remains manual user
action only.

The local Playwright browser adapter foundation is now modeled separately in
`lib/avanza-local-playwright-browser-adapter.ts`, with static fixtures and an
isolated harness. It is visible on the dev-only Avanza visual QA route as
fixture/model-only content.

This does not change the read-only selectedRecommendation plan. No real
selectedRecommendation state is connected to browser control, no Trade UI
wiring is added, no browser is launched during render, no Avanza navigation or
login exists, no credential/cookie/session handling exists, no form fill/click
exists, no final KÖP/SÄLJ click exists, and no Supabase execution write exists.

The Avanza page/state detector now exists separately in
`lib/avanza-page-state-detector.ts`, with fixtures and an isolated harness. It
classifies explicit page snapshots/signals only and is visible on the dev-only
Avanza visual QA route as fixture/model-only content.

This does not connect real selectedRecommendation state to browser state. The
detector does not navigate, log in, handle credentials, read cookies, export
sessions, fill forms, click, submit orders, bypass BankID, or write Supabase
execution records. BankID/MFA remains manual-action only.

Sanitized real-world Avanza signal intake now exists in
`lib/avanza-sanitized-page-snapshot.ts`, with fixtures, an isolated harness, and
`docs/avanza-real-world-snapshot-capture-guide.md`.

This does not connect real selectedRecommendation state to browser state or
Trade UI. It only supports sanitized manual screenshot/DOM notes for future
detector and form-mapping accuracy. Sensitive material remains forbidden in
fixtures and docs, and no live navigation, login, credential handling, cookie
or session handling, form fill, click, order submission, BankID bypass, or
Supabase write exists.

## Avanza Real-World Login Signal Boundary

The read-only selectedRecommendation preview track can reference the sanitized
Avanza login signal pack only as planning context. The signal pack recognizes
safe login-flow text such as `Användarnamn och lösenord`, `Privatkund`,
`Företag`, `Logga in på företagswebben`, `Visa QR-kod`, and
`Öppna BankID på samma enhet`.

It does not read real selectedRecommendation state, does not wire Trade UI, does
not perform login, does not access credentials, does not fill forms, does not
click, does not navigate Avanza, does not automate or bypass BankID, and does
not write Supabase execution records.

## Execution Settings Profile Boundary

The Ture Avanza execution settings profile now models user-selected
`Privat`/`Företag`, username/password credential configuration, and secure
credential provider readiness. It may be referenced by future planning only.

It does not connect read-only selectedRecommendation state to login, browser
navigation, credential access, form fill, order behavior, settings persistence,
or Supabase writes. BankID remains forbidden for automation.

## Login Route Planner Boundary

The Avanza login route planner is now modeled separately in
`lib/avanza-login-route-planner.ts`, with fixtures and a dev QA harness. It can
use the execution settings profile, login/page state models, and sanitized login
signals to plan distinct `Privat` and `Företag` username/password routes.

This remains outside read-only selectedRecommendation preview wiring. BankID
options are manual-action only, and action steps are planned but not executable
yet. No actual navigation, login, credential handling, form fill, click,
cookies/session handling, order behavior, or Supabase write is added.

## Avanza Login Action Contract

Login action contract is now modeled in
`lib/avanza-login-action-contract.ts`,
`lib/avanza-login-action-contract-fixtures.ts`,
`components/execution/AvanzaLoginActionContractHarness.tsx`, and
`docs/avanza-login-action-contract.md`.

It is the bridge between route planning and future browser actions. Actions are
currently contract-only and non-executable. No credential material appears in
action output.

This does not change the read-only selectedRecommendation boundary: no actual
navigation, login, credential handling, cookie/session handling, form fill,
click behavior, API route call, fetch, order behavior, final KÖP/SÄLJ click, or
Supabase execution write is added.

## Avanza Login Dry-Run Executor Boundary

Login dry-run executor is now modeled in
`lib/avanza-login-dry-run-executor.ts`, with fixtures and an isolated harness.

It verifies that login action plans are internally coherent before any real
action execution and remains non-executing. It does not connect read-only
selectedRecommendation state to login, browser navigation, credential access,
form fill, click behavior, API routes, fetch, cookies/session handling, order
behavior, BankID automation/bypass, or Supabase writes.

## Avanza Login Mock Page Executor Boundary

Mock executor is now modeled in `lib/avanza-login-mock-page-executor.ts`, with
fixtures and an isolated harness.

It can simulate private/company login action sequences against an in-memory
mock page model. It remains mock-only and non-browser. It still does not access
credentials.

This does not connect read-only selectedRecommendation state to login, browser
navigation, credential access, real form fill, real click behavior, API routes,
fetch, cookies/session handling, order behavior, BankID automation/bypass, or
Supabase writes.

## Avanza Login Local-Dev Executor Boundary

Local-dev executor contract is now modeled in
`lib/avanza-login-local-dev-executor.ts`, with fixtures and an isolated
harness.

It can execute through explicitly injected mock/page dependencies only. It does
not resolve credentials yet, does not run by default, and is not wired into
Trade UI. It uses credential references only.

This does not connect read-only selectedRecommendation state to login, browser
navigation orchestration, real credential provider access, raw credential
return, cookies/session handling, order behavior, final KÖP/SÄLJ click, API
route calls from Trade UI, fetch from Trade UI, or Supabase writes.

## macOS Keychain credential provider contract

The macOS Keychain provider contract now exists at
`lib/avanza-macos-keychain-credential-provider.ts`.

It provides credential references for local-dev login work while preserving the
read-only selectedRecommendation preview boundary. It does not expose raw
credential material. No Keychain command runs at import/render/test time, no
selectedRecommendation preview state is enabled by default, and the provider is
not wired into Trade UI yet. It remains fixture/mock-only on the isolated dev
QA route and does not add bridge calls, localhost fetch, BankID automation, or
order submission.

It is not wired into Trade UI yet.

## Avanza login credential resolution bridge

Credential resolution bridge now exists at
`lib/avanza-login-credential-resolution-bridge.ts`.

It prepares safe local-dev login execution while preserving the read-only
selectedRecommendation preview boundary. It does not expose credential material.
It is not wired into Trade UI yet. No preview-state behavior, actual Avanza
login, cookie/session handling, BankID automation, order behavior, or Supabase
execution write is added.

## Avanza local-dev credential executor with runtime bundle

Local-dev credential executor now exists at
`lib/avanza-login-local-dev-credential-executor.ts`.

It can use a private runtime credential bundle with injected dependencies. It is
still not wired into Trade UI. It does not include order behavior.

## Avanza local Playwright page action binding

Playwright page action binding now exists at
`lib/avanza-local-playwright-page-action-binding.ts`.

It can supply injected dependencies to the local-dev credential executor. It is
still not wired to Trade UI or any active API route. It does not include order
behavior.

## Avanza isolated login smoke test

Isolated login smoke test planning now exists at
`lib/avanza-isolated-login-smoke-test.ts`.

It is the first safe wrapper for future real local-dev login testing. It
remains disconnected from read-only selectedRecommendation preview, remains
disconnected from Trade UI, disconnected from API routes, and disconnected from
order flow. It only models explicit local-dev/manual terminal/env opt-in
readiness and safe reports; it does not expose raw credentials, read
cookies/session, automate BankID, submit orders, or click final KÖP/SÄLJ.

## Avanza isolated login smoke test runner

Hard-gated smoke test runner now exists at
`lib/avanza-isolated-login-smoke-test-runner.ts`.

It is the first explicit local terminal entrypoint model. It remains
disconnected from read-only selectedRecommendation preview, disconnected from
Trade UI, disconnected from API routes, and disconnected from order flow. It
uses injected dependencies only and preserves the same no-credential-output,
no-cookie/session, no-BankID-automation, no-order, and no-final-click
boundaries.

## Terminal Login Smoke Script Scaffold Relationship

The terminal-only script scaffold now exists at
`scripts/avanza-login-smoke-test.local.ts`.

It remains disconnected from read-only selectedRecommendation preview,
disconnected from Trade UI, disconnected from API routes, and disconnected from
order flow. It is default-safe and hard-gated, and it does not change the
read-only preview boundary.

## Passive Ture Settings UI Scaffold Relationship

A passive Ture Settings UI scaffold now exists at
`components/execution/AvanzaExecutionSettingsProfilePanel.tsx`.

It remains separate from read-only real selectedRecommendation preview work. It
models account type and credential readiness only, uses local component state
only, does not read or render real selectedRecommendation state, does not store
or display raw credentials, and does not derive preview state.

It does not execute login, smoke tests, browser actions, API calls, orders, or
final KÖP/SÄLJ.

## Avanza Order Flow Signal and Field Contract Boundary

Real-world Avanza order flow signals and the BUY/SELL order ticket field
contract now exist as fixture/model-only order-side layers.

The order ticket field contract remains fixture/model-only.

They remain separate from read-only real selectedRecommendation preview work.
The signal pack is based on sanitized user-provided BUY-flow material, with
SELL modeled from the same structure with sell labels. The field contract
supports limit orders only and models BUY/SELL preparation without deriving
preview state or activating order behavior.

No Trade UI wiring, API route wiring, real Avanza form fill, click behavior,
order submission, confirmation capture, final KÖP/SÄLJ click, or Supabase
execution write is added. Final human confirmation remains mandatory.

This phase does not activate order behavior.

## Instrument To Order Handoff Chain

The pre-submit order chain is now modeled end-to-end in `lib/avanza-instrument-to-order-handoff-chain.ts`.

It links execution package -> instrument search -> verification -> order ticket field/action path -> stop before final KÖP/SÄLJ. This still does not activate execution. Final human confirmation remains mandatory.

## Instrument Search Before Order Ticket Boundary

Instrument discovery/search now exists as a model before order ticket preparation.

The execution package flow is now: recommendation/position -> search instrument -> verify instrument -> locate KÖP/SÄLJ -> order ticket field/action contract -> review -> stop before final KÖP/SÄLJ.

This remains separate from read-only real selectedRecommendation preview work.
No real selectedRecommendation state is connected to instrument search in this
phase.

No real search execution, Avanza navigation, click behavior, BUY/SELL entry
click, order submission, Trade UI wiring, API route wiring, final KÖP/SÄLJ
click, or Supabase execution write is added. Final human confirmation remains
mandatory.

## Avanza Order Ticket Action Contract Boundary

The Avanza order ticket action contract now exists as a fixture/model-only
order-side layer.

It bridges order ticket field mapping to future order-fill execution by
modeling BUY/SELL limit-order preparation actions. It remains separate from
read-only real selectedRecommendation preview work.

It is the bridge between order field mapping and future order-fill execution.

No real selectedRecommendation state is connected to this action contract in
this phase. No Trade UI wiring, API route wiring, real Avanza form fill, click
behavior, order submission, confirmation capture, final KÖP/SÄLJ click, or
Supabase execution write is added. Final human confirmation remains mandatory.

This phase does not activate order behavior.

## Instrument To Order Dry-Run Executor Boundary

The chain now has a dry-run validation layer in
`lib/avanza-instrument-to-order-dry-run-executor.ts`.

The dry-run layer remains separate from real selectedRecommendation reading. It
uses explicit model/fixture input only and still does not activate execution.
Final human confirmation remains mandatory.

## Instrument To Order Mock Executor Boundary

The chain now has a mock execution layer after dry-run in
`lib/avanza-instrument-to-order-mock-executor.ts`.

The mock layer remains separate from real selectedRecommendation reading and
uses simulated page state only. This still does not activate real Avanza
execution. Final human confirmation remains mandatory.

## Settlement Note / Order Information Signals Boundary

Settlement note signals now exist as a post-trade reconciliation foundation.
Exact courtage, FX/exchange rate, settlement amount, and realized execution
cost are future extraction targets from Avanza avräkningsnota after manual
execution. This does not connect read-only selectedRecommendation state to
post-trade navigation, PDF/download/read, OCR, value extraction,
reconciliation writes, Trade UI wiring, API route wiring, cookie/session
handling, BankID automation, or Supabase writes.

Settlement route/action contracts now exist. They prepare future note
retrieval/extraction by modeling the route from trade reference to matching
transaction and Avräkningsnota. They do not connect read-only
selectedRecommendation preview to reconciliation or writes.

## Settlement Extraction Schema And Reconciliation Mapping

Settlement extraction schema and reconciliation mapping now exist. Exact
cost/FX reconciliation is modeled but not applied.

The schema models future avräkningsnota targets for courtage, FX/växelkurs,
settlement amount, trade date, settlement date, quantity, price, and currency.
The mapping previews future execution, trade result, statistics/PnL, and audit
metadata targets.

This still does not activate document reading, OCR, value extraction,
reconciliation writes, Supabase writes, Trade UI wiring, API route wiring, or
read-only selectedRecommendation preview writes.

## Settlement Reconciliation Dry-Run Follow-Up

Settlement reconciliation now has a dry-run validation layer. It is
fixture/model-only and does not connect real selectedRecommendation state to
post-trade reconciliation.

Exact cost/FX reconciliation remains modeled only. No document reading,
PDF/download/read, OCR, value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring is active.

## Settlement Reconciliation Mock Executor Boundary

Settlement reconciliation now has a mock execution layer after dry-run. It is
fixture/model-only and does not connect real selectedRecommendation state to
post-trade reconciliation.

The mock layer simulates transaction matching, Avräkningsnota availability,
masked/synthetic courtage, masked/synthetic FX/växelkurs, masked/synthetic
settlement amount, reconciliation preview, and manual review. It still does
not activate real navigation, document reading, PDF/download/read, OCR, real
value extraction, reconciliation writes, Supabase writes, Trade UI wiring, or
API route wiring. Exact cost/FX reconciliation remains modeled/mock-only.
