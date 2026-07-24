# App State/Effects Extraction Plan

## 1. Purpose

Plan a safe app-wide state/effects extraction phase after the major UI
decomposition work.

Actions 317-388 extracted or paused the main presentational UI areas:
Execution Handoff Modal, Recommendations, Live Day Trades, History, and
Statistics/Dashboard. `app/trade-app.tsx` is still large because it owns the
state, effects, handlers, calculations, persistence, and execution wiring that
feed those components.

This plan identifies hook boundaries without moving hooks, state, effects, or
behavior yet.

## 2. Current State/Effects Inventory

Current approximate file size:

- `app/trade-app.tsx`: approximately 39,692 lines.

Major `useState` groups in `TradeApp`:

- Navigation and tabs:
  - `activeTab`.
- Core domain data:
  - `recommendations`, `userSettings`, `activePositions`, `closedPositions`.
- Statistics and History filters:
  - `selectedStatisticsRange`.
  - History outcome/demo/partial/sort filters.
  - recommendation history taken/outcome/confidence/window/sort filters.
- Live/readiness and local preference state:
  - live-test readiness mode.
  - paper session protocol state.
  - live market trial runbook state.
  - provider plan mode hint.
  - dev preview recommendation visibility.
- Selected modal/trade state:
  - selected recommendation and selected position.
  - add-trade form inputs and validation messages.
  - close-position form inputs.
- Refresh and status state:
  - document visibility, current time, loading/saving/updating flags,
    last auto-refresh timestamp, island refresh state, global message, and last
    demo action.
- Market/settings state:
  - scan logs, market regime, market status/error, broker cost model, risk
    controls settings, and selected execution mode.
- Recommendation diagnostics state:
  - stored snapshots, scan runs, batches, outcomes.
  - snapshot/scan-run/batch/outcome diagnostics.
  - outcome backfill, dedupe, evaluation run, evaluation diagnostics, and
    evaluation running flag.

Major refs:

- loaded-state guards for recommendations, paper protocol, runbook, provider
  plan mode, and dev preview preference.
- previous recommendation and position-update signatures for notification
  decisions.
- persisted recommendation snapshot/scan-run/batch/outcome identity caches.
- refresh orchestration refs: `dataRefreshInFlightRef`, `loadTradeDataRef`,
  `refreshCurrentSurfaceRef`, and `updatePositionsRef`.

Major `useEffect` groups:

- Initial boot effect:
  - reads local preferences/demo records/recommendation records.
  - starts the initial `loadTradeData` call.
- Browser preference listeners:
  - focus/storage listener for execution mode preference.
  - visibility listener for document visibility.
- Local preference persistence:
  - paper session protocol.
  - live market trial runbook.
  - provider plan mode hint.
  - dev-preview recommendation preference.
- Timers and refresh:
  - current-time interval.
  - live trades auto-refresh interval.
  - current-surface refresh interval.
  - window-focus refresh.
- Notification effects:
  - new recommendation sound.
  - live position update/action/urgency sound.
- Recommendation persistence effects:
  - current recommendation scan run persistence.
  - current recommendation batch persistence.
  - visible snapshot persistence.
  - visible outcome persistence.

Major `useMemo`/derived data groups:

- recommendation visibility, scan window, freshness, daily recommendations, and
  readback diagnostics.
- recommendation snapshot/batch/scan-run/outcome construction.
- recommendation history, linked trade history, and recommendation analytics.
- live trade monitoring, market-close/EOD status, risk controls, and execution
  readiness surfaces.
- History filtering/sorting, closed trade result display, plan-vs-actual review,
  audit timeline, replay, and improvement suggestions.
- Statistics inputs, PnL/R, win/loss, profit factor, plan adherence,
  recommendation analytics, charts, and dashboard body data.
- Market diagnostics, scanner/readiness summaries, hidden JSON readbacks, and
  QA surfaces.

Major handler groups:

- refresh/data handlers:
  - `loadTradeData`, `refreshIslands`, `refreshCurrentSurface`,
    `updatePositions`.
- recommendation handlers:
  - update/discard status, ADD TRADE modal open/close, validation, demo
    recommendation creation, demo cleanup.
- trade mutation handlers:
  - submit trade, close position, demo open/close flows, Supabase fallback paths.
- settings/runbook handlers:
  - paper-session mode/step/outcome/notes updates.
