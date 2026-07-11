import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-358-runtime-ping-only-route-implementation-readiness-review.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-358-runtime-ping-only-route-implementation-readiness-review-verify.mjs",
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

test("Action 358 documentation captures recovery and upstream contracts", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("6a501645908e4100088b7396");
  expect(doc).toContain("512a0c5");
  expect(doc).toContain("Action 309: Post-Recovery Safe Development Protocol");
  expect(doc).toContain("Action 338: Runtime Ping-Only Rollout Checklist");
  expect(doc).toContain("Action 344: Runtime Ping-Only Route Implementation Plan");
  expect(doc).toContain("Action 350: Runtime Ping-Only Route Approval Gate");
  expect(doc).toContain("Action 357: Pattern Insight Static Fixture Implementation");
});

test("readiness decision permits only a separate implementation gate", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("readiness_vocabulary: ready | ready_with_conditions | blocked");
  expect(doc).toContain("readiness_decision: ready");
  expect(doc).toContain("Decision: `ready`");
  expect(doc).toContain("a separate implementation approval gate may be created");
  expect(doc).toContain("It does not approve route implementation");
  expect(doc).toContain("route_implementation_approved: false");
  expect(doc).toContain("runtime_route_changes_allowed: false");
});

test("future route boundary and response remain exact and deterministic", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("`/api/runtime-health/ping`");
  expect(doc).toContain("`app/api/runtime-health/ping/route.ts`");
  expect(doc).toContain("one `GET` handler only");
  expect(doc).toContain('"route_build_marker": "action_344_future_runtime_ping_only_route"');
  expect(doc).toContain('"runtime_route_scope": "ping_only"');
  expect(doc).toContain("Cache-Control: no-store, max-age=0");
  expect(doc).toContain("Content-Type: application/json; charset=utf-8");
  expect(doc).toContain("constructed entirely from literals");
});

test("dynamic response metadata and external dependencies remain forbidden", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const phrase of [
    "no current timestamp",
    "deployment ID",
    "commit SHA",
    "environment name",
    "hostname",
    "region",
    "process uptime",
    "provider status",
    "database status",
    "user/session data",
    "No `process.env`",
    "No Supabase client",
    "No market-data, Twelve Data, news, broker, or external HTTP client",
  ]) {
    expect(doc).toContain(phrase);
  }
});

test("failure containment prohibits shared runtime initialization", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no cascading imports");
  expect(doc).toContain("application service initialization");
  expect(doc).toContain("provider clients");
  expect(doc).toContain("Supabase clients");
  expect(doc).toContain("scanner modules");
  expect(doc).toContain("recommendation engine modules");
  expect(doc).toContain("Pattern Discovery modules");
  expect(doc).toContain("preferred implementation uses the global Web `Response` API and imports nothing");
});

test("Next generated type risk and validation order are explicit", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Stale generated route-type behavior observed around Action 356");
  expect(doc).toContain("`.next/types`");
  expect(doc).toContain("`next-env.d.ts`");
  expect(doc.indexOf("1. `npx next typegen`")).toBeGreaterThan(-1);
  expect(doc.indexOf("2. `npx tsc --noEmit`")).toBeGreaterThan(
    doc.indexOf("1. `npx next typegen`"),
  );
  expect(doc).toContain("`npx next typegen` must precede `npx tsc --noEmit`");
});

test("only the exact authorized Action 360 route may occupy the future boundary", () => {
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

test("deployment and main push remain blocked", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("deploy_approved: false");
  expect(doc).toContain("preview_deploy_approved: false");
  expect(doc).toContain("production_deploy_approved: false");
  expect(doc).toContain("main_push_allowed: false");
  expect(doc).toContain("Deployment Remains Blocked");
  expect(doc).toContain("non-production Netlify runtime remains untrusted");
});

test("Action 358 verifier succeeds without secrets or effects", () => {
  const output = runVerifier(
    "scripts/action-358-runtime-ping-only-route-implementation-readiness-review-verify.mjs",
  );
  const result = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(result.verification_status).toBe("passed");
  expect(result.readiness_decision).toBe("ready");
  expect(result.readiness_means_separate_implementation_gate_may_be_created).toBe(true);
  expect(result.route_implementation_approved).toBe(false);
  expect(result.route_implementation_absent).toBe(false);
  expect(result.authorized_action_360_route_present).toBe(true);
  expect(result.route_implementation_state_valid).toBe(true);
  expect(result.runtime_surfaces_unchanged).toBe(true);
  expect(result.deploy_approved).toBe(false);
  expect(result.main_push_allowed).toBe(false);
  expect(result.next_separate_approval_gate_required).toBe(true);
  expect(result.no_effect_flags.provider_call_executed).toBe(false);
  expect(result.no_effect_flags.news_api_call_executed).toBe(false);
  expect(result.no_effect_flags.supabase_read_executed).toBe(false);
  expect(result.no_effect_flags.supabase_write_executed).toBe(false);
  expect(result.no_effect_flags.persisted_data).toBe(false);
  expect(result.no_effect_flags.replay_executed).toBe(false);
  expect(result.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(result.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(result.no_effect_flags.live_ranking_changed).toBe(false);

  for (const secret of [
    "automation-secret-that-must-not-appear",
    "provider-secret-that-must-not-appear",
    "supabase-secret-that-must-not-appear",
    "news-secret-that-must-not-appear",
  ]) {
    expect(output).not.toContain(secret);
  }
});

test("Action 358 verifier is local read-only and runtime free", () => {
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

test("upstream runtime safety and package verifiers remain healthy", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs",
    "scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs",
    "scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];

  const results = scripts.map((script) => JSON.parse(runVerifier(script)));
  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(true);
});
