# Avanza Read-Only SelectedRecommendation Adapter/Derived-Preview Integration Plan

Date: 2026-07-03

Plan status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_planned_no_wiring`

Integration decision model status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_model_added`

Integration decision fixture status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_fixtures_added`

Integration decision harness status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_harness_added`

Integration decision checkpoint status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_integration_decision_checkpoint_added`

## Purpose

Plan a future read-only selectedRecommendation dev preview integration that can
safely pass an explicitly provided selectedRecommendation-like input through
the existing selectedRecommendation adapter and derived-preview helper.

The future integration should:

- accept explicit selectedRecommendation-like input only
- use the existing selectedRecommendation adapter after safety review
- use the existing derived-preview helper after safety review
- produce read-only preview state
- render preview state only behind explicit dev/read-only guards
- keep all controls disabled
- keep the pre-activation gate locked
- keep total-read advisory

This plan is not execution and does not enable any handoff behavior.

## Strict Phase Boundary

This phase is planning only.

This action does not:

- change app code
- change `app/trade-app.tsx`
- change `app/dev/avanza-visual-qa/page.tsx`
- wire adapter/derived-preview integration
- read real selectedRecommendation state
- render real selectedRecommendation preview
- derive real preview state
- render real preview state
- add route behavior
- add Trade UI behavior
- add runtime environment config
- change `.env.local`

The existing dev route remains fixture/model-only, and selectedRecommendation
preview remains disabled by default in Trade UI.

## Existing Safe Candidates To Review

Before implementation, review these existing pure candidates:

- `lib/avanza-selected-recommendation-adapter.ts`
- `lib/avanza-selected-recommendation-derived-preview-state.ts`
- `lib/avanza-selected-recommendation-preview-state.ts`
- `lib/avanza-selected-recommendation-preview-integration-guard.ts`
- `lib/avanza-read-only-selected-recommendation-derivation-decision.ts`

The review must confirm the candidate helpers remain pure, side-effect free,
and safe for read-only dev preview use.

## Required Integration Path

Future integration must follow this path:

1. Explicit selectedRecommendation-like input.
2. Read-only preview guard decision.
3. Derivation decision.
4. Adapter normalization.
5. Derived preview state builder.
6. Read-only presentation state.
7. Disabled controls and gate locked presentation.

No step may call a bridge, fetch localhost, poll, execute, or expose active
handoff controls.

## Required Failure States

Future integration must model these failure states:

- `no_input`
- `blocked_guard`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_allowed`

Every failure state must be safe-by-default and must fall back to no-preview or
fixture-only display when read-only preview cannot be produced.

## Pure Integration Decision Model

`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision.ts`
adds the pure decision model for whether an explicit selectedRecommendation-like
input may proceed to future adapter/derived-preview integration review.

The model accepts only explicit inputs:

- read-only derivation decision
- selectedRecommendation-like input, nullable or unknown
- optional integration source label

The model can return:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_review_required`
- `integration_allowed`

Current allowed input behavior is conservative: a valid input with an allowed
derivation decision returns `adapter_review_required`, not live normalization.
It can mark adapter review as available in model state, but it does not call
the selectedRecommendation adapter, does not call the derived-preview builder,
does not derive real preview state, and does not render real preview state.

All decisions keep bridge calls, localhost fetches, polling, execution, enabled
controls, and unlocked gates forbidden.

## Integration Decision Fixtures

`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-fixtures.ts`
adds reusable static fixture states for the pure integration decision model.

The fixtures cover:

- `no_input`
- `blocked_derivation_decision`
- `invalid_input`
- `adapter_review_required`
- `integration_allowed`

The `no_input`, blocked, invalid, and adapter-review fixtures are built from
the pure decision model. The `integration_allowed` fixture is a future
model-only state that can mark normalization, derived-preview builder access,
and read-only preview rendering as future capabilities only. It still does not
call the selectedRecommendation adapter, does not call the derived-preview
builder, does not derive real preview state, and does not render real preview
state.

All fixtures keep bridge calls, localhost fetches, polling, execution, enabled
controls, and unlocked gates forbidden. They are not wired into Trade UI or the
dev route.

## Integration Decision Harness

`components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness.tsx`
adds an isolated prop-driven harness for the integration decision fixtures.

The harness renders:

- fixture label
- integration decision status
- source mode
- adapter review flag
- normalization flag
- derived-preview builder flag
- read-only preview render flag
- fixture fallback flag
- bridge, localhost, polling, and execution flags
- disabled controls
- locked gate

The harness is fixture-only and passive. It is not wired into Trade UI or the
main Trade UI. It is rendered in the isolated dev-only visual QA route as a
fixture/model-only section. It does not fetch, call the bridge, read app state,
read real selectedRecommendation state, call the adapter, call the
derived-preview builder, derive real preview state, render real preview state,
expose active controls, or enable execution.

## Integration Decision Checkpoint

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-checkpoint.md`
summarizes the completed integration decision model, fixture, and isolated
harness phase before any actual adapter/derived-preview calls.
It records that `no_input` uses fixture fallback, blocked and invalid states
block integration, `adapter_review_required` and `integration_allowed` exist
only as fixture/model states, the harness is rendered on the dev-only visual QA
route as a fixture/model-only section and not rendered in Trade UI, the adapter
and derived-preview builder are not called, and no real selectedRecommendation
or preview state is read, derived, or rendered.

## Allowed Future Behavior

