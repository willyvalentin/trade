# ClosedPositionCard Post-Display Mapper Reassessment

## 1. Purpose

Reassess `ClosedPositionCard` after Action 373 extracted
`components/history/closed-trade-display-mapper.ts`.

This action is documentation-only. It identifies the safest next History
runtime refactor without moving filtering/sorting, PnL/result calculations,
plan-adherence/statistics logic, audit/timeline derivation, persistence, or
execution behavior.

## 2. Current History Component Inventory

Current file inventory:

- `app/trade-app.tsx`: about 40,017 lines.
- `components/history/HistoryTab.tsx`: about 41 lines.
- `components/history/closed-trade-display-mapper.ts`: about 221 lines.

Extracted History components/helpers:

- `HistoryTab`
- `closed-trade-display-mapper`

Inline History components/helpers still in `app/trade-app.tsx`:

- `ClosedPositionCard`
- `ClosedTradeResultStrip`
- `ClosedTradeJournalSummary`
- `ClosedTradePlanningSnapshotPanel`
- `ClosedTradePlanVsActualReviewPanel`
- `ClosedTradeExecutionReview`
- `ClosedTradePartialFillReview`
- `FillRows`
- `ClosedTradeOutcomeSummary`
- `ClosedTradeProcessQualitySummary`
- `ClosedTradeKeyLearnings`
- `HistoryJournalControls`
- `HistorySelect`
- `RecommendationHistoryPanel`
- `RecommendationHistoryCard`
- `HistorySection`

Current `ClosedPositionCard` shape:

- Starts around `app/trade-app.tsx:35162`.
- Receives `position: ClosedPosition` and
  `historySummary: HistoryTradeSummary`.
- Calls `buildClosedTradeDisplayProps(...)` for pure card display props.
- Still owns the expanded closed-trade details modal composition.

## 3. Remaining ClosedPositionCard Responsibilities

Local details state:

- Owns `isDetailsOpen`.
- Opens on card click.
- Opens on Enter/Space keyboard activation.
- Closes through `TradingDetailsModal` `onClose`.

Details modal rendering:

- Renders `TradingDetailsModal` inline.
- Passes the same `Closed Trade` modal kind, ticker, company name, status pill,
  and close callback.
- Composes the full closed-trade details body inline.

Plan-vs-actual review display:

- `ClosedTradePlanVsActualReviewPanel` still calls
  `buildPlanVsActualReview(...)`.
- It serializes hidden agent-readable review JSON with
  `planVsActualReviewJson(...)`.
- It renders review status, grade, metrics, deviations, warnings, and check
  rows.

Audit/timeline display:

- `ClosedPositionCard` still calls `readTradeManagementEvents()`.
- It builds `timeline` through `buildExecutionTimeline(...)`.
- It builds handoff session replay, execution quality, handoff quality,
  improvement suggestions, and outcome explanation.
- The details modal includes audit panels for broker metadata, order preview,
  execution quality, handoff quality, improvement suggestions, outcome
  explanation, handoff replay, and execution timeline.

Display mapper usage:

- `closed-trade-display-mapper` now owns card-level display props:
  - outcome label and pill tone.
  - PnL display and tone.
  - R display.
  - card metric rows.
  - journal-note fallback.
  - data-mode/reality badges.
  - History / Statistics surface notice metadata.

Remaining card body/header/action rendering:

- Header composition remains inline:
  - `CompanyIdentity`
  - data-mode pill row
  - outcome pill
  - setup/direction/opened/closed text
  - PnL/R summary
- Card body composition remains inline:
  - `MiniMetricGrid`
  - outcome explanation teaser
  - journal note teaser
  - "View details" affordance

Remaining display-only code:

- The outcome pill node is still assembled in the card because it is reused as
  the modal status slot.
- The subtitle string still uses `getSetupTypeLabel(...)`, direction, opened,
  and closed display values inline.
- These can move with a future card body or card container extraction, but are
  low risk compared with the details modal surface.

## 4. Extraction Readiness

Is full `ClosedPositionCard` extraction safe now?

- Safer than before Action 373, but not the best immediate next step.
- The mapper reduced display prop complexity, but the card still couples local
  details state with a large details modal and read-only audit/statistics
  derivation.

Would prop drilling be acceptable?

- Extracting the full card now would require a moderate-to-large prop surface:
  `position`, `historySummary`, display props, local modal state or state
  setters, timeline/replay results, execution quality, handoff quality,
  improvement suggestions, outcome explanation, and multiple modal panel slots.
- It is possible, but it would mostly move a behavior-adjacent container rather
  than reduce the riskiest remaining rendering surface.

Which pieces should stay parent/card-owned?

- `readTradeManagementEvents()`.
- timeline/replay derivation.
- execution and handoff quality derivation.
- improvement suggestions.
- outcome explanation.
- plan-vs-actual review construction and hidden JSON.
- History filtering/sorting/grouping.
- closed-position data construction and persistence.

Is there a smaller safer extraction first?

- Yes. Extract the closed trade details modal presentational component first.
- It can receive already-built display values and rendered panel nodes from
  `ClosedPositionCard`.
- This reduces the largest inline JSX block while keeping all derivation and
  local state in the card.

## 5. Candidate Next Refactor Targets

A. Extract Closed Trade details modal presentational component

- Safest next runtime refactor.
- Move only the `TradingDetailsModal` wrapper/content composition into a
  `ClosedTradeDetailsModal` component.
- Parent/card keeps `isDetailsOpen`, close callback, timeline/replay derivation,
  plan-vs-actual derivation, and all panel node construction or explicit props.

B. Extract Closed Trade plan-adherence panel

- Valuable, but more behavior-adjacent.
- `ClosedTradePlanVsActualReviewPanel` currently builds the review and hidden
  JSON, so extracting it now would either move derived logic or require a
  separate review-display mapper first.

