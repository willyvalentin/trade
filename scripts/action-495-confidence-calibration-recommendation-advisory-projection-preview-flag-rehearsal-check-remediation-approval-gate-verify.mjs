#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const docPath =
  "docs/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-gate.md";
const recordPath =
  "docs/action-495-confidence-calibration-recommendation-advisory-projection-preview-flag-rehearsal-check-remediation-approval-record.json";
const action494RecordPath =
  "docs/action-494-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-record.json";
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
  blocker:
    "preview_flag_rehearsal_check_confused_parser_literal_with_resolved_flag_state",
  helperHash: "7fab6acdd97d3811a2f7ed1bf95be34471f10b552c42f7781e125f88770bf716",
  nextAction:
    "action_496_runtime_complete_candidate_build_rehearsal_retry_after_preview_flag_check_remediation",
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

const failures = [];
for (const relativePath of [docPath, recordPath, action494RecordPath, helperPath]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

if (failures.length === 0) {
  const doc = read(docPath);
  const record = readJson(recordPath);
  const action494 = readJson(action494RecordPath);
  const helperSource = read(helperPath);

  failUnless(record.source_action === 494, "source action mismatch", failures);
  failUnless(action494.candidate_rehearsal_result === "full_candidate_rehearsal_aborted", "Action 494 candidate result mismatch", failures);
  failUnless(action494.external_evidence_result === "rehearsal_evidence_verified", "Action 494 external evidence mismatch", failures);
  failUnless(action494.overall_readiness === "blocked", "Action 494 readiness mismatch", failures);
  failUnless(action494.rehearsal_attempt_count === 1, "Action 494 attempt count mismatch", failures);
  failUnless(record.action_494_candidate_result === action494.candidate_rehearsal_result, "recorded Action 494 candidate result mismatch", failures);
  failUnless(record.action_494_external_evidence_result === action494.external_evidence_result, "recorded Action 494 evidence mismatch", failures);
  failUnless(record.action_494_overall_readiness === action494.overall_readiness, "recorded Action 494 readiness mismatch", failures);

  failUnless(record.blocker_classification === expected.blocker, "blocker classification mismatch", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);
  failUnless(record.added_runtime_path === expected.addedPath, "added runtime path mismatch", failures);
  failUnless(record.added_runtime_path_hash === expected.addedHash, "added runtime hash mismatch", failures);
  failUnless(record.canonical_preview_flag === expected.canonicalFlag, "canonical flag mismatch", failures);
  failUnless(record.preview_flag_helper_path === helperPath, "helper path mismatch", failures);
  failUnless(record.preview_flag_helper_sha256 === expected.helperHash, "helper hash mismatch", failures);
  failUnless(sha256(helperPath) === expected.helperHash, "current helper hash changed", failures);

  failUnless(record.preview_flag_contract.enabled_only_when_resolved_value_is_exact_string_true === true, "exact true contract missing", failures);
  failUnless(record.preview_flag_contract.production_runtime_forces_disabled === true, "production disabled contract missing", failures);
  failUnless(record.preview_flag_contract.uppercase_true_disabled === true, "uppercase true contract missing", failures);
  failUnless(record.preview_flag_contract.whitespace_variants_disabled === true, "whitespace contract missing", failures);
  failUnless(record.preview_flag_contract.normalization_behavior_changed === false, "normalization changed", failures);
  failUnless(helperSource.includes('return rawValue === "true";'), "helper exact true comparison missing", failures);
  failUnless(helperSource.includes('if (runtime === "production") return false;'), "helper production guard missing", failures);

  failUnless(record.verification_strategy === "resolved_preview_flag_helper_evaluation", "verification strategy mismatch", failures);
  failUnless(record.source_literal_authoritative === false, "source literal marked authoritative", failures);
  failUnless(record.parser_literal_true_required_by_contract === true, "parser literal contract missing", failures);
  failUnless(record.parser_literal_true_activation_evidence === false, "parser literal marked activation evidence", failures);
  failUnless(record.canonical_key_only === true, "canonical key only not enforced", failures);
  failUnless(record.raw_environment_value_recorded === false, "raw environment value recorded", failures);
  failUnless(record.full_environment_enumeration_allowed === false, "full environment enumeration allowed", failures);
  failUnless(record.environment_modified === false, "environment modified", failures);
  failUnless(record.environment_restoration_required === true, "environment restoration not required", failures);

  const matrixCases = new Set(record.helper_test_matrix_required.map((entry) => entry.case));
  for (const requiredCase of [
    "key_absent",
    "undefined",
    "null_or_unavailable",
    "empty_string",
    "false_string",
    "zero_string",
    "one_string",
    "non_exact_string",
    "uppercase_true",
    "whitespace_true",
    "exact_true",
    "production_exact_true",
    "parser_literal_present_with_key_absent",
    "documentation_literal_present",
    "test_fixture_literal_present",
    "alternate_alias_absent",
    "query_parameter_absent",
    "url_fragment_absent",
    "local_storage_absent",
    "session_storage_absent",
    "cookie_absent",
  ]) {
    failUnless(matrixCases.has(requiredCase), `missing helper matrix case: ${requiredCase}`, failures);
  }

  failUnless(record.alternate_activation_policy.alternate_activation_paths_checked === true, "alternate paths not checked", failures);
  failUnless(record.alternate_activation_policy.alternate_activation_path_detected === false, "alternate path detected", failures);
  for (const key of [
    "alternate_environment_alias_allowed",
    "query_parameter_bypass_allowed",
    "url_fragment_bypass_allowed",
    "local_storage_bypass_allowed",
    "session_storage_bypass_allowed",
    "cookie_bypass_allowed",
    "persisted_database_preference_allowed",
    "remote_configuration_bypass_allowed",
    "netlify_injected_alternate_key_allowed",
    "hardcoded_forced_true_branch_allowed",
    "real_user_storage_access_allowed",
  ]) {
    failUnless(record.alternate_activation_policy[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.future_action_496_pre_command_order.includes("semantic_preview_flag_gate"), "future semantic flag gate missing", failures);
  failUnless(record.future_action_496_required_flag_gate.helper_result === false, "future helper result requirement mismatch", failures);
  failUnless(record.flag_result_vocabulary.includes("preview_flag_disabled_verified"), "result vocabulary missing disabled", failures);
  failUnless(record.flag_result_vocabulary.includes("preview_flag_enabled_detected"), "result vocabulary missing enabled", failures);
  failUnless(record.flag_result_vocabulary.includes("preview_flag_state_ambiguous"), "result vocabulary missing ambiguous", failures);
  failUnless(record.flag_result_vocabulary.includes("preview_flag_verification_failed"), "result vocabulary missing failed", failures);
  failUnless(record.action_496_semantics.future_rehearsal_attempts_authorized === 1, "future rehearsal count mismatch", failures);
  failUnless(record.action_496_semantics.candidate_expansion_allowed === false, "candidate expansion allowed", failures);
  failUnless(record.action_496_semantics.deployment_authorized === false, "future deployment authorized", failures);
  failUnless(record.action_496_semantics.activation_authorized === false, "future activation authorized", failures);

  failUnless(record.approval_decision === "approved", "approval decision mismatch", failures);
  failUnless(record.unresolved_conditions.length === 0, "unresolved conditions present", failures);
  failUnless(record.rehearsal_authorized === false, "rehearsal authorized in Action 495", failures);
  failUnless(record.build_authorized === false, "build authorized in Action 495", failures);
  failUnless(record.deployment_authorized === false, "deployment authorized", failures);
  failUnless(record.activation_authorized === false, "activation authorized", failures);
  failUnless(record.netlify_operation_authorized === false, "Netlify operation authorized", failures);

  for (const key of [
    "network_used",
    "install_performed",
    "candidate_modified",
    "preview_helper_modified",
    "package_or_lockfile_modified",
    "environment_modified",
    "credential_value_recorded",
    "provider_call_executed",
    "supabase_accessed",
    "persistence_created",
    "replay_created",
    "confidence_applied",
    "feedback_created",
    "downstream_behavior_changed",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    expected.blocker,
    expected.canonicalFlag,
    "resolved_preview_flag_helper_evaluation",
    "source-code literal is required parser logic",
    "Approval decision: `approved`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier: "action_495_preview_flag_rehearsal_check_remediation_approval_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  approval_decision: failures.length === 0 ? readJson(recordPath).approval_decision : null,
  blocker_classification: failures.length === 0 ? readJson(recordPath).blocker_classification : null,
  next_action: failures.length === 0 ? readJson(recordPath).next_action : null,
  rehearsal_free: true,
  build_free: true,
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
