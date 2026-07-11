#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-335-learning-outcome-dataset-design.md";

const snapshotInputGroups = [
  "Identity",
  "Trade Plan",
  "Setup And Confidence",
  "Market Context",
  "Sector / Industry Context",
  "Relative Strength",
  "News / Catalyst Context",
  "Data Provenance",
];

const outcomeFields = [
  "outcome_window",
  "entry_touched",
  "entry_timestamp",
  "target_hit",
  "stop_hit",
  "target_timestamp",
  "stop_timestamp",
  "target_or_stop_first",
  "no_entry_triggered",
  "open_at_window_end",
  "ambiguous_intrabar_conservative_stop",
  "exit_reason",
  "exit_timestamp",
  "gross_price_move",
  "gross_r_multiple",
  "max_favorable_excursion_r",
  "max_adverse_excursion_r",
  "time_to_entry",
  "time_to_exit",
  "final_close_relative_to_entry",
  "outcome_available",
  "outcome_quality",
];

const derivedLearningFields = [
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

const readinessLevels = [
  "L0: dataset undefined",
  "L1: dataset fields defined",
  "L2: static design exists",
  "L3: static fixture examples exist",
  "L4: snapshot-to-outcome mapping verified locally",
  "L5: read-only runtime dataset generation verified",
  "L6: persistence/readback verified",
  "L7: historical sample validated",
  "L8: calibration research-ready",
  "L9: trusted intelligence dataset",
];

const existingFoundations = [
  "recommendation snapshots",
  "historical candle persistence",
  "replay dry-run/static replay foundation",
  "History/Statistics foundations",
  "confidence calibration planning",
  "quality gate planning",
];

const doNotDuplicateRules = [
  "do not create a parallel snapshot system",
  "do not create duplicate outcome models if static replay result model can be extended/mapped",
  "do not create duplicate History/Statistics concepts",
  "do not create a separate unlinked learning dataset",
  "prefer mappings/adapters over parallel architecture",
  "keep backward compatibility with existing recommendation and outcome records",
];

const nextActions = [
  "Action 336: Intelligence Context Schema Draft",
  "Action 337: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 339: Historical Backfill Cost and Provider Capacity Plan",
  "Action 340: Snapshot Field Inventory Against Existing Schema",
  "Action 341: Learning Dataset Static Fixture Spec",
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

const datasetDesignFound = exists(docPath);
const content = datasetDesignFound ? read(docPath) : "";

const designStatusFound = includesAll(content, [
  "learning_outcome_dataset_design_status: design_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "dataset design only",
  "not runtime implementation",
  "provider integration",
  "news integration",
  "Supabase persistence",
  "scanner mutation",
  "ranking mutation",
  "deploy readiness",
  "main-push authorization",
]);
const unitOfAnalysisFound = includesAll(content, [
  "one recommendation snapshot evaluated over a defined outcome window",
  "immutable once generated",
  "explicit audited enrichment versions",
  "avoid hindsight leakage",
  "separating snapshot-time inputs from post-snapshot outcomes",
]);
const snapshotTimeInputsFound =
  content.includes("Snapshot-Time Input Fields") &&
  snapshotInputGroups.every((group) => content.includes(group)) &&
  includesAll(content, [
    "dataset_row_id",
    "snapshot_id",
    "recommendation_id",
    "ticker",
    "direction",
    "entry",
    "stop",
    "target",
    "setup_family",
    "numeric_confidence",
    "quality_gate_summary",
    "reason_text",
  ]);
const outcomeFieldsFound =
  content.includes("Outcome Fields") &&
  outcomeFields.every((field) => content.includes(field));
const derivedLearningFieldsFound =
  content.includes("Derived Learning Fields") &&
  derivedLearningFields.every((field) => content.includes(field));
const antiLeakageRulesFound = includesAll(content, [
  "snapshot-time inputs must not include post-snapshot outcomes",
  "news/catalyst context must use only information available at snapshot time",
  "market regime labels must distinguish snapshot-time vs end-of-day labels",
  "outcome fields must not feed back into original snapshot",
  "calibration updates must happen only after audited dataset generation",
  "scanner/ranking mutation remains blocked",
]);
const readinessLevelsFound = readinessLevels.every((level) =>
  content.includes(level),
);
const existingFoundationMappingFound =
  content.includes("Existing Foundation Mapping") &&
  existingFoundations.every((foundation) => content.includes(foundation)) &&
  includesAll(content, [
    "How it contributes",
    "What is still missing",
    "Additive next step",
  ]);
const doNotDuplicateRulesFound = doNotDuplicateRules.every((rule) =>
  content.includes(rule),
);
const blockedWorkFound = includesAll(content, [
  "no dataset persistence yet",
  "no Supabase writes yet",
  "no runtime routes yet",
  "no provider calls yet",
  "no news API calls yet",
  "no replay execution yet",
  "no scanner/ranking mutation yet",
  "no confidence threshold changes yet",
  "no deploy",
  "no main push",
]);
const nextActionsFound = nextActions.every((action) => content.includes(action));
const marketContextFound = includesAll(content, [
  "Market Context",
  "SPY_context",
  "QQQ_context",
  "IWM_context",
  "market_regime",
  "volatility_regime",
  "trend_day_or_chop_day",
  "risk_on_risk_off_context",
]);
const sectorIndustryContextFound = includesAll(content, [
  "Sector / Industry Context",
  "sector",
  "industry",
  "peer_group",
  "sector_etf",
  "sector_relative_strength",
  "peer_relative_strength",
]);
const relativeStrengthContextFound = includesAll(content, [
  "Relative Strength",
  "stock_vs_SPY",
  "stock_vs_QQQ",
  "stock_vs_sector",
  "stock_vs_peer_group",
  "intraday_relative_strength",
  "multi_day_relative_strength",
]);
const newsCatalystContextFound = includesAll(content, [
  "News / Catalyst Context",
  "catalyst_detected",
  "catalyst_type",
  "catalyst_timestamp",
  "catalyst_freshness",
  "headline_summary",
  "earnings_or_guidance_context",
  "analyst_or_regulatory_context",
  "news_volume_context",
]);
const currentNotL9Found = content.includes(
  "Current learning outcome dataset is not yet L9",
);
const notDeployReadinessFound = includesAll(content, [
  "dataset design only",
  "deploy readiness",
  "does not authorize deploys",
]);
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize deploys",
  "main pushes",
  "runtime route changes",
  "provider calls",
  "news API calls",
  "Supabase reads",
  "Supabase writes",
  "dataset persistence",
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  datasetDesignFound &&
  designStatusFound &&
  unitOfAnalysisFound &&
  snapshotTimeInputsFound &&
  outcomeFieldsFound &&
  derivedLearningFieldsFound &&
  antiLeakageRulesFound &&
  readinessLevelsFound &&
  existingFoundationMappingFound &&
  doNotDuplicateRulesFound &&
  blockedWorkFound &&
  nextActionsFound &&
  marketContextFound &&
  sectorIndustryContextFound &&
  relativeStrengthContextFound &&
  newsCatalystContextFound &&
  currentNotL9Found &&
  notDeployReadinessFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  dataset_design_found: datasetDesignFound,
  design_status_found: designStatusFound,
  unit_of_analysis_found: unitOfAnalysisFound,
  snapshot_time_inputs_found: snapshotTimeInputsFound,
  outcome_fields_found: outcomeFieldsFound,
  outcome_fields_missing: outcomeFields.filter((field) => !content.includes(field)),
  derived_learning_fields_found: derivedLearningFieldsFound,
  derived_learning_fields_missing: derivedLearningFields.filter(
    (field) => !content.includes(field),
  ),
  anti_leakage_rules_found: antiLeakageRulesFound,
  readiness_levels_found: readinessLevelsFound,
  existing_foundation_mapping_found: existingFoundationMappingFound,
  do_not_duplicate_rules_found: doNotDuplicateRulesFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  market_context_found: marketContextFound,
  sector_industry_context_found: sectorIndustryContextFound,
  relative_strength_context_found: relativeStrengthContextFound,
  news_catalyst_context_found: newsCatalystContextFound,
  current_dataset_not_l9_found: currentNotL9Found,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_write_allowed: false,
  dataset_persistence_allowed: false,
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
    dataset_persisted: false,
    dataset_persistence_changed: false,
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
    ? "action_336_intelligence_context_schema_draft"
    : "fix_learning_outcome_dataset_design_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
