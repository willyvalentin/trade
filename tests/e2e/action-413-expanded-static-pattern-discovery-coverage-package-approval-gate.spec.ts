import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate.md";
const verifierPath = "scripts/action-413-expanded-static-pattern-discovery-coverage-package-approval-gate-verify.mjs";

type Action413Report = Readonly<{
  verification_status: string;
  approval_decision: string;
  approval_vocabulary: readonly string[];
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions: readonly string[];
  scenario_count: number;
  scenario_ids: readonly string[];
  coverage_families: readonly string[];
  status_inventory: readonly string[];
  warning_inventory: readonly string[];
  insight_count_inventory: readonly number[];
  source_policy: Readonly<{
    allowed: readonly string[];
    blocked: readonly string[];
  }>;
  grouping_policy: Readonly<{
    grouping_dimension: string;
    successful_setup_family_literals: readonly string[];
    successful_horizons: readonly string[];
    unsupported_family_or_horizon_coverage: string;
  }>;
  hash_freeze_sequence: Readonly<{
    selected_sequence: string;
    next_action: string;
    execution_action: string;
    independent_verification_action: string;
  }>;
  forbidden_expanded_artifacts_found: readonly string[];
  runtime_preview_status: string;
  no_effect_flags: Readonly<Record<string, boolean>>;
  recommended_next_action: string;
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

let report: Action413Report;
let verifierOutput = "";

function runVerifier(): Action413Report {
  verifierOutput = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 120_000,
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
    },
  });
  return JSON.parse(verifierOutput) as Action413Report;
}

