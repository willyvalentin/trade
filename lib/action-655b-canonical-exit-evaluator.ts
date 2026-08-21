import { createHash } from "node:crypto";

const inputContractVersion = "action_655a6_exit_evaluation_input_v4" as const;
const resultContractVersion = "action_655a6_exit_evaluation_result_v4" as const;
const decisionContractVersion = "action_655a6_exit_decision_v4" as const;
const positionContractVersion = "action_655a6_position_snapshot_v3" as const;
const observationContractVersion = "action_655a2_monitor_observation_v2" as const;
const maximumInputUtf8Bytes = 65_536;
const bigIntZero = BigInt(0);
const bigIntOne = BigInt(1);
const maximumStoredInteger = (bigIntOne << BigInt(127)) - bigIntOne;
const maximumIntermediate = (bigIntOne << BigInt(256)) - bigIntOne;
const lowerHexDigest = /^[0-9a-f]{64}$/;
const canonicalUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const canonicalPositiveIntegerText = /^[1-9][0-9]*$/;
const canonicalInstant = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{9})Z$/;
const canonicalRecommendationIdentityEpoch = /^-?(?:0|[1-9][0-9]*)$/;
const canonicalRecommendationIdentitySourceNamespace = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const recommendationIdentityControlCharacter = /[\u0000-\u001f\u007f]/;
const action664aMinimumRecommendationIdentityEpochMilliseconds = -62_167_305_540_000;
const action664aMaximumRecommendationIdentityEpochMilliseconds = 253_402_387_139_999;

type PlainRecord = Record<string, unknown>;
type ResultKind = "decision" | "noneligible" | "invalid" | "refused";
type InvalidCode =
  | "schema_invalid"
  | "missing_required_input"
  | "canonical_form_invalid"
  | "input_budget_exceeded"
  | "numeric_domain_invalid"
  | "unsupported_contract_version"
  | "policy_registry_integrity_failure";

export type Action655bCanonicalExitDecisionResult = Readonly<{
  contract_version: typeof resultContractVersion;
  result_kind: ResultKind;
  provenance_digest: string | null;
  decision_digest: string;
  decision: Readonly<PlainRecord> | null;
  noneligible: Readonly<PlainRecord> | null;
  invalid: Readonly<{ error_code: InvalidCode; error_path: string | null }> | null;
  refused: Readonly<PlainRecord> | null;
  side_effects_performed: false;
  result_digest: string;
}>;

type ValidationFailure = Readonly<{
  code: InvalidCode;
  path: string | null;
}>;

type RawNumber = Readonly<{ rawNumber: string }>;
type JsonNode =
  | Readonly<{ kind: "null"; path: string }>
  | Readonly<{ kind: "boolean"; path: string; value: boolean }>
  | Readonly<{ kind: "string"; path: string; value: string }>
  | Readonly<{ kind: "number"; path: string; raw: string }>
  | Readonly<{ kind: "array"; path: string; values: readonly JsonNode[] }>
  | Readonly<{ kind: "object"; path: string; entries: readonly Readonly<{ key: string; path: string; value: JsonNode }>[] }>;

type ParsedDocument = Readonly<{
  root: JsonNode;
  end: number;
  strings: readonly Readonly<{ value: string; path: string }>[];
  objects: readonly Extract<JsonNode, { kind: "object" }>[];
  numbers: readonly Extract<JsonNode, { kind: "number" }>[];
}>;

class JsonSyntaxFailure extends Error {}

type PrivatePolicy = Readonly<{
  contract_version: "action_655a2_exit_policy_v2";
  enabled: true;
  effective_at: string;
  expires_at: string;
  maximum_future_skew_ns: "0";
  maximum_market_data_age_ns: "5000000000";
  maximum_observation_age_ns: "5000000000";
  minimum_remaining_lots: "1";
  move_stop_to_entry_offset_ticks: "0";
  partial_exit_denominator: "2";
  partial_exit_numerator: "1";
  policy_id: "server_primary_exit_policy";
  policy_version: 2;
  profit_protection_r_denominator: "1";
  profit_protection_r_numerator: "1";
  reason_priority: readonly [
    "hard_stop",
    "invalidation",
    "session_close",
    "final_target",
    "first_target_partial",
    "profit_protection_stop_move",
    "hold",
  ];
  session_exit_states: readonly ["closing", "closed"];
}>;

const privatePolicy: PrivatePolicy = deepFreeze({
  contract_version: "action_655a2_exit_policy_v2",
  enabled: true,
  effective_at: "2026-01-01T00:00:00.000000000Z",
  expires_at: "9999-12-31T23:59:59.999999999Z",
  maximum_future_skew_ns: "0",
  maximum_market_data_age_ns: "5000000000",
  maximum_observation_age_ns: "5000000000",
  minimum_remaining_lots: "1",
  move_stop_to_entry_offset_ticks: "0",
  partial_exit_denominator: "2",
  partial_exit_numerator: "1",
  policy_id: "server_primary_exit_policy",
  policy_version: 2,
  profit_protection_r_denominator: "1",
  profit_protection_r_numerator: "1",
  reason_priority: [
    "hard_stop",
    "invalidation",
    "session_close",
    "final_target",
    "first_target_partial",
    "profit_protection_stop_move",
    "hold",
  ],
  session_exit_states: ["closing", "closed"],
});

const privatePolicyId = "server_primary_exit_policy" as const;
const privatePolicyIdentity = "tm_exit_policy:v3:server_primary_exit_policy:2" as const;
const privatePolicyDigest = "746fb35346a353752cc01a38d76a2b6e5593b41f8e7e078d746ebfd221c496cf" as const;
const privatePolicyRegistry = deepFreeze([{
  policy_id: privatePolicyId,
  policy_version: 2 as const,
  policy_identity: privatePolicyIdentity,
  policy_digest: privatePolicyDigest,
  projection: privatePolicy,
}]);

const inputFields = Object.freeze([
  "contract_version",
  "position_snapshot",
  "monitor_observation",
  "decision_requested_at",
  "evaluation_request_identity",
  "input_digest",
] as const);

const positionFields = Object.freeze([
  "contract_version",
  "position_identity",
  "position_version",
  "durable_recommendation_uuid",
  "durable_recommendation_version",
  "recommendation_identity",
  "recommendation_normative_digest",
  "instrument_identity",
  "side",
  "status",
  "opened_at",
  "snapshot_at",
  "price_scale",
  "tick_size_price_units",
  "quantity_scale",
  "lot_size_quantity_units",
  "total_quantity_units",
  "remaining_quantity_units",
  "entry_price_units",
  "initial_stop_price_units",
  "initial_risk_price_units",
  "current_stop_price_units",
  "invalidation_price_units",
  "target_1_price_units",
  "target_2_price_units",
  "position_snapshot_digest",
] as const);

