# Action 502: Candidate Build-Failure Diagnostic Evidence Completion Approval Gate

Action 501 reviewed the bounded Action 500 rehearsal evidence and blocked remediation because the retained record was not enough to classify the `npm run build` failure.

## Action 501 Result

- Decision: `blocked`
- Primary classification: `build_failure_evidence_insufficient`
- Candidate hash impact: `candidate_hash_impact_unresolved`
- Remediation class: `diagnostic_evidence_completion_required`
- Build rerun: `false`
- Rehearsal rerun: `false`
- Deployment: `false`
- Activation: `false`
- Runtime preview state: `runtime_preview_waiting_for_operator_inputs`

The missing evidence was specific: Action 500 retained command status, exit code, signal classification, stdout/stderr byte counts, preceding command statuses, and cleanup status, but not enough sanitized build output to identify the Next.js build phase, primary error class, first causal error, or repository-relative implicated paths.

## Diagnostic Scope

Approved diagnostic classification: `bounded_candidate_build_failure_diagnostic_capture`

The future Action 503 procedure may reproduce only enough of the Action 500 execution path to reach the existing `npm run build` command. It is not a full rehearsal retry and must not count as a successful candidate rehearsal.

Attempt limit: `1`

Same-action retry: `false`

If the build unexpectedly passes, deployment is still not authorized. The result must be classified as `diagnostic_build_passed_unexpectedly` and followed by a separate nondeterminism decision.

## Candidate Reconstruction Boundary

Action 503 must reconstruct exactly the Action 492 candidate:

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Candidate file count: `31`
- Change-candidate hash: `c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c`
- Full-candidate inventory hash: `d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f`
- Added runtime file: `lib/pure-confidence-calibration.ts`
- Added runtime file SHA-256: `bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70`

The candidate must exclude unrelated dirty files, later control artifacts, `.env*`, `.netlify/`, credentials, and build output copied from the active repository.

## Prerequisite Gates

Action 503 must abort before the build if any prerequisite differs from the Action 500 passed state:

- `safe_canonical_temp_path`
- `exact_candidate_reconstruction`
- `runtime_closure_complete`
- `source_integrity_passed`
- `source_safety_passed`
- `strict_hash_matrix_passed`
- `preview_flag_disabled_verified`
- `dependency_materialization_passed`
- `five_extraneous_packages_excluded`
- `no_network_install_update`

## Build Command

Action 503 may run exactly:

```sh
npm run build
```

It must not alter package scripts, add debug packages, use a different Next.js command, set arbitrary environment values, add unsupported debug flags, override `NODE_ENV`, or run production deployment tooling.

Permitted wrapper behavior is limited to capturing exit code, signal, timeout classification, and streaming output through deterministic bounded sanitization.

## Sanitization

Before retaining evidence, Action 503 must remove or replace absolute machine paths, HOME paths, system temp paths, usernames, tokens, cookies, authorization headers, URLs with query strings, environment values, `.env` content, Netlify credentials, Supabase keys, provider keys, connection strings, private keys, bearer strings, and high-confidence secret-like values.

Allowed path representation: repository-relative paths only.

Allowed environment evidence: canonical preview key classification, absent or disabled. Raw value recorded: `false`.

## Retained Evidence Limits

- Primary diagnostic summary max: `1`
- Sanitized diagnostic lines max: `10`
- Repository-relative path references max: `10`
- Sanitized stack classifications max: `5`
- Raw stdout retained: `false`
- Raw stderr retained: `false`
- Full logs retained: `false`

The retained evidence must be only enough to determine build phase, primary error class, first causal error, repository-relative implicated paths, bounded line/column references, exit code, signal or timeout classification, and stack frame ownership.

## Build Phase Vocabulary

- `build_configuration_loading`
- `build_compilation`
- `build_type_validation`
- `build_lint_phase`
- `build_route_collection`
- `build_static_generation`
- `build_page_data_collection`
- `build_bundling`
- `build_asset_generation`
- `build_post_processing`
- `build_process_startup`
- `build_phase_unknown`

## Error Class Vocabulary

- `module_resolution_error`
- `server_client_boundary_error`
- `static_rendering_error`
- `environment_contract_error`
- `configuration_error`
- `dependency_runtime_error`
- `generated_artifact_error`
- `route_generation_error`
- `bundler_error`
- `filesystem_error`
- `process_resource_error`
- `timeout_error`
- `internal_framework_error`
- `unknown_build_error`

## Path Classification Vocabulary

- `runtime_candidate_file`
- `clean_base_file`
- `31_file_overlay_file`
- `added_runtime_file`
- `configuration_file`
- `generated_build_output`
- `dependency_file`
- `framework_internal`
- `rehearsal_runner_file`
- `unrelated_dirty_worktree_file`
- `unknown`

If an unrelated dirty-worktree file appears in retained evidence, classify `rehearsal_boundary_contamination_suspected` and do not modify the candidate based only on contaminated evidence.

## Root-Cause Vocabulary

- `candidate_source_build_defect`
- `candidate_build_configuration_defect`
- `candidate_dependency_materialization_defect`
- `candidate_missing_build_required_artifact`
- `candidate_build_environment_contract_defect`
- `rehearsal_build_runner_defect`
- `unrelated_source_contamination_detected`
- `build_failure_not_reproduced`
- `build_failure_evidence_still_insufficient`
- `build_failure_classification_ambiguous`

## Hash Impact

Use exactly:

- `candidate_hash_change_required`
- `candidate_hash_change_not_required`
- `candidate_hash_impact_unresolved`

Candidate hash change is required only when candidate source or candidate configuration must change. No hash change is required for diagnostic runner changes, evidence capture changes, temp path changes, dependency-copy implementation changes that do not alter candidate source, build invocation wrapper changes, or sanitized logging changes.

## Remediation Mapping

- Candidate source defect: `action_504_candidate_build_failure_source_remediation`
- Candidate configuration defect: `action_504_candidate_build_configuration_remediation`
- Dependency materialization defect: `action_504_candidate_build_dependency_materialization_remediation_gate`
- Build environment or runner defect: `action_504_candidate_build_runner_or_environment_remediation_gate`
- Failure not reproduced: `action_504_candidate_build_failure_nondeterminism_assessment_gate`
- Evidence remains insufficient: `action_504_candidate_build_failure_diagnostic_strategy_remediation_gate`

## Approval

Approval decision: `approved`

Unresolved conditions: none

Diagnostic execution authorized by this action: `false`

This action performed no diagnostic build, rehearsal, source change, candidate hash change, package or lockfile change, dependency install, environment mutation, raw log retention, credential retention, deployment, activation, Netlify operation, provider call, Supabase access, persistence, replay, feedback, confidence application, or downstream behavior change.

Next action: `action_503_candidate_build_failure_bounded_diagnostic_capture`
