import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryScheduledExecutionDisabledResult,
  buildContinuousIntelligenceShadowCanaryScheduledExecutionHandoff,
  buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
  buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight,
  mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission,
  mapContinuousIntelligenceShadowCanaryScheduledPreflightCategory,
  type ContinuousIntelligenceShadowCanaryScheduledAdmissionInput,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-admission";
import {
  createContinuousIntelligenceShadowCanaryClaimStore,
  type ContinuousIntelligenceShadowCanaryClaimDatabase,
  type ContinuousIntelligenceShadowCanaryClaimResult,
} from "../../lib/continuous-intelligence-shadow-canary-claim-store";

const root = resolve(__dirname, "../..");
const routePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-admission/route.ts";
const adapterPath = "lib/server/continuous-intelligence-shadow-canary-scheduled-admission-persistence.ts";
const deployment = "7eb1f42440d7555041f68697a2d05157f3a640f5";

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function request(overrides: { deployment_commit?: string; end?: string } = {}) {
  const end = overrides.end ?? "2026-07-23T15:00:00.000Z";
  const start = end === "2026-07-23T15:00:00.000Z"
    ? "2026-07-23T14:30:00.000Z"
    : "2026-07-23T15:00:00.000Z";
  const value = buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest({
    deployment_commit: overrides.deployment_commit ?? deployment,
    market_date: "2026-07-23",
    market_window: { start, end },
    requested_at: "2026-07-23T16:01:00.000Z",
  });
  if (!value) throw new Error("Expected canonical scheduled request.");
  return value;
}

function admissionInput(overrides: Partial<ContinuousIntelligenceShadowCanaryScheduledAdmissionInput> = {}) {
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

function admittedClaimResult(): ContinuousIntelligenceShadowCanaryClaimResult {
  return {
    status: "claimed",
    claimed: true,
    idempotent: false,
    claim_id: "canary_claim_scheduled_canary_execution_fixture",
    claim_status: "claimed",
    safe_blocker: null,
  };
}

test("Action 620 maps canonical scheduled occurrences to isolated durable identities", () => {
  const first = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(request());
  const retry = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(request());
  const differentSlot = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(request({ end: "2026-07-23T15:30:00.000Z" }));
  const differentDeployment = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(request({ deployment_commit: "0eb1f42440d7555041f68697a2d05157f3a640f5" }));

  expect(first).toEqual(retry);
  expect(first?.claim_id).not.toBe(differentSlot?.claim_id);
  expect(first?.execution_id).not.toBe(differentDeployment?.execution_id);
  expect(first?.execution_id).toMatch(/^scheduled_canary_execution_/);
  expect(first?.claim_id).toMatch(/^canary_claim_scheduled_canary_execution_/);
  expect(first?.execution_id).not.toContain("manual_canary_authorization_");
  expect(first?.source_metadata).toMatchObject({
    source: "scheduled",
    deployment_commit: deployment,
    ticker: "AAPL",
    interval: "5min",
    planner_profile: "continuous_intelligence_budget_plan_v1",
    policy: { total_credits: 377, hard_reserve_credits: 57, normal_planned_max_credits: 320 },
  });
  expect(JSON.stringify(first)).not.toContain("secret");
});

test("Action 620 preserves every atomic claim outcome as a typed scheduled result", () => {
  const lifecycle = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(request());
  if (!lifecycle) throw new Error("Expected lifecycle identity.");

  expect(mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycle, admittedClaimResult()).category)
    .toBe("scheduled_claim_admitted");
  const active: ContinuousIntelligenceShadowCanaryClaimResult = {
    status: "already_claimed", claimed: true, idempotent: true, claim_id: lifecycle.claim_id, claim_status: "attempted", safe_blocker: null,
  };
  expect(mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycle, active).category).toBe("scheduled_claim_active_conflict");
  const terminal: ContinuousIntelligenceShadowCanaryClaimResult = {
    status: "already_claimed", claimed: true, idempotent: true, claim_id: lifecycle.claim_id, claim_status: "completed", safe_blocker: null,
  };
  expect(mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycle, terminal).category).toBe("scheduled_claim_already_terminal");
  const budget: ContinuousIntelligenceShadowCanaryClaimResult = {
    status: "daily_credit_limit_reached", claimed: false, idempotent: false, claim_id: null, claim_status: null, safe_blocker: "daily_credit_limit_reached",
  };
  expect(mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycle, budget).category)
    .toBe("scheduled_budget_exhausted");
  const unavailable: ContinuousIntelligenceShadowCanaryClaimResult = {
    status: "daily_usage_unavailable", claimed: false, idempotent: false, claim_id: null, claim_status: null, safe_blocker: "daily_usage_unavailable",
  };
  expect(mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycle, unavailable).category)
    .toBe("scheduled_daily_usage_unavailable");
  expect(mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycle, null).category).toBe("unknown");
});

