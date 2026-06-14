# ActivePositionCard Post Card Body Reassessment

## 1. Purpose

Reassess `ActivePositionCard` after Action 366 extracted
`components/live-day-trades/LiveDayTradeCardBody.tsx`.

This action is documentation-only. It decides whether the next Live Day Trades
runtime refactor should extract `ClosePositionModal`, `LiveTradeDetailsModal`,
the `ActivePositionCard` container boundary, remaining slot helpers, or pause
Live Day Trades and move to History tab planning.

## 2. Current Live Day Trades Component Inventory

Current approximate file/component sizes:

- `app/trade-app.tsx`: about 40,695 lines.
- `components/live-day-trades/LiveDayTradeCardBody.tsx`: about 102 lines.
- `components/live-day-trades/LiveExecutionStatusSurface.tsx`: about 124
  lines.
- `components/live-day-trades/LiveDayTradeEodSafetyPanel.tsx`: about 45 lines.
- `components/live-day-trades/live-day-trade-display-mapper.ts`: about 222
  lines.

Extracted Live Day Trades pieces:

- `LiveDayTradesTab` renders the tab shell.
- `live-day-trade-display-mapper.ts` builds pure display props for live card
  metrics, action/guidance classes, close button display, aria label,
  fallback text, partial/profit-fade copy, updated-at text, and reality badges.
- `LiveDayTradeEodSafetyPanel` renders the EOD manual review display block.
- `LiveExecutionStatusSurface` renders the execution status surface and "View
  handoff" button.
- `LiveDayTradeCardBody` renders the visible live-card wrapper, header,
  guidance, status-surface slot, close-button row, and modal/preview slots.

Remaining inline pieces in `app/trade-app.tsx`:

- `ActivePositionCard`, now mostly a state/orchestration wrapper around
  `LiveDayTradeCardBody`.
- `LiveTradeDetailsModal`, still inline and large.
- `ClosePositionModal`, still inline and behavior-heavy.
- Shared slot helpers/render nodes such as `CompanyIdentity`,
  `DataModePillRow`, `LiveMetricGrid`, `liveActionPill`, and
  `ExecutionHandoffPreviewModal`.

Parent/card-owned behavior:

- Card-local details and execution preview open state.
- EOD acknowledgement state and localStorage persistence.
- Close/sell callback wiring.
- Execution orchestrator result creation.
- Execution handoff preview modal wiring.
- Sell/exit modal state, validation, generated payloads, audit logging, and
  persistence flows elsewhere in `app/trade-app.tsx`.

## 3. Remaining ActivePositionCard Responsibilities

Local UI state:

- `eodRiskAcknowledged`.
- `isDetailsOpen`.
- `isExecutionPreviewOpen`.

EOD acknowledgement state/persistence:

- `readEndOfDayAcknowledgement(position.id, eodSafetyDate)` remains the initial
  state source.
- `acknowledgeEndOfDayRisk()` still calls
  `writeEndOfDayAcknowledgement(...)` and updates local state.
- EOD calculation and acknowledgement persistence remain intentionally
  card/parent-owned.

Close/sell action wiring:

- `LiveDayTradeCardBody` receives the close-button handler as a prop.
- `ActivePositionCard` still owns the `event.stopPropagation()` wrapper and
  `onClosePosition(position)` call.
- `ClosePositionModal` still owns the broader sell/exit workflow.

Execution preview wiring:

- `ActivePositionCard` still builds `liveExecutionOrchestratorResult` through
  `runExecutionOrchestrator(...)`.
- It still adapts the result with
  `buildExecutionUiStatusFromOrchestratorResult(...)`.
- It still owns `isExecutionPreviewOpen` and renders
  `ExecutionHandoffPreviewModal` as a slot into `LiveDayTradeCardBody`.

Details/close modal rendering:

- `LiveTradeDetailsModal` remains inline and is passed as a rendered slot.
- `ClosePositionModal` remains inline elsewhere and is not rendered by
  `ActivePositionCard`.

Remaining slots/render nodes:

- `CompanyIdentity` and `DataModePillRow` stay local/shared in
  `app/trade-app.tsx`.
- `LiveMetricGrid` stays local and is passed as `metricGrid`.
- `liveActionPill` is still built in `ActivePositionCard` and passed into
  `LiveTradeDetailsModal`.
- `LiveExecutionStatusSurface` and `ExecutionHandoffPreviewModal` are still
  composed by `ActivePositionCard` and passed as slots.

Display mapper usage:

- `buildLiveDayTradeDisplayProps(...)` now feeds most visible card display
  props into `LiveDayTradeCardBody`.
- Current price/PnL/risk calculations still happen in `ActivePositionCard`.

## 4. Extraction Readiness

Full `ActivePositionCard` extraction is safer than before, but not the best next
step.

Props a full extracted card boundary would need:

- `position`, `latestUpdate`, `marketCloseWarning`, `eodSafetyStatus`,
  `eodSafetyDate`, `isMarketOpen`, `currentTime`, `executionMode`,
  `riskControlsEvaluation`, `isSaving`, and `onClosePosition`.
- Access to many helper functions and local shared render helpers, including
  `CompanyIdentity`, `DataModePillRow`, `LiveMetricGrid`,
  `LiveTradeDetailsModal`, and `ExecutionHandoffPreviewModal`.

Prop drilling would be acceptable technically, but the payoff is now lower:

- The visible card body is already extracted.
- The remaining card code is mostly state/orchestration and slot assembly.
- Moving it before details modal extraction would either import many local
  helpers into a new file or continue passing large render slots.

Pieces that must stay parent/card-owned:

- EOD acknowledgement persistence.
- Close/sell handler implementation.
- Execution orchestrator call and execution preview state.
- Handoff preview modal open/close wiring.
- Current price/PnL/risk calculations until a separate mapper/hook plan exists.

Smaller safer extraction first:

- `LiveTradeDetailsModal` is now the next best candidate. It is broad, but it is
  primarily read-only display plus modal close behavior.
- `ClosePositionModal` is still not a presentational component because it owns
  sell payload generation, timers, audit logging, form state, validation, mock
  import behavior, and submit handling.

## 5. Candidate Next Refactor Targets

A. Extract `LiveTradeDetailsModal` presentational component

- Best safety/payoff balance after card body extraction.
- It would remove a large read-only details surface from `app/trade-app.tsx`.
- Parent/card should still own details-open state, EOD acknowledgement
  persistence, and callback implementations.
- The extraction must preserve Escape/backdrop close behavior, visible copy,
  classNames, and local read-only audit derivations.

B. Extract remaining slot helpers

- Medium safety, lower payoff.
- `CompanyIdentity`, `DataModePillRow`, and `LiveMetricGrid` are shared across
  multiple app areas. Extracting them may be useful later, but it would broaden
  beyond the `ActivePositionCard` reassessment.

C. Extract `ActivePositionCard` container boundary

- Medium payoff, medium/high prop-surface risk.
- Easier after `LiveTradeDetailsModal` moves out of `app/trade-app.tsx`.
- Should wait until fewer local render helpers and modal slots remain.

D. Extract `ClosePositionModal` presentational component

- High risk.
- Not recommended yet because it is stateful and behavior-heavy.
- A future plan should probably extract pure sell/exit display helpers or
  smaller panels before moving the modal boundary.

E. Pause Live Day Trades and create History tab extraction plan

- Reasonable later.
- Live Day Trades still has a worthwhile details-modal extraction available, so
  pausing now would leave a large local display surface behind.

## 6. Recommended Next Action

**Action 368 - Extract LiveTradeDetailsModal Presentational Component**

Recommended scope:

- Move `LiveTradeDetailsModal` rendering to
  `components/live-day-trades/LiveTradeDetailsModal.tsx`.
- Keep `ActivePositionCard` responsible for `isDetailsOpen`,
  `setIsDetailsOpen(...)`, EOD acknowledgement state/persistence, current
  price/PnL/risk calculations, orchestrator calls, execution preview state, and
  close/sell callback wiring.
