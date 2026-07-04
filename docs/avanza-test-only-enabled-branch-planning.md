# Avanza Test-Only Enabled Branch Planning

Status: `avanza_test_only_enabled_branch_planning_added`

## Purpose

This document plans a future internal/test-only way to exercise the
hard-disabled Trade UI source-to-preview integration chain with
`integrationEnabled: true`.

The planned path is limited to static fixture input only. It is not a runtime
activation path, does not make the preview visible by default, does not connect
real selectedRecommendation input, and does not add execution behavior.

Purpose:

- exercise source-to-preview integration in an internal/test-only context
- use static sanitized fixture input only
- keep normal/default Trade UI unchanged
- keep selectedRecommendation preview disabled by default
- keep `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false
- keep all controls disabled
- keep the gate locked
- add no handoff or execution behavior

## Strict Phase Boundary

This phase is planning only.

This document does not:

- change app code
- change `app/trade-app.tsx`
- implement the test-only enabled branch
- enable preview in default UI
- connect real selectedRecommendation input
- read real selectedRecommendation state from app or route state
- derive previewState from app or route state
- add runtime environment config
- add storage-backed activation
- add visible toggles
- add active controls
- add handoff or execution behavior

The existing hard-disabled Trade UI branch remains guarded by
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false`.

## Current Baseline

Current baseline:

- minimal hard-disabled Trade UI branch wiring exists in `app/trade-app.tsx`
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- the integration helper call is only inside the hard-disabled branch
- `integrationEnabled` is false with static safe input
- default integration output is `integration_disabled`
- no `modelResult` renders by default
- default Trade UI remains visually unchanged
- existing `static_fixture` behavior remains unchanged
- source extraction remains not wired into Trade UI
- real selectedRecommendation input is not connected/read/rendered
- no previewState is derived from app or route state

## Allowed Future Shape

A future implementation may add an internal/test-only helper or harness that
calls the hard-disabled source-to-preview integration helper with
`integrationEnabled: true`.

Allowed future shape:

- static sanitized fixture input only
- no real selectedRecommendation input
- no app state reads
- no route state reads
- `modelResult` may exist only in a test-only/fixture-only context
- preview component may render only in a test-only/fixture-only context
- normal Trade UI remains unchanged
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- `canProceedToHandoff` remains false
- controls remain disabled
- gate remains locked

The test-only path may prove the integration can produce a read-only preview
model, but that proof must stay separate from the default Trade UI path.

## Disallowed Shape

Future implementation must not add:

- real selectedRecommendation state
- app state reads for preview derivation
- route state reads for preview derivation
- runtime environment enablement
- `.env.local` enablement
- `localStorage` or `sessionStorage` enablement
- visible toggle
- production UI activation
- source extraction wiring into normal Trade UI
- previewState derivation from app or route state
- bridge calls
- localhost fetch
- polling
- refresh behavior beyond existing app behavior
- Supabase execution writes
- handoff, prepare, buy/sell CTA, runner/fill, click, review, final, submit,
  or order behavior
- credential, session, BankID, cookie, or storage handling
- production readiness claim

## Required Future Statuses

The future model or harness should distinguish these statuses:

- `test_only_disabled`
- `test_only_fixture_ready`
- `test_only_preview_ready_read_only`
- `test_only_blocked`

These statuses must describe fixture/model state only. They must not imply
runtime enablement, production visibility, handoff readiness, or execution.

## Required Future Output Guarantees

Future output guarantees:

- `modelResult` only for `test_only_preview_ready_read_only`
- `canRenderPreview` true only in the test-only fixture context
- `canProceedToHandoff` false
- `canCallBridge` false
- `canFetchLocalhost` false
- `canPoll` false
- `canExecute` false
- `controlsEnabled` false
- `gateLocked` true

The future enabled fixture path may validate read-only preview rendering, but it
must not create any active handoff or execution capability.

## Future Test Requirements

Future implementation tests must prove:

- default Trade UI remains visually unchanged
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- normal Trade UI does not render selectedRecommendation preview
- test-only fixture path may produce `modelResult`
- test-only fixture path may render read-only preview
- test-only fixture path uses static sanitized input only
- no real selectedRecommendation input is read or rendered
- no previewState is derived from app or route state
- no active handoff button exists
- no prepare button exists
- no buy/sell CTA exists
- no bridge, localhost fetch, polling, or execution strings are introduced
- no live endpoint strings or exact trigger phrase appear

## Recommended Implementation Sequence

Recommended sequence:

1. Add this planning document.
2. Add a test-only enabled branch pre-implementation checkpoint.
3. Add a pure test-only enabled fixture model/helper if needed.
4. Add fixtures and harness for test-only enabled preview.
5. Render the harness only on the dev QA route as fixture/model-only.
6. Add safety audit and phase completion checkpoint.
7. Only later consider real selectedRecommendation read-only connection
   planning.

## Safety Summary

This plan adds no app code and does not implement the test-only enabled branch.
It keeps default Trade UI unchanged, keeps selectedRecommendation preview
disabled by default, keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
false, keeps source extraction unwired from Trade UI, connects no real
selectedRecommendation input, and derives no previewState from app or route
state.

No active controls, handoff, prepare, buy/sell CTA, bridge/fetch/polling,
order behavior, credential/session handling, or Supabase write is added by this
plan.

## Pre-Implementation Checkpoint Follow-Up

`docs/avanza-test-only-enabled-branch-pre-implementation-checkpoint.md` now
records the go/no-go boundary before any test-only enabled branch
implementation. It permits only a future pure fixture helper/model that may
call the existing hard-disabled source-to-preview integration with
`integrationEnabled: true` using static sanitized fixture input only.

The checkpoint still forbids default Trade UI activation, real
selectedRecommendation reads, source extraction wiring into Trade UI,
previewState derivation from app or route state, active controls, handoff,
bridge/fetch/polling, order behavior, credential/session handling, and
Supabase writes.

## Pure Helper Implementation Follow-Up

`lib/avanza-test-only-enabled-preview-fixture-model.ts` now implements the
planned pure fixture helper. It is explicit-input only and may call the source
extraction helper plus the hard-disabled source-to-preview integration helper
in model-only code.

The helper can produce `test_only_preview_ready_read_only` only from static
sanitized fixture input with `testOnlyEnabled: true`. It is not wired into
Trade UI or the dev route, keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW`
false, connects no real selectedRecommendation input, derives no previewState
from app or route state, and adds no active controls, handoff, bridge/fetch,
polling, order behavior, credential/session handling, or Supabase writes.

## Fixture And Harness Follow-Up

`lib/avanza-test-only-enabled-preview-fixture-model-fixtures.ts` now provides
static sanitized fixtures for all four test-only statuses, and
`components/execution/AvanzaTestOnlyEnabledPreviewFixtureModelHarness.tsx` now
renders those fixtures in isolation.

The fixtures and harness are not wired into Trade UI or the dev route. They
remain fixture/model-only, keep `modelResult` exclusive to
`test_only_preview_ready_read_only`, keep all controls disabled, keep the gate
locked, and add no bridge/fetch/polling, handoff, order behavior,
credential/session handling, or Supabase writes.

## Route Section Plan Follow-Up

`docs/avanza-test-only-enabled-preview-route-section-plan.md` now defines the
planning-only path for rendering the isolated test-only enabled preview harness
on the dev-only visual QA route later.

That plan allows only a future fixture/model-only route section with static
sanitized input. It still forbids Trade UI wiring, real selectedRecommendation
reads, app/route previewState derivation, runtime preview enablement, active
controls, handoff, bridge/fetch/polling, order behavior, credential/session
handling, and Supabase writes.

## Route Section Pre-Implementation Checkpoint Follow-Up

`docs/avanza-test-only-enabled-preview-route-section-pre-implementation-checkpoint.md`
now records the explicit go/no-go checklist before route rendering. It allows
only a future dev-route fixture section for the isolated harness and keeps
Trade UI, real selectedRecommendation input, app/route previewState derivation,
active controls, handoff, and execution out of scope.

## Route Section Implementation Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now includes the test-only enabled preview
fixture harness as a dev-route-only section. The section uses only static
sanitized fixtures, remains unlinked from main navigation, keeps normal/default
Trade UI unchanged, and adds no active controls, handoff, bridge/fetch/polling,
order behavior, credential/session handling, or Supabase writes.

## References

- [Avanza test-only enabled branch pre-implementation checkpoint](avanza-test-only-enabled-branch-pre-implementation-checkpoint.md)
- [Avanza test-only enabled preview route section plan](avanza-test-only-enabled-preview-route-section-plan.md)
- [Avanza test-only enabled preview route section pre-implementation checkpoint](avanza-test-only-enabled-preview-route-section-pre-implementation-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring phase completion checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring safety audit](avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md)
- [Avanza hard-disabled Trade UI branch wiring plan](avanza-hard-disabled-trade-ui-branch-wiring-plan.md)
- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
