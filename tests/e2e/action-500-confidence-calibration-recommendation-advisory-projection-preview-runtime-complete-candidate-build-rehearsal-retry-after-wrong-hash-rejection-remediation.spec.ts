import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json";
const docPath =
  "docs/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-wrong-hash-rejection-remediation.md";
const verifierPath =
  "scripts/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-wrong-hash-rejection-remediation-verify.mjs";
const action499VerifierPath =
  "scripts/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-gate-verify.mjs";
const action498VerifierPath =
  "scripts/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-source-safety-checker-remediation-verify.mjs";

type Action500Record = {
  source_action: number;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  path_safety_result: string;
  source_reconstruction_result: string;
  runtime_dependency_closure_result: string;
  source_integrity_result: string;
  source_safety_result: string;
  wrong_hash_fixture_result: string;
  wrong_hash_fixture_hash_result: string;
  null_hash_exception_generalized: boolean;
  preview_flag_verification_result: string;
  preview_flag_helper_result: boolean;
  dependency_materialization_result: string;
  network_used: boolean;
  install_performed: boolean;
  dependency_update_performed: boolean;
  extraneous_packages_excluded: boolean;
  candidate_command_results: Array<{ name: string; status: string; failure_classification?: string }>;
  candidate_commands_completed: boolean;
  first_failed_candidate_command: string;
  cleanup_result: string;
  rehearsal_attempt_count: number;
  same_action_rerun_allowed: boolean;
  candidate_rehearsal_result: string;
  external_evidence_result: string;
  overall_readiness: string;
  next_action: string;
  current_runtime_preview_state: string;
  [key: string]: unknown;
};

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function runVerifier(relativePath: string): Record<string, unknown> {
  return JSON.parse(execFileSync("node", [relativePath], { cwd: root, encoding: "utf8" })) as Record<
    string,
    unknown
  >;
}

test.describe("Action 500 runtime-complete candidate build rehearsal retry", () => {
  test("records Action 499 approval and exact candidate bindings", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action500Record>(recordPath);
    expect(record.source_action).toBe(499);
    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("passes path, reconstruction, runtime closure, source integrity, and source safety gates", () => {
    const record = readJson<Action500Record>(recordPath);
    expect(record.path_safety_result).toBe("path_safety_passed");
    expect(record.source_reconstruction_result).toBe("source_reconstruction_passed");
    expect(record.runtime_dependency_closure_result).toBe("runtime_dependency_closure_passed");
    expect(record.source_integrity_result).toBe("source_integrity_passed");
    expect(record.source_safety_result).toBe("source_safety_passed");
  });

  test("proves strict wrong-hash rejection and bounded null-hash handling", () => {
    const record = readJson<Action500Record>(recordPath);
    expect(record.wrong_hash_fixture_result).toBe("source_safety_aborted_artifact_mismatch");
    expect(record.wrong_hash_fixture_hash_result).toBe("hash_mismatch");
    expect(record.one_byte_mutation_result).toBe("source_safety_aborted_artifact_mismatch");
    expect(record.content_swap_result).toBe("source_safety_aborted_artifact_mismatch");
    expect(record.correct_schema_wrong_hash_result).toBe("source_safety_aborted_artifact_mismatch");
    expect(record.correct_provenance_wrong_hash_result).toBe("source_safety_aborted_artifact_mismatch");
    expect(record.correct_classification_wrong_hash_result).toBe("source_safety_aborted_artifact_mismatch");
    expect(record.missing_required_hash_result).toBe("source_safety_aborted_artifact_mismatch");
    expect(record.invented_null_hash_result).toBe("source_safety_aborted_artifact_mismatch");
    expect(record.null_hash_wrong_path_result).toBe("source_safety_aborted_artifact_mismatch");
    expect(record.null_hash_exception_generalized).toBe(false);
  });

  test("keeps preview disabled and materializes dependencies without install/network/update", () => {
    const record = readJson<Action500Record>(recordPath);
    expect(record.preview_flag_verification_result).toBe("preview_flag_disabled_verified");
    expect(record.preview_flag_helper_result).toBe(false);
    expect(record.dependency_materialization_result).toBe("passed_temporary_verified_node_modules_copy");
    expect(record.network_used).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(record.dependency_update_performed).toBe(false);
    expect(record.extraneous_packages_excluded).toBe(true);
  });

  test("records serial commands and stops at build failure without retry", () => {
    const record = readJson<Action500Record>(recordPath);
    expect(record.candidate_command_results.map((command) => command.name)).toEqual([
      "candidate integrity confirmation",
      "corrected bounded source-safety test matrix",
      "bounded preview-flag helper test matrix",
      "npx next typegen",
      "npx tsc --noEmit",
      "npm run build",
    ]);
    expect(record.candidate_command_results.slice(0, 5).every((command) => command.status === "passed")).toBe(true);
    expect(record.candidate_command_results[5]).toMatchObject({
      name: "npm run build",
      status: "failed",
      failure_classification: "npm run build_failed",
    });
    expect(record.candidate_commands_completed).toBe(false);
    expect(record.first_failed_candidate_command).toBe("npm run build");
    expect(record.rehearsal_attempt_count).toBe(1);
    expect(record.same_action_rerun_allowed).toBe(false);
  });

  test("records cleanup, external evidence, blocked readiness, and no side effects", () => {
    const record = readJson<Action500Record>(recordPath);
    expect(record.cleanup_result).toBe("cleanup_passed");
    expect(record.candidate_removed).toBe(true);
    expect(record.copied_node_modules_removed).toBe(true);
    expect(record.candidate_rehearsal_result).toBe("full_candidate_rehearsal_failed");
    expect(record.external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(record.overall_readiness).toBe("blocked");
    for (const key of [
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
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("keeps runtime preview waiting and points to failure remediation gate", () => {
    const record = readJson<Action500Record>(recordPath);
    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe("action_501_candidate_rehearsal_failure_remediation_approval_gate");
  });

  test("verifier succeeds and Actions 498-499 remain healthy", () => {
    const action498 = runVerifier(action498VerifierPath);
    const action499 = runVerifier(action499VerifierPath);
    const action500 = runVerifier(verifierPath);
    expect(action498.verification_status).toBe("passed");
    expect(action499.verification_status).toBe("passed");
    expect(action500.verification_status).toBe("passed");
    expect(action500.candidate_rehearsal_result).toBe("full_candidate_rehearsal_failed");
  });

  test("documentation records the build failure and no activation boundary", () => {
    const doc = read(docPath);
    expect(doc).toContain("Wrong-hash fixture result: `source_safety_aborted_artifact_mismatch`");
    expect(doc).toContain("Wrong-hash hash result: `hash_mismatch`");
    expect(doc).toContain("`npm run build`: `failed`");
    expect(doc).toContain("Preview activated: `false`");
    expect(doc).toContain("action_501_candidate_rehearsal_failure_remediation_approval_gate");
  });
});
