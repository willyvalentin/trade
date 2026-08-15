import "server-only";

import { Buffer as IntrinsicBuffer } from "node:buffer";
import {
  createHash,
  createPublicKey,
  verify as verifySignature,
} from "node:crypto";
import {
  isDeepStrictEqual as intrinsicIsDeepStrictEqual,
  types as nodeTypes,
} from "node:util";

import {
  CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY,
  CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
  CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
  validateCanonicalBoundedSnapshotPayload,
} from "@/lib/server/canonical-governed-binding-snapshot-admission";
import {
  CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_REQUEST_VERSION,
  CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_STATUSES,
  canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest,
  createCanonicalGovernedBindingSnapshotIssuanceHarness,
  verifyCanonicalGovernedBindingSnapshotIssuanceResult,
  type CanonicalGovernedBindingSnapshotIssuanceDependencies,
  type CanonicalGovernedBindingSnapshotIssuanceRequest,
  type CanonicalGovernedBindingSnapshotIssuanceResult,
  type CanonicalGovernedBindingSnapshotIssuerAuthority,
} from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor";

const intrinsicStructuredClone = structuredClone;
const intrinsicJsonParse = JSON.parse;
const intrinsicJsonStringify = JSON.stringify;
const intrinsicObjectFreeze = Object.freeze;
const intrinsicObjectGetOwnPropertyDescriptor =
  Object.getOwnPropertyDescriptor;
const intrinsicObjectGetPrototypeOf = Object.getPrototypeOf;
const intrinsicObjectKeys = Object.keys;
const intrinsicObjectPrototype = Object.prototype;
const intrinsicArrayIsArray = Array.isArray;
const intrinsicArrayPop = Array.prototype.pop;
const intrinsicArrayPush = Array.prototype.push;
const intrinsicArraySort = Array.prototype.sort;
const intrinsicArrayJoin = Array.prototype.join;
const intrinsicReflectApply = Reflect.apply;
const intrinsicReflectOwnKeys = Reflect.ownKeys;
const intrinsicNodeIsProxy = nodeTypes.isProxy;
const intrinsicStringCharCodeAt = String.prototype.charCodeAt;
const intrinsicStringRepeat = String.prototype.repeat;
const intrinsicRegExpExec = RegExp.prototype.exec;
const intrinsicNumberIsSafeInteger = Number.isSafeInteger;
const intrinsicString = String;
const intrinsicBufferFrom = IntrinsicBuffer.from;
const intrinsicBufferToString = IntrinsicBuffer.prototype.toString;
const intrinsicHashUpdate = createHash("sha256").update;
const intrinsicHashDigest = createHash("sha256").digest;
const IntrinsicArrayConstructor = Array;
const IntrinsicWeakMap = WeakMap;
const intrinsicWeakMapGet = WeakMap.prototype.get;
const intrinsicWeakMapSet = WeakMap.prototype.set;

function arrayPop<T>(values: T[]) {
  return intrinsicReflectApply(intrinsicArrayPop, values, []) as T | undefined;
}

function arrayPush<T>(values: T[], ...added: T[]) {
  return intrinsicReflectApply(intrinsicArrayPush, values, added) as number;
}

function arraySort<T>(
  values: T[],
  comparator?: (first: T, second: T) => number,
) {
  intrinsicReflectApply(
    intrinsicArraySort,
    values,
    comparator ? [comparator] : [],
  );
  return values;
}

function arrayJoin(values: readonly string[], separator: string) {
  return intrinsicReflectApply(intrinsicArrayJoin, values, [
    separator,
  ]) as string;
}

function weakMapGet<K extends object, V>(map: WeakMap<K, V>, key: K) {
  return intrinsicReflectApply(intrinsicWeakMapGet, map, [key]) as
    | V
    | undefined;
}

function weakMapSet<K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  value: V,
) {
  intrinsicReflectApply(intrinsicWeakMapSet, map, [key, value]);
}

function compareCanonicalStrings(first: string, second: string) {
  if (first === second) return 0;
  return first < second ? -1 : 1;
}

function stringCharCodeAt(value: string, index: number) {
  return intrinsicReflectApply(intrinsicStringCharCodeAt, value, [
    index,
  ]) as number;
}

function stringRepeat(value: string, count: number) {
  return intrinsicReflectApply(intrinsicStringRepeat, value, [count]) as string;
}

export const CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION =
  "canonical_non_forgeable_binding_snapshot_issuance_v3" as const;
export const CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_VERSION =
  "canonical_non_forgeable_issuer_authority_v3" as const;
export const CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION =
  "canonical_non_forgeable_issuer_authority_envelope_v3" as const;
export const CANONICAL_NON_FORGEABLE_NESTED_SCHEMA_VERSION =
  "canonical_non_forgeable_nested_request_schema_v3" as const;
export const CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID =
  "action-666cs-current-main-external-owner-session-v1" as const;
export const CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION =
  "canonical_non_forgeable_external_owner_boundary_v3" as const;
export const DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ENABLED =
  false;
export const DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_KILL_SWITCH =
  true;
export const CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_STATUSES =
  intrinsicObjectFreeze([
    ...CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_STATUSES,
  ] as const);

export const CANONICAL_NON_FORGEABLE_AUTHORITY_PUBLIC_KEY_PEM = [
  "-----BEGIN PUBLIC KEY-----",
  "MCowBQYDK2VwAyEA8eBfYMSGuLf3z+Rp6wHaBcsk/KfSTtyyzC8o7blftbg=",
  "-----END PUBLIC KEY-----",
  "",
].join("\n");

// These pins are replaced only by a source-reviewed successor. The signed
// envelope cannot rotate any of them at runtime.
export const CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_IDENTITY =
  "authority:governed-binding-issuance-successor" as const;
export const CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_DIGEST =
  "13b5f5a2c0bce18ba2b59ae64fc3f9b806f5012fcd3312f803d7e95e12acf8b6" as const;
export const CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_ROOT_DIGEST =
  "817e896f5d3217c92009f3f24926507f9159e2c44cba8e36c009573d11733d8c" as const;
export const CANONICAL_NON_FORGEABLE_PINNED_ISSUER_ANCHOR_DIGEST =
  "9dc754dfcdd831c5a9c2e5277ec05125b6a2145115432305856ec4e364815a7e" as const;
