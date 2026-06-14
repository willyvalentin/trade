# ActivePositionCard Post Execution Status Surface Reassessment

## 1. Purpose

Reassess `ActivePositionCard` after Action 364 extracted
`components/live-day-trades/LiveExecutionStatusSurface.tsx`.

This action is documentation-only. It decides the safest next Live Day Trades
runtime refactor target without moving close/sell behavior, EOD acknowledgement
persistence, execution preview wiring, Avanza behavior, or trade mutation logic.

## 2. Current Live Day Trades Component Inventory

Current approximate file/component sizes:

- `app/trade-app.tsx`: about 40,732 lines.
- `components/live-day-trades/LiveExecutionStatusSurface.tsx`: about 124
  lines.
- `components/live-day-trades/LiveDayTradeEodSafetyPanel.tsx`: about 45 lines.
- `components/live-day-trades/live-day-trade-display-mapper.ts`: about 222
  lines.

Extracted pieces:

- `LiveDayTradesTab` owns the outer Live Day Trades tab shell only.
- `live-day-trade-display-mapper.ts` owns pure card display derivation such as
  metric rows, action/guidance classes, close button display, aria label,
  fallback text, partial/profit-fade copy, updated-at text, and reality badges.
- `LiveDayTradeEodSafetyPanel` renders the EOD manual review display block.
- `LiveExecutionStatusSurface` renders the execution status surface and "View
  handoff" button.

Remaining inline pieces in `app/trade-app.tsx`:

- `ActivePositionCard`, starting near line 30,651.
- `LiveTradeDetailsModal`, starting near line 29,750.
- `ClosePositionModal`, starting near line 33,395.
- Remaining live-card body/header/action rendering inside `ActivePositionCard`.

Parent/card-owned behavior:

- Local card state for details modal and execution preview visibility.
- EOD acknowledgement state and localStorage persistence.
- Close/sell callback wiring.
- Execution orchestrator result creation.
- `ExecutionHandoffPreviewModal` open/close wiring.
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
- EOD calculation, date selection, and acknowledgement persistence should remain
  card/parent-owned for now.

Close/sell action wiring:

- The card close button still calls `onClosePosition(position)`.
- The larger close/sell workflow remains outside the card in
  `ClosePositionModal`.
- No close/sell behavior should move with the next presentational extraction.

Execution preview wiring:

- The card still builds `liveExecutionOrchestratorResult` with
  `runExecutionOrchestrator(...)`.
- The card still adapts that result through
  `buildExecutionUiStatusFromOrchestratorResult(...)`.
- The card still renders `ExecutionHandoffPreviewModal` when the preview is
  open.
- The extracted `LiveExecutionStatusSurface` only renders the status display and
  delegates "View handoff" through a callback.

Details/close modal rendering:

- `LiveTradeDetailsModal` remains inline and still owns Escape/backdrop close
  handling plus many display derivations.
- `ClosePositionModal` remains inline and behavior-heavy. It owns generated
  sell payloads, hard-stop contracts, sell command previews, form mapping
  previews, broker exit confirmation validation, intervals, copy state, audit
  event logging, mock import helpers, and submit handling.

Remaining card body/header/action rendering:

- The visible card shell still renders company identity, data badges,
  partial-closed badge, action pill, metric grid, guidance copy, close button,
  details modal, execution status surface, and handoff preview modal.
- Most visible card display values now come from
  `buildLiveDayTradeDisplayProps(...)`.

## 4. Extraction Readiness

Full `ActivePositionCard` extraction is not the safest next step.

Reasons:

- It would need many behavior props: position data, latest update, market status,
  EOD status/date, execution mode, risk controls, save state, close callback,
  and handoff preview wiring.
- It still owns local state that intentionally stays near the card:
  details-open, execution-preview-open, and EOD acknowledgement state.
- Moving the full boundary now would increase prop drilling and make accidental
  behavior changes harder to spot.

`ClosePositionModal` is not ready for presentational extraction.

Reasons:

