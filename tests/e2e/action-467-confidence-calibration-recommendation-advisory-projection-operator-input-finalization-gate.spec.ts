import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-467-confidence-calibration-recommendation-advisory-projection-operator-input-finalization-gate.md";
const decisionPath =
  "docs/action-467-confidence-calibration-recommendation-advisory-projection-preview-final-operator-decision-record.json";
const action466MaterializationPath =
  "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization.json";
const verifierPath =
  "scripts/action-467-confidence-calibration-recommendation-advisory-projection-operator-input-finalization-gate-verify.mjs";

const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";

test.setTimeout(300000);

type DecisionRecord = {
  schema_version: string;
  candidate_inventory_hash: string;
  candidate_file_count: number;
  candidate_decision: string;
  target_preview_environment: string | null;
  environment_classification: string | null;
  preview_environment_identifier: string | null;
  authorized_preview_users: string[] | null;
  access_control_mechanism: string | null;
  preview_start_condition: string | null;
  preview_expiry_condition: string | null;
  maximum_preview_duration_minutes: number | null;
  preview_flag_name: string;
  preview_flag_value: string | null;
  development_diagnostics_enabled: boolean | null;
  evidence_retention: string | null;
  telemetry_policy: string | null;
  acceptable_failure_threshold: Record<string, number | null>;
  rollback_owner: string | null;
  kill_switch_owner: string | null;
  deployment_operator: string | null;
  observation_owner: string | null;
  original_confidence_remains_authoritative: boolean | null;
  confidence_application_authorized: boolean | null;
  preview_may_affect_downstream_behavior: boolean | null;
  production_activation_authorized: boolean | null;
  persistent_projection_evidence_authorized: boolean | null;
  deployment_readiness_explicitly_approved: boolean | null;
  preview_activation_explicitly_approved: boolean | null;
  supplied_field_names: string[];
  unresolved_field_names: string[];
  invalid_field_names: string[];
  operator_input_decision: string;
  deployment_gate_readiness: string;
  activation_decision: string;
  next_permitted_action: string;
  deployment_performed: boolean;
  preview_activated: boolean;
  runtime_preview_state: string;
};

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function runVerifier() {
  return JSON.parse(
    execFileSync("node", [verifierPath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  );
}

test.describe("Action 467 operator input finalization gate", () => {
  test("documents and verifies the static operator-input finalization gate", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, decisionPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Action 466 Candidate Proof");
    expect(doc).toContain("## Historical-Verifier Policy");
    expect(doc).toContain("## Runtime-Preview State");

    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.failed_conditions).toEqual([]);
  });

  test("binds the Action 466 candidate proof and preserves candidate_ready", () => {
    const materialization = readJson<Record<string, unknown>>(
      action466MaterializationPath,
    );
    const decision = readJson<DecisionRecord>(decisionPath);
    const report = runVerifier();

    expect(materialization.action_465_candidate_inventory_hash).toBe(
      candidateHash,
    );
    expect(materialization.materialized_candidate_inventory_hash).toBe(
      candidateHash,
    );
    expect(materialization.candidate_file_count).toBe(30);
    expect(materialization.temporary_candidate_cleanup_result).toBe(
      "temporary_candidate_removed",
    );
    expect(decision.candidate_inventory_hash).toBe(candidateHash);
    expect(decision.candidate_file_count).toBe(30);
    expect(decision.candidate_decision).toBe("candidate_ready");
    expect(report.checks.action466_candidate_bound).toBe(true);
    expect(report.checks.action466_verifier_healthy).toBe(true);
  });

  test("keeps final input schema bounded and missing values null", () => {
    const decision = readJson<DecisionRecord>(decisionPath);
    const report = runVerifier();

    expect(decision.schema_version).toBe(
      "action_467_final_operator_decision_record_v1",
    );
    expect(decision.supplied_field_names).toEqual([]);
    expect(decision.invalid_field_names).toEqual([]);
    expect(decision.target_preview_environment).toBeNull();
    expect(decision.environment_classification).toBeNull();
    expect(decision.preview_environment_identifier).toBeNull();
    expect(decision.authorized_preview_users).toBeNull();
    expect(decision.access_control_mechanism).toBeNull();
    expect(decision.preview_start_condition).toBeNull();
    expect(decision.preview_expiry_condition).toBeNull();
    expect(decision.maximum_preview_duration_minutes).toBeNull();
    expect(decision.rollback_owner).toBeNull();
    expect(decision.observation_owner).toBeNull();
    expect(report.checks.no_invented_values).toBe(true);
    expect(report.checks.unresolved_inventory).toBe(true);
  });

  test("validates environment, access, timing, flag, diagnostics, evidence, and telemetry as unresolved", () => {
    const decision = readJson<DecisionRecord>(decisionPath);
    const report = runVerifier();

    expect(decision.unresolved_field_names).toEqual(
      expect.arrayContaining([
        "target_preview_environment",
        "environment_classification",
        "preview_environment_identifier",
        "authorized_preview_users",
        "access_control_mechanism",
        "preview_start_condition",
        "preview_expiry_condition",
        "maximum_preview_duration_minutes",
        "preview_flag_value",
        "development_diagnostics_enabled",
        "evidence_retention",
        "telemetry_policy",
      ]),
    );
    expect(decision.preview_flag_name).toBe(
      "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    );
    expect(decision.preview_flag_value).toBeNull();
    expect(decision.development_diagnostics_enabled).toBeNull();
    expect(decision.evidence_retention).toBeNull();
    expect(decision.telemetry_policy).toBeNull();
    expect(report.validation_results.actual.operator_input_decision).toBe(
      "operator_inputs_incomplete",
    );
  });

  test("freezes zero thresholds and leaves preview unavailable threshold unresolved", () => {
    const decision = readJson<DecisionRecord>(decisionPath);
    const report = runVerifier();

    expect(decision.acceptable_failure_threshold).toMatchObject({
      recommendation_render_failures: 0,
      original_confidence_mutations: 0,
      confidence_application_events: 0,
      ranking_scanner_publication_execution_effects: 0,
      add_trade_risk_sizing_effects: 0,
      production_exposure_events: 0,
      unauthorized_access_events: 0,
      raw_data_exposure_events: 0,
      route_provider_supabase_persistence_replay_feedback_events: 0,
      kill_switch_failures: 0,
      preview_unavailable_events_allowed: null,
    });
    expect(report.checks.zero_thresholds).toBe(true);
  });

  test("keeps owners, authority confirmations, and approvals unresolved without conflicts", () => {
    const decision = readJson<DecisionRecord>(decisionPath);

    expect(decision.rollback_owner).toBeNull();
    expect(decision.kill_switch_owner).toBeNull();
    expect(decision.deployment_operator).toBeNull();
    expect(decision.observation_owner).toBeNull();
    expect(decision.original_confidence_remains_authoritative).toBeNull();
    expect(decision.confidence_application_authorized).toBeNull();
    expect(decision.preview_may_affect_downstream_behavior).toBeNull();
    expect(decision.production_activation_authorized).toBeNull();
    expect(decision.persistent_projection_evidence_authorized).toBeNull();
    expect(decision.deployment_readiness_explicitly_approved).toBeNull();
    expect(decision.preview_activation_explicitly_approved).toBeNull();
  });

  test("exercises complete, incomplete, invalid, ready, conditional, and blocked vocabularies", () => {
    const report = runVerifier();

    expect(report.operator_input_decision).toBe("operator_inputs_incomplete");
    expect(report.deployment_gate_readiness).toBe(
      "deployment_gate_ready_with_conditions",
    );
    expect(report.activation_decision).toBe(
      "activation_approved_with_conditions",
    );
    expect(report.validation_results.complete_example).toMatchObject({
      operator_input_decision: "operator_inputs_complete",
      deployment_gate_readiness: "deployment_gate_ready",
      activation_decision: "activation_approved_for_future_action",
    });
    expect(report.validation_results.production_rejection_example).toMatchObject({
      operator_input_decision: "operator_inputs_invalid",
      deployment_gate_readiness: "deployment_gate_blocked",
      activation_decision: "activation_not_approved",
    });
    expect(report.validation_results.public_access_rejection_example).toMatchObject({
      deployment_gate_readiness: "deployment_gate_blocked",
    });
    expect(
      report.validation_results.conflicting_authority_rejection_example,
    ).toMatchObject({
      deployment_gate_readiness: "deployment_gate_blocked",
    });
    expect(report.checks.validation_examples).toBe(true);
  });

  test("records historical-verifier policy and keeps all runtime effects disabled", () => {
    const decision = readJson<DecisionRecord>(decisionPath);
    const report = runVerifier();

    expect(report.historical_verifier_policy).toMatchObject({
      action464_operator_input_snapshot:
        "superseded_for_current_input_completeness_by_action_467",
      action465_candidate_snapshot:
        "superseded_for_current_candidate_isolation_by_action_466",
      action466_candidate_materialization:
        "authoritative_current_candidate_proof",
      action467_operator_input_decision:
        "authoritative_current_operator_input_decision",
    });
    expect(decision.deployment_performed).toBe(false);
    expect(decision.preview_activated).toBe(false);
    expect(decision.runtime_preview_state).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(decision.next_permitted_action).toBe(
      "action_468_operator_input_completion_continuation",
    );
    expect(Object.values(report.no_effect_results)).toEqual(
      expect.arrayContaining([false]),
    );
    expect(new Set(Object.values(report.no_effect_results))).toEqual(
      new Set([false]),
    );
  });
});
