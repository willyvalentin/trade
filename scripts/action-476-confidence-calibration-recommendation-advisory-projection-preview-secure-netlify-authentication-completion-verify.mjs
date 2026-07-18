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
  nextAction: "action_477_netlify_site_linking_approval_gate",
});

const paths = Object.freeze({
  doc:
    "docs/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-completion.md",
  record:
    "docs/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-record.json",
  action475:
    "docs/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-record.json",
  verifier:
    "scripts/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-completion-verify.mjs",
  test:
    "tests/e2e/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-completion.spec.ts",
});

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action475 = exists(paths.action475) ? readJson(paths.action475) : {};

const secretLikePatterns = [
  /token\s*[:=]/i,
  /password\s*[:=]/i,
  /api[_-]?key\s*[:=]/i,
  /secret\s*[:=]/i,
  /cookie\s*[:=]/i,
  /private[_-]?key\s*[:=]/i,
  /authorization\s*[:=]/i,
  /netlify_auth_token/i,
];

const noEffectResults = {
  deployment_performed: record.deployment_performed === false,
  site_linking_performed: record.site_linking_performed === false,
  environment_modified: record.environment_modified === false,
  preview_activated: record.preview_activated === false,
  production_changed: record.production_changed === false,
  netlify_link_run: record.netlify_link_run === false,
  netlify_deploy_run: record.netlify_deploy_run === false,
  netlify_deployment_api_called: record.netlify_deployment_api_called === false,
  oauth_initiated_by_action: record.oauth_initiated_by_action === false,
  netlify_config_contents_inspected: record.netlify_config_contents_inspected === false,
  netlify_cli_credential_added: record.netlify_cli_credential_added === false,
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

const checks = {
  documentation_exists: exists(paths.doc),
  record_exists: exists(paths.record),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    includesAll(doc, [
      "## Authentication Result",
      "Authentication method classification: `existing_authenticated_cli`",
      "Project link status: `not_linked`",
      "Secure authentication decision: `secure_authentication_complete`",
      expected.nextAction,
    ]),
  action475_binding:
    action475.netlify_site_name === expected.siteName &&
    action475.non_secret_site_reference === expected.siteReference &&
    action475.netlify_target_decision === "netlify_target_ready" &&
    action475.authentication_completion_decision === "secure_authentication_required" &&
    action475.overall_readiness === "ready_with_conditions",
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullCandidateHash,
  intended_target:
    record.intended_site_name === expected.siteName &&
    record.intended_non_secret_site_reference === expected.siteReference,
  authentication_result:
    record.authentication_method_classification === "existing_authenticated_cli" &&
    record.credential_available === true &&
    record.credential_value_recorded === false &&
    record.credential_storage_modified_by_action === false &&
    record.authentication_verification_result === "authentication_succeeded" &&
    record.authentication_result_source === "operator_supplied_bounded_netlify_cli_status" &&
    record.live_netlify_command_run_by_action_476 === false,
  account_team:
    record.authenticated_account_name === expected.accountName &&
    record.authenticated_account_email === expected.accountEmail &&
    record.authenticated_team === expected.team,
  project_link_status:
    record.project_link_status === "not_linked" &&
    record.linked_site_name === null &&
    record.linked_non_secret_site_reference === null &&
    record.site_name_match === null &&
    record.site_reference_match === null,
  preview_flag:
    record.preview_flag_name === expected.flagName && record.preview_flag_state === "disabled",
  credential_policy:
    record.credential_value_recorded === false &&
    record.credential_storage_modified_by_action === false &&
    record.netlify_config_contents_inspected === false &&
    record.netlify_cli_credential_added === false &&
    !secretLikePatterns.some((pattern) => pattern.test(recordText)),
  decisions:
    record.secure_authentication_decision === "secure_authentication_complete" &&
    record.netlify_target_access_decision === "netlify_target_access_ready_with_conditions" &&
    record.overall_readiness === "ready_with_conditions" &&
    Array.isArray(record.unresolved_conditions) &&
    record.unresolved_conditions.length === 1 &&
    record.unresolved_conditions[0] === "local_project_requires_approved_site_linking" &&
    Array.isArray(record.invalid_conditions) &&
    record.invalid_conditions.length === 0 &&
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
    "secure_netlify_authentication_completion_record_no_deploy_no_link_no_secret_values",
  clean_base_identifier: record.clean_base_identifier ?? null,
  approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
  full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
  action476_record_hash: exists(paths.record) ? sha256(recordText) : null,
  intended_site_name: record.intended_site_name ?? null,
  intended_non_secret_site_reference: record.intended_non_secret_site_reference ?? null,
  authentication_method_classification: record.authentication_method_classification ?? null,
  credential_available: record.credential_available ?? null,
  credential_value_recorded: record.credential_value_recorded ?? null,
  authentication_verification_result: record.authentication_verification_result ?? null,
  authenticated_account_name: record.authenticated_account_name ?? null,
  authenticated_account_email: record.authenticated_account_email ?? null,
  authenticated_team: record.authenticated_team ?? null,
  project_link_status: record.project_link_status ?? null,
  secure_authentication_decision: record.secure_authentication_decision ?? null,
  netlify_target_access_decision: record.netlify_target_access_decision ?? null,
  overall_readiness: record.overall_readiness ?? null,
  unresolved_conditions: record.unresolved_conditions ?? [],
  next_action: record.next_action ?? null,
  runtime_preview_state: record.runtime_preview_state ?? null,
  no_effect_results: noEffectResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
