# Live Day Trades Tab Extraction Plan

## 1. Purpose

Plan a safe extraction of the Live Day Trades tab after pausing the
Recommendations extraction. The goal is to reduce `app/trade-app.tsx`
complexity while preserving all live trade behavior, manual close/sell flows,
execution handoff behavior, Supabase/localStorage persistence, and current UI
copy.

This plan is documentation-only. No runtime code changes are included in Action
357.

## 2. Current Live Day Trades Tab Inventory

Current file size:

- `app/trade-app.tsx`: approximately 40,924 lines.

Primary Live Day Trades render location:

- The `activeTab === "Live Day Trades"` section starts around the main tab
  render area near line 14,760.
- The inline tab section is roughly 120 lines, not counting the card and modal
  components it renders.

Major UI sections currently inline in the tab:

- `TradePrimaryStatusbar`
  - refreshes `market_status` and `live_trades`
  - shows live trade/market refresh errors
- `ExecutionSandboxFixturePanel`
  - dev-only execution fixture panel
- Loading state
  - `Loading live day trades`
- Empty state
  - `No live day trades`
  - market-open dependent copy
- Live trade grid
  - primary grid for take-profit-prioritized positions
  - optional divider and continued grid for remaining positions

Live trade card structure:

- `ActivePositionCard` is currently local in `app/trade-app.tsx` around the
  later component section.
- It computes current price, current R, unrealized PnL, stale status, warnings,
  urgency, live sell guidance, partial-close state, EOD acknowledgement state,
  execution orchestration preview state, source badges, and live execution
  status.
- It renders:
  - `CompanyIdentity`
  - data-mode badges
  - partial-close badge
  - live action pill
  - `LiveMetricGrid`
  - guidance copy
  - optional `LiveExecutionStatusSurface`
  - close/prepare sell button
  - `LiveTradeDetailsModal`
  - optional `ExecutionHandoffPreviewModal`

Open position display:

- The card displays ticker/company, setup status, current price, unrealized PnL,
  current R, shares, entry, stop, and target.
- Sorting and grouping are parent-owned through `livePositionItems`,
  `takeProfitLivePositionItems`, and `otherLivePositionItems`.
- Positions with take-profit actions are shown first; other positions appear
  under a continued grid.

Target/stop/current price/PnL/risk display:

- Current price and unrealized values are derived from
  `latestPositionUpdates[position.id]`.
- PnL and R are calculated through `calculateUnrealizedPnl(...)` and
  `calculateCurrentR(...)`.
- Risk-control state is evaluated in the parent before passing to
  `ActivePositionCard`.
- `LiveTradeDetailsModal` adds deeper plan/risk display, including position
  value, max loss, risk/share, realized exits, time in trade, live risk
  controls, and action reasons.

EOD safety display:

- Parent computes `marketCloseWarning` and
  `eodSafetyStatusesByPositionId`.
- `ActivePositionCard` owns local `eodRiskAcknowledged` state using
  `readEndOfDayAcknowledgement(...)` and `writeEndOfDayAcknowledgement(...)`.
- `LiveTradeDetailsModal` shows EOD manual review requirements and an
  `Acknowledge EOD Risk` button.

Sell/close/exit action wiring:

- The card button calls parent `openClosePositionModal(position)`.
- The full close/sell workflow lives in `ClosePositionModal`.
- `ClosePositionModal` is large and behavior-heavy:
  - form state
  - sell execution payload generation
  - hard-stop contract generation
  - sell agent handoff command generation
  - sell form mapping preview
  - broker exit capture spec
  - Ture exit autofill contract
  - broker exit confirmation and validation
  - partial close handling inputs
  - mock/demo sell fill import helpers
  - clipboard/copy helpers
  - audit logging effects
  - final close submit button

Execution/exit handoff dependencies:

- `ActivePositionCard` can build live execution orchestrator results for
  eligible long non-demo/non-mock positions and open `ExecutionHandoffPreviewModal`.
- `ClosePositionModal` builds and logs sell/exit handoff artifacts, but does not
  submit broker orders.
- Both areas are behavior-sensitive and should not move in the first tab-shell
  extraction.

localStorage/Supabase/app-wide dependencies:

- Live trade state comes from `activePositions`, `closedPositions`,
  `latestPositionUpdates`, demo storage, Supabase rows, and refresh islands.
- EOD acknowledgement uses localStorage helpers.
- Close/partial-close behavior writes demo localStorage or Supabase through
  parent handlers.
- Trade management/audit events are read and logged from local storage-like
  helpers.

Expanded/modal/detail sections:

