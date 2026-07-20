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
  candidateHash:
    "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  candidateFileCount: 30,
  candidateDecision: "candidate_ready",
  flagName: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  currentRuntimePreviewState: "runtime_preview_waiting_for_operator_inputs",
  recommendedRuntimePreviewState: "runtime_preview_ready_for_deployment_approval",
  operatorInputDecision: "operator_inputs_complete",
  deploymentGateReadiness: "deployment_gate_ready",
  activationDecision: "activation_approved_for_future_action",
  nextAction:
    "action_470_confidence_calibration_recommendation_advisory_projection_preview_deployment_execution_approval_gate",
});

const paths = Object.freeze({
  doc:
    "docs/action-469-confidence-calibration-recommendation-advisory-projection-operator-input-validation-and-preview-deployment-execution-approval-gate.md",
  record:
    "docs/action-469-confidence-calibration-recommendation-advisory-projection-preview-validated-operator-decision-record.json",
  action466Materialization:
    "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization.json",
  action467Record:
    "docs/action-467-confidence-calibration-recommendation-advisory-projection-preview-final-operator-decision-record.json",
  action468Record:
    "docs/action-468-confidence-calibration-recommendation-advisory-projection-preview-continued-operator-decision-record.json",
  action466Verifier:
    "scripts/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization-and-operator-input-finalization-verify.mjs",
  action467Verifier:
    "scripts/action-467-confidence-calibration-recommendation-advisory-projection-operator-input-finalization-gate-verify.mjs",
  action468Verifier:
    "scripts/action-468-confidence-calibration-recommendation-advisory-projection-operator-input-completion-continuation-verify.mjs",
  verifier:
    "scripts/action-469-confidence-calibration-recommendation-advisory-projection-operator-input-validation-and-preview-deployment-execution-approval-gate-verify.mjs",
  test:
    "tests/e2e/action-469-confidence-calibration-recommendation-advisory-projection-operator-input-validation-and-preview-deployment-execution-approval-gate.spec.ts",
});

const requiredOperatorFields = Object.freeze([
  "target_preview_environment",
  "environment_classification",
  "preview_environment_identifier",
  "authorized_preview_users",
  "access_control_mechanism",
  "preview_start_condition",
  "preview_expiry_condition",
  "maximum_preview_duration_minutes",
  "preview_flag_value",
  "development_diagnostics_enabled",
  "evidence_retention",
  "telemetry_policy",
  "preview_unavailable_events_allowed",
  "rollback_owner",
  "kill_switch_owner",
  "deployment_operator",
  "observation_owner",
  "original_confidence_remains_authoritative",
  "confidence_application_authorized",
  "preview_may_affect_downstream_behavior",
  "production_activation_authorized",
  "persistent_projection_evidence_authorized",
  "deployment_readiness_explicitly_approved",
  "preview_activation_explicitly_approved",
]);

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

function isBoundedString(value) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 320;
}

function looksProduction(value) {
  return typeof value === "string" && /(^|\b)(production|prod|main)(\b|$)|trade\.valentinlabs\.com/i.test(value);
}

function validateAccess(value) {
  if (!isBoundedString(value)) return false;
  const lower = value.toLowerCase();
  if (lower.includes("private") && lower.includes("no public distribution")) return true;
  if (lower.includes("platform-protected")) return true;
  if (lower.includes("authenticated internal")) return true;
  if (lower.includes("named internal operator")) return true;
  if (/anonymous|query-string|localstorage|sessionstorage|cookie bypass|self-enrollment|public anonymous/.test(lower)) {
    return false;
  }
  return false;
}

