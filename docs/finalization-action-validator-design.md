# Finalization Action Validator Design

## 1. Purpose

Action 521 defines a future Finalization Action Validator.

The validator will inspect proposed finalization action candidates and the
Action 519 finalization action contract metadata. Its job is to determine
whether an action candidate is reviewable, blocked, unsupported, or not ready.

The validator must not run a finalization action. It must not finalize,
persist, create execution records, update stats/PnL, append audit records,
roll back, mutate trades, wire UI, run capture/browser/Avanza behavior, perform
broker behavior, or add production runtime behavior.

## 2. Scope

Included scope:

- Action candidate validation.
- Authority validation.
- Precondition validation.
- Write boundary validation.
- Audit/correction validation.
- Manual approval validation.
- Blocked reason and warning selection.
- Conservative decision recommendation.
- Safety-policy confirmation.

Excluded scope:

- Running finalization actions.
- Finalization implementation.
- Transition application implementation.
- Persistence/write behavior.
- Supabase/localStorage writes.
- Execution-record creation.
- Stats/PnL update.
- Audit append.
- Rollback/correction execution.
- Trade mutation.
- UI wiring.
- Capture/browser/Avanza behavior.
- Broker behavior.
- Production runtime behavior.

## 3. Validator Inputs

The future validator should accept a structured input that can reference:

- `FinalizationActionInput`.
- `FinalizationActionResult`, if an upstream dry-run/action-contract result is
  available.
- `FinalizationCandidate`.
- `FinalizationValidationResult`.
- `FinalizationStateTransitionValidationResult`.
- `FinalizationTransitionResult`, if available as metadata only.
- Execution-record candidate metadata.
- Persistence boundary status metadata.
- Execution-record creation boundary status metadata.
- Stats/PnL boundary status metadata.
- Trade mutation boundary status metadata.
- Audit append boundary status metadata.
- Correction/rollback boundary status metadata.
- Manual approval context.
- Audit context.
- Correction/rollback strategy metadata.
- Generic diagnostic metadata.

Inputs are read-only. They do not grant write, finalize, mutate, broker,
browser, or automatic execution authority.

## 4. Validator Outputs

The future validator should return one of these statuses:

- `action_candidate_valid`
- `needs_review`
- `blocked`
- `unsupported`
- `not_ready`

The output should include:

- Status.
- Decision recommendation.
- Precondition results.
- Authority validation results.
- Write boundary validation results.
- Audit/correction validation results.
- Blocked reasons.
- Warnings.
- Safety policy.
- Manual approval interpretation.
- Input lineage metadata.
- Audit/correction readiness metadata.

The output must keep:

- `safeToRunFinalizationAction=false`.
- `safeToFinalize=false`.
- `safeToPersist=false`.
- `safeToCreateExecutionRecord=false`.
- `safeToUpdateStats=false`.
- `safeToMutateTrade=false`.
- `safeToAppendAudit=false`.
- `safeToRollback=false`.
- `automaticModeAllowed=false`.

`action_candidate_valid` means the candidate is structurally valid for review.
It is not action execution approval, finalization approval, persistence
approval, execution-record creation approval, stats/PnL update approval, audit
append approval, rollback approval, trade mutation approval, browser approval,
Avanza approval, broker approval, or automatic mode approval.

## 5. Authority Validation

Authority validation should check:

- All authority flags remain false unless a future explicit action boundary and
  reassessment intentionally changes the policy.
- Any unexpected true authority flag blocks validation.
- `automaticModeAllowed=true` blocks validation.
- Dry-run mode remains non-writing.
- Manual-review-only mode remains non-writing.
- Future-write-candidate mode remains metadata-only until a separate
  implementation boundary exists.
- Disabled mode cannot become action execution.

Authority validation should report:

- Which authority flags were observed.
- Which authority flags were expected to remain false.
- Whether any unexpected authority is present.
- Whether automatic mode was requested.
- Whether the candidate must remain review-only.

## 6. Precondition Validation

Precondition validation should require:

- Finalization candidate present.
- Finalization validation result present.
- Finalization validation acceptable for review.
- Transition validation result present.
- Transition validation acceptable for review.
- Manual approval present if required by the candidate, validation, transition,
  boundary, or audit policy.
- No duplicate finalization conflict.
- No unresolved review blocker.
- No unsupported source, broker, evidence, or execution context.
- Audit/correction strategy present when relevant.
- Boundary metadata present when relevant.
- No persistence coupling detected.
- No execution-record coupling detected.
- No stats/PnL coupling detected.
- No audit append coupling detected.
- No rollback/correction coupling detected.
- No trade mutation coupling detected.

