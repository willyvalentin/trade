import {
  parseDatabentoExplicitNanosecondInstantV1,
} from "./databento-explicit-nanosecond-instant-v1";
import {
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1,
  marketContextDiagnosticOutcomeBundleDigestV1,
  type MarketContextDiagnosticOutcomeBundleHandoffV1,
} from "./diagnostic-context-outcome-join-v1";

export const DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1 =
  "diagnostic_decision_outcome_handoff_capture_v1" as const;
export const DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_BUNDLE_V1 =
  "diagnostic_decision_outcome_handoff_bundle_v1" as const;
export const DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1 =
  "diagnostic_outcome_source_registry_v1" as const;
export const DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1 =
  "diagnostic_outcome_source_authority_v1" as const;
export const DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V1 =
  "diagnostic_outcome_capture_failure_provenance_v1" as const;

export const DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_TAXONOMY_V1 = [
  "captured",
  "incomplete",
  "conflicting",
  "not_point_in_time_safe",
  "unmappable",
] as const;

export type DiagnosticDecisionOutcomeCaptureTaxonomyV1 =
  (typeof DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_TAXONOMY_V1)[number];

export const DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_BOUNDARY_V1 = {
  diagnostic_only: true,
  shadow_only: true,
  canonical_performance_eligible: false,
  automatic_model_input_allowed: false,
  automatic_training_allowed: false,
  automatic_promotion_allowed: false,
  causal_claimed: false,
  live_ranking_effect: false,
} as const;

const SOURCE_NAMESPACES = [
  "decision_source",
  "opportunity_set_source",
  "evaluator_outcome_source",
  "provider_context_source",
  "cost_slippage_source",
] as const;

export type DiagnosticOutcomeSourceNamespaceV1 =
  (typeof SOURCE_NAMESPACES)[number];

type JsonRecord = Record<string, unknown>;

export type DiagnosticDecisionOutcomeCaptureRequestV1 = {
  contract_version: typeof DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1;
  capture_identity: string;
  period: string;
  cohort: string;
  source_references: {
    decision_source_identity: string;
    opportunity_set_source_identity: string;
    evaluator_outcome_source_identity: string;
    provider_context_source_identity: string;
    cost_slippage_source_identity: string;
  };
};

export type DiagnosticOutcomeSourceRegistryEntryV1 = {
  namespace: DiagnosticOutcomeSourceNamespaceV1;
  schema_version: string;
  payload_identity: string;
  payload_digest: string;
  verifier_identity: string;
  verifier_version: string;
};

export type DiagnosticOutcomeSourceRegistryV1 = {
  registry_version: typeof DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1;
  registry_identity: string;
  producer: {
    identity: string;
    version: string;
  };
  expected_trust_root_digest: string;
  validity: {
    effective_from_unix_ns: string;
    effective_until_unix_ns: string;
  };
  sources: Record<
    DiagnosticOutcomeSourceNamespaceV1,
    DiagnosticOutcomeSourceRegistryEntryV1
  >;
  registry_digest: string;
};

export type DiagnosticOutcomeSourceAuthorityV1 = {
  authority_version: typeof DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1;
  expected_registry_anchor: {
    registry_identity: string;
    registry_version: typeof DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1;
    registry_digest: string;
  };
  read_registry: () => unknown;
  read_source: (
    namespace: DiagnosticOutcomeSourceNamespaceV1,
    payloadIdentity: string,
  ) => { status: "resolved"; payload: unknown } | { status: "not_found" };
};

export type DiagnosticDecisionOutcomeCaptureDependenciesV1 = {
  enabled: boolean;
  kill_switch: boolean;
  authority?: DiagnosticOutcomeSourceAuthorityV1;
};

export type DiagnosticOutcomeObservedSourceProvenanceV1 = {
  namespace:
    | DiagnosticOutcomeSourceNamespaceV1
    | "capture_request"
    | "source_registry";
  schema_version: string | null;
  observed_payload_identity: string | null;
  observed_input_digest: string;
  disposition: "absent" | "malformed" | "verified" | "rejected";
  expected_payload_identity: string | null;
  expected_payload_digest: string | null;
  expected_trust_root_digest: string | null;
  verifier_identity: string;
  verifier_version: string;
  reason_codes: string[];
};

export type DiagnosticDecisionOutcomeCapturedBundleV1 = {
  bundle_version: typeof DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_BUNDLE_V1;
  capture_identity: string;
  period: string;
  cohort: string;
  source_registry: {
    registry_identity: string;
    registry_version: typeof DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1;
    registry_digest: string;
    trust_root_digest: string;
  };
  source_payload_digests: Record<
    DiagnosticOutcomeSourceNamespaceV1,
    string
  >;
  outcome_handoff: MarketContextDiagnosticOutcomeBundleHandoffV1;
  capture_bundle_digest: string;
};

export type DiagnosticDecisionOutcomeCaptureResultV1 = {
  contract_version: typeof DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1;
  taxonomy: DiagnosticDecisionOutcomeCaptureTaxonomyV1;
  request_identity: {
    capture_identity: string;
    request_digest: string;
  };
  authority_binding: {
    authority_version:
      | typeof DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1
      | null;
    registry_identity: string | null;
    registry_version:
      | typeof DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1
      | null;
    registry_digest: string | null;
    trust_root_digest: string | null;
    verification_status:
      | "verified"
      | "not_read_default_off"
      | "not_read_kill_switch"
      | "missing"
      | "lookup_failed"
      | "invalid"
      | "mismatch";
  };
  observed_source_provenance: {
    provenance_version:
      typeof DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V1;
    sections: DiagnosticOutcomeObservedSourceProvenanceV1[];
    provenance_digest: string;
  };
  failure_identity_digest: string | null;
  bundle: DiagnosticDecisionOutcomeCapturedBundleV1 | null;
  reason_codes: string[];
  diagnostic_only: true;
  shadow_only: true;
  canonical_performance_eligible: false;
  automatic_model_input_allowed: false;
  automatic_training_allowed: false;
  automatic_promotion_allowed: false;
  causal_claimed: false;
  live_ranking_effect: false;
  terminal_capture_digest: string;
};

