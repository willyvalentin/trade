import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight,
  buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
  buildContinuousIntelligenceShadowCanaryScheduledOccurrenceIdentity,
  evaluateContinuousIntelligenceShadowCanarySchedulerAuthentication,
  parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
  type ContinuousIntelligenceShadowCanaryScheduledAdmissionInput,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-admission";

const deployment = "7eb1f42440d7555041f68697a2d05157f3a640f5";
const routePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-admission/route.ts";
const functionPath = "netlify/functions/scheduled-shadow-collector-canary.ts";
const root = resolve(__dirname, "../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function request(overrides: Partial<ReturnType<typeof buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest>> = {}) {
  const value = buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest({
    deployment_commit: deployment,
    market_date: "2026-07-23",
    market_window: { start: "2026-07-23T14:30:00.000Z", end: "2026-07-23T15:00:00.000Z" },
    requested_at: "2026-07-23T15:01:00.000Z",
  });
  if (!value) throw new Error("Expected a canonical scheduled request.");
  return { ...value, ...overrides };
}

function input(overrides: Partial<ContinuousIntelligenceShadowCanaryScheduledAdmissionInput> = {}) {
  return {
    scheduler_authentication: "scheduler_auth_ready" as const,
    request: request(),
    deployment_identity: "exact" as const,
    canary_enabled: true,
    kill_switch_inactive: true,
    schedule_active: true,
    calendar: "ready" as const,
    market_window: "correct" as const,
    provider: "ready" as const,
    planner: "ready" as const,
    audit_contract: "ready" as const,
    ledger: "ready" as const,
    historical_usage: "ready" as const,
    scheduled_budget: "available" as const,
    active_claims: "clear" as const,
    persistence_stop: "clear" as const,
    ...overrides,
  };
}

test("Action 619 scheduled identity is deterministic, deployment-bound, and non-secret", () => {
  const first = buildContinuousIntelligenceShadowCanaryScheduledOccurrenceIdentity({
    deployment_commit: deployment,
    scheduler_contract_version: "continuous_intelligence_shadow_canary_scheduler_v1",
    market_date: "2026-07-23",
    market_window: { start: "2026-07-23T14:30:00.000Z", end: "2026-07-23T15:00:00.000Z" },
    cadence_slot: "regular_session_30m_1500Z",
    ticker: "AAPL",
    interval: "5min",
    planner_profile: "continuous_intelligence_budget_plan_v1",
  });
  const retry = buildContinuousIntelligenceShadowCanaryScheduledOccurrenceIdentity({
    deployment_commit: deployment,
    scheduler_contract_version: "continuous_intelligence_shadow_canary_scheduler_v1",
    market_date: "2026-07-23",
    market_window: { start: "2026-07-23T14:30:00.000Z", end: "2026-07-23T15:00:00.000Z" },
    cadence_slot: "regular_session_30m_1500Z",
    ticker: "AAPL",
    interval: "5min",
    planner_profile: "continuous_intelligence_budget_plan_v1",
  });
  const differentSlot = buildContinuousIntelligenceShadowCanaryScheduledOccurrenceIdentity({
    deployment_commit: deployment,
    scheduler_contract_version: "continuous_intelligence_shadow_canary_scheduler_v1",
    market_date: "2026-07-23",
    market_window: { start: "2026-07-23T15:00:00.000Z", end: "2026-07-23T15:30:00.000Z" },
    cadence_slot: "regular_session_30m_1530Z",
    ticker: "AAPL",
    interval: "5min",
    planner_profile: "continuous_intelligence_budget_plan_v1",
  });
  const differentDeployment = buildContinuousIntelligenceShadowCanaryScheduledOccurrenceIdentity({
    deployment_commit: "0eb1f42440d7555041f68697a2d05157f3a640f5",
    scheduler_contract_version: "continuous_intelligence_shadow_canary_scheduler_v1",
    market_date: "2026-07-23",
    market_window: { start: "2026-07-23T14:30:00.000Z", end: "2026-07-23T15:00:00.000Z" },
    cadence_slot: "regular_session_30m_1500Z",
    ticker: "AAPL",
    interval: "5min",
    planner_profile: "continuous_intelligence_budget_plan_v1",
  });
  expect(first).toEqual(retry);
  expect(first?.occurrence_id).not.toBe(differentSlot?.occurrence_id);
  expect(first?.occurrence_id).not.toBe(differentDeployment?.occurrence_id);
  expect(first?.occurrence_id).not.toContain("secret");
  expect(first?.occurrence_id).not.toContain("manual");
  expect(first?.occurrence_id.length).toBeLessThanOrEqual(128);
});

