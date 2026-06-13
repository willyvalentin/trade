# Handoff Modal Decomposition Plan

## 1. Purpose

The Execution Handoff Preview Modal has grown into a large legacy component in
`app/trade-app.tsx`. It now contains the core handoff preview plus a long set of
dev-gated, read-only diagnostics panels for localhost bridge stubs and future
Avanza-adjacent phases.

The immediate reason to decompose it is maintainability. Action 315 required a
narrow ESLint override for `app/trade-app.tsx` because the React Hooks lint rule
overflows its call stack while analyzing the monolithic modal. Future work
should reduce the modal into smaller components and hooks so the override can
eventually be removed.

The goal of the decomposition is strictly structural:

- Preserve current behavior exactly.
- Preserve all dev gating and safety copy.
- Improve readability and ownership boundaries.
- Reduce hook and render complexity.
- Make future stub panels easier to test and review.
- Remove the ESLint override only after extraction is complete and linting is
  stable again.

## 2. Current Modal Inventory

The current modal includes these major sections and preview panels:

- Core execution intent and handoff preview.
- Lifecycle, status, and sandbox QA surfaces.
- Localhost bridge health, echo, cancellation, and runner self-check controls.
- Avanza dry-run request preview.
- Avanza dry-run readiness checklist.
- Dry-run bridge response preview.
- Session-detection preview.
- Search-only preview.
- Instrument-verification preview.
- Instrument-page preview.
- Order-page-open preview.
- Advanced form-fill preview.
- Review-click preview.
- Manual-confirmation-wait preview.
- Broker-confirmation-capture preview.
- BrokerExecutionResult eligibility preview.
- BrokerExecutionResult conversion preview.
- Execution-record eligibility preview.

All of these sections are currently read-only or stub-only. None of them should
be converted into broker execution, Avanza automation, persistence, or trade
mutation during decomposition.

## 3. Proposed Target Structure

Suggested future file structure:

- `components/execution/ExecutionHandoffModal.tsx`
- `components/execution/HandoffCoreSummary.tsx`
- `components/execution/HandoffLifecycleSummary.tsx`
- `components/execution/HandoffSandboxQaPanel.tsx`
- `components/execution/AvanzaDryRunRequestPreview.tsx`
- `components/execution/AvanzaReadinessPanel.tsx`
- `components/execution/LocalhostBridgeControls.tsx`
- `components/execution/stub-previews/DryRunBridgeResponsePreview.tsx`
- `components/execution/stub-previews/SessionDetectionPreview.tsx`
- `components/execution/stub-previews/SearchOnlyPreview.tsx`
- `components/execution/stub-previews/InstrumentVerificationPreview.tsx`
- `components/execution/stub-previews/InstrumentPagePreview.tsx`
- `components/execution/stub-previews/OrderPageOpenPreview.tsx`
- `components/execution/stub-previews/AdvancedFormFillPreview.tsx`
- `components/execution/stub-previews/ReviewClickPreview.tsx`
- `components/execution/stub-previews/ManualConfirmationWaitPreview.tsx`
- `components/execution/stub-previews/BrokerConfirmationCapturePreview.tsx`
- `components/execution/stub-previews/BrokerExecutionResultEligibilityPreview.tsx`
- `components/execution/stub-previews/BrokerExecutionResultPreview.tsx`
- `components/execution/stub-previews/ExecutionRecordEligibilityPreview.tsx`
- `hooks/execution/useHandoffModalState.ts`
- `hooks/execution/useAvanzaDryRunPreview.ts`
- `hooks/execution/useAvanzaReadinessItems.ts`
- `hooks/execution/useAvanzaStubPreviews.ts`
- `hooks/execution/useLocalhostBridgeControls.ts`

Suggested shared display helpers:

- `components/execution/shared/Detail.tsx`
- `components/execution/shared/TextBlock.tsx`
- `components/execution/shared/SafetyLabelList.tsx`
- `components/execution/shared/PreviewSectionShell.tsx`
- `components/execution/shared/StatusCallout.tsx`
- `components/execution/shared/BlockerWarningGrid.tsx`

These names are proposals. Future actions may choose names that better match
the project’s component conventions, but the extraction should keep component
boundaries small and obvious.

## 4. State Ownership Plan

Parent modal should own:

- Modal open/close behavior.
- Selected execution intent and handoff payload.
- Execution mode and authority summary.
- Any state needed across multiple panels.
- Aggregated readiness inputs.

Hooks should own:

- Derived Avanza dry-run request preview.
- Latest localhost bridge stub responses.
- Loading/message state for endpoint checks when a response is shared across
  panels.
- Readiness item derivation from current modal state.

Individual preview components should own:

- No cross-panel state.
- Only local presentation state if required, such as collapsed details.
- Button disabled/running display from props.
- Render-only formatting of response summaries, safety labels, and blockers.

