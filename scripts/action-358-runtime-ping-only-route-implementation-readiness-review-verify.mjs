#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const docPath = "docs/action-358-runtime-ping-only-route-implementation-readiness-review.md";
const futureRoutePath = "app/api/runtime-health/ping/route.ts";
const action360VerifierPath =
  "scripts/action-360-runtime-ping-only-route-implementation-verify.mjs";

const requiredSections = [
  "## Purpose",
  "## Scope",
  "## Recovery Context",
  "## Authoritative Upstream Dependencies",
  "## Explicit Non-Goals",
  "## Current Runtime Block Status",
  "## Proposed Future Route Boundary",
  "## Allowed Future Route Behavior",
  "## Forbidden Future Route Behavior",
  "## Response Contract",
  "### HTTP Method Contract",
  "### Status-Code Contract",
  "### Body Contract",
  "### Header Contract",
  "### Cache-Control Contract",
  "### Content-Type Contract",
  "### Environment Independence",
  "### Authentication Independence",
  "### Provider Independence",
  "### Supabase Independence",
  "### Persistence Independence",
  "### Filesystem Independence",
  "## Deterministic Response Requirements",
  "## Failure Containment Requirements",
  "## No-Import Boundary",
  "## Next.js Route Compatibility Assessment",
  "## Generated Route-Type Assessment",
  "## Build and Typegen Implications",
  "## Playwright Strategy",
  "## Verifier Strategy",
  "## Local Invocation Strategy",
  "## Deployment Remains Blocked",
  "## Rollback Requirements",
  "## Acceptance Criteria",
  "## Rejection Criteria",
  "## Readiness Decision",
  "## Unresolved Conditions",
  "## Next Approval Gate Required Before Implementation",
];

const upstreamReferences = [
  "Action 309: Post-Recovery Safe Development Protocol",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 344: Runtime Ping-Only Route Implementation Plan",
  "Action 350: Runtime Ping-Only Route Approval Gate",
  "Action 357: Pattern Insight Static Fixture Implementation",
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

const dynamicMetadataForbidden = [
  "no current timestamp",
  "deployment ID",
  "commit SHA",
  "environment name",
  "hostname",
  "region",
  "process uptime",
  "provider status",
  "database status",
  "user/session data",
];

const forbiddenChangedPrefixes = ["app/api/", "supabase/migrations/"];
const forbiddenChangedFiles = [
  "proxy.ts",
  "middleware.ts",
  "middleware.js",
  "netlify.toml",
];

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
  if (!exists(futureRoutePath) || !exists(action360VerifierPath)) return false;
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
      !(authorizedAction360Route && path === futureRoutePath)) ||
    forbiddenChangedFiles.includes(path),
);

const requiredSectionsFound = includesAll(content, requiredSections);
const upstreamReferencesFound = includesAll(content, upstreamReferences);
const recoveryIdentifiersFound = includesAll(content, [
  "6a501645908e4100088b7396",
  "512a0c5",
]);
const readinessVocabularyFound = includesAll(content, [
  "readiness_vocabulary: ready | ready_with_conditions | blocked",
  "readiness_decision: ready",
  "Decision: `ready`",
]);
const reviewApprovalDistinctionFound = includesAll(content, [
  "a separate implementation approval gate may be created",
  "It does not approve route implementation",
  "implementation approval is not deploy approval",
]);
const exactRouteBoundaryFound = includesAll(content, [
  "`/api/runtime-health/ping`",
  "`app/api/runtime-health/ping/route.ts`",
  "one `GET` handler only",
]);
const deterministicResponseContractFound =
  includesAll(content, exactResponseContract) &&
  includesAll(content, [
    "Cache-Control: no-store, max-age=0",
    "Content-Type: application/json; charset=utf-8",
    "HTTP 200",
    "constructed entirely from literals",
  ]);
