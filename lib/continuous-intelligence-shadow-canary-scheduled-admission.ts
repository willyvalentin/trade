import { createHash, timingSafeEqual } from "node:crypto";

import { continuousIntelligenceCreditLedgerPolicy } from "@/lib/continuous-intelligence-credit-ledger";
import { boundedShadowCollectorExecutionProofFingerprint } from "@/lib/bounded-shadow-collector-execution-proof";
import {
  continuousIntelligenceShadowCanaryClaimContractVersion,
  type ContinuousIntelligenceShadowCanaryClaimResult,
  type ContinuousIntelligenceShadowCanaryLifecycleIdentity,
} from "@/lib/continuous-intelligence-shadow-canary-claim-store";
import {
  continuousIntelligenceShadowCanaryRuntimeDeploymentCommitEnvironmentVariable,
} from "@/lib/continuous-intelligence-shadow-canary-runtime-deployment-identity";
import { normalizeContinuousIntelligenceShadowCanaryTimestamp } from "@/lib/continuous-intelligence-shadow-canary-timestamp";

export const continuousIntelligenceShadowCanaryScheduledAdmissionContractVersion =
  "continuous_intelligence_shadow_canary_scheduled_admission_v1" as const;
export const continuousIntelligenceShadowCanaryScheduledSource = "scheduled" as const;
export const continuousIntelligenceShadowCanaryScheduledAdmissionRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/canary/scheduled-admission" as const;
export const continuousIntelligenceShadowCanarySchedulerContractVersion =
  "continuous_intelligence_shadow_canary_scheduler_v1" as const;
export const continuousIntelligenceShadowCanaryScheduledPlannerProfile =
  "continuous_intelligence_budget_plan_v1" as const;

type ScheduledMarketWindow = {
  start: string;
  end: string;
};

export type ContinuousIntelligenceShadowCanaryScheduledOccurrence = {
  deployment_commit: string;
  scheduler_contract_version: typeof continuousIntelligenceShadowCanarySchedulerContractVersion;
  market_date: string;
  market_window: ScheduledMarketWindow;
  cadence_slot: string;
  ticker: "AAPL";
  interval: "5min";
  planner_profile: typeof continuousIntelligenceShadowCanaryScheduledPlannerProfile;
  occurrence_id: string;
};

export type ContinuousIntelligenceShadowCanaryScheduledExecutionRequest =
  ContinuousIntelligenceShadowCanaryScheduledOccurrence & {
    contract_version: typeof continuousIntelligenceShadowCanaryScheduledAdmissionContractVersion;
    source: typeof continuousIntelligenceShadowCanaryScheduledSource;
    requested_at: string;
    expected_policy: {
      total_credits: 377;
      hard_reserve_credits: 57;
      normal_planned_max_credits: 320;
    };
  };

export type ContinuousIntelligenceShadowCanarySchedulerAuthentication =
  | "scheduler_auth_missing"
  | "scheduler_auth_invalid"
  | "scheduler_auth_ready";

export type ContinuousIntelligenceShadowCanaryScheduledAdmissionBlocker =
  | "scheduler_auth_missing"
  | "scheduler_auth_invalid"
  | "deployment_identity_mismatch"
  | "canary_disabled"
  | "kill_switch_active"
  | "schedule_inactive"
  | "outside_market_window"
  | "calendar_unavailable"
  | "provider_unavailable"
  | "planner_unavailable"
  | "audit_contract_unavailable"
  | "ledger_unavailable"
  | "historical_usage_unavailable"
  | "scheduled_budget_exhausted"
  | "active_claim_conflict"
  | "unresolved_persistence_failure"
  | "unavailable";

type Readiness = "ready" | "unavailable";

