import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action433Report = Readonly<{
  verification_status: string;
  readiness_decision: "ready" | "ready_with_conditions" | "blocked";
  readiness_vocabulary: readonly string[];
  checks: Record<string, boolean>;
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions_count: number;
  failed_conditions: readonly string[];
  unresolved_conditions: readonly string[];
  remaining_gap_inventory: readonly string[];
  source_integrity: Record<string, Readonly<{ matches: boolean }>>;
  export_api_audit: Readonly<{
    runtime_exports: readonly string[];
    public_type_exports: readonly string[];
    no_public_helper_exports: boolean;
  }>;
  validation_precedence: Record<string, boolean>;
  status_mapping: Readonly<{
    eligible: Record<string, boolean>;
    blocked: Record<string, boolean>;
  }>;
  confidence_binding: Record<string, boolean>;
  recommendation_lineage: Record<string, boolean>;
  calibration_identity_and_hash: Record<string, boolean>;
  anti_leakage: Record<string, boolean>;
  anti_feedback: Record<string, boolean>;
  warning_issue_behavior: Record<string, boolean>;
  no_adjustment: Record<string, boolean>;
  output_boundary: Readonly<{
    no_forbidden_output_fields: boolean;
  }>;
  advisory_identity: Record<string, boolean>;
  immutability_determinism: Record<string, boolean>;
  isolation: Readonly<{
    runtime_consumers: readonly string[];
    unexpected_consumers: readonly string[];
    safety: Record<string, boolean>;
  }>;
  upstream_health: Record<string, string>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const docPath = "docs/action-433-independent-confidence-calibration-advisory-adapter-verification.md";
const verifierPath = "scripts/action-433-independent-confidence-calibration-advisory-adapter-verification-verify.mjs";
const testPath = "tests/e2e/action-433-independent-confidence-calibration-advisory-adapter-verification.spec.ts";

test.setTimeout(300000);

function runVerifier(): Action433Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as Action433Report;
}

test.describe.serial("Action 433 Independent Confidence Calibration advisory adapter verification", () => {
  let report: Action433Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("creates the independent audit artifacts and records deterministic readiness", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(doc).toContain("Action 433 - Independent Confidence Calibration Advisory Adapter Verification");
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(["ready", "ready_with_conditions", "blocked"]).toContain(report.readiness_decision);
    expect([
      "action_434_blocked_until_advisory_adapter_contract_remediation_gate",
      "action_434_static_advisory_fixture_hash_freeze_approval",
    ]).toContain(report.recommended_next_action);
  });

  test("verifies source integrity and exact export API surface", () => {
    expect(Object.values(report.source_integrity).every((entry) => entry.matches)).toBe(true);
    expect(report.export_api_audit.runtime_exports).toEqual(["buildConfidenceCalibrationAdvisory"]);
    expect(report.export_api_audit.public_type_exports).toEqual([
      "ImmutableRecommendationConfidenceEnvelope",
      "FrozenAdvisoryConsumptionConfiguration",
      "ConfidenceCalibrationAdvisoryResult",
    ]);
    expect(report.export_api_audit.no_public_helper_exports).toBe(true);
    expect(report.checks.export_api_integrity).toBe(true);
  });

  test("audits validation precedence and status mappings", () => {
    expect(Object.values(report.validation_precedence).every(Boolean)).toBe(true);
    expect(report.checks.validation_precedence).toBe(true);
    expect(report.status_mapping.eligible).toEqual({
      calibrated: true,
      calibrated_with_warnings: true,
      no_adjustment: true,
    });
    expect(Object.values(report.status_mapping.blocked).every(Boolean)).toBe(true);
    expect(report.checks.unknown_status_blocked).toBe(true);
  });

  test("audits confidence binding and recommendation lineage attacks", () => {
    for (const key of [
      "exact_equality",
      "tiny_decimal_mismatch",
      "one_basis_point_mismatch",
      "excessive_precision",
      "below_range",
      "above_range",
      "signed_zero",
      "missing_calibration_base",
    ]) {
      expect(report.confidence_binding[key], key).toBe(true);
    }
    expect(Object.values(report.recommendation_lineage).every(Boolean)).toBe(true);
  });

  test("records calibration ID/hash spoofing audit outcome", () => {
    expect(report.calibration_identity_and_hash.missing_calibration_id_blocks).toBe(true);
    expect(report.calibration_identity_and_hash.malformed_calibration_id_blocks).toBe(true);
    expect(report.calibration_identity_and_hash.wrong_calibration_prefix_blocks).toBe(true);
    expect(report.calibration_identity_and_hash.malformed_result_hash_blocks).toBe(true);
    if (report.checks.calibration_identity_and_hash) {
      expect(report.calibration_identity_and_hash.swapped_result_hash_blocks).toBe(true);
      expect(report.calibration_identity_and_hash.changed_status_retained_hash_blocks).toBe(true);
      expect(report.calibration_identity_and_hash.changed_proposed_confidence_retained_hash_blocks).toBe(true);
      expect(report.calibration_identity_and_hash.changed_warning_inventory_retained_hash_blocks).toBe(true);
      expect(report.remaining_gap_inventory).toEqual([]);
    } else {
      expect(report.remaining_gap_inventory).toEqual([
        "swapped_result_hash_blocks",
        "changed_status_retained_hash_blocks",
        "changed_proposed_confidence_retained_hash_blocks",
        "changed_warning_inventory_retained_hash_blocks",
      ]);
    }
  });

  test("audits leakage and feedback attacks", () => {
    expect(Object.values(report.anti_leakage).every(Boolean)).toBe(true);
    expect(Object.values(report.anti_feedback).every(Boolean)).toBe(true);
    expect(report.checks.leakage).toBe(true);
    expect(report.checks.feedback).toBe(true);
  });

  test("audits warnings, issues, no-adjustment, identity, immutability and determinism", () => {
    expect(Object.values(report.warning_issue_behavior).every(Boolean)).toBe(true);
    expect(Object.values(report.no_adjustment).every(Boolean)).toBe(true);
    expect(report.output_boundary.no_forbidden_output_fields).toBe(true);
    expect(Object.values(report.advisory_identity).every(Boolean)).toBe(true);
    expect(Object.values(report.immutability_determinism).every(Boolean)).toBe(true);
  });

  test("confirms isolation, no consumers, upstream health and paused runtime preview", () => {
    expect(report.isolation.runtime_consumers).toEqual([]);
    expect(report.isolation.unexpected_consumers).toEqual([]);
    expect(Object.values(report.isolation.safety).every((value) => value === false)).toBe(true);
    expect(report.upstream_health.action431).toBe("passed");
    expect(report.upstream_health.action432).toBe("passed");
    expect(report.upstream_health.action309_guard).toBe("passed");
    expect(report.upstream_health.golden_static_safety).toBe("passed");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.unrelated_work_classification).toBe("action_433_independent_confidence_calibration_advisory_adapter_verification_only");
  });

  test("records passed failed and unresolved counts consistently", () => {
    if (!report.checks.calibration_identity_and_hash) {
      expect(report.failed_conditions).toContain("calibration_identity_and_hash");
    }
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.failed_conditions_count).toBe(report.failed_conditions.length);
    expect(report.passed_conditions_count).toBeGreaterThan(20);
  });
});
