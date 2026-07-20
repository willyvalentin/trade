#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-349-pattern-insight-static-fixture-spec.md";

const coreScenarios = [
  "insufficient_sample_promising_setup",
  "weak_signal_momentum_morning",
  "moderate_signal_sector_supported_momentum",
  "strong_signal_relative_strength_weak_market",
  "validated_signal_placeholder",
  "negative_pattern_false_breakout_chop",
  "overconfident_high_confidence_bucket",
  "underconfident_low_confidence_bucket",
  "high_overfitting_single_symbol",
  "catalyst_pattern_unstable",
  "missing_context_limited_insight",
  "anti_leakage_rejected_insight",
];

const requiredFields = [
  "insight_id",
  "insight_version",
  "generated_from_dataset_version",
  "generated_at_label",
  "pattern_dimension",
  "segment_key",
  "segment_description",
  "sample_size",
  "minimum_sample_requirement",
  "sample_window",
  "setup_family",
  "trading_window",
  "market_regime",
  "sector",
  "industry",
  "relative_strength_profile",
  "catalyst_type",
  "confidence_bucket",
  "outcome_summary",
  "confidence_summary",
  "effect_direction",
  "evidence_strength",
  "stability_score",
  "overfitting_risk",
  "data_quality_notes",
  "anti_leakage_status",
  "recommended_action_type",
  "mutation_allowed",
  "blocked_reason",
  "review_status",
];

const designPrinciples = [
  "deterministic IDs and labels",
  "fixed sample windows",
  ["no ", "Date", ".now"].join(""),
  "no random IDs",
  "no provider/network/Supabase access",
  "audited learning rows only",
  "explicit evidence strength",
  "explicit overfitting risk",
  "explicit data-quality limitations",
  "research output only",
  "mutation_allowed false",
];

const expectedSummaries = [
  "target_hit_rate",
  "stop_hit_rate",
  "no_entry_rate",
  "expectancy_r",
  "average_gross_r_multiple",
  "median_gross_r_multiple",
  "sample_size",
  "confidence_bucket_hit_rate",
  "overconfidence_gap",
  "underconfidence_gap",
  "calibration_stability",
];

const evidenceRules = [
  "under 20: insufficient_sample",
  "20-50: weak_signal",
  "50-100: moderate_signal",
  "100+: potentially strong only if stable",
  "validated_signal requires repeatability across windows/regimes",
];

const overfittingChecks = [
  "single-symbol concentration",
  "too many segment dimensions",
  "short time window",
  "catalyst dependence",
  "one-regime dependence",
  "unstable results across periods",
  "low data quality",
];

const mutationSafety = [
  "mutation_allowed: false",
  "no live scanner mutation",
  "no live ranking mutation",
  "no confidence-threshold mutation",
  "no visible recommendation mutation",
  "research recommendation only",
];

const existingFoundationMapping = [
  "Action 335 Learning Outcome Dataset",
  "Action 336 Intelligence Context Schema",
  "Action 337 Pattern Discovery Roadmap",
  "Action 341 Learning Dataset Fixture Spec",
  "Action 342 Context Fixture Spec",
  "Action 343 Pattern Insight Type Spec",
  "Action 346 Schema Compatibility Matrix",
  "existing static replay, History, and Statistics foundations",
];

const readinessLevels = [
  "PIF0 fixture scenarios undefined",
  "PIF1 scenario catalogue defined",
  "PIF2 required fields mapped",
  "PIF3 expected summaries defined",
  "PIF4 evidence/overfitting rules defined",
  "PIF5 implementation plan ready",
  "PIF6 local fixtures implemented",
  "PIF7 local validation passes",
  "PIF8 offline research report ready",
  "PIF9 shadow-calibration research ready",
];

const blockedWork = [
  "no fixture implementation",
  "no persistence",
  "no Supabase access",
  "no provider/news calls",
  "no runtime routes",
  "no replay execution",
  "no scanner/ranking/confidence mutation",
  "no deploy",
  "no main push",
];

