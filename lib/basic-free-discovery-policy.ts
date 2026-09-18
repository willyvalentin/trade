import type { ProviderPlanProfileMode } from "@/lib/provider-plan-profile";

export const BASIC_FREE_DISCOVERY_POLICY_VERSION =
  "basic_free_catalog_observation_v2" as const;
export const TWELVE_DATA_BASIC_FREE_CATALOG_CREDITS_PER_REQUEST = 1;
export const TWELVE_DATA_BASIC_FREE_CATALOG_OUTPUT_SIZE = 8;
export const TWELVE_DATA_BASIC_FREE_CATALOG_CAPABILITY_PROBE_OUTPUT_SIZE = 100;

export type BasicFreeCatalogOutputSize =
  | typeof TWELVE_DATA_BASIC_FREE_CATALOG_OUTPUT_SIZE
  | typeof TWELVE_DATA_BASIC_FREE_CATALOG_CAPABILITY_PROBE_OUTPUT_SIZE;

/**
 * The catalog endpoint has two deliberately non-interchangeable uses. A
 * capability probe is evidence about one fixed response size; it is never a
 * wider catalog collection request.
 */
export type BasicFreeCatalogReferenceMode =
  | "catalog_observation"
  | "capability_probe";

export type BasicFreeDiscoveryAttemptOutcome =
  | "available"
  | "empty"
  | "provider_error"
  | "rate_limited"
  | "not_attempted";

export type BasicFreeDiscoveryPreviousAttempt = {
  attempted_at: string;
  trading_date: string;
  outcome: BasicFreeDiscoveryAttemptOutcome;
};

export type BasicFreeDiscoveryAdmissionStatus =
  | "disabled"
  | "plan_ineligible"
  | "budget_not_declared"
  | "budget_invalid"
  | "refresh_interval_active"
  | "daily_credit_limit_reached"
  | "per_minute_credit_limit_reached"
  | "budget_reservation_unavailable"
  | "request_invalid"
  | "ready";

export type BasicFreeDiscoveryReasonCode =
  | "runtime_disabled"
  | "plan_not_basic_free"
  | "daily_credit_budget_not_declared"
  | "per_minute_credit_budget_not_declared"
  | "daily_credit_budget_invalid"
  | "per_minute_credit_budget_invalid"
  | "daily_catalog_already_observed"
  | "daily_catalog_observation_already_claimed"
  | "daily_credit_limit_reached"
  | "per_minute_credit_limit_reached"
  | "basic_free_credit_reservation_unavailable"
  | "credit_reservation_attempt_in_progress"
  | "credit_reservation_already_finalized"
  | "catalog_reference_mode_invalid"
  | "catalog_output_size_invalid"
  | "catalog_reference_mode_output_size_mismatch"
  | "admitted";

export type BasicFreeDiscoveryAdmission = {
  policy_version: typeof BASIC_FREE_DISCOVERY_POLICY_VERSION;
  status: BasicFreeDiscoveryAdmissionStatus;
  safe_to_request_catalog: boolean;
  configured_plan_mode: ProviderPlanProfileMode;
  plan_eligibility: "unverified" | "ineligible" | "configured_basic_free";
  runtime_enabled: boolean;
  endpoint: "/stocks";
  reference_mode: BasicFreeCatalogReferenceMode;
  request: {
    country: "United States";
    type: "Common Stock";
    page: 1;
    outputsize: BasicFreeCatalogOutputSize;
    credits_per_request: typeof TWELVE_DATA_BASIC_FREE_CATALOG_CREDITS_PER_REQUEST;
  };
  declared_daily_credit_budget: number | null;
  declared_per_minute_credit_budget: number | null;
  next_retry_at: string | null;
  reason_codes: BasicFreeDiscoveryReasonCode[];
  coverage_contract: {
    collection_complete: false;
    discovery_feed_allowed: false;
    scope: "one_catalog_page_only";
  };
};

