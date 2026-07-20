import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { test, expect } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-record.json";
const docPath =
  "docs/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-reconstruction-and-hash-freeze.md";
const action492Path =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";
const action514Path =
  "docs/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-record.json";
const action515Path =
  "docs/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation-record.json";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  historicalChangeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  historicalFullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  historicalPathSetHash: "8f1d84af0e5bc4f377bd4d0215a53d68f0302a8bee09d2be8f869ae7e4d364f6",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  helperHash: "8b3e4694f83003104ec764f3afa81c4f1e9b87543b3241e4785dd6bdd3d32afe",
  nextAction: "action_517_candidate_reconstruction_path_set_mismatch_remediation_gate",
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

function extractHelperBody(source: string): string | null {
  const start = source.indexOf("function buildOutcomeEligibility");
  if (start < 0) return null;
  let depth = 0;
  let seenBody = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") {
      depth += 1;
      seenBody = true;
    } else if (char === "}") {
      depth -= 1;
      if (seenBody && depth === 0) return source.slice(start, index + 1);
    }
  }
  return null;
}

function routeExports(source: string): string[] {
  return [...source.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm)].map(
    (match) => match[1],
  );
}

test.describe("Action 516 remediated runtime-complete candidate reconstruction", () => {
  test("records the Action 515 remediation and historical candidate bindings", () => {
    const record = readJson<JsonObject>(recordPath);
    const action514 = readJson<JsonObject>(action514Path);
    const action515 = readJson<JsonObject>(action515Path);

    expect(action514.candidate_defect_status).toBe("candidate_defect_proven");
    expect(action515.remediation_result).toBe("candidate_build_source_remediation_completed");
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.historical_change_candidate_hash).toBe(expected.historicalChangeHash);
    expect(record.historical_full_candidate_inventory_hash).toBe(expected.historicalFullHash);
    expect(record.historical_candidate_file_count).toBe(31);
    expect(record.historical_candidate_status).toBe("historical_candidate_build_defective");
  });

  test("verifies the exact remediated route and export surface", () => {
    const record = readJson<JsonObject>(recordPath);
    const routeSource = read(routePath);
    const helperBody = extractHelperBody(routeSource);

    expect(record.remediated_path).toBe(routePath);
    expect(record.remediated_path_hash).toBe(expected.routeHash);
    expect(sha256(read(routePath))).toBe(expected.routeHash);
    expect(routeSource).not.toContain("export function buildOutcomeEligibility");
    expect(routeSource).toContain("function buildOutcomeEligibility");
    expect(routeExports(routeSource)).toEqual(["POST"]);
    expect(record.route_export_surface).toEqual(["POST"]);
    expect(helperBody).not.toBeNull();
    expect(sha256(helperBody ?? "")).toBe(expected.helperHash);
    expect(record.helper_behavior_changed).toBe(false);
    expect(record.route_behavior_changed).toBe(false);
  });

  test("proves the Action 492 changed path set cannot support a 31-file replacement", () => {
    const record = readJson<JsonObject>(recordPath);
    const action492 = readJson<Action492Record>(action492Path);
    const action492Paths = action492.new_changed_file_inventory.map((entry) => entry.path).sort();

    expect(action492Paths).toHaveLength(31);
    expect(sha256(JSON.stringify(action492Paths))).toBe(expected.historicalPathSetHash);
    expect(action492Paths).not.toContain(routePath);
    expect(record.historical_candidate_route_path_present).toBe(false);
    expect(record.historical_candidate_path_set_mismatch).toBe(true);
    expect(record.would_be_changed_file_count_if_route_added).toBe(32);
    expect(record.exact_path_additions_required).toEqual([routePath]);
    expect(record.content_replacement_policy_satisfied).toBe(false);
  });

  test("does not freeze new hashes when reconstruction is aborted", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.candidate_reconstruction_result).toBe("candidate_reconstruction_aborted");
    expect(record.candidate_reconstruction_blocker).toBe(
      "historical_candidate_path_set_missing_remediated_route",
    );
    expect(record.new_candidate_file_count).toBeNull();
    expect(record.new_change_candidate_hash).toBeNull();
    expect(record.new_full_candidate_inventory_hash).toBeNull();
    expect(record.new_hashes_authoritative).toBe(false);
    expect(record.new_candidate_authoritative_for_future_actions).toBe(false);
    expect(record.next_action).toBe(expected.nextAction);
  });

  test("excludes unrelated, control, environment, node_modules, and build output files", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.unrelated_dirty_files_included).toBe(false);
    expect(record.control_only_artifacts_added).toBe(false);
    expect(record.environment_or_credentials_included).toBe(false);
    expect(record.node_modules_included).toBe(false);
    expect(record.build_output_included).toBe(false);
    expect(record.unclassified_files_included).toBe(false);
  });

  test("keeps all no-effect and cleanup guarantees", () => {
    const record = readJson<JsonObject>(recordPath);

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
    ]) {
      expect(record[key], key).toBe(false);
    }
    expect(record.cleanup_result).toBe("temporary_candidate_not_created_preflight_abort");
    expect(record.temporary_candidate_absent_after_cleanup).toBe(true);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("documents the blocker and does not expose secrets", () => {
    const doc = read(docPath);

    expect(doc).toContain("candidate_reconstruction_aborted");
    expect(doc).toContain(routePath);
    expect(doc).toContain(expected.routeHash);
    expect(doc).toContain(expected.nextAction);
    expect(doc).toContain("No build");
    expect(doc).toContain("No temporary candidate was created");
    expect(doc).not.toContain("AUTOMATION_SECRET=");
    expect(doc).not.toContain("SUPABASE_SERVICE_ROLE_KEY=");
    expect(doc).not.toContain("TWELVE_DATA_API_KEY=");
  });

  test("verifier succeeds and Actions 514-515 remain healthy", () => {
    const verifierPath =
      "scripts/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-reconstruction-and-hash-freeze-verify.mjs";
    const action514Verifier =
      "scripts/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-after-invocation-remediation-verify.mjs";
    const action515Verifier =
      "scripts/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation-verify.mjs";

    for (const relativePath of [verifierPath, action514Verifier, action515Verifier]) {
      expect(existsSync(join(repoRoot, relativePath))).toBe(true);
      const output = execFileSync("node", [relativePath], { cwd: repoRoot, encoding: "utf8" });
      expect(output).toContain("passed");
    }
  });
});