export const CANONICAL_NON_FORGEABLE_PINNED_REQUEST_IDENTITY =
  "issuance:synthetic-governed-improvement:20260730:1" as const;
export const CANONICAL_NON_FORGEABLE_PINNED_SEMANTIC_SCOPE_DIGEST =
  "5eaf423b38c3ca3d7b228d108687665835da794d373d5e8b904100efe4aa992d" as const;
export const CANONICAL_NON_FORGEABLE_PINNED_NESTED_SCHEMA_DIGEST =
  "e47ace2a98bbf1f81ba4b6cc46b3f9d60e4fa4d352b3dcca3699eadd69914226" as const;
export const CANONICAL_NON_FORGEABLE_PINNED_PREDECESSOR_OWNER_BOUNDARY =
  "owner-boundary:governed-binding-issuance-successor" as const;
export const CANONICAL_NON_FORGEABLE_MAX_ENVELOPE_UTF8_BYTES = 32_768;

export const CANONICAL_NON_FORGEABLE_NESTED_REQUEST_BUDGETS =
  intrinsicObjectFreeze({
    budget_version: "canonical_non_forgeable_nested_request_budget_v3",
    validator_version: CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
    inherited_policy: CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY,
    inherited_policy_digest:
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
    maximum_envelope_utf8_bytes:
      CANONICAL_NON_FORGEABLE_MAX_ENVELOPE_UTF8_BYTES,
  });

export const CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ARTIFACT_ROLES =
  intrinsicObjectFreeze({
    "lib/server/canonical-non-forgeable-binding-snapshot-issuance.ts":
      "implementation",
    "lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666cs-current-main-non-forgeable-observation-authority.spec.ts":
      "focused_tests",
    "docs/action-666cs-current-main-non-forgeable-observation-authority.md":
      "contract_documentation",
    "docs/action-666cs-golden-non-forgeable-observation-authority-report.json":
      "synthetic_golden_report",
  } as const);

const safety = {
  shadow_only: true,
  live_ranking_effect: false,
  live_impact: false,
  persistence_performed: false,
  automatic_training_allowed: false,
  automatic_parameter_change_allowed: false,
  automatic_threshold_change_allowed: false,
  automatic_model_change_allowed: false,
  automatic_promotion_allowed: false,
  external_ai_canonical_truth_authority: false,
  causal_improvement_claimed: false,
  synthetic_evidence: true,
  not_publishable: true,
} as const;

type Safety = typeof safety;
type Status =
  (typeof CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_STATUSES)[number];

export type CanonicalNonForgeableIssuerAuthorityPayload = {
  authority_version:
    typeof CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_VERSION;
  authority_session_identity:
    typeof CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID;
  external_owner_boundary_version:
    typeof CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION;
  external_owner_boundary_identity: string;
  expected_predecessor_owner_boundary_identity: string;
  expected_authority_identity: string;
  expected_authority_digest: string;
  expected_authority_root_digest: string;
  expected_issuer_anchor_digest: string;
  expected_request_identity: string;
  expected_request_version:
    typeof CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_REQUEST_VERSION;
  expected_nested_schema_digest: string;
  expected_semantic_scope_digest: string;
  minimum_publication_epoch: number;
  authority_payload_digest_algorithm: "sha256_canonical_json_v1";
  authority_payload_digest: string;
};

export type CanonicalNonForgeableIssuerAuthorityEnvelope = {
  envelope_version:
    typeof CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION;
  payload: CanonicalNonForgeableIssuerAuthorityPayload;
  signature_algorithm: "ed25519_sha256_canonical_json_v1";
  signature_base64: string;
};

export type CanonicalNonForgeableIssuerAuthorityDependency = {
  owner_boundary_version:
    typeof CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION;
  owner_boundary_identity: string;
  read_signed_authority_envelope_json: () => string;
};

export type CanonicalNonForgeableBindingSnapshotIssuanceDependencies = {
  authority_dependency: CanonicalNonForgeableIssuerAuthorityDependency;
  predecessor_dependencies:
    CanonicalGovernedBindingSnapshotIssuanceDependencies;
};

export type CanonicalNonForgeableBindingSnapshotIssuanceCounters = {
  request_reads: number;
  request_validations: number;
  request_clones: number;
  envelope_reads: number;
  envelope_byte_validations: number;
  envelope_parses: number;
  authority_envelope_verification_attempts: number;
  predecessor_harness_constructions: number;
  predecessor_executions: number;
  predecessor_rebuilds: number;
  digest_operations: number;
};

export type CanonicalNonForgeableRequestObservation = {
  observation_version: "canonical_non_forgeable_request_observation_v3";
  status: "valid" | "invalid" | "budget_exceeded" | "schema_invalid";
  reason_codes: string[];
  first_rejected_path: string | null;
  observed_depth: number;
  observed_nodes: number;
  observed_own_keys: number;
  observed_array_length: number | null;
  observed_string_bytes: number | null;
  observed_total_string_bytes: number;
  request_digest: string;
  nested_schema_digest: string | null;
  semantic_scope_digest: string | null;
  observation_digest_algorithm: "sha256_canonical_json_v1";
  observation_digest: string;
};

export type CanonicalNonForgeableBindingSnapshotIssuanceResult = {
  issuance_version:
    typeof CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION;
  status: Status;
  issuance_identity: string | null;
  request_digest: string;
  request_observation: CanonicalNonForgeableRequestObservation;
  nested_schema_version:
    typeof CANONICAL_NON_FORGEABLE_NESTED_SCHEMA_VERSION;
  nested_schema_closed: boolean;
  semantic_scope_digest: string | null;
  authority_session_identity: string | null;
  authority_payload_digest: string | null;
  authority_envelope_digest: string | null;
  authority_identity: string | null;
  authority_digest: string | null;
  authority_root_digest: string | null;
  authority_signature_verified: boolean;
  authority_pins_verified: boolean;
  runtime_provenance_verified: boolean;
  predecessor_result: CanonicalGovernedBindingSnapshotIssuanceResult | null;
  predecessor_result_verified: boolean;
  reason_codes: string[];
  issuance_digest_algorithm: "sha256_canonical_json_v1";
  issuance_digest: string;
} & Safety;

type BoundedValidation = ReturnType<
  typeof validateCanonicalBoundedSnapshotPayload
>;

type CanonicalFrame =
  | { kind: "token"; value: string }
  | { kind: "value"; value: unknown };