test.describe.serial("Action 413 expanded static Pattern Discovery coverage package approval gate", () => {
  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documentation contract and verifier succeed", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.failed_checks).toEqual([]);
    expect(report.checks.documentation_contract_complete).toBe(true);
    expect(doc).toContain("## Approval Decision");
    expect(doc).toContain("`approved_with_conditions`");
  });

  test("approval decision and Action 412 readiness are exact", () => {
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.approval_decision).toBe("approved_with_conditions");
    expect(report.checks.action412_ready_result).toBe(true);
    expect(report.passed_conditions_count).toBeGreaterThan(0);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions).toEqual([
      "semantic_hashes_for_29_new_static_scenarios_require_action_414_hash_freeze",
    ]);
  });

  test("exact finite package size and scenario inventory are frozen", () => {
    expect(report.scenario_count).toBe(30);
    expect(report.scenario_ids).toEqual(expectedScenarioIds);
    expect(report.checks.exact_scenario_count).toBe(true);
    expect(report.checks.exact_scenario_inventory).toBe(true);
    expect(report.checks.coverage_gap_mapping).toBe(true);
  });

  test("coverage families include required successful warning blocked duplicate and numeric cases", () => {
    expect(report.coverage_families).toEqual(expect.arrayContaining([
      "baseline",
      "sufficient_support",
      "threshold_boundary",
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

  test("source allowlist and blocked source policy are frozen", () => {
    expect(report.checks.source_allowlist).toBe(true);
    expect(report.checks.blocked_source_list).toBe(true);
    expect(report.source_policy.allowed).toContain("action_411_reconstructed_mapped_rows");
    expect(report.source_policy.blocked).toEqual(expect.arrayContaining([
      "production_rows",
      "supabase",
      "providers_news_broker",
      "replay_captures",
      "runtime_snapshots",
      "directory_discovery",
    ]));
  });

  test("baseline discovered discovered-with-warnings mixed and blocked scenarios are present", () => {
    expect(report.scenario_ids).toContain("pd413_01_action411_baseline_insufficient_evidence");
    expect(report.scenario_ids).toContain("pd413_04_discovered_20_20_all_unique");
    expect(report.scenario_ids).toContain("pd413_06_discovered_with_one_duplicate_pair");
    expect(report.scenario_ids).toContain("pd413_09_mixed_positive_negative_discovered");
    expect(report.scenario_ids).toContain("pd413_23_invalid_lineage_blocked");
  });

  test("multiple-group and multiple-horizon coverage stay blocked under current contract", () => {
    expect(report.checks.grouping_policy).toBe(true);
    expect(report.checks.horizon_policy).toBe(true);
    expect(report.grouping_policy.grouping_dimension).toBe("setup_family");
    expect(report.grouping_policy.successful_setup_family_literals).toEqual(["momentum_continuation"]);
    expect(report.grouping_policy.successful_horizons).toEqual(["60m"]);
    expect(report.grouping_policy.unsupported_family_or_horizon_coverage).toBe("blocked_only_without_contract_change");
    expect(report.scenario_ids).toEqual(expect.arrayContaining([
      "pd413_18_unsupported_second_setup_family_blocked",
      "pd413_21_horizon_15m_unsupported_blocked",
      "pd413_22_horizon_30m_unsupported_blocked",
    ]));
  });

  test("threshold duplicate warning status and insight inventories are frozen", () => {
    expect(report.status_inventory).toEqual(expect.arrayContaining([
      "discovered",
      "discovered_with_warnings",
      "insufficient_evidence",
      "blocked_invalid_input",
      "blocked_invalid_configuration",
      "blocked_invalid_lineage",
      "blocked_future_leakage",
      "blocked_non_consumable_row",
      "blocked_nondeterministic_grouping",
    ]));
    expect(report.warning_inventory).toEqual(expect.arrayContaining([
      "minimum_total_support_not_met",
      "minimum_completed_outcomes_not_met",
      "duplicate_mapper_row_identity",
      "metric_value_unavailable",
    ]));
    expect(report.insight_count_inventory).toEqual([0, 1]);
  });

  test("mixed duplicate numeric lineage leakage consumability and grouping policies are verified", () => {
    expect(report.checks.mixed_evidence_policy).toBe(true);
    expect(report.checks.duplicate_policy).toBe(true);
    expect(report.checks.numeric_policy).toBe(true);
    expect(report.scenario_ids).toEqual(expect.arrayContaining([
      "pd413_07_discovered_with_large_duplicate_cluster",
      "pd413_08_discovered_with_multiple_duplicate_clusters",
      "pd413_13_numeric_positive_negative_aggregation",
      "pd413_14_numeric_rounding_boundary",
      "pd413_15_numeric_signed_zero_and_null_metrics",
      "pd413_24_future_leakage_blocked",
      "pd413_25_non_consumable_row_blocked",
      "pd413_29_invalid_configuration_blocked",
    ]));
  });

  test("hash-freeze sequencing decision is Action 414 before execution", () => {
    expect(report.checks.sequence_decision).toBe(true);
    expect(report.checks.hash_freeze_required).toBe(true);
    expect(report.hash_freeze_sequence.selected_sequence).toBe("A");
    expect(report.hash_freeze_sequence.next_action).toBe("action_414_expanded_static_pattern_discovery_hash_freeze");
    expect(report.hash_freeze_sequence.execution_action).toBe("action_416_expanded_static_pattern_discovery_shadow_execution");
    expect(report.recommended_next_action).toBe("action_414_expanded_static_pattern_discovery_hash_freeze");
  });

  test("runner manifest evidence determinism temp path cleanup and stop conditions are frozen", () => {
    expect(report.checks.runner_boundary).toBe(true);
    expect(report.checks.manifest_boundary).toBe(true);
    expect(report.checks.evidence_limits).toBe(true);
    expect(report.checks.determinism_requirement).toBe(true);
    expect(report.checks.temp_path_policy).toBe(true);
    expect(report.checks.cleanup_policy).toBe(true);
    expect(report.checks.stop_conditions).toBe(true);
  });

  test("no expanded runner manifest or execution artifacts exist", () => {
    expect(report.checks.no_expanded_runner_exists).toBe(true);
    expect(report.checks.no_expanded_manifest_exists).toBe(true);
    expect(report.checks.no_execution_artifacts_exist).toBe(true);
    expect(report.forbidden_expanded_artifacts_found).toEqual([]);
  });

  test("no execution persistence replay runtime provider Supabase feedback or secrets occur", () => {
    expect(report.checks.no_runtime_persistence_replay_provider_supabase_feedback).toBe(true);
    for (const value of Object.values(report.no_effect_flags)) {
      expect(value).toBe(false);
    }
    expect(verifierOutput).not.toContain("automation-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("supabase-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("twelve-data-secret-that-must-not-appear");
  });

  test("source integrity and runtime preview remain untouched", () => {
    expect(report.checks.protected_hashes_unchanged).toBe(true);
    expect(report.checks.no_source_modification).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.checks.runtime_preview_untouched).toBe(true);
    expect(report.checks.next_action_separately_identified).toBe(true);
    expect(report.checks.focused_tests_present).toBe(true);
  });
});
