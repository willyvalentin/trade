import { createHash } from "node:crypto";

import {
  buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity,
  evaluateContinuousIntelligenceShadowCanarySchedulerAuthentication,
  parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
  type ContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
} from "@/lib/continuous-intelligence-shadow-canary-scheduled-admission";
import type { ContinuousIntelligenceShadowCanaryScheduledDeploymentBinding } from "@/lib/continuous-intelligence-shadow-canary-runtime-deployment-identity";
import {
  continuousIntelligenceShadowCanaryScheduledExecutionPolicyVersion,
  type ContinuousIntelligenceShadowCanaryScheduledBudgetStatus,
  type ContinuousIntelligenceShadowCanaryScheduledPersistenceGuard,
} from "@/lib/continuous-intelligence-shadow-canary-scheduled-execution-safety";

export const continuousIntelligenceShadowCanaryScheduledDryRunContractVersion =
  "continuous_intelligence_shadow_canary_scheduled_dry_run_v1" as const;
export const continuousIntelligenceShadowCanaryScheduledDryRunRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-dry-run" as const;

export type ScheduledDryRunAuthentication =
  | "scheduler_auth_missing"
  | "scheduler_auth_invalid"
  | "scheduler_auth_configuration_unavailable"
  | "scheduler_auth_ready";

export type ContinuousIntelligenceShadowCanaryScheduledDryRunRequest =
  ContinuousIntelligenceShadowCanaryScheduledExecutionRequest & {
    dry_run_contract_version: typeof continuousIntelligenceShadowCanaryScheduledDryRunContractVersion;
    execution_mode: "dry_run";
    policy_version: typeof continuousIntelligenceShadowCanaryScheduledExecutionPolicyVersion;
  };

export type ScheduledDryRunDependencies = {
  deployment: ContinuousIntelligenceShadowCanaryScheduledDeploymentBinding;
  scheduled_execution_enabled: boolean;
  canary: "ready" | "blocked" | "unavailable";
  kill_switch: "ready" | "blocked" | "unavailable";
  schedule: "ready" | "blocked" | "unavailable";
  calendar_window: "ready" | "blocked" | "unavailable";
  provider_planner: "ready" | "blocked" | "unavailable";
  audit_ledger: "ready" | "blocked" | "unavailable";
  historical_usage: "ready" | "unavailable";
  budget: ContinuousIntelligenceShadowCanaryScheduledBudgetStatus;
  persistence: ContinuousIntelligenceShadowCanaryScheduledPersistenceGuard;
  active_claim: "clear" | "conflict" | "unavailable";
  retry: "eligible" | "ineligible" | "unavailable";
  correlation: "consistent" | "inconsistent" | "unavailable";
};

export type ScheduledDryRunBlocker =
  | ScheduledDryRunAuthentication
  | "request_contract_invalid" | "deployment_identity_mismatch" | "deployment_configuration_conflict"
  | "deployment_configuration_malformed" | "deployment_platform_identity_conflict"
  | "deployment_platform_identity_malformed" | "scheduled_execution_feature_disabled"
  | "canary_disabled" | "kill_switch_active" | "schedule_inactive" | "calendar_or_window_unavailable"
  | "provider_or_planner_unavailable" | "audit_or_ledger_unavailable" | "historical_usage_unavailable"
  | "scheduled_budget_blocked" | "reserve_protected" | "persistence_stop_active"
  | "active_claim_conflict" | "retry_ineligible" | "correlation_inconsistent" | "unavailable";

export type ScheduledDryRunEvidence = Readonly<{
  evidence_contract_version: typeof continuousIntelligenceShadowCanaryScheduledDryRunContractVersion;
  deployed_commit: string | null;
  occurrence_id: string | null;
  correlation_id: string | null;
  market_date: string | null;
  market_window: { start: string; end: string } | null;
  scheduled_slot: string | null;
  ticker_scope: "AAPL" | null;
  interval: "5min" | null;
  policy_version: typeof continuousIntelligenceShadowCanaryScheduledExecutionPolicyVersion;
  authentication: ScheduledDryRunAuthentication;
  first_blocker: ScheduledDryRunBlocker | null;
  blockers: ScheduledDryRunBlocker[];
  readiness_stage: "authentication" | "request_contract" | "safety_envelope" | "dry_run_barrier";
  hypothetical_admission_eligible: boolean;
  execution_barrier: "dry_run_only";
  provider_calls: 0; claims_created: 0; audit_writes: 0; ledger_writes: 0; usage_mutations: 0;
  generated_at: string;
}>;

function exactKeys(value: Record<string, unknown>, expected: string[]) {
  const keys = Object.keys(value);
  return keys.length === expected.length && expected.every((key) => keys.includes(key));
}

const requestKeys = ["contract_version", "source", "deployment_commit", "scheduler_contract_version", "market_date", "market_window", "cadence_slot", "ticker", "interval", "planner_profile", "occurrence_id", "requested_at", "expected_policy", "dry_run_contract_version", "execution_mode", "policy_version"];

export function buildContinuousIntelligenceShadowCanaryScheduledDryRunRequest(
  request: ContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
): ContinuousIntelligenceShadowCanaryScheduledDryRunRequest | null {
  const canonical = parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest(request);
  if (!canonical) return null;
  return Object.freeze({ ...canonical, dry_run_contract_version: continuousIntelligenceShadowCanaryScheduledDryRunContractVersion, execution_mode: "dry_run", policy_version: continuousIntelligenceShadowCanaryScheduledExecutionPolicyVersion });
}

