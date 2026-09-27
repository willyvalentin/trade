import { NextResponse } from "next/server";

import {
  activateCurrentScannerClockPriorShadowForwardDecisionPlan,
  readCurrentScannerClockPriorShadowForwardDecisionPlans,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision-plan-service";
import {
  applicationMutationForbiddenResponse,
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const result = await readCurrentScannerClockPriorShadowForwardDecisionPlans(
    session.owner_user_id,
  );
  if (result.status === "available" || result.status === "not_found") {
    return NextResponse.json(
      {
        status: result.status,
        receipts: result.receipts,
        blocker: result.safe_blocker,
        authority: result.authority,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    {
      error: "Durable forward-plan storage is unavailable.",
      blocker: result.safe_blocker,
      authority: result.authority,
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  const body = await request.json().catch(() => null);
  const result =
    await activateCurrentScannerClockPriorShadowForwardDecisionPlan({
      ownerUserId: session.owner_user_id,
      request: body,
    });

  if (result.status === "activated" || result.status === "already_activated") {
    return NextResponse.json(
      {
        status: result.status,
        receipt: result.receipt,
        authority: result.authority,
      },
      {
        status: result.status === "activated" ? 201 : 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const status = result.status === "invalid_request"
    ? 400
    : result.status === "unavailable"
      ? 503
      : 409;
  return NextResponse.json(
    {
      error: result.status === "invalid_request"
        ? "The forward-plan definition is invalid or contains server-owned fields."
        : result.status === "different_plan_already_recorded"
          ? "A different immutable forward plan already exists for this baseline and candidate ranking version."
          : result.status === "not_ready"
            ? "The durable charter and baseline are not ready for this forward plan."
            : "Durable forward-plan activation is unavailable.",
      blocker: result.safe_blocker,
      authority: result.authority,
    },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
