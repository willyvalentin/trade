import { NextResponse } from "next/server";

import {
  continuousIntelligenceShadowCanaryUsageAccountingRoutePath,
  resolveContinuousIntelligenceShadowCanaryUsageAccountingDate,
} from "@/lib/continuous-intelligence-shadow-canary-usage-accounting";
import { readContinuousIntelligenceShadowCanaryUsageAccounting } from "@/lib/server/continuous-intelligence-shadow-canary-usage-accounting";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

export async function GET(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  if (!expectedSecret || request.headers.get("x-automation-secret") !== expectedSecret) {
    return json({ error: "Unauthorized.", route_path: continuousIntelligenceShadowCanaryUsageAccountingRoutePath }, 401);
  }
  const parameters = new URL(request.url).searchParams;
  const requestedDates = parameters.getAll("utc_date");
  if (
    request.body !== null ||
    [...parameters.keys()].some((key) => key !== "utc_date") ||
    requestedDates.length > 1
  ) {
    return json({
      error: "Invalid usage-accounting query.",
      route_path: continuousIntelligenceShadowCanaryUsageAccountingRoutePath,
      failure_category: "invalid_utc_date",
    }, 400);
  }
  const date = resolveContinuousIntelligenceShadowCanaryUsageAccountingDate({
    requested_utc_date: requestedDates[0] ?? null,
  });
  if (!date.ok) {
    return json({
      error: "Invalid usage-accounting date.",
      route_path: continuousIntelligenceShadowCanaryUsageAccountingRoutePath,
      failure_category: date.category,
    }, 400);
  }
  const usageAccounting = await readContinuousIntelligenceShadowCanaryUsageAccounting(date);
  return json({
    route_path: continuousIntelligenceShadowCanaryUsageAccountingRoutePath,
    queried_utc_date: date.utc_day,
    usage_accounting: usageAccounting,
    provider_calls_executed: false,
    durable_writes_executed: false,
    schedule_changes: false,
  }, usageAccounting.status === "available" ? 200 : 503);
}
