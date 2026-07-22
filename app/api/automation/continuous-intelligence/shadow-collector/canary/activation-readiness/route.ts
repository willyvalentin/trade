import { NextResponse } from "next/server";

import { buildBoundedShadowCollectorExecutionProofPlan } from "@/lib/bounded-shadow-collector-execution-proof";
import {
  buildContinuousIntelligenceShadowCanaryActivationReadiness,
  buildContinuousIntelligenceShadowCanaryMarketCalendarReadinessFacts,
  continuousIntelligenceShadowCanaryActivationReadinessContractVersion,
  continuousIntelligenceShadowCanaryActivationReadinessRoutePath,
  normalizeContinuousIntelligenceShadowCanaryDeploymentSignal,
  isContinuousIntelligenceShadowCanaryReadinessAuthenticated,
  normalizeContinuousIntelligenceShadowCanaryProviderBudgetStatus,
  normalizeContinuousIntelligenceShadowCanaryReadinessFlag,
} from "@/lib/continuous-intelligence-shadow-canary-activation-readiness";
import {
  continuousIntelligenceCreditLedgerPolicy,
} from "@/lib/continuous-intelligence-credit-ledger";
import { readContinuousIntelligenceShadowCanarySchemaReadiness } from "@/lib/server/continuous-intelligence-shadow-canary-activation-readiness";
import {
  continuousIntelligenceDeploymentManifest,
  continuousIntelligenceDeploymentManifestContractVersion,
  continuousIntelligenceShadowCanaryFunctionBuildMarker,
} from "@/lib/server/continuous-intelligence-deployment-manifest";
import { buildUsEquityMarketCalendarEvaluation } from "@/lib/us-equity-market-calendar";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

export async function GET(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const suppliedSecret = request.headers.get("x-automation-secret");
  if (!isContinuousIntelligenceShadowCanaryReadinessAuthenticated(expectedSecret, suppliedSecret)) {
    return json({
      error: "Unauthorized.",
      contract_version: continuousIntelligenceShadowCanaryActivationReadinessContractVersion,
      route_path: continuousIntelligenceShadowCanaryActivationReadinessRoutePath,
    }, 401);
  }
  if (new URL(request.url).search.length > 0 || request.body !== null) {
    return json({
      error: "Activation readiness accepts no parameters or request body.",
      contract_version: continuousIntelligenceShadowCanaryActivationReadinessContractVersion,
      route_path: continuousIntelligenceShadowCanaryActivationReadinessRoutePath,
      failure_category: "validation_failed",
    }, 400);
  }

  const now = new Date();
  const providerMetadataStatus = normalizeContinuousIntelligenceShadowCanaryProviderBudgetStatus(
    process.env.TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS,
  );
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
  const schema = await readContinuousIntelligenceShadowCanarySchemaReadiness();
  const marketCalendar = buildUsEquityMarketCalendarEvaluation(now);
  const routePaths = continuousIntelligenceDeploymentManifest.route_paths;
  const functionFoundationPresent = continuousIntelligenceDeploymentManifest.function_foundations.some(
    (foundation) =>
      foundation.source_path === "netlify/functions/scheduled-shadow-collector-canary.ts" &&
      foundation.build_marker === continuousIntelligenceShadowCanaryFunctionBuildMarker,
  );
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
        continuousIntelligenceDeploymentManifest.expected_contract_versions.durable_audit === "bounded_shadow_collector_proof_audit_v1" &&
        continuousIntelligenceDeploymentManifest.expected_contract_versions.credit_ledger === "continuous_intelligence_credit_ledger_v1" &&
        continuousIntelligenceDeploymentManifest.expected_contract_versions.daily_claim === "continuous_intelligence_shadow_canary_daily_claim_v1" &&
        continuousIntelligenceDeploymentManifest.expected_contract_versions.canary === "continuous_intelligence_shadow_collector_canary_v1" &&
        continuousIntelligenceDeploymentManifest.expected_contract_versions.activation_readiness === continuousIntelligenceShadowCanaryActivationReadinessContractVersion,
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
    market_calendar:
      buildContinuousIntelligenceShadowCanaryMarketCalendarReadinessFacts(
        marketCalendar,
      ),
    schedule: {
      function_foundation_present: functionFoundationPresent,
      repository_schedule_declaration: continuousIntelligenceDeploymentManifest.repository_schedule_declaration,
      deployment_schedule_declaration: normalizeContinuousIntelligenceShadowCanaryDeploymentSignal(process.env.TURE_SHADOW_CANARY_SCHEDULE_DECLARED),
      remote_schedule_active: normalizeContinuousIntelligenceShadowCanaryDeploymentSignal(process.env.TURE_SHADOW_CANARY_REMOTE_SCHEDULE_ACTIVE),
      duplicate_schedule_mechanism: normalizeContinuousIntelligenceShadowCanaryDeploymentSignal(process.env.TURE_SHADOW_CANARY_DUPLICATE_SCHEDULE_PRESENT),
      future_frequency_selection: normalizeContinuousIntelligenceShadowCanaryDeploymentSignal(process.env.TURE_SHADOW_CANARY_FUTURE_FREQUENCY_SELECTED),
    },
    manual_canary_evidence_verified: false,
  });

  return json({
    contract_version: continuousIntelligenceShadowCanaryActivationReadinessContractVersion,
    route_path: continuousIntelligenceShadowCanaryActivationReadinessRoutePath,
    readiness,
  });
}
