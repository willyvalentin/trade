import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution.md";
const recordPath =
  "docs/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution-record.json";
const action479RecordPath =
  "docs/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-record.json";
const verifierPath =
  "scripts/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution-verify.mjs";
const action478VerifierPath =
  "scripts/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution-verify.mjs";
const action479VerifierPath =
  "scripts/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-gate-verify.mjs";
const cleanBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";
const siteReference = "2b582e03-ac97-4371-8051-558d9980fb94";
const successAction = "action_481_preview_disabled_state_verification_and_activation_approval_gate";
const remediationAction =
  "action_481_confidence_calibration_recommendation_advisory_projection_preview_deployment_retry_reconstruction_remediation_gate";

test.setTimeout(300000);

type Action479Record = {
  deployment_retry_decision: string;
  deployment_performed: boolean;
  preview_activated: boolean;
  production_changed: boolean;
  netlify_site_name: string;
  netlify_site_reference: string;
  netlify_team: string;
  deployment_attempt_limit: number;
};

type Action480Record = {
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  netlify_site_name: string;
  netlify_site_reference: string;
  netlify_team: string;
  site_link_verified: boolean;
  deployment_type: string;
  initial_preview_flag_name: string;
  initial_preview_flag_state: string;
  preview_flag_enabled: boolean;
  production_preview_flag_enabled: boolean;
  alternate_activation_alias_detected: boolean;
  query_string_activation_allowed: boolean;
  storage_or_cookie_activation_allowed: boolean;
  automatic_activation_allowed: boolean;
  candidate_reconstruction_result: string;
  candidate_reconstruction_blockers: string[];
  isolated_source_directory_created: boolean;
  isolated_source_validation_result: string;
  changed_file_count: number;
  changed_paths_exact_approved_set: boolean;
  changed_file_hashes_exact: string;
  unexpected_changed_files: number;
  unrelated_post_trade_changed_files: number;
  environment_files: number;
  secret_files: number;
  merge_conflict_markers: number;
  runtime_projection_call_sites: number;
  pre_deployment_validation_result: string;
  pre_deployment_validations_completed: boolean;
  pre_deployment_blockers: string[];
  serial_validation_required: boolean;
  serial_validation_started: boolean;
  validation_commands_run_in_isolated_candidate: string[];
  netlify_target_pre_deployment_status_verified: boolean;
  deployment_attempt_count: number;
  maximum_deployment_attempt_count: number;
  same_action_retry_performed: boolean;
  deployment_result: string;
  preview_deployment_created: boolean;
  bounded_preview_reference: string | null;
  bounded_preview_reference_policy: string;
  production_deployment_changed: boolean;
  production_alias_changed: boolean;
  environment_modified: boolean;
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
  ranking_changed: boolean;
  scanner_changed: boolean;
  publication_changed: boolean;
  execution_changed: boolean;
  add_trade_changed: boolean;
  risk_sizing_changed: boolean;
  temporary_candidate_cleanup_result: string;
  temporary_candidate_absent_after_cleanup: boolean;
  credential_value_recorded: boolean;
  credential_files_inspected: boolean;
  admin_url_recorded: boolean;
  secret_bearing_url_recorded: boolean;
  environment_value_recorded: boolean;
  build_logs_retained: boolean;
  netlify_cli_invoked: boolean;
  netlify_api_invoked: boolean;
  netlify_deploy_command_invoked: boolean;
  netlify_deploy_prod_invoked: boolean;
  post_deployment_disabled_verification_required: boolean;
  current_runtime_preview_state: string;
  recommended_runtime_preview_state: string;
  success_runtime_preview_state: string;
  runtime_preview_active_observation_only_authorized: boolean;
  required_after_successful_deployment_action: string;
  next_action: string;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
  deployment_attempt_count: number;
  deployment_result: string;
  bounded_preview_reference: string | null;
  next_action: string;
  required_after_successful_deployment_action: string;
  no_effect_results: Record<string, boolean>;
  cleanup_results: Record<string, boolean>;
};

let verifierReport: VerifierReport;

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function isValidDeploymentResult(value: string): boolean {
  return ["deployment_succeeded_preview_disabled", "deployment_failed", "deployment_aborted"].includes(
    value,
  );
}

