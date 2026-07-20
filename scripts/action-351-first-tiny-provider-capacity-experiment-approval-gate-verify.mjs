#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-351-first-tiny-provider-capacity-experiment-approval-gate.md";

const prerequisiteArtifacts = [
  "Action 309 Post-Recovery Safe Development Protocol",
  "Action 339 Historical Backfill Cost and Provider Capacity Plan",
  "Action 345 First Tiny Provider Capacity Experiment Plan",
  "Action 350 Runtime Ping-Only Route Approval Gate",
  "Actions 318-320 package guards passing",
  "known provider identified",
  "exact symbol/day/interval scope identified",
  "local/dev execution path defined",
  "no persistence path planned",
  "no runtime production route required",
];

const implementationConditions = [
  "Action 309 guard passes",
  "Action 339 verifier passes",
  "Action 345 verifier passes",
  "Actions 318-320 pass",
  "allowed implementation files are predefined",
  "provider request scope is exactly bounded",
  "result shape is no-write",
  "no Supabase imports planned",
  "no persistence imports planned",
  "no replay imports planned",
  "no scanner/ranking imports planned",
  "no app/api route planned",
  "user explicitly approves implementation",
];

const executionConditions = [
  "Implementation approval does not imply execution approval",
  "implementation diff reviewed",
  "provider key handling reviewed without printing secrets",
  "exact symbol confirmed",
  "exact trading day confirmed",
  "exact interval confirmed",
  "expected request count confirmed",
  "local/dev-only command prepared",
  "no-write assertions active",
  "user explicitly approves execution",
];

const persistenceSeparation = [
  "Experiment execution approval does not authorize",
  "raw response persistence",
  "candle persistence",
  "fetch-run persistence",
  "Supabase writes",
  "replay execution",
  "Each requires a later separate approval gate",
];

const allowedScope = [
  "one local-only pure experiment helper/script",
  "one focused result type/helper if needed",
  "one focused test",
  "one implementation result doc",
  "No app/api, app page, proxy, middleware, Netlify, migration, scanner, ranking, or Supabase persistence files may change",
];

const futureExperimentContract = [
  "provider: current configured market data provider",
  "symbol: AAPL or SPY",
  "interval: 5min",
  "one known trading day",
  "one request scope",
  "local/dev only",
  "no writes",
  "no replay",
  "no scanner/ranking effects",
  "no visible recommendation effects",
  "deterministic result labels where possible",
];

const approvalFlags = [
  "TURE_FIRST_TINY_PROVIDER_CAPACITY_EXPERIMENT_IMPLEMENTATION_APPROVED=false",
  "TURE_FIRST_TINY_PROVIDER_CAPACITY_EXPERIMENT_EXECUTION_APPROVED=false",
  "TURE_PROVIDER_CALLS_APPROVED=false",
  "TURE_NEWS_API_CALLS_APPROVED=false",
  "TURE_SUPABASE_READ_APPROVED=false",
  "TURE_SUPABASE_WRITE_APPROVED=false",
  "TURE_RAW_RESPONSE_PERSISTENCE_APPROVED=false",
  "TURE_CANDLE_PERSISTENCE_APPROVED=false",
  "TURE_FETCH_RUN_PERSISTENCE_APPROVED=false",
  "TURE_REPLAY_EXECUTION_APPROVED=false",
  "TURE_SCANNER_RANKING_MUTATION_APPROVED=false",
];

const decisionModel = [
  "gate_closed",
  "prerequisites_incomplete",
  "ready_for_user_implementation_approval",
  "implementation_approved_execution_not_approved",
  "ready_for_user_execution_approval",
  "execution_approved_no_persistence_authorized",
  "Current decision:",
];

const failureConditions = [
  "package guards fail",
  "unrelated runtime/execution artifacts are mixed into the batch",
  "provider scope is broader than one symbol/day/interval",
  "persistence is included",
  "app/api route is included",
  "Supabase imports are planned",
  "replay/scanner/ranking imports are planned",
  "expected request count is unknown",
  "user approval is absent",
];

