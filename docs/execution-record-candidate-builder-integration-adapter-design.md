# Execution Record Candidate Builder Integration Adapter Design

## 1. Purpose

Design a future bridge-to-builder adapter that converts validated
finalization-to-execution-record bridge metadata and candidate-builder
integration metadata into an `ExecutionRecordCreationInput` draft for
`buildExecutionRecordCandidate(...)`.

This is a documentation-only design. It does not implement an adapter, call the
candidate builder, create execution records, persist records, write
Supabase/localStorage, append audit records, update stats/PnL, rollback/correct
state, mutate trades, wire UI, automate browser/Avanza behavior, run broker
behavior, or run order behavior.

## 2. Scope

In scope:

- Define future adapter inputs.
- Define future adapter output.
- Define field mapping into `ExecutionRecordCreationInput`.
- Define preconditions, statuses, review states, and safety policy.
- Define relationship to the current candidate builder.
- Define generated type and schema readiness boundaries.
- Define risks and next action.

Out of scope:

- Runtime adapter implementation.
- Candidate builder invocation.
- Candidate builder changes.
- Bridge mapper or validator changes.
- Execution-record creation.
- Persistence/write behavior.
- Supabase/localStorage writes.
- Audit append.
- Stats/PnL update.
- Rollback/correction behavior.
- Trade mutation.
- UI wiring.
- Avanza/browser behavior.
- Broker/order behavior.

## 3. Adapter Inputs

The future adapter should accept a shape that can reference:

- `ExecutionRecordCandidateBuilderIntegrationInput`
- `ExecutionRecordCandidateBuilderIntegrationResult`
- validated `FinalizationToExecutionRecordBridgeResult`
- `ExecutionRecordFinalizationBridgeValidationResult`
- bridge mapper result;
- original bridge input;
- finalization candidate;
- final settlement note match identity;
- broker execution result candidate or immediate broker readback evidence;
- manual approval context;
- idempotency summaries;
- audit/correction summaries;
- schema readiness summaries;
- optional existing execution-record candidate metadata.

Required adapter input groups:

- bridge result and bridge validation result;
- source evidence summary;
- target summary with intended creation input or sufficient source fields;
- idempotency summary with intended idempotency key and source fingerprint;
- audit/correction summary;
- manual approval context when required;
- schema readiness metadata, even when absent/unknown.

The adapter input should remain metadata-only. It must not include a callable
builder function or persistence client.

## 4. Adapter Output

The adapter should output a draft object such as:

- status;
- decision recommendation;
- `creationInputDraft?: ExecutionRecordCreationInput | null`;
- source-to-target field mapping summary;
- missing field list;
- blocked reasons;
- warnings;
- review items;
- idempotency handoff summary;
- audit/correction handoff summary;
- schema readiness summary;
- safety policy.

The output is candidate-input-shaping-only. It is not an
`ExecutionRecordCreationResult`, not an `ExecutionRecordCandidate`, not
`ExecutionRecordPersistenceInput`, and not an insert route request.

The adapter must not call `buildExecutionRecordCandidate(...)`. A later,
separate implementation boundary may choose whether to pass the draft into the
builder after adapter validation and manual review gates are satisfied.

## 5. Field Mapping To `ExecutionRecordCreationInput`

Planned mapping:

- `contractVersion`: `EXECUTION_RECORD_CREATION_CONTRACT_VERSION`.
- `requestedAt`: adapter evaluation time or bridge input request time.
- `sourceEnvironment`: bridge handoff metadata, defaulting to explicit review
  if absent.
- `executionMode`: bridge handoff metadata; automatic mode remains blocked or
  review-only.
- `executionPhase`: derived from finalization/action context and must be
  explicit.
- `expectedAction`: mapped from broker side/action and finalization intent.
- `expectedInstrument`: ticker, name, market, currency, and instrument type
  from broker evidence, finalization candidate, or bridge target summary.
- `expectedQuantity`: mapped from broker execution quantity when available.
- `expectedPositionId`: mapped from finalization candidate, position reference,
  or existing trade reference.
