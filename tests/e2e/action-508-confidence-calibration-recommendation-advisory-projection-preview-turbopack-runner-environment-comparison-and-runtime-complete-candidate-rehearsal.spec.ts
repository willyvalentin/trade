import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-comparison-and-runtime-complete-candidate-rehearsal-record.json";
const docPath =
  "docs/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-runtime-complete-candidate-rehearsal.md";
const verifierPath =
  "scripts/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-runtime-complete-candidate-rehearsal-verify.mjs";
const action506VerifierPath =
  "scripts/action-506-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-comparison-and-rehearsal-gate-verify.mjs";
const action507VerifierPath =
  "scripts/action-507-confidence-calibration-recommendation-advisory-projection-preview-turbopack-comparison-invocation-completion-gate-verify.mjs";

type Action508Record = {
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  path_safety_result: string;
  source_reconstruction_result: string;
  runtime_dependency_closure_result: string;
  source_integrity_result: string;
  source_safety_result: string;
  preview_flag_verification_result: string;
  dependency_materialization_result: string;
  authoritative_build_attempt_count: number;
  authoritative_build_result: string;
  authoritative_failure_classification: string;
  comparison_attempt_count: number;
  comparison_build_result: string;
  comparison_error_class: string;
  comparison_outcome: string;
  maximum_build_process_invocations: number;
  second_authoritative_attempt_performed: boolean;
  comparison_retry_performed: boolean;
  runner_classification: string;
  candidate_hash_impact: string;
  candidate_command_results: Array<Record<string, unknown>>;
  cleanup_result: string;
  external_evidence_result: string;
  candidate_rehearsal_result: string;
  overall_readiness: string;
  runtime_preview_state: string;
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
  return JSON.parse(execFileSync("node", [relativePath], { cwd: root, encoding: "utf8" })) as Record<string, unknown>;
}

test.describe("Action 508 Turbopack comparison runtime-complete rehearsal", () => {
  test("binds Action 507 approval and exact candidate bindings", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action508Record>(recordPath);
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("records safe path, reconstruction, and prerequisite gates", () => {
    const record = readJson<Action508Record>(recordPath);
    expect(record.safe_temp_subtree).toBe("ture/action-508-confidence-calibration-projection-preview-turbopack-comparison-rehearsal");
    expect(record.path_safety_result).toBe("path_safety_passed");
    expect(record.source_reconstruction_result).toBe("source_reconstruction_passed");
    expect(record.runtime_dependency_closure_result).toBe("runtime_dependency_closure_passed");
    expect(record.source_integrity_result).toBe("source_integrity_passed");
    expect(record.source_safety_result).toBe("source_safety_passed");
    expect(record.preview_flag_verification_result).toBe("preview_flag_disabled_verified");
    expect(record.dependency_materialization_result).toBe("passed_temporary_verified_node_modules_copy");
  });

  test("runs authoritative first and triggers one comparison for same Turbopack resource failure", () => {
    const record = readJson<Action508Record>(recordPath);
    expect(record.authoritative_build_attempt_count).toBe(1);
    expect(record.authoritative_build_result).toBe("failed");
    expect(record.authoritative_failure_classification).toBe("same_turbopack_resource_failure");
    expect(record.comparison_attempt_count).toBe(1);
    expect(record.comparison_invocation).toBe("next build --webpack");
  });

  test("records Webpack comparison failure and broader build-environment classification", () => {
    const record = readJson<Action508Record>(recordPath);
    expect(record.comparison_build_result).toBe("failed");
    expect(record.comparison_error_class).toBe("type_or_compile_error");
    expect(record.comparison_outcome).toBe("turbopack_failed_comparison_failed");
    expect(record.runner_classification).toBe("broader_build_environment_failure");
  });

  test("freezes alternate outcome vocabularies", () => {
    const record = readJson<Action508Record>(recordPath);
    expect(record.comparison_outcome_vocabulary).toContain("turbopack_failed_comparison_passed");
    expect(record.comparison_outcome_vocabulary).toContain("turbopack_passed_comparison_not_required");
    expect(record.comparison_outcome_vocabulary).toContain("comparison_unavailable");
    expect(record.runner_classification_vocabulary).toContain("authoritative_failure_changed");
    expect(record.runner_classification_vocabulary).toContain("build_failure_not_reproduced");
  });

  test("enforces attempt accounting", () => {
    const record = readJson<Action508Record>(recordPath);
    expect(record.maximum_build_process_invocations).toBe(2);
    expect(record.second_authoritative_attempt_performed).toBe(false);
    expect(record.comparison_retry_performed).toBe(false);
    expect(record.same_action_repair_performed).toBe(false);
  });

  test("keeps comparison from establishing readiness", () => {
    const record = readJson<Action508Record>(recordPath);
    expect(record.comparison_can_establish_deployment_readiness).toBe(false);
    expect(record.authoritative_build_required_for_rehearsal_pass).toBe(true);
    expect(record.candidate_rehearsal_result).not.toBe("full_candidate_rehearsal_passed");
  });

  test("records pre-build command handling and authoritative build failure", () => {
    const record = readJson<Action508Record>(recordPath);
    expect(record.candidate_command_results.slice(0, 5).every((entry) => entry.status === "passed")).toBe(true);
    expect(record.candidate_command_results[5].name).toBe("npm run build");
    expect(record.candidate_command_results[5].status).toBe("failed");
  });

  test("preserves hashes and mutation boundaries", () => {
    const record = readJson<Action508Record>(recordPath);
    expect(record.candidate_hash_impact).toBe("candidate_hash_change_not_required");
    expect(record.candidate_modified).toBe(false);
    expect(record.package_or_lockfile_modified).toBe(false);
    expect(record.configuration_modified).toBe(false);
    expect(record.source_dependency_tree_modified).toBe(false);
    expect(record.active_worktree_modified).toBe(false);
  });

  test("cleans up and verifies external evidence", () => {
    const record = readJson<Action508Record>(recordPath);
    expect(record.cleanup_result).toBe("cleanup_passed");
    expect(record.candidate_removed).toBe(true);
    expect(record.copied_node_modules_removed).toBe(true);
    expect(record.external_evidence_result).toBe("rehearsal_evidence_verified");
  });

  test("blocks readiness without deployment or activation", () => {
    const record = readJson<Action508Record>(recordPath);
    expect(record.overall_readiness).toBe("blocked");
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe("action_509_build_failure_specific_diagnosis_or_remediation_gate");
  });

  test("verifier succeeds and Actions 506-507 remain healthy", () => {
    const action506 = runVerifier(action506VerifierPath);
    const action507 = runVerifier(action507VerifierPath);
    const action508 = runVerifier(verifierPath);
    expect(action506.verification_status).toBe("passed");
    expect(action507.verification_status).toBe("passed");
    expect(action508.verification_status).toBe("passed");
  });

  test("documentation summarizes rehearsal result", () => {
    const doc = read(docPath);
    expect(doc).toContain("Authoritative build result: `failed`");
    expect(doc).toContain("Comparison outcome: `turbopack_failed_comparison_failed`");
    expect(doc).toContain("Runner classification: `broader_build_environment_failure`");
    expect(doc).toContain("Next action: `action_509_build_failure_specific_diagnosis_or_remediation_gate`");
  });
});
