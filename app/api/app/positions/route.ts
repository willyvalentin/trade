import { NextResponse } from "next/server";

import {
  closeApplicationPosition,
  openApplicationPosition,
  updateApplicationPosition,
} from "@/lib/server/application-data-access";
import { applicationMutationForbiddenResponse, applicationSessionUnauthorizedResponse, requireApplicationSession } from "@/lib/server/application-session";

export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid position input." }, { status: 400 });
  const result = await openApplicationPosition(session.owner_user_id, body);
  if (result.status === "invalid") {
    return NextResponse.json({ error: "Invalid position input." }, { status: 400 });
  }
  return result.status === "available"
    ? NextResponse.json(result.data, { status: result.data.disposition === "created" ? 201 : 200 })
    : NextResponse.json({ error: "Position could not be opened." }, { status: 503 });
}

export async function PATCH(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  const body = (await request.json().catch(() => null)) as {
    position_id?: unknown;
    operation?: unknown;
    values?: unknown;
  } | null;
  if (
    !body ||
    typeof body.position_id !== "string" ||
    (body.operation !== "partial_close" && body.operation !== "close") ||
    !body.values ||
    typeof body.values !== "object" ||
    Array.isArray(body.values)
  ) {
    return NextResponse.json({ error: "Invalid position lifecycle input." }, { status: 400 });
  }
  const result =
    body.operation === "close"
      ? await closeApplicationPosition({
          owner_user_id: session.owner_user_id,
          position_id: body.position_id,
          values: body.values as Record<string, unknown>,
        })
      : await updateApplicationPosition({
          owner_user_id: session.owner_user_id,
          position_id: body.position_id,
          operation: body.operation,
          values: body.values as Record<string, unknown>,
        });
  if (result.status === "invalid") {
    return NextResponse.json(
      { error: "Invalid position lifecycle values." },
      { status: 400 },
    );
  }
  return result.status === "available"
    ? NextResponse.json({ ok: true, ...("data" in result ? result.data : {}) })
    : NextResponse.json({ error: "Position update is unavailable." }, { status: 503 });
}
