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
  successAction: "action_481_preview_disabled_state_verification_and_activation_approval_gate",
  remediationAction:
    "action_481_confidence_calibration_recommendation_advisory_projection_preview_deployment_retry_reconstruction_remediation_gate",
});

const paths = Object.freeze({
  doc:
    "docs/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution.md",
  record:
    "docs/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution-record.json",
  action479:
    "docs/action-479-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-approval-record.json",
  verifier:
    "scripts/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution-verify.mjs",
  test:
    "tests/e2e/action-480-confidence-calibration-recommendation-advisory-projection-preview-deployment-retry-execution.spec.ts",
});

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function validDeploymentResult(value) {
  return ["deployment_succeeded_preview_disabled", "deployment_failed", "deployment_aborted"].includes(
    value,
  );
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action479 = exists(paths.action479) ? readJson(paths.action479) : {};

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
  preview_deployment_created: record.preview_deployment_created === false,
  production_deployment_changed: record.production_deployment_changed === false,
  production_alias_changed: record.production_alias_changed === false,
  environment_modified: record.environment_modified === false,
  preview_activated: record.preview_activated === false,
  confidence_applied: record.confidence_applied === false,
  recommendation_mutated: record.recommendation_mutated === false,
  persistence_created: record.persistence_created === false,
  replay_created: record.replay_created === false,
  provider_call_executed: record.provider_call_executed === false,
  supabase_access_created: record.supabase_access_created === false,
  supabase_write_executed: record.supabase_write_executed === false,
  feedback_created: record.feedback_created === false,
  downstream_behavior_changed: record.downstream_behavior_changed === false,
  ranking_changed: record.ranking_changed === false,
  scanner_changed: record.scanner_changed === false,
  publication_changed: record.publication_changed === false,
  execution_changed: record.execution_changed === false,
  add_trade_changed: record.add_trade_changed === false,
  risk_sizing_changed: record.risk_sizing_changed === false,
};

const cleanupResults = {
  temporary_candidate_cleanup_result:
    record.temporary_candidate_cleanup_result === "not_created_no_cleanup_required",
  temporary_candidate_absent_after_cleanup: record.temporary_candidate_absent_after_cleanup === true,
  build_logs_retained: record.build_logs_retained === false,
  credential_value_recorded: record.credential_value_recorded === false,
  credential_files_inspected: record.credential_files_inspected === false,
  environment_value_recorded: record.environment_value_recorded === false,
};

const abortedConsistency =
  record.deployment_result === "deployment_aborted" &&
  record.deployment_attempt_count === 0 &&
  record.preview_deployment_created === false &&
  record.bounded_preview_reference === null &&
  record.post_deployment_disabled_verification_required === false &&
  record.next_action === expected.remediationAction;

