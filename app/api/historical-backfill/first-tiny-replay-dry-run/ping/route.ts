import { NextResponse } from "next/server";

import { firstTinyHistoricalReplayDryRunExecuteRouteBuildMarker } from "@/lib/first-tiny-historical-replay-dry-run-execute";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route_ping: true,
      route_build_marker:
        firstTinyHistoricalReplayDryRunExecuteRouteBuildMarker,
      provider_call_executed: false,
      provider_call_attempted: false,
      candles_persisted: false,
      raw_response_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
    { headers: noStoreHeaders },
  );
}
