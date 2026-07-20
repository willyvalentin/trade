import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution.md";
const recordPath =
  "docs/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-record.json";
const verifierPath =
  "scripts/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-verify.mjs";
const action470RecordPath =
  "docs/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-record.json";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";

test.setTimeout(300000);

type DeploymentRecord = {
  schema_version: string;
  source_action: number;
  candidate_inventory_hash: string;
  materialized_candidate_hash: string;
  candidate_file_count: number;
  deployment_target_name: string;
  deployment_target_identifier: string;
  environment_classification: string;
  deployment_platform: string;
  deployment_type: string;
  deployment_operator: string;
  access_classification: string;
  pre_deployment_validation_result: string;
  pre_deployment_blockers: string[];
  pre_deployment_checks_serial_policy: boolean;
  candidate_materialization_verifiers_run_concurrently: boolean;
  initial_preview_flag_state: string;
  preview_flag_enabled: boolean;
  production_flag_enabled: boolean;
  query_string_activation_allowed: boolean;
  storage_or_cookie_activation_allowed: boolean;
  user_controlled_activation_allowed: boolean;
  deployment_attempt_count: number;
  maximum_deployment_attempt_count: number;
  retry_performed: boolean;
  deployment_result: string;
  preview_deployment_created: boolean;
  production_deployment_changed: boolean;
  production_activation: boolean;
  preview_activated: boolean;
  confidence_applied: boolean;
  recommendation_mutated: boolean;
  persistence_created: boolean;
  replay_created: boolean;
  provider_call_executed: boolean;
  supabase_access_created: boolean;
  supabase_write_executed: boolean;
  feedback_created: boolean;
  downstream_behavior_changed: boolean;
  bounded_preview_url_reference: string | null;
  post_deployment_disabled_verification_required: boolean;
  mandatory_disabled_state_gate_if_deployment_succeeds: string;
  next_action: string;
  current_runtime_preview_state: string;
  recommended_runtime_preview_state: string;
  cleanup_result: Record<string, boolean>;
  deployment_execution_performed: boolean;
  netlify_cli_invoked: boolean;
  netlify_api_invoked: boolean;
  netlify_site_linked: boolean;
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

test.describe("Action 471 preview deployment execution", () => {
  test("documents and verifies the bounded execution record", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Action 470 Approval");
    expect(doc).toContain("## Isolated Deployment Source");
    expect(doc).toContain("Deployment result: `deployment_aborted`");
    expect(doc).toContain(
      "action_472_confidence_calibration_recommendation_advisory_projection_preview_deployment_remediation_approval_gate",
    );

    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.failed_conditions).toEqual([]);
  });

  test("binds Action 470 approval and the exact candidate", () => {
    const action470 = readJson<Record<string, unknown>>(action470RecordPath);
    const record = readJson<DeploymentRecord>(recordPath);
    const report = runVerifier();

    expect(action470.deployment_decision).toBe(
      "deployment_execution_approved_for_future_action",
    );
    expect(record.schema_version).toBe(
      "action_471_preview_deployment_execution_record_v1",
    );
    expect(record.source_action).toBe(470);
    expect(record.candidate_inventory_hash).toBe(candidateHash);
    expect(record.materialized_candidate_hash).toBe(candidateHash);
    expect(record.candidate_file_count).toBe(30);
    expect(report.checks.action470_approval).toBe(true);
    expect(report.checks.candidate_bound).toBe(true);
  });

  test("records isolated-source requirement, unrelated-file exclusion, and serial precheck policy", () => {
    const record = readJson<DeploymentRecord>(recordPath);

    expect(record.pre_deployment_validation_result).toBe("blocked_before_deployment");
    expect(record.pre_deployment_blockers).toContain(
      "isolated_deployment_source_not_proven_from_current_dirty_worktree",
    );
    expect(record.pre_deployment_blockers).toContain(
      "netlify_preview_target_access_not_available_without_secret_or_network_step",
    );
    expect(record.pre_deployment_checks_serial_policy).toBe(true);
    expect(record.candidate_materialization_verifiers_run_concurrently).toBe(false);
  });

  test("freezes exact non-production target and production rejection semantics", () => {
    const record = readJson<DeploymentRecord>(recordPath);

    expect(record.deployment_target_name).toBe(
      "Netlify Preview Deployment – Ture Confidence Calibration Projection Preview",
    );
    expect(record.deployment_target_identifier).toBe(
      "ture-confidence-calibration-projection-preview",
    );
    expect(record.environment_classification).toBe("non_production_preview");
    expect(record.deployment_platform).toBe("Netlify");
    expect(record.deployment_type).toBe("preview");
    expect(record.production_deployment_changed).toBe(false);
    expect(record.production_activation).toBe(false);
  });

  test("requires disabled flag and rejects enabled/user-controlled activation paths", () => {
    const record = readJson<DeploymentRecord>(recordPath);

    expect(record.initial_preview_flag_state).toBe("disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.production_flag_enabled).toBe(false);
    expect(record.query_string_activation_allowed).toBe(false);
    expect(record.storage_or_cookie_activation_allowed).toBe(false);
    expect(record.user_controlled_activation_allowed).toBe(false);
  });

  test("records no deployment attempt, no retry, and exact result vocabulary", () => {
    const record = readJson<DeploymentRecord>(recordPath);

    expect([
      "deployment_succeeded_preview_disabled",
      "deployment_failed",
      "deployment_aborted",
    ]).toContain(record.deployment_result);
    expect(record.deployment_result).toBe("deployment_aborted");
    expect(record.deployment_attempt_count).toBe(0);
    expect(record.maximum_deployment_attempt_count).toBe(1);
    expect(record.retry_performed).toBe(false);
    expect(record.preview_deployment_created).toBe(false);
  });

  test("keeps preview inactive and all confidence, persistence, replay, provider, Supabase, feedback, and downstream effects false", () => {
    const record = readJson<DeploymentRecord>(recordPath);

    expect(record.preview_activated).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.recommendation_mutated).toBe(false);
    expect(record.persistence_created).toBe(false);
    expect(record.replay_created).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_access_created).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.downstream_behavior_changed).toBe(false);
  });

  test("keeps bounded URL policy, no credential retention, and cleanup guarantees", () => {
    const record = readJson<DeploymentRecord>(recordPath);

    expect(record.bounded_preview_url_reference).toBeNull();
    expect(record.cleanup_result.credentials_retained).toBe(false);
    expect(record.cleanup_result.environment_values_retained).toBe(false);
    expect(record.cleanup_result.temporary_candidate_copies_remaining).toBe(false);
    expect(record.cleanup_result.deployment_output_retained_in_repo).toBe(false);
    expect(record.cleanup_result.projection_evidence_retained).toBe(false);
    expect(record.deployment_execution_performed).toBe(false);
    expect(record.netlify_cli_invoked).toBe(false);
    expect(record.netlify_api_invoked).toBe(false);
    expect(record.netlify_site_linked).toBe(false);
  });

  test("records runtime-state recommendation and mandatory next gate for an aborted deployment", () => {
    const record = readJson<DeploymentRecord>(recordPath);

    expect(record.current_runtime_preview_state).toBe(
      "runtime_preview_waiting_for_operator_inputs",
    );
    expect(record.recommended_runtime_preview_state).toBe(
      "runtime_preview_ready_for_deployment_approval",
    );
    expect(record.next_action).toBe(
      "action_472_confidence_calibration_recommendation_advisory_projection_preview_deployment_remediation_approval_gate",
    );
    expect(record.mandatory_disabled_state_gate_if_deployment_succeeds).toBe(
      "action_472_confidence_calibration_recommendation_advisory_projection_preview_disabled_state_verification_and_activation_approval_gate",
    );
    expect(record.post_deployment_disabled_verification_required).toBe(false);
  });
});
