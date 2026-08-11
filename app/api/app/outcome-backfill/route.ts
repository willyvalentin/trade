import { NextResponse } from "next/server";

import {
  readOutcomeBackfillRows,
  type OutcomeBackfillReadOperation,
} from "@/lib/server/application-data-access";
import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

const permittedOperations = new Set<OutcomeBackfillReadOperation>([
  "snapshots_by_fingerprint",
  "snapshots_by_scan_run",
  "batches_by_fingerprint",
  "batches_by_scan_run",
]);

export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const body = (await request.json().catch(() => null)) as {
    operation?: unknown;
    identifiers?: unknown;
  } | null;
  const operation = body?.operation;

  if (typeof operation !== "string" || !permittedOperations.has(operation as OutcomeBackfillReadOperation)) {
    return NextResponse.json({ error: "Invalid outcome backfill request." }, { status: 400 });
  }

  const result = await readOutcomeBackfillRows(
    session.owner_user_id,
    operation as OutcomeBackfillReadOperation,
    body?.identifiers,
  );
  if (result.status !== "available") {
    return NextResponse.json({ error: "Outcome backfill is unavailable." }, { status: 503 });
  }

  return NextResponse.json({ rows: result.data }, {
    headers: { "Cache-Control": "no-store" },
  });
}
