import { NextResponse } from "next/server";

import {
  buildContinuousIntelligenceShadowCanaryPreflight,
  continuousIntelligenceShadowCollectorCanaryContractVersion,
  continuousIntelligenceShadowCollectorCanaryPreflightRoutePath,
} from "@/lib/continuous-intelligence-shadow-collector-canary";
import { isContinuousIntelligenceCreditLedgerEnabled } from "@/lib/continuous-intelligence-credit-ledger";
import { readContinuousIntelligenceCanaryDailyUsage } from "@/lib/server/continuous-intelligence-credit-ledger-persistence";
import { readContinuousIntelligenceShadowCanaryUsageAccounting } from "@/lib/server/continuous-intelligence-shadow-canary-usage-accounting";
import { buildUsEquityMarketCalendarEvaluation } from "@/lib/us-equity-market-calendar";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

export async function POST(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  if (!expectedSecret || request.headers.get("x-automation-secret") !== expectedSecret) {
    return json({ error: "Unauthorized.", contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion, route_path: continuousIntelligenceShadowCollectorCanaryPreflightRoutePath }, 401);
  }
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
  const usageEnabled = isContinuousIntelligenceCreditLedgerEnabled(process.env.TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED);
  const [usage, usageAccounting] = await Promise.all([
    usageEnabled
      ? readContinuousIntelligenceCanaryDailyUsage(start, end)
      : Promise.resolve({ status: "schema_unavailable" as const, run_count: null, estimated_credits: null }),
    readContinuousIntelligenceShadowCanaryUsageAccounting({
      utc_day: now.toISOString().slice(0, 10),
      start,
      end,
    }),
  ]);
  const result = buildContinuousIntelligenceShadowCanaryPreflight({
    now,
    calendar: buildUsEquityMarketCalendarEvaluation(now),
    enabled_flag: process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED,
    kill_switch: process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH,
    provider_configured: Boolean(process.env.TWELVE_DATA_API_KEY),
    provider_metadata_status: process.env.TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS ?? null,
    daily_usage: usage,
  });
  return json({
    contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion,
    route_path: continuousIntelligenceShadowCollectorCanaryPreflightRoutePath,
    result,
    usage_accounting: usageAccounting,
  }, result.eligible ? 200 : 403);
}
