import { expect, test } from "@playwright/test";

import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import type { RealScannerCandidate } from "@/lib/real-scanner-candidate-generation";
import {
  buildScannerIntradayLiquidityShadowAttribution,
} from "@/lib/scanner-ranking-intraday-liquidity-shadow-attribution";
import {
  buildScannerIntradayLiquidityShadowEvidenceCapturePlan,
  SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION,
} from "@/lib/scanner-intraday-liquidity-shadow-evidence-capture";
import type { ScannerIntradayLiquidityShadowComparison } from "@/lib/scanner-ranking-intraday-liquidity-shadow";

const DECIDED_AT = "2026-09-26T18:00:00.000Z";
const SOURCE_AT = "2026-09-26T17:59:00.000Z";

function decisionCandidate(ticker: string, rank: number) {
  return {
    candidate_id: `scanner_candidate:v1:scan-run-1:${ticker}`,
    ticker,
    company_name: `${ticker} Incorporated`,
    sector: "Technology",
    disposition: "ranked_not_selected" as const,
    eligibility: "eligible" as const,
    reason_codes: [] as [],
    data: {
      provider_source: "twelve_data",
      source_timestamp: SOURCE_AT,
      freshness: "fresh" as const,
      indicator_source: "fresh" as const,
      gap_codes: [] as [],
    },
    ranking: {
      rank,
      score: 85 - rank,
      tier: "valid",
      selected: false,
      selection_bucket: "not_selected",
      rank_reason: `${ticker} ranked ${rank}`,
      tie_break_key: ticker,
      components: [],
      warnings: [],
      gaps: [],
    },
    build: null,
  };
}

function decisionRecord(tickers = ["FIT", "RUN"]): CandidateDecisionRecord {
  return {
    record_version: "candidate_decision_record_v3",
    record_kind: "candidate_decision_record",
    scan_run_id: "scan-run-1",
    scan_run_fingerprint: "scan-fingerprint-1",
    decision_timestamp: DECIDED_AT,
    strategy_reference: null,
    versions: {
      scanner_version: "scanner-v1",
      universe_version: "universe-v1",
      scoring_version: "scoring-v1",
      ranking_version: "scanner_candidate_ranking_v1.2",
      build_version: "build-v1",
      provider_contract_version: "provider-v1",
    },
    learning_attribution: {
      attribution_version: "candidate_decision_learning_attribution_v1",
      recommendation_publish_policy_version: "policy-v1",
      confidence: {
        semantics: "ordinal_not_calibrated",
        numeric_confidence: null,
        numeric_confidence_scale: "not_available",
      },
      canonical_evaluation_versions: null,
      attribution_status: "incomplete",
      reason_codes: ["canonical_evaluation_versions_missing"],
    },
    coverage: {
      expected_candidate_count: tickers.length,
      observed_candidate_count: tickers.length,
      ranked_candidate_count: tickers.length,
      full_membership_declared: true,
      full_membership_captured: true,
      membership_reason_codes: [],
      pre_truncation_capture_evidence: null,
    },
    candidates: tickers.map((ticker, index) =>
      decisionCandidate(ticker, index + 1),
    ),
    final_decision: {
      disposition: "no_trade",
      published_tickers: [],
      no_trade_reason: "no_publishable_candidate",
      recommendation_build_path: "no_publish",
    },
  };
}

function comparison(
  record: CandidateDecisionRecord,
): ScannerIntradayLiquidityShadowComparison {
  const displacements = record.candidates.map((candidate) => ({
    ticker: candidate.ticker,
    baseline_rank: candidate.ranking!.rank,
    shadow_rank: candidate.ranking!.rank,
    rank_change: 0,
    baseline_score: candidate.ranking!.score,
    shadow_score: candidate.ranking!.score,
    score_change: 0,
    baseline_tier: candidate.ranking!.tier,
    shadow_tier: candidate.ranking!.tier,
    baseline_selected: candidate.ranking!.selected,
    shadow_selected: candidate.ranking!.selected,
    daily_volume_ratio: 1.8,
    verified_intraday_volume_ratio: 1.2,
    shadow_liquidity_score: 6,
    shadow_reason_codes: [],
  }));

  return {
    comparison_version: "scanner_intraday_liquidity_shadow_comparison_v1",
    comparison_kind: "scanner_intraday_liquidity_shadow_comparison",
    generated_at: DECIDED_AT,
    status: "comparable",
    baseline_policy_version: "scanner_candidate_ranking_v1.2",
    shadow_policy_version:
      "scanner_candidate_ranking_verified_intraday_liquidity_v1",
    candidate_count: displacements.length,
    candidate_tickers: displacements.map((item) => item.ticker),
    verified_intraday_volume_count: displacements.length,
    missing_verified_intraday_volume_count: 0,
    baseline_selected_tickers: [],
    shadow_selected_tickers: [],
    selection_changed: false,
    live_ranking_effect: false,
    publication_effect: false,
    quality_improvement_claimed: false,
    quality_evidence_status: "not_evaluated",
    reason_codes: [],
    displacements,
  };
}

