# Avanza Hard-Disabled Trade UI Real-Source Branch Wiring Phase Completion Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_hard_disabled_trade_ui_real_source_branch_wiring_phase_complete`

## Phase Status

The hard-disabled Trade UI real-source branch wiring phase is complete.

`app/trade-app.tsx` contains the minimal hard-disabled real-source branch
wiring for the passive read-only selectedRecommendation preview path.

This phase does not enable preview, handoff, fill, order submission, bridge
calls, localhost calls, polling, or execution.

## Completed Wiring

The branch is inside the existing passive preview guard:

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

The branch calls the real selectedRecommendation read-only connection helper
only inside the hard-disabled branch:

`buildAvanzaRealSelectedRecommendationReadOnlyConnection`

The branch passes the existing selectedRecommendation-like Trade UI object only
inside that hard-disabled branch:

`selectedRecommendationCandidate: selectedRecommendation`

No new selectedRecommendation source was created.

No source extraction path was wired into the default Trade UI path.

## Disabled Defaults

The real-source branch remains disabled by default:

- `connectionEnabled: false`
- `allowPreviewModel: false`
- no preview renders by default
- no `modelResult` renders by default
- no previewState is derived from app or route state
- default Trade UI remains visually unchanged
- existing `static_fixture` behavior remains unchanged

## Safety Guarantees

The completed phase preserves these safety guarantees:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- real connection helper is only reachable inside the hard-disabled branch
- selectedRecommendation-like source is only referenced inside the hard-disabled branch
- `connectionEnabled` false by default
- `allowPreviewModel` false by default
- no default preview render
- no default `modelResult` render
- no previewState derived from app or route state
- no active controls
- no handoff
- no prepare behavior
- no buy/sell behavior
- no bridge calls
- no localhost fetch
- no polling
- no order behavior
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim

## Validation Summary

The safety audit for this phase is:

[Avanza hard-disabled Trade UI real-source branch wiring safety audit](avanza-hard-disabled-trade-ui-real-source-branch-wiring-safety-audit.md)

It confirms the branch is isolated, hard-disabled, read-only, visually
unchanged by default, and non-executable.

## What Remains Not Implemented

Still not implemented:

- enabling selectedRecommendation preview by default
- enabling the passive preview guard
- deriving previewState from app or route state
- rendering a real selectedRecommendation preview in normal/default Trade UI
- adding active handoff controls
- adding prepare controls
- adding buy/sell controls
- calling bridge or localhost endpoints
- polling or refreshing for selectedRecommendation data
- submitting, reviewing, finalizing, or placing orders
- handling credentials, sessions, cookies, BankID, or browser storage
- writing Supabase execution records

## Next Phase

The next phase is planning for a pure Avanza handoff package builder.

That next phase must remain pure and non-executing by default. It may define a
future model for packaging validated recommendation data, but it must not
control a browser, call a bridge, call localhost, submit an order, or claim
production readiness.

Next plan:

[Avanza handoff package builder plan](avanza-handoff-package-builder-plan.md)
