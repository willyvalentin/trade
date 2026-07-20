#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidateRoot = "/private/tmp/ture-action-370-corrected-preview-candidate";
const failedCandidateRoot = "/private/tmp/ture-action-365-preview-revision-51aced6";
const externalBindingPath = "/private/tmp/ture-action-370-corrected-preview-candidate-binding-evidence.json";
const repositoryBindingPath = join(root,
  "docs/action-370-corrected-immutable-preview-candidate-binding-evidence.json");
const documentPath = join(root,
  "docs/action-371-exact-revision-preview-deployment-execution-approval-gate.md");
const manifestRelativePath = "docs/action-370-preview-deployment-input-manifest.json";
const routeRelativePath = "app/api/runtime-health/ping/route.ts";

const candidateSha = "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07";
const baselineSha = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";
const failedCandidateSha = "8cfe239dc122d85770bfc86586f00716695915d1";
const routeSha = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const manifestSha = "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892";

function read(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function json(path) {
  try {
    return JSON.parse(read(path));
  } catch {
    return null;
  }
}

function sha256(path) {
  return existsSync(path)
    ? createHash("sha256").update(readFileSync(path)).digest("hex")
    : null;
}

function git(cwd, args) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function lines(value) {
  return value ? value.split("\n").filter(Boolean).sort() : [];
}

const document = read(documentPath);
const manifestPath = join(candidateRoot, manifestRelativePath);
const routePath = join(candidateRoot, routeRelativePath);
const manifest = json(manifestPath);
const externalBinding = json(externalBindingPath);
const repositoryBinding = json(repositoryBindingPath);

const head = git(candidateRoot, ["rev-parse", "HEAD"]);
const parent = git(candidateRoot, ["rev-parse", "HEAD^"]);
const status = git(candidateRoot, ["status", "--porcelain=v1", "--untracked-files=all"]);
const commitCount = git(candidateRoot, ["rev-list", "--count", `${baselineSha}..HEAD`]);
const introducedRoutes = lines(git(candidateRoot, [
  "diff", "--name-only", "--diff-filter=A", `${baselineSha}..HEAD`, "--", "app",
])).filter((path) => /\/route\.(?:ts|js)$/.test(path));
const changedFiles = lines(git(candidateRoot, ["diff", "--name-only", `${baselineSha}..HEAD`]));

const candidateExact = head === candidateSha && parent === baselineSha && commitCount === "1";
const candidateClean = status === "";
const routeHashExact = sha256(routePath) === routeSha;
const manifestHashExact = sha256(manifestPath) === manifestSha &&
  sha256(join(root, manifestRelativePath)) === manifestSha;
const bindingCopiesExact = read(externalBindingPath) !== "" &&
  read(externalBindingPath) === read(repositoryBindingPath);
const bindingExact = bindingCopiesExact && externalBinding?.preparation_decision === "prepared" &&
  externalBinding?.immutable_candidate_sha === candidateSha &&
  externalBinding?.selected_baseline_sha === baselineSha &&
  externalBinding?.parent_revision_sha === baselineSha &&
  externalBinding?.failed_candidate_sha === failedCandidateSha &&
  externalBinding?.manifest_sha256 === manifestSha && externalBinding?.route_sha256 === routeSha &&
  externalBinding?.frozen_tree_clean === true &&
  externalBinding?.post_freeze_validation?.complete === true &&
  Object.values(externalBinding?.post_freeze_validation?.results ?? {})
    .every((value) => value === "passed" || value === true) &&
  externalBinding?.action_362_approval_preserved === true &&
  externalBinding?.preview_attempt_consumed === false &&
  externalBinding?.deployment_performed === false && externalBinding?.push_performed === false &&
  externalBinding?.external_application_endpoint_contacted === false &&
  repositoryBinding?.immutable_candidate_sha === candidateSha;

const previewInputCount = manifest?.included_files?.filter(
  (entry) => entry.classification === "approved_preview_input",
).length ?? null;
const baselineDependencyCount = manifest?.included_files?.filter(
  (entry) => entry.classification === "approved_baseline_dependency",
).length ?? null;
const excludedCount = manifest?.excluded_concurrent_files?.length ?? null;
const unresolvedBlockerCount = manifest?.unresolved_blocker_count ?? null;
const classificationsExact = previewInputCount === 53 && baselineDependencyCount === 2343 &&
  excludedCount === 13 && unresolvedBlockerCount === 0 &&
  manifest?.included_files?.every((entry) => entry.included === true &&
    ["approved_preview_input", "approved_baseline_dependency"].includes(entry.classification)) &&
  manifest?.excluded_concurrent_files?.every((entry) =>
    entry.included === false && entry.classification === "unrelated_excluded");

const inventoriesExact = introducedRoutes.length === 1 && introducedRoutes[0] === routeRelativePath &&
  JSON.stringify(manifest?.inventories?.runtime_routes?.introduced) ===
    JSON.stringify([routeRelativePath]) &&
  (manifest?.inventories?.runtime_routes?.additional_introduced ?? []).length === 0 &&
  (manifest?.inventories?.migrations?.changed ?? []).length === 0 &&
  (manifest?.inventories?.schema_changes ?? []).length === 0 &&
  (manifest?.inventories?.proxy_middleware_netlify_changes ?? []).length === 0 &&
  (manifest?.inventories?.environment_files_included ?? []).length === 0 &&
  (manifest?.inventories?.provider_supabase_touch ?? []).length === 0 &&
  changedFiles.every((path) =>
    !path.startsWith("supabase/migrations/") &&
    !["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml", "package.json", "package-lock.json"]
      .includes(path) &&
    !/^\.env(?:\.|$)/.test(path));

const failedCandidatePreserved = git(failedCandidateRoot, ["rev-parse", "HEAD"]) === failedCandidateSha &&
  git(failedCandidateRoot, ["status", "--porcelain=v1", "--untracked-files=all"]) === "";
const action362Document = read(join(candidateRoot,
  "docs/action-362-runtime-ping-only-preview-deploy-approval-gate.md"));
const action362Preserved = action362Document.includes("approval_decision: approved") &&
  action362Document.includes("preview_deployment_performed: false");
const action370Prepared = externalBinding?.preparation_decision === "prepared" &&
  externalBinding?.post_freeze_validation?.complete === true;

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Action 362 Approval", "## Action 370 Prepared Result", "## Exact Candidate SHA",
  "## Exact Baseline SHA", "## Exact Route SHA", "## Exact Manifest SHA",
  "## Exact Binding-Evidence Contract", "## Failed Action 365 Candidate Preservation",
  "## Candidate Clean-State Requirement", "## Candidate Immutable-State Requirement",
  "## No-Amendment Requirement", "## No-Substitution Requirement",
  "## Exact Deployment-Source Requirement", "## Non-Production Target Requirement",
  "## One-Attempt Boundary", "## Code-Free Execution Requirement",
  "## Configuration-Free Execution Requirement", "## Environment-Free Execution Requirement",
  "## Route-Only Validation Requirement", "## Exact Preview Validation Contract",
  "## Stop Conditions", "## Deployment Evidence Requirements",
  "## Preview-Attempt Consumption Semantics", "## Production Prohibition",
  "## Main-Push Prohibition", "## Approval Vocabulary", "## Deterministic Gate Conditions",
  "## Approval Decision", "## Passed Conditions", "## Failed Conditions",
  "## Unresolved Conditions", "## Next Permitted Action",
];
const documentationComplete = requiredSections.every((section) => document.includes(section)) &&
  document.includes(`approval_decision: approved`) && document.includes(candidateSha) &&
  document.includes(baselineSha) && document.includes(routeSha) && document.includes(manifestSha);
