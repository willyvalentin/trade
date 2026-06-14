# trade-app.tsx Post-Composition Extraction Reassessment

## 1. Purpose

This reassessment records the state of `app/trade-app.tsx` after Action 340
extracted `ExecutionHandoffModalComposition`.

Actions 317-340 decomposed most of the Execution Handoff Preview Modal into
presentational components, pure mappers, and focused state hooks. The goal now
is to decide whether modal decomposition should pause and identify the safest
high-payoff app-wide refactor target.

This action is documentation-only. It does not change runtime behavior.

## 2. Current File Inventory

Approximate current size:

- `app/trade-app.tsx`: 42,074 lines

Extracted handoff modal components:

- `ExecutionHandoffModalShell`
- `ExecutionHandoffModalComposition`
- `HandoffCoreSummary`
- `FutureAgentRequestPreview`
- `AvanzaDryRunRequestPreview`
- `BridgeRequestEnvelopePreview`
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
- `ExecutionSandboxQaPanel`
- `AgentProgressStubPanel`
- `ExecutionLifecycleStatusPanel`
- `ExecutionBrokerCaptureStubPanel`
- `ExecutionHandoffStatusReadbacks`

Extracted handoff modal helpers and hooks:

- shared display helpers in `components/execution/handoff-modal-shared.tsx`
- pure readiness/data mappers in `lib/handoff-modal-data-mappers.ts`
- `useLocalhostBridgeControlsState`
- `useEarlyPhasePreviewState`
- `useMiddlePhasePreviewState`
- `useLatePhasePreviewState`
- `useAvanzaReadinessState`

Remaining parent responsibilities:

- modal visibility integration from live execution status
- selected execution intent and handoff payload ownership
- dry-run request construction
- future-agent request and bridge envelope construction
- hook composition and result chaining
- local lifecycle, preparation, capture, and progress stub state
- lifecycle transition and audit append handlers
- broker capture stub result construction
- prop assembly for the composition component
- app-wide recommendation, position, history, statistics, settings, refresh,
  localStorage, and persistence-adjacent state

## 3. Handoff Modal Status

What is now extracted:

- modal shell/layout
- modal body composition
- core handoff summary
- future-agent request preview
- Avanza dry-run request preview
- bridge envelope preview
- readiness panel
- localhost bridge controls
- all phase stub preview rendering
- sandbox QA/progress display
- lifecycle/status display
- broker capture stub display
- final readback/footer display
- pure readiness row assembly
- localhost bridge, early phase, middle phase, late phase, and readiness state
  hooks

What remains in the parent:

- selected intent/handoff extraction from the orchestrator result
- Escape-key close effect
- local lifecycle/capture/progress stub state
- request preview creation and validation status derivation
- bridge envelope preview creation and validation status derivation
- hook calls for all extracted modal state clusters
- preparation stub handler
- capture stub handler
- agent progress stub handler
- audit event append calls
- broker capture result construction
- grouped prop assembly for `ExecutionHandoffModalComposition`

This remaining ownership is intentional for now. It keeps all stateful and
side-effect-adjacent logic in `app/trade-app.tsx`, while the extracted
components stay rendering-only.

Modal decomposition is complete enough to pause. Additional modal-only cleanup
would mostly move prop assembly or selected request construction, which carries
more hook-order and behavior risk than the likely payoff. The better next phase
is app-wide tab extraction, starting with a plan for the Recommendations tab.

## 4. Remaining Large App-Wide Domains

Recommendations tab / recommendation cards:

- top-level Recommendations tab rendering
- status bar and empty-state selection
- recommendation grid/card props
- add-trade entry points
- discard/update callbacks
- recommendation-card details and local modal behavior

Live Day Trades tab / live cards:

- active position grid
- position urgency and risk-control props
- execution preview entry point
- close-position modal entry point
- live position update polling integration

History / closed trades:

- History tab sections
- closed trade cards
- journal controls and filters
- recommendation history panels
- outcome and explanation readbacks

Statistics/dashboard sections:

- Stats Today and Statistics tab dashboards
- performance panels
- charts
- calibration and recommendation performance summaries
- period risk and partial-close statistics

Settings/diagnostics sections:

- Market diagnostics
- scan quality and scan history panels
- settings/navigation glue
- local diagnostics viewers that are already separated on Settings pages

LocalStorage/app-wide effects:

- execution mode preference
- paper session protocol
- provider hints
- demo/dev recommendation visibility
- stored recommendation snapshots, scan runs, batches, and outcomes
- local demo trade data

Trade action handlers:

- add-trade flow
- create/update/close trade flows
- partial-fill handling
- local demo/mock storage handlers
- Supabase-backed persistence and fallback handling

## 5. Candidate Next Refactor Targets

A. Extract Recommendations tab components

- Highest payoff with a clear visible boundary.
- The tab rendering and recommendation card/grid wiring are large enough to
  justify extraction.
- Safer as a planned extraction first because the tab touches app-wide state,
  add-trade entry points, discard callbacks, and card-level details behavior.

B. Extract Live Day Trades tab components

