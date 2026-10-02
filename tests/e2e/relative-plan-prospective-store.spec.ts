import { expect, test } from "@playwright/test";
import { createRelativePlanProspectiveStore, type RelativePlanProspectiveDatabase } from "@/lib/server/relative-plan-prospective-store";
import { prospectiveOwner, prospectiveFrozenAt, prospectiveInput, prospectiveReceipt } from "../fixtures/relative-plan-prospective";

function harness(patch: Partial<RelativePlanProspectiveDatabase> = {}) {
  let stored: ReturnType<typeof prospectiveReceipt> | null = null;
  let writes = 0;
  const database: RelativePlanProspectiveDatabase = {
    async read(owner) { return stored && stored.owner_user_id === owner ? { status: "available", receipt: structuredClone(stored) }
      : { status: "not_found", receipt: null }; },
    async freeze(plan) { writes++; stored = { ...prospectiveReceipt(), plan };
      return { status: "frozen", receipt: structuredClone(stored) }; },
    ...patch,
  };
  return { database, store: createRelativePlanProspectiveStore(database), writes: () => writes, stored: () => stored };
}
test("durable committed readback survives a store restart and idempotent request after the windows begin", async () => {
  const h = harness();
  const initial = await h.store.freeze(prospectiveInput, prospectiveOwner, new Date(prospectiveFrozenAt));
  expect(initial.status).toBe("frozen");
  const restarted = createRelativePlanProspectiveStore(h.database);
  expect((await restarted.read(prospectiveOwner)).receipt).toEqual(initial.receipt);
  const repeated = await restarted.freeze(prospectiveInput, prospectiveOwner, new Date("2026-11-30T00:00:00.000Z"));
  expect(repeated.status).toBe("already_frozen");
  expect(repeated.receipt).toEqual(initial.receipt);
  expect(h.writes()).toBe(1);
  expect((await restarted.read("33333333-3333-4333-8333-333333333333")).status).toBe("not_found");
});
test("a different model/window cannot replace an owner's one immutable prospective comparison", async () => {
  const h = harness();
  await h.store.freeze(prospectiveInput, prospectiveOwner, new Date(prospectiveFrozenAt));
  const changed = { ...prospectiveInput, source_revision: { ...prospectiveInput.source_revision, commit_ref: "c".repeat(40) } };
  expect((await h.store.freeze(changed, prospectiveOwner, new Date(prospectiveFrozenAt))).status).toBe("conflicting");
  expect(h.writes()).toBe(1);
  expect(h.stored()?.plan.source_revision).toEqual(prospectiveInput.source_revision);
});
test("first-time retroactive requests and forged client owners do not write", async () => {
  const h = harness();
  expect((await h.store.freeze(prospectiveInput, prospectiveOwner, new Date("2026-10-05T13:30:00.000Z"))).status).toBe("invalid_request");
  expect((await h.store.freeze(prospectiveInput, "33333333-3333-4333-8333-333333333333", new Date(prospectiveFrozenAt))).status).toBe("invalid_request");
  expect(h.writes()).toBe(0);
});
test("missing, failed, mutated or cross-owner persistence remains unavailable, never a freeze", async () => {
  const original = prospectiveReceipt();
  for (const database of [
    null,
    { read: async () => { throw new Error("secret details must not escape"); }, freeze: async () => null },
    { read: async () => ({ status: "available", receipt: { ...original, owner_user_id: "33333333-3333-4333-8333-333333333333" } }), freeze: async () => null },
    { read: async () => ({ status: "available", receipt: { ...original, plan: { ...original.plan, model_fingerprint: "c".repeat(64) } } }), freeze: async () => null },
    { read: async () => ({ status: "not_found", receipt: null }), freeze: async () => ({ status: "frozen", receipt: original }) },
  ]) {
    const store = createRelativePlanProspectiveStore(database);
    expect((await store.freeze(prospectiveInput, prospectiveOwner, new Date(prospectiveFrozenAt))).status).toBe("unavailable");
  }
});
test("an unavailable schema or ambiguous result cannot fall back to legacy baseline receipts", async () => {
  const h = harness({ read: async () => [{ status: "available", receipt: prospectiveReceipt() }] });
  expect((await h.store.read(prospectiveOwner)).status).toBe("unavailable");
  expect(h.writes()).toBe(0);
});
