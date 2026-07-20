# Action 490: Command Inventory Binding Remediation Approval Gate

Action 490 is a static approval gate for the Action 489 rehearsal blocker. It performs no rehearsal, deployment, preview activation, package install, dependency update, provider call, Supabase access, persistence, replay, confidence application, feedback creation, downstream behavior change, scanner/ranking/publication/execution/Add Trade/risk change, package rewrite, lockfile rewrite, or environment mutation.

## Action 489 Abort

Action 489 reconstructed the frozen candidate from clean base `15f9923c24ed1f3cf82d34656eeacbfd98a0d347` plus the approved 30-file overlay `7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6`.

The rehearsal passed path safety, source reconstruction, overlay verification, source inventory, remediated source safety, source-only Git integrity, dependency materialization, and extraneous-package exclusion. Runtime commands had not started. Cleanup completed.

The Action 489 abort reason was `command_inventory_unresolvable_in_bound_30_file_candidate`.

## Root Cause

Root cause classification:

`rehearsal_control_tests_incorrectly_required_inside_frozen_deployment_candidate`

The nine later Action 481-489 focused suites were created after the deployment candidate was frozen. They validate records, approval gates, attempt counts, cleanup, and orchestration. Their absence from the deployment candidate does not itself prove deployment-source incompleteness.

## Candidate Boundary

Frozen candidate bindings remain unchanged:

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Approved 30-file change candidate: `7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6`
- Full-candidate inventory: `cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0`
- Candidate changed-file count: `30`
- Integrity strategy: `baseline_plus_overlay_manifest_integrity`
- Dependency method: `temporary_verified_node_modules_copy`

Action 490 does not expand the candidate and does not copy later Action artifacts into it.

## Class A: Candidate-Internal Commands

Class A commands must run inside the isolated full candidate and must depend only on files present in the clean base or the approved 30-file overlay.

Class A includes:

- candidate integrity confirmation
- `npx next typegen`
- `npx tsc --noEmit`
- `npm run build`
- `npm run lint`
- Action 309 safety guard because the script exists in the clean base
- Action 461 preview-consumer suite because it exists in the 30-file overlay
- Action 462 independent preview-consumer suite because it exists in the 30-file overlay
- Action 463 recommendation-details/deployment-readiness regression suite because it exists in the 30-file overlay
- exact scans for projection call site, route absence, persistence absence, replay absence, provider/Supabase absence, feedback absence, confidence application absence, ranking/scanner/publication/execution/Add Trade/risk/sizing absence, and disabled preview flag

The internal path inventory found one true runtime/build blocker:

`lib/pure-confidence-calibration.ts`

That file is required by the preview consumer path through TypeScript/source imports and the Action 461 runtime preview consumer suite, but it is not present in the frozen clean-base-plus-30-overlay candidate.

## Class B: External Rehearsal-Control Checks

Class B checks run outside the temporary candidate after the candidate rehearsal and cleanup evidence exist.

Class B includes:

- Actions 481-490 verifiers
- focused Action 481-490 approval/rehearsal contract suites
- documentation and record contract checks
- attempt count, result vocabulary, and cleanup checks
- checks verifying prior Actions remain healthy

These are control artifacts. They must not be required as files inside the deployment candidate, must not mutate the candidate, must not copy files into the candidate, and must not count as another rehearsal attempt.

## Runtime-Relevance Policy

A command may be externalized only if it verifies Action documentation, records, gates, or orchestration and is not imported by runtime code, required by Next.js build, required by TypeScript compilation, required by the deployed preview component, or required by candidate runtime regression coverage.

A command must remain internal if it validates the preview consumer, Recommendation details rendering, projection call-site behavior, runtime route absence, runtime side-effect absence, build correctness, type correctness, or lint correctness.

## Execution Sequence For The Next Rehearsal

The approved sequence remains:

1. Phase 0: safe temp-path validation
2. Phase 1: source-only candidate reconstruction, overlay/hash verification, source inventory, source safety, and Git integrity
3. Phase 2: dependency materialization and extraneous-package exclusion
4. Phase 3A: candidate-internal commands serially
5. Phase 4: post-command integrity, bounded evidence record, and temp cleanup
6. Phase 5: external rehearsal-control verifiers and tests after cleanup

External post-rehearsal checks do not count as another rehearsal attempt.

## Failure Semantics

Candidate-internal command failure after commands begin means `full_candidate_rehearsal_failed`.

Missing required internal paths before commands begin means `full_candidate_rehearsal_aborted`.

Candidate integrity, dependency, or flag blockers mean `full_candidate_rehearsal_aborted`.

External control failure after a candidate-internal pass means `rehearsal_evidence_verification_failed`; it must not falsely claim that the candidate runtime build failed.

## Result Vocabulary

Candidate rehearsal:

- `full_candidate_rehearsal_passed`
- `full_candidate_rehearsal_failed`
- `full_candidate_rehearsal_aborted`

External evidence:

- `rehearsal_evidence_verified`
- `rehearsal_evidence_verification_failed`
- `rehearsal_evidence_verification_aborted`

Overall readiness:

- `ready_for_preview_deployment_final_approval`
- `ready_with_conditions`
- `blocked`

Approval:

- `approved`
- `approved_with_conditions`
- `blocked`

## Approval Decision

Approval decision: `blocked`

Blocker:

`runtime_required_internal_path_missing_from_frozen_candidate:lib/pure-confidence-calibration.ts`

The command split itself is valid, and the later Action 481-490 tests are correctly classified as external rehearsal-control artifacts. However, Action 490 cannot approve Action 491 while a runtime/build-required Class A path is absent from the frozen candidate.

## Runtime Preview State

The preview flag `CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED` remains absent or disabled.

Runtime preview state: `runtime_preview_waiting_for_operator_inputs`

Next action: `action_491_candidate_runtime_dependency_completeness_remediation_gate`