- `recommendationId`: mapped from handoff metadata, planning snapshot, or
  existing trade reference.
- `positionId`: mapped from finalization candidate or existing trade reference.
- `sourceBrokerExecutionResult`: normalized from broker execution result
  candidate or immediate readback evidence.
- `brokerMetadata`: broker, order id, confirmation id/reference, and
  confirmation timestamp from broker evidence.
- `idempotency.idempotencyKey`: intended execution-record idempotency key from
  bridge/idempotency summary.
- `idempotency.sourceEvidenceFingerprint`: bridge source evidence fingerprint.
- `idempotency.brokerResultFingerprint`: broker result candidate fingerprint.
- `idempotency.handoffPayloadFingerprint`: bridge handoff payload fingerprint.
- `idempotency.captureId` and `requestId`: carried from source/handoff metadata
  when present.
- `auditContext`: source event ids, handoff session id, payload id, source
  capture status, source order status, created-by actor, and safety markers.
- `planningSnapshotRef`: planning snapshot identity when available.
- `existingTradeRef`: position/recommendation/ticker references when available.

Fields requiring explicit adapter review:

- final settlement note identity contribution to idempotency;
- partial fill policy;
- automatic execution mode;
- missing broker order id with alternate broker reference;
- manual approval status;
- audit/correction metadata not representable in current builder input;
- generated type and migration readiness.

## 6. Preconditions

The adapter should require:

- bridge result present;
- bridge validation result present;
- bridge validation status acceptable for shape review;
- source evidence summary present;
- target summary present;
- broker evidence present and traceable;
- final settlement note identity present when needed for idempotency;
- intended idempotency key present;
- source evidence fingerprint present;
- audit/correction metadata present;
- manual approval present when required;
- generated type and migration readiness explicitly represented, even if
  absent/unknown;
- safety policy authority flags all false.

Preconditions do not authorize builder invocation or writes. They only determine
whether a draft input shape can be prepared.

## 7. Adapter Statuses

Proposed statuses:

- `adapter_input_ready`
- `adapter_input_needs_review`
- `adapter_input_blocked`
- `adapter_input_unsupported`
- `adapter_input_not_ready`

Proposed decision recommendations:

- `draft_creation_input_only`
- `needs_manual_review`
- `blocked_do_not_shape`
- `unsupported_do_not_shape`
- `not_ready_do_not_shape`

`adapter_input_ready` means a draft `ExecutionRecordCreationInput` shape may be
available for review. It is not builder invocation approval, execution-record
creation approval, persistence approval, audit append approval, stats/PnL update
approval, trade mutation approval, broker action approval, or automatic mode
approval.

## 8. Safety Policy

The adapter safety policy should include:

- `designOnly: true`
- `adapterInputShapeOnly: true`
- `safeToCallCandidateBuilder: false`
- `safeToCreateExecutionRecord: false`
- `safeToPersist: false`
- `safeToFinalize: false`
- `safeToUpdateStats: false`
- `safeToAppendAudit: false`
- `safeToRollback: false`
- `safeToMutateTrade: false`
- `safeToRunBrokerAction: false`
- `automaticModeAllowed: false`
- `adapterImplemented: false`
- `candidateBuilderInvocationAttempted: false`
- `executionRecordCreationAttempted: false`
- `persistenceAttempted: false`
- `auditAppendAttempted: false`
- `statsUpdateAttempted: false`
- `rollbackAttempted: false`
- `tradeMutationAttempted: false`
- `browserAutomationAttempted: false`
- `avanzaAutomationAttempted: false`
- `brokerAutomationAttempted: false`

Any future implementation must keep the adapter pure and deterministic. It must
not import runtime persistence clients, browser automation utilities, broker
automation utilities, or order execution utilities.

## 9. Relationship To Candidate Builder

The current builder API is:

`buildExecutionRecordCandidate(input: ExecutionRecordCreationInput):
ExecutionRecordCreationResult`

The adapter should produce only a draft `ExecutionRecordCreationInput`. It must
not call the builder.

The candidate builder remains the next validation/build boundary. The builder's
eligible output is still candidate-only and `safeToPersist: false`.

