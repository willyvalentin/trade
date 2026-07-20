import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

type Action436Report = Readonly<{
  verification_status: string;
  readiness_decision: "ready" | "ready_with_conditions" | "blocked";
  readiness_vocabulary: readonly string[];
  checks: Record<string, boolean>;
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions_count: number;
  failed_conditions: readonly string[];
  unresolved_conditions: readonly string[];
  source_integrity: Record<string, Readonly<{ matches_expected: boolean; unchanged_during_action436: boolean }>>;
  api_export_audit: Record<string, boolean | readonly string[]>;
  independent_payload_hash_result: Record<string, boolean>;
  blocked_status_audit: Record<string, boolean>;
  malformed_swapped_hash_result: Record<string, boolean>;
  retained_hash_tampering_result: Record<string, boolean>;
  combined_tampering_result: Record<string, boolean>;
  semantic_order_equivalence_result: Record<string, boolean>;
  validation_precedence_result: Record<string, boolean>;
  hash_role_separation_result: Record<string, boolean>;
  unaffected_output_and_advisory_id_result: Record<string, boolean>;
  no_adjustment_result: Record<string, boolean>;
  issue_result: Record<string, boolean>;
  immutability_result: Record<string, boolean>;
  determinism_result: Record<string, boolean>;
  isolation_consumer_result: Readonly<{
    adapter_consumers: readonly string[];
    forbidden_artifacts: readonly string[];
    safety: Record<string, boolean>;
  }>;
  remaining_gap_inventory: readonly string[];
  fixture_hash_freeze_readiness: string;
  upstream_health: Record<string, string>;
  runtime_preview_status: string;
  unrelated_work_classification: string;
  recommended_next_action: string;
}>;

const docPath = "docs/action-436-independent-post-remediation-advisory-adapter-verification.md";
const verifierPath = "scripts/action-436-independent-post-remediation-advisory-adapter-verification-verify.mjs";
const testPath = "tests/e2e/action-436-independent-post-remediation-advisory-adapter-verification.spec.ts";

test.setTimeout(300000);

function runVerifier(): Action436Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 300000 })) as Action436Report;
}

