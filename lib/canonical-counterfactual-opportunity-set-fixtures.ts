import {
  CANONICAL_COUNTERFACTUAL_REASON_TAXONOMY_VERSION,
  CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION,
  CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION,
  buildCanonicalCounterfactualOpportunitySet,
  buildCanonicalNoTradeDecision,
  buildCanonicalRejectedCandidateDecision,
  type CanonicalCandidateMembershipInput,
  type CanonicalCounterfactualOpportunitySetInput,
} from "@/lib/canonical-counterfactual-opportunity-set";
import { buildPreTruncationCandidateCaptureEvidence } from "@/lib/pre-truncation-candidate-capture-evidence";

export const action665aVersions = {
  scanner_version: "scanner-candidate-contract-v1",
  universe_version: "stable-core-dynamic-universe-v1",
  threshold_version: "recommendation-publish-policy-v1",
  reason_taxonomy_version:
    CANONICAL_COUNTERFACTUAL_REASON_TAXONOMY_VERSION,
  engine_version: "engine-shadow-a-v1",
  scoring_version: "scoring-shadow-a-v1",
  ranking_version: "ranking-shadow-a-v1",
  setup_taxonomy_version: "setup-taxonomy-v1",
  confidence_contract_version: "confidence-contract-v1",
  evaluator_version: "canonical-outcome-evaluator-v1",
  provider_contract_version: "twelve-data-candle-contract-v1",
  git_commit: "9221aa514a6c5de76ffbe7c05cad2db41a06a928",
  build_identity: "action-665a-synthetic-fixture",
} as const;

const decisionTimestamp = "2026-07-26T12:00:00.000Z";
const providerTimestamp = "2026-07-26T11:59:00.000Z";
const scanIdentity = "scan-run-midday-001";
const producerDecisionIdentity = "scan-decision-midday-001";
const batchIdentity = "batch-midday-001";

function outcome(
  candidate: string,
  rResult: number,
  positiveOutcome: boolean,
) {
  return {
    outcome_identity: `outcome-${candidate}-60m`,
    evaluated_at: "2026-07-26T13:01:00.000Z",
    evaluator_version: action665aVersions.evaluator_version,
    provider_contract_version: action665aVersions.provider_contract_version,
    primary_horizon: "60m" as const,
    terminal_outcome: positiveOutcome
      ? ("target_before_stop" as const)
      : ("stop_before_target" as const),
    outcome_evaluable: true,
    reproducible: true,
    positive_outcome: positiveOutcome,
    r_result: rResult,
    coverage_status: "complete" as const,
    reason_codes: [],
  };
}

function candidate(input: {
  id: string;
  ticker: string;
  rank: number;
  score: number;
  status: CanonicalCandidateMembershipInput["membership_status"];
  rejectionReasons?: string[];
  decisionIdentity: string | null;
  outcomeR: number;
  positive: boolean;
}): CanonicalCandidateMembershipInput {
  return {
    candidate_identity: input.id,
    ticker: input.ticker,
    original_rank: input.rank,
    original_score: input.score,
    tie_break_key: null,
    setup: "momentum_breakout",
    context: {
      window: "midday",
      regime: "risk_on",
      sector: "technology",
      strategy: "day_trade_momentum_v1",
    },
    membership_status: input.status,
    rejection_reason_codes: input.rejectionReasons ?? [],
    threshold_version: action665aVersions.threshold_version,
    ranking_version: action665aVersions.ranking_version,
    eligibility_at_decision:
      input.status === "selected" ? "eligible" : "ineligible",
    data_gap_codes: [],
    provider_source_timestamp: providerTimestamp,
    lineage: {
      scan_identity: scanIdentity,
      batch_identity: batchIdentity,
      recommendation_decision_identity: input.decisionIdentity,
      snapshot_identity:
        input.status === "selected" ? `snapshot-${input.id}` : null,
    },
    expected_outcome_lineage: {
      lineage_version: CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION,
      lineage_namespace: "ture.counterfactual.expected_outcome",
      evaluator_contract_version: "canonical-outcome-evaluator-contract-v1",
      evaluator_version: action665aVersions.evaluator_version,
      intended_horizon_policy: "primary_60m_else_30m_else_15m_v1",
      scan_identity: scanIdentity,
      decision_identity: producerDecisionIdentity,
      candidate_identity: input.id,
      batch_identity: batchIdentity,
      recommendation_decision_identity: input.decisionIdentity,
      snapshot_identity:
        input.status === "selected" ? `snapshot-${input.id}` : null,
      expected_outcome_lineage_key: `expected-outcome-${input.id}`,
    },
    outcome: outcome(input.id, input.outcomeR, input.positive),
  };
}

