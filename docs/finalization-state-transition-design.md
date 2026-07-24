# Finalization State Transition Design

## 1. Purpose

Action 511 defines future finalization state transition concepts after
finalization validation. The design describes what could happen after a
candidate passes `validateFinalizationCandidate(...)`, while keeping all actual
finalization, write, persistence, execution-record creation, stats/PnL update,
trade mutation, UI, capture/browser/Avanza, and broker behavior out of scope.

This document is design-only. It does not implement finalization state
transitions or any runtime behavior.

## 2. Scope

Included scope:

- State transition design.
- Transition prerequisites.
- Audit requirements.
- Review/approval boundary.
- Future write boundaries.

Excluded scope:

- Implementation.
- Persistence/write behavior.
- Execution-record creation.
- Stats/PnL update.
- Trade mutation.
- UI.
- Avanza/browser/capture behavior.

## 3. Source State

Possible upstream states include:

- Finalization candidate built.
- Finalization validation `ready_for_finalization_review`.
- Finalization validation `needs_review`.
- Finalization validation `blocked`.
- Finalization validation `partial_fill_review`.
- Finalization validation `duplicate_review`.
- Finalization validation `unsupported`.
- Finalization validation `not_ready`.

These states are upstream inputs to a future transition boundary. They do not
mutate trade state or write persistence by themselves.

## 4. Target State Concepts

Future target concepts:

- `finalization_review_ready`: validation says the candidate can be reviewed
  for a separate finalization action.
- `finalization_approved_pending_write`: explicit approval exists, but no write
  boundary has run.
- `finalization_write_pending`: a future write process is queued or ready, but
  has not completed.
- `finalized`: future-only state for a completed, audited finalization write.
- `finalization_rejected`: reviewer or policy rejected finalization.
- `finalization_needs_review`: more review is required before approval.
- `finalization_blocked`: finalization cannot proceed.
- `finalization_rolled_back` / `correction_needed`: future-only correction
  concepts for audited reversal or amendment workflows.

No target state is applied by this design.

## 5. Transition Prerequisites

Future transitions should require:

- Valid `FinalizationCandidate`.
- Finalization validator status acceptable for the requested transition.
- Manual review or explicit user approval if required.
- No duplicate conflict.
- No partial-fill ambiguity.
- No unsafe authority flags.
- No unresolved PnL/fee/FX uncertainty unless accepted for review-only.
- Persistence boundary available.
- Execution-record boundary available if needed.
- Stats/PnL update boundary available if needed.
- Audit/correction strategy available.

Missing prerequisites should produce a review, rejected, or blocked transition
concept, not a write.

## 6. Transition Decision Table

Proposed future mapping:

| Validator status | Target concept |
| --- | --- |
| `ready_for_finalization_review` | `finalization_review_ready` |
| `needs_review` | `finalization_needs_review` |
| `partial_fill_review` | `finalization_needs_review` |
| `duplicate_review` | `finalization_needs_review` |
| `blocked` | `finalization_blocked` |
| `unsupported` | `finalization_blocked` |
| `not_ready` | `finalization_blocked` |

This design does not apply any target state. It only defines future state
concepts and mapping expectations.

## 7. Manual Review / Approval Boundary

The finalization validator does not approve writes. A future manual review or
approval boundary may be required before any finalization action can proceed.

Approval requirements:

- User approval can be a separate future action.
- Approval does not imply automatic broker action.
- Approval does not bypass persistence safeguards.
- Approval does not bypass execution-record safeguards.
- Approval does not bypass statistics/PnL safeguards.
- Approval does not bypass trade mutation safeguards.

Review and approval must remain explicit, auditable, and separate from
validation output.

## 8. Write Boundary Separation

Separate future boundaries are required for:

- Execution-record creation.
- Persistence.
- Statistics/PnL update.
- Trade state mutation.
- Audit append.
- Correction/rollback path.

The state transition concept may orchestrate future boundaries only after each
boundary has its own contract, validation, safety policy, idempotency model, and
audit strategy.

## 9. Audit And Correction Requirements

Future finalization must be auditable:

- Source evidence must be traceable.
- Before/after values must be known.
- Corrections must be possible.
- Duplicate finalization prevention is required.
- Rollback/correction process is required.
- Approval actor, timestamp, candidate fingerprint, validator result, and write
  attempts must be traceable.

