import { expect, test } from "@playwright/test";
import { createRelativePlanTrainedProbabilityStore } from "@/lib/server/relative-plan-trained-probability-store";
import { buildRelativePlanTrainedProbabilityModel, RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION } from "@/lib/server/relative-plan-trained-probability-model";
import { prospectiveOwner, prospectiveReceipt } from "../fixtures/relative-plan-prospective";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";
import { spawnSync } from "node:child_process";

const now = new Date("2026-10-10T00:00:00.000Z");
const sourcePromise = Promise.all([5, 6, 7].flatMap(day => [0, 1, 2, 3].map(n =>
  prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 17, n * 5)) })))).then(pieces => ({
  scanRuns: pieces.flatMap(piece => piece.scanRuns), snapshots: pieces.flatMap(piece => piece.snapshots),
  outcomes: pieces.flatMap(piece => piece.outcomes),
}));
async function request() {
  const freeze = prospectiveReceipt();
  const model = buildRelativePlanTrainedProbabilityModel({ owner: prospectiveOwner, freeze, source: await sourcePromise, now }).trained_model!;
  const receipt = { contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION,
    materialization_id: "44444444-4444-4444-8444-444444444444", owner_user_id: prospectiveOwner,
    materialized_at: now.toISOString(), committed_read_at: "2026-10-10T00:00:00.001Z", trained_model: model };
  return { freeze, model, receipt };
}

test("an actual separate confirmation and exact committed readback are mandatory for materialization", async () => {
  const { freeze, model, receipt } = await request();
  const calls: string[] = []; let confirmed = false;
  const database = {
    async read(owner: string, freezeId: string) {
      calls.push("read"); expect(owner).toBe(prospectiveOwner); expect(freezeId).toBe(freeze.freeze_id);
      return confirmed ? { status: "available", receipt } : { status: "not_found", receipt: null };
    },
    async materialize(value: typeof model) { calls.push("materialize"); expect(value).toEqual(model);
      return { status: "pending_confirmation", receipt: null }; },
    async confirm(owner: string, freezeId: string) { calls.push("confirm"); expect(owner).toBe(prospectiveOwner);
      expect(freezeId).toBe(freeze.freeze_id); confirmed = true; return { status: "materialized", receipt }; },
  };
  expect(await createRelativePlanTrainedProbabilityStore(database).materialize(model, freeze, prospectiveOwner, now))
    .toMatchObject({ status: "materialized", receipt, blocker: null });
  expect(calls).toEqual(["read", "materialize", "confirm", "read"]);
  const restarted = createRelativePlanTrainedProbabilityStore(database);
  expect(await restarted.read(freeze, prospectiveOwner)).toMatchObject({ status: "available", receipt });
  expect(await restarted.materialize(model, freeze, prospectiveOwner, new Date("2026-11-10T00:00:00.000Z")))
    .toMatchObject({ status: "already_materialized", receipt });
  expect(calls.filter(c => c === "materialize")).toHaveLength(1);
});

test("a pending capsule without pre-forward confirmation is not a frozen model", async () => {
  const { freeze, model } = await request(); let writes = 0;
  const database = { async read() { return { status: "pending_confirmation", receipt: null }; },
    async materialize() { writes++; return { status: "pending_confirmation", receipt: null }; },
    async confirm() { return { status: "not_ready", receipt: null }; } };
  const store = createRelativePlanTrainedProbabilityStore(database);
  expect(await store.read(freeze, prospectiveOwner)).toMatchObject({ status: "pending_confirmation", receipt: null });
  expect(await store.materialize(model, freeze, prospectiveOwner, now)).toMatchObject({ status: "not_ready", receipt: null });
  expect(await store.materialize(model, freeze, prospectiveOwner, new Date("2026-10-12T13:30:00.000Z")))
    .toMatchObject({ status: "not_ready", receipt: null });
  expect(writes).toBe(1);
});

test("acknowledgement, wrong-owner evidence and changed committed readback fail closed", async () => {
  const { freeze, model, receipt } = await request();
  for (const bad of [null, { ...receipt, owner_user_id: "33333333-3333-4333-8333-333333333333" },
    { ...receipt, committed_read_at: "2026-10-12T13:30:00.000Z" }, { ...receipt, materialization_id: "55555555-5555-4555-8555-555555555555" }]) {
    let reads = 0;
    const store = createRelativePlanTrainedProbabilityStore({ async read() {
      return ++reads === 1 ? { status: "not_found", receipt: null } : { status: "available", receipt: bad }; },
      async materialize() { return { status: "pending_confirmation", receipt: null }; },
      async confirm() { return { status: "materialized", receipt }; } });
    expect(await store.materialize(model, freeze, prospectiveOwner, now)).toMatchObject({ status: "unavailable", receipt: null });
  }
});

test("missing storage, malformed candidate and a different existing model cannot mutate evidence", async () => {
  const { freeze, model, receipt } = await request(); let writes = 0;
  const missing = createRelativePlanTrainedProbabilityStore(null);
  expect(await missing.read(freeze, prospectiveOwner)).toMatchObject({ status: "unavailable" });
  const store = createRelativePlanTrainedProbabilityStore({ async read() { return { status: "available", receipt }; },
    async materialize() { writes++; return null; }, async confirm() { writes++; return null; } });
  const changed = structuredClone(model); changed.model_binding_fingerprint = "a".repeat(64);
  expect(await store.materialize(changed, freeze, prospectiveOwner, now)).toMatchObject({ status: "conflicting", receipt: null });
  expect(writes).toBe(0);
});

test("an interrupted confirmation resumes the original capsule without a replacement write", async () => {
  const { freeze, receipt } = await request(); let confirmed = false, writes = 0;
  const database = { async read() { return confirmed ? { status: "available", receipt } : { status: "pending_confirmation", receipt: null }; },
    async materialize() { writes++; throw new Error("replacement_write_forbidden"); },
    async confirm() { confirmed = true; return { status: "materialized", receipt }; } };
  const store = createRelativePlanTrainedProbabilityStore(database);
  expect(await store.confirmPending(freeze, prospectiveOwner)).toMatchObject({ status: "materialized", receipt });
  expect(await store.confirmPending(freeze, prospectiveOwner)).toMatchObject({ status: "already_materialized", receipt });
  expect(writes).toBe(0);
});

test("actual database clock, separate committed confirmation and restarted SDK model remain immutable", () => {
  test.setTimeout(180000);
  const result = spawnSync(process.execPath, ["scripts/relative-plan-trained-probability-runtime-proof.mjs"], {
    encoding: "utf8", timeout: 170000, env: { ...process.env } });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const receipt = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(receipt).toMatchObject({ status: "pass", environment: "isolated_closed_synthetic_postgres_postgrest_sdk",
    original_training_members: 48, immutable_fitted_sample: 48, database_attested_seal_and_separate_committed_read: true,
    same_transaction_confirmation_rejected: true, concurrent_single_materialization: true, exact_restarted_model: true,
    later_mutable_outcome_upserts_do_not_refit: true, actual_database_rejects_backdated_and_premature_jobs: true,
    actual_server_owned_training_job_verified: true, lost_acknowledgement_resumes_original_capsule: true,
    actual_forward_product_consumer_verified: true, forward_original_members_per_partition: 12,
    missing_forward_label_remains_unknown: true, later_forward_losses_change_errors_not_model: true,
    owner_and_client_rpc_isolation: true, direct_mutation_denied: true, full_charter_decision: "evidence_incomplete",
    provider_requests: 0, production_changes: 0, broker_actions: 0, quality_improvement_verified: false });
});
