# Finalization State Transition Validator Design

## 1. Purpose

Action 514 defines a future Finalization State Transition Validator boundary.
The validator should eventually inspect a proposed finalization state
transition and determine whether it is a valid transition candidate.

The validator must not apply the transition. It must not finalize, persist,
create execution records, update stats/PnL, mutate trades, wire UI, capture
broker evidence, automate Avanza/browser behavior, or perform broker behavior.

This document is design-only. It does not implement a validator, state
transition, finalization action, persistence/write behavior, audit append,
execution-record creation, stats/PnL update, trade mutation, UI wiring,
capture/browser/Avanza behavior, broker behavior, or production runtime
behavior.

## 2. Scope

Included scope:

- Transition candidate validation.
- Source/target state compatibility.
- Prerequisite validation.
- Boundary readiness validation.
- Audit/correction readiness validation.
- Manual approval metadata validation.
- Conservative safety policy expectations.

Excluded scope:

- Applying state transition.
- Finalization implementation.
- Persistence/write behavior.
- Supabase/localStorage writes.
- Audit append.
- Execution-record creation.
- Stats/PnL update.
- Trade mutation.
- UI.
- Avanza/browser/capture behavior.
- Broker behavior.

## 3. Validator Inputs

The future validator should accept structured input that can include:

- `FinalizationTransitionInput`.
- `FinalizationValidationResult`.
- `FinalizationCandidate`.
- Transition source state.
- Proposed target state.
- Boundary status metadata.
- Manual approval context.
- Audit/correction metadata.
- Optional builder result context.
- Optional final settlement note matching context.
- Optional execution-record candidate metadata.
- Optional provisional trade context.

Inputs are evidence for validation only. Their presence must not grant write,
transition, finalization, execution-record creation, stats/PnL update, trade
mutation, browser automation, Avanza automation, or broker authority.

## 4. Validator Outputs

The future validator should produce one of these statuses:

- `transition_candidate_valid`: the proposed transition is internally coherent
  and may be reviewed by a separate future action boundary.
- `needs_review`: the transition is inspectable but requires manual review or
  additional approval metadata.
- `blocked`: the transition has a blocking defect or unsafe condition.
- `unsupported`: the source/target pair, source evidence, broker/source, or
  requested behavior is unsupported.
- `not_ready`: required evidence or metadata is incomplete.

Output should include:

- Status.
- Prerequisite results.
- Blocked reasons.
- Warnings.
- Decision recommendation.
- Audit/correction requirements.
- Boundary readiness summary.
- Safety policy.
- `safeToTransition=false`.
- `safeToFinalize=false`.
- `safeToPersist=false`.
- `safeToCreateExecutionRecord=false`.
- `safeToUpdateStats=false`.
- `safeToMutateTrade=false`.
- `transitionApplied=false`.
- `finalizationAttempted=false`.
- `persistenceAttempted=false`.
- `executionRecordCreationAttempted=false`.
- `statsUpdateAttempted=false`.
- `tradeMutationAttempted=false`.

`transition_candidate_valid` must not mean the transition has occurred. It only
means the candidate may proceed to a separate future finalization action or
state-transition application boundary.

## 5. Source/Target Compatibility

The validator should compare the requested source/target pair against the
contract decision table.

Expected compatible pairs:

| Source state | Target concept |
| --- | --- |
| `ready_for_finalization_review` | `finalization_review_ready` |
| `needs_review` | `finalization_needs_review` |
| `partial_fill_review` | `finalization_needs_review` |
| `duplicate_review` | `finalization_needs_review` |
| `blocked` | `finalization_blocked` |
| `unsupported` | `finalization_blocked` |
| `not_ready` | `finalization_blocked` |

Additional handling:

- `finalization_candidate_built` should be treated as not ready for transition
  until a validation result is present.
- `finalization_approved_pending_write`, `finalization_write_pending`,
  `finalized`, `finalization_rejected`, `finalization_rolled_back`, and
  `correction_needed` remain future target concepts and require later action
  contracts before use.
- Unsupported source/target pairs should return `unsupported` or `blocked`,
  not a write.

## 6. Prerequisite Validation

The validator should check:

- Valid finalization candidate.
- Acceptable finalization validation result.
- Manual review or approval if required.
- No duplicate conflict.
- No partial-fill ambiguity unless routed to review.
- No unsafe authority flags.
- Unresolved PnL/fee/FX uncertainty handled as review-only.
- Persistence boundary available only if a future write is requested.
- Execution-record boundary available only if future record creation is
  requested.
