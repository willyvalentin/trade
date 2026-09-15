import { expect, test } from "@playwright/test";

import {
  buildIntradayCatalystPresence,
  intradayCatalystPresencePolicyVersion,
} from "@/lib/intraday-catalyst-presence";

const now = new Date("2026-09-15T15:05:00.000Z");

function coverage(overrides: Record<string, unknown> = {}) {
  return {
    symbol: "NVDA",
    provider: "news_provider",
    observed_at: "2026-09-15T15:04:30.000Z",
    lookback_started_at: "2026-09-14T15:04:30.000Z",
    search_complete: true,
    reported_catalyst_count: 1,
    ...overrides,
  };
}

function catalyst(overrides: Record<string, unknown> = {}) {
  return {
    symbol: "NVDA",
    provider: "news_provider",
    source_event_id: "event-123",
    catalyst_type: "earnings",
    published_at: "2026-09-15T13:30:00.000Z",
    ...overrides,
  };
}

function context(overrides: Record<string, unknown> = {}) {
  return buildIntradayCatalystPresence(
    {
      market_date: "2026-09-15",
      regular_session_verified: true,
      candidate_symbol: "NVDA",
      coverage: coverage(),
      catalysts: [catalyst()],
      ...overrides,
    },
    now,
  );
}

test.describe("intraday catalyst presence", () => {
  test("admits one attributable, point-in-time catalyst without scoring it", () => {
    const result = context();

    expect(result.summary).toMatchObject({
      policy_version: intradayCatalystPresencePolicyVersion,
      status: "usable",
      catalyst_presence: "present",
      admissible_for_context: true,
      can_change_ranking_or_publication: false,
      candidate_symbol: "NVDA",
      coverage_age_minutes: 0.5,
      catalyst_age_minutes: 95,
      reason_codes: [],
    });
    expect(result.summary.catalyst).toMatchObject({
      source_event_id: "event-123",
      catalyst_type: "earnings",
    });
  });

  test("admits absence only when complete 24-hour coverage explicitly reports zero", () => {
    const result = context({
      coverage: coverage({ reported_catalyst_count: 0 }),
      catalysts: [],
    });

    expect(result.summary).toMatchObject({
      status: "usable",
      catalyst_presence: "absent",
      admissible_for_context: true,
      catalyst: null,
      reason_codes: [],
    });
  });

  test("admits coverage exactly at the freshness and 24-hour lookback limits", () => {
    const result = context({
      coverage: coverage({
        observed_at: "2026-09-15T15:00:00.000Z",
        lookback_started_at: "2026-09-14T15:00:00.000Z",
        reported_catalyst_count: 0,
      }),
      catalysts: [],
    });

    expect(result.summary).toMatchObject({
      status: "usable",
      catalyst_presence: "absent",
      coverage_age_minutes: 5,
      reason_codes: [],
    });
  });

  test("does not infer absent when coverage is missing, partial, or has unresolved events", () => {
    const missing = context({ coverage: null, catalysts: [] });
    const partial = context({
      coverage: coverage({ search_complete: false, reported_catalyst_count: 0 }),
      catalysts: [],
    });
    const unresolved = context({
      coverage: coverage({ reported_catalyst_count: 2 }),
      catalysts: [catalyst(), catalyst({ source_event_id: "event-456" })],
    });

    expect(missing.summary).toMatchObject({
      status: "incomplete",
      catalyst_presence: "unavailable",
      gaps: ["complete_24h_candidate_catalyst_search_unavailable"],
    });
    expect(partial.summary.reason_codes).toContain("coverage_not_complete");
    expect(unresolved.summary.reason_codes).toContain("multiple_catalysts_unresolved");
    expect(partial.summary.catalyst_presence).toBe("unavailable");
    expect(unresolved.summary.catalyst_presence).toBe("unavailable");
  });

  test("fails closed on stale coverage or a stale catalyst", () => {
    const coverageStale = context({
      coverage: coverage({ observed_at: "2026-09-15T14:59:00.000Z" }),
    });
    const catalystStale = context({
      coverage: coverage({ lookback_started_at: "2026-09-14T14:00:00.000Z" }),
      catalysts: [catalyst({ published_at: "2026-09-14T14:30:00.000Z" })],
    });

    expect(coverageStale.summary).toMatchObject({
      status: "stale",
      catalyst_presence: "unavailable",
    });
    expect(coverageStale.summary.reason_codes).toContain("coverage_stale");
    expect(catalystStale.summary).toMatchObject({
      status: "stale",
      catalyst_presence: "unavailable",
    });
    expect(catalystStale.summary.reason_codes).toContain("catalyst_stale");
  });

  test("rejects future, date-only, mismatched, and incomplete evidence", () => {
    const result = context({
      candidate_symbol: " ",
      coverage: coverage({
        symbol: "AMD",
        provider: " ",
        observed_at: "2026-09-15T15:06:00.000Z",
        lookback_started_at: "2026-09-15",
        reported_catalyst_count: Number.NaN,
      }),
      catalysts: [
        catalyst({
          symbol: "AMD",
          provider: "other_provider",
          source_event_id: " ",
          catalyst_type: "magic",
          published_at: "2026-09-15T15:07:00.000Z",
        }),
      ],
    });

    expect(result.summary).toMatchObject({
      status: "invalid",
      catalyst_presence: "unavailable",
      admissible_for_context: false,
      reason_codes: expect.arrayContaining([
        "candidate_ticker_invalid",
        "coverage_symbol_mismatch",
        "coverage_provider_missing",
        "coverage_timestamp_in_future",
        "coverage_window_invalid",
        "coverage_count_invalid",
        "coverage_count_mismatch",
        "catalyst_symbol_mismatch",
        "catalyst_identifier_missing",
        "catalyst_type_invalid",
        "catalyst_timestamp_in_future",
        "catalyst_after_observation",
      ]),
    });
  });

  test("rejects provider drift and a catalyst outside the declared coverage window", () => {
    const result = context({
      coverage: coverage({ lookback_started_at: "2026-09-14T16:00:00.000Z" }),
      catalysts: [
        catalyst({
          provider: "other_provider",
          published_at: "2026-09-14T15:30:00.000Z",
        }),
      ],
    });

    expect(result.summary).toMatchObject({
      status: "invalid",
      catalyst_presence: "unavailable",
      reason_codes: expect.arrayContaining([
        "catalyst_provider_mismatch",
        "catalyst_outside_coverage_window",
      ]),
    });
  });

  test("rejects an impossible coverage window that begins after its observation", () => {
    const result = context({
      coverage: coverage({ lookback_started_at: "2026-09-15T15:04:31.000Z" }),
    });

    expect(result.summary).toMatchObject({
      status: "invalid",
      catalyst_presence: "unavailable",
      reason_codes: expect.arrayContaining(["coverage_window_invalid"]),
    });
  });
});
