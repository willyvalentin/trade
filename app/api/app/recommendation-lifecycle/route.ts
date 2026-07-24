import { NextResponse } from "next/server";

import { updateRecommendationLifecycle } from "@/lib/server/application-data-access";
import { applicationMutationForbiddenResponse, applicationSessionUnauthorizedResponse, requireApplicationSession } from "@/lib/server/application-session";

export async function PATCH(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.recommendation_id !== "string" || typeof body.status !== "string") {
    return NextResponse.json({ error: "Invalid recommendation lifecycle input." }, { status: 400 });
  }
  const result = await updateRecommendationLifecycle({
    recommendation_id: body.recommendation_id,
    status: body.status,
    ...(typeof body.archived === "boolean" ? { archived: body.archived } : {}),
    ...(typeof body.reason_to_avoid === "string" ? { reason_to_avoid: body.reason_to_avoid } : {}),
  });
  return result.status === "available"
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Recommendation update is unavailable." }, { status: 503 });
}