Audit and correction must be designed before any finalization write behavior is
implemented.

## 10. Relationship To Execution Records

Finalization transition may later depend on execution-record integration.

Execution-record boundaries remain separate:

- Execution-record candidate builder remains separate.
- Persistence validator remains separate.
- Supabase migration/application remains separate.
- Execution-record creation does not happen in this design.

## 11. Relationship To Stats/PnL

Finalization may later drive official PnL updates, but stats/PnL update remains
a separate boundary.

Requirements:

- Fee/FX adjustments require explicit handling.
- Provisional stats and finalized stats must be distinct.
- Official realized PnL update must be auditable.
- This design does not update statistics or PnL.

## 12. Relationship To Trade Mutation

Finalization state transition is not trade open/close behavior.

This design:

- Does not click broker actions.
- Does not mutate live trade state.
- Does not mutate historical trade state.
- Does not open positions.
- Does not close positions.
- Keeps automatic mode out of scope.

Trade mutation remains a separate future boundary.

## 13. Candidate Next Actions

A. Create Finalization State Transition Contract Types

- Define source states, target concepts, prerequisites, decision table, audit
  metadata, approval metadata, safety flags, and non-write result types.

B. Create Finalization Action Contract Types

- Define explicit future action request/response shapes after transition
  contracts exist.

C. Create Execution Record Integration Reassessment

- Reassess how finalization state concepts should relate to execution-record
  metadata without creating records.

D. Create Provisional Trade State Design

- Define provisional trade lifecycle state before finalized trade mutation.

## 14. Recommended Next Action

Recommended default:

**Action 512 - Create Finalization State Transition Contract Types**

## 15. Risk Assessment

Validation mistaken for state transition:

- Risk: validator output is treated as a state change.
- Control: validator remains upstream review metadata only.

Review mistaken for approval:

- Risk: review-ready is treated as user approval.
- Control: approval is a separate future boundary.

Approval mistaken for write authorization:

- Risk: approval bypasses persistence, execution-record, stats, or mutation
  safeguards.
- Control: each write boundary must remain separate.

Finalization mistaken for trade mutation:

- Risk: finalization state is treated as open/close position behavior.
- Control: trade mutation remains separate.

Stats/PnL update too early:

- Risk: provisional PnL becomes official too soon.
- Control: stats/PnL boundary must be explicit and auditable.

Execution-record coupling too early:

- Risk: transition creates execution records prematurely.
- Control: execution-record integration remains separate.

Audit/correction missing:

- Risk: finalization cannot be traced or corrected.
- Control: audit and correction strategy is prerequisite.

Duplicate finalization risk:

- Risk: the same candidate is finalized more than once.
- Control: duplicate prevention and idempotency are required before writes.

## 16. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, finalization
implementation, persistence/write behavior, Supabase/localStorage write, audit
append, execution-record creation, stats/PnL update, trade mutation, UI wiring,
capture/browser/Avanza behavior, broker behavior, or production runtime
behavior was added.

## Action 512 Follow-Up - Finalization State Transition Contract Types Created

Action 512 created `lib/finalization-state-transition-contract.ts`.

Design implementation boundary:

- The new module defines TypeScript contract types and constants only.
- It models source states, target concepts, transition input/result/status,
  prerequisites, prerequisite results, decisions, blocked reasons, warnings,
  audit requirements, correction requirements, boundary status metadata,
  approval context, audit context, and safety policy.
- It includes a decision table for validation status to target concept mapping.
- It keeps transition, finalization, persistence, execution-record creation,
  stats/PnL update, and trade mutation authority false.
- It does not implement transition logic, finalization, persistence/write
  behavior, execution-record creation, stats/PnL update, trade mutation, UI
  wiring, capture/browser/Avanza behavior, broker behavior, or production
  runtime behavior.

Next recommended action:

**Action 513 - Reassess Finalization State Transition Contract Types**

## Action 513 Follow-Up - Finalization State Transition Contract Reassessed

Action 513 created
`docs/finalization-state-transition-contract-reassessment.md`.

Design reassessment impact:

- The Action 512 contract was verified against this design.
- Source states, target concepts, transition input/result/statuses,
  prerequisites, decisions, blocked reasons, warnings, audit requirements,
  correction requirements, approval/audit contexts, boundary status metadata,
  and safety policy remain represented.
- The contract remains type-only/constants-only and does not apply target
  state.
- `safeToTransition=false`, `safeToFinalize=false`, `safeToPersist=false`,
  `safeToCreateExecutionRecord=false`, `safeToUpdateStats=false`, and
  `safeToMutateTrade=false` remain explicit.
- No transition implementation, finalization implementation,
  persistence/write behavior, execution-record creation, stats/PnL update,
  trade mutation, UI wiring, capture/browser/Avanza behavior, broker behavior,
  or production runtime behavior was added.

Next recommended action:

**Action 514 - Create Finalization State Transition Validator Design**

## Action 514 Follow-Up - Finalization State Transition Validator Design Created

Action 514 created
`docs/finalization-state-transition-validator-design.md`.

Design relationship:

- The validator design is downstream of the transition contract and upstream
  of any future finalization action.
- It defines source/target compatibility, prerequisite validation, boundary
  readiness validation, audit/correction validation, blocked paths, and manual
  approval semantics.
- The validator design does not apply target state or authorize writes.
- No transition validator implementation, state transition implementation,
  finalization implementation, persistence/write behavior, execution-record
  creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, broker behavior, or production runtime
  behavior was added.

Next recommended action:

**Action 515 - Create Finalization State Transition Validator Contract Types**

## Action 515 Follow-Up - Finalization State Transition Validator Contract Types Created

Action 515 created
`lib/finalization-state-transition-validator-contract.ts`.

Design relationship:

- The validator contract types implement the Action 514 validator design as
  type-only metadata.
- Source/target compatibility, prerequisites, boundary readiness,
  audit/correction readiness, blocked paths, warnings, and safety policy are
  now represented as contract types/constants.
- The contract remains upstream of any future finalization action.
- The contract does not apply target state or authorize writes.
- No transition validator implementation, state transition implementation,
  finalization implementation, persistence/write behavior, execution-record
  creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, broker behavior, or production runtime
  behavior was added.

Next recommended action:

**Action 516 - Reassess Finalization State Transition Validator Contract Types**

## Action 516 Follow-Up - Finalization State Transition Validator Contract Reassessed

Action 516 created
`docs/finalization-state-transition-validator-contract-reassessment.md`.

Design relationship:

- The validator contract remains downstream of transition contract metadata and
  upstream of any future finalization action.
- Reassessment confirmed source-target compatibility, prerequisites, boundary
  readiness, audit/correction readiness, blocked paths, warnings, and safety
  policy are represented.
- Reassessment confirmed the contract does not apply target state or authorize
  writes.
- No transition validator implementation, transition implementation,
  finalization implementation, persistence/write behavior, execution-record
  creation, stats/PnL update, trade mutation, UI wiring,
  capture/browser/Avanza behavior, broker behavior, or production runtime
  behavior was added.

Next recommended action:

**Action 517 - Create Finalization State Transition Validator**

## Action 517 Follow-Up - Finalization State Transition Validator Created

Action 517 created `lib/finalization-state-transition-validator.ts`.

Design relationship:

- The validator is downstream of finalization validation and transition
  contract metadata.
- It returns validation metadata only and does not apply target state.
- It keeps finalization action, persistence, execution-record creation,
  stats/PnL update, trade mutation, UI, capture/browser/Avanza behavior, and
  broker behavior out of scope.
- State transition application remains a separate future boundary.

Next recommended action:

**Action 518 - Reassess Finalization State Transition Validator**

## Action 518 Follow-Up - Finalization State Transition Validator Reassessed

Action 518 created
`docs/finalization-state-transition-validator-reassessment.md`.

Design relationship:

- The implemented validator remains downstream of finalization validation and
  transition contract metadata.
- It produces transition-candidate validation metadata only.
- It does not apply target state or authorize finalization/write/mutation
  behavior.
- The next boundary remains a separate finalization action contract.

Next recommended action:

**Action 519 - Create Finalization Action Contract Types**

## Action 519 Follow-Up - Finalization Action Contract Types Created

