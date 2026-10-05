import { expect,test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRelativePlanCharterResultService } from "@/lib/server/relative-plan-charter-result-service";
import { createRelativePlanCharterResultStore } from "@/lib/server/relative-plan-charter-result-store";
import { createRelativePlanProspectiveStore } from "@/lib/server/relative-plan-prospective-store";
import { createRelativePlanTrainedProbabilityStore } from "@/lib/server/relative-plan-trained-probability-store";
import { prospectiveOwner,prospectiveReceipt } from "../fixtures/relative-plan-prospective";
import { charterEvaluationInput } from "../fixtures/relative-plan-charter-evaluation";
import { persistRecommendationScanRun } from "@/lib/server/recommendation-scan-run-persistence";
import { persistRecommendationSnapshot } from "@/lib/server/recommendation-snapshot-persistence";
import { persistRecommendationOutcome } from "@/lib/server/recommendation-outcome-persistence";
import { appendSyntheticOriginalArchives } from "../fixtures/original-input-archive-evidence";
import { buildRelativePlanTrainedProbabilityModel } from "@/lib/server/relative-plan-trained-probability-model";
import { RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION, type RelativePlanCharterResultReceipt } from "@/lib/server/relative-plan-charter-result";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import { computeRecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { buildCanonicalOutcomeProviderCoverageReceipt } from "@/lib/recommendation-outcome-canonical-coverage";
import { relativePlanRetainedOutcomeCandleConflict } from "@/lib/server/relative-plan-retained-outcome-admission";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";
import { buildRelativePlanProspectiveEnrollment } from "@/lib/server/relative-plan-prospective-enrollment";
import { parseRecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import type { buildScannerCurrentInputArchive } from "@/lib/server/scanner-current-input-archive";

async function retainedForwardHarness(index = 103) {
  const input = await charterEvaluationInput(8), outcome = input.source.outcomes[index];
  const snapshot = input.source.snapshots.find(row => row.snapshot_fingerprint === outcome.snapshot_fingerprint)!;
  const decision = candidateDecisionRecordFromScanRun(input.source.scanRuns.find(row => row.run_fingerprint === snapshot.scan_run_id)!)!;
  expect(decision.candidates.find(row => row.candidate_id === snapshot.payload_json.candidate_id)!.ranking!.rank).toBeGreaterThan(3);
  const anchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot)!;
  const candles = Array.from({ length: 12 }, (_, bar) => ({
    timestamp: new Date(Date.parse(anchor.evaluation_anchor_start_at) + bar * 300000).toISOString(),
    open: 100, high: outcome.target_hit ? 109 : 101, low: outcome.target_hit ? 99 : 95,
    close: outcome.target_hit ? 108 : 96, volume: 1000,
  }));
  Object.assign(outcome.payload_json, { counterfactual_candles: candles,
    counterfactual_candle_source: "horizon_filtered_intraday_candles",
    retained_candles_available: true, retained_candle_count: candles.length });
  const data: Record<string, Record<string, unknown>[]> = {
    recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [],
  };
  const writer = { from(table: string) { return { async upsert(row: Record<string, unknown>) {
    data[table].push(structuredClone(row)); return { error: null };
  } }; } };
  const oldOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    for (const run of input.source.scanRuns) await persistRecommendationScanRun(run, { supabaseClient: writer, server: true });
    for (const row of input.source.snapshots) await persistRecommendationSnapshot(row, { supabaseClient: writer, server: true });
    for (const row of input.source.outcomes) await persistRecommendationOutcome(row, { supabaseClient: writer, server: true });
  } finally {
    if (oldOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = oldOwner;
  }
  const payload = data.recommendation_outcomes[index].payload_json as Record<string, unknown>;
  return { input, data, payload };
}

test("NEW terminal command cannot seal an invalid raw runtime recording source", async () => {
  const base = await retainedForwardHarness();
  let writes = 0;
  const h = harness({ clock: () => new Date(base.input.now),
    resultStore: () => createRelativePlanCharterResultStore({ async read() { return { status: "not_found", receipt: null }; },
      async finalize() { writes++; throw new Error("future_runtime_must_not_be_sealed"); } }),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: base.input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data: base.data }),
    readRuntime: async () => ({ status: "unavailable", partitions: null,
      blocker: "relative_plan_runtime_source_recording_times_invalid" }),
  });
  const before = JSON.stringify(base.data);
  const result = await h.service.finalize(prospectiveOwner, {});
  expect(writes).toBe(0);
  expect(result).toMatchObject({ status: "unavailable", receipt: null,
    blocker: "relative_plan_runtime_source_recording_times_invalid", terminal_quality_decision: null });
  expect(JSON.stringify(base.data)).toBe(before);
});

test("generic missing runtime retains truthful incomplete-result semantics without changing the original cohort", async () => {
  const base = await retainedForwardHarness();
  let writes = 0;
  let stored: RelativePlanCharterResultReceipt | null = null;
  const h = harness({ clock: () => new Date(base.input.now),
    resultStore: () => createRelativePlanCharterResultStore({ async read() {
      return { status: stored ? "available" : "not_found", receipt: stored }; },
      async finalize(result) { writes++; stored = {
        contract_version: RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION,
        result_id: "55555555-5555-4555-8555-555555555555", owner_user_id: prospectiveOwner,
        finalized_at: base.input.now.toISOString(), result }; return { status: "finalized", receipt: stored }; } }),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: base.input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data: base.data }),
    readRuntime: async () => ({ status: "unavailable", partitions: null, blocker: "relative_plan_runtime_source_read_failed" }),
  });
  const before = JSON.stringify(base.data);
  const result = await h.service.finalize(prospectiveOwner, {});
  expect(result).toMatchObject({ status: "finalized", quality_improvement_claimed: false,
    receipt: { result: { measurement: { evidence_complete: false, computed_disposition: "evidence_incomplete",
      partitions: [{ original_population_count: 240 }, { original_population_count: 240 }] } } } });
  expect(writes).toBe(1); expect(JSON.stringify(base.data)).toBe(before);
});

