import { expect, test } from "@playwright/test";

import {
  buildIntradayMarketContext,
  intradayMarketContextPolicyVersion,
} from "@/lib/intraday-market-context";

const now = new Date("2026-09-15T15:05:00.000Z");

function observation(
  symbol: "SPY" | "QQQ" | "IWM",
  overrides: Record<string, unknown> = {},
) {
  return {
    symbol,
    provider: "twelve_data",
    observed_at: "2026-09-15T15:04:30.000Z",
    price: 100,
    session_return_percent: 0.5,
    ...overrides,
  };
}

function context(overrides: Record<string, unknown> = {}) {
  return buildIntradayMarketContext(
    {
      market_date: "2026-09-15",
      regular_session_verified: true,
      observations: [
        observation("SPY"),
        observation("QQQ", { session_return_percent: 0.8 }),
        observation("IWM", { session_return_percent: 0.2 }),
      ],
      ...overrides,
    },
    now,
  );
}

test.describe("intraday market context", () => {
  test("admits one synchronized, fresh, verified SPY/QQQ/IWM snapshot", () => {
    const result = context();

    expect(result.summary).toMatchObject({
      policy_version: intradayMarketContextPolicyVersion,
      status: "usable",
      regime: "risk_on",
      admissible_for_context: true,
      can_change_ranking_or_publication: false,
      provider: "twelve_data",
      age_minutes: 0.5,
      observation_time_skew_seconds: 0,
      reason_codes: [],
    });
    expect(result.summary.benchmarks.map((item) => item.symbol)).toEqual([
      "SPY",
      "QQQ",
      "IWM",
    ]);
  });

  test("fails closed when an index is stale or observations are not contemporaneous", () => {
    const result = context({
      observations: [
        observation("SPY", { observed_at: "2026-09-15T14:58:00.000Z" }),
        observation("QQQ", { observed_at: "2026-09-15T15:04:30.000Z" }),
        observation("IWM", { observed_at: "2026-09-15T15:04:30.000Z" }),
      ],
    });

    expect(result.summary).toMatchObject({
      status: "stale",
      regime: "unavailable",
      admissible_for_context: false,
      reason_codes: expect.arrayContaining([
        "observation_stale",
        "observation_time_skew_exceeded",
      ]),
    });
  });

  test("does not accept incomplete or unverified session context", () => {
    const result = context({
      regular_session_verified: false,
      observations: [observation("SPY"), observation("QQQ")],
    });

    expect(result.summary).toMatchObject({
      status: "incomplete",
      regime: "unavailable",
      admissible_for_context: false,
      reason_codes: expect.arrayContaining([
        "regular_session_not_verified",
        "missing_benchmark",
      ]),
      gaps: ["complete_spy_qqq_iwm_snapshot_unavailable"],
    });
  });

  test("rejects duplicate, mismatched-provider, future and malformed observations", () => {
    const result = context({
      market_date: "invalid",
      observations: [
        observation("SPY"),
        observation("SPY", { provider: "other_provider" }),
        observation("IWM", {
          observed_at: "2026-09-15T15:06:00.000Z",
          price: 0,
          session_return_percent: null,
        }),
      ],
    });

    expect(result.summary).toMatchObject({
      status: "invalid",
      regime: "unavailable",
      admissible_for_context: false,
      reason_codes: expect.arrayContaining([
        "market_date_invalid",
        "missing_benchmark",
        "duplicate_benchmark",
        "provider_mismatch",
        "observation_timestamp_in_future",
        "price_invalid",
        "session_return_invalid",
      ]),
    });
  });
});
