#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-record.json";
const docPath =
  "docs/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture.md";
const action510Path =
  "docs/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-approval-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  addedRuntimeHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  nextAction: "action_512_webpack_comparison_invocation_remediation_gate",
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

function includesAll(values, expectedValues) {
  return expectedValues.every((value) => values.includes(value));
}

const failures = [];
for (const relativePath of [recordPath, docPath, action510Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action510 = readJson(action510Path);

  failUnless(action510.approval_decision === "approved", "Action 510 approval mismatch", failures);
  failUnless(action510.diagnostic_command === "next build --webpack", "Action 510 command mismatch", failures);
  failUnless(action510.diagnostic_attempt_limit === 1, "Action 510 attempt limit mismatch", failures);

  failUnless(record.schema_version === "action_511_webpack_build_failure_bounded_diagnostic_capture_record_v1", "schema mismatch", failures);
  failUnless(record.source_action === 510, "source action mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full inventory hash mismatch", failures);
  failUnless(record.candidate_file_count === 31, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedRuntimeHash, "added runtime hash mismatch", failures);
  failUnless(record.diagnostic_classification === "bounded_webpack_build_failure_diagnostic_capture", "diagnostic classification mismatch", failures);
  failUnless(record.diagnostic_command === "next build --webpack", "diagnostic command mismatch", failures);
  failUnless(record.diagnostic_attempt_count === 1, "diagnostic attempt count mismatch", failures);
  failUnless(record.authoritative_build_attempt_count === 0, "authoritative attempt count mismatch", failures);
  failUnless(record.webpack_retry_performed === false, "retry should be false", failures);
  failUnless(record.same_action_repair_performed === false, "same action repair should be false", failures);

  for (const [key, expectedValue] of Object.entries({
    path_safety: "passed",
    reconstruction: "passed",
    runtime_dependency_closure: "passed",
    source_inventory: "passed",
    source_only_integrity: "passed",
    source_safety: "source_safety_passed",
    strict_wrong_hash_matrix: "passed",
    exact_historical_null_hash_exception: "preserved_only_for_frozen_action_465_inventory_path",
    preview_flag: "preview_flag_disabled_verified",
    alternate_activation: false,
    environment_restored: true,
    dependency_materialization: "passed_temporary_verified_node_modules_copy",
  })) {
    failUnless(record.prerequisite_gate_results[key] === expectedValue, `${key} gate mismatch`, failures);
  }

  failUnless(record.dependency_materialization_result === "passed_temporary_verified_node_modules_copy", "dependency materialization mismatch", failures);
  failUnless(record.extraneous_local_package_count === 5, "extraneous count mismatch", failures);
  failUnless(record.extraneous_packages_excluded === true, "extraneous exclusion mismatch", failures);
  failUnless(record.source_node_modules_unchanged_bounded === true, "source node_modules changed", failures);
  failUnless(record.package_config_hashes_unchanged === true, "package/config hashes changed", failures);

  failUnless(record.process_start_result === "next_command_spawned_invocation_failed_before_webpack_compilation", "process start result mismatch", failures);
  failUnless(record.webpack_started === false, "Webpack should not have reached compilation", failures);
  failUnless(record.webpack_passed === false, "Webpack should not have passed", failures);
  failUnless(record.webpack_exit_code === 127, "exit code mismatch", failures);
  failUnless(record.webpack_signal_classification === "none", "signal mismatch", failures);
  failUnless(record.webpack_duration_classification === "completed_within_timeout", "duration mismatch", failures);
  failUnless(record.webpack_subsystem === "webpack_subsystem_unknown", "subsystem mismatch", failures);
  failUnless(record.primary_error_class === "webpack_runner_environment_error", "error class mismatch", failures);

  failUnless(record.first_causal_error.summary.includes("could not locate node"), "first causal summary mismatch", failures);
  failUnless(record.first_causal_error.repository_relative_path === null, "first causal path should be null", failures);
  failUnless(record.implicated_paths.length === 0, "implicated paths should be empty", failures);
  failUnless(record.implicated_paths_resolved === false, "path resolution should be false", failures);
  failUnless(record.sanitized_diagnostic_lines.length <= 12, "too many diagnostic lines", failures);
  failUnless(record.sanitized_diagnostic_lines.includes("env: node: No such file or directory"), "missing sanitized diagnostic line", failures);
  failUnless(record.module_references.length === 0, "module references should be empty", failures);

  failUnless(record.raw_logs_retained === false, "raw logs retained", failures);
  failUnless(record.raw_environment_values_recorded === false, "raw env values recorded", failures);
  failUnless(record.credential_values_recorded === false, "credential values recorded", failures);
  failUnless(record.absolute_machine_paths_recorded === false, "absolute machine paths recorded", failures);
  failUnless(record.source_contents_recorded === false, "source contents recorded", failures);

  failUnless(record.candidate_vs_runner_classification === "webpack_comparison_invocation_defect", "candidate-vs-runner mismatch", failures);
  failUnless(record.dual_failure_relationship === "comparison_failure_caused_by_comparison_invocation", "dual relationship mismatch", failures);
  failUnless(record.candidate_defect_status === "candidate_defect_not_proven", "candidate defect status mismatch", failures);
  failUnless(record.candidate_hash_impact === "candidate_hash_change_not_required", "candidate hash impact mismatch", failures);
  failUnless(record.diagnostic_result === "webpack_diagnostic_failure_captured", "diagnostic result mismatch", failures);
  failUnless(record.cleanup_result === "cleanup_passed", "cleanup mismatch", failures);
  failUnless(record.candidate_removed === true, "candidate not removed", failures);
  failUnless(record.copied_node_modules_removed === true, "copied node_modules not removed", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);

  failUnless(
    includesAll(record.candidate_vs_runner_vocabulary, [
      "candidate_source_build_defect",
      "webpack_comparison_invocation_defect",
      "rehearsal_build_runner_defect",
      "webpack_failure_evidence_still_insufficient",
    ]),
    "candidate-vs-runner vocabulary incomplete",
    failures,
  );
  failUnless(
    includesAll(record.path_classification_vocabulary, [
      "runtime_candidate_file",
      "dependency_file",
      "framework_internal",
      "rehearsal_runner_file",
      "unknown",
    ]),
    "path classification vocabulary incomplete",
    failures,
  );

  for (const key of [
    "candidate_modified",
    "package_or_lockfile_modified",
    "configuration_modified",
    "environment_modified",
    "network_used",
    "install_performed",
    "dependency_update_performed",
    "deployment_performed",
    "preview_activated",
    "production_changed",
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

  for (const phrase of [
    "Diagnostic command: `next build --webpack`",
    "Diagnostic attempt count: `1`",
    "Candidate-versus-runner classification: `webpack_comparison_invocation_defect`",
    "Candidate hash impact: `candidate_hash_change_not_required`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_511_confidence_calibration_recommendation_advisory_projection_preview_webpack_build_failure_bounded_diagnostic_capture",
  verification_status: failures.length === 0 ? "passed" : "failed",
  diagnostic_attempt_count: record?.diagnostic_attempt_count ?? null,
  authoritative_build_attempt_count: record?.authoritative_build_attempt_count ?? null,
  diagnostic_result: record?.diagnostic_result ?? null,
  process_start_result: record?.process_start_result ?? null,
  primary_error_class: record?.primary_error_class ?? null,
  candidate_vs_runner_classification: record?.candidate_vs_runner_classification ?? null,
  candidate_defect_status: record?.candidate_defect_status ?? null,
  candidate_hash_impact: record?.candidate_hash_impact ?? null,
  cleanup_result: record?.cleanup_result ?? null,
  next_action: record?.next_action ?? null,
  deployment_free: true,
  activation_free: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
