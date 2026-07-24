#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";
const docPath =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-reconstruction-and-hash-freeze.md";
const action491Path =
  "docs/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-approval-record.json";
const action473Path =
  "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  oldChangeHash: "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  oldFullHash: "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
  oldCount: 30,
  newCount: 31,
  addedPath: "lib/pure-confidence-calibration.ts",
  addedHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  newChangeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  newFullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  nextAction: "action_493_runtime_complete_candidate_build_rehearsal_approval_gate",
};

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(repoRoot, relativePath), "utf8"));
}

function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
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

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function compactInventoryMaps(inventory) {
  return {
    paths: inventory.map((entry) => entry.path).sort(),
    hashes: Object.fromEntries(inventory.map((entry) => [entry.path, entry.sha256])),
  };
}

const failures = [];
for (const requiredPath of [recordPath, docPath, action491Path, action473Path, expected.addedPath]) {
  pass(existsSync(join(repoRoot, requiredPath)), `missing required file: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(recordPath);
  const action491 = readJson(action491Path);
  const action473 = readJson(action473Path);
  const doc = readFileSync(join(repoRoot, docPath), "utf8");
  const addedFileHash = sha256(readFileSync(join(repoRoot, expected.addedPath)));
  const { paths: recordPaths, hashes: recordHashes } = compactInventoryMaps(
    record.new_changed_file_inventory,
  );

  const recomputedChangeHash = sha256(canonical(record.new_changed_file_inventory));
  const recomputedFullHash = sha256(
    canonical({
      approved_change_candidate_file_count: record.new_candidate_file_count,
      approved_change_candidate_hash: record.new_change_candidate_hash,
      candidate_classification:
        "runtime_complete_candidate_from_clean_base_historical_overlay_and_approved_runtime_dependency",
      changed_file_content_hashes: recordHashes,
      changed_file_paths: recordPaths,
      full_candidate_build_result: "not_run_action_492_hash_freeze_only",
      full_candidate_test_result: "not_run_action_492_hash_freeze_only",
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

  const addedInventoryEntry = record.new_changed_file_inventory.find(
    (entry) => entry.path === expected.addedPath,
  );
  const action491Dependency = action491.runtime_dependency_inventory.find(
    (entry) => entry.path === expected.addedPath,
  );
  const action491Source = action491.authoritative_source_classifications.find(
    (entry) => entry.path === expected.addedPath,
  );
  const historicalPaths = recordPaths.filter((relativePath) => relativePath !== expected.addedPath);

  pass(action491.approval_decision === "approved", "Action 491 approval is not approved", failures);
  pass(
    action491.blocker_classification === "frozen_candidate_missing_runtime_dependency",
    "Action 491 blocker classification changed",
    failures,
  );
  pass(
    action491.first_missing_runtime_path === expected.addedPath,
    "Action 491 first missing runtime path changed",
    failures,
  );
  pass(action491.runtime_dependency_paths_missing === 1, "Action 491 missing path count changed", failures);
  pass(
    action491Dependency?.expected_sha256 === expected.addedHash,
    "Action 491 dependency hash binding changed",
    failures,
  );
  pass(
    action491Source?.source_classification === "present_only_in_current_dirty_worktree",
    "Action 491 source classification changed",
    failures,
  );
  pass(
    action491Source?.approved_for_future_exact_candidate_inclusion === true,
    "Action 491 did not approve exact future candidate inclusion",
    failures,
  );

  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.historical_change_candidate_hash === expected.oldChangeHash, "old change hash mismatch", failures);
  pass(
    record.historical_full_candidate_inventory_hash === expected.oldFullHash,
    "old full inventory hash mismatch",
    failures,
  );
  pass(record.historical_candidate_file_count === expected.oldCount, "old file count mismatch", failures);
  pass(
    record.historical_candidate_status === "historical_candidate_runtime_incomplete",
    "old candidate status mismatch",
    failures,
  );
  pass(record.historical_overlay_count === expected.oldCount, "historical overlay count mismatch", failures);
  pass(record.historical_overlay_missing_paths.length === 0, "historical overlay missing paths present", failures);
  pass(
    record.historical_overlay_unexpected_paths.length === 0,
    "historical overlay unexpected paths present",
    failures,
  );
  pass(record.historical_overlay_hashes_exact === true, "historical overlay hashes not exact", failures);

  pass(record.added_runtime_path === expected.addedPath, "added path mismatch", failures);
  pass(record.added_runtime_path_hash === expected.addedHash, "added path hash mismatch", failures);
  pass(addedFileHash === expected.addedHash, "current added file hash mismatch", failures);
  pass(
    JSON.stringify(record.added_runtime_path_provenance) === JSON.stringify([420, 423, 426]),
    "added runtime provenance mismatch",
    failures,
  );
  pass(
    addedInventoryEntry?.classification === "runtime_required_build_dependency",
    "added runtime classification mismatch",
    failures,
  );
  pass(
    addedInventoryEntry?.provenance === "action_420_action_423_action_426_action_491_approved_runtime_completion",
    "added runtime provenance string mismatch",
    failures,
  );
  pass(
    addedInventoryEntry?.source_classification === "present_only_in_current_dirty_worktree",
    "added runtime source classification mismatch",
    failures,
  );
  pass(record.approved_by_action === 491, "Action 491 approval binding missing", failures);

  pass(record.new_candidate_file_count === expected.newCount, "new candidate count mismatch", failures);
  pass(record.new_changed_file_inventory.length === expected.newCount, "new inventory length mismatch", failures);
  pass(new Set(recordPaths).size === expected.newCount, "new inventory has duplicate paths", failures);
  pass(
    historicalPaths.every((relativePath) => action473.changed_file_paths.includes(relativePath)),
    "historical overlay contains a non-Action-473 path",
    failures,
  );
  pass(
    action473.changed_file_paths.every((relativePath) => historicalPaths.includes(relativePath)),
    "Action 473 path missing from runtime-complete inventory",
    failures,
  );
  pass(!recordPaths.some((relativePath) => relativePath.startsWith(".env")), "environment file included", failures);
  pass(!recordPaths.some((relativePath) => relativePath.startsWith("node_modules/")), "node_modules included", failures);
  pass(!recordPaths.some((relativePath) => relativePath.startsWith(".netlify/")), ".netlify included", failures);
  pass(!recordPaths.some((relativePath) => relativePath.includes("post-trade")), "post-trade file included", failures);
  pass(
    recordPaths.filter((relativePath) => relativePath.startsWith("lib/")).length === 5,
    "unexpected sibling lib file count included",
    failures,
  );

  pass(record.new_change_candidate_hash === expected.newChangeHash, "new change hash mismatch", failures);
  pass(recomputedChangeHash === expected.newChangeHash, "new change hash does not recompute", failures);
  pass(record.new_change_candidate_hash !== expected.oldChangeHash, "new change hash reused old hash", failures);
  pass(record.new_full_candidate_inventory_hash === expected.newFullHash, "new full hash mismatch", failures);
  pass(recomputedFullHash === expected.newFullHash, "new full hash does not recompute", failures);
  pass(record.new_full_candidate_inventory_hash !== expected.oldFullHash, "new full hash reused old hash", failures);

  pass(record.actual_delta_count === expected.newCount, "actual delta count mismatch", failures);
  pass(record.expected_delta_count === expected.newCount, "expected delta count mismatch", failures);
  pass(record.unexpected_delta_paths.length === 0, "unexpected delta paths present", failures);
  pass(record.missing_delta_paths.length === 0, "missing delta paths present", failures);
  pass(record.runtime_dependency_paths_missing === 0, "runtime dependency paths still missing", failures);
  pass(record.runtime_dependency_missing_paths.length === 0, "runtime dependency missing path list not empty", failures);
  pass(record.runtime_dependency_closure_complete === true, "runtime dependency closure incomplete", failures);
  pass(record.runtime_preview_consumer_imports_resolvable === true, "preview consumer imports unresolved", failures);
  pass(record.advisory_adapter_imports_resolvable === true, "advisory adapter imports unresolved", failures);
  pass(record.projection_imports_resolvable === true, "projection imports unresolved", failures);
  pass(record.type_only_build_imports_resolvable === true, "type-only imports unresolved", failures);
  pass(record.control_only_artifacts_excluded === true, "control-only artifacts not excluded", failures);
  pass(record.unrelated_dirty_files_included === false, "unrelated dirty files included", failures);
  pass(record.control_only_artifacts_added === false, "control-only artifacts added", failures);
  pass(record.environment_or_credentials_included === false, "environment or credentials included", failures);
  pass(record.node_modules_included === false, "node_modules included flag set", failures);
  pass(record.build_output_included === false, "build output included", failures);
  pass(record.unclassified_files_included === false, "unclassified files included", failures);

  pass(
    record.candidate_reconstruction_result === "runtime_complete_candidate_reconstructed_and_frozen",
    "candidate reconstruction did not freeze",
    failures,
  );
  pass(record.old_deployment_approval_executable === false, "old approval executable", failures);
  pass(record.new_candidate_authoritative_for_future_actions === true, "new candidate not authoritative", failures);
  pass(record.rehearsal_performed === false, "rehearsal was performed", failures);
  pass(record.deployment_performed === false, "deployment was performed", failures);
  pass(record.preview_activated === false, "preview was activated", failures);
  pass(record.environment_modified === false, "environment was modified", failures);
  pass(record.network_used === false, "network was used", failures);
  pass(record.install_performed === false, "install was performed", failures);
  pass(record.netlify_operation_performed === false, "Netlify operation was performed", failures);
  pass(record.provider_call_executed === false, "provider call executed", failures);
  pass(record.supabase_read_executed === false, "Supabase read executed", failures);
  pass(record.supabase_write_executed === false, "Supabase write executed", failures);
  pass(record.persistence_created === false, "persistence created", failures);
  pass(record.replay_created === false, "replay created", failures);
  pass(record.confidence_applied === false, "confidence applied", failures);
  pass(record.feedback_created === false, "feedback created", failures);
  pass(record.scanner_changed === false, "scanner changed", failures);
  pass(record.ranking_changed === false, "ranking changed", failures);
  pass(record.publication_changed === false, "publication changed", failures);
  pass(record.execution_changed === false, "execution changed", failures);
  pass(record.add_trade_changed === false, "Add Trade changed", failures);
  pass(record.risk_sizing_changed === false, "risk sizing changed", failures);
  pass(record.cleanup_result === "temporary_candidate_removed", "cleanup result mismatch", failures);
  pass(record.temporary_candidate_absent_after_cleanup === true, "temporary candidate remains", failures);
  pass(
    record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs",
    "runtime preview state mismatch",
    failures,
  );
  pass(record.preview_flag_state === "absent_or_disabled", "preview flag state mismatch", failures);
  pass(record.preview_flag_enabled === false, "preview flag enabled", failures);
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Action 491 approved",
    "runtime-incomplete",
    expected.addedPath,
    expected.addedHash,
    expected.newChangeHash,
    expected.newFullHash,
    "No rehearsal",
    expected.nextAction,
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
  pass(!doc.includes("AUTOMATION_SECRET="), "doc contains automation secret assignment", failures);
  pass(!doc.includes("SUPABASE_SERVICE_ROLE_KEY="), "doc contains Supabase secret assignment", failures);
  pass(!doc.includes("TWELVE_DATA_API_KEY="), "doc contains provider secret assignment", failures);
}

const result = {
  verifier: "action_492_confidence_calibration_recommendation_advisory_projection_preview_runtime_complete_candidate_reconstruction_and_hash_freeze",
  status: failures.length === 0 ? "passed" : "failed",
  reconstruction_free: true,
  build_free: true,
  rehearsal_free: true,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  environment_immutable: true,
  credential_value_free: true,
  failures,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length > 0) process.exit(1);