const observationFields = Object.freeze([
  "contract_version",
  "observation_identity",
  "position_identity",
  "position_version",
  "position_snapshot_digest",
  "instrument_identity",
  "observed_at",
  "market_data_contract_version",
  "market_data_observation_identity",
  "market_data_observed_at",
  "market_data_digest",
  "current_price_units",
  "session_state",
  "observation_digest",
] as const);

const stage10ManifestOrder = Object.freeze({
  input: inputFields,
  position_snapshot: positionFields,
  monitor_observation: observationFields,
});

const positionNumberFields = Object.freeze([
  "position_version",
  "durable_recommendation_version",
  "price_scale",
  "quantity_scale",
] as const);

const nullablePositionStringFields = Object.freeze([
  "target_1_price_units",
  "target_2_price_units",
] as const);

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const nested of Object.values(value as PlainRecord)) {
    deepFreeze(nested);
  }
  return Object.freeze(value);
}

function utf8Bytes(value: string): number[] {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    let scalar = value.charCodeAt(index);
    if (scalar >= 0xd800 && scalar <= 0xdbff) {
      const low = value.charCodeAt(index + 1);
      scalar = 0x10000 + ((scalar - 0xd800) << 10) + (low - 0xdc00);
      index += 1;
    }
    if (scalar <= 0x7f) bytes.push(scalar);
    else if (scalar <= 0x7ff) bytes.push(0xc0 | (scalar >> 6), 0x80 | (scalar & 0x3f));
    else if (scalar <= 0xffff) bytes.push(0xe0 | (scalar >> 12), 0x80 | ((scalar >> 6) & 0x3f), 0x80 | (scalar & 0x3f));
    else bytes.push(0xf0 | (scalar >> 18), 0x80 | ((scalar >> 12) & 0x3f), 0x80 | ((scalar >> 6) & 0x3f), 0x80 | (scalar & 0x3f));
  }
  return bytes;
}

function compareUtf8(left: string, right: string): number {
  const leftBytes = utf8Bytes(left);
  const rightBytes = utf8Bytes(right);
  const shared = Math.min(leftBytes.length, rightBytes.length);
  for (let index = 0; index < shared; index += 1) {
    if (leftBytes[index] !== rightBytes[index]) return leftBytes[index] - rightBytes[index];
  }
  return leftBytes.length - rightBytes.length;
}

function quoteCanonicalString(value: string): string {
  let result = '"';
  for (const scalar of value) {
    const code = scalar.codePointAt(0)!;
    if (scalar === '"') result += '\\"';
    else if (scalar === "\\") result += "\\\\";
    else if (code === 0x08) result += "\\b";
    else if (code === 0x09) result += "\\t";
    else if (code === 0x0a) result += "\\n";
    else if (code === 0x0c) result += "\\f";
    else if (code === 0x0d) result += "\\r";
    else if (code < 0x20) result += `\\u${code.toString(16).padStart(4, "0")}`;
    else result += scalar;
  }
  return `${result}"`;
}

function isRawNumber(value: unknown): value is RawNumber {
  return value !== null && typeof value === "object" && Object.hasOwn(value, "rawNumber");
}

function canonicalize(value: unknown): string {
  if (isRawNumber(value)) return value.rawNumber;
  if (value === null) return "null";
  if (typeof value === "string") return quoteCanonicalString(value);
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const record = value as PlainRecord;
  return `{${Object.keys(record).sort(compareUtf8).map((key) => `${quoteCanonicalString(key)}:${canonicalize(record[key])}`).join(",")}}`;
}

function pointerSegment(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function scanRawScalarUtf8(value: string): { valid: boolean; bytes: number } {
  let bytes = 0;
  let valid = true;
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index);
    let cost: number;
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const low = value.charCodeAt(index + 1);
      if (!(low >= 0xdc00 && low <= 0xdfff)) {
        valid = false;
        continue;
      }
      index += 1;
      cost = 4;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      valid = false;
      continue;
    } else if (unit <= 0x7f) cost = 1;
    else if (unit <= 0x7ff) cost = 2;
    else cost = 3;
    if (bytes <= maximumInputUtf8Bytes) bytes = Math.min(maximumInputUtf8Bytes + 1, bytes + cost);
  }
  return { valid, bytes };
}

function parseStrictJson(source: string): ParsedDocument {
  let index = 0;
  const strings: Array<{ value: string; path: string }> = [];
  const objects: Array<Extract<JsonNode, { kind: "object" }>> = [];
  const numbers: Array<Extract<JsonNode, { kind: "number" }>> = [];
  const whitespace = () => {
    while (index < source.length && (source[index] === " " || source[index] === "\n" || source[index] === "\r" || source[index] === "\t")) index += 1;
  };
  const readHex = (): number => {
    const text = source.slice(index, index + 4);
    if (!/^[0-9a-fA-F]{4}$/.test(text)) throw new JsonSyntaxFailure();
    index += 4;
    return Number.parseInt(text, 16);
  };
  const readString = (): string => {
    if (source[index] !== '"') throw new JsonSyntaxFailure();
    index += 1;
    let value = "";
    while (index < source.length) {
      const unit = source.charCodeAt(index);
      if (unit === 0x22) {
        index += 1;
        return value;
      }
      if (unit < 0x20) throw new JsonSyntaxFailure();
      if (unit !== 0x5c) {
        value += source[index];
        index += 1;
        continue;
      }
      index += 1;
      const escape = source[index++];
      if (escape === '"' || escape === "\\" || escape === "/") value += escape;
      else if (escape === "b") value += "\b";
      else if (escape === "f") value += "\f";
      else if (escape === "n") value += "\n";
      else if (escape === "r") value += "\r";
      else if (escape === "t") value += "\t";
      else if (escape === "u") {
        const high = readHex();
        if (high >= 0xd800 && high <= 0xdbff) {
          if (source.slice(index, index + 2) !== "\\u") throw new JsonSyntaxFailure();
          index += 2;
          const low = readHex();
          if (low < 0xdc00 || low > 0xdfff) throw new JsonSyntaxFailure();
          value += String.fromCodePoint(0x10000 + ((high - 0xd800) << 10) + (low - 0xdc00));
        } else {
          if (high >= 0xdc00 && high <= 0xdfff) throw new JsonSyntaxFailure();
          value += String.fromCharCode(high);
        }
      } else throw new JsonSyntaxFailure();
    }
    throw new JsonSyntaxFailure();
  };
  const readNumber = (path: string): Extract<JsonNode, { kind: "number" }> => {
    const start = index;
    if (source[index] === "-") index += 1;
    if (source[index] === "0") index += 1;
    else if (/[1-9]/.test(source[index] ?? "")) {
      index += 1;
      while (/[0-9]/.test(source[index] ?? "")) index += 1;
    } else throw new JsonSyntaxFailure();
    if (source[index] === ".") {
      index += 1;
      if (!/[0-9]/.test(source[index] ?? "")) throw new JsonSyntaxFailure();
      while (/[0-9]/.test(source[index] ?? "")) index += 1;
    }
    if (source[index] === "e" || source[index] === "E") {
      index += 1;
      if (source[index] === "+" || source[index] === "-") index += 1;
      if (!/[0-9]/.test(source[index] ?? "")) throw new JsonSyntaxFailure();
      while (/[0-9]/.test(source[index] ?? "")) index += 1;
    }
    if (/[0-9A-Za-z_.]/.test(source[index] ?? "")) throw new JsonSyntaxFailure();
    const node = { kind: "number" as const, path, raw: source.slice(start, index) };
    numbers.push(node);
    return node;
  };
  const readValue = (path: string): JsonNode => {
    whitespace();
    const token = source[index];
    if (token === '"') {
      const value = readString();
      strings.push({ value, path });
      return { kind: "string", path, value };
    }
    if (token === "{") {
      index += 1;
      const entries: Array<{ key: string; path: string; value: JsonNode }> = [];
      const node = { kind: "object" as const, path, entries };
      objects.push(node);
      whitespace();
      if (source[index] === "}") {
        index += 1;
        return node;
      }
      while (true) {
        whitespace();
        const key = readString();
        const keyPath = `${path}/${pointerSegment(key)}`;
        strings.push({ value: key, path: keyPath });
        whitespace();
        if (source[index++] !== ":") throw new JsonSyntaxFailure();
        const value = readValue(keyPath);
        entries.push({ key, path: keyPath, value });
        whitespace();
        if (source[index] === "}") {
          index += 1;
          return node;
        }
        if (source[index++] !== ",") throw new JsonSyntaxFailure();
      }
    }
    if (token === "[") {
      index += 1;
      const values: JsonNode[] = [];
      whitespace();
      if (source[index] === "]") {
        index += 1;
        return { kind: "array", path, values };
      }
      while (true) {
        values.push(readValue(`${path}/${values.length}`));
        whitespace();
        if (source[index] === "]") {
          index += 1;
          return { kind: "array", path, values };
        }
        if (source[index++] !== ",") throw new JsonSyntaxFailure();
      }
    }
    if (source.startsWith("true", index)) { index += 4; return { kind: "boolean", path, value: true }; }
    if (source.startsWith("false", index)) { index += 5; return { kind: "boolean", path, value: false }; }
    if (source.startsWith("null", index)) { index += 4; return { kind: "null", path }; }
    if (token === "-" || /[0-9]/.test(token ?? "")) return readNumber(path);
    throw new JsonSyntaxFailure();
  };
  whitespace();
  const root = readValue("");
  return { root, end: index, strings, objects, numbers };
}