- It has substantial form state, refs, timers, generated sell artifacts, audit
  logging, validation, mock import behavior, and submit handling.
- It is a sell/exit workflow surface, not just a display component.

`LiveTradeDetailsModal` is more extractable than `ClosePositionModal`, but it is
still not the smallest safe bite.

Reasons:

- It uses Escape/backdrop close handling.
- It derives audit timelines, replay, handoff quality, improvement suggestions,
  risk flags, execution quality, and multiple metric groups.
- It now delegates the EOD panel, but its helper surface remains broad.

Smaller safer extraction:

- Extract the remaining live card body/header/actions rendering into a
  presentational component.
- Keep `ActivePositionCard` as the owner of local state, orchestrator calls,
  EOD acknowledgement persistence, details modal rendering, close callback
  implementation, and handoff modal wiring.
- Pass already-derived display props, rendered status surface/modal nodes, and
  callbacks into the new component.

## 5. Candidate Next Refactor Targets

A. Extract live card body/header/actions presentational component

- Best safety/payoff balance.
- Moves card shell JSX without moving EOD persistence, close/sell behavior,
  execution preview state, or modal wiring.
- Can receive `CompanyIdentity`, badges, metric rows, guidance copy, close
  button display props, and callbacks from `ActivePositionCard`.
- Recommended before full card extraction.

B. Extract `LiveTradeDetailsModal` presentational component

- Medium payoff, medium risk.
- Should wait until the simpler card-body extraction proves the live card
  boundary remains stable.
- May benefit from another pure details-modal display mapper first.

C. Extract `ClosePositionModal` presentational component

- High risk.
- Not recommended now because the component is behavior-heavy and tightly
  coupled to sell payload generation, validation, audit logging, copy helpers,
  mock import behavior, and submit handling.

D. Extract `ActivePositionCard` container boundary

- Medium/high payoff, medium/high risk.
- Still likely too prop-heavy because local card state, EOD persistence,
  execution preview wiring, modal rendering, and close action wiring all meet
  here.

E. Pause Live Day Trades and move to History tab plan

- Reasonable later, but Live Day Trades still has a low-risk presentational
  card-body extraction available.

## 6. Recommended Next Action

**Action 366 - Extract Live Day Trade Card Body Presentational Component**

Recommended scope:

- Create a presentational component for the visible `ActivePositionCard` body,
  header, guidance, metrics, status-surface placement, and close-button row.
- Keep `ActivePositionCard` in `app/trade-app.tsx`.
- Keep local UI state, EOD acknowledgement persistence, orchestrator calls,
  execution preview state, details modal rendering, `ExecutionHandoffPreviewModal`
  wiring, and close/sell handler implementations in `ActivePositionCard` or the
  parent.

This is safer than extracting `ClosePositionModal`, `LiveTradeDetailsModal`, or
the full `ActivePositionCard` boundary because it moves only already-derived
display JSX.

## 7. Risk Assessment

Close/sell behavior risk:

- Preserve `event.stopPropagation()` on the close button.
- Keep `onClosePosition(position)` owned by `ActivePositionCard`/parent.
- Do not touch `ClosePositionModal` in the next extraction.

Close modal behavior risk:

- `ClosePositionModal` should remain inline until its stateful sell/exit flow is
  separately planned.
- Do not move generated sell payloads, timers, audit logging, validation, mock
  imports, or submit behavior.

EOD acknowledgement persistence risk:

- Keep `readEndOfDayAcknowledgement(...)`,
  `writeEndOfDayAcknowledgement(...)`, and `acknowledgeEndOfDayRisk()` in
  `ActivePositionCard`.
- The existing `LiveDayTradeEodSafetyPanel` remains presentational only.

Execution preview risk:

- Keep `runExecutionOrchestrator(...)`, execution status adaptation,
  `isExecutionPreviewOpen`, `setIsExecutionPreviewOpen(...)`, and
  `ExecutionHandoffPreviewModal` wiring in `ActivePositionCard`.