test.describe.serial("Action 436 independent post-remediation advisory adapter verification", () => {
  let report: Action436Report;
  let doc: string;

  test.beforeAll(() => {
    report = runVerifier();
    doc = readFileSync(docPath, "utf8");
  });

  test("creates audit-only artifacts and returns a deterministic readiness decision", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);
    expect(doc).toContain("Action 436 - Independent Post-Remediation Advisory Adapter Verification");
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(["ready_with_conditions", "blocked"]).toContain(report.readiness_decision);
    expect([
      "action_437_confidence_calibration_advisory_adapter_post_audit_finding_approval_gate",
      "action_437_static_advisory_fixture_hash_freeze_approval_gate",
    ]).toContain(report.recommended_next_action);
  });

  test("preserves protected source integrity and exact API exports", () => {
    expect(Object.values(report.source_integrity).every((entry) => entry.matches_expected)).toBe(true);
    expect(Object.values(report.source_integrity).every((entry) => entry.unchanged_during_action436)).toBe(true);
    expect(report.api_export_audit.runtime_exports).toEqual(["buildConfidenceCalibrationAdvisory"]);
    expect(report.api_export_audit.public_type_exports).toEqual([
      "ImmutableRecommendationConfidenceEnvelope",
      "FrozenAdvisoryConsumptionConfiguration",
      "ConfidenceCalibrationAdvisoryResult",
    ]);
    expect(report.checks.api_export_surface).toBe(true);
  });

  test("independently reconstructs eligible result hashes and validates all blocked status mappings", () => {
    expect(Object.values(report.independent_payload_hash_result).every(Boolean)).toBe(true);
    expect(Object.values(report.blocked_status_audit).every(Boolean)).toBe(true);
    expect(report.checks.independent_payload_reconstruction).toBe(true);
    expect(report.checks.blocked_status_mapping).toBe(true);
  });

  test("audits malformed swapped and hash-role substitution variants", () => {
    for (const key of [
      "missing_result_hash",
      "malformed_hex_hash",
      "uppercase_hash",
      "short_hash",
      "long_hash",
      "swapped_hash_from_other_calibration",
      "identity_hash_used_as_result_hash",
      "advisory_hash_used_as_result_hash",
      "all_zero_valid_format_hash",
      "all_f_valid_format_hash",
    ]) {
      expect(report.malformed_swapped_hash_result[key], key).toBe(true);
    }
    expect(Object.values(report.hash_role_separation_result).every(Boolean)).toBe(true);
  });

  test("records retained-hash tampering audit outcome", () => {
    expect(report.retained_hash_tampering_result.status).toBe(true);
    expect(report.retained_hash_tampering_result.proposed_delta).toBe(true);
    expect(report.retained_hash_tampering_result.proposed_calibrated_confidence).toBe(true);
    if (report.checks.retained_hash_tampering_matrix) {
      expect(report.retained_hash_tampering_result.calibration_id).toBe(true);
      expect(report.retained_hash_tampering_result.warning_code).toBe(true);
      expect(report.retained_hash_tampering_result.warning_path).toBe(true);
      expect(report.retained_hash_tampering_result.pattern_discovery_sha256).toBe(true);
      expect(report.retained_hash_tampering_result.pattern_discovery_result_hash).toBe(true);
      expect(report.remaining_gap_inventory).toEqual([]);
    } else {
      expect([
        JSON.stringify([
          "calibration_id_retained_hash_tampering_not_blocked",
          "warning_code_retained_hash_tampering_not_blocked",
          "warning_path_retained_hash_tampering_not_blocked",
          "pattern_discovery_sha256_retained_hash_tampering_not_blocked",
          "pattern_discovery_result_hash_tampering_blocks_late_lineage_not_hash_mismatch",
        ]),
        JSON.stringify([
          "pattern_discovery_sha256_retained_hash_tampering_not_blocked",
          "pattern_discovery_result_hash_tampering_blocks_late_lineage_not_hash_mismatch",
        ]),
      ]).toContain(JSON.stringify(report.remaining_gap_inventory));
    }
  });

  test("audits combined tampering, semantic order equivalence and validation precedence", () => {
    expect(Object.values(report.combined_tampering_result).every(Boolean)).toBe(true);
    expect(Object.values(report.semantic_order_equivalence_result).every(Boolean)).toBe(true);
    expect(Object.values(report.validation_precedence_result).every(Boolean)).toBe(true);
  });

  test("preserves unaffected outputs no-adjustment issue contract immutability and determinism", () => {
    expect(Object.values(report.unaffected_output_and_advisory_id_result).every(Boolean)).toBe(true);
    expect(Object.values(report.no_adjustment_result).every(Boolean)).toBe(true);
    expect(Object.values(report.issue_result).every(Boolean)).toBe(true);
    expect(Object.values(report.immutability_result).every(Boolean)).toBe(true);
    expect(Object.values(report.determinism_result).every(Boolean)).toBe(true);
  });

  test("confirms isolation no consumers and paused runtime preview", () => {
    expect(report.isolation_consumer_result.adapter_consumers).toEqual(expect.arrayContaining([
      "scripts/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate-verify.mjs",
      "scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs",
      "tests/e2e/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.spec.ts",
      "tests/e2e/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.spec.ts",
    ]));
    expect(report.isolation_consumer_result.forbidden_artifacts).toEqual([]);
    expect(Object.values(report.isolation_consumer_result.safety).every((value) => value === false)).toBe(true);
    expect(report.upstream_health.action309).toBe("passed");
    expect(report.upstream_health.action434).toBe("passed");
    expect(report.upstream_health.action435).toBe("passed");
    expect(report.upstream_health.golden_static_safety).toBe("passed");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("records counts and classification consistently", () => {
    if (!report.checks.retained_hash_tampering_matrix) {
      expect(report.failed_conditions).toContain("retained_hash_tampering_matrix");
      expect(report.failed_conditions).toContain("no_remaining_gaps");
    }
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.failed_conditions_count).toBe(report.failed_conditions.length);
    expect(report.passed_conditions_count + report.failed_conditions_count).toBe(Object.keys(report.checks).length);
    expect(["blocked_until_findings_are_remediated", "ready_with_conditions"]).toContain(
      report.fixture_hash_freeze_readiness,
    );
    expect(report.unrelated_work_classification).toBe(
      "action_436_independent_post_remediation_advisory_adapter_verification_only",
    );
  });
});
