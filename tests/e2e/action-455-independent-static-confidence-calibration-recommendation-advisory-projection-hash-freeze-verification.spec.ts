import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath =
  "docs/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification.md";
const verifierPath =
  "scripts/action-455-independent-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verification-verify.mjs";
const inventoryPath =
  "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json";
const action453VerifierPath =
  "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs";
const action454VerifierPath =
  "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs";
const expectedPackageHash = "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072";
const expectedRepeatPayloadHash = "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74";

test.setTimeout(300000);

function runVerifier(path = verifierPath) {
  const output = execFileSync("node", [path], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 160 * 1024 * 1024,
  });
  return JSON.parse(output);
}

function readInventory() {
  return JSON.parse(readFileSync(inventoryPath, "utf8"));
}

test.describe("Action 455 independent static projection hash-freeze verification", () => {
  test("adds the documentation and verifier contract", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(inventoryPath)).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "Purpose",
      "Protected-Source Audit",
      "Inventory-Integrity Audit",
      "Advisory-Hash Classification Audit",
      "Phase-11 Defense-In-Depth Audit",
      "Bounded-Metadata Audit",
      "Readiness Decision",
      expectedPackageHash,
      expectedRepeatPayloadHash,
      "runtime_preview_waiting_for_operator_inputs",
      "not_authorized_not_required",
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("verifier returns ready with exact Action 454 reproduction hashes", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready");
    expect(report.readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.action454_reproduction_result).toMatchObject({
      freeze_status: "passed",
      scenario_count: 52,
      inventory_matches_freezer: true,
      repeat_run_count: 2,
      repeat_identical: true,
      package_inventory_sha256: expectedPackageHash,
      repeat_payload_sha256: expectedRepeatPayloadHash,
    });
  });

  test("verifies inventory integrity, exact 52 IDs/order, source classes, and configuration", () => {
    const report = runVerifier();
    const inventory = readInventory();

    expect(report.scenario_inventory_integrity.scenario_count).toBe(52);
    expect(report.scenario_inventory_integrity.exact_ids).toHaveLength(52);
    expect(report.scenario_inventory_integrity.exact_ids[0]).toBe("cp453_01");
    expect(report.scenario_inventory_integrity.exact_ids.at(-1)).toBe("cp453_52");
    expect(report.scenario_inventory_integrity.unique_ids).toBe(true);
    expect(report.scenario_inventory_integrity.source_classifications).toEqual([
      "deterministic_test_local_projection_envelope_and_bounded_advisory_result",
    ]);
    expect(inventory.projection_configuration).toMatchObject({
      projection_schema_version: "confidence_calibration_recommendation_projection_v1",
      configuration_version: "confidence_calibration_recommendation_projection_config_v1",
      confidence_scale_basis_points_per_point: 100,
    });
    expect(report.checks.recommendation_envelopes_bounded).toBe(true);
    expect(report.checks.advisory_inputs_bounded).toBe(true);
  });

  test("verifies projection status distribution and confidence agreement cases", () => {
    const report = runVerifier();

    expect(report.projection_status_distribution).toEqual({
      projection_ready: 4,
      projection_ready_with_warnings: 3,
      projection_no_adjustment: 1,
      projection_insufficient_evidence: 1,
      blocked_invalid_input: 11,
      blocked_confidence_mismatch: 3,
      blocked_invalid_lineage: 12,
      blocked_future_leakage: 5,
      blocked_advisory_result: 11,
      blocked_unsupported_status: 1,
    });
    expect(report.confidence_agreement_result).toMatchObject({
      exact_basis_point_equality: "projection_ready",
      one_basis_point_mismatch: "blocked_confidence_mismatch",
      decimal_mismatch: "blocked_confidence_mismatch",
      invalid_precision: "blocked_invalid_input",
      below_range: "blocked_invalid_input",
      above_range: "blocked_invalid_input",
      non_finite_nan: "blocked_invalid_input",
      non_finite_infinity: "blocked_invalid_input",
      signed_zero: "blocked_confidence_mismatch",
      no_repair_or_rounding: true,
    });
  });

  test("verifies advisory hash matrix, retained/swapped attacks, and role substitution", () => {
    const report = runVerifier();

    expect(report.advisory_hash_result.distribution).toEqual({
      valid_advisory_hash: 42,
      malformed_hash: 1,
      swapped_hash: 1,
      unrelated_valid_format_hash: 1,
      retained_hash_tampering: 6,
      hash_role_substitution: 1,
    });
    expect(report.advisory_hash_result.scenario_membership.malformed_hash).toEqual(["cp453_19"]);
    expect(report.advisory_hash_result.scenario_membership.swapped_hash).toEqual(["cp453_20"]);
    expect(report.advisory_hash_result.scenario_membership.unrelated_valid_format_hash).toEqual(["cp453_21"]);
    expect(report.advisory_hash_result.scenario_membership.retained_hash_tampering).toEqual([
      "cp453_22",
      "cp453_23",
      "cp453_24",
      "cp453_25",
      "cp453_26",
      "cp453_27",
    ]);
    expect(report.advisory_hash_result.scenario_membership.hash_role_substitution).toEqual(["cp453_28"]);
    expect(report.advisory_hash_result.invalid_hash_attacks_block).toBe(true);
  });

  test("verifies validation precedence, phase-11 defense, lineage, leakage, and feedback", () => {
    const report = runVerifier();

    expect(report.validation_precedence_result).toMatchObject({
      recommendation_faults_outrank_advisory_faults: true,
      unsupported_status_outranks_confidence_mismatch: true,
      confidence_mismatch_outranks_hash: true,
      advisory_hash_outranks_lineage: true,
      lineage_outranks_leakage: true,
      leakage_outranks_feedback: true,
      feedback_outranks_warning_issue_compatibility: true,
    });
    expect(report.phase_11_defense_result).toEqual({
      retained_old_hash: "blocked_advisory_result",
      recomputed_matching_hash: "blocked_invalid_lineage",
    });
    expect(report.lineage_leakage_feedback_result).toMatchObject({
      exact: true,
      recommendation_lineage_ids: ["cp453_29", "cp453_30", "cp453_31", "cp453_32", "cp453_33"],
      anti_leakage_ids: ["cp453_34", "cp453_35", "cp453_36", "cp453_37", "cp453_38"],
      anti_feedback_ids: ["cp453_39", "cp453_40", "cp453_41", "cp453_42", "cp453_43", "cp453_44"],
    });
  });

  test("verifies warnings, issues, no-adjustment, effect flags, and semantic ordering", () => {
    const report = runVerifier();

    expect(report.warning_issue_no_adjustment_effect_result.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 4,
      metric_value_unavailable: 4,
    });
    expect(report.warning_issue_no_adjustment_effect_result.issue_distribution.blocked_feedback_reuse).toBe(6);
    expect(report.warning_issue_no_adjustment_effect_result.warning_issue_records_complete).toBe(true);
    expect(report.warning_issue_no_adjustment_effect_result.no_adjustment).toMatchObject({
      status: "projection_no_adjustment",
      advisory_proposed_delta_basis_points: 0,
      advisory_proposed_confidence_basis_points: 5200,
      recommendation_original_confidence_basis_points: 5200,
    });
    expect(report.warning_issue_no_adjustment_effect_result.effect_flags_exact).toBe(true);
    expect(report.semantic_order_result).toMatchObject({
      semantic_ordering_scenario: "cp453_48",
      result: "stable",
    });
  });

  test("verifies projection IDs, identity/result/scenario hashes, canonicalization, and non-mutation", () => {
    const report = runVerifier();

    expect(report.projection_identity_hash_result).toMatchObject({
      successful_projection_count: 8,
      blocked_projection_count: 44,
      projection_hashes_exact: true,
      scenario_hashes_stable: true,
      independent_canonicalization_exact: true,
    });
    expect(report.checks.recommendation_non_mutation_audit).toBe(true);
    expect(report.action454_reproduction_result.repeat_payload_sha256).toBe(expectedRepeatPayloadHash);
  });

  test("verifies bounded metadata, source integrity, isolation, no effects, and paused runtime preview", () => {
    const report = runVerifier();

    expect(report.bounded_metadata_result).toBe("bounded_metadata_only");
    expect(report.source_integrity.unchanged).toBe(true);
    expect(report.isolation).toMatchObject({
      forbidden_shadow_artifacts: [],
      unexpected_audit_consumers: [],
      app_or_lib_consumers: [],
      deployment_files_changed: [],
      no_shadow_runner_manifest_or_evidence: true,
      no_consumers: true,
    });
    expect(report.safety).toEqual({
      provider_call_executed: false,
      provider_call_attempted: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      projection_shadow_executed: false,
      runtime_route_created: false,
      ui_consumer_created: false,
      recommendation_engine_consumer_created: false,
      confidence_applied: false,
      recommendation_mutated: false,
      ranking_changed: false,
      scanner_changed: false,
      publication_changed: false,
      execution_changed: false,
      feedback_executed: false,
      deployment_artifact_changed: false,
    });
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.deployment_status).toBe("not_authorized_not_required");
    expect(report.unrelated_work_classification).toBe("action_455_independent_static_hash_freeze_verification_only");
  });

  test("keeps Actions 453 and 454 healthy", () => {
    const action453 = runVerifier(action453VerifierPath);
    const action454 = runVerifier(action454VerifierPath);

    expect(action453.verification_status).toBe("passed");
    expect(action453.approval_decision).toBe("approved_with_conditions");
    expect(action454.verification_status).toBe("passed");
    expect(action454.hash_freeze_result).toBe("frozen");
  });
});
