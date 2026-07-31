import "server-only";

import {
  canonicalNonForgeableBindingSnapshotIssuanceDigest,
  createCanonicalNonForgeableBindingSnapshotIssuanceHarness,
  verifyCanonicalNonForgeableBindingSnapshotIssuanceResult,
  type CanonicalNonForgeableBindingSnapshotIssuanceDependencies,
  type CanonicalNonForgeableBindingSnapshotIssuanceResult,
} from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance";

export const CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION =
  "canonical_lossless_invalid_scalar_observation_issuance_v3" as const;
export const CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION =
  "canonical_lossless_primitive_observation_v1" as const;
export const CANONICAL_LOSSLESS_PRIMITIVE_VALUE_DIGEST_VERSION =
  "canonical_lossless_primitive_value_digest_v1" as const;
export const CANONICAL_LOSSLESS_FAILURE_IDENTITY_VERSION =
  "canonical_lossless_invalid_scalar_failure_identity_v1" as const;
export const DEFAULT_OFF_LOSSLESS_INVALID_SCALAR_ISSUANCE_ENABLED = false;
export const DEFAULT_OFF_LOSSLESS_INVALID_SCALAR_ISSUANCE_KILL_SWITCH =
  true;
export const CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES = 65_536;
export const CANONICAL_LOSSLESS_INVALID_SCALAR_STATUSES = [
  "issued",
  "incomplete",
  "conflicting",
  "not_point_in_time_safe",
  "rollback_rejected",
] as const;
export const CANONICAL_LOSSLESS_PRIMITIVE_TYPE_TAGS = [
  "bigint",
  "number",
  "string",
  "boolean",
  "null",
  "undefined",
  "symbol",
  "function",
] as const;
export const CANONICAL_LOSSLESS_INVALID_SCALAR_ARTIFACT_ROLES =
  Object.freeze({
    "lib/server/canonical-lossless-invalid-scalar-observation-issuance.ts":
      "implementation",
    "lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666bx-lossless-invalid-scalar-observation.spec.ts":
      "focused_tests",
    "docs/action-666bx-lossless-invalid-scalar-observation.md":
      "contract_documentation",
    "docs/action-666bx-golden-lossless-invalid-scalar-observation-report.json":
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

const bigintToString = BigInt.prototype.toString;
const bigintAsUintN = BigInt.asUintN;
const numberToString = Number.prototype.toString;
const stringCharCodeAt = String.prototype.charCodeAt;
const stringPadStart = String.prototype.padStart;
const arrayJoin = Array.prototype.join;
const primitiveTypeTags = new Set<string>(
  CANONICAL_LOSSLESS_PRIMITIVE_TYPE_TAGS,
);

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
    | "signed_hexadecimal_magnitude_v1"
    | "ieee754_binary64_big_endian_hex_v1"
    | "utf16_code_units_big_endian_hex_v1"
    | "ascii_literal_v1"
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
  bounded_observation_digest: string;
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
  reason_codes: string[];
  issuance_digest_algorithm: "sha256_canonical_json_v1";
  issuance_digest: string;
} & typeof safety;

function counters(): CanonicalLosslessInvalidScalarCounters {
  return {
    request_reads: 0,
    primitive_observations: 0,
    primitive_value_digests: 0,
    predecessor_executions: 0,
    predecessor_rebuilds: 0,
    terminal_digests: 0,
  };
}

function deepFreezeIterative<T>(value: T): T {
  if (!value || typeof value !== "object") return value;
  const stack = [value as object];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    const descriptors = Object.getOwnPropertyDescriptors(current);
    for (const descriptor of Object.values(descriptors)) {
      if (
        "value" in descriptor &&
        descriptor.value &&
        typeof descriptor.value === "object"
      ) {
        stack.push(descriptor.value as object);
      }
    }
    Object.freeze(current);
  }
  return value;
}

function digest(value: unknown) {
  return canonicalNonForgeableBindingSnapshotIssuanceDigest(value);
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort();
}

function exactKeys(value: Record<string, unknown>, expected: string[]) {
  return (
    Object.keys(value).sort().join("\0") ===
    [...expected].sort().join("\0")
  );
}

function primitiveType(value: unknown): PrimitiveTypeTag | null {
  if (value === null) return "null";
  const type = typeof value;
  return primitiveTypeTags.has(type)
    ? (type as PrimitiveTypeTag)
    : null;
}

