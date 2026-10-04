import "server-only";
import { buildCanonicalOutcomeProviderCoverageReceipt, canonicalOutcomeProviderCoverageQuality } from "@/lib/recommendation-outcome-canonical-coverage";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import { computeRecommendationOutcome, type RecommendationOutcome, type RecommendationOutcomeCandle } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { RelativePlanTrainedProbabilityModel } from "@/lib/server/relative-plan-trained-probability-model";

export function relativePlanRetainedTrainingCandleConflict(model: RelativePlanTrainedProbabilityModel): string | null {
  const source = model.retained_training_source;
  const outcomes = new Map(source.outcomes.map(row => [row.id, row]));
  const snapshots = new Map(source.snapshots.map(row => [row.snapshot_fingerprint, row]));
  for (const receipt of model.original_training_receipts) {
    if (receipt.resolution === "missing_or_conflicting") continue;
    const outcome = outcomes.get(receipt.outcome_id!);
    if (!outcome) return "retained_candle_coverage_conflicting";
    const conflict = relativePlanRetainedOutcomeCandleConflict(snapshots.get(receipt.snapshot_fingerprint!), outcome);
    if (conflict) return conflict;
  }
  return null;
}

/** NEW learning command admission only, never a sealed v1 decoder or relabeler.
 * Explicit retained bars cannot contradict a coverage/terminal claim. Missing
 * legacy bars retain their existing disclosure, not proof of historical fitness. */
export function relativePlanRetainedOutcomeCandleConflict(
  snapshot: RecommendationSnapshot | undefined, outcome: RecommendationOutcome,
): string | null {
  const coverageConflict = "retained_candle_coverage_conflicting";
  const payload = outcome.payload_json;
  const retained = ["counterfactual_candles", "counterfactual_candle_source", "retained_candles_available", "retained_candle_count"];
  if (!retained.some(key => Object.hasOwn(payload, key))) return null;
  const candles = payload.counterfactual_candles;
  if (payload.retained_candles_available !== true ||
    payload.counterfactual_candle_source !== "horizon_filtered_intraday_candles" ||
    !Array.isArray(candles) || candles.length === 0 || candles.length > 96 ||
    payload.retained_candle_count !== candles.length ||
    candles.some(row => !row || typeof row !== "object" || Array.isArray(row))) return coverageConflict;
  const anchor = snapshot && recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot);
  const rawCoverage = payload.canonical_provider_coverage;
  if (!anchor || !rawCoverage || typeof rawCoverage !== "object" || Array.isArray(rawCoverage)) return coverageConflict;
  const coverage = rawCoverage as Record<string, unknown>;
  if ((coverage.candle_interval !== "5min" && coverage.candle_interval !== "15min") ||
    coverage.horizon !== "60m" || typeof coverage.request_end_at !== "string") return coverageConflict;
  const rebuilt = buildCanonicalOutcomeProviderCoverageReceipt({ candles: candles as RecommendationOutcomeCandle[],
    request: { interval: coverage.candle_interval, horizon: "60m", ...anchor,
      start_at: anchor.evaluation_anchor_start_at, end_at: coverage.request_end_at },
    result: { status: "available", provider: outcome.provider } });
  if (canonicalOutcomeProviderCoverageQuality(rebuilt) !== 3) return coverageConflict;
  // Complete coverage does not prove the retained terminal label. Replay the
  // unchanged producer semantics against the original plan and its own bars;
  // never relabel a source member or reinterpret a previously sealed model.
  const replay = computeRecommendationOutcome({ snapshot, side: outcome.side,
    recommended_at: outcome.recommended_at, evaluated_at: outcome.evaluated_at,
    horizon: outcome.horizon, entry: outcome.entry, stop: outcome.stop, target: outcome.target,
    candles: candles as RecommendationOutcomeCandle[], current_price: outcome.current_price,
    eod_price: outcome.eod_price, provider: outcome.provider, source: outcome.source,
    data_completeness: "complete" }).outcome;
  if (["status", "entry_triggered", "target_hit", "stop_hit", "first_terminal_event"].some(
    key => replay[key as keyof typeof replay] !== outcome[key as keyof typeof outcome]) ||
    ["entry_triggered_at", "target_hit_at", "stop_hit_at"].some(key => {
      const actual = replay[key as "entry_triggered_at"], retained = outcome[key as "entry_triggered_at"];
      return actual === null || retained === null ? actual !== retained : Date.parse(actual) !== Date.parse(retained);
    })) return "retained_candle_outcome_conflicting";
  return null;
}
