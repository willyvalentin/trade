import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const verifierPath = "scripts/action-419-pure-confidence-calibration-implementation-approval-gate-verify.mjs";
const docPath = "docs/action-419-pure-confidence-calibration-implementation-approval-gate.md";

type Action419Report = Readonly<{
  verification_status: string;
  approval_decision: string;
  approval_vocabulary: readonly string[];
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  failed_conditions_count: number;
  unresolved_conditions: readonly string[];
  action418_readiness: Readonly<{
    verification_status: string;
    approval_decision: string;
    failed_conditions_count: number;
    unresolved_conditions: readonly string[];
  }>;
  action417_readiness: Readonly<{
    verification_status: string;
    readiness_decision: string;
    action416_scenario_count: number;
    action416_executed_package_runs: number;
    action416_package_hash: string;
  }>;
  approved_module: string;
  runtime_exports: readonly string[];
  type_exports: readonly string[];
  function_signature: string;
  validation_order: readonly string[];
  result_vocabulary: readonly string[];
  warning_classifications: Readonly<Record<string, string>>;
  delta_table_basis_points: Readonly<Record<string, number>>;
  attenuation_policy: Readonly<Record<string, string>>;
  confidence_bounds: Readonly<Record<string, number | string>>;
  aggregation_policy: Readonly<{
    sort_key: readonly string[];
    dedupe_key: string;
    aggregate_method: string;
  }>;
  overlap_policy: Readonly<{
    key_components: readonly string[];
    conflict_behavior: string;
  }>;
  identity_hash_contract: Readonly<Record<string, number | string>>;
  output_contract: Readonly<Record<string, boolean>>;
  implementation_boundary: Readonly<{
    action420_allowed_files: readonly string[];
    runner_approved: boolean;
    fixture_package_approved: boolean;
    runtime_adapter_approved: boolean;
    recommendation_consumer_approved: boolean;
  }>;
  approved_implementation_module_present: boolean;
  forbidden_artifacts_found: readonly string[];
  implementation_marker_hits: readonly string[];
  tracked_action419_evidence_files: readonly string[];
  runtime_consumer_files: readonly string[];
  source_integrity: Readonly<Record<string, Readonly<{ unchanged: boolean }>>>;
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
  recommended_next_action: string;
}>;

let report: Action419Report;
let verifierOutput = "";

function runVerifier(): Action419Report {
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
  return JSON.parse(verifierOutput) as Action419Report;
}

