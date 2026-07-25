import { NextResponse } from "next/server";

import { readApplicationDashboardData } from "@/lib/server/application-data-access";
import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const result = await readApplicationDashboardData();
  if (result.status !== "available") {
    return NextResponse.json(
      { error: "Dashboard data is unavailable.", code: "application_data_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(result.data, {
    headers: { "Cache-Control": "no-store" },
  });
}
