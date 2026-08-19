import "server-only";

import { createHash as intrinsicCreateHash } from "node:crypto";
import { types as nodeTypes } from "node:util";

import type { CanonicalCallbackFreeAtomicObservationEnvelope } from "@/lib/server/canonical-callback-free-atomic-observation";

const intrinsicArrayIsArray = Array.isArray;
const intrinsicArrayBufferByteLength = Object.getOwnPropertyDescriptor(
  ArrayBuffer.prototype,
  "byteLength",
)?.get as (this: ArrayBuffer) => number;
const intrinsicArrayBufferResizable = Object.getOwnPropertyDescriptor(
  ArrayBuffer.prototype,
  "resizable",
)?.get as ((this: ArrayBuffer) => boolean) | undefined;
const intrinsicArrayBufferPrototype = ArrayBuffer.prototype;
const intrinsicArrayPop = Array.prototype.pop;
const intrinsicArrayPush = Array.prototype.push;
const intrinsicArraySort = Array.prototype.sort;
const IntrinsicArray = Array;
const IntrinsicArrayBuffer = ArrayBuffer;
const IntrinsicDataView = DataView;
const intrinsicJsonParse = JSON.parse;
const intrinsicJsonStringify = JSON.stringify;
const intrinsicNodeIsArrayBuffer = nodeTypes.isArrayBuffer;
const intrinsicNodeIsProxy = nodeTypes.isProxy;
const intrinsicNodeIsSharedArrayBuffer = nodeTypes.isSharedArrayBuffer;
const intrinsicNodeIsUint8Array = nodeTypes.isUint8Array;
const intrinsicObjectFreeze = Object.freeze;
const intrinsicObjectGetOwnPropertyDescriptor =
  Object.getOwnPropertyDescriptor;
const intrinsicObjectGetPrototypeOf = Object.getPrototypeOf;
const intrinsicObjectPrototype = Object.prototype;
const intrinsicReflectApply = Reflect.apply;
const intrinsicReflectConstruct = Reflect.construct;
const intrinsicReflectOwnKeys = Reflect.ownKeys;
const IntrinsicTextDecoder = TextDecoder;
const IntrinsicTextEncoder = TextEncoder;
const intrinsicTextDecoderDecode = TextDecoder.prototype.decode;
const intrinsicTextEncoderEncode = TextEncoder.prototype.encode;
const intrinsicTypedArrayPrototype = intrinsicObjectGetPrototypeOf(
  Uint8Array.prototype,
);
const intrinsicTypedArrayBuffer = intrinsicObjectGetOwnPropertyDescriptor(
  intrinsicTypedArrayPrototype,
  "buffer",
)?.get as (this: Uint8Array) => ArrayBufferLike;
const intrinsicTypedArrayByteLength =
  intrinsicObjectGetOwnPropertyDescriptor(
    intrinsicTypedArrayPrototype,
    "byteLength",
  )?.get as (this: Uint8Array) => number;
const intrinsicTypedArraySet = intrinsicTypedArrayPrototype.set as (
  this: Uint8Array,
  source: Uint8Array,
  offset?: number,
) => void;
const intrinsicUint8ArrayPrototype = Uint8Array.prototype;
const IntrinsicUint8Array = Uint8Array;
const IntrinsicWeakSet = WeakSet;
const intrinsicWeakSetAdd = WeakSet.prototype.add;
const intrinsicWeakSetHas = WeakSet.prototype.has;
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
const textDecoder = new IntrinsicTextDecoder("utf-8", { fatal: true });
const textEncoder = new IntrinsicTextEncoder();

export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION =
  "canonical_lossless_immutable_byte_snapshot_v2" as const;
export const CANONICAL_RAW_BYTE_OBSERVATION_VERSION =
  "canonical_raw_byte_observation_v2" as const;
export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION =
  "canonical_lossless_immutable_byte_readback_v2" as const;
export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_MAX_INPUT_BYTES = 65_536;
export const DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ENABLED = false;
export const DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_KILL_SWITCH = true;
export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_TERMINALS =
  intrinsicObjectFreeze([
    "integrity_only",
    "malformed",
    "non_canonical",
    "digest_mismatch",
    "input_rejected",
  ] as const);
