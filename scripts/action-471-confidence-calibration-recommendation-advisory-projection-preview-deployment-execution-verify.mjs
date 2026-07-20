#!/usr/bin/env node

import { execFileSync } from "child_process";
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
  target: "Netlify Preview Deployment – Ture Confidence Calibration Projection Preview",
  identifier: "ture-confidence-calibration-projection-preview",
  operator: "Willy Simonsson",
  flag: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  action470Decision: "deployment_execution_approved_for_future_action",
  aborted: "deployment_aborted",
  failed: "deployment_failed",
  succeeded: "deployment_succeeded_preview_disabled",
  remediationAction:
    "action_472_confidence_calibration_recommendation_advisory_projection_preview_deployment_remediation_approval_gate",
  disabledStateAction:
    "action_472_confidence_calibration_recommendation_advisory_projection_preview_disabled_state_verification_and_activation_approval_gate",
});

const paths = Object.freeze({
  doc:
    "docs/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution.md",
  record:
    "docs/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-record.json",
  action470Record:
    "docs/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-record.json",
  action470Verifier:
    "scripts/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-gate-verify.mjs",
  verifier:
    "scripts/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-verify.mjs",
  test:
    "tests/e2e/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution.spec.ts",
});

function runJsonVerifier(path) {
  if (!exists(path)) return null;
  try {
    return JSON.parse(
      execFileSync("node", [path], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 160 * 1024 * 1024,
      }),
    );
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout) : "";
    try {
      return JSON.parse(stdout);
    } catch {
      return null;
    }
  }
}

