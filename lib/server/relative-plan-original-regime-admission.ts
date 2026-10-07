import "server-only";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { marketRegimeDecisionContextFromPayload, marketRegimeValueFromPayload } from "@/lib/market-regime-decision-context";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { hasObservedRelativePlanRecordingTime } from "@/lib/server/relative-plan-probability-measurement";

function rawCapture(payload: Record<string, unknown>): unknown {
  const context = payload.market_regime_context;
  return context && typeof context === "object" && !Array.isArray(context)
    ? (context as Record<string, unknown>).captured_at : undefined;
}

/** NEW commands only. The legacy parser intentionally keeps its own normalized
 * clock contract. Explicit contributing originals must actually precede their
 * decision, not become observed through sub-millisecond truncation. Missing or
 * already-unqualified context keeps its existing disclosed missingness. */
export function relativePlanOriginalRegimeContextClockConflict(
  source: Pick<RecommendationLearningBaselineSource, "scanRuns" | "snapshots">,
): "original_regime_context_clock_conflicting" | null {
  const runs = new Map<string, typeof source.scanRuns>();
  for (const run of source.scanRuns) {
    const matches = runs.get(run.run_fingerprint) ?? [];
    matches.push(run); runs.set(run.run_fingerprint, matches);
  }
  for (const snapshot of source.snapshots) {
    const matches = runs.get(snapshot.scan_run_id ?? "") ?? [];
    if (matches.length !== 1) continue; // Existing lineage admission owns collisions/missing rows.
    const run = matches[0], record = candidateDecisionRecordFromScanRun(run);
    const at = Date.parse(record?.decision_timestamp ?? "");
    const runContext = marketRegimeDecisionContextFromPayload(run.payload_json);
    const snapshotContext = marketRegimeDecisionContextFromPayload(snapshot.payload_json);
    if (!Number.isFinite(at) || !runContext || !snapshotContext ||
      marketRegimeValueFromPayload(run.payload_json) !== runContext.regime ||
      marketRegimeValueFromPayload(snapshot.payload_json) !== snapshotContext.regime ||
      runContext.regime !== snapshotContext.regime || runContext.captured_at !== snapshotContext.captured_at ||
      Date.parse(snapshotContext.captured_at) > at) continue;
    const decisionAt = new Date(at);
    if (!hasObservedRelativePlanRecordingTime(rawCapture(run.payload_json), decisionAt) ||
      !hasObservedRelativePlanRecordingTime(rawCapture(snapshot.payload_json), decisionAt)) {
      return "original_regime_context_clock_conflicting";
    }
  }
  return null;
}
