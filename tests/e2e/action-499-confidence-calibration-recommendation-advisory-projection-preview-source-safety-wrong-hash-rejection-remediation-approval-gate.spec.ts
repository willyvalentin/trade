import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-record.json";
const docPath =
  "docs/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-gate.md";
const verifierPath =
  "scripts/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-gate-verify.mjs";
const action498RecordPath =
  "docs/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json";
const action498VerifierPath =
  "scripts/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-source-safety-checker-remediation-verify.mjs";
const action497VerifierPath =
  "scripts/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-gate-verify.mjs";
const action492VerifierPath =
  "scripts/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-reconstruction-and-hash-freeze-verify.mjs";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  blocker: "source_safety_checker_failed_to_reject_approved_artifact_hash_mismatch",
  failingCase: "source_safety_test_matrix_wrong_hash_case_not_blocked",
  mismatchResult: "source_safety_aborted_artifact_mismatch",
  nullHashPath:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json",
  nextAction:
    "action_500_runtime_complete_candidate_build_rehearsal_retry_after_wrong_hash_rejection_remediation",
};

type Action499Record = {
  source_action: number;
  action_498_candidate_result: string;
  action_498_external_evidence_result: string;
  action_498_overall_readiness: string;
  blocker_classification: string;
  failing_test_case: string;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  hash_verification_precedence: string[];
  hash_result_vocabulary: string[];
  hash_mismatch_blocking: boolean;
  hash_mismatch_result: string;
  schema_can_override_hash_mismatch: boolean;
  provenance_can_override_hash_mismatch: boolean;
  classification_can_override_hash_mismatch: boolean;
  missing_required_expected_hash_blocks: boolean;
  historical_null_hash_exception_path: string;
  historical_null_hash_exception_policy: string;
  historical_null_hash_exception_classification: string;
  historical_null_hash_exception_provenance: string;
  historical_null_hash_exception_count: number;
  null_hash_exception_generalized: boolean;
  corrected_negative_test_semantics: Record<string, unknown>;
  corrected_positive_test_semantics: Record<string, unknown>;
  action_497_source_safety_precedence_preserved: boolean;
  advisory_filename_behavior_preserved: boolean;
  real_secret_file_rejection_preserved: boolean;
  future_rehearsal_retry_count_required: number;
  rehearsal_authorized: boolean;
  deployment_authorized: boolean;
  activation_authorized: boolean;
  approval_decision: string;
  unresolved_conditions: string[];
  runtime_preview_state: string;
  next_action: string;
  [key: string]: unknown;
};

type Action498Record = {
  candidate_rehearsal_result: string;
  external_evidence_result: string;
  overall_readiness: string;
  candidate_command_results: Array<{ failure_classification?: string }>;
};

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function runVerifier(relativePath: string): Record<string, unknown> {
  return JSON.parse(
    execFileSync("node", [relativePath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 128 * 1024 * 1024,
    }),
  ) as Record<string, unknown>;
}

