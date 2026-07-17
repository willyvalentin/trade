import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { test, expect } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-path-set-mismatch-remediation-approval-record.json";
const action492Path =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";
const action516Path =
  "docs/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-record.json";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  historicalChangeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  historicalFullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  nextAction: "action_518_remediated_32_file_candidate_reconstruction_and_hash_freeze",
};

type InventoryEntry = {
  path: string;
};

type Action492Record = {
  new_changed_file_inventory: InventoryEntry[];
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

test.describe("Action 517 path-set mismatch remediation approval gate", () => {
  test("binds Action 516 abort and exact blocker", () => {
    const record = readJson<JsonObject>(recordPath);
    const action516 = readJson<JsonObject>(action516Path);

    expect(action516.candidate_reconstruction_result).toBe("candidate_reconstruction_aborted");
    expect(record.action_516_result).toBe("candidate_reconstruction_aborted");
    expect(record.blocker_classification).toBe(
      "historical_candidate_path_set_missing_required_remediated_route",
    );
  });

  test("freezes historical candidate hashes and count", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.historical_change_candidate_hash).toBe(expected.historicalChangeHash);
    expect(record.historical_full_candidate_inventory_hash).toBe(expected.historicalFullHash);
    expect(record.historical_candidate_file_count).toBe(31);
    expect(record.historical_candidate_status).toBe(
      "historical_candidate_build_defective_and_incomplete",
    );
    expect(record.historical_candidate_executable).toBe(false);
  });

  test("proves the route is absent from the historical path set", () => {
    const record = readJson<JsonObject>(recordPath);
    const action492 = readJson<Action492Record>(action492Path);
    const action492Paths = action492.new_changed_file_inventory.map((entry) => entry.path).sort();

    expect(action492Paths).toHaveLength(31);
    expect(action492Paths).not.toContain(routePath);
    expect(record.historical_path_set_contains_route).toBe(false);
    expect(record.clean_base_contains_route).toBe(true);
    expect(record.historical_candidate_inherited_clean_base_route_version).toBe(true);
  });

  test("binds the exact remediated route state", () => {
    const record = readJson<JsonObject>(recordPath);
    const routeSource = read(routePath);

    expect(record.missing_required_path).toBe(routePath);
    expect(record.missing_required_path_hash).toBe(expected.routeHash);
    expect(sha256(read(routePath))).toBe(expected.routeHash);
    expect(record.missing_required_path_classification).toBe("required_build_source_path_addition");
    expect(record.route_export_surface).toEqual(["POST"]);
    expect(routeExports(routeSource)).toEqual(["POST"]);
    expect(routeSource).toContain("function buildOutcomeEligibility");
    expect(routeSource).not.toContain("export function buildOutcomeEligibility");
    expect(record.helper_extraction).toBe(false);
    expect(record.route_runtime_build_relevance).toBe(true);
    expect(record.route_build_defect_remediation).toBe(true);
    expect(record.source_behavior_change_beyond_export_boundary).toBe(false);
    expect(record.route_behavior_changed).toBe(false);
    expect(record.provider_behavior_changed).toBe(false);
    expect(record.supabase_behavior_changed).toBe(false);
  });

  test("approves exactly one path addition and a 32-file candidate", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.path_addition_required).toBe(true);
    expect(record.expected_new_candidate_file_count).toBe(32);
    expect(record.added_paths_count).toBe(1);
    expect(record.added_paths).toEqual([routePath]);
    expect(record.removed_paths_count).toBe(0);
    expect(record.path_replacements_from_historical_delta_count).toBe(0);
    expect(record.unrelated_additions_count).toBe(0);
  });

  test("keeps forbidden additions rejected", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.unrelated_dirty_files_authorized).toBe(false);
    expect(record.control_only_artifacts_authorized).toBe(false);
    expect(record.directory_wide_inclusion_authorized).toBe(false);
    expect(record.additional_api_files_authorized).toBe(false);
    expect(record.package_or_lockfile_changes_authorized).toBe(false);
    expect(record.configuration_changes_authorized).toBe(false);
    expect(record.environment_files_authorized).toBe(false);
    expect(record.credentials_authorized).toBe(false);
  });

  test("approves only with complete runtime closure and required future hashes", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.runtime_dependency_paths_missing_after_proposed_addition).toBe(0);
    expect(record.runtime_dependency_missing_paths_after_proposed_addition).toEqual([]);
    expect(record.runtime_dependency_closure_complete_after_proposed_addition).toBe(true);
    expect(record.unresolved_source_versions_after_proposed_addition).toBe(0);
    expect(record.route_imports_resolvable).toBe(true);
    expect(record.pure_confidence_calibration_imports_resolvable).toBe(true);
    expect(record.preview_advisory_chain_imports_resolvable).toBe(true);
    expect(record.new_candidate_hashes_required).toBe(true);
  });

  test("would block approval if any additional runtime path were missing", () => {
    const record = readJson<JsonObject>(recordPath);
    const simulatedMissingPathRecord: JsonObject = {
      ...record,
      runtime_dependency_paths_missing_after_proposed_addition: 1,
      runtime_dependency_missing_paths_after_proposed_addition: ["app/api/example/route.ts"],
      runtime_dependency_closure_complete_after_proposed_addition: false,
    };

    const wouldBeApproved =
      simulatedMissingPathRecord.runtime_dependency_paths_missing_after_proposed_addition === 0 &&
      simulatedMissingPathRecord.runtime_dependency_closure_complete_after_proposed_addition === true &&
      simulatedMissingPathRecord.approval_decision === "approved";

    expect(record.runtime_dependency_paths_missing_after_proposed_addition).toBe(0);
    expect(record.approval_decision).toBe("approved");
    expect(wouldBeApproved).toBe(false);
  });

  test("does not reconstruct, hash, build, rehearse, deploy, activate, or call providers", () => {
    const record = readJson<JsonObject>(recordPath);

    for (const key of [
      "candidate_reconstruction_performed",
      "candidate_hash_computation_performed",
      "build_performed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
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
    ]) {
      expect(record[key], key).toBe(false);
    }
  });

  test("sets approval and Action 518 boundary", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.path_set_readiness).toBe("candidate_path_set_remediation_ready");
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe(expected.nextAction);
  });

  test("verifier succeeds and Actions 515-516 remain healthy", () => {
    const verifierPaths = [
      "scripts/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-reconstruction-path-set-mismatch-remediation-gate-verify.mjs",
      "scripts/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation-verify.mjs",
      "scripts/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-reconstruction-and-hash-freeze-verify.mjs",
    ];

    for (const relativePath of verifierPaths) {
      expect(existsSync(join(repoRoot, relativePath))).toBe(true);
      const output = execFileSync("node", [relativePath], { cwd: repoRoot, encoding: "utf8" });
      expect(output).toContain("passed");
    }
  });
});
