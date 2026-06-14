# ActivePositionCard Post-EOD Panel Reassessment

## 1. Purpose

Reassess `ActivePositionCard` after Action 362 extracted
`components/live-day-trades/LiveDayTradeEodSafetyPanel.tsx`.

The goal is to identify the safest next runtime refactor while preserving
close/sell/exit behavior, EOD acknowledgement persistence, execution preview
wiring, Avanza/browser safety, Supabase/localStorage behavior, and trade
mutation boundaries.

## 2. Current Live Day Trades Component Inventory

Extracted pieces:

- `components/live-day-trades/LiveDayTradesTab.tsx`
  - Presentational tab shell for statusbar/fixture slots, loading/empty states,
    live card grid, continued grid, and divider.

- `components/live-day-trades/live-day-trade-display-mapper.ts`
  - Pure display mapper for visible card metrics, action/guidance classes,
    close button label/tone, aria label, fallback strings, partial/profit-fade
    copy, updated-at text, and live trade reality badges.

- `components/live-day-trades/LiveDayTradeEodSafetyPanel.tsx`
  - Presentational EOD manual review display panel.
  - Renders the EOD status pill, message, and "Acknowledge EOD Risk" button.
  - Does not calculate EOD status and does not read/write acknowledgement
    persistence.

Remaining inline pieces:

- Local `ActivePositionCard` in `app/trade-app.tsx`.
- Local `LiveTradeDetailsModal` in `app/trade-app.tsx`.
- Local `LiveExecutionStatusSurface` in `app/trade-app.tsx`.
- Local `ClosePositionModal` in `app/trade-app.tsx`.

Parent-owned behavior remains:

- Live position data construction, sorting/grouping, and latest update lookup.
- EOD status calculation and market-close warnings.
- Risk controls evaluation and target/stop monitoring.
- Selected close modal state, exit price/notes state, close persistence, demo
  close behavior, Supabase updates, and localStorage/app-wide effects.
- Execution/exit handoff creation and safety boundaries.

## 3. Remaining ActivePositionCard Responsibilities

Local UI state:

- `eodRiskAcknowledged`, initialized from
  `readEndOfDayAcknowledgement(position.id, eodSafetyDate)`.
- `isDetailsOpen`, used to show `LiveTradeDetailsModal`.
- `isExecutionPreviewOpen`, used to show `ExecutionHandoffPreviewModal`.

EOD acknowledgement state/persistence:

- `acknowledgeEndOfDayRisk()` still calls
  `writeEndOfDayAcknowledgement(position.id, eodSafetyDate, true)` and updates
  card-local state.
- `LiveDayTradeEodSafetyPanel` only receives the already-computed display props
  and callback.

Close/sell action wiring:

- The visible close/prepare-sell button still calls
  `onClosePosition(position)`.
- Parent owns the selected position, exit fields, broker exit confirmation,
  persistence, and Supabase/localStorage behavior.

Execution preview wiring:

- The card still computes live execution target/quantity.
- The card conditionally runs `runExecutionOrchestrator(...)`.
- The card still adapts the orchestrator result to `ExecutionUiStatus`.
- `LiveExecutionStatusSurface` renders the preview status and "View handoff"
  button.
- `ExecutionHandoffPreviewModal` still opens from card-local state.

Details/close modal rendering:

- `LiveTradeDetailsModal` remains inline and large.
- `ClosePositionModal` remains inline and behavior-heavy.
- `LiveTradeDetailsModal` now delegates only the EOD manual review block to
  `LiveDayTradeEodSafetyPanel`.

Display mapper usage:

- `ActivePositionCard` still uses `buildLiveDayTradeDisplayProps(...)` for the
  visible card shell display values.
- Details modal display mapping remains mostly inline.

Remaining display-only code:

- `LiveExecutionStatusSurface` is a compact, mostly presentational panel with
  status title/description/badges and a "View handoff" button callback.
- `LiveTradeDetailsModal` has many display-only subsections, but it also
  computes audit timeline/replay/quality/suggestions and handles Escape/backdrop
  behavior.
- `ClosePositionModal` is not display-only.

## 4. Extraction Readiness

Is full `ActivePositionCard` extraction safe now?

- Not as the next step.
- The card is smaller after the display mapper and EOD panel extractions, but
  it still owns EOD acknowledgement persistence, execution preview state,
  details modal state, and close/sell callback wiring.
