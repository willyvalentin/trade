# Avanza Hard-Disabled Trade UI Branch Wiring Plan

Status: `avanza_hard_disabled_trade_ui_branch_wiring_plan_added`

## Purpose

This plan defines a future `app/trade-app.tsx` branch-only integration call for
the hard-disabled source-to-preview integration helper.

The future call, if implemented later, may happen only inside the existing
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false-guarded branch. The
default UI must remain visually unchanged, selectedRecommendation preview must
remain disabled by default, runtime activation must remain unavailable, and no
execution path may be introduced.

## Strict Phase Boundary

This phase is planning only.

No app code changes are allowed in this phase. `app/trade-app.tsx` must not be
changed, the integration helper must not be wired into Trade UI, source
extraction must not be wired into Trade UI, real selectedRecommendation input
must not be connected, preview must not be enabled, and no previewState may be
derived from app or route state.

The existing dev-only visual QA route and harnesses remain fixture/model-only.

## Current State

Current state remains:

- hard-disabled source-to-preview integration helper exists as a pure model
- source extraction helper exists as a pure model
- integration fixtures and harness exist
- integration harness is visible on the dev-only visual QA route
- minimal passive/default-off wiring exists in `app/trade-app.tsx`
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` is false
- integration is not wired into `app/trade-app.tsx`
- source extraction is not wired into Trade UI
- real selectedRecommendation input is not connected, read, or rendered
- no previewState is derived from app or route state
- no active execution is allowed

## Allowed Future Wiring Shape

A later implementation may call the hard-disabled source-to-preview integration
helper from `app/trade-app.tsx` only inside the existing hard-disabled branch.

Allowed shape:

- branch remains unreachable by default because
  `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` is false
- `integrationEnabled` remains explicitly false unless a separate future
  test-only path is planned
- helper receives explicit inputs only
- helper may receive default/static safe input only in the first Trade UI branch
  wiring phase
- preview component may receive only `modelResult` from integration output
- preview component rendering remains inside the disabled branch only
- default UI path continues to render `static_fixture` behavior unchanged
- selectedRecommendation preview remains disabled by default
- controls remain disabled
- gate remains locked

## Disallowed Wiring Shape

Future branch wiring must not add:

- environment, localStorage, sessionStorage, or visible toggle enablement
- runtime activation
- real selectedRecommendation reads
- app or route state preview derivation
- fetch, search, discovery, polling, or refresh behavior
- bridge calls, localhost calls, or live endpoint calls
- Supabase execution writes
- handoff, prepare, buy/sell CTA, runner/fill, click, review, final, submit, or
  order behavior
- credential, session, BankID, cookie, or storage handling
- production readiness claims

## Required Future Branch Output Guarantees

The first future Trade UI branch wiring implementation must prove:

- `integration_disabled` by default
- no visible preview by default
- no `modelResult` rendered by default
- `canRenderPreview` false by default
- `canProceedToHandoff` false
- `canCallBridge` false
- `canFetchLocalhost` false
- `canPoll` false
- `canExecute` false
- `controlsEnabled` false
- `gateLocked` true

## Future Test Requirements

Future implementation tests must prove:

- default Trade UI remains visually unchanged
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- integration helper is referenced only inside the hard-disabled branch
- source extraction helper is referenced only inside the hard-disabled branch if
  used
- no real selectedRecommendation input is read
- no previewState is derived from app or route state
- preview component does not render by default
- integration output is `integration_disabled` by default
- no active handoff button exists
- no prepare button exists
- no buy/sell CTA exists
- no bridge, localhost fetch, polling, or execution strings appear
- no live endpoint strings or exact trigger phrase appear

## Recommended Implementation Sequence

Recommended sequence:

1. Add this branch wiring plan.
2. Add branch wiring pre-implementation checkpoint.
3. Add minimal hard-disabled Trade UI branch integration call.
4. Add branch wiring safety audit.
5. Add branch wiring checkpoint.
6. Add branch wiring phase completion checkpoint.
7. Only later consider test-only enabled branch behavior, still read-only and
   non-executing.

## Safety Summary

This plan does not implement Trade UI wiring. It does not wire the integration
helper into Trade UI, does not wire source extraction into Trade UI, does not
connect real selectedRecommendation input, does not enable preview, does not
change `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`, and does not derive
previewState from app or route state.

No active controls, handoff, prepare, buy/sell CTA, bridge/fetch/polling,
order behavior, credential/session handling, or Supabase write is added by this
plan.

## References

- [Avanza hard-disabled Trade UI branch wiring pre-implementation checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-pre-implementation-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Pre-Implementation Checkpoint Follow-Up

`docs/avanza-hard-disabled-trade-ui-branch-wiring-pre-implementation-checkpoint.md`
now records the go/no-go boundary before any future minimal
`app/trade-app.tsx` branch wiring. It permits only a hard-disabled branch-only
helper call inside the existing false guard, with explicit default/static safe
input, `integrationEnabled` false by default, no real selectedRecommendation
input, no app/route previewState derivation, unchanged default `static_fixture`
behavior, disabled controls, and locked gate.

## Minimal Branch Wiring Implementation Follow-Up

`app/trade-app.tsx` now contains the minimal hard-disabled branch-only
integration call. The helper is referenced only inside the existing
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` guarded branch, which remains
false by default.

