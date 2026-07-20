import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-record.json";
const docPath =
  "docs/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-after-invocation-remediation.md";
const verifierPath =
  "scripts/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-after-invocation-remediation-verify.mjs";
const action512VerifierPath =
  "scripts/action-512-confidence-calibration-recommendation-advisory-projection-preview-webpack-comparison-invocation-remediation-gate-verify.mjs";
const action513VerifierPath =
  "scripts/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-completion-gate-verify.mjs";

type Action514Record = {
  action_513_approval_decision: string;
  clean_base_identifier: string;
  change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  selected_invocation_model: string;
  diagnostic_attempt_count: number;
  authoritative_build_attempt_count: number;
  prerequisite_gate_results: Record<string, string | boolean>;
  safe_temporary_boundary: Record<string, unknown>;
  dependency_materialization_result: string;
  runtime_resolution_precheck_result: string;
  next_cli_started: boolean;
  webpack_compilation_started: boolean;
  webpack_passed: boolean;
  invocation_outcome: string;
  first_causal_error: Record<string, unknown>;
  implicated_paths: Array<Record<string, unknown>>;
  sanitized_diagnostic_lines: string[];
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

test.describe("Action 514 Webpack diagnostic retry after invocation remediation", () => {
  test("adds diagnostic retry artifacts and binds Action 513 approval", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action514Record>(recordPath);
    expect(record.action_513_approval_decision).toBe("approved");
    expect(record.diagnostic_classification).toBe("bounded_webpack_build_failure_diagnostic_retry_after_invocation_remediation");
  });

  test("preserves exact candidate bindings", () => {
    const record = readJson<Action514Record>(recordPath);
    expect(record.clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.change_candidate_hash).toBe("c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c");
    expect(record.full_candidate_inventory_hash).toBe("d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f");
    expect(record.candidate_file_count).toBe(31);
  });

  test("records one Webpack retry and zero authoritative builds", () => {
    const record = readJson<Action514Record>(recordPath);
    expect(record.diagnostic_attempt_count).toBe(1);
    expect(record.authoritative_build_attempt_count).toBe(0);
    expect(record.previous_action_511_attempt).toBe("historical_only");
    expect(record.same_action_retry_performed).toBe(false);
  });

  test("uses direct Node/CLI invocation without env-node launcher dependency", () => {
    const record = readJson<Action514Record>(recordPath);
    expect(record.selected_invocation_model).toBe("direct_local_node_cli_invocation");
    expect(record.process_start_result).toBe("direct_node_cli_process_started");
    expect(record.global_next_cli_used).toBe(false);
    expect(record.raw_path_recorded).toBe(false);
  });

  test("records safe temp path, prerequisites, and dependency materialization", () => {
    const record = readJson<Action514Record>(recordPath);
    expect(record.safe_temporary_boundary.path_relative_containment).toBe(true);
    expect(record.prerequisite_gate_results.safe_path).toBe("passed");
    expect(record.prerequisite_gate_results.preview_flag).toBe("preview_flag_disabled_verified");
    expect(record.dependency_materialization_result).toBe("passed_temporary_verified_node_modules_copy");
    expect(record.source_node_modules_unchanged_bounded).toBe(true);
  });

  test("records CLI started and compilation started, with launcher failure remediated", () => {
    const record = readJson<Action514Record>(recordPath);
    expect(record.runtime_resolution_precheck_result).toBe("passed");
    expect(record.next_cli_started).toBe(true);
    expect(record.webpack_compilation_started).toBe(true);
    expect(record.webpack_passed).toBe(false);
    expect(record.invocation_outcome).toBe("invocation_remediation_succeeded_compilation_started");
  });

  test("retains bounded sanitized first causal error and implicated path", () => {
    const record = readJson<Action514Record>(recordPath);
    expect(record.first_causal_error.repository_relative_path).toBe("app/api/recommendations/evaluate-outcomes/route.ts");
    expect(record.first_causal_error.module_reference).toBe("buildOutcomeEligibility");
    expect(record.sanitized_diagnostic_lines.length).toBeLessThanOrEqual(12);
    expect(record.sanitized_diagnostic_lines).toContain("buildOutcomeEligibility is not a valid Route export field.");
    expect(record.implicated_paths[0].path_classification).toBe("clean_base_file");
  });

  test("classifies subsystem, error, candidate relation, dual failure, and hash impact", () => {
    const record = readJson<Action514Record>(recordPath);
    expect(record.webpack_subsystem).toBe("webpack_typescript_validation");
    expect(record.primary_error_class).toBe("webpack_candidate_typescript_error");
    expect(record.candidate_vs_runner_classification).toBe("candidate_source_build_defect");
    expect(record.dual_failure_relationship).toBe("independent_build_engine_failures");
    expect(record.candidate_defect_status).toBe("candidate_defect_proven");
    expect(record.candidate_hash_impact).toBe("candidate_hash_change_required");
  });

  test("covers launcher recurrence, compile failure, unexpected pass, abort, and capture-failure vocabularies", () => {
    const record = readJson<Action514Record>(recordPath);
    expect(record.invocation_outcome_vocabulary).toContain("invocation_remediation_failed_node_unresolved");
    expect(record.invocation_outcome_vocabulary).toContain("invocation_remediation_succeeded_compilation_started");
    expect(record.invocation_outcome_vocabulary).toContain("invocation_remediation_succeeded_build_passed");
    expect(record.diagnostic_result_vocabulary).toContain("webpack_diagnostic_aborted");
    expect(record.diagnostic_result_vocabulary).toContain("webpack_diagnostic_capture_failed");
    expect(record.diagnostic_result_vocabulary).toContain("webpack_diagnostic_passed_unexpectedly");
  });

  test("does not retain raw paths, logs, environment, credentials, or source excerpts", () => {
    const record = readJson<Action514Record>(recordPath);
    expect(record.raw_path_recorded).toBe(false);
    expect(record.raw_logs_retained).toBe(false);
    expect(record.raw_environment_values_recorded).toBe(false);
    expect(record.credential_values_recorded).toBe(false);
    expect(record.absolute_machine_paths_recorded).toBe(false);
    expect(record.source_contents_recorded).toBe(false);
  });

  test("cleans up and performs no rehearsal, deployment, or activation", () => {
    const record = readJson<Action514Record>(recordPath);
    for (const key of [
      "candidate_modified",
      "package_or_lockfile_modified",
      "configuration_modified",
      "environment_modified",
      "deployment_performed",
      "preview_activated",
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
    expect(record.cleanup_result).toBe("cleanup_passed");
    expect(record.candidate_removed).toBe(true);
    expect(record.copied_node_modules_removed).toBe(true);
  });

  test("keeps runtime preview waiting, documents next action, and verifies Actions 512-514", () => {
    const record = readJson<Action514Record>(recordPath);
    const doc = read(docPath);
    expect(record.diagnostic_result).toBe("webpack_diagnostic_failure_captured");
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe("action_515_candidate_build_source_remediation");
    expect(doc).toContain("Next action: `action_515_candidate_build_source_remediation`");
    expect(runVerifier(action512VerifierPath).verification_status).toBe("passed");
    expect(runVerifier(action513VerifierPath).verification_status).toBe("passed");
    expect(runVerifier(verifierPath).verification_status).toBe("passed");
  });
});
