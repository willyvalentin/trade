import { NextResponse } from "next/server";

import {
  applicationSessionCookieOptions,
  createApplicationSession,
  TRADE_AUTH_COOKIE,
} from "@/lib/trade-auth";
import {
  buildApplicationLoginRuntimeProof,
  finalizeSharedLoginSuccess,
  passwordsMatch,
  reserveSharedLoginAttempt,
} from "@/lib/server/application-login-abuse-control";
import { evaluateApplicationAuthenticationOrigin } from "@/lib/application-mutation-guard-core";

export async function POST(request: Request) {
  const authenticationOrigin = evaluateApplicationAuthenticationOrigin(request);
  if (authenticationOrigin.status !== "allowed") {
    return NextResponse.json(
      {
        error: "Application authentication is unavailable for this deployment origin.",
        code: authenticationOrigin.code,
      },
      {
        status: authenticationOrigin.status === "unavailable" ? 503 : 403,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const appPassword = process.env.TRADE_APP_PASSWORD;

  if (!appPassword) {
    return NextResponse.json(
      { error: "Trade password is not configured" },
      { status: 500 },
    );
  }

  const admission = await reserveSharedLoginAttempt(request);
  if (admission.status === "unavailable") {
    return NextResponse.json(
      { error: "Login protection is unavailable.", code: "login_protection_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (admission.status === "limited") {
    return NextResponse.json(
      { error: "Too many login attempts.", code: "login_rate_limited" },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(admission.retry_after_seconds),
        },
      },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;

  if (
    typeof body?.password !== "string" ||
    !(await passwordsMatch(appPassword, body.password))
  ) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  if (!(await finalizeSharedLoginSuccess(admission.identity_digest))) {
    return NextResponse.json(
      { error: "Login protection is unavailable.", code: "login_protection_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const session = await createApplicationSession();

  if (!session) {
    return NextResponse.json(
      { error: "Application session is unavailable" },
      { status: 503 },
    );
  }

  const runtimeProof = await buildApplicationLoginRuntimeProof(request);
  const response = NextResponse.json({
    ok: true,
    ...(runtimeProof ? { runtime_proof: runtimeProof } : {}),
  });
  response.cookies.set({
    name: TRADE_AUTH_COOKIE,
    value: session,
    ...applicationSessionCookieOptions(),
  });

  return response;
}
