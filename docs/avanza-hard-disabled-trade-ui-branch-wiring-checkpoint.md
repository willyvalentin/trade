# Avanza Hard-Disabled Trade UI Branch Wiring Checkpoint

Status: `avanza_hard_disabled_trade_ui_branch_wiring_checkpoint_added`

## Branch Wiring Status

The minimal hard-disabled Trade UI branch integration wiring now exists in
`app/trade-app.tsx`.

The branch remains hard-disabled by default and has no visible or executable
effect. It exists only as a branch-only placeholder for the hard-disabled
source-to-preview integration helper.

Explicit confirmations:

- `app/trade-app.tsx` contains minimal branch-only integration wiring
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- branch is unreachable by default
- integration helper call is only inside the hard-disabled branch
- `integrationEnabled` is false by default
- static safe input only
- default integration output is `integration_disabled`
- no `modelResult` renders by default
- preview component does not render by default
- source extraction remains not wired into Trade UI
- no real selectedRecommendation state is passed

## App Trade Wiring Summary

The `app/trade-app.tsx` wiring is intentionally narrow:

- imports the hard-disabled source-to-preview integration helper
- calls the helper only inside the existing disabled branch
- passes `integrationEnabled: false`
- passes `sourceKind: static_fixture`
- passes a static source name for the branch
- passes only `modelResult` to the passive preview component if a model result
  ever exists

Because the guard is false and the helper output is disabled by default, the
component is not rendered in the normal Trade UI path.

## Hard-Disabled Guard Status

The guard remains:

- hardcoded false
- not connected to runtime env config
- not connected to `.env.local`
- not connected to `localStorage`
- not connected to `sessionStorage`
- not connected to a visible toggle

The branch is unreachable by default.

## Integration Helper Isolation Status

The integration helper call is isolated inside the hard-disabled branch. It is
not used in the default static fixture render path and is not used by the
selectedRecommendation preview-only path.

Source extraction remains not wired into Trade UI.

## Default UI Behavior

Default Trade UI behavior remains unchanged:

- default Trade UI remains visually unchanged
- existing `static_fixture` behavior remains unchanged
- selectedRecommendation preview remains disabled by default
- the existing Avanza static fixture preview card remains the rendered default
- no hard-disabled integration preview appears by default
- no `modelResult` renders by default
- preview component does not render by default

## Static Safe Input Status

The branch uses static safe input only:

- `integrationEnabled: false`
- `sourceKind: static_fixture`
- static source name

It does not pass app state, route state, source extraction output, adapter
output, derived preview output, or real selectedRecommendation state.

## SelectedRecommendation Non-Read Guarantee

No real selectedRecommendation state is passed, read, or rendered by this
branch.

The branch does not connect source extraction to Trade UI. It does not read
real selectedRecommendation state from app state or route state. It does not
render real selectedRecommendation preview in normal/default Trade UI.

## PreviewState Non-Derivation Guarantee

No `previewState` is derived from app/route state by this branch.

The branch does not call the source extraction helper, adapter helper, derived
preview helper, or real selectedRecommendation derivation helper.

## Safety Audit Summary

The safety audit at
`docs/avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md` verifies the
same branch boundary:

- false guard remains in place
- helper call is branch-only
- `integrationEnabled` remains false
- static safe input only
- no selectedRecommendation read
- no app/route previewState derivation
- no default model render
- no visible effect
- no executable effect

## Validation Summary

Validation covers:

- branch wiring checkpoint doc exists and is non-empty
- `app/trade-app.tsx` contains
  `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false`
- preview guard is not true
- integration helper is referenced only inside the hard-disabled branch
- `integrationEnabled` is false by default
- no real selectedRecommendation input is connected/read/rendered
- source extraction helper is not wired into Trade UI
- no `previewState` is derived from app/route state
- selectedRecommendation preview remains disabled by default
- preview component does not render by default
- model result does not render by default
- no active handoff button exists
- no prepare button exists
- no buy/sell CTA exists
- no bridge/local fetch/polling/execution strings are introduced
- no live endpoint strings or exact trigger phrase appear
- dev route remains fixture/model-only and unlinked

## Safety Guarantees

The checkpoint confirms:

- no bridge calls
- no localhost fetch
- no polling
- no new refresh behavior
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order behavior
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim

## Recommended Next Step

Recommended next step: add a branch wiring phase completion checkpoint.

Add a branch wiring phase completion checkpoint.

Test-only enabled branch planning must remain still read-only and with no
execution.

- still read-only and with no execution

After that, consider a new phase for test-only enabled branch planning, still
read-only and with no execution, no fill, no trigger, no bridge calls, and no
localhost fetch.

