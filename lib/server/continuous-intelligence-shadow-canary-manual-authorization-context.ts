import "server-only";

import { buildBoundedShadowCollectorExecutionProofPlan } from "@/lib/bounded-shadow-collector-execution-proof";
import { continuousIntelligenceCreditLedgerPolicy, isContinuousIntelligenceCreditLedgerEnabled } from "@/lib/continuous-intelligence-credit-ledger";
import {
  buildContinuousIntelligenceShadowCanaryActivationReadiness,
  buildContinuousIntelligenceShadowCanaryMarketCalendarReadinessFacts,
  normalizeContinuousIntelligenceShadowCanaryDeploymentSignal,
  normalizeContinuousIntelligenceShadowCanaryProviderBudgetStatus,
  normalizeContinuousIntelligenceShadowCanaryReadinessFlag,
} from "@/lib/continuous-intelligence-shadow-canary-activation-readiness";
import {
  buildContinuousIntelligenceShadowCanaryLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryPreflight,
  continuousIntelligenceShadowCollectorCanaryLimits,
} from "@/lib/continuous-intelligence-shadow-collector-canary";
import { readContinuousIntelligenceCanaryDailyUsage } from "@/lib/server/continuous-intelligence-credit-ledger-persistence";
import { readContinuousIntelligenceShadowCanarySchemaReadiness } from "@/lib/server/continuous-intelligence-shadow-canary-activation-readiness";
import { resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit } from "@/lib/continuous-intelligence-shadow-canary-runtime-deployment-identity";
import {
  continuousIntelligenceDeploymentManifest,
  continuousIntelligenceDeploymentManifestContractVersion,
  continuousIntelligenceShadowCanaryFunctionBuildMarker,
} from "@/lib/server/continuous-intelligence-deployment-manifest";
import {
  buildUsEquityMarketCalendarEvaluation,
  usEquityMarketCalendarValidation,
} from "@/lib/us-equity-market-calendar";

