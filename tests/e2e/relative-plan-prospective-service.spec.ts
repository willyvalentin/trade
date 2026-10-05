import { expect, test } from "@playwright/test";
import { createRelativePlanProspectiveService } from "@/lib/server/relative-plan-prospective-service";
import { createRelativePlanProspectiveStore } from "@/lib/server/relative-plan-prospective-store";
import { createRelativePlanTrainedProbabilityStore } from "@/lib/server/relative-plan-trained-probability-store";
import { createRelativePlanCharterResultStore } from "@/lib/server/relative-plan-charter-result-store";
import { prospectiveOwner, prospectiveFrozenAt, prospectiveInput, prospectiveReceipt } from "../fixtures/relative-plan-prospective";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { createApplicationSession, TRADE_AUTH_COOKIE } from "@/lib/application-session-core";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";
import { persistRecommendationScanRun } from "@/lib/server/recommendation-scan-run-persistence";
import { persistRecommendationSnapshot } from "@/lib/server/recommendation-snapshot-persistence";
import { persistRecommendationOutcome } from "@/lib/server/recommendation-outcome-persistence";

type Dependencies = NonNullable<Parameters<typeof createRelativePlanProspectiveService>[0]>;
function harness(overrides: Partial<Dependencies> = {}) {
  let receipt: ReturnType<typeof prospectiveReceipt> | null = null;
  let writes = 0;
  const owners: string[] = [];
  const database = {
    async read(owner: string) { return receipt && owner === receipt.owner_user_id
      ? { status: "available", receipt: structuredClone(receipt) } : { status: "not_found", receipt: null }; },
    async freeze(plan: ReturnType<typeof prospectiveReceipt>["plan"]) {
      writes++; receipt = { ...prospectiveReceipt(), plan }; return { status: "frozen", receipt };
    },
  };
  const dependencies: Dependencies = {
    store: () => createRelativePlanProspectiveStore(database),
    revision: () => prospectiveInput.source_revision,
    readRuntime: async () => ({ status: "unavailable", partitions: null, blocker: "synthetic_runtime_not_provided" }),
    resultStore: () => createRelativePlanCharterResultStore({ async read() { return { status: "not_found",receipt: null }; },
      async finalize() { throw new Error("read_must_not_finalize"); } }),
    modelStore: () => createRelativePlanTrainedProbabilityStore({
      async read() { return { status: "not_found", receipt: null }; },
      async materialize() { throw new Error("read_must_not_train"); },
      async confirm() { throw new Error("read_must_not_confirm"); },
    }),
    readSource: async owner => { owners.push(owner); return { status: "available", data: {
      recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [] } }; },
    ...overrides,
  };
  return { dependencies, service: createRelativePlanProspectiveService(dependencies), writes: () => writes, owners };
}

test("only future windows are caller selectable; owner, revision, charter and authority remain server-owned", async () => {
  const h = harness();
  for (const request of [null, [], {}, { windows: prospectiveInput.windows, owner_user_id: prospectiveOwner },
    { windows: prospectiveInput.windows, source_revision: prospectiveInput.source_revision },
    { windows: prospectiveInput.windows, authority: { publication: true } }]) {
    expect((await h.service.freeze(prospectiveOwner, request, new Date(prospectiveFrozenAt))).status).toBe("invalid_request");
  }
  expect(h.writes()).toBe(0);
  const result = await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
  expect(result.status).toBe("frozen");
  expect(result.receipt?.plan.source_revision).toEqual(prospectiveInput.source_revision);
  expect(Object.values(result.receipt!.plan.authority).every(value => value === false)).toBe(true);
});

test("missing packaged deployment identity cannot manufacture a freeze", async () => {
  const h = harness({ revision: () => null });
  expect((await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt))).status).toBe("unavailable");
  expect(h.writes()).toBe(0);
});

test("read-only service restart preserves the immutable plan and uses only the trusted owner's complete source", async () => {
  const h = harness();
  expect((await h.service.read(prospectiveOwner)).status).toBe("not_found");
  expect(h.owners).toEqual([]);
  const frozen = await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
  const read = await createRelativePlanProspectiveService(h.dependencies).read(prospectiveOwner, new Date("2026-11-07T00:00:00.000Z"));
  expect(read.status).toBe("available");
  expect(read.receipt).toEqual(frozen.receipt);
  expect(read.learning?.status).toBe("evidence_incomplete");
  expect(read.learning?.partitions.every(row => row.enrolled_decision_count === 0)).toBe(true);
  expect(h.owners).toEqual([prospectiveOwner]);
  expect((await h.service.read("33333333-3333-4333-8333-333333333333")).status).toBe("not_found");
  expect(h.owners).toEqual([prospectiveOwner]);
  expect(h.writes()).toBe(1);
});