function realCandidate(ticker: string, rank: number): RealScannerCandidate {
  return {
    ticker,
    company_name: `${ticker} Incorporated`,
    sector: "Technology",
    tier: "valid",
    score: {
      value: 85 - rank,
      tier: "valid",
      reasons: [`${ticker} ranked ${rank}`],
      warnings: [],
    },
    signals: [],
    warnings: [],
    data_source: "fresh",
    provider_source: "twelve_data",
    market_data_timestamp: SOURCE_AT,
    reference_price_timestamp: SOURCE_AT,
    stale: false,
    entry_low: 99,
    entry_high: 100,
    stop_loss: 96,
    target_1: 108,
    target_2: 112,
    risk_reward: 2.25,
  };
}

function fixture(tickers = ["FIT", "RUN"]) {
  const record = decisionRecord(tickers);
  const compared = comparison(record);
  const attribution = buildScannerIntradayLiquidityShadowAttribution({
    comparison: compared,
    decisionRecord: record,
  });
  expect(attribution?.status).toBe("attributed");
  return {
    record,
    comparison: compared,
    attribution,
    candidates: tickers.map((ticker, index) =>
      realCandidate(ticker, index + 1),
    ),
  };
}

test("plans one owner-bound research snapshot for every non-visible ranked candidate", () => {
  const input = fixture();
  const plan = buildScannerIntradayLiquidityShadowEvidenceCapturePlan({
    ...input,
    decisionRecord: input.record,
    scanWindow: "midday",
  });

  expect(plan.receipt).toMatchObject({
    capture_version:
      SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION,
    status: "ready",
    candidate_count: 2,
    covered_candidate_count: 2,
    complete_population_planned: true,
    visible_snapshot_tickers: [],
    research_snapshot_tickers: ["FIT", "RUN"],
    missing_snapshot_tickers: [],
    provider_requests_added: 0,
    provider_credits_added: 0,
    live_ranking_effect: false,
    publication_effect: false,
    execution_effect: false,
    quality_improvement_claimed: false,
    reason_codes: [],
  });
  expect(plan.samples.map((sample) => sample.candidate_id)).toEqual([
    "scanner_candidate:v1:scan-run-1:FIT",
    "scanner_candidate:v1:scan-run-1:RUN",
  ]);
});

test("counts a visible candidate only when the immutable decision published it", () => {
  const input = fixture();
  input.record.candidates[0]!.disposition = "published";
  input.record.final_decision = {
    disposition: "recommendations_published",
    published_tickers: ["FIT"],
    no_trade_reason: null,
    recommendation_build_path: "deterministic",
  };
  input.attribution = buildScannerIntradayLiquidityShadowAttribution({
    comparison: input.comparison,
    decisionRecord: input.record,
  });

  const plan = buildScannerIntradayLiquidityShadowEvidenceCapturePlan({
    ...input,
    decisionRecord: input.record,
    visibleTickers: ["FIT"],
    scanWindow: "midday",
  });

  expect(plan.receipt).toMatchObject({
    status: "ready",
    visible_snapshot_tickers: ["FIT"],
    research_snapshot_tickers: ["RUN"],
    complete_population_planned: true,
  });
  expect(plan.samples.map((sample) => sample.ticker)).toEqual(["RUN"]);
});

test("fails closed instead of truncating a ranked population above the cap", () => {
  const input = fixture();
  const plan = buildScannerIntradayLiquidityShadowEvidenceCapturePlan({
    ...input,
    decisionRecord: input.record,
    scanWindow: "midday",
    maxPopulationSize: 1,
  });

  expect(plan.receipt).toMatchObject({
    status: "population_cap_exceeded",
    candidate_count: 2,
    max_population_size: 1,
    covered_candidate_count: 0,
    complete_population_planned: false,
    missing_snapshot_tickers: ["FIT", "RUN"],
    reason_codes: ["shadow_evidence_population_cap_exceeded"],
  });
  expect(plan.samples).toEqual([]);
});

test("reports incomplete coverage when any point-in-time candidate is stale", () => {
  const input = fixture();
  input.candidates[1]!.stale = true;
  const plan = buildScannerIntradayLiquidityShadowEvidenceCapturePlan({
    ...input,
    decisionRecord: input.record,
    scanWindow: "midday",
  });

  expect(plan.receipt).toMatchObject({
    status: "incomplete",
    covered_candidate_count: 1,
    complete_population_planned: false,
    research_snapshot_tickers: ["FIT"],
    missing_snapshot_tickers: ["RUN"],
    reason_codes: ["candidate_point_in_time_evidence_inadmissible"],
  });
  expect(plan.samples.map((sample) => sample.ticker)).toEqual(["FIT"]);
});

test("does not plan a research snapshot for a non-research-linkable disposition", () => {
  const input = fixture();
  input.record.candidates[1]!.disposition = "not_evaluated";
  input.attribution = buildScannerIntradayLiquidityShadowAttribution({
    comparison: input.comparison,
    decisionRecord: input.record,
  });

  const plan = buildScannerIntradayLiquidityShadowEvidenceCapturePlan({
    ...input,
    decisionRecord: input.record,
    scanWindow: "midday",
  });

  expect(plan.receipt).toMatchObject({
    status: "incomplete",
    research_snapshot_tickers: ["FIT"],
    missing_snapshot_tickers: ["RUN"],
    complete_population_planned: false,
    reason_codes: ["candidate_disposition_not_research_linkable"],
  });
});
