# Finalization Action Dev Preview Design

## 1. Purpose

Define how a future Finalization Action dry-run result can be previewed safely
in development mode.

The preview should visualize `runFinalizationActionDryRun(...)` output and its
proposed impacts while clearly showing that no action is executed and no
writes, finalization, persistence, execution-record creation, stats/PnL update,
audit append, rollback/correction, trade mutation, browser/Avanza behavior,
broker behavior, or order execution happens.

This is a documentation/design artifact only. It does not implement a preview,
wire UI, change dry-run behavior, create routes, add persistence, or add any
runtime behavior.

## 2. Scope

Included:

- Dev-gated finalization action dry-run preview.
- Read-only visualization of dry-run output.
- Dry-run status display.
- Proposed impact display.
- Validation summary display.
- Safety labels.
- Explicit disabled/non-authoritative presentation language.
- Future implementation guidance for a controlled fixture or explicit trigger.

Excluded:

- Implementation.
- Action execution.
- Finalization.
- Persistence.
- Execution-record creation.
- Stats/PnL update.
- Audit append.
- Rollback/correction.
- Trade mutation.
- Capture/browser/Avanza behavior.
- Broker/order behavior.
- Production UI.

## 3. Placement Options

Existing execution handoff modal late-phase dev area:

- Pros: already hosts late-phase execution diagnostics and dev-only preview
  surfaces.
- Pros: can share the execution dev tools gate.
- Pros: keeps action dry-run preview close to the handoff flow where final
  evidence is reviewed.
- Cons: modal density can grow if every future boundary is shown at once.

Near finalization candidate preview:

- Pros: clear lineage from final settlement note match preview to finalization
  candidate preview to finalization validation/action dry-run preview.
- Pros: helps reviewers compare candidate metadata with dry-run proposed
  impacts.
- Cons: must be visually separated so the dry-run is not mistaken for candidate
  approval.

Separate diagnostics/dev panel:

- Pros: keeps operational modal uncluttered.
- Pros: can become a broader finalization diagnostics hub later.
- Cons: weaker locality with the candidate and handoff evidence.
- Cons: higher navigation cost during manual QA.

Recommended first placement:

- Dev-gated late-phase section near the finalization candidate preview.
- Visually separate panel labelled **Finalization Action Dry-run Preview**.
- Keep it collapsible and behind the existing execution dev tools gate.
- Do not place it near broker/order action controls.

## 4. Data Dependencies

Initial data source:

- Controlled fixture or explicit trigger first.
- No automatic live evaluation on render.
- No live Avanza data.
- No broker fetches.
- No production data mutation.

Future preview input path:

- Pure finalization action dry-run fixture/input.
- `validateFinalizationAction(...)`.
- `runFinalizationActionDryRun(...)`.
- Existing candidate, validation, transition, boundary, approval, audit, and
  correction metadata supplied as explicit preview input.

Forbidden dependencies:

- No Supabase writes.
- No localStorage writes.
- No audit append.
- No execution-record creation.
- No stats/PnL update.
- No rollback/correction.
- No trade mutation.
- No Avanza/browser automation.
- No broker/order calls.

## 5. Preview Content

Dry-run status:

- Show `status`.
- Show status metadata reason when available.
- Use copy that says ready means ready-to-preview, not ready-to-execute.

Validation summary:

- `validationResultPresent`.
- `validationStatus`.
- `finalizationValidationStatus`.
- `transitionValidationStatus`.
- `actionCandidateValid`.
- `requiresManualReview`.
- Metadata for candidate and transition presence.

Proposed finalization impact:

- Candidate id.
- Current state.
- Proposed target state.
- Transition result reference if present.
- `finalizationWouldBeMarkedComplete`.
- `finalizationAttempted=false`.
- Explicit label: not finalization approval.

Proposed execution-record impact:

- Execution-record candidate presence.
- Proposed record fingerprint.
- Proposed idempotency key.
- `wouldCreateExecutionRecord`.
- `wouldUpdateExecutionRecord`.
- `executionRecordCreationAttempted=false`.
- Explicit label: not execution-record creation approval.

Proposed persistence impact:

- Target boundary.
- Proposed storage target.
- Proposed record fingerprint.
- `wouldPersist`.
- `persistenceAttempted=false`.
- Explicit label: not persistence approval.

Proposed stats/PnL impact:

- Quantity.
- Execution price.
- Fees.
- FX rate.
- Realized PnL.
- Currency.
- `wouldUpdateStats`.
- `statsUpdateAttempted=false`.
- Explicit label: not stats/PnL update approval.

Proposed audit impact:

- Audit context.
- Proposed audit event types.
- Source evidence references.
- Before/after state references.
- Manual approval reference.
- `wouldAppendAudit`.
- `auditAppendAttempted=false`.
- Explicit label: not audit append approval.

Proposed correction/rollback impact:

- Correction strategy reference.
- Rollback or amendment path reference.
- Duplicate correction prevention reference.
- Correction audit trail reference.
- `wouldRollback=false`.
- `wouldCorrect`.
- `rollbackAttempted=false`.
- Explicit label: not rollback/correction approval.

Proposed trade mutation impact:

- Always none/out-of-scope.
- `proposed=false`.
- `wouldMutateTrade=false`.
- `tradeMutationAttempted=false`.
- Explicit label: does not mutate trade state.

Blocked reasons:

- Show all dry-run blocked reasons.
- Group missing metadata separately from unsafe authority/coupling reasons if
  useful.

Warnings:

- Show all warnings.
- Always include dry-run-only/proposed-impact-not-write warnings when present.

Safety policy:

- Show the default safety policy as a compact flag list.
- Highlight false authority flags rather than hiding them.

Status metadata:

- Show status reason text from the dry-run contract metadata when available.
- Status metadata should reinforce that every dry-run status blocks writes.

## 6. Safety Labels

The preview must visibly display these labels:

- Dev preview only.
- Dry-run only.
- Proposed impact only.
- Not action execution.
- Not finalization approval.
- Not persistence approval.
- Not execution record approval.
- Not stats/PnL update approval.
- Not audit append approval.
- Not rollback/correction approval.
- Does not mutate trade state.
- `dryRunOnly=true`.
- `safeToRunFinalizationAction=false`.
- `safeToFinalize=false`.
- `safeToPersist=false`.
- `safeToCreateExecutionRecord=false`.
- `safeToUpdateStats=false`.
- `safeToAppendAudit=false`.
- `safeToRollback=false`.
- `safeToMutateTrade=false`.
- Automatic mode disabled.

## 7. Interaction Model

Read-only panel:

- The panel should display dry-run output only.
- No edits to dry-run payload or action metadata.
- No write, mutation, or broker controls.

Collapsible/dev-gated:

- Render only when execution dev tools are enabled.
- Default collapsed if modal density becomes high.
- Preserve a clear visual boundary from operational handoff content.

Future explicit trigger:

- If implemented later, use an explicit
  `Run finalization action dry-run preview` trigger.
- The trigger should produce preview state only.
- The trigger must not run a finalization action.
- The trigger must not finalize.
- The trigger must not persist.
- The trigger must not create an execution record.
- The trigger must not update stats.
- The trigger must not append audit.
- The trigger must not rollback or correct.
- The trigger must not mutate trade state.
- The trigger must not perform Avanza/browser action.
- The trigger must not call broker/order behavior.

Forbidden controls:

- No `Run action`.
- No `Finalize`.
- No `Persist`.
- No `Create execution record`.
- No `Update stats`.
- No `Append audit`.
- No `Rollback`.
- No `Correct`.
- No `Mutate trade`.
- No `Send to broker`.
- No `Open Avanza`.
- No automatic mode action.

## 8. Dry-run State Display Rules

`dry_run_ready`:

- Show as ready-to-preview only.
- Do not label as action-ready, finalization-ready, persistence-ready, or
  write-ready.
- Proposed impacts must still be labelled descriptive only.

`dry_run_needs_review`:

- Show review state.
- Surface manual review warnings and relevant metadata gaps.
- Do not expose approval or execution controls.

`dry_run_blocked`:

- Show blocked state with reasons.
- Distinguish missing prerequisites from unsafe authority/coupling reasons when
  possible.
- Do not expose retry controls that imply production behavior.

`dry_run_unsupported`:

- Show unsupported state.
- Explain that unsupported does not authorize action execution.

`dry_run_not_ready`:

- Show not-ready state.
- Show missing or incomplete metadata.

Proposed impacts:

- Every proposed impact section must include a visible descriptive-only label.
- `safeToApply=false` should be shown or represented by a safety label.

## 9. Relationship to Action Execution

- The preview is upstream of any action execution.
- No finalization action implementation exists.
- No finalization action route exists.
- The preview does not authorize action execution.
- A future action implementation must be separate, explicit, auditable, and
  gated.
- A future action implementation must not reuse preview readiness as write
  authority.
- Dry-run preview output does not authorize writes.

## 10. Relationship to Execution Records, Persistence, Stats, Audit, Rollback,
and Trades

Execution records:

- The preview may show proposed execution-record impact metadata.
- It does not create, update, reserve, or persist execution records.

Persistence:

- The preview may show proposed persistence impact metadata.
- It does not write to Supabase, localStorage, or any persistence boundary.

Stats/PnL:

- The preview may show proposed stats/PnL input metadata.
- It does not update stats, PnL, performance, positions, or trade state.

Audit:

- The preview may show proposed audit event/reference metadata.
- It does not append audit records.

Rollback/correction:

- The preview may show correction/rollback references.
- It does not rollback or correct anything.

Trades:

- Trade mutation remains out of scope.
- The preview does not mutate trade state.
- Future trade lifecycle changes require a separate provisional trade state
  design.

