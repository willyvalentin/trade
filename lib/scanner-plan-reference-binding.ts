export const SCANNER_PLAN_REFERENCE_BINDING_VERSION =
  "scanner_plan_reference_binding_v2" as const;

export type ScannerPlanReference = Readonly<{
  reference_price_used_for_plan: number | null;
  reference_price_source: string | null;
  reference_price_timestamp: string | null;
  reference_price_provider: string | null;
  reference_price_read_path: string | null;
}>;

type IntradayPlanReferenceInput = Readonly<{
  source: "cache" | "fresh" | "unavailable";
  stale: boolean;
  latest_price: number | null;
  latest_candle_timestamp: string | null;
}>;

function exactTimestamp(value: string | null) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

/**
 * Binds the candidate's plan reference to the same fresh intraday observation
 * used by the scanner. Daily features remain available for ranking, but their
 * older candle timestamp must not remain the primary price lineage after a
 * fresh intraday price has superseded it.
 */
export function bindScannerPlanReference(input: {
  fallback: ScannerPlanReference;
  intraday: IntradayPlanReferenceInput;
}): ScannerPlanReference {
  const timestamp = exactTimestamp(input.intraday.latest_candle_timestamp);
  const price = input.intraday.latest_price;
  const usableIntradayReference =
    (input.intraday.source === "fresh" || input.intraday.source === "cache") &&
    input.intraday.stale === false &&
    typeof price === "number" &&
    Number.isFinite(price) &&
    price > 0 &&
    timestamp !== null;

  if (!usableIntradayReference) {
    return Object.freeze({ ...input.fallback });
  }

  return Object.freeze({
    reference_price_used_for_plan: price,
    reference_price_source: "scanner_candidate_intraday_latest_price",
    reference_price_timestamp: timestamp,
    reference_price_provider: "twelve_data",
    reference_price_read_path:
      "scanner_candidate.intraday_indicators.latestPrice",
  });
}
