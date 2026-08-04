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

export const DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2 =
  "diagnostic_decision_outcome_handoff_capture_v2" as const;
export const DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_BUNDLE_V2 =
  "diagnostic_decision_outcome_handoff_bundle_v2" as const;
export const DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2 =
  "diagnostic_outcome_source_registry_v2" as const;
export const DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2 =
  "diagnostic_outcome_source_authority_v2" as const;
export const DIAGNOSTIC_OUTCOME_AUTHORITY_MATERIAL_V2 =
  "diagnostic_outcome_authority_material_v2" as const;
export const DIAGNOSTIC_OUTCOME_REGISTRY_SNAPSHOT_V1 =
  "diagnostic_outcome_registry_snapshot_v1" as const;
export const DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V2 =
  "diagnostic_outcome_capture_failure_provenance_v2" as const;

const SOURCE_NAMESPACES = [
  "decision_source",
  "opportunity_set_source",
  "evaluator_outcome_source",
  "provider_context_source",
  "cost_slippage_source",
] as const;

export type DiagnosticOutcomeSourceNamespaceV2 =
  (typeof SOURCE_NAMESPACES)[number];

export const DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_TAXONOMY_V2 = [
  "captured",
  "incomplete",
  "conflicting",
  "not_point_in_time_safe",
  "unmappable",
] as const;

export type DiagnosticDecisionOutcomeCaptureTaxonomyV2 =
  (typeof DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_TAXONOMY_V2)[number];

export const DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_BOUNDARY_V2 = {
  diagnostic_only: true,
  shadow_only: true,
  canonical_performance_eligible: false,
  automatic_model_input_allowed: false,
  automatic_training_allowed: false,
  automatic_promotion_allowed: false,
  causal_claimed: false,
  live_ranking_effect: false,
} as const;

type PlainValue =
  | null
  | boolean
  | number
  | string
  | PlainValue[]
  | { [key: string]: PlainValue };
type PlainRecord = { [key: string]: PlainValue };