Bridge validation is not builder validation. Adapter readiness is not builder
readiness. Builder candidate output is not persistence approval.

## 10. Generated Types/Schema Readiness

Generated Supabase execution-record table types remain absent/unknown.

Migration application remains unproven.

The adapter design must keep schema readiness as metadata only:

- generated types unavailable or unknown must be represented as review/blocking
  state;
- migration application not proven must be represented as review/blocking state;
- no generated type assumption may be used to enable writes;
- no migration assumption may be used to enable writes;
- persistence remains behind separate validator and insert route gates.

## 11. Failure/Review States

Future adapter blocked/review reasons should include:

- missing bridge result;
- missing bridge validation result;
- bridge validation not acceptable for shape review;
- missing source evidence summary;
- missing target summary;
- missing broker execution evidence;
- missing confirmation timestamp;
- missing broker order/confirmation/reference;
- missing expected action;
- missing expected instrument;
- missing quantity;
- missing price;
- missing currency;
- missing idempotency key;
- missing source evidence fingerprint;
- missing broker result fingerprint;
- missing handoff payload fingerprint;
- missing audit/correction metadata;
- manual approval missing;
- unsupported broker;
- unsupported source;
- unsupported execution phase;
- automatic mode requested;
- partial fill policy missing;
- generated types absent or unknown;
- migration application not proven;
- persistence boundary not enabled;
- safety policy authority violation.

Warnings should include:

- adapter design only;
- draft creation input only;
- builder invocation out of scope;
- bridge validation not write approval;
- generated types required later;
- migration application required later;
- audit required before write;
- idempotency review required;
- duplicate check required;
- persistence validation required later;
- stats update out of scope;
- trade mutation out of scope.

## 12. Candidate Next Actions

A. Create Execution Record Candidate Builder Integration Adapter Contract Types

- Best next step.
- Defines a type-only adapter input/output contract before implementation.
- Preserves adapter statuses, blocked reasons, warnings, safety policy, and
  mapping summaries.

B. Create Execution Record Candidate Builder Integration Validator Design

- Useful after adapter contract types exist.
- Defines validation of adapter output before any future builder invocation.

C. Create Supabase Execution Records Migration Checklist Update

- Useful later when target project and generated type commands are ready.

D. Create Provisional Trade State Design

- Useful later after execution-record creation/persistence boundaries are closer
  to implementation.

## 13. Recommended Next Action

**Action 557 - Create Execution Record Candidate Builder Integration Adapter Contract Types**

Rationale:

- The adapter design is now explicit.
- Type-only contract definitions are the safest next step before any runtime
  adapter implementation.
- Contract types can preserve input/output shape, mapping summaries, blockers,
  warnings, review items, and safety flags without invoking the builder or
  enabling writes.

## 14. Risk Assessment

Adapter design mistaken for implementation:

- Mitigation: mark this document as design-only and require separate contract
  and implementation actions.

Adapter readiness mistaken for builder invocation approval:

- Mitigation: every adapter status must block builder invocation by default.

Bridge validation mistaken for builder validation:

- Mitigation: draft creation input must still pass builder/creation validation.

Candidate mistaken for persistence approval:

- Mitigation: builder output remains `safeToPersist: false`; persistence
  validator remains separate.

Field mapping drift:

- Mitigation: adapter contract types should name every source and target field.

Idempotency/fingerprint drift:

- Mitigation: preserve bridge, source evidence, broker result, handoff,
  finalization, and intended execution-record fingerprints separately.

Audit/correction metadata dropped:

- Mitigation: adapter output must carry audit/correction metadata even when the
  current builder input cannot directly consume it.

Generated types assumed available:

- Mitigation: generated types remain absent/unknown until separately generated
  and reviewed.

Migration assumed applied:

- Mitigation: migration application remains unproven until separately verified.

Supabase write path opened too early:

- Mitigation: adapter design must not alter persistence validator or insert
  route behavior.

Future UI overtrust:

- Mitigation: any future UI must label bridge, adapter, builder, creation, and
  persistence states separately.

## 15. Verification

