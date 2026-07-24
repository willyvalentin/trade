# Finalization-to-ExecutionRecord Bridge Dev Preview Design

## 1. Purpose

This document designs a future dev-gated, read-only preview for the
Finalization-to-ExecutionRecord bridge.

The preview would let developers inspect bridge mapper output from
`mapFinalizationToExecutionRecordBridge(...)` alongside bridge validator output
from `validateExecutionRecordFinalizationBridge(...)` before any execution-record
candidate builder, persistence validator, insert route, or production write
boundary consumes the data.

This is documentation-only. It does not implement UI, change runtime behavior,
change the mapper, change the validator, integrate the execution-record
candidate builder, create execution records, persist data, write Supabase or
localStorage, append audit records, update stats/PnL, roll back or correct
records, mutate trades, capture browser/Avanza state, send broker actions, run
order execution, or enable production behavior.

## 2. Scope

Included:

- Dev-gated bridge preview design.
- Read-only visualization design.
- Controlled fixture data first.
- Explicit trigger design.
- Bridge mapper result display.
- Bridge validator result display.
- Safety labels and authority flag display.
- Placement recommendation.
- State display rules.
- Relationship to finalization action dry-run preview.
- Relationship to future execution-record candidate builder work.

Excluded:

- Implementation.
- UI implementation.
- Production UI.
- Execution-record creation.
- Persistence.
- Supabase writes.
- LocalStorage writes.
- Audit append.
- Stats/PnL update.
- Rollback/correction execution.
- Trade mutation.
- Avanza/browser/capture behavior.
- Broker behavior.
- Order execution.

## 3. Placement Options

Option 1: Late-phase execution handoff modal near Finalization Action Dry-run
Preview.

- Pros: closest to the finalization action context, dry-run result, candidate
  evidence, manual approval context, and existing late-phase execution QA flow.
- Pros: keeps bridge preview near the source data that would feed the mapper.
- Pros: can visually reinforce that dry-run impact, bridge mapper output, and
  validator output are all pre-write diagnostics.
- Cons: risks making the handoff modal dense unless the preview is collapsed by
  default and clearly dev-gated.

Option 2: Separate diagnostics/dev panel.

- Pros: lower risk of confusing the preview with execution controls.
- Pros: suitable for broad debugging and comparing multiple fixtures.
- Cons: farther from the finalization action context and may require more
  navigation during manual QA.

Option 3: Execution-record diagnostics area if one exists later.

- Pros: natural home once execution-record diagnostics are implemented.
- Cons: premature before execution-record candidate builder and persistence
  boundaries exist.

Recommended first placement:

- Add a dev-gated late-phase modal section near the Finalization Action Dry-run
  Preview.
- Label the section `Execution Record Bridge Preview`.
- Keep it visually separate, collapsed by default, and explicitly marked as a
  read-only preview.
- Do not add production controls or write buttons.

## 4. Data Dependencies

Initial data dependency policy:

- Controlled fixture data first.
- Use a bridge input fixture derived from the existing finalization/dry-run
  fixture path.
- Use pure `mapFinalizationToExecutionRecordBridge(...)`.
- Use pure `validateExecutionRecordFinalizationBridge(...)`.
- Do not call live Avanza data.
- Do not fetch browser/capture evidence.
- Do not call broker systems.
- Do not write Supabase.
- Do not write localStorage.
- Do not append audit.
- Do not create execution records.
- Do not update stats/PnL.
- Do not roll back or correct records.
- Do not mutate trade state.

The future implementation should treat all preview data as derived display
metadata. It should not reserve identifiers, perform duplicate checks against a
write store, allocate an execution-record row, or mark any finalization state as
complete.

## 5. Preview Content

Bridge mapper result display:

- Bridge mapper status.
- Bridge source evidence summary.
- Bridge target execution-record summary.
- Bridge field mapping summary.
- Bridge idempotency summary.
- Bridge audit/correction summary.
- Bridge validation handoff summary.
- Bridge blocked reasons.
- Bridge warnings.
- Bridge review items.
- Bridge safety policy.

Bridge validator result display:

- Bridge validator status.
- Bridge validator decision recommendation.
- Validated field summary.
- Idempotency validation summary.
- Audit/correction validation summary.
- Safety policy validation summary.
- Validator blocked reasons.
- Validator warnings.
- Validator review items.
- Validator authority flags.

Suggested visual grouping:

- Status strip: mapper status, validator status, decision recommendation, and
  safety labels.
- Source and target: source evidence summary and target execution-record
  summary.
- Mapping review: field mapping summary and validated field summary.
- Safety review: idempotency, audit/correction, validation handoff, safety
  policy, and authority flags.
- Reasons: blocked reasons, warnings, and review items from both mapper and
  validator.

## 6. Safety Labels

The preview must show explicit visible labels:

- Dev preview only.
- Bridge preview only.
- Candidate-only.
- Mapping-only.
- Validation-only.
- Not execution-record creation.
- Not persistence approval.
- Not finalization approval.
- Not audit append approval.
- Not stats/PnL update approval.
- Not rollback/correction approval.
- Does not mutate trade state.
- Does not send to broker.
- No Avanza/browser action.
- Automatic mode disabled.
- `safeToCreateExecutionRecord=false`.
- `safeToPersist=false`.
- `safeToFinalize=false`.
- `safeToUpdateStats=false`.
- `safeToAppendAudit=false`.
- `safeToRollback=false`.
- `safeToMutateTrade=false`.
- `safeToRunBrokerAction=false`.

These labels should be visible even when the mapper status is
`bridge_candidate_ready` or the validator status is `bridge_validation_valid`.

## 7. Interaction Model

Future interaction model:

- Read-only panel.
- Dev-gated.
- Collapsible by default.
- Explicit `Run execution-record bridge preview` trigger if implemented later.
- Trigger runs only fixture-derived mapping and validation.
- No `Create execution record` action.
- No persist action.
- No finalize action.
- No stats update action.
- No audit append action.
- No rollback/correction action.
- No trade mutation action.
- No Avanza/browser action.
- No broker send.
- No production write button.

If a future trigger is added, it must be labelled as preview-only and should
return derived display data only. It should not alter finalization, execution,
trade, broker, audit, stats, or persistence state.

## 8. State Display Rules

Bridge mapper states:

- `bridge_candidate_ready`: show as candidate-ready only, not write-ready.
- `bridge_candidate_needs_review`: show review state and review items.
- `bridge_candidate_blocked`: show blocked state and blocked reasons.
- `bridge_candidate_unsupported`: show unsupported state and unsupported
  reasons.
- `bridge_candidate_not_ready`: show not-ready state and missing prerequisites.

Bridge validator states:

- `bridge_validation_valid`: show validation-valid only, not write approval.
- `bridge_validation_needs_review`: show review state and review items.
- `bridge_validation_blocked`: show blocked state and blocked reasons.
- `bridge_validation_unsupported`: show unsupported state and unsupported
  reasons.
- `bridge_validation_invalid`: show invalid state and invalid reasons.

Display rules:

- Never use `ready`, `valid`, or success styling without adjacent safety labels.
- Never present mapper or validator status as permission to create, persist,
  finalize, append audit, update stats, roll back, mutate trades, send to
  broker, or automate Avanza/browser behavior.
- Show blocked reasons, warnings, review items, and authority flags even for
  ready/valid fixture output.

## 9. Relationship to Execution-Record Candidate Builder

The bridge dev preview does not call the execution-record candidate builder.

Future relationship:

- Bridge output may later feed a candidate builder only after a separate
  approved integration design.
- The candidate builder remains a separate future boundary.
- The persistence validator remains separate.
- The insert route remains separate.
- The production write path remains separate and future.

The preview should make this separation visible so users do not infer that a
candidate builder, persistence validator, insert route, or execution-record row
already exists behind the preview.

## 10. Relationship to Finalization Action Dry-run Preview

The bridge preview can consume fixture data derived from the finalization action
dry-run fixture.

Rules:

- Dry-run proposed execution-record impact is descriptive only.
- `dry_run_ready` does not imply bridge write readiness.
- `bridge_candidate_ready` does not imply execution-record creation.
- `bridge_validation_valid` does not imply execution-record creation.
- Dry-run data, bridge mapper output, and bridge validator output should all be
  labelled as pre-write diagnostics.

