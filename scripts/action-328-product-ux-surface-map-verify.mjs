#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const mapPath = "docs/action-328-product-ux-surface-map.md";

const primarySurfaces = [
  "Today / Active Window Dashboard",
  "Recommendation Card",
  "Recommendation Detail Modal",
  "History",
  "Statistics",
  "Learning / Replay Review",
  "Risk / Trade Management Surface",
  "Execution / Avanza Handoff Surface",
];

const uxReadinessStates = [
  "UX0: undocumented surface",
  "UX1: planned surface",
  "UX2: wireframe-ready",
  "UX3: implemented but unaudited",
  "UX4: validated against product principle",
  "UX5: production-grade low-noise experience",
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

const productUxSurfaceMapFound = exists(mapPath);
const content = productUxSurfaceMapFound ? read(mapPath) : "";

const mapStatusFound = includesAll(content, [
  "product_ux_surface_map_status: map_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "UX/product planning only",
  "not UI implementation",
  "runtime change",
  "deploy readiness",
  "scanner mutation",
  "ranking mutation",
  "execution change",
]);
const productUxPrincipleFound = includesAll(content, [
  "Ture should feel like a quiet intelligent co-pilot",
  "simple, calm, and action-oriented",
  "should not need to analyze raw market noise",
  "Recommendation cards should explain the trade without overwhelming the user",
  "Deeper diagnostics belong behind secondary surfaces",
]);
const primarySurfacesFound = primarySurfaces.every((surface) =>
  content.includes(surface),
);
const recommendationCardHierarchyFound = includesAll(content, [
  "Recommendation Card Information Hierarchy",
  "Primary:",
  "ticker",
  "direction",
  "entry",
  "stop",
  "target",
  "confidence",
  "setup label",
  "one-sentence reason",
  "CTA",
  "Secondary:",
  "risk/reward",
  "quality gates",
  "VWAP/momentum/volume evidence",
  "market/session context",
  "freshness",
  "duplicate/limit status",
  "Hidden/deep:",
  "raw candles",
  "provider diagnostics",
  "replay diagnostics",
  "calibration evidence",
  "dev-only no-effect flags",
  "route/runtime status",
]);
const noiseReductionRulesFound = includesAll(content, [
  "no broad market data tables on primary surface",
  "no excessive indicators on cards",
  "no provider/internal diagnostics unless needed",
  "no replay/debug info in primary recommendation card",
  "no execution controls before recommendation quality is clear",
  "no autonomous execution copy",
  "no false certainty in confidence language",
]);
const learningReplayUxPlacementFound = includesAll(content, [
  "Static replay foundation should eventually inform History/Statistics and dev review first",
  "Replay should not immediately alter live ranking",
  "Replay results should be framed as evaluation, not trading advice",
  "Learning feedback should improve future confidence only after validation",
]);
const uxReadinessStatesFound =
  uxReadinessStates.every((state) => content.includes(state)) &&
  content.includes("Current UX is not yet UX5");
const nextUxActionsFound = includesAll(content, [
  "Action 329: Recommendation Engine Gate Test Plan",
  "Action 330: Confidence Calibration Static Metric Spec",
  "Action 331: Recommendation Card Content Hierarchy Spec",
  "Action 332: History/Statistics Learning Surface Spec",
  "Action 333: Execution Agent Boundary Refresh",
]);
const whatNotToDoYetFound = includesAll(content, [
  "do not implement UI changes in this action",
  "do not add app/page routes",
  "do not surface replay reports in production UI yet",
  "do not add execution CTAs beyond current safe boundaries",
  "do not change scanner/ranking",
  "do not deploy",
  "do not push main",
]);
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize",
  "production deploy",
  "main push",
  "runtime route",
  "app/page route",
  "UI implementation",
  "proxy or middleware",
  "scanner changes",
  "ranking changes",
  "provider calls",
  "Supabase reads",
  "Supabase writes",
  "replay execution",
  "synthetic outcome persistence",
  "execution changes",
  "recommendation mutation",
]);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  productUxSurfaceMapFound &&
  mapStatusFound &&
  productUxPrincipleFound &&
  primarySurfacesFound &&
  recommendationCardHierarchyFound &&
  noiseReductionRulesFound &&
  learningReplayUxPlacementFound &&
  uxReadinessStatesFound &&
  nextUxActionsFound &&
  whatNotToDoYetFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  product_ux_surface_map_found: productUxSurfaceMapFound,
  map_status_found: mapStatusFound,
  product_ux_principle_found: productUxPrincipleFound,
  primary_surfaces_found: primarySurfacesFound,
  primary_surfaces_present: primarySurfaces.filter((surface) =>
    content.includes(surface),
  ),
  primary_surfaces_missing: primarySurfaces.filter(
    (surface) => !content.includes(surface),
  ),
  recommendation_card_hierarchy_found: recommendationCardHierarchyFound,
  noise_reduction_rules_found: noiseReductionRulesFound,
  learning_replay_ux_placement_found: learningReplayUxPlacementFound,
  ux_readiness_states_found: uxReadinessStatesFound,
  ux_readiness_states_present: uxReadinessStates.filter((state) =>
    content.includes(state),
  ),
  ux_readiness_states_missing: uxReadinessStates.filter(
    (state) => !content.includes(state),
  ),
  next_ux_actions_found: nextUxActionsFound,
  what_not_to_do_yet_found: whatNotToDoYetFound,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  page_route_changes_allowed: false,
  ui_implementation_allowed: false,
  proxy_changes_allowed: false,
  scanner_ranking_mutation_allowed: false,
  execution_change_allowed: false,
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
    ui_implementation_changed: false,
    app_page_route_added: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  recommended_next_step: passed
    ? "continue_to_recommendation_engine_gate_test_plan"
    : "fix_product_ux_surface_map_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
