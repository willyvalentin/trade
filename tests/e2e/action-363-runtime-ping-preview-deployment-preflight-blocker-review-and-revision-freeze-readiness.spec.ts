import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const docPath = join(root, "docs/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness.md");
const routePath = join(root, "app/api/runtime-health/ping/route.ts");
const verifierPath = "scripts/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness-verify.mjs";

function doc() {
  return readFileSync(docPath, "utf8");
}

function run(script: string) {
  return JSON.parse(execFileSync("node", [script], { cwd: root, encoding: "utf8" }));
}

test("documentation records the deterministic blocked preflight contract", () => {
  const source = doc();
  expect(source).toContain("readiness_vocabulary: ready | ready_with_conditions | blocked");
  expect(source).toContain("readiness_decision: blocked");
  expect(source).toContain("current_deploy_eligibility: false");
  expect(source).toContain("Decision: `blocked`");
});

test("exact blocker is unrelated but revision blocking", () => {
  const source = doc();
  expect(source).toContain("lib/post-trade-staging-execution-authorization-artifact-core.ts:697");
  expect(source).toContain("blocker_classification: unrelated_but_revision_blocking");
  expect(source).toContain("“Unrelated” does not mean non-blocking or safe to ignore");
  expect(source).toContain("Action 363 did not edit or repair it");
});

test("historical failures and current rerun are both reported truthfully", () => {
  const source = doc();
  expect(source).toContain("Original Action 362 close-out evidence");
  expect(source).toContain("`npx tsc --noEmit`: failed");
  expect(source).toContain("TypeScript validation failed");
  expect(source).toContain("Action 363 current rerun evidence");
  expect(source).toContain("`npx tsc --noEmit`: passed");
  expect(source).toContain("`npm run build`: passed completely");
  expect(source).toContain("original failures are not rewritten as passes or waived");
});

test("Action 362 approval and preview attempt remain intact", () => {
  const source = doc();
  expect(source).toContain("Action 362 remains `approved` in principle");
  expect(source).toContain("action_362_approval_preserved: true");
  expect(source).toContain("preview_attempt_consumed: false");
  expect(source).toContain("approved attempt has not been consumed");
});

test("route integrity and single runtime file boundary remain exact", () => {
  const route = readFileSync(routePath, "utf8");
  const hash = createHash("sha256").update(route).digest("hex");
  const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  const appChanges = status.split("\n").filter((line) => line.slice(3).startsWith("app/"));
  expect(hash).toBe("98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb");
  const committedAppChanges = execFileSync(
    "git",
    ["diff", "--name-only", "51aced66782ec9a37cd358238f02b6f5c0ae97bd..HEAD", "--", "app"],
    { cwd: root, encoding: "utf8" },
  ).trim().split("\n").filter(Boolean);
  expect(
    appChanges.join("\n") === "?? app/api/runtime-health/ping/route.ts" ||
      (appChanges.length === 0 && committedAppChanges.join("\n") === "app/api/runtime-health/ping/route.ts"),
  ).toBe(true);
});

test("full-green immutable revision and manifest are mandatory", () => {
  const source = doc();
  for (const phrase of [
    "full typecheck", "full build", "one immutable repository revision",
    "full relevant source manifest", "Current worktree cleanliness: false",
    "deploy inputs are immutable", "exact SHA-256",
  ]) expect(source).toContain(phrase);
  expect(source).toContain("no mutable-worktree deployment is eligible");
});

test("concurrent and untracked work remains a deploy blocker", () => {
  const source = doc();
  expect(source).toContain("## Untracked-File Assessment");
  expect(source).toContain("## Concurrent-Work Risk");
  expect(source).toContain("worktree is concurrently mutable");
  expect(source).toContain("cannot freeze a later, different source tree");
});

test("no suppression tsconfig weakening or unrelated repair is authorized", () => {
  const source = doc();
  expect(source).toContain("may not be ignored, excluded, suppressed, downgraded, or waived");
  expect(source).toContain("No error suppression or same-action remediation is authorized");
  expect(source).toContain("does not absorb it into the ping package");
  expect(source).not.toContain("skipLibCheck");
  expect(source).not.toContain("ts-ignore");
});

test("stop and remediation boundaries are separate and non-operational", () => {
  const source = doc();
  expect(source).toContain("## Stop Conditions");
  expect(source).toContain("clean isolated reviewed revision containing only approved packages");
  expect(source).toContain("separately approved repository-isolation or post-trade-remediation action");
  expect(source).toContain("Action 363 performs no completion, correction, removal, commit, branch operation, or remediation");
});

test("verifier passes while readiness remains blocked and deploy-free", () => {
  const result = run(verifierPath);
  expect(result.verification_status).toBe("passed");
  expect(result.readiness_decision).toBe("blocked");
  expect(result.blocker_classification).toBe("unrelated_but_revision_blocking");
  expect(result.current_deploy_eligibility).toBe(false);
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(result.route_source_remains_exact).toBe(true);
  expect(result.no_second_runtime_route).toBe(true);
  expect(result.preview_deployment_performed).toBe(false);
  expect(result.external_endpoint_contacted).toBe(false);
  expect(result.no_error_suppression_authorized).toBe(true);
});

test("verifier is local-only and does not deploy or inspect environment", () => {
  const source = readFileSync(join(root, verifierPath), "utf8");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("netlify deploy");
  expect(source).not.toContain(["process", ".env"].join(""));
  expect(source).not.toContain("tsconfig.json");
});

test("upstream runtime and package safety gates remain healthy", () => {
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
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];
  const results = scripts.map(run);
  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(true);
});
