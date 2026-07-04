# Avanza Real SelectedRecommendation Read-Only Input Plan

Date: 2026-07-04

Plan status:
`avanza_real_selected_recommendation_read_only_input_plan_added`

Guard model status:
`avanza_real_selected_recommendation_read_only_input_guard_model_added`

Guard fixture status:
`avanza_real_selected_recommendation_read_only_input_guard_fixtures_added`

Guard harness status:
`avanza_real_selected_recommendation_read_only_input_guard_harness_added`

Guard route section plan status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_plan_added`

Guard route section pre-implementation checkpoint status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_pre_implementation_checkpoint_added`

Guard route section implementation status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_rendered_fixture_model_only`

Guard route section checkpoint status:
`avanza_real_selected_recommendation_read_only_input_guard_route_section_checkpoint_added`

Read-only input validation model status:
`avanza_real_selected_recommendation_read_only_input_validation_model_added`

Read-only derivation plan status:
`avanza_real_selected_recommendation_read_only_derivation_plan_added`

Read-only derivation pre-implementation checkpoint status:
`avanza_real_selected_recommendation_read_only_derivation_pre_implementation_checkpoint_added`

## Purpose

This plan defines a future phase for safely introducing a real
selectedRecommendation input path in a dev-only/read-only context.

The purpose is to allow an explicitly guarded selectedRecommendation-like input
to be evaluated as input only before any later read-only derivation model step.

This plan is:

- read-only only
- dev-only only
- no execution
- no bridge
- no Avanza
- no Trade UI default enablement
- no production/default enablement

## Strict Phase Boundary

The current implementation includes a pure explicit-input validation model, but
still does not implement real selectedRecommendation input reading from app or
route state.

No app or route code changes are authorized by this plan:

- no app code changes
- no `app/trade-app.tsx` changes
- no dev route changes
- no Trade UI changes
- no real selectedRecommendation read yet
- no real selectedRecommendation render yet
- no real preview state derivation yet
- no real app/route preview state render yet

`lib/avanza-real-selected-recommendation-read-only-input-validation.ts` accepts
only explicit selectedRecommendation-like input passed to it. It does not read
Trade UI state, route state, React state, browser storage, runtime env, network,
or Supabase state, and it does not call adapter or derived-preview helpers.

The existing static-fixture derived-preview phase remains complete and safe:

- previewState is produced only for `read_only_preview_ready` static fixture
  output
- wrapper harness remains fixture/model-only
- dev QA route remains fixture/model-only and unlinked
- no real selectedRecommendation state is read or rendered
- no real app/route preview state is derived or rendered
- controls remain disabled
- pre-activation gate remains locked

## Allowed Future Behavior

A future implementation may add an explicitly guarded selectedRecommendation
input model.

Allowed future behavior:

- explicit dev/read-only input source
- explicitly guarded selectedRecommendation input
- pure validation of explicit selectedRecommendation-like input
- safe normalized input summary for valid read-only input only

Implemented validation behavior:

- no explicit input returns `no_input`
- blocked guard returns `guard_blocked`
- invalid primitive or missing required safe fields returns `invalid_input`
- valid explicit input returns `valid_read_only_input`
- valid output may proceed to future adapter normalization and read-only
  derivation in model state only
- bridge/local fetch/poll/execution remain false
- controls remain disabled
- pre-activation gate remains locked
- missing input returns `no_input`
- invalid input returns `invalid_input`
- blocked guard returns `blocked`
- valid input may proceed to a read-only derivation decision model later
- all controls remain disabled
- pre-activation gate remains locked
- total-read remains advisory

The allowed path is input classification only. It does not authorize adapter
normalization, derived-preview invocation from real input, route rendering of
real selectedRecommendation preview, or Trade UI rendering of real
selectedRecommendation preview.

`docs/avanza-real-selected-recommendation-read-only-derivation-plan.md`
defines the next planned phase. It allows only a future pure helper where
explicit input must be guard-approved and validation-approved before adapter
normalization, and derived-preview generation may run only after adapter
normalization succeeds. That plan remains planning-only and does not implement
derivation.

`docs/avanza-real-selected-recommendation-read-only-derivation-pre-implementation-checkpoint.md`
records the go/no-go boundary before implementing that helper. It permits only
a pure explicit-input derivation helper, keeps Trade UI and dev route wiring
forbidden, and requires bridge/local/poll/execution false with controls
disabled and gate locked.

## Forbidden Behavior

Forbidden for this phase and any future implementation under this plan:

- no production/default enablement
- no selectedRecommendation preview in default Trade UI
- no active handoff button
- no bridge calls
- no localhost fetch
- no polling
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution writes
- no runtime env config
- no route link from main navigation
- no production readiness claim
- no execution readiness claim

## Required Future Guard Chain

Any future real selectedRecommendation read-only input implementation must pass
through these guard layers:

1. dev-only route/access guard
2. real selectedRecommendation input guard
3. input validation
4. read-only derivation decision
5. wrapper decision
6. disabled-controls/gate-locked presentation guard

Each guard must keep bridge calls, localhost fetches, polling, and execution
forbidden.

## Required Future Input Contract

Future input must be explicit selectedRecommendation-like input only.

Required input contract:

- explicit selectedRecommendation-like input only
- no app-global implicit reads
- no route implicit reads
- no process.env dependency
- no network/fetch
- no broker fields
- no account fields
- no session fields
- no credentials
- no BankID/cookie/storage fields

The input contract may include preview-safe fields only, such as identifier,
ticker/symbol, display name, side/direction, entry/limit price, and quantity or
position sizing fields when already available and UI-safe.

## Read-Only Input Guard Model

`lib/avanza-real-selected-recommendation-read-only-input-guard.ts` adds the
pure guard model for the first real selectedRecommendation input boundary.

Default behavior:

- `status: hidden`
- `sourceMode: fixture_only`
- cannot read real selectedRecommendation
- cannot validate real input
- cannot proceed to read-only derivation
- can use fixture fallback
- cannot call bridge
- cannot fetch localhost
- cannot poll
- cannot execute
- controls disabled
- gate locked

An explicit dev/read-only config may return `read_only_input_allowed` with
`sourceMode: real_selected_recommendation_read_only`. That model-only state may
allow reading and validating future real selectedRecommendation input and may
allow proceeding to a later read-only derivation decision. It still forbids
bridge calls, localhost fetches, polling, execution, enabled controls, and
unlocked gates.

The guard is not wired into Trade UI or the dev route. It does not read real
selectedRecommendation state, does not call any adapter, and does not call any
derived-preview builder.

## Read-Only Input Guard Fixtures

`lib/avanza-real-selected-recommendation-read-only-input-guard-fixtures.ts`
adds reusable static fixture states for the guard model.

The fixtures cover:

- `hidden_default`
- `blocked_production_forbidden`
- `read_only_input_allowed`

The hidden fixture remains `fixture_only`, cannot read real
selectedRecommendation, cannot validate input, cannot proceed to read-only
derivation, and can use fixture fallback.

The blocked fixture cannot read real selectedRecommendation and cannot proceed
to read-only derivation.

The allowed fixture may model `read_only_input_allowed` with
`sourceMode: real_selected_recommendation_read_only`, input validation, and
future read-only derivation eligibility. It still forbids bridge calls,
localhost fetches, polling, execution, enabled controls, and unlocked gates.

The fixtures are not wired into Trade UI or the dev route and do not read or
render real selectedRecommendation state.

## Read-Only Input Guard Harness

`components/execution/AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness.tsx`
adds an isolated prop-driven harness for the guard fixtures.

The harness renders:

- fixture label
- guard status
- source mode
- read/validate/derive capability flags
- fixture fallback flag
- bridge/localhost/poll/execution flags
- controls disabled
- gate locked

The harness is guard-fixture-only. It is not wired into Trade UI or the dev
route, does not read app state, does not read or render real
selectedRecommendation state, does not call the adapter, does not call a
derived-preview builder, and does not derive app or route preview state.

## Read-Only Input Guard Route Section Plan

`docs/avanza-real-selected-recommendation-read-only-input-guard-route-section-plan.md`
plans a future fixture/model-only route section for showing the isolated guard
harness on `app/dev/avanza-visual-qa/page.tsx`.

The plan remains route-planning only. It does not wire the harness into the dev
route, does not change Trade UI, does not change `app/trade-app.tsx`, does not
read real selectedRecommendation state, and does not derive or render real
app/route preview state.

`docs/avanza-real-selected-recommendation-read-only-input-guard-route-section-pre-implementation-checkpoint.md`
confirms a future task may render the guard harness on the dev QA route only as
fixture/model-only content. The checkpoint still forbids Trade UI wiring, real
selectedRecommendation reads/renders, real app/route preview derivation, active
handoff controls, bridge calls, localhost fetches, polling, and execution.

`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness` as a
fixture/model-only section. The route section uses only static guard fixtures,
shows the `hidden_default`, `blocked_production_forbidden`, and
`read_only_input_allowed` model states, labels `read_only_input_allowed` as
model-only/read-only, and keeps controls disabled with the gate locked.

The route remains unlinked from main navigation, `app/trade-app.tsx` remains
unchanged, and the harness is still not wired into Trade UI.

## Test Requirements For Future Implementation

Future implementation tests must prove:

- default Trade UI remains disabled/static_fixture
- dev route remains unlinked from main navigation
- missing input returns `no_input`
- invalid input returns `invalid_input`
- blocked guard returns `blocked`
- valid input is accepted only behind explicit read-only guard
- valid input does not imply execution readiness
- no bridge/local fetch/polling/execution strings appear
- no exact trigger phrase appears
- no active handoff button exists
- controls disabled
- gate locked
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write

## Recommended Implementation Sequence

1. Add real selectedRecommendation read-only input guard model. Completed.
2. Add input guard fixtures: hidden, blocked, allowed. Completed.
3. Add input validation model for explicit input only. Completed.
4. Add isolated input guard harness. Completed.
5. Add route section plan for the input guard harness. Completed.
6. Add route section pre-implementation checkpoint. Completed.
7. Render the guard harness on the dev QA route as fixture/model-only.
   Completed.
8. Add route section checkpoint. Completed.
9. Add input fixtures: missing, invalid, valid.
10. Add checkpoint.
11. Add real selectedRecommendation read-only derivation plan. Completed.
12. Add real selectedRecommendation read-only derivation pre-implementation
    checkpoint. Completed.
13. Only later connect to a pure read-only derivation helper.

Every step must remain dev-only/read-only and must continue to forbid
execution, fill, trigger, bridge calls, localhost fetches, polling, active
controls, credential/session handling, Supabase execution writes, and
production readiness claims.

## Current Non-Goals

Current non-goals:

- no app code changes
- no route changes
- no Trade UI changes
- no real selectedRecommendation input read
- no real selectedRecommendation input render
- no adapter invocation from real input
- no derived-preview invocation from real input
- no real preview state derivation
- no real preview state render
- no active handoff button
- no execution/fill/trigger behavior

## References

- [Avanza read-only selectedRecommendation static-fixture derived-preview phase completion checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Avanza real selectedRecommendation read-only input guard route section plan](avanza-real-selected-recommendation-read-only-input-guard-route-section-plan.md)
- [Avanza real selectedRecommendation read-only input guard route section pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-input-guard-route-section-pre-implementation-checkpoint.md)
- [Avanza real selectedRecommendation read-only input guard route section checkpoint](avanza-real-selected-recommendation-read-only-input-guard-route-section-checkpoint.md)
- [Avanza real selectedRecommendation read-only derivation plan](avanza-real-selected-recommendation-read-only-derivation-plan.md)
- [Avanza real selectedRecommendation read-only derivation pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-derivation-pre-implementation-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Derivation Helper Follow-Up

The next pure helper has now been added:
`lib/avanza-real-selected-recommendation-read-only-derivation.ts`.

It consumes explicit selectedRecommendation-like input only, validates that
input through the read-only validation model, invokes adapter normalization
only after validation succeeds, and invokes derived-preview output only after
adapter normalization succeeds.

The helper is still not wired into Trade UI or the isolated dev QA route. The
existing route remains fixture-only, `app/trade-app.tsx` remains unchanged, no
real selectedRecommendation state is read from app/route, and no real
selectedRecommendation preview is rendered.

All helper outputs keep bridge calls, localhost fetches, polling, execution,
handoff progression, enabled controls, and unlocked gates forbidden.
