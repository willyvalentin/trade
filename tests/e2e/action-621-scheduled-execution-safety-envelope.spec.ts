import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryScheduledExecutionHandoff,
  buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
  buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight,
  mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission,
  type ContinuousIntelligenceShadowCanaryScheduledAdmissionInput,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-admission";
import {
  buildContinuousIntelligenceShadowCanaryScheduledExecutionCorrelation,
  continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  disabledContinuousIntelligenceShadowCanaryScheduledExecutionCapability,
  evaluateContinuousIntelligenceShadowCanaryScheduledBudget,
  evaluateContinuousIntelligenceShadowCanaryScheduledRetry,
  evaluateContinuousIntelligenceShadowCanaryScheduledSafetyEnvelope,
  mapContinuousIntelligenceShadowCanaryScheduledPersistenceStop,
  parseContinuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  serializeContinuousIntelligenceShadowCanaryScheduledExecutionPolicy,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-execution-safety";
import type { ContinuousIntelligenceShadowCanaryUsageAccounting } from "../../lib/continuous-intelligence-shadow-canary-usage-accounting";

const root = resolve(__dirname, "../..");
const routePath = "app/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-admission/route.ts";
const contextPath = "lib/server/continuous-intelligence-shadow-canary-scheduled-execution-safety-context.ts";
const deployment = "7eb1f42440d7555041f68697a2d05157f3a640f5";

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function request() {
  const value = buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest({
    deployment_commit: deployment,
    market_date: "2026-07-23",
    market_window: { start: "2026-07-23T14:30:00.000Z", end: "2026-07-23T15:00:00.000Z" },
    requested_at: "2026-07-23T15:01:00.000Z",
  });
  if (!value) throw new Error("Expected scheduled request.");
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

function availableUsage(input: {
  scheduledAttempts?: number;
  scheduledCredits?: number;
  manualAttempts?: number;
  manualCredits?: number;
  totalAttempts?: number;
  totalCredits?: number;
  claimAttempts?: number;
  claimCredits?: number;
} = {}): ContinuousIntelligenceShadowCanaryUsageAccounting {
  const scheduledAttempts = input.scheduledAttempts ?? 0;
  const scheduledCredits = input.scheduledCredits ?? 0;
  const manualAttempts = input.manualAttempts ?? 0;
  const manualCredits = input.manualCredits ?? 0;
  return {
    status: "available",
    scope: "utc_day",
    queried_utc_date: "2026-07-23",
    scheduled_shadow_collector_canary: { attempts: scheduledAttempts, estimated_credits: scheduledCredits },
    bounded_manual_proof: { attempts: manualAttempts, estimated_credits: manualCredits },
    total_ledger: {
      attempts: input.totalAttempts ?? scheduledAttempts + manualAttempts,
      estimated_credits: input.totalCredits ?? scheduledCredits + manualCredits,
    },
    claim_capacity: {
      attempts: input.claimAttempts ?? scheduledAttempts + manualAttempts,
      estimated_credits: input.claimCredits ?? scheduledCredits + manualCredits,
    },
  };
}

function budget(usage: ContinuousIntelligenceShadowCanaryUsageAccounting, overrides: {
  provider_calls?: number;
  estimated_credits?: number;
  active_scheduled_claims?: number;
  scheduled_claims_for_market_window?: number;
} = {}) {
  return evaluateContinuousIntelligenceShadowCanaryScheduledBudget({
    policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    usage,
    invocation: {
      provider_calls: overrides.provider_calls ?? 1,
      estimated_credits: overrides.estimated_credits ?? 1,
      active_scheduled_claims: overrides.active_scheduled_claims ?? 0,
      scheduled_claims_for_market_window: overrides.scheduled_claims_for_market_window ?? 0,
    },
  });
}

test("Action 621 accepts only the canonical server policy and preserves the reserve", () => {
  expect(parseContinuousIntelligenceShadowCanaryScheduledExecutionPolicy(continuousIntelligenceShadowCanaryScheduledExecutionPolicy))
    .toBe(continuousIntelligenceShadowCanaryScheduledExecutionPolicy);
  expect(parseContinuousIntelligenceShadowCanaryScheduledExecutionPolicy({
    ...continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    hard_reserve_credits: 0,
  })).toBeNull();
  expect(serializeContinuousIntelligenceShadowCanaryScheduledExecutionPolicy(continuousIntelligenceShadowCanaryScheduledExecutionPolicy))
    .toBe(JSON.stringify(continuousIntelligenceShadowCanaryScheduledExecutionPolicy));
  expect(continuousIntelligenceShadowCanaryScheduledExecutionPolicy.reserve_consumption_enabled).toBe(false);
  expect(continuousIntelligenceShadowCanaryScheduledExecutionPolicy.publication_enabled).toBe(false);
  expect(continuousIntelligenceShadowCanaryScheduledExecutionPolicy.trade_execution_enabled).toBe(false);
});

test("Action 621 budget evaluator keeps manual usage separate and fails closed on every cap", () => {
  expect(budget(availableUsage({ manualAttempts: 1, manualCredits: 1 }))).toBe("scheduled_budget_ready");
  expect(budget(availableUsage({ scheduledAttempts: 2, scheduledCredits: 1, claimAttempts: 2, claimCredits: 1 })))
    .toBe("scheduled_attempt_limit_reached");
  expect(budget(availableUsage({ scheduledAttempts: 1, scheduledCredits: 1, claimAttempts: 1, claimCredits: 2 })))
    .toBe("usage_disagreement");
  expect(budget(availableUsage({ scheduledAttempts: 1, scheduledCredits: 2, claimAttempts: 1, claimCredits: 2 })))
    .toBe("scheduled_credit_limit_reached");
  expect(budget(availableUsage(), { scheduled_claims_for_market_window: 1 })).toBe("scheduled_window_limit_reached");
  expect(budget(availableUsage(), { active_scheduled_claims: 1 })).toBe("scheduled_concurrency_limit_reached");
  expect(budget(availableUsage({ totalCredits: 1, claimCredits: 0 }))).toBe("usage_disagreement");
  expect(budget(availableUsage({ manualAttempts: 1, manualCredits: 320, claimAttempts: 1, claimCredits: 320 })))
    .toBe("reserve_protected");
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledBudget({
    policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    usage: { ...availableUsage(), status: "unavailable", scheduled_shadow_collector_canary: null, bounded_manual_proof: null, total_ledger: null, claim_capacity: null },
    invocation: { provider_calls: 1, estimated_credits: 1, active_scheduled_claims: 0, scheduled_claims_for_market_window: 0 },
  })).toBe("historical_usage_unavailable");
});

test("Action 621 cannot expose a shared-core handoff while disabled or blocked", () => {
  const admission = buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(admissionInput());
  const disabled = evaluateContinuousIntelligenceShadowCanaryScheduledSafetyEnvelope({
    admission,
    policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    budget_status: "scheduled_budget_ready",
    persistence_guard: "clean",
    capability: disabledContinuousIntelligenceShadowCanaryScheduledExecutionCapability,
    handoff: null,
  });
  expect(disabled.final_dry_decision).toBe("scheduled_execution_disabled_locally");
  const enabledButBlocked = evaluateContinuousIntelligenceShadowCanaryScheduledSafetyEnvelope({
    admission: buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(admissionInput({ canary_enabled: false })),
    policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    budget_status: "scheduled_budget_ready",
    persistence_guard: "clean",
    capability: { scheduled_execution_enabled: true, source: "server_internal" },
    handoff: null,
  });
  expect(enabledButBlocked.final_dry_decision).toBe("scheduled_execution_blocked");
  expect(disabled.provider_calls_executed).toBe(false);
  expect(disabled.durable_writes_executed).toBe(false);
});

test("Action 621 persistence guards and retry matrix block unsafe scheduled work", () => {
  expect(mapContinuousIntelligenceShadowCanaryScheduledPersistenceStop("finalization_unproven"))
    .toBe("unresolved_finalization_failure");
  expect(mapContinuousIntelligenceShadowCanaryScheduledPersistenceStop("audit_failed"))
    .toBe("unresolved_audit_failure");
  expect(mapContinuousIntelligenceShadowCanaryScheduledPersistenceStop("ledger_failed"))
    .toBe("unresolved_ledger_failure");
  expect(mapContinuousIntelligenceShadowCanaryScheduledPersistenceStop("usage_mismatch"))
    .toBe("unresolved_usage_mismatch");
  expect(mapContinuousIntelligenceShadowCanaryScheduledPersistenceStop("unavailable"))
    .toBe("persistence_state_unavailable");
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledRetry({
    same_occurrence: true, claim_state: "completed", deployment_changed: false, policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  })).toBe("return_terminal_completed");
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledRetry({
    same_occurrence: true, claim_state: "attempted", deployment_changed: false, policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  })).toBe("block_active_occurrence");
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledRetry({
    same_occurrence: true, claim_state: "provider_failed", deployment_changed: false, policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  })).toBe("block_provider_failure_retry_disabled");
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledRetry({
    same_occurrence: true, claim_state: "internal_failed", deployment_changed: false, policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  })).toBe("block_internal_or_persistence_failure");
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledRetry({
    same_occurrence: true, claim_state: "completed", deployment_changed: true, policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  })).toBe("require_fresh_admission");
});