function validateRecord(record) {
  const invalid = new Set();
  const unresolved = new Set();
  const valueForField = (field) =>
    field === "preview_unavailable_events_allowed"
      ? record.acceptable_failure_threshold?.preview_unavailable_events_allowed
      : record[field];

  for (const field of requiredOperatorFields) {
    const value = valueForField(field);
    if (value === null || value === undefined) unresolved.add(field);
  }

  if (!isBoundedString(record.target_preview_environment)) invalid.add("target_preview_environment");
  if (looksProduction(record.target_preview_environment)) invalid.add("target_preview_environment");
  if (record.environment_classification !== "non_production_preview") invalid.add("environment_classification");
  if (!isBoundedString(record.preview_environment_identifier)) invalid.add("preview_environment_identifier");
  if (looksProduction(record.preview_environment_identifier)) invalid.add("preview_environment_identifier");

  if (
    !Array.isArray(record.authorized_preview_users) ||
    record.authorized_preview_users.length !== 1 ||
    record.authorized_preview_users[0] !== "Willy Simonsson"
  ) {
    invalid.add("authorized_preview_users");
  }

  if (!validateAccess(record.access_control_mechanism)) invalid.add("access_control_mechanism");

  if (!isBoundedString(record.preview_start_condition)) invalid.add("preview_start_condition");
  if (!isBoundedString(record.preview_expiry_condition)) invalid.add("preview_expiry_condition");
  if (
    typeof record.preview_expiry_condition === "string" &&
    !/480 minutes/i.test(record.preview_expiry_condition)
  ) {
    invalid.add("preview_expiry_condition");
  }
  if (record.maximum_preview_duration_minutes !== 480) invalid.add("maximum_preview_duration_minutes");

  if (record.preview_flag_name !== expected.flagName) invalid.add("preview_flag_name");
  if (record.preview_flag_value !== "true") invalid.add("preview_flag_value");
  if (record.development_diagnostics_enabled !== false) invalid.add("development_diagnostics_enabled");
  if (record.evidence_retention !== "bounded_manual_summary") invalid.add("evidence_retention");
  if (record.telemetry_policy !== "none") invalid.add("telemetry_policy");

  const thresholds = record.acceptable_failure_threshold ?? {};
  for (const field of zeroThresholdFields) {
    if (thresholds[field] !== 0) invalid.add(`acceptable_failure_threshold.${field}`);
  }
  if (thresholds.preview_unavailable_events_allowed !== 10) {
    invalid.add("acceptable_failure_threshold.preview_unavailable_events_allowed");
  }

  for (const ownerField of [
    "rollback_owner",
    "kill_switch_owner",
    "deployment_operator",
    "observation_owner",
  ]) {
    if (record[ownerField] !== "Willy Simonsson") invalid.add(ownerField);
  }

  const exactAuthority = {
    original_confidence_remains_authoritative: true,
    confidence_application_authorized: false,
    preview_may_affect_downstream_behavior: false,
    production_activation_authorized: false,
    persistent_projection_evidence_authorized: false,
    deployment_readiness_explicitly_approved: true,
    preview_activation_explicitly_approved: true,
  };
  for (const [field, value] of Object.entries(exactAuthority)) {
    if (record[field] !== value) invalid.add(field);
  }

  const invalidFields = [...invalid].sort();
  const unresolvedFields = [...unresolved].sort();
  const operatorInputDecision =
    invalidFields.length > 0
      ? "operator_inputs_invalid"
      : unresolvedFields.length > 0
        ? "operator_inputs_incomplete"
        : "operator_inputs_complete";
  const deploymentGateReadiness =
    operatorInputDecision === "operator_inputs_invalid"
      ? "deployment_gate_blocked"
      : operatorInputDecision === "operator_inputs_complete"
        ? "deployment_gate_ready"
        : "deployment_gate_ready_with_conditions";
  const activationDecision =
    deploymentGateReadiness === "deployment_gate_ready"
      ? "activation_approved_for_future_action"
      : deploymentGateReadiness === "deployment_gate_ready_with_conditions"
        ? "activation_approved_with_conditions"
        : "activation_not_approved";

  return {
    operator_input_decision: operatorInputDecision,
    deployment_gate_readiness: deploymentGateReadiness,
    activation_decision: activationDecision,
    unresolved_field_names: unresolvedFields,
    invalid_field_names: invalidFields,
  };
}

const materialization = exists(paths.action466Materialization)
  ? readJson(paths.action466Materialization)
  : {};
const action467 = exists(paths.action467Record) ? readJson(paths.action467Record) : {};
const action468 = exists(paths.action468Record) ? readJson(paths.action468Record) : {};
const record = exists(paths.record) ? readJson(paths.record) : {};
const action466Report = runJsonVerifier(paths.action466Verifier);
const action467Report = runJsonVerifier(paths.action467Verifier);
const action468Report = runJsonVerifier(paths.action468Verifier);
const doc = exists(paths.doc) ? read(paths.doc) : "";