export type DiagnosticDecisionOutcomeCaptureRequestV2 = {
  contract_version: typeof DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2;
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

export type DiagnosticOutcomeSourceRegistryEntryV2 = {
  namespace: DiagnosticOutcomeSourceNamespaceV2;
  schema_version: string;
  payload_identity: string;
  payload_digest: string;
  verifier_identity: string;
  verifier_version: string;
};

export type DiagnosticOutcomeSourceRegistryV2 = {
  registry_version: typeof DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2;
  registry_identity: string;
  producer: { identity: string; version: string };
  expected_trust_root_digest: string;
  validity: {
    effective_from_unix_ns: string;
    effective_until_unix_ns: string;
  };
  sources: Record<
    DiagnosticOutcomeSourceNamespaceV2,
    DiagnosticOutcomeSourceRegistryEntryV2
  >;
};

export type DiagnosticOutcomeAuthorityMaterialV2 = {
  material_version: typeof DIAGNOSTIC_OUTCOME_AUTHORITY_MATERIAL_V2;
  registry: DiagnosticOutcomeSourceRegistryV2;
  source_payloads: Record<DiagnosticOutcomeSourceNamespaceV2, PlainValue>;
};

export type DiagnosticOutcomeSourceAuthorityV2 = {
  authority_version: typeof DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2;
  expected_registry_anchor: {
    registry_identity: string;
    registry_version: typeof DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2;
    registry_snapshot_digest: string;
  };
  read_capture_material: () => unknown;
};

export type DiagnosticDecisionOutcomeCaptureDependenciesV2 = {
  enabled: boolean;
  kill_switch: boolean;
  authority?: DiagnosticOutcomeSourceAuthorityV2;
};

export type DiagnosticOutcomeRegistrySnapshotBindingV2 = {
  snapshot_version: typeof DIAGNOSTIC_OUTCOME_REGISTRY_SNAPSHOT_V1;
  snapshot_identity: string | null;
  registry_version:
    | typeof DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2
    | null;
  registry_snapshot_digest: string | null;
  authority_material_digest: string | null;
  expected_registry_root_digest: string | null;
  disposition:
    | "verified"
    | "absent"
    | "malformed"
    | "rejected"
    | "not_read_default_off"
    | "not_read_kill_switch";
  source_entry_digests: Record<
    DiagnosticOutcomeSourceNamespaceV2,
    string | null
  >;
};

export type DiagnosticOutcomeObservedSourceProvenanceV2 = {
  namespace:
    | DiagnosticOutcomeSourceNamespaceV2
    | "capture_request"
    | "authority_material"
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

export type DiagnosticDecisionOutcomeCapturedBundleV2 = {
  bundle_version: typeof DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_BUNDLE_V2;
  capture_identity: string;
  period: string;
  cohort: string;
  source_registry: {
    registry_identity: string;
    registry_version: typeof DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2;
    registry_snapshot_digest: string;
    authority_material_digest: string;
    trust_root_digest: string;
  };
  source_payload_digests: Record<DiagnosticOutcomeSourceNamespaceV2, string>;
  outcome_handoff: MarketContextDiagnosticOutcomeBundleHandoffV1;
  capture_bundle_digest: string;
};

export type DiagnosticDecisionOutcomeCaptureResultV2 = {
  contract_version: typeof DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2;
  taxonomy: DiagnosticDecisionOutcomeCaptureTaxonomyV2;
  request_identity: {
    capture_identity: string;
    request_digest: string;
  };
  authority_binding: {
    authority_version:
      | typeof DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2
      | null;
    verification_status:
      | "verified"
      | "not_read_default_off"
      | "not_read_kill_switch"
      | "missing"
      | "lookup_failed"
      | "invalid"
      | "mismatch";
  };
  registry_snapshot_binding: DiagnosticOutcomeRegistrySnapshotBindingV2;
  observed_source_provenance: {
    provenance_version:
      typeof DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V2;
    sections: DiagnosticOutcomeObservedSourceProvenanceV2[];
    provenance_digest: string;
  };
  failure_identity_digest: string | null;
  bundle: DiagnosticDecisionOutcomeCapturedBundleV2 | null;
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

export type DiagnosticOutcomeAuthoritySnapshotSuccessV2 = {
  ok: true;
  snapshot: Readonly<DiagnosticOutcomeAuthorityMaterialV2>;
  binding: DiagnosticOutcomeRegistrySnapshotBindingV2;
};

export type DiagnosticOutcomeAuthoritySnapshotFailureV2 = {
  ok: false;
  binding: DiagnosticOutcomeRegistrySnapshotBindingV2;
  reason_codes: string[];
  observed_input_digest: string;
};

const ZERO_DIGEST = "0".repeat(64);
const NULL_SOURCE_DIGESTS = Object.freeze(
  Object.fromEntries(SOURCE_NAMESPACES.map((namespace) => [namespace, null])),
) as Record<DiagnosticOutcomeSourceNamespaceV2, null>;

function sha(value: unknown) {
  return marketContextDiagnosticContextSha256V1(value);
}

function sortedUnique(values: string[]) {
  return [...new Set(values)].sort((left, right) =>
    left.localeCompare(right),
  );
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

function isUnixNs(value: unknown): value is string {
  return typeof value === "string" && /^(0|[1-9]\d*)$/.test(value);
}

function record(value: unknown): PlainRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as PlainRecord)
    : null;
}

function exactKeys(
  value: unknown,
  expected: readonly string[],
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

function requireStrings(
  value: PlainRecord,
  keys: readonly string[],
  path: string,
  reasons: string[],
) {
  for (const key of keys) {
    if (typeof value[key] !== "string" || value[key].length === 0) {
      reasons.push(`${path}:invalid_string:${key}`);
    }
  }
}

type CanonicalizationResult =
  | { ok: true; value: PlainValue }
  | {
      ok: false;
      reason_codes: string[];
      sanitized_projection_digest: string;
    };

export function canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(
  value: unknown,
): CanonicalizationResult {
  const reasons: string[] = [];
  const active = new WeakSet<object>();

  function visit(candidate: unknown, path: string): PlainValue | null {
    if (
      candidate === null ||
      typeof candidate === "string" ||
      typeof candidate === "boolean"
    ) {
      return candidate;
    }
    if (typeof candidate === "number") {
      if (!Number.isFinite(candidate)) {
        reasons.push(`${path}:non_finite_number`);
        return null;
      }
      return candidate;
    }
    if (
      typeof candidate === "undefined" ||
      typeof candidate === "bigint" ||
      typeof candidate === "symbol" ||
      typeof candidate === "function"
    ) {
      reasons.push(`${path}:unsupported_runtime_type:${typeof candidate}`);
      return null;
    }
    if (typeof candidate !== "object") {
      reasons.push(`${path}:unsupported_runtime_value`);
      return null;
    }
    if (active.has(candidate)) {
      reasons.push(`${path}:cyclic_reference`);
      return null;
    }
    active.add(candidate);
    let ownKeys: (string | symbol)[];
    let prototype: object | null;
    let descriptors: PropertyDescriptorMap;
    try {
      ownKeys = Reflect.ownKeys(candidate);
      prototype = Object.getPrototypeOf(candidate);
      descriptors = Object.getOwnPropertyDescriptors(candidate);
    } catch {
      reasons.push(`${path}:runtime_introspection_failed_sanitized`);
      active.delete(candidate);
      return null;
    }
    if (ownKeys.some((key) => typeof key === "symbol")) {
      reasons.push(`${path}:symbol_key_not_allowed`);
    }
    if (Array.isArray(candidate)) {
      if (prototype !== Array.prototype) {
        reasons.push(`${path}:unexpected_array_prototype`);
      }
      const numericKeys = Object.keys(descriptors)
        .filter((key) => key !== "length")
        .sort((left, right) => Number(left) - Number(right));
      if (
        numericKeys.length !== candidate.length ||
        numericKeys.some((key, index) => key !== String(index))
      ) {
        reasons.push(`${path}:sparse_or_noncanonical_array`);
      }
      const output: PlainValue[] = [];
      for (let index = 0; index < candidate.length; index += 1) {
        const descriptor = descriptors[String(index)];
        if (!descriptor || !("value" in descriptor)) {
          reasons.push(`${path}[${index}]:accessor_or_missing_value`);
          output.push(null);
          continue;
        }
        output.push(visit(descriptor.value, `${path}[${index}]`));
      }
      active.delete(candidate);
      return output;
    }
    if (prototype !== Object.prototype && prototype !== null) {
      reasons.push(`${path}:unexpected_object_prototype`);
    }
    const output: PlainRecord = {};
    for (const key of Object.keys(descriptors).sort((left, right) =>
      left.localeCompare(right),
    )) {
      const descriptor = descriptors[key];
      if (!("value" in descriptor)) {
        reasons.push(`${path}.${key}:accessor_not_allowed`);
        continue;
      }
      output[key] = visit(descriptor.value, `${path}.${key}`);
    }
    active.delete(candidate);
    return output;
  }

  const canonical = visit(value, "$");
  const reasonCodes = sortedUnique(reasons);
  return reasons.length === 0
    ? { ok: true, value: canonical }
    : {
        ok: false,
        reason_codes: reasonCodes,
        sanitized_projection_digest: sha({
          projection_contract:
            "diagnostic_outcome_rejected_plain_data_projection_v1",
          canonical_partial_projection: canonical,
          reason_codes: reasonCodes,
        }),
      };
}

function snapshotBinding(
  disposition: DiagnosticOutcomeRegistrySnapshotBindingV2["disposition"],
  anchor: DiagnosticOutcomeSourceAuthorityV2["expected_registry_anchor"] | null,
  registry: DiagnosticOutcomeSourceRegistryV2 | null = null,
  registryDigest: string | null = null,
  materialDigest: string | null = null,
): DiagnosticOutcomeRegistrySnapshotBindingV2 {
  return {
    snapshot_version: DIAGNOSTIC_OUTCOME_REGISTRY_SNAPSHOT_V1,
    snapshot_identity:
      registry?.registry_identity ?? anchor?.registry_identity ?? null,
    registry_version:
      registry?.registry_version ?? anchor?.registry_version ?? null,
    registry_snapshot_digest: registryDigest,
    authority_material_digest: materialDigest,
    expected_registry_root_digest:
      anchor?.registry_snapshot_digest ?? null,
    disposition,
    source_entry_digests: registry
      ? Object.fromEntries(
          SOURCE_NAMESPACES.map((namespace) => [
            namespace,
            registry.sources[namespace].payload_digest,
          ]),
        ) as Record<DiagnosticOutcomeSourceNamespaceV2, string>
      : NULL_SOURCE_DIGESTS,
  };
}

function validateRegistryShape(value: unknown) {
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
    ],
    "$.registry",
    reasons,
  );
  const producer = exactKeys(
    registry?.producer,
    ["identity", "version"],
    "$.registry.producer",
    reasons,
  );
  const validity = exactKeys(
    registry?.validity,
    ["effective_from_unix_ns", "effective_until_unix_ns"],
    "$.registry.validity",
    reasons,
  );
  const sources = exactKeys(
    registry?.sources,
    SOURCE_NAMESPACES,
    "$.registry.sources",
    reasons,
  );
  if (
    registry?.registry_version !== DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2 ||
    typeof registry.registry_identity !== "string" ||
    registry.registry_identity.length === 0 ||
    !producer ||
    typeof producer.identity !== "string" ||
    producer.identity.length === 0 ||
    typeof producer.version !== "string" ||
    producer.version.length === 0 ||
    !isSha256(registry.expected_trust_root_digest) ||
    !validity ||
    !isUnixNs(validity.effective_from_unix_ns) ||
    !isUnixNs(validity.effective_until_unix_ns) ||
    (isUnixNs(validity?.effective_from_unix_ns) &&
      isUnixNs(validity?.effective_until_unix_ns) &&
      BigInt(validity.effective_from_unix_ns) >=
        BigInt(validity.effective_until_unix_ns))
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
      `$.registry.sources.${namespace}`,
      reasons,
    );
    if (
      !entry ||
      entry.namespace !== namespace ||
      typeof entry.schema_version !== "string" ||
      entry.schema_version.length === 0 ||
      typeof entry.payload_identity !== "string" ||
      entry.payload_identity.length === 0 ||
      !isSha256(entry.payload_digest) ||
      typeof entry.verifier_identity !== "string" ||
      entry.verifier_identity.length === 0 ||
      typeof entry.verifier_version !== "string" ||
      entry.verifier_version.length === 0
    ) {
      reasons.push(`source_registry_entry_invalid:${namespace}`);
    }
  }
  return {
    registry:
      reasons.length === 0
        ? (value as DiagnosticOutcomeSourceRegistryV2)
        : null,
    reasons: sortedUnique(reasons),
  };
}

