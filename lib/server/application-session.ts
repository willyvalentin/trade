import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import {
  TRADE_AUTH_COOKIE,
  verifyApplicationSession,
  type ApplicationSessionVerification,
} from "@/lib/application-session-core";
import { evaluateApplicationMutationOrigin } from "@/lib/application-mutation-guard-core";
import { verifyConfiguredApplicationOwnerPrincipal } from "@/lib/server/application-owner-principal";

export { TRADE_AUTH_COOKIE } from "@/lib/application-session-core";

export async function verifyCurrentApplicationSession() {
  const cookieStore = await cookies();
  return verifyApplicationSession(cookieStore.get(TRADE_AUTH_COOKIE)?.value);
}

export async function hasApplicationSession() {
  return (await requireApplicationSession()) !== null;
}

export async function requireApplicationSession() {
  const result = await verifyCurrentApplicationSession();
  if (result.status !== "authenticated") return null;

  const principal = await verifyConfiguredApplicationOwnerPrincipal();
  return principal.status === "verified" &&
    principal.owner_user_id === result.owner_user_id
    ? result
    : null;
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

export function applicationMutationForbiddenResponse(request: Request) {
  const result = evaluateApplicationMutationOrigin(request);
  if (result.status === "allowed") return null;

  return NextResponse.json(
    {
      error: "Mutation request origin is not permitted.",
      code: result.code,
    },
    {
      status: result.status === "unavailable" ? 503 : 403,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
