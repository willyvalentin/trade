import "server-only";

import { createHash as intrinsicCreateHash } from "node:crypto";
import {
  isDeepStrictEqual as intrinsicIsDeepStrictEqual,
  types as nodeTypes,
} from "node:util";

import type { CanonicalNonForgeableBindingSnapshotIssuanceDependencies } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance";
import {
  CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION,
  CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION,
  createCanonicalProvenanceBoundObservationVerificationHarness,
  verifyCanonicalProvenanceBoundObservationResult,
  type CanonicalProvenanceBoundObservationCapsule,
  type CanonicalProvenanceBoundObservationResult,
} from "@/lib/server/canonical-provenance-bound-observation-verification";

const intrinsicArrayIsArray = Array.isArray;
const intrinsicArrayPrototype = Array.prototype;
const intrinsicArrayPop = Array.prototype.pop;
const intrinsicArrayPush = Array.prototype.push;
const intrinsicArraySort = Array.prototype.sort;
const IntrinsicArray = Array;
const intrinsicJsonParse = JSON.parse;
const intrinsicJsonStringify = JSON.stringify;
const intrinsicNodeIsProxy = nodeTypes.isProxy;
const intrinsicNodeIsUint8Array = nodeTypes.isUint8Array;
const intrinsicObjectFreeze = Object.freeze;
const intrinsicObjectCreate = Object.create;
const intrinsicObjectDefineProperty = Object.defineProperty;
const intrinsicObjectGetOwnPropertyDescriptor =
  Object.getOwnPropertyDescriptor;
const intrinsicObjectGetPrototypeOf = Object.getPrototypeOf;
const intrinsicObjectIsFrozen = Object.isFrozen;
const intrinsicObjectPrototype = Object.prototype;
const intrinsicObjectSetPrototypeOf = Object.setPrototypeOf;
const intrinsicHashPrototype = intrinsicObjectGetPrototypeOf(
  intrinsicCreateHash("sha256"),
);
const intrinsicHashUpdate = intrinsicHashPrototype.update as (
  value: string,
  encoding?: BufferEncoding,
) => unknown;
const intrinsicHashDigest = intrinsicHashPrototype.digest as (
  encoding: "hex",
) => string;
const intrinsicReflectApply = Reflect.apply;
const intrinsicReflectOwnKeys = Reflect.ownKeys;
const intrinsicString = String;
const IntrinsicTextDecoder = TextDecoder;
const IntrinsicTextEncoder = TextEncoder;
const intrinsicTextDecoderDecode = TextDecoder.prototype.decode;
const intrinsicTextEncoderEncode = TextEncoder.prototype.encode;
const intrinsicTypedArrayPrototype = intrinsicObjectGetPrototypeOf(
  Uint8Array.prototype,
);
const intrinsicTypedArrayByteLength =
  intrinsicObjectGetOwnPropertyDescriptor(
    intrinsicTypedArrayPrototype,
    "byteLength",
  )?.get as (this: Uint8Array) => number;
const intrinsicTypedArrayValues = Uint8Array.prototype.values;
const intrinsicTypedArrayIteratorNext = Object.getPrototypeOf(
  new Uint8Array().values(),
).next as (this: IterableIterator<number>) => IteratorResult<number>;
const IntrinsicUint8Array = Uint8Array;
const IntrinsicWeakMap = WeakMap;
const intrinsicWeakMapGet = WeakMap.prototype.get;
const intrinsicWeakMapSet = WeakMap.prototype.set;
const textDecoder = new IntrinsicTextDecoder("utf-8", { fatal: true });
const textEncoder = new IntrinsicTextEncoder();

function arrayPop<T>(values: T[]) {
  return intrinsicReflectApply(intrinsicArrayPop, values, []) as T | undefined;
}

