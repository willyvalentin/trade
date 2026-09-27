import "server-only";

import type { LearningBaselineScanRun } from "@/lib/recommendation-learning-baseline-readiness";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { ScannerScoreProbabilityCalibrationModel } from "@/lib/scanner-score-probability-calibration";
import { scannerClockPriorShadowAttributionFromUnknown } from "@/lib/scanner-ranking-clock-prior-shadow-attribution";
import { scannerClockPriorShadowComparisonFromUnknown } from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  scannerClockPriorShadowEvidenceReuseReceiptFromUnknown,
  SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION,
} from "@/lib/scanner-clock-prior-shadow-evidence-reuse";
import {
  evaluateScannerRankingShadowScan,
  SCANNER_RANKING_SHADOW_CANDIDATE_PERFORMANCE_AT_K_VERSION,
  SCANNER_RANKING_SHADOW_CONCENTRATION_INPUT_VERSION,
  SCANNER_RANKING_SHADOW_FEASIBILITY_OBSERVATION_VERSION,
  SCANNER_RANKING_SHADOW_QUALITY_SLICE_OBSERVATION_VERSION,
  SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_INPUT_VERSION,
  SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_OBSERVATION_VERSION,
  type ScannerRankingShadowCanonicalEvaluationResult,
} from "@/lib/server/scanner-intraday-liquidity-shadow-canonical-evaluation";

export const SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION =
  "scanner_clock_prior_shadow_canonical_evaluation_adapter_v1" as const;

export type ScannerClockPriorShadowCanonicalEvaluationResult =
  ScannerRankingShadowCanonicalEvaluationResult<
    typeof SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION
  >;

function normalizedTicker(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function incompleteClockPriorCapture(input: {
  expected: number;
  comparisonIdentity: string | null;
  reason: string;
}): ScannerClockPriorShadowCanonicalEvaluationResult {
  return {
    adapter_version:
      SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION,
    status: "insufficient_evidence",
    evaluation: null,
    coverage: {
      expected_candidate_count: input.expected,
      exact_snapshot_count: 0,
      canonical_primary_outcome_count: 0,
    },
    reason_codes: [input.reason],
    comparison_identity: input.comparisonIdentity,
    candidate_performance_at_k_version:
      SCANNER_RANKING_SHADOW_CANDIDATE_PERFORMANCE_AT_K_VERSION,
    candidate_performance_at_k: null,
    concentration_input_version:
      SCANNER_RANKING_SHADOW_CONCENTRATION_INPUT_VERSION,
    concentration_inputs: null,
    probability_calibration_model_version: null,
    probability_calibration_model_fingerprint: null,
    probability_calibration_input_version:
      SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_INPUT_VERSION,
    probability_calibration_inputs: null,
    probability_calibration_observation_version:
      SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_OBSERVATION_VERSION,
    probability_calibration_observations: null,
    feasibility_observation_version:
      SCANNER_RANKING_SHADOW_FEASIBILITY_OBSERVATION_VERSION,
    feasibility_observations: null,
    quality_slice_observation_version:
      SCANNER_RANKING_SHADOW_QUALITY_SLICE_OBSERVATION_VERSION,
    quality_slice_observations: null,
    threshold_policy_semantics: "diagnostic_all_candidates_only",
    shadow_only: true,
    live_ranking_effect: false,
    publication_effect: false,
    causal_improvement_claimed: false,
  };
}

/**
 * Projects the exact persisted clock-prior shadow cohort into the canonical
 * paired-ranking evaluator. This adapter is read-only and shadow-only: it
 * cannot affect live ranking, publication or execution.
 */
export function evaluateScannerClockPriorShadowScan(input: {
  scanRun: LearningBaselineScanRun;
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
  bootstrapSeed: string;
  probabilityCalibration?: ScannerScoreProbabilityCalibrationModel | null;
}): ScannerClockPriorShadowCanonicalEvaluationResult {
  const attribution = scannerClockPriorShadowAttributionFromUnknown(
    input.scanRun.payload_json.scanner_clock_prior_shadow_attribution,
  );
  const comparison = scannerClockPriorShadowComparisonFromUnknown(
    input.scanRun.payload_json.scanner_clock_prior_shadow_comparison,
  );
  const reuse = scannerClockPriorShadowEvidenceReuseReceiptFromUnknown(
    input.scanRun.payload_json.scanner_clock_prior_shadow_evidence_reuse,
  );
  const expected = attribution?.candidate_count ?? comparison?.candidate_count ?? 0;
  const comparisonIdentity = attribution
    ? `${attribution.scan_run_fingerprint}:${attribution.comparison_version}:${attribution.comparison_generated_at}`
    : null;
  if (
    !reuse ||
    reuse.status !== "ready" ||
    reuse.complete_population_reused !== true ||
    reuse.scan_run_fingerprint !== input.scanRun.run_fingerprint ||
    reuse.comparison_version !== comparison?.comparison_version ||
    reuse.baseline_policy_version !== comparison?.baseline_policy_version ||
    reuse.shadow_policy_version !== comparison?.shadow_policy_version ||
    reuse.candidate_count !== expected
  ) {
    return incompleteClockPriorCapture({
      expected,
      comparisonIdentity,
      reason: "clock_prior_full_population_capture_missing_or_conflicting",
    });
  }
  const attributedByTicker = new Map(
    (attribution?.candidates ?? []).map((candidate) => [
      normalizedTicker(candidate.ticker),
      candidate,
    ]),
  );
  const researchEvidenceComplete = reuse.research_snapshot_tickers.every(
    (ticker) => {
      const candidate = attributedByTicker.get(normalizedTicker(ticker));
      if (!candidate) return false;
      const matches = input.snapshots.filter((snapshot) =>
        snapshot.scan_run_id === input.scanRun.run_fingerprint &&
        normalizedTicker(snapshot.ticker) === normalizedTicker(ticker) &&
        snapshot.payload_json.candidate_decision_id === candidate.candidate_id &&
        snapshot.payload_json.clock_prior_shadow_evidence_sample === true &&
        snapshot.payload_json.clock_prior_shadow_evidence_reuse_version ===
          SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION
      );
      return matches.length === 1;
    },
  );
  if (!researchEvidenceComplete) {
    return incompleteClockPriorCapture({
      expected,
      comparisonIdentity,
      reason: "clock_prior_research_snapshot_capture_missing_or_ambiguous",
    });
  }
  return evaluateScannerRankingShadowScan({
    ...input,
    adapterVersion:
      SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION,
    sourceNamespace: "ture.scanner_clock_prior_shadow",
    attribution,
    comparison,
    probabilityCalibration: input.probabilityCalibration ?? null,
  });
}