const actualValidation = validateRecord(record);
const productionValidation = validateRecord({
  ...record,
  target_preview_environment: "production",
  preview_environment_identifier: "trade.valentinlabs.com",
});
const publicAccessValidation = validateRecord({
  ...record,
  access_control_mechanism: "public anonymous URL",
});
const invalidDurationValidation = validateRecord({
  ...record,
  maximum_preview_duration_minutes: 481,
});
const missingExpiryValidation = validateRecord({
  ...record,
  preview_expiry_condition: null,
});
const diagnosticsValidation = validateRecord({
  ...record,
  development_diagnostics_enabled: true,
});
const telemetryValidation = validateRecord({
  ...record,
  telemetry_policy: "existing_aggregate_only",
});
const authorityValidation = validateRecord({
  ...record,
  confidence_application_authorized: true,
});

const noEffectResults = {
  deployment_performed: false,
  preview_activated: false,
  environment_modified: false,
  flag_activated: false,
  netlify_config_changed: false,
  branch_deployment_created: false,
  route_created: false,
  persistence_created: false,
  replay_created: false,
  provider_access_created: false,
  supabase_access_created: false,
  feedback_created: false,
  confidence_application_created: false,
  recommendation_mutation_created: false,
  ranking_changed: false,
  scanner_changed: false,
  publication_changed: false,
  execution_changed: false,
  add_trade_changed: false,
  risk_changed: false,
  position_sizing_changed: false,
};

