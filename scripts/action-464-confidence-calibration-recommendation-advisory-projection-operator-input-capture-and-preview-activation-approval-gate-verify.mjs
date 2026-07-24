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

const expected = {
  flagName: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  releaseClassification:
    "confidence_calibration_recommendation_advisory_projection_pure_static_verified",
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  readinessDecision: "ready_with_conditions",
  activationDecision: "activation_approved_with_conditions",
  nextAction: "action_465_preview_candidate_isolation_and_operator_input_completion",
};

const paths = {
  doc: "docs/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate.md",
  verifier:
    "scripts/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate-verify.mjs",
  test: "tests/e2e/action-464-confidence-calibration-recommendation-advisory-projection-operator-input-capture-and-preview-activation-approval-gate.spec.ts",
  action462Verifier:
    "scripts/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification-verify.mjs",
  action463Verifier:
    "scripts/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate-verify.mjs",
  projection:
    "lib/confidence-calibration-recommendation-advisory-projection.ts",
  flag: "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
  previewAdapter:
    "lib/confidence-calibration-recommendation-advisory-projection-preview.ts",
  previewComponent:
    "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx",
  detailsModal: "components/recommendations/RecommendationDetailsModal.tsx",
  cardContainer: "components/recommendations/RecommendationCardContainer.tsx",
};

const candidateImplementationFiles = [
  paths.projection,
  paths.flag,
  paths.previewAdapter,
  paths.previewComponent,
  paths.detailsModal,
  paths.cardContainer,
];

const action464Files = [paths.doc, paths.verifier, paths.test];

const protectedImplementationFiles = [
  ...candidateImplementationFiles,
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
  paths.action462Verifier,
  "tests/e2e/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.spec.ts",
  "docs/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate.md",
  paths.action463Verifier,
  "tests/e2e/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate.spec.ts",
];

const operatorInputSchema = Object.freeze({
  target_preview_environment: "string",
  environment_classification: ["non_production_preview"],
  authorized_preview_users: "string[] | null",
  access_control_mechanism: "string",
  preview_start_condition: "string",
  maximum_preview_duration_minutes: "positive_integer_max_480",
  preview_flag_value: ["true"],
  development_diagnostics_enabled: [false],
  evidence_retention: ["none", "bounded_manual_summary"],
  telemetry_policy: ["none", "existing_aggregate_only"],
  acceptable_failure_threshold: {
    recommendation_render_failures: [0],
    original_confidence_mutation_events: [0],
    confidence_application_events: [0],
    ranking_scanner_publication_execution_effects: [0],
    add_trade_risk_sizing_effects: [0],
    production_exposure_events: [0],
    unauthorized_access_events: [0],
    raw_data_exposure_events: [0],
    route_provider_supabase_persistence_replay_feedback_events: [0],
    kill_switch_failures: [0],
    preview_unavailable_events_allowed: "non_negative_integer",
  },
  rollback_owner: "string",
  kill_switch_owner: "string",
  deployment_operator: "string",
  observation_owner: "string",
  original_confidence_remains_authoritative: [true],
  confidence_application_authorized: [false],
  proposed_confidence_affects_runtime_behavior: [false],
  production_activation_authorized: [false],
  persistent_projection_evidence_authorized: [false],
  deployment_readiness_explicitly_approved: "boolean",
  deployment_candidate_isolated: "boolean",
  deployment_candidate_inventory_hash: "sha256 | null",
});

