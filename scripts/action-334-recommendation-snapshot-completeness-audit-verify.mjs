#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-334-recommendation-snapshot-completeness-audit.md";

const snapshotDimensions = [
  "Identity",
  "Trade Plan",
  "Setup Classification",
  "Confidence",
  "Quality Gates",
  "Market Context",
  "Sector / Industry Context",
  "Relative Strength",
  "News / Catalyst Context",
  "Scan Context",
  "Data Provenance",
  "Learning Linkage",
];

const completenessLevels = [
  "S0: snapshot concept absent",
  "S1: basic recommendation fields captured",
  "S2: trade plan captured",
  "S3: setup/confidence/gates captured",
  "S4: market/sector/relative-strength context captured",
  "S5: news/catalyst/context captured",
  "S6: provenance and learning linkage captured",
  "S7: complete enough for reliable replay/calibration",
  "S8: production-grade intelligence snapshot",
];

const doNotDuplicateRules = [
  "do not create a parallel snapshot model without auditing existing one",
  "do not duplicate recommendation rows as a separate unlinked snapshot system",
  "do not create duplicate outcome keys",
  "do not create duplicate confidence fields",
  "do not create duplicate setup taxonomy fields",
  "prefer additive fields/mappings/migrations only after audit",
  "keep backward compatibility with existing History/Statistics where possible",
];

const gapDrivenCandidates = [
  "snapshot field inventory against actual schema/types",
  "snapshot completeness checker static helper",
  "snapshot-to-outcome dataset mapping",
  "context enrichment schema draft",
  "confidence component mapping",
  "setup taxonomy mapping",
  "provenance/readback mapping",
  "learning eligibility rules",
];

const nextActions = [
  "Action 335: Learning Outcome Dataset Design",
  "Action 336: Intelligence Context Schema Draft",
  "Action 337: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 339: Historical Backfill Cost and Provider Capacity Plan",
  "Action 340: Snapshot Field Inventory Against Existing Schema",
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

const snapshotAuditFound = exists(docPath);
const content = snapshotAuditFound ? read(docPath) : "";

const auditStatusFound = includesAll(content, [
  "recommendation_snapshot_completeness_status: audit_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "snapshot completeness audit only",
  "not a new snapshot implementation",
  "not runtime implementation",
  "provider integration",
  "news integration",
  "Supabase persistence",
  "scanner mutation",
  "ranking mutation",
  "deploy readiness",
  "main-push authorization",
]);
const purposeFound = includesAll(content, [
  "A recommendation snapshot is the evidence record of what Ture believed at the time",
  "Snapshots allow outcome evaluation without hindsight bias",
  "confidence calibration",
  "setup performance",
  "market regime analysis",
  "sector context",
  "relative strength context",
  "pattern discovery",
  "evaluate both taken and not-taken recommendations",
  "preserve existing snapshot architecture",
  "identify additive gaps only",
]);
const snapshotDimensionsFound = snapshotDimensions.every((dimension) =>
  content.includes(dimension),
);
const existingMissingMatrixFound =
  content.includes("Existing vs Missing Coverage Matrix") &&
  includesAll(content, [
    "Expected fields",
    "Existing coverage",
    "Risk if missing",
    "Additive next step",
  ]);
const snapshotCompletenessLevelsFound = completenessLevels.every((level) =>
  content.includes(level),
);
const doNotDuplicateRulesFound = doNotDuplicateRules.every((rule) =>
  content.includes(rule),
);
const gapDrivenNextBuildCandidatesFound = gapDrivenCandidates.every(
  (candidate) => content.includes(candidate),
);
const runtimeBlockingStatusFound = includesAll(content, [
  "no snapshot persistence changes yet",
  "no Supabase writes yet",
  "no runtime routes yet",
  "no provider calls yet",
  "no news API calls yet",
  "no scanner/ranking mutation yet",
  "no confidence threshold changes yet",
  "no deploy",
  "no main push",
]);
const nextActionsFound = nextActions.every((action) => content.includes(action));
const marketContextFound = includesAll(content, [
  "Market Context",
  "market_session_state",
  "SPY_context",
  "QQQ_context",
  "IWM_context",
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
const currentNotS8Found = content.includes(
  "Current snapshot completeness is not yet confidently S8",
);
const notDeployReadinessFound = includesAll(content, [
  "not a new snapshot implementation",
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
  "snapshot persistence changes",
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  snapshotAuditFound &&
  auditStatusFound &&
  purposeFound &&
  snapshotDimensionsFound &&
  existingMissingMatrixFound &&
  snapshotCompletenessLevelsFound &&
  doNotDuplicateRulesFound &&
  gapDrivenNextBuildCandidatesFound &&
  runtimeBlockingStatusFound &&
  nextActionsFound &&
  marketContextFound &&
  sectorIndustryContextFound &&
  relativeStrengthContextFound &&
  newsCatalystContextFound &&
  currentNotS8Found &&
  notDeployReadinessFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  snapshot_audit_found: snapshotAuditFound,
  audit_status_found: auditStatusFound,
  purpose_found: purposeFound,
  snapshot_dimensions_found: snapshotDimensionsFound,
  snapshot_dimensions_missing: snapshotDimensions.filter(
    (dimension) => !content.includes(dimension),
  ),
  existing_missing_matrix_found: existingMissingMatrixFound,
  snapshot_completeness_levels_found: snapshotCompletenessLevelsFound,
  do_not_duplicate_rules_found: doNotDuplicateRulesFound,
  gap_driven_next_build_candidates_found: gapDrivenNextBuildCandidatesFound,
  runtime_blocking_status_found: runtimeBlockingStatusFound,
  next_actions_found: nextActionsFound,
  market_context_found: marketContextFound,
  sector_industry_context_found: sectorIndustryContextFound,
  relative_strength_context_found: relativeStrengthContextFound,
  news_catalyst_context_found: newsCatalystContextFound,
  current_snapshot_not_s8_found: currentNotS8Found,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_write_allowed: false,
  snapshot_persistence_change_allowed: false,
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
    snapshots_persisted: false,
    snapshot_persistence_changed: false,
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
    ? "action_335_learning_outcome_dataset_design"
    : "fix_recommendation_snapshot_completeness_audit_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