test("Action 621 correlation is stable, scheduled-only, and has no secret material", () => {
  const scheduledRequest = request();
  const lifecycle = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(scheduledRequest);
  if (!lifecycle) throw new Error("Expected lifecycle identity.");
  const admitted = mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(lifecycle, {
    status: "claimed", claimed: true, idempotent: false, claim_id: lifecycle.claim_id, claim_status: "claimed", safe_blocker: null,
  });
  const handoff = buildContinuousIntelligenceShadowCanaryScheduledExecutionHandoff({ request: scheduledRequest, admission: admitted });
  const correlation = buildContinuousIntelligenceShadowCanaryScheduledExecutionCorrelation(lifecycle);
  expect(handoff?.audit_ledger_correlation.source_receipt_id).toBe(correlation?.audit_receipt_id);
  expect(handoff?.audit_ledger_correlation.ledger_entry_id).toBe(correlation?.ledger_receipt_id);
  expect(correlation).toMatchObject({ source: "scheduled", occurrence_id: lifecycle.occurrence_id, claim_id: lifecycle.claim_id });
  expect(JSON.stringify(correlation)).not.toMatch(/secret|token|authorization|lease/i);
  expect(correlation?.execution_id).not.toContain("manual_canary_execution_");
});

test("Action 621 dry evidence stays read-only and cannot reach provider or durable operations", () => {
  const route = read(routePath);
  const context = read(contextPath);
  expect(route).toContain("final_dry_decision");
  expect(route).toContain("execution_enabled");
  expect(context).toContain("disabledContinuousIntelligenceShadowCanaryScheduledExecutionCapability");
  for (const forbidden of ["getIntradayCandlesWithDiagnostics", "claimContinuous", "beginContinuous", "finalizeContinuous", "persistBounded", "persistContinuous"]) {
    expect(route).not.toContain(forbidden);
    expect(context).not.toContain(forbidden);
  }
});
