# Avanza Hard-Disabled Trade UI Real-Source Branch Wiring Plan

Status: `avanza_hard_disabled_trade_ui_real_source_branch_wiring_planned`

## Purpose

This document plans a future hard-disabled Trade UI real-source branch wiring
step.

The future step may pass an already-existing selectedRecommendation-like
object from `app/trade-app.tsx` into the real selectedRecommendation read-only
connection helper, but only inside the existing hard-disabled branch.

The planned shape is explicit pass-through only. It must not discover, fetch,
search, poll, query, or otherwise look up recommendation data. It must not
enable preview by default, handoff, or execution.

## Strict Phase Boundary

This task is planning only.

This phase adds no app code changes, no `app/trade-app.tsx` changes, no real
selectedRecommendation wiring, no source extraction wiring into the default
Trade UI path, no previewState derivation, and no preview enablement.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

Default Trade UI remains visually unchanged.

## Allowed Future Wiring Shape

A future implementation may reference an already-existing
selectedRecommendation-like object in `app/trade-app.tsx` only inside the
existing hard-disabled branch.

The branch must remain unreachable by default because
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` is false.

The selectedRecommendation-like object must be passed explicitly into
`lib/avanza-real-selected-recommendation-read-only-connection.ts`. No discovery,
fetch, search, storage read, route read, or inferred lookup is allowed.

`connectionEnabled` must remain false by default unless a separate
test-only/internal task explicitly changes that model input.

`allowPreviewModel` must remain false by default unless a separate
test-only/internal task explicitly changes that model input.

The helper output may be inspected only inside the disabled branch. The passive
preview component may receive `modelResult` only inside the disabled branch and
only when the helper explicitly returns `preview_ready_read_only`.

Normal/default Trade UI must remain visually unchanged. Existing
`static_fixture` behavior must remain unchanged.

The output guarantees must remain:

- `canProceedToHandoff` false
- controls disabled
- gate locked

## Disallowed Wiring Shape

The future branch must not add:

- network fetch
- Supabase query
- scanner polling
- bridge or localhost calls
- Avanza account or session data
- browser storage/session/cookie reads
- runtime environment enablement
- `localStorage` or `sessionStorage` toggle
- visible toggle
- default Trade UI preview activation
- handoff button
- prepare button
- buy/sell CTA
- runner/fill/click/review/final/submit/order behavior

It must not handle credentials, sessions, BankID metadata, cookies, browser
storage, Supabase auth/session data, Supabase execution records, order
submission metadata, broker secrets, or production execution state.

## Required Future Branch Statuses

The future branch should preserve these statuses:

- `branch_disabled`
- `selected_recommendation_not_available`
- `selected_recommendation_invalid`
- `selected_recommendation_ready_read_only`
- `preview_blocked`
- `preview_ready_read_only`

## Required Future Output Guarantees

The future branch output must guarantee:

- branch remains disabled by default
- `modelResult` exists only for `preview_ready_read_only`
- `canRenderPreview` false by default
- `canProceedToHandoff` false
- `canCallBridge` false
- `canFetchLocalhost` false
- `canPoll` false
- `canExecute` false
- `controlsEnabled` false
- `gateLocked` true

`preview_ready_read_only` remains read-only and must not imply handoff
readiness.

## Data Safety Requirements

The future branch may pass only selectedRecommendation-like recommendation data
that already exists in Trade UI state.

The object must be sanitized and minimized through the existing helper chain.

The future branch must exclude:

- account ids
- broker session data
- credentials
- cookies
- BankID/session metadata
- browser storage
- Supabase auth/session
- execution records
- order submission metadata
- broker secrets

## Future Test Requirements

Future implementation tests must prove:

- default Trade UI remains visually unchanged
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- no selectedRecommendation preview renders by default
- real-source branch references are only inside the hard-disabled branch
- source extraction is not used in the default path
- the real connection helper is not used in the default path
- no app or route previewState is derived
- no active handoff button exists
- no prepare button exists
- no buy/sell CTA exists
- no bridge/local fetch/polling/execution exists
- no live endpoint strings or exact trigger phrase appear

## Recommended Implementation Sequence

1. Add this wiring plan.
2. Add hard-disabled Trade UI real-source branch pre-implementation checkpoint.
3. Add minimal hard-disabled Trade UI real-source branch model invocation.
4. Add safety audit.
5. Add checkpoint.
6. Add phase completion checkpoint.
7. Only later consider explicit internal/test-only preview enablement for real
   source.

Every step must keep default preview disabled, keep default Trade UI visually
unchanged, keep all active controls disabled, keep the gate locked, and keep
handoff, bridge, fetch, polling, order behavior, credential/session handling,
and Supabase execution writes forbidden.

## Pre-Implementation Checkpoint Follow-Up

`docs/avanza-hard-disabled-trade-ui-real-source-branch-wiring-pre-implementation-checkpoint.md`
now defines the go/no-go boundary before any `app/trade-app.tsx` implementation
task. It permits only a future minimal touch inside the existing
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false-guarded branch, using
explicit pass-through of an already-existing selectedRecommendation-like object,
with `connectionEnabled` and `allowPreviewModel` false by default, no default
preview rendering, no default `modelResult`, no default Trade UI visual change,
no source extraction in the default path, no previewState derived from app or
route state, and no active controls or execution behavior.

## Minimal Implementation Follow-Up

`app/trade-app.tsx` now contains the minimal hard-disabled real-source branch
wiring planned here. The branch calls
`buildAvanzaRealSelectedRecommendationReadOnlyConnection` only inside the
existing false-guarded branch and passes the existing `selectedRecommendation`
object explicitly as `selectedRecommendationCandidate`.

The implementation keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
false, keeps `connectionEnabled` false by default, keeps `allowPreviewModel`
false by default, renders no real selectedRecommendation preview by default,
renders no `modelResult` by default, leaves default Trade UI visually
unchanged, preserves existing `static_fixture` behavior, keeps source
extraction out of the default path, derives no previewState from app or route
state, and adds no active controls or execution behavior.

## Safety Audit Follow-Up

`docs/avanza-hard-disabled-trade-ui-real-source-branch-wiring-safety-audit.md`
now records the post-implementation safety audit for this minimal branch. The
audit confirms the branch remains hard-disabled and unreachable by default,
uses the real connection helper only with `connectionEnabled: false` and
`allowPreviewModel: false`, renders no `modelResult` or real preview by
default, preserves `static_fixture` behavior, keeps source extraction out of the
default Trade UI path, derives no previewState from app or route state, and adds
no bridge/fetch/polling, active control, order, credential/session, or Supabase
write behavior.

## Phase Completion And Next Planning Follow-Up

`docs/avanza-hard-disabled-trade-ui-real-source-branch-wiring-phase-completion-checkpoint.md`
now marks this branch wiring phase complete.

`docs/avanza-handoff-package-builder-plan.md` opens the next phase as a pure
handoff package builder plan. It defines only future data packaging concepts and
keeps browser control, bridge calls, localhost calls, polling, order submission,
credential/session handling, and Supabase execution writes out of scope.
