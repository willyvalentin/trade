#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-333-historical-data-backfill-existing-coverage-audit.md";

const knownCoverageItems = [
  "scan/window/tier recommendation generation",
  "recommendation snapshots",
  "historical candle storage",
  "fetch-run audit/readback flow",
  "first tiny candle persistence verification",
  "first tiny replay dry-run",
  "signal package discovery",
  "static replay result model",
  "static replay simulation engine",
  "static fixtures",
  "static summary evaluator",
  "static inspection report",
  "local static preview",
  "golden snapshots",
  "History/Statistics foundations",
  "confidence calibration planning",
  "quality gate planning",
];

const intelligenceDomains = [
  "Intraday price/volume data",
  "Recommendation snapshot data",
  "Outcome data",
  "Sector / industry context",
  "Market regime context",
  "Relative strength context",
  "Company news / catalyst context",
  "Calendar / event context",
  "Historical setup behavior",
  "Data quality / provenance",
];

const coverageWindows = [
  "last 5 trading days",
  "last 20 trading days",
  "last 60 trading days",
  "last 120 trading days",
  "last 252 trading days",
  "multi-year later",
];

const doNotDuplicateRules = [
  "do not recreate historical candle tables if existing table is valid",
  "do not recreate recommendation snapshot models if existing snapshot flow is valid",
  "do not create duplicate replay result models",
  "do not create duplicate outcome concepts",
  "do not create duplicate History/Statistics concepts",
  "do not create parallel scanner/ranking paths",
  "prefer extending existing helpers/docs over new parallel architecture",
];

const gapDrivenCandidates = [
  "historical coverage readback audit",
  "recommendation snapshot completeness audit",
  "outcome dataset schema alignment",
  "sector/industry context schema draft",
  "market regime snapshot schema draft",
  "relative strength feature schema draft",
  "news/catalyst context schema draft",
  "calendar/event tagging plan",
  "provider capacity/cost plan",
  "safe runtime ping-only rollout checklist",
];

const nextActions = [
  "Action 334: Recommendation Snapshot Completeness Audit",
  "Action 335: Learning Outcome Dataset Design",
  "Action 336: Intelligence Context Schema Draft",
  "Action 337: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 339: Historical Backfill Cost and Provider Capacity Plan",
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

const coverageAuditFound = exists(docPath);
const content = coverageAuditFound ? read(docPath) : "";

const auditStatusFound = includesAll(content, [
  "historical_backfill_existing_coverage_status: coverage_audit_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "existing coverage audit only",
  "not a new backfill implementation",
  "not runtime implementation",
  "provider integration",
  "news integration",
  "Supabase persistence",
  "scanner mutation",
  "ranking mutation",
  "deploy readiness",
  "main-push authorization",
]);
const importantCorrectionFound = includesAll(content, [
  "Historical/backfill/replay work is not starting from zero",
  "Prior work must be preserved",
  "New work must be additive and gap-driven",
  "Do not rebuild existing snapshot, candle persistence, replay, history, or statistics foundations unless an audit proves a concrete gap",
]);
const existingKnownCoverageFound = knownCoverageItems.every((item) =>
  content.includes(item),
);
const intelligenceDomainMatrixFound =
  content.includes("Intelligence Data Domains Coverage Matrix") &&
  intelligenceDomains.every((domain) => content.includes(domain)) &&
  includesAll(content, [
    "Existing coverage",
    "Partial coverage",
    "Missing coverage",
    "Risk if missing",
    "Next additive step",
  ]);
const coverageWindowsFound = coverageWindows.every((windowLabel) =>
  content.includes(windowLabel),
);
const doNotDuplicateRulesFound = doNotDuplicateRules.every((rule) =>
  content.includes(rule),
);
const gapDrivenNextBuildCandidatesFound = gapDrivenCandidates.every((candidate) =>
  content.includes(candidate),
);
const runtimeBlockingStatusFound = includesAll(content, [
  "runtime route work remains blocked",
  "provider calls remain blocked",
  "news API calls remain blocked",
  "Supabase writes remain blocked",
  "scanner/ranking mutation remains blocked",
  "confidence threshold mutation remains blocked",
  "deploy remains blocked",
  "main push remains blocked",
]);
const nextActionsFound = nextActions.every((action) => content.includes(action));
const notDeployReadinessFound = includesAll(content, [
  "not a new backfill implementation",
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
  coverageAuditFound &&
  auditStatusFound &&
  importantCorrectionFound &&
  existingKnownCoverageFound &&
  intelligenceDomainMatrixFound &&
  coverageWindowsFound &&
  doNotDuplicateRulesFound &&
  gapDrivenNextBuildCandidatesFound &&
  runtimeBlockingStatusFound &&
  nextActionsFound &&
  notDeployReadinessFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  coverage_audit_found: coverageAuditFound,
  audit_status_found: auditStatusFound,
  important_correction_found: importantCorrectionFound,
  existing_known_coverage_found: existingKnownCoverageFound,
  existing_known_coverage_missing: knownCoverageItems.filter(
    (item) => !content.includes(item),
  ),
  intelligence_domain_matrix_found: intelligenceDomainMatrixFound,
  intelligence_domains_missing: intelligenceDomains.filter(
    (domain) => !content.includes(domain),
  ),
  coverage_windows_found: coverageWindowsFound,
  do_not_duplicate_rules_found: doNotDuplicateRulesFound,
  gap_driven_next_build_candidates_found: gapDrivenNextBuildCandidatesFound,
  runtime_blocking_status_found: runtimeBlockingStatusFound,
  next_actions_found: nextActionsFound,
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
    visible_recommendations_changed: false,
    outcome_persistence_changed: false,
    learning_acceleration_changed: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  recommended_next_step: passed
    ? "action_334_recommendation_snapshot_completeness_audit"
    : "fix_historical_backfill_coverage_audit_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