type SchemaFrame = {
  value: unknown;
  path: string;
};

type ParsedEnvelope = {
  envelope: CanonicalNonForgeableIssuerAuthorityEnvelope;
  envelope_digest: string;
};

type PredecessorHarness = ReturnType<
  typeof createCanonicalGovernedBindingSnapshotIssuanceHarness
>;

type PrivateHarnessAuthority = {
  rebuild: (
    request: unknown,
  ) => CanonicalNonForgeableBindingSnapshotIssuanceResult;
};

const harnessAuthorities =
  new IntrinsicWeakMap<object, PrivateHarnessAuthority | null>();
const publicKey = createPublicKey(
  CANONICAL_NON_FORGEABLE_AUTHORITY_PUBLIC_KEY_PEM,
);
const signaturePattern = /^[A-Za-z0-9+/]{86}==$/;

function isProxy(value: object) {
  return intrinsicReflectApply(intrinsicNodeIsProxy, nodeTypes, [
    value,
  ]) as boolean;
}

function exactKeys(value: object, expected: string[]) {
  try {
    if (isProxy(value)) return false;
    const prototype = intrinsicObjectGetPrototypeOf(value);
    if (prototype !== intrinsicObjectPrototype && prototype !== null) {
      return false;
    }
    const actual = intrinsicReflectOwnKeys(value);
    if (actual.length !== expected.length) return false;
    const sortedExpected = arraySort(
      new IntrinsicArrayConstructor(...expected),
      compareCanonicalStrings,
    );
    const sortedActual = arraySort(
      new IntrinsicArrayConstructor(...actual),
      (first, second) =>
        compareCanonicalStrings(intrinsicString(first), intrinsicString(second)),
    );
    for (let index = 0; index < sortedActual.length; index += 1) {
      if (
        typeof sortedActual[index] !== "string" ||
        sortedActual[index] !== sortedExpected[index]
      ) {
        return false;
      }
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
        value,
        sortedActual[index],
      );
      if (
        !descriptor ||
        !("value" in descriptor) ||
        !descriptor.enumerable
      ) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function ownDataValue(value: object, key: PropertyKey) {
  try {
    const descriptor = intrinsicObjectGetOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor && descriptor.enumerable
      ? { present: true as const, value: descriptor.value }
      : { present: false as const, value: undefined };
  } catch {
    return { present: false as const, value: undefined };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  try {
    return (
      !intrinsicArrayIsArray(value) &&
      !isProxy(value) &&
      (intrinsicObjectGetPrototypeOf(value) === intrinsicObjectPrototype ||
        intrinsicObjectGetPrototypeOf(value) === null)
    );
  } catch {
    return false;
  }
}

function validIdentity(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 3 || value.length > 256) {
    return false;
  }
  for (let index = 0; index < value.length; index += 1) {
    const code = stringCharCodeAt(value, index);
    const alphaNumeric =
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122);
    if (alphaNumeric) continue;
    if (
      index > 0 &&
      (code === 45 ||
        code === 46 ||
        code === 47 ||
        code === 58 ||
        code === 95)
    ) {
      continue;
    }
    return false;
  }
  return true;
}

function validFullSha(value: unknown): value is string {
  if (typeof value !== "string" || value.length !== 64) return false;
  for (let index = 0; index < value.length; index += 1) {
    const code = stringCharCodeAt(value, index);
    if ((code >= 48 && code <= 57) || (code >= 97 && code <= 102)) {
      continue;
    }
    return false;
  }
  return true;
}

function boundedUtf8ByteLength(value: string, limit: number) {
  let bytes = 0;
  for (let index = 0; index < value.length; index += 1) {
    const code = stringCharCodeAt(value, index);
    if (code <= 0x7f) {
      bytes += 1;
    } else if (code <= 0x7ff) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      const following = stringCharCodeAt(value, index + 1);
      if (following >= 0xdc00 && following <= 0xdfff) {
        bytes += 4;
        index += 1;
      } else {
        bytes += 3;
      }
    } else {
      bytes += 3;
    }
    if (bytes > limit) return { bytes, exceeded: true as const };
  }
  return { bytes, exceeded: false as const };
}

function canonicalJson(value: unknown) {
  const output: string[] = [];
  const pending: CanonicalFrame[] = [{ kind: "value", value }];
  while (pending.length > 0) {
    const frame = arrayPop(pending)!;
    if (frame.kind === "token") {
      arrayPush(output, frame.value);
      continue;
    }
    const current = frame.value;
    if (current === null || typeof current !== "object") {
      const serialized = intrinsicJsonStringify(current);
      if (serialized === undefined) {
        throw new Error("non_forgeable_canonical_json_invalid");
      }
      arrayPush(output, serialized);
      continue;
    }
    if (intrinsicArrayIsArray(current)) {
      arrayPush(pending, { kind: "token", value: "]" });
      for (let index = current.length - 1; index >= 0; index -= 1) {
        arrayPush(pending, { kind: "value", value: current[index] });
        if (index > 0) arrayPush(pending, { kind: "token", value: "," });
      }
      arrayPush(pending, { kind: "token", value: "[" });
      continue;
    }
    const keys = arraySort(
      intrinsicObjectKeys(current),
      compareCanonicalStrings,
    );
    arrayPush(pending, { kind: "token", value: "}" });
    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index];
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(current, key);
      if (!descriptor || !("value" in descriptor)) {
        throw new Error("non_forgeable_canonical_json_invalid");
      }
      arrayPush(pending, { kind: "value", value: descriptor.value });
      arrayPush(pending, { kind: "token", value: ":" });
      arrayPush(pending, {
        kind: "token",
        value: intrinsicJsonStringify(key),
      });
      if (index > 0) arrayPush(pending, { kind: "token", value: "," });
    }
    arrayPush(pending, { kind: "token", value: "{" });
  }
  return arrayJoin(output, "");
}

function hardenedDigest(value: unknown) {
  const hash = createHash("sha256");
  intrinsicReflectApply(intrinsicHashUpdate, hash, [canonicalJson(value)]);
  return intrinsicReflectApply(intrinsicHashDigest, hash, ["hex"]) as string;
}

