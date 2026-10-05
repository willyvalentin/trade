import { expect, test } from "@playwright/test";
import { buildRelativePlanCharterEvaluation } from "@/lib/server/relative-plan-charter-evaluation";
import { buildRelativePlanProspectiveLearning } from "@/lib/server/relative-plan-prospective-learning";
import { charterEvaluationInput } from "../fixtures/relative-plan-charter-evaluation";
import { spawnSync } from "node:child_process";

const source = charterEvaluationInput();
async function input() { return structuredClone(await source); }
test.beforeEach(() => test.setTimeout(90000)); // Full original 60-decision source replay, not a shortened sample.

test("full charter keeps daily-range versions separate across training and both complete forward populations", async () => {
  const legacy = await input(), old = buildRelativePlanCharterEvaluation(legacy)!;
  const current = await charterEvaluationInput(4, { featureVectorVersion: "recommendation_decision_feature_vector_v3" });
  const complete = buildRelativePlanCharterEvaluation(current)!;
  expect(complete.evidence_complete).toBe(true);
  expect(complete.computed_disposition).toBe(old.computed_disposition);
  expect(complete.partitions.map(row => [row.original_membership_fingerprint,row.quality.original_population_count,
    row.thresholds.checks,row.probability.model])).toEqual(old.partitions.map(row => [row.original_membership_fingerprint,
      row.quality.original_population_count,row.thresholds.checks,row.probability.model]));
  // Each partition remains individually homogeneous; the new daily basis may
  // still not silently qualify with a sealed model retaining the old basis.
  const trainingRuns = new Set(legacy.trainedModelReceipt.trained_model.retained_training_source.scanRuns.map(row => row.run_fingerprint));
  legacy.source.snapshots = legacy.source.snapshots.map(row => trainingRuns.has(row.scan_run_id ?? "") ? row :
    current.source.snapshots.find(next => next.id === row.id)!);
  const bytes = JSON.stringify(legacy);
  const mixed = buildRelativePlanCharterEvaluation(legacy)!;
  expect(mixed.evidence_complete).toBe(false);
  expect(mixed.computed_disposition).toBe("evidence_incomplete");
  for (const partition of mixed.partitions) {
    expect(partition.original_population_count).toBe(120);
    expect(partition.enrolled_decision_count).toBe(30);
    expect(partition.missing_dimensions).toContain("separate_original_feature_vector_bases_required");
  }
  expect(JSON.stringify(legacy)).toBe(bytes);
});

test("full original forward charter measures known failures separately from missing evidence", async () => {
  const value = await input(), before = JSON.stringify(value), result = buildRelativePlanCharterEvaluation(value)!;
  expect(result.evidence_complete).toBe(true);
  expect(result.computed_disposition).toBe("reject");
  expect(result.missing_dimensions).toEqual([]);
  expect(result.measured_limit_failures).toContain("held_out_ticker_concentration_charter_limit_not_met");
  expect(result.measured_limit_failures).toContain("walk_forward_sector_concentration_charter_limit_not_met");
  for (const partition of result.partitions) {
    expect(partition).toMatchObject({ enrolled_decision_count: 30, original_population_count: 120, evidence_complete: true });
    expect(partition.quality.trading_day_count).toBe(3);
    expect(partition.thresholds.checks).toHaveLength(11);
    expect(partition.operational.reliability?.value?.value).toBe(1);
    expect(partition.operational.cost?.credits_per_decision).toBe(8);
    expect(partition.probability.model).toEqual(value.trainedModelReceipt.trained_model.model);
  }
  expect(result.terminal_quality_decision).toBeNull();
  expect(result.context_triage).toBeNull();
  expect(result.quality_improvement_claimed).toBe(false);
  expect(Object.values(result.authority).every(value => value === false)).toBe(true);
  expect(JSON.stringify(value)).toBe(before);
  const learning = buildRelativePlanProspectiveLearning(value)!;
  expect(learning.full_charter).toEqual(result);
  expect(learning.blockers).toContain("durably_finalized_full_charter_result_required");
});

for (const mode of ["outcome", "cost", "context", "model", "early", "sample"] as const) {
  test(`missing ${mode} cannot turn known failures into a qualified terminal decision`, async () => {
    const value = await input();
    if (mode === "outcome") value.source.outcomes = value.source.outcomes.slice(0, -1);
    if (mode === "cost" && value.runtime.status === "available") value.runtime.partitions[0].evidence[0].credit_readback.reservation.finalization_proven = false;
    if (mode === "context") delete value.source.snapshots.at(-1)!.payload_json.market_regime_context;
    if (mode === "early") value.now = new Date("2026-11-06T21:59:59.999Z");
    if (mode === "sample") value.source.scanRuns = value.source.scanRuns.slice(0, -1);
    const result = buildRelativePlanCharterEvaluation({ ...value, trainedModelReceipt: mode === "model" ? undefined : value.trainedModelReceipt })!;
    expect(result.evidence_complete).toBe(false);
    expect(result.computed_disposition).toBe("evidence_incomplete");
    expect(result.missing_dimensions.length).toBeGreaterThan(0);
    expect(result.terminal_quality_decision).toBeNull();
  });
}

test("source corrections cannot refit the sealed model or replace the first thirty forward identities", async () => {
  const value = await input(), first = buildRelativePlanCharterEvaluation(value)!;
  for (const row of value.source.outcomes.slice(0, 48)) row.target_hit = false;
  const after = buildRelativePlanCharterEvaluation(value)!;
  expect(after.partitions[0].probability.model).toEqual(first.partitions[0].probability.model);
  expect(after.partitions[1].probability.model).toEqual(first.partitions[1].probability.model);
  expect(after.partitions.map(row => row.original_membership_fingerprint)).toEqual(first.partitions.map(row => row.original_membership_fingerprint));
});

