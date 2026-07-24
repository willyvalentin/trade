import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.md";
const verifierPath = "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs";

test.setTimeout(300000);

function runVerifier() {
  const output = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 120 * 1024 * 1024,
  });
  return JSON.parse(output);
}

test.describe("Action 450 projection advisory status hash-binding remediation approval gate", () => {
  test("adds documentation verifier and focused test only for the approval gate", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync("tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts")).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "Action 449 Blocked Decision",
      "Root-Cause Classification",
      "Advisory Semantic-Result Payload Definition",
      "Status-Specific Payload Shapes",
      "Canonicalization Policy",
      "Mismatch Behavior",
      "Validation Phase Placement",
      "Phase-11 Defense In Depth",
      "Retained-Hash Attack Matrix",
      "Swapped-Hash Attack Matrix",
      "Mandatory Post-Remediation Audit",
      "Deployment required: no",
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("approves the remediation gate and binds the Action 449 finding", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.root_cause_classification).toBe("projection_advisory_semantic_result_hash_does_not_bind_status");
    expect(report.action449).toMatchObject({
      verification_status: "passed",
      readiness_decision: "blocked",
      failed_conditions: ["advisory_result_hash_audit"],
    });
  });

  test("freezes the complete advisory semantic payload and status binding", () => {
    const report = runVerifier();

    expect(report.advisory_semantic_payload_policy.projection_specific_approximation_allowed).toBe(false);
    expect(report.advisory_semantic_payload_policy.advisory_status_hash_bound).toBe(true);
    expect(report.advisory_semantic_payload_policy.included_fields).toEqual([
      "status",
      "advisory_id",
      "recommendation_fingerprint",
      "recommendation_snapshot_hash",
      "original_confidence",
      "proposed_delta",
      "proposed_calibrated_confidence",
      "calibration_status",
      "calibration_id",
      "calibration_identity_hash",
      "calibration_result_hash",
      "warnings",
      "issues",
      "bounded_lineage",
      "advisory_eligible",
      "advisory_visible",
      "application_eligible",
      "non_authoritative",
      "applied",
      "bounded_reasons",
      "schema_version",
      "configuration_version",
    ]);
    expect(Object.keys(report.status_specific_shapes)).toContain("advisory_ready");
    expect(Object.keys(report.status_specific_shapes)).toContain("blocked_unsupported_status");
  });

  test("freezes canonicalization recomputation mismatch and precedence policies", () => {
    const report = runVerifier();

    expect(report.canonicalization_policy).toMatchObject({
      recursive_object_key_sorting: true,
      utf8: true,
      stable_null_omission_behavior: true,
      signed_zero_normalization: true,
      canonical_warning_issue_lineage_reason_ordering: true,
      runtime_state_allowed: false,
      timestamps_allowed: false,
      randomness_allowed: false,
    });
    expect(report.hash_recomputation_policy).toEqual({
      algorithm: "sha256",
      input: "canonical_advisory_semantic_result_payload",
      compare_to_supplied_advisory_result_hash: true,
      trust_hash_format_only: false,
      repair_or_replace_supplied_hash: false,
    });
    expect(report.mismatch_policy).toMatchObject({
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
    expect(report.validation_phase_policy.phase).toBe(10);
    expect(report.validation_phase_policy.outranks).toContain("phase_11_lineage");
    expect(report.validation_phase_policy.outranked_by).toEqual(["phases_1_to_9"]);
  });

  test("freezes attack matrices semantic reorder hash roles and phase-11 defense", () => {
    const report = runVerifier();

    for (const retainedAttack of [
      "advisory status",
      "advisory ID",
      "proposed calibrated confidence",
      "warning messageKey",
      "issue messageKey",
      "lineage fields",
      "application eligibility",
      "configuration version",
      "combined mutations",
    ]) {
      expect(report.retained_hash_attack_matrix).toContain(retainedAttack);
    }
    for (const swappedAttack of [
      "advisory result hash from another valid advisory",
      "advisory identity hash used as advisory result hash",
      "calibration result hash used as advisory result hash",
      "projection identity hash used as advisory result hash",
      "all-zero hash",
      "all-f hash",
    ]) {
      expect(report.swapped_hash_attack_matrix).toContain(swappedAttack);
    }
    expect(report.semantic_order_equivalence_policy.material_content_change_blocks).toBe(true);
    expect(Object.values(report.hash_role_separation).every(Boolean)).toBe(true);
    expect(report.phase_11_defense_in_depth).toEqual({
      retained_hash_lineage_mutation_blocks_at_phase_10: true,
      recomputed_hash_lineage_mutation_blocks_at_phase_11: true,
    });
  });

  test("preserves API unaffected outputs and future Action 451 boundary", () => {
    const report = runVerifier();

    expect(report.api_preservation).toEqual({
      module: "lib/confidence-calibration-recommendation-advisory-projection.ts",
      runtime_export: "buildConfidenceCalibrationRecommendationProjection",
      public_type_exports: [
        "ImmutableRecommendationProjectionEnvelope",
        "FrozenRecommendationProjectionConfiguration",
        "ConfidenceCalibrationRecommendationProjectionResult",
      ],
      public_hashing_helpers_allowed: false,
    });
    expect(Object.values(report.unaffected_output_preservation).every(Boolean)).toBe(true);
    expect(report.future_remediation_boundary).toMatchObject({
      fixtures_allowed: false,
      runners_allowed: false,
      manifests_allowed: false,
      shadow_allowed: false,
      consumers_allowed: false,
      runtime_allowed: false,
      deployment_allowed: false,
    });
    expect(report.future_remediation_boundary.approved_files).toContain("lib/confidence-calibration-recommendation-advisory-projection.ts");
    expect(report.mandatory_action452).toBe("action_452_independent_post_remediation_projection_verification");
  });

  test("confirms source integrity isolation safety deployment lock and paused runtime preview", () => {
    const report = runVerifier();

    expect(report.source_integrity.unchanged).toBe(true);
    expect(report.isolation.app_or_lib_consumers).toEqual([]);
    expect(report.isolation.runtime_or_deployment_files).toEqual([]);
    expect(report.isolation.forbidden_action450_artifacts).toEqual([]);
    expect(Object.values(report.safety).every((value) => value === false)).toBe(true);
    expect(report.deployment_status).toEqual({
      deployment_required: false,
      preview_deployment_authorized: false,
      production_deployment_authorized: false,
      runtime_preview_advancement_authorized: false,
    });
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.unrelated_work_classification).toBe("action_450_static_remediation_approval_gate_only");
    expect(report.recommended_next_action).toBe("action_451_projection_advisory_status_hash_binding_remediation");
  });
});
