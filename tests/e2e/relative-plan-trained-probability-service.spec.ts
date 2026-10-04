import { expect, test } from "@playwright/test";
import { createRelativePlanTrainedProbabilityService } from "@/lib/server/relative-plan-trained-probability-service";
import { createRelativePlanTrainedProbabilityStore } from "@/lib/server/relative-plan-trained-probability-store";
import { createRelativePlanProspectiveStore } from "@/lib/server/relative-plan-prospective-store";
import { buildRelativePlanTrainedProbabilityModel, RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION, type RelativePlanTrainedProbabilityReceipt,
  type RelativePlanTrainedProbabilityModel } from "@/lib/server/relative-plan-trained-probability-model";
import { prospectiveOwner, prospectiveReceipt } from "../fixtures/relative-plan-prospective";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";
import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { createApplicationSession, TRADE_AUTH_COOKIE } from "@/lib/application-session-core";
import { persistRecommendationScanRun } from "@/lib/server/recommendation-scan-run-persistence";
import { persistRecommendationSnapshot } from "@/lib/server/recommendation-snapshot-persistence";
import { persistRecommendationOutcome } from "@/lib/server/recommendation-outcome-persistence";
import { relativePlanCompleteHttpResponse, relativePlanCompleteResponseFitsTransport, RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES } from "@/lib/server/relative-plan-complete-http-response";
import { RELATIVE_PLAN_COMPLETE_DECODED_MAX_BYTES, RELATIVE_PLAN_COMPLETE_GZIP_MAX_BYTES } from "@/lib/server/relative-plan-complete-http-response";
import { gunzipSync } from "node:zlib";
import { randomBytes } from "node:crypto";
import { computeRecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import { buildCanonicalOutcomeProviderCoverageReceipt } from "@/lib/recommendation-outcome-canonical-coverage";
import { parseRecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { appendSyntheticOriginalArchives } from "../fixtures/original-input-archive-evidence";

const now = new Date("2026-10-10T00:00:00.000Z");
const pieces = Promise.all([5, 6, 7].flatMap(day => [0, 1, 2, 3].map(n =>
  prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 17, n * 5)) }))));
