#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-332-intelligence-data-collection-readiness-map.md";

const coreDataDomains = [
  "Intraday Price/Volume Data",
  "Recommendation Snapshot Data",
  "Outcome Data",
  "Sector / Industry Context",
  "Market Regime Context",
  "Relative Strength Context",
  "Company News / Catalyst Context",
  "Calendar / Event Context",
  "Historical Setup Behavior",
  "Data Quality / Provenance",
];

const dailyCollectionGoals = [
  "intraday candles for candidate universe",
  "scan run metadata",
  "recommendations and rejected candidates",
  "recommendation snapshots",
  "market regime snapshot",
  "sector/industry context snapshot",
  "relative strength snapshot",
  "news/catalyst snapshot",
  "shadow outcomes for all recommendations",
  "end-of-day outcome summary",
];

const historicalBackfillGoals = [
  "historical candles",
  "historical market regime context",
  "historical sector/industry movement",
  "historical relative strength",
  "historical news/catalysts where available",
  "historical recommendation replay outcomes",
  "historical setup/calibration datasets",
];

const intelligenceFeatures = [
  "better setup filtering",
  "avoiding weak setups in bad regimes",
  "identifying sector-supported movers",
  "identifying news-backed vs purely technical moves",
  "separating real momentum from noisy spikes",
  "confidence calibration by setup/sector/regime/window",
  "better pattern discovery",
  "better recommendation ranking later",
  "fewer but better recommendations",
];

const readinessLevels = [
  "D0: not defined",
  "D1: data domain defined",
  "D2: static schema/plan exists",
  "D3: local/offline fixture coverage exists",
  "D4: read-only runtime collection tested",
  "D5: production collection with audit/readback",
  "D6: learning integration validated",
  "D7: trusted intelligence signal in recommendation engine",
];

const nextActions = [
  "Action 333: Historical Data Backfill Coverage Plan",
  "Action 334: Recommendation Snapshot Completeness Audit",
  "Action 335: Learning Outcome Dataset Design",
  "Action 336: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 337: Intelligence Data Schema Draft",
  "Action 338: Runtime Ping-Only Rollout Checklist",
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

const mapFound = exists(docPath);
const content = mapFound ? read(docPath) : "";

const mapStatusFound = includesAll(content, [
  "intelligence_data_collection_readiness_status: map_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "intelligence data collection planning only",
  "not runtime implementation",
  "provider integration",
  "news integration",
  "Supabase persistence",
  "scanner mutation",
  "ranking mutation",
  "deploy readiness",
  "main-push authorization",
]);
const coreDataDomainsFound = coreDataDomains.every((domain) =>
  content.includes(domain),
);
const dailyCollectionGoalsFound = dailyCollectionGoals.every((goal) =>
  content.includes(goal),
);
const historicalBackfillGoalsFound = historicalBackfillGoals.every((goal) =>
  content.includes(goal),
);
const intelligenceFeaturesFound = intelligenceFeatures.every((feature) =>
  content.includes(feature),
);
const readinessLevelsFound = readinessLevels.every((level) =>
  content.includes(level),
);
const blockedWorkFound = includesAll(content, [
  "no new runtime routes yet",
  "no provider calls yet",
  "no news API calls yet",
  "no Supabase writes yet",
  "no scanner/ranking mutation yet",
  "no confidence threshold changes yet",
  "no deploy",
  "no main push",
]);
const nextActionsFound = nextActions.every((action) => content.includes(action));
const industryContextFound = includesAll(content, [
  "Sector / Industry Context",
  "sector",
  "industry",
  "peer group",
  "sector ETF if available",
  "industry strength/weakness",
  "sector-relative movement",
  "peer-relative movement",
]);
const marketRegimeContextFound = includesAll(content, [
  "Market Regime Context",
  "SPY/QQQ/IWM direction",
  "market breadth",
  "volatility regime",
  "risk-on/risk-off context",
  "trend day vs chop day",
  "market session state",
]);
const companyNewsContextFound = includesAll(content, [
  "Company News / Catalyst Context",
  "earnings",
  "guidance",
  "analyst upgrades/downgrades",
  "FDA/regulatory/company events where relevant",
  "unusual news volume",
  "catalyst timestamp",
  "catalyst freshness",
]);
const relativeStrengthContextFound = includesAll(content, [
  "Relative Strength Context",
  "stock vs SPY",
  "stock vs QQQ",
  "stock vs sector ETF",
  "stock vs peer group",
  "intraday relative strength",
  "multi-day relative strength",
]);
const currentCollectionNotD7Found = content.includes(
  "Current intelligence collection is not yet D7",
);
const notDeployReadinessFound = includesAll(content, [
  "not runtime implementation",
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
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  mapFound &&
  mapStatusFound &&
  coreDataDomainsFound &&
  dailyCollectionGoalsFound &&
  historicalBackfillGoalsFound &&
  intelligenceFeaturesFound &&
  readinessLevelsFound &&
  blockedWorkFound &&
  nextActionsFound &&
  industryContextFound &&
  marketRegimeContextFound &&
  companyNewsContextFound &&
  relativeStrengthContextFound &&
  currentCollectionNotD7Found &&
  notDeployReadinessFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  intelligence_data_collection_map_found: mapFound,
  map_status_found: mapStatusFound,
  core_data_domains_found: coreDataDomainsFound,
  core_data_domains_present: coreDataDomains.filter((domain) =>
    content.includes(domain),
  ),
  core_data_domains_missing: coreDataDomains.filter(
    (domain) => !content.includes(domain),
  ),
  daily_collection_goals_found: dailyCollectionGoalsFound,
  historical_backfill_goals_found: historicalBackfillGoalsFound,
  intelligence_features_found: intelligenceFeaturesFound,
  readiness_levels_found: readinessLevelsFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  industry_context_found: industryContextFound,
  market_regime_context_found: marketRegimeContextFound,
  company_news_context_found: companyNewsContextFound,
  relative_strength_context_found: relativeStrengthContextFound,
  current_collection_not_d7_found: currentCollectionNotD7Found,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_write_allowed: false,
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
    outcome_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  recommended_next_step: passed
    ? "action_333_historical_data_backfill_coverage_plan"
    : "fix_intelligence_data_collection_map_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
