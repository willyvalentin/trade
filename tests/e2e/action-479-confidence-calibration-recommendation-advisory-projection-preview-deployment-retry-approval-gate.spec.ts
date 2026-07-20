import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-gate.md";
const recordPath =
  "docs/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-record.json";
const action478RecordPath =
  "docs/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution-record.json";
const verifierPath =
  "scripts/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-gate-verify.mjs";
const action477VerifierPath =
  "scripts/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-gate-verify.mjs";
const action478VerifierPath =
  "scripts/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution-verify.mjs";
const cleanBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";
const siteReference = "2b582e03-ac97-4371-8051-558d9980fb94";
const nextAction =
  "action_480_confidence_calibration_recommendation_advisory_projection_preview_deployment_retry_execution";
const afterSuccessAction = "action_481_preview_disabled_state_verification_and_activation_approval_gate";

test.setTimeout(300000);

type Action478Record = {
  linking_result: string;
  site_linking_decision: string;
  netlify_target_access_decision: string;
  overall_readiness: string;
  linked_site_name: string;
  linked_non_secret_site_reference: string;
  authenticated_team: string;
  conflicting_link_detected: boolean;
  gitignore_change_result: string;
  netlify_directory_tracked: boolean;
  deployment_performed: boolean;
  environment_modified: boolean;
  preview_activated: boolean;
  production_changed: boolean;
};

type Action479Record = {
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  candidate_file_count: number;
  unexpected_candidate_files: number;
  unrelated_post_trade_candidate_files: number;
  secret_files: number;
  environment_files: number;
  runtime_projection_call_sites: number;
  netlify_site_name: string;
  netlify_site_reference: string;
  netlify_team: string;
  site_link_verified: boolean;
  authentication_verified: boolean;
  credential_value_recorded: boolean;
  credential_files_inspected: boolean;
  production_alias_protected: boolean;
  deploy_preview_supported: boolean;
  disabled_first_deployment_supported: boolean;
  deployment_type: string;
  production_deployment_authorized: boolean;
  production_alias_update_authorized: boolean;
  new_site_creation_authorized: boolean;
  site_relinking_authorized: boolean;
  environment_variable_activation_authorized: boolean;
  initial_preview_flag_name: string;
  initial_preview_flag_state: string;
  initial_preview_flag_must_not_equal_true: boolean;
  production_preview_flag_disabled: boolean;
  alternate_flag_alias_authorized: boolean;
  url_storage_cookie_activation_authorized: boolean;
  automatic_activation_after_deployment_authorized: boolean;
  preview_activation_authorized_in_deployment_action: boolean;
  activation_separated: boolean;
  future_success_runtime_state: string;
  future_active_runtime_state_authorized_by_action_480: boolean;
  deployment_source_policy: Record<string, string | boolean>;
  gitignore_treatment: Record<string, string | boolean>;
  pre_deployment_checks: string[];
  serial_pre_deployment_checks_required: boolean;
  deployment_attempt_limit: number;
  same_action_retry_authorized: boolean;
  failure_behavior: Record<string, string>;
  deployment_evidence_boundary: Record<string, boolean>;
  post_deployment_bounded_checks: string[];
  full_ui_verification_deferred: boolean;
  rollback_and_kill_switch_ready: boolean;
  deployment_retry_decision: string;
  deployment_performed: boolean;
  deployment_api_called: boolean;
  environment_modified: boolean;
  preview_activated: boolean;
  production_changed: boolean;
  confidence_applied: boolean;
  feedback_created: boolean;
  recommendation_mutated: boolean;
  ranking_changed: boolean;
  scanner_changed: boolean;
  publication_changed: boolean;
  execution_changed: boolean;
  runtime_preview_state: string;
  next_action: string;
  required_after_successful_deployment_action: string;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
  deployment_retry_decision: string;
  deployment_attempt_limit: number;
  next_action: string;
  required_after_successful_deployment_action: string;
  no_effect_results: Record<string, boolean>;
};

