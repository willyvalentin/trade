#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-337-pattern-discovery-and-confidence-calibration-roadmap.md";

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
  "volume/liquidity_profile",
  "risk_reward_profile",
  "entry_quality_profile",
  "stop_quality_profile",
  "target_realism_profile",
  "data_quality_profile",
];

const outcomeMetrics = [
  "target_hit_rate",
  "stop_hit_rate",
  "no_entry_rate",
  "open_at_window_end_rate",
  "ambiguous_intrabar_rate",
  "average_gross_r_multiple",
  "median_gross_r_multiple",
  "max_favorable_excursion_r",
  "max_adverse_excursion_r",
  "time_to_entry",
  "time_to_exit",
  "expectancy_by_group",
  "sample_size",
  "stability_score",
  "overconfidence_gap",
  "underconfidence_gap",
];

const calibrationQuestions = [
  "Do High confidence recommendations outperform Medium?",
  "Are Very High recommendations rare and actually superior?",
  "Are Low confidence recommendations too common?",
  "Which setup families are overconfident?",
  "Which regimes make confidence unreliable?",
  "Which sectors produce false breakouts?",
  "Which catalyst types improve expectancy?",
  "Which trading windows have the best/worst calibration?",
  "Are targets too ambitious?",
  "Are stops too tight?",
  "Are entries too early or too late?",
];

const discoveryStages = [
  "Stage 0: Static roadmap only",
  "Stage 1: Static fixture exploration",
  "Stage 2: Offline historical dataset analysis",
  "Stage 3: Read-only dashboards/reports",
  "Stage 4: Calibration research candidates",
  "Stage 5: Shadow calibration",
  "Stage 6: Controlled recommendation engine experiment",
  "Stage 7: Production-grade calibration",
];

const minimumEvidenceRules = [
  "no pattern conclusion with tiny sample sizes",
  "less than 20 samples: diagnostic only",
  "20-50: weak signal",
  "50-100: moderate signal",
  "100+: stronger signal",
  "context-specific patterns require separate sample thresholds",
  "never mutate ranking from one-off examples",
  "ambiguous/noisy data must be excluded or downweighted",
  "anti-leakage rules must pass",
];

const insightFields = [
  "insight_id",
  "pattern_dimension",
  "segment_key",
  "sample_size",
  "outcome_summary",
  "confidence_summary",
  "effect_direction",
  "evidence_strength",
  "risk_of_overfitting",
  "recommended_action_type: observe | investigate | downgrade_candidate | upgrade_candidate | adjust_confidence_research | block_until_more_data",
  "mutation_allowed: false by default",
];

const blockedWork = [
  "no pattern persistence yet",
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
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 339: Historical Backfill Cost and Provider Capacity Plan",
  "Action 340: Snapshot Field Inventory Against Existing Schema",
  "Action 341: Learning Dataset Static Fixture Spec",
  "Action 342: Intelligence Context Static Fixture Spec",
  "Action 343: Pattern Insight Static Type Spec",
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

const patternRoadmapFound = exists(docPath);
const content = patternRoadmapFound ? read(docPath) : "";

const roadmapStatusFound = includesAll(content, [
  "pattern_discovery_confidence_calibration_status: roadmap_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "roadmap planning only",
  "not runtime implementation",
  "provider integration",
  "news integration",
  "Supabase persistence",
  "scanner mutation",
  "ranking mutation",
  "confidence threshold mutation",
  "deploy readiness",
  "main-push authorization",
]);
const patternDimensionsFound = patternDimensions.every((dimension) =>
  content.includes(dimension),
);
const outcomeMetricsFound = outcomeMetrics.every((metric) => content.includes(metric));
const calibrationQuestionsFound = calibrationQuestions.every((question) =>
  content.includes(question),
);
const discoveryStagesFound = discoveryStages.every((stage) => content.includes(stage));
const minimumEvidenceRulesFound = minimumEvidenceRules.every((rule) =>
  content.includes(rule),
);
const patternInsightOutputFormatFound = insightFields.every((field) =>
  content.includes(field),
);
const blockedWorkFound = blockedWork.every((item) => content.includes(item));
const nextActionsFound = nextActions.every((action) => content.includes(action));
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize deploys",
  "main pushes",
  "runtime route changes",
  "provider calls",
  "news API calls",
  "Supabase reads",
  "Supabase writes",
  "pattern persistence",
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  patternRoadmapFound &&
  roadmapStatusFound &&
  patternDimensionsFound &&
  outcomeMetricsFound &&
  calibrationQuestionsFound &&
  discoveryStagesFound &&
  minimumEvidenceRulesFound &&
  patternInsightOutputFormatFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  pattern_roadmap_found: patternRoadmapFound,
  roadmap_status_found: roadmapStatusFound,
  pattern_dimensions_found: patternDimensionsFound,
  outcome_metrics_found: outcomeMetricsFound,
  calibration_questions_found: calibrationQuestionsFound,
  discovery_stages_found: discoveryStagesFound,
  minimum_evidence_rules_found: minimumEvidenceRulesFound,
  pattern_insight_output_format_found: patternInsightOutputFormatFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_write_allowed: false,
  pattern_persistence_allowed: false,
  scanner_ranking_mutation_allowed: false,
  confidence_threshold_mutation_allowed: false,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    news_api_call_executed: false,
    news_api_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    pattern_persisted: false,
    pattern_persistence_changed: false,
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
    visible_recommendations_changed: false,
    outcome_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  recommended_next_step: passed
    ? "action_338_runtime_ping_only_rollout_checklist"
    : "fix_pattern_discovery_roadmap_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
