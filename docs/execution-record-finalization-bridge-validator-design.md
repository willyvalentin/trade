# Execution Record Finalization Bridge Validator Design

## 1. Purpose

This document defines a future validation layer for
Finalization-to-ExecutionRecord bridge results.

The validator will inspect a `FinalizationToExecutionRecordBridgeResult` before
any later execution-record candidate builder, persistence validator, insert
route, or production write boundary can consume it. The validator is intended
to confirm that bridge output is internally consistent, candidate-only,
mapping-only, and safe to pass to a future downstream validation boundary.

This is a documentation-only design. It does not implement a validator
contract, validator runtime, bridge mapper change, execution-record candidate
builder integration, execution-record creation, persistence/write behavior,
Supabase/localStorage writes, audit append, rollback/correction behavior,
stats/PnL update, trade mutation, UI wiring, capture/browser/Avanza behavior,
broker behavior, order behavior, or production runtime behavior.

## 2. Scope

Included:

- Bridge result validation design.
- Candidate-only validation.
- Safety policy validation.
- Idempotency validation.
- Field mapping validation.
- Audit/correction readiness validation.
- Validation handoff validation.
- Blocked/review/unsupported state validation.

Excluded:

- Implementation.
- Validator contract implementation.
- Execution-record creation.
- Persistence.
- Supabase writes.
- LocalStorage writes.
- Audit append.
- Stats/PnL update.
- Rollback/correction execution.
- Trade mutation.
- UI wiring.
- Avanza/browser/capture behavior.
- Broker/order behavior.

## 3. Validator Inputs

Primary input:

- `FinalizationToExecutionRecordBridgeResult`

Optional supporting input:

- Original `FinalizationToExecutionRecordBridgeInput`, if future validator
  design needs to compare raw input with mapped bridge output.

Input material the validator may inspect through the bridge result:

- Finalization candidate.
- Settlement note match.
- Finalization validation result.
- Transition validation result.
- Action validation result.
- Action dry-run result.
- Idempotency metadata.
- Audit/correction metadata.
- Manual approval context.
- Source evidence summary.
- Target execution-record summary.
- Field mapping summary.
- Validation handoff summary.
- Safety policy.

The validator must not fetch missing input, call providers, call Supabase,
read/write localStorage, append audit, update stats, mutate trades, or touch
browser/Avanza/broker/order systems.

## 4. Validator Outputs

Future output should include:

- Validation status.
- Decision recommendation.
- Blocked reasons.
- Warnings.
- Review items.
- Validated field summary.
- Idempotency validation summary.
- Audit/correction validation summary.
- Safety policy validation summary.
- Authority flags.

Suggested statuses:

- `bridge_validation_valid`
- `bridge_validation_needs_review`
- `bridge_validation_blocked`
- `bridge_validation_unsupported`
- `bridge_validation_invalid`

Decision recommendations:

- `allow_candidate_builder_review`
- `manual_review_required`
- `block_downstream_consumption`
- `unsupported_bridge_result`
- `invalid_bridge_result`

Authority flags must remain false:

- `safeToCreateExecutionRecord=false`
- `safeToPersist=false`
- `safeToFinalize=false`
- `safeToUpdateStats=false`
- `safeToAppendAudit=false`
- `safeToRollback=false`
- `safeToMutateTrade=false`
- `safeToRunBrokerAction=false`
- `automaticModeAllowed=false`

## 5. Validation Rules

The validator should check:

- Bridge result exists.
- Bridge status is recognized.
- Bridge output is candidate-only.
- Bridge output is mapping-only.
- Safety policy exists.
- Safety policy is candidate-only and mapping-only.
- All write/action authority flags are false.
- All attempted-action flags are false.
- Source evidence summary is present.
- Target summary is present.
- Field mapping summary is present.
- Idempotency summary is present.
- Audit/correction summary is present.
- Validation handoff summary is present.
- Required fingerprints are present for ready output.
- Unsupported broker/source is not present when status claims ready.
- Ready status has no blocked reasons unless explicitly informational in a
  future contract.
- Review items are consistent with status and summaries.
- Dry-run proposed impact is not treated as write authority.
- Proposed creation-input draft is not treated as execution-record creation.

Ready validation:

- `bridge_candidate_ready` may validate as `bridge_validation_valid` only when
  all required summaries exist, required fingerprints exist, no unsupported
  source/broker is present, no blocked reasons are present, and all authority
  flags remain false.
- Valid still means validation-only. It is not write approval.

Review validation:

- `bridge_candidate_needs_review` should validate as
  `bridge_validation_needs_review` when review items are explainable and no
  hard-blocking safety violation exists.

Blocked validation:

- `bridge_candidate_blocked` should validate as
  `bridge_validation_blocked` when blocked reasons are present and explain the
  blocked state.

