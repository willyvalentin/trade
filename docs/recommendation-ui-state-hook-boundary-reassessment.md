# Recommendation UI State Hook Boundary Reassessment

## 1. Purpose

Reassess Recommendation UI state as a possible state hook boundary after the
navigation/tab hook, Statistics range hook, and modal UI state reassessment.

The Recommendation UI has been decomposed into presentational and narrow
container components, but `app/trade-app.tsx` still owns recommendation data,
ADD TRADE validation, selected TradeModal state, discard persistence, history
filters, Supabase/localStorage behavior, and execution handoff integration.

## 2. Current Recommendation State Inventory

Parent-owned recommendation state:

- `recommendations`
- `storedRecommendationSnapshots`
- `storedRecommendationScanRuns`
- `storedRecommendationBatches`
- `storedRecommendationOutcomes`
- recommendation diagnostics state:
  - `recommendationSnapshotDiagnostics`
  - `recommendationScanRunDiagnostics`
  - `recommendationBatchDiagnostics`
  - `recommendationOutcomeDiagnostics`
  - outcome backfill/dedupe/evaluation diagnostics
- recommendation-history filters:
  - `recommendationHistoryTakenFilter`
  - `recommendationHistoryOutcomeFilter`
  - `recommendationHistoryConfidenceFilter`
  - `recommendationHistoryWindowFilter`
  - `recommendationHistorySort`
- dev/demo recommendation visibility:
  - `devPreviewRecommendationsHidden`
- selected ADD TRADE modal state:
  - `selectedRecommendation`
  - `entryPrice`
  - `positionSize`
  - `validatingRecommendationId`
  - `selectedTradeValidationStatus`
  - `selectedTradeValidation`
  - `selectedTradeValidationMessage`

Parent-owned recommendation handlers:

- `openTradeModal`
- `closeTradeModal`
- `submitTrade`
- `updateRecommendationStatus`
- demo/dev tools such as `createDemoRecommendation` and demo data cleanup.
- refresh/island handlers that include the Recommendations island.

Component-local recommendation UI state:

- `RecommendationCardContainer` owns:
  - `isDetailsOpen`
  - `isDiscardConfirmOpen`
  - `isConfirmingDiscard`
- `RecommendationDetailsModal` is presentational and receives data/callbacks.
- `DiscardRecommendationModal` is presentational and receives callbacks.
- `RecommendationsTab` is a shell and owns no state.
- `RecommendationCard` is presentational and owns no state.

Data and filtering dependencies:

- `dailyRecommendations` is derived in `app/trade-app.tsx` from current
  recommendation readback sources and visibility rules.
- recommendation history is built in `app/trade-app.tsx` from snapshots,
  outcomes, active/closed trades, filters, sorting, and `currentTime`.
- diagnostics and analytics use current recommendations, stored snapshots,
  scan runs, batches, outcomes, active positions, closed positions, and demo
  flags.

Persistence and execution dependencies:

- ADD TRADE opens validation and TradeModal state, then `submitTrade` creates
  active positions and broker preview/audit metadata.
- discard persistence stays parent-owned through `updateRecommendationStatus`.
- Supabase/demo/localStorage state is updated from parent handlers.
- execution handoff creation remains outside Recommendation UI state.

## 3. Coupling Analysis

ADD TRADE / `openTradeModal` coupling:

- `openTradeModal` is not a simple UI open setter.
- it checks recommendation freshness, builds the ADD TRADE gate, handles demo
  recommendations, calls `/api/recommendations/validate-add-trade`, logs
  validation events, initializes form defaults, and updates global message state.
- `validatingRecommendationId` drives card button state and is coupled to the
  async validation flow.
- this cluster should remain parent-owned.

Discard persistence coupling:

- `RecommendationCardContainer` owns only dialog open/confirm UI state.
- the actual discard action calls parent `updateRecommendationStatus`.
- persistence and recommendation list mutation should remain in
  `app/trade-app.tsx`.

Selected TradeModal coupling:

- `selectedRecommendation` is both the modal selector and the selected domain
  entity for sizing, validation, risk controls, broker preview capture, and
  submit behavior.
- moving it into a generic Recommendation UI hook would risk selected-entity and
  validation-state mismatch.

Recommendation data construction/filtering:

- current visible recommendations are derived from multiple sources, demo/dev
  visibility, freshness, diagnostics, snapshots, and scan-run context.
- recommendation history filters are UI-like, but they drive a derived history
  surface shared with Statistics/History review.
- data construction and filter application should stay parent-owned until a
  dedicated recommendation-history filter boundary is reassessed.

localStorage/Supabase behavior:

- recommendation state is loaded/synced from Supabase and demo/local storage.
- discard and ADD TRADE flows mutate persistence-backed app state.
- no persistence effect should move with a UI-state hook.

Execution handoff behavior:

- Recommendation cards expose ADD TRADE entry points, but execution handoff and
  broker preview behavior are owned by TradeModal/execution flows.