function arrayPush<T>(values: T[], value: T) {
  return intrinsicReflectApply(intrinsicArrayPush, values, [value]) as number;
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

function safeArray<T>() {
  const values = new IntrinsicArray<T>();
  intrinsicObjectSetPrototypeOf(values, null);
  return values;
}

function copyArrayValues<T>(values: readonly T[]) {
  const copied = safeArray<T>();
  for (let index = 0; index < values.length; index += 1) {
    arrayPush(copied, values[index]);
  }
  return copied;
}

function compareCanonicalStrings(first: string, second: string) {
  if (first === second) return 0;
  return first < second ? -1 : 1;
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

function isProxy(value: object) {
  return intrinsicReflectApply(intrinsicNodeIsProxy, nodeTypes, [
    value,
  ]) as boolean;
}

function exactDataKeys(value: object, expected: readonly string[]) {
  try {
    if (isProxy(value)) return false;
    const prototype = intrinsicObjectGetPrototypeOf(value);
    if (prototype !== intrinsicObjectPrototype && prototype !== null) {
      return false;
    }
    const actual = intrinsicReflectOwnKeys(value);
    if (actual.length !== expected.length) return false;
    const sortedActual = arraySort(
      copyArrayValues(actual),
      (first, second) =>
        compareCanonicalStrings(intrinsicString(first), intrinsicString(second)),
    );
    const sortedExpected = arraySort(
      copyArrayValues(expected),
      compareCanonicalStrings,
    );
    for (let index = 0; index < sortedExpected.length; index += 1) {
      if (
        typeof sortedActual[index] !== "string" ||
        sortedActual[index] !== sortedExpected[index]
      ) {
        return false;
      }
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
        value,
        sortedExpected[index],
      );
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function exactEmptyArray(value: unknown) {
  try {
    if (!intrinsicArrayIsArray(value) || isProxy(value)) return false;
    if (intrinsicObjectGetPrototypeOf(value) !== intrinsicArrayPrototype) {
      return false;
    }
    const keys = intrinsicReflectOwnKeys(value);
    if (keys.length !== 1 || keys[0] !== "length") return false;
    const descriptor = intrinsicObjectGetOwnPropertyDescriptor(value, "length");
    return descriptor?.value === 0;
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
    if (isProxy(value) || intrinsicArrayIsArray(value)) return false;
    const prototype = intrinsicObjectGetPrototypeOf(value);
    return prototype === intrinsicObjectPrototype || prototype === null;
  } catch {
    return false;
  }
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  const pending = safeArray<object>();
  arrayPush(pending, value);
  const visited = new IntrinsicWeakMap<object, true>();
  while (pending.length > 0) {
    const current = arrayPop(pending)!;
    if (weakMapGet(visited, current)) continue;
    weakMapSet(visited, current, true);
    const keys = intrinsicReflectOwnKeys(current);
    for (let index = 0; index < keys.length; index += 1) {
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
        current,
        keys[index],
      );
      if (
        descriptor &&
        "value" in descriptor &&
        descriptor.value !== null &&
        typeof descriptor.value === "object"
      ) {
        arrayPush(pending, descriptor.value);
      }
    }
    intrinsicObjectFreeze(current);
  }
  return value;
}

function isSha256(value: unknown): value is string {
  if (typeof value !== "string" || value.length !== 64) return false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (
      !(
        (character >= "0" && character <= "9") ||
        (character >= "a" && character <= "f")
      )
    ) {
      return false;
    }
  }
  return true;
}

function isPrimitiveType(
  value: unknown,
): value is CanonicalProvenanceBoundObservationCapsule["primitive_type"] {
  return (
    value === "bigint" ||
    value === "number" ||
    value === "string" ||
    value === "boolean" ||
    value === "null" ||
    value === "undefined"
  );
}

export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION =
  "canonical_private_atomic_observation_authority_v2" as const;
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION =
  "canonical_private_atomic_observation_evidence_v2" as const;
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION =
  "canonical_private_atomic_observation_result_v2" as const;
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION =
  "canonical_private_atomic_observation_readback_v2" as const;
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES = 65_536;
export const DEFAULT_OFF_PRIVATE_ATOMIC_OBSERVATION_ENABLED = false;
export const DEFAULT_OFF_PRIVATE_ATOMIC_OBSERVATION_KILL_SWITCH = true;
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_STATUSES =
  intrinsicObjectFreeze(["verified", "rejected"] as const);
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_STATUSES =
  intrinsicObjectFreeze(["integrity_verified", "rejected"] as const);
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_ARTIFACT_ROLES =
  intrinsicObjectFreeze({
    "lib/server/canonical-private-atomic-observation-authority.ts":
      "implementation",
    "lib/server/canonical-private-atomic-observation-authority-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666cv-current-main-private-atomic-observation-authority.spec.ts":
      "focused_tests",
    "docs/action-666cv-current-main-private-atomic-observation-authority.md":
      "contract_documentation",
    "docs/action-666cv-golden-private-atomic-observation-report.json":
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

type PrivateCapsule = {
  capsule_version: "canonical_private_atomic_observation_capsule_v2";
  capsule_identity: string;
  source_result_version:
    typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION;
  source_result_digest: string;
  source_capsule_version:
    typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION;
  source_capsule_identity: string;
  source_capsule_digest: string;
  primitive_type: CanonicalProvenanceBoundObservationCapsule["primitive_type"];
  primitive_value_digest: string;
  primitive_observation_digest: string;
  bounded_classification_digest: string;
  capsule_digest_algorithm: "sha256_canonical_json_v1";
  capsule_digest: string;
};

type PrivateCapsuleRecord = {
  session: object;
  capsule_identity: string;
  capsule_digest: string;
  source_result_digest: string;
};

type PrivateHarnessAuthority = {
  session: object;
  rebuild: (request: unknown) => CanonicalPrivateAtomicObservationResult;
};

type PrivateResultRecord = { session: object };

const capsuleRecords = new IntrinsicWeakMap<object, PrivateCapsuleRecord>();
const harnessAuthorities =
  new IntrinsicWeakMap<object, PrivateHarnessAuthority | null>();
const resultRecords = new IntrinsicWeakMap<object, PrivateResultRecord>();

export type CanonicalPrivateAtomicObservationCounters = {
  request_reads: number;
  predecessor_executions: number;
  predecessor_rebuilds: number;
  private_capsules_minted: number;
  private_provenance_checks: number;
  private_capsule_property_reads: number;
  private_capsule_digest_rebuilds: number;
  readback_reads: number;
  readback_parse_operations: number;
  digest_operations: number;
};

export type CanonicalPrivateAtomicObservationEvidence = {
  evidence_version: typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION;
  authority_version:
    typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION;
  status: "verified";
  provenance_verified: true;
  capsule_exposed: false;
  atomic_capsule_identity: string;
  atomic_capsule_digest: string;
  source_result_version:
    typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION;
  source_result_digest: string;
  source_capsule_version:
    typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION;
  source_capsule_identity: string;
  source_capsule_digest: string;
  primitive_type: CanonicalProvenanceBoundObservationCapsule["primitive_type"];
  primitive_value_digest: string;
  primitive_observation_digest: string;
  bounded_classification_digest: string;
  content_identity_claimed: true;
  reason_codes: [];
  evidence_digest_algorithm: "sha256_canonical_json_v1";
  evidence_digest: string;
} & typeof safety;

export type CanonicalPrivateAtomicObservationResult = {
  result_version: typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION;
  status: "verified" | "rejected";
  source_result_verified: boolean;
  evidence: CanonicalPrivateAtomicObservationEvidence | null;
  canonical_evidence_string: string | null;
  capsule_exposed: false;
  content_identity_claimed: boolean;
  reason_codes: string[];
  result_digest_algorithm: "sha256_canonical_json_v1";
  result_digest: string;
} & typeof safety;

export type CanonicalPrivateAtomicObservationReadback = {
  readback_version: typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION;
  status: "integrity_verified" | "rejected";
  evidence: CanonicalPrivateAtomicObservationEvidence | null;
  provenance_verified: false;
  verifier_authority_granted: false;
  observed_input_digest: string | null;
  content_identity_claimed: boolean;
  reason_codes: string[];
  readback_digest_algorithm: "sha256_canonical_json_v1";
  readback_digest: string;
} & typeof safety;

function emptyCounters(): CanonicalPrivateAtomicObservationCounters {
  return {
    request_reads: 0,
    predecessor_executions: 0,
    predecessor_rebuilds: 0,
    private_capsules_minted: 0,
    private_provenance_checks: 0,
    private_capsule_property_reads: 0,
    private_capsule_digest_rebuilds: 0,
    readback_reads: 0,
    readback_parse_operations: 0,
    digest_operations: 0,
  };
}

function countersSnapshot(counters: CanonicalPrivateAtomicObservationCounters) {
  return deepFreeze({ ...counters });
}

function serializationSnapshot(
  value: unknown,
  seen = new IntrinsicWeakMap<object, object>(),
): unknown {
  if (value === null || typeof value !== "object") return value;
  if (isProxy(value)) {
    throw new Error("private_atomic_digest_proxy_rejected");
  }
  if (weakMapGet(seen, value)) {
    throw new Error("private_atomic_digest_cycle_rejected");
  }
  if (intrinsicArrayIsArray(value)) {
    const lengthDescriptor = intrinsicObjectGetOwnPropertyDescriptor(
      value,
      "length",
    );
    if (
      !lengthDescriptor ||
      !("value" in lengthDescriptor) ||
      typeof lengthDescriptor.value !== "number"
    ) {
      throw new Error("private_atomic_digest_array_invalid");
    }
    const keys = intrinsicReflectOwnKeys(value);
    if (keys.length !== lengthDescriptor.value + 1) {
      throw new Error("private_atomic_digest_array_invalid");
    }
    const copied = safeArray<unknown>();
    weakMapSet(seen, value, copied);
    for (let index = 0; index < lengthDescriptor.value; index += 1) {
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
        value,
        intrinsicString(index),
      );
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
        throw new Error("private_atomic_digest_array_invalid");
      }
      arrayPush(copied, serializationSnapshot(descriptor.value, seen));
    }
    return copied;
  }
  const prototype = intrinsicObjectGetPrototypeOf(value);
  if (prototype !== intrinsicObjectPrototype && prototype !== null) {
    throw new Error("private_atomic_digest_object_invalid");
  }
  const copied = intrinsicObjectCreate(null) as Record<string, unknown>;
  weakMapSet(seen, value, copied);
  const keys = intrinsicReflectOwnKeys(value);
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    if (typeof key !== "string") {
      throw new Error("private_atomic_digest_symbol_rejected");
    }
    const descriptor = intrinsicObjectGetOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
      throw new Error("private_atomic_digest_accessor_rejected");
    }
    intrinsicObjectDefineProperty(copied, key, {
      configurable: true,
      enumerable: true,
      value: serializationSnapshot(descriptor.value, seen),
      writable: true,
    });
  }
  return copied;
}

