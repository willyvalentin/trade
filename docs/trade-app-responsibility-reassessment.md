# trade-app.tsx Responsibility Reassessment

## 1. Purpose

This reassessment records the state of `app/trade-app.tsx` after Actions
317-333. Those actions extracted most of the Execution Handoff Preview Modal
presentation, phase preview state, Avanza readiness derived state, and core
request preview rendering without changing runtime behavior.

The goal of this document is to identify the safest next refactor target while
keeping application behavior stable.

## 2. Current file inventory

Approximate current size:

- `app/trade-app.tsx`: 42,562 lines after Action 334

Major top-level sections still present:

- broad trade app types and normalization helpers
- recommendation, scan, provider, and market diagnostics helpers
- trade history/statistics helpers
- live day trade and position-management helpers
- execution/handoff helper functions and modal-adjacent utility functions
- the main `TradeApp` component and app-wide state/effects
- many tab/page sections for Recommendations, Live Day Trades, Stats Today,
  Market, Statistics, History, and Settings
- several still-inline panels/cards unrelated to the handoff modal

Major React state groups still owned by `TradeApp` or inline modal code:

- app-wide recommendation, position, history, statistics, settings, scan, and
  refresh state
- app-wide localStorage-backed preferences and dismissed warnings
- execution modal open/close state via the selected execution/handoff status
- Execution Handoff Preview Modal lifecycle/capture/progress stub state
- selected execution intent/handoff payloads from the orchestrator result
- dry-run request preview creation and bridge envelope preview creation

Major handlers still owned inline:

- app-wide loading, refresh, recommendation, position, history, and settings
  handlers
- trade-management actions and local demo/mock storage handlers
- execution lifecycle/progress stub handlers
- preparation/capture stub handlers that are not part of the extracted
  localhost bridge or Avanza phase preview clusters

Major render sections still inline:

- main application shell and navigation
- recommendation cards and details surfaces
- Live Day Trades and position-management surfaces
- Statistics/History/Market diagnostics surfaces
- Execution Handoff Preview Modal shell
- lifecycle/status, preparation, capture, safety checks, and footer sections
  inside the modal

Already extracted from the handoff modal:

- shared display helpers in `components/execution/handoff-modal-shared.tsx`
- `AvanzaDryRunReadinessPanel`
- `LocalhostBridgeControls`
- early phase previews:
  - `SessionDetectionPreview`
  - `SearchOnlyPreview`
  - `InstrumentVerificationPreview`
- middle phase previews:
  - `InstrumentPagePreview`
  - `OrderPageOpenPreview`
  - `AdvancedFormFillPreview`
  - `ReviewClickPreview`
- late phase previews:
  - `BrokerConfirmationCapturePreview`
  - `BrokerExecutionResultEligibilityPreview`
  - `BrokerExecutionResultPreview`
  - `ExecutionRecordEligibilityPreview`
- pure readiness mappers in `lib/handoff-modal-data-mappers.ts`
- state/handler hooks:
  - `useLocalhostBridgeControlsState`
  - `useEarlyPhasePreviewState`
  - `useMiddlePhasePreviewState`
  - `useLatePhasePreviewState`
  - `useAvanzaReadinessState`
- core handoff and request preview components:
  - `HandoffCoreSummary`
  - `FutureAgentRequestPreview`
  - `AvanzaDryRunRequestPreview`
  - `BridgeRequestEnvelopePreview`
- QA/audit display components:
  - `ExecutionSandboxQaPanel`
  - `AgentProgressStubPanel`

## 3. Remaining handoff modal responsibilities

`app/trade-app.tsx` still owns these handoff-modal responsibilities:

- modal shell, escape-key behavior, close button, and open/close integration
- selected execution intent and Avanza handoff payload from the orchestrator
- lifecycle snapshot, capture base lifecycle, preparation stub, capture stub,
  and progress stub state
- dry-run request preview creation
- future-agent request preview and bridge envelope preview creation
- execution sandbox QA item assembly
- lifecycle/status, preparation, capture, safety checks, and footer sections
- integration of extracted bridge controls, phase previews, readiness panel,
  request preview components, QA/audit components, and phase hooks

These are still reasonable parent responsibilities for now because they sit at
the modal boundary and rely on selected intent/handoff data.

## 4. Remaining app-wide responsibilities

The following non-modal responsibilities remain in `app/trade-app.tsx` and
should not be mixed with handoff-modal refactors without a separate plan:

- Recommendations tab rendering and recommendation card behavior
- Live Day Trades tab rendering and active position actions
- Stats Today and Statistics summaries
- History and closed-position journal behavior
- Market diagnostics, scan logs, scanner readiness, and provider-budget panels
- Settings/navigation integration
- app-wide localStorage effects, auto-refresh timers, and dismissed-warning
  state
- trade creation, update, close, partial-fill, and local demo/mock behavior

These areas may benefit from future decomposition, but they are broader than
the handoff modal and carry more behavior risk.

## 5. Candidate next extractions

Safest next targets, ranked:

1. **Extract the modal shell component.**
   This is moderately risky because it owns escape handling, close behavior,
   and large child composition. It is best attempted after more inner sections
   are presentational.

2. **Extract remaining lifecycle/preparation/capture stub panels only if a
   rendering-only boundary is obvious.**
   These panels include controls and lifecycle side effects, so the parent
   should retain state and handlers.

3. **Extract larger app-wide tab sections later.**
   Recommendations, Live Day Trades, Statistics, History, Market, and Settings
   should be handled as separate planned decompositions because they share
   broad app state and data-loading behavior.

## 6. What should not be extracted yet

Avoid extracting these in the next action:

- app-wide trade state
- recommendation generation, scanner, ranking, or serving behavior
- Live Day Trades and History mutation paths
- cross-tab localStorage effects and auto-refresh timers
- Supabase or persistence flows
- business logic that changes scoring, execution, capture, broker result,
  execution record, or trade mutation behavior
- bridge/client calls or phase preview state that already has dedicated hooks

## 7. Risk assessment

Primary risks:

- **Prop drilling:** presentational extractions may need many props. This is
  acceptable for low-risk rendering moves, but props should stay explicit.
- **Hook ownership:** moving state too soon can accidentally change loading,
  reset, or result-chaining behavior. Current state hooks should remain stable
  before more hook extraction.
- **Modal shell coupling:** shell extraction can alter escape handling,
  close behavior, scroll layout, or dev-gated visibility if done too early.
- **App-wide state coupling:** large tab sections depend on shared fetch,
  refresh, localStorage, and mutation handlers. They need separate plans.
- **Test reliance:** existing e2e coverage exercises the execution fixture and
  many stub paths. Refactors should continue to lean on that coverage, while
  keeping each action narrow.

## 8. Action 333 result

Action 333 extracted core request preview rendering into dedicated
presentational components:

- `components/execution/HandoffCoreSummary.tsx`
- `components/execution/FutureAgentRequestPreview.tsx`
- `components/execution/AvanzaDryRunRequestPreview.tsx`
- `components/execution/BridgeRequestEnvelopePreview.tsx`

The parent modal still owns selected intent/handoff data, dry-run request
creation, future-agent request creation, bridge envelope creation, validation
status, all state hooks, and all handlers. The extracted components receive
explicit display props and do not call bridge clients, mutate state, or change
dev-gated behavior.

Behavior preservation:

- visible copy, labels, status pills, JSON/details blocks, and safety labels
  are preserved
- no button text changed
- no state, hook, handler, API call, or bridge/client logic moved
- no Avanza/browser/execution/persistence/trade-mutation behavior was added

## 9. Action 334 result

Action 334 extracted QA/audit rendering into dedicated presentational
components:

- `components/execution/ExecutionSandboxQaPanel.tsx`
- `components/execution/AgentProgressStubPanel.tsx`

The parent modal still owns sandbox QA item assembly, selected progress event
type state, agent progress event creation, lifecycle transitions, audit event
append calls, messages, errors, and all callbacks. The extracted components
receive explicit display props and callbacks but do not create requests, mutate
state directly, call bridge clients, or write persistence.

Behavior preservation:

- visible copy, labels, status pills, select/button text, timeline rows, and dev
  gating are preserved