test("Action 619 request parsing rejects noncanonical, manual, or secret-shaped input", () => {
  const canonical = request();
  expect(parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest(canonical)).toEqual(canonical);
  expect(parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest({ ...canonical, occurrence_id: "manual_canary_attempt" })).toBeNull();
  expect(parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest({ ...canonical, source: "manual" })).toBeNull();
  expect(parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest({ ...canonical, scheduler_secret: "never-accepted" })).toBeNull();
  expect(parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest({ ...canonical, expected_policy: { total_credits: 377, hard_reserve_credits: 57, normal_planned_max_credits: 319 } })).toBeNull();
});

test("Action 619 scheduler authentication fails closed without exposing secrets", () => {
  expect(evaluateContinuousIntelligenceShadowCanarySchedulerAuthentication(undefined, null)).toBe("scheduler_auth_missing");
  expect(evaluateContinuousIntelligenceShadowCanarySchedulerAuthentication("expected", null)).toBe("scheduler_auth_missing");
  expect(evaluateContinuousIntelligenceShadowCanarySchedulerAuthentication("expected", "wrong")).toBe("scheduler_auth_invalid");
  expect(evaluateContinuousIntelligenceShadowCanarySchedulerAuthentication("expected", "expected")).toBe("scheduler_auth_ready");
});

test("Action 619 blocks every preflight failure before a shared-core handoff", () => {
  expect(buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(input())).toMatchObject({
    status: "admission_ready",
    blockers: [],
    provider_calls_executed: false,
    durable_writes_executed: false,
    shared_core_handoff: { ticker: "AAPL", interval: "5min" },
  });
  const cases: Array<[Partial<ContinuousIntelligenceShadowCanaryScheduledAdmissionInput>, string]> = [
    [{ scheduler_authentication: "scheduler_auth_invalid" }, "scheduler_auth_invalid"],
    [{ deployment_identity: "mismatch" }, "deployment_identity_mismatch"],
    [{ canary_enabled: false }, "canary_disabled"],
    [{ kill_switch_inactive: false }, "kill_switch_active"],
    [{ schedule_active: false }, "schedule_inactive"],
    [{ calendar: "unavailable" }, "calendar_unavailable"],
    [{ market_window: "outside" }, "outside_market_window"],
    [{ provider: "unavailable" }, "provider_unavailable"],
    [{ provider: "unknown_runtime_status" as never }, "provider_unavailable"],
    [{ planner: "unavailable" }, "planner_unavailable"],
    [{ audit_contract: "unavailable" }, "audit_contract_unavailable"],
    [{ ledger: "unavailable" }, "ledger_unavailable"],
    [{ historical_usage: "unavailable" }, "historical_usage_unavailable"],
    [{ scheduled_budget: "exhausted" }, "scheduled_budget_exhausted"],
    [{ active_claims: "same_occurrence_active" }, "active_claim_conflict"],
    [{ active_claims: "unavailable" }, "unavailable"],
    [{ persistence_stop: "audit_failed" }, "unresolved_persistence_failure"],
    [{ persistence_stop: "unavailable" }, "unavailable"],
  ];
  for (const [overrides, blocker] of cases) {
    const result = buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(input(overrides));
    expect(result.status).toBe("blocked");
    expect(result.blockers).toContain(blocker);
    expect(result.shared_core_handoff).toBeNull();
    expect(result.provider_calls_executed).toBe(false);
  }
});

test("Action 619 keeps the new scheduler route dry and the foundation unscheduled", () => {
  const route = read(routePath);
  const scheduledFunction = read(functionPath);
  expect(route).toContain("evaluateContinuousIntelligenceShadowCanarySchedulerAuthentication");
  expect(route).toContain("buildContinuousIntelligenceShadowCanaryScheduledExecutionSafetyContext");
  for (const forbidden of ["getIntradayCandlesWithDiagnostics", "claimContinuous", "beginContinuous", "finalizeContinuous", "persistBounded", "persistContinuous"]) {
    expect(route).not.toContain(forbidden);
  }
  expect(scheduledFunction).toContain("scheduled-admission");
  expect(scheduledFunction).not.toContain("schedule:");
  expect(scheduledFunction).not.toContain("cron");
});
