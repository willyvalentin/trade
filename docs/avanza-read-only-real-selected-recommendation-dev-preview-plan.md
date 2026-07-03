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
controls, and locked gate state. It is not wired into Trade UI or the dev route
and does not derive real preview state.

## Read-Only Derivation Decision Checkpoint

`docs/avanza-read-only-selected-recommendation-derivation-decision-checkpoint.md`
captures the decision model, fixture, and isolated harness phase before route
wiring or real derivation. It confirms that `no_input` uses fixture fallback,
blocked and invalid states block derivation/rendering, `derivation_allowed`
exists only as fixture/model state, the harness remains isolated, and no real
selectedRecommendation state or preview state is read, derived, or rendered.

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
7. Add optional route section behind explicit dev-only read-only guard.
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

## References

- [Avanza isolated dev visual QA route phase completion checkpoint](avanza-isolated-dev-visual-qa-route-phase-completion-checkpoint.md)
- [Avanza isolated dev visual QA route final checkpoint](avanza-isolated-dev-visual-qa-route-final-checkpoint.md)
- [Avanza read-only selectedRecommendation derivation plan](avanza-read-only-selected-recommendation-derivation-plan.md)
- [Avanza read-only selectedRecommendation derivation decision checkpoint](avanza-read-only-selected-recommendation-derivation-decision-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
