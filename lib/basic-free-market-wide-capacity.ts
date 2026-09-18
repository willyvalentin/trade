/**
 * Turns one finalized Basic Free catalog observation into an honest capacity
 * statement. It is deliberately pure: it neither selects symbols nor makes a
 * provider request. In particular, a daily credit ceiling is not evidence that
 * Ture has current dynamic coverage for the whole catalog.
 */
export const basicFreeMarketWideCapacityVersion =
  "basic_free_market_wide_capacity_v1" as const;

// Twelve Data documents one credit per symbol for the general dynamic market
// data endpoints. Batch transport does not change the per-symbol credit cost.
export const BASIC_FREE_DYNAMIC_CREDITS_PER_SYMBOL = 1 as const;
export const BASIC_FREE_MAX_DAILY_API_CREDITS = 800 as const;

export type BasicFreeMarketWideCapacityReason =
  | "catalog_provider_response_not_observed"
  | "catalog_observation_not_available"
  | "configured_profile_not_basic_free"
  | "provider_catalog_denominator_missing"
  | "daily_credit_budget_missing_or_invalid"
  | "catalog_reservation_not_finalized";

export type BasicFreeMarketWideCapacity = {
  capacity_version: typeof basicFreeMarketWideCapacityVersion;
  status: "available" | "unavailable";
  evidence_scope: "historical_observed_catalog_receipt" | null;
  execution_authority: "not_admitted";
  discovery_feed_allowed: false;
  configured_profile: "configured_basic_free" | null;
  provider_catalog_count: number | null;
  documented_dynamic_credits_per_symbol: typeof BASIC_FREE_DYNAMIC_CREDITS_PER_SYMBOL;
  maximum_dynamic_symbols_per_quota_day: number | null;
  minimum_quota_days_for_one_full_dynamic_catalog_pass: number | null;
  market_movers_status: "configured_basic_free_ineligible" | "unavailable";
  reason_codes: BasicFreeMarketWideCapacityReason[];
};

export type BasicFreeMarketWideCapacityInput = {
  providerResponseObserved: unknown;
  observationOutcome: unknown;
  configuredProfile: unknown;
  providerCatalogCount: unknown;
  dailyCreditBudget: unknown;
  reservationStatus: unknown;
  reservationFinalizationStatus: unknown;
  reservationFinalizationProven: unknown;
};

function positiveInteger(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
}

function unavailable(
  input: BasicFreeMarketWideCapacityInput,
  reason: BasicFreeMarketWideCapacityReason,
): BasicFreeMarketWideCapacity {
  return {
    capacity_version: basicFreeMarketWideCapacityVersion,
    status: "unavailable",
    evidence_scope: null,
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    configured_profile:
      input.configuredProfile === "configured_basic_free"
        ? "configured_basic_free"
        : null,
    provider_catalog_count: positiveInteger(input.providerCatalogCount),
    documented_dynamic_credits_per_symbol: BASIC_FREE_DYNAMIC_CREDITS_PER_SYMBOL,
    maximum_dynamic_symbols_per_quota_day: null,
    minimum_quota_days_for_one_full_dynamic_catalog_pass: null,
    market_movers_status:
      input.configuredProfile === "configured_basic_free"
        ? "configured_basic_free_ineligible"
        : "unavailable",
    reason_codes: [reason],
  };
}

/**
 * Computes only the lower bound for covering every catalog symbol with one
 * one-credit dynamic request. It does not assume a provider call, a scheduling
 * cadence, a valid symbol master, or an admissible discovery feed.
 */
export function buildBasicFreeMarketWideCapacity(
  input: BasicFreeMarketWideCapacityInput,
): BasicFreeMarketWideCapacity {
  if (input.providerResponseObserved !== true) {
    return unavailable(input, "catalog_provider_response_not_observed");
  }
  if (input.observationOutcome !== "available") {
    return unavailable(input, "catalog_observation_not_available");
  }
  if (input.configuredProfile !== "configured_basic_free") {
    return unavailable(input, "configured_profile_not_basic_free");
  }

  const providerCatalogCount = positiveInteger(input.providerCatalogCount);
  if (providerCatalogCount === null) {
    return unavailable(input, "provider_catalog_denominator_missing");
  }

  const dailyCreditBudget = positiveInteger(input.dailyCreditBudget);
  if (
    dailyCreditBudget === null ||
    dailyCreditBudget > BASIC_FREE_MAX_DAILY_API_CREDITS
  ) {
    return unavailable(input, "daily_credit_budget_missing_or_invalid");
  }
  if (
    input.reservationStatus !== "provider_execution_allowed" ||
    input.reservationFinalizationStatus !== "finalized" ||
    input.reservationFinalizationProven !== true
  ) {
    return unavailable(input, "catalog_reservation_not_finalized");
  }

  return {
    capacity_version: basicFreeMarketWideCapacityVersion,
    status: "available",
    evidence_scope: "historical_observed_catalog_receipt",
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    configured_profile: "configured_basic_free",
    provider_catalog_count: providerCatalogCount,
    documented_dynamic_credits_per_symbol: BASIC_FREE_DYNAMIC_CREDITS_PER_SYMBOL,
    maximum_dynamic_symbols_per_quota_day:
      Math.floor(dailyCreditBudget / BASIC_FREE_DYNAMIC_CREDITS_PER_SYMBOL),
    minimum_quota_days_for_one_full_dynamic_catalog_pass: Math.ceil(
      providerCatalogCount /
        Math.floor(dailyCreditBudget / BASIC_FREE_DYNAMIC_CREDITS_PER_SYMBOL),
    ),
    market_movers_status: "configured_basic_free_ineligible",
    reason_codes: [],
  };
}
