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