- recommendation persistence/diagnostic handlers:
  - persistence effects and outcome evaluation.
- execution/handoff handlers:
  - buy handoff modal lifecycle/capture/progress handlers inside
    `ExecutionHandoffPreviewModal`.
  - live execution preview wiring inside `ActivePositionCard`.
  - sell/close payload, copy, mock fill, and broker confirmation handlers inside
    `ClosePositionModal`.

Persistence/localStorage/Supabase effects:

- `loadTradeData` reads recommendations, settings, positions, closed positions,
  position updates, scan logs, recommendation scan runs, batches, snapshots,
  outcomes, market regime, and market status.
- localStorage backs demo trade data, demo last action, runbook/protocol state,
  provider plan mode, dev-preview preference, recommendation readbacks, EOD
  acknowledgements, mock broker fills, and trade-management audit events.
- Supabase mutations remain in recommendation status updates, trade creation,
  position closing, snapshot/batch/outcome persistence, and fallback paths for
  missing metadata columns.

Execution/handoff/orchestrator state:

- `ExecutionHandoffPreviewModal` still owns lifecycle/capture/progress state and
  composes extracted handoff hooks/components.
- `ActivePositionCard` still owns execution preview open state and orchestrator
  result wiring.
- `ClosePositionModal` still owns sell/close payload, confirmation, copy,
  mock-fill, and audit-generation state.
- Execution audit appends, record previews, bridge diagnostics, and broker
  capture stubs remain intentionally behavior-owned.

## 3. Ownership Principles

- UI-local state can move with extracted components or hooks only when the
  behavior is isolated and has no app-wide persistence implications.
- App-wide domain state should move only behind carefully named hooks with
  explicit inputs, outputs, and ownership notes.
- Persistence effects should not move until their inputs, outputs, storage keys,
  Supabase tables, and fallback modes are documented.
- Execution/orchestrator state should remain parent-owned until execution
  boundaries are stable and separately planned.
- Calculations should remain where they are unless they are pure, covered by
  tests, or already separated behind display/data helper boundaries.
- Hook extraction should preserve hook order by moving contiguous clusters only
  after a boundary reassessment.
- Handlers that mutate trades, persistence, execution records, or diagnostics
  must stay in `app/trade-app.tsx` until their side effects are fully mapped.

## 4. Candidate Hook Boundaries

`useTradeAppNavigationState`

- Candidate scope: `activeTab`, tab setter, current-tab refresh-island lookup,
  and possibly tab-related helper labels.
- Risk: low if it only owns UI navigation state.
- Do not include refresh execution or data loading in the first extraction.

`useStatisticsRangeState`

- Candidate scope: `selectedStatisticsRange` and setter.
- Risk: low-to-medium because it drives dashboard calculations.
- Keep calculations and dashboard inputs parent-owned.

`useTradeAppModalState`

- Candidate scope: selected recommendation/position and open/close flags for
  app-level modals.
- Risk: medium because add-trade and close-position modal state is coupled to
  validation, saving, and mutation flows.
- Better split into smaller modal-state reassessments before moving.

`useRecommendationDomainState`

- Candidate scope: recommendations, filters, selected recommendation, validation
  status, and diagnostic readbacks.
- Risk: high because ADD TRADE validation, discard persistence, Supabase reads,
  outcome persistence, and execution handoff dependencies are intertwined.
- Not a first extraction.

`useLiveDayTradeDomainState`

- Candidate scope: active positions, latest updates, live refresh status, market
  close/EOD inputs, and update handlers.
- Risk: high because auto-refresh, notification sounds, EOD safety, execution
  previews, and close/sell flows interact.
- Not a first extraction.

`useHistoryDomainState`

- Candidate scope: closed positions and History filters.
- Risk: medium-to-high because History display depends on PnL/result,
  plan-vs-actual, audit/timeline, and Statistics integration.
- History filter state may be separated later; closed trade data should stay.

`useTradeAppPersistenceEffects`

- Candidate scope: localStorage preference effects, recommendation persistence,
  and Supabase read/write effects.
- Risk: very high.
- Should be split only after storage keys, tables, fallback modes, and
  cancellation behavior are documented.

`useExecutionHandoffState`

- Candidate scope: handoff modal lifecycle, bridge controls, phase previews,
  readiness, broker capture, execution records, and orchestrator status.
- Risk: very high and safety-sensitive.
- Keep parent/modal-owned until execution record and persistence boundaries are
  separately planned.

