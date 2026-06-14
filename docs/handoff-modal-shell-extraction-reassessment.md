# Handoff Modal Shell Extraction Reassessment

## 1. Purpose

This document reassesses whether the remaining Execution Handoff Preview Modal
shell in `app/trade-app.tsx` is ready to extract after Actions 317-334.

Those actions moved most read-only display panels, phase previews, localhost
bridge controls, Avanza readiness derivation, and phase preview state clusters
out of the modal body. The remaining question is whether the modal shell itself
can move safely without changing hook order, state ownership, dev gating, or
execution behavior.

This is documentation only. No runtime behavior changed.

## 2. Current Remaining Modal Responsibilities

Current inventory from `app/trade-app.tsx`:

- approximate file size: 42,562 lines
- `ExecutionHandoffPreviewModal(...)` still starts near the modal-specific
  section of the file and owns the full modal boundary
- the modal shell still renders:
  - backdrop and click-to-close behavior
  - dialog section and ARIA attributes
  - title bar and close button
  - scroll container
  - footer close button
- the modal still owns Escape-key behavior through a local `useEffect`
- the modal still composes all extracted panels in order:
  - `HandoffCoreSummary`
  - `FutureAgentRequestPreview`
  - `AvanzaDryRunRequestPreview`
  - early/middle/late stub preview panels
  - `LocalhostBridgeControls`
  - `AvanzaDryRunReadinessPanel`
  - `BridgeRequestEnvelopePreview`
  - `ExecutionSandboxQaPanel`
  - `AgentProgressStubPanel`
- remaining inline rendering includes:
  - Avanza preparation stub panel
  - bridge-backed diagnostics runner result display
  - broker result capture stub panel
  - execution intent details grid
  - blocked reason display
  - intent reason display
  - safety checks display
  - modal footer
- dev-gated wrappers remain in the parent around many extracted panels
- the modal still contains substantial orchestration and derived values needed
  by extracted presentational components

## 3. Current Parent-Owned Logic That Should Remain

These responsibilities should stay in `app/trade-app.tsx` or in existing hooks
for now:

- selected recommendation and selected execution/handoff state
- selected execution intent and handoff payload from the orchestrator result
- dry-run request construction
- future-agent request construction
- bridge envelope construction
- modal open/close integration with the surrounding app
- Escape-key behavior until a shell component is explicitly extracted
- all current hook calls and their ordering:
  - localhost bridge controls state
  - early phase preview state
  - middle phase preview state
  - late phase preview state
  - Avanza readiness state
- bridge/client calls and all callback implementations
- lifecycle state and transition handling
- preparation stub state and handler
- progress event creation and audit event append calls
- broker result capture stub state and handler
- local diagnostics/store side effects
- app-wide trade state, recommendation state, localStorage effects, and refresh
  effects

The current modal parent is still the coordination point between selected
handoff data, preview hooks, lifecycle state, and local diagnostic handlers.
Moving that coordination wholesale would be a behavior-risky refactor.

## 4. Future Shell Extraction Options

### Option A - Extract Presentational Shell Only

Create a component such as `ExecutionHandoffModalShell`.

Likely props:

- `title`
- `ariaLabelledBy`
- `onClose`
- `children`
- optional className overrides only if existing shell classes need to remain

What moves:

- backdrop markup
- dialog markup
- title bar
- close button
- scroll container
- footer slot only if kept as children

What stays in the parent:

- all hooks
- all state
- all handlers
- all request/preview construction
- all panel composition
- all dev-gated wrappers

Risk:

- lowest risk
- small-to-medium payoff
- must preserve backdrop click behavior, close button behavior,
  propagation-stopping, title ID, ARIA attributes, and classes exactly

This is the safest actual extraction candidate.

### Option B - Extract Composed Modal Component With Many Props

Create a component such as `ExecutionHandoffModal` that receives all computed
state, handlers, hook results, request previews, lifecycle fields, and
panel props from `app/trade-app.tsx`.

Likely prop categories:

- modal shell props
- selected intent/handoff facts
- future-agent request preview props
- dry-run request preview props
- early/middle/late phase preview hook props
- localhost bridge control props
- readiness props
- QA/audit props
- lifecycle/preparation/capture props
- formatting helper props
- close callbacks

Risk:

- high prop drilling
- high chance of prop mismatch
- large diff
- more likely to disturb e2e-visible text or dev-gated wrappers
- not recommended yet

### Option C - Extract Modal Container Hook + Component Later

Create a larger container hook plus a composed modal component.

Likely shape:

- `useExecutionHandoffModalState(...)`
- `ExecutionHandoffModal(...)`

Risk:

- highest risk
- would move hook ownership/order and handler implementation
- would need careful staging and broader tests
- only appropriate after the remaining lifecycle/preparation/capture sections
  are better isolated

This should not be the next step.

## 5. Recommended Approach

