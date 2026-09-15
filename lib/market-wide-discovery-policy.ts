import type { ProviderPlanProfileMode } from "@/lib/provider-plan-profile";

export const MARKET_WIDE_DISCOVERY_POLICY_VERSION =
  "us_equity_market_wide_discovery_v1" as const;
export const TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST = 100;
export const TWELVE_DATA_SYMBOL_MASTER_CREDITS_PER_REQUEST = 1;
export const MARKET_WIDE_DISCOVERY_MIN_REFRESH_MINUTES = 15;
export const MARKET_WIDE_DISCOVERY_ERROR_BACKOFF_MINUTES = 30;

export type MarketWideDiscoveryDirection = "gainers" | "losers";

export type MarketWideDiscoveryAttemptOutcome =
  | "available"
  | "empty"
  | "provider_error"
  | "rate_limited"
  | "not_attempted";

export type MarketWideDiscoveryAdmissionStatus =
  | "disabled"
  | "plan_ineligible"
  | "budget_not_declared"
  | "budget_insufficient"
  | "refresh_interval_active"
  | "error_backoff_active"
  | "ready";

export type MarketWideDiscoveryReasonCode =
  | "runtime_disabled"
  | "plan_not_pro"
  | "daily_credit_budget_not_declared"
  | "daily_credit_budget_below_request"
  | "recent_discovery_refresh"
  | "recent_provider_error"
  | "admitted";

export type MarketWideDiscoveryPreviousAttempt = {
  attempted_at: string | null;
  outcome: MarketWideDiscoveryAttemptOutcome;
};

export type MarketWideDiscoveryAdmission = {
  policy_version: typeof MARKET_WIDE_DISCOVERY_POLICY_VERSION;
  status: MarketWideDiscoveryAdmissionStatus;
  safe_to_request_dynamic_movers: boolean;
  configured_plan_mode: ProviderPlanProfileMode;
  plan_eligibility: "unverified" | "ineligible" | "configured_pro";
  runtime_enabled: boolean;
  directions: MarketWideDiscoveryDirection[];
  requests_planned: number;
  credits_per_request: typeof TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST;
  requested_credits: number;
  declared_daily_credit_budget: number | null;
  next_retry_at: string | null;
  reason_codes: MarketWideDiscoveryReasonCode[];
  symbol_master: {
    provider: "twelve_data";
    endpoint: "/stocks";
    credits_per_refresh: typeof TWELVE_DATA_SYMBOL_MASTER_CREDITS_PER_REQUEST;
    freshness_contract: "daily_reference_catalog";
    status: "not_collected";
  };
  dynamic_movers: {
    provider: "twelve_data";
    endpoint: "/market_movers/stocks";
    freshness_contract: "point_in_time_regular_session_snapshot";
    relative_volume_status: "not_available_from_market_movers_v1";
  };
};

export type MarketWideDiscoveryAdmissionInput = {
  planMode?: ProviderPlanProfileMode | string | null;
  runtimeEnabled?: boolean;
  dailyCreditBudget?: number | null;
  directions?: MarketWideDiscoveryDirection[];
  previousAttempt?: MarketWideDiscoveryPreviousAttempt | null;
  minRefreshMinutes?: number;
  errorBackoffMinutes?: number;
  now?: Date;
};

