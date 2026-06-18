# Finalization-to-ExecutionRecord Bridge Mapper Design

## 1. Purpose

Define a future pure mapper between finalization pipeline outputs and
execution-record bridge/candidate outputs.

The future mapper would transform already-supplied finalization, settlement
note, dry-run, broker evidence, handoff, approval, and audit/correction
metadata into a candidate-only
`FinalizationToExecutionRecordBridgeResult` and a proposed execution-record
candidate input shape.

This is documentation/design only. It does not implement a mapper, bridge,
validator, execution-record creation path, finalization action,
persistence/write path, Supabase/localStorage write, audit append,
rollback/correction behavior, stats/PnL update, trade mutation, UI wiring,
capture/browser/Avanza behavior, broker behavior, order behavior, or
production runtime behavior.

## 2. Scope

Included:

- pure deterministic mapper design.
- candidate-only bridge result creation.
- field normalization rules.
- proposed execution-record candidate input shaping.
- idempotency metadata shaping.
- audit/correction metadata shaping.
- review/block reason propagation.
- safety policy preservation.

Excluded:

- mapper implementation.
- bridge implementation.
- bridge validator implementation.
- execution-record creation.
- execution-record persistence.
- Supabase writes.
- localStorage writes.
- audit append.
- stats/PnL update.
- rollback/correction execution.
- trade mutation.
- UI wiring.
- Avanza/browser/capture behavior.
- broker automation.
- order execution.

The mapper output must remain metadata only. It must not create an
`ExecutionRecordCandidate`, insert an execution record, persist anything,
append audit, update stats, mutate trades, or run broker/browser actions.

## 3. Mapper Inputs

Future mapper input should be
`FinalizationToExecutionRecordBridgeInput`.

Expected source data:

- finalization candidate.
- finalization validation result.
- finalization state transition validation result.
- finalization action validation result.
- finalization action dry-run result.
- final settlement note match.
- immediate broker readback evidence.
- broker execution result candidate metadata.
- broker payload/handoff metadata.
- manual approval context.
- audit/correction readiness metadata.
- existing execution-record candidate metadata, if present for duplicate or
  prior-attempt diagnostics.

The mapper should not fetch, capture, infer from live UI, call Avanza, call a
broker, read Supabase, read localStorage, or mutate source data. It should be a
deterministic transformation over supplied input only.

## 4. Mapper Outputs

The future mapper should output a
`FinalizationToExecutionRecordBridgeResult`.

Output blocks:

- source evidence summary.
- target execution-record summary.
- field mapping summary.
- idempotency summary.
- audit/correction summary.
- validation handoff summary.
- blocked reasons.
- warnings.
- review items.
- safety policy.

Output rules:

- `mappingOnly=true`.
- `candidateOnly=true`.
- `bridgeExecuted=false` until an implementation action explicitly changes the
  runtime semantics.
- `safeToCreateExecutionRecord=false`.
- `safeToPersist=false`.
- `safeToFinalize=false`.
- `safeToUpdateStats=false`.
- `safeToAppendAudit=false`.
- `safeToRollback=false`.
- `safeToMutateTrade=false`.
- `safeToRunBrokerAction=false`.
- `automaticModeAllowed=false`.

The proposed execution-record input shape may be represented as target summary
metadata, but it remains a candidate-builder input draft only.

## 5. Field Normalization Rules

Ticker/symbol normalization:

- Prefer matched final settlement note instrument identity when available.
- Cross-check against immediate readback, broker execution result candidate,
  finalization candidate, handoff metadata, and recommendation/position
  context.
- Preserve mismatches as review/block metadata.

Side normalization:

- Normalize broker side/action to `buy` or `sell`.
- Require consistency across final settlement note, immediate readback, broker
  execution candidate, and handoff expected action.
- Side mismatch blocks candidate-ready output.

Quantity normalization:

- Prefer official final settlement note quantity.
- Cross-check immediate readback and expected quantity.
- Partial fill or quantity mismatch routes to review unless a later partial
  fill policy explicitly permits it.

Price normalization:

- Prefer final settlement note execution price.
- Preserve source currency with the price.
- Cross-check immediate readback and dry-run proposed impact as diagnostics
  only.

