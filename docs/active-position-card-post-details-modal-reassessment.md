# ActivePositionCard Post Details Modal Reassessment

## 1. Purpose

Reassess `ActivePositionCard` after Action 368 extracted
`components/live-day-trades/LiveTradeDetailsModal.tsx`.

This action is documentation-only. It decides whether the next runtime refactor
should extract `ClosePositionModal`, extract the full `ActivePositionCard`
container boundary, or pause Live Day Trades and move to History tab planning.

## 2. Current Live Day Trades Component Inventory

Current approximate file/component sizes:

- `app/trade-app.tsx`: about 40,078 lines.
- `components/live-day-trades/LiveTradeDetailsModal.tsx`: about 853 lines.
- `components/live-day-trades/LiveDayTradeCardBody.tsx`: about 102 lines.
- `components/live-day-trades/LiveExecutionStatusSurface.tsx`: about 124
  lines.
- `components/live-day-trades/LiveDayTradeEodSafetyPanel.tsx`: about 45 lines.
- `components/live-day-trades/live-day-trade-display-mapper.ts`: about 222
  lines.

Extracted Live Day Trades pieces:

- `LiveDayTradesTab` renders the Live Day Trades tab shell.
- `live-day-trade-display-mapper.ts` derives pure card display props.
- `LiveDayTradeEodSafetyPanel` renders EOD manual review display.
- `LiveExecutionStatusSurface` renders execution status display and the "View
  handoff" button.
- `LiveDayTradeCardBody` renders the visible card body/header/actions shell.
- `LiveTradeDetailsModal` renders live trade details, read-only audit display,
  EOD panel placement, and modal close behavior.

Remaining inline/relevant pieces:

- `ActivePositionCard` remains inline in `app/trade-app.tsx`.
- `ClosePositionModal` remains inline and behavior-heavy.
- `ExecutionHandoffPreviewModal` remains wired from `ActivePositionCard`.
- Shared render slots/helpers remain in `app/trade-app.tsx`, including
  `CompanyIdentity`, `DataModePillRow`, `LiveMetricGrid`,
  `RiskControlsEvaluationPanel`, `DataModeSurfaceNotice`, and `FullAuditTrail`.

Parent/card-owned behavior:

- Details modal open state.
- EOD acknowledgement state and localStorage persistence.
- Close/sell callback wiring.
- Execution orchestrator calls and execution status adaptation.
- Execution handoff preview state and modal wiring.
- Audit trail event reading and audit display derivation.
- Close/sell/exit modal state, validation, payload generation, audit logging,
  copy helpers, mock import helpers, and submit handling.

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
- The extracted details modal receives acknowledgement state and callback props
  only.

Close/sell action wiring:

- `LiveDayTradeCardBody` receives the close-button handler.
- `ActivePositionCard` still wraps `event.stopPropagation()` and calls
  `onClosePosition(position)`.
- The parent still maps that callback to `openClosePositionModal(position)`.

Execution preview wiring:

- `ActivePositionCard` still builds `liveExecutionOrchestratorResult` via
  `runExecutionOrchestrator(...)`.
- It still adapts the result with
  `buildExecutionUiStatusFromOrchestratorResult(...)`.
- It still owns `isExecutionPreviewOpen` and passes
  `ExecutionHandoffPreviewModal` as a rendered slot.

`ExecutionHandoffPreviewModal` wiring:

- The handoff modal remains in `app/trade-app.tsx`.
- Open/close state and selected intent/result wiring remain card-owned.

`ClosePositionModal` rendering/state:

- `ClosePositionModal` remains a separate inline component in
  `app/trade-app.tsx`.
- It owns sell/exit form state, refs, generated sell payloads, sell hard-stop
  contracts, command previews, form mapping previews, broker exit confirmation
  validation, local timers, clipboard copy helpers, audit logging, mock sell-fill
  import helpers, and submit handling.

Remaining slots/render nodes:

