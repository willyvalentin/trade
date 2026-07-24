#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const auditPath = "docs/action-325-recommendation-quality-gates-audit.md";

const requiredGates = [
  "data_freshness_gate",
  "market_session_gate",
  "liquidity_gate",
  "spread_or_volatility_gate",
  "vwap_context_gate",
  "momentum_gate",
  "volume_trend_gate",
  "risk_reward_gate",
  "trade_geometry_gate",
  "confidence_gate",
  "duplicate_candidate_gate",
  "recommendation_limit_gate",
  "snapshot_persistence_gate",
  "learning_feedback_gate",
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

const qualityGatesAuditFound = exists(auditPath);
const content = qualityGatesAuditFound ? read(auditPath) : "";

const auditStatusFound = content.includes(
  "recommendation_quality_gates_audit_status: audit_ready",
);
const auditPlanningOnlyFound = includesAll(content, [
  "recommendation quality gate audit planning only",
  "not runtime change",
  "deploy readiness",
  "scanner mutation",
  "ranking mutation",
]);
const purposeFound = includesAll(content, [
  "reject weak/noisy/stale/unsafe recommendations",
  "limited, high-quality, actionable recommendations",
  "quiet and intelligent",
  "connect to learning/backfill outcomes and confidence calibration",
]);
const allRequiredGatesFound = requiredGates.every((gate) => content.includes(gate));
const gateDetailsFound = includesAll(content, [
  "purpose:",
  "protects against:",
  "expected pass idea:",
  "expected fail idea:",
  "evidence needed:",
  "current readiness:",
  "next audit step:",
]);
const severityModelFound = includesAll(content, [
  "Gate Severity Model",
  "blocking: recommendation must not be shown",
  "warning: recommendation may be shown but should be marked/discounted",
  "diagnostic: background insight only",
]);
const productInterpretationFound = includesAll(content, [
  "fewer but better recommendations",
  "less user analysis",
  "clearer cards",
  "better trust",
  "better learning feedback loop",
]);
const auditFindingsSummaryFound = includesAll(content, [
  "Audit Findings Summary",
  "| gate | severity | current readiness | likely product risk if weak | next audit action |",
  "Current readiness values are known | partial | needs audit",
]);
const whatNotToDoYetFound = includesAll(content, [
  "do not change gate thresholds",
  "do not mutate scanner/ranking",
  "do not add API routes",
  "do not connect static replay to live ranking",
  "do not persist synthetic outcomes",
  "do not deploy",
  "do not push main",
]);
const nextActionsFound = includesAll(content, [
  "Action 326: Setup Taxonomy and Confidence Calibration Map",
  "Action 327: Learning/Backfill Runtime Rollout Plan",
  "Action 328: Product UX Surface Map",
  "Action 329: Recommendation Engine Gate Test Plan",
]);
const blocksDeployMainRuntimeProxyScannerRanking = includesAll(content, [
  "does not authorize",
  "production deploy",
  "main push",
  "runtime route",
  "proxy or middleware",
  "scanner changes",
  "ranking changes",
]);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  qualityGatesAuditFound &&
  auditStatusFound &&
  auditPlanningOnlyFound &&
  purposeFound &&
  allRequiredGatesFound &&
  gateDetailsFound &&
  severityModelFound &&
  productInterpretationFound &&
  auditFindingsSummaryFound &&
  whatNotToDoYetFound &&
  nextActionsFound &&
  blocksDeployMainRuntimeProxyScannerRanking &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  quality_gates_audit_found: qualityGatesAuditFound,
  audit_status_found: auditStatusFound,
  audit_planning_only_found: auditPlanningOnlyFound,
  purpose_found: purposeFound,
  all_required_gates_found: allRequiredGatesFound,
  required_gates_found: requiredGates.filter((gate) => content.includes(gate)),
  required_gates_missing: requiredGates.filter((gate) => !content.includes(gate)),
  gate_details_found: gateDetailsFound,
  severity_model_found: severityModelFound,
  product_interpretation_found: productInterpretationFound,
  audit_findings_summary_found: auditFindingsSummaryFound,
  what_not_to_do_yet_found: whatNotToDoYetFound,
  next_actions_found: nextActionsFound,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  proxy_changes_allowed: false,
  scanner_ranking_mutation_allowed: false,
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
    learning_acceleration_changed: false,
    add_trade_changed: false,
    broker_execution_risk_changed: false,
  },
  recommended_next_step: passed
    ? "proceed_to_action_326_setup_taxonomy_and_confidence_calibration_map"
    : "complete_recommendation_quality_gates_audit_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
