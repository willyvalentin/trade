# Recommendations Area Post-Container Extraction Reassessment

## 1. Purpose

This reassessment records the Recommendations area after Action 355 extracted
`RecommendationCardContainer` into
`components/recommendations/RecommendationCardContainer.tsx`.

The goal is to decide whether Recommendations extraction is complete enough to
pause, and whether the next high-payoff refactor phase should move to Live Day
Trades. This action is documentation-only and does not move ADD TRADE
validation, discard persistence, selected `TradeModal` state, Supabase/localStorage
behavior, execution handoff behavior, or recommendation data construction.

## 2. Current Recommendations Component Inventory

Current file/component sizes:

- `app/trade-app.tsx`: approximately 40,924 lines.
- `components/recommendations/RecommendationsTab.tsx`: 50 lines.
- `components/recommendations/RecommendationCardContainer.tsx`: 150 lines.
- `components/recommendations/RecommendationCard.tsx`: 136 lines.
- `components/recommendations/RecommendationDetailsModal.tsx`: 853 lines.
- `components/recommendations/DiscardRecommendationModal.tsx`: 95 lines.
- `components/recommendations/recommendation-card-display-mapper.ts`: 182
  lines.
- `components/recommendations/recommendation-details-display-helpers.ts`: 143
  lines.

Extracted Recommendations pieces:

- `RecommendationsTab`
  - Presentational tab shell, loading/empty state placement, statusbar slot, and
    recommendation children placement.
- `RecommendationCardContainer`
  - Card-local details/discard UI state, modal slot composition, card/detail
    display mapper usage, and parent callback bridge wiring.
- `RecommendationCard`
  - Presentational card shell, metrics, card actions, source badge slot, and
    details/discard modal slots.
- `RecommendationDetailsModal`
  - Presentational details modal, read-only analysis sections, close behavior,
    and direct JSX helpers.
- `DiscardRecommendationModal`
  - Presentational discard confirmation modal.
- `recommendation-card-display-mapper`
  - Pure card display mapping.
- `recommendation-details-display-helpers`
  - Pure value/currency/share/tone helpers for details-style readbacks.

Current parent-owned behavior:

- Recommendation data construction and filtering into `dailyRecommendations`.
- Recommendation diagnostics/readback generation that depends on
  `dailyRecommendations`.
- ADD TRADE validation and `openTradeModal(...)`.
- Discard persistence through `updateRecommendationStatus(...)`.
- Selected `TradeModal` state/wiring.
- Supabase/localStorage behavior.
- Execution handoff creation and broker preview/package construction.
- App-wide loading/refresh state and statusbar wiring.

Remaining render slots:

- `CompanyIdentity`
- `DataModePill`
- `DataModePillRow`

These remain parent-passed render slots because they are shared by multiple
domains beyond Recommendations, including ADD TRADE, Live Day Trades, History,
broker/mock surfaces, and data-mode readbacks. Moving them as part of
Recommendations would create broader app-wide churn.

## 3. Remaining Recommendations Responsibilities in trade-app.tsx

ADD TRADE validation / `openTradeModal(...)`:

- Still owned by `app/trade-app.tsx`.
- Continues to validate freshness, latest setup data, broker preview inputs,
  manual confirmation requirements, and selected recommendation state before
  opening the trade flow.
- Should remain parent-owned until a larger trade creation domain boundary is
  planned.

Discard persistence:

- Still owned by `updateRecommendationStatus(...)`.
- The extracted container only calls the parent `onIgnore(...)` callback.
- Supabase persistence, local state updates, and archive/ignore behavior remain
  in `app/trade-app.tsx`.

Selected `TradeModal`:

- Still rendered from `app/trade-app.tsx` via `selectedRecommendation`.
- The recommendation card container only invokes the ADD TRADE callback.
- Moving selected `TradeModal` would be a separate, higher-risk trade creation
  refactor.

Data construction/filtering:

- `dailyRecommendations` and many recommendation diagnostics still derive in
  the parent.
- This includes visible recommendation counts, sample/readback diagnostics,
  intake quality, recommendation identity sets, and market diagnostic metadata.
- Moving this now would be state/data refactor work, not presentation cleanup.

Supabase/localStorage behavior:

- Recommendation loading, status persistence, demo/dev records, and app-wide
  localStorage effects remain parent-owned.
