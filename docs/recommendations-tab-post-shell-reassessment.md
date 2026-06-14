# Recommendations Tab Post-Shell Reassessment

## 1. Purpose

This reassessment records the state of the Recommendations tab after Action 343
extracted `components/recommendations/RecommendationsTab.tsx` as a
presentational shell.

The goal is to identify the safest way to extract recommendation card
components without changing ADD TRADE, discard, details modal, persistence, or
execution handoff behavior.

This action is documentation-only. It does not change runtime behavior.

## 2. Current Recommendation Card Inventory

Current file position:

- The primary Recommendations tab render is in `app/trade-app.tsx` around the
  `activeTab === "Recommendations"` branch.
- `RecommendationsTab` now renders the tab shell, statusbar placement,
  learning-mode banner, loading empty state, dominant empty state, and grid
  wrapper.
- `RecommendationCard` remains a local component in `app/trade-app.tsx`.
- `RecommendationDetailsModal` remains local in `app/trade-app.tsx`.
- `DiscardRecommendationModal` remains local in `app/trade-app.tsx`.
- The selected `TradeModal` mount remains parent-owned.

Approximate current file size:

- `app/trade-app.tsx`: 42,068 lines

Major visual sections in `RecommendationCard`:

- Card shell with `role="button"` and keyboard open handling.
- Eyebrow: `TRADE RECOMMENDATION`.
- Data-mode badge for demo, stale market data, or Supabase-backed record.
- Header with `CompanyIdentity` and confidence pill.
- Metric grid with Entry, Stop, Target, Reward : Risk, and Confidence.
- Guidance summary with updated timestamp.
- Footer actions:
  - `ADD TRADE`
  - `Review Setup`
  - `Validating Setup`
  - `Discard`
- Inline discard confirmation modal.
- Inline details modal trigger and rendering.

Card-derived display data:

- Freshness from `getRecommendationFreshness(...)`.
- ADD TRADE gate from `getAddTradeGate(...)`.
- Intraday confirmation from the ADD TRADE gate.
- Confidence breakdown rows.
- Key reasons from recommendation, confirmation, decision stack, calibration
  guardrails, and pre-trade risk context.
- Card summary from decision stack warning, decision stack summary, key reasons,
  or thesis.
- Confidence tier and confidence label.
- Source badge from demo/stale/Supabase state.

Details modal sections:

- Recommendation Details titlebar and close control.
- Quick Decision.
- Why This Setup.
- Main Risk / Red Flags.
- Trade Plan.
- Decision Details.
- Intraday Confirmation.
- Confidence breakdown.
- More Trade Context.
- Full Rationale and supporting details where available.

Actions and state currently used by the card:

- Local UI-only state:
  - `isDetailsOpen`
  - `isDiscardConfirmOpen`
  - `isConfirmingDiscard`
- Parent callback props:
  - `onTakeTrade(recommendation)`
  - `onIgnore(recommendation)`
- Parent loading props:
  - `isSaving`
  - `isValidating`

## 3. Coupling Analysis

ADD TRADE validation and handoff coupling:

- The card does not implement validation itself.
- The primary button calls `onTakeTrade(recommendation)`.
- `app/trade-app.tsx` still owns `openTradeModal(...)`, latest validation API
  calls, demo validation behavior, selected recommendation state, entry/size
  defaults, `TradeModal` wiring, and execution handoff follow-on behavior.
- Any card extraction must preserve `stopPropagation`, disabled state, and
  button-label selection exactly.

Discard persistence coupling:

- The card owns only the confirmation UI state.
- The card calls `onIgnore(recommendation)` after confirmation.
- `app/trade-app.tsx` still owns `updateRecommendationStatus(...)`, Supabase
  update payloads, archive/discard metadata, local recommendation state updates,
  and saving/message state.
- Any card extraction must preserve the async confirm flow and the
  `isSaving || isConfirmingDiscard` disabled behavior.

Selected `TradeModal` coupling:

- `TradeModal` is not rendered by the card.
- The card only opens the flow through `onTakeTrade`.
- Selected recommendation, validation state, entry price, position size, and
  modal close behavior should remain in `app/trade-app.tsx`.

