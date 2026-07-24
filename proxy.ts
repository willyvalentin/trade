import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { TRADE_AUTH_COOKIE, verifyApplicationSession } from "@/lib/trade-auth";
import { evaluateApplicationMutationOrigin } from "@/lib/application-mutation-guard-core";

export const GLOBAL_API_BOUNDARY_MARKER =
  "action_307k_proxy_runtime_crash_isolation";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

function withProxyMarker(response: NextResponse) {
  response.headers.set("x-ture-proxy-marker", GLOBAL_API_BOUNDARY_MARKER);
  return response;
}

function nextWithProxyMarker() {
  return withProxyMarker(NextResponse.next());
}

function isDiagnosticPage(pathname: string) {
  return (
    pathname === "/ping307h" ||
    pathname === "/ping307h/" ||
    pathname === "/route-publication-probe" ||
    pathname === "/route-publication-probe/" ||
    pathname === "/public-probe-307g" ||
    pathname === "/public-probe-307g/"
  );
}

function isApiRoute(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

function isStaticAsset(pathname: string) {
  return pathname.startsWith("/_next/") || pathname === "/favicon.ico" || /\/[^/]+\.[^/]+$/.test(pathname);
}

function isPublicPage(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/login/" ||
    isDiagnosticPage(pathname)
  );
}

function isAutomationOrPublicApi(pathname: string) {
  return (
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/runtime-health/ping" ||
    pathname === "/api/ping307h" ||
    pathname === "/api/environment-boundary-audit" ||
    pathname === "/api/environment-boundary-audit/ping" ||
    pathname === "/api/route-publication-diagnostic" ||
    pathname === "/api/hb307c" ||
    pathname.startsWith("/api/historical-backfill/") ||
    pathname.startsWith("/api/automation/") ||
    pathname === "/api/recommendations/evaluate-outcomes" ||
    pathname === "/api/diagnostics/run-scan"
  );
}

function proxyBlockedApiRoute(pathname: string) {
  return NextResponse.json(
    {
      ok: false,
      boundary: "proxy",
      boundary_marker: GLOBAL_API_BOUNDARY_MARKER,
      reason: "proxy_blocked_api_route",
      pathname,
      provider_call_executed: false,
      replay_executed: false,
      synthetic_outcomes_persisted: false,
      supabase_write_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
    { status: 401, headers: noStoreHeaders },
  );
}

function apiSessionRequiredResponse() {
  return NextResponse.json(
    {
      error: "Authentication is required.",
      code: "application_session_required",
    },
    { status: 401, headers: noStoreHeaders },
  );
}

function apiMutationOriginResponse(request: NextRequest) {
  const result = evaluateApplicationMutationOrigin(request);
  if (result.status === "allowed") return null;
  return NextResponse.json(
    { error: "Mutation request origin is not permitted.", code: result.code },
    {
      status: result.status === "unavailable" ? 503 : 403,
      headers: noStoreHeaders,
    },
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isStaticAsset(pathname)) {
    return nextWithProxyMarker();
  }

  if (isPublicPage(pathname)) {
    return nextWithProxyMarker();
  }

  if (isApiRoute(pathname)) {
    if (isAutomationOrPublicApi(pathname)) {
      return nextWithProxyMarker();
    }

    const session = await verifyApplicationSession(
      request.cookies.get(TRADE_AUTH_COOKIE)?.value,
    );

    if (session.status !== "authenticated") {
      return withProxyMarker(apiSessionRequiredResponse());
    }

    const originResponse = apiMutationOriginResponse(request);
    return originResponse ? withProxyMarker(originResponse) : nextWithProxyMarker();
  }

  if (pathname.startsWith("/api")) {
    return withProxyMarker(proxyBlockedApiRoute(pathname));
  }

  const session = await verifyApplicationSession(
    request.cookies.get(TRADE_AUTH_COOKIE)?.value,
  );

  if (session.status === "authenticated") {
    return nextWithProxyMarker();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return withProxyMarker(NextResponse.redirect(loginUrl));
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
