import { expect, test } from "@playwright/test";

import { buildRealScannerCandidateGenerationSummary } from "@/lib/real-scanner-candidate-generation";
import { buildScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import {
  recommendationDecisionFeatureVectorFromScannerCandidate,
  recommendationDecisionFeatureVectorFromUnknown,
} from "@/lib/recommendation-decision-feature-vector";
import type { ScannerCandidate } from "@/lib/scanner";

function scannerCandidate(): ScannerCandidate & { local_score: number } {
  return {
    ticker: "VEC",
    company_name: "Vector Incorporated",
    sector: "Technology",
    mock_current_price: 100.5,
    mock_trend: "uptrend",
    mock_volume_context: "expanding",
    mock_support: 98,
    mock_resistance: 105,
    mock_news_context: "none",
    latest_close: 100.5,
    volume_ratio: 1.8,
    distance_to_20d_high: -2.4,
    change_5d_percent: 4.2,
    proposed_entry_low: 100,
    proposed_entry_high: 101,
    proposed_stop_loss: 98,
    proposed_target_1: 106,
    proposed_target_2: 108,
    proposed_risk_reward: 2.5,
    recent_change_percent: 0.5,
    recent_range_position: 0.72,
    recent_volume_ratio: 1.6,
    average_range_percent: 1.4,
    latest_range_percent: 2.1,
    range_expansion_ratio: 1.5,
    intraday_indicators: {
      vwap: 100,
      latestPrice: 100.5,
      priceVsVwapPercent: 0.5,
      isAboveVwap: true,
      recentHigh: 101,
      recentLow: 99,
      recentRangePercent: 2,
      momentumPercent: 0.5,
      momentumDirection: "up",
      volumeTrend: "expanding",
      latestVolume: 2000,
      averageVolume: 1000,
      recentVolumeRatio: 1.6,
      recentVolumeBarClosedAtSeconds: Date.parse("2026-09-17T14:00:00.000Z") / 1000,
      recentVolumeIntervalSeconds: 5 * 60,
      warnings: [],
    },
    intraday_indicator_source: "fresh",
    intraday_indicator_cached_at: "2026-09-17T14:00:00.000Z",
    intraday_indicator_stale: false,
    reference_price_timestamp: "2026-09-17T14:00:00.000Z",
    reference_price_provider: "twelve_data",
    local_score: 92,
  };
}

test("captures a bounded decision feature projection and propagates it through real scanner output", () => {
  const candidate = scannerCandidate();
  const featureVector = recommendationDecisionFeatureVectorFromScannerCandidate(
    candidate,
    Date.parse("2026-09-17T14:01:00.000Z") / 1000,
  );
  const summary = buildRealScannerCandidateGenerationSummary({
    universe: [candidate],
    candidates: [candidate],
    source: "test",
    scanWindow: "midday",
    now: new Date("2026-09-17T14:01:00.000Z"),
  });

  expect(featureVector).toMatchObject({
    contract_version: "recommendation_decision_feature_vector_v2",
    feature_values: {
      latest_price: 100.5,
      daily_volume_ratio: 1.8,
      intraday_vwap: 100,
      intraday_momentum_percent: 0.5,
      planned_risk_reward: 2.5,
      scanner_local_score: 92,
    },
    explicit_unavailable_feature_names: [],
  });
  expect(summary.candidates[0]?.decision_feature_vector).toEqual(featureVector);
  const expiredSummary = buildRealScannerCandidateGenerationSummary({
    universe: [candidate],
    candidates: [candidate],
    source: "test",
    scanWindow: "midday",
    now: new Date("2026-09-17T14:06:00.000Z"),
  });
  expect(
    expiredSummary.candidates[0]?.signals.find(
      (signal) => signal.label === "recent_volume_ratio",
    )?.value,
  ).toBeNull();
  expect(
    expiredSummary.candidates[0]?.decision_feature_vector?.feature_values
      .intraday_recent_volume_ratio,
  ).toBeNull();
});

test("keeps unavailable inputs explicit and rejects a malformed feature projection", () => {
  const candidate = scannerCandidate();
  candidate.intraday_indicators = null;
  const featureVector = recommendationDecisionFeatureVectorFromScannerCandidate(
    candidate,
  );

  expect(featureVector.explicit_unavailable_feature_names).toContain(
    "intraday_vwap",
  );
  expect(recommendationDecisionFeatureVectorFromUnknown(featureVector)).toEqual(
    featureVector,
  );
  const legacy = {
    ...featureVector,
    contract_version: "recommendation_decision_feature_vector_v1",
  };
  expect(recommendationDecisionFeatureVectorFromUnknown(legacy)).toEqual(
    legacy,
  );
  expect(
    recommendationDecisionFeatureVectorFromUnknown({
      ...featureVector,
      contract_version: "recommendation_decision_feature_vector_v3",
    }),
  ).toBeNull();
  expect(
    recommendationDecisionFeatureVectorFromUnknown({
      ...featureVector,
      explicit_unavailable_feature_names: [],
    }),
  ).toBeNull();
  expect(
    recommendationDecisionFeatureVectorFromUnknown({
      ...featureVector,
      raw_provider_response: "must never be retained here",
    }),
  ).toBeNull();
});

test("v2 volume feature cannot inherit a legacy daily-derived scanner ratio", () => {
  const candidate = scannerCandidate();
  candidate.recent_volume_ratio = 9.9;
  expect(
    recommendationDecisionFeatureVectorFromScannerCandidate(
      candidate,
      Date.parse("2026-09-17T14:01:00.000Z") / 1000,
    )
      .feature_values.intraday_recent_volume_ratio,
  ).toBe(1.6);
  expect(
    recommendationDecisionFeatureVectorFromScannerCandidate(
      candidate,
      Date.parse("2026-09-17T14:06:00.000Z") / 1000,
    ).feature_values.intraday_recent_volume_ratio,
  ).toBeNull();

  candidate.intraday_indicator_stale = true;
  expect(
    recommendationDecisionFeatureVectorFromScannerCandidate(
      candidate,
      Date.parse("2026-09-17T14:01:00.000Z") / 1000,
    )
      .feature_values.intraday_recent_volume_ratio,
  ).toBeNull();

  delete candidate.intraday_indicator_stale;
  expect(
    recommendationDecisionFeatureVectorFromScannerCandidate(
      candidate,
      Date.parse("2026-09-17T14:01:00.000Z") / 1000,
    )
      .feature_values.intraday_recent_volume_ratio,
  ).toBeNull();
});

test("ranking liquidity does not accept a legacy recent ratio without fresh intraday evidence", () => {
  const now = new Date("2026-09-17T14:01:00.000Z");
  const baseline = {
    ...scannerCandidate(),
    volume_ratio: 0.7,
    proposed_target_2: 108.5,
    recent_volume_ratio: undefined,
    intraday_indicator_stale: true,
  };
  const legacy = { ...baseline, recent_volume_ratio: 9.9 };
  const verified = {
    ...baseline,
    recent_volume_ratio: 1.6,
    intraday_indicator_stale: false,
  };
  const liquidityScore = (candidate: ScannerCandidate) =>
    buildScannerCandidateRankingSummary({ candidates: [candidate], now })
      .results[0]?.score.components.find(
        (component) => component.component === "liquidity_volume",
      )?.score;

  expect(liquidityScore(legacy)).toBe(liquidityScore(baseline));
  expect(liquidityScore(verified)).toBeGreaterThan(liquidityScore(baseline)!);
});

test("an open or incomplete candle cannot add an unverified liquidity bonus", () => {
  const now = new Date("2026-09-17T14:01:00.000Z");
  const baseline = scannerCandidate();
  baseline.volume_ratio = 0.7;
  baseline.recent_volume_ratio = undefined;
  baseline.intraday_indicators = {
    ...baseline.intraday_indicators!,
    recentVolumeRatio: null,
    recentVolumeBarClosedAtSeconds: null,
    recentVolumeIntervalSeconds: null,
    latestVolume: 1000,
    averageVolume: 1000,
  };
  const openCandle = {
    ...baseline,
    intraday_indicators: {
      ...baseline.intraday_indicators,
      latestVolume: 2000,
    },
  };
  const liquidityScore = (candidate: ScannerCandidate) =>
    buildScannerCandidateRankingSummary({ candidates: [candidate], now })
      .results[0]?.score.components.find(
        (component) => component.component === "liquidity_volume",
      )?.score;

  expect(liquidityScore(openCandle)).toBe(liquidityScore(baseline));
});
