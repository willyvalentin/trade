import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const docPath = join(root, "docs/action-369-copy-on-write-dependency-clone-capability-verification.md");
const evidencePath = join(root, "docs/action-369-copy-on-write-dependency-clone-capability-evidence.json");
const verifier = "scripts/action-369-copy-on-write-dependency-clone-capability-verification-verify.mjs";

function doc() {
  return readFileSync(docPath, "utf8");
}

function evidence() {
  return JSON.parse(readFileSync(evidencePath, "utf8"));
}

function run(script: string) {
  return JSON.parse(execFileSync("node", [script], { cwd: root, encoding: "utf8" }));
}

test("documentation and capability vocabulary are complete", () => {
  const source = doc();
  expect(source).toContain("capability_vocabulary: capable | capable_with_conditions | blocked");
  expect(source).toContain("capability_decision: capable");
  expect(source).toContain("Decision: `capable`.");
  expect(source).toContain("## Next Permitted Action");
});

test("evidence schema and disposable context boundary are explicit", () => {
  const value = evidence();
  expect(value.evidence_schema_version).toBe("1.0.0");
  expect(value.capability_context.classification).toBe(
    "disposable_non_candidate_dependency_capability_context",
  );
  expect(value.capability_context.separate_from_original_worktree).toBe(true);
  expect(value.capability_context.separate_from_failed_candidate).toBe(true);
  expect(value.capability_context.corrected_candidate).toBe(false);
  expect(value.capability_context.deployable).toBe(false);
});

test("failed candidate Action 362 and preview attempt remain preserved", () => {
  const result = run(verifier);
  expect(result.failed_candidate_preserved).toBe(true);
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
});

test("selected COW mechanism has genuine APFS force-clone evidence", () => {
  const value = evidence().filesystem;
  expect(value.filesystem_type).toBe("apfs");
  expect(value.same_volume).toBe(true);
  expect(value.clone_mechanism).toBe("macos_clonefile_recursive_no_fallback");
  expect(value.clone_api).toBe("clonefile(2)");
  expect(value.fallback_path_available).toBe(false);
  expect(value.clone_creation_succeeded).toBe(true);
  expect(value.cloned_regular_files).toBe(23839);
});

test("dependencies are physically local with no external bridge", () => {
  const value = evidence();
  expect(value.filesystem.physical_locality_proven).toBe(true);
  expect(value.filesystem.destination_root_is_symlink).toBe(false);
  expect(value.destination_identity.physically_below_project_root).toBe(true);
  expect(value.destination_identity.external_dependency_bridge).toBe(false);
});

test("source and destination inventories and deterministic digests match", () => {
  const value = evidence();
  expect(value.source_inventory_before_and_after.entry_count).toBe(26100);
  expect(value.destination_inventory_after_clone_and_validation.entry_count).toBe(26100);
  expect(value.source_inventory_before_and_after.deterministic_inventory_digest_sha256).toBe(
    value.destination_inventory_after_clone_and_validation.deterministic_inventory_digest_sha256,
  );
  expect(value.digest_comparison).toMatchObject({
    digests_match: true,
    missing_file_count: 0,
    extra_file_count: 0,
    content_difference_count: 0,
    file_type_difference_count: 0,
    permission_difference_count: 0,
    executable_bit_difference_count: 0,
  });
});

test("no unsafe hardlinks or external symlinks exist", () => {
  const value = evidence();
  expect(value.inode_isolation.unsafe_shared_inode_count).toBe(0);
  expect(value.inode_isolation.hardlink_mutation_risk_excluded).toBe(true);
  expect(value.symlink_evidence.destination_external_symlink_count).toBe(0);
  expect(value.symlink_evidence.root_node_modules_symlink).toBe(false);
});

test("destination write isolation preserves and restores source integrity", () => {
  const value = evidence().destination_write_isolation;
  expect(value.passed).toBe(true);
  expect(value.source_mutation_observed).toBe(false);
  expect(value.source_inode_unchanged).toBe(true);
  expect(value.source_size_mtime_ctime_unchanged).toBe(true);
  expect(value.destination_restored_by_clonefile).toBe(true);
  expect(value.destination_sha256_during_probe).not.toBe(value.source_sha256_before_and_after);
});

