import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { SESSION_V2_CONTRACT } from "./session-v2-contract";

type ResultExtras = Readonly<Record<string, unknown>>;
export type SessionV2Result = Readonly<{ ok: boolean; code: string } & ResultExtras>;
type ReadResult = Readonly<{ ok: boolean; code: string; value?: unknown; path?: string }>;
type RuntimeRule = Readonly<{ kind?: string; values?: readonly string[]; schema?: string }>;
type RuntimeSchema = Readonly<{
  prototype: "Object.prototype";
  exact_own_enumerable_data_fields: readonly string[];
  fields: Readonly<Record<string, RuntimeRule>>;
}>;
type RuntimeSchemaRegistry = Readonly<Record<string, RuntimeSchema>>;

const frozenResult = (ok: boolean, code: string, extra: ResultExtras = {}): SessionV2Result =>
  Object.freeze({ ok, code, ...extra });
const frozenRead = (ok: boolean, code: string, extra: ResultExtras = {}): ReadResult =>
  Object.freeze({ ok, code, ...extra });
const utf8Compare = (left: string, right: string): number => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
const isCanonicalString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && !value.includes("\u0000") && value === value.normalize("NFC");
const isBase64urlSha256 = (value: unknown): value is string => isCanonicalString(value) && /^[A-Za-z0-9_-]{43}$/u.test(value);

function validateScalar(value: unknown, rule: RuntimeRule): boolean {
  switch (rule.kind) {
    case "canonical_string": return isCanonicalString(value);
    case "base64url_sha256": return isBase64urlSha256(value);
    case "safe_integer": return Number.isSafeInteger(value);
    case "boolean": return typeof value === "boolean";
    case "enum": return typeof value === "string" && !!rule.values?.includes(value);
    default: return false;
  }
}

function materializeRecord(value: unknown, schemaId: string, registry: RuntimeSchemaRegistry): ReadResult {
  const schema = registry[schemaId];
  if (!schema) return frozenRead(false, "unknown_runtime_schema", { path: schemaId });
  try {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return frozenRead(false, "invalid_runtime_type", { path: schemaId });
    if (Object.getPrototypeOf(value) !== Object.prototype) return frozenRead(false, "invalid_record_prototype", { path: schemaId });
    const keys = Reflect.ownKeys(value);
    if (keys.some((key) => typeof key !== "string")) return frozenRead(false, "symbol_property_rejected", { path: schemaId });
    const actual = (keys as string[]).slice().sort(utf8Compare);
    const expected = [...schema.exact_own_enumerable_data_fields].sort(utf8Compare);
    if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
      return frozenRead(false, "exact_field_set", { path: schemaId });
    }
    const output: Record<string, unknown> = {};
    for (const field of schema.exact_own_enumerable_data_fields) {
      const descriptor = Object.getOwnPropertyDescriptor(value, field);
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
        return frozenRead(false, "descriptor_policy", { path: `${schemaId}.${field}` });
      }
      const rule = schema.fields[field];
      if (!rule) return frozenRead(false, "schema_rule_missing", { path: `${schemaId}.${field}` });
      if (rule.schema) {
        const nested = materializeRecord(descriptor.value, rule.schema, registry);
        if (!nested.ok) return nested;
        output[field] = nested.value;
      } else {
        if (!validateScalar(descriptor.value, rule)) return frozenRead(false, "field_grammar", { path: `${schemaId}.${field}` });
        output[field] = descriptor.value;
      }
    }
    return frozenRead(true, "ok", { value: Object.freeze(output) });
  } catch {
    return frozenRead(false, "hostile_reflection", { path: schemaId });
  }
}

function exactVersion(value: unknown): ReadResult {
  const registry: RuntimeSchemaRegistry = {
    version: {
      prototype: "Object.prototype",
      exact_own_enumerable_data_fields: ["protocol", "version"],
      fields: { protocol: { kind: "canonical_string" }, version: { kind: "canonical_string" } },
    },
  };
  return materializeRecord(value, "version", registry);
}

function ownData(value: unknown, key: string): ReadResult {
  try {
    if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
      return frozenRead(false, "invalid_record_prototype", { path: key });
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) return frozenRead(false, "missing_own_data", { path: key });
    return frozenRead(true, "ok", { value: descriptor.value });
  } catch {
    return frozenRead(false, "hostile_reflection", { path: key });
  }
}

function readPath(root: unknown, dotted: string): ReadResult {
  if (dotted.startsWith("literal:")) return frozenRead(true, "ok", { value: dotted.slice("literal:".length) });
  let current = root;
  for (const key of dotted.split(".")) {
    const next = ownData(current, key);
    if (!next.ok) return frozenRead(false, next.code, { path: dotted });
    current = next.value;
  }
  return frozenRead(true, "ok", { value: current });
}

