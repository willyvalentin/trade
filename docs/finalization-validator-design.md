# Finalization Validator Design

## 1. Purpose

Action 506 defines a future Finalization Validator boundary. The validator will
eventually inspect a `FinalizationCandidate` and related diagnostic context to
decide whether the candidate is eligible for review, blocked, ready for a
future finalization action, or still needs manual review.

This document is design-only. It does not implement the validator, finalization,
persistence, execution-record creation, stats/PnL updates, trade mutation, UI
wiring, capture, browser automation, Avanza behavior, broker behavior, or
production runtime behavior.

## 2. Scope

Included scope:

- Validating `FinalizationCandidate` readiness.
- Defining hard gates.
- Defining review gates.
- Defining blocked paths.
- Checking safety policy metadata.
- Defining manual review requirements.

Excluded scope:

- Validator implementation.
- Finalization state transition.
- Persistence/write behavior.
- Execution-record creation.
- Stats/PnL update.
- Trade mutation.
- UI.
- Capture/browser/Avanza behavior.

## 3. Validator Inputs

The future validator should accept a structured input that can include:

- `FinalizationCandidate`.
- Finalization candidate builder result.
- Final settlement note matching result.
- Provisional trade context, when available.
- Execution-record candidate metadata, when available.
- Policy snapshot.
- Manual review context, when available.

Inputs should be treated as evidence for validation only. They must not grant
write authority by being present.

## 4. Validator Outputs

The future validator should produce one of these statuses:

- `ready_for_finalization_review`: the candidate passed validator gates and may
  be shown as ready for a separate future finalization review step.
- `blocked`: the candidate has a blocking defect or unsafe condition.
- `needs_review`: the candidate is inspectable but requires manual review.
- `partial_fill_review`: the candidate involves partial-fill conditions that
  require explicit review.
- `duplicate_review`: the candidate has duplicate or duplicate-risk conditions
  that require explicit review.
- `unsupported`: the candidate source or broker is unsupported.
- `not_ready`: required evidence is incomplete or not yet ready.

Output should include:

- Status.
- Rejection reasons.
- Review flags.
- Warnings.
- Validation gates.
- Safety policy.
- Finalization readiness summary.
- `safeToFinalize=false` by default.
- `safeToPersist=false`.
- `safeToCreateExecutionRecord=false`.
- `safeToUpdateStats=false`.
- `safeToMutateTrade=false`.

`ready_for_finalization_review` must not mean finalization has occurred. It only
means the candidate may proceed to a separate future finalization action
boundary.

## 5. Hard Gates

The validator should require these hard gates before it can return a reviewable
or ready status:

- Candidate exists.
- Candidate status is `candidate_ready` or otherwise reviewable.
- Source/evidence summary is present.
- Match summary is present.
- Settlement summary is present.
- Note/reference is present.
- Provenance is present.
- No duplicate conflict is present.
- No blocking mismatch is present.
- Broker/source is supported.
- Handoff fingerprint is present.
- Safety policy is present and conservative.

Failure of a hard gate should produce `blocked`, `unsupported`, or `not_ready`
depending on whether the failure is unsafe, unsupported, or incomplete.

## 6. Review Gates

The validator should allow inspectable candidates to require manual review for:

- Partial fill review.
- Missing fee/FX data.
- PnL adjustment uncertainty.
- Settlement date uncertainty.
- Account/category ambiguity.
- Manual review required by upstream candidate metadata.
- Policy mismatch.
- Candidate generated from fixture/dev source.
- Unsupported but inspectable source.

Review gates should not authorize finalization. They should explain why a human
or future approved review authority must inspect the candidate before any
separate finalization action can run.

## 7. Blocked Paths

The validator should block candidates when it detects:

- Candidate blocked.
- Missing final note source.
- Missing provenance.
- Unacceptable match.
- Duplicate conflict.
- Unsupported broker/source.
- Candidate safety policy missing.
- Candidate authority flags unexpectedly true.
- Automatic mode attempt.
- Execution-record, persistence, or trade mutation coupling detected.

Blocked paths must be explicit in the output via rejection reasons, validation
gate results, and warnings when useful.

## 8. Safety Policy Validation

The validator must enforce conservative safety semantics:

- Candidate authority flags cannot be true.
- The validator cannot enable writes by itself.
- `safeToFinalize=false` until a later finalization action boundary exists.
- `safeToPersist=false`.
- `safeToCreateExecutionRecord=false`.
- `safeToUpdateStats=false`.
- `safeToMutateTrade=false`.

If a candidate arrives with authority flags unexpectedly set to true, the
validator should block it and report the unexpected authority as a safety-policy
violation.

## 9. Manual Review Semantics

Manual review means a human or separately approved future review authority must
inspect the validation output before any finalization action is attempted.

Manual review does not equal finalization. A review state may be displayed in UI
or diagnostics, but display alone must not execute finalization, persistence,
execution-record creation, stats/PnL updates, or trade mutation.

Future approval mechanics must be explicit, auditable, and separate from this
validator.

