import { NextResponse } from "next/server";

import {
  hb307cCanaryPurpose,
  hb307cCanaryRouteBuildMarker,
  hb307cNoEffectResponse,
} from "@/lib/hb307c-route-contract";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

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
