import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight,
  buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
  buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity,
  type ContinuousIntelligenceShadowCanaryScheduledAdmissionInput,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-admission";
import {
  buildContinuousIntelligenceShadowCanaryScheduledDryRunRequest,
  evaluateContinuousIntelligenceShadowCanaryScheduledDryRun,
  type ScheduledDryRunDependencies,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-dry-run";
import {
  continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  evaluateContinuousIntelligenceShadowCanaryScheduledBudget,
  mapContinuousIntelligenceShadowCanaryScheduledPersistenceStop,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-execution-safety";
import {
  buildContinuousIntelligenceShadowCanaryScheduledLiveShadowRequest,
  resolveContinuousIntelligenceShadowCanaryScheduledExecutionGate,
  runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-live-shadow";
import { buildContinuousIntelligenceShadowCanaryUsageAccounting } from "../../lib/continuous-intelligence-shadow-canary-usage-accounting";
import { createContinuousIntelligenceShadowCanaryScheduledDryRunHandler } from "../../lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-handler";
import { POST as scheduledLiveShadowPost } from "../../app/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-execution/route";

const root = resolve(__dirname, "../..");
const deployment = "7eb1f42440d7555041f68697a2d05157f3a640f5";
const expectedSecret = "acceptance-secret-not-for-output";

const paths = {
  scheduledExecutionRoute: "app/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-execution/route.ts",
  scheduledDryRunRoute: "app/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-dry-run/route.ts",
  scheduledDryRunHandler: "lib/server/continuous-intelligence-shadow-canary-scheduled-dry-run-handler.ts",
  scheduledFunction: "netlify/functions/scheduled-shadow-collector-canary.ts",
};

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function scheduledRequest(overrides: { deployment_commit?: string; end?: string } = {}) {
  const end = overrides.end ?? "2026-07-23T15:00:00.000Z";
  const start = new Date(Date.parse(end) - 30 * 60 * 1000).toISOString();
  const requestedAt = new Date(Date.parse(end) + 60 * 1000).toISOString();
  const request = buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest({
    deployment_commit: overrides.deployment_commit ?? deployment,
    market_date: "2026-07-23",
    market_window: { start, end },
    requested_at: requestedAt,
  });
  if (!request) throw new Error("Expected canonical scheduled request.");
  return request;
}

function dryRunRequest() {
  const request = buildContinuousIntelligenceShadowCanaryScheduledDryRunRequest(scheduledRequest());
  if (!request) throw new Error("Expected canonical scheduled dry-run request.");
  return request;
}

const readyDependencies: ScheduledDryRunDependencies = {
  deployment: "exact",
  scheduled_execution_enabled: true,
  canary: "ready",
  kill_switch: "ready",
  schedule: "ready",
  calendar_window: "ready",
  provider_planner: "ready",
  audit_ledger: "ready",
  historical_usage: "ready",
  budget: "scheduled_budget_ready",
  persistence: "clean",
  active_claim: "clear",
  retry: "eligible",
  correlation: "consistent",
};

function admissionInput(
  overrides: Partial<ContinuousIntelligenceShadowCanaryScheduledAdmissionInput> = {},
): ContinuousIntelligenceShadowCanaryScheduledAdmissionInput {
  return {
    scheduler_authentication: "scheduler_auth_ready",
    request: scheduledRequest(),
    deployment_identity: "exact",
    canary_enabled: true,
    kill_switch_inactive: true,
    schedule_active: true,
    calendar: "ready",
    market_window: "correct",
    provider: "ready",
    planner: "ready",
    audit_contract: "ready",
    ledger: "ready",
    historical_usage: "ready",
    scheduled_budget: "available",
    active_claims: "clear",
    persistence_stop: "clear",
    ...overrides,
  };
}

function availableUsage() {
  return buildContinuousIntelligenceShadowCanaryUsageAccounting({
    utc_day: "2026-07-23",
    ledger_rows: [],
    claim_rows: [],
  });
}

function budget(overrides: Parameters<typeof evaluateContinuousIntelligenceShadowCanaryScheduledBudget>[0]["invocation"] = {
  provider_calls: 1,
  estimated_credits: 1,
  active_scheduled_claims: 0,
  scheduled_claims_for_market_window: 0,
}) {
  return evaluateContinuousIntelligenceShadowCanaryScheduledBudget({
    policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    usage: availableUsage(),
    invocation: overrides,
  });
}

test("Action 624 inventories a non-mutating scheduled package with disabled production wiring", async () => {
  const liveRoute = read(paths.scheduledExecutionRoute);
  const dryRunRoute = read(paths.scheduledDryRunRoute);
  const dryRunHandler = read(paths.scheduledDryRunHandler);
  const functionSource = read(paths.scheduledFunction);

  expect(functionSource).not.toContain("schedule:");
  expect(functionSource).not.toContain("cron");
  expect(liveRoute).toContain("resolveContinuousIntelligenceShadowCanaryScheduledExecutionGate(undefined)");
  expect(dryRunRoute).toContain("createContinuousIntelligenceShadowCanaryScheduledDryRunHandler");
  for (const forbidden of [
    "claimContinuous",
    "beginContinuous",
    "finalizeContinuous",
    "persistBounded",
    "persistContinuous",
    "getIntradayCandlesWithDiagnostics",
    "shared_core",
  ]) {
    expect(liveRoute).not.toContain(forbidden);
    expect(dryRunRoute).not.toContain(forbidden);
    expect(dryRunHandler).not.toContain(forbidden);
  }

  const response = await scheduledLiveShadowPost();
  expect(response.status).toBe(403);
  expect(await response.json()).toMatchObject({
    result: "scheduled_execution_disabled",
    gate: "scheduled_execution_disabled",
    provider_calls: 0,
    claims_created: 0,
    audit_writes: 0,
    ledger_writes: 0,
  });
  expect(resolveContinuousIntelligenceShadowCanaryScheduledExecutionGate(undefined)).toBe("scheduled_execution_disabled");
  expect(resolveContinuousIntelligenceShadowCanaryScheduledExecutionGate("unexpected")).toBe("scheduled_execution_configuration_unavailable");
});

test("Action 624 runs the injected real dry-run handler end to end without durable effects", async () => {
  let dependencyReads = 0;
  const handler = createContinuousIntelligenceShadowCanaryScheduledDryRunHandler({
    expected_secret: () => expectedSecret,
    dependencies: async () => {
      dependencyReads += 1;
      return readyDependencies;
    },
  });
  const body = JSON.stringify(dryRunRequest());

  for (const supplied of [null, "invalid"]) {
    const headers = supplied ? { "x-automation-secret": supplied } : undefined;
    const response = await handler(new Request("http://local", { method: "POST", headers, body }));
    expect(response.status).toBe(401);
    expect(dependencyReads).toBe(0);
  }

  const disabled = await handler(new Request("http://local", {
    method: "POST",
    headers: { "x-automation-secret": expectedSecret },
    body,
  }));
  const readyHandler = createContinuousIntelligenceShadowCanaryScheduledDryRunHandler({
    expected_secret: () => expectedSecret,
    dependencies: async () => ({
      ...readyDependencies,
      scheduled_execution_enabled: false,
      canary: "blocked",
      kill_switch: "blocked",
      schedule: "blocked",
    }),
  });
  const baseline = await readyHandler(new Request("http://local", {
    method: "POST",
    headers: { "x-automation-secret": expectedSecret },
    body,
  }));
  expect(disabled.status).toBe(200);
  expect((await disabled.json()).result).toBe("scheduled_dry_run_ready_before_execution");
  const baselineBody = await baseline.json();
  expect(baseline.status).toBe(409);
  expect(baselineBody).toMatchObject({ result: "scheduled_dry_run_blocked" });
  expect(baselineBody.evidence.blockers).toEqual(expect.arrayContaining([
    "scheduled_execution_feature_disabled",
    "canary_disabled",
    "kill_switch_active",
    "schedule_inactive",
  ]));

  const deterministic = evaluateContinuousIntelligenceShadowCanaryScheduledDryRun({
    authentication: "scheduler_auth_ready",
    request: dryRunRequest(),
    dependencies: readyDependencies,
    now: new Date("2026-07-23T15:02:00.000Z"),
  });
  expect(deterministic).toMatchObject({
    hypothetical_admission_eligible: true,
    execution_barrier: "dry_run_only",
    provider_calls: 0,
    claims_created: 0,
    audit_writes: 0,
    ledger_writes: 0,
    usage_mutations: 0,
    generated_at: "2026-07-23T15:02:00.000Z",
  });
  expect(JSON.stringify(deterministic)).not.toContain(expectedSecret);
});

test("Action 624 blocks live-shadow admission until every test-only gate is explicitly ready", async () => {
  const live = buildContinuousIntelligenceShadowCanaryScheduledLiveShadowRequest(scheduledRequest());
  if (!live) throw new Error("Expected canonical live-shadow request.");
  let admissions = 0;
  let handoffs = 0;
  const admission = async () => {
    admissions += 1;
    return "admitted" as const;
  };

  for (const input of [
    { request: null, authenticated: true, gate: "scheduled_execution_enabled" as const, safety_ready: true },
    { request: live, authenticated: false, authentication: "scheduler_auth_missing" as const, gate: "scheduled_execution_enabled" as const, safety_ready: true },
    { request: live, authenticated: true, gate: "scheduled_execution_enabled" as const, safety_ready: false, safety_blocker: "deployment_identity_mismatch" as const },
    { request: live, authenticated: true, gate: "scheduled_execution_disabled" as const, safety_ready: true },
  ]) {
    await runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness({
      ...input,
      admission,
      shared_core: async () => {
        handoffs += 1;
        return "completed" as const;
      },
    });
  }
  expect(admissions).toBe(0);
  expect(handoffs).toBe(0);

  expect(await runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness({
    request: live,
    authenticated: false,
    authentication: "scheduler_auth_configuration_unavailable",
    gate: "scheduled_execution_enabled",
    safety_ready: true,
    admission,
    shared_core: async () => "completed",
  })).toBe("scheduler_auth_configuration_unavailable");
  expect(await runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness({
    request: live,
    authenticated: true,
    gate: "scheduled_execution_enabled",
    safety_ready: false,
    safety_blocker: "canary_disabled",
    admission,
    shared_core: async () => "completed",
  })).toBe("canary_disabled");

  const synthetic = await runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness({
    request: live,
    authenticated: true,
    gate: "scheduled_execution_enabled",
    safety_ready: true,
    admission,
    shared_core: async () => {
      handoffs += 1;
      return "completed";
    },
  });
  expect(synthetic).toBe("scheduled_execution_completed");
  expect(admissions).toBe(1);
  expect(handoffs).toBe(1);
});

test("Action 624 preserves occurrence isolation, overlap blocking, and one synthetic terminal handoff", async () => {
  const first = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(scheduledRequest());
  const retry = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(scheduledRequest());
  const laterWindow = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(scheduledRequest({ end: "2026-07-23T15:30:00.000Z" }));
  const otherDeployment = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(scheduledRequest({ deployment_commit: "0eb1f42440d7555041f68697a2d05157f3a640f5" }));
  expect(first).toEqual(retry);
  expect(first?.claim_id).not.toBe(laterWindow?.claim_id);
  expect(first?.claim_id).not.toBe(otherDeployment?.claim_id);
  expect(first?.claim_id).toMatch(/^canary_claim_scheduled_canary_execution_/);
  expect(first?.claim_id).not.toContain("manual");

  expect(buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(admissionInput({
    active_claims: "same_occurrence_active",
  })).blockers).toContain("active_claim_conflict");
  expect(buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(admissionInput({
    active_claims: "conflicting_scope_active",
  })).blockers).toContain("active_claim_conflict");
  expect(buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(admissionInput({
    active_claims: "unavailable",
  })).blockers).toContain("unavailable");

  const live = buildContinuousIntelligenceShadowCanaryScheduledLiveShadowRequest(scheduledRequest());
  if (!live) throw new Error("Expected canonical live-shadow request.");
  let providerCalls = 0;
  let auditWrites = 0;
  let ledgerWrites = 0;
  const complete = await runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness({
    request: live,
    authenticated: true,
    gate: "scheduled_execution_enabled",
    safety_ready: true,
    admission: async () => "admitted",
    shared_core: async () => {
      providerCalls += 1;
      auditWrites += 1;
      ledgerWrites += 1;
      return "completed";
    },
  });
  const replay = await runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness({
    request: live,
    authenticated: true,
    gate: "scheduled_execution_enabled",
    safety_ready: true,
    admission: async () => "already_terminal_idempotent",
    shared_core: async () => {
      providerCalls += 1;
      return "completed";
    },
  });
  expect(complete).toBe("scheduled_execution_completed");
  expect(replay).toBe("scheduled_execution_already_completed");
  expect({ providerCalls, auditWrites, ledgerWrites }).toEqual({ providerCalls: 1, auditWrites: 1, ledgerWrites: 1 });

  for (const [admission, expected] of [
    ["daily_usage_unavailable", "daily_usage_unavailable"],
    ["historical_usage_unavailable", "historical_usage_unavailable"],
    ["scheduled_budget_exhausted", "scheduled_budget_exhausted"],
    ["active_claim_conflict", "active_claim_conflict"],
    ["unresolved_persistence_failure", "unresolved_persistence_failure"],
    ["admission_unavailable", "admission_unavailable"],
    ["unknown", "unavailable"],
  ] as const) {
    expect(await runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness({
      request: live,
      authenticated: true,
      gate: "scheduled_execution_enabled",
      safety_ready: true,
      admission: async () => admission,
      shared_core: async () => "completed",
    })).toBe(expected);
  }
});

test("Action 624 keeps reserve, historical usage, and persistence failures fail-closed before provider work", () => {
  expect(budget()).toBe("scheduled_budget_ready");
  expect(budget({ provider_calls: 1, estimated_credits: 1, active_scheduled_claims: 1, scheduled_claims_for_market_window: 0 }))
    .toBe("scheduled_concurrency_limit_reached");
  expect(budget({ provider_calls: 1, estimated_credits: 1, active_scheduled_claims: 0, scheduled_claims_for_market_window: 1 }))
    .toBe("scheduled_window_limit_reached");

  const separatedUsage = buildContinuousIntelligenceShadowCanaryUsageAccounting({
    utc_day: "2026-07-23",
    ledger_rows: [
      { entry_kind: "bounded_manual_proof", generated_at: "2026-07-23T14:00:00.000Z", provider_estimated_credits: 1 },
      { entry_kind: "scheduled_shadow_collector_canary", generated_at: "2026-07-23T15:00:00.000Z", provider_estimated_credits: 1 },
    ],
    claim_rows: [
      { utc_day: "2026-07-23", estimated_credits: 1, status: "completed" },
      { utc_day: "2026-07-23", estimated_credits: 1, status: "completed" },
    ],
  });
  expect(separatedUsage).toMatchObject({
    scheduled_shadow_collector_canary: { attempts: 1, estimated_credits: 1 },
    bounded_manual_proof: { attempts: 1, estimated_credits: 1 },
    total_ledger: { estimated_credits: 2 },
    claim_capacity: { estimated_credits: 2 },
  });
  if (separatedUsage.status !== "available") {
    throw new Error("Expected available synthetic usage.");
  }
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledBudget({
    policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    usage: { ...separatedUsage, claim_capacity: { attempts: 1, estimated_credits: 1 } },
    invocation: { provider_calls: 1, estimated_credits: 1, active_scheduled_claims: 0, scheduled_claims_for_market_window: 0 },
  })).toBe("usage_disagreement");

  for (const [state, expected] of [
    ["audit_failed", "unresolved_audit_failure"],
    ["ledger_failed", "unresolved_ledger_failure"],
    ["usage_mismatch", "unresolved_usage_mismatch"],
    ["finalization_unproven", "unresolved_finalization_failure"],
    ["unavailable", "persistence_state_unavailable"],
  ] as const) {
    expect(mapContinuousIntelligenceShadowCanaryScheduledPersistenceStop(state)).toBe(expected);
    const blocked = buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(admissionInput({
      persistence_stop: state === "unavailable" ? "unavailable" : state === "finalization_unproven" ? "finalization_unproven" : state,
    }));
    expect(blocked.status).toBe("blocked");
    expect(blocked.shared_core_handoff).toBeNull();
  }
});
