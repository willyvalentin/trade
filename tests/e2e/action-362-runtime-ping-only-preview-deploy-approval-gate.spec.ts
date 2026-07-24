import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const docPath = join(root, "docs/action-362-runtime-ping-only-preview-deploy-approval-gate.md");
const routePath = join(root, "app/api/runtime-health/ping/route.ts");
const verifierPath = "scripts/action-362-runtime-ping-only-preview-deploy-approval-gate-verify.mjs";

function readDoc() {
  return readFileSync(docPath, "utf8");
}

function run(script: string) {
  return JSON.parse(execFileSync("node", [script], { cwd: root, encoding: "utf8" }));
}

test("approval gate is static approved and deploy-free", () => {
  const doc = readDoc();
  expect(doc).toContain("approval_vocabulary: approved | approved_with_conditions | blocked");
  expect(doc).toContain("approval_decision: approved");
  expect(doc).toContain("Decision: `approved`");
  expect(doc).toContain("preview_deployment_performed: false");
  expect(doc).toContain("external_endpoint_contacted: false");
});

test("preview boundary is one attempt one revision and unchanged code", () => {
  const doc = readDoc();
  expect(doc).toContain("At most one non-production Netlify preview deployment attempt");
  expect(doc).toContain("One repository revision, one source hash, one unchanged route");
  expect(doc).toContain("introduces no code changes");
  expect(doc).toContain("without code, config, or environment changes");
  expect(doc).toContain("No production deploy");
  expect(doc).toContain("No main push");
});

test("future validation freezes route body headers and repeats", () => {
  const doc = readDoc();
  expect(doc).toContain("GET /api/runtime-health/ping");
  expect(doc).toContain("HTTP 200");
  expect(doc).toContain("Content-Type: application/json; charset=utf-8");
  expect(doc).toContain("Cache-Control: no-store, max-age=0");
  expect(doc).toContain('"route_build_marker": "action_344_future_runtime_ping_only_route"');
  expect(doc).toContain('"deploy_readiness_required": true');
  expect(doc).toContain("no additional keys");
  expect(doc).toContain("byte-identical");
});

test("proxy auth redirects HTTP 400 empty HTML and runtime failures are observable stop cases", () => {
  const doc = readDoc();
  for (const phrase of [
    "authentication redirect", "proxy redirect", "Automatic redirect following must be disabled",
    "HTTP 400 empty-body regression", "zero-length or unexpectedly blank GET body",
    "Unexpected HTML", "function/runtime initialization failure", "No remediation occurs in the same Action",
  ]) expect(doc).toContain(phrase);
});

test("unsupported methods remain bounded to the same route", () => {
  const doc = readDoc();
  expect(doc).toContain("POST and PUT may be sent only to the same ping path");
  expect(doc).toContain("framework-managed HTTP 405");
  expect(doc).toContain("without the frozen GET body");
});

test("stop conditions reject any broadened or unsafe attempt", () => {
  const doc = readDoc();
  expect(doc).toContain("## Stop Conditions");
  expect(doc).toContain("deployment requires code, config, environment, proxy, middleware");
  expect(doc).toContain("target is production, ambiguous, promoted, aliased to production");
  expect(doc).toContain("GET is non-200, HTTP 400, empty, unexpectedly HTML");
  expect(doc).toContain("provider/Supabase/shared application code initializes");
  expect(doc).toContain("No remediation occurs in the same Action");
});

test("evidence contract is complete and excludes secrets", () => {
  const doc = readDoc();
  for (const phrase of [
    "repository revision identifier", "exact deployed route source hash",
    "preview deployment identifier", "preview URL", "non-production target classification",
    "deployment timestamp", "GET status", "response headers", "exact response body",
    "POST and PUT results", "redirect chain", "stop-condition result",
    "final preview validation decision",
  ]) expect(doc).toContain(phrase);
  expect(doc).toContain("Secrets, credentials, arbitrary environment values, user data, and production data must not be captured");
});

test("Action 362 made no route runtime proxy middleware Netlify or migration change", () => {
  const source = readFileSync(routePath, "utf8");
  const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: root, encoding: "utf8",
  });
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
  expect(source).toContain("action_344_future_runtime_ping_only_route");
  expect(status).not.toMatch(/^(..|\?\?) proxy\.ts$/m);
  expect(status).not.toMatch(/^(..|\?\?) middleware\.(ts|js)$/m);
  expect(status).not.toMatch(/^(..|\?\?) netlify\.toml$/m);
  expect(status).not.toMatch(/^(..|\?\?) supabase\/migrations\//m);
});

test("Netlify production and main trust remain blocked", () => {
  const doc = readDoc();
  expect(doc).toContain("Netlify_runtime_trusted: false");
  expect(doc).toContain("production_deployment_approved: false");
  expect(doc).toContain("main_push_allowed: false");
  expect(doc).toContain("Action 362 records no preview URL");
});

test("verifier passes locally without network or deployment behavior", () => {
  const result = run(verifierPath);
  expect(result.verification_status).toBe("passed");
  expect(result.approval_decision).toBe("approved");
  expect(result.one_preview_deployment_attempt_approved_for_later_action).toBe(true);
  expect(result.preview_deployment_performed).toBe(false);
  expect(result.external_endpoint_contacted).toBe(false);
  expect(result.route_source_remains_exact).toBe(true);
  expect(result.no_second_runtime_route).toBe(true);
  expect(result.Netlify_runtime_trusted).toBe(false);
  expect(result.production_deployment_approved).toBe(false);
  expect(result.main_push_allowed).toBe(false);
  expect(result.failed_conditions).toEqual([]);

  const source = readFileSync(join(root, verifierPath), "utf8");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("netlify deploy");
  expect(source).not.toContain(["process", ".env"].join(""));
});

test("upstream safety readiness implementation and package verifiers remain healthy", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs",
    "scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs",
    "scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs",
    "scripts/action-358-runtime-ping-only-route-implementation-readiness-review-verify.mjs",
    "scripts/action-359-runtime-ping-only-route-implementation-approval-gate-verify.mjs",
    "scripts/action-360-runtime-ping-only-route-implementation-verify.mjs",
    "scripts/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review-verify.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];
  const results = scripts.map(run);
  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(true);
});
