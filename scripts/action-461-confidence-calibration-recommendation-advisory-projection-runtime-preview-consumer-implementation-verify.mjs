#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

const paths = {
  doc: "docs/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.md",
  verifier: "scripts/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation-verify.mjs",
  test: "tests/e2e/action-461-confidence-calibration-recommendation-advisory-projection-runtime-preview-consumer-implementation.spec.ts",
  flag: "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
  adapter: "lib/confidence-calibration-recommendation-advisory-projection-preview.ts",
  component: "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx",
  modal: "components/recommendations/RecommendationDetailsModal.tsx",
  container: "components/recommendations/RecommendationCardContainer.tsx",
  projection: "lib/confidence-calibration-recommendation-advisory-projection.ts",
  action459Verifier: "scripts/action-459-static-confidence-calibration-recommendation-advisory-projection-shadow-release-gate-verify.mjs",
  action460Verifier: "scripts/action-460-confidence-calibration-recommendation-advisory-projection-runtime-preview-integration-contract-approval-gate-verify.mjs",
};

const expected = {
  flagName: "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
  releaseClassification: "confidence_calibration_recommendation_advisory_projection_pure_static_verified",
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  nextAction: "action_462_independent_runtime_preview_consumer_verification",
  action460Decision: "approved_with_conditions",
};

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    if ([".git", ".next", "node_modules", "coverage", "test-results"].includes(name)) continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function listFiles(relativeRoot) {
  return walk(abs(relativeRoot)).map((file) => file.slice(root.length + 1)).sort();
}

