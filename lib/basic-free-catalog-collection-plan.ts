export const basicFreeCatalogCollectionPlanVersion =
  "basic_free_catalog_collection_plan_v1" as const;

export type BasicFreeCatalogCollectionPlanReason =
  | "catalog_provider_response_not_observed"
  | "provider_catalog_denominator_missing"
  | "catalog_page_size_invalid"
  | "catalog_page_not_full"
  | "daily_credit_budget_missing_or_invalid"
  | "per_minute_credit_budget_missing_or_invalid"
  | "daily_credit_remaining_missing_or_invalid"
  | "catalog_reservation_not_finalized";

export type BasicFreeCatalogCollectionPlan = {
  plan_version: typeof basicFreeCatalogCollectionPlanVersion;
  status: "ready_for_separate_admission" | "unavailable";
  execution_authority: "not_admitted";
  discovery_feed_allowed: false;
  provider_catalog_count: number | null;
  page_size: number | null;
  total_pages_required: number | null;
  remaining_pages_after_observed_page: number | null;
  total_credits_required: number | null;
  remaining_credits_after_observed_page: number | null;
  credits_available_today: number | null;
  minimum_trading_days_from_observed_page: number | null;
  minimum_request_minutes_for_current_day: number | null;
  reason_codes: BasicFreeCatalogCollectionPlanReason[];
};

export type BasicFreeCatalogCollectionPlanInput = {
  providerResponseObserved: unknown;
  providerCatalogCount: unknown;
  observedRecordCount: unknown;
  requestedCredits: unknown;
  dailyCreditBudget: unknown;
  perMinuteCreditBudget: unknown;
  dailyRemainingCredits: unknown;
  reservationFinalizationProven: unknown;
};

function positiveInteger(value: unknown) {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
    ? value
    : null;
}

function finiteNonNegativeInteger(value: unknown) {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
    ? value
    : null;
}

function unavailable(
  input: BasicFreeCatalogCollectionPlanInput,
  reason: BasicFreeCatalogCollectionPlanReason,
): BasicFreeCatalogCollectionPlan {
  const providerCatalogCount = finiteNonNegativeInteger(input.providerCatalogCount);
  const pageSize = positiveInteger(input.observedRecordCount);

  return {
    plan_version: basicFreeCatalogCollectionPlanVersion,
    status: "unavailable",
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    provider_catalog_count: providerCatalogCount,
    page_size: pageSize,
    total_pages_required: null,
    remaining_pages_after_observed_page: null,
    total_credits_required: null,
    remaining_credits_after_observed_page: null,
    credits_available_today: null,
    minimum_trading_days_from_observed_page: null,
    minimum_request_minutes_for_current_day: null,
    reason_codes: [reason],
  };
}

/**
 * Computes capacity requirements from one already-observed Basic Free catalog
 * page. This is capacity math only: it cannot make a provider request, mark a
 * catalog complete, expand discovery, or authorize a future collection.
 */
export function buildBasicFreeCatalogCollectionPlan(
  input: BasicFreeCatalogCollectionPlanInput,
): BasicFreeCatalogCollectionPlan {
  if (input.providerResponseObserved !== true) {
    return unavailable(input, "catalog_provider_response_not_observed");
  }

  const providerCatalogCount = finiteNonNegativeInteger(input.providerCatalogCount);
  if (providerCatalogCount === null || providerCatalogCount === 0) {
    return unavailable(input, "provider_catalog_denominator_missing");
  }

  const pageSize = positiveInteger(input.observedRecordCount);
  if (pageSize === null || pageSize > 8) {
    return unavailable(input, "catalog_page_size_invalid");
  }
  if (providerCatalogCount > pageSize && pageSize !== 8) {
    return unavailable(input, "catalog_page_not_full");
  }

  const requestedCredits = positiveInteger(input.requestedCredits);
  const dailyCreditBudget = positiveInteger(input.dailyCreditBudget);
  if (
    requestedCredits !== 1 ||
    dailyCreditBudget === null ||
    dailyCreditBudget > 800
  ) {
    return unavailable(input, "daily_credit_budget_missing_or_invalid");
  }

  const perMinuteCreditBudget = positiveInteger(input.perMinuteCreditBudget);
  if (perMinuteCreditBudget === null || perMinuteCreditBudget > 8) {
    return unavailable(input, "per_minute_credit_budget_missing_or_invalid");
  }

  const dailyRemainingCredits = finiteNonNegativeInteger(input.dailyRemainingCredits);
  if (
    dailyRemainingCredits === null ||
    dailyRemainingCredits >= dailyCreditBudget
  ) {
    return unavailable(input, "daily_credit_remaining_missing_or_invalid");
  }
  if (input.reservationFinalizationProven !== true) {
    return unavailable(input, "catalog_reservation_not_finalized");
  }

  const totalPagesRequired = Math.ceil(providerCatalogCount / pageSize);
  const remainingPages = Math.max(0, totalPagesRequired - 1);
  const creditsAvailableToday = dailyRemainingCredits;
  const currentDayRequests = Math.min(remainingPages, creditsAvailableToday);
  const additionalCreditsAfterToday = Math.max(0, remainingPages - currentDayRequests);

  return {
    plan_version: basicFreeCatalogCollectionPlanVersion,
    status: "ready_for_separate_admission",
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    provider_catalog_count: providerCatalogCount,
    page_size: pageSize,
    total_pages_required: totalPagesRequired,
    remaining_pages_after_observed_page: remainingPages,
    total_credits_required: totalPagesRequired,
    remaining_credits_after_observed_page: remainingPages,
    credits_available_today: creditsAvailableToday,
    minimum_trading_days_from_observed_page:
      remainingPages === 0
        ? 0
        : 1 + Math.ceil(additionalCreditsAfterToday / dailyCreditBudget),
    minimum_request_minutes_for_current_day:
      currentDayRequests === 0
        ? 0
        : Math.ceil(currentDayRequests / perMinuteCreditBudget),
    reason_codes: [],
  };
}
