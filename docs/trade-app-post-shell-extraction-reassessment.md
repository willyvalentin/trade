# trade-app.tsx Post-Shell Extraction Reassessment

## 1. Purpose

This reassessment records the shape of `app/trade-app.tsx` after Actions
317-336.

The goal is to choose the next refactor target from the current file shape, not
from pre-decomposition assumptions. This action is documentation-only and does
not change runtime behavior.

## 2. Current File Inventory

Current approximate line count:

- `app/trade-app.tsx`: 42,518 lines

Major top-level responsibilities still in the file:

- app-wide trade dashboard state for Recommendations, Live Day Trades,
  Statistics, History, Market, and Settings surfaces
- Supabase read/update flows for recommendations, positions, scan logs,
  recommendation batches, snapshots, and outcomes
- local demo/dev recommendation and position state
- localStorage-backed settings and diagnostics preferences
- market status, market regime, refresh cadence, and notification effects
- recommendation/outcome evaluation diagnostics and readback panels
- trade creation and close-position modals
- live trade cards, recommendation cards, history cards, market diagnostics,
  and settings panels
- Execution Handoff Preview Modal coordination

Extracted handoff modal modules now used by the file:

- `components/execution/handoff-modal-shared.tsx`
- `components/execution/ExecutionHandoffModalShell.tsx`
- `components/execution/AvanzaDryRunReadinessPanel.tsx`
- `components/execution/LocalhostBridgeControls.tsx`
- `components/execution/HandoffCoreSummary.tsx`
- `components/execution/FutureAgentRequestPreview.tsx`
- `components/execution/AvanzaDryRunRequestPreview.tsx`
- `components/execution/BridgeRequestEnvelopePreview.tsx`
- `components/execution/ExecutionSandboxQaPanel.tsx`
- `components/execution/AgentProgressStubPanel.tsx`
- early phase preview components for session detection, search-only, and
  instrument verification
- middle phase preview components for instrument page, order page, Advanced
  form fill, and review click
- late phase preview components for broker confirmation capture,
  BrokerExecutionResult eligibility, BrokerExecutionResult preview, and
  execution record eligibility

Extracted handoff modal hooks/mappers now used by the file:

- `hooks/execution/useLocalhostBridgeControlsState.ts`
- `hooks/execution/useEarlyPhasePreviewState.ts`
- `hooks/execution/useMiddlePhasePreviewState.ts`
- `hooks/execution/useLatePhasePreviewState.ts`
- `hooks/execution/useAvanzaReadinessState.ts`
- `lib/handoff-modal-data-mappers.ts`

Current modal composition summary:

- `ExecutionHandoffPreviewModal` now renders inside
  `ExecutionHandoffModalShell`.
- The modal body is largely composed from extracted presentational panels.
- The parent still coordinates hook inputs, result chaining, readiness inputs,
  lifecycle state, preparation/capture stubs, and remaining inline summary
  sections.

## 3. Remaining Modal Responsibilities

The parent still owns selected handoff/intent wiring:

- `result.selectedIntent`
- `result.handoff`
- selected package snapshot
- selected execution status props
- modal visibility and `onClose`
- Escape-key close effect

The parent still owns dry-run and bridge request construction:

- future agent request preview creation
- bridge envelope preview creation
- Avanza dry-run request preview creation
- request validation status derivation
- bridge envelope validation status derivation

The parent still composes extracted hooks:

- localhost bridge controls state
- early phase preview state
- middle phase preview state
- late phase preview state
- readiness derived state

Remaining modal state and handler clusters:

- local execution lifecycle state
- capture-base lifecycle snapshot
- preparation stub message/error state
- bridge-backed diagnostics runner state
- agent run store message state
- modal-local broker capture stub fields and result state
- agent progress stub timeline state
- preparation stub handler
- broker capture stub handler
- agent progress stub event handler

Remaining inline render sections:

- preparation/lifecycle stub panel around the "Prepare in Avanza" diagnostics
  button
- bridge-backed diagnostics runner result display
- dev broker result capture stub panel
- local capture result details
- final detail grid for action/ticker/quantity/prices/mode/broker flags
- blocked reason panel
- intent reason panel
- safety checks panel
- modal footer close button

Modal panel ordering and composition also remain parent-owned. That is useful
for now because the extracted preview hooks still need explicit result chaining.

## 4. Remaining App-Wide Responsibilities

The file still owns large non-modal surfaces that should be treated as separate
future refactors:

- Recommendations tab rendering and `RecommendationCard`
- Live Day Trades rendering and `ActivePositionCard`
- trade create modal and close-position modal flows
- Statistics and history summary panels
- recommendation history and discarded setup history
- market diagnostics panels
- scan run diagnostics and recommendation engine controls
- Settings/navigation integration
- localStorage hydration and persistence effects
- Supabase read/write/update flows for core app data
- auto-refresh, focus refresh, position update, and notification effects
- app-wide trade management actions

These responsibilities are outside the Action 337 modal reassessment and should
not be moved as part of the next handoff-modal cleanup.

## 5. Candidate Next Refactor Targets

Ranked by safety:

A. Extract execution lifecycle/status display sections

- Safest next runtime refactor.
- Scope can be limited to presentational rendering for the preparation
  lifecycle panel, bridge-backed diagnostics runner result display, broker
  capture stub panel, local capture result, intent/detail/safety readbacks, and
  footer.
- Parent can keep state, handlers, lifecycle transitions, audit appends,
  capture logic, and button callbacks.

