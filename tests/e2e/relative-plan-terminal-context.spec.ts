import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { charterEvaluationInput } from "../fixtures/relative-plan-charter-evaluation";
import { prospectiveReceipt } from "../fixtures/relative-plan-prospective";
import { buildRelativePlanCharterResult, RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION,
  relativePlanTerminalQualityDecision, verifiedRelativePlanCharterResultReceipt } from "@/lib/server/relative-plan-charter-result";
import { relativePlanTerminalContextDiagnostic } from "@/lib/server/relative-plan-terminal-context";
import { createRelativePlanCharterResultStore } from "@/lib/server/relative-plan-charter-result-store";
import { createRelativePlanCharterResultService } from "@/lib/server/relative-plan-charter-result-service";
import { createRelativePlanProspectiveStore } from "@/lib/server/relative-plan-prospective-store";

// Synthetic original sources, not alpha or a real forward cohort. The same
// frozen model sees two unfavorable forward partitions; it is never refitted.
const fixture = charterEvaluationInput(4, { forwardPositiveTickers: ["AAA"] }).then(input => {
  const result = buildRelativePlanCharterResult(input).result!;
  return { input, receipt: { contract_version: RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION,
    result_id: "55555555-5555-4555-8555-555555555555", owner_user_id: input.owner,
    finalized_at: input.now.toISOString(), result } };
});
test.beforeEach(() => test.setTimeout(180000));

test("whole original terminal result exposes conservative setup regression, not policy authority", async () => {
  const { input, receipt } = await fixture;
  expect(verifiedRelativePlanCharterResultReceipt(receipt, input.freeze, input.owner)).toEqual(receipt);
  const before = JSON.stringify(receipt);
  const diagnostic = relativePlanTerminalQualityDecision(receipt).context_diagnostic!;
  expect(diagnostic).toMatchObject({ status: "conservative_regression_detected",
    source: { result_id: receipt.result_id, result_fingerprint: receipt.result.result_fingerprint, terminal_decision: "reject" },
    priority_context: { dimension: "setup", key: "BREAKOUT_CONTINUATION", eligibility: "eligible",
      baseline: { resolved_outcome_count: 180, positive_outcome_count: 60, partition_coverage_count: 2 },
      challenger: { resolved_outcome_count: 180, positive_outcome_count: 0, partition_coverage_count: 2 } },
    quality_improvement_claimed: false, live_policy_effect: false });
  expect(diagnostic.priority_context!.baseline!.precision!.lower).toBeGreaterThan(diagnostic.priority_context!.challenger!.precision!.upper);
  expect(diagnostic.pairs.some(pair => pair.eligibility === "missing_arm")).toBe(true);
  expect(Object.values(diagnostic.authority).every(value => value === false)).toBe(true);
  expect(JSON.stringify(receipt)).toBe(before);
  expect(relativePlanTerminalContextDiagnostic(receipt)).toEqual(diagnostic);
});

test("incomplete, pending and duplicated partition evidence cannot acquire terminal context triage", async () => {
  const { receipt } = await fixture;
  for (const change of ["incomplete", "disposition", "partition", "duplicate", "bad_counts"] as const) {
    const copy = structuredClone(receipt);
    if (change === "incomplete") copy.result.measurement.evidence_complete = false;
    if (change === "disposition") copy.result.measurement.computed_disposition = "evidence_incomplete";
    if (change === "partition") copy.result.measurement.partitions[1].evidence_complete = false;
    if (change === "duplicate") copy.result.measurement.partitions[1].partition = "held_out";
    if (change === "bad_counts") copy.result.measurement.partitions[0].quality.quality_slices[0].dimensions[0].groups[0].positive_outcome_count = 10000;
    expect(relativePlanTerminalContextDiagnostic(copy)).toBeNull();
  }
});

test("all original groups remain, small or one-partition groups stay ineligible, and ordering is deterministic", async () => {
  const { receipt } = await fixture;
  const copy = structuredClone(receipt);
  for (const partition of copy.result.measurement.partitions) for (const arm of partition.quality.quality_slices) {
    const setup = arm.dimensions.find(value => value.dimension === "setup")!;
    setup.groups.push({ ...setup.groups[0], key: "SMALL", selected_candidate_count: 4, resolved_outcome_count: 4,
      positive_outcome_count: arm.arm === "baseline" ? 4 : 0 });
    if (partition.partition === "held_out") setup.groups.push({ ...setup.groups[0], key: "ONE_PARTITION" });
  }
  // This is only an aggregate arithmetic boundary. The owner store rejects
  // such altered measurements; it is not a new accepted durable result.
  const value = relativePlanTerminalContextDiagnostic(copy)!;
  expect(value.pairs.find(pair => pair.key === "SMALL")?.eligibility).toBe("minimum_resolved_not_met");
  expect(value.pairs.find(pair => pair.key === "ONE_PARTITION")?.eligibility).toBe("incomplete_partition_coverage");
  const reversed = structuredClone(copy);
  for (const partition of reversed.result.measurement.partitions) {
    partition.quality.quality_slices.reverse();
    for (const arm of partition.quality.quality_slices) for (const dimension of arm.dimensions) dimension.groups.reverse();
  }
  expect(relativePlanTerminalContextDiagnostic(reversed)).toEqual(value);
});