function rawStringDigest(value: string) {
  const hash = createHash("sha256");
  intrinsicReflectApply(intrinsicHashUpdate, hash, [value]);
  return intrinsicReflectApply(intrinsicHashDigest, hash, ["hex"]) as string;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  const stack: object[] = [value];
  const visited = new IntrinsicWeakMap<object, true>();
  while (stack.length > 0) {
    const current = arrayPop(stack)!;
    if (weakMapGet(visited, current)) continue;
    weakMapSet(visited, current, true);
    const keys = intrinsicReflectOwnKeys(current);
    for (let index = 0; index < keys.length; index += 1) {
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
        current,
        keys[index],
      );
      if (!descriptor || !("value" in descriptor)) continue;
      if (descriptor.value !== null && typeof descriptor.value === "object") {
        arrayPush(stack, descriptor.value);
      }
    }
    intrinsicObjectFreeze(current);
  }
  return value;
}

function emptyCounters(): CanonicalNonForgeableBindingSnapshotIssuanceCounters {
  return {
    request_reads: 0,
    request_validations: 0,
    request_clones: 0,
    envelope_reads: 0,
    envelope_byte_validations: 0,
    envelope_parses: 0,
    authority_envelope_verification_attempts: 0,
    predecessor_harness_constructions: 0,
    predecessor_executions: 0,
    predecessor_rebuilds: 0,
    digest_operations: 0,
  };
}

function schemaDigest(value: unknown) {
  const tokens: string[] = [];
  const pending: SchemaFrame[] = [{ value, path: "$" }];
  while (pending.length > 0) {
    const frame = arrayPop(pending)!;
    const current = frame.value;
    if (current === null) {
      arrayPush(tokens, `${frame.path}=null`);
      continue;
    }
    if (intrinsicArrayIsArray(current)) {
      arrayPush(tokens, `${frame.path}=array:${current.length}`);
      for (let index = current.length - 1; index >= 0; index -= 1) {
        arrayPush(pending, {
          value: current[index],
          path: `${frame.path}[${index}]`,
        });
      }
      continue;
    }
    if (typeof current === "object") {
      const keys = arraySort(
        intrinsicObjectKeys(current),
        compareCanonicalStrings,
      );
      arrayPush(tokens, `${frame.path}=object:${arrayJoin(keys, ",")}`);
      for (let index = keys.length - 1; index >= 0; index -= 1) {
        const key = keys[index];
        const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
          current,
          key,
        );
        if (!descriptor || !("value" in descriptor)) {
          throw new Error("non_forgeable_schema_projection_invalid");
        }
        arrayPush(pending, {
          value: descriptor.value,
          path: `${frame.path}.${key}`,
        });
      }
      continue;
    }
    arrayPush(tokens, `${frame.path}=${typeof current}`);
  }
  return hardenedDigest({
    schema_version: CANONICAL_NON_FORGEABLE_NESTED_SCHEMA_VERSION,
    tokens,
  });
}

export function canonicalNonForgeableNestedRequestSchemaDigest(
  value: unknown,
) {
  const bounded = validateCanonicalBoundedSnapshotPayload(value);
  if (bounded.status !== "valid") {
    throw new Error("non_forgeable_nested_request_not_bounded");
  }
  return schemaDigest(value);
}

function payloadProjection(
  payload: CanonicalNonForgeableIssuerAuthorityPayload,
) {
  const projection = intrinsicStructuredClone(payload);
  projection.authority_payload_digest = stringRepeat("0", 64);
  return projection;
}

export function canonicalNonForgeableIssuerAuthorityPayloadDigest(
  payload: CanonicalNonForgeableIssuerAuthorityPayload,
) {
  const bounded = validateCanonicalBoundedSnapshotPayload(payload);
  if (bounded.status !== "valid") {
    throw new Error("non_forgeable_authority_payload_not_bounded");
  }
  return hardenedDigest(payloadProjection(payload));
}

function validPayloadShape(
  value: unknown,
): value is CanonicalNonForgeableIssuerAuthorityPayload {
  return !!(
    isRecord(value) &&
    exactKeys(value, [
      "authority_payload_digest",
      "authority_payload_digest_algorithm",
      "authority_session_identity",
      "authority_version",
      "expected_authority_digest",
      "expected_authority_identity",
      "expected_authority_root_digest",
      "expected_issuer_anchor_digest",
      "expected_nested_schema_digest",
      "expected_predecessor_owner_boundary_identity",
      "expected_request_identity",
      "expected_request_version",
      "expected_semantic_scope_digest",
      "external_owner_boundary_identity",
      "external_owner_boundary_version",
      "minimum_publication_epoch",
    ]) &&
    value.authority_version ===
      CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_VERSION &&
    value.authority_session_identity ===
      CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID &&
    value.external_owner_boundary_version ===
      CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION &&
    validIdentity(value.external_owner_boundary_identity) &&
    validIdentity(value.expected_predecessor_owner_boundary_identity) &&
    validIdentity(value.expected_authority_identity) &&
    validFullSha(value.expected_authority_digest) &&
    validFullSha(value.expected_authority_root_digest) &&
    validFullSha(value.expected_issuer_anchor_digest) &&
    validIdentity(value.expected_request_identity) &&
    value.expected_request_version ===
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_REQUEST_VERSION &&
    validFullSha(value.expected_nested_schema_digest) &&
    validFullSha(value.expected_semantic_scope_digest) &&
    typeof value.minimum_publication_epoch === "number" &&
    intrinsicNumberIsSafeInteger(value.minimum_publication_epoch) &&
    value.minimum_publication_epoch >= 1 &&
    value.authority_payload_digest_algorithm ===
      "sha256_canonical_json_v1" &&
    validFullSha(value.authority_payload_digest)
  );
}

function validEnvelopeShape(
  value: unknown,
): value is CanonicalNonForgeableIssuerAuthorityEnvelope {
  return !!(
    isRecord(value) &&
    exactKeys(value, [
      "envelope_version",
      "payload",
      "signature_algorithm",
      "signature_base64",
    ]) &&
    value.envelope_version ===
      CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION &&
    validPayloadShape(value.payload) &&
    value.signature_algorithm === "ed25519_sha256_canonical_json_v1" &&
    typeof value.signature_base64 === "string" &&
    intrinsicReflectApply(intrinsicRegExpExec, signaturePattern, [
      value.signature_base64,
    ]) !== null
  );
}

