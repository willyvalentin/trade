# Recommendations Tab Extraction Plan

## 1. Purpose

This plan defines a safe path for extracting the Recommendations tab after the
Execution Handoff Preview Modal decomposition paused at Action 341.

The goal is to reduce `app/trade-app.tsx` while preserving recommendation
loading, card interactions, ADD TRADE behavior, discard behavior, execution
handoff integration, local/demo behavior, and visible UI exactly.

This action is documentation-only. It does not change runtime behavior.

## 2. Current Recommendations Tab Inventory

Approximate locations in `app/trade-app.tsx`:

- primary Recommendations tab render: around lines 14,671-14,745
- `RecommendationCard`: starts around line 22,504
- recommendation details modal helpers and `RecommendationDetailsModal`: around
  lines 24,500-25,250
- selected recommendation `TradeModal` mount: around lines 15,899-15,913
- ADD TRADE validation/open handler: around lines 9,469-9,595
- recommendation status/discard update handler: around lines 9,315-9,356
- discard confirmation modal: around lines 41,680-42,030

Major UI sections in the primary tab:

- `TradePrimaryStatusbar` for recommendation freshness and manual refresh
- Grow Max learning-mode banner
- recommendation grid container
- loading empty state
- dominant recommendation empty state from
  `recommendationEmptyStateSummary`
- `RecommendationCard` list for `dailyRecommendations`

Recommendation card structure:

- clickable card shell with keyboard open behavior
- eyebrow and data-mode badge
- company identity and confidence pill
- metric grid for entry, stop, target, reward/risk, and confidence
- short guidance summary
- footer actions:
  - `ADD TRADE` / `Review Setup` / `Validating Setup`
  - `Discard`
- local discard confirmation modal state
- local recommendation details modal state

Recommendation details modal structure:

- modal shell and close behavior
- header with company identity, source badges, and confidence pill
- Quick Decision section
- Trade Plan section
- Decision Details section
- More Trade Context section
- Full Rationale and related details
- advisory panels for decision stack, intraday confirmation, calibration,
  pre-trade risk, and eligibility

Current filters/sorting/search controls:

- The primary Recommendations tab does not currently expose dedicated
  filter/sort/search controls.
- The visible list is already derived upstream as `dailyRecommendations`.
- Recommendation History has filters/sort controls, but those are part of the
  History tab and should not be included in this extraction.

Major state and handler dependencies:

- `dailyRecommendations`
- `isLoading`
- `isSaving`
- `validatingRecommendationId`
- `recommendationEmptyStateSummary`
- `growMaxLearningModeEnabled`
- `recommendationsStatusUpdatedAt`
- `currentTime`
- `currentIntradayScanWindowLabel`
- `islandRefreshState`
- `refreshIslands(...)`
- `openTradeModal(...)`
- `updateRecommendationStatus(...)`
- `userSettings`
- maps keyed by recommendation id:
  - `calibrationGuardrailsByRecommendationId`
  - `preTradeRiskContextByRecommendationId`
  - `tradeEligibilityByRecommendationId`
  - `recommendationDecisionStackByRecommendationId`

ADD TRADE / execution handoff dependencies:

- `openTradeModal(...)` validates freshness and latest setup data before
  opening `TradeModal`.
- Demo recommendations use local validation and local test messaging.
- Real recommendations call `/api/recommendations/validate-add-trade`.
- `selectedRecommendation` controls the `TradeModal` mount.
- `TradeModal` owns the buy-side handoff/preparation surface after the
  recommendation is selected.
- The Recommendations tab should call the existing handler and should not
  create handoff payloads itself.

Discard dependencies:

- `RecommendationCard` owns local discard confirmation UI state.
- `updateRecommendationStatus(item, "ignored")` updates Supabase, archives the
  recommendation, adds discard metadata, and updates local state.
- The tab extraction should pass the existing discard callback through without
  moving persistence logic.

LocalStorage and app-wide dependencies:

- Demo/dev visible recommendations are read and written by app-wide helpers and
  effects.
- `dailyRecommendations` may include demo/dev records from localStorage and
  loaded Supabase records.
- Recommendation snapshots, scan runs, batches, outcomes, and diagnostics are
  derived outside the tab and must remain outside initial Recommendations
  rendering extraction.

## 3. Recommended Component Boundaries

Recommended initial boundaries:

- `RecommendationsTab`
  - presentational tab body for status bar, learning banner, grid, loading
    state, empty state, and cards
  - receives explicit props and callbacks
  - does not fetch, persist, validate, or mutate state

