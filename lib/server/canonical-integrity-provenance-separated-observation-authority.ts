import "server-only";

import { createHash as intrinsicCreateHash } from "node:crypto";
import {
  isDeepStrictEqual as intrinsicIsDeepStrictEqual,
  types as nodeTypes,
} from "node:util";

import type { CanonicalNonForgeableBindingSnapshotIssuanceDependencies } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance";
import {
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION,
  createCanonicalPrivateAtomicObservationAuthorityHarness,
  verifyCanonicalPrivateAtomicObservationResult,
  type CanonicalPrivateAtomicObservationEvidence,
  type CanonicalPrivateAtomicObservationResult,
} from "@/lib/server/canonical-private-atomic-observation-authority";

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
const intrinsicObjectGetOwnPropertyDescriptor =
  Object.getOwnPropertyDescriptor;
const intrinsicObjectGetPrototypeOf = Object.getPrototypeOf;
const intrinsicObjectPrototype = Object.prototype;
const intrinsicObjectSetPrototypeOf = Object.setPrototypeOf;
const intrinsicHashPrototype = intrinsicObjectGetPrototypeOf(
  intrinsicCreateHash("sha256"),
);
const intrinsicHashUpdate = intrinsicHashPrototype.update as (
  value: string | Uint8Array,
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
const intrinsicUint8ArrayPrototype = Uint8Array.prototype;
const intrinsicTypedArrayIteratorNext = intrinsicObjectGetPrototypeOf(
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
): value is CanonicalPrivateAtomicObservationEvidence["primitive_type"] {
  return (
    value === "bigint" ||
    value === "number" ||
    value === "string" ||
    value === "boolean" ||
    value === "null" ||
    value === "undefined"
  );
}

export const CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_AUTHORITY_VERSION =
  "canonical_integrity_provenance_separated_observation_authority_v2" as const;
export const CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RUNTIME_EVIDENCE_VERSION =
  "canonical_integrity_provenance_separated_observation_runtime_evidence_v2" as const;
export const CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_ENVELOPE_VERSION =
  "canonical_integrity_provenance_separated_observation_envelope_v2" as const;
export const CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RESULT_VERSION =
  "canonical_integrity_provenance_separated_observation_result_v2" as const;
export const CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_READBACK_VERSION =
  "canonical_integrity_provenance_separated_observation_readback_v2" as const;
export const CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_MAX_READBACK_BYTES =
  65_536;
export const DEFAULT_OFF_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_ENABLED =
  false;
export const DEFAULT_OFF_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_KILL_SWITCH =
  true;
export const CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_STATUSES =
  intrinsicObjectFreeze(["verified", "rejected"] as const);
export const CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_READBACK_TERMINALS =
  intrinsicObjectFreeze([
    "integrity_only",
    "malformed",
    "non_canonical",
    "digest_mismatch",
    "input_rejected",
  ] as const);
export const CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_ARTIFACT_ROLES =
  intrinsicObjectFreeze({
    "lib/server/canonical-integrity-provenance-separated-observation-authority.ts":
      "implementation",
    "lib/server/canonical-integrity-provenance-separated-observation-authority-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666cw-current-main-integrity-provenance-separated-observation-authority.spec.ts":
      "focused_tests",
    "docs/action-666cw-current-main-integrity-provenance-separated-observation-authority.md":
      "contract_documentation",
    "docs/action-666cw-golden-integrity-provenance-separated-observation-report.json":
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

export type CanonicalIntegrityProvenanceSeparatedObservationCounters = {
  request_reads: number;
  predecessor_observations: number;
  predecessor_verifications: number;
  runtime_provenance_checks: number;
  integrity_envelopes_built: number;
  readback_reads: number;
  readback_parse_operations: number;
  digest_operations: number;
};

export type CanonicalIntegrityProvenanceSeparatedObservationRuntimeEvidence = {
  runtime_evidence_version: typeof CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RUNTIME_EVIDENCE_VERSION;
  authority_version: typeof CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_AUTHORITY_VERSION;
  status: "verified";
  integrity_verified: true;
  provenance_verified: true;
  provenance_scope: "current_process_only";
  trusted: true;
  admitted: false;
  capsule_exposed: false;
  source_authority_version: typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION;
  source_result_version: typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION;
  source_result_digest: string;
  source_evidence_version: typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION;
  source_evidence_digest: string;
  primitive_type: CanonicalPrivateAtomicObservationEvidence["primitive_type"];
  primitive_value_digest: string;
  primitive_observation_digest: string;
  content_identity_claimed: true;
  reason_codes: [];
  runtime_evidence_digest_algorithm: "sha256_canonical_json_v1";
  runtime_evidence_digest: string;
} & typeof safety;

export type CanonicalIntegrityProvenanceSeparatedObservationEnvelope = {
  envelope_version: typeof CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_ENVELOPE_VERSION;
  authority_version: typeof CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_AUTHORITY_VERSION;
  integrity_verified: true;
  provenance_verified: false;
  authority_status: "integrity_only";
  trusted: false;
  admitted: false;
  capsule_exposed: false;
  source_result_version: typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION;
  source_result_digest: string;
  source_evidence_version: typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION;
  source_evidence_digest: string;
  primitive_type: CanonicalPrivateAtomicObservationEvidence["primitive_type"];
  primitive_value_digest: string;
  primitive_observation_digest: string;
  content_identity_claimed: true;
  envelope_digest_algorithm: "sha256_canonical_json_v1";
  envelope_digest: string;
} & typeof safety;

export type CanonicalIntegrityProvenanceSeparatedObservationResult = {
  result_version: typeof CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RESULT_VERSION;
  status: "verified" | "rejected";
  source_result_verified: boolean;
  runtime_evidence: CanonicalIntegrityProvenanceSeparatedObservationRuntimeEvidence | null;
  integrity_envelope: CanonicalIntegrityProvenanceSeparatedObservationEnvelope | null;
  canonical_integrity_envelope_string: string | null;
  runtime_authority_status: "provenance_verified" | "none";
  serialized_authority_status: "integrity_only" | "none";
  capsule_exposed: false;
  content_identity_claimed: boolean;
  reason_codes: string[];
  result_digest_algorithm: "sha256_canonical_json_v1";
  result_digest: string;
} & typeof safety;

export type CanonicalIntegrityProvenanceSeparatedObservationReadback = {
  readback_version: typeof CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_READBACK_VERSION;
  terminal_status:
    | "integrity_only"
    | "malformed"
    | "non_canonical"
    | "digest_mismatch"
    | "input_rejected";
  envelope: CanonicalIntegrityProvenanceSeparatedObservationEnvelope | null;
  integrity_verified: boolean;
  provenance_verified: false;
  authority_status: "integrity_only" | "none";
  trusted: false;
  admitted: false;
  observed_input_digest: string | null;
  content_identity_claimed: boolean;
  reason_codes: string[];
  readback_digest_algorithm: "sha256_canonical_json_v1";
  readback_digest: string;
} & typeof safety;

type PrivateHarnessAuthority = {
  session: object;
  rebuild: (
    request: unknown,
  ) => CanonicalIntegrityProvenanceSeparatedObservationResult;
};

type PrivateResultRecord = { session: object };

const harnessAuthorities =
  new IntrinsicWeakMap<object, PrivateHarnessAuthority | null>();
const resultRecords = new IntrinsicWeakMap<object, PrivateResultRecord>();

function emptyCounters(): CanonicalIntegrityProvenanceSeparatedObservationCounters {
  return {
    request_reads: 0,
    predecessor_observations: 0,
    predecessor_verifications: 0,
    runtime_provenance_checks: 0,
    integrity_envelopes_built: 0,
    readback_reads: 0,
    readback_parse_operations: 0,
    digest_operations: 0,
  };
}

function countersSnapshot(
  counters: CanonicalIntegrityProvenanceSeparatedObservationCounters,
) {
  return deepFreeze({ ...counters });
}

function sha256(value: string | Uint8Array) {
  const hash = intrinsicCreateHash("sha256");
  intrinsicReflectApply(intrinsicHashUpdate, hash, [value]);
  return intrinsicReflectApply(intrinsicHashDigest, hash, ["hex"]) as string;
}

function digest(
  value: unknown,
  counters?: CanonicalIntegrityProvenanceSeparatedObservationCounters,
) {
  if (counters) counters.digest_operations += 1;
  return sha256(intrinsicJsonStringify(value));
}

const runtimeEvidenceKeys = [
  "admitted",
  "authority_version",
  "automatic_model_change_allowed",
  "automatic_parameter_change_allowed",
  "automatic_promotion_allowed",
  "automatic_threshold_change_allowed",
  "automatic_training_allowed",
  "capsule_exposed",
  "causal_improvement_claimed",
  "content_identity_claimed",
  "external_ai_canonical_truth_authority",
  "integrity_verified",
  "live_impact",
  "live_ranking_effect",
  "not_publishable",
  "persistence_performed",
  "primitive_observation_digest",
  "primitive_type",
  "primitive_value_digest",
  "provenance_scope",
  "provenance_verified",
  "reason_codes",
  "runtime_evidence_digest",
  "runtime_evidence_digest_algorithm",
  "runtime_evidence_version",
  "shadow_only",
  "source_authority_version",
  "source_evidence_digest",
  "source_evidence_version",
  "source_result_digest",
  "source_result_version",
  "status",
  "synthetic_evidence",
  "trusted",
] as const;

const envelopeKeys = [
  "admitted",
  "authority_status",
  "authority_version",
  "automatic_model_change_allowed",
  "automatic_parameter_change_allowed",
  "automatic_promotion_allowed",
  "automatic_threshold_change_allowed",
  "automatic_training_allowed",
  "capsule_exposed",
  "causal_improvement_claimed",
  "content_identity_claimed",
  "envelope_digest",
  "envelope_digest_algorithm",
  "envelope_version",
  "external_ai_canonical_truth_authority",
  "integrity_verified",
  "live_impact",
  "live_ranking_effect",
  "not_publishable",
  "persistence_performed",
  "primitive_observation_digest",
  "primitive_type",
  "primitive_value_digest",
  "provenance_verified",
  "shadow_only",
  "source_evidence_digest",
  "source_evidence_version",
  "source_result_digest",
  "source_result_version",
  "synthetic_evidence",
  "trusted",
] as const;

function runtimeEvidenceProjection(
  evidence:
    | CanonicalIntegrityProvenanceSeparatedObservationRuntimeEvidence
    | Omit<
        CanonicalIntegrityProvenanceSeparatedObservationRuntimeEvidence,
        "runtime_evidence_digest"
      >,
) {
  return {
    runtime_evidence_version: evidence.runtime_evidence_version,
    authority_version: evidence.authority_version,
    status: evidence.status,
    integrity_verified: evidence.integrity_verified,
    provenance_verified: evidence.provenance_verified,
    provenance_scope: evidence.provenance_scope,
    trusted: evidence.trusted,
    admitted: evidence.admitted,
    capsule_exposed: evidence.capsule_exposed,
    source_authority_version: evidence.source_authority_version,
    source_result_version: evidence.source_result_version,
    source_result_digest: evidence.source_result_digest,
    source_evidence_version: evidence.source_evidence_version,
    source_evidence_digest: evidence.source_evidence_digest,
    primitive_type: evidence.primitive_type,
    primitive_value_digest: evidence.primitive_value_digest,
    primitive_observation_digest: evidence.primitive_observation_digest,
    content_identity_claimed: evidence.content_identity_claimed,
    reason_codes: evidence.reason_codes,
    runtime_evidence_digest_algorithm:
      evidence.runtime_evidence_digest_algorithm,
    ...safety,
  };
}

function envelopeProjection(
  envelope: CanonicalIntegrityProvenanceSeparatedObservationEnvelope,
) {
  return {
    envelope_version: envelope.envelope_version,
    authority_version: envelope.authority_version,
    integrity_verified: envelope.integrity_verified,
    provenance_verified: envelope.provenance_verified,
    authority_status: envelope.authority_status,
    trusted: envelope.trusted,
    admitted: envelope.admitted,
    capsule_exposed: envelope.capsule_exposed,
    source_result_version: envelope.source_result_version,
    source_result_digest: envelope.source_result_digest,
    source_evidence_version: envelope.source_evidence_version,
    source_evidence_digest: envelope.source_evidence_digest,
    primitive_type: envelope.primitive_type,
    primitive_value_digest: envelope.primitive_value_digest,
    primitive_observation_digest: envelope.primitive_observation_digest,
    content_identity_claimed: envelope.content_identity_claimed,
    envelope_digest_algorithm: envelope.envelope_digest_algorithm,
    ...safety,
  };
}

function serializeEnvelope(
  envelope: CanonicalIntegrityProvenanceSeparatedObservationEnvelope,
) {
  return intrinsicJsonStringify({
    ...envelopeProjection(envelope),
    envelope_digest: envelope.envelope_digest,
  });
}

function exactEnvelope(
  value: unknown,
): value is CanonicalIntegrityProvenanceSeparatedObservationEnvelope {
  if (!isRecord(value) || !exactDataKeys(value, envelopeKeys)) return false;
  return (
    value.envelope_version ===
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_ENVELOPE_VERSION &&
    value.authority_version ===
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_AUTHORITY_VERSION &&
    value.integrity_verified === true &&
    value.provenance_verified === false &&
    value.authority_status === "integrity_only" &&
    value.trusted === false &&
    value.admitted === false &&
    value.capsule_exposed === false &&
    value.source_result_version ===
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION &&
    isSha256(value.source_result_digest) &&
    value.source_evidence_version ===
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION &&
    isSha256(value.source_evidence_digest) &&
    isPrimitiveType(value.primitive_type) &&
    isSha256(value.primitive_value_digest) &&
    isSha256(value.primitive_observation_digest) &&
    value.content_identity_claimed === true &&
    value.envelope_digest_algorithm === "sha256_canonical_json_v1" &&
    isSha256(value.envelope_digest) &&
    value.shadow_only === true &&
    value.live_ranking_effect === false &&
    value.live_impact === false &&
    value.persistence_performed === false &&
    value.automatic_training_allowed === false &&
    value.automatic_parameter_change_allowed === false &&
    value.automatic_threshold_change_allowed === false &&
    value.automatic_model_change_allowed === false &&
    value.automatic_promotion_allowed === false &&
    value.external_ai_canonical_truth_authority === false &&
    value.causal_improvement_claimed === false &&
    value.synthetic_evidence === true &&
    value.not_publishable === true
  );
}

function exactRuntimeEvidence(
  value: unknown,
): value is CanonicalIntegrityProvenanceSeparatedObservationRuntimeEvidence {
  if (!isRecord(value) || !exactDataKeys(value, runtimeEvidenceKeys)) {
    return false;
  }
  if (
    value.runtime_evidence_version !==
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RUNTIME_EVIDENCE_VERSION ||
    value.authority_version !==
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_AUTHORITY_VERSION ||
    value.status !== "verified" ||
    value.integrity_verified !== true ||
    value.provenance_verified !== true ||
    value.provenance_scope !== "current_process_only" ||
    value.trusted !== true ||
    value.admitted !== false ||
    value.capsule_exposed !== false ||
    value.source_authority_version !==
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION ||
    value.source_result_version !==
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION ||
    !isSha256(value.source_result_digest) ||
    value.source_evidence_version !==
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION ||
    !isSha256(value.source_evidence_digest) ||
    !isPrimitiveType(value.primitive_type) ||
    !isSha256(value.primitive_value_digest) ||
    !isSha256(value.primitive_observation_digest) ||
    value.content_identity_claimed !== true ||
    !exactEmptyArray(value.reason_codes) ||
    value.runtime_evidence_digest_algorithm !== "sha256_canonical_json_v1" ||
    !isSha256(value.runtime_evidence_digest) ||
    value.shadow_only !== true ||
    value.live_ranking_effect !== false ||
    value.live_impact !== false ||
    value.persistence_performed !== false ||
    value.automatic_training_allowed !== false ||
    value.automatic_parameter_change_allowed !== false ||
    value.automatic_threshold_change_allowed !== false ||
    value.automatic_model_change_allowed !== false ||
    value.automatic_promotion_allowed !== false ||
    value.external_ai_canonical_truth_authority !== false ||
    value.causal_improvement_claimed !== false ||
    value.synthetic_evidence !== true ||
    value.not_publishable !== true
  ) {
    return false;
  }
  const evidence =
    value as unknown as CanonicalIntegrityProvenanceSeparatedObservationRuntimeEvidence;
  return (
    digest(runtimeEvidenceProjection(evidence)) ===
    evidence.runtime_evidence_digest
  );
}

function buildRuntimeEvidence(
  source: CanonicalPrivateAtomicObservationResult,
  counters: CanonicalIntegrityProvenanceSeparatedObservationCounters,
) {
  const sourceEvidence = source.evidence!;
  const projection = {
    runtime_evidence_version:
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RUNTIME_EVIDENCE_VERSION,
    authority_version:
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_AUTHORITY_VERSION,
    status: "verified" as const,
    integrity_verified: true as const,
    provenance_verified: true as const,
    provenance_scope: "current_process_only" as const,
    trusted: true as const,
    admitted: false as const,
    capsule_exposed: false as const,
    source_authority_version:
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION,
    source_result_version: CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION,
    source_result_digest: source.result_digest,
    source_evidence_version:
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION,
    source_evidence_digest: sourceEvidence.evidence_digest,
    primitive_type: sourceEvidence.primitive_type,
    primitive_value_digest: sourceEvidence.primitive_value_digest,
    primitive_observation_digest: sourceEvidence.primitive_observation_digest,
    content_identity_claimed: true as const,
    reason_codes: [] as [],
    runtime_evidence_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...projection,
    runtime_evidence_digest: digest(
      runtimeEvidenceProjection(projection),
      counters,
    ),
  });
}

function buildEnvelope(
  runtimeEvidence: CanonicalIntegrityProvenanceSeparatedObservationRuntimeEvidence,
  counters: CanonicalIntegrityProvenanceSeparatedObservationCounters,
) {
  counters.integrity_envelopes_built += 1;
  const projection = {
    envelope_version:
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_ENVELOPE_VERSION,
    authority_version:
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_AUTHORITY_VERSION,
    integrity_verified: true as const,
    provenance_verified: false as const,
    authority_status: "integrity_only" as const,
    trusted: false as const,
    admitted: false as const,
    capsule_exposed: false as const,
    source_result_version: runtimeEvidence.source_result_version,
    source_result_digest: runtimeEvidence.source_result_digest,
    source_evidence_version: runtimeEvidence.source_evidence_version,
    source_evidence_digest: runtimeEvidence.source_evidence_digest,
    primitive_type: runtimeEvidence.primitive_type,
    primitive_value_digest: runtimeEvidence.primitive_value_digest,
    primitive_observation_digest: runtimeEvidence.primitive_observation_digest,
    content_identity_claimed: true as const,
    envelope_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...projection,
    envelope_digest: digest(projection, counters),
  });
}

function rejectedResult(
  reason: string,
  sourceVerified: boolean,
  counters?: CanonicalIntegrityProvenanceSeparatedObservationCounters,
) {
  const projection = {
    result_version:
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RESULT_VERSION,
    status: "rejected" as const,
    source_result_verified: sourceVerified,
    runtime_evidence: null,
    integrity_envelope: null,
    canonical_integrity_envelope_string: null,
    runtime_authority_status: "none" as const,
    serialized_authority_status: "none" as const,
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
    typeof createCanonicalPrivateAtomicObservationAuthorityHarness
  >;
  predecessorObserve: (request: unknown) => CanonicalPrivateAtomicObservationResult;
  session: object;
  counters: CanonicalIntegrityProvenanceSeparatedObservationCounters;
}) {
  input.counters.request_reads += 1;
  input.counters.predecessor_observations += 1;
  const source = intrinsicReflectApply(input.predecessorObserve, null, [
    input.request,
  ]) as CanonicalPrivateAtomicObservationResult;
  input.counters.predecessor_verifications += 1;
  const verification = verifyCanonicalPrivateAtomicObservationResult({
    request: input.request,
    result: source,
    harness: input.predecessorHarness,
  });
  if (!verification.valid || source.status !== "verified" || !source.evidence) {
    return rejectedResult(
      "integrity_provenance_source_authority_required",
      verification.valid,
      input.counters,
    );
  }
  input.counters.runtime_provenance_checks += 1;
  const runtimeEvidence = buildRuntimeEvidence(source, input.counters);
  const integrityEnvelope = buildEnvelope(runtimeEvidence, input.counters);
  const projection = {
    result_version:
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RESULT_VERSION,
    status: "verified" as const,
    source_result_verified: true,
    runtime_evidence: runtimeEvidence,
    integrity_envelope: integrityEnvelope,
    canonical_integrity_envelope_string: serializeEnvelope(integrityEnvelope),
    runtime_authority_status: "provenance_verified" as const,
    serialized_authority_status: "integrity_only" as const,
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

function canonicalInput(input: unknown) {
  if (typeof input === "string") {
    if (
      input.length >
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_MAX_READBACK_BYTES
    ) {
      return { value: null, bytes: null, terminal: "input_rejected" as const };
    }
    const bytes = intrinsicReflectApply(intrinsicTextEncoderEncode, textEncoder, [
      input,
    ]) as Uint8Array;
    const byteLength = intrinsicReflectApply(
      intrinsicTypedArrayByteLength,
      bytes,
      [],
    ) as number;
    if (
      byteLength >
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_MAX_READBACK_BYTES
    ) {
      return { value: null, bytes: null, terminal: "input_rejected" as const };
    }
    return { value: input, bytes, terminal: null };
  }
  if (
    input === null ||
    (typeof input !== "object" && typeof input !== "function") ||
    !intrinsicReflectApply(intrinsicNodeIsUint8Array, nodeTypes, [input])
  ) {
    return { value: null, bytes: null, terminal: "input_rejected" as const };
  }
  try {
    if (intrinsicObjectGetPrototypeOf(input) !== intrinsicUint8ArrayPrototype) {
      return { value: null, bytes: null, terminal: "input_rejected" as const };
    }
  } catch {
    return { value: null, bytes: null, terminal: "input_rejected" as const };
  }
  let iterator: IterableIterator<number>;
  try {
    iterator = intrinsicReflectApply(intrinsicTypedArrayValues, input, []);
  } catch {
    return { value: null, bytes: null, terminal: "input_rejected" as const };
  }
  const copied = safeArray<number>();
  try {
    while (true) {
      const step = intrinsicReflectApply(
        intrinsicTypedArrayIteratorNext,
        iterator,
        [],
      ) as IteratorResult<number>;
      if (step.done) break;
      if (
        copied.length >=
        CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_MAX_READBACK_BYTES
      ) {
        return { value: null, bytes: null, terminal: "input_rejected" as const };
      }
      arrayPush(copied, step.value);
    }
    const bytes = new IntrinsicUint8Array(copied.length);
    for (let index = 0; index < copied.length; index += 1) {
      bytes[index] = copied[index];
    }
    try {
      return {
        value: intrinsicReflectApply(
          intrinsicTextDecoderDecode,
          textDecoder,
          [bytes],
        ) as string,
        bytes,
        terminal: null,
      };
    } catch {
      return { value: null, bytes, terminal: "malformed" as const };
    }
  } catch {
    return { value: null, bytes: null, terminal: "input_rejected" as const };
  }
}

function readbackInternal(
  input: unknown,
  counters: CanonicalIntegrityProvenanceSeparatedObservationCounters,
): CanonicalIntegrityProvenanceSeparatedObservationReadback {
  counters.readback_reads += 1;
  const canonical = canonicalInput(input);
  let terminal:
    | CanonicalIntegrityProvenanceSeparatedObservationReadback["terminal_status"]
    | null = canonical.terminal;
  let envelope: CanonicalIntegrityProvenanceSeparatedObservationEnvelope | null =
    null;
  const observedInputDigest = canonical.bytes ? sha256(canonical.bytes) : null;
  if (canonical.value !== null) {
    let parsed: unknown;
    try {
      counters.readback_parse_operations += 1;
      parsed = intrinsicJsonParse(canonical.value) as unknown;
    } catch {
      parsed = null;
      terminal = "malformed";
    }
    if (terminal === null) {
      if (!exactEnvelope(parsed)) {
        terminal = "non_canonical";
      } else if (serializeEnvelope(parsed) !== canonical.value) {
        terminal = "non_canonical";
      } else if (digest(envelopeProjection(parsed), counters) !== parsed.envelope_digest) {
        terminal = "digest_mismatch";
      } else {
        envelope = deepFreeze(parsed);
        terminal = "integrity_only";
      }
    }
  }
  terminal ??= "malformed";
  const valid = terminal === "integrity_only" && envelope !== null;
  const projection = {
    readback_version:
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_READBACK_VERSION,
    terminal_status: terminal,
    envelope: valid ? envelope : null,
    integrity_verified: valid,
    provenance_verified: false as const,
    authority_status: valid ? ("integrity_only" as const) : ("none" as const),
    trusted: false as const,
    admitted: false as const,
    observed_input_digest: observedInputDigest,
    content_identity_claimed: valid,
    reason_codes: valid ? ([] as string[]) : [terminal],
    readback_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...projection,
    readback_digest: digest(projection, counters),
  });
}

export function verifyCanonicalIntegrityProvenanceSeparatedObservationReadback(
  input: unknown,
) {
  return readbackInternal(input, emptyCounters());
}

export function createCanonicalIntegrityProvenanceSeparatedObservationAuthorityHarness(
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
        reason_codes: ["integrity_provenance_dependencies_invalid"],
        ...safety,
      },
      null,
    );
  }
  const predecessorHarness =
    createCanonicalPrivateAtomicObservationAuthorityHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies:
        dependencies.value as CanonicalNonForgeableBindingSnapshotIssuanceDependencies,
    });
  const predecessorObserve = predecessorHarness.observe;
  if (!predecessorObserve) {
    return publish(
      {
        enabled: true as const,
        status: "unavailable" as const,
        observe: null,
        readback: null,
        reason_codes: ["integrity_provenance_dependencies_invalid"],
        ...safety,
      },
      null,
    );
  }
  const session = intrinsicObjectFreeze({});
  const run = (
    request: unknown,
    runCounters: CanonicalIntegrityProvenanceSeparatedObservationCounters,
  ) => {
    try {
      return execute({
        request,
        predecessorHarness,
        predecessorObserve,
        session,
        counters: runCounters,
      });
    } catch {
      return rejectedResult(
        "integrity_provenance_execution_failed",
        false,
        runCounters,
      );
    }
  };
  const observe = (request: unknown) =>
    registerResult(run(request, counters), session);
  const rebuild = (request: unknown) => run(request, emptyCounters());
  const readback = (value: unknown) => readbackInternal(value, counters);
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
  "canonical_integrity_envelope_string",
  "capsule_exposed",
  "causal_improvement_claimed",
  "content_identity_claimed",
  "external_ai_canonical_truth_authority",
  "integrity_envelope",
  "live_impact",
  "live_ranking_effect",
  "not_publishable",
  "persistence_performed",
  "reason_codes",
  "result_digest",
  "result_digest_algorithm",
  "result_version",
  "runtime_authority_status",
  "runtime_evidence",
  "serialized_authority_status",
  "shadow_only",
  "source_result_verified",
  "status",
  "synthetic_evidence",
] as const;

