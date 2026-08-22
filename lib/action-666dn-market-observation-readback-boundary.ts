import { createHash } from "node:crypto";

import {
  validateAction666dmMarketObservationProvenance,
} from "./action-666dm-market-observation-provenance";

const inputContractVersion =
  "action_666dn_market_observation_readback_input_v1" as const;
const boundaryContractVersion =
  "action_666dn_market_observation_readback_boundary_v1" as const;
const maximumCanonicalInputBytes = 16_384;
const maximumMarketDataAgeNanoseconds = BigInt("5000000000");
const canonicalInstantPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{9})Z$/;

type PlainRecord = Record<string, unknown>;
type FailureCode =
  | "invalid_input_type"
  | "input_budget_exceeded"
  | "invalid_json"
  | "noncanonical_input"
  | "invalid_contract_version"
  | "invalid_shape"
  | "invalid_provenance"
  | "invalid_observed_at";
type RefusalCode =
  | "future_market_data"
  | "future_observation"
  | "stale_observation";

export type Action666dnMarketObservationReadbackBoundary = Readonly<{
  assessment_identity: string;
  assessment_kind: "freshness_satisfied" | "freshness_refused";
  contract_version: typeof boundaryContractVersion;
  decision_requested_at: string;
  market_data_digest: string;
  market_data_observation_identity: string;
  market_data_observed_at: string;
  maximum_market_data_age_ns: "5000000000";
  monitor_observed_at: string;
  refusal_code: RefusalCode | null;
  runtime_authority_granted: false;
  side_effects_performed: false;
}>;

export type Action666dnAssessmentResult =
  | Readonly<{ ok: true; value: Action666dnMarketObservationReadbackBoundary }>
  | Readonly<{ ok: false; error_code: FailureCode; error_path: string | null }>;

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value as PlainRecord)) deepFreeze(nested);
  return Object.freeze(value);
}

function failure(
  error_code: FailureCode,
  error_path: string | null,
): Action666dnAssessmentResult {
  return deepFreeze({ ok: false, error_code, error_path });
}

function compareUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("nonfinite_number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value !== "object") throw new Error("unsupported_json_value");
  const record = value as PlainRecord;
  const keys = Object.keys(record).sort(compareUtf8);
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
}

function sha256(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value), "utf8").digest("hex");
}

function asPlainRecord(value: unknown): PlainRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as PlainRecord;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function instantNanoseconds(value: unknown): bigint | null {
  if (typeof value !== "string") return null;
  const match = canonicalInstantPattern.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, nanoText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (
    year < 1 || month < 1 || month > 12 || day < 1 ||
    day > daysInMonth(year, month) || hour > 23 || minute > 59 || second > 59
  ) return null;
  const adjustedYear = year - (month <= 2 ? 1 : 0);
  const era = Math.floor(adjustedYear / 400);
  const yearOfEra = adjustedYear - era * 400;
  const shiftedMonth = month + (month > 2 ? -3 : 9);
  const dayOfYear = Math.floor((153 * shiftedMonth + 2) / 5) + day - 1;
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) -
    Math.floor(yearOfEra / 100) + dayOfYear;
  const daysSinceEpoch = era * 146097 + dayOfEra - 719468;
  const seconds = BigInt(daysSinceEpoch) * BigInt("86400") +
    BigInt(hour * 3600 + minute * 60 + second);
  return seconds * BigInt("1000000000") + BigInt(nanoText);
}

function parseCanonicalObject(
  input: unknown,
): Readonly<{ value: PlainRecord }> | Action666dnAssessmentResult {
  if (typeof input !== "string") return failure("invalid_input_type", null);
  if (Buffer.byteLength(input, "utf8") > maximumCanonicalInputBytes) {
    return failure("input_budget_exceeded", null);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return failure("invalid_json", null);
  }
  const record = asPlainRecord(parsed);
  if (!record) return failure("invalid_shape", null);
  try {
    if (canonicalJson(record) !== input) return failure("noncanonical_input", null);
  } catch {
    return failure("invalid_json", null);
  }
  return { value: record };
}

type NormalizedInput = Readonly<{
  decision_requested_at: string;
  market_observation_provenance: string;
  monitor_observed_at: string;
}>;

