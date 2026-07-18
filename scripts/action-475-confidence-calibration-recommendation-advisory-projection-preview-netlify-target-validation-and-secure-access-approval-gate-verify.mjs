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
  flagName: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  nextAction: "action_476_secure_netlify_authentication_completion",
});

const paths = Object.freeze({
  doc:
    "docs/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-approval-gate.md",
  record:
    "docs/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-record.json",
  action473:
    "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json",
  action474:
    "docs/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-record.json",
  verifier:
    "scripts/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-approval-gate-verify.mjs",
  test:
    "tests/e2e/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-approval-gate.spec.ts",
});

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function targetDecisionFor(candidate) {
  if (candidate.environment_classification !== "non_production_preview") return "netlify_target_blocked";
  if (candidate.intended_ture_project_confirmed !== true) return "netlify_target_blocked";
  if (candidate.deploy_previews_supported !== true) return "netlify_target_blocked";
  if (candidate.production_alias_protected !== true) return "netlify_target_blocked";
  if (candidate.production_unchanged_required !== true) return "netlify_target_blocked";
  if (candidate.disabled_first_deployment_supported !== true) return "netlify_target_blocked";
  if (candidate.credential_value_recorded !== false) return "netlify_target_blocked";
  if (candidate.credential_storage_authorized !== false) return "netlify_target_blocked";
  return "netlify_target_ready";
}