Action 519 created `lib/finalization-action-contract.ts`.

Design relationship:

- Finalization action contract types define a future boundary after transition
  validation.
- The contract models action input/result/status/mode/authority,
  preconditions, write boundaries, audit/correction requirements, blocked
  reasons, warnings, and safety policy.
- The contract does not apply target state or perform finalization.
- No persistence/write behavior, execution-record creation, stats/PnL update,
  trade mutation, UI wiring, capture/browser/Avanza behavior, broker behavior,
  or production runtime behavior was added.

Next recommended action:

**Action 520 - Reassess Finalization Action Contract Types**

## Action 520 Follow-Up - Finalization Action Contract Reassessed

Action 520 created
`docs/finalization-action-contract-reassessment.md`.

Design relationship:

- The finalization action contract was reassessed as a future boundary shape
  after finalization validation and transition validation.
- It remains type-only/constants-only and does not apply target state.
- It does not run a finalization action, finalize, persist, create execution
  records, update stats/PnL, append audit records, roll back, mutate trades,
  wire UI, capture/browser/Avanza behavior, or perform broker behavior.
- The next safe design step is an action validator design, not action
  execution.

Next recommended action:

**Action 521 - Create Finalization Action Validator Design**

## Action 521 Follow-Up - Finalization Action Validator Design Created

Action 521 created `docs/finalization-action-validator-design.md`.

Design relationship:

- The action validator design sits after finalization validation and transition
  validation.
- It defines review-only validation for future action candidates.
- It does not apply target state and does not run a finalization action.
- State transition application and finalization action execution remain
  separate future boundaries.

Next recommended action:

**Action 522 - Create Finalization Action Validator Contract Types**

## Action 522 Follow-Up - Finalization Action Validator Contract Types Created

Action 522 created `lib/finalization-action-validator-contract.ts`.

Design relationship:

- The action validator contract sits after finalization validation and
  transition validation in the documented review chain.
- It can carry transition validation/result metadata into a future action
  validator result without applying target state.
- It does not apply state, run a finalization action, finalize, persist, create
  execution records, update stats/PnL, append audit records, roll back, mutate
  trades, wire UI, capture/browser/Avanza behavior, or perform broker behavior.
- State transition application and finalization action execution remain
  separate future boundaries.

Next recommended action:

**Action 523 - Reassess Finalization Action Validator Contract Types**

## Action 523 Follow-Up - Finalization Action Validator Contract Reassessed

Action 523 created
`docs/finalization-action-validator-contract-reassessment.md`.

Design relationship:

- The action validator contract remains after finalization validation and
  transition validation in the review chain.
- Reassessment confirmed it does not apply target state.
- It does not run a finalization action, finalize, persist, create execution
  records, update stats/PnL, append audit records, roll back, mutate trades,
  wire UI, capture/browser/Avanza behavior, or perform broker behavior.
- State transition application and finalization action execution remain
  separate future boundaries.

Next recommended action:

**Action 524 - Create Finalization Action Validator**

## Action 524 Follow-Up - Finalization Action Validator Created

Action 524 created `lib/finalization-action-validator.ts`.

Design relationship:

- The action validator remains downstream of finalization validation and
  transition validation.
- It returns action validation diagnostics without applying target state.
- State transition application remains a separate future boundary.
- Finalization action execution remains a separate future boundary.

Next recommended action:

**Action 525 - Reassess Finalization Action Validator**

## Action 525 Follow-Up - Finalization Action Validator Reassessed

Action 525 created `docs/finalization-action-validator-reassessment.md`.

Design relationship:

- The action validator remains downstream of state transition validation.
- It does not apply target state.
- It does not run finalization actions or enable writes.
- Transition application remains a separate future boundary.

Next recommended action:

**Action 526 - Create Finalization Action Dry-run Design**

## Action 526 Follow-Up - Finalization Action Dry-run Design Created

Action 526 created `docs/finalization-action-dry-run-design.md`.

Design relationship:

- The dry-run design may describe a proposed finalization state transition.
- It does not apply target state.
- It keeps transition application and finalization action execution as separate
  future boundaries.

Next recommended action:

**Action 527 - Create Finalization Action Dry-run Contract Types**
