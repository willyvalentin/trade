import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join, posix, resolve } from "path";
import { tmpdir } from "os";
import { test, expect } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-record.json";
const docPath =
  "docs/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-after-path-safety-remediation.md";
const action518Path =
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json";
const action520Path =
  "docs/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-record.json";
const action521Path =
  "docs/action-521-confidence-calibration-recommendation-advisory-projection-preview-action-520-path-safety-checker-remediation-approval-record.json";
const verifierPath =
  "scripts/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-after-path-safety-remediation-verify.mjs";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  action522Subtree:
    "ture/action-522-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal",
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

function canonicalTempPath(path: string): string {
  return posix.normalize(path).replace(/^\/var\//, "/private/var/");
}

function contained(root: string, candidate: string, exactSubtree = expected.action522Subtree): boolean {
  const canonicalRoot = canonicalTempPath(root);
  const canonicalCandidate = canonicalTempPath(candidate);
  const relative = posix.relative(canonicalRoot, canonicalCandidate);

  return (
    canonicalCandidate !== canonicalRoot &&
    relative !== "" &&
    relative !== ".." &&
    !relative.startsWith("../") &&
    !posix.isAbsolute(relative) &&
    relative === exactSubtree
  );
}

test.describe("Action 522 remediated 32-file candidate rehearsal retry", () => {
  test("binds Action 521 approval and Action 520 historical abort", () => {
    const record = readJson<JsonObject>(recordPath);
    const action520 = readJson<JsonObject>(action520Path);
    const action521 = readJson<JsonObject>(action521Path);

    expect(action521.approval_decision).toBe("approved");
    expect(action521.next_action).toBe(
      "action_522_remediated_32_file_candidate_build_rehearsal_retry_after_path_safety_remediation",
    );
    expect(action520.candidate_rehearsal_result).toBe("full_candidate_rehearsal_aborted");
    expect(action520.total_build_process_invocations).toBe(0);
    expect(record.source_action).toBe(521);
    expect(record.action_520_historical_result).toBe("full_candidate_rehearsal_aborted");
    expect(record.action_520_candidate_source_materialized).toBe(false);
    expect(record.action_520_build_process_invocations).toBe(0);
  });

  test("preserves exact Action 518 candidate bindings and route surface", () => {
    const record = readJson<JsonObject>(recordPath);
    const action518 = readJson<JsonObject>(action518Path);
    const routeSource = read(routePath);

    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(32);
    expect(action518.new_change_candidate_hash).toBe(expected.changeHash);
    expect(action518.new_full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(action518.new_candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe(expected.routeHash);
    expect(sha256(routeSource)).toBe(expected.routeHash);
    expect(record.route_export_surface).toEqual(["POST"]);
    expect(routeSource).not.toContain("export function buildOutcomeEligibility");
  });

  test("uses corrected shared canonical path safety and exact Action 522 temp subtree", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.safe_temp_subtree).toBe(expected.action522Subtree);
    expect(record.path_safety_implementation).toBe("shared_canonical_path_safety_semantics");
    expect(record.macos_temp_alias_equivalence_applied).toBe(true);
    expect(record.path_safety_result).toBe("path_safety_passed");
    expect(
      contained(
        "/var/folders/example/T",
        "/private/var/folders/example/T/" + expected.action522Subtree,
      ),
    ).toBe(true);
    expect(contained("/private/var/folders/example/T", "/private/var/folders/example/TureSibling")).toBe(
      false,
    );
    expect(contained("/private/var/folders/example/T", "/private/var/folders/example/T/../escape")).toBe(
      false,
    );
    expect(
      contained(
        "/private/var/folders/example/T",
        "/private/var/folders/example/T/ture/action-520-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal",
      ),
    ).toBe(false);
  });

  test("passes source reconstruction, safety, preview flag, dependency, typegen, and tsc checks", () => {
    const record = readJson<JsonObject>(recordPath);
    const prebuild = new Map(
      (record.prebuild_command_results as JsonObject[]).map((item) => [item.name, item]),
    );

    expect(record.source_reconstruction_result).toBe("exact_32_file_candidate_reconstructed");
    expect(record.runtime_dependency_closure_result).toBe("runtime_dependency_closure_passed");
    expect(record.source_integrity_result).toBe("source_integrity_passed");
    expect(record.source_safety_result).toBe("source_safety_passed");
    expect(record.preview_flag_verification_result).toBe("preview_flag_disabled_verified");
    expect(record.dependency_materialization_result).toBe("dependency_materialization_passed");
    expect(prebuild.get("candidate_integrity_confirmation")?.result).toBe("passed");
    expect(prebuild.get("strict_source_safety_hash_matrix")?.result).toBe("passed");
    expect(prebuild.get("semantic_preview_flag_matrix")?.result).toBe("passed");
    expect(prebuild.get("next_typegen")?.result).toBe("passed");
    expect(prebuild.get("next_typegen")?.exit_code).toBe(0);
    expect(prebuild.get("typescript_no_emit")?.result).toBe("passed");
    expect(prebuild.get("typescript_no_emit")?.exit_code).toBe(0);
  });

  test("records one failed authoritative build and one bounded Webpack diagnostic", () => {
    const record = readJson<JsonObject>(recordPath);
    const webpack = record.webpack_first_causal_error as JsonObject;

    expect(record.authoritative_build_command).toBe("npm run build");
    expect(record.authoritative_build_attempt_count).toBe(1);
    expect(record.authoritative_build_result).toBe("failed");
    expect(record.authoritative_build_phase).toBe("next_build_failed");
    expect(record.authoritative_error_class).toBe("turbopack_or_next_build_failure");
    expect(String(record.authoritative_build_summary)).toContain("Turbopack");
    expect(record.webpack_diagnostic_attempt_count).toBe(1);
    expect(record.webpack_diagnostic_result).toBe("webpack_diagnostic_failure_captured");
    expect(record.webpack_diagnostic_cannot_establish_readiness).toBe(true);
    expect(webpack.error_class).toBe("webpack_build_failure");
    expect(String(webpack.sanitized_summary)).toContain("Supabase");
    expect(record.total_build_process_invocations).toBe(2);
    expect(record.second_authoritative_build).toBe(false);
    expect(record.same_action_command_retry).toBe(false);
    expect(record.same_action_source_repair).toBe(false);
  });

  test("skips remaining commands after authoritative build failure", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.candidate_command_results).toEqual([]);
    expect(record.remaining_candidate_commands_result).toBe(
      "skipped_after_authoritative_build_failure",
    );
    expect(record.runtime_projection_call_site_count).toBeNull();
    expect(record.runtime_projection_call_site_count_result).toBe(
      "not_evaluated_after_authoritative_build_failure",
    );
  });

  test("keeps all mutation, network, persistence, replay, confidence, and deployment effects false", () => {
    const record = readJson<JsonObject>(recordPath);
    const falseKeys = [
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
    ];

    for (const key of falseKeys) {
      expect(record[key], key).toBe(false);
    }
    expect(record.cleanup_result).toBe("cleanup_passed");
    expect(record.target_absent_after_cleanup).toBe(true);
    expect(existsSync(join(canonicalTempPath(tmpdir()), expected.action522Subtree))).toBe(false);
  });

  test("records blocked readiness and the Action 523 next step", () => {
    const record = readJson<JsonObject>(recordPath);
    const doc = read(docPath);

    expect(record.rehearsal_retry_count).toBe(1);
    expect(record.candidate_rehearsal_result).toBe("full_candidate_rehearsal_failed");
    expect(record.external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(record.overall_readiness).toBe("blocked");
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe("action_523_candidate_build_failure_diagnosis_or_remediation_gate");
    expect(doc).toContain("overall readiness: `blocked`");
    expect(doc).toContain("action_523_candidate_build_failure_diagnosis_or_remediation_gate");
  });

  test("runs the Action 522 verifier", () => {
    const output = execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" });
    const result = JSON.parse(output) as JsonObject;

    expect(result.verification_status).toBe("passed");
    expect(result.candidate_rehearsal_result).toBe("full_candidate_rehearsal_failed");
    expect(result.authoritative_build_result).toBe("failed");
    expect(result.overall_readiness).toBe("blocked");
    expect(result.failures).toEqual([]);
  });
});