The preview hook can expose explicit actions such as:

- `checkSessionDetectionStub`
- `checkSearchOnlyStub`
- `checkInstrumentVerificationStub`
- `checkInstrumentPageStub`
- `checkOrderPageOpenStub`
- `checkAdvancedFormFillStub`
- `checkReviewClickStub`
- `checkManualConfirmationWaitStub`
- `checkBrokerConfirmationCaptureStub`
- `checkBrokerExecutionResultEligibilityStub`
- `checkBrokerExecutionResultPreviewStub`
- `checkExecutionRecordEligibilityStub`

No hook should perform automatic bridge calls on render.

## 5. Behavior Preservation Rules

Every extraction must preserve behavior exactly unless a separate action
explicitly changes behavior and updates tests.

Rules:

- Do not change button text, section titles, safety labels, or selector-facing
  copy unless tests are intentionally updated.
- Keep execution dev-tools gating unchanged.
- Keep automatic execution disabled for all Avanza-adjacent previews.
- Preserve all “no browser control”, “no Avanza touched”, “no broker result”,
  “no execution record”, “no Supabase write”, and “no trade mutation” labels.
- Do not add run/start/create/convert/persist/execute buttons.
- Do not add Avanza automation.
- Do not add Avanza selectors or URLs.
- Do not add browser control.
- Do not create `BrokerExecutionResult`.
- Do not create execution records.
- Do not write Supabase.
- Do not mutate trade state.
- Keep all localhost bridge calls manual and dev-gated.

## 6. Test Preservation Plan

Existing e2e tests are the behavioral contract for the modal. They should remain
passing after every extraction.

