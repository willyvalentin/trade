#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath = "docs/action-368-isolated-dependency-materialization-strategy-approval-gate.md";
const action362Path = "docs/action-362-runtime-ping-only-preview-deploy-approval-gate.md";
const action367EvidencePath = "docs/action-367-read-only-dependency-bridge-capability-evidence.json";
const failedCandidatePath = "/private/tmp/ture-action-365-preview-revision-51aced6";
const failedCandidateSha = "8cfe239dc122d85770bfc86586f00716695915d1";
const routePath = "app/api/runtime-health/ping/route.ts";
const expectedRouteHash = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const expectedPackageHash = "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58";
const expectedLockHash = "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657";

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Action 365 Failed Candidate Status", "## Action 366 Conditional Approval",
  "## Action 367 Blocked Capability Result", "## Turbopack Filesystem-Root Restriction",
  "## Action 362 Approval Status", "## Preview-Attempt Status", "## Explicit Non-Goals",
  "## Dependency-Materialization Requirements", "## Strategy Options Considered",
  "## Risk Comparison", "## Selected Future Strategy", "## Rejected Strategies",
  "## Trusted Dependency-Source Definition", "## Physical Project-Root Requirement",
  "## Git Exclusion Requirement", "## Deployment-Input Exclusion Requirement",
  "## Provenance Requirements", "## Integrity Requirements",
  "## Platform/Architecture Requirements", "## Package and Lockfile Compatibility Requirements",
  "## Read-Only Source Protection", "## Destination Mutability Policy",
  "## Lifecycle-Script Policy", "## Native-Binary Policy", "## Symlink Policy",
  "## Hardlink Policy", "## Copy Policy", "## Filesystem Metadata Policy",
  "## Generated-Artifact Policy", "## Registry/Network Prohibition",
  "## Fallback-Prevention Policy", "## Package-Manager Invocation Prohibition",
  "## Candidate Preparation Ordering", "## Pre-Materialization Evidence",
  "## Post-Materialization Evidence", "## Pre-Freeze Validation",
  "## Post-Freeze Validation", "## Cleanup/Abandonment Strategy",
  "## Approval Vocabulary", "## Deterministic Gate Conditions", "## Approval Decision",
  "## Passed Conditions", "## Failed Conditions", "## Unresolved Conditions",
  "## Next Permitted Action",
];

