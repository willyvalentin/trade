import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { expect, test } from "@playwright/test";

const verifierPath = "scripts/action-417-independent-expanded-static-pattern-discovery-shadow-verification-verify.mjs";
const docPath = "docs/action-417-independent-expanded-static-pattern-discovery-shadow-verification.md";

type Action417Report = Readonly<{
  verification_status: string;
  readiness_decision: string;
  readiness_vocabulary: readonly string[];
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  failed_conditions_count: number;
  unresolved_conditions: readonly string[];
  action416_reproduction: Readonly<{
    final_shadow_decision: string;
    scenario_count: number;
    executed_package_runs: number;
    repeat_run_identical: boolean;
    third_run_executed: boolean;
  }>;
  source_integrity: Readonly<Record<string, Readonly<{
    expected: string;
    actual: string | null;
    unchanged: boolean;
  }>>>;
  action414_inventory_integrity: Readonly<{
    full_inventory_sha256: string;
    freeze_payload_sha256: string;
    file_sha256: string;
  }>;
  action416_integrity: Readonly<{
    manifest_sha256: string;
    runner_sha256: string;
    doc_sha256: string;
  }>;
  scenario_audit: Readonly<{
    scenario_count: number;
    scenario_ids: readonly string[];
    coverage_families: readonly string[];
    source_classes: readonly string[];
  }>;
  status_distribution: Readonly<Record<string, number>>;
  blocked_status_distribution: Readonly<Record<string, number>>;
  blocked_status_total: number;
  warning_distribution: Readonly<Record<string, number>>;
  insight_distribution: Readonly<Record<string, number>>;
  semantic_hash_result: string;
  package_hash_result: string;
  package_hashes: Readonly<{
    run_1_package_sha256: string;
    run_2_package_sha256: string;
  }>;
  condition_inventory: readonly string[];
  condition_classifications: readonly {
    condition_id: string;
    scenario_id: string;
    classification: string;
    readiness_impact: string;
    semantic_expectations_matched: boolean;
    source_integrity_held: boolean;
    determinism_held: boolean;
    cleanup_held: boolean;
  }[];
  actual_readiness_blockers: readonly string[];
  metadata_boundary: Readonly<{
    metadata_only_result: string;
    forbidden_markers_found: readonly string[];
  }>;
  path_cleanup_boundary: Readonly<{
    path_safety_result: string;
    cleanup_result: string;
    temporary_evidence_deleted: boolean;
    tracked_evidence_files: readonly string[];
  }>;
  isolation_result: Readonly<{
    source_status_unchanged: boolean;
    protected_hashes_unchanged_after_execution: boolean;
    runtime_consumer_files: readonly string[];
    no_effect_flags: Readonly<Record<string, boolean>>;
  }>;
  coverage_strengths: readonly string[];
  remaining_coverage_gaps: readonly string[];
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
  recommended_next_action: string;
}>;

let report: Action417Report;
let verifierOutput = "";

function runVerifier(): Action417Report {
  verifierOutput = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 240_000,
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      ["TWELVE" + "_DATA_API_KEY"]: "twelve-data-secret-that-must-not-appear",
    },
  });
  return JSON.parse(verifierOutput) as Action417Report;
}