- `CompanyIdentity`, `DataModePillRow`, and `LiveMetricGrid` are still shared
  local render helpers.
- `RiskControlsEvaluationPanel`, `DataModeSurfaceNotice`, and `FullAuditTrail`
  remain shared local render helpers passed into `LiveTradeDetailsModal`.
- `liveActionPill` is still built in `ActivePositionCard`.

Audit trail data derivation/reading:

- `readTradeManagementEvents()` remains in `app/trade-app.tsx`.
- `ActivePositionCard` still builds `auditTimeline`, `auditReplay`,
  `auditHandoffQuality`, `auditSuggestions`, and `auditSummary`.
- The extracted modal receives derived audit display props plus the existing
  `FullAuditTrail` node.

## 4. Extraction Readiness

Full `ActivePositionCard` extraction is now technically feasible, but the payoff
is limited and the prop surface is still broad.

Props a full extracted card boundary would need:

- `position`, `latestUpdate`, `marketCloseWarning`, `eodSafetyStatus`,
  `eodSafetyDate`, `isMarketOpen`, `currentTime`, `executionMode`,
  `riskControlsEvaluation`, `isSaving`, and `onClosePosition`.
- Shared rendered slots or imported helpers for identity, data-mode badges,
  metric grid, risk controls, data-mode notice, audit trail, and handoff modal.

Prop drilling would be acceptable but not compelling:

- The card body and details modal are already extracted.
- What remains in `ActivePositionCard` is mostly derivation/orchestration glue.
- Moving it now would either create a large prop surface or move behavior that
  should stay parent/card-owned.

Pieces that must stay parent/card-owned:

- EOD acknowledgement persistence.
- Close/sell callback implementation.
- Execution orchestrator calls and execution preview state.
- `ExecutionHandoffPreviewModal` wiring.
- Audit event reading and derived audit data.
- Current price/PnL/risk calculations until a separate mapper/hook plan exists.

Is `ClosePositionModal` a safer smaller extraction first?

- No. `ClosePositionModal` is the largest remaining Live Day Trades area, but it
  is not a presentational component.
- Extracting it as a "presentational component" would either move substantial
  behavior or leave a component with a very large state/handler prop surface.
- It should get its own extraction plan before runtime movement.

## 5. Candidate Next Refactor Targets

A. Pause Live Day Trades and create History tab extraction plan

- Best safety/payoff balance now.
- Live Day Trades has reached a natural pause point:
  tab shell, display mapper, EOD panel, execution status surface, card body, and
  details modal are extracted.
- Remaining Live Day Trades work is either behavior-heavy (`ClosePositionModal`)
  or low-payoff glue (`ActivePositionCard` container).

B. Extract `ActivePositionCard` container boundary

- Technically possible, medium risk, lower payoff.
- Would mostly move derivation/orchestration glue and require many props or
  imports.
- Better after a broader app-boundary reassessment, or if `ActivePositionCard`
  becomes a clear bottleneck again.

C. Extract remaining slot helpers/render nodes

- Medium safety, low/medium payoff.
- `CompanyIdentity`, `DataModePillRow`, `LiveMetricGrid`, and
  `DataModeSurfaceNotice` are shared across multiple app areas, so this is a
  cross-cutting extraction rather than a Live Day Trades-only step.

D. Extract `ClosePositionModal` presentational component

- Highest risk.
- Not recommended without a dedicated plan because the modal owns close/sell
  workflow behavior, generated artifacts, timers, audit logging, validation,
  copy helpers, mock import helpers, and submit handling.

## 6. Recommended Next Action

**Action 370 - Create History Tab Extraction Plan**

Recommended scope:

- Pause Live Day Trades extraction for now.
- Create a documentation-only plan for the History tab / closed trade card
  rendering.
- Inventory History tab sections, closed trade cards, statistics/readback
  surfaces, filters/sorting, selected trade details, persistence dependencies,
  and action handlers.