type ObservedCapture = {
  namespace:
    | DiagnosticOutcomeSourceNamespaceV1
    | "capture_request"
    | "source_registry";
  schema_version: string | null;
  observed_input_digest: string;
  disposition: "absent" | "malformed" | "verified" | "rejected";
  material: unknown;
  reason_codes: string[];
};

const ZERO_DIGEST =
  "0000000000000000000000000000000000000000000000000000000000000000";
const DEFAULT_OFF_DIGEST =
  "d59cfb679af158f6ac8912cd72fa4fb86a5992093c40ef398a3fb1ae93f21020";
const KILL_SWITCH_DIGEST =
  "76d528b8858f51b4af6f53dff65065210b344a03ad03d89944039e1f5f51dfcf";

const defaultOffResult = deepFreeze({
  contract_version: DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1,
  taxonomy: "incomplete",
  request_identity: {
    capture_identity: "unread_default_off",
    request_digest: ZERO_DIGEST,
  },
  authority_binding: {
    authority_version: null,
    registry_identity: null,
    registry_version: null,
    registry_digest: null,
    trust_root_digest: null,
    verification_status: "not_read_default_off",
  },
  observed_source_provenance: {
    provenance_version:
      DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V1,
    sections: [],
    provenance_digest: ZERO_DIGEST,
  },
  failure_identity_digest: DEFAULT_OFF_DIGEST,
  bundle: null,
  reason_codes: ["capture_default_off"],
  ...DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_BOUNDARY_V1,
  terminal_capture_digest: DEFAULT_OFF_DIGEST,
}) as DiagnosticDecisionOutcomeCaptureResultV1;

const killSwitchResult = deepFreeze({
  contract_version: DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1,
  taxonomy: "conflicting",
  request_identity: {
    capture_identity: "unread_kill_switch",
    request_digest: ZERO_DIGEST,
  },
  authority_binding: {
    authority_version: null,
    registry_identity: null,
    registry_version: null,
    registry_digest: null,
    trust_root_digest: null,
    verification_status: "not_read_kill_switch",
  },
  observed_source_provenance: {
    provenance_version:
      DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V1,
    sections: [],
    provenance_digest: ZERO_DIGEST,
  },
  failure_identity_digest: KILL_SWITCH_DIGEST,
  bundle: null,
  reason_codes: ["capture_kill_switch_active"],
  ...DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_BOUNDARY_V1,
  terminal_capture_digest: KILL_SWITCH_DIGEST,
}) as DiagnosticDecisionOutcomeCaptureResultV1;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function exactKeys(
  value: unknown,
  expected: string[],
  path: string,
  reasons: string[],
) {
  const candidate = record(value);
  if (!candidate) {
    reasons.push(`${path}:not_object`);
    return null;
  }
  const expectedSet = new Set(expected);
  for (const key of Object.keys(candidate)) {
    if (!expectedSet.has(key)) reasons.push(`${path}:unknown_field:${key}`);
  }
  for (const key of expected) {
    if (!Object.hasOwn(candidate, key)) {
      reasons.push(`${path}:missing_field:${key}`);
    }
  }
  return candidate;
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

function isUnixNs(value: unknown): value is string {
  return typeof value === "string" && /^(0|[1-9]\d*)$/.test(value);
}

function sortedUnique(values: string[]) {
  return [...new Set(values)].sort((left, right) =>
    left.localeCompare(right),
  );
}

function requireNonEmptyStrings(
  candidate: JsonRecord,
  keys: string[],
  path: string,
  reasons: string[],
) {
  for (const key of keys) {
    if (
      typeof candidate[key] !== "string" ||
      candidate[key].length === 0
    ) {
      reasons.push(`${path}:invalid_string:${key}`);
    }
  }
}

function safeStructuralProjection(value: unknown) {
  const seen = new WeakMap<object, number>();
  let nextReference = 1;
  function visit(candidate: unknown): unknown {
    if (
      candidate === null ||
      typeof candidate === "string" ||
      typeof candidate === "boolean"
    ) {
      return candidate;
    }
    if (typeof candidate === "number") {
      return Number.isFinite(candidate)
        ? candidate
        : { runtime_type: "non_finite_number" };
    }
    if (typeof candidate === "bigint") {
      return { runtime_type: "bigint", value: candidate.toString() };
    }
    if (
      typeof candidate === "undefined" ||
      typeof candidate === "symbol" ||
      typeof candidate === "function"
    ) {
      return { runtime_type: typeof candidate };
    }
    if (typeof candidate !== "object") {
      return { runtime_type: "unsupported" };
    }
    const previous = seen.get(candidate);
    if (previous !== undefined) {
      return { runtime_type: "cycle_reference", reference: previous };
    }
    const reference = nextReference++;
    seen.set(candidate, reference);
    if (Array.isArray(candidate)) {
      return {
        runtime_type: "array",
        reference,
        children: candidate.map((child) => visit(child)),
      };
    }
    const properties = Object.keys(candidate)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => {
        let child: unknown;
        try {
          const descriptor = Object.getOwnPropertyDescriptor(candidate, key);
          child =
            descriptor && "value" in descriptor
              ? descriptor.value
              : { runtime_type: "accessor_not_invoked" };
        } catch {
          child = { runtime_type: "unreadable_property" };
        }
        return {
          key_digest:
            marketContextDiagnosticContextSha256V1(`key:${key}`),
          value: visit(child),
        };
      });
    return { runtime_type: "object", reference, properties };
  }
  return visit(value);
}

function observedDigest(namespace: string, value: unknown) {
  return marketContextDiagnosticContextSha256V1({
    provenance_version:
      DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V1,
    namespace,
    sanitized_observed_input: safeStructuralProjection(value),
  });
}

function absentCapture(
  namespace: ObservedCapture["namespace"],
  reason: string,
): ObservedCapture {
  return {
    namespace,
    schema_version: null,
    observed_input_digest:
      marketContextDiagnosticContextSha256V1({
        provenance_version:
          DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V1,
        namespace,
        disposition: "absent",
        sentinel: reason,
      }),
    disposition: "absent",
    material: null,
    reason_codes: [reason],
  };
}

