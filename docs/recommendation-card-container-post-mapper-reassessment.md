# RecommendationCardContainer Post-Mapper Reassessment

## 1. Purpose

This reassessment records the state of `RecommendationCardContainer` after
Action 353 extracted pure recommendation card display mapping into
`components/recommendations/recommendation-card-display-mapper.ts`.

The goal is to decide whether the container boundary is now safe to extract, or
whether the Recommendations refactor should pause and shift to Live Day Trades.
This assessment is documentation-only and does not move state, callbacks,
ADD TRADE validation, discard persistence, selected `TradeModal` wiring,
Supabase/localStorage behavior, or execution handoff behavior.

## 2. Current Recommendations Component Inventory

Current file/component sizes:

- `app/trade-app.tsx`: approximately 41,022 lines.
- `components/recommendations/RecommendationsTab.tsx`: 50 lines.
- `components/recommendations/RecommendationCard.tsx`: 136 lines.
- `components/recommendations/DiscardRecommendationModal.tsx`: 95 lines.
- `components/recommendations/RecommendationDetailsModal.tsx`: 853 lines.
- `components/recommendations/recommendation-details-display-helpers.ts`: 143
  lines.
- `components/recommendations/recommendation-card-display-mapper.ts`: 182 lines.

Extracted pieces:

- `RecommendationsTab`
  - Presentational Recommendations tab shell.
- `RecommendationCard`
  - Presentational card shell, metric display, card buttons, and modal slots.
- `DiscardRecommendationModal`
  - Presentational discard confirmation modal.
- `RecommendationDetailsModal`
  - Presentational details modal plus direct render-only details helpers.
- `recommendation-details-display-helpers.ts`
  - Pure details formatting and tone helpers.
- `recommendation-card-display-mapper.ts`
  - Pure card display mapping for metrics, confidence labels/tones, confidence
    breakdown rows, summary fallback, source badge descriptors, ADD TRADE
    display labels/disabled flags, and details-modal display props.

Remaining local piece:

- `RecommendationCardContainer` in `app/trade-app.tsx`.

## 3. Remaining RecommendationCardContainer Responsibilities

The remaining local container is now roughly 90 lines of executable/rendering
code, excluding adjacent shared helpers such as `DataModePill`.

State reads and derived values:

- Reads the current `recommendation` prop.
- Computes freshness with `getRecommendationFreshness(toFreshnessInput(...))`.
- Computes ADD TRADE gate with `getAddTradeGate(...)`.
- Computes key reasons with `getRecommendationKeyReasons(...)`.
- Calls `buildRecommendationCardDisplayProps(...)` with already-computed
  inputs.

Local UI state:

- `isDetailsOpen`
- `isDiscardConfirmOpen`
- `isConfirmingDiscard`

Callbacks:

- Calls parent `onTakeTrade(recommendation)` from the card ADD TRADE button.
- Calls parent `onIgnore(recommendation)` from discard confirmation.
- Owns only modal open/close and discard confirmation loading state.

Modal wiring:

- Renders `DiscardRecommendationModal` into the `RecommendationCard` discard
  slot when `isDiscardConfirmOpen` is true.
- Renders `RecommendationDetailsModal` into the details slot when
  `isDetailsOpen` is true.
- Passes parent-provided analysis objects through to the details modal:
  - `calibrationGuardrails`
  - `preTradeRiskContext`
  - `tradeEligibility`
  - `decisionStack`
  - `positionSizing`

ADD TRADE wiring:

- The container does not perform ADD TRADE validation itself.
- It invokes parent `onTakeTrade(...)`; `app/trade-app.tsx` still owns
  `openTradeModal(...)`, validation, selected recommendation state, broker
  preview construction, and execution handoff creation.

Discard wiring:

- The container does not persist discard state itself.
- It invokes parent `onIgnore(...)`; `app/trade-app.tsx` still owns
  `updateRecommendationStatus(...)` and all persistence behavior.

Selected `TradeModal` wiring:

- The container does not render or own selected `TradeModal`.
- Selected recommendation state and `TradeModal` rendering remain in
  `app/trade-app.tsx`.

