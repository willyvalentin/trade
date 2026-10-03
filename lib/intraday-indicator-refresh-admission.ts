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