export function parseContinuousIntelligenceShadowCanaryScheduledDryRunRequest(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (!exactKeys(raw, requestKeys) || raw.dry_run_contract_version !== continuousIntelligenceShadowCanaryScheduledDryRunContractVersion || raw.execution_mode !== "dry_run" || raw.policy_version !== continuousIntelligenceShadowCanaryScheduledExecutionPolicyVersion) return null;
  const canonical = parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest(raw);
  return canonical ? buildContinuousIntelligenceShadowCanaryScheduledDryRunRequest(canonical) : null;
}

export function evaluateContinuousIntelligenceShadowCanaryScheduledDryRunAuthentication(expected: string | undefined, supplied: string | null): ScheduledDryRunAuthentication {
  if (!expected) return "scheduler_auth_configuration_unavailable";
  const result = evaluateContinuousIntelligenceShadowCanarySchedulerAuthentication(expected, supplied);
  return result === "scheduler_auth_ready" ? result : result === "scheduler_auth_missing" ? result : "scheduler_auth_invalid";
}

function correlationId(request: ContinuousIntelligenceShadowCanaryScheduledDryRunRequest) {
  const lifecycle = buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(request);
  return lifecycle ? `scheduled_dry_run_${createHash("sha256").update(lifecycle.execution_id).digest("hex").slice(0, 16)}` : null;
}

export function evaluateContinuousIntelligenceShadowCanaryScheduledDryRun(input: {
  authentication: ScheduledDryRunAuthentication;
  request: ContinuousIntelligenceShadowCanaryScheduledDryRunRequest | null;
  dependencies: ScheduledDryRunDependencies | null;
  now?: Date;
}): ScheduledDryRunEvidence {
  const request = input.request;
  const blockers: ScheduledDryRunBlocker[] = [];
  let stage: ScheduledDryRunEvidence["readiness_stage"] = "authentication";
  if (input.authentication !== "scheduler_auth_ready") blockers.push(input.authentication);
  if (!request) blockers.push("request_contract_invalid");
  const d = input.dependencies;
  if (blockers.length === 0 && !d) blockers.push("unavailable");
  if (blockers.length === 0 && d) {
    stage = "safety_envelope";
    if (d.deployment !== "exact") {
      switch (d.deployment) {
        case "mismatch":
        case "request_mismatch": blockers.push("deployment_identity_mismatch"); break;
        case "explicit_configuration_conflict": blockers.push("deployment_configuration_conflict"); break;
        case "explicit_configuration_malformed": blockers.push("deployment_configuration_malformed"); break;
        case "platform_identity_conflict": blockers.push("deployment_platform_identity_conflict"); break;
        case "platform_identity_malformed": blockers.push("deployment_platform_identity_malformed"); break;
        default: blockers.push("unavailable");
      }
    }
    if (!d.scheduled_execution_enabled) blockers.push("scheduled_execution_feature_disabled");
    if (d.canary !== "ready") blockers.push(d.canary === "blocked" ? "canary_disabled" : "unavailable");
    if (d.kill_switch !== "ready") blockers.push(d.kill_switch === "blocked" ? "kill_switch_active" : "unavailable");
    if (d.schedule !== "ready") blockers.push(d.schedule === "blocked" ? "schedule_inactive" : "unavailable");
    if (d.calendar_window !== "ready") blockers.push(d.calendar_window === "blocked" ? "calendar_or_window_unavailable" : "unavailable");
    if (d.provider_planner !== "ready") blockers.push(d.provider_planner === "blocked" ? "provider_or_planner_unavailable" : "unavailable");
    if (d.audit_ledger !== "ready") blockers.push(d.audit_ledger === "blocked" ? "audit_or_ledger_unavailable" : "unavailable");
    if (d.historical_usage !== "ready") blockers.push("historical_usage_unavailable");
    if (d.budget !== "scheduled_budget_ready") blockers.push(d.budget === "reserve_protected" ? "reserve_protected" : d.budget === "historical_usage_unavailable" ? "historical_usage_unavailable" : "scheduled_budget_blocked");
    if (d.persistence !== "clean") blockers.push(d.persistence === "persistence_state_unavailable" ? "unavailable" : "persistence_stop_active");
    if (d.active_claim !== "clear") blockers.push(d.active_claim === "conflict" ? "active_claim_conflict" : "unavailable");
    if (d.retry !== "eligible") blockers.push(d.retry === "ineligible" ? "retry_ineligible" : "unavailable");
    if (d.correlation !== "consistent") blockers.push(d.correlation === "inconsistent" ? "correlation_inconsistent" : "unavailable");
  }
  const unique = [...new Set(blockers)];
  const eligible = unique.length === 0;
  if (eligible) stage = "dry_run_barrier";
  return Object.freeze({ evidence_contract_version: continuousIntelligenceShadowCanaryScheduledDryRunContractVersion, deployed_commit: request?.deployment_commit ?? null, occurrence_id: request?.occurrence_id ?? null, correlation_id: request ? correlationId(request) : null, market_date: request?.market_date ?? null, market_window: request ? { ...request.market_window } : null, scheduled_slot: request?.cadence_slot ?? null, ticker_scope: request?.ticker ?? null, interval: request?.interval ?? null, policy_version: continuousIntelligenceShadowCanaryScheduledExecutionPolicyVersion, authentication: input.authentication, first_blocker: unique[0] ?? null, blockers: unique, readiness_stage: stage, hypothetical_admission_eligible: eligible, execution_barrier: "dry_run_only", provider_calls: 0, claims_created: 0, audit_writes: 0, ledger_writes: 0, usage_mutations: 0, generated_at: (input.now ?? new Date()).toISOString() });
}
