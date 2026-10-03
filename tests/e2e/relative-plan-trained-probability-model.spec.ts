import { expect, test } from "@playwright/test";
import { buildRelativePlanTrainedProbabilityModel, verifiedRelativePlanTrainedProbabilityReceipt,
  RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION, RELATIVE_PLAN_TRAINED_PROBABILITY_MAX_BYTES } from "@/lib/server/relative-plan-trained-probability-model";
import { relativePlanSemanticFingerprint } from "@/lib/server/relative-plan-prospective-comparison";
import { prospectiveOwner, prospectiveReceipt } from "../fixtures/relative-plan-prospective";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";

// Synthetic CLOSED training job inputs, not a persisted materialization receipt.
const now = new Date("2026-10-10T00:00:00.000Z");
const sourcePromise = Promise.all([5, 6, 7].flatMap(day => [0, 1, 2, 3].map(n =>
  prospectiveSource({ now: new Date(Date.UTC(2026, 9, day, 17, n * 5)) })))).then(pieces => ({
  scanRuns: pieces.flatMap(piece => piece.scanRuns), snapshots: pieces.flatMap(piece => piece.snapshots),
  outcomes: pieces.flatMap(piece => piece.outcomes),
}));
async function input() {
  return { owner: prospectiveOwner, freeze: prospectiveReceipt(), source: structuredClone(await sourcePromise), now };
}

test("a pre-forward training job retains all original members and the unchanged fitted model", async () => {
  const request = await input(), original = JSON.stringify(request), result = buildRelativePlanTrainedProbabilityModel(request);
  expect(result.status).toBe("ready");
  expect(result.trained_model).toMatchObject({ original_population_count: 48, canonical_outcome_count: 48,
    missing_outcome_count: 0, non_binary_outcome_count: 0, forward_cutoff: "2026-10-12T13:30:00.000Z",
    fitting_boundary_semantics: "declared_data_cutoff_not_training_job_execution_time" });
  expect(result.trained_model?.model).toMatchObject({ sample_count: 48, ticker_count: 4, trading_day_count: 3,
    policy_version: "fixed_score_bucket_beta_binomial_v1", minimum_sample: 30, minimum_bucket_sample: 10 });
  expect(result.trained_model?.original_training_receipts).toHaveLength(48);
  expect(Object.values(result.trained_model!.authority).every(value => value === false)).toBe(true);
  expect(JSON.stringify(request)).toBe(original);
  expect(buildRelativePlanTrainedProbabilityModel(structuredClone(request))).toEqual(result);
});

test("premature and at-or-after-forward materialization jobs fail closed without backdating", async () => {
  const request = await input();
  for (const [clock, blocker] of [
    ["2026-10-09T20:59:59.999Z", "trained_probability_training_maturity_not_reached"],
    ["2026-10-12T13:30:00.000Z", "trained_probability_forward_cutoff_already_reached"],
    ["2026-11-07T00:00:00.000Z", "trained_probability_forward_cutoff_already_reached"],
  ]) expect(buildRelativePlanTrainedProbabilityModel({ ...request, now: new Date(clock) })).toMatchObject({
    status: "not_ready", trained_model: null, blocker });
});

test("a missing or future-recorded training label stays in the original capsule but cannot fit", async () => {
  const request = await input(), complete = buildRelativePlanTrainedProbabilityModel(request).trained_model!;
  request.source.outcomes[0].created_at = "2026-10-10T00:00:00.001Z";
  const result = buildRelativePlanTrainedProbabilityModel(request).trained_model!;
  expect(result).toMatchObject({ original_population_count: 48, canonical_outcome_count: 47, missing_outcome_count: 1 });
  expect(result.model.sample_count).toBe(47);
  expect(result.original_training_receipts[0]).toMatchObject({ resolution: "missing_or_conflicting", binary_label: null });
  expect(result.original_training_membership_fingerprint).toBe(complete.original_training_membership_fingerprint);
  expect(result.model_binding_fingerprint).not.toBe(complete.model_binding_fingerprint);
});

