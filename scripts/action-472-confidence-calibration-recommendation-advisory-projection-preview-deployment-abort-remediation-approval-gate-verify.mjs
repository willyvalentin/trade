#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));

const expected = Object.freeze({
  hash: "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  fileCount: 30,
  flag: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  nextAction: "action_473_preview_full_candidate_construction_and_netlify_target_access_completion",
});

const paths = Object.freeze({
  doc:
    "docs/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-gate.md",
  record:
    "docs/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-record.json",
  action471Record:
    "docs/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-record.json",
  verifier:
    "scripts/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-gate-verify.mjs",
  test:
    "tests/e2e/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-gate.spec.ts",
});

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function arrayIncludesAll(array, values) {
  return Array.isArray(array) && values.every((value) => array.includes(value));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action471 = exists(paths.action471Record) ? readJson(paths.action471Record) : {};

const noEffectResults = {
  deployment_performed: record.deployment_performed === false,
  preview_activated: record.preview_activated === false,
  environment_modified: record.environment_modified === false,
  netlify_cli_invoked: record.netlify_cli_invoked === false,
  netlify_api_invoked: record.netlify_api_invoked === false,
  credential_accessed: record.credential_accessed === false,
  credential_recorded: record.credential_recorded === false,
  provider_call_executed: record.provider_call_executed === false,
  supabase_write_executed: record.supabase_write_executed === false,
  replay_executed: record.replay_executed === false,
  persistence_added: record.persistence_added === false,
  feedback_created: record.feedback_created === false,
  confidence_applied: record.confidence_applied === false,
  recommendation_mutated: record.recommendation_mutated === false,
  ranking_changed: record.ranking_changed === false,
  scanner_changed: record.scanner_changed === false,
  publication_changed: record.publication_changed === false,
  execution_changed: record.execution_changed === false,
  add_trade_changed: record.add_trade_changed === false,
  risk_sizing_changed: record.risk_sizing_changed === false,
};

const requiredAbortBlockers = [
  "isolated_deployment_source_not_proven_from_current_dirty_worktree",
  "netlify_preview_target_access_not_available_without_secret_or_network_step",
  "deployment_credentials_not_verified_before_deployment_begin",
];

const requiredConstructionSteps = [
  "create_temporary_full_repository_candidate_outside_active_worktree_from_verified_clean_base",
  "apply_exactly_approved_30_candidate_file_contents",
  "verify_no_other_changed_files_are_introduced",
  "run_full_build_and_verification_suite_serially_in_temporary_candidate",
  "compute_full_candidate_inventory_hash",
  "remove_temporary_candidate_after_verification_unless_separately_approved_for_deployment_execution",
];

const requiredBuildChecks = [
  "npx next typegen",
  "npx tsc --noEmit",
  "npm run build",
  "npm run lint",
  "Action 309 guard",
  "Actions 459-472 verifiers where applicable",
  "exact runtime projection call-site count equals 1",
  "preview flag disabled",
  "no route",
  "no persistence",
  "no replay",
  "no provider or Supabase integration",
  "no confidence application",
  "no downstream behavior change",
];

const requiredStopConditions = [
  "clean_repository_base_cannot_be_identified",
  "full_candidate_cannot_be_constructed_without_unrelated_work",
  "candidate_file_hash_differs",
  "build_fails",
  "secret_or_environment_file_appears",
  "netlify_target_remains_ambiguous",
  "target_may_alter_production",
  "credential_access_unavailable",
  "preview_would_deploy_enabled",
  "deployment_and_activation_cannot_remain_separate",
];

const checks = {
  documentation_exists: exists(paths.doc),
  approval_record_exists: exists(paths.record),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    includesAll(doc, [
      "## Repository-Base Problem",
      "## Approved Full-Candidate Construction Policy",
      "## Netlify Site-Association Policy",
      "Decision: `approved_with_conditions`",
      expected.nextAction,
    ]),
  record_schema:
    record.schema_version ===
      "action_472_preview_deployment_abort_remediation_approval_record_v1" &&
    record.source_action === 471 &&
    record.approval_action === 472,
  action471_abort_result:
    action471.deployment_result === "deployment_aborted" &&
    action471.deployment_attempt_count === 0 &&
    action471.candidate_inventory_hash === expected.hash &&
    action471.candidate_file_count === expected.fileCount &&
    action471.preview_activated === false &&
    action471.confidence_applied === false &&
    arrayIncludesAll(action471.pre_deployment_blockers, requiredAbortBlockers),
  terminology:
    record.approved_change_candidate?.candidate_hash === expected.hash &&
    record.approved_change_candidate?.candidate_file_count === expected.fileCount &&
    record.approved_change_candidate?.complete_deployment_source === false &&
    record.repository_base?.exact_base_identifier_required === true &&
    record.full_isolated_deployment_candidate?.construction_approved_for_future_action === true,
  clean_base_policy:
    record.repository_base?.exact_base_identifier === null &&
    record.repository_base?.clean_base_verified === false &&
    record.repository_base?.package_manifest_required === true &&
    record.repository_base?.lockfile_required === true &&
    record.repository_base?.unclassified_local_modifications_allowed === false,
  full_candidate_construction_policy:
    arrayIncludesAll(record.approved_construction_method, requiredConstructionSteps) &&
    record.full_isolated_deployment_candidate?.temporary_workspace_required === true &&
    record.full_isolated_deployment_candidate?.outside_active_worktree_required === true &&
    record.full_isolated_deployment_candidate?.dirty_worktree_deployment_allowed === false,
  candidate_application_rules:
    record.candidate_application_policy?.path_set_must_match_action_466 === true &&
    record.candidate_application_policy?.candidate_content_hashes_must_match === true &&
    record.candidate_application_policy?.unrelated_post_trade_files_allowed === false &&
    record.candidate_application_policy?.environment_files_allowed === false &&
    record.candidate_application_policy?.secret_files_allowed === false &&
    record.candidate_application_policy?.mismatch_blocks_readiness === true,
  inventory_hash_policy:
    record.full_candidate_inventory_contract?.future_artifact ===
      "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json" &&
    record.full_candidate_inventory_contract?.full_candidate_inventory_hash_required === true &&
    record.full_candidate_inventory_contract?.deployment_performed === false &&
    record.full_candidate_inventory_contract?.preview_activated === false &&
    record.full_candidate_hash_policy?.deterministic === true &&
    record.full_candidate_hash_policy?.exclude_credentials === true &&
    record.full_candidate_hash_policy?.exclude_environment_values === true,
  buildability_requirements:
    arrayIncludesAll(record.buildability_requirements, requiredBuildChecks) &&
    record.serial_check_policy?.temp_path_sensitive_checks_must_run_serially === true,
  netlify_target_policy:
    record.netlify_target_policy?.site_association_required === true &&
    record.netlify_target_policy?.site_association_verified === false &&
    record.netlify_target_policy?.target_must_be_non_production === true &&
    record.netlify_target_policy?.production_alias_replacement_allowed === false &&
    record.netlify_target_policy?.preview_flag_must_remain_disabled === true,
  credential_policy:
    record.credential_availability_policy?.credential_available === false &&
    record.credential_availability_policy?.verification_result === "conditional" &&
    record.credential_availability_policy?.credential_values_allowed_in_artifacts === false,
  user_action_boundary:
    arrayIncludesAll(record.user_action_boundary, [
      "confirm_intended_netlify_site_or_project",
      "confirm_site_is_correct_ture_non_production_target",
      "authenticate_through_supported_secure_mechanism_if_needed",
      "confirm_no_production_deploy_alias_will_change",
    ]),
  codex_action_boundary:
    arrayIncludesAll(record.codex_action_boundary, [
      "create_static_documentation",
      "create_static_approval_record",
      "create_local_verifier",
      "create_focused_tests",
      "do_not_deploy",
      "do_not_authenticate",
      "do_not_modify_environment",
    ]),
  feature_flag_policy:
    record.preview_flag_policy?.flag_name === expected.flag &&
    record.preview_flag_policy?.current_state === "disabled" &&
    record.preview_flag_policy?.action_472_changes_flag === false &&
    record.preview_flag_policy?.activation_requires_later_separate_action === true,
  production_and_separation:
    record.production_policy?.production_deployment_allowed === false &&
    record.production_policy?.production_activation_allowed === false &&
    record.deployment_activation_separation?.deployment_allowed_in_action_472 === false &&
    record.deployment_activation_separation?.activation_allowed_in_action_472 === false &&
    record.deployment_activation_separation?.future_deployment_must_be_disabled === true,
  stop_conditions: arrayIncludesAll(record.stop_conditions, requiredStopConditions),
  approval_decision:
    record.approval_decision === "approved_with_conditions" &&
    arrayIncludesAll(record.passed_conditions, [
      "construction_policy_sound",
      "change_candidate_exactly_bound",
      "inventory_hash_contract_defined",
      "buildability_procedure_defined",
      "deployment_activation_separation_preserved",
      "no_deployment_or_activation_performed",
    ]) &&
    Array.isArray(record.failed_conditions) &&
    record.failed_conditions.length === 0 &&
    arrayIncludesAll(record.unresolved_conditions, [
      "exact_clean_base_identifier_missing",
      "netlify_site_association_unverified",
      "secure_credential_availability_unverified",
    ]),
  next_action:
    record.next_permitted_action === expected.nextAction &&
    record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs" &&
    record.deployment_status === "not_performed",
  no_side_effects: Object.values(noEffectResults).every(Boolean),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature: record.action_nature ?? null,
  approval_decision: record.approval_decision ?? null,
  candidate_hash: record.approved_change_candidate?.candidate_hash ?? null,
  candidate_file_count: record.approved_change_candidate?.candidate_file_count ?? null,
  action471_deployment_result: action471.deployment_result ?? null,
  action471_deployment_attempt_count: action471.deployment_attempt_count ?? null,
  full_candidate_constructed: record.full_isolated_deployment_candidate?.constructed ?? null,
  clean_base_verified: record.repository_base?.clean_base_verified ?? null,
  netlify_site_association_verified:
    record.netlify_target_policy?.site_association_verified ?? null,
  credential_available: record.credential_availability_policy?.credential_available ?? null,
  preview_flag: record.preview_flag_policy?.flag_name ?? null,
  runtime_preview_state: record.runtime_preview_state ?? null,
  deployment_status: record.deployment_status ?? null,
  next_permitted_action: record.next_permitted_action ?? null,
  no_effect_results: noEffectResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
