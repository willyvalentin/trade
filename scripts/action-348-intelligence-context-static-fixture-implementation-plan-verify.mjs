#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-348-intelligence-context-static-fixture-implementation-plan.md";

const existingWorkReferences = [
  "Action 336 Intelligence Context Schema Draft",
  "Action 342 Intelligence Context Static Fixture Spec",
  "Action 346 Existing Schema Compatibility Matrix",
  "Action 341 Learning Dataset Static Fixture Spec",
  "Action 347 Learning Dataset Static Fixture Implementation Plan",
  "Existing recommendation snapshot, replay, History, and Statistics foundations",
];

const allowedFutureFiles = [
  "`lib/intelligence-context-static-fixtures.ts`",
  "`lib/intelligence-context-static-fixture-validation.ts`",
  "focused documentation",
  "focused Playwright test",
  "No app/api, app page, proxy, middleware, Netlify, migration, provider, or Supabase files may change",
];

const futureFixtureShape = [
  "fixture_id",
  "fixture_version",
  "description",
  "snapshot_timestamp",
  "symbol",
  "market_regime_context",
  "sector_industry_context",
  "relative_strength_context",
  "company_news_catalyst_context",
  "calendar_event_context",
  "data_provenance_context",
  "context_snapshot_envelope",
  "expected_context_labels",
  "expected_missing_context_reasons",
  "anti_leakage_expectation",
  "learning_context_eligibility",
];

const requiredScenarios = [
  "supportive_bull_regime_sector_strength",
  "weak_market_strong_stock_relative_strength",
  "sector_supported_momentum",
  "isolated_stock_spike_no_sector_support",
  "catalyst_fresh_earnings_gap",
  "stale_catalyst_risk",
  "macro_event_chop_day",
  "options_expiration_noise",
  "missing_news_context",
  "missing_sector_mapping",
  "provenance_low_confidence",
  "anti_leakage_news_after_snapshot",
];

const deterministicRequirements = [
  "fixed timestamps",
  "fixed IDs",
  "fixed symbols",
  ["no ", "Date", ".now"].join(""),
  "no random IDs",
  "no runtime timezone dependency",
  "no environment reads",
  "no network",
  "no provider imports",
  "no news API imports",
  "no Supabase imports",
  "no app/api imports",
  "no scanner/ranking imports",
  "stable array ordering",
  "immutable fixture objects where practical",
];

const antiLeakageRules = [
  "catalyst timestamps after snapshot must remain unavailable at snapshot time",
  "future regime labels must not appear in snapshot-time context",
  "future sector performance must not be included",
  "future relative-strength values must not be included",
  "enrichment version and source timestamp must be auditable",
  "post-outcome context must be separately labeled",
  "missing context must never be silently imputed",
];

const adapterFirstRules = [
  "context fixtures should model the Action 336 envelope",
  "future mappers should attach context to recommendation snapshots",
  "avoid parallel recommendation records",
  "avoid duplicate learning rows",
  "avoid duplicate outcome records",
  "avoid duplicate provider provenance structures",
  "prefer small adapters over new persistence architecture",
  "preserve History/Statistics compatibility",
];

const validationRequirements = [
  "all 12 fixtures exist",
  "IDs are unique and deterministic",
  "all timestamps are valid and fixed",
  "context object coverage matches expected scenario",
  "missing context reasons are explicit",
  "anti-leakage expectations pass",
  "unavailable catalyst/news is not treated as snapshot-time context",
  "no forbidden imports",
  "no mutations",
  "stable deterministic serialization",
];

const readinessLevels = [
  "CIF0: implementation plan missing",
  "CIF1: file boundaries defined",
  "CIF2: fixture type shape defined",
  "CIF3: scenario mappings defined",
  "CIF4: deterministic rules defined",
  "CIF5: anti-leakage validation defined",
  "CIF6: adapter-first mapping defined",
  "CIF7: local implementation approved",
  "CIF8: local fixture implementation complete",
  "CIF9: local fixture validation complete",
];

