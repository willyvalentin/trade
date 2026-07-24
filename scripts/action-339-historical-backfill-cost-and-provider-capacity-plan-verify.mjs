#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-339-historical-backfill-cost-and-provider-capacity-plan.md";

const providerCapacityDimensions = [
  "request_limit_per_minute",
  "request_limit_per_day",
  "symbols_per_request",
  "candles_per_request",
  "supported_intervals",
  "historical_depth",
  "adjusted_vs_unadjusted_support",
  "intraday_delay_or_realtime_status",
  "response_size",
  "retry_policy",
  "failure_rate_tracking",
  "cost_per_plan",
  "overage_risk",
  "provider_terms_constraints",
];

const dataVolumeDimensions = [
  "symbol_count",
  "trading_days",
  "interval",
  "candles_per_day",
  "rows_per_symbol",
  "total_candle_rows",
  "raw_response_storage_size",
  "normalized_storage_size",
  "index/context_symbol_multiplier",
  "sector/peer_multiplier",
  "news/catalyst_record_count",
  "audit/readback_metadata_size",
];

const universeTiers = [
  "Tier 0: already recommended tickers",
  "Tier 1: active scan universe",
  "Tier 2: index context symbols SPY/QQQ/IWM",
  "Tier 3: sector ETFs",
  "Tier 4: peer groups for recommended tickers",
  "Tier 5: high-liquidity US large/mid caps",
  "Tier 6: broader universe later",
  "purpose",
  "expected value",
  "backfill priority",
  "cost/risk",
  "recommended start scope",
];

const backfillWindows = [
  "last 5 trading days",
  "last 20 trading days",
  "last 60 trading days",
  "last 120 trading days",
  "last 252 trading days",
  "multi-year later",
  "learning value",
  "provider request risk",
  "storage risk",
  "recommended universe tier",
  "suitable for first implementation",
];

const dailyCollectionCadence = [
  "premarket context collection",
  "scan-window candle collection",
  "recommendation snapshot persistence",
  "market regime snapshot",
  "sector/industry snapshot",
  "relative strength snapshot",
  "news/catalyst snapshot",
  "end-of-day outcome reconstruction",
  "daily data quality audit",
  "future planning only and not implementation",
];

const newsCatalystProviderPlanning = [
  "news provider may be separate from candle provider",
  "catalyst timestamp matters for anti-leakage",
  "headline summaries must be snapshot-time safe",
  "news volume/context may be useful",
  "provider cost/limits may be high",
  "start with catalyst presence/type before full NLP",
  "no news API calls yet",
];

const storageRetentionPlanning = [
  "normalized candle storage",
  "raw response retention policy",
  "audit/readback rows",
  "context snapshot storage",
  "news/catalyst storage",
  "outcome dataset storage",
  "retention tiers",
  "compression/aggregation considerations",
  "avoid duplicate storage of same candle/provider rows",
];

const firstSafeCapacityExperiment = [
  "one provider",
  "one symbol",
  "one interval",
  "one trading day",
  "no writes first",
  "then tiny write/readback only after approval",
  "no broad universe",
  "no news calls",
  "no scanner/ranking mutation",
  "rollback-ready",
];

const blockedWork = [
  "no provider calls yet",
  "no news API calls yet",
  "no Supabase writes yet",
  "no runtime routes yet",
  "no broad backfill jobs yet",
  "no scanner/ranking mutation yet",
  "no confidence threshold changes yet",
  "no deploy",
  "no main push",
];

const nextActions = [
  "Action 340: Snapshot Field Inventory Against Existing Schema",
  "Action 341: Learning Dataset Static Fixture Spec",
  "Action 342: Intelligence Context Static Fixture Spec",
  "Action 343: Pattern Insight Static Type Spec",
  "Action 344: Runtime Ping-Only Route Implementation Plan",
  "Action 345: First Tiny Provider Capacity Experiment Plan",
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

const costCapacityPlanFound = exists(docPath);
const content = costCapacityPlanFound ? read(docPath) : "";

const planStatusFound = includesAll(content, [
  "historical_backfill_cost_capacity_status: plan_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "cost/capacity planning only",
  "not provider integration",
  "news integration",
  "runtime implementation",
  "Supabase persistence",
  "scanner mutation",
  "ranking mutation",
  "deploy readiness",
  "main-push authorization",
]);
const providerCapacityDimensionsFound = providerCapacityDimensions.every((item) =>
  content.includes(item),
);
const dataVolumeDimensionsFound = dataVolumeDimensions.every((item) =>
  content.includes(item),
);
const universeTiersFound = universeTiers.every((item) => content.includes(item));
const backfillWindowsFound = backfillWindows.every((item) => content.includes(item));
const dailyCollectionCadenceFound = dailyCollectionCadence.every((item) =>
  content.includes(item),
);
const newsCatalystProviderPlanningFound = newsCatalystProviderPlanning.every((item) =>
  content.includes(item),
);
const storageRetentionPlanningFound = storageRetentionPlanning.every((item) =>
  content.includes(item),
);
const firstSafeCapacityExperimentFound = firstSafeCapacityExperiment.every((item) =>
  content.includes(item),
);
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((action) => content.includes(action));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize deploys",
  "main pushes",
  "runtime route changes",
  "provider calls",
  "news API calls",
  "Supabase reads",
  "Supabase writes",
  "broad backfill jobs",
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  costCapacityPlanFound &&
  planStatusFound &&
  providerCapacityDimensionsFound &&
  dataVolumeDimensionsFound &&
  universeTiersFound &&
  backfillWindowsFound &&
  dailyCollectionCadenceFound &&
  newsCatalystProviderPlanningFound &&
  storageRetentionPlanningFound &&
  firstSafeCapacityExperimentFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  cost_capacity_plan_found: costCapacityPlanFound,
  plan_status_found: planStatusFound,
  provider_capacity_dimensions_found: providerCapacityDimensionsFound,
  data_volume_dimensions_found: dataVolumeDimensionsFound,
  universe_tiers_found: universeTiersFound,
  backfill_windows_found: backfillWindowsFound,
  daily_collection_cadence_found: dailyCollectionCadenceFound,
  news_catalyst_provider_planning_found: newsCatalystProviderPlanningFound,
  storage_retention_planning_found: storageRetentionPlanningFound,
  first_safe_capacity_experiment_found: firstSafeCapacityExperimentFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_write_allowed: false,
  broad_backfill_allowed: false,
  scanner_ranking_mutation_allowed: false,
  confidence_threshold_mutation_allowed: false,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    news_api_call_executed: false,
    news_api_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    broad_backfill_executed: false,
    broad_backfill_job_added: false,
    pattern_persisted: false,
    context_persisted: false,
    dataset_persisted: false,
    snapshots_persisted: false,
    candles_persisted: false,
    news_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
    confidence_thresholds_mutated: false,
    proxy_changed: false,
    middleware_changed: false,
    netlify_config_changed: false,
    visible_recommendations_changed: false,
    outcome_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  recommended_next_step: passed
    ? "action_340_snapshot_field_inventory_against_existing_schema"
    : "fix_historical_backfill_cost_capacity_plan_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
