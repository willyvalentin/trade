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
import { charterEvaluationInput } from "../fixtures/relative-plan-charter-evaluation";
import { buildRelativePlanCharterResult, RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION } from "@/lib/server/relative-plan-charter-result";

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

async function serializedOriginalSource() {
  const source = await prospectiveSource();
  const data: Record<string, Record<string, unknown>[]> = {
    recommendation_scan_runs: [], recommendation_snapshots: [], recommendation_outcomes: [],
  };
  const writer = { from(table: string) { return { async upsert(row: Record<string, unknown>) {
    data[table].push(structuredClone(row)); return { error: null };
  } }; } };
  const previous = process.env.TURE_APPLICATION_OWNER_USER_ID;
  process.env.TURE_APPLICATION_OWNER_USER_ID = prospectiveOwner;
  try {
    for (const run of source.scanRuns) expect((await persistRecommendationScanRun(run, { supabaseClient: writer, server: true })).status).toBe("saved");
    for (const snapshot of source.snapshots) expect((await persistRecommendationSnapshot(snapshot, { supabaseClient: writer, server: true })).status).toBe("saved");
    for (const outcome of source.outcomes) expect((await persistRecommendationOutcome(outcome, { supabaseClient: writer, server: true })).status).toBe("saved");
  } finally {
    if (previous === undefined) delete process.env.TURE_APPLICATION_OWNER_USER_ID;
    else process.env.TURE_APPLICATION_OWNER_USER_ID = previous;
  }
  return data;
}

test("unfinalized read cannot count an original scan recorded after its source-as-of", async () => {
  const data = await serializedOriginalSource();
  let runtimeReads = 0;
  const h = harness({ readSource: async () => ({ status: "available", data }), readRuntime: async () => {
    runtimeReads++; return { status: "unavailable", partitions: null, blocker: "synthetic_runtime_not_provided" };
  } });
  await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
  const now = new Date("2026-11-07T00:00:00.000Z");
  expect((await h.service.read(prospectiveOwner, now)).learning?.partitions[1]).toMatchObject({
    enrolled_decision_count: 1, original_population_count: 4, canonical_outcome_count: 4,
  });
  const run = data.recommendation_scan_runs[0];
  run.created_at = "2026-11-07T00:00:00.001Z"; run.updated_at = run.created_at;
  const before = JSON.stringify(data);
  expect(await createRelativePlanProspectiveService(h.dependencies).read(prospectiveOwner, now)).toMatchObject({
    status: "unavailable", receipt: null, learning: null, blocker: "prospective_scan_run_recording_times_invalid",
  });
  expect(JSON.stringify(data)).toBe(before);
  expect(data.recommendation_scan_runs).toHaveLength(1);
  expect(data.recommendation_outcomes).toHaveLength(4);
  expect(runtimeReads).toBe(1); expect(h.writes()).toBe(1);
});

test("mutable original scan admission preserves exact clocks and rejects missing, reversed and colliding revisions", async () => {
  const data = await serializedOriginalSource();
  const h = harness({ readSource: async () => ({ status: "available", data }) });
  await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
  const now = new Date("2026-11-07T00:00:00.000Z"), original = structuredClone(data.recommendation_scan_runs[0]);
  for (const clocks of [
    { created_at: undefined }, { updated_at: undefined }, { created_at: null },
    { created_at: "2026-10-12" }, { created_at: "2026-02-30T17:00:00.000Z" },
    { created_at: "2026-11-07T00:00:00.000001Z", updated_at: "2026-11-07T00:00:00.000001Z" },
    { created_at: "2026-10-12T17:00:00.000002Z", updated_at: "2026-10-12T17:00:00.000001Z" },
    { updated_at: "2026-11-07T00:00:00.000001Z" },
  ]) {
    data.recommendation_scan_runs[0] = { ...original, ...clocks };
    const before = JSON.stringify(data);
    expect(await h.service.read(prospectiveOwner, now)).toMatchObject({ status: "unavailable", receipt: null, learning: null,
      blocker: "prospective_scan_run_recording_times_invalid" });
    expect(JSON.stringify(data)).toBe(before); expect(data.recommendation_outcomes).toHaveLength(4);
  }
  for (const clock of [now.toISOString(), "2026-11-06T19:00:00.000000-05:00"]) {
    data.recommendation_scan_runs[0] = { ...original, created_at: clock, updated_at: clock };
    const before = JSON.stringify(data);
    expect((await h.service.read(prospectiveOwner, now)).learning?.partitions[1]).toMatchObject({
      enrolled_decision_count: 1, original_population_count: 4, canonical_outcome_count: 4 });
    expect(JSON.stringify(data)).toBe(before);
  }
  data.recommendation_scan_runs[0] = original;
  data.recommendation_scan_runs.push({ ...original, updated_at: "2026-11-07T00:00:00.000001Z" });
  const collision = JSON.stringify(data);
  expect((await h.service.read(prospectiveOwner, now)).blocker).toBe("prospective_scan_run_recording_times_invalid");
  expect(JSON.stringify(data)).toBe(collision);
  expect(h.writes()).toBe(1);
});

