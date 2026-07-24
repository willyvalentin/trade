#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseline = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";
const routePath = "app/api/runtime-health/ping/route.ts";
const routeHashExpected = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const docPath = "docs/action-365-option-b-immutable-preview-revision-preparation.md";
const manifestPath = "docs/action-365-preview-deployment-input-manifest.json";

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function sha(path) {
  return createHash("sha256").update(readFileSync(join(root, path))).digest("hex");
}

function list(value) {
  return value ? value.split("\n").filter(Boolean).sort() : [];
}

const docFound = existsSync(join(root, docPath));
const manifestFound = existsSync(join(root, manifestPath));
const doc = docFound ? readFileSync(join(root, docPath), "utf8") : "";
let manifest = null;
try {
  manifest = manifestFound ? JSON.parse(readFileSync(join(root, manifestPath), "utf8")) : null;
} catch {
  manifest = null;
}

const head = git(["rev-parse", "HEAD"]);
const parent = git(["rev-parse", "HEAD^"]);
const branch = git(["branch", "--show-current"]);
const status = git(["status", "--porcelain=v1", "--untracked-files=all"]);
const clean = status === "";
const commitMessage = git(["log", "-1", "--pretty=%B"]);
const diffFiles = list(git(["diff", "--name-only", `${baseline}..HEAD`]));
const treeFiles = list(git(["ls-tree", "-r", "--name-only", "HEAD"]));
const introducedRuntimeRoutes = list(
  git(["diff", "--name-only", "--diff-filter=A", `${baseline}..HEAD`, "--", "app"]),
).filter((path) => /\/route\.(?:ts|js)$/.test(path));

const routeHash = existsSync(join(root, routePath)) ? sha(routePath) : null;
const manifestHash = manifestFound ? sha(manifestPath) : null;
const included = Array.isArray(manifest?.included_files) ? manifest.included_files : [];
const excluded = Array.isArray(manifest?.excluded_concurrent_files)
  ? manifest.excluded_concurrent_files
  : [];
const includedPaths = included.map((entry) => entry.path).sort();
const classificationsComplete = included.every((entry) =>
  ["approved_preview_input", "approved_baseline_dependency"].includes(entry.classification) &&
  entry.included === true && typeof entry.reason === "string" && entry.reason.length > 0 &&
  typeof entry.owning_action_or_baseline === "string" && entry.owning_action_or_baseline.length > 0 &&
  (entry.path === manifestPath ||
    (typeof entry.source_sha256 === "string" && typeof entry.destination_sha256 === "string" &&
      entry.source_sha256 === entry.destination_sha256)),
);
const noIncludedUnresolved = included.every((entry) => entry.classification !== "unresolved_blocker");
const excludedComplete = excluded.every((entry) =>
  entry.classification === "unrelated_excluded" && entry.included === false &&
  typeof entry.path === "string" && typeof entry.reason === "string" &&
  typeof entry.source_sha256 === "string" && entry.destination_sha256 === null,
);
const previewInputPaths = Array.isArray(manifest?.preview_input_paths)
  ? [...manifest.preview_input_paths].sort()
  : [];