function canonicalJsonString(value: unknown) {
  return intrinsicJsonStringify(serializationSnapshot(value));
}

function digest(
  value: unknown,
  counters?: CanonicalPrivateAtomicObservationCounters,
) {
  if (counters) counters.digest_operations += 1;
  const serialized = canonicalJsonString(value);
  if (serialized === undefined) {
    throw new Error("private_atomic_digest_input_not_serializable");
  }
  const hash = intrinsicCreateHash("sha256");
  intrinsicReflectApply(intrinsicHashUpdate, hash, [serialized, "utf8"]);
  return intrinsicReflectApply(intrinsicHashDigest, hash, ["hex"]) as string;
}

function mintPrivateCapsule(input: {
  source: CanonicalProvenanceBoundObservationResult;
  sourceCapsule: CanonicalProvenanceBoundObservationCapsule;
  session: object;
  counters: CanonicalPrivateAtomicObservationCounters;
}) {
  const identityProjection = {
    capsule_version: "canonical_private_atomic_observation_capsule_v2" as const,
    source_result_version: input.source.result_version,
    source_result_digest: input.source.result_digest,
    source_capsule_version: input.sourceCapsule.capsule_version,
    source_capsule_identity: input.sourceCapsule.capsule_identity,
    source_capsule_digest: input.sourceCapsule.capsule_digest,
    primitive_type: input.sourceCapsule.primitive_type,
    primitive_value_digest: input.sourceCapsule.primitive_value_digest,
    primitive_observation_digest:
      input.sourceCapsule.primitive_observation_digest,
    bounded_classification_digest:
      input.sourceCapsule.bounded_classification_digest,
  };
  const capsuleIdentity = digest(identityProjection, input.counters);
  const projection = {
    ...identityProjection,
    capsule_identity: capsuleIdentity,
    capsule_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const capsule = deepFreeze({
    ...projection,
    capsule_digest: digest(projection, input.counters),
  });
  input.counters.private_capsules_minted += 1;
  weakMapSet(capsuleRecords, capsule, {
    session: input.session,
    capsule_identity: capsule.capsule_identity,
    capsule_digest: capsule.capsule_digest,
    source_result_digest: capsule.source_result_digest,
  });
  return capsule;
}

function verifyPrivateCapsule(input: {
  capsule: PrivateCapsule;
  expectedSession: object;
  counters: CanonicalPrivateAtomicObservationCounters;
}) {
  input.counters.private_provenance_checks += 1;
  const record = weakMapGet(capsuleRecords, input.capsule);
  if (!record || record.session !== input.expectedSession) return null;
  try {
    input.counters.private_capsule_property_reads += 1;
    if (!intrinsicObjectIsFrozen(input.capsule)) return null;
    const projection = {
      capsule_version: input.capsule.capsule_version,
      source_result_version: input.capsule.source_result_version,
      source_result_digest: input.capsule.source_result_digest,
      source_capsule_version: input.capsule.source_capsule_version,
      source_capsule_identity: input.capsule.source_capsule_identity,
      source_capsule_digest: input.capsule.source_capsule_digest,
      primitive_type: input.capsule.primitive_type,
      primitive_value_digest: input.capsule.primitive_value_digest,
      primitive_observation_digest: input.capsule.primitive_observation_digest,
      bounded_classification_digest:
        input.capsule.bounded_classification_digest,
      capsule_identity: input.capsule.capsule_identity,
      capsule_digest_algorithm: input.capsule.capsule_digest_algorithm,
    };
    input.counters.private_capsule_digest_rebuilds += 1;
    const rebuiltDigest = digest(projection, input.counters);
    if (
      input.capsule.capsule_identity !== record.capsule_identity ||
      input.capsule.capsule_digest !== record.capsule_digest ||
      input.capsule.source_result_digest !== record.source_result_digest ||
      rebuiltDigest !== record.capsule_digest
    ) {
      return null;
    }
    return input.capsule;
  } catch {
    return null;
  }
}

function evidenceProjection(capsule: PrivateCapsule) {
  return {
    evidence_version: CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION,
    authority_version: CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION,
    status: "verified" as const,
    provenance_verified: true as const,
    capsule_exposed: false as const,
    atomic_capsule_identity: capsule.capsule_identity,
    atomic_capsule_digest: capsule.capsule_digest,
    source_result_version: capsule.source_result_version,
    source_result_digest: capsule.source_result_digest,
    source_capsule_version: capsule.source_capsule_version,
    source_capsule_identity: capsule.source_capsule_identity,
    source_capsule_digest: capsule.source_capsule_digest,
    primitive_type: capsule.primitive_type,
    primitive_value_digest: capsule.primitive_value_digest,
    primitive_observation_digest: capsule.primitive_observation_digest,
    bounded_classification_digest: capsule.bounded_classification_digest,
    content_identity_claimed: true as const,
    reason_codes: [] as [],
    evidence_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
}

function createEvidence(
  capsule: PrivateCapsule,
  counters?: CanonicalPrivateAtomicObservationCounters,
) {
  const projection = evidenceProjection(capsule);
  return deepFreeze({
    ...projection,
    evidence_digest: digest(projection, counters),
  });
}

const evidenceSerializationKeys = [
  "evidence_version",
  "authority_version",
  "status",
  "provenance_verified",
  "capsule_exposed",
  "atomic_capsule_identity",
  "atomic_capsule_digest",
  "source_result_version",
  "source_result_digest",
  "source_capsule_version",
  "source_capsule_identity",
  "source_capsule_digest",
  "primitive_type",
  "primitive_value_digest",
  "primitive_observation_digest",
  "bounded_classification_digest",
  "content_identity_claimed",
  "reason_codes",
  "evidence_digest_algorithm",
  "shadow_only",
  "live_ranking_effect",
  "live_impact",
  "persistence_performed",
  "automatic_training_allowed",
  "automatic_parameter_change_allowed",
  "automatic_threshold_change_allowed",
  "automatic_model_change_allowed",
  "automatic_promotion_allowed",
  "external_ai_canonical_truth_authority",
  "causal_improvement_claimed",
  "synthetic_evidence",
  "not_publishable",
  "evidence_digest",
] as const;
const evidenceKeys = arraySort(
  copyArrayValues(evidenceSerializationKeys),
  compareCanonicalStrings,
);
const evidenceDigestKeys = copyArrayValues([
  "atomic_capsule_identity",
  "atomic_capsule_digest",
  "source_result_digest",
  "source_capsule_identity",
  "source_capsule_digest",
  "primitive_value_digest",
  "primitive_observation_digest",
  "bounded_classification_digest",
  "evidence_digest",
] as const);

function serializeEvidence(evidence: CanonicalPrivateAtomicObservationEvidence) {
  return canonicalJsonString({
    evidence_version: evidence.evidence_version,
    authority_version: evidence.authority_version,
    status: evidence.status,
    provenance_verified: evidence.provenance_verified,
    capsule_exposed: evidence.capsule_exposed,
    atomic_capsule_identity: evidence.atomic_capsule_identity,
    atomic_capsule_digest: evidence.atomic_capsule_digest,
    source_result_version: evidence.source_result_version,
    source_result_digest: evidence.source_result_digest,
    source_capsule_version: evidence.source_capsule_version,
    source_capsule_identity: evidence.source_capsule_identity,
    source_capsule_digest: evidence.source_capsule_digest,
    primitive_type: evidence.primitive_type,
    primitive_value_digest: evidence.primitive_value_digest,
    primitive_observation_digest: evidence.primitive_observation_digest,
    bounded_classification_digest: evidence.bounded_classification_digest,
    content_identity_claimed: evidence.content_identity_claimed,
    reason_codes: evidence.reason_codes,
    evidence_digest_algorithm: evidence.evidence_digest_algorithm,
    shadow_only: evidence.shadow_only,
    live_ranking_effect: evidence.live_ranking_effect,
    live_impact: evidence.live_impact,
    persistence_performed: evidence.persistence_performed,
    automatic_training_allowed: evidence.automatic_training_allowed,
    automatic_parameter_change_allowed:
      evidence.automatic_parameter_change_allowed,
    automatic_threshold_change_allowed:
      evidence.automatic_threshold_change_allowed,
    automatic_model_change_allowed: evidence.automatic_model_change_allowed,
    automatic_promotion_allowed: evidence.automatic_promotion_allowed,
    external_ai_canonical_truth_authority:
      evidence.external_ai_canonical_truth_authority,
    causal_improvement_claimed: evidence.causal_improvement_claimed,
    synthetic_evidence: evidence.synthetic_evidence,
    not_publishable: evidence.not_publishable,
    evidence_digest: evidence.evidence_digest,
  });
}

function exactEvidence(
  value: unknown,
): value is CanonicalPrivateAtomicObservationEvidence {
  if (!isRecord(value) || !exactDataKeys(value, evidenceKeys)) return false;
  const record = value as Record<string, unknown>;
  if (
    record.evidence_version !==
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION ||
    record.authority_version !==
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION ||
    record.status !== "verified" ||
    record.provenance_verified !== true ||
    record.capsule_exposed !== false ||
    record.source_result_version !==
      CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION ||
    record.source_capsule_version !==
      CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION ||
    record.content_identity_claimed !== true ||
    record.evidence_digest_algorithm !== "sha256_canonical_json_v1" ||
    !exactEmptyArray(record.reason_codes)
  ) {
    return false;
  }
  for (let index = 0; index < evidenceDigestKeys.length; index += 1) {
    if (!isSha256(record[evidenceDigestKeys[index]])) return false;
  }
  if (!isPrimitiveType(record.primitive_type)) return false;
  if (
    record.shadow_only !== true ||
    record.live_ranking_effect !== false ||
    record.live_impact !== false ||
    record.persistence_performed !== false ||
    record.automatic_training_allowed !== false ||
    record.automatic_parameter_change_allowed !== false ||
    record.automatic_threshold_change_allowed !== false ||
    record.automatic_model_change_allowed !== false ||
    record.automatic_promotion_allowed !== false ||
    record.external_ai_canonical_truth_authority !== false ||
    record.causal_improvement_claimed !== false ||
    record.synthetic_evidence !== true ||
    record.not_publishable !== true
  ) {
    return false;
  }
  const projection = { ...record };
  delete projection.evidence_digest;
  return digest(projection) === record.evidence_digest;
}

function rejectedResult(
  reason: string,
  sourceVerified: boolean,
  counters?: CanonicalPrivateAtomicObservationCounters,
) {
  const projection = {
    result_version: CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION,
    status: "rejected" as const,
    source_result_verified: sourceVerified,
    evidence: null,
    canonical_evidence_string: null,
    capsule_exposed: false as const,
    content_identity_claimed: false,
    reason_codes: [reason],
    result_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...projection,
    result_digest: digest(projection, counters),
  });
}

function execute(input: {
  request: unknown;
  predecessorHarness: ReturnType<
    typeof createCanonicalProvenanceBoundObservationVerificationHarness
  >;
  session: object;
  counters: CanonicalPrivateAtomicObservationCounters;
}) {
  input.counters.request_reads += 1;
  input.counters.predecessor_executions += 1;
  const source = input.predecessorHarness.evaluate!(input.request);
  input.counters.predecessor_rebuilds += 1;
  const verification = verifyCanonicalProvenanceBoundObservationResult({
    request: input.request,
    result: source,
    harness: input.predecessorHarness,
  });
  if (!verification.valid || source.status !== "verified" || !source.capsule) {
    return rejectedResult(
      "private_atomic_authoritative_source_required",
      verification.valid,
      input.counters,
    );
  }
  const capsule = mintPrivateCapsule({
    source,
    sourceCapsule: source.capsule,
    session: input.session,
    counters: input.counters,
  });
  const verified = verifyPrivateCapsule({
    capsule,
    expectedSession: input.session,
    counters: input.counters,
  });
  if (!verified) {
    return rejectedResult(
      "private_atomic_provenance_failed",
      true,
      input.counters,
    );
  }
  const evidence = createEvidence(verified, input.counters);
  const canonicalEvidenceString = serializeEvidence(evidence);
  const projection = {
    result_version: CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION,
    status: "verified" as const,
    source_result_verified: true,
    evidence,
    canonical_evidence_string: canonicalEvidenceString,
    capsule_exposed: false as const,
    content_identity_claimed: true,
    reason_codes: [] as string[],
    result_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...projection,
    result_digest: digest(projection, input.counters),
  });
}

