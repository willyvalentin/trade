import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const verifierPath = "scripts/action-414-expanded-static-pattern-discovery-hash-freeze-verify.mjs";
const freezePath = "scripts/action-414-expanded-static-pattern-discovery-hash-freeze.mjs";
const docPath = "docs/action-414-expanded-static-pattern-discovery-hash-freeze.md";
const inventoryPath = "docs/action-414-expanded-static-pattern-discovery-hash-inventory.json";

type Action414Report = Readonly<{
  verification_status: string;
  hash_freeze_result: string;
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  unresolved_conditions: readonly string[];
  scenario_count: number;
  scenario_ids: readonly string[];
  coverage_families: readonly string[];
  status_distribution: Readonly<Record<string, number>>;
  warning_distribution: Readonly<Record<string, number>>;
  insight_count_distribution: Readonly<Record<string, number>>;
  full_inventory_sha256: string;
  repeat_freeze: Readonly<{
    run_count: number;
    identical: boolean;
    third_run_executed: boolean;
  }>;
  historical_baseline_integrity: string;
  bounded_metadata_result: string;
  forbidden_artifacts_found: readonly string[];
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
  recommended_next_action: string;
}>;

type Action414Inventory = Readonly<{
  inventory_schema_version: string;
  static_only: boolean;
  non_production: boolean;
  non_authoritative: boolean;
  no_persistence: boolean;
  no_replay: boolean;
  no_runtime: boolean;
  no_feedback: boolean;
  scenario_count: number;
  scenario_ids: readonly string[];
  scenarios: readonly {
    scenario_id: string;
    coverage_family: string;
    source_classification: string;
    row_count: number;
    row_ids: readonly string[];
    canonical_row_hashes: readonly string[];
    expected_status: string;
    expected_warnings: readonly string[];
    expected_insight_count: number;
    support_counts: Readonly<Record<string, number>>;
    outcome_counts: Readonly<Record<string, number>>;
    duplicate_clusters: readonly string[];
    semantic_hashes: Readonly<{
      canonical_scenario_input_sha256: string;
      ordered_row_set_sha256: string;
      evidence_set_sha256: string | null;
      group_hashes: readonly string[];
      insight_ids: readonly string[];
      insight_hashes: readonly string[];
      canonical_result_sha256: string;
      scenario_summary_sha256: string;
    }>;
    blocked_issue_metadata: readonly Readonly<{ code: string; path: string }>[];
    implementation_observation: Readonly<Record<string, unknown>>;
  }[];
  full_inventory_sha256: string;
  freeze_runs: Readonly<{
    run_count: number;
    run_1_inventory_payload_sha256: string;
    run_2_inventory_payload_sha256: string;
    identical: boolean;
    third_run_executed: boolean;
  }>;
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
}>;

const expectedScenarioIds = [
  "pd413_01_action411_baseline_insufficient_evidence",
  "pd413_02_threshold_19_case_20_completed",
  "pd413_03_threshold_20_case_19_completed",
  "pd413_04_discovered_20_20_all_unique",
  "pd413_05_discovered_24_24_above_threshold",
  "pd413_06_discovered_with_one_duplicate_pair",
  "pd413_07_discovered_with_large_duplicate_cluster",
  "pd413_08_discovered_with_multiple_duplicate_clusters",
  "pd413_09_mixed_positive_negative_discovered",
  "pd413_10_positive_negative_neutral_discovered",
  "pd413_11_negative_majority_discovered",
  "pd413_12_reordered_input_stability",
  "pd413_13_numeric_positive_negative_aggregation",
  "pd413_14_numeric_rounding_boundary",
  "pd413_15_numeric_signed_zero_and_null_metrics",
  "pd413_16_metric_unavailable_warning",
  "pd413_17_insufficient_with_duplicate_warning_combo",
  "pd413_18_unsupported_second_setup_family_blocked",
  "pd413_19_missing_grouping_field_blocked",
  "pd413_20_nondeterministic_grouping_blocked",
  "pd413_21_horizon_15m_unsupported_blocked",
  "pd413_22_horizon_30m_unsupported_blocked",
  "pd413_23_invalid_lineage_blocked",
  "pd413_24_future_leakage_blocked",
  "pd413_25_non_consumable_row_blocked",
  "pd413_26_unsupported_mapper_status_blocked",
  "pd413_27_missing_outcome_blocked",
  "pd413_28_nonfinite_numeric_blocked",
  "pd413_29_invalid_configuration_blocked",
  "pd413_30_duplicate_source_case_id_blocked",
];

let report: Action414Report;
let inventory: Action414Inventory;
let verifierOutput = "";
let freezeCheckOutput = "";

