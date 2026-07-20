import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join, resolve } from "path";
import { test, expect } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-record.json";
const action518Path =
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json";
const action519Path =
  "docs/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-record.json";
const verifierPath =
  "scripts/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-verify.mjs";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
};

type JsonObject = Record<string, unknown>;

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function routeExports(source: string): string[] {
  return [...source.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm)].map(
    (match) => match[1],
  );
}

test.describe("Action 520 remediated 32-file candidate build rehearsal", () => {
  test("binds Action 519 approval and exact Action 518 hashes/count", () => {
    const record = readJson<JsonObject>(recordPath);
    const action518 = readJson<JsonObject>(action518Path);
    const action519 = readJson<JsonObject>(action519Path);

    expect(action519.approval_decision).toBe("approved");
    expect(action519.unresolved_conditions).toEqual([]);
    expect(action519.next_action).toBe("action_520_remediated_32_file_candidate_build_rehearsal");
    expect(action518.candidate_reconstruction_result).toBe(
      "remediated_32_file_candidate_reconstructed_and_frozen",
    );
    expect(record.source_action).toBe(519);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(32);
  });

  test("keeps route hash/export surface bound to the remediation", () => {
    const record = readJson<JsonObject>(recordPath);
    const routeSource = read(routePath);

    expect(record.remediated_route_path).toBe(routePath);
    expect(record.remediated_route_hash).toBe(expected.routeHash);
    expect(sha256(routeSource)).toBe(expected.routeHash);
    expect(record.route_export_surface).toEqual(["POST"]);
    expect(routeExports(routeSource)).toEqual(["POST"]);
    expect(routeSource).not.toContain("export function buildOutcomeEligibility");
    expect(record.invalid_route_helper_exported).toBe(false);
  });

  test("records the safe path abort before source reconstruction or dependency materialization", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.safe_temp_subtree).toBe(
      "ture/action-520-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal",
    );
    expect(record.path_safety_result).toBe("path_safety_failed");
    expect(record.path_safety_failure_class).toBe(
      "macos_private_var_equivalence_not_handled_by_rehearsal_runner",
    );
    expect(record.source_materialized_before_path_safety_passed).toBe(false);
    expect(record.source_reconstruction_result).toBe("not_started_path_safety_failed");
    expect(record.runtime_dependency_closure_result).toBe("not_started_path_safety_failed");
    expect(record.source_integrity_result).toBe("not_started_path_safety_failed");
    expect(record.source_safety_result).toBe("not_started_path_safety_failed");
    expect(record.preview_flag_verification_result).toBe("not_started_path_safety_failed");
    expect(record.dependency_materialization_result).toBe("not_started_path_safety_failed");
  });

  test("records that pre-build commands, authoritative build, and Webpack diagnostic did not start", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.candidate_internal_required_paths_missing).toBe(0);
    expect(record.prebuild_command_results).toEqual([]);
    expect(record.authoritative_build_command).toBe("npm run build");
    expect(record.authoritative_build_attempt_count).toBe(0);
    expect(record.authoritative_build_result).toBe("not_started");
    expect(record.authoritative_build_phase).toBe("not_started_path_safety_failed");
    expect(record.webpack_diagnostic_invocation_model).toBe("direct_local_node_cli_invocation");
    expect(record.webpack_diagnostic_attempt_count).toBe(0);
    expect(record.webpack_diagnostic_result).toBe("webpack_diagnostic_not_required");
    expect(record.candidate_command_results).toEqual([]);
    expect(record.runtime_projection_call_site_count).toBeNull();
  });

  test("models pass/fail/diagnostic policies while preserving the actual aborted result", () => {
    const record = readJson<JsonObject>(recordPath);
    const coverage = record.approved_outcome_path_coverage as JsonObject;
    const vocabulary = record.approved_result_vocabulary as JsonObject;

    expect(vocabulary.candidate_rehearsal_result_vocabulary).toEqual([
      "full_candidate_rehearsal_passed",
      "full_candidate_rehearsal_failed",
      "full_candidate_rehearsal_aborted",
    ]);
    expect(vocabulary.webpack_diagnostic_result_vocabulary).toEqual([
      "webpack_diagnostic_not_required",
      "webpack_diagnostic_failure_captured",
      "webpack_diagnostic_passed_unexpectedly",
      "webpack_diagnostic_aborted",
      "webpack_diagnostic_capture_failed",
    ]);
    expect(coverage.authoritative_build_pass_path_modeled).toBe(true);
    expect(coverage.authoritative_build_fail_path_modeled).toBe(true);
    expect(coverage.path_safety_abort_path_executed).toBe(true);
    expect(coverage.webpack_diagnostic_boundary_modeled).toBe(true);
    expect(coverage.webpack_success_cannot_establish_readiness).toBe(true);
    expect(coverage.no_webpack_when_authoritative_passes).toBe(true);
  });

  test("preserves attempt accounting and cleanup", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.rehearsal_attempt_count).toBe(1);
    expect(record.total_build_process_invocations).toBe(0);
    expect(record.second_authoritative_build).toBe(false);
    expect(record.webpack_retry).toBe(false);
    expect(record.same_action_repair).toBe(false);
    expect(record.cleanup_result).toBe("cleanup_passed_after_corrected_boundary_cleanup");
    expect(record.candidate_removed).toBe(true);
    expect(record.copied_node_modules_removed).toBe(true);
    expect(record.target_absent_after_cleanup).toBe(true);
    expect(record.source_node_modules_unchanged).toBe(true);
    expect(record.environment_restored).toBe(true);
  });

  test("records no mutation, deployment, activation, provider, Supabase, replay or downstream effect", () => {
    const record = readJson<JsonObject>(recordPath);

    for (const key of [
      "raw_logs_retained",
      "raw_environment_values_recorded",
      "credential_values_recorded",
      "absolute_machine_paths_recorded",
      "candidate_modified",
      "package_or_lockfile_modified",
      "configuration_modified",
      "source_dependency_tree_modified",
      "active_worktree_modified",
      "environment_modified",
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
      expect(record[key], key).toBe(false);
    }
  });

  test("sets blocked readiness, runtime preview waiting, and the path-safety remediation next action", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.candidate_rehearsal_result).toBe("full_candidate_rehearsal_aborted");
    expect(record.external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(record.overall_readiness).toBe("blocked");
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe(
      "action_521_action_520_path_safety_checker_remediation_gate",
    );
  });

  test("runs the Action 520 verifier", () => {
    const output = execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" });
    const result = JSON.parse(output) as JsonObject;

    expect(result.verification_status).toBe("passed");
    expect(result.candidate_rehearsal_result).toBe("full_candidate_rehearsal_aborted");
    expect(result.overall_readiness).toBe("blocked");
    expect(result.failures).toEqual([]);
  });
});