export function snapshotDiagnosticOutcomeAuthorityMaterialV2(
  observed: unknown,
  anchor: DiagnosticOutcomeSourceAuthorityV2["expected_registry_anchor"],
):
  | DiagnosticOutcomeAuthoritySnapshotSuccessV2
  | DiagnosticOutcomeAuthoritySnapshotFailureV2 {
  const canonical = canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(observed);
  if (!canonical.ok) {
    return {
      ok: false,
      binding: snapshotBinding("malformed", anchor),
      reason_codes: canonical.reason_codes,
      observed_input_digest: canonical.sanitized_projection_digest,
    };
  }
  const materialReasons: string[] = [];
  const material = exactKeys(
    canonical.value,
    ["material_version", "registry", "source_payloads"],
    "$",
    materialReasons,
  );
  const payloads = exactKeys(
    material?.source_payloads,
    SOURCE_NAMESPACES,
    "$.source_payloads",
    materialReasons,
  );
  if (
    material?.material_version !== DIAGNOSTIC_OUTCOME_AUTHORITY_MATERIAL_V2 ||
    !payloads
  ) {
    materialReasons.push("authority_material_contract_invalid");
  }
  const registryCheck = validateRegistryShape(material?.registry);
  materialReasons.push(...registryCheck.reasons);
  if (materialReasons.length > 0 || !registryCheck.registry) {
    const reasons = sortedUnique(materialReasons);
    return {
      ok: false,
      binding: snapshotBinding("rejected", anchor),
      reason_codes: reasons,
      observed_input_digest: sha(canonical.value),
    };
  }
  const snapshot = deepFreeze(
    canonical.value as DiagnosticOutcomeAuthorityMaterialV2,
  );
  const registry = snapshot.registry;
  const registryDigest = sha(registry);
  const materialDigest = sha(snapshot);
  if (
    anchor.registry_identity !== registry.registry_identity ||
    anchor.registry_version !== registry.registry_version ||
    anchor.registry_snapshot_digest !== registryDigest
  ) {
    return {
      ok: false,
      binding: snapshotBinding(
        "rejected",
        anchor,
        registry,
        registryDigest,
        materialDigest,
      ),
      reason_codes: ["source_registry_anchor_mismatch"],
      observed_input_digest: materialDigest,
    };
  }
  return {
    ok: true,
    snapshot,
    binding: snapshotBinding(
      "verified",
      anchor,
      registry,
      registryDigest,
      materialDigest,
    ),
  };
}

export function createDiagnosticOutcomeSourceRegistryV2(
  value: Omit<DiagnosticOutcomeSourceRegistryV2, "registry_version">,
): DiagnosticOutcomeSourceRegistryV2 {
  const canonical = canonicalizeDiagnosticOutcomeAuthorityPlainDataV2({
    registry_version: DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2,
    ...value,
  });
  if (!canonical.ok) throw new Error("invalid_registry_plain_data");
  const checked = validateRegistryShape(canonical.value);
  if (!checked.registry) throw new Error("invalid_registry_contract");
  return deepFreeze(checked.registry);
}

