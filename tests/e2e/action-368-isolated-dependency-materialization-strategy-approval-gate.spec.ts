import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const docPath = join(root, "docs/action-368-isolated-dependency-materialization-strategy-approval-gate.md");
const verifier = "scripts/action-368-isolated-dependency-materialization-strategy-approval-gate-verify.mjs";

function doc() {
  return readFileSync(docPath, "utf8");
}

function run(script: string) {
  return JSON.parse(execFileSync("node", [script], { cwd: root, encoding: "utf8" }));
}

test("documentation contract and approval vocabulary are complete", () => {
  const source = doc();
  expect(source).toContain("approval_vocabulary: approved | approved_with_conditions | blocked");
  expect(source).toContain("approval_decision: approved_with_conditions");
  expect(source).toContain("Decision: `approved_with_conditions`.");
  expect(source).toContain("## Next Permitted Action");
});

test("failed candidate Action 362 and preview approval remain preserved", () => {
  const result = run(verifier);
  expect(result.failed_candidate_preserved).toBe(true);
  expect(result.failed_candidate_sha).toBe("8cfe239dc122d85770bfc86586f00716695915d1");
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
});

test("Action 367 blocker and Turbopack root restriction remain explicit", () => {
  const result = run(verifier);
  expect(result.action_367_capability_decision).toBe("blocked");
  expect(result.action_367_turbopack_symlink_blocker_verified).toBe(true);
  expect(doc()).toContain("Turbopack rejects a project `node_modules` symlink");
});

test("all seven strategy options are compared and one physical-local strategy is selected", () => {
  const source = doc();
  for (const option of ["A", "B", "C", "D", "E", "F", "G"]) {
    expect(source).toContain(`| ${option} |`);
  }
  const result = run(verifier);
  expect(result.strategy_options_complete).toBe(true);
  expect(result.selected_strategy).toBe("C_verified_copy_on_write_filesystem_clone");
  expect(result.bounded_filesystem_capability_check_pending).toBe(true);
});

test("unsafe symlink hardlink installation and skipped-build paths are rejected", () => {
  const source = doc();
  expect(source).toContain("E and G are categorically rejected");
  expect(source).toContain("D is rejected because shared inode writes can mutate source");
  expect(source).toContain("F remains rejected absent separate offline provenance and lifecycle proof");
  expect(source).toContain("complete Next/Turbopack build remains mandatory");
});

test("source and destination integrity evidence contracts are complete", () => {
  const result = run(verifier);
  expect(result.source_integrity_contract_complete).toBe(true);
  expect(result.destination_integrity_contract_complete).toBe(true);
  expect(result.source_mutation_prevention_explicit).toBe(true);
  expect(doc()).toContain("No destination regular file may share a source inode");
});

test("Git deploy package and lockfile boundaries remain exact", () => {
  const result = run(verifier);
  expect(result.git_exclusion_explicit).toBe(true);
  expect(result.deploy_input_exclusion_explicit).toBe(true);
  expect(result.package_and_lockfile_hashes_exact).toBe(true);
  expect(doc()).toContain("`node_modules` must remain ignored and untracked");
});

test("candidate ordering requires complete pre-freeze and post-freeze validation", () => {
  const source = doc();
  expect(source).toContain("## Candidate Preparation Ordering");
  expect(source).toContain("Run complete pre-freeze validation");
  expect(source).toContain("Create a new immutable revision without `node_modules`");
  expect(source).toContain("Run complete post-freeze validation");
  expect(run(verifier).full_next_turbopack_build_mandatory).toBe(true);
});

test("gate performs no materialization candidate route deployment or external effect", () => {
  const result = run(verifier);
  expect(result.dependency_materialization_performed).toBe(false);
  expect(result.corrected_candidate_created).toBe(false);
  expect(result.installation_performed).toBe(false);
  expect(result.registry_contacted).toBe(false);
  expect(result.runtime_route_changed).toBe(false);
  expect(result.deployment_performed).toBe(false);
  expect(result.production_blocked).toBe(true);
  expect(result.main_push_blocked).toBe(true);
});

test("verifier is deterministic local read-only install-free and network-free", () => {
  const source = readFileSync(join(root, verifier), "utf8");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("npm install");
  expect(source).not.toContain("npm ci");
  expect(source).not.toContain("git commit");
  expect(source).not.toContain("netlify deploy");
  expect(run(verifier).verification_status).toBe("passed");
});

test("relevant upstream static gates remain healthy", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-366-corrected-immutable-preview-candidate-preparation-approval-gate-verify.mjs",
    "scripts/action-367-read-only-dependency-bridge-capability-verification-verify.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];
  const results = scripts.map(run);
  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(true);
});
