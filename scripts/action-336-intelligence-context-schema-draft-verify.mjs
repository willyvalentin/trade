#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-336-intelligence-context-schema-draft.md";

const contextObjects = [
  "MarketRegimeContext",
  "SectorIndustryContext",
  "RelativeStrengthContext",
  "CompanyNewsCatalystContext",
  "CalendarEventContext",
  "DataProvenanceContext",
  "ContextSnapshotEnvelope",
];

const marketRegimeFields = [
  "context_timestamp",
  "trading_day",
  "trading_window",
  "SPY_direction",
  "QQQ_direction",
  "IWM_direction",
  "index_alignment",
  "volatility_regime",
  "breadth_proxy",
  "risk_on_risk_off",
  "trend_day_or_chop_day",
  "session_phase",
  "regime_confidence",
  "source",
  "freshness",
  "missing_fields",
];

const sectorIndustryFields = [
  "ticker",
  "sector",
  "industry",
  "peer_group",
  "sector_etf",
  "industry_proxy",
  "sector_direction",
  "industry_direction",
  "sector_relative_strength",
  "peer_relative_strength",
  "sector_volume_context",
  "context_confidence",
  "source",
  "freshness",
  "missing_fields",
];

const relativeStrengthFields = [
  "ticker",
  "context_timestamp",
  "stock_vs_SPY",
  "stock_vs_QQQ",
  "stock_vs_IWM",
  "stock_vs_sector_etf",
  "stock_vs_peer_group",
  "intraday_relative_strength",
  "multi_day_relative_strength",
  "relative_volume",
  "relative_strength_label",
  "source",
  "freshness",
  "missing_fields",
];

const newsCatalystFields = [
  "ticker",
  "catalyst_detected",
  "catalyst_type",
  "catalyst_timestamp",
  "catalyst_freshness",
  "headline_summary",
  "source_count",
  "news_volume_context",
  "earnings_or_guidance_context",
  "analyst_or_regulatory_context",
  "legal_or_event_risk",
  "catalyst_confidence",
  "available_at_snapshot_time",
  "source",
  "freshness",
  "missing_fields",
];

const calendarEventFields = [
  "trading_day",
  "earnings_day",
  "earnings_proximity",
  "macro_event_day",
  "macro_event_type",
  "fomc_cpi_jobs_context",
  "options_expiration_context",
  "holiday_or_short_session",
  "sector_event_context",
  "event_risk_label",
  "source",
  "freshness",
  "missing_fields",
];

const provenanceFields = [
  "provider",
  "provider_request_id",
  "fetched_at",
  "source_timestamp",
  "adjusted_or_unadjusted",
  "interval",
  "row_count",
  "missing_data_flags",
  "source_confidence",
  "raw_response_reference",
  "audit_readback_status",
  "retention_policy",
];

const envelopeFields = [
  "context_snapshot_id",
  "snapshot_id",
  "recommendation_id",
  "ticker",
  "trading_day",
  "trading_window",
  "created_at",
  "market_regime_context",
  "sector_industry_context",
  "relative_strength_context",
  "company_news_catalyst_context",
  "calendar_event_context",
  "data_provenance_context",
  "anti_leakage_status",
  "context_completeness_score",
  "missing_context_reasons",
  "learning_eligible",
];

const readinessLevels = [
  "CXT0: context undefined",
  "CXT1: context domains defined",
  "CXT2: schema draft exists",
  "CXT3: static fixtures exist",
  "CXT4: mapping to snapshots designed",
  "CXT5: read-only runtime enrichment verified",
  "CXT6: persistence/readback verified",
  "CXT7: learning dataset integration verified",
  "CXT8: confidence calibration research-ready",
  "CXT9: trusted intelligence context signal",
];

const doNotDuplicateRules = [
  "do not create parallel recommendation records",
  "do not create unlinked context tables before mapping existing snapshots",
  "do not duplicate provider audit concepts",
  "do not duplicate outcome/replay records",
  "prefer envelope/mapping/adapters over parallel architecture",
  "preserve existing History/Statistics compatibility",
];

