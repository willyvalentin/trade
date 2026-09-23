export const LIVE_REFERENCE_FRESHNESS_POLICY_VERSION =
  "live_reference_market_time_v1" as const;

// This bounds the age of the underlying price observation, not merely the
// time at which a provider response or cache entry was fetched.
export const MAX_LIVE_REFERENCE_MARKET_DATA_AGE_MS = 15 * 60 * 1000;

export function isFreshLiveReferenceMarketTime(
  timestamp: unknown,
  nowMs = Date.now(),
) {
  if (
    typeof timestamp !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      timestamp,
    )
  ) {
    return false;
  }

  const observedMs = Date.parse(timestamp);
  const ageMs = nowMs - observedMs;
  return (
    Number.isFinite(nowMs) &&
    Number.isFinite(observedMs) &&
    ageMs >= 0 &&
    ageMs <= MAX_LIVE_REFERENCE_MARKET_DATA_AGE_MS
  );
}
