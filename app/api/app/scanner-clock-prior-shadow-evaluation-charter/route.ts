import { NextResponse } from "next/server";

import {
  activateCurrentScannerClockPriorShadowEvaluationCharter,
} from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter-service";
import {
  applicationMutationForbiddenResponse,
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  const result = await activateCurrentScannerClockPriorShadowEvaluationCharter({
    ownerUserId: session.owner_user_id,
    request: await request.json().catch(() => null),
  });
  if (result.status === "recorded" || result.status === "already_recorded") {
    return NextResponse.json(result, {
      status: result.status === "recorded" ? 201 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  }
  const status = result.status === "invalid_request"
    ? 400
    : result.status === "unavailable"
      ? 503
      : 409;
  return NextResponse.json(
    {
      error: result.status === "invalid_request"
        ? "Only one exact policy/version segment may be selected."
        : result.status === "different_charter_already_recorded"
          ? "A different immutable charter already exists for this policy/version segment."
          : result.status === "not_ready"
            ? "The exact baseline policy/version segment is not ready for the clock-neutral charter."
            : "Clock-neutral evaluation-charter activation is unavailable.",
      blocker: result.safe_blocker,
      authority: result.authority,
    },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
