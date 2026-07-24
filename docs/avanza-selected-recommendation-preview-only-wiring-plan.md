# Avanza Selected-Recommendation Preview-Only Wiring Plan

Status: planning only. This document does not wire real selected recommendation
state and does not enable Avanza handoff behavior.

## Goal

Define the next phase for replacing the static fixture source with
preview-only selected recommendation wiring. The result should still be a
disabled preview card, not an enabled handoff.

Detailed boundary reference:
`docs/avanza-selected-recommendation-wiring-boundary-plan.md` identifies the
future app-state boundary around `selectedRecommendation` in `app/trade-app.tsx`,
the minimal recommendation-like adapter shape, source-mode handoff point, and
fallback behavior. It is planning only and does not wire app state.

## Future Data Path

The future preview-only path should be:

1. selected recommendation from app state
2. `mapTureRecommendationToAvanzaHandoffInput(...)`
3. `buildAvanzaHandoffPackagePreview(...)`
4. build selected-recommendation contract
5. summarize eligibility
6. build pre-activation gate
7. render preview-only card

This path must remain pure and UI-safe until a separate enablement phase is
approved.

## Phase Boundaries

This phase must still be:

- preview-only
- disabled
- no bridge calls
- no localhost fetch from Trade UI
- no runner/fill invocation
- no click
- no review modal
- no final confirmation
- no submit or order placement
- no Supabase execution write
- no credential, session, BankID, cookie, localStorage, or sessionStorage handling

## Required UI Behavior

The preview-only card should behave as follows:

- no recommendation selected: blocked preview / no selected recommendation
- non-buy selected recommendation: blocked buy-only reason
- missing ticker: blocked
- missing quantity or position size: advisory gap
- missing entry or limit price: advisory gap
- valid buy recommendation: preview-ready, but not enabled
- total-read unresolved/advisory: advisory and requires human visual confirmation

No state should imply execution readiness or production readiness.

## Required Source-Mode Behavior

Introduce the future source mode:
`selected_recommendation_preview_only`.

That source mode must remain locked or disabled:

- real selected recommendation state is not allowed yet
- Trade UI localhost fetch is not allowed
- no execution allowed
- no bridge calls allowed
- no production readiness claim
- no active handoff control
- pre-activation gate remains locked unless a later explicit dev-only
  enablement phase changes it

## Implementation Sequence

1. Add source-mode enum/model support for `selected_recommendation_preview_only`,
   still disabled. Completed as a future/inactive mode; active/default remains
   `static_fixture`.
2. Add a pure selected recommendation preview state builder. Completed as
   `lib/avanza-selected-recommendation-preview-state.ts`; it composes the
   mapper, package preview, selected-recommendation contract, eligibility
   summary, safety boundary summary, and pre-activation gate without reading app
   state or wiring UI.
3. Render preview-only card from selected recommendation behind a safe flag or
   dev-only UI guard.
4. Keep button disabled.
5. Keep pre-activation gate locked unless explicitly moved later.

## Existing Pure Building Blocks

The plan should reuse:

- `avanza-ture-recommendation-handoff-mapper`
- `avanza-handoff-package-preview`
- `avanza-selected-recommendation-handoff-contract`
- `avanza-handoff-pre-activation-gate`
- `avanza-selected-recommendation-preview-state`
- read-only readiness summary
- safety boundary summary

## Preview State Builder

`buildAvanzaSelectedRecommendationPreviewState(...)` is a pure helper for the
future preview-only selected-recommendation phase. It accepts an optional
recommendation-like input, source mode, read-only readiness summary, and
account/order defaults. It returns:

- source mode
- package preview when a selected recommendation is present
- selected-recommendation contract
- eligibility summary
- pre-activation gate
- safety boundary summary
- display state: `no_selection`, `blocked`, `advisory`, or
  `preview_ready_locked`

The helper is not wired into Trade UI. Active/default source remains
`static_fixture`, and the existing Trade preview still uses static fixture data
only.

## Static Preview State Scenarios

`lib/avanza-selected-recommendation-preview-state-fixtures.ts` defines reusable
static scenarios for the preview state builder:

- no selection
- valid buy recommendation
- non-buy/sell recommendation
- missing ticker
- missing quantity
- missing price
- missing quantity and price

