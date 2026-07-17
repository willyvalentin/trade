import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-gate.md";
const recordPath =
  "docs/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-record.json";
const verifierPath =
  "scripts/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-gate-verify.mjs";
const action469RecordPath =
  "docs/action-469-confidence-calibration-recommendation-advisory-projection-preview-validated-operator-decision-record.json";
const action471RecordPath =
  "docs/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-record.json";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";

test.setTimeout(300000);

type ApprovalRecord = {
  schema_version: string;
  source_action: number;
  approval_action: number;
  candidate_hash: string;
  materialized_candidate_hash: string;
  candidate_file_count: number;
  target_environment: string;
  environment_classification: string;
  preview_environment_identifier: string;
  access_policy: string;
  authorized_preview_users: string[];
  deployment_operator: string;
  observation_owner: string;
  rollback_owner: string;
  kill_switch_owner: string;
  duration_minutes: number;
  evidence_policy: string;
  telemetry_policy: string;
  thresholds: Record<string, number>;
  pre_deployment_checks: string[];
  preview_flag_name: string;
  initial_flag_state: string;
  disabled_on_deploy_required: boolean;
  post_deployment_checks: string[];
  activation_separated: boolean;
  activation_requires_future_action: string;
  production_prohibited: boolean;
  runtime_state_sequence: string[];
  current_runtime_preview_state: string;
  recommended_runtime_preview_state: string;
  observation_policy: {
    owner: string;
    retention: string;
    allowed_fields: string[];
    prohibited_fields: string[];
  };
  stop_conditions: string[];
  kill_switch: {
    owner: string;
    procedure: string;
    reenable_same_session_allowed: boolean;
  };
  rollback: {
    owner: string;
    primary: string;
    secondary: string;
    data_cleanup_required: boolean;
  };
  expiry: {
    duration_minutes: number;
    procedure: string;
  };
  deployment_decision: string;
  next_action: string;
  mandatory_followup_activation_gate: string;
  deployment_performed: boolean;
  preview_activated: boolean;
  environment_modified: boolean;
  netlify_cli_invoked: boolean;
  netlify_api_invoked: boolean;
  provider_call_executed: boolean;
  supabase_write_executed: boolean;
  replay_executed: boolean;
  persistence_added: boolean;
  feedback_added: boolean;
  confidence_application_added: boolean;
  scanner_behavior_changed: boolean;
  live_ranking_changed: boolean;
  add_trade_changed: boolean;
  broker_execution_changed: boolean;
  risk_sizing_changed: boolean;
};

