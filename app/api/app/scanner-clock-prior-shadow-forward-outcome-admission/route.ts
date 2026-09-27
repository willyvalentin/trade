import { NextResponse } from "next/server";

import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";
import {
  readCurrentScannerClockPriorShadowForwardOutcomeAdmission,
} from "@/lib/server/scanner-clock-prior-shadow-forward-outcome-admission-service";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const result =
    await readCurrentScannerClockPriorShadowForwardOutcomeAdmission({
      ownerUserId: session.owner_user_id,
    });
  if (result.status === "available") {
    return NextResponse.json({
      status: result.status,
      plan_receipt: result.plan_receipt,
      admission: result.admission,
      source_counts: result.source_counts,
      authority: result.authority,
    }, { headers: noStore });
  }
  return NextResponse.json({
    error: result.status === "not_ready"
      ? "The frozen forward plan is not ready for outcome admission."
      : result.status === "conflicting"
        ? "The frozen forward plan evidence is conflicting."
        : "Forward outcome admission is unavailable.",
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
