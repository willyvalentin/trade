import { NextResponse } from "next/server";

import {
  buildContinuousIntelligenceShadowCanaryPreflight,
  buildContinuousIntelligenceShadowCanaryLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryReceipt,
  continuousIntelligenceShadowCollectorCanaryContractVersion,
  continuousIntelligenceShadowCollectorCanaryRoutePath,
  executeContinuousIntelligenceShadowCanary,
  recheckContinuousIntelligenceShadowCanaryRuntime,
} from "@/lib/continuous-intelligence-shadow-collector-canary";
import { isBoundedShadowCollectorProofAuditEnabled } from "@/lib/bounded-shadow-collector-proof-audit-store";
import { isContinuousIntelligenceCreditLedgerEnabled } from "@/lib/continuous-intelligence-credit-ledger";
import { persistBoundedShadowCollectorProofAudit } from "@/lib/server/bounded-shadow-collector-proof-audit-persistence";
import { persistContinuousIntelligenceCreditLedger, readContinuousIntelligenceCanaryDailyUsage } from "@/lib/server/continuous-intelligence-credit-ledger-persistence";
import {
  beginContinuousIntelligenceShadowCanaryAttempt,
  claimContinuousIntelligenceShadowCanaryDailyCapacity,
  finalizeContinuousIntelligenceShadowCanaryDailyClaim,
} from "@/lib/server/continuous-intelligence-shadow-canary-claim-persistence";
import { getIntradayCandlesWithDiagnostics } from "@/lib/market-data";
import { buildUsEquityMarketCalendarEvaluation } from "@/lib/us-equity-market-calendar";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

async function emptyBody(request: Request) {
  const text = await request.text();
  return text.trim().length === 0 || text.trim() === '{"contract_version":"continuous_intelligence_shadow_collector_canary_v1"}';
}

