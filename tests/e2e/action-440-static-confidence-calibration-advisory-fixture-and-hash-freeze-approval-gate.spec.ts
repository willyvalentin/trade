import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Scenario = Readonly<{
  id: string;
  order: number;
  primary_family: string;
  expected_advisory_status: string;
  coverage_tags: readonly string[];
  expected_application_eligibility: boolean;
  non_authoritative: boolean;
  applied: boolean;
}>;

type Action440Report = Readonly<{
  verification_status: string;
  approval_decision: string;
  approval_vocabulary: readonly string[];
  failed_conditions: readonly string[];
  unresolved_conditions: readonly string[];
  exact_scenario_count: number;
  exact_scenario_ids: readonly string[];
  scenario_inventory: readonly Scenario[];
  coverage_families: readonly string[];
  status_distribution: Record<string, number>;
  input_source_policy: Record<string, boolean>;
  complete_legacy_hash_policy: Record<string, boolean>;
  confidence_lineage_leakage_feedback_policy: Record<string, boolean>;
  warning_issue_no_adjustment_inventory: Record<string, boolean>;
  output_boundary: Record<string, boolean>;
  advisory_identity_hash_policy: Record<string, boolean | string>;
  future_hash_freeze_sequencing: readonly string[];
  action441_boundary: Readonly<{
    approved_files: readonly string[];
    shadow_runner_approved: boolean;
    shadow_manifest_approved: boolean;
    recommendation_engine_consumer_approved: boolean;
    ui_integration_approved: boolean;
    confidence_application_approved: boolean;
    runtime_or_persistence_approved: boolean;
  }>;
  repeat_run_policy: Readonly<{ exact_run_count: number; third_repair_run_allowed: boolean }>;
  stop_conditions: readonly string[];
  forbidden_future_artifacts: readonly string[];
  source_integrity: Record<string, Readonly<{ matches_expected: boolean; expected_sha256: string }>>;
  safety: Record<string, boolean>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const docPath = "docs/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate.md";
const verifierPath = "scripts/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate-verify.mjs";
const testPath = "tests/e2e/action-440-static-confidence-calibration-advisory-fixture-and-hash-freeze-approval-gate.spec.ts";
const adapterPath = ["lib", `${["confidence", "calibration", "advisory", "adapter"].join("-")}.ts`].join("/");

test.setTimeout(300000);

function runVerifier(): Action440Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as Action440Report;
}