Currency normalization:

- Prefer final settlement note currency.
- Cross-check instrument/recommendation and broker execution candidate
  currency.
- Missing or conflicting currency blocks write-capable downstream use.

Fee/commission normalization:

- Prefer official final settlement note commission/courtage fields.
- Preserve missing fee data as review metadata.
- Do not infer official fees from dry-run, preview, or local diagnostics.

FX normalization:

- Prefer official final settlement note FX data.
- Missing FX on cross-currency trades is review-gated.
- Derived FX values are diagnostics only until a later policy approves them.

Gross/net value normalization:

- Prefer final settlement note gross, consideration, total, and net values.
- Derived gross/net checks can be recorded as consistency diagnostics.
- Amount mismatch routes to review/block.

Execution timestamp normalization:

- Prefer final settlement note execution date/time.
- Broker readback timestamp may be retained as provenance, not official final
  timestamp, unless policy later allows a fallback.

Settlement/payment date normalization:

- Prefer official final settlement/payment dates from final note evidence.
- Missing or uncertain dates remain review metadata.

Final note/reference normalization:

- Normalize note/reference number into source evidence and idempotency
  metadata.
- Missing final note reference blocks candidate-ready output unless a later
  policy defines a stronger replacement identity.

Broker/source identifiers normalization:

- Preserve broker order id, confirmation id, broker reference, source evidence
  fingerprint, handoff payload fingerprint, capture id, request id, and final
  note match identity.
- Preview/dev/mock/local diagnostics identifiers must not be treated as
  production broker identifiers.

## 6. Mapping Rules

Finalization candidate mapping:

- Use finalization candidate settlement, fee, FX, match, warning, rejection,
  and provenance summaries as source metadata.
- Do not treat candidate readiness as write authority.

Final settlement note precedence:

- Official final settlement note values should confirm or override immediate
  readback values only in the mapper output draft.
- Overrides must be recorded in field mapping summaries.
- Conflicts should propagate review/block reasons instead of silently
  replacing source values.

Dry-run contribution:

- Use finalization action dry-run proposed execution-record impact to
  cross-check proposed candidate fingerprint, idempotency key, and candidate
  metadata when available.
- Do not treat `dry_run_ready` as bridge readiness or write approval.

Validation propagation:

- Propagate finalization validation, transition validation, action validation,
  dry-run warnings, blocked reasons, and review states.
- Unsupported or blocked upstream status should produce blocked/unsupported
  bridge status.

Manual approval representation:

- Preserve approval presence, approval reference, reviewer metadata, and scope.
- Manual approval remains review metadata only and not write authority.

Audit/correction representation:

- Preserve before/after state references, source evidence references, duplicate
  prevention references, correction strategy references, and rollback metadata
  references.
- Missing audit/correction metadata blocks write-capable downstream use.

## 7. Idempotency Rules

The mapper should shape idempotency metadata from:

- source evidence fingerprint.
- final note identity.
- final settlement note match identity.
- finalization candidate fingerprint.
- finalization validation identity.
- transition validation identity.
- action validation identity.
- action dry-run identity or proposed fingerprint when available.
- handoff payload fingerprint.
- broker execution result candidate fingerprint.
- broker order id, confirmation id, or reference.
- execution-record candidate fingerprint inputs.

Duplicate detection metadata:

- Include duplicate-check-required metadata in every result.
- Include existing execution-record candidate metadata if supplied.
- Route conflicting duplicate metadata to review/block.

Retry metadata:

- Repeated mapping over unchanged input should produce the same proposed
  fingerprint inputs.
- Changed quantity, price, currency, fee, FX, note reference, or association
  should require review.

Mismatch metadata:

- Preserve mismatch type and source.
- Do not downgrade mismatches into warnings when they affect identity,
  official amount, quantity, currency, fees, or FX.

## 8. Conservative Failure Behavior

Missing finalization candidate:

- Status should be `bridge_candidate_blocked`.
- Reason: `missing_finalization_candidate`.

Missing validation result:

- Status should be blocked or not ready.
- Reason: `missing_finalization_validation`.

Missing transition validation:

- Status should be blocked or not ready.
- Reason: `missing_transition_validation`.

Missing action validation:

- Status should be blocked or not ready.
- Reason: `missing_action_validation`.

Missing action dry-run:

- Status should be blocked or not ready.
- Reason: `missing_action_dry_run`.

Missing final settlement note match:

- Status should be blocked or not ready.
- Reason: `missing_final_settlement_note_match`.

Ambiguous match:

- Status should be `bridge_candidate_needs_review` or blocked when identity is
  unsafe.
- Reason: `ambiguous_final_settlement_note_match`.

Mismatched amount/quantity/currency/fees/FX:

- Status should be needs-review or blocked depending on severity.
- Reasons should preserve `mismatched_amount`, `mismatched_quantity`,
  `mismatched_currency`, `mismatched_fees`, or `mismatched_fx_rate`.

Missing idempotency fingerprint:

- Status should be blocked.
- Reason: `missing_idempotency_fingerprint`.

Missing audit/correction metadata:

- Status should be blocked for any future write-capable downstream path.
- Reason: `missing_audit_correction_metadata`.

Unsupported broker/source:

- Status should be `bridge_candidate_unsupported`.
- Reasons should preserve `unsupported_broker` or `unsupported_source`.

Manual approval missing:

- Status should be needs-review or blocked when manual approval is required.
- Reason: `manual_approval_missing`.

All failure outputs remain diagnostics only.

## 9. Safety Policy

The future mapper must be pure and deterministic.

Required safety posture:

- mapper output is candidate-only.
- mapper output is not execution-record creation approval.
- mapper output is not persistence approval.
- mapper output is not finalization approval.
- mapper output is not audit append approval.
- mapper output is not stats/PnL update approval.
- mapper output is not rollback/correction approval.
- mapper output is not trade mutation approval.
- all write/action authority remains false.
- automatic mode remains disabled.

The mapper must preserve or reuse
`FINALIZATION_TO_EXECUTION_RECORD_BRIDGE_DEFAULT_SAFETY_POLICY` unless a later
contract explicitly defines a stricter default.

## 10. Relationship to Execution-Record Candidate Builder

The mapper output may feed a future execution-record candidate builder input
path, but only after later implementation and validation work.

Rules:

- Mapper output is not an `ExecutionRecordCandidate`.
- Candidate builder remains independent.
- Creation validator remains independent.
- Persistence validator remains independent.
- Insert route remains separate.
- Production write path remains separate and future.
- `safeToCreateExecutionRecord=false` and `safeToPersist=false` remain
  expected mapper output flags.

The mapper must not bypass source classification, broker confirmation,
idempotency, duplicate, schema/RLS, or persistence gates.

## 11. Relationship to Dry-run/Dev Preview

Finalization action dry-run:

- Proposed execution-record impact can help shape mapper output.
- Proposed impact is descriptive-only.
- `dry_run_ready` does not imply bridge/write readiness.
- Dry-run warnings and blocked reasons should propagate.

Dev preview:

- A future dev preview may display bridge mapper output.
- Preview display must be read-only and dev-gated.
- Preview display must not expose record creation, persistence, audit,
  rollback, stats, trade mutation, broker, or Avanza actions.

## 12. Candidate Next Actions

A. Create Finalization-to-ExecutionRecord Bridge Mapper Contract

- Useful for specifying the mapper input/output policy before implementation
  if the current bridge contract is not sufficient for mapper-specific
  metadata.
- Lower implementation risk than mapper code.

B. Create Execution Record Finalization Bridge Validator Design

- Defines validation rules for bridge mapper output.
- Useful before write-capable integration, but mapper design is needed first.

C. Reassess Supabase Execution Records Migration/Application Status

- Important before persistence work.
- Should remain separate from mapper design and should not enable writes.

D. Create Provisional Trade State Design

- Useful later after bridge and validation boundaries are clearer.
- Should not be coupled to execution-record persistence.

## 13. Recommended Next Action

Recommended default:

**Action 539 - Create Finalization-to-ExecutionRecord Bridge Mapper**

Rationale:

- The bridge design, contract, reassessment, and mapper design now define the
  required pure mapping behavior.
- A future mapper implementation can remain pure/deterministic and candidate
  only.
- The mapper still must not create execution records, persist, append audit,
  update stats, rollback/correct, mutate trades, or wire UI/broker behavior.