const nextActions = [
  "Action 337: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 339: Historical Backfill Cost and Provider Capacity Plan",
  "Action 340: Snapshot Field Inventory Against Existing Schema",
  "Action 341: Learning Dataset Static Fixture Spec",
  "Action 342: Intelligence Context Static Fixture Spec",
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

const contextSchemaDocFound = exists(docPath);
const content = contextSchemaDocFound ? read(docPath) : "";

const schemaStatusFound = includesAll(content, [
  "intelligence_context_schema_status: schema_draft_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "context schema planning only",
  "not runtime implementation",
  "provider integration",
  "news integration",
  "Supabase persistence",
  "scanner mutation",
  "ranking mutation",
  "deploy readiness",
  "main-push authorization",
]);
const schemaPrinciplesFound = includesAll(content, [
  "snapshot-time context must only include data known at or before recommendation time",
  "outcome/eod context must be separate from snapshot-time context",
  "every context object needs source/provenance fields",
  "every context object should have freshness and confidence indicators",
  "context should be additive, not a parallel recommendation system",
  "missing context must be explicit, not silently ignored",
  "context should support later feature extraction",
]);
const contextObjectsFound = contextObjects.every((objectName) =>
  content.includes(objectName),
);
const marketRegimeContextFound = marketRegimeFields.every((field) =>
  content.includes(field),
);
const sectorIndustryContextFound = sectorIndustryFields.every((field) =>
  content.includes(field),
);
const relativeStrengthContextFound = relativeStrengthFields.every((field) =>
  content.includes(field),
);
const companyNewsCatalystContextFound = newsCatalystFields.every((field) =>
  content.includes(field),
);
const calendarEventContextFound = calendarEventFields.every((field) =>
  content.includes(field),
);
const dataProvenanceContextFound = provenanceFields.every((field) =>
  content.includes(field),
);
const contextSnapshotEnvelopeFound = envelopeFields.every((field) =>
  content.includes(field),
);
const antiLeakageRulesFound = includesAll(content, [
  "do not use news published after snapshot time as snapshot-time context",
  "do not use end-of-day regime classification as entry-time regime unless explicitly marked",
  "do not use outcome movement to label pre-trade context",
  "do not use future sector move as snapshot-time sector context",
  "keep enrichment versions audited",
  "scanner/ranking mutation remains blocked",
]);
const readinessLevelsFound = readinessLevels.every((level) =>
  content.includes(level),
);
const doNotDuplicateRulesFound = doNotDuplicateRules.every((rule) =>
  content.includes(rule),
);
const blockedWorkFound = includesAll(content, [
  "no context persistence yet",
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
const currentNotCxt9Found = content.includes("Current context schema is not yet CXT9");
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize deploys",
  "main pushes",
  "runtime route changes",
  "provider calls",
  "news API calls",
  "Supabase reads",
  "Supabase writes",
  "context persistence",
  "scanner mutations",
  "ranking mutations",
  "confidence threshold changes",
]);

const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  contextSchemaDocFound &&
  schemaStatusFound &&
  schemaPrinciplesFound &&
  contextObjectsFound &&
  marketRegimeContextFound &&
  sectorIndustryContextFound &&
  relativeStrengthContextFound &&
  companyNewsCatalystContextFound &&
  calendarEventContextFound &&
  dataProvenanceContextFound &&
  contextSnapshotEnvelopeFound &&
  antiLeakageRulesFound &&
  readinessLevelsFound &&
  doNotDuplicateRulesFound &&
  blockedWorkFound &&
  nextActionsFound &&
  currentNotCxt9Found &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  context_schema_doc_found: contextSchemaDocFound,
  schema_status_found: schemaStatusFound,
  schema_principles_found: schemaPrinciplesFound,
  context_objects_found: contextObjectsFound,
  market_regime_context_found: marketRegimeContextFound,
  sector_industry_context_found: sectorIndustryContextFound,
  relative_strength_context_found: relativeStrengthContextFound,
  company_news_catalyst_context_found: companyNewsCatalystContextFound,
  calendar_event_context_found: calendarEventContextFound,
  data_provenance_context_found: dataProvenanceContextFound,
  context_snapshot_envelope_found: contextSnapshotEnvelopeFound,
  anti_leakage_rules_found: antiLeakageRulesFound,
  readiness_levels_found: readinessLevelsFound,
  do_not_duplicate_rules_found: doNotDuplicateRulesFound,
  blocked_work_found: blockedWorkFound,
  next_actions_found: nextActionsFound,
  current_context_not_cxt9_found: currentNotCxt9Found,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  provider_call_allowed: false,
  news_api_call_allowed: false,
  supabase_write_allowed: false,
  context_persistence_allowed: false,
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
    context_persisted: false,
    context_persistence_changed: false,
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
    ? "action_337_pattern_discovery_and_confidence_calibration_roadmap"
    : "fix_intelligence_context_schema_draft_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