for (const measurement of ["current", "eod_fallback"] as const) {
test(`NEW terminal admission rejects ${measurement} neither-hit R that contradicts the retained original horizon close`, async () => {
  test.setTimeout(120000);
  const base = await retainedForwardHarness(103);
  const original = base.input.source.outcomes[103];
  const snapshot = base.input.source.snapshots.find(row => row.snapshot_fingerprint === original.snapshot_fingerprint)!;
  const bars = (base.payload.counterfactual_candles as Record<string, unknown>[]).map(row => ({ ...row,
    timestamp: String(row.timestamp), open: 100, high: 101, low: 99, close: 100.5 }));
  const neither = computeRecommendationOutcome({ snapshot, horizon: "60m", evaluated_at: original.evaluated_at,
    candles: bars, current_price: 100.5, provider: "twelve_data", source: "intraday_candles",
    data_completeness: "complete" }).outcome;
  expect(neither.status).toBe("neither_hit");
  const row = base.data.recommendation_outcomes[103];
  Object.assign(row, { status: neither.status, entry_triggered: true, target_hit: false, stop_hit: false,
    first_terminal_event: "neither" });
  Object.assign(base.payload, { entry_triggered_at: neither.entry_triggered_at, target_hit_at: null, stop_hit_at: null,
    current_price: measurement === "current" ? 100.5 : null,
    current_r: measurement === "current" ? 9 : null, counterfactual_candles: bars });
  if (measurement === "eod_fallback") Object.assign(row, { eod_price: 100.5, eod_r: 9 });
  const before = JSON.stringify(base.data);
  let writes = 0;
  const h = harness({ clock: () => new Date(base.input.now),
    resultStore: () => createRelativePlanCharterResultStore({ async read() { return { status: "not_found", receipt: null }; },
      async finalize() { writes++; throw new Error("contradictory_R_must_not_be_sealed"); } }),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: base.input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data: base.data }), readRuntime: async () => base.input.runtime,
  });
  const result = await h.service.finalize(prospectiveOwner, {});
  expect(writes).toBe(0);
  expect(result).toMatchObject({ status: "unavailable", receipt: null,
    blocker: "relative_plan_result_retained_candle_realized_r_conflicting" });
  expect(JSON.stringify(base.data)).toBe(before);
  expect(base.data.recommendation_snapshots).toHaveLength(576);
});
}

test("retained horizon R admission preserves honest positive, negative and missing measurements without relabelling", async () => {
  const base = await retainedForwardHarness(103), original = base.input.source.outcomes[103];
  const snapshot = base.input.source.snapshots.find(row => row.snapshot_fingerprint === original.snapshot_fingerprint)!;
  for (const close of [100.5, 99.25, 100]) {
    const candles = (base.payload.counterfactual_candles as Record<string, unknown>[]).map(row => ({ ...row,
      timestamp: String(row.timestamp), open: 100, high: 101, low: 99, close }));
    const result = computeRecommendationOutcome({ snapshot, horizon: "60m", evaluated_at: original.evaluated_at,
      candles, current_price: close, provider: "twelve_data", source: "intraday_candles",
      data_completeness: "complete" }).outcome;
    const retained = { ...result, payload_json: { ...base.payload, counterfactual_candles: candles } };
    const before = JSON.stringify(retained);
    expect(retained.status).toBe("neither_hit");
    expect(relativePlanRetainedOutcomeCandleConflict(snapshot, retained)).toBeNull();
    expect(relativePlanRetainedOutcomeCandleConflict(snapshot, { ...retained, current_r: null })).toBeNull();
    expect(relativePlanRetainedOutcomeCandleConflict(snapshot, { ...retained,
      current_price: close + 0.1 })).toBe("retained_candle_realized_r_conflicting");
    expect(relativePlanRetainedOutcomeCandleConflict(snapshot, { ...retained,
      current_r: retained.current_r! + 1 })).toBe("retained_candle_realized_r_conflicting");
    const fallback = { ...retained, current_price: null, current_r: null,
      eod_price: close, eod_r: retained.current_r };
    expect(relativePlanRetainedOutcomeCandleConflict(snapshot, fallback)).toBeNull();
    expect(relativePlanRetainedOutcomeCandleConflict(snapshot, { ...fallback,
      eod_price: close + 0.1 })).toBe("retained_candle_realized_r_conflicting");
    expect(relativePlanRetainedOutcomeCandleConflict(snapshot, { ...fallback,
      eod_r: retained.current_r! + 1 })).toBe("retained_candle_realized_r_conflicting");
    expect(relativePlanRetainedOutcomeCandleConflict(snapshot, { ...fallback, eod_r: null })).toBeNull();
    expect(relativePlanRetainedOutcomeCandleConflict(snapshot, { ...retained,
      eod_price: close + 1, eod_r: 9 })).toBeNull(); // Current (including zero) wins.
    const legacy = { ...retained, payload_json: {} };
    expect(relativePlanRetainedOutcomeCandleConflict(snapshot, legacy)).toBeNull();
    expect(JSON.stringify(retained)).toBe(before);
  }
});

