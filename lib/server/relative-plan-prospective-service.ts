import "server-only";
import { observationSeriesActivationBuildIdentityFromUnknown } from "@/lib/observation-series-activation-preflight";
import identity from "@/lib/generated/scheduled-scan-deployment-identity.json";
import { parseRecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { readRecommendationLearningBaselineSource } from "@/lib/server/application-data-access";
import { buildRelativePlanProspectiveLearning } from "@/lib/server/relative-plan-prospective-learning";
import { relativePlanProspectiveStore, type RelativePlanProspectiveStoreResult } from "@/lib/server/relative-plan-prospective-store";
import { relativePlanCanonicalBuildIdentity, type RelativePlanProspectivePlanInput } from "@/lib/server/relative-plan-prospective-comparison";
import { hasExplicitRelativePlanOutcomeRecordingTimes } from "@/lib/server/relative-plan-probability-measurement";
import { relativePlanTrainedProbabilityStore } from "@/lib/server/relative-plan-trained-probability-store";
import { readRelativePlanCharterRuntimeSource } from "@/lib/server/relative-plan-charter-runtime-source";
import { relativePlanCharterResultStore } from "@/lib/server/relative-plan-charter-result-store";
import { relativePlanTerminalQualityDecision, replayRelativePlanRetainedRuntime,decodeRelativePlanRetainedSource } from "@/lib/server/relative-plan-charter-result";

type Dependencies = {
  store: typeof relativePlanProspectiveStore;
  readSource: typeof readRecommendationLearningBaselineSource;
  revision: () => RelativePlanProspectivePlanInput["source_revision"] | null;
  modelStore: typeof relativePlanTrainedProbabilityStore;
  readRuntime: typeof readRelativePlanCharterRuntimeSource;
  resultStore: typeof relativePlanCharterResultStore;
};
const dependencies: Dependencies = {
  store: relativePlanProspectiveStore, readSource: readRecommendationLearningBaselineSource,
  modelStore: relativePlanTrainedProbabilityStore,
  readRuntime: readRelativePlanCharterRuntimeSource,
  resultStore: relativePlanCharterResultStore,
  revision: () => {
    const build = observationSeriesActivationBuildIdentityFromUnknown(identity);
    return build ? { commit_ref: build.commit_ref, build_identity: relativePlanCanonicalBuildIdentity, deploy_id: build.deploy_id } : null;
  },
};
export function createRelativePlanProspectiveService(d: Dependencies = dependencies) {
  return {
    async freeze(owner: string, request: unknown, now = new Date()): Promise<RelativePlanProspectiveStoreResult> {
      if (!request || typeof request !== "object" || Array.isArray(request) || Object.keys(request).length !== 1 ||
        !Object.hasOwn(request, "windows")) return { status: "invalid_request", receipt: null,
          blocker: "only_future_windows_may_be_requested_definition_is_server_owned" };
      const revision = d.revision();
      if (!revision) return { status: "unavailable", receipt: null, blocker: "prospective_frozen_runtime_revision_unavailable" };
      return d.store().freeze({ owner_user_id: owner, source_revision: revision,
        windows: (request as { windows: unknown }).windows }, owner, now);
    },
    async read(owner: string, now = new Date()) {
      const freeze = await d.store().read(owner);
      if (!freeze.receipt) return { ...freeze, learning: null };
      const finalized = await d.resultStore().read(freeze.receipt,owner);
      if (finalized.receipt) {
        // The durable capsule is the terminal source, never mutable current
        // history. A later correction may be investigated in a NEW freeze.
        const result = finalized.receipt.result;
        const source = decodeRelativePlanRetainedSource(result.retained_source);
        const runtime = replayRelativePlanRetainedRuntime({ owner,freeze: freeze.receipt,
          now: new Date(result.source_as_of),retained: result.retained_runtime });
        if (!runtime || !source) return { status: "unavailable" as const,receipt: null,learning: null,blocker: "prospective_retained_runtime_invalid" };
        const learning = buildRelativePlanProspectiveLearning({ owner,freeze: freeze.receipt,source,
          now: new Date(result.source_as_of),trainedModelReceipt: result.trained_model_receipt,runtime });
        return learning ? { status: "available" as const,receipt: freeze.receipt,blocker: null,learning: { ...learning,
          status: "evaluated" as const,terminal_quality_decision: relativePlanTerminalQualityDecision(finalized.receipt),
          finalized_charter_result: { result_id: finalized.receipt.result_id,finalized_at: finalized.receipt.finalized_at,
            result_fingerprint: result.result_fingerprint,source_as_of: result.source_as_of },blockers: result.measurement.missing_dimensions } }
          : { status: "unavailable" as const,receipt: null,learning: null,blocker: "prospective_retained_result_invalid" };
      }
      if (finalized.status !== "not_found") return { status: "unavailable" as const,receipt: null,learning: null,blocker: finalized.blocker };
      const model = await d.modelStore().read(freeze.receipt, owner);
      if (!["available", "not_found", "pending_confirmation"].includes(model.status)) return {
        status: "unavailable" as const, receipt: null, learning: null,
        blocker: model.blocker ?? "prospective_training_model_storage_unavailable" };
      let sourceResult;
      try { sourceResult = await d.readSource(owner); } catch { return { status: "unavailable" as const,
        receipt: null, learning: null, blocker: "prospective_complete_owned_learning_source_unavailable" }; }
      if (sourceResult.status === "available" &&
        Array.isArray(sourceResult.data.recommendation_outcomes) &&
        !hasExplicitRelativePlanOutcomeRecordingTimes(sourceResult.data.recommendation_outcomes)) {
        return { status: "unavailable" as const, receipt: null, learning: null,
          blocker: "prospective_explicit_outcome_recording_times_unavailable" };
      }
      const source = sourceResult.status === "available" ? parseRecommendationLearningBaselineSource(sourceResult.data) : null;
      if (!source) return { status: "unavailable" as const, receipt: null, learning: null,
        blocker: "prospective_complete_owned_learning_source_unavailable" };
      let runtime;
      try { runtime = await d.readRuntime({ owner, freeze: freeze.receipt, now }); }
      catch { runtime = { status: "unavailable" as const, partitions: null, blocker: "relative_plan_runtime_source_read_failed" }; }
      const learning = buildRelativePlanProspectiveLearning({ owner, freeze: freeze.receipt, source, now,
        trainedModelReceipt: model.receipt, runtime });
      return learning ? { status: "available" as const, receipt: freeze.receipt, learning, blocker: null }
        : { status: "unavailable" as const, receipt: null, learning: null, blocker: "prospective_learning_binding_invalid" };
    },
  };
}
