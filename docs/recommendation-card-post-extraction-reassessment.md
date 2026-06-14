# Recommendation Card Post-Extraction Reassessment

## 1. Purpose

This reassessment records the Recommendations card boundary after Action 345
extracted `components/recommendations/RecommendationCard.tsx`.

The goal is to decide the safest next Recommendations refactor target while
preserving ADD TRADE, discard, details modal, persistence, and execution
handoff behavior.

This action is documentation-only. It does not change runtime behavior.

## 2. Current Component Inventory

Current extracted components:

- `components/recommendations/RecommendationsTab.tsx`
  - Presentational shell for the Recommendations tab.
  - Owns section wrapper, statusbar placement, learning-mode banner placement,
    recommendation grid wrapper, loading state, and dominant empty state.
- `components/recommendations/RecommendationCard.tsx`
  - Presentational card shell for one recommendation.
  - Owns no app data, persistence, ADD TRADE validation, or execution behavior.

Current local pieces still in `app/trade-app.tsx`:

- `RecommendationCardContainer`
  - Local wrapper around `RecommendationCard`.
  - Computes display props and owns local UI-only state for details/discard
    visibility.
- `RecommendationDetailsModal`
  - Large local modal with Escape/backdrop close behavior and many details
    display sections.
- `DiscardRecommendationModal`
  - Local discard confirmation modal with Escape/backdrop close behavior.
- Selected `TradeModal`
  - Still parent-owned and opened through the ADD TRADE callback.

Approximate current sizes:

- `components/recommendations/RecommendationCard.tsx`: 136 lines.
- `app/trade-app.tsx`: 42,010 lines.
- `RecommendationCardContainer`: about 160 lines.
- `DiscardRecommendationModal`: about 80 lines.
- `RecommendationDetailsModal` plus its local display helpers remains one of
  the larger recommendation-specific inline areas.

Remaining parent-owned behavior:

- Recommendation data construction and `dailyRecommendations`.
- ADD TRADE validation and selected `TradeModal` wiring.
- Discard persistence and Supabase update behavior.
- localStorage/demo recommendation behavior.
- Execution handoff creation and execution modal state.
- Details modal open/close state.
- Discard confirmation open/close and confirming state.

## 3. RecommendationCard Structure

The extracted `RecommendationCard` renders:

- `article.trade-recommendation-card` wrapper.
- Click and keyboard handling for opening details.
- Eyebrow: `TRADE RECOMMENDATION`.
- Source badge slot.
- Header row with identity slot and confidence pill.
- Internal metric grid.
- Guidance summary and updated timestamp.
- ADD TRADE button.
- Discard button.
- Discard dialog slot.
- Details dialog slot.

Prop categories:

- Display text:
  - `addTradeLabel`
  - `confidenceLabel`
  - `confidenceTone`
  - `summary`
  - `updatedAt`
- Display collections:
  - `metrics`
- Render slots:
  - `sourceBadge`
  - `identity`
  - `discardDialog`
  - `detailsDialog`
- Button state:
  - `addTradeDisabled`
  - `discardDisabled`
- Callbacks:
  - `onAddTrade`
  - `onOpenDetails`
  - `onOpenDiscard`

Component size assessment:

- The component is not currently too large.
- Its only internal helper is the metric grid and value fallback helper.
- Splitting card subcomponents now would be low risk, but the payoff is small
  compared with extracting remaining inline recommendation modal pieces.

## 4. RecommendationCardContainer Coupling

ADD TRADE validation coupling:

- `RecommendationCardContainer` only forwards `onTakeTrade(recommendation)`.
- Validation still lives in `openTradeModal(...)` in `app/trade-app.tsx`.
- The container computes the ADD TRADE label and disabled state from existing
  freshness, gate, saving, and validation inputs.

Discard persistence coupling:

- The container owns discard confirmation visibility and confirming state.
- Persistence still lives in the parent callback passed as `onIgnore`.
- The confirm flow still calls `onIgnore(recommendation)` and only closes the
  modal after the callback resolves.

Details modal coupling:

- The container owns `isDetailsOpen`.
- `RecommendationDetailsModal` is still rendered as a slot.
- Details modal close behavior stays local to the modal.
- The details modal depends on recommendation, sizing, freshness, ADD TRADE
  gate message, confirmation, confidence breakdown, key reasons, decision
  stack, trade eligibility, calibration guardrails, and pre-trade risk context.

Selected `TradeModal` coupling:

- The selected `TradeModal` remains outside the card path.
- The card/container boundary only triggers the parent ADD TRADE callback.

Data construction/display mapping coupling:

- The container computes freshness, add-trade gate, confidence breakdown, key
  reasons, card summary, confidence tier, source badge, metric rows, and
  button label.
- These are pure display mappings, but extracting them before the modal pieces
  would not remove much of the large inline UI.

Supabase/localStorage coupling:

- Supabase writes and localStorage/demo behavior are still parent-owned.
- The card extraction did not add persistence behavior.

Execution handoff coupling:

- Execution handoff creation remains parent-owned through the existing ADD
  TRADE and modal flow.
- The extracted card has no Avanza, broker, browser, or execution behavior.

## 5. Candidate Next Refactor Targets

Ranked by safety and payoff:

1. Extract details/discard modal presentational components.
   - Best payoff because the remaining inline recommendation-specific UI is
     modal-heavy.
   - Safest first bite is `DiscardRecommendationModal` because it is small and
     self-contained.
   - `RecommendationDetailsModal` should move only if its helper dependency
     surface can be preserved without changing behavior.
2. Extract display-value mapper/helper for card props.
   - Low risk and pure, but modest payoff.
   - Good fallback if modal extraction proves too tangled.
3. Extract `RecommendationCardContainer` into a dedicated container component.
   - Medium payoff, higher risk because it moves local UI state and ties
     together details/discard slots.
   - Should wait until the modal components are outside `app/trade-app.tsx`.
4. Extract `RecommendationCard` subcomponents.
   - Lowest behavior risk, but low payoff because `RecommendationCard.tsx` is
     only 136 lines.
   - Useful later for card-system polish.
5. Leave card area and move to Live Day Trades tab.
   - Reasonable if recommendation modal extraction is deferred.
   - Not the best immediate payoff while recommendation details UI remains
     inline.

## 6. Recommended Next Action

Recommended:

**Action 347 - Extract Recommendation Details/Discard Modal Components**

Recommended scope:

- Create recommendation modal component file(s), likely under
  `components/recommendations/`.
- Extract `DiscardRecommendationModal` first because it is small and isolated.
- Extract `RecommendationDetailsModal` only as a move-preserving component if
  its helper dependencies can be moved/imported without changing behavior.
- Keep `RecommendationCardContainer`, details/discard open state, ADD TRADE
  validation, selected `TradeModal`, discard persistence, Supabase/localStorage
  behavior, and execution handoff behavior in `app/trade-app.tsx`.
- Preserve Escape close behavior, backdrop close behavior, stop-propagation,
  headings, close button labels, details copy, class names, and visible text.

Fallback:

- If the details modal dependency surface is too large, Action 347 should
  extract only `DiscardRecommendationModal` plus document why details modal
  extraction remains blocked.

## 7. Risk Assessment

Prop drilling:

- Details modal has many display props today.
- Keep the existing explicit prop shape and avoid adding a broad context object.

Callback identity changes:

- Modal close and confirm callbacks are user-visible through Escape, backdrop,
  close button, Discard, and No behavior.
- Preserve the same callback flow and avoid moving parent handlers.

ADD TRADE behavior:

- The recommended modal extraction should not touch ADD TRADE button logic.
- `openTradeModal(...)` remains parent-owned.

Discard persistence:

- `onConfirm` should still call the parent discard callback through the
  existing container flow.
- Supabase writes and local state updates must remain in `app/trade-app.tsx`.

Details modal state:

- `isDetailsOpen` should stay in `RecommendationCardContainer` for now.
- The modal component can move without owning selection or app state.

Design/className drift:

- Recommendation modal CSS class names should be copied exactly.
- Details modal section ordering and labels should not change.

E2E-visible text/selectors:

- Preserve `Recommendation Details`, `Close recommendation details`,
  `Discard Recommendation`, `Discard`, and `No`.
- Preserve metric labels and details section headings.

## 8. Verification

Action 346 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 347 Result

Action 347 added `components/recommendations/DiscardRecommendationModal.tsx`.

Extraction result:

- Extracted the discard recommendation confirmation modal as a presentational
  component.
- Preserved the modal wrapper, dialog attributes, visible copy, divider, button
  order, button labels, disabled behavior, title text, Escape close behavior,
  backdrop close behavior, and event stop-propagation behavior.
- `RecommendationCardContainer` still owns whether the discard modal is open and
  the `isConfirmingDiscard` UI state.
- `app/trade-app.tsx` still owns the parent discard callback, Supabase
  persistence, local recommendation state updates, saving/message state, ADD
  TRADE validation, selected `TradeModal`, data construction, localStorage/demo
  behavior, and execution handoff behavior.

What remained inline:

- `RecommendationDetailsModal` remains inline in `app/trade-app.tsx`.
- It was intentionally not extracted in Action 347 because it is much larger
  than the discard modal and depends on a broad cluster of details-specific
  helpers, tone helpers, metric grids, decision/context cards, close behavior,
  and recommendation-derived props.
- Moving it safely should be planned as a dedicated action so the helper
  dependency surface can be preserved without changing details modal behavior.

Next recommended action:

**Action 348 - Reassess Recommendations Area After Modal Extraction**

## 10. Action 348 Result

Action 348 added
`docs/recommendations-area-post-modal-extraction-reassessment.md`.

Assessment result:

- Confirmed `DiscardRecommendationModal` is extracted and stable.
- Confirmed `RecommendationDetailsModal` remains the largest
  recommendation-specific inline island.
- Classified the details modal helper cluster into pure formatting helpers,
  pure data mapping, UI-only render helpers, and UI-only behavior.
- Confirmed the details helper cluster does not own Supabase/localStorage or
  execution behavior.
- Recommended extracting details modal display helpers/mappers before moving the
  full details modal component.

Next recommended action:

**Action 349 - Extract Recommendation Details Modal Display Helpers**

## 11. Action 349 Result

Action 349 added
`components/recommendations/recommendation-details-display-helpers.ts`.

Extraction result:

- Moved pure details value formatting, currency/share formatting, tone mapping,
  and tone class-name helpers into a dedicated module.
- Kept JSX render helpers and `RecommendationDetailsModal` inline.
- Kept `RecommendationCardContainer`, details state, discard state, ADD TRADE
  validation, selected `TradeModal`, discard persistence, Supabase/localStorage
  behavior, and execution handoff behavior in `app/trade-app.tsx`.

Next recommended action:

**Action 350 - Reassess Recommendation Details Modal After Helper Extraction**

## 12. Action 350 Result

Action 350 added
`docs/recommendation-details-modal-post-helper-extraction-reassessment.md`.

Assessment result:

- Confirmed the details modal is now ready for a careful presentational
  extraction.
- Documented that the modal needs the same explicit display props and only
  parent-provided `onClose`.
- Documented that shared JSX details helpers are the main remaining risk because
  they are reused outside the recommendation details modal.

Next recommended action:

**Action 351 - Extract RecommendationDetailsModal Presentational Component**

## 13. Action 351 Result

Action 351 added
`components/recommendations/RecommendationDetailsModal.tsx`.

Extraction result:

- Extracted the recommendation details modal and its direct render-only JSX
  helper components.
- Kept the parent-owned container/state/callback boundary unchanged.
- Preserved ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, data construction, and execution handoff
  ownership in `app/trade-app.tsx`.

Next recommended action:

**Action 352 - Reassess Recommendations Area After Details Modal Extraction**

## 14. Action 352 Result

Action 352 added
`docs/recommendations-area-post-details-modal-extraction-reassessment.md`.

Assessment result:

- Confirmed the details modal extraction shifted the remaining
  Recommendations-specific complexity to `RecommendationCardContainer`.
- Documented that the container still derives card metrics, confidence rows,
  source badge descriptors, ADD TRADE display labels, card summary, and details
  modal display props.
- Confirmed the container also owns local details/discard modal UI state, so a
  full boundary extraction would move state and callback bridge wiring.
- Recommended a smaller pure display-mapper extraction first.

Next recommended action:

**Action 353 - Extract Recommendation Card Display Mapper**

## 15. Action 353 Result

Action 353 added
`components/recommendations/recommendation-card-display-mapper.ts`.

Extraction result:

- Extracted pure display mapping from `RecommendationCardContainer`.
- Moved confidence tone/label derivation, card metric rows, confidence
  breakdown rows, card summary fallback, source badge descriptor selection, and
  ADD TRADE display labels/disabled flags into the mapper.
- Kept the local container in `app/trade-app.tsx`.
- Kept details/discard state, callbacks, ADD TRADE validation, discard
  persistence, selected `TradeModal`, Supabase/localStorage behavior, and
  execution handoff behavior parent/container-owned.

Next recommended action:

**Action 354 - Reassess RecommendationCardContainer After Display Mapper Extraction**

## 16. Action 354 Result

Action 354 added
`docs/recommendation-card-container-post-mapper-reassessment.md`.

Assessment result:

- Confirmed `RecommendationCardContainer` is now slim enough for a careful
  boundary extraction.
- The remaining container owns local details/discard UI state and bridges
  parent `onTakeTrade(...)` / `onIgnore(...)` callbacks into the card and modal
  slots.
- ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, recommendation data construction, and
  execution handoff behavior remain parent-owned.

Next recommended action:

**Action 355 - Extract RecommendationCardContainer Boundary**
