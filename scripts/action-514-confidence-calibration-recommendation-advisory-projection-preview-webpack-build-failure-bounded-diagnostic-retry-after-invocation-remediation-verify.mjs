#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-record.json";
const docPath =
  "docs/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-after-invocation-remediation.md";
const action513Path =
  "docs/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  addedRuntimeHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  nextAction: "action_515_candidate_build_source_remediation",
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
for (const relativePath of [recordPath, docPath, action513Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const action513 = readJson(action513Path);
  const doc = read(docPath);

  failUnless(action513.approval_decision === "approved", "Action 513 approval mismatch", failures);
  failUnless(action513.precheck_readiness === "webpack_invocation_runtime_precheck_ready", "Action 513 readiness mismatch", failures);
  failUnless(action513.selected_invocation_model === "direct_local_node_cli_invocation", "Action 513 invocation mismatch", failures);

  failUnless(record.schema_version === "action_514_webpack_build_failure_bounded_diagnostic_retry_record_v1", "schema mismatch", failures);
  failUnless(record.source_action === 513, "source action mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === 31, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedRuntimeHash, "added runtime hash mismatch", failures);
  failUnless(record.selected_invocation_model === "direct_local_node_cli_invocation", "selected invocation mismatch", failures);
  failUnless(record.semantic_command === "next build --webpack", "semantic command mismatch", failures);
  failUnless(record.diagnostic_attempt_count === 1, "diagnostic attempt count mismatch", failures);
  failUnless(record.authoritative_build_attempt_count === 0, "authoritative attempt count mismatch", failures);
  failUnless(record.same_action_retry_performed === false, "same action retry mismatch", failures);

  for (const [key, value] of Object.entries({
    safe_path: "passed",
    reconstruction: "passed",
    runtime_closure: "passed",
    source_inventory: "passed",
    source_integrity: "passed",
    source_safety: "source_safety_passed",
    strict_wrong_hash_matrix: "passed",
    historical_null_hash_exception: "exact_and_bounded",
    preview_flag: "preview_flag_disabled_verified",
    alternate_activation: false,
    environment_restored: true,
  })) {
    failUnless(record.prerequisite_gate_results[key] === value, `${key} gate mismatch`, failures);
  }

  failUnless(record.dependency_materialization_result === "passed_temporary_verified_node_modules_copy", "dependency materialization mismatch", failures);
  failUnless(record.candidate_local_next_cli_present === true, "candidate Next CLI missing", failures);
  failUnless(record.next_version_classification === "16.2.6", "Next version mismatch", failures);
  failUnless(record.source_node_modules_unchanged_bounded === true, "source node_modules changed", failures);
  failUnless(record.extraneous_packages_excluded === true, "extraneous package exclusion mismatch", failures);
  failUnless(record.runtime_resolution_precheck_result === "passed", "runtime precheck mismatch", failures);
  failUnless(record.parent_node_runtime_resolves === true, "parent node resolution mismatch", failures);
  failUnless(record.candidate_local_next_cli_resolves === true, "candidate cli resolution mismatch", failures);
  failUnless(record.global_next_cli_used === false, "global Next CLI should be false", failures);

  failUnless(record.process_start_result === "direct_node_cli_process_started", "process start mismatch", failures);
  failUnless(record.next_cli_started === true, "Next CLI should start", failures);
  failUnless(record.webpack_compilation_started === true, "Webpack should start", failures);
  failUnless(record.webpack_passed === false, "Webpack should fail", failures);
  failUnless(record.webpack_exit_code === 1, "Webpack exit mismatch", failures);
  failUnless(record.webpack_signal_classification === "none", "signal mismatch", failures);
  failUnless(record.invocation_outcome === "invocation_remediation_succeeded_compilation_started", "invocation outcome mismatch", failures);

  failUnless(record.webpack_subsystem === "webpack_typescript_validation", "subsystem mismatch", failures);
  failUnless(record.primary_error_class === "webpack_candidate_typescript_error", "primary error class mismatch", failures);
  failUnless(record.first_causal_error.repository_relative_path === "app/api/recommendations/evaluate-outcomes/route.ts", "first causal path mismatch", failures);
  failUnless(record.first_causal_error.module_reference === "buildOutcomeEligibility", "module reference mismatch", failures);
  failUnless(record.implicated_paths.length === 1, "implicated path count mismatch", failures);
  failUnless(record.implicated_paths[0].path_classification === "clean_base_file", "path classification mismatch", failures);
  failUnless(includesAll(record.module_references, ["buildOutcomeEligibility"]), "module references mismatch", failures);
  failUnless(record.sanitized_diagnostic_lines.length <= 12, "too many retained lines", failures);
  failUnless(record.sanitized_diagnostic_lines.some((line) => line.includes("not a valid Route export field")), "missing route export diagnostic", failures);

  for (const key of [
    "raw_path_recorded",
    "raw_logs_retained",
    "raw_environment_values_recorded",
    "credential_values_recorded",
    "absolute_machine_paths_recorded",
    "source_contents_recorded",
    "candidate_modified",
    "package_or_lockfile_modified",
    "configuration_modified",
    "environment_modified",
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

  failUnless(record.candidate_vs_runner_classification === "candidate_source_build_defect", "candidate-vs-runner mismatch", failures);
  failUnless(record.dual_failure_relationship === "independent_build_engine_failures", "dual relationship mismatch", failures);
  failUnless(record.candidate_defect_status === "candidate_defect_proven", "candidate defect status mismatch", failures);
  failUnless(record.candidate_hash_impact === "candidate_hash_change_required", "candidate hash impact mismatch", failures);
  failUnless(record.cleanup_result === "cleanup_passed", "cleanup mismatch", failures);
  failUnless(record.candidate_removed === true, "candidate removal mismatch", failures);
  failUnless(record.copied_node_modules_removed === true, "copied node_modules removal mismatch", failures);
  failUnless(record.diagnostic_result === "webpack_diagnostic_failure_captured", "diagnostic result mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  failUnless(includesAll(record.diagnostic_result_vocabulary, ["webpack_diagnostic_failure_captured", "webpack_diagnostic_passed_unexpectedly", "webpack_diagnostic_aborted", "webpack_diagnostic_capture_failed"]), "diagnostic vocabulary mismatch", failures);

  for (const phrase of [
    "Diagnostic attempt count: `1`",
    "Webpack compilation started: `true`",
    "Candidate-versus-runner classification: `candidate_source_build_defect`",
    "Candidate hash impact: `candidate_hash_change_required`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_514_confidence_calibration_recommendation_advisory_projection_preview_webpack_build_failure_bounded_diagnostic_retry_after_invocation_remediation",
  verification_status: failures.length === 0 ? "passed" : "failed",
  diagnostic_attempt_count: record?.diagnostic_attempt_count ?? null,
  authoritative_build_attempt_count: record?.authoritative_build_attempt_count ?? null,
  next_cli_started: record?.next_cli_started ?? null,
  webpack_compilation_started: record?.webpack_compilation_started ?? null,
  webpack_passed: record?.webpack_passed ?? null,
  invocation_outcome: record?.invocation_outcome ?? null,
  webpack_subsystem: record?.webpack_subsystem ?? null,
  primary_error_class: record?.primary_error_class ?? null,
  candidate_vs_runner_classification: record?.candidate_vs_runner_classification ?? null,
  dual_failure_relationship: record?.dual_failure_relationship ?? null,
  candidate_defect_status: record?.candidate_defect_status ?? null,
  candidate_hash_impact: record?.candidate_hash_impact ?? null,
  cleanup_result: record?.cleanup_result ?? null,
  diagnostic_result: record?.diagnostic_result ?? null,
  deployment_free: true,
  activation_free: true,
  credential_value_free: true,
  next_action: record?.next_action ?? null,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
