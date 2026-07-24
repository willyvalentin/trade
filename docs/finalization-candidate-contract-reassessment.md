# Finalization Candidate Contract Reassessment

## 1. Scope

This reassessment covers the type-only finalization candidate contract added in
Action 496:

- `lib/finalization-candidate-contract.ts`

Related boundaries inspected:

- `lib/final-settlement-note-matching-contract.ts`
- `lib/two-stage-broker-evidence-contract.ts`
- `docs/final-settlement-note-match-dev-preview-reassessment.md`
- `docs/final-settlement-note-match-dev-preview-design.md`
- `docs/final-settlement-note-matching-validator-reassessment.md`
- `docs/final-settlement-note-matching-contract-reassessment.md`
- `docs/two-stage-broker-evidence-flow-design.md`
- `docs/execution-record-creation-contract-design.md`
- `docs/execution-record-persistence-boundary-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

This is documentation-only. No runtime code, validator behavior, persistence,
finalization, execution-record creation, stats/PnL update, trade mutation, UI,
capture/browser automation, or Avanza behavior was changed.

## 2. Contract Shape Verification

`lib/finalization-candidate-contract.ts` is type-only/constants-only.

The module exports constants and TypeScript types for:

- Contract version.
- Candidate statuses.
- Candidate sources.
- Review flags.
- Warnings.
- Rejection reasons.
- Partial-fill statuses.
- PnL adjustment statuses.
- Default safety policy.
- Source references.
- Evidence summary.
- Match summary.
- Instrument summary.
- Settlement summary.
- Fee summary.
- FX summary.
- PnL adjustment summary.
- Execution-record metadata.
- Finalization candidate.
- Status metadata.

The module has type-only imports and no builder, mapper, validator, persistence
adapter, state transition function, audit appender, execution-record creator,
stats updater, trade mutator, UI component, browser automation, or Avanza
integration.

## 3. Represented Candidate Metadata

The candidate contract represents the required finalization-candidate vocabulary
without approving any downstream action.

Statuses:

- `candidate_ready`
- `needs_review`
- `blocked`
- `partial_fill_review`
- `duplicate_review`
- `unsupported`

Sources:

- `final_settlement_note_match`
- `manual_review`
- `dev_fixture`
- `broker_execution_result_candidate`
- `execution_record_candidate_metadata`

Evidence summary:

- Broker.
- Source classification.
- Provisional evidence fingerprint.
- Final note evidence fingerprint.
- Handoff payload fingerprint.
- Note reference number.
- Source reference/provenance.
- Masked account context.
- Missing fields.
- Review flags.
- Raw-sensitive-data storage policy.

Match summary:

- Final settlement note matching status.
- Matching confidence.
- Matched boolean.
- Lifecycle transition suggestion.
- Hard-gate blocked count.
- Soft-signal review count.
- Mismatch reasons.
- Duplicate reasons.
- Review flags.
- Warnings.

Settlement summary:

- Broker.
- Instrument identity.
- Side.
- Quantity.
- Execution price.
- Currency.
- Business date.
- Settlement date.
- Execution timestamp.
- Order type.
- Note reference number.
- Consideration.
- Total amount.
- Provenance.

Fee and FX summaries:

- Commission, fees, fee currency, total fees, and missing-fee review state.
- Base, settlement, and account currencies.
- FX rates and missing-FX review state.

PnL adjustment summary:

- Status.
- `previewOnly: true`.
- Optional realized PnL, fee adjustment, FX adjustment, and cash impact.
- `statsUpdateAttempted: false`.
- `tradeMutationAttempted: false`.

Review flags, warnings, and rejection reasons cover missing fields, provenance,
account context, partial fills, duplicate matches, missing fee/total, missing FX,
execution-record metadata overtrust, missing validator, unsupported broker, and
automatic-mode blocking.

Status metadata is present and conservative. Every status has
`blocksFinalization: true`; even `candidate_ready` states only that the
candidate appears ready for a future validator, not that finalization is
approved.

## 4. Safety Policy Verification

The default safety policy is intentionally conservative:

- `safeToFinalize=false`
- `safeToPersist=false`
- `safeToMutateTrade=false`
- `safeToUpdateStats=false`
- `safeToCreateExecutionRecord=false`
- `automaticModeAllowed=false`
- `manualReviewRequired=true`
- `finalizationImplementationEnabled=false`
- `finalizationValidatorImplemented=false`
- `persistenceImplementationEnabled=false`
- `executionRecordCreationEnabled=false`
- `statsUpdateEnabled=false`
- `tradeMutationEnabled=false`
- `auditAppendEnabled=false`
- `browserAutomationEnabled=false`
- `avanzaAutomationEnabled=false`

The main `FinalizationCandidate` type repeats the operational safety booleans
and attempted-action booleans as false:

- `safeToFinalize: false`
- `safeToPersist: false`
- `safeToMutateTrade: false`
- `safeToUpdateStats: false`
- `safeToCreateExecutionRecord: false`
- `finalizationAttempted: false`
- `persistenceAttempted: false`
- `executionRecordCreationAttempted: false`
- `statsUpdateAttempted: false`
- `tradeMutationAttempted: false`
- `auditAppendAttempted: false`
- `browserAutomationAttempted: false`
- `avanzaAutomationAttempted: false`

This means the contract can describe a candidate but cannot authorize, imply, or
perform finalization, persistence, execution-record creation, stats/PnL updates,
trade mutation, audit append, browser automation, or Avanza behavior.

## 5. Alignment With Upstream Contracts

Two-stage broker evidence:

- The candidate is downstream of `ImmediateBrokerReadbackEvidence` and
  `FinalBrokerSettlementNoteEvidence`.
- It preserves the two-stage distinction between provisional readback and final
  settlement note evidence.
- It does not collect evidence, retrieve final notes, mutate lifecycle state, or
  finalize a trade.

Final settlement note matching:

- The candidate can reference a `FinalSettlementNoteMatchingResult`.
- It remains downstream of a matched final note.
- A match is not converted into finalization approval.
- Lifecycle transition suggestions remain metadata until a future separate
  state transition implementation exists.

Execution-record creation:

- The candidate may carry optional execution-record candidate metadata.
- It sets `safeToCreateExecutionRecord=false`,
  `executionRecordCreated=false`, and `persistenceAttempted=false`.
- It does not create, validate, insert, or persist execution records.

Persistence boundary:

- The candidate keeps `safeToPersist=false`.
- No Supabase/localStorage writes, audit append, or persistence adapter exists.
- A future persistence boundary still needs explicit approval and validation.

Live trade/stat implications:

- The candidate keeps `safeToMutateTrade=false` and
  `safeToUpdateStats=false`.
- PnL values are preview-only metadata.
- No realized PnL, fee, FX, cash, position, trade status, or performance-stat
  mutation is implemented.

## 6. Boundary Statement

A `FinalizationCandidate` is downstream of a matched final settlement note, but
it is not finalization.

It does not:

- Finalize a trade.
- Persist a trade, candidate, audit event, or execution record.
- Create an execution record.
- Update stats or realized PnL.
- Mutate live or historical trade state.
- Append audit records.
- Retrieve final notes.
- Drive browser automation.
- Interact with Avanza.

The contract is a structured handoff shape for future builder, validator,
preview, and state-boundary designs.

## 7. Remaining Gaps

Remaining gaps before any finalization-capable workflow:

- No finalization validator.
- No finalization candidate builder/mapper.
- No finalization state transition implementation.
- No execution-record integration.
- No persistence integration.
- No stats/PnL update integration.
- No trade mutation integration.
- No production agent/browser workflow.

These are intentional gaps. The current contract is not enough to finalize or
write anything.

## 8. Candidate Next Actions

A. Create Finalization Candidate Builder Design

- Highest-value next step.
- Defines how matched final note evidence and matching results would map into a
  candidate object.
- Can specify required inputs, missing-field behavior, review flags, rejection
  reasons, idempotency/fingerprints, and preview-only PnL shaping without
  implementing runtime finalization or writes.

B. Create Finalization Validator Design

- Defines the future validator that would evaluate a candidate before any state
  transition boundary.
- Should stay separate from persistence, execution-record creation, stats/PnL,
  and trade mutation.

C. Create Finalization Candidate Dev Preview Design

- Useful after builder design clarifies candidate shape.
- Should remain fixture/dry-run-first, read-only, explicit-trigger-only, and
  non-persistent.

D. Create Provisional Trade State Design

- Useful once candidate builder and validator boundaries are clearer.
- Premature as the next action because state transitions need candidate mapping
  and validation semantics first.

## 9. Recommended Next Action

Recommended Action 498 default:

**Action 498 - Create Finalization Candidate Builder Design**

## 10. Risk Assessment

Candidate mistaken for approval:

- Risk: a candidate is treated as finalization, persistence,
  execution-record creation, stats/PnL update, or trade mutation approval.
- Control: safety booleans are false, attempted flags are false, warnings say
  the candidate is contract-only, and status metadata blocks finalization.

Finalization too early:

- Risk: future work wires `candidate_ready` directly to a final state.
- Control: `candidate_ready` still has `blocksFinalization: true` and requires
  a future separate validator and state transition boundary.

PnL adjustment overtrust:

- Risk: preview-only PnL values are treated as authoritative realized PnL.
- Control: `previewOnly: true`, `statsUpdateAttempted=false`, and
  `tradeMutationAttempted=false`.

Execution-record coupling risk:

- Risk: optional execution-record metadata is used to create or persist a
  record.
- Control: `safeToCreateExecutionRecord=false`,
  `executionRecordCreated=false`, and `persistenceAttempted=false`.

Future UI overtrust:

- Risk: a future preview or UI presents the candidate as finalized or safe to
  write.
- Control: next work should design builder/validator/dev-preview boundaries
  with the same disabled safety flags visible.

## 11. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, validator,
finalization, persistence/write behavior, Supabase/localStorage behavior, audit
append, execution-record creation, trade mutation, stats/PnL update, UI change,
capture/OCR/browser extraction, browser automation, or Avanza behavior was
added.

## Action 498 - Finalization Candidate Builder Design Created

Action 498 created `docs/finalization-candidate-builder-design.md`.

Contract reassessment impact:

- The finalization candidate contract remains type-only/constants-only.
- The new builder design describes how a future builder should shape a
  `FinalizationCandidate` from validated/matched upstream evidence.
- The design keeps the builder separate from finalization validators,
  persistence, execution-record creation, stats/PnL updates, trade mutation,
  UI wiring, capture/browser automation, and Avanza behavior.
- The required safety policy remains conservative:
  `safeToFinalize=false`, `safeToPersist=false`,
  `safeToCreateExecutionRecord=false`, `safeToUpdateStats=false`, and
  `safeToMutateTrade=false`.

Recommended next action:

**Action 499 - Create Finalization Candidate Builder Contract Types**

## Action 499 - Finalization Candidate Builder Contract Types Created

Action 499 created `lib/finalization-candidate-builder-contract.ts`.

Contract reassessment impact:

- The existing `FinalizationCandidate` contract remains unchanged as the
  candidate output shape.
- The new builder contract can return an optional `FinalizationCandidate`, but
  it does not build one at runtime.
- Builder result safety policy keeps finalization, persistence,
  execution-record creation, stats/PnL update, and trade mutation disabled.
- No finalization validator, finalization implementation, persistence/write
  behavior, execution-record creation, stats/PnL update, trade mutation, UI,
  capture/browser automation, or Avanza behavior was added.

Recommended next action:

**Action 500 - Reassess Finalization Candidate Builder Contract Types**

## Action 500 - Finalization Candidate Builder Contract Reassessed

Action 500 created
`docs/finalization-candidate-builder-contract-reassessment.md`.

Contract reassessment impact:

- The builder contract types were verified as type-only/constants-only.
- The builder result can carry an optional `FinalizationCandidate`, but it does
  not build one at runtime.
- The existing `FinalizationCandidate` contract remains unchanged and still
  does not approve finalization, persistence, execution-record creation,
  stats/PnL updates, or trade mutation.

Recommended next action:

**Action 501 - Create Finalization Candidate Builder**

## Action 501 - Pure Finalization Candidate Builder Created

Action 501 created `lib/finalization-candidate-builder.ts`.

Contract impact:

- The existing `FinalizationCandidate` contract remains unchanged.
- The new builder can shape a `FinalizationCandidate` for
  `candidate_built`, `needs_review`, `partial_fill_review`, and
  `duplicate_review` paths.
- Blocked and unsupported builder results do not include a candidate.
- Candidate safety policy still keeps finalization, persistence,
  execution-record creation, stats/PnL update, and trade mutation disabled.
- A `FinalizationCandidate` remains candidate metadata only and is not approval
  for any downstream write or mutation boundary.

Next recommended action:

**Action 502 - Reassess Finalization Candidate Builder**

## Action 502 - Finalization Candidate Builder Reassessed

Action 502 created `docs/finalization-candidate-builder-reassessment.md`.

Candidate contract impact:

- `FinalizationCandidate` remains unchanged.
- The builder can shape candidate metadata for clean/review paths only.
- Blocked and unsupported builder results do not include a candidate.
- Candidate output remains not finalization approval, persistence approval,
  execution-record creation approval, stats/PnL update approval, or trade
  mutation approval.
- No contract or runtime behavior change was made.

Next recommended action:

**Action 503 - Create Finalization Candidate Dev Preview Design**

## Action 503 - Finalization Candidate Dev Preview Design Created

Action 503 created `docs/finalization-candidate-dev-preview-design.md`.

Candidate contract impact:

- The preview design renders `FinalizationCandidate` metadata as read-only
  diagnostics.
- It requires visible safety labels for false authority flags.
- It documents `candidate_ready` as candidate-ready but not
  finalization-ready.
- The `FinalizationCandidate` contract remains unchanged.
- No finalization, persistence, execution-record creation, stats/PnL update,
  trade mutation, UI implementation, capture/browser automation, or Avanza
  behavior was added.

Next recommended action:

**Action 504 - Create Finalization Candidate Dev Preview**

## Action 504 - Finalization Candidate Dev Preview Created

Action 504 implemented a read-only dev preview for `FinalizationCandidate`
metadata.

Candidate contract impact:

- The preview renders candidate status, summaries, review flags, warnings, and
  rejection reasons.
- `candidate_ready` is displayed as candidate-ready but not finalization-ready.
- Candidate safety flags remain visible and false.
- No candidate contract change, finalization, persistence, execution-record
  creation, stats/PnL update, trade mutation, browser automation, or Avanza
  behavior was added.

Next recommended action:

**Action 505 - Reassess Finalization Candidate Dev Preview**

## Action 505 - Finalization Candidate Dev Preview Reassessed

Action 505 created
`docs/finalization-candidate-dev-preview-reassessment.md`.

Candidate contract impact:

- The preview remains a read-only candidate metadata display.
- `candidate_ready` is still documented as candidate-ready only and not
  finalization-ready.
- Safety flags remain visible and false for finalization, persistence,
  execution-record creation, stats/PnL updates, and trade mutation.
- No candidate contract change, runtime code change, finalization,
  persistence/write behavior, execution-record creation, stats/PnL update,
  trade mutation, browser automation, Avanza behavior, or broker behavior was
  added.

Next recommended action:

**Action 506 - Create Finalization Validator Design**

## Action 506 - Finalization Validator Design Created

Action 506 created `docs/finalization-validator-design.md`.

Candidate contract impact:

- The validator design defines how a future validator should inspect
  `FinalizationCandidate` metadata.
- Candidate status remains metadata only until a separate validator contract,
  validator implementation, and finalization action boundary exist.
- Candidate authority flags remain false and unexpected true authority flags
  are documented as blocked safety-policy violations.
- No candidate contract change, runtime code change, validator implementation,
  finalization implementation, persistence/write behavior, execution-record
  creation, stats/PnL update, trade mutation, or broker behavior was added.

Next recommended action:

**Action 507 - Create Finalization Validator Contract Types**

## Action 507 Follow-Up - Finalization Validator Contract Types Created

Action 507 created `lib/finalization-validator-contract.ts`.

Candidate contract relationship:

- The validator contract references `FinalizationCandidate` as type-only input.
- Candidate status remains metadata only; validator status is also review
  metadata only until a separate implementation and finalization action exist.
- The validator contract treats unexpected true authority flags as blocked
  safety-policy conditions.
- No candidate contract change, validator implementation, finalization,
  persistence/write behavior, execution-record creation, stats/PnL update,
  trade mutation, browser/Avanza behavior, or broker behavior was added.

Next recommended action:

**Action 508 - Reassess Finalization Validator Contract Types**

## Action 508 Follow-Up - Finalization Validator Contract Reassessed

Action 508 created
`docs/finalization-validator-contract-reassessment.md`.

Candidate contract reassessment impact:

- The validator contract's type-only reference to `FinalizationCandidate` was
  verified.
- Candidate and validator statuses remain metadata only until a separate pure
  validator implementation and later finalization action boundary exist.
- Authority flags remain false for finalization, persistence,
  execution-record creation, stats/PnL update, and trade mutation.
- No candidate contract change, validator implementation, finalization,
  persistence/write behavior, execution-record creation, stats/PnL update,
  trade mutation, browser/Avanza behavior, or broker behavior was added.

Next recommended action:

**Action 509 - Create Finalization Validator**

## Action 509 Follow-Up - Pure Finalization Validator Created

Action 509 created `lib/finalization-validator.ts`.

Candidate contract reassessment impact:

- The validator reads `FinalizationCandidate` metadata and returns
  `FinalizationValidationResult`.
- Candidate status remains metadata only.
- Validator status remains review/diagnostic metadata only.
- All authority flags remain false for finalization, persistence,
  execution-record creation, stats/PnL update, and trade mutation.
- No candidate contract change, finalization implementation, persistence/write
  behavior, execution-record creation, stats/PnL update, trade mutation,
  browser/Avanza behavior, or broker behavior was added.

Next recommended action:

**Action 510 - Reassess Finalization Validator**

## Action 510 Follow-Up - Finalization Validator Reassessed

Action 510 created `docs/finalization-validator-reassessment.md`.

Candidate contract reassessment impact:

- The validator reads `FinalizationCandidate` metadata without changing the
  candidate contract.
- Candidate and validator statuses remain metadata only.
- Safety authority remains false for finalization, persistence,
  execution-record creation, stats/PnL update, and trade mutation.
- No finalization implementation, persistence/write behavior,
  execution-record creation, stats/PnL update, trade mutation,
  capture/browser/Avanza behavior, or broker behavior was added.

Next recommended action:

**Action 511 - Create Finalization State Transition Design**

## Action 511 Follow-Up - Finalization State Transition Design Created

Action 511 created `docs/finalization-state-transition-design.md`.

Candidate contract relationship:

- Candidate status remains metadata only.
- Transition target concepts are future-only and are not applied by this
  design.
- Candidate metadata, validator output, approval, writes, and trade mutation
  remain separate boundaries.
- No candidate contract change, finalization implementation,
  persistence/write behavior, execution-record creation, stats/PnL update,
  trade mutation, capture/browser/Avanza behavior, or broker behavior was
  added.

Next recommended action:

**Action 512 - Create Finalization State Transition Contract Types**