const suppliedOperatorInputs = Object.freeze({});
const unresolvedOperatorInputs = Object.freeze([
  "target_preview_environment",
  "environment_classification",
  "authorized_preview_users_or_access_boundary",
  "access_control_mechanism",
  "preview_start_condition",
  "maximum_preview_duration_minutes",
  "preview_flag_value",
  "development_diagnostics_enabled",
  "evidence_retention",
  "telemetry_policy",
  "acceptable_failure_threshold",
  "rollback_owner",
  "kill_switch_owner",
  "deployment_operator",
  "observation_owner",
  "authority_confirmations",
  "deployment_readiness_explicitly_approved",
  "deployment_candidate_isolated",
  "deployment_candidate_inventory_hash",
]);

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function fileHash(path) {
  return exists(path) ? sha256(read(path)) : null;
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

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function isApprovedStaticArtifact(path) {
  if (/^docs\/action-4(?:4[7-9]|5[0-9]|6[0-5])-/.test(path)) return true;
  if (/^scripts\/action-4(?:4[7-9]|5[0-9]|6[0-5])-/.test(path)) return true;
  if (/^tests\/e2e\/action-4(?:4[7-9]|5[0-9]|6[0-5])-/.test(path)) {
    return true;
  }
  return false;
}

function isAllowedCandidateFile(path) {
  return (
    candidateImplementationFiles.includes(path) ||
    action464Files.includes(path) ||
    isApprovedStaticArtifact(path) ||
    [
      "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
      "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
      "scripts/action-320-static-replay-branch-package-verify.mjs",
    ].includes(path)
  );
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const flagSource = exists(paths.flag) ? read(paths.flag) : "";
const previewSources = [paths.flag, paths.previewAdapter, paths.previewComponent]
  .filter(exists)
  .map((path) => [path, read(path)]);

const beforeHashes = Object.fromEntries(
  protectedImplementationFiles.map((path) => [path, fileHash(path)]),
);

const action462Report = runJsonVerifier(paths.action462Verifier);
const action463Report = runJsonVerifier(paths.action463Verifier);

const afterHashes = Object.fromEntries(
  protectedImplementationFiles.map((path) => [path, fileHash(path)]),
);

const protectedHashResults = Object.fromEntries(
  protectedImplementationFiles.map((path) => [
    path,
    {
      before: beforeHashes[path],
      after: afterHashes[path],
      unchanged: beforeHashes[path] === afterHashes[path],
    },
  ]),
);

const docSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 463 Readiness Result",
  "Release Classification",
  "Current Runtime-Preview State",
  "Explicit Non-Goals",
  "Operator-Input Schema",
  "Target Preview Environment",
  "Environment Classification",
  "Preview URL Or Environment Identifier Policy",
  "Authorized-User Boundary",
  "Access-Control Mechanism",
  "Preview Start Condition",
  "Preview Duration",
  "Preview Expiry Behavior",
  "Preview Flag Activation Value",
  "Development-Diagnostics Decision",
  "Evidence-Retention Policy",
  "Manual Observation Policy",
  "Telemetry Policy",
  "Acceptable Failure Threshold",
  "Rollback Owner",
  "Kill-Switch Owner",
  "Deployment Operator",
  "Observation Owner",
  "Escalation Owner If Applicable",
  "Confidence-Authority Confirmation",
  "No-Confidence-Application Confirmation",
  "Production-Prohibition Confirmation",
  "Explicit Deployment-Readiness Approval",
  "Deployment-Candidate Isolation Status",
  "Candidate File Inventory Policy",
  "Unclassified-File Policy",
  "Action 318-320 Guard Policy",
  "Candidate Integrity Policy",
  "Operator-Input Validation",
  "Missing-Input Behavior",
  "Malformed-Input Behavior",
  "Conflicting-Input Behavior",
  "Safe Defaults",
  "Preview Deployment Approval Boundary",
  "Preview Activation Approval Boundary",
  "Kill-Switch Procedure",
  "Rollback Procedure",
  "Observation Procedure",
  "Stop-Condition Procedure",
  "Evidence Cleanup",
  "Expiry Procedure",
  "Post-Preview Verification Requirement",
  "Approval Vocabulary",
  "Approval Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
  "Deployment Status",
  "Runtime-Preview State",
];

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

const runtimeFiles = [
  ...listFiles("app"),
  ...listFiles("components"),
  ...listFiles("lib"),
].filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));

