import { expect, test } from "@playwright/test";
import { createRelativePlanProspectiveService } from "@/lib/server/relative-plan-prospective-service";
import { createRelativePlanProspectiveStore } from "@/lib/server/relative-plan-prospective-store";
import { createRelativePlanTrainedProbabilityStore } from "@/lib/server/relative-plan-trained-probability-store";
import { prospectiveOwner, prospectiveFrozenAt, prospectiveInput, prospectiveReceipt } from "../fixtures/relative-plan-prospective";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { createApplicationSession, TRADE_AUTH_COOKIE } from "@/lib/application-session-core";

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
    full_charter_decision: "evidence_incomplete", provider_requests: 0, production_changes: 0,
    broker_actions: 0, quality_improvement_verified: false });
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
