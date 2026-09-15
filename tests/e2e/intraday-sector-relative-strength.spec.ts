import { expect, test } from "@playwright/test";

import {
  buildIntradaySectorRelativeStrength,
  intradaySectorRelativeStrengthPolicyVersion,
} from "@/lib/intraday-sector-relative-strength";

const now = new Date("2026-09-15T15:05:00.000Z");

function observation(
  symbol: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    symbol,
    provider: "twelve_data",
    observed_at: "2026-09-15T15:04:30.000Z",
    session_return_percent: 0.5,
    ...overrides,
  };
}

function context(overrides: Record<string, unknown> = {}) {
  return buildIntradaySectorRelativeStrength(
    {
      market_date: "2026-09-15",
      regular_session_verified: true,
      sector_id: "technology",
      candidate: observation("NVDA", { session_return_percent: 1.3 }),
      sector_benchmark: observation("XLK", { session_return_percent: 0.7 }),
      market_benchmark: observation("SPY", { session_return_percent: 0.2 }),
      ...overrides,
    },
    now,
  );
}

test.describe("intraday sector relative strength", () => {
  test("admits synchronized sector evidence and derives contextual deltas", () => {
    const result = context();

    expect(result.summary).toMatchObject({
      policy_version: intradaySectorRelativeStrengthPolicyVersion,
      status: "usable",
      admissible_for_context: true,
      can_change_ranking_or_publication: false,
      sector_id: "technology",
      provider: "twelve_data",
      age_minutes: 0.5,
      observation_time_skew_seconds: 0,
      stock_vs_sector_return_percent: 0.6,
      sector_vs_market_return_percent: 0.5,
      reason_codes: [],
    });
    expect(result.summary.candidate?.symbol).toBe("NVDA");
    expect(result.summary.sector_benchmark?.symbol).toBe("XLK");
    expect(result.summary.market_benchmark?.symbol).toBe("SPY");
  });

  test("fails closed on stale or non-contemporaneous observations", () => {
    const result = context({
      candidate: observation("NVDA", { observed_at: "2026-09-15T14:58:00.000Z" }),
    });

    expect(result.summary).toMatchObject({
      status: "stale",
      admissible_for_context: false,
      stock_vs_sector_return_percent: null,
      sector_vs_market_return_percent: null,
      reason_codes: expect.arrayContaining([
        "observation_stale",
        "observation_time_skew_exceeded",
      ]),
    });
  });

  test("admits observations exactly at the freshness and synchronization limits", () => {
    const result = context({
      candidate: observation("NVDA", { observed_at: "2026-09-15T15:00:00.000Z" }),
      sector_benchmark: observation("XLK", {
        observed_at: "2026-09-15T15:00:30.000Z",
      }),
      market_benchmark: observation("SPY", {
        observed_at: "2026-09-15T15:01:00.000Z",
      }),
    });

    expect(result.summary).toMatchObject({
      status: "usable",
      admissible_for_context: true,
      age_minutes: 5,
      observation_time_skew_seconds: 60,
      reason_codes: [],
    });
  });

  test("does not infer an unverified session or a missing sector identity", () => {
    const result = context({
      regular_session_verified: false,
      sector_id: " ",
    });

    expect(result.summary).toMatchObject({
      status: "invalid",
      admissible_for_context: false,
      reason_codes: expect.arrayContaining([
        "regular_session_not_verified",
        "sector_identifier_missing",
      ]),
    });
  });

  test("rejects duplicate identities, a non-SPY market anchor and mixed providers", () => {
    const result = context({
      sector_benchmark: observation("NVDA", { provider: "other_provider" }),
      market_benchmark: observation("QQQ"),
    });

    expect(result.summary).toMatchObject({
      status: "invalid",
      admissible_for_context: false,
      reason_codes: expect.arrayContaining([
        "market_benchmark_invalid",
        "duplicate_symbol_identity",
        "provider_mismatch",
      ]),
    });
  });

  test("rejects future, date-only and non-finite observations", () => {
    const result = context({
      candidate: observation("NVDA", {
        observed_at: "2026-09-15T15:06:00.000Z",
      }),
      sector_benchmark: observation("XLK", { observed_at: "2026-09-15" }),
      market_benchmark: observation("SPY", { session_return_percent: Number.NaN }),
    });

    expect(result.summary).toMatchObject({
      status: "invalid",
      admissible_for_context: false,
      reason_codes: expect.arrayContaining([
        "observation_timestamp_in_future",
        "observation_timestamp_invalid",
        "session_return_invalid",
      ]),
      gaps: ["complete_candidate_sector_market_snapshot_unavailable"],
    });
  });

  test("rejects a mismatched New York market date and missing provider", () => {
    const result = context({
      candidate: observation("NVDA", {
        observed_at: "2026-09-14T15:04:30.000Z",
      }),
      sector_benchmark: observation("XLK", { provider: " " }),
    });

    expect(result.summary).toMatchObject({
      status: "invalid",
      admissible_for_context: false,
      reason_codes: expect.arrayContaining([
        "market_date_mismatch",
        "provider_missing",
      ]),
    });
  });
});
