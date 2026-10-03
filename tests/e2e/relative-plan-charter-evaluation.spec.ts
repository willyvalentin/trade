import { expect, test } from "@playwright/test";
import { buildRelativePlanCharterEvaluation } from "@/lib/server/relative-plan-charter-evaluation";
import { buildRelativePlanProspectiveLearning } from "@/lib/server/relative-plan-prospective-learning";
import { charterEvaluationInput } from "../fixtures/relative-plan-charter-evaluation";
import { spawnSync } from "node:child_process";

const source = charterEvaluationInput();
async function input() { return structuredClone(await source); }
test.beforeEach(() => test.setTimeout(90000)); // Full original 60-decision source replay, not a shortened sample.

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
    known_concentration_failure_separate_from_missing_evidence: true, forward_losses_never_refit_model: true,
    durable_terminal_result_verified: false, quality_improvement_verified: false,
    provider_requests: 0, production_writes: 0, broker_actions: 0 });
});
