import {
  buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity,
  parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
  type ContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
} from "@/lib/continuous-intelligence-shadow-canary-scheduled-admission";

export const continuousIntelligenceShadowCanaryScheduledLiveShadowContractVersion = "continuous_intelligence_shadow_canary_scheduled_live_shadow_v1" as const;
export const continuousIntelligenceShadowCanaryScheduledLiveShadowRoutePath = "/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-execution" as const;

export type ScheduledExecutionGate = "scheduled_execution_disabled" | "scheduled_execution_configuration_unavailable" | "scheduled_execution_enabled";
export type ScheduledLiveShadowRequest = ContinuousIntelligenceShadowCanaryScheduledExecutionRequest & { live_shadow_contract_version: typeof continuousIntelligenceShadowCanaryScheduledLiveShadowContractVersion; execution_mode: "live_shadow"; correlation_id: string };
export type ScheduledAdmissionResult = "admitted" | "already_terminal_idempotent" | "active_claim_conflict" | "scheduled_budget_exhausted" | "historical_usage_unavailable" | "daily_usage_unavailable" | "unresolved_persistence_failure" | "deployment_identity_mismatch" | "deployment_configuration_conflict" | "deployment_configuration_malformed" | "deployment_platform_identity_conflict" | "deployment_platform_identity_malformed" | "invalid_occurrence_identity" | "admission_unavailable" | "unknown";
export type ScheduledLiveShadowBlocker = "scheduler_auth_missing" | "scheduler_auth_invalid" | "scheduler_auth_configuration_unavailable" | "deployment_identity_mismatch" | "deployment_configuration_conflict" | "deployment_configuration_malformed" | "deployment_platform_identity_conflict" | "deployment_platform_identity_malformed" | "canary_disabled" | "kill_switch_active" | "schedule_inactive" | "outside_market_window" | "calendar_unavailable" | "provider_unavailable" | "planner_unavailable" | "audit_contract_unavailable" | "ledger_unavailable" | "historical_usage_unavailable" | "scheduled_budget_exhausted" | "active_claim_conflict" | "unresolved_persistence_failure" | "daily_usage_unavailable" | "admission_unavailable" | "unavailable";
export type ScheduledExecutionResult = "scheduled_execution_completed" | "scheduled_execution_terminal_provider_failure" | "scheduled_execution_terminal_internal_failure" | "scheduled_execution_already_completed" | "scheduled_execution_disabled" | ScheduledLiveShadowBlocker;

export function resolveContinuousIntelligenceShadowCanaryScheduledExecutionGate(value: unknown): ScheduledExecutionGate {
  if (value === "true") return "scheduled_execution_enabled";
  if (value === "false" || value === undefined || value === null || value === "") return "scheduled_execution_disabled";
  return "scheduled_execution_configuration_unavailable";
}

export function buildContinuousIntelligenceShadowCanaryScheduledLiveShadowRequest(request: ContinuousIntelligenceShadowCanaryScheduledExecutionRequest): ScheduledLiveShadowRequest | null {
  const canonical = parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest(request);
  const lifecycle = canonical && buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(canonical);
  if (!canonical || !lifecycle) return null;
  return Object.freeze({ ...canonical, live_shadow_contract_version: continuousIntelligenceShadowCanaryScheduledLiveShadowContractVersion, execution_mode: "live_shadow", correlation_id: `scheduled_live_${lifecycle.execution_id}` });
}

export function parseContinuousIntelligenceShadowCanaryScheduledLiveShadowRequest(value: unknown): ScheduledLiveShadowRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (raw.live_shadow_contract_version !== continuousIntelligenceShadowCanaryScheduledLiveShadowContractVersion || raw.execution_mode !== "live_shadow") return null;
  const base = parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest(raw);
  const expected = base && buildContinuousIntelligenceShadowCanaryScheduledLiveShadowRequest(base);
  return expected && raw.correlation_id === expected.correlation_id ? expected : null;
}

/** Test-only injection seam. Default production routing never supplies these writers. */
export async function runContinuousIntelligenceShadowCanaryScheduledLiveShadowHarness(input: {
  request: ScheduledLiveShadowRequest | null;
  authenticated: boolean;
  authentication?: "scheduler_auth_missing" | "scheduler_auth_invalid" | "scheduler_auth_configuration_unavailable";
  gate: ScheduledExecutionGate;
  safety_ready: boolean;
  safety_blocker?: Exclude<ScheduledLiveShadowBlocker, "scheduler_auth_missing" | "scheduler_auth_invalid" | "scheduler_auth_configuration_unavailable">;
  admission: () => Promise<ScheduledAdmissionResult>;
  shared_core: () => Promise<"completed" | "provider_failure" | "internal_failure" | "unavailable">;
}): Promise<ScheduledExecutionResult> {
  if (!input.authenticated) return input.authentication ?? "scheduler_auth_invalid";
  if (!input.request) return "unavailable";
  if (!input.safety_ready) return input.safety_blocker ?? "unavailable";
  if (input.gate !== "scheduled_execution_enabled") return input.gate === "scheduled_execution_disabled" ? "scheduled_execution_disabled" : "admission_unavailable";
  const admitted = await input.admission();
  if (admitted === "already_terminal_idempotent") return "scheduled_execution_already_completed";
  if (admitted !== "admitted") {
    return admitted === "unknown" || admitted === "invalid_occurrence_identity"
      ? "unavailable"
      : admitted;
  }
  const result = await input.shared_core();
  return result === "completed" ? "scheduled_execution_completed" : result === "provider_failure" ? "scheduled_execution_terminal_provider_failure" : result === "internal_failure" ? "scheduled_execution_terminal_internal_failure" : "admission_unavailable";
}
