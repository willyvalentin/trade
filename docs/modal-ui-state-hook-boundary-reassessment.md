# Modal UI State Hook Boundary Reassessment

## 1. Purpose

Reassess modal UI state as the next possible state hook boundary after the
navigation and Statistics range hooks.

Modal state is more sensitive than prior tiny hooks because modals in
`app/trade-app.tsx` connect to selected entities, validation, ADD TRADE,
close/sell flows, execution handoff previews, broker capture, localStorage,
Supabase, and e2e-visible dialog behavior.

## 2. Current Modal State Inventory

App-owned ADD TRADE modal state:

- variables:
  - `selectedRecommendation`
  - `entryPrice`
  - `positionSize`
  - `validatingRecommendationId`
  - `selectedTradeValidationStatus`
  - `selectedTradeValidation`
  - `selectedTradeValidationMessage`
- handlers:
  - `openTradeModal`
  - `closeTradeModal`
  - `submitTrade`
- rendering:
  - `selectedRecommendation && <TradeModal ... />`
- connected behavior:
  - recommendation freshness checks.
  - ADD TRADE validation API call.
  - position sizing.
  - risk controls evaluation.
  - demo trade flow.
  - Supabase position insert/update.
  - broker fill metadata capture.
  - selected tab switching after success.

App-owned close-position modal state:

- variables:
  - `selectedPosition`
  - `exitPrice`
  - `exitNotes`
- handlers:
  - `openClosePositionModal`
  - `closeClosePositionModal`
  - `submitClosePosition`
- rendering:
  - `selectedPosition && <ClosePositionModal ... />`
- connected behavior:
  - broker exit confirmation validation.
  - partial exit handling.
  - full close handling.
  - demo close flow.
  - Supabase position update/close.
  - local latest-position update cleanup.
  - selected tab switching to History.

Recommendation details/discard modal state:

- ownership:
  - local to `components/recommendations/RecommendationCardContainer.tsx`.
- variables:
  - `isDetailsOpen`
  - `isDiscardConfirmOpen`
  - `isConfirmingDiscard`
- classification:
  - already local component-owned.
  - no app-wide hook extraction needed now.
- connected behavior:
  - discard confirmation still calls parent `onIgnore`, which owns persistence.

Live trade details and execution preview modal state:

- ownership:
  - local to `ActivePositionCard` in `app/trade-app.tsx`.
- variables:
  - `isDetailsOpen`
  - `isExecutionPreviewOpen`
  - `eodRiskAcknowledged`
- classification:
  - behavior-coupled and unsafe for a generic modal hook.
- connected behavior:
  - EOD acknowledgement localStorage writes.
  - live sell guidance.
  - risk controls.
  - execution orchestrator result.
  - `ExecutionHandoffPreviewModal` wiring.
  - audit timeline/replay derivation.

Closed trade details modal state:

- ownership:
  - local to `ClosedPositionCard` in `app/trade-app.tsx`.
- variables:
  - `isDetailsOpen`
- classification:
  - local UI state, but surrounded by audit/timeline, plan-vs-actual, PnL, and
    outcome explanation derivation.
  - not a first modal hook candidate.

Execution handoff preview modal state:

- ownership:
  - local to `ExecutionHandoffPreviewModal`.
- variables include:
  - lifecycle/capture/progress state.
  - preparation/agent runner messages.
  - broker capture stub fields.
  - agent progress timeline.
- classification:
  - execution/safety-coupled and unsafe for app-wide modal hook extraction.

Close/sell modal internal state:

- ownership:
  - local to `ClosePositionModal`.
- variables include:
  - copy statuses.
  - sell/exit status.
  - actual sold shares.
  - broker reference/cost fields.
  - manual sell confirmation flags.
  - mock broker exit import state.
  - payload timer and audit refs.
- classification:
  - behavior-heavy and unsafe.
- connected behavior:
  - broker exit confirmation validation.
  - copy handlers.
  - mock fill imports.
  - Avanza field verification logs.
  - sell payload and completion policy audit logs.

Execution sandbox fixture preview modal state:

- ownership:
  - local to `ExecutionSandboxFixtureCard`.
- variable:
  - `isExecutionPreviewOpen`
- classification:
  - local UI-only boolean, but fixture-specific and not app-wide.
  - low value to extract now.

Settings/diagnostics modal state:

- no obvious app-owned generic settings/diagnostics modal state was identified
  in `TradeApp`.

## 3. Coupling Analysis

ADD TRADE / selected TradeModal:

- `selectedRecommendation` is both modal-open state and selected domain entity.
- opening the modal performs validation, risk/freshness checks, demo handling,
  and form initialization.
- closing the modal resets validation state.
- submitting the modal mutates app state, Supabase/demo storage, broker metadata,
  and active tab.
- unsafe for generic modal hook extraction now.

Discard confirmation:

- already localized in `RecommendationCardContainer`.
- persistence remains parent-owned through `onIgnore`.
- no action needed.

Details modals:

- recommendation details/discard state is already component-local.
- live details and closed details are local, but tied to heavy derived audit,
  risk, EOD, and plan review data.
- generic extraction would add prop drilling without reducing app-wide risk.

Close/sell modals:

- app-level close modal is selected-entity state plus form state plus mutation
  path.
- `ClosePositionModal` internal state is sell/exit workflow state, not generic
  modal state.
- unsafe to move before a close/sell boundary plan.