Recommended next action:

**Action 336 - Extract Presentational Handoff Modal Shell**

This should use Option A only:

- move shell/backdrop/titlebar/scroll-container markup into a presentational
  shell component
- keep the modal's hook calls, state, handlers, request creation, panel
  composition, and dev-gated wrappers in the current parent component
- pass existing modal body as `children`
- preserve the title text, close button text/ARIA label, classes, event
  propagation behavior, and backdrop close behavior exactly

If implementation inspection finds that the shell extraction would require
moving hooks or state, stop and choose a smaller remaining inline rendering
section instead.

## 6. Prop Drilling Risk

Option A prop surface should stay small:

- `title`
- `titleId`
- `onClose`
- `children`

Option B prop categories would be much larger:

- modal shell props
- core handoff props
- future-agent request preview props
- dry-run request preview props
- bridge envelope props
- bridge control props
- early/middle/late preview hook props
- readiness props
- QA/audit props
- lifecycle/preparation props
- capture stub props
- formatting helpers
- local diagnostic messages

Option B would reduce `trade-app.tsx` more, but the prop-drilling cost is high
enough that it is not the safest next move.

## 7. Behavior Preservation Rules

Any shell extraction must preserve:

- hook order
- state ownership
- handler ownership
- backdrop click-to-close behavior
- `event.stopPropagation()` behavior
- Escape-key close behavior unless explicitly moved as a shell concern in a
  separate, tested action
- close button label and ARIA label
- modal title text and ID
- dialog ARIA attributes
- scroll container classes
- dev-gated wrappers and visibility
- all e2e-visible text
- no Avanza automation/browser behavior
- no broker execution/result creation
- no Supabase writes
- no trade mutation

## 8. Risks

Main risks:

- hook order bugs if shell extraction accidentally expands into container
  extraction
- prop mismatch or omitted formatter props if too much composition moves
- lost dev-gating wrappers around diagnostic panels
- broken backdrop close behavior
- broken Escape-key behavior
- changed close button semantics
- broken e2e text targets
- bundle churn from turning a small presentational shell into a large modal
  container

Risk mitigation:

- extract shell only
- keep `children` composition in parent
- keep event handlers minimal and identical
- run full e2e after the extraction
- do not remove any existing lint override as part of the shell extraction

## 9. Recommended Next Action

Recommended:

**Action 336 - Extract Presentational Handoff Modal Shell**

Acceptance target for Action 336:

- a presentational shell component exists
- `app/trade-app.tsx` still owns all hooks/state/handlers
- modal body composition remains in parent
- backdrop/close/ARIA behavior is preserved
- full verification passes

## 10. Action 336 Result

Action 336 created
`components/execution/ExecutionHandoffModalShell.tsx`.

Extraction result:

- The modal shell extraction was limited to backdrop, dialog, titlebar, close
  button, and scroll-body markup.
- The parent still renders the modal body as `children` and still owns every
  hook, state value, handler, bridge call, dry-run request, lifecycle
  transition, audit append, preparation stub, and capture stub.
- Backdrop click-to-close behavior, close button label/icon, dialog ARIA
  attributes, title text, and layout class names were preserved.
- No dev-gating, button text, phase-chain behavior, Avanza behavior, execution
  behavior, persistence behavior, or trade mutation behavior changed.

Recommended next action:

**Action 337 - Reassess trade-app.tsx After Modal Shell Extraction**

## 11. Verification

Action 336 verification:

- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`
- `git diff --check`
- `npm run test:e2e`

No behavior changes are expected from the presentational shell extraction.

## 12. Action 337 Follow-Up

Action 337 added
`docs/trade-app-post-shell-extraction-reassessment.md`.

Post-shell assessment result:

- The shell extraction was successful, but a larger composed modal extraction
  would still require heavy prop drilling.
- Remaining inline modal work is concentrated around lifecycle/preparation
  diagnostics, broker capture stub rendering, local capture result details,
  intent/detail readbacks, safety checks, and the footer.
- The safest next step is a focused presentational extraction of those
  lifecycle/status sections.

Recommended next action:

**Action 338 - Extract Execution Lifecycle Status Sections**

## 13. Action 338 Follow-Up

Action 338 extracted the remaining lifecycle/status display sections into
presentational components:

- `components/execution/ExecutionLifecycleStatusPanel.tsx`
- `components/execution/ExecutionBrokerCaptureStubPanel.tsx`
- `components/execution/ExecutionHandoffStatusReadbacks.tsx`

Follow-up result:

- the modal shell remains presentational
- lifecycle/preparation/capture/status rendering is now also presentational
- parent ownership remains for state, handlers, lifecycle transitions, audit
  appends, capture creation, request construction, hook composition, and result
  chaining

Recommended next action:

**Action 339 - Reassess Remaining trade-app.tsx Modal/App Boundaries**
