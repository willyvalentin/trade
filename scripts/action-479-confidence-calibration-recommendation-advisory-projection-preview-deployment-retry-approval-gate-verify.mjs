#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const expected = Object.freeze({
  base: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  candidateHash: "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  fullCandidateHash: "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
  siteName: "trade-vl",
  siteReference: "2b582e03-ac97-4371-8051-558d9980fb94",
  team: "Valentin Labs AB",
  flagName: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  nextAction:
    "action_480_confidence_calibration_recommendation_advisory_projection_preview_deployment_retry_execution",
  afterSuccessAction: "action_481_preview_disabled_state_verification_and_activation_approval_gate",
});

const paths = Object.freeze({
  doc:
    "docs/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-gate.md",
  record:
    "docs/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-record.json",
  action478:
    "docs/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution-record.json",
  verifier:
    "scripts/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-gate-verify.mjs",
  test:
    "tests/e2e/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-gate.spec.ts",
});

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function deploymentDecisionFor(candidate) {
  if (candidate.clean_base_identifier !== expected.base) return "deployment_retry_not_approved";
  if (candidate.approved_change_candidate_hash !== expected.candidateHash) {
    return "deployment_retry_not_approved";
  }
  if (candidate.full_candidate_inventory_hash !== expected.fullCandidateHash) {
    return "deployment_retry_not_approved";
  }
  if (candidate.candidate_file_count !== 30) return "deployment_retry_not_approved";
  if (candidate.netlify_site_name !== expected.siteName) return "deployment_retry_not_approved";
  if (candidate.netlify_site_reference !== expected.siteReference) {
    return "deployment_retry_not_approved";
  }
  if (candidate.netlify_team !== expected.team) return "deployment_retry_not_approved";
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

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action478 = exists(paths.action478) ? readJson(paths.action478) : {};

const requiredPrechecks = [
  "exact_full_candidate_reconstruction",
  "candidate_inventory_hash_verification",
  "isolated_candidate_integrity_check",
  "git_diff_check_or_equivalent",
  "npx_next_typegen",
  "npx_tsc_no_emit",
  "npm_run_build",
  "npm_run_lint",
  "action_309_guard",
  "actions_459_479_verifiers_where_applicable",
  "action_461_preview_consumer_suite",
  "action_462_independent_preview_consumer_suite",
  "recommendation_detail_regression_suite",
  "projection_call_site_count_equals_1",
  "preview_flag_disabled",
  "site_link_matches_trade_vl",
  "site_reference_matches",
  "no_routes_added",
  "no_persistence_added",
  "no_replay_added",
  "no_provider_or_supabase_preview_integration",
  "no_feedback_added",
  "no_confidence_application",
  "no_downstream_recommendation_ranking_scanner_publication_execution_add_trade_risk_sizing_effect",
];

const requiredPostChecks = [
  "deployment_exists",
  "target_is_non_production",
  "site_remains_trade_vl",
  "production_alias_unchanged",
  "preview_flag_remains_disabled",
  "preview_not_active",
  "no_immediate_deployment_level_failure",
];

const forbiddenRecordPhrases = [
  "admin.netlify.com",
  "authorization:",
  "bearer ",
  "cookie:",
  "password:",
  "api_key:",
  "apikey:",
  "private_key:",
];

const noEffectResults = {
  deployment_performed: record.deployment_performed === false,
  deployment_api_called: record.deployment_api_called === false,
  environment_modified: record.environment_modified === false,
  preview_activated: record.preview_activated === false,
  production_changed: record.production_changed === false,
  credential_value_recorded: record.credential_value_recorded === false,
  credential_files_inspected: record.credential_files_inspected === false,
  confidence_applied: record.confidence_applied === false,
  feedback_created: record.feedback_created === false,
  recommendation_mutated: record.recommendation_mutated === false,
  ranking_changed: record.ranking_changed === false,
  scanner_changed: record.scanner_changed === false,
  publication_changed: record.publication_changed === false,
  execution_changed: record.execution_changed === false,
};

const computedDecision = deploymentDecisionFor(record);

const checks = {
  documentation_exists: exists(paths.doc),
  record_exists: exists(paths.record),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    includesAll(doc, [
      "Action 479 approves one future non-production Netlify Deploy Preview retry",
      "Action 478 Readiness Binding",
      "Deployment retry decision: `deployment_retry_approved_for_future_action`",
      expected.nextAction,
      expected.afterSuccessAction,
    ]),
  action478_ready:
    action478.linking_result === "linking_succeeded" &&
    action478.site_linking_decision === "linking_succeeded_verified" &&
    action478.netlify_target_access_decision === "netlify_target_access_ready" &&
    action478.overall_readiness === "ready" &&
    action478.linked_site_name === expected.siteName &&
    action478.linked_non_secret_site_reference === expected.siteReference &&
    action478.authenticated_team === expected.team &&
    action478.conflicting_link_detected === false &&
    action478.gitignore_change_result === "safe_linking_metadata_ignore_update" &&
    action478.netlify_directory_tracked === false &&
    action478.deployment_performed === false &&
    action478.environment_modified === false &&
    action478.preview_activated === false &&
    action478.production_changed === false,
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullCandidateHash &&
    record.candidate_file_count === 30 &&
    record.unexpected_candidate_files === 0 &&
    record.unrelated_post_trade_candidate_files === 0 &&
    record.secret_files === 0 &&
    record.environment_files === 0 &&
    record.runtime_projection_call_sites === 1,
  target_and_authentication:
    record.netlify_site_name === expected.siteName &&
    record.netlify_site_reference === expected.siteReference &&
    record.netlify_team === expected.team &&
    record.site_link_verified === true &&
    record.site_name_match === true &&
    record.site_reference_match === true &&
    record.conflicting_link_detected === false &&
    record.authentication_verified === true &&
    record.credential_value_recorded === false &&
    record.credential_files_inspected === false,
  deployment_source_policy:
    record.deployment_source_policy?.deterministic_reconstruction_required === true &&
    record.deployment_source_policy?.source_equivalent_to_action_473_full_repository_candidate ===
      true &&
    record.deployment_source_policy?.use_clean_base === true &&
    record.deployment_source_policy?.use_exact_approved_30_file_overlay === true &&
    record.deployment_source_policy?.copy_broad_dirty_worktree_authorized === false &&
    record.deployment_source_policy?.include_netlify_directory_contents_authorized === false &&
    record.deployment_source_policy?.include_env_files_authorized === false &&
    record.deployment_source_policy?.include_secret_files_authorized === false &&
    record.deployment_source_policy?.include_external_build_output_authorized === false &&
    record.deployment_source_policy?.include_unclassified_files_authorized === false &&
    record.deployment_source_policy?.exact_full_candidate_inventory_hash_required ===
      expected.fullCandidateHash,
  gitignore_treatment:
    record.gitignore_treatment?.classification === "safe_linking_metadata_ignore_update" &&
    record.gitignore_treatment?.runtime_behavior_changed === false &&
    record.gitignore_treatment?.netlify_metadata_tracking_prevented === true,
  disabled_first_policy:
    record.initial_preview_flag_name === expected.flagName &&
    record.initial_preview_flag_state === "disabled" &&
    record.initial_preview_flag_must_not_equal_true === true &&
    record.production_preview_flag_disabled === true &&
    record.alternate_flag_alias_authorized === false &&
    record.url_storage_cookie_activation_authorized === false &&
    record.automatic_activation_after_deployment_authorized === false,
  deployment_type_policy:
    record.deployment_type === "non_production_deploy_preview" &&
    record.production_deployment_authorized === false &&
    record.production_alias_update_authorized === false &&
    record.primary_domain_replacement_authorized === false &&
    record.new_site_creation_authorized === false &&
    record.site_relinking_authorized === false &&
    record.site_unlinking_authorized === false &&
    record.build_setting_change_authorized === false &&
    record.domain_setting_change_authorized === false &&
    record.environment_variable_activation_authorized === false,
  prechecks:
    Array.isArray(record.pre_deployment_checks) &&
    requiredPrechecks.every((check) => record.pre_deployment_checks.includes(check)) &&
    record.serial_pre_deployment_checks_required === true &&
    record.temp_path_sensitive_verification_serial === true,
  attempt_policy:
    record.deployment_attempt_limit === 1 &&
    record.same_action_retry_authorized === false &&
    record.failure_behavior?.on_precheck_failure === "abort_before_deployment" &&
    record.failure_behavior?.on_deployment_failure ===
      "record_deployment_failed_stop_keep_preview_inactive_require_new_approval" &&
    record.failure_behavior?.on_flag_enabled === "abort_before_deployment",
  evidence_boundary:
    record.deployment_evidence_boundary?.candidate_hash_permitted === true &&
    record.deployment_evidence_boundary?.bounded_non_secret_preview_reference_permitted === true &&
    record.deployment_evidence_boundary?.credentials_permitted === false &&
    record.deployment_evidence_boundary?.tokens_permitted === false &&
    record.deployment_evidence_boundary?.secret_bearing_urls_permitted === false &&
    record.deployment_evidence_boundary?.environment_values_permitted === false &&
    record.deployment_evidence_boundary?.recommendation_data_permitted === false &&
    record.deployment_evidence_boundary?.projection_data_permitted === false &&
    record.deployment_evidence_boundary?.confidence_values_permitted === false &&
    record.deployment_evidence_boundary?.advisory_data_permitted === false &&
    record.deployment_evidence_boundary?.secret_build_logs_permitted === false,
  post_deployment_boundary:
    Array.isArray(record.post_deployment_bounded_checks) &&
    requiredPostChecks.every((check) => record.post_deployment_bounded_checks.includes(check)) &&
    record.full_ui_verification_deferred === true,
  activation_separation:
    record.preview_activation_authorized_in_deployment_action === false &&
    record.activation_separated === true &&
    record.future_success_runtime_state === "runtime_preview_deployed_preview_disabled" &&
    record.future_active_runtime_state_authorized_by_action_480 === false &&
    record.required_after_successful_deployment_action === expected.afterSuccessAction,
  decision:
    record.deployment_retry_decision === "deployment_retry_approved_for_future_action" &&
    computedDecision === record.deployment_retry_decision &&
    record.next_action === expected.nextAction,
  runtime_state: record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
  no_secret_values: !forbiddenRecordPhrases.some((phrase) => recordText.toLowerCase().includes(phrase)),
  no_side_effects: Object.values(noEffectResults).every(Boolean),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature: "deployment_retry_approval_gate_no_deploy_no_activation",
  clean_base_identifier: record.clean_base_identifier ?? null,
  approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
  full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
  action478_record_hash: exists(paths.action478) ? sha256(read(paths.action478)) : null,
  action479_record_hash: exists(paths.record) ? sha256(recordText) : null,
  netlify_site_name: record.netlify_site_name ?? null,
  netlify_site_reference: record.netlify_site_reference ?? null,
  netlify_team: record.netlify_team ?? null,
  deployment_type: record.deployment_type ?? null,
  deployment_retry_decision: record.deployment_retry_decision ?? null,
  deployment_attempt_limit: record.deployment_attempt_limit ?? null,
  initial_preview_flag_state: record.initial_preview_flag_state ?? null,
  deployment_performed: record.deployment_performed ?? null,
  preview_activated: record.preview_activated ?? null,
  environment_modified: record.environment_modified ?? null,
  production_changed: record.production_changed ?? null,
  runtime_preview_state: record.runtime_preview_state ?? null,
  next_action: record.next_action ?? null,
  required_after_successful_deployment_action:
    record.required_after_successful_deployment_action ?? null,
  no_effect_results: noEffectResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
