import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isDiagnosticPage(pathname)) {
    return nextWithProxyMarker();
  }

  if (isApiRoute(pathname)) {
    return nextWithProxyMarker();
  }

  if (pathname.startsWith("/api")) {
    return withProxyMarker(proxyBlockedApiRoute(pathname));
  }

  return nextWithProxyMarker();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