export type BasicFreeDiscoveryAdmissionInput = {
  planMode?: ProviderPlanProfileMode | string | null;
  runtimeEnabled?: boolean;
  dailyCreditBudget?: number | null;
  perMinuteCreditBudget?: number | null;
  previousAttempt?: BasicFreeDiscoveryPreviousAttempt | null;
  referenceMode?: unknown;
  catalogOutputSize?: unknown;
  tradingDate: string;
};

function normalizePlanMode(
  value: ProviderPlanProfileMode | string | null | undefined,
): ProviderPlanProfileMode {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (
    normalized === "free" ||
    normalized === "grow" ||
    normalized === "pro" ||
    normalized === "custom"
  ) {
    return normalized;
  }
  return "unknown";
}

function finitePositive(value: number | null | undefined) {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function catalogOutputSize(value: unknown): BasicFreeCatalogOutputSize | null {
  return value === TWELVE_DATA_BASIC_FREE_CATALOG_OUTPUT_SIZE ||
    value === TWELVE_DATA_BASIC_FREE_CATALOG_CAPABILITY_PROBE_OUTPUT_SIZE
    ? value
    : null;
}

function referenceMode(value: unknown): BasicFreeCatalogReferenceMode | null {
  return value === "catalog_observation" || value === "capability_probe"
    ? value
    : null;
}

function validTradingDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value
  );
}

function blocked(
  input: Omit<
    BasicFreeDiscoveryAdmission,
    "status" | "safe_to_request_catalog" | "next_retry_at" | "reason_codes"
  >,
  status: Exclude<BasicFreeDiscoveryAdmissionStatus, "ready">,
  reason: BasicFreeDiscoveryReasonCode,
): BasicFreeDiscoveryAdmission {
  return {
    ...input,
    status,
    safe_to_request_catalog: false,
    next_retry_at: null,
    reason_codes: [reason],
  };
}

export function buildBasicFreeDiscoveryAdmission(
  input: BasicFreeDiscoveryAdmissionInput,
): BasicFreeDiscoveryAdmission {
  const planMode = normalizePlanMode(input.planMode);
  const dailyCreditBudget = finitePositive(input.dailyCreditBudget);
  const perMinuteCreditBudget = finitePositive(input.perMinuteCreditBudget);
  const outputSize = catalogOutputSize(
    input.catalogOutputSize ?? TWELVE_DATA_BASIC_FREE_CATALOG_OUTPUT_SIZE,
  );
  const mode = referenceMode(input.referenceMode ?? "catalog_observation");
  const base: Omit<
    BasicFreeDiscoveryAdmission,
    "status" | "safe_to_request_catalog" | "next_retry_at" | "reason_codes"
  > = {
    policy_version: BASIC_FREE_DISCOVERY_POLICY_VERSION,
    configured_plan_mode: planMode,
    plan_eligibility:
      planMode === "free"
        ? "configured_basic_free"
        : planMode === "unknown"
          ? "unverified"
          : "ineligible",
    runtime_enabled: input.runtimeEnabled === true,
    endpoint: "/stocks",
    reference_mode: mode ?? "catalog_observation",
    request: {
      country: "United States",
      type: "Common Stock",
      page: 1,
      outputsize:
        outputSize ?? TWELVE_DATA_BASIC_FREE_CATALOG_OUTPUT_SIZE,
      credits_per_request: TWELVE_DATA_BASIC_FREE_CATALOG_CREDITS_PER_REQUEST,
    },
    declared_daily_credit_budget: dailyCreditBudget,
    declared_per_minute_credit_budget: perMinuteCreditBudget,
    coverage_contract: {
      collection_complete: false,
      discovery_feed_allowed: false,
      scope: "one_catalog_page_only",
    },
  };

  if (!input.runtimeEnabled) {
    return blocked(base, "disabled", "runtime_disabled");
  }
  if (outputSize === null) {
    return blocked(base, "request_invalid", "catalog_output_size_invalid");
  }
  if (mode === null) {
    return blocked(base, "request_invalid", "catalog_reference_mode_invalid");
  }
  if (
    (mode === "catalog_observation" &&
      outputSize !== TWELVE_DATA_BASIC_FREE_CATALOG_OUTPUT_SIZE) ||
    (mode === "capability_probe" &&
      outputSize !== TWELVE_DATA_BASIC_FREE_CATALOG_CAPABILITY_PROBE_OUTPUT_SIZE)
  ) {
    return blocked(
      base,
      "request_invalid",
      "catalog_reference_mode_output_size_mismatch",
    );
  }
  if (planMode !== "free") {
    return blocked(base, "plan_ineligible", "plan_not_basic_free");
  }
  if (dailyCreditBudget === null) {
    return blocked(base, "budget_not_declared", "daily_credit_budget_not_declared");
  }
  if (perMinuteCreditBudget === null) {
    return blocked(
      base,
      "budget_not_declared",
      "per_minute_credit_budget_not_declared",
    );
  }
  if (dailyCreditBudget > 800) {
    return blocked(base, "budget_invalid", "daily_credit_budget_invalid");
  }
  if (perMinuteCreditBudget > 8) {
    return blocked(base, "budget_invalid", "per_minute_credit_budget_invalid");
  }

  const previousAttempt = input.previousAttempt;
  if (
    validTradingDate(input.tradingDate) &&
    previousAttempt?.trading_date === input.tradingDate &&
    Number.isFinite(Date.parse(previousAttempt.attempted_at))
  ) {
    return blocked(base, "refresh_interval_active", "daily_catalog_already_observed");
  }

  return {
    ...base,
    status: "ready",
    safe_to_request_catalog: true,
    next_retry_at: null,
    reason_codes: ["admitted"],
  };
}

