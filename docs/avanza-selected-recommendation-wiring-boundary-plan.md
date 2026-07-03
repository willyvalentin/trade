# Avanza Selected-Recommendation Wiring Boundary Plan

Status: planning only. This document does not change app code, wire real
selected recommendation state, switch source modes, render new UI, call the
bridge, or enable execution.

## Goal

Identify the future integration boundary for replacing the static Avanza handoff
preview fixture with preview-only selected recommendation state from the Trade
UI.

## Current Selected Recommendation Boundary

`app/trade-app.tsx` already has a selected recommendation concept:

- `selectedRecommendation` is held as `Recommendation | null` state in
  `TradeApp`.
- `openTradeModal(recommendation)` validates the recommendation, calculates
  position sizing, then sets `selectedRecommendation`.
- `closeTradeModal()` clears `selectedRecommendation`.
- `selectedRecommendationForDisplay` applies symbol/logo metadata to the
  selected recommendation.
- `selectedRecommendationPositionSizing` derives suggested shares from the
  selected recommendation and user settings.
- `selectedRecommendationRiskControlsEvaluation` derives risk controls for the
  selected recommendation.
- `TradeModal` renders when `selectedRecommendationForDisplay` is present.

The future Avanza preview-only handoff should treat that existing
`selectedRecommendation` state as the app-state boundary. It must not create a
separate execution state path.

## Minimal Recommendation-Like Shape

The future adapter should pass only the minimum safe subset into
`buildAvanzaSelectedRecommendationPreviewState(...)`:

- `id` or `recommendationId`
- `ticker`
- `companyName` or `instrumentDisplayName`
- `direction` or `side`
- `positionSizeValue`, `quantity`, or suggested shares from
  `selectedRecommendationPositionSizing`
- `entryPriceValue`, `entryPrice`, `entryLowValue`, `entryHighValue`, or the
  existing entry fallback
- optional `accountDisplayName`, defaulting to `Valentin Labs KF`
- `orderMode`, defaulting to `Avancerad/Limit`

The adapter should remain pure. If the app `Recommendation` shape is too coupled
to import directly, use a structurally typed subset.

## Pure Adapter Boundary

`lib/avanza-selected-recommendation-adapter.ts` now defines the pure structural
adapter for the current Trade UI `selectedRecommendation` shape. It does not
import React state or `app/trade-app.tsx`; callers must pass the selected
recommendation-like object and any already-derived position sizing explicitly.

The adapter normalizes:

- `id`, `recommendationId`, or `recommendation_id`
- `ticker` or `symbol`
- `companyName`, `company_name`, `displayName`, or `instrumentDisplayName`
- `direction` or `side`, with current Trade UI `Long` mapping into the buy-only
  preview path and `Short` remaining blocked downstream
- entry/limit price fields, including entry low/high values
- quantity fields, including optional `positionSizing.suggestedShares`
- optional account and order-mode labels

It returns the recommendation-like input consumed by the existing Avanza preview
pipeline. Missing ticker, non-buy side, missing quantity, and missing price are
still handled by downstream preview-state blockers/advisories. This adapter is
not wired into Trade UI yet; the active source remains `static_fixture`.

## Adapter-Based Scenario Fixtures

`lib/avanza-selected-recommendation-adapter-fixtures.ts` adds fixture scenarios
that start from representative Trade UI selected-recommendation-like shapes,
then flow through the pure adapter and the existing preview-state builder:

1. selected-recommendation-like fixture
2. `adaptSelectedRecommendationToAvanzaHandoffSource(...)`
3. `buildAvanzaSelectedRecommendationPreviewState(...)`

The scenarios cover valid buy, missing ticker/symbol, non-buy `Short`, missing
entry/price, missing suggested shares/quantity, and missing both price and
quantity. They expose the raw input, adapted preview input, generated preview
state, and expected display state for focused tests.

These fixtures are not wired into `app/trade-app.tsx`, do not replace the
static Trade UI fixture, and do not read real selected recommendation state.

## Fixture Gallery Grouping

The fixture-only scenario gallery can now render grouped scenario sets:

- `Generic preview-state scenarios`
- `Adapter-based selectedRecommendation scenarios`

Both groups render through
`AvanzaSelectedRecommendationPreviewStatePanel`. The adapter-based group uses
the representative selectedRecommendation-like fixtures described above, so the
gallery/harness can visually exercise the actual adapter boundary without
reading real Trade UI state.

The gallery and harness remain fixture-only. They are not routed, are not
rendered in the production/main Trade UI by default, and do not enable bridge
calls or execution.

## Read-Only Derivation Step

The first future implementation step for real selected recommendation state
should be read-only derivation only. The planned data flow is:

1. `selectedRecommendation`
2. `adaptSelectedRecommendationToAvanzaHandoffSource(...)`
3. `buildAvanzaSelectedRecommendationPreviewState(...)`
4. render a preview-only card or panel