function utf16Hex(value: string) {
  const chunks = new Array<string>(value.length);
  for (let index = 0; index < value.length; index += 1) {
    const hexadecimal = numberToString.call(
      stringCharCodeAt.call(value, index),
      16,
    );
    chunks[index] = stringPadStart.call(hexadecimal, 4, "0");
  }
  return arrayJoin.call(chunks, "");
}

function numberHex(value: number) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, value, false);
  const chunks = Array.from(new Uint8Array(buffer), (entry) =>
    stringPadStart.call(numberToString.call(entry, 16), 2, "0")
  );
  return arrayJoin.call(chunks, "");
}

function representation(value: unknown, type: PrimitiveTypeTag) {
  switch (type) {
    case "bigint": {
      const candidate = value as bigint;
      const negative = candidate < BigInt(0);
      const magnitude = negative ? -candidate : candidate;
      const maxHexCharacters =
        CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES -
        (negative ? 1 : 0);
      const maxBits = maxHexCharacters * 4;
      if (bigintAsUintN(maxBits, magnitude) !== magnitude) {
        return {
          representation: null,
          canonicalValue: null,
          canonicalValueBytes: null,
          status: "budget_exceeded" as const,
          fullValueIdentityClaimed: false,
          reasons: ["primitive_observation_max_bytes_exceeded"],
        };
      }
      const magnitudeHex = bigintToString.call(magnitude, 16);
      const canonicalValue = `${negative ? "-" : "+"}${magnitudeHex}`;
      return {
        representation: "signed_hexadecimal_magnitude_v1" as const,
        canonicalValue,
        canonicalValueBytes: Buffer.byteLength(canonicalValue, "ascii"),
        status: "represented" as const,
        fullValueIdentityClaimed: true,
        reasons: [] as string[],
      };
    }
    case "number": {
      const canonicalValue = numberHex(value as number);
      return {
        representation:
          "ieee754_binary64_big_endian_hex_v1" as const,
        canonicalValue,
        canonicalValueBytes: canonicalValue.length,
        status: "represented" as const,
        fullValueIdentityClaimed: true,
        reasons: [] as string[],
      };
    }
    case "string": {
      const candidate = value as string;
      if (
        candidate.length >
        Math.floor(
          CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES / 4,
        )
      ) {
        return {
          representation: null,
          canonicalValue: null,
          canonicalValueBytes: null,
          status: "budget_exceeded" as const,
          fullValueIdentityClaimed: false,
          reasons: ["primitive_observation_max_bytes_exceeded"],
        };
      }
      const canonicalValue = utf16Hex(candidate);
      return {
        representation:
          "utf16_code_units_big_endian_hex_v1" as const,
        canonicalValue,
        canonicalValueBytes: canonicalValue.length,
        status: "represented" as const,
        fullValueIdentityClaimed: true,
        reasons: [] as string[],
      };
    }
    case "boolean":
      return {
        representation: "ascii_literal_v1" as const,
        canonicalValue: value === true ? "true" : "false",
        canonicalValueBytes: value === true ? 4 : 5,
        status: "represented" as const,
        fullValueIdentityClaimed: true,
        reasons: [] as string[],
      };
    case "null":
      return {
        representation: "ascii_literal_v1" as const,
        canonicalValue: "null",
        canonicalValueBytes: 4,
        status: "represented" as const,
        fullValueIdentityClaimed: true,
        reasons: [] as string[],
      };
    case "undefined":
      return {
        representation: "ascii_literal_v1" as const,
        canonicalValue: "undefined",
        canonicalValueBytes: 9,
        status: "represented" as const,
        fullValueIdentityClaimed: true,
        reasons: [] as string[],
      };
    case "symbol":
    case "function":
      return {
        representation: null,
        canonicalValue: null,
        canonicalValueBytes: null,
        status: "non_representable" as const,
        fullValueIdentityClaimed: false,
        reasons: ["primitive_content_identity_not_representable"],
      };
  }
}

