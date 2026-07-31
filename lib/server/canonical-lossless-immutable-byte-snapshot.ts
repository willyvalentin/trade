import "server-only";

import { createHash } from "node:crypto";

import {
  CANONICAL_INTEGRITY_ONLY_ENVELOPE_VERSION,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION,
  type CanonicalIntegrityOnlyObservationEnvelope,
} from "@/lib/server/canonical-integrity-provenance-separated-observation-authority";
import {
  CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
  canonicalLosslessInvalidScalarIssuanceDigest,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";

export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION =
  "canonical_lossless_immutable_byte_snapshot_v1" as const;
export const CANONICAL_RAW_BYTE_OBSERVATION_VERSION =
  "canonical_raw_byte_observation_v1" as const;
export const CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION =
  "canonical_immutable_byte_readback_v1" as const;
export const CANONICAL_IMMUTABLE_BYTE_MAX_INPUT_BYTES = 65_536;
export const DEFAULT_OFF_IMMUTABLE_BYTE_SNAPSHOT_ENABLED = false;
export const DEFAULT_OFF_IMMUTABLE_BYTE_SNAPSHOT_KILL_SWITCH = true;
export const CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ARTIFACT_ROLES =
  Object.freeze({
    "lib/server/canonical-lossless-immutable-byte-snapshot.ts":
      "implementation",
    "lib/server/canonical-lossless-immutable-byte-snapshot-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666ch-lossless-immutable-byte-snapshot.spec.ts":
      "focused_adversarial_tests",
    "docs/action-666ch-lossless-immutable-byte-snapshot.md":
      "contract_documentation",
    "docs/action-666ch-golden-lossless-immutable-byte-snapshot-report.json":
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

const FixedArrayBuffer = ArrayBuffer;
const FixedUint8Array = Uint8Array;
const FixedDataView = DataView;
const jsonParse = JSON.parse;
const jsonStringify = JSON.stringify;
const objectGetPrototypeOf = Object.getPrototypeOf;
const objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const objectGetOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
const reflectApply = Reflect.apply;
const reflectConstruct = Reflect.construct;
const typedArrayPrototype = objectGetPrototypeOf(Uint8Array.prototype);
const typedArrayBufferGetter = objectGetOwnPropertyDescriptor(
  typedArrayPrototype,
  "buffer",
)!.get!;
const typedArrayByteLengthGetter = objectGetOwnPropertyDescriptor(
  typedArrayPrototype,
  "byteLength",
)!.get!;
const typedArraySet = typedArrayPrototype.set as (
  this: Uint8Array,
  source: Uint8Array,
  offset?: number,
) => void;
const arrayBufferByteLengthGetter = objectGetOwnPropertyDescriptor(
  ArrayBuffer.prototype,
  "byteLength",
)!.get!;
const arrayBufferResizableGetter = objectGetOwnPropertyDescriptor(
  ArrayBuffer.prototype,
  "resizable",
)?.get;
const textDecoder = new TextDecoder("utf-8", { fatal: true });
const textEncoder = new TextEncoder();
const sha256Pattern = /^[a-f0-9]{64}$/;

const primitiveTypes = new Set([
  "bigint",
  "number",
  "string",
  "boolean",
  "null",
  "undefined",
  "symbol",
  "function",
]);

export type CanonicalImmutableByteSnapshotCounters = {
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
    | "canonical_string_utf8_v1"
    | "fixed_array_buffer_uint8array_v1";
  exact_byte_length: number;
  raw_byte_sha256_algorithm: "sha256_raw_bytes_v1";
  raw_byte_sha256: string;
  observation_digest_algorithm: "sha256_canonical_json_v1";
  observation_digest: string;
};

type RejectionReason =
  | "function_valued_input_rejected"
  | "arbitrary_object_input_rejected"
  | "typed_array_subclass_rejected"
  | "shared_array_buffer_backing_rejected"
  | "cross_realm_array_buffer_rejected"
  | "resizable_array_buffer_rejected"
  | "detached_array_buffer_rejected"
  | "readback_too_large";

export type CanonicalImmutableByteReadbackResult = {
  readback_version: typeof CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION;
  snapshot_contract_version:
    typeof CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION;
  status:
    | "integrity_only"
    | "malformed"
    | "non_canonical"
    | "digest_mismatch"
    | "input_rejected";
  raw_byte_observation: CanonicalRawByteObservation | null;
  envelope: CanonicalIntegrityOnlyObservationEnvelope | null;
  integrity_verified: boolean;
  provenance_verified: false;
  authority_status: "integrity_only" | "untrusted";
  trusted: false;
  admitted: false;
  content_identity_claimed: boolean;
  observed_integrity_digest: string | null;
  rebuilt_integrity_digest: string | null;
  reason_codes: string[];
  terminal_identity: string;
  failure_identity: string | null;
  readback_digest_algorithm: "sha256_canonical_json_v1";
  readback_digest: string;
} & typeof safety;

function emptyCounters(): CanonicalImmutableByteSnapshotCounters {
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

function digest(
  value: unknown,
  counters?: CanonicalImmutableByteSnapshotCounters,
) {
  if (counters) counters.digest_operations += 1;
  return canonicalLosslessInvalidScalarIssuanceDigest(value);
}

function deepFreezeIterative<T>(value: T): T {
  if (!value || typeof value !== "object") return value;
  const pending = [value as object];
  const seen = new WeakSet<object>();
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const descriptor of Object.values(
      objectGetOwnPropertyDescriptors(current),
    )) {
      if (
        "value" in descriptor &&
        descriptor.value &&
        typeof descriptor.value === "object"
      ) {
        pending.push(descriptor.value as object);
      }
    }
    Object.freeze(current);
  }
  return value;
}

type AcceptedSnapshot = {
  snapshot: Uint8Array;
  input_domain: CanonicalRawByteObservation["input_domain"];
  rejection: null;
};

type RejectedSnapshot = {
  snapshot: null;
  input_domain: null;
  rejection: RejectionReason;
};

function immutableSnapshot(
  input: unknown,
  counters: CanonicalImmutableByteSnapshotCounters,
): AcceptedSnapshot | RejectedSnapshot {
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
    const snapshot = textEncoder.encode(input);
    counters.input_copy_operations += 1;
    if (snapshot.byteLength > CANONICAL_IMMUTABLE_BYTE_MAX_INPUT_BYTES) {
      return {
        snapshot: null,
        input_domain: null,
        rejection: "readback_too_large",
      };
    }
    counters.input_snapshots += 1;
    counters.input_byte_reads += snapshot.byteLength;
    return {
      snapshot,
      input_domain: "canonical_string_utf8_v1",
      rejection: null,
    };
  }
  if (!input || typeof input !== "object") {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "arbitrary_object_input_rejected",
    };
  }

  counters.input_boundary_checks += 1;
  let backingStore: ArrayBuffer;
  try {
    backingStore = reflectApply(typedArrayBufferGetter, input, []);
  } catch {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "arbitrary_object_input_rejected",
    };
  }
  try {
    if (reflectApply(objectGetPrototypeOf, Object, [input]) !==
      Uint8Array.prototype) {
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

  try {
    reflectApply(arrayBufferByteLengthGetter, backingStore, []);
  } catch {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "shared_array_buffer_backing_rejected",
    };
  }
  try {
    if (reflectApply(objectGetPrototypeOf, Object, [backingStore]) !==
      ArrayBuffer.prototype) {
      return {
        snapshot: null,
        input_domain: null,
        rejection: "cross_realm_array_buffer_rejected",
      };
    }
    if (
      arrayBufferResizableGetter &&
      reflectApply(arrayBufferResizableGetter, backingStore, []) === true
    ) {
      return {
        snapshot: null,
        input_domain: null,
        rejection: "resizable_array_buffer_rejected",
      };
    }
    reflectConstruct(FixedDataView, [backingStore, 0, 0]);
  } catch {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "detached_array_buffer_rejected",
    };
  }

  let byteLength: number;
  try {
    byteLength = reflectApply(typedArrayByteLengthGetter, input, []);
  } catch {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "detached_array_buffer_rejected",
    };
  }
  if (byteLength > CANONICAL_IMMUTABLE_BYTE_MAX_INPUT_BYTES) {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "readback_too_large",
    };
  }

  counters.input_snapshot_attempts += 1;
  try {
    const ownedBuffer = new FixedArrayBuffer(byteLength);
    const snapshot = new FixedUint8Array(ownedBuffer);
    reflectApply(typedArraySet, snapshot, [input, 0]);
    counters.input_copy_operations += 1;
    counters.input_snapshots += 1;
    counters.input_byte_reads += byteLength;
    return {
      snapshot,
      input_domain: "fixed_array_buffer_uint8array_v1",
      rejection: null,
    };
  } catch {
    return {
      snapshot: null,
      input_domain: null,
      rejection: "detached_array_buffer_rejected",
    };
  }
}