function runVerifier(): Action414Report {
  verifierOutput = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 120_000,
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      ["TWELVE" + "_DATA_API_KEY"]: "twelve-data-secret-that-must-not-appear",
    },
  });
  return JSON.parse(verifierOutput) as Action414Report;
}

test.describe.serial("Action 414 expanded static Pattern Discovery hash freeze", () => {
  test.beforeAll(() => {
    report = runVerifier();
    inventory = JSON.parse(readFileSync(inventoryPath, "utf8")) as Action414Inventory;
    freezeCheckOutput = execFileSync("node", [freezePath, "--check"], {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 120_000,
    });
  });

  test("documentation contract inventory and verifier succeed", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(inventoryPath)).toBe(true);
    expect(existsSync(freezePath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.hash_freeze_result).toBe("hash_freeze_passed");
    expect(report.failed_checks).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
    expect(doc).toContain("## Next Action 415 Approval Gate");
  });

  test("inventory schema and safety declarations are exact", () => {
    expect(inventory.inventory_schema_version).toBe("action_414_expanded_static_pattern_discovery_hash_inventory_v1");
    expect(inventory.static_only).toBe(true);
    expect(inventory.non_production).toBe(true);
    expect(inventory.non_authoritative).toBe(true);
    expect(inventory.no_persistence).toBe(true);
    expect(inventory.no_replay).toBe(true);
    expect(inventory.no_runtime).toBe(true);
    expect(inventory.no_feedback).toBe(true);
  });

  test("exact 30 scenario IDs and coverage families are frozen", () => {
    expect(report.scenario_count).toBe(30);
    expect(inventory.scenario_count).toBe(30);
    expect(report.scenario_ids).toEqual(expectedScenarioIds);
    expect(inventory.scenario_ids).toEqual(expectedScenarioIds);
    expect(report.coverage_families).toEqual(expect.arrayContaining([
      "baseline",
      "threshold_boundary",
      "sufficient_support",
      "duplicate_structure",
      "mixed_evidence",
      "neutral_evidence",
      "grouping_block",
      "horizon_block",
      "lineage_safety",
      "row_safety",
      "numeric_behavior",
      "configuration_safety",
    ]));
  });

  test("historical baseline preserves Action 411 hashes", () => {
    const baseline = inventory.scenarios[0];

    expect(report.historical_baseline_integrity).toBe("passed");
    expect(baseline.scenario_id).toBe("pd413_01_action411_baseline_insufficient_evidence");
    expect(baseline.semantic_hashes.evidence_set_sha256).toBe("f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8");
    expect(baseline.semantic_hashes.group_hashes).toEqual(["aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e"]);
    expect(baseline.semantic_hashes.canonical_result_sha256).toBe("e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c");
    expect(baseline.semantic_hashes.scenario_summary_sha256).toBe("bad2ba397af95ace6883e2ea45bbd046bd4d6ad23264103aef34184468853be3");
  });

  test("status warning and insight distributions are frozen", () => {
    expect(report.status_distribution).toEqual({
      blocked_future_leakage: 1,
      blocked_invalid_configuration: 1,
      blocked_invalid_input: 6,
      blocked_invalid_lineage: 2,
      blocked_non_consumable_row: 2,
      blocked_nondeterministic_grouping: 1,
      discovered: 9,
      discovered_with_warnings: 4,
      insufficient_evidence: 4,
    });
    expect(report.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 5,
      metric_value_unavailable: 1,
      minimum_completed_outcomes_not_met: 4,
      minimum_total_support_not_met: 3,
    });
    expect(report.insight_count_distribution).toEqual({ "0": 17, "1": 13 });
  });

  test("support boundaries discovered and discovered-with-warnings scenarios are represented", () => {
    const byId = new Map(inventory.scenarios.map((scenario) => [scenario.scenario_id, scenario]));

    expect(byId.get("pd413_02_threshold_19_case_20_completed")?.expected_status).toBe("insufficient_evidence");
    expect(byId.get("pd413_03_threshold_20_case_19_completed")?.support_counts.completed_outcome_count).toBe(19);
    expect(byId.get("pd413_04_discovered_20_20_all_unique")?.expected_status).toBe("discovered");
    expect(byId.get("pd413_06_discovered_with_one_duplicate_pair")?.expected_status).toBe("discovered_with_warnings");
    expect(byId.get("pd413_16_metric_unavailable_warning")?.expected_warnings).toEqual(["metric_value_unavailable"]);
  });

  test("mixed neutral duplicate and numeric scenarios freeze bounded metadata", () => {
    const byId = new Map(inventory.scenarios.map((scenario) => [scenario.scenario_id, scenario]));

    expect(byId.get("pd413_09_mixed_positive_negative_discovered")?.outcome_counts).toMatchObject({ positive_count: 12, negative_count: 10, neutral_count: 0 });
    expect(byId.get("pd413_10_positive_negative_neutral_discovered")?.outcome_counts.neutral_count).toBe(4);
    expect(byId.get("pd413_07_discovered_with_large_duplicate_cluster")?.duplicate_clusters.length).toBeGreaterThan(0);
    expect(byId.get("pd413_08_discovered_with_multiple_duplicate_clusters")?.duplicate_clusters.length).toBeGreaterThan(1);
    expect(byId.get("pd413_14_numeric_rounding_boundary")?.coverage_family).toBe("numeric_behavior");
    expect(byId.get("pd413_15_numeric_signed_zero_and_null_metrics")?.expected_status).toBe("discovered");
  });

  test("blocked grouping horizon lineage leakage consumability configuration and numeric scenarios freeze issue metadata", () => {
    const blocked = inventory.scenarios.filter((scenario) => scenario.expected_status.startsWith("blocked_"));

    expect(blocked.length).toBe(13);
    expect(blocked.every((scenario) => scenario.blocked_issue_metadata.length > 0)).toBe(true);
    expect(blocked.map((scenario) => scenario.scenario_id)).toEqual(expect.arrayContaining([
      "pd413_18_unsupported_second_setup_family_blocked",
      "pd413_21_horizon_15m_unsupported_blocked",
      "pd413_23_invalid_lineage_blocked",
      "pd413_24_future_leakage_blocked",
      "pd413_25_non_consumable_row_blocked",
      "pd413_28_nonfinite_numeric_blocked",
      "pd413_29_invalid_configuration_blocked",
    ]));
  });

  test("row evidence group insight result and scenario hashes are frozen", () => {
    for (const scenario of inventory.scenarios) {
      expect(scenario.row_ids).toHaveLength(scenario.row_count);
      expect(scenario.canonical_row_hashes).toHaveLength(scenario.row_count);
      expect(scenario.canonical_row_hashes.every((hash) => /^[a-f0-9]{64}$/.test(hash))).toBe(true);
      expect(scenario.semantic_hashes.canonical_scenario_input_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(scenario.semantic_hashes.ordered_row_set_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(scenario.semantic_hashes.canonical_result_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(scenario.semantic_hashes.scenario_summary_sha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  test("independent canonicalization and current contract observations are recorded", () => {
    const currentLimitations = inventory.scenarios.filter((scenario) =>
      scenario.implementation_observation.current_contract_limitation === "frozen_action_413_expectation_not_fully_expressible_by_current_pure_contract");

    expect(report.checks.independent_canonicalization).toBe(true);
    expect(currentLimitations.length).toBeGreaterThan(0);
    expect(currentLimitations.map((scenario) => scenario.scenario_id)).toContain("pd413_03_threshold_20_case_19_completed");
  });

  test("exact two freeze runs produce identical inventory hash", () => {
    const checkReport = JSON.parse(freezeCheckOutput) as { full_inventory_sha256: string; repeat_freeze_identical: boolean; mode: string };

    expect(report.repeat_freeze.run_count).toBe(2);
    expect(report.repeat_freeze.identical).toBe(true);
    expect(report.repeat_freeze.third_run_executed).toBe(false);
    expect(checkReport.mode).toBe("check");
    expect(checkReport.repeat_freeze_identical).toBe(true);
    expect(checkReport.full_inventory_sha256).toBe(report.full_inventory_sha256);
    expect(inventory.full_inventory_sha256).toBe(report.full_inventory_sha256);
  });

  test("bounded metadata contains no full rows results insights contexts outcomes or secrets", () => {
    const text = readFileSync(inventoryPath, "utf8");

    expect(report.bounded_metadata_result).toBe("passed");
    expect(text).not.toContain("\"row\":");
    expect(text).not.toContain("\"rows\":");
    expect(text).not.toContain("\"outcome_fields\":");
    expect(text).not.toContain("\"setup_and_confidence\":");
    expect(verifierOutput).not.toContain("automation-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("supabase-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("twelve-data-secret-that-must-not-appear");
  });

  test("no runner manifest shadow persistence replay runtime provider Supabase or feedback effects exist", () => {
    expect(report.checks.no_expanded_runner).toBe(true);
    expect(report.checks.no_execution_manifest).toBe(true);
    expect(report.checks.no_shadow_evidence).toBe(true);
    expect(report.forbidden_artifacts_found).toEqual([]);
    for (const value of Object.values(report.no_effect_flags)) {
      expect(value).toBe(false);
    }
  });

  test("Actions 413 compatibility and runtime preview remain safe", () => {
    expect(report.checks.action413_approval_preserved).toBe(true);
    expect(report.checks.runtime_preview_untouched).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.recommended_next_action).toBe("action_415_expanded_static_shadow_approval_gate");
  });
});
