import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TRADE_AUTH_COOKIE = "trade_auth";

async function getTradeAuthToken(password: string) {
  const data = new TextEncoder().encode(`trade-auth:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashBytes = Array.from(new Uint8Array(hashBuffer));

  return hashBytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/automation/run-scan"
  );
}

function unauthorized(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export async function proxy(request: NextRequest) {
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
