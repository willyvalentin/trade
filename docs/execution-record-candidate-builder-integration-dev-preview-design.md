# Execution Record Candidate Builder Integration Dev Preview Design

Action: 566
Date: 2026-06-18

## 1. Purpose

Define a future dev-gated, read-only Execution Record Candidate Builder
Integration Dev Preview.

The preview should visualize adapter output from
`shapeExecutionRecordCandidateBuilderInput(...)` and adapter-validator output
from `validateExecutionRecordCandidateBuilderIntegration(...)` without calling
`buildExecutionRecordCandidate(...)`, creating execution-record candidates,
creating execution records, persisting, writing Supabase/localStorage, appending
audit, updating stats/PnL, running rollback/correction, mutating trades,
controlling browser/Avanza behavior, running broker behavior, or executing
orders.

## 2. Scope

Included:

- Dev-gated builder integration preview.
- Read-only visualization.
- Controlled fixture data.
- Explicit trigger.
- Adapter result display.
- Adapter validator result display.
- Safety labels.

Excluded:

- Implementation.
- Candidate builder invocation.
- Execution-record candidate creation.
- Execution-record creation.
- Persistence.
- Supabase writes.
- localStorage writes.
- Audit append.
- Stats/PnL update.
- Rollback/correction execution.
- Trade mutation.
- Avanza/browser/capture behavior.
- Broker/order behavior.
- Production UI.

## 3. Placement Options

Late-phase execution handoff modal near bridge dev preview:

- Pros: closest to the current finalization-to-execution-record bridge preview,
  which makes the input lineage easiest to inspect.
- Pros: can reuse existing dev-only execution handoff context and fixture
  conventions.
- Cons: modal density may increase.

Separate diagnostics/dev panel:

- Pros: gives more room for nested summaries and safety labels.
- Cons: further from the finalization handoff flow and easier to miss during
  bridge QA.

Execution-record diagnostics area if existing:

- Pros: aligns with future execution-record observability.
- Cons: may imply record creation or persistence earlier than intended.

Recommended first placement:

- Add a dev-gated late-phase modal section near the existing Execution Record
  Bridge Preview.
- Visually separate it and label it
  `Execution Record Candidate Builder Integration Preview`.
- Keep it collapsed by default if the modal is already dense.

## 4. Data Dependencies

The preview should use:

- Controlled fixture data first.
- Pure `shapeExecutionRecordCandidateBuilderInput(...)`.
- Pure `validateExecutionRecordCandidateBuilderIntegration(...)`.
- Fixture derived from bridge preview fixture data when useful.

The preview must not use:

- `buildExecutionRecordCandidate(...)`.
- Live Avanza data.
- Supabase writes.
- localStorage writes.
- Execution-record candidate creation.
- Execution-record creation.
- Audit append.
- Stats/PnL update.
- Rollback/correction execution.
- Trade mutation.
- Browser/Avanza automation.
- Broker/order actions.

## 5. Preview Content

Adapter sections:

- Adapter status.
- Proposed `ExecutionRecordCreationInput` summary.
- Field mapping summary.
- Precondition summary.
- Schema readiness summary.
- Idempotency summary.
- Audit/provenance summary.
- Blocked reasons.
- Warnings.
- Review items.
- Safety policy.

Adapter-validator sections:

- Validation status.
- Decision recommendation.
- Validated proposed input summary.
- Field mapping validation summary.
- Precondition validation summary.
- Schema readiness validation summary.
- Idempotency validation summary.
- Audit/provenance validation summary.
- Safety policy validation summary.
- Authority flags.
- Blocked reasons.
- Warnings.
- Review items.

## 6. Safety Labels

Required visible labels:

- Dev preview only.
- Candidate builder integration preview only.
- Proposed input only.
- Validation-only.
- Does not call `buildExecutionRecordCandidate(...)`.
- Does not create execution-record candidate.
- Does not create execution record.
- Not persistence approval.
- Not audit append approval.
- Not stats/PnL update approval.
- Not rollback/correction approval.
- Does not mutate trade state.
- Does not send to broker.
- No Avanza/browser action.
- Automatic mode disabled.
- `safeToCallCandidateBuilder=false`.
- `safeToCreateExecutionRecordCandidate=false`.
- `safeToCreateExecutionRecord=false`.
- `safeToPersist=false`.
- `safeToUpdateStats=false`.
- `safeToAppendAudit=false`.
- `safeToRollback=false`.
- `safeToMutateTrade=false`.

## 7. Interaction Model

The future preview should be:

- Read-only.
- Dev-gated.
- Collapsible.
- Triggered explicitly if it computes fixture output on demand.

Allowed future interaction:

- A button or control labelled `Run candidate builder integration preview`.
- The trigger may shape adapter output and validate adapter output only.

Forbidden interaction:

- No call builder.
- No create candidate.
- No create record.
- No persist.
- No update stats.
- No append audit.
- No rollback/correct.
- No mutate trade.
- No Avanza/browser action.
- No broker send.
- No production write button.

## 8. State Display Rules

Adapter states:

- `adapter_input_ready`: show as proposed-input-ready only, not builder-ready.
- `adapter_input_needs_review`: show review state.
- `adapter_input_blocked`: show blocked state.
- `adapter_input_unsupported`: show unsupported state.
- `adapter_input_not_ready`: show not-ready state.

Adapter validator states:

- `adapter_validation_valid`: show validation-valid only, not builder
  invocation approval.
- `adapter_validation_needs_review`: show review state.
- `adapter_validation_blocked`: show blocked state.
- `adapter_validation_unsupported`: show unsupported state.
- `adapter_validation_invalid`: show invalid state.

Display rule:

- No state should be labelled as ready to create an execution-record candidate,
  ready to create an execution record, ready to persist, ready to append audit,
  ready to update stats/PnL, ready to mutate trades, or ready to send broker
  actions.

## 9. Relationship To Candidate Builder

The preview must not call `buildExecutionRecordCandidate(...)`.

Adapter output can later feed the candidate builder only after a separate
explicit design/action approves the invocation boundary.

Related boundaries:

- Builder invocation remains a separate future boundary.
- Builder output remains candidate-only.
- Persistence validator remains separate.
- Insert route remains separate.
- Production write path remains separate and future.

## 10. Relationship To Bridge Dev Preview

The builder integration preview can consume a controlled fixture derived from
the existing bridge preview fixture.

Bridge relationship rules:

- Bridge validation valid does not imply adapter readiness.
- Bridge validation valid does not imply builder readiness.
- Adapter input ready does not imply builder invocation approval.
- Adapter validation valid does not imply candidate builder invocation.
- All states remain no-write.

## 11. Candidate Next Actions

A. Create Execution Record Candidate Builder Integration Dev Preview

- Safest next implementation step.
- Can remain dev-gated, read-only, fixture-first, and no-write.
- Gives maintainers visibility into adapter and validator output before a
  builder invocation boundary is designed.

B. Create Execution Record Candidate Builder Invocation Design

- Useful after the preview makes adapter and validator output inspectable.
- Higher risk before the preview clarifies user-facing safety labels.

C. Create Supabase Execution Records Migration Checklist Update

- Useful for schema readiness, but not the immediate preview gap.

D. Create Provisional Trade State Design

- Useful later after candidate creation and persistence boundaries exist.

## 12. Recommended Next Action

**Action 567 - Create Execution Record Candidate Builder Integration Dev Preview**

Reason:

- The safest next step is a dev-gated, read-only implementation that visualizes
  adapter output and adapter-validator output while still avoiding candidate
  builder invocation, candidate creation, record creation, persistence, audit,
  stats, rollback, trade mutation, browser/Avanza behavior, broker behavior,
  and order behavior.

## 13. Risk Assessment

Preview mistaken for builder invocation:

- Mitigation: visible labels must state the preview does not call
  `buildExecutionRecordCandidate(...)`.

`adapter_input_ready` overtrusted:

- Mitigation: display as proposed-input-ready only, not builder-ready.

`adapter_validation_valid` overtrusted:

- Mitigation: display as validation-valid only, not invocation approval.

Proposed input mistaken for execution-record candidate:

- Mitigation: label proposed input as `ExecutionRecordCreationInput` shape only.

Execution-record candidate mistaken for persistence approval:

- Mitigation: preview must not create a candidate; future candidate output must
  still remain separate from persistence approval.

Generated types assumed available:

- Mitigation: schema readiness section must show generated type status.

Migration assumed applied:

- Mitigation: schema readiness section must show migration application status.

Audit/provenance assumed complete:

- Mitigation: audit/provenance summary and validation summary must be visible.

Idempotency/fingerprint drift hidden:

- Mitigation: idempotency summary and validation summary must be visible.

Future UI overtrust:

- Mitigation: read-only dev-gated design with prominent safety labels.

Supabase write path opened too early:

- Mitigation: no Supabase client, no write button, no persistence approval.

## 14. Verification

Action 566 verification:

- `git diff --check`

No runtime validation is required because Action 566 is documentation-only.

## 15. Action 567 Follow-Up - Dev Preview Created

Action 567 created the dev-gated Execution Record Candidate Builder Integration
Preview and controlled fixture.

Implemented files:

- `components/execution/ExecutionRecordCandidateBuilderIntegrationPreview.tsx`
- `lib/execution-record-candidate-builder-integration-dev-fixture.ts`

The preview is read-only, fixture-only, explicit-trigger-only, and visually
separate from the existing Execution Record Bridge Preview. It calls only the
pure adapter and pure adapter-validator:

- `shapeExecutionRecordCandidateBuilderInput(...)`
- `validateExecutionRecordCandidateBuilderIntegration(...)`

It does not call `buildExecutionRecordCandidate(...)`, create
execution-record candidates, create execution records, persist/write, write
Supabase/localStorage, append audit, update stats/PnL, rollback/correct, mutate
trades, use live Avanza data, run capture/browser/Avanza behavior, run broker
behavior, or run order behavior.

Next recommended action:

**Action 568 - Reassess Execution Record Candidate Builder Integration Dev Preview**