test("all original forward members reject retained coverage, opposite-event and event-clock contradictions", async () => {
  test.setTimeout(120000);
  const base = await retainedForwardHarness(343); // Walk-forward, outside top three.
  for (const fault of ["off_grid", "duplicate", "shape", "count", "opposite_event", "event_clock"] as const) {
    const data = structuredClone(base.data), payload = data.recommendation_outcomes[343].payload_json as Record<string, unknown>;
    const bars = payload.counterfactual_candles as Record<string, unknown>[];
    if (fault === "off_grid") bars[0].timestamp = new Date(Date.parse(String(bars[0].timestamp)) + 1000).toISOString();
    if (fault === "duplicate") { bars.push(bars[0]); payload.retained_candle_count = bars.length; }
    if (fault === "shape") bars[0].low = 110;
    if (fault === "count") payload.retained_candle_count = 11;
    if (fault === "opposite_event") for (const bar of bars) Object.assign(bar, { high: 101, low: 95, close: 96 });
    if (fault === "event_clock") payload.target_hit_at = bars[1].timestamp;
    const before = JSON.stringify(data), h = harness({ clock: () => new Date(base.input.now),
      modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
        return { status: "available", receipt: base.input.trainedModelReceipt };
      }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
      readSource: async () => ({ status: "available", data }), readRuntime: async () => base.input.runtime,
    });
    expect(await h.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
      blocker: `relative_plan_result_retained_candle_${fault === "opposite_event" || fault === "event_clock" ? "outcome" : "coverage"}_conflicting` });
    expect(h.calls.writes).toBe(0); expect(JSON.stringify(data)).toBe(before);
    expect(data.recommendation_snapshots).toHaveLength(576);
  }
});

test("valid retained original candles finalize once and sealed retries never consult mutable candles", async () => {
  test.setTimeout(120000);
  const { input, data } = await retainedForwardHarness();
  // A later mutable training row cannot replace the sealed original model.
  Object.assign(data.recommendation_outcomes[7].payload_json as Record<string, unknown>, {
    counterfactual_candles: [], retained_candles_available: true, retained_candle_count: 0,
    counterfactual_candle_source: "horizon_filtered_intraday_candles",
  });
  const trainingRun = data.recommendation_scan_runs.find(row =>
    Date.parse(String(row.observed_at)) < Date.parse(input.freeze.plan.windows.training.end_at))!;
  trainingRun.created_at = "2026-11-07T00:00:00.000001Z";
  trainingRun.updated_at = trainingRun.created_at;
  const before = JSON.stringify(data);
  let stored: RelativePlanCharterResultReceipt | null = null, writes = 0;
  const resultStore = () => createRelativePlanCharterResultStore({ async read() {
    return { status: stored ? "available" : "not_found", receipt: stored };
  }, async finalize(result) {
    writes++;
    stored = { contract_version: RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION,
      result_id: "55555555-5555-4555-8555-555555555555", owner_user_id: input.owner,
      finalized_at: input.now.toISOString(), result };
    return { status: "finalized", receipt: stored };
  } });
  const h = harness({ clock: () => new Date(input.now), resultStore,
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data }), readRuntime: async () => input.runtime,
  });
  expect(await h.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "finalized", quality_improvement_claimed: false });
  expect(writes).toBe(1); expect(JSON.stringify(data)).toBe(before);
  const retained = JSON.stringify(stored);
  const restart = harness({ resultStore, readSource: async () => { throw new Error("sealed_result_must_not_read_mutable_candles"); } });
  expect(await restart.service.read(prospectiveOwner)).toMatchObject({ status: "available", receipt: stored });
  expect(await restart.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "already_finalized", receipt: stored });
  expect(writes).toBe(1); expect(JSON.stringify(stored)).toBe(retained);
});

test("a new terminal result cannot hide contradictory candles retained only in the sealed training model", async () => {
  const { input, data } = await retainedForwardHarness(7);
  const outcome = input.source.outcomes[7];
  const bars = (outcome.payload_json as Record<string, unknown>).counterfactual_candles as Record<string, unknown>[];
  for (const bar of bars) Object.assign(bar, { high: 101, close: 100 });
  const trained = buildRelativePlanTrainedProbabilityModel({ owner: input.owner, freeze: input.freeze,
    source: input.source, now: new Date("2026-10-10T00:00:00.000Z") }).trained_model!;
  expect(trained.original_population_count).toBe(96);
  const h = harness({ clock: () => new Date(input.now),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: { ...input.trainedModelReceipt, trained_model: trained } };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data }), readRuntime: async () => input.runtime,
  });
  const before = JSON.stringify(data), capsule = JSON.stringify(trained);
  expect(await h.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
    blocker: "relative_plan_result_retained_candle_outcome_conflicting" });
  expect(h.calls.writes).toBe(0); expect(JSON.stringify(data)).toBe(before);
  expect(JSON.stringify(trained)).toBe(capsule);
});

