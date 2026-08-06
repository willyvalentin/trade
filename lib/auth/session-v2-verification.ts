import { createHash, createHmac } from "node:crypto";
import { SESSION_V2_CONTRACT } from "./session-v2-contract.ts";

type ResultExtras = Readonly<Record<string, unknown>>;
export type SessionV2Result = Readonly<{ ok: boolean; code: string } & ResultExtras>;
type ReadResult = Readonly<{ ok: boolean; code: string; value?: unknown; path?: string }>;

const frozenResult = (ok: boolean, code: string, extra: ResultExtras = {}): SessionV2Result =>
  Object.freeze({ ok, code, ...extra });

const frozenRead = (ok: boolean, code: string, extra: ResultExtras = {}): ReadResult =>
  Object.freeze({ ok, code, ...extra });

function inspectRecord(value: unknown): SessionV2Result {
  if (value === null || typeof value !== "object") {
    return frozenResult(false, "invalid_runtime_type");
  }

  let isArray: boolean;
  try {
    isArray = Array.isArray(value);
  } catch {
    return frozenResult(false, "hostile_array_check");
  }
  if (isArray) return frozenResult(false, "invalid_runtime_type");

  let prototype: object | null;
  try {
    prototype = Object.getPrototypeOf(value);
  } catch {
    return frozenResult(false, "hostile_get_prototype");
  }
  if (prototype !== Object.prototype && prototype !== null) {
    return frozenResult(false, "invalid_record_prototype");
  }

  let keys: (string | symbol)[];
  try {
    keys = Reflect.ownKeys(value);
  } catch {
    return frozenResult(false, "hostile_own_keys");
  }
  for (const key of keys) {
    if (typeof key !== "string") return frozenResult(false, "symbol_property_rejected");
    let descriptor: PropertyDescriptor | undefined;
    try {
      descriptor = Object.getOwnPropertyDescriptor(value, key);
    } catch {
      return frozenResult(false, "hostile_descriptor");
    }
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      return frozenResult(false, "accessor_or_non_enumerable_rejected");
    }
  }
  return frozenResult(true, "ok");
}

function ownData(value: unknown, key: string): ReadResult {
  const inspected = inspectRecord(value);
  if (!inspected.ok) return frozenRead(false, inspected.code, { path: key });
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value as object, key);
    if (!descriptor) return frozenRead(false, "missing_own_property", { path: key });
    if (!("value" in descriptor)) return frozenRead(false, "accessor_rejected", { path: key });
    return frozenRead(true, "ok", { value: descriptor.value });
  } catch {
    return frozenRead(false, "hostile_reflection", { path: key });
  }
}

function readPath(root: unknown, dotted: string): ReadResult {
  if (dotted.startsWith("literal:")) return frozenRead(true, "ok", { value: dotted.slice("literal:".length) });
  let current: unknown = root;
  for (const key of dotted.split(".")) {
    const next = ownData(current, key);
    if (!next.ok) return frozenRead(false, next.code, { path: dotted });
    current = next.value;
  }
  return frozenRead(true, "ok", { value: current });
}

function isCanonicalString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && !value.includes("\u0000") && value === value.normalize("NFC");
}

function predicateFailed(
  row: (typeof SESSION_V2_CONTRACT.precedence.rows)[number],
  facts: unknown,
): SessionV2Result {
  const values: unknown[] = [];
  for (const dependency of row.fact_dependencies) {
    const read = readPath(facts, dependency);
    if (!read.ok) return frozenResult(false, read.code, { path: read.path ?? dependency });
    values.push(read.value);
  }
  const pairIsSafeInteger = Number.isSafeInteger(values[0]) && Number.isSafeInteger(values[1]);
  let failed = false;
  switch (row.predicate_kind) {
    case "not_equal": failed = values[0] !== values[1]; break;
    case "immutable_binding": failed = values.slice(0, 4).some((value, index) => value !== values[index + 4]); break;
    case "receipt_binding": failed = values[0] !== values[2] || values[1] !== values[3]; break;
    case "equal": failed = values[0] !== values[1]; break;
    case "ordered_time":
    case "future_time": failed = !pairIsSafeInteger || (values[0] as number) > (values[1] as number); break;
    case "deadline": failed = !pairIsSafeInteger || (values[0] as number) >= (values[1] as number); break;
    case "enum_not": failed = values[0] !== values[1]; break;
    case "boolean_false": failed = values[0] === false; break;
    case "enum_equal": failed = values[0] === values[1]; break;
    default: return frozenResult(false, "unknown_predicate_kind");
  }
  return frozenResult(true, "ok", { failed });
}