const envelopeSerializationKeys = [
  "envelope_version",
  "separation_contract_version",
  "authority_status",
  "integrity_verified",
  "provenance_verified",
  "trusted",
  "admitted",
  "primitive_observation_version",
  "primitive_type",
  "primitive_value_digest",
  "primitive_observation_digest",
  "bounded_observation_digest",
  "content_identity_claimed",
  "integrity_digest_algorithm",
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
  "integrity_digest",
] as const;
const envelopeKeys = [...envelopeSerializationKeys].sort();

function serializeEnvelope(
  envelope: CanonicalIntegrityOnlyObservationEnvelope,
) {
  const record = envelope as unknown as Record<string, unknown>;
  return jsonStringify(
    Object.fromEntries(
      envelopeSerializationKeys.map((key) => [key, record[key]]),
    ),
  );
}

function exactEnvelopeShape(
  value: unknown,
): value is CanonicalIntegrityOnlyObservationEnvelope {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    objectGetPrototypeOf(value) !== Object.prototype
  ) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).sort().join("\0") !== envelopeKeys.join("\0") ||
    record.envelope_version !==
      CANONICAL_INTEGRITY_ONLY_ENVELOPE_VERSION ||
    record.separation_contract_version !==
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION ||
    record.authority_status !== "integrity_only" ||
    record.integrity_verified !== true ||
    record.provenance_verified !== false ||
    record.trusted !== false ||
    record.admitted !== false ||
    record.primitive_observation_version !==
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION ||
    typeof record.primitive_type !== "string" ||
    !primitiveTypes.has(record.primitive_type) ||
    (record.primitive_value_digest !== null &&
      (typeof record.primitive_value_digest !== "string" ||
        !sha256Pattern.test(record.primitive_value_digest))) ||
    typeof record.primitive_observation_digest !== "string" ||
    !sha256Pattern.test(record.primitive_observation_digest) ||
    typeof record.bounded_observation_digest !== "string" ||
    !sha256Pattern.test(record.bounded_observation_digest) ||
    typeof record.content_identity_claimed !== "boolean" ||
    record.integrity_digest_algorithm !== "sha256_canonical_json_v1" ||
    typeof record.integrity_digest !== "string" ||
    !sha256Pattern.test(record.integrity_digest)
  ) {
    return false;
  }
  for (const [key, expected] of Object.entries(safety)) {
    if (record[key] !== expected) return false;
  }
  return true;
}