export type ContinuousIntelligenceShadowCanaryScheduledAdmissionInput = {
  scheduler_authentication: ContinuousIntelligenceShadowCanarySchedulerAuthentication;
  request: ContinuousIntelligenceShadowCanaryScheduledExecutionRequest | null;
  deployment_identity: "exact" | "mismatch" | "unavailable";
  canary_enabled: boolean;
  kill_switch_inactive: boolean;
  schedule_active: boolean;
  calendar: Readiness;
  market_window: "correct" | "outside" | "unavailable";
  provider: Readiness;
  planner: Readiness;
  audit_contract: Readiness;
  ledger: Readiness;
  historical_usage: Readiness;
  scheduled_budget: "available" | "exhausted" | "unavailable";
  active_claims: "clear" | "same_occurrence_active" | "conflicting_scope_active" | "unavailable";
  persistence_stop: "clear" | "audit_failed" | "ledger_failed" | "usage_mismatch" | "finalization_unproven" | "unavailable";
};

export type ContinuousIntelligenceShadowCanaryScheduledAdmissionResult = {
  contract_version: typeof continuousIntelligenceShadowCanaryScheduledAdmissionContractVersion;
  status: "admission_ready" | "blocked";
  blockers: ContinuousIntelligenceShadowCanaryScheduledAdmissionBlocker[];
  scheduler_authentication: ContinuousIntelligenceShadowCanarySchedulerAuthentication;
  shared_core_handoff: Readonly<{
    occurrence_id: string;
    deployment_commit: string;
    ticker: "AAPL";
    interval: "5min";
    requested_start: string;
    requested_end: string;
  }> | null;
  provider_calls_executed: false;
  durable_writes_executed: false;
};

export type ContinuousIntelligenceShadowCanaryScheduledSourceMetadata = Readonly<{
  source: typeof continuousIntelligenceShadowCanaryScheduledSource;
  scheduler_contract_version: typeof continuousIntelligenceShadowCanarySchedulerContractVersion;
  deployment_commit: string;
  occurrence_id: string;
  market_date: string;
  market_window: Readonly<ScheduledMarketWindow>;
  cadence_slot: string;
  ticker: "AAPL";
  interval: "5min";
  planner_profile: typeof continuousIntelligenceShadowCanaryScheduledPlannerProfile;
  policy: Readonly<{
    total_credits: 377;
    hard_reserve_credits: 57;
    normal_planned_max_credits: 320;
  }>;
}>;

export type ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity =
  ContinuousIntelligenceShadowCanaryLifecycleIdentity & {
    source: typeof continuousIntelligenceShadowCanaryScheduledSource;
    occurrence_id: string;
    source_metadata: ContinuousIntelligenceShadowCanaryScheduledSourceMetadata;
    ledger_entry_id: string;
  };

export type ContinuousIntelligenceShadowCanaryScheduledClaimAdmissionResult =
  | {
      category: "scheduled_claim_admitted";
      lifecycle_identity: ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity;
      claim_status: "claimed";
      idempotent: false;
      safe_blocker: null;
    }
  | {
      category: "scheduled_claim_already_terminal";
      lifecycle_identity: ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity;
      claim_status: "completed" | "failed";
      idempotent: true;
      safe_blocker: null;
    }
  | {
      category: "scheduled_claim_active_conflict";
      lifecycle_identity: ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity;
      claim_status: "claimed" | "attempted";
      idempotent: true;
      safe_blocker: "active_claim_conflict";
    }
  | {
      category: "scheduled_budget_exhausted";
      lifecycle_identity: ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity;
      claim_status: null;
      idempotent: false;
      safe_blocker: "scheduled_budget_exhausted";
    }
  | {
      category: "scheduled_daily_usage_unavailable";
      lifecycle_identity: ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity;
      claim_status: null;
      idempotent: false;
      safe_blocker: "historical_usage_unavailable";
    }
  | {
      category: "unknown";
      lifecycle_identity: ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity | null;
      claim_status: null;
      idempotent: false;
      safe_blocker: "unavailable";
    };

