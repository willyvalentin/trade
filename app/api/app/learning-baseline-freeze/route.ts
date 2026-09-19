import { NextResponse } from "next/server";

import {
  freezeCurrentRecommendationLearningBaseline,
  readCurrentRecommendationLearningBaseline,
} from "@/lib/server/recommendation-learning-baseline-freeze-service";
import {
  applicationMutationForbiddenResponse,
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const result = await readCurrentRecommendationLearningBaseline(
    session.owner_user_id,
  );
  if (result.status === "available") {
    return NextResponse.json(
      { status: result.status, freeze: result.freeze },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  if (result.status === "not_found") {
    return NextResponse.json(
      { status: result.status, freeze: null, blocker: result.safe_blocker },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { error: "Durable baseline storage is unavailable.", blocker: result.safe_blocker },
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
  } | null;
  if (
    !body ||
    typeof body.segment_key !== "string" ||
    body.segment_key.length < 1 ||
    body.segment_key.length > 16_384
  ) {
    return NextResponse.json(
      { error: "A comparable baseline segment is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = await freezeCurrentRecommendationLearningBaseline({
    ownerUserId: session.owner_user_id,
    segmentKey: body.segment_key,
  });
  if (result.status === "frozen" || result.status === "already_frozen") {
    return NextResponse.json(
      { status: result.status, freeze: result.freeze },
      {
        status: result.status === "frozen" ? 201 : 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
  if (
    result.status === "not_ready" ||
    result.status === "different_baseline_already_frozen"
  ) {
    return NextResponse.json(
      {
        error:
          result.status === "not_ready"
            ? "This segment is not ready for an explicit baseline freeze."
            : "A different immutable baseline is already frozen.",
        blocker: result.safe_blocker,
      },
      { status: 409, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { error: "Durable baseline storage is unavailable.", blocker: result.safe_blocker },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