B. Extract remaining modal composition into a container component with props

- Higher payoff but much higher prop-drilling.
- Would require passing many hook results, formatting helpers, status helpers,
  callbacks, and derived values.
- Not recommended before the remaining inline lifecycle/capture sections are
  extracted.

C. Extract Recommendations tab/cards

- Large payoff, but this touches app-wide recommendation state, discard flow,
  detail modal state, and scan diagnostics integration.
- Better as a separate app-wide refactor after modal cleanup stabilizes.

D. Extract Live Day Trades tab/cards

- Useful, but tightly coupled to position update refresh, EOD safety,
  lifecycle metadata, and close-position modal wiring.
- Should wait until handoff modal work is complete.

E. Extract History/statistics sections

- Good medium-term target, but it spans many derived summaries and stored
  outcome diagnostics.
- Should be isolated from modal work.

F. Extract app-wide state into domain hooks later

- Highest risk.
- Should happen only after presentational sections and tab surfaces are split.

## 6. Recommended Next Action

Recommended:

**Action 338 - Extract Execution Lifecycle Status Sections**

Suggested scope:

- extract presentational rendering for the remaining lifecycle/preparation
  diagnostics panel
- extract presentational rendering for the broker result capture stub panel
- extract presentational rendering for the local capture result/details if it
  stays tightly tied to the capture stub panel
- optionally extract the remaining action/detail, blocked reason, intent
  reason, safety checks, and footer sections if they are still simple
  rendering-only blocks

Parent should continue to own:

- local lifecycle state
- preparation and capture state
- all handlers and state setters
- audit append logic
- lifecycle transitions
- broker capture result creation
- selected handoff/intent
- all hook calls and result chaining

## 7. Risk Assessment

Prop drilling risk:

- A full modal composition component would need a very large prop surface.
- A focused lifecycle/status extraction keeps props limited to the remaining
  inline blocks.

Hook-order risk:

- Moving hooks or conditional hook calls would be risky.
- The next action should move rendering only and leave hook calls in the parent.

App-wide state coupling:

- `TradeApp` still owns many app-wide flows that are unrelated to the handoff
  modal.
- Extracting app-wide hooks now would blur modal cleanup with data-loading and
  persistence behavior.

Test coverage risk:

- Existing e2e coverage exercises the execution sandbox modal and dev-only
  safety paths.
- The next refactor should preserve visible text and button labels to keep that
  coverage meaningful.

Accidental behavior-change risk:

- The remaining lifecycle/capture panels include buttons and stateful inputs.
- Extraction must pass callbacks and values as props without moving handler
  bodies, request construction, capture creation, lifecycle transitions, or
  audit append logic.

## 8. Verification

Action 337 verification:

- `git diff --check`

No runtime code changes are expected.

## 9. Action 338 Result

Action 338 extracted the remaining lifecycle/status display sections into
presentational components:

- `components/execution/ExecutionLifecycleStatusPanel.tsx`
- `components/execution/ExecutionBrokerCaptureStubPanel.tsx`
- `components/execution/ExecutionHandoffStatusReadbacks.tsx`

Updated approximate line count:

- `app/trade-app.tsx`: 42,197 lines

Extracted rendering:

- Avanza preparation/lifecycle status panel
- bridge-backed diagnostics runner result display
- broker result capture stub panel
- local capture result details
- final action/ticker/quantity/price/mode/broker detail readbacks
- blocked reason display
- intent reason display
- safety checks display
- modal footer close button

What stayed in `app/trade-app.tsx`:

- local lifecycle state
- preparation/capture state and setters
- preparation stub handler
- capture stub handler
- lifecycle transition logic
- audit append logic
- modal-local broker capture result creation
- selected intent/handoff wiring
- dry-run request and bridge envelope creation
- hook composition and result chaining

Behavior preservation result:

- button labels, visible copy, status labels, class names, disabled states, and
  detail labels were preserved
- no state ownership, hook, handler, lifecycle logic, audit append logic,
  bridge/client logic, persistence logic, or trade mutation moved
- no Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added

Recommended next action:

**Action 339 - Reassess Remaining trade-app.tsx Modal/App Boundaries**

Rationale:

- the modal body is now mostly composed from presentational sections
- `ExecutionHandoffPreviewModal` still owns request construction, hook
  composition, lifecycle/capture state, and result chaining
- a reassessment should decide whether the next safe move is a composed modal
  component, a lifecycle/capture state hook, or a broader app-tab extraction

## 10. Action 339 Result

Action 339 added
`docs/trade-app-modal-app-boundary-reassessment.md`.

Assessment result:

- `app/trade-app.tsx` remains approximately 42,197 lines.
- The handoff modal is now mostly composition and wiring, while app-wide
  recommendation, live trade, history/statistics, diagnostics, localStorage,
  and Supabase responsibilities remain broad.
- A Handoff Modal composition container is now the safest next runtime refactor
  because most modal panels are already extracted and the existing execution
  sandbox e2e coverage exercises the modal path.
- Recommendations, Live Day Trades, History/statistics, and app-wide state hook
  extraction remain larger future refactors with broader coupling.

Recommended next action:

**Action 340 - Extract Handoff Modal Composition Container**

The next action should move JSX composition only. Parent ownership should
remain for all hooks, state, handlers, request creation, lifecycle transitions,
audit append logic, capture result creation, localStorage effects, and app-wide
data flows.