Unsupported validation:

- `bridge_candidate_unsupported` should validate as
  `bridge_validation_unsupported` when unsupported source/broker/status
  reasons are present.

Invalid validation:

- Malformed bridge output, unrecognized statuses, missing required summaries,
  authority flag violations, or internally inconsistent ready states should
  validate as `bridge_validation_invalid`.

## 6. Idempotency Validation Rules

Required fingerprint components:

- Source evidence fingerprint.
- Final settlement note match identity when final settlement note evidence is
  used.
- Handoff payload fingerprint.
- Finalization candidate fingerprint.
- Intended execution-record candidate fingerprint or deterministic draft
  identity.
- Intended execution-record idempotency key or deterministic draft key.

Duplicate-check metadata:

- Duplicate check must be required.
- Existing candidate metadata should be surfaced as duplicate/review context.
- Duplicate detected should prevent valid ready output from being consumed
  without review.

Retry and mismatch metadata:

- `retrySafe` must be explainable from complete idempotency material and
  absence of blocked reasons.
- `mismatchRequiresReview` should be true when review items or field conflicts
  are present.

Missing or weak fingerprints:

- Missing source evidence fingerprint, match identity, handoff fingerprint, or
  finalization candidate fingerprint should block or require review.
- Weak derived identities should be reviewed before any future builder or
  persistence boundary.

Conflicting fingerprints:

- Conflicts between source evidence, broker result, settlement note, handoff,
  and intended candidate fingerprints should block downstream consumption.

Final settlement note identity:

- Final settlement note match identity is required when final evidence is the
  official source for mapped execution-record metadata.

## 7. Field Consistency Validation Rules

The validator should check field availability and consistency for:

- Ticker/symbol.
- Side.
- Quantity.
- Price.
- Currency.
- Fees/commission.
- FX.
- Gross amount.
- Net amount.
- Execution timestamp.
- Settlement date.
- Payment date.
- Final note/reference.
- Broker/source identifiers.

Rules:

- Required mapped fields should be available for ready output.
- Target paths should be present for fields required by future candidate input.
- Source value previews should not conflict with target value previews.
- Side, quantity, currency, and instrument identity mismatches should block or
  require review.
- Fee, commission, FX, gross amount, and net amount mismatches should require
  review and may block if material.
- Execution timestamp and settlement/payment dates should be present before
  any future write boundary.
- Broker/source identifiers should be present and tied to source evidence.
- Final note/reference should be present when final settlement evidence is the
  official source.

## 8. Audit/Correction Validation Rules

Audit/correction metadata:

- Must exist before any later write boundary can be considered.
- Missing audit/correction metadata should block downstream consumption or
  require review.

Before/after values:

- Before-state and after-state references are required later for actual write
  and correction workflows.
- The bridge validator can require their presence or mark them as missing for
  future write readiness.

Source evidence chain:

- Source evidence reference must be present and traceable to the bridge source
  evidence summary.

Manual approval:

- Manual approval evidence is required when the bridge input indicates manual
  approval is required.
- Missing approval evidence should block or require review.

Rollback metadata:

- Rollback metadata is required where applicable before future correction or
  rollback execution.
- The validator must not execute rollback/correction.

Audit append:

- Audit append remains a separate future boundary.
- Validator output must not append audit and must keep
  `safeToAppendAudit=false`.

## 9. Safety Policy

The future validator must be:

- Pure.
- Deterministic.
- Validation-only.
- Candidate-only.
- Mapping-aware but not a remapper.
- Disconnected from writes and mutations.

Validator output is not:

- Execution-record creation approval.
- Persistence approval.
- Finalization approval.
- Audit append approval.
- Stats/PnL update approval.
- Rollback/correction approval.
- Trade mutation approval.
- Broker action approval.
- Browser/Avanza automation approval.

Required authority posture:

- `safeToCreateExecutionRecord=false`
- `safeToPersist=false`
- `safeToFinalize=false`
- `safeToUpdateStats=false`
- `safeToAppendAudit=false`
- `safeToRollback=false`
- `safeToMutateTrade=false`
- `safeToRunBrokerAction=false`
- `automaticModeAllowed=false`

Automatic mode remains disabled.

## 10. Relationship To Bridge Mapper

The bridge mapper:

- Creates a bridge candidate result.
- Maps finalization-side metadata into source evidence, target, field mapping,
  idempotency, audit/correction, validation handoff, blocked/review, and
  safety summaries.

The bridge validator:

- Validates the bridge candidate result.
- Checks the mapper output for completeness, consistency, and safety posture.
- Does not remap fields.
- Does not create execution records.
- Does not persist.
- Does not append audit.
- Does not update stats.
- Does not rollback/correct.
- Does not mutate trades.
- Does not run broker/order/browser/Avanza behavior.

