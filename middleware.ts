import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REALM = "Trade";

function unauthorized() {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

function getPasswordFromHeader(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith("Basic ")) {
    return null;
  }

  try {
    const credentials = atob(authorizationHeader.slice("Basic ".length));
    const separatorIndex = credentials.indexOf(":");

    if (separatorIndex === -1) {
      return null;
    }

    return credentials.slice(separatorIndex + 1);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const appPassword = process.env.TRADE_APP_PASSWORD;

  if (!appPassword) {
    return unauthorized();
  }

  const requestPassword = getPasswordFromHeader(
    request.headers.get("authorization"),
  );

  if (requestPassword !== appPassword) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
