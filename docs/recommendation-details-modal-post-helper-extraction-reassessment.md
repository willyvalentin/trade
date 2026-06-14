# Recommendation Details Modal Post-Helper Extraction Reassessment

## 1. Purpose

This reassessment records the state of `RecommendationDetailsModal` after
Action 349 extracted pure recommendation details display helpers into
`components/recommendations/recommendation-details-display-helpers.ts`.

The goal is to decide whether the full details modal can now be extracted as a
presentational component, or whether another helper/subsection extraction should
come first.

This action is documentation-only. It does not change runtime behavior.

## 2. Current Details Modal Inventory

Current extracted helper module:

- `components/recommendations/recommendation-details-display-helpers.ts`
  - value fallback formatting
  - currency/share formatting
  - decision/eligibility/risk/confirmation/calibration/confidence tone mapping
  - details tone class-name derivation

Current inline details modal pieces in `app/trade-app.tsx`:

- `RecommendationDetailsModal`
- `RecommendationDetailsPill`
- `RecommendationDetailsSection`
- `RecommendationDetailsMetricGrid`
- `RecommendationDetailsTextCard`
- `RecommendationDetailsTextStack`
- `RecommendationDetailsDecisionItem`
- `RecommendationDetailsContextCard`
- `RecommendationDetailsContextRow`
- `recommendationQuickRiskLabel(...)`

Approximate current sizes:

- `app/trade-app.tsx`: 41,860 lines.
- `recommendation-details-display-helpers.ts`: 143 lines.
- `RecommendationDetailsModal` itself is roughly 540 lines, not counting the
  shared JSX helpers immediately above it.

Major visual sections in `RecommendationDetailsModal`:

- Titlebar with `Recommendation Details`.
- Close button with `Close recommendation details`.
- Header with `CompanyIdentity`, data-mode badges, and confidence pill.
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

Parent-owned callbacks/state:

- `RecommendationCardContainer` owns `isDetailsOpen`.
- `RecommendationCardContainer` passes `onClose={() => setIsDetailsOpen(false)}`.
- `RecommendationDetailsModal` uses that callback for Escape close, backdrop
  close, and close button behavior.
- The modal does not own selected recommendation state or app-wide state.

ADD TRADE/discard/details dependencies:

- The details modal is read-only.
- It does not call ADD TRADE.
- It does not open or confirm discard.
- It does not mutate recommendation data.
- It is rendered from `RecommendationCardContainer` as a details slot.

## 3. Remaining Helper Surface

Render-only JSX helpers:

- `RecommendationDetailsPill`
- `RecommendationDetailsSection`
- `RecommendationDetailsMetricGrid`
- `RecommendationDetailsTextCard`
- `RecommendationDetailsTextStack`
- `RecommendationDetailsDecisionItem`
- `RecommendationDetailsContextCard`
- `RecommendationDetailsContextRow`

These helpers are pure UI helpers, but they are not recommendation-only anymore:
they are reused by later live trade/detail sections in `app/trade-app.tsx`.
Moving them exclusively with `RecommendationDetailsModal` would either require
additional imports for the live trade sections or a broader shared details
component module.

Display-only mappers:

- The pure display/tone helpers have already moved to
  `recommendation-details-display-helpers.ts`.
- A small mapper remains inline in the modal body:
  - quick-decision fallback composition
  - confidence score label
  - calibration severity
  - recommendation source badge list
  - metric arrays and context row maps

These are pure and local to the modal render.

Behavior-coupled helpers:

- `RecommendationDetailsModal` has Escape-key close behavior through `useEffect`.
- It also handles backdrop click and event stop-propagation.
- These are modal UI behaviors and can move with the presentational modal.

State/persistence-coupled helpers:

- None of the remaining details modal helpers write Supabase, localStorage, or
  trade state.
- ADD TRADE validation and discard persistence remain outside the details modal.

## 4. Extraction Readiness

Can `RecommendationDetailsModal` be extracted now?

Yes, with a narrow component extraction. After Action 349, the remaining modal
dependency surface is mostly:

- existing domain types and display props
- shared JSX details helpers
- `Image`
- `CompanyIdentity`
- `DataModePillRow`
- recommendation confidence/source helpers
- setup/intraday display helpers
- the extracted details display helpers

The safest version of the extraction is to move `RecommendationDetailsModal`
itself into `components/recommendations/RecommendationDetailsModal.tsx`, while
keeping the shared JSX helper components in `app/trade-app.tsx` only if moving
them would disturb other live trade/detail sections.

However, because `RecommendationDetailsModal` directly uses the JSX helpers,
the practical extraction options are:

- Move `RecommendationDetailsModal` plus a local copy/move of the JSX helpers it
  needs into the new component file, then update other existing users to import
  shared helpers if needed.
- Or first extract the JSX helpers to a shared recommendation/details UI helper
  module, then move the modal.

What props would it need?

- `recommendation`
- `calibrationGuardrails`
- `preTradeRiskContext`
- `tradeEligibility`
- `decisionStack`
- `positionSizing`
- `freshness`
- `addTradeGateMessage`
- `confirmation`
- `confidenceBreakdownItems`
- `keyReasons`
- `onClose`

Which callbacks would parent pass?

- Only `onClose`.

What must remain in parent?

- `isDetailsOpen`.
- `setIsDetailsOpen`.
- `RecommendationCardContainer`.
- ADD TRADE validation and selected `TradeModal` wiring.
- Discard state and persistence callback wiring.
- Supabase/localStorage behavior.
- Recommendation data construction.
- Execution handoff creation.