test("truthful missing forward candles remain an incomplete measurement, not a contradiction or reduced cohort", async () => {
  test.setTimeout(120000);
  const { input, data } = await retainedForwardHarness();
  const snapshot = input.source.snapshots[103], original = input.source.outcomes[103];
  const anchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot)!;
  const missing = computeRecommendationOutcome({ snapshot, horizon: "60m", evaluated_at: original.evaluated_at,
    candles: [], provider: "twelve_data", source: "intraday_candles", data_completeness: "incomplete" }).outcome;
  const coverage = buildCanonicalOutcomeProviderCoverageReceipt({ candles: [], request: {
    interval: "5min", horizon: "60m", ...anchor, start_at: anchor.evaluation_anchor_start_at,
    end_at: new Date(Date.parse(anchor.evaluation_anchor_start_at) + 3600000).toISOString(),
  }, result: { status: "missing_candles", provider: "twelve_data" } });
  const writer = { from() { return { async upsert(row: Record<string, unknown>) {
    data.recommendation_outcomes[103] = structuredClone(row); return { error: null };
  } }; } };
  const oldOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    await persistRecommendationOutcome({ ...original, ...missing, id: original.id,
      payload_json: { ...missing.payload_json, canonical_provider_coverage: coverage,
        counterfactual_candles: [], counterfactual_candle_source: "horizon_filtered_intraday_candles",
        retained_candles_available: false, retained_candle_count: 0 } }, { supabaseClient: writer, server: true });
  } finally {
    if (oldOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = oldOwner;
  }
  const before = JSON.stringify(data);
  let writes = 0;
  let stored: RelativePlanCharterResultReceipt | null = null;
  const h = harness({ clock: () => new Date(input.now),
    resultStore: () => createRelativePlanCharterResultStore({ async read() {
      return { status: stored ? "available" : "not_found", receipt: stored };
    },
      async finalize(result) {
        writes++;
        stored = { contract_version: RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION,
          result_id: "55555555-5555-4555-8555-555555555555", owner_user_id: input.owner,
          finalized_at: input.now.toISOString(), result };
        return { status: "finalized", receipt: stored };
      } }),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data }), readRuntime: async () => input.runtime,
  });
  expect(await h.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "finalized",
    receipt: { result: { measurement: { evidence_complete: false, computed_disposition: "evidence_incomplete",
      partitions: [{ original_population_count: 240 }, { original_population_count: 240 }] } } },
    quality_improvement_claimed: false });
  expect(writes).toBe(1); expect(JSON.stringify(data)).toBe(before);
});

test("new terminal results reject retained forward candles that contradict an original non-top-three label", async () => {
  const input = await charterEvaluationInput(8), outcome = input.source.outcomes[103];
  const snapshot = input.source.snapshots.find(row => row.snapshot_fingerprint === outcome.snapshot_fingerprint)!;
  const decision = candidateDecisionRecordFromScanRun(input.source.scanRuns.find(row => row.run_fingerprint === snapshot.scan_run_id)!)!;
  expect(decision.candidates.find(row => row.candidate_id === snapshot.payload_json.candidate_id)!.ranking!.rank).toBeGreaterThan(3);
  const anchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot)!;
  const candles = Array.from({ length: 12 }, (_, index) => ({
    timestamp: new Date(Date.parse(anchor.evaluation_anchor_start_at) + index * 300000).toISOString(),
    open: 100, high: 101, low: 99, close: 100, volume: 1000,
  }));
  expect(outcome.target_hit).toBe(true);
  expect(computeRecommendationOutcome({ snapshot, horizon: "60m", evaluated_at: outcome.evaluated_at,
    candles, current_price: outcome.current_price, provider: outcome.provider, source: outcome.source,
    data_completeness: "complete" }).outcome.target_hit).toBe(false);
  Object.assign(outcome.payload_json, { counterfactual_candles: candles,
    counterfactual_candle_source: "horizon_filtered_intraday_candles",
    retained_candles_available: true, retained_candle_count: candles.length });
  const data: Record<string, Record<string, unknown>[]> = {
    recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [],
  };
  const writer = { from(table: string) { return { async upsert(row: Record<string, unknown>) {
    data[table].push(structuredClone(row)); return { error: null };
  } }; } };
  const originalOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    for (const run of input.source.scanRuns) await persistRecommendationScanRun(run, { supabaseClient: writer, server: true });
    for (const row of input.source.snapshots) await persistRecommendationSnapshot(row, { supabaseClient: writer, server: true });
    for (const row of input.source.outcomes) await persistRecommendationOutcome(row, { supabaseClient: writer, server: true });
  } finally {
    if (originalOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = originalOwner;
  }
  const before = JSON.stringify(data);
  const h = harness({ clock: () => new Date(input.now),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data }), readRuntime: async () => input.runtime,
  });
  const result = await h.service.finalize(prospectiveOwner, {});
  expect(h.calls.writes).toBe(0);
  expect(result).toMatchObject({ status: "unavailable", receipt: null,
    blocker: "relative_plan_result_retained_candle_outcome_conflicting", terminal_quality_decision: null });
  expect(input.source.scanRuns).toHaveLength(72);
  expect(input.source.snapshots).toHaveLength(576);
  expect(JSON.stringify(data)).toBe(before);
});

