import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { test, expect } from "@playwright/test";

const root = process.cwd();

function runVerifier() {
  const output = execFileSync("node", [
    "scripts/action-445-independent-static-confidence-calibration-advisory-shadow-verification-verify.mjs",
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 80 * 1024 * 1024,
  });
  return JSON.parse(output);
}

test.describe("Action 445 independent static confidence calibration advisory shadow verification", () => {
  test("documentation, verifier and focused test exist", () => {
    expect(existsSync(join(root, "docs/action-445-independent-static-confidence-calibration-advisory-shadow-verification.md"))).toBe(true);
    expect(existsSync(join(root, "scripts/action-445-independent-static-confidence-calibration-advisory-shadow-verification-verify.mjs"))).toBe(true);
    expect(existsSync(join(root, "tests/e2e/action-445-independent-static-confidence-calibration-advisory-shadow-verification.spec.ts"))).toBe(true);
  });

  test("independent verifier passes with ready release-gate decision", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready");
    expect(report.readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.recommended_next_action).toBe("action_446_static_confidence_calibration_advisory_shadow_release_gate");
  });

  test("Action 441 and Action 444 hashes remain bound exactly", () => {
    const report = runVerifier();

    expect(report.manifest_and_inventory_integrity).toEqual({
      action_441_package_inventory_sha256: "e6fb6b6e189feab0cf4bc1f2494522f7f2d9aa7ae0a455080156ad740f5facb8",
      action_441_scenario_summary_sha256: "78c349f52843451d99c405883c0d9571223616cf684928094aa0294424beec15",
      action_444_manifest_sha256: "cb75253f5ac6c1040ffcfd34bfd0dde1d1f8ba46113c3d58cdb50a4ac7bf68c6",
    });
    expect(report.package_hashes).toEqual({
      manifest_hash: "cb75253f5ac6c1040ffcfd34bfd0dde1d1f8ba46113c3d58cdb50a4ac7bf68c6",
      run_1_package_hash: "e66ca21b60c1f8b375e6197074f5afb0a6f1f8f59d03bf1fc1595e48be89623c",
      run_2_package_hash: "e66ca21b60c1f8b375e6197074f5afb0a6f1f8f59d03bf1fc1595e48be89623c",
      repeat_run_identical: true,
    });
  });

  test("scenario inventory order and distributions are exact", () => {
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

  test("semantic behavior checks pass without retries or repairs", () => {
    const report = runVerifier();
    const runner = readFileSync(join(root, "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs"), "utf8");

    expect(report.action444_reproduction).toEqual({
      final_shadow_decision: "shadow_passed",
      scenario_count: 48,
      repeat_run_identical: true,
    });
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
    expect(runner).toContain("const first = buildShadowPackage();");
    expect(runner).toContain("const second = buildShadowPackage();");
    expect(runner).not.toContain("const third =");
    expect(runner).not.toContain("repair inputs");
  });

  test("warnings issues no-adjustment and advisory hashes remain deterministic", () => {
    const report = runVerifier();

    expect(report.warning_distribution).toEqual({
      none: 45,
      metric_value_unavailable: 3,
    });
    expect(report.issue_distribution).toEqual({
      none: 9,
      blocked_calibration_result: 14,
      blocked_confidence_mismatch: 3,
      invalid_calibration_result: 2,
      invalid_original_confidence: 4,
      invalid_recommendation_identity: 3,
      invalid_snapshot_lineage: 3,
      blocked_invalid_lineage: 1,
      blocked_future_leakage: 5,
      blocked_feedback_reuse: 4,
    });
    expect(report.no_adjustment_result).toEqual({
      id: "ca440_03",
      proposed_delta_basis_points: 0,
      proposed_calibrated_confidence_basis_points: 5000,
      application_eligible: false,
      applied: false,
    });
    expect(report.advisory_id_and_semantic_hash_result).toEqual({
      all_ready_scenarios_have_ids: true,
      all_scenarios_have_identity_and_result_hashes: true,
    });
  });

  test("metadata-only cleanup isolation and no-effect flags hold", () => {
    const report = runVerifier();

    expect(report.metadata_only_and_cleanup_result.metadata_only_result.evidence_metadata_only).toBe(true);
    expect(report.metadata_only_and_cleanup_result.temp_path_and_cleanup_result.temporary_evidence_deleted).toBe(true);
    expect(report.metadata_only_and_cleanup_result.temp_path_and_cleanup_result.temp_directory_absent_or_empty).toBe(true);
    expect(report.metadata_only_and_cleanup_result.temp_directory_absent_or_empty_now).toBe(true);
    expect(report.metadata_only_and_cleanup_result.tracked_evidence).toEqual([]);
    expect(report.isolation_result.advisory_consumers_outside_static_audits).toEqual([]);
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

  test("protected source and package hashes are immutable during verification", () => {
    const report = runVerifier();

    expect(report.source_and_package_integrity.source_and_package_immutable).toBe(true);
    expect(report.source_and_package_integrity.after_hashes["lib/confidence-calibration-advisory-adapter.ts"]).toBe("3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b");
    expect(report.source_and_package_integrity.before_hashes).toEqual(report.source_and_package_integrity.after_hashes);
  });

  test("runtime preview remains untouched and unrelated work is classified", () => {
    const report = runVerifier();

    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.unrelated_work_classification).toBe("action_445_independent_static_confidence_calibration_advisory_shadow_verification_only");
  });

  test("verifier check inventory covers semantic hashes temp-path safety and isolation", () => {
    const report = runVerifier();

    expect(report.checks).toMatchObject({
      scenario_summary_hash_exact: true,
      advisory_ids_and_hashes_exact: true,
      package_hashes_exact: true,
      exactly_two_runs: true,
      no_retry_or_repair: true,
      metadata_only_boundary: true,
      temp_path_safety_bound: true,
      cleanup_passed: true,
      no_tracked_evidence: true,
      source_and_package_immutable: true,
      no_unapproved_consumers: true,
      no_runtime_provider_supabase_replay_persistence_feedback: true,
      no_confidence_or_recommendation_mutation: true,
      no_authoritative_data: true,
    });
  });
});