Execution handoff preview modal:

- local preview-open booleans exist in fixture/live cards.
- the preview modal itself owns safety-sensitive lifecycle/capture/agent state.
- do not move into generic modal state.

Broker/result preview state:

- broker preview and result/capture state is embedded in `TradeModal`,
  `ExecutionHandoffPreviewModal`, and `ClosePositionModal`.
- these are execution/persistence-adjacent and should remain local/parent-owned.

localStorage/Supabase coupling:

- app-owned modal state directly gates Supabase writes and demo/localStorage
  updates in add/close flows.
- local modal state in live cards can write EOD acknowledgements.
- close/sell modal internals read mock broker fill localStorage and generate
  audit events.

E2E-visible modal behavior:

- modal open/close, Escape/backdrop behavior, validation copy, disabled states,
  and ADD TRADE/close labels are e2e-visible.
- generic hook extraction has higher regression risk than prior tiny hooks.

## 4. Proposed Hook Boundaries

`useTradeAppModalState`

- not recommended yet.
- would likely group selected recommendation, selected position, form state, and
  validation state too broadly.
- risk: selected entity mismatch, stale closures, and hidden behavior movement.

`useTradeModalState`

- not recommended yet.
- selected recommendation state is coupled to ADD TRADE validation, risk
  controls, form defaults, demo flow, broker fill capture, Supabase writes, and
  tab switching.

`useClosePositionModalState`

- not recommended yet.
- selected position and close form state are coupled to partial/full close,
  broker exit confirmation, Supabase updates, demo state, and History switching.

`useExecutionPreviewModalState`

- not recommended yet.
- local booleans are small, but they are fixture/card-specific and sit next to
  orchestrator results and execution handoff state.

Recommendation:

- do not extract a modal hook in the next runtime action.
- modal state should first be split by domain and reassessed after a smaller
  non-modal UI-state hook boundary.

## 5. What Should Remain In trade-app.tsx

- selected recommendation state.
- selected position state.
- ADD TRADE open/close/submit logic.
- ADD TRADE validation state and API call.
- entry/position form state.
- close-position open/close/submit logic.
- exit price/notes state.
- discard persistence.
- Supabase/demo/localStorage trade mutations.
- execution handoff/orchestrator state.
- broker/result preview and capture state.
- selected entities tied to app-wide behavior.

## 6. Safe First Extraction Candidates

A. Generic UI-only modal open/close state if isolated:

- no app-owned generic candidate was found.
- recommendation details/discard state is already local.

B. Selected TradeModal open/close state only if no behavior coupling:

- not safe today.
- selected recommendation is coupled to validation, form defaults, risk
  evaluation, and submit behavior.

C. Execution preview modal open boolean only if fully isolated:

- not a good app-wide target.
- local booleans exist, but they are tied to orchestrator status and fixture/card
  context.

D. Defer modal hooks and move to another state boundary:

- recommended.
- the next boundary should reassess Recommendation UI-only state, especially
  filter-like state that does not own persistence or trade mutation behavior.

## 7. Risk Assessment

Selected entity mismatch risk:

- high for `selectedRecommendation` and `selectedPosition`.
- moving one without all related form/validation state could produce stale or
  mismatched modal data.

Stale closure risk:

- high around `openTradeModal`, `submitTrade`, `submitClosePosition`, and close
  handlers.

Modal open/close behavior risk:

- high because close guards depend on `isSaving` and reset validation/form
  state.

E2E modal behavior risk:

- high because dialogs, validation copy, button labels, disabled states, and
  close behavior are tested or user-visible.

Execution safety risk:

- high around execution preview modals, broker capture, Avanza bridge
  diagnostics, and close/sell flows.

Persistence/Supabase risk:

- high because modal submit paths write or update trade records and demo/local
  storage.

Prop drilling risk:

- high if a generic modal hook exposes many setters and selected entities
  without reducing behavior complexity.

## 8. Recommended Next Action

Recommended next action:

**Action 397 - Reassess Recommendation UI State Hook Boundary**

## Action 397 Result

Action 397 added
`docs/recommendation-ui-state-hook-boundary-reassessment.md`.

Result:

- Reassessed recommendation-related UI state after the modal hook boundary was
  deferred.
- Confirmed recommendation details/discard UI state is already local to
  `RecommendationCardContainer`.
- Confirmed remaining parent-owned Recommendation state is coupled to data
  construction, Recommendation history filters, ADD TRADE validation, selected
  TradeModal state, discard persistence, Supabase/localStorage behavior, or
  execution handoff entry points.
- Recommended History UI state as the next hook-boundary reassessment target.

Next recommended action:

**Action 398 - Reassess History UI State Hook Boundary**

## Action 398 Result

Action 398 added `docs/history-ui-state-hook-boundary-reassessment.md`.

Result:

- Confirmed History details-open state is already card-local.
- Confirmed History filter/sort state is not ready for runtime extraction
  because it feeds dashboard construction, visible card ordering, counts, and
  empty states.
- Recommended Live Day Trade UI state as the next hook-boundary reassessment.

Next recommended action:

**Action 399 - Reassess Live Day Trade UI State Hook Boundary**

Why:

- modal state is too coupled to extract safely now.
- Recommendation UI/filter-like state is the next plausible non-modal boundary.
- the next step should be documentation-only reassessment before moving any
  recommendation state.

## 9. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.
