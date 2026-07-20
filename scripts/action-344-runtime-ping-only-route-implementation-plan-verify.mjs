#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-344-runtime-ping-only-route-implementation-plan.md";

const futureRouteContract = [
  "route path placeholder: /api/runtime-health/ping",
  "method: GET only",
  "response: static JSON only",
  "no auth dependency for first proof if possible",
  "no request body",
  "no query behavior",
  "no provider imports",
  "no Supabase imports",
  "no replay imports",
  "no scanner/ranking imports",
  "no env reads",
  "no writes",
  ["no ", "Date", ".now"].join(""),
  "no random IDs",
  "stable route_build_marker",
  "all no-effect flags false",
];

const responseShape = [
  '"ok": true',
  '"route_ping": true',
  '"route_build_marker": "action_344_future_runtime_ping_only_route"',
  '"provider_call_executed": false',
  '"provider_call_attempted": false',
  '"supabase_read_executed": false',
  '"supabase_write_executed": false',
  '"replay_executed": false',
  '"synthetic_outcomes_persisted": false',
  '"scanner_behavior_changed": false',
  '"live_ranking_changed": false',
  '"recommendation_rows_mutated": false',
  '"runtime_route_scope": "ping_only"',
  '"deploy_readiness_required": true',
];

const forbiddenImplementationDetails = [
  "no proxy.ts changes",
  "no middleware changes",
  "no netlify.toml changes",
  "no route-publication diagnostic experiments",
  "no broad runtime probes",
  "no POST",
  "no provider calls",
  "no Supabase calls",
  "no replay simulation",
  "no static replay imports",
  "no learning dataset imports",
  "no context schema imports",
  "no scanner/ranking imports",
  "no auth boundary experiments",
  "no branch deploy publish while non-production runtime is untrusted",
];

const futureFilePlan = [
  "one app/api runtime health ping route file",
  "one tiny pure route marker helper if necessary",
  "one focused test spec",
  "one implementation result doc",
  "No other surfaces may change",
];

const localValidationPlan = [
  "git status before implementation",
  "Action 309 guard",
  "Action 338 checklist verifier",
  "Action 344 plan verifier",
  "grep for forbidden 307K marker",
  "git diff must include only allowed future route/doc/test files",
  "build",
  "lint",
  "typegen",
  "focused Playwright spec",
];

const productionRolloutPreconditions = [
  "production old pings healthy before deploy",
  "rollback target recorded",
  "route table inspection plan ready",
  "all approval flags explicitly reviewed",
  "main branch source clean and known",
  "deploy must be explicitly approved by user",
  "rollback immediately on HTTP 400 empty body",
];

const rollbackProcedure = [
  "rollback to deployId 6a501645908e4100088b7396 or newer known-good target",
  "verify old known-good pings",
  "do not hotfix proxy/middleware in production",
  "stop and document failed route rollout",
];

const approvalFlags = [
  "TURE_RUNTIME_PING_ROUTE_IMPLEMENTATION_APPROVED=false",
  "TURE_RUNTIME_ROUTE_DEPLOY_APPROVED=false",
  "TURE_PROVIDER_CALLS_APPROVED=false",
  "TURE_SUPABASE_READ_APPROVED=false",
  "TURE_SUPABASE_WRITE_APPROVED=false",
  "TURE_REPLAY_EXECUTION_APPROVED=false",
  "TURE_SCANNER_RANKING_MUTATION_APPROVED=false",
];

const blockedWork = [
  "no route implementation yet",
  "no app/api changes yet",
  "no deployment yet",
  "no main push yet",
  "no provider calls yet",
  "no Supabase access yet",
  "no replay execution yet",
  "no scanner/ranking mutation yet",
];

const nextActions = [
  "Action 345: First Tiny Provider Capacity Experiment Plan",
  "Action 346: Existing Schema Compatibility Matrix",
  "Action 347: Learning Dataset Static Fixture Implementation Plan",
  "Action 348: Intelligence Context Static Fixture Implementation Plan",
  "Action 349: Pattern Insight Static Fixture Spec",
  "Action 350: Runtime Ping-Only Route Approval Gate",
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

const implementationPlanFound = exists(docPath);
const content = implementationPlanFound ? read(docPath) : "";

const planStatusFound = includesAll(content, [
  "runtime_ping_only_route_implementation_plan_status: implementation_plan_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "runtime ping-only route implementation planning only",
  "not route implementation",
  "runtime implementation",
  "deploy readiness",
  "provider integration",
  "Supabase access",
  "replay execution",
  "scanner mutation",
  "ranking mutation",
  "main-push authorization",
]);
const futureRouteContractFound = futureRouteContract.every((item) =>
  content.includes(item),
);
const responseShapeFound = responseShape.every((item) => content.includes(item));
const forbiddenImplementationDetailsFound = forbiddenImplementationDetails.every((item) =>
  content.includes(item),
);
const futureFilePlanFound = futureFilePlan.every((item) => content.includes(item));
const localValidationPlanFound = localValidationPlan.every((item) => content.includes(item));
const productionRolloutPreconditionsFound = productionRolloutPreconditions.every((item) =>
  content.includes(item),
);
const rollbackProcedureFound = rollbackProcedure.every((item) => content.includes(item));
const approvalFlagsFound = approvalFlags.every((item) => content.includes(item));
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize route implementation",
  "app/api changes",
  "app page changes",
  "runtime implementation",
  "deploys",
  "main pushes",
  "runtime route changes",
  "provider calls",
  "Supabase remote reads",
  "Supabase reads",
  "Supabase writes",
  "replay execution",
  "scanner mutations",
  "ranking mutations",
  "proxy changes",
  "middleware changes",
  "Netlify config changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  implementationPlanFound &&
  planStatusFound &&
  futureRouteContractFound &&
  responseShapeFound &&
  forbiddenImplementationDetailsFound &&
  futureFilePlanFound &&
  localValidationPlanFound &&
  productionRolloutPreconditionsFound &&
  rollbackProcedureFound &&
  approvalFlagsFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  implementation_plan_found: implementationPlanFound,
  plan_status_found: planStatusFound,
  future_route_contract_found: futureRouteContractFound,
  response_shape_found: responseShapeFound,
  forbidden_implementation_details_found: forbiddenImplementationDetailsFound,
  future_file_plan_found: futureFilePlanFound,
  local_validation_plan_found: localValidationPlanFound,
  production_rollout_preconditions_found: productionRolloutPreconditionsFound,
  rollback_procedure_found: rollbackProcedureFound,
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
    supabase_remote_read_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    route_implemented: false,
    runtime_code_changed: false,
    app_api_route_added: false,
    app_page_route_added: false,
    proxy_changed: false,
    middleware_changed: false,
    netlify_config_changed: false,
    snapshots_persisted: false,
    candles_persisted: false,
    news_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    learning_dataset_persisted: false,
    context_snapshots_persisted: false,
    pattern_insights_persisted: false,
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
  recommended_next_step: "action_345_first_tiny_provider_capacity_experiment_plan",
};

console.log(JSON.stringify(result, null, 2));

if (!passed) {
  process.exitCode = 1;
}
