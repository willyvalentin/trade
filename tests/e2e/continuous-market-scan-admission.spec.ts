import { expect, test } from "@playwright/test";

import { buildContinuousMarketScanAdmission } from "../../lib/continuous-market-scan-admission";
import { buildDayTradeScanOrchestrationSummary } from "../../lib/day-trade-scan-orchestration";
import { getIntradayScanWindow } from "../../lib/intraday-scan-window";
import { buildMarketSessionEvaluation, type MarketSessionStatus } from "../../lib/market-session";
import { buildRecommendationServingCadenceSummary } from "../../lib/recommendation-serving-cadence";
import type { RecommendationScanRun } from "../../lib/recommendation-scan-run";
import { buildScannerCandidateRankingSummary } from "../../lib/scanner-candidate-ranking";

const tradingDay: MarketSessionStatus = {
  isOpenDay: true,
  reason: "Trading day",
  date: "2026-09-23",
  dayType: "trading_day",
  marketOpenTime: "09:30",
  marketCloseTime: "16:00",
  provider: "polygon",
};

function admission(
  instant: string,
  overrides: {
    marketStatus?: MarketSessionStatus;
    scanWindow?: ReturnType<typeof getIntradayScanWindow>;
    recentScanRuns?: RecommendationScanRun[];
  } = {},
) {
  const now = new Date(instant);
  const marketStatus = overrides.marketStatus ?? tradingDay;

  return buildContinuousMarketScanAdmission({
    now,
    marketStatus,
    marketSession: buildMarketSessionEvaluation({ now, marketStatus }),
    scanWindow: overrides.scanWindow ?? getIntradayScanWindow(now),
    recentScanRuns: overrides.recentScanRuns ?? [],
    legacyPowerHourWindowGate: {
      official_window_detected: true,
      scheduled_gate_window: "power_hour",
      scheduled_gate_allowed: true,
      scheduled_gate_block_reason: null,
      schedule_window_mismatch: false,
    },
  });
}

test("admits provider-confirmed regular-session scans between former fixed windows", () => {
  for (const instant of [
    "2026-09-23T13:30:00.000Z", // 09:30 EDT, former pre-morning gap
    "2026-09-23T15:00:00.000Z", // 11:00 EDT, today's catalog-only misclassification
    "2026-09-23T15:30:00.000Z", // 11:30 EDT, former morning/midday gap
    "2026-09-23T16:15:00.000Z", // 12:15 EDT, today's frozen baseline slot
    "2026-09-23T18:30:00.000Z", // 14:30 EDT, former midday/power-hour gap
  ]) {
    expect(admission(instant)).toMatchObject({
      policy_version: "continuous_regular_session_v1",
      scheduled_gate_allowed: true,
      scheduled_gate_block_reason: null,
      official_window_detected: false,
    });
  }
});

test("requires an exact current, provider-confirmed regular session", () => {
  const instant = "2026-09-23T15:30:00.000Z";
  for (const marketStatus of [
    { ...tradingDay, date: "2026-09-22" },
    { ...tradingDay, provider: "local_fallback", dayType: "unknown" as const },
    { ...tradingDay, isOpenDay: false },
    { ...tradingDay, dayType: "holiday" as const },
  ]) {
    expect(admission(instant, { marketStatus })).toMatchObject({
      scheduled_gate_allowed: false,
      scheduled_gate_block_reason: "market_session_not_provider_confirmed_open",
    });
  }
  expect(admission("2026-09-23T20:00:00.000Z")).toMatchObject({
    scheduled_gate_allowed: false,
    scheduled_gate_block_reason: "market_session_not_provider_confirmed_open",
  });

  const earlyClose = {
    ...tradingDay,
    dayType: "early_close" as const,
    marketCloseTime: "13:00",
  };
  expect(
    admission("2026-09-23T16:45:00.000Z", { marketStatus: earlyClose })
      .scheduled_gate_allowed,
  ).toBe(true);
  expect(
    admission("2026-09-23T17:15:00.000Z", { marketStatus: earlyClose })
      .scheduled_gate_allowed,
  ).toBe(false);
});

test("rejects clock/window mismatch and a recent completed scan", () => {
  const instant = "2026-09-23T15:30:00.000Z";
  expect(admission(instant, { scanWindow: "afternoon" })).toMatchObject({
    scheduled_gate_allowed: false,
    scheduled_gate_block_reason: "scan_window_clock_mismatch",
  });

  const recentScan = {
    trading_date: "2026-09-23",
    status: "completed",
    observed_at: "2026-09-23T15:20:00.000Z",
  } as RecommendationScanRun;
  expect(admission(instant, { recentScanRuns: [recentScan] })).toMatchObject({
    scheduled_gate_allowed: false,
    scheduled_gate_block_reason: "cadence_guard",
  });
  expect(
    admission(instant, {
      recentScanRuns: [
        { ...recentScan, observed_at: "2026-09-23T15:15:00.000Z" },
      ],
    }).scheduled_gate_allowed,
  ).toBe(true);
});

test("does not expand the separate late-session trial gate", () => {
  expect(admission("2026-09-23T19:15:00.000Z")).toMatchObject({
    policy_version: "continuous_regular_session_v1",
    scheduled_gate_window: "power_hour",
    scheduled_gate_allowed: true,
  });
});

test("serving state follows an admitted market scan even between old windows", () => {
  const now = new Date("2026-09-23T15:30:00.000Z");
  const orchestration = buildDayTradeScanOrchestrationSummary({
    now,
    marketStatus: tradingDay,
  });
  expect(orchestration.active_window).toBe("outside_window");

  const cadence = buildRecommendationServingCadenceSummary({
    tradingDate: "2026-09-23",
    orchestration,
    currentScanWindow: "midday",
    currentScanAdmitted: true,
    visibleRecommendations: [
      {
        id: "qualified-signal",
        ticker: "TEST",
        created_at: now.toISOString(),
        status: "new",
      },
    ],
    now,
  });

  expect(cadence.serving_window).toBe("midday");
  expect(cadence.status).toBe("published");
  expect(cadence.visible_recommendation_count).toBe(1);
  expect(cadence.copy.intentional_publishing).toContain(
    "throughout the regular session",
  );

  const unobserved = buildRecommendationServingCadenceSummary({
    tradingDate: "2026-09-23",
    orchestration,
    currentScanWindow: "midday",
    currentScanAdmitted: true,
    visibleRecommendations: [],
    ranking: null,
    now,
  });
  expect(unobserved.no_trade_valid).toBe(false);
  expect(unobserved.status).toBe("refreshing_silently");

  const observedNoTrade = buildRecommendationServingCadenceSummary({
    tradingDate: "2026-09-23",
    orchestration,
    currentScanWindow: "midday",
    currentScanAdmitted: true,
    visibleRecommendations: [],
    ranking: buildScannerCandidateRankingSummary({
      candidates: [],
      scanWindow: "midday",
      now,
    }),
    now,
  });
  expect(observedNoTrade.no_trade_valid).toBe(true);
  expect(observedNoTrade.status).toBe("no_trade_valid");
});
