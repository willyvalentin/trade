#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath = "docs/action-362-runtime-ping-only-preview-deploy-approval-gate.md";
const routePath = "app/api/runtime-health/ping/route.ts";
const immutableBaseline = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";

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

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Action 361 Readiness Decision", "## Explicit Non-Goals", "## Approval Vocabulary",
  "## Deterministic Gate Conditions", "## Exact Approved Deployment Type",
  "## Preview-Only Boundary", "## Production Prohibition", "## Main-Push Prohibition",
  "## Route Scope", "## Code-Free Deployment Action Requirement",
  "## Repository-State Requirement", "## Branch-State Requirement",
  "## Isolated-Diff Requirement", "## Build-Artifact Requirement",
  "## Deployment-Input Integrity", "## Netlify Trust Status", "## Preview URL Handling",
  "## Validation Request Boundary", "## Exact GET Validation Contract",
  "## Exact Response-Body Contract", "## Exact Response-Header Contract",
  "## Repeated-Response Validation", "## Unsupported-Method Validation",
  "## Authentication and Proxy Observation Strategy", "## Redirect Detection",
  "## Empty-Body Detection", "## HTTP 400 Regression Detection",
  "## HTML Error-Response Detection", "## Function and Runtime Initialization Failure Detection",
  "## Deployment-Log Review Boundary", "## Provider and Supabase Prohibition",
  "## Environment-Metadata Prohibition", "## No-Production-Data Guarantee",
  "## Stop Conditions", "## Rollback and Abandonment Strategy",
  "## Evidence Capture Requirements", "## Preview Validation Decision Vocabulary",
  "## Acceptance Criteria", "## Rejection Criteria", "## Approval Decision",
  "## Passed Conditions", "## Failed Conditions", "## Unresolved Conditions",
  "## Work Remaining Blocked", "## Next Permitted Action",
];

const upstream = [
  "Action 309: Post-Recovery Safe Development Protocol",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 344: Runtime Ping-Only Route Implementation Plan",
  "Action 350: Runtime Ping-Only Route Approval Gate",
  "Action 358: Runtime Ping-Only Route Implementation Readiness Review",
  "Action 359: Runtime Ping-Only Route Implementation Approval Gate",
  "Action 360: Runtime Ping-Only Route Implementation",
  "Action 361: Runtime Ping-Only Local Implementation Verification and Rollout Readiness Review",
];

function exists(path) {
  return existsSync(join(root, path));
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

const docFound = exists(docPath);
const doc = docFound ? read(docPath) : "";
const routeFound = exists(routePath);
const routeExact = routeFound && read(routePath) === expectedRouteSource;
const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
  cwd: root,
  encoding: "utf8",
});
const changedPaths = status
  .split("\n")
  .filter(Boolean)
  .map((line) => line.slice(3));
const changedAppPaths = changedPaths.filter((path) => path.startsWith("app/"));
const committedAppPaths = execFileSync(
  "git",
  ["diff", "--name-only", `${immutableBaseline}..HEAD`, "--", "app"],
  { cwd: root, encoding: "utf8" },
).trim().split("\n").filter(Boolean);
const forbiddenChangedPaths = changedPaths.filter((path) =>
  path === "proxy.ts" ||
  path === "netlify.toml" ||
  /^middleware\.(?:ts|js|mts|mjs)$/.test(path) ||
  /^(?:supabase\/migrations\/|supabase\/.*schema)/.test(path) ||
  /^(?:\.env(?:\..*)?|netlify\/|\.netlify\/)/.test(path)
);
const noSecondRuntimeRoute =
  (changedAppPaths.length === 1 && changedAppPaths[0] === routePath) ||
  (changedAppPaths.length === 0 && committedAppPaths.length === 1 && committedAppPaths[0] === routePath);
const noRuntimeBoundaryConfigChanges = forbiddenChangedPaths.length === 0;

