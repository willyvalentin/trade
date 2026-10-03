import "server-only";
import { gzipSync,gunzipSync } from "node:zlib";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { buildRelativePlanCharterEvaluation } from "@/lib/server/relative-plan-charter-evaluation";
import { replayRelativePlanCharterRuntimePartition, type RelativePlanRetainedRuntimeRows } from "@/lib/server/relative-plan-charter-runtime-replay";
import type { RelativePlanCharterRuntimeSource } from "@/lib/server/relative-plan-charter-runtime-source";
import { relativePlanSemanticFingerprint, relativePlanSemanticJson, verifiedRelativePlanProspectiveFreeze } from "@/lib/server/relative-plan-prospective-comparison";
import { verifiedRelativePlanTrainedProbabilityReceipt, type RelativePlanTrainedProbabilityReceipt } from "@/lib/server/relative-plan-trained-probability-model";

export const RELATIVE_PLAN_CHARTER_RESULT_VERSION = "relative_plan_charter_result_v1" as const;
export const RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION = "relative_plan_charter_result_receipt_v1" as const;
// Complete evidence only. This is a physical bound, never a cohort selector.
export const RELATIVE_PLAN_CHARTER_RESULT_MAX_BYTES = 8 * 1048576;
export const RELATIVE_PLAN_CHARTER_SOURCE_MAX_BYTES = 8 * 1048576;
type RetainedSource = { encoding: "canonical_json_gzip_base64_v1"; decoded_byte_length: number;
  source_fingerprint: string; payload: string };
type Measurement = NonNullable<ReturnType<typeof buildRelativePlanCharterEvaluation>>;
type RetainedRuntime = { status: "available"; partitions: RelativePlanRetainedRuntimeRows[] } |
  { status: "unavailable"; blocker: string };
