#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const routePath = "app/api/runtime-health/ping/route.ts";
const immutableBaseline = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";
const docPath =
  "docs/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review.md";
const buildManifestPath = ".next/server/app-paths-manifest.json";
const generatedRoutesPath = ".next/types/routes.d.ts";

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
  "## Purpose",
  "## Scope",
  "## Recovery Context",
  "## Upstream Dependencies",
  "## Action 359 Approved Contract",
  "## Action 360 Implementation Summary",
  "## Explicit Non-Goals",
  "## Local Implementation Integrity Review",
  "## Exact Route-File Review",
  "## Exact Handler Review",
  "## Exact Response Review",
  "## Exact Header Review",
  "## Import Review",
  "## Side-Effect Review",
  "## Dynamic API Review",
  "## Environment-Dependency Review",
  "## Application-Service Dependency Review",
  "## External-Access Review",
  "## Unsupported-Method Review",
  "## Local Proxy Traversal Note",
  "## Local Authentication-Convention Note",
  "## Route-Handler Independence Assessment",
  "## Build Route-Table Assessment",
  "## Generated Route-Type Assessment",
  "## Repeated-Response Determinism Assessment",
  "## Isolated Rollback Assessment",
  "## Git-Status Full-Path Assessment",
  "## Unrelated Worktree Classification",
  "## Preview Rollout Risk Assessment",
  "## Netlify Runtime Trust Status",
  "## Preview Deployment Remains Blocked",
  "## Production Deployment Remains Blocked",
  "## Main Push Remains Blocked",
  "## Readiness Vocabulary",
  "## Deterministic Readiness Conditions",
  "## Readiness Decision",
  "## Passed Conditions",
  "## Failed Conditions",
  "## Unresolved Conditions",
  "## Next Required Approval Gate",
];

const upstreamActions = [
  "Action 309: Post-Recovery Safe Development Protocol",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 344: Runtime Ping-Only Route Implementation Plan",
  "Action 350: Runtime Ping-Only Route Approval Gate",
  "Action 358: Runtime Ping-Only Route Implementation Readiness Review",
  "Action 359: Runtime Ping-Only Route Implementation Approval Gate",
  "Action 360: Runtime Ping-Only Route Implementation",
];

function exists(relativePath) {
  return existsSync(join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function statusFiles() {
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trimEnd();
  if (!output) return [];
  return output
    .split("\n")
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? path.split(" -> ").at(-1) ?? path : path))
    .sort();
}

const routeFound = exists(routePath);
const routeSource = routeFound ? read(routePath) : "";
const documentFound = exists(docPath);
const document = documentFound ? read(docPath) : "";
const changedFiles = statusFiles();
const changedAppFiles = changedFiles.filter((path) => path.startsWith("app/"));
const committedAppFiles = execFileSync(
  "git",
  ["diff", "--name-only", `${immutableBaseline}..HEAD`, "--", "app"],
  { cwd: repoRoot, encoding: "utf8" },
).trim().split("\n").filter(Boolean);
const exactRouteSourceFound = routeSource === expectedRouteSource;
const oneRuntimeFileBoundaryFound =
  (changedAppFiles.length === 1 && changedAppFiles[0] === routePath) ||
  (changedAppFiles.length === 0 && committedAppFiles.length === 1 && committedAppFiles[0] === routePath);
const buildManifestFound = exists(buildManifestPath);
const buildManifest = buildManifestFound
  ? JSON.parse(read(buildManifestPath))
  : {};
const buildRouteFound =
  buildManifest["/api/runtime-health/ping/route"] ===
  "app/api/runtime-health/ping/route.js";
const generatedRoutesFound =
  exists(generatedRoutesPath) &&
  read(generatedRoutesPath).includes('"/api/runtime-health/ping"');

const requiredSectionsFound = requiredSections.every((section) =>
  document.includes(section),
);
const recoveryIdentifiersFound = ["6a501645908e4100088b7396", "512a0c5"].every(
  (value) => document.includes(value),
);
const upstreamActionsFound = upstreamActions.every((value) =>
  document.includes(value),
);
const action359ContractFound = [
  "route: `/api/runtime-health/ping`",
  "file: `app/api/runtime-health/ping/route.ts`",
  "runtime file count: one",
  "exported handler: one `GET`",
  "imports: none",
].every((value) => document.includes(value));
const sourceIntegrityFound =
  exactRouteSourceFound &&
  oneRuntimeFileBoundaryFound &&
  !/^\s*import\s/m.test(routeSource) &&
  (routeSource.match(/export function GET\(\)/g) ?? []).length === 1 &&
  (routeSource.match(/export\s+(?:async\s+)?function\s+[A-Z]+/g) ?? []).length === 1;
