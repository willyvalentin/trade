import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action426Inventory = Readonly<{
  inventory_schema_version: string;
  scenario_count: number;
  scenario_ids: readonly string[];
  status_distribution: Record<string, number>;
  warning_distribution: Record<string, number>;
  issue_distribution: Record<string, number>;
  full_inventory_sha256: string;
  bounded_metadata_only: boolean;
  full_insights_retained: boolean;
  full_pattern_discovery_results_retained: boolean;
  recommendation_objects_retained: boolean;
  shadow_runner_created: boolean;
  execution_manifest_created: boolean;
  calibration_shadow_executed: boolean;
  recommendation_mutated: boolean;
  runtime_preview_status: string;
  no_effect_flags: Record<string, boolean>;
  scenarios: ReadonlyArray<Readonly<{
    scenario_id: string;
    coverage_family: string;
    status: string;
    base_confidence: Readonly<{ canonical_basis_points: number | string; json_representation: number | string }>;
    individual_deltas_basis_points: ReadonlyArray<Readonly<{ base_delta_basis_points: number; adjusted_delta_basis_points: number; warning_codes: readonly string[] }>>;
    pre_cap_aggregate_delta_basis_points: number | null;
    post_cap_aggregate_delta_basis_points: number | null;
    final_proposed_confidence_basis_points: number | null;
    clamping_state: Readonly<{ clamped: boolean; warning_code: string | null }>;
    included_insight_ids: readonly string[];
    excluded_insight_ids: ReadonlyArray<Readonly<{ insight_id: string; reason: string }>>;
    warning_inventory: ReadonlyArray<Readonly<{ code: string; path: string }>>;
    issue_inventory: ReadonlyArray<Readonly<{ code: string; path: string }>>;
    overlap_resolution: Readonly<{ deduplicated_count: number; overlapping_excluded_count: number; conflict_count: number }>;
    calibration_id: string | null;
    identity_sha256: string | null;
    independent_identity_sha256: string | null;
    canonical_result_sha256: string;
    scenario_summary_sha256: string;
    insight_inventory: readonly unknown[];
  }>>;
}>;

type Action426Report = Readonly<{
  verification_status: string;
  failed_checks: readonly string[];
  scenario_count: number;
  full_inventory_sha256: string;
  recomputed_inventory_sha256: string;
  repeat_freeze_identical: boolean;
  forbidden_artifacts_found: readonly string[];
  tracked_action426_evidence_files: readonly string[];
  runtime_preview_status: string;
}>;

const inventoryPath = "docs/action-426-static-confidence-calibration-hash-inventory.json";
const docPath = "docs/action-426-static-confidence-calibration-hash-freeze.md";
const verifierPath = "scripts/action-426-static-confidence-calibration-hash-freeze-verify.mjs";
const freezePath = "scripts/action-426-static-confidence-calibration-hash-freeze.mjs";

test.setTimeout(240000);

function inventory(): Action426Inventory {
  return JSON.parse(readFileSync(inventoryPath, "utf8")) as Action426Inventory;
}

function byId(data: Action426Inventory, id: string) {
  const item = data.scenarios.find((scenario) => scenario.scenario_id === id);
  expect(item, id).toBeTruthy();
  return item!;
}

function runVerifier(): Action426Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 240000 })) as Action426Report;
}

