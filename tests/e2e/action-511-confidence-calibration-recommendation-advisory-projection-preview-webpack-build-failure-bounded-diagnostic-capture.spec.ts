import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-record.json";
const docPath =
  "docs/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture.md";
const verifierPath =
  "scripts/action-511-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-verify.mjs";
const action509VerifierPath =
  "scripts/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-or-remediation-gate-verify.mjs";
const action510VerifierPath =
  "scripts/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-gate-verify.mjs";

type Action511Record = {
  action_510_approval_decision: string;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  diagnostic_command: string;
  diagnostic_attempt_count: number;
  authoritative_build_attempt_count: number;
  prerequisite_gate_results: Record<string, string | boolean>;
  dependency_materialization_result: string;
  extraneous_packages_excluded: boolean;
  source_node_modules_unchanged_bounded: boolean;
  process_start_result: string;
  webpack_started: boolean;
  webpack_passed: boolean;
  webpack_exit_code: number;
  webpack_subsystem: string;
  primary_error_class: string;
  first_causal_error: {
    summary: string;
    repository_relative_path: string | null;
  };
  implicated_paths: unknown[];
  sanitized_diagnostic_lines: string[];
  path_classification_vocabulary: string[];
  candidate_vs_runner_vocabulary: string[];
  candidate_vs_runner_classification: string;
  dual_failure_relationship: string;
  candidate_defect_status: string;
  candidate_hash_impact: string;
  cleanup_result: string;
  diagnostic_result: string;
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

test.describe("Action 511 Webpack bounded diagnostic capture", () => {
  test("records Action 510 approval and exact candidate bindings", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action511Record>(recordPath);
    expect(record.action_510_approval_decision).toBe("approved");
    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("records exactly one Webpack diagnostic attempt and zero authoritative attempts", () => {
    const record = readJson<Action511Record>(recordPath);
    expect(record.diagnostic_command).toBe("next build --webpack");
    expect(record.diagnostic_attempt_count).toBe(1);
    expect(record.authoritative_build_attempt_count).toBe(0);
    expect(record.webpack_retry_performed).toBe(false);
    expect(record.same_action_repair_performed).toBe(false);
  });

  test("records safe temp path and prerequisite gates", () => {
    const record = readJson<Action511Record>(recordPath);
    expect(record.prerequisite_gate_results.path_safety).toBe("passed");
    expect(record.prerequisite_gate_results.reconstruction).toBe("passed");
    expect(record.prerequisite_gate_results.runtime_dependency_closure).toBe("passed");
    expect(record.prerequisite_gate_results.source_inventory).toBe("passed");
    expect(record.prerequisite_gate_results.source_safety).toBe("source_safety_passed");
    expect(record.prerequisite_gate_results.strict_wrong_hash_matrix).toBe("passed");
    expect(record.prerequisite_gate_results.preview_flag).toBe("preview_flag_disabled_verified");
    expect(record.prerequisite_gate_results.alternate_activation).toBe(false);
  });

  test("records dependency materialization and source dependency preservation", () => {
    const record = readJson<Action511Record>(recordPath);
    expect(record.dependency_materialization_result).toBe("passed_temporary_verified_node_modules_copy");
    expect(record.extraneous_local_package_count).toBe(5);
    expect(record.extraneous_packages_excluded).toBe(true);
    expect(record.source_node_modules_unchanged_bounded).toBe(true);
    expect(record.package_config_hashes_unchanged).toBe(true);
  });

  test("captures comparison invocation failure without reaching Webpack compilation", () => {
    const record = readJson<Action511Record>(recordPath);
    expect(record.process_start_result).toBe("next_command_spawned_invocation_failed_before_webpack_compilation");
    expect(record.webpack_started).toBe(false);
    expect(record.webpack_passed).toBe(false);
    expect(record.webpack_exit_code).toBe(127);
    expect(record.primary_error_class).toBe("webpack_runner_environment_error");
  });

  test("retains bounded sanitized first causal evidence", () => {
    const record = readJson<Action511Record>(recordPath);
    expect(record.first_causal_error.summary).toContain("could not locate node");
    expect(record.first_causal_error.repository_relative_path).toBeNull();
    expect(record.sanitized_diagnostic_lines).toEqual(["env: node: No such file or directory"]);
    expect(record.sanitized_diagnostic_lines.length).toBeLessThanOrEqual(12);
    expect(record.raw_logs_retained).toBe(false);
    expect(record.raw_environment_values_recorded).toBe(false);
    expect(record.credential_values_recorded).toBe(false);
    expect(record.absolute_machine_paths_recorded).toBe(false);
  });

  test("records no implicated candidate, dependency, framework, or runner paths before compilation", () => {
    const record = readJson<Action511Record>(recordPath);
    expect(record.implicated_paths).toEqual([]);
    expect(record.implicated_paths_resolved).toBe(false);
    expect(record.path_classification_vocabulary).toContain("runtime_candidate_file");
    expect(record.path_classification_vocabulary).toContain("dependency_file");
    expect(record.path_classification_vocabulary).toContain("framework_internal");
    expect(record.path_classification_vocabulary).toContain("rehearsal_runner_file");
  });

  test("classifies candidate-versus-runner and dual-failure relationship", () => {
    const record = readJson<Action511Record>(recordPath);
    expect(record.candidate_vs_runner_vocabulary).toContain("webpack_comparison_invocation_defect");
    expect(record.candidate_vs_runner_classification).toBe("webpack_comparison_invocation_defect");
    expect(record.dual_failure_relationship).toBe("comparison_failure_caused_by_comparison_invocation");
    expect(record.candidate_defect_status).toBe("candidate_defect_not_proven");
    expect(record.candidate_hash_impact).toBe("candidate_hash_change_not_required");
  });

  test("covers failure, unexpected pass, abort, and capture-failure vocabularies", () => {
    const record = readJson<Action511Record>(recordPath);
    expect(record.diagnostic_result_vocabulary).toContain("webpack_diagnostic_failure_captured");
    expect(record.diagnostic_result_vocabulary).toContain("webpack_diagnostic_passed_unexpectedly");
    expect(record.diagnostic_result_vocabulary).toContain("webpack_diagnostic_aborted");
    expect(record.diagnostic_result_vocabulary).toContain("webpack_diagnostic_capture_failed");
    expect(record.diagnostic_result).toBe("webpack_diagnostic_failure_captured");
  });

  test("cleans up and leaves runtime preview waiting", () => {
    const record = readJson<Action511Record>(recordPath);
    expect(record.cleanup_result).toBe("cleanup_passed");
    expect(record.candidate_removed).toBe(true);
    expect(record.copied_node_modules_removed).toBe(true);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("performs no source change, rehearsal, deployment, activation, or persistence", () => {
    const record = readJson<Action511Record>(recordPath);
    for (const key of [
      "candidate_modified",
      "package_or_lockfile_modified",
      "configuration_modified",
      "environment_modified",
      "network_used",
      "install_performed",
      "dependency_update_performed",
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

  test("documents next action and verifies Actions 509-511", () => {
    const doc = read(docPath);
    expect(doc).toContain("Diagnostic command: `next build --webpack`");
    expect(doc).toContain("Diagnostic attempt count: `1`");
    expect(doc).toContain("Candidate-versus-runner classification: `webpack_comparison_invocation_defect`");
    expect(doc).toContain("action_512_webpack_comparison_invocation_remediation_gate");
    const action509 = runVerifier(action509VerifierPath);
    const action510 = runVerifier(action510VerifierPath);
    const action511 = runVerifier(verifierPath);
    expect(action509.verification_status).toBe("passed");
    expect(action510.verification_status).toBe("passed");
    expect(action511.verification_status).toBe("passed");
  });
});
