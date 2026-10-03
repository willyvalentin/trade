import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";

export const COMPLETED_INPUT_FIRST_CLOSED_BAR_ALLOCATION_POLICY_VERSION =
  "completed_input_first_closed_bar_allocation_v1" as const;

/** A possible closed bar is not proof that the provider supplies fresh data. */
export function resolveCompletedInputIntradaySessionAdmission(now: Date) {
  const unavailable = {
    policy_version: COMPLETED_INPUT_FIRST_CLOSED_BAR_ALLOCATION_POLICY_VERSION,
    allow_provider_refresh: false,
    reason_code: "regular_session_unavailable" as const,
  };
  if (!Number.isFinite(now.getTime())) return unavailable;
  const session = getUsEquityMarketSession(now);
  if (session.verification_status !== "verified" || session.freshness_status !== "current" ||
    !session.session_open || !session.session_close ||
    now.getTime() < Date.parse(session.session_open) || now.getTime() >= Date.parse(session.session_close)) return unavailable;
  // The completed-input scanner requests 5min candles from this session's open.
  // Before the first close there can be no admissible current price in that response.
  const firstClosedBarPossible = now.getTime() >= Date.parse(session.session_open) + 5 * 60 * 1000;
  return {
    policy_version: COMPLETED_INPUT_FIRST_CLOSED_BAR_ALLOCATION_POLICY_VERSION,
    allow_provider_refresh: firstClosedBarPossible,
    reason_code: firstClosedBarPossible ? "closed_bar_possible" as const : "first_closed_bar_pending" as const,
  };
}

export const INTRADAY_INDICATOR_REFRESH_ALLOCATION_POLICY_VERSION =
  "intraday_indicator_refresh_allocation_v1" as const;

export type IntradayIndicatorRefreshAdmission = {
  policy_version: typeof INTRADAY_INDICATOR_REFRESH_ALLOCATION_POLICY_VERSION;
  disposition:
    | "reuse_fresh_cache"
    | "reserve_provider_refresh"
    | "provider_refresh_not_admitted";
  reason_code:
    | "fresh_cache_available"
    | "provider_refresh_budget_available"
    | "provider_refresh_budget_exhausted"
    | "provider_refresh_budget_invalid";
  allow_fresh_fetch: boolean;
  reserve_provider_credit: boolean;
};

type RefreshAdmissionInput = {
  cache: {
    source: "cache" | "fresh" | "unavailable";
    has_indicators: boolean;
    stale: boolean;
  };
  fresh_provider_calls_used: number;
  max_fresh_provider_calls: number;
  fresh_indicator_fetches_used: number;
  max_fresh_indicator_fetches: number;
};

function isNonNegativeInteger(value: number) {
  return Number.isSafeInteger(value) && value >= 0;
}

/**
 * Decides whether an already loaded indicator cache can satisfy a scanner
 * candidate before the scanner reserves one of its bounded provider calls.
 *
 * This is intentionally pure: it cannot inspect a cache, make a request, or
 * mutate a budget. The scanner still increments its provider-call counter
 * immediately before a refresh-capable helper can reach Twelve Data.
 */
export function resolveIntradayIndicatorRefreshAdmission(
  input: RefreshAdmissionInput,
): IntradayIndicatorRefreshAdmission {
  const freshCacheAvailable =
    input.cache.source === "cache" &&
    input.cache.has_indicators &&
    input.cache.stale === false;

  if (freshCacheAvailable) {
    return {
      policy_version: INTRADAY_INDICATOR_REFRESH_ALLOCATION_POLICY_VERSION,
      disposition: "reuse_fresh_cache",
      reason_code: "fresh_cache_available",
      allow_fresh_fetch: false,
      reserve_provider_credit: false,
    };
  }

  const countersAreValid = [
    input.fresh_provider_calls_used,
    input.max_fresh_provider_calls,
    input.fresh_indicator_fetches_used,
    input.max_fresh_indicator_fetches,
  ].every(isNonNegativeInteger);

  if (!countersAreValid) {
    return {
      policy_version: INTRADAY_INDICATOR_REFRESH_ALLOCATION_POLICY_VERSION,
      disposition: "provider_refresh_not_admitted",
      reason_code: "provider_refresh_budget_invalid",
      allow_fresh_fetch: false,
      reserve_provider_credit: false,
    };
  }

  const refreshBudgetAvailable =
    input.fresh_provider_calls_used < input.max_fresh_provider_calls &&
    input.fresh_indicator_fetches_used < input.max_fresh_indicator_fetches;

  if (!refreshBudgetAvailable) {
    return {
      policy_version: INTRADAY_INDICATOR_REFRESH_ALLOCATION_POLICY_VERSION,
      disposition: "provider_refresh_not_admitted",
      reason_code: "provider_refresh_budget_exhausted",
      allow_fresh_fetch: false,
      reserve_provider_credit: false,
    };
  }

  return {
    policy_version: INTRADAY_INDICATOR_REFRESH_ALLOCATION_POLICY_VERSION,
    disposition: "reserve_provider_refresh",
    reason_code: "provider_refresh_budget_available",
    allow_fresh_fetch: true,
    reserve_provider_credit: true,
  };
}
