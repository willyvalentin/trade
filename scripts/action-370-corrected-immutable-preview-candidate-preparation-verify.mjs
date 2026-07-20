#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const invocationRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidateRoot = "/private/tmp/ture-action-370-corrected-preview-candidate";
const failedCandidateRoot = "/private/tmp/ture-action-365-preview-revision-51aced6";
const bindingPath = "/private/tmp/ture-action-370-corrected-preview-candidate-binding-evidence.json";
const baseline = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";
const failedCandidateSha = "8cfe239dc122d85770bfc86586f00716695915d1";
const routePath = "app/api/runtime-health/ping/route.ts";
const routeHash = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const packageHash = "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58";
const lockHash = "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657";
const dependencyDigest = "44b4cad2882f45c4b0114848410f5b28105495812885239e34452da0d666ec91";
const docPath = "docs/action-370-corrected-immutable-preview-candidate-preparation.md";
const manifestPath = "docs/action-370-preview-deployment-input-manifest.json";

function git(args) {
  return execFileSync("git", args, { cwd: candidateRoot, encoding: "utf8" }).trim();
}

function sha(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function list(value) {
  return value ? value.split("\n").filter(Boolean).sort() : [];
}

function inside(parent, child) {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== "..");
}

const candidateFound = existsSync(candidateRoot);
const docFound = candidateFound && existsSync(join(candidateRoot, docPath));
const manifestFound = candidateFound && existsSync(join(candidateRoot, manifestPath));
const bindingFound = existsSync(bindingPath);
const phase = bindingFound ? "post_freeze" : "pre_freeze";
const doc = docFound ? readFileSync(join(candidateRoot, docPath), "utf8") : "";
let manifest = null;
let binding = null;
try {
  manifest = manifestFound ? JSON.parse(readFileSync(join(candidateRoot, manifestPath), "utf8")) : null;
  binding = bindingFound ? JSON.parse(readFileSync(bindingPath, "utf8")) : null;
} catch {
  manifest = null;
  binding = null;
}

const head = candidateFound ? git(["rev-parse", "HEAD"]) : null;
const parent = phase === "post_freeze" && candidateFound ? git(["rev-parse", "HEAD^"]) : baseline;
const branch = candidateFound ? git(["branch", "--show-current"]) : null;
const status = candidateFound
  ? git(["status", "--porcelain=v1", "--untracked-files=all"])
  : "missing";
const frozenClean = phase === "post_freeze" && status === "";
const diffFiles = candidateFound
  ? phase === "post_freeze"
    ? list(git(["diff", "--name-only", `${baseline}..HEAD`]))
    : list(git(["diff", "--cached", "--name-only", baseline]))
  : [];
const treeFiles = candidateFound
  ? phase === "post_freeze"
    ? list(git(["ls-tree", "-r", "--name-only", "HEAD"]))
    : list(git(["ls-files"]))
  : [];
const introducedRoutes = candidateFound
  ? phase === "post_freeze"
    ? list(git(["diff", "--name-only", "--diff-filter=A", `${baseline}..HEAD`, "--", "app"]))
      .filter((path) => /\/route\.(?:ts|js)$/.test(path))
    : list(git(["diff", "--cached", "--name-only", "--diff-filter=A", baseline, "--", "app"]))
      .filter((path) => /\/route\.(?:ts|js)$/.test(path))
  : [];

const included = Array.isArray(manifest?.included_files) ? manifest.included_files : [];
const excluded = Array.isArray(manifest?.excluded_concurrent_files)
  ? manifest.excluded_concurrent_files
  : [];
const includedPaths = included.map((entry) => entry.path).sort();
const classificationsComplete = included.every((entry) => {
  if (!["approved_preview_input", "approved_baseline_dependency"].includes(entry.classification) ||
    entry.included !== true || typeof entry.reason !== "string" || !entry.reason ||
    typeof entry.owning_action_or_baseline !== "string" || !entry.owning_action_or_baseline) {
    return false;
  }
  if (entry.path === manifestPath) {
    return entry.canonical_self_reference === true && entry.candidate_sha256 === null;
  }
  const absolute = join(candidateRoot, entry.path);
  return existsSync(absolute) && typeof entry.candidate_sha256 === "string" &&
    sha(absolute) === entry.candidate_sha256;
});
const excludedComplete = excluded.every((entry) =>
  entry.classification === "unrelated_excluded" && entry.included === false &&
  typeof entry.path === "string" && typeof entry.reason === "string" &&
  typeof entry.source_sha256 === "string" && /^[a-f0-9]{64}$/.test(entry.source_sha256) &&
  (treeFiles.includes(entry.path)
    ? entry.baseline_version_included === true && typeof entry.candidate_sha256 === "string" &&
      sha(join(candidateRoot, entry.path)) === entry.candidate_sha256
    : entry.baseline_version_included === false && entry.candidate_sha256 === null),
);
const noIncludedUnresolved = included.every((entry) => entry.classification !== "unresolved_blocker") &&
  manifest?.unresolved_blocker_count === 0;