test("failed, truncated or malformed original-source reads do not substitute a legacy or synthetic population", async () => {
  const failures: Dependencies["readSource"][] = [
    async () => ({ status: "failed" }),
    async () => { throw new Error("private transport details"); },
    async () => ({ status: "available", data: { recommendation_scan_runs: [{}], recommendation_snapshots: [], recommendation_outcomes: [] } }),
    async () => ({ status: "available", data: { recommendation_scan_runs: [], recommendation_snapshots: [] } }),
  ];
  for (const readSource of failures) {
    const h = harness({ readSource });
    await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
    const result = await h.service.read(prospectiveOwner);
    expect(result).toMatchObject({ status: "unavailable", receipt: null, learning: null,
      blocker: "prospective_complete_owned_learning_source_unavailable" });
    expect(JSON.stringify(result)).not.toContain("private transport details");
    expect(h.writes()).toBe(1);
  }
});

test("raw persisted outcome clocks are checked before a legacy decoder can manufacture recording times", async () => {
  for (const clock of [undefined, null, "", "2026-10-12", "2026-02-30T17:00:00.000Z"]) {
    const h = harness({ readSource: async () => ({ status: "available", data: {
      recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [
        { evaluated_at: "2026-10-12T18:00:00.000Z", created_at: clock },
      ],
    } }) });
    await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
    expect(await h.service.read(prospectiveOwner)).toMatchObject({ status: "unavailable", receipt: null, learning: null,
      blocker: "prospective_explicit_outcome_recording_times_unavailable" });
    expect(h.writes()).toBe(1);
  }
});

test("unfinalized prospective read cannot measure a revision that was not observed at its as-of clock", async () => {
  const source = await prospectiveSource();
  const data: Record<string, Record<string, unknown>[]> = {
    recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [],
  };
  const writer = { from(table: string) { return { async upsert(row: Record<string, unknown>) {
    data[table].push(structuredClone(row)); return { error: null };
  } }; } };
  const originalOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    for (const run of source.scanRuns) expect((await persistRecommendationScanRun(run, { supabaseClient: writer, server: true })).status).toBe("saved");
    for (const snapshot of source.snapshots) expect((await persistRecommendationSnapshot(snapshot, { supabaseClient: writer, server: true })).status).toBe("saved");
    for (const outcome of source.outcomes) expect((await persistRecommendationOutcome(outcome, { supabaseClient: writer, server: true })).status).toBe("saved");
  } finally {
    if (originalOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = originalOwner;
  }
  const h = harness({ readSource: async () => ({ status: "available", data }) });
  await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
  const now = new Date("2026-11-07T00:00:00.000Z");
  const original = await h.service.read(prospectiveOwner, now);
  expect(original.learning?.partitions[1]).toMatchObject({ original_population_count: 4, canonical_outcome_count: 4 });
  for (const updatedAt of ["2026-11-07T00:00:00.001Z", "2026-11-07T00:00:00.000001Z",
    "2026-10-12T16:00:00.000Z", undefined, null, "", "2026-02-30T17:00:00.000Z"]) {
    const saved = data.recommendation_outcomes[0].updated_at;
    data.recommendation_outcomes[0].updated_at = updatedAt;
    const bytes = JSON.stringify(data);
    expect(await createRelativePlanProspectiveService(h.dependencies).read(prospectiveOwner, now)).toMatchObject({
      status: "unavailable", receipt: null, learning: null,
      blocker: "prospective_outcome_revision_times_invalid",
    });
    expect(JSON.stringify(data)).toBe(bytes);
    expect(data.recommendation_outcomes).toHaveLength(4);
    data.recommendation_outcomes[0].updated_at = saved;
  }
  expect(await h.service.read(prospectiveOwner, now)).toEqual(original);
  expect(h.writes()).toBe(1);
});

test("runtime reads occur only after a trusted owner freeze and complete source and cannot train or expose private errors", async () => {
  const requests: Parameters<Dependencies["readRuntime"]>[0][] = [];
  const h = harness({ readRuntime: async request => { requests.push(request); throw new Error("private_transport_details"); } });
  expect((await h.service.read(prospectiveOwner)).status).toBe("not_found");
  expect(requests).toEqual([]);
  await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
  const now = new Date("2026-11-07T00:00:00.000Z"), result = await h.service.read(prospectiveOwner, now);
  expect(result.status).toBe("available");
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({ owner: prospectiveOwner, freeze: prospectiveReceipt(), now });
  expect(result.learning?.full_charter.computed_disposition).toBe("evidence_incomplete");
  expect(result.learning?.full_charter.missing_dimensions).toContain("held_out_relative_plan_runtime_source_read_failed");
  expect(JSON.stringify(result)).not.toContain("private_transport_details");
  expect((await h.service.read("33333333-3333-4333-8333-333333333333", now)).status).toBe("not_found");
  expect(requests).toHaveLength(1);
  expect(h.writes()).toBe(1);
});