function validDeploymentResult(record) {
  return [expected.succeeded, expected.failed, expected.aborted].includes(record.deployment_result);
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action470 = exists(paths.action470Record) ? readJson(paths.action470Record) : {};
const action470Report = runJsonVerifier(paths.action470Verifier);

const noEffectResults = {
  preview_activated: record.preview_activated === false,
  production_activation: record.production_activation === false,
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
  temporary_candidate_copies_remaining:
    record.cleanup_result?.temporary_candidate_copies_remaining === false,
  deployment_output_retained_in_repo:
    record.cleanup_result?.deployment_output_retained_in_repo === false,
  credentials_retained: record.cleanup_result?.credentials_retained === false,
  environment_values_retained: record.cleanup_result?.environment_values_retained === false,
  projection_evidence_retained: record.cleanup_result?.projection_evidence_retained === false,
};

const deploymentResultConsistency =
  record.deployment_result === expected.aborted
    ? record.deployment_attempt_count === 0 &&
      record.preview_deployment_created === false &&
      record.next_action === expected.remediationAction &&
      record.post_deployment_disabled_verification_required === false
    : record.deployment_result === expected.succeeded
      ? record.deployment_attempt_count === 1 &&
        record.preview_deployment_created === true &&
        record.next_action === expected.disabledStateAction &&
        record.post_deployment_disabled_verification_required === true
      : record.deployment_result === expected.failed
        ? record.deployment_attempt_count === 1 &&
          record.next_action === expected.remediationAction
        : false;

const checks = {
  documentation_exists: exists(paths.doc),
  deployment_record_exists: exists(paths.record),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    doc.includes("## Action 470 Approval") &&
    doc.includes("## Isolated Deployment Source") &&
    doc.includes("Deployment result: `deployment_aborted`") &&
    doc.includes(expected.remediationAction),
  action470_approval:
    action470.deployment_decision === expected.action470Decision &&
    action470.candidate_hash === expected.hash &&
    action470.candidate_file_count === expected.fileCount &&
    action470.next_action ===
      "action_471_confidence_calibration_recommendation_advisory_projection_preview_deployment_execution" &&
    action470.preview_activated === false,
  action470_verifier_healthy: action470Report?.verification_status === "passed",
  record_schema:
    record.schema_version === "action_471_preview_deployment_execution_record_v1" &&
    record.source_action === 470,
  candidate_bound:
    record.candidate_inventory_hash === expected.hash &&
    record.materialized_candidate_hash === expected.hash &&
    record.candidate_file_count === expected.fileCount &&
    record.candidate_decision === "candidate_ready",
  target:
    record.deployment_target_name === expected.target &&
    record.deployment_target_identifier === expected.identifier &&
    record.environment_classification === "non_production_preview" &&
    record.deployment_platform === "Netlify" &&
    record.deployment_type === "preview",
  operator_and_access:
    record.deployment_operator === expected.operator &&
    record.approved_operator === expected.operator &&
    record.access_classification === "private_authorized_operator_only",
  pre_deployment_validation:
    record.pre_deployment_validation_result === "blocked_before_deployment" &&
    Array.isArray(record.pre_deployment_blockers) &&
    record.pre_deployment_blockers.includes(
      "isolated_deployment_source_not_proven_from_current_dirty_worktree",
    ) &&
    record.pre_deployment_blockers.includes(
      "netlify_preview_target_access_not_available_without_secret_or_network_step",
    ),
  serial_policy:
    record.pre_deployment_checks_serial_policy === true &&
    record.candidate_materialization_verifiers_run_concurrently === false,
  flag_disabled:
    record.preview_flag_name === expected.flag &&
    record.initial_preview_flag_state === "disabled" &&
    record.preview_flag_enabled === false &&
    record.production_flag_enabled === false &&
    record.alternate_activation_alias_detected === false &&
    record.query_string_activation_allowed === false &&
    record.storage_or_cookie_activation_allowed === false &&
    record.user_controlled_activation_allowed === false,
  deployment_attempt_and_result:
    record.deployment_attempt_count === 0 &&
    record.maximum_deployment_attempt_count === 1 &&
    record.retry_performed === false &&
    validDeploymentResult(record) &&
    deploymentResultConsistency,
  production_unchanged:
    record.production_deployment_changed === false &&
    record.production_activation === false &&
    record.preview_deployment_created === false,
  preview_inactive: record.preview_activated === false,
  no_forbidden_effects: Object.values(noEffectResults).every(Boolean),
  bounded_url_policy:
    record.bounded_preview_url_reference === null &&
    typeof record.bounded_preview_url_policy === "string" &&
    record.bounded_preview_url_policy.includes("No preview URL was produced"),
  cleanup: Object.values(cleanupResults).every(Boolean),
  runtime_state:
    record.current_runtime_preview_state === "runtime_preview_waiting_for_operator_inputs" &&
    record.entered_from_approved_state === true &&
    record.recommended_runtime_preview_state === "runtime_preview_ready_for_deployment_approval" &&
    record.success_runtime_preview_state === "runtime_preview_deployed_preview_disabled",
  mandatory_next_action:
    record.next_action === expected.remediationAction &&
    record.mandatory_disabled_state_gate_if_deployment_succeeds === expected.disabledStateAction,
  no_deployment_invocation:
    record.deployment_execution_performed === false &&
    record.netlify_cli_invoked === false &&
    record.netlify_api_invoked === false &&
    record.netlify_site_linked === false &&
    record.deployment_commands_recorded === false,
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature:
    "preview_deployment_execution_aborted_before_deployment_no_activation_no_side_effects",
  candidate_inventory_hash: record.candidate_inventory_hash ?? null,
  candidate_file_count: record.candidate_file_count ?? null,
  deployment_target_name: record.deployment_target_name ?? null,
  deployment_target_identifier: record.deployment_target_identifier ?? null,
  environment_classification: record.environment_classification ?? null,
  pre_deployment_validation_result: record.pre_deployment_validation_result ?? null,
  initial_preview_flag_state: record.initial_preview_flag_state ?? null,
  deployment_attempt_count: record.deployment_attempt_count ?? null,
  deployment_result: record.deployment_result ?? null,
  preview_deployment_created: record.preview_deployment_created ?? null,
  production_deployment_changed: record.production_deployment_changed ?? null,
  preview_activated: record.preview_activated ?? null,
  bounded_preview_url_reference: record.bounded_preview_url_reference ?? null,
  current_runtime_preview_state: record.current_runtime_preview_state ?? null,
  recommended_runtime_preview_state: record.recommended_runtime_preview_state ?? null,
  next_action: record.next_action ?? null,
  no_effect_results: noEffectResults,
  cleanup_results: cleanupResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
