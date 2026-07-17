import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const docPath = join(root, "docs/action-367-read-only-dependency-bridge-capability-verification.md");
const evidencePath = join(root, "docs/action-367-read-only-dependency-bridge-capability-evidence.json");
const verifier = "scripts/action-367-read-only-dependency-bridge-capability-verification-verify.mjs";

function doc() {
  return readFileSync(docPath, "utf8");
}

function evidence() {
  return JSON.parse(readFileSync(evidencePath, "utf8"));
}

function run(script: string) {
  return JSON.parse(execFileSync("node", [script], { cwd: root, encoding: "utf8" }));
}

test("documentation and decision vocabulary are complete", () => {
  const source = doc();
  expect(source).toContain("capability_vocabulary: capable | capable_with_conditions | blocked");
  expect(source).toContain("capability_decision: blocked");
  expect(source).toContain("Decision: `blocked`");
  expect(source).toContain("Turbopack rejects");
});

test("failed candidate Action 362 and preview attempt remain preserved", () => {
  const result = run(verifier);
  expect(result.failed_candidate_preserved).toBe(true);
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(result.corrected_candidate_created).toBe(false);
});

test("capability context is disposable and dependency bridge is external", () => {
  const value = evidence();
  expect(value.contexts.capability.candidate_or_deploy_input).toBe(false);
  expect(value.contexts.capability.commit_created).toBe(false);
  expect(realpathSync("/private/tmp/ture-action-367-dependency-capability/node_modules")).toBe(
    join(root, "node_modules"),
  );
  expect(value.dependency_source.copied_into_context).toBe(false);
  expect(value.dependency_source.included_in_git_or_deploy_input).toBe(false);
});

test("package lock runtime and provenance evidence are exact", () => {
  const value = evidence();
  expect(value.runtime.node_version).toBe("v26.3.1");
  expect(value.runtime.npm_version).toBe("11.16.0");
  expect(value.runtime.platform).toBe("darwin");
  expect(value.runtime.architecture).toBe("arm64");
  expect(value.integrity.package_json_sha256_source_and_context).toBe(
    "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58",
  );
  expect(value.integrity.package_lock_sha256_source_and_context).toBe(
    "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657",
  );
});

test("module and binary resolution use the trusted dependency root", () => {
  const value = evidence();
  for (const path of [...Object.values(value.module_resolution), ...Object.values(value.binary_resolution)] as string[]) {
    expect(path).toContain(join(root, "node_modules"));
  }
  expect(value.package_versions).toEqual({
    next: "16.2.6",
    typescript: "5.9.3",
    eslint: "9.39.4",
    playwright_test: "1.60.0",
  });
});

test("read-only enforcement and dependency integrity remain exact", () => {
  const value = evidence();
  expect(value.dependency_source.write_canary_denied).toBe(true);
  expect(value.dependency_source.write_canary_created).toBe(false);
  expect(value.dependency_source.read_only_enforced).toBe(true);
  expect(value.integrity.dependency_root_changed).toBe(false);
  expect(value.integrity.package_json_changed).toBe(false);
  expect(value.integrity.package_lock_changed).toBe(false);
  expect(value.integrity.dependency_root_metadata_sha256_before_and_after).toBe(
    "a9576999e30f6c5182cf26f68f38bb4803df27960dd09415e0975509bb88dd96",
  );
});

test("registry fallback is prevented and no installation occurred", () => {
  const value = evidence().registry_and_installation;
  expect(value.registry_access_prevented).toBe(true);
  expect(value.registry_access_not_observed).toBe(true);
  expect(value.registry_access_cannot_be_ruled_out).toBe(false);
  expect(value.installation_command_count).toBe(0);
  expect(value.automatic_install_fallback_observed).toBe(false);
});

test("validation capability results distinguish passes from bridge failure", () => {
  const value = evidence().validation_capability;
  expect(value.next_typegen).toBe("passed");
  expect(value.typescript_no_emit).toBe("passed");
  expect(value.complete_build).toBe("failed_dependency_bridge");
  expect(value.complete_build_failure).toContain("Turbopack rejects");
  expect(value.lint).toBe("passed");
  expect(value.golden_verifier).toBe("passed");
  expect(value.full_required_stack_executable).toBe(false);
});

test("generated outputs are ignored and no dependency enters deploy input", () => {
  const value = evidence();
  expect(value.contexts.capability.generated_ignored_outputs).toEqual([
    ".next/", "node_modules", "test-results/",
  ]);
  expect(value.safety.dependency_copy_performed).toBe(false);
  expect(value.safety.lockfile_modified).toBe(false);
  expect(value.safety.package_json_modified).toBe(false);
});

test("verifier succeeds while capability remains blocked", () => {
  const result = run(verifier);
  expect(result.verification_status).toBe("passed");
  expect(result.capability_decision).toBe("blocked");
  expect(result.dependency_read_only_enforced).toBe(true);
  expect(result.registry_access_prevented).toBe(true);
  expect(result.full_required_stack_executable).toBe(false);
  expect(result.deployment_performed).toBe(false);
  expect(result.production_blocked).toBe(true);
  expect(result.main_push_blocked).toBe(true);
});

test("verifier is local read-only install-free and network-free", () => {
  const source = readFileSync(join(root, verifier), "utf8");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("npm install");
  expect(source).not.toContain("npm ci");
  expect(source).not.toContain("git commit");
  expect(source).not.toContain("netlify deploy");
});

test("evidence file content hash is stable during verification", () => {
  const before = createHash("sha256").update(readFileSync(evidencePath)).digest("hex");
  run(verifier);
  const after = createHash("sha256").update(readFileSync(evidencePath)).digest("hex");
  expect(after).toBe(before);
});

test("relevant upstream static gates remain healthy while Action 365 stays blocked evidence", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs",
    "scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs",
    "scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs",
    "scripts/action-358-runtime-ping-only-route-implementation-readiness-review-verify.mjs",
    "scripts/action-359-runtime-ping-only-route-implementation-approval-gate-verify.mjs",
    "scripts/action-360-runtime-ping-only-route-implementation-verify.mjs",
    "scripts/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review-verify.mjs",
    "scripts/action-362-runtime-ping-only-preview-deploy-approval-gate-verify.mjs",
    "scripts/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness-verify.mjs",
    "scripts/action-364-immutable-preview-revision-preparation-approval-gate-verify.mjs",
    "scripts/action-366-corrected-immutable-preview-candidate-preparation-approval-gate-verify.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];
  const results = scripts.map(run);
  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(true);
});
