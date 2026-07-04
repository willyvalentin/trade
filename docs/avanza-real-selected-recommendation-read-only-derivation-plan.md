# Avanza Real SelectedRecommendation Read-Only Derivation Plan

Date: 2026-07-04

Plan status:
`avanza_real_selected_recommendation_read_only_derivation_plan_added`

Pre-implementation checkpoint status:
`avanza_real_selected_recommendation_read_only_derivation_pre_implementation_checkpoint_added`

## Purpose

This plan defines a future phase for safely introducing real
selectedRecommendation read-only derivation.

The future path must remain:

- explicit input only
- guard-approved only
- validation-approved only
- adapter normalization only after validation
- derived-preview generation only after adapter normalization
- read-only previewState only
- no Trade UI default enablement
- no execution

The goal is to allow an explicit selectedRecommendation-like input, already
approved by the read-only input guard and validation model, to proceed through
adapter normalization and read-only derived-preview generation in pure model
state only.

## Strict Phase Boundary

This document is planning only.

This task does not implement derivation.

This task does not change app code:

- no `app/trade-app.tsx` changes
- no `app/dev/avanza-visual-qa/page.tsx` changes
- no Trade UI changes
- no route changes
- no real app/route selectedRecommendation reads
- no real preview derivation implementation yet
- no preview rendering in default Trade UI

The existing validation model remains unwired from Trade UI and the dev route.

## Allowed Future Behavior

A future implementation may add a pure read-only derivation helper that accepts
explicit inputs only.

Allowed future behavior:

- explicit selectedRecommendation-like input may be passed into a pure
  read-only derivation helper
- input guard must allow read-only input
- input validation must return `valid_read_only_input`
- adapter normalization may run only on the validated explicit input
- derived-preview builder may run only after successful adapter normalization
- successful result returns `read_only_preview_ready`
- failure states must remain safe

Adapter normalization and derived-preview generation must never read implicit
app state, route state, Trade UI state, browser storage, credentials, cookies,
or Supabase state.

## Future Statuses

The future derivation helper should use these statuses:

- `no_input`
- `guard_blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

Failure states must remain diagnostic/model-only and must not imply handoff
readiness.

## Required Future Output

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

All outputs must keep controls disabled and the pre-activation gate locked.

## Required Safety Guarantees

The future derivation phase must guarantee:

- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim
- no execution readiness claim

## Forbidden Behavior

Forbidden behavior:

- no implicit app state read
- no implicit route state read
- no Trade UI state read
- no selectedRecommendation preview in default Trade UI
- no active handoff button
- no execution capability
- no route link from main navigation
- no runtime env config
- no default selectedRecommendation preview enablement

## Future Test Requirements

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
- no `app/trade-app.tsx` import
- no dev route import unless later explicitly route-fixture planned
- no live endpoint strings
- no exact trigger phrase
- no active handoff button

## Recommended Implementation Sequence

1. Add real selectedRecommendation read-only derivation pre-implementation
   checkpoint. Completed.
2. Add pure derivation helper that accepts explicit input plus guard and
   validation result.
3. Add derivation fixtures: `no_input`, `guard_blocked`, `invalid_input`,
   `adapter_rejected`, `derived_preview_failed`, and
   `read_only_preview_ready`.
4. Add isolated derivation harness.
5. Add dev-route fixture/model-only section plan.
6. Only later consider route-visible read-only derivation fixtures.

Each step must continue to forbid bridge calls, localhost fetches, polling,
runner/fill invocation, trigger behavior, active controls, credential/session
handling, Supabase execution writes, and execution.

## Current Non-Goals

Current non-goals:

- no derivation helper implementation
- no adapter invocation from real input
- no derived-preview invocation from real input
- no app code change
- no route change
- no Trade UI change
- no real selectedRecommendation state read from app/route
- no real selectedRecommendation preview render
- no handoff
- no execution

## References

- [Avanza real selectedRecommendation read-only input plan](avanza-real-selected-recommendation-read-only-input-plan.md)
- [Avanza real selectedRecommendation read-only input guard route section checkpoint](avanza-real-selected-recommendation-read-only-input-guard-route-section-checkpoint.md)
- [Avanza real selectedRecommendation read-only derivation pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-derivation-pre-implementation-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview phase completion checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Pure Helper Implementation Follow-Up

`lib/avanza-real-selected-recommendation-read-only-derivation.ts` now
implements the first pure real selectedRecommendation read-only derivation
helper for explicit input only.

The helper composes the read-only input guard decision, the real
selectedRecommendation input validation model, the selectedRecommendation
adapter, and the selectedRecommendation derived-preview helper. It does so in
strict order: validation first, adapter normalization only after
`valid_read_only_input`, and derived-preview output only after adapter
normalization succeeds.

Current statuses are `no_input`, `guard_blocked`, `invalid_input`,
`adapter_rejected`, `derived_preview_failed`, and
`read_only_preview_ready`. Only `read_only_preview_ready` includes
`previewState` and `canRenderReadOnlyPreview: true`.

The implementation remains pure and non-wired. It does not change
`app/trade-app.tsx`, does not change the isolated dev route, does not read app
or route state, does not render real selectedRecommendation preview, and keeps
handoff/execution false with controls disabled and the gate locked.

## Static Derivation Fixture Status

`lib/avanza-real-selected-recommendation-read-only-derivation-fixtures.ts` now
adds fixture coverage for the complete safe status model.

The fixture set covers `no_input`, `guard_blocked`, `invalid_input`,
`adapter_rejected`, `derived_preview_failed`, and
`read_only_preview_ready`. The ready fixture is the only fixture that includes
`previewState` and `canRenderReadOnlyPreview: true`; all other fixtures keep
preview output absent.

These fixtures remain static and explicit-input only. They do not import or
change `app/trade-app.tsx`, do not import or change
`app/dev/avanza-visual-qa/page.tsx`, are not rendered in Trade UI or the dev
route, and do not read real selectedRecommendation state from app/route.

## Isolated Harness Status

`components/execution/AvanzaRealSelectedRecommendationReadOnlyDerivationHarness.tsx`
has been added as the isolated fixture renderer for the derivation model.

The harness accepts derivation fixtures as props, defaults to the static
fixture list, and renders the complete status set with read-only safety copy.
It does not fetch, call bridge code, read app state, read route state, derive
app/route preview state, or expose active controls.

The harness is deliberately not wired into Trade UI or the isolated dev route.
It exists only so tests and future visual QA work can inspect the explicit
fixture model before any route or Trade UI integration is considered.

## Route Section Plan Status

`docs/avanza-real-selected-recommendation-read-only-derivation-route-section-plan.md`
has been added to describe a future dev-route section for this harness.

That future section is limited to fixture/model-only display on
`app/dev/avanza-visual-qa/page.tsx`. It must show all six derivation statuses,
keep `previewState` visible only for `read_only_preview_ready`, label that
state read-only/model-only, keep the route unlinked from main navigation, and
continue to forbid real selectedRecommendation reads, app/route preview
derivation, Trade UI wiring, and execution.

## Route Section Pre-Implementation Checkpoint Status

`docs/avanza-real-selected-recommendation-read-only-derivation-route-section-pre-implementation-checkpoint.md`
has been added as the go/no-go checkpoint before any route rendering of the
derivation harness.

It allows only the fixture/model-only route section in a future task. It does
not change the route in this task, does not change Trade UI, and keeps
`previewState` limited to the explicit `read_only_preview_ready` fixture.

## Route Section Implementation Status

The isolated dev QA route now renders the derivation harness as a
fixture/model-only section.

`app/dev/avanza-visual-qa/page.tsx` imports
`AvanzaRealSelectedRecommendationReadOnlyDerivationHarness` and passes the
static derivation fixtures explicitly. This route-visible display remains
dev-only, unlinked from main navigation, and separate from Trade UI. It does
not read real selectedRecommendation state, does not derive app/route preview
state, and does not enable handoff or execution.

## Route Section Checkpoint

`docs/avanza-real-selected-recommendation-read-only-derivation-route-section-checkpoint.md`
now records the completed route-visible fixture/model-only harness section.

The checkpoint closes this route section step and recommends a phase
completion checkpoint next, while preserving no Trade UI wiring, no real
app/route state reads, no bridge/local/polling behavior, and no execution.

## Phase Completion Checkpoint

`docs/avanza-real-selected-recommendation-read-only-derivation-phase-completion-checkpoint.md`
now closes the real selectedRecommendation read-only derivation phase at the
fixture/model-only level.

It records the guard, validation model, derivation helper, static fixtures,
isolated harness, and dev-route fixture section as complete, while keeping
Trade UI default behavior unchanged and selectedRecommendation preview disabled
by default.

## Architecture Checkpoint Before Trade UI

`docs/avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md`
now records the broader safe architecture boundary before any Trade UI
read-only selectedRecommendation preview planning.

Any future Trade UI plan must be separate, default-off, passive/read-only, and
must keep no buttons, no bridge/fetch/polling, no handoff package, no Avanza
behavior, no execution behavior, and no Supabase execution writes.

## Trade UI Read-Only Preview Integration Plan

`docs/avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md`
now captures that separate future Trade UI planning step.

This derivation plan remains non-wiring documentation: no `app/trade-app.tsx`
changes, no app/route selectedRecommendation reads, and no app/route preview
derivation are introduced here.
