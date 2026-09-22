import { NextResponse } from "next/server";

import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";
import { readInternalPaperObserver } from "@/lib/server/internal-paper-observer-persistence";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const result = await readInternalPaperObserver(session.owner_user_id);
  if (result.status === "available") {
    return NextResponse.json(result.data, {
      headers: { "Cache-Control": "no-store" },
    });
  }
  if (result.status === "not_configured") {
    return NextResponse.json(
      {
        observer_status: "not_configured",
        reason: result.reason,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    {
      error: "Internal paper observer is unavailable.",
      code: "internal_paper_observer_unavailable",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
