import "server-only";

import {
  CANONICAL_INTEGRITY_ONLY_ENVELOPE_VERSION,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION,
  type CanonicalIntegrityOnlyObservationEnvelope,
} from "@/lib/server/canonical-integrity-provenance-separated-observation-authority";
import {
  CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
  canonicalLosslessInvalidScalarIssuanceDigest,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";

export const CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION =
  "canonical_callback_free_atomic_observation_v1" as const;
export const CANONICAL_CALLBACK_FREE_READBACK_VERSION =
  "canonical_callback_free_integrity_readback_v1" as const;
export const CANONICAL_CALLBACK_FREE_MAX_INPUT_BYTES = 65_536;
export const DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_ENABLED = false;
export const DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_KILL_SWITCH = true;
export const CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_ARTIFACT_ROLES =
  Object.freeze({
    "lib/server/canonical-callback-free-atomic-observation.ts":
      "implementation",
    "lib/server/canonical-callback-free-atomic-observation-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666cf-callback-free-atomic-observation.spec.ts":
      "focused_adversarial_tests",
    "docs/action-666cf-callback-free-atomic-observation.md":
      "contract_documentation",
    "docs/action-666cf-golden-callback-free-atomic-observation-report.json":
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
const objectGetPrototypeOf = Object.getPrototypeOf;
const reflectApply = Reflect.apply;
const typedArrayValues = Uint8Array.prototype.values;
const typedArrayIteratorNext = Object.getPrototypeOf(
  new Uint8Array().values(),
).next as (this: IterableIterator<number>) => IteratorResult<number>;
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

export type CanonicalCallbackFreeAtomicObservationCounters = {
  input_snapshot_attempts: number;
  input_snapshots: number;
  input_byte_reads: number;
  parse_operations: number;
  digest_operations: number;
};

export type CanonicalCallbackFreeReadbackResult = {
  readback_version: typeof CANONICAL_CALLBACK_FREE_READBACK_VERSION;
  boundary_version: typeof CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION;
  status:
    | "integrity_only"
    | "malformed"
    | "non_canonical"
    | "digest_mismatch"
    | "input_rejected";
  envelope: CanonicalIntegrityOnlyObservationEnvelope | null;
  integrity_verified: boolean;
  provenance_verified: false;
  authority_status: "integrity_only" | "untrusted";
  trusted: false;
  admitted: false;
  content_identity_claimed: boolean;
  captured_input_digest: string | null;
  observed_integrity_digest: string | null;
  rebuilt_integrity_digest: string | null;
  reason_codes: string[];
  terminal_identity: string;
  failure_identity: string | null;
  readback_digest_algorithm: "sha256_canonical_json_v1";
  readback_digest: string;
} & typeof safety;

function emptyCounters(): CanonicalCallbackFreeAtomicObservationCounters {
  return {
    input_snapshot_attempts: 0,
    input_snapshots: 0,
    input_byte_reads: 0,
    parse_operations: 0,
    digest_operations: 0,
  };
}

function digest(
  value: unknown,
  counters: CanonicalCallbackFreeAtomicObservationCounters,
) {
  counters.digest_operations += 1;
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

type InputSnapshot =
  | { canonical_string: string; reason: null }
  | {
      canonical_string: null;
      reason:
        | "function_valued_input_rejected"
        | "arbitrary_object_input_rejected"
        | "uint8array_subclass_rejected"
        | "readback_bytes_invalid"
        | "readback_too_large";
    };

function snapshotCanonicalInput(
  input: unknown,
  counters: CanonicalCallbackFreeAtomicObservationCounters,
): InputSnapshot {
  if (typeof input === "function") {
    return {
      canonical_string: null,
      reason: "function_valued_input_rejected",
    };
  }
  if (typeof input === "string") {
    counters.input_snapshot_attempts += 1;
    const snapshot = textEncoder.encode(input);
    if (snapshot.byteLength > CANONICAL_CALLBACK_FREE_MAX_INPUT_BYTES) {
      return { canonical_string: null, reason: "readback_too_large" };
    }
    counters.input_snapshots += 1;
    counters.input_byte_reads += snapshot.byteLength;
    return {
      canonical_string: textDecoder.decode(snapshot),
      reason: null,
    };
  }
  if (
    (typeof input !== "object" && typeof input !== "function") ||
    input === null
  ) {
    return {
      canonical_string: null,
      reason: "arbitrary_object_input_rejected",
    };
  }

  let iterator: IterableIterator<number>;
  try {
    iterator = reflectApply(typedArrayValues, input, []);
  } catch {
    return {
      canonical_string: null,
      reason: "arbitrary_object_input_rejected",
    };
  }
  try {
    if (reflectApply(objectGetPrototypeOf, Object, [input]) !==
      Uint8Array.prototype) {
      return {
        canonical_string: null,
        reason: "uint8array_subclass_rejected",
      };
    }
  } catch {
    return {
      canonical_string: null,
      reason: "arbitrary_object_input_rejected",
    };
  }

  counters.input_snapshot_attempts += 1;
  const observed: number[] = [];
  try {
    while (true) {
      const step = reflectApply(typedArrayIteratorNext, iterator, []);
      if (step.done) break;
      if (observed.length >= CANONICAL_CALLBACK_FREE_MAX_INPUT_BYTES) {
        return { canonical_string: null, reason: "readback_too_large" };
      }
      observed.push(step.value);
    }
    const snapshot = Uint8Array.from(observed);
    counters.input_snapshots += 1;
    counters.input_byte_reads += snapshot.byteLength;
    return {
      canonical_string: textDecoder.decode(snapshot),
      reason: null,
    };
  } catch {
    return { canonical_string: null, reason: "readback_bytes_invalid" };
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

function rejectedInputResult(
  reason: Exclude<InputSnapshot["reason"], null>,
  counters: CanonicalCallbackFreeAtomicObservationCounters,
): CanonicalCallbackFreeReadbackResult {
  const terminalIdentity = digest(
    {
      readback_version: CANONICAL_CALLBACK_FREE_READBACK_VERSION,
      boundary_version: CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION,
      status: "input_rejected",
      captured_input_digest: null,
      reason_codes: [reason],
      provenance_verified: false,
      trusted: false,
      admitted: false,
    },
    counters,
  );
  const failureIdentity = digest(
    {
      readback_version: CANONICAL_CALLBACK_FREE_READBACK_VERSION,
      terminal_identity: terminalIdentity,
      reason_codes: [reason],
    },
    counters,
  );
  const projection = {
    readback_version: CANONICAL_CALLBACK_FREE_READBACK_VERSION,
    boundary_version: CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION,
    status: "input_rejected" as const,
    envelope: null,
    integrity_verified: false,
    provenance_verified: false as const,
    authority_status: "untrusted" as const,
    trusted: false as const,
    admitted: false as const,
    content_identity_claimed: false,
    captured_input_digest: null,
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
    readback_digest: digest(projection, counters),
  });
}

function verifyCapturedInput(
  canonicalString: string,
  counters: CanonicalCallbackFreeAtomicObservationCounters,
): CanonicalCallbackFreeReadbackResult {
  const capturedInputDigest = digest(
    {
      readback_version: CANONICAL_CALLBACK_FREE_READBACK_VERSION,
      exact_captured_bytes: canonicalString,
    },
    counters,
  );
  let status: CanonicalCallbackFreeReadbackResult["status"] =
    "malformed";
  let reason = "canonical_json_malformed";
  let envelope: CanonicalIntegrityOnlyObservationEnvelope | null = null;
  let observedIntegrityDigest: string | null = null;
  let rebuiltIntegrityDigest: string | null = null;

  try {
    counters.parse_operations += 1;
    const parsed = jsonParse(canonicalString) as unknown;
    if (!exactEnvelopeShape(parsed)) {
      reason = "canonical_schema_invalid";
    } else {
      observedIntegrityDigest = parsed.integrity_digest;
      const projection = { ...parsed, integrity_digest: undefined };
      rebuiltIntegrityDigest = digest(projection, counters);
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

  const terminalIdentity = digest(
    {
      readback_version: CANONICAL_CALLBACK_FREE_READBACK_VERSION,
      boundary_version: CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION,
      status,
      captured_input_digest: capturedInputDigest,
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
            readback_version: CANONICAL_CALLBACK_FREE_READBACK_VERSION,
            terminal_identity: terminalIdentity,
            captured_input_digest: capturedInputDigest,
            reason_codes: [reason],
          },
          counters,
        );
  const projection = {
    readback_version: CANONICAL_CALLBACK_FREE_READBACK_VERSION,
    boundary_version: CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION,
    status,
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
    captured_input_digest: capturedInputDigest,
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

export function runCanonicalCallbackFreeAtomicObservation(
  input: string | Uint8Array,
  enabled: boolean = DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_ENABLED,
  killSwitchEngaged: boolean =
    DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_KILL_SWITCH,
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

  let snapshot: InputSnapshot;
  try {
    snapshot = snapshotCanonicalInput(input, counters);
  } catch {
    snapshot = {
      canonical_string: null,
      reason: "arbitrary_object_input_rejected",
    };
  }
  const terminal =
    snapshot.canonical_string === null
      ? rejectedInputResult(snapshot.reason, counters)
      : verifyCapturedInput(snapshot.canonical_string, counters);
  return deepFreezeIterative({
    enabled: true as const,
    status: "completed" as const,
    terminal_result: terminal,
    counters,
    ...safety,
  });
}