function canonicalNumber(raw: string): string | null {
  if (/^(?:0|-?[1-9][0-9]*)$/.test(raw)) return raw;
  const negative = raw.startsWith("-");
  const coefficient = raw.replace(/^-/, "").split(/[eE]/, 1)[0].replace(".", "");
  if (negative && /^[0]+$/.test(coefficient)) return "0";
  return null;
}

function canonicalizeNode(node: JsonNode): string {
  if (node.kind === "null") return "null";
  if (node.kind === "boolean") return node.value ? "true" : "false";
  if (node.kind === "string") return quoteCanonicalString(node.value);
  if (node.kind === "number") return node.raw;
  if (node.kind === "array") return `[${node.values.map(canonicalizeNode).join(",")}]`;
  return `{${[...node.entries].sort((left, right) => compareUtf8(left.key, right.key)).map((entry) => `${quoteCanonicalString(entry.key)}:${canonicalizeNode(entry.value)}`).join(",")}}`;
}

function materializeNode(node: JsonNode): unknown {
  if (node.kind === "null") return null;
  if (node.kind === "boolean" || node.kind === "string") return node.value;
  if (node.kind === "number") return Object.freeze({ rawNumber: node.raw });
  if (node.kind === "array") return node.values.map(materializeNode);
  return Object.fromEntries(node.entries.map((entry) => [entry.key, materializeNode(entry.value)]));
}

function materializeSafeNumbers(value: unknown): unknown {
  if (isRawNumber(value)) return Number(value.rawNumber);
  if (Array.isArray(value)) return value.map(materializeSafeNumbers);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as PlainRecord).map(([key, nested]) => [key, materializeSafeNumbers(nested)]));
  }
  return value;
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalize(value), "utf8").digest("hex");
}

function asRecord(value: unknown): PlainRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) && !isRawNumber(value)
    ? (value as PlainRecord)
    : null;
}

function unknownFieldFailure(
  value: PlainRecord,
  fields: readonly string[],
  path: string,
): ValidationFailure | null {
  const allowed = new Set(fields);
  const unknown = Object.keys(value).filter((field) => !allowed.has(field)).sort(compareUtf8)[0];
  return unknown
    ? { code: "schema_invalid", path: `${path}/${unknown}` }
    : null;
}

function requiredFieldFailure(
  value: PlainRecord,
  field: string,
  path: string,
): ValidationFailure | null {
  return Object.hasOwn(value, field)
    ? null
    : { code: "missing_required_input", path: `${path}/${field}` };
}

function isNfcText(value: unknown): value is string {
  return typeof value === "string" && value.normalize("NFC") === value;
}

function isDigest(value: unknown): value is string {
  return typeof value === "string" && lowerHexDigest.test(value);
}

function parsePositiveIntegerText(value: unknown): bigint | null {
  if (typeof value !== "string" || !canonicalPositiveIntegerText.test(value)) {
    return null;
  }
  const parsed = BigInt(value);
  return parsed <= maximumStoredInteger ? parsed : null;
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
  const match = canonicalInstant.exec(value);
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
  const seconds = BigInt(daysSinceEpoch) * BigInt(86_400) + BigInt(hour * 3600 + minute * 60 + second);
  return seconds * BigInt(1_000_000_000) + BigInt(nanoText);
}

function unsignedProjection(record: PlainRecord, digestField: string): PlainRecord {
  return Object.fromEntries(Object.entries(record).filter(([key]) => key !== digestField));
}

function positionDigest(position: PlainRecord): string {
  return digest({
    contract_version: "action_655a6_position_snapshot_digest_v3",
    domain: "trade_management_position_snapshot_digest_v2",
    projection: unsignedProjection(position, "position_snapshot_digest"),
  });
}

function observationDigest(observation: PlainRecord): string {
  return digest({
    contract_version: "action_655a2_monitor_observation_digest_v2",
    domain: "trade_management_monitor_observation_digest_v2",
    projection: unsignedProjection(observation, "observation_digest"),
  });
}