export type ContinuousIntelligenceShadowCanaryScheduledExecutionHandoff = Readonly<{
  category: "scheduled_execution_handoff_ready";
  lifecycle_identity: ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity;
  source_metadata: ContinuousIntelligenceShadowCanaryScheduledSourceMetadata;
  execution_scope: Readonly<{
    ticker: "AAPL";
    interval: "5min";
    requested_start: string;
    requested_end: string;
    max_provider_requests: 1;
    max_estimated_credits: 1;
  }>;
  provider_planner_inputs: Readonly<{
    planner_profile: typeof continuousIntelligenceShadowCanaryScheduledPlannerProfile;
    request_fingerprint: string;
    provider_execution_enabled: false;
    hard_reserve_credits: 57;
    normal_planned_max_credits: 320;
  }>;
  audit_ledger_correlation: Readonly<{
    entry_kind: "scheduled_shadow_collector_canary";
    source_receipt_id: string;
    ledger_entry_id: string;
  }>;
  provider_calls_executed: false;
  durable_writes_executed: false;
}>;

export type ContinuousIntelligenceShadowCanaryScheduledExecutionDisabledResult = Readonly<{
  category: "scheduled_execution_disabled_locally";
  handoff: ContinuousIntelligenceShadowCanaryScheduledExecutionHandoff | null;
  provider_calls_executed: false;
  durable_writes_executed: false;
  audit_writes_executed: false;
  ledger_writes_executed: false;
}>;

export type ContinuousIntelligenceShadowCanaryScheduledResultCategory =
  | "scheduled_admission_ready"
  | "scheduled_claim_admitted"
  | "scheduled_claim_already_terminal"
  | "scheduled_claim_active_conflict"
  | "scheduled_budget_exhausted"
  | "scheduled_daily_usage_unavailable"
  | "scheduled_persistence_stop_active"
  | "scheduled_execution_handoff_ready"
  | "scheduled_execution_disabled_locally"
  | "unknown";

function canonicalDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function canonicalCommit(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{40}$/.test(value) ? value : null;
}

function canonicalSlot(value: unknown) {
  return typeof value === "string" && /^regular_session_30m_[0-2]\d[0-5]\dZ$/.test(value)
    ? value
    : null;
}

function canonicalWindow(value: unknown): ScheduledMarketWindow | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const start = normalizeContinuousIntelligenceShadowCanaryTimestamp(raw.start);
  const end = normalizeContinuousIntelligenceShadowCanaryTimestamp(raw.end);
  if (!start || !end || Date.parse(end) - Date.parse(start) !== 30 * 60 * 1000) return null;
  return { start, end };
}

function slotForWindowEnd(end: string) {
  return `regular_session_30m_${end.slice(11, 13)}${end.slice(14, 16)}Z`;
}

function shortStableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function canonicalOccurrenceInput(input: Omit<ContinuousIntelligenceShadowCanaryScheduledOccurrence, "occurrence_id">) {
  const deploymentCommit = canonicalCommit(input.deployment_commit);
  const marketDate = canonicalDate(input.market_date);
  const marketWindow = canonicalWindow(input.market_window);
  const cadenceSlot = canonicalSlot(input.cadence_slot);
  if (
    !deploymentCommit ||
    !marketDate ||
    !marketWindow ||
    !cadenceSlot ||
    cadenceSlot !== slotForWindowEnd(marketWindow.end) ||
    input.scheduler_contract_version !== continuousIntelligenceShadowCanarySchedulerContractVersion ||
    input.ticker !== "AAPL" ||
    input.interval !== "5min" ||
    input.planner_profile !== continuousIntelligenceShadowCanaryScheduledPlannerProfile
  ) return null;
  return {
    deployment_commit: deploymentCommit,
    scheduler_contract_version: input.scheduler_contract_version,
    market_date: marketDate,
    market_window: marketWindow,
    cadence_slot: cadenceSlot,
    ticker: input.ticker,
    interval: input.interval,
    planner_profile: input.planner_profile,
  } as const;
}

