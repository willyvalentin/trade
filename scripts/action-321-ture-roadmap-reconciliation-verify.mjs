#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const roadmapPath = "docs/action-321-ture-roadmap-reconciliation-after-recovery.md";

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

const roadmapReconciliationFound = exists(roadmapPath);
const content = roadmapReconciliationFound ? read(roadmapPath) : "";

const productFocusRestored = content.includes(
  "roadmap_reconciliation_status: product_focus_restored",
);
const includesTureProductIdentity = includesAll(content, [
  "Ture is a learning recommendation engine for US daytrading",
  "quiet intelligent co-pilot",
  "not a noisy analysis tool",
  "learn from all recommendations",
  "Execution is secondary until the recommendation engine proves value",
  "user always makes the final manual",
]);
const includesRoadmapTracks = includesAll(content, [
  "Recommendation Engine",
  "Learning / Backfill / Replay",
  "User-Facing Product UX",
  "Risk / Discipline / Trade Management",
  "Execution Agent",
]);
const includesActions309320Mapping = includesAll(content, [
  "Actions 309-320",
  "static/offline replay-with-signal-package foundation",
  "roadmap track 2: Learning / Backfill / Replay",
]);
const includesPausedWork = includesAll(content, [
  "runtime replay route",
  "production API route work",
  "Supabase replay write path",
  "provider refetch path",
  "scanner/ranking integration",
  "execution agent work",
]);
const includesBlockedWork = includesAll(content, [
  "Any new app/api route",
  "Any proxy/middleware change",
  "Any Netlify config change",
  "Any production replay execution",
  "Any Supabase write path for synthetic outcomes",
  "Any provider call from replay path",
  "Any scanner/ranking mutation from replay",
  "Any deploy without explicit deploy readiness checklist",
]);
const includesNextProductSequence = includesAll(content, [
  "Action 322: Ture Product Roadmap Index",
  "Action 323: Recommendation Engine Readiness Map",
  "Action 324: Learning/Backfill Runtime Rollout Plan",
  "Action 325: Product UX Surface Map for Recommendation Cards, History, Statistics",
  "Action 326: Execution Agent Boundary Refresh",
]);
const saysNotDeployReadiness = content.includes(
  "This is a roadmap reconciliation, not deploy readiness",
);
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
  roadmapReconciliationFound &&
  productFocusRestored &&
  includesTureProductIdentity &&
  includesRoadmapTracks &&
  includesActions309320Mapping &&
  includesPausedWork &&
  includesBlockedWork &&
  includesNextProductSequence &&
  saysNotDeployReadiness &&
  blocksDeployMainRuntimeProxy &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  roadmap_reconciliation_found: roadmapReconciliationFound,
  product_focus_restored: productFocusRestored,
  includes_ture_product_identity: includesTureProductIdentity,
  includes_roadmap_tracks: includesRoadmapTracks,
  includes_actions_309_320_mapping: includesActions309320Mapping,
  includes_paused_work: includesPausedWork,
  includes_blocked_work: includesBlockedWork,
  includes_next_product_sequence: includesNextProductSequence,
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
    ? "continue_product_roadmap_clarity_before_any_runtime_rollout"
    : "complete_roadmap_reconciliation_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
