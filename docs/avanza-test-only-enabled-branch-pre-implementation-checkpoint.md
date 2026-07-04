# Avanza Test-Only Enabled Branch Pre-Implementation Checkpoint

Status: `avanza_test_only_enabled_branch_pre_implementation_checkpoint_added`

## Current Status

The test-only enabled branch remains unimplemented.

Current status:

- test-only enabled branch planning doc exists
- minimal hard-disabled Trade UI branch wiring exists in `app/trade-app.tsx`
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- integration helper call is only inside the hard-disabled branch
- `integrationEnabled` is false with static safe input
- default integration output is `integration_disabled`
- no `modelResult` renders by default
- default Trade UI remains visually unchanged
- existing `static_fixture` behavior remains unchanged
- source extraction remains not wired into Trade UI
- real selectedRecommendation input has not been connected/read/rendered
- no previewState is derived from app/route state
- no active execution is allowed

## Preconditions Met

Preconditions for a future test-only enabled branch implementation are met only
as a planning boundary:

- hard-disabled source-to-preview integration helper exists
- hard-disabled Trade UI branch wiring phase is complete
- test-only enabled branch planning exists
- the default Trade UI branch is still false-guarded
- the default helper call still uses `integrationEnabled: false`
- static safe input is available
- no runtime activation path exists
- no source extraction to Trade UI connection exists
- no real selectedRecommendation input connection exists

## Allowed Next Implementation Scope

The next implementation may add a pure test-only enabled fixture helper/model
if needed.

Allowed next implementation:

- helper may call the existing hard-disabled source-to-preview integration with
  `integrationEnabled: true`
- only static sanitized fixture input may be passed
- `modelResult` may be produced only inside test-only/fixture-only context
- preview component may render only in test-only/fixture-only context
- normal Trade UI remains unchanged
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- `canProceedToHandoff` remains false
- controls remain disabled
- gate remains locked

The implementation must remain internal/test-only and fixture-only. It must not
read real selectedRecommendation state or derive previewState from app or route
state.

## Required Test-Only Behavior

Required future statuses:

- `test_only_disabled`
- `test_only_fixture_ready`
- `test_only_preview_ready_read_only`
- `test_only_blocked`

Required behavior:

- default status remains disabled or blocked outside test-only fixtures
- fixture-ready status can describe sanitized fixture input only
- preview-ready status can produce read-only model output only
- blocked status explains why fixture-only preview is unavailable
- no status implies handoff readiness
- no status implies execution capability

## Required Fixture-Only Input Rules

Future input rules:

- static sanitized fixture input only
- no real selectedRecommendation input
- no source extraction from Trade UI state
- no app state reads
- no route state reads
- no environment reads
- no `.env.local` reads
- no `localStorage` or `sessionStorage` reads
- no cookies, credentials, sessions, BankID, or storage handling
- no network or bridge input
- no Supabase execution records

## Required Output Model

Required future output guarantees:

- `modelResult` only for `test_only_preview_ready_read_only`
- `canRenderPreview` true only in test-only fixture context
- `canProceedToHandoff` false
- `canCallBridge` false
- `canFetchLocalhost` false
- `canPoll` false
- `canExecute` false
- `controlsEnabled` false
- `gateLocked` true

The output model may prove a static fixture can pass through the source-to-preview
integration chain, but it must remain read-only and non-executing.

## Required Default UI Guarantees

Default UI guarantees:

- default Trade UI remains visually unchanged
- selectedRecommendation preview remains disabled by default
- normal Trade UI does not render selectedRecommendation preview
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- no real selectedRecommendation input is read/rendered
- no previewState is derived from app/route state
- no `modelResult` renders by default
- existing `static_fixture` behavior remains unchanged

## Required Safety Guarantees

Required safety guarantees:

- no active controls
- no handoff button
- no prepare button
- no buy/sell CTA
- no bridge calls
- no localhost fetch
- no polling
- no refresh behavior beyond existing app behavior
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order behavior
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim

## Explicit Non-Goals

This checkpoint does not permit:

- changing `app/trade-app.tsx`
- implementing the test-only enabled branch in this task
- enabling preview
- changing `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` to true
- wiring source extraction into Trade UI
- connecting real selectedRecommendation input
- reading real selectedRecommendation state from app or route state
- rendering real selectedRecommendation preview in normal/default Trade UI
- deriving preview from app or route state
- adding runtime environment config
- changing `.env.local`
- adding `localStorage` or `sessionStorage` enablement
- adding a visible toggle
- adding handoff, prepare, buy/sell CTA, or order behavior

