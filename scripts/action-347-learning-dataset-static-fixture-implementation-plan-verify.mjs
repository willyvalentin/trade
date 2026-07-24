#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-347-learning-dataset-static-fixture-implementation-plan.md";

const action341Scenarios = [
  "visible_winner_target_hit",
  "visible_stop_hit",
  "research_only_outperformer",
  "research_only_weak_followthrough",
  "stale_plan_adverse_move",
  "no_entry_triggered",
  "missing_context_safe_unknown",
  "duplicate_snapshot_deduped",
  "confidence_overfit_warning",
  "anti_leakage_future_context_blocked",
];

const allowedFutureFiles = [
  "`lib/learning-dataset-static-fixtures.ts`",
  "focused docs",
  "focused Playwright spec",
];

const pureHelperRules = [
  "local-only",
  "deterministic",
  ["no ", "Date", ".now"].join(""),
  "no random IDs",
  "no provider imports",
  "no Supabase imports",
  "no app/api imports",
  "no runtime imports",
  "no scanner/ranking imports",
  "no writes",
  "no replay execution",
];

const antiLeakageRules = [
  "snapshot-time features must remain separated from outcome fields",
  "future context must be labeled unavailable at snapshot time",
  "post-outcome context must be labeled post_outcome",
  "catalyst/news availability must be snapshot-time safe",
  "generated labels must not use future candles or future outcomes as pre-trade context",
  "duplicate snapshot rows must be deduped without changing outcome semantics",
];

const adapterFirstRules = [
  "prefer mapping existing snapshot fields into fixture rows",
  "prefer mapping existing outcome fields into fixture rows",
  "prefer context envelope adapters over parallel tables",
  "prefer provider audit adapters over new audit concepts",
  "preserve existing static replay result model compatibility",
  "preserve History/Statistics compatibility",
  "keep missing fields explicit instead of inventing schema",
];

const doNotDuplicateRules = [
  "do not duplicate recommendation rows",
  "do not duplicate snapshot ids",
  "do not duplicate outcome records",
  "do not duplicate confidence fields",
  "do not duplicate setup taxonomy fields",
  "do not duplicate provider audit rows",
  "do not duplicate candle persistence tables",
  "do not create learning dataset rows disconnected from snapshots",
  "do not create pattern insight persistence without dataset linkage",
];

const validationPlan = [
  "Action 309 guard",
  "Action 341 fixture spec verifier",
  "Action 346 compatibility matrix verifier",
  "Action 347 implementation plan verifier",
  "golden static replay verifier",
  "TypeScript",
  "lint",
  "build",
  "typegen",
  "focused Playwright spec",
];

const blockedWork = [
  "no fixture implementation yet",
  "no fixture data yet",
  "no runtime routes yet",
  "no provider calls yet",
  "no news API calls yet",
  "no Supabase reads yet",
  "no Supabase writes yet",
  "no schema changes yet",
  "no migrations yet",
  "no replay execution yet",
  "no scanner/ranking mutation yet",
  "no confidence threshold changes yet",
  "no deploy",
  "no main push",
];

const nextActions = [
  "Action 348: Intelligence Context Static Fixture Implementation Plan",
  "Action 349: Pattern Insight Static Fixture Spec",
  "Action 350: Runtime Ping-Only Route Approval Gate",
  "Action 351: First Tiny Provider Capacity Experiment Approval Gate",
  "Action 352: Snapshot-to-Learning Dataset Mapper Plan",
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
  "implementation_plan_status: fixture_implementation_plan_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "planning only, not fixture implementation",
  "not fixture implementation",
]);
const action341ReferenceFound = includesAll(content, [
  "Relationship To Action 341",
  "Action 341 defines the Learning Dataset Static Fixture Spec",
]);
const action346ReferenceFound = includesAll(content, [
  "Relationship To Action 346",
  "Action 346 defines the Existing Schema Compatibility Matrix",
]);
const allowedFutureFilesFound = allowedFutureFiles.every((item) => content.includes(item));
const pureHelperRulesFound = pureHelperRules.every((item) => content.includes(item));
const action341ScenariosFound = action341Scenarios.every((item) => content.includes(item));
const antiLeakageRulesFound = antiLeakageRules.every((item) => content.includes(item));
const adapterFirstRulesFound = adapterFirstRules.every((item) => content.includes(item));
const doNotDuplicateRulesFound = doNotDuplicateRules.every((item) => content.includes(item));
const validationPlanFound = validationPlan.every((item) => content.includes(item));
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize fixture implementation",
  "fixture data",
  "runtime route changes",
  "provider calls",
  "news API calls",
  "Supabase remote reads",
  "Supabase reads",
  "Supabase writes",
  "schema changes",
  "migrations",
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
  implementationPlanFound &&
  planStatusFound &&
  action341ReferenceFound &&
  action346ReferenceFound &&
  allowedFutureFilesFound &&
  pureHelperRulesFound &&
  action341ScenariosFound &&
  antiLeakageRulesFound &&
  adapterFirstRulesFound &&
  doNotDuplicateRulesFound &&
  validationPlanFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  implementation_plan_found: implementationPlanFound,
  plan_status_found: planStatusFound,
  action_341_reference_found: action341ReferenceFound,
  action_346_reference_found: action346ReferenceFound,
  allowed_future_files_found: allowedFutureFilesFound,
  pure_helper_rules_found: pureHelperRulesFound,
  action_341_scenarios_found: action341ScenariosFound,
  anti_leakage_rules_found: antiLeakageRulesFound,
  adapter_first_rules_found: adapterFirstRulesFound,
  do_not_duplicate_rules_found: doNotDuplicateRulesFound,
  validation_plan_found: validationPlanFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  fixture_implementation_allowed: false,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_write_allowed: false,
  schema_change_allowed: false,
  migration_allowed: false,
  scanner_ranking_mutation_allowed: false,
  confidence_threshold_mutation_allowed: false,
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
    fixture_implemented: false,
    fixture_data_added: false,
    schema_changed: false,
    migration_created: false,
    migration_altered: false,
    snapshots_persisted: false,
    candles_persisted: false,
    news_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    learning_dataset_persisted: false,
    context_snapshots_persisted: false,
    pattern_insights_persisted: false,
    route_implemented: false,
    app_api_route_added: false,
    app_page_route_added: false,
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
  recommended_next_step: "action_348_intelligence_context_static_fixture_implementation_plan",
};

console.log(JSON.stringify(result, null, 2));

if (!passed) {
  process.exitCode = 1;
}
