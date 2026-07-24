import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate.md";
const verifierPath =
  "scripts/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate-verify.mjs";
const action462VerifierPath =
  "scripts/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification-verify.mjs";
const action463VerifierPath =
  "scripts/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate-verify.mjs";

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

test.describe("Action 464 operator input capture and preview activation approval gate", () => {
  test("documents and verifies the static operator-input gate", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Operator-Input Schema");
    expect(doc).toContain("## Missing-Input Behavior");
    expect(doc).toContain("## Approval Decision");
    expect(doc).toContain("## Runtime-Preview State");

    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.activation_decision).toBe("activation_approved_with_conditions");
    expect(report.runtime_preview_status).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(report.failed_conditions).toEqual([]);
  });

  test("preserves Action 462 and 463 decisions and release classification", () => {
    const report = runVerifier();
    const action462 = runVerifier(action462VerifierPath);
    const action463 = runVerifier(action463VerifierPath);

    expect(action462.verification_status).toBe("passed");
    expect(action463.verification_status).toBe("passed");
    expect(report.checks.action462_healthy).toBe(true);
    expect(report.checks.action463_ready_with_conditions).toBe(true);
    expect(report.release_classification).toBe(
      "confidence_calibration_recommendation_advisory_projection_pure_static_verified",
    );
    expect(report.source_integrity.implementation_sources_unchanged).toBe(true);
  });

  test("freezes exact input schema and keeps missing inputs unresolved without invented values", () => {
    const report = runVerifier();
    expect(report.operator_input_schema).toMatchObject({
      target_preview_environment: "string",
      authorized_preview_users: "string[] | null",
      maximum_preview_duration_minutes: "positive_integer_max_480",
      preview_flag_value: ["true"],
      development_diagnostics_enabled: [false],
      evidence_retention: ["none", "bounded_manual_summary"],
      telemetry_policy: ["none", "existing_aggregate_only"],
    });
    expect(report.supplied_operator_inputs).toEqual({});
    expect(report.unresolved_operator_inputs).toContain(
      "target_preview_environment",
    );
    expect(report.unresolved_operator_inputs).toContain(
      "deployment_candidate_inventory_hash",
    );
    expect(report.checks.no_invented_operator_values).toBe(true);
  });

  test("requires non-production environment and rejects production or ambiguous access", () => {
    const report = runVerifier();
    expect(report.target_environment_result).toMatchObject({
      supplied: false,
      classification_required: "non_production_preview",
      production_environment_rejected: true,
      localhost_as_deployed_preview_rejected: true,
    });
    expect(report.validation_examples.non_production_preview.accepted).toBe(true);
    expect(report.validation_examples.production_environment_rejected.accepted).toBe(
      false,
    );
    expect(report.authorized_user_access_result).toMatchObject({
      supplied: false,
      bounded_access_required: true,
      uncontrolled_public_access_rejected: true,
    });
    expect(report.validation_examples.bounded_authorized_access.accepted).toBe(
      true,
    );
    expect(
      report.validation_examples.uncontrolled_public_access_rejected.accepted,
    ).toBe(false);
  });

  test("requires bounded duration, exact flag value, diagnostics decision, bounded evidence, and telemetry policy", () => {
    const report = runVerifier();
    expect(report.preview_duration_result).toMatchObject({
      supplied: false,
      bounded_required: true,
      maximum_first_preview_minutes: 480,
      value_invented: false,
    });
    expect(report.validation_examples.bounded_duration.accepted).toBe(true);
    expect(report.validation_examples.invalid_duration_rejected.accepted).toBe(
      false,
    );
    expect(report.flag_and_diagnostics_result).toMatchObject({
      flag_name: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
      activation_value: "true",
      action464_sets_flag: false,
      current_environment_enabled: false,
      production_enabled: false,
      development_diagnostics_recommended: false,
      development_diagnostics_supplied: false,
    });
    expect(report.evidence_and_telemetry_result).toMatchObject({
      evidence_retention_supplied: false,
      telemetry_policy_supplied: false,
      telemetry_expansion_approved: false,
    });
  });

  test("requires zero-tolerance thresholds, explicit unavailable threshold, owners, and authority confirmations", () => {
    const report = runVerifier();
    expect(report.failure_threshold_result.supplied).toBe(false);
    expect(report.failure_threshold_result.mandatory_zero_tolerance).toMatchObject({
      recommendation_render_failures: 0,
      confidence_application_events: 0,
      unauthorized_access_events: 0,
      raw_data_exposure_events: 0,
      kill_switch_failures: 0,
    });
    expect(
      report.failure_threshold_result.preview_unavailable_events_allowed_supplied,
    ).toBe(false);
    expect(report.owner_result).toMatchObject({
      rollback_owner_supplied: false,
      kill_switch_owner_supplied: false,
      deployment_operator_supplied: false,
      observation_owner_supplied: false,
    });
    expect(report.authority_confirmations).toMatchObject({
      original_confidence_remains_authoritative_supplied: false,
      required_original_confidence_remains_authoritative: true,
      confidence_application_authorized_supplied: false,
      required_confidence_application_authorized: false,
      production_activation_authorized_supplied: false,
      required_production_activation_authorized: false,
    });
    expect(
      report.validation_examples.confidence_application_rejected.accepted,
    ).toBe(false);
    expect(report.validation_examples.production_activation_rejected.accepted).toBe(
      false,
    );
  });

  test("keeps candidate isolation unresolved with exact unclassified counts and no invented inventory hash", () => {
    const report = runVerifier();
    expect(report.deployment_candidate_isolation).toMatchObject({
      isolated: false,
      file_by_file_approval_complete: false,
      unclassified_changed_file_count: 318,
      unclassified_post_trade_file_count: 40,
    });
    expect(report.candidate_inventory_hash).toBeNull();
    expect(report.checks.current_unclassified_file_counts).toBe(true);
    expect(report.unresolved_conditions).toContain(
      "candidate_inventory_hash_absent",
    );
    expect(report.unresolved_conditions).toContain(
      "unclassified_post_trade_files_require_isolation_or_approval",
    );
  });

  test("keeps deployment, activation, environment modification, routes, persistence, replay, provider, Supabase, feedback, and behavior effects disabled", () => {
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
    expect(report.checks.no_environment_modification).toBe(true);
    expect(report.checks.no_routes_added_for_preview).toBe(true);
    expect(report.checks.projection_call_site_still_exact).toBe(true);
  });

  test("requires Action 465 input completion and keeps runtime preview waiting", () => {
    const report = runVerifier();
    expect(report.readiness_vocabulary).toEqual([
      "ready",
      "ready_with_conditions",
      "blocked",
    ]);
    expect(report.activation_vocabulary).toEqual([
      "activation_approved_for_future_action",
      "activation_approved_with_conditions",
      "activation_not_approved",
    ]);
    expect(report.next_permitted_action).toBe(
      "action_465_preview_candidate_isolation_and_operator_input_completion",
    );
    expect(report.deployment_status).toBe(
      "not_authorized_not_required_not_performed",
    );
    expect(report.runtime_preview_status).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
  });
});
