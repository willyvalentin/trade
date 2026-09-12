import { NextResponse } from "next/server";

import { isMvp01cStagingDashboardFailureProbe } from "@/lib/application-dashboard-failure-probe";
import { readApplicationDashboardData } from "@/lib/server/application-data-access";
import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

export const dynamic = "force-dynamic";

function dashboardUnavailableResponse() {
  return NextResponse.json(
    { error: "Dashboard data is unavailable.", code: "application_data_unavailable" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  if (isMvp01cStagingDashboardFailureProbe(request, process.env)) {
    return dashboardUnavailableResponse();
  }

  const result = await readApplicationDashboardData(session.owner_user_id);
  if (result.status !== "available") {
    return dashboardUnavailableResponse();
  }

  return NextResponse.json(result.data, {
    headers: { "Cache-Control": "no-store" },
  });
}
