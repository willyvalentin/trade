import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath =
  "docs/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.md";
const verifierPath =
  "scripts/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate-verify.mjs";
const expectedReleaseClassification =
  "confidence_calibration_recommendation_advisory_projection_pure_static_verified";
const expectedNextAction =
  "action_461_confidence_calibration_recommendation_advisory_projection_runtime_preview_consumer_implementation_approval_implementation";

type Action460Report = {
  verification_status: string;
  approval_decision: string;
  approval_vocabulary: string[];
  release_classification: string;
  action459_release: Record<string, boolean | number | string>;
  runtime_preview_status: string;
  observation_only_objective: string;
  recommendation_engine_consumer_decision: Record<string, boolean | string>;
  ui_consumer_decision: Record<string, boolean | string>;
  permitted_projection_fields: string[];
  permitted_display_fields: string[];
  forbidden_fields: string[];
  successful_display_policy: Record<string, boolean | string[]>;
  blocked_display_policy: Record<string, boolean | string>;
  original_confidence_authority: Record<string, boolean | string>;
  effect_boundaries: Record<string, boolean>;
  persistence_policy: string;
  replay_policy: string;
  provider_supabase_policy: Record<string, boolean>;
  confidence_application_policy: string;
  feedback_policy: string;
  route_policy: Record<string, boolean>;
  feature_flag_policy: Record<string, boolean | string>;
  operator_input_inventory: string[];
  telemetry_policy: Record<string, boolean>;
  stale_mismatch_missing_policy: string;
  performance_policy: string;
  rollback_kill_switch_policy: string;
  future_implementation_sequence: string[];
  implementation_boundary: string[];
  source_integrity: Record<string, boolean | string | null>;
  isolation: {
    app_or_lib_consumers: string[];
    runtime_artifacts: string[];
    deployment_artifacts: string[];
    approved_action461_consumer_boundary: boolean;
    no_runtime_route_exists: boolean;
    no_deployment_artifact_changed: boolean;
  };
  safety: Record<string, boolean | string>;
  passed_conditions: string[];
  failed_conditions: string[];
  unresolved_conditions: string[];
  checks: Record<string, boolean>;
  deployment_status: string;
  runtime_preview_state_changed: boolean;
  recommended_next_action: string;
  unrelated_work_classification: string;
  contract_sha256: string;
};

test.setTimeout(300000);

let cachedReport: Action460Report | undefined;

function runVerifier() {
  if (!cachedReport) {
    const output = execFileSync("node", [verifierPath], {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    });
    cachedReport = JSON.parse(output) as Action460Report;
  }
  return cachedReport;
}

