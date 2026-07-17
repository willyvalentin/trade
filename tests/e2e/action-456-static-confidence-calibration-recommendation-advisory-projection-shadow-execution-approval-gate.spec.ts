import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath =
  "docs/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate.md";
const verifierPath =
  "scripts/action-456-static-confidence-calibration-recommendation-advisory-projection-shadow-execution-approval-gate-verify.mjs";
const expectedPackageHash = "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072";
const expectedRepeatPayloadHash = "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74";

test.setTimeout(300000);

function runVerifier() {
  const output = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 80 * 1024 * 1024,
  });
  return JSON.parse(output);
}

test.describe("Action 456 static projection shadow execution approval gate", () => {
  test("documents the approval gate and deployment-free boundary", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "Action 455 Readiness",
      "Action 454 Inventory Binding",
      "Future Execution-Manifest Contract",
      "Future Runner Contract",
      "Metadata-Only Evidence Contract",
      "Symlink/Path-Safety Policy",
      "No-Deployment Requirement",
      "Approval Decision",
      "approved",
      "not_authorized_not_required",
      expectedPackageHash,
      expectedRepeatPayloadHash,
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("returns approved with exact Action 455 and Action 454 bindings", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.action455_readiness).toMatchObject({
      status: "ready",
      readiness_decision: "ready",
    });
    expect(report.action454_binding).toMatchObject({
      package_inventory_sha256: expectedPackageHash,
      repeat_payload_sha256: expectedRepeatPayloadHash,
    });
  });

  test("freezes protected hashes, exact scenario IDs, source class, and configuration", () => {
    const report = runVerifier();
    const protectedHashResults = Object.values(report.protected_hash_results) as Array<{ matched: boolean }>;

    expect(protectedHashResults.every((result) => result.matched)).toBe(true);
    expect(report.scenario_inventory.count).toBe(52);
    expect(report.scenario_inventory.exact_ids).toHaveLength(52);
    expect(report.scenario_inventory.exact_ids[0]).toBe("cp453_01");
    expect(report.scenario_inventory.exact_ids.at(-1)).toBe("cp453_52");
    expect(report.scenario_inventory.source_classifications).toEqual([
      "deterministic_test_local_projection_envelope_and_bounded_advisory_result",
    ]);
    expect(report.checks.projection_configuration_exact).toBe(true);
  });

  test("freezes projection status and advisory hash distributions", () => {
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
    expect(report.advisory_hash_distribution).toEqual({
      valid_advisory_hash: 42,
      malformed_hash: 1,
      swapped_hash: 1,
      unrelated_valid_format_hash: 1,
      retained_hash_tampering: 6,
      hash_role_substitution: 1,
    });
    expect(report.advisory_hash_membership.retained_hash_tampering).toEqual([
      "cp453_22",
      "cp453_23",
      "cp453_24",
      "cp453_25",
      "cp453_26",
      "cp453_27",
    ]);
    expect(report.checks.invalid_hash_attacks_block).toBe(true);
  });

  test("freezes confidence, effect flags, warnings, issues, lineage, leakage, and feedback", () => {
    const report = runVerifier();

    expect(report.confidence_outcomes).toEqual({
      exact_basis_point_equality: "projection_ready",
      one_basis_point_mismatch: "blocked_confidence_mismatch",
      signed_zero: "blocked_confidence_mismatch",
    });
    expect(report.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 4,
      metric_value_unavailable: 4,
    });
    expect(report.issue_distribution.blocked_feedback_reuse).toBe(6);
    expect(report.checks.effect_flags_exact).toBe(true);
    expect(report.checks.recommendation_envelopes_bounded).toBe(true);
    expect(report.checks.advisory_inputs_bounded).toBe(true);
  });

  test("freezes validation precedence and phase-11 defense", () => {
    const report = runVerifier();

    expect(Object.values(report.validation_precedence).every(Boolean)).toBe(true);
    expect(report.phase_11_defense).toEqual({
      tampered_lineage_retained_old_hash: "blocked_advisory_result",
      tampered_lineage_recomputed_matching_hash: "blocked_invalid_lineage",
    });
    expect(report.checks.validation_precedence_bound).toBe(true);
    expect(report.checks.phase_11_defense_bound).toBe(true);
  });

  test("freezes projection IDs, hashes, manifest contract, and runner contract", () => {
    const report = runVerifier();

    expect(report.checks.projection_ids_and_hashes_bound).toBe(true);
    expect(report.manifest_contract.approved_path).toBe(
      "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
    );
    expect(report.runner_contract.approved_path).toBe(
      "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
    );
    expect(report.runner_contract.execute_exactly_two_runs).toBe(true);
    expect(report.runner_contract.no_retries_or_third_run).toBe(true);
  });

  test("freezes metadata-only evidence, temp path, cleanup, and stop conditions", () => {
    const report = runVerifier();

    expect(report.checks.metadata_only_evidence_bound).toBe(true);
    expect(report.temp_path_policy.allowed_template).toBe(
      "<system-temp>/ture/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow/",
    );
    expect(report.temp_path_policy.unsafe_path_decision).toBe("shadow_aborted");
    expect(report.cleanup_policy.temporary_evidence_deleted).toBe(true);
    expect(report.checks.stop_conditions_bound).toBe(true);
    expect(report.shadow_decision_vocabulary).toEqual([
      "shadow_passed",
      "shadow_passed_with_conditions",
      "shadow_failed",
      "shadow_aborted",
    ]);
  });

  test("confirms Action 457 package is the exact approved static package and has no runtime shadow", () => {
    const report = runVerifier();

    expect(report.future_action457_boundary.runner_exists_now).toBe(true);
    expect(report.future_action457_boundary.manifest_exists_now).toBe(true);
    expect(report.future_action457_boundary.package_recognized).toBe(true);
    expect(report.future_action457_boundary.package_artifacts_present).toHaveLength(5);
    expect(report.future_action457_boundary.shadow_executed_now).toBe(false);
    expect(report.future_action457_boundary.forbidden_existing_artifacts).toEqual([]);
    expect(report.checks.action457_exact_package_recognized).toBe(true);
    expect(report.checks.no_unapproved_action457_artifacts).toBe(true);
    expect(report.checks.no_action457_runtime_shadow).toBe(true);
  });

  test("keeps runtime, consumers, persistence, replay, providers, Supabase, feedback, and deployment off", () => {
    const report = runVerifier();

    expect(report.isolation.projection_consumers).toEqual([]);
    expect(report.isolation.runtime_artifacts).toEqual([]);
    expect(report.safety).toMatchObject({
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
  });
});