const captureEvidenceResult = buildPreTruncationCandidateCaptureEvidence({
  scan_identity: scanIdentity,
  producer_decision_id: producerDecisionIdentity,
  capture_stage_identity: "scanner-full-ranking-boundary",
  capture_stage_version: "scanner-full-ranking-boundary-v1",
  candidate_identities: [
    "candidate-aapl",
    "candidate-msft",
    "candidate-nvda",
    "candidate-amd",
  ],
  capture_timestamp: decisionTimestamp,
  point_in_time_cutoff: decisionTimestamp,
  scanner_version: action665aVersions.scanner_version,
  universe_version: action665aVersions.universe_version,
  provider_contract_version: action665aVersions.provider_contract_version,
});
if (!captureEvidenceResult.ok) {
  throw new Error(captureEvidenceResult.reason_codes.join(","));
}

export const action665aCompleteRankedScanInput: CanonicalCounterfactualOpportunitySetInput =
  {
    source_namespace: "ture.scanner",
    scan_identity: scanIdentity,
    decision_identity: producerDecisionIdentity,
    decision_timestamp: decisionTimestamp,
    point_in_time_cutoff: decisionTimestamp,
    versions: action665aVersions,
    expected_candidate_count: 4,
    observed_candidate_count: 4,
    provider_context: {
      provider: "twelve_data",
      source_timestamp: providerTimestamp,
      freshness: "fresh",
      coverage_contract_version:
        CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION,
      coverage_denominator: "candidate_provider_observations",
      coverage_unit: "candidate",
      expected_observation_count: 4,
      observed_observation_count: 4,
      coverage_reason_codes: [],
    },
    pre_truncation_capture_evidence_digest:
      captureEvidenceResult.evidence.evidence_digest,
    decision_semantics: {
      decision_disposition: "publish_recommendations",
      decision_lineage_nodes: [
        {
          node_kind: "recommendation",
          decision_identity: "recommendation-aapl-001",
          candidate_identity: "candidate-aapl",
          snapshot_identity: "snapshot-candidate-aapl",
        },
        {
          node_kind: "rejection",
          decision_identity: "rejected-msft-001",
          candidate_identity: "candidate-msft",
          snapshot_identity: null,
        },
        {
          node_kind: "rejection",
          decision_identity: "rejected-nvda-001",
          candidate_identity: "candidate-nvda",
          snapshot_identity: null,
        },
        {
          node_kind: "rejection",
          decision_identity: "rejected-amd-001",
          candidate_identity: "candidate-amd",
          snapshot_identity: null,
        },
      ],
      no_trade_semantics: null,
    },
    candidates: [
      candidate({
        id: "candidate-aapl",
        ticker: "AAPL",
        rank: 1,
        score: 92,
        status: "selected",
        decisionIdentity: "recommendation-aapl-001",
        outcomeR: 1.5,
        positive: true,
      }),
      candidate({
        id: "candidate-msft",
        ticker: "MSFT",
        rank: 2,
        score: 86,
        status: "rejected",
        rejectionReasons: ["cooldown_active_position"],
        decisionIdentity: "rejected-msft-001",
        outcomeR: -1,
        positive: false,
      }),
      candidate({
        id: "candidate-nvda",
        ticker: "NVDA",
        rank: 3,
        score: 82,
        status: "overflow",
        rejectionReasons: ["selection_capacity_exceeded"],
        decisionIdentity: "rejected-nvda-001",
        outcomeR: 0.8,
        positive: true,
      }),
      candidate({
        id: "candidate-amd",
        ticker: "AMD",
        rank: 4,
        score: 58,
        status: "under_threshold",
        rejectionReasons: ["below_publish_threshold"],
        decisionIdentity: "rejected-amd-001",
        outcomeR: 0.25,
        positive: true,
      }),
    ],
  };

function builtSet(input: CanonicalCounterfactualOpportunitySetInput) {
  const result = buildCanonicalCounterfactualOpportunitySet(input);
  if (result.status !== "built") {
    throw new Error(`Fixture opportunity set failed: ${result.reason_codes.join(",")}`);
  }
  return result.opportunity_set;
}

export const action665aCompleteOpportunitySet = builtSet(
  action665aCompleteRankedScanInput,
);

