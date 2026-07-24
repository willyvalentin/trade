#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json";
const docPath =
  "docs/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-wrong-hash-rejection-remediation.md";
const action499Path =
  "docs/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-record.json";
const action492Path =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  addedPath: "lib/pure-confidence-calibration.ts",
  addedHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  nullPath:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json",
  nextAction: "action_501_candidate_rehearsal_failure_remediation_approval_gate",
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
for (const relativePath of [recordPath, docPath, action499Path, action492Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action499 = readJson(action499Path);
  const action492 = readJson(action492Path);

  failUnless(action499.approval_decision === "approved", "Action 499 approval mismatch", failures);
  failUnless(action499.next_action === "action_500_runtime_complete_candidate_build_rehearsal_retry_after_wrong_hash_rejection_remediation", "Action 499 next action mismatch", failures);
  failUnless(action492.new_change_candidate_hash === expected.changeHash, "Action 492 change hash mismatch", failures);
  failUnless(action492.new_full_candidate_inventory_hash === expected.fullHash, "Action 492 full hash mismatch", failures);

  failUnless(record.schema_version === "action_500_runtime_complete_candidate_build_rehearsal_retry_record_v1", "schema mismatch", failures);
  failUnless(record.source_action === 499, "source action mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path === expected.addedPath, "added path mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedHash, "added hash mismatch", failures);
  failUnless(record.safe_temp_subtree === "ture/action-500-confidence-calibration-projection-preview-runtime-complete-candidate-rehearsal", "temp subtree mismatch", failures);
  failUnless(record.temp_path_absolute_value_recorded === false, "absolute temp path recorded", failures);

  for (const [key, expectedValue] of Object.entries({
    path_safety_result: "path_safety_passed",
    source_reconstruction_result: "source_reconstruction_passed",
    runtime_dependency_closure_result: "runtime_dependency_closure_passed",
    source_integrity_result: "source_integrity_passed",
    source_safety_result: "source_safety_passed",
    preview_flag_verification_result: "preview_flag_disabled_verified",
    dependency_materialization_result: "passed_temporary_verified_node_modules_copy",
    cleanup_result: "cleanup_passed",
  })) {
    failUnless(record[key] === expectedValue, `${key} mismatch`, failures);
  }

  failUnless(record.source_inventory_missing_files === 0, "source files missing", failures);
  failUnless(record.source_inventory_hash_mismatches === 0, "source hash mismatches", failures);
  failUnless(record.recomputed_change_candidate_hash === expected.changeHash, "recomputed change hash mismatch", failures);
  failUnless(record.recomputed_full_candidate_inventory_hash === expected.fullHash, "recomputed full hash mismatch", failures);
  failUnless(record.runtime_dependency_paths_missing === 0, "runtime dependency paths missing", failures);
  failUnless(record.control_only_artifacts_excluded === true, "control artifacts included", failures);
  failUnless(record.source_safety_blocking_findings_count === 0, "source safety blocking findings", failures);
  failUnless(record.hash_mismatch_blocking === true, "hash mismatch not blocking", failures);
  failUnless(record.wrong_hash_fixture_result === "source_safety_aborted_artifact_mismatch", "wrong hash result mismatch", failures);
  failUnless(record.wrong_hash_fixture_hash_result === "hash_mismatch", "wrong hash hash-result mismatch", failures);
  failUnless(record.one_byte_mutation_result === "source_safety_aborted_artifact_mismatch", "one-byte mutation mismatch", failures);
  failUnless(record.content_swap_result === "source_safety_aborted_artifact_mismatch", "content swap mismatch", failures);
  failUnless(record.correct_schema_wrong_hash_result === "source_safety_aborted_artifact_mismatch", "schema override mismatch", failures);
  failUnless(record.correct_provenance_wrong_hash_result === "source_safety_aborted_artifact_mismatch", "provenance override mismatch", failures);
  failUnless(record.correct_classification_wrong_hash_result === "source_safety_aborted_artifact_mismatch", "classification override mismatch", failures);
  failUnless(record.missing_required_hash_result === "source_safety_aborted_artifact_mismatch", "missing hash mismatch", failures);
  failUnless(record.historical_null_hash_exception_path === expected.nullPath, "null hash path mismatch", failures);
  failUnless(record.null_hash_exception_generalized === false, "null hash generalized", failures);
  failUnless(record.preview_flag_helper_result === false, "preview helper result mismatch", failures);
  failUnless(record.alternate_activation_path_detected === false, "alternate activation detected", failures);
  failUnless(record.environment_restored === true, "environment not restored", failures);
  failUnless(record.network_used === false, "network used", failures);
  failUnless(record.install_performed === false, "install performed", failures);
  failUnless(record.dependency_update_performed === false, "dependency update performed", failures);
  failUnless(record.extraneous_local_package_count === 5, "extraneous count mismatch", failures);
  failUnless(record.extraneous_packages_excluded === true, "extraneous packages not excluded", failures);
  failUnless(record.extraneous_dependency_influence_result === "no_influence_detected", "extraneous influence mismatch", failures);
  failUnless(record.candidate_internal_required_paths_missing === 0, "internal paths missing", failures);

  failUnless(Array.isArray(record.candidate_command_results), "command results missing", failures);
  failUnless(record.candidate_command_results.length === 6, "command result count mismatch", failures);
  failUnless(record.candidate_command_results.slice(0, 5).every((command) => command.status === "passed"), "first five commands should pass", failures);
  const failedCommand = record.candidate_command_results[5];
  failUnless(failedCommand?.name === "npm run build", "failed command name mismatch", failures);
  failUnless(failedCommand?.status === "failed", "build command should fail", failures);
  failUnless(failedCommand?.failure_classification === "npm run build_failed", "build failure classification mismatch", failures);
  failUnless(record.candidate_commands_started === true, "commands not started", failures);
  failUnless(record.candidate_commands_completed === false, "commands should not complete", failures);
  failUnless(record.first_failed_candidate_command === "npm run build", "first failed command mismatch", failures);
  failUnless(record.candidate_removed === true, "candidate not removed", failures);
  failUnless(record.copied_node_modules_removed === true, "copied node_modules not removed", failures);
  failUnless(record.temporary_next_and_test_output_removed === true, "temporary output not removed", failures);
  failUnless(record.rehearsal_attempt_count === 1, "attempt count mismatch", failures);
  failUnless(record.same_action_rerun_allowed === false, "same-action rerun allowed", failures);
  failUnless(record.candidate_rehearsal_result === "full_candidate_rehearsal_failed", "candidate result mismatch", failures);
  failUnless(record.candidate_rehearsal_failure_reason === "npm run build_failed", "failure reason mismatch", failures);
  failUnless(record.external_evidence_result === "rehearsal_evidence_verified", "external evidence mismatch", failures);
  failUnless(record.overall_readiness === "blocked", "overall readiness mismatch", failures);
  failUnless(record.current_runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const key of [
    "raw_source_contents_recorded",
    "raw_secret_value_recorded",
    "raw_environment_value_recorded",
    "package_manifest_modified",
    "lockfile_modified",
    "configuration_modified",
    "candidate_source_modified",
    "source_dependency_tree_modified",
    "active_worktree_modified",
    "environment_modified",
    "deployment_performed",
    "netlify_operation_performed",
    "preview_activated",
    "production_changed",
    "persistence_created",
    "replay_created",
    "provider_called",
    "supabase_accessed",
    "feedback_created",
    "confidence_applied",
    "downstream_behavior_changed",
    "scanner_changed",
    "ranking_changed",
    "publication_changed",
    "execution_changed",
    "add_trade_changed",
    "risk_sizing_changed",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  for (const phrase of [
    "Action 500 executed the single local rehearsal attempt",
    "corrected bounded source-safety test matrix`: `passed`",
    "Wrong-hash fixture result: `source_safety_aborted_artifact_mismatch`",
    "Wrong-hash hash result: `hash_mismatch`",
    "npm run build`: `failed`",
    "Candidate rehearsal result: `full_candidate_rehearsal_failed`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_500_confidence_calibration_recommendation_advisory_projection_preview_runtime_complete_candidate_build_rehearsal_retry_after_wrong_hash_rejection_remediation",
  verification_status: failures.length === 0 ? "passed" : "failed",
  candidate_rehearsal_result: record?.candidate_rehearsal_result ?? null,
  first_failed_candidate_command: record?.first_failed_candidate_command ?? null,
  external_evidence_result: record?.external_evidence_result ?? null,
  overall_readiness: record?.overall_readiness ?? null,
  next_action: record?.next_action ?? null,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