const independenceFound = includesAll(content, [
  ["No `process", ".env`"].join(""),
  "No cookie, session, authorization header, automation secret",
  "No market-data, Twelve Data, news, broker, or external HTTP client",
  "No Supabase client",
  "No candle, fetch-run, outcome, recommendation, snapshot, learning, audit, log, or synthetic outcome persistence",
  "must not read files",
]);
const failureContainmentFound = includesAll(content, [
  "no cascading imports",
  "application service initialization",
  "No proxy, middleware, adapter, application layout, shared API wrapper, or Netlify configuration",
  "preferred implementation uses the global Web `Response` API and imports nothing",
]);
const dynamicMetadataForbiddenFound = includesAll(content, dynamicMetadataForbidden);
const generatedTypeRiskFound = includesAll(content, [
  "stale generated route state",
  "Stale generated route-type behavior observed around Action 356",
  "`.next/types`",
  "`next-env.d.ts`",
]);
const validationOrderFound =
  content.indexOf("1. `npx next typegen`") >= 0 &&
  content.indexOf("2. `npx tsc --noEmit`") > content.indexOf("1. `npx next typegen`") &&
  content.includes("`npx next typegen` must precede `npx tsc --noEmit`");
const blockedWorkFound = includesAll(content, [
  "route_implementation_approved: false",
  "runtime_route_changes_allowed: false",
  "deploy_approved: false",
  "preview_deploy_approved: false",
  "production_deploy_approved: false",
  "main_push_allowed: false",
  "Deployment Remains Blocked",
]);
const nextGateRequiredFound = includesAll(content, [
  "separate, explicit runtime ping-only route implementation approval gate",
  "remains closed until the user authorizes",
]);
const routeImplementationAbsent = !exists(futureRoutePath);
const routeImplementationStateValid =
  routeImplementationAbsent || authorizedAction360Route;
const runtimeSurfacesUnchanged = runtimeSurfaceChanges.length === 0;

const passed =
  documentFound &&
  requiredSectionsFound &&
  upstreamReferencesFound &&
  recoveryIdentifiersFound &&
  readinessVocabularyFound &&
  reviewApprovalDistinctionFound &&
  exactRouteBoundaryFound &&
  deterministicResponseContractFound &&
  independenceFound &&
  failureContainmentFound &&
  dynamicMetadataForbiddenFound &&
  generatedTypeRiskFound &&
  validationOrderFound &&
  blockedWorkFound &&
  nextGateRequiredFound &&
  routeImplementationStateValid &&
  runtimeSurfacesUnchanged;

const result = {
  verification_status: passed ? "passed" : "failed",
  readiness_decision: "ready",
  readiness_means_separate_implementation_gate_may_be_created: true,
  route_implementation_approved: false,
  runtime_route_changes_allowed: false,
  deploy_approved: false,
  main_push_allowed: false,
  document_found: documentFound,
  required_sections_found: requiredSectionsFound,
  upstream_references_found: upstreamReferencesFound,
  recovery_identifiers_found: recoveryIdentifiersFound,
  readiness_vocabulary_found: readinessVocabularyFound,
  review_approval_distinction_found: reviewApprovalDistinctionFound,
  exact_route_boundary_found: exactRouteBoundaryFound,
  deterministic_response_contract_found: deterministicResponseContractFound,
  environment_provider_supabase_persistence_independence_found: independenceFound,
  failure_containment_found: failureContainmentFound,
  dynamic_metadata_forbidden_found: dynamicMetadataForbiddenFound,
  generated_type_risk_found: generatedTypeRiskFound,
  validation_order_found: validationOrderFound,
  route_implementation_absent: routeImplementationAbsent,
  authorized_action_360_route_present: authorizedAction360Route,
  route_implementation_state_valid: routeImplementationStateValid,
  runtime_surfaces_unchanged: runtimeSurfacesUnchanged,
  runtime_surface_changes: runtimeSurfaceChanges,
  next_separate_approval_gate_required: nextGateRequiredFound,
  proposed_future_route: "/api/runtime-health/ping",
  unresolved_conditions: [
    "explicit_implementation_approval_absent",
    "future_implementation_diff_must_be_isolated",
    "future_local_header_and_method_contract_test_pending",
    "non_production_netlify_runtime_untrusted",
    "deploy_and_main_push_approvals_absent",
  ],
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
    live_ranking_changed: false,
    confidence_changed: false,
    recommendation_rows_mutated: false,
  },
  recommended_next_step: passed
    ? "create_separate_runtime_ping_only_route_implementation_approval_gate"
    : "resolve_readiness_review_or_repository_boundary_failures",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