export function buildMarketWideDiscoveryAdmission(
  input: MarketWideDiscoveryAdmissionInput = {},
): MarketWideDiscoveryAdmission {
  const now = validDate(input.now) ?? new Date();
  const planMode = normalizePlanMode(input.planMode);
  const runtimeEnabled = input.runtimeEnabled === true;
  const directions = normalizeDirections(input.directions);
  const requestedCredits =
    directions.length * TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST;
  const dailyCreditBudget = finiteNonNegative(input.dailyCreditBudget);
  const minRefreshMinutes = positiveMinutes(
    input.minRefreshMinutes,
    MARKET_WIDE_DISCOVERY_MIN_REFRESH_MINUTES,
  );
  const errorBackoffMinutes = positiveMinutes(
    input.errorBackoffMinutes,
    MARKET_WIDE_DISCOVERY_ERROR_BACKOFF_MINUTES,
  );
  const base: Omit<
    MarketWideDiscoveryAdmission,
    | "status"
    | "safe_to_request_dynamic_movers"
    | "next_retry_at"
    | "reason_codes"
  > = {
    policy_version: MARKET_WIDE_DISCOVERY_POLICY_VERSION,
    configured_plan_mode: planMode,
    plan_eligibility:
      planMode === "pro"
        ? ("configured_pro" as const)
        : planMode === "unknown"
          ? ("unverified" as const)
          : ("ineligible" as const),
    runtime_enabled: runtimeEnabled,
    directions,
    requests_planned: directions.length,
    credits_per_request: TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST,
    requested_credits: requestedCredits,
    declared_daily_credit_budget: dailyCreditBudget,
    symbol_master: {
      provider: "twelve_data" as const,
      endpoint: "/stocks",
      credits_per_refresh: TWELVE_DATA_SYMBOL_MASTER_CREDITS_PER_REQUEST,
      freshness_contract: "daily_reference_catalog" as const,
      status: "not_collected" as const,
    },
    dynamic_movers: {
      provider: "twelve_data" as const,
      endpoint: "/market_movers/stocks",
      freshness_contract: "point_in_time_regular_session_snapshot" as const,
      relative_volume_status: "not_available_from_market_movers_v1" as const,
    },
  };

  if (!runtimeEnabled) {
    return blocked(base, "disabled", "runtime_disabled", null);
  }

  if (planMode !== "pro") {
    return blocked(base, "plan_ineligible", "plan_not_pro", null);
  }

  if (dailyCreditBudget === null) {
    return blocked(
      base,
      "budget_not_declared",
      "daily_credit_budget_not_declared",
      null,
    );
  }

  if (dailyCreditBudget < requestedCredits) {
    return blocked(
      base,
      "budget_insufficient",
      "daily_credit_budget_below_request",
      null,
    );
  }

  const previousAttempt = normalizePreviousAttempt(input.previousAttempt);
  const attemptedAt = previousAttempt?.attempted_at
    ? validDate(new Date(previousAttempt.attempted_at))
    : null;

  if (attemptedAt) {
    const errorBackoff =
      previousAttempt?.outcome === "provider_error" ||
      previousAttempt?.outcome === "rate_limited";
    const retryAt = new Date(
      attemptedAt.getTime() +
        (errorBackoff ? errorBackoffMinutes : minRefreshMinutes) * 60 * 1000,
    );

    if (now.getTime() < retryAt.getTime()) {
      return blocked(
        base,
        errorBackoff ? "error_backoff_active" : "refresh_interval_active",
        errorBackoff ? "recent_provider_error" : "recent_discovery_refresh",
        retryAt.toISOString(),
      );
    }
  }

  return {
    ...base,
    status: "ready",
    safe_to_request_dynamic_movers: true,
    next_retry_at: null,
    reason_codes: ["admitted"],
  };
}

export function marketWideDiscoveryPreviousAttemptFromUnknown(
  value: unknown,
): MarketWideDiscoveryPreviousAttempt | null {
  if (typeof value !== "object" || value === null) return null;

  const summary = value as Record<string, unknown>;
  const attempt =
    typeof summary.attempt === "object" && summary.attempt !== null
      ? (summary.attempt as Record<string, unknown>)
      : null;
  const attemptedAt = text(attempt?.attempted_at);
  const outcome = attempt?.outcome;

  if (!attemptedAt || !isAttemptOutcome(outcome)) return null;

  const parsedAttemptedAt = new Date(attemptedAt);
  if (!Number.isFinite(parsedAttemptedAt.getTime())) return null;

  return {
    attempted_at: parsedAttemptedAt.toISOString(),
    outcome,
  };
}

function blocked(
  base: Omit<
    MarketWideDiscoveryAdmission,
    | "status"
    | "safe_to_request_dynamic_movers"
    | "next_retry_at"
    | "reason_codes"
  >,
  status: Exclude<MarketWideDiscoveryAdmissionStatus, "ready">,
  reason: MarketWideDiscoveryReasonCode,
  nextRetryAt: string | null,
): MarketWideDiscoveryAdmission {
  return {
    ...base,
    status,
    safe_to_request_dynamic_movers: false,
    next_retry_at: nextRetryAt,
    reason_codes: [reason],
  };
}

function normalizePlanMode(
  value: MarketWideDiscoveryAdmissionInput["planMode"],
): ProviderPlanProfileMode {
  if (
    value === "free" ||
    value === "grow" ||
    value === "pro" ||
    value === "custom" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeDirections(
  values: MarketWideDiscoveryDirection[] | undefined,
): MarketWideDiscoveryDirection[] {
  const directions = (values ?? ["gainers"])
    .filter((value) => value === "gainers" || value === "losers")
    .filter((value, index, items) => items.indexOf(value) === index);

  return directions.length > 0 ? directions : ["gainers"];
}

function normalizePreviousAttempt(
  value: MarketWideDiscoveryPreviousAttempt | null | undefined,
) {
  if (!value?.attempted_at || !isAttemptOutcome(value.outcome)) return null;
  const attemptedAt = validDate(new Date(value.attempted_at));

  return attemptedAt
    ? { attempted_at: attemptedAt.toISOString(), outcome: value.outcome }
    : null;
}

function isAttemptOutcome(value: unknown): value is MarketWideDiscoveryAttemptOutcome {
  return (
    value === "available" ||
    value === "empty" ||
    value === "provider_error" ||
    value === "rate_limited" ||
    value === "not_attempted"
  );
}

function finiteNonNegative(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null;
}

function positiveMinutes(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.round(value))
    : fallback;
}

function validDate(value: Date | undefined | null) {
  return value instanceof Date && Number.isFinite(value.getTime()) ? value : null;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
