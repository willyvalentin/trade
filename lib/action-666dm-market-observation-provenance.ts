import { createHash } from "node:crypto";

const inputContractVersion = "action_666dm_market_observation_input_v1" as const;
const provenanceContractVersion = "action_666dm_market_observation_provenance_v1" as const;
const maximumCanonicalInputBytes = 8_192;
const digestPattern = /^[0-9a-f]{64}$/;
const sourceIdentityPattern = /^market_source:v1:[0-9a-f]{64}$/;
const instrumentIdentityPattern =
  /^instrument:[A-Z0-9]{2,16}:[A-Z0-9][A-Z0-9._-]{0,63}$/;
const canonicalInstantPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{9})Z$/;

type PlainRecord = Record<string, unknown>;
type FailureCode =
  | "invalid_input_type"
  | "input_budget_exceeded"
  | "invalid_json"
  | "noncanonical_input"
  | "invalid_contract_version"
  | "invalid_shape"
  | "invalid_instrument_identity"
  | "invalid_source_identity"
  | "invalid_observed_at"
  | "invalid_payload_digest"
  | "invalid_provenance";

export type Action666dmMarketObservationProvenance = Readonly<{
  contract_version: typeof provenanceContractVersion;
  instrument_identity: string;
  market_data_contract_version: typeof provenanceContractVersion;
  market_data_observation_identity: string;
  market_data_observed_at: string;
  market_data_digest: string;
  source_identity: string;
  provenance_digest: string;
  side_effects_performed: false;
}>;

export type Action666dmConstructionResult =
  | Readonly<{ ok: true; value: Action666dmMarketObservationProvenance }>
  | Readonly<{ ok: false; error_code: FailureCode; error_path: string | null }>;

export type Action666dmValidationResult =
  | Readonly<{ valid: true; value: Action666dmMarketObservationProvenance }>
  | Readonly<{ valid: false; error_code: FailureCode; error_path: string | null }>;

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value as PlainRecord)) deepFreeze(nested);
  return Object.freeze(value);
}

function failure(error_code: FailureCode, error_path: string | null): Action666dmConstructionResult {
  return deepFreeze({ ok: false, error_code, error_path });
}