C. Extract Closed Trade audit/timeline panel

- Higher risk because audit/timeline display depends on local event reads,
  replay construction, handoff quality, and execution quality.
- Should wait until audit/timeline derivation is isolated.

D. Extract `ClosedPositionCard` presentational/container boundary

- Higher payoff, but still broader than necessary.
- Better after the details modal is extracted so the card container surface is
  smaller and clearer.

E. Pause History and move to Statistics/Dashboard extraction plan

- Not recommended yet.
- History still has a safe next extraction target with good payoff.

## 6. Recommended Next Action

**Action 375 - Extract Closed Trade Details Modal Presentational Component**

Recommended scope:

- Create a presentational component such as
  `components/history/ClosedTradeDetailsModal.tsx`.
- Move only the expanded details modal JSX/rendering.
- Preserve `TradingDetailsModal` usage, visible copy, status slot, details
  section order, and close behavior.
- Let `ClosedPositionCard` continue to own:
  - `isDetailsOpen`.
  - modal open/close callbacks.
  - timeline/replay derivation.
  - execution/handoff quality derivation.
  - improvement suggestions.
  - outcome explanation.
  - plan-vs-actual review construction.
  - all History data/persistence/statistics behavior.

What can be passed to the modal:

- `position`
- `historySummary`
- `outcomePill`
- `closedTradeDisplay.surfaceNotice`
- `outcomeExplanation`
- `executionQuality`
- `handoffQuality`
- `replay`
- `improvementSuggestions`
- `onClose`

If a panel proves too coupled:

- Keep that panel construction in `ClosedPositionCard` and pass it as a rendered
  slot.
- Do not move derivation logic just to satisfy the modal extraction.

## 7. Risk Assessment

PnL/result display risk:

- The card display mapper now preserves current PnL/R display behavior.
- Future modal extraction should not alter `ClosedTradeResultStrip` or
  `ClosedTradeJournalSummary` values.

Plan-adherence/statistics risk:

- Keep `buildPlanVsActualReview(...)` inside the current panel until a
  dedicated plan-adherence display boundary is planned.

Audit/timeline display risk:

- Keep `readTradeManagementEvents()` and timeline/replay derivation in
  `ClosedPositionCard`.
- Do not move audit reads into presentational components.

Details modal close behavior risk:

- Preserve the existing `TradingDetailsModal` close callback and conditional
  render behavior.
- Do not move `isDetailsOpen` in the modal extraction.

E2E-visible text/design risk:

- Preserve all modal labels, section order, `details`/`summary` blocks, hidden
  agent-readable JSON, and copy.

Persistence/statistics coupling risk:

- Do not move closed trade loading, demo/Supabase persistence, History filters,
  or statistics calculations.

## 8. Verification

Action 374 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 375 Result

Action 375 added `components/history/ClosedTradeDetailsModal.tsx`.

Extraction result:

- Extracted the closed trade details modal shell/rendering into a presentational
  component.
- Preserved the modal wrapper, close button, backdrop click close, Escape close,
  header layout, status slot, body wrapper, classNames, and visible copy.
- `ClosedPositionCard` now passes the existing `CompanyIdentity` node, outcome
  status node, close callback, and current details body as children.

Still parent/card-owned:

- `isDetailsOpen` local state.
- click and keyboard open behavior.
- close callback implementation.
- PnL/result display derivation.
- `readTradeManagementEvents()`.
- timeline/replay derivation.
- execution quality and handoff quality derivation.
- improvement suggestions.
- outcome explanation construction.
- plan-vs-actual review construction and hidden JSON.
- details panel node construction.
- History filters, sorting, grouping, persistence, Supabase/localStorage, and
  app-wide statistics state.

Next recommended action:

**Action 376 - Reassess ClosedPositionCard After Details Modal Extraction**

## 10. Action 376 Result

Action 376 added
`docs/closed-position-card-post-details-modal-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after `ClosedTradeDetailsModal` extraction.
- Confirmed the details modal shell is extracted, while the card still owns
  `isDetailsOpen`, click/keyboard open behavior, the close callback,
  PnL/result derivation, plan-vs-actual derivation, audit/timeline derivation,
  detail panel nodes, persistence boundaries, and History state.
- Confirmed a full card extraction is possible but still broader than the
  safest next runtime step.
- Recommended extracting the closed trade plan-adherence panel before moving the
  full card/container boundary.

Next recommended action:

**Action 377 - Extract Closed Trade Plan-Adherence Panel**

## 11. Action 377 Result

Action 377 added `components/history/ClosedTradePlanAdherencePanel.tsx`.

Result:

- Extracted only plan-adherence / plan-vs-actual panel rendering.
- Kept `ClosedPositionCard` responsible for the plan review calculation, review
  JSON generation, PnL/result derivation, audit/timeline derivation, local
  details state, persistence boundaries, and History state.
- Preserved the existing plan review UI, text, classNames, hidden agent-readable
  JSON, warning/deviation truncation, and checks details block.

Next recommended action:

**Action 378 - Reassess ClosedPositionCard After Plan-Adherence Panel Extraction**

## 12. Action 378 Result

Action 378 added
`docs/closed-position-card-post-plan-adherence-panel-reassessment.md`.

Result:

- Reassessed the remaining `ClosedPositionCard` boundary after plan-adherence
  rendering moved out.
- Documented that the card still owns plan-vs-actual derivation, review JSON,
  audit/timeline derivation, details panel nodes, local details state,
  click/keyboard open behavior, persistence boundaries, and History state.
- Recommended extracting the audit/timeline disclosure panel before moving the
  full card boundary.

Next recommended action:

**Action 379 - Extract Closed Trade Audit Timeline Panel**
