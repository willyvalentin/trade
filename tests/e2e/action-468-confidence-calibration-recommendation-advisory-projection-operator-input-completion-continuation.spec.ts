import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-468-confidence-calibration-recommendation-advisory-projection-operator-input-completion-continuation.md";
const recordPath =
  "docs/action-468-confidence-calibration-recommendation-advisory-projection-preview-continued-operator-decision-record.json";
const action466MaterializationPath =
  "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization.json";
const action467RecordPath =
  "docs/action-467-confidence-calibration-recommendation-advisory-projection-preview-final-operator-decision-record.json";
const verifierPath =
  "scripts/action-468-confidence-calibration-recommendation-advisory-projection-operator-input-completion-continuation-verify.mjs";

const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";

test.setTimeout(300000);

type ContinuedRecord = {
  schema_version: string;
  source_action: number;
  continuation_action: number;
  candidate_integrity_preserved: boolean;
  operator_inputs_changed: boolean;
  newly_supplied_field_names: string[];
  carried_forward_supplied_field_names: string[];
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

test.describe("Action 468 operator input completion continuation", () => {
  test("documents and verifies the static continuation contract", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Candidate Binding");
    expect(doc).toContain("## Action 467 Input State");
    expect(doc).toContain("## Runtime-Preview State");

    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.failed_conditions).toEqual([]);
  });

  test("binds Action 466 candidate proof and Action 467 source record", () => {
    const materialization = readJson<Record<string, unknown>>(
      action466MaterializationPath,
    );
    const action467 = readJson<Record<string, unknown>>(action467RecordPath);
    const continued = readJson<ContinuedRecord>(recordPath);
    const report = runVerifier();

    expect(materialization.action_465_candidate_inventory_hash).toBe(
      candidateHash,
    );
    expect(materialization.materialized_candidate_inventory_hash).toBe(
      candidateHash,
    );
    expect(materialization.candidate_file_count).toBe(30);
    expect(action467.candidate_inventory_hash).toBe(candidateHash);
    expect(action467.operator_input_decision).toBe("operator_inputs_incomplete");
    expect(continued.candidate_inventory_hash).toBe(candidateHash);
    expect(continued.candidate_file_count).toBe(30);
    expect(continued.candidate_decision).toBe("candidate_ready");
    expect(report.checks.action466_candidate_bound).toBe(true);
    expect(report.checks.action467_source_bound).toBe(true);
  });

  test("records no-new-input path and preserves unsupplied values as null", () => {
    const continued = readJson<ContinuedRecord>(recordPath);
    const report = runVerifier();

    expect(continued.schema_version).toBe(
      "action_468_continued_operator_decision_record_v1",
    );
    expect(continued.source_action).toBe(467);
    expect(continued.continuation_action).toBe(468);
    expect(continued.candidate_integrity_preserved).toBe(true);
    expect(continued.operator_inputs_changed).toBe(false);
    expect(continued.newly_supplied_field_names).toEqual([]);
    expect(continued.carried_forward_supplied_field_names).toEqual([]);
    expect(continued.supplied_field_names).toEqual([]);
    expect(continued.target_preview_environment).toBeNull();
    expect(continued.preview_environment_identifier).toBeNull();
    expect(continued.authorized_preview_users).toBeNull();
    expect(continued.access_control_mechanism).toBeNull();
    expect(continued.preview_start_condition).toBeNull();
    expect(continued.preview_expiry_condition).toBeNull();
    expect(continued.maximum_preview_duration_minutes).toBeNull();
    expect(report.checks.no_new_input_path).toBe(true);
    expect(report.checks.no_invented_values).toBe(true);
  });

  test("keeps environment, access, timing, flag, diagnostics, evidence, and telemetry unresolved", () => {
    const continued = readJson<ContinuedRecord>(recordPath);
    const report = runVerifier();

    expect(continued.unresolved_field_names).toEqual(
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
    expect(continued.preview_flag_name).toBe(
      "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    );
    expect(continued.preview_flag_value).toBeNull();
    expect(continued.development_diagnostics_enabled).toBeNull();
    expect(continued.evidence_retention).toBeNull();
    expect(continued.telemetry_policy).toBeNull();
    expect(report.validation_results.actual.operator_input_decision).toBe(
      "operator_inputs_incomplete",
    );
  });

  test("freezes zero thresholds and leaves preview unavailable threshold unresolved", () => {
    const continued = readJson<ContinuedRecord>(recordPath);
    const report = runVerifier();

    expect(continued.acceptable_failure_threshold).toMatchObject({
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

  test("keeps owners, authority confirmations, and approvals unresolved", () => {
    const continued = readJson<ContinuedRecord>(recordPath);

    expect(continued.rollback_owner).toBeNull();
    expect(continued.kill_switch_owner).toBeNull();
    expect(continued.deployment_operator).toBeNull();
    expect(continued.observation_owner).toBeNull();
    expect(continued.original_confidence_remains_authoritative).toBeNull();
    expect(continued.confidence_application_authorized).toBeNull();
    expect(continued.preview_may_affect_downstream_behavior).toBeNull();
    expect(continued.production_activation_authorized).toBeNull();
    expect(continued.persistent_projection_evidence_authorized).toBeNull();
    expect(continued.deployment_readiness_explicitly_approved).toBeNull();
    expect(continued.preview_activation_explicitly_approved).toBeNull();
  });

  test("exercises safe, complete, unsafe, production, public, duration, and expiry validation paths", () => {
    const report = runVerifier();

    expect(report.validation_results.safe_partial_example).toMatchObject({
      operator_input_decision: "operator_inputs_incomplete",
      deployment_gate_readiness: "deployment_gate_ready_with_conditions",
      invalid_field_names: [],
    });
    expect(report.validation_results.complete_example).toMatchObject({
      operator_input_decision: "operator_inputs_complete",
      deployment_gate_readiness: "deployment_gate_ready",
      activation_decision: "activation_approved_for_future_action",
    });
    expect(report.validation_results.unsafe_input_rejection_example).toMatchObject({
      operator_input_decision: "operator_inputs_invalid",
      deployment_gate_readiness: "deployment_gate_blocked",
    });
    expect(report.validation_results.production_rejection_example).toMatchObject({
      deployment_gate_readiness: "deployment_gate_blocked",
    });
    expect(report.validation_results.public_access_rejection_example).toMatchObject({
      deployment_gate_readiness: "deployment_gate_blocked",
    });
    expect(report.validation_results.invalid_duration_rejection_example).toMatchObject({
      deployment_gate_readiness: "deployment_gate_blocked",
    });
    expect(report.validation_results.missing_expiry_unresolved_example).toMatchObject({
      operator_input_decision: "operator_inputs_incomplete",
      deployment_gate_readiness: "deployment_gate_ready_with_conditions",
    });
  });

  test("returns required decisions, historical policy, next action, runtime state, and no effects", () => {
    const continued = readJson<ContinuedRecord>(recordPath);
    const report = runVerifier();

    expect(continued.operator_input_decision).toBe("operator_inputs_incomplete");
    expect(continued.deployment_gate_readiness).toBe(
      "deployment_gate_ready_with_conditions",
    );
    expect(continued.activation_decision).toBe(
      "activation_approved_with_conditions",
    );
    expect(continued.next_permitted_action).toBe(
      "action_469_operator_input_completion_continuation",
    );
    expect(continued.runtime_preview_state).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(report.historical_verifier_policy).toMatchObject({
      action464_and_action465: "historical_snapshots_preserved",
      action466_candidate_materialization:
        "authoritative_current_candidate_isolation",
      action467_operator_record: "prior_operator_input_snapshot",
      action468_operator_completion:
        "authoritative_current_operator_input_completeness",
    });
    expect(new Set(Object.values(report.no_effect_results))).toEqual(
      new Set([false]),
    );
  });
});
