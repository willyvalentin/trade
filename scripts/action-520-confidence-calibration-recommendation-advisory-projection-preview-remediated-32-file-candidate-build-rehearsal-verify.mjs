#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-record.json",
  doc:
    "docs/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal.md",
  action518:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
  action519:
    "docs/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-record.json",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function routeExports(source) {
  return [...source.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm)].map(
    (match) => match[1],
  );
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function allFalse(record, keys, failures) {
  for (const key of keys) {
    pass(record[key] === false, `${key} must be false`, failures);
  }
}

const failures = [];
for (const requiredPath of Object.values(paths)) {
  pass(existsSync(join(repoRoot, requiredPath)), `missing required path: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(paths.record);
  const doc = read(paths.doc);
  const action518 = readJson(paths.action518);
  const action519 = readJson(paths.action519);
  const routeSource = read(paths.route);

  pass(
    record.schema_version ===
      "action_520_remediated_32_file_candidate_build_rehearsal_record_v1",
    "schema mismatch",
    failures,
  );
  pass(record.source_action === 519, "source action mismatch", failures);
  pass(action519.approval_decision === "approved", "Action 519 approval mismatch", failures);
  pass(action519.next_action === "action_520_remediated_32_file_candidate_build_rehearsal", "Action 519 next action mismatch", failures);
  pass(action519.unresolved_conditions.length === 0, "Action 519 unresolved conditions present", failures);
  pass(action518.candidate_reconstruction_result === "remediated_32_file_candidate_reconstructed_and_frozen", "Action 518 result mismatch", failures);

  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate count mismatch", failures);
  pass(action518.new_change_candidate_hash === expected.changeHash, "Action 518 change hash mismatch", failures);
  pass(action518.new_full_candidate_inventory_hash === expected.fullHash, "Action 518 full hash mismatch", failures);
  pass(action518.new_candidate_file_count === 32, "Action 518 count mismatch", failures);

  pass(record.remediated_route_path === paths.route, "route path mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "record route hash mismatch", failures);
  pass(sha256(routeSource) === expected.routeHash, "current route hash mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "record route export mismatch", failures);
  pass(JSON.stringify(routeExports(routeSource)) === JSON.stringify(["POST"]), "current route export mismatch", failures);
  pass(!routeSource.includes("export function buildOutcomeEligibility"), "invalid helper export present", failures);
  pass(record.invalid_route_helper_exported === false, "invalid helper flag mismatch", failures);
  pass(record.runtime_dependency_closure_complete === true, "runtime closure flag mismatch", failures);
  pass(record.runtime_dependency_paths_missing === 0, "runtime missing path mismatch", failures);

  pass(record.path_safety_result === "path_safety_failed", "path safety result mismatch", failures);
  pass(
    record.path_safety_failure_class ===
      "macos_private_var_equivalence_not_handled_by_rehearsal_runner",
    "path safety failure class mismatch",
    failures,
  );
  pass(record.source_materialized_before_path_safety_passed === false, "source materialized before path safety", failures);
  pass(record.source_reconstruction_result === "not_started_path_safety_failed", "source reconstruction result mismatch", failures);
  pass(record.runtime_dependency_closure_result === "not_started_path_safety_failed", "runtime closure result mismatch", failures);
  pass(record.source_integrity_result === "not_started_path_safety_failed", "source integrity result mismatch", failures);
  pass(record.source_safety_result === "not_started_path_safety_failed", "source safety result mismatch", failures);
  pass(record.preview_flag_verification_result === "not_started_path_safety_failed", "preview flag result mismatch", failures);
  pass(record.dependency_materialization_result === "not_started_path_safety_failed", "dependency result mismatch", failures);
  pass(record.candidate_internal_required_paths_missing === 0, "candidate internal missing count mismatch", failures);
  pass(Array.isArray(record.prebuild_command_results) && record.prebuild_command_results.length === 0, "prebuild results should be empty", failures);

  pass(record.authoritative_build_command === "npm run build", "authoritative build command mismatch", failures);
  pass(record.authoritative_build_attempt_count === 0, "authoritative build attempts should be zero for pre-command abort", failures);
  pass(record.authoritative_build_result === "not_started", "authoritative build result mismatch", failures);
  pass(record.webpack_diagnostic_invocation_model === "direct_local_node_cli_invocation", "Webpack model mismatch", failures);
  pass(record.webpack_diagnostic_attempt_count === 0, "Webpack attempts mismatch", failures);
  pass(record.webpack_diagnostic_result === "webpack_diagnostic_not_required", "Webpack result mismatch", failures);
  pass(Array.isArray(record.candidate_command_results) && record.candidate_command_results.length === 0, "candidate command results should be empty", failures);
  pass(record.runtime_projection_call_site_count === null, "call-site count should be null before reconstruction", failures);

  pass(record.rehearsal_attempt_count === 1, "rehearsal attempt count mismatch", failures);
  pass(record.total_build_process_invocations === 0, "build process invocation count mismatch", failures);
  pass(record.second_authoritative_build === false, "second build flag mismatch", failures);
  pass(record.webpack_retry === false, "Webpack retry flag mismatch", failures);
  pass(record.same_action_repair === false, "same-action repair flag mismatch", failures);
  pass(record.candidate_rehearsal_result === "full_candidate_rehearsal_aborted", "candidate result mismatch", failures);
  pass(record.external_evidence_result === "rehearsal_evidence_verified", "external evidence result mismatch", failures);
  pass(record.overall_readiness === "blocked", "overall readiness mismatch", failures);
  pass(record.cleanup_result === "cleanup_passed_after_corrected_boundary_cleanup", "cleanup result mismatch", failures);
  pass(record.target_absent_after_cleanup === true, "target cleanup flag mismatch", failures);

  allFalse(
    record,
    [
      "raw_logs_retained",
      "raw_environment_values_recorded",
      "credential_values_recorded",
      "absolute_machine_paths_recorded",
      "candidate_modified",
      "package_or_lockfile_modified",
      "configuration_modified",
      "source_dependency_tree_modified",
      "active_worktree_modified",
      "environment_modified",
      "deployment_performed",
      "preview_activated",
      "production_changed",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "feedback_created",
      "confidence_applied",
      "downstream_behavior_changed",
    ],
    failures,
  );
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  pass(record.next_action === "action_521_action_520_path_safety_checker_remediation_gate", "next action mismatch", failures);

  for (const phrase of [
    "Action 520",
    "Action 519 approved",
    expected.changeHash,
    expected.fullHash,
    expected.routeHash,
    "path_safety_failed",
    "macOS `/var` and `/private/var` canonical equivalence",
    "full_candidate_rehearsal_aborted",
    "overall readiness: `blocked`",
    "No `npm run build`",
    "runtime_preview_waiting_for_operator_inputs",
    "action_521_action_520_path_safety_checker_remediation_gate",
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
  pass(!/AUTOMATION_SECRET=|SUPABASE_SERVICE_ROLE_KEY=|TWELVE_DATA_API_KEY=/.test(doc), "doc contains secret assignment pattern", failures);
}

const result = {
  verifier:
    "action_520_confidence_calibration_recommendation_advisory_projection_preview_remediated_32_file_candidate_build_rehearsal",
  verification_status: failures.length === 0 ? "passed" : "failed",
  candidate_rehearsal_result:
    failures.length === 0 ? "full_candidate_rehearsal_aborted" : "verification_failed",
  overall_readiness: failures.length === 0 ? "blocked" : "verification_failed",
  failures,
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
