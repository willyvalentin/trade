import { expect,test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { charterEvaluationInput } from "../fixtures/relative-plan-charter-evaluation";
import { buildRelativePlanCharterResult, verifiedRelativePlanCharterResultReceipt,
  relativePlanTerminalQualityDecision, RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION } from "@/lib/server/relative-plan-charter-result";
import { relativePlanSemanticFingerprint } from "@/lib/server/relative-plan-prospective-comparison";
import { decodeRelativePlanRetainedSource,RELATIVE_PLAN_CHARTER_SOURCE_MAX_BYTES } from "@/lib/server/relative-plan-charter-result";
import { gzipSync } from "node:zlib";
import { prospectiveSource } from "../fixtures/relative-plan-prospective-source";
import { scopeRelativePlanCharterResultSource } from "@/lib/server/relative-plan-charter-result";
import { verifiedRelativePlanProspectiveFreeze, relativePlanSemanticJson } from "@/lib/server/relative-plan-prospective-comparison";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { relativePlanOriginalInputConflict } from "@/lib/server/relative-plan-original-input-admission";
import { relativePlanCompleteHttpResponse, relativePlanCompleteResponseFitsTransport } from "@/lib/server/relative-plan-complete-http-response";
import { gunzipSync } from "node:zlib";

const fixture = charterEvaluationInput(4, { outcomePolicy: "retained_pre_ohlc_validation_v2" });
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
  expect(input.source.outcomes.every(outcome =>
    !("candle_validation_policy_version" in (outcome.payload_json.canonical_provider_coverage as Record<string, unknown>)))).toBe(true);
  // Frozen synthetic baseline before formatter reuse: every clock, retained
  // decoded identity and numerical result must remain semantically unchanged.
  // Node/zlib's gzip OS header is not an original evidence identity; Node 24
  // Linux and Node 26 macOS encode identical source with different header bytes.
  expect(receipt.result.measurement.measurement_fingerprint).toBe("cdcf680f51165fc75532c7fc6955d72b8c8c3cd88b2c35af88bd70e0a689d82b");
  const { result_fingerprint, ...body } = receipt.result;
  const { payload, ...originalSourceIdentity } = body.retained_source;
  void payload;
  expect(relativePlanSemanticFingerprint({ ...body, retained_source: originalSourceIdentity }))
    .toBe("c8e0fc1b2e0d0d5365d792dc6d0cdabd66f9fc948c8ed8eb64939bc878a6123d");
  // The exact stored representation remains fully bound, not exempted.
  expect(result_fingerprint).toBe(relativePlanSemanticFingerprint(body));
  expect(verifiedRelativePlanCharterResultReceipt(receipt,input.freeze,input.owner)).toEqual(receipt);
  expect(receipt.result.retained_runtime.status).toBe("available");
  expect(receipt.result.measurement.partitions.map(p=>p.original_population_count)).toEqual([120,120]);
  expect(relativePlanTerminalQualityDecision(receipt)).toMatchObject({ disposition:"reject",evidence_complete:true,
    quality_improvement_claimed:false,live_policy_effect:false });
  expect(Object.values(receipt.result.authority).every(value=>value===false)).toBe(true);
  expect(decodeRelativePlanRetainedSource(receipt.result.retained_source)).toEqual(JSON.parse(JSON.stringify(input.source)));
});
test("runtime-specific gzip framing preserves decoded original evidence but never bypasses the stored binding", async () => {
  const { input, receipt } = await value();
  const changed = structuredClone(receipt);
  const payload = Buffer.from(changed.result.retained_source.payload, "base64");
  payload[9] = payload[9] === 3 ? 19 : 3; // gzip OS field, outside the deflated source.
  changed.result.retained_source.payload = payload.toString("base64");
  expect(decodeRelativePlanRetainedSource(changed.result.retained_source)).toEqual(JSON.parse(JSON.stringify(input.source)));
  expect(verifiedRelativePlanCharterResultReceipt(changed, input.freeze, input.owner)).toBeNull();
  const { result_fingerprint: _binding, ...body } = changed.result;
  void _binding;
  changed.result.result_fingerprint = relativePlanSemanticFingerprint(body);
  expect(verifiedRelativePlanCharterResultReceipt(changed, input.freeze, input.owner)).toEqual(changed);
  expect(changed.result.measurement).toEqual(receipt.result.measurement);
});
test("lossless source decoding rejects malformed, altered, noncanonical and oversized envelopes",async () => {
  const { receipt } = await value(), original = receipt.result.retained_source;
  for (const changed of [{ ...original,payload:"not_gzip" },{ ...original,payload:original.payload+"\n" },
    { ...original,source_fingerprint:"c".repeat(64) },{ ...original,decoded_byte_length:original.decoded_byte_length-1 },
    { ...original,decoded_byte_length:RELATIVE_PLAN_CHARTER_SOURCE_MAX_BYTES+1 },{ ...original,encoding:"raw_json" }]) {
    expect(decodeRelativePlanRetainedSource(changed)).toBeNull();
  }
  // A lying declared length must not bypass the actual decompressor cap.
  expect(decodeRelativePlanRetainedSource({ ...original, decoded_byte_length: 1,
    payload: gzipSync("x".repeat(RELATIVE_PLAN_CHARTER_SOURCE_MAX_BYTES + 1)).toString("base64") })).toBeNull();
});
test("eight-member complete source fits bounded storage without dropping a training or forward member", async () => {
  const input = await charterEvaluationInput(8), built = buildRelativePlanCharterResult(input);
  expect(built.status, built.blocker ?? "").toBe("ready");
  const result = built.result!;
  expect(result.retained_source.decoded_byte_length).toBeGreaterThan(8 * 1048576);
  expect(result.retained_source.decoded_byte_length).toBeLessThanOrEqual(RELATIVE_PLAN_CHARTER_SOURCE_MAX_BYTES);
  expect(Buffer.byteLength(JSON.stringify(result))).toBeLessThan(5 * 1048576);
  expect(result.measurement.partitions.map(part => part.original_population_count)).toEqual([240, 240]);
  expect(result.trained_model_receipt.trained_model.original_population_count).toBe(96);
  expect(decodeRelativePlanRetainedSource(result.retained_source)).toEqual(JSON.parse(JSON.stringify(input.source)));
  expect(verifiedRelativePlanCharterResultReceipt({ contract_version: RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION,
    result_id: "55555555-5555-4555-8555-555555555555", owner_user_id: input.owner,
    finalized_at: input.now.toISOString(), result }, input.freeze, input.owner)?.result).toEqual(result);
});
test("complete original archives survive full charter retention without losing any original member", async () => {
  const input = await charterEvaluationInput(8, { originalInputs: true });
  expect(await relativePlanOriginalInputConflict(input.source.scanRuns)).toBeNull();
  const json = relativePlanSemanticJson(JSON.parse(JSON.stringify(input.source)));
  expect(Buffer.byteLength(json)).toBeGreaterThan(16 * 1048576);
  expect(input.source.scanRuns).toHaveLength(72);
  const built = buildRelativePlanCharterResult(input);
  expect(built.status, built.blocker ?? "").toBe("ready");
  const result = built.result!;
  expect(result.trained_model_receipt.trained_model.original_population_count).toBe(96);
  expect(result.measurement.partitions.map(part => part.original_population_count)).toEqual([240, 240]);
  expect(result.retained_source.decoded_byte_length).toBe(Buffer.byteLength(json));
  expect(decodeRelativePlanRetainedSource(result.retained_source)).toEqual(JSON.parse(json));
  expect(Buffer.byteLength(JSON.stringify(result))).toBeLessThan(8 * 1048576);
  const receipt = { contract_version: RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION,
    result_id: "55555555-5555-4555-8555-555555555555", owner_user_id: input.owner,
    finalized_at: input.now.toISOString(), result };
  expect(verifiedRelativePlanCharterResultReceipt(receipt, input.freeze, input.owner)).toEqual(receipt);
  expect(relativePlanTerminalQualityDecision(receipt)).toMatchObject({ disposition: "reject",
    quality_improvement_claimed: false, live_policy_effect: false });
  const envelope = { status: "already_finalized", receipt, blocker: null,
    terminal_quality_decision: relativePlanTerminalQualityDecision(receipt), quality_improvement_claimed: false };
  expect(Buffer.byteLength(JSON.stringify(envelope))).toBeGreaterThan(5 * 1048576);
  for (const acceptEncoding of [undefined, "br", "gzip;q=0, *;q=1", "gzip;q=2"]) {
    expect(relativePlanCompleteResponseFitsTransport(envelope, acceptEncoding)).toBe(false);
    expect(relativePlanCompleteHttpResponse(envelope, { status: 200, headers: {}, acceptEncoding }).status).toBe(503);
  }
  expect(relativePlanCompleteResponseFitsTransport(envelope, "gzip")).toBe(true);
  const response = relativePlanCompleteHttpResponse(envelope, { status: 201, headers: {}, acceptEncoding: "gzip" });
  expect(response.status).toBe(201);
  expect(response.headers.get("content-encoding")).toBe("gzip");
  const wire = Buffer.from(await response.arrayBuffer());
  expect(wire.byteLength).toBeLessThan(4 * 1048576);
  expect(wire.toString("base64").length).toBeLessThan(6_000_000);
  expect(JSON.parse(gunzipSync(wire).toString("utf8"))).toEqual(JSON.parse(JSON.stringify(envelope)));
});
test("unrelated pre-window history cannot exhaust full eight-member result retention or change its measurement", async () => {
  const input = await charterEvaluationInput(8), original = buildRelativePlanCharterResult(input).result!;
  const older = await Promise.all(Array.from({ length: 12 }, (_, index) =>
    prospectiveSource({ now: new Date(Date.UTC(2026, 8, 18, 15, index * 5)), rankedCount: 8 })));
  const source = { scanRuns: [...older.flatMap(part => part.scanRuns), ...input.source.scanRuns],
    snapshots: [...older.flatMap(part => part.snapshots), ...input.source.snapshots],
    outcomes: [...older.flatMap(part => part.outcomes), ...input.source.outcomes] };
  expect(Buffer.byteLength(relativePlanSemanticJson(source))).toBeGreaterThan(16 * 1048576);
  const built = buildRelativePlanCharterResult({ ...input, source });
  expect(built.status, built.blocker ?? "").toBe("ready");
  expect(built.result).toEqual(original);
  expect(decodeRelativePlanRetainedSource(built.result!.retained_source)).toEqual(JSON.parse(JSON.stringify(input.source)));
});
test("source scoping retains unresolved members, overflow, undecidable clocks and colliding original identities", async () => {
  const { input } = await value(), freeze = verifiedRelativePlanProspectiveFreeze(input.freeze, input.owner)!;
  const older = await prospectiveSource({ now: new Date("2026-09-18T15:00:00.000Z") });
  const overflow = await prospectiveSource({ now: new Date("2026-10-15T17:00:00.000Z") });
  const unknown: RecommendationLearningBaselineSource["scanRuns"][number] = structuredClone(older.scanRuns[0]);
  unknown.payload_json = {};
  const duplicateRun = { ...older.scanRuns[0], run_fingerprint: input.source.scanRuns[0].run_fingerprint };
  const duplicateSnapshot = { ...older.snapshots[0], snapshot_fingerprint: input.source.snapshots[0].snapshot_fingerprint };
  const duplicateOutcome = { ...older.outcomes[0], id: input.source.outcomes[0].id };
  const source = { scanRuns: [...input.source.scanRuns, ...overflow.scanRuns, unknown, duplicateRun],
    snapshots: [...input.source.snapshots, ...overflow.snapshots, duplicateSnapshot],
    outcomes: [...input.source.outcomes, ...overflow.outcomes, duplicateOutcome] };
  const projected = scopeRelativePlanCharterResultSource(source, freeze);
  expect(projected).toEqual(source);
  // No label/horizon/status selector may reduce a member or an ambiguity.
  const missing = structuredClone(input.source); missing.outcomes = [];
  expect(scopeRelativePlanCharterResultSource(missing, freeze)).toEqual(missing);
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
    unobserved_current_revision_rejected_without_population_reduction:true,current_revision_cannot_finalize:true,
    finalized_capsule_ignores_later_mutable_revision:true,
    quality_improvement_verified:false,provider_requests:0,production_writes:0,broker_actions:0 });
  expect(proof.complete_finalized_product_http_bytes).toBeGreaterThan(0);
  expect(proof.complete_finalized_product_http_bytes).toBeLessThanOrEqual(5*1048576);
  console.log(JSON.stringify({ local_charter_finalization_evidence:proof }));
});
test("full eight-member population survives actual SQL finalization and negotiated HTTP readback", () => {
  test.setTimeout(480000);
  const result = spawnSync(process.execPath, ["scripts/relative-plan-charter-runtime-proof.mjs", "--finalized-result", "--full-eight-member-population"], {
    encoding: "utf8", timeout: 470000, env: { ...process.env },
  });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const proof = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(proof).toMatchObject({ status: "pass", original_candidates_per_forward_partition: 240,
    durable_terminal_result_verified: true, actual_database_finalization_clock_verified: true,
    historical_model_clock_fixture: true, actual_loopback_http_readback_verified: true,
    unrelated_pre_window_decisions_persisted_and_preserved: 12,
    unobserved_current_revision_rejected_without_population_reduction: true,current_revision_cannot_finalize: true,
    finalized_capsule_ignores_later_mutable_revision: true,
    full_population_transport_encoding: "gzip", quality_improvement_verified: false,
    provider_requests: 0, production_writes: 0, broker_actions: 0 });
  expect(proof.complete_original_product_decoded_http_bytes).toBeGreaterThan(5 * 1048576);
  expect(proof.complete_finalized_product_http_bytes).toBeLessThanOrEqual(5 * 1048576);
  expect(proof.complete_original_product_http_bytes).toBeLessThanOrEqual(4 * 1048576);
  console.log(JSON.stringify({ local_eight_member_charter_evidence: proof }));
});
test("complete original archives survive actual SQL capacity migration and restarted negotiated readback", () => {
  test.setTimeout(480000);
  const result = spawnSync(process.execPath, ["scripts/relative-plan-charter-runtime-proof.mjs", "--finalized-result",
    "--full-eight-member-population", "--complete-original-archives"], {
    encoding: "utf8", timeout: 470000, env: { ...process.env },
  });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  const proof = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
  expect(proof).toMatchObject({ status: "pass", complete_original_archives: true,
    original_candidates_per_forward_partition: 240, full_original_source_sql_capacity_verified: true,
    supported_transport_required_before_result_insert: true, durable_terminal_result_verified: true,
    result_prewrite_guards_verified: true, actual_database_finalization_clock_verified: true,
    historical_model_clock_fixture: true, actual_loopback_http_readback_verified: true,
    sealed_result_ignores_later_mutable_original_inputs: true,
    unrelated_pre_window_decisions_persisted_and_preserved: 12,
    finalized_product_transport_encoding: "gzip", quality_improvement_verified: false,
    provider_requests: 0, production_writes: 0, broker_actions: 0 });
  expect(proof.full_original_source_decoded_bytes).toBeGreaterThan(16 * 1048576);
  expect(proof.full_original_source_decoded_bytes).toBeLessThanOrEqual(32 * 1048576);
  expect(proof.complete_finalized_product_decoded_http_bytes).toBeGreaterThan(5 * 1048576);
  expect(proof.complete_finalized_product_decoded_http_bytes).toBeLessThanOrEqual(16 * 1048576);
  expect(proof.complete_finalized_product_http_bytes).toBeLessThanOrEqual(4 * 1048576);
  console.log(JSON.stringify({ local_complete_original_charter_evidence: proof }));
});
