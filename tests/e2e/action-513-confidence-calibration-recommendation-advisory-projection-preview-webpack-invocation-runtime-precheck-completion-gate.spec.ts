import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-record.json";
const docPath =
  "docs/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-completion-gate.md";
const verifierPath =
  "scripts/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-completion-gate-verify.mjs";
const action511VerifierPath =
  "scripts/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-verify.mjs";
const action512VerifierPath =
  "scripts/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-gate-verify.mjs";

type Action513Record = {
  action_512_approval_decision: string;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  parent_node_runtime_result: string;
  parent_node_version_classification: string;
  candidate_local_next_cli_result: string;
  candidate_local_next_version_classification: string;
  selected_invocation_model: string;
  runtime_path_policy: string;
  webpack_option_supported: boolean;
  build_started: boolean;
  blocking_rules: Record<string, string>;
  evaluated_invocation_models: Record<string, Record<string, unknown>>;
  harmless_invocation_checks: Record<string, unknown>;
  action_514_boundary: Record<string, unknown>;
  temporary_boundary: Record<string, unknown>;
  precheck_readiness: string;
  approval_decision: string;
  diagnostic_retry_authorized: boolean;
  diagnostic_retry_limit: number;
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

test.describe("Action 513 Webpack invocation runtime precheck completion gate", () => {
  test("adds static precheck artifacts and binds Action 512 approved-with-conditions", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action513Record>(recordPath);
    expect(record.action_512_approval_decision).toBe("approved_with_conditions");
    expect(record.prior_blocker).toBe("webpack_comparison_child_process_node_runtime_not_resolved");
    expect(record.prior_failure_cause).toBe("diagnostic_child_process_path_sanitized_too_aggressively");
  });

  test("preserves exact candidate hashes and count", () => {
    const record = readJson<Action513Record>(recordPath);
    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("records parent Node present and blocks parent Node absent", () => {
    const record = readJson<Action513Record>(recordPath);
    expect(record.parent_node_runtime_result).toBe("parent_node_runtime_present");
    expect(record.parent_node_version_classification).toBe("node_26_x");
    expect(record.parent_node_child_constant_check).toBe("passed");
    expect(record.blocking_rules.parent_node_runtime_absent).toBe("blocked");
  });

  test("records candidate-local Next present and rejects global or mismatched Next", () => {
    const record = readJson<Action513Record>(recordPath);
    expect(record.candidate_local_next_cli_result).toBe("candidate_local_next_cli_present");
    expect(record.candidate_local_next_version_classification).toBe("16.2.6");
    expect(record.global_next_cli_used).toBe(false);
    expect(record.blocking_rules.global_next_cli_required).toBe("blocked");
    expect(record.blocking_rules.candidate_local_next_cli_version_mismatch).toBe("blocked");
  });

  test("selects direct local Node CLI invocation and keeps ephemeral PATH fallback", () => {
    const record = readJson<Action513Record>(recordPath);
    expect(record.selected_invocation_model).toBe("direct_local_node_cli_invocation");
    expect(record.runtime_path_policy).toBe("direct_runtime_invocation");
    expect(record.evaluated_invocation_models.direct_local_node_cli_invocation.selected).toBe(true);
    expect(record.evaluated_invocation_models.ephemeral_allowlisted_runtime_path_propagation.fallback_available).toBe(true);
    expect(record.evaluated_invocation_models.direct_local_node_cli_invocation.global_cli_used).toBe(false);
  });

  test("does not record raw PATH, enumerate environment, or persist PATH", () => {
    const record = readJson<Action513Record>(recordPath);
    expect(record.raw_path_recorded).toBe(false);
    expect(record.full_environment_enumerated).toBe(false);
    expect(record.raw_environment_values_recorded).toBe(false);
    expect(record.credential_values_recorded).toBe(false);
    expect(record.environment_persisted).toBe(false);
    expect(record.persistent_environment_modified).toBe(false);
    expect(record.blocking_rules.persistent_path_modification_required).toBe("blocked");
  });

  test("confirms Webpack option support through harmless help/version checks only", () => {
    const record = readJson<Action513Record>(recordPath);
    expect(record.webpack_option_supported).toBe(true);
    expect(record.harmless_invocation_checks.candidate_local_cli_version_classification).toBe("passed");
    expect(record.harmless_invocation_checks.candidate_local_cli_build_help_classification).toBe("passed");
    expect(record.harmless_invocation_checks.full_build_arguments_invoked).toBe(false);
    expect(record.build_started).toBe(false);
    expect(record.webpack_executed).toBe(false);
  });

  test("performs no network, install, candidate, package, or config mutation", () => {
    const record = readJson<Action513Record>(recordPath);
    for (const key of [
      "network_used",
      "install_performed",
      "candidate_modified",
      "package_or_lockfile_modified",
      "package_script_modified",
      "configuration_modified",
      "candidate_change_required",
      "package_or_config_change_required",
      "install_required",
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("covers ready, ready-with-conditions, and blocked vocabulary paths", () => {
    const record = readJson<Action513Record>(recordPath);
    expect(record.readiness_vocabulary).toContain("webpack_invocation_runtime_precheck_ready");
    expect(record.readiness_vocabulary).toContain("webpack_invocation_runtime_precheck_ready_with_conditions");
    expect(record.readiness_vocabulary).toContain("webpack_invocation_runtime_precheck_blocked");
    expect(record.precheck_readiness).toBe("webpack_invocation_runtime_precheck_ready");
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
  });

  test("freezes Action 514 boundary and performs no build, rehearsal, deployment, or activation", () => {
    const record = readJson<Action513Record>(recordPath);
    expect(record.diagnostic_retry_authorized).toBe(true);
    expect(record.diagnostic_retry_limit).toBe(1);
    expect(record.diagnostic_retry_performed).toBe(false);
    expect(record.authoritative_build_authorized).toBe(false);
    expect(record.full_rehearsal_authorized).toBe(false);
    expect(record.deployment_authorized).toBe(false);
    expect(record.activation_authorized).toBe(false);
    expect(record.action_514_boundary.semantic_command).toBe("next build --webpack");
    expect(record.action_514_boundary.same_action_retry_allowed).toBe(false);
  });

  test("cleans up, keeps runtime preview waiting, and documents next action", () => {
    const record = readJson<Action513Record>(recordPath);
    const doc = read(docPath);
    expect(record.temporary_boundary.cleanup_result).toBe("cleanup_passed");
    expect(record.cleanup_result).toBe("cleanup_passed");
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe("action_514_webpack_build_failure_bounded_diagnostic_retry_after_invocation_remediation");
    expect(doc).toContain("Build started: `false`");
    expect(doc).toContain("action_514_webpack_build_failure_bounded_diagnostic_retry_after_invocation_remediation");
  });

  test("verifier succeeds and Actions 511-512 remain healthy", () => {
    const action511 = runVerifier(action511VerifierPath);
    const action512 = runVerifier(action512VerifierPath);
    const action513 = runVerifier(verifierPath);
    expect(action511.verification_status).toBe("passed");
    expect(action512.verification_status).toBe("passed");
    expect(action513.verification_status).toBe("passed");
  });
});
