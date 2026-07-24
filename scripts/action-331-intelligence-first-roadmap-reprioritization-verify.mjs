#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-331-intelligence-first-roadmap-reprioritization.md";

const priorityAreas = [
  "Recommendation Engine Intelligence",
  "Daily Data Collection",
  "Historical Data Collection / Backfill",
  "Learning / Replay / Outcome Analysis",
  "Confidence Calibration / Pattern Recognition",
  "Product UX / UI",
  "Execution Agent",
];

const nextActions = [
  "Action 332: Daily Trading Data Collection Readiness Map",
  "Action 333: Historical Data Backfill Coverage Plan",
  "Action 334: Recommendation Snapshot Completeness Audit",
  "Action 335: Learning Outcome Dataset Design",
  "Action 336: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 337: First Static Gate Helper Extraction Plan",
  "Action 338: Runtime Ping-Only Rollout Checklist",
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

const reprioritizationDocFound = exists(docPath);
const content = reprioritizationDocFound ? read(docPath) : "";

const intelligenceFirstStatusFound = includesAll(content, [
  "intelligence_first_roadmap_status: reprioritized",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "roadmap reprioritization only",
  "not runtime implementation",
  "deploy readiness",
  "UI implementation",
  "scanner mutation",
  "ranking mutation",
  "data collection implementation",
]);
const userDirectionFound = includesAll(content, [
  "The user already has a Figma design for the UI",
  "UX/UI work should be handled near the end",
  "Current priority is the recommendation engine and intelligence layer",
  "Ture should collect data every trading day",
  "Ture should collect historical data",
  "Ture should learn as much as possible from recommendations and outcomes",
  "Ture should detect patterns and improve its ability to produce high-quality recommendations",
  "Execution and UI polish are secondary until the intelligence layer is stronger",
]);
const updatedPriorityOrderFound = priorityAreas.every((area) =>
  content.includes(area),
);
const uxDeprioritizedFound = includesAll(content, [
  "Product UX Surface Map remains useful",
  "UX/UI is no longer the next active development priority",
  "Recommendation Card hierarchy and UI implementation should be postponed",
]);
const figmaReferencePreserved = includesAll(content, [
  "Figma design should remain the reference for later product surface work",
  "use existing Figma design later",
]);
const newNextActionsFound = nextActions.every((action) => content.includes(action));
const runtimeCautionFound = includesAll(content, [
  "Daily/historical data collection will eventually require runtime/provider/Supabase paths",
  "still blocked until a safe rollout checklist exists",
  "without changing runtime",
  "No new app/api routes yet",
  "No provider calls yet",
  "No Supabase writes yet",
  "No deploy yet",
]);
const whatNotToDoYetFound = includesAll(content, [
  "do not focus on UI implementation now",
  "do not implement recommendation card changes now",
  "do not work on execution agent now",
  "do not add runtime data collection routes yet",
  "do not add provider calls yet",
  "do not add Supabase write paths yet",
  "do not mutate scanner/ranking yet",
  "do not change confidence thresholds yet",
  "do not deploy",
  "do not push main",
]);
const action332NextFound = content.includes(
  "The next action should be Action 332: Daily Trading Data Collection Readiness Map",
);
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize",
  "production deploy",
  "main push",
  "runtime route",
  "app/page route",
  "provider calls",
  "Supabase reads",
  "Supabase writes",
  "UI implementation",
  "execution changes",
  "scanner changes",
  "ranking changes",
  "confidence threshold changes",
  "replay execution",
  "synthetic outcome persistence",
  "recommendation mutation",
  "live ranking mutation",
]);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  reprioritizationDocFound &&
  intelligenceFirstStatusFound &&
  userDirectionFound &&
  updatedPriorityOrderFound &&
  uxDeprioritizedFound &&
  figmaReferencePreserved &&
  newNextActionsFound &&
  runtimeCautionFound &&
  whatNotToDoYetFound &&
  action332NextFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  reprioritization_doc_found: reprioritizationDocFound,
  intelligence_first_status_found: intelligenceFirstStatusFound,
  user_direction_found: userDirectionFound,
  updated_priority_order_found: updatedPriorityOrderFound,
  priority_areas_present: priorityAreas.filter((area) => content.includes(area)),
  priority_areas_missing: priorityAreas.filter((area) => !content.includes(area)),
  ux_deprioritized_found: uxDeprioritizedFound,
  figma_reference_preserved: figmaReferencePreserved,
  new_next_actions_found: newNextActionsFound,
  next_actions_present: nextActions.filter((action) => content.includes(action)),
  next_actions_missing: nextActions.filter((action) => !content.includes(action)),
  runtime_caution_found: runtimeCautionFound,
  what_not_to_do_yet_found: whatNotToDoYetFound,
  action_332_next_found: action332NextFound,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  supabase_write_allowed: false,
  ui_implementation_allowed: false,
  execution_change_allowed: false,
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
    ui_implementation_changed: false,
    execution_changed: false,
    data_collection_implemented: false,
  },
  recommended_next_step: passed
    ? "action_332_daily_trading_data_collection_readiness_map"
    : "fix_intelligence_first_reprioritization_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