Mapper usage:

- The container delegates pure display props to
  `buildRecommendationCardDisplayProps(...)`.
- Remaining display-only code is mostly render-slot assembly:
  - `CompanyIdentity`
  - `DataModePill`
  - `DataModePillRow`

Persistence/localStorage/Supabase dependencies:

- The container has no direct Supabase or localStorage calls.
- Persistence remains behind parent callbacks.

Execution handoff dependencies:

- The container has no direct execution handoff construction.
- It only calls the parent ADD TRADE callback.

## 4. Extraction Readiness

Is `RecommendationCardContainer` now safe to extract?

Yes, with a narrow presentational/container boundary. The display mapper has
removed the most fragile inline display derivation. The remaining container is
mostly:

- local UI state for card modals,
- slot composition,
- callback bridge wiring,
- pass-through detail modal props.

The safest extraction target would be a dedicated component such as
`components/recommendations/RecommendationCardContainer.tsx`.

Likely props needed:

- `recommendation`
- `calibrationGuardrails`
- `preTradeRiskContext`
- `tradeEligibility`
- `decisionStack`
- `positionSizing`
- `isSaving`
- `isValidating`
- `onTakeTrade`
- `onIgnore`
- render slots or render helpers for shared app-wide visuals:
  - identity rendering, or enough fields to render `CompanyIdentity`
  - source badge rendering, or reusable exported `DataModePill` /
    `DataModePillRow`

What must stay in `app/trade-app.tsx`:

- Recommendation data construction and filtering.
- `dailyRecommendations.map(...)` data selection, unless the tab shell is
  expanded later.
- `openTradeModal(...)`.
- ADD TRADE validation and selected recommendation state.
- Selected `TradeModal` rendering.
- `updateRecommendationStatus(...)` and discard persistence.
- Supabase/localStorage behavior.
- Execution handoff creation.
- App-wide refresh/loading/error state.

Likely risk/payoff:

- Payoff is moderate: it removes the remaining recommendation card container
  from `app/trade-app.tsx` and leaves the Recommendations card area almost
  fully componentized.
- Risk is now acceptable if the extraction copies the current callback wiring
  exactly and keeps parent callbacks unchanged.
- Prop drilling is manageable because the container already has an explicit
  prop list.
- The main design choice is whether to also extract shared `CompanyIdentity`
  and data-mode badge render helpers. The lowest-risk option is to pass render
  nodes/callbacks or keep those helpers available from parent/shared modules
  rather than moving broad app-wide visuals prematurely.

## 5. Candidate Next Actions

1. Extract `RecommendationCardContainer` boundary.
   - Highest immediate payoff in the Recommendations area.
   - Now safe enough after display mapper extraction.
   - Must preserve parent callback ownership and local modal state behavior.

2. Extract smaller remaining recommendation helpers.
   - Lower payoff.
   - `CompanyIdentity`, `DataModePill`, and `DataModePillRow` are shared beyond
     Recommendations, so moving them now could create broader churn.

3. Pause Recommendations and create Live Day Trades tab extraction plan.
   - Reasonable soon, but one clear Recommendations extraction remains.
   - Better after `RecommendationCardContainer` is moved.

4. Reassess `trade-app.tsx` overall after Recommendations extraction.
   - Useful after the container boundary is extracted and the recommendation
     card area is mostly outside the parent file.

## 6. Recommended Next Action

Recommended next action:

**Action 355 - Extract RecommendationCardContainer Boundary**

Action 355 should:

- Create `components/recommendations/RecommendationCardContainer.tsx`.
- Move the existing local container with its local UI state and modal slot
  composition.
- Keep parent callback implementations in `app/trade-app.tsx`.
- Keep `openTradeModal(...)`, `updateRecommendationStatus(...)`, selected
  `TradeModal`, Supabase/localStorage behavior, recommendation data
  construction, and execution handoff behavior parent-owned.
- Preserve all visible card text, button labels, modal behavior, class names,
  and e2e-visible strings.

