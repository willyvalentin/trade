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
  accountName: "Willy Valentin",
  accountEmail: "willysimonsson@gmail.com",
  team: "Valentin Labs AB",
  flagName: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  nextAction: "action_478_netlify_site_linking_execution",
});

const paths = Object.freeze({
  doc:
    "docs/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-gate.md",
  record:
    "docs/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-record.json",
  action476:
    "docs/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-record.json",
  verifier:
    "scripts/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-gate-verify.mjs",
  test:
    "tests/e2e/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-gate.spec.ts",
});

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function linkingDecisionFor(candidate) {
  if (candidate.authentication_verification_result !== "authentication_succeeded") {
    return "site_linking_not_approved";
  }
  if (candidate.current_project_link_status !== "not_linked") return "site_linking_not_approved";
  if (candidate.conflicting_link_detected !== false) return "site_linking_not_approved";
  if (candidate.intended_site_name !== expected.siteName) return "site_linking_not_approved";
  if (candidate.intended_non_secret_site_reference !== expected.siteReference) {
    return "site_linking_not_approved";
  }
  if (candidate.authenticated_team !== expected.team) return "site_linking_not_approved";
  if (candidate.future_linking_command_boundary?.approved_site_id_argument !== expected.siteReference) {
    return "site_linking_not_approved";
  }
  if (candidate.future_linking_command_boundary?.interactive_site_selection_authorized !== false) {
    return "site_linking_not_approved";
  }
  if (candidate.future_linking_command_boundary?.new_site_creation_authorized !== false) {
    return "site_linking_not_approved";
  }
  if (candidate.deployment_authorized !== false) return "site_linking_not_approved";
  if (candidate.preview_activation_authorized !== false) return "site_linking_not_approved";
  if (candidate.production_change_authorized !== false) return "site_linking_not_approved";
  if (candidate.credential_value_recorded !== false) return "site_linking_not_approved";
  if (candidate.future_linking_command_boundary?.execution_syntax_requires_cli_confirmation_in_action_478) {
    return "site_linking_approved_for_future_action";
  }
  return "site_linking_approved_with_conditions";
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action476 = exists(paths.action476) ? readJson(paths.action476) : {};

const secretLikePatterns = [
  /token\s*[:=]/i,
  /password\s*[:=]/i,
  /api[_-]?key\s*[:=]/i,
  /secret\s*[:=]/i,
  /cookie\s*[:=]/i,
  /private[_-]?key\s*[:=]/i,
  /authorization\s*[:=]/i,
];

const noEffectResults = {
  linking_performed: record.linking_performed === false,
  unlinking_performed: record.unlinking_performed === false,
  deployment_performed: record.deployment_performed === false,
  preview_activated: record.preview_activated === false,
  environment_modified: record.environment_modified === false,
  production_changed: record.production_changed === false,
  credential_value_recorded_by_action_477: record.credential_value_recorded_by_action_477 === false,
  netlify_api_called: record.netlify_api_called === false,
  netlify_link_run: record.netlify_link_run === false,
  netlify_unlink_run: record.netlify_unlink_run === false,
  netlify_deploy_run: record.netlify_deploy_run === false,
  netlify_configuration_modified: record.netlify_configuration_modified === false,
  preview_flag_enabled: record.preview_flag_enabled === false,
  persistence_created: record.persistence_created === false,
  replay_executed: record.replay_executed === false,
  provider_call_executed: record.provider_call_executed === false,
  supabase_write_executed: record.supabase_write_executed === false,
  confidence_applied: record.confidence_applied === false,
  feedback_created: record.feedback_created === false,
  recommendation_mutated: record.recommendation_mutated === false,
  ranking_changed: record.ranking_changed === false,
  scanner_changed: record.scanner_changed === false,
  publication_changed: record.publication_changed === false,
  execution_changed: record.execution_changed === false,
};

const computedLinkingDecision = linkingDecisionFor(record);

const checks = {
  documentation_exists: exists(paths.doc),
  record_exists: exists(paths.record),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    includesAll(doc, [
      "## Future Command Boundary",
      "Linking decision: `site_linking_approved_for_future_action`",
      "Project link status: `not_linked`",
      expected.nextAction,
    ]),
  action476_binding:
    action476.authentication_verification_result === "authentication_succeeded" &&
    action476.authentication_method_classification === "existing_authenticated_cli" &&
    action476.credential_available === true &&
    action476.credential_value_recorded === false &&
    action476.authenticated_team === expected.team &&
    action476.project_link_status === "not_linked" &&
    action476.secure_authentication_decision === "secure_authentication_complete",
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullCandidateHash &&
    record.approved_change_candidate_file_count === 30,
  authentication_and_team:
    record.authentication_verification_result === "authentication_succeeded" &&
    record.authentication_method_classification === "existing_authenticated_cli" &&
    record.credential_available === true &&
    record.credential_value_recorded === false &&
    record.authenticated_account_name === expected.accountName &&
    record.authenticated_account_email === expected.accountEmail &&
    record.authenticated_team === expected.team,
  intended_site:
    record.intended_site_name === expected.siteName &&
    record.intended_non_secret_site_reference === expected.siteReference &&
    record.intended_ture_project_confirmed === true,
  current_link_state:
    record.current_project_link_status === "not_linked" &&
    record.conflicting_link_detected === false &&
    record.linked_site_name === null &&
    record.linked_non_secret_site_reference === null,
  no_new_site_policy:
    record.existing_site_required === true &&
    record.site_creation_authorized === false &&
    record.site_clone_authorized === false &&
    record.site_rename_authorized === false &&
    record.team_ownership_change_authorized === false,
  future_command_boundary:
    record.future_linking_operation_classification === "exact_existing_site_id_link_only" &&
    record.future_linking_command_boundary?.approved_cli_family === "netlify link" &&
    record.future_linking_command_boundary?.approved_site_id_argument === expected.siteReference &&
    record.future_linking_command_boundary?.approved_equivalent_command ===
      `netlify link --id ${expected.siteReference}` &&
    record.future_linking_command_boundary?.execution_syntax_requires_cli_confirmation_in_action_478 ===
      true &&
    record.future_linking_command_boundary?.interactive_site_selection_authorized === false &&
    record.future_linking_command_boundary?.site_name_only_linking_authorized === false &&
    record.future_linking_command_boundary?.new_site_creation_authorized === false &&
    record.future_linking_command_boundary?.relink_from_existing_site_authorized === false &&
    record.future_linking_command_boundary?.deployment_as_part_of_linking_authorized === false,
  post_link_checks:
    record.required_post_link_checks?.authenticated === true &&
    record.required_post_link_checks?.linked === true &&
    record.required_post_link_checks?.linked_site_name === expected.siteName &&
    record.required_post_link_checks?.linked_non_secret_site_reference === expected.siteReference &&
    record.required_post_link_checks?.site_name_match === true &&
    record.required_post_link_checks?.site_reference_match === true &&
    record.required_post_link_checks?.production_unchanged === true &&
    record.required_post_link_checks?.deployment_performed === false &&
    record.required_post_link_checks?.preview_activated === false &&
    record.required_post_link_checks?.environment_modified === false &&
    record.required_post_link_checks?.credential_values_exposed === false,
  local_metadata_policy:
    record.local_metadata_boundary?.normal_netlify_link_metadata_permitted === true &&
    record.local_metadata_boundary?.bounded_classification_only === true &&
    record.local_metadata_boundary?.commit_local_netlify_state_authorized === false &&
    record.local_metadata_boundary?.record_config_file_contents_authorized === false &&
    record.local_metadata_boundary?.record_auth_tokens_authorized === false &&
    record.local_metadata_boundary?.record_cookies_authorized === false &&
    record.local_metadata_boundary?.record_environment_values_authorized === false &&
    record.local_metadata_boundary?.record_account_secrets_authorized === false,
  credential_policy:
    record.credential_value_recorded === false &&
    record.credential_value_recorded_by_action_477 === false &&
    !secretLikePatterns.some((pattern) => pattern.test(recordText)),
  deployment_activation_production_policy:
    record.deployment_authorized === false &&
    record.preview_activation_authorized === false &&
    record.environment_modification_authorized === false &&
    record.production_change_authorized === false &&
    record.preview_flag_name === expected.flagName &&
    record.preview_flag_state === "disabled" &&
    record.preview_flag_enabled === false,
  failure_behavior:
    record.failure_behavior?.authentication_unavailable === "linking_aborted" &&
    record.failure_behavior?.already_linked_to_another_site === "linking_aborted" &&
    record.failure_behavior?.linking_requires_site_creation === "linking_aborted" &&
    record.failure_behavior?.credential_exposure_requested === "linking_aborted" &&
    record.failure_behavior?.post_link_status_mismatch === "linking_failed" &&
    record.failure_behavior?.same_action_relink_or_repair_attempt_authorized === false,
  decision:
    record.linking_decision === "site_linking_approved_for_future_action" &&
    computedLinkingDecision === record.linking_decision &&
    record.next_action === expected.nextAction,
  runtime_state: record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
  no_side_effects: Object.values(noEffectResults).every(Boolean),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature:
    "static_netlify_site_linking_approval_gate_no_link_no_deploy_no_secret_values",
  clean_base_identifier: record.clean_base_identifier ?? null,
  approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
  full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
  action477_record_hash: exists(paths.record) ? sha256(recordText) : null,
  authenticated_team: record.authenticated_team ?? null,
  intended_site_name: record.intended_site_name ?? null,
  intended_non_secret_site_reference: record.intended_non_secret_site_reference ?? null,
  current_project_link_status: record.current_project_link_status ?? null,
  conflicting_link_detected: record.conflicting_link_detected ?? null,
  future_linking_operation_classification:
    record.future_linking_operation_classification ?? null,
  linking_decision: record.linking_decision ?? null,
  linking_performed: record.linking_performed ?? null,
  deployment_performed: record.deployment_performed ?? null,
  preview_activated: record.preview_activated ?? null,
  production_changed: record.production_changed ?? null,
  runtime_preview_state: record.runtime_preview_state ?? null,
  next_action: record.next_action ?? null,
  no_effect_results: noEffectResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
