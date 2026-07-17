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
  nextAction:
    "action_464_confidence_calibration_recommendation_advisory_projection_operator_input_capture_and_preview_activation_approval_gate",
};

const paths = {
  doc: "docs/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate.md",
  verifier:
    "scripts/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate-verify.mjs",
  test: "tests/e2e/action-463-confidence-calibration-recommendation-advisory-projection-preview-deployment-readiness-gate.spec.ts",
  action459Verifier:
    "scripts/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-verify.mjs",
  action460Verifier:
    "scripts/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate-verify.mjs",
  action461Verifier:
    "scripts/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation-verify.mjs",
  action462Verifier:
    "scripts/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification-verify.mjs",
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

const action463Files = [paths.doc, paths.verifier, paths.test];

const protectedImplementationFiles = [
  ...candidateImplementationFiles,
  "docs/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.md",
  paths.action459Verifier,
  "tests/e2e/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.spec.ts",
  "docs/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.md",
  paths.action460Verifier,
  "tests/e2e/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.spec.ts",
  "docs/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.md",
  paths.action461Verifier,
  "tests/e2e/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.spec.ts",
  "docs/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.md",
  paths.action462Verifier,
  "tests/e2e/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.spec.ts",
];

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
  if (/^docs\/action-4(?:4[7-9]|5[0-9]|6[0-3])-/.test(path)) return true;
  if (/^scripts\/action-4(?:4[7-9]|5[0-9]|6[0-3])-/.test(path)) return true;
  if (/^tests\/e2e\/action-4(?:4[7-9]|5[0-9]|6[0-3])-/.test(path)) {
    return true;
  }
  return false;
}

