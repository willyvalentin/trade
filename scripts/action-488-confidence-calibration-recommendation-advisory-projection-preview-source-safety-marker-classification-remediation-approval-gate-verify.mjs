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
const sha256 = (path) => createHash("sha256").update(read(path)).digest("hex");

const expected = Object.freeze({
  base: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  candidateHash: "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  fullHash: "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
  rootCause: "source_safety_marker_filename_false_positive_for_bounded_inventory_artifact",
  nextAction: "action_489_full_candidate_build_rehearsal_retry_after_source_safety_remediation",
  runtimeState: "runtime_preview_waiting_for_operator_inputs",
});

const expectedHashes = Object.freeze({
  "package.json": "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58",
  "package-lock.json": "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657",
  "next.config.ts": "614bce25b089c3f19b1e17a6346c74b858034040154c6621e7d35303004767cc",
  "tsconfig.json": "83b460dca7c269a562dba8f46d08de45397869b7ddbf31101eabca1a975eaa82",
  "eslint.config.mjs": "53065bd014f2b6fb89dc5f1a84cd37053217cbec71be6f15c3958a3b3bc4143c",
  "netlify.toml": "7cc579b1e99306abc9f21c0340c5b7e94309567d7b86e2757ba996d2b414b1b7",
});

const paths = Object.freeze({
  doc:
    "docs/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-classification-remediation-approval-gate.md",
  record:
    "docs/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-remediation-approval-record.json",
  action487:
    "docs/action-487-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json",
  action486:
    "docs/action-486-confidence-calibration-recommendation-advisory-projection-preview-temp-path-abort-remediation-approval-record.json",
  verifier:
    "scripts/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-classification-remediation-approval-gate-verify.mjs",
  test:
    "tests/e2e/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-classification-remediation-approval-gate.spec.ts",
});

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action487 = exists(paths.action487) ? readJson(paths.action487) : {};
const action486 = exists(paths.action486) ? readJson(paths.action486) : {};

function allFalse(object, keys) {
  return keys.every((key) => object?.[key] === false);
}

function hasAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

const localHashes = Object.fromEntries(
  Object.keys(expectedHashes).map((file) => [file, exists(file) ? sha256(file) : null]),
);

const noEffectKeys = [
  "rehearsal_performed",
  "network_used",
  "install_performed",
  "dependency_update_performed",
  "deployment_authorized",
  "deployment_performed",
  "activation_authorized",
  "preview_activated",
  "environment_modified",
  "netlify_operation_performed",
  "provider_call_executed",
  "supabase_access_created",
  "supabase_write_executed",
  "persistence_created",
  "replay_created",
  "confidence_applied",
  "feedback_created",
  "downstream_behavior_changed",
  "scanner_changed",
  "ranking_changed",
  "publication_changed",
  "execution_changed",
  "add_trade_changed",
  "risk_sizing_changed",
];

const forbiddenRecordPhrases = [
  "authorization:",
  "bearer ",
  "cookie:",
  "password:",
  "api_key:",
  "apikey:",
  "private_key:",
  "npm_token",
  "admin.netlify.com",
  "/users/",
  "f45d6b10ec06c67b69512e72fe41a682d233dcc676f63c8b867f9dd98cda9659",
];

const acceptedArtifacts = [
  "documentation_describing_secrets",
  "credential_policy_approval_record",
  "environment_prohibition_documentation",
  "test_file_named_around_token_rejection",
  "bounded_json_with_credential_value_recorded_false",
];

const rejectedArtifacts = [
  "dot_env",
  "dot_env_local",
  "dot_npmrc",
  "unknown_credential_json",
  "private_key_extensions",
  "pem_content_classification",
  "token_file",
  "unknown_sensitive_filename",
  "approved_path_wrong_hash",
  "approved_schema_secret_value_field",
  "newly_added_sensitive_looking_artifact_not_in_inventory",
];

