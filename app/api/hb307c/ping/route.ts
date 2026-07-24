import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const hb307cCanaryRouteBuildMarker = "action_307c_hb307c_canary";
export const hb307cCanaryPurpose =
  "production_route_publication_boundary_diagnostic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export const hb307cNoEffectResponse = {
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

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route_ping: true,
      route_build_marker: hb307cCanaryRouteBuildMarker,
      purpose: hb307cCanaryPurpose,
      ...hb307cNoEffectResponse,
    },
    { headers: noStoreHeaders },
  );
}
