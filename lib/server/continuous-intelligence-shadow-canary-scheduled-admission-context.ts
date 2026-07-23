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
import {
  evaluateContinuousIntelligenceShadowCanaryScheduledDeploymentBinding,
  resolveContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity,
} from "@/lib/continuous-intelligence-shadow-canary-runtime-deployment-identity";
import {
  evaluateContinuousIntelligenceShadowCanaryScheduledDurableState,
  type ContinuousIntelligenceShadowCanaryScheduledDurableState,
} from "@/lib/continuous-intelligence-shadow-canary-scheduled-durable-state";
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

export async function readContinuousIntelligenceShadowCanaryScheduledDurableState(input: {
  utc_day: string;
  start: string;
  end: string;
  occurrence_id: string | null;
  request_fingerprint: string | null;
}): Promise<ContinuousIntelligenceShadowCanaryScheduledDurableState> {
  const supabase = getServerSupabaseClient();
  if (!supabase.client) {
    return evaluateContinuousIntelligenceShadowCanaryScheduledDurableState({ claims: null, audits: null, ledger: null, ...input });
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
    return evaluateContinuousIntelligenceShadowCanaryScheduledDurableState({
      claims: claims.error ? null : claims.data,
      audits: audits.error ? null : audits.data,
      ledger: ledger.error ? null : ledger.data,
      ...input,
    });
  } catch {
    return evaluateContinuousIntelligenceShadowCanaryScheduledDurableState({ claims: null, audits: null, ledger: null, ...input });
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
  const runtimeDeploymentIdentity = resolveContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity(process.env);
  const deploymentCommit = runtimeDeploymentIdentity.deployment_commit;
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
    deployment_identity: evaluateContinuousIntelligenceShadowCanaryScheduledDeploymentBinding({
      runtime: runtimeDeploymentIdentity,
      request_deployment_commit: input.request?.deployment_commit ?? null,
    }),
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