function requestReference(
  request: DiagnosticDecisionOutcomeCaptureRequestV2,
  namespace: DiagnosticOutcomeSourceNamespaceV2,
) {
  return {
    decision_source: request.source_references.decision_source_identity,
    opportunity_set_source:
      request.source_references.opportunity_set_source_identity,
    evaluator_outcome_source:
      request.source_references.evaluator_outcome_source_identity,
    provider_context_source:
      request.source_references.provider_context_source_identity,
    cost_slippage_source:
      request.source_references.cost_slippage_source_identity,
  }[namespace];
}

function validateRequest(value: unknown) {
  const canonical = canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(value);
  if (!canonical.ok) {
    return { request: null, reasons: canonical.reason_codes };
  }
  const reasons: string[] = [];
  const request = exactKeys(
    canonical.value,
    [
      "contract_version",
      "capture_identity",
      "period",
      "cohort",
      "source_references",
    ],
    "$request",
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
    "$request.source_references",
    reasons,
  );
  if (
    request?.contract_version !==
      DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2 ||
    !request ||
    !references
  ) {
    reasons.push("capture_request_contract_invalid");
  } else {
    requireStrings(
      request,
      ["capture_identity", "period", "cohort"],
      "$request",
      reasons,
    );
    requireStrings(
      references,
      [
        "decision_source_identity",
        "opportunity_set_source_identity",
        "evaluator_outcome_source_identity",
        "provider_context_source_identity",
        "cost_slippage_source_identity",
      ],
      "$request.source_references",
      reasons,
    );
  }
  return {
    request:
      reasons.length === 0
        ? (canonical.value as DiagnosticDecisionOutcomeCaptureRequestV2)
        : null,
    reasons: sortedUnique(reasons),
  };
}

function observedProvenance(
  request: DiagnosticDecisionOutcomeCaptureRequestV2 | null,
  snapshot: Readonly<DiagnosticOutcomeAuthorityMaterialV2> | null,
  snapshotFailure: DiagnosticOutcomeAuthoritySnapshotFailureV2 | null,
  sourceDispositions: Partial<
    Record<
      DiagnosticOutcomeSourceNamespaceV2,
      { disposition: "verified" | "rejected"; reasons: string[] }
    >
  > = {},
) {
  const registry = snapshot?.registry ?? null;
  const sections: DiagnosticOutcomeObservedSourceProvenanceV2[] = [];
  sections.push({
    namespace: "capture_request",
    schema_version: request?.contract_version ?? null,
    observed_payload_identity: request?.capture_identity ?? null,
    observed_input_digest: request ? sha(request) : ZERO_DIGEST,
    disposition: request ? "verified" : "malformed",
    expected_payload_identity: null,
    expected_payload_digest: null,
    expected_trust_root_digest: null,
    verifier_identity: "capture_request_closed_schema_verifier",
    verifier_version: DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2,
    reason_codes: request ? [] : ["capture_request_invalid"],
  });
  sections.push({
    namespace: "authority_material",
    schema_version: snapshot?.material_version ?? null,
    observed_payload_identity: registry?.registry_identity ?? null,
    observed_input_digest:
      snapshotFailure?.observed_input_digest ??
      (snapshot ? sha(snapshot) : ZERO_DIGEST),
    disposition: snapshot ? "verified" : snapshotFailure ? "rejected" : "absent",
    expected_payload_identity: null,
    expected_payload_digest: null,
    expected_trust_root_digest: registry?.expected_trust_root_digest ?? null,
    verifier_identity: "immutable_authority_material_snapshot_verifier",
    verifier_version: DIAGNOSTIC_OUTCOME_REGISTRY_SNAPSHOT_V1,
    reason_codes: snapshotFailure?.reason_codes ?? [],
  });
  if (snapshot) {
    const verifiedRegistry = snapshot.registry;
    sections.push({
      namespace: "source_registry",
      schema_version: verifiedRegistry.registry_version,
      observed_payload_identity: verifiedRegistry.registry_identity,
      observed_input_digest: sha(verifiedRegistry),
      disposition: "verified",
      expected_payload_identity: verifiedRegistry.registry_identity,
      expected_payload_digest: sha(verifiedRegistry),
      expected_trust_root_digest:
        verifiedRegistry.expected_trust_root_digest,
      verifier_identity: "external_registry_root_anchor_verifier",
      verifier_version: DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2,
      reason_codes: [],
    });
    for (const namespace of SOURCE_NAMESPACES) {
      const entry = verifiedRegistry.sources[namespace];
      const payload = snapshot.source_payloads[namespace];
      const disposition = sourceDispositions[namespace] ?? {
        disposition: "verified" as const,
        reasons: [],
      };
      sections.push({
        namespace,
        schema_version: entry.schema_version,
        observed_payload_identity:
          typeof record(payload)?.source_identity === "string"
            ? String(record(payload)?.source_identity)
            : null,
        observed_input_digest: sha(payload),
        disposition: disposition.disposition,
        expected_payload_identity: entry.payload_identity,
        expected_payload_digest: entry.payload_digest,
        expected_trust_root_digest:
          verifiedRegistry.expected_trust_root_digest,
        verifier_identity: entry.verifier_identity,
        verifier_version: entry.verifier_version,
        reason_codes: sortedUnique(disposition.reasons),
      });
    }
  }
  sections.sort((left, right) =>
    left.namespace.localeCompare(right.namespace),
  );
  const material = {
    provenance_version: DIAGNOSTIC_OUTCOME_CAPTURE_FAILURE_PROVENANCE_V2,
    sections,
  };
  return { ...material, provenance_digest: sha(material) };
}