## 5. Safe First Extraction Candidates

A. Navigation/tab state hook:

- Safest because it can begin as `activeTab` plus setter only.
- First do a boundary reassessment to avoid accidentally pulling refresh
  orchestration into the hook.

B. Statistics range/filter UI state hook:

- Small state surface.
- Keep every calculation and formatted value in the parent.

C. Modal open/close UI state hook:

- Useful but more coupled than navigation because selected recommendation and
  selected position trigger validation/mutation paths.
- Should be split into app-shell modal state versus add/close form state.

D. Recommendation UI state hook:

- Potentially useful for filters and history filter state.
- Avoid moving recommendation data, validation, discard, persistence, or handoff
  creation.

E. History UI state hook:

- Candidate for History filters only.
- Avoid closed position data, plan-adherence derivation, audit/timeline
  derivation, and Statistics integration.

F. Persistence/Supabase effects later:

- High value, but not until storage and table contracts are documented.

G. Execution/handoff/orchestrator state much later:

- Safety-sensitive and should follow execution-record/persistence boundary
  planning.

## 6. What Must Not Move Yet

- Supabase writes/sync for recommendations, positions, closed positions,
  snapshots, scan runs, batches, outcomes, or settings.
- localStorage persistence effects that store trade data, demo data,
  recommendation readbacks, EOD acknowledgements, mock broker fills, or audit
  events.
- execution handoff/orchestrator state.
- buy/sell trade mutation flows.
- close-position broker confirmation and mock-fill import flows.
- PnL/statistics calculations.
- plan-adherence calculation ownership.
- active position monitoring, auto-refresh, notification, stale-price, or EOD
  safety logic.
- recommendation outcome evaluation or persistence diagnostics.

## 7. Proposed Implementation Sequence

1. Action 390 - Reassess Navigation/Tab State Hook Boundary.
2. Action 391 - Extract Navigation/Tab State Hook, if the reassessment confirms
   it can stay limited to `activeTab` and setter behavior.
3. Action 392 - Reassess Statistics Range State Boundary.
4. Action 393 - Extract Statistics Range State Hook, if calculations remain
   parent-owned.
5. Action 394 - Reassess Modal State Boundaries.
6. Continue with narrow UI-state hooks only after each boundary is documented.
7. Defer persistence/Supabase effects until a dedicated persistence boundary
   plan exists.
8. Defer execution/handoff/orchestrator state until execution record and safety
   boundaries are planned.

## 8. Risk Assessment

Hook order risk:

- Medium for tiny UI-state hooks and high for domain hooks.
- Any extraction should move a contiguous hook cluster and avoid conditional
  hook calls.

Stale closure risk:

- High around refresh refs, auto-refresh intervals, notification effects,
  validation handlers, and mutation handlers.
- Hooks that expose callbacks need dependency reviews before runtime work.

Effect dependency risk:

- High around `loadTradeData`, persistence effects, local preference writes,
  and refresh intervals.
- Do not move effects just to reduce file size.

localStorage/Supabase data integrity risk:

- High because the app mixes Supabase reads/writes, local demo data, local
  fallback persistence, and diagnostics readbacks.

Execution safety risk:

- High around handoff previews, Avanza bridge diagnostics, broker capture, close
  flows, execution records, and audit events.

Calculation drift risk:

- Medium-to-high for PnL/R, profit factor, plan adherence, recommendation
  analytics, scanner diagnostics, and market readbacks.

E2E coverage reliance:

- Existing e2e tests protect important execution contracts, but state/effect
  extraction can still create subtle timing and stale-data regressions.

## 9. Recommended Next Action

Recommended next action:

**Action 390 - Reassess Navigation/Tab State Hook Boundary**

Why:

- Navigation/tab state is the smallest likely hook boundary.
- A reassessment step keeps refresh orchestration, data loading, and
  cross-tab persistence out of the first state extraction.
- It preserves the current pattern of documenting boundaries before moving
  behavior.

## 10. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 390 Result

Action 390 added `docs/navigation-tab-state-hook-boundary-reassessment.md`.

Result:

- Confirmed `activeTab` is the only primary navigation state.
- Confirmed there is no URL/hash/localStorage persistence for active tab.
- Documented that tab changes affect refresh effects and refresh-island
  selection, so refresh helpers/effects should remain parent-owned.
