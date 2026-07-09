import { NextResponse } from "next/server";

import {
  buildEnvironmentBoundaryAudit,
  environmentBoundaryAuditRouteMarker,
} from "@/lib/environment-boundary-audit";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

function response() {
  return NextResponse.json(
    {
      ok: true,
      route_marker: environmentBoundaryAuditRouteMarker,
      audit: buildEnvironmentBoundaryAudit(),
    },
    { headers: noStoreHeaders },
  );
}

export async function GET() {
  return response();
}

export async function POST() {
  return response();
}