function observedCapture(
  namespace: ObservedCapture["namespace"],
  value: unknown,
  schemaVersionKeys: string[],
): ObservedCapture {
  let material: unknown;
  try {
    material = structuredClone(value);
  } catch {
    return {
      namespace,
      schema_version: null,
      observed_input_digest: observedDigest(namespace, value),
      disposition: "malformed",
      material: null,
      reason_codes: ["observed_payload_not_cloneable"],
    };
  }
  const candidate = record(material);
  const schemaVersion = schemaVersionKeys
    .map((key) => candidate?.[key])
    .find((entry) => typeof entry === "string");
  return {
    namespace,
    schema_version:
      typeof schemaVersion === "string" ? schemaVersion : null,
    observed_input_digest: observedDigest(namespace, material),
    disposition: candidate ? "verified" : "malformed",
    material,
    reason_codes: candidate ? [] : ["observed_payload_not_object"],
  };
}

function requestValidation(value: unknown) {
  const reasons: string[] = [];
  const request = exactKeys(
    value,
    [
      "contract_version",
      "capture_identity",
      "period",
      "cohort",
      "source_references",
    ],
    "$",
    reasons,
  );
  const references = exactKeys(
    request?.source_references,
    [
      "decision_source_identity",
      "opportunity_set_source_identity",
      "evaluator_outcome_source_identity",
      "provider_context_source_identity",
      "cost_slippage_source_identity",
    ],
    "$.source_references",
    reasons,
  );
  if (
    request?.contract_version !==
      DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1 ||
    typeof request.capture_identity !== "string" ||
    request.capture_identity.length === 0 ||
    typeof request.period !== "string" ||
    request.period.length === 0 ||
    typeof request.cohort !== "string" ||
    request.cohort.length === 0
  ) {
    reasons.push("capture_request_identity_invalid");
  }
  if (
    !references ||
    !Object.values(references).every(
      (entry) => typeof entry === "string" && entry.length > 0,
    )
  ) {
    reasons.push("capture_source_references_invalid");
  }
  return sortedUnique(reasons);
}

function registryMaterial(
  value: Omit<DiagnosticOutcomeSourceRegistryV1, "registry_digest">,
) {
  return value;
}

export function createDiagnosticOutcomeSourceRegistryV1(
  value: Omit<
    DiagnosticOutcomeSourceRegistryV1,
    "registry_version" | "registry_digest"
  >,
): DiagnosticOutcomeSourceRegistryV1 {
  const material = {
    registry_version: DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1,
    ...structuredClone(value),
  };
  return {
    ...material,
    registry_digest:
      marketContextDiagnosticContextSha256V1(material),
  };
}

function validateRegistry(value: unknown) {
  const reasons: string[] = [];
  const registry = exactKeys(
    value,
    [
      "registry_version",
      "registry_identity",
      "producer",
      "expected_trust_root_digest",
      "validity",
      "sources",
      "registry_digest",
    ],
    "$registry",
    reasons,
  );
  const producer = exactKeys(
    registry?.producer,
    ["identity", "version"],
    "$registry.producer",
    reasons,
  );
  const validity = exactKeys(
    registry?.validity,
    ["effective_from_unix_ns", "effective_until_unix_ns"],
    "$registry.validity",
    reasons,
  );
  const sources = exactKeys(
    registry?.sources,
    [...SOURCE_NAMESPACES],
    "$registry.sources",
    reasons,
  );
  if (
    registry?.registry_version !== DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V1 ||
    typeof registry.registry_identity !== "string" ||
    !isSha256(registry.expected_trust_root_digest) ||
    !isSha256(registry.registry_digest) ||
    !producer ||
    typeof producer.identity !== "string" ||
    typeof producer.version !== "string" ||
    !validity ||
    !isUnixNs(validity.effective_from_unix_ns) ||
    !isUnixNs(validity.effective_until_unix_ns) ||
    BigInt(validity.effective_from_unix_ns) >=
      BigInt(validity.effective_until_unix_ns)
  ) {
    reasons.push("source_registry_identity_or_validity_invalid");
  }
  for (const namespace of SOURCE_NAMESPACES) {
    const entry = exactKeys(
      sources?.[namespace],
      [
        "namespace",
        "schema_version",
        "payload_identity",
        "payload_digest",
        "verifier_identity",
        "verifier_version",
      ],
      `$registry.sources.${namespace}`,
      reasons,
    );
    if (
      !entry ||
      entry.namespace !== namespace ||
      typeof entry.schema_version !== "string" ||
      typeof entry.payload_identity !== "string" ||
      !isSha256(entry.payload_digest) ||
      typeof entry.verifier_identity !== "string" ||
      typeof entry.verifier_version !== "string"
    ) {
      reasons.push(`source_registry_entry_invalid:${namespace}`);
    }
  }
  if (registry && isSha256(registry.registry_digest)) {
    const material = Object.fromEntries(
      Object.entries(registry).filter(([key]) => key !== "registry_digest"),
    ) as Omit<DiagnosticOutcomeSourceRegistryV1, "registry_digest">;
    if (
      marketContextDiagnosticContextSha256V1(
        registryMaterial(material),
      ) !== registry.registry_digest
    ) {
      reasons.push("source_registry_digest_mismatch");
    }
  }
  return {
    registry:
      reasons.length === 0
        ? (value as DiagnosticOutcomeSourceRegistryV1)
        : null,
    reasons: sortedUnique(reasons),
  };
}

function sourceReference(
  request: DiagnosticDecisionOutcomeCaptureRequestV1,
  namespace: DiagnosticOutcomeSourceNamespaceV1,
) {
  const map = {
    decision_source:
      request.source_references.decision_source_identity,
    opportunity_set_source:
      request.source_references.opportunity_set_source_identity,
    evaluator_outcome_source:
      request.source_references.evaluator_outcome_source_identity,
    provider_context_source:
      request.source_references.provider_context_source_identity,
    cost_slippage_source:
      request.source_references.cost_slippage_source_identity,
  };
  return map[namespace];
}

