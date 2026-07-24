import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action425Report = Readonly<{
  verification_status: string;
  approval_decision: "approved" | "approved_with_conditions" | "blocked";
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions_count: number;
  unresolved_conditions: readonly string[];
  checks: Record<string, boolean>;
  exact_scenario_count: number;
  scenario_ids: readonly string[];
  coverage_families: readonly string[];
  base_confidence_inventory: readonly string[];
  status_inventory: Record<string, number>;
  warning_inventory: readonly string[];
  issue_inventory: readonly string[];
  future_action426_allowed_files: readonly string[];
  forbidden_artifacts_found: readonly string[];
  tracked_action425_evidence_files: readonly string[];
  source_integrity: Record<string, Readonly<{ expected: string; actual: string | null; unchanged: boolean }>>;
  no_effect_flags: Record<string, boolean>;
  runtime_preview_status: string;
  runtime_preview_route_changed: boolean;
  runtime_preview_candidate_advanced: boolean;
  calibration_fixture_package_created: boolean;
  calibration_hash_inventory_created: boolean;
  calibration_runner_created: boolean;
  calibration_manifest_created: boolean;
  calibration_shadow_executed: boolean;
  calibration_execution_executed: boolean;
  recommendation_mutation_executed: boolean;
  recommended_next_action: string;
}>;

const docPath = "docs/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate.md";
const verifierPath = "scripts/action-425-static-confidence-calibration-fixture-and-hash-freeze-approval-gate-verify.mjs";
const modulePath = "lib/pure-confidence-calibration.ts";
const expectedModuleHash = "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70";

test.setTimeout(120000);

function runVerifier(): Action425Report {
  return JSON.parse(execFileSync("node", [verifierPath], {
    encoding: "utf8",
    timeout: 120000,
  })) as Action425Report;
}

