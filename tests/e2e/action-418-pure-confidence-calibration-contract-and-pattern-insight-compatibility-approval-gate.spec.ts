import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const verifierPath = "scripts/action-418-pure-confidence-calibration-contract-and-pattern-insight-compatibility-approval-gate-verify.mjs";
const docPath = "docs/action-418-pure-confidence-calibration-contract-and-pattern-insight-compatibility-approval-gate.md";

type Action418Report = Readonly<{
  verification_status: string;
  approval_decision: string;
  approval_vocabulary: readonly string[];
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  failed_conditions_count: number;
  unresolved_conditions: readonly string[];
  action417_readiness: Readonly<{
    verification_status: string;
    readiness_decision: string;
    action416_scenario_count: number;
    action416_executed_package_runs: number;
    action416_package_hash: string;
  }>;
  pure_entry_point: string;
  eligible_statuses: readonly string[];
  excluded_statuses: readonly string[];
  warning_classifications: Readonly<Record<string, string>>;
  confidence_bounds: Readonly<Record<string, number | boolean>>;
  delta_bounds: Readonly<Record<string, number>>;
  adjustment_model: Readonly<Record<string, number>>;
  aggregation_policy: Readonly<{
    sort_key: readonly string[];
    dedupe_key: string;
    overlap_components: readonly string[];
    aggregate_method: string;
  }>;
  result_vocabulary: readonly string[];
  issue_warning_shape: Readonly<{
    fields: readonly string[];
    path_standard: string;
    deterministic_sort: readonly string[];
  }>;
  identity_hash_contract: Readonly<{
    calibration_id_prefix: string;
    calibration_hash_algorithm: string;
    excluded_components: readonly string[];
  }>;
  forbidden_artifacts_found: readonly string[];
  implementation_marker_hits: readonly string[];
  tracked_action418_evidence_files: readonly string[];
  runtime_consumer_files: readonly string[];
  source_integrity: Readonly<Record<string, Readonly<{ unchanged: boolean }>>>;
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
  recommended_next_action: string;
}>;

let report: Action418Report;
let verifierOutput = "";

function runVerifier(): Action418Report {
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
  return JSON.parse(verifierOutput) as Action418Report;
}

