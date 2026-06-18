# Execution Record Candidate Builder Integration Validator Design

## 1. Purpose

Design a future validation-only boundary for the Execution Record Candidate
Builder Integration Adapter output.

The validator would review
`ExecutionRecordCandidateBuilderIntegrationAdapterResult` before any later
invocation of `buildExecutionRecordCandidate(...)` is considered. It would
validate proposed input shape, adapter status, field mappings, schema readiness,
idempotency, audit/provenance, and authority flags while remaining
validation-only.

This is a documentation-only design. It does not add runtime behavior, create a
validator contract, implement a validator, change the adapter, call the
candidate builder, create execution-record candidates, create execution records,
persist, write Supabase/localStorage, append audit, update stats/PnL,
rollback/correct, mutate trades, wire UI, automate browser/Avanza behavior, run
broker behavior, or run order behavior.

## 2. Scope

In scope:

- Define future validator inputs.
- Define future validator outputs.
- Define statuses and decision recommendations.
- Define validation rules for adapter result readiness.
- Define proposed input shape validation.
- Define schema readiness validation.
- Define idempotency validation.
- Define audit/provenance validation.
- Define safety policy and no-action/no-write authority checks.
- Define relationship to adapter output and candidate builder input.
- Define failure and review states.
- Define risks and next action.

Out of scope:

- Runtime validator contract implementation.
- Runtime validator implementation.
- Adapter changes.
- Candidate builder changes.
- Candidate builder invocation.
- Bridge mapper or bridge validator changes.
- Execution-record candidate creation.
- Execution-record creation.
- Persistence/write behavior.
- Supabase/localStorage writes.
- Audit append.
- Stats/PnL update.
- Rollback/correction behavior.
- Trade mutation.
- UI wiring.
- Browser/Avanza behavior.
- Broker/order behavior.

## 3. Validator Inputs

The future validator should accept a validation input such as:

- validator contract version;
- requested/evaluated timestamp;
- adapter result:
  `ExecutionRecordCandidateBuilderIntegrationAdapterResult`;
- optional original adapter input:
  `ExecutionRecordCandidateBuilderIntegrationAdapterInput`;
- optional expected creation contract version;
- optional generated types/schema readiness policy;
- optional duplicate/idempotency policy;
- optional audit/provenance policy;
- optional manual approval policy;
- optional safety policy overrides for stricter local/dev review;
- metadata describing fixture/dev/manual-review source.

Required input groups:

- adapter result;
- adapter proposed input summary;
- adapter field mapping summary;
- adapter precondition summary;
- adapter schema readiness summary;
- adapter idempotency summary;
- adapter audit/provenance summary;
- adapter safety policy.

The validator input must not include a callable builder function, persistence
client, Supabase client, localStorage reference, audit appender, stats updater,
rollback helper, trade mutator, browser runner, Avanza client, broker client, or
order execution capability.

## 4. Validator Outputs

The future validator should output a result such as:

- validator contract version;
- evaluated timestamp;
- status;
- decision recommendation;
- adapter result reference;
- proposed input validation summary;
- field mapping validation summary;
- schema readiness validation summary;
- idempotency validation summary;
- audit/provenance validation summary;
- safety policy validation summary;
- blocker list;
- warning list;
- review item list;
- manual approval requirement summary;
- duplicate/idempotency review summary;
- no-action/no-write authority flags.

Proposed statuses:

- `adapter_validation_valid`
- `adapter_validation_needs_review`
- `adapter_validation_blocked`
- `adapter_validation_unsupported`
- `adapter_validation_not_ready`

Proposed decision recommendations:

- `validated_for_future_builder_review_only`
- `needs_manual_review`
- `blocked_do_not_call_builder`
- `unsupported_do_not_call_builder`
- `not_ready_do_not_call_builder`