This may happen as a local derived value inside `app/trade-app.tsx`, or inside
an isolated child component that receives the selected recommendation-like
input and already-derived position sizing as props. In either shape, the
derivation must be pure from the UI's perspective: it can transform already
available data into a preview model, but it must not perform side effects.

The read-only derivation must not happen in:

- the bridge layer
- the Settings read-only bridge fetcher
- a localhost call path
- an execution adapter
- a Supabase write path

Exact safety requirements for the future implementation:

- derived state only
- no side effects
- no `useEffect` that calls the bridge
- no `POST`
- no runner or fill endpoint
- no exact trigger phrase
- no active handoff button
- disabled control only
- source indicator shows `selected_recommendation_preview_only` only when a
  later implementation deliberately switches from the default fixture source
- pre-activation gate remains locked
- total-read unresolved/advisory remains visible

Fallback states must remain the same as the pure builder and adapter fixtures:

- `selectedRecommendation` null: `no_selection` / blocked preview
- non-buy selected recommendation: blocked
- missing ticker: blocked
- missing price or quantity: advisory
- valid buy recommendation: `preview_ready_locked`

Validation for that future implementation must prove:

- no bridge, fetch, polling, trigger, fill, review, final confirmation, submit,
  or order strings are introduced into Trade UI execution paths
- disabled controls remain disabled and have no action handler
- `static_fixture` remains the default source unless an explicit future step
  changes it
- total-read remains advisory and no copy implies production readiness or
  autonomous execution

## Pure Derived Preview-State Helper

`lib/avanza-selected-recommendation-derived-preview-state.ts` now provides the
pure composition helper for the read-only derivation described above:

`buildAvanzaPreviewStateFromSelectedRecommendation(...)`

The helper accepts a selectedRecommendation-like object or `null`, optional
adapter options such as already-derived suggested shares, optional account/order
defaults, optional readiness summary, and an optional source mode. It internally
calls:

1. `adaptSelectedRecommendationToAvanzaHandoffSource(...)`
2. `buildAvanzaSelectedRecommendationPreviewState(...)`

The helper defaults to the active `static_fixture` source mode. A caller must
explicitly pass `selected_recommendation_preview_only` in a later implementation
step if the preview source is deliberately switched. This preserves the current
locked/static default while making the derivation reusable and testable.

The helper is not wired into `app/trade-app.tsx`, does not read React state,
does not fetch, does not call the bridge, and does not add execution behavior.
It preserves the same fallback states: null selection becomes `no_selection`,
non-buy and missing ticker block, missing price or quantity stays advisory,
valid buy becomes `preview_ready_locked`, total-read remains advisory, and the
pre-activation gate remains locked.

## Preview-Only Integration Guard

`lib/avanza-selected-recommendation-preview-integration-guard.ts` defines the
pure guard for any future Trade UI selectedRecommendation derivation. The
default decision is disabled:

- cannot read real selectedRecommendation state
- cannot use the derived preview-state helper
- cannot switch source mode to `selected_recommendation_preview_only`
- cannot render selected-recommendation preview state
- cannot call the bridge
- cannot fetch localhost
- cannot execute

The guard accepts explicit config input rather than reading environment values.
If a future dev-only preview flag is passed, it may return
`preview_only_allowed`, but that still only allows read-only derivation. Bridge
calls, local fetches, execution, active handoff controls, order actions, and any
unlocked pre-activation state remain forbidden.

This guard is not wired into `app/trade-app.tsx`. The current active/default
source remains `static_fixture`, and the Trade UI still uses static fixture data
only.

## Preview-Only Pre-Wiring Checklist

`lib/avanza-selected-recommendation-pre-wiring-checklist.ts` adds the pure
checklist for deciding whether a future preview-only Trade UI wiring attempt is
even allowed to be considered. The current default summary is
`not_ready_for_wiring` because:

- integration guard is disabled
- explicit preview-only flag is missing
- active/default source remains `static_fixture`
- `selected_recommendation_preview_only` is still inactive/future

The checklist also records enforced boundaries:

- Trade UI still uses static fixture data
- no bridge calls allowed
- no localhost fetch allowed
- no execution allowed
- no active button allowed
- pre-activation gate must remain locked
- total-read remains advisory

If tests or a future planning step pass an explicit preview-only guard decision
and the future `selected_recommendation_preview_only` source mode, the checklist
may return `candidate_for_preview_only_wiring`. That status still does not imply
execution readiness: bridge calls, local fetches, execution, active controls,
and unlocked gates remain forbidden.

## Isolated Pre-Wiring Checklist Panel

`components/execution/AvanzaSelectedRecommendationPreWiringChecklistPanel.tsx`
adds a prop-driven renderer for the pre-wiring checklist model. It can display
the summary status, reason, counts, checklist rows, and safety copy for test/dev
visibility.

