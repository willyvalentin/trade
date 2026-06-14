# ActivePositionCard Post-Display Mapper Reassessment

## 1. Purpose

Reassess the Live Day Trades card after Action 360 extracted
`components/live-day-trades/live-day-trade-display-mapper.ts`.

The goal is to choose the safest next runtime refactor without moving
close/sell/exit behavior, EOD acknowledgement persistence, execution preview
wiring, Avanza/execution behavior, Supabase/localStorage behavior, or trade
mutation logic.

## 2. Current Live Day Trades Component Inventory

Current inventory:

- `components/live-day-trades/LiveDayTradesTab.tsx`
  - Presentational tab shell extracted in Action 358.
  - Owns section layout, statusbar slot, fixture slot, loading/empty states,
    main grid, continued grid, and divider.

- `components/live-day-trades/live-day-trade-display-mapper.ts`
  - Pure display mapper extracted in Action 360.
  - Builds visible card metric rows, action/guidance classes, close button
    label/tone, aria label, guidance fallback strings, partial-close and
    profit-fade copy, updated-at text, and live trade reality badges.

- Local `ActivePositionCard` in `app/trade-app.tsx`
  - Still renders the live card.
  - Still owns local card UI state and behavior wiring.

- Local `LiveTradeDetailsModal` in `app/trade-app.tsx`
  - Large details modal with quick decision, trade plan, live context, EOD
    manual review, intraday details, execution audit, and full audit trail.

- Local `LiveExecutionStatusSurface` in `app/trade-app.tsx`
  - Renders live execution preview status and "View handoff" trigger.

- Local `ClosePositionModal` in `app/trade-app.tsx`
  - Behavior-heavy sell/close modal with payload generation, hard-stop
    contracts, agent command previews, form mapping, broker exit capture,
    mock/demo helpers, capture review, completion policy, and close submission
    wiring.

Parent/app-owned behavior remains:

- Live position data construction, sorting, and grouping.
- `latestPositionUpdates` and market status integration.
- EOD safety status calculation and market close warnings.
- Risk controls evaluation passed to live cards.
- Close/sell modal state, exit price/notes state, close persistence, demo close
  behavior, Supabase updates, and localStorage/app-wide effects.
- Execution/exit handoff creation and safety boundaries.

## 3. Remaining ActivePositionCard Responsibilities

Local UI state:

- `eodRiskAcknowledged`, initialized with `readEndOfDayAcknowledgement(...)`.
- `isDetailsOpen`, which controls `LiveTradeDetailsModal`.
- `isExecutionPreviewOpen`, which controls `ExecutionHandoffPreviewModal`.

EOD acknowledgement persistence:

- `acknowledgeEndOfDayRisk()` calls
  `writeEndOfDayAcknowledgement(position.id, eodSafetyDate, true)` and updates
  card-local state.
- This is intentionally not in the display mapper.

Close/sell action wiring:

- The card still renders the close/prepare sell button.
- The button still calls `onClosePosition(position)` from the parent and does
  not create exit payloads itself.
- Parent still owns `openClosePositionModal` and close persistence.

Execution preview wiring:

- The card derives `liveExecutionTargetPrice` and `liveExecutionQuantity`.
- It conditionally calls `runExecutionOrchestrator(...)` for live exit preview
  when the position is eligible.
- It adapts the result with `buildExecutionUiStatusFromOrchestratorResult(...)`.
- It renders `LiveExecutionStatusSurface` and opens
  `ExecutionHandoffPreviewModal` from card-local state.

Details/close modal rendering:

- `ActivePositionCard` conditionally renders `LiveTradeDetailsModal`.
- `ClosePositionModal` is not rendered inside the card; it remains parent-owned
  near the app-level modal wiring.

Display mapper usage:

- `ActivePositionCard` calls `buildLiveDayTradeDisplayProps(...)`.
- The card now consumes display props for:
  - article aria label
  - card class name
  - action pill class names
  - visible metric rows
  - guidance copy
  - partial-close/profit-fade text
  - close button label and tone
  - reality badges

Remaining display-only code:

- `LiveTradeDetailsModal` still contains many inline display-only metric rows,
  pills, text cards, and audit rows.
- EOD manual review UI is a relatively small render section inside
  `LiveTradeDetailsModal`.
- Execution audit and replay display are larger and have more dependencies.

## 4. Extraction Readiness

Is full `ActivePositionCard` extraction safe now?

- Not as the next step.
- The card boundary is clearer after Action 360, but it still mixes display
  with local UI state, local EOD acknowledgement persistence, execution preview
  orchestration, modal rendering, and parent callback wiring.
- Extracting the whole card would be feasible later, but it would move a
  behavior-heavy boundary and require a broad prop surface.

Would prop drilling be acceptable?

- It would be moderate to high.
- A full card component would need position data, latest update, market warning,
  EOD status/date, market open state, current time, execution mode, risk
  controls evaluation, saving state, close callback, and several imported
  helper dependencies.
- Extracting smaller presentational panels first will reduce that risk.

Which pieces should stay parent/card-owned?

- `readEndOfDayAcknowledgement` and `writeEndOfDayAcknowledgement`.
- `onClosePosition(position)`.
- `runExecutionOrchestrator(...)`.
- `ExecutionHandoffPreviewModal` open state and result wiring.
- `ClosePositionModal`, close persistence, broker exit confirmation, and
  Supabase/localStorage behavior.
- Parent live data construction, EOD safety computation, target/stop
  monitoring, and risk controls evaluation.

Is there a smaller safer extraction first?

- Yes: extract the EOD manual review display panel from
  `LiveTradeDetailsModal` as a presentational component.
- The panel can receive `show`, `acknowledged`, label/tone strings, message,
  and `onAcknowledge` callback from the current modal.
- The callback implementation and persistence stay in `ActivePositionCard`.

## 5. Candidate Next Refactor Targets

Ranked by safety/payoff:

A. Extract EOD safety display/ack panel

- Safest next runtime step.
- Small, visible, self-contained display section.
- Can preserve the acknowledgement callback boundary.
- Keeps persistence in `ActivePositionCard`.

B. Extract `LiveTradeDetailsModal` presentational component

- Higher payoff but larger surface.
- Requires moving a large modal with Escape/backdrop behavior, audit display,
  risk flags, EOD section, intraday section, and shared details components.
- Safer after the EOD panel is isolated.

C. Extract `ClosePositionModal` presentational component

- Not recommended yet.
- It is behavior-heavy and owns many hooks, refs, payload generators, copy
  handlers, mock/demo helpers, audit logging, broker exit confirmation, and
  submission validation.

D. Extract `ActivePositionCard` container boundary

- Reasonable later, but still too behavior-mixed for the next smallest step.
- Better after one or two card/detail subpanels move.

E. Pause Live Day Trades and move to History tab plan

- Possible if Live Day Trades risk becomes too high.
- Not recommended yet because the EOD panel extraction is small and useful.

## 6. Recommended Next Action

Recommended next action:

**Action 362 - Extract Live Day Trade EOD Safety Panel**

Scope for Action 362:

- Create a presentational component for the EOD manual review block currently
  inside `LiveTradeDetailsModal`.
- Preserve exact copy:
  - "EOD Manual Review Required"
  - "Acknowledge EOD Risk"
  - existing EOD message suffix: "Close in broker first, then close trade in
    app."
- Parent/modal/card should still compute whether the panel is shown.
- `ActivePositionCard` should still own acknowledgement state and persistence.
- The extracted panel should only render label/tone/message/button and call
  `onAcknowledge`.

## 7. Risk Assessment

Close/sell behavior risk:

- Do not touch `onClosePosition(position)` or `ClosePositionModal`.
- Do not create, submit, or persist exit payloads during panel extraction.

EOD acknowledgement persistence risk:

- The acknowledgement write must remain in `ActivePositionCard`.
- The EOD panel should be presentational only and receive a callback.
- Button text and visibility must remain unchanged.

Execution preview risk:

- `runExecutionOrchestrator(...)`, `LiveExecutionStatusSurface`, and
  `ExecutionHandoffPreviewModal` should remain in place.
- Do not move preview state or selected intent wiring in Action 362.

Current price/PnL/risk display risk:

- The card display mapper now handles visible card metrics, but the details
  modal still computes many values.
- Avoid moving details metric calculations in the EOD panel extraction.

Modal close behavior risk:

- `LiveTradeDetailsModal` owns Escape/backdrop close behavior.
- Do not move the modal shell yet.

E2E-visible text/design risk:

- Preserve "EOD Manual Review Required", "Acknowledged", "Acknowledge EOD
  Risk", "Live Day Trade Details", "Prepare Sell Order", "Close Trade", and
  the existing classes such as `trade-live-details-ack-button`.

## 8. Verification

Action 361 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 362 Result

Action 362 added `components/live-day-trades/LiveDayTradeEodSafetyPanel.tsx`.

Extraction result:

- Extracted the EOD manual review display block from `LiveTradeDetailsModal`.
- The new component renders the existing "EOD Manual Review Required" text card,
  status pill, EOD warning/review/overnight-risk message, and "Acknowledge EOD
  Risk" button.
- The component is presentational: no hooks, no localStorage reads/writes, no
  EOD calculation, no close/sell behavior, and no execution preview behavior.

Stayed in `ActivePositionCard` / `app/trade-app.tsx`:

- EOD safety status calculation.
- EOD acknowledgement state.
- `readEndOfDayAcknowledgement(...)`.
- `writeEndOfDayAcknowledgement(...)`.
- `acknowledgeEndOfDayRisk()`.
- Details modal open/close state.
- Execution preview state and `runExecutionOrchestrator(...)`.
- Close/sell handlers, `ClosePositionModal`, persistence, Supabase/localStorage
  behavior, and execution/exit handoff behavior.

Behavior preservation:

- Existing EOD label text, acknowledgement button text, message copy,
  conditional rendering, and `trade-live-details-ack-button` class were
  preserved.
- No EOD acknowledgement persistence or close/sell/exit behavior moved.

Next recommended action:

**Action 363 - Reassess ActivePositionCard After EOD Panel Extraction**

## 10. Action 363 Result

Action 363 added
`docs/active-position-card-post-eod-panel-reassessment.md`.

Reassessment result:

- Confirmed `ActivePositionCard` is smaller after the EOD panel extraction but
  still owns EOD acknowledgement persistence, details modal state, execution
  preview state, close/sell callback wiring, and execution preview
  orchestration.
- Confirmed full card extraction is still broader than the safest next step.
- Identified `LiveExecutionStatusSurface` as the smallest remaining
  presentational live-card component.

Next recommended action:

**Action 364 - Extract LiveExecutionStatusSurface Presentational Component**

## 11. Action 364 Result

Action 364 added `components/live-day-trades/LiveExecutionStatusSurface.tsx`.

Result:

- Extracted the live execution status surface rendering into a presentational
  component.
- `ActivePositionCard` and the dev-only fixture still own orchestrator calls,
  preview state, and `ExecutionHandoffPreviewModal` wiring.
- Close/sell handlers, EOD acknowledgement persistence, Supabase/localStorage
  behavior, and trade mutation behavior were not moved.

Next recommended action:

**Action 365 - Reassess ActivePositionCard After Execution Status Surface Extraction**

## 12. Action 365 Result

Action 365 added
`docs/active-position-card-post-execution-status-surface-reassessment.md`.

Result:

- Reassessed `ActivePositionCard` after `LiveExecutionStatusSurface`
  extraction.
- Confirmed the card still owns EOD acknowledgement persistence, local details
  state, local execution preview state, orchestrator calls, close callback
  wiring, and handoff preview modal wiring.
- Confirmed `ClosePositionModal` remains behavior-heavy and is not ready for
  presentational extraction.
- Recommended extracting only the visible card body/header/actions rendering
  next, while keeping state and behavior in `ActivePositionCard`.

Next recommended action:

**Action 366 - Extract Live Day Trade Card Body Presentational Component**
