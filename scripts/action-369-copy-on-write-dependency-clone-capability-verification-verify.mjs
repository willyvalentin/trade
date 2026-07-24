#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath = "docs/action-369-copy-on-write-dependency-clone-capability-verification.md";
const evidencePath = "docs/action-369-copy-on-write-dependency-clone-capability-evidence.json";
const action362Path = "docs/action-362-runtime-ping-only-preview-deploy-approval-gate.md";
const action367EvidencePath = "docs/action-367-read-only-dependency-bridge-capability-evidence.json";
const action368Path = "docs/action-368-isolated-dependency-materialization-strategy-approval-gate.md";
const failedCandidatePath = "/private/tmp/ture-action-365-preview-revision-51aced6";
const failedCandidateSha = "8cfe239dc122d85770bfc86586f00716695915d1";
const contextPath = "/private/tmp/ture-action-369-cow-capability";
const destinationPath = join(contextPath, "node_modules");
const expectedPackageHash = "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58";
const expectedLockHash = "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657";
const expectedRouteHash = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const expectedInventoryDigest = "44b4cad2882f45c4b0114848410f5b28105495812885239e34452da0d666ec91";

const requiredSections = [
  "## Purpose", "## Scope", "## Recovery Context", "## Upstream Dependencies",
  "## Action 365 Failed-Candidate Preservation", "## Action 366 Correction Status",
  "## Action 367 Blocked Result", "## Action 368 Selected Strategy",
  "## Action 362 Approval Status", "## Preview-Attempt Status", "## Explicit Non-Goals",
  "## Disposable Capability-Context Definition", "## Trusted Dependency-Source Definition",
  "## Selected COW Mechanism", "## Filesystem and Volume Information",
  "## Physical-Locality Definition", "## Source/Destination Path Relationship",
  "## Source-Integrity Strategy", "## Destination-Integrity Strategy",
  "## Inode-Isolation Strategy", "## Hardlink Detection", "## Symlink Detection",
  "## External-Symlink Detection", "## COW Behavior Evidence",
  "## Destination-Write Isolation Test", "## Permission Preservation",
  "## Executable-Bit Preservation", "## Native-Binary Compatibility",
  "## Package and Lockfile Hashes", "## Dependency Inventory Method",
  "## Deterministic Source Digest", "## Deterministic Destination Digest",
  "## Missing-File Detection", "## Extra-File Detection",
  "## File-Type Difference Detection", "## Git-Ignore Evidence",
  "## Git-Untracked Evidence", "## Deployment-Input Exclusion Evidence",
  "## Network and Registry Prevention", "## Automatic Fallback Prevention",
  "## Installation-Command Prohibition", "## Lifecycle-Script Prohibition",
  "## Module and Binary Locality", "## Generated-Output Policy",
  "## Full-Validation Capability", "## After-Validation Integrity",
  "## Cleanup and Abandonment Strategy", "## Capability Vocabulary",
  "## Deterministic Capability Conditions", "## Capability Decision",
  "## Passed Conditions", "## Failed Conditions", "## Unresolved Conditions",
  "## Next Permitted Action",
];

function sha(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function inside(parent, child) {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== "..");
}

function includesAll(source, values) {
  return values.every((value) => source.includes(value));
}

const docFound = existsSync(join(root, docPath));
const evidenceFound = existsSync(join(root, evidencePath));
const doc = docFound ? readFileSync(join(root, docPath), "utf8") : "";
let evidence = null;
let action367Evidence = null;
try {
  evidence = evidenceFound ? JSON.parse(readFileSync(join(root, evidencePath), "utf8")) : null;
  action367Evidence = JSON.parse(readFileSync(join(root, action367EvidencePath), "utf8"));
} catch {
  evidence = null;
}

const action362 = existsSync(join(root, action362Path))
  ? readFileSync(join(root, action362Path), "utf8")
  : "";
const action368 = existsSync(join(root, action368Path))
  ? readFileSync(join(root, action368Path), "utf8")
  : "";
const failedCandidatePreserved = existsSync(failedCandidatePath) &&
  git(failedCandidatePath, ["rev-parse", "HEAD"]) === failedCandidateSha &&
  git(failedCandidatePath, ["status", "--porcelain=v1", "--untracked-files=all"]) === "";