The panel is not rendered in `app/trade-app.tsx`, is not routed, has no active
controls, does not read app state, does not fetch, does not call the bridge, and
does not add execution behavior. It is intended only as an isolated renderer for
the pure checklist model.

## Trade UI Guarded-Wiring Safety Assertion

`tests/e2e/avanza-trade-ui-no-selected-recommendation-wiring.spec.ts` adds a
focused static safety assertion for `app/trade-app.tsx`. It verifies the Trade
UI still renders the Avanza preview card from static fixture data by default and
that selectedRecommendation derivation can only exist behind the explicit
preview-only integration guard.

The assertion intentionally allows the existing `selectedRecommendation` modal
state used by current Trade UI behavior. It guards the Avanza preview path:
default config must keep `explicitPreviewOnlyFlag: false`, static fixture card
props must remain present, direct adapter/pre-wiring panel imports must stay out
of Trade UI, and any `selected_recommendation_preview_only` source mode must be
inside the guarded derivation path. No bridge, local fetch, trigger, fill, or
active handoff path may appear in the Trade UI Avanza preview surface.

## First Guarded Trade UI Derivation

`app/trade-app.tsx` now contains the first guarded selectedRecommendation
preview-only derivation. The local config remains default-disabled:

`explicitPreviewOnlyFlag: false`

With that default, the rendered Avanza preview card still uses static fixture
data and `static_fixture` source mode. If a future explicit preview-only config
is introduced, the guarded branch can derive a preview state from
`selectedRecommendation` through
`buildAvanzaPreviewStateFromSelectedRecommendation(...)` and render
`AvanzaSelectedRecommendationPreviewStatePanel`.

The guarded branch is still read-only: it has no side effects, no bridge call,
no localhost fetch, no runner/fill endpoint, no active handoff button, no
submit/order path, and the derived preview state must keep disabled controls,
locked pre-activation gate, and total-read advisory.

## Trade UI Integration Status Label

The Trade UI Avanza preview area now renders a small read-only integration
status label. In the default state it shows:

- `Avanza preview source: static fixture`
- `selectedRecommendation preview: disabled`
- `No bridge calls`
- `No execution`

If a future explicit preview-only guard enables the selectedRecommendation
preview branch, the same label may show:

- `Avanza preview source: selectedRecommendation preview-only`
- `Preview-only`
- `Controls disabled`
- `Gate locked`

The label is informational only. It does not add buttons, fetches, bridge calls,
or execution behavior, and it does not change the default static fixture source.

## Future Source-Mode Boundary

The current active/default source remains `static_fixture`.

In a future preview-only wiring step, the source mode may switch only within the
derived preview state from `static_fixture` to
`selected_recommendation_preview_only`. That future mode must remain locked or
disabled:

- no execution allowed
- no bridge calls allowed
- no Trade UI localhost fetch allowed
- no real selected recommendation state allowed outside the explicit preview
  derivation boundary
- pre-activation gate remains locked

## Future Data Path

The future preview-only path should be:

1. selected recommendation state
2. minimal recommendation adapter
3. `buildAvanzaSelectedRecommendationPreviewState(...)`
4. `AvanzaSelectedRecommendationPreviewStatePanel` or
   `AvanzaHandoffPackagePreviewCard`

The preferred first rendering target is a disabled preview-only surface. It must
not replace the existing static fixture card until a separate implementation
step explicitly does so behind a safe guard.

## Strict Boundaries

Any future selected-recommendation preview wiring must remain:

- preview-only
- disabled control
- no bridge calls
- no localhost fetch from Trade UI
- no trigger, fill, click, review, final confirmation, submit, or order behavior
- no Supabase execution write
- total-read unresolved/advisory
- pre-activation gate locked
- no credential, session, BankID, cookie, localStorage, or sessionStorage
  handling

## Fallback Behavior

The preview state must preserve the existing pure-builder behavior:

- no selected recommendation: `no_selection` / blocked preview
- non-buy selected recommendation: blocked
- missing ticker: blocked
- missing quantity or price: advisory
- valid buy recommendation: `preview_ready_locked`
- total-read unresolved/advisory: advisory

No fallback may imply execution readiness or production readiness.

## Implementation Sequence

1. Add a pure adapter for the actual app recommendation shape if needed.
2. Add a local derived preview state behind a static/dev guard.
3. Render preview state with disabled controls.
4. Keep source indicator explicit.
5. Keep pre-activation gate locked.

## Explicit Non-Goals

This plan does not implement:

- app code changes
- real selected recommendation wiring
- source-mode switch
- route or gallery exposure
- active handoff button
- bridge calls
- Trade UI localhost fetch
- polling
- live runner/fill invocation
- `Granska köp` click
- review modal
- final confirmation
- submit or order placement
- Supabase execution write
