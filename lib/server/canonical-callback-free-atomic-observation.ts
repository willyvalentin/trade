import "server-only";

import { createHash as intrinsicCreateHash } from "node:crypto";
import { types as nodeTypes } from "node:util";

const intrinsicArrayIsArray = Array.isArray;
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
const intrinsicReflectApply = Reflect.apply;
const intrinsicReflectOwnKeys = Reflect.ownKeys;
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
const intrinsicTypedArrayIteratorNext = intrinsicObjectGetPrototypeOf(
  new Uint8Array().values(),
).next as (this: IterableIterator<number>) => IteratorResult<number>;
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

export const CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION =
  "canonical_callback_free_atomic_observation_v2" as const;
export const CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_READBACK_VERSION =
  "canonical_callback_free_atomic_observation_readback_v2" as const;
export const CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_MAX_INPUT_BYTES =
  65_536;
export const DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_ENABLED = false;
export const DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_KILL_SWITCH = true;
export const CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_TERMINALS =
  intrinsicObjectFreeze([
    "integrity_only",
    "malformed",
    "non_canonical",
    "digest_mismatch",
    "input_rejected",
  ] as const);
export const CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_ARTIFACT_ROLES =
  intrinsicObjectFreeze({
    "lib/server/canonical-callback-free-atomic-observation.ts":
      "implementation",
    "lib/server/canonical-callback-free-atomic-observation-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666cx-current-main-callback-free-atomic-observation.spec.ts":
      "focused_tests",
    "docs/action-666cx-current-main-callback-free-atomic-observation.md":
      "contract_documentation",
    "docs/action-666cx-golden-callback-free-atomic-observation-report.json":
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

export type CanonicalCallbackFreeAtomicObservationCounters = {
  input_snapshot_attempts: number;
  input_snapshots: number;
  input_byte_reads: number;
  parse_operations: number;
  digest_operations: number;
};

export type CanonicalCallbackFreeAtomicObservationEnvelope = {
  envelope_version:
    | "canonical_integrity_provenance_separated_observation_envelope_v2";
  authority_version:
    | "canonical_integrity_provenance_separated_observation_authority_v2";
  integrity_verified: true;
  provenance_verified: false;
  authority_status: "integrity_only";
  trusted: false;
  admitted: false;
  capsule_exposed: false;
  source_result_version:
    | "canonical_private_atomic_observation_result_v2";
  source_result_digest: string;
  source_evidence_version:
    | "canonical_private_atomic_observation_evidence_v2";
  source_evidence_digest: string;
  primitive_type: "bigint" | "number" | "string" | "boolean" | "null" | "undefined";
  primitive_value_digest: string;
  primitive_observation_digest: string;
  content_identity_claimed: true;
  envelope_digest_algorithm: "sha256_canonical_json_v1";
  envelope_digest: string;
} & typeof safety;

export type CanonicalCallbackFreeAtomicObservationTerminal = {
  readback_version: typeof CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_READBACK_VERSION;
  boundary_version: typeof CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION;
  terminal_status:
    | "integrity_only"
    | "malformed"
    | "non_canonical"
    | "digest_mismatch"
    | "input_rejected";
  envelope: CanonicalCallbackFreeAtomicObservationEnvelope | null;
  integrity_verified: boolean;
  provenance_verified: false;
  authority_status: "integrity_only" | "none";
  trusted: false;
  admitted: false;
  content_identity_claimed: boolean;
  captured_input_digest: string | null;
  observed_envelope_digest: string | null;
  rebuilt_envelope_digest: string | null;
  reason_codes: string[];
  terminal_identity: string;
  failure_identity: string | null;
  terminal_digest_algorithm: "sha256_canonical_json_v1";
  terminal_digest: string;
} & typeof safety;

export type CanonicalCallbackFreeAtomicObservationExecution = {
  execution_version: typeof CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION;
  enabled: boolean;
  status: "disabled" | "kill_switch_engaged" | "completed";
  terminal_result: CanonicalCallbackFreeAtomicObservationTerminal | null;
  counters: CanonicalCallbackFreeAtomicObservationCounters;
} & typeof safety;

type CapturedInput =
  | {
      value: string;
      bytes: Uint8Array;
      rejection: null;
    }
  | {
      value: null;
      bytes: null;
      rejection:
        | "function_valued_input_rejected"
        | "arbitrary_object_input_rejected"
        | "uint8array_subclass_rejected"
        | "readback_bytes_invalid"
        | "readback_too_large";
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
      const key = keys[index];
      const descriptor = intrinsicObjectGetOwnPropertyDescriptor(current, key);
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

function emptyCounters(): CanonicalCallbackFreeAtomicObservationCounters {
  return {
    input_snapshot_attempts: 0,
    input_snapshots: 0,
    input_byte_reads: 0,
    parse_operations: 0,
    digest_operations: 0,
  };
}

function countersSnapshot(
  counters: CanonicalCallbackFreeAtomicObservationCounters,
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
  counters: CanonicalCallbackFreeAtomicObservationCounters,
) {
  counters.digest_operations += 1;
  return sha256(intrinsicJsonStringify(value));
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
): value is CanonicalCallbackFreeAtomicObservationEnvelope["primitive_type"] {
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
      if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
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

function captureInput(
  input: unknown,
  counters: CanonicalCallbackFreeAtomicObservationCounters,
): CapturedInput {
  if (typeof input === "function") {
    return { value: null, bytes: null, rejection: "function_valued_input_rejected" };
  }
  if (typeof input === "string") {
    counters.input_snapshot_attempts += 1;
    if (
      input.length >
      CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_MAX_INPUT_BYTES
    ) {
      return { value: null, bytes: null, rejection: "readback_too_large" };
    }
    const bytes = intrinsicReflectApply(intrinsicTextEncoderEncode, textEncoder, [
      input,
    ]) as Uint8Array;
    const byteLength = intrinsicReflectApply(
      intrinsicTypedArrayByteLength,
      bytes,
      [],
    ) as number;
    if (byteLength > CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_MAX_INPUT_BYTES) {
      return { value: null, bytes: null, rejection: "readback_too_large" };
    }
    counters.input_snapshots += 1;
    counters.input_byte_reads += byteLength;
    return {
      value: intrinsicReflectApply(intrinsicTextDecoderDecode, textDecoder, [
        bytes,
      ]) as string,
      bytes,
      rejection: null,
    };
  }
  if (input === null || typeof input !== "object") {
    return { value: null, bytes: null, rejection: "arbitrary_object_input_rejected" };
  }
  try {
    if (intrinsicNodeIsProxy(input) || !intrinsicNodeIsUint8Array(input)) {
      return { value: null, bytes: null, rejection: "arbitrary_object_input_rejected" };
    }
    if (intrinsicObjectGetPrototypeOf(input) !== intrinsicUint8ArrayPrototype) {
      return { value: null, bytes: null, rejection: "uint8array_subclass_rejected" };
    }
  } catch {
    return { value: null, bytes: null, rejection: "arbitrary_object_input_rejected" };
  }
  counters.input_snapshot_attempts += 1;
  const copied = safeArray<number>();
  try {
    const sourceByteLength = intrinsicReflectApply(
      intrinsicTypedArrayByteLength,
      input,
      [],
    ) as number;
    if (
      sourceByteLength >
      CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_MAX_INPUT_BYTES
    ) {
      return { value: null, bytes: null, rejection: "readback_too_large" };
    }
    const iterator = intrinsicReflectApply(intrinsicTypedArrayValues, input, []);
    while (true) {
      const step = intrinsicReflectApply(
        intrinsicTypedArrayIteratorNext,
        iterator,
        [],
      ) as IteratorResult<number>;
      if (step.done) break;
      if (copied.length >= CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_MAX_INPUT_BYTES) {
        return { value: null, bytes: null, rejection: "readback_too_large" };
      }
      arrayPush(copied, step.value);
    }
    const bytes = new IntrinsicUint8Array(copied.length);
    for (let index = 0; index < copied.length; index += 1) {
      bytes[index] = copied[index];
    }
    const byteLength = intrinsicReflectApply(
      intrinsicTypedArrayByteLength,
      bytes,
      [],
    ) as number;
    counters.input_snapshots += 1;
    counters.input_byte_reads += byteLength;
    const value = intrinsicReflectApply(intrinsicTextDecoderDecode, textDecoder, [
      bytes,
    ]) as string;
    return { value, bytes, rejection: null };
  } catch {
    return { value: null, bytes: null, rejection: "readback_bytes_invalid" };
  }
}

function terminalProjection(input: {
  terminal_status: CanonicalCallbackFreeAtomicObservationTerminal["terminal_status"];
  envelope: CanonicalCallbackFreeAtomicObservationEnvelope | null;
  integrity_verified: boolean;
  authority_status: "integrity_only" | "none";
  content_identity_claimed: boolean;
  captured_input_digest: string | null;
  observed_envelope_digest: string | null;
  rebuilt_envelope_digest: string | null;
  reason_codes: string[];
  terminal_identity: string;
  failure_identity: string | null;
}) {
  return {
    readback_version: CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_READBACK_VERSION,
    boundary_version: CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION,
    ...input,
    provenance_verified: false as const,
    trusted: false as const,
    admitted: false as const,
    terminal_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
}

function buildTerminal(
  input: {
    terminal_status: CanonicalCallbackFreeAtomicObservationTerminal["terminal_status"];
    envelope: CanonicalCallbackFreeAtomicObservationEnvelope | null;
    integrity_verified: boolean;
    authority_status: "integrity_only" | "none";
    content_identity_claimed: boolean;
    captured_input_digest: string | null;
    observed_envelope_digest: string | null;
    rebuilt_envelope_digest: string | null;
    reason_codes: string[];
  },
  counters: CanonicalCallbackFreeAtomicObservationCounters,
) {
  const terminalIdentity = digest(
    {
      readback_version:
        CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_READBACK_VERSION,
      boundary_version: CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION,
      terminal_status: input.terminal_status,
      captured_input_digest: input.captured_input_digest,
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
              CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_READBACK_VERSION,
            terminal_identity: terminalIdentity,
            reason_codes: input.reason_codes,
          },
          counters,
        );
  const projection = terminalProjection({
    ...input,
    terminal_identity: terminalIdentity,
    failure_identity: failureIdentity,
  });
  return deepFreeze({
    ...projection,
    terminal_digest: digest(projection, counters),
  });
}

function readback(
  input: unknown,
  counters: CanonicalCallbackFreeAtomicObservationCounters,
) {
  const captured = captureInput(input, counters);
  if (captured.rejection !== null) {
    return buildTerminal(
      {
        terminal_status: "input_rejected",
        envelope: null,
        integrity_verified: false,
        authority_status: "none",
        content_identity_claimed: false,
        captured_input_digest: null,
        observed_envelope_digest: null,
        rebuilt_envelope_digest: null,
        reason_codes: [captured.rejection],
      },
      counters,
    );
  }
  const capturedInputDigest = sha256(captured.bytes);
  counters.digest_operations += 1;
  let parsed: unknown;
  try {
    counters.parse_operations += 1;
    parsed = intrinsicJsonParse(captured.value) as unknown;
  } catch {
    return buildTerminal(
      {
        terminal_status: "malformed",
        envelope: null,
        integrity_verified: false,
        authority_status: "none",
        content_identity_claimed: false,
        captured_input_digest: capturedInputDigest,
        observed_envelope_digest: null,
        rebuilt_envelope_digest: null,
        reason_codes: ["canonical_json_malformed"],
      },
      counters,
    );
  }
  if (!exactEnvelope(parsed)) {
    return buildTerminal(
      {
        terminal_status: "non_canonical",
        envelope: null,
        integrity_verified: false,
        authority_status: "none",
        content_identity_claimed: false,
        captured_input_digest: capturedInputDigest,
        observed_envelope_digest: null,
        rebuilt_envelope_digest: null,
        reason_codes: ["canonical_envelope_schema_invalid"],
      },
      counters,
    );
  }
  const observedEnvelopeDigest = parsed.envelope_digest;
  const rebuiltEnvelopeDigest = digest(envelopeProjection(parsed), counters);
  if (serializeEnvelope(parsed) !== captured.value) {
    return buildTerminal(
      {
        terminal_status: "non_canonical",
        envelope: null,
        integrity_verified: false,
        authority_status: "none",
        content_identity_claimed: false,
        captured_input_digest: capturedInputDigest,
        observed_envelope_digest: observedEnvelopeDigest,
        rebuilt_envelope_digest: rebuiltEnvelopeDigest,
        reason_codes: ["canonical_json_non_canonical"],
      },
      counters,
    );
  }
  if (observedEnvelopeDigest !== rebuiltEnvelopeDigest) {
    return buildTerminal(
      {
        terminal_status: "digest_mismatch",
        envelope: null,
        integrity_verified: false,
        authority_status: "none",
        content_identity_claimed: false,
        captured_input_digest: capturedInputDigest,
        observed_envelope_digest: observedEnvelopeDigest,
        rebuilt_envelope_digest: rebuiltEnvelopeDigest,
        reason_codes: ["envelope_digest_mismatch"],
      },
      counters,
    );
  }
  return buildTerminal(
    {
      terminal_status: "integrity_only",
      envelope: deepFreeze(parsed),
      integrity_verified: true,
      authority_status: "integrity_only",
      content_identity_claimed: true,
      captured_input_digest: capturedInputDigest,
      observed_envelope_digest: observedEnvelopeDigest,
      rebuilt_envelope_digest: rebuiltEnvelopeDigest,
      reason_codes: [],
    },
    counters,
  );
}

function execution(
  enabled: boolean,
  status: CanonicalCallbackFreeAtomicObservationExecution["status"],
  terminalResult: CanonicalCallbackFreeAtomicObservationTerminal | null,
  counters: CanonicalCallbackFreeAtomicObservationCounters,
) {
  return deepFreeze({
    execution_version: CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION,
    enabled,
    status,
    terminal_result: terminalResult,
    counters: countersSnapshot(counters),
    ...safety,
  });
}

export function runCanonicalCallbackFreeAtomicObservation(
  input: unknown,
  enabled = DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_ENABLED,
  killSwitchEngaged = DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_KILL_SWITCH,
): CanonicalCallbackFreeAtomicObservationExecution {
  const counters = emptyCounters();
  if (enabled !== true) {
    return execution(false, "disabled", null, counters);
  }
  if (killSwitchEngaged !== false) {
    return execution(true, "kill_switch_engaged", null, counters);
  }
  try {
    return execution(true, "completed", readback(input, counters), counters);
  } catch {
    return execution(
      true,
      "completed",
      buildTerminal(
        {
          terminal_status: "input_rejected",
          envelope: null,
          integrity_verified: false,
          authority_status: "none",
          content_identity_claimed: false,
          captured_input_digest: null,
          observed_envelope_digest: null,
          rebuilt_envelope_digest: null,
          reason_codes: ["readback_execution_failed"],
        },
        counters,
      ),
      counters,
    );
  }
}