Recommended verification after each extraction:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
```

Extraction rules:

- Extract one component or small group at a time.
- Prefer prop drilling over new context until repeated wiring becomes a real
  problem.
- Keep test text stable.
- Do not remove existing e2e assertions.
- Add targeted component-level smoke tests only if the existing setup supports
  them without adding heavy new infrastructure.
- If a test failure occurs, fix the extraction rather than weakening safety
  assertions.

## 7. Suggested Extraction Order

Recommended staged actions:

1. **Action 317 — Extract Handoff Modal Shared Display Components**
   - Extract `Detail`, `TextBlock`, safety-label chips, status callouts, and
     blocker/warning grid components.
   - No behavior change.

2. **Action 318 — Extract Avanza Readiness Panel**
   - Move readiness item rendering and derived display copy into a dedicated
     panel.
   - Keep readiness derivation either in parent or a small hook.

3. **Action 319 — Extract Localhost Bridge Controls**
   - Move health, echo, cancellation, self-check, and bridge status controls.
   - Preserve all manual-only behavior.

4. **Action 320 — Extract Early Phase Previews**
   - Extract session-detection, search-only, and instrument-verification
     previews.

5. **Action 321 — Extract Middle Phase Previews**
   - Extract instrument-page, order-page-open, Advanced form-fill, and
     review-click previews.

6. **Action 322 — Extract Late Phase Previews**
   - Extract manual-confirmation-wait, broker-confirmation-capture,
     BrokerExecutionResult eligibility, BrokerExecutionResult preview, and
     execution-record eligibility previews.

7. **Action 323 — Remove ESLint Override If Safe**
   - Remove the `app/trade-app.tsx` React Hooks lint override only after the
     decomposed structure is small enough for the rule to analyze reliably.
   - Run the full verification suite before and after removal.

## 8. Risk Register

Main risks:

- Breaking state propagation between preview panels.
- Accidentally changing dev gating.
- Accidentally changing button text and e2e selectors.
- Losing or weakening safety labels.
- Introducing hook-order problems during extraction.
- Making e2e tests flaky through changed loading/message timing.
- Accidentally adding automatic bridge calls on render.
- Expanding the client bundle with overly broad imports.
- Moving test-only or Playwright-only helpers into runtime code.
- Blurring the boundary between preview diagnostics and execution/persistence.

Mitigations:

- Keep extractions small.
- Preserve tests as the behavior contract.
- Use typed props for every extracted panel.
- Keep browser/test helpers under `tests/e2e`.
- Keep bridge calls behind explicit button handlers.
- Review every extracted component for safety labels and forbidden actions.

## 9. Acceptance Criteria for Future Decomposition

Future decomposition actions are acceptable only when:

- Behavior is preserved.
- Existing e2e tests pass after each small extraction.
- TypeScript passes.
- Lint passes.
- `git diff --check` passes.
- Dev-gated panels remain dev-gated.
- The modal remains read-only/stub-only for Avanza-adjacent paths.
- No Avanza automation, selectors, URLs, browser control, order submission,
  broker result, execution record, Supabase write, or trade mutation is added.
- The ESLint override can eventually be removed after the component is split
  enough for hook linting to run safely.

## 10. Recommended Next Action

Recommended next action:

**Action 318 — Extract Avanza Readiness Panel**

This should be a no-behavior-change refactor that moves the read-only Avanza
dry-run readiness panel rendering into a dedicated presentational component. It
should not move endpoint-call logic, change state ownership, alter dev gating,
or add any new behavior.

## Action 317 - Shared Display Component Extraction

Action 317 completed the first no-behavior-change extraction from
`app/trade-app.tsx`:

- `Detail`
- `TextBlock`
- `EmptyState`

These pure presentational helpers now live in
`components/execution/handoff-modal-shared.tsx`. The extraction did not move
modal state, hooks, bridge/client logic, endpoint handlers, readiness
derivation, or preview-panel logic.

Behavior preservation notes:

- Visible labels and copy are unchanged.
- Button text is unchanged.
- Dev gating is unchanged.
- Safety labels are unchanged.
- The `app/trade-app.tsx` ESLint override remains for now because the modal
  still contains the large hook/state surface.

Next recommended action:

**Action 318 — Extract Avanza Readiness Panel**

## Action 318 - Avanza Readiness Panel Extraction

Action 318 extracted the read-only Avanza dry-run readiness panel from
`app/trade-app.tsx` into
`components/execution/AvanzaDryRunReadinessPanel.tsx`.

The new component renders the existing readiness panel sections for:

- dry-run capability gates
- localhost runner self-check
- session detection
- search-only
- instrument verification
- instrument page identity
- order page open
- Advanced form fill
- review click
- broker confirmation capture

Behavior preservation notes:

- The parent modal still owns all state, hooks, bridge/client calls, response
  handling, and derived readiness values.
- The extraction is presentational only and passes readiness data through typed
  props.
- Visible labels, safety copy, button text, and dev gating are unchanged.
- The `app/trade-app.tsx` ESLint override remains for now because the modal
  still owns the large hook/state surface.

Next recommended action:

**Action 319 — Extract Localhost Bridge Controls**

## Action 319 - Localhost Bridge Controls Extraction

Action 319 extracted the localhost bridge control rendering from
`app/trade-app.tsx` into
`components/execution/LocalhostBridgeControls.tsx`.

The new component renders the existing localhost bridge UI for:

- dry-run bridge response preview
- localhost bridge echo controls and result display
- localhost runner self-check control and result display
- localhost mock-agent control and result display
- localhost bridge cancel control and result display

Behavior preservation notes:

- The parent modal still owns all loading state, response state, messages,
  derived booleans, bridge client calls, and click handlers.
- The extraction is presentational only and passes current values/callbacks
  through typed props.
- The bridge request envelope preview remains inline in `app/trade-app.tsx`.
- Session-detection, search-only, instrument verification, instrument page,
  order page, Advanced form-fill, review-click, manual confirmation,
  broker-confirmation, eligibility, conversion, and execution-record preview
  panels remain inline for later slices.
- Visible labels, safety copy, button text, disabled/loading behavior, and dev
  gating are unchanged.
- The `app/trade-app.tsx` ESLint override remains for now because the modal
  still owns the large hook/state surface.

Next recommended action:

**Action 320 — Extract Early Phase Stub Previews**

## Action 320 - Early Phase Stub Preview Extraction

Action 320 extracted the early Avanza-adjacent stub preview rendering from
`app/trade-app.tsx` into dedicated presentational components:

- `components/execution/stub-previews/SessionDetectionPreview.tsx`
- `components/execution/stub-previews/SearchOnlyPreview.tsx`
- `components/execution/stub-previews/InstrumentVerificationPreview.tsx`

The new components render the existing dev-only, read-only UI for:

- session-detection stub checks
- search-only stub checks and candidate displays
- instrument-verification stub checks, selected candidate display, and field
  checks

Behavior preservation notes:

- The parent modal still owns all loading state, response state, messages,
  derived booleans, result chaining, bridge client calls, and click handlers.
- The extraction is presentational only and passes current values/callbacks
  through typed props.
- Instrument page, order page, Advanced form-fill, review-click, manual
  confirmation, broker-confirmation, eligibility, conversion, and
  execution-record preview panels remain inline for later slices.
- Visible labels, safety copy, button text, disabled/loading behavior, and dev
  gating are unchanged.
- The `app/trade-app.tsx` ESLint override remains for now because the modal
  still owns the large hook/state surface.

Next recommended action:

**Action 321 — Extract Middle Phase Stub Previews**

## Action 321 - Middle Phase Stub Preview Extraction

Action 321 extracted the middle Avanza-adjacent stub preview rendering from
`app/trade-app.tsx` into dedicated presentational components:

- `components/execution/stub-previews/InstrumentPagePreview.tsx`
- `components/execution/stub-previews/OrderPageOpenPreview.tsx`
- `components/execution/stub-previews/AdvancedFormFillPreview.tsx`
- `components/execution/stub-previews/ReviewClickPreview.tsx`

The new components render the existing dev-only, read-only UI for:

- instrument-page identity stub checks
- order-page-open stub checks and order-page identity display
- Advanced form-fill stub checks and sanitized form-state display
- review-click stub checks and confirmation readback display

Behavior preservation notes:

- The parent modal still owns all loading state, response state, messages,
  derived booleans, result chaining, bridge client calls, and click handlers.
- The extraction is presentational only and passes current values/callbacks
  through typed props.
- Manual confirmation, broker-confirmation, eligibility, conversion, and
  execution-record preview panels remain inline for later slices.
- Visible labels, safety copy, button text, disabled/loading behavior, and dev
  gating are unchanged.
- The `app/trade-app.tsx` ESLint override remains for now because the modal
  still owns the large hook/state surface.

Next recommended action:

**Action 322 — Extract Late Phase Stub Previews**

## Action 322 - Late Phase Stub Preview Extraction

Action 322 extracted the rendered late-phase stub preview UI from
`app/trade-app.tsx` into dedicated presentational components:

- `components/execution/stub-previews/BrokerConfirmationCapturePreview.tsx`
- `components/execution/stub-previews/BrokerExecutionResultEligibilityPreview.tsx`
- `components/execution/stub-previews/BrokerExecutionResultPreview.tsx`
- `components/execution/stub-previews/ExecutionRecordEligibilityPreview.tsx`

The new components render the existing dev-only, read-only UI for:

- broker-confirmation-capture stub checks and readback display
- BrokerExecutionResult eligibility checks and evidence fingerprint display
- BrokerExecutionResult-shaped conversion preview checks
- execution-record eligibility checks and record fingerprint display

Behavior preservation notes:

- The parent modal still owns all loading state, response state, messages,
  derived booleans, result chaining, bridge client calls, and click handlers.
- The extraction is presentational only and passes current values/callbacks
  through typed props.
- Manual-confirmation wait remains readiness/contract-only in the current modal
  because no separate manual-confirmation wait preview control was rendered to
  extract; no new UI was added.
- Visible labels, safety copy, button text, disabled/loading behavior, and dev
  gating are unchanged.
- The `app/trade-app.tsx` ESLint override remains for now because the modal
  still owns the large hook/state surface.

Next recommended action:

**Action 323 — Extract Handoff Modal State Hook Plan or Remove ESLint Override Feasibility Check**

## Action 323 - ESLint Override Feasibility Check

Action 323 checked whether the narrow `app/trade-app.tsx`
`react-hooks/rules-of-hooks` override was still needed after Actions 317-322.

Result:

- The override block was temporarily removed from `eslint.config.mjs`.
- `npm run lint` completed successfully without the override.
- The override was removed permanently.
- No modal state, hooks, handlers, bridge/client logic, button text, dev
  gating, Avanza automation, or execution behavior changed.

Verification:

- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`
- `git diff --check`

