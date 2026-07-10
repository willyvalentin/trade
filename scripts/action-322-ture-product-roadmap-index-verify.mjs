#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const roadmapPath = "docs/action-322-ture-product-roadmap-index.md";

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

const roadmapIndexFound = exists(roadmapPath);
const content = roadmapIndexFound ? read(roadmapPath) : "";

const productNorthStarFound = includesAll(content, [
  "Ture is a learning recommendation engine for US daytrading",
  "simple on the surface, hyperintelligent under the hood",
  "limited number of",
  "learn from every recommendation",
  "Execution is secondary",
  "always confirms final KÖP/SÄLJ manually",
]);
const recommendationEngineTrackFound = includesAll(content, [
  "Recommendation Engine",
  "find candidates",
  "score setup quality",
  "define entry/stop/target",
  "set confidence",
  "rank and filter to limited recommendations",
]);
const learningBackfillReplayTrackFound = includesAll(content, [
  "Learning / Backfill / Replay",
  "learn from recommendations",
  "replay historical outcomes",
  "evaluate target/stop-first",
  "calibrate confidence",
  "Actions 309-320 created static replay-with-signal-package foundation",
]);
const productUxTrackFound = includesAll(content, [
  "Product UX",
  "keep Ture simple and actionable",
  "show recommendation cards",
  "History/Statistics",
]);
const riskDisciplineTrackFound = includesAll(content, [
  "Risk / Discipline / Trade Management",
  "risk per trade",
  "position sizing",
  "EOD safety",
  "plan-vs-actual",
]);
const executionAgentTrackFound = includesAll(content, [
  "Execution Agent",
  "semi-automatic Avanza handoff",
  "prepare KÖP/SÄLJ order flow",
  "user confirms final manual KÖP/SÄLJ",
  "no autonomous trading bot behavior",
]);
const roadmapTracksFound =
  recommendationEngineTrackFound &&
  learningBackfillReplayTrackFound &&
  productUxTrackFound &&
  riskDisciplineTrackFound &&
  executionAgentTrackFound;
const recommendedNearTermOrderFound = includesAll(content, [
  "Action 323: Recommendation Engine Readiness Map",
  "Action 324: Learning/Backfill Runtime Rollout Plan",
  "Action 325: Product UX Surface Map",
  "Action 326: Execution Agent Boundary Refresh",
  "Action 327: Risk / Discipline / Trade Management Readiness Map",
  "Recommendation quality is the product core",
]);
const whatNotToDoYetFound = includesAll(content, [
  "do not add new app/api replay route",
  "do not change proxy/middleware",
  "do not deploy static branch package",
  "do not push main",
  "do not integrate replay into scanner/ranking",
  "do not persist synthetic outcomes",
  "do not work on autonomous execution",
]);
const saysNotDeployReadiness = content.includes(
  "This is roadmap planning, not deploy readiness",
);
const blocksDeployMainRuntimeProxy = includesAll(content, [
  "does not authorize",
  "production deploy",
  "main push",
  "runtime route",
  "proxy or middleware",
]);
const action323Next = content.includes(
  "The next product-focused action should be Action 323: Recommendation Engine",
);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  roadmapIndexFound &&
  content.includes("roadmap_index_status: product_roadmap_index_ready") &&
  productNorthStarFound &&
  roadmapTracksFound &&
  recommendedNearTermOrderFound &&
  whatNotToDoYetFound &&
  saysNotDeployReadiness &&
  blocksDeployMainRuntimeProxy &&
  action323Next &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  roadmap_index_found: roadmapIndexFound,
  product_north_star_found: productNorthStarFound,
  roadmap_tracks_found: roadmapTracksFound,
  recommendation_engine_track_found: recommendationEngineTrackFound,
  learning_backfill_replay_track_found: learningBackfillReplayTrackFound,
  product_ux_track_found: productUxTrackFound,
  risk_discipline_track_found: riskDisciplineTrackFound,
  execution_agent_track_found: executionAgentTrackFound,
  recommended_near_term_order_found: recommendedNearTermOrderFound,
  what_not_to_do_yet_found: whatNotToDoYetFound,
  action_323_next: action323Next,
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
    ? "proceed_to_action_323_recommendation_engine_readiness_map"
    : "complete_product_roadmap_index_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