test("forward decisions and labels cannot alter the training candidate or its fingerprint", async () => {
  const request = await input(), first = buildRelativePlanTrainedProbabilityModel(request);
  const forward = await prospectiveSource({ now: new Date("2026-10-12T17:00:00.000Z"), allLosses: true });
  request.source.scanRuns.push(...forward.scanRuns); request.source.snapshots.push(...forward.snapshots);
  request.source.outcomes.push(...forward.outcomes);
  expect(buildRelativePlanTrainedProbabilityModel(request)).toEqual(first);
});

test("an oversized complete training capsule fails closed without dropping original evidence", async () => {
  const request = await input();
  const payload: Record<string, unknown> = request.source.scanRuns[0].payload_json;
  payload.retained_context = "x".repeat(RELATIVE_PLAN_TRAINED_PROBABILITY_MAX_BYTES);
  expect(buildRelativePlanTrainedProbabilityModel(request)).toMatchObject({ status: "not_ready", trained_model: null,
    blocker: "trained_probability_complete_training_capsule_too_large" });
});

test("wrong owners, mutated freezes and underfilled full training populations cannot create a model", async () => {
  const request = await input();
  expect(buildRelativePlanTrainedProbabilityModel({ ...request, owner: "33333333-3333-4333-8333-333333333333" }).trained_model).toBeNull();
  const changed = structuredClone(request); changed.freeze.plan.authority.promotion = true as never;
  expect(buildRelativePlanTrainedProbabilityModel(changed).trained_model).toBeNull();
  request.source.scanRuns = request.source.scanRuns.slice(0, 3);
  expect(buildRelativePlanTrainedProbabilityModel(request)).toMatchObject({ status: "not_ready", trained_model: null,
    blocker: "trained_probability_unchanged_training_policy_insufficient" });
});

async function receipt() {
  const request = await input(), trained = buildRelativePlanTrainedProbabilityModel(request).trained_model!;
  return { request, value: { contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION,
    materialization_id: "44444444-4444-4444-8444-444444444444", owner_user_id: request.owner,
    materialized_at: now.toISOString(), committed_read_at: "2026-10-10T00:00:00.001Z", trained_model: trained } };
}
function rebind(value: Awaited<ReturnType<typeof receipt>>["value"]) {
  const { model_binding_fingerprint: ignored, ...body } = value.trained_model;
  void ignored;
  value.trained_model.model_binding_fingerprint = relativePlanSemanticFingerprint(body);
}

test("receipt verification rebuilds the complete model and survives JSONB key order", async () => {
  const { request, value } = await receipt();
  expect(verifiedRelativePlanTrainedProbabilityReceipt(value, request.freeze, request.owner)).toEqual(value);
  const jsonb = JSON.parse(JSON.stringify(value), (_key, v) => v && typeof v === "object" && !Array.isArray(v)
    ? Object.fromEntries(Object.entries(v).reverse()) : v);
  const rebuilt = buildRelativePlanTrainedProbabilityModel({ ...request, source: jsonb.trained_model.retained_training_source });
  expect(rebuilt.status).toBe("ready");
  expect(rebuilt.trained_model?.original_population_count).toBe(48);
  expect(rebuilt.trained_model?.fitting_input_fingerprint).toBe(value.trained_model.fitting_input_fingerprint);
  expect(relativePlanSemanticFingerprint(JSON.parse(JSON.stringify(value.trained_model)))).toBe(relativePlanSemanticFingerprint(value.trained_model));
  expect(rebuilt.trained_model?.model_binding_fingerprint).toBe(value.trained_model.model_binding_fingerprint);
  expect(verifiedRelativePlanTrainedProbabilityReceipt(jsonb, request.freeze, request.owner)).toEqual(value);
});

