import { NextResponse } from "next/server";

import {
  finalizeCurrentScannerClockPriorShadowForwardEvaluation,
  readCurrentScannerClockPriorShadowForwardEvaluation,
} from "@/lib/server/scanner-clock-prior-shadow-forward-evaluation-service";
import {
  applicationMutationForbiddenResponse,
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const result = await readCurrentScannerClockPriorShadowForwardEvaluation(
    session.owner_user_id,
  );
  if (result.status === "available") {
    return NextResponse.json({
      status: result.status,
      plan_receipt: result.plan_receipt,
      evaluation: result.evaluation,
      durable_result_receipt: result.durable_result_receipt,
      context_diagnostic: result.context_diagnostic,
      evidence_counts: result.evidence_counts,
      authority: result.authority,
    }, { headers: noStore });
  }
  return NextResponse.json({
    error: result.status === "not_ready"
      ? "The frozen forward cohort is not ready for evaluation."
      : result.status === "conflicting"
        ? "The frozen forward cohort evidence is conflicting."
        : "The frozen forward cohort evidence is unavailable.",
    blocker: result.safe_blocker,
    authority: result.authority,
  }, {
    status: result.status === "not_ready"
      ? 409
      : result.status === "conflicting"
        ? 422
        : 503,
    headers: noStore,
  });
}

export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  const result = await finalizeCurrentScannerClockPriorShadowForwardEvaluation({
    ownerUserId: session.owner_user_id,
  });
  if (result.status === "finalized" || result.status === "already_finalized") {
    return NextResponse.json({
      status: result.status,
      receipt: result.receipt,
      evaluation: result.evaluation,
      context_diagnostic: result.context_diagnostic,
      authority: result.authority,
    }, {
      status: result.status === "finalized" ? 201 : 200,
      headers: noStore,
    });
  }
  return NextResponse.json({
    error: result.status === "not_ready"
      ? "The predeclared walk-forward window or its exact evidence is incomplete."
      : result.status === "conflicting"
        ? "A different terminal result or conflicting cohort evidence exists."
        : "Forward-cohort finalization is unavailable.",
    blocker: result.safe_blocker,
    evaluation: result.evaluation,
    authority: result.authority,
  }, {
    status: result.status === "not_ready"
      ? 409
      : result.status === "conflicting"
        ? 422
        : 503,
    headers: noStore,
  });
}
