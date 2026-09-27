import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import {
  buildScannerClockPriorShadowEvidenceReusePlan,
  scannerClockPriorShadowEvidenceReuseReceiptFromUnknown,
  SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION,
} from "@/lib/scanner-clock-prior-shadow-evidence-reuse";
import { assessScannerClockPriorShadowOutcomeAdmission } from "@/lib/scanner-clock-prior-shadow-outcome-admission";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { ScannerClockPriorShadowAttribution } from "@/lib/scanner-ranking-clock-prior-shadow-attribution";
import type { ScannerClockPriorShadowComparison } from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION,
  type ScannerIntradayLiquidityShadowEvidenceCaptureReceipt,
  type ScannerIntradayLiquidityShadowEvidenceSample,
} from "@/lib/scanner-intraday-liquidity-shadow-evidence-capture";

const decidedAt = "2026-09-28T13:45:00.000Z";
const sourceAt = "2026-09-28T13:44:00.000Z";
const candidateId = "scanner_candidate:v1:scan-run-1:AAPL";

const decisionRecord = {
  scan_run_id: "scan-run-1",
  scan_run_fingerprint: "scan-fingerprint-1",
  candidates: [
    {
      candidate_id: candidateId,
      ticker: "AAPL",
      disposition: "ranked_not_selected",
    },
  ],
} as CandidateDecisionRecord;

const comparison = {
  comparison_version: "scanner_clock_prior_shadow_comparison_v1",
  comparison_kind: "scanner_clock_prior_shadow_comparison",
  generated_at: decidedAt,
  status: "comparable",
  baseline_policy_version: "scanner_candidate_ranking_v1.2",
  shadow_policy_version: "scanner_candidate_ranking_clock_neutral_v1",
  hypothesis: "named_clock_priors_add_quality_beyond_observed_features",
  candidate_count: 1,
  candidate_tickers: ["AAPL"],
  baseline_selected_tickers: [],
  shadow_selected_tickers: [],
  selection_changed: false,
  live_ranking_effect: false,
  publication_effect: false,
  execution_effect: false,
  quality_improvement_claimed: false,
  quality_evidence_status: "not_evaluated",
  reason_codes: [],
  displacements: [
    {
      ticker: "AAPL",
      baseline_rank: 1,
      shadow_rank: 1,
      rank_change: 0,
      baseline_score: 82,
      shadow_score: 82,
      score_change: 0,
      baseline_tier: "valid",
      shadow_tier: "valid",
      baseline_selected: false,
      shadow_selected: false,
      legacy_timing_score: 50,
      baseline_signal_strength: 82,
      shadow_signal_strength: 82,
      baseline_window_fit: 50,
      shadow_window_fit: 50,
      legacy_setup_classification_bonus_removed: 0,
      legacy_clock_warning_count: 0,
      baseline_warnings_penalty: 0,
      shadow_warnings_penalty: 0,
    },
  ],
} as ScannerClockPriorShadowComparison;

const attribution = {
  attribution_version: "scanner_clock_prior_shadow_attribution_v1",
  attribution_kind: "scanner_clock_prior_shadow_attribution",
  status: "attributed",
  scan_run_id: decisionRecord.scan_run_id,
  scan_run_fingerprint: decisionRecord.scan_run_fingerprint,
  comparison_generated_at: decidedAt,
  candidate_decision_timestamp: decidedAt,
  comparison_version: comparison.comparison_version,
  baseline_policy_version: comparison.baseline_policy_version,
  shadow_policy_version: comparison.shadow_policy_version,
  candidate_count: 1,
  attributed_candidate_count: 1,
  outcome_join_basis: "candidate_decision_id",
  outcome_evidence_status: "not_evaluated",
  quality_improvement_claimed: false,
  live_ranking_effect: false,
  publication_effect: false,
  execution_effect: false,
  reason_codes: [],
  candidates: [
    {
      candidate_id: candidateId,
      ticker: "AAPL",
      candidate_decision_disposition: "ranked_not_selected",
      baseline_rank: 1,
      shadow_rank: 1,
      baseline_selected: false,
      shadow_selected: false,
    },
  ],
} satisfies ScannerClockPriorShadowAttribution;

