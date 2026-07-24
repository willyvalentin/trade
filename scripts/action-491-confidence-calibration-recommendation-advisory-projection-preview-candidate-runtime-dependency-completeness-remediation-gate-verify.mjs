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
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

const expected = Object.freeze({
  base: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  oldCandidateHash:
    "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  oldFullHash:
    "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
  oldCount: 30,
  action490RootCause:
    "rehearsal_control_tests_incorrectly_required_inside_frozen_deployment_candidate",
  blocker: "frozen_candidate_missing_runtime_dependency",
  missingPath: "lib/pure-confidence-calibration.ts",
  missingPathHash:
    "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  dependencyDecision: "runtime_dependency_completeness_ready",
  approvalDecision: "approved",
  oldCandidateStatus: "historical_candidate_runtime_incomplete",
  overallStatus: "candidate_reconstruction_required",
  nextAction: "action_492_runtime_complete_candidate_reconstruction_and_hash_freeze",
  runtimeState: "runtime_preview_waiting_for_operator_inputs",
});

const paths = Object.freeze({
  doc:
    "docs/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-gate.md",
  record:
    "docs/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-approval-record.json",
  verifier:
    "scripts/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-gate-verify.mjs",
  test:
    "tests/e2e/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-gate.spec.ts",
  action490:
    "docs/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-record.json",
  action489:
    "docs/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-record.json",
  inventory:
    "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json",
});

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: options.encoding ?? "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: options.stdio ?? ["ignore", "pipe", "ignore"],
  });
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
    return sha256(
      execFileSync("git", ["show", `${expected.base}:${path}`], {
        cwd: root,
        stdio: ["ignore", "pipe", "ignore"],
      }),
    );
  } catch {
    return null;
  }
}