## Go/No-Go Checklist

Go for the next implementation only if all are true:

- implementation is pure or fixture/harness-only
- input is static sanitized fixture data only
- normal Trade UI remains unchanged
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- source extraction remains not wired into Trade UI
- real selectedRecommendation input remains disconnected
- no previewState is derived from app or route state
- controls remain disabled
- gate remains locked
- all bridge/fetch/polling/execution paths remain unavailable

No-go if any next implementation reads app state, route state, real
selectedRecommendation state, environment state, storage state, or adds active
controls.

## Recommended Next Implementation Task

Recommended next implementation task: add a pure test-only enabled fixture
model/helper if needed.

That future helper may call the hard-disabled source-to-preview integration with
`integrationEnabled: true`, but only with static sanitized fixture input. It
must produce read-only output only in test-only/fixture-only context and keep
`canProceedToHandoff`, bridge calls, localhost fetch, polling, execution,
enabled controls, and unlocked gates unavailable.

## Pure Helper Implementation Follow-Up

`lib/avanza-test-only-enabled-preview-fixture-model.ts` now implements the pure
test-only enabled preview fixture model/helper.

The helper accepts explicit arguments only, calls source extraction and the
hard-disabled source-to-preview integration only in pure/model-only code, and
can exercise `integrationEnabled: true` using static sanitized fixture input
only.

The helper returns:

- `test_only_disabled`
- `test_only_fixture_ready`
- `test_only_preview_ready_read_only`
- `test_only_blocked`

`modelResult` is exposed only for `test_only_preview_ready_read_only`.
`canRenderPreview` is true only for that read-only fixture status. All statuses
keep `canProceedToHandoff`, bridge calls, localhost fetch, polling, execution,
enabled controls, and unlocked gates unavailable.

The helper is not wired into `app/trade-app.tsx`, is not wired into the dev
route, reads no real selectedRecommendation state, derives no previewState from
app or route state, and adds no active controls or execution behavior.

## Fixture And Harness Follow-Up

`lib/avanza-test-only-enabled-preview-fixture-model-fixtures.ts` and
`components/execution/AvanzaTestOnlyEnabledPreviewFixtureModelHarness.tsx` now
add static fixtures and an isolated harness for the pure helper.

The fixtures cover:

- `test_only_disabled`
- `test_only_fixture_ready`
- `test_only_preview_ready_read_only`
- `test_only_blocked`

The harness renders fixture/model output only. It is not wired into
`app/trade-app.tsx`, is not wired into the dev route, reads no real
selectedRecommendation state, derives no previewState from app or route state,
and adds no active controls, handoff, bridge/fetch/polling, order behavior,
credential/session handling, or Supabase writes.

## Route Section Plan Follow-Up

`docs/avanza-test-only-enabled-preview-route-section-plan.md` now plans a
future fixture/model-only section on the isolated dev-only visual QA route for
`AvanzaTestOnlyEnabledPreviewFixtureModelHarness`.

The plan is documentation-only. It does not change `app/trade-app.tsx`, does
not change `app/dev/avanza-visual-qa/page.tsx`, does not wire the helper or
harness into Trade UI or the dev route, keeps
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, connects no real
selectedRecommendation input, and derives no previewState from app or route
state.

## Route Section Pre-Implementation Checkpoint Follow-Up

`docs/avanza-test-only-enabled-preview-route-section-pre-implementation-checkpoint.md`
now permits a future task to render the isolated harness on the dev route, but
only as static fixture/model-only content.

The checkpoint keeps `app/trade-app.tsx` unchanged, keeps normal/default UI
preview disabled, keeps real selectedRecommendation input disconnected, keeps
source extraction unwired from Trade UI, and keeps all active controls and
execution behavior forbidden.

## Route Section Implementation Follow-Up

The isolated dev-only visual QA route now renders
`AvanzaTestOnlyEnabledPreviewFixtureModelHarness` with static test-only enabled
preview fixtures only. This is route fixture visibility only: the harness is
still not wired into Trade UI, real selectedRecommendation input remains
disconnected, no previewState is derived from app or route state, and
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

## References

- [Avanza test-only enabled branch planning](avanza-test-only-enabled-branch-planning.md)
- [Avanza test-only enabled preview route section plan](avanza-test-only-enabled-preview-route-section-plan.md)
- [Avanza test-only enabled preview route section pre-implementation checkpoint](avanza-test-only-enabled-preview-route-section-pre-implementation-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring phase completion checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring safety audit](avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md)
- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
