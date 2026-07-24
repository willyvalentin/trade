import { NextResponse } from "next/server";

import {
  executeFirstTinyHistoricalCandlePayloadRefetch,
  firstTinyHistoricalCandlePayloadRefetchExecuteMarker,
  type FirstTinyHistoricalCandlePayloadRow,
} from "@/lib/first-tiny-historical-candle-payload-refetch-execute";

export const dynamic = "force-dynamic";

type PayloadRefetchRouteBody = {
  execute_payload_refetch?: unknown;
  auth_check_only?: unknown;
  ticker?: unknown;
  provider?: unknown;
  endpoint?: unknown;
  interval?: unknown;
  trading_day?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  date?: unknown;
  execute_provider_call?: unknown;
  execute_fetch_run_audit_write?: unknown;
  persist_candles?: unknown;
  candles_persisted?: unknown;
  candle_persistence_allowed?: unknown;
  persist_raw_response?: unknown;
  raw_response_persisted?: unknown;
  raw_response_persistence_allowed?: unknown;
  persist_fetch_run?: unknown;
  fetch_run_persisted?: unknown;
  execute_replay?: unknown;
  replay_allowed?: unknown;
  scanner_effect_allowed?: unknown;
  scanner_behavior_changed?: unknown;
};

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

const noEffectResponse = {
  provider_call_executed: false,
  provider_call_attempted: false,
  candles_persisted: false,
  raw_response_persisted: false,
  fetch_run_persisted: false,
  synthetic_outcomes_persisted: false,
  replay_executed: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
} as const;

function jsonNoStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

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

async function parseBody(request: Request): Promise<PayloadRefetchRouteBody> {
  try {
    const text = await request.text();
    if (!text.trim()) return {};
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as PayloadRefetchRouteBody)
      : {};
  } catch {
    return {};
  }
}

function hasRejectedOverride(body: PayloadRefetchRouteBody) {
  return [
    body.ticker,
    body.provider,
    body.endpoint,
    body.interval,
    body.trading_day,
    body.start_date,
    body.end_date,
    body.date,
    body.execute_provider_call,
    body.execute_fetch_run_audit_write,
    body.persist_candles,
    body.candles_persisted,
    body.candle_persistence_allowed,
    body.persist_raw_response,
    body.raw_response_persisted,
    body.raw_response_persistence_allowed,
    body.persist_fetch_run,
    body.fetch_run_persisted,
    body.execute_replay,
    body.replay_allowed,
    body.scanner_effect_allowed,
    body.scanner_behavior_changed,
  ].some((value) => value !== undefined);
}

function normalizeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizePayloadRow(
  row: Record<string, unknown>,
): FirstTinyHistoricalCandlePayloadRow {
  return {
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "5min",
    timestamp: typeof row.timestamp === "string" ? row.timestamp : null,
    open: normalizeNumber(row.open),
    high: normalizeNumber(row.high),
    low: normalizeNumber(row.low),
    close: normalizeNumber(row.close),
    volume: normalizeNumber(row.volume),
    adjusted: false,
    trading_day: "2026-07-08",
    session: "regular",
    timezone: "America/New_York",
    fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
  };
}

async function serverCacheLookup() {
  try {
    const { getServerSupabaseClient } = await import("@/lib/supabase-server");
    const supabase = getServerSupabaseClient();
    if (!supabase.client) {
      return {
        available: true,
        hit: false,
        source: supabase.unavailable_reason ?? "supabase_cache_unavailable",
      };
    }

    const { data, error } = await supabase.client
      .from("historical_candles")
      .select(
        "provider,ticker,interval,timestamp,open,high,low,close,volume,adjusted,trading_day,session,timezone,fetch_run_id",
      )
      .eq("provider", "twelve_data")
      .eq("ticker", "AAPL")
      .eq("interval", "5min")
      .eq("trading_day", "2026-07-08")
      .eq("adjusted", false)
      .order("timestamp", { ascending: true })
      .limit(27);

    if (error) {
      return {
        available: false,
        hit: false,
        source: "supabase_cache_lookup_error",
      };
    }

    const rows = Array.isArray(data)
      ? data.map((row) => normalizePayloadRow(row))
      : [];

    return {
      available: true,
      hit: rows.length >= 27,
      source: "historical_candles",
      candles: rows.length >= 27 ? rows : [],
    };
  } catch {
    return {
      available: false,
      hit: false,
      source: "cache_lookup_failed",
    };
  }
}

export async function POST(request: Request) {
  const body = await parseBody(request);
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const providedSecret = request.headers.get("x-automation-secret");
  const authDiagnostics = buildAuthDiagnostics({
    expectedSecret,
    providedSecret,
  });

  if (!authDiagnostics.header_matches) {
    return jsonNoStore(
      {
        error: "Unauthorized.",
        auth_boundary: "route_handler",
        route_build_marker:
          firstTinyHistoricalCandlePayloadRefetchExecuteMarker,
        auth_diagnostics: authDiagnostics,
        ...noEffectResponse,
      },
      401,
    );
  }

  if (body.auth_check_only === true) {
    return jsonNoStore({
      ok: true,
      auth_check_only: true,
      route_build_marker: firstTinyHistoricalCandlePayloadRefetchExecuteMarker,
      auth_diagnostics: authDiagnostics,
      ...noEffectResponse,
    });
  }

  if (body.execute_payload_refetch !== true) {
    return jsonNoStore(
      {
        error: "execute_payload_refetch_true_required",
        route_build_marker:
          firstTinyHistoricalCandlePayloadRefetchExecuteMarker,
        ...noEffectResponse,
      },
      400,
    );
  }

  if (hasRejectedOverride(body)) {
    return jsonNoStore(
      {
        error: "arbitrary_scope_or_persistence_override_rejected",
        route_build_marker:
          firstTinyHistoricalCandlePayloadRefetchExecuteMarker,
        ...noEffectResponse,
      },
      400,
    );
  }

  const result = await executeFirstTinyHistoricalCandlePayloadRefetch({
    execute_payload_refetch: true,
    cache_lookup: serverCacheLookup,
  });

  return jsonNoStore(result as unknown as Record<string, unknown>);
}