Precondition validation should not apply state, mutate records, or write
anything.

## 7. Write Boundary Validation

Write boundary validation should inspect metadata for:

- Finalization write boundary.
- Persistence boundary.
- Execution-record creation boundary.
- Stats/PnL update boundary.
- Audit append boundary.
- Correction/rollback boundary.
- Trade mutation boundary.

All write boundaries are validated as metadata only. The validator must not
invoke them.

Boundary validation should report:

- Boundary name.
- Boundary status.
- Whether boundary metadata is missing.
- Whether a boundary is out of scope.
- Whether a boundary appears coupled to runtime behavior too early.
- Whether manual review is required before any future implementation work.

All boundary `safeToInvoke` semantics remain false.

## 8. Audit/Correction Validation

Audit/correction validation should verify that metadata is present for:

- Source evidence traceability.
- Candidate fingerprint.
- Finalization validation result.
- Transition validation result.
- Approval actor.
- Approval timestamp.
- Before/after state references.
- Write attempt traceability, if a future write path exists.
- Duplicate finalization prevention.
- Correction strategy.
- Rollback or amendment strategy.
- Duplicate correction prevention.
- Correction audit trail requirements.

Audit/correction validation does not append audit records and does not execute
rollback/correction behavior.

## 9. Blocked Paths

The validator should be able to block with:

- `finalization_action_not_enabled`
- `missing_finalization_candidate`
- `missing_finalization_validation`
- `missing_transition_validation`
- `manual_approval_missing`
- `write_boundary_unavailable`
- `audit_requirement_missing`
- `correction_strategy_missing`
- `authority_flag_unexpectedly_true`
- `persistence_coupling_detected`
- `execution_record_coupling_detected`
- `stats_update_coupling_detected`
- `audit_append_coupling_detected`
- `rollback_coupling_detected`
- `trade_mutation_coupling_detected`
- `automatic_mode_not_allowed`

Blocked output should explain the missing or unsafe condition and preserve all
false safety flags.

## 10. Manual Approval Semantics

Manual approval may allow review progression only.

Manual approval is not:

- Write authorization.
- Finalization execution.
- Persistence authorization.
- Execution-record creation authorization.
- Stats/PnL update authorization.
- Audit append authorization.
- Rollback/correction authorization.
- Trade mutation authorization.
- Broker action authorization.
- Browser/Avanza action authorization.
- Automatic mode authorization.

The validator should distinguish approval metadata from execution authority.

## 11. Relationship To Finalization Action

The finalization action validator is upstream of any finalization action
implementation.

It may inspect `FinalizationActionInput` and candidate action metadata, but it
does not run the action. A future finalization action implementation remains a
separate explicit boundary requiring its own contract, validator, reassessment,
safety policy, tests, and manual approval semantics.

## 12. Relationship To Persistence/Execution Records/Stats/Audit/Trades

The validator does not persist.

It does not create execution records.

It does not update stats/PnL.

It does not append audit records.

It does not roll back or correct records.

It does not mutate trades.

It does not call Supabase/localStorage write paths.

It does not wire UI, capture/browser/Avanza behavior, broker behavior, order
execution, or production runtime behavior.

## 13. Candidate Next Actions

A. Create Finalization Action Validator Contract Types

- Define validator-specific input/result/status/reason types.
- Keep output separate from action execution approval.

B. Create Finalization Action Validator

- Implement the validator only after contract types exist.
- Keep implementation pure, deterministic, and non-writing.

C. Create Execution Record Integration Reassessment

- Reassess execution-record metadata relationships before creation behavior.
- Keep execution-record creation disabled.

D. Create Provisional Trade State Design

- Define provisional trade lifecycle states before finalized mutation behavior.
- Keep trade mutation disabled.

## 14. Recommended Next Action

Recommended default:

**Action 522 - Create Finalization Action Validator Contract Types**

Rationale:

- The validator design now defines the validation boundary.
- Contract types are the safest next step before implementation.
- They can encode statuses, authority validation results, boundary readiness,
  audit/correction readiness, blocked reasons, warnings, and false safety flags
  without adding runtime behavior.

## 15. Risk Assessment

Validator mistaken for action runner:

- Risk: validator output is treated as operational behavior.
- Control: output must keep all safe/action/write/mutation flags false.

`action_candidate_valid` overtrusted:

- Risk: a structurally valid candidate is treated as write permission.
- Control: status means reviewable only, not executable.

