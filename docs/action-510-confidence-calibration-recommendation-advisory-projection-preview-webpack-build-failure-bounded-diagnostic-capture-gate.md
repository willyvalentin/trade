# Action 510: Webpack Build-Failure Bounded Diagnostic Capture Gate

Action 510 is a static approval gate for one future bounded Webpack diagnostic capture. It does not run `next build --webpack`, does not run `npm run build`, does not rehearse the candidate, and does not deploy or activate the preview.

## Action 509 Result

- Action 509 decision: `blocked`
- Webpack classification: `webpack_failure_evidence_insufficient`
- Implicated paths resolved: `false`
- Candidate defect status: `candidate_defect_status_unresolved`
- Candidate hash impact: `candidate_hash_impact_unresolved`
- Runtime preview state: `runtime_preview_waiting_for_operator_inputs`

Action 509 showed that the Action 508 Webpack comparison failed during `build_bundling` with `type_or_compile_error`, but the first causal Webpack error and implicated paths were not retained.

## Diagnostic Scope

- Diagnostic classification: `bounded_webpack_build_failure_diagnostic_capture`
- Exact future command: `next build --webpack`
- Attempt limit: `1`
- Retry allowed: `false`
- Authoritative Turbopack build in Action 511: `false`
- Full rehearsal in Action 511: `false`
- Deployment readiness established by this diagnostic: `false`

The diagnostic is comparison-only. It cannot supersede the authoritative build requirement.

## Candidate Binding

Future Action 511 must reconstruct exactly:

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Change-candidate hash: `c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c`
- Full-candidate inventory hash: `d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f`
- Candidate file count: `31`
- Added runtime path: `lib/pure-confidence-calibration.ts`
- Added runtime path hash: `bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70`
- Preview flag: `CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`
- Preview flag state: absent or disabled

No unrelated dirty files, control-only additions, `.env*`, `.netlify`, credentials, copied build output, or unapproved `node_modules` materialization are allowed.

## Prerequisite Gates

Action 511 must abort as `webpack_diagnostic_aborted` unless all required gates pass:

- `safe_canonical_temp_path`: `passed`
- `exact_candidate_reconstruction`: `passed`
- `runtime_dependency_closure`: `passed`
- `source_inventory`: `passed`
- `source_integrity`: `passed`
- `source_safety`: `passed`
- `strict_wrong_hash_matrix`: `passed`
- `semantic_preview_flag`: `preview_flag_disabled_verified`
- `alternate_activation`: `false`
- `dependency_materialization`: `passed`
- `five_extraneous_packages`: `excluded`
- `no_network_install_update`: `true`

## Command Policy

Use exactly `next build --webpack` with the locally installed Next.js tooling verified by Action 507.

Do not modify `package.json`, add package scripts, add debug packages, change Next.js configuration, set arbitrary environment values, run another Next.js version, or use deployment tooling.

## Sanitization Policy

The process stream must be sanitized before retention. Remove or replace absolute repository paths, system temp paths, HOME paths, usernames, tokens, cookies, authorization headers, bearer values, query-bearing URLs, environment values, `.env` contents, Netlify credentials, Supabase keys, provider keys, connection strings, private-key material, and high-confidence secret-like values.

Allowed retained path format: repository-relative only.

Allowed environment information: preview flag classification absent or disabled, with raw value recorded `false`.

No unsanitized log file may be created.

## Evidence Limits

Retain at most:

- First causal error objects: `1`
- Sanitized diagnostic lines: `12`
- Implicated repository-relative paths: `10`
- Sanitized stack classifications: `5`
- Bounded module/import references: `5`
- Exit classifications: `1`
- Signal/timeout classifications: `1`

## First-Causal-Error Extraction

Prefer the earliest specific diagnostic over later generic summaries such as `compilation failed`, `build failed`, or `exited with code 1`.

The retained first causal error shape is:

```json
{
  "summary": "sanitized_paraphrase",
  "webpack_subsystem": "vocabulary_value",
  "error_class": "vocabulary_value",
  "repository_relative_path": "string_or_null",
  "line": "integer_or_null",
  "column": "integer_or_null",
  "module_reference": "string_or_null"
}
```

Do not retain source excerpts.

## Webpack Subsystem Vocabulary

Use exactly one of:

- `webpack_typescript_validation`
- `webpack_javascript_compilation`
- `webpack_css_processing`
- `webpack_postcss_processing`
- `webpack_module_resolution`
- `webpack_loader_execution`
- `webpack_server_client_boundary`
- `webpack_static_rendering`
- `webpack_route_collection`
- `webpack_generated_artifact_processing`
- `webpack_dependency_compilation`
- `webpack_configuration_loading`
- `webpack_process_resource_operation`
- `webpack_internal_framework`
- `webpack_subsystem_unknown`

## Error-Class Vocabulary

Use exactly one of:

- `webpack_candidate_typescript_error`
- `webpack_candidate_module_resolution_error`
- `webpack_candidate_css_or_loader_error`
- `webpack_server_client_boundary_error`
- `webpack_candidate_syntax_or_transform_error`
- `webpack_generated_artifact_error`
- `webpack_configuration_error`
- `webpack_dependency_compile_error`
- `webpack_process_resource_error`
- `webpack_runner_environment_error`
- `webpack_internal_framework_error`
- `webpack_unknown_build_error`

## Path Classification

Use exactly one of:

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

For each retained path, record repository-relative path, candidate membership, hash-bound status, role (`direct`, `transitive`, `generated`, or `contextual`), and bounded imported-by relation where available. A dirty-worktree-only path sets `rehearsal_boundary_contamination_suspected: true`.

## Candidate-Versus-Runner Policy

After capture, choose exactly one:

- `candidate_source_build_defect`
- `candidate_build_configuration_defect`
- `candidate_dependency_materialization_defect`
- `candidate_missing_build_required_artifact`
- `candidate_build_environment_contract_defect`
- `webpack_comparison_invocation_defect`
- `rehearsal_build_runner_defect`
- `unrelated_source_contamination_detected`
- `webpack_failure_not_reproduced`
- `webpack_failure_evidence_still_insufficient`
- `webpack_failure_classification_ambiguous`

## Dual-Failure Reassessment

Choose exactly one:

- `independent_build_engine_failures`
- `shared_candidate_trigger_with_distinct_engine_failures`
- `shared_environment_contract_failure`
- `turbopack_specific_failure_plus_candidate_compile_failure`
- `comparison_failure_caused_by_comparison_invocation`
- `dual_failure_relationship_ambiguous`

Do not infer shared causality solely from matching build phases.

## Candidate Defect And Hash Impact

Candidate defect status must be one of:

- `candidate_defect_proven`
- `candidate_defect_not_proven`
- `candidate_defect_suspected`
- `candidate_defect_status_unresolved`

A candidate defect is proven only when bounded Webpack evidence identifies a candidate source or configuration problem.

Candidate hash impact must be one of:

- `candidate_hash_change_required`
- `candidate_hash_change_not_required`
- `candidate_hash_impact_unresolved`

Use `candidate_hash_change_required` only when exact candidate source or configuration must change. Runner changes, comparison wrapper corrections, dependency-copy mechanics, diagnostic capture improvements, and framework strategy decisions without candidate mutation do not require candidate hash changes.

## Diagnostic Results

Action 511 must return exactly one:

- `webpack_diagnostic_failure_captured`
- `webpack_diagnostic_passed_unexpectedly`
- `webpack_diagnostic_aborted`
- `webpack_diagnostic_capture_failed`

## Approval Decision

- Approval decision: `approved`
- Unresolved conditions: none
- Future diagnostic execution authorized: `true`
- Diagnostic execution performed now: `false`
- Build/comparison/rehearsal performed now: `false`
- Deployment/activation performed now: `false`

## Next Action

Next action: `action_511_webpack_build_failure_bounded_diagnostic_capture`

No next action may deploy or activate the preview.
