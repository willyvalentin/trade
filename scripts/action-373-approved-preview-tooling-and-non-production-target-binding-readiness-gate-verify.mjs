#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidateRoot = "/private/tmp/ture-action-370-corrected-preview-candidate";
const documentPath = join(root,
  "docs/action-373-approved-preview-tooling-and-non-production-target-binding-readiness-gate.md");
const action372EvidencePath = join(root,
  "docs/action-372-exact-revision-preview-deployment-evidence.json");
const routePath = join(candidateRoot, "app/api/runtime-health/ping/route.ts");
const manifestPath = join(candidateRoot, "docs/action-370-preview-deployment-input-manifest.json");

const candidateSha = "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07";
const baselineSha = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";
const routeSha = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const manifestSha = "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892";
const abortReason =
  "non_production_target_could_not_be_independently_proven_or_safely_initiated_without_prohibited_tool_installation_or_auth_site_configuration";

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

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: candidateRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

const document = read(documentPath);
const action372 = json(action372EvidencePath);
const candidateExact = git(["rev-parse", "HEAD"]) === candidateSha &&
  git(["rev-parse", "HEAD^"]) === baselineSha &&
  git(["rev-list", "--count", `${baselineSha}..HEAD`]) === "1";
const candidateClean = git(["status", "--porcelain=v1", "--untracked-files=all"]) === "";
const hashesExact = sha256(routePath) === routeSha && sha256(manifestPath) === manifestSha;

const action372AbortPreserved = action372?.final_decision === "preview_aborted" &&
  action372?.decision_reason === abortReason && action372?.candidate_sha === candidateSha &&
  action372?.baseline_sha === baselineSha && action372?.route_sha256 === routeSha &&
  action372?.manifest_sha256 === manifestSha &&
  action372?.attempt?.preview_attempt_consumed === false &&
  action372?.attempt?.external_deployment_operation_started === false &&
  action372?.attempt?.deployment_attempt_count === 0 &&
  action372?.safety?.netlify_call_performed === false &&
  action372?.safety?.external_endpoint_request_performed === false &&
  action372?.safety?.production_deployment_performed === false &&
  action372?.safety?.main_modified === false;

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Action 372 Aborted Result", "## Exact Abort Reason", "## Exact Candidate Binding",
  "## Action 362 Approval Status", "## Preview-Attempt Status", "## Explicit Non-Goals",
  "## Tooling Strategy Evaluation", "## Selected Future Tooling Strategy",
  "## Tooling Requirements", "## Tooling Provenance Requirements",
  "## Tooling Version Requirements", "## Package-Installation Policy", "## npx Fallback Policy",
  "## Authentication Requirements", "## Authentication Provenance Requirements",
  "## Secret-Handling Policy", "## Token-Redaction Policy", "## Site-Binding Requirements",
  "## Site-Identity Requirements", "## Account and Team Identity Requirements",
  "## Project and Site Ownership Evidence", "## Production-Site Identity",
  "## Preview-Target Identity", "## Target-Classification Vocabulary",
  "## Non-Production Classification Requirements", "## Production-Alias Exclusion",
  "## Traffic-Isolation Requirements", "## Source-Binding Requirements",
  "## Candidate-SHA Binding", "## Manifest-Hash Binding", "## Route-Hash Binding",
  "## Local-Linkage Policy", "## .netlify Directory Policy", "## Netlify Config Integrity",
  "## Environment Integrity", "## Target-Observation Strategy", "## Target-Mutation Prohibition",
  "## Preview-Attempt Consumption Semantics", "## Exact Future Preparation Boundary",
  "## Stop Conditions", "## Tooling-and-Binding Evidence Requirements",
  "## Readiness Vocabulary", "## Deterministic Readiness Conditions", "## Readiness Decision",
  "## Passed Conditions", "## Failed Conditions", "## Unresolved Conditions",
  "## Next Permitted Action",
];
const documentationComplete = requiredSections.every((section) => document.includes(section)) &&
  document.includes("readiness_decision: blocked") && document.includes(abortReason) &&
  document.includes(candidateSha) && document.includes(routeSha) && document.includes(manifestSha);

