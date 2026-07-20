#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-record.json",
  doc:
    "docs/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-gate.md",
  action518:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
  action521:
    "docs/action-521-confidence-calibration-recommendation-advisory-projection-preview-action-520-path-safety-checker-remediation-approval-record.json",
  action522:
    "docs/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-record.json",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
};

const turbopackVocabulary = [
  "turbopack_candidate_source_error",
  "turbopack_candidate_module_resolution_error",
  "turbopack_candidate_css_processing_error",
  "turbopack_candidate_configuration_error",
  "turbopack_candidate_missing_build_required_artifact",
  "turbopack_candidate_generated_artifact_error",
  "turbopack_candidate_dependency_error",
  "turbopack_process_resource_error",
  "turbopack_runner_environment_error",
  "turbopack_internal_framework_error",
  "turbopack_failure_evidence_insufficient",
];

const webpackVocabulary = [
  "webpack_candidate_source_error",
  "webpack_candidate_module_resolution_error",
  "webpack_candidate_css_or_loader_error",
  "webpack_candidate_configuration_error",
  "webpack_candidate_missing_build_required_artifact",
  "webpack_candidate_generated_artifact_error",
  "webpack_candidate_dependency_error",
  "webpack_process_resource_error",
  "webpack_runner_environment_error",
  "webpack_internal_framework_error",
  "webpack_failure_evidence_insufficient",
];

