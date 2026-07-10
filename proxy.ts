import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TRADE_AUTH_COOKIE = "trade_auth";
const AUTH_BOUNDARY_MARKER =
  "action_276_api_auth_middleware_boundary_audit";
export const GLOBAL_API_BOUNDARY_MARKER =
  "action_307g_public_diagnostic_route_auth_boundary_fix";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

function publicDiagnosticsEnabled() {
  const raw = process.env.TURE_PUBLIC_DIAGNOSTIC_ROUTES_ENABLED;
  return raw === undefined || raw.trim().toLowerCase() !== "false";
}

function proxyMinimalDiagnosticMode() {
  return (
    process.env.TURE_PROXY_MINIMAL_DIAGNOSTIC_MODE?.trim().toLowerCase() ===
    "true"
  );
}

async function getTradeAuthToken(password: string) {
  const data = new TextEncoder().encode(`trade-auth:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashBytes = Array.from(new Uint8Array(hashBuffer));

  return hashBytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function matchesPathOrChild(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function isApiRouteHandlerPassThrough(pathname: string) {
  return (
    matchesPathOrChild(pathname, "/api/auth") ||
    matchesPathOrChild(pathname, "/api/environment-boundary-audit") ||
    matchesPathOrChild(pathname, "/api/historical-backfill") ||
    (publicDiagnosticsEnabled() &&
      (matchesPathOrChild(pathname, "/api/hb307c") ||
        matchesPathOrChild(pathname, "/api/ping307h") ||
        matchesPathOrChild(pathname, "/api/route-publication-diagnostic"))) ||
    pathname === "/api/automation/run-scan" ||
    pathname === "/api/diagnostics/run-scan" ||
    pathname === "/api/recommendations/evaluate-outcomes"
  );
}

function isPublicDiagnosticPage(pathname: string) {
  return publicDiagnosticsEnabled() && (
    pathname === "/route-publication-probe" ||
    pathname === "/route-publication-probe/" ||
    pathname === "/public-probe-307g" ||
    pathname === "/public-probe-307g/" ||
    pathname === "/ping307h" ||
    pathname === "/ping307h/"
  );
}

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    isPublicDiagnosticPage(pathname) ||
    isApiRouteHandlerPassThrough(pathname)
  );
}

function isEmergencyDiagnosticBypass(pathname: string) {
  if (matchesPathOrChild(pathname, "/api/historical-backfill")) {
    return true;
  }

  if (!publicDiagnosticsEnabled()) {
    return false;
  }

  return (
    pathname === "/route-publication-probe" ||
    pathname === "/route-publication-probe/" ||
    pathname === "/public-probe-307g" ||
    pathname === "/public-probe-307g/" ||
    pathname === "/ping307h" ||
    pathname === "/ping307h/" ||
    pathname === "/api/hb307c" ||
    pathname === "/api/hb307c/" ||
    pathname === "/api/hb307c/ping" ||
    pathname === "/api/hb307c/ping/" ||
    pathname === "/api/ping307h" ||
    pathname === "/api/ping307h/" ||
    pathname === "/api/route-publication-diagnostic" ||
    pathname === "/api/route-publication-diagnostic/"
  );
}

function minimalModeApiBoundary(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return null;
  }

  return NextResponse.json(
    {
      ok: false,
      boundary: "proxy",
      boundary_marker: GLOBAL_API_BOUNDARY_MARKER,
      reason: "minimal_diagnostic_mode_api_route_not_in_bypass",
      pathname: request.nextUrl.pathname,
      provider_call_executed: false,
      replay_executed: false,
      synthetic_outcomes_persisted: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      recommendation_rows_mutated: false,
      supabase_write_executed: false,
    },
    { status: 401, headers: noStoreHeaders },
  );
}

function unauthorized(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        boundary: "proxy",
        boundary_marker: GLOBAL_API_BOUNDARY_MARKER,
        auth_boundary: "middleware",
        auth_boundary_marker: AUTH_BOUNDARY_MARKER,
        path: request.nextUrl.pathname,
        pathname: request.nextUrl.pathname,
        method: request.method,
        reason: "diagnostic_api_route_caught_by_proxy",
        header_present: request.headers.has("x-automation-secret"),
        server_secret_present: Boolean(process.env.TRADE_APP_PASSWORD),
        diagnostics_safe: true,
        provider_call_executed: false,
        replay_executed: false,
        synthetic_outcomes_persisted: false,
        scanner_behavior_changed: false,
        live_ranking_changed: false,
        recommendation_rows_mutated: false,
        supabase_write_executed: false,
      },
      { status: 401, headers: noStoreHeaders },
    );
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export async function proxy(request: NextRequest) {
  if (isEmergencyDiagnosticBypass(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (proxyMinimalDiagnosticMode()) {
    const apiBoundary = minimalModeApiBoundary(request);
    if (apiBoundary) return apiBoundary;
  }

  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const appPassword = process.env.TRADE_APP_PASSWORD;

  if (!appPassword) {
    return unauthorized(request);
  }

  const authCookie = request.cookies.get(TRADE_AUTH_COOKIE)?.value;
  const validAuthCookie = await getTradeAuthToken(appPassword);

  if (authCookie !== validAuthCookie) {
    return unauthorized(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
