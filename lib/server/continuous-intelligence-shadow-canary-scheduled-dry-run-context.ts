import "server-only";

import { buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity } from "@/lib/continuous-intelligence-shadow-canary-scheduled-admission";
import type { ScheduledDryRunDependencies } from "@/lib/continuous-intelligence-shadow-canary-scheduled-dry-run";
import { buildContinuousIntelligenceShadowCanaryScheduledExecutionSafetyContext } from "@/lib/server/continuous-intelligence-shadow-canary-scheduled-execution-safety-context";

export async function buildContinuousIntelligenceShadowCanaryScheduledDryRunDependencies(request: Parameters<typeof buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity>[0]): Promise<ScheduledDryRunDependencies | null> {
  const safety = await buildContinuousIntelligenceShadowCanaryScheduledExecutionSafetyContext({ request, scheduler_authentication: "scheduler_auth_ready" });
  const blockers = new Set(safety.admission.blockers);
  const lifecycle = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(request);
  return {
    deployment: blockers.has("deployment_identity_mismatch") ? "mismatch" : "exact",
    scheduled_execution_enabled: false,
    canary: blockers.has("canary_disabled") ? "blocked" : "ready",
    kill_switch: blockers.has("kill_switch_active") ? "blocked" : "ready",
    schedule: blockers.has("schedule_inactive") ? "blocked" : "ready",
    calendar_window: blockers.has("calendar_unavailable") || blockers.has("outside_market_window") ? "blocked" : "ready",
    provider_planner: blockers.has("provider_unavailable") || blockers.has("planner_unavailable") ? "blocked" : "ready",
    audit_ledger: blockers.has("audit_contract_unavailable") || blockers.has("ledger_unavailable") ? "blocked" : "ready",
    historical_usage: blockers.has("historical_usage_unavailable") ? "unavailable" : "ready",
    budget: safety.safety.budget_status,
    persistence: safety.safety.persistence_guard,
    active_claim: safety.active_claim_status === "clear" ? "clear" : safety.active_claim_status === "unavailable" ? "unavailable" : "conflict",
    retry: safety.active_claim_status === "clear" && safety.persistence_stop === "clear" ? "eligible" : "ineligible",
    correlation: lifecycle ? "consistent" : "inconsistent",
  };
}
