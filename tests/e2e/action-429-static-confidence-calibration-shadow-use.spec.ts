import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action429Report = Readonly<{
  verification_status: string;
  checks: Record<string, boolean>;
  failed_conditions: readonly string[];
  passed_conditions_count: number;
  failed_conditions_count: number;
  final_shadow_decision: string;
  scenario_count: number;
  scenario_ids: readonly string[];
  status_distribution: Record<string, number>;
  warning_distribution: Record<string, number>;
  issue_distribution: Record<string, number>;
  complete_issue_metadata_matched: boolean;
  complete_warning_metadata_matched: boolean;
  expected_results_match: boolean;
  delta_cap_clamp_overlap_result: string;
  calibration_id_and_semantic_hash_result: string;
  repeat_run_identical: boolean;
  run_1_package_sha256: string;
  run_2_package_sha256: string;
  expected_package_sha256: string;
  manifest_sha256: string;
  expected_manifest_sha256: string;
  metadata_only_evidence_verified: boolean;
  temporary_evidence_deleted: boolean;
  temporary_output_exists_after_cleanup: boolean;
  temp_evidence_remaining: boolean;
  approved_action429_files: readonly string[];
  unapproved_action429_files: readonly string[];
  tracked_evidence_files: readonly string[];
  forbidden_evidence_text_files: readonly string[];
  production_consumer_files: readonly string[];
  source_integrity: Record<string, Readonly<{ expected: string; actual: string; matches: boolean }>>;
  persistence_result: string;
  replay_result: string;
  runtime_result: string;
  external_access_result: string;
  feedback_result: string;
  recommendation_mutated: boolean;
  authoritative_data_created: boolean;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const docPath = "docs/action-429-static-confidence-calibration-shadow-use.md";
const manifestPath = "docs/action-429-static-confidence-calibration-shadow-input-manifest.json";
const runnerPath = "scripts/action-429-static-confidence-calibration-shadow-run.mjs";
const verifierPath = "scripts/action-429-static-confidence-calibration-shadow-use-verify.mjs";
const testPath = "tests/e2e/action-429-static-confidence-calibration-shadow-use.spec.ts";
const expectedScenarioIds = Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`);
const expectedPackageHash = "3bec2908f1c07da1fbdf2052f4e5cce4987f4d4a6589141dc94a29f34fa6c7ef";
const expectedManifestHash = "99d492a606d1bdf651dff6f6c0eb4be8de6886d3cbd16f60dcc6d9bb5bce4f19";
const expectedInventoryHash = "875f385a05f58d982baa182350a662db5518e13f8c18557e4697317deb724cc5";

test.setTimeout(240000);

function runVerifier(): Action429Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 240000 })) as Action429Report;
}

test.describe.serial("Action 429 static Confidence Calibration shadow execution", () => {
  let report: Action429Report;
  let doc: string;
  let manifest: Readonly<{
    manifest_schema_version: string;
    action_426_inventory_sha256: string;
    scenario_count: number;
    scenario_ids: readonly string[];
    scenarios: readonly Readonly<{
      scenario_id: string;
      status: string;
      complete_issue_inventory: readonly Readonly<{ code: string; path: string; severity: string; messageKey: string }>[];
      complete_warning_inventory: readonly Readonly<{ code: string; path: string; severity: string; messageKey: string }>[];
      calibration_id: string | null;
      identity_sha256: string | null;
      independent_identity_sha256: string | null;
      canonical_result_sha256: string;
      scenario_summary_sha256: string;
      included_insight_ids: readonly string[];
      excluded_insight_ids: readonly string[];
      clamping_state: Readonly<{ clamped: boolean; warning_code: string | null }>;
    }>[];
  }>;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  });

  test("documents and verifies the approved static package boundary", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(manifestPath)).toBe(true);
    expect(existsSync(runnerPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(doc).toContain("Action 429 - Static Confidence Calibration Shadow Execution");
    expect(doc).toContain("Action 428 approved exactly one future static shadow package");
    expect(report.verification_status).toBe("passed");
    expect(report.failed_conditions).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.passed_conditions_count).toBeGreaterThanOrEqual(35);
    expect(report.approved_action429_files).toEqual([
      manifestPath,
      runnerPath,
      docPath,
      verifierPath,
      testPath,
    ]);
    expect(report.unapproved_action429_files).toEqual([]);
  });

  test("binds manifest schema inventory hash protected hashes and exact scenario order", () => {
    expect(manifest.manifest_schema_version).toBe("action_429_static_confidence_calibration_shadow_input_manifest_v1");
    expect(manifest.action_426_inventory_sha256).toBe(expectedInventoryHash);
    expect(report.manifest_sha256).toBe(expectedManifestHash);
    expect(report.expected_manifest_sha256).toBe(expectedManifestHash);
    expect(report.scenario_count).toBe(45);
    expect(report.scenario_ids).toEqual(expectedScenarioIds);
    expect(manifest.scenario_count).toBe(45);
    expect(manifest.scenario_ids).toEqual(expectedScenarioIds);
    expect(manifest.scenarios.map((scenario) => scenario.scenario_id)).toEqual(expectedScenarioIds);
    expect(report.checks.action_426_inventory_bound).toBe(true);
    expect(report.checks.manifest_schema_valid).toBe(true);
    expect(report.checks.manifest_hash_bound).toBe(true);
    expect(report.checks.exact_45_scenarios).toBe(true);
    expect(report.checks.exact_scenario_ids_and_order).toBe(true);
    for (const [path, entry] of Object.entries(report.source_integrity)) {
      expect(path).toMatch(/^(lib|docs|scripts)\//);
      expect(entry.matches).toBe(true);
      expect(entry.actual).toBe(entry.expected);
    }
  });

  test("matches exact status warning issue distributions and complete metadata", () => {
    expect(report.status_distribution).toEqual({
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
    for (const scenario of manifest.scenarios) {
      for (const issue of scenario.complete_issue_inventory) {
        expect(issue.path).toMatch(/^\//);
        expect(issue.severity).toBe("error");
        expect(issue.messageKey).toBe(`confidence_calibration.${issue.code}`);
      }
      for (const warning of scenario.complete_warning_inventory) {
        expect(warning.path).toMatch(/^\//);
        expect(warning.severity).toBe("warning");
        expect(warning.messageKey).toBe(`confidence_calibration.${warning.code}`);
      }
    }
  });

  test("covers supportive adverse duplicate overlap cap clamp zero and blocked scenarios", () => {
    for (const check of [
      "supportive_and_adverse_results_present",
      "attenuation_duplicate_overlap_cap_clamp_zero_cases_present",
      "included_excluded_ids_verified",
      "expected_results_match",
    ]) {
      expect(report.checks[check], check).toBe(true);
    }
    expect(manifest.scenarios.find((scenario) => scenario.scenario_id === "cc425_16")?.status).toBe("calibrated");
    expect(manifest.scenarios.find((scenario) => scenario.scenario_id === "cc425_17")?.status).toBe("calibrated");
    expect(manifest.scenarios.find((scenario) => scenario.scenario_id === "cc425_23")?.complete_warning_inventory[0]?.code).toBe("duplicate_insight_deduped");
    expect(manifest.scenarios.find((scenario) => scenario.scenario_id === "cc425_27")?.status).toBe("blocked_overlapping_evidence");
    expect(manifest.scenarios.find((scenario) => scenario.scenario_id === "cc425_29")?.clamping_state.warning_code).toBe("confidence_clamped_to_bounds");
    expect(manifest.scenarios.find((scenario) => scenario.scenario_id === "cc425_37")?.status).toBe("blocked_invalid_input");
    expect(manifest.scenarios.find((scenario) => scenario.scenario_id === "cc425_38")?.status).toBe("blocked_invalid_configuration");
  });

  test("matches calibration IDs semantic hashes and repeat-run package hash", () => {
    const hashPattern = /^[a-f0-9]{64}$/;
    const calibrationIdPattern = /^confidence_calibration_v1:[a-f0-9]{24}$/;
    for (const scenario of manifest.scenarios) {
      if (scenario.calibration_id !== null) {
        expect(scenario.calibration_id).toMatch(calibrationIdPattern);
      }
      for (const hash of [
        scenario.identity_sha256,
        scenario.independent_identity_sha256,
        scenario.canonical_result_sha256,
        scenario.scenario_summary_sha256,
      ]) {
        if (hash !== null) expect(hash).toMatch(hashPattern);
      }
      expect(Array.isArray(scenario.included_insight_ids)).toBe(true);
      expect(Array.isArray(scenario.excluded_insight_ids)).toBe(true);
    }
    expect(report.calibration_id_and_semantic_hash_result).toBe("matched");
    expect(report.delta_cap_clamp_overlap_result).toBe("matched");
    expect(report.repeat_run_identical).toBe(true);
    expect(report.run_1_package_sha256).toBe(expectedPackageHash);
    expect(report.run_2_package_sha256).toBe(expectedPackageHash);
    expect(report.expected_package_sha256).toBe(expectedPackageHash);
  });

  test("keeps evidence metadata-only temporary cleaned and no side effects", () => {
    expect(report.metadata_only_evidence_verified).toBe(true);
    expect(report.temporary_evidence_deleted).toBe(true);
    expect(report.temporary_output_exists_after_cleanup).toBe(false);
    expect(report.temp_evidence_remaining).toBe(false);
    expect(report.tracked_evidence_files).toEqual([]);
    expect(report.forbidden_evidence_text_files).toEqual([]);
    expect(report.checks.temp_path_safe).toBe(true);
    expect(report.persistence_result).toBe("none");
    expect(report.replay_result).toBe("none");
    expect(report.runtime_result).toBe("none");
    expect(report.external_access_result).toBe("none");
    expect(report.feedback_result).toBe("none");
    expect(report.recommendation_mutated).toBe(false);
    expect(report.authoritative_data_created).toBe(false);
    expect(report.production_consumer_files).toEqual([]);
  });

  test("keeps upstream gates healthy runtime preview paused and final decision valid", () => {
    expect(report.final_shadow_decision).toBe("shadow_passed");
    expect(report.checks.final_shadow_decision_valid).toBe(true);
    expect(report.checks.action427_healthy).toBe(true);
    expect(report.checks.action428_healthy).toBe(true);
    expect(report.checks.action309_guard_healthy).toBe(true);
    expect(report.checks.golden_static_safety_healthy).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.unrelated_work_classification).toBe("action_429_static_confidence_calibration_shadow_package_only");
    expect(report.recommended_next_action).toBe("action_430_independent_static_confidence_calibration_shadow_verification");
  });
});
