#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const inventoryPath = "docs/action-324-recommendation-engine-code-surface-inventory.md";

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

const inventoryDocFound = exists(inventoryPath);
const content = inventoryDocFound ? read(inventoryPath) : "";

const inventoryStatusFound = content.includes(
  "recommendation_engine_inventory_status: code_surface_inventory_ready",
);
const inventoryOnlyFound = includesAll(content, [
  "code surface inventory only",
  "not runtime change",
  "deploy readiness",
  "scanner mutation",
  "ranking mutation",
]);
const purposeFound = includesAll(content, [
  "locate existing recommendation-engine surfaces before changing them",
  "supports the Action 323 readiness map",
  "avoid changing scanner/ranking blindly",
]);
const marketDataCategoryFound = includesAll(content, [
  "Market Data / Provider Intake",
  "Twelve Data usage",
  "candle fetching",
  "data freshness",
  "provider fallback or mock paths",
]);
const scanOrchestrationCategoryFound = includesAll(content, [
  "Scan Orchestration",
  "scan windows",
  "scheduled scans",
  "generate more",
  "pre-market/watchlist",
]);
const candidateGenerationCategoryFound = includesAll(content, [
  "Candidate Generation",
  "ticker universe",
  "setup detection",
  "candidate construction",
  "rejected/experimental/valid/strong tiers",
]);
const validationQualityGatesCategoryFound = includesAll(content, [
  "Candidate Validation / Quality Gates",
  "stale data",
  "VWAP",
  "momentum",
  "volume trend",
  "liquidity",
  "risk/reward",
  "invalid geometry",
]);
const tradeGeometryCategoryFound = includesAll(content, [
  "Trade Geometry",
  "entry",
  "stop",
  "target",
  "risk multiple",
  "position sizing inputs",
]);
const confidenceScoringCategoryFound = includesAll(content, [
  "Confidence / Scoring",
  "numeric confidence",
  "labels",
  "setup score",
  "calibration readiness",
]);
const rankingSelectionCategoryFound = includesAll(content, [
  "Ranking / Selection",
  "sorting",
  "filtering",
  "recommendation limits",
  "window target",
]);
const persistenceSnapshotsCategoryFound = includesAll(content, [
  "Recommendation Persistence / Snapshots",
  "recommendation rows",
  "snapshots",
  "history",
  "statistics",
]);
const learningOutcomeCategoryFound = includesAll(content, [
  "Learning / Outcome Integration",
  "shadow outcomes",
  "replay/backfill",
  "confidence calibration",
  "static replay foundation from Actions 309-320",
]);
const uiSurfacesCategoryFound = includesAll(content, [
  "UI Surfaces That Display Recommendations",
  "recommendation cards",
  "dashboard",
  "modals/diagnostics",
  "History/Statistics",
]);
const inventoryCategoriesFound =
  marketDataCategoryFound &&
  scanOrchestrationCategoryFound &&
  candidateGenerationCategoryFound &&
  validationQualityGatesCategoryFound &&
  tradeGeometryCategoryFound &&
  confidenceScoringCategoryFound &&
  rankingSelectionCategoryFound &&
  persistenceSnapshotsCategoryFound &&
  learningOutcomeCategoryFound &&
  uiSurfacesCategoryFound;
const noTouchSurfacesFound = includesAll(content, [
  "app/api route additions are blocked",
  "proxy.ts is blocked",
  "middleware is blocked",
  "netlify.toml is blocked",
  "Supabase write changes are blocked",
  "provider calls are blocked",
  "scanner/ranking mutation is blocked in this action",
  "execution/broker paths are out of scope",
]);
const inventoryOutputFound = includesAll(content, [
  "| category | likely files/modules | current confidence | risk level | next audit action |",
  "known | likely | unknown",
]);
const nextActionsFound = includesAll(content, [
  "Action 325: Recommendation Quality Gates Audit",
  "Action 326: Setup Taxonomy and Confidence Calibration Map",
  "Action 327: Learning/Backfill Runtime Rollout Plan",
  "Action 328: Product UX Surface Map",
]);
const whatNotToDoYetFound = includesAll(content, [
  "do not modify scanner/ranking",
  "do not add API routes",
  "do not persist synthetic outcomes",
  "do not connect static replay output to ranking",
  "do not deploy",
  "do not push main",
  "do not resume execution-agent work before recommendation-engine audit is clearer",
]);
const blocksDeployMainRuntimeProxyScannerRanking = includesAll(content, [
  "does not authorize",
  "production deploy",
  "main push",
  "runtime route",
  "proxy or middleware",
  "scanner changes",
  "ranking changes",
]);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  inventoryDocFound &&
  inventoryStatusFound &&
  inventoryOnlyFound &&
  purposeFound &&
  inventoryCategoriesFound &&
  noTouchSurfacesFound &&
  inventoryOutputFound &&
  nextActionsFound &&
  whatNotToDoYetFound &&
  blocksDeployMainRuntimeProxyScannerRanking &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  inventory_doc_found: inventoryDocFound,
  inventory_status_found: inventoryStatusFound,
  inventory_only_found: inventoryOnlyFound,
  purpose_found: purposeFound,
  inventory_categories_found: inventoryCategoriesFound,
  market_data_category_found: marketDataCategoryFound,
  scan_orchestration_category_found: scanOrchestrationCategoryFound,
  candidate_generation_category_found: candidateGenerationCategoryFound,
  validation_quality_gates_category_found: validationQualityGatesCategoryFound,
  trade_geometry_category_found: tradeGeometryCategoryFound,
  confidence_scoring_category_found: confidenceScoringCategoryFound,
  ranking_selection_category_found: rankingSelectionCategoryFound,
  persistence_snapshots_category_found: persistenceSnapshotsCategoryFound,
  learning_outcome_category_found: learningOutcomeCategoryFound,
  ui_surfaces_category_found: uiSurfacesCategoryFound,
  no_touch_surfaces_found: noTouchSurfacesFound,
  inventory_output_found: inventoryOutputFound,
  next_actions_found: nextActionsFound,
  what_not_to_do_yet_found: whatNotToDoYetFound,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  proxy_changes_allowed: false,
  scanner_ranking_mutation_allowed: false,
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
    ? "proceed_to_action_325_recommendation_quality_gates_audit"
    : "complete_recommendation_engine_code_surface_inventory_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