function readSources(
  request: DiagnosticDecisionOutcomeCaptureRequestV1,
  authority: DiagnosticOutcomeSourceAuthorityV1,
) {
  const captures = {} as Record<
    DiagnosticOutcomeSourceNamespaceV1,
    ObservedCapture
  >;
  for (const namespace of SOURCE_NAMESPACES) {
    const identity = sourceReference(request, namespace);
    try {
      const resolution = authority.read_source(namespace, identity);
      captures[namespace] =
        resolution.status === "resolved"
          ? observedCapture(
              namespace,
              resolution.payload,
              ["schema_version", "contract_version", "version"],
            )
          : absentCapture(namespace, "source_payload_not_found");
    } catch {
      captures[namespace] = absentCapture(
        namespace,
        "source_lookup_exception_sanitized",
      );
    }
  }
  return captures;
}

function sourceProvenance(
  captures: ObservedCapture[],
  registry: DiagnosticOutcomeSourceRegistryV1 | null,
) {
  const sections = captures
    .map((capture) => {
      const expected =
        capture.namespace === "source_registry" ||
        capture.namespace === "capture_request"
          ? null
          : registry?.sources[capture.namespace] ?? null;
      return {
        namespace: capture.namespace,
        schema_version: capture.schema_version,
        observed_payload_identity:
          typeof record(capture.material)?.source_identity === "string"
            ? String(record(capture.material)?.source_identity)
            : null,
        observed_input_digest: capture.observed_input_digest,
        disposition: capture.disposition,
        expected_payload_identity: expected?.payload_identity ?? null,
        expected_payload_digest: expected?.payload_digest ?? null,
        expected_trust_root_digest:
          registry?.expected_trust_root_digest ?? null,
        verifier_identity:
          expected?.verifier_identity ??
          "external_source_registry_anchor_verifier",
        verifier_version:
          expected?.verifier_version ??
          DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1,
        reason_codes: sortedUnique(capture.reason_codes),
      } satisfies DiagnosticOutcomeObservedSourceProvenanceV1;
    })
    .sort((left, right) =>
      left.namespace.localeCompare(right.namespace),
    );
  const material = {
    provenance_version:
      DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V1,
    sections,
  };
  return {
    ...material,
    provenance_digest:
      marketContextDiagnosticContextSha256V1(material),
  };
}

function result(
  request: unknown,
  taxonomy: DiagnosticDecisionOutcomeCaptureTaxonomyV1,
  reasons: string[],
  binding: DiagnosticDecisionOutcomeCaptureResultV1["authority_binding"],
  captures: ObservedCapture[],
  registry: DiagnosticOutcomeSourceRegistryV1 | null,
  bundle: DiagnosticDecisionOutcomeCapturedBundleV1 | null = null,
) {
  const candidate = record(request);
  const requestIdentity = {
    capture_identity:
      typeof candidate?.capture_identity === "string"
        ? candidate.capture_identity
        : "invalid",
    request_digest:
      marketContextDiagnosticContextSha256V1(
        safeStructuralProjection(request),
      ),
  };
  const provenance = sourceProvenance(captures, registry);
  const reasonCodes = sortedUnique(reasons);
  const failureMaterial =
    taxonomy === "captured"
      ? null
      : {
          contract_version:
            DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1,
          taxonomy,
          request_identity: requestIdentity,
          authority_binding: binding,
          observed_source_provenance_digest:
            provenance.provenance_digest,
          reason_codes: reasonCodes,
        };
  const material = {
    contract_version:
      DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V1,
    taxonomy,
    request_identity: requestIdentity,
    authority_binding: binding,
    observed_source_provenance: provenance,
    failure_identity_digest:
      failureMaterial === null
        ? null
        : marketContextDiagnosticContextSha256V1(failureMaterial),
    bundle,
    reason_codes: reasonCodes,
    ...DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_BOUNDARY_V1,
  };
  return {
    ...material,
    terminal_capture_digest:
      marketContextDiagnosticContextSha256V1(material),
  } satisfies DiagnosticDecisionOutcomeCaptureResultV1;
}

function binding(
  authority: DiagnosticOutcomeSourceAuthorityV1 | null,
  registry: DiagnosticOutcomeSourceRegistryV1 | null,
  status: DiagnosticDecisionOutcomeCaptureResultV1["authority_binding"]["verification_status"],
) {
  return {
    authority_version: authority?.authority_version ?? null,
    registry_identity:
      registry?.registry_identity ??
      authority?.expected_registry_anchor.registry_identity ??
      null,
    registry_version:
      registry?.registry_version ??
      authority?.expected_registry_anchor.registry_version ??
      null,
    registry_digest:
      registry?.registry_digest ??
      authority?.expected_registry_anchor.registry_digest ??
      null,
    trust_root_digest: registry?.expected_trust_root_digest ?? null,
    verification_status: status,
  };
}

