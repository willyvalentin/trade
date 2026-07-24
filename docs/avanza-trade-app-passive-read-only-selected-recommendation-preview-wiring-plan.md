# Avanza Trade App Passive Read-Only SelectedRecommendation Preview Wiring Plan

Date: 2026-07-04

Plan status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_plan_added`

## Purpose

This plan defines a future passive/default-off rendering path inside
`app/trade-app.tsx` for the read-only selectedRecommendation preview.

The future implementation may use:

- the existing pure Trade UI preview model
- the existing passive preview component
- only already-present selectedRecommendation-like input

The future implementation must not discover, search, fetch, poll, refresh,
handoff, or execute.

## Strict Phase Boundary

This task is planning only.

Current boundary:

- no app code changes
- no `app/trade-app.tsx` changes
- no dev route changes
- no Trade UI wiring yet
- no selectedRecommendation state read yet
- no app/route preview derivation yet
- no preview rendering in default Trade UI

## Allowed Future Implementation

A future `app/trade-app.tsx` implementation may:

- import the passive preview component only after a pre-implementation
  checkpoint
- call/use the preview model only behind an explicit default-off internal guard
- pass only an already-present selectedRecommendation-like object
- keep the preview hidden/disabled by default
- render `read_only_preview_ready` as passive preview only
- render non-ready statuses as nothing or safe passive copy

`app/trade-app.tsx` must not fetch, discover, or search for
selectedRecommendation.

`app/trade-app.tsx` must not introduce polling or refresh.

## Required Default-Off Guard

The future `app/trade-app.tsx` guard must be:

- hardcoded false or an equivalent internal disabled path initially
- no visible user toggle
- no runtime environment production enablement
- no localStorage enablement
- no accidental production enablement
- passive/read-only only even when internally enabled for tests

The enabled path must still preserve disabled controls and a locked gate.

## Placement Constraints

If rendered later, the preview:

- must not disrupt existing recommendation card CTAs
- must not appear as an execution panel
- must not appear as a broker handoff panel
- must not be placed near active KOP/SALJ-like CTAs
- must be visually labeled read-only/passive

The preview must not imply broker execution, handoff readiness, order
submission, or production readiness.

## Required Future UI Behavior

Future UI behavior must remain:

- passive card/section only
- no active button
- no handoff button
- no prepare button
- no buy/sell CTA
- no broker execution wording
- no order submission copy
- no production-ready copy
- no credentials/account/session data

## Required Future Output

The future model/component output must expose:

- status
- label
- reason
- previewState only for `read_only_preview_ready`
- canRenderReadOnlyPreview true only for `read_only_preview_ready`
- `canProceedToHandoff: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

## Required Future Tests

Future tests must prove:

- default Trade UI does not render the read-only preview
- `app/trade-app.tsx` has an explicit default-off guard
- read-only preview can render only in a test-only/internal enabled path
- no active button appears
- no handoff button appears
- no prepare button appears
- no buy/sell CTA appears
- no broker execution wording appears
- no bridge/local fetch/polling/execution strings appear
- no live endpoint strings or exact trigger phrase appear
- selectedRecommendation preview remains disabled by default

## Recommended Implementation Sequence

1. Add this `app/trade-app.tsx` wiring plan.
2. Add `app/trade-app.tsx` wiring pre-implementation checkpoint.
3. Add a tiny passive/default-off integration helper if needed.
4. Touch `app/trade-app.tsx` only with hardcoded/default-off passive rendering.
5. Add Trade UI passive preview safety checkpoint.
6. Only later consider selectedRecommendation source mapping if needed.

## Safety Requirements

Any future work must keep:

- controls disabled
- pre-activation gate locked
- selectedRecommendation preview disabled by default in Trade UI
- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim

## Current Non-Implementation Confirmation

This plan does not implement:

- app code changes
- `app/trade-app.tsx` changes
- dev route changes
- Trade UI wiring
- selectedRecommendation reads from app/route
- app/route preview derivation
- default Trade UI preview rendering
- runtime environment config
- visible toggle
- active controls
- bridge, localhost, polling, runner, fill, click, review, final, submit,
  order, credential/session, BankID, cookies, storage, Supabase execution
  write, or live Avanza behavior

## Pre-Implementation Checkpoint Follow-Up

Checkpoint status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_wiring_pre_implementation_checkpoint_added`

`docs/avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md`
now records the go/no-go boundary before any future `app/trade-app.tsx` touch.

## References

- [Avanza Trade app passive read-only selectedRecommendation preview wiring pre-implementation checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation pre-Trade-UI wiring architecture checkpoint](avanza-trade-ui-read-only-selected-recommendation-pre-trade-ui-wiring-architecture-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview component phase completion checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-component-phase-completion-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring plan](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-plan.md)
- [Avanza Trade UI read-only selectedRecommendation preview default-off wiring pre-implementation checkpoint](avanza-trade-ui-read-only-selected-recommendation-preview-default-off-wiring-pre-implementation-checkpoint.md)
- [Avanza Trade UI read-only selectedRecommendation preview integration plan](avanza-trade-ui-read-only-selected-recommendation-preview-integration-plan.md)
- [Avanza read-only selectedRecommendation architecture checkpoint before Trade UI](avanza-read-only-selected-recommendation-architecture-checkpoint-before-trade-ui.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Minimal Default-Off Wiring Follow-Up

Status:
`avanza_trade_app_passive_read_only_selected_recommendation_preview_minimal_default_off_wiring_added`

The first minimal passive wiring now exists in `app/trade-app.tsx` behind the
hardcoded false guard `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`.

Default behavior remains static fixture. The passive read-only component is not
visible by default, and its guarded branch receives only the default hidden
model. Real selectedRecommendation state is not read for this path and no app
previewState is derived.

The wiring remains non-executing: no bridge calls, localhost fetch, polling,
refresh, trigger, fill, click, review, final, submit, order,
credential/session/BankID/cookie/storage handling, Supabase execution writes, or
live Avanza behavior.

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
