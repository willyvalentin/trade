import { NextResponse } from "next/server";

import {
  evaluateBasicFreeScheduledScanPreflight,
} from "@/lib/basic-free-scheduled-scan-preflight-readback";
import { readBasicFreeScheduledScanPreflight } from "@/lib/server/basic-free-scheduled-scan-preflight-readback";
import {
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

export const dynamic = "force-dynamic";

function targetSlotFrom(request: Request) {
  const value = new URL(request.url).searchParams.get("target_slot_utc");
  if (typeof value !== "string") return null;
  const target = new Date(value);
  if (
    !Number.isFinite(target.getTime()) ||
    target.getTime() % (15 * 60_000) !== 0 ||
    target.toISOString() !== value
  ) {
    return null;
  }
  return target.toISOString();
}

function newYorkDate(timestamp: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(timestamp);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  const year = values.get("year");
  const month = values.get("month");
  const day = values.get("day");
  return year && month && day ? `${year}-${month}-${day}` : null;
}

/**
 * Read-only, trusted-operator preflight. It cannot arm a scan, mutate a
 * reservation, or invoke a provider; it only reports whether those actions
 * would be safe to consider in a separately authorized scheduler change.
 */
export async function GET(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();

  const targetSlot = targetSlotFrom(request);
  const tradingDate = targetSlot ? newYorkDate(new Date(targetSlot)) : null;
  if (!targetSlot || !tradingDate) {
    return NextResponse.json(
      { status: "invalid_request", reason_codes: ["target_slot_utc_invalid"] },
      { status: 400 },
    );
  }

  const readback = await readBasicFreeScheduledScanPreflight({
    owner_user_id: session.owner_user_id,
    trading_date: tradingDate,
    target_slot_utc: targetSlot,
  });
  const preflight = evaluateBasicFreeScheduledScanPreflight(readback);

  return NextResponse.json(
    {
      contract_version: "basic_free_scheduled_scan_preflight_route_v1",
      target_slot_utc: targetSlot,
      trading_date: tradingDate,
      preflight,
      safety: {
        read_only: true,
        scheduler_activation_allowed: false,
        provider_request_allowed: false,
        broker_action_allowed: false,
      },
    },
    { status: preflight.status === "unavailable" ? 503 : 200 },
  );
}