test.describe.serial("Action 426 static Confidence Calibration hash freeze", () => {
  let data: Action426Inventory;
  let doc: string;
  let report: Action426Report;

  test.beforeAll(() => {
    execFileSync("node", [freezePath], { encoding: "utf8", timeout: 240000 });
    data = inventory();
    doc = readFileSync(docPath, "utf8");
    report = runVerifier();
  });

  test("documents contract, inventory schema, and exact 45 scenario IDs", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(inventoryPath)).toBe(true);
    expect(data.inventory_schema_version).toBe("action_426_static_confidence_calibration_hash_inventory_v1");
    expect(data.scenario_count).toBe(45);
    expect(data.scenario_ids).toEqual(Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`));
    expect(doc).toContain("Action 425 approved");
    expect(doc).toContain("Mandatory Action 427");
  });

  test("freezes protected hashes, configuration, confidence inputs, and full status coverage", () => {
    expect(data.status_distribution).toEqual({
      calibrated: 14,
      no_adjustment: 5,
      calibrated_with_warnings: 11,
      blocked_invalid_input: 9,
      blocked_overlapping_evidence: 1,
      blocked_unsupported_insight: 1,
      blocked_invalid_lineage: 1,
      blocked_future_leakage: 1,
      blocked_invalid_configuration: 1,
      insufficient_eligible_evidence: 1,
    });
    expect(Object.values(data.no_effect_flags).every((value) => value === false)).toBe(true);
    expect(byId(data, "cc425_32").base_confidence.canonical_basis_points).toBe(0);
    expect(byId(data, "cc425_31").base_confidence.canonical_basis_points).toBe(50);
    expect(byId(data, "cc425_43").base_confidence.canonical_basis_points).toBe(5000.1);
    expect(byId(data, "cc425_41").base_confidence.json_representation).toBe("NaN");
    expect(byId(data, "cc425_42").base_confidence.json_representation).toBe("Infinity");
  });

  test("freezes supportive adverse deltas, warning attenuation, duplicate-warning equivalence, and warning order", () => {
    expect(byId(data, "cc425_01").post_cap_aggregate_delta_basis_points).toBe(200);
    expect(byId(data, "cc425_02").post_cap_aggregate_delta_basis_points).toBe(100);
    expect(byId(data, "cc425_03").post_cap_aggregate_delta_basis_points).toBe(50);
    expect(byId(data, "cc425_06").post_cap_aggregate_delta_basis_points).toBe(-100);
    expect(byId(data, "cc425_07").post_cap_aggregate_delta_basis_points).toBe(-200);
    expect(byId(data, "cc425_08").post_cap_aggregate_delta_basis_points).toBe(-300);
    expect(byId(data, "cc425_09").post_cap_aggregate_delta_basis_points).toBe(100);
    expect(byId(data, "cc425_12").post_cap_aggregate_delta_basis_points).toBe(byId(data, "cc425_09").post_cap_aggregate_delta_basis_points);
    expect(byId(data, "cc425_12").warning_inventory).toEqual(byId(data, "cc425_09").warning_inventory);
    expect(byId(data, "cc425_12").canonical_result_sha256).not.toBe(byId(data, "cc425_09").canonical_result_sha256);
    expect(byId(data, "cc425_13").warning_inventory.map((warning) => warning.code)).toEqual([
      "duplicate_mapper_row_identity",
      "metric_value_unavailable",
    ]);
  });

  test("freezes contradictory warnings, duplicate insight, overlap, conflict, caps, clamp, and zero distinctions", () => {
    expect(byId(data, "cc425_14").issue_inventory[0].code).toBe("warning_status_contradiction");
    expect(byId(data, "cc425_23").overlap_resolution.deduplicated_count).toBe(1);
    expect(byId(data, "cc425_24").overlap_resolution.overlapping_excluded_count).toBe(1);
    expect(byId(data, "cc425_27").status).toBe("blocked_overlapping_evidence");
    expect(byId(data, "cc425_18").post_cap_aggregate_delta_basis_points).toBe(400);
    expect(byId(data, "cc425_19").post_cap_aggregate_delta_basis_points).toBe(-600);
    expect(byId(data, "cc425_29").clamping_state).toEqual({ clamped: true, warning_code: "confidence_clamped_to_bounds" });
    expect(byId(data, "cc425_31").clamping_state).toEqual({ clamped: true, warning_code: "confidence_clamped_to_bounds" });
    for (const id of ["cc425_04", "cc425_05", "cc425_20", "cc425_32", "cc425_33"]) {
      expect(byId(data, id).status).toBe("no_adjustment");
    }
    expect(byId(data, "cc425_45").status).toBe("insufficient_eligible_evidence");
  });

  test("freezes unsupported status, lineage, leakage, issue paths, calibration IDs, and semantic hashes", () => {
    expect(byId(data, "cc425_34").issue_inventory[0].code).toBe("ineligible_pattern_discovery_status");
    expect(byId(data, "cc425_35").status).toBe("blocked_invalid_lineage");
    expect(byId(data, "cc425_36").status).toBe("blocked_future_leakage");
    for (const scenario of data.scenarios) {
      expect(scenario.canonical_result_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(scenario.scenario_summary_sha256).toMatch(/^[a-f0-9]{64}$/);
      if (scenario.calibration_id) {
        expect(scenario.calibration_id).toMatch(/^confidence_calibration_v1:[a-f0-9]{24}$/);
        expect(scenario.identity_sha256).toBe(scenario.independent_identity_sha256);
      }
    }
  });

  test("verifies independent canonicalization, exact two freeze runs, bounded metadata, and no runtime effects", () => {
    expect(report.verification_status).toBe("passed");
    expect(report.failed_checks).toEqual([]);
    expect(report.scenario_count).toBe(45);
    expect(report.full_inventory_sha256).toBe(report.recomputed_inventory_sha256);
    expect(report.repeat_freeze_identical).toBe(true);
    expect(report.forbidden_artifacts_found).toEqual([]);
    expect(report.tracked_action426_evidence_files).toEqual([]);
    expect(data.bounded_metadata_only).toBe(true);
    expect(data.full_insights_retained).toBe(false);
    expect(data.full_pattern_discovery_results_retained).toBe(false);
    expect(data.recommendation_objects_retained).toBe(false);
    expect(data.shadow_runner_created).toBe(false);
    expect(data.execution_manifest_created).toBe(false);
    expect(data.calibration_shadow_executed).toBe(false);
    expect(data.recommendation_mutated).toBe(false);
    expect(data.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("keeps Actions 424 and 425 healthy", () => {
    const action424 = JSON.parse(execFileSync("node", ["scripts/action-424-independent-post-remediation-confidence-calibration-verification-verify.mjs"], { encoding: "utf8", timeout: 240000 })) as { verification_status: string };
    const action425 = JSON.parse(execFileSync("node", ["scripts/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate-verify.mjs"], { encoding: "utf8", timeout: 240000 })) as { verification_status: string };
    expect(action424.verification_status).toBe("passed");
    expect(action425.verification_status).toBe("passed");
  });
});
