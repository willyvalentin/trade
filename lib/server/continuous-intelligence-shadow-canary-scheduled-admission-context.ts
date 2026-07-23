import "server-only";

import { isBoundedShadowCollectorProofAuditEnabled } from "@/lib/bounded-shadow-collector-proof-audit-store";
import { boundedShadowCollectorProofAuditTableName } from "@/lib/bounded-shadow-collector-proof-audit-contract";
import { isContinuousIntelligenceCreditLedgerEnabled, continuousIntelligenceCreditLedgerTableName } from "@/lib/continuous-intelligence-credit-ledger";
import {
  buildContinuousIntelligenceShadowCanaryPreflight,
  isContinuousIntelligenceShadowCanaryEnabled,
  isContinuousIntelligenceShadowCanaryKillSwitchOff,
} from "@/lib/continuous-intelligence-shadow-collector-canary";
import { continuousIntelligenceShadowCanaryClaimTableName } from "@/lib/continuous-intelligence-shadow-canary-claim-store";
import {
  buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight,
  buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
  continuousIntelligenceShadowCanaryScheduledAdmissionEnvironment,
  type ContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
} from "@/lib/continuous-intelligence-shadow-canary-scheduled-admission";
import { resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit } from "@/lib/continuous-intelligence-shadow-canary-runtime-deployment-identity";
import { readContinuousIntelligenceCanaryDailyUsage } from "@/lib/server/continuous-intelligence-credit-ledger-persistence";
import { readContinuousIntelligenceShadowCanarySchemaReadiness } from "@/lib/server/continuous-intelligence-shadow-canary-activation-readiness";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { buildUsEquityMarketCalendarEvaluation } from "@/lib/us-equity-market-calendar";

function utcBounds(now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return { utc_day: start.toISOString().slice(0, 10), start: start.toISOString(), end: end.toISOString() };
}

function isPresent(value: unknown) {
  return value === "true" || value === "1";
}

function isAbsent(value: unknown) {
  return value === "false" || value === "0";
}

function isScheduledExecutionId(value: unknown) {
  return typeof value === "string" && (
    value.startsWith("canary_execution_") || value.startsWith("scheduled_canary_execution_")
  );
}

type ScheduledDurableState = {
  active_claims: "clear" | "same_occurrence_active" | "conflicting_scope_active" | "unavailable";
  persistence_stop: "clear" | "audit_failed" | "ledger_failed" | "usage_mismatch" | "finalization_unproven" | "unavailable";
  active_scheduled_claims: number | null;
  scheduled_claims_for_market_window: number | null;
};

function unavailableScheduledDurableState(): ScheduledDurableState {
  return {
    active_claims: "unavailable",
    persistence_stop: "unavailable",
    active_scheduled_claims: null,
    scheduled_claims_for_market_window: null,
  };
}