const blockedWork = [
  "no context fixture implementation yet",
  "no context mapper implementation yet",
  "no provider calls yet",
  "no news API calls yet",
  "no Supabase reads/writes yet",
  "no context persistence yet",
  "no learning dataset persistence yet",
  "no schema changes yet",
  "no migrations yet",
  "no runtime routes yet",
  "no replay execution yet",
  "no scanner/ranking mutation yet",
  "no confidence threshold changes yet",
  "no deploy",
  "no main push",
];

const nextActions = [
  "Action 349: Pattern Insight Static Fixture Spec",
  "Action 350: Runtime Ping-Only Route Approval Gate",
  "Action 351: First Tiny Provider Capacity Experiment Approval Gate",
  "Action 352: Snapshot-to-Learning Dataset Mapper Plan",
  "Action 353: Learning Dataset Static Fixture Implementation Approval Gate",
  "Action 354: Intelligence Context Static Fixture Implementation Approval Gate",
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
  "intelligence_context_fixture_implementation_plan_status: fixture_implementation_plan_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "intelligence context fixture implementation planning only",
  "not fixture implementation",
  "provider integration",
  "news integration",
  "runtime implementation",
  "Supabase persistence",
  "schema implementation",
  "migration",
  "scanner mutation",
  "ranking mutation",
  "deploy readiness",
  "main-push authorization",
]);
const relationshipToExistingWorkFound = existingWorkReferences.every((item) =>
  content.includes(item),
);
const allowedFutureFilesFound = allowedFutureFiles.every((item) => content.includes(item));
const futureFixtureShapeFound = futureFixtureShape.every((item) => content.includes(item));
const requiredScenariosFound = requiredScenarios.every((item) => content.includes(item));
const deterministicRequirementsFound = deterministicRequirements.every((item) =>
  content.includes(item),
);
const antiLeakageRulesFound = antiLeakageRules.every((item) => content.includes(item));
const adapterFirstRulesFound = adapterFirstRules.every((item) => content.includes(item));
const validationRequirementsFound = validationRequirements.every((item) =>
  content.includes(item),
);
const readinessLevelsFound =
  readinessLevels.every((item) => content.includes(item)) &&
  content.includes("Current status is not CIF7") &&
  content.includes("Implementation is not authorized");
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize context fixture implementation",
  "context mapper implementation",
  "runtime route changes",
  "provider calls",
  "news API calls",
  "Supabase remote reads",
  "Supabase reads",
  "Supabase writes",
  "context persistence",
  "learning dataset persistence",
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
  relationshipToExistingWorkFound &&
  allowedFutureFilesFound &&
  futureFixtureShapeFound &&
  requiredScenariosFound &&
  deterministicRequirementsFound &&
  antiLeakageRulesFound &&
  adapterFirstRulesFound &&
  validationRequirementsFound &&
  readinessLevelsFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  implementation_plan_found: implementationPlanFound,
  plan_status_found: planStatusFound,
  relationship_to_existing_work_found: relationshipToExistingWorkFound,
  allowed_future_files_found: allowedFutureFilesFound,
  future_fixture_shape_found: futureFixtureShapeFound,
  required_scenarios_found: requiredScenariosFound,
  deterministic_requirements_found: deterministicRequirementsFound,
  anti_leakage_rules_found: antiLeakageRulesFound,
  adapter_first_rules_found: adapterFirstRulesFound,
  validation_requirements_found: validationRequirementsFound,
  readiness_levels_found: readinessLevelsFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  context_fixture_implementation_allowed: false,
  context_mapper_implementation_allowed: false,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_read_allowed: false,
  supabase_write_allowed: false,
  context_persistence_allowed: false,
  schema_change_allowed: false,
  migration_allowed: false,
  replay_execution_allowed: false,
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
    context_fixture_implemented: false,
    context_mapper_implemented: false,
    context_persisted: false,
    learning_dataset_persisted: false,
    schema_changed: false,
    migration_created: false,
    migration_altered: false,
    snapshots_persisted: false,
    candles_persisted: false,
    news_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
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
  recommended_next_step: "action_349_pattern_insight_static_fixture_spec",
};

console.log(JSON.stringify(result, null, 2));
process.exit(passed ? 0 : 1);