- Stats/PnL boundary available only if future stats update is requested.
- Audit/correction strategy available.

Prerequisite failures should return `needs_review`, `blocked`,
`unsupported`, or `not_ready` depending on whether the failure is reviewable,
unsafe, unsupported, or incomplete.

Prerequisite validation must not call write boundaries. It only evaluates
metadata that was supplied to the validator.

## 7. Boundary Readiness Validation

The validator should inspect boundary readiness metadata for:

- Persistence boundary.
- Execution-record boundary.
- Stats/PnL boundary.
- Trade mutation boundary.
- Audit append boundary.
- Correction/rollback boundary.

Boundary readiness checks are metadata-only:

- Do not write Supabase/localStorage.
- Do not append audit records.
- Do not create execution records.
- Do not update statistics or PnL.
- Do not mutate trade state.
- Do not open or close positions.
- Do not invoke broker or Avanza behavior.

If a transition candidate references a future write, creation, stats, or
mutation operation before the relevant boundary exists, the validator should
block or require review.

## 8. Audit/Correction Validation

The validator should verify metadata for:

- Source evidence traceability.
- Before/after value availability.
- Duplicate finalization prevention.
- Correction/rollback path.
- Audit trail readiness.
- Manual approval traceability.

Missing audit or correction readiness should block finalization-oriented paths
or route them to review. A valid audit/correction metadata check still does
not append audit records or apply a transition.

## 9. Blocked Paths

The validator should block or reject unsafe candidates when it detects:

- Unsupported source/target pair.
- Missing candidate.
- Missing validation result.
- Unsafe authority flag.
- Missing audit/correction strategy.
- Missing required boundary metadata.
- Duplicate conflict.
- Finalization action not defined.
- Automatic mode attempted.
- Persistence coupling detected.
- Trade mutation coupling detected.
- Stats/PnL coupling detected.
- Execution-record creation coupling detected.
- Audit append coupling detected.
- Browser/Avanza/broker automation attempted.

Blocked paths must be explicit in output via blocked reasons, prerequisite
results, warnings, and boundary readiness summary metadata.

## 10. Manual Approval Semantics

Manual approval may make a transition candidate review-ready only.

Manual approval does not:

- Apply the transition.
- Finalize a trade.
- Persist data.
- Append audit records.
- Create execution records.
- Update stats/PnL.
- Mutate trades.
- Enable automatic mode.
- Enable browser, Avanza, or broker automation.

Approval metadata must remain explicit, traceable, and separate from any future
action that applies state or writes data.

## 11. Relationship To Finalization Action

The transition validator is upstream of any future finalization action.

A future finalization action remains a separate explicit boundary that must
define:

- Action request and response contracts.
- Approval requirements.
- Write boundaries.
- Audit/correction behavior.
- Idempotency and duplicate prevention.
- Error and rollback behavior.

The transition validator cannot write, apply target state, finalize, or imply
that a finalization action has been approved.

## 12. Relationship To Execution Records/Stats/Trades

Execution records:

- The validator does not create execution records.
- Execution-record candidate builders, creation validators, persistence
  validators, insert routes, and Supabase writes remain separate future
  boundaries.

Stats/PnL:

- The validator does not update statistics or realized PnL.
- Fee, FX, cash, and realized-PnL updates require a separate approved boundary.

Trades:

- The validator does not mutate live or historical trade state.
- It does not open positions, close positions, or mark trades finalized.
- Trade mutation remains a separate future boundary.

## 13. Candidate Next Actions

A. Create Finalization State Transition Validator Contract Types

- Define type/constants for validator input, result, statuses, prerequisite
  checks, boundary readiness summary, blocked reasons, warnings, and
  conservative safety policy.

B. Create Finalization Action Contract Types

- Define explicit future finalization action request/response shapes after the
  transition validator contract exists.

C. Create Execution Record Integration Reassessment

- Reassess how transition validation should reference execution-record
  metadata without creating records.

D. Create Provisional Trade State Design

- Define provisional trade lifecycle state before finalized trade mutation.

## 14. Recommended Next Action

Recommended default:

**Action 515 - Create Finalization State Transition Validator Contract Types**

## Action 515 Follow-Up - Finalization State Transition Validator Contract Types Created

Action 515 created
`lib/finalization-state-transition-validator-contract.ts`.

Design implementation boundary:

- The new module defines TypeScript contract types and constants only.
- It models validator input, result, statuses, source/target compatibility,
  prerequisites, prerequisite results, boundary readiness, audit/correction
  readiness, blocked reasons, warnings, decision recommendation, and safety
  policy.
