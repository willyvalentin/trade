import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath =
  "docs/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.md";
const verifierPath =
  "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs";
const testPath =
  "tests/e2e/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.spec.ts";

test.setTimeout(300000);

function runVerifier() {
  const output = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 80 * 1024 * 1024,
  });
  return JSON.parse(output);
}

test.describe("Action 453 static projection fixture/hash-freeze approval gate", () => {
  test("adds the approval-gate documentation, verifier, and focused test", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(existsSync(testPath)).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "Projection Fixture-Package Definition",
      "Exact Scenario Inventory",
      "Status Vocabulary and Distribution",
      "Validation Precedence",
      "Phase-11 Defense",
      "Action 454 Boundary",
      "Deployment required: no",
      "runtime_preview_waiting_for_operator_inputs",
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("freezes the approval decision, Action 452 readiness, and exact scenario inventory", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved_with_conditions");
    expect(report.failed_checks).toEqual([]);
    expect(report.scenario_count).toBe(52);
    expect(report.exact_scenario_ids[0]).toBe("cp453_01");
    expect(report.exact_scenario_ids.at(-1)).toBe("cp453_52");
    expect(report.exact_scenario_ids).toHaveLength(52);
    expect(report.unresolved_conditions).toEqual([
      "executable_semantic_projection_hashes_require_action_454",
      "projection_fixture_hash_inventory_requires_action_454",
    ]);
  });

  test("freezes status vocabulary, distribution, confidence, identity, hash, and lineage coverage", () => {
    const report = runVerifier();

    expect(report.status_vocabulary).toEqual([
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
    expect(report.status_distribution).toEqual({
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
    expect(report.coverage_family_inventory_complete).toBe(true);
    expect(report.confidence_hash_lineage_policies).toMatchObject({
      confidence_binding_frozen: true,
      advisory_hash_behavior_frozen: true,
      validation_precedence_frozen: true,
      phase_11_defense_frozen: true,
      lineage_policy_frozen: true,
    });
  });

  test("freezes input policies, warning/issue/no-adjustment handling, effect flags, and projection hashes", () => {
    const report = runVerifier();

    expect(report.input_source_policy).toMatchObject({
      deterministic_test_local_envelopes_only: true,
      deterministic_bounded_advisory_results_only: true,
      production_data_allowed: false,
      provider_allowed: false,
      supabase_allowed: false,
      runtime_outputs_allowed: false,
    });
    expect(report.recommendation_envelope_policy.mutable_recommendation_object_allowed).toBe(false);
    expect(report.advisory_input_policy.full_upstream_objects_allowed).toBe(false);
    expect(report.warning_issue_no_adjustment_policies).toMatchObject({
      warning_records_bounded: true,
      issue_records_bounded: true,
      no_adjustment_frozen: true,
    });
    expect(report.effect_flag_policy).toMatchObject({
      recommendation_confidence_unchanged: true,
      ranking_affected: false,
      scanner_affected: false,
      publication_affected: false,
      execution_affected: false,
      application_eligible: false,
      non_authoritative: true,
      applied: false,
    });
    expect(report.projection_identity_hash_policy.package_inventory_hash_policy_frozen).toBe(true);
  });

  test("keeps Action 454 bounded and blocks fixtures, runner, shadow, runtime, consumers, and deployment", () => {
    const report = runVerifier();

    expect(report.action_454_boundary).toEqual({
      fixture_hash_freeze_allowed_next: true,
      projection_shadow_runner_allowed: false,
      runtime_allowed: false,
      consumer_allowed: false,
      confidence_application_allowed: false,
      persistence_allowed: false,
      replay_allowed: false,
      deployment_allowed: false,
    });
    expect(report.isolation.forbidden_future_artifacts).toEqual([]);
    expect(report.isolation.forbidden_runtime_roots).toEqual([]);
    expect(report.isolation.app_or_lib_consumers).toEqual([]);
    expect(report.isolation.deployment_files).toEqual([]);
    expect(report.isolation.projection_execution_in_verifier).toBe(false);
    expect(report.isolation.projection_execution_in_test).toBe(false);
  });

  test("preserves source integrity and safety locks", () => {
    const report = runVerifier();

    expect(report.source_integrity.stable_during_verification).toBe(true);
    expect(report.source_integrity.protected_paths).toContain(
      "lib/confidence-calibration-recommendation-advisory-projection.ts",
    );
    expect(report.safety).toEqual({
      provider_call_executed: false,
      supabase_write_executed: false,
      replay_executed: false,
      synthetic_outcomes_persisted: false,
      runtime_route_added: false,
      confidence_applied: false,
      recommendation_mutated: false,
      ranking_changed: false,
      scanner_changed: false,
      deployment_authorized: false,
    });
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.deployment_status).toBe("not_authorized_not_required");
  });

  test("keeps Actions 451 and 452 available for separate health validation and names the next action", () => {
    const report = runVerifier();

    expect(existsSync("scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs")).toBe(true);
    expect(existsSync("scripts/action-452-independent-post-remediation-projection-verification-verify.mjs")).toBe(true);
    expect(report.recommended_next_action).toBe(
      "action_454_static_confidence_calibration_recommendation_advisory_projection_hash_freeze",
    );
    expect(report.unrelated_work_classification).toBe("action_453_static_approval_gate_only");
  });
});