Manual approval mistaken for write authorization:

- Risk: approval metadata is treated as authority to finalize or write.
- Control: approval may advance review only.

Dry-run mistaken for production action:

- Risk: dry-run metadata is treated as a completed finalization.
- Control: dry-run/manual-review-only modes remain non-writing.

Authority flags accidentally enabled:

- Risk: future edits set authority booleans true.
- Control: unexpected true authority flags block validation.

Audit/correction ignored:

- Risk: future action work skips traceability or correction strategy.
- Control: audit/correction readiness is an explicit validation domain.

Persistence/execution-record/stats/trade coupling too early:

- Risk: validator becomes coupled to write paths before a reviewed action
  boundary exists.
- Control: coupling-detected blocked paths remain explicit.

## 16. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, validator
implementation, action implementation, finalization implementation,
persistence/write behavior, Supabase/localStorage write, audit append,
rollback/correction behavior, execution-record creation, stats/PnL update,
trade mutation, UI wiring, capture/browser/Avanza behavior, broker behavior,
or production runtime behavior was added.

## Action 522 Follow-Up - Finalization Action Validator Contract Types Created

Action 522 created `lib/finalization-action-validator-contract.ts`.

Design relationship:

- The new contract types implement the design's shape for validator input,
  result, status, authority validation, preconditions, write boundary
  validation, audit/correction validation, blocked reasons, warnings, decision
  recommendation, and safety policy.
- The module is type-only/constants-only and does not implement validator
  logic.
- It may reference finalization action, finalization candidate, finalization
  validation, state transition validation, transition result, execution-record
  metadata, boundary metadata, manual approval context, and audit/correction
  metadata as review context only.
- `safeToValidateOnly=true` is the only enabled safety capability.
- Action execution, finalization, persistence, execution-record creation,
  stats/PnL updates, audit append, rollback/correction behavior, trade
  mutation, UI wiring, capture/browser/Avanza behavior, broker behavior, and
  production runtime behavior remain disabled.

Next recommended action:

**Action 523 - Reassess Finalization Action Validator Contract Types**

## Action 523 Follow-Up - Finalization Action Validator Contract Reassessed

Action 523 created
`docs/finalization-action-validator-contract-reassessment.md`.

Design relationship:

- The reassessment verifies that
  `lib/finalization-action-validator-contract.ts` matches the Action 521
  validator design.
- The contract remains type-only/constants-only.
- It models validator input/result/status, authority validation,
  preconditions, write boundaries, audit/correction validation, blocked
  reasons, warnings, decision recommendation, and conservative safety policy.
- It does not implement validator logic or run finalization actions.
- Action execution, finalization, persistence, execution-record creation,
  stats/PnL updates, audit append, rollback/correction behavior, trade
  mutation, UI wiring, capture/browser/Avanza behavior, broker behavior, and
  production runtime behavior remain disabled.

Next recommended action:

**Action 524 - Create Finalization Action Validator**

## Action 524 Follow-Up - Finalization Action Validator Created

Action 524 created `lib/finalization-action-validator.ts`.

Design relationship:

- The implementation follows the Action 521 design as a review-only validator.
- It validates authority, preconditions, write boundary metadata,
  audit/correction metadata, and manual approval context.
- It returns typed `FinalizationActionValidationResult` diagnostics.
- It does not run the action and does not create finalization/write/mutation
  side effects.
- The next safe step is reassessing the validator implementation before any
  action execution or write boundary work.

Next recommended action:

**Action 525 - Reassess Finalization Action Validator**

## Action 525 Follow-Up - Finalization Action Validator Reassessed

Action 525 created `docs/finalization-action-validator-reassessment.md`.

Design relationship:

- The reassessment confirms the implementation follows the Action 521
  validation-only design.
- It validates action candidates without running actions.
- It keeps write boundary and audit/correction data as metadata only.
- It keeps all action/finalization/write/mutation safety flags false except
  `safeToValidateOnly=true`.

Next recommended action:

**Action 526 - Create Finalization Action Dry-run Design**

## Action 526 Follow-Up - Finalization Action Dry-run Design Created

Action 526 created `docs/finalization-action-dry-run-design.md`.

Design relationship:

- The dry-run design is downstream of the finalization action validator.
- It can summarize validation and proposed impacts without running an action.
- It keeps persistence, execution-record creation, stats/PnL updates, audit
  append, rollback/correction behavior, and trade mutation out of scope.

Next recommended action:

**Action 527 - Create Finalization Action Dry-run Contract Types**