export function verifyCanonicalIntegrityProvenanceSeparatedObservationResult(
  input: {
    request: unknown;
    result: CanonicalIntegrityProvenanceSeparatedObservationResult;
    harness: object;
  },
) {
  try {
    if (
      !isRecord(input) ||
      !exactDataKeys(input, ["harness", "request", "result"])
    ) {
      throw new Error("integrity_provenance_verifier_input_invalid");
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
      throw new Error("integrity_provenance_verifier_input_invalid");
    }
    const authority = weakMapGet(harnessAuthorities, harness.value);
    if (!authority) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: [
          authority === null
            ? "integrity_provenance_rebuild_unavailable"
            : "integrity_provenance_harness_unrecognized",
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
        reason_codes: ["integrity_provenance_untrusted_result_container"],
      });
    }
    const record = weakMapGet(resultRecords, provided.value as object);
    if (!record) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["integrity_provenance_untrusted_result_container"],
      });
    }
    if (record.session !== authority.session) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["integrity_provenance_originating_harness_mismatch"],
      });
    }
    if (
      !isRecord(provided.value) ||
      !exactDataKeys(provided.value, resultKeys) ||
      provided.value.status !== "verified" ||
      !exactRuntimeEvidence(provided.value.runtime_evidence) ||
      !exactEnvelope(provided.value.integrity_envelope) ||
      serializeEnvelope(provided.value.integrity_envelope) !==
        provided.value.canonical_integrity_envelope_string ||
      provided.value.runtime_authority_status !== "provenance_verified" ||
      provided.value.serialized_authority_status !== "integrity_only" ||
      provided.value.capsule_exposed !== false
    ) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["integrity_provenance_result_not_authoritative"],
      });
    }
    const canonical = authority.rebuild(request.value);
    const valid =
      canonical.status === "verified" &&
      intrinsicIsDeepStrictEqual(canonical, provided.value);
    return deepFreeze({
      valid,
      canonical_result: canonical,
      reason_codes: valid
        ? []
        : ["integrity_provenance_result_rebuild_mismatch"],
    });
  } catch {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["integrity_provenance_verifier_input_invalid"],
    });
  }
}

function registerResult(
  result: CanonicalIntegrityProvenanceSeparatedObservationResult,
  session: object,
) {
  weakMapSet(resultRecords, result, { session });
  return result;
}