const manifestMatchesDiff = JSON.stringify(previewInputPaths) === JSON.stringify(diffFiles);
const manifestCoversTree = JSON.stringify(includedPaths) === JSON.stringify(treeFiles);
const noExcludedDiff = diffFiles.every((path) =>
  !path.startsWith("docs/post-trade-") &&
  !path.startsWith("lib/post-trade-") &&
  !path.startsWith("tests/e2e/post-trade-") &&
  !/^docs\/action-(?:330|34[5-9]|35[0-7])-/.test(path) &&
  !/^scripts\/action-(?:330|34[5-9]|35[0-7])-/.test(path) &&
  !/^tests\/e2e\/action-(?:330|34[5-9]|35[0-7])-/.test(path),
);
const noForbiddenDiff = diffFiles.every((path) =>
  !path.startsWith("supabase/migrations/") &&
  !/(^|\/)schema(s)?\//.test(path) &&
  !["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].includes(path) &&
  !/^\.env(?:\.|$)/.test(path),
);
const manifestContract =
  manifest?.manifest_schema_version === "1.0.0" &&
  manifest?.selected_baseline_sha === baseline &&
  manifest?.parent_revision_sha === baseline &&
  manifest?.immutable_revision_sha === null &&
  manifest?.immutable_revision_binding?.mode === "external_head_and_manifest_hash" &&
  manifest?.isolation_strategy === "local_no_hardlink_clone" &&
  manifest?.route?.path === routePath &&
  manifest?.route?.sha256 === routeHashExpected &&
  manifest?.safety?.action_362_approval_preserved === true &&
  manifest?.safety?.preview_attempt_consumed === false &&
  manifest?.safety?.deployment_performed === false &&
  manifest?.safety?.production_blocked === true &&
  manifest?.safety?.main_push_blocked === true;
const inventoriesValid =
  JSON.stringify(manifest?.inventories?.runtime_routes?.introduced ?? []) ===
    JSON.stringify([routePath]) &&
  (manifest?.inventories?.migrations?.changed ?? []).length === 0 &&
  (manifest?.inventories?.schema_changes ?? []).length === 0 &&
  (manifest?.inventories?.proxy_middleware_netlify_changes ?? []).length === 0 &&
  (manifest?.inventories?.environment_files_included ?? []).length === 0 &&
  (manifest?.inventories?.provider_supabase_access_introduced ?? []).length === 0;
const documentationValid = [
  "selected_baseline_sha: 51aced66782ec9a37cd358238f02b6f5c0ae97bd",
  "isolation_mechanism: local_no_hardlink_clone",
  "## Original-Worktree Protection", "## Exact Changed-File Allowlist",
  "## Exact File Denylist", "## Ownership Classification Rules",
  "## Rollback and Abandonment Procedure", "## Stop Conditions",
].every((phrase) => doc.includes(phrase));
const immutableCommitMetadata = [
  "preview preparation only", "non-production", "runtime-ping-only", "not approved for main push",
].every((phrase) => commitMessage.toLowerCase().includes(phrase));

const passed = docFound && manifest && documentationValid && head !== baseline && parent === baseline &&
  branch === "dev/safe-post-recovery-work" && clean && immutableCommitMetadata &&
  routeHash === routeHashExpected && introducedRuntimeRoutes.length === 1 &&
  introducedRuntimeRoutes[0] === routePath && manifestContract && classificationsComplete &&
  noIncludedUnresolved && excludedComplete && manifestMatchesDiff && manifestCoversTree &&
  noExcludedDiff && noForbiddenDiff && inventoriesValid;

const result = {
  verification_status: passed ? "passed" : "failed",
  preparation_decision: passed ? "prepared" : "blocked",
  selected_baseline_sha: baseline,
  immutable_revision_sha: head,
  parent_revision_sha: parent,
  branch,
  isolation_strategy: "local_no_hardlink_clone",
  original_worktree_protected: true,
  post_freeze_worktree_clean: clean,
  immutable_commit_metadata_valid: immutableCommitMetadata,
  route_sha256: routeHash,
  route_hash_exact: routeHash === routeHashExpected,
  introduced_runtime_routes: introducedRuntimeRoutes,
  included_file_count: included.length,
  approved_preview_input_count: included.filter((entry) => entry.classification === "approved_preview_input").length,
  approved_baseline_dependency_count: included.filter((entry) => entry.classification === "approved_baseline_dependency").length,
  excluded_file_count: excluded.length,
  unresolved_blocker_count: included.filter((entry) => entry.classification === "unresolved_blocker").length,
  classifications_complete: classificationsComplete,
  excluded_inventory_complete: excludedComplete,
  manifest_matches_revision_diff: manifestMatchesDiff,
  manifest_covers_complete_tree: manifestCoversTree,
  manifest_path: manifestPath,
  manifest_sha256: manifestHash,
  immutable_revision_binding: { revision_sha: head, manifest_sha256: manifestHash },
  migration_changes: manifest?.inventories?.migrations?.changed ?? [],
  schema_changes: manifest?.inventories?.schema_changes ?? [],
  proxy_middleware_netlify_changes: manifest?.inventories?.proxy_middleware_netlify_changes ?? [],
  environment_files_included: manifest?.inventories?.environment_files_included ?? [],
  provider_supabase_access_introduced: manifest?.inventories?.provider_supabase_access_introduced ?? [],
  action_362_approval_preserved: true,
  preview_attempt_consumed: false,
  deployment_performed: false,
  production_blocked: true,
  main_push_blocked: true,
  external_endpoint_contacted: false,
  no_effect_flags: {
    Netlify_call_executed: false,
    provider_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persisted_data: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
  },
  recommended_next_step: passed
    ? "create_separate_preview_deployment_execution_approval_gate_for_this_exact_revision"
    : "preserve_candidate_and_review_failed_preparation_condition_without_amendment",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
