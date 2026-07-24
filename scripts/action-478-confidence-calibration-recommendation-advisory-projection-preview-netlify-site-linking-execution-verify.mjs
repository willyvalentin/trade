#!/usr/bin/env node

import { execFileSync } from "child_process";
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
  nextAction:
    "action_479_confidence_calibration_recommendation_advisory_projection_preview_deployment_retry_approval_gate",
});

const paths = Object.freeze({
  doc:
    "docs/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution.md",
  record:
    "docs/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution-record.json",
  action477:
    "docs/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-record.json",
  verifier:
    "scripts/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution-verify.mjs",
  test:
    "tests/e2e/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution.spec.ts",
});

function runGit(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function classifyGitignoreDiff(diff) {
  if (!diff.trim()) return "safe_existing_ignore_rule_unchanged";

  const bodyLines = diff
    .split("\n")
    .filter((line) => !line.startsWith("diff --git "))
    .filter((line) => !line.startsWith("index "))
    .filter((line) => !line.startsWith("--- "))
    .filter((line) => !line.startsWith("+++ "))
    .filter((line) => !line.startsWith("@@"));

  const removedLines = bodyLines
    .filter((line) => line.startsWith("-"))
    .map((line) => line.slice(1));
  const addedLines = bodyLines
    .filter((line) => line.startsWith("+"))
    .map((line) => line.slice(1));
  const allowedAddedLines = ["", "# Local Netlify folder", ".netlify", ".netlify/"];

  if (removedLines.length > 0) return "blocked_unexpected_gitignore_change";
  if (addedLines.length === 0) return "blocked_unexpected_gitignore_change";
  if (!addedLines.every((line) => allowedAddedLines.includes(line))) {
    return "blocked_unexpected_gitignore_change";
  }
  if (!addedLines.includes(".netlify") && !addedLines.includes(".netlify/")) {
    return "blocked_unexpected_gitignore_change";
  }
  return "safe_linking_metadata_ignore_update";
}

function decisionFor(candidate) {
  if (candidate.linking_result !== "linking_succeeded") return "linking_failed_or_mismatched";
  if (candidate.linked_site_name !== expected.siteName) return "linking_failed_or_mismatched";
  if (candidate.linked_non_secret_site_reference !== expected.siteReference) {
    return "linking_failed_or_mismatched";
  }
  if (candidate.authenticated_team !== expected.team) return "linking_failed_or_mismatched";
  if (candidate.conflicting_link_detected !== false) return "linking_failed_or_mismatched";
  if (candidate.netlify_directory_tracked !== false) return "linking_failed_or_mismatched";
  if (candidate.gitignore_change_result === "blocked_unexpected_gitignore_change") {
    return "linking_failed_or_mismatched";
  }
  if (candidate.deployment_performed !== false) return "linking_failed_or_mismatched";
  if (candidate.environment_modified !== false) return "linking_failed_or_mismatched";
  if (candidate.preview_activated !== false) return "linking_failed_or_mismatched";
  if (candidate.production_changed !== false) return "linking_failed_or_mismatched";
  if (candidate.credential_value_recorded !== false) return "linking_failed_or_mismatched";
  if (candidate.gitignore_unrelated_change_detected) return "linking_succeeded_with_conditions";
  return "linking_succeeded_verified";
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action477 = exists(paths.action477) ? readJson(paths.action477) : {};
const gitignoreDiff = runGit(["diff", "--", ".gitignore"]);
const gitignoreDiffClassification = classifyGitignoreDiff(gitignoreDiff);
const trackedNetlifyFiles = runGit(["ls-files", ".netlify", ".netlify/*"])
  .split("\n")
  .filter(Boolean);
const gitignoreCheck = runGit(["check-ignore", ".netlify"]);
const localNetlifyMetadataExists = exists(".netlify");
const gitignoreHasNetlifyRule =
  gitignoreCheck === ".netlify" || gitignoreCheck.endsWith("/.netlify");
const safeGitignoreState =
  gitignoreDiffClassification === "safe_linking_metadata_ignore_update" ||
  (gitignoreDiffClassification === "safe_existing_ignore_rule_unchanged" &&
    gitignoreHasNetlifyRule);

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
  netlify_api_called_by_action_478:
    record.no_effect_flags?.netlify_api_called_by_action_478 === false,
  netlify_link_run_by_action_478:
    record.no_effect_flags?.netlify_link_run_by_action_478 === false,
  netlify_unlink_run_by_action_478:
    record.no_effect_flags?.netlify_unlink_run_by_action_478 === false,
  netlify_deploy_run_by_action_478:
    record.no_effect_flags?.netlify_deploy_run_by_action_478 === false,
  persistence_created: record.no_effect_flags?.persistence_created === false,
  replay_executed: record.no_effect_flags?.replay_executed === false,
  provider_call_executed: record.no_effect_flags?.provider_call_executed === false,
  supabase_write_executed: record.no_effect_flags?.supabase_write_executed === false,
  confidence_applied: record.no_effect_flags?.confidence_applied === false,
  feedback_created: record.no_effect_flags?.feedback_created === false,
  recommendation_mutated: record.no_effect_flags?.recommendation_mutated === false,
  ranking_changed: record.no_effect_flags?.ranking_changed === false,
  scanner_changed: record.no_effect_flags?.scanner_changed === false,
  publication_changed: record.no_effect_flags?.publication_changed === false,
  execution_changed: record.no_effect_flags?.execution_changed === false,
};

const computedDecision = decisionFor(record);

const checks = {
  documentation_exists: exists(paths.doc),
  record_exists: exists(paths.record),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    includesAll(doc, [
      "Action 478 records and independently verifies",
      "Action 477 Approval Binding",
      "Classification: `safe_linking_metadata_ignore_update`",
      "Site-linking decision: `linking_succeeded_verified`",
      expected.nextAction,
    ]),
  action477_approval:
    action477.linking_decision === "site_linking_approved_for_future_action" &&
    action477.future_linking_operation_classification === "exact_existing_site_id_link_only" &&
    action477.intended_site_name === expected.siteName &&
    action477.intended_non_secret_site_reference === expected.siteReference &&
    action477.authenticated_team === expected.team &&
    action477.deployment_performed === false &&
    action477.preview_activated === false &&
    action477.production_changed === false,
  candidate_hashes:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullCandidateHash &&
    record.approved_change_candidate_file_count === 30 &&
    record.original_candidate_hash_preserved === true,
  authentication_success:
    record.authentication_method_classification === "existing_authenticated_cli" &&
    record.credential_available === true &&
    record.credential_value_recorded === false &&
    record.credential_files_inspected === false &&
    record.authenticated_account_name === expected.accountName &&
    record.authenticated_account_email === expected.accountEmail &&
    record.authenticated_team === expected.team &&
    record.authentication_team_compatible_with_approval === true,
  exact_site_identity:
    record.linking_command_classification === "exact_existing_site_id_link" &&
    record.linking_attempt_count === 1 &&
    record.linking_result === "linking_succeeded" &&
    record.linked_site_name === expected.siteName &&
    record.linked_non_secret_site_reference === expected.siteReference &&
    record.site_name_match === true &&
    record.site_reference_match === true &&
    record.conflicting_link_detected === false,
  local_netlify_metadata:
    localNetlifyMetadataExists === true &&
    record.local_netlify_metadata_created === true &&
    record.local_netlify_metadata_contents_inspected === false &&
    record.netlify_directory_tracked === false &&
    record.netlify_directory_ignored === true &&
    record.netlify_directory_added_to_candidate === false &&
    trackedNetlifyFiles.length === 0 &&
    gitignoreHasNetlifyRule,
  gitignore_change:
    record.gitignore_modified_by_linking === true &&
    record.gitignore_change_result === "safe_linking_metadata_ignore_update" &&
    safeGitignoreState &&
    record.gitignore_candidate_classification ===
      "local_operational_metadata_only_excluded_from_deployed_application_candidate" &&
    record.gitignore_unrelated_change_detected === false &&
    record.gitignore_secret_bearing_path_exposed === false &&
    record.gitignore_prevents_local_netlify_metadata_tracking === true,
  no_deployment:
    record.deployment_performed === false &&
    record.netlify_deploy_run === false &&
    record.netlify_deploy_prod_run === false &&
    record.deployment_api_called === false &&
    record.preview_url_created_by_action === false &&
    record.build_deployed === false,
  no_environment_or_activation:
    record.environment_modified === false &&
    record.netlify_env_set_run === false &&
    record.environment_file_modified === false &&
    record.preview_activated === false &&
    record.production_changed === false &&
    record.production_alias_changed === false &&
    record.preview_flag_name === expected.flagName &&
    record.preview_flag_state === "disabled" &&
    record.preview_flag_enabled === false,
  decisions:
    record.site_linking_decision === "linking_succeeded_verified" &&
    computedDecision === record.site_linking_decision &&
    record.netlify_target_access_decision === "netlify_target_access_ready" &&
    record.overall_readiness === "ready" &&
    record.next_action === expected.nextAction,
  runtime_state: record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
  next_action_constraints:
    record.next_action_constraints?.approval_only === true &&
    record.next_action_constraints?.bind_verified_full_candidate === true &&
    record.next_action_constraints?.bind_verified_netlify_site_link === true &&
    record.next_action_constraints?.disabled_first_deployment === true &&
    record.next_action_constraints?.preview_activation_during_deployment_authorized === false,
  no_secret_values:
    record.admin_url_recorded === false &&
    !forbiddenRecordPhrases.some((phrase) => recordText.toLowerCase().includes(phrase)),
  no_side_effects: Object.values(noEffectResults).every(Boolean),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature: "site_linking_execution_verification_no_deploy_no_secret_values",
  clean_base_identifier: record.clean_base_identifier ?? null,
  approved_change_candidate_hash: record.approved_change_candidate_hash ?? null,
  full_candidate_inventory_hash: record.full_candidate_inventory_hash ?? null,
  action477_record_hash: exists(paths.action477) ? sha256(read(paths.action477)) : null,
  action478_record_hash: exists(paths.record) ? sha256(recordText) : null,
  authenticated_team: record.authenticated_team ?? null,
  linked_site_name: record.linked_site_name ?? null,
  linked_non_secret_site_reference: record.linked_non_secret_site_reference ?? null,
  linking_result: record.linking_result ?? null,
  site_linking_decision: record.site_linking_decision ?? null,
  netlify_target_access_decision: record.netlify_target_access_decision ?? null,
  overall_readiness: record.overall_readiness ?? null,
  gitignore_change_result: record.gitignore_change_result ?? null,
  gitignore_diff_classification: gitignoreDiffClassification,
  gitignore_live_state_accepted: safeGitignoreState,
  netlify_directory_tracked: record.netlify_directory_tracked ?? null,
  tracked_netlify_file_count: trackedNetlifyFiles.length,
  deployment_performed: record.deployment_performed ?? null,
  environment_modified: record.environment_modified ?? null,
  preview_activated: record.preview_activated ?? null,
  production_changed: record.production_changed ?? null,
  preview_flag_state: record.preview_flag_state ?? null,
  runtime_preview_state: record.runtime_preview_state ?? null,
  next_action: record.next_action ?? null,
  no_effect_results: noEffectResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
