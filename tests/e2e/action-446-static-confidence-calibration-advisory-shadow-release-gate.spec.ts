import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { test, expect } from "@playwright/test";

const root = process.cwd();
const verifierPath = "scripts/action-446-static-confidence-calibration-advisory-shadow-release-gate-verify.mjs";

function runVerifier() {
  const output = execFileSync("node", [verifierPath], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 120 * 1024 * 1024,
  });
  return JSON.parse(output);
}

test.describe("Action 446 static confidence calibration advisory shadow release gate", () => {
  test("documentation, verifier, and focused test exist", () => {
    expect(existsSync(join(root, "docs/action-446-static-confidence-calibration-advisory-shadow-release-gate.md"))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    expect(existsSync(join(root, "tests/e2e/action-446-static-confidence-calibration-advisory-shadow-release-gate.spec.ts"))).toBe(true);
  });

  test("release classification, decision, and vocabulary are frozen", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.release_classification).toBe("confidence_calibration_advisory_pure_static_verified");
    expect(report.release_decision).toBe("released");
    expect(report.release_decision_vocabulary).toEqual(["released", "released_with_conditions", "blocked"]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
  });

  test("Action 445 readiness and Action 444 shadow remain healthy", () => {
    const report = runVerifier();

    expect(report.action445_readiness).toEqual({
      verification_status: "passed",
      readiness_decision: "ready",
      passed_conditions_count: 40,
      failed_conditions_count: 0,
      unresolved_conditions_count: 0,
    });
    expect(report.action444_shadow_result).toEqual({
      final_shadow_decision: "shadow_passed",
      scenario_count: 48,
      repeat_run_identical: true,
    });
  });

  test("protected hashes remain bound exactly", () => {
    const report = runVerifier();

    expect(report.protected_hashes).toMatchObject({
      advisory_adapter_sha256: "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
      action_441_scenario_summary_sha256: "78c349f52843451d99c405883c0d9571223616cf684928094aa0294424beec15",
      action_441_package_inventory_sha256: "e6fb6b6e189feab0cf4bc1f2494522f7f2d9aa7ae0a455080156ad740f5facb8",
      action_444_manifest_sha256: "cb75253f5ac6c1040ffcfd34bfd0dde1d1f8ba46113c3d58cdb50a4ac7bf68c6",
      action_444_package_sha256: "e66ca21b60c1f8b375e6197074f5afb0a6f1f8f59d03bf1fc1595e48be89623c",
    });
    expect(report.cleanup_and_source_integrity.source_and_package_immutable).toBe(true);
    expect(report.cleanup_and_source_integrity.before_hashes).toEqual(report.cleanup_and_source_integrity.after_hashes);
  });

  test("scenario inventory and distributions are exact", () => {
    const report = runVerifier();
    const ids = Array.from({ length: 48 }, (_, index) => `ca440_${String(index + 1).padStart(2, "0")}`);

    expect(report.scenario_inventory.scenario_count).toBe(48);
    expect(report.scenario_inventory.exact_scenario_order).toEqual(ids);
    expect(report.status_distribution).toEqual({
      advisory_ready: 6,
      advisory_ready_with_warnings: 2,
      advisory_no_adjustment: 1,
      advisory_insufficient_evidence: 1,
      blocked_invalid_input: 6,
      blocked_invalid_lineage: 12,
      blocked_future_leakage: 6,
      blocked_calibration_result: 10,
      blocked_unsupported_status: 1,
      blocked_confidence_mismatch: 3,
    });
    expect(report.hash_classification_distribution).toEqual({
      complete: 39,
      legacy: 1,
      invalid_or_retained: 8,
    });
  });

  test("semantic verification results are preserved", () => {
    const report = runVerifier();

    expect(report.complete_legacy_fallback_result).toEqual({
      valid_complete_hash_accepted: true,
      valid_legacy_hash_accepted: true,
      malformed_hash_blocked: true,
      swapped_hash_blocked: true,
      complete_hash_mismatch_blocked: true,
      legacy_bypass_blocked: true,
      retained_hash_tamper_blocked: true,
    });
    expect(report.confidence_binding_result).toEqual({
      exact_match_ready: true,
      mismatch_blocks: true,
      invalid_confidence_blocks: true,
    });
    expect(report.lineage_leakage_feedback_result).toEqual({
      recommendation_lineage_blocks: true,
      pattern_insight_lineage_blocks: true,
      anti_leakage_blocks: true,
      anti_feedback_blocks: true,
    });
    expect(report.no_adjustment_result).toMatchObject({
      id: "ca440_03",
      proposed_delta_basis_points: 0,
      proposed_calibrated_confidence_basis_points: 5000,
      application_eligible: false,
      applied: false,
    });
    expect(report.semantic_identity_result).toEqual({
      all_ready_scenarios_have_ids: true,
      all_scenarios_have_identity_and_result_hashes: true,
    });
  });

  test("released and unreleased capabilities are explicit", () => {
    const report = runVerifier();

    expect(report.released_capabilities).toContain("pure advisory transformation");
    expect(report.released_capabilities).toContain("bounded local shadow verification");
    expect(report.unreleased_capabilities).toContain("Recommendation Engine consumption");
    expect(report.unreleased_capabilities).toContain("confidence application");
    expect(report.unreleased_capabilities).toContain("runtime invocation");
    expect(report.unreleased_capabilities).toContain("production data use");
  });

  test("zero consumers and confidence remains unapplied", () => {
    const report = runVerifier();

    expect(report.consumer_inventory).toEqual({
      production_consumers: 0,
      recommendation_engine_consumers: 0,
      ui_consumers: 0,
      runtime_consumers: 0,
      advisory_consumers_outside_static_audits: [],
    });
    expect(report.confidence_semantics).toEqual({
      non_authoritative: true,
      applied: false,
      application_eligible: false,
      confidence_active: false,
    });
  });

  test("no evidence, runtime, persistence, replay, provider, Supabase, feedback, or mutation exists", () => {
    const report = runVerifier();

    expect(report.cleanup_and_source_integrity.temporary_evidence_deleted).toBe(true);
    expect(report.cleanup_and_source_integrity.temp_directory_absent_or_empty).toBe(true);
    expect(report.cleanup_and_source_integrity.tracked_evidence).toEqual([]);
    expect(report.isolation_result.forbidden_runtime_paths).toEqual([]);
    expect(report.isolation_result.safety).toMatchObject({
      provider_call_executed: false,
      provider_call_attempted: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      runtime_route_created: false,
      feedback_executed: false,
      recommendation_mutated: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      publication_changed: false,
      confidence_applied: false,
    });
  });

  test("Action 447 boundary and future sequence are frozen", () => {
    const report = runVerifier();

    expect(report.future_action_447_boundary).toEqual({
      next_permitted_action: "action_447_confidence_calibration_advisory_recommendation_engine_consumption_contract_approval_gate",
      contract_only: true,
      implementation_free: true,
      consumer_free: true,
      runtime_free: true,
      confidence_application_free: true,
      creates_consumer: false,
    });
    expect(report.future_integration_sequence).toEqual([
      "Action 447 - Recommendation-Engine Advisory Consumption Contract Gate",
      "Action 448 - Pure Recommendation Advisory Projection Adapter",
      "Action 449 - Independent Projection Adapter Verification",
      "Action 450 - Projection Fixture/Hash Approval",
      "Action 451 - Projection Hash Freeze",
      "Action 452 - Independent Projection Hash Audit",
      "Action 453 - Projection Shadow Approval",
      "Action 454 - Projection Shadow Execution",
      "Action 455 - Independent Projection Shadow Verification",
    ]);
    expect(report.recommended_next_action).toBe("action_447_confidence_calibration_advisory_recommendation_engine_consumption_contract_approval_gate");
  });

  test("runtime preview remains paused and documentation carries the release boundary", () => {
    const report = runVerifier();
    const doc = readFileSync(join(root, "docs/action-446-static-confidence-calibration-advisory-shadow-release-gate.md"), "utf8");

    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.unrelated_work_classification).toBe("action_446_static_confidence_calibration_advisory_shadow_release_gate_only");
    expect(doc).toContain("Action 446 does not modify or advance runtime preview");
    expect(doc).toContain("must not create the consumer");
  });
});