Details modal coupling:

- The details modal is visually tied to the card and currently opens from local
  card state.
- It has Escape-key close behavior and backdrop close behavior.
- It depends on many display helpers and recommendation context props.
- The safest first extraction is a move-only card boundary that carries the
  details modal and its tightly coupled display helpers with it, or leaves the
  modal local until the card import surface is understood.

Daily recommendations and demo data coupling:

- The card receives already-derived `dailyRecommendations` items.
- Filtering, sorting, demo recommendation construction, empty-state dominance,
  and diagnostic state remain upstream.

E2E-visible text and design coupling:

- Card labels, button text, details modal headings, discard modal copy, class
  names, and grid order are visible to tests and users.
- The next runtime extraction should be a move-only component extraction before
  splitting subcomponents.

## 4. Candidate Component Boundaries

Recommended boundaries:

- `components/recommendations/RecommendationCard.tsx`
  - Owns the current card shell and local UI-only details/discard state.
  - Receives the same props that the local component receives today.
  - Calls parent callbacks for ADD TRADE and discard.
- `RecommendationCardHeader`
  - Company identity, source badge, and confidence pill.
  - Good later split after the whole card is stable.
- `RecommendationCardMetrics`
  - Entry, Stop, Target, Reward : Risk, Confidence.
  - Low behavior risk, but should wait until the card boundary is extracted.
- `RecommendationCardActions`
  - ADD TRADE and Discard buttons.
  - Higher behavior risk because of disabled states, labels, and event
    propagation.
- `RecommendationDetailsModal`
  - Large details dialog and Escape/backdrop behavior.
  - Should be extracted with the card or as the immediate follow-up.
- `RecommendationPills`
  - Decision, eligibility, confirmation, risk, and confidence pills.
  - Good later cleanup once details modal is stable.
- `RecommendationEmptyState`
  - Not a priority because Action 343 already moved the tab empty-state
    rendering into `RecommendationsTab`.

## 5. What Should Remain in trade-app.tsx Initially

Keep these parent-owned for the first card extraction:

- Recommendation data loading and refresh state.
- `dailyRecommendations` construction.
- Calibration guardrails, pre-trade risk, trade eligibility, decision stack, and
  position-sizing lookup assembly.
- `openTradeModal(...)` and all ADD TRADE validation behavior.
- Selected recommendation state and selected `TradeModal` wiring.
- `updateRecommendationStatus(...)` and discard persistence.
- Supabase writes.
- localStorage and demo recommendation behavior.
- Execution handoff creation and execution modal state.
- Cross-tab diagnostics and market diagnostics state.

The extracted card should receive explicit props and callbacks. It should not
own app-wide state, persistence, data derivation, or execution behavior.

## 6. Recommended Next Action

Recommended:

**Action 345 - Extract Recommendation Card Presentational Component**

Recommended scope:

- Create `components/recommendations/RecommendationCard.tsx`.
- Move the existing `RecommendationCard` rendering as directly as possible.
- Preserve local UI-only state for details and discard confirmation if it moves
  with the card.
- Keep `openTradeModal(...)`, `updateRecommendationStatus(...)`, selected
  recommendation state, `TradeModal`, Supabase, localStorage, and execution
  handoff behavior in `app/trade-app.tsx`.
- Avoid splitting card subcomponents in the same action unless required by
  import boundaries.

If the details modal helper dependency surface is too large, Action 345 should
extract only the card shell plus keep the details modal local through a
render/callback prop. That fallback has lower payoff, so the preferred path is
a move-only card boundary with behavior preserved.

## 7. Risk Assessment

Accidental ADD TRADE behavior changes:

- Risk: disabled states, validation loading, expired recommendation blocking,
  and `Review Setup` label could drift.
- Control: keep the parent handler and preserve the button expression exactly.

Broken details modal:

- Risk: Escape close, backdrop close, stop-propagation, close icon, headings, and
  modal stacking could change.
- Control: move details modal behavior unchanged or defer it explicitly.

Broken discard behavior:

- Risk: confirm loading state, parent persistence callback, and modal close timing
  could change.