type Dependencies = NonNullable<Parameters<typeof createRelativePlanCharterResultService>[0]>;
function harness(overrides: Partial<Dependencies> = {}) {
  const calls = { source:0,runtime:0,model:0,writes:0,owners:[] as string[] };
  const d: Dependencies = {
    prospectiveStore: () => createRelativePlanProspectiveStore({ async read(owner) { calls.owners.push(owner);
      return owner === prospectiveOwner ? { status:"available",receipt:prospectiveReceipt() } : { status:"not_found",receipt:null }; },
      async freeze() { throw new Error("result_command_must_not_freeze"); } }),
    resultStore: () => createRelativePlanCharterResultStore({ async read() { return { status:"not_found",receipt:null }; },
      async finalize() { calls.writes++; throw new Error("unexpected_write"); } }),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() { calls.model++;return { status:"not_found",receipt:null }; },
      async materialize() { throw new Error("result_command_must_not_train"); },async confirm() { throw new Error("result_command_must_not_confirm"); } }),
    readSource: async () => { calls.source++;throw new Error("unexpected_source"); },
    readRuntime: async () => { calls.runtime++;throw new Error("unexpected_runtime"); },
    clock: () => new Date("2026-10-12T17:00:00.000Z"),...overrides,
  };
  return { calls,service:createRelativePlanCharterResultService(d) };
}
test("caller cannot submit clocks, models, sources, metrics, owners or authority",async () => {
  const h = harness();
  for (const request of [null,[],"",{ source_as_of:"2026-11-07T00:00:00.000Z" },{ owner_user_id:prospectiveOwner },
    { result:{} },{ model:{} },{ source:{} },{ authority:{ promotion:true } }]) {
    expect((await h.service.finalize(prospectiveOwner,request)).status).toBe("invalid_request");
  }
  expect(h.calls).toEqual({ source:0,runtime:0,model:0,writes:0,owners:[] });
});
test("GET is read-only and a missing owner freeze prevents result, model or source work",async () => {
  const h = harness(),other = "33333333-3333-4333-8333-333333333333";
  expect(await h.service.read(prospectiveOwner)).toMatchObject({ status:"not_found",terminal_quality_decision:null,quality_improvement_claimed:false });
  expect((await h.service.read(other)).status).toBe("not_found");
  expect((await h.service.finalize(other,{})).status).toBe("not_found");
  expect(h.calls).toEqual({ source:0,runtime:0,model:0,writes:0,owners:[prospectiveOwner,other,other] });
});
test("real maturity and a committed model are mandatory before complete source acquisition",async () => {
  const early = harness();
  expect((await early.service.finalize(prospectiveOwner,{})).status).toBe("not_ready");
  expect(early.calls.model).toBe(0);
  const missingModel = harness({ clock:()=>new Date("2026-11-07T00:00:00.000Z") });
  expect((await missingModel.service.finalize(prospectiveOwner,{})).status).toBe("not_ready");
  expect(missingModel.calls.model).toBe(1);
  for (const h of [early,missingModel]) expect([h.calls.source,h.calls.runtime,h.calls.writes]).toEqual([0,0,0]);
  const invalidClock = harness({ clock:()=>new Date(NaN) });
  expect((await invalidClock.service.finalize(prospectiveOwner,{})).status).toBe("not_ready");
  expect([invalidClock.calls.source,invalidClock.calls.runtime,invalidClock.calls.model,invalidClock.calls.writes]).toEqual([0,0,0,0]);
});
test("ambiguous or unavailable storage cannot become no-result permission to recompute and write",async () => {
  const h = harness({ resultStore:()=>createRelativePlanCharterResultStore({
    async read() { throw new Error("private_database_credentials"); },async finalize() { throw new Error("unexpected_write"); } }) });
  for (const result of [await h.service.read(prospectiveOwner),await h.service.finalize(prospectiveOwner,{})]) {
    expect(result).toMatchObject({ status:"unavailable",receipt:null,terminal_quality_decision:null });
    expect(JSON.stringify(result)).not.toContain("private_database_credentials");
  }
  expect([h.calls.source,h.calls.runtime,h.calls.model,h.calls.writes]).toEqual([0,0,0,0]);
});
test("native fixed-purpose result route repeats session and mutation-origin guards with complete no-store transport",()=> {
  const source = readFileSync("app/api/app/relative-plan-charter-result/route.ts","utf8");
  expect(source.match(/requireApplicationSession\(\)/g)).toHaveLength(2);
  expect(source).toContain("applicationMutationForbiddenResponse(request)");
  expect(source).toContain("relativePlanCompleteHttpResponse");
  expect(source).toContain('"Cache-Control": "no-store"');
  expect(source).not.toMatch(/getServerSupabaseClient|provider|scheduled|broker|request\.headers\.get\("owner/);
});

test("new terminal results reject unobserved raw revisions on the initial read and on the stable reread", async () => {
  const input = await charterEvaluationInput();
  const data: Record<string, Record<string, unknown>[]> = {
    recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [],
  };
  const writer = { from(table: string) { return { async upsert(row: Record<string, unknown>) {
    data[table].push(structuredClone(row)); return { error: null };
  } }; } };
  const originalOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    for (const run of input.source.scanRuns) expect((await persistRecommendationScanRun(run, { supabaseClient: writer, server: true })).status).toBe("saved");
    for (const snapshot of input.source.snapshots) expect((await persistRecommendationSnapshot(snapshot, { supabaseClient: writer, server: true })).status).toBe("saved");
    for (const outcome of input.source.outcomes) expect((await persistRecommendationOutcome(outcome, { supabaseClient: writer, server: true })).status).toBe("saved");
  } finally {
    if (originalOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = originalOwner;
  }
  const originalBytes = JSON.stringify(data);
  for (const fault of ["future_revision", "inverted_recording"] as const) for (const faultRead of [1, 2]) {
    let reads = 0, runtimeReads = 0;
    const h = harness({ clock: () => new Date(input.now),
      modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
        return { status: "available", receipt: input.trainedModelReceipt };
      }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
      readSource: async () => {
        reads++; const copy = structuredClone(data);
        if (reads === faultRead) {
          const row = copy.recommendation_outcomes[0];
          if (fault === "future_revision") row.updated_at = "2026-11-07T00:00:00.000001Z";
          else {
            const prefix = String(row.evaluated_at).slice(0, 19);
            row.evaluated_at = `${prefix}.000002Z`;
            row.created_at = `${prefix}.000001Z`;
            row.updated_at = `${prefix}.000003Z`;
          }
        }
        return { status: "available", data: copy };
      }, readRuntime: async () => { runtimeReads++; return input.runtime; },
    });
    expect(await h.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
      blocker: "relative_plan_result_outcome_revision_times_invalid", terminal_quality_decision: null });
    expect(reads).toBe(faultRead);
    expect(runtimeReads).toBe(faultRead - 1);
    expect(h.calls.writes).toBe(0);
    expect(data.recommendation_outcomes).toHaveLength(input.source.outcomes.length);
    expect(JSON.stringify(data)).toBe(originalBytes);
  }
});

