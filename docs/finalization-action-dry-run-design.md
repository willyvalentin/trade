# Finalization Action Dry-run Design

## 1. Purpose

This document defines a future dry-run mode for finalization actions.

The dry-run should simulate and summarize what a finalization action would need
to do while guaranteeing that no writes, state transitions, finalization,
execution-record creation, stats/PnL updates, audit appends,
rollback/correction behavior, trade mutation, UI wiring, capture/browser/Avanza
behavior, or broker behavior occur.

## 2. Scope

Included:

- Dry-run simulation of a proposed finalization action.
- Validation result summary.
- Proposed write plan summary.
- Proposed stats/PnL update summary.
- Proposed audit/correction summary.
- Blocked/review status summaries.
- Descriptive impact summaries for future boundaries.

Excluded:

- Actual finalization.
- Persistence/write behavior.
- Execution-record creation.
- Stats/PnL update.
- Audit append.
- Rollback/correction execution.
- Trade mutation.
- UI implementation.
- Avanza/browser/capture behavior.
- Broker behavior.
- Order execution.
- Production runtime behavior.

## 3. Dry-run Inputs

A future dry-run input should include:

- Finalization action input.
- Finalization action validation result.
- Finalization candidate.
- Finalization validation result.
- Transition validation result.
- Transition result metadata if available.
- Execution-record candidate metadata if available.
- Persistence boundary metadata.
- Execution-record boundary metadata.
- Stats/PnL boundary metadata.
- Audit append boundary metadata.
- Correction/rollback boundary metadata.
- Trade mutation boundary metadata.
- Audit/correction metadata.
- Manual approval context.
- Source evidence references and candidate fingerprints.

The dry-run should consume the validator result, not replace the validator.
Missing validator output should block or return not-ready.

## 4. Dry-run Outputs

A future dry-run output should include:

- Dry-run status.
- Validation status summary.
- Proposed finalization state transition summary.
- Proposed execution-record impact summary.
- Proposed persistence impact summary.
- Proposed stats/PnL impact summary.
- Proposed audit/correction impact summary.
- Proposed trade mutation impact summary.
- Blocked reasons.
- Warnings.
- Safety policy.
- Manual approval summary.
- Boundary readiness summary.
- Evidence traceability summary.

All proposed impacts are descriptive only. A dry-run output must not be treated
as write authority.

## 5. Dry-run Status Values

Future status values should include:

- `dry_run_ready`
- `dry_run_needs_review`
- `dry_run_blocked`
- `dry_run_unsupported`
- `dry_run_not_ready`

`dry_run_ready` means the proposed action can be described. It does not mean
the action can run.

## 6. Proposed Impact Summaries

The dry-run may describe what would be finalized:

- Candidate identifier.
- Proposed source/target state.
- Finalization validation status.
- Transition validation status.
- Required manual approval references.

The dry-run may describe what would be persisted:

- Target table or storage boundary name.
- Proposed record identity/fingerprint.
- Required idempotency key.
- Required write boundary and policy status.

The dry-run may describe what execution record would be created or updated:

- Execution-record candidate identifier.
- Broker result linkage.
- Recommendation/position/trade association.
- Duplicate-prevention inputs.
- Required schema and RLS context.

The dry-run may describe what stats/PnL values would be adjusted:

- Quantity/price/fee/FX basis.
- Realized PnL preview.
- Position lifecycle impact.
- Review blockers for missing fee/FX/settlement data.

The dry-run may describe what audit events would be appended:

- Source evidence references.
- Before/after state references.
- Manual approval reference.
- Candidate/validator/dry-run fingerprints.
- Write attempt trace placeholders.

The dry-run may describe what correction/rollback metadata would be required:

- Correction strategy reference.
- Rollback/amendment path reference.
- Duplicate correction prevention.
- Correction audit trail requirements.

Trade mutation impact:

- Must always be `none` or `out_of_scope`.
- Trade mutation remains outside dry-run scope.
- Any future trade mutation requires a separate explicit design,
  implementation, reassessment, and safety review.

All proposed impacts are descriptive only and must not invoke any boundary.

## 7. Safety Policy

The dry-run safety policy must require:

- `dryRunOnly=true`
- `safeToRunFinalizationAction=false`
- `safeToFinalize=false`
- `safeToPersist=false`
- `safeToCreateExecutionRecord=false`
- `safeToUpdateStats=false`
- `safeToAppendAudit=false`
- `safeToRollback=false`
- `safeToMutateTrade=false`
- `automaticModeAllowed=false`

Additional required flags:

- `finalizationActionAttempted=false`
- `finalizationAttempted=false`
- `persistenceAttempted=false`
- `executionRecordCreationAttempted=false`
- `statsUpdateAttempted=false`
- `auditAppendAttempted=false`
- `rollbackAttempted=false`
- `tradeMutationAttempted=false`
- `browserAutomationAttempted=false`
- `avanzaAutomationAttempted=false`
- `brokerAutomationAttempted=false`