type Dependencies = NonNullable<Parameters<typeof createRelativePlanTrainedProbabilityService>[0]>;
async function harness() {
  const source = structuredClone(await pieces), freeze = prospectiveReceipt();
  const data: Record<"recommendation_scan_runs" | "recommendation_snapshots" | "recommendation_outcomes", Record<string, unknown>[]> = {
    recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [] };
  // Capture the ACTUAL writer serialization, not already-decoded domain
  // objects pretending to be database rows (counts/price aliases differ).
  const writer = { from(table: string) { return { async upsert(row: Record<string, unknown>) {
    const rows = data[table as keyof typeof data];
    const index = rows.findIndex(prior => prior.id === row.id);
    if (index < 0) rows.push(structuredClone(row));
    else rows[index] = structuredClone(row);
    return { error: null };
  } }; } };
  const priorOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    for (const part of source) {
      for (const run of part.scanRuns) expect((await persistRecommendationScanRun(run, { supabaseClient: writer, server: true })).status).toBe("saved");
      for (const snapshot of part.snapshots) expect((await persistRecommendationSnapshot(snapshot, { supabaseClient: writer, server: true })).status).toBe("saved");
      for (const outcome of part.outcomes) expect((await persistRecommendationOutcome(outcome, { supabaseClient: writer, server: true })).status).toBe("saved");
    }
  } finally {
    if (priorOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = priorOwner;
  }
  const calls: string[] = []; let receipt: RelativePlanTrainedProbabilityReceipt | null = null, confirmed = false;
  const database = {
    async read(owner: string) { calls.push("model_read"); return receipt && owner === prospectiveOwner
      ? { status: confirmed ? "available" : "pending_confirmation", receipt: confirmed ? receipt : null }
      : { status: "not_found", receipt: null }; },
    async materialize(model: RelativePlanTrainedProbabilityModel) { calls.push("materialize");
      receipt = { contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION,
        materialization_id: "44444444-4444-4444-8444-444444444444", owner_user_id: prospectiveOwner,
        materialized_at: now.toISOString(), committed_read_at: "2026-10-10T00:00:00.001Z", trained_model: model };
      return { status: "pending_confirmation", receipt: null }; },
    async confirm() { calls.push("confirm"); confirmed = true; return { status: "materialized", receipt }; },
  };
  const dependencies: Dependencies = {
    prospectiveStore: () => createRelativePlanProspectiveStore({
      async read(owner: string) { calls.push("freeze_read"); return owner === prospectiveOwner
        ? { status: "available", receipt: freeze } : { status: "not_found", receipt: null }; },
      async freeze() { throw new Error("training_cannot_freeze_a_plan"); },
    }),
    modelStore: () => createRelativePlanTrainedProbabilityStore(database),
    readSource: async owner => { expect(owner).toBe(prospectiveOwner); calls.push("source_read"); return { status: "available", data }; },
    clock: () => new Date(now),
  };
  return { data, source, calls, dependencies, database, service: createRelativePlanTrainedProbabilityService(dependencies),
    async replaceOutcome(outcome: Parameters<typeof persistRecommendationOutcome>[0]) {
      const prior = process.env.TURE_APPLICATION_OWNER_USER_ID;
      process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
      try { expect((await persistRecommendationOutcome(outcome, { supabaseClient: writer, server: true })).status).toBe("saved"); }
      finally {
        if (prior === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
        else process.env.TURE_APPLICATION_OWNER_USER_ID = prior;
      }
    },
    interruptConfirmation: () => { confirmed = false; } };
}

test("only an empty fixed-purpose request can start server-owned training", async () => {
  const h = await harness();
  for (const body of [null, [], { owner_user_id: prospectiveOwner }, { model: {} }, { now: now.toISOString() },
    { source: h.data }, { probability: 0.99 }]) expect((await h.service.train(prospectiveOwner, body)).status).toBe("invalid_request");
  expect(h.calls).toEqual([]);
});

test("new training cannot fit contradictory original inputs even on a non-top-three member", async () => {
  const h = await harness(), run = h.source[0].scanRuns[0];
  const archives = await appendSyntheticOriginalArchives(run);
  // Last original member, not selected top-three: do not silently shrink the
  // fit population to only its published or favorable observations.
  archives.dailyArchive.entries = archives.dailyArchive.entries.slice(-1);
  archives.currentArchive.entries = archives.currentArchive.entries.slice(-1);
  const row = h.data.recommendation_scan_runs.find(row => row.id === run.id)!;
  Object.assign(row.payload_json as object, run.payload_json);
  const original = JSON.stringify(h.data);
  expect(await h.service.train(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
    blocker: "trained_probability_original_input_arithmetic_conflicting" });
  expect(h.calls).not.toContain("materialize");
  expect(h.calls).not.toContain("confirm");
  expect(JSON.stringify(h.data)).toBe(original);
});

test("actual source parsing, fixed model, committed read and restarted command share one immutable receipt", async () => {
  const h = await harness();
  expect((await h.service.read(prospectiveOwner)).status).toBe("not_found");
  expect(h.calls).toEqual(["freeze_read", "model_read"]);
  const first = await h.service.train(prospectiveOwner, {});
  expect(first).toMatchObject({ status: "materialized", receipt: { trained_model: {
    original_population_count: 48, canonical_outcome_count: 48, model: { sample_count: 48 } } } });
  const restart = createRelativePlanTrainedProbabilityService({ ...h.dependencies,
    readSource: async () => { throw new Error("existing_model_cannot_refit"); }, clock: () => new Date("2026-11-07T00:00:00.000Z") });
  expect(await restart.read(prospectiveOwner)).toMatchObject({ status: "available", receipt: first.receipt });
  expect(await restart.train(prospectiveOwner, {})).toMatchObject({ status: "already_materialized", receipt: first.receipt });
  expect(h.calls.filter(call => call === "materialize")).toHaveLength(1);
  expect(h.calls.filter(call => call === "source_read")).toHaveLength(1);
});

test("lost confirmation resumes the committed capsule without reading changed source", async () => {
  const h = await harness(), first = await h.service.train(prospectiveOwner, {});
  h.interruptConfirmation();
  const restart = createRelativePlanTrainedProbabilityService({ ...h.dependencies,
    readSource: async () => { throw new Error("pending_model_cannot_refit"); } });
  expect(await restart.train(prospectiveOwner, {})).toMatchObject({ status: "materialized", receipt: first.receipt });
  expect(h.calls.filter(call => call === "materialize")).toHaveLength(1);
  expect(h.calls.filter(call => call === "source_read")).toHaveLength(1);
});

test("wrong owner and missing model storage cannot read the population or train", async () => {
  const h = await harness();
  expect((await h.service.train("33333333-3333-4333-8333-333333333333", {})).status).toBe("not_found");
  expect(h.calls).toEqual(["freeze_read"]);
  const unavailable = createRelativePlanTrainedProbabilityService({ ...h.dependencies,
    modelStore: () => createRelativePlanTrainedProbabilityStore(null) });
  expect((await unavailable.train(prospectiveOwner, {})).status).toBe("unavailable");
  expect(h.calls).not.toContain("source_read"); expect(h.calls).not.toContain("materialize");
});

test("raw recording-time gaps and late/premature jobs never become fitted evidence", async () => {
  const h = await harness();
  h.data.recommendation_outcomes[0].created_at = "2026-10-07";
  expect(await h.service.train(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
    blocker: "trained_probability_explicit_outcome_recording_times_unavailable" });
  expect(h.calls).not.toContain("materialize");
  const complete = await harness();
  for (const clock of ["2026-10-09T20:59:59.999Z", "2026-10-12T13:30:00.000Z"]) {
    const service = createRelativePlanTrainedProbabilityService({ ...complete.dependencies, clock: () => new Date(clock) });
    expect((await service.train(prospectiveOwner, {})).status).toBe("not_ready");
  }
  expect(complete.calls).not.toContain("materialize");
});

test("a fresh training job cannot seal a future or contradictory persisted outcome revision", async () => {
  for (const revision of ["2026-10-10T00:00:00.001Z", "2026-10-10T00:00:00.000001Z",
    "2026-10-05T16:00:00.000Z", undefined,
    null, "", "2026-10-07", "2026-02-30T17:00:00.000Z"]) {
    const h = await harness();
    h.data.recommendation_outcomes[0].updated_at = revision;
    const original = JSON.stringify(h.data);
    expect(await h.service.train(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
      blocker: "trained_probability_outcome_revision_times_invalid" });
    expect(h.calls).not.toContain("materialize");
    expect(h.calls).not.toContain("confirm");
    expect(JSON.stringify(h.data)).toBe(original);
  }
});

test("new training accepts exactly observed revisions and unchanged sealed jobs do not reread mutable clocks", async () => {
  for (const updated_at of [now.toISOString(), "2026-10-10T02:00:00.000000+02:00",
    "2026-10-09T23:59:59.999999Z"]) {
    const h = await harness();
    h.data.recommendation_outcomes[0].updated_at = updated_at;
    const first = await h.service.train(prospectiveOwner, {});
    expect(first).toMatchObject({ status: "materialized", receipt: { trained_model: {
      original_population_count: 48, canonical_outcome_count: 48, model: { sample_count: 48 } } } });
    h.data.recommendation_outcomes[0].updated_at = "invalid_later_mutable_history";
    const restart = createRelativePlanTrainedProbabilityService({ ...h.dependencies,
      readSource: async () => { throw new Error("sealed_model_cannot_read_current_source"); } });
    expect(await restart.train(prospectiveOwner, {})).toMatchObject({ status: "already_materialized", receipt: first.receipt });
    expect(h.calls.filter(call => call === "materialize")).toHaveLength(1);
  }
});

test("new training cannot turn a microsecond-inverted first recording into an eligible label", async () => {
  for (const recording of ["2026-10-05T18:00:00.000001Z", "2026-10-05T20:00:00.000001+02:00"]) {
    const h = await harness(), row = h.data.recommendation_outcomes[0];
    row.evaluated_at = "2026-10-05T18:00:00.000002Z";
    row.created_at = recording;
    row.updated_at = "2026-10-05T18:00:00.000003Z";
    const original = JSON.stringify(h.data);
    expect(await h.service.train(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
      blocker: "trained_probability_outcome_revision_times_invalid" });
    expect(h.calls).not.toContain("materialize");
    expect(h.calls).not.toContain("confirm");
    expect(h.data.recommendation_outcomes).toHaveLength(48);
    expect(JSON.stringify(h.data)).toBe(original);
  }
});

test("new training preserves equal or later microsecond recordings and already-missing older labels", async () => {
  for (const [recording, expected] of [["2026-10-05T18:00:00.000002Z", 48],
    ["2026-10-05T20:00:00.000003+02:00", 48], ["2026-10-05T17:59:59.999999Z", 47]] as const) {
    const h = await harness(), row = h.data.recommendation_outcomes[0];
    row.evaluated_at = "2026-10-05T18:00:00.000002Z";
    row.created_at = recording;
    row.updated_at = "2026-10-05T18:00:00.000004Z";
    const original = JSON.stringify(h.data);
    expect(await h.service.train(prospectiveOwner, {})).toMatchObject({ status: "materialized", receipt: {
      trained_model: { original_population_count: 48, canonical_outcome_count: expected,
        missing_outcome_count: 48 - expected, model: { sample_count: expected } } } });
    expect(JSON.stringify(h.data)).toBe(original);
  }
});

async function legacyCandleSource(fault: "target" | "stop" | "aligned_target") {
  const h = await harness(), snapshot = h.source[0].snapshots[0];
  const anchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot)!;
  const start = Date.parse(anchor.evaluation_anchor_start_at);
  const complete = Array.from({ length: 12 }, (_, index) => ({
    timestamp: new Date(start + index * 300000).toISOString(),
    open: 100, high: 101, low: 99, close: 100, volume: 1000,
  }));
  const event = { ...complete[1], ...(fault === "stop" ? { low: 95 } : { high: 109 }) };
  const candles = fault === "aligned_target" ? complete.map((bar, index) => index === 1 ? event : bar)
    : [...complete, { ...event, timestamp: new Date(start + 301000).toISOString() }];
  const outcome = computeRecommendationOutcome({ snapshot, horizon: "60m", evaluated_at: new Date(start + 3900000),
    candles, current_price: 100, provider: "twelve_data", source: "intraday_candles", data_completeness: "complete" }).outcome;
  const coverage = buildCanonicalOutcomeProviderCoverageReceipt({ candles, request: {
    interval: "5min", horizon: "60m", start_at: anchor.evaluation_anchor_start_at,
    end_at: new Date(start + 3900000).toISOString(), ...anchor,
  }, result: { status: "available", provider: "twelve_data" } });
  // Disclosed synthetic retained v1 claim, reproduced against actual producer
  // revision 183e70d6 in the standalone failure log. Do not relabel it as a
  // current v2 acquisition or rewrite an already sealed model's capsule.
  await h.replaceOutcome({ ...outcome, payload_json: { ...outcome.payload_json,
    canonical_provider_coverage: { ...coverage, candle_validation_policy_version: "positive_coherent_original_horizon_ohlc_v1",
      freshness: "fresh", observed_candle_count: 12, malformed_candle_count: 0, blockers: [] },
    counterfactual_candles: candles, counterfactual_candle_source: "horizon_filtered_intraday_candles",
    retained_candles_available: true, retained_candle_count: candles.length,
  } });
  return h;
}