function predicateFailed(row: (typeof SESSION_V2_CONTRACT.precedence.rows)[number], facts: unknown): SessionV2Result {
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

function encodeProjection(projection: (typeof SESSION_V2_CONTRACT.crypto.projections)[number], input: unknown): SessionV2Result {
  const expected = SESSION_V2_CONTRACT.crypto.required_segment_order[projection.projection_id];
  if (expected.length !== projection.segments.length || projection.segments.some((segment, index) => segment.segment_id !== expected[index])) {
    return frozenResult(false, "projection_order_invalid");
  }
  const chunks: Buffer[] = [Buffer.from(projection.frame), Buffer.from([0]), Buffer.from(projection.version), Buffer.from([0])];
  for (const segment of projection.segments) {
    if (segment.source_path !== `${projection.schema_id}.${segment.segment_id}` || segment.canonical_encoding !== SESSION_V2_CONTRACT.crypto.canonical_encoding || segment.expected_operation !== projection.algorithm) {
      return frozenResult(false, "projection_authority_invalid");
    }
    const read = readPath(input, segment.source_path);
    if (!read.ok || !isCanonicalString(read.value)) return frozenResult(false, "projection_value_invalid", { segment: segment.segment_id });
    const bytes = Buffer.from(read.value, "utf8");
    chunks.push(Buffer.from(segment.segment_id), Buffer.from([0]), Buffer.from(String(bytes.length)), Buffer.from([0]), bytes, Buffer.from("\n"));
  }
  return frozenResult(true, "ok", { bytes: Buffer.concat(chunks) });
}

function copyRuntimeKey(value: unknown): ReadResult {
  try {
    if (Object.getPrototypeOf(value) !== Uint8Array.prototype || (value as Uint8Array).constructor !== Uint8Array || (value as Uint8Array).byteLength !== 32 || (value as Uint8Array).length !== 32) {
      return frozenRead(false, "key_rejected");
    }
    const copy = new Uint8Array(32);
    copy.set(value as Uint8Array);
    return frozenRead(true, "ok", { value: copy });
  } catch {
    return frozenRead(false, "key_rejected");
  }
}

function hmacKeyFor(projection: (typeof SESSION_V2_CONTRACT.crypto.projections)[number], input: unknown, keyring: unknown): ReadResult {
  if (projection.key_selection_rule !== "by_key_id_segment" || !projection.key_domain || !projection.key_id_segment) return frozenRead(false, "key_rule_invalid");
  const keyIdentifier = readPath(input, `${projection.schema_id}.${projection.key_id_segment}`);
  if (!keyIdentifier.ok || typeof keyIdentifier.value !== "string") return frozenRead(false, "key_rejected");
  const domain = ownData(keyring, projection.key_domain);
  if (!domain.ok) return frozenRead(false, "key_rejected");
  const material = ownData(domain.value, keyIdentifier.value);
  if (!material.ok) return frozenRead(false, "key_rejected");
  return copyRuntimeKey(material.value);
}

function equalUtf8(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function normalizedCryptoRoot(input: unknown): ReadResult {
  return materializeRecord(input, "crypto_root", SESSION_V2_CONTRACT.runtime_schemas.crypto as RuntimeSchemaRegistry);
}

function bindingDigest(input: unknown): SessionV2Result {
  const projection = SESSION_V2_CONTRACT.crypto.projections.find((entry) => entry.projection_id === "binding");
  if (!projection) return frozenResult(false, "projection_authority_invalid");
  const frame = encodeProjection(projection, input);
  if (!frame.ok || !Buffer.isBuffer(frame.bytes)) return frozenResult(false, frame.code);
  return frozenResult(true, "ok", {
    digest: createHash("sha256").update(frame.bytes).digest("hex"),
    binding_digest: createHash("sha256").update(frame.bytes).digest("base64url"),
  });
}

const protectedFacts = new WeakMap<object, Readonly<{ binding: Readonly<{ claims_digest: string }> }>>();

export const SESSION_V2_FOUNDATION = Object.freeze({
  contract: SESSION_V2_CONTRACT,
  verifySession: (evidence: unknown): SessionV2Result => {
    void evidence;
    return frozenResult(false, "authority_unavailable");
  },
  validateVersion: (value: unknown): SessionV2Result => {
    const normalized = exactVersion(value);
    if (!normalized.ok) return frozenResult(false, "version_rejected");
    const protocol = readPath(normalized.value, "protocol");
    const version = readPath(normalized.value, "version");
    return protocol.value === SESSION_V2_CONTRACT.protocol && version.value === SESSION_V2_CONTRACT.version
      ? frozenResult(true, "ok") : frozenResult(false, "version_rejected");
  },
  evaluateTransition: (facts: unknown): SessionV2Result => {
    const normalized = materializeRecord(facts, "transition_root", SESSION_V2_CONTRACT.runtime_schemas.transition as RuntimeSchemaRegistry);
    if (!normalized.ok) return frozenResult(false, "input_invalid", { cause: normalized.code, path: normalized.path ?? null });
    const rows = [...SESSION_V2_CONTRACT.precedence.rows].sort((left, right) => left.ordinal - right.ordinal);
    for (const row of rows) {
      const checked = predicateFailed(row, normalized.value);
      if (!checked.ok) return frozenResult(false, checked.code, { path: checked.path ?? null });
      if (checked.failed === true) return frozenResult(false, row.result_code, { ordinal: row.ordinal, predicate_id: row.predicate_id });
    }
    return frozenResult(true, "valid_transition");
  },
  projectEvidence: (projectionId: string, input: unknown, keyring: unknown = Object.create(null)): SessionV2Result => {
    const normalized = normalizedCryptoRoot(input);
    if (!normalized.ok) return frozenResult(false, "input_invalid", { cause: normalized.code, path: normalized.path ?? null });
    const projection = SESSION_V2_CONTRACT.crypto.projections.find((entry) => entry.projection_id === projectionId);
    if (!projection) return frozenResult(false, "input_invalid");
    const binding = bindingDigest(normalized.value);
    if (!binding.ok || typeof binding.binding_digest !== "string") return frozenResult(false, binding.code);
    if (projectionId === "binding") return frozenResult(true, "ok", { digest: binding.digest });
    const suppliedDigest = readPath(normalized.value, "provenance.binding_digest");
    if (typeof suppliedDigest.value !== "string" || !equalUtf8(suppliedDigest.value, binding.binding_digest)) return frozenResult(false, "binding_digest_mismatch");
    const frame = encodeProjection(projection, normalized.value);
    if (!frame.ok || !Buffer.isBuffer(frame.bytes)) return frozenResult(false, frame.code);
    const key = hmacKeyFor(projection, normalized.value, keyring);
    if (!key.ok || !(key.value instanceof Uint8Array)) return frozenResult(false, "key_rejected");
    try {
      return frozenResult(true, "ok", { digest: createHmac("sha256", key.value).update(frame.bytes).digest("hex") });
    } catch {
      return frozenResult(false, "crypto_operation_failed");
    }
  },
  materializeProtectedFacts: (input: unknown, runtimeKey: unknown, suppliedTag: unknown): SessionV2Result => {
    const trace = { binding_sha256: 0, provenance_hmac: 0, protected_fact_emission: 0 };
    const normalized = normalizedCryptoRoot(input);
    if (!normalized.ok) return frozenResult(false, "input_invalid", { cause: normalized.code, trace: Object.freeze({ ...trace }) });
    const binding = bindingDigest(normalized.value);
    trace.binding_sha256 += 1;
    if (!binding.ok || typeof binding.binding_digest !== "string") return frozenResult(false, binding.code, { trace: Object.freeze({ ...trace }) });
    const suppliedDigest = readPath(normalized.value, "provenance.binding_digest");
    if (typeof suppliedDigest.value !== "string" || !equalUtf8(suppliedDigest.value, binding.binding_digest)) return frozenResult(false, "binding_digest_mismatch", { trace: Object.freeze({ ...trace }) });
    const key = copyRuntimeKey(runtimeKey);
    if (!key.ok || !(key.value instanceof Uint8Array)) return frozenResult(false, "key_rejected", { trace: Object.freeze({ ...trace }) });
    if (!isBase64urlSha256(suppliedTag)) return frozenResult(false, "hmac_tag_rejected", { trace: Object.freeze({ ...trace }) });
    const projection = SESSION_V2_CONTRACT.crypto.projections.find((entry) => entry.projection_id === "provenance");
    if (!projection) return frozenResult(false, "projection_authority_invalid", { trace: Object.freeze({ ...trace }) });
    const frame = encodeProjection(projection, normalized.value);
    if (!frame.ok || !Buffer.isBuffer(frame.bytes)) return frozenResult(false, frame.code, { trace: Object.freeze({ ...trace }) });
    trace.provenance_hmac += 1;
    const expected = createHmac("sha256", key.value).update(frame.bytes).digest("base64url");
    if (!equalUtf8(suppliedTag, expected)) return frozenResult(false, "hmac_mismatch", { trace: Object.freeze({ ...trace }) });
    const handle = Object.freeze(Object.create(null)) as object;
    const claims = readPath(normalized.value, "binding.claims_digest");
    protectedFacts.set(handle, Object.freeze({ binding: Object.freeze({ claims_digest: String(claims.value) }) }));
    trace.protected_fact_emission += 1;
    return frozenResult(true, "ok", { authority: handle, trace: Object.freeze({ ...trace }) });
  },
  isProtectedFactsAuthority: (value: unknown): boolean =>
    (typeof value === "object" && value !== null) ? protectedFacts.has(value) : false,
  readProtectedFacts: (value: unknown): SessionV2Result => {
    if (typeof value !== "object" || value === null || !protectedFacts.has(value)) return frozenResult(false, "authority_handle");
    return frozenResult(true, "ok", { facts: protectedFacts.get(value) });
  },
});