test("unfinalized read cannot count an original snapshot recorded after its source-as-of", async () => {
  const data = await serializedOriginalSource();
  let runtimeReads = 0;
  const h = harness({ readSource: async () => ({ status: "available", data }), readRuntime: async () => {
    runtimeReads++; return { status: "unavailable", partitions: null, blocker: "synthetic_runtime_not_provided" };
  } });
  await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
  const now = new Date("2026-11-07T00:00:00.000Z");
  expect((await h.service.read(prospectiveOwner, now)).learning?.partitions[1]).toMatchObject({
    original_population_count: 4, canonical_outcome_count: 4,
  });
  const row = data.recommendation_snapshots[0];
  row.created_at = "2026-11-07T00:00:00.001Z"; row.updated_at = row.created_at;
  const before = JSON.stringify(data);
  expect(await createRelativePlanProspectiveService(h.dependencies).read(prospectiveOwner, now)).toMatchObject({
    status: "unavailable", receipt: null, learning: null, blocker: "prospective_snapshot_recording_times_invalid",
  });
  expect(JSON.stringify(data)).toBe(before);
  expect(data.recommendation_snapshots).toHaveLength(4);
  expect(runtimeReads).toBe(1);
  expect(h.writes()).toBe(1);
});

test("complete current source rejects raw snapshot-clock gaps, submillisecond futures and collisions without losing originals", async () => {
  const data = await serializedOriginalSource();
  const h = harness({ readSource: async () => ({ status: "available", data }) });
  await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
  const now = new Date("2026-11-07T00:00:00.000Z");
  const expected = await h.service.read(prospectiveOwner, now);
  const original = structuredClone(data.recommendation_snapshots[3]);
  const changes = [
    { created_at: undefined }, { updated_at: undefined }, { created_at: null },
    { created_at: "2026-10-12" }, { created_at: "2026-02-30T17:00:00.000Z" },
    { created_at: "2026-11-07T00:00:00.000001Z", updated_at: "2026-11-07T00:00:00.000001Z" },
    { created_at: "2026-10-12T17:00:00.000002Z", updated_at: "2026-10-12T17:00:00.000001Z" },
    { updated_at: "2026-11-07T00:00:00.000001Z" },
  ];
  for (const changed of changes) {
    data.recommendation_snapshots[3] = { ...original, ...changed };
    const before = JSON.stringify(data);
    expect(await createRelativePlanProspectiveService(h.dependencies).read(prospectiveOwner, now)).toMatchObject({
      status: "unavailable", receipt: null, learning: null, blocker: "prospective_snapshot_recording_times_invalid",
    });
    expect(JSON.stringify(data)).toBe(before);
    expect(data.recommendation_snapshots).toHaveLength(4);
  }
  data.recommendation_snapshots[3] = original;
  data.recommendation_snapshots.push({ ...original, created_at: "2026-11-07T00:00:00.001Z",
    updated_at: "2026-11-07T00:00:00.001Z" });
  const collision = JSON.stringify(data);
  expect((await h.service.read(prospectiveOwner, now)).blocker).toBe("prospective_snapshot_recording_times_invalid");
  expect(JSON.stringify(data)).toBe(collision);
  data.recommendation_snapshots.pop();
  expect(await h.service.read(prospectiveOwner, now)).toEqual(expected);
  expect(h.writes()).toBe(1);
});