function canonicalInputString(input: unknown) {
  if (typeof input === "string") {
    if (input.length > CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES) {
      return { value: null, reason: "readback_too_large" as const };
    }
    const bytes = intrinsicReflectApply(intrinsicTextEncoderEncode, textEncoder, [
      input,
    ]) as Uint8Array;
    const byteLength = intrinsicReflectApply(
      intrinsicTypedArrayByteLength,
      bytes,
      [],
    ) as number;
    if (byteLength > CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES) {
      return { value: null, reason: "readback_too_large" as const };
    }
    return { value: input, reason: null };
  }
  if (
    input === null ||
    (typeof input !== "object" && typeof input !== "function")
  ) {
    return { value: null, reason: "arbitrary_object_readback_rejected" as const };
  }
  if (
    !intrinsicReflectApply(intrinsicNodeIsUint8Array, nodeTypes, [input])
  ) {
    return { value: null, reason: "arbitrary_object_readback_rejected" as const };
  }
  let iterator: IterableIterator<number>;
  try {
    iterator = intrinsicReflectApply(intrinsicTypedArrayValues, input, []);
  } catch {
    return { value: null, reason: "arbitrary_object_readback_rejected" as const };
  }
  const bytes = safeArray<number>();
  try {
    while (true) {
      const step = intrinsicReflectApply(
        intrinsicTypedArrayIteratorNext,
        iterator,
        [],
      ) as IteratorResult<number>;
      if (step.done) break;
      if (bytes.length >= CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES) {
        return { value: null, reason: "readback_too_large" as const };
      }
      arrayPush(bytes, step.value);
    }
    const typed = new IntrinsicUint8Array(bytes.length);
    for (let index = 0; index < bytes.length; index += 1) {
      typed[index] = bytes[index];
    }
    return {
      value: intrinsicReflectApply(intrinsicTextDecoderDecode, textDecoder, [
        typed,
      ]) as string,
      reason: null,
    };
  } catch {
    return { value: null, reason: "readback_bytes_invalid" as const };
  }
}

