import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.md";
const verifierPath = "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs";
const projectionPath = "lib/confidence-calibration-recommendation-advisory-projection.ts";

test.setTimeout(300000);

function runVerifier() {
  const output = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 120 * 1024 * 1024,
  });
  return JSON.parse(output);
}

test.describe("Action 449 independent projection verification", () => {
  test("adds only the static verification artifacts and documents the audit surface", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync("tests/e2e/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification.spec.ts")).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "source-integrity audit",
      "API/export audit",
      "validation-order audit",
      "multi-fault precedence audit",
      "advisory-status mapping audit",
      "confidence-agreement audit",
      "advisory identity audit",
      "advisory result-hash audit",
      "Recommendation/advisory lineage audit",
      "anti-leakage audit",
      "anti-feedback audit",
      "warning audit",
      "issue audit",
      "no-adjustment audit",
      "Recommendation-confidence non-mutation audit",
      "projection identity audit",
      "canonicalization audit",
      "immutability audit",
      "consumer inventory",
      "Deployment required: no",
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("keeps the Action 448 source API exact", () => {
    const source = readFileSync(projectionPath, "utf8");
    expect(source.match(/export function buildConfidenceCalibrationRecommendationProjection/g)).toHaveLength(1);
    expect(source.match(/export type /g)).toHaveLength(3);
    expect(source).toContain("export type ImmutableRecommendationProjectionEnvelope");
    expect(source).toContain("export type FrozenRecommendationProjectionConfiguration");
    expect(source).toContain("export type ConfidenceCalibrationRecommendationProjectionResult");
    expect(source).not.toContain("export const");
    expect(source).not.toContain("export class");
  });

  test("verifier completes with blocked readiness and stable protected hashes", () => {
    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("blocked");
    expect(report.failed_conditions_count).toBe(1);
    expect(report.failed_conditions).toEqual(["advisory_result_hash_audit"]);
    expect(report.unresolved_conditions).toEqual(["fixture_hash_freeze_package_future_work"]);
    expect(report.source_integrity.unchanged).toBe(true);
    expect(report.source_integrity.before[projectionPath]).toBe(report.source_integrity.after[projectionPath]);
  });

  test("audits validation precedence and every status mapping", () => {
    const report = runVerifier();
    expect(Object.values(report.validation_precedence).every(Boolean)).toBe(true);

    expect(report.status_mapping.advisory_ready.actual).toBe("projection_ready");
    expect(report.status_mapping.advisory_ready_with_warnings.actual).toBe("projection_ready_with_warnings");
    expect(report.status_mapping.advisory_no_adjustment.actual).toBe("projection_no_adjustment");
    expect(report.status_mapping.advisory_insufficient_evidence.actual).toBe("projection_insufficient_evidence");
    expect(report.status_mapping.blocked_invalid_input.actual).toBe("blocked_invalid_input");
    expect(report.status_mapping.blocked_confidence_mismatch.actual).toBe("blocked_confidence_mismatch");
    expect(report.status_mapping.blocked_invalid_lineage.actual).toBe("blocked_invalid_lineage");
    expect(report.status_mapping.blocked_future_leakage.actual).toBe("blocked_future_leakage");
    expect(report.status_mapping.blocked_calibration_result.actual).toBe("blocked_advisory_result");
    expect(report.status_mapping.blocked_unsupported_status.actual).toBe("blocked_unsupported_status");
    expect(Object.values(report.rejected_status_cases).every(Boolean)).toBe(true);
  });

  test("audits confidence binding, recommendation identity, snapshots and advisory hashes", () => {
    const report = runVerifier();
    expect(Object.values(report.confidence_agreement).every(Boolean)).toBe(true);
    expect(Object.values(report.recommendation_identity_and_lineage).every(Boolean)).toBe(true);
    expect(report.confidence_agreement.one_basis_point_mismatch).toBe(true);
    expect(report.confidence_agreement.tiny_decimal_mismatch).toBe(true);
    expect(report.advisory_identity_and_hash.changed_delta_retained_hash).toBe(true);
    expect(report.advisory_identity_and_hash.changed_status_retained_hash).toBe(false);
    expect(report.advisory_identity_and_hash.unrelated_valid_format_hash).toBe(true);
  });

  test("audits lineage, leakage, feedback, warnings, issues and no-adjustment", () => {
    const report = runVerifier();
    expect(Object.values(report.lineage).every(Boolean)).toBe(true);
    expect(Object.values(report.anti_leakage).every(Boolean)).toBe(true);
    expect(Object.values(report.anti_feedback).every(Boolean)).toBe(true);
    expect(report.warning_issue_no_adjustment.warning_count).toBe(1);
    expect(report.warning_issue_no_adjustment.issue_message_key).toBe("confidence_calibration_recommendation_projection.unsupported_advisory_status");
    expect(Object.values(report.warning_issue_no_adjustment.no_adjustment).every(Boolean)).toBe(true);
  });

  test("audits recommendation non-mutation, projection identity, canonicalization and determinism", () => {
    const report = runVerifier();
    expect(report.recommendation_non_mutation.before_equals_after).toBe(true);
    expect(report.projection_identity.matches).toBe(true);
    expect(report.projection_identity.projection_id).toContain("confidence_calibration_recommendation_projection_v1:");
    expect(report.projection_identity.projection_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(report.determinism.repeated_call).toBe(true);
    expect(report.determinism.interleaved_call).toBe(true);
    expect(report.determinism.reordered_input).toBe(true);
    expect(report.audit_sections.canonicalization_audit).toBe(true);
    expect(report.audit_sections.immutability_audit).toBe(true);
  });

  test("confirms isolation, no consumers, no side effects, no deployment and paused runtime preview", () => {
    const report = runVerifier();
    expect(report.isolation.app_or_lib_consumers).toEqual([]);
    expect(report.isolation.script_or_test_unapproved_consumers).toEqual([]);
    expect(report.isolation.deployment_files).toEqual([]);
    expect(Object.values(report.safety).every((value) => value === false)).toBe(true);
    expect(report.deployment_status.preview_deployment_authorized).toBe(false);
    expect(report.deployment_status.production_deployment_authorized).toBe(false);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.upstream_health.action447_status).toBe("passed");
    expect(report.upstream_health.action448_status).toBe("passed");
  });
});
