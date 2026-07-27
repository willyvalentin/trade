import type { RecommendationBatch } from "@/lib/recommendation-batch-memory";
import type { SelectedCandidateBuildDiagnostic } from "@/lib/recommendation-build-diagnostics";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type {
  ScannerCandidateRankingResult,
  ScannerCandidateRankingSummary,
} from "@/lib/scanner-candidate-ranking";
import type {
  CompletedScannerBundleAdapterStatus,
  CompletedScannerBundleProjectionInput,
} from "@/lib/server/completed-scanner-bundle-opportunity-set-adapter";
import {
  completedScannerOutcomeEvaluationDigest,
} from "@/lib/server/completed-scanner-bundle-opportunity-set-adapter";

import {
  CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION,
  CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION,
} from "@/lib/canonical-counterfactual-opportunity-set";
import { action665aVersions } from "@/lib/canonical-counterfactual-opportunity-set-fixtures";
import { buildPreTruncationCandidateCaptureEvidence } from "@/lib/pre-truncation-candidate-capture-evidence";

const decisionTimestamp = "2026-07-26T12:00:00.000Z";
const providerTimestamp = "2026-07-26T11:59:00.000Z";
const scanIdentity = "scan-run-midday-665b-001";
const batchIdentity = "batch-midday-665b-001";
const producerDecisionId = "scan-decision-midday-665b-001";

function rankingResult(input: {
  ticker: string;
  rank: number;
  score: number;
  selected: boolean;
  tier: "strong" | "valid" | "experimental" | "rejected";
}): ScannerCandidateRankingResult {
  return {
    ticker: input.ticker,
    company_name: `${input.ticker} Fixture Inc.`,
    rank: input.rank,
    selected: input.selected,
    selection_bucket: input.selected
      ? input.tier === "rejected"
        ? "not_selected"
        : input.tier
      : "not_selected",
    rank_reason: "Synthetic deterministic ranking evidence.",
    source_contribution: "base_universe",
    score: {
      total_score: input.score,
      normalized_score: input.score,
      tier: input.tier,
      components: [],
      warnings: [],
      gaps: [],
    },
  };
}

const rankedResults = [
  rankingResult({
    ticker: "AAPL",
    rank: 1,
    score: 92,
    selected: true,
    tier: "strong",
  }),
  rankingResult({
    ticker: "MSFT",
    rank: 2,
    score: 86,
    selected: true,
    tier: "valid",
  }),
  rankingResult({
    ticker: "NVDA",
    rank: 3,
    score: 82,
    selected: false,
    tier: "valid",
  }),
  rankingResult({
    ticker: "AMD",
    rank: 4,
    score: 58,
    selected: false,
    tier: "rejected",
  }),
];

const rankingSummary: ScannerCandidateRankingSummary = {
  summary_version: "1.0",
  summary_kind: "scanner_candidate_ranking",
  generated_at: decisionTimestamp,
  scan_window: "midday",
  candidates_ranked: 4,
  selected_count: 2,
  target_min: 2,
  target_max: 2,
  target_status: "within_target",
  overflow_count: 1,
  strong_count: 1,
  valid_count: 2,
  experimental_count: 0,
  incomplete_count: 0,
  rejected_count: 1,
  average_score: 79.5,
  score_range: { min: 58, max: 92 },
  source_contribution: {
    base_universe: 4,
    dynamic_mover: 0,
    fallback: 0,
    unknown: 0,
  },
  top_ranking_reasons: ["Synthetic deterministic ranking evidence."],
  top_penalty_reasons: [],
  warnings: [],
  results: rankedResults,
  selection: {
    selected_tickers: ["AAPL", "MSFT"],
    overflow_count: 1,
    target_status: "within_target",
  },
};

