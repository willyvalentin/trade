#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-345-first-tiny-provider-capacity-experiment-plan.md";

const futureExperimentScope = [
  "provider: Twelve Data or current configured market data provider",
  "symbol: one highly liquid ticker, preferably AAPL or SPY",
  "interval: 5min",
  "trading day: one known trading day",
  "adjusted: explicitly declared",
  "output: inspect response only",
  "writes: none",
  "replay: none",
  "scanner/ranking: none",
  "route: none unless separately approved by runtime ping checklist",
  "execution context: local/dev only first",
];

const metricsToMeasure = [
  "request_started",
  "request_completed",
  "request_duration_ms",
  "provider_status_code",
  "provider_error_code",
  "rate_limit_headers_available",
  "response_size_bytes",
  "candle_rows_returned",
  "first_candle_timestamp",
  "last_candle_timestamp",
  "missing_candle_count",
  "malformed_rows_count",
  "adjusted_or_unadjusted",
  "provider_time_zone_behavior",
  "retry_required",
  "failure_mode",
  "estimated_requests_per_symbol_per_day",
  "estimated_requests_for_backfill_window",
];

const capacityCalculations = [
  "candles_per_day_by_interval",
  "requests_per_symbol",
  "requests_per_universe_tier",
  "requests_per_backfill_window",
  "estimated_payload_size",
  "estimated_storage_size_normalized",
  "estimated_raw_response_size",
  "estimated_daily_collection_cost",
  "estimated_backfill_cost",
];

const noWriteResultShape = [
  "experiment_status",
  "provider_call_executed",
  "provider_call_attempted",
  "supabase_write_executed: false",
  "candles_persisted: false",
  "raw_response_persisted: false",
  "fetch_run_persisted: false",
  "replay_executed: false",
  "scanner_behavior_changed: false",
  "live_ranking_changed: false",
  "recommendation_rows_mutated: false",
  "provider",
  "symbol",
  "interval",
  "trading_day",
  "row_count",
  "payload_size_bytes",
  "duration_ms",
  "warnings",
  "blockers",
  "capacity_estimates",
];

const approvalGates = [
  "TURE_FIRST_TINY_PROVIDER_CAPACITY_EXPERIMENT_APPROVED=false",
  "TURE_PROVIDER_CALLS_APPROVED=false",
  "TURE_SUPABASE_WRITE_APPROVED=false",
  "TURE_RAW_RESPONSE_PERSISTENCE_APPROVED=false",
  "TURE_CANDLE_PERSISTENCE_APPROVED=false",
  "TURE_REPLAY_EXECUTION_APPROVED=false",
  "TURE_SCANNER_RANKING_MUTATION_APPROVED=false",
];

const safetyConstraints = [
  "no production route required",
  "no Supabase writes",
  "no raw response persistence",
  "no candle persistence",
  "no replay",
  "no scanner/ranking mutation",
  "no recommendation mutation",
  "no broad universe",
  "no multi-day backfill",
  "no news API call",
  "no deploy",
  "no main push",
];

const successCriteria = [
  "one request scope clearly bounded",
  "response shape understood",
  "row count understood",
  "latency understood",
  "payload size understood",
  "failure/rate-limit behavior captured if present",
  "no writes happened",
  "no replay happened",
  "no recommendation behavior changed",
  "capacity estimate produced",
];

const failureCriteria = [
  "provider request unavailable",
  "ambiguous response shape",
  "missing required candle fields",
  "unexpected timezone behavior",
  "rate limit encountered",
  "payload too large",
  "response inconsistent",
  "any write attempted",
  "any replay attempted",
  "any scanner/ranking mutation attempted",
];

const relationToExistingWork = [
  "historical candle persistence/readback foundation",
  "fetch-run audit work",
  "Action 339 cost/capacity plan",
  "Action 333 existing coverage audit",
  "Action 338/344 runtime safety plans",
  "extend existing provider/audit patterns where valid",
  "Do not duplicate existing historical candle storage or fetch-run audit concepts",
];