- Control: keep the same async confirm sequence and parent callback.

Lost e2e selectors/text:

- Risk: visible labels, modal titles, and button copy are test-visible.
- Control: preserve all text and class names during the move.

Prop drilling:

- Risk: the card already needs many contextual props.
- Control: start with the existing explicit props and avoid moving data
  construction into the card.

Design/className drift:

- Risk: card shell/grid/footer details can change accidentally during splitting.
- Control: perform a move-only card extraction before subcomponent extraction.

## 8. Verification

Action 344 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 345 Result

Action 345 added `components/recommendations/RecommendationCard.tsx`.

Extraction result:

- The visual recommendation card shell now lives in a dedicated presentational
  component.
- The extracted component renders the card wrapper, eyebrow, source badge slot,
  company identity slot, confidence pill, metrics grid, guidance copy, ADD
  TRADE button, Discard button, and modal slots.
- `app/trade-app.tsx` now keeps a local `RecommendationCardContainer` wrapper
  that computes card display props and passes callbacks into the presentational
  card.
- `app/trade-app.tsx` still owns ADD TRADE validation, selected
  recommendation/`TradeModal` state, discard persistence, Supabase/localStorage
  behavior, data derivation, and execution handoff behavior.
- Details modal state, discard confirmation state, `RecommendationDetailsModal`,
  and `DiscardRecommendationModal` remain in `app/trade-app.tsx`.

Behavior preservation:

- The ADD TRADE label selection, disabled state, click propagation behavior,
  Discard disabled state, card click/keyboard open behavior, class names, metric
  labels, and visible copy were preserved.
- No ADD TRADE validation, discard persistence, details modal behavior,
  selected `TradeModal` wiring, Avanza/browser/execution behavior, Supabase
  write behavior, or trade mutation behavior moved.

What remained inline:

- `RecommendationCardContainer` remains local because it owns the existing
  UI-only state and bridges parent-owned handlers to the new presentational
  card.
- `RecommendationDetailsModal` remains local because it is large and has its own
  Escape/backdrop close behavior.
- `DiscardRecommendationModal` remains local because it is shared with the
  existing discard confirmation flow and parent persistence callback.

Next recommended action:

**Action 346 - Reassess Recommendation Card After Extraction**

## 10. Action 346 Result

Action 346 added
`docs/recommendation-card-post-extraction-reassessment.md`.

Assessment result:

- `RecommendationCard.tsx` is small and stable at 136 lines.
- The remaining recommendation-specific inline weight is now mostly
  `RecommendationCardContainer`, `RecommendationDetailsModal`, and
  `DiscardRecommendationModal`.
- `RecommendationCardContainer` still owns local UI-only details/discard state
  and bridges parent-owned callbacks to the extracted card.
- ADD TRADE validation, selected `TradeModal`, discard persistence,
  Supabase/localStorage behavior, data derivation, and execution handoff
  behavior remain in `app/trade-app.tsx`.

Next recommended action:

**Action 347 - Extract Recommendation Details/Discard Modal Components**

## 11. Action 347 Result

Action 347 added
`components/recommendations/DiscardRecommendationModal.tsx`.

Extraction result:

- The discard confirmation modal rendering is now a presentational component.
- The parent container still owns discard open state, confirming state, and the
  parent discard callback.
- Supabase/localStorage behavior, ADD TRADE validation, selected `TradeModal`,
  data derivation, details modal behavior, and execution handoff behavior remain
  in `app/trade-app.tsx`.
- `RecommendationDetailsModal` remains inline because it is larger and has a
  broader helper dependency surface.

Next recommended action:

**Action 348 - Reassess Recommendations Area After Modal Extraction**

## 12. Action 348 Result

Action 348 added
`docs/recommendations-area-post-modal-extraction-reassessment.md`.

Assessment result:

- Reassessed the Recommendations area after discard modal extraction.
- Documented the remaining inline `RecommendationDetailsModal`,
  `RecommendationCardContainer`, and details helper cluster.
- Recommended extracting details modal display helpers/mappers first instead of
  moving the full modal immediately.

Next recommended action:

**Action 349 - Extract Recommendation Details Modal Display Helpers**
