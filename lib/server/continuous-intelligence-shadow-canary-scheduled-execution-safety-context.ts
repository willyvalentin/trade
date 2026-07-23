import "server-only";

import {
  continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
  disabledContinuousIntelligenceShadowCanaryScheduledExecutionCapability,
  evaluateContinuousIntelligenceShadowCanaryScheduledBudget,
  evaluateContinuousIntelligenceShadowCanaryScheduledSafetyEnvelope,
  mapContinuousIntelligenceShadowCanaryScheduledPersistenceStop,
} from "@/lib/continuous-intelligence-shadow-canary-scheduled-execution-safety";
import type { ContinuousIntelligenceShadowCanaryScheduledExecutionRequest } from "@/lib/continuous-intelligence-shadow-canary-scheduled-admission";
import {
  buildContinuousIntelligenceShadowCanaryScheduledAdmissionContext,
  readContinuousIntelligenceShadowCanaryScheduledDurableState,
} from "@/lib/server/continuous-intelligence-shadow-canary-scheduled-admission-context";
import { readContinuousIntelligenceShadowCanaryUsageAccounting } from "@/lib/server/continuous-intelligence-shadow-canary-usage-accounting";

function utcBounds(utcDay: string) {
  const start = new Date(`${utcDay}T00:00:00.000Z`);
  return {
    utc_day: utcDay,
    start: start.toISOString(),
    end: new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Read-only safety evidence for the dry route. It never admits a claim, begins
 * an attempt, or reaches the execution core.
 */
export async function buildContinuousIntelligenceShadowCanaryScheduledExecutionSafetyContext(input: {
  request: ContinuousIntelligenceShadowCanaryScheduledExecutionRequest | null;
  scheduler_authentication: "scheduler_auth_missing" | "scheduler_auth_invalid" | "scheduler_auth_ready";
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const admission = await buildContinuousIntelligenceShadowCanaryScheduledAdmissionContext(input);
  const utcDay = input.request?.market_date ?? now.toISOString().slice(0, 10);
  const bounds = utcBounds(utcDay);
  const [usage, durableState] = await Promise.all([
    readContinuousIntelligenceShadowCanaryUsageAccounting(bounds),
    readContinuousIntelligenceShadowCanaryScheduledDurableState({
      ...bounds,
      occurrence_id: input.request?.occurrence_id ?? null,
      request_fingerprint: input.request
        ? `${input.request.ticker}|${input.request.interval}|${input.request.market_window.start}|${input.request.market_window.end}`
        : null,
    }),
  ]);
  const budget = evaluateContinuousIntelligenceShadowCanaryScheduledBudget({
    policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    usage,
    invocation: {
      provider_calls: 1,
      estimated_credits: 1,
      active_scheduled_claims: durableState.active_scheduled_claims ?? Number.MAX_SAFE_INTEGER,
      scheduled_claims_for_market_window: durableState.scheduled_claims_for_market_window ?? Number.MAX_SAFE_INTEGER,
    },
  });
  const safety = evaluateContinuousIntelligenceShadowCanaryScheduledSafetyEnvelope({
    admission,
    policy: continuousIntelligenceShadowCanaryScheduledExecutionPolicy,
    budget_status: budget,
    persistence_guard: mapContinuousIntelligenceShadowCanaryScheduledPersistenceStop(durableState.persistence_stop),
    capability: disabledContinuousIntelligenceShadowCanaryScheduledExecutionCapability,
    handoff: null,
  });
  return Object.freeze({
    admission,
    safety,
    active_claim_status: durableState.active_claims,
    persistence_stop: durableState.persistence_stop,
    queried_utc_day: bounds.utc_day,
  });
}