const sample = {
  candidate_id: candidateId,
  ticker: "AAPL",
  company_name: "Apple Inc.",
  sector: "Technology",
  setup_type: "VWAP_RECLAIM",
  tier: "valid",
  score: 82,
  rank: 1,
  entry_low: 99,
  entry_high: 101,
  entry: 100,
  stop: 96,
  target: 108,
  target_2: 112,
  risk_reward: 2,
  provider_source: "twelve_data",
  market_data_source: "fresh",
  market_data_timestamp: sourceAt,
  rejection_publish_reason:
    "intraday_liquidity_shadow_full_population_research",
  sample_quality: "good",
  ranking_reason: "fixture",
  ranking_warnings: [],
  explicit_metadata_gaps: [],
} satisfies ScannerIntradayLiquidityShadowEvidenceSample;

const sharedCapture = {
  capture_version:
    SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION,
  capture_kind: "scanner_intraday_liquidity_shadow_evidence_capture",
  status: "ready",
  scan_run_id: decisionRecord.scan_run_id,
  scan_run_fingerprint: decisionRecord.scan_run_fingerprint,
  comparison_version: "scanner_intraday_liquidity_shadow_comparison_v1",
  baseline_policy_version: comparison.baseline_policy_version,
  shadow_policy_version:
    "scanner_candidate_ranking_verified_intraday_liquidity_v1",
  candidate_count: 1,
  max_population_size: 100,
  visible_snapshot_tickers: [],
  research_snapshot_tickers: ["AAPL"],
  missing_snapshot_tickers: [],
  covered_candidate_count: 1,
  complete_population_planned: true,
  provider_requests_added: 0,
  provider_credits_added: 0,
  live_ranking_effect: false,
  publication_effect: false,
  execution_effect: false,
  quality_improvement_claimed: false,
  reason_codes: [],
} satisfies ScannerIntradayLiquidityShadowEvidenceCaptureReceipt;

test("reuses the exact immutable full population without adding provider work", () => {
  const result = buildScannerClockPriorShadowEvidenceReusePlan({
    comparison,
    attribution,
    decisionRecord,
    sharedCapture,
    sharedSamples: [sample],
  });

  expect(result.receipt).toMatchObject({
    reuse_version: SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION,
    status: "ready",
    candidate_count: 1,
    research_snapshot_tickers: ["AAPL"],
    missing_snapshot_tickers: [],
    covered_candidate_count: 1,
    complete_population_reused: true,
    provider_requests_added: 0,
    provider_credits_added: 0,
    live_ranking_effect: false,
    publication_effect: false,
    execution_effect: false,
    quality_improvement_claimed: false,
  });
  expect(result.samples).toEqual([sample]);
});

test("fails closed when a shared sample is not the attributed candidate", () => {
  const result = buildScannerClockPriorShadowEvidenceReusePlan({
    comparison,
    attribution,
    decisionRecord,
    sharedCapture,
    sharedSamples: [{ ...sample, candidate_id: "other" }],
  });

  expect(result.receipt).toMatchObject({
    status: "conflicting",
    missing_snapshot_tickers: ["AAPL"],
    complete_population_reused: false,
    reason_codes: [
      "shared_candidate_identity_or_snapshot_coverage_conflicting",
    ],
  });
  expect(result.samples).toEqual([]);
});

test("rejects a ready receipt whose persisted population is duplicated or incomplete", () => {
  const receipt = buildScannerClockPriorShadowEvidenceReusePlan({
    comparison,
    attribution,
    decisionRecord,
    sharedCapture,
    sharedSamples: [sample],
  }).receipt;

  expect(scannerClockPriorShadowEvidenceReuseReceiptFromUnknown(receipt)).toEqual(
    receipt,
  );
  expect(
    scannerClockPriorShadowEvidenceReuseReceiptFromUnknown({
      ...receipt,
      research_snapshot_tickers: ["AAPL", "AAPL"],
    }),
  ).toBeNull();
  expect(
    scannerClockPriorShadowEvidenceReuseReceiptFromUnknown({
      ...receipt,
      research_snapshot_tickers: [],
    }),
  ).toBeNull();
});