test.beforeAll(() => {
  verifierReport = JSON.parse(
    execFileSync("node", [verifierPath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  ) as VerifierReport;
});

test.describe("Action 480 preview deployment retry execution", () => {
  test("documents and verifies the bounded aborted execution record", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain(
      "Action 480 was authorized to perform exactly one real non-production Netlify Deploy Preview",
    );
    expect(doc).toContain("Deployment result: `deployment_aborted`");
    expect(doc).toContain(remediationAction);
    expect(doc).toContain(successAction);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 479 approval and exact candidate identifiers", () => {
    const action479 = readJson<Action479Record>(action479RecordPath);
    const record = readJson<Action480Record>(recordPath);

    expect(action479.deployment_retry_decision).toBe("deployment_retry_approved_for_future_action");
    expect(action479.deployment_performed).toBe(false);
    expect(action479.preview_activated).toBe(false);
    expect(action479.production_changed).toBe(false);
    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(record.candidate_file_count).toBe(30);
    expect(verifierReport.checks.action479_approval).toBe(true);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("records isolated reconstruction abort and dirty-worktree exclusion", () => {
    const record = readJson<Action480Record>(recordPath);

    expect(record.candidate_reconstruction_result).toBe(
      "deployment_aborted_before_temp_candidate_creation",
    );
    expect(record.candidate_reconstruction_blockers).toContain(
      "action_473_full_candidate_ready_with_conditions_not_ready",
    );
    expect(record.candidate_reconstruction_blockers).toContain(
      "broad_dirty_worktree_excluded_from_deployment_source",
    );
    expect(record.isolated_source_directory_created).toBe(false);
    expect(record.isolated_source_validation_result).toBe(
      "not_completed_aborted_before_deployment",
    );
    expect(verifierReport.checks.reconstruction_abort).toBe(true);
  });

  test("preserves exact overlay metadata and records hashes not revalidated in isolated candidate", () => {
    const record = readJson<Action480Record>(recordPath);

    expect(record.changed_file_count).toBe(30);
    expect(record.changed_paths_exact_approved_set).toBe(true);
    expect(record.changed_file_hashes_exact).toBe("not_revalidated_in_isolated_candidate");
    expect(record.unexpected_changed_files).toBe(0);
    expect(record.unrelated_post_trade_changed_files).toBe(0);
    expect(record.environment_files).toBe(0);
    expect(record.secret_files).toBe(0);
    expect(record.merge_conflict_markers).toBe(0);
    expect(record.runtime_projection_call_sites).toBe(1);
  });

  test("does not start serial prechecks or temporary-candidate-sensitive checks after reconstruction abort", () => {
    const record = readJson<Action480Record>(recordPath);

    expect(record.pre_deployment_validation_result).toBe("deployment_aborted");
    expect(record.pre_deployment_validations_completed).toBe(false);
    expect(record.pre_deployment_blockers).toContain("exact_full_candidate_reconstruction_not_proven");
    expect(record.serial_validation_required).toBe(true);
    expect(record.serial_validation_started).toBe(false);
    expect(record.validation_commands_run_in_isolated_candidate).toEqual([]);
    expect(verifierReport.checks.serial_prechecks).toBe(true);
  });

  test("binds Netlify target without running another target status or deploy command", () => {
    const record = readJson<Action480Record>(recordPath);

    expect(record.netlify_site_name).toBe("trade-vl");
    expect(record.netlify_site_reference).toBe(siteReference);
    expect(record.netlify_team).toBe("Valentin Labs AB");
    expect(record.site_link_verified).toBe(true);
    expect(record.netlify_target_pre_deployment_status_verified).toBe(false);
    expect(record.netlify_cli_invoked).toBe(false);
    expect(record.netlify_api_invoked).toBe(false);
    expect(record.netlify_deploy_command_invoked).toBe(false);
    expect(record.netlify_deploy_prod_invoked).toBe(false);
    expect(verifierReport.checks.site_link_binding).toBe(true);
  });

  test("requires preview flag disabled and blocks all activation paths", () => {
    const record = readJson<Action480Record>(recordPath);

    expect(record.initial_preview_flag_name).toBe("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED");
    expect(record.initial_preview_flag_state).toBe("disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.production_preview_flag_enabled).toBe(false);
    expect(record.alternate_activation_alias_detected).toBe(false);
    expect(record.query_string_activation_allowed).toBe(false);
    expect(record.storage_or_cookie_activation_allowed).toBe(false);
    expect(record.automatic_activation_allowed).toBe(false);
    expect(verifierReport.checks.flag_disabled).toBe(true);
  });

  test("records result vocabulary, zero attempts, and no retry", () => {
    const record = readJson<Action480Record>(recordPath);

    expect(isValidDeploymentResult(record.deployment_result)).toBe(true);
    expect(record.deployment_result).toBe("deployment_aborted");
    expect(record.deployment_attempt_count).toBe(0);
    expect(record.maximum_deployment_attempt_count).toBe(1);
    expect(record.same_action_retry_performed).toBe(false);
    expect(record.preview_deployment_created).toBe(false);
    expect(verifierReport.deployment_attempt_count).toBe(0);
    expect(verifierReport.deployment_result).toBe("deployment_aborted");
  });

  test("keeps preview reference bounded and null because no deployment happened", () => {
    const record = readJson<Action480Record>(recordPath);

    expect(record.bounded_preview_reference).toBeNull();
    expect(record.bounded_preview_reference_policy).toContain("No preview reference was produced");
    expect(verifierReport.bounded_preview_reference).toBeNull();
    expect(verifierReport.checks.bounded_preview_reference).toBe(true);
  });

  test("keeps production, environment, preview activation, and downstream effects unchanged", () => {
    const record = readJson<Action480Record>(recordPath);

    expect(record.production_deployment_changed).toBe(false);
    expect(record.production_alias_changed).toBe(false);
    expect(record.environment_modified).toBe(false);
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
    expect(record.add_trade_changed).toBe(false);
    expect(record.risk_sizing_changed).toBe(false);
    expect(Object.values(verifierReport.no_effect_results).every(Boolean)).toBe(true);
  });

  test("records cleanup, no credential retention, and no secret evidence", () => {
    const record = readJson<Action480Record>(recordPath);

    expect(record.temporary_candidate_cleanup_result).toBe("not_created_no_cleanup_required");
    expect(record.temporary_candidate_absent_after_cleanup).toBe(true);
    expect(record.credential_value_recorded).toBe(false);
    expect(record.credential_files_inspected).toBe(false);
    expect(record.admin_url_recorded).toBe(false);
    expect(record.secret_bearing_url_recorded).toBe(false);
    expect(record.environment_value_recorded).toBe(false);
    expect(record.build_logs_retained).toBe(false);
    expect(Object.values(verifierReport.cleanup_results).every(Boolean)).toBe(true);
  });

  test("records runtime-state recommendation and failure-specific next action", () => {
    const record = readJson<Action480Record>(recordPath);

    expect(record.current_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.recommended_runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.success_runtime_preview_state).toBe("runtime_preview_deployed_preview_disabled");
    expect(record.runtime_preview_active_observation_only_authorized).toBe(false);
    expect(record.required_after_successful_deployment_action).toBe(successAction);
    expect(record.next_action).toBe(remediationAction);
    expect(verifierReport.next_action).toBe(remediationAction);
    expect(verifierReport.required_after_successful_deployment_action).toBe(successAction);
  });

  test("keeps Actions 478-479 healthy", () => {
    const action478 = JSON.parse(
      execFileSync("node", [action478VerifierPath], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 160 * 1024 * 1024,
      }),
    ) as { verification_status: string; failed_conditions: string[] };
    const action479 = JSON.parse(
      execFileSync("node", [action479VerifierPath], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 160 * 1024 * 1024,
      }),
    ) as { verification_status: string; failed_conditions: string[] };

    expect(action478.verification_status).toBe("passed");
    expect(action478.failed_conditions).toEqual([]);
    expect(action479.verification_status).toBe("passed");
    expect(action479.failed_conditions).toEqual([]);
  });
});