export async function POST(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  if (!expectedSecret || request.headers.get("x-automation-secret") !== expectedSecret) {
    return json({ error: "Unauthorized.", contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion, route_path: continuousIntelligenceShadowCollectorCanaryRoutePath }, 401);
  }
  if (!(await emptyBody(request))) {
    return json({ error: "Canary accepts no execution parameters.", contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion, route_path: continuousIntelligenceShadowCollectorCanaryRoutePath, failure_category: "canary_configuration_invalid" }, 400);
  }
  const now = new Date();
  const ledgerEnabled = isContinuousIntelligenceCreditLedgerEnabled(process.env.TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED);
  const usage = ledgerEnabled
    ? await readContinuousIntelligenceCanaryDailyUsage(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString(), new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString())
    : { status: "schema_unavailable" as const, run_count: null, estimated_credits: null };
  const preflight = buildContinuousIntelligenceShadowCanaryPreflight({
    now,
    calendar: buildUsEquityMarketCalendarEvaluation(now),
    enabled_flag: process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED,
    kill_switch: process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH,
    provider_configured: Boolean(process.env.TWELVE_DATA_API_KEY),
    provider_metadata_status: process.env.TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS ?? null,
    daily_usage: usage,
  });
  if (!preflight.eligible) return json({ contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion, route_path: continuousIntelligenceShadowCollectorCanaryRoutePath, preflight, provider_calls_executed: false }, 403);
  const lifecycleIdentity = buildContinuousIntelligenceShadowCanaryLifecycleIdentity({ preflight, now });
  if (!lifecycleIdentity || !preflight.request) {
    return json({ contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion, route_path: continuousIntelligenceShadowCollectorCanaryRoutePath, preflight, failure_category: "daily_usage_unavailable", provider_calls_executed: false }, 503);
  }
  const claim = await claimContinuousIntelligenceShadowCanaryDailyCapacity({
    claim_id: lifecycleIdentity.claim_id,
    execution_id: lifecycleIdentity.execution_id,
    request_fingerprint: lifecycleIdentity.request_fingerprint,
    utc_day: lifecycleIdentity.utc_day,
    estimated_credits: 1,
  });
  if (!claim.claimed) {
    return json({ contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion, route_path: continuousIntelligenceShadowCollectorCanaryRoutePath, preflight, daily_claim: claim, provider_calls_executed: false }, claim.status === "daily_usage_unavailable" ? 503 : 429);
  }
  if (claim.claim_id !== lifecycleIdentity.claim_id) {
    return json({ contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion, route_path: continuousIntelligenceShadowCollectorCanaryRoutePath, preflight, daily_claim: claim, failure_category: "daily_usage_unavailable", provider_calls_executed: false }, 503);
  }
  const runtimeRecheck = recheckContinuousIntelligenceShadowCanaryRuntime(preflight);
  if (!runtimeRecheck.eligible) {
    return json({ contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion, route_path: continuousIntelligenceShadowCollectorCanaryRoutePath, preflight, daily_claim: claim, runtime_recheck: runtimeRecheck, provider_calls_executed: false }, 409);
  }
  const attempt = await beginContinuousIntelligenceShadowCanaryAttempt({
    claim_id: lifecycleIdentity.claim_id,
    execution_id: lifecycleIdentity.execution_id,
    request_fingerprint: lifecycleIdentity.request_fingerprint,
    expected_contract_version: lifecycleIdentity.expected_contract_version,
  });
  if (!attempt.provider_execution_allowed) {
    return json({
      contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion,
      route_path: continuousIntelligenceShadowCollectorCanaryRoutePath,
      preflight,
      daily_claim: claim,
      attempt,
      duplicate_execution: attempt.status !== "daily_usage_unavailable",
      provider_calls_executed: false,
    }, attempt.status === "daily_usage_unavailable" ? 503 : 200);
  }
  const execution = await executeContinuousIntelligenceShadowCanary({
    preflight,
    lifecycle_identity: lifecycleIdentity,
    runtime_recheck: runtimeRecheck,
    provider: async ({ ticker, interval, start, end, signal }) => {
      const response = await getIntradayCandlesWithDiagnostics(ticker, interval, start, end, { signal });
      return { provider: "twelve_data", provider_call_count: 1, estimated_credits: 1, actual_credits: null, provider_outcome: "success", provider_status: response.diagnostics.response_status === "provider_error" ? "provider_error" : response.candles.length ? "available" : "empty", provider_error_category: response.diagnostics.response_status === "provider_error" ? response.diagnostics.response_category : null, fallback_used: response.diagnostics.fallback_used, response_structurally_valid: response.diagnostics.response_structurally_valid, retry_count: response.diagnostics.retry_count, rate_limited: response.diagnostics.rate_limited, candles: response.candles };
    },
  });
  const result = execution.result;
  const finalClaimStatus = result.ok ? "completed" as const : "failed" as const;
  const finalizedClaim = await finalizeContinuousIntelligenceShadowCanaryDailyClaim({
    claim_id: lifecycleIdentity.claim_id,
    execution_id: lifecycleIdentity.execution_id,
    request_fingerprint: lifecycleIdentity.request_fingerprint,
    expected_contract_version: lifecycleIdentity.expected_contract_version,
    status: finalClaimStatus,
    provider_attempted: result.ok || result.provider_request_count === 1,
    source_receipt_id: lifecycleIdentity.source_receipt_id,
    finalized_at: new Date().toISOString(),
  });
  const receipt = buildContinuousIntelligenceShadowCanaryReceipt({
    execution,
    claim,
    claim_status: finalizedClaim.finalization_proven ? finalizedClaim.claim_status : attempt.claim_status,
    now,
  });
  if (!receipt) return json({ error: "Canary receipt was unavailable.", contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion, route_path: continuousIntelligenceShadowCollectorCanaryRoutePath }, 500);
  const audit = isBoundedShadowCollectorProofAuditEnabled(process.env.TURE_BOUNDED_PROOF_DURABLE_AUDIT_ENABLED)
    ? await persistBoundedShadowCollectorProofAudit(receipt)
    : { status: "disabled" as const, persisted: false };
  const ledger = ledgerEnabled
    ? await persistContinuousIntelligenceCreditLedger({ receipt, durable_audit: { status: audit.status, persisted: audit.persisted }, entry_kind: "scheduled_shadow_collector_canary" })
    : { status: "disabled" as const, persisted: false };
  return json({ contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion, route_path: continuousIntelligenceShadowCollectorCanaryRoutePath, preflight, daily_claim: { ...claim, attempt_status: attempt.status, finalization_status: finalizedClaim.status, finalization_proven: finalizedClaim.finalization_proven, final_status: receipt.daily_claim_status }, result: result.ok ? { ticker: receipt.ticker, interval: receipt.interval, requested_start: receipt.requested_start, requested_end: receipt.requested_end, candle_count: receipt.candle_count, first_candle_at: receipt.first_candle_at, last_candle_at: receipt.last_candle_at, provider_status_category: receipt.provider_status_category, estimated_credits: receipt.estimated_credits, actual_credits: receipt.actual_credits } : result, audit, ledger }, result.ok ? 200 : 502);
}
