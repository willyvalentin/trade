# Execution Record Candidate Builder Invocation Validator Design

## 1. Purpose

Define a future validation layer for the candidate-builder invocation boundary.

The future validator would validate invocation-boundary metadata before any
future call to `buildExecutionRecordCandidate(...)`. This design is
documentation-only and adds no runtime behavior.

## 2. Scope

Included:

- Invocation boundary validation design.
- Prerequisite validation.
- Adapter validation handoff.
- Proposed input validation.
- Schema readiness validation.
- Idempotency validation.
- Audit/provenance validation.
- Safety policy validation.

Excluded:

- Implementation.
- Builder invocation.
- Execution-record candidate creation.
- Execution-record creation.
- Persistence.
- Supabase writes.
- Audit append.
- Stats/PnL update.
- Rollback/correction execution.
- Trade mutation.
- UI wiring.
- Avanza/browser behavior.
- Broker/order behavior.

## 3. Validator Inputs

The future validator may accept:

- `ExecutionRecordCandidateBuilderInvocationResult`
- `ExecutionRecordCandidateBuilderInvocationInput`
- Adapter result
- Adapter validation result
- Proposed `ExecutionRecordCreationInput`
- Integration input/result data
- Bridge validation result
- Bridge mapper result
- Finalization candidate
- Schema readiness metadata
- Idempotency metadata
- Audit/provenance metadata
- Manual approval metadata

The validator should reject any input that attempts to bypass adapter and
adapter-validator gates.

## 4. Validator Outputs

Future output should include:

- Validation status
- Decision recommendation
- Prerequisite validation summary
- Input source validation summary
- Proposed input validation summary
- Idempotency validation summary
- Audit/provenance validation summary
- Schema readiness validation summary
- Safety policy validation summary
- Authority flags
- Blocked reasons
- Warnings
- Review items

Suggested statuses:

- `builder_invocation_validation_valid`
- `builder_invocation_validation_needs_review`
- `builder_invocation_validation_blocked`
- `builder_invocation_validation_unsupported`
- `builder_invocation_validation_invalid`

Decision recommendations:

- `validate_only`
- `needs_manual_review`
- `blocked_do_not_call_builder`
- `unsupported_do_not_call_builder`
- `invalid_do_not_call_builder`

The output must be validation-only and must not be treated as builder call,
candidate creation, record creation, persistence, finalization, audit, stats,
rollback, trade mutation, broker, Avanza, browser, or order approval.

## 5. Validation Rules

The future validator should check:

- Invocation result exists.
- Invocation status is recognized.
- Invocation status is ready only when required summaries exist.
- Adapter validation exists.
- Adapter validation is valid or explicitly review-gated by a future policy.
- Proposed `ExecutionRecordCreationInput` exists.
- Required builder input fields are represented.
- Schema readiness summary exists.
- Idempotency summary exists.
- Audit/provenance summary exists.
- Safety policy exists.
- All builder/create/write/action authority flags are false.
- No candidate builder call occurred.
- Generated types absent/unknown causes review or block according to policy.
- Migration application not proven causes review or block according to policy.
- Direct bridge-to-builder bypass is blocked.
- Direct finalization-to-builder bypass is blocked.
- Live broker/Avanza/browser input is blocked.

`builder_invocation_ready` should be treated as contract readiness metadata
only. It is not proof that the builder was called or should be called.

## 6. Proposed Input Validation

Required proposed input checks should include:

- Ticker/symbol.
- Side.
- Quantity.
- Price.
- Currency.
- Fees/commission.
- FX.
- Gross/net values.
- Execution timestamp.
- Settlement/payment date.
- Broker/source identifiers.
- Final note/reference.
- Source evidence/provenance.
- Idempotency/fingerprint values.
- Audit/provenance metadata.
- Manual approval context.
- Finalization metadata.

Policy notes:

- Missing required builder input fields should block.
- Missing optional financial fields may require review.
- Mismatched ticker, side, quantity, price, currency, or source evidence should
  block.
- Preview-only, mock-only, synthetic, or raw/sensitive source metadata should
  remain rejected or review-gated according to the existing creation contract
  boundary.

## 7. Schema Readiness Validation

The validator should check:

- Generated types present, absent, or unknown.
- Migration application proven or unproven.
- Schema readiness summary is present.
- Schema readiness is not assumed from candidate-only invocation metadata.
- Runtime DB writes are not allowed.