function currentHash(path) {
  return exists(path) ? sha256(readFileSync(abs(path))) : null;
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
const action490 = exists(paths.action490) ? readJson(paths.action490) : {};
const action489 = exists(paths.action489) ? readJson(paths.action489) : {};
const inventory = exists(paths.inventory) ? readJson(paths.inventory) : {};
const overlayPaths = new Set(inventory.changed_file_paths ?? []);
const overlayHashes = inventory.changed_file_content_hashes ?? {};
const runtimeInventory = Array.isArray(record.runtime_dependency_inventory)
  ? record.runtime_dependency_inventory
  : [];
const missingPaths = runtimeInventory
  .filter((entry) => entry.frozen_candidate_presence === false)
  .map((entry) => entry.path);
const computedInventory = runtimeInventory.map((entry) => {
  const inBase = baseHasPath(entry.path);
  const inOverlay = overlayPaths.has(entry.path);
  const expectedHash = inOverlay ? overlayHashes[entry.path] ?? null : baseHash(entry.path);
  return {
    path: entry.path,
    recordedBase: entry.clean_base_presence,
    computedBase: inBase,
    recordedOverlay: entry.approved_overlay_presence,
    computedOverlay: inOverlay,
    recordedExpectedHash: entry.expected_sha256,
    computedExpectedHash: entry.frozen_candidate_presence ? expectedHash : currentHash(entry.path),
  };
});

const source = record.authoritative_source_classifications?.[0] ?? {};
const noEffectKeys = [
  "reconstruction_performed",
  "rehearsal_performed",
  "deployment_performed",
  "preview_activated",
  "environment_modified",
  "network_used",
  "install_performed",
  "netlify_operation_performed",
  "provider_call_executed",
  "supabase_read_executed",
  "supabase_write_executed",
  "persistence_created",
  "replay_created",
  "confidence_applied",
  "feedback_created",
  "scanner_changed",
  "ranking_changed",
  "publication_changed",
  "execution_changed",
  "add_trade_changed",
  "risk_sizing_changed",
  "downstream_behavior_changed",
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

const importChecks = {
  detailsImportsPreview:
    read("components/recommendations/RecommendationDetailsModal.tsx").includes(
      "ConfidenceCalibrationProjectionPreview",
    ) &&
    read("components/recommendations/RecommendationDetailsModal.tsx").includes(
      "@/lib/confidence-calibration-recommendation-advisory-projection-preview",
    ),
  previewImportsProjection:
    read("lib/confidence-calibration-recommendation-advisory-projection-preview.ts").includes(
      "buildConfidenceCalibrationRecommendationProjection",
    ) &&
    read("lib/confidence-calibration-recommendation-advisory-projection-preview.ts").includes(
      "./confidence-calibration-recommendation-advisory-projection",
    ),
  projectionImportsAdvisoryType:
    read("lib/confidence-calibration-recommendation-advisory-projection.ts").includes(
      "import type { ConfidenceCalibrationAdvisoryResult }",
    ) &&
    read("lib/confidence-calibration-recommendation-advisory-projection.ts").includes(
      "./confidence-calibration-advisory-adapter",
    ),
  advisoryImportsPureType:
    read("lib/confidence-calibration-advisory-adapter.ts").includes(
      "import type { ConfidenceCalibrationResult }",
    ) &&
    read("lib/confidence-calibration-advisory-adapter.ts").includes(
      "./pure-confidence-calibration",
    ),
  flagHelperExists:
    read("lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts").includes(
      "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    ) &&
    read("lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts").includes(
      "if (runtime === \"production\") return false",
    ),
};

const checks = {
  files_exist:
    exists(paths.doc) && exists(paths.record) && exists(paths.verifier) && exists(paths.test),
  action490_blocked_result:
    action490.approval_decision === "blocked" &&
    action490.root_cause_classification === expected.action490RootCause &&
    action490.class_a_missing_paths?.includes(expected.missingPath) &&
    action490.class_a_missing_path_count === 1 &&
    action490.deployment_authorized === false &&
    action490.activation_authorized === false,
  action489_remains_historical_abort:
    action489.rehearsal_decision === "full_candidate_rehearsal_aborted" &&
    action489.abort_reason === "command_inventory_unresolvable_in_bound_30_file_candidate" &&
    action489.cleanup_result === "temporary_candidate_and_dependency_copy_removed",
  blocker_and_old_candidate:
    record.blocker_classification === expected.blocker &&
    record.first_missing_runtime_path === expected.missingPath &&
    record.old_clean_base_identifier === expected.base &&
    record.old_change_candidate_hash === expected.oldCandidateHash &&
    record.old_full_candidate_inventory_hash === expected.oldFullHash &&
    record.old_candidate_file_count === expected.oldCount &&
    record.old_candidate_status === expected.oldCandidateStatus &&
    record.old_deployment_approval_executable === false &&
    record.action_479_deployment_approval_superseded_for_execution === true &&
    inventory.repository_base_identifier === expected.base &&
    inventory.approved_change_candidate_hash === expected.oldCandidateHash &&
    inventory.full_candidate_inventory_hash === expected.oldFullHash,
  source_classification:
    source.path === expected.missingPath &&
    source.source_classification === "present_only_in_current_dirty_worktree" &&
    source.current_bounded_sha256 === expected.missingPathHash &&
    currentHash(expected.missingPath) === expected.missingPathHash &&
    source.clean_base_exists === false &&
    baseHasPath(expected.missingPath) === false &&
    source.approved_30_file_overlay_member === false &&
    overlayPaths.has(expected.missingPath) === false &&
    source.first_known_action_provenance ===
      "action_420_pure_confidence_calibration_implementation" &&
    source.latest_verified_action_provenance ===
      "action_423_pure_confidence_calibration_contract_remediation" &&
    source.hash_freeze_provenance ===
      "action_426_static_confidence_calibration_hash_freeze" &&
    source.authoritative_version_known === true &&
    source.approved_for_future_exact_candidate_inclusion === true,
  runtime_inventory_counts:
    runtimeInventory.length === record.runtime_dependency_paths_total &&
    record.runtime_dependency_paths_total === 20 &&
    record.runtime_dependency_paths_present === 19 &&
    record.runtime_dependency_paths_missing === 1 &&
    record.build_only_paths_total === 8 &&
    record.supplied_by_clean_base_count === 11 &&
    record.supplied_by_30_file_overlay_count === 8 &&
    record.unresolved_source_paths === 0,
  runtime_inventory_integrity:
    computedInventory.every((entry) => entry.recordedBase === entry.computedBase) &&
    computedInventory.every((entry) => entry.recordedOverlay === entry.computedOverlay) &&
    computedInventory.every((entry) => entry.recordedExpectedHash === entry.computedExpectedHash) &&
    JSON.stringify(missingPaths) === JSON.stringify(record.missing_runtime_paths) &&
    JSON.stringify(record.missing_runtime_paths) === JSON.stringify([expected.missingPath]),
  runtime_import_relationships:
    Object.values(importChecks).every(Boolean) &&
    runtimeInventory.some(
      (entry) =>
        entry.path === "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx" &&
        entry.classification === "runtime_required",
    ) &&
    runtimeInventory.some(
      (entry) =>
        entry.path === "lib/confidence-calibration-advisory-adapter.ts" &&
        entry.classification === "build_required",
    ) &&
    runtimeInventory.some(
      (entry) =>
        entry.path === expected.missingPath &&
        entry.dependency_kind === "type_only_confidence_calibration_advisory_dependency" &&
        entry.frozen_candidate_presence === false,
    ),
  closure_rules:
    Object.values(record.runtime_closure_rule_freeze ?? {}).every((value) => value === true),
  expansion_policy:
    record.candidate_expansion_required === true &&
    record.new_candidate_hash_required === true &&
    record.new_candidate_inventory_required === true &&
    record.candidate_reconstruction_required === true &&
    record.candidate_expansion_policy?.approved_missing_paths_for_future_inclusion?.length === 1 &&
    record.candidate_expansion_policy?.approved_missing_paths_for_future_inclusion?.[0] ===
      expected.missingPath &&
    record.candidate_expansion_policy?.directory_wide_inclusion_approved === false &&
    record.candidate_expansion_policy?.copy_all_lib_approved === false &&
    record.candidate_expansion_policy?.copy_dirty_worktree_approved === false &&
    record.candidate_expansion_policy?.requires_new_changed_file_count === true &&
    record.candidate_expansion_policy?.requires_new_change_candidate_hash === true &&
    record.candidate_expansion_policy?.requires_new_full_candidate_inventory_hash === true,
  forbidden_expansion:
    record.forbidden_expansion?.includes("unrelated_post_trade_runtime_or_preflight_files") &&
    record.forbidden_expansion?.includes("action_481_to_491_docs_records_verifiers_or_focused_contract_tests") &&
    record.forbidden_expansion?.includes(".env_files") &&
    record.forbidden_expansion?.includes("node_modules") &&
    record.unrelated_dirty_files_included === false &&
    record.control_artifacts_included === false &&
    record.environment_or_credentials_included === false,
  decision_and_next_action:
    record.dependency_completeness_decision === expected.dependencyDecision &&
    record.overall_candidate_status === expected.overallStatus &&
    record.approval_decision === expected.approvalDecision &&
    record.unresolved_conditions?.length === 0 &&
    record.next_action === expected.nextAction &&
    doc.includes(expected.nextAction),
  vocabularies:
    JSON.stringify(record.approval_vocabulary) ===
      JSON.stringify(["approved", "approved_with_conditions", "blocked"]) &&
    JSON.stringify(record.readiness_vocabulary) ===
      JSON.stringify([
        "runtime_dependency_completeness_ready",
        "runtime_dependency_completeness_ready_with_conditions",
        "runtime_dependency_completeness_blocked",
      ]) &&
    JSON.stringify(record.candidate_status_vocabulary) ===
      JSON.stringify([
        "candidate_reconstruction_required",
        "candidate_reconstruction_not_required",
        "candidate_status_unresolved",
      ]),
  no_effects: allFalse(record, noEffectKeys),
  preview_state:
    record.preview_flag_name === "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED" &&
    record.preview_flag_state === "absent_or_disabled" &&
    record.preview_flag_enabled === false &&
    record.runtime_preview_state === expected.runtimeState,
  documentation_contract:
    hasAll(doc, [
      "Action 491 is a static audit and approval gate",
      expected.blocker,
      expected.missingPath,
      "present_only_in_current_dirty_worktree",
      expected.missingPathHash,
      "Runtime Dependency Inventory",
      "historical_candidate_runtime_incomplete",
      "New candidate hash required: `true`",
      "Action 479 deployment approval is no longer executable",
      "Approval decision:",
      "`approved`",
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
  blocker_classification: record.blocker_classification ?? null,
  first_missing_runtime_path: record.first_missing_runtime_path ?? null,
  old_candidate_status: record.old_candidate_status ?? null,
  runtime_dependency_paths_total: record.runtime_dependency_paths_total ?? null,
  runtime_dependency_paths_missing: record.runtime_dependency_paths_missing ?? null,
  missing_runtime_paths: record.missing_runtime_paths ?? [],
  source_classification: source.source_classification ?? null,
  candidate_expansion_required: record.candidate_expansion_required ?? null,
  dependency_completeness_decision: record.dependency_completeness_decision ?? null,
  approval_decision: record.approval_decision ?? null,
  overall_candidate_status: record.overall_candidate_status ?? null,
  next_action: record.next_action ?? null,
  runtime_preview_state: record.runtime_preview_state ?? null,
  computed_missing_paths: missingPaths,
  git_head: git(["rev-parse", "--short", "HEAD"]).trim(),
  failed_conditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failed_conditions.length === 0 ? 0 : 1);
