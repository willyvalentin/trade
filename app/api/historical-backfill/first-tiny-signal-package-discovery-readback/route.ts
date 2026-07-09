import { NextResponse } from "next/server";

import {
  firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
  runFirstTinyHistoricalReplaySignalPackageDiscoveryReadback,
} from "@/lib/first-tiny-historical-replay-signal-package-discovery-readback";

export const dynamic = "force-dynamic";

type FirstTinySignalPackageDiscoveryReadbackRouteBody = {
  run_signal_package_discovery_readback?: unknown;
  auth_check_only?: unknown;
  ticker?: unknown;
  provider?: unknown;
  interval?: unknown;
  trading_day?: unknown;
  date?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  fetch_run_id?: unknown;
  execute_provider_call?: unknown;
  execute_payload_refetch?: unknown;
  execute_corrected_payload_refetch?: unknown;
  execute_fetch_run_audit_write?: unknown;
  execute_candle_persistence?: unknown;
  persist_candles?: unknown;
  candles_persisted?: unknown;
  persist_raw_response?: unknown;
  raw_response_persisted?: unknown;
  persist_fetch_run?: unknown;
  fetch_run_persisted?: unknown;
  persist_synthetic_outcomes?: unknown;
  synthetic_outcomes_persisted?: unknown;
  execute_replay?: unknown;
  execute_replay_dry_run?: unknown;
  replay_allowed?: unknown;
  scanner_effect_allowed?: unknown;
  scanner_behavior_changed?: unknown;
  ranking_effect_allowed?: unknown;
  live_ranking_changed?: unknown;
  create_signal_package?: unknown;
  mutate_recommendations?: unknown;
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
  recommendation_rows_mutated: false,
  supabase_write_executed: false,
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

async function parseBody(
  request: Request,
): Promise<FirstTinySignalPackageDiscoveryReadbackRouteBody> {
  try {
    const text = await request.text();
    if (!text.trim()) return {};
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as FirstTinySignalPackageDiscoveryReadbackRouteBody)
      : {};
  } catch {
    return {};
  }
}

function hasRejectedOverride(
  body: FirstTinySignalPackageDiscoveryReadbackRouteBody,
) {
  return [
    body.ticker,
    body.provider,
    body.interval,
    body.trading_day,
    body.date,
    body.start_date,
    body.end_date,
    body.fetch_run_id,
    body.execute_provider_call,
    body.execute_payload_refetch,
    body.execute_corrected_payload_refetch,
    body.execute_fetch_run_audit_write,
    body.execute_candle_persistence,
    body.persist_candles,
    body.candles_persisted,
    body.persist_raw_response,
    body.raw_response_persisted,
    body.persist_fetch_run,
    body.fetch_run_persisted,
    body.persist_synthetic_outcomes,
    body.synthetic_outcomes_persisted,
    body.execute_replay,
    body.execute_replay_dry_run,
    body.replay_allowed,
    body.scanner_effect_allowed,
    body.scanner_behavior_changed,
    body.ranking_effect_allowed,
    body.live_ranking_changed,
    body.create_signal_package,
    body.mutate_recommendations,
  ].some((value) => value !== undefined);
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
          firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
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
      route_build_marker:
        firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
      auth_diagnostics: authDiagnostics,
      ...noEffectResponse,
    });
  }

  if (body.run_signal_package_discovery_readback !== true) {
    return jsonNoStore(
      {
        error: "run_signal_package_discovery_readback_true_required",
        route_build_marker:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
        ...noEffectResponse,
      },
      400,
    );
  }

  if (hasRejectedOverride(body)) {
    return jsonNoStore(
      {
        error: "arbitrary_scope_or_effect_override_rejected",
        route_build_marker:
          firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
        ...noEffectResponse,
      },
      400,
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const result =
      await runFirstTinyHistoricalReplaySignalPackageDiscoveryReadback({
        execute_readback: true,
        supabase_client: null,
        readback_unavailable_reason: "supabase_missing_env",
      });
    return jsonNoStore(result as unknown as Record<string, unknown>);
  }

  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE &&
    !process.env.SUPABASE_SERVICE_ROLE_SECRET
  ) {
    const result =
      await runFirstTinyHistoricalReplaySignalPackageDiscoveryReadback({
        execute_readback: true,
        supabase_client: null,
        readback_unavailable_reason: "supabase_service_role_missing",
      });
    return jsonNoStore(result as unknown as Record<string, unknown>);
  }

  const { getServerSupabaseClient } = await import("@/lib/supabase-server");
  const supabase = getServerSupabaseClient();
  const result = await runFirstTinyHistoricalReplaySignalPackageDiscoveryReadback({
    execute_readback: true,
    supabase_client: supabase.client,
    readback_unavailable_reason: supabase.unavailable_reason,
  });

  return jsonNoStore(result as unknown as Record<string, unknown>);
}
