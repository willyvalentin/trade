#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const readinessPath = "docs/action-323-recommendation-engine-readiness-map.md";

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

const recommendationEngineReadinessMapFound = exists(readinessPath);
const content = recommendationEngineReadinessMapFound ? read(readinessPath) : "";

const productCoreStatementFound = includesAll(content, [
  "The recommendation engine is the product core",
  "find, score, rank, and explain",
  "limited number of day trade recommendations",
  "minimize user analysis",
  "trading window",
  "quality over quantity",
  "learn from every recommendation",
]);
const coreResponsibilitiesFound = includesAll(content, [
  "Market Scanning",
  "Candidate Filtering",
  "Setup Quality Assessment",
  "Trade Geometry",
  "Confidence Scoring",
  "Ranking And Selection",
  "Recommendation Explanation",
  "Snapshot And Learning Integration",
]);
const qualityGatesFound = includesAll(content, [
  "data_freshness_gate",
  "market_session_gate",
  "liquidity_gate",
  "spread_or_volatility_gate",
  "risk_reward_gate",
  "trade_geometry_gate",
  "confidence_gate",
  "duplicate_candidate_gate",
  "recommendation_limit_gate",
  "snapshot_persistence_gate",
  "learning_feedback_gate",
]);
const readinessLevelsFound = includesAll(content, [
  "R0: undocumented / unknown",
  "R1: existing but unaudited",
  "R2: documented and test-covered",
  "R3: validated with historical outcomes",
  "R4: calibrated and trusted for product use",
  "R5: production-grade recommendation engine",
  "The recommendation engine is not yet R5",
]);
const nextActionsFound = includesAll(content, [
  "Action 324: Recommendation Engine Code Surface Inventory",
  "Action 325: Recommendation Quality Gates Audit",
  "Action 326: Setup Taxonomy and Confidence Calibration Map",
  "Action 327: Learning/Backfill Runtime Rollout Plan",
  "Action 328: Product UX Surface Map",
]);
const whatNotToDoYetFound = includesAll(content, [
  "do not mutate scanner/ranking from static replay yet",
  "do not add runtime replay routes",
  "do not persist synthetic outcomes",
  "do not deploy branch package",
  "do not push main",
  "do not prioritize execution agent over recommendation quality",
]);
const saysNotDeployReadiness = includesAll(content, [
  "not runtime change",
  "deploy readiness",
  "scanner/ranking mutation",
]);
const blocksDeployMainRuntimeProxy = includesAll(content, [
  "does not authorize",
  "production deploy",
  "main push",
  "runtime route",
  "proxy or middleware",
]);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  recommendationEngineReadinessMapFound &&
  content.includes("recommendation_engine_readiness_status: roadmap_ready") &&
  productCoreStatementFound &&
  coreResponsibilitiesFound &&
  qualityGatesFound &&
  readinessLevelsFound &&
  nextActionsFound &&
  whatNotToDoYetFound &&
  saysNotDeployReadiness &&
  blocksDeployMainRuntimeProxy &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  recommendation_engine_readiness_map_found: recommendationEngineReadinessMapFound,
  product_core_statement_found: productCoreStatementFound,
  core_responsibilities_found: coreResponsibilitiesFound,
  quality_gates_found: qualityGatesFound,
  readiness_levels_found: readinessLevelsFound,
  next_actions_found: nextActionsFound,
  what_not_to_do_yet_found: whatNotToDoYetFound,
  says_not_deploy_readiness: saysNotDeployReadiness,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  proxy_changes_allowed: false,
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
    learning_acceleration_changed: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  recommended_next_step: passed
    ? "proceed_to_action_324_recommendation_engine_code_surface_inventory"
    : "complete_recommendation_engine_readiness_map_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