export const action665aExplicitNoTradeOpportunitySetInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aExplicitNoTradeOpportunitySetInput.decision_semantics = {
  decision_disposition: "explicit_no_trade",
  decision_lineage_nodes: [
    {
      node_kind: "no_trade",
      decision_identity: producerDecisionIdentity,
      candidate_identity: null,
      snapshot_identity: null,
    },
  ],
  no_trade_semantics: {
    explicit_decision_recorded: true,
    producer_decision_id: producerDecisionIdentity,
    decision_timestamp: decisionTimestamp,
    decision_reason_code: "no_publishable_candidate",
    decision_reason_detail:
      "The explicit scanner policy rejected publication for this complete opportunity set.",
    decision_source: "scanner_policy_v1",
    ai_no_trade_observed: false,
    deterministic_fallback_used: false,
  },
};
for (const candidateInput of
  action665aExplicitNoTradeOpportunitySetInput.candidates) {
  candidateInput.lineage.recommendation_decision_identity =
    producerDecisionIdentity;
  candidateInput.lineage.snapshot_identity = null;
  candidateInput.expected_outcome_lineage.recommendation_decision_identity =
    producerDecisionIdentity;
  candidateInput.expected_outcome_lineage.snapshot_identity = null;
}

export const action665aExplicitNoTradeOpportunitySet = builtSet(
  action665aExplicitNoTradeOpportunitySetInput,
);

const noTradeResult = buildCanonicalNoTradeDecision({
  explicit_no_trade_decision: true,
  source_namespace: action665aExplicitNoTradeOpportunitySet.source_namespace,
  producer_decision_id:
    action665aExplicitNoTradeOpportunitySet.decision_identity,
  decision_timestamp:
    action665aExplicitNoTradeOpportunitySet.decision_timestamp,
  opportunity_set: action665aExplicitNoTradeOpportunitySet,
  decision_reason_code: "no_publishable_candidate",
  decision_reason_detail:
    "The explicit scanner policy rejected publication for this complete opportunity set.",
  decision_source: "scanner_policy_v1",
});
if (noTradeResult.status !== "built") {
  throw new Error(`No-trade fixture failed: ${noTradeResult.reason_codes.join(",")}`);
}
export const action665aExplicitNoTradeDecision = noTradeResult.decision;

const rejectedResult = buildCanonicalRejectedCandidateDecision({
  source_namespace: action665aCompleteOpportunitySet.source_namespace,
  producer_decision_id: "rejected-msft-001",
  decision_timestamp: action665aCompleteOpportunitySet.decision_timestamp,
  opportunity_set: action665aCompleteOpportunitySet,
  rejected_candidate_identity:
    action665aCompleteOpportunitySet.candidates[1]
      .canonical_candidate_identity,
  decision_reason_code: "cooldown_active_position",
  decision_reason_detail: "An active position existed at decision time.",
  decision_source: "deterministic_cooldown_policy_v1",
});
if (rejectedResult.status !== "built") {
  throw new Error(
    `Rejected-candidate fixture failed: ${rejectedResult.reason_codes.join(",")}`,
  );
}
export const action665aRejectedCandidateDecision = rejectedResult.decision;

export const action665aTruncatedTopKInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aTruncatedTopKInput.expected_candidate_count = 6;

export const action665aMissingRankInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aMissingRankInput.candidates[2].original_rank = null;

export const action665aDuplicateRankInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aDuplicateRankInput.candidates[2].original_rank = 2;

export const action665aExplicitTieBreakInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aExplicitTieBreakInput.candidates[1].original_rank = 2;
action665aExplicitTieBreakInput.candidates[1].tie_break_key = "rank-2:a";
action665aExplicitTieBreakInput.candidates[2].original_rank = 2;
action665aExplicitTieBreakInput.candidates[2].tie_break_key = "rank-2:b";
action665aExplicitTieBreakInput.candidates[3].original_rank = 3;

export const action665aMissingOutcomeInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aMissingOutcomeInput.candidates[2].outcome = null;

export const action665aProviderGapInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aProviderGapInput.provider_context.freshness = "gap";
action665aProviderGapInput.provider_context.observed_observation_count = 3;
action665aProviderGapInput.provider_context.coverage_reason_codes = [
  "provider_candle_gap",
];

export const action665aStaleProviderInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aStaleProviderInput.provider_context.freshness = "stale";
action665aStaleProviderInput.provider_context.coverage_reason_codes = [
  "provider_data_stale",
];

export const action665aFutureLeakInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aFutureLeakInput.candidates[1].provider_source_timestamp =
  "2026-07-26T12:00:01.000Z";

export const action665aMixedRankingVersionInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aMixedRankingVersionInput.candidates[1].ranking_version =
  "ranking-shadow-b-v1";

export const action665aReorderedInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aReorderedInput.candidates.reverse();

export const action665aSameIdentityDifferentSetInput = structuredClone(
  action665aCompleteRankedScanInput,
);
action665aSameIdentityDifferentSetInput.candidates[1].original_score = 87;
