#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const docPath =
  "docs/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-source-safety-checker-remediation.md";
const recordPath =
  "docs/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json";
const action497Path =
  "docs/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-record.json";
const action492Path =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  addedPath: "lib/pure-confidence-calibration.ts",
  addedHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  nextAction: "action_499_source_safety_test_matrix_wrong_hash_rejection_remediation_approval_gate",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256(relativePath) {
  return createHash("sha256").update(readFileSync(join(repoRoot, relativePath))).digest("hex");
}

function failUnless(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];
for (const relativePath of [docPath, recordPath, action497Path, action492Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

if (failures.length === 0) {
  const doc = read(docPath);
  const record = readJson(recordPath);
  const action497 = readJson(action497Path);
  const action492 = readJson(action492Path);

  failUnless(action497.approval_decision === "approved", "Action 497 approval mismatch", failures);
  failUnless(action497.next_action === "action_498_runtime_complete_candidate_build_rehearsal_retry_after_source_safety_checker_remediation", "Action 497 next action mismatch", failures);
  failUnless(action492.new_change_candidate_hash === expected.changeHash, "Action 492 change hash mismatch", failures);
  failUnless(record.source_action === 497, "source action mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path === expected.addedPath, "added path mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedHash, "added hash mismatch", failures);
  failUnless(sha256(expected.addedPath) === expected.addedHash, "current added hash mismatch", failures);

  failUnless(record.path_safety_result === "path_safety_passed", "path safety did not pass", failures);
  failUnless(record.source_reconstruction_result === "source_reconstruction_passed", "reconstruction did not pass", failures);
  failUnless(record.runtime_dependency_closure_result === "runtime_dependency_closure_passed", "runtime closure did not pass", failures);
  failUnless(record.runtime_dependency_paths_missing === 0, "runtime paths missing", failures);
  failUnless(record.source_integrity_result === "source_integrity_passed", "source integrity did not pass", failures);
  failUnless(record.source_safety_result === "source_safety_passed", "source safety did not pass", failures);
  failUnless(record.source_safety_blocking_findings_count === 0, "source safety blocking findings present", failures);
  failUnless(record.raw_secret_value_recorded === false, "raw secret recorded", failures);
  failUnless(record.preview_flag_helper_result === false, "preview helper result mismatch", failures);
  failUnless(record.preview_flag_verification_result === "preview_flag_disabled_verified", "preview flag result mismatch", failures);
  failUnless(record.alternate_activation_path_detected === false, "alternate activation detected", failures);
  failUnless(record.raw_environment_value_recorded === false, "raw env recorded", failures);
  failUnless(record.environment_restored === true, "environment not restored", failures);
  failUnless(record.dependency_materialization_result === "passed_temporary_verified_node_modules_copy", "dependency copy did not pass", failures);
  failUnless(record.network_used === false, "network used", failures);
  failUnless(record.install_performed === false, "install performed", failures);
  failUnless(record.dependency_update_performed === false, "dependency update performed", failures);
  failUnless(record.extraneous_packages_excluded === true, "extraneous packages not excluded", failures);
  failUnless(record.candidate_internal_required_paths_missing === 0, "internal paths missing", failures);

  failUnless(record.candidate_command_results.length === 2, "unexpected command count", failures);
  failUnless(record.candidate_command_results[0].name === "candidate integrity confirmation", "first command mismatch", failures);
  failUnless(record.candidate_command_results[0].status === "passed", "first command did not pass", failures);
  failUnless(record.candidate_command_results[1].name === "bounded source-safety checker test matrix", "failed command mismatch", failures);
  failUnless(record.candidate_command_results[1].status === "failed", "source-safety matrix should fail", failures);
  failUnless(record.candidate_command_results[1].failure_classification === "source_safety_test_matrix_wrong_hash_case_not_blocked", "failure classification mismatch", failures);
  failUnless(record.candidate_commands_started === true, "candidate commands did not start", failures);
  failUnless(record.candidate_commands_completed === false, "candidate commands should not complete", failures);
  failUnless(record.runtime_projection_call_site_count === null, "call-site count should not be reached", failures);

  for (const key of [
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

  failUnless(record.cleanup_result === "cleanup_passed", "cleanup did not pass", failures);
  failUnless(record.candidate_removed === true, "candidate not removed", failures);
  failUnless(record.copied_node_modules_removed === true, "copied node_modules not removed", failures);
  failUnless(record.rehearsal_attempt_count === 1, "attempt count mismatch", failures);
  failUnless(record.same_action_rerun_allowed === false, "same-action rerun allowed", failures);
  failUnless(record.candidate_rehearsal_result === "full_candidate_rehearsal_failed", "candidate result mismatch", failures);
  failUnless(record.candidate_rehearsal_failure_reason === "bounded source-safety checker test matrix_failed", "failure reason mismatch", failures);
  failUnless(record.external_evidence_result === "rehearsal_evidence_verified", "external evidence mismatch", failures);
  failUnless(record.overall_readiness === "blocked", "overall readiness mismatch", failures);
  failUnless(record.current_runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    expected.changeHash,
    expected.fullHash,
    "source_safety_test_matrix_wrong_hash_case_not_blocked",
    "full_candidate_rehearsal_failed",
    "rehearsal_evidence_verified",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_498_confidence_calibration_recommendation_advisory_projection_preview_runtime_complete_candidate_build_rehearsal_retry_after_source_safety_checker_remediation",
  verification_status: failures.length === 0 ? "passed" : "failed",
  candidate_rehearsal_result: failures.length === 0 ? readJson(recordPath).candidate_rehearsal_result : null,
  external_evidence_result: failures.length === 0 ? readJson(recordPath).external_evidence_result : null,
  overall_readiness: failures.length === 0 ? readJson(recordPath).overall_readiness : null,
  next_action: failures.length === 0 ? readJson(recordPath).next_action : null,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  environment_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
