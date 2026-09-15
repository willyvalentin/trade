import type { ProviderPlanProfileMode } from "@/lib/provider-plan-profile";

export const MAX_SCHEDULED_SCAN_TICKERS = 50;

export type ScheduledScanTickerCap = {
  effective_cap: number;
  plan_cap_applied: boolean;
};

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
