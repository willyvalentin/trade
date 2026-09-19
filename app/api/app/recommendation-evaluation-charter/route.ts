import { NextResponse } from "next/server";

import {
  readCurrentRecommendationEvaluationCharters,
  recordCurrentRecommendationEvaluationCharter,
} from "@/lib/server/recommendation-evaluation-charter-service";
import {
  applicationMutationForbiddenResponse,
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const result = await readCurrentRecommendationEvaluationCharters(
    session.owner_user_id,
  );
  if (result.status === "available" || result.status === "not_found") {
    return NextResponse.json(
      { status: result.status, charters: result.charters, blocker: result.safe_blocker },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    { error: "Durable evaluation-charter storage is unavailable.", blocker: result.safe_blocker },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  const body = (await request.json().catch(() => null)) as {
    segment_key?: unknown;
    charter?: unknown;
  } | null;
  if (!body || typeof body.segment_key !== "string" ||
    body.segment_key.length < 1 || body.segment_key.length > 16_384) {
    return NextResponse.json(
      { error: "A comparable policy/version segment is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  const result = await recordCurrentRecommendationEvaluationCharter({
    ownerUserId: session.owner_user_id,
    segmentKey: body.segment_key,
    charter: body.charter,
  });
  if (result.status === "recorded" || result.status === "already_recorded") {
    return NextResponse.json(
      { status: result.status, charter: result.charter },
      {
        status: result.status === "recorded" ? 201 : 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
  if (result.status === "not_ready" || result.status === "different_charter_already_recorded") {
    return NextResponse.json(
      {
        error: result.status === "not_ready"
          ? "The charter is incomplete or its policy/version segment is unavailable."
          : "A different immutable charter already exists for this policy/version segment.",
        blocker: result.safe_blocker,
      },
      { status: 409, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    { error: "Durable evaluation-charter storage is unavailable.", blocker: result.safe_blocker },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
