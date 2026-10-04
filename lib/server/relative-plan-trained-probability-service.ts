import "server-only";
import { parseRecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { readRecommendationLearningBaselineSource } from "@/lib/server/application-data-access";
import { relativePlanProspectiveStore } from "@/lib/server/relative-plan-prospective-store";
import { hasAdmissibleRelativePlanOutcomeRevisionTimes,
  hasAdmissibleRelativePlanSnapshotRecordingTimes,
  hasAdmissibleRelativePlanScanRunRecordingTimes,
  hasExplicitRelativePlanOutcomeRecordingTimes } from "@/lib/server/relative-plan-probability-measurement";
import { buildRelativePlanTrainedProbabilityModel } from "@/lib/server/relative-plan-trained-probability-model";
import { relativePlanRetainedTrainingCandleConflict } from "@/lib/server/relative-plan-retained-outcome-admission";
import { relativePlanTrainedProbabilityStore, type RelativePlanTrainedProbabilityStoreResult } from "@/lib/server/relative-plan-trained-probability-store";
import { relativePlanOriginalInputConflict } from "@/lib/server/relative-plan-original-input-admission";

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
      if (!hasAdmissibleRelativePlanSnapshotRecordingTimes(result.data.recommendation_snapshots,
        candidate.trained_model.retained_training_source.snapshots, now)) {
        return unavailable("trained_probability_snapshot_recording_times_invalid");
      }
      if (!hasAdmissibleRelativePlanScanRunRecordingTimes(result.data.recommendation_scan_runs,
        candidate.trained_model.retained_training_source.scanRuns, now)) {
        return unavailable("trained_probability_scan_run_recording_times_invalid");
      }
      const inputConflict = await relativePlanOriginalInputConflict(candidate.trained_model.retained_training_source.scanRuns);
      if (inputConflict) return unavailable(`trained_probability_${inputConflict}`);
      const candleConflict = relativePlanRetainedTrainingCandleConflict(candidate.trained_model);
      if (candleConflict) {
        // Keep the whole original population in storage. Never drop or relabel
        // contradictory members to make a reduced training job appear ready.
        return unavailable(`trained_probability_${candleConflict}`);
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
