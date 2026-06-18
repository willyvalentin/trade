# Execution Record Candidate Builder Invocation Dev Preview Design

Action: 577
Date: 2026-06-18

## 1. Purpose

Define how the execution-record candidate builder invocation boundary and
invocation-validator output can be previewed safely in dev mode.

The future preview should visualize invocation contract/result metadata and
`validateExecutionRecordCandidateBuilderInvocation(...)` output without calling
`buildExecutionRecordCandidate(...)`, creating execution-record candidates,
creating execution records, persisting, writing Supabase/localStorage,
appending audit, updating stats/PnL, running rollback/correction, mutating
trades, controlling browser/Avanza behavior, running broker behavior, or
executing orders.

## 2. Scope

Included:

- Dev-gated invocation preview.
- Read-only visualization.
- Controlled fixture data.
- Explicit trigger.
- Invocation boundary result display.
- Invocation-validator result display.
- Safety labels.

Excluded:

- Implementation.
- `buildExecutionRecordCandidate(...)` call.
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

Late-phase execution handoff modal near candidate-builder integration preview:

- Pros: closest to the adapter/integration preview that can provide the
  controlled fixture lineage.
- Pros: keeps finalization-to-execution-record bridge, adapter, validator, and
  invocation diagnostics in one QA flow.
- Cons: modal density may increase.

Separate diagnostics/dev panel:

- Pros: gives more room for nested invocation and validation summaries.
- Cons: separates the preview from the handoff context that produces the
  invocation metadata.

Execution-record diagnostics area if existing:

- Pros: aligns with future execution-record observability.
- Cons: may imply record creation or persistence earlier than intended.

Recommended first placement:

- Add a dev-gated late-phase modal section near Candidate Builder Integration
  Preview.
- Visually separate it and label it
  `Execution Record Candidate Builder Invocation Preview`.
- Keep it collapsed by default if the modal is dense.

## 4. Data Dependencies

The preview should use:

- Controlled fixture data first.
- Invocation contract fixture.
- Pure `validateExecutionRecordCandidateBuilderInvocation(...)`.
- Fixture derived from candidate-builder integration preview fixture when
  useful.

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

Invocation sections:

- Invocation status.
- Decision recommendation.
- Prerequisite summary.
- Input source summary.
- Output summary.
- Idempotency summary.
- Audit/provenance summary.
- Schema readiness summary.
- Blocked reasons.
- Warnings.
- Review items.
- Safety policy.

Invocation-validator sections:

- Validation status.
- Decision recommendation.
- Prerequisite validation summary.
- Input source validation summary.
- Proposed input validation summary.
- Idempotency validation summary.
- Audit/provenance validation summary.
- Schema readiness validation summary.
- Safety policy validation summary.
- Authority flags.
- Blocked reasons.
- Warnings.
- Review items.

## 6. Safety Labels

Required visible labels:

- Dev preview only.
- Candidate builder invocation preview only.
- Boundary preview only.
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

- A button or control labelled `Run candidate builder invocation preview`.
- The trigger may create fixture invocation metadata and run
  `validateExecutionRecordCandidateBuilderInvocation(...)` only.

Forbidden interaction:

- No call builder.
- No create candidate.
- No create execution record.
- No persist.
- No update stats.
- No append audit.
- No rollback/correct.
- No mutate trade.
- No Avanza/browser action.
- No broker send.
- No production write button.

## 8. State Display Rules

Invocation states:

- `builder_invocation_ready`: show boundary-ready only, not builder-call-ready.
- `builder_invocation_needs_review`: show review state.
- `builder_invocation_blocked`: show blocked state.
- `builder_invocation_unsupported`: show unsupported state.
- `builder_invocation_not_ready`: show not-ready state.

Invocation validator states:

- `builder_invocation_validation_valid`: show validation-valid only, not
  builder-call approval.
- `builder_invocation_validation_needs_review`: show review state.
- `builder_invocation_validation_blocked`: show blocked state.
- `builder_invocation_validation_unsupported`: show unsupported state.
- `builder_invocation_validation_invalid`: show invalid state.

Display rule:

- No state should be labelled as ready to call the builder, ready to create an
  execution-record candidate, ready to create an execution record, ready to
  persist, ready to append audit, ready to update stats/PnL, ready to mutate
  trades, or ready to send broker actions.

## 9. Relationship To Candidate Builder

The preview must not call `buildExecutionRecordCandidate(...)`.

Invocation output can later gate a separate builder call only after a separate
explicit design/action approves that boundary.

Related boundaries:

- Builder invocation remains a separate future boundary.
- Builder output remains candidate-only.
- Persistence validator remains separate.
- Insert route remains separate.
- Production write path remains separate and future.

## 10. Relationship To Integration Preview

The invocation preview can consume a controlled fixture derived from the
candidate-builder integration preview.

Integration relationship rules:

- Adapter validation valid does not imply invocation approval.
- Builder invocation validation valid does not imply builder call.
- All states remain no-write.
- The invocation preview should appear near the integration preview but remain
  visually separate so users do not confuse adapter readiness with invocation
  validation.

## 11. Candidate Next Actions

A. Create Execution Record Candidate Builder Invocation Dev Preview.

- Best next step because the design can be implemented with controlled fixture
  data, explicit trigger, read-only display, and no builder call.

B. Create Execution Record Candidate Builder Invocation.

- Useful later, but riskier because it moves closer to
  `buildExecutionRecordCandidate(...)`.
- Should wait until the preview has proven the invocation and validation
  diagnostics are understandable.

C. Create Supabase Execution Records Migration Checklist Update.

- Useful for schema readiness, but does not improve invocation-preview
  observability.

D. Create Provisional Trade State Design.

- Lowest priority for this lane because trade mutation remains out of scope.

## 12. Recommended Next Action

**Action 578 - Create Execution Record Candidate Builder Invocation Dev Preview**

The next action should implement the dev-gated, read-only preview using
controlled fixture data and pure invocation validation only. It must not call
`buildExecutionRecordCandidate(...)`, create candidates, create execution
records, persist/write, append audit, update stats/PnL, rollback/correct,
mutate trades, automate browser/Avanza behavior, or run broker/order behavior.

## 13. Risk Assessment

Preview mistaken for builder invocation:

- Mitigation: labels must say preview-only, validation-only, and no builder
  call.

`builder_invocation_ready` overtrusted:

- Mitigation: display as boundary-ready only, not builder-call-ready.

`builder_invocation_validation_valid` overtrusted:

- Mitigation: display as validation-valid only, not builder-call approval.

Boundary preview mistaken for candidate creation:

- Mitigation: show `safeToCreateExecutionRecordCandidate=false` and no
  candidate output created.

Execution-record candidate mistaken for persistence approval:

- Mitigation: persistence validator, insert route, and production write path
  remain separate.

Generated types assumed available:

- Mitigation: schema readiness summary must show generated type status
  explicitly.

Migration assumed applied:

- Mitigation: migration application status must be visible and separately
  proven.

Audit/provenance assumed complete:

- Mitigation: audit/provenance summary and validation summary must be visible.

Idempotency/fingerprint drift hidden:

- Mitigation: idempotency summary and validation summary must be visible.

Future UI overtrust:

- Mitigation: dev-gated, read-only, explicit-trigger-only preview with no
  production action buttons.

Supabase write path opened too early:

- Mitigation: preview must not import Supabase clients or enable writes.

## 14. Verification

Action 577 verification:

- `git diff --check`

No runtime validation is required because Action 577 is documentation-only.
