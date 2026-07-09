import { NextResponse } from "next/server";

import {
  executeFirstTinyHistoricalFetchApprovedNoPersistAttempt,
} from "@/lib/first-tiny-historical-fetch-approved-no-persist-attempt";

export const dynamic = "force-dynamic";

type FirstTinyFetchRouteBody = {
  execute_provider_call?: unknown;
  auth_check_only?: unknown;
  ticker?: unknown;
  provider?: unknown;
  endpoint?: unknown;
  interval?: unknown;
  trading_day?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  date?: unknown;
};

function secretText(value: string | null | undefined) {
  return value ?? "";
}

function buildAuthDiagnostics(input: {
  expectedSecret: string | undefined;
  providedSecret: string | null;
}) {
  const expected = secretText(input.expectedSecret);
  const provided = secretText(input.providedSecret);

  return {
    env_name_used: "AUTOMATION_SECRET",
    server_secret_present: expected.length > 0,
    server_secret_length: expected.length,
    header_name_used: "x-automation-secret",
    header_present: input.providedSecret !== null,
    header_length: provided.length,
    header_matches: expected.length > 0 && provided === expected,
    trimmed_header_matches:
      expected.length > 0 && provided.trim() === expected.trim(),
    runtime: "server",
    diagnostics_safe: true,
  };
}

const noEffectResponse = {
  provider_call_executed: false,
  candles_persisted: false,
  fetch_run_persisted: false,
  raw_response_persisted: false,
  replay_executed: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
} as const;

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
  const authDiagnostics = buildAuthDiagnostics({
    expectedSecret,
    providedSecret,
  });
  const authenticated = authDiagnostics.header_matches;

  if (!authenticated) {
    return NextResponse.json(
      {
        error: "Unauthorized.",
        auth_diagnostics: authDiagnostics,
        ...noEffectResponse,
      },
      { status: 401 },
    );
  }

  const body = await parseBody(request);

  if (body.auth_check_only === true) {
    return NextResponse.json({
      ok: true,
      auth_check_only: true,
      auth_diagnostics: authDiagnostics,
      ...noEffectResponse,
    });
  }

  if (body.execute_provider_call !== true) {
    return NextResponse.json(
      {
        error: "execute_provider_call_true_required",
        ...noEffectResponse,
      },
      { status: 400 },
    );
  }

  if (hasArbitraryScopeOverride(body)) {
    return NextResponse.json(
      {
        error: "arbitrary_scope_override_rejected",
        ...noEffectResponse,
      },
      { status: 400 },
    );
  }

  const result = await executeFirstTinyHistoricalFetchApprovedNoPersistAttempt({
    execute_provider_call: true,
  });

  return NextResponse.json(result);
}