export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ARTIFACT_ROLES =
  intrinsicObjectFreeze({
    "lib/server/canonical-lossless-immutable-byte-snapshot.ts":
      "implementation",
    "lib/server/canonical-lossless-immutable-byte-snapshot-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666cy-current-main-lossless-immutable-byte-snapshot.spec.ts":
      "focused_tests",
    "docs/action-666cy-current-main-lossless-immutable-byte-snapshot.md":
      "contract_documentation",
    "docs/action-666cy-golden-lossless-immutable-byte-snapshot-report.json":
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

export type CanonicalLosslessImmutableByteSnapshotCounters = {
  input_boundary_checks: number;
  input_snapshot_attempts: number;
  input_snapshots: number;
  input_copy_operations: number;
  input_byte_reads: number;
  raw_byte_hash_operations: number;
  decode_operations: number;
  parse_operations: number;
  digest_operations: number;
};

export type CanonicalRawByteObservation = {
  observation_version: typeof CANONICAL_RAW_BYTE_OBSERVATION_VERSION;
  snapshot_contract_version:
    typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION;
  input_domain:
    | "canonical_string_utf8_v2"
    | "fixed_array_buffer_uint8array_v2";
  exact_byte_length: number;
  raw_byte_sha256_algorithm: "sha256_raw_bytes_v1";
  raw_byte_sha256: string;
  observation_digest_algorithm: "sha256_canonical_json_v1";
  observation_digest: string;
};

export type CanonicalLosslessImmutableByteReadback = {
  readback_version:
    typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION;
  snapshot_contract_version:
    typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION;
  terminal_status:
    | "integrity_only"
    | "malformed"
    | "non_canonical"
    | "digest_mismatch"
    | "input_rejected";
  raw_byte_observation: CanonicalRawByteObservation | null;
  envelope: CanonicalCallbackFreeAtomicObservationEnvelope | null;
  integrity_verified: boolean;
  provenance_verified: false;
  authority_status: "integrity_only" | "none";
  trusted: false;
  admitted: false;
  content_identity_claimed: boolean;
  observed_envelope_digest: string | null;
  rebuilt_envelope_digest: string | null;
  reason_codes: string[];
  terminal_identity: string;
  failure_identity: string | null;
  readback_digest_algorithm: "sha256_canonical_json_v1";
  readback_digest: string;
} & typeof safety;

export type CanonicalLosslessImmutableByteSnapshotExecution = {
  execution_version:
    typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION;
  enabled: boolean;
  status: "disabled" | "kill_switch_engaged" | "completed";
  terminal_result: CanonicalLosslessImmutableByteReadback | null;
  counters: CanonicalLosslessImmutableByteSnapshotCounters;
} & typeof safety;

type RejectionReason =
  | "function_valued_input_rejected"
  | "arbitrary_object_input_rejected"
  | "typed_array_subclass_rejected"
  | "shared_array_buffer_backing_rejected"
  | "cross_realm_array_buffer_rejected"
  | "resizable_array_buffer_rejected"
  | "detached_array_buffer_rejected"
  | "readback_too_large"
  | "readback_bytes_invalid";

type SnapshotResult =
  | {
      snapshot: Uint8Array;
      input_domain: CanonicalRawByteObservation["input_domain"];
      rejection: null;
    }
  | {
      snapshot: null;
      input_domain: null;
      rejection: RejectionReason;
    };

function arrayPop<T>(values: T[]) {
  return intrinsicReflectApply(intrinsicArrayPop, values, []) as T | undefined;
}

function arrayPush<T>(values: T[], value: T) {
  return intrinsicReflectApply(intrinsicArrayPush, values, [value]) as number;
}

function arraySort<T>(
  values: T[],
  comparator: (first: T, second: T) => number,
) {
  intrinsicReflectApply(intrinsicArraySort, values, [comparator]);
  return values;
}

function safeArray<T>() {
  return new IntrinsicArray<T>();
}

function compareStrings(first: string, second: string) {
  if (first === second) return 0;
  return first < second ? -1 : 1;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  const pending = safeArray<object>();
  arrayPush(pending, value);
  const seen = new IntrinsicWeakSet<object>();
  while (pending.length > 0) {
    const current = arrayPop(pending)!;
    if (
      intrinsicReflectApply(intrinsicWeakSetHas, seen, [current]) as boolean
    ) {
      continue;
    }
    intrinsicReflectApply(intrinsicWeakSetAdd, seen, [current]);
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

function emptyCounters(): CanonicalLosslessImmutableByteSnapshotCounters {
  return {
    input_boundary_checks: 0,
    input_snapshot_attempts: 0,
    input_snapshots: 0,
    input_copy_operations: 0,
    input_byte_reads: 0,
    raw_byte_hash_operations: 0,
    decode_operations: 0,
    parse_operations: 0,
    digest_operations: 0,
  };
}

function countersSnapshot(
  counters: CanonicalLosslessImmutableByteSnapshotCounters,
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
  counters: CanonicalLosslessImmutableByteSnapshotCounters,
) {
  counters.digest_operations += 1;
  return sha256(intrinsicJsonStringify(value));
}

function rawByteSha256(
  value: Uint8Array,
  counters: CanonicalLosslessImmutableByteSnapshotCounters,
) {
  counters.raw_byte_hash_operations += 1;
  return sha256(value);
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

function isPrimitiveType(value: unknown) {
  return (
    value === "bigint" ||
    value === "number" ||
    value === "string" ||
    value === "boolean" ||
    value === "null" ||
    value === "undefined"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  try {
    return (
      !intrinsicNodeIsProxy(value) &&
      !intrinsicArrayIsArray(value) &&
      intrinsicObjectGetPrototypeOf(value) === intrinsicObjectPrototype
    );
  } catch {
    return false;
  }
}

function exactDataKeys(value: object, expected: readonly string[]) {
  try {
    const actual = intrinsicReflectOwnKeys(value);
    if (actual.length !== expected.length) return false;
    const copied = safeArray<string>();
    for (let index = 0; index < actual.length; index += 1) {
      const key = actual[index];
      if (typeof key !== "string") return false;
      arrayPush(copied, key);
    }
    arraySort(copied, compareStrings);
    for (let index = 0; index < expected.length; index += 1) {
      if (copied[index] !== expected[index]) return false;
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(
        value,
        expected[index],
      );
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function envelopeProjection(
  envelope: CanonicalCallbackFreeAtomicObservationEnvelope,
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
  envelope: CanonicalCallbackFreeAtomicObservationEnvelope,
) {
  return intrinsicJsonStringify({
    ...envelopeProjection(envelope),
    envelope_digest: envelope.envelope_digest,
  });
}

function exactEnvelope(
  value: unknown,
): value is CanonicalCallbackFreeAtomicObservationEnvelope {
  if (!isRecord(value) || !exactDataKeys(value, envelopeKeys)) return false;
  return (
    value.envelope_version ===
      "canonical_integrity_provenance_separated_observation_envelope_v2" &&
    value.authority_version ===
      "canonical_integrity_provenance_separated_observation_authority_v2" &&
    value.integrity_verified === true &&
    value.provenance_verified === false &&
    value.authority_status === "integrity_only" &&
    value.trusted === false &&
    value.admitted === false &&
    value.capsule_exposed === false &&
    value.source_result_version ===
      "canonical_private_atomic_observation_result_v2" &&
    isSha256(value.source_result_digest) &&
    value.source_evidence_version ===
      "canonical_private_atomic_observation_evidence_v2" &&
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

function captureSnapshot(
  input: unknown,
  counters: CanonicalLosslessImmutableByteSnapshotCounters,
): SnapshotResult {
  if (typeof input === "function") {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "function_valued_input_rejected",
    };
  }
  if (typeof input === "string") {
    counters.input_boundary_checks += 1;
    counters.input_snapshot_attempts += 1;
    if (input.length > CANONICAL_LOSSLESS_IMMUTABLE_BYTE_MAX_INPUT_BYTES) {
      return {
        snapshot: null,
        input_domain: null,
        rejection: "readback_too_large",
      };
    }
    const snapshot = intrinsicReflectApply(
      intrinsicTextEncoderEncode,
      textEncoder,
      [input],
    ) as Uint8Array;
    const byteLength = intrinsicReflectApply(
      intrinsicTypedArrayByteLength,
      snapshot,
      [],
    ) as number;
    if (byteLength > CANONICAL_LOSSLESS_IMMUTABLE_BYTE_MAX_INPUT_BYTES) {
      return {
        snapshot: null,
        input_domain: null,
        rejection: "readback_too_large",
      };
    }
    counters.input_snapshots += 1;
    counters.input_copy_operations += 1;
    counters.input_byte_reads += byteLength;
    return {
      snapshot,
      input_domain: "canonical_string_utf8_v2",
      rejection: null,
    };
  }
  if (input === null || typeof input !== "object") {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "arbitrary_object_input_rejected",
    };
  }

  counters.input_boundary_checks += 1;
  try {
    if (intrinsicNodeIsProxy(input) || !intrinsicNodeIsUint8Array(input)) {
      return {
        snapshot: null,
        input_domain: null,
        rejection: "arbitrary_object_input_rejected",
      };
    }
    if (intrinsicObjectGetPrototypeOf(input) !== intrinsicUint8ArrayPrototype) {
      return {
        snapshot: null,
        input_domain: null,
        rejection: "typed_array_subclass_rejected",
      };
    }
  } catch {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "arbitrary_object_input_rejected",
    };
  }

  let backingStore: ArrayBufferLike;
  try {
    backingStore = intrinsicReflectApply(intrinsicTypedArrayBuffer, input, []);
  } catch {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "detached_array_buffer_rejected",
    };
  }
  if (intrinsicNodeIsSharedArrayBuffer(backingStore)) {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "shared_array_buffer_backing_rejected",
    };
  }
  if (!intrinsicNodeIsArrayBuffer(backingStore)) {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "cross_realm_array_buffer_rejected",
    };
  }
  if (intrinsicObjectGetPrototypeOf(backingStore) !== intrinsicArrayBufferPrototype) {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "cross_realm_array_buffer_rejected",
    };
  }
  try {
    intrinsicReflectApply(intrinsicArrayBufferByteLength, backingStore, []);
    if (
      intrinsicArrayBufferResizable &&
      (intrinsicReflectApply(
        intrinsicArrayBufferResizable,
        backingStore,
        [],
      ) as boolean)
    ) {
      return {
        snapshot: null,
        input_domain: null,
        rejection: "resizable_array_buffer_rejected",
      };
    }
    intrinsicReflectConstruct(IntrinsicDataView, [backingStore, 0, 0]);
  } catch {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "detached_array_buffer_rejected",
    };
  }

  let byteLength: number;
  try {
    byteLength = intrinsicReflectApply(
      intrinsicTypedArrayByteLength,
      input,
      [],
    ) as number;
  } catch {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "detached_array_buffer_rejected",
    };
  }
  if (byteLength > CANONICAL_LOSSLESS_IMMUTABLE_BYTE_MAX_INPUT_BYTES) {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "readback_too_large",
    };
  }

  counters.input_snapshot_attempts += 1;
  try {
    const ownedBuffer = new IntrinsicArrayBuffer(byteLength);
    const snapshot = new IntrinsicUint8Array(ownedBuffer);
    intrinsicReflectApply(intrinsicTypedArraySet, snapshot, [input, 0]);
    counters.input_snapshots += 1;
    counters.input_copy_operations += 1;
    counters.input_byte_reads += byteLength;
    return {
      snapshot,
      input_domain: "fixed_array_buffer_uint8array_v2",
      rejection: null,
    };
  } catch {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "readback_bytes_invalid",
    };
  }
}

