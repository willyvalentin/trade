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
  owner: "Willy Simonsson",
  flag: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  currentState: "runtime_preview_waiting_for_operator_inputs",
  recommendedState: "runtime_preview_ready_for_deployment_approval",
  deploymentDecision: "deployment_execution_approved_for_future_action",
  nextAction:
    "action_471_confidence_calibration_recommendation_advisory_projection_preview_deployment_execution",
  action472:
    "action_472_confidence_calibration_recommendation_advisory_projection_preview_disabled_state_verification_and_activation_approval_gate",
});

const paths = Object.freeze({
  doc:
    "docs/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-gate.md",
  record:
    "docs/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-record.json",
  action471Doc:
    "docs/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution.md",
  action471Record:
    "docs/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-record.json",
  action469Record:
    "docs/action-469-confidence-calibration-recommendation-advisory-projection-preview-validated-operator-decision-record.json",
  action466Materialization:
    "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization.json",
  action459Verifier:
    "scripts/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-verify.mjs",
  action460Verifier:
    "scripts/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate-verify.mjs",
  action461Verifier:
    "scripts/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation-verify.mjs",
  action462Verifier:
    "scripts/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification-verify.mjs",
  action463Verifier:
    "scripts/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate-verify.mjs",
  action466Verifier:
    "scripts/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization-and-operator-input-finalization-verify.mjs",
  action467Verifier:
    "scripts/action-467-confidence-calibration-recommendation-advisory-projection-operator-input-finalization-gate-verify.mjs",
  action468Verifier:
    "scripts/action-468-confidence-calibration-recommendation-advisory-projection-operator-input-completion-continuation-verify.mjs",
  action469Verifier:
    "scripts/action-469-confidence-calibration-recommendation-advisory-projection-operator-input-validation-and-preview-deployment-execution-approval-gate-verify.mjs",
  verifier:
    "scripts/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-gate-verify.mjs",
  action471Verifier:
    "scripts/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-verify.mjs",
  test:
    "tests/e2e/action-470-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-approval-gate.spec.ts",
  action471Test:
    "tests/e2e/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution.spec.ts",
});

const zeroThresholdFields = Object.freeze([
  "recommendation_render_failures",
  "original_confidence_mutations",
  "confidence_application_events",
  "ranking_scanner_publication_execution_effects",
  "add_trade_risk_sizing_effects",
  "production_exposure_events",
  "unauthorized_access_events",
  "raw_data_exposure_events",
  "route_provider_supabase_persistence_replay_feedback_events",
  "kill_switch_failures",
]);

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

function arrayIncludesAll(array, values) {
  return Array.isArray(array) && values.every((value) => array.includes(value));
}

function allFalse(object) {
  return Object.values(object).every((value) => value === false);
}

function isPrivateAccess(record) {
  const text = String(record.access_policy ?? "").toLowerCase();
  return (
    text.includes("private") &&
    text.includes("no public distribution") &&
    text.includes("anonymous public access") &&
    !text.includes("public anonymous")
  );
}

