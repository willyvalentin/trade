# Avanza Read-Only SelectedRecommendation Derivation Plan

Date: 2026-07-03

Plan status:
`avanza_read_only_selected_recommendation_derivation_planned_no_wiring`

Decision model status:
`avanza_read_only_selected_recommendation_derivation_decision_model_added`

Decision fixture status:
`avanza_read_only_selected_recommendation_derivation_decision_fixtures_added`

Decision harness status:
`avanza_read_only_selected_recommendation_derivation_decision_harness_added`

Decision checkpoint status:
`avanza_read_only_selected_recommendation_derivation_decision_checkpoint_added`

## Purpose

Plan the next phase for actual read-only selectedRecommendation derivation in a
dev preview context.

The purpose is to:

- read a real selectedRecommendation only in an explicitly guarded
  dev-only/read-only context
- pass that selectedRecommendation through the existing adapter and derived
  preview pipeline
- render the resulting preview state as read-only
- keep controls disabled
- keep the pre-activation gate locked
- keep total-read advisory

This plan is not execution, not fill behavior, and not route or Trade UI wiring.

## Strict Phase Boundary

This phase is planning only.

This action does not:

- change app code
- change `app/trade-app.tsx`
- change `app/dev/avanza-visual-qa/page.tsx`
- read real selectedRecommendation state
- derive real preview state
- render real selectedRecommendation preview
- add route behavior
- add Trade UI behavior
- add runtime environment config
- change `.env.local`

The existing dev route remains fixture/model-only, and selectedRecommendation
preview remains disabled by default in Trade UI.

## Required Future Input Contract

Future derivation must use an explicit selectedRecommendation source.

The input contract must require:

- selectedRecommendation source is explicit and guarded
- missing selectedRecommendation falls back to blocked/no-preview state
- invalid selectedRecommendation falls back to blocked/no-preview state
- non-buy or unsupported direction remains blocked downstream
- missing ticker remains blocked downstream
- missing quantity or price remains advisory downstream
- no broker credentials
- no session credentials
- no account credentials
- no BankID, cookie, localStorage, or sessionStorage handling
- no Avanza bridge payload submission

The input must be treated as preview data only.

## Required Derivation Path

Future read-only derivation must follow this path:

1. selectedRecommendation input.
2. Adapter normalization through the existing selectedRecommendation adapter.
3. Derived preview state builder.
4. Read-only preview state.
5. Disabled controls and locked gate presentation.

The preview source label may be
`read_only_selected_recommendation_dev_preview` or a similar explicit
read-only/dev-only source string.

## Required Guard Chain

Future implementation must pass these guard layers before any read-only
derivation can render:

1. Dev-only route/access guard.
2. Read-only selectedRecommendation preview guard.
3. selectedRecommendation input validation.
4. Adapter/derived-preview safety validation.
5. Disabled-controls/gate-locked presentation guard.

Every guard layer must continue to forbid bridge calls, localhost fetches,
polling, execution, active controls, and production readiness claims.

## Pure Derivation Decision Model

`lib/avanza-read-only-selected-recommendation-derivation-decision.ts` adds the
pure decision model for whether an explicit selectedRecommendation-like input
could be used for read-only dev preview derivation.

The model accepts only explicit inputs:

- read-only selectedRecommendation dev preview guard decision
- selectedRecommendation-like input, nullable or unknown
- optional source label

Default/no input returns `status: no_input`, `sourceMode: fixture_only`, cannot
read input, cannot derive preview state, cannot render read-only preview, and
can use fixture fallback. A blocked guard returns `blocked`. Invalid input
returns `invalid_input`. An allowed guard with a preview-safe ticker or symbol
may return `derivation_allowed` as model state only.

All decision states keep bridge calls, localhost fetches, polling, execution,
enabled controls, and unlocked gates forbidden. The model does not import app
code, does not import the dev route, does not read React state, does not read
environment variables, does not fetch, does not call the bridge, and does not
call the adapter or derived preview builder yet.

## Derivation Decision Fixtures

`lib/avanza-read-only-selected-recommendation-derivation-decision-fixtures.ts`
adds reusable static fixture states for the pure decision model.

The fixtures cover:

- `no_input`
- `blocked_guard`
- `invalid_input`
- `derivation_allowed`

The `no_input` fixture returns `status: no_input`, `sourceMode:
fixture_only`, can use fixture fallback, and cannot derive or render read-only
preview. The blocked and invalid fixtures cannot derive or render. The
`derivation_allowed` fixture may model input reads, preview derivation, and
read-only preview rendering, but still forbids bridge calls, localhost fetches,
polling, execution, enabled controls, and unlocked gates.

The fixtures are pure and are not wired into Trade UI or the dev route. They do
not read app or route state, do not call the adapter or derived-preview builder,
and do not derive real preview state.

## Derivation Decision Harness

`components/execution/AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness.tsx`
adds an isolated prop-driven harness for the derivation decision fixtures.

The harness renders:

- fixture label
- decision status
- source mode
- input read permission
- preview derivation permission
- read-only preview render permission
- fixture fallback permission
- bridge, localhost, polling, and execution flags
- disabled controls
- locked gate

The harness is fixture-only and passive. It is not wired into Trade UI or the
dev route, does not read app state, does not read real selectedRecommendation
state, does not call the adapter or derived-preview builder, does not derive
real preview state, and does not expose active controls.

## Derivation Decision Checkpoint

`docs/avanza-read-only-selected-recommendation-derivation-decision-checkpoint.md`
summarizes the completed decision model, fixtures, and isolated harness phase
before any route wiring or real derivation. It records that `no_input` uses
fixture fallback, `blocked_guard` and `invalid_input` block derivation and
rendering, `derivation_allowed` exists only as fixture/model state, the harness
is not rendered in `app/trade-app.tsx` or
`app/dev/avanza-visual-qa/page.tsx`, and no real selectedRecommendation or
preview state is read, derived, or rendered.

## Allowed Future Behavior

Allowed only after explicit guard approval:

- derive preview state from real selectedRecommendation in dev-only/read-only
  mode
- show source label as `read_only_selected_recommendation_dev_preview`
- render a read-only preview panel
- show blocked/no-preview state when input is missing
- show blocked/no-preview state when input is invalid
- keep controls disabled
- keep the pre-activation gate locked
- keep total-read advisory

## Forbidden Behavior

Forbidden:

- production/default enablement
- main Trade UI activation by default
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

- default Trade UI remains disabled and `static_fixture`
- dev route remains unlinked from main navigation
- guard harness remains fixture/model-only unless separately updated
- read-only derivation only happens behind explicit guard
- missing selectedRecommendation renders blocked/no-preview
- invalid selectedRecommendation renders blocked/no-preview
- valid selectedRecommendation renders read-only preview
- controls remain disabled
- pre-activation gate remains locked
- total-read remains advisory
- no bridge/local fetch/polling/execution strings appear
- no active handoff button exists
- no trigger/fill/click/review/final/submit/order behavior appears

## Recommended Implementation Sequence

Recommended sequence:

1. Add a pure derivation decision model. Done in
   `lib/avanza-read-only-selected-recommendation-derivation-decision.ts`.
2. Add fixtures for missing, invalid, and valid selectedRecommendation
   derivation cases. Done in
   `lib/avanza-read-only-selected-recommendation-derivation-decision-fixtures.ts`.
3. Add an isolated derivation harness. Done in
   `components/execution/AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness.tsx`.
4. Add a dev route section behind explicit read-only guard.
5. Add a checkpoint before any broader Trade UI integration.

No step should enable execution, fill, trigger, bridge calls, localhost fetches,
polling, active controls, or production readiness claims.

## Current Non-Implementation

Current state remains:

- no code wiring
- no real selectedRecommendation read
- no real selectedRecommendation rendering
- no real preview state derivation
- existing dev route remains fixture/model-only
- route remains unlinked from main navigation
- `app/trade-app.tsx` is unchanged
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no Supabase execution write

## References

- [Avanza read-only selectedRecommendation dev preview route section checkpoint](avanza-read-only-selected-recommendation-dev-preview-route-section-checkpoint.md)
- [Avanza read-only selectedRecommendation derivation decision checkpoint](avanza-read-only-selected-recommendation-derivation-decision-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
