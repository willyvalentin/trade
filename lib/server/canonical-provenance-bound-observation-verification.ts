import "server-only";

import {
  CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
  canonicalLosslessInvalidScalarIssuanceDigest,
  canonicalLosslessPrimitiveObservation,
  type CanonicalLosslessPrimitiveObservation,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";

export const CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION =
  "canonical_provenance_bound_observation_capsule_v1" as const;
export const CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION =
  "canonical_provenance_bound_observation_verification_v1" as const;
export const CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION =
  "canonical_provenance_bound_observation_result_v1" as const;
export const DEFAULT_OFF_PROVENANCE_BOUND_OBSERVATION_ENABLED = false;
export const DEFAULT_OFF_PROVENANCE_BOUND_OBSERVATION_KILL_SWITCH = true;
export const CANONICAL_PROVENANCE_BOUND_OBSERVATION_STATUSES = [
  "verified",
  "rejected",
] as const;
export const CANONICAL_PROVENANCE_BOUND_OBSERVATION_ARTIFACT_ROLES =
  Object.freeze({
    "lib/server/canonical-provenance-bound-observation-verification.ts":
      "implementation",
    "lib/server/canonical-provenance-bound-observation-verification-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666bz-provenance-bound-observation-verification.spec.ts":
      "focused_tests",
    "docs/action-666bz-provenance-bound-observation-verification.md":
      "contract_documentation",
    "docs/action-666bz-golden-provenance-bound-observation-report.json":
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

const jsonStringify = JSON.stringify;
const objectIsFrozen = Object.isFrozen;
const reflectApply = Reflect.apply;
const weakMapGet = WeakMap.prototype.get;
const weakMapSet = WeakMap.prototype.set;
const provenance = new WeakMap<
  object,
  {
    canonical_observation_bytes: string;
    canonical_observation_digest: string;
    capsule_digest: string;
  }
>();

type VerificationStatus =
  (typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_STATUSES)[number];

export type CanonicalProvenanceBoundObservationCounters = {
  request_reads: number;
  capsule_mints: number;
  provenance_checks: number;
  capsule_property_reads: number;
  canonical_byte_rebuilds: number;
  digest_operations: number;
};

export type CanonicalProvenanceBoundObservationCapsule = {
  capsule_version:
    typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION;
  capsule_identity: string;
  primitive_observation_version:
    typeof CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION;
  primitive_type: CanonicalLosslessPrimitiveObservation["primitive_type"];
  primitive_value_digest: string | null;
  primitive_observation_digest: string;
  bounded_observation_digest: string;
  observation: CanonicalLosslessPrimitiveObservation;
  capsule_digest_algorithm: "sha256_canonical_json_v1";
  capsule_digest: string;
};

export type CanonicalProvenanceBoundObservationVerification = {
  verification_version:
    typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION;
  status: VerificationStatus;
  provenance_verified: boolean;
  recognized_capsule: boolean;
  capsule_frozen: boolean | null;
  observation_frozen: boolean | null;
  content_identity_claimed: boolean;
  capsule_identity: string | null;
  capsule_digest: string | null;
  primitive_observation_digest: string | null;
  bounded_observation_digest: string | null;
  reason_codes: string[];
  verification_digest_algorithm: "sha256_canonical_json_v1";
  verification_digest: string;
} & typeof safety;

export type CanonicalProvenanceBoundObservationResult = {
  result_version:
    typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION;
  capsule: CanonicalProvenanceBoundObservationCapsule | null;
  verification: CanonicalProvenanceBoundObservationVerification;
  result_digest_algorithm: "sha256_canonical_json_v1";
  result_digest: string;
} & typeof safety;

function emptyCounters(): CanonicalProvenanceBoundObservationCounters {
  return {
    request_reads: 0,
    capsule_mints: 0,
    provenance_checks: 0,
    capsule_property_reads: 0,
    canonical_byte_rebuilds: 0,
    digest_operations: 0,
  };
}

function digest(
  value: unknown,
  counters?: CanonicalProvenanceBoundObservationCounters,
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

function sorted(values: string[]) {
  return [...new Set(values)].sort();
}

function rejectedVerification(
  counters?: CanonicalProvenanceBoundObservationCounters,
): CanonicalProvenanceBoundObservationVerification {
  const projection = {
    verification_version:
      CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION,
    status: "rejected" as const,
    provenance_verified: false,
    recognized_capsule: false,
    capsule_frozen: null,
    observation_frozen: null,
    content_identity_claimed: false,
    capsule_identity: null,
    capsule_digest: null,
    primitive_observation_digest: null,
    bounded_observation_digest: null,
    reason_codes: ["untrusted_observation_container"],
    verification_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...projection,
    verification_digest: digest(projection, counters),
  });
}

export function mintCanonicalProvenanceBoundObservationCapsule(
  value: unknown,
  counters?: CanonicalProvenanceBoundObservationCounters,
): CanonicalProvenanceBoundObservationCapsule | null {
  const observation = canonicalLosslessPrimitiveObservation(value);
  if (!observation) return null;
  if (counters) counters.capsule_mints += 1;
  const canonicalObservationBytes = jsonStringify(observation);
  const capsuleIdentity = digest(
    {
      capsule_version:
        CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION,
      primitive_type: observation.primitive_type,
      primitive_value_digest: observation.value_digest,
      primitive_observation_digest: observation.observation_digest,
    },
    counters,
  );
  const projection = {
    capsule_version:
      CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION,
    capsule_identity: capsuleIdentity,
    primitive_observation_version:
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
    primitive_type: observation.primitive_type,
    primitive_value_digest: observation.value_digest,
    primitive_observation_digest: observation.observation_digest,
    bounded_observation_digest:
      observation.bounded_observation_digest,
    observation,
    capsule_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const capsule = deepFreezeIterative({
    ...projection,
    capsule_digest: digest(projection, counters),
  });
  reflectApply(weakMapSet, provenance, [
    capsule,
    {
      canonical_observation_bytes: canonicalObservationBytes,
      canonical_observation_digest: observation.observation_digest,
      capsule_digest: capsule.capsule_digest,
    },
  ]);
  return capsule;
}

export function verifyCanonicalProvenanceBoundObservationCapsule(
  candidate: unknown,
  counters?: CanonicalProvenanceBoundObservationCounters,
): CanonicalProvenanceBoundObservationVerification {
  if (
    (typeof candidate !== "object" &&
      typeof candidate !== "function") ||
    candidate === null
  ) {
    return rejectedVerification(counters);
  }

  if (counters) counters.provenance_checks += 1;
  const privateRecord = reflectApply(weakMapGet, provenance, [
    candidate as object,
  ]) as
    | {
        canonical_observation_bytes: string;
        canonical_observation_digest: string;
        capsule_digest: string;
      }
    | undefined;
  if (!privateRecord) return rejectedVerification(counters);

  const capsule = candidate as CanonicalProvenanceBoundObservationCapsule;
  if (counters) counters.capsule_property_reads += 1;
  const capsuleFrozen = objectIsFrozen(capsule);
  const observationFrozen = objectIsFrozen(capsule.observation);
  if (counters) counters.canonical_byte_rebuilds += 1;
  const rebuiltObservationBytes = jsonStringify(capsule.observation);
  const rebuiltCapsuleProjection = {
    capsule_version: capsule.capsule_version,
    capsule_identity: capsule.capsule_identity,
    primitive_observation_version:
      capsule.primitive_observation_version,
    primitive_type: capsule.primitive_type,
    primitive_value_digest: capsule.primitive_value_digest,
    primitive_observation_digest:
      capsule.primitive_observation_digest,
    bounded_observation_digest:
      capsule.bounded_observation_digest,
    observation: capsule.observation,
    capsule_digest_algorithm: capsule.capsule_digest_algorithm,
  };
  const rebuiltCapsuleDigest = digest(
    rebuiltCapsuleProjection,
    counters,
  );
  const reasons = sorted([
    ...(!capsuleFrozen ? ["recognized_capsule_not_frozen"] : []),
    ...(!observationFrozen
      ? ["recognized_observation_not_frozen"]
      : []),
    ...(rebuiltObservationBytes !==
    privateRecord.canonical_observation_bytes
      ? ["recognized_observation_bytes_changed"]
      : []),
    ...(capsule.primitive_observation_digest !==
    privateRecord.canonical_observation_digest
      ? ["recognized_observation_digest_changed"]
      : []),
    ...(capsule.capsule_digest !== privateRecord.capsule_digest ||
    rebuiltCapsuleDigest !== privateRecord.capsule_digest
      ? ["recognized_capsule_digest_changed"]
      : []),
  ]);
  const valid = reasons.length === 0;
  const projection = {
    verification_version:
      CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION,
    status: valid ? ("verified" as const) : ("rejected" as const),
    provenance_verified: valid,
    recognized_capsule: true,
    capsule_frozen: capsuleFrozen,
    observation_frozen: observationFrozen,
    content_identity_claimed:
      valid && capsule.observation.full_value_identity_claimed,
    capsule_identity: capsule.capsule_identity,
    capsule_digest: capsule.capsule_digest,
    primitive_observation_digest:
      capsule.primitive_observation_digest,
    bounded_observation_digest:
      capsule.bounded_observation_digest,
    reason_codes: reasons,
    verification_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...projection,
    verification_digest: digest(projection, counters),
  });
}

export function createCanonicalProvenanceBoundObservationHarness(
  input: {
    enabled?: boolean;
    kill_switch_engaged?: boolean;
    counters?: CanonicalProvenanceBoundObservationCounters;
  } = {},
) {
  const enabled =
    input.enabled ?? DEFAULT_OFF_PROVENANCE_BOUND_OBSERVATION_ENABLED;
  const killSwitch =
    input.kill_switch_engaged ??
    DEFAULT_OFF_PROVENANCE_BOUND_OBSERVATION_KILL_SWITCH;
  const counters = input.counters ?? emptyCounters();
  if (!enabled || killSwitch) {
    return deepFreezeIterative({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      evaluate: null,
      counters,
      ...safety,
    });
  }
  return {
    enabled: true as const,
    status: "ready" as const,
    evaluate: (request: unknown) => {
      counters.request_reads += 1;
      const capsule = mintCanonicalProvenanceBoundObservationCapsule(
        request,
        counters,
      );
      const verification =
        verifyCanonicalProvenanceBoundObservationCapsule(
          capsule,
          counters,
        );
      const projection = {
        result_version:
          CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION,
        capsule,
        verification,
        result_digest_algorithm: "sha256_canonical_json_v1" as const,
        ...safety,
      };
      return deepFreezeIterative({
        ...projection,
        result_digest: digest(projection, counters),
      });
    },
    counters,
    ...safety,
  };
}

export function canonicalProvenanceBoundObservationDigest(
  value: unknown,
) {
  return digest(value);
}
