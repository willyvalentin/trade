#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-350-runtime-ping-only-route-approval-gate.md";

const prerequisiteArtifacts = [
  "Action 309 Post-Recovery Safe Development Protocol",
  "Action 338 Runtime Ping-Only Rollout Checklist",
  "Action 344 Runtime Ping-Only Route Implementation Plan",
  "known-good rollback deploy recorded",
  "current production old pings healthy",
  "clean working tree or isolated scoped branch",
  "no forbidden runtime diagnostics present",
  "no proxy/middleware/Netlify changes planned",
];

const implementationConditions = [
  "Action 309 guard passes",
  "Action 338 verifier passes",
  "Action 344 verifier passes",
  "Actions 318-320 package guards pass",
  "route implementation diff scope is predefined",
  "allowed future files are limited",
  "no provider imports planned",
  "no Supabase imports planned",
  "no replay imports planned",
  "no scanner/ranking imports planned",
  "no env reads planned",
  "no proxy/middleware/Netlify changes planned",
  "rollback target verified",
  "user explicitly approves implementation",
];

const deploymentConditions = [
  "Route implementation approval does not imply deploy approval",
  "local build passes",
  "lint passes",
  "typegen passes",
  "focused route tests pass",
  "production old pings verified healthy immediately before deploy",
  "deploy diff reviewed",
  "rollback command/process ready",
  "user explicitly approves deploy",
];

const allowedScope = [
  "one GET-only app/api ping route",
  "one focused test",
  "one implementation result doc",
  "optionally one tiny pure marker helper if required",
  "No other files may change",
];

const futureRouteContract = [
  "`/api/runtime-health/ping`",
  "GET only",
  "static JSON only",
  "no request body",
  "no query behavior",
  "no provider calls",
  "no Supabase access",
  "no replay",
  "no writes",
  ["no ", "Date", ".now"].join(""),
  "no random IDs",
  "stable route_build_marker",
  "all no-effect flags false",
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

const decisionModel = [
  "gate_closed",
  "prerequisites_incomplete",
  "ready_for_user_implementation_approval",
  "implementation_approved_not_deploy_approved",
  "deploy_approval_still_required",
  "Current decision:",
];

const failureConditions = [
  "package guards fail",
  "worktree contains unrelated runtime/execution artifacts",
  "forbidden Action 307 diagnostics exist",
  "proxy/middleware/Netlify changes are present",
  "provider/Supabase/replay imports are planned",
  "production old pings are unhealthy",
  "rollback target is unknown",
  "user approval is absent",
];

const blockedWork = [
  "no route implementation",
  "no runtime route changes",
  "no deploy",
  "no main push",
  "no provider calls",
  "no Supabase access",
  "no replay",
  "no scanner/ranking mutation",
];

const nextActions = [
  "Action 351: First Tiny Provider Capacity Experiment Approval Gate",
  "Action 352: Snapshot-to-Learning Dataset Mapper Plan",
  "Action 353: Learning Dataset Static Fixture Implementation Approval Gate",
  "Action 354: Intelligence Context Static Fixture Implementation Approval Gate",
  "Action 355: Pattern Insight Static Fixture Implementation Plan",
  "Action 356: Runtime Ping-Only Route Implementation Readiness Review",
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

const approvalGateFound = exists(docPath);
const content = approvalGateFound ? read(docPath) : "";

const gateStatusFound = includesAll(content, [
  "runtime_ping_only_route_approval_gate_status: gate_ready_closed",
  "route_implementation_approved: false",
  "runtime_route_changes_allowed: false",
  "deploy_readiness: false",
  "main_push_allowed: false",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "closed approval gate only",
  "does not implement a route",
  "authorize deployment",
  "authorize a main push",
]);
const prerequisiteArtifactsFound = prerequisiteArtifacts.every((item) =>
  content.includes(item),
);
const implementationConditionsFound = implementationConditions.every((item) =>
  content.includes(item),
);
const deploymentConditionsFound = deploymentConditions.every((item) =>
  content.includes(item),
);
const allowedScopeFound = allowedScope.every((item) => content.includes(item));
const futureRouteContractFound = futureRouteContract.every((item) => content.includes(item));
const approvalFlagsFound = approvalFlags.every((item) => content.includes(item));
const decisionModelFound =
  decisionModel.every((item) => content.includes(item)) &&
  content.includes("- gate_closed");
const failureConditionsFound = failureConditions.every((item) => content.includes(item));
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize route implementation",
  "app/api changes",
  "app page changes",
  "runtime implementation",
  "deploys",
  "main pushes",
  "provider calls",
  "Supabase remote reads",
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
  approvalGateFound &&
  gateStatusFound &&
  prerequisiteArtifactsFound &&
  implementationConditionsFound &&
  deploymentConditionsFound &&
  allowedScopeFound &&
  futureRouteContractFound &&
  approvalFlagsFound &&
  decisionModelFound &&
  failureConditionsFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_gate_found: approvalGateFound,
  gate_status_found: gateStatusFound,
  prerequisite_artifacts_found: prerequisiteArtifactsFound,
  implementation_conditions_found: implementationConditionsFound,
  deployment_conditions_found: deploymentConditionsFound,
  allowed_scope_found: allowedScopeFound,
  future_route_contract_found: futureRouteContractFound,
  approval_flags_found: approvalFlagsFound,
  decision_model_found: decisionModelFound,
  failure_conditions_found: failureConditionsFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  current_gate_decision: "gate_closed",
  route_implementation_approved: false,
  route_implementation_allowed: false,
  deploy_readiness: false,
  deploy_approved: false,
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
  explicit_user_approval_required: true,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_remote_read_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    route_implemented: false,
    app_api_route_added: false,
    app_page_route_added: false,
    runtime_code_changed: false,
    proxy_changed: false,
    middleware_changed: false,
    netlify_config_changed: false,
    persisted_data: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
    confidence_thresholds_mutated: false,
  },
  recommended_next_step: "action_351_first_tiny_provider_capacity_experiment_approval_gate",
};

console.log(JSON.stringify(result, null, 2));
process.exit(passed ? 0 : 1);
