#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const planPath = "docs/action-329-recommendation-engine-gate-test-plan.md";

const testStrategyLevels = [
  "Static fixture tests",
  "Unit tests for gate helpers",
  "Integration tests with mock provider data",
  "Read-only runtime tests",
  "Historical replay validation",
  "Calibration validation",
];

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
const noCurrentTimePhrase = ["no ", "Date", ".", "now"].join("");

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

const gateTestPlanFound = exists(planPath);
const content = gateTestPlanFound ? read(planPath) : "";

const testPlanStatusFound = includesAll(content, [
  "recommendation_engine_gate_test_plan_status: test_plan_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "gate test planning only",
  "not gate implementation",
  "runtime change",
  "deploy readiness",
  "scanner mutation",
  "ranking mutation",
  "threshold mutation",
]);
const testStrategyLevelsFound = testStrategyLevels.every((level) =>
  content.includes(level),
);
const allRequiredGatesFound = requiredGates.every((gate) => content.includes(gate));
const gatePlanDetailsFound = includesAll(content, [
  "gate name:",
  "minimum fixture scenarios:",
  "expected pass case:",
  "expected fail case:",
  "boundary cases:",
  "required assertions:",
  "test level to start with:",
  "implementation risk:",
]);
const fixtureDesignPrinciplesFound = includesAll(content, [
  "deterministic timestamps",
  noCurrentTimePhrase,
  "no random data",
  "explicit market session labels",
  "explicit stale/fresh data cases",
  "explicit valid/invalid geometry",
  "explicit duplicate candidates",
  "explicit confidence buckets",
  "explicit missing snapshot cases",
  "no provider calls",
  "no Supabase writes",
]);
const standardizedAssertionsFound = includesAll(content, [
  "gate_status: pass | warn | fail | unknown",
  "blocker_reason",
  "warning_reason",
  "candidate_visible",
  "recommendation_allowed",
  "confidence_discount_applied",
  "tier_change_allowed",
  "no_effect_flags",
  "audit_metadata",
]);
const whatNotToDoYetFound = includesAll(content, [
  "do not implement gate threshold changes",
  "do not mutate scanner/ranking",
  "do not add API routes",
  "do not connect static replay to live ranking",
  "do not persist synthetic outcomes",
  "do not deploy",
  "do not push main",
  "Scanner/ranking mutation is blocked",
]);
const nextActionsFound = includesAll(content, [
  "Action 330: Confidence Calibration Static Metric Spec",
  "Action 331: Recommendation Card Content Hierarchy Spec",
  "Action 332: History/Statistics Learning Surface Spec",
  "Action 333: Execution Agent Boundary Refresh",
  "Action 334: First Static Gate Helper Extraction Plan",
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
  gateTestPlanFound &&
  testPlanStatusFound &&
  testStrategyLevelsFound &&
  allRequiredGatesFound &&
  gatePlanDetailsFound &&
  fixtureDesignPrinciplesFound &&
  standardizedAssertionsFound &&
  whatNotToDoYetFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  gate_test_plan_found: gateTestPlanFound,
  test_plan_status_found: testPlanStatusFound,
  test_strategy_levels_found: testStrategyLevelsFound,
  test_strategy_levels_present: testStrategyLevels.filter((level) =>
    content.includes(level),
  ),
  test_strategy_levels_missing: testStrategyLevels.filter(
    (level) => !content.includes(level),
  ),
  all_required_gates_found: allRequiredGatesFound,
  required_gates_present: requiredGates.filter((gate) => content.includes(gate)),
  required_gates_missing: requiredGates.filter((gate) => !content.includes(gate)),
  gate_plan_details_found: gatePlanDetailsFound,
  fixture_design_principles_found: fixtureDesignPrinciplesFound,
  standardized_assertions_found: standardizedAssertionsFound,
  what_not_to_do_yet_found: whatNotToDoYetFound,
  next_actions_found: nextActionsFound,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  proxy_changes_allowed: false,
  scanner_ranking_mutation_allowed: false,
  threshold_mutation_allowed: false,
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
    threshold_mutation_executed: false,
    gate_implementation_added: false,
  },
  recommended_next_step: passed
    ? "continue_to_confidence_calibration_static_metric_spec"
    : "fix_gate_test_plan_or_remove_forbidden_runtime_artifacts",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
