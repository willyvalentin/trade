#!/usr/bin/env node

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const docPath =
  "docs/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal.md";
const recordPath =
  "docs/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-record.json";
const action492Path =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";
const action493Path =
  "docs/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-record.json";
const action492Verifier =
  "scripts/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-reconstruction-and-hash-freeze-verify.mjs";
const action493Verifier =
  "scripts/action-493-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-approval-gate-verify.mjs";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  addedPath: "lib/pure-confidence-calibration.ts",
  addedHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  nextAction: "action_495_preview_flag_rehearsal_check_remediation_approval_gate",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256(relativePath) {
  return createHash("sha256").update(readFileSync(join(repoRoot, relativePath))).digest("hex");
}

function runJson(relativePath) {
  return JSON.parse(
    execFileSync("node", [relativePath], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    }),
  );
}

function failUnless(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];
for (const relativePath of [docPath, recordPath, action492Path, action493Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

if (failures.length === 0) {
  const doc = read(docPath);
  const record = readJson(recordPath);
  const action492 = readJson(action492Path);
  const action493 = readJson(action493Path);
  const action492Report = runJson(action492Verifier);
  const action493Report = runJson(action493Verifier);

  failUnless(action492Report.status === "passed", "Action 492 verifier did not pass", failures);
  failUnless(action493Report.verification_status === "passed", "Action 493 verifier did not pass", failures);
  failUnless(action493.approval_decision === "approved", "Action 493 approval is not approved", failures);
  failUnless(action493.next_action === "action_494_runtime_complete_candidate_build_rehearsal", "Action 493 next action mismatch", failures);

  failUnless(record.source_action === 493, "source action mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full candidate hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path === expected.addedPath, "added runtime path mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedHash, "added runtime hash mismatch", failures);
  failUnless(sha256(expected.addedPath) === expected.addedHash, "current added runtime hash mismatch", failures);
  failUnless(action492.new_change_candidate_hash === record.change_candidate_hash, "Action 492 change hash mismatch", failures);
  failUnless(action492.new_full_candidate_inventory_hash === record.full_candidate_inventory_hash, "Action 492 full hash mismatch", failures);
  failUnless(action492.new_candidate_file_count === record.candidate_file_count, "Action 492 count mismatch", failures);

  failUnless(record.safe_temp_subtree === "ture/action-494-confidence-calibration-projection-preview-runtime-complete-candidate-rehearsal", "safe temp subtree mismatch", failures);
  failUnless(record.temp_path_absolute_value_recorded === false, "absolute temp path recorded", failures);
  failUnless(record.path_safety_result === "path_safety_passed", "path safety did not pass", failures);
  failUnless(record.source_reconstruction_result === "source_reconstruction_passed", "source reconstruction did not pass", failures);
  failUnless(record.runtime_dependency_closure_result === "runtime_dependency_closure_passed", "runtime closure did not pass", failures);
  failUnless(record.runtime_dependency_paths_missing === 0, "runtime dependency paths missing", failures);
  failUnless(record.source_integrity_result === "source_integrity_passed", "source integrity did not pass", failures);
  failUnless(record.source_safety_result === "source_safety_passed", "source safety did not pass", failures);

  failUnless(record.dependency_materialization_method === "temporary_verified_node_modules_copy", "dependency method mismatch", failures);
  failUnless(record.dependency_materialization_result === "not_started_aborted_before_dependency_copy", "dependency result mismatch", failures);
  failUnless(record.extraneous_local_package_count === 5, "extraneous package count mismatch", failures);
  failUnless(record.extraneous_packages_excluded === false, "extraneous exclusion should not be marked reached", failures);
  failUnless(record.extraneous_dependency_influence_result === "no_influence_detected", "extraneous influence mismatch", failures);

  failUnless(record.candidate_internal_required_paths_missing === 0, "candidate internal required paths missing", failures);
  failUnless(record.candidate_internal_required_missing_paths.length === 0, "candidate internal missing path list not empty", failures);
  failUnless(Array.isArray(record.candidate_command_results), "candidate command results not an array", failures);
  failUnless(record.candidate_command_results.length === 0, "candidate commands unexpectedly recorded", failures);
  failUnless(record.candidate_commands_started === false, "candidate commands started", failures);
  failUnless(record.runtime_projection_call_site_count === null, "runtime projection call site should be null after abort", failures);

  failUnless(record.preview_flag_state === "ambiguous_static_literal_check_runtime_helper_review_disabled", "preview flag state mismatch", failures);
  failUnless(record.preview_flag_enabled === false, "preview flag enabled", failures);
  failUnless(record.preview_activated === false, "preview activated", failures);

  for (const [relativePath, expectedHash] of Object.entries(record.protected_path_hashes)) {
    failUnless(existsSync(join(repoRoot, relativePath)), `protected path missing: ${relativePath}`, failures);
    if (existsSync(join(repoRoot, relativePath))) {
      failUnless(sha256(relativePath) === expectedHash, `protected path hash changed: ${relativePath}`, failures);
    }
  }

  failUnless(record.package_manifest_modified === false, "package manifest modified", failures);
  failUnless(record.lockfile_modified === false, "lockfile modified", failures);
  failUnless(record.configuration_modified === false, "configuration modified", failures);
  failUnless(record.candidate_source_modified === false, "candidate source modified", failures);
  failUnless(record.source_dependency_tree_modified === false, "source dependency tree modified", failures);
  failUnless(record.cleanup_result === "cleanup_passed", "cleanup did not pass", failures);
  failUnless(record.candidate_removed === true, "candidate not removed", failures);
  failUnless(record.copied_node_modules_removed === true, "copied node_modules not removed", failures);
  failUnless(record.rehearsal_attempt_count === 1, "rehearsal attempt count mismatch", failures);
  failUnless(record.same_action_rerun_allowed === false, "same-action rerun allowed", failures);
  failUnless(record.candidate_rehearsal_result === "full_candidate_rehearsal_aborted", "candidate rehearsal result mismatch", failures);
  failUnless(record.candidate_rehearsal_abort_reason === "preview_flag_check_ambiguous_static_literal_check", "abort reason mismatch", failures);
  failUnless(record.external_evidence_result === "rehearsal_evidence_verified", "external evidence result mismatch", failures);
  failUnless(record.overall_readiness === "blocked", "overall readiness mismatch", failures);

  for (const key of [
    "network_used",
    "install_performed",
    "dependency_update_performed",
    "deployment_performed",
    "preview_activated",
    "production_changed",
    "environment_modified",
    "netlify_operation_performed",
    "persistence_created",
    "replay_created",
    "provider_called",
    "supabase_accessed",
    "feedback_created",
    "confidence_applied",
    "downstream_behavior_changed",
    "scanner_changed",
    "ranking_changed",
    "publication_changed",
    "execution_changed",
    "add_trade_changed",
    "risk_sizing_changed",
    "raw_logs_recorded",
    "source_contents_recorded",
    "dependency_contents_recorded",
    "machine_specific_paths_recorded",
    "credential_values_recorded",
    "environment_values_recorded",
    "recommendation_data_recorded",
    "confidence_values_recorded",
    "projection_outputs_recorded",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.current_runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    expected.changeHash,
    expected.fullHash,
    "full_candidate_rehearsal_aborted",
    "preview_flag_check_ambiguous_static_literal_check",
    "cleanup_passed",
    "rehearsal_evidence_verified",
    "blocked",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier: "action_494_runtime_complete_candidate_build_rehearsal",
  verification_status: failures.length === 0 ? "passed" : "failed",
  candidate_rehearsal_result:
    failures.length === 0 ? readJson(recordPath).candidate_rehearsal_result : null,
  external_evidence_result:
    failures.length === 0 ? readJson(recordPath).external_evidence_result : null,
  overall_readiness: failures.length === 0 ? readJson(recordPath).overall_readiness : null,
  next_action: failures.length === 0 ? readJson(recordPath).next_action : null,
  reconstruction_free: true,
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

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