function authDecisionFor(candidate) {
  if (candidate.credential_available === true) return "secure_authentication_complete";
  if (
    candidate.credential_available === false &&
    candidate.authentication_method_classification === "secure_interactive_auth_required"
  ) {
    return "secure_authentication_required";
  }
  return "secure_authentication_blocked";
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action473 = exists(paths.action473) ? readJson(paths.action473) : {};
const action474 = exists(paths.action474) ? readJson(paths.action474) : {};

const secretLikePatterns = [
  /token\s*[:=]/i,
  /password\s*[:=]/i,
  /api[_-]?key\s*[:=]/i,
  /secret\s*[:=]/i,
  /cookie\s*[:=]/i,
  /private[_-]?key\s*[:=]/i,
  /netlify_auth_token/i,
];

const noEffectResults = {
  authentication_performed: record.authentication_performed === false,
  oauth_initiated: record.oauth_initiated === false,
  netlify_api_called: record.netlify_api_called === false,
  netlify_cli_authentication_run: record.netlify_cli_authentication_run === false,
  netlify_deploy_run: record.netlify_deploy_run === false,
  site_linked_or_relinked: record.site_linked_or_relinked === false,
  netlify_configuration_modified: record.netlify_configuration_modified === false,
  environment_modified: record.environment_modified === false,
  deployment_performed: record.deployment_performed === false,
  preview_activated: record.preview_activated === false,
  production_changed: record.production_changed === false,
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

const computedTargetDecision = targetDecisionFor(record);
const computedAuthDecision = authDecisionFor(record);
const computedReadiness =
  computedTargetDecision === "netlify_target_ready" &&
  computedAuthDecision === "secure_authentication_complete"
    ? "ready"
    : computedTargetDecision === "netlify_target_ready" &&
        computedAuthDecision === "secure_authentication_required"
      ? "ready_with_conditions"
      : "blocked";

const checks = {
  documentation_exists: exists(paths.doc),
  record_exists: exists(paths.record),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    includesAll(doc, [
      "## Candidate Binding",
      "Netlify site name: `trade-vl`",
      "Netlify target decision: `netlify_target_ready`",
      "Authentication completion decision: `secure_authentication_required`",
      expected.nextAction,
    ]),
  action473_binding:
    action473.repository_base_identifier === expected.base &&
    action473.approved_change_candidate_hash === expected.candidateHash &&
    action473.full_candidate_inventory_hash === expected.fullCandidateHash &&
    action473.approved_change_candidate_file_count === 30 &&
    action473.unexpected_changed_file_count === 0 &&
    action473.unrelated_post_trade_changed_file_count === 0 &&
    action473.secret_file_count === 0 &&
    action473.environment_file_count === 0,
  action474_binding:
    action474.netlify_target_access_decision === "netlify_target_access_blocked" &&
    action474.overall_readiness === "blocked" &&
    action474.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
  record_schema:
    record.schema_version ===
      "action_475_netlify_target_validation_and_secure_access_record_v1" &&
    record.source_action === 474 &&
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullCandidateHash,
  candidate_counts:
    record.approved_change_candidate_file_count === 30 &&
    record.unexpected_file_count === 0 &&
    record.unrelated_post_trade_file_count === 0 &&
    record.secret_file_count === 0 &&
    record.environment_file_count === 0,
  target_identity:
    record.netlify_site_name === expected.siteName &&
    record.non_secret_site_reference === expected.siteReference &&
    record.target_identifiers_source === "operator_supplied_bounded_non_secret_inputs" &&
    record.live_netlify_lookup_performed === false &&
    record.intended_ture_project_confirmed === true,
  deploy_preview_policy:
    record.environment_classification === "non_production_preview" &&
    record.deploy_previews_supported === true &&
    record.production_alias_protected === true &&
    record.production_unchanged_required === true &&
    record.disabled_first_deployment_supported === true &&
    record.future_deployment_must_remain_non_production === true &&
    record.future_deployment_must_remain_preview_only === true &&
    record.future_deployment_must_preserve_production_alias === true &&
    record.future_deployment_must_start_preview_disabled === true,
  preview_flag_policy:
    record.preview_flag_name === expected.flagName &&
    record.initial_preview_flag_state === "disabled" &&
    record.preview_flag_set_by_action_475 === false &&
    record.production_activation_authorized === false,
  credential_policy:
    record.credential_available === false &&
    record.authentication_method_classification === "secure_interactive_auth_required" &&
    record.credential_value_recorded === false &&
    record.credential_storage_authorized === false &&
    !secretLikePatterns.some((pattern) => pattern.test(recordText)),
  authentication_boundary:
    record.future_authentication_completion_boundary
      ?.may_invoke_supported_interactive_netlify_authentication_flow === true &&
    record.future_authentication_completion_boundary
      ?.may_confirm_authentication_success_without_exposing_values === true &&
    record.future_authentication_completion_boundary?.may_confirm_access_to_site_name ===
      expected.siteName &&
    record.future_authentication_completion_boundary?.must_not_store_tokens === true &&
    record.future_authentication_completion_boundary?.must_not_deploy === true &&
    record.future_authentication_completion_boundary?.must_not_activate_preview_flag === true,
  decisions:
    record.target_validation_result ===
      "operator_target_policy_validated_without_live_lookup" &&
    record.secure_access_validation_result ===
      "secure_interactive_authentication_required_before_deployment_retry" &&
    record.netlify_target_decision === "netlify_target_ready" &&
    record.authentication_completion_decision === "secure_authentication_required" &&
    record.overall_readiness === "ready_with_conditions" &&
    record.next_action === expected.nextAction &&
    computedTargetDecision === record.netlify_target_decision &&
    computedAuthDecision === record.authentication_completion_decision &&
    computedReadiness === record.overall_readiness,
  unresolved_conditions:
    Array.isArray(record.unresolved_field_names) &&
    record.unresolved_field_names.length === 1 &&
    record.unresolved_field_names[0] === "secure_interactive_authentication_completion" &&
    Array.isArray(record.invalid_field_names) &&
    record.invalid_field_names.length === 0,
  runtime_state: record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
  no_side_effects: Object.values(noEffectResults).every(Boolean),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature:
    "static_netlify_target_validation_and_secure_access_approval_gate_no_deploy_no_auth",
  clean_base_identifier: record.clean_base_identifier ?? null,
  approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
  full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
  action475_record_hash: exists(paths.record) ? sha256(recordText) : null,
  netlify_site_name: record.netlify_site_name ?? null,
  non_secret_site_reference: record.non_secret_site_reference ?? null,
  target_validation_result: record.target_validation_result ?? null,
  deploy_previews_supported: record.deploy_previews_supported ?? null,
  production_alias_protected: record.production_alias_protected ?? null,
  disabled_first_deployment_supported: record.disabled_first_deployment_supported ?? null,
  credential_available: record.credential_available ?? null,
  authentication_method_classification: record.authentication_method_classification ?? null,
  secure_access_validation_result: record.secure_access_validation_result ?? null,
  netlify_target_decision: record.netlify_target_decision ?? null,
  authentication_completion_decision: record.authentication_completion_decision ?? null,
  overall_readiness: record.overall_readiness ?? null,
  unresolved_field_names: record.unresolved_field_names ?? [],
  invalid_field_names: record.invalid_field_names ?? [],
  next_action: record.next_action ?? null,
  runtime_preview_state: record.runtime_preview_state ?? null,
  no_effect_results: noEffectResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