Why not `ClosePositionModal` next:

- It is behavior-heavy and deserves a dedicated plan before extraction.
- A runtime extraction now would create a large risk surface around close/sell
  behavior, persistence, audit logging, and e2e-visible sell package text.

Why not full `ActivePositionCard` next:

- The visible card and modal surfaces are already extracted.
- The remaining card is mostly state/orchestration glue that is safer to leave
  in place until broader app boundaries are clearer.

## 7. Risk Assessment

Close/sell behavior risk:

- Do not touch `openClosePositionModal(...)`, `onClosePosition(position)`, or
  sell/exit submit handlers without a dedicated plan.

Close modal behavior risk:

- `ClosePositionModal` owns timers, generated sell artifacts, validation, audit
  logging, copy helpers, mock import behavior, and submit handling.
- Treat it as a workflow container, not a display-only modal.

EOD acknowledgement persistence risk:

- Keep `readEndOfDayAcknowledgement(...)`,
  `writeEndOfDayAcknowledgement(...)`, and `acknowledgeEndOfDayRisk()` in
  `ActivePositionCard`.

Execution preview risk:

- Keep `runExecutionOrchestrator(...)`, execution status adaptation,
  `isExecutionPreviewOpen`, and `ExecutionHandoffPreviewModal` wiring in
  `ActivePositionCard`.

Modal close behavior risk:

- Details modal close behavior is now extracted and verified.
- Do not alter close modal behavior until it has a dedicated plan.

Audit trail display risk:

- Audit event reading remains in `app/trade-app.tsx`.
- Avoid moving `readTradeManagementEvents()` into presentational components.

E2E-visible text/design risk:

- Preserve sell package labels, close modal text, broker confirmation copy,
  History tab labels, closed trade card copy, and all e2e-visible text in future
  refactors.

## 8. Verification

Action 369 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 370 Result

Action 370 added `docs/history-tab-extraction-plan.md`.

Result:

- Paused Live Day Trades extraction and inventoried the History tab / closed
  trade card area.
- Confirmed the History tab currently combines tab composition, closed trade
  cards, recommendation history, discarded setups, statistics-adjacent panels,
  filters, and hidden agent-readable diagnostics.
- Confirmed the safest first runtime refactor is a shell extraction that keeps
  all History state, data construction, persistence, refresh handlers, and card
  behavior in `app/trade-app.tsx`.

Next recommended action:

**Action 371 - Extract History Tab Shell**

## 10. Action 371 Result

Action 371 added `components/history/HistoryTab.tsx`.

Result:

- Extracted only the outer History tab shell/layout.
- Kept History data construction, filters, sorting, refresh handlers, closed
  trade card behavior, audit/timeline derivation, persistence, and statistics
  calculations parent-owned in `app/trade-app.tsx`.

Next recommended action:

**Action 372 - Reassess History Tab After Shell Extraction**

## 11. Action 372 Result

Action 372 added `docs/history-tab-post-shell-reassessment.md`.

Result:

- Reassessed the closed trade card boundary after the History shell extraction.
- Confirmed the next safest History runtime step is a pure closed trade display
  mapper, not a full card extraction.

Next recommended action:

**Action 373 - Extract Closed Trade Display Mapper**

## 12. Action 399 Result

Action 399 added
`docs/live-day-trade-ui-state-hook-boundary-reassessment.md`.

Result:

- Reassessed ActivePositionCard state as a hook boundary after the larger UI
  extraction and app-state hook work.
- Confirmed details-open and execution-preview-open state should remain
  card-local.
- Confirmed EOD acknowledgement should remain card-owned because it reads/writes
  localStorage.
- Confirmed close/sell handlers, orchestrator calls, handoff preview wiring,
  monitoring, persistence, and trade mutation behavior must stay parent/card
  owned.

Next recommended action:

**Action 400 - Create Persistence Boundary Plan**
