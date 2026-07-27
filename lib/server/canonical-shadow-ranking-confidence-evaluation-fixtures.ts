import "server-only";

import {
  CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION,
  CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION,
  buildCanonicalCounterfactualOpportunitySet,
  type CanonicalCandidateMembershipInput,
  type CanonicalCounterfactualOpportunitySetContract,
  type CanonicalCounterfactualOpportunitySetInput,
} from "@/lib/canonical-counterfactual-opportunity-set";
import {
  action665aVersions,
} from "@/lib/canonical-counterfactual-opportunity-set-fixtures";
import { buildPreTruncationCandidateCaptureEvidence } from "@/lib/pre-truncation-candidate-capture-evidence";
import {
  buildCanonicalShadowEvaluationArm,
  type CanonicalShadowAlgorithmVersions,
  type CanonicalShadowCandidateObservation,
  type CanonicalShadowPairComparisonInput,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";

const tickers = [
  "AAPL",
  "MSFT",
  "NVDA",
  "AMD",
  "META",
  "GOOGL",
  "AMZN",
  "AVGO",
  "CRM",
  "ORCL",
] as const;
const outcomeR = [1.5, -1, 1.2, -1, 0.8, 0, 1.1, -1, 0.4, -1] as const;
const scores = [92, 88, 84, 80, 76, 72, 68, 64, 60, 56] as const;
const baselineConfidence = [
  0.72, 0.69, 0.66, 0.64, 0.61, 0.58, 0.55, 0.52, 0.48, 0.44,
] as const;
const candidateConfidence = [
  0.82, 0.35, 0.78, 0.31, 0.72, 0.22, 0.75, 0.28, 0.62, 0.24,
] as const;
const decisionTimestamp = "2026-07-26T12:00:00.000Z";
const providerTimestamp = "2026-07-26T11:59:00.000Z";
const scanIdentity = "scan-run-midday-001";
const decisionIdentity = "scan-decision-midday-001";
const batchIdentity = "batch-midday-001";

function membershipStatus(
  index: number,
): CanonicalCandidateMembershipInput["membership_status"] {
  if (index < 2) return "selected";
  if (index < 5) return "rejected";
  if (index < 7) return "overflow";
  return "under_threshold";
}

function rejectionReasons(
  status: CanonicalCandidateMembershipInput["membership_status"],
) {
  switch (status) {
    case "selected":
      return [];
    case "rejected":
      return ["cooldown_active_position"];
    case "overflow":
      return ["selection_capacity_exceeded"];
    case "under_threshold":
      return ["below_publish_threshold"];
  }
}

function candidate(index: number): CanonicalCandidateMembershipInput {
  const ordinal = index + 1;
  const candidateIdentity = `candidate-${String(ordinal).padStart(2, "0")}`;
  const status = membershipStatus(index);
  const selected = status === "selected";
  const recommendationIdentity = selected
    ? `recommendation-${candidateIdentity}`
    : `rejection-${candidateIdentity}`;
  const snapshotIdentity = selected ? `snapshot-${candidateIdentity}` : null;
  const rResult = outcomeR[index];
  const terminalOutcome =
    rResult > 0
      ? ("target_before_stop" as const)
      : rResult < 0
        ? ("stop_before_target" as const)
        : ("no_entry" as const);
  return {
    candidate_identity: candidateIdentity,
    ticker: tickers[index],
    original_rank: ordinal,
    original_score: scores[index],
    tie_break_key: `rank-${String(ordinal).padStart(2, "0")}:${tickers[
      index
    ].toLowerCase()}`,
    setup: "momentum_breakout",
    context: {
      window: "midday",
      regime: "risk_on",
      sector: "technology",
      strategy: "day_trade_momentum_v1",
    },
    membership_status: status,
    rejection_reason_codes: rejectionReasons(status),
    threshold_version: action665aVersions.threshold_version,
    ranking_version: action665aVersions.ranking_version,
    eligibility_at_decision: "eligible",
    data_gap_codes: [],
    provider_source_timestamp: providerTimestamp,
    lineage: {
      scan_identity: scanIdentity,
      batch_identity: batchIdentity,
      recommendation_decision_identity: recommendationIdentity,
      snapshot_identity: snapshotIdentity,
    },
    expected_outcome_lineage: {
      lineage_version: CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION,
      lineage_namespace: "ture.counterfactual.expected_outcome",
      evaluator_contract_version: "canonical-outcome-evaluator-contract-v1",
      evaluator_version: action665aVersions.evaluator_version,
      intended_horizon_policy: "primary_60m_else_30m_else_15m_v1",
      scan_identity: scanIdentity,
      decision_identity: decisionIdentity,
      candidate_identity: candidateIdentity,
      batch_identity: batchIdentity,
      recommendation_decision_identity: recommendationIdentity,
      snapshot_identity: snapshotIdentity,
      expected_outcome_lineage_key: `expected-outcome-${candidateIdentity}`,
    },
    outcome: {
      outcome_identity: `outcome-${candidateIdentity}-60m`,
      evaluated_at: "2026-07-26T13:01:00.000Z",
      evaluator_version: action665aVersions.evaluator_version,
      provider_contract_version:
        action665aVersions.provider_contract_version,
      primary_horizon: "60m",
      terminal_outcome: terminalOutcome,
      outcome_evaluable: true,
      reproducible: true,
      positive_outcome: terminalOutcome === "target_before_stop",
      r_result: rResult,
      coverage_status: "complete",
      reason_codes: [],
    },
  };
}

function buildCaptureEvidence(candidateIdentities: string[]) {
  const result = buildPreTruncationCandidateCaptureEvidence({
    scan_identity: scanIdentity,
    producer_decision_id: decisionIdentity,
    capture_stage_identity: "scanner-full-ranking-boundary",
    capture_stage_version: "scanner-full-ranking-boundary-v1",
    candidate_identities: candidateIdentities,
    capture_timestamp: decisionTimestamp,
    point_in_time_cutoff: decisionTimestamp,
    scanner_version: action665aVersions.scanner_version,
    universe_version: action665aVersions.universe_version,
    provider_contract_version:
      action665aVersions.provider_contract_version,
  });
  if (!result.ok) {
    throw new Error(result.reason_codes.join(","));
  }
  return result.evidence;
}

function completeOpportunitySetInput(): CanonicalCounterfactualOpportunitySetInput {
  const candidates = tickers.map((_, index) => candidate(index));
  const captureEvidence = buildCaptureEvidence(
    candidates.map((item) => item.candidate_identity),
  );
  return {
    source_namespace: "ture.scanner",
    scan_identity: scanIdentity,
    decision_identity: decisionIdentity,
    decision_timestamp: decisionTimestamp,
    point_in_time_cutoff: decisionTimestamp,
    versions: structuredClone(action665aVersions),
    expected_candidate_count: candidates.length,
    observed_candidate_count: candidates.length,
    provider_context: {
      provider: "twelve_data",
      source_timestamp: providerTimestamp,
      freshness: "fresh" as const,
      coverage_contract_version:
        CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION,
      coverage_denominator: "candidate_provider_observations" as const,
      coverage_unit: "candidate" as const,
      expected_observation_count: candidates.length,
      observed_observation_count: candidates.length,
      coverage_reason_codes: [],
    },
    pre_truncation_capture_evidence_digest:
      captureEvidence.evidence_digest,
    decision_semantics: {
      decision_disposition: "publish_recommendations" as const,
      decision_lineage_nodes: candidates.map((item) => ({
        node_kind:
          item.membership_status === "selected"
            ? ("recommendation" as const)
            : ("rejection" as const),
        decision_identity:
          item.lineage.recommendation_decision_identity as string,
        candidate_identity: item.candidate_identity,
        snapshot_identity: item.lineage.snapshot_identity,
      })),
      no_trade_semantics: null,
    },
    candidates,
  } satisfies CanonicalCounterfactualOpportunitySetInput;
}

function builtSet(
  input: CanonicalCounterfactualOpportunitySetInput,
): CanonicalCounterfactualOpportunitySetContract {
  const result = buildCanonicalCounterfactualOpportunitySet(input);
  if (result.status !== "built") {
    throw new Error(result.reason_codes.join(","));
  }
  return result.opportunity_set;
}

export const action666aCompleteOpportunitySetInput =
  completeOpportunitySetInput();
export const action666aCompleteOpportunitySet = builtSet(
  action666aCompleteOpportunitySetInput,
);

const baselineVersions: CanonicalShadowAlgorithmVersions = {
  engine_version: "engine-shadow-baseline-v1",
  scoring_version: "scoring-shadow-baseline-v1",
  ranking_version: "ranking-shadow-baseline-v1",
  threshold_policy_version: "threshold-shadow-baseline-v1",
  setup_taxonomy_version: action665aVersions.setup_taxonomy_version,
  confidence_contract_version: "confidence-probability-baseline-v1",
  evaluator_version: action665aVersions.evaluator_version,
  provider_contract_version: action665aVersions.provider_contract_version,
};

const candidateVersions: CanonicalShadowAlgorithmVersions = {
  engine_version: "engine-shadow-baseline-v1",
  scoring_version: "scoring-shadow-candidate-v2",
  ranking_version: "ranking-shadow-candidate-v2",
  threshold_policy_version: "threshold-shadow-candidate-v2",
  setup_taxonomy_version: action665aVersions.setup_taxonomy_version,
  confidence_contract_version: "confidence-probability-candidate-v2",
  evaluator_version: action665aVersions.evaluator_version,
  provider_contract_version: action665aVersions.provider_contract_version,
};

function observations(input: {
  set: CanonicalCounterfactualOpportunitySetContract;
  order: number[];
  confidence: readonly number[];
}): CanonicalShadowCandidateObservation[] {
  const rankByIndex = new Map(
    input.order.map((sourceIndex, position) => [sourceIndex, position + 1]),
  );
  return input.set.candidates.map((membership, index) => ({
    canonical_candidate_identity: membership.canonical_candidate_identity,
    rank: rankByIndex.get(index) as number,
    tie_break_key: `shadow:${membership.canonical_candidate_identity}`,
    score: scores[index],
    tier: index < 3 ? "high" : index < 7 ? "medium" : "low",
    evidence_strength: roundEvidence(scores[index] / 100),
    numeric_confidence: input.confidence[index],
    confidence_label:
      input.confidence[index] >= 0.7
        ? "high"
        : input.confidence[index] >= 0.5
          ? "medium"
          : "low",
    confidence_semantics: "calibrated_probability_0_1" as const,
    probability_source: "numeric_confidence" as const,
  }));
}

function roundEvidence(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function requireArm(
  input: Parameters<typeof buildCanonicalShadowEvaluationArm>[0],
) {
  const result = buildCanonicalShadowEvaluationArm(input);
  if (result.status !== "built") {
    throw new Error(result.reason_codes.join(","));
  }
  return result.arm;
}

function baselineArm(
  set = action666aCompleteOpportunitySet,
  candidateObservations: CanonicalShadowCandidateObservation[] = observations({
    set,
    order: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    confidence: baselineConfidence,
  }),
) {
  const versions = {
    ...baselineVersions,
    evaluator_version: set.versions.evaluator_version,
    provider_contract_version: set.versions.provider_contract_version,
  };
  return requireArm({
    arm: "baseline",
    opportunity_set: set,
    cohort: "shadow_recommendation_quality",
    sample_type: "shadow",
    versions,
    threshold_policy: {
      version: versions.threshold_policy_version,
      dimension: "numeric_confidence",
      thresholds: [0.5, 0.7, 0.9],
    },
    candidates: candidateObservations,
  });
}

function candidateArm(
  set = action666aCompleteOpportunitySet,
  candidateObservations: CanonicalShadowCandidateObservation[] = observations({
    set,
    order: [0, 2, 6, 4, 1, 3, 8, 5, 7, 9],
    confidence: candidateConfidence,
  }),
) {
  const versions = {
    ...candidateVersions,
    evaluator_version: set.versions.evaluator_version,
    provider_contract_version: set.versions.provider_contract_version,
  };
  return requireArm({
    arm: "candidate",
    opportunity_set: set,
    cohort: "shadow_recommendation_quality",
    sample_type: "shadow",
    versions,
    threshold_policy: {
      version: versions.threshold_policy_version,
      dimension: "numeric_confidence",
      thresholds: [0.5, 0.7, 0.9],
    },
    candidates: candidateObservations,
  });
}

function pair(
  baseline = baselineArm(),
  candidate = candidateArm(),
): CanonicalShadowPairComparisonInput {
  return {
    baseline,
    candidate,
    declared_version_differences: [
      "ranking_version",
      "scoring_version",
      "threshold_policy_version",
      "confidence_contract_version",
    ],
    engine_change_intended: false,
    bootstrap_seed: "action-666a-shadow-pair-seed-v1",
  };
}

export const action666aValidPair = pair();

export const action666aMembershipDriftPair = structuredClone(
  action666aValidPair,
);
action666aMembershipDriftPair.candidate.candidates.pop();

export const action666aTruncatedBaselinePair = structuredClone(
  action666aValidPair,
);
action666aTruncatedBaselinePair.baseline.candidates.splice(7);

export const action666aDuplicateRankTieBreakPair = structuredClone(
  action666aValidPair,
);
action666aDuplicateRankTieBreakPair.candidate.candidates[1].rank =
  action666aDuplicateRankTieBreakPair.candidate.candidates[0].rank;
action666aDuplicateRankTieBreakPair.candidate.candidates[1].tie_break_key =
  action666aDuplicateRankTieBreakPair.candidate.candidates[0].tie_break_key;

const cutoffDriftInput = completeOpportunitySetInput();
cutoffDriftInput.point_in_time_cutoff = "2026-07-26T11:59:30.000Z";
const cutoffDriftSet = builtSet(cutoffDriftInput);
export const action666aCutoffDriftPair = pair(
  baselineArm(),
  candidateArm(cutoffDriftSet),
);

const evaluatorProviderDriftInput = completeOpportunitySetInput();
evaluatorProviderDriftInput.versions.evaluator_version =
  "canonical-outcome-evaluator-v2";
evaluatorProviderDriftInput.versions.provider_contract_version =
  "alternate-provider-contract-v2";
evaluatorProviderDriftInput.provider_context.provider = "alternate_provider";
for (const item of evaluatorProviderDriftInput.candidates) {
  item.expected_outcome_lineage.evaluator_contract_version =
    "canonical-outcome-evaluator-contract-v2";
  item.expected_outcome_lineage.evaluator_version =
    "canonical-outcome-evaluator-v2";
  if (item.outcome) {
    item.outcome.evaluator_version = "canonical-outcome-evaluator-v2";
    item.outcome.provider_contract_version =
      "alternate-provider-contract-v2";
  }
}
const evaluatorProviderDriftSet = builtSet(evaluatorProviderDriftInput);
export const action666aEvaluatorProviderDriftPair = pair(
  baselineArm(),
  candidateArm(evaluatorProviderDriftSet),
);

const missingOutcomeInput = completeOpportunitySetInput();
missingOutcomeInput.candidates[4].outcome = null;
const missingOutcomeSet = builtSet(missingOutcomeInput);
export const action666aMissingRejectedOutcomePair = pair(
  baselineArm(missingOutcomeSet),
  candidateArm(missingOutcomeSet),
);

const nonReproducibleInput = completeOpportunitySetInput();
if (!nonReproducibleInput.candidates[2].outcome) {
  throw new Error("Synthetic reproducible outcome required.");
}
nonReproducibleInput.candidates[2].outcome.reproducible = false;
const nonReproducibleSet = builtSet(nonReproducibleInput);
export const action666aNonReproduciblePair = pair(
  baselineArm(nonReproducibleSet),
  candidateArm(nonReproducibleSet),
);

function explicitNoTradeInput() {
  const input = completeOpportunitySetInput();
  input.decision_semantics = {
    decision_disposition: "explicit_no_trade",
    decision_lineage_nodes: [
      {
        node_kind: "no_trade",
        decision_identity: input.decision_identity,
        candidate_identity: null,
        snapshot_identity: null,
      },
    ],
    no_trade_semantics: {
      explicit_decision_recorded: true,
      producer_decision_id: input.decision_identity,
      decision_timestamp: input.decision_timestamp,
      decision_reason_code: "no_publishable_candidate",
      decision_reason_detail: null,
      decision_source: "scanner_policy_v1",
      ai_no_trade_observed: false,
      deterministic_fallback_used: false,
    },
  };
  for (const item of input.candidates) {
    item.lineage.recommendation_decision_identity =
      input.decision_identity;
    item.lineage.snapshot_identity = null;
    item.expected_outcome_lineage.recommendation_decision_identity =
      input.decision_identity;
    item.expected_outcome_lineage.snapshot_identity = null;
  }
  return input;
}

const incompleteNoTradeInput = explicitNoTradeInput();
incompleteNoTradeInput.candidates[3].outcome = null;
const incompleteNoTradeSet = builtSet(incompleteNoTradeInput);
function noTradeArm(
  arm: "baseline" | "candidate",
  versions: CanonicalShadowAlgorithmVersions,
) {
  return requireArm({
    arm,
    opportunity_set: incompleteNoTradeSet,
    cohort: "no_trade_counterfactual",
    sample_type: "no_trade",
    versions,
    threshold_policy: {
      version: versions.threshold_policy_version,
      dimension: "score",
      thresholds: [95],
    },
    candidates: observations({
      set: incompleteNoTradeSet,
      order: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      confidence:
        arm === "baseline" ? baselineConfidence : candidateConfidence,
    }),
  });
}
export const action666aIncompleteNoTradePair = pair(
  noTradeArm("baseline", baselineVersions),
  noTradeArm("candidate", candidateVersions),
);

const scoreAsProbabilityBaseline = structuredClone(
  action666aValidPair.baseline,
);
for (const item of scoreAsProbabilityBaseline.candidates) {
  item.numeric_confidence = null;
  item.confidence_semantics = "calibrated_probability_0_1";
  item.probability_source = "score";
}
export const action666aScoreAsProbabilityPair = pair(
  scoreAsProbabilityBaseline,
  action666aValidPair.candidate,
);

export const action666aReorderedPair = pair(
  baselineArm(
    action666aCompleteOpportunitySet,
    [...action666aValidPair.baseline.candidates].reverse(),
  ),
  candidateArm(
    action666aCompleteOpportunitySet,
    [...action666aValidPair.candidate.candidates].reverse(),
  ),
);

export const action666aTamperedPair = structuredClone(action666aValidPair);
action666aTamperedPair.candidate.opportunity_set.semantic_digest =
  "0".repeat(64);

export type Action666aFixtureCase = {
  name: string;
  input: CanonicalShadowPairComparisonInput;
  expected_status:
    | "evaluable"
    | "probability_semantics_missing"
    | "insufficient_evidence"
    | "not_comparable"
    | "conflicting"
    | "non_reproducible";
};

export const action666aFixtureCases: Action666aFixtureCase[] = [
  {
    name: "valid_same_complete_opportunity_set",
    input: action666aValidPair,
    expected_status: "evaluable",
  },
  {
    name: "candidate_membership_drift",
    input: action666aMembershipDriftPair,
    expected_status: "not_comparable",
  },
  {
    name: "different_point_in_time_cutoff",
    input: action666aCutoffDriftPair,
    expected_status: "not_comparable",
  },
  {
    name: "different_evaluator_and_provider",
    input: action666aEvaluatorProviderDriftPair,
    expected_status: "not_comparable",
  },
  {
    name: "truncated_baseline",
    input: action666aTruncatedBaselinePair,
    expected_status: "not_comparable",
  },
  {
    name: "duplicate_rank_and_tie_break",
    input: action666aDuplicateRankTieBreakPair,
    expected_status: "conflicting",
  },
  {
    name: "missing_rejected_candidate_outcome",
    input: action666aMissingRejectedOutcomePair,
    expected_status: "insufficient_evidence",
  },
  {
    name: "no_trade_without_complete_counterfactual_set",
    input: action666aIncompleteNoTradePair,
    expected_status: "insufficient_evidence",
  },
  {
    name: "non_reproducible_candidate_outcome",
    input: action666aNonReproduciblePair,
    expected_status: "non_reproducible",
  },
  {
    name: "score_presented_as_probability",
    input: action666aScoreAsProbabilityPair,
    expected_status: "probability_semantics_missing",
  },
  {
    name: "valid_probability_calibration",
    input: action666aValidPair,
    expected_status: "evaluable",
  },
  {
    name: "threshold_sweep_without_live_effect",
    input: action666aValidPair,
    expected_status: "evaluable",
  },
  {
    name: "input_order_determinism",
    input: action666aReorderedPair,
    expected_status: "evaluable",
  },
  {
    name: "semantic_tampering",
    input: action666aTamperedPair,
    expected_status: "conflicting",
  },
  {
    name: "input_immutability",
    input: action666aValidPair,
    expected_status: "evaluable",
  },
];
