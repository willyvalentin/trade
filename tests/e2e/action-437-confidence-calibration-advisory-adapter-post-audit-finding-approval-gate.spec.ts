import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action437Report = Readonly<{
  verification_status: string;
  approval_decision: "approved" | "approved_with_conditions" | "blocked";
  approval_vocabulary: readonly string[];
  root_cause_classification: string;
  checks: Record<string, boolean>;
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions_count: number;
  failed_conditions: readonly string[];
  unresolved_conditions: readonly string[];
  action436_blocked_finding: Record<string, boolean>;
  exact_failed_conditions: readonly string[];
  exact_five_findings: readonly string[];
  result_field_inventory: readonly Readonly<{ field: string; classification: string }>[];
  calibration_id_binding: Record<string, boolean>;
  warning_binding: Record<string, boolean>;
  pattern_discovery_hash_binding: Record<string, boolean>;
  pattern_insight_lineage_review: Record<string, boolean>;
  phase_policy: Record<string, boolean>;
  mismatch_behavior: Readonly<{
    status: string;
    issue_code: string;
    issue_path: string;
    messageKey: string;
    advisory_eligible: boolean;
    application_eligible: boolean;
    non_authoritative: boolean;
    applied: boolean;
    raw_hash_values_exposed: boolean;
  }>;
  canonicalization: Record<string, boolean>;
  attack_matrix: readonly string[];
  api_preservation: Readonly<{
    runtime_exports: readonly string[];
    public_type_exports: readonly string[];
    no_public_hashing_helpers: boolean;
    no_public_canonicalization_helpers: boolean;
    no_class_service_repository_cache_singleton: boolean;
  }>;
  unaffected_behavior_preservation: Record<string, boolean>;
  no_adjustment_preservation: Record<string, boolean>;
  action438_boundary: Readonly<{
    approved_files: readonly string[];
    forbidden_surfaces: readonly string[];
  }>;
  action438_regression_inventory: readonly string[];
  mandatory_independent_audit: string;
  source_integrity: Record<string, Readonly<{ matches: boolean }>>;
  forbidden_artifacts_found: readonly string[];
  runtime_consumers: readonly string[];
  safety: Record<string, boolean>;
  upstream_health: Record<string, string>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
  next_required_independent_audit: string;
}>;

const docPath = "docs/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.md";
const verifierPath = "scripts/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate-verify.mjs";
const testPath = "tests/e2e/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.spec.ts";

test.setTimeout(300000);

function runVerifier(): Action437Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as Action437Report;
}