test("a new training job cannot seal legacy target or stop labels contradicted by their retained candles", async () => {
  for (const fault of ["target", "stop"] as const) {
    const h = await legacyCandleSource(fault), before = JSON.stringify(h.data);
    expect(await h.service.train(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
      blocker: "trained_probability_retained_candle_coverage_conflicting" });
    expect(h.calls).not.toContain("materialize");
    expect(h.calls).not.toContain("confirm");
    expect(h.data.recommendation_outcomes).toHaveLength(48);
    expect(JSON.stringify(h.data)).toBe(before);
  }
});

test("valid retained legacy candles remain eligible without reducing the original training population", async () => {
  const h = await legacyCandleSource("aligned_target"), before = JSON.stringify(h.data);
  expect(await h.service.train(prospectiveOwner, {})).toMatchObject({ status: "materialized", receipt: { trained_model: {
    original_population_count: 48, canonical_outcome_count: 48, missing_outcome_count: 0, model: { sample_count: 48 },
  } } });
  expect(JSON.stringify(h.data)).toBe(before);
});

test("new training rejects a retained terminal label contradicted by otherwise complete coherent candles", async () => {
  const h = await legacyCandleSource("aligned_target");
  const row = h.data.recommendation_outcomes.find(row =>
    (row.payload_json as Record<string, unknown>).counterfactual_candles)!;
  const payload = row.payload_json as Record<string, unknown>;
  // The real producer/writer retained a target label. Remove only its observed
  // target touch: all twelve original slots remain aligned and coherent.
  expect(row.target_hit).toBe(true);
  for (const bar of payload.counterfactual_candles as Record<string, unknown>[]) bar.high = 101;
  const before = JSON.stringify(h.data);
  const result = await h.service.train(prospectiveOwner, {});
  expect({ status: result.status, blocker: result.blocker, hasReceipt: result.receipt !== null }).toEqual({
    status: "unavailable", hasReceipt: false,
    blocker: "trained_probability_retained_candle_outcome_conflicting",
  });
  expect(h.calls).not.toContain("materialize");
  expect(h.calls).not.toContain("confirm");
  expect(h.data.recommendation_outcomes).toHaveLength(48);
  expect(JSON.stringify(h.data)).toBe(before);
});

