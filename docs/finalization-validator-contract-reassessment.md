# Finalization Validator Contract Reassessment

## 1. Purpose

Action 508 reassesses the Finalization Validator contract types before any
validator implementation work. The goal is to verify that
`lib/finalization-validator-contract.ts` remains type-only/constants-only,
conservative, aligned with the validator design and finalization candidate
pipeline, and disconnected from runtime validator, finalization, persistence,
execution-record, stats/PnL, and trade mutation behavior.

This reassessment is documentation-only. No runtime code, refactor, behavior
change, validator implementation, finalization implementation, persistence/write
behavior, UI wiring, capture/browser/Avanza behavior, broker behavior, or trade
mutation behavior was added.

## 2. Current Contract Inventory

The current contract inventory in
`lib/finalization-validator-contract.ts` includes:

- Input type: `FinalizationValidatorInput`.
- Result type: `FinalizationValidationResult`.
- Statuses: `FinalizationValidationStatus` and
  `FINALIZATION_VALIDATION_STATUSES`.
- Hard gates: `FinalizationValidationHardGate` and
  `FINALIZATION_VALIDATION_HARD_GATES`.
- Review gates: `FinalizationValidationReviewGate` and
  `FINALIZATION_VALIDATION_REVIEW_GATES`.
- Blocked reasons: `FinalizationValidationBlockedReason` and
  `FINALIZATION_VALIDATION_BLOCKED_REASONS`.
- Warnings: `FinalizationValidationWarning` and
  `FINALIZATION_VALIDATION_WARNINGS`.
- Gate results: `FinalizationValidationGateResult`.
- Policy snapshot: `FinalizationValidationPolicySnapshot` and
  `FINALIZATION_VALIDATION_DEFAULT_POLICY_SNAPSHOT`.
- Safety policy: `FinalizationValidationSafetyPolicy` and
  `FINALIZATION_VALIDATION_DEFAULT_SAFETY_POLICY`.
- Readiness summary: `FinalizationReadinessSummary`.
- Manual review context: `FinalizationManualReviewContext`.
- Status metadata: `FINALIZATION_VALIDATION_STATUS_METADATA`.

The input can reference `FinalizationCandidate`,
`FinalizationCandidateBuilderResult`, final settlement note matching result,
provisional trade context, execution-record candidate metadata, policy snapshot,
and manual review context.

## 3. Boundary Verification

The contract preserves the intended boundary:

- Type-only/constants-only.
- No validator implementation.
- No finalization implementation.
- No persistence/write behavior.
- No Supabase/localStorage writes.
- No audit append.
- No execution-record creation.
- No stats/PnL update.
- No trade mutation.
- No UI wiring.
- No capture/browser/Avanza behavior.

The module exports types, literal constant arrays, default policy metadata, and
status metadata. It imports from adjacent contracts using `import type`, and it
does not export runtime validator functions.

## 4. Alignment Verification

Finalization validator design:

- Statuses align with the design:
  `ready_for_finalization_review`, `blocked`, `needs_review`,
  `partial_fill_review`, `duplicate_review`, `unsupported`, and `not_ready`.
- Hard gates align with the design: candidate existence, acceptable status,
  evidence summary, match summary, settlement summary, note/reference,
  provenance, duplicate conflict absence, blocking mismatch absence,
  broker/source support, handoff fingerprint, and conservative safety policy.
- Review gates align with the design: partial fill review, missing fee/FX data,
  PnL uncertainty, settlement date uncertainty, account/category ambiguity,
  manual review, policy mismatch, fixture/dev source, and unsupported but
  inspectable source.
- Blocked reasons align with the design and include safety-policy and coupling
  violations.
- Warnings align with the design and keep review readiness separate from
  finalization authority.

Finalization candidate builder reassessment:

- The validator contract is downstream of finalization candidate building.
- It can reference builder result types as input.
- It does not change builder behavior.

Finalization candidate contract reassessment:

- The validator contract can reference `FinalizationCandidate`.
- Candidate and validator statuses remain metadata until a separate
  implementation and finalization action boundary exist.

Execution-record and persistence boundaries:

- The validator contract can reference execution-record candidate metadata as
  optional context.
- It does not create execution records.
- It does not persist by itself.
- Supabase/localStorage writes, audit append, insert routes, and persistence
  validation remain separate boundaries.

Two-stage broker evidence flow:

- The validator contract can reference matching results and candidate evidence
  summaries as type-only context.
- It does not collect evidence, retrieve final notes, run capture/OCR, drive
  browser automation, interact with Avanza, or send to broker.

Separation checks:

- Validator contract is downstream of finalization candidate builder.
- Validator contract does not finalize by itself.
- Validator contract does not persist by itself.
- Validator contract does not create execution records.
- Validator contract does not update statistics/PnL.
- Validator contract does not mutate trade state.

