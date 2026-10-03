import { expect, test } from "@playwright/test";
import { createRelativePlanTrainedProbabilityService } from "@/lib/server/relative-plan-trained-probability-service";
import { createRelativePlanTrainedProbabilityStore } from "@/lib/server/relative-plan-trained-probability-store";
import { createRelativePlanProspectiveStore } from "@/lib/server/relative-plan-prospective-store";
import { RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION, type RelativePlanTrainedProbabilityReceipt,
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
import { relativePlanCompleteHttpResponse, RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES } from "@/lib/server/relative-plan-complete-http-response";
import { RELATIVE_PLAN_COMPLETE_DECODED_MAX_BYTES, RELATIVE_PLAN_COMPLETE_GZIP_MAX_BYTES } from "@/lib/server/relative-plan-complete-http-response";
import { gunzipSync } from "node:zlib";
import { randomBytes } from "node:crypto";

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
    data[table as keyof typeof data].push(structuredClone(row)); return { error: null };
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
  return { data, calls, dependencies, database, service: createRelativePlanTrainedProbabilityService(dependencies),
    interruptConfirmation: () => { confirmed = false; } };
}

test("only an empty fixed-purpose request can start server-owned training", async () => {
  const h = await harness();
  for (const body of [null, [], { owner_user_id: prospectiveOwner }, { model: {} }, { now: now.toISOString() },
    { source: h.data }, { probability: 0.99 }]) expect((await h.service.train(prospectiveOwner, body)).status).toBe("invalid_request");
  expect(h.calls).toEqual([]);
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
    const response = relativePlanCompleteHttpResponse(result, { status: 200, headers: {}, acceptEncoding: "gzip" });
    expect(response.status).toBe(503);
    expect(response.headers.get("content-encoding")).toBeNull();
    expect(await response.json()).toMatchObject({ receipt: null, blocker: "relative_plan_complete_response_exceeds_buffered_transport_limit" });
  }
});
