# Live Day Trade UI State Hook Boundary Reassessment

## 1. Purpose

Reassess Live Day Trade UI state as a possible hook boundary after navigation,
Statistics range, modal UI, Recommendation UI, and History UI state
reassessments.

Live Day Trades has been decomposed into `LiveDayTradesTab`,
`LiveDayTradeCardBody`, `LiveExecutionStatusSurface`,
`LiveDayTradeEodSafetyPanel`, `LiveTradeDetailsModal`, and
`live-day-trade-display-mapper`, but `ActivePositionCard` and
`app/trade-app.tsx` still own local UI state, EOD acknowledgement persistence,
close/sell handlers, execution preview wiring, active position monitoring,
Supabase/localStorage behavior, and trade mutation flows.

## 2. Current Live Day Trade State Inventory

Parent-owned app/domain state:

- `activePositions`
- `latestPositionUpdates`
- `selectedPosition`
- `exitPrice`
- `exitNotes`
- `isUpdatingPositions`
- `lastAutoRefreshAt`
- `isDocumentVisible`
- `currentTime`
- `marketStatus`
- `riskControlsSettings`
- selected execution mode.

Parent-owned handlers/effects:

- `updatePositions`
- `openClosePositionModal`
- `closeClosePositionModal`
- `submitClosePosition`
- refresh/island handlers for `live_trades`, `stats_today`, and
  `history_statistics`.
- auto-refresh/document-visibility effects.

Card-local state in `ActivePositionCard`:

- `eodRiskAcknowledged`
- `isDetailsOpen`
- `isExecutionPreviewOpen`

Close/sell modal state:

- app-level selected close modal state:
  - `selectedPosition`
  - `exitPrice`
  - `exitNotes`
- `ClosePositionModal` internal state includes:
  - copy statuses.
  - broker exit status.
  - actual sold shares.
  - broker reference/cost fields.
  - manual sell confirmation flags.
  - mock broker exit import state.
  - generated payload refs.
  - payload timer state.

Extracted live components:

- `LiveDayTradesTab` owns no state.
- `LiveDayTradeCardBody` owns no state and receives rendered slots/callbacks.
- `LiveExecutionStatusSurface` owns no state and receives status/callback.
- `LiveDayTradeEodSafetyPanel` owns no state and receives acknowledgement
  state/callback.
- `LiveTradeDetailsModal` owns only Escape/backdrop/close rendering behavior and
  receives display data/callbacks.
- `live-day-trade-display-mapper` is pure display mapping.

Selected/active entities:

- `ActivePositionCard` receives a single active `position`.
- app-level close modal selected entity is `selectedPosition`.
- execution preview intent is derived from the active card's orchestrator
  result.

EOD acknowledgement state/persistence:

- `ActivePositionCard` initializes `eodRiskAcknowledged` from
  `readEndOfDayAcknowledgement(position.id, eodSafetyDate)`.
- `acknowledgeEndOfDayRisk()` writes through
  `writeEndOfDayAcknowledgement(position.id, eodSafetyDate, true)` and then
  updates local state.

Execution preview state:

- `ActivePositionCard` owns `isExecutionPreviewOpen`.
- orchestrator output is computed next to the active position and current price.
- `ExecutionHandoffPreviewModal` receives the orchestrator result/status and
  close callback.

Persistence/execution dependencies:

- live positions are loaded from Supabase/demo storage.
- latest update data is refreshed through app-owned island refreshes.
- close/sell flows mutate active and closed position state and persistence.
- execution preview wiring is read-only/preparation-only but safety-sensitive.

## 3. Coupling Analysis

Details modal state:

- `isDetailsOpen` is a small card-local boolean.
- it opens from the extracted card body and closes through
  `LiveTradeDetailsModal`.
- the modal receives broad derived data: risk controls, EOD safety, audit
  summary, live sell guidance, execution metadata, and full audit trail node.
- moving only this boolean to a hook would add indirection with little payoff.

Close modal state:

- app-level close modal state is selected-position plus form fields.
- `openClosePositionModal` initializes the selected position, resets exit form
  fields, and clears messages.
- `closeClosePositionModal` is guarded by `isSaving`.
- this state is not UI-only; it gates close/sell trade mutation flows.

Close/sell/exit behavior:

- `submitClosePosition` performs validation, demo/Supabase updates, partial/full
  close handling, latest-position cleanup, History switching, and audit event
  logging.
- `ClosePositionModal` internal state builds sell payloads, hard-stop reports,
  handoff commands, broker exit capture specs, and mock exit imports.
- unsafe for hook extraction.

EOD acknowledgement persistence:

- acknowledgement state is local to the card, but it reads and writes
  localStorage using position id and EOD date.
- moving it into a hook would be possible only as a dedicated persistence-aware
  hook, not as a generic UI-state hook.
- it should stay in `ActivePositionCard` until persistence boundaries are
  planned.

Execution preview/open state:

- `isExecutionPreviewOpen` is small, but it gates a safety-sensitive
  `ExecutionHandoffPreviewModal`.
