import "server-only";
import { parseRecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { readRecommendationLearningBaselineSource } from "@/lib/server/application-data-access";
import { relativePlanProspectiveStore } from "@/lib/server/relative-plan-prospective-store";
import { hasAdmissibleRelativePlanOutcomeRevisionTimes,
  hasExplicitRelativePlanOutcomeRecordingTimes } from "@/lib/server/relative-plan-probability-measurement";
import { buildRelativePlanTrainedProbabilityModel, type RelativePlanTrainedProbabilityModel } from "@/lib/server/relative-plan-trained-probability-model";
import { buildCanonicalOutcomeProviderCoverageReceipt, canonicalOutcomeProviderCoverageQuality } from "@/lib/recommendation-outcome-canonical-coverage";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import type { RecommendationOutcomeCandle } from "@/lib/recommendation-outcome-tracker";
import { relativePlanTrainedProbabilityStore, type RelativePlanTrainedProbabilityStoreResult } from "@/lib/server/relative-plan-trained-probability-store";

type Dependencies = {
  prospectiveStore: typeof relativePlanProspectiveStore;
  modelStore: typeof relativePlanTrainedProbabilityStore;
  readSource: typeof readRecommendationLearningBaselineSource;
  clock: () => Date;
};
const dependencies: Dependencies = { prospectiveStore: relativePlanProspectiveStore,
  modelStore: relativePlanTrainedProbabilityStore, readSource: readRecommendationLearningBaselineSource,
  clock: () => new Date() };
const unavailable = (blocker: string): RelativePlanTrainedProbabilityStoreResult => ({ status: "unavailable", receipt: null, blocker });

/** New-job admission only. A legacy full-coverage claim cannot override its
 * explicitly retained candles. Do not change the pure v1 capsule decoder:
 * previously sealed models/results must reproduce their original semantics.
 * Evidence without retained candles keeps its existing receipt contract; this
 * guard establishes contradiction detection, not complete historical reproof. */
function retainedTrainingCoverageAgrees(model: RelativePlanTrainedProbabilityModel): boolean {
  const source = model.retained_training_source;
  const outcomes = new Map(source.outcomes.map(row => [row.id, row]));
  const snapshots = new Map(source.snapshots.map(row => [row.snapshot_fingerprint, row]));
  for (const receipt of model.original_training_receipts) {
    if (receipt.resolution === "missing_or_conflicting") continue;
    const outcome = outcomes.get(receipt.outcome_id!), payload = outcome?.payload_json;
    if (!payload) return false;
    const retained = ["counterfactual_candles", "counterfactual_candle_source", "retained_candles_available", "retained_candle_count"];
    if (!retained.some(key => Object.hasOwn(payload, key))) continue;
    const candles = payload.counterfactual_candles;
    if (payload.retained_candles_available !== true ||
      payload.counterfactual_candle_source !== "horizon_filtered_intraday_candles" ||
      !Array.isArray(candles) || candles.length === 0 || candles.length > 96 ||
      payload.retained_candle_count !== candles.length ||
      candles.some(row => !row || typeof row !== "object" || Array.isArray(row))) return false;
    const snapshot = snapshots.get(receipt.snapshot_fingerprint!);
    const anchor = snapshot && recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot);
    const rawCoverage = payload.canonical_provider_coverage;
    if (!anchor || !rawCoverage || typeof rawCoverage !== "object" || Array.isArray(rawCoverage)) return false;
    const coverage = rawCoverage as Record<string, unknown>;
    if ((coverage.candle_interval !== "5min" && coverage.candle_interval !== "15min") ||
      coverage.horizon !== "60m" || typeof coverage.request_end_at !== "string") return false;
    const rebuilt = buildCanonicalOutcomeProviderCoverageReceipt({ candles: candles as RecommendationOutcomeCandle[],
      request: { interval: coverage.candle_interval, horizon: "60m", ...anchor,
        start_at: anchor.evaluation_anchor_start_at, end_at: coverage.request_end_at },
      result: { status: "available", provider: outcome.provider } });
    if (canonicalOutcomeProviderCoverageQuality(rebuilt) !== 3) return false;
  }
  return true;
}

