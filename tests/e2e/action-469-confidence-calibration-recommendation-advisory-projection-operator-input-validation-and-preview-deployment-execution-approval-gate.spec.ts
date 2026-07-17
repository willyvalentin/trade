import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-469-confidence-calibration-recommendation-advisory-projection-operator-input-validation-and-preview-deployment-execution-approval-gate.md";
const recordPath =
  "docs/action-469-confidence-calibration-recommendation-advisory-projection-preview-validated-operator-decision-record.json";
const verifierPath =
  "scripts/action-469-confidence-calibration-recommendation-advisory-projection-operator-input-validation-and-preview-deployment-execution-approval-gate-verify.mjs";

const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";

test.setTimeout(300000);

type ValidatedRecord = {
  schema_version: string;
  source_action: number;
  validation_action: number;
  candidate_inventory_hash: string;
  materialized_candidate_hash: string;
  candidate_file_count: number;
  candidate_decision: string;
  target_preview_environment: string;
  environment_classification: string;
  preview_environment_identifier: string;
  authorized_preview_users: string[];
  access_control_mechanism: string;
  platform_access_protection_recommendation: string;
  preview_start_condition: string;
  preview_expiry_condition: string;
  maximum_preview_duration_minutes: number;
  preview_flag_name: string;
  preview_flag_value: string;
  development_diagnostics_enabled: boolean;
  evidence_retention: string;
  telemetry_policy: string;
  acceptable_failure_threshold: Record<string, number>;
  rollback_owner: string;
  kill_switch_owner: string;
  deployment_operator: string;
  observation_owner: string;
  original_confidence_remains_authoritative: boolean;
  confidence_application_authorized: boolean;
  preview_may_affect_downstream_behavior: boolean;
  production_activation_authorized: boolean;
  persistent_projection_evidence_authorized: boolean;
  deployment_readiness_explicitly_approved: boolean;
  preview_activation_explicitly_approved: boolean;
  supplied_field_names: string[];
  unresolved_field_names: string[];
  invalid_field_names: string[];
  operator_input_decision: string;
  deployment_gate_readiness: string;
  activation_decision: string;
  recommended_runtime_preview_state: string;
  next_permitted_action: string;
  deployment_performed: boolean;
  preview_activated: boolean;
  environment_modified: boolean;
  current_runtime_preview_state: string;
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

test.describe("Action 469 operator input validation and preview deployment execution approval gate", () => {
  test("documents and verifies the static approval-gate contract", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Authoritative Candidate");
    expect(doc).toContain("## Authoritative Supplied Inputs");
    expect(doc).toContain("## Action 470 Boundary");

    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.failed_conditions).toEqual([]);
  });

  test("binds candidate hashes, file count, source records, and source verifiers", () => {
    const record = readJson<ValidatedRecord>(recordPath);
    const report = runVerifier();

    expect(record.candidate_inventory_hash).toBe(candidateHash);
    expect(record.materialized_candidate_hash).toBe(candidateHash);
    expect(record.candidate_file_count).toBe(30);
    expect(record.candidate_decision).toBe("candidate_ready");
    expect(report.checks.candidate_bound).toBe(true);
    expect(report.checks.source_records_bound).toBe(true);
    expect(report.checks.source_verifiers_healthy).toBe(true);
  });

  test("records exact supplied operator values with zero unresolved and invalid fields", () => {
    const record = readJson<ValidatedRecord>(recordPath);
    const report = runVerifier();

    expect(record.schema_version).toBe(
      "action_469_validated_operator_decision_record_v1",
    );
    expect(record.source_action).toBe(468);
    expect(record.validation_action).toBe(469);
    expect(record.supplied_field_names).toHaveLength(24);
    expect(record.unresolved_field_names).toEqual([]);
    expect(record.invalid_field_names).toEqual([]);
    expect(record.target_preview_environment).toBe(
      "Netlify Preview Deployment – Ture Confidence Calibration Projection Preview",
    );
    expect(record.environment_classification).toBe("non_production_preview");
    expect(record.preview_environment_identifier).toBe(
      "ture-confidence-calibration-projection-preview",
    );
    expect(record.authorized_preview_users).toEqual(["Willy Simonsson"]);
    expect(report.supplied_input_count).toBe(24);
    expect(report.unresolved_input_count).toBe(0);
    expect(report.invalid_input_count).toBe(0);
  });

  test("validates private access policy and rejects public access", () => {
    const record = readJson<ValidatedRecord>(recordPath);
    const report = runVerifier();

    expect(record.access_control_mechanism).toBe(
      "Private Netlify Preview URL shared only with the authorized operator. No public distribution or user-controlled access.",
    );
    expect(record.platform_access_protection_recommendation).toContain(
      "platform-level access protection",
    );
    expect(report.validation_results.public_access_rejection_example).toMatchObject({
      operator_input_decision: "operator_inputs_invalid",
      deployment_gate_readiness: "deployment_gate_blocked",
    });
  });

  test("validates environment, timing, flag, diagnostics, evidence, and telemetry", () => {
    const record = readJson<ValidatedRecord>(recordPath);
    const report = runVerifier();

    expect(record.maximum_preview_duration_minutes).toBe(480);
    expect(record.preview_expiry_condition).toContain("480 minutes");
    expect(record.preview_flag_name).toBe(
      "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    );
    expect(record.preview_flag_value).toBe("true");
    expect(record.development_diagnostics_enabled).toBe(false);
    expect(record.evidence_retention).toBe("bounded_manual_summary");
    expect(record.telemetry_policy).toBe("none");
    expect(report.validation_results.production_rejection_example).toMatchObject({
      deployment_gate_readiness: "deployment_gate_blocked",
    });
    expect(report.validation_results.invalid_duration_rejection_example).toMatchObject({
      deployment_gate_readiness: "deployment_gate_blocked",
    });
    expect(report.validation_results.missing_expiry_rejection_example).toMatchObject({
      deployment_gate_readiness: "deployment_gate_blocked",
    });
    expect(report.validation_results.diagnostics_rejection_example).toMatchObject({
      deployment_gate_readiness: "deployment_gate_blocked",
    });
    expect(report.validation_results.telemetry_rejection_example).toMatchObject({
      deployment_gate_readiness: "deployment_gate_blocked",
    });
  });

  test("freezes thresholds and owner assignments", () => {
    const record = readJson<ValidatedRecord>(recordPath);

    expect(record.acceptable_failure_threshold).toMatchObject({
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
      preview_unavailable_events_allowed: 10,
    });
    expect(record.rollback_owner).toBe("Willy Simonsson");
    expect(record.kill_switch_owner).toBe("Willy Simonsson");
    expect(record.deployment_operator).toBe("Willy Simonsson");
    expect(record.observation_owner).toBe("Willy Simonsson");
  });

  test("validates authority confirmations and explicit approvals", () => {
    const record = readJson<ValidatedRecord>(recordPath);
    const report = runVerifier();

    expect(record.original_confidence_remains_authoritative).toBe(true);
    expect(record.confidence_application_authorized).toBe(false);
    expect(record.preview_may_affect_downstream_behavior).toBe(false);
    expect(record.production_activation_authorized).toBe(false);
    expect(record.persistent_projection_evidence_authorized).toBe(false);
    expect(record.deployment_readiness_explicitly_approved).toBe(true);
    expect(record.preview_activation_explicitly_approved).toBe(true);
    expect(report.validation_results.authority_rejection_example).toMatchObject({
      deployment_gate_readiness: "deployment_gate_blocked",
    });
  });

  test("returns ready decisions, future state recommendation, mandatory Action 470, and no effects", () => {
    const record = readJson<ValidatedRecord>(recordPath);
    const report = runVerifier();

    expect(record.operator_input_decision).toBe("operator_inputs_complete");
    expect(record.deployment_gate_readiness).toBe("deployment_gate_ready");
    expect(record.activation_decision).toBe(
      "activation_approved_for_future_action",
    );
    expect(record.current_runtime_preview_state).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(record.recommended_runtime_preview_state).toBe(
      "runtime_preview_ready_for_deployment_approval",
    );
    expect(record.next_permitted_action).toBe(
      "action_470_confidence_calibration_recommendation_advisory_projection_preview_deployment_execution_approval_gate",
    );
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(new Set(Object.values(report.no_effect_results))).toEqual(
      new Set([false]),
    );
    expect(report.checks.action470_boundary).toBe(true);
  });
});
