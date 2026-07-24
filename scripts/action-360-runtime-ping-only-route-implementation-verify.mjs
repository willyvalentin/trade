#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const routePath = "app/api/runtime-health/ping/route.ts";
const immutableBaseline = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";
const docPath = "docs/action-360-runtime-ping-only-route-implementation.md";
const testPath = "tests/e2e/action-360-runtime-ping-only-route-implementation.spec.ts";

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

const requiredDocSections = [
  "## Purpose",
  "## Approved Implementation Boundary",
  "## Exact Route Path",
  "## Exact File Path",
  "## Exact Response Contract",
  "## Exact Headers",
  "## GET-Only Behavior",
  "## Framework-Handled Unsupported Methods",
  "## Native Response Usage",
  "## No-Import Guarantee",
  "## Deterministic Behavior",
  "## Environment Independence",
  "## Provider Independence",
  "## Supabase Independence",
  "## Persistence Independence",
  "## No-Service-Initialization Guarantee",
  "## Rollback Procedure",
  "## Local Validation Strategy",
  "## Deployment Remains Blocked",
  "## Preview Deploy Remains Blocked",
  "## Production Deploy Remains Blocked",
  "## Main Push Remains Blocked",
  "## Runtime Trust Boundary",
  "## Next Required Approval Gate",
];

const forbiddenRuntimeFiles = ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"];

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
const docFound = exists(docPath);
const doc = docFound ? read(docPath) : "";
const testFound = exists(testPath);
const changedFiles = statusFiles();
const changedAppFiles = changedFiles.filter((path) => path.startsWith("app/"));
const unexpectedAppFiles = changedAppFiles.filter((path) => path !== routePath);
const committedAppFiles = execFileSync(
  "git",
  ["diff", "--name-only", `${immutableBaseline}..HEAD`, "--", "app"],
  { cwd: repoRoot, encoding: "utf8" },
).trim().split("\n").filter(Boolean);
const forbiddenSurfaceChanges = changedFiles.filter(
  (path) =>
    forbiddenRuntimeFiles.includes(path) ||
    path.startsWith("supabase/migrations/") ||
    /(^|\/)schema(s)?\//.test(path),
);

const exactRouteSourceFound = routeSource === expectedRouteSource;
const exactlyOneRuntimeFileFound =
  (changedAppFiles.length === 1 && changedAppFiles[0] === routePath) ||
  (changedAppFiles.length === 0 && committedAppFiles.length === 1 && committedAppFiles[0] === routePath);
const exactHandlerBoundaryFound =
  (routeSource.match(/export function GET\(\)/g) ?? []).length === 1 &&
  (routeSource.match(/export\s+(?:async\s+)?function\s+[A-Z]+/g) ?? []).length === 1;
const noImportsFound = !/^\s*import\s/m.test(routeSource);
const nativeResponseFound = routeSource.includes("return new Response(JSON.stringify(body)");
const exactHeadersFound =
  routeSource.includes('"Content-Type": "application/json; charset=utf-8"') &&
  routeSource.includes('"Cache-Control": "no-store, max-age=0"') &&
  (routeSource.match(/^\s+"[A-Za-z-]+":/gm) ?? []).length === 2;
const noForbiddenDynamicApisFound = ![
  ["process", ".env"].join(""),
  ["Date", ".now"].join(""),
  ["new ", "Date"].join(""),
  ["performance", ".now"].join(""),
  ["Math", ".random"].join(""),
  "randomUUID",
  "crypto",
  ["fetch", "("].join(""),
  "setTimeout",
  "setInterval",
  ["console", "."].join(""),
  "readFile",
  "writeFile",
  "appendFile",
].some((marker) => routeSource.includes(marker));
const noExternalOrServiceReferencesFound = exactRouteSourceFound && noImportsFound;
const action359ApprovalFound =
  exists("docs/action-359-runtime-ping-only-route-implementation-approval-gate.md") &&
  read("docs/action-359-runtime-ping-only-route-implementation-approval-gate.md").includes(
    "approval_decision: approved",
  );
const requiredDocSectionsFound = requiredDocSections.every((section) => doc.includes(section));
const blockedWorkFound = [
  "deployment_approved: false",
  "preview_deployment_approved: false",
  "production_deployment_approved: false",
  "main_push_allowed: false",
  "Local implementation and local test success do not establish Netlify runtime trust",
].every((phrase) => doc.includes(phrase));

const passed =
  routeFound &&
  docFound &&
  testFound &&
  exactRouteSourceFound &&
  exactlyOneRuntimeFileFound &&
  unexpectedAppFiles.length === 0 &&
  forbiddenSurfaceChanges.length === 0 &&
  exactHandlerBoundaryFound &&
  noImportsFound &&
  nativeResponseFound &&
  exactHeadersFound &&
  noForbiddenDynamicApisFound &&
  noExternalOrServiceReferencesFound &&
  action359ApprovalFound &&
  requiredDocSectionsFound &&
  blockedWorkFound;

const result = {
  verification_status: passed ? "passed" : "failed",
  implementation_status: passed ? "implemented_locally" : "invalid_or_incomplete",
  route_found: routeFound,
  exact_route_source_found: exactRouteSourceFound,
  exact_route_path: "/api/runtime-health/ping",
  exact_route_file: routePath,
  exactly_one_runtime_file_found: exactlyOneRuntimeFileFound,
  changed_app_files: changedAppFiles,
  committed_app_files_since_immutable_baseline: committedAppFiles,
  unexpected_app_files: unexpectedAppFiles,
  forbidden_surface_changes: forbiddenSurfaceChanges,
  exactly_one_get_export_found: exactHandlerBoundaryFound,
  no_imports_found: noImportsFound,
  native_response_found: nativeResponseFound,
  exact_response_and_field_order_found: exactRouteSourceFound,
  exact_headers_found: exactHeadersFound,
  no_extra_application_headers_found: exactHeadersFound,
  no_request_derived_behavior_found: exactRouteSourceFound,
  no_environment_wall_clock_random_network_filesystem_logging_or_timers_found:
    noForbiddenDynamicApisFound,
  no_external_or_shared_service_references_found: noExternalOrServiceReferencesFound,
  action_359_approved_boundary_found: action359ApprovalFound,
  required_documentation_found: requiredDocSectionsFound,
  deployment_approved: false,
  main_push_allowed: false,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    news_api_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persisted_data: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    recommendation_behavior_changed: false,
    live_ranking_changed: false,
    confidence_changed: false,
  },
  recommended_next_step: passed
    ? "run_static_and_local_validation_without_deploy"
    : "restore_exact_action_359_boundary_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