test.describe.serial("Action 437 confidence calibration advisory adapter post-audit finding approval gate", () => {
  let report: Action437Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("creates approval-gate-only artifacts and returns approved", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(doc).toContain("Action 437 - Confidence Calibration Advisory Adapter Post-Audit Finding Approval Gate");
    expect(report.verification_status).toBe("passed");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.approval_decision).toBe("approved");
    expect(report.recommended_next_action).toBe(
      "action_438_confidence_calibration_advisory_adapter_complete_semantic_binding_remediation",
    );
  });

  test("freezes Action 436 finding or accepted post-remediation closure", () => {
    expect(Object.values(report.action436_blocked_finding).every(Boolean)).toBe(true);
    expect([
      JSON.stringify(["retained_hash_tampering_matrix", "isolation", "no_remaining_gaps"]),
      JSON.stringify([]),
    ]).toContain(JSON.stringify(report.exact_failed_conditions));
    expect([
      JSON.stringify([
        "calibration_id_retained_hash_tampering_not_blocked",
        "warning_code_retained_hash_tampering_not_blocked",
        "warning_path_retained_hash_tampering_not_blocked",
        "pattern_discovery_sha256_retained_hash_tampering_not_blocked",
        "pattern_discovery_result_hash_tampering_blocks_late_lineage_not_hash_mismatch",
      ]),
      JSON.stringify([]),
    ]).toContain(JSON.stringify(report.exact_five_findings));
    expect(report.root_cause_classification).toBe(
      "calibration_semantic_result_payload_incomplete_for_identity_warning_and_pattern_lineage_fields",
    );
  });

  test("inventories complete result fields and binding policies", () => {
    const inventory = new Map(report.result_field_inventory.map((entry) => [entry.field, entry.classification]));
    expect(inventory.get("calibration_id")).toBe("included_in_result_hash");
    expect(inventory.get("warnings[].code")).toBe("included_in_result_hash");
    expect(inventory.get("warnings[].path")).toBe("included_in_result_hash");
    expect(inventory.get("warnings[].severity")).toBe("included_in_result_hash");
    expect(inventory.get("warnings[].messageKey")).toBe("included_in_result_hash");
    expect(inventory.get("lineage_hashes[].pattern_discovery_sha256")).toBe("included_in_result_hash");
    expect(inventory.get("lineage_hashes[].pattern_discovery_result_sha256")).toBe("included_in_result_hash");
    expect(inventory.get("source_scenario_ids")).toBe("absent_from_confidence_calibration_result");
    expect(report.checks.complete_result_payload_inventory).toBe(true);
  });

  test("freezes calibration ID warning Pattern Discovery and Pattern Insight rules", () => {
    expect(Object.values(report.calibration_id_binding).every(Boolean)).toBe(true);
    expect(Object.values(report.warning_binding).every(Boolean)).toBe(true);
    expect(Object.values(report.pattern_discovery_hash_binding).every(Boolean)).toBe(true);
    expect(Object.values(report.pattern_insight_lineage_review).every(Boolean)).toBe(true);
  });

  test("freezes phase precedence defense in depth mismatch and canonicalization", () => {
    expect(Object.values(report.phase_policy).every(Boolean)).toBe(true);
    expect(report.mismatch_behavior.status).toBe("blocked_calibration_result");
    expect(report.mismatch_behavior.issue_path).toBe("/calibration/calibration_hash");
    expect(report.mismatch_behavior.raw_hash_values_exposed).toBe(false);
    expect(Object.values(report.canonicalization).every(Boolean)).toBe(true);
  });

  test("freezes attack matrix API and unaffected behavior preservation", () => {
    for (const key of [
      "calibration_id",
      "warning_code",
      "warning_path",
      "warning_severity",
      "warning_messageKey",
      "pattern_discovery_sha256",
      "pattern_discovery_result_sha256",
      "combined_mutations",
    ]) {
      expect(report.attack_matrix).toContain(key);
    }
    expect(report.api_preservation.runtime_exports).toEqual(["buildConfidenceCalibrationAdvisory"]);
    expect(report.api_preservation.public_type_exports).toEqual([
      "ImmutableRecommendationConfidenceEnvelope",
      "FrozenAdvisoryConsumptionConfiguration",
      "ConfidenceCalibrationAdvisoryResult",
    ]);
    expect(Object.values(report.unaffected_behavior_preservation).every(Boolean)).toBe(true);
    expect(Object.values(report.no_adjustment_preservation).every(Boolean)).toBe(true);
  });

  test("freezes Action 438 boundary regression inventory and mandatory Action 439", () => {
    expect(report.action438_boundary.approved_files).toContain("lib/confidence-calibration-advisory-adapter.ts");
    expect(report.action438_boundary.forbidden_surfaces).toEqual(
      expect.arrayContaining(["fixtures", "runner", "manifest", "shadow_execution", "runtime", "supabase"]),
    );
    expect(report.action438_regression_inventory).toEqual(
      expect.arrayContaining([
        "calibration_id_retained_hash_tampering_blocked",
        "warning_code_retained_hash_tampering_blocked",
        "pattern_discovery_result_sha256_tampering_blocked",
        "phase_11_lineage_still_blocks_independently",
      ]),
    );
    expect(report.mandatory_independent_audit).toBe("action_439_independent_complete_semantic_binding_verification");
    expect(report.next_required_independent_audit).toBe("action_439_independent_complete_semantic_binding_verification");
  });

  test("preserves source immutability isolation and safety", () => {
    expect(Object.values(report.source_integrity).every((entry) => entry.matches)).toBe(true);
    expect(report.forbidden_artifacts_found).toEqual([]);
    expect(report.runtime_consumers).toEqual([]);
    expect(Object.values(report.safety).every((value) => value === false)).toBe(true);
    expect(report.upstream_health.action309_guard).toBe("passed");
    expect(report.upstream_health.action436).toBe("passed");
    expect(report.upstream_health.golden_static_safety).toBe("passed");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("records condition counts and classification consistently", () => {
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.passed_conditions_count).toBe(Object.keys(report.checks).length);
    expect(report.unrelated_work_classification).toBe(
      "action_437_confidence_calibration_advisory_adapter_post_audit_finding_approval_gate_only",
    );
  });
});