test("retained opposite-event, no-entry and event-clock contradictions cannot enter a new fitted model", async () => {
  for (const fault of ["opposite_event", "no_entry", "event_clock"] as const) {
    const h = await legacyCandleSource("aligned_target");
    const row = h.data.recommendation_outcomes.find(row =>
      (row.payload_json as Record<string, unknown>).counterfactual_candles)!;
    const bars = (row.payload_json as Record<string, unknown>).counterfactual_candles as Record<string, unknown>[];
    if (fault === "opposite_event") { bars[1].high = 101; bars[1].low = 95; }
    if (fault === "no_entry") for (const bar of bars) Object.assign(bar, { open: 98, high: 99, low: 97, close: 98 });
    if (fault === "event_clock") (row.payload_json as Record<string, unknown>).target_hit_at = bars[2].timestamp;
    const before = JSON.stringify(h.data), result = await h.service.train(prospectiveOwner, {});
    expect({ status: result.status, blocker: result.blocker, hasReceipt: result.receipt !== null }).toEqual({
      status: "unavailable", hasReceipt: false, blocker: "trained_probability_retained_candle_outcome_conflicting" });
    expect(h.calls).not.toContain("materialize"); expect(h.calls).not.toContain("confirm");
    expect(h.data.recommendation_outcomes).toHaveLength(48);
    expect(JSON.stringify(h.data)).toBe(before);
  }
});

