#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-343-pattern-insight-static-type-spec.md";

const coreInsightFields = [
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

const patternDimensions = [
  "setup_family",
  "confidence_bucket",
  "trading_window",
  "market_regime",
  "sector",
  "industry",
  "relative_strength_profile",
  "catalyst_type",
  "catalyst_freshness",
  "volume_liquidity_profile",
  "risk_reward_profile",
  "entry_quality_profile",
  "stop_quality_profile",
  "target_realism_profile",
  "data_quality_profile",
];

const outcomeSummaryFields = [
  "target_hit_rate",
  "stop_hit_rate",
  "no_entry_rate",
  "open_at_window_end_rate",
  "ambiguous_intrabar_rate",
  "average_gross_r_multiple",
  "median_gross_r_multiple",
  "expectancy_r",
  "max_favorable_excursion_avg_r",
  "max_adverse_excursion_avg_r",
  "sample_size",
  "outcome_quality",
];

const confidenceSummaryFields = [
  "confidence_bucket",
  "confidence_bucket_hit_rate",
  "confidence_bucket_expectancy_r",
  "overconfidence_gap",
  "underconfidence_gap",
  "calibration_stability_score",
  "confidence_sample_size",
  "confidence_interpretation",
];

const evidenceStrengthLevels = [
  "insufficient_sample",
  "weak_signal",
  "moderate_signal",
  "strong_signal",
  "validated_signal",
  "under 20: insufficient_sample",
  "20-50: weak_signal",
  "50-100: moderate_signal",
  "100+: potentially strong if stable",
  "validation requires repeatability across windows/regimes",
];

const overfittingRiskLevels = [
  "high",
  "medium",
  "low",
  "unknown",
  "Small samples increase risk",
  "Too many dimensions increase risk",
  "Single-symbol insights are risky",
  "Catalyst/news-driven insights can be unstable",
  "Regime-specific insights need separate validation",
];

const recommendedActionTypes = [
  "observe",
  "investigate",
  "downgrade_candidate_research",
  "upgrade_candidate_research",
  "adjust_confidence_research",
  "block_until_more_data",
  "candidate_for_shadow_calibration",
  "candidate_for_future_experiment",
  "recommended_action_type must not directly mutate ranking/scanner",
  "mutation_allowed must default false",
];

const reviewStatuses = [
  "unreviewed",
  "reviewed_no_action",
  "research_candidate",
  "shadow_calibration_candidate",
  "rejected_overfit_risk",
  "approved_for_future_experiment",
];

const antiLeakageRequirements = [
  "insight must be generated only from audited learning rows",
  "snapshot-time features must remain separated from outcomes",
  "post-outcome context must be labeled",
  "news/catalyst availability must be snapshot-time safe",
  "data quality exclusions must be explicit",
  "scanner/ranking mutation remains blocked",
];

const existingFoundationMapping = [
  "Learning Outcome Dataset Design",
  "Intelligence Context Schema Draft",
  "Learning Dataset Static Fixture Spec",
  "Intelligence Context Static Fixture Spec",
  "Static replay result model",
  "Static replay summary/report pipeline",
  "History/Statistics foundations",
];

const readinessLevels = [
  "PI0: insight shape undefined",
  "PI1: insight fields documented",
  "PI2: static type spec exists",
  "PI3: static fixture examples designed",
  "PI4: local type implementation ready",
  "PI5: local fixture tests pass",
  "PI6: offline report integration ready",
  "PI7: shadow calibration research-ready",
  "PI8: controlled experiment-ready",
  "PI9: trusted pattern insight signal",
];

const blockedWork = [
  "no type implementation yet",
  "no pattern insight persistence yet",
  "no Supabase writes yet",
  "no runtime routes yet",
  "no provider calls yet",
  "no news API calls yet",
  "no replay execution yet",
  "no scanner/ranking mutation yet",
  "no confidence threshold changes yet",
  "no deploy",
  "no main push",
];

const nextActions = [
  "Action 344: Runtime Ping-Only Route Implementation Plan",
  "Action 345: First Tiny Provider Capacity Experiment Plan",
  "Action 346: Existing Schema Compatibility Matrix",
  "Action 347: Learning Dataset Static Fixture Implementation Plan",
  "Action 348: Intelligence Context Static Fixture Implementation Plan",
  "Action 349: Pattern Insight Static Fixture Spec",
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

const patternInsightTypeSpecFound = exists(docPath);
const content = patternInsightTypeSpecFound ? read(docPath) : "";

const typeStatusFound = includesAll(content, [
  "pattern_insight_static_type_status: type_spec_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "pattern insight type/spec planning only",
  "not type implementation",
  "persistence",
  "runtime implementation",
  "provider integration",
  "news integration",
  "Supabase persistence",
  "scanner mutation",
  "ranking mutation",
  "confidence threshold mutation",
  "deploy readiness",
  "main-push authorization",
]);
const patternInsightUnitFound = includesAll(content, [
  "One pattern insight represents one observed pattern across a segment of learning rows",
  "segment definition",
  "sample size",
  "outcome metrics",
  "confidence metrics",
  "evidence strength",
  "recommended action type",
  "mutation_allowed: false",
]);
const coreInsightFieldsFound = coreInsightFields.every((item) => content.includes(item));
const patternDimensionsFound = patternDimensions.every((item) => content.includes(item));
const outcomeSummaryFieldsFound = outcomeSummaryFields.every((item) =>
  content.includes(item),
);
const confidenceSummaryFieldsFound = confidenceSummaryFields.every((item) =>
  content.includes(item),
);
const evidenceStrengthLevelsFound = evidenceStrengthLevels.every((item) =>
  content.includes(item),
);
const overfittingRiskLevelsFound = overfittingRiskLevels.every((item) =>
  content.includes(item),
);
const recommendedActionTypesFound = recommendedActionTypes.every((item) =>
  content.includes(item),
);
const reviewStatusFound = reviewStatuses.every((item) => content.includes(item));
const antiLeakageRequirementsFound = antiLeakageRequirements.every((item) =>
  content.includes(item),
);
const existingFoundationMappingFound = existingFoundationMapping.every((item) =>
  content.includes(item),
);
const readinessLevelsFound =
  readinessLevels.every((item) => content.includes(item)) &&
  content.includes("Current pattern insight type is not yet PI9");
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((item) => content.includes(item));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize type implementation",
  "pattern insight persistence",
  "deploys",
  "main pushes",
  "runtime route changes",
  "provider calls",
  "news API calls",
  "Supabase remote reads",
  "Supabase reads",
  "Supabase writes",
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  patternInsightTypeSpecFound &&
  typeStatusFound &&
  patternInsightUnitFound &&
  coreInsightFieldsFound &&
  patternDimensionsFound &&
  outcomeSummaryFieldsFound &&
  confidenceSummaryFieldsFound &&
  evidenceStrengthLevelsFound &&
  overfittingRiskLevelsFound &&
  recommendedActionTypesFound &&
  reviewStatusFound &&
  antiLeakageRequirementsFound &&
  existingFoundationMappingFound &&
  readinessLevelsFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  pattern_insight_type_spec_found: patternInsightTypeSpecFound,
  type_status_found: typeStatusFound,
  pattern_insight_unit_found: patternInsightUnitFound,
  core_insight_fields_found: coreInsightFieldsFound,
  pattern_dimensions_found: patternDimensionsFound,
  outcome_summary_fields_found: outcomeSummaryFieldsFound,
  confidence_summary_fields_found: confidenceSummaryFieldsFound,
  evidence_strength_levels_found: evidenceStrengthLevelsFound,
  overfitting_risk_levels_found: overfittingRiskLevelsFound,
  recommended_action_types_found: recommendedActionTypesFound,
  review_status_found: reviewStatusFound,
  anti_leakage_requirements_found: antiLeakageRequirementsFound,
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
  pattern_insight_persistence_allowed: false,
  type_implementation_allowed: false,
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
    pattern_insight_persisted: false,
    pattern_insight_persistence_changed: false,
    type_implemented: false,
    type_implementation_changed: false,
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
  recommended_next_step: "action_344_runtime_ping_only_route_implementation_plan",
};

console.log(JSON.stringify(result, null, 2));

if (!passed) {
  process.exitCode = 1;
}