const relationshipVocabulary = [
  "independent_build_engine_failures",
  "shared_candidate_source_trigger",
  "shared_missing_build_required_artifact",
  "shared_candidate_configuration_trigger",
  "shared_dependency_or_generated_artifact_trigger",
  "shared_runner_environment_failure",
  "turbopack_runner_failure_plus_webpack_candidate_failure",
  "turbopack_candidate_failure_plus_webpack_runner_failure",
  "active_worktree_difference_likely_explains_candidate_failures",
  "dual_failure_relationship_ambiguous",
];

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
  const action521 = readJson(paths.action521);
  const action522 = readJson(paths.action522);
  const routeSource = read(paths.route);

  pass(
    record.schema_version ===
      "action_523_candidate_build_failure_relationship_and_remediation_approval_record_v1",
    "schema mismatch",
    failures,
  );
  pass(record.source_action === 522, "source action mismatch", failures);
  pass(action521.next_action === "action_522_remediated_32_file_candidate_build_rehearsal_retry_after_path_safety_remediation", "Action 521 next action mismatch", failures);

  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate count mismatch", failures);
  pass(action518.new_change_candidate_hash === expected.changeHash, "Action 518 change hash mismatch", failures);
  pass(action518.new_full_candidate_inventory_hash === expected.fullHash, "Action 518 full hash mismatch", failures);
  pass(action518.new_candidate_file_count === 32, "Action 518 count mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "record route hash mismatch", failures);
  pass(sha256(routeSource) === expected.routeHash, "current route hash mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "record route exports mismatch", failures);
  pass(JSON.stringify(routeExports(routeSource)) === JSON.stringify(["POST"]), "current route exports mismatch", failures);

  pass(record.action_522_candidate_rehearsal_result === action522.candidate_rehearsal_result, "Action 522 result binding mismatch", failures);
  pass(record.action_522_overall_readiness === action522.overall_readiness, "Action 522 readiness binding mismatch", failures);
  pass(record.authoritative_build_attempt_count === action522.authoritative_build_attempt_count, "authoritative attempt binding mismatch", failures);
  pass(record.authoritative_build_result === action522.authoritative_build_result, "authoritative result binding mismatch", failures);
  pass(record.authoritative_build_phase === action522.authoritative_build_phase, "authoritative phase binding mismatch", failures);
  pass(record.authoritative_error_class === action522.authoritative_error_class, "authoritative error binding mismatch", failures);
  pass(record.webpack_diagnostic_attempt_count === action522.webpack_diagnostic_attempt_count, "Webpack attempt binding mismatch", failures);
  pass(record.webpack_diagnostic_result === action522.webpack_diagnostic_result, "Webpack result binding mismatch", failures);
  pass(action522.second_authoritative_build === false, "Action 522 second build flag mismatch", failures);
  pass(action522.deployment_performed === false, "Action 522 deployment flag mismatch", failures);
  pass(action522.preview_activated === false, "Action 522 activation flag mismatch", failures);
  pass(action522.cleanup_result === "cleanup_passed", "Action 522 cleanup mismatch", failures);
  pass(action522.external_evidence_result === "rehearsal_evidence_verified", "Action 522 evidence mismatch", failures);

  pass(record.authoritative_build_attempt_count === 1, "authoritative attempt count mismatch", failures);
  pass(record.webpack_diagnostic_attempt_count === 1, "Webpack attempt count mismatch", failures);
  pass(record.active_worktree_build_result === "passed", "active worktree result mismatch", failures);
  pass(record.active_worktree_build_establishes_candidate_readiness === false, "active worktree readiness override allowed", failures);
  pass(record.active_worktree_build_evidence_role === "diagnostic_context_only", "active worktree role mismatch", failures);

  pass(turbopackVocabulary.includes(record.turbopack_classification), "Turbopack classification outside vocabulary", failures);
  pass(record.turbopack_classification === "turbopack_process_resource_error", "Turbopack classification mismatch", failures);
  pass(record.authoritative_first_causal_error?.subsystem === "turbopack", "Turbopack causal subsystem mismatch", failures);
  pass(record.authoritative_first_causal_error?.error_class === record.turbopack_classification, "Turbopack causal class mismatch", failures);
  pass(String(record.authoritative_first_causal_error?.bounded_summary).includes("app/globals.css"), "Turbopack summary missing CSS", failures);
  pass(String(record.authoritative_first_causal_error?.bounded_summary).includes("worker process"), "Turbopack summary missing process resource", failures);

  pass(webpackVocabulary.includes(record.webpack_classification), "Webpack classification outside vocabulary", failures);
  pass(record.webpack_classification === "webpack_runner_environment_error", "Webpack classification mismatch", failures);
  pass(record.webpack_subsystem === "webpack", "Webpack subsystem mismatch", failures);
  pass(record.webpack_error_class === record.webpack_classification, "Webpack error class mismatch", failures);
  pass(record.webpack_first_causal_error?.error_class === record.webpack_classification, "Webpack causal class mismatch", failures);
  pass(String(record.webpack_first_causal_error?.bounded_summary).includes("public Supabase"), "Webpack summary mismatch", failures);

  pass(record.authoritative_implicated_paths.length <= 15, "too many authoritative paths", failures);
  pass(record.webpack_implicated_paths.length <= 15, "too many Webpack paths", failures);
  pass(record.authoritative_implicated_paths.some((item) => item.path === "app/globals.css" && item.classification === "clean_base_inherited_path" && item.discovery === "CSS-discovered"), "CSS path classification missing", failures);
  pass(record.authoritative_implicated_paths.some((item) => item.classification === "runner_path"), "runner path classification missing", failures);
  pass(record.webpack_implicated_paths.some((item) => item.path === paths.route && item.classification === "remediated_route" && item.discovery === "route-discovered"), "route classification missing", failures);
  pass(record.webpack_implicated_paths.some((item) => item.path === "public_supabase_browser_configuration" && item.classification === "configuration_path"), "public config classification missing", failures);
  pass(!JSON.stringify(record.authoritative_implicated_paths).includes("/Users/"), "absolute authoritative path retained", failures);
  pass(!JSON.stringify(record.webpack_implicated_paths).includes("/Users/"), "absolute Webpack path retained", failures);

  const comparison = record.candidate_worktree_difference_inventory;
  pass(comparison.some((item) => item.classification === "candidate_approved_path" && item.trace === "route-discovered"), "candidate approved route comparison missing", failures);
  pass(comparison.some((item) => item.classification === "configuration_difference" && item.trace === "framework-discovered"), "configuration difference comparison missing", failures);
  pass(comparison.some((item) => item.classification === "active_worktree_unrelated_dirty_path" && item.trace === "not referenced"), "unrelated dirty comparison missing", failures);
  pass(comparison.some((item) => item.classification === "control_only_artifact" && item.trace === "not referenced"), "control artifact comparison missing", failures);
  pass(record.candidate_worktree_static_comparison_summary?.candidate_changed_paths === 32, "candidate comparison count mismatch", failures);
  pass(record.candidate_worktree_static_comparison_summary?.candidate_paths_missing_from_current_worktree === 0, "candidate missing current path mismatch", failures);
  pass(record.candidate_worktree_static_comparison_summary?.candidate_paths_with_material_hash_divergence === 0, "candidate hash divergence mismatch", failures);
  pass(record.candidate_worktree_static_comparison_summary?.unrelated_dirty_post_trade_path_count >= 1, "post-trade dirty count missing", failures);

  pass(Array.isArray(record.additional_build_required_paths) && record.additional_build_required_paths.length === 0, "additional build paths should be empty", failures);
  pass(Array.isArray(record.outdated_build_required_paths) && record.outdated_build_required_paths.length === 0, "outdated build paths should be empty", failures);
  pass(record.runtime_build_closure_reassessment === "candidate_runtime_build_closure_still_complete", "closure reassessment mismatch", failures);
  pass(record.candidate_file_count_impact === 0, "candidate file count impact mismatch", failures);
  pass(relationshipVocabulary.includes(record.dual_engine_relationship), "relationship outside vocabulary", failures);
  pass(record.dual_engine_relationship === "shared_runner_environment_failure", "dual relationship mismatch", failures);
  pass(record.candidate_defect_status === "candidate_defect_not_proven", "candidate defect status mismatch", failures);
  pass(record.candidate_hash_impact === "candidate_hash_change_not_required", "hash impact mismatch", failures);
  pass(record.remediation_readiness === "build_failure_remediation_ready", "remediation readiness mismatch", failures);
  pass(record.approval_decision === "approved", "approval decision mismatch", failures);
  pass(Array.isArray(record.unresolved_conditions) && record.unresolved_conditions.length === 0, "unresolved conditions present", failures);
  pass(record.next_action === "action_524_turbopack_runner_environment_remediation_gate", "next action mismatch", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);

  allFalse(
    record,
    [
      "candidate_modified",
      "build_performed",
      "webpack_executed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "network_used",
      "install_performed",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ],
    failures,
  );

  for (const phrase of [
    "Action 523",
    expected.changeHash,
    expected.fullHash,
    expected.routeHash,
    "turbopack_process_resource_error",
    "webpack_runner_environment_error",
    "active_worktree_build_establishes_candidate_readiness: false",
    "candidate_runtime_build_closure_still_complete",
    "shared_runner_environment_failure",
    "candidate_defect_not_proven",
    "candidate_hash_change_not_required",
    "action_524_turbopack_runner_environment_remediation_gate",
    "runtime_preview_waiting_for_operator_inputs",
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
  pass(!/AUTOMATION_SECRET=|SUPABASE_SERVICE_ROLE_KEY=|TWELVE_DATA_API_KEY=/.test(doc), "doc contains secret assignment pattern", failures);
  pass(!/AUTOMATION_SECRET=|SUPABASE_SERVICE_ROLE_KEY=|TWELVE_DATA_API_KEY=/.test(JSON.stringify(record)), "record contains secret assignment pattern", failures);
}

const result = {
  verifier:
    "action_523_confidence_calibration_recommendation_advisory_projection_preview_candidate_build_failure_relationship_and_remediation_approval_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  remediation_readiness: failures.length === 0 ? "build_failure_remediation_ready" : "verification_failed",
  approval_decision: failures.length === 0 ? "approved" : "verification_failed",
  next_action:
    failures.length === 0
      ? "action_524_turbopack_runner_environment_remediation_gate"
      : "verification_failed",
  failures,
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
