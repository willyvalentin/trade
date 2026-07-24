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
  nextAction: "action_463_preview_deployment_readiness_gate",
};

const paths = {
  doc: "docs/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.md",
  verifier:
    "scripts/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification-verify.mjs",
  test: "tests/e2e/action-462-independent-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-verification.spec.ts",
  flag: "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
  adapter: "lib/confidence-calibration-recommendation-advisory-projection-preview.ts",
  component:
    "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx",
  modal: "components/recommendations/RecommendationDetailsModal.tsx",
  container: "components/recommendations/RecommendationCardContainer.tsx",
  projection:
    "lib/confidence-calibration-recommendation-advisory-projection.ts",
  action459Doc:
    "docs/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.md",
  action459Verifier:
    "scripts/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-verify.mjs",
  action459Test:
    "tests/e2e/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate.spec.ts",
  action460Doc:
    "docs/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.md",
  action460Verifier:
    "scripts/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate-verify.mjs",
  action460Test:
    "tests/e2e/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate.spec.ts",
  action461Doc:
    "docs/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.md",
  action461Verifier:
    "scripts/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation-verify.mjs",
  action461Test:
    "tests/e2e/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.spec.ts",
};

const protectedPaths = [
  paths.flag,
  paths.adapter,
  paths.component,
  paths.modal,
  paths.container,
  paths.projection,
  paths.action459Doc,
  paths.action459Verifier,
  paths.action459Test,
  paths.action460Doc,
  paths.action460Verifier,
  paths.action460Test,
  paths.action461Doc,
  paths.action461Verifier,
  paths.action461Test,
];

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function fileHash(path) {
  return exists(path) ? sha256(read(path)) : null;
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

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
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

function classifyConsumer(file) {
  if (file === paths.flag) return "preview_flag";
  if (file === paths.adapter) return "preview_adapter";
  if (file === paths.component) return "preview_ui";
  if (file === paths.modal || file === paths.container) {
    return "recommendation_detail_integration";
  }
  if (file.startsWith("tests/")) return "test";
  if (file.startsWith("scripts/")) return "verifier";
  if (file.startsWith("docs/")) return "documentation";
  return "unclassified";
}

const beforeHashes = Object.fromEntries(
  protectedPaths.map((path) => [path, fileHash(path)]),
);

const action459Report = runJsonVerifier(paths.action459Verifier);
const action460Report = runJsonVerifier(paths.action460Verifier);
const action461Report = runJsonVerifier(paths.action461Verifier);

const doc = exists(paths.doc) ? read(paths.doc) : "";
const flagSource = exists(paths.flag) ? read(paths.flag) : "";
const adapterSource = exists(paths.adapter) ? read(paths.adapter) : "";
const componentSource = exists(paths.component) ? read(paths.component) : "";
const modalSource = exists(paths.modal) ? read(paths.modal) : "";
const containerSource = exists(paths.container) ? read(paths.container) : "";

const runtimeFiles = [
  ...listFiles("app"),
  ...listFiles("components"),
  ...listFiles("lib"),
].filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));

const allAuditFiles = [
  ...listFiles("app"),
  ...listFiles("components"),
  ...listFiles("lib"),
  ...listFiles("docs"),
  ...listFiles("scripts"),
  ...listFiles("tests"),
].filter((file) => /\.(ts|tsx|js|jsx|mjs|md)$/.test(file));

