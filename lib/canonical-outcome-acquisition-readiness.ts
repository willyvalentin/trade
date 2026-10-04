import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { canonicalOutcomeProviderCoverageQuality } from "@/lib/recommendation-outcome-canonical-coverage";

export const CANONICAL_OUTCOME_ACQUISITION_READINESS_VERSION = "canonical_outcome_acquisition_readiness_v1" as const;

/** Acquisition scheduling only. A terminal event or physically nonempty
 * response is not complete original-horizon evidence. Retain the legacy skip
 * behavior for sources without a canonical receipt; never reinterpret sealed
 * learning capsules or authorize requests outside the caller's normal budget. */
export function hasIncompleteCanonicalOutcomeCoverage(outcome: RecommendationOutcome | undefined): boolean {
  return Boolean(outcome && outcome.provider === "twelve_data" && outcome.source === "intraday_candles" &&
    (outcome.horizon === "15m" || outcome.horizon === "30m" || outcome.horizon === "60m") &&
    Object.hasOwn(outcome.payload_json, "canonical_provider_coverage") &&
    canonicalOutcomeProviderCoverageQuality(outcome.payload_json.canonical_provider_coverage) !== 3);
}
