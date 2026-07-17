import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { test, expect } from "@playwright/test";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}

function runVerifier() {
  const output = execFileSync("node", [
    "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  return JSON.parse(output);
}

test.describe("Action 444 static confidence calibration advisory shadow use", () => {
  test("documentation, manifest, runner, verifier and focused test exist", () => {
    expect(existsSync(join(root, "docs/action-444-static-confidence-calibration-advisory-shadow-use.md"))).toBe(true);
    expect(existsSync(join(root, "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json"))).toBe(true);
    expect(existsSync(join(root, "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs"))).toBe(true);
    expect(existsSync(join(root, "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs"))).toBe(true);
    expect(existsSync(join(root, "tests/e2e/action-444-static-confidence-calibration-advisory-shadow-use.spec.ts"))).toBe(true);
  });

  test("manifest freezes exact Action 441 hashes, 48 IDs and package boundary", () => {
    const manifest = readJson("docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json");
    const ids = Array.from({ length: 48 }, (_, index) => `ca440_${String(index + 1).padStart(2, "0")}`);

    expect(manifest.manifest_schema_version).toBe("action_444_static_confidence_calibration_advisory_shadow_input_manifest_v1");
    expect(manifest.action_443_approval_decision).toBe("approved");
    expect(manifest.action_441_package_inventory_sha256).toBe("e6fb6b6e189feab0cf4bc1f2494522f7f2d9aa7ae0a455080156ad740f5facb8");
    expect(manifest.action_441_scenario_summary_sha256).toBe("78c349f52843451d99c405883c0d9571223616cf684928094aa0294424beec15");
    expect(manifest.advisory_adapter_sha256).toBe("3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b");
    expect(manifest.scenario_count).toBe(48);
    expect(manifest.exact_ordered_scenario_ids).toEqual(ids);
    expect(manifest.scenarios.map((scenario: { id: string }) => scenario.id)).toEqual(ids);
  });

  test("status and hash-classification distributions are exact", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
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

  test("complete legacy fallback confidence lineage leakage and feedback checks pass", () => {
    const report = runVerifier();

    expect(Object.values(report.complete_legacy_fallback_result)).toEqual(Array(7).fill(true));
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
  });

  test("warnings issues no-adjustment advisory IDs and semantic hashes match", () => {
    const report = runVerifier();

    expect(report.warning_distribution).toEqual({
      none: 45,
      metric_value_unavailable: 3,
    });
    expect(report.issue_distribution.none).toBe(9);
    expect(report.issue_distribution.blocked_calibration_result).toBe(14);
    expect(report.no_adjustment_result).toEqual({
      id: "ca440_03",
      proposed_delta_basis_points: 0,
      proposed_calibrated_confidence_basis_points: 5000,
    });
    expect(report.advisory_id_and_semantic_hash_result).toEqual({
      all_ready_scenarios_have_ids: true,
      all_scenarios_have_identity_and_result_hashes: true,
    });
  });

  test("runner executes exactly twice and produces identical package hashes", () => {
    const report = runVerifier();
    const runner = readFileSync(join(root, "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs"), "utf8");

    expect(runner).toContain("const first = buildShadowPackage();");
    expect(runner).toContain("const second = buildShadowPackage();");
    expect(runner).not.toContain("const third =");
    expect(report.package_hashes.run_1_package_hash).toBe("e66ca21b60c1f8b375e6197074f5afb0a6f1f8f59d03bf1fc1595e48be89623c");
    expect(report.package_hashes.run_2_package_hash).toBe("e66ca21b60c1f8b375e6197074f5afb0a6f1f8f59d03bf1fc1595e48be89623c");
    expect(report.package_hashes.repeat_run_identical).toBe(true);
  });

  test("metadata evidence is bounded and cleanup leaves no tracked or temp evidence", () => {
    const report = runVerifier();

    expect(report.metadata_only_result).toEqual({
      evidence_metadata_only: true,
      full_recommendations_retained: false,
      full_calibration_results_retained: false,
      full_pattern_insights_retained: false,
      full_pattern_discovery_outputs_retained: false,
      contexts_or_outcomes_retained: false,
      provider_or_supabase_payloads_retained: false,
      secrets_or_env_values_retained: false,
      timestamps_or_random_ids_retained: false,
      machine_paths_retained: false,
    });
    expect(report.temp_path_and_cleanup_result.temporary_evidence_deleted).toBe(true);
    expect(report.temp_path_and_cleanup_result.temp_directory_absent_or_empty).toBe(true);
    expect(report.consumer_inventory.tracked_evidence).toEqual([]);
  });

  test("no runtime persistence replay provider Supabase feedback consumer or confidence application exists", () => {
    const report = runVerifier();

    expect(report.consumer_inventory.advisory_consumers_outside_static_audits).toEqual([]);
    expect(report.consumer_inventory.forbidden_runtime_paths).toEqual([]);
    expect(report.safety).toMatchObject({
      provider_call_executed: false,
      provider_call_attempted: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      runtime_route_created: false,
      external_access_executed: false,
      feedback_executed: false,
      consumer_created: false,
      confidence_applied: false,
      recommendation_mutated: false,
      authoritative_data_created: false,
    });
  });

  test("final shadow decision is passed and Action 445 remains mandatory", () => {
    const report = runVerifier();

    expect(report.final_shadow_decision).toBe("shadow_passed");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.unrelated_work_classification).toBe("action_444_static_confidence_calibration_advisory_shadow_execution_only");
    expect(report.recommended_next_action).toBe("action_445_independent_static_confidence_calibration_advisory_shadow_verification");
  });
});
