import { NextResponse } from "next/server";

import { getUsMarketStatus } from "@/lib/market-calendar";

export async function GET() {
  const marketStatus = await getUsMarketStatus();

  return NextResponse.json({ market_status: marketStatus });
}