- no state ownership, hook, handler implementation, API call, bridge/client
  logic, lifecycle transition, or audit append logic moved
- no Avanza/browser/execution/persistence/trade-mutation behavior was added

## 10. Action 335 result

Action 335 added
`docs/handoff-modal-shell-extraction-reassessment.md`.

Assessment result:

- The remaining modal shell can likely be extracted safely only as a
  presentational shell component.
- The parent should keep all hooks, state, request construction, handlers,
  phase composition, lifecycle transitions, audit append calls, preparation
  stubs, and capture stubs.
- A larger composed modal extraction would create heavy prop drilling and is
  not recommended yet.

## 11. Action 336 result

Action 336 added
`components/execution/ExecutionHandoffModalShell.tsx`.

Extraction result:

- The outer Execution Handoff Preview Modal shell is now a presentational
  component.
- The shell owns only backdrop/dialog/titlebar/close/scroll-wrapper rendering.
- `app/trade-app.tsx` still owns modal open/close state, selected
  intent/handoff, dry-run request creation, all hooks, all handlers, bridge
  calls, readiness assembly, preview composition, lifecycle transitions, audit
  append calls, preparation stubs, and capture stubs.
- Backdrop click-to-close, close button aria label, title text, dialog ARIA
  attributes, and modal class names were preserved.
- `app/trade-app.tsx` is now approximately 42,518 lines.

## 12. Recommended next action

Recommended:

**Action 337 — Reassess trade-app.tsx After Modal Shell Extraction**

Scope should remain assessment-first:

- re-inventory `app/trade-app.tsx` after the shell extraction
- identify remaining inline modal sections and app-wide responsibilities
- decide whether the next safe target is remaining modal inline sections,
  lifecycle/status panels, or broader app-wide tab decomposition

Parent should continue to own selected intent/handoff, dry-run request
creation, request validation, bridge envelope creation, all state hooks, all
handlers, QA item assembly, lifecycle/progress transitions, audit events, and
capture/preparation behavior.

## 13. Verification

Action 336 verification:

- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`
- `git diff --check`
- `npm run test:e2e`

No modal behavior changes are expected from the presentational shell extraction.

## 14. Action 337 result

Action 337 added
`docs/trade-app-post-shell-extraction-reassessment.md`.

Assessment result:

- `app/trade-app.tsx` remains approximately 42,518 lines after the shell
  extraction.
- The Execution Handoff Preview Modal is now mostly composed from extracted
  presentational components and preview state hooks.
- The parent still owns selected intent/handoff wiring, dry-run request
  creation, bridge envelope creation, hook composition, readiness inputs,
  lifecycle state, preparation/capture stubs, and remaining inline
  lifecycle/safety/detail sections.
- A full modal composition extraction is not recommended yet because it would
  create a very large prop surface.

Recommended next action:

**Action 338 — Extract Execution Lifecycle Status Sections**

This should remain rendering-only: extract the remaining inline
lifecycle/preparation/capture/status sections while leaving state, handlers,
lifecycle transitions, audit append logic, and capture creation in the parent.

## 15. Action 338 result

Action 338 extracted the remaining modal lifecycle/status rendering into:

- `components/execution/ExecutionLifecycleStatusPanel.tsx`
- `components/execution/ExecutionBrokerCaptureStubPanel.tsx`
- `components/execution/ExecutionHandoffStatusReadbacks.tsx`

Result:

- `app/trade-app.tsx` is now approximately 42,197 lines.
- Lifecycle/preparation display, bridge-backed diagnostics runner result
  display, broker capture stub display, local capture result details, final
  detail readbacks, blocked reason, intent reason, safety checks, and footer
  close rendering moved out as presentational components.
- The parent still owns all lifecycle state, state setters, handlers,
  lifecycle transitions, audit append logic, capture result creation, selected
  handoff/intent wiring, request creation, hook composition, and result
  chaining.

Recommended next action:

**Action 339 — Reassess Remaining trade-app.tsx Modal/App Boundaries**

## 16. Action 339 result

Action 339 added
`docs/trade-app-modal-app-boundary-reassessment.md`.

Assessment result:

- The remaining handoff modal boundary is now mostly panel composition and
  wiring.
- `app/trade-app.tsx` still owns broad app-wide responsibilities across
  recommendations, live trades, history/statistics, market diagnostics,
  localStorage, Supabase reads/writes, and refresh effects.
- Extracting the Handoff Modal composition container is safer than moving
  Recommendations or Live Day Trades next because the modal panels and hooks
  have already been isolated.

Recommended next action:

**Action 340 — Extract Handoff Modal Composition Container**

## 17. Action 341 result

Action 341 added
`docs/trade-app-post-composition-extraction-reassessment.md`.

Assessment result:

- `app/trade-app.tsx` is approximately 42,074 lines after the Action 340
  composition extraction.
- The handoff modal decomposition is complete enough to pause. Remaining modal
  code in the parent is now mostly intentional ownership of selected
  intent/handoff data, request construction, hook composition, lifecycle/capture
  state, handlers, audit append calls, and grouped props.
- Additional modal-only cleanup would have lower payoff and higher behavior
  risk than moving to app-wide tab planning.
- The safest next high-payoff target is the Recommendations tab, but it should
  start with a plan because that surface touches card interactions, add-trade
  entry points, discard callbacks, local/demo visibility, and derived
  diagnostics.

Recommended next action:

**Action 342 — Create Recommendations Tab Extraction Plan**

## 18. Action 342 result

Action 342 added `docs/recommendations-tab-extraction-plan.md`.

Planning result:

- Inventoried the current Recommendations tab, `RecommendationCard`, details
  modal, ADD TRADE validation handler, discard handler, selected recommendation
  modal mount, and local/demo dependencies.
- Confirmed the primary Recommendations tab does not currently expose dedicated
  filter/sort/search controls; visible cards are derived upstream as
  `dailyRecommendations`.
- Recommended keeping app-wide fetching/loading, selected recommendation state,
  ADD TRADE validation, discard persistence, `TradeModal`, localStorage/demo
  behavior, Supabase writes, and cross-tab diagnostics in `app/trade-app.tsx`
  for the first runtime extraction.
- Recommended extracting a presentational Recommendations tab shell first,
  before moving `RecommendationCard` or details modal internals.

Recommended next action:

**Action 343 — Extract Recommendations Tab Shell**

## 19. Action 343 result

Action 343 added `components/recommendations/RecommendationsTab.tsx`.

Extraction result:

- Extracted the primary Recommendations tab shell/layout as a presentational
  component.
- Moved only statusbar placement, learning-mode banner placement, grid wrapper,
  loading empty state, and dominant recommendation empty-state rendering.
- Kept `RecommendationCard` construction, ADD TRADE validation, selected
  recommendation state, `TradeModal`, discard persistence, Supabase writes,
  localStorage/demo behavior, and cross-tab diagnostics in `app/trade-app.tsx`.
- Preserved visible copy, class names, card ordering, callbacks, button text,
  and loading/empty-state behavior.

Recommended next action:

**Action 344 — Extract Recommendation Card Presentational Component**

## 20. Action 344 result

Action 344 added
`docs/recommendations-tab-post-shell-reassessment.md`.

Assessment result:

- Reassessed the Recommendations tab after the Action 343 shell extraction.
- Confirmed the tab shell is extracted, while `RecommendationCard`,
  `RecommendationDetailsModal`, and `DiscardRecommendationModal` remain local in
  `app/trade-app.tsx`.
- Inventoried the current card sections, local UI-only state, ADD TRADE
  callback wiring, discard callback wiring, and details modal dependencies.
- Confirmed `app/trade-app.tsx` should keep recommendation data derivation, ADD
  TRADE validation, selected `TradeModal`, discard persistence,
  Supabase/localStorage behavior, and execution handoff creation initially.
- Recommended extracting a move-only Recommendation Card component next, before
  splitting card subcomponents or moving parent state.

Recommended next action:

**Action 345 — Extract Recommendation Card Presentational Component**

## 21. Action 345 result

Action 345 added `components/recommendations/RecommendationCard.tsx`.

Extraction result:

- Extracted the visual recommendation card shell into a presentational
  component.
- Left `RecommendationCardContainer`, details/discard UI state,
  `RecommendationDetailsModal`, `DiscardRecommendationModal`, ADD TRADE
  validation, selected `TradeModal`, discard persistence, Supabase/localStorage
  behavior, and execution handoff creation in `app/trade-app.tsx`.
- Preserved button text, disabled states, click/keyboard behavior, class names,
  metrics, and modal slot placement.

Recommended next action:

**Action 346 — Reassess Recommendation Card After Extraction**

## 22. Action 346 result

Action 346 added
`docs/recommendation-card-post-extraction-reassessment.md`.

Assessment result:

- Inventoried `RecommendationsTab`, `RecommendationCard`,
  `RecommendationCardContainer`, `RecommendationDetailsModal`, and
  `DiscardRecommendationModal` after the card shell extraction.
- Confirmed `RecommendationCard.tsx` is only 136 lines and is not the highest
  payoff next split.
- Confirmed the parent still owns ADD TRADE validation, selected `TradeModal`,
  discard persistence, Supabase/localStorage behavior, data derivation, details
  modal state, and execution handoff behavior.
- Recommended extracting recommendation modal components next, starting with
  the smaller discard modal and moving the details modal if dependency risk is
  acceptable.

Recommended next action:

**Action 347 — Extract Recommendation Details/Discard Modal Components**

## 23. Action 347 result

Action 347 added
`components/recommendations/DiscardRecommendationModal.tsx`.

Extraction result:

- Extracted the discard recommendation confirmation modal as a presentational
  component.
- Kept discard open state, confirming state, discard persistence, ADD TRADE
  validation, selected `TradeModal`, Supabase/localStorage behavior, data
  construction, and execution handoff behavior in `app/trade-app.tsx`.
- Left `RecommendationDetailsModal` inline because it is large and depends on a
  broad set of local details display helpers.

Recommended next action:

**Action 348 — Reassess Recommendations Area After Modal Extraction**

## 24. Action 348 result

Action 348 added
`docs/recommendations-area-post-modal-extraction-reassessment.md`.

Assessment result:

- Inventoried the Recommendations area after discard modal extraction.
- Confirmed `RecommendationDetailsModal` remains inline and depends on a broad
  local helper cluster.
- Classified helper dependencies and confirmed they are display/UI-only rather
  than Supabase/localStorage/execution-coupled.
- Recommended extracting details modal display helpers/mappers before moving the
  full modal or card container.

Recommended next action:

**Action 349 — Extract Recommendation Details Modal Display Helpers**

## 25. Action 349 result

Action 349 added
`components/recommendations/recommendation-details-display-helpers.ts`.

Extraction result:

- Extracted pure recommendation details value formatting, currency/share
  formatting, tone mapping, and tone class-name helpers.
- Kept `RecommendationDetailsModal` and its JSX render helpers inline.
- Kept `RecommendationCardContainer`, details/discard state, ADD TRADE
  validation, selected `TradeModal`, discard persistence, Supabase/localStorage
  behavior, data construction, and execution handoff behavior parent-owned.
- `app/trade-app.tsx` is approximately 41,860 lines after this extraction.

Recommended next action:

**Action 350 — Reassess Recommendation Details Modal After Helper Extraction**

## 26. Action 350 result

Action 350 added
`docs/recommendation-details-modal-post-helper-extraction-reassessment.md`.

Assessment result:

- Reassessed the inline details modal after Action 349 helper extraction.
- Confirmed the modal is read-only and does not own ADD TRADE, discard,
  Supabase/localStorage, or execution behavior.
- Confirmed the main remaining risk is shared JSX helper reuse across
  recommendation and live trade/detail sections.
- Recommended extracting `RecommendationDetailsModal` as a presentational
  component next.

Recommended next action:

**Action 351 — Extract RecommendationDetailsModal Presentational Component**

## 27. Action 351 result

Action 351 added
`components/recommendations/RecommendationDetailsModal.tsx`.

Extraction result:

- Extracted the recommendation details modal as a presentational component.
- Moved the direct render-only details JSX helper components with it.
- Exported shared detail helpers back to `app/trade-app.tsx` where later live
  trade/detail sections still use them.
- Kept `RecommendationCardContainer`, details/discard state, ADD TRADE
  validation, selected `TradeModal`, discard persistence, Supabase/localStorage
  behavior, data construction, and execution handoff behavior parent-owned.
- `app/trade-app.tsx` is approximately 41,082 lines after this extraction.

Recommended next action:

**Action 352 — Reassess Recommendations Area After Details Modal Extraction**

## 28. Action 352 result

Action 352 added
`docs/recommendations-area-post-details-modal-extraction-reassessment.md`.

Result:

- Reassessed `app/trade-app.tsx` after the recommendation details modal
  extraction.
- Confirmed `RecommendationCardContainer` remains the main
  Recommendations-specific inline component.
- Confirmed parent-owned behavior still includes recommendation data
  construction, ADD TRADE validation, discard persistence, selected
  `TradeModal`, Supabase/localStorage behavior, and execution handoff behavior.
- Recommended extracting a pure recommendation card display mapper before
  moving the stateful container boundary.

Recommended next action:

**Action 353 — Extract Recommendation Card Display Mapper**

## 29. Action 353 result

Action 353 added
`components/recommendations/recommendation-card-display-mapper.ts`.

Result:

- Extracted pure display/prop mapping from `RecommendationCardContainer`.
- Moved confidence labels/tones, metrics, confidence breakdown rows, summary
  fallback, source badge descriptors, ADD TRADE display labels, and disabled
  display flags into a typed helper module.
- Kept `RecommendationCardContainer` in `app/trade-app.tsx`.
- Kept all recommendation callbacks, details/discard state, ADD TRADE
  validation, discard persistence, selected `TradeModal`, Supabase/localStorage
  behavior, recommendation data construction, and execution handoff behavior
  parent-owned.

Recommended next action:

**Action 354 — Reassess RecommendationCardContainer After Display Mapper Extraction**

## 30. Action 354 result

Action 354 added
`docs/recommendation-card-container-post-mapper-reassessment.md`.

Result:

- Reassessed `RecommendationCardContainer` after Action 353.
- Confirmed the container is now mostly UI state, modal slot composition, and
  callback bridge wiring.
- Confirmed `app/trade-app.tsx` must still own recommendation data
  construction, ADD TRADE validation, selected `TradeModal`, discard
  persistence, Supabase/localStorage behavior, and execution handoff behavior.
- Recommended extracting the container boundary next.

Recommended next action:

**Action 355 — Extract RecommendationCardContainer Boundary**

## 31. Action 355 result

Action 355 added
`components/recommendations/RecommendationCardContainer.tsx`.

Result:

- Extracted the recommendation card container boundary from `app/trade-app.tsx`.
- Moved only local details/discard modal state and slot composition.
- Kept recommendation data construction, ADD TRADE validation, discard
  persistence, selected `TradeModal`, Supabase/localStorage behavior, execution
  handoff creation, and shared app-wide identity/badge visuals parent-owned.

Recommended next action:

**Action 356 — Reassess Recommendations Area After Container Extraction**

## 32. Action 356 result

Action 356 added
`docs/recommendations-area-post-container-extraction-reassessment.md`.

Result:

- Reassessed `app/trade-app.tsx` after the extracted Recommendations card
  container.
- Confirmed Recommendations presentation extraction is complete enough to pause.
- Confirmed parent-owned behavior still includes recommendation data
  construction, ADD TRADE validation, discard persistence, selected
  `TradeModal`, Supabase/localStorage behavior, execution handoff behavior, and
  shared identity/source-badge render slots.
- Recommended moving the next refactor phase to Live Day Trades planning.

Recommended next action:

**Action 357 — Create Live Day Trades Tab Extraction Plan**

## 33. Action 357 result

Action 357 added `docs/live-day-trades-tab-extraction-plan.md`.

Result:

- Created a documentation-only extraction plan for Live Day Trades.
- Inventoried the tab shell, live trade card, live details modal, close/sell
  modal, EOD safety display, current price/PnL/risk display, execution preview
  dependencies, and persistence dependencies.
- Recommended extracting the Live Day Trades tab shell first.
- Confirmed sell/exit behavior, selected close modal state, EOD
  acknowledgement, execution handoff/exit handoff logic, Supabase/localStorage
  behavior, and live trade data construction must remain parent-owned.

Recommended next action:

**Action 358 — Extract Live Day Trades Tab Shell**

## 34. Action 358 result

Action 358 added
`components/live-day-trades/LiveDayTradesTab.tsx`.

Result:

- Extracted the Live Day Trades tab shell/layout into a presentational
  component.
- The extracted shell owns only statusbar placement, fixture panel placement,
  loading/empty states, the main card grid, the continued card grid, and the
  divider.
- `app/trade-app.tsx` still owns live position data construction,
  sorting/grouping, risk and PnL calculations, EOD safety logic, target/stop
  monitoring, sell/close/exit handlers, execution handoff creation,
  persistence, Supabase/localStorage behavior, selected trade state, and
  rendered `ActivePositionCard` nodes.

Safety result:

- No live-trade behavior, monitoring, sell/close/exit flow, EOD safety,
  persistence, Supabase/localStorage, Avanza/browser, execution, or trade
  mutation behavior moved or changed.

Recommended next action:

**Action 359 — Reassess Live Day Trades Tab After Shell Extraction**

## 35. Action 359 result

Action 359 added
`docs/live-day-trades-tab-post-shell-reassessment.md`.

Result:

- Reassessed the Live Day Trades tab after `LiveDayTradesTab` shell extraction.
- Confirmed remaining live card rendering is local `ActivePositionCard` in
  `app/trade-app.tsx`.
- Confirmed `ActivePositionCard` still mixes display with card-local details
  state, execution preview state, EOD acknowledgement state/persistence, live
  sell guidance derivation, and execution orchestrator preview derivation.
- Confirmed close/sell persistence and broker exit confirmation remain in
  `ClosePositionModal` and parent-owned app state.
- Recommended extracting pure Live Day Trade display mapping before moving the
  card boundary.

Safety result:

- Documentation only.
- No sell/close/exit, monitoring, EOD, PnL/risk, persistence,
  Supabase/localStorage, Avanza/browser, execution, or trade mutation behavior
  moved or changed.

Recommended next action:

**Action 360 — Extract Live Day Trade Display Mapper**

## 36. Action 360 result

Action 360 added
`components/live-day-trades/live-day-trade-display-mapper.ts`.

Result:

- Extracted pure Live Day Trade card display mapping from local
  `ActivePositionCard`.
- Moved metric row construction, action/guidance class-name derivation, close
  button label/tone, aria label, guidance fallback strings, partial-close and
  profit-fade display copy, updated-at display text, and live trade reality
  badges.
- Kept `ActivePositionCard` in `app/trade-app.tsx`.
- Kept card-local details state, execution preview state, EOD acknowledgement
  state/persistence, sell/close callback wiring, execution preview wiring,
  live data construction, PnL/risk calculations, EOD safety, target/stop
  monitoring, persistence, Supabase/localStorage behavior, and execution/exit
  handoff behavior parent/card-owned.

Safety result:

- No state, hook, handler, close/sell/exit, EOD acknowledgement, persistence,
  Supabase/localStorage, Avanza/browser, execution, or trade mutation behavior
  moved or changed.

Recommended next action:

**Action 361 — Reassess ActivePositionCard After Display Mapper Extraction**

## 37. Action 361 result

Action 361 added
`docs/active-position-card-post-display-mapper-reassessment.md`.

Result:

- Reassessed `ActivePositionCard` after Action 360.
- Confirmed the card still mixes display with local details modal state,
  execution preview state, EOD acknowledgement state/persistence, close/sell
  callback wiring, and execution preview orchestration.
- Confirmed full card extraction is feasible later but not the safest immediate
  step.
- Recommended extracting the small EOD manual review display panel from
  `LiveTradeDetailsModal` next while keeping acknowledgement persistence in
  `ActivePositionCard`.

Safety result:

- Documentation only.
- No close/sell/exit, EOD acknowledgement, execution preview, persistence,
  Supabase/localStorage, Avanza/browser, execution, or trade mutation behavior
  moved or changed.

Recommended next action:

**Action 362 — Extract Live Day Trade EOD Safety Panel**

## 38. Action 362 result

Action 362 added `components/live-day-trades/LiveDayTradeEodSafetyPanel.tsx`.

Result:

- Extracted the Live Day Trade EOD manual review display panel from
  `LiveTradeDetailsModal`.
- The new component is presentational and receives label, tone, message,
  acknowledged state, and acknowledgement callback props.
- `ActivePositionCard` still owns EOD acknowledgement state/persistence,
  details modal state, execution preview state, close/sell callback wiring, and
  execution preview orchestration.
- `app/trade-app.tsx` still owns EOD calculation, close/sell persistence,
  Supabase/localStorage behavior, and execution/exit handoff behavior.

Safety result:

- No EOD acknowledgement persistence, close/sell/exit, execution preview,
  persistence, Supabase/localStorage, Avanza/browser, execution, or trade
  mutation behavior moved or changed.

Recommended next action:

**Action 363 — Reassess ActivePositionCard After EOD Panel Extraction**

## 39. Action 363 result

Action 363 added
`docs/active-position-card-post-eod-panel-reassessment.md`.

Result:

- Reassessed `ActivePositionCard` after extracting
  `LiveDayTradeEodSafetyPanel`.
- Confirmed the card still owns EOD acknowledgement state/persistence, details
  modal state, execution preview state, close/sell callback wiring, and
  execution preview orchestration.
- Confirmed `LiveTradeDetailsModal` and `ClosePositionModal` remain larger
  extraction targets.
- Recommended extracting the smaller `LiveExecutionStatusSurface`
  presentational component next.

Safety result:

- Documentation only.
- No close/sell/exit, EOD acknowledgement, execution preview, persistence,
  Supabase/localStorage, Avanza/browser, execution, or trade mutation behavior
  moved or changed.

Recommended next action:

**Action 364 — Extract LiveExecutionStatusSurface Presentational Component**

## 40. Action 364 result

Action 364 added `components/live-day-trades/LiveExecutionStatusSurface.tsx`.

Result:

- Extracted the live execution status surface rendering into a presentational
  component.
- Preserved status label/title/description, mode badge, "Next action:" copy,
  final-submit suffix, and "View handoff" button behavior.
- Kept orchestrator calls, preview state, `ExecutionHandoffPreviewModal`
  wiring, close/sell handlers, EOD acknowledgement persistence,
  Supabase/localStorage behavior, and trade mutation behavior in the existing
  callers.

Safety result:

- No state ownership, hook, handler, orchestrator, preview, close/sell/exit,
  persistence, Supabase/localStorage, Avanza/browser, execution, or trade
  mutation behavior moved or changed.

Recommended next action:

**Action 365 — Reassess ActivePositionCard After Execution Status Surface Extraction**

## 41. Action 365 result

Action 365 added
`docs/active-position-card-post-execution-status-surface-reassessment.md`.

Result:

- Reassessed `ActivePositionCard` after the extracted
  `LiveExecutionStatusSurface`.
- Confirmed `app/trade-app.tsx` is about 40,732 lines.
- Confirmed `ActivePositionCard` still intentionally owns local card state, EOD
  acknowledgement persistence, execution preview state, orchestrator calls,
  close callback wiring, details modal rendering, and handoff modal wiring.
- Confirmed `ClosePositionModal` remains stateful and behavior-heavy, so it is
  not the safest next extraction target.
- Recommended extracting the visible live-card body/header/actions rendering
  next as a presentational component.

Recommended next action:

**Action 366 — Extract Live Day Trade Card Body Presentational Component**

## 42. Action 366 result

Action 366 added `components/live-day-trades/LiveDayTradeCardBody.tsx`.

Result:

- Extracted the visible live day trade card body/header/actions rendering.
- Reduced `app/trade-app.tsx` while keeping `ActivePositionCard` responsible for
  local state, EOD acknowledgement persistence, current price/PnL/risk
  calculation, orchestrator calls, execution preview state, modal wiring, and
  close callback behavior.
- Used rendered slots for identity, data-mode badges, metrics, execution status,
  details modal, and execution preview modal to avoid moving shared helpers or
  behavior.

Safety result:

- No close/sell/exit, EOD acknowledgement, orchestrator, preview, modal,
  persistence, Supabase/localStorage, Avanza/browser, execution, or trade
  mutation behavior moved or changed.

Recommended next action:

**Action 367 — Reassess ActivePositionCard After Card Body Extraction**

## 43. Action 367 result

Action 367 added
`docs/active-position-card-post-card-body-reassessment.md`.

Result:

- Reassessed the Live Day Trades card after `LiveDayTradeCardBody` extraction.
- Confirmed `app/trade-app.tsx` is about 40,695 lines.
- Confirmed `ActivePositionCard` still owns local state, EOD acknowledgement
  persistence, close callback wiring, orchestrator calls, execution preview
  state, details modal slot wiring, and handoff preview modal wiring.
- Confirmed `ClosePositionModal` remains too stateful for the next extraction.
- Recommended extracting `LiveTradeDetailsModal` next.

Recommended next action:

**Action 368 — Extract LiveTradeDetailsModal Presentational Component**

## 44. Action 368 result

Action 368 added `components/live-day-trades/LiveTradeDetailsModal.tsx`.

Result:

- Extracted the live trade details modal rendering from `app/trade-app.tsx`.
- `app/trade-app.tsx` is about 40,078 lines after the extraction.
- Kept `ActivePositionCard` responsible for details-open state, EOD
  acknowledgement state/persistence, audit event reading/derivation, close
  callback wiring, orchestrator calls, execution preview state, and handoff
  modal wiring.
- Kept `ClosePositionModal`, close/sell/exit behavior, Supabase/localStorage
  persistence flows, and trade mutation behavior in `app/trade-app.tsx`.

Recommended next action:

**Action 369 — Reassess ActivePositionCard After Details Modal Extraction**

## 45. Action 369 result

Action 369 added
`docs/active-position-card-post-details-modal-reassessment.md`.

Result:

- Reassessed Live Day Trades after details modal extraction.
- Confirmed `ActivePositionCard` is now mostly state/orchestration glue and
  audit derivation.
- Confirmed `ClosePositionModal` remains behavior-heavy and should be planned
  separately before runtime extraction.
- Recommended pausing Live Day Trades and creating a History tab extraction
  plan next.

Recommended next action:

**Action 370 — Create History Tab Extraction Plan**

## 46. Action 370 result

Action 370 added `docs/history-tab-extraction-plan.md`.

Result:

- Planned the next refactor domain after pausing Execution Handoff Modal,
  Recommendations, and Live Day Trades extraction.
- Inventoried the History tab render section, closed trade cards, History v2
  journal controls, recommendation history, discarded setups, recommendation
  decisions, and statistics-adjacent closed-trade detail panels.
- Confirmed `app/trade-app.tsx` is about 40,078 lines.
- Recommended a low-risk History shell extraction before touching closed trade
  card details, timeline/audit derivation, plan-vs-actual review, persistence,
  or app-wide statistics calculations.

Recommended next action:

**Action 371 — Extract History Tab Shell**

## 47. Action 371 result

Action 371 added `components/history/HistoryTab.tsx`.

Result:

- Extracted the outer History tab shell/layout.
- The new component renders the History heading/copy plus slots for the
  statusbar, data-mode banner, optional recommendation outcome runner, hidden
  diagnostics, and existing History section children.
- Kept all History state, filters, sort controls, data construction, refresh
  handlers, closed trade card behavior, PnL/result display, plan-adherence
  review, audit/timeline derivation, persistence, and statistics calculations in
  `app/trade-app.tsx`.

Recommended next action:

**Action 372 — Reassess History Tab After Shell Extraction**

## 48. Action 372 result

Action 372 added `docs/history-tab-post-shell-reassessment.md`.

Result:

- Reassessed the closed trade card boundary after the History shell extraction.
- Confirmed `ClosedPositionCard` still owns local details-open state, card
  display mapping, local audit event reads, timeline/replay derivation,
  execution quality, handoff quality, improvement suggestions, outcome
  explanation, and details modal composition.
- Confirmed plan-vs-actual review construction and hidden review JSON should
  remain in place until a smaller display-mapper boundary exists.
- Recommended extracting a pure closed trade display mapper next.

Recommended next action:

**Action 373 — Extract Closed Trade Display Mapper**

## 49. Action 373 result

Action 373 added `components/history/closed-trade-display-mapper.ts`.

Result:

- Extracted pure closed trade display mapping from `ClosedPositionCard`.
- `ClosedPositionCard` now uses the mapper for outcome label/tone, PnL/R
  display, metric rows, journal-note fallback, data-mode/reality badges, and
  History / Statistics surface notice metadata.
- Kept local details state, audit/timeline derivation, execution/handoff
  quality derivation, improvement suggestions, outcome explanation,
  plan-vs-actual review construction, details modal rendering, filters,
  sorting, persistence, and statistics ownership in `app/trade-app.tsx`.

Recommended next action:

**Action 374 — Reassess ClosedPositionCard After Display Mapper Extraction**

## 50. Action 374 result

Action 374 added
`docs/closed-position-card-post-display-mapper-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after the closed trade display mapper
  extraction.