export function canonicalNonForgeableIssuerAuthorityEnvelopeJson(
  value: unknown,
) {
  const bounded = validateCanonicalBoundedSnapshotPayload(value);
  if (bounded.status !== "valid" || !validEnvelopeShape(value)) {
    throw new Error("non_forgeable_authority_envelope_invalid");
  }
  const json = canonicalJson(value);
  if (
    boundedUtf8ByteLength(
      json,
      CANONICAL_NON_FORGEABLE_MAX_ENVELOPE_UTF8_BYTES,
    ).exceeded
  ) {
    throw new Error("non_forgeable_authority_envelope_too_large");
  }
  return json;
}

function payloadPinsMatch(payload: CanonicalNonForgeableIssuerAuthorityPayload) {
  return (
    payload.authority_session_identity ===
      CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID &&
    payload.external_owner_boundary_identity ===
      CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION &&
    payload.expected_predecessor_owner_boundary_identity ===
      CANONICAL_NON_FORGEABLE_PINNED_PREDECESSOR_OWNER_BOUNDARY &&
    payload.expected_authority_identity ===
      CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_IDENTITY &&
    payload.expected_authority_digest ===
      CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_DIGEST &&
    payload.expected_authority_root_digest ===
      CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_ROOT_DIGEST &&
    payload.expected_issuer_anchor_digest ===
      CANONICAL_NON_FORGEABLE_PINNED_ISSUER_ANCHOR_DIGEST &&
    payload.expected_request_identity ===
      CANONICAL_NON_FORGEABLE_PINNED_REQUEST_IDENTITY &&
    payload.expected_nested_schema_digest ===
      CANONICAL_NON_FORGEABLE_PINNED_NESTED_SCHEMA_DIGEST &&
    payload.expected_semantic_scope_digest ===
      CANONICAL_NON_FORGEABLE_PINNED_SEMANTIC_SCOPE_DIGEST &&
    payload.minimum_publication_epoch === 1
  );
}

function parseAndVerifyEnvelope(raw: unknown): ParsedEnvelope | null {
  if (typeof raw !== "string") return null;
  if (
    boundedUtf8ByteLength(
      raw,
      CANONICAL_NON_FORGEABLE_MAX_ENVELOPE_UTF8_BYTES,
    ).exceeded
  ) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = intrinsicReflectApply(intrinsicJsonParse, undefined, [raw]);
  } catch {
    return null;
  }
  const bounded = validateCanonicalBoundedSnapshotPayload(parsed);
  if (
    bounded.status !== "valid" ||
    !validEnvelopeShape(parsed) ||
    canonicalJson(parsed) !== raw ||
    !payloadPinsMatch(parsed.payload)
  ) {
    return null;
  }
  const payloadDigest = canonicalNonForgeableIssuerAuthorityPayloadDigest(
    parsed.payload,
  );
  if (payloadDigest !== parsed.payload.authority_payload_digest) return null;
  let signatureBytes: IntrinsicBuffer;
  try {
    signatureBytes = intrinsicReflectApply(
      intrinsicBufferFrom,
      IntrinsicBuffer,
      [parsed.signature_base64, "base64"],
    ) as IntrinsicBuffer;
    const canonicalBase64 = intrinsicReflectApply(
      intrinsicBufferToString,
      signatureBytes,
      ["base64"],
    ) as string;
    if (
      signatureBytes.length !== 64 ||
      canonicalBase64 !== parsed.signature_base64
    ) {
      return null;
    }
  } catch {
    return null;
  }
  const verified = intrinsicReflectApply(verifySignature, undefined, [
    null,
    payloadDigest,
    publicKey,
    signatureBytes,
  ]) as boolean;
  if (!verified) return null;
  return {
    envelope: deepFreeze(parsed),
    envelope_digest: rawStringDigest(raw),
  };
}

function boundedObservation(
  bounded: BoundedValidation,
  input: {
    status: CanonicalNonForgeableRequestObservation["status"];
    reason_codes: string[];
    request_digest: string;
    nested_schema_digest?: string | null;
    semantic_scope_digest?: string | null;
  },
) {
  const projection = {
    observation_version:
      "canonical_non_forgeable_request_observation_v3" as const,
    status: input.status,
    reason_codes: [...input.reason_codes],
    first_rejected_path:
      bounded.status === "valid" ? null : bounded.first_rejected_path,
    observed_depth: bounded.observed_depth,
    observed_nodes: bounded.observed_nodes,
    observed_own_keys: bounded.observed_own_keys,
    observed_array_length: bounded.observed_array_length,
    observed_string_bytes: bounded.observed_string_bytes,
    observed_total_string_bytes: bounded.observed_total_string_bytes,
    request_digest: input.request_digest,
    nested_schema_digest: input.nested_schema_digest ?? null,
    semantic_scope_digest: input.semantic_scope_digest ?? null,
    observation_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...projection,
    observation_digest: hardenedDigest(projection),
  });
}

function invalidRequestObservation(
  bounded: BoundedValidation,
): CanonicalNonForgeableRequestObservation {
  const reasonCodes =
    bounded.status === "valid"
      ? ["non_forgeable_request_schema_invalid"]
      : bounded.reason_codes;
  const requestDigest = hardenedDigest({
    invalid_request_version: "canonical_non_forgeable_invalid_request_v3",
    status: bounded.status,
    reason_codes: reasonCodes,
    first_rejected_path:
      bounded.status === "valid" ? null : bounded.first_rejected_path,
    observed_depth: bounded.observed_depth,
    observed_nodes: bounded.observed_nodes,
    observed_own_keys: bounded.observed_own_keys,
    observed_array_length: bounded.observed_array_length,
    observed_string_bytes: bounded.observed_string_bytes,
    observed_total_string_bytes: bounded.observed_total_string_bytes,
  });
  return boundedObservation(bounded, {
    status: bounded.status === "valid" ? "schema_invalid" : bounded.status,
    reason_codes: reasonCodes,
    request_digest: requestDigest,
  });
}