export function canonicalLosslessPrimitiveObservation(
  value: unknown,
  observedCounters?: CanonicalLosslessInvalidScalarCounters,
): CanonicalLosslessPrimitiveObservation | null {
  const type = primitiveType(value);
  if (type === null) return null;
  if (observedCounters) observedCounters.primitive_observations += 1;
  const represented = representation(value, type);
  const valueDigest =
    represented.fullValueIdentityClaimed &&
    represented.canonicalValue !== null
      ? digest({
          value_digest_version:
            CANONICAL_LOSSLESS_PRIMITIVE_VALUE_DIGEST_VERSION,
          primitive_type: type,
          representation: represented.representation,
          canonical_value: represented.canonicalValue,
          canonical_value_bytes: represented.canonicalValueBytes,
        })
      : null;
  if (valueDigest !== null && observedCounters) {
    observedCounters.primitive_value_digests += 1;
  }
  const boundedProjection = {
    observation_version:
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
    observation_status: represented.status,
    primitive_type: type,
    representation: represented.representation,
    canonical_value_bytes: represented.canonicalValueBytes,
    max_canonical_value_bytes:
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES as
        typeof CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES,
    full_value_identity_claimed: represented.fullValueIdentityClaimed,
    value_digest_version:
      CANONICAL_LOSSLESS_PRIMITIVE_VALUE_DIGEST_VERSION,
    value_digest: valueDigest,
    reason_codes: uniqueSorted(represented.reasons),
  };
  const projection = {
    observation_version:
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
    observation_status: represented.status,
    primitive_type: type,
    representation: represented.representation,
    canonical_value: represented.canonicalValue,
    canonical_value_bytes: represented.canonicalValueBytes,
    max_canonical_value_bytes:
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES as
        typeof CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES,
    full_value_identity_claimed: represented.fullValueIdentityClaimed,
    value_digest_version:
      CANONICAL_LOSSLESS_PRIMITIVE_VALUE_DIGEST_VERSION,
    value_digest: valueDigest,
    reason_codes: uniqueSorted(represented.reasons),
    bounded_observation_digest: digest(boundedProjection),
    observation_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreezeIterative({
    ...projection,
    observation_digest: digest(projection),
  });
}

export function verifyCanonicalLosslessPrimitiveObservation(
  value: unknown,
  observation: unknown,
) {
  const expected = canonicalLosslessPrimitiveObservation(value);
  const valid =
    expected !== null &&
    typeof observation === "object" &&
    observation !== null &&
    !Array.isArray(observation) &&
    exactKeys(observation as Record<string, unknown>, [
      "observation_version",
      "observation_status",
      "primitive_type",
      "representation",
      "canonical_value",
      "canonical_value_bytes",
      "max_canonical_value_bytes",
      "full_value_identity_claimed",
      "value_digest_version",
      "value_digest",
      "reason_codes",
      "bounded_observation_digest",
      "observation_digest_algorithm",
      "observation_digest",
    ]) &&
    digest(expected) === digest(observation);
  return deepFreezeIterative({
    valid,
    canonical_observation: valid ? expected : null,
    reason_codes: valid
      ? []
      : ["lossless_primitive_observation_invalid"],
  });
}

function buildResult(input: {
  observation: CanonicalLosslessPrimitiveObservation | null;
  predecessor: CanonicalNonForgeableBindingSnapshotIssuanceResult;
  predecessorVerified: boolean;
  observedCounters: CanonicalLosslessInvalidScalarCounters;
}) {
  const failureIdentity =
    input.predecessor.status === "issued"
      ? null
      : digest({
          failure_identity_version:
            CANONICAL_LOSSLESS_FAILURE_IDENTITY_VERSION,
          primitive_observation_digest:
            input.observation?.observation_digest ?? null,
          primitive_full_value_identity_claimed:
            input.observation?.full_value_identity_claimed ?? false,
          predecessor_issuance_digest:
            input.predecessor.issuance_digest,
          predecessor_status: input.predecessor.status,
          predecessor_reason_codes: uniqueSorted(
            input.predecessor.reason_codes,
          ),
        });
  const projection = {
    issuance_version:
      CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION,
    status: input.predecessor.status as Status,
    primitive_observation: input.observation,
    primitive_observation_digest:
      input.observation?.observation_digest ?? null,
    predecessor_result: input.predecessor,
    predecessor_result_verified: input.predecessorVerified,
    predecessor_issuance_digest: input.predecessor.issuance_digest,
    failure_identity_version:
      CANONICAL_LOSSLESS_FAILURE_IDENTITY_VERSION,
    failure_identity_digest: failureIdentity,
    reason_codes: uniqueSorted([
      ...input.predecessor.reason_codes,
      ...(input.observation?.reason_codes ?? []),
      ...(input.observation
        ? ["lossless_primitive_observation_bound"]
        : []),
      ...(!input.predecessorVerified
        ? ["bv_predecessor_rebuild_failed"]
        : []),
    ]),
    issuance_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  input.observedCounters.terminal_digests += 1;
  return deepFreezeIterative({
    ...projection,
    issuance_digest: digest(projection),
  });
}

function execute(input: {
  request: unknown;
  dependencies: CanonicalNonForgeableBindingSnapshotIssuanceDependencies;
  observedCounters: CanonicalLosslessInvalidScalarCounters;
}) {
  input.observedCounters.request_reads += 1;
  const observation = canonicalLosslessPrimitiveObservation(
    input.request,
    input.observedCounters,
  );
  const predecessorHarness =
    createCanonicalNonForgeableBindingSnapshotIssuanceHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies: input.dependencies,
    });
  if (!predecessorHarness.issue) {
    throw new Error("bv_predecessor_harness_unavailable");
  }
  input.observedCounters.predecessor_executions += 1;
  const predecessor = predecessorHarness.issue(input.request);
  input.observedCounters.predecessor_rebuilds += 1;
  const predecessorVerification =
    verifyCanonicalNonForgeableBindingSnapshotIssuanceResult({
      request: input.request,
      result: predecessor,
      rebuild_dependencies: input.dependencies,
    });
  return buildResult({
    observation,
    predecessor,
    predecessorVerified: predecessorVerification.valid,
    observedCounters: input.observedCounters,
  });
}