export function buildContinuousIntelligenceShadowCanaryScheduledOccurrenceIdentity(
  input: Omit<ContinuousIntelligenceShadowCanaryScheduledOccurrence, "occurrence_id">,
): ContinuousIntelligenceShadowCanaryScheduledOccurrence | null {
  const canonical = canonicalOccurrenceInput(input);
  if (!canonical) return null;
  const identitySource = [
    canonical.deployment_commit,
    canonical.scheduler_contract_version,
    canonical.market_date,
    canonical.market_window.start,
    canonical.market_window.end,
    canonical.cadence_slot,
    canonical.ticker,
    canonical.interval,
    canonical.planner_profile,
  ].join("|");
  const occurrenceId = `scheduled_canary_occurrence_${canonical.market_date.replaceAll("-", "")}_${canonical.cadence_slot.slice(-5, -1)}_${shortStableHash(identitySource)}`;
  return Object.freeze({ ...canonical, occurrence_id: occurrenceId });
}

/**
 * Scheduled lifecycle IDs are namespaced by a deterministic occurrence. They
 * deliberately share the canonical market fingerprint with the existing core,
 * while avoiding collisions with the manual authorization namespace.
 */
export function buildContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity(
  request: ContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
): ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity | null {
  const canonical = parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest(request);
  if (!canonical) return null;
  const requestFingerprint = boundedShadowCollectorExecutionProofFingerprint({
    ticker: canonical.ticker,
    interval: canonical.interval,
    start: canonical.market_window.start,
    end: canonical.market_window.end,
  });
  const executionId = `scheduled_canary_execution_${canonical.occurrence_id}`;
  const claimId = `canary_claim_${executionId}`;
  const sourceReceiptId = `scheduled_canary_receipt_${canonical.occurrence_id}`;
  const ledgerEntryId = `credit_ledger_${sourceReceiptId}`;
  if (
    executionId.length > 128 ||
    claimId.length > 128 ||
    sourceReceiptId.length > 128 ||
    ledgerEntryId.length > 160 ||
    requestFingerprint.length > 240
  ) return null;
  const sourceMetadata = Object.freeze({
    source: continuousIntelligenceShadowCanaryScheduledSource,
    scheduler_contract_version: canonical.scheduler_contract_version,
    deployment_commit: canonical.deployment_commit,
    occurrence_id: canonical.occurrence_id,
    market_date: canonical.market_date,
    market_window: Object.freeze({ ...canonical.market_window }),
    cadence_slot: canonical.cadence_slot,
    ticker: canonical.ticker,
    interval: canonical.interval,
    planner_profile: canonical.planner_profile,
    policy: Object.freeze({ ...canonical.expected_policy }),
  });
  return Object.freeze({
    claim_id: claimId,
    execution_id: executionId,
    request_fingerprint: requestFingerprint,
    expected_contract_version: continuousIntelligenceShadowCanaryClaimContractVersion,
    utc_day: canonical.market_date,
    source_receipt_id: sourceReceiptId,
    source: continuousIntelligenceShadowCanaryScheduledSource,
    occurrence_id: canonical.occurrence_id,
    source_metadata: sourceMetadata,
    ledger_entry_id: ledgerEntryId,
  });
}

