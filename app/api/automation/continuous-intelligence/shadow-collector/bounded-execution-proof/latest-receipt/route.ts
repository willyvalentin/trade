import { NextResponse } from "next/server";

import {
  boundedShadowCollectorLatestProofReceiptRoutePath,
  boundedShadowCollectorLiveProofReceiptContractVersion,
  boundedShadowCollectorLiveProofReceiptRouteMarker,
  boundedShadowCollectorLatestProofReceiptStore,
} from "@/lib/bounded-shadow-collector-live-proof-receipt";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

export async function GET(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const providedSecret = request.headers.get("x-automation-secret");
  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return json(
      {
        error: "Unauthorized.",
        contract_version: boundedShadowCollectorLiveProofReceiptContractVersion,
        route_marker: boundedShadowCollectorLiveProofReceiptRouteMarker,
        route_path: boundedShadowCollectorLatestProofReceiptRoutePath,
        authentication: { authenticated: false, failure_reason: "missing_or_invalid_automation_auth" },
      },
      401,
    );
  }
  const latestReceipt = boundedShadowCollectorLatestProofReceiptStore.latest();
  return json({
    contract_version: boundedShadowCollectorLiveProofReceiptContractVersion,
    route_marker: boundedShadowCollectorLiveProofReceiptRouteMarker,
    route_path: boundedShadowCollectorLatestProofReceiptRoutePath,
    status: latestReceipt ? "observed" : "not_observed",
    latest_receipt: latestReceipt,
    provider_calls_executed: false,
    runtime_capacity_reserved: false,
  });
}
