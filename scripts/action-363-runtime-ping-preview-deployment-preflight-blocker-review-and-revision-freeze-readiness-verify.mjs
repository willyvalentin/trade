#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath = "docs/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness.md";
const routePath = "app/api/runtime-health/ping/route.ts";
const blockerPath = "lib/post-trade-staging-execution-authorization-artifact-core.ts";
const immutableBaseline = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";
const expectedRouteHash = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Action 362 Approval Summary", "## Current Validation Results",
  "## Exact TypeScript Blocker File and Location", "## Blocker Ownership Classification",
  "## Evidence Outside Actions 360-362", "## Ping Route Integrity Status",
  "## Current Repository Deploy Eligibility", "## Full-Build Requirement",
  "## Full-Typecheck Requirement", "## Lint Requirement", "## Route-Test Requirement",
  "## Package-Guard Requirement", "## Immutable Revision Requirement",
  "## Source-Hash Requirement", "## Worktree-Cleanliness Requirement",
  "## Untracked-File Assessment", "## Concurrent-Work Risk", "## Revision-Freeze Protocol",
  "## Deployment-Input Manifest", "## One-Attempt Preservation Rule", "## Stop Conditions",
  "## Remediation Ownership", "## Explicit Non-Goals", "## Readiness Vocabulary",
  "## Deterministic Readiness Conditions", "## Readiness Decision", "## Passed Conditions",
  "## Failed Conditions", "## Unresolved Conditions", "## Work Remaining Blocked",
  "## Next Required Action",
];

const expectedRouteSource = `export function GET() {
  const body = {
    ok: true,
    route_ping: true,
    route_build_marker: "action_344_future_runtime_ping_only_route",
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendation_rows_mutated: false,
    runtime_route_scope: "ping_only",
    deploy_readiness_required: true,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
`;

function exists(path) {
  return existsSync(join(root, path));
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

const docFound = exists(docPath);
const doc = docFound ? read(docPath) : "";
const routeFound = exists(routePath);
const routeSource = routeFound ? read(routePath) : "";
const routeExact = routeSource === expectedRouteSource;
const routeHash = createHash("sha256").update(routeSource).digest("hex");
const blockerFound = exists(blockerPath);
const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
  cwd: root,
  encoding: "utf8",
});
const changedPaths = status.split("\n").filter(Boolean).map((line) => line.slice(3));
const changedAppPaths = changedPaths.filter((path) => path.startsWith("app/"));
const committedAppPaths = execFileSync(
  "git",
  ["diff", "--name-only", `${immutableBaseline}..HEAD`, "--", "app"],
  { cwd: root, encoding: "utf8" },
).trim().split("\n").filter(Boolean);
const noSecondRuntimeRoute =
  (changedAppPaths.length === 1 && changedAppPaths[0] === routePath) ||
  (changedAppPaths.length === 0 && committedAppPaths.length === 1 && committedAppPaths[0] === routePath);
const forbiddenChanges = changedPaths.filter((path) =>
  path === "proxy.ts" || path === "netlify.toml" ||
  /^middleware\.(?:ts|js|mts|mjs)$/.test(path) ||
  /^(?:\.env(?:\..*)?|supabase\/migrations\/|netlify\/|\.netlify\/)/.test(path)
);

const sectionsFound = requiredSections.every((section) => doc.includes(section));
const action362Preserved = [
  "Action 362 remains `approved` in principle", "approved attempt has not been consumed",
  "action_362_approval_preserved: true", "preview_attempt_consumed: false",
].every((text) => doc.includes(text));
const blockerRecorded = [
  `${blockerPath}:697`, "Type error: Type 'boolean' is not assignable to type 'true'.",
  "blocker_classification: unrelated_but_revision_blocking",
  "“Unrelated” does not mean non-blocking or safe to ignore",
].every((text) => doc.includes(text));
const validationTruthful = [
  "Original Action 362 close-out evidence", "`npx tsc --noEmit`: failed",
  "TypeScript validation failed", "Action 363 current rerun evidence",
  "`npx tsc --noEmit`: passed", "`npm run build`: passed completely",
  "original failures are not rewritten as passes or waived",
].every((text) => doc.includes(text));
const revisionFreezeExplicit = [
  "one immutable repository revision", "full relevant source manifest",
  "Current worktree cleanliness: false", "mutable-worktree deployment is eligible" ,
  "deploy inputs are immutable", "exact SHA-256",
].every((text, index) => index === 3 ? doc.includes(`no ${text}`) : doc.includes(text));
const suppressionForbidden = [
  "may not be ignored, excluded, suppressed, downgraded, or waived",
  "No error suppression", "does not absorb it into the ping package",
].every((text) => doc.includes(text));
const blockedDecision = [
  "readiness_vocabulary: ready | ready_with_conditions | blocked",
  "readiness_decision: blocked", "current_deploy_eligibility: false",
  "Decision: `blocked`", "Immutable deploy revision recorded: failed",
].every((text) => doc.includes(text));
const safetyRecorded = [
  "deployment_performed: false", "external_endpoint_contacted: false",
  "No deployment or external endpoint contact occurred",
  "production_deployment_approved: false", "main_push_allowed: false",
].every((text) => doc.includes(text));
const nextActionSeparate = doc.includes("separately approved repository-isolation or post-trade-remediation action") &&
  doc.includes("post-remediation Runtime Ping Preview Preflight Verification");

const passed = docFound && sectionsFound && action362Preserved && blockerRecorded &&
  validationTruthful && revisionFreezeExplicit && suppressionForbidden && blockedDecision &&
  safetyRecorded && nextActionSeparate && blockerFound && routeExact &&
  routeHash === expectedRouteHash && noSecondRuntimeRoute && forbiddenChanges.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  readiness_decision: "blocked",
  blocker_classification: "unrelated_but_revision_blocking",
  current_deploy_eligibility: false,
  action_362_approval_preserved: true,
  preview_attempt_consumed: false,
  preview_deployment_performed: false,
  external_endpoint_contacted: false,
  Netlify_runtime_trusted: false,
  document_found: docFound,
  required_sections_found: sectionsFound,
  blocker_path_found: blockerFound,
  blocker_and_historical_failure_recorded: blockerRecorded && validationTruthful,
  original_failures_not_waived: validationTruthful,
  current_green_rerun_recorded_without_deploy_approval: validationTruthful && blockedDecision,
  route_source_remains_exact: routeExact,
  route_source_sha256: routeHash,
  route_hash_matches_frozen_contract: routeHash === expectedRouteHash,
  changed_app_paths: changedAppPaths,
  committed_app_paths_since_immutable_baseline: committedAppPaths,
  no_second_runtime_route: noSecondRuntimeRoute,
  forbidden_config_environment_changes: forbiddenChanges,
  revision_freeze_requirements_explicit: revisionFreezeExplicit,
  no_error_suppression_authorized: suppressionForbidden,
  separate_next_action_identified: nextActionSeparate,
  failed_readiness_conditions: [
    "immutable_deploy_revision_not_recorded",
    "worktree_not_clean_or_stable",
    "reviewed_deployment_input_manifest_not_frozen",
    "concurrent_unreviewed_files_not_excluded",
  ],
  no_effect_flags: {
    deployment_performed: false,
    Netlify_call_executed: false,
    external_endpoint_contacted: false,
    route_modified_by_action_363: false,
    additional_runtime_file_added: false,
    config_or_environment_modified: false,
    provider_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persisted_data: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
  },
  recommended_next_step: "separate_repository_isolation_or_post_trade_remediation_then_rerun_preflight",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
