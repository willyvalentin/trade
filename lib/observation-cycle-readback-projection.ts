import type {
  ObservationCycleDisposition,
  ObservationCycleReadback,
  ObservationCycleReceipt,
  ObservationCycleStatus,
} from "@/lib/observation-cycle-receipt";

export const OBSERVATION_CYCLE_SCAN_READBACK_PROJECTION_VERSION =
  "observation_cycle_scan_readback_projection_v1" as const;

export type ObservationCycleScanReadbackProjection = Readonly<{
  projection_version: typeof OBSERVATION_CYCLE_SCAN_READBACK_PROJECTION_VERSION;
  result: string;
  created_at: string;
  finalized_at: string | null;
  receipt_generated_at: string;
  scan_window: null;
  visible_recommendation_count: number;
  message: string;
  source: "observation_cycle_receipts";
  cycle_fingerprint: string;
  scan_run_fingerprint: string | null;
  cycle_status: ObservationCycleStatus;
  disposition: ObservationCycleDisposition;
  trigger_kind: ObservationCycleReceipt["trigger"]["kind"];
  market_session: string | null;
  provider_request_status: ObservationCycleReceipt["provider_request"]["status"];
  freshness_status: ObservationCycleReceipt["freshness"]["status"];
  discovery_evaluation_status: ObservationCycleReceipt["discovery_evaluation"]["status"];
  publication_status: ObservationCycleReceipt["publication"]["status"];
  decision_reason_codes: readonly string[];
}>;

export type ObservationCycleScanReadbackSelection = Readonly<{
  projection_version: typeof OBSERVATION_CYCLE_SCAN_READBACK_PROJECTION_VERSION;
  source_status: ObservationCycleReadback["status"] | "unavailable";
  latest_attempted_cycle: ObservationCycleScanReadbackProjection | null;
  latest_completed_evaluation: ObservationCycleScanReadbackProjection | null;
  eligible_cycle_count: number;
}>;

const tradingDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function newYorkDateFromIso(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  const year = values.get("year");
  const month = values.get("month");
  const day = values.get("day");
  return year && month && day ? `${year}-${month}-${day}` : null;
}

function receiptTradingDate(receipt: ObservationCycleReceipt) {
  return newYorkDateFromIso(
    receipt.trigger.scheduled_slot_started_at_utc ??
      receipt.trigger.occurred_at,
  );
}

function resultForReceipt(receipt: ObservationCycleReceipt) {
  if (
    receipt.disposition === "published" ||
    receipt.publication.status === "published" ||
    receipt.publication.published_count > 0 ||
    receipt.publication.recommendations_created > 0
  ) {
    return "recommendation_created";
  }
  return receipt.disposition;
}

function messageForReceipt(receipt: ObservationCycleReceipt) {
  return receipt.decision.reason_codes[0] ?? receipt.decision.outcome;
}

function toProjection(
  receipt: ObservationCycleReceipt,
): ObservationCycleScanReadbackProjection {
  const cycleStartedAt =
    receipt.trigger.scheduled_slot_started_at_utc ?? receipt.trigger.occurred_at;

  return Object.freeze({
    projection_version: OBSERVATION_CYCLE_SCAN_READBACK_PROJECTION_VERSION,
    result: resultForReceipt(receipt),
    // Compatibility consumers call this field created_at, but for a cycle it
    // represents the attributable attempt time. A late terminal write must not
    // make an older cycle appear newer than a later scheduled attempt.
    created_at: cycleStartedAt,
    finalized_at: receipt.finalized_at,
    receipt_generated_at: receipt.receipt_generated_at,
    scan_window: null,
    visible_recommendation_count: Math.max(
      receipt.publication.published_count,
      receipt.publication.recommendations_created,
    ),
    message: messageForReceipt(receipt),
    source: "observation_cycle_receipts",
    cycle_fingerprint: receipt.cycle_fingerprint,
    scan_run_fingerprint: receipt.scan_run_fingerprint,
    cycle_status: receipt.cycle_status,
    disposition: receipt.disposition,
    trigger_kind: receipt.trigger.kind,
    market_session: receipt.admission.market_session,
    provider_request_status: receipt.provider_request.status,
    freshness_status: receipt.freshness.status,
    discovery_evaluation_status: receipt.discovery_evaluation.status,
    publication_status: receipt.publication.status,
    decision_reason_codes: Object.freeze([...receipt.decision.reason_codes]),
  });
}

function isCompletedEvaluation(receipt: ObservationCycleReceipt) {
  return (
    receipt.cycle_status === "completed" &&
    (receipt.disposition === "evaluated" ||
      receipt.disposition === "no_trade" ||
      receipt.disposition === "published")
  );
}

export function buildObservationCycleScanReadbackSelection(input: {
  readback: ObservationCycleReadback | null | undefined;
  tradingDate: string;
}): ObservationCycleScanReadbackSelection {
  if (
    !input.readback ||
    input.readback.status === "unavailable" ||
    !tradingDatePattern.test(input.tradingDate)
  ) {
    return Object.freeze({
      projection_version: OBSERVATION_CYCLE_SCAN_READBACK_PROJECTION_VERSION,
      source_status: input.readback?.status ?? "unavailable",
      latest_attempted_cycle: null,
      latest_completed_evaluation: null,
      eligible_cycle_count: 0,
    });
  }

  const seen = new Set<string>();
  const eligibleReceipts = [...input.readback.receipts]
    .filter((receipt) => receipt.trigger.kind !== "manual_diagnostic")
    .filter((receipt) => receiptTradingDate(receipt) === input.tradingDate)
    .sort((first, second) => {
      const firstStartedAt =
        first.trigger.scheduled_slot_started_at_utc ?? first.trigger.occurred_at;
      const secondStartedAt =
        second.trigger.scheduled_slot_started_at_utc ?? second.trigger.occurred_at;
      return secondStartedAt.localeCompare(firstStartedAt);
    })
    .filter((receipt) => {
      if (seen.has(receipt.cycle_fingerprint)) return false;
      seen.add(receipt.cycle_fingerprint);
      return true;
    });

  const latestAttempted = eligibleReceipts[0] ?? null;
  const latestCompleted = eligibleReceipts.find(isCompletedEvaluation) ?? null;

  return Object.freeze({
    projection_version: OBSERVATION_CYCLE_SCAN_READBACK_PROJECTION_VERSION,
    source_status: input.readback.status,
    latest_attempted_cycle: latestAttempted
      ? toProjection(latestAttempted)
      : null,
    latest_completed_evaluation: latestCompleted
      ? toProjection(latestCompleted)
      : null,
    eligible_cycle_count: eligibleReceipts.length,
  });
}
