import { createHash } from "node:crypto";

import {
  assessAction666dnMarketObservationReadback,
} from "./action-666dn-market-observation-readback-boundary";

const inputContractVersion =
  "action_666do_market_price_attestation_input_v1" as const;
const attestationContractVersion =
  "action_666do_market_price_attestation_v1" as const;
const readbackInputContractVersion =
  "action_666dn_market_observation_readback_input_v1" as const;
const maximumCanonicalInputBytes = 16_384;
const maximumPriceUnits = (BigInt(1) << BigInt(127)) - BigInt(1);
const canonicalPositiveIntegerText = /^[1-9][0-9]*$/;

type PlainRecord = Record<string, unknown>;
type FailureCode =
  | "invalid_input_type"
  | "input_budget_exceeded"
  | "invalid_json"
  | "noncanonical_input"
  | "invalid_contract_version"
  | "invalid_shape"
  | "invalid_price_units"
  | "invalid_freshness_assessment"
  | "freshness_refused";

export type Action666doMarketPriceAttestation = Readonly<{
  attestation_identity: string;
  contract_version: typeof attestationContractVersion;
  current_price_units: string;
  freshness_assessment_identity: string;
  market_data_digest: string;
  market_data_observation_identity: string;
  market_data_observed_at: string;
  runtime_authority_granted: false;
  side_effects_performed: false;
}>;

export type Action666doAttestationResult =
  | Readonly<{ ok: true; value: Action666doMarketPriceAttestation }>
  | Readonly<{ ok: false; error_code: FailureCode; error_path: string | null }>;

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value as PlainRecord)) deepFreeze(nested);
  return Object.freeze(value);
}

function failure(
  error_code: FailureCode,
  error_path: string | null,
): Action666doAttestationResult {
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

function parseCanonicalObject(
  input: unknown,
): Readonly<{ value: PlainRecord }> | Action666doAttestationResult {
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
  current_price_units: string;
  decision_requested_at: string;
  market_observation_provenance: string;
  monitor_observed_at: string;
}>;

function normalizeInput(
  record: PlainRecord,
): Readonly<{ value: NormalizedInput }> | Action666doAttestationResult {
  const expectedKeys = [
    "contract_version",
    "current_price_units",
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
  if (
    typeof record.current_price_units !== "string" ||
    !canonicalPositiveIntegerText.test(record.current_price_units) ||
    BigInt(record.current_price_units) > maximumPriceUnits
  ) {
    return failure("invalid_price_units", "/current_price_units");
  }
  if (typeof record.market_observation_provenance !== "string") {
    return failure("invalid_freshness_assessment", "/market_observation_provenance");
  }
  if (typeof record.monitor_observed_at !== "string") {
    return failure("invalid_freshness_assessment", "/monitor_observed_at");
  }
  if (typeof record.decision_requested_at !== "string") {
    return failure("invalid_freshness_assessment", "/decision_requested_at");
  }
  return {
    value: {
      current_price_units: record.current_price_units,
      decision_requested_at: record.decision_requested_at,
      market_observation_provenance: record.market_observation_provenance,
      monitor_observed_at: record.monitor_observed_at,
    },
  };
}

function construct(
  normalized: NormalizedInput,
): Action666doAttestationResult {
  const readbackInput = canonicalJson({
    contract_version: readbackInputContractVersion,
    decision_requested_at: normalized.decision_requested_at,
    market_observation_provenance: normalized.market_observation_provenance,
    monitor_observed_at: normalized.monitor_observed_at,
  });
  const assessment = assessAction666dnMarketObservationReadback(readbackInput);
  if (!assessment.ok) return failure("invalid_freshness_assessment", null);
  if (assessment.value.assessment_kind !== "freshness_satisfied") {
    return failure("freshness_refused", "/market_observation_provenance");
  }
  const unsigned = {
    contract_version: attestationContractVersion,
    current_price_units: normalized.current_price_units,
    freshness_assessment_identity: assessment.value.assessment_identity,
    market_data_digest: assessment.value.market_data_digest,
    market_data_observation_identity: assessment.value.market_data_observation_identity,
    market_data_observed_at: assessment.value.market_data_observed_at,
    runtime_authority_granted: false as const,
    side_effects_performed: false as const,
  };
  return deepFreeze({
    ok: true,
    value: deepFreeze({
      attestation_identity: `market_price_attestation:v1:${sha256({
        domain: "trade.market_price.attestation.v1",
        projection: unsigned,
      })}`,
      contract_version: unsigned.contract_version,
      current_price_units: unsigned.current_price_units,
      freshness_assessment_identity: unsigned.freshness_assessment_identity,
      market_data_digest: unsigned.market_data_digest,
      market_data_observation_identity: unsigned.market_data_observation_identity,
      market_data_observed_at: unsigned.market_data_observed_at,
      runtime_authority_granted: unsigned.runtime_authority_granted,
      side_effects_performed: unsigned.side_effects_performed,
    }),
  });
}

/**
 * Binds one exact, sanitized integer price to fresh opaque 666DM/666DN
 * provenance. This is not a provider adapter, truth assertion, monitor,
 * runtime input, database operation, or execution authority.
 */
export function attestAction666doMarketPrice(
  input: unknown,
): Action666doAttestationResult {
  const parsed = parseCanonicalObject(input);
  if (!("value" in parsed)) return parsed;
  const normalized = normalizeInput(parsed.value as PlainRecord);
  if (!("value" in normalized)) return normalized;
  return construct(normalized.value as NormalizedInput);
}
