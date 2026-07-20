import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { test, expect } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json";
const action492Path =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";
const action517Path =
  "docs/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-path-set-mismatch-remediation-approval-record.json";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  historicalChangeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  historicalFullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  newChangeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  newFullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  nextAction: "action_519_remediated_32_file_candidate_build_rehearsal_approval_gate",
};

type InventoryEntry = {
  path: string;
  sha256: string | null;
  classification: string;
  provenance: string;
  source_classification: string;
};

type CandidateRecord = Record<string, unknown> & {
  new_changed_file_inventory: InventoryEntry[];
};

type Action492Record = {
  new_changed_file_inventory: InventoryEntry[];
  new_candidate_file_count: number;
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

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sortValue((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

function canonical(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function routeExports(source: string): string[] {
  return [...source.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm)].map(
    (match) => match[1],
  );
}

test.describe("Action 518 remediated 32-file candidate reconstruction and hash freeze", () => {
  test("binds Action 517 approval and historical candidate status", () => {
    const record = readJson<CandidateRecord>(recordPath);
    const action517 = readJson<JsonObject>(action517Path);

    expect(action517.path_set_readiness).toBe("candidate_path_set_remediation_ready");
    expect(action517.approval_decision).toBe("approved");
    expect(record.source_action).toBe(517);
    expect(record.historical_change_candidate_hash).toBe(expected.historicalChangeHash);
    expect(record.historical_full_candidate_inventory_hash).toBe(expected.historicalFullHash);
    expect(record.historical_candidate_file_count).toBe(31);
    expect(record.historical_candidate_status).toBe(
      "historical_candidate_build_defective_and_incomplete",
    );
  });

  test("freezes the exact route addition and route export surface", () => {
    const record = readJson<CandidateRecord>(recordPath);
    const routeSource = read(routePath);
    const routeEntry = record.new_changed_file_inventory.find((entry) => entry.path === routePath);

    expect(record.added_route_path).toBe(routePath);
    expect(record.added_route_hash).toBe(expected.routeHash);
    expect(sha256(routeSource)).toBe(expected.routeHash);
    expect(record.added_route_classification).toBe("required_build_source_path_addition");
    expect(record.added_route_provenance).toEqual([514, 515, 516, 517]);
    expect(record.route_export_surface).toEqual(["POST"]);
    expect(routeExports(routeSource)).toEqual(["POST"]);
    expect(routeSource).toContain("function buildOutcomeEligibility");
    expect(routeSource).not.toContain("export function buildOutcomeEligibility");
    expect(routeEntry?.sha256).toBe(expected.routeHash);
    expect(routeEntry?.classification).toBe("required_build_source_path_addition");
  });

  test("retains 31 historical paths and adds exactly one route path", () => {
    const record = readJson<CandidateRecord>(recordPath);
    const action492 = readJson<Action492Record>(action492Path);
    const recordPaths = record.new_changed_file_inventory.map((entry) => entry.path).sort();
    const historicalPaths = action492.new_changed_file_inventory.map((entry) => entry.path).sort();
    const retainedPaths = recordPaths.filter((relativePath) => relativePath !== routePath);

    expect(action492.new_candidate_file_count).toBe(31);
    expect(retainedPaths).toEqual(historicalPaths);
    expect(record.retained_historical_path_count).toBe(31);
    expect(record.added_path_count).toBe(1);
    expect(record.added_paths).toEqual([routePath]);
    expect(record.removed_path_count).toBe(0);
    expect(record.unrelated_additions_count).toBe(0);
    expect(record.unclassified_additions_count).toBe(0);
    expect(record.new_candidate_file_count).toBe(32);
    expect(record.new_changed_file_inventory).toHaveLength(32);
    expect(new Set(recordPaths).size).toBe(32);
  });

  test("rejects sibling API, directory-wide, unrelated dirty, and control-file inclusion", () => {
    const record = readJson<CandidateRecord>(recordPath);
    const recordPaths = record.new_changed_file_inventory.map((entry) => entry.path);

    expect(recordPaths.filter((relativePath) => relativePath.startsWith("app/api/"))).toEqual([
      routePath,
    ]);
    expect(record.directory_wide_app_api_inclusion).toBe(false);
    expect(record.additional_api_paths_added).toBe(false);
    expect(record.unrelated_dirty_files_included).toBe(false);
    expect(record.control_only_artifacts_added).toBe(false);
    expect(record.later_action_control_artifacts_newly_included).toBe(false);
    expect(record.environment_or_credentials_included).toBe(false);
    expect(record.node_modules_included).toBe(false);
    expect(record.build_output_included).toBe(false);
    expect(record.unclassified_files_included).toBe(false);
    expect(recordPaths.some((relativePath) => relativePath.includes("post-trade"))).toBe(false);
    expect(recordPaths.some((relativePath) => relativePath.includes("action-518"))).toBe(false);
  });

  test("freezes deterministic new hashes that supersede Action 492 hashes", () => {
    const record = readJson<CandidateRecord>(recordPath);
    const recomputedChangeHash = sha256(canonical(record.new_changed_file_inventory));

    expect(record.new_change_candidate_hash).toBe(expected.newChangeHash);
    expect(recomputedChangeHash).toBe(expected.newChangeHash);
    expect(record.new_change_candidate_hash).not.toBe(expected.historicalChangeHash);
    expect(record.new_full_candidate_inventory_hash).toBe(expected.newFullHash);
    expect(record.new_full_candidate_inventory_hash).not.toBe(expected.historicalFullHash);
    expect(record.full_candidate_hash_material).toMatchObject({
      approved_change_candidate_file_count: 32,
      approved_change_candidate_hash: expected.newChangeHash,
      full_candidate_build_result: "not_run_action_518_hash_freeze_only",
      full_candidate_test_result: "not_run_action_518_hash_freeze_only",
    });
  });

  test("records complete runtime closure and zero missing paths", () => {
    const record = readJson<CandidateRecord>(recordPath);

    expect(record.actual_delta_count).toBe(32);
    expect(record.expected_delta_count).toBe(32);
    expect(record.unexpected_delta_paths).toEqual([]);
    expect(record.missing_delta_paths).toEqual([]);
    expect(record.runtime_dependency_paths_missing).toBe(0);
    expect(record.runtime_dependency_missing_paths).toEqual([]);
    expect(record.runtime_dependency_closure_complete).toBe(true);
    expect(record.runtime_preview_consumer_imports_resolvable).toBe(true);
    expect(record.advisory_adapter_imports_resolvable).toBe(true);
    expect(record.projection_imports_resolvable).toBe(true);
    expect(record.pure_confidence_calibration_imports_resolvable).toBe(true);
    expect(record.evaluate_outcomes_route_imports_resolvable).toBe(true);
    expect(record.type_only_build_imports_resolvable).toBe(true);
    expect(record.route_import_closure_complete).toBe(true);
  });

  test("sets supersession and no-effect policy", () => {
    const record = readJson<CandidateRecord>(recordPath);

    expect(record.candidate_reconstruction_result).toBe(
      "remediated_32_file_candidate_reconstructed_and_frozen",
    );
    expect(record.historical_candidate_executable).toBe(false);
    expect(record.old_deployment_approval_executable).toBe(false);
    expect(record.new_candidate_status).toBe("remediated_32_file_runtime_complete_candidate");
    expect(record.new_candidate_authoritative_for_future_actions).toBe(true);
    expect(record.action_518_deployment_approval_granted).toBe(false);

    for (const key of [
      "build_performed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "environment_modified",
      "network_used",
      "install_performed",
      "netlify_operation_performed",
      "provider_call_executed",
      "supabase_read_executed",
      "supabase_write_executed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "scanner_changed",
      "ranking_changed",
      "execution_changed",
      "add_trade_changed",
      "risk_sizing_changed",
      "downstream_behavior_changed",
    ]) {
      expect(record[key], key).toBe(false);
    }
  });

  test("records cleanup, runtime preview waiting, and Action 519 boundary", () => {
    const record = readJson<CandidateRecord>(recordPath);

    expect(record.cleanup_result).toBe("temporary_candidate_removed");
    expect(record.temporary_candidate_absent_after_cleanup).toBe(true);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.preview_flag_state).toBe("absent_or_disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.next_action).toBe(expected.nextAction);
  });

  test("verifier succeeds and Actions 516-517 remain healthy", () => {
    const verifierPaths = [
      "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
      "scripts/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-reconstruction-and-hash-freeze-verify.mjs",
      "scripts/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-reconstruction-path-set-mismatch-remediation-gate-verify.mjs",
    ];

    for (const relativePath of verifierPaths) {
      expect(existsSync(join(repoRoot, relativePath))).toBe(true);
      const output = execFileSync("node", [relativePath], { cwd: repoRoot, encoding: "utf8" });
      expect(output).toContain("passed");
    }
  });
});
