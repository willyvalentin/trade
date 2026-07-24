#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-338-runtime-ping-only-rollout-checklist.md";

const preconditions = [
  "production pings healthy on rollback deploy or newer known-good deploy",
  "rollback target confirmed",
  "working tree clean",
  "current branch verified",
  "no forbidden 307K/runtime artifacts",
  "no proxy.ts changes",
  "no middleware changes",
  "no Netlify config changes",
  "all approvals false",
  "no provider/Supabase/replay imports planned",
  "route table inspection plan exists",
  "immediate rollback plan exists",
  "production test commands prepared",
];

const futurePingRouteRequirements = [
  "isolated route",
  "GET only",
  "returns static JSON only",
  "no auth dependency for first proof if possible",
  "no provider imports",
  "no Supabase imports",
  "no replay imports",
  "no scanner/ranking imports",
  "no env reads unless strictly needed",
  "no writes",
  ["no dynamic ", "Date", ".now timestamp"].join(""),
  "stable route_build_marker",
  "no-effect flags all false",
];

const forbiddenRouteBehavior = [
  "no POST",
  "no provider calls",
  "no Supabase reads/writes",
  "no replay execution",
  "no synthetic outcome persistence",
  "no scanner/ranking mutation",
  "no proxy marker",
  "no broad diagnostics",
  "no route-publication experiments",
  "no Netlify config changes",
  "no middleware changes",
];

const requiredVerification = [
  "Action 309 guard passes",
  "relevant branch/package verifier passes",
  "git diff shows only planned route/doc/test files",
  "no proxy/middleware/netlify changes",
  "build passes",
  "lint passes",
  "typegen passes",
  "Playwright route spec passes locally",
  "production currently healthy before deploy",
  "rollback deploy ID recorded",
];

const productionTestSequence = [
  "confirm old known-good pings still return HTTP 200 JSON",
  "deploy only after explicit deploy readiness approval",
  "inspect Netlify route table",
  "test new ping route first",
  "test old known-good pings second",
  "if any HTTP 400 empty body appears, rollback immediately",
  "never test write/replay/provider routes first",
];

const rollbackPlan = [
  "rollback to deployId 6a501645908e4100088b7396 or newer known-good deploy",
  "verify old pings after rollback",
  "do not attempt fixes directly in production",
  "do not retry with proxy/middleware changes",
  "document failed deploy and stop",
];

const approvalFlags = [
  "TURE_RUNTIME_PING_ROLLOUT_APPROVED=false",
  "TURE_RUNTIME_ROUTE_DEPLOY_APPROVED=false",
  "TURE_PROVIDER_CALLS_APPROVED=false",
  "TURE_SUPABASE_READ_APPROVED=false",
  "TURE_SUPABASE_WRITE_APPROVED=false",
  "TURE_REPLAY_EXECUTION_APPROVED=false",
  "TURE_SCANNER_RANKING_MUTATION_APPROVED=false",
];

const blockedWork = [
  "no runtime ping route yet",
  "no deploy yet",
  "no main push yet",
  "no provider calls yet",
  "no Supabase access yet",
  "no replay execution yet",
  "no scanner/ranking mutation yet",
];

const nextActions = [
  "Action 339: Historical Backfill Cost and Provider Capacity Plan",
  "Action 340: Snapshot Field Inventory Against Existing Schema",
  "Action 341: Learning Dataset Static Fixture Spec",
  "Action 342: Intelligence Context Static Fixture Spec",
  "Action 343: Pattern Insight Static Type Spec",
  "Action 344: Runtime Ping-Only Route Implementation Plan",
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

const checklistFound = exists(docPath);
const content = checklistFound ? read(docPath) : "";

const checklistStatusFound = includesAll(content, [
  "runtime_ping_only_rollout_checklist_status: checklist_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "runtime ping-only rollout planning only",
  "not route implementation",
  "runtime implementation",
  "deploy readiness",
  "provider integration",
  "Supabase persistence",
  "scanner mutation",
  "ranking mutation",
  "main-push authorization",
]);
const preconditionsFound = preconditions.every((item) => content.includes(item));
const futurePingRouteRequirementsFound = futurePingRouteRequirements.every((item) =>
  content.includes(item),
);
const forbiddenRouteBehaviorFound = forbiddenRouteBehavior.every((item) =>
  content.includes(item),
);
const requiredVerificationFound = requiredVerification.every((item) =>
  content.includes(item),
);
const productionTestSequenceFound = productionTestSequence.every((item) =>
  content.includes(item),
);
const rollbackPlanFound = rollbackPlan.every((item) => content.includes(item));
const approvalFlagsFound = approvalFlags.every((item) => content.includes(item));
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((action) => content.includes(action));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize route implementation",
  "deploys",
  "main pushes",
  "runtime route changes",
  "provider calls",
  "Supabase reads",
  "Supabase writes",
  "replay execution",
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
  "proxy changes",
  "middleware changes",
  "Netlify config changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  checklistFound &&
  checklistStatusFound &&
  preconditionsFound &&
  futurePingRouteRequirementsFound &&
  forbiddenRouteBehaviorFound &&
  requiredVerificationFound &&
  productionTestSequenceFound &&
  rollbackPlanFound &&
  approvalFlagsFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  checklist_found: checklistFound,
  checklist_status_found: checklistStatusFound,
  preconditions_found: preconditionsFound,
  future_ping_route_requirements_found: futurePingRouteRequirementsFound,
  forbidden_route_behavior_found: forbiddenRouteBehaviorFound,
  required_verification_found: requiredVerificationFound,
  production_test_sequence_found: productionTestSequenceFound,
  rollback_plan_found: rollbackPlanFound,
  approval_flags_found: approvalFlagsFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  deploy_readiness: false,
  route_implementation_allowed: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  supabase_read_allowed: false,
  supabase_write_allowed: false,
  replay_execution_allowed: false,
  scanner_ranking_mutation_allowed: false,
  proxy_changes_allowed: false,
  middleware_changes_allowed: false,
  netlify_config_changes_allowed: false,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    news_api_call_executed: false,
    news_api_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    route_implemented: false,
    app_api_route_added: false,
    app_page_route_added: false,
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
    ? "action_339_historical_backfill_cost_and_provider_capacity_plan"
    : "fix_runtime_ping_only_rollout_checklist_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
