import { NextResponse } from "next/server";
import { requireApplicationSession, applicationSessionUnauthorizedResponse } from "@/lib/server/application-session";
import { readOwnedScannerHistoricalInputReplay } from "@/lib/server/scanner-historical-input-replay";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

// Fixed-purpose read-only research diagnosis. No caller owner, source, model,
// calculator, clock or policy; no cache refresh, publication or broker path.
export async function GET(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const params = new URL(request.url).searchParams;
  const id = params.get("scan_run_id");
  if (!id || !/^rec_scan_run_[a-z0-9]{1,16}$/.test(id) ||
    [...params.keys()].some(key => key !== "scan_run_id") || params.getAll("scan_run_id").length !== 1) {
    return NextResponse.json({ error: "One original scan_run_id is required." }, { status: 400, headers });
  }
  const result = await readOwnedScannerHistoricalInputReplay(session.owner_user_id, id);
  return NextResponse.json(result, { status: result.scan_run_id === null ? 404 : 200, headers });
}
