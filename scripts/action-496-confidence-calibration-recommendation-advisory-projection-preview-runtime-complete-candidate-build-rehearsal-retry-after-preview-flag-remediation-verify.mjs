#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import ts from "typescript";
import vm from "vm";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const docPath =
  "docs/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-after-preview-flag-remediation.md";
const recordPath =
  "docs/action-496-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json";
const action495Path =
  "docs/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-record.json";
const action494Path =
  "docs/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-record.json";
const action492Path =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";
const helperPath =
  "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  addedPath: "lib/pure-confidence-calibration.ts",
  addedHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  canonicalFlag: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  helperHash: "7fab6acdd97d3811a2f7ed1bf95be34471f10b552c42f7781e125f88770bf716",
  blocker:
    "source_safety_rehearsal_checker_treated_non_authoritative_filename_and_whitespace_indicators_as_hard_blockers",
  nextAction: "action_497_source_safety_checker_false_positive_remediation_approval_gate",
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

function failUnless(condition, message, failures) {
  if (!condition) failures.push(message);
}

function loadPreviewFlagHelper() {
  const source = read(helperPath);
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const sandbox = { exports: {}, module: { exports: {} }, process: { env: {} } };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(output, sandbox, { filename: "preview-flag.js" });
  return (
    sandbox.module.exports.isConfidenceCalibrationProjectionPreviewEnabled ||
    sandbox.exports.isConfidenceCalibrationProjectionPreviewEnabled
  );
}