function readbackInternal(
  input: unknown,
  counters: CanonicalPrivateAtomicObservationCounters,
): CanonicalPrivateAtomicObservationReadback {
  counters.readback_reads += 1;
  const canonical = canonicalInputString(input);
  let evidence: CanonicalPrivateAtomicObservationEvidence | null = null;
  let observedInputDigest: string | null = null;
  let reason: string | null = canonical.reason;
  if (canonical.value !== null) {
    observedInputDigest = digest(
      {
        readback_version: CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION,
        canonical_string: canonical.value,
      },
      counters,
    );
    try {
      counters.readback_parse_operations += 1;
      const parsed = intrinsicJsonParse(canonical.value) as unknown;
      if (!exactEvidence(parsed) || serializeEvidence(parsed) !== canonical.value) {
        reason = "canonical_evidence_invalid";
      } else {
        evidence = deepFreeze(parsed);
      }
    } catch {
      reason = "canonical_evidence_parse_failed";
    }
  }
  const valid = evidence !== null && reason === null;
  const projection = {
    readback_version: CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION,
    status: valid ? ("integrity_verified" as const) : ("rejected" as const),
    evidence: valid ? evidence : null,
    provenance_verified: false as const,
    verifier_authority_granted: false as const,
    observed_input_digest: observedInputDigest,
    content_identity_claimed: valid,
    reason_codes: valid ? ([] as string[]) : [reason!],
    readback_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...projection,
    readback_digest: digest(projection, counters),
  });
}