## 10. Relationship To Finalization Action

The validator is upstream of any future finalization action. Passing validator
gates does not finalize a trade.

A future finalization action must be:

- Separate from the validator.
- Explicitly triggered.
- Auditable.
- Gated by its own contract.
- Conservative by default.

The validator may say a candidate is ready for finalization review, but it must
not perform the finalization action or mutate finalization state.

## 11. Relationship To Execution Records

The validator does not create execution records.

Execution-record candidate builder logic remains separate. Execution-record
persistence validation remains separate. Supabase migration/application remains
separate. Any future execution-record write path must have its own explicit
contract, validator, audit trail, and approval boundary.

## 12. Relationship To Stats/PnL

The validator may validate PnL adjustment readiness as diagnostic context.

It does not:

- Update statistics.
- Update realized PnL.
- Write performance records.
- Apply cash or fee adjustments.

Stats/PnL updates require a separate approved boundary.

## 13. Relationship To Trade Mutation

The validator does not mutate trade state.

It does not:

- Mark a trade finalized.
- Open positions.
- Close positions.
- Modify trade lifecycle state.
- Run automatic mode actions.

Trade mutation remains a separate future boundary. Automatic mode remains out of
scope.

## 14. Candidate Next Actions

A. Create Finalization Validator Contract Types

- Define the TypeScript contract for validator input, output, gates, statuses,
  safety policy, warnings, review flags, and rejection reasons.

B. Create Finalization Validator

- Implement the pure validator after the contract types are reviewed.

C. Create Finalization State Transition Design

- Design the future state transition that could run after validation and
  approval.

D. Create Execution Record Integration Reassessment

- Reassess how execution-record candidate metadata should interact with the
  finalization validator without creating records.

## 15. Recommended Next Action

Recommended default:

**Action 507 - Create Finalization Validator Contract Types**

## 16. Risk Assessment

Validator mistaken for finalizer:

- Risk: validator output is treated as if a trade was finalized.
- Control: validator output must say it does not finalize.

`ready_for_finalization_review` overtrusted:

- Risk: readiness for review is treated as finalization approval.
- Control: keep status wording review-oriented and require a separate
  finalization action.

Authority flags accidentally enabled:

- Risk: validator or candidate metadata starts carrying write authority.
- Control: authority flags stay false and unexpected true flags block
  validation.

Manual review mistaken for finalization:

- Risk: a review state is treated as an execution command.
- Control: manual review is display/approval context only.

Stats/PnL update assumed:

- Risk: PnL readiness diagnostics are treated as official stats updates.
- Control: validator cannot update statistics or realized PnL.

Execution-record creation assumed:

- Risk: execution-record metadata is treated as creation approval.
- Control: execution-record creation remains separate.

Trade mutation assumed:

- Risk: validation output is treated as trade lifecycle mutation.
- Control: validator cannot mark trades finalized or modify positions.

Future UI overtrust:

- Risk: UI renders validator output as an operational command.
- Control: UI must label validator output as review/diagnostic only until a
  separate action exists.

Premature persistence/finalization coupling:

- Risk: future work wires validator success directly to write paths.
- Control: finalization, persistence, execution-record, stats/PnL, and trade
  mutation boundaries must remain separate.

## 17. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, validator
implementation, finalization implementation, persistence/write behavior,
Supabase/localStorage write, audit append, execution-record creation,
stats/PnL update, trade mutation, UI wiring, capture/browser/Avanza behavior,
broker behavior, or production runtime behavior was added.

## Action 507 Follow-Up - Finalization Validator Contract Types Created

Action 507 created `lib/finalization-validator-contract.ts`.

Design implementation boundary:

- The new module defines TypeScript contract types and constants only.
- It models validator input, result, statuses, hard gates, review gates,
  blocked reasons, warnings, gate results, policy snapshot, safety policy,
  readiness summary, and manual review context.
- It imports existing finalization candidate, builder, matching, and
  execution-record candidate shapes as type-only references.
- It does not implement validator logic.
- It does not implement finalization, persistence, execution-record creation,
  stats/PnL update, trade mutation, UI wiring, capture/browser/Avanza behavior,
  broker behavior, or production runtime behavior.

Next recommended action:

**Action 508 - Reassess Finalization Validator Contract Types**

## Action 508 Follow-Up - Finalization Validator Contract Reassessed

Action 508 created
`docs/finalization-validator-contract-reassessment.md`.

Design reassessment impact:

- The Action 507 contract types were verified against this design.
- The contract remains type-only/constants-only.
- Statuses, hard gates, review gates, blocked reasons, warnings, policy
  snapshot, safety policy, readiness summary, and manual review context align
  with the design.
- The contract does not implement validation, finalization, persistence,
  execution-record creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, broker behavior, or production runtime
  behavior.

Next recommended action:

**Action 509 - Create Finalization Validator**

## Action 509 Follow-Up - Pure Finalization Validator Created

Action 509 created `lib/finalization-validator.ts`.