function rawObservation(
  snapshot: Uint8Array,
  inputDomain: CanonicalRawByteObservation["input_domain"],
  counters: CanonicalLosslessImmutableByteSnapshotCounters,
) {
  const exactByteLength = intrinsicReflectApply(
    intrinsicTypedArrayByteLength,
    snapshot,
    [],
  ) as number;
  const rawByteDigest = rawByteSha256(snapshot, counters);
  const projection = {
    observation_version: CANONICAL_RAW_BYTE_OBSERVATION_VERSION,
    snapshot_contract_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
    input_domain: inputDomain,
    exact_byte_length: exactByteLength,
    raw_byte_sha256_algorithm: "sha256_raw_bytes_v1" as const,
    raw_byte_sha256: rawByteDigest,
    observation_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...projection,
    observation_digest: digest(projection, counters),
  });
}

function resultProjection(input: {
  terminal_status: CanonicalLosslessImmutableByteReadback["terminal_status"];
  raw_byte_observation: CanonicalRawByteObservation | null;
  envelope: CanonicalCallbackFreeAtomicObservationEnvelope | null;
  integrity_verified: boolean;
  authority_status: "integrity_only" | "none";
  content_identity_claimed: boolean;
  observed_envelope_digest: string | null;
  rebuilt_envelope_digest: string | null;
  reason_codes: string[];
  terminal_identity: string;
  failure_identity: string | null;
}) {
  return {
    readback_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION,
    snapshot_contract_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
    ...input,
    provenance_verified: false as const,
    trusted: false as const,
    admitted: false as const,
    readback_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
}

function buildResult(
  input: {
    terminal_status: CanonicalLosslessImmutableByteReadback["terminal_status"];
    raw_byte_observation: CanonicalRawByteObservation | null;
    envelope: CanonicalCallbackFreeAtomicObservationEnvelope | null;
    integrity_verified: boolean;
    authority_status: "integrity_only" | "none";
    content_identity_claimed: boolean;
    observed_envelope_digest: string | null;
    rebuilt_envelope_digest: string | null;
    reason_codes: string[];
  },
  counters: CanonicalLosslessImmutableByteSnapshotCounters,
) {
  const terminalIdentity = digest(
    {
      readback_version:
        CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION,
      snapshot_contract_version:
        CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
      terminal_status: input.terminal_status,
      raw_byte_observation_digest:
        input.raw_byte_observation?.observation_digest ?? null,
      observed_envelope_digest: input.observed_envelope_digest,
      rebuilt_envelope_digest: input.rebuilt_envelope_digest,
      reason_codes: input.reason_codes,
      provenance_verified: false,
      trusted: false,
      admitted: false,
    },
    counters,
  );
  const failureIdentity =
    input.terminal_status === "integrity_only"
      ? null
      : digest(
          {
            readback_version:
              CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION,
            terminal_identity: terminalIdentity,
            raw_byte_observation_digest:
              input.raw_byte_observation?.observation_digest ?? null,
            reason_codes: input.reason_codes,
          },
          counters,
        );
  const projection = resultProjection({
    ...input,
    terminal_identity: terminalIdentity,
    failure_identity: failureIdentity,
  });
  return deepFreeze({
    ...projection,
    readback_digest: digest(projection, counters),
  });
}

function rejectInput(
  reason: RejectionReason,
  counters: CanonicalLosslessImmutableByteSnapshotCounters,
) {
  return buildResult(
    {
      terminal_status: "input_rejected",
      raw_byte_observation: null,
      envelope: null,
      integrity_verified: false,
      authority_status: "none",
      content_identity_claimed: false,
      observed_envelope_digest: null,
      rebuilt_envelope_digest: null,
      reason_codes: [reason],
    },
    counters,
  );
}

function readSnapshot(
  snapshot: Uint8Array,
  inputDomain: CanonicalRawByteObservation["input_domain"],
  counters: CanonicalLosslessImmutableByteSnapshotCounters,
) {
  const observation = rawObservation(snapshot, inputDomain, counters);
  counters.decode_operations += 1;
  let decoded: string;
  try {
    decoded = intrinsicReflectApply(
      intrinsicTextDecoderDecode,
      textDecoder,
      [snapshot],
    ) as string;
  } catch {
    return buildResult(
      {
        terminal_status: "malformed",
        raw_byte_observation: observation,
        envelope: null,
        integrity_verified: false,
        authority_status: "none",
        content_identity_claimed: true,
        observed_envelope_digest: null,
        rebuilt_envelope_digest: null,
        reason_codes: ["raw_bytes_invalid_utf8"],
      },
      counters,
    );
  }

  counters.parse_operations += 1;
  let parsed: unknown;
  try {
    parsed = intrinsicJsonParse(decoded);
  } catch {
    return buildResult(
      {
        terminal_status: "malformed",
        raw_byte_observation: observation,
        envelope: null,
        integrity_verified: false,
        authority_status: "none",
        content_identity_claimed: true,
        observed_envelope_digest: null,
        rebuilt_envelope_digest: null,
        reason_codes: ["canonical_json_malformed"],
      },
      counters,
    );
  }
  if (!exactEnvelope(parsed)) {
    return buildResult(
      {
        terminal_status: "non_canonical",
        raw_byte_observation: observation,
        envelope: null,
        integrity_verified: false,
        authority_status: "none",
        content_identity_claimed: true,
        observed_envelope_digest:
          isRecord(parsed) && isSha256(parsed.envelope_digest)
            ? parsed.envelope_digest
            : null,
        rebuilt_envelope_digest: null,
        reason_codes: ["canonical_envelope_shape_invalid"],
      },
      counters,
    );
  }
  const rebuiltEnvelopeDigest = digest(envelopeProjection(parsed), counters);
  if (parsed.envelope_digest !== rebuiltEnvelopeDigest) {
    return buildResult(
      {
        terminal_status: "digest_mismatch",
        raw_byte_observation: observation,
        envelope: null,
        integrity_verified: false,
        authority_status: "none",
        content_identity_claimed: true,
        observed_envelope_digest: parsed.envelope_digest,
        rebuilt_envelope_digest: rebuiltEnvelopeDigest,
        reason_codes: ["canonical_envelope_digest_mismatch"],
      },
      counters,
    );
  }
  if (decoded !== serializeEnvelope(parsed)) {
    return buildResult(
      {
        terminal_status: "non_canonical",
        raw_byte_observation: observation,
        envelope: null,
        integrity_verified: false,
        authority_status: "none",
        content_identity_claimed: true,
        observed_envelope_digest: parsed.envelope_digest,
        rebuilt_envelope_digest: rebuiltEnvelopeDigest,
        reason_codes: ["canonical_envelope_serialization_invalid"],
      },
      counters,
    );
  }
  return buildResult(
    {
      terminal_status: "integrity_only",
      raw_byte_observation: observation,
      envelope: deepFreeze(parsed),
      integrity_verified: true,
      authority_status: "integrity_only",
      content_identity_claimed: true,
      observed_envelope_digest: parsed.envelope_digest,
      rebuilt_envelope_digest: rebuiltEnvelopeDigest,
      reason_codes: [],
    },
    counters,
  );
}

function execution(
  enabled: boolean,
  status: CanonicalLosslessImmutableByteSnapshotExecution["status"],
  terminalResult: CanonicalLosslessImmutableByteReadback | null,
  counters: CanonicalLosslessImmutableByteSnapshotCounters,
) {
  return deepFreeze({
    execution_version: CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
    enabled,
    status,
    terminal_result: terminalResult,
    counters: countersSnapshot(counters),
    ...safety,
  });
}

export function runCanonicalLosslessImmutableByteSnapshot(
  input: unknown,
  enabled: boolean =
    DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ENABLED,
  killSwitchEngaged: boolean =
    DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_KILL_SWITCH,
): CanonicalLosslessImmutableByteSnapshotExecution {
  const counters = emptyCounters();
  if (enabled !== true) {
    return execution(false, "disabled", null, counters);
  }
  if (killSwitchEngaged !== false) {
    return execution(true, "kill_switch_engaged", null, counters);
  }
  try {
    const captured = captureSnapshot(input, counters);
    const terminal =
      captured.rejection === null
        ? readSnapshot(captured.snapshot, captured.input_domain, counters)
        : rejectInput(captured.rejection, counters);
    return execution(true, "completed", terminal, counters);
  } catch {
    return execution(
      true,
      "completed",
      rejectInput("readback_bytes_invalid", counters),
      counters,
    );
  }
}
