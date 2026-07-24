import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-452-independent-post-remediation-projection-verification.md";
const verifierPath = "scripts/action-452-independent-post-remediation-projection-verification-verify.mjs";
const testPath = "tests/e2e/action-452-independent-post-remediation-projection-verification.spec.ts";

test.setTimeout(300000);

function runVerifier() {
  const output = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 160 * 1024 * 1024,
  });
  return JSON.parse(output);
}

test.describe("Action 452 independent post-remediation projection verification", () => {
  test("adds the audit-only documentation, verifier, and focused test", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "Action 449 Finding",
      "Action 450 Approval",
      "Action 451 Remediation Summary",
      "Source-Integrity Audit",
      "API/Export Audit",
      "Complete Advisory Field-Inventory Audit",
      "Independent Semantic-Payload Reconstruction",
      "Independent SHA-256 Audit",
      "Retained-Hash Attack Audit",
      "Swapped-Hash Attack Audit",
      "Semantic-Order-Equivalence Audit",
      "Validation-Precedence Audit",
      "Phase-11 Defense-In-Depth Audit",
      "Recommendation Non-Mutation Audit",
      "Projection-Identity Audit",
      "Deployment required: no",
      "runtime_preview_waiting_for_operator_inputs",
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("passes source integrity, API surface, field inventory, and independent hash checks", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.failed_checks).toEqual([]);
    expect(Object.values(report.source_integrity.unchanged).every(Boolean)).toBe(true);
    expect(report.api_surface).toMatchObject({
      runtime_export: "buildConfidenceCalibrationRecommendationProjection",
      no_public_hashing_helper: true,
      synchronous_pure_function: true,
    });
    expect(report.api_surface.public_type_exports).toEqual([
      "ImmutableRecommendationProjectionEnvelope",
      "FrozenRecommendationProjectionConfiguration",
      "ConfidenceCalibrationRecommendationProjectionResult",
    ]);
    expect(report.complete_advisory_field_inventory.included_in_advisory_result_hash).toContain("status");
    expect(report.complete_advisory_field_inventory.included_in_advisory_result_hash).toContain("advisory_visible");
    expect(report.complete_advisory_field_inventory.included_in_advisory_result_hash).toContain("application_eligible");
    expect(report.complete_advisory_field_inventory.explicitly_non_semantic_and_excluded).toEqual(["advisory_id", "advisory_hash"]);
    expect(report.complete_advisory_field_inventory.unclassified_fields).toEqual([]);
    expect(report.independent_advisory_hash.matches).toBe(true);
    expect(report.independent_advisory_hash.advisory_id_bound_same_phase).toBe(true);
  });

  test("blocks malformed, swapped, retained, role-substitution, and combined tampering attacks", () => {
    const report = runVerifier();

    expect(Object.values(report.malformed_hash_audit).every((status) => status === "blocked_advisory_result")).toBe(true);
    expect(Object.values(report.swapped_hash_attacks).every((status) => status === "blocked_advisory_result")).toBe(true);
    expect(report.retained_hash_attacks.status).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.advisory_id).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.recommendation_fingerprint).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.recommendation_snapshot_hash).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.proposed_delta).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.proposed_calibrated_confidence).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.calibration_result_hash).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.warning_code).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.issue_code).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.lineage).toBe("blocked_advisory_result");
    expect(report.retained_hash_attacks.reasons).toBe("blocked_advisory_result");
    expect(Object.values(report.combined_tampering).every((status) => status === "blocked_advisory_result")).toBe(true);
    expect(report.hash_role_separation.roles_distinct).toBe(true);
  });

  test("preserves semantic ordering, validation precedence, and phase-11 defense in depth", () => {
    const report = runVerifier();

    expect(Object.values(report.semantic_order_equivalence).every(Boolean)).toBe(true);
    expect(Object.values(report.validation_precedence).every(Boolean)).toBe(true);
    expect(report.phase_11_defense_in_depth).toEqual({
      retained_hash_lineage_mutation_status: "blocked_advisory_result",
      rehashed_lineage_mutation_status: "blocked_invalid_lineage",
    });
  });

  test("preserves unaffected outputs, no-adjustment behavior, and the exact mismatch issue", () => {
    const report = runVerifier();

    expect(report.unaffected_outputs).toMatchObject({
      advisory_ready: "projection_ready",
      advisory_ready_with_warnings: "projection_ready_with_warnings",
      advisory_no_adjustment: "projection_no_adjustment",
      confidence_mismatch: "blocked_confidence_mismatch",
      invalid_recommendation_lineage: "blocked_invalid_lineage",
      invalid_advisory_lineage: "blocked_invalid_lineage",
      leakage_block: "blocked_future_leakage",
      feedback_block: "blocked_invalid_lineage",
      recommendation_confidence_unchanged: true,
      effect_flags_false: true,
    });
    expect(report.no_adjustment).toMatchObject({
      status: "projection_no_adjustment",
      delta_basis_points: 0,
      tampered_status: "blocked_advisory_result",
    });
    expect(report.no_adjustment.proposed_confidence_basis_points).toBe(report.no_adjustment.recommendation_original_confidence_basis_points);
    expect(report.mismatch_issue).toEqual({
      status: "blocked_advisory_result",
      code: "blocked_advisory_result",
      path: "/advisory/advisory_hash",
      severity: "error",
      messageKey: "confidence_calibration_recommendation_projection.blocked_advisory_result",
      raw_hashes_exposed: false,
    });
  });

  test("preserves Recommendation non-mutation, projection identity, immutability, determinism, and isolation", () => {
    const report = runVerifier();

    expect(Object.values(report.recommendation_non_mutation).every(Boolean)).toBe(true);
    expect(report.projection_identity.matches).toBe(true);
    expect(report.projection_identity.material_input_changes_affect_identity).toBe(true);
    expect(report.projection_identity.no_time_path_randomness_terms).toBe(true);
    expect(Object.values(report.immutability_and_determinism).every(Boolean)).toBe(true);
    expect(report.isolation.app_or_lib_consumers).toEqual([]);
    expect(report.isolation.unexpected_audit_consumers).toEqual([]);
    expect(report.isolation.forbidden_action452_artifacts).toEqual([]);
    expect(report.isolation.deployment_files).toEqual([]);
    expect(Object.values(report.safety).every((value) => value === false)).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.deployment_status).toBe("not_authorized_not_required");
  });

  test("keeps Actions 450 and 451 healthy and recommends the next narrow hash-freeze gate", () => {
    const report = runVerifier();

    expect(report.upstream_health).toMatchObject({
      action309_guard_status: "passed",
      action450_verification_status: "passed",
      action451_verification_status: "passed",
    });
    expect(report.unresolved_conditions).toEqual(["static_projection_fixtures_and_hash_freeze_future_work"]);
    expect(report.recommended_next_action).toBe("action_453_static_projection_fixture_hash_freeze_approval_gate");
    expect(report.unrelated_work_classification).toBe("action_452_independent_static_audit_only");
  });
});
