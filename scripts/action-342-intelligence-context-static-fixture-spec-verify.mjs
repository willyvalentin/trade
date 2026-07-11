#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-342-intelligence-context-static-fixture-spec.md";

const fixtureDesignPrinciples = [
  "deterministic timestamps",
  ["no ", "Date", ".now"].join(""),
  "no random IDs",
  "no provider calls",
  "no news API calls",
  "no Supabase reads/writes",
  "snapshot-time context separated from post-outcome context",
  "available_at_snapshot_time must be explicit for catalysts",
  "missing context must be explicit",
  "each fixture should define expected context completeness",
  "no scanner/ranking mutation",
  "no confidence threshold mutation",
];

const coreContextFixtureScenarios = [
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

const requiredFixtureObjectCoverage = [
  "MarketRegimeContext",
  "SectorIndustryContext",
  "RelativeStrengthContext",
  "CompanyNewsCatalystContext",
  "CalendarEventContext",
  "DataProvenanceContext",
  "ContextSnapshotEnvelope",
];

const expectedContextLabels = [
  "market_regime_label",
  "sector_support_label",
  "relative_strength_label",
  "catalyst_support_label",
  "calendar_risk_label",
  "data_provenance_label",
  "context_completeness_label",
  "anti_leakage_status",
  "learning_context_eligibility",
  "missing_context_reasons",
];

const antiLeakageValidationCases = [
  "catalyst after snapshot time must not be marked available_at_snapshot_time",
  "end-of-day trend/chop classification must not be used as snapshot-time regime unless explicitly marked post_outcome",
  "future relative strength must not be used as pre-trade context",
  "later sector move must not be used as snapshot-time sector support",
  "context enrichment versions must be auditable",
];

const existingFoundationMapping = [
  "Intelligence Context Schema Draft",
  "Recommendation Snapshot Completeness Audit",
  "Learning Outcome Dataset Design",
  "Learning Dataset Static Fixture Spec",
  "Pattern Discovery Roadmap",
  "existing History/Statistics foundations",
  "Prefer context envelopes/adapters over parallel architecture",
  "Do not duplicate recommendation or outcome records",
];

const readinessLevels = [
  "CF0: context fixture scenarios undefined",
  "CF1: context fixture scenario list defined",
  "CF2: required context object coverage defined",
  "CF3: expected context labels defined",
  "CF4: anti-leakage validation cases defined",
  "CF5: static fixture implementation ready",
  "CF6: fixture tests pass locally",
  "CF7: mapped to learning dataset fixture plan",
  "CF8: ready for local context mapper implementation",
];

const blockedWork = [
  "no context fixture implementation yet",
  "no context persistence yet",
  "no dataset persistence yet",
  "no Supabase writes yet",
  "no runtime routes yet",
  "no provider calls yet",
  "no news API calls yet",
  "no replay execution yet",
  "no scanner/ranking mutation yet",
  "no confidence threshold changes yet",
  "no schema changes",
  "no migrations yet",
  "no deploy",
  "no main push",
];

const nextActions = [
  "Action 343: Pattern Insight Static Type Spec",
  "Action 344: Runtime Ping-Only Route Implementation Plan",
  "Action 345: First Tiny Provider Capacity Experiment Plan",
  "Action 346: Existing Schema Compatibility Matrix",
  "Action 347: Learning Dataset Static Fixture Implementation Plan",
  "Action 348: Intelligence Context Static Fixture Implementation Plan",
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

const contextFixtureSpecFound = exists(docPath);
const content = contextFixtureSpecFound ? read(docPath) : "";

const fixtureStatusFound = includesAll(content, [
  "intelligence_context_static_fixture_status: fixture_spec_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "intelligence context fixture planning only",
  "not fixture implementation",
  "schema implementation",
  "migration",
  "runtime implementation",
  "provider integration",
  "news integration",
  "Supabase persistence",
  "scanner mutation",
  "ranking mutation",
  "deploy readiness",
  "main-push authorization",
]);
const fixtureDesignPrinciplesFound = fixtureDesignPrinciples.every((item) =>
  content.includes(item),
);
const coreContextFixtureScenariosFound = coreContextFixtureScenarios.every((item) =>
  content.includes(item),
);
const requiredFixtureObjectCoverageFound = requiredFixtureObjectCoverage.every((item) =>
  content.includes(item),
);
const expectedContextLabelsFound = expectedContextLabels.every((item) =>
  content.includes(item),
);
const antiLeakageValidationCasesFound = antiLeakageValidationCases.every((item) =>
  content.includes(item),
);
const existingFoundationMappingFound = existingFoundationMapping.every((item) =>
  content.includes(item),
);
const readinessLevelsFound =
  readinessLevels.every((item) => content.includes(item)) &&
  content.includes("Current intelligence context fixtures are not yet CF8");
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize context fixture implementation",
  "deploys",
  "main pushes",
  "runtime route changes",
  "provider calls",
  "news API calls",
  "Supabase remote reads",
  "Supabase reads",
  "Supabase writes",
  "context persistence",
  "dataset persistence",
  "schema changes",
  "migrations",
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  contextFixtureSpecFound &&
  fixtureStatusFound &&
  fixtureDesignPrinciplesFound &&
  coreContextFixtureScenariosFound &&
  requiredFixtureObjectCoverageFound &&
  expectedContextLabelsFound &&
  antiLeakageValidationCasesFound &&
  existingFoundationMappingFound &&
  readinessLevelsFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  context_fixture_spec_found: contextFixtureSpecFound,
  fixture_status_found: fixtureStatusFound,
  fixture_design_principles_found: fixtureDesignPrinciplesFound,
  core_context_fixture_scenarios_found: coreContextFixtureScenariosFound,
  required_fixture_object_coverage_found: requiredFixtureObjectCoverageFound,
  expected_context_labels_found: expectedContextLabelsFound,
  anti_leakage_validation_cases_found: antiLeakageValidationCasesFound,
  existing_foundation_mapping_found: existingFoundationMappingFound,
  readiness_levels_found: readinessLevelsFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_write_allowed: false,
  context_fixture_implementation_allowed: false,
  context_persistence_allowed: false,
  dataset_persistence_allowed: false,
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
    context_fixture_implemented: false,
    context_persisted: false,
    context_persistence_changed: false,
    dataset_persisted: false,
    dataset_persistence_changed: false,
    schema_changed: false,
    migration_created: false,
    migration_altered: false,
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
    visible_recommendations_changed: false,
    outcome_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  recommended_next_step: passed
    ? "action_343_pattern_insight_static_type_spec"
    : "fix_intelligence_context_static_fixture_spec_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
