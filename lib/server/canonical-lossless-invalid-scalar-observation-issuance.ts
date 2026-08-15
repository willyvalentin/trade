import "server-only";

import { createHash } from "node:crypto";
import {
  isDeepStrictEqual as intrinsicIsDeepStrictEqual,
  types as nodeTypes,
} from "node:util";

import {
  canonicalNonForgeableBindingSnapshotIssuanceDigest,
  createCanonicalNonForgeableBindingSnapshotIssuanceHarness,
  verifyCanonicalNonForgeableBindingSnapshotIssuanceResult,
  type CanonicalNonForgeableBindingSnapshotIssuanceDependencies,
  type CanonicalNonForgeableBindingSnapshotIssuanceResult,
} from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance";
import { validateCanonicalBoundedSnapshotPayload } from "@/lib/server/canonical-governed-binding-snapshot-admission";

const intrinsicObjectFreeze = Object.freeze;
const intrinsicObjectGetOwnPropertyDescriptor =
  Object.getOwnPropertyDescriptor;
const intrinsicObjectGetPrototypeOf = Object.getPrototypeOf;
const intrinsicObjectPrototype = Object.prototype;
const intrinsicReflectApply = Reflect.apply;
const intrinsicReflectOwnKeys = Reflect.ownKeys;
const intrinsicNodeIsProxy = nodeTypes.isProxy;
const intrinsicString = String;
const intrinsicArrayIsArray = Array.isArray;
const intrinsicArrayPop = Array.prototype.pop;
const intrinsicArrayPush = Array.prototype.push;
const intrinsicArraySort = Array.prototype.sort;
const intrinsicArrayJoin = Array.prototype.join;
const intrinsicStringCharCodeAt = String.prototype.charCodeAt;
const intrinsicStringPadStart = String.prototype.padStart;
const intrinsicBigIntToString = BigInt.prototype.toString;
const intrinsicBigInt = BigInt;
const intrinsicNumberToString = Number.prototype.toString;
const intrinsicDataViewSetFloat64 = DataView.prototype.setFloat64;
const intrinsicDataViewGetUint8 = DataView.prototype.getUint8;
const intrinsicHashUpdate = createHash("sha256").update;
const intrinsicHashDigest = createHash("sha256").digest;
const IntrinsicArray = Array;
const IntrinsicArrayBuffer = ArrayBuffer;
const IntrinsicDataView = DataView;
const IntrinsicWeakMap = WeakMap;
const intrinsicWeakMapGet = WeakMap.prototype.get;
const intrinsicWeakMapSet = WeakMap.prototype.set;

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

function arrayJoin(values: readonly string[], separator: string) {
  return intrinsicReflectApply(intrinsicArrayJoin, values, [
    separator,
  ]) as string;
}

function copyArrayValues<T>(values: readonly T[]) {
  const copied = new IntrinsicArray<T>();
  for (let index = 0; index < values.length; index += 1) {
    arrayPush(copied, values[index]);
  }
  return copied;
}

function stringArrayContains(values: readonly string[], expected: string) {
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === expected) return true;
  }
  return false;
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

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  const pending: object[] = [value];
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

function digest(value: unknown) {
  return canonicalNonForgeableBindingSnapshotIssuanceDigest(value);
}

function rawDigest(value: string) {
  const hash = createHash("sha256");
  intrinsicReflectApply(intrinsicHashUpdate, hash, [value]);
  return intrinsicReflectApply(intrinsicHashDigest, hash, ["hex"]) as string;
}

export const CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION =
  "canonical_lossless_invalid_scalar_observation_issuance_v4" as const;
export const CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION =
  "canonical_lossless_primitive_observation_v2" as const;
export const CANONICAL_LOSSLESS_PRIMITIVE_VALUE_DIGEST_VERSION =
  "canonical_lossless_primitive_value_digest_v2" as const;
export const CANONICAL_LOSSLESS_FAILURE_IDENTITY_VERSION =
  "canonical_lossless_invalid_scalar_failure_identity_v2" as const;