Next recommended action:

**Action 324 — Handoff Modal State/Handler Grouping Plan**

## Action 324 - State/Handler Grouping Plan

Action 324 added
`docs/handoff-modal-state-handler-grouping-plan.md`.

The new plan maps the remaining modal-owned state, handlers, derived readiness
values, diagnostics/local-store side effects, and result chaining before any
future hook extraction. It recommends extracting pure data mappers first, then
moving state one cluster at a time.

Behavior preservation notes:

- Documentation only.
- No modal state moved.
- No handlers moved.
- No hooks were created.
- No bridge/client calls changed.
- No visible copy, button text, or dev gating changed.

Next recommended action:

**Action 325 — Extract Handoff Modal Pure Data Mappers**

## Action 325 - Pure Data Mapper Extraction

Action 325 added `lib/handoff-modal-data-mappers.ts` and moved the first
side-effect-free readiness row builders out of `app/trade-app.tsx`.

Extracted helpers:

- `buildBrokerExecutionPreviewReadinessItems(...)`
- `buildExecutionRecordEligibilityReadinessItems(...)`
- shared `ExecutionSandboxQaItem` and `ExecutionSandboxQaStatus` types

Behavior preservation notes:

- The parent modal still owns all state, hooks, handlers, bridge/client calls,
  loading flags, response objects, and result chaining.
- The extracted helpers take explicit inputs and return display/readiness rows.
- No visible copy, button text, readiness labels, dev gating, endpoint calls,
  Avanza behavior, execution behavior, persistence, or trade mutation changed.

Next recommended action:

**Action 326 — Extract Localhost Bridge State Hook**