test("no eligible regression is retained explicitly, never mined into a weaker recommendation", async () => {
  const { receipt } = await fixture;
  const equal = structuredClone(receipt);
  for (const partition of equal.result.measurement.partitions) for (const arm of partition.quality.quality_slices) {
    for (const dimension of arm.dimensions) for (const group of dimension.groups) group.positive_outcome_count = 0;
  }
  const diagnostic = relativePlanTerminalContextDiagnostic(equal)!;
  expect(diagnostic.status).toBe("no_conservative_regression");
  expect(diagnostic.priority_context).toBeNull();
  expect(diagnostic.pairs.filter(pair => pair.eligibility === "eligible").every(pair => pair.classification === "inconclusive")).toBe(true);
  for (const partition of equal.result.measurement.partitions) for (const arm of partition.quality.quality_slices) {
    for (const dimension of arm.dimensions) for (const group of dimension.groups) {
      group.selected_candidate_count = 4; group.resolved_outcome_count = 4;
    }
  }
  expect(relativePlanTerminalContextDiagnostic(equal)).toMatchObject({ status: "insufficient_evidence", priority_context: null });
});

test("restarted owner service uses verified stored result only; forged or foreign capsules cannot supply triage", async () => {
  const { input, receipt } = await fixture;
  let reads = 0;
  const sourceBefore = JSON.stringify(input.source);
  const service = (stored: unknown) => createRelativePlanCharterResultService({
    prospectiveStore: () => createRelativePlanProspectiveStore({
      async read(owner) { return owner === input.owner ? { status: "available", receipt: prospectiveReceipt() }
        : { status: "not_found", receipt: null }; },
      async freeze() { throw new Error("must_not_freeze"); } }),
    resultStore: () => createRelativePlanCharterResultStore({ async read() { reads++; return { status: "available", receipt: stored }; },
      async finalize() { throw new Error("must_not_finalize"); } }),
    modelStore: () => { throw new Error("must_not_refit"); },
    readSource: async () => { throw new Error("must_not_read_mutable_source"); },
    readRuntime: async () => { throw new Error("must_not_read_mutable_runtime"); }, clock: () => new Date(NaN),
  });
  const first = await service(receipt).read(input.owner);
  expect(first.terminal_quality_decision?.context_diagnostic?.status).toBe("conservative_regression_detected");
  input.source.outcomes.length = 0;
  expect(await service(receipt).read(input.owner)).toEqual(first);
  const forged = structuredClone(receipt);
  forged.result.measurement.partitions[0].quality.quality_slices[0].dimensions[0].groups[0].positive_outcome_count++;
  expect((await service(forged).read(input.owner)).terminal_quality_decision).toBeNull();
  expect((await service(receipt).read("33333333-3333-4333-8333-333333333333")).terminal_quality_decision).toBeNull();
  expect(reads).toBe(3);
  // Restore only this fixture's synthetic data for other tests; no real store write.
  Object.assign(input.source, JSON.parse(sourceBefore));
});

test("actual finalized SQL SDK and HTTP readback retains contextual regression after mutable source edits", () => {
  test.setTimeout(480000);
  const result = spawnSync(process.execPath, ["scripts/relative-plan-charter-runtime-proof.mjs", "--finalized-result", "--terminal-context-regression"], {
    encoding: "utf8", timeout: 470000, env: { ...process.env },
  });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const proof = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(proof).toMatchObject({ status: "pass", terminal_context_readback_verified: true,
    terminal_context_regression_fixture: true, durable_terminal_result_verified: true,
    actual_loopback_http_readback_verified: true, finalized_capsule_ignores_later_mutable_revision: true,
    original_candidates_per_forward_partition: 120, quality_improvement_verified: false,
    provider_requests: 0, production_writes: 0, broker_actions: 0 });
  console.log(JSON.stringify({ local_terminal_context_evidence: proof }));
});

test("complete original eight-member archives retain contextual regression through actual SQL SDK and negotiated HTTP", () => {
  // Joint integration acceptance, never a smaller population replacing the
  // existing four-member fixture or the frozen prospective production cohort.
  test.setTimeout(480000);
  const result = spawnSync(process.execPath, ["scripts/relative-plan-charter-runtime-proof.mjs", "--finalized-result",
    "--terminal-context-regression", "--full-eight-member-population", "--complete-original-archives"], {
    encoding: "utf8", timeout: 470000, env: { ...process.env },
  });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const proof = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(proof).toMatchObject({ status: "pass", complete_original_archives: true,
    terminal_context_readback_verified: true, terminal_context_regression_fixture: true,
    original_candidates_per_forward_partition: 240, original_held_out_decisions: 30, original_walk_forward_decisions: 30,
    full_original_source_sql_capacity_verified: true, supported_transport_required_before_result_insert: true,
    durable_terminal_result_verified: true, actual_database_finalization_clock_verified: true,
    historical_model_clock_fixture: true, actual_loopback_http_readback_verified: true,
    finalized_capsule_ignores_later_mutable_revision: true, sealed_result_ignores_later_mutable_original_inputs: true,
    sealed_result_ignores_later_mutable_forward_candles: true,
    new_result_rejects_contradictory_retained_forward_candles_before_storage: true,
    new_result_rejects_contradictory_retained_horizon_r_before_storage: true,
    new_result_rejects_contradictory_retained_fallback_horizon_r_before_storage: true,
    finalized_product_transport_encoding: "gzip", quality_improvement_verified: false,
    provider_requests: 0, production_writes: 0, broker_actions: 0 });
  expect(proof.full_original_source_decoded_bytes).toBeGreaterThan(16 * 1048576);
  expect(proof.full_original_source_decoded_bytes).toBeLessThanOrEqual(32 * 1048576);
  expect(proof.complete_finalized_product_decoded_http_bytes).toBeGreaterThan(5 * 1048576);
  expect(proof.complete_finalized_product_decoded_http_bytes).toBeLessThanOrEqual(16 * 1048576);
  expect(proof.complete_finalized_product_http_bytes).toBeLessThanOrEqual(4 * 1048576);
  console.log(JSON.stringify({ local_complete_original_terminal_context_evidence: proof }));
});