## 8. Review/Block Behavior

Missing validation blocks:

- Missing finalization action validation result should return
  `dry_run_blocked` or `dry_run_not_ready`.

Missing candidate blocks:

- Missing finalization candidate should return `dry_run_blocked`.

Missing boundary metadata blocks or reviews:

- Missing persistence, execution-record, stats/PnL, audit append,
  correction/rollback, or trade mutation boundary metadata should block or
  route to review conservatively.

Audit/correction missing blocks or reviews:

- Missing source evidence traceability, before/after state references,
  manual approval traceability, duplicate prevention, audit strategy, or
  correction strategy should block or route to review conservatively.

Manual approval missing blocks or reviews:

- Missing manual approval should not permit dry-run readiness unless policy
  explicitly says approval is not required.
- Manual approval is not write authority.

Unsafe authority flags block:

- Any unexpected true authority, write, mutation, attempted-operation, or
  automatic-mode flag should block the dry-run.

Unsupported source/broker blocks:

- Unsupported source or broker metadata should return `dry_run_unsupported`.

## 9. Relationship To Finalization Action Validator

The dry-run consumes the validator result.

The dry-run does not replace the validator.

The dry-run does not execute the action.

Validator passing does not imply write authority.

`action_candidate_valid` can allow a descriptive dry-run to be prepared, but it
must not allow finalization action execution, persistence, execution-record
creation, stats/PnL updates, audit append, rollback/correction behavior, trade
mutation, UI commands, browser/Avanza behavior, or broker behavior.

## 10. Relationship To Execution Records/Persistence/Stats/Audit

The dry-run may describe intended impacts.

The dry-run does not call execution-record creation.

The dry-run does not persist.

The dry-run does not update stats.

The dry-run does not append audit.

The dry-run does not rollback/correct.

The dry-run does not mutate trades.

Execution-record creation, persistence, stats/PnL updates, audit append,
rollback/correction behavior, and trade mutation remain separate future
boundaries requiring explicit design and approval.

## 11. Relationship To UI

A future dev preview may show dry-run results.

Production UI must be separately designed.

This action adds no UI implementation.

No `Finalize` button should be introduced unless a separate explicit approved
action exists.

Any future UI must clearly label dry-run output as preview/diagnostic metadata,
not action execution authority.

## 12. Candidate Next Actions

A. Create Finalization Action Dry-run Contract Types

- Define dry-run input/result/status/impact summary types.
- Keep dry-run output descriptive and non-writing.

B. Create Finalization Action Dry-run

- Implement a pure dry-run only after contract types exist.
- Keep all action/finalization/write/mutation flags false.

C. Create Finalization Action Dev Preview Design

- Design a developer-only preview surface for dry-run output.
- Keep UI separate from action execution authority.

D. Create Execution Record Integration Reassessment

- Reassess execution-record metadata relationships before any integration.
- Keep execution-record creation disabled.

## 13. Recommended Next Action

Recommended default:

**Action 527 - Create Finalization Action Dry-run Contract Types**

Rationale:

- The dry-run design now defines the boundary.
- Contract types are the safest next step before implementation.
- They can model status, proposed impacts, blocked/review states, warnings, and
  false safety flags without adding runtime behavior.

## 14. Risk Assessment

Dry-run mistaken for action execution:

- Risk: dry-run output is treated as an executed action.
- Control: dry-run policy must keep all action/finalization flags false.

Proposed impact mistaken for write:

- Risk: proposed persistence/record/stats/audit impact is treated as completed
  write behavior.
- Control: all proposed impacts are descriptive only.

User approval overtrusted:

- Risk: approval metadata is treated as write authority.
- Control: approval may satisfy review context only.

Audit append assumed:

- Risk: proposed audit events are treated as appended audit records.
- Control: `safeToAppendAudit=false` and `auditAppendAttempted=false`.

Execution-record creation assumed:

- Risk: proposed execution-record impact is treated as record creation.
- Control: `safeToCreateExecutionRecord=false` and
  `executionRecordCreationAttempted=false`.

Stats/PnL update assumed:

- Risk: proposed PnL impact is treated as updated realized stats.
- Control: `safeToUpdateStats=false` and `statsUpdateAttempted=false`.

Persistence/trade mutation coupling too early:

- Risk: dry-run implementation couples directly to writes or trade mutation.
- Control: dry-run must not import or invoke write/mutation paths.

Future UI overtrust:

- Risk: UI presents dry-run output as a command or final state.
- Control: UI must remain separately designed and label output as preview only.

## 15. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, dry-run
implementation, finalization action implementation, finalization
implementation, transition application, persistence/write behavior,
Supabase/localStorage write, audit append, rollback/correction behavior,
execution-record creation, stats/PnL update, trade mutation, UI wiring,
capture/browser/Avanza behavior, broker behavior, or production runtime
behavior was added.

