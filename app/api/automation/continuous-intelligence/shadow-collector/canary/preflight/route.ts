import { NextResponse } from "next/server";

import {
  buildContinuousIntelligenceShadowCanaryPreflight,
  continuousIntelligenceShadowCollectorCanaryContractVersion,
  continuousIntelligenceShadowCollectorCanaryPreflightRoutePath,
} from "@/lib/continuous-intelligence-shadow-collector-canary";
import { isContinuousIntelligenceCreditLedgerEnabled } from "@/lib/continuous-intelligence-credit-ledger";
import { readContinuousIntelligenceCanaryDailyUsage } from "@/lib/server/continuous-intelligence-credit-ledger-persistence";

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
  const usage = isContinuousIntelligenceCreditLedgerEnabled(process.env.TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED)
    ? await readContinuousIntelligenceCanaryDailyUsage(
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString(),
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString(),
      )
    : { status: "schema_unavailable" as const, run_count: null, estimated_credits: null };
  const result = buildContinuousIntelligenceShadowCanaryPreflight({
    now,
    // No server-side holiday verification source is wired in this action.
    calendar: { available: false, is_regular_trading_day: false },
    enabled_flag: process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED,
    kill_switch: process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH,
    provider_configured: Boolean(process.env.TWELVE_DATA_API_KEY),
    provider_metadata_status: process.env.TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS ?? null,
    daily_usage: usage,
  });
  return json({ contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion, route_path: continuousIntelligenceShadowCollectorCanaryPreflightRoutePath, result }, result.eligible ? 200 : 403);
}