const scanRun: RecommendationScanRun = {
  id: scanIdentity,
  run_fingerprint: "scan-run-fingerprint-665b-001",
  trading_date: "2026-07-26",
  window: "midday",
  status: "completed",
  source: "fixture",
  observed_at: decisionTimestamp,
  started_at: "2026-07-26T11:59:30.000Z",
  completed_at: decisionTimestamp,
  market_session_phase: "midday",
  market_session_risk: "normal",
  market_session_source: "fixture",
  data_mode: "synthetic_fixture",
  scan_observability_status: "complete",
  counts: {
    visible_recommendation_count: 1,
    accepted_count: 1,
    needs_review_count: 0,
    rejected_count: 3,
    incomplete_count: 0,
    strong_count: 1,
    valid_count: 2,
    experimental_count: 0,
    rejected_tier_count: 1,
    incomplete_tier_count: 0,
    unknown_tier_count: 0,
  },
  window_target_status: "within_target",
  gap_to_target: 0,
  overflow_above_target: 1,
  tickers_represented: ["AAPL"],
  ticker_count: 1,
  duplicate_ticker_count: 0,
  stale_candidate_count: 0,
  incomplete_data_candidate_count: 0,
  scanned_ticker_count: 4,
  raw_candidate_count: 4,
  scan_duration_ms: 30000,
  top_intake_reasons: [],
  warnings: [],
  provider_statuses: [
    {
      source_id: "twelve_data",
      label: "Twelve Data",
      status: "available",
      message: "Synthetic complete provider coverage.",
    },
  ],
  unknown_metrics: [],
  payload_json: {},
  created_at: decisionTimestamp,
  updated_at: decisionTimestamp,
};

const batch: RecommendationBatch = {
  id: batchIdentity,
  batch_fingerprint: "batch-fingerprint-665b-001",
  trading_date: "2026-07-26",
  window: "midday",
  batch_type: "official",
  status: "published",
  serving_decision: "serve",
  freshness_status: "fresh",
  published_at: decisionTimestamp,
  served_at: decisionTimestamp,
  observed_at: decisionTimestamp,
  expires_at: "2026-07-26T13:00:00.000Z",
  scan_run_id: scanIdentity,
  scan_run_fingerprint: scanRun.run_fingerprint,
  recommendation_snapshot_ids: ["snapshot-candidate-aapl"],
  recommendation_snapshot_fingerprints: ["snapshot-fingerprint-aapl"],
  recommendation_tickers: ["AAPL"],
  recommendation_count: 1,
  strong_count: 1,
  valid_count: 0,
  experimental_count: 0,
  rejected_count: 0,
  incomplete_count: 0,
  unknown_tier_count: 0,
  target_status: "below_target",
  gap_to_target: 1,
  overflow_above_target: 0,
  source_mode: "fixture",
  data_mode: "synthetic_fixture",
  market_session_phase: "midday",
  warnings: [],
  gaps: [],
  metadata_score: 100,
  payload_json: {},
  created_at: decisionTimestamp,
  updated_at: decisionTimestamp,
};

function buildDiagnostic(
  ticker: string,
  built: boolean,
  rejectionReason: SelectedCandidateBuildDiagnostic["rejection_reason"],
): SelectedCandidateBuildDiagnostic {
  return {
    ticker,
    side: "long",
    score: rankedResults.find((result) => result.ticker === ticker)?.score
      .normalized_score ?? null,
    tier: rankedResults.find((result) => result.ticker === ticker)?.score.tier ?? null,
    setup_type: "momentum_breakout",
    source: "scanner",
    reference_price_status: "fresh",
    reference_price_source: "twelve_data",
    reference_price_read_path: "fixture",
    reference_price_age_minutes: 1,
    vwap_status: "available",
    momentum_status: "available",
    volume_status: "available",
    risk_geometry_status: "valid",
    enough_data_to_build_plan: true,
    built,
    rejection_reason: rejectionReason,
    rejection_category: built ? "built" : "quality",
    explanation: built
      ? "Synthetic recommendation built."
      : "Synthetic candidate rejected by an explicit canonical policy.",
  };
}