test("new terminal result cannot seal an original forward scan recorded after source-as-of", async () => {
  test.setTimeout(120000);
  const base = await retainedForwardHarness(103);
  const snapshot = base.input.source.snapshots[103];
  const run = base.data.recommendation_scan_runs.find(row => row.run_fingerprint === snapshot.scan_run_id)!;
  const after = new Date(base.input.now.getTime() + 1).toISOString();
  run.created_at = after; run.updated_at = after;
  const before = JSON.stringify(base.data);
  const h = harness({ clock: () => new Date(base.input.now),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: base.input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data: base.data }), readRuntime: async () => base.input.runtime,
  });
  const result = await h.service.finalize(prospectiveOwner, {});
  expect(h.calls.writes).toBe(0);
  expect(result).toMatchObject({ status: "unavailable", receipt: null,
    blocker: "relative_plan_result_scan_run_recording_times_invalid" });
  expect(JSON.stringify(base.data)).toBe(before);
});

test("new terminal result checks raw scan clocks on both complete source reads", async () => {
  test.setTimeout(120000);
  const base = await retainedForwardHarness(343);
  const snapshot = base.input.source.snapshots[343];
  const index = base.data.recommendation_scan_runs.findIndex(row => row.run_fingerprint === snapshot.scan_run_id);
  expect(index).toBeGreaterThanOrEqual(0);
  const original = JSON.stringify(base.data);
  for (const clocks of [
    { created_at: undefined }, { updated_at: undefined },
    { updated_at: "2026-11-07T00:00:00.000001Z" },
    { created_at: "2026-11-02T17:00:00.000002Z", updated_at: "2026-11-02T17:00:00.000001Z" },
  ]) for (const faultRead of [1, 2]) {
    let reads = 0, runtimeReads = 0;
    const h = harness({ clock: () => new Date(base.input.now),
      modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
        return { status: "available", receipt: base.input.trainedModelReceipt };
      }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
      readSource: async () => {
        reads++; const copy = structuredClone(base.data);
        if (reads === faultRead) Object.assign(copy.recommendation_scan_runs[index], clocks);
        return { status: "available", data: copy };
      }, readRuntime: async () => { runtimeReads++; return base.input.runtime; },
    });
    expect(await h.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
      blocker: "relative_plan_result_scan_run_recording_times_invalid" });
    expect(h.calls.writes).toBe(0); expect(reads).toBe(faultRead); expect(runtimeReads).toBe(faultRead - 1);
    expect(JSON.stringify(base.data)).toBe(original); expect(base.data.recommendation_snapshots).toHaveLength(576);
  }
});

test("a late-recorded original overflow decision cannot escape new result admission through the first-thirty limit", async () => {
  test.setTimeout(120000);
  const base = await retainedForwardHarness(343);
  const extra = await prospectiveSource({ now: new Date("2026-10-29T16:00:00.000Z"), rankedCount: 8 });
  const writer = { from(table: string) { return { async upsert(row: Record<string, unknown>) {
    base.data[table].push(structuredClone(row)); return { error: null };
  } }; } };
  const priorOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    for (const run of extra.scanRuns) expect((await persistRecommendationScanRun(run, { supabaseClient: writer, server: true })).status).toBe("saved");
    for (const row of extra.snapshots) expect((await persistRecommendationSnapshot(row, { supabaseClient: writer, server: true })).status).toBe("saved");
    for (const row of extra.outcomes) expect((await persistRecommendationOutcome(row, { supabaseClient: writer, server: true })).status).toBe("saved");
  } finally {
    if (priorOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = priorOwner;
  }
  const source = parseRecommendationLearningBaselineSource(base.data)!;
  const walk = buildRelativePlanProspectiveEnrollment({ owner: prospectiveOwner, freeze: base.input.freeze,
    source, now: base.input.now })!.partitions[2];
  expect(walk.enrolled_decision_count).toBe(30); expect(walk.overflow_decision_count).toBe(1);
  expect(walk.overflow_fingerprints).toEqual([extra.scanRuns[0].run_fingerprint]);
  const original = base.data.recommendation_scan_runs.find(row => row.run_fingerprint === extra.scanRuns[0].run_fingerprint)!;
  original.created_at = "2026-11-07T00:00:00.000001Z"; original.updated_at = original.created_at;
  const before = JSON.stringify(base.data);
  const h = harness({ clock: () => new Date(base.input.now),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: base.input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data: base.data }), readRuntime: async () => base.input.runtime,
  });
  expect(await h.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
    blocker: "relative_plan_result_scan_run_recording_times_invalid" });
  expect(h.calls.writes).toBe(0); expect(h.calls.runtime).toBe(0);
  expect(base.data.recommendation_scan_runs).toHaveLength(73);
  expect(base.data.recommendation_snapshots).toHaveLength(584);
  expect(JSON.stringify(base.data)).toBe(before);
});