/** Fixed-purpose owner command: caller cannot supply model, source, clock or
 * labels. No scheduler/provider/publication path; no training on GET. */
export function createRelativePlanTrainedProbabilityService(d: Dependencies = dependencies) {
  const read = async (owner: string): Promise<RelativePlanTrainedProbabilityStoreResult> => {
    const freeze = await d.prospectiveStore().read(owner);
    if (!freeze.receipt) return { status: freeze.status === "not_found" ? "not_found" : "unavailable",
      receipt: null, blocker: freeze.blocker ?? "prospective_comparison_freeze_required" };
    return d.modelStore().read(freeze.receipt, owner);
  };
  return { read,
    async train(owner: string, request: unknown): Promise<RelativePlanTrainedProbabilityStoreResult | {
      status: "invalid_request"; receipt: null; blocker: string;
    }> {
      if (!request || typeof request !== "object" || Array.isArray(request) ||
        Object.getPrototypeOf(request) !== Object.prototype || Object.keys(request).length !== 0) {
        return { status: "invalid_request", receipt: null, blocker: "training_model_source_and_clock_are_server_owned" };
      }
      const freeze = await d.prospectiveStore().read(owner);
      if (!freeze.receipt) return { status: freeze.status === "not_found" ? "not_found" : "unavailable",
        receipt: null, blocker: freeze.blocker ?? "prospective_comparison_freeze_required" };
      const store = d.modelStore(), prior = await store.read(freeze.receipt, owner);
      if (prior.receipt) return { ...prior, status: "already_materialized" };
      // A lost acknowledgement cannot substitute newly upserted outcomes for
      // the original committed capsule. Resume only its pre-forward witness.
      if (prior.status === "pending_confirmation") return store.confirmPending(freeze.receipt, owner);
      if (prior.status !== "not_found") return prior;
      let result;
      try { result = await d.readSource(owner); } catch { return unavailable("trained_probability_complete_owned_source_unavailable"); }
      if (result.status !== "available") return unavailable("trained_probability_complete_owned_source_unavailable");
      if (!hasExplicitRelativePlanOutcomeRecordingTimes(result.data.recommendation_outcomes)) {
        return unavailable("trained_probability_explicit_outcome_recording_times_unavailable");
      }
      // Sample the server clock after the complete read and validate raw
      // revision clocks BEFORE the legacy decoder can invent updated_at.
      // Existing and pending capsules returned above never refit or reinterpret
      // history. SQL independently enforces the pre-forward sealing boundary.
      const now = d.clock();
      if (!hasAdmissibleRelativePlanOutcomeRevisionTimes(result.data.recommendation_outcomes, now)) {
        return unavailable("trained_probability_outcome_revision_times_invalid");
      }
      const source = parseRecommendationLearningBaselineSource(result.data);
      if (!source) return unavailable("trained_probability_complete_owned_source_unavailable");
      const candidate = buildRelativePlanTrainedProbabilityModel({ owner, freeze: freeze.receipt, source, now });
      if (!candidate.trained_model) return { status: "not_ready", receipt: null, blocker: candidate.blocker };
      if (!retainedTrainingCoverageAgrees(candidate.trained_model)) {
        // Keep the whole original population in storage. Never drop or relabel
        // contradictory members to make a reduced training job appear ready.
        return unavailable("trained_probability_retained_candle_coverage_conflicting");
      }
      const materialized = await store.materialize(candidate.trained_model, freeze.receipt, owner, now);
      if (materialized.status !== "conflicting") return materialized;
      // Concurrent fixed-purpose jobs may sample different source-as-of clocks.
      // The first immutable model wins; acknowledge its exact committed receipt,
      // never overwrite it or report this job's rejected candidate as stored.
      const first = await store.read(freeze.receipt, owner);
      if (first.status === "pending_confirmation") return store.confirmPending(freeze.receipt, owner);
      return first.receipt ? { ...first, status: "already_materialized" } : materialized;
    },
  };
}
