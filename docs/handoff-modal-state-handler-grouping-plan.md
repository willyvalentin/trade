# Handoff Modal State/Handler Grouping Plan

## 1. Purpose

Actions 317-323 reduced the rendering surface of the Execution Handoff Preview
Modal and removed the temporary React Hooks ESLint override. The modal is now a
better candidate for deeper decomposition, but state and handler extraction is
riskier than presentational extraction because the modal coordinates many
dependent preview phases.

This plan groups the remaining state, callbacks, derived values, and
side-effect boundaries before any hook extraction. The goal is to preserve
behavior while reducing `app/trade-app.tsx` complexity in small, testable
steps.

## 2. Current ownership

`app/trade-app.tsx` still owns:

- modal open/close state
- selected execution intent and handoff payload
- execution mode
- bridge health and self-check state
- dry-run bridge response state
- session-detection state
- search-only state
- instrument-verification state
- instrument-page state
- order-page-open state
- Advanced form-fill state
- review-click state
- broker confirmation capture state
- BrokerExecutionResult eligibility state
- BrokerExecutionResult preview state
- execution-record eligibility state
- diagnostics and local store side effects
- derived readiness rows
- all click handlers and bridge calls
- result chaining between phases

No state ownership changed in Actions 317-323. The extracted components remain
presentational and receive already-computed props and callbacks.

## 3. Proposed state clusters

### A. Core modal state

- Modal open/close status
- Selected execution intent
- Selected handoff payload
- Execution mode
- Lifecycle/status flags
- Core validation/readiness summaries

### B. Localhost bridge state

- Bridge health/echo response
- Mock-agent run response
- Cancel response
- Runner self-check response
- Dry-run bridge stub response
- Loading flags and messages for each bridge action

### C. Early phase preview state

- Session detection response/loading/message
- Search-only response/loading/message
- Instrument verification response/loading/message
- Chained expected instrument and selected candidate inputs

### D. Middle phase preview state

- Instrument page response/loading/message
- Order page open response/loading/message
- Advanced form-fill response/loading/message
- Review-click response/loading/message
- Chained verified instrument, page identity, order-page, and form-fill inputs

### E. Late phase preview state

- Broker confirmation capture response/loading/message
- BrokerExecutionResult eligibility response/loading/message
- BrokerExecutionResult preview response/loading/message
- Execution record eligibility response/loading/message
- Chained capture evidence, eligibility evidence, preview candidate, and record
  candidate inputs

### F. Readiness derived state

- Avanza dry-run readiness rows
- Localhost self-check readiness rows
- Session/search/instrument readiness rows
- Middle and late phase readiness rows
- Status labels and summary messages
- "Ready for future X" informational labels
- No-behavior-activation guarantees

### G. Diagnostics/local storage side effects

- Safe action diagnostics save
- Mock-agent diagnostics save
- Local diagnostic store reads/writes
- Local viewer/store interactions
- Local-only success/error copy

## 4. Dependency map

Current result chaining should remain explicit during future extraction:

1. `dryRunRequest` feeds session/search/instrument-verification previews.
2. Search-only exact candidate feeds instrument verification.
3. Verified instrument feeds instrument page preview.
4. Identified instrument page feeds order page open preview.
5. Opened order page feeds Advanced form-fill preview.
6. Filled Advanced form feeds review-click preview.
7. Review confirmation-ready state feeds manual wait/capture path.
8. Broker confirmation capture feeds BrokerExecutionResult eligibility.
9. BrokerExecutionResult eligibility feeds conversion preview.
10. BrokerExecutionResult conversion preview feeds execution-record eligibility.

Every extraction must preserve the existing fallback behavior when an upstream
result is missing, blocked, or invalid.

## 5. Handler clusters

Likely handler groups:

- Bridge health/echo/self-check handlers
- Mock-agent run and cancel handlers
- Dry-run stub test handler
- Session detection handler
- Search-only handler
- Instrument verification handler
- Instrument page handler
- Order page open handler
- Advanced form-fill handler
- Review-click handler
- Broker confirmation capture handler
- BrokerExecutionResult eligibility handler
- BrokerExecutionResult preview handler
- Execution record eligibility handler
- Diagnostics save/clear handlers