const checks = {
  documentation_exists: exists(paths.doc),
  deployment_record_exists: exists(paths.record),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    includesAll(doc, [
      "Action 480 was authorized to perform exactly one real non-production Netlify Deploy Preview",
      "Deployment result: `deployment_aborted`",
      expected.remediationAction,
      expected.successAction,
    ]),
  action479_approval:
    action479.deployment_retry_decision === "deployment_retry_approved_for_future_action" &&
    action479.deployment_performed === false &&
    action479.preview_activated === false &&
    action479.production_changed === false &&
    action479.netlify_site_name === expected.siteName &&
    action479.netlify_site_reference === expected.siteReference &&
    action479.netlify_team === expected.team &&
    action479.deployment_attempt_limit === 1,
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullCandidateHash &&
    record.candidate_file_count === 30 &&
    record.changed_file_count === 30 &&
    record.changed_paths_exact_approved_set === true &&
    record.unexpected_changed_files === 0 &&
    record.unrelated_post_trade_changed_files === 0 &&
    record.environment_files === 0 &&
    record.secret_files === 0 &&
    record.merge_conflict_markers === 0 &&
    record.runtime_projection_call_sites === 1,
  reconstruction_abort:
    record.candidate_reconstruction_result === "deployment_aborted_before_temp_candidate_creation" &&
    Array.isArray(record.candidate_reconstruction_blockers) &&
    record.candidate_reconstruction_blockers.includes(
      "action_473_full_candidate_ready_with_conditions_not_ready",
    ) &&
    record.candidate_reconstruction_blockers.includes("broad_dirty_worktree_excluded_from_deployment_source") &&
    record.isolated_source_directory_created === false &&
    record.isolated_source_validation_result === "not_completed_aborted_before_deployment",
  serial_prechecks:
    record.pre_deployment_validation_result === "deployment_aborted" &&
    record.pre_deployment_validations_completed === false &&
    Array.isArray(record.pre_deployment_blockers) &&
    record.pre_deployment_blockers.includes("exact_full_candidate_reconstruction_not_proven") &&
    record.serial_validation_required === true &&
    record.serial_validation_started === false &&
    Array.isArray(record.validation_commands_run_in_isolated_candidate) &&
    record.validation_commands_run_in_isolated_candidate.length === 0,
  site_link_binding:
    record.netlify_site_name === expected.siteName &&
    record.netlify_site_reference === expected.siteReference &&
    record.netlify_team === expected.team &&
    record.site_link_verified === true &&
    record.site_link_verification_source === "action_478_verified_link_record" &&
    record.netlify_target_pre_deployment_status_verified === false,
  flag_disabled:
    record.initial_preview_flag_name === expected.flagName &&
    record.initial_preview_flag_state === "disabled" &&
    record.preview_flag_enabled === false &&
    record.production_preview_flag_enabled === false &&
    record.alternate_activation_alias_detected === false &&
    record.query_string_activation_allowed === false &&
    record.storage_or_cookie_activation_allowed === false &&
    record.automatic_activation_allowed === false,
  deployment_attempt_and_result:
    record.deployment_attempt_count === 0 &&
    record.maximum_deployment_attempt_count === 1 &&
    record.same_action_retry_performed === false &&
    validDeploymentResult(record.deployment_result) &&
    abortedConsistency,
  bounded_preview_reference:
    record.bounded_preview_reference === null &&
    typeof record.bounded_preview_reference_policy === "string" &&
    record.bounded_preview_reference_policy.includes("No preview reference was produced"),
  production_and_side_effects: Object.values(noEffectResults).every(Boolean),
  cleanup: Object.values(cleanupResults).every(Boolean),
  no_netlify_invocation:
    record.netlify_cli_invoked === false &&
    record.netlify_api_invoked === false &&
    record.netlify_deploy_command_invoked === false &&
    record.netlify_deploy_prod_invoked === false &&
    record.netlify_site_relinked === false &&
    record.netlify_site_unlinked === false &&
    record.netlify_configuration_modified === false,
  no_secret_values:
    record.admin_url_recorded === false &&
    record.secret_bearing_url_recorded === false &&
    !forbiddenRecordPhrases.some((phrase) => recordText.toLowerCase().includes(phrase)),
  runtime_state:
    record.current_runtime_preview_state === "runtime_preview_waiting_for_operator_inputs" &&
    record.recommended_runtime_preview_state === "runtime_preview_waiting_for_operator_inputs" &&
    record.success_runtime_preview_state === "runtime_preview_deployed_preview_disabled" &&
    record.runtime_preview_active_observation_only_authorized === false,
  next_action:
    record.required_after_successful_deployment_action === expected.successAction &&
    record.next_action === expected.remediationAction,
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature: "deployment_retry_execution_aborted_before_deploy_no_activation",
  clean_base_identifier: record.clean_base_identifier ?? null,
  approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
  full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
  action479_record_hash: exists(paths.action479) ? sha256(read(paths.action479)) : null,
  action480_record_hash: exists(paths.record) ? sha256(recordText) : null,
  netlify_site_name: record.netlify_site_name ?? null,
  netlify_site_reference: record.netlify_site_reference ?? null,
  deployment_type: record.deployment_type ?? null,
  candidate_reconstruction_result: record.candidate_reconstruction_result ?? null,
  pre_deployment_validation_result: record.pre_deployment_validation_result ?? null,
  deployment_attempt_count: record.deployment_attempt_count ?? null,
  deployment_result: record.deployment_result ?? null,
  preview_deployment_created: record.preview_deployment_created ?? null,
  bounded_preview_reference: record.bounded_preview_reference ?? null,
  production_deployment_changed: record.production_deployment_changed ?? null,
  environment_modified: record.environment_modified ?? null,
  preview_activated: record.preview_activated ?? null,
  temporary_candidate_cleanup_result: record.temporary_candidate_cleanup_result ?? null,
  current_runtime_preview_state: record.current_runtime_preview_state ?? null,
  recommended_runtime_preview_state: record.recommended_runtime_preview_state ?? null,
  next_action: record.next_action ?? null,
  required_after_successful_deployment_action:
    record.required_after_successful_deployment_action ?? null,
  no_effect_results: noEffectResults,
  cleanup_results: cleanupResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