function requestIdentity(input: PlainRecord, position: PlainRecord, observation: PlainRecord): string {
  const hash = digest({
    contract_version: "action_655a6_exit_evaluation_request_identity_v4",
    domain: "trade_management_exit_evaluation_request_identity_v3",
    projection: {
      decision_requested_at: input.decision_requested_at,
      observation_digest: observation.observation_digest,
      observation_identity: observation.observation_identity,
      policy_digest: privatePolicyDigest,
      policy_id: privatePolicyId,
      policy_identity: privatePolicyIdentity,
      policy_version: privatePolicy.policy_version,
      position_identity: position.position_identity,
      position_snapshot_digest: position.position_snapshot_digest,
      position_version: position.position_version,
    },
  });
  return `tm_exit_request:v4:${hash}`;
}

function inputDigest(input: PlainRecord): string {
  return digest({
    contract_version: "action_655a6_exit_evaluation_input_digest_v4",
    domain: "trade_management_exit_evaluation_input_digest_v3",
    projection: unsignedProjection(input, "input_digest"),
  });
}

function provenanceDigest(input: PlainRecord, position: PlainRecord, observation: PlainRecord): string {
  return digest({
    contract_version: "action_655a6_exit_provenance_digest_v1",
    domain: "trade_management_exit_provenance_digest_v1",
    projection: {
      decision_requested_at: input.decision_requested_at,
      durable_recommendation_uuid: position.durable_recommendation_uuid,
      durable_recommendation_version: position.durable_recommendation_version,
      evaluation_request_identity: input.evaluation_request_identity,
      input_digest: input.input_digest,
      instrument_identity: position.instrument_identity,
      market_data_contract_version: observation.market_data_contract_version,
      market_data_digest: observation.market_data_digest,
      market_data_observation_identity: observation.market_data_observation_identity,
      market_data_observed_at: observation.market_data_observed_at,
      observation_digest: observation.observation_digest,
      observation_identity: observation.observation_identity,
      observed_at: observation.observed_at,
      policy_digest: privatePolicyDigest,
      policy_id: privatePolicyId,
      policy_identity: privatePolicyIdentity,
      policy_version: privatePolicy.policy_version,
      position_identity: position.position_identity,
      position_snapshot_digest: position.position_snapshot_digest,
      position_version: position.position_version,
      recommendation_identity: position.recommendation_identity,
      recommendation_normative_digest: position.recommendation_normative_digest,
    },
  });
}

function decisionIdentity(
  provenance: string,
  status: string,
  reason: string,
  priority: number,
  quantity: string | null,
  stop: string | null,
): string {
  const hash = digest({
    contract_version: "action_655a6_exit_decision_identity_v4",
    domain: "trade_management_exit_decision_identity_v3",
    projection: {
      decision_priority: priority,
      decision_reason: reason,
      decision_status: status,
      provenance_digest: provenance,
      recommended_quantity_units: quantity,
      recommended_stop_price_units: stop,
      result_kind: "decision",
    },
  });
  return `tm_exit_decision:v4:${hash}`;
}

function decisionEvidenceDigest(projection: PlainRecord): string {
  return digest({
    contract_version: "action_655a6_exit_decision_digest_v4",
    domain: "trade_management_exit_decision_digest_v3",
    projection,
  });
}

function decisionProjection(
  resultKind: ResultKind,
  provenance: string | null,
  values: Partial<PlainRecord>,
): PlainRecord {
  return {
    decision_authority: null,
    decision_identity: null,
    decision_priority: null,
    decision_reason: null,
    decision_status: null,
    invalid_error_code: null,
    invalid_error_path: null,
    noneligible_position_status: null,
    noneligible_reason: null,
    provenance_digest: provenance,
    recommended_quantity_units: null,
    recommended_stop_price_units: null,
    refusal_error_path: null,
    refusal_reason: null,
    result_kind: resultKind,
    side_effects_performed: false,
    ...values,
  };
}

function completeResult(
  resultKind: ResultKind,
  provenance: string | null,
  decisionDigest: string,
  decision: PlainRecord | null,
  noneligible: PlainRecord | null,
  invalid: { error_code: InvalidCode; error_path: string | null } | null,
  refused: PlainRecord | null,
): Action655bCanonicalExitDecisionResult {
  const unsigned = {
    contract_version: resultContractVersion,
    result_kind: resultKind,
    provenance_digest: provenance,
    decision_digest: decisionDigest,
    decision,
    noneligible,
    invalid,
    refused,
    side_effects_performed: false as const,
  };
  return deepFreeze({
    ...unsigned,
    result_digest: digest({
      contract_version: "action_655a6_exit_evaluation_result_digest_v4",
      domain: "trade_management_exit_evaluation_result_digest_v3",
      projection: unsigned,
    }),
  });
}

function invalidResult(code: InvalidCode, path: string | null): Action655bCanonicalExitDecisionResult {
  const invalid = { error_code: code, error_path: path };
  const evidence = decisionEvidenceDigest(decisionProjection("invalid", null, {
    invalid_error_code: code,
    invalid_error_path: path,
  }));
  return completeResult("invalid", null, evidence, null, null, invalid, null);
}

function refusalPayload(
  reason: string,
  path: string | null,
  input: PlainRecord,
  position: PlainRecord | null,
  observation: PlainRecord | null,
  includePolicy: boolean,
): PlainRecord {
  return {
    refusal_reason: reason,
    error_path: path,
    position_identity: position?.position_identity ?? null,
    position_version: position?.position_version ?? null,
    position_snapshot_digest: position?.position_snapshot_digest ?? null,
    observation_identity: observation?.observation_identity ?? null,
    observation_digest: observation?.observation_digest ?? null,
    observed_at: observation?.observed_at ?? null,
    decision_requested_at: input.decision_requested_at ?? null,
    evaluation_request_identity: position !== null && observation !== null
      ? input.evaluation_request_identity
      : null,
    input_digest: input.input_digest ?? null,
    policy_id: includePolicy ? privatePolicyId : null,
    policy_version: includePolicy ? privatePolicy.policy_version : null,
    policy_identity: includePolicy ? privatePolicyIdentity : null,
    policy_digest: includePolicy ? privatePolicyDigest : null,
  };
}

function refusedResult(
  reason: string,
  path: string | null,
  input: PlainRecord,
  position: PlainRecord | null,
  observation: PlainRecord | null,
  provenance: string | null,
  includePolicy: boolean,
): Action655bCanonicalExitDecisionResult {
  const refused = refusalPayload(reason, path, input, position, observation, includePolicy);
  const evidence = decisionEvidenceDigest(decisionProjection("refused", provenance, {
    refusal_error_path: path,
    refusal_reason: reason,
  }));
  return completeResult("refused", provenance, evidence, null, null, null, refused);
}

function isRawJsonNumber(value: unknown): value is RawNumber {
  return isRawNumber(value) && /^(?:0|-?[1-9][0-9]*)$/.test(value.rawNumber);
}

function exactType(value: unknown, type: "string" | "number" | "nullable_string"): boolean {
  if (type === "nullable_string") return value === null || typeof value === "string";
  if (type === "number") return isRawJsonNumber(value);
  return typeof value === "string";
}

