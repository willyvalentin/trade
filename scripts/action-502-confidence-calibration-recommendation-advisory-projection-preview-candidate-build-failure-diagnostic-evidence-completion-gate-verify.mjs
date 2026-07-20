#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-approval-record.json";
const docPath =
  "docs/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-gate.md";
const action501Path =
  "docs/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-record.json";
const action500Path =
  "docs/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json";
const action492Path =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  addedRuntimePath: "lib/pure-confidence-calibration.ts",
  addedRuntimeHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  classification: "bounded_candidate_build_failure_diagnostic_capture",
  command: "npm run build",
  nextAction: "action_503_candidate_build_failure_bounded_diagnostic_capture",
};

const exactBuildPhases = [
  "build_configuration_loading",
  "build_compilation",
  "build_type_validation",
  "build_lint_phase",
  "build_route_collection",
  "build_static_generation",
  "build_page_data_collection",
  "build_bundling",
  "build_asset_generation",
  "build_post_processing",
  "build_process_startup",
  "build_phase_unknown",
];

const exactErrorClasses = [
  "module_resolution_error",
  "server_client_boundary_error",
  "static_rendering_error",
  "environment_contract_error",
  "configuration_error",
  "dependency_runtime_error",
  "generated_artifact_error",
  "route_generation_error",
  "bundler_error",
  "filesystem_error",
  "process_resource_error",
  "timeout_error",
  "internal_framework_error",
  "unknown_build_error",
];

const exactPathClasses = [
  "runtime_candidate_file",
  "clean_base_file",
  "31_file_overlay_file",
  "added_runtime_file",
  "configuration_file",
  "generated_build_output",
  "dependency_file",
  "framework_internal",
  "rehearsal_runner_file",
  "unrelated_dirty_worktree_file",
  "unknown",
];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function failUnless(condition, message, failures) {
  if (!condition) failures.push(message);
}

function sameArray(actual, expectedValues) {
  return (
    Array.isArray(actual) &&
    actual.length === expectedValues.length &&
    actual.every((value, index) => value === expectedValues[index])
  );
}

