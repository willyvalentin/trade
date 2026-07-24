import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-451-projection-advisory-status-hash-binding-remediation.md";
const verifierPath = "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs";
const testPath = "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts";

test.setTimeout(300000);

function runVerifier() {
  const output = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 120 * 1024 * 1024,
  });
  return JSON.parse(output);
}

test.describe("Action 451 projection advisory status hash-binding remediation", () => {
  test("adds only remediation documentation, verifier, and focused test artifacts", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "Action 449 finding",
      "Action 450",
      "Root Cause",
      "Advisory Result-Field Inventory",
      "Status-specific shapes",
      "Canonicalization",
      "Hash Recalculation",
      "Mismatch Behavior",
      "Validation Phase Placement",
      "Attack Matrix",
      "Phase-11 Defense In Depth",
      "Hash-Role Separation",
      "Public API Preservation",
      "Behavior Preservation",
      "Deployment required: no",
      "action_452_independent_post_remediation_projection_verification",
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("remediates advisory status binding and preserves complete payload hashing", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.remediation_result).toBe("projection_advisory_status_hash_binding_remediated");
    expect(report.readiness_decision).toBe("ready_for_action_452_independent_audit");
    expect(report.failed_checks).toEqual([]);
    expect(report.advisory_status_binding).toMatchObject({
      included_in_hash_payload: true,
      changed_status_retained_hash_status: "blocked_advisory_result",
    });
    expect(report.complete_advisory_payload_fields).toEqual([
      "status",
      "recommendation_fingerprint",
      "recommendation_snapshot_hash",
      "original_confidence_basis_points",
      "proposed_delta_basis_points",
      "proposed_confidence_basis_points",
      "calibration_status",
      "calibration_id",
      "calibration_identity_hash",
      "calibration_result_hash",
      "warnings",
      "issues",
      "lineage_hashes",
      "advisory_eligible",
      "advisory_visible",
      "application_eligible",
      "reasons",
      "non_authoritative",
      "applied",
      "adapter_schema_version",
      "configuration_version",
    ]);
  });

  test("blocks retained and swapped advisory result-hash attacks", () => {
    const report = runVerifier();

    expect(report.retained_hash_attacks.advisory_status).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.advisory_id).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.proposed_delta).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.proposed_calibrated_confidence).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.warning).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.issue).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.lineage).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.reasons).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.combined).toBe("blocked_advisory_result");

    expect(Object.values(report.swapped_hash_attacks).every((status) => status === "blocked_advisory_result")).toBe(true);
    expect(report.swapped_hash_attacks.all_zero_hash).toBe("blocked_advisory_result");
    expect(report.swapped_hash_attacks.all_f_hash).toBe("blocked_advisory_result");
    expect(report.swapped_hash_attacks.malformed_hash).toBe("blocked_advisory_result");
  });

  test("keeps mismatch behavior in phase 10 and phase 11 as defense in depth", () => {
    const report = runVerifier();

    expect(report.mismatch_behavior).toMatchObject({
      status: "blocked_advisory_result",
      issue_code: "blocked_advisory_result",
      issue_path: "/advisory/advisory_hash",
      issue_severity: "error",
      raw_hashes_exposed: false,
      recommendation_confidence_unchanged: true,
      application_eligible: false,
      ranking_affected: false,
      scanner_affected: false,
      publication_affected: false,
      execution_affected: false,
      non_authoritative: true,
      applied: false,
    });
    expect(report.validation_precedence).toEqual({
      phase_10_outranks_phase_11_lineage: true,
      phase_11_defense_remains: true,
      phases_1_to_9_outrank_phase_10: true,
    });
  });

  test("preserves valid outputs, semantic reorder equivalence, no-adjustment, API, and determinism", () => {
    const report = runVerifier();

    expect(report.valid_outputs).toMatchObject({
      advisory_ready: "projection_ready",
      advisory_ready_with_warnings: "projection_ready_with_warnings",
      advisory_no_adjustment: "projection_no_adjustment",
      projection_id_stable: true,
      no_adjustment_unchanged: true,
    });
    expect(report.semantic_order_equivalence).toEqual({
      warning_reorder_accepted: true,
      result_hash_stable: true,
      projection_hash_stable: true,
    });
    expect(report.api_surface).toMatchObject({
      runtime_export: "buildConfidenceCalibrationRecommendationProjection",
      no_public_helpers: true,
    });
    expect(report.immutability_and_determinism).toEqual({
      recommendation_non_mutation: true,
      output_deep_frozen: true,
      repeated_determinism: true,
      interleaved_determinism: true,
    });
  });

  test("keeps safety locks, no consumers, no runtime, no persistence, no deployment", () => {
    const report = runVerifier();

    expect(report.isolation.forbidden_action_451_artifacts).toEqual([]);
    expect(report.isolation.app_or_lib_consumers).toEqual([]);
    expect(report.isolation.deployment_files).toEqual([]);
    expect(report.isolation.no_runtime).toBe(true);
    expect(Object.values(report.safety).every((value) => value === false)).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.recommended_next_action).toBe("action_452_independent_post_remediation_projection_verification");
  });
});