export function mapContinuousIntelligenceShadowCanaryScheduledClaimAdmission(
  lifecycleIdentity: ContinuousIntelligenceShadowCanaryScheduledLifecycleIdentity | null,
  claim: ContinuousIntelligenceShadowCanaryClaimResult | null,
): ContinuousIntelligenceShadowCanaryScheduledClaimAdmissionResult {
  if (!lifecycleIdentity || !claim) {
    return {
      category: "unknown",
      lifecycle_identity: lifecycleIdentity,
      claim_status: null,
      idempotent: false,
      safe_blocker: "unavailable",
    };
  }
  if (claim.claimed && !claim.idempotent && claim.claim_status === "claimed") {
    return { category: "scheduled_claim_admitted", lifecycle_identity: lifecycleIdentity, claim_status: "claimed", idempotent: false, safe_blocker: null };
  }
  if (claim.claimed && claim.idempotent && (claim.claim_status === "completed" || claim.claim_status === "failed")) {
    return { category: "scheduled_claim_already_terminal", lifecycle_identity: lifecycleIdentity, claim_status: claim.claim_status, idempotent: true, safe_blocker: null };
  }
  if (claim.claimed && claim.idempotent && (claim.claim_status === "claimed" || claim.claim_status === "attempted")) {
    return { category: "scheduled_claim_active_conflict", lifecycle_identity: lifecycleIdentity, claim_status: claim.claim_status, idempotent: true, safe_blocker: "active_claim_conflict" };
  }
  if (!claim.claimed && (claim.status === "daily_run_limit_reached" || claim.status === "daily_credit_limit_reached")) {
    return { category: "scheduled_budget_exhausted", lifecycle_identity: lifecycleIdentity, claim_status: null, idempotent: false, safe_blocker: "scheduled_budget_exhausted" };
  }
  if (!claim.claimed && claim.status === "daily_usage_unavailable") {
    return { category: "scheduled_daily_usage_unavailable", lifecycle_identity: lifecycleIdentity, claim_status: null, idempotent: false, safe_blocker: "historical_usage_unavailable" };
  }
  return { category: "unknown", lifecycle_identity: lifecycleIdentity, claim_status: null, idempotent: false, safe_blocker: "unavailable" };
}

export function buildContinuousIntelligenceShadowCanaryScheduledExecutionHandoff(input: {
  request: ContinuousIntelligenceShadowCanaryScheduledExecutionRequest;
  admission: ContinuousIntelligenceShadowCanaryScheduledClaimAdmissionResult;
}): ContinuousIntelligenceShadowCanaryScheduledExecutionHandoff | null {
  if (input.admission.category !== "scheduled_claim_admitted") return null;
  const lifecycle = input.admission.lifecycle_identity;
  const request = parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest(input.request);
  if (!request || lifecycle.occurrence_id !== request.occurrence_id) return null;
  return Object.freeze({
    category: "scheduled_execution_handoff_ready",
    lifecycle_identity: lifecycle,
    source_metadata: lifecycle.source_metadata,
    execution_scope: Object.freeze({
      ticker: request.ticker,
      interval: request.interval,
      requested_start: request.market_window.start,
      requested_end: request.market_window.end,
      max_provider_requests: 1,
      max_estimated_credits: 1,
    }),
    provider_planner_inputs: Object.freeze({
      planner_profile: request.planner_profile,
      request_fingerprint: lifecycle.request_fingerprint,
      provider_execution_enabled: false,
      hard_reserve_credits: request.expected_policy.hard_reserve_credits,
      normal_planned_max_credits: request.expected_policy.normal_planned_max_credits,
    }),
    audit_ledger_correlation: Object.freeze({
      entry_kind: "scheduled_shadow_collector_canary",
      source_receipt_id: lifecycle.source_receipt_id,
      ledger_entry_id: lifecycle.ledger_entry_id,
    }),
    provider_calls_executed: false,
    durable_writes_executed: false,
  });
}

export function buildContinuousIntelligenceShadowCanaryScheduledExecutionDisabledResult(
  handoff: ContinuousIntelligenceShadowCanaryScheduledExecutionHandoff | null,
): ContinuousIntelligenceShadowCanaryScheduledExecutionDisabledResult {
  return Object.freeze({
    category: "scheduled_execution_disabled_locally",
    handoff,
    provider_calls_executed: false,
    durable_writes_executed: false,
    audit_writes_executed: false,
    ledger_writes_executed: false,
  });
}