const checks = {
  files_exist:
    exists(paths.doc) && exists(paths.record) && exists(paths.verifier) && exists(paths.test),
  action487_aborted_result:
    action487.rehearsal_decision === "full_candidate_rehearsal_aborted" &&
    action487.abort_reason === "source_safety_marker_detected" &&
    action487.path_safety_result === "passed" &&
    action487.source_inventory_result === "passed_bounded_git_head_plus_exact_overlay_inventory" &&
    action487.missing_source_file_count === 0 &&
    action487.unexpected_source_file_count === 0 &&
    action487.dependency_copy_created === false &&
    action487.command_results?.length === 0,
  action486_approval:
    action486.approval_decision === "approved" &&
    action486.next_action === "action_487_full_candidate_build_rehearsal_retry_after_temp_path_remediation" &&
    action486.deployment_performed === false &&
    action486.preview_activated === false,
  documentation_contract:
    hasAll(doc, [
      "source_safety_marker_filename_false_positive_for_bounded_inventory_artifact",
      "Filename indicators",
      "Exact prohibited path/type indicators remain authoritative",
      "Only exact approved artifact paths from the frozen candidate inventory may pass",
      "Unknown sensitive-looking files remain fail-closed",
      expected.nextAction,
    ]),
  root_cause:
    record.root_cause_classification === expected.rootCause &&
    record.candidate_defective === false &&
    record.action_487_rehearsal_result === "full_candidate_rehearsal_aborted" &&
    record.action_487_abort_reason === "source_safety_marker_detected",
  candidate_binding:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullHash &&
    record.candidate_file_count === 30,
  source_inventory_binding:
    record.path_safety_result === "passed" &&
    record.source_candidate_reconstruction_result === "passed" &&
    record.source_inventory_result === "passed_bounded_git_head_plus_exact_overlay_inventory" &&
    record.missing_source_file_count === 0 &&
    record.unexpected_source_file_count === 0 &&
    record.dependency_materialization_started === false &&
    record.commands_started_count === 0,
  classification_model:
    JSON.stringify(record.safety_classification_model?.ordered_phases) ===
      JSON.stringify([
        "phase_a_exact_prohibited_files",
        "phase_b_approved_bounded_artifacts",
        "phase_c_unknown_sensitive_looking_files",
      ]) &&
    record.safety_classification_model?.filename_indicators_are_advisory_only === true &&
    record.safety_classification_model?.exact_prohibited_path_type_indicators_authoritative === true &&
    record.safety_classification_model?.unknown_sensitive_files_fail_closed === true,
  prohibited_policy:
    record.prohibited_path_policy?.reject_env_files === true &&
    record.prohibited_path_policy?.reject_env_wildcards === true &&
    record.prohibited_path_policy?.reject_npmrc_in_candidate === true &&
    record.prohibited_path_policy?.reject_credential_files === true &&
    record.prohibited_path_policy?.reject_private_key_files === true &&
    record.prohibited_path_policy?.reject_pem_or_key_stores === true &&
    record.prohibited_path_policy?.reject_netlify_auth_or_config_credential_stores === true &&
    record.prohibited_path_policy?.reject_secret_bearing_deployment_files === true,
  approved_artifact_policy:
    record.approved_bounded_artifact_policy?.exact_path_required === true &&
    record.approved_bounded_artifact_policy?.exact_action_provenance_required === true &&
    record.approved_bounded_artifact_policy?.exact_classification_required === true &&
    record.approved_bounded_artifact_policy?.expected_content_hash_required_when_frozen === true &&
    record.approved_bounded_artifact_policy?.approved_bounded_schema_required_when_hash_not_frozen === true &&
    record.approved_bounded_artifact_policy?.wildcard_sensitive_filename_allowlist_allowed === false &&
    record.approved_bounded_artifact_policy?.directory_wide_docs_allowlist_allowed === false &&
    record.approved_bounded_artifact_policy?.arbitrary_json_allowlist_allowed === false,
  schema_content_boundary:
    record.schema_content_boundary_policy?.valid_json_required_where_expected === true &&
    record.schema_content_boundary_policy?.expected_top_level_schema_fields_required === true &&
    record.schema_content_boundary_policy?.credential_value_recorded_false_required_when_present === true &&
    record.schema_content_boundary_policy?.environment_value_payload_allowed === false &&
    record.schema_content_boundary_policy?.token_password_private_key_field_allowed === false &&
    record.schema_content_boundary_policy?.raw_secret_values_recorded === false &&
    record.schema_content_boundary_policy?.full_file_contents_recorded === false &&
    record.schema_content_boundary_policy?.external_credential_store_scanned === false,
  unknown_file_policy:
    record.unknown_file_policy?.unknown_sensitive_filename_rejected === true &&
    record.unknown_file_policy?.newly_discovered_similarly_named_file_rejected === true &&
    record.unknown_file_policy?.approved_path_wrong_hash_rejected === true &&
    record.unknown_file_policy?.approved_schema_secret_field_rejected === true &&
    record.unknown_file_policy?.sensitive_looking_file_outside_inventory_rejected === true,
  source_safety_vocabulary:
    JSON.stringify(record.source_safety_result_vocabulary) ===
      JSON.stringify([
        "source_safety_passed",
        "source_safety_aborted_secret_detected",
        "source_safety_aborted_unknown_sensitive_file",
        "source_safety_aborted_artifact_mismatch",
        "source_safety_failed",
      ]),
  test_matrix:
    acceptedArtifacts.every((item) => record.test_matrix?.approved_exact_bounded_artifacts?.includes(item)) &&
    rejectedArtifacts.every((item) => record.test_matrix?.rejected?.includes(item)) &&
    record.test_matrix?.additional_assertions?.includes("filename_only_false_positive_no_longer_aborts") &&
    record.test_matrix?.additional_assertions?.includes("actual_content_based_secret_detection_still_aborts") &&
    record.test_matrix?.additional_assertions?.includes("no_raw_value_appears_in_records") &&
    record.test_matrix?.additional_assertions?.includes("unknown_file_remains_fail_closed"),
  policy_preservation:
    record.candidate_policy_unchanged === true &&
    record.integrity_strategy === "baseline_plus_overlay_manifest_integrity" &&
    record.dependency_materialization_method === "temporary_verified_node_modules_copy" &&
    record.action_486_temp_path_procedure_unchanged === true &&
    record.action_482_dependency_procedure_unchanged === true &&
    record.rehearsal_policy_unchanged === true,
  approval_and_next_action:
    JSON.stringify(record.approval_vocabulary) ===
      JSON.stringify(["approved", "approved_with_conditions", "blocked"]) &&
    record.approval_decision === "approved" &&
    Array.isArray(record.unresolved_conditions) &&
    record.unresolved_conditions.length === 0 &&
    record.next_action === expected.nextAction,
  no_effects: allFalse(record, noEffectKeys),
  runtime_state:
    record.preview_flag_name === "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED" &&
    record.preview_flag_enabled === false &&
    record.current_runtime_preview_state === expected.runtimeState,
  package_config_hashes:
    Object.entries(expectedHashes).every(([file, value]) => localHashes[file] === value),
  no_raw_secret_values:
    record.schema_content_boundary_policy?.raw_secret_values_recorded === false &&
    !forbiddenRecordPhrases.some((phrase) => recordText.toLowerCase().includes(phrase)) &&
    !forbiddenRecordPhrases.some((phrase) => doc.toLowerCase().includes(phrase)),
};

const failed_conditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failed_conditions.length === 0 ? "passed" : "failed",
  action_nature: record.action_nature ?? null,
  action_487_rehearsal_result: record.action_487_rehearsal_result ?? null,
  root_cause_classification: record.root_cause_classification ?? null,
  approval_decision: record.approval_decision ?? null,
  next_action: record.next_action ?? null,
  current_runtime_preview_state: record.current_runtime_preview_state ?? null,
  rehearsal_performed: record.rehearsal_performed ?? null,
  deployment_authorized: record.deployment_authorized ?? null,
  activation_authorized: record.activation_authorized ?? null,
  local_hashes: localHashes,
  failed_conditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failed_conditions.length === 0 ? 0 : 1);