The call uses explicit static safe input and `integrationEnabled: false`, so the
default integration output is `integration_disabled` and no `modelResult` is
rendered by default. Default Trade UI behavior remains `static_fixture`, source
extraction remains unwired, real selectedRecommendation input remains
disconnected, and no previewState is derived from app or route state.

## Branch Wiring Safety Audit Follow-Up

`docs/avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md` now records
the safety audit for the implemented branch-only wiring. The audit confirms
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false, the helper
call is only reachable inside the hard-disabled branch, `integrationEnabled`
remains false by default, static safe input is used, no real
selectedRecommendation state is connected/read/rendered, no previewState is
derived from app or route state, no `modelResult` renders by default, the
default Trade UI remains visually unchanged, and no active controls, bridge,
fetch, polling, order behavior, credential/session handling, or Supabase write
was added.

- [Avanza hard-disabled Trade UI branch wiring safety audit](avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md)

## Branch Wiring Checkpoint Follow-Up

`docs/avanza-hard-disabled-trade-ui-branch-wiring-checkpoint.md` now records
the implemented minimal branch-only wiring. It confirms the branch remains
hard-disabled by `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false`,
the helper call is isolated to that branch, `integrationEnabled` remains false
with static safe input, no `modelResult` renders by default, default
`static_fixture` behavior remains unchanged, source extraction remains unwired,
real selectedRecommendation input remains disconnected, and no previewState is
derived from app or route state.

- [Avanza hard-disabled Trade UI branch wiring checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-checkpoint.md)

## Phase Completion Checkpoint Follow-Up

`docs/avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md`
now closes the branch wiring phase. The next recommended phase is test-only
enabled branch planning, limited to static fixture input only and still no real
selectedRecommendation input, runtime activation, handoff, bridge, localhost
fetch, polling, or execution.

- [Avanza hard-disabled Trade UI branch wiring phase completion checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md)

## Test-Only Enabled Branch Planning Follow-Up

`docs/avanza-test-only-enabled-branch-planning.md` now defines that next
planning-only phase. It allows only a future internal/test-only fixture path
that may set `integrationEnabled: true` with static sanitized input. It still
forbids app code changes in this phase, default preview enablement, runtime env
activation, storage toggles, real selectedRecommendation reads, app or route
previewState derivation, active controls, handoff, bridge/fetch/polling,
order behavior, credential/session handling, and Supabase writes.

- [Avanza test-only enabled branch planning](avanza-test-only-enabled-branch-planning.md)