export function buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest(input: {
  deployment_commit: string | null;
  market_date: string;
  market_window: ScheduledMarketWindow;
  requested_at: string;
}): ContinuousIntelligenceShadowCanaryScheduledExecutionRequest | null {
  const occurrence = buildContinuousIntelligenceShadowCanaryScheduledOccurrenceIdentity({
    deployment_commit: input.deployment_commit ?? "",
    scheduler_contract_version: continuousIntelligenceShadowCanarySchedulerContractVersion,
    market_date: input.market_date,
    market_window: input.market_window,
    cadence_slot: slotForWindowEnd(input.market_window.end),
    ticker: "AAPL",
    interval: "5min",
    planner_profile: continuousIntelligenceShadowCanaryScheduledPlannerProfile,
  });
  const requestedAt = normalizeContinuousIntelligenceShadowCanaryTimestamp(input.requested_at);
  if (!occurrence || !requestedAt || Date.parse(requestedAt) < Date.parse(occurrence.market_window.end)) return null;
  return Object.freeze({
    contract_version: continuousIntelligenceShadowCanaryScheduledAdmissionContractVersion,
    source: continuousIntelligenceShadowCanaryScheduledSource,
    ...occurrence,
    requested_at: requestedAt,
    expected_policy: {
      total_credits: continuousIntelligenceCreditLedgerPolicy.total_credits,
      hard_reserve_credits: continuousIntelligenceCreditLedgerPolicy.hard_reserve_credits,
      normal_planned_max_credits: continuousIntelligenceCreditLedgerPolicy.normal_planned_max_credits,
    } as const,
  });
}

const forbiddenRequestKeys = new Set([
  "secret",
  "scheduler_secret",
  "authorization",
  "authorization_header",
  "token",
  "manual_authorization_id",
  "manual_authorization_token",
]);

export function parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest(
  value: unknown,
): ContinuousIntelligenceShadowCanaryScheduledExecutionRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (Object.keys(raw).some((key) => forbiddenRequestKeys.has(key))) return null;
  const occurrence = buildContinuousIntelligenceShadowCanaryScheduledOccurrenceIdentity({
    deployment_commit: raw.deployment_commit as string,
    scheduler_contract_version: raw.scheduler_contract_version as typeof continuousIntelligenceShadowCanarySchedulerContractVersion,
    market_date: raw.market_date as string,
    market_window: raw.market_window as ScheduledMarketWindow,
    cadence_slot: raw.cadence_slot as string,
    ticker: raw.ticker as "AAPL",
    interval: raw.interval as "5min",
    planner_profile: raw.planner_profile as typeof continuousIntelligenceShadowCanaryScheduledPlannerProfile,
  });
  const requestedAt = normalizeContinuousIntelligenceShadowCanaryTimestamp(raw.requested_at);
  const policy = raw.expected_policy;
  if (
    !occurrence ||
    raw.contract_version !== continuousIntelligenceShadowCanaryScheduledAdmissionContractVersion ||
    raw.source !== continuousIntelligenceShadowCanaryScheduledSource ||
    raw.occurrence_id !== occurrence.occurrence_id ||
    !requestedAt ||
    Date.parse(requestedAt) < Date.parse(occurrence.market_window.end) ||
    !policy || typeof policy !== "object" || Array.isArray(policy) ||
    (policy as Record<string, unknown>).total_credits !== 377 ||
    (policy as Record<string, unknown>).hard_reserve_credits !== 57 ||
    (policy as Record<string, unknown>).normal_planned_max_credits !== 320
  ) return null;
  return Object.freeze({
    contract_version: continuousIntelligenceShadowCanaryScheduledAdmissionContractVersion,
    source: continuousIntelligenceShadowCanaryScheduledSource,
    ...occurrence,
    requested_at: requestedAt,
    expected_policy: { total_credits: 377, hard_reserve_credits: 57, normal_planned_max_credits: 320 } as const,
  });
}

function secretDigest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function evaluateContinuousIntelligenceShadowCanarySchedulerAuthentication(
  expectedSecret: string | undefined,
  suppliedSecret: string | null,
): ContinuousIntelligenceShadowCanarySchedulerAuthentication {
  if (!expectedSecret || !suppliedSecret) return "scheduler_auth_missing";
  return timingSafeEqual(secretDigest(expectedSecret), secretDigest(suppliedSecret))
    ? "scheduler_auth_ready"
    : "scheduler_auth_invalid";
}

