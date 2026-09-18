export const basicFreeCatalogCollectionPlanVersion =
  "basic_free_catalog_collection_plan_v2" as const;

export type BasicFreeCatalogCollectionPlanReason =
  | "catalog_capability_probe_not_collection_admitted"
  | "catalog_provider_response_not_observed"
  | "catalog_observation_not_available"
  | "provider_catalog_denominator_missing"
  | "catalog_page_size_invalid"
  | "catalog_page_not_full"
  | "daily_credit_budget_missing_or_invalid"
  | "per_minute_credit_budget_missing_or_invalid"
  | "daily_credit_remaining_missing_or_invalid"
  | "minute_credit_remaining_missing_or_invalid"
  | "catalog_reservation_not_finalized";

export type BasicFreeCatalogCollectionPlan = {
  plan_version: typeof basicFreeCatalogCollectionPlanVersion;
  status: "reference_estimate_available" | "unavailable";
  execution_authority: "not_admitted";
  discovery_feed_allowed: false;
  fresh_snapshot_required: true;
  reference_page_reusable_for_collection: false;
  provider_catalog_count: number | null;
  observed_page_size: number | null;
  fresh_collection_pages_required: number | null;
  fresh_collection_credits_required: number | null;
  credits_available_at_observation: number | null;
  minimum_trading_days_for_fresh_collection: number | null;
  minimum_request_minutes_for_fresh_collection_today: number | null;
  reason_codes: BasicFreeCatalogCollectionPlanReason[];
};

export type BasicFreeCatalogCollectionPlanInput = {
  referenceMode?: unknown;
  providerResponseObserved: unknown;
  observationOutcome: unknown;
  providerCatalogCount: unknown;
  observedRecordCount: unknown;
  requestedCredits: unknown;
  dailyCreditBudget: unknown;
  perMinuteCreditBudget: unknown;
  dailyRemainingCredits: unknown;
  minuteRemainingCredits: unknown;
  reservationStatus: unknown;
  reservationFinalizationStatus: unknown;
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
    fresh_snapshot_required: true,
    reference_page_reusable_for_collection: false,
    provider_catalog_count: providerCatalogCount,
    observed_page_size: pageSize,
    fresh_collection_pages_required: null,
    fresh_collection_credits_required: null,
    credits_available_at_observation: null,
    minimum_trading_days_for_fresh_collection: null,
    minimum_request_minutes_for_fresh_collection_today: null,
    reason_codes: [reason],
  };
}

/**
 * Computes a historical capacity estimate from one already-observed Basic Free
 * catalog reference page. A separately admitted collection must start from a
 * new snapshot; the reference page can never reduce its page or credit count.
 * This is capacity math only: it cannot make a provider request, mark a catalog
 * complete, expand discovery, or authorize a future collection.
 */
export function buildBasicFreeCatalogCollectionPlan(
  input: BasicFreeCatalogCollectionPlanInput,
): BasicFreeCatalogCollectionPlan {
  if (input.referenceMode === "capability_probe") {
    return unavailable(input, "catalog_capability_probe_not_collection_admitted");
  }
  if (input.providerResponseObserved !== true) {
    return unavailable(input, "catalog_provider_response_not_observed");
  }
  if (input.observationOutcome !== "available") {
    return unavailable(input, "catalog_observation_not_available");
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

  const minuteRemainingCredits = finiteNonNegativeInteger(input.minuteRemainingCredits);
  if (
    minuteRemainingCredits === null ||
    minuteRemainingCredits >= perMinuteCreditBudget
  ) {
    return unavailable(input, "minute_credit_remaining_missing_or_invalid");
  }
  if (
    input.reservationStatus !== "provider_execution_allowed" ||
    input.reservationFinalizationStatus !== "finalized" ||
    input.reservationFinalizationProven !== true
  ) {
    return unavailable(input, "catalog_reservation_not_finalized");
  }

  const freshCollectionPagesRequired = Math.ceil(providerCatalogCount / pageSize);
  const creditsAvailableToday = dailyRemainingCredits;
  const currentDayRequests = Math.min(
    freshCollectionPagesRequired,
    creditsAvailableToday,
  );
  const additionalCreditsAfterToday = Math.max(
    0,
    freshCollectionPagesRequired - currentDayRequests,
  );
  const currentMinuteRequests = Math.min(
    currentDayRequests,
    minuteRemainingCredits,
  );

  return {
    plan_version: basicFreeCatalogCollectionPlanVersion,
    status: "reference_estimate_available",
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    fresh_snapshot_required: true,
    reference_page_reusable_for_collection: false,
    provider_catalog_count: providerCatalogCount,
    observed_page_size: pageSize,
    fresh_collection_pages_required: freshCollectionPagesRequired,
    fresh_collection_credits_required: freshCollectionPagesRequired,
    credits_available_at_observation: creditsAvailableToday,
    minimum_trading_days_for_fresh_collection:
      currentDayRequests === 0
        ? Math.ceil(freshCollectionPagesRequired / dailyCreditBudget)
        : 1 + Math.ceil(additionalCreditsAfterToday / dailyCreditBudget),
    minimum_request_minutes_for_fresh_collection_today:
      currentDayRequests === 0
        ? 0
        : minuteRemainingCredits === 0
          ? Math.ceil(currentDayRequests / perMinuteCreditBudget)
          : 1 + Math.ceil(
              Math.max(
                0,
                currentDayRequests - currentMinuteRequests,
              ) / perMinuteCreditBudget,
            ),
    reason_codes: [],
  };
}