## Phase Completion Checkpoint Follow-Up

`docs/avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md`
now marks the hard-disabled Trade UI branch wiring phase complete. It confirms
the minimal `app/trade-app.tsx` branch-only wiring exists, remains unreachable
by default, keeps `integrationEnabled` false, uses static safe input only,
renders no `modelResult` by default, leaves source extraction unwired, connects
no real selectedRecommendation input, derives no previewState from app or route
state, and adds no active controls or execution behavior.

## Test-Only Enabled Branch Planning Follow-Up

`docs/avanza-test-only-enabled-branch-planning.md` now plans the possible next
internal/test-only branch phase. It is planning-only and limited to static
sanitized fixture input. It does not change `app/trade-app.tsx`, does not
enable preview by default, does not connect real selectedRecommendation input,
does not derive previewState from app or route state, and does not add active
controls, bridge/fetch/polling, order behavior, credential/session handling, or
Supabase writes.

## Test-Only Enabled Branch Pre-Implementation Checkpoint Follow-Up

`docs/avanza-test-only-enabled-branch-pre-implementation-checkpoint.md` now
records that any next implementation must remain fixture-only and test-only.
It may add a pure fixture helper/model, but must keep
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, normal Trade UI
unchanged, source extraction unwired, real selectedRecommendation input
disconnected, no app/route previewState derivation, and no active controls or
execution behavior.

## Test-Only Enabled Fixture Helper Follow-Up

`lib/avanza-test-only-enabled-preview-fixture-model.ts` now implements that
pure fixture helper/model. It is not imported by `app/trade-app.tsx`, is not
mounted in the default Trade UI, and is not connected to source extraction from
Trade UI state. The existing hard-disabled branch remains unchanged and still
passes `integrationEnabled: false` with static safe input.

## Test-Only Enabled Fixture Harness Follow-Up

The test-only fixture helper now has static fixtures and an isolated harness at
`lib/avanza-test-only-enabled-preview-fixture-model-fixtures.ts` and
`components/execution/AvanzaTestOnlyEnabledPreviewFixtureModelHarness.tsx`.
They remain unwired from Trade UI and the dev route. Default Trade UI behavior
remains unchanged, selectedRecommendation preview remains disabled by default,
and no real selectedRecommendation input is connected/read/rendered.

## Test-Only Enabled Preview Route Section Plan Follow-Up

`docs/avanza-test-only-enabled-preview-route-section-plan.md` now records the
future route-section plan for showing the test-only enabled fixture harness on
the isolated dev-only visual QA route. It is planning-only and keeps the
harness unwired from both Trade UI and the route for now.

The checkpoint boundary remains unchanged: `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
is false, the hard-disabled branch remains default-off, source extraction is
not wired into Trade UI, no real selectedRecommendation state is read, and no
previewState is derived from app or route state.

## Test-Only Enabled Preview Route Section Pre-Implementation Follow-Up

`docs/avanza-test-only-enabled-preview-route-section-pre-implementation-checkpoint.md`
now adds the explicit pre-implementation gate before any route render of the
test-only harness. It permits only fixture/model-only dev-route visibility and
does not change the hard-disabled Trade UI branch.

## Test-Only Enabled Preview Route Section Implementation Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaTestOnlyEnabledPreviewFixtureModelHarness` using static fixtures only.
The implementation is dev-route-only and does not import the helper or harness
from `app/trade-app.tsx`, does not connect real selectedRecommendation input,
and does not derive previewState from app or route state.

## References

- [Avanza test-only enabled branch pre-implementation checkpoint](avanza-test-only-enabled-branch-pre-implementation-checkpoint.md)
- [Avanza test-only enabled branch planning](avanza-test-only-enabled-branch-planning.md)
- [Avanza test-only enabled preview route section plan](avanza-test-only-enabled-preview-route-section-plan.md)
- [Avanza test-only enabled preview route section pre-implementation checkpoint](avanza-test-only-enabled-preview-route-section-pre-implementation-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring safety audit](avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md)
- [Avanza hard-disabled Trade UI branch wiring phase completion checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring pre-implementation checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-pre-implementation-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring plan](avanza-hard-disabled-trade-ui-branch-wiring-plan.md)
- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration route section checkpoint](avanza-hard-disabled-source-to-preview-integration-route-section-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration plan](avanza-hard-disabled-source-to-preview-integration-plan.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring phase completion checkpoint](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-phase-completion-checkpoint.md)
- [Avanza Trade app passive read-only selectedRecommendation preview wiring safety audit](avanza-trade-app-passive-read-only-selected-recommendation-preview-wiring-safety-audit.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
