import "server-only";

import {
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION,
  observeCanonicalPrimitiveAtomically,
  type CanonicalPrivateAtomicObservationCounters,
} from "@/lib/server/canonical-private-atomic-observation-authority";
import {
  CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
  canonicalLosslessInvalidScalarIssuanceDigest,
  type CanonicalLosslessPrimitiveObservation,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";

export const CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION =
  "canonical_integrity_provenance_separation_v2" as const;
export const CANONICAL_RUNTIME_PROVENANCE_EVIDENCE_VERSION =
  "canonical_runtime_provenance_evidence_v2" as const;
export const CANONICAL_INTEGRITY_ONLY_ENVELOPE_VERSION =
  "canonical_integrity_only_observation_envelope_v2" as const;
export const CANONICAL_INTEGRITY_ONLY_READBACK_VERSION =
  "canonical_integrity_only_observation_readback_v2" as const;
export const CANONICAL_INTEGRITY_PROVENANCE_MAX_READBACK_BYTES = 65_536;
export const DEFAULT_OFF_INTEGRITY_PROVENANCE_SEPARATION_ENABLED = false;
export const DEFAULT_OFF_INTEGRITY_PROVENANCE_SEPARATION_KILL_SWITCH = true;
export const CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_ARTIFACT_ROLES =
  Object.freeze({
    "lib/server/canonical-integrity-provenance-separated-observation-authority.ts":
      "implementation",
    "lib/server/canonical-integrity-provenance-separated-observation-authority-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666cd-integrity-provenance-separated-observation-authority.spec.ts":
      "focused_adversarial_tests",
    "docs/action-666cd-integrity-provenance-separated-observation-authority.md":
      "contract_documentation",
    "docs/action-666cd-golden-integrity-provenance-separation-report.json":
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

export type CanonicalIntegrityProvenanceSeparationCounters = {
  request_reads: number;
  runtime_issuance_calls: number;
  readback_reads: number;
  parse_operations: number;
  digest_operations: number;
};

export type CanonicalRuntimeProvenanceEvidence = {
  evidence_version: typeof CANONICAL_RUNTIME_PROVENANCE_EVIDENCE_VERSION;
  separation_contract_version:
    typeof CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION;
  status: "runtime_provenance_verified";
  integrity_verified: true;
  provenance_verified: true;
  authority_status: "private_runtime_provenance";
  provenance_scope: "current_process_only";
  serialization_preserves_provenance: false;
  capsule_exposed: false;
  source_private_evidence_version:
    typeof CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION;
  source_private_evidence_digest: string;
  primitive_observation_version:
    typeof CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION;
  primitive_type: CanonicalLosslessPrimitiveObservation["primitive_type"];
  primitive_value_digest: string | null;
  primitive_observation_digest: string;
  bounded_observation_digest: string;
  content_identity_claimed: boolean;
  evidence_digest_algorithm: "sha256_canonical_json_v1";
  evidence_digest: string;
} & typeof safety;

export type CanonicalIntegrityOnlyObservationEnvelope = {
  envelope_version: typeof CANONICAL_INTEGRITY_ONLY_ENVELOPE_VERSION;
  separation_contract_version:
    typeof CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION;
  authority_status: "integrity_only";
  integrity_verified: true;
  provenance_verified: false;
  trusted: false;
  admitted: false;
  primitive_observation_version:
    typeof CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION;
  primitive_type: CanonicalLosslessPrimitiveObservation["primitive_type"];
  primitive_value_digest: string | null;
  primitive_observation_digest: string;
  bounded_observation_digest: string;
  content_identity_claimed: boolean;
  integrity_digest_algorithm: "sha256_canonical_json_v1";
  integrity_digest: string;
} & typeof safety;

export type CanonicalRuntimeObservationResult = {
  result_version: "canonical_runtime_observation_result_v2";
  status: "runtime_provenance_verified" | "rejected";
  runtime_evidence: CanonicalRuntimeProvenanceEvidence | null;
  canonical_integrity_envelope: string | null;
  integrity_verified: boolean;
  provenance_verified: boolean;
  authority_status: "private_runtime_provenance" | "untrusted";
  trusted: boolean;
  admitted: false;
  capsule_exposed: false;
  reason_codes: string[];
  result_digest_algorithm: "sha256_canonical_json_v1";
  result_digest: string;
} & typeof safety;

export type CanonicalIntegrityOnlyReadbackResult = {
  readback_version: typeof CANONICAL_INTEGRITY_ONLY_READBACK_VERSION;
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
  observed_input_digest: string | null;
  observed_integrity_digest: string | null;
  rebuilt_integrity_digest: string | null;
  reason_codes: string[];
  terminal_identity: string;
  failure_identity: string | null;
  readback_digest_algorithm: "sha256_canonical_json_v1";
  readback_digest: string;
} & typeof safety;

function emptyCounters(): CanonicalIntegrityProvenanceSeparationCounters {
  return {
    request_reads: 0,
    runtime_issuance_calls: 0,
    readback_reads: 0,
    parse_operations: 0,
    digest_operations: 0,
  };
}

function digest(
  value: unknown,
  counters?: CanonicalIntegrityProvenanceSeparationCounters,
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

function runtimeEvidence(
  value: unknown,
  counters: CanonicalIntegrityProvenanceSeparationCounters,
): CanonicalRuntimeProvenanceEvidence | null {
  counters.runtime_issuance_calls += 1;
  const predecessorCounters: CanonicalPrivateAtomicObservationCounters = {
    request_reads: 0,
    capsule_mints: 0,
    provenance_checks: 0,
    capsule_property_reads: 0,
    readback_reads: 0,
    parse_operations: 0,
    digest_operations: 0,
  };
  const predecessor = observeCanonicalPrimitiveAtomically(
    value,
    predecessorCounters,
  );
  if (
    predecessor.status !== "verified" ||
    !predecessor.evidence ||
    predecessor.evidence.provenance_verified !== true
  ) {
    return null;
  }
  const source = predecessor.evidence;
  const projection = {
    evidence_version: CANONICAL_RUNTIME_PROVENANCE_EVIDENCE_VERSION,
    separation_contract_version:
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION,
    status: "runtime_provenance_verified" as const,
    integrity_verified: true as const,
    provenance_verified: true as const,
    authority_status: "private_runtime_provenance" as const,
    provenance_scope: "current_process_only" as const,
    serialization_preserves_provenance: false as const,
    capsule_exposed: false as const,
    source_private_evidence_version:
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION,
    source_private_evidence_digest: source.evidence_digest,
    primitive_observation_version:
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
    primitive_type: source.primitive_type,
    primitive_value_digest: source.primitive_value_digest,
    primitive_observation_digest: source.primitive_observation_digest,
    bounded_observation_digest: source.bounded_observation_digest,
    content_identity_claimed: source.content_identity_claimed,
    evidence_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...projection,
    evidence_digest: digest(projection, counters),
  });
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

function integrityEnvelope(
  evidence: CanonicalRuntimeProvenanceEvidence,
  counters: CanonicalIntegrityProvenanceSeparationCounters,
): CanonicalIntegrityOnlyObservationEnvelope {
  const projection = {
    envelope_version: CANONICAL_INTEGRITY_ONLY_ENVELOPE_VERSION,
    separation_contract_version:
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION,
    authority_status: "integrity_only" as const,
    integrity_verified: true as const,
    provenance_verified: false as const,
    trusted: false as const,
    admitted: false as const,
    primitive_observation_version:
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
    primitive_type: evidence.primitive_type,
    primitive_value_digest: evidence.primitive_value_digest,
    primitive_observation_digest: evidence.primitive_observation_digest,
    bounded_observation_digest: evidence.bounded_observation_digest,
    content_identity_claimed: evidence.content_identity_claimed,
    integrity_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...projection,
    integrity_digest: digest(projection, counters),
  });
}

function issueRuntimeObservation(
  value: unknown,
  counters: CanonicalIntegrityProvenanceSeparationCounters,
): CanonicalRuntimeObservationResult {
  const evidence = runtimeEvidence(value, counters);
  if (!evidence) {
    const projection = {
      result_version: "canonical_runtime_observation_result_v2" as const,
      status: "rejected" as const,
      runtime_evidence: null,
      canonical_integrity_envelope: null,
      integrity_verified: false,
      provenance_verified: false,
      authority_status: "untrusted" as const,
      trusted: false,
      admitted: false as const,
      capsule_exposed: false as const,
      reason_codes: ["primitive_input_required"],
      result_digest_algorithm: "sha256_canonical_json_v1" as const,
      ...safety,
    };
    return deepFreezeIterative({
      ...projection,
      result_digest: digest(projection, counters),
    });
  }
  const envelope = integrityEnvelope(evidence, counters);
  const projection = {
    result_version: "canonical_runtime_observation_result_v2" as const,
    status: "runtime_provenance_verified" as const,
    runtime_evidence: evidence,
    canonical_integrity_envelope: serializeEnvelope(envelope),
    integrity_verified: true,
    provenance_verified: true,
    authority_status: "private_runtime_provenance" as const,
    trusted: true,
    admitted: false as const,
    capsule_exposed: false as const,
    reason_codes: [] as string[],
    result_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...projection,
    result_digest: digest(projection, counters),
  });
}

function exactEnvelopeShape(
  value: unknown,
): value is CanonicalIntegrityOnlyObservationEnvelope {
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
      CANONICAL_INTEGRITY_PROVENANCE_MAX_READBACK_BYTES
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
        CANONICAL_INTEGRITY_PROVENANCE_MAX_READBACK_BYTES
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

function readIntegrityOnly(
  input: unknown,
  counters: CanonicalIntegrityProvenanceSeparationCounters,
): CanonicalIntegrityOnlyReadbackResult {
  counters.readback_reads += 1;
  const canonicalInput = canonicalInputString(input);
  let status: CanonicalIntegrityOnlyReadbackResult["status"] =
    canonicalInput.reason ? "input_rejected" : "malformed";
  let reason =
    canonicalInput.reason ?? "canonical_json_malformed";
  let envelope: CanonicalIntegrityOnlyObservationEnvelope | null = null;
  let observedInputDigest: string | null = null;
  let observedIntegrityDigest: string | null = null;
  let rebuiltIntegrityDigest: string | null = null;

  if (canonicalInput.value !== null) {
    observedInputDigest = digest(
      {
        readback_version: CANONICAL_INTEGRITY_ONLY_READBACK_VERSION,
        exact_canonical_bytes: canonicalInput.value,
      },
      counters,
    );
    try {
      counters.parse_operations += 1;
      const parsed = jsonParse(canonicalInput.value) as unknown;
      if (!exactEnvelopeShape(parsed)) {
        reason = "canonical_schema_invalid";
      } else {
        observedIntegrityDigest = parsed.integrity_digest;
        const projection = {
          ...parsed,
          integrity_digest: undefined,
        };
        rebuiltIntegrityDigest = digest(projection, counters);
        if (serializeEnvelope(parsed) !== canonicalInput.value) {
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
      reason = "canonical_json_malformed";
    }
  }

  const terminalIdentity = digest(
    {
      readback_version: CANONICAL_INTEGRITY_ONLY_READBACK_VERSION,
      status,
      observed_input_digest: observedInputDigest,
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
            readback_version: CANONICAL_INTEGRITY_ONLY_READBACK_VERSION,
            terminal_identity: terminalIdentity,
            observed_input_digest: observedInputDigest,
            reason_codes: [reason],
          },
          counters,
        );
  const projection = {
    readback_version: CANONICAL_INTEGRITY_ONLY_READBACK_VERSION,
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
    observed_input_digest: observedInputDigest,
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

export function runCanonicalIntegrityProvenanceSeparatedObservation(input: {
  enabled?: boolean;
  kill_switch_engaged?: boolean;
  operation?: "issue_runtime" | "readback_integrity";
  read_request?: () => unknown;
  counters?: CanonicalIntegrityProvenanceSeparationCounters;
} = {}) {
  const enabled =
    input.enabled ?? DEFAULT_OFF_INTEGRITY_PROVENANCE_SEPARATION_ENABLED;
  const killSwitch =
    input.kill_switch_engaged ??
    DEFAULT_OFF_INTEGRITY_PROVENANCE_SEPARATION_KILL_SWITCH;
  const counters = input.counters ?? emptyCounters();
  if (!enabled || killSwitch) {
    return deepFreezeIterative({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      operation: null,
      terminal_result: null,
      counters,
      ...safety,
    });
  }
  if (!input.operation || !input.read_request) {
    return deepFreezeIterative({
      enabled: true as const,
      status: "request_reader_required" as const,
      operation: input.operation ?? null,
      terminal_result: null,
      counters,
      ...safety,
    });
  }
  counters.request_reads += 1;
  const request = input.read_request();
  const terminal =
    input.operation === "issue_runtime"
      ? issueRuntimeObservation(request, counters)
      : readIntegrityOnly(request, counters);
  return deepFreezeIterative({
    enabled: true as const,
    status: "completed" as const,
    operation: input.operation,
    terminal_result: terminal,
    counters,
    ...safety,
  });
}
