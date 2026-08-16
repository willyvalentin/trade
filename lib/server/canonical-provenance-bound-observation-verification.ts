import "server-only";

import {
  isDeepStrictEqual as intrinsicIsDeepStrictEqual,
  types as nodeTypes,
} from "node:util";

import {
  CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION,
  CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
  canonicalLosslessInvalidScalarObservationDigest,
  createCanonicalLosslessInvalidScalarObservationHarness,
  verifyCanonicalLosslessInvalidScalarObservationResult,
  type CanonicalLosslessInvalidScalarIssuanceResult,
  type CanonicalLosslessPrimitiveObservation,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";
import type { CanonicalNonForgeableBindingSnapshotIssuanceDependencies } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance";
import { validateCanonicalBoundedSnapshotPayload } from "@/lib/server/canonical-governed-binding-snapshot-admission";

const intrinsicObjectFreeze = Object.freeze;
const intrinsicObjectGetOwnPropertyDescriptor =
  Object.getOwnPropertyDescriptor;
const intrinsicObjectGetPrototypeOf = Object.getPrototypeOf;
const intrinsicObjectIsFrozen = Object.isFrozen;
const intrinsicObjectPrototype = Object.prototype;
const intrinsicReflectApply = Reflect.apply;
const intrinsicReflectOwnKeys = Reflect.ownKeys;
const intrinsicNodeIsProxy = nodeTypes.isProxy;
const intrinsicString = String;
const intrinsicArrayIsArray = Array.isArray;
const intrinsicArrayPop = Array.prototype.pop;
const intrinsicArrayPush = Array.prototype.push;
const intrinsicArraySort = Array.prototype.sort;
const IntrinsicArray = Array;
const IntrinsicSymbol = Symbol;
const IntrinsicWeakMap = WeakMap;
const intrinsicWeakMapGet = WeakMap.prototype.get;
const intrinsicWeakMapSet = WeakMap.prototype.set;
const internalFailureRequest = IntrinsicSymbol(
  "canonical_provenance_bound_internal_failure",
);

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

function copyArrayValues<T>(values: readonly T[]) {
  const copied = new IntrinsicArray<T>();
  for (let index = 0; index < values.length; index += 1) {
    arrayPush(copied, values[index]);
  }
  return copied;
}

function compareCanonicalStrings(first: string, second: string) {
  if (first === second) return 0;
  return first < second ? -1 : 1;
}

function canonicalReasons(values: readonly string[]) {
  const result = new IntrinsicArray<string>();
  for (let index = 0; index < values.length; index += 1) {
    let seen = false;
    for (let existing = 0; existing < result.length; existing += 1) {
      if (result[existing] === values[index]) {
        seen = true;
        break;
      }
    }
    if (!seen) arrayPush(result, values[index]);
  }
  return arraySort(result, compareCanonicalStrings);
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

export const CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION =
  "canonical_provenance_bound_observation_capsule_v2" as const;
export const CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION =
  "canonical_provenance_bound_observation_verification_v2" as const;
export const CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION =
  "canonical_provenance_bound_observation_result_v2" as const;
export const DEFAULT_OFF_PROVENANCE_BOUND_OBSERVATION_ENABLED = false;
export const DEFAULT_OFF_PROVENANCE_BOUND_OBSERVATION_KILL_SWITCH = true;
export const CANONICAL_PROVENANCE_BOUND_OBSERVATION_STATUSES =
  intrinsicObjectFreeze(["verified", "rejected"] as const);
export const CANONICAL_PROVENANCE_BOUND_OBSERVATION_ARTIFACT_ROLES =
  intrinsicObjectFreeze({
    "lib/server/canonical-provenance-bound-observation-verification.ts":
      "implementation",
    "lib/server/canonical-provenance-bound-observation-verification-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666cu-current-main-provenance-bound-observation-verification.spec.ts":
      "focused_tests",
    "docs/action-666cu-current-main-provenance-bound-observation-verification.md":
      "contract_documentation",
    "docs/action-666cu-golden-provenance-bound-observation-report.json":
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
  (typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_STATUSES)[number];

export type CanonicalProvenanceBoundObservationCounters = {
  request_reads: number;
  predecessor_executions: number;
  predecessor_rebuilds: number;
  capsules_minted: number;
  provenance_checks: number;
  capsule_property_reads: number;
  capsule_digest_rebuilds: number;
  digest_operations: number;
};

export type CanonicalProvenanceBoundObservationCapsule = {
  capsule_version:
    typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION;
  capsule_identity: string;
  source_issuance_version:
    typeof CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION;
  source_issuance_digest: string;
  source_failure_identity_digest: string;
  primitive_observation_version:
    typeof CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION;
  primitive_type: CanonicalLosslessPrimitiveObservation["primitive_type"];
  primitive_value_digest: string;
  primitive_observation_digest: string;
  bounded_classification_digest: string;
  observation: CanonicalLosslessPrimitiveObservation;
  content_identity_claimed: true;
  capsule_digest_algorithm: "sha256_canonical_json_v1";
  capsule_digest: string;
};

export type CanonicalProvenanceBoundObservationVerification = {
  verification_version:
    typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION;
  status: Status;
  provenance_verified: boolean;
  recognized_capsule: boolean;
  capsule_frozen: boolean | null;
  observation_frozen: boolean | null;
  content_identity_claimed: boolean;
  capsule_identity: string | null;
  capsule_digest: string | null;
  source_issuance_digest: string | null;
  primitive_observation_digest: string | null;
  reason_codes: string[];
  verification_digest_algorithm: "sha256_canonical_json_v1";
  verification_digest: string;
} & typeof safety;

export type CanonicalProvenanceBoundObservationResult = {
  result_version: typeof CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION;
  status: Status;
  source_issuance_digest: string;
  source_result_verified: boolean;
  capsule: CanonicalProvenanceBoundObservationCapsule | null;
  verification: CanonicalProvenanceBoundObservationVerification;
  reason_codes: string[];
  result_digest_algorithm: "sha256_canonical_json_v1";
  result_digest: string;
} & typeof safety;

type PrivateCapsuleRecord = {
  session: object;
  observation: CanonicalLosslessPrimitiveObservation;
  capsule_identity: string;
  capsule_digest: string;
  source_issuance_digest: string;
  primitive_observation_digest: string;
};

type PrivateHarnessAuthority = {
  session: object;
  rebuild: (request: unknown) => CanonicalProvenanceBoundObservationResult;
};

type PrivateResultRecord = {
  session: object;
};

const capsuleRecords =
  new IntrinsicWeakMap<object, PrivateCapsuleRecord>();
const harnessAuthorities =
  new IntrinsicWeakMap<object, PrivateHarnessAuthority | null>();
const resultRecords = new IntrinsicWeakMap<object, PrivateResultRecord>();

function emptyCounters(): CanonicalProvenanceBoundObservationCounters {
  return {
    request_reads: 0,
    predecessor_executions: 0,
    predecessor_rebuilds: 0,
    capsules_minted: 0,
    provenance_checks: 0,
    capsule_property_reads: 0,
    capsule_digest_rebuilds: 0,
    digest_operations: 0,
  };
}

function countersSnapshot(
  counters: CanonicalProvenanceBoundObservationCounters,
) {
  return deepFreeze({
    request_reads: counters.request_reads,
    predecessor_executions: counters.predecessor_executions,
    predecessor_rebuilds: counters.predecessor_rebuilds,
    capsules_minted: counters.capsules_minted,
    provenance_checks: counters.provenance_checks,
    capsule_property_reads: counters.capsule_property_reads,
    capsule_digest_rebuilds: counters.capsule_digest_rebuilds,
    digest_operations: counters.digest_operations,
  });
}

function digest(
  value: unknown,
  counters?: CanonicalProvenanceBoundObservationCounters,
) {
  if (counters) counters.digest_operations += 1;
  return canonicalLosslessInvalidScalarObservationDigest(value);
}

const capsuleKeys = [
  "bounded_classification_digest",
  "capsule_digest",
  "capsule_digest_algorithm",
  "capsule_identity",
  "capsule_version",
  "content_identity_claimed",
  "observation",
  "primitive_observation_digest",
  "primitive_observation_version",
  "primitive_type",
  "primitive_value_digest",
  "source_failure_identity_digest",
  "source_issuance_digest",
  "source_issuance_version",
] as const;

function rejectedVerification(
  reason: string,
  counters?: CanonicalProvenanceBoundObservationCounters,
  recognized = false,
): CanonicalProvenanceBoundObservationVerification {
  const projection = {
    verification_version:
      CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION,
    status: "rejected" as const,
    provenance_verified: false,
    recognized_capsule: recognized,
    capsule_frozen: null,
    observation_frozen: null,
    content_identity_claimed: false,
    capsule_identity: null,
    capsule_digest: null,
    source_issuance_digest: null,
    primitive_observation_digest: null,
    reason_codes: [reason],
    verification_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...projection,
    verification_digest: digest(projection, counters),
  });
}

function mintCapsule(input: {
  source: CanonicalLosslessInvalidScalarIssuanceResult;
  session: object;
  counters: CanonicalProvenanceBoundObservationCounters;
}) {
  const observation = input.source.primitive_observation!;
  const identityProjection = {
    capsule_version:
      CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION,
    source_issuance_version: input.source.issuance_version,
    source_issuance_digest: input.source.issuance_digest,
    source_failure_identity_digest: input.source.failure_identity_digest!,
    primitive_observation_version: observation.observation_version,
    primitive_type: observation.primitive_type,
    primitive_value_digest: observation.value_digest!,
    primitive_observation_digest: observation.observation_digest,
    bounded_classification_digest:
      observation.bounded_classification_digest,
  };
  const capsuleIdentity = digest(identityProjection, input.counters);
  const projection = {
    capsule_version:
      CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION,
    capsule_identity: capsuleIdentity,
    source_issuance_version: input.source.issuance_version,
    source_issuance_digest: input.source.issuance_digest,
    source_failure_identity_digest: input.source.failure_identity_digest!,
    primitive_observation_version: observation.observation_version,
    primitive_type: observation.primitive_type,
    primitive_value_digest: observation.value_digest!,
    primitive_observation_digest: observation.observation_digest,
    bounded_classification_digest:
      observation.bounded_classification_digest,
    observation,
    content_identity_claimed: true as const,
    capsule_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const capsule = deepFreeze({
    ...projection,
    capsule_digest: digest(projection, input.counters),
  });
  input.counters.capsules_minted += 1;
  weakMapSet(capsuleRecords, capsule, {
    session: input.session,
    observation,
    capsule_identity: capsule.capsule_identity,
    capsule_digest: capsule.capsule_digest,
    source_issuance_digest: capsule.source_issuance_digest,
    primitive_observation_digest: capsule.primitive_observation_digest,
  });
  return capsule;
}

function verifyCapsule(
  candidate: unknown,
  counters?: CanonicalProvenanceBoundObservationCounters,
  expectedSession?: object,
): CanonicalProvenanceBoundObservationVerification {
  if (
    candidate === null ||
    (typeof candidate !== "object" && typeof candidate !== "function")
  ) {
    return rejectedVerification(
      "provenance_bound_untrusted_observation_container",
      counters,
    );
  }
  if (counters) counters.provenance_checks += 1;
  const record = weakMapGet(capsuleRecords, candidate as object);
  if (!record) {
    return rejectedVerification(
      "provenance_bound_untrusted_observation_container",
      counters,
    );
  }
  if (expectedSession && record.session !== expectedSession) {
    return rejectedVerification(
      "provenance_bound_originating_harness_mismatch",
      counters,
      true,
    );
  }
  try {
    const capsule = candidate as CanonicalProvenanceBoundObservationCapsule;
    if (counters) counters.capsule_property_reads += 1;
    const capsuleFrozen = intrinsicObjectIsFrozen(capsule);
    const observationFrozen = intrinsicObjectIsFrozen(capsule.observation);
    const shapeValid = exactDataKeys(capsule, capsuleKeys);
    const projection = {
      capsule_version: capsule.capsule_version,
      capsule_identity: capsule.capsule_identity,
      source_issuance_version: capsule.source_issuance_version,
      source_issuance_digest: capsule.source_issuance_digest,
      source_failure_identity_digest: capsule.source_failure_identity_digest,
      primitive_observation_version: capsule.primitive_observation_version,
      primitive_type: capsule.primitive_type,
      primitive_value_digest: capsule.primitive_value_digest,
      primitive_observation_digest: capsule.primitive_observation_digest,
      bounded_classification_digest: capsule.bounded_classification_digest,
      observation: capsule.observation,
      content_identity_claimed: capsule.content_identity_claimed,
      capsule_digest_algorithm: capsule.capsule_digest_algorithm,
    };
    if (counters) counters.capsule_digest_rebuilds += 1;
    const rebuiltDigest = digest(projection, counters);
    const reasons = new IntrinsicArray<string>();
    if (!shapeValid) arrayPush(reasons, "provenance_bound_capsule_shape_changed");
    if (!capsuleFrozen) arrayPush(reasons, "provenance_bound_capsule_not_frozen");
    if (!observationFrozen) {
      arrayPush(reasons, "provenance_bound_observation_not_frozen");
    }
    if (
      capsule.capsule_version !==
        CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION ||
      capsule.source_issuance_version !==
        CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION ||
      capsule.primitive_observation_version !==
        CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION ||
      capsule.content_identity_claimed !== true ||
      capsule.capsule_digest_algorithm !== "sha256_canonical_json_v1"
    ) {
      arrayPush(reasons, "provenance_bound_capsule_contract_changed");
    }
    if (capsule.observation !== record.observation) {
      arrayPush(reasons, "provenance_bound_observation_reference_changed");
    }
    if (
      capsule.capsule_identity !== record.capsule_identity ||
      capsule.capsule_digest !== record.capsule_digest ||
      rebuiltDigest !== record.capsule_digest ||
      capsule.source_issuance_digest !== record.source_issuance_digest ||
      capsule.primitive_observation_digest !==
        record.primitive_observation_digest
    ) {
      arrayPush(reasons, "provenance_bound_capsule_digest_changed");
    }
    const canonical = canonicalReasons(reasons);
    const valid = canonical.length === 0;
    const verificationProjection = {
      verification_version:
        CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION,
      status: valid ? ("verified" as const) : ("rejected" as const),
      provenance_verified: valid,
      recognized_capsule: true,
      capsule_frozen: capsuleFrozen,
      observation_frozen: observationFrozen,
      content_identity_claimed: valid,
      capsule_identity: valid ? capsule.capsule_identity : null,
      capsule_digest: valid ? capsule.capsule_digest : null,
      source_issuance_digest: valid ? capsule.source_issuance_digest : null,
      primitive_observation_digest: valid
        ? capsule.primitive_observation_digest
        : null,
      reason_codes: canonical,
      verification_digest_algorithm: "sha256_canonical_json_v1" as const,
      ...safety,
    };
    return deepFreeze({
      ...verificationProjection,
      verification_digest: digest(verificationProjection, counters),
    });
  } catch {
    return rejectedVerification(
      "provenance_bound_recognized_capsule_validation_failed",
      counters,
      true,
    );
  }
}

export function verifyCanonicalProvenanceBoundObservationCapsule(
  candidate: unknown,
) {
  return verifyCapsule(candidate);
}

function terminalResult(input: {
  source: CanonicalLosslessInvalidScalarIssuanceResult;
  sourceVerified: boolean;
  session: object;
  counters: CanonicalProvenanceBoundObservationCounters;
}) {
  const observation = input.source.primitive_observation;
  const authoritativePrimitive =
    input.sourceVerified &&
    input.source.verifier_authority_granted &&
    input.source.failure_identity_digest !== null &&
    observation?.observation_status === "represented" &&
    observation.full_value_identity_claimed === true &&
    observation.value_digest !== null;
  const capsule = authoritativePrimitive
    ? mintCapsule({
        source: input.source,
        session: input.session,
        counters: input.counters,
      })
    : null;
  const verification = capsule
    ? verifyCapsule(capsule, input.counters, input.session)
    : rejectedVerification(
        "provenance_bound_lossless_primitive_authority_required",
        input.counters,
      );
  const reasons = verification.reason_codes;
  const projection = {
    result_version: CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION,
    status: verification.status,
    source_issuance_digest: input.source.issuance_digest,
    source_result_verified: input.sourceVerified,
    capsule,
    verification,
    reason_codes: reasons,
    result_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  const result = deepFreeze({
    ...projection,
    result_digest: digest(projection, input.counters),
  });
  weakMapSet(resultRecords, result, { session: input.session });
  return result;
}

function execute(input: {
  request: unknown;
  predecessorHarness: ReturnType<
    typeof createCanonicalLosslessInvalidScalarObservationHarness
  >;
  session: object;
  counters: CanonicalProvenanceBoundObservationCounters;
}) {
  input.counters.request_reads += 1;
  input.counters.predecessor_executions += 1;
  const source = input.predecessorHarness.issue!(input.request);
  input.counters.predecessor_rebuilds += 1;
  const sourceVerification =
    verifyCanonicalLosslessInvalidScalarObservationResult({
      request: input.request,
      result: source,
      harness: input.predecessorHarness,
    });
  return terminalResult({
    source,
    sourceVerified: sourceVerification.valid,
    session: input.session,
    counters: input.counters,
  });
}

export function createCanonicalProvenanceBoundObservationVerificationHarness(
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
        evaluate: null,
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
        evaluate: null,
        reason_codes: ["provenance_bound_dependencies_invalid"],
        ...safety,
      },
      null,
    );
  }
  const predecessorHarness =
    createCanonicalLosslessInvalidScalarObservationHarness({
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
        evaluate: null,
        reason_codes: ["provenance_bound_dependencies_invalid"],
        ...safety,
      },
      null,
    );
  }
  const session = intrinsicObjectFreeze({});
  const run = (
    request: unknown,
    runCounters: CanonicalProvenanceBoundObservationCounters,
  ) => {
    try {
      return execute({
        request,
        predecessorHarness,
        session,
        counters: runCounters,
      });
    } catch {
      const source = predecessorHarness.issue!(internalFailureRequest);
      return terminalResult({
        source,
        sourceVerified: false,
        session,
        counters: runCounters,
      });
    }
  };
  const evaluate = (request: unknown) => run(request, counters);
  const rebuild = (request: unknown) => run(request, emptyCounters());
  return publish(
    {
      enabled: true as const,
      status: "ready" as const,
      evaluate,
      ...safety,
    },
    { session, rebuild },
  );
}

export function verifyCanonicalProvenanceBoundObservationResult(input: {
  request: unknown;
  result: CanonicalProvenanceBoundObservationResult;
  harness: object;
}) {
  try {
    if (
      !isRecord(input) ||
      !exactDataKeys(input, ["harness", "request", "result"])
    ) {
      throw new Error("provenance_bound_verifier_input_invalid");
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
      throw new Error("provenance_bound_verifier_input_invalid");
    }
    const authority = weakMapGet(harnessAuthorities, harness.value);
    if (!authority) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: [
          authority === null
            ? "provenance_bound_rebuild_unavailable"
            : "provenance_bound_harness_unrecognized",
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
        reason_codes: ["provenance_bound_untrusted_result_container"],
      });
    }
    const resultRecord = weakMapGet(resultRecords, provided.value as object);
    if (!resultRecord) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["provenance_bound_untrusted_result_container"],
      });
    }
    if (resultRecord.session !== authority.session) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["provenance_bound_originating_harness_mismatch"],
      });
    }
    if (
      !isRecord(provided.value) ||
      !exactDataKeys(provided.value, [
        "automatic_model_change_allowed",
        "automatic_parameter_change_allowed",
        "automatic_promotion_allowed",
        "automatic_threshold_change_allowed",
        "automatic_training_allowed",
        "capsule",
        "causal_improvement_claimed",
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
        "source_issuance_digest",
        "source_result_verified",
        "status",
        "synthetic_evidence",
        "verification",
      ]) ||
      validateCanonicalBoundedSnapshotPayload(provided.value).status !== "valid"
    ) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["provenance_bound_result_not_bounded"],
      });
    }
    const providedCapsule = ownDataValue(provided.value, "capsule");
    if (!providedCapsule.present || providedCapsule.value === null) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: ["provenance_bound_result_not_authoritative"],
      });
    }
    const capsuleVerification = verifyCapsule(
      providedCapsule.value,
      undefined,
      authority.session,
    );
    if (!capsuleVerification.provenance_verified) {
      return deepFreeze({
        valid: false,
        canonical_result: null,
        reason_codes: capsuleVerification.reason_codes,
      });
    }
    const canonical = authority.rebuild(request.value);
    if (canonical.status !== "verified" || canonical.capsule === null) {
      return deepFreeze({
        valid: false,
        canonical_result: canonical,
        reason_codes: ["provenance_bound_result_not_authoritative"],
      });
    }
    const valid = intrinsicIsDeepStrictEqual(canonical, provided.value);
    return deepFreeze({
      valid,
      canonical_result: canonical,
      reason_codes: valid
        ? []
        : ["provenance_bound_result_rebuild_mismatch"],
    });
  } catch {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["provenance_bound_verifier_input_invalid"],
    });
  }
}

export function canonicalProvenanceBoundObservationDigest(value: unknown) {
  if (validateCanonicalBoundedSnapshotPayload(value).status !== "valid") {
    throw new Error("provenance_bound_digest_input_not_bounded");
  }
  return digest(value);
}
