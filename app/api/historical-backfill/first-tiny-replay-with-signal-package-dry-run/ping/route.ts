import { NextResponse } from "next/server";

import {
  firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker,
  firstTinyReplayWithSignalPackageRouteReachabilityFixMarker,
} from "@/lib/first-tiny-historical-replay-with-signal-package-dry-run-execute";

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
        firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker,
      route_reachability_fix_marker:
        firstTinyReplayWithSignalPackageRouteReachabilityFixMarker,
      provider_call_executed: false,
      provider_call_attempted: false,
      candles_persisted: false,
      raw_response_persisted: false,
      fetch_run_persisted: false,
      replay_executed: false,
      synthetic_outcomes_persisted: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      recommendation_rows_mutated: false,
      supabase_write_executed: false,
    },
    { headers: noStoreHeaders },
  );
}