function snapshotRequest(value: unknown) {
  const bounded = validateCanonicalBoundedSnapshotPayload(value);
  if (bounded.status !== "valid") {
    return { request: null, observation: invalidRequestObservation(bounded) };
  }
  let firstScope: string;
  try {
    firstScope = canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest(
      value as CanonicalGovernedBindingSnapshotIssuanceRequest,
    );
  } catch {
    return { request: null, observation: invalidRequestObservation(bounded) };
  }
  let snapshot: CanonicalGovernedBindingSnapshotIssuanceRequest;
  try {
    snapshot = intrinsicStructuredClone(
      value,
    ) as CanonicalGovernedBindingSnapshotIssuanceRequest;
  } catch {
    return { request: null, observation: invalidRequestObservation(bounded) };
  }
  const secondBounded = validateCanonicalBoundedSnapshotPayload(snapshot);
  let secondScope: string;
  try {
    secondScope = canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest(
      snapshot,
    );
  } catch {
    return {
      request: null,
      observation: invalidRequestObservation(secondBounded),
    };
  }
  if (firstScope !== secondScope) {
    return {
      request: null,
      observation: invalidRequestObservation(secondBounded),
    };
  }
  const requestDigest = hardenedDigest(snapshot);
  const nestedSchemaDigest = schemaDigest(snapshot);
  return {
    request: deepFreeze(snapshot),
    observation: boundedObservation(secondBounded, {
      status: "valid",
      reason_codes: [],
      request_digest: requestDigest,
      nested_schema_digest: nestedSchemaDigest,
      semantic_scope_digest: secondScope,
    }),
  };
}

function result(input: {
  status: Status;
  observation: CanonicalNonForgeableRequestObservation;
  envelope?: ParsedEnvelope | null;
  predecessor?: CanonicalGovernedBindingSnapshotIssuanceResult | null;
  predecessorVerified?: boolean;
  reasons: string[];
}) {
  const envelope = input.envelope?.envelope ?? null;
  const predecessor = input.predecessor ?? null;
  const payload = {
    issuance_version:
      CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION,
    status: input.status,
    issuance_identity:
      predecessor?.issuance_identity ??
      (input.observation.status === "valid"
        ? CANONICAL_NON_FORGEABLE_PINNED_REQUEST_IDENTITY
        : null),
    request_digest: input.observation.request_digest,
    request_observation: input.observation,
    nested_schema_version: CANONICAL_NON_FORGEABLE_NESTED_SCHEMA_VERSION,
    nested_schema_closed:
      input.observation.nested_schema_digest ===
      CANONICAL_NON_FORGEABLE_PINNED_NESTED_SCHEMA_DIGEST,
    semantic_scope_digest: input.observation.semantic_scope_digest,
    authority_session_identity:
      envelope?.payload.authority_session_identity ?? null,
    authority_payload_digest:
      envelope?.payload.authority_payload_digest ?? null,
    authority_envelope_digest: input.envelope?.envelope_digest ?? null,
    authority_identity: predecessor?.authority_identity ?? null,
    authority_digest: predecessor?.authority_digest ?? null,
    authority_root_digest: predecessor?.authority_root_digest ?? null,
    authority_signature_verified: !!envelope,
    authority_pins_verified: !!envelope,
    runtime_provenance_verified: !!envelope,
    predecessor_result: predecessor,
    predecessor_result_verified: input.predecessorVerified ?? false,
    reason_codes: [...input.reasons],
    issuance_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...payload,
    issuance_digest: hardenedDigest(payload),
  });
}

function execute(input: {
  request: unknown;
  readEnvelope: () => string;
  predecessorHarness: PredecessorHarness;
  counters: CanonicalNonForgeableBindingSnapshotIssuanceCounters;
}) {
  input.counters.request_reads += 1;
  input.counters.request_validations += 1;
  const requestSnapshot = snapshotRequest(input.request);
  if (!requestSnapshot.request) {
    input.counters.digest_operations += 2;
    return result({
      status: "incomplete",
      observation: requestSnapshot.observation,
      reasons: requestSnapshot.observation.reason_codes,
    });
  }
  input.counters.request_clones += 1;
  if (
    requestSnapshot.request.issuance_identity !==
      CANONICAL_NON_FORGEABLE_PINNED_REQUEST_IDENTITY ||
    requestSnapshot.observation.nested_schema_digest !==
      CANONICAL_NON_FORGEABLE_PINNED_NESTED_SCHEMA_DIGEST ||
    requestSnapshot.observation.semantic_scope_digest !==
      CANONICAL_NON_FORGEABLE_PINNED_SEMANTIC_SCOPE_DIGEST
  ) {
    input.counters.digest_operations += 1;
    return result({
      status: "incomplete",
      observation: requestSnapshot.observation,
      reasons: ["non_forgeable_request_signed_scope_mismatch"],
    });
  }
  let rawEnvelope: unknown;
  input.counters.envelope_reads += 1;
  try {
    rawEnvelope = intrinsicReflectApply(input.readEnvelope, undefined, []);
  } catch {
    input.counters.digest_operations += 1;
    return result({
      status: "conflicting",
      observation: requestSnapshot.observation,
      reasons: ["non_forgeable_authority_read_failed"],
    });
  }
  input.counters.envelope_byte_validations += 1;
  if (
    typeof rawEnvelope !== "string" ||
    boundedUtf8ByteLength(
      rawEnvelope,
      CANONICAL_NON_FORGEABLE_MAX_ENVELOPE_UTF8_BYTES,
    ).exceeded
  ) {
    input.counters.digest_operations += 1;
    return result({
      status: "conflicting",
      observation: requestSnapshot.observation,
      reasons: ["non_forgeable_external_authority_unverified"],
    });
  }
  input.counters.envelope_parses += 1;
  input.counters.authority_envelope_verification_attempts += 1;
  const envelope = parseAndVerifyEnvelope(rawEnvelope);
  if (!envelope) {
    input.counters.digest_operations += 1;
    return result({
      status: "conflicting",
      observation: requestSnapshot.observation,
      reasons: ["non_forgeable_external_authority_unverified"],
    });
  }
  if (!input.predecessorHarness.issue) {
    input.counters.digest_operations += 1;
    return result({
      status: "incomplete",
      observation: requestSnapshot.observation,
      envelope,
      reasons: ["non_forgeable_predecessor_unavailable"],
    });
  }
  input.counters.predecessor_executions += 1;
  const predecessor = input.predecessorHarness.issue(requestSnapshot.request);
  input.counters.predecessor_rebuilds += 1;
  const verification = verifyCanonicalGovernedBindingSnapshotIssuanceResult({
    request: requestSnapshot.request,
    result: predecessor,
    harness: input.predecessorHarness,
  });
  const pinsMatch =
    predecessor.authority_identity ===
      CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_IDENTITY &&
    predecessor.authority_digest ===
      CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_DIGEST &&
    predecessor.authority_root_digest ===
      CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_ROOT_DIGEST &&
    predecessor.semantic_scope_digest ===
      CANONICAL_NON_FORGEABLE_PINNED_SEMANTIC_SCOPE_DIGEST;
  input.counters.digest_operations += 1;
  if (!verification.valid || !pinsMatch) {
    return result({
      status: "conflicting",
      observation: requestSnapshot.observation,
      envelope,
      predecessor,
      predecessorVerified: verification.valid,
      reasons: ["non_forgeable_predecessor_authority_mismatch"],
    });
  }
  return result({
    status: predecessor.status,
    observation: requestSnapshot.observation,
    envelope,
    predecessor,
    predecessorVerified: true,
    reasons: predecessor.reason_codes,
  });
}