Handlers should not be moved until their input dependencies and output state are
stable enough to pass as a typed hook boundary.

## 6. Future hook candidates

Potential hooks:

- `useLocalhostBridgeControlsState`
- `useAvanzaEarlyPhasePreviewState`
- `useAvanzaMiddlePhasePreviewState`
- `useAvanzaLatePhasePreviewState`
- `useAvanzaReadinessRows`
- `useExecutionDiagnosticsState`

Each hook should have explicit typed inputs and outputs. The first extraction
should prefer pure data mappers over hooks.

## 7. Safe extraction order

Recommended staged actions:

1. **Action 325 — Extract Handoff Modal Pure Data Mappers**
   - Move pure readiness-row builders, label mappers, safety metadata readers,
     and response normalizers.
   - No state or handlers move.

2. **Action 326 — Extract Localhost Bridge State Hook**
   - Move bridge health/echo/mock-agent/cancel/self-check/dry-run stub state and
     handlers only after pure mapper extraction.

3. **Action 327 — Extract Early Phase Preview State Hook**
   - Move session-detection, search-only, and instrument-verification state and
     handlers.

4. **Action 328 — Extract Middle Phase Preview State Hook**
   - Move instrument-page, order-page-open, Advanced form-fill, and review-click
     state and handlers.

5. **Action 329 — Extract Late Phase Preview State Hook**
   - Move broker-confirmation capture, BrokerExecutionResult eligibility,
     BrokerExecutionResult preview, and execution-record eligibility state and
     handlers.

6. **Action 330 — Extract Readiness Derived-State Hook**
   - Move derived readiness rows only after all source state clusters have
     stable hook boundaries.

7. **Action 331 — Reassess `trade-app.tsx` and e2e Stability**
   - Review file size, hook lint stability, prop depth, and e2e behavior.

## 8. Preservation rules

- Extract one hook cluster at a time.
- Do not change visible text or button labels.
- Do not change dev-gating behavior.
- Do not change bridge/client helper behavior.
- Do not change result chaining.
- Do not add automatic calls on render.
- Run e2e after each hook extraction.
- Do not add Avanza automation, browser control, broker execution, broker
  results, Supabase writes, execution records, or trade mutation.

## 9. Risk register

- Stale closure bugs in extracted handlers.
- Incorrect dependency arrays.
- Broken result chaining between preview phases.
- Loading state mismatch after handler moves.
- Readiness rows desynced from source responses.
- Accidental API call behavior change.
- Dev-gating regression.
- Local diagnostics saved at the wrong time.
- e2e flakiness from changed timing or loading copy.
- Larger hook props becoming harder to reason about than the current parent
  state.

## 10. Acceptance criteria for future hook extraction

Future hook extraction should be accepted only when:

- Modal behavior is preserved.
- Existing e2e tests pass.
- Hook inputs and outputs are typed.
- Hook boundaries are smaller and clearer than the original inline code.
- The parent component remains understandable.
- No safety boundary is weakened.
- No new Avanza/browser/execution/persistence behavior is added.

## 11. Action 325 mapper extraction result

Action 325 extracted the first pure handoff modal mapper module:

- `lib/handoff-modal-data-mappers.ts`

The extracted helpers are side-effect-free and take explicit inputs:

- `buildBrokerExecutionPreviewReadinessItems(...)`
- `buildExecutionRecordEligibilityReadinessItems(...)`
- `ExecutionSandboxQaItem` / `ExecutionSandboxQaStatus`

Behavior preservation notes:

- No modal state moved.
- No handlers moved.
- No hooks were created.
- No bridge/client calls moved.
- No visible copy, button text, readiness labels, or dev gating changed.
- `app/trade-app.tsx` still owns response state, loading state, result
  chaining, endpoint handlers, and all API/client calls.

## 12. Recommended next action

Recommended:

**Action 326 — Extract Localhost Bridge State Hook**

This should move localhost bridge state and handlers only after confirming the
pure mapper extraction remains stable under lint, TypeScript, and e2e.