Allowed only after explicit dev/read-only guard approval:

- use existing pure adapter/derived-preview helpers after safety review
- derive read-only preview state from explicit input only
- render read-only preview in an isolated dev-only QA route section only
- show source label as `read_only_selected_recommendation_dev_preview`
- fall back to fixture/no-preview when blocked or invalid
- keep controls disabled
- keep the pre-activation gate locked
- keep total-read advisory

## Forbidden Behavior

Forbidden:

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

## Future Test Requirements

Future implementation tests must prove:

- default Trade UI remains `static_fixture` and disabled
- selectedRecommendation preview remains disabled by default in Trade UI
- dev route remains unlinked from main navigation
- route section remains read-only
- missing selectedRecommendation produces `no_input` or no-preview
- invalid selectedRecommendation produces invalid/blocked state
- valid selectedRecommendation produces read-only preview state
- adapter failure is handled safely
- derived-preview failure is handled safely
- controls remain disabled
- pre-activation gate remains locked
- total-read remains advisory
- no bridge/local fetch/polling/execution strings appear
- no active handoff button exists
- no trigger/fill/click/review/final/submit/order behavior appears

## Recommended Implementation Sequence

Recommended sequence:

1. Add a pure adapter/derived-preview integration decision model.
   Done in
   `lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision.ts`.
2. Add fixtures for `no_input`, invalid, `adapter_rejected`,
   `derived_preview_failed`, and allowed states. Initial fixture coverage is
   added in
   `lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-fixtures.ts`.
3. Add an isolated harness. Done in
   `components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness.tsx`.
4. Add a route section as fixture/model-only or explicit input-only. Done as a
   fixture/model-only section on `app/dev/avanza-visual-qa/page.tsx`.
5. Add a checkpoint before reading any real route or app state. Done in
   `docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-route-section-checkpoint.md`.

No step should enable execution, fill, trigger, bridge calls, localhost
fetches, polling, active controls, or production readiness claims.

## Current Non-Implementation

Current state remains:

- no app code changes
- no `app/trade-app.tsx` changes
- no adapter/derived-preview integration wiring
- no selectedRecommendation adapter call
- no derived-preview builder call
- adapter/derived-preview integration decision fixtures are rendered only in the
  isolated dev route as fixture/model-only content
- no adapter/derived-preview integration decision harness wired into Trade UI
- no real selectedRecommendation read
- no real selectedRecommendation rendering
- no real preview state derivation
- no real preview state rendering
- existing dev route remains fixture/model-only
- route remains unlinked from main navigation
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no Supabase execution write

## Route Section Checkpoint

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-route-section-checkpoint.md`
summarizes the isolated dev-only visual QA route section that renders the
adapter/derived-preview integration decision harness. It confirms the section
is fixture/model-only, the route remains unlinked from main navigation,
`app/trade-app.tsx` was not changed, the harness is not rendered in Trade UI,
the adapter and derived-preview builder are not called, no real
selectedRecommendation state is read or rendered, and no real preview state is
derived or rendered.

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md`
closes this adapter/derived-preview integration decision route-visible
fixture/model phase. It records the completed model, fixtures, harness, and
route section before any future adapter safety review or actual
adapter/derived-preview invocation.

`docs/avanza-selected-recommendation-adapter-safety-review-plan.md` plans the
next adapter safety review step. It names the adapter, derived-preview helper,
preview state, integration guard, and integration decision model as review
targets and keeps the review planning-only: no adapter call, no
derived-preview builder call, no real selectedRecommendation read, and no real
preview derivation.

`docs/avanza-selected-recommendation-adapter-safety-static-audit-checkpoint.md`
adds the first static audit coverage for those review targets. It confirms the
target files contain no forbidden live behavior patterns and that the dev route
and Trade UI boundaries remain fixture/model-only and default-safe for this
phase.

`docs/avanza-selected-recommendation-adapter-safety-review-result-checkpoint.md`
records the static audit result and decision boundary before any actual adapter
or derived-preview invocation. It confirms the audit does not execute adapter
normalization, does not execute the derived-preview builder, does not prove all
future inputs are safe, and does not enable route or Trade UI integration.

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md`
plans the next pure wrapper boundary for adapter normalization plus
derived-preview creation. It remains planning-only and requires explicit input,
explicit integration decision input, no app or route state reads, no runtime env
reads, no route or Trade UI wiring, disabled controls, locked gate, and no
bridge/local fetch/polling/execution behavior.

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-phase-completion-checkpoint.md`
closes this phase as complete for planning, decision, route-visible
fixture/model status, static audit, safety review result, and wrapper planning
before any future pure wrapper implementation.

## References

- [Avanza read-only selectedRecommendation adapter/derived-preview integration phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper plan](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md)
- [Avanza selectedRecommendation adapter safety review result checkpoint](avanza-selected-recommendation-adapter-safety-review-result-checkpoint.md)
- [Avanza selectedRecommendation adapter safety static audit checkpoint](avanza-selected-recommendation-adapter-safety-static-audit-checkpoint.md)
- [Avanza selectedRecommendation adapter safety review plan](avanza-selected-recommendation-adapter-safety-review-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration decision phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration decision route section checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-route-section-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration decision checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-checkpoint.md)
- [Avanza read-only selectedRecommendation derivation decision route section checkpoint](avanza-read-only-selected-recommendation-derivation-decision-route-section-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