const validationContractExact = [
  "GET /api/runtime-health/ping", "HTTP 200",
  "Content-Type: application/json; charset=utf-8", "Cache-Control: no-store, max-age=0",
  "framework-managed HTTP 405", "HTTP 400 recovery regression", "non-empty, non-HTML body",
  "automatic redirect following disabled", "No additional key", "identical repeated response",
].every((value) => document.includes(value));
const executionBoundaryExact = [
  "Only one preview deployment operation may be initiated", "No automatic retry",
  "No remediation or retry is allowed", "one deployment ID and one preview URL",
  "Production deployment", "Push, merge, main update",
].every((value) => document.includes(value));
const consumptionSemanticsExact = document.includes(
  "consumed only when a preview deployment operation is actually initiated",
) && document.includes("It is not consumed by Action 371") &&
  document.includes("At initiation it becomes consumed regardless");

const noDeploymentOccurred = externalBinding?.deployment_performed === false &&
  manifest?.safety?.deployment_performed === false;
const noPushOccurred = externalBinding?.push_performed === false && manifest?.safety?.push_performed === false;
const noExternalRequestOccurred = externalBinding?.external_application_endpoint_contacted === false &&
  manifest?.safety?.external_application_endpoint_contacted === false;
const previewAttemptUnconsumed = externalBinding?.preview_attempt_consumed === false &&
  manifest?.safety?.preview_attempt_consumed === false;