function staticRejection(reason: RejectionReason) {
  const terminalIdentity = digest({
    readback_version: CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION,
    snapshot_contract_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
    status: "input_rejected",
    raw_byte_observation: null,
    reason_codes: [reason],
    provenance_verified: false,
    trusted: false,
    admitted: false,
  });
  const failureIdentity = digest({
    readback_version: CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION,
    terminal_identity: terminalIdentity,
    raw_byte_observation_digest: null,
    reason_codes: [reason],
  });
  const projection = {
    readback_version: CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION,
    snapshot_contract_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
    status: "input_rejected" as const,
    raw_byte_observation: null,
    envelope: null,
    integrity_verified: false,
    provenance_verified: false as const,
    authority_status: "untrusted" as const,
    trusted: false as const,
    admitted: false as const,
    content_identity_claimed: false,
    observed_integrity_digest: null,
    rebuilt_integrity_digest: null,
    reason_codes: [reason],
    terminal_identity: terminalIdentity,
    failure_identity: failureIdentity,
    readback_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...projection,
    readback_digest: digest(projection),
  });
}

const staticRejections = Object.freeze(
  Object.fromEntries(
    [
      "function_valued_input_rejected",
      "arbitrary_object_input_rejected",
      "typed_array_subclass_rejected",
      "shared_array_buffer_backing_rejected",
      "cross_realm_array_buffer_rejected",
      "resizable_array_buffer_rejected",
      "detached_array_buffer_rejected",
      "readback_too_large",
    ].map((reason) => [reason, staticRejection(reason as RejectionReason)]),
  ) as Record<RejectionReason, CanonicalImmutableByteReadbackResult>,
);