- It keeps `safeToApplyTransition=false`, `safeToFinalize=false`,
  `safeToPersist=false`, `safeToCreateExecutionRecord=false`,
  `safeToUpdateStats=false`, `safeToMutateTrade=false`, and
  `automaticModeAllowed=false`.
- It does not implement validator logic.
- It does not apply transition state.
- It does not implement finalization, persistence/write behavior,
  execution-record creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, broker behavior, or production runtime
  behavior.

Next recommended action:

**Action 516 - Reassess Finalization State Transition Validator Contract Types**

## Action 516 Follow-Up - Finalization State Transition Validator Contract Reassessed

Action 516 created
`docs/finalization-state-transition-validator-contract-reassessment.md`.

Design reassessment impact:

- The Action 515 contract types were verified against this design.
- Input, result, statuses, source-target compatibility, prerequisites,
  prerequisite results, boundary readiness, audit/correction readiness, blocked
  reasons, warnings, decision recommendation, and safety policy align with the
  design.
- The contract remains type-only/constants-only.
- The contract does not implement validator logic or apply transition state.
- No transition validator implementation, transition implementation,
  finalization implementation, persistence/write behavior, execution-record
  creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, broker behavior, or production runtime
  behavior was added.

Next recommended action:

**Action 517 - Create Finalization State Transition Validator**

## Action 517 Follow-Up - Finalization State Transition Validator Created

Action 517 created `lib/finalization-state-transition-validator.ts`.

Design implementation impact:

- Implemented pure `validateFinalizationStateTransition(...)`.
- The validator inspects proposed transition metadata and returns a typed
  validation result.
- It handles source-target compatibility, prerequisites, boundary readiness
  metadata, audit/correction readiness, blocked paths, review paths, warnings,
  and decision recommendation conservatively.
- It does not apply target state.
- It does not finalize, persist, create execution records, update stats/PnL,
  mutate trades, wire UI, capture/browser/Avanza behavior, broker behavior, or
  production runtime behavior.

Next recommended action:

**Action 518 - Reassess Finalization State Transition Validator**

## Action 518 Follow-Up - Finalization State Transition Validator Reassessed

Action 518 created
`docs/finalization-state-transition-validator-reassessment.md`.

Design reassessment impact:

- The implemented validator was verified against this design.
- Source-target compatibility, prerequisites, boundary readiness,
  audit/correction readiness, blocked/review paths, warnings, and decision
  recommendation remain conservative.
- The validator remains validation-only and does not apply target state.
- No transition application, finalization, persistence/write behavior,
  execution-record creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, or broker behavior was added.

Next recommended action:

**Action 519 - Create Finalization Action Contract Types**

## 15. Risk Assessment

Validator mistaken for transition applier:

- Risk: a valid transition candidate is treated as applied state.
- Control: validator output must keep `safeToTransition=false` and
  `transitionApplied=false`.

Valid transition candidate mistaken for mutation approval:

- Risk: `transition_candidate_valid` is treated as finalization, persistence,
  execution-record creation, stats/PnL update, or trade mutation approval.
- Control: all write and mutation safety flags remain false.

Manual approval overtrusted:

- Risk: approval metadata is treated as permission to write or automate.
- Control: manual approval only supports review readiness until later action
  contracts exist.

Boundary readiness overtrusted:

- Risk: boundary metadata is treated as invoking the boundary.
- Control: readiness checks remain metadata-only and do not call writes.

Audit/correction missing:

- Risk: transition candidates progress without traceability or correction
  strategy.
- Control: audit/correction readiness is a prerequisite.

Persistence coupling too early:

- Risk: transition validation is wired directly to Supabase/localStorage.
- Control: persistence remains separate and `safeToPersist=false`.

Execution-record coupling too early:

- Risk: transition validation creates execution records.
- Control: execution-record creation remains separate and
  `safeToCreateExecutionRecord=false`.

Stats/trade mutation coupling too early:

- Risk: transition validation updates realized PnL or trade lifecycle state.
- Control: `safeToUpdateStats=false`, `safeToMutateTrade=false`, and automatic
  mode remains disabled.

## 16. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, transition
validator implementation, state transition implementation, finalization
implementation, persistence/write behavior, Supabase/localStorage write, audit
append, execution-record creation, stats/PnL update, trade mutation, UI wiring,
capture/browser/Avanza behavior, broker behavior, or production runtime
behavior was added.