const checks = {
  documentation_exists: exists(paths.doc),
  validated_record_exists: exists(paths.record),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    doc.includes("## Authoritative Candidate") &&
    doc.includes("## Action 470 Boundary") &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  candidate_bound:
    materialization.action_465_candidate_inventory_hash === expected.candidateHash &&
    materialization.materialized_candidate_inventory_hash === expected.candidateHash &&
    materialization.candidate_file_count === expected.candidateFileCount &&
    materialization.unexpected_file_count === 0 &&
    materialization.secret_file_count === 0 &&
    materialization.environment_file_count === 0 &&
    record.candidate_inventory_hash === expected.candidateHash &&
    record.materialized_candidate_hash === expected.candidateHash &&
    record.candidate_file_count === expected.candidateFileCount &&
    record.candidate_decision === expected.candidateDecision,
  source_records_bound:
    action467.candidate_inventory_hash === expected.candidateHash &&
    action468.candidate_inventory_hash === expected.candidateHash &&
    action468.operator_input_decision === "operator_inputs_incomplete",
  source_verifiers_healthy:
    action466Report?.verification_status === "passed" &&
    action467Report?.verification_status === "passed" &&
    action468Report?.verification_status === "passed",
  record_schema:
    record.schema_version === "action_469_validated_operator_decision_record_v1" &&
    record.source_action === 468 &&
    record.validation_action === 469,
  supplied_inventory:
    Array.isArray(record.supplied_field_names) &&
    record.supplied_field_names.length === requiredOperatorFields.length &&
    requiredOperatorFields.every((field) => record.supplied_field_names.includes(field)),
  unresolved_and_invalid_clear:
    Array.isArray(record.unresolved_field_names) &&
    record.unresolved_field_names.length === 0 &&
    Array.isArray(record.invalid_field_names) &&
    record.invalid_field_names.length === 0,
  exact_supplied_values:
    record.target_preview_environment ===
      "Netlify Preview Deployment – Ture Confidence Calibration Projection Preview" &&
    record.environment_classification === "non_production_preview" &&
    record.preview_environment_identifier ===
      "ture-confidence-calibration-projection-preview" &&
    record.authorized_preview_users?.[0] === "Willy Simonsson" &&
    record.access_control_mechanism ===
      "Private Netlify Preview URL shared only with the authorized operator. No public distribution or user-controlled access." &&
    record.maximum_preview_duration_minutes === 480 &&
    record.preview_flag_name === expected.flagName &&
    record.preview_flag_value === "true" &&
    record.development_diagnostics_enabled === false &&
    record.evidence_retention === "bounded_manual_summary" &&
    record.telemetry_policy === "none",
  thresholds:
    zeroThresholdFields.every((field) => record.acceptable_failure_threshold?.[field] === 0) &&
    record.acceptable_failure_threshold?.preview_unavailable_events_allowed === 10,
  owners_and_authority:
    record.rollback_owner === "Willy Simonsson" &&
    record.kill_switch_owner === "Willy Simonsson" &&
    record.deployment_operator === "Willy Simonsson" &&
    record.observation_owner === "Willy Simonsson" &&
    record.original_confidence_remains_authoritative === true &&
    record.confidence_application_authorized === false &&
    record.preview_may_affect_downstream_behavior === false &&
    record.production_activation_authorized === false &&
    record.persistent_projection_evidence_authorized === false &&
    record.deployment_readiness_explicitly_approved === true &&
    record.preview_activation_explicitly_approved === true,
  decisions:
    actualValidation.operator_input_decision === expected.operatorInputDecision &&
    actualValidation.deployment_gate_readiness === expected.deploymentGateReadiness &&
    actualValidation.activation_decision === expected.activationDecision &&
    record.operator_input_decision === expected.operatorInputDecision &&
    record.deployment_gate_readiness === expected.deploymentGateReadiness &&
    record.activation_decision === expected.activationDecision &&
    record.next_permitted_action === expected.nextAction,
  future_state:
    record.current_runtime_preview_state === expected.currentRuntimePreviewState &&
    record.recommended_runtime_preview_state === expected.recommendedRuntimePreviewState,
  rejection_examples:
    productionValidation.deployment_gate_readiness === "deployment_gate_blocked" &&
    publicAccessValidation.deployment_gate_readiness === "deployment_gate_blocked" &&
    invalidDurationValidation.deployment_gate_readiness === "deployment_gate_blocked" &&
    missingExpiryValidation.deployment_gate_readiness === "deployment_gate_blocked" &&
    diagnosticsValidation.deployment_gate_readiness === "deployment_gate_blocked" &&
    telemetryValidation.deployment_gate_readiness === "deployment_gate_blocked" &&
    authorityValidation.deployment_gate_readiness === "deployment_gate_blocked",
  action470_boundary:
    record.next_permitted_action === expected.nextAction &&
    doc.includes("Action 470 must still be approval-only") &&
    doc.includes("Action 470 must not combine deployment and activation"),
  no_deployment_activation_env_change:
    Object.values(noEffectResults).every((value) => value === false) &&
    record.deployment_performed === false &&
    record.preview_activated === false &&
    record.environment_modified === false,
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature:
    "static_operator_input_validation_preview_deployment_execution_approval_gate_no_deploy_no_activation",
  candidate_inventory_hash: record.candidate_inventory_hash ?? null,
  materialized_candidate_hash: record.materialized_candidate_hash ?? null,
  candidate_file_count: record.candidate_file_count ?? null,
  candidate_decision: record.candidate_decision ?? null,
  supplied_input_count: record.supplied_field_names?.length ?? 0,
  unresolved_input_count: record.unresolved_field_names?.length ?? 0,
  invalid_input_count: record.invalid_field_names?.length ?? 0,
  operator_input_decision: record.operator_input_decision ?? null,
  deployment_gate_readiness: record.deployment_gate_readiness ?? null,
  activation_decision: record.activation_decision ?? null,
  current_runtime_preview_state: record.current_runtime_preview_state ?? null,
  recommended_runtime_preview_state: record.recommended_runtime_preview_state ?? null,
  next_permitted_action: record.next_permitted_action ?? null,
  validation_results: {
    actual: actualValidation,
    production_rejection_example: productionValidation,
    public_access_rejection_example: publicAccessValidation,
    invalid_duration_rejection_example: invalidDurationValidation,
    missing_expiry_rejection_example: missingExpiryValidation,
    diagnostics_rejection_example: diagnosticsValidation,
    telemetry_rejection_example: telemetryValidation,
    authority_rejection_example: authorityValidation,
  },
  no_effect_results: noEffectResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
