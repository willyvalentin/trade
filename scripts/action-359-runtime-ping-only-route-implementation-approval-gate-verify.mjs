#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-359-runtime-ping-only-route-implementation-approval-gate.md";
const routePath = "app/api/runtime-health/ping/route.ts";
const action360VerifierPath =
  "scripts/action-360-runtime-ping-only-route-implementation-verify.mjs";

const requiredSections = [
  "## Purpose",
  "## Scope",
  "## Recovery Context",
  "## Authoritative Upstream Dependencies",
  "## Action 358 Readiness Result",
  "## Explicit Non-Goals",
  "## Approval Vocabulary",
  "## Deterministic Gate Conditions",
  "## Exact Approved Future Route Path",
  "## Exact Approved Future File Path",
  "## Allowed Future File Count",
  "## Allowed HTTP Method",
  "## Exact Response Schema",
  "## Exact Status-Code Contract",
  "## Exact Content-Type Contract",
  "## Exact Cache-Control Contract",
  "## Exact Additional Header Contract",
  "## Unsupported-Method Expectations",
  "## Request-Independence Requirements",
  "## Environment-Independence Requirements",
  "## Authentication-Independence Requirements",
  "## Provider-Independence Requirements",
  "## Supabase-Independence Requirements",
  "## Persistence-Independence Requirements",
  "## Filesystem-Independence Requirements",
  "## Deterministic Response Requirements",
  "## No-Wall-Clock Requirement",
  "## No-Dynamic-Metadata Requirement",
  "## Import Allowlist",
  "## Import Denylist",
  "## Side-Effect Prohibition",
  "## Failure-Containment Requirements",
  "## Route-Isolation Requirements",
  "## Generated-Type Requirements",
  "## Local Test Requirements",
  "## Build Validation Requirements",
  "## Rollback Requirements",
  "## Implementation Diff Requirements",
  "## Acceptance Criteria",
  "## Rejection Criteria",
  "## Approval Decision",
  "## Passed and Failed Gate Conditions",
  "## Work Remaining Blocked After Approval",
  "## Deployment Remains Separately Gated",
  "## Main Push Remains Separately Gated",
  "## Next Permitted Action",
];

const upstreamReferences = [
  "Action 309: Post-Recovery Safe Development Protocol",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 344: Runtime Ping-Only Route Implementation Plan",
  "Action 350: Runtime Ping-Only Route Approval Gate",
  "Action 358: Runtime Ping-Only Route Implementation Readiness Review",
];

const exactResponseContract = [
  '"ok": true',
  '"route_ping": true',
  '"route_build_marker": "action_344_future_runtime_ping_only_route"',
  '"provider_call_executed": false',
  '"provider_call_attempted": false',
  '"supabase_read_executed": false',
  '"supabase_write_executed": false',
  '"replay_executed": false',
  '"synthetic_outcomes_persisted": false',
  '"scanner_behavior_changed": false',
  '"live_ranking_changed": false',
  '"recommendation_rows_mutated": false',
  '"runtime_route_scope": "ping_only"',
  '"deploy_readiness_required": true',
];

const forbiddenChangedPrefixes = ["app/api/", "supabase/migrations/"];
const forbiddenChangedFiles = ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"];

function exists(relativePath) {
  return existsSync(join(repoRoot, relativePath));
}

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
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