function sha(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function includesAll(source, values) {
  return values.every((value) => source.includes(value));
}

const docFound = existsSync(join(root, docPath));
const doc = docFound ? readFileSync(join(root, docPath), "utf8") : "";
const action362 = existsSync(join(root, action362Path))
  ? readFileSync(join(root, action362Path), "utf8")
  : "";
let action367Evidence = null;
try {
  action367Evidence = JSON.parse(readFileSync(join(root, action367EvidencePath), "utf8"));
} catch {
  action367Evidence = null;
}

const failedCandidatePreserved = existsSync(failedCandidatePath) &&
  git(failedCandidatePath, ["rev-parse", "HEAD"]) === failedCandidateSha &&
  git(failedCandidatePath, ["status", "--porcelain=v1", "--untracked-files=all"]) === "";
const action362Preserved = includesAll(action362, [
  "approval_decision: approved",
  "preview_deployment_approved_for_later_action: true",
  "production_deployment_approved: false",
]);
const action367Blocked = action367Evidence?.capability_decision === "blocked" &&
  action367Evidence?.validation_capability?.complete_build === "failed_dependency_bridge" &&
  action367Evidence?.validation_capability?.complete_build_failure?.includes("Turbopack rejects") &&
  action367Evidence?.validation_capability?.full_required_stack_executable === false;
const routeUnchanged = existsSync(join(root, routePath)) && sha(join(root, routePath)) === expectedRouteHash;
const packageAndLockExact = sha(join(root, "package.json")) === expectedPackageHash &&
  sha(join(root, "package-lock.json")) === expectedLockHash;

const sectionsComplete = requiredSections.every((section) => doc.includes(section));
const decisionComplete = includesAll(doc, [
  "approval_vocabulary: approved | approved_with_conditions | blocked",
  "approval_decision: approved_with_conditions",
  "selected_strategy: C_verified_copy_on_write_filesystem_clone",
  "Decision: `approved_with_conditions`.",
]);
const optionsComplete = ["| A |", "| B |", "| C |", "| D |", "| E |", "| F |", "| G |"]
  .every((option) => doc.includes(option));
const rejectionsComplete = includesAll(doc, [
  "E and G are categorically rejected",
  "D is rejected because shared inode writes can mutate source",
  "F remains rejected absent separate offline provenance and lifecycle proof",
]);
const sourceIntegrityComplete = includesAll(doc, [
  "23,839 files", "447,449,795 bytes",
  "a9576999e30f6c5182cf26f68f38bb4803df27960dd09415e0975509bb88dd96",
  "v26.3.1", "11.16.0", "darwin", "arm64", expectedPackageHash, expectedLockHash,
  "source last-change evidence", "proof source is not mutated",
]);
const destinationIntegrityComplete = includesAll(doc, [
  "source/destination counts and deterministic digests", "missing/extra counts",
  "file-type differences", "external symlink count", "hardlink/inode-sharing evidence",
  "permission differences", "executable preservation", "destination bytes",
  "tracked status", "ignored status", "deploy-manifest exclusion",
]);
const isolationComplete = includesAll(doc, [
  "No destination regular file may share a source inode",
  "External symlinks and a `node_modules` root symlink are forbidden",
  "no write can propagate to source",
  "`node_modules` must remain ignored and untracked",
  "exclude `node_modules`, dependency caches, and generated validation outputs",
]);
const noInstallOrNetwork = includesAll(doc, [
  "No installation command", "contact no package registry", "no network",
  "Silent fallback to ordinary copy, hardlink, symlink, or installation is forbidden",
]);
const validationAndOrderingComplete = includesAll(doc, [
  "Run complete pre-freeze validation", "Create a new immutable revision without `node_modules`",
  "Run complete post-freeze validation", "complete Next/Turbopack build",
  "Stop without deployment",
]);
const staticSafetyComplete = includesAll(doc, [
  "dependency_materialization_performed: false", "corrected_candidate_created: false",
  "preview_attempt_consumed: false", "production_blocked: true", "main_push_blocked: true",
]);
const nextActionBounded = includesAll(doc, [
  "separate, bounded, local-only copy-on-write filesystem-clone capability verification",
  "stop without creating a corrected candidate",
]);

const passed = docFound && sectionsComplete && decisionComplete && optionsComplete &&
  rejectionsComplete && sourceIntegrityComplete && destinationIntegrityComplete &&
  isolationComplete && noInstallOrNetwork && validationAndOrderingComplete &&
  staticSafetyComplete && nextActionBounded && failedCandidatePreserved &&
  action362Preserved && action367Blocked && routeUnchanged && packageAndLockExact;

const result = {
  verification_status: passed ? "passed" : "failed",
  approval_decision: "approved_with_conditions",
  selected_strategy: "C_verified_copy_on_write_filesystem_clone",
  bounded_filesystem_capability_check_pending: true,
  failed_candidate_preserved: failedCandidatePreserved,
  failed_candidate_sha: failedCandidateSha,
  action_362_approval_preserved: action362Preserved,
  preview_attempt_consumed: false,
  action_367_capability_decision: action367Evidence?.capability_decision ?? "missing",
  action_367_turbopack_symlink_blocker_verified: action367Blocked,
  strategy_options_complete: optionsComplete,
  source_integrity_contract_complete: sourceIntegrityComplete,
  destination_integrity_contract_complete: destinationIntegrityComplete,
  source_mutation_prevention_explicit: isolationComplete,
  git_exclusion_explicit: isolationComplete,
  deploy_input_exclusion_explicit: isolationComplete,
  package_and_lockfile_hashes_exact: packageAndLockExact,
  full_next_turbopack_build_mandatory: validationAndOrderingComplete,
  dependency_materialization_performed: false,
  corrected_candidate_created: false,
  installation_performed: false,
  registry_contacted: false,
  runtime_route_changed: !routeUnchanged,
  deployment_performed: false,
  production_blocked: true,
  main_push_blocked: true,
  recommended_next_step: passed
    ? "run_separate_copy_on_write_clone_capability_verification_without_candidate_creation"
    : "resolve_static_gate_contract_before_any_dependency_materialization",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