- Recommended extracting only `activeTab` and its setter into
  `hooks/trade-app/useTradeAppNavigationState.ts`.

Next recommended action:

**Action 391 - Extract Navigation/Tab State Hook**

## Action 391 Result

Action 391 added `hooks/trade-app/useTradeAppNavigationState.ts`.

Result:

- Moved only the active primary tab state into a custom hook.
- The hook returns `{ activeTab, setActiveTab }` and initializes to
  `"Recommendations"`.
- Navigation rendering, tab labels/copy, refresh helpers/effects,
  persistence/localStorage/Supabase behavior, domain state, calculations,
  modals, and execution/handoff state remain in `app/trade-app.tsx`.

Next recommended action:

**Action 392 - Reassess Navigation/Tab State Hook Extraction**

## Action 392 Result

Action 392 added
`docs/navigation-tab-state-hook-post-extraction-reassessment.md`.

Result:

- Verified that `useTradeAppNavigationState` owns only active tab state and the
  setter.
- Confirmed no rendering, refresh effects, persistence, execution behavior,
  domain state, or calculations moved.
- Identified Statistics range state as the next smallest likely state boundary,
  with a reassessment required because the range feeds calculations.

Next recommended action:

**Action 393 - Reassess Statistics Range State Hook Boundary**

## Action 393 Result

Action 393 added `docs/statistics-range-state-hook-boundary-reassessment.md`.

Result:

- Reassessed the Statistics range state boundary after the navigation hook
  extraction.
- Confirmed `selectedStatisticsRange` is isolated as state but
  calculation-adjacent as data input.
- Confirmed no persistence, URL/hash, Supabase, or execution behavior is tied to
  the range setter.
- Recommended a tiny `useStatisticsRangeState` hook as the next runtime step.

Next recommended action:

**Action 394 - Extract Statistics Range State Hook**

## Action 394 Result

Action 394 added `hooks/trade-app/useStatisticsRangeState.ts`.

Result:

- Moved only `selectedStatisticsRange` and `setSelectedStatisticsRange` into a
  tiny state hook.
- Preserved the `"today"` default range.
- Kept range options/constants, metric calculations, recommendation analytics,
  filtering/time-range logic, rendering, persistence, and cross-tab integration
  parent-owned.

Next recommended action:

**Action 395 - Reassess Statistics Range State Hook Extraction**

## Action 395 Result

Action 395 added
`docs/statistics-range-state-hook-post-extraction-reassessment.md`.

Result:

- Verified that `useStatisticsRangeState` owns only selected Statistics range
  state and its setter.
- Confirmed all range options, metric builders, recommendation analytics,
  rendering, persistence, and execution behavior remain parent-owned.
- Ranked modal UI state as the next boundary to reassess, not extract directly.

Next recommended action:

**Action 396 - Reassess Modal UI State Hook Boundary**

## Action 396 Result

Action 396 added `docs/modal-ui-state-hook-boundary-reassessment.md`.

Result:

- Reassessed modal state after the two tiny UI-state hooks.
- Classified existing modal clusters as local already, app-owned and coupled, or
  execution/persistence-heavy.
- Confirmed no modal hook should be extracted yet.
- Recommended Recommendation UI-only state as the next reassessment target.

Next recommended action:

**Action 397 - Reassess Recommendation UI State Hook Boundary**

## Action 397 Result

Action 397 added
`docs/recommendation-ui-state-hook-boundary-reassessment.md`.

Result:

- Inventoried Recommendation state after the component extraction pass.
- Confirmed `RecommendationCardContainer` already owns card-local
  details/discard UI state.
- Confirmed remaining Recommendation state is not a safe generic UI hook
  boundary because it is data-, modal-, persistence-, analytics-, or
  execution-coupled.
- Recommended History UI state as the next boundary to reassess before moving
  additional state.

Next recommended action:

**Action 398 - Reassess History UI State Hook Boundary**

## Action 398 Result

Action 398 added `docs/history-ui-state-hook-boundary-reassessment.md`.

Result:

- Inventoried History parent-owned filter/sort state and card-local details
  state.
- Confirmed no broad `useHistoryUiState` hook should be extracted now.
- Confirmed possible future `useHistoryFilterState` work needs a dedicated
  filter-boundary reassessment because filters feed `buildHistoryDashboard`,
  card ordering, visible counts, and empty states.
