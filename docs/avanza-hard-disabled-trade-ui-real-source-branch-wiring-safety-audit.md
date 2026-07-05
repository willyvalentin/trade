# Avanza Hard-Disabled Trade UI Real-Source Branch Wiring Safety Audit

Date: 2026-07-04

Audit status:
`avanza_hard_disabled_trade_ui_real_source_branch_wiring_safety_audit_added`

## Audit Scope

This audit covers the minimal hard-disabled Trade UI real-source branch wiring
inside `app/trade-app.tsx`.

The audited branch is the existing passive read-only selectedRecommendation
preview branch guarded by:

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`

The guard remains false.

## Current Wiring State

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

The branch is unreachable by default.

The real connection helper is referenced only inside the hard-disabled branch:

`buildAvanzaRealSelectedRecommendationReadOnlyConnection`

The selectedRecommendation-like source is referenced only inside that
hard-disabled branch as:

`selectedRecommendationCandidate: selectedRecommendation`

No new selectedRecommendation source was created.

No source discovery, search, fetch, polling, or query path was added.

## Hard-Disabled Connection Flags

The real-source branch calls the connection helper with disabled defaults:

- `connectionEnabled: false`
- `allowPreviewModel: false`

Expected default branch output remains disabled.

No `modelResult` renders by default.

No real selectedRecommendation preview renders by default.

## Default Trade UI Audit

Default Trade UI remains visually unchanged.

Existing `static_fixture` behavior remains unchanged.

The visible Avanza preview path remains the static fixture path by default.

The Trade UI status copy still shows selectedRecommendation preview disabled by
default.

## Source Extraction Audit

Source extraction is not wired into the default Trade UI path.

`buildAvanzaSelectedRecommendationSourceExtraction` is not called from the
hard-disabled branch.

The source extraction helper is not imported by `app/trade-app.tsx`.

## PreviewState Derivation Audit

No previewState is derived from app or route state.

The real-source connection keeps `allowPreviewModel false`, so it cannot expose
a preview model by default.

The source-to-preview integration remains hard-disabled and keeps
`integrationEnabled: false`.

## Execution Boundary Audit

The hard-disabled real-source branch adds no execution behavior.

The branch adds:

- no bridge calls
- no localhost fetch
- no polling
- no execution behavior
- no handoff button
- no prepare button
- no buy/sell CTA
- no fill/click/review/final/submit/order behavior
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write

## Data Safety Audit

The branch passes only the already-existing selectedRecommendation-like Trade UI
object into the read-only connection helper.

It does not pass account ids, broker session data, credentials, cookies,
BankID/session metadata, browser storage, Supabase auth/session, execution
records, order submission metadata, or broker secrets.

## Dev Route Audit

The dev-only Avanza visual QA route remains fixture/model-only.

The route remains unlinked from main navigation.

The route does not read Trade UI state and does not use the hard-disabled Trade
UI branch as a runtime source.

## Safety Result

The minimal hard-disabled Trade UI real-source branch wiring is isolated,
hard-disabled, read-only, visually unchanged by default, and non-executable.

The branch can remain in place as a default-off boundary for future planning,
but it does not enable real selectedRecommendation preview in normal/default
Trade UI.

## Remaining Non-Goals

Still not implemented:

- enabling `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
- rendering real selectedRecommendation preview by default
- connecting source extraction into Trade UI
- deriving previewState from app or route state
- adding active controls
- adding handoff, prepare, or buy/sell CTA behavior
- calling bridge or localhost endpoints
- polling or refreshing for selectedRecommendation data
- handling credentials, sessions, cookies, BankID, or browser storage
- writing Supabase execution records
- claiming production readiness

## Recommended Next Step

Add a checkpoint for the minimal hard-disabled Trade UI real-source branch
wiring.

That checkpoint should keep the same boundary: guard false, connection disabled,
preview model disabled, default UI unchanged, static fixture behavior preserved,
and no execution path.

## Phase Completion And Next Plan

`docs/avanza-hard-disabled-trade-ui-real-source-branch-wiring-phase-completion-checkpoint.md`
now closes this hard-disabled real-source branch wiring phase. It confirms the
minimal `app/trade-app.tsx` branch exists, remains unreachable by default, keeps
`connectionEnabled` and `allowPreviewModel` false, renders no preview or
`modelResult` by default, preserves `static_fixture` behavior, derives no
previewState from app or route state, and adds no active controls or execution
behavior.

`docs/avanza-handoff-package-builder-plan.md` starts the next planning phase for
a future pure handoff package builder. The plan is non-executing and does not
add browser control, bridge/local calls, polling, order submission, credential
handling, or Supabase execution writes.