function validateAndBuildBundle(
  request: DiagnosticDecisionOutcomeCaptureRequestV1,
  registry: DiagnosticOutcomeSourceRegistryV1,
  captures: Record<DiagnosticOutcomeSourceNamespaceV1, ObservedCapture>,
) {
  const incompleteReasons: string[] = [];
  const conflictingReasons: string[] = [];
  const temporalReasons: string[] = [];
  const unmappableReasons: string[] = [];

  for (const namespace of SOURCE_NAMESPACES) {
    const capture = captures[namespace];
    const expected = registry.sources[namespace];
    if (sourceReference(request, namespace) !== expected.payload_identity) {
      capture.disposition = "rejected";
      capture.reason_codes.push("source_identity_not_registered");
      unmappableReasons.push(`source_identity_not_registered:${namespace}`);
      continue;
    }
    if (capture.disposition === "absent") {
      incompleteReasons.push(`source_payload_absent:${namespace}`);
      continue;
    }
    if (capture.disposition === "malformed") {
      conflictingReasons.push(`source_payload_malformed:${namespace}`);
      continue;
    }
    const payloadDigest =
      marketContextDiagnosticContextSha256V1(capture.material);
    if (payloadDigest !== expected.payload_digest) {
      capture.disposition = "rejected";
      capture.reason_codes.push("source_payload_digest_mismatch");
      conflictingReasons.push(`source_payload_digest_mismatch:${namespace}`);
    }
  }
  if (conflictingReasons.length > 0) {
    return {
      taxonomy: "conflicting" as const,
      reasons: sortedUnique(conflictingReasons),
      bundle: null,
    };
  }
  if (unmappableReasons.length > 0) {
    return {
      taxonomy: "unmappable" as const,
      reasons: sortedUnique(unmappableReasons),
      bundle: null,
    };
  }
  if (incompleteReasons.length > 0) {
    return {
      taxonomy: "incomplete" as const,
      reasons: sortedUnique(incompleteReasons),
      bundle: null,
    };
  }

  const decision = exactKeys(
    captures.decision_source.material,
    [
      "schema_version",
      "source_identity",
      "external_decision_id",
      "decision_timestamp",
      "instrument_id",
      "context_snapshot_identity",
      "context_snapshot_digest",
      "latest_finalized_bucket_unix_ns",
      "source_timestamp",
    ],
    "$decision",
    conflictingReasons,
  );
  const opportunity = exactKeys(
    captures.opportunity_set_source.material,
    [
      "schema_version",
      "source_identity",
      "opportunity_set_identity",
      "completeness",
      "membership",
    ],
    "$opportunity",
    conflictingReasons,
  );
  const evaluator = exactKeys(
    captures.evaluator_outcome_source.material,
    [
      "schema_version",
      "source_identity",
      "outcome_identity",
      "external_decision_id",
      "instrument_id",
      "baseline_version",
      "candidate_version",
      "evaluator_identity",
      "evaluator_version",
      "outcome_window",
      "completion",
      "capture_timestamp",
      "evaluator_run_digest",
      "definitions",
      "realized_outcome",
      "membership",
    ],
    "$evaluator",
    conflictingReasons,
  );
  const provider = exactKeys(
    captures.provider_context_source.material,
    [
      "schema_version",
      "source_identity",
      "provider_source",
      "provider_version",
      "source_timestamp",
      "evaluator_lineage_digest",
      "outcome_lineage_digest",
    ],
    "$provider",
    conflictingReasons,
  );
  const cost = exactKeys(
    captures.cost_slippage_source.material,
    [
      "schema_version",
      "source_identity",
      "status",
      "cost_model_version",
      "slippage_model_version",
      "provenance_digest",
    ],
    "$cost",
    conflictingReasons,
  );
  if (
    !decision ||
    !opportunity ||
    !evaluator ||
    !provider ||
    !cost
  ) {
    return {
      taxonomy: "conflicting" as const,
      reasons: sortedUnique(conflictingReasons),
      bundle: null,
    };
  }
  requireNonEmptyStrings(
    decision,
    [
      "schema_version",
      "source_identity",
      "external_decision_id",
      "decision_timestamp",
      "instrument_id",
      "context_snapshot_identity",
      "context_snapshot_digest",
      "latest_finalized_bucket_unix_ns",
      "source_timestamp",
    ],
    "$decision",
    conflictingReasons,
  );
  requireNonEmptyStrings(
    opportunity,
    [
      "schema_version",
      "source_identity",
      "opportunity_set_identity",
      "completeness",
    ],
    "$opportunity",
    conflictingReasons,
  );
  requireNonEmptyStrings(
    evaluator,
    [
      "schema_version",
      "source_identity",
      "outcome_identity",
      "external_decision_id",
      "instrument_id",
      "baseline_version",
      "candidate_version",
      "evaluator_identity",
      "evaluator_version",
      "capture_timestamp",
      "evaluator_run_digest",
    ],
    "$evaluator",
    conflictingReasons,
  );
  requireNonEmptyStrings(
    provider,
    [
      "schema_version",
      "source_identity",
      "provider_source",
      "provider_version",
      "source_timestamp",
      "evaluator_lineage_digest",
      "outcome_lineage_digest",
    ],
    "$provider",
    conflictingReasons,
  );
  requireNonEmptyStrings(
    cost,
    ["schema_version", "source_identity", "status", "provenance_digest"],
    "$cost",
    conflictingReasons,
  );

  const outcomeWindow = exactKeys(
    evaluator.outcome_window,
    ["definition", "start_timestamp", "end_timestamp"],
    "$evaluator.outcome_window",
    conflictingReasons,
  );
  const completion = exactKeys(
    evaluator.completion,
    ["status", "completion_timestamp", "evidence_digest"],
    "$evaluator.completion",
    conflictingReasons,
  );
  const definitions = exactKeys(
    evaluator.definitions,
    ["target", "stop", "diagnostic_horizon"],
    "$evaluator.definitions",
    conflictingReasons,
  );
  const realized = exactKeys(
    evaluator.realized_outcome,
    ["label", "value", "unit"],
    "$evaluator.realized_outcome",
    conflictingReasons,
  );
  const outcomeMembership = exactKeys(
    evaluator.membership,
    ["opportunity_set_identity", "dataset"],
    "$evaluator.membership",
    conflictingReasons,
  );
  if (
    !outcomeWindow ||
    !completion ||
    !definitions ||
    !realized ||
    !outcomeMembership
  ) {
    return {
      taxonomy: "conflicting" as const,
      reasons: sortedUnique(conflictingReasons),
      bundle: null,
    };
  }
  requireNonEmptyStrings(
    outcomeWindow,
    ["definition", "start_timestamp", "end_timestamp"],
    "$evaluator.outcome_window",
    conflictingReasons,
  );
  requireNonEmptyStrings(
    definitions,
    ["target", "stop", "diagnostic_horizon"],
    "$evaluator.definitions",
    conflictingReasons,
  );
  requireNonEmptyStrings(
    outcomeMembership,
    ["opportunity_set_identity", "dataset"],
    "$evaluator.membership",
    conflictingReasons,
  );
  if (
    !["completed", "pending"].includes(String(completion.status)) ||
    typeof completion.evidence_digest !== "string" ||
    (completion.status === "completed" &&
      typeof completion.completion_timestamp !== "string") ||
    (completion.status === "pending" &&
      completion.completion_timestamp !== null)
  ) {
    conflictingReasons.push("outcome_completion_contract_invalid");
  }
  if (
    typeof realized.label !== "string" ||
    !(
      realized.value === null ||
      typeof realized.value === "string"
    ) ||
    !(realized.unit === null || typeof realized.unit === "string")
  ) {
    conflictingReasons.push("realized_outcome_contract_invalid");
  }
  if (
    !["declared", "not_available"].includes(String(cost.status)) ||
    !(
      cost.cost_model_version === null ||
      typeof cost.cost_model_version === "string"
    ) ||
    !(
      cost.slippage_model_version === null ||
      typeof cost.slippage_model_version === "string"
    )
  ) {
    conflictingReasons.push("cost_slippage_contract_invalid");
  }
  const completionPending = completion?.status !== "completed";
  const parsed = {
    decision: parseDatabentoExplicitNanosecondInstantV1(
      decision.decision_timestamp,
      "decision.decision_timestamp",
    ),
    decisionSource: parseDatabentoExplicitNanosecondInstantV1(
      decision.source_timestamp,
      "decision.source_timestamp",
    ),
    outcomeStart: parseDatabentoExplicitNanosecondInstantV1(
      outcomeWindow.start_timestamp,
      "outcome.start_timestamp",
    ),
    outcomeEnd: parseDatabentoExplicitNanosecondInstantV1(
      outcomeWindow.end_timestamp,
      "outcome.end_timestamp",
    ),
    completion: parseDatabentoExplicitNanosecondInstantV1(
      completionPending
        ? evaluator.capture_timestamp
        : completion?.completion_timestamp,
      "outcome.completion_timestamp",
    ),
    capture: parseDatabentoExplicitNanosecondInstantV1(
      evaluator.capture_timestamp,
      "outcome.capture_timestamp",
    ),
    provider: parseDatabentoExplicitNanosecondInstantV1(
      provider.source_timestamp,
      "provider.source_timestamp",
    ),
  };
  if (Object.values(parsed).some((entry) => !entry.ok)) {
    temporalReasons.push("capture_explicit_instant_invalid");
  } else {
    const values = Object.fromEntries(
      Object.entries(parsed).map(([key, entry]) => [
        key,
        BigInt(entry.ok ? entry.unix_nanoseconds : "0"),
      ]),
    ) as Record<keyof typeof parsed, bigint>;
    const completedOrdering =
      values.decision < values.outcomeStart &&
      values.outcomeStart <= values.outcomeEnd &&
      (completionPending
        ? values.outcomeEnd <= values.capture
        : values.outcomeEnd <= values.completion &&
          values.completion <= values.capture);
    if (!completedOrdering) {
      temporalReasons.push("capture_temporal_order_invalid");
    }
    if (
      values.decisionSource > values.decision ||
      values.provider > values.capture ||
      !isUnixNs(decision.latest_finalized_bucket_unix_ns) ||
      BigInt(String(decision.latest_finalized_bucket_unix_ns)) >
        values.decision
    ) {
      temporalReasons.push("capture_source_or_finalization_after_boundary");
    }
    if (
      values.decision <
        BigInt(registry.validity.effective_from_unix_ns) ||
      values.capture >= BigInt(registry.validity.effective_until_unix_ns)
    ) {
      temporalReasons.push("capture_outside_registry_validity");
    }
  }

  const membership = Array.isArray(opportunity.membership)
    ? opportunity.membership
        .map((entry, index) =>
          exactKeys(
            entry,
            ["instrument_id", "ordinal"],
            `$opportunity.membership[${index}]`,
            conflictingReasons,
          ),
        )
        .filter((entry): entry is JsonRecord => entry !== null)
        .map((entry) => ({
          instrument_id: String(entry.instrument_id),
          ordinal: Number(entry.ordinal),
        }))
        .sort(
          (left, right) =>
            left.ordinal - right.ordinal ||
            left.instrument_id.localeCompare(right.instrument_id),
        )
    : [];
  if (
    opportunity.completeness !== "complete" ||
    membership.length === 0
  ) {
    incompleteReasons.push("opportunity_membership_incomplete");
  }
  if (
    membership.some(
      (entry) =>
        !entry.instrument_id ||
        !Number.isSafeInteger(entry.ordinal) ||
        entry.ordinal < 0,
    ) ||
    new Set(membership.map((entry) => entry.instrument_id)).size !==
      membership.length ||
    new Set(membership.map((entry) => entry.ordinal)).size !==
      membership.length
  ) {
    conflictingReasons.push("opportunity_membership_collision");
  }

  if (completion?.status !== "completed") {
    incompleteReasons.push("outcome_completion_missing");
  }
  if (
    decision.external_decision_id !== evaluator.external_decision_id ||
    decision.instrument_id !== evaluator.instrument_id ||
    opportunity.opportunity_set_identity !==
      outcomeMembership.opportunity_set_identity
  ) {
    conflictingReasons.push("decision_outcome_identity_mismatch");
  }
  if (
    evaluator.evaluator_identity !==
      registry.producer.identity ||
    evaluator.evaluator_version !==
      registry.producer.version
  ) {
    conflictingReasons.push("evaluator_identity_or_version_mismatch");
  }
  if (
    !membership.some(
      (entry) => entry.instrument_id === decision.instrument_id,
    )
  ) {
    unmappableReasons.push("decision_instrument_not_in_opportunity_set");
  }
  if (
    !isSha256(decision.context_snapshot_digest) ||
    !isSha256(evaluator.evaluator_run_digest) ||
    !isSha256(completion?.evidence_digest) ||
    !isSha256(provider.evaluator_lineage_digest) ||
    !isSha256(provider.outcome_lineage_digest) ||
    !isSha256(cost.provenance_digest)
  ) {
    conflictingReasons.push("capture_lineage_digest_invalid");
  }

  if (conflictingReasons.length > 0) {
    return {
      taxonomy: "conflicting" as const,
      reasons: sortedUnique(conflictingReasons),
      bundle: null,
    };
  }
  if (temporalReasons.length > 0) {
    return {
      taxonomy: "not_point_in_time_safe" as const,
      reasons: sortedUnique(temporalReasons),
      bundle: null,
    };
  }
  if (unmappableReasons.length > 0) {
    return {
      taxonomy: "unmappable" as const,
      reasons: sortedUnique(unmappableReasons),
      bundle: null,
    };
  }
  if (incompleteReasons.length > 0) {
    return {
      taxonomy: "incomplete" as const,
      reasons: sortedUnique(incompleteReasons),
      bundle: null,
    };
  }

  const outcomeMaterial = {
    handoff_version:
      MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1,
    outcome_identity: String(evaluator.outcome_identity),
    decision_identity: {
      external_decision_id: String(decision.external_decision_id),
      decision_unix_ns:
        parsed.decision.ok
          ? parsed.decision.unix_nanoseconds
          : "0",
      instrument_id: String(decision.instrument_id),
    },
    opportunity_set: {
      identity: String(opportunity.opportunity_set_identity),
      completeness: "complete" as const,
      membership,
      membership_digest:
        marketContextDiagnosticContextSha256V1(membership),
    },
    versions: {
      baseline: String(evaluator.baseline_version),
      candidate: String(evaluator.candidate_version),
      evaluator: String(evaluator.evaluator_version),
    },
    outcome_window: {
      definition: String(outcomeWindow?.definition),
      start_timestamp: String(outcomeWindow?.start_timestamp),
      end_timestamp: String(outcomeWindow?.end_timestamp),
    },
    outcome_completion: {
      status: "completed" as const,
      completion_timestamp: String(completion?.completion_timestamp),
      evidence_digest: String(completion?.evidence_digest),
    },
    evaluation: {
      capture_timestamp: String(evaluator.capture_timestamp),
      evaluator_run_digest: String(evaluator.evaluator_run_digest),
    },
    definitions: {
      target: String(definitions?.target),
      stop: String(definitions?.stop),
      diagnostic_horizon: String(definitions?.diagnostic_horizon),
    },
    cost_slippage: {
      status:
        cost.status === "declared"
          ? ("declared" as const)
          : ("not_available" as const),
      cost_model_version:
        typeof cost.cost_model_version === "string"
          ? cost.cost_model_version
          : null,
      slippage_model_version:
        typeof cost.slippage_model_version === "string"
          ? cost.slippage_model_version
          : null,
      provenance_digest: String(cost.provenance_digest),
    },
    lineage: {
      provider_source: String(provider.provider_source),
      provider_version: String(provider.provider_version),
      evaluator_lineage_digest: String(
        provider.evaluator_lineage_digest,
      ),
      outcome_lineage_digest: String(provider.outcome_lineage_digest),
    },
    membership: {
      period: request.period,
      cohort: request.cohort,
      dataset: String(outcomeMembership?.dataset),
    },
    later_observed_outcome: {
      label: String(realized?.label),
      value:
        realized?.value === null ? null : String(realized?.value),
      unit: realized?.unit === null ? null : String(realized?.unit),
    },
  } satisfies Omit<
    MarketContextDiagnosticOutcomeBundleHandoffV1,
    "bundle_digest"
  >;
  const outcomeHandoff = {
    ...outcomeMaterial,
    bundle_digest:
      marketContextDiagnosticOutcomeBundleDigestV1(outcomeMaterial),
  };
  const sourcePayloadDigests = Object.fromEntries(
    SOURCE_NAMESPACES.map((namespace) => [
      namespace,
      registry.sources[namespace].payload_digest,
    ]),
  ) as Record<DiagnosticOutcomeSourceNamespaceV1, string>;
  const captureMaterial = {
    bundle_version:
      DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_BUNDLE_V1,
    capture_identity: request.capture_identity,
    period: request.period,
    cohort: request.cohort,
    source_registry: {
      registry_identity: registry.registry_identity,
      registry_version: registry.registry_version,
      registry_digest: registry.registry_digest,
      trust_root_digest: registry.expected_trust_root_digest,
    },
    source_payload_digests: sourcePayloadDigests,
    outcome_handoff: outcomeHandoff,
  };
  return {
    taxonomy: "captured" as const,
    reasons: ["diagnostic_outcome_handoff_captured"],
    bundle: {
      ...captureMaterial,
      capture_bundle_digest:
        marketContextDiagnosticContextSha256V1(captureMaterial),
    },
  };
}