function schemaFailure(input: PlainRecord): ValidationFailure | null {
  let failure = requiredFieldFailure(input, stage10ManifestOrder.input[0], "");
  if (failure) return failure;
  if (typeof input.contract_version !== "string") return { code: "schema_invalid", path: "/contract_version" };
  if (input.contract_version !== inputContractVersion) return { code: "unsupported_contract_version", path: "/contract_version" };

  failure = requiredFieldFailure(input, stage10ManifestOrder.input[1], "");
  if (failure) return failure;
  const position = asRecord(input.position_snapshot);
  if (!position) return { code: "schema_invalid", path: "/position_snapshot" };

  failure = requiredFieldFailure(position, stage10ManifestOrder.position_snapshot[0], "/position_snapshot");
  if (failure) return failure;
  if (typeof position.contract_version !== "string") return { code: "schema_invalid", path: "/position_snapshot/contract_version" };
  if (position.contract_version !== positionContractVersion) return { code: "unsupported_contract_version", path: "/position_snapshot/contract_version" };
  for (const field of stage10ManifestOrder.position_snapshot.slice(1)) {
    failure = requiredFieldFailure(position, field, "/position_snapshot");
    if (failure) return failure;
    const expected = (positionNumberFields as readonly string[]).includes(field)
      ? "number"
      : (nullablePositionStringFields as readonly string[]).includes(field)
        ? "nullable_string"
        : "string";
    if (!exactType(position[field], expected)) return { code: "schema_invalid", path: `/position_snapshot/${field}` };
  }
  failure = unknownFieldFailure(position, stage10ManifestOrder.position_snapshot, "/position_snapshot");
  if (failure) return failure;

  failure = requiredFieldFailure(input, stage10ManifestOrder.input[2], "");
  if (failure) return failure;
  const observation = asRecord(input.monitor_observation);
  if (!observation) return { code: "schema_invalid", path: "/monitor_observation" };

  failure = requiredFieldFailure(observation, stage10ManifestOrder.monitor_observation[0], "/monitor_observation");
  if (failure) return failure;
  if (typeof observation.contract_version !== "string") return { code: "schema_invalid", path: "/monitor_observation/contract_version" };
  if (observation.contract_version !== observationContractVersion) return { code: "unsupported_contract_version", path: "/monitor_observation/contract_version" };
  for (const field of stage10ManifestOrder.monitor_observation.slice(1)) {
    failure = requiredFieldFailure(observation, field, "/monitor_observation");
    if (failure) return failure;
    const expected = field === "position_version" ? "number" : "string";
    if (!exactType(observation[field], expected)) return { code: "schema_invalid", path: `/monitor_observation/${field}` };
  }
  failure = unknownFieldFailure(observation, stage10ManifestOrder.monitor_observation, "/monitor_observation");
  if (failure) return failure;

  for (const field of stage10ManifestOrder.input.slice(3)) {
    failure = requiredFieldFailure(input, field, "");
    if (failure) return failure;
    if (typeof input[field] !== "string") return { code: "schema_invalid", path: `/${field}` };
  }
  return unknownFieldFailure(input, stage10ManifestOrder.input, "");
}

function exactSafeInteger(value: RawNumber): bigint {
  return BigInt(value.rawNumber);
}

function isCanonicalRecommendationIdentity(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const parts = value.split(":");
  if (parts.length !== 5 || parts[0] !== "rec_decision" || parts[1] !== "v1") {
    return false;
  }
  const sourceNamespace = (() => {
    try {
      return decodeURIComponent(parts[2]);
    } catch {
      return null;
    }
  })();
  const decisionId = (() => {
    try {
      return decodeURIComponent(parts[3]);
    } catch {
      return null;
    }
  })();
  if (
    sourceNamespace === null ||
    decisionId === null ||
    !canonicalRecommendationIdentityEpoch.test(parts[4])
  ) {
    return false;
  }
  const epochMilliseconds = Number(parts[4]);
  if (
    !Number.isSafeInteger(epochMilliseconds) ||
    String(epochMilliseconds) !== parts[4] ||
    epochMilliseconds < action664aMinimumRecommendationIdentityEpochMilliseconds ||
    epochMilliseconds > action664aMaximumRecommendationIdentityEpochMilliseconds
  ) {
    return false;
  }
  const decidedAt = new Date(epochMilliseconds);
  if (Number.isNaN(decidedAt.getTime())) return false;
  const canonicalDecidedAt = decidedAt.toISOString();
  if (
    !canonicalRecommendationIdentitySourceNamespace.test(sourceNamespace) ||
    decisionId.length === 0 ||
    decisionId.length > 240 ||
    decisionId !== decisionId.trim() ||
    decisionId !== decisionId.normalize("NFC") ||
    recommendationIdentityControlCharacter.test(decisionId)
  ) {
    return false;
  }
  return [
    "rec_decision",
    "v1",
    encodeURIComponent(sourceNamespace),
    encodeURIComponent(decisionId),
    String(Date.parse(canonicalDecidedAt)),
  ].join(":") === value;
}