function outcome(candidateIdentity: string, positive: boolean) {
  return {
    outcome_identity: `outcome-${candidateIdentity}-60m`,
    evaluated_at: "2026-07-26T13:01:00.000Z",
    evaluator_version: action665aVersions.evaluator_version,
    provider_contract_version: action665aVersions.provider_contract_version,
    primary_horizon: "60m" as const,
    terminal_outcome: positive
      ? ("target_before_stop" as const)
      : ("stop_before_target" as const),
    outcome_evaluable: true,
    reproducible: true,
    positive_outcome: positive,
    r_result: positive ? 1.25 : -1,
    coverage_status: "complete" as const,
    reason_codes: [],
  };
}

function candidateEvidence(input: {
  result: ScannerCandidateRankingResult;
  identity: string;
  status: "selected" | "rejected" | "overflow" | "under_threshold";
  reasonCodes: string[];
  decisionIdentity: string;
  snapshotIdentity: string | null;
  positive: boolean;
}) {
  const candidateOutcome = outcome(input.identity, input.positive);
  const expectedOutcomeLineage = {
    lineage_version: CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION,
    lineage_namespace: "ture.counterfactual.expected_outcome",
    evaluator_contract_version: "canonical-outcome-evaluator-contract-v1",
    evaluator_version: action665aVersions.evaluator_version,
    intended_horizon_policy:
      "primary_60m_else_30m_else_15m_v1" as const,
    scan_identity: scanIdentity,
    decision_identity: producerDecisionId,
    candidate_identity: input.identity,
    batch_identity: batchIdentity,
    recommendation_decision_identity: input.decisionIdentity,
    snapshot_identity: input.snapshotIdentity,
    expected_outcome_lineage_key: `expected-outcome-${input.identity}`,
  };
  const outcomeLineagePayload = {
    candidate_identity: input.identity,
    outcome_identity: candidateOutcome.outcome_identity,
    evaluator_input_identity: `evaluator-input-${input.identity}`,
    recommendation_decision_identity: input.decisionIdentity,
    snapshot_identity: input.snapshotIdentity,
  };
  return {
    candidate_identity: input.identity,
    ranking: input.result,
    tie_break_key: null,
    setup: "momentum_breakout",
    context: {
      window: "midday",
      regime: "risk_on",
      sector: "technology",
      strategy: "day_trade_momentum_v1",
    },
    membership_status: input.status,
    rejection_reason_codes: input.reasonCodes,
    raw_rejection_reason: null,
    threshold_version: action665aVersions.threshold_version,
    ranking_version: action665aVersions.ranking_version,
    eligibility_at_decision:
      input.status === "selected" ? ("eligible" as const) : ("ineligible" as const),
    data_gap_codes: [],
    provider_source_timestamp: providerTimestamp,
    batch_identity: batchIdentity,
    recommendation_decision_identity: input.decisionIdentity,
    snapshot_identity: input.snapshotIdentity,
    expected_outcome_lineage: expectedOutcomeLineage,
    outcome: candidateOutcome,
    outcome_lineage: {
      ...outcomeLineagePayload,
      evaluation_digest_algorithm: "sha256_canonical_json_v1" as const,
      evaluation_digest: completedScannerOutcomeEvaluationDigest({
        expected_outcome_lineage: expectedOutcomeLineage,
        outcome: candidateOutcome,
        outcome_lineage: outcomeLineagePayload,
      }),
    },
  };
}

const candidateEvidenceList = [
  candidateEvidence({
    result: rankedResults[0],
    identity: "candidate-aapl",
    status: "selected",
    reasonCodes: [],
    decisionIdentity: "recommendation-aapl-001",
    snapshotIdentity: "snapshot-candidate-aapl",
    positive: true,
  }),
  candidateEvidence({
    result: rankedResults[1],
    identity: "candidate-msft",
    status: "rejected",
    reasonCodes: ["cooldown_active_position"],
    decisionIdentity: "rejected-msft-001",
    snapshotIdentity: null,
    positive: false,
  }),
  candidateEvidence({
    result: rankedResults[2],
    identity: "candidate-nvda",
    status: "overflow",
    reasonCodes: ["selection_capacity_exceeded"],
    decisionIdentity: "rejected-nvda-001",
    snapshotIdentity: null,
    positive: true,
  }),
  candidateEvidence({
    result: rankedResults[3],
    identity: "candidate-amd",
    status: "under_threshold",
    reasonCodes: ["below_publish_threshold"],
    decisionIdentity: "rejected-amd-001",
    snapshotIdentity: null,
    positive: true,
  }),
];

