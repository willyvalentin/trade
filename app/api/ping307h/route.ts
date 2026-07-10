import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route_build_marker: "action_307h_api_ping307h",
      provider_call_executed: false,
      replay_executed: false,
      synthetic_outcomes_persisted: false,
      supabase_write_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
    { headers: noStoreHeaders },
  );
}