function buildResult(
  requestValue: unknown,
  request: DiagnosticDecisionOutcomeCaptureRequestV2 | null,
  taxonomy: DiagnosticDecisionOutcomeCaptureTaxonomyV2,
  reasonCodes: string[],
  authorityStatus:
    DiagnosticDecisionOutcomeCaptureResultV2["authority_binding"]["verification_status"],
  snapshotBindingValue: DiagnosticOutcomeRegistrySnapshotBindingV2,
  snapshot: Readonly<DiagnosticOutcomeAuthorityMaterialV2> | null,
  snapshotFailure: DiagnosticOutcomeAuthoritySnapshotFailureV2 | null,
  sourceDispositions: Parameters<typeof observedProvenance>[3] = {},
  bundle: DiagnosticDecisionOutcomeCapturedBundleV2 | null = null,
) {
  const requestIdentity = {
    capture_identity: request?.capture_identity ?? "invalid",
    request_digest: request ? sha(request) : sha({ invalid_request: true }),
  };
  const provenance = observedProvenance(
    request,
    snapshot,
    snapshotFailure,
    sourceDispositions,
  );
  const reasons = sortedUnique(reasonCodes);
  const failureMaterial =
    taxonomy === "captured"
      ? null
      : {
          contract_version: DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2,
          taxonomy,
          request_identity: requestIdentity,
          registry_snapshot_binding: snapshotBindingValue,
          observed_source_provenance_digest: provenance.provenance_digest,
          reason_codes: reasons,
        };
  const material = {
    contract_version: DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_CAPTURE_V2,
    taxonomy,
    request_identity: requestIdentity,
    authority_binding: {
      authority_version:
        authorityStatus === "verified"
          ? DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2
          : null,
      verification_status: authorityStatus,
    },
    registry_snapshot_binding: snapshotBindingValue,
    observed_source_provenance: provenance,
    failure_identity_digest: failureMaterial ? sha(failureMaterial) : null,
    bundle,
    reason_codes: reasons,
    ...DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_BOUNDARY_V2,
  };
  void requestValue;
  return deepFreeze({
    ...material,
    terminal_capture_digest: sha(material),
  }) satisfies DiagnosticDecisionOutcomeCaptureResultV2;
}

