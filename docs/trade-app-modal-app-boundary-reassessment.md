# trade-app.tsx Modal/App Boundary Reassessment

## 1. Purpose

This reassessment records the remaining `app/trade-app.tsx` boundaries after
Action 338.

Actions 317-338 extracted much of the Execution Handoff Preview Modal into
presentational components, pure mappers, and focused hooks. The goal now is to
choose the next safe refactor target from the current file shape.

This action is documentation-only. It does not change runtime behavior.

## 2. Current File Inventory

Current approximate line count:

- `app/trade-app.tsx`: 42,197 lines

Completed handoff modal extraction work:

- shared modal display helpers
- `ExecutionHandoffModalShell`
- `HandoffCoreSummary`
- `FutureAgentRequestPreview`
- `AvanzaDryRunRequestPreview`
- `BridgeRequestEnvelopePreview`
- `AvanzaDryRunReadinessPanel`
- `LocalhostBridgeControls`
- early phase stub previews:
  - session detection
  - search-only
  - instrument verification
- middle phase stub previews:
  - instrument page
  - order page open
  - Advanced form fill
  - review click
- late phase stub previews:
  - broker confirmation capture
  - BrokerExecutionResult eligibility
  - BrokerExecutionResult preview
  - execution record eligibility
- `ExecutionSandboxQaPanel`
- `AgentProgressStubPanel`
- `ExecutionLifecycleStatusPanel`
- `ExecutionBrokerCaptureStubPanel`
- `ExecutionHandoffStatusReadbacks`
- pure handoff modal data mappers
- localhost bridge controls state hook
- early/middle/late phase preview hooks
- Avanza readiness derived-state hook

Remaining top-level responsibilities:

- dashboard data loading from Supabase and local/demo stores
- app-wide refresh orchestration and island refresh status
- app-wide localStorage hydration/persistence effects
- recommendation status updates and discard handling
- trade create and close-position submission flows
- position update polling and alert sound effects
- recommendation outcome evaluation and diagnostics
- tab-level rendering for Recommendations, Live Day Trades, Stats Today,
  Statistics, History, and Market/diagnostics surfaces
- Execution Handoff Preview Modal composition and request construction

Largest remaining domains by rough file span:

- app-wide helpers and parsing/formatting before `TradeApp`: about 7,900 lines
- `TradeApp` state, effects, data loading, derived summaries, and tab render:
  about 8,000 lines
- statistics/performance/learning panels: about 6,500 lines
- market diagnostics, scan diagnostics, and history-adjacent panels: about
  5,500 lines
- execution and trade handoff panels around buy/sell flows: about 3,800 lines
- recommendation card/details area: about 2,800 lines
- trade create modal: about 2,600 lines
- live day trade card and handoff modal area: about 2,700 lines
- close-position/sell handoff area: about 2,300 lines

These are approximate spans based on function boundaries, not exact ownership
metrics.

## 3. Remaining Handoff Modal Responsibilities

`ExecutionHandoffPreviewModal` now has a clearer boundary but still owns modal
coordination:

- selected intent and handoff extraction from the orchestrator result
- Escape-key close effect
- future agent request preview creation
- bridge envelope preview creation
- Avanza dry-run request preview creation
- request and envelope validation status derivation
- localhost bridge controls hook composition
- early/middle/late phase preview hook composition
- Avanza readiness hook composition
- local lifecycle state
- preparation/capture state
- agent progress timeline state
- preparation stub handler
- capture stub handler
- agent progress stub event handler
- sandbox QA item assembly
- modal panel ordering and dev-gated panel composition

Remaining inline sections are now mostly composition:

- many prop pass-throughs to extracted phase preview components
- duplicated `LocalhostBridgeControls` placement for dry-run preview and echo
  controls
- dev-gated grouping of preview chains
- `ExecutionSandboxQaPanel` item assembly stays in the parent
- lifecycle/capture handlers stay in the parent