- Confirmed the mapper now owns pure card display props, while the card still
  owns local details state, modal rendering, audit/timeline derivation,
  execution/handoff quality derivation, improvement suggestions, outcome
  explanation, and plan-vs-actual review display.
- Confirmed full card extraction would be possible but broader than necessary
  for the next step.
- Recommended extracting a presentational closed trade details modal next.

Recommended next action:

**Action 375 — Extract Closed Trade Details Modal Presentational Component**

## 51. Action 375 result

Action 375 added `components/history/ClosedTradeDetailsModal.tsx`.

Result:

- Extracted the closed trade details modal shell/rendering from
  `ClosedPositionCard`.
- The new component owns only the modal wrapper/header/body rendering and close
  event wiring.
- `ClosedPositionCard` still owns details-open state, click/keyboard open
  behavior, PnL/result display derivation, audit/timeline derivation,
  execution/handoff quality derivation, improvement suggestions, outcome
  explanation, plan-vs-actual review construction, details panel nodes,
  filtering/sorting, persistence, and app-wide statistics ownership.

Recommended next action:

**Action 376 — Reassess ClosedPositionCard After Details Modal Extraction**

## 52. Action 376 result

Action 376 added
`docs/closed-position-card-post-details-modal-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after extracting the closed trade details modal
  shell.
- Confirmed `app/trade-app.tsx` is approximately 39,947 lines.
- Confirmed `ClosedPositionCard` still intentionally owns local details state,
  click/keyboard open behavior, PnL/result derivation, plan-vs-actual review
  construction and hidden JSON, audit/timeline derivation, details panel node
  composition, persistence boundaries, and History state.
- Confirmed full card extraction is possible but remains broader than the
  safest next step.
- Recommended extracting the closed trade plan-adherence panel next.

Recommended next action:

**Action 377 — Extract Closed Trade Plan-Adherence Panel**

## 53. Action 377 result

Action 377 added `components/history/ClosedTradePlanAdherencePanel.tsx`.

Result:

- Extracted the closed trade plan-adherence / plan-vs-actual display panel.
- Kept `ClosedPositionCard` responsible for plan-vs-actual derivation, review
  JSON generation, PnL/result derivation, audit/timeline derivation, local
  details state, persistence boundaries, and History state.
- Preserved all visible panel copy, labels, classNames, the warning/deviation
  sections, checks details block, and hidden agent-readable review JSON.

Recommended next action:

**Action 378 — Reassess ClosedPositionCard After Plan-Adherence Panel Extraction**

## 54. Action 378 result

Action 378 added
`docs/closed-position-card-post-plan-adherence-panel-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after plan-adherence rendering was extracted.
- Confirmed `app/trade-app.tsx` is approximately 39,766 lines.
- Confirmed full card extraction remains broader than necessary because the card
  still owns details state, click/keyboard open behavior, PnL/result derivation,
  plan-vs-actual derivation and review JSON, audit/timeline derivation, detail
  panel nodes, and card body/header/action rendering.