Each scenario is built through `buildAvanzaSelectedRecommendationPreviewState(...)`
from a static recommendation-like fixture or `null`. The scenarios expose a
scenario id, label, expected display state, and generated preview state.

These scenarios are for tests and future preview-only design work only. They
are not wired into Trade UI, do not replace the current static Trade fixture,
and do not enable bridge calls or execution.

## Preview State Renderer

`components/execution/AvanzaSelectedRecommendationPreviewStatePanel.tsx`
renders a selected-recommendation preview state model as a preview-only panel.
It accepts the pure preview state as props and displays:

- display state
- source mode
- package preview summary when available
- eligibility summary
- pre-activation gate summary
- key blockers and advisories
- total-read unresolved/advisory
- preview-only / not execution-ready copy

The renderer has no active controls, does not fetch, does not call the bridge,
does not read app state, and is not wired into the main Trade UI. Its current
coverage is fixture/test rendering only.

## Fixture-Only Scenario Gallery

`components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGallery.tsx`
renders every static selected-recommendation preview state scenario through
`AvanzaSelectedRecommendationPreviewStatePanel`. It shows each scenario label,
expected display state, and rendered panel.

The gallery is explicitly labeled fixture-only, not connected to real selected
recommendation state, with no bridge calls and no execution. It is not rendered
in the main Trade UI by default and is currently covered through focused tests
only.

## Test-Only / Dev-Only Gallery Access Plan

The scenario gallery may later be exposed for visual QA only through one of
these isolated access patterns:

- test-only render harness
- dev-only route behind an explicit feature flag
- Storybook-like isolated component view, if the project adopts that pattern

This plan does not add a route and does not render the gallery in the main app.

Forbidden access patterns:

- no production route
- no default render in the main Trade UI
- no real selected recommendation state
- no bridge calls
- no localhost fetch
- no trigger, fill, click, review, final confirmation, submit, or order behavior

If a dev-only route is added later, it must require:

- explicit feature flag
- static fixtures only
- no bridge or fetch calls
- no active controls
- source mode remains `static_fixture` or a future fixture-scenario-only mode
- every pre-activation gate remains locked

The gallery exists for visual QA of the preview-only state model. It must not be
used as an enablement surface for handoff execution.

`lib/avanza-scenario-gallery-access.ts` defines the pure access decision model
for this future visual QA surface. The default decision is `disabled` with
`canRenderGallery: false`. If an explicit dev-only flag is passed into the pure
builder, it can return `dev_only_allowed`, but it still forbids real selected
recommendation state, bridge calls, local fetches, and execution.

The model does not read environment variables, add a route, render the gallery,
or change the active source mode.

## Scenario Gallery Access Harness

`components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness.tsx`
is an isolated component-level harness for the gallery access decision. It
accepts a pure access decision and static scenario fixtures as props.

Harness behavior:

- default/blocked access renders disabled access copy only
- `dev_only_allowed` with `canRenderGallery: true` renders the fixture-only
  scenario gallery
- no environment variables are read
- no route is added
- no main Trade UI render is added
- no active controls are added

The harness keeps the visual QA boundary explicit: fixture-only, no real
selected recommendation state, no bridge calls, no localhost fetch, and no
execution.

Focused harness coverage now verifies all static preview-state scenarios under
the dev-only fixture access decision: no selection, valid buy, non-buy/sell,
missing ticker, missing quantity, missing price, and missing quantity plus
price. The same coverage confirms default access remains disabled, every gate
stays locked, total-read remains advisory, and no active controls are present.

## Explicit Non-Goals

This plan does not implement:

- real selected recommendation wiring
- active handoff button
- Trade UI bridge calls
- Trade UI localhost fetch
- polling
- live runner/fill invocation
- `Granska köp` click
- review modal
- final confirmation
- submit or order placement
- Supabase execution write

## References

- [Avanza handoff architecture checkpoint](avanza-handoff-architecture-checkpoint.md)
- [Avanza handoff dev-only enablement plan](avanza-handoff-dev-only-enablement-plan.md)
- [Avanza selected-recommendation wiring boundary plan](avanza-selected-recommendation-wiring-boundary-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
