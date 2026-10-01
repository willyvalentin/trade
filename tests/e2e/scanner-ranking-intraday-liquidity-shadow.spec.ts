import { expect, test } from "@playwright/test";

import {
  buildScannerCandidateRankingSummary,
  type RankingCandidate,
} from "@/lib/scanner-candidate-ranking";
import {
  buildScannerClockPriorShadowComparison,
  scannerClockPriorShadowComparisonFromUnknown,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import { buildScannerIntradayLiquidityShadowComparison } from "@/lib/scanner-ranking-intraday-liquidity-shadow";
import type { ScannerCandidate } from "@/lib/scanner";
import {
  buildScanLogMessage,
  parseScanLogFromMessage,
  type ScanLogEntry,
} from "@/lib/scan-log-core";

const NOW = new Date("2026-09-24T16:30:00.000Z");

function candidate(
  ticker = "FIT",
): ScannerCandidate & { local_score: number } {
  return {
    ticker,
    company_name: `${ticker} Incorporated`,
    sector: "Technology",
    mock_current_price: 100.5,
    mock_trend: "uptrend",
    mock_volume_context: "expanding",
    mock_support: 98,
    mock_resistance: 108.5,
    mock_news_context: "none",
    latest_close: 100.5,
    volume_ratio: 1.8,
    distance_to_20d_high: -2.4,
    change_5d_percent: 4.2,
    proposed_entry_low: 100,
    proposed_entry_high: 101,
    proposed_stop_loss: 98,
    proposed_target_1: 106,
    proposed_target_2: 108.5,
    proposed_risk_reward: 2.5,
    recent_change_percent: 0.5,
    recent_range_position: 0.72,
    average_range_percent: 1.4,
    latest_range_percent: 2.1,
    range_expansion_ratio: 1.5,
    intraday_indicators: {
      vwap: 100,
      latestPrice: 100.5,
      latestCandleTimestamp: "2026-09-24T16:25:00.000Z",
      priceVsVwapPercent: 0.5,
      isAboveVwap: true,
      recentHigh: 101,
      recentLow: 99,
      recentRangePercent: 2,
      momentumPercent: 0.5,
      momentumDirection: "up",
      volumeTrend: "unknown",
      latestVolume: 2_000,
      averageVolume: 1_000,
      recentVolumeRatio: null,
      recentVolumeBarClosedAtSeconds: null,
      recentVolumeIntervalSeconds: null,
      warnings: [],
    },
    intraday_indicator_source: "fresh",
    intraday_indicator_cached_at: "2026-09-24T16:30:00.000Z",
    intraday_indicator_stale: false,
    reference_price_timestamp: "2026-09-24T16:30:00.000Z",
    reference_price_provider: "twelve_data",
    local_score: 95,
  };
}

function comparison(
  candidates: Array<ScannerCandidate & { local_score: number }>,
) {
  const baseline = buildScannerCandidateRankingSummary({
    candidates,
    scanWindow: "midday",
    now: NOW,
  });
  return buildScannerIntradayLiquidityShadowComparison({
    candidates,
    baseline,
    scanWindow: "midday",
    now: NOW,
  });
}

function clockCandidate({
  ticker,
  timing,
  setupType,
  trend = 75,
  warnings = [],
}: {
  ticker: string;
  timing: number;
  setupType: string;
  trend?: number;
  warnings?: string[];
}): RankingCandidate {
  const result: RankingCandidate = {
    ...candidate(ticker),
    setup_type: setupType,
    local_score_warnings: warnings,
    local_score_breakdown: {
      momentum: 80,
      volume: 70,
      volatility: 70,
      trend,
      riskReward: 80,
      marketRegime: 65,
      timing,
    },
  };
  result.local_score =
    80 * 0.2 +
    70 * 0.15 +
    70 * 0.12 +
    trend * 0.18 +
    80 * 0.15 +
    65 * 0.1 +
    timing * 0.1;
  return result;
}

test("captures when daily volume masks missing verified intraday liquidity without changing live selection", () => {
  const result = comparison([candidate()]);

  expect(result).toMatchObject({
    status: "comparable",
    candidate_count: 1,
    verified_intraday_volume_count: 0,
    missing_verified_intraday_volume_count: 1,
    baseline_selected_tickers: ["FIT"],
    shadow_selected_tickers: [],
    selection_changed: true,
    live_ranking_effect: false,
    publication_effect: false,
    quality_improvement_claimed: false,
    quality_evidence_status: "not_evaluated",
    reason_codes: ["verified_intraday_volume_population_incomplete"],
  });
  expect(result.displacements[0]).toMatchObject({
    ticker: "FIT",
    baseline_selected: true,
    shadow_selected: false,
    daily_volume_ratio: 1.8,
    verified_intraday_volume_ratio: null,
    shadow_liquidity_score: 0,
    shadow_reason_codes: ["intraday_liquidity_unverified"],
  });
});

test("uses a fresh closed current-session bar as the shadow liquidity input", () => {
  const verified = candidate();
  verified.intraday_indicators = {
    ...verified.intraday_indicators!,
    volumeTrend: "expanding",
    recentVolumeRatio: 1.6,
    recentVolumeBarClosedAtSeconds: NOW.getTime() / 1_000 - 60,
    recentVolumeIntervalSeconds: 5 * 60,
  };
  const result = comparison([verified]);

  expect(result).toMatchObject({
    status: "comparable",
    verified_intraday_volume_count: 1,
    missing_verified_intraday_volume_count: 0,
    baseline_selected_tickers: ["FIT"],
    shadow_selected_tickers: ["FIT"],
    selection_changed: false,
    reason_codes: [],
  });
  expect(result.displacements[0]).toMatchObject({
    verified_intraday_volume_ratio: 1.6,
    shadow_reason_codes: [],
  });
  expect(result.displacements[0]?.shadow_liquidity_score).toBeGreaterThan(0);
});

test("rejects stale and expired intraday volume evidence in the shadow policy", () => {
  const stale = candidate("STALE");
  stale.intraday_indicator_stale = true;
  stale.intraday_indicators = {
    ...stale.intraday_indicators!,
    recentVolumeRatio: 2,
    recentVolumeBarClosedAtSeconds: NOW.getTime() / 1_000 - 60,
    recentVolumeIntervalSeconds: 5 * 60,
  };
  const expired = candidate("OLD");
  expired.intraday_indicators = {
    ...expired.intraday_indicators!,
    recentVolumeRatio: 2,
    recentVolumeBarClosedAtSeconds: NOW.getTime() / 1_000 - 301,
    recentVolumeIntervalSeconds: 5 * 60,
  };
  const result = comparison([stale, expired]);

  expect(result.verified_intraday_volume_count).toBe(0);
  expect(result.missing_verified_intraday_volume_count).toBe(2);
  expect(
    result.displacements.every(
      (item) =>
        item.verified_intraday_volume_ratio === null &&
        item.shadow_reason_codes.includes("intraday_liquidity_unverified"),
    ),
  ).toBe(true);
});

test("fails closed when baseline and shadow populations cannot be compared", () => {
  const first = candidate("DUP");
  const second = candidate("DUP");
  const baseline = buildScannerCandidateRankingSummary({
    candidates: [first, second],
    now: NOW,
  });
  const result = buildScannerIntradayLiquidityShadowComparison({
    candidates: [first, second],
    baseline,
    now: NOW,
  });

  expect(result).toMatchObject({
    status: "conflicting",
    reason_codes: ["candidate_identity_missing_or_duplicate"],
    displacements: [],
    live_ranking_effect: false,
    publication_effect: false,
  });
});

test("is deterministic and does not mutate the candidate population", () => {
  const candidates = [candidate("ONE"), candidate("TWO")];
  const inputSnapshot = structuredClone(candidates);

  expect(comparison(candidates)).toEqual(comparison(candidates));
  expect(candidates).toEqual(inputSnapshot);
});

test("preserves the shadow comparison through the durable scan-log envelope", () => {
  const shadowComparison = comparison([candidate()]);
  const clockCandidates = [
    clockCandidate({
      ticker: "ZZZ",
      timing: 95,
      setupType: "HIGH_OF_DAY_BREAKOUT",
    }),
    clockCandidate({
      ticker: "AAA",
      timing: 5,
      setupType: "VWAP_HOLD_CONTINUATION",
    }),
  ];
  const clockBaseline = buildScannerCandidateRankingSummary({
    candidates: clockCandidates,
    scanWindow: "morning_momentum",
    now: NOW,
  });
  const clockComparison = buildScannerClockPriorShadowComparison({
    candidates: clockCandidates,
    baseline: clockBaseline,
    scanWindow: "morning_momentum",
    now: NOW,
  });
  const scanLog = {
    created_at: NOW.toISOString(),
    source: "scheduled",
    scan_window: "midday",
    market_status: "open",
    result: "no_high_quality_setup",
    message: "No publishable setup.",
    recommendations_created: 0,
    scanner_intraday_liquidity_shadow_comparison: shadowComparison,
    scanner_clock_prior_shadow_comparison: clockComparison,
  } satisfies ScanLogEntry;
  const message = buildScanLogMessage(scanLog.message, scanLog);
  const parsed = parseScanLogFromMessage({
    id: "scan-1",
    created_at: NOW.toISOString(),
    recommendations_created: 0,
    message,
  });

  expect(parsed.scanner_intraday_liquidity_shadow_comparison).toEqual(
    shadowComparison,
  );
  expect(parsed.scanner_clock_prior_shadow_comparison).toEqual(clockComparison);
  expect(parsed.recommendations_created).toBe(0);
});

test("measures named clock-prior displacement without changing live ranking", () => {
  const candidates = [
    clockCandidate({
      ticker: "ZZZ",
      timing: 95,
      setupType: "HIGH_OF_DAY_BREAKOUT",
    }),
    clockCandidate({
      ticker: "AAA",
      timing: 5,
      setupType: "VWAP_HOLD_CONTINUATION",
    }),
  ];
  const baseline = buildScannerCandidateRankingSummary({
    candidates,
    scanWindow: "morning_momentum",
    now: NOW,
  });
  const result = buildScannerClockPriorShadowComparison({
    candidates,
    baseline,
    scanWindow: "morning_momentum",
    now: NOW,
  });

  expect(baseline.results.map((item) => item.ticker)).toEqual(["ZZZ", "AAA"]);
  expect(result).toMatchObject({
    status: "comparable",
    candidate_count: 2,
    selection_changed: true,
    live_ranking_effect: false,
    publication_effect: false,
    execution_effect: false,
    quality_improvement_claimed: false,
    quality_evidence_status: "not_evaluated",
    reason_codes: [],
  });
  expect(result.displacements.map((item) => item.ticker)).toEqual(["AAA", "ZZZ"]);
  expect(result.displacements.find((item) => item.ticker === "AAA")).toMatchObject({
    baseline_rank: 2,
    shadow_rank: 1,
    shadow_window_fit: 50,
  });
  expect(result.displacements.find((item) => item.ticker === "ZZZ")).toMatchObject({
    baseline_rank: 1,
    shadow_rank: 2,
    legacy_timing_score: 95,
    shadow_window_fit: 50,
  });
  expect(baseline.results.map((item) => item.ticker)).toEqual(["ZZZ", "AAA"]);
});

test("round-trips changed clock-neutral priority on the same selected members", () => {
  const candidates = [
    clockCandidate({ ticker: "ZZZ", timing: 95, setupType: "HIGH_OF_DAY_BREAKOUT" }),
    clockCandidate({ ticker: "AAA", timing: 5, setupType: "VWAP_HOLD_CONTINUATION" }),
  ];
  const baseline = buildScannerCandidateRankingSummary({
    candidates,
    scanWindow: "morning_momentum",
    now: NOW,
  });
  const result = buildScannerClockPriorShadowComparison({
    candidates,
    baseline,
    scanWindow: "morning_momentum",
    now: NOW,
  });
  expect(result.baseline_selected_tickers).toEqual(["ZZZ", "AAA"]);
  expect(result.shadow_selected_tickers).toEqual(["AAA", "ZZZ"]);
  expect(result.selection_changed).toBe(true);
  const persisted = JSON.parse(JSON.stringify(result));
  expect(scannerClockPriorShadowComparisonFromUnknown(persisted)).toEqual(result);
  expect(scannerClockPriorShadowComparisonFromUnknown({
    ...persisted,
    selection_changed: false,
  })).toBeNull();
  expect(scannerClockPriorShadowComparisonFromUnknown({
    ...persisted,
    baseline_selected_tickers: ["AAA", "ZZZ"],
  })).toBeNull();
  expect(scannerClockPriorShadowComparisonFromUnknown({
    ...persisted,
    baseline_selected_tickers: ["ZZZ", "AAA", "AAA"],
  })).toBeNull();
  expect(scannerClockPriorShadowComparisonFromUnknown({
    ...persisted,
    displacements: [...persisted.displacements].reverse(),
  })?.baseline_selected_tickers).toEqual(["ZZZ", "AAA"]);
});

test("retains unchanged nonlexical ranked selections without inventing a change", () => {
  const candidates = [
    clockCandidate({ ticker: "ZZZ", timing: 75, trend: 95, setupType: "VWAP_HOLD_CONTINUATION" }),
    clockCandidate({ ticker: "AAA", timing: 75, trend: 75, setupType: "VWAP_HOLD_CONTINUATION" }),
  ];
  const result = buildScannerClockPriorShadowComparison({
    candidates,
    baseline: buildScannerCandidateRankingSummary({ candidates, scanWindow: "midday", now: NOW }),
    scanWindow: "midday",
    now: NOW,
  });
  expect(result.baseline_selected_tickers).toEqual(["ZZZ", "AAA"]);
  expect(result.shadow_selected_tickers).toEqual(["ZZZ", "AAA"]);
  expect(result.selection_changed).toBe(false);
  expect(scannerClockPriorShadowComparisonFromUnknown(JSON.parse(JSON.stringify(result))))
    .toEqual(result);
});

test("keeps the clock-neutral result stable across named scan windows", () => {
  const morningCandidates = [
    clockCandidate({
      ticker: "ZZZ",
      timing: 75,
      setupType: "HIGH_OF_DAY_BREAKOUT",
      trend: 78,
    }),
    clockCandidate({
      ticker: "AAA",
      timing: 72,
      setupType: "VWAP_HOLD_CONTINUATION",
    }),
  ];
  const middayCandidates = [
    clockCandidate({
      ticker: "ZZZ",
      timing: 32,
      setupType: "UNKNOWN",
      trend: 75,
      warnings: ["Midday window increases chop risk."],
    }),
    clockCandidate({
      ticker: "AAA",
      timing: 36,
      setupType: "VWAP_HOLD_CONTINUATION",
      warnings: ["Midday window increases chop risk."],
    }),
  ];
  const morning = buildScannerClockPriorShadowComparison({
    candidates: morningCandidates,
    baseline: buildScannerCandidateRankingSummary({
      candidates: morningCandidates,
      scanWindow: "morning_momentum",
      now: NOW,
    }),
    scanWindow: "morning_momentum",
    now: NOW,
  });
  const midday = buildScannerClockPriorShadowComparison({
    candidates: middayCandidates,
    baseline: buildScannerCandidateRankingSummary({
      candidates: middayCandidates,
      scanWindow: "midday",
      now: NOW,
    }),
    scanWindow: "midday",
    now: NOW,
  });
  const shadowProjection = (comparison: typeof morning) =>
    comparison.displacements.map((item) => ({
      ticker: item.ticker,
      rank: item.shadow_rank,
      score: item.shadow_score,
      tier: item.shadow_tier,
      selected: item.shadow_selected,
      signal: item.shadow_signal_strength,
      window: item.shadow_window_fit,
      warningPenalty: item.shadow_warnings_penalty,
    }));

  expect(shadowProjection(morning)).toEqual(shadowProjection(midday));
  expect(midday.displacements.every((item) => item.legacy_clock_warning_count === 1)).toBe(
    true,
  );
});

test("fails closed when clock-neutral feature evidence is incomplete", () => {
  const candidates = [candidate("MISSING")];
  const baseline = buildScannerCandidateRankingSummary({
    candidates,
    scanWindow: "midday",
    now: NOW,
  });
  const result = buildScannerClockPriorShadowComparison({
    candidates,
    baseline,
    scanWindow: "midday",
    now: NOW,
  });

  expect(result).toMatchObject({
    status: "conflicting",
    reason_codes: ["clock_neutral_feature_breakdown_missing"],
    displacements: [],
    live_ranking_effect: false,
    publication_effect: false,
    execution_effect: false,
  });
});