export function captureDiagnosticDecisionOutcomeHandoffV1(
  value: unknown,
  dependencies: DiagnosticDecisionOutcomeCaptureDependenciesV1,
): DiagnosticDecisionOutcomeCaptureResultV1 {
  if (!dependencies.enabled) return defaultOffResult;
  if (dependencies.kill_switch) return killSwitchResult;

  const validation = requestValidation(value);
  const requestCapture = observedCapture(
    "capture_request",
    value,
    ["contract_version"],
  );
  if (validation.length > 0) {
    return result(
      value,
      validation.some((reason) => reason.includes("timestamp"))
        ? "not_point_in_time_safe"
        : "conflicting",
      validation,
      binding(null, null, "invalid"),
      [requestCapture],
      null,
    );
  }
  const request =
    value as DiagnosticDecisionOutcomeCaptureRequestV1;
  const authority = dependencies.authority;
  if (
    !authority ||
    authority.authority_version !==
      DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V1
  ) {
    return result(
      request,
      "conflicting",
      ["external_source_authority_missing_or_invalid"],
      binding(null, null, "missing"),
      [absentCapture("source_registry", "authority_missing")],
      null,
    );
  }

  let registryValue: unknown;
  try {
    registryValue = authority.read_registry();
  } catch {
    return result(
      request,
      "conflicting",
      ["source_registry_lookup_exception_sanitized"],
      binding(authority, null, "lookup_failed"),
      [
        absentCapture(
          "source_registry",
          "registry_lookup_exception_sanitized",
        ),
      ],
      null,
    );
  }
  const registryCapture = observedCapture(
    "source_registry",
    registryValue,
    ["registry_version"],
  );
  const checked = validateRegistry(registryValue);
  if (!checked.registry) {
    registryCapture.disposition = "rejected";
    registryCapture.reason_codes.push(...checked.reasons);
    return result(
      request,
      "conflicting",
      checked.reasons,
      binding(authority, null, "invalid"),
      [registryCapture],
      null,
    );
  }
  const registry = checked.registry;
  const anchor = authority.expected_registry_anchor;
  if (
    anchor.registry_identity !== registry.registry_identity ||
    anchor.registry_version !== registry.registry_version ||
    anchor.registry_digest !== registry.registry_digest
  ) {
    registryCapture.disposition = "rejected";
    registryCapture.reason_codes.push("source_registry_anchor_mismatch");
    return result(
      request,
      "conflicting",
      ["source_registry_anchor_mismatch"],
      binding(authority, registry, "mismatch"),
      [registryCapture],
      registry,
    );
  }
  registryCapture.disposition = "verified";
  const captures = readSources(request, authority);
  const built = validateAndBuildBundle(request, registry, captures);
  return result(
    request,
    built.taxonomy,
    built.reasons,
    binding(authority, registry, "verified"),
    [registryCapture, ...SOURCE_NAMESPACES.map((key) => captures[key])],
    registry,
    built.bundle,
  );
}

