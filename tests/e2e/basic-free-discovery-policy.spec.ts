import { expect, test } from "@playwright/test";

import {
  basicFreeDiscoveryPreviousAttemptFromUnknown,
  buildBasicFreeDiscoveryAdmission,
} from "@/lib/basic-free-discovery-policy";
import {
  basicFreeDiscoveryReadbackFromScheduledAttempt,
  basicFreeDiscoveryReadbackFromUnknown,
} from "@/lib/basic-free-discovery-readback";

const now = new Date("2026-09-15T15:30:00.000Z");

function admittedSummary() {
  const admission = buildBasicFreeDiscoveryAdmission({
    runtimeEnabled: true,
    planMode: "free",
    dailyCreditBudget: 800,
    perMinuteCreditBudget: 8,
    tradingDate: "2026-09-15",
  });
  return {
    summary_version: "basic_free_catalog_observation_summary_v1",
    summary_kind: "basic_free_catalog_observation",
    generated_at: now.toISOString(),
    trading_date: "2026-09-15",
    scan_window: "opening",
    admission,
    attempt: {
      attempted_at: now.toISOString(),
      outcome: "available",
      provider_response_observed: true,
    },
    credit_reservation: {
      contract_version: "basic_free_discovery_credit_reservation_v1",
      status: "provider_execution_allowed",
      trading_date: "2026-09-15",
      minute_bucket: now.toISOString(),
      requested_credits: 1,
      declared_daily_credit_budget: 800,
      declared_per_minute_credit_budget: 8,
      daily_reserved_credits: 1,
      daily_remaining_credits: 799,
      minute_reserved_credits: 1,
      minute_remaining_credits: 7,
      idempotent: false,
      finalization_status: "finalized",
      finalization_proven: true,
    },
    catalog: {
      provider: "twelve_data",
      endpoint: "/stocks",
      observed_record_count: 8,
      provider_catalog_count: 4200,
      eligible_record_count: 8,
      rejected_record_count: 0,
      collection_complete: false,
      discovery_feed_allowed: false,
    },
    warnings: [],
    gaps: [
      "catalog_observation_is_not_candidate_discovery",
      "catalog_collection_not_complete",
    ],
  };
}

test("Basic Free admission requires its distinct plan, explicit dual budgets, and one catalog observation per NY date", () => {
  expect(
    buildBasicFreeDiscoveryAdmission({
      runtimeEnabled: true,
      planMode: "grow",
      dailyCreditBudget: 800,
      perMinuteCreditBudget: 8,
      tradingDate: "2026-09-15",
    }),
  ).toMatchObject({
    status: "plan_ineligible",
    safe_to_request_catalog: false,
    reason_codes: ["plan_not_basic_free"],
  });

  expect(
    buildBasicFreeDiscoveryAdmission({
      runtimeEnabled: true,
      planMode: "free",
      dailyCreditBudget: 800,
      perMinuteCreditBudget: 8,
      tradingDate: "2026-09-15",
      previousAttempt: {
        attempted_at: now.toISOString(),
        trading_date: "2026-09-15",
        outcome: "available",
      },
    }),
  ).toMatchObject({
    status: "refresh_interval_active",
    safe_to_request_catalog: false,
    reason_codes: ["daily_catalog_already_observed"],
  });
});

test("browser readback preserves coverage denominator and rejects a partial page that claims feed eligibility", () => {
  const summary = admittedSummary();
  expect(basicFreeDiscoveryReadbackFromUnknown(summary)).toMatchObject({
    status: "available",
    catalog: {
      observed_record_count: 8,
      provider_catalog_count: 4200,
      collection_complete: false,
      discovery_feed_allowed: false,
    },
  });
  expect(
    basicFreeDiscoveryReadbackFromScheduledAttempt({
      utc_timestamp: now.toISOString(),
      trading_date: "2026-09-15",
      intraday_scan_window: "opening",
      payload_json: { basic_free_discovery: summary },
    }),
  ).toMatchObject({
    status: "available",
    source_scan: { trading_date: "2026-09-15", window: "opening" },
  });
  expect(
    basicFreeDiscoveryReadbackFromUnknown({
      ...summary,
      catalog: { ...summary.catalog, discovery_feed_allowed: true },
    }).status,
  ).toBe("unavailable");
  expect(
    basicFreeDiscoveryReadbackFromUnknown({
      ...summary,
      catalog: { ...summary.catalog, provider_catalog_count: 7 },
    }).status,
  ).toBe("unavailable");
});

test("browser readback exposes only a valid persisted one-shot containment envelope", () => {
  const summary = admittedSummary();
  const receipt = basicFreeDiscoveryReadbackFromScheduledAttempt({
    utc_timestamp: now.toISOString(),
    trading_date: "2026-09-15",
    intraday_scan_window: "opening",
    payload_json: {
      basic_free_discovery: summary,
      basic_free_catalog_one_shot: {
        control_version: "basic_free_catalog_one_shot_control_v1",
        status: "ready",
        catalog_only_enforced: true,
        catalog_observation_may_proceed: true,
        target_trading_date: "2026-09-15",
        evaluated_trading_date: "2026-09-15",
        reason_codes: ["basic_free_catalog_one_shot_ready"],
      },
    },
  });

  expect(receipt.one_shot_control).toMatchObject({
    receipt_status: "available",
    status: "ready",
    catalog_only_enforced: true,
    catalog_observation_may_proceed: true,
    target_trading_date: "2026-09-15",
    evaluated_trading_date: "2026-09-15",
  });
  expect(
    basicFreeDiscoveryReadbackFromScheduledAttempt({
      utc_timestamp: now.toISOString(),
      trading_date: "2026-09-15",
      intraday_scan_window: "opening",
      payload_json: {
        basic_free_discovery: summary,
        basic_free_catalog_one_shot: {
          control_version: "basic_free_catalog_one_shot_control_v1",
          status: "ready",
          catalog_only_enforced: true,
          catalog_observation_may_proceed: true,
          target_trading_date: "2026-09-15",
          evaluated_trading_date: "2026-09-16",
          reason_codes: ["basic_free_catalog_one_shot_ready"],
        },
      },
    }).one_shot_control.receipt_status,
  ).toBe("invalid");
  expect(
    basicFreeDiscoveryReadbackFromScheduledAttempt({
      utc_timestamp: now.toISOString(),
      trading_date: "2026-09-15",
      intraday_scan_window: "opening",
      payload_json: { basic_free_discovery: summary },
    }).one_shot_control.receipt_status,
  ).toBe("not_recorded");
});

test("previous-attempt parsing accepts only attributable versioned receipt facts", () => {
  expect(
    basicFreeDiscoveryPreviousAttemptFromUnknown(admittedSummary()),
  ).toEqual({
    attempted_at: now.toISOString(),
    trading_date: "2026-09-15",
    outcome: "available",
  });
  expect(
    basicFreeDiscoveryPreviousAttemptFromUnknown({
      trading_date: "not-a-date",
      attempt: { attempted_at: now.toISOString(), outcome: "available" },
    }),
  ).toBeNull();
});