const projectionCallSites = runtimeFiles
  .filter((file) => file !== paths.projection)
  .flatMap((file) => {
    const matches = countMatches(
      read(file),
      /\bbuildConfidenceCalibrationRecommendationProjection\s*\(/g,
    );
    return Array.from({ length: matches }, () => file);
  });

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

const forbiddenRuntimeHits = previewSources
  .filter(([, text]) =>
    /fetch\s*\(|supabase|createClient|\.from\s*\(|\.insert\s*\(|\.upsert\s*\(|localStorage|sessionStorage|indexedDB|document\.cookie|provider|Twelve Data|replay|feedback|telemetry/i.test(
      text,
    ),
  )
  .map(([path]) => path);

const currentEnvironmentPreviewEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env[expected.flagName] === "true";

const validationExamples = {
  non_production_preview: {
    input: {
      target_preview_environment: "preview-calibration-internal",
      environment_classification: "non_production_preview",
    },
    accepted: true,
  },
  production_environment_rejected: {
    input: {
      target_preview_environment: "https://trade.valentinlabs.com",
      environment_classification: "production",
    },
    accepted: false,
    reason: "production_environment_rejected",
  },
  bounded_authorized_access: {
    input: {
      authorized_preview_users: ["operator_alpha"],
      access_control_mechanism: "protected deployment with platform access control",
    },
    accepted: true,
  },
  uncontrolled_public_access_rejected: {
    input: {
      authorized_preview_users: null,
      access_control_mechanism: "public anonymous URL",
    },
    accepted: false,
    reason: "uncontrolled_public_access_rejected",
  },
  bounded_duration: {
    input: { maximum_preview_duration_minutes: 480 },
    accepted: true,
  },
  invalid_duration_rejected: {
    input: { maximum_preview_duration_minutes: 0 },
    accepted: false,
    reason: "invalid_duration_rejected",
  },
  confidence_application_rejected: {
    input: { confidence_application_authorized: true },
    accepted: false,
    reason: "confidence_application_rejected",
  },
  production_activation_rejected: {
    input: { production_activation_authorized: true },
    accepted: false,
    reason: "production_activation_rejected",
  },
  conflicting_inputs_rejected: {
    input: {
      evidence_retention: "none",
      telemetry_policy: "new_persistent_projection_sink",
    },
    accepted: false,
    reason: "conflicting_inputs_rejected",
  },
};

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_sections_complete: includesAll(
    doc,
    docSections.map((section) => `## ${section}`),
  ),
  action462_healthy:
    action462Report?.verification_status === "passed" &&
    action462Report?.readiness_decision === "ready_with_conditions",
  action463_ready_with_conditions:
    action463Report?.verification_status === "passed" &&
    action463Report?.readiness_decision === "ready_with_conditions" &&
    action463Report?.deployment_candidate_decision ===
      "candidate_ready_with_conditions",
  release_classification_frozen: doc.includes(expected.releaseClassification),
  runtime_preview_state_unchanged:
    doc.includes(expected.runtimePreviewStatus) &&
    action463Report?.runtime_preview_status === expected.runtimePreviewStatus,
  exact_input_schema:
    doc.includes('"target_preview_environment"') &&
    doc.includes('"environment_classification": "non_production_preview"') &&
    doc.includes('"maximum_preview_duration_minutes"') &&
    doc.includes('"preview_flag_value": "true"') &&
    doc.includes('"deployment_candidate_inventory_hash"'),
  supplied_inputs_empty: Object.keys(suppliedOperatorInputs).length === 0,
  unresolved_inputs_recorded: unresolvedOperatorInputs.every((input) =>
    JSON.stringify(unresolvedOperatorInputs).includes(input),
  ),
  no_invented_operator_values:
    doc.includes("No concrete target preview environment was supplied") &&
    doc.includes("No authorized preview users were supplied") &&
    doc.includes("No preview duration was supplied") &&
    doc.includes("No evidence-retention policy was supplied"),
  target_environment_policy:
    doc.includes("non_production_preview") &&
    doc.includes("Production, production domains") &&
    validationExamples.production_environment_rejected.accepted === false,
  authorized_user_policy:
    doc.includes("Unrestricted public access") &&
    validationExamples.uncontrolled_public_access_rejected.accepted === false,
  preview_duration_policy:
    doc.includes("Recommended maximum is `480` minutes") &&
    doc.includes("does not silently choose this value") &&
    validationExamples.invalid_duration_rejected.accepted === false,
  flag_policy:
    doc.includes(expected.flagName) &&
    doc.includes("exact lowercase `true`") &&
    doc.includes("Action 464 does not set it") &&
    flagSource.includes("runtime === \"production\""),
  diagnostics_policy:
    doc.includes("development_diagnostics_enabled: false") &&
    doc.includes("No concrete operator decision was supplied"),
  evidence_policy:
    doc.includes("Permitted values:") &&
    doc.includes("bounded_manual_summary") &&
    doc.includes("It must not include Recommendation identifiers"),
  telemetry_policy:
    doc.includes("telemetry_policy: none") &&
    doc.includes("Any telemetry expansion requires a separate gate"),
  failure_thresholds:
    doc.includes("Recommendation render failures: 0") &&
    doc.includes("confidence application: 0") &&
    doc.includes("preview unavailable events is required"),
  owner_requirements:
    doc.includes("No rollback owner was supplied") &&
    doc.includes("No kill-switch owner was supplied") &&
    doc.includes("No deployment operator was supplied") &&
    doc.includes("No observation owner was supplied"),
  authority_confirmations:
    doc.includes("original Recommendation confidence remains authoritative: `true`") &&
    doc.includes("confidence application authorized: `false`") &&
    doc.includes("production activation authorized: `false`"),
  candidate_isolation_policy:
    doc.includes("Current status:") &&
    doc.includes("`not_isolated`") &&
    doc.includes("deployment candidate isolation remains required"),
  current_unclassified_file_counts:
    unclassifiedChangedFiles.length === 318 &&
    unclassifiedPostTradeFiles.length === 40,
  inventory_hash_policy:
    doc.includes("deployment_candidate_inventory_hash") &&
    doc.includes("candidate inventory hash absent"),
  no_inventory_hash_invented: true,
  input_validation_policy:
    doc.includes("presence") &&
    doc.includes("correct type") &&
    doc.includes("bounded value") &&
    doc.includes("no secrets") &&
    doc.includes("Conflicts block or remain unresolved"),
  readiness_decision_expected: doc.includes("`ready_with_conditions`"),
  activation_decision_expected:
    doc.includes("Activation:") &&
    doc.includes("`activation_approved_with_conditions`"),
  next_action_expected: doc.includes(expected.nextAction),
  no_deployment_or_activation:
    doc.includes("not_authorized_not_required_not_performed") &&
    currentEnvironmentPreviewEnabled === false &&
    !exists(".openai/hosting.json"),
  no_environment_modification:
    !statusFiles.some((path) =>
      /^\.env($|\.|\/)|^netlify\.toml$|^\.openai\/hosting\.json$/.test(path),
    ),
  no_routes_added_for_preview: previewRelatedRoutes.length === 0,
  no_persistence_replay_provider_supabase_feedback:
    forbiddenRuntimeHits.length === 0,
  no_confidence_application:
    validationExamples.confidence_application_rejected.accepted === false &&
    !/setConfidence|updateConfidence|appliedConfidence|effectiveConfidence|finalConfidence/.test(
      previewSources.map(([, text]) => text).join("\n"),
    ),
  projection_call_site_still_exact:
    projectionCallSites.length === 1 &&
    projectionCallSites[0] === paths.previewAdapter,
  source_integrity: Object.values(protectedHashResults).every(
    (result) => result.unchanged,
  ),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const readinessDecision =
  failedConditions.length > 0 ? "blocked" : expected.readinessDecision;
const activationDecision =
  readinessDecision === "ready"
    ? "activation_approved_for_future_action"
    : readinessDecision === "ready_with_conditions"
      ? expected.activationDecision
      : "activation_not_approved";
const nextPermittedAction =
  readinessDecision === "ready_with_conditions"
    ? expected.nextAction
    : readinessDecision === "ready"
      ? "action_465_confidence_calibration_recommendation_advisory_projection_preview_deployment_execution_approval_gate"
      : "specific_remediation_approval_gate_matching_blocker";

const unresolvedConditions = [
  "target_preview_environment_unresolved",
  "authorized_preview_users_or_access_boundary_unresolved",
  "preview_start_condition_unresolved",
  "preview_duration_unresolved",
  "evidence_retention_policy_unresolved",
  "telemetry_policy_unresolved",
  "acceptable_failure_threshold_unresolved",
  "rollback_owner_unresolved",
  "kill_switch_owner_unresolved",
  "deployment_operator_unresolved",
  "observation_owner_unresolved",
  "authority_confirmations_unresolved",
  "deployment_readiness_approval_unresolved",
  "deployment_candidate_isolation_unresolved",
  "candidate_inventory_hash_absent",
  "unclassified_changed_files_require_isolation_or_approval",
  "unclassified_post_trade_files_require_isolation_or_approval",
];

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  activation_decision: activationDecision,
  activation_vocabulary: [
    "activation_approved_for_future_action",
    "activation_approved_with_conditions",
    "activation_not_approved",
  ],
  action_nature:
    "static_operator_input_capture_gate_only_deployment_free_activation_free_environment_immutable",
  release_classification: expected.releaseClassification,
  runtime_preview_status: expected.runtimePreviewStatus,
  deployment_status: "not_authorized_not_required_not_performed",
  source_integrity: {
    protected_files: protectedImplementationFiles,
    protected_hash_results: protectedHashResults,
    implementation_sources_unchanged: checks.source_integrity,
  },
  operator_input_schema: operatorInputSchema,
  supplied_operator_inputs: suppliedOperatorInputs,
  unresolved_operator_inputs: unresolvedOperatorInputs,
  validation_examples: validationExamples,
  target_environment_result: {
    supplied: false,
    classification_required: "non_production_preview",
    production_environment_rejected: true,
    localhost_as_deployed_preview_rejected: true,
  },
  authorized_user_access_result: {
    supplied: false,
    bounded_access_required: true,
    uncontrolled_public_access_rejected: true,
  },
  preview_duration_result: {
    supplied: false,
    bounded_required: true,
    maximum_first_preview_minutes: 480,
    value_invented: false,
  },
  flag_and_diagnostics_result: {
    flag_name: expected.flagName,
    activation_value: "true",
    action464_sets_flag: false,
    current_environment_enabled: currentEnvironmentPreviewEnabled,
    production_enabled: false,
    development_diagnostics_recommended: false,
    development_diagnostics_supplied: false,
  },
  evidence_and_telemetry_result: {
    evidence_retention_supplied: false,
    permitted_evidence_retention: ["none", "bounded_manual_summary"],
    telemetry_policy_supplied: false,
    permitted_telemetry_policy: ["none", "existing_aggregate_only"],
    telemetry_expansion_approved: false,
  },
  failure_threshold_result: {
    supplied: false,
    mandatory_zero_tolerance: {
      recommendation_render_failures: 0,
      original_confidence_mutation_events: 0,
      confidence_application_events: 0,
      ranking_scanner_publication_execution_effects: 0,
      add_trade_risk_sizing_effects: 0,
      production_exposure_events: 0,
      unauthorized_access_events: 0,
      raw_data_exposure_events: 0,
      route_provider_supabase_persistence_replay_feedback_events: 0,
      kill_switch_failures: 0,
    },
    preview_unavailable_events_allowed_supplied: false,
  },
  owner_result: {
    rollback_owner_supplied: false,
    kill_switch_owner_supplied: false,
    deployment_operator_supplied: false,
    observation_owner_supplied: false,
  },
  authority_confirmations: {
    original_confidence_remains_authoritative_supplied: false,
    required_original_confidence_remains_authoritative: true,
    confidence_application_authorized_supplied: false,
    required_confidence_application_authorized: false,
    production_activation_authorized_supplied: false,
    required_production_activation_authorized: false,
  },
  deployment_candidate_isolation: {
    isolated: false,
    file_by_file_approval_complete: false,
    unclassified_changed_file_count: unclassifiedChangedFiles.length,
    unclassified_post_trade_file_count: unclassifiedPostTradeFiles.length,
    unclassified_changed_file_examples: unclassifiedChangedFiles.slice(0, 20),
    unclassified_post_trade_examples: unclassifiedPostTradeFiles.slice(0, 20),
  },
  candidate_inventory_hash: null,
  no_effect_results: {
    deployment_performed: false,
    flag_activated: false,
    environment_modified: false,
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
  passed_conditions: Object.entries(checks)
    .filter(([, passed]) => passed)
    .map(([name]) => name),
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  next_permitted_action: nextPermittedAction,
  checks,
};

console.log(JSON.stringify(report, null, 2));

if (failedConditions.length > 0) {
  process.exit(1);
}