function validateAndBuildBundle(
  request: DiagnosticDecisionOutcomeCaptureRequestV2,
  snapshot: Readonly<DiagnosticOutcomeAuthorityMaterialV2>,
  bindingValue: DiagnosticOutcomeRegistrySnapshotBindingV2,
) {
  const registry = snapshot.registry;
  const sourceDispositions: Parameters<typeof observedProvenance>[3] = {};
  const incomplete: string[] = [];
  const conflicting: string[] = [];
  const notSafe: string[] = [];
  const unmappable: string[] = [];

  for (const namespace of SOURCE_NAMESPACES) {
    const expected = registry.sources[namespace];
    const payload = snapshot.source_payloads[namespace];
    const reasons: string[] = [];
    if (requestReference(request, namespace) !== expected.payload_identity) {
      reasons.push("source_identity_not_registered");
      unmappable.push(`source_identity_not_registered:${namespace}`);
    }
    if (sha(payload) !== expected.payload_digest) {
      reasons.push("source_payload_digest_mismatch");
      conflicting.push(`source_payload_digest_mismatch:${namespace}`);
    }
    sourceDispositions[namespace] = {
      disposition: reasons.length === 0 ? "verified" : "rejected",
      reasons,
    };
  }
  if (conflicting.length || unmappable.length) {
    return {
      taxonomy: conflicting.length ? "conflicting" as const : "unmappable" as const,
      reasons: sortedUnique([...conflicting, ...unmappable]),
      sourceDispositions,
      bundle: null,
    };
  }

  const payloads = snapshot.source_payloads;
  const decision = exactKeys(
    payloads.decision_source,
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
    conflicting,
  );
  const opportunity = exactKeys(
    payloads.opportunity_set_source,
    [
      "schema_version",
      "source_identity",
      "opportunity_set_identity",
      "completeness",
      "membership",
    ],
    "$opportunity",
    conflicting,
  );
  const evaluator = exactKeys(
    payloads.evaluator_outcome_source,
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
    conflicting,
  );
  const provider = exactKeys(
    payloads.provider_context_source,
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
    conflicting,
  );
  const cost = exactKeys(
    payloads.cost_slippage_source,
    [
      "schema_version",
      "source_identity",
      "status",
      "cost_model_version",
      "slippage_model_version",
      "provenance_digest",
    ],
    "$cost",
    conflicting,
  );
  if (!decision || !opportunity || !evaluator || !provider || !cost) {
    return {
      taxonomy: "conflicting" as const,
      reasons: sortedUnique(conflicting),
      sourceDispositions,
      bundle: null,
    };
  }
  requireStrings(
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
    conflicting,
  );
  requireStrings(
    opportunity,
    ["schema_version", "source_identity", "opportunity_set_identity", "completeness"],
    "$opportunity",
    conflicting,
  );
  requireStrings(
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
    conflicting,
  );
  requireStrings(
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
    conflicting,
  );
  requireStrings(
    cost,
    ["schema_version", "source_identity", "status", "provenance_digest"],
    "$cost",
    conflicting,
  );
  const outcomeWindow = exactKeys(
    evaluator.outcome_window,
    ["definition", "start_timestamp", "end_timestamp"],
    "$evaluator.outcome_window",
    conflicting,
  );
  const completion = exactKeys(
    evaluator.completion,
    ["status", "completion_timestamp", "evidence_digest"],
    "$evaluator.completion",
    conflicting,
  );
  const definitions = exactKeys(
    evaluator.definitions,
    ["target", "stop", "diagnostic_horizon"],
    "$evaluator.definitions",
    conflicting,
  );
  const realized = exactKeys(
    evaluator.realized_outcome,
    ["label", "value", "unit"],
    "$evaluator.realized_outcome",
    conflicting,
  );
  const outcomeMembership = exactKeys(
    evaluator.membership,
    ["opportunity_set_identity", "dataset"],
    "$evaluator.membership",
    conflicting,
  );
  if (!outcomeWindow || !completion || !definitions || !realized || !outcomeMembership) {
    return {
      taxonomy: "conflicting" as const,
      reasons: sortedUnique(conflicting),
      sourceDispositions,
      bundle: null,
    };
  }
  requireStrings(
    outcomeWindow,
    ["definition", "start_timestamp", "end_timestamp"],
    "$evaluator.outcome_window",
    conflicting,
  );
  requireStrings(
    definitions,
    ["target", "stop", "diagnostic_horizon"],
    "$evaluator.definitions",
    conflicting,
  );
  requireStrings(
    outcomeMembership,
    ["opportunity_set_identity", "dataset"],
    "$evaluator.membership",
    conflicting,
  );
  if (
    !["completed", "pending"].includes(String(completion.status)) ||
    !isSha256(completion.evidence_digest) ||
    (completion.status === "completed" &&
      typeof completion.completion_timestamp !== "string") ||
    (completion.status === "pending" && completion.completion_timestamp !== null)
  ) {
    conflicting.push("outcome_completion_contract_invalid");
  }
  if (
    typeof realized.label !== "string" ||
    !(realized.value === null || typeof realized.value === "string") ||
    !(realized.unit === null || typeof realized.unit === "string")
  ) {
    conflicting.push("realized_outcome_contract_invalid");
  }
  if (
    !["declared", "not_available"].includes(String(cost.status)) ||
    !(cost.cost_model_version === null || typeof cost.cost_model_version === "string") ||
    !(cost.slippage_model_version === null ||
      typeof cost.slippage_model_version === "string")
  ) {
    conflicting.push("cost_slippage_contract_invalid");
  }

  const completionPending = completion.status !== "completed";
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
      completionPending ? evaluator.capture_timestamp : completion.completion_timestamp,
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
    notSafe.push("capture_explicit_instant_invalid");
  } else {
    const ns = Object.fromEntries(
      Object.entries(parsed).map(([key, entry]) => [
        key,
        BigInt(entry.ok ? entry.unix_nanoseconds : "0"),
      ]),
    ) as Record<keyof typeof parsed, bigint>;
    if (
      !(
        ns.decision < ns.outcomeStart &&
        ns.outcomeStart <= ns.outcomeEnd &&
        ns.outcomeEnd <= ns.completion &&
        ns.completion <= ns.capture
      )
    ) {
      notSafe.push("capture_temporal_order_invalid");
    }
    if (
      ns.decisionSource > ns.decision ||
      ns.provider > ns.capture ||
      !isUnixNs(decision.latest_finalized_bucket_unix_ns) ||
      (isUnixNs(decision.latest_finalized_bucket_unix_ns) &&
        BigInt(decision.latest_finalized_bucket_unix_ns) > ns.decision)
    ) {
      notSafe.push("capture_source_or_finalization_after_boundary");
    }
    if (
      ns.decision < BigInt(registry.validity.effective_from_unix_ns) ||
      ns.capture >= BigInt(registry.validity.effective_until_unix_ns)
    ) {
      notSafe.push("capture_outside_registry_validity");
    }
  }

  const membership = Array.isArray(opportunity.membership)
    ? opportunity.membership
        .map((entry, index) =>
          exactKeys(
            entry,
            ["instrument_id", "ordinal"],
            `$opportunity.membership[${index}]`,
            conflicting,
          ),
        )
        .filter((entry): entry is PlainRecord => entry !== null)
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
  if (opportunity.completeness !== "complete" || membership.length === 0) {
    incomplete.push("opportunity_membership_incomplete");
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
    new Set(membership.map((entry) => entry.ordinal)).size !== membership.length
  ) {
    conflicting.push("opportunity_membership_collision");
  }
  if (completion.status !== "completed") incomplete.push("outcome_completion_missing");
  if (
    decision.external_decision_id !== evaluator.external_decision_id ||
    decision.instrument_id !== evaluator.instrument_id ||
    opportunity.opportunity_set_identity !==
      outcomeMembership.opportunity_set_identity
  ) {
    conflicting.push("decision_outcome_identity_mismatch");
  }
  if (
    evaluator.evaluator_identity !== registry.producer.identity ||
    evaluator.evaluator_version !== registry.producer.version
  ) {
    conflicting.push("evaluator_identity_or_version_mismatch");
  }
  if (
    !membership.some((entry) => entry.instrument_id === decision.instrument_id)
  ) {
    unmappable.push("decision_instrument_not_in_opportunity_set");
  }
  if (
    !isSha256(decision.context_snapshot_digest) ||
    !isSha256(evaluator.evaluator_run_digest) ||
    !isSha256(completion.evidence_digest) ||
    !isSha256(provider.evaluator_lineage_digest) ||
    !isSha256(provider.outcome_lineage_digest) ||
    !isSha256(cost.provenance_digest)
  ) {
    conflicting.push("capture_lineage_digest_invalid");
  }
  if (conflicting.length || notSafe.length || unmappable.length || incomplete.length) {
    const taxonomy: DiagnosticDecisionOutcomeCaptureTaxonomyV2 =
      conflicting.length
      ? "conflicting"
      : notSafe.length
        ? "not_point_in_time_safe"
        : unmappable.length
          ? "unmappable"
          : "incomplete";
    return {
      taxonomy,
      reasons: sortedUnique([
        ...conflicting,
        ...notSafe,
        ...unmappable,
        ...incomplete,
      ]),
      sourceDispositions,
      bundle: null,
    };
  }

  const outcomeMaterial = {
    handoff_version: MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1,
    outcome_identity: String(evaluator.outcome_identity),
    decision_identity: {
      external_decision_id: String(decision.external_decision_id),
      decision_unix_ns: parsed.decision.ok
        ? parsed.decision.unix_nanoseconds
        : "0",
      instrument_id: String(decision.instrument_id),
    },
    opportunity_set: {
      identity: String(opportunity.opportunity_set_identity),
      completeness: "complete" as const,
      membership,
      membership_digest: sha(membership),
    },
    versions: {
      baseline: String(evaluator.baseline_version),
      candidate: String(evaluator.candidate_version),
      evaluator: String(evaluator.evaluator_version),
    },
    outcome_window: {
      definition: String(outcomeWindow.definition),
      start_timestamp: String(outcomeWindow.start_timestamp),
      end_timestamp: String(outcomeWindow.end_timestamp),
    },
    outcome_completion: {
      status: "completed" as const,
      completion_timestamp: String(completion.completion_timestamp),
      evidence_digest: String(completion.evidence_digest),
    },
    evaluation: {
      capture_timestamp: String(evaluator.capture_timestamp),
      evaluator_run_digest: String(evaluator.evaluator_run_digest),
    },
    definitions: {
      target: String(definitions.target),
      stop: String(definitions.stop),
      diagnostic_horizon: String(definitions.diagnostic_horizon),
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
      evaluator_lineage_digest: String(provider.evaluator_lineage_digest),
      outcome_lineage_digest: String(provider.outcome_lineage_digest),
    },
    membership: {
      period: request.period,
      cohort: request.cohort,
      dataset: String(outcomeMembership.dataset),
    },
    later_observed_outcome: {
      label: String(realized.label),
      value: realized.value === null ? null : String(realized.value),
      unit: realized.unit === null ? null : String(realized.unit),
    },
  } satisfies Omit<MarketContextDiagnosticOutcomeBundleHandoffV1, "bundle_digest">;
  const outcomeHandoff = {
    ...outcomeMaterial,
    bundle_digest: marketContextDiagnosticOutcomeBundleDigestV1(outcomeMaterial),
  };
  const sourcePayloadDigests = Object.fromEntries(
    SOURCE_NAMESPACES.map((namespace) => [
      namespace,
      registry.sources[namespace].payload_digest,
    ]),
  ) as Record<DiagnosticOutcomeSourceNamespaceV2, string>;
  const captureMaterial = {
    bundle_version: DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_BUNDLE_V2,
    capture_identity: request.capture_identity,
    period: request.period,
    cohort: request.cohort,
    source_registry: {
      registry_identity: registry.registry_identity,
      registry_version: registry.registry_version,
      registry_snapshot_digest: String(bindingValue.registry_snapshot_digest),
      authority_material_digest: String(bindingValue.authority_material_digest),
      trust_root_digest: registry.expected_trust_root_digest,
    },
    source_payload_digests: sourcePayloadDigests,
    outcome_handoff: outcomeHandoff,
  };
  return {
    taxonomy: "captured" as const,
    reasons: ["diagnostic_outcome_handoff_captured"],
    sourceDispositions,
    bundle: {
      ...captureMaterial,
      capture_bundle_digest: sha(captureMaterial),
    },
  };
}

