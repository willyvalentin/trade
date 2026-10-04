import { prospectiveOwner, prospectiveReceipt } from "./relative-plan-prospective";
import { prospectiveSource } from "./relative-plan-prospective-source";
import { charterRuntimeRows } from "./relative-plan-charter-runtime";
import { buildRelativePlanTrainedProbabilityModel, RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION } from "@/lib/server/relative-plan-trained-probability-model";
import { buildScannerClockPriorShadowForwardRuntimeEvidence } from "@/lib/scanner-clock-prior-shadow-forward-runtime-evidence";
import type { RelativePlanCharterRuntimeSource } from "@/lib/server/relative-plan-charter-runtime-source";

/** Complete synthetic unit source only, NOT an actual DB attestation or alpha.
 * Four tickers in one sector deliberately violate the unchanged charter. */
export async function charterEvaluationInput(rankedCount: 4 | 8 = 4,
  options: { outcomePolicy?: "current" | "retained_pre_ohlc_validation_v2"; originalInputs?: boolean } = {}) {
  const owner = prospectiveOwner, freeze = prospectiveReceipt();
  const trainingParts = await Promise.all([5, 6, 7].flatMap(day => [0, 1, 2, 3].map(n =>
    prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 17, n * 5)), rankedCount, originalInputs: options.originalInputs }))));
  const forwardParts = await Promise.all([12, 13, 14, 26, 27, 28].flatMap(day => Array.from({ length: 10 }, (_, n) =>
    prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 16, n * 15)), rankedCount, originalInputs: options.originalInputs }))));
  if (options.outcomePolicy === "retained_pre_ohlc_validation_v2") {
    // Pin the existing historical golden capsule's exact receipt shape. A
    // current acquisition policy must not rewrite that retained source or its
    // fixed model/result fingerprints. All normal new fixtures stay current.
    for (const part of [...trainingParts, ...forwardParts]) for (const outcome of part.outcomes) {
      const payload: Record<string, unknown> = outcome.payload_json;
      const coverage = payload.canonical_provider_coverage as Record<string, unknown>;
      payload.canonical_provider_coverage = Object.fromEntries(Object.entries(coverage)
        .filter(([name]) => name !== "candle_validation_policy_version"));
    }
  }
  for (const part of forwardParts) {
    const at = part.snapshots[0].recommended_at;
    const context = { contract_version: "market_regime_decision_context_v1", classifier_version: "market_regime_v1",
      captured_at: at, regime: "risk_on" };
    Object.assign(part.scanRuns[0].payload_json, { market_regime: "risk_on", market_regime_context: context });
    for (const snapshot of part.snapshots) Object.assign(snapshot.payload_json, {
      setup_type: "BREAKOUT_CONTINUATION", market_regime: "risk_on", market_regime_context: context });
  }
  const combine = (pieces: typeof trainingParts) => ({ scanRuns: pieces.flatMap(row => row.scanRuns),
    snapshots: pieces.flatMap(row => row.snapshots), outcomes: pieces.flatMap(row => row.outcomes) });
  const training = combine(trainingParts), source = combine([...trainingParts, ...forwardParts]);
  const trained = buildRelativePlanTrainedProbabilityModel({ owner, freeze, source: training,
    now: new Date("2026-10-10T00:00:00.000Z") }).trained_model!;
  const trainedModelReceipt = { contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION,
    owner_user_id: owner, materialization_id: "44444444-4444-4444-8444-444444444444",
    materialized_at: "2026-10-10T00:00:00.000Z", committed_read_at: "2026-10-10T00:00:00.001Z", trained_model: trained };
  const now = new Date("2026-11-07T00:00:00.000Z");
  const partitions = (["held_out", "walk_forward"] as const).map((partition, index) => {
    const original = forwardParts.slice(index * 30, (index + 1) * 30);
    const rows = original.map(row => charterRuntimeRows({ at: row.snapshots[0].recommended_at!, fingerprint: row.scanRuns[0].run_fingerprint }));
    const decoded = buildScannerClockPriorShadowForwardRuntimeEvidence({ ownerUserId: owner,
      observationCycleRows: rows.map(row => row.cycle), scheduledAttemptRows: rows.map(row => row.attempt) });
    if (decoded.status !== "available") throw new Error("synthetic_charter_runtime_invalid");
    return { partition, status: "available" as const, evidence: decoded.evidence,
      observation_cycle_count: 30, scheduled_attempt_count: 30, unattributed_attempt_count: 0,
      original_window: freeze.plan.windows[partition], read_as_of: now.toISOString(),
      retained_rows: { partition, observation_cycles: rows.map(row => row.cycle), scheduled_attempts: rows.map(row => row.attempt) } };
  });
  const runtime: RelativePlanCharterRuntimeSource = { status: "available", blocker: null, partitions };
  return { owner, freeze, source, now, trainedModelReceipt, runtime };
}
