import { NextResponse } from "next/server";

import { getTradeAuthToken, TRADE_AUTH_COOKIE } from "@/lib/trade-auth";

export async function POST(request: Request) {
  const appPassword = process.env.TRADE_APP_PASSWORD;

  if (!appPassword) {
    return NextResponse.json(
      { error: "Trade password is not configured" },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;

  if (typeof body?.password !== "string" || body.password !== appPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: TRADE_AUTH_COOKIE,
    value: await getTradeAuthToken(appPassword),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
