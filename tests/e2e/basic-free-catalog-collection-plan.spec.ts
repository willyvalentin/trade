import { expect, test } from "@playwright/test";

import { buildBasicFreeCatalogCollectionPlan } from "@/lib/basic-free-catalog-collection-plan";
import { basicFreeDiscoveryReadbackFromUnknown } from "@/lib/basic-free-discovery-readback";

const observedAt = "2026-09-15T15:30:00.000Z";

function readyPlanInput() {
  return {
    providerResponseObserved: true,
    observationOutcome: "available",
    providerCatalogCount: 6408,
    observedRecordCount: 8,
    requestedCredits: 1,
    dailyCreditBudget: 800,
    perMinuteCreditBudget: 8,
    dailyRemainingCredits: 799,
    minuteRemainingCredits: 7,
    reservationStatus: "provider_execution_allowed",
    reservationFinalizationStatus: "finalized",
    reservationFinalizationProven: true,
  };
}

function observedSummary() {
  return {
    summary_version: "basic_free_catalog_observation_summary_v1",
    summary_kind: "basic_free_catalog_observation",
    generated_at: observedAt,
    trading_date: "2026-09-15",
    scan_window: "opening",
    admission: {
      policy_version: "basic_free_catalog_observation_v1",
      status: "ready",
      runtime_enabled: true,
      plan_eligibility: "configured_basic_free",
      endpoint: "/stocks",
      request: {
        country: "United States",
        type: "Common Stock",
        page: 1,
        outputsize: 8,
        credits_per_request: 1,
      },
      coverage_contract: {
        collection_complete: false,
        discovery_feed_allowed: false,
        scope: "one_catalog_page_only",
      },
      declared_daily_credit_budget: 800,
      declared_per_minute_credit_budget: 8,
      reason_codes: [],
    },
    attempt: {
      attempted_at: observedAt,
      outcome: "available",
      provider_response_observed: true,
    },
    credit_reservation: {
      contract_version: "basic_free_discovery_credit_reservation_v1",
      status: "provider_execution_allowed",
      requested_credits: 1,
      daily_reserved_credits: 1,
      daily_remaining_credits: 799,
      minute_reserved_credits: 1,
      minute_remaining_credits: 7,
      finalization_status: "finalized",
      finalization_proven: true,
    },
    catalog: {
      provider: "twelve_data",
      endpoint: "/stocks",
      observed_record_count: 8,
      provider_catalog_count: 6408,
      eligible_record_count: 8,
      rejected_record_count: 0,
      collection_complete: false,
      discovery_feed_allowed: false,
    },
    warnings: [],
    gaps: [],
  };
}

test("capacity plan accurately describes a multi-day Basic Free catalog collection without admitting it", () => {
  expect(buildBasicFreeCatalogCollectionPlan(readyPlanInput())).toEqual({
    plan_version: "basic_free_catalog_collection_plan_v1",
    status: "ready_for_separate_admission",
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    provider_catalog_count: 6408,
    page_size: 8,
    total_pages_required: 801,
    remaining_pages_after_observed_page: 800,
    total_credits_required: 801,
    remaining_credits_after_observed_page: 800,
    credits_available_today: 799,
    minimum_trading_days_from_observed_page: 2,
    minimum_request_minutes_for_current_day: 100,
    reason_codes: [],
  });
});

test("capacity plan does not invent current-day capacity after the observed day or minute is exhausted", () => {
  expect(
    buildBasicFreeCatalogCollectionPlan({
      ...readyPlanInput(),
      providerCatalogCount: 72,
      dailyRemainingCredits: 0,
      minuteRemainingCredits: 0,
    }),
  ).toMatchObject({
    status: "ready_for_separate_admission",
    total_pages_required: 9,
    remaining_pages_after_observed_page: 8,
    minimum_trading_days_from_observed_page: 1,
    minimum_request_minutes_for_current_day: 0,
  });
});