- Recommended Live Day Trade UI state as the next boundary to reassess.

Next recommended action:

**Action 399 - Reassess Live Day Trade UI State Hook Boundary**

## Action 399 Result

Action 399 added
`docs/live-day-trade-ui-state-hook-boundary-reassessment.md`.

Result:

- Inventoried Live Day Trade parent-owned state and `ActivePositionCard`
  card-local state.
- Confirmed no `useActivePositionCardUiState` hook should be extracted now.
- Confirmed `eodRiskAcknowledged` is localStorage-coupled, execution preview
  state is orchestrator/handoff-coupled, and close/sell state is mutation- and
  persistence-coupled.
- Recommended creating a persistence boundary plan as the next strategic phase.

Next recommended action:

**Action 400 - Create Persistence Boundary Plan**

## Action 400 Result

Action 400 added `docs/persistence-boundary-plan.md`.

Result:

- Planned the persistence phase after initial UI-state hook work.
- Inventoried inline `app/trade-app.tsx` persistence, existing recommendation
  persistence helpers, execution audit persistence modules, demo/localStorage
  flows, and Supabase read/write surfaces.
- Confirmed trade mutation, Supabase, execution metadata, and audit-critical
  writes should not move yet.
- Recommended reassessing localStorage key constants first.

Next recommended action:

**Action 401 - Reassess localStorage Key Constants Boundary**

## Action 401 Result

Action 401 added
`docs/local-storage-key-constants-boundary-reassessment.md`.

Result:

- Reassessed localStorage key constants as the first persistence-adjacent
  boundary after state hook work.
- Confirmed only exact static key constants should move next.
- Confirmed localStorage access, Supabase behavior, trade mutation flows,
  execution/orchestrator state, recommendation-learning persistence, and
  dynamic EOD acknowledgement behavior remain parent/module-owned.

Next recommended action:

**Action 402 - Extract localStorage Key Constants**

## Action 402 Result

Action 402 created `lib/persistence/local-storage-keys.ts`.

Result:

- Centralized exact static localStorage key strings without moving any
  persistence behavior.
- Updated app and execution timeline usage for the safe static keys.
- Confirmed dynamic EOD acknowledgement, localStorage read/write helpers,
  Supabase, trade mutations, execution/orchestrator state, and calculations
  remain outside this boundary.

Next recommended action:

**Action 403 - Reassess localStorage Key Constants Extraction**

## Action 403 Result

Action 403 added
`docs/local-storage-key-constants-post-extraction-reassessment.md`.

Result:

- Confirmed localStorage constants extraction did not move state, effects,
  read/write helpers, calculations, Supabase behavior, trade mutations, or
  execution/orchestrator behavior.
- Confirmed dynamic EOD acknowledgement remains the next smallest persistence
  boundary to reassess.

Next recommended action:

**Action 404 - Reassess EOD Acknowledgement Persistence Wrapper**

## Action 404 Result

Action 404 added
`docs/eod-acknowledgement-persistence-wrapper-reassessment.md`.

Result:

- Reassessed the EOD acknowledgement persistence boundary without moving state
  or effects.
- Confirmed the next safe runtime step can extract only the persistence helper
  wrapper while keeping UI state and EOD calculations card/app-owned.

Next recommended action:

**Action 405 - Extract EOD Acknowledgement Persistence Wrapper**

## Action 405 Result

Action 405 created
`lib/persistence/eod-acknowledgement-persistence.ts`.

Result:

- Extracted a tiny persistence wrapper while keeping UI state and effects in
  `ActivePositionCard`.
- Confirmed no app state hook, EOD calculation, close/sell flow, Supabase
  behavior, or execution/orchestrator behavior moved.

Next recommended action:

**Action 406 - Reassess EOD Acknowledgement Persistence Wrapper Extraction**

## Action 406 Result

Action 406 added
`docs/eod-acknowledgement-persistence-post-extraction-reassessment.md`.

Result:

- Confirmed EOD wrapper extraction did not move app state, UI state, effects,
  EOD calculations, or execution behavior.
- Recommended reassessing recommendation discard persistence next.

Next recommended action:

**Action 407 - Reassess Recommendation Discard Persistence Wrapper**

## Action 407 Result

Action 407 added
`docs/recommendation-discard-persistence-wrapper-reassessment.md`.

Result:

- Confirmed recommendation discard confirmation UI state is already local to
  `RecommendationCardContainer`.
