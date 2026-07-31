import "server-only";

import {
  CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
  canonicalLosslessInvalidScalarIssuanceDigest,
  canonicalLosslessPrimitiveObservation,
  type CanonicalLosslessPrimitiveObservation,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";

export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION =
  "canonical_private_atomic_observation_authority_v1" as const;
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION =
  "canonical_private_atomic_observation_evidence_v1" as const;
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION =
  "canonical_private_atomic_observation_result_v1" as const;
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION =
  "canonical_private_atomic_observation_readback_v1" as const;
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES =
  65_536;
export const DEFAULT_OFF_PRIVATE_ATOMIC_OBSERVATION_ENABLED = false;
export const DEFAULT_OFF_PRIVATE_ATOMIC_OBSERVATION_KILL_SWITCH = true;
export const CANONICAL_PRIVATE_ATOMIC_OBSERVATION_ARTIFACT_ROLES =
  Object.freeze({
    "lib/server/canonical-private-atomic-observation-authority.ts":
      "implementation",
    "lib/server/canonical-private-atomic-observation-authority-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666cb-private-atomic-observation-authority.spec.ts":
      "focused_tests",
    "docs/action-666cb-private-atomic-observation-authority.md":
      "contract_documentation",
    "docs/action-666cb-golden-private-atomic-observation-report.json":
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

const jsonParse = JSON.parse;
const jsonStringify = JSON.stringify;
const objectIsFrozen = Object.isFrozen;
const reflectApply = Reflect.apply;
const typedArrayValues = Uint8Array.prototype.values;
const typedArrayIteratorNext = Object.getPrototypeOf(
  new Uint8Array().values(),
).next as (this: IterableIterator<number>) => IteratorResult<number>;
const weakMapGet = WeakMap.prototype.get;
const weakMapSet = WeakMap.prototype.set;
const textDecoder = new TextDecoder("utf-8", { fatal: true });
const textEncoder = new TextEncoder();

type PrivateCapsule = {
  capsule_version: "canonical_private_atomic_observation_capsule_v1";
  capsule_identity: string;
  observation: CanonicalLosslessPrimitiveObservation;
  capsule_digest_algorithm: "sha256_canonical_json_v1";
  capsule_digest: string;
};

type PrivateProvenance = {
  canonical_observation_bytes: string;
  canonical_observation_digest: string;
  capsule_digest: string;
};

const privateProvenance = new WeakMap<object, PrivateProvenance>();

export type CanonicalPrivateAtomicObservationCounters = {
  request_reads: number;
  capsule_mints: number;
  provenance_checks: number;
  capsule_property_reads: number;
  readback_reads: number;
  parse_operations: number;
  digest_operations: number;
};

export type CanonicalPrivateAtomicObservationEvidence = {
  evidence_version:
    typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION;
  authority_version:
    typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION;
  status: "verified";
  provenance_verified: true;
  capsule_exposed: false;
  capsule_identity: string;
  capsule_digest: string;
  primitive_observation_version:
    typeof CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION;
  primitive_type: CanonicalLosslessPrimitiveObservation["primitive_type"];
  primitive_value_digest: string | null;
  primitive_observation_digest: string;
  bounded_observation_digest: string;
  content_identity_claimed: boolean;
  reason_codes: string[];
  evidence_digest_algorithm: "sha256_canonical_json_v1";
  evidence_digest: string;
} & typeof safety;

export type CanonicalPrivateAtomicObservationResult = {
  result_version:
    typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION;
  status: "verified" | "rejected";
  evidence: CanonicalPrivateAtomicObservationEvidence | null;
  canonical_evidence_string: string | null;
  capsule_exposed: false;
  content_identity_claimed: boolean;
  reason_codes: string[];
  result_digest_algorithm: "sha256_canonical_json_v1";
  result_digest: string;
} & typeof safety;

export type CanonicalPrivateAtomicObservationReadback = {
  readback_version:
    typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION;
  status: "verified" | "rejected";
  evidence: CanonicalPrivateAtomicObservationEvidence | null;
  observed_input_digest: string | null;
  content_identity_claimed: boolean;
  reason_codes: string[];
  readback_digest_algorithm: "sha256_canonical_json_v1";
  readback_digest: string;
} & typeof safety;

function emptyCounters(): CanonicalPrivateAtomicObservationCounters {
  return {
    request_reads: 0,
    capsule_mints: 0,
    provenance_checks: 0,
    capsule_property_reads: 0,
    readback_reads: 0,
    parse_operations: 0,
    digest_operations: 0,
  };
}

function digest(
  value: unknown,
  counters?: CanonicalPrivateAtomicObservationCounters,
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
      Object.getOwnPropertyDescriptors(current),
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

function mintPrivateCapsule(
  value: unknown,
  counters?: CanonicalPrivateAtomicObservationCounters,
): PrivateCapsule | null {
  const observation = canonicalLosslessPrimitiveObservation(value);
  if (!observation) return null;
  if (counters) counters.capsule_mints += 1;
  const capsuleIdentity = digest(
    {
      capsule_version: "canonical_private_atomic_observation_capsule_v1",
      primitive_type: observation.primitive_type,
      primitive_value_digest: observation.value_digest,
      primitive_observation_digest: observation.observation_digest,
    },
    counters,
  );
  const projection = {
    capsule_version:
      "canonical_private_atomic_observation_capsule_v1" as const,
    capsule_identity: capsuleIdentity,
    observation,
    capsule_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const capsule = deepFreezeIterative({
    ...projection,
    capsule_digest: digest(projection, counters),
  });
  reflectApply(weakMapSet, privateProvenance, [
    capsule,
    {
      canonical_observation_bytes: jsonStringify(observation),
      canonical_observation_digest: observation.observation_digest,
      capsule_digest: capsule.capsule_digest,
    },
  ]);
  return capsule;
}

function verifyPrivateCapsule(
  capsule: PrivateCapsule,
  counters?: CanonicalPrivateAtomicObservationCounters,
): CanonicalPrivateAtomicObservationEvidence | null {
  if (counters) counters.provenance_checks += 1;
  const provenance = reflectApply(weakMapGet, privateProvenance, [
    capsule,
  ]) as PrivateProvenance | undefined;
  if (!provenance) return null;

  if (counters) counters.capsule_property_reads += 1;
  if (!objectIsFrozen(capsule) || !objectIsFrozen(capsule.observation)) {
    return null;
  }
  const rebuiltObservationBytes = jsonStringify(capsule.observation);
  const rebuiltCapsuleProjection = {
    capsule_version: capsule.capsule_version,
    capsule_identity: capsule.capsule_identity,
    observation: capsule.observation,
    capsule_digest_algorithm: capsule.capsule_digest_algorithm,
  };
  const rebuiltCapsuleDigest = digest(
    rebuiltCapsuleProjection,
    counters,
  );
  if (
    rebuiltObservationBytes !== provenance.canonical_observation_bytes ||
    capsule.observation.observation_digest !==
      provenance.canonical_observation_digest ||
    capsule.capsule_digest !== provenance.capsule_digest ||
    rebuiltCapsuleDigest !== provenance.capsule_digest
  ) {
    return null;
  }

  const projection = {
    evidence_version:
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION,
    authority_version:
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION,
    status: "verified" as const,
    provenance_verified: true as const,
    capsule_exposed: false as const,
    capsule_identity: capsule.capsule_identity,
    capsule_digest: capsule.capsule_digest,
    primitive_observation_version:
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
    primitive_type: capsule.observation.primitive_type,
    primitive_value_digest: capsule.observation.value_digest,
    primitive_observation_digest:
      capsule.observation.observation_digest,
    bounded_observation_digest:
      capsule.observation.bounded_observation_digest,
    content_identity_claimed:
      capsule.observation.full_value_identity_claimed,
    reason_codes: [...capsule.observation.reason_codes].sort(),
    evidence_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...projection,
    evidence_digest: digest(projection, counters),
  });
}

function rejectedAtomicResult(
  reason: "primitive_input_required" | "private_provenance_failed",
  counters?: CanonicalPrivateAtomicObservationCounters,
): CanonicalPrivateAtomicObservationResult {
  const projection = {
    result_version:
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION,
    status: "rejected" as const,
    evidence: null,
    canonical_evidence_string: null,
    capsule_exposed: false as const,
    content_identity_claimed: false,
    reason_codes: [reason],
    result_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...projection,
    result_digest: digest(projection, counters),
  });
}

export function observeCanonicalPrimitiveAtomically(
  value: unknown,
  counters?: CanonicalPrivateAtomicObservationCounters,
): CanonicalPrivateAtomicObservationResult {
  if (counters) counters.request_reads += 1;
  const capsule = mintPrivateCapsule(value, counters);
  if (!capsule) return rejectedAtomicResult("primitive_input_required", counters);
  const evidence = verifyPrivateCapsule(capsule, counters);
  if (!evidence) {
    return rejectedAtomicResult("private_provenance_failed", counters);
  }
  const canonicalEvidenceString = serializeCanonicalEvidence(evidence);
  const projection = {
    result_version:
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION,
    status: "verified" as const,
    evidence,
    canonical_evidence_string: canonicalEvidenceString,
    capsule_exposed: false as const,
    content_identity_claimed: evidence.content_identity_claimed,
    reason_codes: [] as string[],
    result_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...projection,
    result_digest: digest(projection, counters),
  });
}

const evidenceSerializationKeys = [
  "evidence_version",
  "authority_version",
  "status",
  "provenance_verified",
  "capsule_exposed",
  "capsule_identity",
  "capsule_digest",
  "primitive_observation_version",
  "primitive_type",
  "primitive_value_digest",
  "primitive_observation_digest",
  "bounded_observation_digest",
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
const evidenceKeys = [...evidenceSerializationKeys].sort();

function serializeCanonicalEvidence(
  evidence: CanonicalPrivateAtomicObservationEvidence,
) {
  const record = evidence as unknown as Record<string, unknown>;
  return jsonStringify(
    Object.fromEntries(
      evidenceSerializationKeys.map((key) => [key, record[key]]),
    ),
  );
}

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
const sha256Pattern = /^[a-f0-9]{64}$/;

function exactEvidence(
  value: unknown,
): value is CanonicalPrivateAtomicObservationEvidence {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).sort().join("\0") !== evidenceKeys.join("\0") ||
    record.evidence_version !==
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION ||
    record.authority_version !==
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION ||
    record.status !== "verified" ||
    record.provenance_verified !== true ||
    record.capsule_exposed !== false ||
    record.primitive_observation_version !==
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION ||
    typeof record.primitive_type !== "string" ||
    !primitiveTypes.has(record.primitive_type) ||
    typeof record.capsule_identity !== "string" ||
    !sha256Pattern.test(record.capsule_identity) ||
    typeof record.capsule_digest !== "string" ||
    !sha256Pattern.test(record.capsule_digest) ||
    typeof record.primitive_observation_digest !== "string" ||
    !sha256Pattern.test(record.primitive_observation_digest) ||
    typeof record.bounded_observation_digest !== "string" ||
    !sha256Pattern.test(record.bounded_observation_digest) ||
    (record.primitive_value_digest !== null &&
      (typeof record.primitive_value_digest !== "string" ||
        !sha256Pattern.test(record.primitive_value_digest))) ||
    typeof record.content_identity_claimed !== "boolean" ||
    !Array.isArray(record.reason_codes) ||
    !record.reason_codes.every((reason) => typeof reason === "string") ||
    record.evidence_digest_algorithm !== "sha256_canonical_json_v1" ||
    typeof record.evidence_digest !== "string" ||
    !sha256Pattern.test(record.evidence_digest)
  ) {
    return false;
  }
  for (const [key, expected] of Object.entries(safety)) {
    if (record[key] !== expected) return false;
  }
  const { evidence_digest: observedDigest, ...projection } = record;
  return digest(projection) === observedDigest;
}

function canonicalInputString(input: unknown): {
  value: string | null;
  reason:
    | "arbitrary_object_readback_rejected"
    | "readback_bytes_invalid"
    | "readback_too_large"
    | null;
} {
  if (typeof input === "string") {
    if (
      textEncoder.encode(input).byteLength >
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES
    ) {
      return { value: null, reason: "readback_too_large" };
    }
    return { value: input, reason: null };
  }
  if (
    (typeof input !== "object" && typeof input !== "function") ||
    input === null
  ) {
    return { value: null, reason: "arbitrary_object_readback_rejected" };
  }
  let iterator: IterableIterator<number>;
  try {
    iterator = reflectApply(typedArrayValues, input, []);
  } catch {
    return { value: null, reason: "arbitrary_object_readback_rejected" };
  }
  const bytes: number[] = [];
  try {
    while (true) {
      const step = reflectApply(typedArrayIteratorNext, iterator, []);
      if (step.done) break;
      if (
        bytes.length >=
        CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES
      ) {
        return { value: null, reason: "readback_too_large" };
      }
      bytes.push(step.value);
    }
    return {
      value: textDecoder.decode(Uint8Array.from(bytes)),
      reason: null,
    };
  } catch {
    return { value: null, reason: "readback_bytes_invalid" };
  }
}

export function verifyCanonicalPrivateAtomicObservationReadback(
  input: unknown,
  counters?: CanonicalPrivateAtomicObservationCounters,
): CanonicalPrivateAtomicObservationReadback {
  if (counters) counters.readback_reads += 1;
  const canonicalInput = canonicalInputString(input);
  let evidence: CanonicalPrivateAtomicObservationEvidence | null = null;
  let reason: string | null = canonicalInput.reason;
  let observedInputDigest: string | null = null;
  if (canonicalInput.value !== null) {
    observedInputDigest = digest(
      {
        readback_version:
          CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION,
        canonical_string: canonicalInput.value,
      },
      counters,
    );
    try {
      if (counters) counters.parse_operations += 1;
      const parsed = jsonParse(canonicalInput.value) as unknown;
      if (
        !exactEvidence(parsed) ||
        serializeCanonicalEvidence(parsed) !== canonicalInput.value
      ) {
        reason = "canonical_evidence_invalid";
      } else {
        evidence = deepFreezeIterative(parsed);
      }
    } catch {
      reason = "canonical_evidence_parse_failed";
    }
  }
  const valid = evidence !== null && reason === null;
  const projection = {
    readback_version:
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION,
    status: valid ? ("verified" as const) : ("rejected" as const),
    evidence: valid ? evidence : null,
    observed_input_digest: observedInputDigest,
    content_identity_claimed: valid,
    reason_codes: valid ? [] : [reason!],
    readback_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...projection,
    readback_digest: digest(projection, counters),
  });
}

export function createCanonicalPrivateAtomicObservationHarness(
  input: {
    enabled?: boolean;
    kill_switch_engaged?: boolean;
    counters?: CanonicalPrivateAtomicObservationCounters;
  } = {},
) {
  const enabled =
    input.enabled ?? DEFAULT_OFF_PRIVATE_ATOMIC_OBSERVATION_ENABLED;
  const killSwitch =
    input.kill_switch_engaged ??
    DEFAULT_OFF_PRIVATE_ATOMIC_OBSERVATION_KILL_SWITCH;
  const counters = input.counters ?? emptyCounters();
  if (!enabled || killSwitch) {
    return deepFreezeIterative({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      observe: null,
      readback: null,
      counters,
      ...safety,
    });
  }
  return {
    enabled: true as const,
    status: "ready" as const,
    observe: (value: unknown) =>
      observeCanonicalPrimitiveAtomically(value, counters),
    readback: (value: unknown) =>
      verifyCanonicalPrivateAtomicObservationReadback(value, counters),
    counters,
    ...safety,
  };
}
