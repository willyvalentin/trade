# Avanza Hard-Disabled Trade UI Real-Source Branch Wiring Pre-Implementation Checkpoint

Status: `avanza_hard_disabled_trade_ui_real_source_branch_wiring_pre_implementation_checkpoint_added`

## Current Status

This checkpoint permits a future minimal `app/trade-app.tsx` implementation
task for hard-disabled real-source branch wiring.

No implementation is included in this checkpoint. Real-source branch wiring is
not implemented yet.

The real connection path remains not wired into Trade UI. Real
selectedRecommendation input is not connected, read, or rendered in Trade UI.
No previewState is derived from app or route state.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

Default Trade UI remains visually unchanged.

## Preconditions Met

The following preconditions are in place:

- hard-disabled Trade UI real-source branch wiring plan exists
- real selectedRecommendation read-only connection helper exists
- real selectedRecommendation read-only connection fixtures, harness, and
  dev-route section exist
- hard-disabled Trade UI branch wiring phase is complete
- hard-disabled source-to-preview integration phase is complete
- selectedRecommendation source mapping phase is complete
- source extraction helper exists
- Trade UI read-only selectedRecommendation preview model exists
- passive Trade UI read-only selectedRecommendation preview component exists
- `app/trade-app.tsx` has
  `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false`
- default Trade UI remains visually unchanged
- no active execution is allowed

## Allowed Next Implementation Scope

A future implementation task may touch `app/trade-app.tsx` minimally.

That future touch is allowed only inside the existing
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` guarded branch.

The branch must remain unreachable by default because
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` is false.

The future task may reference an already-existing selectedRecommendation-like
object in `app/trade-app.tsx`.

That object must be passed explicitly into the real selectedRecommendation
read-only connection helper.

`connectionEnabled` must remain false by default.

`allowPreviewModel` must remain false by default.

No preview component may render by default.

No `modelResult` may render by default.

Default Trade UI must remain visually unchanged.

Existing `static_fixture` behavior must remain unchanged.

## Required Branch-Only Behavior

Any future real-source branch wiring must be branch-only.

The default Trade UI path must not import, call, or depend on source extraction
or the real selectedRecommendation read-only connection helper.

The future branch may inspect the helper output only inside the existing
false-guarded branch.

The passive preview component may receive `modelResult` only inside the
false-guarded branch and only when the helper explicitly returns
`preview_ready_read_only`.

## Required SelectedRecommendation Source Rules

The selectedRecommendation source must already exist in `app/trade-app.tsx`.

The source must be recommendation-like and must be passed explicitly.

The source must not be discovered, searched, fetched, polled, queried, inferred
from route state, or loaded from an external endpoint.

The source must not come from bridge/local endpoint calls.

The source must not come from browser storage.

The source must not contain account, session, credential, cookie, BankID,
browser storage, broker secret, execution, or order submission metadata.

## Required Hard-Disabled Guard Behavior

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` must remain false.

The preview guard must not be true.

No runtime env enablement may be added.

No `.env.local` enablement may be added.

No `localStorage` or `sessionStorage` toggle may be added.

No visible toggle may be added.

No normal/default Trade UI preview activation may be added.

## Required Output Guarantees

The default output must remain:

- `branch_disabled` by default or equivalent disabled state
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

## Required Data Safety Guarantees

The future branch may pass only selectedRecommendation-like recommendation data.

The future branch must sanitize and minimize data through the existing helper
chain.

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

## Explicit Non-Goals

This checkpoint does not implement real-source branch wiring.

This checkpoint does not wire the real connection helper into Trade UI.

This checkpoint does not connect real selectedRecommendation input to Trade UI.

This checkpoint does not enable preview in normal/default UI.

This checkpoint does not change `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
to true.

This checkpoint does not read real selectedRecommendation state from app or
route state.

This checkpoint does not render real selectedRecommendation preview in
normal/default Trade UI.

This checkpoint does not derive previewState from app or route state.

This checkpoint does not add active controls, handoff button, prepare button,
buy/sell CTA, bridge/fetch/polling/execution behavior, credential/session/
BankID/cookies/storage handling, or Supabase execution records.

## Go/No-Go Checklist

Go only if all statements remain true:

- `app/trade-app.tsx` changes are minimal
- changes are only inside the existing false-guarded branch
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- the selectedRecommendation-like source already exists in Trade UI
- the source is passed explicitly
- source extraction is not used in the default path
- the real connection helper is not used in the default path
- `connectionEnabled` remains false by default
- `allowPreviewModel` remains false by default
- no preview component renders by default
- no `modelResult` renders by default
- default Trade UI remains visually unchanged
- existing `static_fixture` behavior remains unchanged
- no previewState is derived from app or route state
- no active handoff button, prepare button, or buy/sell CTA exists
- no bridge/local fetch/polling/execution behavior exists
- no credential/session/BankID/cookies/storage handling exists
- no Supabase execution write exists

No-go if any future implementation requires network fetch, Supabase query,
scanner polling, bridge/local calls, account/session data, browser storage
reads, runtime env enablement, visible toggles, handoff, order behavior, or
production readiness claims.

## Recommended Next Implementation Task

Implement minimal hard-disabled Trade UI real-source branch wiring in
`app/trade-app.tsx`.

That future task may pass an already-existing selectedRecommendation-like
object into the real selectedRecommendation read-only connection helper only
inside the existing false-guarded branch.

It must keep `connectionEnabled` false by default, keep `allowPreviewModel`
false by default, keep preview disabled by default, keep default Trade UI
visually unchanged, keep existing `static_fixture` behavior unchanged, keep
controls disabled, keep the gate locked, and keep handoff, bridge, fetch,
polling, order behavior, credential/session handling, and Supabase execution
writes forbidden.

## Minimal Implementation Follow-Up

The minimal hard-disabled Trade UI real-source branch wiring has now been added
inside the existing `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` guarded
branch in `app/trade-app.tsx`.

The branch remains unreachable by default because
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

The branch passes the already-existing `selectedRecommendation` object
explicitly into `buildAvanzaRealSelectedRecommendationReadOnlyConnection`.

`connectionEnabled` remains false by default.

`allowPreviewModel` remains false by default.

No preview component renders by default. No `modelResult` renders by default.
Default Trade UI remains visually unchanged, existing `static_fixture` behavior
remains unchanged, source extraction remains outside the default path, and no
previewState is derived from app or route state.

## Safety Audit Follow-Up

`docs/avanza-hard-disabled-trade-ui-real-source-branch-wiring-safety-audit.md`
now audits the minimal hard-disabled real-source branch wiring. It confirms the
guard remains false, the branch is unreachable by default, the real connection
helper and selectedRecommendation-like source are referenced only inside the
hard-disabled branch, `connectionEnabled` and `allowPreviewModel` remain false,
no `modelResult` or real preview renders by default, static fixture behavior is
unchanged, source extraction is not wired into the default path, no previewState
is derived from app or route state, and no execution behavior was added.

## Phase Completion And Handoff Package Builder Plan

`docs/avanza-hard-disabled-trade-ui-real-source-branch-wiring-phase-completion-checkpoint.md`
now closes the minimal hard-disabled real-source branch wiring phase.

`docs/avanza-handoff-package-builder-plan.md` starts the next planning phase for
a pure handoff package builder. That plan remains planning-only and keeps
handoff, bridge, localhost fetch, polling, order behavior, credential/session
handling, and Supabase execution writes forbidden.