function validationFailure(error_code: FailureCode, error_path: string | null): Action666dmValidationResult {
  return deepFreeze({ valid: false, error_code, error_path });
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

function isCanonicalInstant(value: string): boolean {
  const match = canonicalInstantPattern.exec(value);
  if (!match || match[1] === "0000") return false;
  const milliseconds = Date.parse(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}.${match[7].slice(0, 3)}Z`);
  if (!Number.isSafeInteger(milliseconds)) return false;
  return new Date(milliseconds).toISOString() === `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}.${match[7].slice(0, 3)}Z`;
}

function isCanonicalInstrumentIdentity(value: string): boolean {
  return instrumentIdentityPattern.test(value);
}

function parseCanonicalObject(input: unknown): Readonly<{ value: PlainRecord }> | Action666dmConstructionResult {
  if (typeof input !== "string") return failure("invalid_input_type", null);
  if (Buffer.byteLength(input, "utf8") > maximumCanonicalInputBytes) return failure("input_budget_exceeded", null);
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
  instrument_identity: string;
  source_identity: string;
  source_observed_at: string;
  source_payload_digest: string;
}>;

function normalizeInput(record: PlainRecord): Readonly<{ value: NormalizedInput }> | Action666dmConstructionResult {
  const expectedKeys = [
    "contract_version",
    "instrument_identity",
    "source_identity",
    "source_observed_at",
    "source_payload_digest",
  ].sort(compareUtf8);
  const keys = Object.keys(record).sort(compareUtf8);
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    return failure("invalid_shape", null);
  }
  if (record.contract_version !== inputContractVersion) return failure("invalid_contract_version", "/contract_version");
  if (typeof record.instrument_identity !== "string" || !isCanonicalInstrumentIdentity(record.instrument_identity)) {
    return failure("invalid_instrument_identity", "/instrument_identity");
  }
  if (typeof record.source_identity !== "string" || !sourceIdentityPattern.test(record.source_identity)) {
    return failure("invalid_source_identity", "/source_identity");
  }
  if (typeof record.source_observed_at !== "string" || !isCanonicalInstant(record.source_observed_at)) {
    return failure("invalid_observed_at", "/source_observed_at");
  }
  if (typeof record.source_payload_digest !== "string" || !digestPattern.test(record.source_payload_digest)) {
    return failure("invalid_payload_digest", "/source_payload_digest");
  }
  return {
    value: {
      instrument_identity: record.instrument_identity,
      source_identity: record.source_identity,
      source_observed_at: record.source_observed_at,
      source_payload_digest: record.source_payload_digest,
    },
  };
}

function construct(normalized: NormalizedInput): Action666dmMarketObservationProvenance {
  const identityProjection = {
    contract_version: provenanceContractVersion,
    domain: "trade.market_observation.identity.v1",
    instrument_identity: normalized.instrument_identity,
    source_identity: normalized.source_identity,
    source_observed_at: normalized.source_observed_at,
    source_payload_digest: normalized.source_payload_digest,
  };
  const valueWithoutDigest = {
    contract_version: provenanceContractVersion,
    instrument_identity: normalized.instrument_identity,
    market_data_contract_version: provenanceContractVersion,
    market_data_digest: normalized.source_payload_digest,
    market_data_observation_identity: `market_observation:v1:${sha256(identityProjection)}`,
    market_data_observed_at: normalized.source_observed_at,
    side_effects_performed: false as const,
    source_identity: normalized.source_identity,
  };
  const provenanceDigest = sha256({
    contract_version: provenanceContractVersion,
    domain: "trade.market_observation.provenance.v1",
    projection: valueWithoutDigest,
  });
  return deepFreeze({
    contract_version: valueWithoutDigest.contract_version,
    instrument_identity: valueWithoutDigest.instrument_identity,
    market_data_contract_version: valueWithoutDigest.market_data_contract_version,
    market_data_digest: valueWithoutDigest.market_data_digest,
    market_data_observation_identity: valueWithoutDigest.market_data_observation_identity,
    market_data_observed_at: valueWithoutDigest.market_data_observed_at,
    provenance_digest: provenanceDigest,
    side_effects_performed: valueWithoutDigest.side_effects_performed,
    source_identity: valueWithoutDigest.source_identity,
  });
}

/**
 * Accepts only a canonical, sanitized JSON commitment. It cannot read a
 * provider payload, environment variable, route, database, or network.
 */
export function createAction666dmMarketObservationProvenance(input: unknown): Action666dmConstructionResult {
  const parsed = parseCanonicalObject(input);
  if (!("value" in parsed)) return parsed;
  const normalized = normalizeInput(parsed.value as PlainRecord);
  if (!("value" in normalized)) return normalized;
  return deepFreeze({ ok: true, value: construct(normalized.value as NormalizedInput) });
}

/**
 * Verifies a canonical serialized provenance value by reconstructing it from
 * its opaque source commitment. It is a validation primitive, not an adapter.
 */
export function validateAction666dmMarketObservationProvenance(input: unknown): Action666dmValidationResult {
  const parsed = parseCanonicalObject(input);
  if (!("value" in parsed)) return validationFailure(parsed.error_code, parsed.error_path);
  const record = parsed.value;
  const expectedKeys = [
    "contract_version",
    "instrument_identity",
    "market_data_contract_version",
    "market_data_observation_identity",
    "market_data_observed_at",
    "market_data_digest",
    "provenance_digest",
    "side_effects_performed",
    "source_identity",
  ].sort(compareUtf8);
  const keys = Object.keys(record).sort(compareUtf8);
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    return validationFailure("invalid_shape", null);
  }
  if (record.contract_version !== provenanceContractVersion || record.market_data_contract_version !== provenanceContractVersion) {
    return validationFailure("invalid_contract_version", "/contract_version");
  }
  if (typeof record.instrument_identity !== "string" || !isCanonicalInstrumentIdentity(record.instrument_identity)) {
    return validationFailure("invalid_instrument_identity", "/instrument_identity");
  }
  if (typeof record.source_identity !== "string" || !sourceIdentityPattern.test(record.source_identity)) {
    return validationFailure("invalid_source_identity", "/source_identity");
  }
  if (typeof record.market_data_observed_at !== "string" || !isCanonicalInstant(record.market_data_observed_at)) {
    return validationFailure("invalid_observed_at", "/market_data_observed_at");
  }
  if (typeof record.market_data_digest !== "string" || !digestPattern.test(record.market_data_digest)) {
    return validationFailure("invalid_payload_digest", "/market_data_digest");
  }
  if (typeof record.market_data_observation_identity !== "string" || !/^market_observation:v1:[0-9a-f]{64}$/.test(record.market_data_observation_identity)) {
    return validationFailure("invalid_provenance", "/market_data_observation_identity");
  }
  if (typeof record.provenance_digest !== "string" || !digestPattern.test(record.provenance_digest) || record.side_effects_performed !== false) {
    return validationFailure("invalid_provenance", "/provenance_digest");
  }
  const constructed = construct({
    instrument_identity: record.instrument_identity,
    source_identity: record.source_identity,
    source_observed_at: record.market_data_observed_at,
    source_payload_digest: record.market_data_digest,
  });
  if (canonicalJson(constructed) !== input) return validationFailure("invalid_provenance", null);
  return deepFreeze({ valid: true, value: constructed });
}