export async function readContinuousIntelligenceShadowCanaryScheduledDurableState(input: {
  utc_day: string;
  start: string;
  end: string;
  occurrence_id: string | null;
  request_fingerprint: string | null;
}): Promise<ScheduledDurableState> {
  const supabase = getServerSupabaseClient();
  if (!supabase.client) {
    return unavailableScheduledDurableState();
  }
  try {
    const [claims, audits, ledger] = await Promise.all([
      supabase.client
        .from(continuousIntelligenceShadowCanaryClaimTableName)
        .select("claim_id,execution_id,request_fingerprint,status,source_receipt_id")
        .eq("utc_day", input.utc_day),
      supabase.client
        .from(boundedShadowCollectorProofAuditTableName)
        .select("receipt_id,daily_claim_id,daily_claim_status")
        .eq("entry_kind", "scheduled_shadow_collector_canary")
        .gte("generated_at", input.start)
        .lt("generated_at", input.end),
      supabase.client
        .from(continuousIntelligenceCreditLedgerTableName)
        .select("source_receipt_id")
        .eq("entry_kind", "scheduled_shadow_collector_canary")
        .gte("generated_at", input.start)
        .lt("generated_at", input.end),
    ]);
    if (claims.error || audits.error || ledger.error || claims.data === null || audits.data === null || ledger.data === null) {
      return unavailableScheduledDurableState();
    }
    const scheduledClaims = claims.data.filter((claim) => isScheduledExecutionId(claim.execution_id));
    const active = scheduledClaims.filter((claim) => claim.status === "claimed" || claim.status === "attempted");
    const expectedExecutionId = input.occurrence_id
      ? `scheduled_canary_execution_${input.occurrence_id}`
      : null;
    const activeClaims = active.some((claim) => claim.execution_id === expectedExecutionId)
      ? "same_occurrence_active"
      : active.length > 0
        ? "conflicting_scope_active"
        : "clear";
    const scheduledClaimsForMarketWindow = input.request_fingerprint
      ? scheduledClaims.filter((claim) => claim.request_fingerprint === input.request_fingerprint).length
      : null;
    const terminal = scheduledClaims.filter((claim) => claim.status === "completed" || claim.status === "failed");
    if (terminal.some((claim) => !claim.source_receipt_id)) {
      return { active_claims: activeClaims, persistence_stop: "finalization_unproven", active_scheduled_claims: active.length, scheduled_claims_for_market_window: scheduledClaimsForMarketWindow };
    }
    const auditClaimIds = new Set(audits.data.map((audit) => audit.daily_claim_id));
    if (terminal.some((claim) => !auditClaimIds.has(claim.claim_id))) {
      return { active_claims: activeClaims, persistence_stop: "audit_failed", active_scheduled_claims: active.length, scheduled_claims_for_market_window: scheduledClaimsForMarketWindow };
    }
    const ledgerReceipts = new Set(ledger.data.map((entry) => entry.source_receipt_id));
    if (terminal.some((claim) => !ledgerReceipts.has(claim.source_receipt_id))) {
      return { active_claims: activeClaims, persistence_stop: "ledger_failed", active_scheduled_claims: active.length, scheduled_claims_for_market_window: scheduledClaimsForMarketWindow };
    }
    if (terminal.length !== audits.data.length || terminal.length !== ledger.data.length) {
      return { active_claims: activeClaims, persistence_stop: "usage_mismatch", active_scheduled_claims: active.length, scheduled_claims_for_market_window: scheduledClaimsForMarketWindow };
    }
    return { active_claims: activeClaims, persistence_stop: "clear", active_scheduled_claims: active.length, scheduled_claims_for_market_window: scheduledClaimsForMarketWindow };
  } catch {
    return unavailableScheduledDurableState();
  }
}