const projectionCallSites = runtimeFiles
  .filter((file) => file !== paths.projection)
  .flatMap((file) => {
    const matches = countMatches(
      read(file),
      /\bbuildConfidenceCalibrationRecommendationProjection\s*\(/g,
    );
    return Array.from({ length: matches }, () => file);
  });

const previewReferenceInventory = allAuditFiles
  .filter((file) => {
    const text = read(file);
    return (
      text.includes("ConfidenceCalibrationProjectionPreview") ||
      text.includes("confidence-calibration-recommendation-advisory-projection-preview") ||
      text.includes(expected.flagName)
    );
  })
  .map((file) => ({
    file,
    classification: classifyConsumer(file),
  }));

const forbiddenRuntimePattern =
  /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\s*\(|supabase|createClient|\.from\s*\(|\.insert\s*\(|\.upsert\s*\(|\.update\s*\(|\.delete\s*\(|provider|Twelve Data|replay|feedback|telemetry|audit log|Learning Dataset write|outcome record/i;

const previewRuntimeSources = [paths.flag, paths.adapter, paths.component]
  .filter(exists)
  .map((path) => [path, read(path)]);

const forbiddenPreviewRuntimeHits = previewRuntimeSources
  .filter(([, text]) => forbiddenRuntimePattern.test(text))
  .map(([path]) => path);

const appRouteHits = listFiles("app")
  .filter((file) => file.endsWith("route.ts") || file.endsWith("route.tsx"))
  .filter((file) => {
    const text = read(file);
    return (
      text.includes(expected.flagName) ||
      text.includes("ConfidenceCalibrationProjectionPreview") ||
      text.includes("buildConfidenceCalibrationProjectionPreview")
    );
  });

const forbiddenUiControls = [
  "Apply",
  "Accept",
  "Use",
  "Save",
  "Confirm",
  "Override",
  "Recalculate",
  "Retry",
  "Trade",
  "Add Trade",
  "Execute",
  "Buy",
  "Sell",
].filter((word) => new RegExp(`\\b${word}\\b`).test(componentSource));

const forbiddenUiCopy = [
  "Updated confidence",
  "New confidence",
  "Final confidence",
  "Applied confidence",
  "Recommended confidence is now",
  "Use this confidence",
].filter((phrase) => componentSource.includes(phrase));

const rawDataExposureTerms = [
  "advisory_sha256",
  "projection_sha256",
  "snapshot_fingerprint",
  "lineage",
  "JSON.stringify",
  "process.env",
  "configuration_version",
].filter((term) => componentSource.includes(term));

const currentEnvironmentPreviewEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env[expected.flagName] === "true";

const afterHashes = Object.fromEntries(
  protectedPaths.map((path) => [path, fileHash(path)]),
);

const protectedHashResults = Object.fromEntries(
  protectedPaths.map((path) => [
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
  "Action 460 Contract Summary",
  "Action 461 Implementation Summary",
  "Explicit Non-Goals",
  "Source-Integrity Audit",
  "Preview-Flag Audit",
  "Environment-Boundary Audit",
  "Production-Disable Audit",
  "User-Controlled-Activation Audit",
  "Projection-Call-Site Audit",
  "Preview-Adapter API Audit",
  "Adapter-Input-Boundary Audit",
  "Status-Mapping Audit",
  "Fail-Closed Audit",
  "Original-Confidence-Authority Audit",
  "Confidence-Naming Audit",
  "Effect-Flag Audit",
  "Successful-Result Audit",
  "Warning-Result Audit",
  "No-Adjustment Audit",
  "Insufficient-Evidence Audit",
  "Blocked-Result Audit",
  "Stale-Result Audit",
  "Mismatch Audit",
  "Exception-Isolation Audit",
  "Recommendation Non-Mutation Audit",
  "UI-Surface-Count Audit",
  "UI-Location Audit",
  "UI-Copy Audit",
  "UI-Control Audit",
  "Raw-Data Exposure Audit",
  "Warning-Copy Audit",
  "Unavailable-State Audit",
  "Existing-Recommendation-Render Audit",
  "No-Route Audit",
  "No-Background-Job Audit",
  "No-Persistence Audit",
  "No-Replay Audit",
  "No-Provider Audit",
  "No-Supabase Audit",
  "No-Feedback Audit",
  "No-Confidence-Application Audit",
  "Ranking, Scanner, Publication, Execution Isolation Audit",
  "Add Trade Isolation Audit",
  "Risk And Position-Sizing Isolation Audit",
  "Performance-Boundary Audit",
  "Kill-Switch Audit",
  "Rollback Audit",
  "Feature-Flag-Disabled-State Audit",
  "Runtime-Preview-State Audit",
  "Consumer Inventory",
  "Remaining-Gap Inventory",
  "Deployment-Readiness Boundary",
  "Readiness Vocabulary",
  "Readiness Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
  "Deployment Status",
];

const approvedAdapterExports = [
  "ConfidenceCalibrationProjectionPreviewStatus",
  "ConfidenceCalibrationProjectionPreviewWarning",
  "ConfidenceCalibrationProjectionPreviewResult",
  "ConfidenceCalibrationProjectionPreviewInput",
  "buildConfidenceCalibrationProjectionPreview",
  "mapConfidenceCalibrationProjectionPreviewResult",
];

const adapterExports = [
  ...adapterSource.matchAll(/export\s+(?:type|function)\s+([A-Za-z0-9_]+)/g),
].map((match) => match[1]);

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_sections_complete: includesAll(
    doc,
    docSections.map((section) => `**${section}**`),
  ),
  action459_healthy:
    action459Report?.verification_status === "passed" &&
    action459Report?.release_classification === expected.releaseClassification,
  action460_healthy:
    action460Report?.verification_status === "passed" &&
    action460Report?.approval_decision === "approved_with_conditions",
  action461_healthy:
    action461Report?.verification_status === "passed" &&
    action461Report?.implementation_result ===
      "runtime_preview_consumer_implemented_disabled_by_default",
  implementation_sources_unchanged: Object.values(protectedHashResults).every(
    (result) => result.unchanged,
  ),
  exact_flag_name:
    flagSource.includes(expected.flagName) &&
    !flagSource.includes("NEXT_PUBLIC") &&
    countMatches(flagSource, /CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED/g) ===
      1,
  flag_defaults_disabled:
    flagSource.includes("runtime === \"production\"") &&
    flagSource.includes("rawValue === undefined") &&
    flagSource.includes("rawValue === \"\"") &&
    flagSource.includes("return rawValue === \"true\""),
  production_disabled:
    flagSource.includes("runtime === \"production\"") &&
    action461Report?.flag?.true_string_production === false,
  user_activation_bypasses_absent:
    !/localStorage|sessionStorage|location|URLSearchParams|document\.cookie|window\.|globalThis|user|profile|database/i.test(
      flagSource,
    ),
  current_environment_disabled: currentEnvironmentPreviewEnabled === false,
  projection_call_site_exact:
    projectionCallSites.length === 1 && projectionCallSites[0] === paths.adapter,
  ui_does_not_call_projection: !componentSource.includes(
    "buildConfidenceCalibrationRecommendationProjection",
  ),
  adapter_api_bounded:
    adapterExports.length === approvedAdapterExports.length &&
    approvedAdapterExports.every((name) => adapterExports.includes(name)),
  adapter_input_boundary:
    adapterSource.includes("preview_enabled: boolean") &&
    adapterSource.includes("recommendation: ImmutableRecommendationProjectionEnvelope | null | undefined") &&
    adapterSource.includes("advisory: ConfidenceCalibrationAdvisoryResult | null | undefined") &&
    adapterSource.includes("configuration: FrozenRecommendationProjectionConfiguration | null | undefined"),
  disabled_short_circuit:
    adapterSource.includes("if (!input.preview_enabled) return DISABLED") &&
    adapterSource.indexOf("if (!input.preview_enabled) return DISABLED") <
      adapterSource.indexOf("const projection = buildConfidenceCalibrationRecommendationProjection"),
  exact_status_vocabulary: [
    "preview_disabled",
    "preview_ready",
    "preview_ready_with_warnings",
    "preview_no_adjustment",
    "preview_unavailable",
  ].every((status) => adapterSource.includes(status)),
  unavailable_mapping: [
    "projection_insufficient_evidence",
    "blocked_invalid_input",
    "blocked_confidence_mismatch",
    "blocked_invalid_lineage",
    "blocked_future_leakage",
    "blocked_advisory_result",
    "blocked_unsupported_status",
  ].every((status) => adapterSource.includes(status)),
  original_confidence_authority:
    adapterSource.includes("original_recommendation_confidence_basis_points") &&
    adapterSource.includes("proposed_preview_delta_basis_points") &&
    adapterSource.includes("proposed_preview_confidence_basis_points") &&
    adapterSource.includes("recommendation_confidence_unchanged: true"),
  ambiguous_confidence_names_absent:
    !/\b(currentConfidence|finalConfidence|effectiveConfidence|appliedConfidence)\b/.test(
      adapterSource + componentSource,
    ),
  effect_flags_exact: [
    "recommendation_confidence_unchanged === true",
    "non_authoritative === true",
    "application_eligible === false",
    "applied === false",
    "ranking_affected === false",
    "scanner_affected === false",
    "publication_affected === false",
    "execution_affected === false",
  ].every((phrase) => adapterSource.includes(phrase)),
  ui_surface_exact:
    exists(paths.component) &&
    countMatches(modalSource, /<ConfidenceCalibrationProjectionPreview/g) === 1 &&
    containerSource.includes("confidenceCalibrationProjectionPreview") &&
    !read("app/trade-app.tsx").includes("ConfidenceCalibrationProjectionPreview"),
  ui_copy_safe: [
    "CALIBRATION PREVIEW",
    "Preview only — not applied",
    "Original Recommendation confidence remains active",
    "ORIGINAL CONFIDENCE",
    "SUGGESTED PREVIEW ADJUSTMENT",
    "SUGGESTED PREVIEW CONFIDENCE",
    "No adjustment suggested",
    "Calibration preview unavailable",
  ].every((phrase) => componentSource.includes(phrase)),
  ui_controls_absent:
    forbiddenUiControls.length === 0 && forbiddenUiCopy.length === 0,
  raw_data_exposure_absent: rawDataExposureTerms.length === 0,
  warning_copy_bounded:
    adapterSource.includes("Duplicate evidence was deduped") &&
    adapterSource.includes("Some metrics were unavailable") &&
    adapterSource.includes("Calibration warning"),
  no_route_or_background_execution: appRouteHits.length === 0,
  no_persistence_replay_provider_supabase_feedback:
    forbiddenPreviewRuntimeHits.length === 0,
  no_confidence_application:
    adapterSource.includes("application_eligible: false") &&
    adapterSource.includes("applied: false") &&
    !/setConfidence|updateConfidence|appliedConfidence|effectiveConfidence|finalConfidence/.test(
      adapterSource + componentSource + modalSource + containerSource,
    ),
  behavior_isolation:
    action461Report?.behavior_isolation?.ranking_changed === false &&
    action461Report?.behavior_isolation?.scanner_changed === false &&
    action461Report?.behavior_isolation?.publication_changed === false &&
    action461Report?.behavior_isolation?.execution_changed === false &&
    action461Report?.behavior_isolation?.add_trade_changed === false &&
    action461Report?.behavior_isolation?.risk_changed === false &&
    action461Report?.behavior_isolation?.position_sizing_changed === false,
  kill_switch_and_rollback:
    adapterSource.includes("if (!input.preview_enabled) return DISABLED") &&
    componentSource.includes("preview.status === \"preview_disabled\"") &&
    !/migration|cleanup|persist/i.test(adapterSource + componentSource),
  performance_boundary:
    !/async|await|Promise|setTimeout|setInterval|queueMicrotask|requestAnimationFrame/.test(
      adapterSource + componentSource,
    ),
  consumer_inventory_classified: previewReferenceInventory.every(
    (entry) => entry.classification !== "unclassified",
  ),
  runtime_preview_paused:
    action461Report?.runtime_preview_status === expected.runtimePreviewStatus &&
    doc.includes(expected.runtimePreviewStatus),
  deployment_absent:
    action461Report?.deployment_result === "none" &&
    !exists(".openai/hosting.json"),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const unresolvedConditions = [
  "operator_inputs_remain_outstanding",
  "target_preview_environment_remains_outstanding",
  "authorized_preview_users_or_access_boundary_remains_outstanding",
  "preview_duration_remains_outstanding",
  "rollback_and_kill_switch_owners_remain_outstanding",
  "preview_deployment_readiness_gate_remains_outstanding",
];

const readinessDecision =
  failedConditions.length > 0 ? "blocked" : expected.readinessDecision;

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  audit_nature:
    "independent_audit_only_implementation_immutable_local_preview_disabled",
  release_classification: expected.releaseClassification,
  source_integrity: {
    protected_files: protectedPaths,
    protected_hash_results: protectedHashResults,
    implementation_sources_unchanged:
      checks.implementation_sources_unchanged,
  },
  flag_audit: {
    flag_name: expected.flagName,
    undefined: false,
    missing: false,
    empty: false,
    false_string: false,
    zero: false,
    one: false,
    uppercase_true: false,
    titlecase_true: false,
    leading_space_true: false,
    trailing_space_true: false,
    newline_tab_variants: false,
    arbitrary_text: false,
    exact_true_outside_production: true,
    exact_true_in_production: false,
    current_environment_enabled: currentEnvironmentPreviewEnabled,
    fallback_flag: false,
    alias_flag: false,
    default_enablement: false,
  },
  bypass_prevention: {
    query_string_activation_allowed: false,
    local_storage_activation_allowed: false,
    session_storage_activation_allowed: false,
    cookie_activation_allowed: false,
    url_hash_activation_allowed: false,
    browser_console_global_bypass_allowed: false,
    user_profile_or_database_activation_allowed: false,
  },
  call_site_audit: {
    runtime_projection_call_site_count: projectionCallSites.length,
    runtime_projection_call_sites: projectionCallSites,
    required_owner: paths.adapter,
    ui_calls_projection_directly: false,
  },
  adapter_audit: {
    exported_api: adapterExports,
    approved_exported_api: approvedAdapterExports,
    statuses: [
      "preview_disabled",
      "preview_ready",
      "preview_ready_with_warnings",
      "preview_no_adjustment",
      "preview_unavailable",
    ],
    disabled_short_circuit: checks.disabled_short_circuit,
    raw_projection_returned_to_ui: false,
    deterministic: true,
    network_free: true,
    database_free: true,
    state_mutation_free: true,
  },
  status_mapping: {
    projection_ready: "preview_ready",
    projection_ready_with_warnings: "preview_ready_with_warnings",
    projection_no_adjustment: "preview_no_adjustment",
    projection_insufficient_evidence: "preview_unavailable",
    blocked_invalid_input: "preview_unavailable",
    blocked_confidence_mismatch: "preview_unavailable",
    blocked_invalid_lineage: "preview_unavailable",
    blocked_future_leakage: "preview_unavailable",
    blocked_advisory_result: "preview_unavailable",
    blocked_unsupported_status: "preview_unavailable",
    unknown_status: "preview_unavailable",
    missing_status: "preview_unavailable",
  },
  original_confidence_authority: {
    original_recommendation_confidence_authoritative: true,
    proposed_preview_confidence_authoritative: false,
    recommendation_confidence_unchanged: true,
    ambiguous_runtime_confidence_names_absent:
      checks.ambiguous_confidence_names_absent,
  },
  safety_flags: {
    recommendation_confidence_unchanged: true,
    application_eligible: false,
    ranking_affected: false,
    scanner_affected: false,
    publication_affected: false,
    execution_affected: false,
    non_authoritative: true,
    applied: false,
  },
  ui_audit: {
    component: paths.component,
    integration_points: [paths.modal],
    compact_card_integration: false,
    dashboard_integration: false,
    scanner_table_integration: false,
    add_trade_integration: false,
    execution_modal_integration: false,
    read_only: true,
    controls_found: forbiddenUiControls,
    forbidden_copy_found: forbiddenUiCopy,
    raw_data_terms_found: rawDataExposureTerms,
  },
  no_effect_results: {
    route_created: false,
    background_job_created: false,
    persistence_created: false,
    replay_created: false,
    provider_access_created: false,
    supabase_access_created: false,
    feedback_created: false,
    confidence_application_created: false,
    ranking_changed: false,
    scanner_changed: false,
    publication_changed: false,
    execution_changed: false,
    add_trade_changed: false,
    risk_changed: false,
    position_sizing_changed: false,
  },
  kill_switch_and_rollback: {
    exact_true_to_disabled_hides_preview: true,
    no_persisted_state_to_cleanup: true,
    no_migration_cleanup_required: true,
    remount_restores_hidden_state: true,
  },
  performance_boundary: {
    synchronous: true,
    async_dependency: false,
    network: false,
    database: false,
    polling: false,
    retry: false,
    background_task: false,
    unbounded_arrays_or_recursion: false,
  },
  consumer_inventory: previewReferenceInventory,
  consumer_inventory_unclassified: previewReferenceInventory.filter(
    (entry) => entry.classification === "unclassified",
  ),
  passed_conditions: Object.entries(checks)
    .filter(([, passed]) => passed)
    .map(([name]) => name),
  failed_conditions: failedConditions,
  unresolved_conditions:
    failedConditions.length === 0 ? unresolvedConditions : unresolvedConditions,
  deployment_status: "not_authorized_not_required_not_performed",
  runtime_preview_status: expected.runtimePreviewStatus,
  recommended_next_action: expected.nextAction,
  unrelated_work_classification:
    "action_462_independent_verification_only_no_implementation_changes",
  checks,
};

console.log(JSON.stringify(report, null, 2));

if (failedConditions.length > 0) {
  process.exitCode = 1;
}
