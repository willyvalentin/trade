import { NextResponse } from "next/server";

import { applicationSessionCookieOptions, TRADE_AUTH_COOKIE } from "@/lib/trade-auth";
import { authenticationOriginFailureResponse } from "@/lib/application-mutation-guard-core";

export async function POST(request: Request) {
  const originError = authenticationOriginFailureResponse(request);
  if (originError) return originError;

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: TRADE_AUTH_COOKIE,
    value: "",
    ...applicationSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}
