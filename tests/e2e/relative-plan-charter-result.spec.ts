import { expect,test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { charterEvaluationInput } from "../fixtures/relative-plan-charter-evaluation";
import { buildRelativePlanCharterResult, verifiedRelativePlanCharterResultReceipt,
  relativePlanTerminalQualityDecision, RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION } from "@/lib/server/relative-plan-charter-result";
import { relativePlanSemanticFingerprint } from "@/lib/server/relative-plan-prospective-comparison";
import { decodeRelativePlanRetainedSource,RELATIVE_PLAN_CHARTER_SOURCE_MAX_BYTES } from "@/lib/server/relative-plan-charter-result";

const fixture = charterEvaluationInput();
test.beforeEach(() => test.setTimeout(180000));
const candidate = fixture.then(input => ({ input,result: buildRelativePlanCharterResult(input).result! }));
async function value() {
  const { input,result } = structuredClone(await candidate);
  return { input,receipt: { contract_version: RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION,
    result_id: "55555555-5555-4555-8555-555555555555",owner_user_id: input.owner,
    finalized_at: input.now.toISOString(),result } };
}
test("complete retained evidence reproduces every original charter dimension without live authority",async () => {
  const { input,receipt } = await value();
  expect(receipt.result, "full original capsule must exist without shortening the cohort").not.toBeNull();
  expect(verifiedRelativePlanCharterResultReceipt(receipt,input.freeze,input.owner)).toEqual(receipt);
  expect(receipt.result.retained_runtime.status).toBe("available");
  expect(receipt.result.measurement.partitions.map(p=>p.original_population_count)).toEqual([120,120]);
  expect(relativePlanTerminalQualityDecision(receipt)).toMatchObject({ disposition:"reject",evidence_complete:true,
    quality_improvement_claimed:false,live_policy_effect:false });
  expect(Object.values(receipt.result.authority).every(value=>value===false)).toBe(true);
  expect(decodeRelativePlanRetainedSource(receipt.result.retained_source)).toEqual(JSON.parse(JSON.stringify(input.source)));
});
test("lossless source decoding rejects malformed, altered, noncanonical and oversized envelopes",async () => {
  const { receipt } = await value(), original = receipt.result.retained_source;
  for (const changed of [{ ...original,payload:"not_gzip" },{ ...original,payload:original.payload+"\n" },
    { ...original,source_fingerprint:"c".repeat(64) },{ ...original,decoded_byte_length:original.decoded_byte_length-1 },
    { ...original,decoded_byte_length:RELATIVE_PLAN_CHARTER_SOURCE_MAX_BYTES+1 },{ ...original,encoding:"raw_json" }]) {
    expect(decodeRelativePlanRetainedSource(changed)).toBeNull();
  }
});
test("a recomputed fingerprint cannot legitimize forged metrics or a changed original runtime envelope",async () => {
  for (const mode of ["disposition","metric","cost"] as const) {
    const { input,receipt } = await value();
    if (mode === "disposition") receipt.result.measurement.computed_disposition = "continue";
    else if (mode === "metric") receipt.result.measurement.partitions[0].quality.challenger.expectancy_r = 100;
    else if (receipt.result.retained_runtime.status === "available") {
      const attempt = receipt.result.retained_runtime.partitions[0].scheduled_attempts[0];
      (attempt.payload_json as Record<string,unknown>).scheduled_slot_started_at_utc = "2026-10-12T17:00:00.000Z";
    }
    const { result_fingerprint: _binding,...body } = receipt.result;
    void _binding; receipt.result.result_fingerprint = relativePlanSemanticFingerprint(body);
    expect(verifiedRelativePlanCharterResultReceipt(receipt,input.freeze,input.owner)).toBeNull();
  }
});
test("wrong owner, early or future result clocks never become terminal evidence",async () => {
  const { input,receipt } = await value();
  expect(verifiedRelativePlanCharterResultReceipt(receipt,input.freeze,"33333333-3333-4333-8333-333333333333")).toBeNull();
  expect(verifiedRelativePlanCharterResultReceipt({ ...receipt,finalized_at:"2026-11-06T21:00:00.000Z" },input.freeze,input.owner)).toBeNull();
  expect(buildRelativePlanCharterResult({ ...input,now:new Date("2026-11-06T21:00:00.000Z") }).status).toBe("not_ready");
});
test("global unattributed rows retain their denominator without disclosing another owner's payload",async () => {
  const input = structuredClone(await fixture);
  if (input.runtime.status !== "available") throw new Error("fixture");
  input.runtime.partitions[0].retained_rows!.scheduled_attempts.push({ attempt_fingerprint:"other_owned_attempt",
    utc_timestamp:"2026-10-12T17:00:00.000Z",payload_json:{ private_other_owner:"must_not_disclose" },owner_user_id:"33333333-3333-4333-8333-333333333333" });
  const result = buildRelativePlanCharterResult(input).result!;
  expect(result.measurement.computed_disposition).toBe("evidence_incomplete");
  expect(result.measurement.partitions[0].operational.reliability?.value).toBeNull();
  expect(JSON.stringify(result)).not.toContain("must_not_disclose");
  expect(result.retained_runtime.status === "available" && result.retained_runtime.partitions[0].scheduled_attempts).toHaveLength(31);
});
test("actual database clock, immutable result and restarted SDK/product consumption resist later source edits",()=> {
  test.setTimeout(480000);
  const result = spawnSync(process.execPath,["scripts/relative-plan-charter-runtime-proof.mjs","--finalized-result"],{
    encoding:"utf8",timeout:470000,env:{ ...process.env } });
  expect(result.status,`${result.stdout}\n${result.stderr}`).toBe(0);
  const proof = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(proof).toMatchObject({ status:"pass",durable_terminal_result_verified:true,
    actual_database_finalization_clock_verified:true,historical_model_clock_fixture:true,
    result_prewrite_guards_verified:true,
    quality_improvement_verified:false,provider_requests:0,production_writes:0,broker_actions:0 });
  expect(proof.complete_finalized_product_http_bytes).toBeGreaterThan(0);
  expect(proof.complete_finalized_product_http_bytes).toBeLessThanOrEqual(5*1048576);
  console.log(JSON.stringify({ local_charter_finalization_evidence:proof }));
});
