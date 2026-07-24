#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-record.json";
const docPath =
  "docs/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-gate.md";
const action498Path =
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
  blocker: "source_safety_checker_failed_to_reject_approved_artifact_hash_mismatch",
  failingCase: "source_safety_test_matrix_wrong_hash_case_not_blocked",
  mismatchResult: "source_safety_aborted_artifact_mismatch",
  nullHashPath:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json",
  nullHashPolicy:
    "action_492_retained_one_historical_30_file_overlay_static_inventory_null_hash_exception",
  nextAction:
    "action_500_runtime_complete_candidate_build_rehearsal_retry_after_wrong_hash_rejection_remediation",
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

function nullHashEntries(value, path = []) {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => nullHashEntries(item, path.concat(index)));
  }
  if (!value || typeof value !== "object") return [];

  const current =
    Object.prototype.hasOwnProperty.call(value, "sha256") && value.sha256 === null
      ? [{ path: path.join("."), value }]
      : [];

  return current.concat(
    Object.entries(value).flatMap(([key, item]) => nullHashEntries(item, path.concat(key))),
  );
}

const failures = [];
for (const relativePath of [recordPath, docPath, action498Path, action497Path, action492Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;

if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action498 = readJson(action498Path);
  const action497 = readJson(action497Path);
  const action492 = readJson(action492Path);

  failUnless(action498.candidate_rehearsal_result === "full_candidate_rehearsal_failed", "Action 498 result mismatch", failures);
  failUnless(action498.external_evidence_result === "rehearsal_evidence_verified", "Action 498 external evidence mismatch", failures);
  failUnless(action498.overall_readiness === "blocked", "Action 498 readiness mismatch", failures);
  failUnless(action498.rehearsal_attempt_count === 1, "Action 498 attempt count mismatch", failures);
  failUnless(action498.candidate_command_results?.[1]?.failure_classification === expected.failingCase, "Action 498 failing case mismatch", failures);
  failUnless(action497.approval_decision === "approved", "Action 497 approval mismatch", failures);
  failUnless(action492.new_change_candidate_hash === expected.changeHash, "Action 492 change hash mismatch", failures);
  failUnless(action492.new_full_candidate_inventory_hash === expected.fullHash, "Action 492 full hash mismatch", failures);

  failUnless(record.schema_version === "action_499_source_safety_wrong_hash_rejection_remediation_approval_record_v1", "schema version mismatch", failures);
  failUnless(record.source_action === 498, "source action mismatch", failures);
  failUnless(record.action_498_candidate_result === "full_candidate_rehearsal_failed", "record Action 498 result mismatch", failures);
  failUnless(record.action_498_external_evidence_result === "rehearsal_evidence_verified", "record external evidence mismatch", failures);
  failUnless(record.action_498_overall_readiness === "blocked", "record readiness mismatch", failures);
  failUnless(record.blocker_classification === expected.blocker, "blocker mismatch", failures);
  failUnless(record.failing_test_case === expected.failingCase, "failing test mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path === expected.addedPath, "added path mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedHash, "added hash mismatch", failures);
  failUnless(sha256(expected.addedPath) === expected.addedHash, "current added runtime hash mismatch", failures);

  const expectedPrecedence = [
    "exact_path_match",
    "exact_candidate_membership",
    "expected_hash_exists",
    "compute_bounded_actual_sha256",
    "compare_actual_versus_expected",
    "reject_immediately_on_mismatch",
    "evaluate_provenance_classification_and_bounded_schema_only_after_hash_match",
  ];
  failUnless(JSON.stringify(record.hash_verification_precedence) === JSON.stringify(expectedPrecedence), "hash precedence mismatch", failures);
  for (const value of [
    "hash_match",
    "hash_mismatch",
    "expected_hash_missing",
    "hash_not_required_by_frozen_policy",
    "hash_verification_failed",
  ]) {
    failUnless(record.hash_result_vocabulary.includes(value), `missing hash vocabulary: ${value}`, failures);
  }

  failUnless(record.hash_mismatch_blocking === true, "hash mismatch should block", failures);
  failUnless(record.hash_mismatch_result === expected.mismatchResult, "mismatch result mismatch", failures);
  failUnless(record.schema_can_override_hash_mismatch === false, "schema override allowed", failures);
  failUnless(record.provenance_can_override_hash_mismatch === false, "provenance override allowed", failures);
  failUnless(record.classification_can_override_hash_mismatch === false, "classification override allowed", failures);
  failUnless(record.path_membership_alone_authorizes_artifact === false, "path-only authorization allowed", failures);
  failUnless(record.missing_required_expected_hash_blocks === true, "missing required hash should block", failures);
  failUnless(record.content_normalization_before_hashing_allowed === false, "content normalization should not be allowed", failures);

  const nullHashes = nullHashEntries(action492);
  const matchingNullHash = nullHashes.filter((entry) => entry.value.path === expected.nullHashPath);
  failUnless(nullHashes.length === 1, "unexpected null hash exception count", failures);
  failUnless(matchingNullHash.length === 1, "exact null hash exception missing", failures);
  failUnless(record.historical_null_hash_exception_path === expected.nullHashPath, "null hash path mismatch", failures);
  failUnless(record.historical_null_hash_exception_policy === expected.nullHashPolicy, "null hash policy mismatch", failures);
  failUnless(record.historical_null_hash_exception_classification === "static_inventory", "null hash classification mismatch", failures);
  failUnless(record.historical_null_hash_exception_provenance === "historical_30_file_overlay_action_473", "null hash provenance mismatch", failures);
  failUnless(record.historical_null_hash_exception_source_classification === "historical_30_file_overlay", "null hash source classification mismatch", failures);
  failUnless(record.historical_null_hash_exception_approved_by_action_492 === true, "null hash Action 492 approval mismatch", failures);
  failUnless(record.historical_null_hash_exception_count === 1, "recorded null hash count mismatch", failures);
  failUnless(record.null_hash_exception_generalized === false, "null hash exception generalized", failures);
  failUnless(record.new_null_hash_exceptions_allowed === false, "new null hash exceptions allowed", failures);

  for (const [key, expectedValue] of Object.entries({
    approved_path_with_wrong_hash_blocks: true,
    one_byte_mutation_blocks: true,
    swapped_approved_contents_block: true,
    correct_schema_wrong_hash_blocks: true,
    correct_provenance_wrong_hash_blocks: true,
    correct_classification_wrong_hash_blocks: true,
    missing_required_expected_hash_blocks: true,
    wrong_line_endings_when_byte_hash_differs_block: true,
    expected_source_safety_result: expected.mismatchResult,
    expected_hash_result: "hash_mismatch",
    raw_contents_recorded: false,
    raw_secret_values_recorded: false,
  })) {
    failUnless(record.corrected_negative_test_semantics?.[key] === expectedValue, `negative semantic mismatch: ${key}`, failures);
  }

  for (const [key, expectedValue] of Object.entries({
    approved_exact_path_with_correct_hash_passes: true,
    approved_exact_path_with_correct_provenance_classification_schema_passes_after_hash_match: true,
    exact_frozen_null_hash_exception_passes_with_alternate_integrity_evidence: true,
    advisory_filename_word_with_correct_hash_remains_advisory: true,
    ordinary_whitespace_policy_text_remains_non_secret_evidence: true,
  })) {
    failUnless(record.corrected_positive_test_semantics?.[key] === expectedValue, `positive semantic mismatch: ${key}`, failures);
  }

  for (const key of [
    "action_497_source_safety_precedence_preserved",
    "advisory_filename_behavior_preserved",
    "real_secret_file_rejection_preserved",
    "prohibited_environment_files_fail_closed",
    "unknown_sensitive_files_fail_closed",
    "future_rehearsal_retry_required",
  ]) {
    failUnless(record[key] === true, `${key} should be true`, failures);
  }

  for (const key of [
    "raw_source_contents_recorded",
    "raw_secret_values_recorded",
    "candidate_or_hash_change_required",
    "candidate_hashes_changed",
    "candidate_file_count_changed",
    "preview_helper_semantics_changed",
    "package_manifest_change_required",
    "lockfile_change_required",
    "environment_change_required",
    "same_action_rehearsal_rerun_authorized",
    "rehearsal_authorized",
    "deployment_authorized",
    "activation_authorized",
    "network_authorized",
    "install_authorized",
    "netlify_operation_authorized",
    "provider_call_authorized",
    "supabase_access_authorized",
    "persistence_authorized",
    "replay_authorized",
    "confidence_application_authorized",
    "feedback_authorized",
    "downstream_behavior_change_authorized",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.future_rehearsal_retry_count_required === 1, "future retry count mismatch", failures);
  failUnless(record.future_rehearsal_execution_order.length === 7, "future execution order length mismatch", failures);
  failUnless(record.approval_decision === "approved", "approval decision mismatch", failures);
  failUnless(Array.isArray(record.unresolved_conditions) && record.unresolved_conditions.length === 0, "unresolved conditions present", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    expected.blocker,
    expected.failingCase,
    expected.changeHash,
    expected.fullHash,
    expected.nullHashPath,
    expected.mismatchResult,
    expected.nextAction,
    "Approval decision: `approved`",
    "No second attempt is authorized",
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_499_confidence_calibration_recommendation_advisory_projection_preview_source_safety_wrong_hash_rejection_remediation_approval_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  approval_decision: record?.approval_decision ?? null,
  blocker_classification: record?.blocker_classification ?? null,
  failing_test_case: record?.failing_test_case ?? null,
  hash_mismatch_result: record?.hash_mismatch_result ?? null,
  historical_null_hash_exception_path: record?.historical_null_hash_exception_path ?? null,
  next_action: record?.next_action ?? null,
  rehearsal_free: true,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  environment_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