## 14. Risk Assessment

Mapper mistaken for record creation:

- Risk: mapper output is treated as a persisted execution record.
- Control: mapper output must remain bridge result/candidate input metadata
  only.

Mapped candidate mistaken for persistence approval:

- Risk: candidate-shaped metadata is sent to a write route.
- Control: candidate builder, persistence validator, and insert route remain
  separate gates.

Final note override too aggressive:

- Risk: official note values silently replace conflicting readback/handoff
  values.
- Control: overrides require explicit field mapping summaries and review for
  conflicts.

Duplicate records:

- Risk: repeated mapping creates multiple downstream records.
- Control: idempotency and duplicate metadata must be stable and required.

Weak idempotency:

- Risk: missing fingerprints produce unstable candidate identity.
- Control: missing fingerprint blocks candidate-ready output.

Audit/correction missing:

- Risk: future records cannot be explained or corrected.
- Control: missing audit/correction metadata blocks write-capable downstream
  use.

Validation bypass:

- Risk: mapper output bypasses finalization or execution-record validators.
- Control: validation handoff summary must preserve validator statuses and
  candidate builder remains independent.

Stats/PnL coupling too early:

- Risk: mapper output updates official stats.
- Control: stats update remains out of scope and disabled.

Supabase write path opened too early:

- Risk: mapper implementation is used to justify persistence before schema and
  RLS readiness.
- Control: persistence remains a separate future boundary.

Future UI overtrust:

- Risk: a preview presents mapper output as operational state.
- Control: future UI must be dev-gated, read-only, and clearly labelled.

## 15. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, mapper
implementation, bridge implementation, validator implementation,
execution-record creation, finalization action implementation,
persistence/write behavior, Supabase/localStorage write, audit append,
rollback/correction behavior, stats/PnL update, trade mutation, UI wiring,
capture/browser/Avanza behavior, broker behavior, order behavior, or
production runtime behavior was added.

## Action 539 Follow-Up - Bridge Mapper Created

Action 539 created `lib/finalization-to-execution-record-bridge-mapper.ts`.

Mapper design impact:

- Implemented a pure deterministic
  `mapFinalizationToExecutionRecordBridge(...)` mapper.
- The mapper converts supplied bridge input metadata into a typed
  `FinalizationToExecutionRecordBridgeResult`.
- The mapper builds source evidence, target, field mapping, idempotency,
  audit/correction, and validation handoff summaries.
- The mapper handles ready, blocked, review-influenced, and unsupported paths
  conservatively.
- The mapper output remains mapping-only and candidate-only.
- Added no execution-record creation, persistence/write behavior,
  Supabase/localStorage write, audit append, stats/PnL update,
  rollback/correction, trade mutation, UI wiring, capture/browser/Avanza
  behavior, broker behavior, order behavior, or production runtime behavior.

Next recommended action:

**Action 540 - Reassess Finalization-to-ExecutionRecord Bridge Mapper**

## Action 540 Follow-Up - Bridge Mapper Reassessed

Action 540 created
`docs/finalization-to-execution-record-bridge-mapper-reassessment.md`.

Mapper design impact:

- Reassessed the implemented mapper against this design.
- Confirmed the mapper remains pure, deterministic, candidate-only, and
  mapping-only.
- Confirmed ready/review/blocked/unsupported paths remain conservative.
- Confirmed no execution-record creation, persistence/write behavior,
  Supabase/localStorage write, audit append, stats/PnL update,
  rollback/correction, trade mutation, UI wiring, browser/Avanza behavior,
  broker behavior, or order behavior was added.

Next recommended action:

**Action 541 - Create Execution Record Finalization Bridge Validator Design**

## Action 541 Follow-Up - Bridge Validator Design Created

Action 541 created
`docs/execution-record-finalization-bridge-validator-design.md`.

Mapper design impact:

- Defined how a future validator should inspect mapper output for completeness,
  consistency, idempotency, audit/correction readiness, and safety posture.
- Confirmed the validator design does not change the mapper and does not add
  execution-record creation, persistence/write behavior, audit append,
  stats/PnL update, rollback/correction, trade mutation, UI,
  browser/Avanza, broker, or order behavior.