function authorizedAction360RoutePresent() {
  if (!exists(routePath) || !exists(action360VerifierPath)) return false;
  try {
    const output = execFileSync("node", [action360VerifierPath], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    return JSON.parse(output).verification_status === "passed";
  } catch {
    return false;
  }
}

const documentFound = exists(docPath);
const content = documentFound ? read(docPath) : "";
const changedFiles = statusFiles();
const authorizedAction360Route = authorizedAction360RoutePresent();
const runtimeSurfaceChanges = changedFiles.filter(
  (path) =>
    (forbiddenChangedPrefixes.some((prefix) => path.startsWith(prefix)) &&
      !(authorizedAction360Route && path === routePath)) ||
    forbiddenChangedFiles.includes(path),
);

const requiredSectionsFound = includesAll(content, requiredSections);
const recoveryIdentifiersFound = includesAll(content, ["6a501645908e4100088b7396", "512a0c5"]);
const upstreamReferencesFound = includesAll(content, upstreamReferences);
const action358ReadyFound = includesAll(content, [
  "readiness decision: `ready`",
  "failed readiness conditions: none",
  "future route boundary: `/api/runtime-health/ping`",
  "future route file: `app/api/runtime-health/ping/route.ts`",
]);
const approvalVocabularyFound = includesAll(content, [
  "approval_vocabulary: approved | approved_with_conditions | blocked",
  "approval_decision: approved",
  "Decision: `approved`",
]);
const approvalBoundaryFound = includesAll(content, [
  "a later Action may add the single approved route file and focused tests/verifier updates",
  "It does not mean deployment, preview deployment, production rollout, main push",
  "Route implementation has not occurred in Action 359",
]);
const exactRouteBoundaryFound = includesAll(content, [
  "URL path: `/api/runtime-health/ping`",
  "`app/api/runtime-health/ping/route.ts`",
  "exactly one runtime file",
  "exactly one handler named `GET`",
]);
const exactResponseContractFound =
  includesAll(content, exactResponseContract) &&
  includesAll(content, [
    "key ordering are frozen",
    "HTTP 200 only",
    "Content-Type: application/json; charset=utf-8",
    "Cache-Control: no-store, max-age=0",
    "No additional application-defined header is approved",
  ]);
const deterministicConditionsFound = includesAll(content, [
  "response is request-independent",
  "no wall-clock or dynamic metadata exists",
  "no environment or authentication dependency exists",
  "no provider, news, Supabase, persistence, filesystem, or network dependency exists",
  "rollback is one-file removal",
]);
const independenceFound = includesAll(content, [
  ["No `process", ".env`"].join(""),
  "No automation secret, cookie, session, authorization header",
  "No Twelve Data, market-data, broker, news, external HTTP client, fetch",
  "No Supabase client, database client",
  "No candle, fetch-run, response, outcome, synthetic outcome",
  "No filesystem module",
]);
const noDynamicFieldsFound = includesAll(content, [
  "No current timestamp, current time",
  "deployment ID, commit SHA, branch, environment name, hostname, region",
  "runtime version discovered dynamically",
  "user/session information, request metadata, secrets, or random identifiers",
]);
const importBoundaryFound = includesAll(content, [
  "The import allowlist is empty",
  ["must not import `next", "/server`"].join(""),
  "Imports are forbidden from:",
  "Supabase and database modules",
  "shared project helpers of any kind",
]);
const sideEffectsAndIsolationFound = includesAll(content, [
  "No read or write outside literal module initialization is approved",
  "no cascading imports or dependency initialization",
  "static path with no dynamic segment",
  "must not be imported by any other module",
]);
const unsupportedMethodsFound = includesAll(content, [
  "Only `GET` is exported",
  "automatically supplies `OPTIONS`",
  "`POST` does not invoke `GET` or application code",
  "No custom unsupported-method, `HEAD`, or `OPTIONS` handler is approved",
]);
const validationOrderFound =
  content.indexOf("1. `npx next typegen`") >= 0 &&
  content.indexOf("2. `npx tsc --noEmit`") > content.indexOf("1. `npx next typegen`") &&
  content.includes("`npx next typegen` must precede `npx tsc --noEmit`");
const localTestAndRollbackFound = includesAll(content, [
  "`GET /api/runtime-health/ping` returns HTTP 200",
  "repeated requests return byte-equivalent bodies",
  "test may use only localhost",
  "Source rollback is trivial: remove the single route file",
]);
const deploymentAndMainBlockedFound = includesAll(content, [
  "deployment_approved: false",
  "preview_deployment_approved: false",
  "production_rollout_approved: false",
  "main_push_allowed: false",
  "Implementation approval is not deployment approval",
  "Implementation approval is not main-push approval",
]);
const nextActionFound = content.includes(
  "next permitted Action is a narrowly scoped Runtime Ping-Only Route Implementation Action",
);
const routeImplementationAbsent = !exists(routePath);
const routeImplementationStateValid =
  routeImplementationAbsent || authorizedAction360Route;
const runtimeSurfacesUnchanged = runtimeSurfaceChanges.length === 0;

const passed =
  documentFound &&
  requiredSectionsFound &&
  recoveryIdentifiersFound &&
  upstreamReferencesFound &&
  action358ReadyFound &&
  approvalVocabularyFound &&
  approvalBoundaryFound &&
  exactRouteBoundaryFound &&
  exactResponseContractFound &&
  deterministicConditionsFound &&
  independenceFound &&
  noDynamicFieldsFound &&
  importBoundaryFound &&
  sideEffectsAndIsolationFound &&
  unsupportedMethodsFound &&
  validationOrderFound &&
  localTestAndRollbackFound &&
  deploymentAndMainBlockedFound &&
  nextActionFound &&
  routeImplementationStateValid &&
  runtimeSurfacesUnchanged;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_decision: "approved",
  approval_allows_later_single_route_implementation_action: true,
  route_implemented: false,
  runtime_route_changes_allowed_in_action_359: false,
  deployment_approved: false,
  main_push_allowed: false,
  document_found: documentFound,
  required_sections_found: requiredSectionsFound,
  recovery_identifiers_found: recoveryIdentifiersFound,
  upstream_references_found: upstreamReferencesFound,
  action_358_ready_decision_found: action358ReadyFound,
  approval_vocabulary_found: approvalVocabularyFound,
  approval_boundary_found: approvalBoundaryFound,
  exact_route_boundary_found: exactRouteBoundaryFound,
  exact_response_contract_found: exactResponseContractFound,
  deterministic_gate_conditions_found: deterministicConditionsFound,
  independence_requirements_found: independenceFound,
  dynamic_fields_forbidden: noDynamicFieldsFound,
  import_allowlist_empty_and_denylist_explicit: importBoundaryFound,
  side_effect_and_isolation_requirements_found: sideEffectsAndIsolationFound,
  unsupported_method_boundary_found: unsupportedMethodsFound,
  validation_order_found: validationOrderFound,
  local_test_and_rollback_found: localTestAndRollbackFound,
  route_implementation_absent: routeImplementationAbsent,
  authorized_action_360_route_present: authorizedAction360Route,
  route_implementation_state_valid: routeImplementationStateValid,
  runtime_surfaces_unchanged: runtimeSurfacesUnchanged,
  runtime_surface_changes: runtimeSurfaceChanges,
  passed_gate_conditions: [
    "frozen_route_file_method_response_status_headers",
    "request_environment_auth_provider_supabase_persistence_independence",
    "empty_import_allowlist_and_explicit_denylist",
    "no_side_effects_and_isolated_failure_boundary",
    "typegen_first_local_validation_and_trivial_rollback",
  ],
  failed_gate_conditions: [],
  exact_approved_future_route: "/api/runtime-health/ping",
  exact_approved_future_file: "app/api/runtime-health/ping/route.ts",
  approved_runtime_file_count: 1,
  approved_handler: "GET",
  next_permitted_action: nextActionFound
    ? "runtime_ping_only_route_implementation_action"
    : "none_until_gate_contract_is_complete",
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
    ? "create_later_single_file_runtime_ping_implementation_action_without_deploy"
    : "resolve_approval_gate_contract_or_repository_boundary_failures",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