function utcDayBounds(now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

function scheduleFacts() {
  return {
    function_foundation_present: true,
    repository_schedule_declaration: continuousIntelligenceDeploymentManifest.repository_schedule_declaration,
    deployment_schedule_declaration: normalizeContinuousIntelligenceShadowCanaryDeploymentSignal(process.env.TURE_SHADOW_CANARY_SCHEDULE_DECLARED),
    remote_schedule_active: normalizeContinuousIntelligenceShadowCanaryDeploymentSignal(process.env.TURE_SHADOW_CANARY_REMOTE_SCHEDULE_ACTIVE),
    duplicate_schedule_mechanism: normalizeContinuousIntelligenceShadowCanaryDeploymentSignal(process.env.TURE_SHADOW_CANARY_DUPLICATE_SCHEDULE_PRESENT),
    future_frequency_selection: normalizeContinuousIntelligenceShadowCanaryDeploymentSignal(process.env.TURE_SHADOW_CANARY_FUTURE_FREQUENCY_SELECTED),
  } as const;
}

export async function buildContinuousIntelligenceShadowCanaryManualAuthorizationContext(now = new Date()) {
  const providerMetadataStatus = normalizeContinuousIntelligenceShadowCanaryProviderBudgetStatus(
    process.env.TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS,
  );
  const ledgerEnabled = isContinuousIntelligenceCreditLedgerEnabled(
    process.env.TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED,
  );
  const bounds = utcDayBounds(now);
  const dailyUsage = ledgerEnabled
    ? await readContinuousIntelligenceCanaryDailyUsage(bounds.start, bounds.end)
    : { status: "schema_unavailable" as const, run_count: null, estimated_credits: null };
  const calendar = buildUsEquityMarketCalendarEvaluation(now);
  const proofPlan = buildBoundedShadowCollectorExecutionProofPlan({
    now,
    provider_metadata_status: providerMetadataStatus === "unresolved" ? null : providerMetadataStatus,
    proof_ticker: "AAPL",
  }).budget_plan;
  const normalAuthorization = proofPlan.workloads.find((workload) =>
    workload.kind !== "execution_ready_opportunity_monitoring" &&
    !workload.protected_capacity &&
    workload.allocated_credits >= 1 &&
    workload.allocated_symbols.includes("AAPL"),
  );
  const routePaths = continuousIntelligenceDeploymentManifest.route_paths;
  const functionFoundationPresent = continuousIntelligenceDeploymentManifest.function_foundations.some(
    (foundation) => foundation.source_path === "netlify/functions/scheduled-shadow-collector-canary.ts" && foundation.build_marker === continuousIntelligenceShadowCanaryFunctionBuildMarker,
  );
  const schedule = scheduleFacts();
  const schema = await readContinuousIntelligenceShadowCanarySchemaReadiness();
  const readiness = buildContinuousIntelligenceShadowCanaryActivationReadiness({
    now,
    deployment: {
      audit_route_present: routePaths.includes("/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/audits"),
      ledger_route_present: routePaths.includes("/api/automation/continuous-intelligence/credit-ledger"),
      ledger_reconcile_route_present: routePaths.includes("/api/automation/continuous-intelligence/credit-ledger/reconcile"),
      canary_route_present: routePaths.includes("/api/automation/continuous-intelligence/shadow-collector/canary"),
      canary_preflight_route_present: routePaths.includes("/api/automation/continuous-intelligence/shadow-collector/canary/preflight"),
      canary_function_foundation_present: functionFoundationPresent,
      expected_contract_versions_present:
        continuousIntelligenceDeploymentManifest.contract_version === continuousIntelligenceDeploymentManifestContractVersion &&
        continuousIntelligenceDeploymentManifest.expected_contract_versions.canary === "continuous_intelligence_shadow_collector_canary_v1",
    },
    schema,
    flags: {
      durable_audit: normalizeContinuousIntelligenceShadowCanaryReadinessFlag(process.env.TURE_BOUNDED_PROOF_DURABLE_AUDIT_ENABLED),
      credit_ledger: normalizeContinuousIntelligenceShadowCanaryReadinessFlag(process.env.TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED),
      canary: normalizeContinuousIntelligenceShadowCanaryReadinessFlag(process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED),
      kill_switch: normalizeContinuousIntelligenceShadowCanaryReadinessFlag(process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH),
    },
    provider_budget: {
      provider_configured: Boolean(process.env.TWELVE_DATA_API_KEY),
      metadata_status: providerMetadataStatus,
      policy_total_credits: proofPlan.policy.total_credits,
      policy_hard_reserve_credits: proofPlan.policy.hard_reserve_credits,
      policy_normal_planned_max_credits: proofPlan.policy.normal_planned_max_credits,
      one_credit_normal_allocation_authorized: Boolean(normalAuthorization),
      hard_reserve_preserved:
        proofPlan.policy.total_credits === continuousIntelligenceCreditLedgerPolicy.total_credits &&
        proofPlan.allocation.reserved_credits === continuousIntelligenceCreditLedgerPolicy.hard_reserve_credits &&
        proofPlan.allocation.planned_max_credits === continuousIntelligenceCreditLedgerPolicy.normal_planned_max_credits &&
        proofPlan.allocation.normal_planned_limit_respected,
      execution_ready_reserve_consumed: false,
    },
    market_calendar: buildContinuousIntelligenceShadowCanaryMarketCalendarReadinessFacts(calendar),
    schedule: { ...schedule, function_foundation_present: functionFoundationPresent },
    manual_canary_evidence_verified: false,
  });
  const preflight = buildContinuousIntelligenceShadowCanaryPreflight({
    now,
    calendar,
    enabled_flag: process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED,
    kill_switch: process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH,
    provider_configured: Boolean(process.env.TWELVE_DATA_API_KEY),
    provider_metadata_status: providerMetadataStatus === "unresolved" ? null : providerMetadataStatus,
    daily_usage: dailyUsage,
  });
  const lifecycleIdentity = buildContinuousIntelligenceShadowCanaryLifecycleIdentity({ preflight, now });
  const preflightStaticBlockersAreOnlyDisabledState =
    preflight.blockers.length === 2 &&
    preflight.blockers.includes("canary_disabled") &&
    preflight.blockers.includes("canary_kill_switch_active");
  const scheduleAbsent = Object.values(schedule).every((value) => value === "absent" || value === true);
  return {
    now,
    readiness,
    preflight,
    lifecycle_identity: lifecycleIdentity,
    calendar_fingerprint:
      usEquityMarketCalendarValidation.status === "verified"
        ? usEquityMarketCalendarValidation.computed_fingerprint
        : null,
    deployment_commit: resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit(process.env),
    deployment_build_marker: continuousIntelligenceShadowCanaryFunctionBuildMarker,
    schedule_absent: scheduleAbsent,
    preflight_static_blockers_are_only_disabled_state: preflightStaticBlockersAreOnlyDisabledState,
    daily_capacity_available:
      dailyUsage.status === "available" &&
      dailyUsage.run_count !== null &&
      dailyUsage.estimated_credits !== null &&
      dailyUsage.run_count < continuousIntelligenceShadowCollectorCanaryLimits.max_runs_per_utc_day &&
      dailyUsage.estimated_credits < continuousIntelligenceShadowCollectorCanaryLimits.max_estimated_credits_per_utc_day,
    provider_budget_resolved: providerMetadataStatus === "within_budget" || providerMetadataStatus === "approaching_limit",
    canary_disabled: !preflight.blockers.includes("canary_disabled") ? false : true,
    kill_switch_active: !preflight.blockers.includes("canary_kill_switch_active") ? false : true,
  } as const;
}
