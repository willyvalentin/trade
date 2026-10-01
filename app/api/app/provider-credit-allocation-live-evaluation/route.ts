import { NextResponse } from "next/server";
import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";
import { readScannerProviderCreditAllocationLiveEvaluation } from "@/lib/server/scanner-provider-credit-allocation-live-evaluation-readback";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const result = await readScannerProviderCreditAllocationLiveEvaluation(session.owner_user_id);
  return NextResponse.json(result, {
    status: result.status === "unavailable" ? 503 : result.evaluation.status === "fail" ? 422 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
