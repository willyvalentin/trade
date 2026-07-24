#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-approval-record.json";
const docPath =
  "docs/action-510-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-capture-gate.md";
const action509Path =
  "docs/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-remediation-approval-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  addedRuntimeHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  nextAction: "action_511_webpack_build_failure_bounded_diagnostic_capture",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function failUnless(condition, message, failures) {
  if (!condition) failures.push(message);
}

function includesAll(values, expectedValues) {
  return expectedValues.every((value) => values.includes(value));
}

const failures = [];
for (const relativePath of [recordPath, docPath, action509Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const action509 = readJson(action509Path);
  const doc = read(docPath);

  failUnless(action509.approval_decision === "blocked", "Action 509 decision mismatch", failures);
  failUnless(
    action509.webpack_failure_classification === "webpack_failure_evidence_insufficient",
    "Action 509 Webpack classification mismatch",
    failures,
  );
  failUnless(action509.implicated_paths_resolved === false, "Action 509 path resolution mismatch", failures);
  failUnless(
    action509.candidate_defect_status === "candidate_defect_status_unresolved",
    "Action 509 candidate defect status mismatch",
    failures,
  );
  failUnless(
    action509.candidate_hash_impact === "candidate_hash_impact_unresolved",
    "Action 509 hash impact mismatch",
    failures,
  );

  failUnless(
    record.schema_version === "action_510_webpack_build_failure_bounded_diagnostic_capture_approval_record_v1",
    "schema mismatch",
    failures,
  );
  failUnless(record.source_action === 509, "source action mismatch", failures);
  failUnless(record.action_509_decision === "blocked", "record Action 509 decision mismatch", failures);
  failUnless(
    record.action_509_webpack_classification === "webpack_failure_evidence_insufficient",
    "record Action 509 classification mismatch",
    failures,
  );
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === 31, "candidate file count mismatch", failures);
  failUnless(record.added_runtime_path === "lib/pure-confidence-calibration.ts", "added runtime path mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedRuntimeHash, "added runtime hash mismatch", failures);

  failUnless(
    record.diagnostic_classification === "bounded_webpack_build_failure_diagnostic_capture",
    "diagnostic classification mismatch",
    failures,
  );
  failUnless(record.diagnostic_command === "next build --webpack", "diagnostic command mismatch", failures);
  failUnless(record.diagnostic_attempt_limit === 1, "attempt limit mismatch", failures);
  failUnless(record.diagnostic_retry_allowed === false, "retry should be false", failures);
  failUnless(record.diagnostic_is_comparison_only === true, "comparison-only mismatch", failures);
  failUnless(record.authoritative_build_performed === false, "authoritative build should not be performed", failures);

  const gateNames = record.prerequisite_gate_inventory.map((entry) => entry.gate);
  failUnless(
    includesAll(gateNames, [
      "safe_canonical_temp_path",
      "exact_candidate_reconstruction",
      "runtime_dependency_closure",
      "source_inventory",
      "source_integrity",
      "source_safety",
      "strict_wrong_hash_matrix",
      "semantic_preview_flag",
      "alternate_activation",
      "dependency_materialization",
      "five_extraneous_packages",
      "no_network_install_update",
    ]),
    "prerequisite inventory incomplete",
    failures,
  );
  failUnless(record.prerequisite_failure_result === "webpack_diagnostic_aborted", "prerequisite failure result mismatch", failures);
  failUnless(record.command_policy.exact_command === "next build --webpack", "command policy mismatch", failures);
  failUnless(record.command_policy.verified_by_action_507 === true, "Action 507 command verification mismatch", failures);
  failUnless(record.command_policy.package_json_modification_allowed === false, "package modification should be false", failures);

  failUnless(
    includesAll(record.sanitization_policy, [
      "redact_absolute_repository_paths",
      "redact_home_paths",
      "redact_tokens",
      "redact_authorization_headers",
      "redact_bearer_values",
      "redact_environment_values",
      "redact_provider_keys",
      "redact_high_confidence_secret_like_values",
    ]),
    "sanitization policy incomplete",
    failures,
  );
  failUnless(record.allowed_retained_path_format === "repository_relative_only", "path format mismatch", failures);
  failUnless(record.unsanitized_log_file_allowed === false, "unsanitized logs should be forbidden", failures);
  failUnless(record.retained_evidence_limits.first_causal_error_objects === 1, "first causal limit mismatch", failures);
  failUnless(record.retained_evidence_limits.sanitized_diagnostic_lines === 12, "diagnostic line limit mismatch", failures);
  failUnless(record.retained_evidence_limits.implicated_repository_relative_paths === 10, "implicated path limit mismatch", failures);
  failUnless(record.retained_evidence_limits.sanitized_stack_classifications === 5, "stack classification limit mismatch", failures);
  failUnless(record.first_causal_error_extraction_policy.prefer_earliest_specific_diagnostic === true, "first causal preference mismatch", failures);
  failUnless(record.first_causal_error_extraction_policy.source_excerpts_retained === false, "source excerpts should be false", failures);

  failUnless(
    includesAll(record.webpack_subsystem_vocabulary, [
      "webpack_typescript_validation",
      "webpack_css_processing",
      "webpack_module_resolution",
      "webpack_dependency_compilation",
      "webpack_internal_framework",
      "webpack_subsystem_unknown",
    ]),
    "subsystem vocabulary incomplete",
    failures,
  );
  failUnless(
    includesAll(record.webpack_error_class_vocabulary, [
      "webpack_candidate_typescript_error",
      "webpack_candidate_module_resolution_error",
      "webpack_candidate_css_or_loader_error",
      "webpack_dependency_compile_error",
      "webpack_runner_environment_error",
      "webpack_unknown_build_error",
    ]),
    "error vocabulary incomplete",
    failures,
  );
  failUnless(
    includesAll(record.path_classification_vocabulary, [
      "runtime_candidate_file",
      "clean_base_file",
      "added_runtime_file",
      "dependency_file",
      "framework_internal",
      "unknown",
    ]),
    "path vocabulary incomplete",
    failures,
  );
  failUnless(record.dirty_worktree_path_result.rehearsal_boundary_contamination_suspected === true, "dirty path result mismatch", failures);

  failUnless(
    includesAll(record.candidate_versus_runner_vocabulary, [
      "candidate_source_build_defect",
      "candidate_dependency_materialization_defect",
      "webpack_comparison_invocation_defect",
      "rehearsal_build_runner_defect",
      "webpack_failure_not_reproduced",
      "webpack_failure_evidence_still_insufficient",
    ]),
    "candidate-versus-runner vocabulary incomplete",
    failures,
  );
  failUnless(
    includesAll(record.dual_failure_relationship_vocabulary, [
      "independent_build_engine_failures",
      "shared_candidate_trigger_with_distinct_engine_failures",
      "shared_environment_contract_failure",
      "comparison_failure_caused_by_comparison_invocation",
      "dual_failure_relationship_ambiguous",
    ]),
    "dual failure vocabulary incomplete",
    failures,
  );
  failUnless(
    record.dual_failure_relationship_rule === "do_not_infer_shared_causality_from_matching_build_phase_only",
    "dual failure rule mismatch",
    failures,
  );
  failUnless(
    includesAll(record.candidate_hash_impact_vocabulary, [
      "candidate_hash_change_required",
      "candidate_hash_change_not_required",
      "candidate_hash_impact_unresolved",
    ]),
    "hash impact vocabulary incomplete",
    failures,
  );
  failUnless(record.candidate_hash_impact_rules.required_only_for_exact_candidate_source_or_configuration_change === true, "hash impact rule mismatch", failures);
  failUnless(
    includesAll(record.diagnostic_result_vocabulary, [
      "webpack_diagnostic_failure_captured",
      "webpack_diagnostic_passed_unexpectedly",
      "webpack_diagnostic_aborted",
      "webpack_diagnostic_capture_failed",
    ]),
    "diagnostic result vocabulary incomplete",
    failures,
  );
  failUnless(
    record.next_action_mapping.candidate_source_build_defect === "action_512_candidate_build_source_remediation",
    "source remediation mapping mismatch",
    failures,
  );
  failUnless(
    record.next_action_mapping.webpack_failure_not_reproduced === "action_512_dual_build_failure_nondeterminism_assessment_gate",
    "unexpected pass mapping mismatch",
    failures,
  );
  failUnless(
    record.next_action_mapping.webpack_failure_evidence_still_insufficient === "action_512_webpack_diagnostic_strategy_remediation_gate",
    "insufficient evidence mapping mismatch",
    failures,
  );

  failUnless(record.approval_decision === "approved", "approval decision mismatch", failures);
  failUnless(record.unresolved_conditions.length === 0, "unresolved conditions should be empty", failures);
  failUnless(record.future_diagnostic_execution_authorized === true, "future diagnostic should be authorized", failures);
  failUnless(record.diagnostic_execution_authorized === false, "current diagnostic execution should not be authorized", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);

  for (const key of [
    "diagnostic_execution_performed",
    "build_performed",
    "comparison_performed",
    "rehearsal_performed",
    "authoritative_build_executed",
    "webpack_build_executed",
    "candidate_modified",
    "package_modified",
    "lockfile_modified",
    "configuration_modified",
    "environment_modified",
    "network_used",
    "install_performed",
    "netlify_operation_performed",
    "provider_called",
    "supabase_accessed",
    "persistence_created",
    "replay_created",
    "feedback_created",
    "confidence_applied",
    "downstream_behavior_changed",
    "raw_logs_retained",
    "raw_environment_values_recorded",
    "credential_values_recorded",
    "source_contents_recorded",
    "deployment_authorized",
    "activation_authorized",
    "deployment_performed",
    "preview_activated",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  for (const phrase of [
    "Diagnostic classification: `bounded_webpack_build_failure_diagnostic_capture`",
    "Exact future command: `next build --webpack`",
    "Attempt limit: `1`",
    "Approval decision: `approved`",
    "Next action: `action_511_webpack_build_failure_bounded_diagnostic_capture`",
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_510_confidence_calibration_recommendation_advisory_projection_preview_webpack_build_failure_bounded_diagnostic_capture_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  diagnostic_classification: record?.diagnostic_classification ?? null,
  diagnostic_command: record?.diagnostic_command ?? null,
  diagnostic_attempt_limit: record?.diagnostic_attempt_limit ?? null,
  approval_decision: record?.approval_decision ?? null,
  future_diagnostic_execution_authorized: record?.future_diagnostic_execution_authorized ?? null,
  diagnostic_execution_performed: record?.diagnostic_execution_performed ?? null,
  runtime_preview_state: record?.runtime_preview_state ?? null,
  next_action: record?.next_action ?? null,
  build_free: true,
  comparison_free: true,
  rehearsal_free: true,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  candidate_immutable: true,
  environment_immutable: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