`adapter_validation_valid` would mean the adapter output is internally
consistent enough for future manual builder-invocation review. It must not mean
candidate builder invocation approval, execution-record candidate creation,
execution-record creation, persistence approval, audit append approval,
stats/PnL approval, trade mutation approval, broker action approval, or
automatic mode approval.

## 5. Validation Rules

Core validation rules:

- Adapter result must be present.
- Adapter status must be `adapter_input_ready` for valid status.
- `adapter_input_needs_review` maps to validator review.
- `adapter_input_blocked` maps to validator blocked.
- `adapter_input_unsupported` maps to validator unsupported.
- `adapter_input_not_ready` maps to validator not ready.
- Proposed input summary must be present.
- Required proposed input fields must be present.
- Field mappings must not contain unresolved required blockers.
- Precondition summary must indicate bridge result and valid bridge validation.
- Schema readiness must be present and explicitly reviewed.
- Idempotency metadata must include required fingerprints.
- Audit/provenance metadata must be present and traceable.
- Manual approval must be present when required.
- Safety policy must keep all builder/create/write/action authority false.
- Builder invocation attempted flags must be false.
- Candidate creation attempted flags must be false.
- Execution-record creation attempted flags must be false.
- Persistence/audit/stats/rollback/trade/browser/Avanza/broker attempted flags
  must be false.

The validator should aggregate adapter blockers, warnings, and review items
rather than hide them. A valid result should still carry warnings such as
candidate builder not called and duplicate check required.

## 6. Proposed Input Shape Validation

The validator should verify that proposed input shape is complete enough for
future builder-review consideration:

- `contractVersion` present and expected.
- `requestedAt` present and parseable.
- `sourceEnvironment` present and allowed.
- `executionMode` present and automatic mode not implicitly allowed.
- `executionPhase` present.
- `expectedAction` present.
- `expectedInstrument.ticker` present.
- `sourceBrokerExecutionResult` present.
- `brokerMetadata.confirmationTimestamp` present.
- `idempotency.idempotencyKey` present.
- `idempotency.sourceEvidenceFingerprint` present.
- `auditContext` present.
- `proposedSourceBrokerExecutionResult` present when required.
- `missingRequiredFields` empty for valid status.
- proposed input remains a draft shape, not an `ExecutionRecordCandidate`.

Validation should block if required fields are missing or malformed. It should
review if optional but important fields are absent, such as planning snapshot
reference, existing trade reference, broker confirmation id, final settlement
note identity, or correction strategy reference.

## 7. Schema Readiness Validation

The validator should verify schema readiness without enabling writes:

- schema readiness summary present;
- generated execution-record types available;
- generated types reviewed;
- generated type location recorded when available;
- migration application proven;
- migration reference recorded when available;
- execution-record table presence represented;
- schema aligned with creation contract;
- RLS policy reviewed;
- persistence boundary remains disabled;
- insert route remains dry-run only;
- production write remains disabled;
- `safeToPersist` remains false.

Generated types absent or unreviewed should produce
`generated_types_absent_or_unknown` review/block diagnostics. Unproven migration
application should produce `migration_application_not_proven` review/block
diagnostics.

Schema readiness validation must not generate types, apply migrations, inspect
live Supabase, call Supabase, or approve persistence.

## 8. Idempotency Validation

The validator should verify idempotency metadata:

- intended execution-record idempotency key present;
- intended execution-record candidate fingerprint present when available;
- source evidence fingerprint present;
- broker result fingerprint present or explicitly reviewed;
- handoff payload fingerprint present or explicitly reviewed;
- final settlement note match identity present when relevant;
- required fingerprints present;
- duplicate check required;
- duplicate detected state represented;
- duplicate record id represented when duplicate detected;
- retry safety represented;
- mismatch review state represented;
- `safeForProposedInputOnly` true;
- `safeForWrite` false.

Missing required fingerprints should block. Duplicate risk or fingerprint
mismatch should block or require manual review depending on future policy, but
must not create or persist records.

## 9. Audit/Provenance Validation