Whether a modal composition container is now safe:

- A presentational composition container is safer now than before Action 338
  because most large inline rendering blocks are extracted.
- It is still prop-heavy because the parent owns many hook results and
  callbacks.
- The safest version would move only JSX composition and receive grouped prop
  objects, not individual primitive props.
- State, hooks, handlers, request construction, lifecycle transitions, audit
  appends, and capture creation should remain in `app/trade-app.tsx`.

## 4. Remaining App-Wide Responsibilities

Recommendations tab:

- status bar wiring
- Grow Max / learning-mode banner
- recommendation empty-state selection
- recommendation card grid
- add-trade validation entry point
- discard status update callback

Live Day Trades tab:

- status bar wiring
- execution sandbox fixture panel
- live trade grid split between take-profit and other positions
- risk controls evaluation per position
- position update / urgency / EOD safety props
- close-position modal entry point

History/statistics rendering:

- Statistics dashboard and range selection
- recommendation performance, tier, batch, learning, calibration, sample
  quality, and backlog panels
- History tab header, status bar, data-mode banners, outcome evaluation runner,
  hidden diagnostics JSON, recommendation history, closed trade history, and
  scan quality diagnostics

Settings/navigation glue:

- top-level active tab state
- topbar and primary navigation
- Settings link
- refresh-current-surface behavior by active tab

Trade card rendering:

- `RecommendationCard` owns local details/discard modal state
- `ActivePositionCard` owns local live trade details and execution preview state
- trade create and close-position modals still live in `app/trade-app.tsx`

LocalStorage/app-wide effects:

- execution mode preference
- paper session protocol
- live market trial runbook
- provider plan mode hint
- dev preview recommendation visibility
- stored recommendation snapshots, scan runs, batches, and outcomes
- local demo data

Execution lifecycle outside the modal:

- `ExecutionSandboxFixturePanel`
- `ActivePositionCard` sell-handoff preview entry point
- `TradeModal` buy-side handoff/readiness panels
- `ClosePositionModal` sell-side handoff/readiness panels

## 5. Candidate Next Refactor Targets

Ranked by safety and payoff:

A. Extract Handoff Modal composition container

- Highest safety among meaningful next runtime refactors.
- The remaining modal rendering is mostly composition of extracted panels.
- Recommended shape: `ExecutionHandoffModalComposition` or similar receives
  grouped prop objects for core previews, phase previews, bridge controls,
  readiness, QA/progress, lifecycle panels, and readbacks.
- Parent still owns hooks, state, handlers, lifecycle transitions, audit
  appends, request construction, and capture creation.
- Main risk is prop grouping and preserving dev-gating/order exactly.

B. Extract Recommendations tab components

- High payoff but broader app coupling.
- Touches recommendation grid, empty-state selection, status bar refresh,
  validation entry point, discard handling, and card-level modal state.
- Better after the handoff modal boundary stabilizes.

C. Extract Live Day Trades tab components

- High payoff but tightly coupled to active positions, latest updates, market
  status, EOD safety, risk controls, close-position modal entry, and execution
  preview entry.
- More behavior risk than the remaining modal composition extraction.

D. Extract History/statistics sections

- High line-count payoff.
- Spans many diagnostics, hidden JSON readbacks, outcome evaluation, data-mode
  clarity, scan quality, and history controls.
- Should be planned separately because it is more of an app-domain split than a
  modal cleanup.

E. Extract app-wide state hooks later

- Highest risk.
- Would touch data loading, refresh cadence, Supabase reads/writes,
  localStorage, and cross-tab effects.
- Should wait until presentational surfaces are split further.

## 6. Recommended Next Action

Recommended:

**Action 340 - Extract Handoff Modal Composition Container**

Suggested constraints:

- move only JSX composition for `ExecutionHandoffPreviewModal`
- parent continues to call all hooks
- parent continues to own all state and handlers
- parent continues to build request previews and validation statuses
- parent passes grouped props into the composition component
- preserve panel order, dev-gating, button text, callbacks, and visible copy
- do not move lifecycle transition logic, audit append logic, or capture result
  creation