test("contradictory retained shapes fail before fitting storage, not by discarding original members", async () => {
  const mutations: ((payload: Record<string, unknown>) => void)[] = [
    p => { p.counterfactual_candles = null; },
    p => { (p.counterfactual_candles as unknown[])[0] = null; },
    p => { (p.counterfactual_candles as unknown[])[0] = []; },
    p => { (p.counterfactual_candles as Record<string, unknown>[])[0].low = 102; },
    p => { (p.counterfactual_candles as unknown[]).push((p.counterfactual_candles as unknown[])[0]); p.retained_candle_count = 13; },
    p => { p.retained_candle_count = 11; },
    p => { p.retained_candles_available = false; },
    p => { p.counterfactual_candle_source = "unbound_source"; },
  ];
  for (const mutate of mutations) {
    const h = await legacyCandleSource("aligned_target");
    const row = h.data.recommendation_outcomes.find(row => (row.payload_json as Record<string, unknown>).counterfactual_candles)!;
    mutate(row.payload_json as Record<string, unknown>);
    const before = JSON.stringify(h.data);
    expect(await h.service.train(prospectiveOwner, {})).toMatchObject({ status: "unavailable", receipt: null,
      blocker: "trained_probability_retained_candle_coverage_conflicting" });
    expect(h.calls).not.toContain("materialize"); expect(JSON.stringify(h.data)).toBe(before);
  }
});