- no execution state should move into Recommendation UI state.

Render-slot/shared identity dependencies:

- `RecommendationCardContainer` still receives `renderIdentity`,
  `renderSourceBadge`, and `renderSourceBadges`.
- these slots intentionally stay parent-passed because the identity/source-badge
  visuals are shared across app domains.

## 4. Proposed Hook Boundaries

`useRecommendationUiState`

- not recommended as the next runtime extraction.
- the obvious card UI state is already local to `RecommendationCardContainer`.
- the remaining parent-owned state is either data/domain-owned, modal/ADD
  TRADE-coupled, persistence-coupled, or shared analytics/filter state.

Potential later hook:

- `useRecommendationHistoryFilterState` may be worth reassessing later.
- it would need to keep history-building, linked-trade data construction,
  snapshots/outcomes, sorting application, and rendering parent-owned.
- it should not be extracted before History UI state has been reassessed,
  because the recommendation-history filters are closer to History/analytics
  review than card UI state.

Recommendation:

- do not extract Recommendation UI state now.
- the current component-local split is already the safe boundary for
  recommendation card details/discard UI.

## 5. What Should Remain In trade-app.tsx

- recommendation data construction and visibility filtering.
- recommendation history filters and history construction for now.
- ADD TRADE validation and `openTradeModal`.
- `selectedRecommendation` and selected TradeModal state.
- entry price and position size state.
- selected trade validation state/message.
- discard persistence through `updateRecommendationStatus`.
- Supabase/localStorage/demo data behavior.
- execution handoff and broker preview creation.
- shared identity/source-badge render slots.
- recommendation diagnostics, scan-run, batch, outcome, and analytics state.

## 6. Safe First Extraction Candidates

A. Tiny recommendation UI-only hook if isolated:

- not recommended now.
- no remaining parent-owned recommendation UI-only boolean was found.
- card-local details/discard UI is already local.

B. Leave recommendation state as-is and move to History UI state reassessment:

- recommended.
- History still owns filter/sort/detail UI state in the parent and is the next
  small state boundary with a clearer UI-only shape.

C. Leave recommendation state as-is and move to persistence boundary planning:

- useful later, but persistence is higher risk than another UI-state
  reassessment.
- Supabase/localStorage mutation boundaries should wait until smaller UI-state
  clusters are exhausted.

## 7. Risk Assessment

Selected entity mismatch risk:

- high if `selectedRecommendation`, validation state, or form defaults are moved
  separately.

ADD TRADE behavior risk:

- high because validation, freshness gating, risk sizing, messages, demo flow,
  and submit behavior are interdependent.

Discard persistence risk:

- medium/high if confirm UI is separated from the parent persistence callback.
- current local dialog state plus parent persistence is the safer split.

Stale closure risk:

- high around `openTradeModal`, `submitTrade`, `updateRecommendationStatus`,
  recommendation diagnostics, and demo-data handlers.

Prop drilling risk:

- high for a broad `useRecommendationUiState` because it would likely expose
  selected entities, validation setters, filters, and persistence callbacks.

E2E-visible behavior risk:

- high for ADD TRADE disabled/loading text, modal validation copy, discard
  confirmation, empty states, and recommendation history filters.

Execution safety risk:

- high if ADD TRADE or broker preview handoff state is moved with UI state.

## 8. Recommended Next Action

Recommended next action:

**Action 398 - Reassess History UI State Hook Boundary**

## Action 398 Result

Action 398 added `docs/history-ui-state-hook-boundary-reassessment.md`.

Result:

- Reassessed History UI state after Recommendation UI state was found too
  coupled for extraction.
- Confirmed `ClosedPositionCard` already owns its local details-open state and
  extracted History components remain presentational.
- Confirmed History filters/sorting are UI-like but feed dashboard construction,
  visible counts, card ordering, empty states, and e2e-visible labels.
- Confirmed PnL/result, plan-adherence, audit/timeline, persistence, and
  Statistics integration must remain parent/card-owned.
- Recommended reassessing Live Day Trade UI state next.

Next recommended action:

**Action 399 - Reassess Live Day Trade UI State Hook Boundary**

## Action 399 Result

Action 399 added
`docs/live-day-trade-ui-state-hook-boundary-reassessment.md`.

Result:

- Confirmed Live Day Trade UI state does not offer a safe next hook extraction.
- Details/open preview state is card-local but too low payoff to move.
- EOD acknowledgement state is persistence-coupled.
- Close/sell, orchestrator, preview, monitoring, Supabase/localStorage, and
  trade mutation behavior remain parent/card-owned.
- Recommended a persistence boundary plan next.

Next recommended action:

**Action 400 - Create Persistence Boundary Plan**

Why:

- Recommendation card UI state is already local enough.
- remaining Recommendation state is domain-, persistence-, modal-, or
  execution-coupled.
- History filter/sort/details UI state is the next safer candidate for a
  documentation-only boundary reassessment.

## 9. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.