- High payoff, but more behavior-sensitive than Recommendations.
- It touches active positions, risk controls, close-position entry, urgency
  readbacks, and execution preview entry.

C. Extract History / Closed Trades tab components

- High line-count payoff.
- More sprawling because it includes journal filters, recommendation history,
  closed trade cards, and explanation/quality readbacks.

D. Extract Statistics / Dashboard sections

- High payoff but broad.
- Many panels are already function-level components in the file; moving them
  out should happen in a separate statistics-focused action.

E. Extract app-wide state hooks later

- Highest risk.
- Should wait until tab rendering boundaries are cleaner because state hooks
  touch refresh cadence, localStorage, Supabase reads/writes, and cross-tab
  effects.

F. Continue modal-only cleanup if necessary

- Lower payoff now.
- Remaining modal code is mostly parent-owned coordination and prop assembly.
- Continue only if a specific lint, test, or maintainability blocker appears.

## 6. Recommended Next Action

Recommended:

**Action 342 - Create Recommendations Tab Extraction Plan**

Reasoning:

- The handoff modal decomposition is complete enough to pause.
- Recommendations tab extraction has the best combination of payoff and a
  recognizable UI boundary.
- A plan-first action is safer than immediately extracting the tab because the
  Recommendations surface includes card interactions, add-trade entry points,
  discard callbacks, local/demo recommendation visibility, and several derived
  diagnostics.
- A good plan should identify which subcomponents can be presentational and
  which state/handlers must remain in `TradeApp`.

## 7. Risk Assessment

Prop drilling:

- The Recommendations tab will need recommendation lists, empty states, loading
  status, discard handlers, add-trade handlers, dev/demo labels, and sizing
  helpers.
- Grouped props should be preferred over moving state.

App-wide state coupling:

- Recommendations connect to settings, risk controls, snapshots, scan
  diagnostics, local demo data, and active trade creation.
- Extract rendering before extracting state.

Card interaction behavior:

- `RecommendationCard` owns details/discard UI behavior and should not be
  altered casually.
- A tab component should preserve existing card props and callbacks exactly.

E2E coverage:

- Existing e2e focuses heavily on execution sandbox and modal safety.
- Recommendations tab extraction should rely on existing main UI coverage and
  may need targeted smoke coverage if any visible wiring changes.

LocalStorage side effects:

- Demo/dev recommendation visibility and recommendation persistence readbacks
  should stay in the parent until a dedicated state plan exists.

Preserving visible design/copy:

- Recommendation empty states, status bars, card labels, button text, and
  diagnostics readbacks should remain unchanged.

## 8. Verification

Action 341 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 342 Follow-Up

Action 342 added `docs/recommendations-tab-extraction-plan.md`.

Planning result:

- The Recommendations tab is the next high-payoff app-wide boundary after the
  handoff modal decomposition pause.
- The primary Recommendations tab currently has no dedicated filter/sort/search
  controls; visible cards come from parent-owned `dailyRecommendations`.
- ADD TRADE validation, selected recommendation state, `TradeModal`, discard
  persistence, Supabase writes, localStorage/demo recommendation behavior, and
  cross-tab diagnostics should remain in `app/trade-app.tsx` initially.
- The safest first runtime extraction is a presentational tab shell that moves
  status bar, learning banner, loading/empty state, and grid shell rendering
  only.

Next recommended action:

**Action 343 - Extract Recommendations Tab Shell**

## 10. Action 343 Follow-Up

Action 343 added `components/recommendations/RecommendationsTab.tsx`.

Extraction result:

- The Recommendations tab shell is now presentational and owns only the section
  wrapper, statusbar placement, learning-mode banner placement, recommendation
  grid wrapper, loading state, and dominant empty state.
- `app/trade-app.tsx` still owns recommendation data/state,
  `dailyRecommendations`, statusbar construction, card construction, ADD TRADE
  validation, selected recommendation state, `TradeModal`, discard persistence,
  localStorage/demo behavior, Supabase writes, and cross-tab diagnostics.
- Recommendation card internals and details/discard modal behavior remain
  inline for now.

Next recommended action:

**Action 344 - Extract Recommendation Card Presentational Component**

## 11. Action 344 Follow-Up

Action 344 added
`docs/recommendations-tab-post-shell-reassessment.md`.

Assessment result:

- Confirmed `RecommendationCard`, `RecommendationDetailsModal`, and
  `DiscardRecommendationModal` remain local in `app/trade-app.tsx` after the
  Recommendations tab shell extraction.
- Documented the current card structure: source badge, company header,
  confidence pill, metrics grid, guidance copy, ADD TRADE/Discard actions,
  discard confirmation, and details modal.
- Confirmed ADD TRADE validation, selected `TradeModal`, discard persistence,
  Supabase/localStorage behavior, and execution handoff behavior should remain
  in the parent during the first card extraction.
- Recommended a move-only `RecommendationCard` component extraction as the next
  safe runtime refactor.

Next recommended action:

**Action 345 - Extract Recommendation Card Presentational Component**

## 12. Action 345 Follow-Up

