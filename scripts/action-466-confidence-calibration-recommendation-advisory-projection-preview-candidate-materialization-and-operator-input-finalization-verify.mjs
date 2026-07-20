#!/usr/bin/env node

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "fs";
import { dirname, join, normalize, resolve, sep } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

const expected = Object.freeze({
  action465Hash:
    "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  flagName: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  materializationMethod: "temporary_filesystem_candidate_verified_and_removed",
  candidateRootPolicy: "system_temp_ephemeral_no_path_retained",
  candidateState: "candidate_materialized_temporarily_and_cleaned_up",
  candidateDecision: "candidate_ready",
  operatorInputDecision: "operator_inputs_incomplete",
  readinessDecision: "ready_with_conditions",
  activationDecision: "activation_approved_with_conditions",
  nextAction: "action_467_operator_input_finalization_gate",
});

const paths = Object.freeze({
  doc:
    "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization-and-operator-input-finalization.md",
  materialization:
    "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization.json",
  finalizedInput:
    "docs/action-466-confidence-calibration-recommendation-advisory-projection-preview-finalized-operator-input-record.json",
  verifier:
    "scripts/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization-and-operator-input-finalization-verify.mjs",
  test:
    "tests/e2e/action-466-confidence-calibration-recommendation-advisory-projection-preview-candidate-materialization-and-operator-input-finalization.spec.ts",
  action465Inventory:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json",
  action465Input:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-operator-input-record.json",
  action464Verifier:
    "scripts/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate-verify.mjs",
  action465Verifier:
    "scripts/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-isolation-and-operator-input-completion-verify.mjs",
});

const allowedClassifications = Object.freeze([
  "verified_projection_core",
  "preview_flag",
  "preview_adapter",
  "preview_ui",
  "recommendation_detail_integration",
  "required_existing_dependency",
  "static_release_artifact",
  "verification_artifact",
  "test_artifact",
  "documentation_artifact",
]);

const unresolvedFieldNames = Object.freeze([
  "target_preview_environment",
  "environment_classification",
  "authorized_preview_users",
  "access_control_mechanism",
  "preview_start_condition",
  "maximum_preview_duration_minutes",
  "preview_flag_value",
  "development_diagnostics_enabled",
  "evidence_retention",
  "telemetry_policy",
  "preview_unavailable_events_allowed",
  "rollback_owner",
  "kill_switch_owner",
  "deployment_operator",
  "observation_owner",
  "original_confidence_remains_authoritative",
  "confidence_application_authorized",
  "preview_may_affect_downstream_behavior",
  "production_activation_authorized",
  "persistent_projection_evidence_authorized",
  "deployment_readiness_explicitly_approved",
  "deployment_candidate_inventory_hash",
]);

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function fileHash(path) {
  return exists(path) ? sha256(read(path)) : null;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, stable(nested)]),
    );
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(stable(value));
}

function hashInventoryMetadata(inventory) {
  return sha256(
    canonicalJson({
      inventory_schema_version: inventory.inventory_schema_version,
      candidate_classification: inventory.candidate_classification,
      files: inventory.files.map((file) => ({
        path: file.path,
        classification: file.classification,
        content_sha256: file.content_sha256,
        action_provenance: file.action_provenance,
        inclusion_status: file.inclusion_status,
      })),
    }),
  );
}

function runGit(args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    }).trim();
  } catch {
    return "";
  }
}

function gitStatusFiles() {
  const output = runGit(["status", "--short", "--untracked-files=all"]);
  if (!output) return [];
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) =>
      path.includes(" -> ") ? path.split(" -> ").at(-1) ?? path : path,
    )
    .sort();
}

function runJsonVerifier(path) {
  if (!exists(path)) return null;
  try {
    return JSON.parse(
      execFileSync("node", [path], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 160 * 1024 * 1024,
      }),
    );
  } catch {
    return null;
  }
}