function isAllowedCandidateFile(path) {
  return (
    candidateImplementationFiles.includes(path) ||
    action463Files.includes(path) ||
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

const action459Report = runJsonVerifier(paths.action459Verifier);
const action460Report = runJsonVerifier(paths.action460Verifier);
const action461Report = runJsonVerifier(paths.action461Verifier);
const action462Report = runJsonVerifier(paths.action462Verifier);

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
  "Action 459 Release Classification",
  "Action 460 Integration Contract",
  "Action 461 Implementation",
  "Action 462 Readiness Decision",
  "Current Runtime-Preview State",
  "Explicit Non-Goals",
  "Preview Deployment Objective",
  "Exact Deployment Candidate Boundary",
  "Exact File Inventory",
  "Source-Integrity Policy",
  "Feature-Flag Policy",
  "Target Environment Policy",
  "Authorized-User Policy",
  "Preview-Access Policy",
  "Production Prohibition",
  "Operator-Input Inventory",
  "Operator-Input Validation Policy",
  "Safe Defaults",
  "Working-Tree Cleanliness Policy",
  "Unrelated-File Isolation Policy",
  "Action 318-320 Guard Policy",
  "Build, Type, Lint, Test Requirements",
  "Preview URL And Access Requirements",
  "Preview Duration Policy",
  "Observation Policy",
  "Evidence-Retention Policy",
  "Privacy Policy",
  "Telemetry Policy",
  "No-Confidence-Application Policy",
  "No-Persistence Policy",
  "No-Replay Policy",
  "No-Provider/Supabase Policy",
  "Rollback Plan",
  "Kill-Switch Plan",
  "Activation Plan",
  "Stop Conditions",
  "Failure Handling",
  "Deployment Candidate Decision Vocabulary",
  "Readiness Decision Vocabulary",
  "Readiness Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
  "Production Status",
  "Deployment Status",
];

const operatorInputs = [
  "target preview environment",
  "authorized preview users or access mechanism",
  "preview activation start condition",
  "maximum preview duration",
  "preview flag value",
  "development diagnostics enabled or disabled",
  "evidence-retention policy",
  "rollback owner",
  "kill-switch owner",
  "deployment operator",
  "observation owner",
  "acceptable failure threshold",
  "original Recommendation confidence remains authoritative",
  "proposed confidence must not be applied",
  "production activation is prohibited",
  "explicit deployment-readiness approval",
];

const validationRequirements = [
  "git diff --check",
  "npx next typegen",
  "npx tsc --noEmit",
  "npm run build",
  "npm run lint",
  "Action 309 guard",
  "Actions 459-463 verifiers",
  "Action 461 focused suite",
  "Action 462 focused suite",
  "Action 463 focused suite",
  "Recommendation details regressions",
  "exact one runtime projection call site",
  "preview flag disabled",
  "no production enablement",
  "no new route",
  "no persistence",
  "no confidence application",
  "working tree or isolated candidate has no unclassified files",
];

const activationChecks = [
  "deployment completed in approved preview environment",
  "preview URL/access works",
  "preview flag is initially disabled",
  "Recommendation UI works with preview disabled",
  "kill switch has been tested disabled",
  "authorized users are confirmed",
  "observation owner is present",
  "rollback owner is available",
  "no production environment is targeted",
  "activation approval has been explicitly issued",
];

const stopConditions = [
  "original Recommendation confidence changes",
  "proposed confidence affects sorting/filtering",
  "ranking, scanner, publication, or execution changes",
  "Add Trade, risk, or sizing consumes preview data",
  "preview appears in production",
  "unauthorized users gain access",
  "raw internal data appears",
  "a route, provider, or Supabase call appears",
  "persistence, replay, or feedback occurs",
  "Recommendation rendering fails",
  "projection errors escape the preview boundary",
  "kill switch fails",
  "unclassified deployment files are discovered",
  "confidence application occurs",
];

const statusFiles = gitStatusFiles();
const unclassifiedChangedFiles = statusFiles.filter(
  (path) => !isAllowedCandidateFile(path),
);
const unrelatedPostTradeFiles = statusFiles.filter((path) =>
  /(^|\/)post-trade-|20260710000000_create_execution_authorization_consumptions/.test(
    path,
  ),
);
const unclassifiedPostTradeFiles = unrelatedPostTradeFiles.filter(
  (path) => !isAllowedCandidateFile(path),
);

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

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_sections_complete: includesAll(
    doc,
    docSections.map((section) => `## ${section}`),
  ),
  action459_healthy:
    action459Report?.verification_status === "passed" &&
    action459Report?.release_classification === expected.releaseClassification,
  action460_healthy:
    action460Report?.verification_status === "passed" &&
    action460Report?.approval_decision === "approved_with_conditions",
  action461_healthy:
    action461Report?.verification_status === "passed" &&
    action461Report?.runtime_preview_status === expected.runtimePreviewStatus,
  action462_ready_with_conditions:
    action462Report?.verification_status === "passed" &&
    action462Report?.readiness_decision === "ready_with_conditions" &&
    action462Report?.runtime_preview_status === expected.runtimePreviewStatus,
  release_classification_frozen: doc.includes(expected.releaseClassification),
  candidate_boundary_frozen: candidateImplementationFiles.every((path) =>
    doc.includes(path),
  ),
  action463_only_static_artifacts: action463Files.every((path) =>
    doc.includes(path),
  ),
  implementation_sources_unchanged: Object.values(protectedHashResults).every(
    (result) => result.unchanged,
  ),
  working_tree_isolation_required:
    doc.includes("clean isolated branch/candidate") &&
    doc.includes("complete independent classification and approval"),
  unrelated_post_trade_not_allowlisted: unclassifiedPostTradeFiles.length > 0,
  operator_inputs_frozen: operatorInputs.every((input) => doc.includes(input)),
  non_production_environment_required:
    doc.includes("non-production") &&
    doc.includes("production domain excluded"),
  authorized_user_policy_frozen:
    doc.includes("deployment protected by platform authentication") &&
    doc.includes("named internal operators") &&
    doc.includes("unprotected public preview is not approved"),
  flag_activation_contract_frozen:
    doc.includes(expected.flagName) &&
    doc.includes("Future preview activation may set the value to exact `true`") &&
    doc.includes("Action 463 does not set this value") &&
    flagSource.includes("runtime === \"production\""),
  preview_duration_bounded:
    doc.includes("one trading session") &&
    doc.includes("one business day") &&
    doc.includes("No indefinite preview activation"),
  evidence_policy_bounded:
    doc.includes("preview render succeeded") &&
    doc.includes("aggregate count by bounded preview status") &&
    doc.includes("Do not retain") &&
    doc.includes("Recommendation fingerprints") &&
    doc.includes("raw warnings/issues"),
  no_telemetry_expansion_policy:
    doc.includes("No telemetry expansion is approved") &&
    doc.includes("manual bounded observation"),
  no_persistence_replay_provider_supabase_feedback:
    doc.includes("No-Persistence Policy") &&
    doc.includes("No-Replay Policy") &&
    doc.includes("No-Provider/Supabase Policy") &&
    forbiddenRuntimeHits.length === 0,
  validation_requirements_frozen: validationRequirements.every((item) =>
    doc.includes(item),
  ),
  activation_prechecks_frozen: activationChecks.every((item) =>
    doc.includes(item),
  ),
  rollback_and_kill_switch_frozen:
    doc.includes("disabling or removing the preview flag") &&
    doc.includes("no migration or data cleanup") &&
    doc.includes("disable flag immediately"),
  stop_conditions_frozen: stopConditions.every((item) => doc.includes(item)),
  readiness_vocabulary_exact:
    doc.includes("- `ready`") &&
    doc.includes("- `ready_with_conditions`") &&
    doc.includes("- `blocked`"),
  readiness_decision_expected:
    doc.includes("`ready_with_conditions`") &&
    doc.includes("operator inputs and deployment-candidate isolation remain outstanding"),
  next_action_expected: doc.includes(expected.nextAction),
  no_deployment_or_activation:
    doc.includes("not_authorized_not_required_not_performed") &&
    !exists(".openai/hosting.json") &&
    currentEnvironmentPreviewEnabled === false,
  runtime_preview_state_unchanged:
    doc.includes(expected.runtimePreviewStatus) &&
    action462Report?.runtime_preview_status === expected.runtimePreviewStatus,
  no_routes_added_for_preview: previewRelatedRoutes.length === 0,
  projection_call_site_still_exact:
    projectionCallSites.length === 1 &&
    projectionCallSites[0] === paths.previewAdapter,
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const unresolvedConditions = [
  "operator_inputs_remain_outstanding",
  "target_preview_environment_remains_outstanding",
  "authorized_preview_users_or_access_boundary_remains_outstanding",
  "preview_duration_remains_outstanding",
  "evidence_retention_policy_remains_outstanding",
  "rollback_owner_remains_outstanding",
  "kill_switch_owner_remains_outstanding",
  "deployment_operator_remains_outstanding",
  "observation_owner_remains_outstanding",
  "working_tree_deployment_candidate_isolation_remains_outstanding",
  "unrelated_dirty_files_require_isolation_or_independent_approval",
  "explicit_deployment_readiness_approval_remains_outstanding",
];

const readinessDecision =
  failedConditions.length > 0 ? "blocked" : expected.readinessDecision;

const deploymentCandidateDecision =
  failedConditions.length > 0
    ? "candidate_blocked"
    : unclassifiedChangedFiles.length > 0
      ? "candidate_ready_with_conditions"
      : "candidate_isolated";

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  deployment_candidate_decision: deploymentCandidateDecision,
  deployment_candidate_vocabulary: [
    "candidate_isolated",
    "candidate_ready_with_conditions",
    "candidate_blocked",
  ],
  action_nature:
    "static_approval_gate_only_deployment_free_activation_free_source_immutable",
  release_classification: expected.releaseClassification,
  runtime_preview_status: expected.runtimePreviewStatus,
  deployment_status: "not_authorized_not_required_not_performed",
  production_status: "production_activation_prohibited",
  source_integrity: {
    protected_files: protectedImplementationFiles,
    protected_hash_results: protectedHashResults,
    implementation_sources_unchanged:
      checks.implementation_sources_unchanged,
  },
  deployment_candidate_boundary: {
    candidate_implementation_files: candidateImplementationFiles,
    action463_gate_files: action463Files,
    approved_static_artifacts: "action_447_through_action_463_static_artifacts",
    unrelated_runtime_or_post_trade_work_included: false,
  },
  working_tree_isolation: {
    requirement:
      "clean_isolated_candidate_or_complete_independent_classification_required",
    current_status:
      unclassifiedChangedFiles.length > 0
        ? "dirty_with_unclassified_files"
        : "clean_or_candidate_scoped",
    changed_file_count: statusFiles.length,
    unclassified_changed_file_count: unclassifiedChangedFiles.length,
    unrelated_post_trade_file_count: unrelatedPostTradeFiles.length,
    unclassified_post_trade_file_count: unclassifiedPostTradeFiles.length,
    unclassified_changed_file_examples: unclassifiedChangedFiles.slice(0, 20),
    unrelated_post_trade_examples: unrelatedPostTradeFiles.slice(0, 20),
    action318_320_must_pass_or_receive_file_by_file_approval: true,
  },
  operator_inputs: {
    required: operatorInputs,
    complete: false,
    missing_inputs_block_activation: true,
  },
  target_environment_policy: {
    first_activation_preview_only: true,
    production_domain_excluded: true,
    production_environment_variables_excluded: true,
    preview_flag_disabled_by_default: true,
    separate_configuration_approval_required_if_not_guaranteed: true,
  },
  authorized_user_policy: {
    exact_future_access_model_required: true,
    unprotected_public_preview_approved: false,
    new_auth_system_added_by_action463: false,
  },
  flag_activation_policy: {
    flag_name: expected.flagName,
    action463_sets_flag: false,
    future_preview_value: "true",
    production_enabled: false,
    current_environment_enabled: currentEnvironmentPreviewEnabled,
    bypass_allowed: false,
    kill_switch: "remove_or_disable_flag",
  },
  preview_duration_policy: {
    bounded_required: true,
    recommended_initial_maximum: ["one_trading_session", "one_business_day"],
    indefinite_activation_approved: false,
  },
  evidence_and_telemetry_policy: {
    bounded_manual_observation_allowed: true,
    telemetry_expansion_approved: false,
    persistent_projection_evidence_approved: false,
    raw_internal_data_retention_approved: false,
  },
  validation_requirements: validationRequirements,
  activation_checks: activationChecks,
  rollback_and_kill_switch: {
    flag_disable_hides_preview: true,
    no_migration_cleanup_required: true,
    code_rollback_secondary_fallback_only: true,
    stop_same_session_repair_while_enabled: true,
  },
  stop_conditions: stopConditions,
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
    telemetry_infrastructure_added: false,
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
  next_permitted_action: expected.nextAction,
  checks,
};

console.log(JSON.stringify(report, null, 2));

if (failedConditions.length > 0) {
  process.exit(1);
}

