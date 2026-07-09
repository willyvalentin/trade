import { NextResponse } from "next/server";

import {
  executeFirstTinyHistoricalFetchApprovedNoPersistAttempt,
} from "@/lib/first-tiny-historical-fetch-approved-no-persist-attempt";

export const dynamic = "force-dynamic";

type FirstTinyFetchRouteBody = {
  execute_provider_call?: unknown;
  ticker?: unknown;
  provider?: unknown;
  endpoint?: unknown;
  interval?: unknown;
  trading_day?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  date?: unknown;
};

async function parseBody(request: Request): Promise<FirstTinyFetchRouteBody> {
  try {
    const text = await request.text();
    if (!text.trim()) return {};
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as FirstTinyFetchRouteBody)
      : {};
  } catch {
    return {};
  }
}

function hasArbitraryScopeOverride(body: FirstTinyFetchRouteBody) {
  return [
    body.ticker,
    body.provider,
    body.endpoint,
    body.interval,
    body.trading_day,
    body.start_date,
    body.end_date,
    body.date,
  ].some((value) => value !== undefined);
}

export async function POST(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const providedSecret = request.headers.get("x-automation-secret");
  const authenticated = Boolean(
    expectedSecret && providedSecret === expectedSecret,
  );

  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await parseBody(request);

  if (body.execute_provider_call !== true) {
    return NextResponse.json(
      {
        error: "execute_provider_call_true_required",
        provider_call_executed: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
      },
      { status: 400 },
    );
  }

  if (hasArbitraryScopeOverride(body)) {
    return NextResponse.json(
      {
        error: "arbitrary_scope_override_rejected",
        provider_call_executed: false,
        candles_persisted: false,
        fetch_run_persisted: false,
        replay_executed: false,
        scanner_behavior_changed: false,
      },
      { status: 400 },
    );
  }

  const result = await executeFirstTinyHistoricalFetchApprovedNoPersistAttempt({
    execute_provider_call: true,
  });

  return NextResponse.json(result);
}
