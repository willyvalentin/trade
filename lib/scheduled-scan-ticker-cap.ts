import type { ProviderPlanProfileMode } from "@/lib/provider-plan-profile";

export const MAX_SCHEDULED_SCAN_TICKERS = 50;
export const SCHEDULED_REFERENCE_REFRESH_DEFAULT_MAX_ATTEMPTS = 10;
export const BASIC_FREE_SCHEDULED_SCAN_PER_MINUTE_CREDIT_CAP = 8;
export const BASIC_FREE_SCHEDULED_SCAN_MARKET_REGIME_CREDITS = 2;
export const BASIC_FREE_SCHEDULED_SCAN_SCANNER_CREDITS = 1;

export type ScheduledScanTickerCap = {
  effective_cap: number;
  plan_cap_applied: boolean;
};

/**
 * The normal scheduled scan makes its known Twelve Data calls in three
 * stages: SPY/QQQ regime, one fresh scanner candidate, then selected-candidate
 * reference refreshes. Basic Free has an eight-credit per-minute ceiling, so
 * reserve the first three calls before admitting reference refreshes. This is
 * a per-scan upper bound; it does not represent a provider usage receipt.
 */
export type ScheduledScanProviderCreditBudget = {
  policy_version: "scheduled_scan_provider_credit_budget_v1";
  plan_mode: Exclude<ProviderPlanProfileMode, "unknown">;
  enforced: boolean;
  per_minute_credit_cap: number | null;
  market_regime_credits_reserved: number;
  scanner_credits_reserved: number;
  reference_refresh_max_attempts: number;
  max_known_credits_per_scan: number | null;
};

export function resolveScheduledScanProviderCreditBudget(input: {
  planMode: Exclude<ProviderPlanProfileMode, "unknown">;
}): ScheduledScanProviderCreditBudget {
  if (input.planMode !== "free") {
    return {
      policy_version: "scheduled_scan_provider_credit_budget_v1",
      plan_mode: input.planMode,
      enforced: false,
      per_minute_credit_cap: null,
      market_regime_credits_reserved: 0,
      scanner_credits_reserved: 0,
      reference_refresh_max_attempts:
        SCHEDULED_REFERENCE_REFRESH_DEFAULT_MAX_ATTEMPTS,
      max_known_credits_per_scan: null,
    };
  }

  const reservedCredits =
    BASIC_FREE_SCHEDULED_SCAN_MARKET_REGIME_CREDITS +
    BASIC_FREE_SCHEDULED_SCAN_SCANNER_CREDITS;
  const referenceRefreshMaxAttempts = Math.max(
    0,
    BASIC_FREE_SCHEDULED_SCAN_PER_MINUTE_CREDIT_CAP - reservedCredits,
  );

  return {
    policy_version: "scheduled_scan_provider_credit_budget_v1",
    plan_mode: input.planMode,
    enforced: true,
    per_minute_credit_cap: BASIC_FREE_SCHEDULED_SCAN_PER_MINUTE_CREDIT_CAP,
    market_regime_credits_reserved:
      BASIC_FREE_SCHEDULED_SCAN_MARKET_REGIME_CREDITS,
    scanner_credits_reserved: BASIC_FREE_SCHEDULED_SCAN_SCANNER_CREDITS,
    reference_refresh_max_attempts: referenceRefreshMaxAttempts,
    max_known_credits_per_scan:
      reservedCredits + referenceRefreshMaxAttempts,
  };
}

/**
 * Basic Free has an eight-credit per-minute provider quota. A caller may ask
 * for a smaller scan, but cannot use an environment or route override to
 * enlarge that plan's bounded scan beyond its configured Free-safe profile.
 */
export function resolveScheduledScanTickerCap(input: {
  requestedCap: number;
  profileCap: number;
  planMode: Exclude<ProviderPlanProfileMode, "unknown">;
}): ScheduledScanTickerCap {
  const requestedCap = boundedPositive(input.requestedCap, MAX_SCHEDULED_SCAN_TICKERS);
  const profileCap = boundedPositive(input.profileCap, MAX_SCHEDULED_SCAN_TICKERS);
  const freePlanCapApplies = input.planMode === "free";
  const effectiveCap = freePlanCapApplies
    ? Math.min(requestedCap, profileCap)
    : requestedCap;

  return {
    effective_cap: effectiveCap,
    plan_cap_applied: freePlanCapApplies && effectiveCap < requestedCap,
  };
}

function boundedPositive(value: number, maximum: number) {
  return Math.max(1, Math.min(maximum, Math.round(value)));
}