E2E-visible text/design to preserve:

- `Recommendation Details`.
- `Close recommendation details`.
- `Quick Decision`.
- `Why This Setup`.
- `Main Risk / Red Flags`.
- `Trade Plan`.
- `Decision Details`.
- `Intraday Confirmation`.
- `More Trade Context`.
- `Full Rationale`.
- All class names under `trade-recommendation-details-*`.

## 5. Candidate Next Actions

Ranked by safety and payoff:

1. Extract `RecommendationDetailsModal` presentational component.
   - Highest payoff now that pure display helpers are extracted.
   - Feasible if the JSX helper reuse is handled carefully.
2. Extract remaining JSX subsection components first.
   - Very safe, but may require a shared helper module because those components
     are reused outside the recommendation details modal.
   - Useful if the full modal move feels too broad.
3. Extract details modal prop builder/display mapper.
   - Low behavior risk, but lower payoff because the modal JSX remains inline.
   - Useful fallback if component extraction reveals import churn.
4. Pause Recommendations and move to Live Day Trades plan.
   - Reasonable if the team wants to avoid shared details helper churn now.
   - Lower payoff while the recommendation details modal remains inline.

## 6. Recommended Next Action

Recommended:

**Action 351 - Extract RecommendationDetailsModal Presentational Component**

Recommended scope:

- Create `components/recommendations/RecommendationDetailsModal.tsx`.
- Move the details modal rendering and only the JSX helpers it directly needs,
  or extract those JSX helpers into a shared details UI module if reuse requires
  it.
- Keep `RecommendationCardContainer`, `isDetailsOpen`, `onClose` state wiring,
  ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, data construction, and execution handoff
  behavior in `app/trade-app.tsx`.
- Preserve all visible copy, section ordering, class names, Escape close
  behavior, backdrop close behavior, close button behavior, and event
  stop-propagation.

Fallback:

- If shared JSX helper reuse makes the move too broad, Action 351 should extract
  the details JSX subsection helpers first and leave the modal shell inline.

## 7. Risk Assessment

Modal close behavior:

- Escape close, backdrop close, and close button behavior must stay identical.
- `onClose` should remain parent-provided.

ADD TRADE button behavior:

- The details modal does not render ADD TRADE.
- `RecommendationCard` and `openTradeModal(...)` should not be touched.

Details/discard state:

- `isDetailsOpen`, `isDiscardConfirmOpen`, and `isConfirmingDiscard` should stay
  in `RecommendationCardContainer`.

Prop drilling:

- The modal has many display props, but they already exist as explicit props.
- Preserve the explicit prop shape rather than introducing a broad object.

ClassName/design drift:

- The modal uses many `trade-recommendation-details-*` classes.
- Extraction should copy markup and class names directly.

E2E-visible text:

- Details section headings and close labels are visible and should remain exact.

localStorage/Supabase safety:

- The details modal has no persistence behavior.
- Avoid touching `updateRecommendationStatus(...)`, selected recommendation
  state, Supabase writes, or localStorage effects.

## 8. Verification

Action 350 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 351 Result

Action 351 added
`components/recommendations/RecommendationDetailsModal.tsx`.

Extraction result:

- Moved `RecommendationDetailsModal` into a dedicated presentational component.
- Moved the render-only JSX helper components it directly needs:
  - `RecommendationDetailsPill`
  - `RecommendationDetailsSection`
  - `RecommendationDetailsMetricGrid`
  - `RecommendationDetailsTextCard`
  - `RecommendationDetailsTextStack`
  - `RecommendationDetailsDecisionItem`
  - `RecommendationDetailsContextCard`
  - `RecommendationDetailsContextRow`
- Exported the shared JSX helpers still used by later live trade/detail sections
  in `app/trade-app.tsx`.
- Parent now passes the existing identity and source-badge visual slots into
  the modal.
- Parent still owns `isDetailsOpen`, `onClose` state wiring, ADD TRADE
  validation, discard persistence, selected `TradeModal`, Supabase/localStorage
  behavior, data construction, and execution handoff behavior.

Behavior preservation:

- Visible copy, section ordering, class names, close button label, Escape close
  behavior, backdrop close behavior, stop-propagation, details badges, metrics,
  and read-only sections were preserved.
- No ADD TRADE, discard, persistence, Supabase/localStorage, execution, Avanza,
  browser, or trade mutation behavior moved.

What remained inline:

- `RecommendationCardContainer` remains in `app/trade-app.tsx` because it owns
  local details/discard state and bridges parent callbacks into the card/modal
  slots.
- Data construction, validation, persistence, selected trade modal wiring, and
  execution handoff behavior remain parent-owned.

Next recommended action:

**Action 352 - Reassess Recommendations Area After Details Modal Extraction**

## 10. Action 352 Result

Action 352 added
`docs/recommendations-area-post-details-modal-extraction-reassessment.md`.

Assessment result:

- Confirmed `RecommendationDetailsModal` is now extracted and
  `RecommendationCardContainer` is the main remaining recommendation-specific
  local component in `app/trade-app.tsx`.
- Recorded that `RecommendationCardContainer` still owns local details/discard
  UI state and bridges parent `onTakeTrade(...)` / `onIgnore(...)` callbacks
  into presentational card and modal slots.
- Identified the safest remaining Recommendations step as extracting pure card
  display/prop mapping before moving the full container boundary.
- Confirmed ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, data construction, and execution handoff
  behavior remain parent-owned.

Next recommended action:

**Action 353 - Extract Recommendation Card Display Mapper**