const manifestMatchesDiff = JSON.stringify([...(manifest?.preview_input_paths ?? [])].sort()) ===
  JSON.stringify(diffFiles);
const manifestCoversTree = JSON.stringify(includedPaths) === JSON.stringify(treeFiles);
const noForbiddenDiff = diffFiles.every((path) =>
  !path.startsWith("supabase/migrations/") &&
  !/(^|\/)schema(s)?\//.test(path) &&
  !["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml", "package.json", "package-lock.json"]
    .includes(path) &&
  !/^\.env(?:\.|$)/.test(path) &&
  !path.startsWith("node_modules/") &&
  !path.startsWith("docs/post-trade-") &&
  !path.startsWith("lib/post-trade-") &&
  !path.startsWith("tests/e2e/post-trade-"),
);

const routeExact = candidateFound && existsSync(join(candidateRoot, routePath)) &&
  sha(join(candidateRoot, routePath)) === routeHash;
const packageAndLockExact = candidateFound &&
  sha(join(candidateRoot, "package.json")) === packageHash &&
  sha(join(candidateRoot, "package-lock.json")) === lockHash;
const dependencyRoot = join(candidateRoot, "node_modules");
const dependencyPhysical = existsSync(dependencyRoot) && lstatSync(dependencyRoot).isDirectory() &&
  !lstatSync(dependencyRoot).isSymbolicLink() &&
  inside(realpathSync(candidateRoot), realpathSync(dependencyRoot));
const dependencyIgnored = candidateFound &&
  git(["check-ignore", "node_modules"]) === "node_modules" &&
  git(["ls-files", "node_modules/**"]) === "";

const exactCorrectionScope = manifest?.corrections?.trailing_eof_blank_lines_removed?.length === 3 &&
  manifest?.corrections?.action_365_matcher_before === "35[0-7]" &&
  manifest?.corrections?.action_365_matcher_after === "35[1-7]" &&
  manifest?.corrections?.action_363_manifest_backed_historical_evidence === true &&
  manifest?.corrections?.generic_missing_file_waiver_added === false &&
  manifest?.corrections?.safety_check_weakened === false;
const manifestContract = manifest?.manifest_schema_version === "1.0.0" &&
  manifest?.selected_baseline_sha === baseline && manifest?.parent_revision_sha === baseline &&
  manifest?.failed_candidate?.sha === failedCandidateSha &&
  manifest?.failed_candidate?.permanently_non_deployable === true &&
  manifest?.candidate_preparation_strategy === "isolated_baseline_plus_exact_action_366_corrections" &&
  manifest?.dependency?.mechanism === "macos_clonefile_recursive_no_fallback" &&
  manifest?.dependency?.source_digest_sha256 === dependencyDigest &&
  manifest?.dependency?.destination_digest_sha256 === dependencyDigest &&
  manifest?.dependency?.ordinary_copy_fallback === false &&
  manifest?.dependency?.installation_command_count === 0 &&
  manifest?.dependency?.registry_access_prevented === true &&
  manifest?.route?.path === routePath && manifest?.route?.sha256 === routeHash &&
  manifest?.package_json_sha256 === packageHash && manifest?.package_lock_sha256 === lockHash &&
  manifest?.safety?.action_362_approval_preserved === true &&
  manifest?.safety?.preview_attempt_consumed === false &&
  manifest?.safety?.deployment_performed === false && manifest?.safety?.push_performed === false;
const inventoriesExact = introducedRoutes.length === 1 && introducedRoutes[0] === routePath &&
  JSON.stringify(manifest?.inventories?.runtime_routes?.introduced ?? []) === JSON.stringify([routePath]) &&
  (manifest?.inventories?.migrations?.changed ?? []).length === 0 &&
  (manifest?.inventories?.schema_changes ?? []).length === 0 &&
  (manifest?.inventories?.proxy_middleware_netlify_changes ?? []).length === 0 &&
  (manifest?.inventories?.environment_files_included ?? []).length === 0 &&
  (manifest?.inventories?.provider_supabase_touch ?? []).length === 0;
const preFreezePassed = manifest?.pre_freeze_results &&
  Object.values(manifest.pre_freeze_results).every((value) => value === "passed" || value === true);
const failedCandidatePreserved = existsSync(failedCandidateRoot) &&
  execFileSync("git", ["rev-parse", "HEAD"], { cwd: failedCandidateRoot, encoding: "utf8" }).trim() === failedCandidateSha &&
  execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
    cwd: failedCandidateRoot, encoding: "utf8",
  }).trim() === "";
const action362Preserved = readFileSync(join(candidateRoot,
  "docs/action-362-runtime-ping-only-preview-deploy-approval-gate.md"), "utf8")
  .includes("approval_decision: approved");
