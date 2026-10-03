import "server-only";
import { parseRecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { readRecommendationLearningBaselineSource } from "@/lib/server/application-data-access";
import { relativePlanProspectiveStore } from "@/lib/server/relative-plan-prospective-store";
import { relativePlanTrainedProbabilityStore } from "@/lib/server/relative-plan-trained-probability-store";
import { relativePlanCharterResultStore, type RelativePlanCharterResultStoreResult } from "@/lib/server/relative-plan-charter-result-store";
import { readRelativePlanCharterRuntimeSource } from "@/lib/server/relative-plan-charter-runtime-source";
import { buildRelativePlanCharterResult, relativePlanTerminalQualityDecision } from "@/lib/server/relative-plan-charter-result";
import { relativePlanSemanticFingerprint } from "@/lib/server/relative-plan-prospective-comparison";
import { hasExplicitRelativePlanOutcomeRecordingTimes, hasAdmissibleRelativePlanCurrentOutcomeRevisionTimes } from "@/lib/server/relative-plan-probability-measurement";
import { RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES } from "@/lib/server/relative-plan-complete-http-response";

type Dependencies = { prospectiveStore: typeof relativePlanProspectiveStore;
  modelStore: typeof relativePlanTrainedProbabilityStore; resultStore: typeof relativePlanCharterResultStore;
  readSource: typeof readRecommendationLearningBaselineSource; readRuntime: typeof readRelativePlanCharterRuntimeSource;
  clock: () => Date };
const dependencies: Dependencies = { prospectiveStore: relativePlanProspectiveStore,
  modelStore: relativePlanTrainedProbabilityStore, resultStore: relativePlanCharterResultStore,
  readSource: readRecommendationLearningBaselineSource, readRuntime: readRelativePlanCharterRuntimeSource,
  clock: () => new Date() };
const unavailable = (blocker: string): RelativePlanCharterResultStoreResult => ({ status: "unavailable", receipt: null, blocker });

/** Fixed-purpose owner command. GET never finalizes. Once stored, neither
 * retries nor restarted reads touch mutable history or refit the model. */
export function createRelativePlanCharterResultService(d: Dependencies = dependencies) {
  const read = async (owner: string) => {
    const freeze = await d.prospectiveStore().read(owner);
    if (!freeze.receipt) return { status: freeze.status === "not_found" ? "not_found" as const : "unavailable" as const,
      receipt: null, blocker: freeze.blocker ?? "prospective_comparison_freeze_required" };
    return d.resultStore().read(freeze.receipt,owner);
  };
  const command = async (owner: string,request: unknown): Promise<RelativePlanCharterResultStoreResult | {
    status: "invalid_request"; receipt: null; blocker: string;
  }> => {
    if (!request || typeof request !== "object" || Array.isArray(request) ||
      Object.getPrototypeOf(request) !== Object.prototype || Object.keys(request).length !== 0) return {
        status: "invalid_request", receipt: null, blocker: "charter_result_source_model_and_clock_are_server_owned" };
    const freeze = await d.prospectiveStore().read(owner);
    if (!freeze.receipt) return { status: freeze.status === "not_found" ? "not_found" : "unavailable",
      receipt: null, blocker: freeze.blocker ?? "prospective_comparison_freeze_required" };
    const store = d.resultStore(), prior = await store.read(freeze.receipt,owner);
    if (prior.receipt) return { ...prior,status: "already_finalized" };
    if (prior.status !== "not_found") return prior;
    const jobTime = d.clock().getTime();
    if (!Number.isFinite(jobTime) || jobTime < Math.max(Date.parse(freeze.receipt.plan.windows.held_out.end_at),
      Date.parse(freeze.receipt.plan.windows.walk_forward.end_at)) + 3600000) return {
      status: "not_ready", receipt: null, blocker: "relative_plan_original_forward_windows_and_maturity_required" };
    const model = await d.modelStore().read(freeze.receipt,owner);
    if (!model.receipt) return { status: "not_ready",receipt: null,blocker: model.blocker ?? "relative_plan_original_committed_training_model_required" };
    const sourceRead = async (asOf?: Date) => {
      const result = await d.readSource(owner);
      if (result.status !== "available" || !hasExplicitRelativePlanOutcomeRecordingTimes(result.data.recommendation_outcomes)) {
        return { source: null, blocker: "relative_plan_result_complete_owned_source_unavailable" };
      }
      if (!hasAdmissibleRelativePlanCurrentOutcomeRevisionTimes(result.data.recommendation_outcomes, asOf ?? d.clock())) {
        return { source: null, blocker: "relative_plan_result_outcome_revision_times_invalid" };
      }
      return { source: parseRecommendationLearningBaselineSource(result.data),
        blocker: "relative_plan_result_complete_owned_source_unavailable" };
    };
    try {
      const initial = await sourceRead(), source = initial.source;
      if (!source) return unavailable(initial.blocker);
      const now = d.clock();
      const runtime = await d.readRuntime({ owner,freeze: freeze.receipt,now });
      const after = await sourceRead(now);
      if (!after.source) return unavailable(after.blocker);
      if (relativePlanSemanticFingerprint(after.source) !== relativePlanSemanticFingerprint(source)) {
        return unavailable("relative_plan_result_original_source_changed_during_read");
      }
      const candidate = buildRelativePlanCharterResult({ owner,freeze: freeze.receipt,now,source,runtime,trainedModelReceipt: model.receipt });
      if (!candidate.result) return { status: "not_ready",receipt: null,blocker: candidate.blocker };
      const envelope = { contract_version: "relative_plan_charter_result_receipt_v1" as const,
        result_id: "11111111-1111-4111-8111-111111111111",owner_user_id: owner,
        finalized_at: now.toISOString(),result: candidate.result };
      if (Buffer.byteLength(JSON.stringify({ status: "already_finalized",receipt: envelope,blocker: null,
        terminal_quality_decision: relativePlanTerminalQualityDecision(envelope),quality_improvement_claimed: false }),"utf8") >
        RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES) return { status: "not_ready",receipt: null,
          blocker: "relative_plan_complete_result_response_too_large" };
      const written = await store.finalize(candidate.result,freeze.receipt,owner);
      if (written.status !== "conflicting") return written;
      // Concurrent fixed-purpose commands may observe different clocks; the
      // first complete committed result wins, never this job's rejected copy.
      const first = await store.read(freeze.receipt,owner);
      return first.receipt ? { ...first,status: "already_finalized" } : written;
    } catch { return unavailable("relative_plan_result_original_evidence_read_or_write_failed"); }
  };
  const present = (result: Awaited<ReturnType<typeof command>>) => ({ ...result,
    terminal_quality_decision: result.receipt ? relativePlanTerminalQualityDecision(result.receipt) : null,
    quality_improvement_claimed: false });
  return { async read(owner: string) { return present(await read(owner)); },
    async finalize(owner: string,request: unknown) { return present(await command(owner,request)); } };
}
