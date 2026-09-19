import { expect, test } from "@playwright/test";

import {
  buildRelativeVolumeIntake,
  relativeVolumeIntakePolicyVersion,
} from "@/lib/relative-volume-intake";

const observedAt = "2026-09-15T15:00:00.000Z";
const now = new Date("2026-09-15T15:10:00.000Z");

function intake(overrides: Record<string, unknown> = {}) {
  return buildRelativeVolumeIntake(
    {
      symbol: "PLTR",
      provider: "twelve_data",
      observed_at: observedAt,
      market_date: "2026-09-15",
      regular_session_verified: true,
      market_calendar_source: "verified_us_equities_calendar_v1",
      regular_session_opened_at: "2026-09-15T13:30:00.000Z",
      regular_session_closed_at: "2026-09-15T20:00:00.000Z",
      elapsed_regular_session_minutes: 90,
      cumulative_regular_session_volume: 2_400_000,
      baseline: {
        as_of: "2026-09-15T14:55:00.000Z",
        elapsed_regular_session_minutes: 90,
        cumulative_regular_session_volume: 800_000,
        sample_session_count: 20,
      },
      ...overrides,
    },
    now,
  );
}

test.describe("relative-volume intake", () => {
  test("admits only a fresh, calendar-verified same-session comparison", () => {
    const result = intake();

    expect(result.summary).toMatchObject({
      summary_version: "2.0",
      policy_version: relativeVolumeIntakePolicyVersion,
      status: "usable",
      admissible_for_discovery: true,
      can_change_ranking_or_publication: false,
      relative_volume: 3,
      signal: "exceptional",
      expected_elapsed_regular_session_minutes: 90,
      reason_codes: [],
    });
  });

  test("rejects a comparison to a different point in the trading session", () => {
    const result = intake({
      baseline: {
        as_of: "2026-09-15T14:55:00.000Z",
        elapsed_regular_session_minutes: 75,
        cumulative_regular_session_volume: 800_000,
        sample_session_count: 20,
      },
    });

    expect(result.summary).toMatchObject({
      status: "incomplete",
      admissible_for_discovery: false,
      signal: "unavailable",
      reason_codes: ["baseline_elapsed_minutes_mismatch"],
    });
  });

  test("fails closed for stale data, unverified sessions and too-small baselines", () => {
    const result = buildRelativeVolumeIntake(
      {
        symbol: "PLTR",
        provider: "twelve_data",
        observed_at: "2026-09-15T14:30:00.000Z",
        market_date: "2026-09-15",
        regular_session_verified: false,
        market_calendar_source: "verified_us_equities_calendar_v1",
        regular_session_opened_at: "2026-09-15T13:30:00.000Z",
        regular_session_closed_at: "2026-09-15T20:00:00.000Z",
        elapsed_regular_session_minutes: 60,
        cumulative_regular_session_volume: 100_000,
        baseline: {
          as_of: "2026-09-15T14:20:00.000Z",
          elapsed_regular_session_minutes: 60,
          cumulative_regular_session_volume: 50_000,
          sample_session_count: 5,
        },
      },
      now,
    );

    expect(result.summary).toMatchObject({
      status: "stale",
      admissible_for_discovery: false,
      signal: "unavailable",
      reason_codes: expect.arrayContaining([
        "observation_stale",
        "regular_session_not_verified",
        "baseline_sample_insufficient",
      ]),
    });
  });

  test("fails closed when a claimed regular-session snapshot is premarket or has contradictory elapsed time", () => {
    const premarket = intake({
      observed_at: "2026-09-15T13:20:00.000Z",
      elapsed_regular_session_minutes: 0,
    });
    const contradictoryElapsedTime = intake({
      observed_at: "2026-09-15T15:05:00.000Z",
      elapsed_regular_session_minutes: 90,
    });

    expect(premarket.summary).toMatchObject({
      status: "invalid",
      admissible_for_discovery: false,
      expected_elapsed_regular_session_minutes: null,
      reason_codes: expect.arrayContaining([
        "observation_outside_regular_session",
        "elapsed_session_minutes_invalid",
      ]),
    });
    expect(contradictoryElapsedTime.summary).toMatchObject({
      status: "invalid",
      admissible_for_discovery: false,
      expected_elapsed_regular_session_minutes: 95,
      reason_codes: ["elapsed_session_minutes_mismatch"],
    });
  });

  test("requires a calendar-proven session window on the declared New York date", () => {
    const missingCalendarSource = intake({ market_calendar_source: " " });
    const wrongSessionDate = intake({
      regular_session_opened_at: "2026-09-14T13:30:00.000Z",
      regular_session_closed_at: "2026-09-14T20:00:00.000Z",
    });
    const impossibleMarketDate = intake({ market_date: "2026-02-30" });

    expect(missingCalendarSource.summary).toMatchObject({
      status: "incomplete",
      admissible_for_discovery: false,
      reason_codes: ["market_calendar_source_missing"],
    });
    expect(wrongSessionDate.summary).toMatchObject({
      status: "invalid",
      admissible_for_discovery: false,
      reason_codes: expect.arrayContaining([
        "regular_session_market_date_mismatch",
      ]),
    });
    expect(impossibleMarketDate.summary).toMatchObject({
      status: "invalid",
      admissible_for_discovery: false,
      reason_codes: ["market_date_invalid"],
    });
  });

  test("does not accept future, malformed or incomplete volume evidence", () => {
    const result = intake({
      symbol: " ",
      provider: null,
      observed_at: "2026-09-15T15:11:00.000Z",
      market_date: "wrong",
      elapsed_regular_session_minutes: 0,
      cumulative_regular_session_volume: 0,
      baseline: {
        as_of: "not-a-date",
        elapsed_regular_session_minutes: null,
        cumulative_regular_session_volume: null,
        sample_session_count: null,
      },
    });

    expect(result.summary).toMatchObject({
      status: "invalid",
      admissible_for_discovery: false,
      relative_volume: null,
      signal: "unavailable",
      reason_codes: expect.arrayContaining([
        "symbol_missing",
        "provider_missing",
        "observed_at_in_future",
        "market_date_invalid",
        "elapsed_session_minutes_invalid",
        "baseline_elapsed_minutes_invalid",
        "current_volume_invalid",
        "baseline_volume_invalid",
        "baseline_sample_insufficient",
        "baseline_as_of_invalid",
      ]),
    });
  });
});
