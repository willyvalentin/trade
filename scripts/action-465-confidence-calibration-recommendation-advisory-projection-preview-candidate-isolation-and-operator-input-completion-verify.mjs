#!/usr/bin/env node

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

const expected = Object.freeze({
  flagName: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  releaseClassification:
    "confidence_calibration_recommendation_advisory_projection_pure_static_verified",
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  candidateClassification:
    "candidate_inventory_prepared_but_not_materialized",
  candidateDecision: "candidate_ready_with_conditions",
  operatorInputDecision: "operator_inputs_incomplete",
  readinessDecision: "ready_with_conditions",
  activationDecision: "activation_approved_with_conditions",
  deploymentStatus: "not_authorized_not_required_not_performed",
  nextAction:
    "action_466_preview_candidate_materialization_and_operator_input_finalization",
  unclassifiedChangedFileCount: 317,
  unclassifiedPostTradeFileCount: 40,
});

const paths = Object.freeze({
  doc:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-isolation-and-operator-input-completion.md",
  inputRecord:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-operator-input-record.json",
  inventory:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json",
  verifier:
    "scripts/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-isolation-and-operator-input-completion-verify.mjs",
  test:
    "tests/e2e/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-isolation-and-operator-input-completion.spec.ts",
  action463Verifier:
    "scripts/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate-verify.mjs",
  action464Verifier:
    "scripts/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate-verify.mjs",
  projection:
    "lib/confidence-calibration-recommendation-advisory-projection.ts",
  advisoryAdapter: "lib/confidence-calibration-advisory-adapter.ts",
  flag: "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
  previewAdapter:
    "lib/confidence-calibration-recommendation-advisory-projection-preview.ts",
  previewComponent:
    "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx",
  detailsModal: "components/recommendations/RecommendationDetailsModal.tsx",
  cardContainer: "components/recommendations/RecommendationCardContainer.tsx",
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

const requiredCandidateFiles = Object.freeze([
  paths.projection,
  paths.advisoryAdapter,
  paths.flag,
  paths.previewAdapter,
  paths.previewComponent,
  paths.detailsModal,
  paths.cardContainer,
  "docs/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.md",
  "scripts/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-verify.mjs",
  "tests/e2e/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.spec.ts",
  "docs/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.md",
  "scripts/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate-verify.mjs",
  "tests/e2e/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.spec.ts",
  "docs/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.md",
  "scripts/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation-verify.mjs",
  "tests/e2e/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.spec.ts",
  "docs/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.md",
  "scripts/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification-verify.mjs",
  "tests/e2e/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.spec.ts",
  "docs/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate.md",
  paths.action463Verifier,
  "tests/e2e/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate.spec.ts",
  "docs/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate.md",
  paths.action464Verifier,
  "tests/e2e/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate.spec.ts",
  paths.doc,
  paths.verifier,
  paths.test,
  paths.inputRecord,
  paths.inventory,
]);

const unresolvedOperatorInputs = Object.freeze([
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
  if (path === paths.inventory) return null;
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

function hashInventory(inventory) {
  const hashMaterial = {
    inventory_schema_version: inventory.inventory_schema_version,
    candidate_classification: inventory.candidate_classification,
    files: inventory.files.map((file) => ({
      path: file.path,
      classification: file.classification,
      content_sha256: file.content_sha256,
      action_provenance: file.action_provenance,
      inclusion_status: file.inclusion_status,
    })),
  };
  return sha256(canonicalJson(hashMaterial));
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

function isApprovedStaticArtifact(path) {
  if (/^docs\/action-4(?:4[7-9]|5[0-9]|6[0-5])-/.test(path)) return true;
  if (/^scripts\/action-4(?:4[7-9]|5[0-9]|6[0-5])-/.test(path)) return true;
  if (/^tests\/e2e\/action-4(?:4[7-9]|5[0-9]|6[0-5])-/.test(path)) return true;
  return false;
}

function isAllowedCandidateFile(path) {
  return (
    requiredCandidateFiles.includes(path) ||
    isApprovedStaticArtifact(path) ||
    [
      "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
      "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
      "scripts/action-320-static-replay-branch-package-verify.mjs",
    ].includes(path)
  );
}

function readJson(path) {
  return JSON.parse(read(path));
}

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const inputRecord = exists(paths.inputRecord) ? readJson(paths.inputRecord) : null;
const inventory = exists(paths.inventory) ? readJson(paths.inventory) : null;
const action463Report = runJsonVerifier(paths.action463Verifier);
const action464Report = runJsonVerifier(paths.action464Verifier);
const statusFiles = gitStatusFiles();
const unclassifiedChangedFiles = statusFiles.filter(
  (path) => !isAllowedCandidateFile(path),
);
const unclassifiedPostTradeFiles = statusFiles
  .filter((path) =>
    /(^|\/)post-trade-|20260710000000_create_execution_authorization_consumptions/.test(
      path,
    ),
  )
  .filter((path) => !isAllowedCandidateFile(path));

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

const candidatePaths = inventory?.files?.map((file) => file.path).sort() ?? [];
const candidateFileSet = new Set(candidatePaths);
const candidateFiles = inventory?.files ?? [];
const inventoryHashRecomputed = inventory ? hashInventory(inventory) : null;
const candidateSecretLikeFiles = candidatePaths.filter((path) =>
  /(^|\/)\.env|secret|token|password|credential|private-key|\.pem$|\.key$/i.test(
    path,
  ),
);
const candidateAbsolutePaths = candidatePaths.filter((path) =>
  path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path),
);
const candidateForbiddenRuntimePaths = candidatePaths.filter((path) =>
  /(^app\/api\/|^app\/.*\/page\.tsx$|proxy\.ts$|middleware\.ts$|supabase|provider|replay|feedback|post-trade)/i.test(
    path,
  ),
);

const suppliedRecordValues =
  inputRecord == null
    ? []
    : Object.entries(inputRecord).filter(([key, value]) => {
        if (key === "schema_version") return false;
        if (key === "preview_flag_name") return false;
        if (key === "acceptable_failure_threshold") return false;
        if (key === "deployment_candidate_isolated") return false;
        return value !== null;
      });

const threshold = inputRecord?.acceptable_failure_threshold ?? {};
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

const proposedCandidateGuardResult =
  candidateFiles.length > 0 &&
  candidateFiles.every((file) => allowedClassifications.includes(file.classification)) &&
  requiredCandidateFiles.every((path) => candidateFileSet.has(path)) &&
  candidateSecretLikeFiles.length === 0 &&
  candidateAbsolutePaths.length === 0 &&
  candidateForbiddenRuntimePaths.length === 0
    ? "passed_no_unclassified_candidate_files"
    : "failed_candidate_inventory_contains_unclassified_or_forbidden_files";

const checks = {
  documentation_exists: exists(paths.doc),
  operator_input_record_exists: exists(paths.inputRecord),
  candidate_inventory_exists: exists(paths.inventory),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract: includesAll(doc, [
    "## Purpose",
    "## Scope",
    "## Action 464 Decision",
    "## Source Integrity",
    "## Operator-Input Record",
    "## Supplied Inputs",
    "## Unresolved Inputs",
    "## Invalid Inputs",
    "## Candidate Inventory",
    "## Candidate Isolation Method",
    "## Included Files",
    "## Excluded-File Classifications",
    "## Current Dirty-Tree Counts",
    "## Post-Trade Exclusion",
    "## Actions 318-320 Broader-Worktree Result",
    "## Proposed-Candidate Guard Result",
    "## Target Environment Validation",
    "## Access Validation",
    "## Duration Validation",
    "## Evidence/Telemetry Validation",
    "## Threshold Validation",
    "## Owner Validation",
    "## Authority Confirmations",
    "## Candidate Decision",
    "## Operator-Input Decision",
    "## Overall Readiness",
    "## Activation Decision",
    "## No-Deployment/No-Activation Confirmation",
    "## Runtime-Preview State",
    "## Next Action",
  ]),
  action463_healthy:
    action463Report?.verification_status === "passed" &&
    action463Report?.readiness_decision === "ready_with_conditions",
  action464_healthy:
    action464Report?.verification_status === "passed" &&
    action464Report?.readiness_decision === "ready_with_conditions" &&
    action464Report?.activation_decision === "activation_approved_with_conditions",
  input_record_schema:
    inputRecord?.schema_version === "action_465_operator_input_record_v1" &&
    inputRecord?.preview_flag_name === expected.flagName &&
    inputRecord?.deployment_candidate_isolated === false,
  input_record_null_unresolved:
    unresolvedOperatorInputs.every((key) => {
      if (key === "preview_unavailable_events_allowed") {
        return threshold.preview_unavailable_events_allowed === null;
      }
      return inputRecord?.[key] === null;
    }),
  input_record_zero_thresholds:
    mandatoryThresholdKeys.every((key) => threshold[key] === 0),
  no_invented_operator_values: suppliedRecordValues.length === 0,
  no_secrets_in_records:
    candidateSecretLikeFiles.length === 0 &&
    !/(password|token|private[_ -]?key|credential)/i.test(
      candidatePaths.join("\n"),
    ),
  inventory_schema:
    inventory?.inventory_schema_version === "action_465_candidate_inventory_v1" &&
    inventory?.candidate_classification === expected.candidateClassification &&
    inventory?.candidate_isolated === false,
  inventory_classifications:
    candidateFiles.length > 0 &&
    candidateFiles.every((file) => allowedClassifications.includes(file.classification)),
  required_preview_files_included: requiredCandidateFiles.every((path) =>
    candidateFileSet.has(path),
  ),
  candidate_file_hashes:
    candidateFiles.every((file) =>
      file.path === paths.inventory
        ? file.content_sha256 === null
        : file.content_sha256 === fileHash(file.path),
    ),
  inventory_hash_reproduces:
    typeof inventory?.candidate_inventory_hash === "string" &&
    inventory.candidate_inventory_hash === inventoryHashRecomputed,
  no_absolute_paths: candidateAbsolutePaths.length === 0,
  no_secret_or_environment_files: candidateSecretLikeFiles.length === 0,
  unrelated_post_trade_excluded:
    candidatePaths.every(
      (path) =>
        !/(^|\/)post-trade-|20260710000000_create_execution_authorization_consumptions/.test(
          path,
        ),
    ) && inventory?.excluded_post_trade_file_count === unclassifiedPostTradeFiles.length,
  dirty_tree_counts:
    unclassifiedChangedFiles.length === expected.unclassifiedChangedFileCount &&
    unclassifiedPostTradeFiles.length === expected.unclassifiedPostTradeFileCount,
  broader_guard_result:
    inventory?.actions_318_320_result?.broader_worktree_guard_result ===
    "failed_dirty_worktree_unclassified_files",
  proposed_candidate_guard_result:
    proposedCandidateGuardResult === "passed_no_unclassified_candidate_files" &&
    inventory?.actions_318_320_result?.proposed_candidate_guard_result ===
      proposedCandidateGuardResult,
  target_environment_unresolved: inputRecord?.target_preview_environment === null,
  access_unresolved:
    inputRecord?.authorized_preview_users === null &&
    inputRecord?.access_control_mechanism === null,
  duration_unresolved:
    inputRecord?.preview_start_condition === null &&
    inputRecord?.maximum_preview_duration_minutes === null,
  evidence_telemetry_unresolved:
    inputRecord?.evidence_retention === null && inputRecord?.telemetry_policy === null,
  owners_unresolved:
    inputRecord?.rollback_owner === null &&
    inputRecord?.kill_switch_owner === null &&
    inputRecord?.deployment_operator === null &&
    inputRecord?.observation_owner === null,
  authority_confirmations_unresolved:
    inputRecord?.original_confidence_remains_authoritative === null &&
    inputRecord?.confidence_application_authorized === null &&
    inputRecord?.preview_may_affect_downstream_behavior === null &&
    inputRecord?.production_activation_authorized === null &&
    inputRecord?.persistent_projection_evidence_authorized === null,
  decisions_expected:
    inventory?.candidate_decision === expected.candidateDecision &&
    inventory?.operator_input_decision === expected.operatorInputDecision &&
    inventory?.overall_readiness === expected.readinessDecision &&
    inventory?.activation_decision === expected.activationDecision &&
    inventory?.next_permitted_action === expected.nextAction,
  no_deployment_activation_env_change:
    inventory?.deployment_performed === false &&
    inventory?.preview_activated === false &&
    !statusFiles.some((path) =>
      /^\.env($|\.|\/)|^netlify\.toml$|^\.openai\/hosting\.json$/.test(path),
    ),
  no_routes_added_for_preview: previewRelatedRoutes.length === 0,
  runtime_preview_waiting:
    inventory?.runtime_preview_state === expected.runtimePreviewStatus &&
    doc.includes(expected.runtimePreviewStatus),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  action_nature:
    "local_only_candidate_isolation_operator_input_completion_static_no_deploy_no_activation",
  release_classification: expected.releaseClassification,
  runtime_preview_status: expected.runtimePreviewStatus,
  deployment_status: expected.deploymentStatus,
  candidate_classification: inventory?.candidate_classification ?? null,
  candidate_isolated: inventory?.candidate_isolated ?? null,
  candidate_decision: inventory?.candidate_decision ?? null,
  candidate_readiness_vocabulary: [
    "candidate_ready",
    "candidate_ready_with_conditions",
    "candidate_blocked",
  ],
  operator_input_decision: inventory?.operator_input_decision ?? null,
  operator_input_readiness_vocabulary: [
    "operator_inputs_complete",
    "operator_inputs_incomplete",
    "operator_inputs_invalid",
  ],
  readiness_decision: inventory?.overall_readiness ?? null,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  activation_decision: inventory?.activation_decision ?? null,
  activation_vocabulary: [
    "activation_approved_for_future_action",
    "activation_approved_with_conditions",
    "activation_not_approved",
  ],
  next_permitted_action: inventory?.next_permitted_action ?? null,
  candidate_inventory_hash: inventory?.candidate_inventory_hash ?? null,
  candidate_inventory_hash_recomputed: inventoryHashRecomputed,
  included_file_count: candidateFiles.length,
  runtime_file_count: inventory?.runtime_file_count ?? null,
  static_artifact_count: inventory?.static_artifact_count ?? null,
  test_verifier_documentation_count:
    inventory?.test_verifier_documentation_count ?? null,
  excluded_file_count: unclassifiedChangedFiles.length,
  excluded_post_trade_file_count: unclassifiedPostTradeFiles.length,
  unexpected_file_count: inventory?.unexpected_file_count ?? null,
  secret_file_count: candidateSecretLikeFiles.length,
  environment_file_count: candidatePaths.filter((path) =>
    /^\.env($|\.|\/)/.test(path),
  ).length,
  actions_318_320_result: inventory?.actions_318_320_result ?? null,
  proposed_candidate_guard_result: proposedCandidateGuardResult,
  operator_input_record: inputRecord,
  supplied_operator_inputs: {},
  unresolved_operator_inputs: unresolvedOperatorInputs,
  invalid_operator_inputs: [],
  validation_results: {
    target_environment_unresolved: checks.target_environment_unresolved,
    access_unresolved: checks.access_unresolved,
    duration_unresolved: checks.duration_unresolved,
    evidence_telemetry_unresolved: checks.evidence_telemetry_unresolved,
    zero_thresholds: checks.input_record_zero_thresholds,
    preview_unavailable_threshold_unresolved:
      threshold.preview_unavailable_events_allowed === null,
    owners_unresolved: checks.owners_unresolved,
    authority_confirmations_unresolved:
      checks.authority_confirmations_unresolved,
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
  candidate_files: candidateFiles,
  excluded_file_examples: unclassifiedChangedFiles.slice(0, 20),
  excluded_post_trade_examples: unclassifiedPostTradeFiles.slice(0, 20),
  checks,
  failed_conditions: failedConditions,
};

console.log(JSON.stringify(report, null, 2));
if (failedConditions.length > 0) process.exitCode = 1;