test.describe.serial("Action 440 static confidence calibration advisory fixture hash-freeze approval gate", () => {
  let report: Action440Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("creates approval-gate artifacts and returns approved with conditions", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.approval_decision).toBe("approved_with_conditions");
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toContain("executable_semantic_hashes_require_action_441");
  });

  test("documents Action 439 readiness and historical compatibility policy", () => {
    expect(doc).toContain("readiness_decision: ready_with_conditions");
    expect(doc).toContain("runtime_preview_waiting_for_operator_inputs");
    expect(doc).toContain("historical compatibility condition");
    expect(doc).toContain("no_unexpected_action434_consumers");
    expect(report.source_integrity[adapterPath].expected_sha256).toBe(
      "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
    );
    expect(Object.values(report.source_integrity).every((item) => item.matches_expected)).toBe(true);
  });

  test("freezes exactly 48 scenario IDs in order", () => {
    expect(report.exact_scenario_count).toBe(48);
    expect(report.exact_scenario_ids).toEqual(Array.from({ length: 48 }, (_, index) => `ca440_${String(index + 1).padStart(2, "0")}`));
    expect(report.scenario_inventory.map((scenario) => scenario.order)).toEqual(Array.from({ length: 48 }, (_, index) => index + 1));
    expect(report.scenario_inventory.every((scenario) => scenario.non_authoritative && !scenario.applied)).toBe(true);
  });

  test("freezes coverage families and status distribution", () => {
    for (const family of [
      "eligible_success",
      "blocked_calibration_input",
      "confidence_binding",
      "recommendation_lineage",
      "calibration_integrity",
      "complete_hash",
      "legacy_hash",
      "fallback_bypass",
      "pattern_discovery_lineage",
      "pattern_insight_lineage",
      "anti_leakage",
      "anti_feedback",
      "warning_inventory",
      "issue_inventory",
      "no_adjustment",
      "semantic_ordering",
      "output_boundary",
    ]) {
      expect(report.coverage_families).toContain(family);
    }
    expect(report.status_distribution).toEqual({
      advisory_ready: 6,
      advisory_ready_with_warnings: 2,
      advisory_no_adjustment: 1,
      advisory_insufficient_evidence: 1,
      blocked_invalid_input: 6,
      blocked_confidence_mismatch: 3,
      blocked_invalid_lineage: 12,
      blocked_future_leakage: 6,
      blocked_calibration_result: 10,
      blocked_unsupported_status: 1,
    });
  });

  test("freezes source, recommendation, calibration, complete hash, legacy hash, and fallback policies", () => {
    expect(report.input_source_policy.production_recommendations_allowed).toBe(false);
    expect(report.input_source_policy.supabase_rows_allowed).toBe(false);
    expect(report.input_source_policy.provider_data_allowed).toBe(false);
    expect(report.input_source_policy.stdin_allowed).toBe(false);
    expect(Object.values(report.complete_legacy_hash_policy).every(Boolean)).toBe(true);
    expect(report.scenario_inventory.some((scenario) => scenario.coverage_tags.includes("complete_hash"))).toBe(true);
    expect(report.scenario_inventory.some((scenario) => scenario.coverage_tags.includes("legacy_hash"))).toBe(true);
    expect(report.scenario_inventory.some((scenario) => scenario.coverage_tags.includes("fallback_bypass"))).toBe(true);
  });

  test("freezes confidence lineage leakage feedback warning issue and no-adjustment policies", () => {
    expect(report.confidence_lineage_leakage_feedback_policy.confidence_rounding_or_repair_allowed).toBe(false);
    expect(report.confidence_lineage_leakage_feedback_policy.missing_or_inconsistent_lineage_fails_closed).toBe(true);
    expect(report.confidence_lineage_leakage_feedback_policy.anti_leakage_fails_closed).toBe(true);
    expect(report.confidence_lineage_leakage_feedback_policy.anti_feedback_fails_closed).toBe(true);
    expect(Object.values(report.warning_issue_no_adjustment_inventory).every(Boolean)).toBe(true);
    expect(report.scenario_inventory.find((scenario) => scenario.id === "ca440_03")?.expected_advisory_status).toBe("advisory_no_adjustment");
  });

  test("freezes output boundary advisory identity Action 441 and sequencing", () => {
    expect(report.output_boundary.metadata_only_future_inventory).toBe(true);
    expect(report.output_boundary.recommendation_objects_retained).toBe(false);
    expect(report.output_boundary.supabase_payloads_retained).toBe(false);
    expect(report.advisory_identity_hash_policy.advisory_id_policy).toBe("confidence_calibration_advisory_v1:<first_24_chars_of_identity_sha256>");
    expect(report.future_hash_freeze_sequencing).toEqual([
      "Action 441 - Static Advisory Fixture & Semantic Hash Freeze",
      "Action 442 - Independent Advisory Hash-Freeze Verification",
      "Action 443 - Static Advisory Shadow Execution Approval Gate",
      "Action 444 - Static Advisory Shadow Execution",
      "Action 445 - Independent Advisory Shadow Verification",
    ]);
    expect(report.action441_boundary.approved_files).toContain("scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs");
    expect(report.action441_boundary.shadow_runner_approved).toBe(false);
    expect(report.action441_boundary.recommendation_engine_consumer_approved).toBe(false);
  });

  test("freezes two-run policy stop conditions and keeps all execution surfaces closed", () => {
    expect(report.repeat_run_policy.exact_run_count).toBe(2);
    expect(report.repeat_run_policy.third_repair_run_allowed).toBe(false);
    expect(report.stop_conditions).toContain("adapter_hash_differs");
    expect(report.stop_conditions).toContain("scenario_count_not_48");
    expect(report.stop_conditions).toContain("runtime_provider_supabase_replay_import_appears");
    expect(report.forbidden_future_artifacts).toEqual([]);
    expect(Object.values(report.safety).every((value) => value === false)).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.unrelated_work_classification).toBe(
      "action_440_static_confidence_calibration_advisory_fixture_hash_freeze_approval_gate_only",
    );
    expect(report.recommended_next_action).toBe("action_441_static_confidence_calibration_advisory_hash_freeze");
  });
});