const action362Preserved = includesAll(action362, [
  "approval_decision: approved",
  "preview_deployment_approved_for_later_action: true",
  "production_deployment_approved: false",
]);
const action367Blocked = action367Evidence?.capability_decision === "blocked" &&
  action367Evidence?.validation_capability?.complete_build === "failed_dependency_bridge";
const action368Selected = includesAll(action368, [
  "approval_decision: approved_with_conditions",
  "selected_strategy: C_verified_copy_on_write_filesystem_clone",
]);
const destinationPhysical = existsSync(destinationPath) &&
  lstatSync(destinationPath).isDirectory() && !lstatSync(destinationPath).isSymbolicLink() &&
  inside(realpathSync(contextPath), realpathSync(destinationPath));
const packageAndLockExact = sha(join(root, "package.json")) === expectedPackageHash &&
  sha(join(root, "package-lock.json")) === expectedLockHash &&
  sha(join(contextPath, "package.json")) === expectedPackageHash &&
  sha(join(contextPath, "package-lock.json")) === expectedLockHash;
const routeExact = sha(join(root, "app/api/runtime-health/ping/route.ts")) === expectedRouteHash &&
  sha(join(contextPath, "app/api/runtime-health/ping/route.ts")) === expectedRouteHash;
const sectionsComplete = requiredSections.every((section) => doc.includes(section));
const decisionComplete = includesAll(doc, [
  "capability_vocabulary: capable | capable_with_conditions | blocked",
  "capability_decision: capable", "Decision: `capable`.",
]);

const filesystemEvidenceComplete = evidence?.filesystem?.filesystem_type === "apfs" &&
  evidence?.filesystem?.same_volume === true &&
  evidence?.filesystem?.clone_mechanism === "macos_clonefile_recursive_no_fallback" &&
  evidence?.filesystem?.fallback_path_available === false &&
  evidence?.filesystem?.clone_creation_succeeded === true &&
  evidence?.filesystem?.cloned_regular_files === 23839 &&
  evidence?.filesystem?.physical_locality_proven === true;
const inventoryEvidenceComplete = evidence?.source_inventory_before_and_after?.entry_count === 26100 &&
  evidence?.destination_inventory_after_clone_and_validation?.entry_count === 26100 &&
  evidence?.source_inventory_before_and_after?.deterministic_inventory_digest_sha256 === expectedInventoryDigest &&
  evidence?.destination_inventory_after_clone_and_validation?.deterministic_inventory_digest_sha256 === expectedInventoryDigest &&
  evidence?.digest_comparison?.digests_match === true &&
  evidence?.digest_comparison?.missing_file_count === 0 &&
  evidence?.digest_comparison?.extra_file_count === 0 &&
  evidence?.digest_comparison?.content_difference_count === 0 &&
  evidence?.digest_comparison?.file_type_difference_count === 0;
const isolationEvidenceComplete = evidence?.inode_isolation?.unsafe_shared_inode_count === 0 &&
  evidence?.inode_isolation?.hardlink_mutation_risk_excluded === true &&
  evidence?.destination_write_isolation?.passed === true &&
  evidence?.destination_write_isolation?.source_mutation_observed === false &&
  evidence?.symlink_evidence?.destination_external_symlink_count === 0 &&
  evidence?.symlink_evidence?.root_node_modules_symlink === false;
const permissionsComplete = evidence?.permission_and_executable_evidence?.permission_difference_count === 0 &&
  evidence?.permission_and_executable_evidence?.executable_bit_difference_count === 0 &&
  evidence?.permission_and_executable_evidence?.native_binaries_platform_compatible === true;
const gitAndDeployComplete = evidence?.git_and_deployment_exclusion?.node_modules_gitignored === true &&
  evidence?.git_and_deployment_exclusion?.tracked_dependency_file_count === 0 &&
  evidence?.git_and_deployment_exclusion?.dependency_in_deployment_input === false &&
  evidence?.git_and_deployment_exclusion?.environment_file_introduced === false;
const registryAndInstallComplete = evidence?.registry_and_fallback_prevention?.registry_access_prevented === true &&
  evidence?.registry_and_fallback_prevention?.registry_access_not_observed === true &&
  evidence?.registry_and_fallback_prevention?.registry_access_cannot_be_ruled_out === false &&
  evidence?.registry_and_fallback_prevention?.installation_command_count === 0 &&
  evidence?.registry_and_fallback_prevention?.automatic_install_fallback_observed === false;