type Action471Record = {
  schema_version: string;
  source_action: number;
  candidate_inventory_hash: string;
  materialized_candidate_hash: string;
  candidate_file_count: number;
  deployment_result: string;
  preview_activated: boolean;
  confidence_applied: boolean;
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

test.describe("Action 470 preview deployment execution approval gate", () => {
  test("adds the documentation, bounded approval record, verifier, and focused test", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Frozen Candidate");
    expect(doc).toContain("## Disabled-Deployment Policy");
    expect(doc).toContain("## Activation Separation");
    expect(doc).toContain("Action 471 may perform only the approved preview deployment with the preview flag disabled");
    expect(doc).toContain("action_472_confidence_calibration_recommendation_advisory_projection_preview_disabled_state_verification_and_activation_approval_gate");

    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.failed_conditions).toEqual([]);
  });

  test("binds Action 469 operator completeness and the exact candidate", () => {
    const action469 = readJson<Record<string, unknown>>(action469RecordPath);
    const record = readJson<ApprovalRecord>(recordPath);
    const report = runVerifier();

    expect(action469.operator_input_decision).toBe("operator_inputs_complete");
    expect(action469.deployment_gate_readiness).toBe("deployment_gate_ready");
    expect(action469.activation_decision).toBe("activation_approved_for_future_action");
    expect(record.schema_version).toBe(
      "action_470_preview_deployment_execution_approval_record_v1",
    );
    expect(record.source_action).toBe(469);
    expect(record.approval_action).toBe(470);
    expect(record.candidate_hash).toBe(candidateHash);
    expect(record.materialized_candidate_hash).toBe(candidateHash);
    expect(record.candidate_file_count).toBe(30);
    expect(report.checks.action469_decision).toBe(true);
    expect(report.checks.candidate_bound).toBe(true);
  });

  test("freezes non-production target and rejects production/public/enabled deployment examples", () => {
    const record = readJson<ApprovalRecord>(recordPath);
    const report = runVerifier();

    expect(record.target_environment).toBe(
      "Netlify Preview Deployment – Ture Confidence Calibration Projection Preview",
    );
    expect(record.environment_classification).toBe("non_production_preview");
    expect(record.preview_environment_identifier).toBe(
      "ture-confidence-calibration-projection-preview",
    );
    expect(record.production_prohibited).toBe(true);
    expect(record.access_policy).toContain("Private Netlify Preview URL");
    expect(record.access_policy).toContain("No public distribution");
    expect(report.validation_results.production_rejection_example).toBe(
      "deployment_execution_not_approved",
    );
    expect(report.validation_results.public_access_rejection_example).toBe(
      "deployment_execution_not_approved",
    );
    expect(report.validation_results.enabled_deploy_rejection_example).toBe(
      "deployment_execution_not_approved",
    );
  });

  test("freezes operators, owners, duration, evidence, telemetry, and thresholds", () => {
    const record = readJson<ApprovalRecord>(recordPath);

    expect(record.authorized_preview_users).toEqual(["Willy Simonsson"]);
    expect(record.deployment_operator).toBe("Willy Simonsson");
    expect(record.observation_owner).toBe("Willy Simonsson");
    expect(record.rollback_owner).toBe("Willy Simonsson");
    expect(record.kill_switch_owner).toBe("Willy Simonsson");
    expect(record.duration_minutes).toBe(480);
    expect(record.evidence_policy).toBe("bounded_manual_summary");
    expect(record.telemetry_policy).toBe("none");
    expect(record.thresholds).toMatchObject({
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
  });

  test("requires candidate prechecks, flag-disabled deployment, and disabled-state post-deploy checks", () => {
    const record = readJson<ApprovalRecord>(recordPath);

    expect(record.pre_deployment_checks).toContain("git diff --check");
    expect(record.pre_deployment_checks).toContain("npx next typegen");
    expect(record.pre_deployment_checks).toContain("npx tsc --noEmit");
    expect(record.pre_deployment_checks).toContain("npm run build");
    expect(record.pre_deployment_checks).toContain("npm run lint");
    expect(record.pre_deployment_checks).toContain(
      `candidate hash remains ${candidateHash}`,
    );
    expect(record.preview_flag_name).toBe(
      "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    );
    expect(record.initial_flag_state).toBe("disabled");
    expect(record.disabled_on_deploy_required).toBe(true);
    expect(record.post_deployment_checks).toContain("preview URL resolves");
    expect(record.post_deployment_checks).toContain(
      "Calibration Preview UI is absent while the flag is disabled",
    );
    expect(record.post_deployment_checks).toContain(
      "production environment is unaffected",
    );
  });

  test("keeps activation separate with the Action 471 and Action 472 boundaries", () => {
    const record = readJson<ApprovalRecord>(recordPath);

    expect(record.activation_separated).toBe(true);
    expect(record.activation_requires_future_action).toBe(
      "action_472_confidence_calibration_recommendation_advisory_projection_preview_disabled_state_verification_and_activation_approval_gate",
    );
    expect(record.next_action).toBe(
      "action_471_confidence_calibration_recommendation_advisory_projection_preview_deployment_execution",
    );
    expect(record.mandatory_followup_activation_gate).toBe(
      "action_472_confidence_calibration_recommendation_advisory_projection_preview_disabled_state_verification_and_activation_approval_gate",
    );
    expect(record.deployment_decision).toBe(
      "deployment_execution_approved_for_future_action",
    );
  });

  test("freezes runtime-state sequence, observation procedure, unavailable threshold, and stop conditions", () => {
    const record = readJson<ApprovalRecord>(recordPath);

    expect(record.runtime_state_sequence).toEqual([
      "runtime_preview_waiting_for_operator_inputs",
      "runtime_preview_ready_for_deployment_approval",
      "runtime_preview_deployed_preview_disabled",
      "runtime_preview_active_observation_only",
    ]);
    expect(record.current_runtime_preview_state).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(record.recommended_runtime_preview_state).toBe(
      "runtime_preview_ready_for_deployment_approval",
    );
    expect(record.observation_policy.retention).toBe("bounded_manual_summary");
    expect(record.observation_policy.allowed_fields).toContain(
      "aggregate_preview_unavailable_count",
    );
    expect(record.observation_policy.prohibited_fields).toContain(
      "raw projection data",
    );
    expect(record.thresholds.preview_unavailable_events_allowed).toBe(10);
    expect(record.stop_conditions).toContain("preview unavailable count exceeds 10");
    expect(record.stop_conditions).toContain("candidate hash differs");
    expect(record.stop_conditions).toContain("access boundary fails");
  });

  test("freezes kill-switch, rollback, expiry, and no-effect guarantees", () => {
    const record = readJson<ApprovalRecord>(recordPath);
    const report = runVerifier();

    expect(record.kill_switch.owner).toBe("Willy Simonsson");
    expect(record.kill_switch.procedure).toContain(
      "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    );
    expect(record.kill_switch.reenable_same_session_allowed).toBe(false);
    expect(record.rollback.owner).toBe("Willy Simonsson");
    expect(record.rollback.primary).toBe("Disable or remove the preview flag.");
    expect(record.rollback.data_cleanup_required).toBe(false);
    expect(record.expiry.duration_minutes).toBe(480);
    expect(record.expiry.procedure).toContain("Disable or remove the preview flag");
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(new Set(Object.values(report.no_effect_results))).toEqual(new Set([true]));
  });

  test("keeps Actions 459-463 and 466-469 verifiers healthy through the Action 470 verifier", () => {
    const report = runVerifier();

    expect(report.checks.source_verifiers_healthy).toBe(true);
    expect(Object.values(report.source_verifier_statuses)).toEqual(
      expect.arrayContaining(["passed"]),
    );
    expect(new Set(Object.values(report.source_verifier_statuses))).toEqual(
      new Set(["passed"]),
    );
  });

  test("recognizes the bounded Action 471 deployment execution artifact without verifier cycles", () => {
    const action471 = readJson<Action471Record>(action471RecordPath);
    const report = runVerifier();

    expect(report.checks.action471_artifacts_recognized).toBe(true);
    expect(action471.schema_version).toBe(
      "action_471_preview_deployment_execution_record_v1",
    );
    expect(action471.source_action).toBe(470);
    expect(action471.candidate_inventory_hash).toBe(candidateHash);
    expect(action471.materialized_candidate_hash).toBe(candidateHash);
    expect(action471.candidate_file_count).toBe(30);
    expect([
      "deployment_succeeded_preview_disabled",
      "deployment_failed",
      "deployment_aborted",
    ]).toContain(action471.deployment_result);
    expect(action471.preview_activated).toBe(false);
    expect(action471.confidence_applied).toBe(false);
  });
});