Action 345 added `components/recommendations/RecommendationCard.tsx`.

Extraction result:

- The visual recommendation card shell is now extracted as a presentational
  component.
- `app/trade-app.tsx` still owns the local `RecommendationCardContainer`,
  details/discard UI state, details modal, discard modal, parent callbacks, data
  derivation, ADD TRADE validation, selected `TradeModal`, Supabase/localStorage
  behavior, and execution handoff behavior.
- `app/trade-app.tsx` is approximately 42,010 lines after this extraction.

Next recommended action:

**Action 346 - Reassess Recommendation Card After Extraction**

## 13. Action 346 Follow-Up

Action 346 added
`docs/recommendation-card-post-extraction-reassessment.md`.

Assessment result:

- Reassessed the Recommendations card boundary after Action 345.
- Confirmed the extracted card shell is compact and should not be split further
  before larger inline modal pieces are addressed.
- Documented that `RecommendationCardContainer`, details/discard UI state,
  `RecommendationDetailsModal`, and `DiscardRecommendationModal` remain in
  `app/trade-app.tsx`.
- Recommended extracting recommendation details/discard modal components next,
  while keeping parent state, validation, persistence, and execution behavior in
  place.

Next recommended action:

**Action 347 - Extract Recommendation Details/Discard Modal Components**

## 14. Action 348 Follow-Up

Action 348 added
`docs/recommendations-area-post-modal-extraction-reassessment.md`.

Assessment result:

- Reassessed Recommendations after `DiscardRecommendationModal` extraction.
- Confirmed the large remaining inline recommendation area is
  `RecommendationDetailsModal` plus its helper cluster.
- Recommended extracting details modal display helpers/mappers first, then
  reassessing full details modal extraction.

Next recommended action:

**Action 349 - Extract Recommendation Details Modal Display Helpers**

## 15. Action 349 Follow-Up

Action 349 added
`components/recommendations/recommendation-details-display-helpers.ts`.

Extraction result:

- Extracted pure recommendation details display helpers: value formatting,
  currency/share formatting, tone mapping, and tone class-name derivation.
- Kept `RecommendationDetailsModal` and JSX render helpers inline.
- Kept `RecommendationCardContainer`, details/discard state, ADD TRADE
  validation, selected `TradeModal`, discard persistence, Supabase/localStorage
  behavior, data construction, and execution handoff behavior parent-owned.
- `app/trade-app.tsx` is approximately 41,860 lines after this extraction.

Next recommended action:

**Action 350 - Reassess Recommendation Details Modal After Helper Extraction**
## Action 356 Update

Action 356 added
`docs/recommendations-area-post-container-extraction-reassessment.md`.

Current recommendation-area status:

- Recommendations presentation extraction is complete enough to pause.
- Extracted pieces include `RecommendationsTab`, `RecommendationCardContainer`,
  `RecommendationCard`, `RecommendationDetailsModal`,
  `DiscardRecommendationModal`, recommendation card display mapping, and
  details display helpers.
- Parent ownership remains intentional for recommendation data construction,
  ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, execution handoff behavior, and shared
  identity/source-badge render slots.
- Next recommended refactor phase is Live Day Trades planning.

## Action 357 Update

Action 357 added `docs/live-day-trades-tab-extraction-plan.md`.

Current Live Day Trades planning status:

- The safest first runtime extraction is the Live Day Trades tab shell.
- The shell extraction should mirror the Recommendations tab shell approach:
  parent-owned data and rendered card nodes, child-owned layout.
- `ActivePositionCard`, `LiveTradeDetailsModal`, `ClosePositionModal`,
  execution preview creation, sell/exit payload construction, EOD
  acknowledgement, Supabase/localStorage behavior, and close persistence should
  remain in `app/trade-app.tsx` during Action 358.

## Action 370 Update

Action 370 added `docs/history-tab-extraction-plan.md`.

Current History planning status:

- Execution Handoff Modal, Recommendations, and Live Day Trades extraction are
  complete enough to pause.
- The next high-payoff refactor area is the History tab / closed trade card
  area.
- The first recommended runtime extraction is a `HistoryTab` shell that keeps
  History filters, refresh handlers, data construction, closed card behavior,
  persistence, and statistics-adjacent calculations in `app/trade-app.tsx`.

Next recommended action:

**Action 371 - Extract History Tab Shell**

## Action 381 Update

Action 381 added `docs/statistics-dashboard-extraction-plan.md`.

Current Statistics/Dashboard planning status:

- Execution Handoff Modal, Recommendations, Live Day Trades, and History
  extraction are complete enough to pause.
- The next high-payoff refactor area is the Statistics/Dashboard surface.
- The safest first runtime extraction is a Statistics dashboard shell.
- Statistics calculations, selected range state, dashboard construction,
  recommendation analytics construction, hidden JSON generation, persistence,
  localStorage/Supabase behavior, and cross-tab state should remain in
  `app/trade-app.tsx` during the first runtime extraction.

Next recommended action:

**Action 382 - Extract Statistics Dashboard Shell**
