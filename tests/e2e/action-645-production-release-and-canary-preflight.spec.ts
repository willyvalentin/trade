import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const scriptPath = resolve(root, "scripts/action-645-production-release-and-canary-preflight.mjs");
let preflight: typeof import("../../scripts/action-645-production-release-and-canary-preflight.mjs");

test.beforeAll(async () => {
  preflight = await import(pathToFileURL(scriptPath).href);
});

const commit = "c7fc1f06019f1afff58c9f146a1f0576ef6447dc";
const zero = { attempts: 0, estimated_credits: 0 };

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    expected_commit: commit,
    now: new Date("2026-07-24T14:00:01.000Z"),
    availability: { git: true, netlify: true, supabase: true, usage: true, builder: true },
    git: {
      branch: "main",
      local_head: commit,
      origin_main_head: commit,
      github_default_head: commit,
      local_relation_to_origin: "equal",
      working_tree: "?? deno.lock",
    },
    netlify_deploy: {
      state: "ready",
      context: "production",
      branch: "main",
      plugin_state: "success",
      error_message: null,
      commit_ref: commit,
      deployment_timestamp: "2026-07-24T10:49:43.521Z",
      secrets_scan_matches: 0,
      enhanced_secrets_scan_matches: 0,
    },
    deployment_assertion: commit,
    supabase: { lint_ok: true, required_migration_applied: true, forbidden_migrations_present: false },
    usage: {
      status: "available",
      scheduled: zero,
      manual: zero,
      reconciliation: zero,
      total_ledger: zero,
      claim_capacity: zero,
      provider_calls_executed: 0,
      durable_writes_executed: 0,
      schedule_changes: 0,
    },
    builder: { exists: true, path: "scripts/action-643-scheduled-dry-run-request-builder.mjs", deployment_commit: commit, window_matches: true },
    ...overrides,
  };
}

test("Action 645 reports ready only when all identities, production checks, timing, usage, and builder agree", () => {
  const report = preflight.evaluateAction645Preflight(validInput());
  expect(report.status).toBe("preflight_ready");
  expect(report.blockers).toEqual([]);
  expect(report.warnings).toContain("deno_lock_untracked_preserved");
  expect(report.effects).toEqual({
    production_mutations_attempted: false,
    production_dry_run_requests_sent: 0,
    provider_calls_triggered_by_preflight: 0,
    claims_created_by_preflight: 0,
    durable_writes_by_preflight: 0,
    schedule_changes_by_preflight: 0,
  });
});

test("Action 645 returns deterministic fail-closed statuses for stale assertion, builder, local branch, and window", () => {
  expect(preflight.evaluateAction645Preflight(validInput({ deployment_assertion: "a".repeat(40) })).status).toBe("assertion_mismatch");
  expect(preflight.evaluateAction645Preflight(validInput({ builder: { exists: true, deployment_commit: "a".repeat(40), window_matches: true } })).status).toBe("builder_stale");
  expect(preflight.evaluateAction645Preflight(validInput({ git: { ...validInput().git, local_head: "b".repeat(40), local_relation_to_origin: "behind" } })).status).toBe("git_identity_mismatch");
  expect(preflight.evaluateAction645Preflight(validInput({ now: new Date("2026-07-24T13:59:59.000Z") })).status).toBe("window_not_completed");
});

test("Action 645 blocks forbidden migration, unhealthy production deploy, secret scan matches, nonzero usage, and unavailable checks", () => {
  expect(preflight.evaluateAction645Preflight(validInput({ supabase: { lint_ok: true, required_migration_applied: true, forbidden_migrations_present: true } })).status).toBe("forbidden_migration_detected");
  expect(preflight.evaluateAction645Preflight(validInput({ netlify_deploy: { ...validInput().netlify_deploy, state: "error" } })).status).toBe("deployment_identity_mismatch");
  expect(preflight.evaluateAction645Preflight(validInput({ netlify_deploy: { ...validInput().netlify_deploy, secrets_scan_matches: 1 } })).status).toBe("deployment_identity_mismatch");
  expect(preflight.evaluateAction645Preflight(validInput({ usage: { ...validInput().usage, total_ledger: { attempts: 1, estimated_credits: 1 } } })).status).toBe("usage_not_clean");
  expect(preflight.evaluateAction645Preflight(validInput({ availability: { git: true, netlify: false, supabase: true, usage: true, builder: true } })).status).toBe("preflight_unavailable");
});

test("Action 645 script is read-only and its report cannot contain credentials", () => {
  const source = readFileSync(scriptPath, "utf8");
  expect(source).toContain("buildAction643ScheduledDryRunRequest");
  expect(source).not.toContain("/tmp/ture-action-643-build-request.cjs");
  for (const forbidden of ["env:set", "createSiteBuild", "db push", "--include-all", "ci_hur_issue", "ci_hur_reconcile", "scheduled-dry-run/route", "writeFile", "rm ", "git reset", "git merge"]) {
    expect(source).not.toContain(forbidden);
  }
  const report = preflight.evaluateAction645Preflight(validInput());
  expect(JSON.stringify(report)).not.toMatch(/automation_secret|raw_token|token_hash|password|api[_-]?key|database_url/i);
});