- Confirmed discard persistence remains app-owned because it updates Supabase
  recommendation status, embedded discard metadata, and local recommendation
  state.
- Confirmed this is not a safe state hook or localStorage wrapper boundary.

Next recommended action:

**Action 408 - Reassess Dev/Diagnostics localStorage Wrapper**

## Action 408 Result

Action 408 added
`docs/dev-diagnostics-local-storage-wrapper-reassessment.md`.

Result:

- Confirmed the next persistence-adjacent runtime extraction can be limited to
  app-local dev/preference localStorage helpers.
- Confirmed UI state, effect initial-load guards, bridge calls, execution
  stores, Supabase behavior, trade mutations, and calculations should remain
  app/module-owned.

Next recommended action:

**Action 409 - Extract Dev/Diagnostics localStorage Wrapper**

## Action 409 Result

Action 409 created
`lib/persistence/dev-diagnostics-local-storage.ts`.

Result:

- Moved only exact app-local dev/preference localStorage helpers.
- Kept UI state, initial-load effect guards, live market trial runbook
  normalization, diagnostics computation, bridge calls, execution stores,
  Supabase behavior, trade mutations, and calculations parent/module-owned.

Next recommended action:

**Action 410 - Reassess Dev/Diagnostics localStorage Wrapper Extraction**

## Action 410 Result

Action 410 added
`docs/dev-diagnostics-local-storage-post-extraction-reassessment.md`.

Result:

- Confirmed no additional app state, effects, calculations, Supabase behavior,
  trade mutations, or execution behavior moved after the dev/diagnostics
  wrapper extraction.
- Confirmed live market trial runbook persistence remains a separate
  app-local candidate for reassessment.

Next recommended action:

**Action 411 - Reassess Live Market Trial Runbook Persistence Wrapper**

## Action 411 Result

Action 411 created
`docs/live-market-trial-runbook-persistence-wrapper-reassessment.md`.

Result:

- Reassessed the live market trial runbook persistence boundary without moving
  state, effects, calculations, localStorage access, Supabase behavior, or
  execution behavior.
- Confirmed the persistence path is safe to extract only as an exact wrapper
  around default creation, normalization, read fallback, and write semantics.
- Confirmed runbook UI state, hydration/write guards, live market workflow,
  provider/data behavior, and cross-domain app state should remain
  parent/module-owned.

Next recommended action:

**Action 412 - Extract Live Market Trial Runbook Persistence Wrapper**

## Action 412 Result

Action 412 created
`lib/persistence/live-market-trial-runbook-persistence.ts`.

Result:

- Moved only persistence helper code, not React state or effects.
- `app/trade-app.tsx` still owns runbook state, setters, hydration/write-effect
  guards, UI callbacks, summary composition, and live market workflow.
- No app-wide calculations, Supabase behavior, trade mutations, execution
  wiring, provider/data behavior, or cross-tab state moved.

Checks:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- escalated `npm run test:e2e` passed: 64 tests after the default sandbox run
  was blocked on port binding.

Next recommended action:

**Action 413 - Reassess Live Market Trial Runbook Persistence Wrapper Extraction**

## Action 413 Result

Action 413 created
`docs/live-market-trial-runbook-persistence-post-extraction-reassessment.md`.

Result:

- Verified no additional state, effects, calculations, localStorage behavior,
  Supabase behavior, trade mutations, or execution behavior moved after the
  runbook persistence wrapper extraction.
- Confirmed runbook UI state and hydration/write-effect guards remain in
  `app/trade-app.tsx`.
- Recommended moving from low-risk app-local localStorage wrappers to an
  execution audit/event log persistence boundary reassessment.

Next recommended action:

**Action 414 - Reassess Execution Audit/Event Log Persistence Boundary**

## Action 414 Result

Action 414 created
`docs/execution-audit-event-log-persistence-boundary-reassessment.md`.

Result:

- Reassessed execution audit/event persistence without moving state, effects,
  localStorage behavior, Supabase behavior, execution metadata, trade
  mutations, or execution/orchestrator behavior.
- Confirmed audit/event log extraction should wait because the remaining
  append paths are coupled to execution handoff, timeline construction,
  History displays, diagnostics, broker/result capture, and idempotency.
- Recommended clarifying execution record creation next.

Next recommended action:

**Action 415 - Reassess Execution Record Creation Boundary**
