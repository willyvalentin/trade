# Live Day Trades Tab Post-Shell Reassessment

## 1. Purpose

Reassess the Live Day Trades area after Action 358 extracted
`components/live-day-trades/LiveDayTradesTab.tsx`.

The goal is to identify the safest next runtime refactor for live trade card
rendering without changing sell/close/exit behavior, monitoring behavior, EOD
safety behavior, persistence, or execution handoff behavior.

## 2. Current Live Card Inventory

Approximate current locations:

- Live Day Trades tab composition: `app/trade-app.tsx` around the active tab
  branch near line 14,760.
- Live card component: local `ActivePositionCard` in `app/trade-app.tsx`,
  starting near line 30,720.
- Live details modal: local `LiveTradeDetailsModal`, starting near line 29,800.
- Close/sell modal: local `ClosePositionModal`, starting near line 33,560.
- Current `app/trade-app.tsx` size after Action 358: about 40,904 lines.
- `LiveDayTradesTab.tsx` size: about 57 lines.

Major visual sections in `ActivePositionCard`:

- Card wrapper with role, keyboard open behavior, urgency class, and live trade
  accessibility label.
- Header with `CompanyIdentity`, data-mode badge, partially closed badge, and
  live action pill.
- `LiveMetricGrid` showing current price, unrealized PnL, current R, shares,
  entry, stop, and target.
- Live sell guidance summary and next step.
- Partial close and profit-fade inline notices.
- Optional `LiveExecutionStatusSurface` with "View handoff".
- Footer action button that calls the parent close/sell handler.
- `LiveTradeDetailsModal` when card-local details state is open.
- `ExecutionHandoffPreviewModal` when card-local execution preview state is
  open and the orchestrator result is visible.

Major details modal sections:

- Quick Decision.
- Trade Plan.
- Live Trade Context.
- EOD Manual Review Required acknowledgement UI.
- Why Now.
- Live Trade Details.
- Execution Audit.
- Full audit trail.

Important actions and state inside the card:

- `isDetailsOpen` local state.
- `isExecutionPreviewOpen` local state.
- `eodRiskAcknowledged` local state initialized from local acknowledgement
  storage.
- `acknowledgeEndOfDayRisk`, which writes the local EOD acknowledgement.
- Close/sell button callback to parent `openClosePositionModal`.
- Execution preview open callback to show `ExecutionHandoffPreviewModal`.

## 3. Coupling Analysis

Sell/close/exit behavior coupling:

- The card does not persist the close itself, but it decides which button label
  to show and calls `onClosePosition(position)`.
- The parent still owns `openClosePositionModal`, selected position state,
  exit price/notes state, broker exit confirmation validation, close/partial
  close persistence, Supabase updates, local demo close behavior, and audit
  event append calls.
- Moving the full card before isolating display mapping risks accidentally
  changing the sell handoff/close modal trigger boundary.

EOD safety coupling:

- The parent passes `eodSafetyStatus` and `eodSafetyDate`, but the card owns
  `eodRiskAcknowledged` and writes the acknowledgement locally.
- The details modal renders the EOD manual review panel and acknowledgement
  button.
- This is safe as card-local UI state today, but it is not purely
  presentational.

Live monitoring/current price coupling:

- The card receives `latestUpdate` and derives current price, stale status,
  warnings, previous best price, current R fallback, and unrealized PnL.
- The parent still constructs, sorts, and groups live position items from
  `activePositions` and `latestPositionUpdates`.
- Live monitoring state should remain parent-owned for now.

PnL/risk calculation coupling:

- The parent computes the `riskControlsEvaluation` passed into each card.
- The card recomputes `currentR`, `unrealizedPnl`, sell guidance, position
  urgency, risk flags, execution quality, audit timeline, handoff replay,
  handoff quality, and improvement suggestions.
- Several of these are pure display derivations, but they currently sit next to
  local UI state and modal rendering.

Selected/expanded card state:

- Details and execution preview state are local to `ActivePositionCard`.
- Extracting a card container later can keep this state with the card boundary,
  but a pure presentational card should not own it.

Persistence/localStorage/Supabase coupling:

- EOD acknowledgement uses local acknowledgement read/write helpers inside the
  card.
- Close persistence and Supabase updates remain in parent/`ClosePositionModal`
  flow.