The validator should verify audit/provenance metadata:

- audit/provenance summary present;
- audit required before write remains true;
- audit metadata present;
- provenance metadata present;
- correction metadata present or explicitly reviewed;
- source evidence traceable;
- manual approval required state represented;
- manual approval present when required;
- source event ids represented;
- handoff session id represented when available;
- payload id represented when available;
- duplicate prevention reference represented when available;
- correction strategy reference represented when available;
- rollback metadata requirement represented;
- rollback metadata present or explicitly reviewed;
- audit append attempted false;
- rollback attempted false;
- `safeForProposedInputOnly` true;
- `safeForWrite` false.

Missing audit/provenance metadata should block. Missing manual approval when
required should block. Missing rollback/correction metadata should require
review unless a future policy explicitly marks it irrelevant.

## 10. Safety Policy

The validator safety policy should include:

- `validationOnly: true`
- `adapterOutputOnly: true`
- `proposedInputOnly: true`
- `safeToCallCandidateBuilder: false`
- `safeToCreateExecutionRecordCandidate: false`
- `safeToCreateExecutionRecord: false`
- `safeToPersist: false`
- `safeToFinalize: false`
- `safeToUpdateStats: false`
- `safeToAppendAudit: false`
- `safeToRollback: false`
- `safeToMutateTrade: false`
- `safeToRunBrokerAction: false`
- `automaticModeAllowed: false`
- `candidateBuilderInvocationAttempted: false`
- `executionRecordCandidateCreationAttempted: false`
- `executionRecordCreationAttempted: false`
- `persistenceAttempted: false`
- `finalizationAttempted: false`
- `statsUpdateAttempted: false`
- `auditAppendAttempted: false`
- `rollbackAttempted: false`
- `tradeMutationAttempted: false`
- `browserAutomationAttempted: false`
- `avanzaAutomationAttempted: false`
- `brokerAutomationAttempted: false`

Every validator status, including `adapter_validation_valid`, must block
builder invocation, candidate creation, execution-record creation, persistence,
audit append, stats/PnL update, rollback, trade mutation, browser/Avanza
behavior, broker behavior, order behavior, and automatic mode.

## 11. Relationship To Adapter And Candidate Builder

Relationship to adapter:

- The adapter shapes proposed creation input metadata.
- The validator would validate the adapter result.
- The validator should not mutate adapter output.
- The validator should not fill missing fields.
- The validator should not normalize broker evidence beyond reviewing existing
  adapter diagnostics.

Relationship to candidate builder:

- The validator is still not builder invocation.
- The validator should not import or call `buildExecutionRecordCandidate(...)`.
- The validator should not create `ExecutionRecordCandidate`.
- A future separate action would be required to design or implement any
  manually-gated builder invocation boundary.
- Even a future builder output would remain separate from persistence approval.

Relationship to bridge mapper/validator:

- Bridge mapper and bridge validator remain upstream.
- Adapter validation should consume their diagnostics through adapter output.
- It should not change bridge mapper or bridge validator behavior.

## 12. Failure/Review States

Blocked examples:

- Missing adapter result.
- Adapter status blocked.
- Missing proposed input summary.
- Missing required proposed input fields.
- Missing bridge validation metadata.
- Invalid bridge validation represented in adapter preconditions.
- Missing idempotency metadata.
- Missing source evidence fingerprint.
- Missing audit/provenance metadata.
- Manual approval missing when required.
- Candidate builder invocation attempted flag true.
- Candidate creation attempted flag true.
- Execution-record creation attempted flag true.
- Persistence/audit/stats/rollback/trade/browser/Avanza/broker attempted flag
  true.
- Unsupported source or broker.

Review examples:

- Adapter status needs review.
- Generated types absent/unknown.
- Migration application not proven.
- Optional broker confirmation references missing.
- Final settlement note identity missing but not required by policy.
- Rollback metadata missing but correction not currently applicable.
- Duplicate check required with no duplicate detected proof.