const sectionsFound = requiredSections.every((value) => doc.includes(value));
const recoveryFound = ["6a501645908e4100088b7396", "512a0c5"].every((value) =>
  doc.includes(value),
);
const upstreamFound = upstream.every((value) => doc.includes(value));
const action361ReadyFound = [
  "readiness decision: `ready`", "failed conditions: none",
  "Netlify runtime trust: false", "preview deployment: blocked pending this separate gate",
].every((value) => doc.includes(value));
const approvalFound = [
  "approval_vocabulary: approved | approved_with_conditions | blocked",
  "approval_decision: approved", "Decision: `approved`",
  "Action 362 performs no deployment", "external_endpoint_contacted: false",
].every((value) => doc.includes(value));
const boundaryFound = [
  "At most one non-production Netlify preview deployment attempt",
  "introduces no code changes", "No production deploy", "No main push",
  "validation is limited to one route", "without code, config, or environment changes",
].every((value) => doc.includes(value));
const contractFound = [
  "GET /api/runtime-health/ping", "HTTP 200",
  "Content-Type: application/json; charset=utf-8", "Cache-Control: no-store, max-age=0",
  '"route_build_marker": "action_344_future_runtime_ping_only_route"',
  '"deploy_readiness_required": true', "no additional keys", "byte-identical",
].every((value) => doc.includes(value));
const observationFound = [
  "framework-managed HTTP 405", "authentication redirect", "proxy redirect",
  "HTTP 400 empty-body regression", "Unexpected HTML", "Automatic redirect following must be disabled",
  "function/runtime initialization failure", "No remediation occurs in the same Action",
].every((value) => doc.includes(value));
const evidenceFound = [
  "repository revision identifier", "exact deployed route source hash",
  "preview deployment identifier", "preview URL", "non-production target classification",
  "deployment timestamp", "GET status", "response headers", "exact response body",
  "POST and PUT results", "redirect chain", "stop-condition result",
  "final preview validation decision",
].every((value) => doc.includes(value));
const trustAndBlocksFound = [
  "Netlify_runtime_trusted: false", "production_deployment_approved: false",
  "main_push_allowed: false", "Action 362 records no preview URL",
].every((value) => doc.includes(value));
const nextActionFound = doc.includes(
  "one Runtime Ping-Only Preview Deployment and Validation Attempt",
);

const passed = docFound && routeExact && sectionsFound && recoveryFound && upstreamFound &&
  action361ReadyFound && approvalFound && boundaryFound && contractFound && observationFound &&
  evidenceFound && trustAndBlocksFound && nextActionFound && noSecondRuntimeRoute &&
  noRuntimeBoundaryConfigChanges;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_decision: "approved",
  one_preview_deployment_attempt_approved_for_later_action: true,
  preview_deployment_performed: false,
  external_endpoint_contacted: false,
  Netlify_runtime_trusted: false,
  production_deployment_approved: false,
  main_push_allowed: false,
  document_found: docFound,
  required_sections_found: sectionsFound,
  recovery_identifiers_found: recoveryFound,
  upstream_actions_found: upstreamFound,
  action_361_ready_decision_found: action361ReadyFound,
  deterministic_gate_conditions_found: boundaryFound,
  exact_validation_contract_found: contractFound,
  proxy_auth_regression_observation_plan_found: observationFound,
  stop_conditions_found: doc.includes("## Stop Conditions"),
  evidence_requirements_found: evidenceFound,
  route_source_remains_exact: routeExact,
  changed_app_paths: changedAppPaths,
  committed_app_paths_since_immutable_baseline: committedAppPaths,
  no_second_runtime_route: noSecondRuntimeRoute,
  forbidden_changed_paths: forbiddenChangedPaths,
  no_Netlify_proxy_middleware_config_changes: noRuntimeBoundaryConfigChanges,
  deployment_and_main_blocks_found: trustAndBlocksFound,
  failed_conditions: [],
  unresolved_conditions: [
    "Netlify_runtime_untrusted", "preview_not_deployed_or_validated",
    "preview_identifier_URL_timestamp_logs_and_host_behavior_unknown",
    "production_and_main_approvals_absent",
  ],
  no_effect_flags: {
    deployment_performed: false, Netlify_call_executed: false,
    external_endpoint_contacted: false, route_changed: false,
    additional_runtime_file_added: false, provider_call_executed: false,
    supabase_read_executed: false, supabase_write_executed: false,
    persisted_data: false, replay_executed: false,
    scanner_behavior_changed: false, live_ranking_changed: false,
  },
  recommended_next_step: passed
    ? "create_one_runtime_ping_preview_deployment_and_validation_attempt_action"
    : "resolve_preview_gate_isolation_or_contract_failures",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
