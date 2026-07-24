import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { test, expect } from "@playwright/test";

const root = process.cwd();
const verifierPath = "scripts/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate-verify.mjs";

function runVerifier() {
  const output = execFileSync("node", [verifierPath], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 120 * 1024 * 1024,
  });
  return JSON.parse(output);
}

test.describe("Action 447 confidence calibration advisory Recommendation-Engine consumption contract approval gate", () => {
  test("documentation, verifier, and focused test exist", () => {
    expect(existsSync(join(root, "docs/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.md"))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    expect(existsSync(join(root, "tests/e2e/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.spec.ts"))).toBe(true);
  });

  test("verifier approves the contract and binds Action 446 release", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.action446_release).toEqual({
      release_decision: "released",
      release_classification: "confidence_calibration_advisory_pure_static_verified",
      passed_conditions_count: 34,
      failed_conditions_count: 0,
      unresolved_conditions_count: 0,
    });
  });

  test("projection definition remains pure and non-mutating", () => {
    const report = runVerifier();

    expect(report.projection_definition).toEqual({
      purpose: "future_pure_recommendation_facing_advisory_metadata_projection",
      mutates_recommendation: false,
      replaces_recommendation_confidence: false,
      projection_function: "buildConfidenceCalibrationRecommendationProjection",
    });
    expect(report.input_contracts).toEqual({
      recommendation: "immutable_recommendation_projection_envelope",
      advisory: "verified_confidence_calibration_advisory_result",
      configuration: "frozen_recommendation_projection_configuration",
    });
  });

  test("eligible blocked and projection statuses are exact", () => {
    const report = runVerifier();

    expect(report.eligible_advisory_statuses).toEqual([
      "advisory_ready",
      "advisory_ready_with_warnings",
      "advisory_no_adjustment",
    ]);
    expect(report.blocked_advisory_statuses).toEqual([
      "advisory_insufficient_evidence",
      "blocked_invalid_input",
      "blocked_confidence_mismatch",
      "blocked_invalid_lineage",
      "blocked_future_leakage",
      "blocked_calibration_result",
      "blocked_unsupported_status",
    ]);
    expect(report.projection_status_vocabulary).toEqual([
      "projection_ready",
      "projection_ready_with_warnings",
      "projection_no_adjustment",
      "projection_insufficient_evidence",
      "blocked_invalid_input",
      "blocked_confidence_mismatch",
      "blocked_invalid_lineage",
      "blocked_future_leakage",
      "blocked_advisory_result",
      "blocked_unsupported_status",
    ]);
  });

  test("confidence agreement and no-adjustment semantics are fail-closed", () => {
    const report = runVerifier();
    const doc = readFileSync(join(root, "docs/action-447-confidence-calibration-advisory-recommendation-engine-consumption-contract-approval-gate.md"), "utf8");

    expect(report.confidence_agreement).toEqual({
      comparison: "basis_points_exact_equality",
      mismatch_status: "blocked_confidence_mismatch",
      repair_allowed: false,
      confidence_application_allowed: false,
    });
    expect(doc).toContain("Projection status: `projection_no_adjustment`");
    expect(doc).toContain("Recommendation confidence unchanged: true");
    expect(doc).toContain("Do not fabricate an improvement or reduction");
  });

  test("validation order is exact", () => {
    const report = runVerifier();

    expect(report.validation_order).toEqual([
      "Top-level input shape",
      "Projection configuration",
      "Recommendation envelope shape",
      "Recommendation fingerprint",
      "Recommendation snapshot lineage",
      "Recommendation original confidence",
      "Advisory result shape",
      "Advisory status eligibility",
      "Recommendation/advisory confidence agreement",
      "Advisory identity/result hashes",
      "Recommendation/advisory lineage agreement",
      "Anti-leakage",
      "Anti-feedback",
      "Warning/issue compatibility",
      "Projection output construction",
    ]);
  });

  test("output boundaries prevent ranking scanner publication execution persistence runtime and feedback", () => {
    const report = runVerifier();

    expect(report.output_and_mutation_boundaries).toEqual({
      recommendation_confidence_unchanged: true,
      ranking_affected: false,
      scanner_affected: false,
      publication_affected: false,
      execution_affected: false,
      non_authoritative: true,
      applied: false,
      persistence_allowed: false,
      runtime_allowed: false,
      feedback_allowed: false,
    });
  });

  test("warning issue lineage anti-leakage and anti-feedback policies are present", () => {
    const report = runVerifier();

    expect(report.checks.warning_issue_contract_exact).toBe(true);
    expect(report.checks.lineage_policy_exact).toBe(true);
    expect(report.checks.anti_leakage_feedback_exact).toBe(true);
    expect(report.checks.identity_hash_policy_exact).toBe(true);
  });

  test("Action 448 boundary and mandatory Actions 448 through 456 are frozen", () => {
    const report = runVerifier();

    expect(report.action448_boundary).toEqual({
      projection_adapter_path: "lib/confidence-calibration-recommendation-advisory-projection.ts",
      implementation_free_in_action_447: true,
      action448_adapter_recognized_after_approval: true,
      consumer_allowed: false,
      runtime_allowed: false,
      confidence_application_allowed: false,
    });
    expect(report.future_sequence).toEqual([
      "Action 448 - Pure Recommendation Advisory Projection Implementation",
      "Action 449 - Independent Projection Verification",
      "Action 450 - Projection Fixture & Hash-Freeze Approval Gate",
      "Action 451 - Projection Fixture & Semantic Hash Freeze",
      "Action 452 - Independent Projection Hash-Freeze Verification",
      "Action 453 - Projection Shadow Execution Approval Gate",
      "Action 454 - Projection Shadow Execution",
      "Action 455 - Independent Projection Shadow Verification",
      "Action 456 - Projection Pure/Static Release Gate",
    ]);
  });

  test("deployment remains prohibited and runtime preview stays paused", () => {
    const report = runVerifier();

    expect(report.deployment_policy).toEqual({
      deployment_required: false,
      preview_deploy_authorized: false,
      production_deploy_authorized: false,
      runtime_preview_advancement_authorized: false,
      env_required: false,
      credentials_required: false,
    });
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("approved projection adapter exists without consumer runtime persistence replay provider Supabase feedback or confidence application", () => {
    const report = runVerifier();

    expect(report.safety_confirmation.projection_adapter_exists).toBe(true);
    expect(report.safety_confirmation.projection_mentions_in_runtime).toEqual([]);
    expect(report.safety_confirmation.advisory_consumers).toEqual([]);
    expect(report.safety_confirmation.runtime_or_consumer_paths).toEqual([]);
    expect(report.checks.action448_pure_projection_adapter_recognized).toBe(true);
    expect(report.safety_confirmation.action446_safety).toMatchObject({
      provider_call_executed: false,
      provider_call_attempted: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      runtime_route_created: false,
      feedback_executed: false,
      recommendation_mutated: false,
      confidence_applied: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      publication_changed: false,
    });
  });

  test("recommended next action is Action 448 implementation only", () => {
    const report = runVerifier();

    expect(report.recommended_next_action).toBe("action_448_confidence_calibration_recommendation_advisory_projection_implementation");
    expect(report.unrelated_work_classification).toBe("action_447_confidence_calibration_advisory_recommendation_engine_consumption_contract_approval_gate_only");
  });
});
