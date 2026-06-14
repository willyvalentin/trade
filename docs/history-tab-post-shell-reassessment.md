# History Tab Post-Shell Reassessment

## 1. Purpose

Reassess the History tab after Action 371 extracted
`components/history/HistoryTab.tsx`.

This action is documentation-only. It identifies the safest next closed-trade
card extraction path without moving History filtering, sorting, PnL/result
calculation, plan-adherence/statistics logic, audit/timeline derivation,
persistence, or execution behavior.

## 2. Current Closed Trade Card Inventory

Current file inventory:

- `app/trade-app.tsx`: about 40,077 lines.
- `components/history/HistoryTab.tsx`: about 41 lines.

Closed trade card location:

- `ClosedPositionCard` is still local to `app/trade-app.tsx` and starts around
  `app/trade-app.tsx:35161`.
- It receives:
  - `position: ClosedPosition`
  - `historySummary: HistoryTradeSummary`

Major visual sections:

- Clickable `article` card wrapper with keyboard open behavior.
- `CompanyIdentity` header.
- data-mode / reality badge row.
- outcome pill.
- setup, direction, opened/closed timestamps.
- PnL and R summary.
- `MiniMetricGrid` with PnL, R, entry, exit, shares, partial status, hold time,
  and source.
- outcome explanation teaser.
- journal note teaser.
- "View details" affordance.
- `TradingDetailsModal` for expanded details.

Metrics/result sections:

- Card summary uses `historySummary.effective_pnl`,
  `historySummary.effective_r`, `historySummary.entry_price`,
  `historySummary.exit_price`, `historySummary.shares`,
  `historySummary.partial`, and `historySummary.execution_quality`.
- `ClosedTradeResultStrip` shows stored position PnL/R, entry/exit, shares,
  outcome classification, estimated net R, and estimated cost.
- `ClosedTradeJournalSummary` shows realized PnL/R, average exit, close reason,
  learning insights, and warnings.

Plan-adherence sections:

- `ClosedTradePlanningSnapshotPanel` displays stored creation-time planning
  snapshot details.
- `ClosedTradePlanVsActualReviewPanel` builds a plan-vs-actual review inline
  from the position, execution metadata, realized PnL/R, close reason, and demo
  status.
- The panel also emits hidden agent-readable review JSON.

Audit/timeline sections:

- `ClosedPositionCard` calls `readTradeManagementEvents()`.
- It builds `timeline` with `buildExecutionTimeline(...)`.
- It builds handoff session replay, execution quality, handoff quality,
  execution improvement suggestions, and outcome explanation before rendering
  the details modal.
- The modal includes audit/detail panels:
  - `BrokerExecutionMetadataPanel`
  - `BrokerOrderPreviewPanel`
  - `ExecutionQualityPanel`
  - `HandoffQualityPanel`
  - `ExecutionImprovementSuggestionsPanel`
  - `TradeOutcomeExplainerPanel`
  - `HandoffSessionReplayPanel`
  - `ExecutionTimelinePanel`

Expanded/details dependencies:

- `ClosedPositionCard` owns local `isDetailsOpen` state.
- Click and keyboard activation open the details modal.
- Modal close calls `setIsDetailsOpen(false)`.
- The expanded modal composes all current detail panels inline.

State/handler dependencies:

- The card has local UI state only.
- It does not mutate persistence directly.
- It does read local trade-management events to derive audit/timeline displays.
- The parent still owns History filters, sort state, refresh handlers,
  `historyDashboard`, `historyPositionById`, closed-position data construction,
  and persistence.

## 3. Coupling Analysis

PnL/result calculation coupling:

- Card summary mixes values from `HistoryTradeSummary` with raw
  `ClosedPosition` fallbacks.
- `pnlClassName` is derived from
  `historySummary.effective_pnl ?? parseNumber(position.pnl)`.
- Moving the full card before extracting a display mapper risks changing
  fallback behavior.

Close reason/outcome display coupling:

- Close reason is displayed through `ClosedTradeJournalSummary`.
- Outcome labels and tones use `historyOutcomeLabel(...)`,
  `historyOutcomeTone(...)`, and trade outcome explanation helpers.
- The card also builds a fallback journal note from learning insights,
  improvement suggestions, and outcome explanation watch items.

Plan-adherence/statistics coupling:

- Plan-vs-actual review is not just rendering. It calls
  `buildPlanVsActualReview(...)` and serializes `planVsActualReviewJson(...)`.
- Planning snapshot, partial fill review, execution review, and process quality
  panels are statistics-adjacent and should not move before their display
  derivation is isolated.

Audit/timeline derivation coupling:

- `ClosedPositionCard` currently reads local event history and builds timeline,
  replay, handoff quality, execution quality, and improvement suggestions.
- These are read-only, but still derived behavior. They should stay in
  `app/trade-app.tsx` until a mapper/helper extraction defines a stable
  display contract.

Selected/expanded card state:

- Details-open state is local to each card.
- It can probably move with a future container boundary, but should not move in
  the next step if the next step is a pure mapper extraction.

Filtering/sorting/grouping coupling:

- Filtering and sorting live in `historyDashboard`.
- `ClosedPositionCard` receives already-filtered summaries from the parent
  render loop.
- Future card work should not move `historyDashboard` or filter state.

Persistence/localStorage/Supabase coupling:

- The card does not write persistence, but it reads local audit events through
  `readTradeManagementEvents()`.
- Closed-position loading, demo storage, Supabase rows, and close-trade
  persistence remain app-owned.

E2E-visible text/design coupling:

- Preserve text including "View details", "Closed Trade", "History /
  Statistics", "Trade Journal Summary", "Planning Snapshot",
  "Plan vs Actual Review", "Entry / Exit Execution Review",
  "Partial Fills / Exits", "Outcome Explainer", "Key Learnings", and
  "Audit details".
- Preserve the clickable card and keyboard activation behavior in any runtime
  extraction.

## 4. Candidate Component Boundaries

A. `ClosedTradeCardDisplayMapper`

- Safest next step.
- Extract pure display derivation for card header, outcome pill labels/tone,
  card metric rows, PnL class, first journal note fallback, reality mode, and
  reality badge inputs.
- Keep callbacks, local state, audit event reads, timeline derivation, and modal
  rendering in `app/trade-app.tsx`.

B. `ClosedTradeCard`

- Useful after display mapper extraction.
- Should initially be presentational/container-light and receive already-derived
  display props plus rendered detail modal content or slot nodes.
- Should not own audit reads or statistics calculations in the first pass.

C. `ClosedTradeCardHeader`

- Lower payoff than a mapper because it would still need many display values.
- Good candidate after the mapper creates a stable display prop shape.

D. `ClosedTradeResultMetrics`

- Good candidate after card metric row display values are extracted.
- Should preserve existing `MiniMetricGrid` labels and values.

E. `ClosedTradePlanAdherencePanel`

- Higher risk because it currently builds the plan-vs-actual review and hidden
  JSON.
- Should wait until review construction or display props are separated.

F. `ClosedTradeExecutionTimeline`

- Higher risk because timeline and replay derive from local audit events.
- Should wait until audit/timeline derivation is isolated from rendering.

G. `ClosedTradeDetailsModal`

- Higher payoff but not the safest immediate next step.
- Depends on many inline panels and derived values.
- Should follow mapper and/or subpanel extraction.

H. `HistoryEmptyState` / `HistoryFilters`

- Possible, but lower priority. The filter controls are already local helper
  components and not the largest remaining risk surface.

## 5. What Should Remain In `trade-app.tsx` Initially

Keep these in `app/trade-app.tsx` for the next runtime refactor:

- History and closed trade data construction.
- Filtering/sorting/grouping logic.
- `historyDashboard` and `historyPositionById`.
- PnL/result calculation and fallbacks that are not explicitly moved to a pure
  mapper.
- Plan-vs-actual/statistics calculations.
- Audit/timeline derivation and `readTradeManagementEvents()`.
- Details modal local state if the next action is mapper-only.
- Persistence/localStorage/Supabase behavior.
- Cross-tab state and app-wide statistics ownership.

## 6. Recommended Next Action

**Action 373 - Extract Closed Trade Display Mapper**

Recommended scope:

- Create a pure helper module for closed trade card display derivation.
- Move only pure card display mapping such as:
  - PnL class/tone.
  - outcome label/tone inputs.
  - card metric rows.
  - first journal note fallback.
  - closed trade reality mode.
  - source/reality display values.
- Keep `ClosedPositionCard` in `app/trade-app.tsx`.
- Keep local `isDetailsOpen` state, details modal rendering,
  `readTradeManagementEvents()`, timeline/replay derivation, plan-vs-actual
  review construction, persistence, and app-wide History state in the parent.

Why not `ClosedTradeCard` next:

- The current card mixes display mapping with local state and audit/statistics
  derivation.
- Extracting the full card now would create a large prop surface and increase
  the chance of subtly changing result, audit, or modal behavior.

## 7. Risk Assessment

Accidental PnL/result behavior changes:

- Preserve all fallback formatting and signs exactly.
- Do not recalculate result values differently from `HistoryTradeSummary`.

Broken plan-adherence display:

- Leave `buildPlanVsActualReview(...)` and hidden review JSON where they are for
  now.

Broken audit/timeline display:

- Do not move `readTradeManagementEvents()` or timeline/replay builders in the
  next action.

Lost e2e selectors/text:

- Preserve all card and modal labels, especially hidden agent-readable review
  IDs and modal details text.

Prop drilling:

- A mapper should reduce future prop drilling by creating stable display props
  before the full card boundary moves.

Design/className drift:

- Keep exact className strings and existing `MiniMetricGrid` structure until
  the card display props are isolated.

Persistence/statistics safety:

- Do not move demo/Supabase closed-position loading, History filters,
  statistics summaries, or close-trade persistence in card-focused refactors.

