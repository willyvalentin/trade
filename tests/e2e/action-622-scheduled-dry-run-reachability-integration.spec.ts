import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest } from "../../lib/continuous-intelligence-shadow-canary-scheduled-admission";
import { buildContinuousIntelligenceShadowCanaryScheduledDryRunRequest } from "../../lib/continuous-intelligence-shadow-canary-scheduled-dry-run";
import { createContinuousIntelligenceShadowCanaryScheduledDryRunHandler } from "../../lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-handler";

const root = resolve(__dirname, "../..");
const routePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-dry-run/route.ts";
const handlerPath = "lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-handler.ts";

function read(path: string) { return readFileSync(resolve(root, path), "utf8"); }

function request() {
  const scheduled = buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest({
    deployment_commit: "7eb1f42440d7555041f68697a2d05157f3a640f5",
    market_date: "2026-07-23",
    market_window: { start: "2026-07-23T14:30:00.000Z", end: "2026-07-23T15:00:00.000Z" },
    requested_at: "2026-07-23T15:01:00.000Z",
  });
  if (!scheduled) throw new Error("Expected scheduled request.");
  const dryRun = buildContinuousIntelligenceShadowCanaryScheduledDryRunRequest(scheduled);
  if (!dryRun) throw new Error("Expected dry-run request.");
  return dryRun;
}

const readyDependencies = {
  deployment: "exact" as const, scheduled_execution_enabled: true, canary: "ready" as const, kill_switch: "ready" as const,
  schedule: "ready" as const, calendar_window: "ready" as const, provider_planner: "ready" as const, audit_ledger: "ready" as const,
  historical_usage: "ready" as const, budget: "scheduled_budget_ready" as const, persistence: "clean" as const,
  active_claim: "clear" as const, retry: "eligible" as const, correlation: "consistent" as const,
};

test("Action 622 authenticates before reading dependencies and emits only sanitized evidence", async () => {
  let reads = 0;
  const handler = createContinuousIntelligenceShadowCanaryScheduledDryRunHandler({ expected_secret: () => "expected", dependencies: async () => { reads += 1; return readyDependencies; } });
  const missing = await handler(new Request("http://local", { method: "POST", body: JSON.stringify(request()) }));
  expect(missing.status).toBe(401);
  expect(reads).toBe(0);
  expect((await missing.json()).result).toBe("scheduled_dry_run_unauthorized");
  const valid = await handler(new Request("http://local", { method: "POST", headers: { "x-automation-secret": "expected" }, body: JSON.stringify(request()) }));
  const body = await valid.json();
  expect(valid.status).toBe(200);
  expect(reads).toBe(1);
  expect(body.result).toBe("scheduled_dry_run_ready_before_execution");
  expect(body.evidence).toMatchObject({ execution_barrier: "dry_run_only", provider_calls: 0, claims_created: 0, audit_writes: 0, ledger_writes: 0, usage_mutations: 0 });
  expect(JSON.stringify(body)).not.toMatch(/expected|secret|authorization|service.role|api.key/i);
});

test("Action 622 rejects malformed, manual, and client-derived trusted input before dependency reads", async () => {
  let reads = 0;
  const handler = createContinuousIntelligenceShadowCanaryScheduledDryRunHandler({ expected_secret: () => "expected", dependencies: async () => { reads += 1; return readyDependencies; } });
  for (const malformed of [
    { ...request(), execution_mode: "live" },
    { ...request(), source: "manual" },
    { ...request(), occurrence_id: "not-canonical" },
    { ...request(), trusted_readiness: "ready" },
  ]) {
    const response = await handler(new Request("http://local", { method: "POST", headers: { "x-automation-secret": "expected" }, body: JSON.stringify(malformed) }));
    expect(response.status).toBe(400);
    expect((await response.json()).result).toBe("scheduled_dry_run_invalid_request");
  }
  expect(reads).toBe(0);
});

test("Action 622 has deterministic blocker precedence and unknown dependencies fail closed", async () => {
  const handler = createContinuousIntelligenceShadowCanaryScheduledDryRunHandler({ expected_secret: () => "expected", dependencies: async () => ({ ...readyDependencies, deployment: "mismatch" as const, scheduled_execution_enabled: false, canary: "blocked" as const }) });
  const response = await handler(new Request("http://local", { method: "POST", headers: { "x-automation-secret": "expected" }, body: JSON.stringify(request()) }));
  const body = await response.json();
  expect(body.result).toBe("scheduled_dry_run_deployment_mismatch");
  expect(body.evidence.first_blocker).toBe("deployment_identity_mismatch");
  expect(body.evidence.blockers).toEqual(expect.arrayContaining(["scheduled_execution_feature_disabled", "canary_disabled"]));
  const unavailable = createContinuousIntelligenceShadowCanaryScheduledDryRunHandler({ expected_secret: () => "expected", dependencies: async () => null });
  const failed = await unavailable(new Request("http://local", { method: "POST", headers: { "x-automation-secret": "expected" }, body: JSON.stringify(request()) }));
  expect(failed.status).toBe(503);
  expect((await failed.json()).result).toBe("scheduled_dry_run_unavailable");
});

test("Action 622 route is dry-run-only and cannot import execution or persistence writers", () => {
  const route = read(routePath);
  const handler = read(handlerPath);
  expect(route).toContain("createContinuousIntelligenceShadowCanaryScheduledDryRunHandler");
  expect(handler).toContain("scheduled_dry_run_ready_before_execution");
  for (const forbidden of ["claimContinuous", "beginContinuous", "finalizeContinuous", "persistBounded", "persistContinuous", "getIntradayCandlesWithDiagnostics", "execute("]) {
    expect(route).not.toContain(forbidden);
    expect(handler).not.toContain(forbidden);
  }
});