export const DEFAULT_OFF_LOSSLESS_INVALID_SCALAR_ISSUANCE_ENABLED = false;
export const DEFAULT_OFF_LOSSLESS_INVALID_SCALAR_ISSUANCE_KILL_SWITCH = true;
export const CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES = 65_536;
export const CANONICAL_LOSSLESS_INVALID_SCALAR_STATUSES =
  intrinsicObjectFreeze([
    "issued",
    "incomplete",
    "conflicting",
    "not_point_in_time_safe",
    "rollback_rejected",
  ] as const);
export const CANONICAL_LOSSLESS_PRIMITIVE_TYPE_TAGS = intrinsicObjectFreeze([
  "bigint",
  "number",
  "string",
  "boolean",
  "null",
  "undefined",
  "symbol",
  "function",
] as const);
export const CANONICAL_LOSSLESS_INVALID_SCALAR_ARTIFACT_ROLES =
  intrinsicObjectFreeze({
    "lib/server/canonical-lossless-invalid-scalar-observation-issuance.ts":
      "implementation",
    "lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666ct-current-main-lossless-invalid-scalar-observation.spec.ts":
      "focused_tests",
    "docs/action-666ct-current-main-lossless-invalid-scalar-observation.md":
      "contract_documentation",
    "docs/action-666ct-golden-lossless-invalid-scalar-observation-report.json":
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

type Status =
  (typeof CANONICAL_LOSSLESS_INVALID_SCALAR_STATUSES)[number];
type PrimitiveTypeTag =
  (typeof CANONICAL_LOSSLESS_PRIMITIVE_TYPE_TAGS)[number];
type ObservationStatus =
  | "represented"
  | "budget_exceeded"
  | "non_representable";

export type CanonicalLosslessInvalidScalarCounters = {
  request_reads: number;
  primitive_observations: number;
  primitive_value_digests: number;
  predecessor_executions: number;
  predecessor_rebuilds: number;
  terminal_digests: number;
};

export type CanonicalLosslessPrimitiveObservation = {
  observation_version:
    typeof CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION;
  observation_status: ObservationStatus;
  primitive_type: PrimitiveTypeTag;
  representation:
    | "signed_hexadecimal_magnitude_v2"
    | "ieee754_binary64_big_endian_hex_v2"
    | "utf16_code_units_big_endian_hex_v2"
    | "ascii_literal_v2"
    | null;
  canonical_value: string | null;
  canonical_value_bytes: number | null;
  max_canonical_value_bytes:
    typeof CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES;
  full_value_identity_claimed: boolean;
  value_digest_version:
    typeof CANONICAL_LOSSLESS_PRIMITIVE_VALUE_DIGEST_VERSION;
  value_digest: string | null;
  reason_codes: string[];
  bounded_classification_digest: string;
  observation_digest_algorithm: "sha256_canonical_json_v1";
  observation_digest: string;
};

export type CanonicalLosslessInvalidScalarIssuanceResult = {
  issuance_version:
    typeof CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION;
  status: Status;
  primitive_observation: CanonicalLosslessPrimitiveObservation | null;
  primitive_observation_digest: string | null;
  predecessor_result: CanonicalNonForgeableBindingSnapshotIssuanceResult;
  predecessor_result_verified: boolean;
  predecessor_issuance_digest: string;
  failure_identity_version:
    typeof CANONICAL_LOSSLESS_FAILURE_IDENTITY_VERSION;
  failure_identity_digest: string | null;
  verifier_authority_granted: boolean;
  reason_codes: string[];
  issuance_digest_algorithm: "sha256_canonical_json_v1";
  issuance_digest: string;
} & typeof safety;

type PredecessorHarness = ReturnType<
  typeof createCanonicalNonForgeableBindingSnapshotIssuanceHarness
>;

type PrivateHarnessAuthority = {
  rebuild: (request: unknown) => CanonicalLosslessInvalidScalarIssuanceResult;
};

const harnessAuthorities =
  new IntrinsicWeakMap<object, PrivateHarnessAuthority | null>();

function emptyCounters(): CanonicalLosslessInvalidScalarCounters {
  return {
    request_reads: 0,
    primitive_observations: 0,
    primitive_value_digests: 0,
    predecessor_executions: 0,
    predecessor_rebuilds: 0,
    terminal_digests: 0,
  };
}

function countersSnapshot(counters: CanonicalLosslessInvalidScalarCounters) {
  return deepFreeze({
    request_reads: counters.request_reads,
    primitive_observations: counters.primitive_observations,
    primitive_value_digests: counters.primitive_value_digests,
    predecessor_executions: counters.predecessor_executions,
    predecessor_rebuilds: counters.predecessor_rebuilds,
    terminal_digests: counters.terminal_digests,
  });
}

function primitiveType(value: unknown): PrimitiveTypeTag | null {
  if (value === null) return "null";
  switch (typeof value) {
    case "bigint":
      return "bigint";
    case "number":
      return "number";
    case "string":
      return "string";
    case "boolean":
      return "boolean";
    case "undefined":
      return "undefined";
    case "symbol":
      return "symbol";
    case "function":
      return "function";
    default:
      return null;
  }
}

function paddedHex(value: number, width: number) {
  const raw = intrinsicReflectApply(intrinsicNumberToString, value, [
    16,
  ]) as string;
  return intrinsicReflectApply(intrinsicStringPadStart, raw, [
    width,
    "0",
  ]) as string;
}

function numberHex(value: number) {
  if (value !== value) return "7ff8000000000000";
  const view = new IntrinsicDataView(new IntrinsicArrayBuffer(8));
  intrinsicReflectApply(intrinsicDataViewSetFloat64, view, [0, value, false]);
  const chunks = new IntrinsicArray<string>(8);
  for (let index = 0; index < 8; index += 1) {
    chunks[index] = paddedHex(
      intrinsicReflectApply(intrinsicDataViewGetUint8, view, [index]) as number,
      2,
    );
  }
  return arrayJoin(chunks, "");
}

function stringHex(value: string) {
  const chunks = new IntrinsicArray<string>(value.length);
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = intrinsicReflectApply(
      intrinsicStringCharCodeAt,
      value,
      [index],
    ) as number;
    chunks[index] = paddedHex(codeUnit, 4);
  }
  return arrayJoin(chunks, "");
}

function classification(input: {
  primitive_type: PrimitiveTypeTag;
  observation_status: ObservationStatus;
  representation: CanonicalLosslessPrimitiveObservation["representation"];
  canonical_value_bytes: number | null;
  full_value_identity_claimed: boolean;
  reason_codes: string[];
}) {
  return {
    classification_version:
      "canonical_lossless_primitive_bounded_classification_v2" as const,
    primitive_type: input.primitive_type,
    observation_status: input.observation_status,
    representation: input.representation,
    canonical_value_bytes: input.canonical_value_bytes,
    maximum_canonical_value_bytes:
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES,
    full_value_identity_claimed: input.full_value_identity_claimed,
    reason_codes: input.reason_codes,
  };
}

function primitiveObservation(
  value: unknown,
  counters: CanonicalLosslessInvalidScalarCounters,
): CanonicalLosslessPrimitiveObservation | null {
  const type = primitiveType(value);
  if (!type) return null;
  counters.primitive_observations += 1;
  let representation:
    | CanonicalLosslessPrimitiveObservation["representation"] = null;
  let canonicalValue: string | null = null;
  let canonicalValueBytes: number | null = null;
  let observationStatus: ObservationStatus = "represented";
  let fullValueIdentityClaimed = true;
  let reasonCodes: string[] = [];

  if (type === "bigint") {
    const bigintValue = value as bigint;
    const negative = bigintValue < intrinsicBigInt(0);
    const maximumHexCharacters =
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES - 1;
    const maximumBits = maximumHexCharacters * 4;
    const magnitudeExclusiveLimit =
      intrinsicBigInt(1) << intrinsicBigInt(maximumBits);
    if (
      (negative && bigintValue <= -magnitudeExclusiveLimit) ||
      (!negative && bigintValue >= magnitudeExclusiveLimit)
    ) {
      observationStatus = "budget_exceeded";
      fullValueIdentityClaimed = false;
      reasonCodes = ["lossless_primitive_observation_max_bytes_exceeded"];
    } else {
      const magnitude = negative ? -bigintValue : bigintValue;
      const magnitudeHex = intrinsicReflectApply(
        intrinsicBigIntToString,
        magnitude,
        [16],
      ) as string;
      representation = "signed_hexadecimal_magnitude_v2";
      canonicalValue = `${negative ? "-" : "+"}${magnitudeHex}`;
      canonicalValueBytes = canonicalValue.length;
    }
  } else if (type === "number") {
    representation = "ieee754_binary64_big_endian_hex_v2";
    canonicalValue = numberHex(value as number);
    canonicalValueBytes = canonicalValue.length;
  } else if (type === "string") {
    if (
      (value as string).length >
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES / 4
    ) {
      observationStatus = "budget_exceeded";
      fullValueIdentityClaimed = false;
      reasonCodes = ["lossless_primitive_observation_max_bytes_exceeded"];
    } else {
      representation = "utf16_code_units_big_endian_hex_v2";
      canonicalValue = stringHex(value as string);
      canonicalValueBytes = canonicalValue.length;
    }
  } else if (type === "boolean") {
    representation = "ascii_literal_v2";
    canonicalValue = value === true ? "true" : "false";
    canonicalValueBytes = canonicalValue.length;
  } else if (type === "null") {
    representation = "ascii_literal_v2";
    canonicalValue = "null";
    canonicalValueBytes = 4;
  } else if (type === "undefined") {
    representation = "ascii_literal_v2";
    canonicalValue = "undefined";
    canonicalValueBytes = 9;
  } else {
    observationStatus = "non_representable";
    fullValueIdentityClaimed = false;
    reasonCodes = ["lossless_primitive_type_not_representable"];
  }

  const boundedClassification = classification({
    primitive_type: type,
    observation_status: observationStatus,
    representation,
    canonical_value_bytes: canonicalValueBytes,
    full_value_identity_claimed: fullValueIdentityClaimed,
    reason_codes: reasonCodes,
  });
  const boundedClassificationDigest = digest(boundedClassification);
  const valueDigest = fullValueIdentityClaimed
    ? digest({
        value_digest_version:
          CANONICAL_LOSSLESS_PRIMITIVE_VALUE_DIGEST_VERSION,
        primitive_type: type,
        representation,
        canonical_value: canonicalValue,
      })
    : null;
  if (valueDigest) counters.primitive_value_digests += 1;
  const projection = {
    observation_version: CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
    observation_status: observationStatus,
    primitive_type: type,
    representation,
    canonical_value: canonicalValue,
    canonical_value_bytes: canonicalValueBytes,
    max_canonical_value_bytes:
      65_536 as const,
    full_value_identity_claimed: fullValueIdentityClaimed,
    value_digest_version:
      CANONICAL_LOSSLESS_PRIMITIVE_VALUE_DIGEST_VERSION,
    value_digest: valueDigest,
    reason_codes: reasonCodes,
    bounded_classification_digest: boundedClassificationDigest,
    observation_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...projection,
    observation_digest: digest(projection),
  });
}