test.describe.serial("Action 419 pure Confidence Calibration implementation approval gate", () => {
  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documentation contract and approval decision are present", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.failed_checks).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(doc).toContain("## Exact Implementation Module");
    expect(doc).toContain("Decision: `approved`");
  });

  test("Action 418 conditions are carried forward correctly", () => {
    expect(report.action418_readiness.verification_status).toBe("passed");
    expect(report.action418_readiness.approval_decision).toBe("approved_with_conditions");
    expect(report.action418_readiness.failed_conditions_count).toBe(0);
    expect(report.action418_readiness.unresolved_conditions).toEqual([
      "implementation_file_path_unapproved",
      "executable_fixture_package_unapproved",
      "implementation_independent_audit_future_work",
    ]);
    expect(report.checks.action418_decision_and_conditions).toBe(true);
  });

  test("Actions 417 and 418 remain healthy", () => {
    expect(report.action417_readiness).toEqual({
      verification_status: "passed",
      readiness_decision: "ready",
      action416_scenario_count: 30,
      action416_executed_package_runs: 2,
      action416_package_hash: "ccbff3b786c62b0e56cd6300bae9a6950cba2ad15a3376f37dc7130d698477a8",
    });
    expect(report.checks.action417_action418_healthy).toBe(true);
  });

  test("exact module path runtime export type exports and signature are frozen", () => {
    expect(report.approved_module).toBe("lib/pure-confidence-calibration.ts");
    expect(report.runtime_exports).toEqual(["calibrateConfidence"]);
    expect(report.type_exports).toEqual([
      "ConfidenceCalibrationInsightEnvelope",
      "FrozenConfidenceCalibrationConfiguration",
      "ConfidenceCalibrationResult",
      "ConfidenceCalibrationIssue",
      "ConfidenceCalibrationWarning",
      "ConfidenceCalibrationEvidenceSummary",
      "ConfidenceCalibrationAdjustment",
    ]);
    expect(report.function_signature).toContain("export function calibrateConfidence");
    expect(report.function_signature).toContain("Readonly<{ baseConfidence: number;");
    expect(report.checks.exact_module_and_exports).toBe(true);
    expect(report.checks.exact_function_signature).toBe(true);
  });

  test("validation order is exact and fail-closed", () => {
    expect(report.validation_order).toEqual([
      "top-level input shape",
      "configuration shape",
      "base-confidence validity",
      "insight-array shape",
      "insight-envelope shape",
      "Pattern Discovery status eligibility",
      "insight presence and structural validity",
      "lineage integrity",
      "anti-leakage",
      "warning compatibility",
      "evidence quality",
      "overlap and duplicate detection",
      "individual delta calculation",
      "multiple-insight aggregation",
      "combined cap application",
      "calibrated-confidence bounds",
      "result construction",
    ]);
    expect(report.checks.validation_order_exact).toBe(true);
  });

  test("eligible excluded status policy result vocabulary and issue shape are frozen", () => {
    expect(report.result_vocabulary).toEqual([
      "calibrated",
      "calibrated_with_warnings",
      "no_adjustment",
      "insufficient_eligible_evidence",
      "blocked_invalid_input",
      "blocked_invalid_configuration",
      "blocked_invalid_lineage",
      "blocked_future_leakage",
      "blocked_overlapping_evidence",
      "blocked_unsupported_insight",
    ]);
    expect(report.checks.eligible_excluded_policy_exact).toBe(true);
    expect(report.checks.result_vocabulary_exact).toBe(true);
    expect(report.checks.issue_warning_contract_exact).toBe(true);
  });

  test("warning classifications delta table and attenuation policy are exact", () => {
    expect(report.warning_classifications).toEqual({
      duplicate_mapper_row_identity: "calibration_reducing",
      metric_value_unavailable: "calibration_reducing",
      minimum_total_support_not_met: "calibration_blocking",
      minimum_completed_outcomes_not_met: "calibration_blocking",
    });
    expect(report.delta_table_basis_points).toEqual({
      supportive_strong: 200,
      supportive_moderate: 100,
      supportive_weak: 50,
      neutral: 0,
      mixed: 0,
      adverse_weak: -100,
      adverse_moderate: -200,
      adverse_strong: -300,
    });
    expect(report.attenuation_policy).toEqual({
      method: "integer_ratio_multiplication",
      quality_order: "quality_then_sorted_warning_codes",
      calibration_reducing_multiplier: "1/2",
      rounding_mode: "round_half_away_from_zero",
    });
    expect(report.checks.warning_classification_exact).toBe(true);
    expect(report.checks.delta_table_exact).toBe(true);
    expect(report.checks.attenuation_exact).toBe(true);
  });

  test("overlap duplicate aggregation and confidence bounds are frozen", () => {
    expect(report.overlap_policy.key_components).toEqual([
      "pattern_discovery_result_sha256",
      "evidence_set_sha256",
      "group_sha256",
      "insight_sha256",
      "source_scenario_ids",
      "source_snapshot_ids",
    ]);
    expect(report.overlap_policy.conflict_behavior).toBe("blocked_overlapping_evidence");
    expect(report.aggregation_policy.sort_key).toEqual([
      "pattern_discovery_configuration_version",
      "pattern_discovery_result_sha256",
      "evidence_set_sha256",
      "group_sha256",
      "insight_id",
      "insight_sha256",
    ]);
    expect(report.confidence_bounds).toEqual({
      input_min_basis_points: 0,
      input_max_basis_points: 10000,
      output_min_basis_points: 0,
      output_max_basis_points: 10000,
      precision_decimal_places: 2,
      invalid_base_behavior: "blocked_invalid_input",
      valid_delta_out_of_bounds_behavior: "clamp_with_confidence_clamped_to_bounds_warning",
    });
    expect(report.checks.overlap_and_dedupe_exact).toBe(true);
    expect(report.checks.aggregation_and_caps_exact).toBe(true);
    expect(report.checks.confidence_rounding_bounds_exact).toBe(true);
  });

  test("zero adjustment lineage anti-leakage and identity/hash are exact", () => {
    expect(report.identity_hash_contract).toEqual({
      calibration_id_prefix: "confidence_calibration_v1:",
      calibration_id_hash_prefix_hex_length: 24,
      calibration_hash_algorithm: "sha256_canonical_json",
      schema_marker: "confidence_calibration_result_v1",
    });
    expect(report.checks.zero_adjustment_exact).toBe(true);
    expect(report.checks.lineage_anti_leakage_exact).toBe(true);
    expect(report.checks.identity_hash_exact).toBe(true);
  });

  test("output is advisory-only and implementation boundary is narrow", () => {
    expect(report.output_contract).toEqual({
      non_authoritative: true,
      applied: false,
      recommendation_object_allowed: false,
      persistence_instruction_allowed: false,
      ranking_output_allowed: false,
      scanner_output_allowed: false,
    });
    expect(report.implementation_boundary.action420_allowed_files).toEqual([
      "lib/pure-confidence-calibration.ts",
      "docs/action-420-pure-confidence-calibration-implementation.md",
      "scripts/action-420-pure-confidence-calibration-implementation-verify.mjs",
      "tests/e2e/action-420-pure-confidence-calibration-implementation.spec.ts",
    ]);
    expect(report.implementation_boundary.runner_approved).toBe(false);
    expect(report.implementation_boundary.fixture_package_approved).toBe(false);
    expect(report.checks.output_contract_exact).toBe(true);
    expect(report.checks.implementation_boundary_exact).toBe(true);
  });

  test("Action 420 tests fixture sequencing and Action 421 audit are mandatory", () => {
    expect(report.checks.test_inventory_exact).toBe(true);
    expect(report.checks.fixture_sequencing_exact).toBe(true);
    expect(report.checks.mandatory_action421_exact).toBe(true);
    expect(report.unresolved_conditions).toEqual([
      "executable_fixture_package_unapproved",
      "implementation_independent_audit_future_work",
    ]);
    expect(report.recommended_next_action).toBe("action_420_pure_confidence_calibration_implementation");
  });

  test("approved implementation may exist but no runner manifest persistence replay runtime provider Supabase or feedback exists", () => {
    expect(report.approved_implementation_module_present).toBe(true);
    expect(report.forbidden_artifacts_found).toEqual([]);
    expect(report.implementation_marker_hits).toEqual([]);
    expect(report.tracked_action419_evidence_files).toEqual([]);
    expect(report.runtime_consumer_files).toEqual([]);
    expect(report.checks.no_unapproved_implementation_exists).toBe(true);
    expect(report.checks.no_runner_or_manifest_exists).toBe(true);
    expect(report.checks.no_runtime_persistence_replay_provider_supabase_feedback).toBe(true);
  });

  test("source integrity runtime preview and secrets remain safe", () => {
    expect(Object.values(report.source_integrity).every((entry) => entry.unchanged)).toBe(true);
    expect(Object.values(report.no_effect_flags).every((value) => value === false)).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.checks.runtime_preview_untouched).toBe(true);
    expect(verifierOutput).not.toContain("automation-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("supabase-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("twelve-data-secret-that-must-not-appear");
  });
});