Unsupported examples:

- Adapter status unsupported.
- Unsupported source environment.
- Unsupported broker.
- Unsupported execution mode.
- Unsupported instrument type or market if future policy restricts them.

Not-ready examples:

- Adapter status not ready.
- Integration metadata incomplete.
- Required upstream bridge metadata not yet produced.

## 13. Candidate Next Actions

A. Create Execution Record Candidate Builder Integration Validator Contract Types

- Best next step.
- Converts this design into type-only/constants-only validator contracts.
- Keeps validation-only and no-builder/no-write boundaries intact.

B. Reassess Execution Record Candidate Builder Integration Validator Contract
Types

- Follows contract creation.
- Verifies no runtime behavior was introduced.

C. Create Execution Record Candidate Builder Integration Validator
Implementation

- Later step after contract types and reassessment.
- Must remain pure validation-only.

D. Create Execution Record Candidate Builder Integration Dev Preview Design

- Later design for displaying adapter/validator diagnostics.
- Must not invoke the builder or create records.

E. Create Supabase Execution Records Migration Checklist Update

- Useful for schema readiness work.
- Should remain separate from adapter validator design.

## 14. Recommended Next Action

**Action 562 - Create Execution Record Candidate Builder Integration Validator Contract Types**

Rationale:

- The adapter exists and has been reassessed.
- A validator design now defines expected inputs, outputs, statuses, rules, and
  safety boundaries.
- Contract types are the safest next step before any validator implementation.
- Contract types can preserve validation-only behavior and prevent accidental
  builder invocation or write authority.

## 15. Risk Assessment

Validator mistaken for builder invocation:

- Mitigation: every validator status must block builder invocation.

`adapter_validation_valid` overtrusted:

- Mitigation: valid means adapter output is internally consistent for future
  manual builder-review consideration only.

Proposed input mistaken for execution-record candidate:

- Mitigation: validator output is not `ExecutionRecordCreationResult` and not
  `ExecutionRecordCandidate`.

Builder candidate mistaken for persistence approval:

- Mitigation: persistence validator and insert route remain separate future
  gates.

Generated types assumed available:

- Mitigation: generated types remain absent/unknown unless separately generated
  and reviewed.

Migration assumed applied:

- Mitigation: migration application remains unproven unless separately applied
  and verified.

Audit/provenance metadata dropped:

- Mitigation: validator must explicitly validate audit/provenance summary.

Idempotency/fingerprint drift:

- Mitigation: validator must preserve source, broker, handoff, final settlement
  note, candidate, and idempotency references.

Supabase write path opened too early:

- Mitigation: validator has no Supabase client and all persistence/write flags
  remain false.

Future UI overtrust:

- Mitigation: any future UI must distinguish bridge validation, adapter
  shaping, adapter validation, builder invocation, candidate creation,
  persistence eligibility, and actual persistence.

## 16. Verification

Action 561 verification:

- `git diff --check`

No runtime validation is required because Action 561 is documentation-only.

## 17. Action 562 Follow-Up - Validator Contract Types Created

Action 562 created
`lib/execution-record-candidate-builder-integration-validator-contract.ts`.

The new module defines TypeScript contract types/constants for the future
Execution Record Candidate Builder Integration Validator. It models validation
input/result/status/decision, proposed input validation, field mapping
validation, precondition validation, schema readiness validation, idempotency
validation, audit/provenance validation, safety policy validation, authority
flags, blocked reasons, warnings, review items, default authority flags, and
status metadata.

The contract is validation-only and type/constant-only. It does not implement a
validator, change the adapter, call `buildExecutionRecordCandidate(...)`, create
execution-record candidates, create execution records, persist, append audit,
update stats/PnL, rollback, mutate trades, wire UI, or run
browser/Avanza/broker/order behavior.

Next recommended action:

**Action 563 - Reassess Execution Record Candidate Builder Integration Validator Contract Types**