let verifierReport: VerifierReport;

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function deploymentDecisionFor(candidate: Partial<Action479Record>): string {
  if (candidate.clean_base_identifier !== cleanBase) return "deployment_retry_not_approved";
  if (candidate.approved_change_candidate_hash !== candidateHash) {
    return "deployment_retry_not_approved";
  }
  if (candidate.full_candidate_inventory_hash !== fullCandidateHash) {
    return "deployment_retry_not_approved";
  }
  if (candidate.candidate_file_count !== 30) return "deployment_retry_not_approved";
  if (candidate.netlify_site_name !== "trade-vl") return "deployment_retry_not_approved";
  if (candidate.netlify_site_reference !== siteReference) return "deployment_retry_not_approved";
  if (candidate.netlify_team !== "Valentin Labs AB") return "deployment_retry_not_approved";
  if (candidate.site_link_verified !== true) return "deployment_retry_not_approved";
  if (candidate.authentication_verified !== true) return "deployment_retry_not_approved";
  if (candidate.initial_preview_flag_state !== "disabled") return "deployment_retry_not_approved";
  if (candidate.initial_preview_flag_must_not_equal_true !== true) {
    return "deployment_retry_not_approved";
  }
  if (candidate.deployment_type !== "non_production_deploy_preview") {
    return "deployment_retry_not_approved";
  }
  if (candidate.production_deployment_authorized !== false) return "deployment_retry_not_approved";
  if (candidate.preview_activation_authorized_in_deployment_action !== false) {
    return "deployment_retry_not_approved";
  }
  if (candidate.activation_separated !== true) return "deployment_retry_not_approved";
  if (candidate.deployment_attempt_limit !== 1) return "deployment_retry_not_approved";
  if (candidate.same_action_retry_authorized !== false) return "deployment_retry_not_approved";
  if (candidate.rollback_and_kill_switch_ready !== true) {
    return "deployment_retry_approved_with_conditions";
  }
  return "deployment_retry_approved_for_future_action";
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

test.describe("Action 479 preview deployment retry approval gate", () => {
  test("adds documentation, record, verifier, and focused test with passing verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain(
      "Action 479 approves one future non-production Netlify Deploy Preview retry",
    );
    expect(doc).toContain("Action 478 Readiness Binding");
    expect(doc).toContain("Deployment retry decision: `deployment_retry_approved_for_future_action`");
    expect(doc).toContain(nextAction);
    expect(doc).toContain(afterSuccessAction);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 478 ready result", () => {
    const action478 = readJson<Action478Record>(action478RecordPath);

    expect(action478.linking_result).toBe("linking_succeeded");
    expect(action478.site_linking_decision).toBe("linking_succeeded_verified");
    expect(action478.netlify_target_access_decision).toBe("netlify_target_access_ready");
    expect(action478.overall_readiness).toBe("ready");
    expect(action478.linked_site_name).toBe("trade-vl");
    expect(action478.linked_non_secret_site_reference).toBe(siteReference);
    expect(action478.authenticated_team).toBe("Valentin Labs AB");
    expect(action478.conflicting_link_detected).toBe(false);
    expect(action478.deployment_performed).toBe(false);
    expect(action478.environment_modified).toBe(false);
    expect(action478.preview_activated).toBe(false);
    expect(action478.production_changed).toBe(false);
    expect(verifierReport.checks.action478_ready).toBe(true);
  });

  test("freezes candidate hashes, file count, and projection call-site count", () => {
    const record = readJson<Action479Record>(recordPath);

    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(record.candidate_file_count).toBe(30);
    expect(record.unexpected_candidate_files).toBe(0);
    expect(record.unrelated_post_trade_candidate_files).toBe(0);
    expect(record.secret_files).toBe(0);
    expect(record.environment_files).toBe(0);
    expect(record.runtime_projection_call_sites).toBe(1);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("binds exact site link and authentication", () => {
    const record = readJson<Action479Record>(recordPath);

    expect(record.netlify_site_name).toBe("trade-vl");
    expect(record.netlify_site_reference).toBe(siteReference);
    expect(record.netlify_team).toBe("Valentin Labs AB");
    expect(record.site_link_verified).toBe(true);
    expect(record.authentication_verified).toBe(true);
    expect(record.credential_value_recorded).toBe(false);
    expect(record.credential_files_inspected).toBe(false);
    expect(record.production_alias_protected).toBe(true);
    expect(record.deploy_preview_supported).toBe(true);
    expect(record.disabled_first_deployment_supported).toBe(true);
    expect(verifierReport.checks.target_and_authentication).toBe(true);
  });

  test("freezes candidate reconstruction and dirty-worktree exclusion", () => {
    const record = readJson<Action479Record>(recordPath);
    const policy = record.deployment_source_policy;

    expect(policy.deterministic_reconstruction_required).toBe(true);
    expect(policy.source_equivalent_to_action_473_full_repository_candidate).toBe(true);
    expect(policy.use_clean_base).toBe(true);
    expect(policy.use_exact_approved_30_file_overlay).toBe(true);
    expect(policy.copy_broad_dirty_worktree_authorized).toBe(false);
    expect(policy.include_netlify_directory_contents_authorized).toBe(false);
    expect(policy.include_env_files_authorized).toBe(false);
    expect(policy.include_secret_files_authorized).toBe(false);
    expect(policy.include_external_build_output_authorized).toBe(false);
    expect(policy.include_unclassified_files_authorized).toBe(false);
    expect(policy.exact_full_candidate_inventory_hash_required).toBe(fullCandidateHash);
    expect(verifierReport.checks.deployment_source_policy).toBe(true);
  });

  test("carries bounded .gitignore handling and .netlify exclusion", () => {
    const record = readJson<Action479Record>(recordPath);

    expect(record.gitignore_treatment.classification).toBe("safe_linking_metadata_ignore_update");
    expect(record.gitignore_treatment.runtime_behavior_changed).toBe(false);
    expect(record.gitignore_treatment.netlify_metadata_tracking_prevented).toBe(true);
    expect(record.deployment_source_policy.include_netlify_directory_contents_authorized).toBe(false);
    expect(verifierReport.checks.gitignore_treatment).toBe(true);
  });

  test("requires disabled-first flag policy and rejects enabled preview deployment", () => {
    const record = readJson<Action479Record>(recordPath);

    expect(record.initial_preview_flag_name).toBe("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED");
    expect(record.initial_preview_flag_state).toBe("disabled");
    expect(record.initial_preview_flag_must_not_equal_true).toBe(true);
    expect(record.production_preview_flag_disabled).toBe(true);
    expect(record.alternate_flag_alias_authorized).toBe(false);
    expect(record.url_storage_cookie_activation_authorized).toBe(false);
    expect(record.automatic_activation_after_deployment_authorized).toBe(false);
    expect(deploymentDecisionFor({ ...record, initial_preview_flag_state: "true" })).toBe(
      "deployment_retry_not_approved",
    );
    expect(verifierReport.checks.disabled_first_policy).toBe(true);
  });

  test("rejects production deployment and freezes exact Deploy Preview policy", () => {
    const record = readJson<Action479Record>(recordPath);

    expect(record.deployment_type).toBe("non_production_deploy_preview");
    expect(record.production_deployment_authorized).toBe(false);
    expect(record.production_alias_update_authorized).toBe(false);
    expect(record.new_site_creation_authorized).toBe(false);
    expect(record.site_relinking_authorized).toBe(false);
    expect(record.environment_variable_activation_authorized).toBe(false);
    expect(deploymentDecisionFor({ ...record, deployment_type: "production" })).toBe(
      "deployment_retry_not_approved",
    );
    expect(deploymentDecisionFor({ ...record, production_deployment_authorized: true })).toBe(
      "deployment_retry_not_approved",
    );
    expect(verifierReport.checks.deployment_type_policy).toBe(true);
  });

  test("requires serial prechecks and downstream no-effect checks", () => {
    const record = readJson<Action479Record>(recordPath);

    expect(record.pre_deployment_checks).toContain("exact_full_candidate_reconstruction");
    expect(record.pre_deployment_checks).toContain("npx_next_typegen");
    expect(record.pre_deployment_checks).toContain("npx_tsc_no_emit");
    expect(record.pre_deployment_checks).toContain("npm_run_build");
    expect(record.pre_deployment_checks).toContain("npm_run_lint");
    expect(record.pre_deployment_checks).toContain("action_309_guard");
    expect(record.pre_deployment_checks).toContain("projection_call_site_count_equals_1");
    expect(record.pre_deployment_checks).toContain("no_routes_added");
    expect(record.pre_deployment_checks).toContain("no_persistence_added");
    expect(record.pre_deployment_checks).toContain("no_replay_added");
    expect(record.pre_deployment_checks).toContain("no_confidence_application");
    expect(record.serial_pre_deployment_checks_required).toBe(true);
    expect(verifierReport.checks.prechecks).toBe(true);
  });

  test("freezes one-attempt policy and no same-action retry", () => {
    const record = readJson<Action479Record>(recordPath);

    expect(record.deployment_attempt_limit).toBe(1);
    expect(record.same_action_retry_authorized).toBe(false);
    expect(record.failure_behavior.on_precheck_failure).toBe("abort_before_deployment");
    expect(record.failure_behavior.on_deployment_failure).toBe(
      "record_deployment_failed_stop_keep_preview_inactive_require_new_approval",
    );
    expect(deploymentDecisionFor({ ...record, deployment_attempt_limit: 2 })).toBe(
      "deployment_retry_not_approved",
    );
    expect(deploymentDecisionFor({ ...record, same_action_retry_authorized: true })).toBe(
      "deployment_retry_not_approved",
    );
    expect(verifierReport.checks.attempt_policy).toBe(true);
  });

  test("bounds deployment evidence and excludes sensitive/runtime data", () => {
    const record = readJson<Action479Record>(recordPath);
    const boundary = record.deployment_evidence_boundary;

    expect(boundary.candidate_hash_permitted).toBe(true);
    expect(boundary.bounded_non_secret_preview_reference_permitted).toBe(true);
    expect(boundary.credentials_permitted).toBe(false);
    expect(boundary.tokens_permitted).toBe(false);
    expect(boundary.secret_bearing_urls_permitted).toBe(false);
    expect(boundary.environment_values_permitted).toBe(false);
    expect(boundary.recommendation_data_permitted).toBe(false);
    expect(boundary.projection_data_permitted).toBe(false);
    expect(boundary.confidence_values_permitted).toBe(false);
    expect(boundary.advisory_data_permitted).toBe(false);
    expect(boundary.secret_build_logs_permitted).toBe(false);
    expect(verifierReport.checks.evidence_boundary).toBe(true);
  });

  test("separates deployment from activation and requires later Action 481", () => {
    const record = readJson<Action479Record>(recordPath);

    expect(record.preview_activation_authorized_in_deployment_action).toBe(false);
    expect(record.activation_separated).toBe(true);
    expect(record.future_success_runtime_state).toBe("runtime_preview_deployed_preview_disabled");
    expect(record.future_active_runtime_state_authorized_by_action_480).toBe(false);
    expect(record.post_deployment_bounded_checks).toContain("preview_flag_remains_disabled");
    expect(record.post_deployment_bounded_checks).toContain("preview_not_active");
    expect(record.full_ui_verification_deferred).toBe(true);
    expect(record.required_after_successful_deployment_action).toBe(afterSuccessAction);
    expect(verifierReport.checks.activation_separation).toBe(true);
    expect(verifierReport.checks.post_deployment_boundary).toBe(true);
  });

  test("approves mandatory Action 480 only and keeps runtime preview waiting", () => {
    const record = readJson<Action479Record>(recordPath);

    expect(record.deployment_retry_decision).toBe("deployment_retry_approved_for_future_action");
    expect(deploymentDecisionFor(record)).toBe("deployment_retry_approved_for_future_action");
    expect(deploymentDecisionFor({ ...record, rollback_and_kill_switch_ready: false })).toBe(
      "deployment_retry_approved_with_conditions",
    );
    expect(record.next_action).toBe(nextAction);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.deployment_retry_decision).toBe(
      "deployment_retry_approved_for_future_action",
    );
    expect(verifierReport.next_action).toBe(nextAction);
    expect(verifierReport.required_after_successful_deployment_action).toBe(afterSuccessAction);
  });

  test("confirms no deployment, activation, environment modification, or downstream mutation", () => {
    const record = readJson<Action479Record>(recordPath);

    expect(record.deployment_performed).toBe(false);
    expect(record.deployment_api_called).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.production_changed).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.recommendation_mutated).toBe(false);
    expect(record.ranking_changed).toBe(false);
    expect(record.scanner_changed).toBe(false);
    expect(record.publication_changed).toBe(false);
    expect(record.execution_changed).toBe(false);
    expect(Object.values(verifierReport.no_effect_results).every(Boolean)).toBe(true);
    expect(verifierReport.checks.no_side_effects).toBe(true);
  });

  test("keeps Actions 477-478 healthy", () => {
    const action477 = JSON.parse(
      execFileSync("node", [action477VerifierPath], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 160 * 1024 * 1024,
      }),
    ) as { verification_status: string; failed_conditions: string[] };
    const action478 = JSON.parse(
      execFileSync("node", [action478VerifierPath], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 160 * 1024 * 1024,
      }),
    ) as { verification_status: string; failed_conditions: string[] };

    expect(action477.verification_status).toBe("passed");
    expect(action477.failed_conditions).toEqual([]);
    expect(action478.verification_status).toBe("passed");
    expect(action478.failed_conditions).toEqual([]);
  });
});