const productionAndMainBlocked = externalBinding?.production_blocked === true &&
  externalBinding?.main_push_blocked === true && manifest?.safety?.production_blocked === true &&
  manifest?.safety?.main_push_blocked === true;

const passed = documentationComplete && candidateExact && candidateClean && routeHashExact &&
  manifestHashExact && bindingExact && classificationsExact && inventoriesExact &&
  failedCandidatePreserved && action362Preserved && action370Prepared && validationContractExact &&
  executionBoundaryExact && consumptionSemanticsExact && noDeploymentOccurred && noPushOccurred &&
  noExternalRequestOccurred && previewAttemptUnconsumed && productionAndMainBlocked;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_decision: passed ? "approved" : "blocked",
  exact_candidate_sha: candidateSha,
  observed_candidate_sha: head,
  exact_baseline_sha: baselineSha,
  observed_parent_sha: parent,
  candidate_exact_and_unamended: candidateExact,
  candidate_clean: candidateClean,
  route_sha256: sha256(routePath),
  route_hash_exact: routeHashExact,
  manifest_sha256: sha256(manifestPath),
  manifest_hash_exact: manifestHashExact,
  revision_binding_valid: bindingExact,
  binding_copies_byte_identical: bindingCopiesExact,
  action_370_prepared: action370Prepared,
  failed_action_365_candidate_preserved: failedCandidatePreserved,
  action_362_approval_preserved: action362Preserved,
  preview_attempt_consumed: !previewAttemptUnconsumed,
  introduced_runtime_routes: introducedRoutes,
  approved_preview_input_count: previewInputCount,
  approved_baseline_dependency_count: baselineDependencyCount,
  excluded_concurrent_file_count: excludedCount,
  unresolved_blocker_count: unresolvedBlockerCount,
  inventories_exact: inventoriesExact,
  documentation_contract_complete: documentationComplete,
  exact_endpoint_validation_contract: validationContractExact,
  exact_execution_boundary: executionBoundaryExact,
  one_attempt_semantics_exact: consumptionSemanticsExact,
  deployment_performed: !noDeploymentOccurred,
  netlify_call_performed: false,
  external_request_performed: !noExternalRequestOccurred,
  push_performed: !noPushOccurred,
  production_blocked: productionAndMainBlocked,
  main_push_blocked: productionAndMainBlocked,
  future_deployment_boundary: "one_non_production_preview_exact_revision_route_only_then_stop",
  recommended_next_action: passed
    ? "separate_exact_revision_non_production_preview_execution_and_evidence_capture"
    : "preserve_unconsumed_attempt_and_resolve_static_gate_mismatch_in_separate_action",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