const captureEvidenceResult = buildPreTruncationCandidateCaptureEvidence({
  scan_identity: scanIdentity,
  producer_decision_id: producerDecisionId,
  capture_stage_identity: "scanner-full-ranking-boundary",
  capture_stage_version: "scanner-full-ranking-boundary-v1",
  candidate_identities: candidateEvidenceList.map(
    (candidate) => candidate.candidate_identity,
  ),
  capture_timestamp: decisionTimestamp,
  point_in_time_cutoff: decisionTimestamp,
  scanner_version: action665aVersions.scanner_version,
  universe_version: action665aVersions.universe_version,
  provider_contract_version: action665aVersions.provider_contract_version,
});
if (!captureEvidenceResult.ok) {
  throw new Error(captureEvidenceResult.reason_codes.join(","));
}

export const action665bCompleteBundle: CompletedScannerBundleProjectionInput = {
  source_namespace: "ture.scanner",
  completion_status: "completed",
  scan_run: scanRun,
  batch,
  ranking_summary: rankingSummary,
  build_diagnostics: [
    buildDiagnostic("AAPL", true, "built"),
    buildDiagnostic("MSFT", false, "ranking_selected_but_not_qualified"),
  ],
  stable_scan_identity: scanIdentity,
  producer_decision_id: producerDecisionId,
  decision_timestamp: decisionTimestamp,
  point_in_time_cutoff: decisionTimestamp,
  full_membership_declared: true,
  expected_candidate_count: 4,
  pre_truncation_capture_evidence: captureEvidenceResult.evidence,
  versions: action665aVersions,
  provider_context: {
    provider: "twelve_data",
    source_timestamp: providerTimestamp,
    freshness: "fresh",
    coverage_contract_version: CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION,
    coverage_denominator: "candidate_provider_observations",
    coverage_unit: "candidate",
    expected_observation_count: 4,
    observed_observation_count: 4,
    coverage_reason_codes: [],
  },
  candidates: candidateEvidenceList,
  decision_lineage_nodes: candidateEvidenceList.map((candidate) => ({
    node_kind:
      candidate.membership_status === "selected"
        ? ("recommendation" as const)
        : ("rejection" as const),
    decision_identity: candidate.recommendation_decision_identity,
    candidate_identity: candidate.candidate_identity,
    snapshot_identity: candidate.snapshot_identity,
  })),
  decision_disposition: "publish_recommendations",
  no_trade_evidence: null,
  counterfactual_evaluation_requested: false,
};

function cloneCompleteBundle() {
  return structuredClone(action665bCompleteBundle);
}

export const action665bTruncatedSummaryBundle = cloneCompleteBundle();
action665bTruncatedSummaryBundle.ranking_summary!.candidates_ranked = 6;

export const action665bMissingScanIdentityBundle = cloneCompleteBundle();
action665bMissingScanIdentityBundle.stable_scan_identity = null;

export const action665bDuplicateCandidateBundle = cloneCompleteBundle();
action665bDuplicateCandidateBundle.candidates[1].candidate_identity =
  action665bDuplicateCandidateBundle.candidates[0].candidate_identity;

export const action665bRankGapBundle = cloneCompleteBundle();
action665bRankGapBundle.ranking_summary!.results[2].rank = 4;
action665bRankGapBundle.candidates[2].ranking!.rank = 4;

export const action665bTieWithoutBreakBundle = cloneCompleteBundle();
action665bTieWithoutBreakBundle.ranking_summary!.results[2].rank = 2;
action665bTieWithoutBreakBundle.ranking_summary!.results[3].rank = 3;
action665bTieWithoutBreakBundle.candidates[2].ranking!.rank = 2;
action665bTieWithoutBreakBundle.candidates[3].ranking!.rank = 3;

