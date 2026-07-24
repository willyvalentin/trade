import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const candidate = "/private/tmp/ture-action-370-corrected-preview-candidate";
const manifestPath = join(candidate, "docs/action-370-preview-deployment-input-manifest.json");
const bindingPath = "/private/tmp/ture-action-370-corrected-preview-candidate-binding-evidence.json";
const verifier = "scripts/action-370-corrected-immutable-preview-candidate-preparation-verify.mjs";

function manifest() {
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function runVerifier() {
  return JSON.parse(execFileSync("node", [join(root, verifier)], { cwd: root, encoding: "utf8" }));
}

test("failed candidate baseline and exact correction scope are preserved", () => {
  const value = manifest();
  expect(value.failed_candidate.sha).toBe("8cfe239dc122d85770bfc86586f00716695915d1");
  expect(value.failed_candidate.permanently_non_deployable).toBe(true);
  expect(value.selected_baseline_sha).toBe("51aced66782ec9a37cd358238f02b6f5c0ae97bd");
  expect(value.parent_revision_sha).toBe(value.selected_baseline_sha);
  expect(value.corrections.trailing_eof_blank_lines_removed).toHaveLength(3);
  expect(value.corrections.action_365_matcher_before).toBe("35[0-7]");
  expect(value.corrections.action_365_matcher_after).toBe("35[1-7]");
  expect(value.corrections.action_363_manifest_backed_historical_evidence).toBe(true);
  expect(value.corrections.generic_missing_file_waiver_added).toBe(false);
  expect(value.corrections.safety_check_weakened).toBe(false);
});

test("every included and excluded file has an exact ownership classification", () => {
  const value = manifest();
  expect(value.unresolved_blocker_count).toBe(0);
  expect(value.included_files.every((entry: { classification: string; included: boolean }) =>
    ["approved_preview_input", "approved_baseline_dependency"].includes(entry.classification) &&
    entry.included === true,
  )).toBe(true);
  expect(value.excluded_concurrent_files.every((entry: { classification: string; included: boolean }) =>
    entry.classification === "unrelated_excluded" && entry.included === false,
  )).toBe(true);
});

test("route hash and one introduced runtime route remain exact", () => {
  const value = manifest();
  expect(value.route.path).toBe("app/api/runtime-health/ping/route.ts");
  expect(value.route.sha256).toBe("98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb");
  expect(value.inventories.runtime_routes.introduced).toEqual([value.route.path]);
  expect(value.inventories.runtime_routes.additional_introduced).toEqual([]);
});

test("clonefile dependency strategy and integrity are exact", () => {
  const dependency = manifest().dependency;
  expect(dependency.mechanism).toBe("macos_clonefile_recursive_no_fallback");
  expect(dependency.source_digest_sha256).toBe(dependency.destination_digest_sha256);
  expect(dependency.unsafe_shared_inode_count).toBe(0);
  expect(dependency.external_symlink_count).toBe(0);
  expect(dependency.ordinary_copy_fallback).toBe(false);
  expect(dependency.node_modules_gitignored).toBe(true);
  expect(dependency.node_modules_tracked_file_count).toBe(0);
  expect(dependency.node_modules_in_deployment_input).toBe(false);
});

test("package lock registry and install boundaries remain immutable", () => {
  const value = manifest();
  expect(value.package_json_sha256).toBe("7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58");
  expect(value.package_lock_sha256).toBe("859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657");
  expect(value.dependency.registry_access_prevented).toBe(true);
  expect(value.dependency.registry_access_cannot_be_ruled_out).toBe(false);
  expect(value.dependency.installation_command_count).toBe(0);
});

test("migration schema config environment and provider inventories are empty", () => {
  const inventories = manifest().inventories;
  expect(inventories.migrations.changed).toEqual([]);
  expect(inventories.schema_changes).toEqual([]);
  expect(inventories.proxy_middleware_netlify_changes).toEqual([]);
  expect(inventories.environment_files_included).toEqual([]);
  expect(inventories.provider_supabase_touch).toEqual([]);
});

test("pre-freeze validation contract is complete", () => {
  const values = Object.values(manifest().pre_freeze_results);
  expect(values.length).toBeGreaterThan(10);
  expect(values.every((value) => value === "passed" || value === true)).toBe(true);
});

test("manifest uses canonical self-reference and complete file coverage", () => {
  const value = manifest();
  const self = value.included_files.find((entry: { path: string }) =>
    entry.path === "docs/action-370-preview-deployment-input-manifest.json");
  expect(value.canonical_serialization).toBe("json_pretty_2_space_sorted_path_arrays_terminal_newline");
  expect(self.canonical_self_reference).toBe(true);
  expect(self.candidate_sha256).toBeNull();
  expect(runVerifier().manifest_covers_frozen_tree).toBe(true);
});

test("phase-aware verifier validates pre-freeze or immutable binding state", () => {
  const result = runVerifier();
  expect(result.verification_status).toBe("passed");
  if (existsSync(bindingPath)) {
    expect(result.verification_phase).toBe("post_freeze");
    expect(result.preparation_decision).toBe("prepared");
    expect(result.immutable_candidate_sha).toMatch(/^[a-f0-9]{40}$/);
    expect(result.revision_binding_valid).toBe(true);
    expect(result.post_freeze_validation_passed).toBe(true);
    expect(result.frozen_tree_clean).toBe(true);
  } else {
    expect(result.verification_phase).toBe("pre_freeze");
    expect(result.preparation_decision).toBe("prepared_with_conditions");
  }
});

test("external binding is deterministic when present", () => {
  test.skip(!existsSync(bindingPath), "binding is created only after immutable freeze");
  const binding = JSON.parse(readFileSync(bindingPath, "utf8"));
  const manifestHash = createHash("sha256").update(readFileSync(manifestPath)).digest("hex");
  expect(binding.immutable_candidate_sha).toBe(
    execFileSync("git", ["rev-parse", "HEAD"], { cwd: candidate, encoding: "utf8" }).trim(),
  );
  expect(binding.manifest_sha256).toBe(manifestHash);
  expect(binding.post_freeze_validation.complete).toBe(true);
});

test("Action 362 preview attempt push and deployment remain untouched", () => {
  const safety = manifest().safety;
  expect(safety.action_362_approval_preserved).toBe(true);
  expect(safety.preview_attempt_consumed).toBe(false);
  expect(safety.push_performed).toBe(false);
  expect(safety.deployment_performed).toBe(false);
  expect(safety.production_blocked).toBe(true);
  expect(safety.main_push_blocked).toBe(true);
});

test("verifier is local-only and does not install push or deploy", () => {
  const source = readFileSync(join(root, verifier), "utf8");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("npm install");
  expect(source).not.toContain("npm ci");
  expect(source).not.toContain("git push");
  expect(source).not.toContain("netlify deploy");
});