const failures = [];
for (const relativePath of [recordPath, docPath, action501Path, action500Path, action492Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action501 = readJson(action501Path);
  const action500 = readJson(action500Path);
  const action492 = readJson(action492Path);
  const build = action500.candidate_command_results.find((command) => command.name === expected.command);

  failUnless(action501.approval_decision === "blocked", "Action 501 decision mismatch", failures);
  failUnless(
    action501.build_failure_primary_classification === "build_failure_evidence_insufficient",
    "Action 501 classification mismatch",
    failures,
  );
  failUnless(
    action501.candidate_hash_impact === "candidate_hash_impact_unresolved",
    "Action 501 hash-impact mismatch",
    failures,
  );
  failUnless(action500.candidate_rehearsal_result === "full_candidate_rehearsal_failed", "Action 500 result mismatch", failures);
  failUnless(build?.status === "failed", "Action 500 build status mismatch", failures);
  failUnless(action492.new_candidate_file_count === expected.count, "Action 492 count mismatch", failures);
  failUnless(action492.new_change_candidate_hash === expected.changeHash, "Action 492 change hash mismatch", failures);
  failUnless(action492.new_full_candidate_inventory_hash === expected.fullHash, "Action 492 full hash mismatch", failures);

  failUnless(
    record.schema_version === "action_502_candidate_build_failure_diagnostic_evidence_completion_approval_gate_v1",
    "schema mismatch",
    failures,
  );
  failUnless(record.source_action === 501, "source action mismatch", failures);
  failUnless(record.action_501_decision === "blocked", "record Action 501 decision mismatch", failures);
  failUnless(
    record.action_501_primary_classification === "build_failure_evidence_insufficient",
    "record Action 501 classification mismatch",
    failures,
  );
  failUnless(record.action_501_hash_impact === "candidate_hash_impact_unresolved", "record hash impact mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path === expected.addedRuntimePath, "added runtime path mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedRuntimeHash, "added runtime hash mismatch", failures);

  failUnless(record.diagnostic_classification === expected.classification, "diagnostic classification mismatch", failures);
  failUnless(record.diagnostic_attempt_limit === 1, "diagnostic attempt limit mismatch", failures);
  failUnless(record.same_action_retry_authorized === false, "same-action retry authorized", failures);
  failUnless(record.diagnostic_counts_as_successful_rehearsal === false, "diagnostic counts as rehearsal", failures);
  failUnless(record.diagnostic_command === expected.command, "diagnostic command mismatch", failures);
  failUnless(
    record.diagnostic_build_success_deployment_authorized === false,
    "unexpected build success deployment authorized",
    failures,
  );

  for (const key of [
    "exact_action_492_candidate_required",
    "no_unrelated_dirty_files",
    "no_later_control_artifacts_in_candidate",
    "no_env_files",
    "no_netlify_directory",
    "no_credentials",
    "no_build_output_copied_from_active_repository",
  ]) {
    failUnless(record.candidate_reconstruction_policy[key] === true, `candidate reconstruction ${key} mismatch`, failures);
  }

  for (const gate of [
    "safe_canonical_temp_path",
    "exact_candidate_reconstruction",
    "runtime_closure_complete",
    "source_integrity_passed",
    "source_safety_passed",
    "strict_hash_matrix_passed",
    "preview_flag_disabled_verified",
    "dependency_materialization_passed",
    "five_extraneous_packages_excluded",
    "no_network_install_update",
  ]) {
    failUnless(record.prerequisite_gate_inventory.includes(gate), `missing prerequisite: ${gate}`, failures);
  }

  failUnless(record.build_command_policy.command === expected.command, "build command policy mismatch", failures);
  for (const key of [
    "package_scripts_modified",
    "debug_packages_added",
    "different_next_command_authorized",
    "arbitrary_environment_values_authorized",
    "unsupported_debug_flags_authorized",
    "node_env_override_authorized",
    "production_deployment_tooling_authorized",
  ]) {
    failUnless(record.build_command_policy[key] === false, `${key} should be false`, failures);
  }

  for (const sanitizer of [
    "remove_absolute_machine_paths",
    "remove_home_paths",
    "remove_environment_values",
    "remove_netlify_credentials",
    "remove_supabase_keys",
    "remove_provider_keys",
    "remove_high_confidence_secret_like_values",
    "retain_repository_relative_paths_only",
  ]) {
    failUnless(record.sanitization_policy.includes(sanitizer), `missing sanitizer: ${sanitizer}`, failures);
  }

  failUnless(record.retained_evidence_limits.primary_diagnostic_summary_max === 1, "summary limit mismatch", failures);
  failUnless(record.retained_evidence_limits.sanitized_diagnostic_lines_max === 10, "line limit mismatch", failures);
  failUnless(record.retained_evidence_limits.repository_relative_path_references_max === 10, "path limit mismatch", failures);
  failUnless(record.retained_evidence_limits.sanitized_stack_classifications_max === 5, "stack limit mismatch", failures);
  failUnless(record.retained_evidence_limits.raw_stdout_retained === false, "raw stdout retained", failures);
  failUnless(record.retained_evidence_limits.raw_stderr_retained === false, "raw stderr retained", failures);
  failUnless(record.retained_evidence_limits.full_logs_retained === false, "full logs retained", failures);

  failUnless(sameArray(record.build_phase_vocabulary, exactBuildPhases), "build phase vocabulary mismatch", failures);
  failUnless(sameArray(record.error_class_vocabulary, exactErrorClasses), "error class vocabulary mismatch", failures);
  failUnless(sameArray(record.path_classification_vocabulary, exactPathClasses), "path classification vocabulary mismatch", failures);
  failUnless(
    record.unrelated_dirty_worktree_detection_result === "rehearsal_boundary_contamination_suspected",
    "contamination classification mismatch",
    failures,
  );

  for (const rootCause of [
    "candidate_source_build_defect",
    "rehearsal_build_runner_defect",
    "unrelated_source_contamination_detected",
    "build_failure_not_reproduced",
    "build_failure_evidence_still_insufficient",
  ]) {
    failUnless(record.root_cause_classification_vocabulary.includes(rootCause), `missing root cause: ${rootCause}`, failures);
  }

  failUnless(record.hash_impact_vocabulary.includes("candidate_hash_change_required"), "missing hash-change-required vocabulary", failures);
  failUnless(record.hash_impact_vocabulary.includes("candidate_hash_change_not_required"), "missing hash-change-not-required vocabulary", failures);
  failUnless(record.hash_impact_vocabulary.includes("candidate_hash_impact_unresolved"), "missing hash-impact-unresolved vocabulary", failures);
  failUnless(
    record.hash_impact_policy.candidate_source_or_configuration_change_requires_hash_change === true,
    "source/config hash policy mismatch",
    failures,
  );
  failUnless(record.hash_impact_policy.diagnostic_runner_change_requires_hash_change === false, "runner hash policy mismatch", failures);
  failUnless(record.hash_impact_policy.sanitized_logging_change_requires_hash_change === false, "logging hash policy mismatch", failures);

  failUnless(
    record.remediation_mapping.candidate_source_build_defect ===
      "action_504_candidate_build_failure_source_remediation",
    "source remediation mapping mismatch",
    failures,
  );
  failUnless(
    record.remediation_mapping.candidate_build_configuration_defect ===
      "action_504_candidate_build_configuration_remediation",
    "configuration remediation mapping mismatch",
    failures,
  );
  failUnless(
    record.remediation_mapping.candidate_dependency_materialization_defect ===
      "action_504_candidate_build_dependency_materialization_remediation_gate",
    "dependency remediation mapping mismatch",
    failures,
  );
  failUnless(
    record.remediation_mapping.rehearsal_build_runner_defect ===
      "action_504_candidate_build_runner_or_environment_remediation_gate",
    "runner remediation mapping mismatch",
    failures,
  );
  failUnless(
    record.remediation_mapping.build_failure_not_reproduced ===
      "action_504_candidate_build_failure_nondeterminism_assessment_gate",
    "nondeterminism remediation mapping mismatch",
    failures,
  );
  failUnless(
    record.remediation_mapping.build_failure_evidence_still_insufficient ===
      "action_504_candidate_build_failure_diagnostic_strategy_remediation_gate",
    "insufficient evidence remediation mapping mismatch",
    failures,
  );

  for (const result of [
    "diagnostic_build_failure_captured",
    "diagnostic_build_passed_unexpectedly",
    "diagnostic_build_aborted",
    "diagnostic_capture_failed",
  ]) {
    failUnless(record.diagnostic_result_vocabulary.includes(result), `missing diagnostic result: ${result}`, failures);
  }

  for (const key of [
    "raw_logs_retained",
    "raw_environment_values_recorded",
    "credential_values_recorded",
    "absolute_machine_paths_recorded",
    "home_paths_recorded",
    "candidate_modified",
    "source_modified",
    "package_manifest_modified",
    "lockfile_modified",
    "environment_modified",
    "dependency_install_performed",
    "diagnostic_execution_authorized",
    "build_performed_by_action_502",
    "rehearsal_authorized",
    "rehearsal_performed",
    "deployment_authorized",
    "deployment_performed",
    "activation_authorized",
    "preview_activated",
    "netlify_operation_performed",
    "provider_called",
    "supabase_accessed",
    "persistence_created",
    "replay_created",
    "feedback_created",
    "confidence_applied",
    "downstream_behavior_changed",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.approval_decision === "approved", "approval decision mismatch", failures);
  failUnless(Array.isArray(record.unresolved_conditions) && record.unresolved_conditions.length === 0, "unresolved conditions mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Approved diagnostic classification: `bounded_candidate_build_failure_diagnostic_capture`",
    "Attempt limit: `1`",
    "npm run build",
    "Allowed path representation: repository-relative paths only.",
    "Primary diagnostic summary max: `1`",
    "Sanitized diagnostic lines max: `10`",
    "Candidate hash change is required only when candidate source or candidate configuration must change.",
    "Approval decision: `approved`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_502_confidence_calibration_recommendation_advisory_projection_preview_candidate_build_failure_diagnostic_evidence_completion_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  approval_decision: record?.approval_decision ?? null,
  diagnostic_classification: record?.diagnostic_classification ?? null,
  diagnostic_attempt_limit: record?.diagnostic_attempt_limit ?? null,
  diagnostic_command: record?.diagnostic_command ?? null,
  diagnostic_execution_authorized: record?.diagnostic_execution_authorized ?? null,
  rehearsal_authorized: record?.rehearsal_authorized ?? null,
  deployment_authorized: record?.deployment_authorized ?? null,
  activation_authorized: record?.activation_authorized ?? null,
  runtime_preview_state: record?.runtime_preview_state ?? null,
  next_action: record?.next_action ?? null,
  build_free: true,
  rehearsal_free: true,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  environment_immutable: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