function validatePosition(position: PlainRecord): ValidationFailure | null {
  if (typeof position.position_identity !== "string" || !canonicalUuid.test(position.position_identity)) return { code: "schema_invalid", path: "/position_snapshot/position_identity" };
  const positionVersion = exactSafeInteger(position.position_version as RawNumber);
  if (positionVersion <= bigIntZero || positionVersion > BigInt(Number.MAX_SAFE_INTEGER)) return { code: "numeric_domain_invalid", path: "/position_snapshot/position_version" };
  if (typeof position.durable_recommendation_uuid !== "string" || !canonicalUuid.test(position.durable_recommendation_uuid)) return { code: "schema_invalid", path: "/position_snapshot/durable_recommendation_uuid" };
  const recommendationVersion = exactSafeInteger(position.durable_recommendation_version as RawNumber);
  if (recommendationVersion <= bigIntZero || recommendationVersion > BigInt(Number.MAX_SAFE_INTEGER)) return { code: "numeric_domain_invalid", path: "/position_snapshot/durable_recommendation_version" };
  if (!isCanonicalRecommendationIdentity(position.recommendation_identity)) return { code: "schema_invalid", path: "/position_snapshot/recommendation_identity" };
  if (!isDigest(position.recommendation_normative_digest)) return { code: "schema_invalid", path: "/position_snapshot/recommendation_normative_digest" };
  if (!isNfcText(position.instrument_identity) || !position.instrument_identity) return { code: "schema_invalid", path: "/position_snapshot/instrument_identity" };
  if (position.side !== "long" && position.side !== "short") return { code: "schema_invalid", path: "/position_snapshot/side" };
  if (typeof position.status !== "string" || !["open", "exit_pending", "partially_closed", "closed"].includes(position.status)) return { code: "schema_invalid", path: "/position_snapshot/status" };
  if (instantNanoseconds(position.opened_at) === null) return { code: "canonical_form_invalid", path: "/position_snapshot/opened_at" };
  if (instantNanoseconds(position.snapshot_at) === null) return { code: "canonical_form_invalid", path: "/position_snapshot/snapshot_at" };
  const priceScale = exactSafeInteger(position.price_scale as RawNumber);
  if (priceScale < bigIntZero || priceScale > BigInt(8)) return { code: "numeric_domain_invalid", path: "/position_snapshot/price_scale" };
  const numbers: Record<string, bigint> = {};
  const tick = parsePositiveIntegerText(position.tick_size_price_units);
  if (tick === null) return { code: "numeric_domain_invalid", path: "/position_snapshot/tick_size_price_units" };
  numbers.tick_size_price_units = tick;
  const quantityScale = exactSafeInteger(position.quantity_scale as RawNumber);
  if (quantityScale < bigIntZero || quantityScale > BigInt(8)) return { code: "numeric_domain_invalid", path: "/position_snapshot/quantity_scale" };
  const lot = parsePositiveIntegerText(position.lot_size_quantity_units);
  if (lot === null) return { code: "numeric_domain_invalid", path: "/position_snapshot/lot_size_quantity_units" };
  numbers.lot_size_quantity_units = lot;
  const total = parsePositiveIntegerText(position.total_quantity_units);
  if (total === null || total % lot !== bigIntZero) return { code: "numeric_domain_invalid", path: "/position_snapshot/total_quantity_units" };
  numbers.total_quantity_units = total;
  const remaining = parsePositiveIntegerText(position.remaining_quantity_units);
  if (remaining === null || remaining % lot !== bigIntZero || remaining > total) return { code: "numeric_domain_invalid", path: "/position_snapshot/remaining_quantity_units" };
  numbers.remaining_quantity_units = remaining;
  const orderedPriceFields = [
    "entry_price_units",
    "initial_stop_price_units",
    "initial_risk_price_units",
    "current_stop_price_units",
    "invalidation_price_units",
  ] as const;
  for (const name of orderedPriceFields) {
    const parsed = parsePositiveIntegerText(position[name]);
    if (parsed === null || parsed % tick !== bigIntZero) return { code: "numeric_domain_invalid", path: `/position_snapshot/${name}` };
    numbers[name] = parsed;
    if (name === "initial_stop_price_units") {
      if (position.side === "long" && parsed >= numbers.entry_price_units) return { code: "numeric_domain_invalid", path: "/position_snapshot/initial_stop_price_units" };
      if (position.side === "short" && parsed <= numbers.entry_price_units) return { code: "numeric_domain_invalid", path: "/position_snapshot/initial_stop_price_units" };
    }
    if (name === "initial_risk_price_units") {
      const risk = numbers.entry_price_units > numbers.initial_stop_price_units
        ? numbers.entry_price_units - numbers.initial_stop_price_units
        : numbers.initial_stop_price_units - numbers.entry_price_units;
      if (risk !== parsed) return { code: "numeric_domain_invalid", path: "/position_snapshot/initial_risk_price_units" };
    }
    if (name === "invalidation_price_units") {
      if (position.side === "long" && parsed >= numbers.entry_price_units) return { code: "numeric_domain_invalid", path: "/position_snapshot/invalidation_price_units" };
      if (position.side === "short" && parsed <= numbers.entry_price_units) return { code: "numeric_domain_invalid", path: "/position_snapshot/invalidation_price_units" };
    }
  }
  for (const target of ["target_1_price_units", "target_2_price_units"] as const) {
    if (position[target] !== null) {
      const parsed = parsePositiveIntegerText(position[target]);
      if (parsed === null || parsed % tick !== bigIntZero) return { code: "numeric_domain_invalid", path: `/position_snapshot/${target}` };
      numbers[target] = parsed;
      if (target === "target_1_price_units") {
        if (position.side === "long" && parsed <= numbers.entry_price_units) return { code: "numeric_domain_invalid", path: "/position_snapshot/target_1_price_units" };
        if (position.side === "short" && parsed >= numbers.entry_price_units) return { code: "numeric_domain_invalid", path: "/position_snapshot/target_1_price_units" };
      }
    }
  }
  const target1 = numbers.target_1_price_units;
  const target2 = numbers.target_2_price_units;
  if (target2 !== undefined && target1 === undefined) return { code: "numeric_domain_invalid", path: "/position_snapshot/target_2_price_units" };
  if (target2 !== undefined && target1 !== undefined) {
    if (position.side === "long" && target2 <= target1) return { code: "numeric_domain_invalid", path: "/position_snapshot/target_2_price_units" };
    if (position.side === "short" && target2 >= target1) return { code: "numeric_domain_invalid", path: "/position_snapshot/target_2_price_units" };
  }
  if (!isDigest(position.position_snapshot_digest)) return { code: "schema_invalid", path: "/position_snapshot/position_snapshot_digest" };
  return null;
}

function validateObservation(observation: PlainRecord, position: PlainRecord): ValidationFailure | null {
  if (typeof observation.observation_identity !== "string" || !/^tm_observation:v2:[0-9a-f]{64}$/.test(observation.observation_identity)) return { code: "schema_invalid", path: "/monitor_observation/observation_identity" };
  if (typeof observation.position_identity !== "string" || !canonicalUuid.test(observation.position_identity)) return { code: "schema_invalid", path: "/monitor_observation/position_identity" };
  const positionVersion = exactSafeInteger(observation.position_version as RawNumber);
  if (positionVersion <= bigIntZero || positionVersion > BigInt(Number.MAX_SAFE_INTEGER)) return { code: "numeric_domain_invalid", path: "/monitor_observation/position_version" };
  if (!isDigest(observation.position_snapshot_digest)) return { code: "schema_invalid", path: "/monitor_observation/position_snapshot_digest" };
  if (!isNfcText(observation.instrument_identity) || !observation.instrument_identity) return { code: "schema_invalid", path: "/monitor_observation/instrument_identity" };
  if (instantNanoseconds(observation.observed_at) === null) return { code: "canonical_form_invalid", path: "/monitor_observation/observed_at" };
  if (!isNfcText(observation.market_data_contract_version) || !observation.market_data_contract_version) return { code: "schema_invalid", path: "/monitor_observation/market_data_contract_version" };
  if (!isNfcText(observation.market_data_observation_identity) || !observation.market_data_observation_identity) return { code: "schema_invalid", path: "/monitor_observation/market_data_observation_identity" };
  if (instantNanoseconds(observation.market_data_observed_at) === null) return { code: "canonical_form_invalid", path: "/monitor_observation/market_data_observed_at" };
  if (!isDigest(observation.market_data_digest)) return { code: "schema_invalid", path: "/monitor_observation/market_data_digest" };
  const current = parsePositiveIntegerText(observation.current_price_units);
  const tick = parsePositiveIntegerText(position.tick_size_price_units);
  if (current === null || tick === null || current % tick !== bigIntZero) return { code: "numeric_domain_invalid", path: "/monitor_observation/current_price_units" };
  if (typeof observation.session_state !== "string" || !["open", "closing", "closed"].includes(observation.session_state)) return { code: "schema_invalid", path: "/monitor_observation/session_state" };
  if (!isDigest(observation.observation_digest)) return { code: "schema_invalid", path: "/monitor_observation/observation_digest" };
  return null;
}

