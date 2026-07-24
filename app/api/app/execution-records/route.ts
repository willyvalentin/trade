import { NextResponse } from "next/server";

import { readApplicationExecutionRecords } from "@/lib/server/application-data-access";
import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const result = await readApplicationExecutionRecords();
  if (result.status !== "available") {
    return NextResponse.json({ error: "Execution records are unavailable." }, { status: 503 });
  }

  return NextResponse.json({ execution_records: result.data }, {
    headers: { "Cache-Control": "no-store" },
  });
}
