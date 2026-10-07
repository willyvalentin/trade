import "server-only";
import { buildCanonicalOutcomeProviderCoverageReceipt, canonicalOutcomeProviderCoverageQuality } from "@/lib/recommendation-outcome-canonical-coverage";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import { computeRecommendationOutcome, type RecommendationOutcome, type RecommendationOutcomeCandle } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { RelativePlanTrainedProbabilityModel } from "@/lib/server/relative-plan-trained-probability-model";

// NEW admission only. The legacy coverage builder loses sub-millisecond
// fractions in Date.parse; do not change old coverage or sealed v1 semantics.
// Preserve every represented millisecond; never truncate a finer retained
// fraction into the producer's millisecond clock.
function retainedInstantMillis(value: unknown): number | null {
  let at: number;
  if (value instanceof Date) at = value.getTime();
  else if (typeof value === "number") at = value < 100000000000 ? value * 1000 : value;
  else if (typeof value === "string") {
    const instant = value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/);
    if (!instant || /[1-9]/.test((instant[1] ?? "").slice(3))) return null;
    at = Date.parse(value);
    if (!Number.isFinite(at)) return null;
    const zone = instant[2];
    const offset = zone === "Z" ? 0 : (zone[0] === "+" ? 1 : -1) *
      (Number(zone.slice(1, 3)) * 60 + Number(zone.slice(4)));
    // Reject calendar normalization, not an honest explicit UTC offset.
    if (new Date(at + offset * 60000).toISOString().slice(0, 19) !== value.slice(0, 19)) return null;
  } else return null;
  return Number.isSafeInteger(at) ? at : null;
}

function retainedCandleOnExactGrid(value: unknown, interval: number): boolean {
  const at = retainedInstantMillis(value);
  return at !== null && at % interval === 0;
}

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
  const interval = coverage.candle_interval === "15min" ? 900000 : 300000;
  if (candles.some(row => !retainedCandleOnExactGrid(row.timestamp, interval))) return coverageConflict;
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
      return actual === null || retained === null ? actual !== retained : Date.parse(actual) !== retainedInstantMillis(retained);
    })) return "retained_candle_outcome_conflicting";
  // A neither-hit label uses measured horizon R in the full charter. Replaying
  // only terminal flags would allow a contradictory persisted price/R to be
  // sealed. Check NEW admission against the same fully closed original bar;
  // missing measurements remain explicit gaps, never inferred labels.
  // Match the unchanged full-charter consumer's current_r ?? eod_r selection;
  // an unused EOD measurement must not override an honest current measurement.
  const realizedR = outcome.current_r ?? outcome.eod_r;
  const realizedPrice = outcome.current_r !== null ? outcome.current_price : outcome.eod_price;
  if (outcome.status === "neither_hit" && realizedR !== null) {
    const lastAt = Date.parse(rebuilt.required_horizon_end_at!) -
      (coverage.candle_interval === "15min" ? 900000 : 300000);
    const last = (candles as RecommendationOutcomeCandle[]).find(row => {
      const at = row.timestamp instanceof Date ? row.timestamp.getTime() : typeof row.timestamp === "number"
        ? (row.timestamp < 100000000000 ? row.timestamp * 1000 : row.timestamp) : Date.parse(row.timestamp);
      return at === lastAt;
    });
    const measured = computeRecommendationOutcome({ snapshot, side: outcome.side,
      horizon: outcome.horizon, entry: outcome.entry, stop: outcome.stop, target: outcome.target,
      recommended_at: outcome.recommended_at, evaluated_at: outcome.evaluated_at, current_price: last?.close }).outcome;
    if (realizedPrice !== last?.close || measured.current_r === null ||
      !Number.isFinite(realizedR) ||
      Math.abs(realizedR - measured.current_r) > 1e-12 * Math.max(1, Math.abs(measured.current_r))) {
      return "retained_candle_realized_r_conflicting";
    }
  }
  return null;
}