function terminalResult(input: {
  observation: CanonicalLosslessPrimitiveObservation | null;
  predecessor: CanonicalNonForgeableBindingSnapshotIssuanceResult;
  predecessorVerified: boolean;
  predecessorVerificationReasonCodes: string[];
  counters: CanonicalLosslessInvalidScalarCounters;
}) {
  const representedPrimitive =
    input.observation?.observation_status === "represented" &&
    input.observation.full_value_identity_claimed &&
    !!input.observation.value_digest;
  const predecessorRejectedPrimitive =
    representedPrimitive &&
    input.predecessor.request_observation.status !== "valid" &&
    !input.predecessorVerified &&
    !stringArrayContains(
      input.predecessor.reason_codes,
      "non_forgeable_internal_execution_failed",
    ) &&
    input.predecessorVerificationReasonCodes.length === 1 &&
    input.predecessorVerificationReasonCodes[0] ===
      "non_forgeable_invalid_request_not_authoritative";
  const validObject = !input.observation && input.predecessorVerified;
  const verifierAuthorityGranted = predecessorRejectedPrimitive || validObject;
  const failureIdentity = predecessorRejectedPrimitive
    ? {
        failure_identity_version:
          CANONICAL_LOSSLESS_FAILURE_IDENTITY_VERSION,
        primitive_type: input.observation!.primitive_type,
        primitive_value_digest: input.observation!.value_digest,
        primitive_observation_digest: input.observation!.observation_digest,
        predecessor_issuance_digest: input.predecessor.issuance_digest,
        predecessor_status: input.predecessor.status,
        predecessor_request_observation_status:
          input.predecessor.request_observation.status,
        predecessor_reason_codes: input.predecessor.reason_codes,
        terminal_reason_code:
          "lossless_invalid_scalar_observation_authoritatively_bound" as const,
      }
    : null;
  const failureIdentityDigest = failureIdentity ? digest(failureIdentity) : null;
  const reasons = copyArrayValues(input.predecessor.reason_codes);
  if (input.observation) {
    if (representedPrimitive) {
      arrayPush(
        reasons,
        "lossless_invalid_scalar_observation_authoritatively_bound",
      );
    } else {
      for (
        let index = 0;
        index < input.observation.reason_codes.length;
        index += 1
      ) {
        arrayPush(reasons, input.observation.reason_codes[index]);
      }
    }
  }
  const payload = {
    issuance_version: CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION,
    status: input.predecessor.status,
    primitive_observation: input.observation,
    primitive_observation_digest: input.observation?.observation_digest ?? null,
    predecessor_result: input.predecessor,
    predecessor_result_verified: input.predecessorVerified,
    predecessor_issuance_digest: input.predecessor.issuance_digest,
    failure_identity_version: CANONICAL_LOSSLESS_FAILURE_IDENTITY_VERSION,
    failure_identity_digest: failureIdentityDigest,
    verifier_authority_granted: verifierAuthorityGranted,
    reason_codes: reasons,
    issuance_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  input.counters.terminal_digests += 1;
  return deepFreeze({ ...payload, issuance_digest: digest(payload) });
}

function execute(input: {
  request: unknown;
  predecessorHarness: PredecessorHarness;
  counters: CanonicalLosslessInvalidScalarCounters;
}) {
  input.counters.request_reads += 1;
  const observation = primitiveObservation(input.request, input.counters);
  input.counters.predecessor_executions += 1;
  const predecessor = input.predecessorHarness.issue!(input.request);
  input.counters.predecessor_rebuilds += 1;
  const verification = verifyCanonicalNonForgeableBindingSnapshotIssuanceResult({
    request: input.request,
    result: predecessor,
    harness: input.predecessorHarness,
  });
  return terminalResult({
    observation,
    predecessor,
    predecessorVerified: verification.valid,
    predecessorVerificationReasonCodes: verification.reason_codes,
    counters: input.counters,
  });
}

function internalFailure(counters: CanonicalLosslessInvalidScalarCounters) {
  const predecessor = {
    issuance_version:
      "canonical_non_forgeable_binding_snapshot_issuance_v3",
    status: "incomplete",
    issuance_identity: null,
    request_digest: rawDigest(
      "canonical_lossless_invalid_scalar_internal_failure_v4",
    ),
    request_observation: {
      observation_version: "canonical_non_forgeable_request_observation_v3",
      status: "schema_invalid",
      reason_codes: ["lossless_internal_execution_failed"],
      first_rejected_path: null,
      observed_depth: 0,
      observed_nodes: 0,
      observed_own_keys: 0,
      observed_array_length: null,
      observed_string_bytes: null,
      observed_total_string_bytes: 0,
      request_digest: rawDigest(
        "canonical_lossless_invalid_scalar_internal_request_failure_v4",
      ),
      nested_schema_digest: null,
      semantic_scope_digest: null,
      observation_digest_algorithm: "sha256_canonical_json_v1",
      observation_digest: rawDigest(
        "canonical_lossless_invalid_scalar_internal_observation_failure_v4",
      ),
    },
    nested_schema_version: "canonical_non_forgeable_nested_request_schema_v3",
    nested_schema_closed: false,
    semantic_scope_digest: null,
    authority_session_identity: null,
    authority_payload_digest: null,
    authority_envelope_digest: null,
    authority_identity: null,
    authority_digest: null,
    authority_root_digest: null,
    authority_signature_verified: false,
    authority_pins_verified: false,
    runtime_provenance_verified: false,
    predecessor_result: null,
    predecessor_result_verified: false,
    reason_codes: ["lossless_internal_execution_failed"],
    issuance_digest_algorithm: "sha256_canonical_json_v1",
    issuance_digest: rawDigest(
      "canonical_lossless_invalid_scalar_internal_issuance_failure_v4",
    ),
    ...safety,
  } as CanonicalNonForgeableBindingSnapshotIssuanceResult;
  return terminalResult({
    observation: null,
    predecessor: deepFreeze(predecessor),
    predecessorVerified: false,
    predecessorVerificationReasonCodes: [],
    counters,
  });
}

export function createCanonicalLosslessInvalidScalarObservationHarness(
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
        return countersSnapshot(counters);
      },
    });
    weakMapSet(harnessAuthorities, harness, authority);
    return harness;
  };
  let options: Record<string, unknown> | null = null;
  try {
    options =
      isRecord(input) &&
      exactDataKeys(input, ["dependencies", "enabled", "kill_switch_engaged"])
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
  if (!dependencies.present) {
    return publish(
      {
        enabled: true as const,
        status: "unavailable" as const,
        issue: null,
        reason_codes: ["lossless_dependencies_invalid"],
        ...safety,
      },
      null,
    );
  }
  const predecessorHarness =
    createCanonicalNonForgeableBindingSnapshotIssuanceHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies:
        dependencies.value as CanonicalNonForgeableBindingSnapshotIssuanceDependencies,
    });
  if (!predecessorHarness.issue) {
    return publish(
      {
        enabled: true as const,
        status: "unavailable" as const,
        issue: null,
        reason_codes: ["lossless_dependencies_invalid"],
        ...safety,
      },
      null,
    );
  }
  const run = (
    request: unknown,
    runCounters: CanonicalLosslessInvalidScalarCounters,
  ) => {
    try {
      return execute({ request, predecessorHarness, counters: runCounters });
    } catch {
      return internalFailure(runCounters);
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

export function verifyCanonicalLosslessInvalidScalarObservationResult(input: {
  request: unknown;
  result: CanonicalLosslessInvalidScalarIssuanceResult;
  harness: object;
}) {
  try {
    if (!isRecord(input) || !exactDataKeys(input, ["harness", "request", "result"])) {
      throw new Error("lossless_verifier_input_invalid");
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
      throw new Error("lossless_verifier_input_invalid");
    }
    const authority = weakMapGet(harnessAuthorities, harness.value);
    if (!authority) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: [
          authority === null
            ? "lossless_rebuild_unavailable"
            : "lossless_harness_unrecognized",
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
        reason_codes: ["lossless_result_not_bounded"],
      });
    }
    const canonical = authority.rebuild(request.value);
    if (!canonical.verifier_authority_granted) {
      return deepFreeze({
        valid: false,
        canonical_result: canonical,
        reason_codes: ["lossless_result_not_authoritative"],
      });
    }
    const valid = intrinsicIsDeepStrictEqual(canonical, provided.value);
    return deepFreeze({
      valid,
      canonical_result: canonical,
      reason_codes: valid ? [] : ["lossless_result_rebuild_mismatch"],
    });
  } catch {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["lossless_verifier_input_invalid"],
    });
  }
}

export function canonicalLosslessInvalidScalarObservationDigest(value: unknown) {
  if (validateCanonicalBoundedSnapshotPayload(value).status !== "valid") {
    throw new Error("lossless_digest_input_not_bounded");
  }
  return digest(value);
}