export function createCanonicalLosslessInvalidScalarIssuanceHarness(
  input: {
    enabled?: boolean;
    kill_switch_engaged?: boolean;
    dependencies?: CanonicalNonForgeableBindingSnapshotIssuanceDependencies;
    counters?: CanonicalLosslessInvalidScalarCounters;
  } = {},
) {
  const enabled =
    input.enabled ??
    DEFAULT_OFF_LOSSLESS_INVALID_SCALAR_ISSUANCE_ENABLED;
  const killSwitch =
    input.kill_switch_engaged ??
    DEFAULT_OFF_LOSSLESS_INVALID_SCALAR_ISSUANCE_KILL_SWITCH;
  const observedCounters = input.counters ?? counters();
  if (!enabled || killSwitch) {
    return deepFreezeIterative({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      issue: null,
      counters: observedCounters,
      ...safety,
    });
  }
  if (!input.dependencies) {
    return deepFreezeIterative({
      enabled: true as const,
      status: "unavailable" as const,
      issue: null,
      counters: observedCounters,
      reason_codes: ["lossless_scalar_dependencies_missing"],
      ...safety,
    });
  }
  const dependencies = input.dependencies;
  return {
    enabled: true as const,
    status: "ready" as const,
    issue: (request: unknown) =>
      execute({
        request,
        dependencies,
        observedCounters,
      }),
    counters: observedCounters,
    ...safety,
  };
}

export function verifyCanonicalLosslessInvalidScalarIssuanceResult(
  input: {
    request: unknown;
    result: CanonicalLosslessInvalidScalarIssuanceResult;
    rebuild_dependencies:
      CanonicalNonForgeableBindingSnapshotIssuanceDependencies;
  },
) {
  const harness = createCanonicalLosslessInvalidScalarIssuanceHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies: input.rebuild_dependencies,
  });
  if (!harness.issue) {
    return deepFreezeIterative({
      valid: false,
      canonical_result: null,
      reason_codes: ["lossless_scalar_rebuild_unavailable"],
    });
  }
  const canonicalResult = harness.issue(input.request);
  const valid =
    canonicalResult.issuance_digest === input.result.issuance_digest &&
    digest(canonicalResult) === digest(input.result);
  return deepFreezeIterative({
    valid,
    canonical_result: valid ? canonicalResult : null,
    reason_codes: valid
      ? []
      : ["lossless_scalar_result_tampered"],
  });
}

export function canonicalLosslessInvalidScalarIssuanceDigest(
  value: unknown,
) {
  return digest(value);
}
