import "server-only";

import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import {
  CANONICAL_COUNTERFACTUAL_REASON_TAXONOMY_VERSION,
  CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION,
  CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION,
  buildCanonicalCounterfactualOpportunitySet,
  type CanonicalCandidateMembershipInput,
  type CanonicalCandidateOutcome,
} from "@/lib/canonical-counterfactual-opportunity-set";
import { canonicalQualityRankingKValues } from "@/lib/canonical-quality-metrics";
import {
  CANONICAL_EVALUATION_PROJECTION_CONTRACT_VERSION,
  canonicalMarketRegimeFromPayload,
  projectRecommendationOutcomeBundle,
} from "@/lib/canonical-evaluation-projection-adapters";
import type { LearningBaselineScanRun } from "@/lib/recommendation-learning-baseline-readiness";
import {
  marketRegimeDecisionContextFromPayload,
  marketRegimeValueFromPayload,
  type MarketRegimeDecisionContext,
} from "@/lib/market-regime-decision-context";
import { hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor } from "@/lib/recommendation-outcome-canonical-coverage";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { recommendationDecisionSourceProvenanceFromSnapshot } from "@/lib/recommendation-decision-source-provenance";
import { recommendationDecisionRangeFeature, type RecommendationDecisionFeatureVector } from "@/lib/recommendation-decision-feature-vector";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import {
  applyScannerScoreProbabilityCalibration,
  SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION,
  type ScannerScoreProbabilityCalibrationModel,
} from "@/lib/scanner-score-probability-calibration";
import {
  normalizeSetupType,
  SETUP_TYPES,
  type SetupType,
} from "@/lib/setup-types";
import { buildPreTruncationCandidateCaptureEvidence } from "@/lib/pre-truncation-candidate-capture-evidence";
import {
  scannerIntradayLiquidityShadowAttributionFromUnknown,
} from "@/lib/scanner-ranking-intraday-liquidity-shadow-attribution";
import {
  scannerIntradayLiquidityShadowComparisonFromUnknown,
} from "@/lib/scanner-ranking-intraday-liquidity-shadow";
import {
  buildCanonicalShadowEvaluationArm,
  evaluateCanonicalShadowRankingConfidencePair,
  type CanonicalShadowCandidateObservation,
  type CanonicalShadowEvaluationResult,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";

export const SCANNER_INTRADAY_LIQUIDITY_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION =
  "scanner_intraday_liquidity_shadow_canonical_evaluation_adapter_v1" as const;
export const SCANNER_RANKING_SHADOW_DIAGNOSTIC_THRESHOLD_POLICY_VERSION =
  "shadow_rank_only_diagnostic_threshold_v1" as const;
export const SCANNER_RANKING_SHADOW_CANDIDATE_PERFORMANCE_AT_K_VERSION =
  "scanner_ranking_shadow_candidate_performance_at_k_v1" as const;
export const SCANNER_RANKING_SHADOW_CONCENTRATION_INPUT_VERSION =
  "scanner_ranking_shadow_concentration_input_v1" as const;
export const SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_INPUT_VERSION =
  "scanner_ranking_shadow_probability_calibration_input_v1" as const;
export const SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_OBSERVATION_VERSION =
  "scanner_ranking_shadow_probability_calibration_observation_v1" as const;
export const SCANNER_RANKING_SHADOW_FEASIBILITY_OBSERVATION_VERSION =
  "scanner_ranking_shadow_feasibility_observation_v1" as const;
export const SCANNER_RANKING_SHADOW_QUALITY_SLICE_OBSERVATION_VERSION =
  "scanner_ranking_shadow_quality_slice_observation_v1" as const;

type ScannerRankingShadowCandidatePerformanceAtK = Record<string, {
  expectancy_r: {
    value: number | null;
    numerator: number;
    denominator: number;
    identity_count: number;
  };
}>;

export type ScannerRankingShadowCandidateAttribution = {
  candidate_id: string;
  ticker: string;
  candidate_decision_disposition: string;
  baseline_rank: number;
  shadow_rank: number;
  baseline_selected: boolean;
  shadow_selected: boolean;
};

export type ScannerRankingShadowConcentrationInput = {
  candidate_id: string;
  ticker: string;
  sector: string;
  setup: SetupType;
  regime: string;
};

export type ScannerRankingShadowProbabilityCalibrationInput = {
  candidate_id: string;
  ticker: string;
  decision_at: string;
  outcome_evaluated_at: string;
  baseline_score: number;
  candidate_score: number;
  terminal_outcome: "target_before_stop" | "stop_before_target";
};

export type ScannerRankingShadowProbabilityCalibrationObservation = {
  candidate_id: string;
  ticker: string;
  decision_at: string;
  terminal_binary: 0 | 1 | null;
  baseline_probability: number | null;
  candidate_probability: number | null;
};

export type ScannerRankingShadowFeasibilityObservation = {
  candidate_id: string;
  ticker: string;
  decision_at: string;
  decision_feature_vector_version:
    RecommendationDecisionFeatureVector["contract_version"];
  liquidity: {
    intraday_recent_volume_ratio: number | null;
    intraday_latest_volume: number | null;
    intraday_average_volume: number | null;
  };
  volatility: {
    intraday_average_range_percent?: number | null;
    daily_average_range_percent?: number | null;
    intraday_latest_range_percent: number | null;
    intraday_range_expansion_ratio: number | null;
    intraday_recent_range_percent: number | null;
  };
  trigger_attainment: boolean | null;
  unavailable_disclosed: {
    spread: true;
    halt_risk: true;
    conservative_slippage: true;
  };
};

export type ScannerRankingShadowQualitySliceObservation = {
  candidate_id: string;
  ticker: string;
  sector: string;
  setup: SetupType;
  regime: string;
  decision_at: string;
  baseline_rank: number;
  candidate_rank: number;
  positive_outcome: boolean | null;
  terminal_outcome: CanonicalCandidateOutcome["terminal_outcome"];
  r_result: number | null;
};

export type ScannerRankingShadowAttribution = {
  status: "attributed" | "conflicting";
  scan_run_id: string;
  scan_run_fingerprint: string;
  comparison_generated_at: string;
  candidate_decision_timestamp: string;
  comparison_version: string;
  baseline_policy_version: string;
  shadow_policy_version: string;
  candidate_count: number;
  candidates: ScannerRankingShadowCandidateAttribution[];
};

export type ScannerRankingShadowDisplacement = {
  ticker: string;
  baseline_rank: number;
  shadow_rank: number;
  baseline_score: number;
  shadow_score: number;
  baseline_tier: string;
  shadow_tier: string;
  baseline_selected: boolean;
  shadow_selected: boolean;
};

export type ScannerRankingShadowComparison = {
  status: "comparable" | "conflicting";
  comparison_version: string;
  generated_at: string;
  baseline_policy_version: string;
  shadow_policy_version: string;
  candidate_count: number;
  displacements: ScannerRankingShadowDisplacement[];
};

export type ScannerRankingShadowCanonicalEvaluationResult<
  AdapterVersion extends string = string,
> = {
  adapter_version: AdapterVersion;
  status:
    | CanonicalShadowEvaluationResult["status"]
    | "insufficient_evidence"
    | "conflicting";
  evaluation: CanonicalShadowEvaluationResult["evaluation"];
  coverage: {
    expected_candidate_count: number;
    exact_snapshot_count: number;
    canonical_primary_outcome_count: number;
  };
  reason_codes: string[];
  comparison_identity: string | null;
  candidate_performance_at_k_version:
    typeof SCANNER_RANKING_SHADOW_CANDIDATE_PERFORMANCE_AT_K_VERSION;
  candidate_performance_at_k:
    ScannerRankingShadowCandidatePerformanceAtK | null;
  concentration_input_version:
    typeof SCANNER_RANKING_SHADOW_CONCENTRATION_INPUT_VERSION;
  concentration_inputs: ScannerRankingShadowConcentrationInput[] | null;
  probability_calibration_model_version:
    | typeof SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION
    | null;
  probability_calibration_model_fingerprint: string | null;
  probability_calibration_input_version:
    typeof SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_INPUT_VERSION;
  probability_calibration_inputs:
    ScannerRankingShadowProbabilityCalibrationInput[] | null;
  probability_calibration_observation_version:
    typeof SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_OBSERVATION_VERSION;
  probability_calibration_observations:
    ScannerRankingShadowProbabilityCalibrationObservation[] | null;
  feasibility_observation_version:
    typeof SCANNER_RANKING_SHADOW_FEASIBILITY_OBSERVATION_VERSION;
  feasibility_observations: ScannerRankingShadowFeasibilityObservation[] | null;
  quality_slice_observation_version:
    typeof SCANNER_RANKING_SHADOW_QUALITY_SLICE_OBSERVATION_VERSION;
  quality_slice_observations:
    ScannerRankingShadowQualitySliceObservation[] | null;
  threshold_policy_semantics: "diagnostic_all_candidates_only";
  shadow_only: true;
  live_ranking_effect: false;
  publication_effect: false;
  causal_improvement_claimed: false;
};

export type ScannerIntradayLiquidityShadowCanonicalEvaluationResult =
  ScannerRankingShadowCanonicalEvaluationResult<
    typeof SCANNER_INTRADAY_LIQUIDITY_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION
  >;

type CandidateEvidence = {
  attribution: ScannerRankingShadowCandidateAttribution;
  displacement: ScannerRankingShadowDisplacement;
  decision: NonNullable<
    ReturnType<typeof candidateDecisionRecordFromScanRun>
  >["candidates"][number];
  snapshot: RecommendationSnapshot;
  outcome: RecommendationOutcome;
  canonical_outcome: CanonicalCandidateOutcome;
  market_regime: string;
  sector: string;
  setup_type: SetupType;
  decision_at: string;
  decision_feature_vector: RecommendationDecisionFeatureVector;
};

const supportedDecisionMarketRegimes = new Set([
  "risk_on",
  "neutral",
  "risk_off",
]);

const safety = {
  threshold_policy_semantics: "diagnostic_all_candidates_only" as const,
  shadow_only: true as const,
  live_ranking_effect: false as const,
  publication_effect: false as const,
  causal_improvement_claimed: false as const,
};

function uniqueSorted(values: Iterable<string>) {
  return Array.from(new Set(values)).sort();
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizedTicker(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function setupTypeFromSnapshot(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;
  const recommendation = payload.recommendation &&
      typeof payload.recommendation === "object" &&
      !Array.isArray(payload.recommendation)
    ? payload.recommendation as Record<string, unknown>
    : null;
  const raw = payload.setup_type ?? recommendation?.setup_type ??
    (snapshot.source_mode === "research_only" ? null : snapshot.type);
  const explicit = textOrNull(raw);
  if (!explicit) return null;
  const normalized = normalizeSetupType(explicit);
  return SETUP_TYPES.includes(normalized) &&
      (normalized !== "UNKNOWN" || explicit.trim().toUpperCase() === "UNKNOWN")
    ? normalized
    : null;
}

function round(value: number) {
  return Number(value.toFixed(12));
}

function candidatePerformanceAtK(
  evidence: CandidateEvidence[],
): ScannerRankingShadowCandidatePerformanceAtK {
  const ordered = [...evidence].sort(
    (left, right) =>
      left.attribution.shadow_rank - right.attribution.shadow_rank ||
      left.attribution.ticker.localeCompare(right.attribution.ticker),
  );
  return Object.fromEntries(
    canonicalQualityRankingKValues.map((k) => {
      const selected = ordered.slice(0, k);
      const values = selected.flatMap((item) =>
        typeof item.canonical_outcome.r_result === "number" &&
          Number.isFinite(item.canonical_outcome.r_result)
          ? [item.canonical_outcome.r_result]
          : []
      );
      const numerator = round(
        values.reduce((sum, value) => sum + value, 0),
      );
      return [String(k), {
        expectancy_r: {
          value: values.length > 0 ? round(numerator / values.length) : null,
          numerator,
          denominator: values.length,
          identity_count: selected.length,
        },
      }];
    }),
  );
}

function exactSnapshotForCandidate(input: {
  candidate: ScannerRankingShadowCandidateAttribution;
  scanRunFingerprint: string;
  snapshots: RecommendationSnapshot[];
}) {
  const matches = input.snapshots.filter((snapshot) => {
    const payload = snapshot.payload_json;
    return (
      snapshot.scan_run_id === input.scanRunFingerprint &&
      normalizedTicker(snapshot.ticker) === input.candidate.ticker &&
      textOrNull(payload.candidate_id) === input.candidate.candidate_id &&
      textOrNull(payload.candidate_decision_id) ===
        input.candidate.candidate_id &&
      payload.candidate_decision_disposition ===
        input.candidate.candidate_decision_disposition &&
      payload.candidate_decision_linkage_status === "verified" &&
      textOrNull(payload.candidate_decision_linkage_version) !== null
    );
  });
  return matches.length === 1 ? matches[0] : null;
}

function terminalOutcome(
  outcome: RecommendationOutcome,
): CanonicalCandidateOutcome["terminal_outcome"] | null {
  if (outcome.entry_triggered === false) return "no_entry";
  if (
    outcome.status === "target_before_stop" ||
    outcome.first_terminal_event === "target_hit"
  ) {
    return "target_before_stop";
  }
  if (
    outcome.status === "stop_before_target" ||
    outcome.first_terminal_event === "stop_hit"
  ) {
    return "stop_before_target";
  }
  if (
    outcome.entry_triggered === true &&
    outcome.target_hit === true &&
    outcome.stop_hit === true &&
    outcome.first_terminal_event === "unknown"
  ) {
    return "ambiguous_same_candle";
  }
  if (
    outcome.status === "neither_hit" ||
    outcome.first_terminal_event === "neither"
  ) {
    return "neither";
  }
  return null;
}

function canonicalOutcome(input: {
  outcome: RecommendationOutcome;
  evaluatorVersion: string;
  providerContractVersion: string;
}): CanonicalCandidateOutcome | null {
  const terminal = terminalOutcome(input.outcome);
  const risk =
    input.outcome.entry !== null && input.outcome.stop !== null
      ? Math.abs(input.outcome.entry - input.outcome.stop)
      : null;
  const targetR =
    risk !== null && risk > 0 && input.outcome.target !== null &&
    input.outcome.entry !== null
      ? Math.abs(input.outcome.target - input.outcome.entry) / risk
      : null;
  const rResult =
    terminal === "no_entry"
      ? 0
      : terminal === "target_before_stop"
        ? targetR
        : terminal === "stop_before_target"
          ? -1
          : input.outcome.current_r ?? input.outcome.eod_r;
  if (
    !terminal ||
    (rResult !== null && !Number.isFinite(rResult)) ||
    (terminal === "target_before_stop" && rResult === null) ||
    (input.outcome.horizon !== "15m" &&
      input.outcome.horizon !== "30m" &&
      input.outcome.horizon !== "60m")
  ) {
    return null;
  }
  return {
    outcome_identity: input.outcome.id,
    evaluated_at: input.outcome.evaluated_at,
    evaluator_version: input.evaluatorVersion,
    provider_contract_version: input.providerContractVersion,
    primary_horizon: input.outcome.horizon,
    terminal_outcome: terminal,
    outcome_evaluable: true,
    reproducible: true,
    positive_outcome: terminal === "target_before_stop" || (rResult ?? 0) > 0,
    r_result: rResult,
    coverage_status: "complete",
    reason_codes: [],
  };
}

function evidenceForCandidate(input: {
  candidate: ScannerRankingShadowCandidateAttribution;
  displacement: ScannerRankingShadowDisplacement;
  decision: CandidateEvidence["decision"];
  scanRunFingerprint: string;
  decisionTimestamp: string;
  evaluatorVersion: string;
  providerContractVersion: string;
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  expectedMarketRegimeContext: MarketRegimeDecisionContext;
}): { evidence: CandidateEvidence | null; reason_codes: string[] } {
  const snapshot = exactSnapshotForCandidate({
    candidate: input.candidate,
    scanRunFingerprint: input.scanRunFingerprint,
    snapshots: input.snapshots,
  });
  if (!snapshot) {
    return { evidence: null, reason_codes: ["candidate_snapshot_not_exactly_one"] };
  }
  const sourceProvenance = recommendationDecisionSourceProvenanceFromSnapshot(
    snapshot,
  );
  if (
    sourceProvenance.status !== "admissible" ||
    !sourceProvenance.decision_feature_vector
  ) {
    return { evidence: null, reason_codes: ["candidate_source_provenance_incomplete"] };
  }
  const linked = input.outcomes.filter(
    (outcome) =>
      outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint &&
      (outcome.snapshot_id === null || outcome.snapshot_id === snapshot.id) &&
      (outcome.recommendation_id === null ||
        snapshot.recommendation_id === null ||
        outcome.recommendation_id === snapshot.recommendation_id),
  );
  const relationConflict = input.outcomes.some(
    (outcome) =>
      outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint &&
      ((outcome.snapshot_id !== null && outcome.snapshot_id !== snapshot.id) ||
        (outcome.recommendation_id !== null &&
          snapshot.recommendation_id !== null &&
          outcome.recommendation_id !== snapshot.recommendation_id)),
  );
  if (
    relationConflict ||
    linked.some(
      (outcome) => Date.parse(outcome.evaluated_at) < Date.parse(input.decisionTimestamp),
    )
  ) {
    return { evidence: null, reason_codes: ["candidate_outcome_lineage_conflicting"] };
  }
  const projected = projectRecommendationOutcomeBundle({
    snapshot,
    outcomes: linked,
    metadata: {
      producer_decision_id: input.candidate.candidate_id,
      decision_timestamp: input.decisionTimestamp,
      sample_type: snapshot.is_visible ? "visible" : "research_only",
      numeric_confidence: null,
      confidence_label: null,
      candidate_id: input.candidate.candidate_id,
      scan_run_fingerprint: input.scanRunFingerprint,
      snapshot_id: snapshot.id,
      snapshot_fingerprint: snapshot.snapshot_fingerprint,
      recommendation_id: snapshot.recommendation_id,
    },
  });
  const selected = projected.projection.primary_outcome;
  const snapshotMarketRegime = projected.projection.context.regime;
  const snapshotMarketRegimeContext = marketRegimeDecisionContextFromPayload(
    snapshot.payload_json,
  );
  const snapshotMarketRegimeValue = marketRegimeValueFromPayload(
    snapshot.payload_json,
  );
  if (!snapshotMarketRegime || !snapshotMarketRegimeContext) {
    return {
      evidence: null,
      reason_codes: ["candidate_market_regime_context_missing"],
    };
  }
  const sector = textOrNull(input.decision.sector);
  const setupType = setupTypeFromSnapshot(snapshot);
  if (!sector || !setupType) {
    return {
      evidence: null,
      reason_codes: ["candidate_concentration_dimensions_missing"],
    };
  }
  if (
    snapshotMarketRegimeValue !== snapshotMarketRegimeContext.regime ||
    snapshotMarketRegime !== input.expectedMarketRegimeContext.regime ||
    JSON.stringify(snapshotMarketRegimeContext) !==
      JSON.stringify(input.expectedMarketRegimeContext)
  ) {
    return {
      evidence: null,
      reason_codes: ["candidate_market_regime_context_conflicting"],
    };
  }
  const outcome =
    selected?.status === "selected"
      ? linked.find((item) => item.id === selected.primary_outcome?.outcome.id) ?? null
      : null;
  const evaluationAnchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot);
  if (
    projected.status === "conflicting" ||
    selected?.status !== "selected" ||
    !outcome ||
    !hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor(
      outcome.payload_json.canonical_provider_coverage,
      evaluationAnchor,
    )
  ) {
    return { evidence: null, reason_codes: ["candidate_primary_outcome_incomplete"] };
  }
  const canonical = canonicalOutcome({
    outcome,
    evaluatorVersion: input.evaluatorVersion,
    providerContractVersion: input.providerContractVersion,
  });
  if (!canonical) {
    return { evidence: null, reason_codes: ["candidate_terminal_outcome_unmappable"] };
  }
  return {
    evidence: {
      attribution: input.candidate,
      displacement: input.displacement,
      decision: input.decision,
      snapshot,
      outcome,
      canonical_outcome: canonical,
      market_regime: snapshotMarketRegime,
      sector,
      setup_type: setupType,
      decision_at: input.decisionTimestamp,
      decision_feature_vector: sourceProvenance.decision_feature_vector,
    },
    reason_codes: [],
  };
}

function membership(input: {
  evidence: CandidateEvidence;
  scanIdentity: string;
  decisionIdentity: string;
  window: string;
  thresholdVersion: string;
  rankingVersion: string;
  evaluatorVersion: string;
  sourceNamespace: string;
  noTrade: boolean;
}): CanonicalCandidateMembershipInput {
  const selected = input.evidence.attribution.baseline_selected;
  const belowThreshold = input.evidence.decision.reason_codes.includes(
    "ranking_not_selected",
  );
  const membershipStatus = selected
    ? "selected"
    : belowThreshold
      ? "under_threshold"
      : "overflow";
  const recommendationDecisionIdentity = input.noTrade
    ? input.decisionIdentity
    : input.evidence.attribution.candidate_id;
  // The canonical explicit-no-trade graph has one decision node and therefore
  // keeps candidate snapshot identities null. The adapter has already proven
  // the exact research snapshot relation, and binds that immutable identity in
  // the expected lineage key below without reclassifying it as a published
  // recommendation.
  const snapshotIdentity = input.noTrade ? null : input.evidence.snapshot.id;
  return {
    candidate_identity: input.evidence.attribution.candidate_id,
    ticker: input.evidence.attribution.ticker,
    original_rank: input.evidence.attribution.baseline_rank,
    original_score: input.evidence.displacement.baseline_score,
    tie_break_key:
      input.evidence.decision.ranking?.tie_break_key ??
      input.evidence.attribution.ticker,
    setup: input.evidence.setup_type,
    context: {
      window: input.window,
      regime: input.evidence.market_regime,
      sector: input.evidence.decision.sector,
      strategy: null,
    },
    membership_status: membershipStatus,
    rejection_reason_codes: selected
      ? []
      : belowThreshold
        ? ["below_publish_threshold"]
        : ["selection_capacity_exceeded"],
    threshold_version: input.thresholdVersion,
    ranking_version: input.rankingVersion,
    eligibility_at_decision: input.evidence.decision.eligibility,
    data_gap_codes: input.evidence.decision.data.gap_codes,
    provider_source_timestamp:
      input.evidence.decision.data.source_timestamp as string,
    lineage: {
      scan_identity: input.scanIdentity,
      batch_identity: textOrNull(
        input.evidence.snapshot.payload_json.batch_fingerprint,
      ),
      recommendation_decision_identity: recommendationDecisionIdentity,
      snapshot_identity: snapshotIdentity,
    },
    expected_outcome_lineage: {
      lineage_version: CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION,
      lineage_namespace: input.sourceNamespace,
      evaluator_contract_version:
        CANONICAL_EVALUATION_PROJECTION_CONTRACT_VERSION,
      evaluator_version: input.evaluatorVersion,
      intended_horizon_policy: "primary_60m_else_30m_else_15m_v1",
      scan_identity: input.scanIdentity,
      decision_identity: input.decisionIdentity,
      candidate_identity: input.evidence.attribution.candidate_id,
      batch_identity: textOrNull(
        input.evidence.snapshot.payload_json.batch_fingerprint,
      ),
      recommendation_decision_identity: recommendationDecisionIdentity,
      snapshot_identity: snapshotIdentity,
      expected_outcome_lineage_key: [
        "shadow-outcome",
        input.evidence.attribution.candidate_id,
        input.evidence.snapshot.id,
      ].join(":"),
    },
    outcome: input.evidence.canonical_outcome,
  };
}

function observation(
  evidence: CandidateEvidence,
  arm: "baseline" | "candidate",
  canonicalIdentity: string,
  probabilityCalibration: ScannerScoreProbabilityCalibrationModel | null,
): CanonicalShadowCandidateObservation {
  const score = arm === "baseline"
    ? evidence.displacement.baseline_score
    : evidence.displacement.shadow_score;
  const calibrated = applyScannerScoreProbabilityCalibration({
    model: probabilityCalibration,
    arm,
    score,
    decisionAt: evidence.decision_at,
  });
  return {
    canonical_candidate_identity: canonicalIdentity,
    rank:
      arm === "baseline"
        ? evidence.attribution.baseline_rank
        : evidence.attribution.shadow_rank,
    tie_break_key: `${arm}:${evidence.attribution.ticker}`,
    score,
    tier:
      arm === "baseline"
        ? evidence.displacement.baseline_tier
        : evidence.displacement.shadow_tier,
    evidence_strength: null,
    numeric_confidence: calibrated?.probability ?? null,
    confidence_label: null,
    confidence_semantics: calibrated
      ? "calibrated_probability_0_1"
      : "non_probability_numeric",
    probability_source: calibrated ? "numeric_confidence" : "score",
  };
}

function terminalResult<AdapterVersion extends string>(input: {
  adapterVersion: AdapterVersion;
  status: ScannerRankingShadowCanonicalEvaluationResult["status"];
  evaluation?: CanonicalShadowEvaluationResult["evaluation"];
  expected: number;
  snapshots: number;
  outcomes: number;
  reasons: Iterable<string>;
  comparisonIdentity?: string | null;
  candidatePerformanceAtK?: ScannerRankingShadowCandidatePerformanceAtK;
  concentrationInputs?: ScannerRankingShadowConcentrationInput[];
  probabilityCalibrationModel?: ScannerScoreProbabilityCalibrationModel | null;
  probabilityCalibrationInputs?: ScannerRankingShadowProbabilityCalibrationInput[];
  probabilityCalibrationObservations?: ScannerRankingShadowProbabilityCalibrationObservation[];
  feasibilityObservations?: ScannerRankingShadowFeasibilityObservation[];
  qualitySliceObservations?: ScannerRankingShadowQualitySliceObservation[];
}): ScannerRankingShadowCanonicalEvaluationResult<AdapterVersion> {
  return {
    adapter_version: input.adapterVersion,
    status: input.status,
    evaluation: input.evaluation ?? null,
    coverage: {
      expected_candidate_count: input.expected,
      exact_snapshot_count: input.snapshots,
      canonical_primary_outcome_count: input.outcomes,
    },
    reason_codes: uniqueSorted(input.reasons),
    comparison_identity: input.comparisonIdentity ?? null,
    candidate_performance_at_k_version:
      SCANNER_RANKING_SHADOW_CANDIDATE_PERFORMANCE_AT_K_VERSION,
    candidate_performance_at_k: input.candidatePerformanceAtK ?? null,
    concentration_input_version:
      SCANNER_RANKING_SHADOW_CONCENTRATION_INPUT_VERSION,
    concentration_inputs: input.concentrationInputs ?? null,
    probability_calibration_model_version: input.probabilityCalibrationModel
      ? SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION
      : null,
    probability_calibration_model_fingerprint:
      input.probabilityCalibrationModel?.model_fingerprint ?? null,
    probability_calibration_input_version:
      SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_INPUT_VERSION,
    probability_calibration_inputs: input.probabilityCalibrationInputs ?? null,
    probability_calibration_observation_version:
      SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_OBSERVATION_VERSION,
    probability_calibration_observations:
      input.probabilityCalibrationObservations ?? null,
    feasibility_observation_version:
      SCANNER_RANKING_SHADOW_FEASIBILITY_OBSERVATION_VERSION,
    feasibility_observations: input.feasibilityObservations ?? null,
    quality_slice_observation_version:
      SCANNER_RANKING_SHADOW_QUALITY_SLICE_OBSERVATION_VERSION,
    quality_slice_observations: input.qualitySliceObservations ?? null,
    ...safety,
  };
}

/**
 * Maps one persisted real scan and its exact owner-bound outcomes into Ture's
 * canonical paired-ranking evaluator. It is intentionally all-or-nothing:
 * partial candidate coverage cannot produce ranking-quality evidence.
 */
export function evaluateScannerRankingShadowScan<AdapterVersion extends string>(input: {
  scanRun: LearningBaselineScanRun;
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  bootstrapSeed: string;
  adapterVersion: AdapterVersion;
  sourceNamespace: string;
  attribution: ScannerRankingShadowAttribution | null;
  comparison: ScannerRankingShadowComparison | null;
  probabilityCalibration?: ScannerScoreProbabilityCalibrationModel | null;
}): ScannerRankingShadowCanonicalEvaluationResult<AdapterVersion> {
  const decision = candidateDecisionRecordFromScanRun(input.scanRun);
  const attribution = input.attribution;
  const comparison = input.comparison;
  const expected = attribution?.candidate_count ?? comparison?.candidate_count ?? 0;
  const comparisonIdentity = attribution
    ? `${attribution.scan_run_fingerprint}:${attribution.comparison_version}:${attribution.comparison_generated_at}`
    : null;
  const decisionMarketRegime = canonicalMarketRegimeFromPayload(
    input.scanRun.payload_json,
  );
  const decisionMarketRegimeValue = marketRegimeValueFromPayload(
    input.scanRun.payload_json,
  );
  const decisionMarketRegimeContext = marketRegimeDecisionContextFromPayload(
    input.scanRun.payload_json,
  );
  if (
    !decision ||
    !attribution ||
    attribution.status !== "attributed" ||
    !comparison ||
    comparison.status !== "comparable" ||
    decision.learning_attribution.attribution_status !== "complete" ||
    !decision.learning_attribution.canonical_evaluation_versions ||
    attribution.scan_run_id !== decision.scan_run_id ||
    attribution.scan_run_fingerprint !== decision.scan_run_fingerprint ||
    attribution.scan_run_fingerprint !== input.scanRun.run_fingerprint ||
    attribution.candidate_decision_timestamp !== decision.decision_timestamp ||
    attribution.comparison_version !== comparison.comparison_version ||
    attribution.comparison_generated_at !== comparison.generated_at ||
    attribution.baseline_policy_version !== comparison.baseline_policy_version ||
    attribution.shadow_policy_version !== comparison.shadow_policy_version ||
    attribution.candidate_count !== comparison.candidate_count ||
    attribution.candidate_count !== attribution.candidates.length ||
    comparison.candidate_count !== comparison.displacements.length ||
    attribution.candidate_count !== decision.candidates.length
  ) {
    return terminalResult({
      adapterVersion: input.adapterVersion,
      status: "conflicting",
      expected,
      snapshots: 0,
      outcomes: 0,
      reasons: ["shadow_scan_lineage_or_comparison_conflicting"],
      comparisonIdentity,
    });
  }
  if (
    !decisionMarketRegime ||
    !decisionMarketRegimeContext ||
    !supportedDecisionMarketRegimes.has(decisionMarketRegime)
  ) {
    return terminalResult({
      adapterVersion: input.adapterVersion,
      status: "insufficient_evidence",
      expected,
      snapshots: 0,
      outcomes: 0,
      reasons: ["decision_market_regime_context_missing"],
      comparisonIdentity,
    });
  }
  if (decisionMarketRegimeValue !== decisionMarketRegimeContext.regime) {
    return terminalResult({
      adapterVersion: input.adapterVersion,
      status: "conflicting",
      expected,
      snapshots: 0,
      outcomes: 0,
      reasons: ["decision_market_regime_context_conflicting"],
      comparisonIdentity,
    });
  }
  if (expected === 0) {
    return terminalResult({
      adapterVersion: input.adapterVersion,
      status: "insufficient_evidence",
      expected: 0,
      snapshots: 0,
      outcomes: 0,
      reasons: ["no_ranked_candidates_to_evaluate"],
      comparisonIdentity,
    });
  }

  const decisionById = new Map(
    decision.candidates.map((candidate) => [candidate.candidate_id, candidate]),
  );
  const displacementByTicker = new Map(
    comparison.displacements.map((item) => [item.ticker, item]),
  );
  const versions = decision.learning_attribution.canonical_evaluation_versions;
  const evidence: CandidateEvidence[] = [];
  const reasons = new Set<string>();
  let exactSnapshots = 0;
  for (const candidate of attribution.candidates) {
    const decisionCandidate = decisionById.get(candidate.candidate_id);
    const displacement = displacementByTicker.get(candidate.ticker);
    if (
      !decisionCandidate ||
      !decisionCandidate.ranking ||
      !displacement ||
      normalizedTicker(decisionCandidate.ticker) !== candidate.ticker ||
      decisionCandidate.disposition !== candidate.candidate_decision_disposition ||
      decisionCandidate.ranking.rank !== candidate.baseline_rank ||
      displacement.baseline_rank !== candidate.baseline_rank ||
      displacement.shadow_rank !== candidate.shadow_rank ||
      displacement.baseline_selected !== candidate.baseline_selected ||
      displacement.shadow_selected !== candidate.shadow_selected
    ) {
      reasons.add("candidate_ranking_identity_conflicting");
      continue;
    }
    if (
      exactSnapshotForCandidate({
        candidate,
        scanRunFingerprint: decision.scan_run_fingerprint,
        snapshots: input.snapshots,
      })
    ) {
      exactSnapshots += 1;
    }
    const result = evidenceForCandidate({
      candidate,
      displacement,
      decision: decisionCandidate,
      scanRunFingerprint: decision.scan_run_fingerprint,
      decisionTimestamp: decision.decision_timestamp,
      evaluatorVersion: versions.evaluator_version,
      providerContractVersion: versions.provider_contract_version,
      snapshots: input.snapshots,
      outcomes: input.outcomes,
      expectedMarketRegimeContext: decisionMarketRegimeContext,
    });
    for (const reason of result.reason_codes) reasons.add(reason);
    if (result.evidence) {
      evidence.push(result.evidence);
    } else if (
      result.reason_codes.some((reason) => reason.includes("conflicting"))
    ) {
      return terminalResult({
        adapterVersion: input.adapterVersion,
        status: "conflicting",
        expected,
        snapshots: exactSnapshots,
        outcomes: evidence.length,
        reasons,
        comparisonIdentity,
      });
    }
  }
  if (reasons.has("candidate_ranking_identity_conflicting")) {
    return terminalResult({
      adapterVersion: input.adapterVersion,
      status: "conflicting",
      expected,
      snapshots: exactSnapshots,
      outcomes: evidence.length,
      reasons,
      comparisonIdentity,
    });
  }
  if (evidence.length !== expected) {
    reasons.add("complete_candidate_outcome_coverage_required");
    return terminalResult({
      adapterVersion: input.adapterVersion,
      status: "insufficient_evidence",
      expected,
      snapshots: exactSnapshots,
      outcomes: evidence.length,
      reasons,
      comparisonIdentity,
    });
  }

  const providerSources = uniqueSorted(
    evidence.flatMap((item) =>
      item.decision.data.provider_source ? [item.decision.data.provider_source] : [],
    ),
  );
  const providerTimestamps = evidence.flatMap((item) =>
    item.decision.data.source_timestamp ? [item.decision.data.source_timestamp] : [],
  );
  if (
    providerSources.length !== 1 ||
    providerTimestamps.length !== expected ||
    evidence.some(
      (item) =>
        item.decision.data.freshness !== "fresh" ||
        item.decision.data.gap_codes.length > 0,
    )
  ) {
    return terminalResult({
      adapterVersion: input.adapterVersion,
      status: "insufficient_evidence",
      expected,
      snapshots: exactSnapshots,
      outcomes: evidence.length,
      reasons: ["complete_fresh_point_in_time_provider_coverage_required"],
      comparisonIdentity,
    });
  }

  const capture = buildPreTruncationCandidateCaptureEvidence({
    scan_identity: decision.scan_run_id,
    producer_decision_id: decision.scan_run_id,
    capture_stage_identity: "scanner-full-ranking-boundary",
    capture_stage_version: "scanner-full-ranking-boundary-v1",
    candidate_identities: evidence.map((item) => item.attribution.candidate_id),
    capture_timestamp: decision.decision_timestamp,
    point_in_time_cutoff: decision.decision_timestamp,
    scanner_version: decision.versions.scanner_version,
    universe_version: decision.versions.universe_version,
    provider_contract_version: decision.versions.provider_contract_version,
  });
  if (!capture.ok) {
    return terminalResult({
      adapterVersion: input.adapterVersion,
      status: "conflicting",
      expected,
      snapshots: exactSnapshots,
      outcomes: evidence.length,
      reasons: capture.reason_codes,
      comparisonIdentity,
    });
  }

  const noTrade = decision.final_decision.disposition === "no_trade";
  const memberships = evidence.map((item) =>
    membership({
      evidence: item,
      scanIdentity: decision.scan_run_id,
      decisionIdentity: decision.scan_run_id,
      window: input.scanRun.window,
      thresholdVersion:
        decision.learning_attribution.recommendation_publish_policy_version,
      rankingVersion: attribution.baseline_policy_version,
      evaluatorVersion: versions.evaluator_version,
      sourceNamespace: input.sourceNamespace,
      noTrade,
    }),
  );
  const opportunitySet = buildCanonicalCounterfactualOpportunitySet({
    source_namespace: input.sourceNamespace,
    scan_identity: decision.scan_run_id,
    decision_identity: decision.scan_run_id,
    decision_timestamp: decision.decision_timestamp,
    point_in_time_cutoff: decision.decision_timestamp,
    versions: {
      ...versions,
      scanner_version: decision.versions.scanner_version,
      universe_version: decision.versions.universe_version,
      threshold_version:
        decision.learning_attribution.recommendation_publish_policy_version,
      reason_taxonomy_version:
        CANONICAL_COUNTERFACTUAL_REASON_TAXONOMY_VERSION,
    },
    expected_candidate_count: expected,
    observed_candidate_count: memberships.length,
    provider_context: {
      provider: providerSources[0]!,
      source_timestamp: [...providerTimestamps].sort().at(-1)!,
      freshness: "fresh",
      coverage_contract_version:
        CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION,
      coverage_denominator: "candidate_provider_observations",
      coverage_unit: "candidate",
      expected_observation_count: expected,
      observed_observation_count: expected,
      coverage_reason_codes: [],
    },
    pre_truncation_capture_evidence_digest: capture.evidence.evidence_digest,
    decision_semantics: noTrade
      ? {
          decision_disposition: "explicit_no_trade",
          decision_lineage_nodes: [
            {
              node_kind: "no_trade",
              decision_identity: decision.scan_run_id,
              candidate_identity: null,
              snapshot_identity: null,
            },
          ],
          no_trade_semantics: {
            explicit_decision_recorded: true,
            producer_decision_id: decision.scan_run_id,
            decision_timestamp: decision.decision_timestamp,
            decision_reason_code: "no_publishable_candidate",
            decision_reason_detail: decision.final_decision.no_trade_reason,
            decision_source: "candidate_decision_record",
            ai_no_trade_observed: false,
            deterministic_fallback_used: false,
          },
        }
      : {
          decision_disposition: "publish_recommendations",
          decision_lineage_nodes: memberships.map((item) => ({
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
    candidates: memberships,
  });
  if (opportunitySet.status !== "built") {
    return terminalResult({
      adapterVersion: input.adapterVersion,
      status: "conflicting",
      expected,
      snapshots: exactSnapshots,
      outcomes: evidence.length,
      reasons: opportunitySet.reason_codes,
      comparisonIdentity,
    });
  }

  const canonicalIdentityByCandidate = new Map(
    opportunitySet.opportunity_set.candidates.map((item) => [
      item.candidate_identity,
      item.canonical_candidate_identity,
    ]),
  );
  const diagnosticThresholdPolicy = {
    version: SCANNER_RANKING_SHADOW_DIAGNOSTIC_THRESHOLD_POLICY_VERSION,
    dimension: "score" as const,
    thresholds: [0],
  };
  const baselineVersions = {
    engine_version: versions.engine_version,
    scoring_version: versions.scoring_version,
    ranking_version: attribution.baseline_policy_version,
    threshold_policy_version: diagnosticThresholdPolicy.version,
    setup_taxonomy_version: versions.setup_taxonomy_version,
    confidence_contract_version: versions.confidence_contract_version,
    evaluator_version: versions.evaluator_version,
    provider_contract_version: versions.provider_contract_version,
  };
  const candidateVersions = {
    ...baselineVersions,
    ranking_version: attribution.shadow_policy_version,
  };
  const baseline = buildCanonicalShadowEvaluationArm({
    arm: "baseline",
    opportunity_set: opportunitySet.opportunity_set,
    cohort: "shadow_recommendation_quality",
    sample_type: "shadow",
    versions: baselineVersions,
    threshold_policy: diagnosticThresholdPolicy,
    candidates: evidence.map((item) =>
      observation(
        item,
        "baseline",
        canonicalIdentityByCandidate.get(item.attribution.candidate_id)!,
        input.probabilityCalibration ?? null,
      ),
    ),
  });
  const candidate = buildCanonicalShadowEvaluationArm({
    arm: "candidate",
    opportunity_set: opportunitySet.opportunity_set,
    cohort: "shadow_recommendation_quality",
    sample_type: "shadow",
    versions: candidateVersions,
    threshold_policy: diagnosticThresholdPolicy,
    candidates: evidence.map((item) =>
      observation(
        item,
        "candidate",
        canonicalIdentityByCandidate.get(item.attribution.candidate_id)!,
        input.probabilityCalibration ?? null,
      ),
    ),
  });
  if (baseline.status !== "built" || candidate.status !== "built") {
    return terminalResult({
      adapterVersion: input.adapterVersion,
      status: "conflicting",
      expected,
      snapshots: exactSnapshots,
      outcomes: evidence.length,
      reasons: [
        ...baseline.reason_codes,
        ...candidate.reason_codes,
      ],
      comparisonIdentity,
    });
  }
  const evaluation = evaluateCanonicalShadowRankingConfidencePair({
    baseline: baseline.arm,
    candidate: candidate.arm,
    declared_version_differences: ["ranking_version"],
    engine_change_intended: false,
    bootstrap_seed: input.bootstrapSeed,
  });
  const orderedEvidence = [...evidence].sort((left, right) =>
    left.attribution.candidate_id.localeCompare(right.attribution.candidate_id)
  );
  const probabilityCalibrationInputs = orderedEvidence.flatMap((item) => {
    const terminal = item.canonical_outcome.terminal_outcome;
    return terminal === "target_before_stop" || terminal === "stop_before_target"
      ? [{
          candidate_id: item.attribution.candidate_id,
          ticker: item.attribution.ticker,
          decision_at: item.decision_at,
          outcome_evaluated_at: item.canonical_outcome.evaluated_at,
          baseline_score: item.displacement.baseline_score,
          candidate_score: item.displacement.shadow_score,
          terminal_outcome: terminal,
        } satisfies ScannerRankingShadowProbabilityCalibrationInput]
      : [];
  });
  const probabilityCalibrationObservations = orderedEvidence.map((item) => {
    const terminal = item.canonical_outcome.terminal_outcome;
    const baseline = applyScannerScoreProbabilityCalibration({
      model: input.probabilityCalibration ?? null,
      arm: "baseline",
      score: item.displacement.baseline_score,
      decisionAt: item.decision_at,
    });
    const candidateApplication = applyScannerScoreProbabilityCalibration({
      model: input.probabilityCalibration ?? null,
      arm: "candidate",
      score: item.displacement.shadow_score,
      decisionAt: item.decision_at,
    });
    return {
      candidate_id: item.attribution.candidate_id,
      ticker: item.attribution.ticker,
      decision_at: item.decision_at,
      terminal_binary: terminal === "target_before_stop"
        ? 1 as const
        : terminal === "stop_before_target"
          ? 0 as const
          : null,
      baseline_probability: baseline?.probability ?? null,
      candidate_probability: candidateApplication?.probability ?? null,
    } satisfies ScannerRankingShadowProbabilityCalibrationObservation;
  });
  const feasibilityObservations = orderedEvidence.map((item) => {
    const features = item.decision_feature_vector.feature_values;
    return {
      candidate_id: item.attribution.candidate_id,
      ticker: item.attribution.ticker,
      decision_at: item.decision_at,
      decision_feature_vector_version:
        item.decision_feature_vector.contract_version,
      liquidity: {
        intraday_recent_volume_ratio: features.intraday_recent_volume_ratio,
        intraday_latest_volume: features.intraday_latest_volume,
        intraday_average_volume: features.intraday_average_volume,
      },
      volatility: {
        ...recommendationDecisionRangeFeature(item.decision_feature_vector),
        intraday_latest_range_percent: features.intraday_latest_range_percent,
        intraday_range_expansion_ratio:
          features.intraday_range_expansion_ratio,
        intraday_recent_range_percent: features.intraday_recent_range_percent,
      },
      trigger_attainment: item.outcome.entry_triggered,
      unavailable_disclosed: {
        spread: true,
        halt_risk: true,
        conservative_slippage: true,
      },
    } satisfies ScannerRankingShadowFeasibilityObservation;
  });
  const qualitySliceObservations = orderedEvidence.map((item) => ({
    candidate_id: item.attribution.candidate_id,
    ticker: item.attribution.ticker,
    sector: item.sector,
    setup: item.setup_type,
    regime: item.market_regime,
    decision_at: item.decision_at,
    baseline_rank: item.attribution.baseline_rank,
    candidate_rank: item.attribution.shadow_rank,
    positive_outcome: item.canonical_outcome.positive_outcome,
    terminal_outcome: item.canonical_outcome.terminal_outcome,
    r_result: item.canonical_outcome.r_result,
  } satisfies ScannerRankingShadowQualitySliceObservation));
  return terminalResult({
    adapterVersion: input.adapterVersion,
    status: evaluation.status,
    evaluation: evaluation.evaluation,
    expected,
    snapshots: exactSnapshots,
    outcomes: evidence.length,
    reasons: [
      ...evaluation.reason_codes,
      ...(evaluation.status === "probability_semantics_missing"
        ? ["confidence_is_ordinal_not_probability"]
        : []),
      "threshold_sweep_diagnostic_only",
    ],
    comparisonIdentity,
    candidatePerformanceAtK: candidatePerformanceAtK(evidence),
    concentrationInputs: orderedEvidence
      .map((item) => ({
        candidate_id: item.attribution.candidate_id,
        ticker: item.attribution.ticker,
        sector: item.sector,
        setup: item.setup_type,
        regime: item.market_regime,
      })),
    probabilityCalibrationModel: input.probabilityCalibration ?? null,
    probabilityCalibrationInputs,
    probabilityCalibrationObservations,
    feasibilityObservations,
    qualitySliceObservations,
  });
}

export function evaluateScannerIntradayLiquidityShadowScan(input: {
  scanRun: LearningBaselineScanRun;
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  bootstrapSeed: string;
}): ScannerIntradayLiquidityShadowCanonicalEvaluationResult {
  return evaluateScannerRankingShadowScan({
    ...input,
    adapterVersion:
      SCANNER_INTRADAY_LIQUIDITY_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION,
    sourceNamespace: "ture.scanner_intraday_liquidity_shadow",
    attribution: scannerIntradayLiquidityShadowAttributionFromUnknown(
      input.scanRun.payload_json.scanner_intraday_liquidity_shadow_attribution,
    ),
    comparison: scannerIntradayLiquidityShadowComparisonFromUnknown(
      input.scanRun.payload_json.scanner_intraday_liquidity_shadow_comparison,
    ),
  });
}