export const action665bTieWithBreakBundle = structuredClone(
  action665bTieWithoutBreakBundle,
);
action665bTieWithBreakBundle.candidates[1].tie_break_key = "rank-2:a";
action665bTieWithBreakBundle.candidates[2].tie_break_key = "rank-2:b";

export const action665bSelectedRejectedOverflowBundle = cloneCompleteBundle();

export const action665bUnderThresholdBundle = cloneCompleteBundle();

export const action665bFreeRejectionTextBundle = cloneCompleteBundle();
action665bFreeRejectionTextBundle.candidates[1].rejection_reason_codes = null;
action665bFreeRejectionTextBundle.candidates[1].raw_rejection_reason =
  "Skipped because there was already an active position.";

export const action665bExplicitNoTradeBundle = cloneCompleteBundle();
action665bExplicitNoTradeBundle.decision_disposition = "explicit_no_trade";
action665bExplicitNoTradeBundle.batch!.status = "no_trade_valid";
action665bExplicitNoTradeBundle.batch!.recommendation_snapshot_ids = [];
action665bExplicitNoTradeBundle.batch!.recommendation_snapshot_fingerprints = [];
action665bExplicitNoTradeBundle.batch!.recommendation_tickers = [];
action665bExplicitNoTradeBundle.batch!.recommendation_count = 0;
action665bExplicitNoTradeBundle.decision_lineage_nodes = [
  {
    node_kind: "no_trade",
    decision_identity: producerDecisionId,
    candidate_identity: null,
    snapshot_identity: null,
  },
];
for (const candidate of action665bExplicitNoTradeBundle.candidates) {
  candidate.recommendation_decision_identity = producerDecisionId;
  candidate.snapshot_identity = null;
  candidate.expected_outcome_lineage.recommendation_decision_identity =
    producerDecisionId;
  candidate.expected_outcome_lineage.snapshot_identity = null;
  if (candidate.outcome && candidate.outcome_lineage) {
    candidate.outcome_lineage.recommendation_decision_identity =
      producerDecisionId;
    candidate.outcome_lineage.snapshot_identity = null;
    const outcomeLineagePayload = {
      candidate_identity: candidate.outcome_lineage.candidate_identity,
      outcome_identity: candidate.outcome_lineage.outcome_identity,
      evaluator_input_identity:
        candidate.outcome_lineage.evaluator_input_identity,
      recommendation_decision_identity:
        candidate.outcome_lineage.recommendation_decision_identity,
      snapshot_identity: candidate.outcome_lineage.snapshot_identity,
    };
    candidate.outcome_lineage.evaluation_digest =
      completedScannerOutcomeEvaluationDigest({
        expected_outcome_lineage: candidate.expected_outcome_lineage,
        outcome: candidate.outcome,
        outcome_lineage: outcomeLineagePayload,
      });
  }
}
action665bExplicitNoTradeBundle.no_trade_evidence = {
  explicit_decision_recorded: true,
  producer_decision_id: producerDecisionId,
  decision_timestamp: decisionTimestamp,
  decision_reason_code: "no_publishable_candidate",
  decision_reason_detail:
    "Explicit deterministic scanner policy rejected publication.",
  decision_source: "scanner_policy_v1",
  ai_no_trade_observed: false,
  deterministic_fallback_used: false,
};

export const action665bAiNoTradeFallbackBundle = cloneCompleteBundle();
action665bAiNoTradeFallbackBundle.decision_disposition =
  "deterministic_fallback";
action665bAiNoTradeFallbackBundle.no_trade_evidence = null;

export const action665bContradictoryNoTradeFallbackBundle = structuredClone(
  action665bExplicitNoTradeBundle,
);
action665bContradictoryNoTradeFallbackBundle.no_trade_evidence!.ai_no_trade_observed =
  true;
action665bContradictoryNoTradeFallbackBundle.no_trade_evidence!.deterministic_fallback_used =
  true;