- Pass current values and callbacks into the details modal component.
- Preserve Escape/backdrop close behavior and existing details text/classNames.

What should not move in Action 368:

- `ClosePositionModal`.
- Close/sell/exit handlers.
- EOD acknowledgement persistence.
- Execution handoff preview wiring.
- Supabase/localStorage persistence flows.
- Trade mutation behavior.

## 7. Risk Assessment

Close/sell behavior risk:

- Do not touch `onClosePosition(position)` or `ClosePositionModal`.
- Keep all sell/exit behavior parent-owned.

Close modal behavior risk:

- `ClosePositionModal` remains too stateful for the next extraction.
- Do not move generated sell payloads, timers, audit logging, validation, copy
  helpers, mock import behavior, or submit logic.

Details modal behavior risk:

- Preserve Escape key handling.
- Preserve backdrop click close behavior.
- Preserve `event.stopPropagation()` on modal controls.
- Preserve all visible labels, details sections, and classNames.

EOD acknowledgement persistence risk:

- Keep `readEndOfDayAcknowledgement(...)`,
  `writeEndOfDayAcknowledgement(...)`, and `acknowledgeEndOfDayRisk()` in
  `ActivePositionCard`.
- The extracted details modal may receive `eodRiskAcknowledged` and
  `onAcknowledgeEndOfDayRisk`, but should not own persistence.

Execution preview risk:

- Keep `runExecutionOrchestrator(...)`, execution status adaptation,
  `isExecutionPreviewOpen`, and `ExecutionHandoffPreviewModal` wiring in
  `ActivePositionCard`.

Modal close behavior risk:

- The details modal extraction should preserve its existing modal close behavior
  exactly.
- Do not change the card click/keyboard behavior that opens details.

E2E-visible text/design risk:

- Preserve "Live Day Trade Details", "Quick Decision", "Trade Plan", EOD
  manual review copy, execution audit labels, metric labels, and all existing
  e2e-visible details text.

## 8. Verification

Action 367 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 368 Result

Action 368 added `components/live-day-trades/LiveTradeDetailsModal.tsx`.

Extraction result:

- Moved the live trade details modal wrapper, Escape/backdrop close behavior,
  titlebar, details sections, EOD panel placement, and execution audit rendering
  into a presentational component.
- `ActivePositionCard` still conditionally renders the modal and owns
  `isDetailsOpen`, `setIsDetailsOpen(...)`, EOD acknowledgement state, EOD
  acknowledgement persistence, close callback wiring, orchestrator calls,
  execution preview state, and handoff preview modal wiring.
- Audit event reading via `readTradeManagementEvents()` stayed in
  `app/trade-app.tsx`; `ActivePositionCard` passes derived audit display data
  and the existing `FullAuditTrail` node into the extracted modal.

Render helpers moved with the modal:

- Details-modal-only tone helpers.
- Details-modal-only formatting helpers for currency, shares, signed R,
  signed currency, dates, time-in-trade, intraday values, and short payload ids.
- Modal-specific structural prop types.

Stayed in `app/trade-app.tsx`:

- `ClosePositionModal`.
- Close/sell/exit handlers.
- EOD acknowledgement persistence and handler implementation.
- Execution orchestrator calls and preview state.
- `ExecutionHandoffPreviewModal` wiring.
- Supabase/localStorage persistence flows and trade mutation behavior.

Next recommended action:

**Action 369 - Reassess ActivePositionCard After Details Modal Extraction**

## 10. Action 369 Result

Action 369 added
`docs/active-position-card-post-details-modal-reassessment.md`.

Reassessment result:

- Confirmed `LiveTradeDetailsModal` is extracted.
- Confirmed `ActivePositionCard` is now mostly state/orchestration glue plus
  audit display derivation and rendered slots.
- Confirmed `ClosePositionModal` remains too behavior-heavy for a direct
  presentational extraction.
- Recommended pausing Live Day Trades extraction and planning the History tab
  next.

Next recommended action:

**Action 370 - Create History Tab Extraction Plan**
