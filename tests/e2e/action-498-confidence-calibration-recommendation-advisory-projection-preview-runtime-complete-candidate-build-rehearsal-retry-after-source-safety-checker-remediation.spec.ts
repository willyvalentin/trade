import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json";
const docPath =
  "docs/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-source-safety-checker-remediation.md";
const verifierPath =
  "scripts/action-498-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-source-safety-checker-remediation-verify.mjs";
const action497VerifierPath =
  "scripts/action-497-confidence-calibration-recommendation-advisory-projection-preview-source-safety-checker-false-positive-remediation-approval-gate-verify.mjs";
const action496VerifierPath =
  "scripts/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-preview-flag-remediation-verify.mjs";

const expected = {
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  nextAction: "action_499_source_safety_test_matrix_wrong_hash_rejection_remediation_approval_gate",
};

type Action498Record = {
  source_action: number;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  path_safety_result: string;
  source_reconstruction_result: string;
  runtime_dependency_closure_result: string;
  source_integrity_result: string;
  source_safety_result: string;
  source_safety_blocking_findings_count: number;
  raw_secret_value_recorded: boolean;
  preview_flag_helper_result: boolean;
  preview_flag_verification_result: string;
  dependency_materialization_result: string;
  extraneous_packages_excluded: boolean;
  candidate_command_results: Array<{ name: string; status: string; failure_classification?: string }>;
  candidate_commands_started: boolean;
  candidate_commands_completed: boolean;
  cleanup_result: string;
  rehearsal_attempt_count: number;
  candidate_rehearsal_result: string;
  candidate_rehearsal_failure_reason: string;
  external_evidence_result: string;
  overall_readiness: string;
  current_runtime_preview_state: string;
  next_action: string;
  [key: string]: unknown;
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

test.describe("Action 498 runtime-complete rehearsal retry after source-safety remediation", () => {
  test("records exact candidate bindings and passed pre-command gates", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action498Record>(recordPath);
    expect(record.source_action).toBe(497);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(31);
    expect(record.path_safety_result).toBe("path_safety_passed");
    expect(record.source_reconstruction_result).toBe("source_reconstruction_passed");
    expect(record.runtime_dependency_closure_result).toBe("runtime_dependency_closure_passed");
    expect(record.source_integrity_result).toBe("source_integrity_passed");
    expect(record.source_safety_result).toBe("source_safety_passed");
  });

  test("verifies source-safety, preview flag, and dependency materialization before command failure", () => {
    const record = readJson<Action498Record>(recordPath);
    expect(record.source_safety_blocking_findings_count).toBe(0);
    expect(record.raw_secret_value_recorded).toBe(false);
    expect(record.preview_flag_helper_result).toBe(false);
    expect(record.preview_flag_verification_result).toBe("preview_flag_disabled_verified");
    expect(record.dependency_materialization_result).toBe("passed_temporary_verified_node_modules_copy");
    expect(record.extraneous_packages_excluded).toBe(true);
  });

  test("records serial command failure at bounded source-safety test matrix", () => {
    const record = readJson<Action498Record>(recordPath);
    expect(record.candidate_commands_started).toBe(true);
    expect(record.candidate_commands_completed).toBe(false);
    expect(record.candidate_command_results).toHaveLength(2);
    expect(record.candidate_command_results[0]).toMatchObject({
      name: "candidate integrity confirmation",
      status: "passed",
    });
    expect(record.candidate_command_results[1]).toMatchObject({
      name: "bounded source-safety checker test matrix",
      status: "failed",
      failure_classification: "source_safety_test_matrix_wrong_hash_case_not_blocked",
    });
  });

  test("records no mutation, no deployment, no activation, and cleanup passed", () => {
    const record = readJson<Action498Record>(recordPath);
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
    ]) {
      expect(record[key]).toBe(false);
    }
    expect(record.cleanup_result).toBe("cleanup_passed");
    expect(record.candidate_removed).toBe(true);
    expect(record.copied_node_modules_removed).toBe(true);
  });

  test("records one failed attempt and blocker-specific next action", () => {
    const record = readJson<Action498Record>(recordPath);
    expect(record.rehearsal_attempt_count).toBe(1);
    expect(record.candidate_rehearsal_result).toBe("full_candidate_rehearsal_failed");
    expect(record.candidate_rehearsal_failure_reason).toBe("bounded source-safety checker test matrix_failed");
    expect(record.external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(record.overall_readiness).toBe("blocked");
    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe(expected.nextAction);
  });

  test("verifier succeeds and Actions 496-497 remain healthy", () => {
    const action496 = runVerifier(action496VerifierPath);
    const action497 = runVerifier(action497VerifierPath);
    const action498 = runVerifier(verifierPath);
    expect(action496.verification_status).toBe("passed");
    expect(action497.verification_status).toBe("passed");
    expect(action498.verification_status).toBe("passed");
    expect(action498.candidate_rehearsal_result).toBe("full_candidate_rehearsal_failed");
  });

  test("documentation reports the exact failure and no activation", () => {
    const doc = read(docPath);
    expect(doc).toContain("source_safety_test_matrix_wrong_hash_case_not_blocked");
    expect(doc).toContain("full_candidate_rehearsal_failed");
    expect(doc).toContain(expected.nextAction);
    expect(doc).toContain("Preview activated: `false`");
  });
});