function researchSnapshot(
  payloadOverrides: Record<string, unknown> = {},
): RecommendationSnapshot {
  return {
    id: "snapshot-aapl",
    snapshot_fingerprint: "snapshot-aapl-fingerprint",
    recommendation_id: null,
    scan_run_id: decisionRecord.scan_run_fingerprint,
    ticker: "AAPL",
    company_name: "Apple Inc.",
    recommended_at: decidedAt,
    app_timestamp: decidedAt,
    window: "midday",
    status: "hidden",
    source_mode: "research_only",
    data_mode: "research_only",
    market_session_phase: "regular",
    market_session_risk: "normal",
    market_session_source: "calendar",
    is_visible: false,
    is_demo: false,
    is_mock: false,
    is_real: true,
    entry: 100,
    entry_low: 99,
    entry_high: 101,
    stop: 96,
    target: 108,
    side: "long",
    risk_per_share: 4,
    reward_per_share: 8,
    planned_risk_reward: 2,
    confidence: 82,
    score: 82,
    rating: "valid",
    label: "research only",
    type: "RESEARCH_SAMPLE",
    rationale: "fixture",
    reason: "fixture",
    catalyst: "fixture",
    primary_risk: "fixture",
    market_data_snapshot: null,
    quote_price: null,
    volume: null,
    liquidity: null,
    spread: null,
    freshness: "fresh",
    data_age_minutes: 0,
    intake_quality_json: null,
    scan_observability_json: null,
    empty_state_json: null,
    quality_json: null,
    payload_json: {
      visibility_status: "research_only",
      not_live_trade_signal: true,
      visible_in_primary_recommendations: false,
      research_only: true,
      learning_scope: "research_only",
      clock_prior_shadow_evidence_sample: true,
      clock_prior_shadow_evidence_reuse_version:
        SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION,
      candidate_id: candidateId,
      candidate_decision_id: candidateId,
      candidate_decision_disposition: "ranked_not_selected",
      candidate_decision_linkage_status: "verified",
      scan_run_fingerprint: decisionRecord.scan_run_fingerprint,
      batch_fingerprint: "batch-1",
      sample_quality: "good",
      provider_source: "twelve_data",
      data_timestamp: sourceAt,
      explicit_metadata_gaps: [],
      ...payloadOverrides,
    },
    was_taken: false,
    linked_position_id: null,
    created_at: decidedAt,
    updated_at: decidedAt,
  };
}

test("admits only the exact contained clock-prior research marker", () => {
  expect(
    assessScannerClockPriorShadowOutcomeAdmission(researchSnapshot()),
  ).toMatchObject({
    status: "admitted",
    candidate_decision_id: candidateId,
    provider_requests_authorized: 0,
    live_ranking_effect: false,
    publication_effect: false,
    execution_effect: false,
    quality_improvement_claimed: false,
  });
  expect(
    assessScannerClockPriorShadowOutcomeAdmission(
      researchSnapshot({ clock_prior_shadow_evidence_reuse_version: "drift" }),
    ),
  ).toMatchObject({
    status: "rejected",
    reason_codes: ["capture_contract_mismatch"],
  });
});

test("wires exact clock-prior admission without opening generic research", () => {
  const scanRoute = readFileSync(
    resolve(process.cwd(), "app/api/automation/run-scan/route.ts"),
    "utf8",
  );
  const outcomeRoute = readFileSync(
    resolve(process.cwd(), "app/api/recommendations/evaluate-outcomes/route.ts"),
    "utf8",
  );

  expect(scanRoute).toContain("buildScannerClockPriorShadowEvidenceReusePlan");
  expect(scanRoute).toContain("scanner_clock_prior_shadow_evidence_reuse");
  expect(scanRoute).toContain("clock_prior_shadow_evidence_sample");
  expect(outcomeRoute).toContain(
    "assessScannerClockPriorShadowOutcomeAdmission",
  );
  expect(outcomeRoute).toContain("clock_prior_shadow_evidence_rejected");
  expect(outcomeRoute).toContain(
    "eligible_clock_prior_shadow_snapshot_count",
  );
  expect(outcomeRoute).not.toContain(
    "clockPriorShadowOutcomeAdmission.status !== \"not_applicable\"",
  );
});