test("new terminal result cannot seal a forward snapshot recorded after source-as-of", async () => {
  test.setTimeout(120000);
  const base = await retainedForwardHarness(103);
  const row = base.data.recommendation_snapshots[103];
  const after = new Date(base.input.now.getTime() + 1).toISOString();
  row.created_at = after; row.updated_at = after;
  const before = JSON.stringify(base.data);
  const h = harness({ clock: () => new Date(base.input.now),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: base.input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data: base.data }), readRuntime: async () => base.input.runtime,
  });
  const result = await h.service.finalize(prospectiveOwner, {});
  expect(h.calls.writes).toBe(0);
  expect(result.blocker).toBe("relative_plan_result_snapshot_recording_times_invalid");
  expect(result.receipt).toBeNull();
  expect(JSON.stringify(base.data)).toBe(before);
});

test("new terminal result checks raw forward snapshot clocks on both complete source reads", async () => {
  test.setTimeout(120000);
  const base = await retainedForwardHarness(343); // Walk-forward, outside top three.
  const original = JSON.stringify(base.data);
  for (const clocks of [
    { created_at: undefined }, { updated_at: undefined },
    { updated_at: "2026-11-07T00:00:00.000001Z" },
    { created_at: "2026-11-02T17:00:00.000002Z", updated_at: "2026-11-02T17:00:00.000001Z" },
  ]) for (const faultRead of [1, 2]) {
    let reads = 0, runtimeReads = 0;
    const h = harness({ clock: () => new Date(base.input.now),
      modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
        return { status: "available", receipt: base.input.trainedModelReceipt };
      }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
      readSource: async () => {
        reads++; const copy = structuredClone(base.data);
        if (reads === faultRead) Object.assign(copy.recommendation_snapshots[343], clocks);
        return { status: "available", data: copy };
      }, readRuntime: async () => { runtimeReads++; return base.input.runtime; },
    });
    const result = await h.service.finalize(prospectiveOwner, {});
    expect(h.calls.writes).toBe(0);
    expect(result.status).toBe("unavailable");
    expect(result.blocker).toBe("relative_plan_result_snapshot_recording_times_invalid");
    expect(result.receipt).toBeNull();
    expect(reads).toBe(faultRead); expect(runtimeReads).toBe(faultRead - 1);
    expect(base.data.recommendation_snapshots).toHaveLength(576);
    expect(JSON.stringify(base.data)).toBe(original);
  }
});

test("new terminal results cannot call contradictory original forward inputs complete evidence", async () => {
  const input = await charterEvaluationInput(8);
  await appendSyntheticOriginalArchives(input.source.scanRuns[12]);
  const data: Record<string, Record<string, unknown>[]> = {
    recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [],
  };
  const writer = { from(table: string) { return { async upsert(row: Record<string, unknown>) {
    data[table].push(structuredClone(row)); return { error: null };
  } }; } };
  const originalOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    for (const run of input.source.scanRuns) await persistRecommendationScanRun(run, { supabaseClient: writer, server: true });
    for (const snapshot of input.source.snapshots) await persistRecommendationSnapshot(snapshot, { supabaseClient: writer, server: true });
    for (const outcome of input.source.outcomes) await persistRecommendationOutcome(outcome, { supabaseClient: writer, server: true });
  } finally {
    if (originalOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = originalOwner;
  }
  const original = JSON.stringify(data);
  const h = harness({ clock: () => new Date(input.now),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data }), readRuntime: async () => input.runtime,
  });
  expect(await h.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
    blocker: "relative_plan_result_original_input_arithmetic_conflicting", terminal_quality_decision: null });
  expect(h.calls.writes).toBe(0);
  expect(JSON.stringify(data)).toBe(original);
  expect(input.source.scanRuns).toHaveLength(72);
  expect(input.source.snapshots).toHaveLength(576);
});

test("new full-original terminal commands reject normalized forward clocks before an immutable result is stored", async () => {
  test.setTimeout(120000);
  const input = await charterEvaluationInput(8, { originalInputs: true });
  const archive = (input.source.scanRuns[12].payload_json as Record<string, unknown>)
    .scanner_current_input_archive as NonNullable<ReturnType<typeof buildScannerCurrentInputArchive>>;
  expect(archive.entries).toHaveLength(8);
  archive.entries[7].current_context.captured_at = archive.entries[7].current_context.captured_at.replace(".000Z", ".000001Z");
  const data: Record<string, Record<string, unknown>[]> = {
    recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [],
  };
  const writer = { from(table: string) { return { async upsert(row: Record<string, unknown>) {
    data[table].push(structuredClone(row)); return { error: null };
  } }; } };
  const originalOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    for (const run of input.source.scanRuns) await persistRecommendationScanRun(run, { supabaseClient: writer, server: true });
    for (const snapshot of input.source.snapshots) await persistRecommendationSnapshot(snapshot, { supabaseClient: writer, server: true });
    for (const outcome of input.source.outcomes) await persistRecommendationOutcome(outcome, { supabaseClient: writer, server: true });
  } finally {
    if (originalOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = originalOwner;
  }
  const original = JSON.stringify(data), model = JSON.stringify(input.trainedModelReceipt);
  const h = harness({ clock: () => new Date(input.now),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data }), readRuntime: async () => input.runtime,
  });
  expect(await h.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
    blocker: "relative_plan_result_original_input_evidence_invalid", terminal_quality_decision: null });
  expect(h.calls.writes).toBe(0);
  expect(data.recommendation_scan_runs).toHaveLength(72);
  expect(data.recommendation_snapshots).toHaveLength(576);
  expect(JSON.stringify(data)).toBe(original);
  expect(JSON.stringify(input.trainedModelReceipt)).toBe(model);
});