Next recommended action:

**Action 542 - Create Execution Record Finalization Bridge Validator Contract Types**

## Action 542 Follow-Up - Validator Contract Types Created

Action 542 created
`lib/execution-record-finalization-bridge-validator-contract.ts`.

Mapper design impact:

- Added future validator contract types that can describe validation of mapper
  output without changing mapper behavior.
- Confirmed mapper output remains candidate-only and mapping-only.
- Added no validator implementation, execution-record creation,
  persistence/write behavior, audit append, stats/PnL update,
  rollback/correction, trade mutation, UI, browser/Avanza, broker, or order
  behavior.

Next recommended action:

**Action 543 - Reassess Execution Record Finalization Bridge Validator Contract Types**

## Action 543 Follow-Up - Validator Contract Reassessed

Action 543 created
`docs/execution-record-finalization-bridge-validator-contract-reassessment.md`.

Mapper design impact:

- Verified the validator contract remains downstream of mapper output.
- Confirmed the contract does not remap fields and does not change mapper
  behavior.
- Confirmed no runtime write, mutation, UI, browser/Avanza, broker, or order
  behavior was added.

Next recommended action:

**Action 544 - Create Execution Record Finalization Bridge Validator**

## Action 544 Follow-Up - Bridge Validator Created

Action 544 created
`lib/execution-record-finalization-bridge-validator.ts`.

Mapper design impact:

- Implemented a validation layer over mapper output without changing the
  mapper.
- The validator checks summaries, idempotency, audit/correction readiness,
  safety policy, and authority flags.
- Added no downstream builder, persistence, audit, stats/PnL, rollback,
  trade mutation, UI, browser/Avanza, broker, or order behavior.

Next recommended action:

**Action 545 - Reassess Execution Record Finalization Bridge Validator**

## Action 545 Follow-Up - Downstream Validator Reassessed

Action 545 created
`docs/execution-record-finalization-bridge-validator-reassessment.md`.

Mapper design impact:

- Confirmed the validator remains downstream of the mapper and does not remap
  fields.
- Confirmed the next safest design step is a read-only dev preview that shows
  bridge mapper output and validator output together.
- Confirmed no candidate builder integration, persistence, audit, stats/PnL,
  rollback/correction, trade mutation, UI, browser/Avanza, broker, or order
  behavior was added.

Next recommended action:

**Action 546 - Create Finalization-to-ExecutionRecord Bridge Dev Preview Design**

## Action 546 Follow-Up - Bridge Dev Preview Design Created

Action 546 created
`docs/finalization-to-execution-record-bridge-dev-preview-design.md`.

Mapper design impact:

- Recommended first placement near the late-phase Finalization Action Dry-run
  Preview as a separate `Execution Record Bridge Preview` section.
- Required controlled fixture data first and explicit read-only safety labels.
- Confirmed no mapper changes, UI implementation, writes, mutations,
  Avanza/browser behavior, broker behavior, or order behavior were added.

Next recommended action:

**Action 547 - Create Finalization-to-ExecutionRecord Bridge Dev Preview**

## Action 547 Follow-Up - Bridge Dev Preview Created

Action 547 implemented a dev-gated late-phase modal section labelled
`Execution Record Bridge Preview`.

Mapper design impact:

- The preview uses controlled fixture data and an explicit trigger.
- The preview shows mapper output next to validator output without changing the
  mapper.
- The preview includes required safety labels and no create/persist/finalize,
  audit, rollback, mutation, Avanza/browser, broker, or order controls.

Next recommended action:

**Action 548 - Reassess Finalization-to-ExecutionRecord Bridge Dev Preview**

## Action 548 Follow-Up - Bridge Dev Preview Reassessed

Action 548 created
`docs/finalization-to-execution-record-bridge-dev-preview-reassessment.md`.

Mapper design impact:

- Confirmed the preview remains fixture-only and explicit-trigger-only.
- Confirmed mapper status, source/target summaries, field mapping,
  idempotency, audit/correction, handoff, reasons, warnings, review items, and
  safety policy are displayed read-only.
- Confirmed no runtime behavior changed.

Next recommended action:

**Action 549 - Reassess Supabase Execution Records Migration/Application Status**