All remain separate future boundaries.

## 11. Candidate Next Actions

A. Create Finalization Action Dev Preview

- Implement the dev-gated, read-only preview described here.
- Use a controlled fixture or explicit trigger first.
- Keep all write/mutation/action controls absent.

B. Create Execution Record Integration Reassessment

- Reassess how finalization action dry-run execution-record impacts should
  relate to the execution-record boundary before any integration.
- Keep this documentation-only if selected next.

C. Create Provisional Trade State Design

- Define the trade lifecycle model before any trade mutation integration.
- Keep mutation disabled.

D. Create Finalization Action Route Design

- Design a future route only after the dev preview and integration boundaries
  are clear.
- Route design must not be confused with action execution implementation.

## 12. Recommended Next Action

Recommended default:

**Action 532 - Create Finalization Action Dev Preview**

Rationale:

- The dry-run exists and has been reassessed.
- This design defines a safe read-only surface for inspecting dry-run output.
- Implementing a dev-gated preview is the next smallest step before any route,
  persistence, execution-record, stats, audit, rollback, or trade lifecycle
  integration is considered.

## 13. Risk Assessment

Dry-run preview mistaken for action execution:

- Risk: the panel is treated as an action runner.
- Control: visible labels, no action controls, dev gating, and read-only
  trigger semantics.

Proposed impacts mistaken for writes:

- Risk: proposed impact fields are interpreted as completed writes.
- Control: each impact section must be labelled descriptive-only and
  `safeToApply=false`.

`dry_run_ready` overtrusted:

- Risk: ready-to-preview is treated as ready-to-finalize.
- Control: display as ready-to-preview only.

User assumes audit appended:

- Risk: proposed audit event metadata is mistaken for an audit append.
- Control: show `auditAppendAttempted=false` and not audit append approval.

User assumes stats/PnL updated:

- Risk: proposed stats/PnL values are treated as official performance data.
- Control: show `statsUpdateAttempted=false` and not stats/PnL update approval.

User assumes execution record created:

- Risk: proposed execution-record metadata is mistaken for an inserted record.
- Control: show `executionRecordCreationAttempted=false` and not execution
  record approval.

User assumes finalization happened:

- Risk: proposed finalization impact is mistaken for final state.
- Control: show `finalizationAttempted=false` and not finalization approval.

Future UI overtrust:

- Risk: polished UI styling makes diagnostic data look operational.
- Control: keep safety labels visible and avoid operational button language.

Automatic mode confusion:

- Risk: users infer automatic finalization support.
- Control: show automatic mode disabled and omit automatic controls.

## 14. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No refactor, behavior change, UI
implementation, preview implementation, dry-run change, action implementation,
finalization implementation, transition application, persistence/write
behavior, Supabase/localStorage write, audit append, rollback/correction
behavior, execution-record creation, stats/PnL update, trade mutation,
capture/browser/Avanza behavior, broker behavior, order execution, production
UI, or production runtime behavior was added.

## Action 532 Follow-Up - Finalization Action Dev Preview Created

Action 532 created:

- `components/execution/FinalizationActionPreview.tsx`
- `lib/finalization-action-dev-fixture.ts`

Design implementation result:

- Added a dev-gated, read-only, fixture-only Finalization Action Dry-run
  Preview.
- Added an explicit `Run finalization action dry-run preview` trigger.
- The fixture composes controlled candidate data through
  `validateFinalizationAction(...)` and `runFinalizationActionDryRun(...)`.
- The preview displays dry-run status, validation summary, proposed impacts,
  blocked reasons, warnings, safety policy, and status metadata.
- Required safety labels are visible.
- No forbidden action controls were added.
- No live Avanza data, capture/browser automation, broker/order behavior,
  action execution, finalization, persistence, execution-record creation,
  stats/PnL update, audit append, rollback/correction, or trade mutation was
  added.

Next recommended action:

**Action 533 - Reassess Finalization Action Dev Preview**

## Action 533 Follow-Up - Finalization Action Dev Preview Reassessed

Action 533 created `docs/finalization-action-dev-preview-reassessment.md`.

Design reassessment impact:

- Verified the implemented preview follows the Action 531 design.
- Verified it is dev-gated, fixture-only, explicit-trigger-only, and read-only.
- Verified it displays dry-run status, validation summary, proposed impacts,
  blocked reasons, warnings, safety policy, and status metadata.
- Verified required safety labels remain visible.
- Verified forbidden action controls remain absent.
- Verified no runtime behavior, UI behavior change, fixture change, dry-run
  change, validator change, action implementation, finalization, persistence,
  execution-record creation, stats/PnL update, audit append,
  rollback/correction, trade mutation, Avanza/browser behavior, broker
  behavior, or order behavior was added.

Next recommended action:

**Action 534 - Create Execution Record Integration Reassessment**