export async function buildContinuousIntelligenceShadowCanaryScheduledAdmissionContext(input: {
  request: ContinuousIntelligenceShadowCanaryScheduledExecutionRequest | null;
  scheduler_authentication: "scheduler_auth_missing" | "scheduler_auth_invalid" | "scheduler_auth_ready";
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const bounds = utcBounds(now);
  const calendar = buildUsEquityMarketCalendarEvaluation(now);
  const deploymentCommit = resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit(process.env);
  const ledgerEnabled = isContinuousIntelligenceCreditLedgerEnabled(process.env.TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED);
  const dailyUsage = ledgerEnabled
    ? await readContinuousIntelligenceCanaryDailyUsage(bounds.start, bounds.end)
    : { status: "schema_unavailable" as const, run_count: null, estimated_credits: null };
  const preflight = buildContinuousIntelligenceShadowCanaryPreflight({
    now,
    calendar,
    enabled_flag: process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED,
    kill_switch: process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH,
    provider_configured: Boolean(process.env.TWELVE_DATA_API_KEY),
    provider_metadata_status: process.env.TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS ?? null,
    daily_usage: dailyUsage,
  });
  const expected = preflight.request
    ? buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest({
        deployment_commit: deploymentCommit,
        market_date: calendar.market_date ?? "",
        market_window: { start: preflight.request.start, end: preflight.request.end },
        requested_at: now.toISOString(),
      })
    : null;
  const [schema, durableState] = await Promise.all([
    readContinuousIntelligenceShadowCanarySchemaReadiness(),
    readContinuousIntelligenceShadowCanaryScheduledDurableState({
      ...bounds,
      occurrence_id: input.request?.occurrence_id ?? null,
      request_fingerprint: input.request
        ? `${input.request.ticker}|${input.request.interval}|${input.request.market_window.start}|${input.request.market_window.end}`
        : null,
    }),
  ]);
  const requestMatchesExpected = Boolean(
    input.request && expected &&
    input.request.occurrence_id === expected.occurrence_id &&
    input.request.market_window.start === expected.market_window.start &&
    input.request.market_window.end === expected.market_window.end,
  );
  const scheduleActive =
    isPresent(process.env[continuousIntelligenceShadowCanaryScheduledAdmissionEnvironment.schedule_declared]) &&
    isPresent(process.env[continuousIntelligenceShadowCanaryScheduledAdmissionEnvironment.remote_schedule_active]) &&
    isPresent(process.env[continuousIntelligenceShadowCanaryScheduledAdmissionEnvironment.future_frequency_selected]) &&
    isAbsent(process.env[continuousIntelligenceShadowCanaryScheduledAdmissionEnvironment.duplicate_schedule_present]);
  const providerReady =
    Boolean(process.env.TWELVE_DATA_API_KEY) &&
    (process.env.TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS === "within_budget" ||
      process.env.TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS === "approaching_limit");
  const plannerReady = preflight.planner_authorization !== null;
  const auditReady =
    isBoundedShadowCollectorProofAuditEnabled(process.env.TURE_BOUNDED_PROOF_DURABLE_AUDIT_ENABLED) &&
    schema.probe_status === "available" &&
    schema.audit_table_available === true &&
    schema.audit_canary_entry_kind_constrained === true &&
    schema.audit_no_effect_constraint_available === true;
  const ledgerReady =
    ledgerEnabled &&
    schema.probe_status === "available" &&
    schema.ledger_table_available === true &&
    schema.ledger_canary_entry_kind_constrained === true &&
    schema.ledger_zero_reserve_constraint_available === true;
  return buildContinuousIntelligenceShadowCanaryScheduledAdmissionPreflight({
    scheduler_authentication: input.scheduler_authentication,
    request: input.request,
    deployment_identity: input.request && deploymentCommit === input.request.deployment_commit ? "exact" : deploymentCommit ? "mismatch" : "unavailable",
    canary_enabled: isContinuousIntelligenceShadowCanaryEnabled(process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED),
    kill_switch_inactive: isContinuousIntelligenceShadowCanaryKillSwitchOff(process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH),
    schedule_active: scheduleActive,
    calendar: calendar.verification_status === "verified" && (calendar.freshness_status === "current" || calendar.freshness_status === "expiring_soon") ? "ready" : "unavailable",
    market_window: requestMatchesExpected ? "correct" : expected ? "outside" : "unavailable",
    provider: providerReady ? "ready" : "unavailable",
    planner: plannerReady ? "ready" : "unavailable",
    audit_contract: auditReady ? "ready" : "unavailable",
    ledger: ledgerReady ? "ready" : "unavailable",
    historical_usage: dailyUsage.status === "available" && dailyUsage.run_count !== null && dailyUsage.estimated_credits !== null ? "ready" : "unavailable",
    scheduled_budget:
      dailyUsage.status !== "available" || dailyUsage.run_count === null || dailyUsage.estimated_credits === null
        ? "unavailable"
        : dailyUsage.run_count >= 2 || dailyUsage.estimated_credits >= 2
          ? "exhausted"
          : "available",
    active_claims: durableState.active_claims,
    persistence_stop: durableState.persistence_stop,
  });
}
