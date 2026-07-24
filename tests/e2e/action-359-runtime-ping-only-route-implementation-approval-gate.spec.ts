import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-359-runtime-ping-only-route-implementation-approval-gate.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-359-runtime-ping-only-route-implementation-approval-gate-verify.mjs",
);
const routePath = join(process.cwd(), "app/api/runtime-health/ping/route.ts");

function runVerifier(script: string) {
  return execFileSync("node", [script], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "provider-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      NEWS_API_KEY: "news-secret-that-must-not-appear",
    },
  });
}

test("Action 359 gate records recovery upstream and Action 358 readiness", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("6a501645908e4100088b7396");
  expect(doc).toContain("512a0c5");
  expect(doc).toContain("Action 309: Post-Recovery Safe Development Protocol");
  expect(doc).toContain("Action 338: Runtime Ping-Only Rollout Checklist");
  expect(doc).toContain("Action 344: Runtime Ping-Only Route Implementation Plan");
  expect(doc).toContain("Action 350: Runtime Ping-Only Route Approval Gate");
  expect(doc).toContain("Action 358: Runtime Ping-Only Route Implementation Readiness Review");
  expect(doc).toContain("readiness decision: `ready`");
  expect(doc).toContain("failed readiness conditions: none");
});

test("approval decision is exact and remains implementation-gate only", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("approval_vocabulary: approved | approved_with_conditions | blocked");
  expect(doc).toContain("approval_decision: approved");
  expect(doc).toContain("Decision: `approved`");
  expect(doc).toContain("a later Action may add the single approved route file");
  expect(doc).toContain("Route implementation has not occurred in Action 359");
  expect(doc).toContain("Failed gate conditions: none");
});

test("exact future route is one file with one GET handler", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("URL path: `/api/runtime-health/ping`");
  expect(doc).toContain("`app/api/runtime-health/ping/route.ts`");
  expect(doc).toContain("exactly one runtime file");
  expect(doc).toContain("exactly one handler named `GET`");
  expect(doc).toContain("No helper module is approved");
  expect(doc).toContain("No alias, alternate path, versioned path, health path, readiness path, or second route is approved");
});

test("JSON status and headers are frozen", () => {
  const doc = readFileSync(docPath, "utf8");
  const fields = [
    '"ok": true',
    '"route_ping": true',
    '"route_build_marker": "action_344_future_runtime_ping_only_route"',
    '"provider_call_executed": false',
    '"provider_call_attempted": false',
    '"supabase_read_executed": false',
    '"supabase_write_executed": false',
    '"replay_executed": false',
    '"synthetic_outcomes_persisted": false',
    '"scanner_behavior_changed": false',
    '"live_ranking_changed": false',
    '"recommendation_rows_mutated": false',
    '"runtime_route_scope": "ping_only"',
    '"deploy_readiness_required": true',
  ];

  for (const field of fields) expect(doc).toContain(field);
  expect(doc).toContain("HTTP 200 only");
  expect(doc).toContain("Content-Type: application/json; charset=utf-8");
  expect(doc).toContain("Cache-Control: no-store, max-age=0");
  expect(doc).toContain("No additional application-defined header is approved");
  expect(doc).toContain("key ordering are frozen");
});

test("request dynamic metadata and wall clock behavior are forbidden", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("must not accept, inspect, or derive behavior from a request object");
  expect(doc).toContain("No current timestamp, current time");
  expect(doc).toContain("deployment ID, commit SHA, branch, environment name, hostname, region");
  expect(doc).toContain("runtime version discovered dynamically");
  expect(doc).toContain("user/session information, request metadata, secrets, or random identifiers");
});

test("external persistence and shared initialization dependencies are forbidden", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("No `process.env`");
  expect(doc).toContain("No automation secret, cookie, session, authorization header");
  expect(doc).toContain("No Twelve Data, market-data, broker, news, external HTTP client, fetch");
  expect(doc).toContain("No Supabase client, database client");
  expect(doc).toContain("No candle, fetch-run, response, outcome, synthetic outcome");
  expect(doc).toContain("no cascading imports or dependency initialization");
  expect(doc).toContain("No read or write outside literal module initialization is approved");
});

test("import allowlist is empty and denylist covers broad runtime packages", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("The import allowlist is empty");
  expect(doc).toContain("must not import `next/server`");
  expect(doc).toContain("Supabase and database modules");
  expect(doc).toContain("scanner, recommendation, ranking, confidence, and risk modules");
  expect(doc).toContain("learning, Learning Acceleration, Pattern Discovery, Pattern Insight, and analytics modules");
  expect(doc).toContain("shared project helpers of any kind");
});

