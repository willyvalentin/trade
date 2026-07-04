# Avanza Test-Only Enabled Preview Route Section Plan

## Purpose

This document plans a possible future section on the isolated dev-only Avanza
visual QA route for the test-only enabled preview fixture model.

The future section would make the static test-only fixture states visible for
visual QA only. It would remain fixture/model-only, use static sanitized input
only, read no real selectedRecommendation state from the app or route, add no
Trade UI wiring, enable no runtime preview path, derive no previewState from
app or route state, and add no handoff or execution behavior.

## Strict Phase Boundary

This phase is planning only.

This task does not change route code, Trade UI code, or app code. It does not
wire `AvanzaTestOnlyEnabledPreviewFixtureModelHarness` into
`app/dev/avanza-visual-qa/page.tsx`, does not wire the helper or harness into
`app/trade-app.tsx`, does not connect real selectedRecommendation input, does
not read real selectedRecommendation state, does not derive previewState from
app or route state, and does not enable selectedRecommendation preview.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

## Allowed Future Implementation

A later explicit route-section implementation may import and render
`AvanzaTestOnlyEnabledPreviewFixtureModelHarness` from
`app/dev/avanza-visual-qa/page.tsx`.

That future section may show only the static fixtures from
`lib/avanza-test-only-enabled-preview-fixture-model-fixtures.ts`. The section
must clearly label:

- test-only enabled preview fixture model
- Test-only fixture only
- Static sanitized input only
- No real selectedRecommendation state is read
- No real selectedRecommendation state is rendered
- No previewState is derived
- No Trade UI wiring
- No bridge calls
- No localhost fetch
- No polling
- No execution
- Controls disabled
- Gate locked

The dev route must remain unlinked from main navigation. The helper and harness
must remain unwired from Trade UI. The test-only path must remain disconnected
from real Trade UI runtime state.

## Required Visible Fixture Statuses

The future route section must show all fixture statuses:

- `test_only_disabled`
- `test_only_fixture_ready`
- `test_only_preview_ready_read_only`
- `test_only_blocked`

## Output Visibility Rules

`modelResult` may be visible only for `test_only_preview_ready_read_only`.
`canRenderPreview` may be true only for `test_only_preview_ready_read_only`.

Every status must keep:

- `canProceedToHandoff` false
- bridge calls false
- localhost fetch false
- polling false
- execution false
- controls disabled
- gate locked

## Forbidden Behavior

The future section must not:

- read or render real selectedRecommendation state
- wire anything into Trade UI
- connect a real runtime preview model
- derive previewState from app or route state
- enable default Trade UI selectedRecommendation preview
- add an active handoff button
- call bridge or localhost
- poll
- add fill, click, review, final, submit, or order behavior
- handle credentials, session, BankID, cookies, or storage
- write Supabase execution records
- claim production readiness

## Future Test Requirements

If the route section is later implemented, tests must prove:

- the route renders the test-only enabled preview harness section
- the route section says Test-only fixture only
- the route section says Static sanitized input only
- the route section says no real selectedRecommendation state is read or rendered
- the route section says no previewState is derived
- all four test-only fixture statuses are visible
- `test_only_preview_ready_read_only` is labeled read-only/model-only
- `modelResult` appears only for `test_only_preview_ready_read_only`
- `canRenderPreview` is true only for `test_only_preview_ready_read_only`
- controls remain disabled
- gate remains locked
- no active handoff button exists
- no buy/sell CTA exists
- no prepare button exists
- no live endpoint strings or exact trigger phrase appear
- the route remains unlinked from main navigation
- `app/trade-app.tsx` does not import the test-only helper or harness

## Recommended Implementation Sequence

1. Add this route section plan.
2. Add a route section pre-implementation checkpoint.
3. Render the test-only enabled preview harness on the dev QA route as fixture/model-only.
4. Add a route section checkpoint.
5. Add a safety audit.
6. Add a phase completion checkpoint.
7. Only later consider real selectedRecommendation read-only connection planning.

## Current Safety State

The test-only enabled preview fixtures and harness remain isolated. They are
not wired into Trade UI and are not wired into the dev route. Source extraction
remains not wired into Trade UI. Real selectedRecommendation input is not
connected, read, or rendered. No previewState is derived from app or route
state. No active controls, handoff, prepare button, buy/sell CTA, bridge/fetch,
polling, order behavior, credential/session handling, or Supabase write is
added by this plan.

## Pre-Implementation Checkpoint Follow-Up

`docs/avanza-test-only-enabled-preview-route-section-pre-implementation-checkpoint.md`
now records the go/no-go boundary before rendering the isolated harness on the
dev-only visual QA route.

The checkpoint permits only a future fixture/model-only route section in
`app/dev/avanza-visual-qa/page.tsx`. It still forbids Trade UI wiring, real
selectedRecommendation reads, normal/default preview enablement, app/route
previewState derivation, active controls, handoff, bridge/fetch/polling, order
behavior, credential/session handling, and Supabase writes.

## Route Section Implementation Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaTestOnlyEnabledPreviewFixtureModelHarness` as a fixture/model-only
section using only
`avanzaTestOnlyEnabledPreviewFixtureModelFixtures`.

The route section shows the four static statuses, keeps
`test_only_preview_ready_read_only` read-only/model-only, keeps `modelResult`
and `canRenderPreview` limited to that status, keeps all controls disabled,
keeps the gate locked, and keeps handoff, bridge/local fetch, polling,
execution, order behavior, credential/session handling, and Supabase writes
unavailable. It does not change `app/trade-app.tsx` or normal/default Trade UI.

## References

- [Avanza test-only enabled preview route section pre-implementation checkpoint](avanza-test-only-enabled-preview-route-section-pre-implementation-checkpoint.md)
- [Avanza test-only enabled branch planning](avanza-test-only-enabled-branch-planning.md)
- [Avanza test-only enabled branch pre-implementation checkpoint](avanza-test-only-enabled-branch-pre-implementation-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring phase completion checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring safety audit](avanza-hard-disabled-trade-ui-branch-wiring-safety-audit.md)
- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