- The details modal reads local trade management events for audit display.
- Any extraction must avoid moving Supabase writes, localStorage effects that
  affect app-wide state, or close persistence.

Execution/exit handoff coupling:

- The card conditionally calls `runExecutionOrchestrator` for live exit intent
  preview and adapts it to `ExecutionUiStatus`.
- It can open `ExecutionHandoffPreviewModal`.
- `ClosePositionModal` separately builds sell payloads, hard-stop contracts,
  sell agent commands, form mapping previews, broker exit capture specs, Ture
  autofill contracts, capture reviews, and completion policies.
- These should not move during a first card extraction.

E2E-visible text/design coupling:

- Card text includes "Prepare Sell Order", "Close Trade", "Partially Closed",
  "Profit fade", "View handoff", and the details modal title "Live Day Trade
  Details".
- Layout classes include `trade-live-card`, `trade-live-card__header`,
  `trade-live-guidance`, `trade-live-card__footer`, and
  `trade-live-close-button`.
- Future refactors must preserve text, button order, keyboard behavior, and
  class names.

## 4. Candidate Component Boundaries

Possible eventual components:

- `LiveDayTradeCard`
  - Full card shell and visible card UI.
  - Should wait until display derivation is cleaner.

- `LiveDayTradeCardHeader`
  - Company identity, source badges, partial status badge, action pill.
  - Low behavior risk once display props exist.

- `LiveDayTradeMetrics`
  - Current/Unrealized/Current R/Shares/Entry/Stop/Target metric grid.
  - Good candidate after a display mapper exists.

- `LiveDayTradeRiskPanel`
  - Risk controls, urgency, warnings, invalidation, and risk flags.
  - Coupled to details modal and risk helper outputs.

- `LiveDayTradeEodSafetyPanel`
  - EOD manual review text and acknowledgement button.
  - Higher risk because it writes local acknowledgement state.

- `LiveDayTradeActions`
  - Close/prepare sell button.
  - Must preserve parent callback boundary and disabled state exactly.

- `LiveDayTradeDetails`
  - Larger details modal subsections.
  - Should wait until card display mapping and card shell boundaries are
    clearer.

- `LiveDayTradeEmptyState`
  - Already effectively covered by `LiveDayTradesTab`.

## 5. What Should Remain in `trade-app.tsx` Initially

Keep these parent-owned for the next runtime refactor:

- Live trade/position data construction from `activePositions`.
- `latestPositionUpdates` lookup and live item sorting/grouping.
- Current price/PnL/risk calculations used for risk controls if currently
  parent-owned.
- EOD safety status construction and market-close warnings.
- Target/stop monitoring and take-profit grouping.
- Sell/close/exit handler implementations.
- `openClosePositionModal`, selected position state, exit price/notes state,
  and `ClosePositionModal` wiring.
- Execution/exit handoff creation and close/sell payload construction.
- Supabase/localStorage/demo persistence.
- App-wide selected trade and cross-tab state.

The card may continue to own card-local details/preview UI state until a
specific card-container extraction is planned.

## 6. Recommended Next Action

Recommended next action:

**Action 360 - Extract Live Day Trade Display Mapper**

Rationale:

- `ActivePositionCard` is not yet a clean presentational component because it
  owns local UI state, EOD acknowledgement writes, execution preview state, and
  execution orchestrator preview derivation.
- The safest next step is to extract pure display/derived-data mapping first,
  similar to the recommendation-card path.
- A mapper can isolate display props for the visible card and details modal
  without moving state, handlers, persistence, or execution behavior.

Initial mapper candidates:

- Current price/current R/unrealized PnL display values.
- Action/guidance label and tone values derived from existing
  `liveSellGuidance`.
- Metric rows for the visible card.
- Partial close and profit-fade display values.
- Source/reality badge descriptors if kept as display data.
- Details modal metric rows and audit summary display strings where pure.
- Risk flag arrays where already pure and input-driven.

Do not move:

- `useState`, `useEffect`, local modal state, or acknowledgement state.
- `writeEndOfDayAcknowledgement`.
- `runExecutionOrchestrator`.
- `onClosePosition` callback wiring.
- `ExecutionHandoffPreviewModal` state/rendering.
- `ClosePositionModal` or close persistence.

## 7. Risk Assessment

Accidental exit behavior changes:

- The close/prepare-sell button text and callback boundary must remain exactly
  as-is.
- Any future component must call only the parent callback and must not create or
  submit exit payloads.

Broken EOD safety display:

- EOD acknowledgement is local state plus local storage. Moving it too early
  could change whether the acknowledgement pill or button is shown.
- Keep EOD acknowledgement in the current card until a dedicated EOD panel plan
  exists.

Broken PnL/risk display:

- The card combines latest provider updates, fallback current R, calculated PnL,
  live sell guidance, and risk controls.
- Pure mapper tests or careful e2e comparison should protect these values when
  moved.

Lost e2e selectors/text:

- Preserve "Live Day Trade Details", "Prepare Sell Order", "Close Trade",
  "Acknowledge EOD Risk", "View handoff", "Partially Closed", and all card
  class names.

Prop drilling:

- Extracting the full card now would require many props for position, latest
  update, EOD status/date, market state, execution mode, risk controls,
  saving state, and callbacks.
- A display mapper reduces this before a component boundary moves.

Design/className drift:

- The card uses app-specific classes rather than generic Tailwind-only markup.
- Keep class names in place until a presentational card is extracted.

Persistence/execution safety:

- Supabase/localStorage persistence, broker exit confirmation, sell payloads,
  and execution handoff previews must stay exactly where they are until a
  separate behavior-preserving plan is written.

## 8. Verification

Action 359 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 360 Result

Action 360 added
`components/live-day-trades/live-day-trade-display-mapper.ts`.

Mapper extraction:

- Added `buildLiveDayTradeDisplayProps(...)` for pure card display derivation.
- Moved live card action class-name mapping, action pill class-name mapping,
  guidance card class-name mapping, visible card metric rows, aria label,
  guidance fallback strings, close button label/tone, partial-close display
  copy, profit-fade display copy, updated-at display text, and live trade
  reality badges.
- Kept the mapper hook-free, state-free, browser-free, Supabase-free, and
  localStorage-free.

Stayed in `ActivePositionCard` / `app/trade-app.tsx`:

- `useState` for details modal, execution preview, and EOD acknowledgement.
- `readEndOfDayAcknowledgement` and `writeEndOfDayAcknowledgement`.
- `buildLiveSellGuidance(...)`.
- `runExecutionOrchestrator(...)` and execution preview wiring.
- `onClosePosition(position)` close/sell callback.
- `LiveTradeDetailsModal`, `ExecutionHandoffPreviewModal`, and
  `ClosePositionModal` behavior.
- Parent-owned live data construction, PnL/risk calculations, EOD safety,
  target/stop monitoring, persistence, Supabase/localStorage behavior, and
  execution/exit handoff behavior.

Behavior preservation:

- Existing Live Day Trades text, button labels, class names, card ordering, and
  details/preview behavior were preserved.
- No close/sell/exit, EOD acknowledgement, persistence, Avanza/browser,
  execution, or trade mutation behavior moved.

Next recommended action:

**Action 361 - Reassess ActivePositionCard After Display Mapper Extraction**

## 10. Action 361 Result

Action 361 added
`docs/active-position-card-post-display-mapper-reassessment.md`.

Reassessment result:

- Confirmed `ActivePositionCard` is clearer after the display mapper extraction
  but is still not a safe full-card extraction target.
- Remaining behavior in `ActivePositionCard` includes local details modal
  state, execution preview state, EOD acknowledgement state/persistence,
  `onClosePosition(position)` wiring, and execution preview orchestration.
- Confirmed `LiveTradeDetailsModal` still contains a small EOD manual review
  display section and larger audit/risk/details display sections.
- Confirmed `ClosePositionModal` remains behavior-heavy and should stay
  parent-owned.

Next recommended action:

**Action 362 - Extract Live Day Trade EOD Safety Panel**

## 11. Action 362 Result

Action 362 added `components/live-day-trades/LiveDayTradeEodSafetyPanel.tsx`.

Result:

- Extracted only the EOD manual review panel rendering from
  `LiveTradeDetailsModal`.
- `ActivePositionCard` still owns EOD acknowledgement state and local
  acknowledgement persistence.
- The new component receives already-computed label, tone, message,
  acknowledged state, and callback props.
- No EOD calculation, close/sell/exit behavior, execution preview wiring,
  Supabase/localStorage behavior, or trade mutation behavior moved.

