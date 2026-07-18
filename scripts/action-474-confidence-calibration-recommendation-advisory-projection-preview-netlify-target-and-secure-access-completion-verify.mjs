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
  nextAction: "action_475_netlify_target_operator_input_completion_gate",
});

const paths = Object.freeze({
  doc:
    "docs/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-completion.md",
  record:
    "docs/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-record.json",
  action473Inventory:
    "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json",
  action473Netlify:
    "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-access-record.json",
  verifier:
    "scripts/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-completion-verify.mjs",
  test:
    "tests/e2e/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-completion.spec.ts",
});

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action473Inventory = exists(paths.action473Inventory)
  ? readJson(paths.action473Inventory)
  : {};
const action473Netlify = exists(paths.action473Netlify) ? readJson(paths.action473Netlify) : {};
const recordText = exists(paths.record) ? read(paths.record) : "";

const requiredUnresolvedFields = [
  "netlify_site_name",
  "non_secret_site_reference",
  "intended_ture_project_confirmed",
  "deploy_previews_supported",
  "production_alias_protected",
  "disabled_first_deployment_supported",
  "credential_available",
  "authentication_method_classification",
  "deployment_retry_gate_explicitly_approved",
];

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
  deployment_performed: record.deployment_performed === false,
  authentication_performed: record.authentication_performed === false,
  oauth_initiated: record.oauth_initiated === false,
  netlify_deployment_api_called: record.netlify_deployment_api_called === false,
  netlify_deployment_command_run: record.netlify_deployment_command_run === false,
  site_linked_or_relinked: record.site_linked_or_relinked === false,
  environment_modified: record.environment_modified === false,
  preview_flag_enabled: record.preview_flag_enabled === false,
  preview_activated: record.preview_activated === false,
  production_changed: record.production_changed === false,
  confidence_applied: record.confidence_applied === false,
  persistence_created: record.persistence_created === false,
  replay_executed: record.replay_executed === false,
  provider_call_executed: record.provider_call_executed === false,
  supabase_write_executed: record.supabase_write_executed === false,
  feedback_created: record.feedback_created === false,
  recommendation_mutated: record.recommendation_mutated === false,
  ranking_changed: record.ranking_changed === false,
  scanner_changed: record.scanner_changed === false,
};

const checks = {
  documentation_exists: exists(paths.doc),
  record_exists: exists(paths.record),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    includesAll(doc, [
      "## Candidate Binding",
      "No explicit operator-supplied Netlify site or secure-access values were provided",
      "Netlify target/access decision: `netlify_target_access_blocked`",
      expected.nextAction,
    ]),
  action473_binding:
    action473Inventory.repository_base_identifier === expected.base &&
    action473Inventory.approved_change_candidate_hash === expected.candidateHash &&
    action473Inventory.full_candidate_inventory_hash === expected.fullCandidateHash &&
    action473Inventory.overlaid_file_count === 30 &&
    action473Inventory.full_candidate_decision === "full_candidate_ready_with_conditions" &&
    action473Netlify.netlify_target_access_decision === "netlify_target_access_ready_with_conditions",
  record_schema:
    record.schema_version === "action_474_netlify_target_and_secure_access_record_v1" &&
    record.source_action === 473 &&
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullCandidateHash,
  unresolved_operator_inputs:
    record.operator_inputs_supplied === false &&
    record.netlify_site_name === null &&
    record.non_secret_site_reference === null &&
    record.intended_ture_project_confirmed === null &&
    record.deploy_previews_supported === null &&
    record.production_alias_protected === null &&
    record.disabled_first_deployment_supported === null &&
    record.credential_available === null &&
    record.authentication_method_classification === null &&
    record.deployment_retry_gate_explicitly_approved === null &&
    Array.isArray(record.unresolved_field_names) &&
    requiredUnresolvedFields.every((field) => record.unresolved_field_names.includes(field)) &&
    record.unresolved_field_names.length === requiredUnresolvedFields.length &&
    Array.isArray(record.invalid_field_names) &&
    record.invalid_field_names.length === 0,
  target_policy:
    record.environment_classification === "non_production_preview" &&
    record.production_unchanged_required === true &&
    record.initial_preview_flag_state === "disabled" &&
    record.secure_access_verification_result ===
      "blocked_missing_operator_target_and_access_inputs",
  credential_policy:
    record.credential_value_recorded === false &&
    !secretLikePatterns.some((pattern) => pattern.test(recordText)),
  decisions:
    record.netlify_target_access_decision === "netlify_target_access_blocked" &&
    record.overall_readiness === "blocked" &&
    record.next_action === expected.nextAction,
  runtime_state: record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
  no_side_effects: Object.values(noEffectResults).every(Boolean),
};

const recordHash = exists(paths.record) ? sha256(recordText) : null;
const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature:
    "netlify_target_and_secure_access_completion_no_deploy_no_auth_no_activation",
  clean_base_identifier: record.clean_base_identifier ?? null,
  approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
  full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
  action474_record_hash: recordHash,
  netlify_site_name: record.netlify_site_name ?? null,
  non_secret_site_reference: record.non_secret_site_reference ?? null,
  intended_ture_project_confirmed: record.intended_ture_project_confirmed ?? null,
  deploy_previews_supported: record.deploy_previews_supported ?? null,
  production_alias_protected: record.production_alias_protected ?? null,
  disabled_first_deployment_supported: record.disabled_first_deployment_supported ?? null,
  credential_available: record.credential_available ?? null,
  authentication_method_classification: record.authentication_method_classification ?? null,
  secure_access_verification_result: record.secure_access_verification_result ?? null,
  unresolved_field_names: record.unresolved_field_names ?? [],
  invalid_field_names: record.invalid_field_names ?? [],
  netlify_target_access_decision:
    record.netlify_target_access_decision ?? "netlify_target_access_blocked",
  overall_readiness: record.overall_readiness ?? "blocked",
  next_action: record.next_action ?? expected.nextAction,
  runtime_preview_state: record.runtime_preview_state ?? null,
  no_effect_results: noEffectResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