const documentationComplete = [
  "## Purpose", "## Scope", "## Recovery Context", "## Failed Candidate Preservation",
  "## Action 366 Approved Correction Scope", "## Action 369 Capability Result",
  "## Selected Baseline", "## Isolation Mechanism", "## clonefile(2) Dependency Strategy",
  "## Exact Correction Allowlist", "## Exact File Allowlist", "## Exact File Denylist",
  "## Ownership Classifications", "## Manifest Design", "## Pre-Freeze Validation",
  "## Immutable Freeze Procedure", "## Revision Binding Evidence", "## Post-Freeze Validation",
  "## Deployment Prohibition", "## Push/Main Prohibition", "## Final Preparation Decision",
].every((section) => doc.includes(section));

const manifestHash = manifestFound ? sha(join(candidateRoot, manifestPath)) : null;
const postFreezeBinding = phase === "post_freeze" && binding &&
  binding.binding_schema_version === "1.0.0" && binding.immutable_candidate_sha === head &&
  binding.manifest_sha256 === manifestHash && binding.route_sha256 === routeHash &&
  binding.selected_baseline_sha === baseline && binding.frozen_tree_clean === true &&
  binding.post_freeze_validation?.complete === true &&
  Object.values(binding.post_freeze_validation.results ?? {}).every((value) => value === "passed" || value === true) &&
  binding.action_362_approval_preserved === true && binding.preview_attempt_consumed === false &&
  binding.push_performed === false && binding.deployment_performed === false;

const commonPassed = candidateFound && docFound && manifestFound && documentationComplete &&
  branch === "dev/safe-post-recovery-work" && manifestContract && classificationsComplete &&
  excludedComplete && noIncludedUnresolved && manifestMatchesDiff && manifestCoversTree &&
  noForbiddenDiff && exactCorrectionScope && routeExact && packageAndLockExact &&
  dependencyPhysical && dependencyIgnored && inventoriesExact && preFreezePassed &&
  failedCandidatePreserved && action362Preserved;
const passed = phase === "pre_freeze"
  ? commonPassed && head === baseline && !bindingFound
  : commonPassed && head !== baseline && parent === baseline && frozenClean && postFreezeBinding;
const preparationDecision = passed
  ? phase === "post_freeze" ? "prepared" : "prepared_with_conditions"
  : "blocked";

const result = {
  verification_status: passed ? "passed" : "failed",
  preparation_decision: preparationDecision,
  verification_phase: phase,
  selected_baseline_sha: baseline,
  parent_revision_sha: parent,
  immutable_candidate_sha: phase === "post_freeze" ? head : null,
  failed_candidate_preserved: failedCandidatePreserved,
  route_sha256: routeExact ? routeHash : null,
  route_hash_exact: routeExact,
  introduced_runtime_routes: introducedRoutes,
  exact_correction_scope: exactCorrectionScope,
  included_file_count: included.length,
  approved_preview_input_count: included.filter((entry) => entry.classification === "approved_preview_input").length,
  approved_baseline_dependency_count: included.filter((entry) => entry.classification === "approved_baseline_dependency").length,
  excluded_file_count: excluded.length,
  unresolved_blocker_count: manifest?.unresolved_blocker_count ?? null,
  classifications_complete: classificationsComplete,
  manifest_matches_revision_diff: manifestMatchesDiff,
  manifest_covers_frozen_tree: manifestCoversTree,
  manifest_sha256: manifestHash,
  dependency_mechanism: manifest?.dependency?.mechanism ?? null,
  dependency_source_digest: manifest?.dependency?.source_digest_sha256 ?? null,
  dependency_destination_digest: manifest?.dependency?.destination_digest_sha256 ?? null,
  dependency_physical_and_ignored: dependencyPhysical && dependencyIgnored,
  registry_access_prevented: manifest?.dependency?.registry_access_prevented === true,
  installation_command_count: manifest?.dependency?.installation_command_count ?? null,
  package_and_lockfile_hashes_exact: packageAndLockExact,
  pre_freeze_validation_passed: preFreezePassed,
  revision_binding_valid: phase === "post_freeze" ? Boolean(postFreezeBinding) : false,
  post_freeze_validation_passed: phase === "post_freeze" ? binding?.post_freeze_validation?.complete === true : false,
  frozen_tree_clean: frozenClean,
  action_362_approval_preserved: action362Preserved,
  preview_attempt_consumed: false,
  push_performed: false,
  deployment_performed: false,
  production_blocked: true,
  main_push_blocked: true,
  invocation_root_classification: invocationRoot === candidateRoot ? "candidate" : "external_verifier_copy",
  recommended_next_step: preparationDecision === "prepared"
    ? "create_separate_exact_revision_preview_deployment_execution_gate"
    : preparationDecision === "prepared_with_conditions"
      ? "freeze_one_immutable_revision_then_create_external_binding_and_run_post_freeze_validation"
      : "preserve_context_without_amendment_and_review_failed_condition",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
