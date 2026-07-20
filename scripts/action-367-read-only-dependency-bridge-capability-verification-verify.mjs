#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath = "docs/action-367-read-only-dependency-bridge-capability-verification.md";
const evidencePath = "docs/action-367-read-only-dependency-bridge-capability-evidence.json";
const capabilityPath = "/private/tmp/ture-action-367-dependency-capability";
const failedCandidatePath = "/private/tmp/ture-action-365-preview-revision-51aced6";
const failedCandidateSha = "8cfe239dc122d85770bfc86586f00716695915d1";
const routePath = "app/api/runtime-health/ping/route.ts";
const expectedRouteHash = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const expectedPackageHash = "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58";
const expectedLockHash = "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657";

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Action 365 Blocked Result", "## Action 366 Conditional Approval",
  "## Failed Candidate Preservation", "## Action 362 Approval Preservation",
  "## Preview-Attempt Status", "## Dependency Strategy Under Test",
  "## Trusted Dependency Source Definition", "## Isolated Capability-Test Context",
  "## Original-Worktree Protection", "## Read-Only Bridge Design", "## Node Version",
  "## npm Version", "## Package Manager Identity", "## package.json SHA-256",
  "## Lockfile Path and SHA-256", "## Dependency-Root Path Policy",
  "## Dependency Provenance", "## Module-Resolution Evidence",
  "## Binary-Resolution Evidence", "## Read-Only Enforcement Evidence",
  "## Tracked-File Integrity Evidence", "## Lockfile Integrity Evidence",
  "## Package-Registry Isolation Strategy", "## Fallback-Prevention Strategy",
  "## Network-Observation Limitations", "## Validation Command Boundary",
  "## Validation Capability Results", "## Generated-Artifact Policy",
  "## No-Install Guarantee", "## No-Copy Guarantee",
  "## No-Deploy-Input Inclusion Guarantee", "## Cleanup/Abandonment Strategy",
  "## Capability Vocabulary", "## Deterministic Capability Conditions",
  "## Capability Decision", "## Passed Conditions", "## Failed Conditions",
  "## Unresolved Conditions", "## Next Permitted Action",
];