- Extracted Recommendations components do not import Supabase clients or
  localStorage helpers.

Execution handoff behavior:

- Handoff creation, broker preview construction, mock/dev execution surfaces,
  and selected execution state remain parent-owned.
- Extracted Recommendations components do not create execution handoff payloads.

Shared identity/source badge render slots:

- The parent still passes render slots to `RecommendationCardContainer`:
  - `renderIdentity`
  - `renderSourceBadge`
  - `renderSourceBadges`
- This keeps shared `CompanyIdentity` and data-mode badge components in their
  current app-wide location.

Remaining inline Recommendations rendering:

- The Recommendations tab still maps `dailyRecommendations` into
  `RecommendationCardContainer`.
- That map also computes and passes app-specific readback inputs:
  - calibration guardrails
  - pre-trade risk context
  - trade eligibility
  - decision stack
  - freshness
  - ADD TRADE gate
  - key reasons
  - position sizing
- This remaining inline rendering is composition and app-owned data selection,
  not low-level card/modal rendering.

## 4. Extraction Completeness Assessment

Is Recommendations extraction complete enough for now?

Yes. The high-payoff presentation boundaries are now extracted:

- tab shell,
- card container,
- card view,
- details modal,
- discard modal,
- card display mapper,
- details display helpers.

What would be low payoff or high risk to extract further now:

- Shared `CompanyIdentity`, `DataModePill`, and `DataModePillRow`.
  - They are used broadly across app-wide trade, broker, mock, history, and
    diagnostics surfaces.
  - Moving them under Recommendations would blur ownership.
- `dailyRecommendations` construction and diagnostics.
  - These are deeply tied to app-wide recommendation readbacks and market
    diagnostics.
- `openTradeModal(...)` / selected `TradeModal`.
  - This is trade-creation behavior, not card presentation.
- `updateRecommendationStatus(...)`.
  - This is persistence behavior and should not move as part of UI extraction.

What might be worth extracting later:

- A recommendation data/readback hook after the app-wide data ownership picture
  is clearer.
- A shared app identity/data-mode display component if multiple future tab
  extractions need it.
- A trade creation/ADD TRADE domain boundary after Live Day Trades and History
  extraction plans clarify where trade state should live.

## 5. Candidate Next Refactor Targets

1. Create Live Day Trades Tab Extraction Plan.
   - Highest safety and payoff now that Recommendations presentation is mostly
     extracted.
   - Live Day Trades remains a large app-wide rendering domain with active
     position cards, sell guidance, updates, risk controls, execution entry
     points, and shared identity/badge visuals.

2. Extract remaining recommendation render slots/shared identity helpers.
   - Lower immediate payoff.
   - Higher ownership risk because these helpers are app-wide, not
     Recommendations-specific.

3. Extract recommendation data/filtering hooks later.
   - Potentially high payoff, but substantially higher risk because it touches
     diagnostics, persistence, localStorage, Supabase, and app-wide state.

4. Reassess entire `trade-app.tsx`.
   - Useful after one more major tab/domain is planned.
   - Less actionable than a focused Live Day Trades extraction plan.

## 6. Recommended Next Action

Recommended next action:

**Action 357 - Create Live Day Trades Tab Extraction Plan**

Action 357 should be documentation-only. It should inspect the Live Day Trades
tab and identify safe presentation boundaries for active position cards, sell
guidance/readbacks, status/empty/loading states, execution controls, and shared
trade card UI while keeping trade state, persistence, Supabase/localStorage, and
execution behavior parent-owned.

## 7. Risk Assessment

ADD TRADE behavior risk:

- ADD TRADE remains parent-owned and should not move during Recommendations
  cleanup.
- Further Recommendations extraction could accidentally pull validation and
  trade creation behavior into UI components.

Discard persistence risk:

- Discard persistence remains behind `updateRecommendationStatus(...)`.
- The extracted container only owns local modal state and calls parent
  callbacks.

Selected `TradeModal` risk:

- Selected recommendation and `TradeModal` state are still app-wide.
- Moving them would be a separate trade creation refactor with higher blast
  radius.

Supabase/localStorage coupling:

- Recommendation loading, status updates, demo/dev fixtures, and localStorage
  effects remain in `app/trade-app.tsx`.