- the visible status comes from `runExecutionOrchestrator(...)` and
  `buildExecutionUiStatusFromOrchestratorResult(...)`.
- orchestrator calls and preview modal wiring should remain in
  `ActivePositionCard`.

Orchestrator calls:

- orchestrator output depends on current price, target/stop, quantity,
  execution mode, demo/mock checks, and selected intent.
- no orchestrator state or result should move with a UI hook.

Active position monitoring:

- latest position updates, market status, current time, stale warnings, and
  current PnL/R calculations are app-owned and refresh-driven.
- these are domain state, not UI-only state.

localStorage/Supabase behavior:

- live trade data and close flows touch Supabase/demo/localStorage.
- EOD acknowledgement uses localStorage.
- persistence should be planned separately.

Trade mutation behavior:

- close/sell flows update active positions, closed positions, latest updates,
  messages, and tabs.
- no trade mutation flow should move with UI state.

## 4. Proposed Hook Boundaries

`useActivePositionCardUiState`

- not recommended now.
- if it owned only `isDetailsOpen` and `isExecutionPreviewOpen`, the payoff is
  low and the callbacks still sit beside execution preview and modal slots.
- if it also owned EOD acknowledgement, it would move localStorage persistence.
- if it owned close/sell state, it would cross into trade mutation behavior.

Potential later hook:

- `useEndOfDayAcknowledgementState` may be worth considering during a
  persistence-boundary phase.
- it should be documented separately because it reads/writes localStorage.

Recommendation:

- do not extract a Live Day Trade UI state hook in the next runtime action.
- Live Day Trade state has exhausted the low-risk UI-only hook candidates for
  now.

## 5. What Should Remain In trade-app.tsx / ActivePositionCard

- close/sell/exit handlers.
- selected close-position state.
- exit price and exit notes state.
- `ClosePositionModal` internal sell workflow state.
- EOD acknowledgement state and localStorage persistence.
- execution preview open state.
- `runExecutionOrchestrator(...)` and execution UI status adaptation.
- `ExecutionHandoffPreviewModal` wiring.
- active position monitoring and latest update state.
- current price/PnL/R/EOD calculations.
- Supabase/localStorage/demo data behavior.
- trade mutation behavior.

## 6. Safe First Extraction Candidates

A. Tiny card-local UI-only hook if isolated:

- not recommended.
- `isDetailsOpen` and `isExecutionPreviewOpen` are small, but their usage is
  tightly colocated with modal slots and execution preview wiring.
- `eodRiskAcknowledged` is not UI-only because it persists to localStorage.

B. Leave Live Day Trade state as-is and move to persistence boundary planning:

- recommended.
- navigation/range hooks are extracted, while modal, Recommendation, History,
  and Live Day Trade UI state boundaries are all too coupled or already local.
- persistence/Supabase/localStorage boundaries are now the next strategic
  planning target.

C. Leave Live Day Trade state as-is and reassess overall app state/effects phase:

- useful as a checkpoint after persistence planning.
- less concrete than a persistence boundary plan because the recent
  reassessments already narrowed the next risk-heavy domain.

## 7. Risk Assessment

Close/sell behavior risk:

- high because selected close state, broker exit confirmation, partial/full
  close handling, and persistence updates are intertwined.

Selected/active position mismatch risk:

- high if selected close-position state or execution preview state is separated
  from the active position and latest update data.

EOD acknowledgement persistence risk:

- high for a UI hook because the state reads/writes localStorage and depends on
  position id plus EOD date.

Execution preview safety risk:

- high because preview state gates `ExecutionHandoffPreviewModal`,
  orchestrator-selected intent, and prepare-only execution guidance.

Stale closure risk:

- high around close/sell callbacks, acknowledgement callbacks, orchestrator
  result, latest updates, and current market time.

Prop drilling risk:

- high for a broad hook because it would expose modal setters, selected
  position state, acknowledgement handlers, and execution preview callbacks.

E2E-visible behavior risk:

- high for card click/keyboard details open, EOD acknowledgement copy/button,
  `View handoff`, close button text, and close modal behavior.

Trade mutation risk:

- high if close/sell state or handlers move with a UI hook.

## 8. Recommended Next Action

Recommended next action:

**Action 400 - Create Persistence Boundary Plan**

## Action 400 Result

Action 400 added `docs/persistence-boundary-plan.md`.

Result:

- Inventoried localStorage, Supabase, demo/local fallback, audit/event,
  execution metadata, and trade mutation persistence surfaces.
- Classified persistence risk from low-risk key constants and UI preferences to
  high-risk trade mutations, Supabase writes, execution metadata, and audit
  records.
- Recommended localStorage key constants as the first persistence boundary to
  reassess before any runtime movement.

Next recommended action:

**Action 401 - Reassess localStorage Key Constants Boundary**

Why:

- the first app-state hook phase has extracted the only clearly safe tiny hooks.
- modal, Recommendation, History, and Live Day Trade UI state boundaries are not
  good runtime extraction targets right now.
- persistence/localStorage/Supabase behavior is the next major risk-heavy domain
  that needs documentation-only planning before any code movement.

## 9. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.