function snapshotDependencies(
  value: unknown,
): {
  readEnvelope: () => string;
  predecessorHarness: PredecessorHarness;
} | null {
  try {
    if (
      !isRecord(value) ||
      !exactKeys(value, ["authority_dependency", "predecessor_dependencies"])
    ) {
      return null;
    }
    const authorityInput = ownDataValue(value, "authority_dependency");
    const predecessorInput = ownDataValue(value, "predecessor_dependencies");
    if (
      !authorityInput.present ||
      !predecessorInput.present ||
      !isRecord(authorityInput.value) ||
      !exactKeys(authorityInput.value, [
        "owner_boundary_identity",
        "owner_boundary_version",
        "read_signed_authority_envelope_json",
      ])
    ) {
      return null;
    }
    const boundaryVersion = ownDataValue(
      authorityInput.value,
      "owner_boundary_version",
    );
    const boundaryIdentity = ownDataValue(
      authorityInput.value,
      "owner_boundary_identity",
    );
    const reader = ownDataValue(
      authorityInput.value,
      "read_signed_authority_envelope_json",
    );
    if (
      !boundaryVersion.present ||
      boundaryVersion.value !==
        CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION ||
      !boundaryIdentity.present ||
      boundaryIdentity.value !==
        CANONICAL_NON_FORGEABLE_EXTERNAL_OWNER_BOUNDARY_VERSION ||
      !reader.present ||
      typeof reader.value !== "function"
    ) {
      return null;
    }
    if (
      !isRecord(predecessorInput.value) ||
      !exactKeys(predecessorInput.value, [
        "ax_owner_dependency",
        "capture_authority",
        "issuer_authority_dependency",
      ])
    ) {
      return null;
    }
    const predecessorDependencies = predecessorInput.value;
    const issuer = ownDataValue(
      predecessorDependencies as unknown as object,
      "issuer_authority_dependency",
    );
    if (!issuer.present || !isRecord(issuer.value)) return null;
    const issuerIdentity = ownDataValue(
      issuer.value,
      "expected_authority_identity",
    );
    const issuerDigest = ownDataValue(
      issuer.value,
      "expected_authority_digest",
    );
    const ownerBoundary = ownDataValue(
      issuer.value,
      "owner_boundary_identity",
    );
    const minimumEpoch = ownDataValue(
      issuer.value,
      "minimum_publication_epoch",
    );
    const ownerBoundaryVersion = ownDataValue(
      issuer.value,
      "owner_boundary_version",
    );
    const issuerReader = ownDataValue(
      issuer.value,
      "read_expected_authority",
    );
    const axOwner = ownDataValue(
      predecessorDependencies,
      "ax_owner_dependency",
    );
    const captureAuthority = ownDataValue(
      predecessorDependencies,
      "capture_authority",
    );
    if (
      !issuerIdentity.present ||
      issuerIdentity.value !==
        CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_IDENTITY ||
      !issuerDigest.present ||
      issuerDigest.value !==
        CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_DIGEST ||
      !ownerBoundary.present ||
      ownerBoundary.value !==
        CANONICAL_NON_FORGEABLE_PINNED_PREDECESSOR_OWNER_BOUNDARY ||
      !minimumEpoch.present ||
      minimumEpoch.value !== 1 ||
      !ownerBoundaryVersion.present ||
      typeof ownerBoundaryVersion.value !== "string" ||
      !issuerReader.present ||
      typeof issuerReader.value !== "function" ||
      !axOwner.present ||
      !captureAuthority.present
    ) {
      return null;
    }
    const issuerReceiver = deepFreeze({
      owner_boundary_version: ownerBoundaryVersion.value,
      owner_boundary_identity: ownerBoundary.value,
      expected_authority_identity: issuerIdentity.value,
      expected_authority_digest: issuerDigest.value,
      minimum_publication_epoch: minimumEpoch.value,
    });
    const readPinnedAuthority = () => {
      const authority = intrinsicReflectApply(
        issuerReader.value as (...args: never[]) => unknown,
        issuerReceiver,
        [],
      );
      if (!isRecord(authority)) {
        throw new Error("non_forgeable_predecessor_authority_invalid");
      }
      const authorityIdentity = ownDataValue(
        authority,
        "authority_identity",
      );
      const authorityDigest = ownDataValue(authority, "authority_digest");
      const authorityRoot = ownDataValue(
        authority,
        "authority_root_digest",
      );
      const issuerAnchor = ownDataValue(
        authority,
        "issuer_authority_anchor",
      );
      const semanticScope = ownDataValue(
        authority,
        "semantic_scope_digest",
      );
      const requestIdentity = ownDataValue(
        authority,
        "expected_request_identity",
      );
      if (
        !authorityIdentity.present ||
        authorityIdentity.value !==
          CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_IDENTITY ||
        !authorityDigest.present ||
        authorityDigest.value !==
          CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_DIGEST ||
        !authorityRoot.present ||
        authorityRoot.value !==
          CANONICAL_NON_FORGEABLE_PINNED_AUTHORITY_ROOT_DIGEST ||
        !issuerAnchor.present ||
        issuerAnchor.value !==
          CANONICAL_NON_FORGEABLE_PINNED_ISSUER_ANCHOR_DIGEST ||
        !semanticScope.present ||
        semanticScope.value !==
          CANONICAL_NON_FORGEABLE_PINNED_SEMANTIC_SCOPE_DIGEST ||
        !requestIdentity.present ||
        requestIdentity.value !==
          CANONICAL_NON_FORGEABLE_PINNED_REQUEST_IDENTITY
      ) {
        throw new Error("non_forgeable_predecessor_authority_pin_mismatch");
      }
      return authority as CanonicalGovernedBindingSnapshotIssuerAuthority;
    };
    const pinnedPredecessorDependencies: CanonicalGovernedBindingSnapshotIssuanceDependencies = {
      issuer_authority_dependency: {
        owner_boundary_version:
          ownerBoundaryVersion.value as CanonicalGovernedBindingSnapshotIssuanceDependencies["issuer_authority_dependency"]["owner_boundary_version"],
        owner_boundary_identity: ownerBoundary.value as string,
        expected_authority_identity: issuerIdentity.value as string,
        expected_authority_digest: issuerDigest.value as string,
        minimum_publication_epoch: minimumEpoch.value as number,
        read_expected_authority: readPinnedAuthority,
      },
      ax_owner_dependency:
        axOwner.value as CanonicalGovernedBindingSnapshotIssuanceDependencies["ax_owner_dependency"],
      capture_authority:
        captureAuthority.value as CanonicalGovernedBindingSnapshotIssuanceDependencies["capture_authority"],
    };
    const predecessorHarness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: pinnedPredecessorDependencies,
      });
    if (!predecessorHarness.issue) return null;
    return {
      readEnvelope: reader.value as () => string,
      predecessorHarness,
    };
  } catch {
    return null;
  }
}