Documentation-only verification required for Action 556:

- `git diff --check`

No runtime validation is required because Action 556 changes documentation only.

## 16. Action 557 Follow-Up - Adapter Contract Types Created

Action 557 created
`lib/execution-record-candidate-builder-integration-adapter-contract.ts`.

The new module defines TypeScript contract types/constants for a future adapter
that may shape validated bridge/integration metadata into a proposed
`ExecutionRecordCreationInput`. It includes adapter input/result/status,
decision recommendation, proposed input summary, field mapping summary,
precondition summary, schema readiness summary, idempotency summary,
audit/provenance summary, safety policy, blocked reasons, warnings, review
items, and status metadata.

This is not adapter implementation. It does not call
`buildExecutionRecordCandidate(...)`, create execution-record candidates, create
execution records, persist, append audit records, update stats/PnL, rollback,
mutate trades, wire UI, or run browser/Avanza/broker/order behavior.

Next recommended action:

**Action 558 - Reassess Execution Record Candidate Builder Integration Adapter Contract Types**

## 17. Action 558 Follow-Up - Adapter Contract Types Reassessed

Action 558 created
`docs/execution-record-candidate-builder-integration-adapter-contract-reassessment.md`.

The reassessment confirms the adapter contract remains
type-only/constants-only, contract-only, adapter-only, and proposed-input-only.
It does not implement adapter logic, call the candidate builder, create
execution-record candidates, create execution records, persist, append audit
records, update stats/PnL, rollback, mutate trades, wire UI, or run
browser/Avanza/broker/order behavior.

Next recommended action:

**Action 559 - Create Execution Record Candidate Builder Integration Adapter**

## 18. Action 559 Follow-Up - Pure Adapter Created

Action 559 created
`lib/execution-record-candidate-builder-integration-adapter.ts`.

The adapter implements the design as a pure proposed-input-shaping function:
`shapeExecutionRecordCandidateBuilderInput(...)`.

Implementation boundary:

- accepts adapter contract input metadata;
- reads integration, bridge, bridge validation, schema readiness, idempotency,
  audit/provenance, and proposed creation-input data;
- returns `ExecutionRecordCandidateBuilderIntegrationAdapterResult`;
- shapes and reports a proposed `ExecutionRecordCreationInput` only;
- reports field mappings, preconditions, schema readiness, idempotency,
  audit/provenance, blocked reasons, warnings, review items, and safety flags.

The adapter does not call `buildExecutionRecordCandidate(...)`, create
execution-record candidates, create execution records, persist, write
Supabase/localStorage, append audit, update stats/PnL, rollback/correct, mutate
trades, wire UI, automate browser/Avanza behavior, run broker behavior, or run
order behavior.

Focused sandbox coverage was added for ready shaping and blocked/review states.

Next recommended action:

**Action 560 - Reassess Execution Record Candidate Builder Integration Adapter**

## 19. Action 560 Follow-Up - Adapter Reassessed

Action 560 created
`docs/execution-record-candidate-builder-integration-adapter-reassessment.md`.

Design impact:

- Confirms the adapter design was implemented as proposed-input shaping only.
- Confirms the adapter remains pure, deterministic, adapter-only, and
  disconnected from builder invocation, candidate creation, record creation,
  persistence/write behavior, audit append, stats/PnL update, rollback,
  trade mutation, UI wiring, browser/Avanza behavior, broker behavior, and
  order behavior.
- Confirms generated types and migration proof remain schema readiness
  diagnostics, not write approval.

Next recommended action:

**Action 561 - Create Execution Record Candidate Builder Integration Validator Design**

## 20. Action 561 Follow-Up - Validator Design Created

Action 561 created
`docs/execution-record-candidate-builder-integration-validator-design.md`.

Adapter design impact:

- Defines the next validation-only boundary after adapter output.
- Keeps adapter output as proposed-input metadata only.
- Does not alter adapter implementation, builder behavior, persistence, audit,
  stats, rollback, trade state, UI, browser/Avanza, broker, or order behavior.

Next recommended action:

**Action 562 - Create Execution Record Candidate Builder Integration Validator Contract Types**