test("current source accepts equal as-of and explicit offset clocks without caching later mutations", async () => {
  const data = await serializedOriginalSource();
  const h = harness({ readSource: async () => ({ status: "available", data }) });
  await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
  const now = new Date("2026-11-07T00:00:00.000Z");
  for (const clock of [now.toISOString(), "2026-11-06T19:00:00.000000-05:00"]) {
    data.recommendation_snapshots[0].created_at = clock;
    data.recommendation_snapshots[0].updated_at = clock;
    const before = JSON.stringify(data);
    expect((await h.service.read(prospectiveOwner, now)).learning?.partitions[1]).toMatchObject({
      original_population_count: 4, canonical_outcome_count: 4,
    });
    expect(JSON.stringify(data)).toBe(before);
  }
  data.recommendation_snapshots[0].updated_at = "2026-11-07T00:00:00.000001Z";
  expect((await h.service.read(prospectiveOwner, now)).blocker).toBe("prospective_snapshot_recording_times_invalid");
  expect(h.writes()).toBe(1);
});

test("a finalized prospective read still replays its original capsule without sampling mutable snapshot clocks", async () => {
  test.setTimeout(120000);
  const input = await charterEvaluationInput();
  const result = buildRelativePlanCharterResult(input).result;
  expect(result).not.toBeNull();
  const receipt = { contract_version: RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION,
    result_id: "55555555-5555-4555-8555-555555555555", owner_user_id: input.owner,
    finalized_at: input.now.toISOString(), result };
  const original = JSON.stringify(receipt);
  let mutableReads = 0;
  const h = harness({
    resultStore: () => createRelativePlanCharterResultStore({ async read() { return { status: "available", receipt }; },
      async finalize() { throw new Error("read_must_not_finalize"); } }),
    readSource: async () => { mutableReads++; throw new Error("mutable_originals_are_not_the_terminal_source"); },
    readRuntime: async () => { mutableReads++; throw new Error("retained_runtime_required"); },
    modelStore: () => { mutableReads++; throw new Error("sealed_model_required"); },
  });
  await h.service.freeze(prospectiveOwner, { windows: prospectiveInput.windows }, new Date(prospectiveFrozenAt));
  const first = await h.service.read(prospectiveOwner, new Date("2026-11-08T00:00:00.000Z"));
  expect(first).toMatchObject({ status: "available", learning: { status: "evaluated",
    terminal_quality_decision: { disposition: "reject", quality_improvement_claimed: false },
  } });
  expect(await createRelativePlanProspectiveService(h.dependencies).read(prospectiveOwner,
    new Date("2026-11-09T00:00:00.000Z"))).toEqual(first);
  expect(JSON.stringify(receipt)).toBe(original);
  expect(mutableReads).toBe(0);
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
    persisted_future_snapshot_read_unavailable: true, snapshot_clock_read_preserves_original_rows: true,
    restored_snapshot_read_reproduces_original_measurement: true,
    persisted_future_scan_read_unavailable: true, scan_clock_read_preserves_original_rows: true,
    restored_scan_read_reproduces_original_measurement: true,
    retained_original_population: 4, missing_outcome_progression: [4, 1, 0], concurrent_single_owner_freeze: true,
    durable_freeze_count: 2, current_v4_sql_freeze_verified: true, retained_v3_upgrade_row_count: 1,
    predecessor_written_v3_restart_and_idempotent_read: true, upgrade_preserves_all_original_rows: true,
    new_policy_conflicts_with_retained_immutable_owner: true, self_rehashed_unknown_or_mixed_identity_rpc_rejections: 3,
    successor_freeze_acl_and_immutability_preserved: true,
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