export type RelativePlanCharterResult = {
  contract_version: typeof RELATIVE_PLAN_CHARTER_RESULT_VERSION;
  owner_user_id: string; prospective_freeze_id: string; plan_fingerprint: string; charter_fingerprint: string;
  source_as_of: string; retained_source: RetainedSource;
  retained_runtime: RetainedRuntime; trained_model_receipt: RelativePlanTrainedProbabilityReceipt;
  measurement: Measurement; result_fingerprint: string;
  authority: Measurement["authority"];
};
export type RelativePlanCharterResultReceipt = {
  contract_version: typeof RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION;
  result_id: string; owner_user_id: string; finalized_at: string; result: RelativePlanCharterResult;
};
function exact(value: unknown, fields: string[]): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value)) &&
    Object.keys(value).length === fields.length && fields.every(field => Object.hasOwn(value, field));
}
function instant(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
/** Lossless complete evidence, not truncation. Independently bounded decoded
 * bytes prevent zip bombs. The measurement remains readable JSON. */
export function decodeRelativePlanRetainedSource(value: unknown): RecommendationLearningBaselineSource | null {
  try {
    if (!exact(value,["encoding","decoded_byte_length","source_fingerprint","payload"]) ||
      value.encoding !== "canonical_json_gzip_base64_v1" || !Number.isSafeInteger(value.decoded_byte_length) ||
      typeof value.decoded_byte_length !== "number" || value.decoded_byte_length < 1 ||
      value.decoded_byte_length > RELATIVE_PLAN_CHARTER_SOURCE_MAX_BYTES || typeof value.payload !== "string" ||
      value.payload.length > RELATIVE_PLAN_CHARTER_RESULT_MAX_BYTES || typeof value.source_fingerprint !== "string" ||
      !/^[a-f0-9]{64}$/.test(value.source_fingerprint)) return null;
    const compressed = Buffer.from(value.payload,"base64");
    if (compressed.toString("base64") !== value.payload) return null;
    const decoded = gunzipSync(compressed,{ maxOutputLength: RELATIVE_PLAN_CHARTER_SOURCE_MAX_BYTES });
    if (decoded.byteLength !== value.decoded_byte_length) return null;
    const raw = decoded.toString("utf8"), source = JSON.parse(raw);
    if (!exact(source,["scanRuns","snapshots","outcomes"]) ||
      !Object.values(source).every(rows => Array.isArray(rows) && rows.length <= 100000 &&
        rows.every(row => row && typeof row === "object" && !Array.isArray(row))) ||
      relativePlanSemanticJson(source) !== raw || relativePlanSemanticFingerprint(source) !== value.source_fingerprint) return null;
    return source as RecommendationLearningBaselineSource;
  } catch { return null; }
}
export function replayRelativePlanRetainedRuntime(input: {
  owner: string; freeze: unknown; now: Date; retained: unknown;
}): RelativePlanCharterRuntimeSource | null {
  if (exact(input.retained, ["status", "blocker"]) && input.retained.status === "unavailable" &&
    typeof input.retained.blocker === "string" && /^relative_plan_runtime_[a-z_]+$/.test(input.retained.blocker)) {
    return { status: "unavailable", partitions: null, blocker: input.retained.blocker };
  }
  if (!exact(input.retained, ["status", "partitions"]) || input.retained.status !== "available" ||
    !Array.isArray(input.retained.partitions) || input.retained.partitions.length !== 2) return null;
  const partitions = [];
  for (const [index, name] of (["held_out", "walk_forward"] as const).entries()) {
    const rows = input.retained.partitions[index];
    if (!exact(rows, ["partition", "observation_cycles", "scheduled_attempts"]) || rows.partition !== name) return null;
    const replay = replayRelativePlanCharterRuntimePartition({ ...input, rows: rows as RelativePlanRetainedRuntimeRows });
    if (!replay.partition) return null;
    partitions.push(replay.partition);
  }
  return { status: "available", partitions, blocker: null };
}

/** Server-owned candidate. Database finalization separately enforces its actual
 * clock and binds the original persisted plan and already committed model. */
export function buildRelativePlanCharterResult(input: {
  owner: string; freeze: unknown; now: Date; source: RecommendationLearningBaselineSource;
  runtime: RelativePlanCharterRuntimeSource; trainedModelReceipt: unknown;
}) {
  const blocked = (blocker: string) => ({ status: "not_ready" as const, result: null, blocker });
  const freeze = verifiedRelativePlanProspectiveFreeze(input.freeze, input.owner);
  if (!freeze || !Number.isFinite(input.now.getTime()) || input.now.getTime() < Date.parse(freeze.plan.windows.walk_forward.end_at) + 3600000) {
    return blocked("relative_plan_original_forward_windows_and_maturity_required");
  }
  const model = verifiedRelativePlanTrainedProbabilityReceipt(input.trainedModelReceipt, freeze, input.owner);
  if (!model) return blocked("relative_plan_original_committed_training_model_required");
  const selected: RetainedRuntime = input.runtime.status === "unavailable"
    ? { status: "unavailable", blocker: input.runtime.blocker }
    : { status: "available", partitions: input.runtime.partitions.flatMap(partition =>
      partition.retained_rows ? [partition.retained_rows] : []) };
  const runtime = replayRelativePlanRetainedRuntime({ owner: input.owner, freeze, now: input.now, retained: selected });
  if (!runtime) return blocked("relative_plan_complete_original_runtime_rows_required");
  const retained: RetainedRuntime = runtime.status === "unavailable" ? { status: "unavailable",blocker: runtime.blocker }
    : { status: "available",partitions: runtime.partitions.flatMap(partition => partition.retained_rows ? [partition.retained_rows] : []) };
  // Normalize exactly the JSONB representation, not undefined JS-only fields.
  const source: RecommendationLearningBaselineSource = JSON.parse(JSON.stringify(input.source));
  const encodedSource = relativePlanSemanticJson(source), sourceBytes = Buffer.byteLength(encodedSource,"utf8");
  if (sourceBytes > RELATIVE_PLAN_CHARTER_SOURCE_MAX_BYTES) return blocked("relative_plan_complete_source_exceeds_decoded_bound");
  const retainedSource: RetainedSource = { encoding: "canonical_json_gzip_base64_v1",decoded_byte_length: sourceBytes,
    source_fingerprint: relativePlanSemanticFingerprint(source),payload: gzipSync(encodedSource,{ level:6 }).toString("base64") };
  const measurement = buildRelativePlanCharterEvaluation({ owner: input.owner, freeze, source,
    runtime, now: input.now, trainedModelReceipt: model });
  if (!measurement) return blocked("relative_plan_complete_original_evaluation_required");
  const body = { contract_version: RELATIVE_PLAN_CHARTER_RESULT_VERSION, owner_user_id: input.owner,
    prospective_freeze_id: freeze.freeze_id, plan_fingerprint: freeze.plan.plan_fingerprint,
    charter_fingerprint: freeze.plan.charter_fingerprint, source_as_of: input.now.toISOString(),
    retained_source: retainedSource, retained_runtime: retained, trained_model_receipt: model,
    measurement, authority: { ...freeze.plan.authority } };
  const result = { ...body, result_fingerprint: relativePlanSemanticFingerprint(body) };
  if (Buffer.byteLength(relativePlanSemanticJson(result), "utf8") > RELATIVE_PLAN_CHARTER_RESULT_MAX_BYTES) {
    return blocked("relative_plan_complete_result_capsule_too_large");
  }
  return { status: "ready" as const, result, blocker: null };
}

/** Independently reproduce the entire result from its own retained as-of
 * source and real row envelopes. Contemporary outcome upserts are irrelevant.
 * A fingerprint alone, forged disposition or reduced denominator cannot pass. */
export function verifiedRelativePlanCharterResultReceipt(value: unknown, freezeValue: unknown,
  owner: string): RelativePlanCharterResultReceipt | null {
  try {
    const freeze = verifiedRelativePlanProspectiveFreeze(freezeValue, owner);
    if (!freeze || !exact(value, ["contract_version", "result_id", "owner_user_id", "finalized_at", "result"]) ||
      value.contract_version !== RELATIVE_PLAN_CHARTER_RESULT_RECEIPT_VERSION || value.owner_user_id !== owner ||
      typeof value.result_id !== "string" || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value.result_id) ||
      !instant(value.finalized_at) || !exact(value.result, ["contract_version", "owner_user_id", "prospective_freeze_id",
        "plan_fingerprint", "charter_fingerprint", "source_as_of", "retained_source", "retained_runtime",
        "trained_model_receipt", "measurement", "authority", "result_fingerprint"])) return null;
    const raw = value.result;
    if (raw.contract_version !== RELATIVE_PLAN_CHARTER_RESULT_VERSION || raw.owner_user_id !== owner ||
      raw.prospective_freeze_id !== freeze.freeze_id || raw.plan_fingerprint !== freeze.plan.plan_fingerprint ||
      raw.charter_fingerprint !== freeze.plan.charter_fingerprint || !instant(raw.source_as_of) ||
      Date.parse(raw.source_as_of) > Date.parse(value.finalized_at) ||
      relativePlanSemanticJson(raw.authority) !== relativePlanSemanticJson(freeze.plan.authority) ||
      Buffer.byteLength(relativePlanSemanticJson(raw), "utf8") > RELATIVE_PLAN_CHARTER_RESULT_MAX_BYTES) return null;
    const source = decodeRelativePlanRetainedSource(raw.retained_source);
    if (!source) return null;
    const runtime = replayRelativePlanRetainedRuntime({ owner, freeze, now: new Date(raw.source_as_of), retained: raw.retained_runtime });
    if (!runtime) return null;
    const rebuilt = buildRelativePlanCharterResult({ owner, freeze, now: new Date(raw.source_as_of),
      source, runtime, trainedModelReceipt: raw.trained_model_receipt });
    if (!rebuilt.result) return null;
    // Verify decoded canonical evidence, not compressor implementation details
    // that may change across a future Node/zlib upgrade. Bind the exact stored
    // representation into its original immutable fingerprint.
    const { result_fingerprint: _binding,...body } = { ...rebuilt.result,retained_source: raw.retained_source };
    void _binding;
    return relativePlanSemanticJson({ ...body,result_fingerprint: relativePlanSemanticFingerprint(body) }) === relativePlanSemanticJson(raw)
      ? value as RelativePlanCharterResultReceipt : null;
  } catch { return null; }
}

export function relativePlanTerminalQualityDecision(receipt: RelativePlanCharterResultReceipt) {
  return { disposition: receipt.result.measurement.computed_disposition, result_id: receipt.result_id,
    result_fingerprint: receipt.result.result_fingerprint, finalized_at: receipt.finalized_at,
    evidence_complete: receipt.result.measurement.evidence_complete,
    missing_dimensions: receipt.result.measurement.missing_dimensions,
    measured_limit_failures: receipt.result.measurement.measured_limit_failures,
    quality_improvement_claimed: false, live_policy_effect: false,
    next_action: receipt.result.measurement.computed_disposition === "continue"
      ? "shadow_validation_only_not_policy_promotion" : "investigate_frozen_result_without_live_policy_change",
    authority: receipt.result.authority };
}
