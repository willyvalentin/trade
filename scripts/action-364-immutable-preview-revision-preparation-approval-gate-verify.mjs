#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath = "docs/action-364-immutable-preview-revision-preparation-approval-gate.md";
const routePath = "app/api/runtime-health/ping/route.ts";
const expectedHash = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const baselineHead = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Authoritative Dependencies",
  "## Action 362 Approval Status", "## Action 363 Blocked Status",
  "## Preview-Attempt Consumption Status", "## Exact Route Path",
  "## Exact Route File Path", "## Exact Route SHA-256", "## Current Validation Status",
  "## Current Mutable-Worktree Risk", "## Unrelated Concurrent-Work Classification",
  "## Explicit Non-Goals", "## Repository-Isolation Options Considered",
  "## Option Risk Comparison", "## Selected Future Preparation Method",
  "## Rejected Preparation Methods", "## Approved Future File Scope",
  "## Ownership Classification Requirements", "## Required Deployment-Input Manifest",
  "## Required Revision Identifier", "## Required Source Hashes",
  "## Required Worktree-State Evidence", "## Required Tracked/Untracked File Inventory",
  "## Required Diff Inventory", "## Required Artifact Ownership Classification",
  "## Required Validation Evidence", "## Immutable-Revision Definition",
  "## Revision-Freeze Point", "## Post-Freeze Mutation Prohibition",
  "## Validation-After-Freeze Requirement", "## Route-Integrity Requirement",
  "## One-Runtime-Route Requirement", "## Action 362 One-Attempt Preservation",
  "## Production Prohibition", "## Main-Push Prohibition", "## Deployment Prohibition",
  "## Rollback/Abandonment Boundary", "## Approval Vocabulary",
  "## Deterministic Gate Conditions", "## Approval Decision", "## Passed Conditions",
  "## Failed Conditions", "## Unresolved Conditions", "## Next Permitted Action",
];

function exists(path) {
  return existsSync(join(root, path));
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

const docFound = exists(docPath);
const doc = docFound ? read(docPath) : "";
const routeSource = exists(routePath) ? read(routePath) : "";
const routeHash = createHash("sha256").update(routeSource).digest("hex");
const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
  cwd: root,
  encoding: "utf8",
});
const currentHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const changedPaths = status.split("\n").filter(Boolean).map((line) => line.slice(3));
const changedAppPaths = changedPaths.filter((path) => path.startsWith("app/"));
const committedAppPaths = execFileSync(
  "git",
  ["diff", "--name-only", `${baselineHead}..HEAD`, "--", "app"],
  { cwd: root, encoding: "utf8" },
).trim().split("\n").filter(Boolean);
const noSecondRuntimeRoute =
  (changedAppPaths.length === 1 && changedAppPaths[0] === routePath) ||
  (changedAppPaths.length === 0 && committedAppPaths.length === 1 && committedAppPaths[0] === routePath);
let baselineIsAncestor = false;
try {
  execFileSync("git", ["merge-base", "--is-ancestor", baselineHead, "HEAD"], {
    cwd: root,
    stdio: "ignore",
  });
  baselineIsAncestor = true;
} catch {
  baselineIsAncestor = false;
}
const forbiddenChanges = changedPaths.filter((path) =>
  path === "proxy.ts" || path === "netlify.toml" ||
  /^middleware\.(?:ts|js|mts|mjs)$/.test(path) ||
  /^(?:\.env(?:\..*)?|supabase\/migrations\/|netlify\/|\.netlify\/)/.test(path)
);

