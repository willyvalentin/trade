import { expect, test } from "@playwright/test";
import { buildRelativePlanProspectiveLearning } from "@/lib/server/relative-plan-prospective-learning";
import { buildRelativePlanTrainedProbabilityModel, RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION } from "@/lib/server/relative-plan-trained-probability-model";
import { prospectiveOwner, prospectiveReceipt } from "../fixtures/relative-plan-prospective";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";

const trainingParts = Promise.all([5, 6, 7].flatMap(day => [0, 1, 2, 3].map(n =>
  prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 17, n * 5)) }))));
const forwardParts = Promise.all([12, 26].flatMap(day => [0, 1, 2].map(n =>
  prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 17, n * 5)) }))));
const merge = (parts: Awaited<ReturnType<typeof prospectiveSource>>[]) => ({
  scanRuns: parts.flatMap(part => part.scanRuns), snapshots: parts.flatMap(part => part.snapshots), outcomes: parts.flatMap(part => part.outcomes) });
async function request() {
  const freeze = prospectiveReceipt(), source = merge(structuredClone(await trainingParts));
  const trained = buildRelativePlanTrainedProbabilityModel({ owner: prospectiveOwner, freeze, source, now: new Date("2026-10-10T00:00:00.000Z") }).trained_model!;
  return { owner: prospectiveOwner, freeze, source: merge([...structuredClone(await trainingParts), ...structuredClone(await forwardParts)]),
    now: new Date("2026-11-07T00:00:00.000Z"), trainedModelReceipt: {
      contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION,
      materialization_id: "44444444-4444-4444-8444-444444444444", owner_user_id: prospectiveOwner,
      materialized_at: "2026-10-10T00:00:00.000Z", committed_read_at: "2026-10-10T00:00:00.001Z", trained_model: trained } };
}

test("both actual forward partitions consume the same pre-forward model without granting full-charter authority", async () => {
  const input = await request(), result = buildRelativePlanProspectiveLearning(input)!;
  expect(result.trained_probability_model).toEqual(input.trainedModelReceipt);
  expect(result.partitions[1].probability_measurement?.training).toMatchObject({
    model_materialization: "immutable_database_attested_pre_forward_training_capsule",
    immutable_training_history_verified: true, training_job_execution_at: "2026-10-10T00:00:00.000Z",
    committed_model_observed_at: "2026-10-10T00:00:00.001Z", original_population_count: 48, binary_fitting_sample_count: 48 });
  for (const partition of result.partitions.slice(1)) {
    expect(partition.probability_measurement?.status).toBe("measured");
    expect(partition.probability_measurement?.model).toEqual(input.trainedModelReceipt.trained_model.model);
    expect(partition.probability_measurement?.forward?.original_population_count).toBe(12);
  }
  expect(result.blockers).not.toContain("durably_frozen_training_probability_model_required");
  expect(result.blockers).toContain("full_charter_forward_scorecard_required");
  expect(result).toMatchObject({ status: "evidence_incomplete", terminal_quality_decision: null, quality_improvement_claimed: false });
  expect(Object.values(result.authority).every(value => value === false)).toBe(true);
});

test("later mutable training-label upserts never refit or change forward probabilities", async () => {
  const input = await request(), before = buildRelativePlanProspectiveLearning(input)!;
  const losses = await Promise.all([5, 6, 7].flatMap(day => [0, 1, 2, 3].map(n =>
    prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 17, n * 5)), allLosses: true }))));
  const ids = new Set(losses.flatMap(part => part.outcomes).map(row => row.id));
  input.source.outcomes = [...input.source.outcomes.filter(row => !ids.has(row.id)), ...losses.flatMap(part => part.outcomes)];
  const after = buildRelativePlanProspectiveLearning(input)!;
  expect(after.trained_probability_model).toEqual(before.trained_probability_model);
  for (const i of [1, 2]) expect(after.partitions[i].probability_measurement).toEqual(before.partitions[i].probability_measurement);
});

test("forward losses change errors but never fit the model or replace the original population", async () => {
  const input = await request(), before = buildRelativePlanProspectiveLearning(input)!;
  const losses = await Promise.all([12, 26].flatMap(day => [0, 1, 2].map(n =>
    prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 17, n * 5)), allLosses: true }))));
  const ids = new Set(losses.flatMap(part => part.outcomes).map(row => row.id));
  input.source.outcomes = [...input.source.outcomes.filter(row => !ids.has(row.id)), ...losses.flatMap(part => part.outcomes)];
  const after = buildRelativePlanProspectiveLearning(input)!;
  for (const i of [1, 2]) {
    expect(after.partitions[i].probability_measurement?.model).toEqual(before.partitions[i].probability_measurement?.model);
    expect(after.partitions[i].probability_measurement?.forward?.original_membership_fingerprint)
      .toBe(before.partitions[i].probability_measurement?.forward?.original_membership_fingerprint);
    expect(after.partitions[i].probability_measurement?.forward?.baseline).not.toEqual(before.partitions[i].probability_measurement?.forward?.baseline);
  }
});

test("missing forward labels remain original unknown members, never selected-away losses", async () => {
  const input = await request();
  const forwardId = (await forwardParts)[0].outcomes[0].id;
  input.source.outcomes = input.source.outcomes.filter(row => row.id !== forwardId);
  const result = buildRelativePlanProspectiveLearning(input)!;
  expect(result.partitions[1].probability_measurement).toMatchObject({ status: "evidence_incomplete",
    forward: { original_population_count: 12, missing_outcome_count: 1, baseline: null, challenger: null } });
  expect(result.trained_probability_model).toEqual(input.trainedModelReceipt);
});

test("wrong-owner, late or changed-original-input model bindings cannot silently fall back to recomputation", async () => {
  const input = await request();
  for (const value of [
    { ...input.trainedModelReceipt, owner_user_id: "33333333-3333-4333-8333-333333333333" },
    { ...input.trainedModelReceipt, committed_read_at: "2026-10-12T13:30:00.000Z" },
  ]) expect(buildRelativePlanProspectiveLearning({ ...input, trainedModelReceipt: value })).toBeNull();
  input.source.scanRuns.shift();
  expect(buildRelativePlanProspectiveLearning(input)).toBeNull();
});

test("absent materialization retains explicit recomputation and does not close the durable-model gap", async () => {
  const input = await request(), result = buildRelativePlanProspectiveLearning({ ...input, trainedModelReceipt: undefined })!;
  expect(result.trained_probability_model).toBeNull();
  expect(result.blockers).toContain("durably_frozen_training_probability_model_required");
  expect(result.partitions[1].probability_measurement?.training?.immutable_training_history_verified).toBe(false);
});