test.describe.serial("Action 418 pure Confidence Calibration contract approval gate", () => {
  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documentation contract and approval decision are present", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved_with_conditions");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.failed_checks).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(doc).toContain("## Confidence Calibration Definition");
    expect(doc).toContain("Decision: `approved_with_conditions`");
  });

  test("Action 417 readiness remains the upstream authority", () => {
    expect(report.action417_readiness).toEqual({
      verification_status: "passed",
      readiness_decision: "ready",
      action416_scenario_count: 30,
      action416_executed_package_runs: 2,
      action416_package_hash: "ccbff3b786c62b0e56cd6300bae9a6950cba2ad15a3376f37dc7130d698477a8",
    });
    expect(report.checks.action417_readiness_ready).toBe(true);
  });

  test("pure function boundary is conceptual only", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(report.pure_entry_point).toContain("calibrateConfidence");
    expect(doc).toContain("synchronous, pure, immutable, deterministic");
    expect(doc).toContain("filesystem-free");
    expect(doc).toContain("network-free");
    expect(doc).toContain("recommendation-mutation-free");
    expect(report.checks.pure_function_boundary_frozen).toBe(true);
  });

  test("eligible and excluded Pattern Discovery statuses are exact", () => {
    expect(report.eligible_statuses).toEqual(["discovered", "discovered_with_warnings"]);
    expect(report.excluded_statuses).toEqual([
      "insufficient_evidence",
      "blocked_future_leakage",
      "blocked_invalid_configuration",
      "blocked_invalid_input",
      "blocked_invalid_lineage",
      "blocked_non_consumable_row",
      "blocked_nondeterministic_grouping",
    ]);
    expect(report.checks.eligible_insight_policy_exact).toBe(true);
    expect(report.checks.excluded_insight_policy_exact).toBe(true);
  });

  test("warning policy separates reducing and blocking warnings", () => {
    expect(report.warning_classifications).toEqual({
      duplicate_mapper_row_identity: "calibration_reducing",
      metric_value_unavailable: "calibration_reducing",
      minimum_total_support_not_met: "calibration_blocking",
      minimum_completed_outcomes_not_met: "calibration_blocking",
    });
    expect(report.checks.warning_policy_exact).toBe(true);
  });

  test("support completed-outcome confidence and delta bounds are frozen", () => {
    expect(report.confidence_bounds).toEqual({
      input_min: 0,
      input_max: 100,
      output_min: 0,
      output_max: 100,
      precision_decimal_places: 2,
      scaled_integer_basis_points: true,
    });
    expect(report.delta_bounds).toEqual({
      per_insight_positive_max: 2,
      per_insight_negative_max: -3,
      combined_positive_max: 4,
      combined_negative_max: -6,
    });
    expect(report.checks.support_and_completed_thresholds_exact).toBe(true);
    expect(report.checks.confidence_bounds_exact).toBe(true);
    expect(report.checks.delta_bounds_exact).toBe(true);
  });

  test("conservative adjustment model covers supportive mixed neutral and adverse evidence", () => {
    expect(report.adjustment_model).toEqual({
      supportive_strong: 2,
      supportive_moderate: 1,
      supportive_weak: 0.5,
      neutral: 0,
      mixed: 0,
      adverse_weak: -1,
      adverse_moderate: -2,
      adverse_strong: -3,
    });
    expect(report.checks.adjustment_model_exact).toBe(true);
  });

  test("multiple-insight aggregation overlap and deterministic dedupe are frozen", () => {
    expect(report.aggregation_policy.sort_key).toEqual([
      "setupFamily",
      "horizon",
      "evidenceSetHash",
      "groupHash",
      "insightId",
      "insightHash",
    ]);
    expect(report.aggregation_policy.dedupe_key).toBe(
      "configurationVersion|patternDiscoveryResultHash|evidenceSetHash|groupHash|insightId|insightHash",
    );
    expect(report.aggregation_policy.overlap_components).toEqual([
      "evidenceSetHash",
      "groupHash",
      "insightHash",
      "sourceCaseId",
      "sourceSnapshotId",
      "patternDiscoveryResultHash",
    ]);
    expect(report.aggregation_policy.aggregate_method).toBe("dedupe_then_overlap_resolve_then_sum_then_cap");
    expect(report.checks.multiple_insight_aggregation_exact).toBe(true);
    expect(report.checks.overlap_policy_exact).toBe(true);
  });

  test("lineage anti-leakage result vocabulary and issue shape are exact", () => {
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
    expect(report.issue_warning_shape).toEqual({
      fields: ["code", "path", "severity", "messageKey"],
      path_standard: "RFC_6901",
      deterministic_sort: ["severity", "code", "path", "messageKey"],
    });
    expect(report.checks.lineage_and_leakage_exact).toBe(true);
    expect(report.checks.result_vocabulary_exact).toBe(true);
    expect(report.checks.issue_contract_exact).toBe(true);
  });

  test("identity and hash contract is deterministic", () => {
    expect(report.identity_hash_contract.calibration_id_prefix).toBe("confidence_calibration_v1:");
    expect(report.identity_hash_contract.calibration_hash_algorithm).toBe("sha256_canonical_json");
    expect(report.identity_hash_contract.excluded_components).toEqual([
      "current_time",
      "machine_paths",
      "runtime_state",
      "output_position",
      "randomness",
      "secrets",
    ]);
    expect(report.checks.identity_hash_policy_exact).toBe(true);
  });

  test("no calibration implementation runner manifest or execution exists", () => {
    expect(report.forbidden_artifacts_found).toEqual([]);
    expect(report.implementation_marker_hits).toEqual([]);
    expect(report.tracked_action418_evidence_files).toEqual([]);
    expect(report.checks.no_pure_calibration_implementation_exists).toBe(true);
    expect(report.checks.no_runner_or_manifest_exists).toBe(true);
  });

  test("source integrity and runtime safety remain intact", () => {
    expect(Object.values(report.source_integrity).every((entry) => entry.unchanged)).toBe(true);
    expect(report.runtime_consumer_files).toEqual([]);
    expect(Object.values(report.no_effect_flags).every((value) => value === false)).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.recommended_next_action).toBe("action_419_pure_confidence_calibration_implementation_approval_gate");
  });

  test("unresolved conditions are implementation-gate only and secrets do not leak", () => {
    expect(report.unresolved_conditions).toEqual([
      "implementation_file_path_unapproved",
      "executable_fixture_package_unapproved",
      "implementation_independent_audit_future_work",
    ]);
    expect(verifierOutput).not.toContain("automation-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("supabase-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("twelve-data-secret-that-must-not-appear");
  });
});