- `ActivePositionCard` owns `isDetailsOpen` and renders
  `LiveTradeDetailsModal`.
- `ActivePositionCard` owns `isExecutionPreviewOpen` and renders
  `ExecutionHandoffPreviewModal`.
- Parent owns selected close modal state through `selectedPosition` and renders
  `ClosePositionModal` elsewhere.

State and handlers used by the tab:

- `activeTab`
- `activePositions`
- `latestPositionUpdates`
- `takeProfitLivePositionItems`
- `otherLivePositionItems`
- `marketStatus` / `topMarketStatus`
- `currentTime`
- `selectedExecutionMode`
- `riskControlsSettings`
- `dailyClosedPositions`
- `dailyRealizedPnl`
- `dailyRealizedR`
- `lastLossClosedAt`
- `isSaving`
- `isLoading`
- `isUpdatingPositions`
- `openClosePositionModal`
- `refreshIslands`
- `islandRefreshState`

## 3. Recommended Component Boundaries

Recommended first-pass boundaries:

- `LiveDayTradesTab`
  - Presentational tab shell for statusbar slot, fixture slot, loading/empty
    states, primary grid, optional divider, and continued grid.
  - Should not own live trade data, sorting, risk evaluation, refresh handlers,
    or close handlers.

- `LiveDayTradeCard`
  - Future extraction of current `ActivePositionCard`.
  - Should be considered after the shell because it owns local details/EOD/handoff
    state and does substantial derived-data work.

- `LiveDayTradeCardHeader`
  - Potential later subcomponent for identity, badges, partial-close badge, and
    action pill.

- `LiveDayTradeMetrics`
  - Potential later subcomponent around `LiveMetricGrid` usage.

- `LiveDayTradeActions`
  - Potential later subcomponent for `Prepare Sell Order` / `Close Trade`
    button rendering.

- `LiveDayTradeRiskPanel`
  - Potential later extraction from details modal risk-control/EOD/readback
    sections.

- `LiveDayTradeEodSafetyPanel`
  - Potential later extraction for EOD manual review and acknowledgement display.

- `LiveDayTradeDetailsModal`
  - Already a local component, but still in `app/trade-app.tsx`.
  - It can become an extraction target after the card boundary is clearer.

- `LiveDayTradeEmptyState`
  - Low-risk if it naturally falls out of `LiveDayTradesTab`.

Components that should not be moved first:

- `ClosePositionModal`
  - Too behavior-heavy for a first Live Day Trades extraction.
  - It owns many effects, refs, payload builders, copy helpers, demo/mock import
    helpers, and submit wiring.
- `ExecutionHandoffPreviewModal`
  - Already decomposed separately; keep usage unchanged.

## 4. What Should Remain in trade-app.tsx Initially

Keep parent-owned:

- live position/trade data construction,
- `livePositionItems` sorting and grouping,
- take-profit vs continued grid split,
- app-wide monitoring and refresh state,
- latest position update state,
- EOD safety status computation,
- risk-control evaluation inputs,
- sell/close/exit handler implementations,
- `openClosePositionModal(...)`,
- `submitClosePosition(...)`,
- selected close modal state,
- execution handoff creation and orchestration mode,
- Supabase/localStorage/demo persistence behavior,
- cross-tab state,
- History/statistics updates after close,
- `ClosePositionModal` behavior.

The first extraction should only move rendering composition, not the live trade
state model.

## 5. First Extraction Target

Recommended first runtime refactor:

**Action 358 - Extract Live Day Trades Tab Shell**

Why this is safest:

- The current tab shell is mostly layout and conditional rendering.
- It can accept already-rendered `ActivePositionCard` nodes or a simple
  `children`/`primaryItems`/`secondaryItems` shape.
- Parent can keep all live trade data construction, grouping, risk evaluation,
  refresh handlers, close handlers, and statusbar construction.
- It mirrors the successful `RecommendationsTab` extraction pattern.

What Action 358 should avoid:

- Do not extract `ActivePositionCard` yet.
- Do not extract `LiveTradeDetailsModal` yet.
- Do not extract `ClosePositionModal`.
- Do not move EOD acknowledgement state.
- Do not move execution orchestrator calls.
- Do not move sell/close persistence.

## 6. Risk Assessment

Sell/exit behavior coupling:

- `ClosePositionModal` is tightly coupled to sell payload generation,
  confirmation validation, demo/mock imports, audit logging, partial close
  handling, and final close submission.
- Moving it prematurely risks behavior changes.

Live monitoring/EOD safety coupling:

- EOD status is computed in the parent but acknowledged locally in the card.
- First extraction should leave this untouched.

Current price/PnL behavior:

- Current price, unrealized PnL, and R are derived from live updates.
- Parent should continue to select and pass the same update data.

Selected/expanded card state:

- `ActivePositionCard` owns details and execution preview open state.
- Leave card state in place until the card boundary is explicitly planned.

E2E-visible text:

- Preserve `Loading live day trades`, `No live day trades`, `Close Trade`,
  `Prepare Sell Order`, `Live Day Trade Details`, `Acknowledge EOD Risk`, and
  all close/sell modal copy.

Card design/className preservation:

- Keep `trade-live-section`, `trade-live-grid`, `trade-live-divider`,
  `trade-live-card`, and related classes unchanged.

Prop drilling:

- Tab shell extraction should avoid a massive prop list by accepting rendered
  slots/nodes for statusbar, fixture panel, primary grid items, and continued
  grid items.
- Card extraction later will need more explicit props and should be reassessed.

Persistence/localStorage/Supabase risk:

- Keep demo/Supabase close behavior and EOD acknowledgement helpers out of the
  tab shell.

Execution handoff/exit handoff safety:

- Keep live execution orchestrator calls, `ExecutionHandoffPreviewModal`, and
  sell/exit handoff artifact generation untouched in the first extraction.

## 7. Proposed Implementation Sequence

1. Action 358: Extract Live Day Trades tab shell.
   - Create `components/live-day-trades/LiveDayTradesTab.tsx`.
   - Move only shell/layout/loading/empty/grid composition.
   - Parent passes statusbar, fixture panel, and rendered card nodes.

2. Action 359: Reassess Live Day Trade card after shell extraction.
   - Inspect `ActivePositionCard` with the tab shell removed.
   - Decide whether to extract the full card or display mappers first.

3. Action 360: Extract Live Day Trade display mapper.
   - Move only pure display/derived-data mapping out of `ActivePositionCard`.
   - Keep card-local state, EOD acknowledgement, execution-preview wiring, and
     close persistence in place.

4. Action 361: Reassess after display mapper extraction.
   - Decide whether the full card boundary, details modal, or risk/EOD panels
     should move next.

5. Action 362: Extract Live Day Trade card or details/risk/EOD subcomponents
   if safe.
   - Focus on presentational subsections.
   - Keep EOD acknowledgement and execution behavior stable.

6. Action 363: Reassess and decide whether to pause Live Day Trades.
   - Likely next domains after Live Day Trades are History/Closed Trades or
     close/sell modal planning.

## 8. Verification Expectations for Future Runtime Refactors

Future runtime refactors should run:

- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`
- `git diff --check`
- `npm run test:e2e`

If Playwright cannot bind its local server inside the sandbox, rerun e2e with
the scoped escalation needed for the local web server, as in recent actions.

## 9. Recommended Next Action

Recommended next action:

**Action 358 - Extract Live Day Trades Tab Shell**

Action 358 should be a no-behavior-change presentational shell extraction. It
should not move `ActivePositionCard`, `LiveTradeDetailsModal`,
`ClosePositionModal`, sell/exit handlers, EOD acknowledgement, execution
orchestrator calls, Supabase/localStorage behavior, or close-trade persistence.

## 10. Action 358 Result

Action 358 added `components/live-day-trades/LiveDayTradesTab.tsx`.

Extraction result:

- Extracted the Live Day Trades tab shell/layout into a presentational
  component.
- The shell owns only the section wrapper, statusbar placement, fixture panel
  placement, loading/empty states, main grid, continued grid, and divider.
- `app/trade-app.tsx` still builds and passes rendered `ActivePositionCard`
  nodes.
- Live position data construction, sorting/grouping, current price/PnL/risk
  calculation, EOD safety logic, target/stop monitoring, close/sell handlers,
  execution handoff creation, persistence, Supabase/localStorage behavior, and
  selected trade state remain parent-owned.

Behavior preservation:

- No sell/close/exit logic moved.
- No monitoring, EOD safety, target/stop, persistence, Avanza/browser, or
  execution behavior changed.
- Existing loading/empty/card ordering text and grid classes were preserved.

Next recommended action:

**Action 359 - Reassess Live Day Trades Tab After Shell Extraction**

## 11. Action 359 Result

Action 359 added
`docs/live-day-trades-tab-post-shell-reassessment.md`.

Reassessment result:

- Confirmed the tab shell extraction is complete and behavior-preserving.
- Confirmed live card rendering still lives in local `ActivePositionCard` in
  `app/trade-app.tsx`.
- Identified that `ActivePositionCard` is not purely presentational yet because
  it owns details modal state, execution preview state, EOD acknowledgement
  state/persistence, live sell guidance derivation, and execution orchestrator
  preview derivation.
- Confirmed `ClosePositionModal` remains much more behavior-heavy and should
  stay parent-owned for now.

Next recommended action:

**Action 360 - Extract Live Day Trade Display Mapper**

## 12. Action 360 Result

Action 360 added
`components/live-day-trades/live-day-trade-display-mapper.ts`.

Result:

- Extracted only pure display/prop mapping from `ActivePositionCard`.
- Moved card metric row construction, live action/guidance card class names,
  close button label/tone, partial-close/profit-fade copy, aria label,
  updated-at display, fallback display strings, and live trade reality badges.
- `ActivePositionCard` remains in `app/trade-app.tsx`.
- Card-local details state, execution preview state, EOD acknowledgement
  state/persistence, sell/close callback wiring, and execution preview wiring
  remain in place.

Next recommended action:

**Action 361 - Reassess ActivePositionCard After Display Mapper Extraction**

## 13. Action 361 Result

Action 361 added
`docs/active-position-card-post-display-mapper-reassessment.md`.

Result:

- Reassessed the local `ActivePositionCard` after display mapper extraction.
- Confirmed a full card extraction is still higher risk because the card owns
  local details state, execution preview state, EOD acknowledgement
  state/persistence, sell/close callback wiring, and execution preview
  orchestration.
- Identified the EOD manual review block inside `LiveTradeDetailsModal` as the
  safest next presentational extraction.

Next recommended action:

**Action 362 - Extract Live Day Trade EOD Safety Panel**

## 14. Action 362 Result

Action 362 added `components/live-day-trades/LiveDayTradeEodSafetyPanel.tsx`.

Result:

- Extracted the EOD manual review text card from `LiveTradeDetailsModal`.
- Preserved the visible copy, acknowledgement button label, conditional
  rendering, and `trade-live-details-ack-button` class.
- Kept EOD acknowledgement state/persistence, EOD calculation, close/sell
  handlers, execution preview wiring, persistence, Supabase/localStorage
  behavior, and trade mutation behavior outside the new component.

Next recommended action:

**Action 363 - Reassess ActivePositionCard After EOD Panel Extraction**

## 15. Action 363 Result

Action 363 added
`docs/active-position-card-post-eod-panel-reassessment.md`.

Result:

- Reassessed remaining Live Day Trades card responsibilities after
  `LiveDayTradeEodSafetyPanel` extraction.
- Confirmed `ActivePositionCard` still owns local details state, execution
  preview state, EOD acknowledgement state/persistence, close/sell callback
  wiring, and execution preview orchestration.
- Recommended extracting `LiveExecutionStatusSurface` next as the smallest
  presentational component still inline in the live card path.

Next recommended action:

**Action 364 - Extract LiveExecutionStatusSurface Presentational Component**

## 16. Action 364 Result

Action 364 added `components/live-day-trades/LiveExecutionStatusSurface.tsx`.

Result:

- Extracted only the live execution status surface rendering.
- Kept `runExecutionOrchestrator(...)`, execution preview state, selected
  intent/result wiring, `ExecutionHandoffPreviewModal`, close/sell handlers,
  EOD acknowledgement persistence, Supabase/localStorage behavior, and trade
  mutation behavior in `app/trade-app.tsx`.

Next recommended action:

**Action 365 - Reassess ActivePositionCard After Execution Status Surface Extraction**

## 17. Action 365 Result

Action 365 added
`docs/active-position-card-post-execution-status-surface-reassessment.md`.

Result:

- Confirmed `LiveExecutionStatusSurface` is extracted and `ActivePositionCard`
  still owns the behavior around it.
- Confirmed full `ActivePositionCard`, `LiveTradeDetailsModal`, and
  `ClosePositionModal` extraction should wait.
- Identified the visible live-card body/header/actions rendering as the next
  safe extraction target because display props are already mostly derived by
  `live-day-trade-display-mapper.ts`.

Next recommended action:

**Action 366 - Extract Live Day Trade Card Body Presentational Component**

## 18. Action 366 Result

Action 366 added `components/live-day-trades/LiveDayTradeCardBody.tsx`.

Result:

- Extracted the live card `<article>` wrapper, header/body/guidance/footer
  layout, action pill, partial-closed badge, status-surface slot, close-button
  row, and modal slots into a presentational component.
- `ActivePositionCard` still owns state, EOD acknowledgement persistence,
  orchestrator calls, execution preview state, details modal rendering, close
  callback wiring, and handoff preview modal wiring.
- Existing helper-heavy render pieces such as `CompanyIdentity`,
  `DataModePillRow`, and `LiveMetricGrid` remain in `app/trade-app.tsx` and are
  passed as rendered slots.

Next recommended action:

**Action 367 - Reassess ActivePositionCard After Card Body Extraction**

## 19. Action 367 Result

Action 367 added
`docs/active-position-card-post-card-body-reassessment.md`.

Result:

- Confirmed `LiveDayTradeCardBody` extracted the visible card shell and
  `ActivePositionCard` now mostly owns state/orchestration and slots.
- Confirmed the full `ActivePositionCard` boundary should wait until the
  details modal surface is extracted.
- Confirmed `ClosePositionModal` remains too stateful and behavior-heavy for a
  presentational extraction.
- Recommended extracting `LiveTradeDetailsModal` next.

Next recommended action:

**Action 368 - Extract LiveTradeDetailsModal Presentational Component**

## 20. Action 368 Result

Action 368 added `components/live-day-trades/LiveTradeDetailsModal.tsx`.

Result:

- Extracted the live trade details modal rendering and moved
  details-modal-only render helpers with it.
- Kept `readTradeManagementEvents()` and audit display derivation in
  `ActivePositionCard` so localStorage/audit behavior did not move to the new
  component.
- Kept `ClosePositionModal`, close/sell/exit behavior, EOD acknowledgement
  persistence, orchestrator calls, execution preview state, and handoff modal
  wiring in `app/trade-app.tsx`.

Next recommended action:

**Action 369 - Reassess ActivePositionCard After Details Modal Extraction**

## 21. Action 369 Result

Action 369 added
`docs/active-position-card-post-details-modal-reassessment.md`.

Result:

- Confirmed Live Day Trades extraction is complete enough to pause.
- Confirmed `ClosePositionModal` remains a workflow container and should not be
  extracted as a presentational component without a dedicated plan.
- Confirmed the remaining `ActivePositionCard` boundary is technically possible
  but lower payoff now that card body and details modal are extracted.

Next recommended action:

**Action 370 - Create History Tab Extraction Plan**

## 22. Action 370 Result

Action 370 added `docs/history-tab-extraction-plan.md`.

Result:

- Confirmed Live Day Trades extraction is paused for now.
- Inventoried the History tab, closed trade card, recommendation history,
  discarded setup, statistics-adjacent, filter/sort, and persistence surfaces.
- Recommended extracting only the History tab shell first, following the
  existing Recommendations and Live Day Trades shell patterns.

Next recommended action:

**Action 371 - Extract History Tab Shell**

## 23. Action 371 Result

Action 371 added `components/history/HistoryTab.tsx`.

Result:

- Extracted the History tab shell/layout as a presentational component.
- Kept History filters, refresh, closed trade cards, PnL/result display,
  plan-adherence/statistics calculations, audit/timeline derivation,
  persistence, and app-wide state in `app/trade-app.tsx`.

Next recommended action:

**Action 372 - Reassess History Tab After Shell Extraction**

## 24. Action 372 Result

Action 372 added `docs/history-tab-post-shell-reassessment.md`.

Result:

- Confirmed History shell extraction is complete.
- Confirmed `ClosedPositionCard` remains behavior-adjacent because it owns
  local details state and derives audit/timeline, replay, execution quality,
  handoff quality, improvement suggestions, outcome explanation, and
  plan-vs-actual review displays.
- Recommended extracting a pure closed trade display mapper next.

Next recommended action:

**Action 373 - Extract Closed Trade Display Mapper**

## 25. Action 388 Result

Action 388 added `docs/trade-app-post-major-ui-extraction-reassessment.md`.

Result:

- Confirmed Live Day Trades extraction is complete enough to pause.
- Remaining live trade responsibilities in `app/trade-app.tsx` are
  behavior-coupled: monitoring, EOD acknowledgement persistence, close/sell
  handlers, execution preview wiring, local card state, and trade mutation
  flows.
- Recommended app-wide state/effects extraction planning next.

Next recommended action:

**Action 389 - Create App State/Effects Extraction Plan**

## 26. Action 389 Result

Action 389 added `docs/app-state-effects-extraction-plan.md`.

Result:

- Planned app-wide state/effects extraction after pausing Live Day Trades UI
  work.
- Confirmed live trade domain state remains too coupled for early hook
  extraction because it includes active position monitoring, latest updates,
  auto-refresh, notification effects, EOD safety, close/sell handlers,
  persistence, and execution preview wiring.
- Recommended starting with a navigation/tab state boundary reassessment.

Next recommended action:

**Action 390 - Reassess Navigation/Tab State Hook Boundary**