test("wrong-owner or corrupted trained-model binding refuses a full-charter read", async () => {
  const value = await input();
  expect(buildRelativePlanCharterEvaluation({ ...value, owner: "33333333-3333-4333-8333-333333333333" })).toBeNull();
  value.trainedModelReceipt.trained_model.model_binding_fingerprint = "c".repeat(64);
  expect(buildRelativePlanCharterEvaluation(value)).toBeNull();
});

test("actual persisted original sources, DB-attested model and runtime feed a restarted full-charter reader", () => {
  test.setTimeout(300000);
  const result = spawnSync(process.execPath, ["scripts/relative-plan-charter-runtime-proof.mjs"], {
    encoding: "utf8", timeout: 290000, env: { ...process.env } });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const receipt = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(receipt).toMatchObject({ status: "pass", environment: "isolated_postgres_postgrest_actual_sdk",
    immutable_actual_database_training_members: 48, original_held_out_decisions: 30, original_walk_forward_decisions: 30,
    original_candidates_per_forward_partition: 120, held_out_admitted_attempts: 31, terminal_failures: 1,
    held_out_reserved_fixture_credits: 248, actual_restarted_full_charter_consumer_verified: true,
    unknown_cost_retains_failure: true, missing_label_retains_original_denominator: true,
    duplicate_completed_original_decision_preserves_population_but_cannot_qualify: true,
    known_concentration_failure_separate_from_missing_evidence: true, forward_losses_never_refit_model: true,
    new_training_rejects_contradictory_retained_candles_before_storage: true,
    valid_legacy_candles_keep_complete_training_population: true, sealed_model_ignores_later_mutable_candles: true,
    durable_terminal_result_verified: false, quality_improvement_verified: false,
    provider_requests: 0, production_writes: 0, broker_actions: 0 });
});

test("current v3 original archives retain their basis through actual DB-clock training and restarted full comparison", () => {
  test.setTimeout(480000);
  const result = spawnSync(process.execPath, ["scripts/relative-plan-charter-runtime-proof.mjs",
    "--full-eight-member-population", "--complete-original-archives", "--current-feature-basis"], {
    encoding: "utf8", timeout: 470000, env: { ...process.env } });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const proof = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(proof).toMatchObject({status:"pass",current_feature_basis_verified:true,
    original_feature_basis:"recommendation_decision_feature_vector_v3",
    complete_original_archives:true,immutable_actual_database_training_members:96,
    actual_database_training_clock_verified:true,separate_transaction_committed_model_witness_verified:true,
    historical_model_clock_fixture:false,original_candidates_per_forward_partition:240,
    original_held_out_decisions:30,original_walk_forward_decisions:30,
    missing_label_retains_original_denominator:true,actual_restarted_full_charter_consumer_verified:true,
    eleven_charter_checks_per_partition:true,forward_losses_never_refit_model:true,
    known_concentration_failure_separate_from_missing_evidence:true,actual_loopback_http_readback_verified:true,
    quality_improvement_verified:false,provider_requests:0,production_writes:0,broker_actions:0});
  console.log(JSON.stringify({local_v3_database_clock_training_evidence:proof}));
});

test("complete original archives train with real DB time before synthetic forward comparison", () => {
  // A separate full-original regression; keep the legacy four-member test and
  // its deadline unchanged. Never substitute historical admin model insertion.
  test.setTimeout(480000);
  const result = spawnSync(process.execPath, ["scripts/relative-plan-charter-runtime-proof.mjs",
    "--full-eight-member-population", "--complete-original-archives"], {
    encoding: "utf8", timeout: 470000, env: { ...process.env } });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const receipt = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(receipt).toMatchObject({ status: "pass", environment: "isolated_postgres_postgrest_actual_sdk",
    evidence: "synthetic_closed_not_market_alpha", complete_original_archives: true,
    immutable_actual_database_training_members: 96, actual_database_training_clock_verified: true,
    separate_transaction_committed_model_witness_verified: true, historical_model_clock_fixture: false,
    original_held_out_decisions: 30, original_walk_forward_decisions: 30,
    original_candidates_per_forward_partition: 240, held_out_admitted_attempts: 31, terminal_failures: 1,
    held_out_reserved_fixture_credits: 248, actual_restarted_full_charter_consumer_verified: true,
    eleven_charter_checks_per_partition: true, unknown_cost_retains_failure: true,
    missing_label_retains_original_denominator: true,
    duplicate_completed_original_decision_preserves_population_but_cannot_qualify: true,
    known_concentration_failure_separate_from_missing_evidence: true, forward_losses_never_refit_model: true,
    new_training_rejects_original_input_conflict_before_storage: true,
    sealed_model_ignores_later_mutable_original_inputs: true,
    new_training_rejects_contradictory_retained_candles_before_storage: true,
    valid_legacy_candles_keep_complete_training_population: true, sealed_model_ignores_later_mutable_candles: true,
    actual_loopback_http_readback_verified: true, full_population_transport_encoding: "gzip",
    durable_terminal_result_verified: false, actual_database_finalization_clock_verified: false,
    quality_improvement_verified: false, provider_requests: 0, production_writes: 0, broker_actions: 0 });
  expect(Date.parse(receipt.model_materialized_at)).toBeLessThanOrEqual(Date.parse(receipt.model_committed_read_at));
  expect(Date.parse(receipt.model_committed_read_at)).toBeLessThan(Date.parse(receipt.first_synthetic_forward_window_start_at));
  expect(receipt.complete_original_product_decoded_http_bytes).toBeGreaterThan(5 * 1048576);
  expect(receipt.complete_original_product_http_bytes).toBeLessThanOrEqual(4 * 1048576);
});