test("a previously sealed legacy capsule remains byte-equivalent and is never refitted from mutable candles", async () => {
  const h = await legacyCandleSource("target"), source = parseRecommendationLearningBaselineSource(h.data)!;
  // Explicit historical fixture via the unchanged pure v1 builder, not a new
  // admitted training job. It must remain decodable after admission changes.
  const legacy = buildRelativePlanTrainedProbabilityModel({ owner: prospectiveOwner, freeze: prospectiveReceipt(), source, now }).trained_model!;
  expect(legacy.original_population_count).toBe(48);
  expect((await h.database.materialize(legacy)).status).toBe("pending_confirmation");
  const historical = await h.database.confirm();
  const restart = createRelativePlanTrainedProbabilityService({ ...h.dependencies,
    readSource: async () => { throw new Error("historical_capsule_cannot_read_mutable_candles"); } });
  expect(await restart.read(prospectiveOwner)).toMatchObject({ status: "available", receipt: historical.receipt });
  expect(await restart.train(prospectiveOwner, {})).toMatchObject({ status: "already_materialized", receipt: historical.receipt });
  expect(h.calls).not.toContain("source_read"); expect(h.calls.filter(call => call === "materialize")).toHaveLength(1);
});

test("the real proxy guards anonymous, cross-owner and cross-origin model commands", async () => {
  const password = process.env.TRADE_APP_PASSWORD, owner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TRADE_APP_PASSWORD = "isolated-trained-model-session-only"; process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    const url = "http://localhost/api/app/relative-plan-trained-probability";
    for (const method of ["GET", "POST"]) expect((await proxy(new NextRequest(url, { method }))).status).toBe(401);
    const token = await createApplicationSession(); expect(token).not.toBeNull();
    expect((await proxy(new NextRequest(url, { method: "POST", headers: {
      cookie: `${TRADE_AUTH_COOKIE}=${token}`, origin: "https://foreign.invalid" } }))).status).toBe(403);
    process.env.TURE_APPLICATION_OWNER_USER_ID = "33333333-3333-4333-8333-333333333333";
    expect((await proxy(new NextRequest(url, { headers: { cookie: `${TRADE_AUTH_COOKIE}=${token}` } }))).status).toBe(401);
  } finally {
    if (password === undefined) delete process.env.TRADE_APP_PASSWORD; else process.env.TRADE_APP_PASSWORD = password;
    if (owner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID; else process.env.TURE_APPLICATION_OWNER_USER_ID = owner;
  }
});