test.describe("Action 460 projection runtime preview integration contract approval gate", () => {
  test("documents the approval-gate contract", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);

    const doc = readFileSync(docPath, "utf8");
    for (const phrase of [
      "Purpose",
      "Action 459 Release Result",
      "Recommendation Engine Consumer Decision",
      "UI Consumer Decision",
      "Permitted Projection Fields",
      "Forbidden Fields",
      "Original-Confidence Authority Policy",
      "Runtime-Route Decision",
      "Feature-Flag Policy",
      "Operator-Input Inventory",
      "Mandatory Future Implementation Sequence",
      "Approval Decision",
      expectedReleaseClassification,
      "runtime_preview_waiting_for_operator_inputs",
    ]) {
      expect(doc).toContain(phrase);
    }
  });

  test("keeps Action 459 release and static classification intact", () => {
    const report = runVerifier();

    expect(report.verification_status).toBe("passed");
    expect(report.action459_release).toMatchObject({
      release_decision: "released",
      release_classification: expectedReleaseClassification,
      scenario_count: 52,
      exact_ids_match: true,
      action454_package_inventory_sha256: "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072",
      action454_repeat_payload_sha256: "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74",
      action457_manifest_sha256: "2bb41c00c2d0eb29811b7b95d9ee1495db4758dc2f998794f6aeddb2691c459a",
    });
    expect(report.release_classification).toBe(expectedReleaseClassification);
  });

  test("returns approved_with_conditions with exact vocabulary and unresolved operator inputs", () => {
    const report = runVerifier();

    expect(report.approval_decision).toBe("approved_with_conditions");
    expect(report.approval_vocabulary).toEqual(["approved", "approved_with_conditions", "blocked"]);
    expect(report.failed_conditions).toEqual([]);
    expect(report.unresolved_conditions).toContain("operator_inputs_remain_outstanding");
  });

  test("freezes observation-only Recommendation Engine and UI boundaries", () => {
    const report = runVerifier();

    expect(report.observation_only_objective).toBe("preview_observation_only_non_authoritative_metadata");
    expect(report.recommendation_engine_consumer_decision).toMatchObject({
      decision: "no_decision_consumer",
      direct_application_calls_allowed: false,
      recommendation_engine_output_changed: false,
    });
    expect(report.ui_consumer_decision).toMatchObject({
      decision: "one_read_only_preview_surface_with_conditions",
      broad_card_or_dashboard_integration_allowed: false,
    });
  });

  test("freezes permitted display data and forbidden full-data fields", () => {
    const report = runVerifier();

    expect(report.permitted_projection_fields).toEqual(
      expect.arrayContaining([
        "projection_status",
        "original_recommendation_confidence",
        "proposed_advisory_delta",
        "proposed_advisory_confidence",
        "recommendation_confidence_unchanged",
        "application_eligible",
        "effect_flags",
      ]),
    );
    expect(report.permitted_display_fields).toEqual(
      expect.arrayContaining(["Preview only", "Not applied", "Original Recommendation confidence remains active"]),
    );
    expect(report.forbidden_fields).toEqual(
      expect.arrayContaining([
        "full Recommendation envelope",
        "full advisory input",
        "Pattern Discovery output",
        "Pattern Insight",
        "evidence records",
        "outcome records",
        "secrets",
        "environment values",
      ]),
    );
  });

  test("freezes successful, blocked, and original-confidence display policies", () => {
    const report = runVerifier();

    expect(report.successful_display_policy).toMatchObject({
      preview_only: true,
      not_applied: true,
      original_confidence_remains_active: true,
    });
    expect(report.successful_display_policy.statuses).toEqual([
      "projection_ready",
      "projection_ready_with_warnings",
      "projection_no_adjustment",
    ]);
    expect(report.blocked_display_policy).toMatchObject({
      normal_preview_ui: "Calibration preview unavailable",
      proposed_confidence_displayed: false,
    });
    expect(report.original_confidence_authority).toMatchObject({
      authoritative: "original_recommendation_confidence",
      proposed_confidence_authoritative: false,
      sorting_filtering_application_allowed: false,
    });
  });

  test("freezes effect boundaries and prohibited persistence/replay/provider/Supabase/feedback paths", () => {
    const report = runVerifier();

    expect(report.effect_boundaries).toEqual({
      recommendation_confidence_unchanged: true,
      ranking_affected: false,
      scanner_affected: false,
      publication_affected: false,
      execution_affected: false,
      application_eligible: false,
      non_authoritative: true,
      applied: false,
    });
    expect(report.persistence_policy).toBe("prohibited");
    expect(report.replay_policy).toBe("prohibited");
    expect(report.provider_supabase_policy).toEqual({
      provider_request_allowed: false,
      market_data_request_allowed: false,
      news_request_allowed: false,
      supabase_read_allowed: false,
      supabase_write_allowed: false,
    });
    expect(report.confidence_application_policy).toBe("prohibited");
    expect(report.feedback_policy).toBe("prohibited");
  });

  test("requires no route, disabled preview flag defaults, operator inputs, and bounded telemetry", () => {
    const report = runVerifier();

    expect(report.route_policy).toMatchObject({
      runtime_route_approved: false,
      api_route_approved: false,
      separate_route_gate_required_if_unavoidable: true,
    });
    expect(report.feature_flag_policy).toMatchObject({
      future_flag_name: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
      implemented_now: false,
      default: "disabled",
      production: "disabled",
      missing: "disabled",
      malformed: "disabled",
      query_string_activation_allowed: false,
      local_storage_bypass_allowed: false,
    });
    expect(report.operator_input_inventory).toEqual(
      expect.arrayContaining([
        "approval to expose the preview section",
        "target preview environment",
        "authorized preview users or access boundary",
        "rollback owner",
        "kill-switch owner",
        "confirmation that no confidence application is authorized",
      ]),
    );
    expect(report.telemetry_policy).toMatchObject({
      bounded_aggregate_existing_sink_only: true,
      new_telemetry_infrastructure_allowed: false,
      full_inputs_allowed: false,
      user_identifiers_allowed: false,
    });
  });

  test("freezes fail-closed behavior, performance, rollback, and future sequence", () => {
    const report = runVerifier();

    expect(report.stale_mismatch_missing_policy).toBe("hide_preview_and_fail_closed");
    expect(report.performance_policy).toBe("synchronous_pure_in_process_projection_only");
    expect(report.rollback_kill_switch_policy).toBe("one_step_disable_no_migration_no_persisted_cleanup");
    expect(report.future_implementation_sequence).toEqual([
      "Action 461 - Runtime Preview Consumer Implementation Approval/Implementation",
      "Action 462 - Independent Runtime Preview Consumer Verification",
      "Action 463 - Preview Deployment Readiness Gate",
      "Action 464 - Operator Input Capture and Preview Activation Approval",
      "Action 465 - Preview Deployment and Observation",
      "Action 466 - Independent Preview Observation Verification",
      "Action 467 - Preview Release/Stop Decision",
    ]);
  });

  test("keeps implementation boundary narrow and recognizes the approved Action 461 consumer", () => {
    const report = runVerifier();

    expect(report.implementation_boundary).toEqual(
      expect.arrayContaining([
        "one dedicated preview projection adapter",
        "one read-only preview UI component",
        "one existing Recommendation detail integration point",
        "one feature-flag definition/read",
      ]),
    );
    expect(report.isolation).toMatchObject({
      app_or_lib_consumers: [],
      runtime_artifacts: [],
      deployment_artifacts: [],
      approved_action461_consumer_boundary: true,
      no_runtime_route_exists: true,
      no_deployment_artifact_changed: true,
    });
    expect(report.safety).toMatchObject({
      provider_call_executed: false,
      supabase_read_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      runtime_created: false,
      api_route_created: false,
      ui_consumer_created: true,
      recommendation_engine_consumer_created: false,
      feature_flag_implemented: true,
      feature_flag_enabled: false,
      telemetry_implemented: false,
      feedback_created: false,
      confidence_applied: false,
      recommendation_mutated: false,
      ranking_changed: false,
      scanner_changed: false,
      publication_changed: false,
      execution_changed: false,
      risk_changed: false,
      position_sizing_changed: false,
      authoritative_data_created: false,
      deployment_result: "none",
    });
  });

  test("keeps deployment separate, runtime preview waiting, and Action 461 next", () => {
    const report = runVerifier();

    expect(report.deployment_status).toBe("not_authorized_not_required");
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.runtime_preview_state_changed).toBe(false);
    expect(report.recommended_next_action).toBe(expectedNextAction);
    expect(report.unrelated_work_classification).toBe(
      "action_460_runtime_preview_integration_contract_approval_gate_only",
    );
    expect(report.contract_sha256).toMatch(/^[a-f0-9]{64}$/);
  });
});
