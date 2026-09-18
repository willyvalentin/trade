import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildBasicFreeMarketWideCapacity } from "@/lib/basic-free-market-wide-capacity";
import { basicFreeDiscoveryReadbackFromUnknown } from "@/lib/basic-free-discovery-readback";

const observedAt = "2026-09-18T15:00:50.792Z";

function finalizedBasicFreeReceiptInput() {
  return {
    providerResponseObserved: true,
    observationOutcome: "available",
    configuredProfile: "configured_basic_free",
    providerCatalogCount: 16_401,
    dailyCreditBudget: 800,
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
    trading_date: "2026-09-18",
    scan_window: "morning_momentum",
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
      provider_catalog_count: 16_401,
      eligible_record_count: 8,
      rejected_record_count: 0,
      collection_complete: false,
      discovery_feed_allowed: false,
    },
    warnings: [],
    gaps: [],
  };
}

test("Basic Free capacity refuses a market-wide claim when a one-credit-per-symbol pass exceeds its daily ceiling", () => {
  expect(buildBasicFreeMarketWideCapacity(finalizedBasicFreeReceiptInput())).toEqual({
    capacity_version: "basic_free_market_wide_capacity_v1",
    status: "available",
    evidence_scope: "historical_observed_catalog_receipt",
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    configured_profile: "configured_basic_free",
    provider_catalog_count: 16_401,
    documented_dynamic_credits_per_symbol: 1,
    maximum_dynamic_symbols_per_quota_day: 800,
    minimum_quota_days_for_one_full_dynamic_catalog_pass: 21,
    market_movers_status: "configured_basic_free_ineligible",
    reason_codes: [],
  });
});

test("capacity fails closed for an unfinalized receipt, a non-Basic profile, or an invalid budget", () => {
  for (const [input, reason] of [
    [
      { ...finalizedBasicFreeReceiptInput(), reservationFinalizationProven: false },
      "catalog_reservation_not_finalized",
    ],
    [
      { ...finalizedBasicFreeReceiptInput(), configuredProfile: "unverified" },
      "configured_profile_not_basic_free",
    ],
    [
      { ...finalizedBasicFreeReceiptInput(), dailyCreditBudget: 801 },
      "daily_credit_budget_missing_or_invalid",
    ],
  ] as const) {
    expect(buildBasicFreeMarketWideCapacity(input)).toMatchObject({
      status: "unavailable",
      execution_authority: "not_admitted",
      discovery_feed_allowed: false,
      reason_codes: [reason],
    });
  }
});

test("a capability probe cannot become market-wide capacity evidence", () => {
  expect(
    buildBasicFreeMarketWideCapacity({
      ...finalizedBasicFreeReceiptInput(),
      referenceMode: "capability_probe",
    }),
  ).toMatchObject({
    status: "unavailable",
    execution_authority: "not_admitted",
    discovery_feed_allowed: false,
    reason_codes: ["catalog_capability_probe_not_capacity_evidence"],
  });
});

test("validated catalog readback carries capacity disclosure without admitting a discovery feed", () => {
  expect(basicFreeDiscoveryReadbackFromUnknown(observedSummary())).toMatchObject({
    status: "available",
    catalog: {
      collection_complete: false,
      discovery_feed_allowed: false,
    },
    market_wide_dynamic_capacity: {
      status: "available",
      execution_authority: "not_admitted",
      discovery_feed_allowed: false,
      maximum_dynamic_symbols_per_quota_day: 800,
      minimum_quota_days_for_one_full_dynamic_catalog_pass: 21,
      market_movers_status: "configured_basic_free_ineligible",
    },
  });
});

test("capacity disclosure has no provider or scanner capability", () => {
  const capacity = readFileSync(
    resolve(process.cwd(), "lib/basic-free-market-wide-capacity.ts"),
    "utf8",
  );
  const app = readFileSync(resolve(process.cwd(), "app/trade-app.tsx"), "utf8");

  expect(capacity).not.toContain("fetch(");
  expect(capacity).not.toContain("server-only");
  expect(capacity).toContain('execution_authority: "not_admitted"');
  expect(capacity).toContain("discovery_feed_allowed: false");
  expect(app).toContain("Dynamic market-wide capacity");
  expect(app).toContain("not a current quote, request authority");
});