export const action665bProviderGapBundle = cloneCompleteBundle();
action665bProviderGapBundle.provider_context!.freshness = "gap";
action665bProviderGapBundle.provider_context!.observed_observation_count = 3;
action665bProviderGapBundle.provider_context!.coverage_reason_codes = [
  "provider_candle_gap",
];

export const action665bStaleProviderBundle = cloneCompleteBundle();
action665bStaleProviderBundle.provider_context!.freshness = "stale";
action665bStaleProviderBundle.provider_context!.coverage_reason_codes = [
  "provider_data_stale",
];

export const action665bMixedVersionsBundle = cloneCompleteBundle();
action665bMixedVersionsBundle.candidates[1].ranking_version =
  "ranking-shadow-b-v2";

export const action665bMissingOutcomeLineageBundle = cloneCompleteBundle();
action665bMissingOutcomeLineageBundle.counterfactual_evaluation_requested = true;
action665bMissingOutcomeLineageBundle.candidates[2].outcome_lineage = null;

export const action665bCounterfactualReadyBundle = cloneCompleteBundle();
action665bCounterfactualReadyBundle.counterfactual_evaluation_requested = true;

export const action665bReorderedBundle = cloneCompleteBundle();
action665bReorderedBundle.ranking_summary!.results.reverse();
action665bReorderedBundle.candidates.reverse();
action665bReorderedBundle.build_diagnostics.reverse();

export type Action665bFixtureCase = {
  name: string;
  input: CompletedScannerBundleProjectionInput;
  expected_status: CompletedScannerBundleAdapterStatus;
};

export const action665bFixtureCases: Action665bFixtureCase[] = [
  {
    name: "complete_completed_bundle",
    input: action665bCompleteBundle,
    expected_status: "mapped",
  },
  {
    name: "truncated_summary",
    input: action665bTruncatedSummaryBundle,
    expected_status: "unmappable",
  },
  {
    name: "missing_scan_identity",
    input: action665bMissingScanIdentityBundle,
    expected_status: "unmappable",
  },
  {
    name: "duplicate_candidate",
    input: action665bDuplicateCandidateBundle,
    expected_status: "conflicting",
  },
  {
    name: "rank_gap",
    input: action665bRankGapBundle,
    expected_status: "conflicting",
  },
  {
    name: "rank_tie_without_tie_break",
    input: action665bTieWithoutBreakBundle,
    expected_status: "conflicting",
  },
  {
    name: "rank_tie_with_tie_break",
    input: action665bTieWithBreakBundle,
    expected_status: "mapped",
  },
  {
    name: "selected_rejected_overflow",
    input: action665bSelectedRejectedOverflowBundle,
    expected_status: "mapped",
  },
  {
    name: "under_threshold",
    input: action665bUnderThresholdBundle,
    expected_status: "mapped",
  },
  {
    name: "free_rejection_strings",
    input: action665bFreeRejectionTextBundle,
    expected_status: "unmappable",
  },
  {
    name: "explicit_no_trade",
    input: action665bExplicitNoTradeBundle,
    expected_status: "mapped",
  },
  {
    name: "ai_no_trade_replaced_by_fallback",
    input: action665bAiNoTradeFallbackBundle,
    expected_status: "mapped",
  },
  {
    name: "contradictory_no_trade_and_fallback",
    input: action665bContradictoryNoTradeFallbackBundle,
    expected_status: "conflicting",
  },
  {
    name: "provider_gap",
    input: action665bProviderGapBundle,
    expected_status: "mapped",
  },
  {
    name: "stale_provider_data",
    input: action665bStaleProviderBundle,
    expected_status: "mapped",
  },
  {
    name: "mixed_versions",
    input: action665bMixedVersionsBundle,
    expected_status: "conflicting",
  },
  {
    name: "missing_outcome_lineage",
    input: action665bMissingOutcomeLineageBundle,
    expected_status: "unmappable",
  },
  {
    name: "full_counterfactual_ready_bundle",
    input: action665bCounterfactualReadyBundle,
    expected_status: "mapped",
  },
];