function normalizeInput(
  record: PlainRecord,
): Readonly<{ value: NormalizedInput }> | Action666dnAssessmentResult {
  const expectedKeys = [
    "contract_version",
    "decision_requested_at",
    "market_observation_provenance",
    "monitor_observed_at",
  ];
  const keys = Object.keys(record).sort(compareUtf8);
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    return failure("invalid_shape", null);
  }
  if (record.contract_version !== inputContractVersion) {
    return failure("invalid_contract_version", "/contract_version");
  }
  if (typeof record.market_observation_provenance !== "string") {
    return failure("invalid_provenance", "/market_observation_provenance");
  }
  if (!validateAction666dmMarketObservationProvenance(record.market_observation_provenance).valid) {
    return failure("invalid_provenance", "/market_observation_provenance");
  }
  if (
    typeof record.monitor_observed_at !== "string" ||
    instantNanoseconds(record.monitor_observed_at) === null
  ) {
    return failure("invalid_observed_at", "/monitor_observed_at");
  }
  if (
    typeof record.decision_requested_at !== "string" ||
    instantNanoseconds(record.decision_requested_at) === null
  ) {
    return failure("invalid_observed_at", "/decision_requested_at");
  }
  return {
    value: {
      decision_requested_at: record.decision_requested_at,
      market_observation_provenance: record.market_observation_provenance,
      monitor_observed_at: record.monitor_observed_at,
    },
  };
}

function refusalFor(
  marketObservedAt: bigint,
  monitorObservedAt: bigint,
  decisionRequestedAt: bigint,
): RefusalCode | null {
  if (marketObservedAt > monitorObservedAt) return "future_market_data";
  if (monitorObservedAt > decisionRequestedAt) return "future_observation";
  if (decisionRequestedAt - monitorObservedAt >= maximumMarketDataAgeNanoseconds) {
    return "stale_observation";
  }
  if (decisionRequestedAt - marketObservedAt >= maximumMarketDataAgeNanoseconds) {
    return "stale_observation";
  }
  return null;
}

function construct(normalized: NormalizedInput): Action666dnMarketObservationReadbackBoundary {
  const validated = validateAction666dmMarketObservationProvenance(
    normalized.market_observation_provenance,
  );
  if (!validated.valid) throw new Error("validated_provenance_lost");
  const provenance = validated.value;
  const refusal = refusalFor(
    instantNanoseconds(provenance.market_data_observed_at)!,
    instantNanoseconds(normalized.monitor_observed_at)!,
    instantNanoseconds(normalized.decision_requested_at)!,
  );
  const unsigned = {
    assessment_kind: refusal ? "freshness_refused" as const : "freshness_satisfied" as const,
    contract_version: boundaryContractVersion,
    decision_requested_at: normalized.decision_requested_at,
    market_data_digest: provenance.market_data_digest,
    market_data_observation_identity: provenance.market_data_observation_identity,
    market_data_observed_at: provenance.market_data_observed_at,
    maximum_market_data_age_ns: "5000000000" as const,
    monitor_observed_at: normalized.monitor_observed_at,
    refusal_code: refusal,
    runtime_authority_granted: false as const,
    side_effects_performed: false as const,
  };
  const assessmentIdentity = `market_readback_boundary:v1:${sha256({
    domain: "trade.market_observation.readback_boundary.v1",
    projection: unsigned,
  })}`;
  return deepFreeze({
    assessment_identity: assessmentIdentity,
    assessment_kind: unsigned.assessment_kind,
    contract_version: unsigned.contract_version,
    decision_requested_at: unsigned.decision_requested_at,
    market_data_digest: unsigned.market_data_digest,
    market_data_observation_identity: unsigned.market_data_observation_identity,
    market_data_observed_at: unsigned.market_data_observed_at,
    maximum_market_data_age_ns: unsigned.maximum_market_data_age_ns,
    monitor_observed_at: unsigned.monitor_observed_at,
    refusal_code: unsigned.refusal_code,
    runtime_authority_granted: unsigned.runtime_authority_granted,
    side_effects_performed: unsigned.side_effects_performed,
  });
}

/**
 * Assesses only canonical, opaque 666DM provenance against the current 655G
 * freshness ordering. It does not implement a provider adapter or activate a
 * monitor, route, worker, database, broker, or deployment path.
 */
export function assessAction666dnMarketObservationReadback(
  input: unknown,
): Action666dnAssessmentResult {
  const parsed = parseCanonicalObject(input);
  if (!("value" in parsed)) return parsed;
  const normalized = normalizeInput(parsed.value as PlainRecord);
  if (!("value" in normalized)) return normalized;
  return deepFreeze({ ok: true, value: construct(normalized.value as NormalizedInput) });
}
