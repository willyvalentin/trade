import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join, resolve } from "path";
import { test, expect } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-record.json";
const action518Path =
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json";
const action522Path =
  "docs/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-record.json";
const verifierPath =
  "scripts/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-gate-verify.mjs";
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

test.describe("Action 523 build failure relationship and remediation approval gate", () => {
  test("binds exact Action 518 candidate and route surface", () => {
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
  });

  test("binds Action 522 failed rehearsal, one authoritative attempt, and one Webpack diagnostic", () => {
    const record = readJson<JsonObject>(recordPath);
    const action522 = readJson<JsonObject>(action522Path);

    expect(record.action_522_candidate_rehearsal_result).toBe("full_candidate_rehearsal_failed");
    expect(record.action_522_overall_readiness).toBe("blocked");
    expect(record.authoritative_build_attempt_count).toBe(1);
    expect(record.authoritative_build_result).toBe("failed");
    expect(record.authoritative_build_phase).toBe("next_build_failed");
    expect(record.authoritative_error_class).toBe("turbopack_or_next_build_failure");
    expect(record.webpack_diagnostic_attempt_count).toBe(1);
    expect(record.webpack_diagnostic_result).toBe("webpack_diagnostic_failure_captured");
    expect(action522.second_authoritative_build).toBe(false);
    expect(action522.deployment_performed).toBe(false);
    expect(action522.preview_activated).toBe(false);
  });

  test("keeps active worktree build result non-authoritative", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.active_worktree_build_result).toBe("passed");
    expect(record.active_worktree_build_establishes_candidate_readiness).toBe(false);
    expect(record.active_worktree_build_evidence_role).toBe("diagnostic_context_only");
  });

  test("retains authoritative Turbopack causal error and classification", () => {
    const record = readJson<JsonObject>(recordPath);
    const causal = record.authoritative_first_causal_error as JsonObject;
    const paths = record.authoritative_implicated_paths as JsonObject[];

    expect(record.turbopack_classification).toBe("turbopack_process_resource_error");
    expect(causal.subsystem).toBe("turbopack");
    expect(causal.error_class).toBe("turbopack_process_resource_error");
    expect(String(causal.bounded_summary)).toContain("app/globals.css");
    expect(String(causal.bounded_summary)).toContain("worker process");
    expect(paths.length).toBeLessThanOrEqual(15);
    expect(paths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "app/globals.css",
          classification: "clean_base_inherited_path",
          discovery: "CSS-discovered",
        }),
        expect.objectContaining({
          path: "turbopack_worker_process_port_binding",
          classification: "runner_path",
          discovery: "framework-discovered",
        }),
      ]),
    );
  });

  test("retains Webpack causal error and classification", () => {
    const record = readJson<JsonObject>(recordPath);
    const causal = record.webpack_first_causal_error as JsonObject;
    const paths = record.webpack_implicated_paths as JsonObject[];

    expect(record.webpack_subsystem).toBe("webpack");
    expect(record.webpack_classification).toBe("webpack_runner_environment_error");
    expect(record.webpack_error_class).toBe("webpack_runner_environment_error");
    expect(causal.error_class).toBe("webpack_runner_environment_error");
    expect(String(causal.bounded_summary)).toContain("public Supabase");
    expect(paths.length).toBeLessThanOrEqual(15);
    expect(paths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "app/api/recommendations/evaluate-outcomes/route.ts",
          classification: "remediated_route",
          discovery: "route-discovered",
        }),
        expect.objectContaining({
          path: "public_supabase_browser_configuration",
          classification: "configuration_path",
          discovery: "framework-discovered",
        }),
      ]),
    );
  });

  test("classifies candidate paths, differences, unrelated dirty files, and dependency tracing", () => {
    const record = readJson<JsonObject>(recordPath);
    const inventory = record.candidate_worktree_difference_inventory as JsonObject[];
    const summary = record.candidate_worktree_static_comparison_summary as JsonObject;

    expect(inventory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "app/api/recommendations/evaluate-outcomes/route.ts",
          classification: "candidate_approved_path",
          trace: "route-discovered",
        }),
        expect.objectContaining({
          path: "app/globals.css",
          classification: "candidate_approved_path",
          trace: "CSS-discovered",
        }),
        expect.objectContaining({
          path: "public_supabase_browser_configuration",
          classification: "configuration_difference",
          trace: "framework-discovered",
        }),
        expect.objectContaining({
          path: "post-trade-uncommitted-worktree-files",
          classification: "active_worktree_unrelated_dirty_path",
          trace: "not referenced",
        }),
        expect.objectContaining({
          path: "action-control-uncommitted-files",
          classification: "control_only_artifact",
          trace: "not referenced",
        }),
      ]),
    );
    expect(summary.candidate_changed_paths).toBe(32);
    expect(summary.candidate_paths_missing_from_current_worktree).toBe(0);
    expect(summary.candidate_paths_with_material_hash_divergence).toBe(0);
    expect(Number(summary.unrelated_dirty_post_trade_path_count)).toBeGreaterThan(0);
  });

  test("covers complete, missing, outdated, and runner-only closure paths deterministically", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.runtime_build_closure_reassessment).toBe(
      "candidate_runtime_build_closure_still_complete",
    );
    expect(record.additional_build_required_paths).toEqual([]);
    expect(record.outdated_build_required_paths).toEqual([]);
    expect(record.candidate_file_count_impact).toBe(0);
    expect(record.candidate_defect_status).toBe("candidate_defect_not_proven");
    expect(record.candidate_hash_impact).toBe("candidate_hash_change_not_required");
  });

  test("uses approved vocabularies and deterministic remediation mapping", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.dual_engine_relationship).toBe("shared_runner_environment_failure");
    expect(record.remediation_readiness).toBe("build_failure_remediation_ready");
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.next_action).toBe("action_524_turbopack_runner_environment_remediation_gate");
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("performs no build, rehearsal, deployment, activation, provider, Supabase, replay, or confidence effects", () => {
    const record = readJson<JsonObject>(recordPath);
    const falseKeys = [
      "candidate_modified",
      "build_performed",
      "webpack_executed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "network_used",
      "install_performed",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ];

    for (const key of falseKeys) {
      expect(record[key], key).toBe(false);
    }
  });

  test("runs Action 523 verifier", () => {
    const output = execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" });
    const result = JSON.parse(output) as JsonObject;

    expect(result.verification_status).toBe("passed");
    expect(result.remediation_readiness).toBe("build_failure_remediation_ready");
    expect(result.approval_decision).toBe("approved");
    expect(result.next_action).toBe("action_524_turbopack_runner_environment_remediation_gate");
    expect(result.failures).toEqual([]);
  });
});