export function verifyCanonicalPrivateAtomicObservationReadback(input: unknown) {
  return readbackInternal(input, emptyCounters());
}

export function createCanonicalPrivateAtomicObservationAuthorityHarness(
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
    const harness = deepFreeze({
      ...shell,
      get counters() {
        return countersSnapshot(counters);
      },
    });
    weakMapSet(harnessAuthorities, harness, authority);
    return harness;
  };
  const options =
    isRecord(input) &&
    exactDataKeys(input, ["dependencies", "enabled", "kill_switch_engaged"])
      ? input
      : null;
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
        observe: null,
        readback: null,
        ...safety,
      },
      null,
    );
  }
  const dependencies = ownDataValue(options!, "dependencies");
  if (!dependencies.present) {
    return publish(
      {
        enabled: true as const,
        status: "unavailable" as const,
        observe: null,
        readback: null,
        reason_codes: ["private_atomic_dependencies_invalid"],
        ...safety,
      },
      null,
    );
  }
  const predecessorHarness =
    createCanonicalProvenanceBoundObservationVerificationHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies:
        dependencies.value as CanonicalNonForgeableBindingSnapshotIssuanceDependencies,
    });
  if (!predecessorHarness.evaluate) {
    return publish(
      {
        enabled: true as const,
        status: "unavailable" as const,
        observe: null,
        readback: null,
        reason_codes: ["private_atomic_dependencies_invalid"],
        ...safety,
      },
      null,
    );
  }
  const session = intrinsicObjectFreeze({});
  const run = (
    request: unknown,
    runCounters: CanonicalPrivateAtomicObservationCounters,
  ) => {
    try {
      return execute({
        request,
        predecessorHarness,
        session,
        counters: runCounters,
      });
    } catch {
      return rejectedResult(
        "private_atomic_execution_failed",
        false,
        runCounters,
      );
    }
  };
  const observe = (request: unknown) =>
    registerResult(run(request, counters), session);
  const rebuild = (request: unknown) => run(request, emptyCounters());
  const readback = (value: unknown) =>
    readbackInternal(value, counters);
  return publish(
    {
      enabled: true as const,
      status: "ready" as const,
      observe,
      readback,
      ...safety,
    },
    { session, rebuild },
  );
}