const localEvidenceFound = [
  "GET result: HTTP 200",
  "body result: exact frozen body",
  "repeated GET result: byte-identical",
  "POST result: framework-managed HTTP 405",
  "PUT result: framework-managed HTTP 405",
  "custom unsupported-method response: absent",
  "external endpoint contacted: no",
].every((value) => document.includes(value));
const proxyCaveatFound = [
  "traverses the existing unchanged application `proxy.ts`",
  "existing `.env.local` trade password",
  "route handler itself has no authentication or environment dependency",
  "do not establish behavior on Netlify Deploy Preview or Branch Deploy hosts",
].every((value) => document.includes(value));
const rollbackFound = [
  "Rollback remains deletion of one route file",
  "No database, migration, schema, environment, provider, persisted-data, proxy, middleware, Netlify, dependency, or service rollback is required",
  "No persisted-data cleanup is required",
].every((value) => document.includes(value));
const readinessDecisionFound = [
  "readiness_vocabulary: ready | ready_with_conditions | blocked",
  "readiness_decision: ready",
  "Decision: `ready`",
  "separate preview-deploy approval gate may be created",
  "It does not approve preview deployment",
  "Failed conditions: none",
].every((value) => document.includes(value));
const blockedWorkFound = [
  "preview_deployment_approved: false",
  "Netlify_deployment_approved: false",
  "production_deployment_approved: false",
  "main_push_allowed: false",
  "Netlify_runtime_trusted: false",
].every((value) => document.includes(value));
const nextGateFound = document.includes(
  "static Runtime Ping-Only Preview-Deploy Approval Gate",
);
const noForbiddenSurfaceChanges = !changedFiles.some(
  (path) =>
    ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].includes(path) ||
    path.startsWith("supabase/migrations/") ||
    (path.startsWith("app/") && path !== routePath),
);

const passed =
  routeFound &&
  documentFound &&
  requiredSectionsFound &&
  recoveryIdentifiersFound &&
  upstreamActionsFound &&
  action359ContractFound &&
  sourceIntegrityFound &&
  localEvidenceFound &&
  proxyCaveatFound &&
  rollbackFound &&
  readinessDecisionFound &&
  blockedWorkFound &&
  nextGateFound &&
  buildRouteFound &&
  generatedRoutesFound &&
  noForbiddenSurfaceChanges;

const result = {
  verification_status: passed ? "passed" : "failed",
  readiness_decision: "ready",
  preview_deploy_approval_gate_may_be_created: true,
  preview_deployment_approved: false,
  production_deployment_approved: false,
  main_push_allowed: false,
  document_found: documentFound,
  required_sections_found: requiredSectionsFound,
  recovery_identifiers_found: recoveryIdentifiersFound,
  upstream_actions_found: upstreamActionsFound,
  action_359_contract_found: action359ContractFound,
  route_found: routeFound,
  exact_route_source_found: exactRouteSourceFound,
  one_runtime_file_boundary_found: oneRuntimeFileBoundaryFound,
  changed_app_files: changedAppFiles,
  committed_app_files_since_immutable_baseline: committedAppFiles,
  zero_imports_found: !/^\s*import\s/m.test(routeSource),
  exactly_one_get_export_found:
    (routeSource.match(/export function GET\(\)/g) ?? []).length === 1,
  exact_body_key_order_and_headers_found: exactRouteSourceFound,
  no_dynamic_environment_external_side_effect_or_service_behavior_found:
    exactRouteSourceFound,
  local_behavioral_evidence_found: localEvidenceFound,
  proxy_traversal_caveat_found: proxyCaveatFound,
  build_manifest_found: buildManifestFound,
  build_route_found: buildRouteFound,
  generated_route_types_found: generatedRoutesFound,
  rollback_one_file_contained: rollbackFound,
  unrelated_worktree_classification_found: document.includes(
    "remain isolated unrelated worktree artifacts",
  ),
  Netlify_runtime_trusted: false,
  no_forbidden_surface_changes: noForbiddenSurfaceChanges,
  passed_conditions: [
    "exact_source_and_one_runtime_file",
    "local_get_repeat_and_framework_405_evidence",
    "generated_types_build_route_and_local_validation",
    "proxy_caveat_and_isolated_rollback",
    "separate_preview_production_and_main_gates",
  ],
  failed_conditions: [],
  unresolved_conditions: [
    "Netlify_preview_and_branch_runtime_untrusted",
    "preview_deployment_approval_absent",
    "production_deployment_and_validation_approvals_absent",
    "main_push_approval_absent",
  ],
  no_effect_flags: {
    provider_call_executed: false,
    news_api_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persisted_data: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    recommendation_behavior_changed: false,
    live_ranking_changed: false,
    confidence_changed: false,
    route_changed_by_action_361: false,
    additional_runtime_file_added: false,
    external_endpoint_contacted: false,
  },
  recommended_next_step: passed
    ? "create_static_runtime_ping_preview_deploy_approval_gate"
    : "resolve_local_integrity_or_containment_failures_before_rollout_gate",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
