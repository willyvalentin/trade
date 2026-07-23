import {
  continuousIntelligenceShadowCanaryScheduledSource,
  type ContinuousIntelligenceShadowCanaryScheduledAdmissionResult,
  type ContinuousIntelligenceShadowCanaryScheduledExecutionHandoff,
  type ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity,
} from "@/lib/continuous-intelligence-shadow-canary-scheduled-admission";
import type { ContinuousIntelligenceShadowCanaryUsageAccounting } from "@/lib/continuous-intelligence-shadow-canary-usage-accounting";

export const continuousIntelligenceShadowCanaryScheduledExecutionPolicyVersion =
  "continuous_intelligence_shadow_canary_scheduled_execution_policy_v1" as const;

export const continuousIntelligenceShadowCanaryScheduledExecutionPolicy = Object.freeze({
  policy_version: continuousIntelligenceShadowCanaryScheduledExecutionPolicyVersion,
  total_daily_credit_ceiling: 377,
  hard_reserve_credits: 57,
  scheduled_normal_max_credits: 320,
  max_scheduled_attempts_per_utc_day: 2,
  max_scheduled_credits_per_utc_day: 2,
  max_provider_calls_per_invocation: 1,
  max_concurrent_scheduled_claims: 1,
  max_claims_per_market_window: 1,
  allowed_market_window: "completed_regular_session_30m",
  allowed_ticker_scope: ["AAPL"] as const,
  allowed_interval: "5min",
  publication_enabled: false,
  trade_execution_enabled: false,
  reserve_consumption_enabled: false,
  provider_failure_retry_enabled: false,
} as const);

export type ContinuousIntelligenceShadowCanaryScheduledExecutionPolicy =
  typeof continuousIntelligenceShadowCanaryScheduledExecutionPolicy;

export type ContinuousIntelligenceShadowCanaryScheduledBudgetStatus =
  | "scheduled_budget_ready"
  | "scheduled_attempt_limit_reached"
  | "scheduled_credit_limit_reached"
  | "scheduled_window_limit_reached"
  | "scheduled_concurrency_limit_reached"
  | "reserve_protected"
  | "usage_disagreement"
  | "historical_usage_unavailable"
  | "unknown";

export type ContinuousIntelligenceShadowCanaryScheduledPersistenceGuard =
  | "clean"
  | "unresolved_finalization_failure"
  | "unresolved_audit_failure"
  | "unresolved_ledger_failure"
  | "unresolved_usage_mismatch"
  | "persistence_state_unavailable";

export type ContinuousIntelligenceShadowCanaryScheduledPersistenceStopState =
  | "clear"
  | "finalization_unproven"
  | "audit_failed"
  | "ledger_failed"
  | "usage_mismatch"
  | "unavailable";

export type ContinuousIntelligenceShadowCanaryScheduledRetryDecision =
  | "admit_new_occurrence"
  | "block_active_occurrence"
  | "return_terminal_completed"
  | "return_terminal_provider_failure"
  | "block_provider_failure_retry_disabled"
  | "block_internal_or_persistence_failure"
  | "require_fresh_admission";

export type ContinuousIntelligenceShadowCanaryScheduledExecutionCapability = Readonly<{
  scheduled_execution_enabled: boolean;
  source: "server_internal";
}>;

export const disabledContinuousIntelligenceShadowCanaryScheduledExecutionCapability = Object.freeze({
  scheduled_execution_enabled: false,
  source: "server_internal",
} as const);

export type ContinuousIntelligenceShadowCanaryScheduledExecutionCorrelation = Readonly<{
  source: typeof continuousIntelligenceShadowCanaryScheduledSource;
  policy_version: typeof continuousIntelligenceShadowCanaryScheduledExecutionPolicyVersion;
  deployment_commit: string;
  occurrence_id: string;
  claim_id: string;
  execution_id: string;
  provider_request_identity: string;
  audit_receipt_id: string;
  ledger_receipt_id: string;
  market_window: Readonly<{ start: string; end: string }>;
}>;