- A full card extraction is feasible later, but it would still move a behavior
  boundary with many props.

Would prop drilling be acceptable?

- It remains moderate to high.
- A card boundary would need position data, latest update, market close
  warning, EOD status/date, market open state, current time, execution mode,
  risk controls evaluation, saving state, and close callback.
- It would also need access to several app-local components/helpers unless more
  subcomponents move first.

Which pieces should stay parent/card-owned?

- EOD acknowledgement read/write and state.
- `onClosePosition(position)` and `ClosePositionModal`.
- `runExecutionOrchestrator(...)` and selected execution preview result.
- `ExecutionHandoffPreviewModal` open state.
- Parent live data construction, risk controls, EOD calculation, target/stop
  monitoring, close persistence, Supabase/localStorage behavior, and execution
  handoff behavior.

Is there a smaller safer extraction first?

- Yes: extract `LiveExecutionStatusSurface` as a presentational component.
- It is much smaller than `LiveTradeDetailsModal` or `ClosePositionModal`.
- It can receive the same `ExecutionUiStatus` and `onViewHandoff` callback
  while leaving execution preview state and orchestrator wiring in
  `ActivePositionCard`.

## 5. Candidate Next Refactor Targets

Ranked by safety/payoff:

A. Extract `LiveExecutionStatusSurface` presentational component

- Safest next runtime refactor.
- Small component with no hooks.
- Keeps `runExecutionOrchestrator(...)`, `isExecutionPreviewOpen`, and
  `ExecutionHandoffPreviewModal` in the card.
- Preserves "View handoff" callback boundary.

B. Extract `LiveTradeDetailsModal` presentational component

- Higher payoff but much larger.
- It owns Escape/backdrop behavior and computes audit timeline, handoff replay,
  handoff quality, and improvement suggestions.
- Better after the small execution status surface moves.

C. Extract `ClosePositionModal` presentational component

- Not recommended yet.
- It owns many hooks, refs, payload generators, audit logging, copy handlers,
  mock/demo helpers, broker exit confirmation, and submit validation.

D. Extract `ActivePositionCard` container boundary

- Possible later, but still too broad for the next step.
- Better after `LiveExecutionStatusSurface` and possibly details modal helper
  extraction.

E. Pause Live Day Trades and move to History tab plan

- Available if Live Day Trades becomes too risky.
- Not recommended yet because `LiveExecutionStatusSurface` is a small, safe
  extraction target.

## 6. Recommended Next Action

Recommended next action:

**Action 364 - Extract LiveExecutionStatusSurface Presentational Component**

Scope for Action 364:

- Create a presentational component for the current `LiveExecutionStatusSurface`
  rendering.
- Preserve exact copy and visible labels:
  - status label/title/description
  - "Next action:"
  - "Final submit allowed by authority"
  - "View handoff"
- Keep `executionUiStatusPanelClassName(...)`,
  `executionUiStatusBadgeClassName(...)`, and mode-label display either in the
  component or a tiny display helper.
- Keep `runExecutionOrchestrator(...)`, selected intent state, and
  `ExecutionHandoffPreviewModal` in `ActivePositionCard`.

## 7. Risk Assessment

Close/sell behavior risk:

- Do not touch the close/prepare-sell button or `onClosePosition(position)`.
- Do not touch `ClosePositionModal`.

EOD acknowledgement persistence risk:

- Do not touch `readEndOfDayAcknowledgement(...)`,
  `writeEndOfDayAcknowledgement(...)`, or `acknowledgeEndOfDayRisk()`.
- The already-extracted EOD panel should remain presentational.

Execution preview risk:

- Extract only the status surface rendering.
- Keep `isExecutionPreviewOpen`, `setIsExecutionPreviewOpen`,
  `runExecutionOrchestrator(...)`, and `ExecutionHandoffPreviewModal` in the
  card.
- Preserve event `stopPropagation()` on the "View handoff" button.

Current price/PnL/risk display risk:

- Do not move current price/PnL/risk calculations in Action 364.
- The existing display mapper remains responsible for visible card metrics.

Modal close behavior risk:

- Do not move `LiveTradeDetailsModal` or `ExecutionHandoffPreviewModal` yet.
- Keep Escape/backdrop behavior unchanged.

E2E-visible text/design risk:

- Preserve "View handoff", "Next action:", status labels, mode badge text,
  and all status surface classes.

## 8. Verification

Action 363 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 364 Result

Action 364 added `components/live-day-trades/LiveExecutionStatusSurface.tsx`.

Extraction result:

- Extracted the live execution status surface rendering from
  `app/trade-app.tsx`.
- Preserved the existing status label/title/description display, mode badge,
  "Next action:" copy, "Final submit allowed by authority" suffix, and "View
  handoff" button.
- Preserved the button `event.stopPropagation()` behavior.
- The new component is presentational and receives `status` plus optional
  `onViewHandoff` props.

Stayed in `ActivePositionCard` / callers:

- `runExecutionOrchestrator(...)`.
- `buildExecutionUiStatusFromOrchestratorResult(...)`.
- `isExecutionPreviewOpen` state.
- `setIsExecutionPreviewOpen(...)`.
- `ExecutionHandoffPreviewModal` rendering and open/close wiring.
- Close/sell handlers, EOD acknowledgement persistence, Supabase/localStorage
  behavior, and trade mutation behavior.

Notes:

- Tiny status class/mode-label helpers were copied into the new component so
  existing helper usage in the handoff modal could remain untouched.
- The existing dev-only execution fixture also uses the extracted component and
  still owns its local execution preview state.

Next recommended action:

**Action 365 - Reassess ActivePositionCard After Execution Status Surface Extraction**

## 10. Action 365 Result

Action 365 added
`docs/active-position-card-post-execution-status-surface-reassessment.md`.

Reassessment result:

- Confirmed `LiveExecutionStatusSurface` is now extracted and presentational.
- Confirmed `ActivePositionCard` still owns local details state, execution
  preview state, EOD acknowledgement state/persistence, close callback wiring,
  execution orchestrator result creation, and `ExecutionHandoffPreviewModal`
  wiring.
- Confirmed `LiveTradeDetailsModal` and `ClosePositionModal` remain inline and
  should not be extracted as the next step.
- Identified the remaining visible live-card body/header/actions JSX as the
  safest next presentational extraction.

Next recommended action:

**Action 366 - Extract Live Day Trade Card Body Presentational Component**

## 11. Action 366 Result

Action 366 added `components/live-day-trades/LiveDayTradeCardBody.tsx`.

Result:

- Extracted the visible live card body/header/actions rendering into a
  presentational component.
- `ActivePositionCard` still owns local UI state, EOD acknowledgement
  persistence, close callback wiring, orchestrator calls, execution preview
  state, `LiveTradeDetailsModal`, and `ExecutionHandoffPreviewModal`.
- Identity, badge, metric, status, details modal, and execution preview content
  are passed as rendered slots to avoid moving shared helper surfaces.

Next recommended action:

**Action 367 - Reassess ActivePositionCard After Card Body Extraction**

## 12. Action 367 Result

Action 367 added
`docs/active-position-card-post-card-body-reassessment.md`.

Result:

- Reassessed `ActivePositionCard` after the card body extraction.
- Confirmed the full card boundary is cleaner but still tied to local state,
  EOD acknowledgement persistence, execution preview wiring, and modal slots.
- Confirmed `ClosePositionModal` is still behavior-heavy.
- Recommended extracting `LiveTradeDetailsModal` next.

Next recommended action:

**Action 368 - Extract LiveTradeDetailsModal Presentational Component**

## 13. Action 368 Result

Action 368 added `components/live-day-trades/LiveTradeDetailsModal.tsx`.

Result:

- Extracted `LiveTradeDetailsModal` rendering and modal close behavior.
- Preserved EOD acknowledgement state/persistence in `ActivePositionCard`.
- Preserved close/sell handlers, execution preview wiring, and
  `ClosePositionModal` in `app/trade-app.tsx`.

Next recommended action:

**Action 369 - Reassess ActivePositionCard After Details Modal Extraction**

## 14. Action 369 Result

Action 369 added
`docs/active-position-card-post-details-modal-reassessment.md`.

Result:

- Confirmed Live Day Trades extraction has reached a safe pause point.
- Confirmed `ActivePositionCard` should remain in place for now.
- Confirmed `ClosePositionModal` needs a dedicated plan before extraction.

Next recommended action:

**Action 370 - Create History Tab Extraction Plan**