Why this beats app-tab extraction now:

- the handoff modal has the clearest recent test coverage from the execution
  sandbox e2e path
- most modal panel rendering is already extracted
- the remaining work can be constrained to composition only
- Recommendations and Live Day Trades extraction would touch broader app-wide
  data and card/modal behavior

## 7. Risk Assessment

Prop drilling:

- A naive composition component would have a very large prop list.
- Grouped prop objects should reduce churn and make the boundary easier to
  review.
- Avoid inventing new derived data in the composition component.

App-wide state coupling:

- `TradeApp` still owns recommendation, position, history, diagnostics, and
  settings state.
- The next action should not move app-wide state or refresh behavior.

Hook-order risk:

- No hooks should move for Action 340.
- The composition component should be presentational and hook-free unless a
  tiny local UI-only hook is already unavoidable, which is not expected.

E2E coverage:

- Existing e2e covers the execution sandbox fixture and handoff modal path.
- Preserving visible text and panel order keeps this coverage valuable.

LocalStorage side effects:

- LocalStorage effects are app-wide and should not move in the next action.
- Diagnostics store/save behavior should remain in existing hooks/parent code.

Avoiding behavior change:

- Do not alter dev-gating wrappers.
- Do not alter callbacks or disabled conditions.
- Do not change request payloads.
- Do not move lifecycle transitions or audit event append calls.
- Do not add Avanza automation, browser control, broker execution, Supabase
  writes, or trade mutation.

## 8. Verification

Action 339 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 340 Result

Action 340 added
`components/execution/ExecutionHandoffModalComposition.tsx`.

Extraction result:

- The Execution Handoff Preview Modal body composition moved out of
  `app/trade-app.tsx` into a hook-free composition component.
- The new component assembles the already-extracted panels in the same order:
  core summary, future-agent request preview, Avanza dry-run request preview,
  early/middle/late stub previews, localhost bridge controls, readiness panel,
  bridge envelope preview, sandbox QA, progress stub, lifecycle status,
  broker capture stub, and final handoff readbacks.
- `app/trade-app.tsx` still owns modal open/close, `ExecutionHandoffModalShell`,
  selected intent/handoff wiring, dry-run request construction, hook calls,
  bridge/client handlers, lifecycle transitions, audit append logic, capture
  result creation, readiness derivation, and app-wide state.
- The component receives grouped props and does not call hooks or bridge/client
  helpers.
- `app/trade-app.tsx` is approximately 42,074 lines after the extraction.

Safety result:

- Panel ordering, dev gating, button text, callbacks, disabled states, and
  visible copy were preserved.
- No Avanza automation, selector, URL, browser control, order submission,
  `BrokerExecutionResult`, execution record, Supabase write, or trade mutation
  was added.

Next recommended action:

**Action 341 - Reassess trade-app.tsx After Composition Extraction**

## 10. Action 341 Follow-Up

Action 341 added
`docs/trade-app-post-composition-extraction-reassessment.md`.

Assessment result:

- `app/trade-app.tsx` remains approximately 42,074 lines after the Action 340
  composition extraction.
- The handoff modal decomposition is complete enough to pause: rendering,
  composition, readiness, phase previews, bridge controls, QA/progress, and
  lifecycle display are extracted.
- Remaining handoff modal ownership in `app/trade-app.tsx` is intentional for
  now: selected intent/handoff, request construction, hook composition,
  lifecycle/capture/progress state, handlers, audit appends, and grouped prop
  assembly.
- The safest next high-payoff area is the Recommendations tab, but the next
  step should be a plan because the tab touches card interactions, add-trade
  entry points, discard callbacks, local/demo visibility, and derived
  diagnostics.

Next recommended action:

**Action 342 - Create Recommendations Tab Extraction Plan**
