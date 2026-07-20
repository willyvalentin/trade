import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const docPath = join(root, "docs/action-366-corrected-immutable-preview-candidate-preparation-approval-gate.md");
const verifier = "scripts/action-366-corrected-immutable-preview-candidate-preparation-approval-gate-verify.mjs";

function doc() {
  return readFileSync(docPath, "utf8");
}

function run(script: string) {
  return JSON.parse(execFileSync("node", [script], { cwd: root, encoding: "utf8" }));
}

test("failed candidate remains clean immutable and non-deployable", () => {
  const result = run(verifier);
  expect(result.failed_candidate_sha).toBe("8cfe239dc122d85770bfc86586f00716695915d1");
  expect(result.failed_candidate_clean).toBe(true);
  expect(result.failed_candidate_manifest_hash_exact).toBe(true);
  expect(result.failed_candidate_deployable).toBe(false);
  expect(result.failed_candidate_preserved).toBe(true);
});

test("Action 362 approval and preview attempt remain preserved", () => {
  const source = doc();
  expect(source).toContain("action_362_approval_preserved: true");
  expect(source).toContain("preview_attempt_consumed: false");
  expect(source).toContain("No later preview attempt has started");
});

test("all known failures use exact root cause classifications", () => {
  const source = doc();
  for (const classification of [
    "source_formatting_defect", "verifier_contract_defect",
    "historical_evidence_assumption_defect", "dependency_environment_defect",
    "generated_evidence_unavailable", "external_access_uncertainty",
  ]) expect(source).toContain(classification);
});

test("correction allowlist is exact and leaves runtime immutable", () => {
  const source = doc();
  for (const path of [
    "docs/action-358-runtime-ping-only-route-implementation-readiness-review.md",
    "docs/action-359-runtime-ping-only-route-implementation-approval-gate.md",
    "docs/action-360-runtime-ping-only-route-implementation.md",
  ]) expect(source).toContain(path);
  expect(source).toContain("Narrow the Action 365 verifier's excluded Action matcher");
  expect(source).toContain("Narrow Action 363 verifier logic");
  expect(source).toContain("No runtime route/body/header/method change");
  expect(source).toContain("This is not a general missing-file waiver");
});

test("dependency options select A and reject automatic fetch copy and skipping", () => {
  const source = doc();
  for (const option of ["Option A", "Option B", "Option C", "Option D", "Option E"]) expect(source).toContain(option);
  expect(source).toContain("Select Option A with one final local capability condition");
  expect(source).toContain("Rejected. Automatic fetching");
  expect(source).toContain("Build, typecheck, golden, lint, verifiers, and Playwright remain mandatory");
  expect(source).toContain("Broad copying is not approved");
});

test("dependency evidence and lockfile integrity are complete", () => {
  const source = doc();
  for (const value of [
    "Node `v26.3.1`", "npm `11.16.0`",
    "859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657",
    "7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58",
    "proof no install fallback began", "Dependency storage must stay outside the revision",
  ]) expect(source).toContain(value);
});

test("corrected candidate uses new SHA manifest and retains old evidence", () => {
  const source = doc();
  expect(source).toContain("new immutable SHA and new manifest");
  expect(source).toContain("old revision as non-deployable");
  expect(source).toContain("does not amend, replace, or delete the old revision");
  expect(source).toContain("remain local, unpushed, and undeployed");
});

test("full pre-freeze and post-freeze validation cannot be weakened", () => {
  const source = doc();
  expect(source).toContain("## Pre-Freeze Validation Requirements");
  expect(source).toContain("## Post-Freeze Validation Requirements");
  expect(source).toContain("commit-level diff check, Next typegen, TypeScript, complete build, lint");
  expect(source).toContain("No failure may become a warning");
});

test("approval remains conditional and static", () => {
  const source = doc();
  expect(source).toContain("approval_vocabulary: approved | approved_with_conditions | blocked");
  expect(source).toContain("approval_decision: approved_with_conditions");
  expect(source).toContain("Decision: `approved_with_conditions`");
  expect(source).toContain("new_candidate_created: false");
  expect(source).toContain("dependency_install_performed: false");
  expect(source).toContain("package_registry_contacted: false");
  expect(source).toContain("deployment_performed: false");
});

test("verifier is read-only network-free and reports pending capability", () => {
  const result = run(verifier);
  expect(result.verification_status).toBe("passed");
  expect(result.approval_decision).toBe("approved_with_conditions");
  expect(result.selected_dependency_strategy).toBe("A_trusted_local_read_only_reuse");
  expect(result.dependency_capability_check_pending).toBe(true);
  expect(result.repository_operation_performed).toBe(false);
  expect(result.dependency_install_performed).toBe(false);
  expect(result.package_registry_contacted).toBe(false);
  expect(result.deployment_performed).toBe(false);

  const source = readFileSync(join(root, verifier), "utf8");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("netlify deploy");
  expect(source).not.toContain("npm install");
  expect(source).not.toContain("git commit");
});

test("upstream static and safety gates remain healthy", () => {
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
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];
  const results = scripts.map(run);
  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(true);
});
