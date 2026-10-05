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