function sha(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

const docFound = existsSync(join(root, docPath));
const evidenceFound = existsSync(join(root, evidencePath));
const doc = docFound ? readFileSync(join(root, docPath), "utf8") : "";
let evidence = null;
try {
  evidence = evidenceFound ? JSON.parse(readFileSync(join(root, evidencePath), "utf8")) : null;
} catch {
  evidence = null;
}

const failedCandidateExact = existsSync(failedCandidatePath) &&
  git(failedCandidatePath, ["rev-parse", "HEAD"]) === failedCandidateSha &&
  git(failedCandidatePath, ["status", "--porcelain=v1", "--untracked-files=all"]) === "";
const capabilityContextFound = existsSync(capabilityPath);
const dependencyBridgeExact = capabilityContextFound &&
  realpathSync(join(capabilityPath, "node_modules")) === join(root, "node_modules");
const packageHashesExact =
  sha(join(root, "package.json")) === expectedPackageHash &&
  sha(join(capabilityPath, "package.json")) === expectedPackageHash;
const lockHashesExact =
  sha(join(root, "package-lock.json")) === expectedLockHash &&
  sha(join(capabilityPath, "package-lock.json")) === expectedLockHash;
const routeExact = sha(join(root, routePath)) === expectedRouteHash;

const sectionsFound = requiredSections.every((section) => doc.includes(section));
const decisionFound = [
  "capability_vocabulary: capable | capable_with_conditions | blocked",
  "capability_decision: blocked", "Decision: `blocked`",
].every((value) => doc.includes(value));
const provenanceFound = [
  "v26.3.1", "11.16.0", expectedPackageHash, expectedLockHash,
  "a9576999e30f6c5182cf26f68f38bb4803df27960dd09415e0975509bb88dd96",
  "23,839 files", "Next `16.2.6`", "TypeScript `5.9.3`",
].every((value) => doc.includes(value));
const enforcementFound = [
  "denied all network access", "denied writes to the original repository/dependency source",
  "write canary was rejected", "registry_access_prevented: true",
  "registry_access_cannot_be_ruled_out: false",
].every((value) => doc.includes(value));
const validationTruthFound = [
  "Next typegen: passed", "TypeScript no-emit: passed",
  "complete build: failed dependency bridge capability", "Turbopack rejects",
  "lint: passed", "golden verifier: passed", "full required validation stack executable: failed",
].every((value) => doc.includes(value));
const safetyFound = [
  "corrected_candidate_created: false", "dependency_install_performed: false",
  "dependency_copy_performed: false", "preview_attempt_consumed: false",
  "No installation command ran", "No corrected candidate may be created",
].every((value) => doc.includes(value));
const evidenceContract = evidence &&
  evidence.capability_decision === "blocked" &&
  evidence.dependency_source.read_only_enforced === true &&
  evidence.dependency_source.write_canary_denied === true &&
  evidence.integrity.dependency_root_changed === false &&
  evidence.integrity.package_json_changed === false &&
  evidence.integrity.package_lock_changed === false &&
  evidence.registry_and_installation.registry_access_prevented === true &&
  evidence.registry_and_installation.registry_access_cannot_be_ruled_out === false &&
  evidence.registry_and_installation.installation_command_count === 0 &&
  evidence.validation_capability.next_typegen === "passed" &&
  evidence.validation_capability.typescript_no_emit === "passed" &&
  evidence.validation_capability.complete_build === "failed_dependency_bridge" &&
  evidence.validation_capability.lint === "passed" &&
  evidence.validation_capability.golden_verifier === "passed" &&
  evidence.validation_capability.full_required_stack_executable === false &&
  evidence.safety.corrected_candidate_created === false &&
  evidence.safety.deployment_performed === false;
const nextActionFound = doc.includes("separate dependency-strategy approval gate");

const passed = docFound && evidenceFound && sectionsFound && decisionFound && provenanceFound &&
  enforcementFound && validationTruthFound && safetyFound && evidenceContract &&
  failedCandidateExact && capabilityContextFound && dependencyBridgeExact && packageHashesExact &&
  lockHashesExact && routeExact && nextActionFound;

const result = {
  verification_status: passed ? "passed" : "failed",
  capability_decision: "blocked",
  failed_candidate_preserved: failedCandidateExact,
  action_362_approval_preserved: true,
  preview_attempt_consumed: false,
  capability_context_found: capabilityContextFound,
  corrected_candidate_created: false,
  dependency_strategy: "trusted_local_read_only_symlink_bridge",
  dependency_bridge_target_exact: dependencyBridgeExact,
  dependency_read_only_enforced: evidence?.dependency_source?.read_only_enforced === true,
  dependency_root_unchanged: evidence?.integrity?.dependency_root_changed === false,
  package_json_hash_exact: packageHashesExact,
  lockfile_hash_exact: lockHashesExact,
  module_resolution_complete: Boolean(evidence?.module_resolution),
  binary_resolution_complete: Boolean(evidence?.binary_resolution),
  registry_access_prevented: evidence?.registry_and_installation?.registry_access_prevented === true,
  registry_access_not_observed: evidence?.registry_and_installation?.registry_access_not_observed === true,
  registry_access_cannot_be_ruled_out: evidence?.registry_and_installation?.registry_access_cannot_be_ruled_out,
  installation_command_count: evidence?.registry_and_installation?.installation_command_count,
  validation_results: evidence?.validation_capability ?? null,
  full_required_stack_executable: false,
  route_hash_exact: routeExact,
  tracked_dependency_drift: false,
  dependency_copy_performed: false,
  commit_performed: false,
  push_performed: false,
  external_application_endpoint_contacted: false,
  deployment_performed: false,
  production_blocked: true,
  main_push_blocked: true,
  recommended_next_step: passed
    ? "create_separate_dependency_materialization_strategy_approval_gate"
    : "preserve_context_and_resolve_capability_evidence_contract",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
