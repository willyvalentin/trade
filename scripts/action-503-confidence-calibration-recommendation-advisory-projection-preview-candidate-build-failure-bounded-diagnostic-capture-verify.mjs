#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-record.json";
const docPath =
  "docs/action-503-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-bounded-diagnostic-capture.md";
const action502Path =
  "docs/action-502-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-diagnostic-evidence-completion-approval-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  command: "npm run build",
  nextAction: "action_504_candidate_build_runner_or_environment_remediation_gate",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function failUnless(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];
for (const relativePath of [recordPath, docPath, action502Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action502 = readJson(action502Path);

  failUnless(action502.approval_decision === "approved", "Action 502 approval mismatch", failures);
  failUnless(
    action502.next_action === "action_503_candidate_build_failure_bounded_diagnostic_capture",
    "Action 502 next action mismatch",
    failures,
  );

  failUnless(record.schema_version === "action_503_candidate_build_failure_bounded_diagnostic_record_v1", "schema mismatch", failures);
  failUnless(record.source_action === 502, "source action mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);
  failUnless(record.diagnostic_classification === "bounded_candidate_build_failure_diagnostic_capture", "classification mismatch", failures);
  failUnless(record.diagnostic_attempt_count === 1, "attempt count mismatch", failures);
  failUnless(record.diagnostic_command === expected.command, "diagnostic command mismatch", failures);

  for (const [gate, expectedValue] of Object.entries({
    action_502_approval: "passed",
    candidate_binding_verification: "passed",
    safe_canonical_temp_path: "passed",
    clean_base_materialization: "passed",
    exact_candidate_reconstruction: "passed",
    runtime_closure_complete: "passed",
    source_inventory: "passed",
    source_integrity: "passed",
    source_safety: "passed",
    strict_wrong_hash_matrix: "passed",
    semantic_preview_flag: "preview_flag_disabled_verified",
    alternate_activation: "false",
    environment_restored: "true",
  })) {
    failUnless(record.prerequisite_gate_results?.[gate] === expectedValue, `gate ${gate} mismatch`, failures);
  }

  failUnless(record.dependency_materialization_result === "passed_temporary_verified_node_modules_copy", "dependency materialization mismatch", failures);
  failUnless(record.network_used === false, "network used", failures);
  failUnless(record.install_performed === false, "install performed", failures);
  failUnless(record.dependency_update_performed === false, "dependency update performed", failures);
  failUnless(record.extraneous_packages_excluded === true, "extraneous packages not excluded", failures);
  failUnless(record.extraneous_dependency_influence_result === "no_influence_detected", "extraneous influence mismatch", failures);

  failUnless(record.build_started === true, "build did not start", failures);
  failUnless(record.build_passed === false, "build should fail for captured diagnostic", failures);
  failUnless(record.build_exit_code === 1, "build exit code mismatch", failures);
  failUnless(record.build_signal_classification === "no_signal", "signal mismatch", failures);
  failUnless(record.build_timeout_classification === "no_timeout", "timeout mismatch", failures);
  failUnless(record.build_phase_vocabulary.includes(record.build_phase), "build phase outside vocabulary", failures);
  failUnless(record.error_class_vocabulary.includes(record.primary_error_class), "error class outside vocabulary", failures);
  failUnless(record.build_phase === "build_bundling", "build phase mismatch", failures);
  failUnless(record.primary_error_class === "process_resource_error", "primary error class mismatch", failures);
  failUnless(record.first_causal_error?.repository_relative_path === "app/globals.css", "first causal path mismatch", failures);

  failUnless(record.retained_evidence_limits.sanitized_diagnostic_line_count <= record.retained_evidence_limits.sanitized_diagnostic_line_limit, "diagnostic line limit exceeded", failures);
  failUnless(record.retained_evidence_limits.repository_relative_path_reference_count <= record.retained_evidence_limits.repository_relative_path_reference_limit, "path limit exceeded", failures);
  failUnless(record.retained_evidence_limits.sanitized_stack_classification_count <= record.retained_evidence_limits.sanitized_stack_classification_limit, "stack limit exceeded", failures);
  failUnless(record.retained_evidence_limits.raw_stdout_retained === false, "raw stdout retained", failures);
  failUnless(record.retained_evidence_limits.raw_stderr_retained === false, "raw stderr retained", failures);
  failUnless(record.retained_evidence_limits.complete_stdout_or_stderr_retained === false, "complete output retained", failures);

  failUnless(record.implicated_paths.length === 1, "implicated path count mismatch", failures);
  failUnless(record.implicated_paths[0].path === "app/globals.css", "implicated path mismatch", failures);
  failUnless(record.implicated_paths[0].classification === "clean_base_file", "path classification mismatch", failures);
  failUnless(record.sanitized_stack_classifications.some((item) => item.classification === "next_js_internals"), "framework classification missing", failures);

  for (const key of [
    "raw_logs_retained",
    "raw_environment_values_recorded",
    "credential_values_recorded",
    "absolute_machine_paths_recorded",
    "home_paths_recorded",
    "urls_with_query_strings_recorded",
    "env_file_contents_recorded",
    "bearer_values_recorded",
    "private_key_material_recorded",
    "rehearsal_boundary_contamination_suspected",
    "candidate_modified",
    "source_modified",
    "package_or_lockfile_modified",
    "configuration_modified",
    "environment_modified",
    "deployment_performed",
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

  failUnless(record.root_cause_classification === "candidate_build_environment_contract_defect", "root cause mismatch", failures);
  failUnless(record.candidate_hash_impact === "candidate_hash_change_not_required", "hash impact mismatch", failures);
  failUnless(record.cleanup_result === "cleanup_passed", "cleanup mismatch", failures);
  failUnless(record.temporary_candidate_absent_after_cleanup === true, "temp candidate still present", failures);
  failUnless(record.source_node_modules_unchanged_after_cleanup === true, "source node_modules changed", failures);
  failUnless(record.environment_restored_after_cleanup === true, "environment not restored", failures);
  failUnless(record.diagnostic_result === "diagnostic_build_failure_captured", "diagnostic result mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  const serializedEvidence = JSON.stringify({
    first_causal_error: record.first_causal_error,
    implicated_paths: record.implicated_paths,
    sanitized_diagnostic_lines: record.sanitized_diagnostic_lines,
    sanitized_stack_classifications: record.sanitized_stack_classifications,
  });
  failUnless(!serializedEvidence.includes("/Users/"), "absolute user path retained", failures);
  failUnless(!serializedEvidence.includes("/private/var/"), "private temp path retained", failures);
  failUnless(!serializedEvidence.includes("Bearer "), "bearer value retained", failures);

  for (const phrase of [
    "Build phase: `build_bundling`",
    "Primary error class: `process_resource_error`",
    "Root-cause classification: `candidate_build_environment_contract_defect`",
    "Candidate hash impact: `candidate_hash_change_not_required`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_503_confidence_calibration_recommendation_advisory_projection_preview_candidate_build_failure_bounded_diagnostic_capture",
  verification_status: failures.length === 0 ? "passed" : "failed",
  diagnostic_result: record?.diagnostic_result ?? null,
  build_phase: record?.build_phase ?? null,
  primary_error_class: record?.primary_error_class ?? null,
  root_cause_classification: record?.root_cause_classification ?? null,
  candidate_hash_impact: record?.candidate_hash_impact ?? null,
  next_action: record?.next_action ?? null,
  build_rerun_free: true,
  rehearsal_free: true,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