test("a new result also rejects an original contradiction retained only in the sealed training capsule", async () => {
  const input = await charterEvaluationInput(8), archived = structuredClone(input.source);
  await appendSyntheticOriginalArchives(archived.scanRuns[0]);
  // The pure historical v1 capsule builder keeps its original semantics. A
  // newly admitted terminal command must not hide this evidence merely because
  // the current owned source no longer has the archive.
  const trained = buildRelativePlanTrainedProbabilityModel({ owner: input.owner, freeze: input.freeze,
    source: archived, now: new Date("2026-10-10T00:00:00.000Z") }).trained_model!;
  expect(trained.original_population_count).toBe(96);
  const data: Record<string, Record<string, unknown>[]> = {
    recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [],
  };
  const writer = { from(table: string) { return { async upsert(row: Record<string, unknown>) {
    data[table].push(structuredClone(row)); return { error: null };
  } }; } };
  const originalOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    for (const run of input.source.scanRuns) await persistRecommendationScanRun(run, { supabaseClient: writer, server: true });
    for (const snapshot of input.source.snapshots) await persistRecommendationSnapshot(snapshot, { supabaseClient: writer, server: true });
    for (const outcome of input.source.outcomes) await persistRecommendationOutcome(outcome, { supabaseClient: writer, server: true });
  } finally {
    if (originalOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = originalOwner;
  }
  const h = harness({ clock: () => new Date(input.now),
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: { ...input.trainedModelReceipt, trained_model: trained } };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data }), readRuntime: async () => input.runtime,
  });
  const original = JSON.stringify(data), capsule = JSON.stringify(trained);
  expect(await h.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
    blocker: "relative_plan_result_original_input_arithmetic_conflicting", terminal_quality_decision: null });
  expect(h.calls.writes).toBe(0);
  expect(JSON.stringify(data)).toBe(original);
  expect(JSON.stringify(trained)).toBe(capsule);
});

test("new full-original terminal commands require supported lossless transport before immutable writes", async () => {
  test.setTimeout(180000);
  const input = await charterEvaluationInput(8, { originalInputs: true });
  const data: Record<string, Record<string, unknown>[]> = {
    recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [],
  };
  const writer = { from(table: string) { return { async upsert(row: Record<string, unknown>) {
    data[table].push(structuredClone(row)); return { error: null };
  } }; } };
  const originalOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    for (const run of input.source.scanRuns) await persistRecommendationScanRun(run, { supabaseClient: writer, server: true });
    for (const snapshot of input.source.snapshots) await persistRecommendationSnapshot(snapshot, { supabaseClient: writer, server: true });
    for (const outcome of input.source.outcomes) await persistRecommendationOutcome(outcome, { supabaseClient: writer, server: true });
  } finally {
    if (originalOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = originalOwner;
  }
  const original = JSON.stringify(data);
  let stored: RelativePlanCharterResultReceipt | null = null, writes = 0;
  const resultStore = () => createRelativePlanCharterResultStore({ async read() {
    return { status: stored ? "available" : "not_found", receipt: stored };
  }, async finalize(result) {
    writes++;
    stored = { contract_version: RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION,
      result_id: "55555555-5555-4555-8555-555555555555", owner_user_id: input.owner,
      finalized_at: input.now.toISOString(), result };
    return { status: "finalized", receipt: stored };
  } });
  const h = harness({ clock: () => new Date(input.now), resultStore,
    modelStore: () => createRelativePlanTrainedProbabilityStore({ async read() {
      return { status: "available", receipt: input.trainedModelReceipt };
    }, async materialize() { throw new Error("must_not_refit"); }, async confirm() { throw new Error("must_not_confirm"); } }),
    readSource: async () => ({ status: "available", data }), readRuntime: async () => input.runtime,
  });
  expect(await h.service.finalize(prospectiveOwner, {})).toMatchObject({ status: "not_ready", receipt: null,
    blocker: "relative_plan_complete_result_response_too_large" });
  expect(writes).toBe(0); expect(stored).toBeNull();
  // A body field cannot select transport or bypass the fixed-purpose command.
  expect((await h.service.finalize(prospectiveOwner, { acceptEncoding: "gzip" })).status).toBe("invalid_request");
  expect(writes).toBe(0);
  const accepted = await h.service.finalize(prospectiveOwner, {}, { acceptEncoding: "gzip" });
  expect(accepted.status, accepted.blocker ?? "").toBe("finalized");
  expect(writes).toBe(1);
  expect(accepted.receipt?.result.measurement.partitions.map(p => p.original_population_count)).toEqual([240, 240]);
  expect(accepted.receipt?.result.trained_model_receipt.trained_model.original_population_count).toBe(96);
  expect(JSON.stringify(data)).toBe(original);
  const restart = harness({ resultStore,
    readSource: async () => { throw new Error("sealed_result_cannot_read_current_source"); } });
  expect((await restart.service.finalize(prospectiveOwner, {})).receipt).toEqual(accepted.receipt);
  expect((await restart.service.read(prospectiveOwner)).receipt).toEqual(accepted.receipt);
  expect(writes).toBe(1);
});
