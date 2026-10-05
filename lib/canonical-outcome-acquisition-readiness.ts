import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION, canonicalOutcomeProviderCoverageQuality } from "@/lib/recommendation-outcome-canonical-coverage";

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

export const CANONICAL_OUTCOME_RETRY_WINDOW_VERSION = "observed_original_canonical_bar_window_v1" as const;

/** Acquisition deferral only: this never makes an incomplete label usable.
 * A later bar window may retry provider recovery against the same original
 * horizon. Unknown/legacy clocks retain their previous retry behavior. */
export function deferObservedCanonicalOutcomeWindow(outcome: RecommendationOutcome | undefined, now: Date): boolean {
  if (!outcome || !hasIncompleteCanonicalOutcomeCoverage(outcome)) return false;
  const raw = outcome.payload_json.canonical_provider_coverage;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const coverage = raw as Record<string, unknown>;
  if (coverage.contract_version !== CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION ||
    (coverage.candle_interval !== "5min" && coverage.candle_interval !== "15min")) return false;
  const observed = Date.parse(outcome.evaluated_at ?? "");
  const current = now.getTime();
  if (!Number.isFinite(observed) || !Number.isFinite(current) || observed > current ||
    new Date(observed).toISOString() !== outcome.evaluated_at) return false;
  const interval = coverage.candle_interval === "5min" ? 300000 : 900000;
  return Math.floor(observed / interval) === Math.floor(current / interval);
}