const resultKeys = [
  "automatic_model_change_allowed",
  "automatic_parameter_change_allowed",
  "automatic_promotion_allowed",
  "automatic_threshold_change_allowed",
  "automatic_training_allowed",
  "canonical_evidence_string",
  "capsule_exposed",
  "causal_improvement_claimed",
  "content_identity_claimed",
  "evidence",
  "external_ai_canonical_truth_authority",
  "live_impact",
  "live_ranking_effect",
  "not_publishable",
  "persistence_performed",
  "reason_codes",
  "result_digest",
  "result_digest_algorithm",
  "result_version",
  "shadow_only",
  "source_result_verified",
  "status",
  "synthetic_evidence",
] as const;

export function verifyCanonicalPrivateAtomicObservationResult(input: {
  request: unknown;
  result: CanonicalPrivateAtomicObservationResult;
  harness: object;
}) {
  try {
    if (
      !isRecord(input) ||
      !exactDataKeys(input, ["harness", "request", "result"])
    ) {
      throw new Error("private_atomic_verifier_input_invalid");
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
      throw new Error("private_atomic_verifier_input_invalid");
    }
    const authority = weakMapGet(harnessAuthorities, harness.value);
    if (!authority) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: [
          authority === null
            ? "private_atomic_rebuild_unavailable"
            : "private_atomic_harness_unrecognized",
        ],
      });
    }
    if (
      provided.value === null ||
      (typeof provided.value !== "object" &&
        typeof provided.value !== "function")
    ) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["private_atomic_untrusted_result_container"],
      });
    }
    const record = weakMapGet(resultRecords, provided.value as object);
    if (!record) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["private_atomic_untrusted_result_container"],
      });
    }
    if (record.session !== authority.session) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["private_atomic_originating_harness_mismatch"],
      });
    }
    if (
      !isRecord(provided.value) ||
      !exactDataKeys(provided.value, resultKeys) ||
      provided.value.status !== "verified" ||
      !exactEvidence(provided.value.evidence) ||
      provided.value.canonical_evidence_string !==
        serializeEvidence(provided.value.evidence) ||
      provided.value.capsule_exposed !== false
    ) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["private_atomic_result_not_authoritative"],
      });
    }
    const canonical = authority.rebuild(request.value);
    const valid =
      canonical.status === "verified" &&
      intrinsicIsDeepStrictEqual(canonical, provided.value);
    return deepFreeze({
      valid,
      canonical_result: canonical,
      reason_codes: valid ? [] : ["private_atomic_result_rebuild_mismatch"],
    });
  } catch {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["private_atomic_verifier_input_invalid"],
    });
  }
}

function registerResult(
  result: CanonicalPrivateAtomicObservationResult,
  session: object,
) {
  weakMapSet(resultRecords, result, { session });
  return result;
}