function observeRawBytes(
  snapshot: Uint8Array,
  inputDomain: CanonicalRawByteObservation["input_domain"],
  counters: CanonicalImmutableByteSnapshotCounters,
): CanonicalRawByteObservation {
  counters.raw_byte_hash_operations += 1;
  const projection = {
    observation_version: CANONICAL_RAW_BYTE_OBSERVATION_VERSION,
    snapshot_contract_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
    input_domain: inputDomain,
    exact_byte_length: snapshot.byteLength,
    raw_byte_sha256_algorithm: "sha256_raw_bytes_v1" as const,
    raw_byte_sha256: createHash("sha256").update(snapshot).digest("hex"),
    observation_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreezeIterative({
    ...projection,
    observation_digest: digest(projection, counters),
  });
}

function verifySnapshot(
  snapshot: Uint8Array,
  inputDomain: CanonicalRawByteObservation["input_domain"],
  counters: CanonicalImmutableByteSnapshotCounters,
): CanonicalImmutableByteReadbackResult {
  const rawByteObservation = observeRawBytes(
    snapshot,
    inputDomain,
    counters,
  );
  let status: CanonicalImmutableByteReadbackResult["status"] =
    "malformed";
  let reason = "canonical_json_malformed";
  let envelope: CanonicalIntegrityOnlyObservationEnvelope | null = null;
  let observedIntegrityDigest: string | null = null;
  let rebuiltIntegrityDigest: string | null = null;
  let canonicalString: string | null = null;

  try {
    counters.decode_operations += 1;
    canonicalString = textDecoder.decode(snapshot);
  } catch {
    reason = "raw_bytes_invalid_utf8";
  }
  if (canonicalString !== null) {
    try {
      counters.parse_operations += 1;
      const parsed = jsonParse(canonicalString) as unknown;
      if (!exactEnvelopeShape(parsed)) {
        reason = "canonical_schema_invalid";
      } else {
        observedIntegrityDigest = parsed.integrity_digest;
        rebuiltIntegrityDigest = digest(
          { ...parsed, integrity_digest: undefined },
          counters,
        );
        if (serializeEnvelope(parsed) !== canonicalString) {
          status = "non_canonical";
          reason = "canonical_json_non_canonical";
        } else if (observedIntegrityDigest !== rebuiltIntegrityDigest) {
          status = "digest_mismatch";
          reason = "integrity_digest_mismatch";
        } else {
          status = "integrity_only";
          reason = "integrity_only_public_digest_not_authority";
          envelope = deepFreezeIterative(parsed);
        }
      }
    } catch {
      status = "malformed";
      reason = "canonical_json_malformed";
    }
  }

  const terminalIdentity = digest(
    {
      readback_version: CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION,
      snapshot_contract_version:
        CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
      status,
      raw_byte_observation_digest: rawByteObservation.observation_digest,
      observed_integrity_digest: observedIntegrityDigest,
      rebuilt_integrity_digest: rebuiltIntegrityDigest,
      reason_codes: [reason],
      integrity_verified: status === "integrity_only",
      provenance_verified: false,
      authority_status:
        status === "integrity_only" ? "integrity_only" : "untrusted",
      trusted: false,
      admitted: false,
    },
    counters,
  );
  const failureIdentity =
    status === "integrity_only"
      ? null
      : digest(
          {
            readback_version: CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION,
            terminal_identity: terminalIdentity,
            raw_byte_observation_digest:
              rawByteObservation.observation_digest,
            reason_codes: [reason],
          },
          counters,
        );
  const projection = {
    readback_version: CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION,
    snapshot_contract_version:
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
    status,
    raw_byte_observation: rawByteObservation,
    envelope,
    integrity_verified: status === "integrity_only",
    provenance_verified: false as const,
    authority_status:
      status === "integrity_only"
        ? ("integrity_only" as const)
        : ("untrusted" as const),
    trusted: false as const,
    admitted: false as const,
    content_identity_claimed:
      status === "integrity_only" &&
      envelope?.content_identity_claimed === true,
    observed_integrity_digest: observedIntegrityDigest,
    rebuilt_integrity_digest: rebuiltIntegrityDigest,
    reason_codes: [reason],
    terminal_identity: terminalIdentity,
    failure_identity: failureIdentity,
    readback_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...projection,
    readback_digest: digest(projection, counters),
  });
}

export function runCanonicalLosslessImmutableByteSnapshot(
  input: string | Uint8Array,
  enabled: boolean = DEFAULT_OFF_IMMUTABLE_BYTE_SNAPSHOT_ENABLED,
  killSwitchEngaged: boolean =
    DEFAULT_OFF_IMMUTABLE_BYTE_SNAPSHOT_KILL_SWITCH,
) {
  const counters = emptyCounters();
  if (
    typeof enabled !== "boolean" ||
    typeof killSwitchEngaged !== "boolean"
  ) {
    return deepFreezeIterative({
      enabled: false as const,
      status: "invalid_scalar_options" as const,
      terminal_result: null,
      counters,
      ...safety,
    });
  }
  if (!enabled || killSwitchEngaged) {
    return deepFreezeIterative({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      terminal_result: null,
      counters,
      ...safety,
    });
  }

  let captured: AcceptedSnapshot | RejectedSnapshot;
  try {
    captured = immutableSnapshot(input, counters);
  } catch {
    captured = {
      snapshot: null,
      input_domain: null,
      rejection: "arbitrary_object_input_rejected",
    };
  }
  const terminal = captured.rejection
    ? staticRejections[captured.rejection]
    : verifySnapshot(captured.snapshot, captured.input_domain, counters);
  return deepFreezeIterative({
    enabled: true as const,
    status: "completed" as const,
    terminal_result: terminal,
    counters,
    ...safety,
  });
}