test("the route repeats guards before parsing and never accepts raw model or database commands", () => {
  const source = readFileSync("app/api/app/relative-plan-trained-probability/route.ts", "utf8");
  expect(source.match(/await requireApplicationSession\(\)/g)).toHaveLength(2);
  expect(source).toContain('"Cache-Control": "no-store"');
  expect(source).toContain(".read(session.owner_user_id)"); expect(source).toContain(".train(session.owner_user_id,");
  const post = source.slice(source.indexOf("export async function POST"));
  expect(post.indexOf("applicationMutationForbiddenResponse(request)")).toBeLessThan(post.indexOf("request.json()"));
  expect(post.indexOf("if (!session)")).toBeLessThan(post.indexOf("request.json()"));
  expect(source).not.toMatch(/\.rpc\(|\.from\(|execute_sql|owner_user_id:/);
});

test("complete HTTP results preserve exact populations, status and no-store", async () => {
  const result = { status: "available", receipt: { id: "original" }, learning: { original_population_count: 12, missing_outcome_count: 1 } };
  const response = relativePlanCompleteHttpResponse(result, { status: 201, headers: {} });
  expect(response.status).toBe(201); expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual(result);
});

test("HTTP transport fails closed on complete UTF-8 size, never truncating members or labels", async () => {
  for (const payload of ["x".repeat(RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES),
    "é".repeat(RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES / 2)]) {
    const response = relativePlanCompleteHttpResponse({ receipt: { payload } }, { status: 200, headers: {} });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "unavailable", receipt: null, learning: null,
      blocker: "relative_plan_complete_response_exceeds_buffered_transport_limit" });
  }
  const circular: Record<string, unknown> = {}; circular.original = circular;
  expect(await relativePlanCompleteHttpResponse(circular, { status: 200, headers: {} }).json()).toMatchObject({
    status: "unavailable", receipt: null, blocker: "relative_plan_complete_response_unserializable" });
});

test("large complete JSON uses lossless negotiated gzip without expanding the buffered envelope", async () => {
  const result = { original_population: ["AAA", "BBB", "CCC", "DDD", "EEE", "FFF", "GGG", "ZZZ"],
    evidence: "é".repeat(RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES / 2) };
  for (const acceptEncoding of ["gzip", "br, GZip; q=0.5", "*"]) {
    const response = relativePlanCompleteHttpResponse(result, { status: 201, headers: {}, acceptEncoding });
    expect(response.status).toBe(201);
    expect(response.headers.get("content-encoding")).toBe("gzip");
    expect(response.headers.get("vary")).toBe("Accept-Encoding");
    expect(response.headers.get("cache-control")).toBe("no-store");
    const encoded = Buffer.from(await response.arrayBuffer());
    expect(encoded.byteLength).toBeLessThanOrEqual(RELATIVE_PLAN_COMPLETE_GZIP_MAX_BYTES);
    expect(encoded.toString("base64").length).toBeLessThan(6_000_000);
    expect(JSON.parse(gunzipSync(encoded).toString("utf8"))).toEqual(result);
  }
  for (const acceptEncoding of [null, "", "br", "gzip;q=0, *;q=1", "gzip;q=0.000", "gzip;q=2", "gzip;q=bad", "gzip;q=1,gzip;q=0"]) {
    expect(relativePlanCompleteHttpResponse(result, { status: 200, headers: {}, acceptEncoding }).status).toBe(503);
  }
});

test("gzip never bypasses independent decoded and compressed bounds", async () => {
  const decodedOverflow = { evidence: "x".repeat(RELATIVE_PLAN_COMPLETE_DECODED_MAX_BYTES) };
  const incompressible = { evidence: randomBytes(RELATIVE_PLAN_COMPLETE_GZIP_MAX_BYTES + 1048576).toString("base64") };
  for (const result of [decodedOverflow, incompressible]) {
    expect(relativePlanCompleteResponseFitsTransport(result, "gzip")).toBe(false);
    const response = relativePlanCompleteHttpResponse(result, { status: 200, headers: {}, acceptEncoding: "gzip" });
    expect(response.status).toBe(503);
    expect(response.headers.get("content-encoding")).toBeNull();
    expect(await response.json()).toMatchObject({ receipt: null, blocker: "relative_plan_complete_response_exceeds_buffered_transport_limit" });
  }
});