test("original source writers, immutable freeze and restarted canonical learner share the exact isolated owner population", () => {
  test.setTimeout(90000);
  const result = spawnSync(process.execPath, ["scripts/relative-plan-prospective-runtime-proof.mjs"], {
    encoding: "utf8", timeout: 85000, env: { ...process.env } });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const receipt = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(receipt).toMatchObject({ status: "pass", actual_source_persistence_and_restarted_learner: true,
    actual_product_probability_consumer_verified: true, calibration_training_population: 48,
    held_out_probability_population: 12, walk_forward_probability_population: 12,
    prior_36_sample_incomplete_with_three_unknown_probabilities: true,
    missing_label_retained_in_12_original_population: true, later_forward_labels_never_fit_model: true,
    persisted_late_training_label_excluded: true, persisted_future_forward_recording_retained_as_missing: true,
    retained_original_population: 4, missing_outcome_progression: [4, 1, 0], concurrent_single_owner_freeze: true,
    malformed_ohlc_synthetic_requests: 5, persisted_malformed_terminal_labels_retained_as_missing: true,
    off_grid_synthetic_requests: 2,
    original_other_outcomes_unchanged: true,
    full_charter_decision: "evidence_incomplete", provider_requests: 0, production_changes: 0,
    broker_actions: 0, quality_improvement_verified: false });
  expect(receipt.malformed_ohlc_cases.map((row: { fault: string }) => row.fault)).toEqual([
    "winning_close_above_high", "winning_open_above_high", "losing_negative_close",
    "losing_close_below_low", "losing_inverted_range",
  ]);
  for (const row of receipt.malformed_ohlc_cases) {
    expect(row).toMatchObject({ original_population_count: 4, canonical_outcome_count: 3,
      missing_outcome_count: 1, quality_improvement_claimed: false });
  }
  expect(receipt.off_grid_cases.map((row: { fault: string }) => row.fault)).toEqual(["off_grid_target", "off_grid_stop"]);
  for (const row of receipt.off_grid_cases) expect(row).toMatchObject({ original_population_count: 4,
    canonical_outcome_count: 3, missing_outcome_count: 1, quality_improvement_claimed: false });
});

test("the real proxy rejects anonymous, cross-owner and cross-origin comparison requests before command work", async () => {
  const originalPassword = process.env.TRADE_APP_PASSWORD, originalOwner = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TRADE_APP_PASSWORD = "isolated-prospective-session-test-only";
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    const url = "http://localhost/api/app/relative-plan-prospective-comparison";
    for (const method of ["GET", "POST"]) {
      const response = await proxy(new NextRequest(url, { method }));
      expect(response.status).toBe(401);
      expect(response.headers.get("cache-control")).toBe("no-store");
    }
    const token = await createApplicationSession(); expect(token).not.toBeNull();
    const forbidden = await proxy(new NextRequest(url, { method: "POST", headers: {
      cookie: `${TRADE_AUTH_COOKIE}=${token}`, origin: "https://foreign.invalid" } }));
    expect(forbidden.status).toBe(403);
    process.env.TURE_APPLICATION_OWNER_USER_ID = "33333333-3333-4333-8333-333333333333";
    expect((await proxy(new NextRequest(url, { headers: { cookie: `${TRADE_AUTH_COOKIE}=${token}` } }))).status).toBe(401);
  } finally {
    if (originalPassword === undefined) delete process.env.TRADE_APP_PASSWORD; else process.env.TRADE_APP_PASSWORD = originalPassword;
    if (originalOwner === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID; else process.env.TURE_APPLICATION_OWNER_USER_ID = originalOwner;
  }
});

test("the fixed-purpose route repeats session/origin guards and never accepts caller owners or raw SQL", () => {
  const source = readFileSync("app/api/app/relative-plan-prospective-comparison/route.ts", "utf8");
  expect(source.match(/await requireApplicationSession\(\)/g)).toHaveLength(2);
  expect(source).toContain('"Cache-Control": "no-store"');
  expect(source).toContain(".read(session.owner_user_id)");
  expect(source).toContain(".freeze(session.owner_user_id,");
  const post = source.slice(source.indexOf("export async function POST"));
  expect(post.indexOf("applicationMutationForbiddenResponse(request)")).toBeLessThan(post.indexOf("request.json()"));
  expect(post.indexOf("if (!session)")).toBeLessThan(post.indexOf("request.json()"));
  expect(source).not.toContain("owner_user_id:");
  expect(source).not.toMatch(/\.rpc\(|\.from\(|execute_sql/);
});