## 11. Relationship To Execution-Record Candidate Builder

Future relationship:

- Bridge validator output can later gate execution-record candidate builder
  input.
- Builder remains independent.
- Creation validator remains independent.
- Persistence validator remains independent.
- Insert route remains separate.
- Production write path remains a separate future boundary.

The validator should only answer whether bridge output is structurally and
safely suitable for later candidate-builder review. It must not create a
candidate itself and must not make persistence decisions.

## 12. Failure/Review States

Missing bridge result:

- Status: `bridge_validation_invalid` or `bridge_validation_blocked`.
- Reason: bridge result is required.

Invalid bridge status:

- Status: `bridge_validation_invalid`.
- Reason: status is unrecognized.

Ready state with blocked reasons:

- Status: `bridge_validation_invalid` or `bridge_validation_blocked`.
- Reason: ready output cannot carry hard blocked reasons.

Ready state with missing required summaries:

- Status: `bridge_validation_invalid`.
- Reason: source evidence, target, mapping, idempotency, audit/correction, and
  validation handoff summaries are required.

Missing fingerprint:

- Status: `bridge_validation_blocked` or `bridge_validation_needs_review`.
- Reason: idempotency cannot be proven.

Conflicting fingerprint:

- Status: `bridge_validation_blocked`.
- Reason: duplicate and mismatch risk.

Missing audit/correction metadata:

- Status: `bridge_validation_blocked` or `bridge_validation_needs_review`.
- Reason: future writes require audit/correction readiness.

Unsupported source/broker:

- Status: `bridge_validation_unsupported`.
- Reason: source or broker is outside supported bridge scope.

Mismatched fields:

- Status: `bridge_validation_blocked` or `bridge_validation_needs_review`.
- Reason: source and target field values conflict.

Manual approval missing:

- Status: `bridge_validation_blocked`.
- Reason: approval evidence is required when manual approval is required.

Safety policy authority violation:

- Status: `bridge_validation_invalid`.
- Reason: validator cannot accept any write/action authority set to true.

## 13. Candidate Next Actions

Ranked candidate actions:

A. Create Execution Record Finalization Bridge Validator Contract Types

- Best next step because this design now defines statuses, outputs, summaries,
  failure states, and authority posture for a future type-only contract.

B. Create Finalization-to-ExecutionRecord Bridge Dev Preview Design

- Useful after validator contract types exist, so the preview can display
  validator-shaped diagnostics rather than raw mapper output alone.

C. Reassess Supabase Execution Records Migration/Application Status

- Important before production writes, but still downstream of validator
  contract, validator implementation, candidate-builder integration, and
  persistence boundaries.

D. Create Provisional Trade State Design

- Useful later for lifecycle UX and state modeling, but less foundational than
  bridge validation contract types.

## 14. Recommended Next Action

Recommended next action:

**Action 542 - Create Execution Record Finalization Bridge Validator Contract Types**

Rationale:

- The validator design now defines the validation boundary.
- Contract types are the safest next step because they can encode statuses,
  summaries, blocked reasons, warnings, review items, and false authority flags
  without enabling runtime behavior.

## 15. Risk Assessment

Validator mistaken for write approval:

- Risk: a valid validator result is treated as execution-record creation or
  persistence approval.
- Control: validator output must remain validation-only with all authority
  flags false.

`bridge_validation_valid` overtrusted:

- Risk: valid status bypasses later builder, creation, persistence, audit, or
  manual-review gates.
- Control: valid means structurally safe for future candidate-builder review
  only.

Dry-run proposed impact overtrusted:

- Risk: dry-run impact is treated as write authority.
- Control: dry-run proposed impact remains descriptive metadata only.

Weak idempotency allowed:

- Risk: missing or derived identities are accepted too early.
- Control: missing/weak/conflicting fingerprint material blocks or requires
  review.

Duplicate execution records:

- Risk: future downstream consumption creates duplicates.
- Control: duplicate-check metadata is required and duplicate detection blocks
  or requires review.

Audit/correction missing:

- Risk: future writes cannot be explained or corrected.
- Control: audit/correction readiness is required before future write
  boundaries.

Field mismatches ignored:

- Risk: final note, broker result, and target fields diverge silently.
- Control: field consistency validation blocks or requires review.

Supabase write path opened too early:

- Risk: validator contract is mistaken as write readiness.
- Control: validator has no persistence authority and no Supabase integration.

Future UI overtrust:

- Risk: UI presents validation as operational state.
- Control: future preview must be dev-gated, read-only, and explicit that
  validation is not write approval.

