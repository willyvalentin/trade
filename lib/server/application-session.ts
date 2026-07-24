import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import {
  TRADE_AUTH_COOKIE,
  verifyApplicationSession,
  type ApplicationSessionVerification,
} from "@/lib/application-session-core";

export { TRADE_AUTH_COOKIE } from "@/lib/application-session-core";

export async function verifyCurrentApplicationSession() {
  const cookieStore = await cookies();
  return verifyApplicationSession(cookieStore.get(TRADE_AUTH_COOKIE)?.value);
}

export async function hasApplicationSession() {
  return (await verifyCurrentApplicationSession()).status === "authenticated";
}

export async function requireApplicationSession() {
  const result = await verifyCurrentApplicationSession();

  return result.status === "authenticated" ? result : null;
}

export async function requireApplicationPageSession() {
  const session = await requireApplicationSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export function applicationSessionUnauthorizedResponse(
  verification?: ApplicationSessionVerification | null,
) {
  return NextResponse.json(
    {
      error: "Authentication is required.",
      code: "application_session_required",
      session_status:
        verification?.status === "configuration_missing"
          ? "unavailable"
          : "unauthenticated",
    },
    {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
