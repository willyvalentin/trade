# Recommendations Area Post-Modal Extraction Reassessment

## 1. Purpose

This reassessment records the Recommendations area after Action 347 extracted
`components/recommendations/DiscardRecommendationModal.tsx`.

The goal is to decide whether the safest next refactor is extracting
`RecommendationDetailsModal`, extracting its helper/display mappers first,
extracting `RecommendationCardContainer`, or pausing Recommendations work and
moving to Live Day Trades.

This action is documentation-only. It does not change runtime behavior.

## 2. Current Recommendations Inventory

Extracted components:

- `components/recommendations/RecommendationsTab.tsx`
  - Recommendations tab shell/layout.
- `components/recommendations/RecommendationCard.tsx`
  - Presentational recommendation card shell, metrics, actions, and modal
    slots.
- `components/recommendations/DiscardRecommendationModal.tsx`
  - Presentational discard confirmation modal.

Remaining inline recommendation-specific pieces in `app/trade-app.tsx`:

- `RecommendationCardContainer`
  - Computes display props for `RecommendationCard`.
  - Owns local UI-only state for details/discard visibility and discard
    confirming state.
- `RecommendationDetailsModal`
  - Large details modal with Escape/backdrop close behavior and multiple
    read-only sections.
- Details modal helper cluster:
  - tone helpers
  - value/currency/share formatters
  - pill/section/metric/text/context render helpers
  - decision/context row render helpers
  - details-specific demo/source badge helpers

Parent-owned behavior that remains in `app/trade-app.tsx`:

- Recommendation data loading and `dailyRecommendations` construction.
- ADD TRADE validation and selected `TradeModal` state/wiring.
- Discard persistence through `updateRecommendationStatus(...)`.
- Supabase writes and local recommendation state updates.
- localStorage/demo recommendation behavior.
- Execution handoff creation and execution modal state.
- Details modal open/close state.
- Discard modal open/confirming state.

Approximate current file/component sizes:

- `app/trade-app.tsx`: 41,930 lines.
- `RecommendationCard.tsx`: 136 lines.
- `DiscardRecommendationModal.tsx`: 95 lines.
- `RecommendationCardContainer`: about 160 lines.
- `RecommendationDetailsModal` plus its helper cluster spans a large local
  block around the recommendation card/details area.

## 3. RecommendationDetailsModal Analysis

Major visual sections:

- Titlebar with `Recommendation Details` heading and close button.
- Header with `CompanyIdentity`, data-mode badge row, and confidence pill.
- `Quick Decision`.
- `Why This Setup`.
- `Main Risk / Red Flags`.
- `Trade Plan`.
- `Decision Details`.
- `Intraday Confirmation`.
- Confidence breakdown.
- `More Trade Context`.
- Pre-trade risk context.
- Trade eligibility.
- Calibration guardrails.
- `Full Rationale`.
- Ture brand mark.

Helper dependencies:

- `recommendationDetailsToneFromDecisionStatus(...)`
- `recommendationDetailsToneFromEligibility(...)`
- `recommendationQuickDecisionToneFromEligibility(...)`
- `recommendationDetailsToneFromRiskContext(...)`
- `recommendationDetailsToneFromConfirmation(...)`
- `recommendationDetailsToneFromCalibration(...)`
- `recommendationDetailsToneFromConfidence(...)`
- `recommendationDetailsToneClassName(...)`
- `recommendationDetailsValue(...)`
- `recommendationDetailsCurrency(...)`
- `recommendationDetailsShares(...)`
- `RecommendationDetailsPill`
- `RecommendationDetailsSection`
- `RecommendationDetailsMetricGrid`
- `RecommendationDetailsTextCard`
- `RecommendationDetailsTextStack`
- `RecommendationDetailsDecisionItem`
- `RecommendationDetailsContextCard`
- `RecommendationDetailsContextRow`
- `CompanyIdentity`
- `DataModePillRow`
- `Image`
- existing domain helpers such as `getSetupTypeLabel(...)`,
  `getSetupTypeDescription(...)`, `intradayConfirmationLabel(...)`,
  `vwapLabel(...)`, `formatSignedPercent(...)`, `titleCaseValue(...)`, and
  `recommendationQuickRiskLabel(...)`

State and handler dependencies:

- The modal itself uses `useEffect` for Escape close behavior.
- It receives `onClose` from `RecommendationCardContainer`.
- It does not own selected recommendation state, ADD TRADE state, discard
  state, Supabase writes, localStorage, or execution handoff behavior.

ADD TRADE/details/discard coupling:

- The details modal is read-only and does not trigger ADD TRADE.
- The modal is opened and closed by `RecommendationCardContainer`.
- Discard confirmation is now separate and already extracted.

Can it be extracted safely now?

- The modal is rendering-only enough in principle: it has no persistence,
  broker, Avanza, execution, or ADD TRADE behavior.
- Extracting it whole right now is higher risk than the discard modal because
  it depends on a large helper cluster and multiple app-local render helpers.
- The safest next step is to extract the details modal display helpers/mappers
  first into recommendation-specific files, then move the modal once imports and
  prop shape are cleaner.

## 4. Helper Cluster Analysis

Pure display formatting:

- `recommendationDetailsValue(...)`
- `recommendationDetailsCurrency(...)`
- `recommendationDetailsShares(...)`
- tone-to-class helpers
- confidence/tone label helpers used only for display

Pure data mapping:

- Quick-decision fallback composition.
- Confidence score label derivation.
- Calibration severity derivation.
- Recommendation source badge derivation.
- Details metric row construction.
- Context row mapping for pre-trade risk, trade eligibility, and calibration
  guardrails.

UI-only render helpers:

- `RecommendationDetailsPill`
- `RecommendationDetailsSection`
- `RecommendationDetailsMetricGrid`
- `RecommendationDetailsTextCard`
- `RecommendationDetailsTextStack`
- `RecommendationDetailsDecisionItem`
- `RecommendationDetailsContextCard`
- `RecommendationDetailsContextRow`

Behavior/stateful helpers:

- `RecommendationDetailsModal` has Escape-close behavior.
- `RecommendationCardContainer` owns details/discard open state and discard
  confirming state.
- These are UI-only behaviors, not persistence or business logic.

Persistence/localStorage/Supabase-coupled helpers:

- None of the details modal helper cluster writes Supabase or localStorage.
- Supabase/localStorage behavior remains in parent app handlers and effects.

## 5. Candidate Next Refactor Targets

Ranked by safety and payoff:

1. Extract details modal pure display helpers/mappers first.
   - Highest safety because it removes the modal dependency tangle before moving
     the component.
   - Keeps `RecommendationDetailsModal` behavior and location unchanged.
   - Good setup for a later clean modal move.
2. Extract `RecommendationDetailsModal` presentational component.
   - Good payoff but higher risk until helper dependencies are isolated.
   - Should happen after helper extraction unless the move can be kept purely
     mechanical.
3. Extract `RecommendationCardContainer` boundary.
   - Medium payoff, higher coupling because it owns local details/discard state
     and binds parent callbacks to card/modal slots.
   - Better after `RecommendationDetailsModal` is extracted.
4. Extract remaining recommendation tab helper components.
   - Useful polish, lower payoff than details modal work.
5. Pause Recommendations and plan Live Day Trades tab extraction.
   - Reasonable if the team wants to avoid modal/helper work for now.
   - Lower immediate payoff because recommendation details helpers remain a
     large inline island.

## 6. Recommended Next Action

Recommended:

**Action 349 - Extract Recommendation Details Modal Display Helpers**

Recommended scope:

- Create a recommendation details helper/display module under
  `components/recommendations/` or `lib/`.
- Move pure formatting helpers and small UI-only details helper components where
  safe.
- Keep `RecommendationDetailsModal` itself in `app/trade-app.tsx` for one more
  action.
- Keep `RecommendationCardContainer`, details state, ADD TRADE validation,
  selected `TradeModal`, discard persistence, Supabase/localStorage behavior,
  and execution handoff behavior in `app/trade-app.tsx`.
- Preserve details modal copy, section ordering, class names, Escape close
  behavior, backdrop close behavior, and e2e-visible text.

Fallback:

- If helper extraction proves too broad, Action 349 should create a more
  detailed dependency map for `RecommendationDetailsModal` before moving any
  code.

## 7. Risk Assessment

Details modal helper coupling:

- The modal depends on many local helpers and app-local UI components.
- Moving the modal before helper isolation risks import churn and class/copy
  drift.

ADD TRADE behavior risk:

- The details modal is read-only, but it sits in the same card container as ADD
  TRADE.
- Avoid touching `openTradeModal(...)`, ADD TRADE button props, and selected
  `TradeModal` wiring.

Selected recommendation state risk:

- Selected recommendation state belongs to the ADD TRADE modal path, not the
  details modal.
- Keep that state in `app/trade-app.tsx`.

Callback/prop drilling risk:

- Extracting the full modal now would require many props and helper imports.
- Helper extraction first reduces prop/import complexity.

E2E-visible text/design drift:

- Details modal headings, close label, metric labels, and section order are
  visible.
- Preserve `Recommendation Details`, `Quick Decision`, `Trade Plan`,
  `Decision Details`, `More Trade Context`, and `Full Rationale`.

Persistence/localStorage risk:

- Details helper extraction should not touch Supabase writes, localStorage,
  discard persistence, or recommendation state updates.

## 8. Verification

Action 348 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 349 Result

Action 349 added
`components/recommendations/recommendation-details-display-helpers.ts`.

Extracted helpers:

- `recommendationDetailsValue(...)`
- `recommendationDetailsCurrency(...)`
- `recommendationDetailsShares(...)`
- `recommendationDetailsToneFromDecisionStatus(...)`
- `recommendationDetailsToneFromEligibility(...)`
- `recommendationQuickDecisionToneFromEligibility(...)`
- `recommendationDetailsToneFromRiskContext(...)`
- `recommendationDetailsToneFromConfirmation(...)`
- `recommendationDetailsToneFromCalibration(...)`
- `recommendationDetailsToneFromConfidence(...)`
- `recommendationDetailsToneClassName(...)`

Extraction result:

- Only pure display formatting and tone-mapping helpers moved.
- `RecommendationDetailsModal` remains inline in `app/trade-app.tsx`.
- `RecommendationDetailsPill`, `RecommendationDetailsSection`,
  `RecommendationDetailsMetricGrid`, `RecommendationDetailsTextCard`,
  `RecommendationDetailsTextStack`, `RecommendationDetailsDecisionItem`,
  `RecommendationDetailsContextCard`, and `RecommendationDetailsContextRow`
  remain inline because they are JSX render helpers rather than plain display
  mappers.
- `RecommendationCardContainer` still owns details/discard state and callback
  wiring.
- ADD TRADE validation, selected `TradeModal`, discard persistence,
  Supabase/localStorage behavior, data construction, and execution handoff
  behavior remain parent-owned.

Behavior preservation:

- Details modal copy, section ordering, class names, tone class names, currency
  formatting, share formatting, value fallback behavior, Escape close behavior,
  and backdrop close behavior were preserved.
- No state, handlers, persistence, execution, or modal ownership moved.

Next recommended action:

**Action 350 - Reassess Recommendation Details Modal After Helper Extraction**

## 10. Action 350 Result

Action 350 added
`docs/recommendation-details-modal-post-helper-extraction-reassessment.md`.

Assessment result:

- Reassessed the inline `RecommendationDetailsModal` after pure display helper
  extraction.
- Confirmed the modal is read-only and only needs parent `onClose`.
- Confirmed ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, data construction, and execution handoff
  behavior remain outside the modal.
- Identified shared JSX details helpers as the main remaining extraction risk
  because they are reused by later live trade/detail sections.
- Recommended extracting `RecommendationDetailsModal` as a presentational
  component next, while preserving or carefully sharing the JSX helper surface.

Next recommended action:

**Action 351 - Extract RecommendationDetailsModal Presentational Component**

## 11. Action 351 Result

Action 351 added
`components/recommendations/RecommendationDetailsModal.tsx`.

Extraction result:

- Extracted the full recommendation details modal as a presentational component.
- Moved render-only JSX details helpers with it and exported the shared helpers
  still used by other inline sections.
- Kept `RecommendationCardContainer`, details state, discard state, ADD TRADE
  validation, selected `TradeModal`, discard persistence, Supabase/localStorage
  behavior, data construction, and execution handoff behavior in
  `app/trade-app.tsx`.
- `app/trade-app.tsx` is approximately 41,082 lines after this extraction.

Next recommended action:

**Action 352 - Reassess Recommendations Area After Details Modal Extraction**

## 12. Action 352 Result

Action 352 added
`docs/recommendations-area-post-details-modal-extraction-reassessment.md`.

Assessment result:

- Reassessed the Recommendations area after `RecommendationDetailsModal` moved
  to `components/recommendations/RecommendationDetailsModal.tsx`.
- Confirmed extracted components now include `RecommendationsTab`,
  `RecommendationCard`, `DiscardRecommendationModal`, `RecommendationDetailsModal`,
  and pure recommendation details display helpers.
- Confirmed the remaining local recommendation boundary is
  `RecommendationCardContainer`, with local details/discard UI state and parent
  callback wiring.
- Recommended extracting a pure recommendation card display mapper next, rather
  than moving ADD TRADE, discard, selected `TradeModal`, Supabase/localStorage,
  or execution behavior.

Next recommended action:

**Action 353 - Extract Recommendation Card Display Mapper**