Design implementation impact:

- Implemented pure `validateFinalizationCandidate(...)`.
- The validator inspects candidate/builder/matching context and returns a typed
  validation result.
- Ready, review, blocked, duplicate, partial-fill, unsupported, and not-ready
  paths remain conservative.
- `ready_for_finalization_review` is still review readiness only, not
  finalization approval.
- No finalization implementation, persistence/write behavior,
  execution-record creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, broker behavior, or production runtime
  behavior was added.

Next recommended action:

**Action 510 - Reassess Finalization Validator**

## Action 510 Follow-Up - Finalization Validator Reassessed

Action 510 created `docs/finalization-validator-reassessment.md`.

Design reassessment impact:

- The implemented validator was verified against this design.
- It validates readiness/review/block status only.
- `ready_for_finalization_review` remains non-authoritative review readiness.
- No finalization state transition, finalization action contract, persistence,
  execution-record creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, or broker behavior was added.

Next recommended action:

**Action 511 - Create Finalization State Transition Design**

## Action 511 Follow-Up - Finalization State Transition Design Created

Action 511 created `docs/finalization-state-transition-design.md`.

Design relationship:

- The validator remains upstream validation/review metadata.
- The state transition design defines future source states, target concepts,
  prerequisites, manual approval boundary, write boundary separation, and
  audit/correction requirements.
- No target state is applied.
- No runtime code changes, finalization implementation, persistence/write
  behavior, execution-record creation, stats/PnL update, trade mutation, UI
  wiring, capture/browser/Avanza behavior, or broker behavior was added.

Next recommended action:

**Action 512 - Create Finalization State Transition Contract Types**

## Action 512 Follow-Up - Finalization State Transition Contract Types Created

Action 512 created `lib/finalization-state-transition-contract.ts`.

Design relationship:

- The transition contract is downstream of validation.
- It can reference `FinalizationValidationResult` as type-only input.
- It keeps `safeToTransition=false` and all write/mutation authority false.
- No validator behavior change, transition implementation, finalization,
  persistence/write behavior, execution-record creation, stats/PnL update,
  trade mutation, UI wiring, capture/browser/Avanza behavior, or broker
  behavior was added.

Next recommended action:

**Action 513 - Reassess Finalization State Transition Contract Types**

## Action 513 Follow-Up - Finalization State Transition Contract Reassessed

Action 513 created
`docs/finalization-state-transition-contract-reassessment.md`.

Design relationship:

- The transition contract remains downstream of validator output.
- The reassessment confirms validator readiness is not transition,
  finalization, persistence, execution-record creation, stats/PnL update, or
  trade mutation approval.
- Target concepts and decision constants are contract metadata only and are not
  applied by runtime behavior.
- No validator design semantics changed.
- No transition implementation, finalization implementation,
  persistence/write behavior, execution-record creation, stats/PnL update,
  trade mutation, UI wiring, capture/browser/Avanza behavior, or broker
  behavior was added.

Next recommended action:

**Action 514 - Create Finalization State Transition Validator Design**

## Action 514 Follow-Up - Finalization State Transition Validator Design Created

Action 514 created
`docs/finalization-state-transition-validator-design.md`.

Design relationship:

- The transition validator design is downstream of finalization validation.
- It treats `ready_for_finalization_review` as transition validation context,
  not finalization or mutation approval.
- It keeps transition candidate validation separate from state application,
  finalization action, persistence, execution-record creation, stats/PnL
  update, and trade mutation.
- No validator design behavior changed and no runtime behavior was added.

Next recommended action:

**Action 515 - Create Finalization State Transition Validator Contract Types**

## Action 515 Follow-Up - Finalization State Transition Validator Contract Types Created

Action 515 created
`lib/finalization-state-transition-validator-contract.ts`.

Design relationship:

- The transition validator contract is downstream of finalization validation
  and upstream of any future state application or finalization action.
- It may reference finalization validation results as type-only input context.
- It keeps transition application and all write/mutation authority false.
- It does not implement validation logic or change finalization validator
  behavior.
- No transition validator implementation, state transition implementation,
  finalization implementation, persistence/write behavior, execution-record
  creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, or broker behavior was added.

Next recommended action:

**Action 516 - Reassess Finalization State Transition Validator Contract Types**

## Action 516 Follow-Up - Finalization State Transition Validator Contract Reassessed

Action 516 created
`docs/finalization-state-transition-validator-contract-reassessment.md`.

Design relationship:

- The transition validator contract remains downstream of finalization
  validation.
- `transition_candidate_valid` remains validation metadata only, not
  finalization or mutation approval.
- Reassessment confirmed all apply/finalize/persist/execution-record/stats/trade
  mutation safety flags remain false.
- No validator implementation, transition implementation, finalization
  implementation, persistence/write behavior, execution-record creation,
  stats/PnL update, trade mutation, UI wiring, capture/browser/Avanza
  behavior, or broker behavior was added.

Next recommended action:

**Action 517 - Create Finalization State Transition Validator**
