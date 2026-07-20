import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action430Report = Readonly<{
  verification_status: string;
  readiness_decision: string;
  readiness_vocabulary: readonly string[];
  checks: Record<string, boolean>;
  failed_conditions: readonly string[];
  unresolved_conditions: readonly string[];
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions_count: number;
  action429_reproduction: Readonly<{
    final_shadow_decision: string;
    scenario_count: number;
    run_1_package_sha256: string;
    run_2_package_sha256: string;
    repeat_run_identical: boolean;
  }>;
  manifest_integrity: Readonly<{
    action_426_inventory_sha256: string;
    expected_action_426_inventory_sha256: string;
    manifest_semantic_sha256: string;
    expected_manifest_semantic_sha256: string;
    manifest_file_sha256: string;
    expected_manifest_file_sha256: string;
  }>;
  package_integrity: Readonly<{
    action429_runner_file_sha256: string;
    expected_action429_runner_file_sha256: string;
    before_hashes: Record<string, Readonly<{ expected: string; actual: string; exists: boolean; matches_expected: boolean }>>;
    after_hashes: Record<string, Readonly<{ expected: string; actual: string; exists: boolean; matches_expected: boolean }>>;
  }>;
  scenario_count: number;
  scenario_ids: readonly string[];
  status_distribution: Record<string, number>;
  warning_distribution: Record<string, number>;
  issue_distribution: Record<string, number>;
  complete_issue_metadata_matched: boolean;
  complete_warning_metadata_matched: boolean;
  representative_checks: Record<string, boolean>;
  delta_cap_clamp_overlap_zero_result: string;
  calibration_id_and_semantic_hash_result: string;
  exactly_two_runs: boolean;
  package_hash: string;
  metadata_only_evidence_verified: boolean;
  temp_path_safety: Record<string, boolean>;
  cleanup: Readonly<{
    temporary_evidence_deleted: boolean;
    temporary_output_exists_after_cleanup: boolean;
    temp_evidence_remaining: boolean;
    tracked_evidence_files: readonly string[];
  }>;
  isolation: Readonly<{
    production_consumer_files: readonly string[];
    persistence_result: string;
    replay_result: string;
    runtime_result: string;
    external_access_result: string;
    feedback_result: string;
    provider_call_executed: boolean;
    supabase_read_executed: boolean;
    supabase_write_executed: boolean;
    recommendation_mutated: boolean;
    authoritative_data_created: boolean;
  }>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const docPath = "docs/action-430-independent-static-confidence-calibration-shadow-verification.md";
const verifierPath = "scripts/action-430-independent-static-confidence-calibration-shadow-verification-verify.mjs";
const testPath = "tests/e2e/action-430-independent-static-confidence-calibration-shadow-verification.spec.ts";
const expectedScenarioIds = Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`);
const expectedInventoryHash = "875f385a05f58d982baa182350a662db5518e13f8c18557e4697317deb724cc5";
const expectedManifestHash = "99d492a606d1bdf651dff6f6c0eb4be8de6886d3cbd16f60dcc6d9bb5bce4f19";
const expectedPackageHash = "3bec2908f1c07da1fbdf2052f4e5cce4987f4d4a6589141dc94a29f34fa6c7ef";

test.setTimeout(300000);

function runVerifier(): Action430Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as Action430Report;
}

test.describe.serial("Action 430 independent static Confidence Calibration shadow verification", () => {
  let report: Action430Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("documents the independent static audit boundary and readiness decision", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(doc).toContain("Action 430 - Independent Static Confidence Calibration Shadow Verification");
    for (const section of [
      "Purpose",
      "Scope",
      "Authoritative Dependencies",
      "Action 429 Result",
      "Explicit Non-Goals",
      "Protected-Source Audit",
      "Manifest-Integrity Audit",
      "Runner-Integrity Audit",
      "Action 426 Inventory-Binding Audit",
      "Status-Distribution Audit",
      "Warning-Distribution Audit",
      "Issue-Distribution Audit",
      "Complete Issue-Metadata Audit",
      "Runtime/Persistence/Replay/External Audit",
    ]) {
      expect(doc).toContain(`## ${section}`);
    }
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(report.readiness_decision).toBe("ready");
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.passed_conditions_count).toBeGreaterThanOrEqual(30);
  });

  test("reproduces Action 429 final shadow decision exact scenario order and package hashes", () => {
    expect(report.action429_reproduction.final_shadow_decision).toBe("shadow_passed");
    expect(report.action429_reproduction.scenario_count).toBe(45);
    expect(report.scenario_count).toBe(45);
    expect(report.scenario_ids).toEqual(expectedScenarioIds);
    expect(report.action429_reproduction.repeat_run_identical).toBe(true);
    expect(report.action429_reproduction.run_1_package_sha256).toBe(expectedPackageHash);
    expect(report.action429_reproduction.run_2_package_sha256).toBe(expectedPackageHash);
    expect(report.package_hash).toBe(expectedPackageHash);
    expect(report.exactly_two_runs).toBe(true);
    expect(report.checks.final_shadow_decision).toBe(true);
    expect(report.checks.exact_45_scenarios_and_order).toBe(true);
    expect(report.checks.repeat_run_package_hashes).toBe(true);
  });

  test("binds Action 426 inventory Action 429 manifest runner and protected files", () => {
    expect(report.manifest_integrity.action_426_inventory_sha256).toBe(expectedInventoryHash);
    expect(report.manifest_integrity.expected_action_426_inventory_sha256).toBe(expectedInventoryHash);
    expect(report.manifest_integrity.manifest_semantic_sha256).toBe(expectedManifestHash);
    expect(report.manifest_integrity.expected_manifest_semantic_sha256).toBe(expectedManifestHash);
    expect(report.package_integrity.action429_runner_file_sha256).toBe(report.package_integrity.expected_action429_runner_file_sha256);
    expect(report.checks.action_426_inventory_binding).toBe(true);
    expect(report.checks.manifest_semantic_hash_exact).toBe(true);
    expect(report.checks.action429_manifest_file_hash_bound).toBe(true);
    expect(report.checks.action429_runner_file_hash_bound).toBe(true);
    expect(report.checks.protected_hashes_match_before_and_after).toBe(true);
    for (const [path, before] of Object.entries(report.package_integrity.before_hashes)) {
      const after = report.package_integrity.after_hashes[path];
      expect(before.exists, path).toBe(true);
      expect(before.matches_expected, path).toBe(true);
      expect(after.exists, path).toBe(true);
      expect(after.matches_expected, path).toBe(true);
      expect(after.actual, path).toBe(before.actual);
    }
  });

  test("matches exact distributions complete metadata and representative behavior", () => {
    expect(report.status_distribution).toEqual({
      calibrated: 14,
      calibrated_with_warnings: 11,
      no_adjustment: 5,
      blocked_invalid_input: 9,
      blocked_overlapping_evidence: 1,
      blocked_unsupported_insight: 1,
      blocked_invalid_lineage: 1,
      blocked_future_leakage: 1,
      blocked_invalid_configuration: 1,
      insufficient_eligible_evidence: 1,
    });
    expect(report.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 4,
      metric_value_unavailable: 3,
      duplicate_insight_deduped: 1,
      overlapping_insight_excluded: 3,
      confidence_clamped_to_bounds: 2,
    });
    expect(report.issue_distribution).toEqual({
      warning_status_contradiction: 2,
      overlapping_evidence_conflict: 2,
      ineligible_pattern_discovery_status: 1,
      invalid_lineage: 1,
      future_leakage: 1,
      invalid_insight_structure: 1,
      invalid_configuration_shape: 1,
      invalid_base_confidence: 6,
      insufficient_eligible_evidence: 1,
    });
    expect(report.complete_issue_metadata_matched).toBe(true);
    expect(report.complete_warning_metadata_matched).toBe(true);
    expect(report.delta_cap_clamp_overlap_zero_result).toBe("matched");
    expect(report.calibration_id_and_semantic_hash_result).toBe("matched");
    for (const [name, passed] of Object.entries(report.representative_checks)) {
      expect(passed, name).toBe(true);
    }
  });

  test("keeps evidence temporary metadata-only cleaned and path guarded", () => {
    expect(report.metadata_only_evidence_verified).toBe(true);
    expect(report.cleanup.temporary_evidence_deleted).toBe(true);
    expect(report.cleanup.temporary_output_exists_after_cleanup).toBe(false);
    expect(report.cleanup.temp_evidence_remaining).toBe(false);
    expect(report.cleanup.tracked_evidence_files).toEqual([]);
    for (const [name, passed] of Object.entries(report.temp_path_safety)) {
      expect(passed, name).toBe(true);
    }
    expect(report.checks.metadata_boundary).toBe(true);
    expect(report.checks.temp_path_safety).toBe(true);
    expect(report.checks.cleanup_and_no_tracked_evidence).toBe(true);
  });

  test("confirms no runtime persistence replay external feedback recommendation or authoritative-data side effects", () => {
    expect(report.isolation.production_consumer_files).toEqual([]);
    expect(report.isolation.persistence_result).toBe("none");
    expect(report.isolation.replay_result).toBe("none");
    expect(report.isolation.runtime_result).toBe("none");
    expect(report.isolation.external_access_result).toBe("none");
    expect(report.isolation.feedback_result).toBe("none");
    expect(report.isolation.provider_call_executed).toBe(false);
    expect(report.isolation.supabase_read_executed).toBe(false);
    expect(report.isolation.supabase_write_executed).toBe(false);
    expect(report.isolation.recommendation_mutated).toBe(false);
    expect(report.isolation.authoritative_data_created).toBe(false);
    expect(report.checks.consumer_inventory_zero).toBe(true);
    expect(report.checks.no_runtime_persistence_replay_external_feedback).toBe(true);
    expect(report.checks.no_recommendation_mutation_or_authoritative_data).toBe(true);
  });

  test("keeps upstream gates healthy runtime preview paused and identifies the next action", () => {
    expect(report.checks.upstream_action428_healthy).toBe(true);
    expect(report.checks.upstream_action429_healthy).toBe(true);
    expect(report.checks.action309_guard_healthy).toBe(true);
    expect(report.checks.golden_static_safety_healthy).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.checks.runtime_preview_paused).toBe(true);
    expect(report.unrelated_work_classification).toBe("action_430_independent_static_confidence_calibration_shadow_verification_only");
    expect(report.recommended_next_action).toBe("action_431_static_confidence_calibration_shadow_readiness_gate");
  });
});