test("permissions executables and native binaries remain compatible", () => {
  const value = evidence().permission_and_executable_evidence;
  expect(value.permission_difference_count).toBe(0);
  expect(value.executable_bit_difference_count).toBe(0);
  expect(value.source_executable_file_count).toBe(104);
  expect(value.destination_executable_file_count).toBe(104);
  expect(value.native_binaries_platform_compatible).toBe(true);
});

test("package lock route and source integrity remain immutable", () => {
  const value = evidence();
  expect(value.package_and_lockfile_integrity.unchanged).toBe(true);
  expect(value.route_integrity.changed).toBe(false);
  expect(value.source_integrity_after_validation.trusted_dependency_source_unchanged).toBe(true);
  expect(value.source_integrity_after_validation.original_package_and_lockfile_unchanged).toBe(true);
});

test("Git ignore untracked and deployment exclusions are proven", () => {
  const value = evidence().git_and_deployment_exclusion;
  expect(value.node_modules_gitignored).toBe(true);
  expect(value.tracked_dependency_file_count).toBe(0);
  expect(value.node_modules_in_failed_candidate_preview_input_paths).toBe(false);
  expect(value.node_modules_in_failed_candidate_included_files).toBe(false);
  expect(value.dependency_in_deployment_input).toBe(false);
  expect(value.environment_file_introduced).toBe(false);
});

test("registry fallback installation and lifecycle paths remain blocked", () => {
  const value = evidence().registry_and_fallback_prevention;
  expect(value.registry_access_prevented).toBe(true);
  expect(value.registry_access_not_observed).toBe(true);
  expect(value.registry_access_cannot_be_ruled_out).toBe(false);
  expect(value.automatic_install_fallback_observed).toBe(false);
  expect(value.dependency_repair_observed).toBe(false);
  expect(value.installation_command_count).toBe(0);
  expect(value.lifecycle_install_script_count).toBe(0);
});

test("all representative modules and binaries resolve locally", () => {
  const value = evidence();
  const destination = value.destination_identity.path;
  for (const path of [...Object.values(value.module_resolution), ...Object.values(value.binary_resolution)] as string[]) {
    expect(path).toContain(destination);
  }
  expect(run(verifier).local_module_and_binary_resolution_proven).toBe(true);
});

test("complete build and full bounded validation capability pass", () => {
  const value = evidence().validation_results;
  expect(value.next_typegen).toBe("passed");
  expect(value.typescript_no_emit).toBe("passed");
  expect(value.complete_next_turbopack_build).toBe("passed");
  expect(value.lint).toBe("passed_with_one_preexisting_warning");
  expect(value.context_verifier_chain_executed).toBe(true);
  expect(value.context_portable_verifiers_passed).toContain("action_369");
  expect(value.context_bound_verifiers_classified_not_dependency_failures).toContain("action_365");
  expect(value.original_worktree_portable_guard_chain).toBe("passed");
  expect(value.full_required_stack_executable).toBe(true);
});

test("no candidate route deployment or external effect occurred", () => {
  const value = evidence().safety;
  expect(value.corrected_candidate_created).toBe(false);
  expect(value.commit_performed).toBe(false);
  expect(value.push_performed).toBe(false);
  expect(value.deployment_performed).toBe(false);
  expect(value.provider_contacted).toBe(false);
  expect(value.supabase_contacted).toBe(false);
  expect(value.replay_executed).toBe(false);
  expect(value.persistence_executed).toBe(false);
  expect(value.scanner_or_ranking_changed).toBe(false);
});

test("verifier succeeds and remains local read-only and install-free", () => {
  const source = readFileSync(join(root, verifier), "utf8");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("npm install");
  expect(source).not.toContain("npm ci");
  expect(source).not.toContain("git commit");
  expect(source).not.toContain("netlify deploy");
  const result = run(verifier);
  expect(result.verification_status).toBe("passed");
  expect(result.capability_decision).toBe("capable");
  expect(result.complete_next_turbopack_build).toBe("passed");
  expect(result.deployment_performed).toBe(false);
});

test("relevant upstream portable static gates remain healthy", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-366-corrected-immutable-preview-candidate-preparation-approval-gate-verify.mjs",
    "scripts/action-367-read-only-dependency-bridge-capability-verification-verify.mjs",
    "scripts/action-368-isolated-dependency-materialization-strategy-approval-gate-verify.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];
  const results = scripts.map(run);
  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(true);
});