function encodeProjection(
  projection: (typeof SESSION_V2_CONTRACT.crypto.projections)[number],
  input: unknown,
): SessionV2Result {
  const expected = SESSION_V2_CONTRACT.crypto.required_segment_order[projection.projection_id];
  if (expected.length !== projection.segments.length || projection.segments.some((segment, index) => segment.segment_id !== expected[index])) {
    return frozenResult(false, "projection_order_invalid");
  }
  const chunks: Buffer[] = [
    Buffer.from(projection.frame, "utf8"), Buffer.from([0]), Buffer.from(projection.version, "utf8"), Buffer.from([0]),
  ];
  for (const segment of projection.segments) {
    if (segment.source_path !== `${projection.schema_id}.${segment.segment_id}` || segment.canonical_encoding !== SESSION_V2_CONTRACT.crypto.canonical_encoding || segment.expected_operation !== projection.algorithm) {
      return frozenResult(false, "projection_authority_invalid");
    }
    const read = readPath(input, segment.source_path);
    if (!read.ok || !isCanonicalString(read.value)) {
      return frozenResult(false, "projection_value_invalid", { segment: segment.segment_id });
    }
    const bytes = Buffer.from(read.value, "utf8");
    chunks.push(Buffer.from(segment.segment_id, "utf8"), Buffer.from([0]), Buffer.from(String(bytes.length), "utf8"), Buffer.from([0]), bytes, Buffer.from("\n", "utf8"));
  }
  return frozenResult(true, "ok", { bytes: Buffer.concat(chunks) });
}

function hmacKeyFor(
  projection: (typeof SESSION_V2_CONTRACT.crypto.projections)[number],
  input: unknown,
  keyring: unknown,
): ReadResult {
  if (projection.key_selection_rule !== "by_key_id_segment" || !projection.key_domain || !projection.key_id_segment) {
    return frozenRead(false, "key_rule_invalid");
  }
  const keyIdentifier = readPath(input, `${projection.schema_id}.${projection.key_id_segment}`);
  if (!keyIdentifier.ok || typeof keyIdentifier.value !== "string") return frozenRead(false, "key_rejected");
  const domain = ownData(keyring, projection.key_domain);
  if (!domain.ok) return frozenRead(false, "key_rejected");
  const material = ownData(domain.value, keyIdentifier.value);
  if (!material.ok || !isCanonicalString(material.value)) return frozenRead(false, "key_rejected");
  return frozenRead(true, "ok", { value: material.value });
}

export const SESSION_V2_FOUNDATION = Object.freeze({
  contract: SESSION_V2_CONTRACT,
  verifySession: (evidence: unknown): SessionV2Result => {
    // The default-off foundation deliberately does not interpret caller evidence yet.
    void evidence;
    return frozenResult(false, "authority_unavailable");
  },
  validateVersion: (value: unknown): SessionV2Result => {
    const protocol = ownData(value, "protocol");
    const version = ownData(value, "version");
    if (!protocol.ok || !version.ok || typeof protocol.value !== "string" || typeof version.value !== "string") {
      return frozenResult(false, "version_rejected");
    }
    return protocol.value === SESSION_V2_CONTRACT.protocol && version.value === SESSION_V2_CONTRACT.version
      ? frozenResult(true, "ok")
      : frozenResult(false, "version_rejected");
  },
  evaluateTransition: (facts: unknown): SessionV2Result => {
    const inspected = inspectRecord(facts);
    if (!inspected.ok) return frozenResult(false, "input_invalid");
    const rows = [...SESSION_V2_CONTRACT.precedence.rows].sort((left, right) => left.ordinal - right.ordinal);
    for (const row of rows) {
      const checked = predicateFailed(row, facts);
      if (!checked.ok) return frozenResult(false, checked.code, { path: checked.path ?? null });
      if (checked.failed === true) return frozenResult(false, row.result_code, { ordinal: row.ordinal, predicate_id: row.predicate_id });
    }
    return frozenResult(true, "valid_transition");
  },
  projectEvidence: (projectionId: string, input: unknown, keyring: unknown = Object.create(null)): SessionV2Result => {
    const projection = SESSION_V2_CONTRACT.crypto.projections.find((entry) => entry.projection_id === projectionId);
    if (!projection || !inspectRecord(input).ok) return frozenResult(false, "input_invalid");
    const frame = encodeProjection(projection, input);
    if (!frame.ok || !Buffer.isBuffer(frame.bytes)) return frozenResult(false, frame.code);
    try {
      if (projection.algorithm === "SHA-256") {
        return frozenResult(true, "ok", { digest: createHash("sha256").update(frame.bytes).digest("hex") });
      }
      const key = hmacKeyFor(projection, input, keyring);
      if (!key.ok || typeof key.value !== "string") return frozenResult(false, "key_rejected");
      return frozenResult(true, "ok", { digest: createHmac("sha256", key.value).update(frame.bytes).digest("hex") });
    } catch {
      return frozenResult(false, "crypto_operation_failed");
    }
  },
});