function noneligibleResult(
  input: PlainRecord,
  position: PlainRecord,
  observation: PlainRecord,
  provenance: string,
): Action655bCanonicalExitDecisionResult {
  const status = position.status as string;
  const reason = status === "closed" ? "position_closed" : "position_exit_pending";
  const payload = {
    position_identity: position.position_identity,
    position_version: position.position_version,
    position_snapshot_digest: position.position_snapshot_digest,
    observation_identity: observation.observation_identity,
    observation_digest: observation.observation_digest,
    observed_at: observation.observed_at,
    decision_requested_at: input.decision_requested_at,
    evaluation_request_identity: input.evaluation_request_identity,
    input_digest: input.input_digest,
    policy_id: privatePolicyId,
    policy_version: privatePolicy.policy_version,
    policy_identity: privatePolicyIdentity,
    policy_digest: privatePolicyDigest,
    position_status: status,
    noneligible_reason: reason,
  };
  const evidence = decisionEvidenceDigest(decisionProjection("noneligible", provenance, {
    noneligible_position_status: status,
    noneligible_reason: reason,
  }));
  return completeResult("noneligible", provenance, evidence, null, payload, null, null);
}

function checkedProduct(left: bigint, right: bigint): bigint | null {
  const product = left * right;
  return product <= maximumIntermediate ? product : null;
}

function evaluateRule(position: PlainRecord, observation: PlainRecord):
  | Readonly<{ status: string; reason: string; priority: number; quantity: string | null; stop: string | null }>
  | Readonly<{ refusal: "quantity_rule_not_representable" | "arithmetic_overflow"; path: string }> {
  const side = position.side;
  const current = BigInt(observation.current_price_units as string);
  const entry = BigInt(position.entry_price_units as string);
  const stop = BigInt(position.current_stop_price_units as string);
  const invalidation = BigInt(position.invalidation_price_units as string);
  const remaining = BigInt(position.remaining_quantity_units as string);
  const target1 = position.target_1_price_units === null ? null : BigInt(position.target_1_price_units as string);
  const target2 = position.target_2_price_units === null ? null : BigInt(position.target_2_price_units as string);
  const hardStop = side === "long" ? current <= stop : current >= stop;
  if (hardStop) return { status: "exit_full", reason: "hard_stop", priority: 1, quantity: position.remaining_quantity_units as string, stop: null };
  const invalidated = side === "long" ? current <= invalidation : current >= invalidation;
  if (invalidated) return { status: "exit_full", reason: "invalidation", priority: 2, quantity: position.remaining_quantity_units as string, stop: null };
  if (privatePolicy.session_exit_states.includes(observation.session_state as "closing" | "closed")) return { status: "exit_full", reason: "session_close", priority: 3, quantity: position.remaining_quantity_units as string, stop: null };
  const finalTarget = target2 !== null && (side === "long" ? current >= target2 : current <= target2);
  if (finalTarget) return { status: "exit_full", reason: "final_target", priority: 4, quantity: position.remaining_quantity_units as string, stop: null };
  const firstTarget = target1 !== null && (side === "long" ? current >= target1 : current <= target1);
  if (firstTarget) {
    const numerator = BigInt(privatePolicy.partial_exit_numerator);
    const denominator = BigInt(privatePolicy.partial_exit_denominator);
    const multiplied = checkedProduct(remaining, numerator);
    if (multiplied === null) return { refusal: "arithmetic_overflow", path: "/position_snapshot/remaining_quantity_units" };
    const lot = BigInt(position.lot_size_quantity_units as string);
    const unrounded = multiplied / denominator;
    const quantity = (unrounded / lot) * lot;
    const minimumRemaining = BigInt(privatePolicy.minimum_remaining_lots) * lot;
    if (quantity < lot || remaining - quantity < minimumRemaining) {
      return { refusal: "quantity_rule_not_representable", path: "/position_snapshot/remaining_quantity_units" };
    }
    return { status: "exit_partial", reason: "first_target_partial", priority: 5, quantity: quantity.toString(), stop: null };
  }
  const favorable = side === "long"
    ? current >= entry ? current - entry : bigIntZero
    : current <= entry ? entry - current : bigIntZero;
  const favorableProduct = checkedProduct(favorable, BigInt(privatePolicy.profit_protection_r_denominator));
  const riskProduct = checkedProduct(BigInt(position.initial_risk_price_units as string), BigInt(privatePolicy.profit_protection_r_numerator));
  if (favorableProduct === null) return { refusal: "arithmetic_overflow", path: "/monitor_observation/current_price_units" };
  if (riskProduct === null) return { refusal: "arithmetic_overflow", path: "/position_snapshot/initial_risk_price_units" };
  if (favorableProduct >= riskProduct) return { status: "move_stop", reason: "profit_protection_stop_move", priority: 6, quantity: null, stop: position.entry_price_units as string };
  return { status: "hold", reason: "hold", priority: 7, quantity: null, stop: null };
}

function decisionResult(
  input: PlainRecord,
  position: PlainRecord,
  observation: PlainRecord,
  provenance: string,
  selected: Readonly<{ status: string; reason: string; priority: number; quantity: string | null; stop: string | null }>,
): Action655bCanonicalExitDecisionResult {
  const identity = decisionIdentity(provenance, selected.status, selected.reason, selected.priority, selected.quantity, selected.stop);
  const payload = {
    contract_version: decisionContractVersion,
    decision_identity: identity,
    decision_status: selected.status,
    position_identity: position.position_identity,
    position_version: position.position_version,
    position_snapshot_digest: position.position_snapshot_digest,
    observation_identity: observation.observation_identity,
    observation_digest: observation.observation_digest,
    observed_at: observation.observed_at,
    decision_requested_at: input.decision_requested_at,
    evaluation_request_identity: input.evaluation_request_identity,
    input_digest: input.input_digest,
    decision_reason: selected.reason,
    decision_priority: selected.priority,
    recommended_quantity_units: selected.quantity,
    recommended_stop_price_units: selected.stop,
    policy_id: privatePolicyId,
    policy_version: privatePolicy.policy_version,
    policy_identity: privatePolicyIdentity,
    policy_digest: privatePolicyDigest,
    decision_authority: "server_owned_policy",
    side_effects_performed: false,
  };
  const evidence = decisionEvidenceDigest(decisionProjection("decision", provenance, {
    decision_authority: payload.decision_authority,
    decision_identity: identity,
    decision_priority: selected.priority,
    decision_reason: selected.reason,
    decision_status: selected.status,
    recommended_quantity_units: selected.quantity,
    recommended_stop_price_units: selected.stop,
  }));
  return completeResult("decision", provenance, evidence, payload, null, null, null);
}

