import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const verifier = "scripts/action-365-option-b-immutable-preview-revision-preparation-verify.mjs";
const manifestPath = join(root, "docs/action-365-preview-deployment-input-manifest.json");

function run(script: string) {
  return JSON.parse(execFileSync("node", [script], { cwd: root, encoding: "utf8" }));
}

function manifest() {
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

test("preparation document freezes baseline isolation protection allowlist and abandonment", () => {
  const doc = readFileSync(join(root, "docs/action-365-option-b-immutable-preview-revision-preparation.md"), "utf8");
  for (const phrase of [
    "selected_baseline_sha: 51aced66782ec9a37cd358238f02b6f5c0ae97bd",
    "isolation_mechanism: local_no_hardlink_clone", "## Original-Worktree Protection",
    "## Exact Changed-File Allowlist", "## Exact File Denylist",
    "## Rollback and Abandonment Procedure", "## Stop Conditions",
  ]) expect(doc).toContain(phrase);
});

test("manifest binds selected baseline route and non-self-referential revision evidence", () => {
  const value = manifest();
  expect(value.manifest_schema_version).toBe("1.0.0");
  expect(value.selected_baseline_sha).toBe("51aced66782ec9a37cd358238f02b6f5c0ae97bd");
  expect(value.parent_revision_sha).toBe(value.selected_baseline_sha);
  expect(value.immutable_revision_sha).toBeNull();
  expect(value.immutable_revision_binding.mode).toBe("external_head_and_manifest_hash");
  expect(value.route.sha256).toBe("98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb");
});

test("complete tree classification has no included unresolved blocker", () => {
  const value = manifest();
  const tree = execFileSync("git", ["ls-tree", "-r", "--name-only", "HEAD"], { cwd: root, encoding: "utf8" })
    .trim().split("\n").filter(Boolean).sort();
  expect(value.included_files.map((entry: { path: string }) => entry.path).sort()).toEqual(tree);
  expect(value.included_files.every((entry: { classification: string }) =>
    ["approved_preview_input", "approved_baseline_dependency"].includes(entry.classification),
  )).toBe(true);
  expect(value.included_files.some((entry: { classification: string }) => entry.classification === "unresolved_blocker")).toBe(false);
});

test("excluded concurrent inventory is not included", () => {
  const value = manifest();
  expect(value.excluded_concurrent_files.length).toBeGreaterThan(0);
  expect(value.excluded_concurrent_files.every((entry: { classification: string; included: boolean }) =>
    entry.classification === "unrelated_excluded" && entry.included === false,
  )).toBe(true);
  const diff = execFileSync("git", ["diff", "--name-only", `${value.selected_baseline_sha}..HEAD`], { cwd: root, encoding: "utf8" });
  expect(diff).not.toMatch(/(?:^|\n)(?:docs|lib|tests\/e2e)\/post-trade-/);
});

test("runtime route inventory introduces only the frozen ping route", () => {
  const value = manifest();
  expect(value.inventories.runtime_routes.introduced).toEqual(["app/api/runtime-health/ping/route.ts"]);
  const route = readFileSync(join(root, "app/api/runtime-health/ping/route.ts"));
  expect(createHash("sha256").update(route).digest("hex")).toBe(value.route.sha256);
});

test("migration schema config environment provider and Supabase inventories are empty", () => {
  const inventories = manifest().inventories;
  expect(inventories.migrations.changed).toEqual([]);
  expect(inventories.schema_changes).toEqual([]);
  expect(inventories.proxy_middleware_netlify_changes).toEqual([]);
  expect(inventories.environment_files_included).toEqual([]);
  expect(inventories.provider_supabase_access_introduced).toEqual([]);
});

test("immutable revision exists has baseline parent and post-freeze clean state", () => {
  const result = run(verifier);
  expect(result.verification_status).toBe("passed");
  expect(result.preparation_decision).toBe("prepared");
  expect(result.immutable_revision_sha).not.toBe(result.selected_baseline_sha);
  expect(result.parent_revision_sha).toBe(result.selected_baseline_sha);
  expect(result.post_freeze_worktree_clean).toBe(true);
  expect(result.manifest_matches_revision_diff).toBe(true);
  expect(result.manifest_covers_complete_tree).toBe(true);
});

test("manifest hash and revision binding are reproducible", () => {
  const result = run(verifier);
  const bytes = readFileSync(manifestPath);
  expect(result.manifest_sha256).toBe(createHash("sha256").update(bytes).digest("hex"));
  expect(result.immutable_revision_binding).toEqual({
    revision_sha: result.immutable_revision_sha,
    manifest_sha256: result.manifest_sha256,
  });
});

test("preview attempt remains unconsumed with deployment production and main blocked", () => {
  const result = run(verifier);
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(result.deployment_performed).toBe(false);
  expect(result.production_blocked).toBe(true);
  expect(result.main_push_blocked).toBe(true);
  expect(result.external_endpoint_contacted).toBe(false);
});

test("verifier is local read-only and network-free", () => {
  const source = readFileSync(join(root, verifier), "utf8");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("netlify deploy");
  expect(source).not.toContain(["process", ".env"].join(""));
  expect(source).not.toContain("git commit");
});

test("required upstream gates pass against the frozen revision", () => {
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