function deploymentDecisionFor(record) {
  const candidateOk =
    record.candidate_hash === expected.hash &&
    record.materialized_candidate_hash === expected.hash &&
    record.candidate_file_count === expected.fileCount;
  const targetOk =
    record.environment_classification === "non_production_preview" &&
    record.target_environment === expected.target &&
    record.preview_environment_identifier === expected.identifier;
  const accessOk = isPrivateAccess(record);
  const ownersOk = [
    "deployment_operator",
    "observation_owner",
    "rollback_owner",
    "kill_switch_owner",
  ].every((field) => record[field] === expected.owner);
  const separationOk =
    record.initial_flag_state === "disabled" &&
    record.disabled_on_deploy_required === true &&
    record.activation_separated === true &&
    record.activation_requires_future_action === expected.action472;
  const noEffectOk = allFalse({
    deployment_performed: record.deployment_performed,
    preview_activated: record.preview_activated,
    environment_modified: record.environment_modified,
    provider_call_executed: record.provider_call_executed,
    supabase_write_executed: record.supabase_write_executed,
    replay_executed: record.replay_executed,
    confidence_application_added: record.confidence_application_added,
  });

  if (candidateOk && targetOk && accessOk && ownersOk && separationOk && noEffectOk) {
    return "deployment_execution_approved_for_future_action";
  }
  const accessUnresolved =
    record.access_policy === "platform_specific_access_mode_unresolved" ||
    record.access_policy === "private_preview_access_mode_pending_platform_confirmation";
  if (candidateOk && targetOk && accessUnresolved && ownersOk && separationOk && noEffectOk) {
    return "deployment_execution_approved_with_conditions";
  }
  return "deployment_execution_not_approved";
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action471 = exists(paths.action471Record) ? readJson(paths.action471Record) : {};
const action469 = exists(paths.action469Record) ? readJson(paths.action469Record) : {};
const materialization = exists(paths.action466Materialization)
  ? readJson(paths.action466Materialization)
  : {};

const sourceVerifierPaths = [
  paths.action459Verifier,
  paths.action460Verifier,
  paths.action461Verifier,
  paths.action462Verifier,
  paths.action463Verifier,
  paths.action466Verifier,
  paths.action467Verifier,
  paths.action468Verifier,
  paths.action469Verifier,
];
const sourceVerifierReports = Object.fromEntries(
  sourceVerifierPaths.map((path) => [path, runJsonVerifier(path)]),
);

const deploymentRejectionExample = deploymentDecisionFor({
  ...record,
  target_environment: "production",
  environment_classification: "production",
  preview_environment_identifier: "trade.valentinlabs.com",
});
const publicAccessRejectionExample = deploymentDecisionFor({
  ...record,
  access_policy: "public anonymous URL",
});
const enabledDeployRejectionExample = deploymentDecisionFor({
  ...record,
  initial_flag_state: "enabled",
  disabled_on_deploy_required: false,
});

const noEffectResults = {
  deployment_performed: record.deployment_performed === false,
  preview_activated: record.preview_activated === false,
  environment_modified: record.environment_modified === false,
  netlify_cli_invoked: record.netlify_cli_invoked === false,
  netlify_api_invoked: record.netlify_api_invoked === false,
  netlify_site_linked: record.netlify_site_linked === false,
  provider_call_executed: record.provider_call_executed === false,
  supabase_write_executed: record.supabase_write_executed === false,
  replay_executed: record.replay_executed === false,
  persistence_added: record.persistence_added === false,
  feedback_added: record.feedback_added === false,
  confidence_application_added: record.confidence_application_added === false,
  scanner_behavior_changed: record.scanner_behavior_changed === false,
  live_ranking_changed: record.live_ranking_changed === false,
  add_trade_changed: record.add_trade_changed === false,
  broker_execution_changed: record.broker_execution_changed === false,
  risk_sizing_changed: record.risk_sizing_changed === false,
};

const requiredPreChecks = [
  "git diff --check",
  "npx next typegen",
  "npx tsc --noEmit",
  "npm run build",
  "npm run lint",
  "Action 309 guard passes",
  "candidate file count remains 30",
  `candidate hash remains ${expected.hash}`,
  "preview flag is absent or disabled before deployment",
];

const requiredPostChecks = [
  "preview URL resolves",
  "access is restricted to the approved operator boundary",
  "Recommendation list renders",
  "Recommendation details render",
  "Calibration Preview UI is absent while the flag is disabled",
  "original confidence remains unchanged",
  "Add Trade and execution behavior remain unchanged",
  "kill switch disabled state is confirmed",
  "production environment is unaffected",
];

const requiredStopConditions = [
  "Recommendation render failure",
  "Recommendation details unavailable",
  "original confidence mutation",
  "confidence application event",
  "production exposure",
  "unauthorized access",
  "raw-data exposure",
  "kill-switch failure",
  "preview unavailable count exceeds 10",
  "candidate hash differs",
  "access boundary fails",
];

const checks = {
  documentation_exists: exists(paths.doc),
  approval_record_exists: exists(paths.record),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    doc.includes("## Frozen Candidate") &&
    doc.includes("## Disabled-Deployment Policy") &&
    doc.includes("## Activation Separation") &&
    doc.includes("Action 471 may perform only the approved preview deployment with the preview flag disabled") &&
    doc.includes("Mandatory activation gate"),
  record_schema:
    record.schema_version === "action_470_preview_deployment_execution_approval_record_v1" &&
    record.source_action === 469 &&
    record.approval_action === 470,
  action469_decision:
    action469.operator_input_decision === "operator_inputs_complete" &&
    action469.deployment_gate_readiness === "deployment_gate_ready" &&
    action469.activation_decision === "activation_approved_for_future_action" &&
    action469.next_permitted_action ===
      "action_470_confidence_calibration_recommendation_advisory_projection_preview_deployment_execution_approval_gate",
  candidate_bound:
    materialization.action_465_candidate_inventory_hash === expected.hash &&
    materialization.materialized_candidate_inventory_hash === expected.hash &&
    materialization.candidate_file_count === expected.fileCount &&
    materialization.unexpected_file_count === 0 &&
    materialization.secret_file_count === 0 &&
    materialization.environment_file_count === 0 &&
    record.candidate_hash === expected.hash &&
    record.materialized_candidate_hash === expected.hash &&
    record.candidate_file_count === expected.fileCount &&
    record.candidate_decision === "candidate_ready",
  target_environment:
    record.target_environment === expected.target &&
    record.environment_classification === "non_production_preview" &&
    record.preview_environment_identifier === expected.identifier &&
    record.platform_boundary === "netlify_preview_deployment_only" &&
    record.production_prohibited === true,
  access_policy:
    isPrivateAccess(record) &&
    Array.isArray(record.authorized_preview_users) &&
    record.authorized_preview_users.length === 1 &&
    record.authorized_preview_users[0] === expected.owner,
  owners:
    record.deployment_operator === expected.owner &&
    record.observation_owner === expected.owner &&
    record.rollback_owner === expected.owner &&
    record.kill_switch_owner === expected.owner,
  timing_evidence_telemetry:
    record.duration_minutes === 480 &&
    record.evidence_policy === "bounded_manual_summary" &&
    record.telemetry_policy === "none",
  thresholds:
    zeroThresholdFields.every((field) => record.thresholds?.[field] === 0) &&
    record.thresholds?.preview_unavailable_events_allowed === 10,
  pre_deployment_checks: arrayIncludesAll(record.pre_deployment_checks, requiredPreChecks),
  flag_disabled_on_deploy:
    record.preview_flag_name === expected.flag &&
    record.initial_flag_state === "disabled" &&
    record.disabled_on_deploy_required === true,
  post_deployment_checks: arrayIncludesAll(record.post_deployment_checks, requiredPostChecks),
  activation_separation:
    record.activation_separated === true &&
    record.activation_requires_future_action === expected.action472 &&
    record.mandatory_followup_activation_gate === expected.action472,
  runtime_state_sequence:
    Array.isArray(record.runtime_state_sequence) &&
    record.runtime_state_sequence[0] === expected.currentState &&
    record.runtime_state_sequence[1] === expected.recommendedState &&
    record.current_runtime_preview_state === expected.currentState &&
    record.recommended_runtime_preview_state === expected.recommendedState &&
    record.future_deployment_state_after_action_471 ===
      "runtime_preview_deployed_preview_disabled" &&
    record.future_activation_state_after_action_472 ===
      "runtime_preview_active_observation_only",
  observation_policy:
    record.observation_policy?.owner === expected.owner &&
    record.observation_policy?.retention === "bounded_manual_summary" &&
    arrayIncludesAll(record.observation_policy?.allowed_fields, [
      "aggregate_preview_render_count",
      "aggregate_preview_unavailable_count",
      "confidence_application_count",
      "downstream_effect_count",
      "unauthorized_access_count",
      "raw_data_exposure_count",
      "kill_switch_tested",
    ]) &&
    arrayIncludesAll(record.observation_policy?.prohibited_fields, [
      "credentials",
      "tokens",
      "Recommendation IDs",
      "tickers tied to projection output",
      "confidence values",
      "raw projection data",
    ]),
  stop_conditions: arrayIncludesAll(record.stop_conditions, requiredStopConditions),
  kill_switch:
    record.kill_switch?.owner === expected.owner &&
    record.kill_switch?.procedure?.includes(expected.flag) &&
    record.kill_switch?.reenable_same_session_allowed === false,
  rollback:
    record.rollback?.owner === expected.owner &&
    record.rollback?.primary === "Disable or remove the preview flag." &&
    record.rollback?.data_cleanup_required === false,
  expiry:
    record.expiry?.duration_minutes === 480 &&
    record.expiry?.procedure?.includes("Disable or remove the preview flag"),
  deployment_decision:
    record.deployment_decision === expected.deploymentDecision &&
    deploymentDecisionFor(record) === expected.deploymentDecision &&
    record.next_action === expected.nextAction,
  rejection_examples:
    deploymentRejectionExample === "deployment_execution_not_approved" &&
    publicAccessRejectionExample === "deployment_execution_not_approved" &&
    enabledDeployRejectionExample === "deployment_execution_not_approved",
  source_verifiers_healthy: Object.values(sourceVerifierReports).every(
    (report) => report?.verification_status === "passed",
  ),
  action471_artifacts_recognized:
    exists(paths.action471Doc) &&
    exists(paths.action471Record) &&
    exists(paths.action471Verifier) &&
    exists(paths.action471Test) &&
    action471.schema_version === "action_471_preview_deployment_execution_record_v1" &&
    action471.source_action === 470 &&
    action471.candidate_inventory_hash === expected.hash &&
    action471.materialized_candidate_hash === expected.hash &&
    action471.candidate_file_count === expected.fileCount &&
    [
      "deployment_succeeded_preview_disabled",
      "deployment_failed",
      "deployment_aborted",
    ].includes(action471.deployment_result) &&
    action471.preview_activated === false &&
    action471.confidence_applied === false,
  no_deployment_activation_environment_change: Object.values(noEffectResults).every(Boolean),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature:
    "static_preview_deployment_execution_approval_gate_no_deploy_no_activation_no_environment_change",
  candidate_hash: record.candidate_hash ?? null,
  materialized_candidate_hash: record.materialized_candidate_hash ?? null,
  candidate_file_count: record.candidate_file_count ?? null,
  target_environment: record.target_environment ?? null,
  environment_classification: record.environment_classification ?? null,
  preview_environment_identifier: record.preview_environment_identifier ?? null,
  deployment_decision: record.deployment_decision ?? null,
  next_action: record.next_action ?? null,
  mandatory_followup_activation_gate: record.mandatory_followup_activation_gate ?? null,
  current_runtime_preview_state: record.current_runtime_preview_state ?? null,
  recommended_runtime_preview_state: record.recommended_runtime_preview_state ?? null,
  deployment_performed: record.deployment_performed ?? null,
  preview_activated: record.preview_activated ?? null,
  environment_modified: record.environment_modified ?? null,
  validation_results: {
    actual_deployment_decision: deploymentDecisionFor(record),
    production_rejection_example: deploymentRejectionExample,
    public_access_rejection_example: publicAccessRejectionExample,
    enabled_deploy_rejection_example: enabledDeployRejectionExample,
  },
  no_effect_results: noEffectResults,
  source_verifier_statuses: Object.fromEntries(
    Object.entries(sourceVerifierReports).map(([path, sourceReport]) => [
      path,
      sourceReport?.verification_status ?? "missing_or_failed",
    ]),
  ),
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
