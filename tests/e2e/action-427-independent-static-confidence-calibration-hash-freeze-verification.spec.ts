import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action427Report = Readonly<{
  verification_status: string;
  readiness_decision: string;
  readiness_vocabulary: readonly string[];
  checks: Record<string, boolean>;
  failed_conditions: readonly string[];
  unresolved_conditions: readonly string[];
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions_count: number;
  action426_reproduction: Readonly<{
    freeze_status: string;
    scenario_count: number;
    full_inventory_sha256: string;
    expected_full_inventory_sha256: string;
    inventory_file_hash_stable_after_rerun: boolean;
  }>;
  source_integrity: Record<string, Readonly<{ before: string | null; after: string | null; unchanged: boolean; exists: boolean }>>;
  scenario_count: number;
  scenario_ids: readonly string[];
  status_distribution: Record<string, number>;
  warning_distribution: Record<string, number>;
  warning_membership: Record<string, readonly string[]>;
  issue_distribution: Record<string, number>;
  issue_membership: Record<string, readonly string[]>;
  base_confidence_inventory: readonly string[];
  recomputed_inventory_sha256: string;
  scenario_summary_hashes_match: boolean;
  bounded_metadata: Readonly<{
    bounded_metadata_only: boolean;
    full_insights_retained: boolean;
    full_pattern_discovery_results_retained: boolean;
    recommendation_objects_retained: boolean;
    metadata_boundary_forbidden_text: readonly string[];
  }>;
  isolation: Readonly<{
    forbidden_artifacts_found: readonly string[];
    tracked_action427_evidence_files: readonly string[];
    provider_call_executed: boolean;
    supabase_write_executed: boolean;
    replay_executed: boolean;
    calibration_shadow_executed: boolean;
    recommendation_mutated: boolean;
    scanner_behavior_changed: boolean;
    live_ranking_changed: boolean;
  }>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const docPath = "docs/action-427-independent-static-confidence-calibration-hash-freeze-verification.md";
const verifierPath = "scripts/action-427-independent-static-confidence-calibration-hash-freeze-verification-verify.mjs";
const expectedInventoryHash = "875f385a05f58d982baa182350a662db5518e13f8c18557e4697317deb724cc5";

test.setTimeout(240000);

function runVerifier(): Action427Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 240000 })) as Action427Report;
}

test.describe.serial("Action 427 independent static Confidence Calibration hash-freeze verification", () => {
  let report: Action427Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("documents the independent audit contract and readiness decision", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(doc).toContain("Action 427 - Independent Static Confidence Calibration Hash-Freeze Verification");
    expect(doc).toContain("Readiness decision: ready_with_conditions");
    expect(doc).toContain("Action 428");
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([
      "issue_severity_and_messageKey_not_retained_in_action_426_bounded_inventory",
    ]);
  });

  test("reproduces Action 426 exactly and keeps protected sources immutable", () => {
    expect(report.action426_reproduction.freeze_status).toBe("passed");
    expect(report.action426_reproduction.scenario_count).toBe(45);
    expect(report.action426_reproduction.full_inventory_sha256).toBe(expectedInventoryHash);
    expect(report.action426_reproduction.expected_full_inventory_sha256).toBe(expectedInventoryHash);
    expect(report.action426_reproduction.inventory_file_hash_stable_after_rerun).toBe(true);
    for (const entry of Object.values(report.source_integrity)) {
      expect(entry.exists).toBe(true);
      expect(entry.unchanged).toBe(true);
      expect(entry.before).toBe(entry.after);
    }
  });

  test("verifies exact scenario IDs order source classification configuration and base-confidence inventory", () => {
    expect(report.scenario_count).toBe(45);
    expect(report.scenario_ids).toEqual(Array.from({ length: 45 }, (_, index) => `cc425_${String(index + 1).padStart(2, "0")}`));
    expect(report.checks.exact_scenario_ids_and_order).toBe(true);
    expect(report.checks.unique_scenario_ids).toBe(true);
    expect(report.checks.approved_source_classifications).toBe(true);
    expect(report.checks.configuration_exact).toBe(true);
    expect(report.base_confidence_inventory).toEqual([
      "-1",
      "0",
      "100",
      "10000",
      "10001",
      "50",
      "50.00",
      "5000",
      "5000.1",
      "9800",
      "9900",
      "Infinity",
      "NaN",
    ]);
  });

  test("verifies exact status warning and issue distributions", () => {
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
    expect(report.issue_membership.invalid_base_confidence).toEqual([
      "cc425_39",
      "cc425_40",
      "cc425_41",
      "cc425_42",
      "cc425_43",
      "cc425_44",
    ]);
  });

  test("verifies deltas attenuation caps clamps duplicates overlap and zero adjustment", () => {
    for (const check of [
      "delta_table_exact",
      "attenuation_exact",
      "aggregate_caps_exact",
      "confidence_bounds_clamps_exact",
      "zero_adjustment_exact",
      "duplicate_warning_equivalence",
      "duplicate_and_overlap_exact",
      "included_excluded_inventory_exact",
    ]) {
      expect(report.checks[check], check).toBe(true);
    }
    expect(report.warning_membership.duplicate_mapper_row_identity).toEqual([
      "cc425_09",
      "cc425_11",
      "cc425_12",
      "cc425_13",
    ]);
    expect(report.warning_membership.confidence_clamped_to_bounds).toEqual(["cc425_29", "cc425_31"]);
  });

  test("verifies calibration IDs hashes independent canonicalization bounded metadata and isolation", () => {
    expect(report.checks.calibration_ids_and_identity_hashes).toBe(true);
    expect(report.checks.result_and_scenario_hashes).toBe(true);
    expect(report.checks.independent_canonicalization).toBe(true);
    expect(report.recomputed_inventory_sha256).toBe(expectedInventoryHash);
    expect(report.scenario_summary_hashes_match).toBe(true);
    expect(report.bounded_metadata).toEqual({
      bounded_metadata_only: true,
      full_insights_retained: false,
      full_pattern_discovery_results_retained: false,
      recommendation_objects_retained: false,
      metadata_boundary_forbidden_text: [],
    });
    expect(report.isolation.forbidden_artifacts_found).toEqual([]);
    expect(report.isolation.tracked_action427_evidence_files).toEqual([]);
    expect(report.isolation.provider_call_executed).toBe(false);
    expect(report.isolation.supabase_write_executed).toBe(false);
    expect(report.isolation.replay_executed).toBe(false);
    expect(report.isolation.calibration_shadow_executed).toBe(false);
    expect(report.isolation.recommendation_mutated).toBe(false);
    expect(report.isolation.scanner_behavior_changed).toBe(false);
    expect(report.isolation.live_ranking_changed).toBe(false);
  });

  test("keeps upstream verifiers healthy and runtime preview paused", () => {
    expect(report.checks.action425_healthy).toBe(true);
    expect(report.checks.action426_healthy).toBe(true);
    expect(report.checks.action309_guard_healthy).toBe(true);
    expect(report.checks.golden_static_safety_healthy).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.unrelated_work_classification).toBe("action_427_docs_verifier_tests_and_minimal_guard_updates_only");
    expect(report.recommended_next_action).toBe("action_428_static_confidence_calibration_shadow_execution_approval_gate");
  });
});
