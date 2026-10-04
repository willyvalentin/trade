import "server-only";
import { parseRecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { readRecommendationLearningBaselineSource } from "@/lib/server/application-data-access";
import { relativePlanProspectiveStore } from "@/lib/server/relative-plan-prospective-store";
import { relativePlanTrainedProbabilityStore } from "@/lib/server/relative-plan-trained-probability-store";
import { relativePlanCharterResultStore, type RelativePlanCharterResultStoreResult } from "@/lib/server/relative-plan-charter-result-store";
import { readRelativePlanCharterRuntimeSource } from "@/lib/server/relative-plan-charter-runtime-source";
import { buildRelativePlanCharterResult, relativePlanTerminalQualityDecision,
  scopeRelativePlanCharterResultSource } from "@/lib/server/relative-plan-charter-result";
import { relativePlanSemanticFingerprint } from "@/lib/server/relative-plan-prospective-comparison";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { hasExplicitRelativePlanOutcomeRecordingTimes, hasAdmissibleRelativePlanCurrentOutcomeRevisionTimes,
  hasAdmissibleRelativePlanSnapshotRecordingTimes,
  hasAdmissibleRelativePlanScanRunRecordingTimes } from "@/lib/server/relative-plan-probability-measurement";
import { relativePlanCompleteResponseFitsTransport } from "@/lib/server/relative-plan-complete-http-response";
import { relativePlanOriginalInputConflict } from "@/lib/server/relative-plan-original-input-admission";
import { relativePlanRetainedOutcomeCandleConflict, relativePlanRetainedTrainingCandleConflict } from "@/lib/server/relative-plan-retained-outcome-admission";
import { canonicalOutcomeProviderCoverageQuality } from "@/lib/recommendation-outcome-canonical-coverage";

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
  const command = async (owner: string,request: unknown, acceptEncoding?: string | null): Promise<RelativePlanCharterResultStoreResult | {
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
    const originalFreeze = freeze.receipt;
    const sourceRead = async (asOf?: Date) => {
      const result = await d.readSource(owner);
      if (result.status !== "available" || !hasExplicitRelativePlanOutcomeRecordingTimes(result.data.recommendation_outcomes)) {
        return { source: null, blocker: "relative_plan_result_complete_owned_source_unavailable" };
      }
      const observedAt = asOf ?? d.clock();
      if (!hasAdmissibleRelativePlanCurrentOutcomeRevisionTimes(result.data.recommendation_outcomes, observedAt)) {
        return { source: null, blocker: "relative_plan_result_outcome_revision_times_invalid" };
      }
      const source = parseRecommendationLearningBaselineSource(result.data);
      if (source) {
        const training = originalFreeze.plan.windows.training;
        const scoped = scopeRelativePlanCharterResultSource(source, originalFreeze);
        // Current training rows do not replace the sealed fitted capsule.
        // Forward scope keeps every original member and identity collision.
        const forward = scoped.snapshots.filter(row => {
          const at = row.recommended_at === null ? NaN : Date.parse(row.recommended_at);
          return !Number.isFinite(at) || at < Date.parse(training.start_at) || at >= Date.parse(training.end_at);
        });
        if (!hasAdmissibleRelativePlanSnapshotRecordingTimes(result.data.recommendation_snapshots, forward, observedAt)) {
          return { source: null, blocker: "relative_plan_result_snapshot_recording_times_invalid" };
        }
        // Frozen training originals belong to the committed model, not this
        // mutable read. Include every other scoped run, undecidable decision
        // and colliding forward key; never narrow by outcomes or enrollment.
        const forwardRuns = scoped.scanRuns.filter(row => {
          const at = Date.parse(candidateDecisionRecordFromScanRun(row)?.decision_timestamp ?? "");
          return !Number.isFinite(at) || at < Date.parse(training.start_at) || at >= Date.parse(training.end_at);
        });
        if (!hasAdmissibleRelativePlanScanRunRecordingTimes(result.data.recommendation_scan_runs, forwardRuns, observedAt)) {
          return { source: null, blocker: "relative_plan_result_scan_run_recording_times_invalid" };
        }
      }
      return { source,
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
      // Check the retained fitted source too: mutable scan rows must not erase
      // a contradiction already retained in the original sealed model. Keep
      // every relevant forward/overflow member, not only resolved/top-k ones.
      const inputConflict = await relativePlanOriginalInputConflict([
        ...model.receipt.trained_model.retained_training_source.scanRuns,
        ...scopeRelativePlanCharterResultSource(source, freeze.receipt).scanRuns,
      ]);
      if (inputConflict) return unavailable(`relative_plan_result_${inputConflict}`);
      // Recheck the original sealed training capsule, not its mutable current
      // rows. Forward admission includes every scoped member, never only top-k
      // or resolved labels. Old sealed reads/retries returned above do not replay.
      const trainingConflict = relativePlanRetainedTrainingCandleConflict(model.receipt.trained_model);
      if (trainingConflict) return unavailable(`relative_plan_result_${trainingConflict}`);
      const scoped = scopeRelativePlanCharterResultSource(source, freeze.receipt);
      const trainingWindow = freeze.receipt.plan.windows.training;
      const forwardSnapshots = scoped.snapshots.filter(row => {
        const at = row.recommended_at === null ? NaN : Date.parse(row.recommended_at);
        return !Number.isFinite(at) || at < Date.parse(trainingWindow.start_at) || at >= Date.parse(trainingWindow.end_at);
      });
      for (const outcome of scoped.outcomes) {
        // Missing/partial acquisition is already an explicit measurement gap,
        // not an assertion that original candles prove a complete label.
        if (outcome.horizon !== "60m" || outcome.provider !== "twelve_data" || outcome.source !== "intraday_candles" ||
          canonicalOutcomeProviderCoverageQuality(outcome.payload_json.canonical_provider_coverage) !== 3) continue;
        const matches = forwardSnapshots.filter(row => row.snapshot_fingerprint === outcome.snapshot_fingerprint);
        // Current training rows cannot replace the sealed fitted source. A
        // colliding forward key still stays in admission; unknown keys do too.
        if (matches.length === 0 && scoped.snapshots.some(row => row.snapshot_fingerprint === outcome.snapshot_fingerprint)) continue;
        const conflict = relativePlanRetainedOutcomeCandleConflict(matches.length === 1 ? matches[0] : undefined, outcome);
        if (conflict) return unavailable(`relative_plan_result_${conflict}`);
      }
      const candidate = buildRelativePlanCharterResult({ owner,freeze: freeze.receipt,now,source,runtime,trainedModelReceipt: model.receipt });
      if (!candidate.result) return { status: "not_ready",receipt: null,blocker: candidate.blocker };
      const envelope = { contract_version: "relative_plan_charter_result_receipt_v1" as const,
        result_id: "11111111-1111-4111-8111-111111111111",owner_user_id: owner,
        finalized_at: now.toISOString(),result: candidate.result };
      if (!relativePlanCompleteResponseFitsTransport({ status: "already_finalized",receipt: envelope,blocker: null,
        terminal_quality_decision: relativePlanTerminalQualityDecision(envelope),quality_improvement_claimed: false },
      acceptEncoding)) return { status: "not_ready",receipt: null,
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
    async finalize(owner: string,request: unknown, transport: { acceptEncoding?: string | null } = {}) {
      return present(await command(owner,request,transport.acceptEncoding));
    } };
}