## 7. Risk Assessment

ADD TRADE behavior risk:

- The card ADD TRADE button must continue to call the parent `onTakeTrade` with
  the same recommendation object.
- ADD TRADE validation and selected `TradeModal` state must stay in
  `app/trade-app.tsx`.

Discard/details state risk:

- Details and discard state may move with the container in Action 355, but this
  state is local UI state only.
- The discard persistence callback must remain parent-owned.
- The async discard confirmation loading behavior must be copied exactly.

Selected `TradeModal` risk:

- The extracted container must not render or manage selected `TradeModal`.
- It should only invoke the ADD TRADE callback.

Callback/prop drilling risk:

- Prop drilling is acceptable because the existing container prop list is
  explicit and moderate.
- Avoid broad `any` props or hidden dependency bags.

Supabase/localStorage risk:

- The extracted container must not import Supabase clients, localStorage helpers,
  recommendation persistence helpers, or execution handoff code.
- All persistence should remain behind parent callbacks.

E2E-visible text/design risk:

- Preserve `ADD TRADE`, `Review Setup`, `Validating Setup`, `Discard`, card
  metrics, source badges, details modal labels, and discard modal copy.
- Preserve `RecommendationCard` and modal slot composition order.
- Preserve class names and event stop-propagation behavior.

## 8. Verification

Action 354 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 355 Result

Action 355 added
`components/recommendations/RecommendationCardContainer.tsx`.

Extraction result:

- Moved the narrow `RecommendationCardContainer` boundary out of
  `app/trade-app.tsx`.
- The extracted container composes:
  - `RecommendationCard`
  - `RecommendationDetailsModal`
  - `DiscardRecommendationModal`
  - `recommendation-card-display-mapper`
- Moved only card-local UI state with the container:
  - `isDetailsOpen`
  - `isDiscardConfirmOpen`
  - `isConfirmingDiscard`
- The parent now passes explicit freshness, ADD TRADE gate, key reasons,
  analysis objects, and render slots for shared identity/source-badge visuals.

What stayed in `app/trade-app.tsx`:

- Recommendation data construction and filtering.
- ADD TRADE validation and `openTradeModal(...)`.
- Discard persistence and `updateRecommendationStatus(...)`.
- Selected `TradeModal` state/wiring.
- Supabase/localStorage behavior.
- Execution handoff creation.
- App-wide state/effects and refresh orchestration.
- Shared app-wide visuals:
  - `CompanyIdentity`
  - `DataModePill`
  - `DataModePillRow`

Behavior preservation:

- Card UI, details modal UI, discard modal UI, button labels/order, disabled
  states, source badges, identity rendering, details close behavior, discard
  confirmation flow, and callback routing were preserved.
- No ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, execution handoff behavior, Avanza/browser
  behavior, or trade mutation behavior moved into the component.

What remained inline and why:

- Freshness, ADD TRADE gate, and key-reason derivation remain in
  `app/trade-app.tsx` because they are app-specific readbacks and keep
  validation-adjacent behavior parent-owned.
- `CompanyIdentity`, `DataModePill`, and `DataModePillRow` remain inline because
  they are shared by multiple app-wide domains beyond Recommendations.

Next recommended action:

**Action 356 - Reassess Recommendations Area After Container Extraction**

## 10. Action 356 Result

Action 356 added
`docs/recommendations-area-post-container-extraction-reassessment.md`.

Assessment result:

- Reassessed the Recommendations area after `RecommendationCardContainer`
  extraction.
- Confirmed the main Recommendations presentation boundaries are now extracted:
  tab shell, card container, card view, details modal, discard modal, card
  display mapper, and details display helpers.
- Confirmed `app/trade-app.tsx` still intentionally owns recommendation data
  construction/filtering, ADD TRADE validation, discard persistence, selected
  `TradeModal`, Supabase/localStorage behavior, execution handoff behavior, and
  shared identity/source-badge render slots.
- Determined Recommendations extraction is complete enough to pause.

Next recommended action:

**Action 357 - Create Live Day Trades Tab Extraction Plan**
