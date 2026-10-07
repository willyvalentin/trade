import { expect, test } from "@playwright/test";
import { originalOutcomeSourceWindow, RETAINED_ORIGINAL_OUTCOME_BATCH_FLAG,
  retainedOriginalOutcomeBatchControlFromEnvironment } from "@/lib/original-outcome-source-window";
import { createClient } from "@supabase/supabase-js";
import { readCompleteOriginalOutcomes } from "@/lib/original-outcome-persistence-read";

const retainedBatchEnvironment: Record<string, string> = {
  [RETAINED_ORIGINAL_OUTCOME_BATCH_FLAG]: "rec_batch_4bq7jo",
  TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED: "true",
  TURE_DISABLE_SCHEDULED_FUNCTIONS: "true",
  TURE_OUTCOME_EVALUATION_ONE_SHOT_DATE: "2026-10-07",
  TURE_OUTCOME_EVALUATION_ONE_SHOT_SLOT_UTC: "2026-10-07T17:30:00.000Z",
};
function retainedControl(values: Record<string, string | undefined>) {
  return retainedOriginalOutcomeBatchControlFromEnvironment({get: name => values[name]});
}
test("retained batch is absent by default and exact only under the existing one-slot controls", () => {
  expect(retainedControl({})).toEqual({status:"disabled"});
  expect(retainedControl(retainedBatchEnvironment)).toEqual({status:"ready",
    contract_version:"retained_original_batch_one_shot_v1",batch_fingerprint:"rec_batch_4bq7jo",
    target_date:"2026-10-07",target_slot_utc:"2026-10-07T17:30:00.000Z"});
});
for (const [name, overrides] of Object.entries({
  empty:{[RETAINED_ORIGINAL_OUTCOME_BATCH_FLAG]:""},
  alias:{[RETAINED_ORIGINAL_OUTCOME_BATCH_FLAG]:" rec_batch_4bq7jo "},
  wrong_prefix:{[RETAINED_ORIGINAL_OUTCOME_BATCH_FLAG]:"batch_4bq7jo"},
  uppercase:{[RETAINED_ORIGINAL_OUTCOME_BATCH_FLAG]:"rec_batch_A"},
  too_long:{[RETAINED_ORIGINAL_OUTCOME_BATCH_FLAG]:`rec_batch_${"a".repeat(65)}`},
  one_shot_off:{TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED:"false"},
  global_on:{TURE_DISABLE_SCHEDULED_FUNCTIONS:"false"},
  date_missing:{TURE_OUTCOME_EVALUATION_ONE_SHOT_DATE:undefined},
  date_drift:{TURE_OUTCOME_EVALUATION_ONE_SHOT_DATE:"2026-10-06"},
  slot_missing:{TURE_OUTCOME_EVALUATION_ONE_SHOT_SLOT_UTC:undefined},
  slot_alias:{TURE_OUTCOME_EVALUATION_ONE_SHOT_SLOT_UTC:"2026-10-07T17:30:00Z"},
  slot_unaligned:{TURE_OUTCOME_EVALUATION_ONE_SHOT_SLOT_UTC:"2026-10-07T17:31:00.000Z"},
  ...Object.fromEntries(["TURE_NORMAL_SCAN_ONE_SHOT_ENABLED", "TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED",
    "TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED", "TURE_OBSERVATION_SERIES_ENABLED",
    "TURE_OUTCOME_EVALUATION_SERIES_ENABLED", "TURE_INTERNAL_PAPER_WORKER_ENABLED"]
    .map(flag=>[flag,{[flag]:"true"}])),
})) {
  test(`retained batch configuration fails closed for ${name}`, () => {
    expect(retainedControl({...retainedBatchEnvironment,...overrides})).toEqual({status:"invalid"});
  });
}

test("bounded original recovery spans a weekend without changing the original date", () => {
  expect(originalOutcomeSourceWindow(new Date("2026-10-05T17:30:20Z"))).toEqual({
    policy_version: "trailing_seven_ny_dates_v1", from_trading_date: "2026-09-29", through_trading_date: "2026-10-05",
    ordering: "oldest_original_first", older_sources: "outside_bounded_recovery_not_proven_complete",
  });
});