## 16. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, validator
contract implementation, validator implementation, bridge mapper change,
execution-record candidate builder integration, execution-record creation,
persistence/write behavior, Supabase/localStorage write, audit append,
rollback/correction behavior, stats/PnL update, trade mutation, UI wiring,
capture/browser/Avanza behavior, broker behavior, order behavior, or
production runtime behavior was added.

## Action 542 Follow-Up - Validator Contract Types Created

Action 542 created
`lib/execution-record-finalization-bridge-validator-contract.ts`.

Validator design impact:

- Added TypeScript contract types/constants for the future validator boundary.
- Modeled validation input, result, statuses, decision recommendations,
  validated field summaries, idempotency validation, audit/correction
  validation, safety policy validation, blocked reasons, warnings, review
  items, and authority flags.
- Confirmed the contract is not a validator implementation and does not add
  execution-record creation, persistence/write behavior, audit append,
  stats/PnL update, rollback/correction, trade mutation, UI wiring,
  browser/Avanza behavior, broker behavior, or order behavior.

Next recommended action:

**Action 543 - Reassess Execution Record Finalization Bridge Validator Contract Types**

## Action 543 Follow-Up - Validator Contract Reassessed

Action 543 created
`docs/execution-record-finalization-bridge-validator-contract-reassessment.md`.

Validator design impact:

- Reassessed the validator contract types against this design.
- Confirmed the contract remains type-only/constants-only and validation-only.
- Confirmed no validator implementation, bridge mapper changes,
  execution-record creation, persistence/write behavior, audit append,
  stats/PnL update, rollback/correction, trade mutation, UI wiring,
  browser/Avanza behavior, broker behavior, or order behavior was added.

Next recommended action:

**Action 544 - Create Execution Record Finalization Bridge Validator**

## Action 544 Follow-Up - Bridge Validator Created

Action 544 created
`lib/execution-record-finalization-bridge-validator.ts`.

Validator design impact:

- Implemented the pure deterministic validator described by this design.
- The validator remains validation-only and does not remap fields, create
  execution records, persist, append audit, update stats/PnL,
  rollback/correct, mutate trades, wire UI, or touch browser/Avanza/broker
  behavior.
- Added focused e2e/unit-style coverage for valid and unsafe paths.

Next recommended action:

**Action 545 - Reassess Execution Record Finalization Bridge Validator**

## Action 545 Follow-Up - Validator Reassessed

Action 545 created
`docs/execution-record-finalization-bridge-validator-reassessment.md`.

Validator design impact:

- Confirmed the implemented validator follows this design's
  valid/review/blocked/unsupported/invalid policy.
- Confirmed summary, field mapping, idempotency, audit/correction, and safety
  policy checks remain conservative.
- Confirmed validator output remains validation-only and does not create,
  persist, finalize, append audit, update stats/PnL, rollback/correct, mutate
  trades, wire UI, or touch browser/Avanza/broker/order behavior.

Next recommended action:

**Action 546 - Create Finalization-to-ExecutionRecord Bridge Dev Preview Design**

## Action 546 Follow-Up - Bridge Dev Preview Design Created

Action 546 created
`docs/finalization-to-execution-record-bridge-dev-preview-design.md`.

Validator design impact:

- Defined how validator output should be displayed in a future dev-gated,
  read-only `Execution Record Bridge Preview`.
- Required visible safety labels and false authority flags even for
  `bridge_validation_valid`.
- Confirmed no UI implementation, validator changes, execution-record creation,
  persistence, audit append, stats/PnL, rollback/correction, trade mutation,
  Avanza/browser behavior, broker behavior, or order behavior was added.

Next recommended action:

**Action 547 - Create Finalization-to-ExecutionRecord Bridge Dev Preview**

## Action 547 Follow-Up - Bridge Dev Preview Created

Action 547 implemented the read-only validator display described by this design.

Validator design impact:

- The dev preview shows validator status, summaries, review metadata, and
  authority flags after an explicit fixture-only trigger.
- The preview keeps validation-only language visible even for valid output.
- No validator behavior, execution-record creation, persistence, audit append,
  stats/PnL update, rollback/correction, trade mutation, Avanza/browser,
  broker, or order behavior was added.

Next recommended action:

**Action 548 - Reassess Finalization-to-ExecutionRecord Bridge Dev Preview**

## Action 548 Follow-Up - Bridge Dev Preview Reassessed

Action 548 created
`docs/finalization-to-execution-record-bridge-dev-preview-reassessment.md`.

Validator design impact:

- Confirmed the preview keeps validator output in a read-only display boundary.
- Confirmed valid validator output is not execution-record creation,
  persistence, finalization, audit, stats/PnL, rollback/correction, trade
  mutation, broker, Avanza, browser, or order approval.
- Confirmed no runtime behavior changed.

Next recommended action:

**Action 549 - Reassess Supabase Execution Records Migration/Application Status**
