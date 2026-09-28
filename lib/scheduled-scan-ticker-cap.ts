import type { ProviderPlanProfileMode } from "@/lib/provider-plan-profile";

export const MAX_SCHEDULED_SCAN_TICKERS = 50;
export const SCHEDULED_REFERENCE_REFRESH_DEFAULT_MAX_ATTEMPTS = 10;
export const BASIC_FREE_SCHEDULED_SCAN_PER_MINUTE_CREDIT_CAP = 8;
export const BASIC_FREE_SCHEDULED_SCAN_MARKET_REGIME_CREDITS = 2;
export const BASIC_FREE_SCHEDULED_SCAN_SCANNER_CREDITS = 6;
export const SCHEDULED_SCAN_PROVIDER_EXECUTION_POLICY_VERSION =
  "scheduled_scan_provider_execution_v1" as const;

export type ScheduledScanTickerCap = {
  effective_cap: number;
  plan_cap_applied: boolean;
};

/**
 * The normal scheduled scan needs fresh evidence before ranking can select a
 * candidate. Basic Free has an eight-credit per-minute ceiling, so two calls
 * remain reserved for SPY/QQQ regime context and every remaining call is
 * allocated to the scanner's shared daily/intraday pre-ranking budget.
 * Post-ranking reference refresh is disabled for this profile: allocating
 * credits there can deadlock on stale pre-ranking evidence and leave those
 * credits unreachable. This is a per-scan upper bound; it does not represent
 * a provider usage receipt.
 */
export type ScheduledScanProviderCreditBudget = {
  policy_version: "scheduled_scan_provider_credit_budget_v2";
  plan_mode: Exclude<ProviderPlanProfileMode, "unknown">;
  enforced: boolean;
  per_minute_credit_cap: number | null;
  market_regime_credits_reserved: number;
  scanner_credits_reserved: number;
  reference_refresh_max_attempts: number;
  max_known_credits_per_scan: number | null;
};

export type ScheduledScanProviderExecutionPlan = Readonly<{
  policy_version: typeof SCHEDULED_SCAN_PROVIDER_EXECUTION_POLICY_VERSION;
  scanner_provider_call_cap: number;
  inter_call_delay_ms: number;
  known_pacing_overhead_ms: number;
  route_timeout_ms: number;
  cleanup_reserve_ms: number;
  usable_route_budget_ms: number;
  atomic_credit_reservation_required: boolean;
  status: "ready" | "invalid";
}>;

export function resolveScheduledScanProviderCreditBudget(input: {
  planMode: Exclude<ProviderPlanProfileMode, "unknown">;
}): ScheduledScanProviderCreditBudget {
  if (input.planMode !== "free") {
    return {
      policy_version: "scheduled_scan_provider_credit_budget_v2",
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
  const referenceRefreshMaxAttempts = 0;

  return {
    policy_version: "scheduled_scan_provider_credit_budget_v2",
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

export function resolveScheduledScannerProviderCallCap(input: {
  budget: ScheduledScanProviderCreditBudget | null;
  candidateCount: number;
}) {
  if (input.budget?.enforced) {
    return Math.max(0, Math.floor(input.budget.scanner_credits_reserved));
  }

  // Preserve the existing paid/unknown scheduled behavior. This slice only
  // reallocates the explicitly guarded Basic Free eight-credit reservation.
  return Math.min(1, Math.max(0, Math.floor(input.candidateCount)));
}

/**
 * A granted Basic Free reservation already bounds the whole scan to eight
 * credits in the provider minute. Applying the legacy eight-second delay to
 * each of the six scanner calls adds forty seconds of deterministic waiting to
 * a 23-second function. Remove only that redundant pacing for the atomically
 * reserved path; unknown/paid paths retain the conservative delay.
 */
export function resolveScheduledScanProviderExecutionPlan(input: {
  budget: ScheduledScanProviderCreditBudget | null;
  routeTimeoutMs: number;
  cleanupReserveMs: number;
  defaultInterCallDelayMs: number;
}): ScheduledScanProviderExecutionPlan {
  const routeTimeoutMs = boundedNonNegative(input.routeTimeoutMs);
  const cleanupReserveMs = boundedNonNegative(input.cleanupReserveMs);
  const usableRouteBudgetMs = Math.max(0, routeTimeoutMs - cleanupReserveMs);
  const scannerProviderCallCap = resolveScheduledScannerProviderCallCap({
    budget: input.budget,
    candidateCount: input.budget?.enforced
      ? input.budget.scanner_credits_reserved
      : 1,
  });
  const atomicCreditReservationRequired = input.budget?.enforced === true;
  const interCallDelayMs = atomicCreditReservationRequired
    ? 0
    : boundedNonNegative(input.defaultInterCallDelayMs);
  const knownPacingOverheadMs =
    Math.max(0, scannerProviderCallCap - 1) * interCallDelayMs;
  const status =
    scannerProviderCallCap > 0 &&
    usableRouteBudgetMs > 0 &&
    knownPacingOverheadMs < usableRouteBudgetMs
      ? "ready"
      : "invalid";

  return Object.freeze({
    policy_version: SCHEDULED_SCAN_PROVIDER_EXECUTION_POLICY_VERSION,
    scanner_provider_call_cap: scannerProviderCallCap,
    inter_call_delay_ms: interCallDelayMs,
    known_pacing_overhead_ms: knownPacingOverheadMs,
    route_timeout_ms: routeTimeoutMs,
    cleanup_reserve_ms: cleanupReserveMs,
    usable_route_budget_ms: usableRouteBudgetMs,
    atomic_credit_reservation_required: atomicCreditReservationRequired,
    status,
  });
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

function boundedNonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}