const sectionsFound = requiredSections.every((section) => doc.includes(section));
const recoveryFound = ["6a501645908e4100088b7396", "512a0c5"].every((text) => doc.includes(text));
const upstreamFound = ["Action 309", "Action 318", "Action 319", "Action 320", "Action 338", "Action 344", "Action 350", "Actions 358-364"].every((text) => doc.includes(text));
const priorStateFound = [
  "Action 362 remains `approved`", "Action 363 returned `blocked`",
  "current_deploy_eligibility: false", "preview_attempt_consumed: false",
].every((text) => doc.includes(text));
const routeContractFound = ["GET /api/runtime-health/ping", routePath, expectedHash].every((text) => doc.includes(text));
const vocabularyFound = [
  "approval_vocabulary: approved | approved_with_conditions | blocked",
  "approval_decision: approved_with_conditions", "Decision: `approved_with_conditions`",
].every((text) => doc.includes(text));
const optionsFound = [
  "Option A", "Option B", "Option C", "Option D", "Option E",
  "Deploy directly from the current mutable worktree. Rejected",
  "Ignore, suppress, or exclude TypeScript-visible unrelated files", "Option B: prepare a clean isolated reviewed revision",
].every((text) => doc.includes(text));
const classificationsFound = [
  "approved_preview_input", "approved_baseline_dependency", "unrelated_excluded",
  "unresolved_blocker", "No deploy-input file may remain `unresolved_blocker`",
].every((text) => doc.includes(text));
const manifestFound = [
  "immutable revision identifier and parent/base revision", "every changed tracked file",
  "every included untracked file before freeze", "expected runtime route inventory",
  "expected migration inventory", "expected environment-file inventory",
  "expected provider/Supabase touch inventory", "manifest SHA-256",
].every((text) => doc.includes(text));
const immutableFound = [
  "unique identifier, exact recorded tree", "no mutable untracked deploy inputs",
  "No source, generated deploy input, configuration", "Validation performed before freeze is not final deployment evidence",
  "the later deployment input", "one runtime route",
].every((text) => doc.includes(text));
const validationFound = [
  "`npx next typegen`", "`npx tsc --noEmit`", "`npm run build`", "`npm run lint`",
  "Action 309 guard", "golden/static safety verifier", "Actions 318-320 package guards",
  "focused runtime-ping tests", "migration inventory", "no external endpoint access and no deployment",
].every((text) => doc.includes(text));
const safetyFound = [
  "repository_operation_performed: false", "immutable_revision_created: false",
  "deployment_performed: false", "external_endpoint_contacted: false",
  "production_deployment_approved: false", "main_push_allowed: false",
  "No operation is performed here", "Action 364 approves no deployment",
].every((text) => doc.includes(text));
const nextActionFound = doc.includes("separately reviewed Immutable Preview Revision Preparation Action for Option B");

const passed = docFound && sectionsFound && recoveryFound && upstreamFound && priorStateFound &&
  routeContractFound && vocabularyFound && optionsFound && classificationsFound && manifestFound &&
  immutableFound && validationFound && safetyFound && nextActionFound &&
  baselineIsAncestor && routeHash === expectedHash && noSecondRuntimeRoute &&
  forbiddenChanges.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_decision: "approved_with_conditions",
  selected_future_preparation_strategy: "B_clean_isolated_reviewed_revision",
  action_362_approval_preserved: true,
  action_363_readiness_blocked: true,
  preview_attempt_consumed: false,
  repository_operation_performed: false,
  immutable_revision_created: false,
  deployment_performed: false,
  external_endpoint_contacted: false,
  document_found: docFound,
  required_sections_found: sectionsFound,
  recovery_identifiers_found: recoveryFound,
  upstream_actions_found: upstreamFound,
  route_source_sha256: routeHash,
  route_hash_matches: routeHash === expectedHash,
  current_head_matches_review_baseline: currentHead === baselineHead,
  review_baseline_is_ancestor: baselineIsAncestor,
  changed_app_paths: changedAppPaths,
  committed_app_paths_since_immutable_baseline: committedAppPaths,
  no_second_runtime_route: noSecondRuntimeRoute,
  forbidden_config_environment_changes: forbiddenChanges,
  isolation_options_and_rejections_found: optionsFound,
  ownership_classification_contract_found: classificationsFound,
  deployment_input_manifest_contract_found: manifestFound,
  immutable_revision_and_freeze_contract_found: immutableFound,
  post_freeze_validation_contract_found: validationFound,
  production_deployment_approved: false,
  main_push_allowed: false,
  unresolved_conditions: [
    "exact_future_repository_operations_require_separate_review",
    "final_baseline_and_file_allowlist_not_frozen",
    "immutable_revision_and_manifest_not_created",
    "Netlify_runtime_untrusted",
  ],
  no_effect_flags: {
    repository_operation_performed: false,
    branch_created_or_deleted: false,
    commit_or_history_operation_performed: false,
    worktree_cleaned_or_files_removed: false,
    route_modified: false,
    additional_runtime_file_added: false,
    deployment_performed: false,
    Netlify_call_executed: false,
    external_endpoint_contacted: false,
    provider_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persisted_data: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
  },
  recommended_next_step: "separately_review_exact_option_b_repository_isolation_operation_and_manifest",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
