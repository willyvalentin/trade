import { NextResponse } from "next/server";

import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";
import { readScannerProviderCreditAllocationCrossSeriesEvidence } from "@/lib/server/scanner-provider-credit-allocation-cross-series-evidence-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const evidence =
    await readScannerProviderCreditAllocationCrossSeriesEvidence(
      session.owner_user_id,
    );
  return NextResponse.json(evidence, {
    status: evidence.status === "invalid" ? 422 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