function conflictFromResult(
  source: DiagnosticDecisionOutcomeCaptureResultV1,
  reason: string,
) {
  const material = {
    ...source,
    taxonomy: "conflicting" as const,
    bundle: null,
    reason_codes: sortedUnique([...source.reason_codes, reason]),
  };
  const withoutDigests = {
    ...material,
    failure_identity_digest: marketContextDiagnosticContextSha256V1({
      taxonomy: "conflicting",
      prior_terminal_capture_digest: source.terminal_capture_digest,
      reason,
    }),
  };
  const terminalMaterial = Object.fromEntries(
    Object.entries(withoutDigests).filter(
      ([key]) => key !== "terminal_capture_digest",
    ),
  );
  return {
    ...withoutDigests,
    terminal_capture_digest:
      marketContextDiagnosticContextSha256V1(terminalMaterial),
  };
}

export function captureDiagnosticDecisionOutcomeHandoffBatchV1(
  values: unknown[],
  dependencies: DiagnosticDecisionOutcomeCaptureDependenciesV1,
) {
  if (!dependencies.enabled) return [defaultOffResult];
  if (dependencies.kill_switch) return [killSwitchResult];
  const results = values.map((value) =>
    captureDiagnosticDecisionOutcomeHandoffV1(value, dependencies),
  );
  const identities = new Map<string, Set<string>>();
  const decisionIdentities = new Map<string, Set<string>>();
  for (const result of results) {
    const set =
      identities.get(result.request_identity.capture_identity) ??
      new Set<string>();
    set.add(result.request_identity.request_digest);
    identities.set(result.request_identity.capture_identity, set);
    if (result.bundle) {
      const decisionIdentity =
        stableMarketContextDiagnosticContextJsonV1(
          result.bundle.outcome_handoff.decision_identity,
        );
      const decisionSet =
        decisionIdentities.get(decisionIdentity) ?? new Set<string>();
      decisionSet.add(result.bundle.outcome_handoff.bundle_digest);
      decisionIdentities.set(decisionIdentity, decisionSet);
    }
  }
  return results
    .map((entry) => {
      const set = identities.get(entry.request_identity.capture_identity);
      if (!set || set.size === 0) return entry;
      const duplicateCount = results.filter(
        (candidate) =>
          candidate.request_identity.capture_identity ===
          entry.request_identity.capture_identity,
      ).length;
      if (duplicateCount <= 1) return entry;
      return conflictFromResult(
        entry,
        set.size === 1
          ? "duplicate_capture_identity"
          : "capture_identity_conflicting_bytes",
      );
    })
    .map((entry) => {
      if (!entry.bundle) return entry;
      const decisionIdentity =
        stableMarketContextDiagnosticContextJsonV1(
          entry.bundle.outcome_handoff.decision_identity,
        );
      const decisionSet = decisionIdentities.get(decisionIdentity);
      const decisionCount = results.filter(
        (candidate) =>
          candidate.bundle &&
          stableMarketContextDiagnosticContextJsonV1(
            candidate.bundle.outcome_handoff.decision_identity,
          ) === decisionIdentity,
      ).length;
      if (!decisionSet || decisionCount <= 1) return entry;
      return conflictFromResult(
        entry,
        decisionSet.size === 1
          ? "duplicate_decision_identity"
          : "decision_identity_conflicting_bytes",
      );
    })
    .sort((left, right) =>
      left.request_identity.capture_identity.localeCompare(
        right.request_identity.capture_identity,
      ) ||
      left.request_identity.request_digest.localeCompare(
        right.request_identity.request_digest,
      ),
    );
}

export function verifyDiagnosticDecisionOutcomeCaptureResultV1(
  candidate: DiagnosticDecisionOutcomeCaptureResultV1,
  value: unknown,
  dependencies: DiagnosticDecisionOutcomeCaptureDependenciesV1,
) {
  return (
    stableMarketContextDiagnosticContextJsonV1(candidate) ===
    stableMarketContextDiagnosticContextJsonV1(
      captureDiagnosticDecisionOutcomeHandoffV1(value, dependencies),
    )
  );
}

export const DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_COMPATIBILITY_V1 = {
  output_contract:
    DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_BUNDLE_V1,
  o2a_outcome_handoff_contract:
    MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1,
  real_outcome_capture_performed: false,
  canonical_binding_ready: false,
  automatic_model_input_allowed: false,
  live_ranking_effect: false,
} as const;
