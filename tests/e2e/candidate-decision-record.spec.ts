import { expect, test } from "@playwright/test";

import {
  buildCandidateDecisionCapture,
  buildCandidateDecisionRecord,
} from "@/lib/candidate-decision-record";
import {
  candidateDecisionRecordFromUnknown,
  summarizeCandidateDecisionRecord,
} from "@/lib/candidate-decision-readback";
import { buildRecommendationScanRun } from "@/lib/recommendation-scan-run";
import { buildScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import type { ScannerCandidate } from "@/lib/scanner";

const CAPTURED_AT = "2026-09-15T14:30:00.000Z";

function candidate(index: number): ScannerCandidate & { local_score: number } {
  const ticker = `T${String(index).padStart(2, "0")}`;

  return {
    ticker,
    company_name: `Test company ${index}`,
    sector: "Technology",
    mock_current_price: 100,
    mock_trend: "uptrend",
    mock_volume_context: "expanding volume",
    mock_support: 96,
    mock_resistance: 110,
    mock_news_context: "No adverse news",
    latest_close: 100,
    volume_ratio: 1.8,
    recent_volume_ratio: 1.8,
    proposed_entry_low: 99,
    proposed_entry_high: 100,
    proposed_stop_loss: 96,
    proposed_target_1: 106,
    proposed_target_2: 110,
    proposed_risk_reward: 2.5,
    intraday_indicators: {
      vwap: 99,
      latestPrice: 100,
      priceVsVwapPercent: 1,
      isAboveVwap: true,
      recentHigh: 101,
      recentLow: 98,
      recentRangePercent: 3,
      momentumPercent: 2,
      momentumDirection: "up",
      volumeTrend: "expanding",
      latestVolume: 1800,
      averageVolume: 1000,
      warnings: [],
    },
    intraday_indicator_source: "fresh",
    intraday_indicator_cached_at: CAPTURED_AT,
    intraday_indicator_stale: false,
    reference_price_timestamp: CAPTURED_AT,
    reference_price_provider: "twelve_data",
    local_score: 99 - index,
  };
}

function scanRun(candidateCount: number) {
  return buildRecommendationScanRun({
    trading_date: "2026-09-15",
    observed_at: CAPTURED_AT,
    completed_at: CAPTURED_AT,
    window: "morning",
    source: "supabase",
    scanned_ticker_count: candidateCount,
    raw_candidate_count: candidateCount,
  });
}

test.describe("candidate decision record", () => {
  test("retains every ranked candidate beyond a presentation-sized result list", () => {
    const candidates = Array.from({ length: 25 }, (_, index) => candidate(index));
    const ranking = buildScannerCandidateRankingSummary({
      candidates,
      targetMin: 6,
      targetMax: 10,
      now: new Date(CAPTURED_AT),
    });
    const capture = buildCandidateDecisionCapture({
      captureTimestamp: CAPTURED_AT,
      universe: candidates,
      observedCandidates: candidates,
      ranking,
      eligibleCandidateTickers: candidates.map((item) => item.ticker),
      publishableThreshold: 70,
      noPublishReason: "no_publishable_ranked_candidates",
      recommendationBuildPath: "no_publish",
    });
    const record = buildCandidateDecisionRecord({
      scanRun: scanRun(candidates.length),
      capture,
      scoringVersion: "day_trade_score_v1",
      buildVersion: "test-build-v1",
    });

    expect(ranking.results).toHaveLength(25);
    expect(record).not.toBeNull();
    expect(record?.coverage).toMatchObject({
      expected_candidate_count: 25,
      observed_candidate_count: 25,
      ranked_candidate_count: 25,
      full_membership_declared: true,
      full_membership_captured: true,
      membership_reason_codes: [],
    });
    expect(record?.coverage.pre_truncation_capture_evidence).toMatchObject({
      full_candidate_count: 25,
      capture_stage_identity: "scanner-full-ranking-boundary",
    });
    expect(record?.candidates).toHaveLength(25);
    expect(record?.candidates.map((item) => item.ranking?.rank)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1),
    );
  });

  test("makes an incomplete observation and an explicit no-trade explainable", () => {
    const candidates = [candidate(1), candidate(2), candidate(3)];
    const observedCandidates = candidates.slice(0, 2);
    const ranking = buildScannerCandidateRankingSummary({
      candidates: observedCandidates,
      targetMin: 1,
      targetMax: 1,
      now: new Date(CAPTURED_AT),
    });
    const capture = buildCandidateDecisionCapture({
      captureTimestamp: CAPTURED_AT,
      universe: candidates,
      observedCandidates,
      ranking,
      eligibleCandidateTickers: observedCandidates.map((item) => item.ticker),
      publishableThreshold: 70,
      noPublishReason: "no_publishable_ranked_candidates",
      recommendationBuildPath: "no_publish",
    });
    const record = buildCandidateDecisionRecord({
      scanRun: scanRun(candidates.length),
      capture,
      scoringVersion: "day_trade_score_v1",
      buildVersion: "test-build-v1",
    });

    expect(record?.final_decision).toEqual({
      disposition: "no_trade",
      published_tickers: [],
      no_trade_reason: "no_publishable_ranked_candidates",
      recommendation_build_path: "no_publish",
    });
    expect(record?.candidates.find((item) => item.ticker === "T03")).toMatchObject({
      disposition: "not_evaluated",
      eligibility: "unknown",
      reason_codes: ["candidate_provider_gap"],
      data: {
        freshness: "gap",
        gap_codes: ["candidate_provider_gap"],
      },
      ranking: null,
    });

    const readback = summarizeCandidateDecisionRecord(record);
    expect(readback).toMatchObject({
      status: "available",
      final_disposition: "no_trade",
      candidate_count: 3,
      observed_candidate_count: 2,
      ranked_candidate_count: 2,
      no_trade_reason: "no_publishable_ranked_candidates",
      data_health: {
        fresh_candidate_count: 2,
        stale_candidate_count: 0,
        gap_candidate_count: 1,
        unknown_freshness_candidate_count: 0,
      },
      strongest_unpublished_candidates: [
        {
          ticker: "T01",
          rank: 1,
        },
        {
          ticker: "T02",
          rank: 2,
        },
      ],
    });
  });

  test("readback only presents ranked candidates that were not published", () => {
    const candidates = [candidate(1), candidate(2), candidate(3)];
    const ranking = buildScannerCandidateRankingSummary({
      candidates,
      targetMin: 1,
      targetMax: 1,
      now: new Date(CAPTURED_AT),
    });
    const capture = buildCandidateDecisionCapture({
      captureTimestamp: CAPTURED_AT,
      universe: candidates,
      observedCandidates: candidates,
      ranking,
      eligibleCandidateTickers: candidates.map((item) => item.ticker),
      publishableThreshold: 70,
      publishedTickers: ["T01"],
      recommendationBuildPath: "published",
    });
    const record = buildCandidateDecisionRecord({
      scanRun: scanRun(candidates.length),
      capture,
      scoringVersion: "day_trade_score_v1",
      buildVersion: "test-build-v1",
    });

    expect(record?.final_decision.disposition).toBe("recommendations_published");
    expect(summarizeCandidateDecisionRecord(record)).toMatchObject({
      strongest_unpublished_candidates: [
        {
          ticker: "T02",
          rank: 2,
          disposition: "ranked_not_selected",
          reason_codes: ["selection_capacity_exceeded"],
        },
        {
          ticker: "T03",
          rank: 3,
        },
      ],
    });
  });

  test("rejects an unversioned payload at the browser boundary", () => {
    expect(candidateDecisionRecordFromUnknown({ candidates: [] })).toBeNull();
  });

  test("rejects a record whose candidate data health cannot be read safely", () => {
    const candidates = [candidate(1)];
    const ranking = buildScannerCandidateRankingSummary({
      candidates,
      targetMin: 1,
      targetMax: 1,
      now: new Date(CAPTURED_AT),
    });
    const capture = buildCandidateDecisionCapture({
      captureTimestamp: CAPTURED_AT,
      universe: candidates,
      observedCandidates: candidates,
      ranking,
      eligibleCandidateTickers: candidates.map((item) => item.ticker),
      publishableThreshold: 70,
      noPublishReason: "no_publishable_ranked_candidates",
      recommendationBuildPath: "no_publish",
    });
    const record = buildCandidateDecisionRecord({
      scanRun: scanRun(candidates.length),
      capture,
      scoringVersion: "day_trade_score_v1",
      buildVersion: "test-build-v1",
    });
    const [firstCandidate] = record?.candidates ?? [];
    const candidateWithoutData = Object.fromEntries(
      Object.entries(firstCandidate ?? {}).filter(([key]) => key !== "data"),
    );

    expect(
      candidateDecisionRecordFromUnknown({
        ...record,
        candidates: [candidateWithoutData],
      }),
    ).toBeNull();
  });

  test("rejects a versioned payload that cannot support the displayed readback", () => {
    expect(
      candidateDecisionRecordFromUnknown({
        record_version: "candidate_decision_record_v1",
        record_kind: "candidate_decision_record",
        candidates: [{}],
        coverage: {
          expected_candidate_count: 1,
          observed_candidate_count: 1,
          ranked_candidate_count: 1,
          full_membership_declared: true,
          full_membership_captured: true,
          membership_reason_codes: [],
        },
        final_decision: {
          disposition: "no_trade",
          published_tickers: [],
          no_trade_reason: null,
        },
      }),
    ).toBeNull();
  });
});
