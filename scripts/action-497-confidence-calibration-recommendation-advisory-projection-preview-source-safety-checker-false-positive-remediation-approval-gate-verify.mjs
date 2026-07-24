#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const docPath =
  "docs/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-gate.md";
const recordPath =
  "docs/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-record.json";
const action496Path =
  "docs/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json";
const action495Path =
  "docs/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-record.json";
const action492Path =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  addedPath: "lib/pure-confidence-calibration.ts",
  addedHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  blocker:
    "source_safety_checker_applied_non_authoritative_filename_or_whitespace_indicators_as_hard_failure",
  action496Abort:
    "source_safety_rehearsal_checker_treated_non_authoritative_filename_and_whitespace_indicators_as_hard_blockers",
  nextAction:
    "action_498_runtime_complete_candidate_build_rehearsal_retry_after_source_safety_checker_remediation",
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
for (const relativePath of [docPath, recordPath, action496Path, action495Path, action492Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

if (failures.length === 0) {
  const doc = read(docPath);
  const record = readJson(recordPath);
  const action496 = readJson(action496Path);
  const action495 = readJson(action495Path);
  const action492 = readJson(action492Path);

  failUnless(action496.candidate_rehearsal_result === "full_candidate_rehearsal_aborted", "Action 496 candidate result mismatch", failures);
  failUnless(action496.external_evidence_result === "rehearsal_evidence_verified", "Action 496 evidence mismatch", failures);
  failUnless(action496.overall_readiness === "blocked", "Action 496 readiness mismatch", failures);
  failUnless(action496.rehearsal_attempt_count === 1, "Action 496 attempt count mismatch", failures);
  failUnless(action496.path_safety_result === "path_safety_passed", "Action 496 path safety mismatch", failures);
  failUnless(action496.source_reconstruction_result === "source_reconstruction_passed", "Action 496 reconstruction mismatch", failures);
  failUnless(action496.runtime_dependency_closure_result === "runtime_dependency_closure_passed", "Action 496 runtime closure mismatch", failures);
  failUnless(action496.dependency_materialization_result === "not_started_aborted_before_dependency_copy", "Action 496 dependency result mismatch", failures);
  failUnless(action496.candidate_commands_started === false, "Action 496 commands started", failures);
  failUnless(action496.cleanup_result === "cleanup_passed", "Action 496 cleanup mismatch", failures);
  failUnless(action496.candidate_rehearsal_abort_reason === expected.action496Abort, "Action 496 abort reason mismatch", failures);
  failUnless(action495.approval_decision === "approved", "Action 495 approval mismatch", failures);
  failUnless(action492.new_change_candidate_hash === expected.changeHash, "Action 492 change hash mismatch", failures);

  failUnless(record.source_action === 496, "source action mismatch", failures);
  failUnless(record.action_496_candidate_result === action496.candidate_rehearsal_result, "recorded Action 496 result mismatch", failures);
  failUnless(record.action_496_external_evidence_result === action496.external_evidence_result, "recorded Action 496 evidence mismatch", failures);
  failUnless(record.action_496_overall_readiness === action496.overall_readiness, "recorded Action 496 readiness mismatch", failures);
  failUnless(record.blocker_classification === expected.blocker, "blocker classification mismatch", failures);
  failUnless(record.action_496_recorded_abort_reason === expected.action496Abort, "recorded abort reason mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path === expected.addedPath, "added path mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedHash, "added hash mismatch", failures);
  failUnless(sha256(expected.addedPath) === expected.addedHash, "current added runtime hash mismatch", failures);

  failUnless(Array.isArray(record.false_positive_findings), "false positive findings missing", failures);
  failUnless(record.false_positive_findings.length === 10, "false positive finding count mismatch", failures);
  failUnless(record.action_496_reported_sensitive_filename_count === 9, "reported sensitive filename count mismatch", failures);
  failUnless(record.action_496_reported_whitespace_or_format_count === 2465, "reported whitespace count mismatch", failures);
  const findingClasses = new Set(record.false_positive_findings.map((finding) => finding.triggering_indicator_class));
  failUnless(findingClasses.has("sensitive_filename_word"), "missing sensitive filename finding", failures);
  failUnless(findingClasses.has("whitespace_or_format_pattern"), "missing whitespace finding", failures);
  for (const finding of record.false_positive_findings) {
    failUnless(typeof finding.repository_relative_path === "string", "finding path missing", failures);
    failUnless(finding.exact_prohibited_path_or_type_matched === false, `finding should not match prohibited path: ${finding.repository_relative_path}`, failures);
    failUnless(finding.actual_prohibited_schema_field_matched === false, `finding should not match prohibited schema: ${finding.repository_relative_path}`, failures);
    failUnless(!("raw_value" in finding), `finding records raw value: ${finding.repository_relative_path}`, failures);
  }

  failUnless(record.classification_precedence.length === 5, "classification precedence length mismatch", failures);
  failUnless(record.classification_precedence[0].name === "exact_prohibited_path_or_type", "level 1 precedence mismatch", failures);
  failUnless(record.classification_precedence[0].disposition === "reject", "level 1 must reject", failures);
  failUnless(record.classification_precedence[1].name === "exact_approved_candidate_artifact", "level 2 precedence mismatch", failures);
  failUnless(record.classification_precedence[3].name === "advisory_indicator", "level 4 precedence mismatch", failures);
  failUnless(record.classification_precedence[4].disposition === "fail_closed", "unknown sensitive files must fail closed", failures);

  for (const vocabulary of [
    "source_safety_passed",
    "source_safety_aborted_secret_detected",
    "source_safety_aborted_unknown_sensitive_file",
    "source_safety_aborted_artifact_mismatch",
    "source_safety_failed",
  ]) {
    failUnless(record.source_safety_vocabulary.includes(vocabulary), `missing source safety vocabulary: ${vocabulary}`, failures);
  }

  failUnless(record.exact_prohibited_path_policy.includes("fail_closed"), "prohibited path policy not fail closed", failures);
  failUnless(record.approved_artifact_policy.includes("exact_path"), "approved artifact policy missing exact path", failures);
  failUnless(record.approved_artifact_policy.includes("no_directory_wildcards"), "approved artifact policy allows broad wildcard", failures);
  failUnless(record.whitespace_policy.includes("not_secret_evidence"), "whitespace policy mismatch", failures);
  failUnless(record.unknown_sensitive_file_policy === "fail_closed", "unknown sensitive policy mismatch", failures);
  failUnless(record.secret_value_boundary.raw_secret_value_recorded === false, "raw secret recorded", failures);
  failUnless(record.secret_value_boundary.complete_environment_enumerated === false, "complete environment enumerated", failures);
  failUnless(record.secret_value_boundary.external_credential_store_inspected === false, "external credential store inspected", failures);
  failUnless(record.advisory_cases_required.length >= 8, "advisory test matrix incomplete", failures);
  failUnless(record.rejection_cases_required.length >= 10, "rejection test matrix incomplete", failures);

  failUnless(record.future_action_498_execution_order[0] === "phase_0_action_486_temp_path_policy", "Action 498 order phase 0 mismatch", failures);
  failUnless(record.future_action_498_execution_order[2] === "phase_1b_action_495_semantic_preview_flag_verification", "Action 498 flag phase mismatch", failures);
  failUnless(record.preserved_policies.candidate_hashes_unchanged === true, "candidate hashes not preserved", failures);
  failUnless(record.preserved_policies.deployment_activation_prohibited === true, "deployment policy not preserved", failures);

  for (const key of [
    "raw_secret_value_recorded",
    "candidate_or_hash_change_required",
    "source_safety_disable_required",
    "directory_wide_allowlist_required",
    "real_secret_files_allowed",
    "raw_value_inspection_required",
    "rehearsal_authorized",
    "build_authorized",
    "deployment_authorized",
    "activation_authorized",
    "netlify_operation_authorized",
    "network_used",
    "install_performed",
    "dependency_update_performed",
    "package_or_lockfile_modified",
    "candidate_modified",
    "helper_modified",
    "environment_modified",
    "persistence_created",
    "replay_created",
    "provider_called",
    "supabase_accessed",
    "feedback_created",
    "confidence_applied",
    "downstream_behavior_changed",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.approval_decision === "approved", "approval decision mismatch", failures);
  failUnless(record.unresolved_conditions.length === 0, "unresolved conditions present", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    expected.blocker,
    expected.changeHash,
    expected.fullHash,
    "Action 496 executed exactly one local rehearsal attempt",
    "unknown sensitive file outside the exact approved inventory: fail closed",
    "Approval decision: `approved`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_497_confidence_calibration_recommendation_advisory_projection_preview_source_safety_checker_false_positive_remediation_approval_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  approval_decision: failures.length === 0 ? readJson(recordPath).approval_decision : null,
  blocker_classification: failures.length === 0 ? readJson(recordPath).blocker_classification : null,
  next_action: failures.length === 0 ? readJson(recordPath).next_action : null,
  rehearsal_free: true,
  build_free: true,
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