test("self-consistent outer hashes cannot disguise altered calibration or membership", async () => {
  const { request, value } = await receipt();
  for (const mutate of [
    (v: typeof value) => { v.trained_model.model.buckets[0].baseline.probability = 0.99; },
    (v: typeof value) => { v.trained_model.original_population_count--; },
    (v: typeof value) => { v.trained_model.original_training_receipts.push(v.trained_model.original_training_receipts[0]); },
    (v: typeof value) => { v.trained_model.original_training_receipts.reverse(); },
    (v: typeof value) => { v.trained_model.original_training_receipts[0].recorded_at = "2026-10-10T00:00:00.001Z"; },
    (v: typeof value) => { v.trained_model.original_training_receipts[0].binary_label = 1; },
  ]) {
    const changed = structuredClone(value); mutate(changed); rebind(changed);
    expect(verifiedRelativePlanTrainedProbabilityReceipt(changed, request.freeze, request.owner)).toBeNull();
  }
});

test("actual materialization must be mature, before forward, and bound to its owner and plan", async () => {
  const { request, value } = await receipt();
  for (const materialized_at of ["2026-10-09T20:59:59.999Z", "2026-10-12T13:30:00.000Z", "2026-10-10", "2026-02-30T00:00:00.000Z"]) {
    expect(verifiedRelativePlanTrainedProbabilityReceipt({ ...value, materialized_at }, request.freeze, request.owner)).toBeNull();
  }
  expect(verifiedRelativePlanTrainedProbabilityReceipt(value, request.freeze, "33333333-3333-4333-8333-333333333333")).toBeNull();
  const changed = structuredClone(value); changed.trained_model.prospective_freeze_id = "55555555-5555-4555-8555-555555555555";
  rebind(changed);
  expect(verifiedRelativePlanTrainedProbabilityReceipt(changed, request.freeze, request.owner)).toBeNull();
  expect(verifiedRelativePlanTrainedProbabilityReceipt({ ...value, extra: true }, request.freeze, request.owner)).toBeNull();
  for (const committed_read_at of ["2026-10-09T23:59:59.999Z", "2026-10-12T13:30:00.000Z", undefined]) {
    expect(verifiedRelativePlanTrainedProbabilityReceipt({ ...value, committed_read_at }, request.freeze, request.owner)).toBeNull();
  }
});

test("unavailable original receipts remain disclosed but cannot alter the sealed fitted population", async () => {
  const request = await input(); request.source.outcomes[0].created_at = "2026-10-10T00:00:00.001Z";
  const trained = buildRelativePlanTrainedProbabilityModel(request).trained_model!;
  const value = { contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION,
    materialization_id: "44444444-4444-4444-8444-444444444444", owner_user_id: request.owner,
    materialized_at: now.toISOString(), committed_read_at: "2026-10-10T00:00:00.001Z", trained_model: trained };
  expect(verifiedRelativePlanTrainedProbabilityReceipt(value, request.freeze, request.owner)).toEqual(value);
  expect(trained.original_training_receipts[0]).toMatchObject({ outcome_id: request.source.outcomes[0].id,
    recorded_at: "2026-10-10T00:00:00.001Z", resolution: "missing_or_conflicting" });
  expect(trained.model.sample_count).toBe(47);
});

test("retained canonical evidence is independently reproduced even with a self-consistent capsule hash", async () => {
  const { request, value } = await receipt();
  expect(value.trained_model.retained_training_source.scanRuns).toHaveLength(12);
  expect(value.trained_model.retained_training_source.snapshots).toHaveLength(48);
  expect(value.trained_model.retained_training_source.outcomes).toHaveLength(48);
  for (const mutate of [
    (v: typeof value) => { delete v.trained_model.retained_training_source.outcomes[0].payload_json.canonical_provider_coverage; },
    (v: typeof value) => { v.trained_model.retained_training_source.outcomes[0].created_at = "2026-10-10T00:00:00.001Z"; },
    (v: typeof value) => { v.trained_model.retained_training_source.snapshots[0].target = 1000; },
    (v: typeof value) => { v.trained_model.retained_training_source.scanRuns.pop(); },
    (v: typeof value) => { v.trained_model.training_source_as_of = "2026-10-12T13:30:00.000Z"; },
  ]) {
    const changed = structuredClone(value); mutate(changed); rebind(changed);
    expect(verifiedRelativePlanTrainedProbabilityReceipt(changed, request.freeze, request.owner)).toBeNull();
  }
});