test("capacity plan accounts for the observed minute balance", () => {
  expect(
    buildBasicFreeCatalogCollectionPlan({
      ...readyPlanInput(),
      providerCatalogCount: 72,
      dailyRemainingCredits: 8,
      minuteRemainingCredits: 7,
    }),
  ).toMatchObject({
    status: "ready_for_separate_admission",
    remaining_pages_after_observed_page: 8,
    minimum_trading_days_from_observed_page: 1,
    minimum_request_minutes_for_current_day: 2,
  });
});

test("capacity plan fails closed when the observed-page evidence cannot support a future collection", () => {
  for (const [input, reason] of [
    [
      { ...readyPlanInput(), providerResponseObserved: false },
      "catalog_provider_response_not_observed",
    ],
    [
      { ...readyPlanInput(), observationOutcome: "provider_error" },
      "catalog_observation_not_available",
    ],
    [
      { ...readyPlanInput(), providerCatalogCount: null },
      "provider_catalog_denominator_missing",
    ],
    [
      { ...readyPlanInput(), observedRecordCount: 7 },
      "catalog_page_not_full",
    ],
    [
      { ...readyPlanInput(), dailyCreditBudget: 801 },
      "daily_credit_budget_missing_or_invalid",
    ],
    [
      { ...readyPlanInput(), perMinuteCreditBudget: 9 },
      "per_minute_credit_budget_missing_or_invalid",
    ],
    [
      { ...readyPlanInput(), dailyRemainingCredits: 800 },
      "daily_credit_remaining_missing_or_invalid",
    ],
    [
      { ...readyPlanInput(), minuteRemainingCredits: 8 },
      "minute_credit_remaining_missing_or_invalid",
    ],
    [
      { ...readyPlanInput(), reservationFinalizationProven: false },
      "catalog_reservation_not_finalized",
    ],
    [
      { ...readyPlanInput(), reservationStatus: "not_required" },
      "catalog_reservation_not_finalized",
    ],
    [
      {
        ...readyPlanInput(),
        reservationFinalizationStatus: "already_completed",
      },
      "catalog_reservation_not_finalized",
    ],
  ] as const) {
    expect(buildBasicFreeCatalogCollectionPlan(input)).toMatchObject({
      status: "unavailable",
      execution_authority: "not_admitted",
      discovery_feed_allowed: false,
      reason_codes: [reason],
    });
  }
});

test("a capability probe cannot become a catalog-collection plan", () => {
  expect(
    buildBasicFreeCatalogCollectionPlan({
      ...readyPlanInput(),
      referenceMode: "capability_probe",
      observedRecordCount: 100,
    }),
  ).toMatchObject({
    status: "unavailable",
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    reason_codes: ["catalog_capability_probe_not_collection_admitted"],
  });
});

test("validated Basic Free readback exposes capacity math without turning it into a discovery feed", () => {
  expect(basicFreeDiscoveryReadbackFromUnknown(observedSummary())).toMatchObject({
    status: "available",
    catalog_collection_plan: {
      status: "ready_for_separate_admission",
      execution_authority: "not_admitted",
      discovery_feed_allowed: false,
      total_pages_required: 801,
      remaining_pages_after_observed_page: 800,
    },
  });

  expect(
    basicFreeDiscoveryReadbackFromUnknown({
      ...observedSummary(),
      attempt: {
        attempted_at: null,
        outcome: "not_attempted",
        provider_response_observed: false,
      },
    }).catalog_collection_plan,
  ).toMatchObject({
    status: "unavailable",
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    reason_codes: ["catalog_provider_response_not_observed"],
  });

  expect(
    basicFreeDiscoveryReadbackFromUnknown({
      ...observedSummary(),
      attempt: {
        attempted_at: observedAt,
        outcome: "provider_error",
        provider_response_observed: true,
      },
    }).catalog_collection_plan,
  ).toMatchObject({
    status: "unavailable",
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    reason_codes: ["catalog_observation_not_available"],
  });

  expect(
    basicFreeDiscoveryReadbackFromUnknown({
      ...observedSummary(),
      credit_reservation: {
        ...observedSummary().credit_reservation,
        status: "not_required",
        finalization_status: "already_completed",
        finalization_proven: true,
      },
    }).catalog_collection_plan,
  ).toMatchObject({
    status: "unavailable",
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    reason_codes: ["catalog_reservation_not_finalized"],
  });
});