export type ContinuousIntelligenceShadowCanaryScheduledSafetyEnvelope = Readonly<{
  policy_status: "valid" | "invalid";
  budget_status: ContinuousIntelligenceShadowCanaryScheduledBudgetStatus;
  persistence_guard: ContinuousIntelligenceShadowCanaryScheduledPersistenceGuard;
  execution_enabled: boolean;
  final_dry_decision:
    | "scheduled_execution_handoff_ready"
    | "scheduled_execution_disabled_locally"
    | "scheduled_execution_blocked";
  provider_calls_executed: false;
  durable_writes_executed: false;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExactPolicy(value: unknown): value is ContinuousIntelligenceShadowCanaryScheduledExecutionPolicy {
  if (!isRecord(value)) return false;
  const canonical = continuousIntelligenceShadowCanaryScheduledExecutionPolicy;
  return JSON.stringify(value) === JSON.stringify(canonical);
}

/** Only the canonical server policy is accepted; callers cannot tune it. */
export function parseContinuousIntelligenceShadowCanaryScheduledExecutionPolicy(
  value: unknown,
): ContinuousIntelligenceShadowCanaryScheduledExecutionPolicy | null {
  return isExactPolicy(value) ? continuousIntelligenceShadowCanaryScheduledExecutionPolicy : null;
}

export function serializeContinuousIntelligenceShadowCanaryScheduledExecutionPolicy(
  policy: ContinuousIntelligenceShadowCanaryScheduledExecutionPolicy,
) {
  return isExactPolicy(policy) ? JSON.stringify(continuousIntelligenceShadowCanaryScheduledExecutionPolicy) : null;
}

export function evaluateContinuousIntelligenceShadowCanaryScheduledBudget(input: {
  policy: ContinuousIntelligenceShadowCanaryScheduledExecutionPolicy | null;
  usage: ContinuousIntelligenceShadowCanaryUsageAccounting;
  invocation: {
    provider_calls: number;
    estimated_credits: number;
    active_scheduled_claims: number;
    scheduled_claims_for_market_window: number;
  };
}): ContinuousIntelligenceShadowCanaryScheduledBudgetStatus {
  const policy = input.policy;
  if (!policy || input.usage.status !== "available") return "historical_usage_unavailable";
  const { scheduled_shadow_collector_canary: scheduled, bounded_manual_proof: manual, total_ledger: total, claim_capacity: capacity } = input.usage;
  if (!scheduled || !manual || !total || !capacity) return "historical_usage_unavailable";
  const values = [
    input.invocation.provider_calls,
    input.invocation.estimated_credits,
    input.invocation.active_scheduled_claims,
    input.invocation.scheduled_claims_for_market_window,
    scheduled.attempts,
    scheduled.estimated_credits,
    manual.attempts,
    manual.estimated_credits,
    total.attempts,
    total.estimated_credits,
    capacity.attempts,
    capacity.estimated_credits,
  ];
  if (!values.every((value) => Number.isInteger(value) && value >= 0)) return "unknown";
  if (
    total.attempts !== scheduled.attempts + manual.attempts ||
    total.estimated_credits !== scheduled.estimated_credits + manual.estimated_credits ||
    capacity.attempts !== total.attempts ||
    capacity.estimated_credits !== total.estimated_credits
  ) return "usage_disagreement";
  if (input.invocation.provider_calls !== 1 || input.invocation.estimated_credits !== 1) return "unknown";
  if (input.invocation.provider_calls > policy.max_provider_calls_per_invocation) return "unknown";
  if (input.invocation.active_scheduled_claims >= policy.max_concurrent_scheduled_claims) {
    return "scheduled_concurrency_limit_reached";
  }
  if (input.invocation.scheduled_claims_for_market_window >= policy.max_claims_per_market_window) {
    return "scheduled_window_limit_reached";
  }
  if (
    policy.reserve_consumption_enabled ||
    total.estimated_credits + input.invocation.estimated_credits > policy.scheduled_normal_max_credits ||
    total.estimated_credits + input.invocation.estimated_credits > policy.total_daily_credit_ceiling - policy.hard_reserve_credits
  ) return "reserve_protected";
  if (scheduled.attempts >= policy.max_scheduled_attempts_per_utc_day || capacity.attempts >= policy.max_scheduled_attempts_per_utc_day) {
    return "scheduled_attempt_limit_reached";
  }
  if (
    scheduled.estimated_credits + input.invocation.estimated_credits > policy.max_scheduled_credits_per_utc_day ||
    capacity.estimated_credits + input.invocation.estimated_credits > policy.max_scheduled_credits_per_utc_day
  ) return "scheduled_credit_limit_reached";
  return "scheduled_budget_ready";
}

export function resolveContinuousIntelligenceShadowCanaryScheduledPersistenceGuard(
  admission: ContinuousIntelligenceShadowCanaryScheduledAdmissionResult,
): ContinuousIntelligenceShadowCanaryScheduledPersistenceGuard {
  if (admission.blockers.includes("unresolved_persistence_failure")) return "unresolved_finalization_failure";
  if (admission.blockers.includes("unavailable")) return "persistence_state_unavailable";
  return "clean";
}

export function mapContinuousIntelligenceShadowCanaryScheduledPersistenceStop(
  state: ContinuousIntelligenceShadowCanaryScheduledPersistenceStopState,
): ContinuousIntelligenceShadowCanaryScheduledPersistenceGuard {
  switch (state) {
    case "clear":
      return "clean";
    case "finalization_unproven":
      return "unresolved_finalization_failure";
    case "audit_failed":
      return "unresolved_audit_failure";
    case "ledger_failed":
      return "unresolved_ledger_failure";
    case "usage_mismatch":
      return "unresolved_usage_mismatch";
    case "unavailable":
      return "persistence_state_unavailable";
  }
}

export function buildContinuousIntelligenceShadowCanaryScheduledExecutionCorrelation(
  lifecycle: ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity | null,
): ContinuousIntelligenceShadowCanaryScheduledExecutionCorrelation | null {
  if (!lifecycle || lifecycle.source !== "scheduled") return null;
  return Object.freeze({
    source: continuousIntelligenceShadowCanaryScheduledSource,
    policy_version: continuousIntelligenceShadowCanaryScheduledExecutionPolicyVersion,
    deployment_commit: lifecycle.source_metadata.deployment_commit,
    occurrence_id: lifecycle.occurrence_id,
    claim_id: lifecycle.claim_id,
    execution_id: lifecycle.execution_id,
    provider_request_identity: lifecycle.request_fingerprint,
    audit_receipt_id: lifecycle.source_receipt_id,
    ledger_receipt_id: lifecycle.ledger_entry_id,
    market_window: Object.freeze({ ...lifecycle.source_metadata.market_window }),
  });
}

export function evaluateContinuousIntelligenceShadowCanaryScheduledRetry(input: {
  same_occurrence: boolean;
  claim_state: "unadmitted" | "claimed" | "attempted" | "completed" | "provider_failed" | "internal_failed" | "persistence_failed";
  deployment_changed: boolean;
  policy: ContinuousIntelligenceShadowCanaryScheduledExecutionPolicy | null;
}): ContinuousIntelligenceShadowCanaryScheduledRetryDecision {
  if (!input.policy) return "block_internal_or_persistence_failure";
  if (input.deployment_changed) return "require_fresh_admission";
  if (!input.same_occurrence || input.claim_state === "unadmitted") return "admit_new_occurrence";
  if (input.claim_state === "claimed" || input.claim_state === "attempted") return "block_active_occurrence";
  if (input.claim_state === "completed") return "return_terminal_completed";
  if (input.claim_state === "provider_failed") {
    return input.policy.provider_failure_retry_enabled
      ? "return_terminal_provider_failure"
      : "block_provider_failure_retry_disabled";
  }
  return "block_internal_or_persistence_failure";
}

export function evaluateContinuousIntelligenceShadowCanaryScheduledSafetyEnvelope(input: {
  admission: ContinuousIntelligenceShadowCanaryScheduledAdmissionResult;
  policy: ContinuousIntelligenceShadowCanaryScheduledExecutionPolicy | null;
  budget_status: ContinuousIntelligenceShadowCanaryScheduledBudgetStatus;
  persistence_guard: ContinuousIntelligenceShadowCanaryScheduledPersistenceGuard;
  capability: ContinuousIntelligenceShadowCanaryScheduledExecutionCapability;
  handoff: ContinuousIntelligenceShadowCanaryScheduledExecutionHandoff | null;
}): ContinuousIntelligenceShadowCanaryScheduledSafetyEnvelope {
  const policyStatus = input.policy ? "valid" : "invalid";
  const allGatesReady =
    input.admission.status === "admission_ready" &&
    input.budget_status === "scheduled_budget_ready" &&
    input.persistence_guard === "clean";
  return Object.freeze({
    policy_status: policyStatus,
    budget_status: input.budget_status,
    persistence_guard: input.persistence_guard,
    execution_enabled: input.capability.scheduled_execution_enabled === true,
    final_dry_decision: !allGatesReady
      ? "scheduled_execution_blocked"
      : !input.capability.scheduled_execution_enabled
        ? "scheduled_execution_disabled_locally"
        : input.handoff
          ? "scheduled_execution_handoff_ready"
          : "scheduled_execution_blocked",
    provider_calls_executed: false,
    durable_writes_executed: false,
  });
}