- Recommended extracting the closed trade audit/timeline panel next.

Recommended next action:

**Action 379 — Extract Closed Trade Audit Timeline Panel**

## 55. Action 379 result

Action 379 added `components/history/ClosedTradeAuditTimelinePanel.tsx`.

Result:

- Extracted the closed trade audit/timeline disclosure wrapper.
- Kept `ClosedPositionCard` responsible for audit/timeline derivation, rendered
  audit child panels, plan-vs-actual derivation, PnL/result logic, local details
  state, persistence boundaries, and History state.
- Preserved the existing `Audit details` copy, nested panel order, classNames,
  and incomplete-data note.

Recommended next action:

**Action 380 — Reassess ClosedPositionCard After Audit Timeline Panel Extraction**

## 56. Action 380 result

Action 380 added
`docs/closed-position-card-post-audit-timeline-panel-reassessment.md`.

Result:

- Reassessed `ClosedPositionCard` after the audit/timeline wrapper extraction.
- Confirmed `app/trade-app.tsx` is approximately 39,758 lines.
- Confirmed History extraction is complete enough to pause: remaining card code
  owns local details state, click/keyboard open behavior, derivation, child-node
  composition, persistence boundaries, and History state.
- Recommended moving to Statistics/Dashboard planning next.

Recommended next action:

**Action 381 — Create Statistics/Dashboard Extraction Plan**

## 57. Action 381 result

Action 381 added `docs/statistics-dashboard-extraction-plan.md`.

Result:

- Planned Statistics/Dashboard extraction after pausing History.
- Confirmed `StatisticsDashboardPanel` starts around `app/trade-app.tsx:17483`
  and the Statistics tab render starts around `app/trade-app.tsx:14851`.
- Documented major Statistics responsibilities: realized PnL/R, win/loss
  metrics, profit factor, plan adherence, recommendation analytics, charts,
  recent trade context, open-position context, partial close summary, and period
  risk.
- Recommended extracting a Statistics dashboard shell while keeping calculations,
  selected range state, dashboard construction, JSON generation, persistence,
  and cross-tab state in `app/trade-app.tsx`.

Recommended next action:

**Action 382 — Extract Statistics Dashboard Shell**

## 58. Action 382 result

Action 382 added `components/statistics/StatisticsDashboard.tsx`.

Result:

- Extracted the presentational Statistics dashboard shell.
- `app/trade-app.tsx` still owns selected range state, calculations, dashboard
  construction, recommendation analytics construction, JSON generation,
  persistence, cross-tab state, and all Statistics body panel composition.
- Preserved Statistics shell copy, range controls, loading state, range summary,
  status pill, classNames, and behavior.

Recommended next action:

**Action 383 — Reassess Statistics Dashboard After Shell Extraction**

## 59. Action 383 result

Action 383 added `docs/statistics-dashboard-post-shell-reassessment.md`.

Current Statistics/Dashboard boundary:

- `components/statistics/StatisticsDashboard.tsx` owns the shell/header,
  range-control rendering, range summary, loading empty state, and outer body
  slot.
- `app/trade-app.tsx` still owns metric calculations, PnL/result logic,
  profit-factor/win-rate logic, plan-adherence logic, filtering/time-range
  state, persistence, and the dashboard body panels.

Recommended next action:

**Action 384 - Extract Statistics Metric Card Presentational Component**

## 60. Action 384 result

Action 384 added `components/statistics/StatisticsMetricCard.tsx`.

Current Statistics/Dashboard boundary:

- `StatisticsMetricCard` owns the reusable metric card wrapper, value/label
  markup, classNames, and tone styling.
- `SummaryCard` remains in `app/trade-app.tsx` as a compatibility wrapper around
  the extracted component.
- `app/trade-app.tsx` still owns all metric calculations, formatted display
  values, PnL/result logic, profit-factor/win-rate logic, plan-adherence logic,
  time-range state, persistence, and dashboard body panel composition.

Recommended next action:

**Action 385 - Reassess Statistics Dashboard After Metric Card Extraction**

## 61. Action 385 result

Action 385 added `docs/statistics-dashboard-post-metric-card-reassessment.md`.

Current Statistics/Dashboard boundary:

- `StatisticsDashboard` owns the shell and range-control rendering.
- `StatisticsMetricCard` owns reusable card markup and tone styling.
- `SummaryCard` remains local as a compatibility wrapper.
- `app/trade-app.tsx` still owns the metric grid composition, formatted display
  values, calculations, plan-adherence derivation, recommendation analytics,
  chart panels, persistence, and cross-tab integration.

Recommended next action:

**Action 386 - Extract Statistics Summary Grid**

## 62. Action 386 result

Action 386 added `components/statistics/StatisticsSummaryGrid.tsx`.

Current Statistics/Dashboard boundary:

- `StatisticsDashboard` owns the shell and range-control rendering.
- `StatisticsMetricCard` owns reusable card markup and tone styling.
- `StatisticsSummaryGrid` owns the repeated metric-grid wrapper for the current
  five-column and six-column Statistics summary grids.
- `SummaryCard` remains local as a compatibility wrapper.
- `app/trade-app.tsx` still owns card labels, formatted values, calculations,
  plan-adherence derivation, recommendation analytics, chart panels,
  persistence, and cross-tab integration.

Recommended next action:

**Action 387 - Reassess Statistics Dashboard After Summary Grid Extraction**

## 63. Action 387 result

Action 387 added `docs/statistics-dashboard-post-summary-grid-reassessment.md`.

Current Statistics/Dashboard boundary:

- `StatisticsDashboard`, `StatisticsMetricCard`, and `StatisticsSummaryGrid`
  are extracted.
- `SummaryCard` remains local as a compatibility wrapper.
- `app/trade-app.tsx` still owns calculation-adjacent Statistics body panels,
  recommendation analytics readbacks, plan-adherence derivation, chart
  derivation, persistence, and cross-tab integration.

Assessment:

- Statistics extraction is complete enough to pause.
- The next higher-value step is a full `trade-app.tsx` reassessment after the
  major UI extraction sequence.

Recommended next action:

**Action 388 - Reassess trade-app.tsx After Major UI Extraction Work**

## 64. Action 388 result

Action 388 added `docs/trade-app-post-major-ui-extraction-reassessment.md`.

Result:

- Reassessed `app/trade-app.tsx` after major UI extraction work across
  Execution Handoff, Recommendations, Live Day Trades, History, and Statistics.
- Confirmed the file is approximately 39,692 lines.
- Confirmed remaining high-risk ownership is concentrated in app-wide
  state/effects, Supabase/persistence, execution/handoff/orchestrator wiring,
  trade mutations, statistics/calculation logic, and data construction/filtering.
- Recommended the next strategic phase: app-wide state/effects extraction
  planning.

Recommended next action:

**Action 389 - Create App State/Effects Extraction Plan**

## 65. Action 389 result

Action 389 added `docs/app-state-effects-extraction-plan.md`.

Current state/effects boundary:

- UI extraction is paused across Execution Handoff, Recommendations, Live Day
  Trades, History, and Statistics.
- `app/trade-app.tsx` still owns app-wide state, refs, effects, refresh
  orchestration, Supabase/localStorage behavior, calculations, trade mutations,
  and execution/handoff wiring.
- The new plan ranks navigation/tab state and Statistics range state as the
  safest possible first hooks, while keeping persistence, execution,
  calculations, and trade mutation flows parent-owned.

Recommended next action:

**Action 390 - Reassess Navigation/Tab State Hook Boundary**

## 66. Action 390 result

Action 390 added `docs/navigation-tab-state-hook-boundary-reassessment.md`.

Navigation boundary result:

- `activeTab` is isolated enough for a tiny custom hook.
- tab constants, labels, nav rendering, refresh helpers/effects, URL behavior,
  persistence, modals, execution state, and trade mutation flows remain
  parent-owned.
- The recommended hook path is
  `hooks/trade-app/useTradeAppNavigationState.ts`.

Recommended next action:

**Action 391 - Extract Navigation/Tab State Hook**

## 67. Action 391 result

Action 391 added `hooks/trade-app/useTradeAppNavigationState.ts`.

Current state boundary:

- `activeTab` is now owned by `useTradeAppNavigationState`.
- The hook exposes the same setter shape used by existing tab buttons and
  post-action tab switches.
- `app/trade-app.tsx` still owns nav rendering, tab labels, refresh
  helpers/effects, all domain state, persistence, calculations, modals,
  execution/handoff wiring, and trade mutation flows.

