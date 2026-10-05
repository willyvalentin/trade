import { expect,test } from "@playwright/test";
import { charterEvaluationInput } from "../fixtures/relative-plan-charter-evaluation";
import { buildRelativePlanCharterResult,RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION } from "@/lib/server/relative-plan-charter-result";
import { createRelativePlanCharterResultStore } from "@/lib/server/relative-plan-charter-result-store";

const fixture = charterEvaluationInput().then(input => {
  const result = buildRelativePlanCharterResult(input).result;
  if (!result) throw new Error("complete_result_fixture_required");
  return { input,receipt:{ contract_version:RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION,
    result_id:"55555555-5555-4555-8555-555555555555",owner_user_id:input.owner,
    finalized_at:input.now.toISOString(),result } };
});
test.beforeEach(()=>test.setTimeout(180000));
test("a write acknowledgement is insufficient without independently verified committed readback",async()=> {
  const { input,receipt } = structuredClone(await fixture);
  let reads = 0;
  const store = createRelativePlanCharterResultStore({ async finalize() { return { status:"finalized",receipt }; },
    async read() { reads++;return { status:"not_found",receipt:null }; } });
  expect(await store.finalize(receipt.result,input.freeze,input.owner)).toMatchObject({ status:"unavailable",receipt:null });
  expect(reads).toBe(1);
});
test("actual committed result binds the entire acknowledgement, owner and candidate",async()=> {
  const { input,receipt } = structuredClone(await fixture);
  const ack = { ...receipt,finalized_at:receipt.finalized_at.replace("Z","+00:00") };
  const store = createRelativePlanCharterResultStore({ async finalize() { return { status:"finalized",receipt:ack }; },
    async read() { return { status:"available",receipt }; } });
  expect(await store.finalize(receipt.result,input.freeze,input.owner)).toEqual({ status:"finalized",receipt,blocker:null });
  const forged = createRelativePlanCharterResultStore({ async finalize() { return { status:"finalized",receipt:{ ...ack,extra:true } }; },
    async read() { return { status:"available",receipt }; } });
  expect((await forged.finalize(receipt.result,input.freeze,input.owner)).status).toBe("unavailable");
});
test("lost acknowledgement reports uncertainty but later read preserves the exact original result",async()=> {
  const { input,receipt } = structuredClone(await fixture);
  const store = createRelativePlanCharterResultStore({ async finalize() { throw new Error("lost_private_ack"); },
    async read() { return { status:"available",receipt }; } });
  const lost = await store.finalize(receipt.result,input.freeze,input.owner);
  expect(lost).toMatchObject({ status:"unavailable",receipt:null });
  expect(JSON.stringify(lost)).not.toContain("lost_private_ack");
  expect(await store.read(input.freeze,input.owner)).toEqual({ status:"available",receipt,blocker:null });
});
test("invalid calendar dates, malformed acknowledgements and wrong owners fail closed",async()=> {
  const { input,receipt } = structuredClone(await fixture);
  for (const raw of [null,{ status:"finalized",receipt:null },{ status:"finalized",receipt,extra:true },
    { status:"finalized",receipt:{ ...receipt,finalized_at:"2026-02-30T00:00:00.000Z" } }]) {
    let reads = 0;
    const store = createRelativePlanCharterResultStore({ async finalize() { return raw; },
      async read() { reads++;throw new Error("must_not_read_malformed_ack"); } });
    expect((await store.finalize(receipt.result,input.freeze,input.owner)).status).toBe("unavailable");
    expect(reads).toBe(0);
  }
  let writes = 0;
  const store = createRelativePlanCharterResultStore({ async finalize() { writes++;throw new Error("must_not_write"); },
    async read() { throw new Error("must_not_read"); } });
  expect((await store.finalize(receipt.result,input.freeze,"33333333-3333-4333-8333-333333333333")).status).toBe("unavailable");
  expect(writes).toBe(0);
});