## 8. Verification

Action 372 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 373 Result

Action 373 added `components/history/closed-trade-display-mapper.ts`.

Extraction result:

- Extracted pure closed trade card display mapping.
- Moved display derivation for:
  - outcome label and outcome pill tone.
  - PnL display string and PnL tone class.
  - R display string.
  - closed trade metric rows.
  - journal-note fallback.
  - closed trade data-mode/reality badges.
  - History / Statistics surface notice metadata.
- Updated `ClosedPositionCard` to call the mapper while keeping the card local
  to `app/trade-app.tsx`.

Still parent/card-owned:

- `isDetailsOpen` local state.
- click and keyboard open behavior.
- `readTradeManagementEvents()`.
- timeline/replay derivation.
- execution quality and handoff quality derivation.
- improvement suggestions.
- outcome explanation construction.
- plan-vs-actual review construction and hidden JSON.
- details modal rendering.
- History filters, sorting, grouping, persistence, Supabase/localStorage, and
  app-wide statistics state.

Next recommended action:

**Action 374 - Reassess ClosedPositionCard After Display Mapper Extraction**

## 10. Action 374 Result

Action 374 added
`docs/closed-position-card-post-display-mapper-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after the display mapper extraction.
- Confirmed the card still owns local details-open state, details modal
  rendering, timeline/replay derivation, execution quality, handoff quality,
  improvement suggestions, outcome explanation, and plan-vs-actual review
  display.
- Confirmed full card extraction is possible but still broader than the safest
  next step.
- Recommended extracting the closed trade details modal as a presentational
  component while keeping all derivation/state in `ClosedPositionCard`.

Next recommended action:

**Action 375 - Extract Closed Trade Details Modal Presentational Component**

## 11. Action 375 Result

Action 375 added `components/history/ClosedTradeDetailsModal.tsx`.

Result:

- Extracted the closed trade details modal shell/rendering.
- Kept `ClosedPositionCard` responsible for local details state, modal open/close
  callback, all display/detail panel derivation, audit/timeline reads,
  plan-vs-actual review construction, persistence, and History state.
- Preserved current modal copy, classNames, close button, Escape close, and
  backdrop close behavior.

Next recommended action:

**Action 376 - Reassess ClosedPositionCard After Details Modal Extraction**

## 15. Action 376 Result

Action 376 added
`docs/closed-position-card-post-details-modal-reassessment.md`.

Result:

- Reassessed the History card after the details modal shell extraction.
- Confirmed `ClosedPositionCard` still owns local details state, click/keyboard
  open behavior, PnL/result derivation, plan-vs-actual review construction,
  audit/timeline derivation, details panel node composition, persistence
  boundaries, and History state.
- Confirmed full card extraction remains higher risk than a smaller
  plan-adherence panel extraction.

Next recommended action:

**Action 377 - Extract Closed Trade Plan-Adherence Panel**

## 16. Action 377 Result

Action 377 added `components/history/ClosedTradePlanAdherencePanel.tsx`.

Result:

- Extracted the closed trade plan-adherence / plan-vs-actual display panel.
- Kept review derivation and review JSON generation in `ClosedPositionCard`.
- Preserved the existing plan-adherence text, labels, status/grade pill,
  metric table, warnings/deviations, checks details block, and hidden
  agent-readable JSON.
- No History filtering/sorting, PnL/result, audit/timeline, persistence, or
  statistics behavior moved.

Next recommended action:

**Action 378 - Reassess ClosedPositionCard After Plan-Adherence Panel Extraction**

## 17. Action 378 Result

Action 378 added
`docs/closed-position-card-post-plan-adherence-panel-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after `ClosedTradePlanAdherencePanel`
  extraction.
- Confirmed audit/timeline display and derivation remain the most useful
  smaller extraction target.
- Confirmed full card extraction should still wait because the card owns local
  details state, click/keyboard open behavior, audit reads, timeline/replay
  derivation, and details panel composition.

Next recommended action:

**Action 379 - Extract Closed Trade Audit Timeline Panel**

## 18. Action 379 Result

Action 379 added `components/history/ClosedTradeAuditTimelinePanel.tsx`.

Result:

- Extracted the read-only audit/timeline disclosure wrapper from
  `ClosedPositionCard`.
- Kept all audit/timeline derivation and child audit panel composition in the
  card.
- Preserved the existing disclosure label, panel order, classNames, and
  incomplete-data note.

Next recommended action:

**Action 380 - Reassess ClosedPositionCard After Audit Timeline Panel Extraction**

## 19. Action 380 Result

Action 380 added
`docs/closed-position-card-post-audit-timeline-panel-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after `ClosedTradeAuditTimelinePanel`
  extraction.
- Confirmed the remaining card code mostly owns local details state,
  click/keyboard open behavior, derivation, and composed child nodes.
- Confirmed History extraction is complete enough to pause.

Next recommended action:

**Action 381 - Create Statistics/Dashboard Extraction Plan**
