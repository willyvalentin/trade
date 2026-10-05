import { NextResponse } from "next/server";
import { requireApplicationSession, applicationSessionUnauthorizedResponse } from "@/lib/server/application-session";
import { readOwnedScannerOriginalInputReplay } from "@/lib/server/scanner-original-input-replay";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

// One owned original run; no supplied source, model, owner, policy or clock.
// This diagnostic reads only. A match is not input fitness or trade authority.
export async function GET(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const params = new URL(request.url).searchParams, id = params.get("scan_run_id");
  if (!id || !/^rec_scan_run_[a-z0-9]{1,16}$/.test(id) || params.getAll("scan_run_id").length !== 1 ||
    [...params.keys()].some(key => key !== "scan_run_id")) {
    return NextResponse.json({ error: "One original scan_run_id is required." }, { status: 400, headers });
  }
  const result = await readOwnedScannerOriginalInputReplay(session.owner_user_id, id);
  return NextResponse.json(result, { status: result.scan_run_id === null ? 404 : 200, headers });
}