const defaultOffBinding = snapshotBinding("not_read_default_off", null);
const killSwitchBinding = snapshotBinding("not_read_kill_switch", null);
const defaultOffResult = buildResult(
  null,
  null,
  "incomplete",
  ["capture_default_off"],
  "not_read_default_off",
  defaultOffBinding,
  null,
  null,
);
const killSwitchResult = buildResult(
  null,
  null,
  "conflicting",
  ["capture_kill_switch_active"],
  "not_read_kill_switch",
  killSwitchBinding,
  null,
  null,
);

export function captureDiagnosticDecisionOutcomeHandoffV2(
  value: unknown,
  dependencies: DiagnosticDecisionOutcomeCaptureDependenciesV2,
): DiagnosticDecisionOutcomeCaptureResultV2 {
  if (!dependencies.enabled) return defaultOffResult;
  if (dependencies.kill_switch) return killSwitchResult;

  const checkedRequest = validateRequest(value);
  if (!checkedRequest.request) {
    return buildResult(
      value,
      null,
      "conflicting",
      checkedRequest.reasons,
      "invalid",
      snapshotBinding("absent", null),
      null,
      null,
    );
  }
  const request = checkedRequest.request;
  const authority = dependencies.authority;
  if (
    !authority ||
    authority.authority_version !== DIAGNOSTIC_OUTCOME_SOURCE_AUTHORITY_V2
  ) {
    return buildResult(
      value,
      request,
      "conflicting",
      ["external_source_authority_missing_or_invalid"],
      "missing",
      snapshotBinding("absent", null),
      null,
      null,
    );
  }
  let anchorValue: unknown;
  try {
    anchorValue = authority.expected_registry_anchor;
  } catch {
    return buildResult(
      value,
      request,
      "conflicting",
      ["external_registry_anchor_read_exception_sanitized"],
      "invalid",
      snapshotBinding("malformed", null),
      null,
      null,
    );
  }
  const canonicalAnchor =
    canonicalizeDiagnosticOutcomeAuthorityPlainDataV2(anchorValue);
  const anchorReasons: string[] = [];
  const anchorRecord = canonicalAnchor.ok
    ? exactKeys(
        canonicalAnchor.value,
        [
          "registry_identity",
          "registry_version",
          "registry_snapshot_digest",
        ],
        "$authority.expected_registry_anchor",
        anchorReasons,
      )
    : null;
  if (!canonicalAnchor.ok) {
    anchorReasons.push(...canonicalAnchor.reason_codes);
  }
  if (
    !anchorRecord ||
    typeof anchorRecord.registry_identity !== "string" ||
    anchorRecord.registry_identity.length === 0 ||
    anchorRecord.registry_version !== DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2 ||
    !isSha256(anchorRecord.registry_snapshot_digest)
  ) {
    anchorReasons.push("external_registry_anchor_invalid");
  }
  if (anchorReasons.length > 0 || !anchorRecord) {
    return buildResult(
      value,
      request,
      "conflicting",
      sortedUnique(anchorReasons),
      "invalid",
      snapshotBinding("malformed", null),
      null,
      null,
    );
  }
  const immutableAnchor = deepFreeze({
    registry_identity: String(anchorRecord.registry_identity),
    registry_version: DIAGNOSTIC_OUTCOME_SOURCE_REGISTRY_V2,
    registry_snapshot_digest: String(
      anchorRecord.registry_snapshot_digest,
    ),
  });
  let observed: unknown;
  try {
    observed = authority.read_capture_material();
  } catch {
    const failure: DiagnosticOutcomeAuthoritySnapshotFailureV2 = {
      ok: false,
      binding: snapshotBinding(
        "absent",
        immutableAnchor,
      ),
      reason_codes: ["authority_material_lookup_exception_sanitized"],
      observed_input_digest: sha({
        disposition: "absent",
        reason: "authority_material_lookup_exception_sanitized",
      }),
    };
    return buildResult(
      value,
      request,
      "conflicting",
      failure.reason_codes,
      "lookup_failed",
      failure.binding,
      null,
      failure,
    );
  }
  const snapshotted = snapshotDiagnosticOutcomeAuthorityMaterialV2(
    observed,
    immutableAnchor,
  );
  if (!snapshotted.ok) {
    return buildResult(
      value,
      request,
      "conflicting",
      snapshotted.reason_codes,
      snapshotted.reason_codes.includes("source_registry_anchor_mismatch")
        ? "mismatch"
        : "invalid",
      snapshotted.binding,
      null,
      snapshotted,
    );
  }
  const built: {
    taxonomy: DiagnosticDecisionOutcomeCaptureTaxonomyV2;
    reasons: string[];
    sourceDispositions: Parameters<typeof observedProvenance>[3];
    bundle: DiagnosticDecisionOutcomeCapturedBundleV2 | null;
  } = validateAndBuildBundle(
    request,
    snapshotted.snapshot,
    snapshotted.binding,
  );
  return buildResult(
    value,
    request,
    built.taxonomy,
    built.reasons,
    "verified",
    snapshotted.binding,
    snapshotted.snapshot,
    null,
    built.sourceDispositions,
    built.bundle,
  );
}