export function buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight(
  input: ContinuousIntelligenceShadowCanaryScheduledAdmissionInput,
): ContinuousIntelligenceShadowCanaryScheduledAdmissionResult {
  const blockers: ContinuousIntelligenceShadowCanaryScheduledAdmissionBlocker[] = [];
  if (input.scheduler_authentication !== "scheduler_auth_ready") blockers.push(input.scheduler_authentication);
  if (!input.request || input.deployment_identity !== "exact") blockers.push("deployment_identity_mismatch");
  if (!input.canary_enabled) blockers.push("canary_disabled");
  if (!input.kill_switch_inactive) blockers.push("kill_switch_active");
  if (!input.schedule_active) blockers.push("schedule_inactive");
  if (input.calendar !== "ready") blockers.push("calendar_unavailable");
  if (input.market_window !== "correct") blockers.push(input.market_window === "outside" ? "outside_market_window" : "calendar_unavailable");
  if (input.provider !== "ready") blockers.push("provider_unavailable");
  if (input.planner !== "ready") blockers.push("planner_unavailable");
  if (input.audit_contract !== "ready") blockers.push("audit_contract_unavailable");
  if (input.ledger !== "ready") blockers.push("ledger_unavailable");
  if (input.historical_usage !== "ready") blockers.push("historical_usage_unavailable");
  if (input.scheduled_budget === "exhausted") blockers.push("scheduled_budget_exhausted");
  if (input.scheduled_budget === "unavailable") blockers.push("historical_usage_unavailable");
  if (input.active_claims !== "clear") blockers.push(input.active_claims === "unavailable" ? "unavailable" : "active_claim_conflict");
  if (input.persistence_stop !== "clear") blockers.push(input.persistence_stop === "unavailable" ? "unavailable" : "unresolved_persistence_failure");
  const uniqueBlockers = [...new Set(blockers)];
  const scheduledRequest = input.request;
  const ready = uniqueBlockers.length === 0 && scheduledRequest !== null;
  const sharedCoreHandoff = !ready || scheduledRequest === null
    ? null
    : Object.freeze({
        occurrence_id: scheduledRequest.occurrence_id,
        deployment_commit: scheduledRequest.deployment_commit,
        ticker: scheduledRequest.ticker,
        interval: scheduledRequest.interval,
        requested_start: scheduledRequest.market_window.start,
        requested_end: scheduledRequest.market_window.end,
      });
  return {
    contract_version: continuousIntelligenceShadowCanaryScheduledAdmissionContractVersion,
    status: ready ? "admission_ready" : "blocked",
    blockers: uniqueBlockers,
    scheduler_authentication: input.scheduler_authentication,
    shared_core_handoff: sharedCoreHandoff,
    provider_calls_executed: false,
    durable_writes_executed: false,
  };
}

export function mapContinuousIntelligenceShadowCanaryScheduledPreflightCategory(
  admission: ContinuousIntelligenceShadowCanaryScheduledAdmissionResult,
): ContinuousIntelligenceShadowCanaryScheduledResultCategory {
  if (admission.status === "admission_ready") return "scheduled_admission_ready";
  if (admission.blockers.includes("scheduled_budget_exhausted")) return "scheduled_budget_exhausted";
  if (admission.blockers.includes("historical_usage_unavailable")) return "scheduled_daily_usage_unavailable";
  if (admission.blockers.includes("active_claim_conflict")) return "scheduled_claim_active_conflict";
  if (admission.blockers.includes("unresolved_persistence_failure")) return "scheduled_persistence_stop_active";
  return "unknown";
}

export const continuousIntelligenceShadowCanaryScheduledAdmissionEnvironment = {
  deployment_commit: continuousIntelligenceShadowCanaryRuntimeDeploymentCommitEnvironmentVariable,
  schedule_declared: "TURE_SHADOW_CANARY_SCHEDULE_DECLARED",
  remote_schedule_active: "TURE_SHADOW_CANARY_REMOTE_SCHEDULE_ACTIVE",
  future_frequency_selected: "TURE_SHADOW_CANARY_FUTURE_FREQUENCY_SELECTED",
  duplicate_schedule_present: "TURE_SHADOW_CANARY_DUPLICATE_SCHEDULE_PRESENT",
} as const;
