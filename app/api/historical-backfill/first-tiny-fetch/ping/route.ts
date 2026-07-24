import { NextResponse } from "next/server";

import { firstTinyFetchRouteExpectedMarker } from "@/lib/environment-boundary-audit";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route_ping: true,
      route_version: "first_tiny_fetch_ping_v1",
      route_build_marker: firstTinyFetchRouteExpectedMarker,
      provider_call_executed: false,
      candles_persisted: false,
      fetch_run_persisted: false,
      raw_response_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