test.describe("Action 499 source-safety wrong-hash rejection remediation approval gate", () => {
  test("records Action 498 failed result, exact blocker, and candidate bindings", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const action498 = readJson<Action498Record>(action498RecordPath);
    const record = readJson<Action499Record>(recordPath);
    expect(action498.candidate_rehearsal_result).toBe("full_candidate_rehearsal_failed");
    expect(action498.external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(action498.overall_readiness).toBe("blocked");
    expect(action498.candidate_command_results[1].failure_classification).toBe(expected.failingCase);

    expect(record.source_action).toBe(498);
    expect(record.action_498_candidate_result).toBe("full_candidate_rehearsal_failed");
    expect(record.action_498_external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(record.action_498_overall_readiness).toBe("blocked");
    expect(record.blocker_classification).toBe(expected.blocker);
    expect(record.failing_test_case).toBe(expected.failingCase);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(31);
  });

  test("freezes authoritative hash precedence and mismatch result vocabulary", () => {
    const record = readJson<Action499Record>(recordPath);
    expect(record.hash_verification_precedence).toEqual([
      "exact_path_match",
      "exact_candidate_membership",
      "expected_hash_exists",
      "compute_bounded_actual_sha256",
      "compare_actual_versus_expected",
      "reject_immediately_on_mismatch",
      "evaluate_provenance_classification_and_bounded_schema_only_after_hash_match",
    ]);
    expect(record.hash_result_vocabulary).toEqual([
      "hash_match",
      "hash_mismatch",
      "expected_hash_missing",
      "hash_not_required_by_frozen_policy",
      "hash_verification_failed",
    ]);
    expect(record.hash_mismatch_blocking).toBe(true);
    expect(record.hash_mismatch_result).toBe(expected.mismatchResult);
    expect(record.schema_can_override_hash_mismatch).toBe(false);
    expect(record.provenance_can_override_hash_mismatch).toBe(false);
    expect(record.classification_can_override_hash_mismatch).toBe(false);
    expect(record.missing_required_expected_hash_blocks).toBe(true);
  });

  test("requires wrong hash, one-byte mutation, swapped content, and missing required hash rejection", () => {
    const negative = readJson<Action499Record>(recordPath).corrected_negative_test_semantics;
    expect(negative.approved_path_with_wrong_hash_blocks).toBe(true);
    expect(negative.one_byte_mutation_blocks).toBe(true);
    expect(negative.swapped_approved_contents_block).toBe(true);
    expect(negative.correct_schema_wrong_hash_blocks).toBe(true);
    expect(negative.correct_provenance_wrong_hash_blocks).toBe(true);
    expect(negative.correct_classification_wrong_hash_blocks).toBe(true);
    expect(negative.missing_required_expected_hash_blocks).toBe(true);
    expect(negative.wrong_line_endings_when_byte_hash_differs_block).toBe(true);
    expect(negative.expected_source_safety_result).toBe(expected.mismatchResult);
    expect(negative.expected_hash_result).toBe("hash_mismatch");
  });

  test("preserves correct-hash acceptance and exact frozen null-hash exception only", () => {
    const record = readJson<Action499Record>(recordPath);
    expect(record.corrected_positive_test_semantics.approved_exact_path_with_correct_hash_passes).toBe(true);
    expect(
      record.corrected_positive_test_semantics
        .approved_exact_path_with_correct_provenance_classification_schema_passes_after_hash_match,
    ).toBe(true);
    expect(
      record.corrected_positive_test_semantics
        .exact_frozen_null_hash_exception_passes_with_alternate_integrity_evidence,
    ).toBe(true);
    expect(record.historical_null_hash_exception_path).toBe(expected.nullHashPath);
    expect(record.historical_null_hash_exception_policy).toBe(
      "action_492_retained_one_historical_30_file_overlay_static_inventory_null_hash_exception",
    );
    expect(record.historical_null_hash_exception_classification).toBe("static_inventory");
    expect(record.historical_null_hash_exception_provenance).toBe("historical_30_file_overlay_action_473");
    expect(record.historical_null_hash_exception_count).toBe(1);
    expect(record.null_hash_exception_generalized).toBe(false);
  });

  test("preserves Action 497 advisory and prohibited policies without raw values", () => {
    const record = readJson<Action499Record>(recordPath);
    expect(record.action_497_source_safety_precedence_preserved).toBe(true);
    expect(record.advisory_filename_behavior_preserved).toBe(true);
    expect(record.real_secret_file_rejection_preserved).toBe(true);
    expect(record.prohibited_environment_files_fail_closed).toBe(true);
    expect(record.unknown_sensitive_files_fail_closed).toBe(true);
    expect(record.raw_source_contents_recorded).toBe(false);
    expect(record.raw_secret_values_recorded).toBe(false);
  });

  test("preserves candidate policy and blocks rehearsal, deployment, activation, and side effects", () => {
    const record = readJson<Action499Record>(recordPath);
    for (const key of [
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
      expect(record[key]).toBe(false);
    }
  });

  test("approves exactly one future Action 500 retry and keeps runtime preview waiting", () => {
    const record = readJson<Action499Record>(recordPath);
    expect(record.future_rehearsal_retry_count_required).toBe(1);
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe(expected.nextAction);
  });

  test("verifier succeeds and Actions 492, 497, and 498 remain healthy", () => {
    const action492 = runVerifier(action492VerifierPath);
    const action497 = runVerifier(action497VerifierPath);
    const action498 = runVerifier(action498VerifierPath);
    const action499 = runVerifier(verifierPath);
    expect(action492.status).toBe("passed");
    expect(action497.verification_status).toBe("passed");
    expect(action498.verification_status).toBe("passed");
    expect(action499.verification_status).toBe("passed");
    expect(action499.approval_decision).toBe("approved");
  });

  test("documentation captures the gate and no activation boundary", () => {
    const doc = read(docPath);
    expect(doc).toContain(expected.blocker);
    expect(doc).toContain(expected.failingCase);
    expect(doc).toContain(expected.mismatchResult);
    expect(doc).toContain(expected.nullHashPath);
    expect(doc).toContain("Approval decision: `approved`");
    expect(doc).toContain("No second attempt is authorized");
    expect(doc).toContain(expected.nextAction);
  });
});