const localResolutionComplete = [
  ...Object.values(evidence?.module_resolution ?? {}),
  ...Object.values(evidence?.binary_resolution ?? {}),
].length >= 11 && [
  ...Object.values(evidence?.module_resolution ?? {}),
  ...Object.values(evidence?.binary_resolution ?? {}),
].every((path) => typeof path === "string" && inside(destinationPath, path));
const validationComplete = evidence?.validation_results?.next_typegen === "passed" &&
  evidence?.validation_results?.typescript_no_emit === "passed" &&
  evidence?.validation_results?.complete_next_turbopack_build === "passed" &&
  evidence?.validation_results?.lint === "passed_with_one_preexisting_warning" &&
  evidence?.validation_results?.full_required_stack_executable === true;
const safetyComplete = evidence?.capability_context?.corrected_candidate === false &&
  evidence?.safety?.corrected_candidate_created === false &&
  evidence?.safety?.commit_performed === false && evidence?.safety?.push_performed === false &&
  evidence?.safety?.deployment_performed === false && evidence?.safety?.provider_contacted === false &&
  evidence?.safety?.supabase_contacted === false && evidence?.safety?.replay_executed === false &&
  evidence?.approval_state?.action_362_approval_preserved === true &&
  evidence?.approval_state?.preview_attempt_consumed === false;
const nextActionSeparate = includesAll(doc, [
  "separate corrected immutable preview candidate preparation approval/execution Action",
  "stop without deployment",
]);

const passed = docFound && evidenceFound && sectionsComplete && decisionComplete &&
  action367Blocked && action368Selected && failedCandidatePreserved && action362Preserved &&
  destinationPhysical && packageAndLockExact && routeExact && filesystemEvidenceComplete &&
  inventoryEvidenceComplete && isolationEvidenceComplete && permissionsComplete &&
  gitAndDeployComplete && registryAndInstallComplete && localResolutionComplete &&
  validationComplete && safetyComplete && nextActionSeparate;

const result = {
  verification_status: passed ? "passed" : "failed",
  capability_decision: "capable",
  selected_strategy: "C_verified_copy_on_write_filesystem_clone",
  clone_mechanism: evidence?.filesystem?.clone_mechanism ?? "missing",
  filesystem_support_proven: filesystemEvidenceComplete,
  physical_locality_proven: destinationPhysical && evidence?.filesystem?.physical_locality_proven === true,
  source_destination_inventory_match: inventoryEvidenceComplete,
  deterministic_digest_match: evidence?.digest_comparison?.digests_match === true,
  unsafe_shared_inode_count: evidence?.inode_isolation?.unsafe_shared_inode_count ?? null,
  destination_write_isolation_passed: evidence?.destination_write_isolation?.passed === true,
  external_symlink_count: evidence?.symlink_evidence?.destination_external_symlink_count ?? null,
  package_and_lockfile_hashes_exact: packageAndLockExact,
  git_and_deployment_exclusion_proven: gitAndDeployComplete,
  registry_access_prevented: evidence?.registry_and_fallback_prevention?.registry_access_prevented === true,
  registry_access_cannot_be_ruled_out: evidence?.registry_and_fallback_prevention?.registry_access_cannot_be_ruled_out,
  installation_command_count: evidence?.registry_and_fallback_prevention?.installation_command_count ?? null,
  local_module_and_binary_resolution_proven: localResolutionComplete,
  complete_next_turbopack_build: evidence?.validation_results?.complete_next_turbopack_build ?? "missing",
  full_required_stack_executable: evidence?.validation_results?.full_required_stack_executable === true,
  failed_candidate_preserved: failedCandidatePreserved,
  action_362_approval_preserved: action362Preserved,
  preview_attempt_consumed: false,
  corrected_candidate_created: false,
  route_hash_exact: routeExact,
  commit_performed: false,
  push_performed: false,
  deployment_performed: false,
  production_blocked: true,
  main_push_blocked: true,
  recommended_next_step: passed
    ? "separately_gate_corrected_immutable_candidate_preparation_using_proven_clonefile_strategy"
    : "preserve_context_and_resolve_capability_evidence_before_candidate_preparation",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