## 21. Action 562 Follow-Up - Validator Contract Types Created

Action 562 created
`lib/execution-record-candidate-builder-integration-validator-contract.ts`.

Adapter design impact:

- Adds a type-only validator contract surface for adapter output.
- Does not change adapter implementation or runtime behavior.
- Keeps builder invocation, candidate creation, record creation, persistence,
  audit append, stats/PnL update, rollback, trade mutation, UI, browser/Avanza,
  broker, and order behavior out of scope.

Next recommended action:

**Action 563 - Reassess Execution Record Candidate Builder Integration Validator Contract Types**

## 22. Action 563 Follow-Up - Validator Contract Types Reassessed

Action 563 created
`docs/execution-record-candidate-builder-integration-validator-contract-reassessment.md`.

Adapter design impact:

- Confirms validator contract types align with the adapter output boundary.
- Confirms adapter design remains proposed-input-only.
- Confirms no runtime adapter, builder, creation, persistence, audit, stats,
  rollback, trade, UI, browser/Avanza, broker, or order behavior changed.

Next recommended action:

**Action 564 - Create Execution Record Candidate Builder Integration Validator**

## 23. Action 564 Follow-Up - Validator Created

Action 564 created
`lib/execution-record-candidate-builder-integration-validator.ts`.

Adapter design impact:

- The adapter remains pure, deterministic, and proposed-input-only.
- The validator reads adapter output and reports validation diagnostics.
- The validator does not invoke the builder, create candidates, create records,
  persist, write, append audit, update stats/PnL, rollback, mutate trades, wire
  UI, automate browser/Avanza behavior, run broker behavior, or run order
  behavior.

Next recommended action:

**Action 565 - Reassess Execution Record Candidate Builder Integration Validator**

## 24. Action 565 Follow-Up - Validator Reassessed

Action 565 created
`docs/execution-record-candidate-builder-integration-validator-reassessment.md`.

Adapter design impact:

- The adapter remains pure and proposed-input-only.
- The validator reassessment keeps validation separate from builder invocation.
- No creation, persistence, audit append, stats/PnL update, rollback, trade
  mutation, UI, browser/Avanza, broker, or order behavior was added.

Next recommended action:

**Action 566 - Create Execution Record Candidate Builder Integration Dev Preview Design**

## 25. Action 566 Follow-Up - Dev Preview Design Created

Action 566 created
`docs/execution-record-candidate-builder-integration-dev-preview-design.md`.

Adapter design impact:

- Future preview should be dev-gated, read-only, controlled-fixture-first, and
  visually separate from bridge preview.
- Adapter output remains proposed-input-only and no-write.
- Builder invocation remains a separate future boundary.

Next recommended action:

**Action 567 - Create Execution Record Candidate Builder Integration Dev Preview**

## 26. Action 567 Follow-Up - Dev Preview Created

Action 567 implemented the dev preview envisioned by this adapter design.

Adapter design impact:

- The preview is dev-gated, read-only, fixture-only, and explicit-trigger-only.
- The preview is visually separate from the bridge preview but uses the same
  late-phase dev modal area.
- The preview consumes adapter output only as proposed input for future builder
  invocation and never invokes the builder.

Next recommended action:

**Action 568 - Reassess Execution Record Candidate Builder Integration Dev Preview**

## 27. Action 568 Follow-Up - Dev Preview Reassessed

Action 568 confirmed the implemented preview preserves this adapter design.

Adapter design impact:

- The preview remains dev-gated, read-only, fixture-only, and
  explicit-trigger-only.
- The adapter path remains proposed-input-only.
- Builder invocation remains the next design boundary.

Next recommended action:

**Action 569 - Create Execution Record Candidate Builder Invocation Design**

## 28. Action 569 Follow-Up - Invocation Design Created

Action 569 created the documentation-only builder invocation design.

Adapter design impact:

- Adapter output remains the only allowed input source for future invocation.
- Builder invocation remains separate from adapter implementation.
- Candidate output remains separate from persistence/write boundaries.

Next recommended action:

**Action 570 - Create Execution Record Candidate Builder Invocation Contract Types**

## 29. Action 570 Follow-Up - Invocation Contract Types Created

Action 570 added contract types for the future invocation boundary.

Adapter design impact:

- Adapter output remains the required input source for future invocation.
- Contract types remain separate from adapter behavior.
- Candidate output remains separate from persistence/write boundaries.

Next recommended action:

**Action 571 - Reassess Execution Record Candidate Builder Invocation Contract Types**

## 30. Action 571 Follow-Up - Invocation Contract Reassessed

Action 571 confirmed the invocation contract preserves the adapter design
boundary.

Adapter design impact:

- Adapter output remains a required input source.
- Invocation contract types remain no-write and unimplemented.

Next recommended action:

**Action 572 - Create Execution Record Candidate Builder Invocation Validator Design**

## 31. Action 572 Follow-Up - Invocation Validator Design Created

Action 572 documented future validation for the invocation boundary after the
adapter path.

Adapter design impact:

- Adapter output remains a required input source.
- No adapter runtime behavior changed.

Next recommended action:

**Action 573 - Create Execution Record Candidate Builder Invocation Validator Contract Types**

## Action 573 Follow-Up - Invocation Validator Contract Types Created

Action 573 added invocation validator contract types downstream of the adapter
and adapter-validator boundary.

Adapter design impact:

- Adapter remains input-shaping-only.
- Invocation validator contract types remain validation-only and do not execute
  adapter validation or builder invocation.
- No `buildExecutionRecordCandidate(...)` call, candidate/record creation,
  persistence/write behavior, audit append, stats/PnL update,
  rollback/correction, trade mutation, UI, Avanza/browser, broker, or order
  behavior was added.

Next recommended action:

**Action 574 - Reassess Execution Record Candidate Builder Invocation Validator Contract Types**

## Action 574 Follow-Up - Invocation Validator Contract Reassessed

Action 574 confirmed the invocation validator contract remains a future
validation-only boundary after adapter output.

Adapter design impact:

- Adapter remains pure and input-shaping-only.
- No validator implementation or builder invocation exists.
- No execution-record candidate/record creation, persistence/write behavior,
  audit append, stats/PnL update, rollback/correction, trade mutation, UI,
  browser/Avanza, broker, or order behavior was added.

Next recommended action:

**Action 575 - Create Execution Record Candidate Builder Invocation Validator**

## Action 575 Follow-Up - Invocation Validator Created

Action 575 implemented the pure invocation validator downstream of adapter
output.

Adapter design impact:

- Adapter remains pure and input-shaping-only.
- Invocation validator remains pure validation-only and no-write.
- No builder invocation, execution-record candidate/record creation,
  persistence/write behavior, audit append, stats/PnL update,
  rollback/correction, trade mutation, UI, browser/Avanza, broker, or order
  behavior was added.

Next recommended action:

**Action 576 - Reassess Execution Record Candidate Builder Invocation Validator**

## Action 576 Follow-Up - Invocation Validator Reassessed

Action 576 reassessed the invocation validator downstream of adapter output.

Adapter design impact:

- Adapter remains pure and input-shaping-only.
- Invocation validator remains pure validation-only and no-write.
- No builder invocation, execution-record candidate/record creation,
  persistence/write behavior, audit append, stats/PnL update,
  rollback/correction, trade mutation, UI, browser/Avanza, broker, or order
  behavior was added.

Next recommended action:

**Action 577 - Create Execution Record Candidate Builder Invocation Dev Preview Design**

## Action 577 Follow-Up - Invocation Dev Preview Design Created

Action 577 designed a future invocation preview downstream of adapter output.

Adapter design impact:

- Adapter remains pure and input-shaping-only.
- Future invocation preview remains read-only and no-write.
- No builder invocation, execution-record candidate/record creation,
  persistence/write behavior, audit append, stats/PnL update,
  rollback/correction, trade mutation, UI implementation, browser/Avanza,
  broker, or order behavior was added.

Next recommended action:

**Action 578 - Create Execution Record Candidate Builder Invocation Dev Preview**