test.describe.serial("Action 417 independent expanded static Pattern Discovery shadow verification", () => {
  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documents a ready independent verification decision", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready");
    expect(report.readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(report.failed_checks).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions).toEqual([]);
    expect(doc).toContain("## Readiness Decision");
    expect(doc).toContain("`ready`");
    expect(doc).toContain("No actual readiness blocker remains.");
  });

  test("reproduces Action 416 exactly without a retry or third package run", () => {
    expect(report.action416_reproduction).toEqual({
      final_shadow_decision: "shadow_passed_with_conditions",
      scenario_count: 30,
      executed_package_runs: 2,
      repeat_run_identical: true,
      third_run_executed: false,
    });
    expect(report.checks.exactly_two_runs_no_retry).toBe(true);
    expect(report.checks.repeat_package_hash_exact).toBe(true);
    expect(report.package_hash_result).toBe("passed");
    expect(report.package_hashes.run_1_package_sha256).toBe(
      "ccbff3b786c62b0e56cd6300bae9a6950cba2ad15a3376f37dc7130d698477a8",
    );
    expect(report.package_hashes.run_2_package_sha256).toBe(report.package_hashes.run_1_package_sha256);
  });

  test("preserves Action 414 and protected Action 416 hashes", () => {
    expect(report.action414_inventory_integrity.full_inventory_sha256).toBe(
      "8b7e5c55f1ae8e27a278ca7d844d204aee4a84d4546cb8b612c3db122d83fe4b",
    );
    expect(report.action414_inventory_integrity.freeze_payload_sha256).toBe(
      "4e1f3e0cd8e67e7d0230c1af8618d8e803867c75c32d18857c48b1234e835c12",
    );
    expect(report.action416_integrity.runner_sha256).toBe(
      "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
    );
    expect(Object.values(report.source_integrity).every((entry) => entry.unchanged)).toBe(true);
  });

  test("audits all 30 frozen scenarios in exact order", () => {
    expect(report.scenario_audit.scenario_count).toBe(30);
    expect(report.scenario_audit.scenario_ids).toHaveLength(30);
    expect(report.scenario_audit.scenario_ids[0]).toBe("pd413_01_action411_baseline_insufficient_evidence");
    expect(report.scenario_audit.scenario_ids[19]).toBe("pd413_20_nondeterministic_grouping_blocked");
    expect(report.scenario_audit.scenario_ids[29]).toBe("pd413_30_duplicate_source_case_id_blocked");
    expect(report.scenario_audit.coverage_families).toContain("threshold_boundary");
    expect(report.scenario_audit.coverage_families).toContain("grouping_block");
    expect(report.scenario_audit.source_classes).toEqual([
      "action_411_reconstructed_mapped_rows",
      "deterministic_test_local_synthetic_rows",
      "fixed_static_malformed_variants",
    ]);
  });

  test("matches frozen aggregate distributions and semantic hashes", () => {
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
    expect(report.blocked_status_distribution).toEqual({
      blocked_future_leakage: 1,
      blocked_invalid_configuration: 1,
      blocked_invalid_input: 6,
      blocked_invalid_lineage: 2,
      blocked_non_consumable_row: 2,
      blocked_nondeterministic_grouping: 1,
    });
    expect(report.blocked_status_total).toBe(13);
    expect(report.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 5,
      metric_value_unavailable: 1,
      minimum_completed_outcomes_not_met: 4,
      minimum_total_support_not_met: 3,
    });
    expect(report.insight_distribution).toEqual({ 0: 17, 1: 13 });
    expect(report.semantic_hash_result).toBe("passed");
  });

  test("classifies all Action 416 conditions as expected and non-blocking", () => {
    expect(report.condition_inventory).toEqual([
      "historical_action_411_baseline_preserved_without_regeneration",
      "nondeterministic_grouping_contract_case_preserved_as_static_block",
      "three_frozen_action_413_expectations_are_current_contract_limitations",
    ]);
    expect(report.condition_classifications.map((entry) => entry.classification)).toEqual([
      "expected_historical_baseline_condition",
      "expected_blocked_coverage_case",
      "expected_contract_limitation",
      "expected_contract_limitation",
      "expected_contract_limitation",
    ]);
    expect(report.condition_classifications.map((entry) => entry.scenario_id)).toEqual([
      "pd413_01_action411_baseline_insufficient_evidence",
      "pd413_20_nondeterministic_grouping_blocked",
      "pd413_02_threshold_19_case_20_completed",
      "pd413_03_threshold_20_case_19_completed",
      "pd413_17_insufficient_with_duplicate_warning_combo",
    ]);
    expect(
      report.condition_classifications.every((entry) =>
        entry.readiness_impact === "does_not_block" &&
        entry.semantic_expectations_matched &&
        entry.source_integrity_held &&
        entry.determinism_held &&
        entry.cleanup_held),
    ).toBe(true);
    expect(report.actual_readiness_blockers).toEqual([]);
  });

  test("keeps evidence metadata-only, cleaned up, and untracked", () => {
    expect(report.metadata_boundary.metadata_only_result).toBe("passed");
    expect(report.metadata_boundary.forbidden_markers_found).toEqual([]);
    expect(report.path_cleanup_boundary.path_safety_result).toBe("passed");
    expect(report.path_cleanup_boundary.cleanup_result).toBe("passed");
    expect(report.path_cleanup_boundary.temporary_evidence_deleted).toBe(true);
    expect(report.path_cleanup_boundary.tracked_evidence_files).toEqual([]);
    expect(existsSync(join(tmpdir(), "ture", "action-416-expanded-static-pattern-discovery-shadow"))).toBe(false);
  });

  test("does not mutate source or touch runtime provider persistence replay feedback paths", () => {
    expect(report.isolation_result.source_status_unchanged).toBe(true);
    expect(report.isolation_result.protected_hashes_unchanged_after_execution).toBe(true);
    expect(report.isolation_result.runtime_consumer_files).toEqual([]);
    expect(Object.values(report.no_effect_flags).every((value) => value === false)).toBe(true);
    expect(Object.values(report.isolation_result.no_effect_flags).every((value) => value === false)).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.recommended_next_action).toBe("action_418_next_static_pattern_discovery_architecture_step");
  });

  test("does not leak secrets in verifier output", () => {
    expect(verifierOutput).not.toContain("automation-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("supabase-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("twelve-data-secret-that-must-not-appear");
  });
});
