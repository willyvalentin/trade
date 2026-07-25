import { NextResponse } from "next/server";

import { getUsMarketStatus } from "@/lib/market-calendar";
import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const marketStatus = await getUsMarketStatus();

  return NextResponse.json({ market_status: marketStatus });
}