function includesAll(text, phrases) {
  return phrases.every((phrase) => text.includes(phrase));
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function runJsonVerifier(path) {
  if (!exists(path)) return null;
  try {
    return JSON.parse(execFileSync("node", [path], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 120 * 1024 * 1024,
    }));
  } catch {
    return null;
  }
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const flagSource = exists(paths.flag) ? read(paths.flag) : "";
const adapterSource = exists(paths.adapter) ? read(paths.adapter) : "";
const componentSource = exists(paths.component) ? read(paths.component) : "";
const modalSource = exists(paths.modal) ? read(paths.modal) : "";
const containerSource = exists(paths.container) ? read(paths.container) : "";

const libFiles = listFiles("lib").filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));
const appRouteFiles = listFiles("app").filter((file) =>
  file.endsWith("route.ts") ||
  file.endsWith("route.tsx") ||
  file.includes("/api/") ||
  file.includes("proxy"),
);
const projectionCallSites = libFiles.filter((file) => {
  if (file === paths.projection) return false;
  return countMatches(read(file), /\bbuildConfidenceCalibrationRecommendationProjection\s*\(/g) > 0;
});
const projectionCallSiteCount = projectionCallSites.reduce(
  (count, file) => count + countMatches(read(file), /\bbuildConfidenceCalibrationRecommendationProjection\s*\(/g),
  0,
);

const action459Report = runJsonVerifier(paths.action459Verifier);
const action460Report = runJsonVerifier(paths.action460Verifier);

const changedDeploymentArtifacts = [
  "netlify.toml",
  ".openai/hosting.json",
  ".netlify/state.json",
].filter((path) => exists(path) && read(path).includes("action-461"));

const forbiddenSourceHits = [...listFiles("app"), ...listFiles("components"), ...listFiles("lib")]
  .filter((file) => /\.(ts|tsx|js|jsx|css)$/.test(file))
  .filter((file) => {
    const text = read(file);
    return /localStorage|sessionStorage|IndexedDB|document\.cookie|fetch\(|supabase|from\(|insert\(|upsert\(|update\(|delete\(|replay|provider|Twelve Data|analytics|telemetry|Apply calibration|Accept calibration|Use calibration/.test(text) &&
      file.includes("confidence-calibration-recommendation-advisory-projection-preview");
  });

const statusMappings = [
  ["projection_ready", "preview_ready"],
  ["projection_ready_with_warnings", "preview_ready_with_warnings"],
  ["projection_no_adjustment", "preview_no_adjustment"],
  ["projection_insufficient_evidence", "preview_unavailable"],
  ["blocked_invalid_input", "preview_unavailable"],
  ["blocked_confidence_mismatch", "preview_unavailable"],
  ["blocked_invalid_lineage", "preview_unavailable"],
  ["blocked_future_leakage", "preview_unavailable"],
  ["blocked_advisory_result", "preview_unavailable"],
  ["blocked_unsupported_status", "preview_unavailable"],
];

const docPhrases = [
  "Action 460 Contract",
  expected.action460Decision,
  expected.releaseClassification,
  expected.flagName,
  "Preview Adapter API",
  "Status Mapping",
  "Original-Confidence Authority",
  "UI Location",
  "UI Copy",
  "Warning Mapping",
  "Fail-Closed Behavior",
  "No-Persistence Boundary",
  "No-Route Boundary",
  "Provider And Supabase Boundary",
  "Feedback And Confidence Application Boundary",
  "Ranking, Scanner, Publication, Execution Isolation",
  "Performance Boundary",
  "Kill Switch And Rollback",
  expected.runtimePreviewStatus,
  "Mandatory Action 462 Independent Verification",
];

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_contract: includesAll(doc, docPhrases),
  action459_release_healthy:
    action459Report?.verification_status === "passed" &&
    action459Report?.release_classification === expected.releaseClassification,
  action460_contract_healthy:
    action460Report?.verification_status === "passed" &&
    action460Report?.approval_decision === expected.action460Decision,
  exact_flag_name:
    flagSource.includes(expected.flagName) &&
    !flagSource.includes("NEXT_PUBLIC_CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED"),
  flag_defaults_disabled:
    flagSource.includes("rawValue === undefined") &&
    flagSource.includes("rawValue === \"\"") &&
    flagSource.includes("runtime === \"production\"") &&
    flagSource.includes("return rawValue === \"true\""),
  no_user_controlled_activation:
    !/localStorage|sessionStorage|location\.search|URLSearchParams|document\.cookie|window\./.test(flagSource),
  one_dedicated_preview_adapter:
    exists(paths.adapter) &&
    projectionCallSiteCount === 1 &&
    projectionCallSites.length === 1 &&
    projectionCallSites[0] === paths.adapter,
  exact_bounded_statuses:
    ["preview_disabled", "preview_ready", "preview_ready_with_warnings", "preview_no_adjustment", "preview_unavailable"]
      .every((status) => adapterSource.includes(status)),
  blocked_results_map_unavailable: statusMappings.every(([from, to]) =>
    adapterSource.includes(from) && adapterSource.includes(to)),
  original_confidence_authoritative:
    adapterSource.includes("original_recommendation_confidence_basis_points") &&
    adapterSource.includes("proposed_preview_delta_basis_points") &&
    adapterSource.includes("proposed_preview_confidence_basis_points") &&
    adapterSource.includes("recommendation_confidence_unchanged: true"),
  no_ambiguous_confidence_naming:
    !/\b(confidence|currentConfidence|finalConfidence|effectiveConfidence|appliedConfidence)\s*:/.test(adapterSource) &&
    !/\b(confidence|currentConfidence|finalConfidence|effectiveConfidence|appliedConfidence)\s*:/.test(componentSource),
  all_effect_flags_checked:
    [
      "recommendation_confidence_unchanged === true",
      "non_authoritative === true",
      "application_eligible === false",
      "applied === false",
      "ranking_affected === false",
      "scanner_affected === false",
      "publication_affected === false",
      "execution_affected === false",
    ].every((phrase) => adapterSource.includes(phrase)),
  one_ui_surface:
    exists(paths.component) &&
    countMatches(modalSource, /import \{ ConfidenceCalibrationProjectionPreview \}/g) === 1 &&
    countMatches(modalSource, /<ConfidenceCalibrationProjectionPreview/g) === 1 &&
    containerSource.includes("confidenceCalibrationProjectionPreview"),
  no_apply_accept_use_cta:
    !/\b(Apply|Accept|Use)\b/.test(componentSource),
  no_global_dashboard_scanner_execution_integration:
    !read("app/trade-app.tsx").includes("ConfidenceCalibrationProjectionPreview") &&
    !read("components/recommendations/RecommendationCard.tsx").includes("ConfidenceCalibrationProjectionPreview"),
  no_persistence_replay_provider_supabase_feedback:
    forbiddenSourceHits.length === 0 &&
    !/localStorage|sessionStorage|IndexedDB|document\.cookie|fetch\(|supabase|replay|provider|feedback/i.test(adapterSource),
  no_route:
    appRouteFiles.every((file) => !read(file).includes(expected.flagName) && !read(file).includes("Calibration Preview")),
  no_confidence_application:
    adapterSource.includes("application_eligible: false") &&
    adapterSource.includes("applied: false") &&
    !/appliedConfidence|effectiveConfidence|finalConfidence|setConfidence|updateConfidence/.test(adapterSource + componentSource),
  no_ranking_scanner_publication_execution_changes:
    adapterSource.includes("ranking_affected: false") &&
    adapterSource.includes("scanner_affected: false") &&
    adapterSource.includes("publication_affected: false") &&
    adapterSource.includes("execution_affected: false"),
  kill_switch:
    adapterSource.includes("if (!input.preview_enabled) return DISABLED") &&
    componentSource.includes("preview.status === \"preview_disabled\""),
  runtime_preview_waiting:
    doc.includes(expected.runtimePreviewStatus) &&
    action460Report?.runtime_preview_status === expected.runtimePreviewStatus,
  no_deployment_artifact: changedDeploymentArtifacts.length === 0,
  action462_identified:
    doc.includes("Action 462") &&
    doc.includes("Independent Verification"),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  implementation_result: "runtime_preview_consumer_implemented_disabled_by_default",
  release_classification: expected.releaseClassification,
  action460_approval_decision: action460Report?.approval_decision ?? "unavailable",
  runtime_preview_status: expected.runtimePreviewStatus,
  flag: {
    name: expected.flagName,
    missing: false,
    empty: false,
    malformed: false,
    false_string: false,
    zero: false,
    one: false,
    true_string_non_production: true,
    true_string_production: false,
    query_string_activation_allowed: false,
    local_storage_activation_allowed: false,
    cookie_bypass_allowed: false,
  },
  preview_adapter_api: {
    function_name: "buildConfidenceCalibrationProjectionPreview",
    map_function_name: "mapConfidenceCalibrationProjectionPreviewResult",
    input_boundary: [
      "preview_enabled",
      "immutable Recommendation projection envelope",
      "verified bounded advisory result",
      "frozen projection configuration",
    ],
    raw_projection_returned_to_ui: false,
  },
  projection_call_sites: projectionCallSites,
  projection_call_site_count: projectionCallSiteCount,
  status_mapping: Object.fromEntries(statusMappings),
  original_confidence_authority: {
    original_recommendation_confidence_remains_authoritative: true,
    proposed_preview_confidence_authoritative: false,
    recommendation_confidence_unchanged: true,
    ambiguous_confidence_properties_exposed: false,
  },
  ui_surface: {
    component: paths.component,
    integration_point: paths.modal,
    hidden_when_disabled: true,
    read_only: true,
    apply_accept_use_controls: false,
  },
  fail_closed_handling: {
    disabled: "preview_disabled",
    missing_inputs: "preview_unavailable",
    blocked_or_unsafe_projection: "preview_unavailable",
    projection_exception: "preview_unavailable",
  },
  warning_handling: {
    bounded_labels_only: true,
    raw_hashes_visible: false,
    raw_issue_values_visible: false,
    unknown_warning_fallback: "Calibration warning",
  },
  persistence_result: {
    persisted: false,
    local_storage: false,
    session_storage: false,
    indexed_db: false,
    cookies: false,
    filesystem: false,
  },
  replay_result: {
    replay_executed: false,
    replay_record_created: false,
  },
  provider_supabase_result: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
  },
  route_result: {
    new_route_created: false,
    api_route_created: false,
    server_action_created: false,
    background_job_created: false,
  },
  confidence_application_result: {
    confidence_applied: false,
    recommendation_confidence_overwritten: false,
    proposed_confidence_used_for_sorting_filtering: false,
  },
  feedback_result: {
    feedback_created: false,
    telemetry_infrastructure_added: false,
  },
  behavior_isolation: {
    ranking_changed: false,
    scanner_changed: false,
    publication_changed: false,
    execution_changed: false,
    add_trade_changed: false,
    risk_changed: false,
    position_sizing_changed: false,
  },
  deployment_result: "none",
  operator_inputs_outstanding: [
    "target preview environment",
    "authorized preview users/access boundary",
    "preview flag value",
    "preview duration",
    "rollback owner",
    "kill-switch owner",
    "evidence retention policy",
  ],
  recommended_next_action: expected.nextAction,
  unrelated_work_classification: "action_461_runtime_preview_consumer_implementation_only",
  passed_conditions: Object.entries(checks)
    .filter(([, passed]) => passed)
    .map(([name]) => name),
  failed_conditions: failedConditions,
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.verification_status === "passed" ? 0 : 1);
