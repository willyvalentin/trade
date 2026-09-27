import "server-only";

import type { LearningBaselineScanRun } from "@/lib/recommendation-learning-baseline-readiness";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { scannerClockPriorShadowAttributionFromUnknown } from "@/lib/scanner-ranking-clock-prior-shadow-attribution";
import { scannerClockPriorShadowComparisonFromUnknown } from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  evaluateScannerRankingShadowScan,
  type ScannerRankingShadowCanonicalEvaluationResult,
} from "@/lib/server/scanner-intraday-liquidity-shadow-canonical-evaluation";

export const SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION =
  "scanner_clock_prior_shadow_canonical_evaluation_adapter_v1" as const;

export type ScannerClockPriorShadowCanonicalEvaluationResult =
  ScannerRankingShadowCanonicalEvaluationResult<
    typeof SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION
  >;

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
}): ScannerClockPriorShadowCanonicalEvaluationResult {
  return evaluateScannerRankingShadowScan({
    ...input,
    adapterVersion:
      SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION,
    sourceNamespace: "ture.scanner_clock_prior_shadow",
    attribution: scannerClockPriorShadowAttributionFromUnknown(
      input.scanRun.payload_json.scanner_clock_prior_shadow_attribution,
    ),
    comparison: scannerClockPriorShadowComparisonFromUnknown(
      input.scanRun.payload_json.scanner_clock_prior_shadow_comparison,
    ),
  });
}