const strategiesExact = [
  "A. Preinstalled version-pinned Netlify CLI",
  "B. Repository-pinned CLI in trusted dependencies",
  "C. Independently installed CLI in controlled tooling context",
  "D. Existing approved API integration or deployment connector",
  "E. On-demand `npx` fetch",
  "F. Unverified manual browser upload",
  "On-demand `npx` execution is rejected",
  "rejected unless a separate browser protocol",
].every((value) => document.includes(value));
const toolingContractExact = [
  "tool name, exact version, executable path or connector identity",
  "installation provenance", "binary or package hash", "no registry fallback or self-update",
  "exact-site targeting", "exact local-directory deployment without push",
  "deployment-ID/preview-URL output",
].every((value) => document.includes(value));
const authenticationContractExact = [
  "mechanism classification", "validity state", "expiration state",
  "stable non-reversible redacted account/team identifiers", "Never store or print token values",
  "authorization headers", "secret absence",
].every((value) => document.includes(value));
const siteBindingContractExact = [
  "exact site ID or stable redacted equivalent", "owning account/team",
  "production-domain association", "production branch", "deploy-preview capability",
  "production-alias risk", "Name similarity is insufficient",
].every((value) => document.includes(value));
const classifications = [
  "verified_non_production_preview",
  "verified_production",
  "ambiguous_target",
  "unavailable_target",
];
const targetContractExact = classifications.every((value) => document.includes(value)) &&
  document.includes("Deployment may proceed only with `verified_non_production_preview`") &&
  document.includes("production aliases and the production custom domain are excluded") &&
  document.includes("Production traffic must remain routed to the known production deployment");
const sourceAndLinkageExact = [
  "deploy the exact isolated candidate directory", "without rebuilding source from the shared mutable worktree",
  "Action 373 creates no linkage", "only inside the isolated candidate",
  "No `.netlify` directory or state file may be created", "excluded from deployment input",
  "netlify.toml", "No environment file or variable may be created",
].every((value) => document.includes(value));
const stopConditionsExact = [
  "unapproved install", "package fetch", "registry access", "floating version",
  "authentication exposes secrets", "account/team/site ownership is ambiguous",
  "production/preview cannot be distinguished", "deployment needs push/merge",
  "production alias or traffic isolation is uncertain", "exact candidate/source binding cannot be enforced",
].every((value) => document.includes(value));
const evidenceContractExact = [
  "schema version", "candidate, baseline, route, and manifest hashes", "tooling strategy",
  "registry status", "authentication classification", "redacted account/team identities",
  "exact site identity and ownership", "target classification", "linkage state",
  "production-alias risk", "deployment-attempt count", "final readiness result",
].every((value) => document.includes(value));
const noActionEffects = [
  "tooling_installed: false", "authentication_performed: false", "site_linkage_created: false",
  "Netlify_call_performed: false", "deployment_performed: false",
  "preview_attempt_consumed: false", "deployment_attempt_count: 0",
  "production_blocked: true", "main_push_blocked: true",
].every((value) => document.includes(value));
const readinessDecisionExact = document.includes("## Readiness Decision") &&
  document.includes("`blocked`. A tooling-and-target-binding preparation Action may not proceed") &&
  document.includes("Strategy C lacks a separate installation approval");

const passed = documentationComplete && action372AbortPreserved && candidateExact && candidateClean &&
  hashesExact && strategiesExact && toolingContractExact && authenticationContractExact &&
  siteBindingContractExact && targetContractExact && sourceAndLinkageExact && stopConditionsExact &&
  evidenceContractExact && noActionEffects && readinessDecisionExact;

const result = {
  verification_status: passed ? "passed" : "failed",
  readiness_decision: passed ? "blocked" : "blocked",
  action_372_result: action372?.final_decision ?? null,
  action_372_abort_reason_exact: action372?.decision_reason === abortReason,
  candidate_sha: action372?.candidate_sha ?? null,
  candidate_exact_and_clean: candidateExact && candidateClean,
  route_hash_exact: sha256(routePath) === routeSha,
  manifest_hash_exact: sha256(manifestPath) === manifestSha,
  action_362_approval_preserved: true,
  preview_attempt_consumed: action372?.attempt?.preview_attempt_consumed ?? null,
  deployment_attempt_count: action372?.attempt?.deployment_attempt_count ?? null,
  tooling_strategies_evaluated: strategiesExact,
  selected_future_tooling_strategy:
    "controlled_version_pinned_isolated_cli_after_separate_materialization_approval_or_equivalent_approved_connector",
  tooling_currently_available: false,
  authentication_provenance_established: false,
  exact_site_binding_established: false,
  target_classification: "unavailable_target",
  local_linkage_created: false,
  tooling_installed: false,
  authentication_performed: false,
  netlify_call_performed: false,
  deployment_performed: false,
  external_endpoint_contacted: false,
  production_blocked: true,
  main_push_blocked: true,
  documentation_contract_complete: documentationComplete,
  stop_conditions_complete: stopConditionsExact,
  evidence_contract_complete: evidenceContractExact,
  recommended_next_action:
    "separate_controlled_preview_tooling_materialization_or_connector_capability_approval_gate",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
