import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate.md";
const verifierPath =
  "scripts/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate-verify.mjs";
const action461VerifierPath =
  "scripts/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation-verify.mjs";
const action462VerifierPath =
  "scripts/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification-verify.mjs";

test.setTimeout(300000);

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function runVerifier(relativePath = verifierPath) {
  return JSON.parse(
    execFileSync("node", [relativePath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  );
}

test.describe("Action 463 preview deployment readiness gate", () => {
  test("documents and verifies the static deployment-readiness gate", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Purpose");
    expect(doc).toContain("## Exact Deployment Candidate Boundary");
    expect(doc).toContain("## Operator-Input Inventory");
    expect(doc).toContain("## Stop Conditions");
    expect(doc).toContain("## Deployment Status");

    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.deployment_status).toBe(
      "not_authorized_not_required_not_performed",
    );
    expect(report.runtime_preview_status).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(report.failed_conditions).toEqual([]);
  });

  test("preserves Action 462 readiness and the pure/static release classification", () => {
    const report = runVerifier();
    expect(report.checks.action459_healthy).toBe(true);
    expect(report.checks.action460_healthy).toBe(true);
    expect(report.checks.action461_healthy).toBe(true);
    expect(report.checks.action462_ready_with_conditions).toBe(true);
    expect(report.release_classification).toBe(
      "confidence_calibration_recommendation_advisory_projection_pure_static_verified",
    );
    expect(report.source_integrity.implementation_sources_unchanged).toBe(true);
  });

  test("freezes candidate file boundary and excludes unrelated files from approval", () => {
    const report = runVerifier();
    expect(report.deployment_candidate_boundary.candidate_implementation_files).toEqual([
      "lib/confidence-calibration-recommendation-advisory-projection.ts",
      "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
      "lib/confidence-calibration-recommendation-advisory-projection-preview.ts",
      "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx",
      "components/recommendations/RecommendationDetailsModal.tsx",
      "components/recommendations/RecommendationCardContainer.tsx",
    ]);
    expect(
      report.deployment_candidate_boundary.unrelated_runtime_or_post_trade_work_included,
    ).toBe(false);
    expect(report.checks.unrelated_post_trade_not_allowlisted).toBe(true);
    expect(report.working_tree_isolation.requirement).toBe(
      "clean_isolated_candidate_or_complete_independent_classification_required",
    );
    expect(report.unresolved_conditions).toContain(
      "unrelated_dirty_files_require_isolation_or_independent_approval",
    );
  });

  test("freezes operator inputs, non-production target, access, flag, and duration policies", () => {
    const report = runVerifier();
    expect(report.operator_inputs.complete).toBe(false);
    expect(report.operator_inputs.missing_inputs_block_activation).toBe(true);
    expect(report.operator_inputs.required).toContain("target preview environment");
    expect(report.operator_inputs.required).toContain(
      "authorized preview users or access mechanism",
    );
    expect(report.operator_inputs.required).toContain(
      "explicit deployment-readiness approval",
    );
    expect(report.target_environment_policy.first_activation_preview_only).toBe(true);
    expect(report.target_environment_policy.production_domain_excluded).toBe(true);
    expect(report.authorized_user_policy.unprotected_public_preview_approved).toBe(
      false,
    );
    expect(report.flag_activation_policy.flag_name).toBe(
      "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    );
    expect(report.flag_activation_policy.action463_sets_flag).toBe(false);
    expect(report.flag_activation_policy.production_enabled).toBe(false);
    expect(report.flag_activation_policy.current_environment_enabled).toBe(false);
    expect(report.preview_duration_policy.bounded_required).toBe(true);
    expect(report.preview_duration_policy.indefinite_activation_approved).toBe(
      false,
    );
  });

  test("freezes evidence, telemetry, validation, activation, rollback, and stop policies", () => {
    const report = runVerifier();
    expect(report.evidence_and_telemetry_policy).toMatchObject({
      bounded_manual_observation_allowed: true,
      telemetry_expansion_approved: false,
      persistent_projection_evidence_approved: false,
      raw_internal_data_retention_approved: false,
    });
    expect(report.validation_requirements).toContain("git diff --check");
    expect(report.validation_requirements).toContain("Actions 459-463 verifiers");
    expect(report.validation_requirements).toContain(
      "working tree or isolated candidate has no unclassified files",
    );
    expect(report.activation_checks).toContain(
      "deployment completed in approved preview environment",
    );
    expect(report.activation_checks).toContain(
      "activation approval has been explicitly issued",
    );
    expect(report.rollback_and_kill_switch).toMatchObject({
      flag_disable_hides_preview: true,
      no_migration_cleanup_required: true,
      code_rollback_secondary_fallback_only: true,
    });
    expect(report.stop_conditions).toContain(
      "original Recommendation confidence changes",
    );
    expect(report.stop_conditions).toContain(
      "confidence application occurs",
    );
  });

  test("keeps deployment, activation, routes, persistence, replay, provider, Supabase, feedback, and behavior effects disabled", () => {
    const report = runVerifier();
    expect(report.no_effect_results).toMatchObject({
      deployment_performed: false,
      flag_activated: false,
      environment_modified: false,
      route_created: false,
      persistence_created: false,
      replay_created: false,
      provider_access_created: false,
      supabase_access_created: false,
      feedback_created: false,
      telemetry_infrastructure_added: false,
      confidence_application_created: false,
      recommendation_mutation_created: false,
      ranking_changed: false,
      scanner_changed: false,
      publication_changed: false,
      execution_changed: false,
      add_trade_changed: false,
      risk_changed: false,
      position_sizing_changed: false,
    });
    expect(report.checks.no_routes_added_for_preview).toBe(true);
    expect(report.checks.projection_call_site_still_exact).toBe(true);
  });

  test("requires Action 464 and keeps runtime preview waiting", () => {
    const report = runVerifier();
    expect(report.readiness_vocabulary).toEqual([
      "ready",
      "ready_with_conditions",
      "blocked",
    ]);
    expect(report.next_permitted_action).toBe(
      "action_464_confidence_calibration_recommendation_advisory_projection_operator_input_capture_and_preview_activation_approval_gate",
    );
    expect(report.unresolved_conditions).toContain(
      "operator_inputs_remain_outstanding",
    );
    expect(report.unresolved_conditions).toContain(
      "working_tree_deployment_candidate_isolation_remains_outstanding",
    );

    const action461 = runVerifier(action461VerifierPath);
    const action462 = runVerifier(action462VerifierPath);
    expect(action461.runtime_preview_status).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(action462.runtime_preview_status).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
  });
});