export function createCanonicalNonForgeableBindingSnapshotIssuanceHarness(
  input: {
    enabled?: boolean;
    kill_switch_engaged?: boolean;
    dependencies?: CanonicalNonForgeableBindingSnapshotIssuanceDependencies;
  } = {},
) {
  const counters = emptyCounters();
  const publish = <T extends object>(
    shell: T,
    authority: PrivateHarnessAuthority | null,
  ) => {
    const harness = intrinsicObjectFreeze({
      ...shell,
      get counters() {
        return deepFreeze(intrinsicStructuredClone(counters));
      },
    });
    weakMapSet(harnessAuthorities, harness, authority);
    return harness;
  };
  let options: Record<string, unknown> | null = null;
  try {
    options =
      isRecord(input) &&
      exactKeys(input, ["dependencies", "enabled", "kill_switch_engaged"])
        ? input
        : null;
  } catch {
    options = null;
  }
  const enabled = options ? ownDataValue(options, "enabled") : null;
  const killSwitch = options
    ? ownDataValue(options, "kill_switch_engaged")
    : null;
  if (
    !enabled?.present ||
    enabled.value !== true ||
    !killSwitch?.present ||
    killSwitch.value !== false
  ) {
    return publish(
      {
        enabled: false as const,
        status:
          enabled?.value === true
            ? ("kill_switch_engaged" as const)
            : ("disabled" as const),
        issue: null,
        ...safety,
      },
      null,
    );
  }
  const dependencies = ownDataValue(options!, "dependencies");
  const snapshot = dependencies.present
    ? snapshotDependencies(dependencies.value)
    : null;
  if (!snapshot) {
    return publish(
      {
        enabled: true as const,
        status: "unavailable" as const,
        issue: null,
        reason_codes: ["non_forgeable_dependencies_invalid"],
        ...safety,
      },
      null,
    );
  }
  counters.predecessor_harness_constructions += 1;
  const run = (
    request: unknown,
    runCounters: CanonicalNonForgeableBindingSnapshotIssuanceCounters,
  ) => {
    try {
      return execute({
        request,
        readEnvelope: snapshot.readEnvelope,
        predecessorHarness: snapshot.predecessorHarness,
        counters: runCounters,
      });
    } catch {
      const bounded = validateCanonicalBoundedSnapshotPayload(null);
      const observation = boundedObservation(bounded, {
        status: "schema_invalid",
        reason_codes: ["non_forgeable_internal_execution_failed"],
        request_digest: hardenedDigest({
          failure_version: "canonical_non_forgeable_execution_failure_v3",
        }),
      });
      return result({
        status: "incomplete",
        observation,
        reasons: ["non_forgeable_internal_execution_failed"],
      });
    }
  };
  const issue = (request: unknown) => run(request, counters);
  const rebuild = (request: unknown) => run(request, emptyCounters());
  return publish(
    {
      enabled: true as const,
      status: "ready" as const,
      issue,
      ...safety,
    },
    { rebuild },
  );
}

export function verifyCanonicalNonForgeableBindingSnapshotIssuanceResult(
  input: {
    request: unknown;
    result: CanonicalNonForgeableBindingSnapshotIssuanceResult;
    harness: object;
  },
) {
  try {
    if (!isRecord(input) || !exactKeys(input, ["harness", "request", "result"])) {
      throw new Error("non_forgeable_verifier_input_invalid");
    }
    const harness = ownDataValue(input, "harness");
    const request = ownDataValue(input, "request");
    const provided = ownDataValue(input, "result");
    if (
      !harness.present ||
      !request.present ||
      !provided.present ||
      harness.value === null ||
      typeof harness.value !== "object"
    ) {
      throw new Error("non_forgeable_verifier_input_invalid");
    }
    const authority = weakMapGet(harnessAuthorities, harness.value);
    if (!authority) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: [
          authority === null
            ? "non_forgeable_rebuild_unavailable"
            : "non_forgeable_harness_unrecognized",
        ],
      });
    }
    if (
      validateCanonicalBoundedSnapshotPayload(provided.value).status !==
      "valid"
    ) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["non_forgeable_result_not_bounded"],
      });
    }
    const canonical = authority.rebuild(request.value);
    if (canonical.request_observation.status !== "valid") {
      return deepFreeze({
        valid: false,
        canonical_result: canonical,
        reason_codes: ["non_forgeable_invalid_request_not_authoritative"],
      });
    }
    const valid = intrinsicIsDeepStrictEqual(canonical, provided.value);
    return deepFreeze({
      valid,
      canonical_result: canonical,
      reason_codes: valid ? [] : ["non_forgeable_result_rebuild_mismatch"],
    });
  } catch {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["non_forgeable_verifier_input_invalid"],
    });
  }
}

export function canonicalNonForgeableBindingSnapshotIssuanceDigest(
  value: unknown,
) {
  if (validateCanonicalBoundedSnapshotPayload(value).status !== "valid") {
    throw new Error("non_forgeable_digest_input_not_bounded");
  }
  return hardenedDigest(value);
}