Next recommended action:

**Action 363 - Reassess ActivePositionCard After EOD Panel Extraction**

## 12. Action 363 Result

Action 363 added
`docs/active-position-card-post-eod-panel-reassessment.md`.

Result:

- Reassessed `ActivePositionCard` after the EOD safety panel extraction.
- Confirmed `LiveDayTradeEodSafetyPanel` is presentational and acknowledgement
  persistence remains in the card.
- Confirmed `LiveExecutionStatusSurface` is now the smallest safe next
  presentational extraction target.
- Confirmed `LiveTradeDetailsModal`, `ClosePositionModal`, and the full card
  boundary remain larger/higher-risk targets.

Next recommended action:

**Action 364 - Extract LiveExecutionStatusSurface Presentational Component**

## 13. Action 364 Result

Action 364 added `components/live-day-trades/LiveExecutionStatusSurface.tsx`.

Result:

- Extracted the live execution status surface from `app/trade-app.tsx`.
- Preserved status text, mode badge, next-action copy, final-submit suffix, and
  "View handoff" button behavior.
- Kept orchestrator calls, preview state, handoff modal wiring, close/sell
  behavior, EOD acknowledgement persistence, and persistence behavior in the
  existing callers.

Next recommended action:

**Action 365 - Reassess ActivePositionCard After Execution Status Surface Extraction**

## 9. Action 365 Result

Action 365 added
`docs/active-position-card-post-execution-status-surface-reassessment.md`.

Result:

- Reassessed the Live Day Trades card after the execution status surface was
  extracted.
- Confirmed `ActivePositionCard` still owns local UI state, EOD acknowledgement
  persistence, close/sell callback wiring, execution orchestrator calls, and
  handoff preview modal wiring.
- Confirmed `LiveTradeDetailsModal` remains broad and `ClosePositionModal`
  remains behavior-heavy.
- Recommended the next runtime refactor extract only the visible live-card
  body/header/actions as a presentational component.

Next recommended action:

**Action 366 - Extract Live Day Trade Card Body Presentational Component**

## 10. Action 366 Result

Action 366 added `components/live-day-trades/LiveDayTradeCardBody.tsx`.

Result:

- Extracted the visible live day trade card body/header/actions shell.
- Kept `ActivePositionCard` as the owner of local state, EOD acknowledgement
  persistence, close/sell callback wiring, execution orchestrator calls,
  details modal state, and handoff preview modal wiring.
- No `ClosePositionModal`, `LiveTradeDetailsModal`, close/sell behavior,
  persistence, or trade mutation logic moved.

Next recommended action:

**Action 367 - Reassess ActivePositionCard After Card Body Extraction**

## 11. Action 367 Result

Action 367 added
`docs/active-position-card-post-card-body-reassessment.md`.

Result:

- Reassessed the Live Day Trades card after `LiveDayTradeCardBody` extraction.
- Confirmed `ActivePositionCard` remains the owner of local state,
  acknowledgement persistence, close callback wiring, execution preview wiring,
  and slot assembly.
- Confirmed `LiveTradeDetailsModal` is now the safest higher-payoff extraction
  target before the full card boundary.

Next recommended action:

**Action 368 - Extract LiveTradeDetailsModal Presentational Component**

## 12. Action 368 Result

Action 368 added `components/live-day-trades/LiveTradeDetailsModal.tsx`.

Result:

- Extracted the live trade details modal into a presentational component.
- Kept `ActivePositionCard` responsible for modal open state, EOD
  acknowledgement persistence, audit data construction, close callback wiring,
  orchestrator calls, execution preview state, and handoff preview wiring.
- `ClosePositionModal` remains inline and behavior-heavy.

Next recommended action:

**Action 369 - Reassess ActivePositionCard After Details Modal Extraction**

## 13. Action 369 Result

Action 369 added
`docs/active-position-card-post-details-modal-reassessment.md`.

Result:

- Reassessed the Live Day Trades area after details modal extraction.
- Confirmed the remaining Live Day Trades runtime targets are either
  behavior-heavy (`ClosePositionModal`) or lower-payoff glue
  (`ActivePositionCard` boundary).
- Recommended pausing Live Day Trades and planning History tab extraction.

Next recommended action:

**Action 370 - Create History Tab Extraction Plan**
