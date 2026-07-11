#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const specPath = "docs/action-330-confidence-calibration-static-metric-spec.md";

const confidenceInputs = [
  "numeric_confidence",
  "confidence_label",
  "setup_family",
  "trading_window",
  "direction",
  "planned_entry",
  "planned_stop",
  "planned_target",
  "planned_risk",
  "planned_reward",
  "quality_gate_statuses",
  "setup_evidence_components",
  "market_session_context",
  "data_freshness_status",
  "snapshot_id",
  "recommendation_id",
];

const outcomeInputs = [
  "entry_touched",
  "target_hit",
  "stop_hit",
  "no_entry_triggered",
  "open_at_window_end",
  "ambiguous_intrabar_conservative_stop",
  "gross_r_multiple",
  "max_favorable_excursion_r",
  "max_adverse_excursion_r",
  "time_to_entry",
  "time_to_exit",
  "exit_reason",
  "outcome_window",
  "shadow_outcome_available",
];

const calibrationMetrics = [
  "confidence_bucket_hit_rate",
  "confidence_bucket_stop_rate",
  "confidence_bucket_no_entry_rate",
  "confidence_bucket_expectancy_r",
  "confidence_bucket_average_mfe_r",
  "confidence_bucket_average_mae_r",
  "confidence_bucket_overconfidence_gap",
  "confidence_bucket_underconfidence_gap",
  "setup_family_hit_rate",
  "setup_family_expectancy_r",
  "setup_family_failure_mode_rate",
  "window_specific_hit_rate",
  "window_specific_expectancy_r",
  "calibration_sample_size",
  "calibration_stability_score",
  "ambiguity_rate",
  "invalid_geometry_rate",
  "data_quality_failure_rate",
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

const metricSpecFound = exists(specPath);
const content = metricSpecFound ? read(specPath) : "";

const metricSpecStatusFound = includesAll(content, [
  "confidence_calibration_metric_spec_status: metric_spec_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "confidence calibration metric planning only",
  "not runtime change",
  "deploy readiness",
  "ranking mutation",
  "scanner mutation",
  "threshold mutation",
  "confidence implementation",
]);
const confidenceInputsFound = confidenceInputs.every((input) => content.includes(input));
const outcomeInputsFound = outcomeInputs.every((input) => content.includes(input));
const calibrationMetricsFound = calibrationMetrics.every((metric) =>
  content.includes(metric),
);
const calibrationMetricDetailsFound = includesAll(content, [
  "purpose:",
  "formula idea:",
  "interpretation:",
  "minimum sample size note:",
  "risk of misuse:",
]);
const interpretationRulesFound = includesAll(content, [
  "High confidence should not mean certainty",
  "Very High / Strong should require both strong evidence and historical support",
  "Low confidence can still work but should not dominate the feed",
  "If High confidence underperforms Medium confidence, calibration is suspect",
  "If confidence buckets have small samples, no adjustment should be made",
  "If no-entry rate is high, entries may be too aggressive or triggers unrealistic",
  "If stop rate is high, setup/risk geometry may be weak",
  "If open-at-window-end is common, target/stop expectations may be poorly calibrated",
]);
const minimumSampleGuidanceFound = includesAll(content, [
  "less than 20 samples: diagnostic only",
  "20-50 samples: weak signal",
  "50-100 samples: moderate signal",
  "100+ samples: stronger calibration signal",
  "setup/window-specific conclusions need separate sample thresholds",
]);
const blockedWorkFound = includesAll(content, [
  "no automatic confidence adjustment yet",
  "no scanner/ranking mutation yet",
  "no threshold changes yet",
  "no confidence threshold changes yet",
  "no production replay route yet",
  "no Supabase synthetic outcome writes yet",
  "no provider refetch path yet",
  "no deploy",
  "no main push",
  "Scanner/ranking mutation is blocked",
  "Confidence threshold changes are blocked",
]);
const nextActionsFound = includesAll(content, [
  "Action 331: Recommendation Card Content Hierarchy Spec",
  "Action 332: History/Statistics Learning Surface Spec",
  "Action 333: Execution Agent Boundary Refresh",
  "Action 334: First Static Gate Helper Extraction Plan",
  "Action 335: Confidence Calibration Static Fixture Plan",
]);
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize",
  "production deploy",
  "main push",
  "runtime route",
  "proxy or middleware",
  "scanner changes",
  "ranking changes",
  "threshold changes",
  "confidence threshold changes",
  "provider calls",
  "Supabase reads",
  "Supabase writes",
  "replay execution",
  "synthetic outcome persistence",
  "recommendation mutation",
  "live ranking mutation",
]);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  metricSpecFound &&
  metricSpecStatusFound &&
  confidenceInputsFound &&
  outcomeInputsFound &&
  calibrationMetricsFound &&
  calibrationMetricDetailsFound &&
  interpretationRulesFound &&
  minimumSampleGuidanceFound &&
  blockedWorkFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  metric_spec_found: metricSpecFound,
  metric_spec_status_found: metricSpecStatusFound,
  confidence_inputs_found: confidenceInputsFound,
  confidence_inputs_present: confidenceInputs.filter((input) =>
    content.includes(input),
  ),
  confidence_inputs_missing: confidenceInputs.filter(
    (input) => !content.includes(input),
  ),
  outcome_inputs_found: outcomeInputsFound,
  outcome_inputs_present: outcomeInputs.filter((input) => content.includes(input)),
  outcome_inputs_missing: outcomeInputs.filter((input) => !content.includes(input)),
  calibration_metrics_found: calibrationMetricsFound,
  calibration_metrics_present: calibrationMetrics.filter((metric) =>
    content.includes(metric),
  ),
  calibration_metrics_missing: calibrationMetrics.filter(
    (metric) => !content.includes(metric),
  ),
  interpretation_rules_found: interpretationRulesFound,
  minimum_sample_guidance_found: minimumSampleGuidanceFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  proxy_changes_allowed: false,
  scanner_ranking_mutation_allowed: false,
  confidence_threshold_mutation_allowed: false,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendation_rows_mutated: false,
    confidence_thresholds_mutated: false,
    confidence_implementation_added: false,
  },
  recommended_next_step: passed
    ? "continue_to_recommendation_card_content_hierarchy_spec"
    : "fix_confidence_calibration_metric_spec_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