export function basicFreeDiscoveryPreviousAttemptFromUnknown(
  value: unknown,
): BasicFreeDiscoveryPreviousAttempt | null {
  if (typeof value !== "object" || value === null) return null;
  const summary = value as Record<string, unknown>;
  const attempt =
    typeof summary.attempt === "object" && summary.attempt !== null
      ? (summary.attempt as Record<string, unknown>)
      : null;
  const tradingDate = summary.trading_date;
  const attemptedAt = attempt?.attempted_at;
  const outcome = attempt?.outcome;

  if (
    typeof attemptedAt !== "string" ||
    !Number.isFinite(Date.parse(attemptedAt)) ||
    typeof tradingDate !== "string" ||
    !validTradingDate(tradingDate) ||
    !isAttemptOutcome(outcome)
  ) {
    return null;
  }

  return {
    attempted_at: new Date(attemptedAt).toISOString(),
    trading_date: tradingDate,
    outcome,
  };
}

export function blockBasicFreeDiscoveryAdmissionForReservation(
  admission: BasicFreeDiscoveryAdmission,
  reason:
    | "daily_catalog_observation_already_claimed"
    | "daily_credit_limit_reached"
    | "per_minute_credit_limit_reached"
    | "basic_free_credit_reservation_unavailable"
    | "credit_reservation_attempt_in_progress"
    | "credit_reservation_already_finalized",
): BasicFreeDiscoveryAdmission {
  return {
    ...admission,
    status:
      reason === "daily_catalog_observation_already_claimed"
        ? "refresh_interval_active"
        : reason === "daily_credit_limit_reached"
        ? "daily_credit_limit_reached"
        : reason === "per_minute_credit_limit_reached"
          ? "per_minute_credit_limit_reached"
          : "budget_reservation_unavailable",
    safe_to_request_catalog: false,
    next_retry_at: null,
    reason_codes: [reason],
  };
}

function isAttemptOutcome(value: unknown): value is BasicFreeDiscoveryAttemptOutcome {
  return (
    value === "available" ||
    value === "empty" ||
    value === "provider_error" ||
    value === "rate_limited" ||
    value === "not_attempted"
  );
}
