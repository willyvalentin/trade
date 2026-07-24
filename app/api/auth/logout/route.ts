import { NextResponse } from "next/server";

import { applicationSessionCookieOptions, TRADE_AUTH_COOKIE } from "@/lib/trade-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: TRADE_AUTH_COOKIE,
    value: "",
    ...applicationSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}
