#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const planPath = "docs/action-327-learning-backfill-runtime-rollout-plan.md";

const approvalFlags = [
  "TURE_RUNTIME_PING_ROLLOUT_APPROVED=false",
  "TURE_REPLAY_READ_ONLY_ROUTE_APPROVED=false",
  "TURE_REPLAY_DRY_RUN_ROUTE_APPROVED=false",
  "TURE_SYNTHETIC_OUTCOME_WRITE_APPROVED=false",
  "TURE_LEARNING_REVIEW_INTEGRATION_APPROVED=false",
  "TURE_CONFIDENCE_CALIBRATION_RESEARCH_APPROVED=false",
  "TURE_SCANNER_RANKING_MUTATION_APPROVED=false",
];

const rolloutPhases = [
  "Phase 0: Static/local only",
  "Phase 1: Runtime ping-only route",
  "Phase 2: Runtime diagnostic read-only route",
  "Phase 3: Supabase read-only replay input route",
  "Phase 4: Replay execution dry-run route",
  "Phase 5: Synthetic outcome write audit route",
  "Phase 6: Learning review integration",
  "Phase 7: Controlled calibration/ranking research",
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

const rolloutPlanFound = exists(planPath);
const content = rolloutPlanFound ? read(planPath) : "";

const rolloutStatusFound = includesAll(content, [
  "learning_backfill_runtime_rollout_status: rollout_plan_ready",
  "branch: dev/safe-post-recovery-work",
  "rollback deploy protected: 6a501645908e4100088b7396",
  "clean base commit: 512a0c5",
  "runtime rollout planning only",
  "not runtime implementation",
  "not deploy readiness",
  "provider call",
  "Supabase write",
  "scanner/ranking mutation",
]);
const prerequisitesFound = includesAll(content, [
  "production remains healthy on rollback deploy",
  "local/static replay foundation passes",
  "staging or production-safe route rollout checklist exists",
  "approval flags remain false by default",
  "no provider calls without explicit approval",
  "no Supabase writes without explicit approval",
  "no scanner/ranking mutation until learning results are validated",
  "rollback target is confirmed before any production deploy",
  "known bad artifacts/markers remain absent",
  "deployment route table is inspected before testing",
]);
const rolloutPhasesFound = rolloutPhases.every((phase) => content.includes(phase));
const approvalFlagsFound = approvalFlags.every((flag) => content.includes(flag));
const routeSafetyRulesFound = includesAll(content, [
  "no proxy.ts changes",
  "no middleware changes",
  "no Netlify config changes",
  "no broad route publication experiments",
  "no 307K-style diagnostic proxy marker",
  "route must be isolated",
  "route must return no-effect flags",
  "route must not import provider/Supabase unless phase allows it",
  "route must have explicit tests",
  "route must have rollback instructions",
]);
const productionDeploySafetyChecklistFound = includesAll(content, [
  "confirm production pings healthy before deploy",
  "confirm rollback deploy id 6a501645908e4100088b7396 or newer known-good target",
  "inspect Netlify route table before testing",
  "test only ping routes first",
  "rollback immediately on HTTP 400 empty body",
  "never test write/execution route first",
  "never publish branch deploy if non-production runtime is still untrusted",
]);
const blockedUntilLaterFound = includesAll(content, [
  "any new runtime route implementation",
  "any Supabase write",
  "any provider refetch path",
  "any synthetic outcome persistence",
  "any scanner/ranking mutation",
  "any confidence threshold mutation",
  "any deploy from dev branch without explicit deploy readiness checklist",
]);
const nextActionsFound = includesAll(content, [
  "Action 328: Product UX Surface Map",
  "Action 329: Recommendation Engine Gate Test Plan",
  "Action 330: Confidence Calibration Static Metric Spec",
  "Action 331: Runtime Ping-Only Rollout Checklist",
  "Action 332: Staging Site Setup Plan",
]);
const blocksUnsafeWorkFound = includesAll(content, [
  "does not authorize",
  "production deploy",
  "main push",
  "runtime route",
  "proxy or middleware",
  "scanner changes",
  "ranking changes",
  "confidence threshold changes",
  "provider calls",
  "Supabase reads",
  "Supabase writes",
  "replay execution",
  "synthetic outcome persistence",
  "recommendation mutation",
]);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  rolloutPlanFound &&
  rolloutStatusFound &&
  prerequisitesFound &&
  rolloutPhasesFound &&
  approvalFlagsFound &&
  routeSafetyRulesFound &&
  productionDeploySafetyChecklistFound &&
  blockedUntilLaterFound &&
  nextActionsFound &&
  blocksUnsafeWorkFound &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  rollout_plan_found: rolloutPlanFound,
  rollout_status_found: rolloutStatusFound,
  prerequisites_found: prerequisitesFound,
  rollout_phases_found: rolloutPhasesFound,
  rollout_phases_present: rolloutPhases.filter((phase) => content.includes(phase)),
  rollout_phases_missing: rolloutPhases.filter((phase) => !content.includes(phase)),
  approval_flags_found: approvalFlagsFound,
  approval_flags_present: approvalFlags.filter((flag) => content.includes(flag)),
  approval_flags_missing: approvalFlags.filter((flag) => !content.includes(flag)),
  route_safety_rules_found: routeSafetyRulesFound,
  production_deploy_safety_checklist_found: productionDeploySafetyChecklistFound,
  blocked_until_later_found: blockedUntilLaterFound,
  next_actions_found: nextActionsFound,
  deploy_readiness: false,
  runtime_implementation_allowed: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  proxy_changes_allowed: false,
  provider_call_allowed: false,
  supabase_write_allowed: false,
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
    confidence_thresholds_mutated: false,
    runtime_route_added: false,
    deploy_executed: false,
    main_pushed: false,
  },
  recommended_next_step: passed
    ? "continue_static_planning_or_create_runtime_ping_only_rollout_checklist"
    : "fix_rollout_plan_or_remove_forbidden_runtime_artifacts_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