const failures = [];
for (const relativePath of [docPath, recordPath, action495Path, action494Path, action492Path, helperPath]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

if (failures.length === 0) {
  const doc = read(docPath);
  const record = readJson(recordPath);
  const action495 = readJson(action495Path);
  const action494 = readJson(action494Path);
  const action492 = readJson(action492Path);
  const helper = loadPreviewFlagHelper();

  failUnless(action495.approval_decision === "approved", "Action 495 approval mismatch", failures);
  failUnless(action495.unresolved_conditions.length === 0, "Action 495 unresolved conditions present", failures);
  failUnless(
    action495.next_action ===
      "action_496_runtime_complete_candidate_build_rehearsal_retry_after_preview_flag_check_remediation",
    "Action 495 next action mismatch",
    failures,
  );
  failUnless(action494.candidate_rehearsal_result === "full_candidate_rehearsal_aborted", "Action 494 result mismatch", failures);
  failUnless(action492.new_change_candidate_hash === expected.changeHash, "Action 492 change hash mismatch", failures);
  failUnless(action492.new_full_candidate_inventory_hash === expected.fullHash, "Action 492 full hash mismatch", failures);

  failUnless(record.source_action === 495, "source action mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path === expected.addedPath, "added path mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedHash, "added hash mismatch", failures);
  failUnless(sha256(expected.addedPath) === expected.addedHash, "current added file hash mismatch", failures);

  failUnless(
    record.safe_temp_subtree ===
      "ture/action-496-confidence-calibration-projection-preview-runtime-complete-candidate-rehearsal",
    "safe temp subtree mismatch",
    failures,
  );
  failUnless(record.temp_path_absolute_value_recorded === false, "absolute temp path recorded", failures);
  failUnless(record.path_safety_result === "path_safety_passed", "path safety did not pass", failures);
  failUnless(record.source_reconstruction_result === "source_reconstruction_passed", "source reconstruction did not pass", failures);
  failUnless(record.runtime_dependency_closure_result === "runtime_dependency_closure_passed", "runtime closure did not pass", failures);
  failUnless(record.runtime_dependency_paths_missing === 0, "runtime dependency paths missing", failures);
  failUnless(record.control_only_artifacts_excluded === true, "control artifacts not excluded", failures);

  failUnless(
    record.source_safety_checker_blocker_classification === expected.blocker,
    "blocker classification mismatch",
    failures,
  );
  failUnless(
    record.source_safety_policy_expected === "action_488_filename_indicators_non_authoritative",
    "Action 488 policy binding missing",
    failures,
  );
  failUnless(record.source_inventory_missing_files === 0, "source inventory missing files", failures);
  failUnless(record.unexpected_source_files === 0, "unexpected source files", failures);
  failUnless(record.merge_conflict_markers === 0, "merge conflict markers detected", failures);
  failUnless(record.env_file_count === 0, "env files detected", failures);
  failUnless(record.netlify_file_count === 0, "netlify files detected", failures);
  failUnless(record.node_modules_in_source_inventory === 0, "node_modules in source inventory", failures);

  failUnless(record.canonical_preview_flag === expected.canonicalFlag, "canonical flag mismatch", failures);
  failUnless(record.preview_flag_verification_strategy === "resolved_preview_flag_helper_evaluation", "flag strategy mismatch", failures);
  failUnless(record.preview_flag_gate_reached === false, "flag gate should not have been reached", failures);
  failUnless(record.preview_flag_helper_result === false, "helper result should be false", failures);
  failUnless(record.source_literal_authoritative === false, "source literal marked authoritative", failures);
  failUnless(record.parser_literal_true_activation_evidence === false, "parser literal marked activation evidence", failures);
  failUnless(record.alternate_activation_path_detected === false, "alternate activation path detected", failures);
  failUnless(record.raw_environment_value_recorded === false, "raw env value recorded", failures);
  failUnless(record.full_environment_enumeration_performed === false, "full env enumerated", failures);
  failUnless(record.environment_restored === true, "environment not restored", failures);
  failUnless(sha256(helperPath) === expected.helperHash, "helper hash changed", failures);
  failUnless(helper({}, "development") === false, "helper absent-key result not false", failures);
  failUnless(helper({ [expected.canonicalFlag]: "false" }, "development") === false, "helper false-string result not false", failures);
  failUnless(helper({ [expected.canonicalFlag]: "0" }, "development") === false, "helper zero-string result not false", failures);
  failUnless(helper({ [expected.canonicalFlag]: "1" }, "development") === false, "helper one-string result not false", failures);
  failUnless(helper({ [expected.canonicalFlag]: "TRUE" }, "development") === false, "helper uppercase true result not false", failures);
  failUnless(helper({ [expected.canonicalFlag]: " true " }, "development") === false, "helper whitespace true result not false", failures);
  failUnless(helper({ [expected.canonicalFlag]: "true" }, "development") === true, "helper exact true result not true", failures);
  failUnless(helper({ [expected.canonicalFlag]: "true" }, "production") === false, "helper production true result not false", failures);

  failUnless(record.dependency_materialization_result === "not_started_aborted_before_dependency_copy", "dependency copy should not start", failures);
  failUnless(record.network_used === false, "network used", failures);
  failUnless(record.install_performed === false, "install performed", failures);
  failUnless(record.dependency_update_performed === false, "dependency update performed", failures);
  failUnless(record.extraneous_local_package_count === 5, "extraneous count mismatch", failures);
  failUnless(record.extraneous_packages_excluded === false, "extraneous exclusion should not be reached", failures);

  failUnless(record.candidate_internal_required_paths_missing === 0, "internal required paths missing", failures);
  failUnless(record.candidate_command_results.length === 0, "candidate commands should not run", failures);
  failUnless(record.candidate_commands_started === false, "candidate commands started", failures);
  failUnless(record.runtime_projection_call_site_count === null, "call-site count should not be reached", failures);

  for (const key of [
    "package_manifest_modified",
    "lockfile_modified",
    "configuration_modified",
    "candidate_source_modified",
    "source_dependency_tree_modified",
    "active_worktree_modified",
    "environment_modified",
    "deployment_performed",
    "netlify_operation_performed",
    "preview_activated",
    "production_changed",
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
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.cleanup_result === "cleanup_passed", "cleanup did not pass", failures);
  failUnless(record.candidate_removed === true, "candidate not removed", failures);
  failUnless(record.copied_node_modules_removed === true, "copied node_modules not removed", failures);
  failUnless(record.rehearsal_attempt_count === 1, "attempt count mismatch", failures);
  failUnless(record.same_action_rerun_allowed === false, "same-action rerun allowed", failures);
  failUnless(record.candidate_rehearsal_result === "full_candidate_rehearsal_aborted", "candidate result mismatch", failures);
  failUnless(record.candidate_rehearsal_abort_reason === expected.blocker, "abort reason mismatch", failures);
  failUnless(record.external_evidence_result === "rehearsal_evidence_verified", "external evidence mismatch", failures);
  failUnless(record.overall_readiness === "blocked", "overall readiness mismatch", failures);
  failUnless(record.current_runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Action 496 executed",
    expected.changeHash,
    expected.fullHash,
    expected.blocker,
    "full_candidate_rehearsal_aborted",
    "rehearsal_evidence_verified",
    "blocked",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_496_confidence_calibration_recommendation_advisory_projection_preview_runtime_complete_candidate_build_rehearsal_retry_after_preview_flag_remediation",
  verification_status: failures.length === 0 ? "passed" : "failed",
  candidate_rehearsal_result: failures.length === 0 ? readJson(recordPath).candidate_rehearsal_result : null,
  external_evidence_result: failures.length === 0 ? readJson(recordPath).external_evidence_result : null,
  overall_readiness: failures.length === 0 ? readJson(recordPath).overall_readiness : null,
  next_action: failures.length === 0 ? readJson(recordPath).next_action : null,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  environment_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
