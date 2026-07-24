import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-approval-record.json";
const docPath =
  "docs/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-gate.md";
const verifierPath =
  "scripts/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-gate-verify.mjs";
const action510VerifierPath =
  "scripts/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-gate-verify.mjs";
const action511VerifierPath =
  "scripts/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-verify.mjs";

type Action512Record = {
  action_511_exit_code: number;
  action_511_diagnostic_result: string;
  action_511_failure_classification: string;
  blocker_classification: string;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  current_process_node_runtime: string;
  candidate_local_next_cli: string;
  next_version_classification: string;
  invocation_failure_cause: string;
  approved_invocation_model: string;
  permitted_alternative_invocation_model: string;
  runtime_path_policy: string;
  candidate_local_cli_required: boolean;
  authoritative_executable_boundary: Record<string, unknown>;
  environment_allowlist_policy: Record<string, string>;
  runtime_resolution_precheck_requirements: string[];
  blocking_rules: Record<string, string>;
  diagnostic_retry_limit: number;
  authoritative_build_authorized: boolean;
  authoritative_build_attempt_limit: number;
  full_rehearsal_authorized: boolean;
  deployment_authorized: boolean;
  activation_authorized: boolean;
  invocation_readiness: string;
  approval_decision: string;
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

test.describe("Action 512 Webpack invocation remediation gate", () => {
  test("adds static gate artifacts and binds Action 511 exit 127", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action512Record>(recordPath);
    expect(record.action_511_diagnostic_result).toBe("webpack_diagnostic_failure_captured");
    expect(record.action_511_exit_code).toBe(127);
    expect(record.action_511_failure_classification).toBe("webpack_comparison_invocation_defect");
    expect(record.blocker_classification).toBe("webpack_comparison_child_process_node_runtime_not_resolved");
  });

  test("preserves exact candidate hashes and count", () => {
    const record = readJson<Action512Record>(recordPath);
    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("classifies parent Node and candidate-local Next CLI as present", () => {
    const record = readJson<Action512Record>(recordPath);
    expect(record.current_process_node_runtime).toBe("present");
    expect(record.current_process_node_version_classification).toBe("node_26_x");
    expect(record.candidate_local_next_cli).toBe("present");
    expect(record.candidate_node_modules_next_cli).toBe("present");
    expect(record.next_version_classification).toBe("16.2.6");
  });

  test("blocks missing Node, global Next, alternate version, and package-script changes", () => {
    const record = readJson<Action512Record>(recordPath);
    expect(record.blocking_rules.missing_node_runtime).toBe("blocked");
    expect(record.blocking_rules.global_next_cli_required).toBe("blocked");
    expect(record.blocking_rules.another_next_version_required).toBe("blocked");
    expect(record.blocking_rules.package_script_modification_required).toBe("blocked");
    expect(record.blocking_rules.persistent_environment_modification_required).toBe("blocked");
  });

  test("freezes ephemeral PATH strategy and direct Node CLI alternative", () => {
    const record = readJson<Action512Record>(recordPath);
    expect(record.invocation_failure_cause).toBe("diagnostic_child_process_path_sanitized_too_aggressively");
    expect(record.approved_invocation_model).toBe("ephemeral_allowlisted_runtime_path_propagation");
    expect(record.permitted_alternative_invocation_model).toBe("direct_local_node_cli_invocation");
    expect(record.runtime_path_policy).toBe("process_scoped_ephemeral_allowlisted_runtime_path_only");
    expect(record.candidate_local_cli_required).toBe(true);
    expect(record.authoritative_executable_boundary.global_next_cli_allowed).toBe(false);
    expect(record.authoritative_executable_boundary.npx_allowed).toBe(false);
  });

  test("does not record raw PATH or enumerate/persist environment", () => {
    const record = readJson<Action512Record>(recordPath);
    expect(record.environment_allowlist_policy.path).toBe("ephemeral_runtime_path_supplied");
    expect(record.raw_path_recorded).toBe(false);
    expect(record.full_environment_enumerated).toBe(false);
    expect(record.raw_environment_values_recorded).toBe(false);
    expect(record.credential_values_recorded).toBe(false);
    expect(record.absolute_executable_paths_recorded).toBe(false);
    expect(record.environment_persisted).toBe(false);
    expect(record.environment_restored).toBe(true);
  });

  test("preserves source, package, config, install, network, and candidate state", () => {
    const record = readJson<Action512Record>(recordPath);
    for (const key of [
      "candidate_change_required",
      "package_or_config_change_required",
      "package_script_change_required",
      "install_required",
      "network_required",
      "candidate_modified",
      "package_or_lockfile_modified",
      "configuration_modified",
      "persistent_environment_modified",
      "network_used",
      "install_performed",
    ]) {
      expect(record[key]).toBe(false);
    }
  });

  test("authorizes only one future diagnostic precheck path and no authoritative work", () => {
    const record = readJson<Action512Record>(recordPath);
    expect(record.runtime_resolution_precheck_requirements).toContain("node_runtime_resolves_in_proposed_child_environment");
    expect(record.runtime_resolution_precheck_requirements).toContain("candidate_local_next_cli_resolves");
    expect(record.runtime_resolution_precheck_requirements).toContain("next_version_classification_matches_16_2_6");
    expect(record.diagnostic_retry_limit).toBe(1);
    expect(record.authoritative_build_authorized).toBe(false);
    expect(record.authoritative_build_attempt_limit).toBe(0);
    expect(record.full_rehearsal_authorized).toBe(false);
  });

  test("does not deploy, activate, persist, replay, or apply confidence", () => {
    const record = readJson<Action512Record>(recordPath);
    for (const key of [
      "deployment_authorized",
      "activation_authorized",
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
      expect(record[key]).toBe(false);
    }
  });

  test("sets approval with conditions and Action 513 boundary", () => {
    const record = readJson<Action512Record>(recordPath);
    const doc = read(docPath);
    expect(record.invocation_readiness).toBe("webpack_invocation_remediation_ready_with_conditions");
    expect(record.approval_decision).toBe("approved_with_conditions");
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe("action_513_webpack_invocation_runtime_precheck_completion_gate");
    expect(doc).toContain("Action 512 is a static approval gate");
    expect(doc).toContain("This gate does not deploy and does not activate the preview.");
  });

  test("verifier succeeds and Actions 510-511 remain healthy", () => {
    const action510 = runVerifier(action510VerifierPath);
    const action511 = runVerifier(action511VerifierPath);
    const action512 = runVerifier(verifierPath);
    expect(action510.verification_status).toBe("passed");
    expect(action511.verification_status).toBe("passed");
    expect(action512.verification_status).toBe("passed");
  });
});
