import { expect, test } from "@playwright/test";

import {
  buildDayTradeScanOrchestrationSummary,
  shouldRunOfficialDayTradeScan,
  type DayTradeScanWindow,
} from "../../lib/day-trade-scan-orchestration";
import type { MarketSessionStatus } from "../../lib/market-session";
import {
  buildRecommendationServingCadenceSummary,
} from "../../lib/recommendation-serving-cadence";
import type { RecommendationScanRun } from "../../lib/recommendation-scan-run";

const tradingDayMarketStatus: MarketSessionStatus = {
  isOpenDay: true,
  reason: "Trading day",
  date: "2026-06-24",
  dayType: "trading_day",
  marketOpenTime: "09:30",
  marketCloseTime: "16:00",
  provider: "polygon",
};

function scanRun(input: {
  window: DayTradeScanWindow;
  observedAt: string;
  tradingDate?: string;
  visibleCount?: number;
}) {
  return {
    id: `scan-${input.window}-${input.observedAt}`,
    run_fingerprint: `fingerprint-${input.window}-${input.observedAt}`,
    trading_date: input.tradingDate ?? "2026-06-24",
    window: input.window,
    status: "completed",
    source: "scheduled",
    observed_at: input.observedAt,
    counts: {
      visible_recommendation_count: input.visibleCount ?? 6,
    },
    payload_json: {},
  } as RecommendationScanRun;
}

test("classifies official scan windows from UTC into New York time", () => {
  const morning = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T13:50:00.000Z",
    marketStatus: tradingDayMarketStatus,
  });
  expect(morning.current_ny_time).toBe("2026-06-24 09:50 America/New_York");
  expect(morning.active_window).toBe("morning");
  expect(morning.decision).toBe("should_scan_now");
  expect(shouldRunOfficialDayTradeScan(morning)).toBe(true);

  const outside = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T15:34:00.000Z",
    marketStatus: tradingDayMarketStatus,
  });
  expect(outside.current_ny_time).toBe("2026-06-24 11:34 America/New_York");
  expect(outside.active_window).toBe("outside_window");
  expect(outside.next_window).toBe("midday");
  expect(outside.next_window_starts_at).toBe("12:00");
  expect(outside.decision).toBe("outside_scan_window");
  expect(shouldRunOfficialDayTradeScan(outside)).toBe(false);

  const midday = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T16:05:00.000Z",
    marketStatus: tradingDayMarketStatus,
  });
  expect(midday.current_ny_time).toBe("2026-06-24 12:05 America/New_York");
  expect(midday.active_window).toBe("midday");
  expect(midday.decision).toBe("should_scan_now");
  expect(shouldRunOfficialDayTradeScan(midday)).toBe(true);
});

test("explains missing Morning before the Midday window starts", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T15:34:00.000Z",
    marketStatus: tradingDayMarketStatus,
    scanRuns: [],
  });

  expect(summary.missed_windows).toEqual(["morning"]);
  expect(summary.official_scan_windows.map((item) => item.start_time)).toEqual([
    "09:45",
    "12:00",
    "15:00",
  ]);
  expect(summary.official_window_statuses).toMatchObject([
    {
      window: "morning",
      status: "missed",
      attempted_today: false,
    },
    {
      window: "midday",
      status: "waiting",
      attempted_today: false,
    },
    {
      window: "power_hour",
      status: "waiting",
      attempted_today: false,
    },
  ]);
  expect(summary.official_window_statuses[0]?.explanation).toContain(
    "Morning has no completed scan run recorded today.",
  );
});

test("marks Morning complete when a same-day official run exists", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T15:34:00.000Z",
    marketStatus: tradingDayMarketStatus,
    scanRuns: [
      scanRun({
        window: "morning",
        observedAt: "2026-06-24T14:02:00.000Z",
      }),
    ],
  });

  const morningStatus = summary.official_window_statuses.find(
    (item) => item.window === "morning",
  );
  expect(summary.missed_windows).toEqual([]);
  expect(morningStatus).toMatchObject({
    status: "completed",
    latest_scan_at: "2026-06-24T14:02:00.000Z",
    attempted_today: true,
  });
});

test("same-window cooldown blocks a duplicate official scheduled scan", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T13:55:00.000Z",
    marketStatus: tradingDayMarketStatus,
    lastScanCooldownMinutes: 45,
    scanRuns: [
      scanRun({
        window: "morning",
        observedAt: "2026-06-24T13:50:00.000Z",
      }),
    ],
  });

  expect(summary.active_window).toBe("morning");
  expect(summary.decision).toBe("scan_recently_completed");
  expect(summary.should_scan_now).toBe(false);
  expect(shouldRunOfficialDayTradeScan(summary)).toBe(false);
});

test("previous trading-day runs do not satisfy today's Morning state", () => {
  const summary = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T15:34:00.000Z",
    marketStatus: tradingDayMarketStatus,
    scanRuns: [
      scanRun({
        window: "morning",
        observedAt: "2026-06-23T14:02:00.000Z",
        tradingDate: "2026-06-23",
      }),
    ],
  });

  const morningStatus = summary.official_window_statuses.find(
    (item) => item.window === "morning",
  );
  expect(summary.missed_windows).toEqual(["morning"]);
  expect(morningStatus).toMatchObject({
    status: "missed",
    attempted_today: false,
  });
});

test("outside official window does not create a current official serving batch", () => {
  const orchestration = buildDayTradeScanOrchestrationSummary({
    now: "2026-06-24T15:34:00.000Z",
    marketStatus: tradingDayMarketStatus,
  });
  const servingCadence = buildRecommendationServingCadenceSummary({
    tradingDate: "2026-06-24",
    orchestration,
    visibleRecommendations: [
      {
        id: "rec_batch_4b9kf0",
        ticker: "TEST",
        created_at: "2026-06-24T15:34:00.000Z",
        status: "new",
      },
    ],
    now: "2026-06-24T15:34:00.000Z",
  });

  expect(servingCadence.serving_window).toBe("outside_window");
  expect(servingCadence.serving_decision).toBe("wait_for_next_window");
  expect(servingCadence.batch_status).toBe("not_started");
  expect(servingCadence.latest_official_batch_id).toBeNull();
});