## 5. Safety Policy Verification

The contract explicitly keeps authority conservative:

- Validator result is not finalization approval.
- Validator result is not persistence approval.
- Validator result is not execution-record creation approval.
- Validator result is not stats/PnL update approval.
- Validator result is not trade mutation approval.
- `safeToFinalize=false`.
- `safeToPersist=false`.
- `safeToCreateExecutionRecord=false`.
- `safeToUpdateStats=false`.
- `safeToMutateTrade=false`.
- Automatic mode remains out of scope.

The default safety policy also keeps validator implementation, finalization
implementation, persistence implementation, execution-record creation, stats
updates, trade mutation, audit append, browser automation, Avanza automation,
and broker automation disabled.

## 6. Remaining Gaps Before Validator/Finalization Work

The following gaps remain before actual validator or finalization work:

- No finalization validator implementation.
- No finalization state transition implementation.
- No execution-record integration.
- No persistence integration.
- No stats/PnL update integration.
- No trade mutation integration.
- No production agent/browser workflow.

The contract is ready to guide a pure validator implementation, but it does not
perform validation or authorize any later action by itself.

## 7. Candidate Next Actions

A. Create Finalization Validator

- Implement a pure validator that consumes the Action 507 contract and returns
  conservative validation results without finalization or writes.

B. Create Finalization State Transition Design

- Design the future state transition boundary that could come after validation
  and explicit approval.

C. Create Execution Record Integration Reassessment

- Reassess how execution-record candidate metadata should interact with
  finalization validation without creating records.

D. Create Provisional Trade State Design

- Define the state model between provisional evidence and finalized trade
  lifecycle state.

## 8. Recommended Next Action

Recommended default:

**Action 509 - Create Finalization Validator**

## 9. Risk Assessment

Contract mistaken for validator implementation:

- Risk: consumers assume contract types perform validation.
- Control: this reassessment documents the module as type-only/constants-only.

Validator result mistaken for finalization approval:

- Risk: `ready_for_finalization_review` is overtrusted.
- Control: status wording and metadata keep review readiness separate from
  finalization.

Validator result mistaken for persistence approval:

- Risk: validation output is treated as save authority.
- Control: `safeToPersist=false` and persistence boundaries remain separate.

Validator result mistaken for stats/PnL update approval:

- Risk: readiness summary or PnL warnings are treated as official stats
  updates.
- Control: `safeToUpdateStats=false` and stats/PnL update remains separate.

Validator result mistaken for trade mutation approval:

- Risk: validation output is used to mark trades finalized or mutate positions.
- Control: `safeToMutateTrade=false` and trade mutation remains separate.

Premature finalization:

- Risk: future validator work is wired directly into finalization.
- Control: next implementation must remain pure validation only.

Execution-record coupling risk:

- Risk: execution-record candidate metadata is treated as creation authority.
- Control: `safeToCreateExecutionRecord=false` and execution-record creation
  remains separate.

Future UI overtrust:

- Risk: UI presents validator output as an operational command.
- Control: UI must label validation output as review/diagnostic only until a
  separate finalization action exists.

## 10. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, validator
implementation, finalization implementation, persistence/write behavior,
Supabase/localStorage write, audit append, execution-record creation,
stats/PnL update, trade mutation, UI wiring, capture/browser/Avanza behavior,
broker behavior, or production runtime behavior was added.

## Action 509 Follow-Up - Pure Finalization Validator Created

Action 509 created `lib/finalization-validator.ts`.

Contract reassessment impact:

- The validator consumes the Action 507 contract and returns
  `FinalizationValidationResult`.
- The implementation is pure and deterministic.
- It evaluates hard gates, review gates, blocked paths, warnings, safety
  policy, readiness summary, and manual review context.
- It keeps all authority flags false.
- It does not finalize, persist, create execution records, update stats/PnL,
  mutate trades, wire UI, capture evidence, drive browser/Avanza behavior, or
  call broker behavior.

Next recommended action:

**Action 510 - Reassess Finalization Validator**

## Action 510 Follow-Up - Finalization Validator Reassessed

Action 510 created `docs/finalization-validator-reassessment.md`.

Contract reassessment impact:

- The implemented validator was reassessed against the Action 507 contract.
- It remains pure, deterministic, validation-only, and conservative.
- It returns typed `FinalizationValidationResult` data and keeps all authority
  flags false.
- It does not finalize, persist, create execution records, update stats/PnL,
  mutate trades, wire UI, capture evidence, drive browser/Avanza behavior, or
  call broker behavior.

Next recommended action:

**Action 511 - Create Finalization State Transition Design**
