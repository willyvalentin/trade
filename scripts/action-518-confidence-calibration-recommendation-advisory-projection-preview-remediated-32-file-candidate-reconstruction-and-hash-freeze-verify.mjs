#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
  doc:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze.md",
  action492:
    "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json",
  action515:
    "docs/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation-record.json",
  action516:
    "docs/action-516-confidence-calibration-recommendation-advisory-projection-preview-remediated-runtime-complete-candidate-record.json",
  action517:
    "docs/action-517-confidence-calibration-recommendation-advisory-projection-preview-candidate-path-set-mismatch-remediation-approval-record.json",
  action473:
    "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  historicalChangeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  historicalFullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  newChangeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  newFullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  nextAction: "action_519_remediated_32_file_candidate_build_rehearsal_approval_gate",
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

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortValue(value[key])]),
    );
  }
  return value;
}

function canonical(value) {
  return JSON.stringify(sortValue(value));
}

function compactInventoryMaps(inventory) {
  return {
    paths: inventory.map((entry) => entry.path).sort(),
    hashes: Object.fromEntries(inventory.map((entry) => [entry.path, entry.sha256])),
  };
}

function routeExports(source) {
  return [...source.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm)].map(
    (match) => match[1],
  );
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];
for (const requiredPath of Object.values(paths)) {
  pass(existsSync(join(repoRoot, requiredPath)), `missing required file: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(paths.record);
  const doc = read(paths.doc);
  const action492 = readJson(paths.action492);
  const action515 = readJson(paths.action515);
  const action516 = readJson(paths.action516);
  const action517 = readJson(paths.action517);
  const action473 = readJson(paths.action473);
  const routeSource = read(paths.route);
  const { paths: recordPaths, hashes: recordHashes } = compactInventoryMaps(
    record.new_changed_file_inventory,
  );
  const action492Paths = action492.new_changed_file_inventory.map((entry) => entry.path).sort();
  const retainedPaths = recordPaths.filter((relativePath) => relativePath !== paths.route);
  const routeEntry = record.new_changed_file_inventory.find((entry) => entry.path === paths.route);
  const recomputedChangeHash = sha256(canonical(record.new_changed_file_inventory));
  const recomputedFullHash = sha256(
    canonical({
      approved_change_candidate_file_count: record.new_candidate_file_count,
      approved_change_candidate_hash: record.new_change_candidate_hash,
      candidate_classification:
        "remediated_32_file_runtime_complete_candidate_from_clean_base_historical_overlay_and_required_route_addition",
      changed_file_content_hashes: recordHashes,
      changed_file_paths: recordPaths,
      full_candidate_build_result: "not_run_action_518_hash_freeze_only",
      full_candidate_test_result: "not_run_action_518_hash_freeze_only",
      preview_flag_state: "absent_or_disabled",
      repository_base_identifier: expected.cleanBase,
      required_lockfile_hash: action473.required_lockfile_hash,
      required_manifest_hashes: action473.required_manifest_hashes,
      runtime_projection_call_site_count: 1,
      unexpected_changed_file_count: 0,
      unrelated_post_trade_changed_file_count: 0,
      environment_file_count: 0,
      secret_file_count: 0,
      merge_conflict_count: 0,
    }),
  );

  pass(action517.path_set_readiness === "candidate_path_set_remediation_ready", "Action 517 readiness mismatch", failures);
  pass(action517.approval_decision === "approved", "Action 517 approval mismatch", failures);
  pass(action517.expected_new_candidate_file_count === 32, "Action 517 expected count mismatch", failures);
  pass(action517.missing_required_path === paths.route, "Action 517 route path mismatch", failures);
  pass(action517.missing_required_path_hash === expected.routeHash, "Action 517 route hash mismatch", failures);
  pass(action516.candidate_reconstruction_result === "candidate_reconstruction_aborted", "Action 516 result mismatch", failures);
  pass(action515.invalid_route_export_removed === true, "Action 515 route export remediation mismatch", failures);

  pass(record.schema_version === "action_518_remediated_32_file_candidate_record_v1", "schema mismatch", failures);
  pass(record.source_action === 517, "source action mismatch", failures);
  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.historical_change_candidate_hash === expected.historicalChangeHash, "historical change hash mismatch", failures);
  pass(record.historical_full_candidate_inventory_hash === expected.historicalFullHash, "historical full hash mismatch", failures);
  pass(record.historical_candidate_file_count === 31, "historical count mismatch", failures);
  pass(
    record.historical_candidate_status === "historical_candidate_build_defective_and_incomplete",
    "historical status mismatch",
    failures,
  );
  pass(record.clean_base_identity_verified === true, "clean base identity not verified", failures);
  pass(record.historical_overlay_count === 31, "historical overlay count mismatch", failures);
  pass(record.historical_overlay_missing_paths.length === 0, "historical overlay missing paths present", failures);
  pass(record.historical_overlay_unexpected_paths.length === 0, "historical overlay unexpected paths present", failures);
  pass(record.historical_overlay_hashes_exact === true, "historical overlay hashes not exact", failures);

  pass(record.added_route_path === paths.route, "added route path mismatch", failures);
  pass(record.added_route_hash === expected.routeHash, "added route hash mismatch", failures);
  pass(sha256(routeSource) === expected.routeHash, "current route hash mismatch", failures);
  pass(record.added_route_classification === "required_build_source_path_addition", "route classification mismatch", failures);
  pass(JSON.stringify(record.added_route_provenance) === JSON.stringify([514, 515, 516, 517]), "route provenance mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "record route export surface mismatch", failures);
  pass(JSON.stringify(routeExports(routeSource)) === JSON.stringify(["POST"]), "current route export surface mismatch", failures);
  pass(routeSource.includes("function buildOutcomeEligibility"), "buildOutcomeEligibility implementation missing", failures);
  pass(!routeSource.includes("export function buildOutcomeEligibility"), "buildOutcomeEligibility still exported", failures);
  pass(record.invalid_route_export_removed === true, "invalid route export not marked removed", failures);
  pass(record.buildOutcomeEligibility_implementation_present === true, "helper presence mismatch", failures);
  pass(record.buildOutcomeEligibility_exported === false, "helper export mismatch", failures);
  pass(record.helper_extracted === false, "helper extraction occurred", failures);
  pass(record.helper_behavior_changed === false, "helper behavior changed", failures);
  pass(record.route_behavior_changed === false, "route behavior changed", failures);
  pass(record.provider_behavior_changed === false, "provider behavior changed", failures);
  pass(record.supabase_behavior_changed === false, "Supabase behavior changed", failures);
  pass(routeEntry?.sha256 === expected.routeHash, "inventory route hash mismatch", failures);
  pass(routeEntry?.classification === "required_build_source_path_addition", "inventory route classification mismatch", failures);

  pass(action492.new_candidate_file_count === 31, "Action 492 file count mismatch", failures);
  pass(record.retained_historical_path_count === 31, "retained path count mismatch", failures);
  pass(JSON.stringify(retainedPaths) === JSON.stringify(action492Paths), "retained paths differ from Action 492", failures);
  pass(record.added_path_count === 1, "added path count mismatch", failures);
  pass(JSON.stringify(record.added_paths) === JSON.stringify([paths.route]), "added paths mismatch", failures);
  pass(record.removed_path_count === 0, "removed path count mismatch", failures);
  pass(record.unrelated_additions_count === 0, "unrelated additions count mismatch", failures);
  pass(record.unclassified_additions_count === 0, "unclassified additions count mismatch", failures);
  pass(record.new_candidate_file_count === 32, "new candidate count mismatch", failures);
  pass(record.new_changed_file_inventory.length === 32, "new inventory length mismatch", failures);
  pass(new Set(recordPaths).size === 32, "duplicate paths in new inventory", failures);
  pass(recordPaths.includes(paths.route), "new inventory missing route", failures);
  pass(recordPaths.filter((relativePath) => relativePath.startsWith("app/api/")).length === 1, "sibling API path included", failures);
  pass(!recordPaths.some((relativePath) => relativePath.startsWith(".env")), "environment file included", failures);
  pass(!recordPaths.some((relativePath) => relativePath.startsWith(".netlify/")), ".netlify included", failures);
  pass(!recordPaths.some((relativePath) => relativePath.startsWith("node_modules/")), "node_modules included", failures);
  pass(!recordPaths.some((relativePath) => relativePath.includes("post-trade")), "post-trade file included", failures);
  pass(!recordPaths.some((relativePath) => relativePath.includes("action-518")), "Action 518 control artifact included", failures);

  pass(record.new_change_candidate_hash === expected.newChangeHash, "new change hash mismatch", failures);
  pass(recomputedChangeHash === expected.newChangeHash, "new change hash does not recompute", failures);
  pass(record.new_change_candidate_hash !== expected.historicalChangeHash, "new change hash reused historical hash", failures);
  pass(record.new_full_candidate_inventory_hash === expected.newFullHash, "new full hash mismatch", failures);
  pass(recomputedFullHash === expected.newFullHash, "new full hash does not recompute", failures);
  pass(record.new_full_candidate_inventory_hash !== expected.historicalFullHash, "new full hash reused historical hash", failures);

  pass(record.actual_delta_count === 32, "actual delta count mismatch", failures);
  pass(record.expected_delta_count === 32, "expected delta count mismatch", failures);
  pass(record.unexpected_delta_paths.length === 0, "unexpected delta paths present", failures);
  pass(record.missing_delta_paths.length === 0, "missing delta paths present", failures);
  pass(record.runtime_dependency_paths_missing === 0, "runtime dependency paths missing", failures);
  pass(record.runtime_dependency_missing_paths.length === 0, "runtime missing path list not empty", failures);
  pass(record.runtime_dependency_closure_complete === true, "runtime closure incomplete", failures);
  pass(record.runtime_preview_consumer_imports_resolvable === true, "preview consumer imports unresolved", failures);
  pass(record.advisory_adapter_imports_resolvable === true, "advisory adapter imports unresolved", failures);
  pass(record.projection_imports_resolvable === true, "projection imports unresolved", failures);
  pass(record.pure_confidence_calibration_imports_resolvable === true, "pure confidence imports unresolved", failures);
  pass(record.evaluate_outcomes_route_imports_resolvable === true, "evaluate-outcomes imports unresolved", failures);
  pass(record.type_only_build_imports_resolvable === true, "type-only imports unresolved", failures);
  pass(record.route_import_closure_complete === true, "route import closure incomplete", failures);
  pass(record.control_only_artifacts_excluded === true, "control-only artifacts not excluded", failures);

  for (const [key, message] of [
    ["unrelated_dirty_files_included", "unrelated dirty files included"],
    ["control_only_artifacts_added", "control-only artifacts added"],
    ["later_action_control_artifacts_newly_included", "later Action artifacts included"],
    ["additional_api_paths_added", "additional API paths added"],
    ["directory_wide_app_api_inclusion", "directory-wide app/api included"],
    ["environment_or_credentials_included", "environment or credentials included"],
    ["node_modules_included", "node_modules included"],
    ["build_output_included", "build output included"],
    ["logs_included", "logs included"],
    ["package_caches_included", "package caches included"],
    ["unclassified_files_included", "unclassified files included"],
    ["historical_candidate_executable", "historical candidate executable"],
    ["old_deployment_approval_executable", "old deployment approval executable"],
    ["action_518_deployment_approval_granted", "Action 518 deployment approval granted"],
    ["build_performed", "build performed"],
    ["rehearsal_performed", "rehearsal performed"],
    ["deployment_performed", "deployment performed"],
    ["preview_activated", "preview activated"],
    ["environment_modified", "environment modified"],
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

  pass(
    record.candidate_reconstruction_result === "remediated_32_file_candidate_reconstructed_and_frozen",
    "candidate reconstruction result mismatch",
    failures,
  );
  pass(record.new_candidate_status === "remediated_32_file_runtime_complete_candidate", "new candidate status mismatch", failures);
  pass(record.new_candidate_authoritative_for_future_actions === true, "new candidate not authoritative", failures);
  pass(record.cleanup_result === "temporary_candidate_removed", "cleanup result mismatch", failures);
  pass(record.temporary_candidate_absent_after_cleanup === true, "temporary candidate still present", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Action 518",
    expected.newChangeHash,
    expected.newFullHash,
    "New candidate file count: 32",
    "Runtime/build dependency paths missing: 0",
    "temporary_candidate_removed",
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
    "action_518_confidence_calibration_recommendation_advisory_projection_preview_remediated_32_file_candidate_reconstruction_and_hash_freeze",
  verification_status: failures.length === 0 ? "passed" : "failed",
  candidate_reconstruction_result: "remediated_32_file_candidate_reconstructed_and_frozen",
  new_candidate_file_count: 32,
  new_change_candidate_hash: expected.newChangeHash,
  new_full_candidate_inventory_hash: expected.newFullHash,
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