Recommended next action:

**Action 392 - Reassess Navigation/Tab State Hook Extraction**

## 68. Action 392 result

Action 392 added
`docs/navigation-tab-state-hook-post-extraction-reassessment.md`.

Navigation hook assessment:

- `useTradeAppNavigationState` is correctly scoped to active tab state.
- `app/trade-app.tsx` still owns nav rendering, tab labels, refresh
  orchestration, effects, persistence, modals, calculations, domain state,
  execution/handoff wiring, and trade mutations.
- The next safe state/effects boundary should be reassessed before runtime
  changes.

Recommended next action:

**Action 393 - Reassess Statistics Range State Hook Boundary**

## 69. Action 393 result

Action 393 added `docs/statistics-range-state-hook-boundary-reassessment.md`.

Statistics range boundary result:

- `selectedStatisticsRange` is isolated as UI state and has no persistence or
  URL coupling.
- the selected range feeds several calculation builders, so calculations and
  data construction remain parent-owned.
- the recommended hook path is
  `hooks/trade-app/useStatisticsRangeState.ts`.

Recommended next action:

**Action 394 - Extract Statistics Range State Hook**

## 70. Action 394 result

Action 394 added `hooks/trade-app/useStatisticsRangeState.ts`.

Current state boundary:

- `selectedStatisticsRange` is now owned by `useStatisticsRangeState`.
- the hook exposes the same setter shape used by `StatisticsDashboardPanel`.
- `app/trade-app.tsx` still owns range options, range-driven calculations,
  recommendation analytics, dashboard rendering, persistence, cross-tab data,
  execution/handoff wiring, and trade mutation flows.

Recommended next action:

**Action 395 - Reassess Statistics Range State Hook Extraction**

## 71. Action 395 result

Action 395 added
`docs/statistics-range-state-hook-post-extraction-reassessment.md`.

Statistics range assessment:

- `useStatisticsRangeState` is correctly scoped to selected range state and its
  setter.
- `app/trade-app.tsx` still owns range options, dashboard rendering, metric
  calculations, recommendation analytics, persistence, cross-tab data, and
  execution/handoff wiring.
- Modal UI state is the next boundary to reassess because it is higher payoff
  but more coupled.

Recommended next action:

**Action 396 - Reassess Modal UI State Hook Boundary**

## 72. Action 396 result

Action 396 added `docs/modal-ui-state-hook-boundary-reassessment.md`.

Modal boundary result:

- no safe generic modal hook boundary was found.
- app-owned ADD TRADE and close-position modal state remains coupled to selected
  entities, validation, form defaults, saving, persistence, and trade mutation
  behavior.
- local details/discard modal state remains local to extracted card/detail
  components.

Recommended next action:

**Action 397 - Reassess Recommendation UI State Hook Boundary**

## 73. Action 397 result

Action 397 added
`docs/recommendation-ui-state-hook-boundary-reassessment.md`.

Recommendation UI state boundary result:

- no safe Recommendation UI hook boundary was found.
- card-local details/discard state is already owned by
  `RecommendationCardContainer`.
- remaining parent-owned Recommendation state stays in `app/trade-app.tsx`
  because it is coupled to data construction, history filters, ADD TRADE
  validation, selected TradeModal state, discard persistence,
  Supabase/localStorage behavior, diagnostics, and execution handoff entry
  points.

Recommended next action:

**Action 398 - Reassess History UI State Hook Boundary**

## 74. Action 398 result

Action 398 added `docs/history-ui-state-hook-boundary-reassessment.md`.

History UI state boundary result:

- no broad `useHistoryUiState` hook should be extracted now.
- `ClosedPositionCard` detail-open state is already local.
- History filter/sort state remains parent-owned because it feeds dashboard
  construction, visible counts, card ordering, empty states, and e2e-visible
  labels.
- PnL/result derivation, plan-vs-actual review, audit/timeline derivation,
  persistence, Statistics integration, and execution/audit integration remain
  in `app/trade-app.tsx`.

Recommended next action:

**Action 399 - Reassess Live Day Trade UI State Hook Boundary**

## 75. Action 399 result

Action 399 added
`docs/live-day-trade-ui-state-hook-boundary-reassessment.md`.

Live Day Trade UI state boundary result:

- no `useActivePositionCardUiState` hook should be extracted now.
- details-open and execution-preview-open state remains card-local.
- EOD acknowledgement remains card-owned because it reads/writes localStorage.
- close/sell handlers, selected close-position state, execution preview
  orchestration, `ExecutionHandoffPreviewModal` wiring, active position
  monitoring, Supabase/localStorage behavior, and trade mutation flows remain
  parent/card-owned.

Recommended next action:

**Action 400 - Create Persistence Boundary Plan**

## 76. Action 400 result

Action 400 added `docs/persistence-boundary-plan.md`.

Persistence boundary result:

- inventoried localStorage keys, demo storage, Supabase read/write flows,
  recommendation learning persistence, audit/event logs, execution metadata,
  and trade mutation persistence.
- classified key constants and UI/dev preferences as lowest risk.
- classified trade add/close mutations, Supabase writes, execution metadata,
  audit records, and idempotency-sensitive paths as high risk.
- recommended reassessing localStorage key constants before any runtime
  persistence extraction.

Recommended next action:

**Action 401 - Reassess localStorage Key Constants Boundary**

## 77. Action 401 result

Action 401 added
`docs/local-storage-key-constants-boundary-reassessment.md`.

localStorage key constants boundary result:

- inventoried app-inline keys, existing helper-module key constants,
  recommendation-learning persistence keys, execution/audit stores, diagnostics
  keys, demo keys, and the dynamic EOD acknowledgement key.
- classified UI/dev preference keys as safest for constants-only extraction.
- classified trade state, EOD acknowledgement, audit/event logs, execution
  records, and recommendation-learning keys as higher risk.
- recommended centralizing exact static constants only, with no helper
  extraction, key rename, migration, read/write movement, Supabase movement, or
  execution/trade persistence movement.

Recommended next action:

**Action 402 - Extract localStorage Key Constants**

## 78. Action 402 result

Action 402 created `lib/persistence/local-storage-keys.ts`.

localStorage key constants extraction result:

- centralized exact static constants for demo storage, latest mock broker fill,
  dismissed warnings, live market trial runbook, provider plan mode, dev
  preview visibility, and trade management events.
- updated `app/trade-app.tsx` to import constants while keeping existing
  helper functions and persistence behavior in place.
- updated `lib/execution-timeline.ts` to read the same
  `trade-management-events` key constant.
- left dynamic EOD acknowledgement key generation, recommendation-learning
  keys, execution store keys, Supabase behavior, trade mutations, migrations,
  and read/write wrappers untouched.

Recommended next action:

**Action 403 - Reassess localStorage Key Constants Extraction**

## 79. Action 403 result

Action 403 added
`docs/local-storage-key-constants-post-extraction-reassessment.md`.

localStorage key constants post-extraction result:

- verified the constants module exports exact static key constants only.
- confirmed no localStorage access, helper extraction, dynamic key builder,
  migration, default value, Supabase behavior, trade mutation behavior, or
  execution/orchestrator persistence moved.
- confirmed dynamic EOD acknowledgement remains in `app/trade-app.tsx`.
- documented Action 402 e2e as blocked by sandbox/Chromium permissions before
  app test logic.

Recommended next action:

**Action 404 - Reassess EOD Acknowledgement Persistence Wrapper**

## 80. Action 404 result

Action 404 added
`docs/eod-acknowledgement-persistence-wrapper-reassessment.md`.

EOD acknowledgement persistence boundary result:

- inventoried the dynamic key builder, read helper, write helper, card-local
  state initialization, acknowledgement handler, and details modal/panel wiring.
- confirmed the key format is `eod_acknowledged_${positionId}_${date}`.
- concluded a tiny persistence wrapper is safe if the runtime action preserves
  exact key format, defaults, localStorage guards, write/remove semantics, and
  swallowed errors.
- confirmed EOD safety calculation, acknowledgement UI state, close/sell
  behavior, active position monitoring, Supabase behavior, and execution
  behavior remain app/card-owned.

Recommended next action:

**Action 405 - Extract EOD Acknowledgement Persistence Wrapper**

## 81. Action 405 result

Action 405 created
`lib/persistence/eod-acknowledgement-persistence.ts`.

EOD acknowledgement persistence wrapper extraction result:

- extracted `buildEndOfDayAcknowledgementKey`,
  `readEndOfDayAcknowledgement`, and `writeEndOfDayAcknowledgement`.
- preserved `eod_acknowledged_${positionId}_${date}`, `"true"` writes,
  remove-on-false behavior, `false` fallback, server no-op behavior, and
  swallowed localStorage errors.
- updated `app/trade-app.tsx` to import the read/write helpers.
- left `ActivePositionCard` UI state, EOD safety calculation, close/sell
  behavior, active position monitoring, Supabase behavior, trade mutations, and
  execution behavior parent/card-owned.

Recommended next action:

**Action 406 - Reassess EOD Acknowledgement Persistence Wrapper Extraction**

## 82. Action 406 result

Action 406 added
`docs/eod-acknowledgement-persistence-post-extraction-reassessment.md`.

EOD acknowledgement persistence post-extraction result:

- verified the wrapper API and `app/trade-app.tsx` call sites.
- confirmed dynamic key format, `"true"` storage value, `false` fallback,
  server/no-window behavior, remove-on-false behavior, and swallowed
  localStorage errors remain unchanged.
- confirmed EOD UI state, acknowledgement handler wiring, EOD safety
  calculation, close/sell behavior, Supabase behavior, trade mutations, and
  execution/handoff behavior remain app/card-owned.
- documented Action 405 e2e as sandbox-blocked before app test logic.

Recommended next action:

**Action 407 - Reassess Recommendation Discard Persistence Wrapper**

## 83. Action 407 result

Action 407 added
`docs/recommendation-discard-persistence-wrapper-reassessment.md`.

Recommendation discard persistence boundary result:

- confirmed no dedicated confirm-discard localStorage read/write helper exists.
- confirmed `updateRecommendationStatus(...)` remains the app-owned discard
  persistence path.
- confirmed discard writes are Supabase recommendation status/metadata updates
  plus local recommendation state mutation.
- confirmed discard modal UI state is already component-local in
  `RecommendationCardContainer`.
- confirmed recommendation-learning localStorage stores are adjacent and should
  not be moved as part of discard confirmation persistence.

Recommended next action:

**Action 408 - Reassess Dev/Diagnostics localStorage Wrapper**

## 84. Action 408 result

Action 408 added
`docs/dev-diagnostics-local-storage-wrapper-reassessment.md`.

Dev/diagnostics localStorage boundary result:

- inventoried app-local dev/preference storage helpers and existing diagnostics
  store modules.
- confirmed dismissed warnings, dev-preview visibility, provider plan hint,
  live market trial runbook, and mock broker latest fill access are the safest
  next wrapper candidates.
- confirmed UI state, effect guards, bridge calls, execution record/event
  stores, Avanza agent run stores, Supabase behavior, and trade mutations
  should remain parent/module-owned.

Recommended next action:

**Action 409 - Extract Dev/Diagnostics localStorage Wrapper**

## 85. Action 409 result

Action 409 created
`lib/persistence/dev-diagnostics-local-storage.ts`.

Dev/diagnostics wrapper extraction result:

- moved exact provider plan mode, dev-preview visibility, dismissed warnings,
  and latest mock broker fill localStorage helpers out of `app/trade-app.tsx`.
- preserved key strings, defaults, data shapes, error handling, and existing
  caller-owned UI state/effect guard behavior.
- left live market trial runbook persistence inline.
- left diagnostics stores, execution audit/event stores, execution record
  stores, Supabase behavior, trade mutations, and execution/orchestrator
  behavior untouched.

Recommended next action:

**Action 410 - Reassess Dev/Diagnostics localStorage Wrapper Extraction**

## 86. Action 410 result

Action 410 added
`docs/dev-diagnostics-local-storage-post-extraction-reassessment.md`.

Dev/diagnostics wrapper post-extraction result:

- verified exported API, keys, read/write/remove behavior, defaults, and
  call sites.
- confirmed diagnostics stores, execution audit/event stores, execution record
  stores, live market trial runbook persistence, Supabase behavior, trade
  mutations, and execution/orchestrator behavior remain untouched.
- documented Action 409 checks and escalated e2e success.

Recommended next action:

**Action 411 - Reassess Live Market Trial Runbook Persistence Wrapper**

## 87. Action 411 result

Action 411 created
`docs/live-market-trial-runbook-persistence-wrapper-reassessment.md`.

Live market trial runbook persistence reassessment result:

- inventoried the runbook storage key, typed state shape, default behavior,
  normalization behavior, read/write behavior, error handling, and call sites.
- confirmed the key remains `trade-live-market-trial-runbook-v1`.
- confirmed wrapper extraction is safe next only if it preserves the exact
  typed/default, normalization, server/no-window fallback, swallowed-error, and
  JSON write behavior.
- confirmed runbook UI state, hydration/write-effect guards, live market
  workflow, provider/data behavior, Supabase behavior, trade mutations, and
  execution/orchestrator behavior remain app-owned.

Recommended next action:

**Action 412 - Extract Live Market Trial Runbook Persistence Wrapper**

## 88. Action 412 result

Action 412 created
`lib/persistence/live-market-trial-runbook-persistence.ts`.

Live market trial runbook wrapper extraction result:

- moved the exact default builder, mode/outcome normalizers, state normalizer,
  read helper, and write helper out of `app/trade-app.tsx`.
- preserved the `trade-live-market-trial-runbook-v1` key, typed state shape,
  defaults, normalization, read fallback behavior, write behavior,
  server/no-window behavior, and swallowed localStorage errors.
- kept runbook UI state, hydration/write-effect guards, UI callbacks, live
  market workflow, provider/data behavior, Supabase behavior, trade mutations,
  and execution/orchestrator behavior app-owned.

Checks:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- escalated `npm run test:e2e` passed: 64 tests after the default sandbox run
  was blocked on port binding.

Recommended next action:

**Action 413 - Reassess Live Market Trial Runbook Persistence Wrapper Extraction**

## 89. Action 413 result

Action 413 created
`docs/live-market-trial-runbook-persistence-post-extraction-reassessment.md`.

Live market trial runbook post-extraction result:

- verified the extracted wrapper preserves key, type shape, defaults,
  normalization, read fallback, JSON write behavior, no-window behavior, and
  swallowed localStorage errors.
- confirmed `app/trade-app.tsx` still owns runbook UI state,
  hydration/write-effect guards, callbacks, live market workflow,
  provider/data behavior, Supabase behavior, trade mutations, and
  execution/orchestrator behavior.
- documented Action 412 checks, including escalated e2e success.

Recommended next action:

**Action 414 - Reassess Execution Audit/Event Log Persistence Boundary**

## 90. Action 414 result

Action 414 created
`docs/execution-audit-event-log-persistence-boundary-reassessment.md`.

Execution audit/event log persistence reassessment result:

- inventoried legacy `trade-management-events` appends, timeline readback,
  typed execution event log storage, and execution audit persistence
  contract/route/writer/Supabase modules.
- concluded audit/event wrapper extraction should wait.
- confirmed append behavior, event shape, timeline derivation, History audit
  display, Supabase audit writes, execution metadata writes, broker/result
  persistence, execution record persistence, and trade mutations should not
  move yet.

Recommended next action:

**Action 415 - Reassess Execution Record Creation Boundary**

## 91. Action 415 result

Action 415 created
`docs/execution-record-creation-boundary-reassessment.md`.

Execution record creation reassessment result:

- inventoried current broker-result eligibility/preview, execution-record
  eligibility, local/dev execution-record store, mock/stub local creation
  paths, server capture stubs, and audit/event modules.
- clarified that local/dev `TureExecutionRecord` creation exists, but no
  production-safe real execution record creation boundary exists yet.
- identified missing canonical contract, idempotency rules, persistence target,
  Supabase schema assumptions, duplicate protection, audit append strategy,
  rollback/error behavior, UI confirmation/readback behavior, and tests.

Recommended next action:

**Action 416 - Create Execution Record Creation Contract Design**
