import "server-only";
import { observationSeriesActivationBuildIdentityFromUnknown } from "@/lib/observation-series-activation-preflight";
import identity from "@/lib/generated/scheduled-scan-deployment-identity.json";
import { parseRecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { readRecommendationLearningBaselineSource } from "@/lib/server/application-data-access";
import { buildRelativePlanProspectiveLearning } from "@/lib/server/relative-plan-prospective-learning";
import { relativePlanProspectiveStore, type RelativePlanProspectiveStoreResult } from "@/lib/server/relative-plan-prospective-store";
import { relativePlanCanonicalBuildIdentity, type RelativePlanProspectivePlanInput } from "@/lib/server/relative-plan-prospective-comparison";

type Dependencies = {
  store: typeof relativePlanProspectiveStore;
  readSource: typeof readRecommendationLearningBaselineSource;
  revision: () => RelativePlanProspectivePlanInput["source_revision"] | null;
};
const dependencies: Dependencies = {
  store: relativePlanProspectiveStore, readSource: readRecommendationLearningBaselineSource,
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
      let sourceResult;
      try { sourceResult = await d.readSource(owner); } catch { return { status: "unavailable" as const,
        receipt: null, learning: null, blocker: "prospective_complete_owned_learning_source_unavailable" }; }
      const source = sourceResult.status === "available" ? parseRecommendationLearningBaselineSource(sourceResult.data) : null;
      if (!source) return { status: "unavailable" as const, receipt: null, learning: null,
        blocker: "prospective_complete_owned_learning_source_unavailable" };
      const learning = buildRelativePlanProspectiveLearning({ owner, freeze: freeze.receipt, source, now });
      return learning ? { status: "available" as const, receipt: freeze.receipt, learning, blocker: null }
        : { status: "unavailable" as const, receipt: null, learning: null, blocker: "prospective_learning_binding_invalid" };
    },
  };
}