- `RecommendationCard`
  - should stay behavior-compatible if moved from `app/trade-app.tsx`
  - may keep its current local details/discard modal state during the first move
  - receives the same recommendation, advisory results, sizing, loading flags,
    and callbacks

- `RecommendationCardHeader`
  - company identity, source badge, and confidence pill
  - safe once `RecommendationCard` move is stable

- `RecommendationCardMetrics`
  - metric grid for entry/stop/target/reward-risk/confidence
  - likely a thin wrapper around the existing `RecommendationMetricGrid`

- `RecommendationCardActions`
  - ADD TRADE and Discard buttons
  - riskier than header/metrics because it must preserve stopPropagation,
    disabled states, and labels exactly

- `RecommendationExpandedDetails`
  - current `RecommendationDetailsModal` and helper components
  - large but mostly presentational plus local Escape/close handling
  - should be a later extraction after the card boundary stabilizes

- `RecommendationEmptyState`
  - optional small wrapper around `EmptyState` if the tab shell benefits from
    named intent
  - should preserve existing title/message exactly

Not recommended initially:

- A filter/sort component for the primary Recommendations tab, because no
  dedicated primary-tab filters/sorting controls exist today.
- A state hook for recommendations, because loading, Supabase/localStorage
  hydration, snapshots, scan diagnostics, and add-trade validation remain
  app-wide.

## 4. What Should Remain in trade-app.tsx Initially

Keep these in `app/trade-app.tsx` for the first runtime extractions:

- app-wide recommendation fetching and loading state
- demo/dev recommendation localStorage hydration and persistence
- `dailyRecommendations` derivation
- recommendation empty-state summary derivation
- selected recommendation state
- selected recommendation position sizing and risk-control evaluation
- ADD TRADE validation and `openTradeModal(...)`
- `TradeModal` mount and submit/close handlers
- execution handoff modal state and bridge/handoff wiring
- recommendation discard persistence in `updateRecommendationStatus(...)`
- `refreshIslands(...)` and island refresh state
- Supabase writes and local demo/mock writes
- recommendation snapshots, scan runs, batches, outcomes, and diagnostics
- cross-tab state shared with Live Day Trades, History, Statistics, Market, and
  Settings

## 5. First Extraction Target

Recommended first runtime refactor:

**Action 343 - Extract Recommendations Tab Shell**

Why the tab shell first:

- It is the smallest useful boundary.
- It moves the primary tab grid/status/empty-state rendering without touching
  `RecommendationCard` local state or details/discard modals yet.
- Parent can continue to map `dailyRecommendations` into fully configured
  `RecommendationCard` elements or pass a render callback into the shell.
- It reduces `TradeApp` render complexity while keeping ADD TRADE, discard,
  selected recommendation state, validation, and persistence logic in the
  parent.

Alternative if implementation finds the shell too small:

- Extract `RecommendationCard` unchanged into
  `components/recommendations/RecommendationCard.tsx`, keeping its existing
  local UI state inside the card and passing the same props. This has higher
  payoff but touches more helper dependencies.

## 6. Risk Assessment

ADD TRADE behavior coupling:

- The `ADD TRADE` button must keep its labels, disabled states, and
  stopPropagation behavior.
- Validation and selected recommendation state must stay in the parent.

Selected/expanded card state:

- `RecommendationCard` currently owns local details modal and discard
  confirmation state.
- Moving the card is acceptable later if those local states move with it
  unchanged.
- Lifting those states to the tab would be a behavior change risk and should
  not be part of the first extraction.

E2E-visible text:

- Preserve `Loading recommendations`, dominant empty-state copy, `ADD TRADE`,
  `Review Setup`, `Validating Setup`, `Discard`, and modal titles.

Card design/className preservation:

- Keep current classes such as `trade-recommendation-grid`,
  `trade-recommendation-card`, and action button classes.
- Avoid redesigning cards or changing grid layout.

Prop drilling:

- The tab shell will need loading, refresh, grid/card data, empty-state summary,
  learning banner flag, status bar timestamps, and callbacks.
- Prefer grouped props only when the grouping mirrors existing concepts.

Accidental filtering/sorting changes:

- Do not sort or filter inside the extracted tab shell.
- `dailyRecommendations` should remain the parent-owned source of truth.

Execution handoff modal interaction:

- The Recommendations tab should not create execution handoff payloads.
- It should continue to call `openTradeModal(...)`; execution handoff remains
  inside `TradeModal` and the existing execution surfaces.

## 7. Proposed Implementation Sequence

1. Action 343 - Extract Recommendations Tab Shell

- Move only the primary tab body rendering into a presentational component.
- Parent keeps data derivation, handlers, and card mapping behavior.
- Preserve status bar, learning banner, loading state, empty state, and card
  ordering.

2. Action 344 - Extract RecommendationCard Unchanged

- Move `RecommendationCard` and tightly coupled card helper types/functions
  only if the dependency surface is manageable.
- Keep local details/discard state inside the card.
- Parent still provides callbacks and derived advisory props.

3. Action 345 - Extract Recommendation Details Modal Components

- Move `RecommendationDetailsModal` and its local display helpers after the card
  move stabilizes.
- Preserve Escape/close behavior and visible details copy.

4. Action 346 - Extract Recommendation Card Subcomponents

- Split header, metrics, actions, quick guidance, and details sections only
  after the whole card boundary is stable.

5. Action 347 - Reassess Recommendations Tab State Ownership

- Decide whether any state hook extraction is safe.
- Keep Supabase/localStorage and cross-tab state in `TradeApp` unless there is
  a dedicated plan.

## 8. Verification Expectations for Future Runtime Refactors

Future runtime extraction actions in this area should run:

- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`
- `git diff --check`
- `npm run test:e2e`

Additional focused checks may be useful if the action touches card behavior:

- opening recommendation details
- opening ADD TRADE
- blocking expired recommendations
- discarding a recommendation
- verifying dev/demo recommendations still display correct safety labels

## 9. Recommended Next Action

Recommended:

**Action 343 - Extract Recommendations Tab Shell**

Scope:

- Create a presentational Recommendations tab shell component.
- Move only status bar, learning banner, loading/empty state, and grid shell
  rendering.
- Keep `RecommendationCard`, `openTradeModal(...)`,
  `updateRecommendationStatus(...)`, selected recommendation state, `TradeModal`,
  data loading, localStorage, and Supabase behavior in `app/trade-app.tsx`.

## 10. Action 343 Result

Action 343 added `components/recommendations/RecommendationsTab.tsx`.

Extraction result:

- The primary Recommendations tab shell now lives in a presentational component.
- The shell owns only the section wrapper, statusbar placement, learning-mode
  banner placement, recommendation grid wrapper, loading empty state, and
  dominant empty-state rendering.
- `app/trade-app.tsx` still builds the statusbar element and
  `RecommendationCard` nodes.
- `app/trade-app.tsx` still owns recommendation data/state, `dailyRecommendations`
  derivation, ADD TRADE validation, selected recommendation state, `TradeModal`
  wiring, discard persistence, Supabase/localStorage behavior, and cross-tab
  diagnostics.
- No card internals, details modal behavior, ADD TRADE handlers, discard
  handlers, filtering/sorting, or execution handoff behavior moved.

Behavior preservation:

- Existing visible copy, loading copy, empty-state copy, learning-mode banner
  text, grid class names, card ordering, button text, and callbacks were
  preserved.
- No Avanza automation, browser control, execution behavior, persistence
  behavior, or trade mutation behavior was added.

Next recommended action:

**Action 344 - Extract Recommendation Card Presentational Component**

## 11. Action 344 Follow-Up

Action 344 added `docs/recommendations-tab-post-shell-reassessment.md`.

Assessment result:

- `RecommendationsTab` remains the correct shell boundary: it renders the
  section layout, statusbar placement, learning-mode banner, loading state,
  empty state, and grid wrapper.
- `RecommendationCard` is still local to `app/trade-app.tsx` and owns local
  UI-only details/discard confirmation state.
- ADD TRADE validation, selected recommendation state, `TradeModal`, discard
  persistence, Supabase writes, localStorage/demo behavior, and execution
  handoff creation remain parent-owned.
- The safest next runtime extraction is a move-only `RecommendationCard`
  component boundary with parent callbacks preserved.

Next recommended action:

**Action 345 - Extract Recommendation Card Presentational Component**

## 12. Action 345 Result

Action 345 added `components/recommendations/RecommendationCard.tsx`.

Extraction result:

- Moved the recommendation card shell rendering into a presentational component.
- Kept a local `RecommendationCardContainer` in `app/trade-app.tsx` to own
  existing UI-only state and provide the same computed props/callbacks.
- Kept ADD TRADE validation, selected `TradeModal`, discard persistence,
  Supabase/localStorage behavior, details modal state, and execution handoff
  behavior in `app/trade-app.tsx`.
- Preserved visible copy, class names, button text, card ordering, metrics, and
  modal slot placement.

Next recommended action:

**Action 346 - Reassess Recommendation Card After Extraction**

## 13. Action 346 Result

Action 346 added
`docs/recommendation-card-post-extraction-reassessment.md`.

Assessment result:

- Confirmed `RecommendationCard.tsx` is not the next pressure point; it is a
  compact presentational component.
- Identified the remaining recommendation-specific inline UI as the local
  `RecommendationCardContainer`, details modal, and discard modal.
- Recommended extracting details/discard modal components next, starting with
  the small discard modal and moving the details modal only if its helper
  dependencies can be preserved cleanly.

Next recommended action:

**Action 347 - Extract Recommendation Details/Discard Modal Components**

## 14. Action 347 Result

Action 347 added
`components/recommendations/DiscardRecommendationModal.tsx`.

Extraction result:

- Extracted only the safest modal piece: `DiscardRecommendationModal`.
- Preserved modal copy, class names, button order, Escape close behavior,
  backdrop close behavior, disabled states, and callback flow.
- Kept `RecommendationDetailsModal` inline because its helper and display
  dependency surface should be handled in a dedicated follow-up.
- Kept discard persistence, ADD TRADE validation, selected `TradeModal`,
  Supabase/localStorage behavior, data construction, and execution handoff
  behavior parent-owned.

Next recommended action:

**Action 348 - Reassess Recommendations Area After Modal Extraction**

## 15. Action 348 Result

Action 348 added
`docs/recommendations-area-post-modal-extraction-reassessment.md`.

Assessment result:

- Confirmed the next Recommendations pressure point is the inline
  `RecommendationDetailsModal` and its helper cluster.
- Recommended extracting details modal display helpers/mappers before extracting
  the full modal or the card container.
- Confirmed ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, and execution handoff behavior should remain
  in `app/trade-app.tsx`.

Next recommended action:

**Action 349 - Extract Recommendation Details Modal Display Helpers**

## 16. Action 349 Result

Action 349 added
`components/recommendations/recommendation-details-display-helpers.ts`.

Extraction result:

- Extracted pure recommendation details display helpers and tone mappers.
- Left the details modal and JSX helper components inline for now.
- Preserved all ADD TRADE, discard, details modal state, persistence,
  Supabase/localStorage, and execution behavior.

Next recommended action:

**Action 350 - Reassess Recommendation Details Modal After Helper Extraction**

## 17. Action 350 Result

Action 350 added
`docs/recommendation-details-modal-post-helper-extraction-reassessment.md`.

Assessment result:

- Reassessed `RecommendationDetailsModal` after extracting pure display helpers.
- Confirmed the modal can be extracted next if the shared JSX helper surface is
  handled carefully.
- Recommended extracting the modal as a presentational component while keeping
  parent state, ADD TRADE validation, discard persistence, Supabase/localStorage
  behavior, and execution handoff behavior in `app/trade-app.tsx`.

Next recommended action:

**Action 351 - Extract RecommendationDetailsModal Presentational Component**

## 18. Action 351 Result

Action 351 added
`components/recommendations/RecommendationDetailsModal.tsx`.

Extraction result:

- Extracted the full recommendation details modal into a presentational
  component.
- Moved the modal's direct render-only JSX helper components with it and
  exported shared helpers used elsewhere in `app/trade-app.tsx`.
- Kept recommendation data construction, ADD TRADE validation, discard
  persistence, selected `TradeModal`, Supabase/localStorage behavior, and
  execution handoff behavior parent-owned.

Next recommended action:

**Action 352 - Reassess Recommendations Area After Details Modal Extraction**

## 19. Action 352 Result

Action 352 added
`docs/recommendations-area-post-details-modal-extraction-reassessment.md`.

Assessment result:

- Reassessed the Recommendations tab after `RecommendationDetailsModal`
  extraction.
- Confirmed the extracted Recommendations surface now includes the tab shell,
  card view, discard modal, details modal, and details display helpers.
- Confirmed `app/trade-app.tsx` still owns recommendation data construction,
  ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, and execution handoff behavior.
- Identified the next safest step as extracting pure display props from
  `RecommendationCardContainer` while keeping its state and callbacks in place.

Next recommended action:

**Action 353 - Extract Recommendation Card Display Mapper**

## 20. Action 353 Result

Action 353 added
`components/recommendations/recommendation-card-display-mapper.ts`.

Extraction result:

- Extracted pure Recommendation card display props from the local
  `RecommendationCardContainer`.
- `RecommendationCardContainer` now delegates card metrics, confidence labels,
  source badge descriptors, summary fallback, confidence breakdown rows, and
  ADD TRADE display labels/disabled flags to the mapper.
- Parent/container ownership of details state, discard state, callbacks, ADD
  TRADE validation, selected `TradeModal`, persistence, Supabase/localStorage,
  and execution handoff behavior is unchanged.

Next recommended action:

**Action 354 - Reassess RecommendationCardContainer After Display Mapper Extraction**

## 21. Action 354 Result

Action 354 added
`docs/recommendation-card-container-post-mapper-reassessment.md`.

Assessment result:

- Reassessed the Recommendations card area after pure display mapping moved
  out of `RecommendationCardContainer`.
- Confirmed the remaining container boundary is moderate and explicit.
- Identified shared visuals such as `CompanyIdentity`, `DataModePill`, and
  `DataModePillRow` as the only notable boundary choice for the next extraction.
- Recommended extracting the container boundary next while keeping all parent
  callback implementations and persistence behavior in `app/trade-app.tsx`.

Next recommended action:

**Action 355 - Extract RecommendationCardContainer Boundary**

## 22. Action 355 Result

Action 355 added
`components/recommendations/RecommendationCardContainer.tsx`.

Extraction result:

- Moved the recommendation card container boundary into a dedicated component.
- The component owns only card-local details/discard UI state and composes the
  card, details modal, discard modal, and display mapper.
- `app/trade-app.tsx` still owns data construction, filtering, ADD TRADE
  validation, discard persistence, selected `TradeModal`, Supabase/localStorage
  behavior, and execution handoff behavior.
- Shared app-wide identity and source-badge visuals remain parent-owned and are
  passed as render slots.

Next recommended action:

**Action 356 - Reassess Recommendations Area After Container Extraction**

## 23. Action 356 Result

Action 356 added
`docs/recommendations-area-post-container-extraction-reassessment.md`.

Assessment result:

- Confirmed the Recommendations extraction plan has completed its high-payoff
  presentation work.
- `app/trade-app.tsx` still owns app-wide recommendation data construction,
  ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, and execution handoff behavior by design.
- Further Recommendations extraction would mostly involve shared app-wide
  identity/badge helpers or data hooks, both of which are higher risk and lower
  immediate payoff.

Next recommended action:

**Action 357 - Create Live Day Trades Tab Extraction Plan**

## 24. Action 388 Result

Action 388 added `docs/trade-app-post-major-ui-extraction-reassessment.md`.

Result:

- Confirmed Recommendations extraction is complete enough to pause.
- Remaining recommendation responsibilities in `app/trade-app.tsx` are
  intentionally app-owned: data construction/filtering, ADD TRADE validation,
  discard persistence, selected TradeModal state, Supabase/localStorage
  behavior, execution handoff behavior, and shared identity/source-badge render
  slots.
- Recommended app-wide state/effects extraction planning next.

Next recommended action:

**Action 389 - Create App State/Effects Extraction Plan**

## 25. Action 389 Result

Action 389 added `docs/app-state-effects-extraction-plan.md`.

Result:

- Planned app-wide state/effects extraction after pausing Recommendations UI
  work.
- Confirmed recommendation domain state remains too coupled for early hook
  extraction because it includes data construction/filtering, ADD TRADE
  validation, discard persistence, selected TradeModal state,
  Supabase/localStorage behavior, diagnostics, and execution handoff behavior.
- Recommended reassessing navigation/tab state first.

Next recommended action:

**Action 390 - Reassess Navigation/Tab State Hook Boundary**

## 26. Action 397 Result

Action 397 added
`docs/recommendation-ui-state-hook-boundary-reassessment.md`.

Result:

- Revisited Recommendation UI state after the first app-state hooks and modal
  boundary reassessment.
- Confirmed details/discard UI state already lives in
  `RecommendationCardContainer`.
- Confirmed remaining Recommendation state is domain-, persistence-, modal-, or
  execution-coupled and should remain in `app/trade-app.tsx`.
- Recommended moving to History UI state boundary reassessment.

Next recommended action:

**Action 398 - Reassess History UI State Hook Boundary**
