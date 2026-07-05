import { NextResponse } from "next/server";

import {
  buildAvanzaLocalOnlyApiRouteStubModel,
} from "@/lib/avanza-local-only-api-route-stub";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await request.json();
  } catch {
    // Defensive parse only. The disabled route ignores request input.
  }

  const response = buildAvanzaLocalOnlyApiRouteStubModel({
    apiRouteEnabled: false,
    localOnlyEnabled: false,
    mode: "disabled",
  });

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store",
      "X-Avanza-Stub-Mode": "disabled",
    },
    status: 200,
  });
}