## Action 527 Follow-Up - Finalization Action Dry-run Contract Types Created

Action 527 created `lib/finalization-action-dry-run-contract.ts`.

Design relationship:

- The contract types implement the Action 526 dry-run design shape.
- The module models dry-run input, result, status, proposed impact summaries,
  blocked reasons, warnings, safety policy, validation summary, and status
  metadata.
- The contract is type-only/constants-only and does not implement dry-run logic.
- Proposed finalization, persistence, execution-record, stats/PnL, audit,
  correction, rollback, and trade mutation impacts remain descriptive only.
- `dryRunOnly=true`; all action/finalization/write/mutation safety flags remain
  false.

Next recommended action:

**Action 528 - Reassess Finalization Action Dry-run Contract Types**

## Action 528 Follow-Up - Finalization Action Dry-run Contract Reassessed

Action 528 created
`docs/finalization-action-dry-run-contract-reassessment.md`.

Design relationship:

- The reassessment verifies that
  `lib/finalization-action-dry-run-contract.ts` matches the Action 526 dry-run
  design.
- The contract remains type-only/constants-only.
- It models dry-run input/result/status, validation summary, proposed impact
  summaries, blocked reasons, warnings, safety policy, and status metadata.
- Proposed impacts remain descriptive only.
- No dry-run implementation or write behavior was added.

Next recommended action:

**Action 529 - Create Finalization Action Dry-run**

## Action 529 Follow-Up - Finalization Action Dry-run Created

Action 529 created `lib/finalization-action-dry-run.ts`.

Design relationship:

- The implementation follows the Action 526 design by consuming action
  validator, candidate, transition, boundary, approval, audit, and correction
  metadata.
- It produces proposed impact summaries only.
- It maps ready, review, blocked, unsupported, and not-ready validation states
  conservatively.
- It does not run a finalization action and does not apply any transition.
- It does not finalize, persist, create execution records, update stats/PnL,
  append audit, rollback/correct, mutate trades, wire UI, capture browser
  state, automate Avanza, call brokers, or add production runtime behavior.
- All safety and attempted flags remain false; `dryRunOnly=true`.

Next recommended action:

**Action 530 - Reassess Finalization Action Dry-run**

## Action 530 Follow-Up - Finalization Action Dry-run Reassessed

Action 530 created `docs/finalization-action-dry-run-reassessment.md`.

Design relationship:

- Verified the implementation follows the dry-run design as a read-only
  metadata summarizer.
- Verified ready, blocked, needs-review, unsupported, missing-candidate, and
  missing-transition paths remain conservative.
- Verified proposed impact summaries remain descriptive only.
- Verified no action execution, finalization, persistence, execution-record
  creation, stats/PnL update, audit append, rollback/correction, trade
  mutation, UI, capture/browser/Avanza, broker, or order behavior was added.

Next recommended action:

**Action 531 - Create Finalization Action Dev Preview Design**

## Action 531 Follow-Up - Finalization Action Dev Preview Design Created

Action 531 created `docs/finalization-action-dev-preview-design.md`.

Design relationship:

- The dev preview design is downstream of the dry-run design and dry-run
  implementation.
- It defines a read-only display for dry-run status, validation summary,
  proposed impacts, warnings, blocked reasons, safety policy, and status
  metadata.
- It keeps interaction limited to a future explicit preview trigger.
- It excludes action execution, finalization, persistence, execution-record
  creation, stats/PnL update, audit append, rollback/correction, trade
  mutation, capture/browser/Avanza behavior, broker behavior, order behavior,
  and production UI.

Next recommended action:

**Action 532 - Create Finalization Action Dev Preview**

## Action 532 Follow-Up - Finalization Action Dev Preview Created

Action 532 implemented the future preview surface described by the dry-run
design trail.

Design relationship:

- The preview is dev-gated, fixture-only, explicit-trigger-only, and read-only.
- It calls the pure action validator and pure dry-run path through controlled
  fixture data.
- It does not run a finalization action.
- It does not finalize, persist, create execution records, update stats/PnL,
  append audit, rollback/correct, mutate trades, drive browser/Avanza behavior,
  call brokers, or execute orders.

Next recommended action:

**Action 533 - Reassess Finalization Action Dev Preview**

## Action 533 Follow-Up - Finalization Action Dev Preview Reassessed

Action 533 created `docs/finalization-action-dev-preview-reassessment.md`.

Design relationship:

- Verified the preview remains a read-only display for dry-run output.
- Verified it uses controlled fixture input and an explicit trigger.
- Verified it does not run a finalization action or invoke any write/mutation
  boundary.
- Verified dry-run display sections and safety labels align with the dry-run
  design.

Next recommended action:

**Action 534 - Create Execution Record Integration Reassessment**