## 16. Action 568 Follow-Up - Dev Preview Reassessed

Action 568 created
`docs/execution-record-candidate-builder-integration-dev-preview-reassessment.md`.

Reassessment result:

- The implemented preview remains dev-gated, fixture-only,
  explicit-trigger-only, and read-only.
- It calls only `shapeExecutionRecordCandidateBuilderInput(...)` and
  `validateExecutionRecordCandidateBuilderIntegration(...)`.
- It does not call `buildExecutionRecordCandidate(...)`, create
  execution-record candidates, create execution records, persist/write, write
  Supabase/localStorage, append audit, update stats/PnL, rollback/correct,
  mutate trades, use live Avanza data, run capture/browser/Avanza behavior,
  run broker behavior, or run order behavior.

Next recommended action:

**Action 569 - Create Execution Record Candidate Builder Invocation Design**

## 17. Action 569 Follow-Up - Invocation Design Created

Action 569 created a documentation-only invocation design for the future call
to `buildExecutionRecordCandidate(...)`.

Dev preview design impact:

- The existing integration preview remains adapter/validator-only.
- Any future builder invocation preview must be separate, dev-gated,
  read-only, explicit-trigger-only, candidate-only, and no-write.
- No production button or write path was added.

Next recommended action:

**Action 570 - Create Execution Record Candidate Builder Invocation Contract Types**

## 18. Action 570 Follow-Up - Invocation Contract Types Created

Action 570 added contract types for a future builder invocation boundary.

Dev preview design impact:

- The existing integration preview remains adapter/validator-only.
- The new contract is not UI wiring and does not add a builder invocation
  preview.
- Any future invocation preview remains a separate action.

Next recommended action:

**Action 571 - Reassess Execution Record Candidate Builder Invocation Contract Types**

## 19. Action 571 Follow-Up - Invocation Contract Reassessed

Action 571 reassessed invocation contract types and confirmed they do not alter
the dev preview design.

Dev preview design impact:

- Future invocation remains a separate boundary.
- No invocation preview, runtime call, or production button was added.

Next recommended action:

**Action 572 - Create Execution Record Candidate Builder Invocation Validator Design**

## 20. Action 572 Follow-Up - Invocation Validator Design Created

Action 572 created a documentation-only design for a future invocation
validator.

Dev preview design impact:

- The existing integration preview remains unchanged.
- Future invocation preview design should wait for invocation validator
  contract types.

Next recommended action:

**Action 573 - Create Execution Record Candidate Builder Invocation Validator Contract Types**

## Action 573 Follow-Up - Invocation Validator Contract Types Created

Action 573 created invocation validator contract types for a future
validation-only boundary after invocation contract metadata.

Dev preview impact:

- The preview remains diagnostic/read-only.
- No validator implementation or builder invocation was added.
- No candidate/record creation, persistence/write behavior, audit append,
  stats/PnL update, rollback/correction, trade mutation, UI automation,
  Avanza/browser behavior, broker action, or order behavior was added.

Next recommended action:

**Action 574 - Reassess Execution Record Candidate Builder Invocation Validator Contract Types**

## Action 574 Follow-Up - Invocation Validator Contract Reassessed

Action 574 reassessed the invocation validator contract types.

Dev preview design impact:

- The preview design remains read-only and dev-gated.
- The contract reassessment confirms no runtime validator or builder call
  exists.
- No candidate/record creation, persistence/write behavior, audit append,
  stats/PnL update, rollback/correction, trade mutation, browser/Avanza,
  broker, or order behavior was added.

Next recommended action:

**Action 575 - Create Execution Record Candidate Builder Invocation Validator**

## Action 575 Follow-Up - Invocation Validator Created

Action 575 implemented the pure invocation validator.

Dev preview design impact:

- No dev preview UI change was made.
- Future preview work can read invocation validator output, but the validator
  itself remains no-write and no-builder-call.
- No candidate/record creation, persistence/write behavior, audit append,
  stats/PnL update, rollback/correction, trade mutation, browser/Avanza,
  broker, or order behavior was added.

Next recommended action:

**Action 576 - Reassess Execution Record Candidate Builder Invocation Validator**

## Action 576 Follow-Up - Invocation Validator Reassessed

Action 576 reassessed the pure invocation validator.

Dev preview design impact:

- Existing integration preview design remains unchanged.
- A future invocation preview should be designed separately and remain
  dev-gated, read-only, explicit-trigger-only, and no-write.
- No runtime behavior changed.

Next recommended action:

**Action 577 - Create Execution Record Candidate Builder Invocation Dev Preview Design**

## Action 577 Follow-Up - Invocation Dev Preview Design Created

Action 577 designed the future invocation preview as a separate dev-gated
section near Candidate Builder Integration Preview.

Integration preview design impact:

- Existing integration preview design remains unchanged.
- Future invocation preview may derive controlled fixture data from integration
  preview fixtures.
- Adapter validation valid still does not imply invocation approval or builder
  call approval.
- No runtime behavior changed.

Next recommended action:

**Action 578 - Create Execution Record Candidate Builder Invocation Dev Preview**