const blockedWork = [
  "no provider experiment implementation yet",
  "no provider calls yet",
  "no Supabase writes yet",
  "no runtime route yet",
  "no persistence yet",
  "no broad backfill yet",
  "no replay execution yet",
  "no scanner/ranking mutation yet",
  "no deploy",
  "no main push",
];

const nextActions = [
  "Action 346: Existing Schema Compatibility Matrix",
  "Action 347: Learning Dataset Static Fixture Implementation Plan",
  "Action 348: Intelligence Context Static Fixture Implementation Plan",
  "Action 349: Pattern Insight Static Fixture Spec",
  "Action 350: Runtime Ping-Only Route Approval Gate",
  "Action 351: First Tiny Provider Capacity Experiment Approval Gate",
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

const experimentPlanFound = exists(docPath);
const content = experimentPlanFound ? read(docPath) : "";

const planStatusFound = includesAll(content, [
  "first_tiny_provider_capacity_experiment_status: experiment_plan_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "provider capacity experiment planning only",
  "not provider implementation",
  "runtime implementation",
  "Supabase persistence",
  "replay execution",
  "scanner mutation",
  "ranking mutation",
  "deploy readiness",
  "main-push authorization",
]);
const futureExperimentScopeFound = futureExperimentScope.every((item) =>
  content.includes(item),
);
const metricsToMeasureFound = metricsToMeasure.every((item) => content.includes(item));
const capacityCalculationsFound = capacityCalculations.every((item) =>
  content.includes(item),
);
const noWriteResultShapeFound = noWriteResultShape.every((item) => content.includes(item));
const approvalGatesFound = approvalGates.every((item) => content.includes(item));
const safetyConstraintsFound = safetyConstraints.every((item) => content.includes(item));
const successCriteriaFound = successCriteria.every((item) => content.includes(item));
const failureCriteriaFound = failureCriteria.every((item) => content.includes(item));
const relationToExistingWorkFound = relationToExistingWork.every((item) =>
  content.includes(item),
);
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize provider experiment implementation",
  "provider calls",
  "news API calls",
  "Supabase remote reads",
  "Supabase reads",
  "Supabase writes",
  "raw response persistence",
  "candle persistence",
  "replay execution",
  "scanner mutations",
  "ranking mutations",
  "deploys",
  "main pushes",
  "runtime route changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  experimentPlanFound &&
  planStatusFound &&
  futureExperimentScopeFound &&
  metricsToMeasureFound &&
  capacityCalculationsFound &&
  noWriteResultShapeFound &&
  approvalGatesFound &&
  safetyConstraintsFound &&
  successCriteriaFound &&
  failureCriteriaFound &&
  relationToExistingWorkFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  experiment_plan_found: experimentPlanFound,
  plan_status_found: planStatusFound,
  future_experiment_scope_found: futureExperimentScopeFound,
  metrics_to_measure_found: metricsToMeasureFound,
  capacity_calculations_found: capacityCalculationsFound,
  no_write_result_shape_found: noWriteResultShapeFound,
  approval_gates_found: approvalGatesFound,
  safety_constraints_found: safetyConstraintsFound,
  success_criteria_found: successCriteriaFound,
  failure_criteria_found: failureCriteriaFound,
  relation_to_existing_work_found: relationToExistingWorkFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  deploy_readiness: false,
  experiment_implementation_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_write_allowed: false,
  raw_response_persistence_allowed: false,
  candle_persistence_allowed: false,
  replay_execution_allowed: false,
  scanner_ranking_mutation_allowed: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    news_api_call_executed: false,
    news_api_call_attempted: false,
    supabase_remote_read_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    raw_response_persisted: false,
    candles_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    learning_dataset_persisted: false,
    context_snapshots_persisted: false,
    pattern_insights_persisted: false,
    route_implemented: false,
    app_api_route_added: false,
    app_page_route_added: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
    confidence_thresholds_mutated: false,
    visible_recommendations_changed: false,
    outcome_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  recommended_next_step: "action_346_existing_schema_compatibility_matrix",
};

console.log(JSON.stringify(result, null, 2));

if (!passed) {
  process.exitCode = 1;
}