function conflictFromResult(
  source: DiagnosticDecisionOutcomeCaptureResultV2,
  reason: string,
) {
  const material = {
    ...source,
    taxonomy: "conflicting" as const,
    bundle: null,
    reason_codes: sortedUnique([...source.reason_codes, reason]),
    failure_identity_digest: sha({
      taxonomy: "conflicting",
      prior_terminal_capture_digest: source.terminal_capture_digest,
      reason,
    }),
  };
  const terminalMaterial = Object.fromEntries(
    Object.entries(material).filter(([key]) => key !== "terminal_capture_digest"),
  );
  return deepFreeze({
    ...material,
    terminal_capture_digest: sha(terminalMaterial),
  });
}

export function captureDiagnosticDecisionOutcomeHandoffBatchV2(
  values: unknown[],
  dependencies: DiagnosticDecisionOutcomeCaptureDependenciesV2,
) {
  if (!dependencies.enabled) return [defaultOffResult];
  if (dependencies.kill_switch) return [killSwitchResult];
  const results = values.map((value) =>
    captureDiagnosticDecisionOutcomeHandoffV2(value, dependencies),
  );
  const captureIdentities = new Map<string, Set<string>>();
  const decisionIdentities = new Map<string, Set<string>>();
  for (const result of results) {
    const captureSet =
      captureIdentities.get(result.request_identity.capture_identity) ??
      new Set<string>();
    captureSet.add(result.request_identity.request_digest);
    captureIdentities.set(result.request_identity.capture_identity, captureSet);
    if (result.bundle) {
      const identity = stableMarketContextDiagnosticContextJsonV1(
        result.bundle.outcome_handoff.decision_identity,
      );
      const decisionSet = decisionIdentities.get(identity) ?? new Set<string>();
      decisionSet.add(result.bundle.outcome_handoff.bundle_digest);
      decisionIdentities.set(identity, decisionSet);
    }
  }
  return results
    .map((entry) => {
      const count = results.filter(
        (candidate) =>
          candidate.request_identity.capture_identity ===
          entry.request_identity.capture_identity,
      ).length;
      if (count <= 1) return entry;
      const identities = captureIdentities.get(
        entry.request_identity.capture_identity,
      );
      return conflictFromResult(
        entry,
        identities?.size === 1
          ? "duplicate_capture_identity"
          : "capture_identity_conflicting_bytes",
      );
    })
    .map((entry) => {
      if (!entry.bundle) return entry;
      const identity = stableMarketContextDiagnosticContextJsonV1(
        entry.bundle.outcome_handoff.decision_identity,
      );
      const count = results.filter(
        (candidate) =>
          candidate.bundle &&
          stableMarketContextDiagnosticContextJsonV1(
            candidate.bundle.outcome_handoff.decision_identity,
          ) === identity,
      ).length;
      if (count <= 1) return entry;
      return conflictFromResult(
        entry,
        decisionIdentities.get(identity)?.size === 1
          ? "duplicate_decision_identity"
          : "decision_identity_conflicting_bytes",
      );
    })
    .sort(
      (left, right) =>
        left.request_identity.capture_identity.localeCompare(
          right.request_identity.capture_identity,
        ) ||
        left.request_identity.request_digest.localeCompare(
          right.request_identity.request_digest,
        ),
    );
}

export function verifyDiagnosticDecisionOutcomeCaptureResultV2(
  candidate: DiagnosticDecisionOutcomeCaptureResultV2,
  value: unknown,
  dependencies: DiagnosticDecisionOutcomeCaptureDependenciesV2,
) {
  return (
    stableMarketContextDiagnosticContextJsonV1(candidate) ===
    stableMarketContextDiagnosticContextJsonV1(
      captureDiagnosticDecisionOutcomeHandoffV2(value, dependencies),
    )
  );
}

export const DIAGNOSTIC_DECISION_OUTCOME_CAPTURE_COMPATIBILITY_V2 = {
  predecessor_contract: "diagnostic_decision_outcome_handoff_capture_v1",
  output_contract: DIAGNOSTIC_DECISION_OUTCOME_HANDOFF_BUNDLE_V2,
  outcome_handoff_contract: MARKET_CONTEXT_DIAGNOSTIC_OUTCOME_BUNDLE_HANDOFF_V1,
  registry_snapshot_contract: DIAGNOSTIC_OUTCOME_REGISTRY_SNAPSHOT_V1,
  authority_callback_count: 1,
  async_authority_supported: false,
  real_outcome_capture_performed: false,
  canonical_binding_ready: false,
  automatic_model_input_allowed: false,
  live_ranking_effect: false,
} as const;