The preview should sit near the dry-run preview only because that is the most
useful manual QA context, not because it grants new execution authority.

## 11. Candidate Next Actions

Ranked next actions:

A. Create Finalization-to-ExecutionRecord Bridge Dev Preview

- Implement the read-only dev-gated preview described here.
- Use controlled fixture data first.
- Keep the panel collapsed, labelled, and write-disabled.

B. Reassess Supabase Execution Records Migration/Application Status

- Verify migration/application status before any persistence or insert-route
  work.
- Keep this separate from preview implementation.

C. Create Execution Record Candidate Builder Integration Design

- Define how bridge validator output may safely feed a candidate builder later.
- Keep builder work separate from preview implementation.

D. Create Provisional Trade State Design

- Define later user-visible trade state semantics after bridge preview and
  candidate builder boundaries are clearer.

## 12. Recommended Next Action

**Action 547 - Create Finalization-to-ExecutionRecord Bridge Dev Preview**

Rationale:

- The mapper and validator now exist and have been reassessed.
- A read-only dev preview is the safest next step because it improves manual QA
  visibility without adding persistence, creation, finalization, audit, stats,
  rollback, trade mutation, Avanza/browser, broker, or order behavior.

## 13. Risk Assessment

Risks:

- Bridge preview mistaken for execution-record creation.
- `bridge_candidate_ready` overtrusted.
- `bridge_validation_valid` overtrusted.
- Candidate output mistaken for persistence approval.
- Duplicate record risk hidden behind friendly fixture output.
- Audit/correction readiness assumed instead of verified.
- Stats/PnL update assumed.
- Future UI overtrust if labels are weak.
- Supabase write path opened too early.

Mitigations:

- Keep the preview dev-gated and collapsed by default.
- Use controlled fixture data first.
- Show safety labels and false authority flags prominently.
- Avoid production write buttons.
- Keep candidate builder, persistence validator, insert route, and production
  write path as separate future boundaries.
- Require Supabase migration/application reassessment before persistence work.

## 14. Verification

Documentation-only verification required for this action:

- `git diff --check`

No runtime validation is required because this action creates design
documentation only.

## Action 547 Follow-Up - Bridge Dev Preview Created

Action 547 created the read-only dev preview described by this design:

- `components/execution/FinalizationExecutionRecordBridgePreview.tsx`
- `lib/finalization-execution-record-bridge-dev-fixture.ts`

Implementation summary:

- Added a dev-gated late-phase modal section labelled
  `Execution Record Bridge Preview`.
- Added explicit trigger:
  `Run execution-record bridge preview`.
- Uses controlled fixture data only.
- Calls pure `mapFinalizationToExecutionRecordBridge(...)`.
- Calls pure `validateExecutionRecordFinalizationBridge(...)`.
- Displays bridge mapper status, summaries, reasons, warnings, review items,
  and safety policy.
- Displays bridge validator status, decision recommendation, summaries,
  reasons, warnings, review items, and authority flags.
- Shows explicit safety labels and false authority flags.

Safety result:

- No execution-record candidate builder integration.
- No execution-record creation.
- No persistence/write behavior.
- No Supabase/localStorage writes.
- No audit append.
- No rollback/correction behavior.
- No stats/PnL update.
- No trade mutation.
- No live Avanza data.
- No capture/browser/Avanza behavior.
- No broker/order behavior.
- No production runtime behavior.

Next recommended action:

**Action 548 - Reassess Finalization-to-ExecutionRecord Bridge Dev Preview**

## Action 548 Follow-Up - Bridge Dev Preview Reassessed

Action 548 created
`docs/finalization-to-execution-record-bridge-dev-preview-reassessment.md`.

Design reassessment impact:

- Confirmed the implemented preview follows this design's dev-gated,
  fixture-only, read-only, explicit-trigger-only boundary.
- Confirmed the preview uses pure mapper and pure validator output only.
- Confirmed safety labels, forbidden-action absence, mapper display, validator
  display, and false authority semantics remain intact.
- Confirmed no runtime code changes were made for Action 548.

Next recommended action:

**Action 549 - Reassess Supabase Execution Records Migration/Application Status**
