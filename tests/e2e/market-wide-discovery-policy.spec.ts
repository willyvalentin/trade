import { expect, test } from "@playwright/test";

import {
  buildMarketWideDiscoveryAdmission,
  marketWideDiscoveryPreviousAttemptFromUnknown,
  MARKET_WIDE_DISCOVERY_ERROR_BACKOFF_MINUTES,
  TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST,
} from "@/lib/market-wide-discovery-policy";
import { buildDynamicMarketMoversSelection } from "@/lib/dynamic-market-movers";
import { marketWideDiscoveryReadbackFromUnknown } from "@/lib/market-wide-discovery-readback";

const now = new Date("2026-09-15T15:30:00.000Z");

test.describe("market-wide discovery admission", () => {
  test("fails closed when runtime discovery has not been explicitly enabled", () => {
    const admission = buildMarketWideDiscoveryAdmission({
      planMode: "pro",
      dailyCreditBudget: TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST,
      now,
    });

    expect(admission.status).toBe("disabled");
    expect(admission.safe_to_request_dynamic_movers).toBe(false);
    expect(admission.reason_codes).toEqual(["runtime_disabled"]);
    expect(admission.symbol_master.status).toBe("not_collected");
  });

  test("does not treat a plan hint below Pro as a market-movers entitlement", () => {
    const admission = buildMarketWideDiscoveryAdmission({
      runtimeEnabled: true,
      planMode: "grow",
      dailyCreditBudget: TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST,
      now,
    });

    expect(admission.status).toBe("plan_ineligible");
    expect(admission.plan_eligibility).toBe("ineligible");
    expect(admission.safe_to_request_dynamic_movers).toBe(false);
  });

  test("requires an explicit daily credit budget even for configured Pro", () => {
    const admission = buildMarketWideDiscoveryAdmission({
      runtimeEnabled: true,
      planMode: "pro",
      now,
    });

    expect(admission.status).toBe("budget_not_declared");
    expect(admission.safe_to_request_dynamic_movers).toBe(false);
    expect(admission.requested_credits).toBe(
      TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST,
    );
  });

  test("admits one bounded gainer request only when all local safety facts exist", () => {
    const admission = buildMarketWideDiscoveryAdmission({
      runtimeEnabled: true,
      planMode: "pro",
      dailyCreditBudget: TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST,
      now,
    });

    expect(admission.status).toBe("ready");
    expect(admission.safe_to_request_dynamic_movers).toBe(true);
    expect(admission.directions).toEqual(["gainers"]);
    expect(admission.dynamic_movers.relative_volume_status).toBe(
      "not_available_from_market_movers_v1",
    );
  });

  test("uses a longer retry backoff after an attributable provider failure", () => {
    const recentFailure = new Date(
      now.getTime() - (MARKET_WIDE_DISCOVERY_ERROR_BACKOFF_MINUTES - 1) * 60_000,
    );
    const admission = buildMarketWideDiscoveryAdmission({
      runtimeEnabled: true,
      planMode: "pro",
      dailyCreditBudget: TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST,
      previousAttempt: {
        attempted_at: recentFailure.toISOString(),
        outcome: "rate_limited",
      },
      now,
    });

    expect(admission.status).toBe("error_backoff_active");
    expect(admission.safe_to_request_dynamic_movers).toBe(false);
    expect(admission.reason_codes).toEqual(["recent_provider_error"]);
    expect(admission.next_retry_at).not.toBeNull();
  });

  test("rejects an invalid persisted attempt timestamp instead of treating it as fresh evidence", () => {
    expect(
      marketWideDiscoveryPreviousAttemptFromUnknown({
        attempt: {
          attempted_at: "not-a-timestamp",
          outcome: "provider_error",
        },
      }),
    ).toBeNull();
  });

  test("only presents a complete, versioned discovery receipt to the browser", () => {
    const admission = buildMarketWideDiscoveryAdmission({
      runtimeEnabled: true,
      planMode: "pro",
      dailyCreditBudget: TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST,
      now,
    });
    const dynamicIntake = buildDynamicMarketMoversSelection({
      scanWindow: "opening",
      selectedBudget: 10,
      now,
      providerResult: {
        provider: "twelve_data",
        status: "available",
        fetched_at: now,
        movers: [{ ticker: "NEWM", source: "top_gainer" }],
      },
    }).summary;
    const summary = {
      summary_version: "market_wide_discovery_summary_v1",
      summary_kind: "market_wide_discovery",
      generated_at: now.toISOString(),
      scan_window: "opening",
      admission,
      attempt: {
        attempted_at: now.toISOString(),
        outcome: "available",
        provider_response_observed: true,
      },
      dynamic_intake: dynamicIntake,
      warnings: [],
      gaps: [],
    };
    const receipt = marketWideDiscoveryReadbackFromUnknown(summary);

    expect(receipt).toMatchObject({
      status: "available",
      admission: {
        status: "ready",
        requested_credits: TWELVE_DATA_MARKET_MOVERS_CREDITS_PER_REQUEST,
      },
      attempt: {
        outcome: "available",
        provider_response_observed: true,
      },
      intake: {
        fetched_count: 1,
        selected_count: 1,
        selected_tickers: ["NEWM"],
      },
    });
    expect(
      marketWideDiscoveryReadbackFromUnknown({
        ...summary,
        summary_version: "unversioned",
      }).status,
    ).toBe("unavailable");
    expect(
      marketWideDiscoveryReadbackFromUnknown({
        ...summary,
        scan_window: "future_window",
      }).status,
    ).toBe("unavailable");
  });
});
