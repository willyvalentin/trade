#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-path-set-mismatch-remediation-approval-record.json";
const docPath =
  "docs/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-reconstruction-path-set-mismatch-remediation-gate.md";
const action492Path =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";
const action516Path =
  "docs/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-record.json";
const action515Path =
  "docs/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation-record.json";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  historicalChangeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  historicalFullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  historicalPathSetHash: "8f1d84af0e5bc4f377bd4d0215a53d68f0302a8bee09d2be8f869ae7e4d364f6",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  cleanBaseRouteHash: "dca5a743d80d2b85b0f8080293435e1218c4b0411436260e994fad86a715db81",
  nextAction: "action_518_remediated_32_file_candidate_reconstruction_and_hash_freeze",
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

function gitShow(commit, relativePath) {
  return execFileSync("git", ["show", `${commit}:${relativePath}`], {
    cwd: repoRoot,
    encoding: "buffer",
  });
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];
for (const relativePath of [recordPath, docPath, action492Path, action516Path, action515Path, routePath]) {
  pass(existsSync(join(repoRoot, relativePath)), `missing required file: ${relativePath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(recordPath);
  const action492 = readJson(action492Path);
  const action516 = readJson(action516Path);
  const action515 = readJson(action515Path);
  const routeSource = read(routePath);
  const doc = read(docPath);
  const action492Paths = action492.new_changed_file_inventory.map((entry) => entry.path).sort();
  const action492PathSetHash = sha256(JSON.stringify(action492Paths));
  const cleanBaseRouteHash = sha256(gitShow(expected.cleanBase, routePath));

  pass(action516.candidate_reconstruction_result === "candidate_reconstruction_aborted", "Action 516 result mismatch", failures);
  pass(
    action516.candidate_reconstruction_blocker === "historical_candidate_path_set_missing_remediated_route",
    "Action 516 blocker mismatch",
    failures,
  );
  pass(action516.new_candidate_authoritative_for_future_actions === false, "Action 516 incorrectly authoritative", failures);
  pass(action515.remediation_result === "candidate_build_source_remediation_completed", "Action 515 result mismatch", failures);
  pass(action515.invalid_route_export_removed === true, "Action 515 export removal mismatch", failures);

  pass(record.schema_version === "action_517_candidate_path_set_mismatch_remediation_approval_record_v1", "schema mismatch", failures);
  pass(record.source_action === 516, "source action mismatch", failures);
  pass(
    record.blocker_classification === "historical_candidate_path_set_missing_required_remediated_route",
    "blocker classification mismatch",
    failures,
  );
  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.historical_change_candidate_hash === expected.historicalChangeHash, "historical change hash mismatch", failures);
  pass(record.historical_full_candidate_inventory_hash === expected.historicalFullHash, "historical full hash mismatch", failures);
  pass(record.historical_candidate_file_count === 31, "historical count mismatch", failures);
  pass(
    record.historical_candidate_status === "historical_candidate_build_defective_and_incomplete",
    "historical status mismatch",
    failures,
  );
  pass(action492.new_candidate_file_count === 31, "Action 492 count mismatch", failures);
  pass(action492PathSetHash === expected.historicalPathSetHash, "Action 492 path-set hash mismatch", failures);
  pass(record.historical_candidate_path_set_hash === expected.historicalPathSetHash, "record path-set hash mismatch", failures);
  pass(!action492Paths.includes(routePath), "route already present in historical path set", failures);
  pass(record.historical_path_set_contains_route === false, "record historical route presence mismatch", failures);

  pass(record.clean_base_contains_route === true, "clean base route presence mismatch", failures);
  pass(cleanBaseRouteHash === expected.cleanBaseRouteHash, "clean base route hash mismatch", failures);
  pass(record.clean_base_route_hash === expected.cleanBaseRouteHash, "record clean base route hash mismatch", failures);
  pass(record.historical_candidate_inherited_clean_base_route_version === true, "inheritance classification mismatch", failures);
  pass(record.current_remediated_worktree_contains_route === true, "current route presence mismatch", failures);
  pass(sha256(read(routePath)) === expected.routeHash, "current route hash mismatch", failures);
  pass(record.missing_required_path === routePath, "missing path mismatch", failures);
  pass(record.missing_required_path_hash === expected.routeHash, "missing path hash mismatch", failures);
  pass(
    record.missing_required_path_classification === "required_build_source_path_addition",
    "missing path classification mismatch",
    failures,
  );
  pass(JSON.stringify(record.missing_required_path_provenance) === JSON.stringify([514, 515, 516]), "provenance mismatch", failures);
  pass(record.route_runtime_build_relevance === true, "route runtime relevance mismatch", failures);
  pass(record.route_build_defect_remediation === true, "route defect remediation mismatch", failures);
  pass(record.source_behavior_change_beyond_export_boundary === false, "source behavior boundary mismatch", failures);
  pass(JSON.stringify(routeExports(routeSource)) === JSON.stringify(["POST"]), "route export surface mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "record route export mismatch", failures);
  pass(routeSource.includes("function buildOutcomeEligibility"), "helper implementation missing", failures);
  pass(!routeSource.includes("export function buildOutcomeEligibility"), "helper still exported", failures);
  pass(record.buildOutcomeEligibility_implementation_present === true, "record helper presence mismatch", failures);
  pass(record.buildOutcomeEligibility_exported === false, "record helper export mismatch", failures);
  pass(record.helper_extraction === false, "helper extraction authorized", failures);
  pass(record.route_behavior_changed === false, "route behavior changed", failures);
  pass(record.provider_behavior_changed === false, "provider behavior changed", failures);
  pass(record.supabase_behavior_changed === false, "Supabase behavior changed", failures);

  pass(record.path_addition_required === true, "path addition not required", failures);
  pass(record.expected_new_candidate_file_count === 32, "expected file count mismatch", failures);
  pass(record.historical_31_paths_retained_exactly === true, "historical paths not retained", failures);
  pass(record.added_paths_count === 1, "added path count mismatch", failures);
  pass(JSON.stringify(record.added_paths) === JSON.stringify([routePath]), "added path mismatch", failures);
  pass(record.removed_paths_count === 0, "removed path count mismatch", failures);
  pass(record.path_replacements_from_historical_delta_count === 0, "replacement count mismatch", failures);
  pass(record.unrelated_additions_count === 0, "unrelated additions present", failures);

  pass(record.runtime_build_required_paths_total_after_proposed_addition === 32, "runtime/build total mismatch", failures);
  pass(record.runtime_dependency_paths_missing_after_proposed_addition === 0, "runtime dependencies missing", failures);
  pass(record.runtime_dependency_missing_paths_after_proposed_addition.length === 0, "runtime missing list not empty", failures);
  pass(record.runtime_dependency_closure_complete_after_proposed_addition === true, "runtime closure incomplete", failures);
  pass(record.unresolved_source_versions_after_proposed_addition === 0, "unresolved source versions present", failures);
  pass(record.route_imports_resolvable === true, "route imports unresolved", failures);
  pass(record.pure_confidence_calibration_imports_resolvable === true, "pure confidence imports unresolved", failures);
  pass(record.preview_advisory_chain_imports_resolvable === true, "preview/advisory imports unresolved", failures);
  pass(record.type_only_build_imports_resolvable === true, "type-only imports unresolved", failures);
  pass(record.control_only_files_excluded === true, "control-only files not excluded", failures);

  pass(record.unrelated_dirty_files_authorized === false, "unrelated dirty files authorized", failures);
  pass(record.control_only_artifacts_authorized === false, "control artifacts authorized", failures);
  pass(record.directory_wide_inclusion_authorized === false, "directory-wide inclusion authorized", failures);
  pass(record.additional_api_files_authorized === false, "additional API files authorized", failures);
  pass(record.package_or_lockfile_changes_authorized === false, "package/lockfile changes authorized", failures);
  pass(record.configuration_changes_authorized === false, "configuration changes authorized", failures);
  pass(record.environment_files_authorized === false, "environment files authorized", failures);
  pass(record.credentials_authorized === false, "credentials authorized", failures);
  pass(record.new_candidate_hashes_required === true, "new hashes not required", failures);
  for (const [key, message] of [
    ["candidate_reconstruction_performed", "candidate reconstruction performed"],
    ["candidate_hash_computation_performed", "candidate hashes computed"],
    ["build_performed", "build performed"],
    ["rehearsal_performed", "rehearsal performed"],
    ["deployment_performed", "deployment performed"],
    ["preview_activated", "preview activated"],
    ["network_used", "network used"],
    ["install_performed", "install performed"],
    ["netlify_operation_performed", "Netlify operation performed"],
    ["provider_call_executed", "provider called"],
    ["supabase_read_executed", "Supabase read executed"],
    ["supabase_write_executed", "Supabase write executed"],
    ["persistence_created", "persistence created"],
    ["replay_created", "replay created"],
    ["confidence_applied", "confidence applied"],
    ["feedback_created", "feedback created"],
    ["scanner_changed", "scanner changed"],
    ["ranking_changed", "ranking changed"],
    ["publication_changed", "publication changed"],
    ["execution_changed", "execution changed"],
    ["add_trade_changed", "Add Trade changed"],
    ["risk_sizing_changed", "risk sizing changed"],
    ["downstream_behavior_changed", "downstream behavior changed"],
  ]) {
    pass(record[key] === false, message, failures);
  }
  pass(record.historical_candidate_executable === false, "historical candidate executable", failures);
  pass(record.current_candidate_authorized_for_deployment === false, "current candidate authorized for deployment", failures);
  pass(record.path_set_readiness === "candidate_path_set_remediation_ready", "readiness mismatch", failures);
  pass(record.approval_decision === "approved", "approval mismatch", failures);
  pass(record.unresolved_conditions.length === 0, "unresolved conditions present", failures);
  pass(
    record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
    "runtime preview state mismatch",
    failures,
  );
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Action 517",
    "historical_candidate_path_set_missing_required_remediated_route",
    routePath,
    expected.routeHash,
    "required_build_source_path_addition",
    "Expected candidate file count: 32",
    "Approval decision: `approved`",
    expected.nextAction,
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
  pass(!doc.includes("AUTOMATION_SECRET="), "doc contains automation secret assignment", failures);
  pass(!doc.includes("SUPABASE_SERVICE_ROLE_KEY="), "doc contains Supabase secret assignment", failures);
  pass(!doc.includes("TWELVE_DATA_API_KEY="), "doc contains provider secret assignment", failures);
}

const result = {
  verifier:
    "action_517_confidence_calibration_recommendation_advisory_projection_preview_candidate_reconstruction_path_set_mismatch_remediation_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  path_set_readiness: "candidate_path_set_remediation_ready",
  approval_decision: "approved",
  reconstruction_free: true,
  hash_computation_free: true,
  build_free: true,
  rehearsal_free: true,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  environment_immutable: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length > 0) process.exit(1);