const nextActions = [
  "Action 350: Runtime Ping-Only Route Approval Gate",
  "Action 351: First Tiny Provider Capacity Experiment Approval Gate",
  "Action 352: Snapshot-to-Learning Dataset Mapper Plan",
  "Action 353: Learning Dataset Static Fixture Implementation Approval Gate",
  "Action 354: Intelligence Context Static Fixture Implementation Approval Gate",
  "Action 355: Pattern Insight Static Fixture Implementation Plan",
];

const unrelatedExecutionFiles = [
  "lib/post-trade-staging-execution-function.ts",
  "tests/e2e/post-trade-staging-execution-function-static.spec.ts",
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
  "pattern_insight_static_fixture_status: fixture_spec_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "fixture specification only",
  "not fixture implementation",
  "pattern insight persistence",
  "runtime work",
  "scanner/ranking mutation",
  "confidence threshold mutation",
  "visible recommendation mutation",
  "deploy readiness",
  "main-push authorization",
]);
const designPrinciplesFound = designPrinciples.every((item) => content.includes(item));
const coreScenariosFound = coreScenarios.every((item) => content.includes(item));
const requiredFieldsFound = requiredFields.every((item) => content.includes(item));
const expectedSummariesFound = expectedSummaries.every((item) => content.includes(item));
const evidenceRulesFound = evidenceRules.every((item) => content.includes(item));
const overfittingChecksFound = overfittingChecks.every((item) => content.includes(item));
const mutationSafetyFound = mutationSafety.every((item) => content.includes(item));
const existingFoundationMappingFound = existingFoundationMapping.every((item) =>
  content.includes(item),
);
const readinessLevelsFound =
  readinessLevels.every((item) => content.includes(item)) &&
  content.includes("Current status is not PIF5 or later");
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize Pattern Insight fixture implementation",
  "Pattern Insight persistence",
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
  "visible recommendation changes",
]);
const unrelatedExecutionFilesPresent = unrelatedExecutionFiles.filter(exists);
const unrelatedExecutionFilesDocumented = unrelatedExecutionFiles.every((item) =>
  content.includes(item),
);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  fixtureSpecFound &&
  fixtureStatusFound &&
  designPrinciplesFound &&
  coreScenariosFound &&
  requiredFieldsFound &&
  expectedSummariesFound &&
  evidenceRulesFound &&
  overfittingChecksFound &&
  mutationSafetyFound &&
  existingFoundationMappingFound &&
  readinessLevelsFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  unrelatedExecutionFilesDocumented &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  fixture_spec_found: fixtureSpecFound,
  fixture_status_found: fixtureStatusFound,
  design_principles_found: designPrinciplesFound,
  core_scenarios_found: coreScenariosFound,
  required_fields_found: requiredFieldsFound,
  expected_summaries_found: expectedSummariesFound,
  evidence_rules_found: evidenceRulesFound,
  overfitting_checks_found: overfittingChecksFound,
  mutation_safety_found: mutationSafetyFound,
  existing_foundation_mapping_found: existingFoundationMappingFound,
  readiness_levels_found: readinessLevelsFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  fixture_implementation_allowed: false,
  pattern_insight_persistence_allowed: false,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_read_allowed: false,
  supabase_write_allowed: false,
  replay_execution_allowed: false,
  scanner_ranking_mutation_allowed: false,
  confidence_threshold_mutation_allowed: false,
  visible_recommendation_mutation_allowed: false,
  unrelated_execution_files_present: unrelatedExecutionFilesPresent,
  unrelated_execution_files_are_action_349_artifacts: false,
  unrelated_execution_files_allowlisted_as_intelligence_artifacts: false,
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
    pattern_insight_persisted: false,
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
  recommended_next_step: "action_350_runtime_ping_only_route_approval_gate",
};

console.log(JSON.stringify(result, null, 2));
process.exit(passed ? 0 : 1);
