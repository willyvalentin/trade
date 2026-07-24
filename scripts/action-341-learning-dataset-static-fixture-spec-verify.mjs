#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-341-learning-dataset-static-fixture-spec.md";

const fixtureDesignPrinciples = [
  "deterministic timestamps",
  ["no ", "Date", ".now"].join(""),
  "no random IDs",
  "no provider calls",
  "no Supabase reads/writes",
  "no news API calls",
  "snapshot-time inputs separated from outcomes",
  "context available_at_snapshot_time must be explicit",
  "missing context must be explicit",
  "each fixture has expected learning labels",
  "no scanner/ranking mutation",
  "no confidence threshold mutation",
];

const coreFixtureScenarios = [
  "clean_target_hit_momentum_continuation",
  "stop_hit_false_breakout",
  "no_entry_overextended_setup",
  "open_at_window_end_slow_grind",
  "catalyst_backed_target_hit",
  "catalyst_false_spike_stop_hit",
  "strong_market_weak_stock_filter_candidate",
  "weak_market_strong_stock_relative_strength",
  "missing_context_learning_limited",
  "ambiguous_intrabar_conservative_stop",
];

const fixtureFieldsRequired = [
  "identity",
  "trade_plan",
  "setup_and_confidence",
  "quality_gate_summary",
  "market_context",
  "sector_industry_context",
  "relative_strength_context",
  "news_catalyst_context",
  "calendar_event_context",
  "data_provenance",
  "outcome_fields",
  "derived_learning_fields",
  "anti_leakage_status",
  "learning_eligibility_status",
];

const expectedLabels = [
  "setup_success_label",
  "confidence_bucket",
  "confidence_calibration_error",
  "overconfidence_flag",
  "underconfidence_flag",
  "regime_fit_label",
  "sector_support_label",
  "catalyst_support_label",
  "relative_strength_support_label",
  "entry_quality_label",
  "stop_quality_label",
  "target_realism_label",
  "recommendation_should_have_been_filtered",
  "learning_eligibility_status",
  "excluded_from_learning_reason",
];

const antiLeakageValidationCases = [
  "news after snapshot time must not be used as snapshot-time catalyst",
  "end-of-day regime must not be used as entry-time regime unless marked post_outcome",
  "outcome fields must not appear in snapshot-time fields",
  "future relative strength must not appear in snapshot-time context",
  "enrichment_version must be auditable",
];

const existingFoundationMapping = [
  "existing recommendation snapshots",
  "static replay result model",
  "static replay simulation engine",
  "static summary/report/golden snapshots",
  "History/Statistics foundations",
  "future learning outcome dataset",
  "Prefer adapters/mappers over parallel architecture",
  "Do not duplicate existing result/outcome concepts",
];

const readinessLevels = [
  "LF0: fixture scenarios undefined",
  "LF1: fixture scenario list defined",
  "LF2: fixture field groups defined",
  "LF3: expected labels defined",
  "LF4: static fixture implementation ready",
  "LF5: fixture tests pass locally",
  "LF6: mapped to existing snapshot/replay objects",
  "LF7: ready for local mapper implementation",
  "LF8: ready for read-only runtime dataset generation later",
];

const blockedWork = [
  "no fixture implementation yet if not explicitly planned",
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
  "Action 342: Intelligence Context Static Fixture Spec",
  "Action 343: Pattern Insight Static Type Spec",
  "Action 344: Runtime Ping-Only Route Implementation Plan",
  "Action 345: First Tiny Provider Capacity Experiment Plan",
  "Action 346: Existing Schema Compatibility Matrix",
  "Action 347: Learning Dataset Static Fixture Implementation Plan",
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

const fixtureSpecFound = exists(docPath);
const content = fixtureSpecFound ? read(docPath) : "";

const fixtureStatusFound = includesAll(content, [
  "learning_dataset_static_fixture_status: fixture_spec_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "learning dataset fixture planning only",
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
const coreFixtureScenariosFound = coreFixtureScenarios.every((item) =>
  content.includes(item),
);
const fixtureFieldsRequiredFound = fixtureFieldsRequired.every((item) =>
  content.includes(item),
);
const expectedLabelsFound = expectedLabels.every((item) => content.includes(item));
const antiLeakageValidationCasesFound = antiLeakageValidationCases.every((item) =>
  content.includes(item),
);
const existingFoundationMappingFound = existingFoundationMapping.every((item) =>
  content.includes(item),
);
const readinessLevelsFound =
  readinessLevels.every((item) => content.includes(item)) &&
  content.includes("Current learning dataset fixtures are not yet LF8");
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize fixture implementation",
  "deploys",
  "main pushes",
  "runtime route changes",
  "provider calls",
  "news API calls",
  "Supabase remote reads",
  "Supabase reads",
  "Supabase writes",
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
  fixtureSpecFound &&
  fixtureStatusFound &&
  fixtureDesignPrinciplesFound &&
  coreFixtureScenariosFound &&
  fixtureFieldsRequiredFound &&
  expectedLabelsFound &&
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
  fixture_spec_found: fixtureSpecFound,
  fixture_status_found: fixtureStatusFound,
  fixture_design_principles_found: fixtureDesignPrinciplesFound,
  core_fixture_scenarios_found: coreFixtureScenariosFound,
  fixture_fields_required_found: fixtureFieldsRequiredFound,
  expected_labels_found: expectedLabelsFound,
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
  dataset_persistence_allowed: false,
  fixture_implementation_allowed: false,
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
    dataset_persisted: false,
    dataset_persistence_changed: false,
    fixture_implemented: false,
    fixture_persisted: false,
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
    ? "action_342_intelligence_context_static_fixture_spec"
    : "fix_learning_dataset_static_fixture_spec_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