const blockedWork = [
  "no provider experiment implementation",
  "no provider calls",
  "no candle fetch",
  "no Supabase access",
  "no raw response persistence",
  "no candle persistence",
  "no fetch-run persistence",
  "no runtime route",
  "no replay",
  "no scanner/ranking mutation",
  "no deploy",
  "no main push",
];

const nextActions = [
  "Action 352: Snapshot-to-Learning Dataset Mapper Plan",
  "Action 353: Learning Dataset Static Fixture Implementation Approval Gate",
  "Action 354: Intelligence Context Static Fixture Implementation Approval Gate",
  "Action 355: Pattern Insight Static Fixture Implementation Plan",
  "Action 356: Runtime Ping-Only Route Implementation Readiness Review",
  "Action 357: First Tiny Provider Capacity Experiment Implementation Readiness Review",
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
  "first_tiny_provider_capacity_experiment_gate_status: gate_ready_closed",
  "experiment_implementation_approved: false",
  "experiment_execution_approved: false",
  "provider_call_allowed: false",
  "deploy_readiness: false",
  "main_push_allowed: false",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "closed provider-capacity experiment approval gate only",
  "does not implement or execute an experiment",
  "call a provider",
  "fetch candles",
  "authorize persistence",
]);
const prerequisiteArtifactsFound = prerequisiteArtifacts.every((item) =>
  content.includes(item),
);
const implementationConditionsFound = implementationConditions.every((item) =>
  content.includes(item),
);
const executionConditionsFound = executionConditions.every((item) =>
  content.includes(item),
);
const persistenceSeparationFound = persistenceSeparation.every((item) =>
  content.includes(item),
);
const allowedScopeFound = allowedScope.every((item) => content.includes(item));
const futureExperimentContractFound = futureExperimentContract.every((item) =>
  content.includes(item),
);
const approvalFlagsFound = approvalFlags.every((item) => content.includes(item));
const decisionModelFound =
  decisionModel.every((item) => content.includes(item)) &&
  content.includes("- gate_closed");
const failureConditionsFound = failureConditions.every((item) => content.includes(item));
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize provider experiment implementation",
  "provider calls",
  "news API calls",
  "candle fetches",
  "Supabase remote reads",
  "Supabase reads",
  "Supabase writes",
  "raw response persistence",
  "candle persistence",
  "fetch-run persistence",
  "runtime route changes",
  "app/api changes",
  "app page changes",
  "replay execution",
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
  "deploys",
  "main pushes",
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
  executionConditionsFound &&
  persistenceSeparationFound &&
  allowedScopeFound &&
  futureExperimentContractFound &&
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
  execution_conditions_found: executionConditionsFound,
  persistence_separation_found: persistenceSeparationFound,
  allowed_scope_found: allowedScopeFound,
  future_experiment_contract_found: futureExperimentContractFound,
  approval_flags_found: approvalFlagsFound,
  decision_model_found: decisionModelFound,
  failure_conditions_found: failureConditionsFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  current_gate_decision: "gate_closed",
  experiment_implementation_approved: false,
  experiment_execution_approved: false,
  experiment_implementation_allowed: false,
  experiment_execution_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_read_allowed: false,
  supabase_write_allowed: false,
  raw_response_persistence_allowed: false,
  candle_persistence_allowed: false,
  fetch_run_persistence_allowed: false,
  replay_execution_allowed: false,
  scanner_ranking_mutation_allowed: false,
  runtime_route_changes_allowed: false,
  deploy_readiness: false,
  main_push_allowed: false,
  explicit_user_approval_required: true,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    news_api_call_executed: false,
    news_api_call_attempted: false,
    candle_fetch_executed: false,
    supabase_remote_read_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    raw_response_persisted: false,
    candles_persisted: false,
    fetch_run_persisted: false,
    persisted_data: false,
    route_implemented: false,
    app_api_route_added: false,
    app_page_route_added: false,
    runtime_code_changed: false,
    proxy_changed: false,
    middleware_changed: false,
    netlify_config_changed: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
    confidence_thresholds_mutated: false,
  },
  recommended_next_step:
    "action_352_snapshot_to_learning_dataset_mapper_plan",
};

console.log(JSON.stringify(result, null, 2));
process.exit(passed ? 0 : 1);
