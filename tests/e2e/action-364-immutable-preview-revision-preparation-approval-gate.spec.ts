import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const docPath = join(root, "docs/action-364-immutable-preview-revision-preparation-approval-gate.md");
const routePath = join(root, "app/api/runtime-health/ping/route.ts");
const verifierPath = "scripts/action-364-immutable-preview-revision-preparation-approval-gate-verify.mjs";

function doc() {
  return readFileSync(docPath, "utf8");
}

function run(script: string) {
  return JSON.parse(execFileSync("node", [script], { cwd: root, encoding: "utf8" }));
}

test("documentation records the conditional approval contract", () => {
  const source = doc();
  expect(source).toContain("approval_vocabulary: approved | approved_with_conditions | blocked");
  expect(source).toContain("approval_decision: approved_with_conditions");
  expect(source).toContain("Decision: `approved_with_conditions`");
  expect(source).toContain("No immutable revision is created here");
});

test("Action 362 is preserved and Action 363 remains blocked", () => {
  const source = doc();
  expect(source).toContain("Action 362 remains `approved`");
  expect(source).toContain("Action 363 returned `blocked`");
  expect(source).toContain("current_deploy_eligibility: false");
  expect(source).toContain("preview_attempt_consumed: false");
});

test("route path file and hash remain frozen", () => {
  const source = readFileSync(routePath, "utf8");
  const hash = createHash("sha256").update(source).digest("hex");
  expect(hash).toBe("98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb");
  expect(doc()).toContain("GET /api/runtime-health/ping");
  expect(doc()).toContain("app/api/runtime-health/ping/route.ts");
});

test("mutable deployment and file exclusion shortcuts are rejected", () => {
  const source = doc();
  expect(source).toContain("Deploy directly from the current mutable worktree. Rejected");
  expect(source).toContain("Ignore, suppress, or exclude TypeScript-visible unrelated files");
  expect(source).toContain("Rejected: exclusion shortcuts weaken repository integrity");
  expect(source).toContain("passing build does not make this mutable worktree deployable");
});

test("all isolation options are compared and Option B is selected", () => {
  const source = doc();
  for (const option of ["Option A", "Option B", "Option C", "Option D", "Option E"]) {
    expect(source).toContain(option);
  }
  expect(source).toContain("Select Option B: prepare a clean isolated reviewed revision");
  expect(source).toContain("strongest integrity, reviewability, reversibility, and unrelated-work isolation");
});

test("ownership classification contract is exhaustive and fails unresolved input", () => {
  const source = doc();
  for (const classification of [
    "approved_preview_input", "approved_baseline_dependency", "unrelated_excluded", "unresolved_blocker",
  ]) expect(source).toContain(classification);
  expect(source).toContain("No deploy-input file may remain `unresolved_blocker`");
});

test("deployment input manifest covers revision files inventories and integrity", () => {
  const source = doc();
  for (const phrase of [
    "immutable revision identifier and parent/base revision", "every changed tracked file",
    "every included untracked file before freeze", "expected runtime route inventory",
    "expected migration inventory", "expected environment-file inventory",
    "expected provider/Supabase touch inventory", "manifest SHA-256",
  ]) expect(source).toContain(phrase);
});

test("immutable revision freeze and post-freeze validation are mandatory", () => {
  const source = doc();
  expect(source).toContain("## Immutable-Revision Definition");
  expect(source).toContain("## Revision-Freeze Point");
  expect(source).toContain("## Post-Freeze Mutation Prohibition");
  expect(source).toContain("Validation performed before freeze is not final deployment evidence");
  for (const command of ["npx next typegen", "npx tsc --noEmit", "npm run build", "npm run lint"]) {
    expect(source).toContain(command);
  }
});

test("future operation boundary is narrow conditional and deployment-free", () => {
  const source = doc();
  expect(source).toContain("exact repository operations, baseline identity, file-by-file manifest, recoverability evidence");
  expect(source).toContain("No operation is performed here");
  expect(source).toContain("Action 364 approves no deployment");
  expect(source).toContain("future preparation Action also stops after freeze and validation");
});

test("current worktree has one runtime route and no forbidden surface change", () => {
  const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  const appChanges = status.split("\n").filter((line) => line.slice(3).startsWith("app/"));
  const committedAppChanges = execFileSync(
    "git",
    ["diff", "--name-only", "51aced66782ec9a37cd358238f02b6f5c0ae97bd..HEAD", "--", "app"],
    { cwd: root, encoding: "utf8" },
  ).trim().split("\n").filter(Boolean);
  expect(
    appChanges.join("\n") === "?? app/api/runtime-health/ping/route.ts" ||
      (appChanges.length === 0 && committedAppChanges.join("\n") === "app/api/runtime-health/ping/route.ts"),
  ).toBe(true);
  expect(status).not.toMatch(/^(..|\?\?) proxy\.ts$/m);
  expect(status).not.toMatch(/^(..|\?\?) middleware\.(ts|js)$/m);
  expect(status).not.toMatch(/^(..|\?\?) netlify\.toml$/m);
});

test("production main and preview deployment remain blocked", () => {
  const source = doc();
  expect(source).toContain("production_deployment_approved: false");
  expect(source).toContain("main_push_allowed: false");
  expect(source).toContain("Deployment Prohibition");
  expect(source).toContain("preview_attempt_consumed: false");
});

test("verifier passes locally with no repository operation or external behavior", () => {
  const result = run(verifierPath);
  expect(result.verification_status).toBe("passed");
  expect(result.approval_decision).toBe("approved_with_conditions");
  expect(result.selected_future_preparation_strategy).toBe("B_clean_isolated_reviewed_revision");
  expect(result.repository_operation_performed).toBe(false);
  expect(result.immutable_revision_created).toBe(false);
  expect(result.deployment_performed).toBe(false);
  expect(result.external_endpoint_contacted).toBe(false);
  expect(result.route_hash_matches).toBe(true);
  expect(result.no_second_runtime_route).toBe(true);
  expect(result.production_deployment_approved).toBe(false);
  expect(result.main_push_allowed).toBe(false);

  const source = readFileSync(join(root, verifierPath), "utf8");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("netlify deploy");
  expect(source).not.toContain(["process", ".env"].join(""));
});

test("relevant upstream safety gates remain healthy", () => {
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
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];
  const results = scripts.map(run);
  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(true);
});