test("Action 620 admits one scheduled occurrence once and treats its retry as active", async () => {
  const lifecycle = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(request());
  if (!lifecycle) throw new Error("Expected lifecycle identity.");
  const claims = new Map<string, "claimed" | "attempted" | "completed" | "failed">();
  const database: ContinuousIntelligenceShadowCanaryClaimDatabase = {
    async claim(input) {
      const status = claims.get(input.execution_id);
      if (status) {
        return {
          data: { claimed: true, idempotent: true, claim_id: input.claim_id, claim_status: status, blocker: null },
          error: null,
        };
      }
      claims.set(input.execution_id, "claimed");
      return {
        data: { claimed: true, idempotent: false, claim_id: input.claim_id, claim_status: "claimed", blocker: null },
        error: null,
      };
    },
    async beginAttempt() {
      return { data: null, error: { code: "not_used" } };
    },
    async finalize() {
      return { data: null, error: { code: "not_used" } };
    },
  };
  const store = createContinuousIntelligenceShadowCanaryClaimStore(database);
  const input = {
    claim_id: lifecycle.claim_id,
    execution_id: lifecycle.execution_id,
    request_fingerprint: lifecycle.request_fingerprint,
    utc_day: lifecycle.utc_day,
    estimated_credits: 1 as const,
  };
  const first = await store.claim(input);
  const retry = await store.claim(input);

  expect(claims.size).toBe(1);
  expect(mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycle, first).category)
    .toBe("scheduled_claim_admitted");
  expect(mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycle, retry).category)
    .toBe("scheduled_claim_active_conflict");
});

test("Action 620 builds a single admitted shared-core handoff but keeps execution disabled", () => {
  const scheduledRequest = request();
  const lifecycle = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(scheduledRequest);
  if (!lifecycle) throw new Error("Expected lifecycle identity.");
  const admission = mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycle, admittedClaimResult());
  const handoff = buildContinuousIntelligenceShadowCanaryScheduledExecutionHandoff({ request: scheduledRequest, admission });
  const disabled = buildContinuousIntelligenceShadowCanaryScheduledExecutionDisabledResult(handoff);

  expect(handoff).toMatchObject({
    category: "scheduled_execution_handoff_ready",
    lifecycle_identity: { claim_id: lifecycle.claim_id, execution_id: lifecycle.execution_id },
    execution_scope: { ticker: "AAPL", interval: "5min", max_provider_requests: 1, max_estimated_credits: 1 },
    provider_planner_inputs: { provider_execution_enabled: false, hard_reserve_credits: 57, normal_planned_max_credits: 320 },
    audit_ledger_correlation: { entry_kind: "scheduled_shadow_collector_canary", source_receipt_id: lifecycle.source_receipt_id, ledger_entry_id: lifecycle.ledger_entry_id },
  });
  expect(disabled).toMatchObject({
    category: "scheduled_execution_disabled_locally",
    provider_calls_executed: false,
    durable_writes_executed: false,
    audit_writes_executed: false,
    ledger_writes_executed: false,
  });
  expect(buildContinuousIntelligenceShadowCanaryScheduledExecutionHandoff({
    request: scheduledRequest,
    admission: mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycle, null),
  })).toBeNull();
});

test("Action 620 retains Action 619 blockers and maps durable stop states safely", () => {
  expect(mapContinuousIntelligenceShadowCanaryScheduledPreflightCategory(
    buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(admissionInput()),
  )).toBe("scheduled_admission_ready");
  expect(mapContinuousIntelligenceShadowCanaryScheduledPreflightCategory(
    buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(admissionInput({ persistence_stop: "audit_failed" })),
  )).toBe("scheduled_persistence_stop_active");
  expect(mapContinuousIntelligenceShadowCanaryScheduledPreflightCategory(
    buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(admissionInput({ scheduled_budget: "exhausted" })),
  )).toBe("scheduled_budget_exhausted");
  expect(mapContinuousIntelligenceShadowCanaryScheduledPreflightCategory(
    buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(admissionInput({ historical_usage: "unavailable" })),
  )).toBe("scheduled_daily_usage_unavailable");
  expect(buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(admissionInput({
    scheduler_authentication: "scheduler_auth_invalid",
    canary_enabled: false,
    kill_switch_inactive: false,
    schedule_active: false,
  })).status).toBe("blocked");
});

test("Action 620 reuses the durable claim adapter but keeps the public route dry", () => {
  const adapter = read(adapterPath);
  const route = read(routePath);
  expect(adapter).toContain("claimContinuousIntelligenceShadowCanaryDailyCapacity");
  expect(adapter).toContain("mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission");
  expect(adapter).not.toContain("getIntradayCandlesWithDiagnostics");
  expect(adapter).not.toContain("beginContinuousIntelligenceShadowCanaryAttempt");
  expect(route).toContain("buildContinuousIntelligenceShadowCanaryScheduledExecutionDisabledResult");
  for (const forbidden of ["getIntradayCandlesWithDiagnostics", "claimContinuous", "beginContinuous", "finalizeContinuous", "persistBounded", "persistContinuous"]) {
    expect(route).not.toContain(forbidden);
  }
});