const owner = "00000000-0000-4000-8000-000000000001";
function row(index: number): Record<string, unknown> {
  return {id:`outcome_${String(index).padStart(4,"0")}`, owner_user_id:owner,
    snapshot_fingerprint:`source_${index}`, horizon:"60m", status:"completed",
    evaluated_at:"2026-10-05T17:30:00Z",created_at:"2026-10-05T17:30:00Z",updated_at:"2026-10-05T17:30:00Z",
    payload_json:{data_completeness:"complete"}};
}
function clientFor(rows: Record<string, unknown>[], fault = "", cap = 2) {
  let reads = 0;
  const cursors: string[] = [];
  const client = createClient("https://closed-outcome-read.invalid", "synthetic-test-key", {
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
    global:{fetch:async(input, init) => {
      const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
      expect(url.searchParams.get("owner_user_id")).toBe(`eq.${owner}`);
      expect(url.searchParams.get("snapshot_fingerprint")).toBeTruthy();
      const head = init?.method === "HEAD";
      const cursor = url.searchParams.get("id")?.slice(3) ?? "";
      if (!head) {
        expect(url.searchParams.get("order")).toBe("id.asc");
        expect(url.searchParams.get("limit")).toBe("100");
        reads++; cursors.push(cursor);
      }
      if(fault==="timeout") {
        if(init?.signal?.aborted) throw new Error("boundary_timeout");
        return new Promise((_resolve,reject)=>init?.signal?.addEventListener("abort",()=>reject(new Error("boundary_timeout")),{once:true}));
      }
      if(fault==="second_page" && cursor) return Response.json({message:"boundary_failed"},{status:400});
      let tail = rows.filter(value => String(value.id) > cursor);
      let count = tail.length;
      if(head && fault==="changed_final_count" || cursor && fault==="changed_tail_count") count++;
      if(fault==="over_limit") count=10001;
      tail = tail.slice(0,cap);
      if(fault==="empty_page") tail=[];
      if(tail.length && fault==="wrong_owner") tail[0]={...tail[0],owner_user_id:"other"};
      if(tail.length && fault==="wrong_source") tail[0]={...tail[0],snapshot_fingerprint:"other"};
      if(tail.length && fault==="invalid_decoder") tail[0]={...tail[0],horizon:"unknown"};
      if(tail.length && fault==="invalid_clock") tail[0]={...tail[0],evaluated_at:"invalid"};
      if(tail.length && fault==="duplicate_key") tail=tail.map(value=>({...value,snapshot_fingerprint:"source_1"}));
      if(cursor && fault==="duplicate_id") tail=[rows[0]];
      const headers: Record<string,string> = fault==="missing_count"?{}:{"content-range":`*/${count}`};
      return head ? new Response(null,{headers}) : Response.json(tail,{headers});
    }},
  });
  return {client, facts:()=>({reads,cursors})};
}

test("complete original outcomes advance through actual response caps by immutable id", async () => {
  const rows=Array.from({length:5},(_,index)=>row(index+1));
  const boundary=clientFor(rows);
  const result=await readCompleteOriginalOutcomes(boundary.client,owner,rows.map(value=>String(value.snapshot_fingerprint)));
  expect(result.error).toBeNull();
  expect(result.outcomes.map(value=>value.id)).toEqual(rows.map(value=>value.id));
  expect(boundary.facts()).toEqual({reads:3,cursors:["","outcome_0002","outcome_0004"]});
});

test("an exactly verified empty outcome population is distinct from an unreadable source", async () => {
  const boundary=clientFor([]);
  expect(await readCompleteOriginalOutcomes(boundary.client,owner,["source_1"])).toEqual({outcomes:[],error:null});
  expect(boundary.facts().reads).toBe(1);
  const noSource=clientFor([]);
  expect(await readCompleteOriginalOutcomes(noSource.client,owner,[])).toEqual({outcomes:[],error:null});
  expect(await readCompleteOriginalOutcomes(noSource.client,"",["source_1"])).toEqual({outcomes:[],error:"original_outcome_identity_invalid"});
  expect(noSource.facts().reads).toBe(0);
});

for(const fault of ["second_page","missing_count","changed_tail_count","changed_final_count","empty_page",
  "wrong_owner","wrong_source","invalid_decoder","invalid_clock","duplicate_key","duplicate_id","over_limit"]) {
  test(`original outcome ${fault} never yields a partial completed population`, async () => {
    const rows=[row(1),row(2),row(3)];
    const boundary=clientFor(rows,fault);
    const result=await readCompleteOriginalOutcomes(boundary.client,owner,rows.map(value=>String(value.snapshot_fingerprint)));
    expect(result.outcomes).toEqual([]);
    expect(result.error).toBeTruthy();
    expect(boundary.facts().reads).toBeLessThanOrEqual(2);
  });
}

test("a capped outcome read has an explicit total-page bound, not a reduced cohort", async () => {
  const rows=Array.from({length:201},(_,index)=>row(index+1));
  const boundary=clientFor(rows,"",1);
  const result=await readCompleteOriginalOutcomes(boundary.client,owner,rows.map(value=>String(value.snapshot_fingerprint)));
  expect(result).toEqual({outcomes:[],error:"original_outcome_read_limit_exceeded"});
  expect(boundary.facts().reads).toBe(200);
});

test("an aborted outcome read returns no reusable partial labels", async () => {
  const boundary=clientFor([row(1)],"timeout");
  const result=await readCompleteOriginalOutcomes(boundary.client,owner,["source_1"]);
  expect(result).toEqual({outcomes:[],error:"original_outcome_read_timeout"});
});
test("original recovery uses New York dates, including year and DST boundaries", () => {
  expect(originalOutcomeSourceWindow(new Date("2026-01-01T03:00:00Z"))).toMatchObject({
    from_trading_date: "2025-12-25", through_trading_date: "2025-12-31",
  });
  expect(originalOutcomeSourceWindow(new Date("2026-11-02T05:01:00Z"))).toMatchObject({
    from_trading_date: "2026-10-27", through_trading_date: "2026-11-02",
  });
  expect(originalOutcomeSourceWindow(new Date(NaN))).toBeNull();
});