export function evaluateAction655bCanonicalExitDecision(
  canonicalInputJson: unknown,
  localEvaluationEnabled: unknown = false,
): Action655bCanonicalExitDecisionResult {
  if (typeof canonicalInputJson !== "string") return invalidResult("schema_invalid", "/");
  if (typeof localEvaluationEnabled !== "boolean") return invalidResult("schema_invalid", "/local_evaluation_enabled");
  const capturedInput = canonicalInputJson;
  const rawScan = scanRawScalarUtf8(capturedInput);
  if (!rawScan.valid) return invalidResult("canonical_form_invalid", "/");
  if (rawScan.bytes > maximumInputUtf8Bytes) return invalidResult("input_budget_exceeded", "/");
  if (capturedInput.charCodeAt(0) === 0xfeff) return invalidResult("canonical_form_invalid", "/");
  let document: ParsedDocument;
  try {
    document = parseStrictJson(capturedInput);
  } catch {
    return invalidResult("canonical_form_invalid", "/");
  }
  if (document.end !== capturedInput.length) return invalidResult("canonical_form_invalid", "/");
  for (const token of document.strings) {
    if (token.value.normalize("NFC") !== token.value) return invalidResult("canonical_form_invalid", token.path || "/");
  }
  for (const object of document.objects) {
    const observed = new Set<string>();
    for (const entry of object.entries) {
      if (observed.has(entry.key)) return invalidResult("canonical_form_invalid", entry.path || "/");
      observed.add(entry.key);
    }
  }
  for (const number of document.numbers) {
    if (canonicalNumber(number.raw) !== number.raw) return invalidResult("canonical_form_invalid", number.path || "/");
  }
  if (canonicalizeNode(document.root) !== capturedInput) return invalidResult("canonical_form_invalid", "/");
  const parsed = materializeNode(document.root);
  const input = asRecord(parsed);
  if (!input) return invalidResult("schema_invalid", "/");
  const inputFailure = schemaFailure(input);
  if (inputFailure) return invalidResult(inputFailure.code, inputFailure.path);
  const rawPosition = input.position_snapshot as PlainRecord;
  const positionFailure = validatePosition(rawPosition);
  if (positionFailure) return invalidResult(positionFailure.code, positionFailure.path);
  const rawObservation = input.monitor_observation as PlainRecord;
  const observationFailure = validateObservation(rawObservation, rawPosition);
  if (observationFailure) return invalidResult(observationFailure.code, observationFailure.path);
  if (instantNanoseconds(input.decision_requested_at) === null) return invalidResult("canonical_form_invalid", "/decision_requested_at");
  if (typeof input.evaluation_request_identity !== "string" || !/^tm_exit_request:v4:[0-9a-f]{64}$/.test(input.evaluation_request_identity)) return invalidResult("schema_invalid", "/evaluation_request_identity");
  if (!isDigest(input.input_digest)) return invalidResult("schema_invalid", "/input_digest");

  const safeInput = deepFreeze(materializeSafeNumbers(input) as PlainRecord);
  const position = safeInput.position_snapshot as PlainRecord;
  const observation = safeInput.monitor_observation as PlainRecord;

  if (positionDigest(position) !== position.position_snapshot_digest) return refusedResult("identity_conflict", "/position_snapshot/position_snapshot_digest", safeInput, null, null, null, false);
  if (observationDigest(observation) !== observation.observation_digest) return refusedResult("identity_conflict", "/monitor_observation/observation_digest", safeInput, null, null, null, false);
  for (const field of ["position_identity", "position_version", "position_snapshot_digest", "instrument_identity"] as const) {
    if (observation[field] !== position[field]) return refusedResult("identity_conflict", `/monitor_observation/${field}`, safeInput, null, null, null, false);
  }
  if (requestIdentity(safeInput, position, observation) !== safeInput.evaluation_request_identity) return refusedResult("identity_conflict", "/evaluation_request_identity", safeInput, null, null, null, false);
  if (inputDigest(safeInput) !== safeInput.input_digest) return refusedResult("identity_conflict", "/input_digest", safeInput, null, null, null, false);

  const resolvedPolicies = privatePolicyRegistry.filter((entry) =>
    entry.policy_id === privatePolicyId &&
    entry.policy_version === privatePolicy.policy_version &&
    entry.policy_identity === privatePolicyIdentity
  );
  if (resolvedPolicies.length !== 1) {
    return refusedResult("authority_unavailable", null, safeInput, position, observation, null, false);
  }
  const resolvedPolicy = resolvedPolicies[0];
  const rebuiltPolicyDigest = digest({
    contract_version: "action_655a6_exit_policy_digest_frame_v3",
    domain: "trade_management_exit_policy_v2",
    policy_id: resolvedPolicy.policy_id,
    policy_identity: resolvedPolicy.policy_identity,
    projection: resolvedPolicy.projection,
  });
  if (rebuiltPolicyDigest !== resolvedPolicy.policy_digest) return invalidResult("policy_registry_integrity_failure", null);

  const provenance = provenanceDigest(safeInput, position, observation);
  const requestedAt = instantNanoseconds(safeInput.decision_requested_at)!;
  const observedAt = instantNanoseconds(observation.observed_at)!;
  const marketObservedAt = instantNanoseconds(observation.market_data_observed_at)!;
  if (marketObservedAt > observedAt) return refusedResult("future_market_data", "/monitor_observation/market_data_observed_at", safeInput, position, observation, provenance, true);
  if (observedAt > requestedAt) return refusedResult("future_observation", "/monitor_observation/observed_at", safeInput, position, observation, provenance, true);
  if (requestedAt - observedAt >= BigInt(privatePolicy.maximum_observation_age_ns)) return refusedResult("stale_observation", "/monitor_observation/observed_at", safeInput, position, observation, provenance, true);
  if (requestedAt - marketObservedAt >= BigInt(privatePolicy.maximum_market_data_age_ns)) return refusedResult("stale_observation", "/monitor_observation/market_data_observed_at", safeInput, position, observation, provenance, true);
  if (requestedAt < instantNanoseconds(privatePolicy.effective_at)!) return refusedResult("policy_not_effective", "/decision_requested_at", safeInput, position, observation, provenance, true);
  if (requestedAt >= instantNanoseconds(privatePolicy.expires_at)!) return refusedResult("expired_policy", "/decision_requested_at", safeInput, position, observation, provenance, true);
  if (position.status === "exit_pending" || position.status === "closed") return noneligibleResult(safeInput, position, observation, provenance);
  if (!localEvaluationEnabled) return refusedResult("disabled", null, safeInput, position, observation, provenance, true);

  const selected = evaluateRule(position, observation);
  if ("refusal" in selected) return refusedResult(selected.refusal, selected.path, safeInput, position, observation, provenance, true);
  return decisionResult(safeInput, position, observation, provenance, selected);
}
