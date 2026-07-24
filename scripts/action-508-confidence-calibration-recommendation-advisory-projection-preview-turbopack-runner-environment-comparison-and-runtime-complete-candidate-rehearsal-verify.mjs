#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-comparison-and-runtime-complete-candidate-rehearsal-record.json";
const docPath =
  "docs/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-runtime-complete-candidate-rehearsal.md";
const action507Path =
  "docs/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-record.json";

const expected = {
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  nextAction: "action_509_build_failure_specific_diagnosis_or_remediation_gate",
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
for (const relativePath of [recordPath, docPath, action507Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action507 = readJson(action507Path);

  failUnless(action507.approval_decision === "approved", "Action 507 approval mismatch", failures);
  failUnless(record.source_action === 507, "source action mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);

  for (const [key, value] of Object.entries({
    path_safety_result: "path_safety_passed",
    source_reconstruction_result: "source_reconstruction_passed",
    runtime_dependency_closure_result: "runtime_dependency_closure_passed",
    source_integrity_result: "source_integrity_passed",
    source_safety_result: "source_safety_passed",
    preview_flag_verification_result: "preview_flag_disabled_verified",
    dependency_materialization_result: "passed_temporary_verified_node_modules_copy",
  })) {
    failUnless(record[key] === value, `${key} mismatch`, failures);
  }

  failUnless(record.authoritative_build_command === "npm run build", "authoritative command mismatch", failures);
  failUnless(record.authoritative_build_attempt_count === 1, "authoritative attempt count mismatch", failures);
  failUnless(record.authoritative_build_result === "failed", "authoritative result mismatch", failures);
  failUnless(record.authoritative_build_phase === "build_bundling", "authoritative phase mismatch", failures);
  failUnless(record.authoritative_error_class === "process_resource_error", "authoritative error mismatch", failures);
  failUnless(record.authoritative_os_classification === "operation_not_permitted", "authoritative OS mismatch", failures);
  failUnless(record.authoritative_failure_classification === "same_turbopack_resource_failure", "authoritative classification mismatch", failures);
  failUnless(record.authoritative_implicated_paths.includes("app/globals.css"), "missing implicated path", failures);

  failUnless(record.comparison_invocation === "next build --webpack", "comparison invocation mismatch", failures);
  failUnless(record.comparison_attempt_count === 1, "comparison attempt count mismatch", failures);
  failUnless(record.comparison_build_result === "failed", "comparison result mismatch", failures);
  failUnless(record.comparison_build_phase === "build_bundling", "comparison phase mismatch", failures);
  failUnless(record.comparison_error_class === "type_or_compile_error", "comparison error mismatch", failures);
  failUnless(record.comparison_outcome === "turbopack_failed_comparison_failed", "comparison outcome mismatch", failures);
  failUnless(record.maximum_build_process_invocations === 2, "max invocation mismatch", failures);
  failUnless(record.second_authoritative_attempt_performed === false, "second authoritative attempt happened", failures);
  failUnless(record.comparison_retry_performed === false, "comparison retry happened", failures);
  failUnless(record.comparison_can_establish_deployment_readiness === false, "comparison readiness authority mismatch", failures);
  failUnless(record.authoritative_build_required_for_rehearsal_pass === true, "authoritative pass requirement mismatch", failures);

  failUnless(record.runner_classification === "broader_build_environment_failure", "runner classification mismatch", failures);
  failUnless(record.candidate_hash_impact === "candidate_hash_change_not_required", "hash impact mismatch", failures);
  failUnless(record.candidate_command_results.length === 6, "candidate command count mismatch", failures);
  failUnless(record.candidate_command_results.slice(0, 5).every((entry) => entry.status === "passed"), "pre-build commands did not pass", failures);
  failUnless(record.candidate_command_results[5]?.name === "npm run build", "build command record mismatch", failures);
  failUnless(record.candidate_command_results[5]?.status === "failed", "build command should fail", failures);

  for (const key of [
    "raw_logs_retained",
    "raw_environment_values_recorded",
    "credential_values_recorded",
    "absolute_machine_paths_recorded",
    "candidate_modified",
    "package_or_lockfile_modified",
    "configuration_modified",
    "source_dependency_tree_modified",
    "active_worktree_modified",
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

  failUnless(record.cleanup_result === "cleanup_passed", "cleanup mismatch", failures);
  failUnless(record.candidate_removed === true, "candidate not removed", failures);
  failUnless(record.copied_node_modules_removed === true, "node_modules not removed", failures);
  failUnless(record.candidate_rehearsal_result === "full_candidate_rehearsal_failed", "candidate result mismatch", failures);
  failUnless(record.external_evidence_result === "rehearsal_evidence_verified", "external evidence mismatch", failures);
  failUnless(record.overall_readiness === "blocked", "overall readiness mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Authoritative build result: `failed`",
    "Authoritative failure classification: `same_turbopack_resource_failure`",
    "Comparison build result: `failed`",
    "Comparison outcome: `turbopack_failed_comparison_failed`",
    "Runner classification: `broader_build_environment_failure`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_508_confidence_calibration_recommendation_advisory_projection_preview_turbopack_runner_environment_comparison_and_runtime_complete_candidate_rehearsal",
  verification_status: failures.length === 0 ? "passed" : "failed",
  authoritative_build_result: record?.authoritative_build_result ?? null,
  authoritative_failure_classification: record?.authoritative_failure_classification ?? null,
  comparison_build_result: record?.comparison_build_result ?? null,
  comparison_outcome: record?.comparison_outcome ?? null,
  runner_classification: record?.runner_classification ?? null,
  candidate_rehearsal_result: record?.candidate_rehearsal_result ?? null,
  overall_readiness: record?.overall_readiness ?? null,
  next_action: record?.next_action ?? null,
  deployment_free: true,
  activation_free: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
