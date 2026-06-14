# Recommendations Area Post-Details Modal Extraction Reassessment

## 1. Purpose

This reassessment records the Recommendations area after Action 351 extracted
`RecommendationDetailsModal` into
`components/recommendations/RecommendationDetailsModal.tsx`.

The goal is to choose the safest next Recommendations refactor without moving
ADD TRADE validation, discard persistence, selected `TradeModal` wiring,
Supabase/localStorage behavior, recommendation data construction, or execution
handoff behavior.

## 2. Current Recommendations Inventory

Current file/component inventory:

- `app/trade-app.tsx`: approximately 41,082 lines.
- `components/recommendations/RecommendationsTab.tsx`: 50 lines.
- `components/recommendations/RecommendationCard.tsx`: 136 lines.
- `components/recommendations/DiscardRecommendationModal.tsx`: 95 lines.
- `components/recommendations/RecommendationDetailsModal.tsx`: 853 lines.
- `components/recommendations/recommendation-details-display-helpers.ts`: 143
  lines.

Extracted Recommendations components:

- `RecommendationsTab`
  - Owns the presentational Recommendations tab shell, statusbar slot,
    empty/loading layout, and children placement.
- `RecommendationCard`
  - Owns the presentational card shell, metric grid, card buttons, guidance,
    modal slots, identity slot, and source badge slot.
- `DiscardRecommendationModal`
  - Owns the discard confirmation modal rendering and button layout.
- `RecommendationDetailsModal`
  - Owns the details modal wrapper/content, close behavior, details sections,
    direct render-only JSX helpers, and read-only recommendation analysis
    display.
- `recommendation-details-display-helpers.ts`
  - Owns pure formatting and tone helpers used by details-style displays.

Remaining inline/container pieces in `app/trade-app.tsx`:

- Local `RecommendationCardContainer`.
- The `dailyRecommendations.map(...)` composition that passes app-owned data
  into `RecommendationCardContainer`.
- Recommendation-specific handler wiring:
  - `openTradeModal`
  - `updateRecommendationStatus(item, "ignored")`
- Selected `TradeModal` rendering and selected recommendation state.
- App-wide data construction, filtering/readback data, and settings-derived
  position sizing.

Parent-owned behavior remains intentionally unchanged:

- Recommendation data construction and filtering.
- ADD TRADE validation, stale/expired blocking, broker preview construction,
  and execution handoff creation.
- Discard persistence through recommendation status updates.
- Details/discard modal open state inside `RecommendationCardContainer`.
- Selected `TradeModal` state/wiring.
- Supabase and localStorage behavior.
- Execution/handoff behavior.

Remaining helper surface:

- `RecommendationCardContainer` still derives card and modal display props.
- `CompanyIdentity`, `DataModePill`, and `DataModePillRow` remain shared in
  `app/trade-app.tsx` because they are used beyond the recommendation card
  area.
- `RecommendationDetails*` JSX helpers are exported from
  `RecommendationDetailsModal.tsx` and reused by later live-trade/detail
  sections still in `app/trade-app.tsx`.
- `recommendationDetailsValue`, currency/share formatting, and tone helpers are
  imported from the pure display helper module and used across other sections.

## 3. RecommendationCardContainer Analysis

`RecommendationCardContainer` is currently the main remaining
Recommendations-specific local component in `app/trade-app.tsx`. It is roughly
170 lines including props, derived display values, local modal state, and card
composition.

Responsibilities:

- Compute freshness and expired/stale display state.
- Compute ADD TRADE gate and confirmation readback.
- Build confidence breakdown display rows.
- Build key reasons from recommendation, confirmation, decision stack,
  guardrails, and pre-trade risk context.
- Own local UI-only state:
  - `isDetailsOpen`
  - `isDiscardConfirmOpen`
  - `isConfirmingDiscard`
- Derive card summary, confidence tier/label, source badges, and metrics.
- Render `RecommendationCard` with identity/source-badge slots.
- Render `DiscardRecommendationModal` as a card slot when open.
- Render `RecommendationDetailsModal` as a card slot when open.
- Bridge parent callbacks into the card:
  - `onTakeTrade(recommendation)`
  - `onIgnore(recommendation)`

State/handler dependencies:

- Local modal state is UI-only and scoped to one card.
- Parent callbacks still perform the actual behavior.
- The discard confirmation handler wraps parent `onIgnore(...)` with the local
  `isConfirmingDiscard` spinner/disabled state.

ADD TRADE coupling:

- The container computes `addTradeLabel` and disabled state from `isSaving`,
  `isValidating`, expiration, and the ADD TRADE gate.
- It calls parent `onTakeTrade(recommendation)` but does not validate, create,
  or persist a trade.
- Extracting the whole container would not require moving `openTradeModal`, but
  it would move local state and callback bridge wiring.

Discard/details modal coupling:

- The discard and details modals are now presentational, but their open/close
  state remains in `RecommendationCardContainer`.
- Discard persistence remains parent-owned through `onIgnore(...)`.
- Details modal close behavior remains parent/container callback wiring only.

Selected `TradeModal` coupling:

- `RecommendationCardContainer` does not own selected trade modal state.
- It only invokes `onTakeTrade(...)`; `app/trade-app.tsx` still owns selected
  recommendation and `TradeModal` rendering.

Data/display mapping coupling:

- The container performs substantial pure display mapping:
  - card metrics
  - confidence breakdown rows
  - card summary fallback
  - confidence tone/label
  - source badges
  - details source badge rows
  - key reasons
  - ADD TRADE label and disabled flags
- These mappings are good candidates for a pure helper before extracting the
  full container boundary.

Supabase/localStorage/execution coupling:

- The container itself does not call Supabase, localStorage, bridge helpers, or
  execution APIs.
- Its parent callbacks do. Those callbacks should remain in `app/trade-app.tsx`
  for now.

## 4. Remaining Helper/Display Mapper Analysis

Pure display props/mappers:

- Freshness-derived display state from `getRecommendationFreshness(...)`.
- ADD TRADE label/disabled display values based on existing gate result,
  expiration, saving, and validating state.
- Confidence breakdown tuples.
- Recommendation card metric rows.
- Card summary fallback order.
- Confidence tone and confidence label.
- Source badge model selection.
- Details modal source badge model selection.
- Key reasons input assembly.

Behavior-coupled logic:

- `onAddTrade={() => onTakeTrade(recommendation)}`.
- `onOpenDetails={() => setIsDetailsOpen(true)}`.
- `onOpenDiscard={() => setIsDiscardConfirmOpen(true)}`.
- `onConfirm` discard flow that toggles `isConfirmingDiscard` while awaiting
  parent `onIgnore(...)`.

Persistence-coupled logic:

- `updateRecommendationStatus(...)` remains parent-owned and should not move
  with display helpers.
- Supabase/localStorage behavior remains outside the recommendation component
  boundary.

Render-only helpers:

- `RecommendationDetailsPill`, `RecommendationDetailsSection`,
  `RecommendationDetailsMetricGrid`, `RecommendationDetailsTextCard`,
  `RecommendationDetailsTextStack`, `RecommendationDetailsContextCard`, and
  `RecommendationDetailsContextRow` are now exported from
  `RecommendationDetailsModal.tsx` because later sections still reuse them.
- `CompanyIdentity`, `DataModePill`, and `DataModePillRow` remain shared
  render helpers in `app/trade-app.tsx`.

Shared helpers that may remain in parent:

- `CompanyIdentity` is used by recommendation cards, selected trade/modal
  surfaces, and later trade displays.
- Data mode badge helpers are used across app-wide demo/stale/live status
  surfaces and should not be forced into the Recommendations folder until their
  broader ownership is clearer.

## 5. Candidate Next Refactor Targets

1. Extract recommendation display/prop mapper first.
   - Highest safety.
   - Moves pure card/display derivation out of `RecommendationCardContainer`.
   - Keeps local modal state, callbacks, ADD TRADE behavior, discard
     persistence, and selected `TradeModal` wiring untouched.
   - Prepares a smaller future `RecommendationCardContainer` boundary.

2. Extract `RecommendationCardContainer` boundary.
   - Higher payoff but moves local UI state and callback bridge wiring.
   - Safe only after display prop mapping is smaller and explicit.
   - Should still keep parent callbacks and persistence behavior outside the
     component.

3. Extract remaining recommendation helper components.
   - Moderate payoff.
   - Risky while `CompanyIdentity` and data-mode helpers are shared by multiple
     app-wide domains.

4. Pause Recommendations and create Live Day Trades tab extraction plan.
   - Reasonable soon, but there is still one clear low-risk Recommendations
     step left: pure card display mapping.

## 6. Recommended Next Action

Recommended next action:

**Action 353 - Extract Recommendation Card Display Mapper**

Action 353 should create a pure helper module, likely
`components/recommendations/recommendation-card-display-mapper.ts` or
`lib/recommendation-card-display-mapper.ts`, that derives the display props now
computed inside `RecommendationCardContainer`.

Suggested extraction scope:

- Recommendation freshness display state.
- ADD TRADE label/disabled display fields from existing inputs.
- Confidence breakdown display rows.
- Recommendation card metric rows.
- Card summary.
- Confidence tone/label.
- Source badge descriptors, not rendered nodes.
- Details source badge descriptors, not rendered nodes.
- Key reasons input/result, if it can stay pure and explicit.

Keep in `app/trade-app.tsx` / `RecommendationCardContainer`:

- `useState` for details/discard modal state.
- `onTakeTrade(...)` and `onIgnore(...)` callback wiring.
- Discard confirmation async state.
- `CompanyIdentity`, `DataModePill`, and `DataModePillRow` rendering slots.
- ADD TRADE validation implementation.
- Discard persistence implementation.
- Selected `TradeModal` state/wiring.
- Supabase/localStorage behavior.

## 7. Risk Assessment

ADD TRADE behavior risk:

- The ADD TRADE button label/disabled state is partly display and partly safety
  readback.
- Mapper extraction must preserve exact label order:
  - `Validating Setup`
  - `Review Setup`
  - `ADD TRADE`
- The actual `openTradeModal(...)` callback must remain parent-owned.

Discard/details state risk:

- Details and discard open/close state is simple but stateful.
- It should stay in `RecommendationCardContainer` until display mapping is
  separated.

Selected `TradeModal` risk:

- Selected recommendation state and `TradeModal` rendering are app-wide and
  should not move with card display helpers.

Callback/prop drilling risk:

- A display mapper can return plain values, arrays, and badge descriptors.
- It should not return callbacks or JSX nodes where avoidable.

Supabase/localStorage risk:

- Mapper extraction must not call Supabase, localStorage, or recommendation
  status updates.

E2E-visible text/design risk:

- Preserve card metric labels, source badge rendering, ADD TRADE text,
  `Discard`, details modal labels, and details section text.
- Keep card and modal class names unchanged.

## 8. Verification

Action 352 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 353 Result

Action 353 added
`components/recommendations/recommendation-card-display-mapper.ts`.

Extraction result:

- Moved pure recommendation card display/prop mapping out of
  `RecommendationCardContainer`.
- Extracted card confidence tone/label helpers.
- Extracted card metric row creation for Entry, Stop, Target, Reward : Risk,
  and Confidence.
- Extracted confidence breakdown rows.
- Extracted card summary fallback selection.
- Extracted recommendation source badge and details source badge descriptor
  selection.
- Extracted ADD TRADE display label/disabled state and discard disabled display
  state.
- Extracted details-modal display props that are derived from already-computed
  parent/container values.

What stayed in `app/trade-app.tsx`:

- `RecommendationCardContainer`.
- Details and discard modal `useState` ownership.
- `onTakeTrade(...)` and `onIgnore(...)` callback wiring.
- Discard confirmation async state.
- ADD TRADE validation implementation.
- Discard persistence implementation.
- Selected `TradeModal` state/wiring.
- Supabase/localStorage behavior.
- Recommendation data construction, filtering, and execution handoff behavior.
- `CompanyIdentity`, `DataModePill`, and `DataModePillRow` render slots.

Behavior preservation:

- Existing card copy, metric labels, ADD TRADE label order, confidence labels,
  source badges, details modal props, button behavior, modal behavior, and card
  ordering were preserved.
- No callbacks, state setters, persistence logic, execution logic, Supabase
  writes, localStorage behavior, Avanza/browser behavior, or trade mutation
  moved into the mapper.

Next recommended action:

**Action 354 - Reassess RecommendationCardContainer After Display Mapper Extraction**

## 10. Action 354 Result

Action 354 added
`docs/recommendation-card-container-post-mapper-reassessment.md`.

Assessment result:

- Reassessed `RecommendationCardContainer` after the display mapper extraction.
- Confirmed the remaining local container is now mostly modal UI state, slot
  composition, callback bridge wiring, freshness/gate/key-reason inputs, and
  mapper usage.
- Confirmed it has no direct Supabase, localStorage, execution handoff, or
  selected `TradeModal` ownership.
- Determined the container boundary is now safe to extract if parent callbacks
  and persistence behavior remain in `app/trade-app.tsx`.

Next recommended action:

**Action 355 - Extract RecommendationCardContainer Boundary**

## 11. Action 355 Result

Action 355 added
`components/recommendations/RecommendationCardContainer.tsx`.

Extraction result:

- Extracted the remaining local recommendation card container boundary.
- Moved only card-local details/discard UI state and modal slot composition.
- Parent still computes and passes freshness, ADD TRADE gate, and key reasons.
- Parent still renders shared identity/source-badge visuals through explicit
  render slots.
- ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, recommendation data construction, and
  execution handoff behavior remain in `app/trade-app.tsx`.

Next recommended action:

**Action 356 - Reassess Recommendations Area After Container Extraction**

## 12. Action 356 Result

Action 356 added
`docs/recommendations-area-post-container-extraction-reassessment.md`.

Assessment result:

- Reassessed Recommendations after the container extraction.
- Confirmed extracted pieces now cover the Recommendations tab shell, card
  container, card view, details modal, discard modal, card display mapper, and
  details display helpers.
- Confirmed remaining parent code is app-owned data/behavior, not low-level
  card presentation.
- Recommended pausing Recommendations extraction and planning Live Day Trades
  next.

Next recommended action:

**Action 357 - Create Live Day Trades Tab Extraction Plan**
