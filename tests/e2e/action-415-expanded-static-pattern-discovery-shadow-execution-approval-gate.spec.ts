import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const verifierPath = "scripts/action-415-expanded-static-pattern-discovery-shadow-execution-approval-gate-verify.mjs";
const docPath = "docs/action-415-expanded-static-pattern-discovery-shadow-execution-approval-gate.md";
const inventoryPath = "docs/action-414-expanded-static-pattern-discovery-hash-inventory.json";

type Action415Report = Readonly<{
  verification_status: string;
  approval_decision: string;
  approval_vocabulary: readonly string[];
  shadow_decision_vocabulary: readonly string[];
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions: readonly string[];
  action414_full_inventory_sha256: string;
  action414_freeze_payload_sha256: string;
  protected_hashes: Readonly<Record<string, Readonly<{ unchanged: boolean }>>>;
  scenario_count: number;
  scenario_ids: readonly string[];
  status_distribution: Readonly<Record<string, number>>;
  blocked_status_total: number;
  warning_distribution: Readonly<Record<string, number>>;
  insight_count_distribution: Readonly<Record<string, number>>;
  future_execution_manifest: string;
  future_runner: string;
  forbidden_artifacts_found: readonly string[];
  action416_package_artifacts_found: readonly string[];
  action416_execution_compatible_after_approval: boolean;
  metadata_evidence_limits: string;
  temp_path_policy: string;
  repeat_run_requirement: Readonly<{
    run_count: number;
    third_run_allowed: boolean;
    cleanup_required: boolean;
  }>;
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

type Action414Inventory = Readonly<{
  scenario_count: number;
  scenario_ids: readonly string[];
  status_distribution: Readonly<Record<string, number>>;
  warning_distribution: Readonly<Record<string, number>>;
  insight_count_distribution: Readonly<Record<string, number>>;
  scenarios: readonly {
    scenario_id: string;
    row_ids: readonly string[];
    canonical_row_hashes: readonly string[];
    semantic_hashes: Readonly<{
      evidence_set_sha256: string | null;
      group_hashes: readonly string[];
      insight_ids: readonly string[];
      insight_hashes: readonly string[];
      canonical_result_sha256: string;
      scenario_summary_sha256: string;
    }>;
    scenario_inventory_sha256: string;
  }[];
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

let report: Action415Report;
let inventory: Action414Inventory;
let verifierOutput = "";

function runVerifier(): Action415Report {
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
  return JSON.parse(verifierOutput) as Action415Report;
}

test.describe.serial("Action 415 expanded static Pattern Discovery shadow execution approval gate", () => {
  test.beforeAll(() => {
    report = runVerifier();
    inventory = JSON.parse(readFileSync(inventoryPath, "utf8")) as Action414Inventory;
  });

  test("documentation contract and approval decision are exact", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.shadow_decision_vocabulary).toEqual([
      "shadow_passed",
      "shadow_passed_with_conditions",
      "shadow_failed",
      "shadow_aborted",
    ]);
    expect(doc).toContain("## Future Execution-Manifest Contract");
    expect(doc).toContain("## Future Runner Contract");
    expect(doc).toContain("Decision: `approved`");
  });

  test("Action 414 freeze hashes and protected hashes are bound", () => {
    expect(report.action414_full_inventory_sha256).toBe("8b7e5c55f1ae8e27a278ca7d844d204aee4a84d4546cb8b612c3db122d83fe4b");
    expect(report.action414_freeze_payload_sha256).toBe("4e1f3e0cd8e67e7d0230c1af8618d8e803867c75c32d18857c48b1234e835c12");
    expect(Object.values(report.protected_hashes).every((entry) => entry.unchanged)).toBe(true);
    expect(report.checks.action414_hash_freeze_result).toBe(true);
    expect(report.checks.exact_inventory_hash).toBe(true);
    expect(report.checks.exact_freeze_payload_hash).toBe(true);
  });

  test("exact 30 scenario IDs and order are frozen", () => {
    expect(report.scenario_count).toBe(30);
    expect(inventory.scenario_count).toBe(30);
    expect(report.scenario_ids).toEqual(expectedScenarioIds);
    expect(inventory.scenario_ids).toEqual(expectedScenarioIds);
    expect(report.checks.exact_order).toBe(true);
  });

  test("status blocked warning and insight distributions are frozen", () => {
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
    expect(report.blocked_status_total).toBe(13);
    expect(report.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 5,
      metric_value_unavailable: 1,
      minimum_completed_outcomes_not_met: 4,
      minimum_total_support_not_met: 3,
    });
    expect(report.insight_count_distribution).toEqual({ 0: 17, 1: 13 });
  });

  test("future manifest and runner boundaries remain narrow after Action 416", () => {
    expect(report.future_execution_manifest).toBe("docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json");
    expect(report.future_runner).toBe("scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs");
    if (existsSync(report.future_execution_manifest) || existsSync(report.future_runner)) {
      expect(report.action416_execution_compatible_after_approval).toBe(true);
      expect(report.action416_package_artifacts_found).toEqual([
        "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
        "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
        "docs/action-416-expanded-static-pattern-discovery-shadow-use.md",
        "scripts/action-416-expanded-static-pattern-discovery-shadow-use-verify.mjs",
        "tests/e2e/action-416-expanded-static-pattern-discovery-shadow-use.spec.ts",
      ]);
    } else {
      expect(report.action416_package_artifacts_found).toEqual([]);
    }
    expect(report.forbidden_artifacts_found).toEqual([]);
    expect(report.checks.no_runner_exists).toBe(true);
    expect(report.checks.no_execution_manifest_exists).toBe(true);
    expect(report.checks.action416_execution_compatible_after_approval).toBe(true);
  });

  test("row evidence group insight result and scenario hashes are required", () => {
    const shaPattern = /^[a-f0-9]{64}$/;

    for (const scenario of inventory.scenarios) {
      expect(scenario.row_ids.length).toBeGreaterThan(0);
      expect(scenario.canonical_row_hashes.every((hash) => shaPattern.test(hash))).toBe(true);
      expect(scenario.semantic_hashes.group_hashes.every((hash) => shaPattern.test(hash))).toBe(true);
      expect(scenario.semantic_hashes.insight_hashes.every((hash) => shaPattern.test(hash))).toBe(true);
      expect(shaPattern.test(scenario.semantic_hashes.canonical_result_sha256)).toBe(true);
      expect(shaPattern.test(scenario.semantic_hashes.scenario_summary_sha256)).toBe(true);
      expect(shaPattern.test(scenario.scenario_inventory_sha256)).toBe(true);
    }
    expect(report.checks.semantic_hash_verification).toBe(true);
  });

  test("metadata-only evidence and full-data prohibitions are enforced", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(report.metadata_evidence_limits).toBe("bounded_metadata_only_no_full_rows_results_insights_contexts_outcomes_secrets");
    expect(report.checks.metadata_only_evidence).toBe(true);
    expect(report.checks.full_data_prohibition).toBe(true);
    expect(doc).toContain("Do not retain full rows");
    expect(doc).toContain("full result objects");
    expect(doc).toContain("full insight objects");
    expect(verifierOutput).not.toContain("automation-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("supabase-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("twelve-data-secret-that-must-not-appear");
  });

  test("temp path symlink traversal repeat-run and cleanup policies are frozen", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(report.temp_path_policy).toBe("<system-temp>/ture/action-416-expanded-static-pattern-discovery-shadow/");
    expect(report.repeat_run_requirement).toEqual({
      run_count: 2,
      third_run_allowed: false,
      cleanup_required: true,
    });
    expect(doc).toContain("target symlinks");
    expect(doc).toContain("dangling symlinks");
    expect(doc).toContain("parent-chain symlinks");
    expect(doc).toContain("path traversal");
    expect(doc).toContain("Cleanup failure returns `shadow_failed`");
  });

  test("stop conditions and no retry behavior are explicit", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(report.checks.stop_conditions).toBe(true);
    expect(doc).toContain("Stop before execution and return `shadow_aborted`");
    expect(doc).toContain("Fail after execution and return `shadow_failed`");
    expect(doc).toContain("No same-Action remediation is allowed");
    expect(doc).toContain("No third repair run is allowed");
  });

  test("no runtime persistence replay provider Supabase or feedback effects exist", () => {
    expect(report.no_effect_flags).toEqual({
      provider_call_executed: false,
      provider_call_attempted: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      runtime_integration_executed: false,
      feedback_executed: false,
      authoritative_data_created: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      recommendations_mutated: false,
      runtime_preview_advanced: false,
    });
    expect(report.checks.no_runtime_persistence_replay_provider_supabase_feedback).toBe(true);
  });

  test("verifier succeeds with no failed or unresolved conditions", () => {
    expect(report.failed_checks).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.passed_conditions_count).toBe(Object.keys(report.checks).length);
  });

  test("Actions 413 and 414 remain healthy and runtime preview remains paused", () => {
    expect(report.checks.action413_action414_remain_healthy).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.checks.runtime_preview_chain_untouched).toBe(true);
    expect(report.unrelated_work_classification).toBe("action_415_docs_verifier_tests_and_minimal_guard_updates_only");
    expect(report.recommended_next_action).toBe("action_416_expanded_static_pattern_discovery_shadow_execution");
  });
});