- If the status surface is passed as a rendered node, preserve current
  conditional rendering and "View handoff" behavior.

Current price/PnL/risk display risk:

- Keep calculations in `ActivePositionCard` and existing helpers.
- Pass already-computed display props into any new body component.

Modal close behavior risk:

- Do not move `LiveTradeDetailsModal` yet.
- Preserve card click/keyboard behavior that opens details.

E2E-visible text/design risk:

- Preserve card classNames, button text, metric labels, guidance copy, partial
  status labels, "Updated" copy, and e2e-visible text.

## 8. Verification

Action 365 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 366 Result

Action 366 added `components/live-day-trades/LiveDayTradeCardBody.tsx`.

Extraction result:

- Moved the visible live day trade card wrapper/body/header/actions rendering
  out of `ActivePositionCard`.
- The new component renders the card `<article>`, header layout, partial-closed
  badge, action pill, guidance copy, status-surface placement, close-button row,
  and modal/preview slots.
- Existing identity, data-mode badge, metric grid, status surface, details
  modal, and execution preview modal are passed as rendered slots so their
  helper surfaces and behavior stayed in `app/trade-app.tsx`.

Stayed in `ActivePositionCard`:

- Local UI state: details open, execution preview open, and EOD risk
  acknowledgement.
- EOD acknowledgement persistence.
- Current price/PnL/risk calculations.
- `runExecutionOrchestrator(...)` and execution status adaptation.
- `ExecutionHandoffPreviewModal` wiring.
- `LiveTradeDetailsModal` rendering/state.
- Close/sell callback wiring.
- All persistence, Supabase/localStorage behavior, and trade mutation behavior.

Behavior preservation:

- Existing card click/keyboard details behavior is still owned by
  `ActivePositionCard` and passed into the body component.
- Existing close-button `event.stopPropagation()` and `onClosePosition(position)`
  behavior are still owned by `ActivePositionCard`.
- No close/sell/exit, EOD acknowledgement, orchestrator, preview, modal,
  persistence, or trade mutation logic moved.

Next recommended action:

**Action 367 - Reassess ActivePositionCard After Card Body Extraction**

## 10. Action 367 Result

Action 367 added
`docs/active-position-card-post-card-body-reassessment.md`.

Reassessment result:

- Confirmed `LiveDayTradeCardBody` is extracted and `ActivePositionCard` is now
  mostly a state/orchestration wrapper around slots.
- Confirmed `ActivePositionCard` still owns details-open state, execution
  preview state, EOD acknowledgement persistence, close callback wiring,
  orchestrator calls, and handoff preview modal wiring.
- Confirmed `ClosePositionModal` remains too behavior-heavy for the next
  extraction.
- Recommended extracting `LiveTradeDetailsModal` next because it is the largest
  remaining read-only live-card display surface.

Next recommended action:

**Action 368 - Extract LiveTradeDetailsModal Presentational Component**

## 11. Action 368 Result

Action 368 added `components/live-day-trades/LiveTradeDetailsModal.tsx`.

Result:

- Extracted the live trade details modal rendering into a presentational
  component.
- Kept details-open state, EOD acknowledgement persistence, close/sell
  callbacks, orchestrator calls, execution preview state, and handoff modal
  wiring in `ActivePositionCard`.
- Kept audit event reading in `app/trade-app.tsx` and passed derived audit
  display props to the modal.

Next recommended action:

**Action 369 - Reassess ActivePositionCard After Details Modal Extraction**

## 12. Action 369 Result

Action 369 added
`docs/active-position-card-post-details-modal-reassessment.md`.

Result:

- Reassessed `ActivePositionCard` after details modal extraction.
- Confirmed `ClosePositionModal` remains behavior-heavy and should get its own
  plan before runtime extraction.
- Confirmed the full `ActivePositionCard` boundary is now possible but lower
  payoff than moving to the next app-wide domain.
- Recommended creating a History tab extraction plan next.

Next recommended action:

**Action 370 - Create History Tab Extraction Plan**
