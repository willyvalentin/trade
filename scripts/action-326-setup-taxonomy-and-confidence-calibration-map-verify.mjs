#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const mapPath = "docs/action-326-setup-taxonomy-and-confidence-calibration-map.md";

const setupFamilies = [
  "momentum_continuation",
  "vwap_reclaim",
  "opening_drive",
  "pullback_to_support",
  "breakout_continuation",
  "reversal_from_exhaustion",
  "range_break",
  "news_or_catalyst_momentum",
];

const confidenceComponents = [
  "data_quality_confidence",
  "setup_quality_confidence",
  "momentum_confirmation",
  "volume_confirmation",
  "vwap_context_confirmation",
  "liquidity_confidence",
  "trade_geometry_quality",
  "risk_reward_quality",
  "market_session_fit",
  "historical_setup_performance",
  "shadow_outcome_feedback",
];

const calibrationMetrics = [
  "target_hit_rate_by_setup",
  "stop_hit_rate_by_setup",
  "no_entry_rate_by_setup",
  "open_at_window_end_rate_by_setup",
  "average_gross_r_multiple_by_setup",
  "confidence_bucket_hit_rate",
  "confidence_bucket_expectancy",
  "confidence_bucket_overconfidence_gap",
  "confidence_bucket_underconfidence_gap",
  "setup_failure_modes",
  "window_specific_performance",
];

const forbiddenRuntimePaths = [
  "app/api/hb307c",
  "app/api/ping307h",
  "app/api/route-publication-diagnostic",
  "app/route-publication-probe",
  "app/public-probe-307g",
  "app/ping307h",
  "public/ping307i.txt",
  "public/ping307i.json",
  "public/ping307j.html",
  "public/action-307l-runtime-boundary-status.json",
];

const markerRootPaths = ["app", "public"];
const markerFilePaths = ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"];

function exists(relativePath) {
  return existsSync(join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function collectFiles(relativePath) {
  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) return [];
  const stat = statSync(absolutePath);
  if (stat.isFile()) return [relativePath];
  if (!stat.isDirectory()) return [];

  return readdirSync(absolutePath)
    .flatMap((entry) => collectFiles(join(relativePath, entry)))
    .sort();
}

function markerFound(marker) {
  const files = [
    ...markerFilePaths,
    ...markerRootPaths.flatMap((relativePath) => collectFiles(relativePath)),
  ];

  return files.some((relativePath) => {
    if (!exists(relativePath)) return false;
    return read(relativePath).includes(marker);
  });
}

function includesAll(content, phrases) {
  return phrases.every((phrase) => content.includes(phrase));
}

const setupTaxonomyMapFound = exists(mapPath);
const content = setupTaxonomyMapFound ? read(mapPath) : "";

const mapStatusFound = content.includes(
  "setup_taxonomy_confidence_calibration_status: map_ready",
);
const roadmapPlanningOnlyFound = includesAll(content, [
  "setup/confidence roadmap planning only",
  "not runtime change",
  "deploy readiness",
  "scanner mutation",
  "ranking mutation",
  "confidence threshold mutation",
]);
const purposeFound = includesAll(content, [
  "clear setup taxonomy",
  "understandable, comparable, and learnable",
  "evidence strength and expected outcome reliability",
  "target/stop-first outcomes",
  "no-entry outcomes",
  "open-at-window-end outcomes",
  "R-multiple distributions",
  "fewer, clearer, higher-quality recommendations",
]);
const setupFamiliesFound = setupFamilies.every((family) => content.includes(family));
const setupFamilyDetailsFound = includesAll(content, [
  "description:",
  "required evidence:",
  "helpful confirming evidence:",
  "common failure mode:",
  "confidence sensitivity:",
  "learning metrics to track later:",
]);
const confidenceModelFound =
  content.includes("Confidence Model") &&
  confidenceComponents.every((component) => content.includes(component)) &&
  content.includes(
    "Current confidence should be treated as uncalibrated or partially calibrated until historical outcome evidence proves it",
  ) &&
  content.includes("Confidence labels should map to user-facing clarity but remain evidence-backed");
const confidenceLabelsFound = includesAll(content, [
  "Low",
  "Medium",
  "High",
  "Very High / Strong",
  "what it should mean to the user:",
  "evidence required:",
  "what should prevent it from being assigned:",
  "historical calibration:",
]);
const calibrationLoopFound = includesAll(content, [
  "recommendation generated",
  "snapshot saved",
  "shadow outcome tracked",
  "replay/backfill evaluates outcome",
  "outcome categorized",
  "R multiple calculated",
  "setup family performance updated",
  "confidence bucket performance reviewed",
  "future confidence/ranking adjusted only after safe rollout",
]);
const calibrationMetricsFound = calibrationMetrics.every((metric) =>
  content.includes(metric),
);
const blockedWorkFound = includesAll(content, [
  "no confidence threshold changes yet",
  "no scanner/ranking mutation yet",
  "no automatic calibration update yet",
  "no Supabase synthetic outcome persistence yet",
  "no runtime replay route yet",
  "no provider refetch path yet",
  "no deploy",
  "no main push",
]);
const nextActionsFound = includesAll(content, [
  "Action 327: Learning/Backfill Runtime Rollout Plan",
  "Action 328: Product UX Surface Map",
  "Action 329: Recommendation Engine Gate Test Plan",
  "Action 330: Confidence Calibration Static Metric Spec",
]);
const blocksDeployMainRuntimeProxyScannerRankingConfidence = includesAll(content, [
  "does not authorize",
  "production deploy",
  "main push",
  "runtime route",
  "proxy or middleware",
  "scanner changes",
  "ranking changes",
  "confidence threshold changes",
]);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  setupTaxonomyMapFound &&
  mapStatusFound &&
  roadmapPlanningOnlyFound &&
  purposeFound &&
  setupFamiliesFound &&
  setupFamilyDetailsFound &&
  confidenceModelFound &&
  confidenceLabelsFound &&
  calibrationLoopFound &&
  calibrationMetricsFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksDeployMainRuntimeProxyScannerRankingConfidence &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  setup_taxonomy_map_found: setupTaxonomyMapFound,
  map_status_found: mapStatusFound,
  roadmap_planning_only_found: roadmapPlanningOnlyFound,
  purpose_found: purposeFound,
  setup_families_found: setupFamiliesFound,
  setup_families_present: setupFamilies.filter((family) => content.includes(family)),
  setup_families_missing: setupFamilies.filter((family) => !content.includes(family)),
  setup_family_details_found: setupFamilyDetailsFound,
  confidence_model_found: confidenceModelFound,
  confidence_components_present: confidenceComponents.filter((component) =>
    content.includes(component),
  ),
  confidence_components_missing: confidenceComponents.filter(
    (component) => !content.includes(component),
  ),
  confidence_labels_found: confidenceLabelsFound,
  calibration_loop_found: calibrationLoopFound,
  calibration_metrics_found: calibrationMetricsFound,
  calibration_metrics_present: calibrationMetrics.filter((metric) =>
    content.includes(metric),
  ),
  calibration_metrics_missing: calibrationMetrics.filter(
    (metric) => !content.includes(metric),
  ),
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  proxy_changes_allowed: false,
  scanner_ranking_mutation_allowed: false,
  confidence_threshold_mutation_allowed: false,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendation_rows_mutated: false,
    confidence_thresholds_mutated: false,
    learning_acceleration_changed: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  recommended_next_step: passed
    ? "proceed_to_action_327_learning_backfill_runtime_rollout_plan"
    : "complete_setup_taxonomy_and_confidence_calibration_map_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