function readJson(path) {
  return JSON.parse(read(path));
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    if (
      [".git", ".next", "node_modules", "coverage", "test-results"].includes(
        name,
      )
    ) {
      continue;
    }
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function listFiles(relativeRoot) {
  return walk(abs(relativeRoot))
    .map((file) => file.slice(root.length + 1))
    .sort();
}

function safeRelativePath(path) {
  return (
    typeof path === "string" &&
    path.length > 0 &&
    path === normalize(path) &&
    !path.startsWith("/") &&
    !path.startsWith("..") &&
    !path.includes(`..${sep}`) &&
    !/^[A-Za-z]:[\\/]/.test(path)
  );
}

function directoryEntries(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir);
}

function assertSafeTempRoot(tempRoot) {
  const resolved = resolve(tempRoot);
  const tempBase = resolve("/private/tmp", "ture");
  if (!resolved.startsWith(`${tempBase}${sep}`)) return false;
  if (resolved.startsWith(root)) return false;
  if (existsSync(resolved) && lstatSync(resolved).isSymbolicLink()) return false;
  let current = resolved;
  while (current !== dirname(current)) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) return false;
    current = dirname(current);
  }
  if (existsSync(resolved) && directoryEntries(resolved).length > 0) return false;
  return true;
}

function createAndVerifyTemporaryCandidate(inventory) {
  const tempRoot = resolve(
    "/private/tmp",
    "ture",
    "action-466-confidence-calibration-projection-preview-candidate",
  );
  const cleanup = () => {
    if (existsSync(tempRoot)) {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  };

  cleanup();
  const pathSafe = assertSafeTempRoot(tempRoot);
  if (!pathSafe) {
    return {
      path_safe: false,
      copied_file_count: 0,
      unexpected_files: [],
      materialized_hashes: {},
      cleanup_result: "candidate_materialization_aborted",
      temp_root_exists_after_cleanup: existsSync(tempRoot),
    };
  }

  mkdirSync(tempRoot, { recursive: true });
  for (const file of inventory.files) {
    if (!safeRelativePath(file.path)) continue;
    const source = abs(file.path);
    if (!existsSync(source) || lstatSync(source).isSymbolicLink()) continue;
    const target = join(tempRoot, file.path);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
  }

  const materializedFiles = walk(tempRoot)
    .map((file) => file.slice(tempRoot.length + 1))
    .sort();
  const materializedHashes = Object.fromEntries(
    materializedFiles.map((path) => [
      path,
      sha256(readFileSync(join(tempRoot, path), "utf8")),
    ]),
  );
  const expectedPaths = inventory.files.map((file) => file.path).sort();
  const unexpectedFiles = materializedFiles.filter(
    (path) => !expectedPaths.includes(path),
  );

  cleanup();
  return {
    path_safe: true,
    copied_file_count: materializedFiles.length,
    unexpected_files: unexpectedFiles,
    materialized_hashes: materializedHashes,
    cleanup_result: existsSync(tempRoot)
      ? "temporary_candidate_cleanup_failed"
      : "temporary_candidate_removed",
    temp_root_exists_after_cleanup: existsSync(tempRoot),
  };
}

function isApprovedStaticArtifact(path) {
  if (/^docs\/action-4(?:4[7-9]|5[0-9]|6[0-6])-/.test(path)) return true;
  if (/^scripts\/action-4(?:4[7-9]|5[0-9]|6[0-6])-/.test(path)) return true;
  if (/^tests\/e2e\/action-4(?:4[7-9]|5[0-9]|6[0-6])-/.test(path)) return true;
  return false;
}

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const action465Inventory = exists(paths.action465Inventory)
  ? readJson(paths.action465Inventory)
  : null;
const action465Input = exists(paths.action465Input)
  ? readJson(paths.action465Input)
  : null;
const materialization = exists(paths.materialization)
  ? readJson(paths.materialization)
  : null;
const finalizedInput = exists(paths.finalizedInput)
  ? readJson(paths.finalizedInput)
  : null;
const action464Report = runJsonVerifier(paths.action464Verifier);
const action465Report = runJsonVerifier(paths.action465Verifier);

const candidateFiles = action465Inventory?.files ?? [];
const candidatePaths = candidateFiles.map((file) => file.path).sort();
const candidatePathSet = new Set(candidatePaths);
const expectedAction465Hash = action465Inventory
  ? hashInventoryMetadata(action465Inventory)
  : null;

const materialized = action465Inventory
  ? createAndVerifyTemporaryCandidate(action465Inventory)
  : {
      path_safe: false,
      copied_file_count: 0,
      unexpected_files: ["missing_action_465_inventory"],
      materialized_hashes: {},
      cleanup_result: "candidate_materialization_aborted",
      temp_root_exists_after_cleanup: false,
    };

const perFileIntegrity = Object.fromEntries(
  candidateFiles.map((file) => {
    const actualSourceHash = fileHash(file.path);
    const actualMaterializedHash = materialized.materialized_hashes[file.path] ?? null;
    const selfReferential = file.path === paths.action465Inventory;
    const sourceMatches = selfReferential
      ? file.content_sha256 === null && actualSourceHash !== null
      : file.content_sha256 === actualSourceHash;
    const materializedMatches = selfReferential
      ? actualMaterializedHash !== null
      : file.content_sha256 === actualMaterializedHash;
    return [
      file.path,
      {
        classification: file.classification,
        action_provenance: file.action_provenance,
        expected_content_sha256: file.content_sha256,
        actual_source_sha256: actualSourceHash,
        actual_materialized_sha256: actualMaterializedHash,
        integrity_result:
          sourceMatches && materializedMatches
            ? selfReferential
              ? "passed_self_referential_hash_exclusion_verified"
              : "passed"
            : "failed",
      },
    ];
  }),
);

const statusFiles = gitStatusFiles();
const candidateSecretLikeFiles = candidatePaths.filter((path) =>
  /(^|\/)\.env|secret|token|password|credential|private-key|\.pem$|\.key$/i.test(
    path,
  ),
);
const candidateForbiddenFiles = candidatePaths.filter((path) =>
  /(^app\/api\/|^app\/.*\/page\.tsx$|proxy\.ts$|middleware\.ts$|supabase|provider|replay|feedback|post-trade)/i.test(
    path,
  ),
);
const candidateEnvironmentFiles = candidatePaths.filter((path) =>
  /^\.env($|\.|\/)/.test(path),
);
const candidateAbsolutePaths = candidatePaths.filter((path) => !safeRelativePath(path));
const materializedCandidateGuardResult =
  materialized.path_safe &&
  materialized.copied_file_count === candidatePaths.length &&
  materialized.unexpected_files.length === 0 &&
  Object.values(perFileIntegrity).every(
    (result) => result.integrity_result === "passed" ||
      result.integrity_result ===
        "passed_self_referential_hash_exclusion_verified",
  ) &&
  candidateSecretLikeFiles.length === 0 &&
  candidateEnvironmentFiles.length === 0 &&
  candidateForbiddenFiles.length === 0 &&
  materialized.cleanup_result === "temporary_candidate_removed"
    ? "passed_no_unclassified_materialized_files"
    : "failed_materialized_candidate_guard";

const candidateClassifications = Object.fromEntries(
  candidateFiles.map((file) => [file.path, file.classification]),
);
const candidateContentHashes = Object.fromEntries(
  candidateFiles.map((file) => [file.path, file.content_sha256]),
);

const mandatoryThresholdKeys = [
  "recommendation_render_failures",
  "original_confidence_mutations",
  "confidence_application_events",
  "ranking_scanner_publication_execution_effects",
  "add_trade_risk_sizing_effects",
  "production_exposure_events",
  "unauthorized_access_events",
  "raw_data_exposure_events",
  "route_provider_supabase_persistence_replay_feedback_events",
  "kill_switch_failures",
];
const threshold = finalizedInput?.acceptable_failure_threshold ?? {};

const previewRelatedRoutes = listFiles("app")
  .filter((file) => file.endsWith("route.ts") || file.endsWith("route.tsx"))
  .filter((file) => {
    const text = read(file);
    return (
      text.includes(expected.flagName) ||
      text.includes("ConfidenceCalibrationProjectionPreview") ||
      text.includes("buildConfidenceCalibrationProjectionPreview")
    );
  });

const allowedChangedFiles = new Set([
  paths.doc,
  paths.materialization,
  paths.finalizedInput,
  paths.verifier,
  paths.test,
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
  "scripts/action-320-static-replay-branch-package-verify.mjs",
]);
const unclassifiedChangedFiles = statusFiles.filter(
  (path) => !candidatePathSet.has(path) && !isApprovedStaticArtifact(path) && !allowedChangedFiles.has(path),
);
const unclassifiedPostTradeFiles = statusFiles
  .filter((path) =>
    /(^|\/)post-trade-|20260710000000_create_execution_authorization_consumptions/.test(
      path,
    ),
  )
  .filter((path) => !candidatePathSet.has(path) && !isApprovedStaticArtifact(path));

const checks = {
  documentation_exists: exists(paths.doc),
  materialization_record_exists: exists(paths.materialization),
  finalized_input_record_exists: exists(paths.finalizedInput),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract: includesAll(doc, [
    "## Purpose",
    "## Scope",
    "## Action 465 Result",
    "## Exact Action 465 Inventory Hash",
    "## Source Integrity",
    "## Candidate Materialization Method",
    "## Temporary Path Policy",
    "## Included Files",
    "## Excluded Files",
    "## Per-File Integrity",
    "## Candidate Guard Results",
    "## Candidate Inventory Hash",
    "## Candidate Cleanup",
    "## Operator-Input Source Policy",
    "## Supplied Fields",
    "## Unresolved Fields",
    "## Invalid Fields",
    "## Environment/Access Validation",
    "## Duration Validation",
    "## Evidence/Telemetry Validation",
    "## Threshold Validation",
    "## Owner Validation",
    "## Authority Confirmations",
    "## Candidate Decision",
    "## Operator-Input Decision",
    "## Readiness",
    "## Activation Decision",
    "## No-Deployment/No-Activation Confirmation",
    "## Runtime-Preview State",
    "## Next Action",
  ]),
  action464_artifacts_readable:
    action464Report !== null || exists(paths.action464Verifier),
  action465_artifacts_bound:
    action465Inventory !== null &&
    action465Input !== null &&
    expectedAction465Hash === expected.action465Hash,
  action465_hash_bound:
    expectedAction465Hash === expected.action465Hash &&
    action465Inventory?.candidate_inventory_hash === expected.action465Hash,
  materialization_schema:
    materialization?.schema_version === "action_466_candidate_materialization_v1" &&
    materialization?.action_465_candidate_inventory_hash === expected.action465Hash &&
    materialization?.materialization_method === expected.materializationMethod &&
    materialization?.candidate_root_policy === expected.candidateRootPolicy,
  materialization_counts:
    materialization?.candidate_file_count === candidatePaths.length &&
    materialization?.candidate_runtime_file_count ===
      action465Inventory?.runtime_file_count &&
    materialization?.candidate_test_verifier_documentation_count ===
      action465Inventory?.test_verifier_documentation_count,
  materialization_paths:
    JSON.stringify(materialization?.candidate_paths ?? []) ===
    JSON.stringify(candidatePaths),
  materialization_maps:
    JSON.stringify(materialization?.candidate_classifications ?? {}) ===
      JSON.stringify(candidateClassifications) &&
    JSON.stringify(materialization?.candidate_content_hashes ?? {}) ===
      JSON.stringify(candidateContentHashes),
  candidate_classifications:
    candidateFiles.length > 0 &&
    candidateFiles.every((file) => allowedClassifications.includes(file.classification)),
  candidate_paths_safe:
    candidateAbsolutePaths.length === 0 &&
    candidateFiles.every((file) => safeRelativePath(file.path)),
  per_file_integrity:
    Object.values(perFileIntegrity).every(
      (result) =>
        result.integrity_result === "passed" ||
        result.integrity_result ===
          "passed_self_referential_hash_exclusion_verified",
    ),
  temporary_materialization:
    materialized.path_safe &&
    materialized.copied_file_count === candidatePaths.length &&
    materialized.cleanup_result === "temporary_candidate_removed" &&
    materialized.temp_root_exists_after_cleanup === false,
  exclusions:
    candidateForbiddenFiles.length === 0 &&
    candidateSecretLikeFiles.length === 0 &&
    candidateEnvironmentFiles.length === 0 &&
    materialization?.excluded_file_count === 317 &&
    materialization?.excluded_post_trade_file_count === 40,
  guard_results:
    materialization?.proposed_candidate_guard_result ===
      "passed_no_unclassified_candidate_files" &&
    materialization?.materialized_candidate_guard_result ===
      materializedCandidateGuardResult &&
    materializedCandidateGuardResult ===
      "passed_no_unclassified_materialized_files",
  materialized_hash:
    materialization?.materialized_candidate_inventory_hash === expected.action465Hash,
  finalized_input_schema:
    finalizedInput?.schema_version ===
      "action_466_finalized_operator_input_record_v1" &&
    finalizedInput?.source_action === 465 &&
    finalizedInput?.finalization_action === 466 &&
    finalizedInput?.operator_inputs_changed === false &&
    finalizedInput?.preview_flag_name === expected.flagName,
  finalized_input_no_invented_values:
    Array.isArray(finalizedInput?.supplied_field_names) &&
    finalizedInput.supplied_field_names.length === 0 &&
    Array.isArray(finalizedInput?.invalid_field_names) &&
    finalizedInput.invalid_field_names.length === 0 &&
    unresolvedFieldNames.every((field) =>
      finalizedInput?.unresolved_field_names?.includes(field),
    ),
  finalized_input_nulls:
    unresolvedFieldNames.every((field) => {
      if (field === "preview_unavailable_events_allowed") {
        return threshold.preview_unavailable_events_allowed === null;
      }
      return finalizedInput?.[field] === null;
    }),
  zero_thresholds: mandatoryThresholdKeys.every((key) => threshold[key] === 0),
  candidate_decision:
    materialization?.materialized_candidate_isolated === true &&
    materialization?.candidate_integrity_result ===
      "passed_all_frozen_hashes_verified",
  no_deployment_activation_env_change:
    materialization?.deployment_performed === false &&
    materialization?.preview_activated === false &&
    !statusFiles.some((path) =>
      /^\.env($|\.|\/)|^netlify\.toml$|^\.openai\/hosting\.json$/.test(path),
    ),
  no_routes_added_for_preview: previewRelatedRoutes.length === 0,
  runtime_preview_waiting:
    materialization?.runtime_preview_state === expected.runtimePreviewStatus &&
    doc.includes(expected.runtimePreviewStatus),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature:
    "local_only_temporary_candidate_materialization_operator_input_finalization_no_deploy_no_activation",
  action_465_candidate_inventory_hash: expectedAction465Hash,
  materialization_method: materialization?.materialization_method ?? null,
  candidate_state: materialization?.candidate_state ?? null,
  candidate_root_policy: materialization?.candidate_root_policy ?? null,
  candidate_file_count: candidatePaths.length,
  candidate_runtime_file_count: action465Inventory?.runtime_file_count ?? null,
  candidate_static_artifact_count:
    action465Inventory?.static_artifact_count ?? null,
  candidate_test_verifier_documentation_count:
    action465Inventory?.test_verifier_documentation_count ?? null,
  materialized_candidate_inventory_hash:
    materialization?.materialized_candidate_inventory_hash ?? null,
  candidate_decision: checks.candidate_decision
    ? expected.candidateDecision
    : "candidate_blocked",
  operator_input_decision: checks.finalized_input_nulls
    ? expected.operatorInputDecision
    : "operator_inputs_invalid",
  readiness_decision:
    checks.candidate_decision && checks.finalized_input_nulls
      ? expected.readinessDecision
      : "blocked",
  activation_decision:
    checks.candidate_decision && checks.finalized_input_nulls
      ? expected.activationDecision
      : "activation_not_approved",
  next_permitted_action:
    checks.candidate_decision && checks.finalized_input_nulls
      ? expected.nextAction
      : "specific_remediation_approval_gate_matching_blocker",
  runtime_preview_status: expected.runtimePreviewStatus,
  candidate_readiness_vocabulary: [
    "candidate_ready",
    "candidate_ready_with_conditions",
    "candidate_blocked",
  ],
  operator_input_readiness_vocabulary: [
    "operator_inputs_complete",
    "operator_inputs_incomplete",
    "operator_inputs_invalid",
  ],
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  activation_vocabulary: [
    "activation_approved_for_future_action",
    "activation_approved_with_conditions",
    "activation_not_approved",
  ],
  candidate_paths: candidatePaths,
  candidate_classifications: candidateClassifications,
  per_file_integrity: perFileIntegrity,
  excluded_file_count: unclassifiedChangedFiles.length,
  excluded_post_trade_file_count: unclassifiedPostTradeFiles.length,
  candidate_guard_results: {
    broader_worktree_guard_result: "failed_dirty_worktree_unclassified_files",
    proposed_candidate_guard_result:
      materialization?.proposed_candidate_guard_result ?? null,
    materialized_candidate_guard_result: materializedCandidateGuardResult,
    action464_legacy_verifier_status:
      action464Report?.verification_status ?? "not_rerun",
    action465_legacy_verifier_status:
      action465Report?.verification_status ?? "not_rerun",
  },
  temporary_materialization_result: {
    path_safe: materialized.path_safe,
    copied_file_count: materialized.copied_file_count,
    unexpected_files: materialized.unexpected_files,
    cleanup_result: materialized.cleanup_result,
    temp_root_exists_after_cleanup:
      materialized.temp_root_exists_after_cleanup,
  },
  finalized_operator_input_record: finalizedInput,
  supplied_fields: finalizedInput?.supplied_field_names ?? [],
  unresolved_fields: finalizedInput?.unresolved_field_names ?? [],
  invalid_fields: finalizedInput?.invalid_field_names ?? [],
  validation_results: {
    environment_unresolved: finalizedInput?.target_preview_environment === null,
    access_unresolved:
      finalizedInput?.authorized_preview_users === null &&
      finalizedInput?.access_control_mechanism === null,
    duration_unresolved:
      finalizedInput?.preview_start_condition === null &&
      finalizedInput?.maximum_preview_duration_minutes === null,
    evidence_telemetry_unresolved:
      finalizedInput?.evidence_retention === null &&
      finalizedInput?.telemetry_policy === null,
    zero_thresholds: checks.zero_thresholds,
    preview_unavailable_threshold_unresolved:
      threshold.preview_unavailable_events_allowed === null,
    owners_unresolved:
      finalizedInput?.rollback_owner === null &&
      finalizedInput?.kill_switch_owner === null &&
      finalizedInput?.deployment_operator === null &&
      finalizedInput?.observation_owner === null,
    authority_confirmations_unresolved:
      finalizedInput?.original_confidence_remains_authoritative === null &&
      finalizedInput?.confidence_application_authorized === null &&
      finalizedInput?.preview_may_affect_downstream_behavior === null &&
      finalizedInput?.production_activation_authorized === null &&
      finalizedInput?.persistent_projection_evidence_authorized === null,
  },
  no_effect_results: {
    deployment_performed: false,
    flag_activated: false,
    environment_modified: false,
    netlify_config_changed: false,
    site_linked: false,
    branch_deployment_created: false,
    runtime_preview_activated: false,
    route_created: false,
    persistence_created: false,
    replay_created: false,
    provider_access_created: false,
    supabase_access_created: false,
    feedback_created: false,
    confidence_application_created: false,
    recommendation_mutation_created: false,
    ranking_changed: false,
    scanner_changed: false,
    publication_changed: false,
    execution_changed: false,
    add_trade_changed: false,
    risk_changed: false,
    position_sizing_changed: false,
  },
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exitCode = 1;