test.describe.serial("Action 425 static Confidence Calibration fixture and hash-freeze approval gate", () => {
  let report: Action425Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("documents approval-gate-only boundary and Action 424 readiness", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(doc).toContain("Action 425 approves the exact boundary");
    expect(doc).toContain("Action 424 reported:");
    expect(doc).toContain("readiness: `ready_with_conditions`");
    expect(doc).toContain("executable_calibration_fixture_package_not_created");
    expect(doc).toContain("calibration_hash_freeze_gate_pending");
    expect(doc).toContain("runtime_preview_waiting_for_operator_inputs");
  });

  test("approves with conditions and does not create execution surfaces", () => {
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved_with_conditions");
    expect(report.failed_conditions_count).toBe(0);
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.unresolved_conditions).toEqual([
      "semantic_hash_constants_pending_action_426",
      "metadata_hash_inventory_pending_action_426",
      "independent_hash_freeze_verification_pending_action_427",
    ]);
    expect(report.calibration_fixture_package_created).toBe(false);
    expect(report.calibration_hash_inventory_created).toBe(false);
    expect(report.calibration_runner_created).toBe(false);
    expect(report.calibration_manifest_created).toBe(false);
    expect(report.calibration_shadow_executed).toBe(false);
    expect(report.calibration_execution_executed).toBe(false);
    expect(report.recommendation_mutation_executed).toBe(false);
  });

  test("freezes exact scenario count, IDs, coverage families, and status inventory", () => {
    expect(report.exact_scenario_count).toBe(45);
    expect(report.scenario_ids).toHaveLength(45);
    expect(report.scenario_ids[0]).toBe("cc425_01");
    expect(report.scenario_ids.at(-1)).toBe("cc425_45");
    for (const id of report.scenario_ids) expect(doc).toContain(id);

    for (const family of [
      "strong_supportive",
      "moderate_supportive",
      "weak_supportive",
      "strong_adverse",
      "duplicate_mapper_warning",
      "metric_unavailable_warning",
      "positive_combined_cap",
      "negative_combined_cap",
      "conflicting_overlap",
      "upper_bound_clamp",
      "lower_bound_clamp",
      "unsupported_status",
      "invalid_lineage",
      "failed_leakage",
      "invalid_configuration",
      "no_eligible_evidence",
    ]) {
      expect(report.coverage_families).toContain(family);
    }

    expect(report.status_inventory).toEqual({
      calibrated: 14,
      calibrated_with_warnings: 11,
      no_adjustment: 5,
      insufficient_eligible_evidence: 1,
      blocked_invalid_input: 9,
      blocked_invalid_configuration: 1,
      blocked_invalid_lineage: 1,
      blocked_future_leakage: 1,
      blocked_overlapping_evidence: 1,
      blocked_unsupported_insight: 1,
    });
  });

  test("freezes source policy, configuration, confidence, deltas, caps, overlap, clamp, and zero behavior", () => {
    expect(doc).toContain("deterministic test-local");
    expect(doc).toContain("Denied sources");
    expect(doc).toContain("Supabase rows");
    expect(doc).toContain("provider/news data");
    expect(doc).toContain("configuration_version: confidence_calibration_config_v1");
    expect(doc).toContain("supportive_strong");
    expect(doc).toContain("adverse_strong");
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
    expect(doc).toContain("positive_combined_cap");
    expect(doc).toContain("negative_combined_cap");
    expect(doc).toContain("same_evidence_set_overlap");
    expect(doc).toContain("blocked_overlapping_evidence");
    expect(doc).toContain("cc425_04`, `cc425_05`, `cc425_20`, `cc425_32`, and `cc425_33");
  });

  test("freezes warning, duplicate warning, issue, identity, and metadata-only policies", () => {
    expect(report.warning_inventory).toContain("duplicate_mapper_row_identity:cc425_09");
    expect(report.warning_inventory).toContain("metric_value_unavailable:cc425_10");
    expect(report.warning_inventory).toContain("confidence_clamped_to_bounds:cc425_29");
    expect(report.issue_inventory).toContain("warning_status_contradiction:cc425_14");
    expect(report.issue_inventory).toContain("invalid_base_confidence:cc425_44");
    expect(doc).toContain("one duplicate warning");
    expect(doc).toContain("duplicate warning dedupe");
    expect(doc).toContain("confidence_calibration_v1:[a-f0-9]{24}");
    expect(doc).toContain("metadata-only");
    expect(doc).toContain("No full Pattern Insight objects");
  });

  test("freezes hash sequencing, Action 426 boundary, stop conditions, and repeat-run requirement", () => {
    expect(doc).toContain("Action 426 - Static Calibration Fixture and Semantic Hash Freeze");
    expect(doc).toContain("Action 427 - Independent Calibration Hash-Freeze Verification");
    expect(doc).toContain("Action 428 - Static Calibration Shadow Execution Approval Gate");
    expect(doc).toContain("Action 429 - Static Calibration Shadow Execution");
    expect(doc).toContain("Action 430 - Independent Calibration Shadow Verification");
    expect(doc).toContain("run the freeze exactly twice");
    expect(doc).toContain("No third repair run");
    expect(doc).toContain("Stop if pure calibration hash differs");
    expect(report.future_action426_allowed_files).toEqual([
      "docs/action-426-static-confidence-calibration-hash-freeze.md",
      "docs/action-426-static-confidence-calibration-hash-inventory.json",
      "scripts/action-426-static-confidence-calibration-hash-freeze.mjs",
      "scripts/action-426-static-confidence-calibration-hash-freeze-verify.mjs",
      "tests/e2e/action-426-static-confidence-calibration-hash-freeze.spec.ts",
    ]);
  });

  test("preserves source integrity and avoids calibration execution", () => {
    const moduleHash = createHash("sha256").update(readFileSync(modulePath)).digest("hex");
    expect(moduleHash).toBe(expectedModuleHash);
    expect(report.source_integrity[modulePath].unchanged).toBe(true);
    expect(report.checks.verifier_does_not_execute_calibration).toBe(true);
    expect(report.forbidden_artifacts_found).toEqual([]);
    expect(report.tracked_action425_evidence_files).toEqual([]);
  });

  test("keeps runtime, provider, Supabase, replay, feedback, recommendation mutation, and runtime preview untouched", () => {
    expect(Object.values(report.no_effect_flags).every((value) => value === false)).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.runtime_preview_route_changed).toBe(false);
    expect(report.runtime_preview_candidate_advanced).toBe(false);
    expect(report.recommended_next_action).toBe("action_426_static_confidence_calibration_hash_freeze");
  });
});

