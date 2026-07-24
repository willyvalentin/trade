# Avanza Hard-Disabled Trade UI Branch Wiring Pre-Implementation Checkpoint

Status: `avanza_hard_disabled_trade_ui_branch_wiring_pre_implementation_checkpoint_added`

## Current Status

This checkpoint permits a future minimal `app/trade-app.tsx` branch-only wiring
task for the hard-disabled source-to-preview integration helper.

The future task is limited to the existing
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false-guarded branch. It
must preserve the default Trade UI, keep selectedRecommendation preview
disabled by default, avoid runtime activation, and add no execution behavior.

This checkpoint itself is documentation only. It does not change app code and
does not implement Trade UI wiring.

## Preconditions Met

The following preconditions are met:

- hard-disabled Trade UI branch wiring plan exists
- hard-disabled source-to-preview integration phase completion checkpoint exists
- pure hard-disabled source-to-preview integration helper exists
- hard-disabled source-to-preview fixtures, harness, and dev route section exist
- selectedRecommendation source mapping phase is complete
- Trade UI read-only selectedRecommendation preview model exists
- passive Trade UI read-only selectedRecommendation preview component exists
- minimal passive/default-off wiring already exists in `app/trade-app.tsx`
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` is false
- integration is not wired into `app/trade-app.tsx`
- source extraction is not wired into Trade UI
- real selectedRecommendation input is not connected, read, or rendered
- no previewState is derived from app or route state
- no active execution is allowed

## Allowed Next Implementation Scope

The next implementation task may touch `app/trade-app.tsx` minimally.

Allowed scope:

- import or reference the integration helper only for the hard-disabled branch
- call the integration helper only inside the existing
  `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false-guarded branch
- keep the branch unreachable by default because
  `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- keep `integrationEnabled` false by default
- pass explicit default/static safe input only
- pass no real selectedRecommendation state
- derive no previewState from app or route state
- pass only `modelResult` from integration output to the preview component
- render that preview component only inside the disabled branch
- keep the default path visually unchanged
- keep existing `static_fixture` behavior unchanged

## Required Branch-Only Behavior

Any future helper call must be scoped to the hard-disabled branch. It must not
run in the normal Trade UI path.

The branch must remain unreachable by default. The future implementation must
not introduce environment, localStorage, sessionStorage, visible toggle, route,
or runtime config behavior that can enable it.

## Required Hard-Disabled Guard Behavior

Guard rules:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- no env value can enable the branch
- no localStorage value can enable the branch
- no sessionStorage value can enable the branch
- no visible toggle can enable the branch
- selectedRecommendation preview remains disabled by default
- normal Trade UI visual output remains unchanged

## Required Default UI Guarantees

Default Trade UI must continue to:

- render existing `static_fixture` behavior
- show selectedRecommendation preview disabled by default
- avoid rendering the hard-disabled integration preview
- avoid rendering `modelResult` from the integration helper
- avoid reading real selectedRecommendation input for this path
- avoid deriving previewState from app or route state

## Required Output Guarantees

Future default output must be:

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

## Required Safety Guarantees

Future branch wiring must add no active controls, handoff button, prepare
button, buy/sell CTA, bridge calls, localhost fetch, polling, refresh behavior,
runner/fill invocation, fill/click/review/final/submit/order behavior,
credential/session/BankID/cookies/storage handling, or Supabase execution
writes.

The implementation must not claim production readiness.

## Explicit Non-Goals

Non-goals:

- no preview enablement
- no default selectedRecommendation preview rendering
- no source extraction wiring into normal Trade UI
- no real selectedRecommendation input connection
- no app or route previewState derivation
- no runtime env config
- no localStorage or sessionStorage enablement
- no visible toggle
- no active handoff, prepare, buy/sell, or order behavior
- no bridge, localhost, polling, or live Avanza behavior
- no credential, session, BankID, cookie, or storage handling
- no Supabase execution write

## Go/No-Go Checklist

Go only if the future implementation can prove:

- `app/trade-app.tsx` changes are minimal
- helper import/reference exists only for the hard-disabled branch
- helper call is inside the false-guarded branch
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- `integrationEnabled` remains false by default
- only explicit default/static safe input is passed
- no real selectedRecommendation state is passed
- no route or app previewState is derived
- default UI remains visually unchanged
- static fixture behavior remains unchanged
- preview component does not render by default
- integration output is `integration_disabled` by default
- controls remain disabled
- gate remains locked
- bridge, localhost fetch, polling, execution, order, credentials, sessions,
  and Supabase writes remain unavailable

No-go if the future implementation needs runtime activation, real
selectedRecommendation input, preview enablement, app/route previewState
derivation, active controls, bridge/local calls, order behavior, credentials,
sessions, or Supabase writes.

## Recommended Next Implementation Task

Recommended next task: add the minimal hard-disabled Trade UI branch integration
call in `app/trade-app.tsx`.

That task must keep `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false,
keep `integrationEnabled` false by default, pass only explicit default/static
safe input, keep the default UI visually unchanged, avoid real
selectedRecommendation input, avoid app/route previewState derivation, and keep
all handoff, bridge/fetch/polling, order, credential/session, and Supabase
behavior forbidden.

## Minimal Branch Wiring Implementation Follow-Up

The minimal hard-disabled Trade UI branch integration wiring now exists in
`app/trade-app.tsx`.

The implementation imports the hard-disabled source-to-preview integration
helper and references it only inside the existing
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` guarded branch. The guard
remains false, so the branch is unreachable by default.

The helper call uses explicit default/static safe input only:

- `integrationEnabled: false`
- `sourceKind: static_fixture`
- a static source name for the hard-disabled Trade UI branch

No real selectedRecommendation state is passed, source extraction remains
unwired from Trade UI, no previewState is derived from app or route state, no
`modelResult` is rendered by default, and default Trade UI visual output remains
unchanged.

The default integration output is `integration_disabled`, with
`canRenderPreview` false, `canProceedToHandoff` false, `canCallBridge` false,
`canFetchLocalhost` false, `canPoll` false, `canExecute` false,
`controlsEnabled` false, and `gateLocked` true.

## Branch Wiring Safety Audit Follow-Up

`docs/avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md` now audits
the implemented branch-only wiring. It confirms the guard remains false, the
branch is unreachable by default, the integration helper call is isolated to the
hard-disabled branch, `integrationEnabled` remains false, only static safe input
is passed, default UI behavior remains unchanged, source extraction remains
unwired, no real selectedRecommendation state is connected/read/rendered, and
no previewState is derived from app or route state.

## Branch Wiring Checkpoint Follow-Up

`docs/avanza-hard-disabled-trade-ui-branch-wiring-checkpoint.md` now documents
that the minimal branch-only wiring exists in `app/trade-app.tsx` and remains
hard-disabled by default. It confirms `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
is false, `integrationEnabled` is false, static safe input is used, no
`modelResult` renders by default, source extraction remains unwired, real
selectedRecommendation input remains disconnected, and no previewState is
derived from app or route state.

## Phase Completion Checkpoint Follow-Up

`docs/avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md`
now marks this implementation phase complete. The completed phase still keeps
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, `integrationEnabled`
false, static safe input only, no default `modelResult`, no source extraction
wiring, no real selectedRecommendation input, no app/route previewState
derivation, and no executable behavior.

## References

- [Avanza hard-disabled Trade UI branch wiring plan](avanza-hard-disabled-trade-ui-branch-wiring-plan.md)
- [Avanza hard-disabled Trade UI branch wiring safety audit](avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md)
- [Avanza hard-disabled Trade UI branch wiring checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring phase completion checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
