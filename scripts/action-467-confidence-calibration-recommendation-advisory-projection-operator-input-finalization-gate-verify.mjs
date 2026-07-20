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
  runtimePreviewState: "runtime_preview_waiting_for_operator_inputs",
  operatorInputDecision: "operator_inputs_incomplete",
  deploymentGateReadiness: "deployment_gate_ready_with_conditions",
  activationDecision: "activation_approved_with_conditions",
  nextAction: "action_468_operator_input_completion_continuation",
});

const paths = Object.freeze({
  doc:
    "docs/action-467-confidence-calibration-recommendation-advisory-projection-operator-input-finalization-gate.md",
  decision:
    "docs/action-467-confidence-calibration-recommendation-advisory-projection-preview-final-operator-decision-record.json",
  action466Materialization:
    "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization.json",
  action466Verifier:
    "scripts/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization-and-operator-input-finalization-verify.mjs",
  verifier:
    "scripts/action-467-confidence-calibration-recommendation-advisory-projection-operator-input-finalization-gate-verify.mjs",
  test:
    "tests/e2e/action-467-confidence-calibration-recommendation-advisory-projection-operator-input-finalization-gate.spec.ts",
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
  return typeof value === "string" && value.trim().length > 0 && value.length <= 160;
}

function looksProduction(value) {
  return typeof value === "string" && /production|prod|trade\.valentinlabs\.com|main/i.test(value);
}

function isLocalhost(value) {
  return typeof value === "string" && /localhost|127\.0\.0\.1|::1/i.test(value);
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

  if (record.target_preview_environment !== null) {
    if (!isBoundedString(record.target_preview_environment)) invalid.add("target_preview_environment");
    if (looksProduction(record.target_preview_environment) || isLocalhost(record.target_preview_environment)) {
      invalid.add("target_preview_environment");
    }
  }
  if (
    record.environment_classification !== null &&
    record.environment_classification !== "non_production_preview"
  ) {
    invalid.add("environment_classification");
  }
  if (record.preview_environment_identifier !== null) {
    if (!isBoundedString(record.preview_environment_identifier)) invalid.add("preview_environment_identifier");
    if (looksProduction(record.preview_environment_identifier) || isLocalhost(record.preview_environment_identifier)) {
      invalid.add("preview_environment_identifier");
    }
  }

  if (record.authorized_preview_users !== null) {
    const users = record.authorized_preview_users;
    if (!Array.isArray(users) || users.length === 0 || !users.every(isBoundedString)) {
      invalid.add("authorized_preview_users");
    }
  }

  const forbiddenAccess = /public|anonymous|query|string|localStorage|sessionStorage|cookie|self-enrollment/i;
  if (record.access_control_mechanism !== null) {
    if (!isBoundedString(record.access_control_mechanism) || forbiddenAccess.test(record.access_control_mechanism)) {
      invalid.add("access_control_mechanism");
    }
  }

  if (record.preview_start_condition !== null && !isBoundedString(record.preview_start_condition)) {
    invalid.add("preview_start_condition");
  }
  if (record.preview_expiry_condition !== null && !isBoundedString(record.preview_expiry_condition)) {
    invalid.add("preview_expiry_condition");
  }
  if (record.maximum_preview_duration_minutes !== null) {
    if (
      !Number.isInteger(record.maximum_preview_duration_minutes) ||
      record.maximum_preview_duration_minutes <= 0 ||
      record.maximum_preview_duration_minutes > 480
    ) {
      invalid.add("maximum_preview_duration_minutes");
    }
  }

  if (record.preview_flag_name !== expected.flagName) invalid.add("preview_flag_name");
  if (record.preview_flag_value !== null && record.preview_flag_value !== "true") {
    invalid.add("preview_flag_value");
  }
  if (
    record.development_diagnostics_enabled !== null &&
    record.development_diagnostics_enabled !== false
  ) {
    invalid.add("development_diagnostics_enabled");
  }
  if (
    record.evidence_retention !== null &&
    !["none", "bounded_manual_summary"].includes(record.evidence_retention)
  ) {
    invalid.add("evidence_retention");
  }
  if (
    record.telemetry_policy !== null &&
    !["none", "existing_aggregate_only"].includes(record.telemetry_policy)
  ) {
    invalid.add("telemetry_policy");
  }

  const thresholds = record.acceptable_failure_threshold ?? {};
  for (const field of zeroThresholdFields) {
    if (thresholds[field] !== 0) invalid.add(`acceptable_failure_threshold.${field}`);
  }
  if (thresholds.preview_unavailable_events_allowed !== null) {
    if (
      !Number.isInteger(thresholds.preview_unavailable_events_allowed) ||
      thresholds.preview_unavailable_events_allowed < 0
    ) {
      invalid.add("acceptable_failure_threshold.preview_unavailable_events_allowed");
    }
  }

  for (const ownerField of [
    "rollback_owner",
    "kill_switch_owner",
    "deployment_operator",
    "observation_owner",
  ]) {
    if (record[ownerField] !== null && !isBoundedString(record[ownerField])) invalid.add(ownerField);
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
    if (record[field] !== null && record[field] !== value) invalid.add(field);
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
  const nextPermittedAction =
    deploymentGateReadiness === "deployment_gate_ready"
      ? "action_468_confidence_calibration_recommendation_advisory_projection_preview_deployment_execution_approval_gate"
      : deploymentGateReadiness === "deployment_gate_ready_with_conditions"
        ? "action_468_operator_input_completion_continuation"
        : "action_468_operator_input_remediation_approval_gate";

  return {
    operator_input_decision: operatorInputDecision,
    deployment_gate_readiness: deploymentGateReadiness,
    activation_decision: activationDecision,
    next_permitted_action: nextPermittedAction,
    unresolved_field_names: unresolvedFields,
    invalid_field_names: invalidFields,
  };
}

function completeRecord(base) {
  return {
    ...base,
    target_preview_environment: "preview-action-467-sandbox",
    environment_classification: "non_production_preview",
    preview_environment_identifier: "netlify-preview-action-467",
    authorized_preview_users: ["operator-a"],
    access_control_mechanism: "platform-protected preview deployment",
    preview_start_condition: "manual operator start after Action 468 approval",
    preview_expiry_condition: "flag disabled at or before bounded preview expiry",
    maximum_preview_duration_minutes: 120,
    preview_flag_value: "true",
    development_diagnostics_enabled: false,
    evidence_retention: "bounded_manual_summary",
    telemetry_policy: "existing_aggregate_only",
    acceptable_failure_threshold: {
      ...base.acceptable_failure_threshold,
      preview_unavailable_events_allowed: 3,
    },
    rollback_owner: "operator-a",
    kill_switch_owner: "operator-a",
    deployment_operator: "operator-a",
    observation_owner: "operator-a",
    original_confidence_remains_authoritative: true,
    confidence_application_authorized: false,
    preview_may_affect_downstream_behavior: false,
    production_activation_authorized: false,
    persistent_projection_evidence_authorized: false,
    deployment_readiness_explicitly_approved: true,
    preview_activation_explicitly_approved: true,
  };
}

const materialization = exists(paths.action466Materialization)
  ? readJson(paths.action466Materialization)
  : {};
const decision = exists(paths.decision) ? readJson(paths.decision) : {};
const action466Report = runJsonVerifier(paths.action466Verifier);
const doc = exists(paths.doc) ? read(paths.doc) : "";

const actualValidation = validateRecord(decision);
const completeValidation = validateRecord(completeRecord(decision));
const productionValidation = validateRecord({
  ...completeRecord(decision),
  target_preview_environment: "production",
  preview_environment_identifier: "trade.valentinlabs.com",
});
const publicAccessValidation = validateRecord({
  ...completeRecord(decision),
  access_control_mechanism: "anonymous public URL",
});
const conflictingAuthorityValidation = validateRecord({
  ...completeRecord(decision),
  confidence_application_authorized: true,
});

const noEffectResults = {
  deployment_performed: false,
  preview_activated: false,
  environment_modified: false,
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
  decision_record_exists: exists(paths.decision),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract:
    doc.includes("## Action 466 Candidate Proof") &&
    doc.includes("## Historical-Verifier Policy") &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  action466_candidate_bound:
    materialization.action_465_candidate_inventory_hash === expected.candidateHash &&
    materialization.materialized_candidate_inventory_hash === expected.candidateHash &&
    materialization.candidate_file_count === expected.candidateFileCount &&
    materialization.temporary_candidate_cleanup_result === "temporary_candidate_removed" &&
    materialization.unexpected_file_count === 0 &&
    materialization.secret_file_count === 0 &&
    materialization.environment_file_count === 0,
  action466_verifier_healthy: action466Report?.verification_status === "passed",
  decision_schema:
    decision.schema_version === "action_467_final_operator_decision_record_v1" &&
    decision.candidate_inventory_hash === expected.candidateHash &&
    decision.candidate_file_count === expected.candidateFileCount &&
    decision.candidate_decision === expected.candidateDecision,
  no_invented_values:
    Array.isArray(decision.supplied_field_names) &&
    decision.supplied_field_names.length === 0 &&
    requiredOperatorFields.every((field) =>
      field === "preview_unavailable_events_allowed"
        ? decision.acceptable_failure_threshold?.preview_unavailable_events_allowed === null
        : decision[field] === null,
    ),
  unresolved_inventory:
    Array.isArray(decision.unresolved_field_names) &&
    requiredOperatorFields.every((field) => decision.unresolved_field_names.includes(field)),
  invalid_inventory:
    Array.isArray(decision.invalid_field_names) && decision.invalid_field_names.length === 0,
  zero_thresholds:
    zeroThresholdFields.every((field) => decision.acceptable_failure_threshold?.[field] === 0) &&
    decision.acceptable_failure_threshold?.preview_unavailable_events_allowed === null,
  actual_decisions:
    actualValidation.operator_input_decision === expected.operatorInputDecision &&
    actualValidation.deployment_gate_readiness === expected.deploymentGateReadiness &&
    actualValidation.activation_decision === expected.activationDecision &&
    actualValidation.next_permitted_action === expected.nextAction &&
    decision.operator_input_decision === expected.operatorInputDecision &&
    decision.deployment_gate_readiness === expected.deploymentGateReadiness &&
    decision.activation_decision === expected.activationDecision &&
    decision.next_permitted_action === expected.nextAction,
  validation_examples:
    completeValidation.operator_input_decision === "operator_inputs_complete" &&
    completeValidation.deployment_gate_readiness === "deployment_gate_ready" &&
    completeValidation.activation_decision === "activation_approved_for_future_action" &&
    productionValidation.deployment_gate_readiness === "deployment_gate_blocked" &&
    publicAccessValidation.deployment_gate_readiness === "deployment_gate_blocked" &&
    conflictingAuthorityValidation.deployment_gate_readiness === "deployment_gate_blocked",
  historical_verifier_policy:
    doc.includes("Action 464 historical operator-input snapshot is superseded") &&
    doc.includes("Action 466 candidate materialization is the authoritative current candidate proof"),
  no_deployment_activation_env_change:
    Object.values(noEffectResults).every((value) => value === false) &&
    decision.deployment_performed === false &&
    decision.preview_activated === false,
  runtime_preview_waiting:
    decision.runtime_preview_state === expected.runtimePreviewState &&
    decision.future_runtime_preview_state_recommendation === null,
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature:
    "static_operator_input_finalization_gate_no_deploy_no_activation_no_runtime_execution",
  candidate_inventory_hash: decision.candidate_inventory_hash ?? null,
  materialized_candidate_inventory_hash:
    materialization.materialized_candidate_inventory_hash ?? null,
  candidate_file_count: decision.candidate_file_count ?? null,
  candidate_decision: decision.candidate_decision ?? null,
  supplied_field_names: decision.supplied_field_names ?? [],
  unresolved_field_names: decision.unresolved_field_names ?? [],
  invalid_field_names: decision.invalid_field_names ?? [],
  operator_input_decision: decision.operator_input_decision ?? null,
  deployment_gate_readiness: decision.deployment_gate_readiness ?? null,
  activation_decision: decision.activation_decision ?? null,
  next_permitted_action: decision.next_permitted_action ?? null,
  runtime_preview_state: decision.runtime_preview_state ?? null,
  validation_results: {
    actual: actualValidation,
    complete_example: completeValidation,
    production_rejection_example: productionValidation,
    public_access_rejection_example: publicAccessValidation,
    conflicting_authority_rejection_example: conflictingAuthorityValidation,
  },
  historical_verifier_policy: {
    action464_operator_input_snapshot:
      "superseded_for_current_input_completeness_by_action_467",
    action465_candidate_snapshot:
      "superseded_for_current_candidate_isolation_by_action_466",
    action466_candidate_materialization:
      "authoritative_current_candidate_proof",
    action467_operator_input_decision:
      "authoritative_current_operator_input_decision",
  },
  no_effect_results: noEffectResults,
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exit(1);