Policy:

- If generated types or migration application are absent/unknown, validation may
  be valid-with-review only if the future policy explicitly allows candidate-
  only invocation without database readiness.
- Any persistence coupling must remain blocked until generated types and
  migration application are separately verified.

## 8. Idempotency Validation

The validator should check:

- Required fingerprint fields are present.
- Duplicate-check metadata is present.
- Bridge fingerprint metadata is preserved.
- Adapter fingerprint metadata is preserved.
- Invocation fingerprint metadata is preserved.
- Candidate-builder fingerprint readiness is represented.
- Missing, weak, or conflicting fingerprints block or require manual review.

Duplicate detection remains separate. The invocation validator should not claim
database uniqueness enforcement.

## 9. Audit/Provenance Validation

The validator should require:

- Source evidence chain.
- Manual approval context where applicable.
- Finalization references.
- Bridge references.
- Adapter validation references.
- Handoff session id and payload id when available.
- Source event ids when available.

Audit append remains a separate future boundary.

Before/after values are required later before any write, correction, or
rollback path. Correction and rollback metadata remain future boundaries and
must not be executed by the invocation validator.

## 10. Safety Policy

Required safety policy:

- Validator is pure and deterministic.
- Validator output is validation-only.
- Validator output is not builder invocation approval.
- Validator output is not execution-record candidate creation approval.
- Validator output is not execution-record creation approval.
- Validator output is not persistence approval.
- Validator output is not audit append approval.
- Validator output is not stats/PnL update approval.
- Validator output is not trade mutation approval.
- All authority flags remain false.
- Automatic mode remains disabled.

Authority flags should include false values for:

- `safeToCallCandidateBuilder`
- `safeToCreateExecutionRecordCandidate`
- `safeToCreateExecutionRecord`
- `safeToPersist`
- `safeToFinalize`
- `safeToUpdateStats`
- `safeToAppendAudit`
- `safeToRollback`
- `safeToMutateTrade`
- `safeToRunBrokerAction`
- `automaticModeAllowed`

## 11. Relationship To Invocation Contract And Builder

The invocation contract defines the future boundary.

The invocation validator validates that boundary.

The validator must not call the builder.

Builder invocation remains a separate future action.

Builder output remains candidate-only.

Persistence validator remains separate.

Insert route remains separate.

Dry-run insert route remains separate.

Production write path remains separate and future.

## 12. Failure/Review States

Future validation should handle:

- Missing invocation result.
- Invalid invocation status.
- Invocation ready with blocked reasons.
- Missing adapter validation.
- Adapter validation not valid.
- Missing proposed input.
- Missing required proposed input fields.
- Schema readiness absent/unknown.
- Migration application not proven.
- Generated types absent/unknown.
- Missing idempotency.
- Conflicting fingerprint.
- Missing audit/provenance.
- Manual approval missing.
- Safety authority violation.
- Unsupported broker/source.
- Direct bridge-to-builder bypass attempt.
- Direct finalization-to-builder bypass attempt.
- Candidate builder invocation already attempted.
- Execution-record candidate creation already attempted.
- Persistence/write authority requested.

## 13. Candidate Next Actions

A. Create Execution Record Candidate Builder Invocation Validator Contract Types

- Best next step.
- Defines validation status, decision, summaries, authority flags, blocked
  reasons, warnings, review items, and inputs before implementation.

B. Create Execution Record Candidate Builder Invocation Dev Preview Design

- Useful after validator contract types define what a preview can display.

C. Create Supabase Execution Records Migration Checklist Update

- Useful for persistence readiness, but not the immediate invocation validator
  boundary.

D. Create Provisional Trade State Design

- Useful later after invocation validation and persistence boundaries are
  clearer.

## 14. Recommended Next Action

**Action 573 - Create Execution Record Candidate Builder Invocation Validator Contract Types**

Reason:

- Contract types can define validation-only output and authority flags before
  any invocation validator implementation, dev preview, or builder call exists.

## 15. Risk Assessment

Invocation validation mistaken for builder call approval:

- Mitigation: validation output must say validation-only and no builder call.

`builder_invocation_validation_valid` overtrusted:

- Mitigation: valid means boundary metadata is internally consistent only.

Candidate builder output mistaken for persistence approval:

- Mitigation: validator must keep persistence, insert routes, and production
  writes separate.

Generated types assumed available:

- Mitigation: schema readiness validation must expose absent/unknown generated
  type status.

Migration assumed applied:

- Mitigation: migration application status must be explicit and separately
  proven.

Audit/provenance metadata dropped:

- Mitigation: audit/provenance validation must require source evidence,
  manual approval, bridge, adapter, and finalization references.

Idempotency/fingerprint drift:

- Mitigation: idempotency validation must compare required fingerprint fields
  and flag missing, weak, or conflicting values.

Duplicate record risk hidden:

- Mitigation: duplicate-check metadata remains visible, while uniqueness
  enforcement stays at the insert boundary.

Supabase write path opened too early:

- Mitigation: no runtime DB writes are allowed and all write authority remains
  false.

Future UI overtrust:

- Mitigation: any future UI must remain dev-gated, read-only, explicit, and
  no-write until separately approved.

## 16. Verification

Action 572 verification:

- `git diff --check`

No runtime validation is required because Action 572 is documentation-only.

## Action 573 Follow-Up - Invocation Validator Contract Types Created

Action 573 created
`lib/execution-record-candidate-builder-invocation-validator-contract.ts`.

The contract defines validation-only input/result, statuses, decision
recommendations, summary types, authority flags, blocked reasons, warnings, and
review items for a future invocation validator. It is type-only/constants-only
and is not a validator implementation.

No runtime behavior was added. The contract does not call
`buildExecutionRecordCandidate(...)`, create execution-record candidates, create
execution records, persist/write, append audit, update stats/PnL,
rollback/correct, mutate trades, wire UI, automate browser/Avanza behavior, run
broker/order behavior, or approve automatic mode.

Next recommended action:

**Action 574 - Reassess Execution Record Candidate Builder Invocation Validator Contract Types**

## Action 574 Follow-Up - Invocation Validator Contract Reassessed

Action 574 created
`docs/execution-record-candidate-builder-invocation-validator-contract-reassessment.md`.

Design impact:

- The invocation validator design remains valid.
- The Action 573 contract types align with the design and remain
  type-only/constants-only.
- No validator implementation, builder invocation implementation, call to
  `buildExecutionRecordCandidate(...)`, candidate creation, record creation,
  persistence/write behavior, audit append, stats/PnL update,
  rollback/correction, trade mutation, UI wiring, browser/Avanza behavior,
  broker behavior, or order behavior was added.

Next recommended action:

**Action 575 - Create Execution Record Candidate Builder Invocation Validator**

## Action 575 Follow-Up - Invocation Validator Created

Action 575 created
`lib/execution-record-candidate-builder-invocation-validator.ts`.

Design impact:

- The validator design now has a pure validation-only implementation.
- The validator checks invocation status, adapter validation, proposed input,
  schema readiness, idempotency/fingerprints, audit/provenance, manual
  approval, safety policy, and authority flags.
- The validator does not call `buildExecutionRecordCandidate(...)`.
- The validator creates no execution-record candidate or execution record and
  performs no persistence/write behavior, audit append, stats/PnL update,
  rollback/correction, trade mutation, UI wiring, browser/Avanza behavior,
  broker behavior, or order behavior.

Next recommended action:

**Action 576 - Reassess Execution Record Candidate Builder Invocation Validator**

## Action 576 Follow-Up - Invocation Validator Reassessed

Action 576 reassessed the implemented invocation validator.

Design impact:

- The validator design remains satisfied by a pure validation-only
  implementation.
- The validator remains disconnected from `buildExecutionRecordCandidate(...)`,
  candidate creation, record creation, persistence, audit, stats, rollback,
  trade mutation, UI, browser/Avanza, broker, and order behavior.
- The next safe design step is a dev-gated read-only preview.

Next recommended action:

**Action 577 - Create Execution Record Candidate Builder Invocation Dev Preview Design**

## Action 577 Follow-Up - Invocation Dev Preview Design Created

Action 577 created the documentation-only design for a future invocation dev
preview.

Validator design impact:

- The validator remains pure and validation-only.
- Preview design will display validator summaries, blockers, warnings, review
  items, and authority flags without calling the builder.
- No runtime behavior, UI implementation, builder invocation, candidate/record
  creation, persistence/write behavior, audit append, stats/PnL update,
  rollback/correction, trade mutation, browser/Avanza, broker, or order
  behavior was added.

Next recommended action:

**Action 578 - Create Execution Record Candidate Builder Invocation Dev Preview**