- These should not be extracted into presentational components.

Render-slot coupling:

- `CompanyIdentity` and data-mode pills are shared across app domains.
- Keep them parent/shared until a broader app-wide display component plan
  exists.

E2E-visible text/design risk:

- Recommendation card text, ADD TRADE labels, discard modal copy, details modal
  sections, and source badges are now covered by extracted presentational
  components.
- Further work should preserve current visible text, button order, class names,
  and card ordering.

## 8. Verification

Action 356 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 357 Result

Action 357 added `docs/live-day-trades-tab-extraction-plan.md`.

Planning result:

- Confirmed Recommendations extraction is paused.
- Inventoried the Live Day Trades tab shell, active position card,
  live details modal, close/sell modal, EOD safety state, live execution preview,
  and persistence dependencies.
- Identified the safest first runtime step as extracting only the Live Day
  Trades tab shell.
- Confirmed `ActivePositionCard`, `LiveTradeDetailsModal`, `ClosePositionModal`,
  sell/exit handlers, EOD acknowledgement, execution orchestrator calls,
  Supabase/localStorage behavior, and close-trade persistence should remain in
  `app/trade-app.tsx` for the first Live Day Trades extraction.

Next recommended action:

**Action 358 - Extract Live Day Trades Tab Shell**

## 10. Action 358 Result

Action 358 added `components/live-day-trades/LiveDayTradesTab.tsx`.

Result:

- Extracted only the Live Day Trades tab shell/layout.
- The shell now renders the statusbar slot, execution sandbox fixture slot,
  loading state, empty state, main live-trade grid, continued live-trade grid,
  and divider.
- `app/trade-app.tsx` still constructs the rendered `ActivePositionCard` nodes
  and owns all live-trade data, calculations, and handlers.

Safety result:

- No sell/close/exit handler, EOD safety logic, target/stop monitoring,
  execution handoff creation, persistence, Supabase/localStorage behavior, or
  selected trade state moved.
- No Avanza/browser/execution behavior was added.

Next recommended action:

**Action 359 - Reassess Live Day Trades Tab After Shell Extraction**

## 11. Action 359 Result

Action 359 added
`docs/live-day-trades-tab-post-shell-reassessment.md`.

Result:

- Reassessed Live Day Trades after the shell extraction.
- Confirmed `ActivePositionCard` is the remaining live card boundary in
  `app/trade-app.tsx`.
- Confirmed card extraction should not happen before isolating pure display
  mapping because the current card owns local details state, execution preview
  state, EOD acknowledgement state/persistence, sell guidance derivation, and
  execution preview derivation.
- Recommended extracting a pure Live Day Trade display mapper next.

Next recommended action:

**Action 360 - Extract Live Day Trade Display Mapper**

## 12. Action 370 Update

Action 370 added `docs/history-tab-extraction-plan.md`.

Current History planning status:

- Recommendations extraction remains paused.
- Live Day Trades extraction is also paused after its shell, display mapper,
  EOD panel, execution status surface, card body, and details modal
  extractions.
- The next high-payoff domain is the History tab / closed trade card area.
- The safest first History runtime refactor is extracting a `HistoryTab` shell
  while keeping filters, refresh handlers, history data construction,
  persistence, closed card behavior, and statistics-adjacent calculations in
  `app/trade-app.tsx`.

Next recommended action:

**Action 371 - Extract History Tab Shell**

## 13. Action 371 Update

Action 371 added `components/history/HistoryTab.tsx`.

Current History extraction status:

- The first History runtime extraction is complete.
- The new shell owns only the outer History layout and static heading/copy.
- `app/trade-app.tsx` still owns History data/state/handlers, closed trade card
  behavior, persistence, statistics calculations, and audit/timeline derivation.

Next recommended action:

**Action 372 - Reassess History Tab After Shell Extraction**

## 14. Action 372 Update

Action 372 added `docs/history-tab-post-shell-reassessment.md`.

Current History extraction status:

- `HistoryTab` shell extraction is complete.
- The closed trade card remains in `app/trade-app.tsx`.
- The next safest History runtime refactor is a pure closed trade display
  mapper before moving card state, audit/timeline derivation, or details modal
  rendering.

Next recommended action:

**Action 373 - Extract Closed Trade Display Mapper**
