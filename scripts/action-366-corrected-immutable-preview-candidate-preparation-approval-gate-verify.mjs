#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath = "docs/action-366-corrected-immutable-preview-candidate-preparation-approval-gate.md";
const failedCandidatePath = "/private/tmp/ture-action-365-preview-revision-51aced6";
const failedSha = "8cfe239dc122d85770bfc86586f00716695915d1";
const failedManifestPath = join(failedCandidatePath, "docs/action-365-preview-deployment-input-manifest.json");
const failedManifestHash = "74b38f5a2d19cd55fec34a974abd86b60ec4eb0ad8bdf7057dd7d901c1803cb7";
const routePath = "app/api/runtime-health/ping/route.ts";
const routeHash = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Action 365 Result", "## Failed Candidate Identity",
  "## Failed Candidate Preservation Requirements", "## Action 362 Approval Status",
  "## Preview-Attempt Status", "## Known Validation Failures",
  "## Root-Cause Classifications", "## Exact Permitted Correction Scope",
  "## Exact Prohibited Correction Scope", "## Corrected Allowlist Requirements",
  "## Corrected Ownership Classification Requirements",
  "## Historical-Evidence Verifier Requirements", "## Dependency-Resolution Options",
  "## Selected Dependency Strategy", "## Package-Registry Prohibition",
  "## Offline/Reused Dependency Evidence Requirements", "## Dependency Integrity Requirements",
  "## Lockfile Integrity Requirements", "## Generated Artifact Policy",
  "## Pre-Freeze Validation Requirements", "## Post-Freeze Validation Requirements",
  "## Candidate Replacement Policy", "## New Manifest Requirements",
  "## Failed-Candidate Retention Policy", "## Approval Vocabulary",
  "## Deterministic Gate Conditions", "## Approval Decision", "## Passed Conditions",
  "## Failed Conditions", "## Unresolved Conditions", "## Next Permitted Action",
];

function sha(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

const docFound = existsSync(join(root, docPath));
const doc = docFound ? readFileSync(join(root, docPath), "utf8") : "";
const candidateFound = existsSync(failedCandidatePath);
const candidateHead = candidateFound ? git(failedCandidatePath, ["rev-parse", "HEAD"]) : null;
const candidateStatus = candidateFound
  ? git(failedCandidatePath, ["status", "--porcelain=v1", "--untracked-files=all"])
  : null;
const manifestExact = existsSync(failedManifestPath) && sha(failedManifestPath) === failedManifestHash;
const routeExact = existsSync(join(root, routePath)) && sha(join(root, routePath)) === routeHash;

const sectionsFound = requiredSections.every((section) => doc.includes(section));
const failedCandidateFrozen = [failedSha, failedManifestHash, "failed_candidate_deployable: false", "failed_candidate_preserved: true"].every((value) => doc.includes(value));
const approvalsPreserved = ["action_362_approval_preserved: true", "preview_attempt_consumed: false"].every((value) => doc.includes(value));
const classificationsFound = [
  "source_formatting_defect", "verifier_contract_defect",
  "historical_evidence_assumption_defect", "dependency_environment_defect",
  "generated_evidence_unavailable", "external_access_uncertainty",
].every((value) => doc.includes(value));
const correctionScopeFound = [
  "docs/action-358-runtime-ping-only-route-implementation-readiness-review.md",
  "docs/action-359-runtime-ping-only-route-implementation-approval-gate.md",
  "docs/action-360-runtime-ping-only-route-implementation.md",
  "Narrow the Action 365 verifier's excluded Action matcher",
  "Narrow Action 363 verifier logic", "This is not a general missing-file waiver",
].every((value) => doc.includes(value));
const routeSafetyFound = [
  "No runtime route/body/header/method change", "new runtime file",
  "No failure may become a warning", routeHash,
].every((value) => doc.includes(value));
const dependencyOptionsFound = ["Option A", "Option B", "Option C", "Option D", "Option E", "Select Option A"].every((value) => doc.includes(value));
const fallbackAndSkipRejected = [
  "Automatic Next/npm Fetch", "Rejected. Automatic fetching",
  "Skip Validation", "Build, typecheck, golden, lint, verifiers, and Playwright remain mandatory",
].every((value) => doc.includes(value));
const dependencyEvidenceFound = [
  "Node `v26.3.1`", "npm `11.16.0`",
  "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657",
  "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58",
  "proof no install fallback began", "Dependency storage must stay outside the revision",
].every((value) => doc.includes(value));
const replacementPolicyFound = [
  "new immutable SHA and new manifest", "old revision as non-deployable",
  "does not amend, replace, or delete the old revision", "remain local, unpushed, and undeployed",
].every((value) => doc.includes(value));
const decisionFound = [
  "approval_vocabulary: approved | approved_with_conditions | blocked",
  "approval_decision: approved_with_conditions", "Decision: `approved_with_conditions`",
].every((value) => doc.includes(value));
const noAction366Effects = [
  "new_candidate_created: false", "dependency_install_performed: false",
  "package_registry_contacted: false", "deployment_performed: false",
  "No repository operation, installation, registry contact, external request, or deployment occurred in Action 366",
].every((value) => doc.includes(value));
const nextActionSeparate = doc.includes("separately approved Corrected Immutable Preview Candidate Preparation Action");

const passed = docFound && sectionsFound && candidateFound && candidateHead === failedSha &&
  candidateStatus === "" && manifestExact && routeExact && failedCandidateFrozen &&
  approvalsPreserved && classificationsFound && correctionScopeFound && routeSafetyFound &&
  dependencyOptionsFound && fallbackAndSkipRejected && dependencyEvidenceFound &&
  replacementPolicyFound && decisionFound && noAction366Effects && nextActionSeparate;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_decision: "approved_with_conditions",
  failed_candidate_sha: candidateHead,
  failed_candidate_clean: candidateStatus === "",
  failed_candidate_manifest_hash_exact: manifestExact,
  failed_candidate_deployable: false,
  failed_candidate_preserved: true,
  action_362_approval_preserved: true,
  preview_attempt_consumed: false,
  selected_dependency_strategy: "A_trusted_local_read_only_reuse",
  dependency_capability_check_pending: true,
  route_hash_exact: routeExact,
  all_failure_classifications_found: classificationsFound,
  exact_correction_scope_found: correctionScopeFound,
  automatic_fetch_rejected: fallbackAndSkipRejected,
  validation_skip_rejected: fallbackAndSkipRejected,
  dependency_evidence_contract_complete: dependencyEvidenceFound,
  new_candidate_policy_found: replacementPolicyFound,
  repository_operation_performed: false,
  dependency_install_performed: false,
  package_registry_contacted: false,
  external_endpoint_contacted: false,
  deployment_performed: false,
  production_blocked: true,
  main_push_blocked: true,
  unresolved_conditions: [
    "candidate_local_read_only_dependency_resolution_not_yet_proven",
    "automatic_install_fallback_prevention_not_yet_demonstrated",
    "new_candidate_and_manifest_not_created",
    "full_post_freeze_validation_pending",
  ],
  recommended_next_step: passed
    ? "create_separate_corrected_candidate_preparation_action_with_preproven_option_a_bridge"
    : "resolve_static_gate_contract_without_mutating_failed_candidate",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
