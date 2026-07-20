#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const sha256 = (text) => createHash("sha256").update(text).digest("hex");

const expected = Object.freeze({
  base: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  candidateHash: "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  fullHash: "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
  rootCause: "rehearsal_control_tests_incorrectly_required_inside_frozen_deployment_candidate",
  missingInternalPath: "lib/pure-confidence-calibration.ts",
  decision: "blocked",
  nextAction: "action_491_candidate_runtime_dependency_completeness_remediation_gate",
  runtimeState: "runtime_preview_waiting_for_operator_inputs",
});

const paths = Object.freeze({
  doc:
    "docs/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-gate.md",
  record:
    "docs/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-record.json",
  verifier:
    "scripts/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-gate-verify.mjs",
  test:
    "tests/e2e/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-gate.spec.ts",
  action489:
    "docs/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json",
  action488:
    "docs/action-488-confidence-calibration-recommendation-advisory-projection-preview-source-safety-marker-remediation-approval-record.json",
  inventory:
    "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json",
});

function git(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  }).trim();
}

function baseHasPath(path) {
  try {
    execFileSync("git", ["cat-file", "-e", `${expected.base}:${path}`], {
      cwd: root,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function baseHash(path) {
  try {
    const content = execFileSync("git", ["show", `${expected.base}:${path}`], {
      cwd: root,
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return sha256(content);
  } catch {
    return null;
  }
}

function hasAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function allFalse(object, keys) {
  return keys.every((key) => object?.[key] === false);
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const recordText = exists(paths.record) ? read(paths.record) : "";
const record = exists(paths.record) ? readJson(paths.record) : {};
const action489 = exists(paths.action489) ? readJson(paths.action489) : {};
const action488 = exists(paths.action488) ? readJson(paths.action488) : {};
const inventory = exists(paths.inventory) ? readJson(paths.inventory) : {};
const overlayPaths = new Set(inventory.changed_file_paths ?? []);
const overlayHashes = inventory.changed_file_content_hashes ?? {};

const classAPaths = Array.isArray(record.class_a_required_path_inventory)
  ? record.class_a_required_path_inventory
  : [];
const classACommands = Array.isArray(record.class_a_internal_command_inventory)
  ? record.class_a_internal_command_inventory
  : [];
const classB = Array.isArray(record.class_b_external_control_inventory)
  ? record.class_b_external_control_inventory
  : [];

const computedInventory = classAPaths.map((entry) => {
  const inOverlay = overlayPaths.has(entry.path);
  const inBase = baseHasPath(entry.path);
  const computedPresent = inOverlay || inBase;
  const computedHash = inOverlay ? overlayHashes[entry.path] ?? null : baseHash(entry.path);
  return {
    path: entry.path,
    recordedPresent: entry.present_in_frozen_candidate,
    computedPresent,
    recordedHash: entry.expected_hash,
    computedHash,
  };
});

const computedMissingPaths = computedInventory
  .filter((entry) => !entry.computedPresent)
  .map((entry) => entry.path);

const noEffectKeys = [
  "rehearsal_attempt_authorized",
  "deployment_authorized",
  "activation_authorized",
  "netlify_operation_performed",
  "network_used",
  "install_performed",
  "dependency_update_performed",
  "provider_call_executed",
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

const forbiddenPhrases = [
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

const checks = {
  files_exist:
    exists(paths.doc) && exists(paths.record) && exists(paths.verifier) && exists(paths.test),
  action489_abort:
    action489.rehearsal_decision === "full_candidate_rehearsal_aborted" &&
    action489.abort_reason === "command_inventory_unresolvable_in_bound_30_file_candidate" &&
    action489.path_safety_result === "passed" &&
    action489.source_safety_result === "source_safety_passed" &&
    action489.source_only_git_integrity_result ===
      "passed_git_diff_check_on_approved_source_overlay_without_node_modules_pathspec" &&
    action489.dependency_copy_result === "passed_temporary_verified_node_modules_copy" &&
    action489.serial_commands_started === false &&
    action489.cleanup_result === "temporary_candidate_and_dependency_copy_removed",
  action488_healthy:
    action488.approval_decision === "approved" &&
    action488.next_action === "action_489_full_candidate_build_rehearsal_retry_after_source_safety_remediation",
  root_cause:
    record.root_cause_classification === expected.rootCause &&
    doc.includes(expected.rootCause),
  candidate_bindings:
    record.clean_base_identifier === expected.base &&
    record.approved_change_candidate_hash === expected.candidateHash &&
    record.full_candidate_inventory_hash === expected.fullHash &&
    record.candidate_changed_file_count === 30 &&
    inventory.repository_base_identifier === expected.base &&
    inventory.approved_change_candidate_hash === expected.candidateHash &&
    inventory.full_candidate_inventory_hash === expected.fullHash,
  class_a_inventory_shape:
    classACommands.length === 10 &&
    classACommands.every((command) => command.execution_class === "candidate_internal") &&
    classACommands.some((command) => command.command_identity === "npx next typegen") &&
    classACommands.some((command) => command.command_identity === "npx tsc --noEmit") &&
    classACommands.some((command) => command.command_identity === "npm run build") &&
    classACommands.some((command) => command.command_identity === "npm run lint") &&
    classACommands.some((command) => command.command_id === "action_461_preview_consumer_suite") &&
    classACommands.some((command) => command.command_id === "action_462_independent_preview_consumer_suite") &&
    classACommands.some((command) => command.command_id === "recommendation_details_regression_suite") &&
    classACommands.some((command) => command.command_id === "runtime_side_effect_scans"),
  class_a_path_computation:
    classAPaths.length === record.class_a_required_path_count &&
    computedInventory.every((entry) => entry.recordedPresent === entry.computedPresent) &&
    computedInventory
      .filter((entry) => entry.computedPresent && entry.recordedHash !== null)
      .every((entry) => entry.recordedHash === entry.computedHash) &&
    JSON.stringify(computedMissingPaths) === JSON.stringify(record.class_a_missing_paths) &&
    computedMissingPaths.length === record.class_a_missing_path_count,
  missing_internal_path_blocks_approval:
    record.class_a_missing_path_count === 1 &&
    record.class_a_missing_paths?.[0] === expected.missingInternalPath &&
    record.unresolved_internal_paths === 1 &&
    record.approval_decision === expected.decision &&
    record.approval_blockers?.includes(
      `runtime_required_internal_path_missing_from_frozen_candidate:${expected.missingInternalPath}`,
    ),
  class_b_inventory:
    classB.length === record.class_b_external_control_path_count &&
    classB.includes(
      "tests/e2e/action-481-confidence-calibration-recommendation-advisory-projection-preview-deployment-reconstruction-remediation-gate.spec.ts",
    ) &&
    classB.includes(
      "scripts/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-source-safety-remediation-verify.mjs",
    ) &&
    classB.includes(
      "tests/e2e/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-gate.spec.ts",
    ) &&
    record.later_action_tests_classified_control_only === true &&
    record.external_control_checks_after_cleanup_only === true &&
    record.external_control_checks_can_mutate_candidate === false,
  runtime_relevance_policy:
    Object.values(record.candidate_runtime_relevance_policy ?? {}).every((value) => value === true),
  execution_sequence:
    JSON.stringify(record.execution_sequence) ===
      JSON.stringify([
        "phase_0_safe_temp_path_validation",
        "phase_1_source_candidate_reconstruction_overlay_hash_verification_source_inventory_source_safety_git_integrity",
        "phase_2_dependency_materialization_and_extraneous_package_exclusion",
        "phase_3a_candidate_internal_commands_serially",
        "phase_4_post_command_integrity_bounded_evidence_record_temp_cleanup",
        "phase_5_external_rehearsal_control_verifiers_and_tests_after_cleanup",
      ]) &&
    record.rehearsal_attempt_count_for_action_491 === 1 &&
    record.external_post_rehearsal_checks_count_as_attempt === false,
  failure_semantics:
    record.failure_semantics?.internal_command_failure_after_commands_begin === "full_candidate_rehearsal_failed" &&
    record.failure_semantics?.missing_required_internal_path_before_commands === "full_candidate_rehearsal_aborted" &&
    record.failure_semantics?.candidate_integrity_dependency_or_flag_blocker === "full_candidate_rehearsal_aborted" &&
    record.failure_semantics?.external_control_failure_after_candidate_internal_pass ===
      "rehearsal_evidence_verification_failed" &&
    record.failure_semantics?.external_failure_must_not_claim_candidate_runtime_build_failed === true,
  vocabularies:
    JSON.stringify(record.candidate_rehearsal_result_vocabulary) ===
      JSON.stringify([
        "full_candidate_rehearsal_passed",
        "full_candidate_rehearsal_failed",
        "full_candidate_rehearsal_aborted",
      ]) &&
    JSON.stringify(record.external_evidence_result_vocabulary) ===
      JSON.stringify([
        "rehearsal_evidence_verified",
        "rehearsal_evidence_verification_failed",
        "rehearsal_evidence_verification_aborted",
      ]) &&
    JSON.stringify(record.overall_readiness_vocabulary) ===
      JSON.stringify([
        "ready_for_preview_deployment_final_approval",
        "ready_with_conditions",
        "blocked",
      ]) &&
    JSON.stringify(record.approval_vocabulary) ===
      JSON.stringify(["approved", "approved_with_conditions", "blocked"]),
  no_candidate_expansion:
    record.candidate_expansion_required === false &&
    record.candidate_hashes_changed === false &&
    record.later_action_artifacts_copied_into_candidate === false &&
    record.dirty_working_tree_copied_into_candidate === false,
  no_effects: allFalse(record, noEffectKeys),
  preview_state:
    record.preview_flag_name === "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED" &&
    record.preview_flag_state === "absent_or_disabled" &&
    record.preview_flag_enabled === false &&
    record.current_runtime_preview_state === expected.runtimeState,
  next_action:
    record.next_action === expected.nextAction &&
    doc.includes(expected.nextAction),
  documentation_contract:
    hasAll(doc, [
      "Action 490 is a static approval gate",
      "Class A: Candidate-Internal Commands",
      "Class B: External Rehearsal-Control Checks",
      expected.missingInternalPath,
      "Approval decision: `blocked`",
      expected.nextAction,
    ]),
  no_secret_values:
    !forbiddenPhrases.some((phrase) => recordText.toLowerCase().includes(phrase)) &&
    !forbiddenPhrases.some((phrase) => doc.toLowerCase().includes(phrase)),
};

const failed_conditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failed_conditions.length === 0 ? "passed" : "failed",
  action_nature: record.action_nature ?? null,
  approval_decision: record.approval_decision ?? null,
  root_cause_classification: record.root_cause_classification ?? null,
  class_a_required_path_count: record.class_a_required_path_count ?? null,
  class_a_missing_path_count: record.class_a_missing_path_count ?? null,
  class_a_missing_paths: record.class_a_missing_paths ?? [],
  class_b_external_control_path_count: record.class_b_external_control_path_count ?? null,
  candidate_expansion_required: record.candidate_expansion_required ?? null,
  candidate_hashes_changed: record.candidate_hashes_changed ?? null,
  next_action: record.next_action ?? null,
  current_runtime_preview_state: record.current_runtime_preview_state ?? null,
  computed_missing_paths: computedMissingPaths,
  git_head: git(["rev-parse", "--short", "HEAD"]),
  failed_conditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failed_conditions.length === 0 ? 0 : 1);