## 18. Action 563 Follow-Up - Validator Contract Types Reassessed

Action 563 created
`docs/execution-record-candidate-builder-integration-validator-contract-reassessment.md`.

The reassessment confirms
`lib/execution-record-candidate-builder-integration-validator-contract.ts`
remains type-only/constants-only, validation-only, conservative, aligned with
this validator design, and disconnected from runtime validator implementation,
adapter changes, candidate builder invocation, execution-record candidate
creation, execution-record creation, persistence/write behavior, audit append,
stats/PnL update, rollback, trade mutation, UI wiring, browser/Avanza behavior,
broker behavior, and order behavior.

Next recommended action:

**Action 564 - Create Execution Record Candidate Builder Integration Validator**

## 19. Action 564 Follow-Up - Validator Created

Action 564 created
`lib/execution-record-candidate-builder-integration-validator.ts`.

Design impact:

- Implements the planned pure validation-only boundary.
- Validates adapter output before any future builder invocation is considered.
- Does not change adapter, builder, bridge mapper, bridge validator, creation,
  persistence, audit, stats, rollback, trade, UI, browser/Avanza, broker, or
  order behavior.
- Keeps all builder/create/write/action authority false.

Next recommended action:

**Action 565 - Reassess Execution Record Candidate Builder Integration Validator**

## 20. Action 565 Follow-Up - Validator Reassessed

Action 565 created
`docs/execution-record-candidate-builder-integration-validator-reassessment.md`.

Design reassessment result:

- The validator implements this design as validation-only.
- The validator does not call the candidate builder or create records.
- All builder/create/write/action authority remains false.

Next recommended action:

**Action 566 - Create Execution Record Candidate Builder Integration Dev Preview Design**

## 21. Action 566 Follow-Up - Dev Preview Design Created

Action 566 created
`docs/execution-record-candidate-builder-integration-dev-preview-design.md`.

Validator design impact:

- Future preview should visualize validator output as validation-only.
- `adapter_validation_valid` must not be shown as builder invocation approval.
- All builder/create/write/action authority remains false.

Next recommended action:

**Action 567 - Create Execution Record Candidate Builder Integration Dev Preview**

## 22. Action 567 Follow-Up - Dev Preview Created

Action 567 implemented the dev preview for the adapter-validator output.

Validator design impact:

- The preview visualizes validation-only output in the late-phase dev modal.
- The validator remains detached from `buildExecutionRecordCandidate(...)`.
- The preview shows that validation valid is not approval to create a
  candidate, create a record, persist, append audit, update stats/PnL,
  rollback/correct, mutate trade state, use Avanza/browser behavior, or send to
  a broker.

Next recommended action:

**Action 568 - Reassess Execution Record Candidate Builder Integration Dev Preview**

## 23. Action 568 Follow-Up - Dev Preview Reassessed

Action 568 confirmed the implemented preview follows the validator design
boundary.

Validator design impact:

- Validation output remains validation-only.
- The preview does not turn validation success into builder invocation
  approval.
- No candidate creation, record creation, persistence, audit append,
  stats/PnL update, rollback/correction, trade mutation, browser/Avanza,
  broker, or order behavior was added.

Next recommended action:

**Action 569 - Create Execution Record Candidate Builder Invocation Design**

## 24. Action 569 Follow-Up - Invocation Design Created

Action 569 documented how future builder invocation must remain downstream of
adapter validation.

Validator design impact:

- Validation success remains necessary but insufficient for persistence.
- Future invocation must still preserve all no-write/no-action flags.
- No validator implementation or runtime behavior changed.

Next recommended action:

**Action 570 - Create Execution Record Candidate Builder Invocation Contract Types**

## 25. Action 570 Follow-Up - Invocation Contract Types Created

Action 570 added type-only invocation contracts after adapter validation.

Validator design impact:

- Future invocation contracts preserve validation as a gate.
- Validation remains separate from builder invocation and persistence.
- No validator runtime behavior changed.

Next recommended action:

**Action 571 - Reassess Execution Record Candidate Builder Invocation Contract Types**

## 26. Action 571 Follow-Up - Invocation Contract Reassessed

Action 571 confirmed invocation contract types preserve validation as a gate.

Validator design impact:

- A future invocation validator design is still required before implementation.
- No validator runtime behavior changed.

Next recommended action:

**Action 572 - Create Execution Record Candidate Builder Invocation Validator Design**

## 27. Action 572 Follow-Up - Invocation Validator Design Created

Action 572 created a future invocation validator design.

Validator design impact:

- Existing adapter-validator design remains unchanged.
- Invocation validation remains downstream and validation-only.
- No builder call or write behavior was added.

Next recommended action:

**Action 573 - Create Execution Record Candidate Builder Invocation Validator Contract Types**

## Action 573 Follow-Up - Invocation Validator Contract Types Created

Action 573 added invocation validator contract types for the future layer after
adapter validation.

Design impact:

- Adapter validation remains validation-only prerequisite metadata.
- Invocation validation remains contract-only; no runtime validator was added.
- No call to `buildExecutionRecordCandidate(...)` is introduced.
- No execution-record candidate/record creation, persistence/write behavior,
  audit append, stats/PnL update, rollback/correction, trade mutation, UI,
  browser/Avanza, broker, or order behavior is introduced.

Next recommended action:

**Action 574 - Reassess Execution Record Candidate Builder Invocation Validator Contract Types**

## Action 574 Follow-Up - Invocation Validator Contract Reassessed

Action 574 confirmed the invocation validator contract types remain aligned
with the validation-only boundary after adapter validation.

Design impact:

- Adapter validation remains prerequisite metadata only.
- Invocation validation remains unimplemented.
- No builder invocation, execution-record candidate creation,
  execution-record creation, persistence/write behavior, audit append,
  stats/PnL update, rollback/correction, trade mutation, UI, browser/Avanza,
  broker, or order behavior was added.

Next recommended action:

**Action 575 - Create Execution Record Candidate Builder Invocation Validator**

## Action 575 Follow-Up - Invocation Validator Created

Action 575 added the pure invocation validator after adapter validation.

Design impact:

- Adapter validation remains a prerequisite.
- Invocation validation remains validation-only and no-write.
- No call to `buildExecutionRecordCandidate(...)`, execution-record
  candidate/record creation, persistence/write behavior, audit append,
  stats/PnL update, rollback/correction, trade mutation, UI, browser/Avanza,
  broker, or order behavior was added.

Next recommended action:

**Action 576 - Reassess Execution Record Candidate Builder Invocation Validator**

## Action 576 Follow-Up - Invocation Validator Reassessed

Action 576 reassessed the invocation validator after implementation.

Design impact:

- Adapter validation remains prerequisite metadata.
- Invocation validation remains validation-only, conservative, and no-write.
- No `buildExecutionRecordCandidate(...)` call, candidate/record creation,
  persistence/write behavior, audit append, stats/PnL update,
  rollback/correction, trade mutation, UI, browser/Avanza, broker, or order
  behavior was added.

Next recommended action:

**Action 577 - Create Execution Record Candidate Builder Invocation Dev Preview Design**

## Action 577 Follow-Up - Invocation Dev Preview Design Created

Action 577 designed a future invocation preview after adapter validation.

Design impact:

- Adapter validation remains prerequisite metadata.
- Invocation preview should show validation lineage without enabling builder
  calls or writes.
- No runtime behavior, builder invocation, candidate/record creation,
  persistence/write behavior, audit append, stats/PnL update,
  rollback/correction, trade mutation, UI implementation, browser/Avanza,
  broker, or order behavior was added.

Next recommended action:

**Action 578 - Create Execution Record Candidate Builder Invocation Dev Preview**