test("unsupported methods remain framework handled without extra handlers", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Only `GET` is exported");
  expect(doc).toContain("automatically supplies `OPTIONS`");
  expect(doc).toContain("`POST` does not invoke `GET` or application code");
  expect(doc).toContain("No custom unsupported-method, `HEAD`, or `OPTIONS` handler is approved");
});

test("typegen local testing build and rollback contracts are fixed", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc.indexOf("1. `npx next typegen`")).toBeGreaterThan(-1);
  expect(doc.indexOf("2. `npx tsc --noEmit`")).toBeGreaterThan(
    doc.indexOf("1. `npx next typegen`"),
  );
  expect(doc).toContain("`npx next typegen` must precede `npx tsc --noEmit`");
  expect(doc).toContain("test may use only localhost");
  expect(doc).toContain("repeated requests return byte-equivalent bodies");
  expect(doc).toContain("Source rollback is trivial: remove the single route file");
  expect(doc).toContain("build route table must show exactly `/api/runtime-health/ping` as the only new runtime route");
});

test("only the exact authorized Action 360 route may occupy the approved boundary", () => {
  const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  expect(existsSync(routePath)).toBe(true);
  const appChanges = status.match(/^(..|\?\?) app\/api\/.+$/gm) ?? [];
  const committedAppChanges = execFileSync(
    "git",
    ["diff", "--name-only", "51aced66782ec9a37cd358238f02b6f5c0ae97bd..HEAD", "--", "app"],
    { cwd: process.cwd(), encoding: "utf8" },
  ).trim().split("\n").filter(Boolean);
  expect(
    appChanges.join("\n") === "?? app/api/runtime-health/ping/route.ts" ||
      (appChanges.length === 0 && committedAppChanges.join("\n") === "app/api/runtime-health/ping/route.ts"),
  ).toBe(true);
  expect(status).not.toMatch(/^(..|\?\?) proxy\.ts$/m);
  expect(status).not.toMatch(/^(..|\?\?) middleware\.(ts|js)$/m);
  expect(status).not.toMatch(/^(..|\?\?) netlify\.toml$/m);
  expect(status).not.toMatch(/^(..|\?\?) supabase\/migrations\//m);
});

test("deployment Netlify trust and main push remain blocked", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("deployment_approved: false");
  expect(doc).toContain("preview_deployment_approved: false");
  expect(doc).toContain("production_rollout_approved: false");
  expect(doc).toContain("main_push_allowed: false");
  expect(doc).toContain("Netlify_runtime_trusted: false");
  expect(doc).toContain("Implementation approval is not deployment approval");
  expect(doc).toContain("Implementation approval is not main-push approval");
});

test("Action 359 verifier passes without secrets or runtime effects", () => {
  const output = runVerifier(
    "scripts/action-359-runtime-ping-only-route-implementation-approval-gate-verify.mjs",
  );
  const result = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(result.verification_status).toBe("passed");
  expect(result.approval_decision).toBe("approved");
  expect(result.approval_allows_later_single_route_implementation_action).toBe(true);
  expect(result.route_implemented).toBe(false);
  expect(result.route_implementation_absent).toBe(false);
  expect(result.authorized_action_360_route_present).toBe(true);
  expect(result.route_implementation_state_valid).toBe(true);
  expect(result.runtime_surfaces_unchanged).toBe(true);
  expect(result.failed_gate_conditions).toEqual([]);
  expect(result.exact_approved_future_route).toBe("/api/runtime-health/ping");
  expect(result.exact_approved_future_file).toBe("app/api/runtime-health/ping/route.ts");
  expect(result.approved_runtime_file_count).toBe(1);
  expect(result.approved_handler).toBe("GET");
  expect(result.deployment_approved).toBe(false);
  expect(result.main_push_allowed).toBe(false);

  for (const secret of [
    "automation-secret-that-must-not-appear",
    "provider-secret-that-must-not-appear",
    "supabase-secret-that-must-not-appear",
    "news-secret-that-must-not-appear",
  ]) {
    expect(output).not.toContain(secret);
  }
});

test("Action 359 verifier is deterministic local read-only and runtime free", () => {
  const source = readFileSync(verifierPath, "utf8");

  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("@supabase");
  expect(source).not.toContain("supabase-js");
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("appendFile");
  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("new Date");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain(["process", ".env"].join(""));
});

test("upstream safety readiness golden and package verifiers remain healthy", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs",
    "scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs",
    "scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs",
    "scripts/action-358-runtime-ping-only-route-implementation-readiness-review-verify.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];

  const results = scripts.map((script) => JSON.parse(runVerifier(script)));
  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(true);
});
