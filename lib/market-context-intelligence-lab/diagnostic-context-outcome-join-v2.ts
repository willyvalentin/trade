import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
  createMarketContextDiagnosticContextOutcomeJoinV1,
  type MarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
  type MarketContextDiagnosticContextOutcomeJoinDependenciesV1,
  type MarketContextDiagnosticContextOutcomeJoinResultV1,
} from "./diagnostic-context-outcome-join-v1";
import {
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "./diagnostic-context-feature-snapshot-v1";

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V2 =
  "market_context_diagnostic_context_outcome_join_v2" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_FAILURE_INPUT_PROVENANCE_V1 =
  "market_context_diagnostic_failure_input_provenance_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_FAILURE_REBUILD_V1 =
  "market_context_diagnostic_failure_rebuild_v1" as const;

export const MARKET_CONTEXT_DIAGNOSTIC_OBSERVED_INPUT_DISPOSITIONS_V1 = [
  "absent",
  "malformed",
  "verified",
  "rejected",
] as const;

type ObservedInputDispositionV1 =
  (typeof MARKET_CONTEXT_DIAGNOSTIC_OBSERVED_INPUT_DISPOSITIONS_V1)[number];

type JsonRecord = Record<string, unknown>;

type ObservedInputCapture = {
  state:
    | "not_read"
    | "absent"
    | "observed"
    | "malformed"
    | "lookup_exception";
  observed_digest: string;
  schema_version: string | null;
  material: unknown | null;
  capture_reason: string;
};

export type MarketContextDiagnosticObservedInputSectionV1 = {
  section_namespace:
    | "registry_payload"
    | "context_handoff_payload"
    | "outcome_payload"
    | "decision_opportunity_evaluator_handoff";
  schema_version: string | null;
  observed_input_digest: string;
  disposition: ObservedInputDispositionV1;
  expected_authority_binding: {
    registry_identity: string | null;
    registry_version: string | null;
    registry_digest: string | null;
    expected_section_digest: string | null;
  };
  verifier: {
    identity: string;
    version: string | null;
  };
  reason_codes: string[];
};

export type MarketContextDiagnosticFailureInputProvenanceV1 = {
  provenance_version:
    typeof MARKET_CONTEXT_DIAGNOSTIC_FAILURE_INPUT_PROVENANCE_V1;
  sections: {
    registry: MarketContextDiagnosticObservedInputSectionV1;
    context_handoff: MarketContextDiagnosticObservedInputSectionV1;
    outcome: MarketContextDiagnosticObservedInputSectionV1;
    decision_opportunity_evaluator: MarketContextDiagnosticObservedInputSectionV1;
  };
  provenance_digest: string;
};

export type MarketContextDiagnosticContextOutcomeJoinResultV2 = Omit<
  MarketContextDiagnosticContextOutcomeJoinResultV1,
  "contract_version" | "result_digest"
> & {
  contract_version: typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V2;
  predecessor_contract_version:
    typeof MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1;
  predecessor_result_digest: string;
  observed_input_provenance: MarketContextDiagnosticFailureInputProvenanceV1;
  failure_identity_digest: string | null;
  independent_rebuild_version:
    typeof MARKET_CONTEXT_DIAGNOSTIC_FAILURE_REBUILD_V1;
  result_digest: string;
};

const ABSENT_SCHEMA_VERSION = null;
const SAFE_VERSION = /^[A-Za-z0-9._:-]{1,160}$/;

function ownDataProperty(value: unknown, key: string) {
  if (value === null || typeof value !== "object") {
    return { found: false, value: undefined };
  }
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) {
      return { found: false, value: undefined };
    }
    return { found: true, value: descriptor.value };
  } catch {
    return { found: false, value: undefined };
  }
}

function safeVersion(value: unknown) {
  return typeof value === "string" && SAFE_VERSION.test(value) ? value : null;
}

function scalarFingerprint(type: string, value: string) {
  return {
    runtime_type: type,
    value_digest:
      marketContextDiagnosticContextSha256V1(`${type}:${value}`),
  };
}

function sanitizeObservedInput(value: unknown) {
  const seen = new Map<object, number>();
  let nextReference = 0;

  function visit(candidate: unknown): unknown {
    if (candidate === null) return { runtime_type: "null" };
    if (typeof candidate === "string") {
      return scalarFingerprint("string", candidate);
    }
    if (typeof candidate === "boolean") {
      return scalarFingerprint("boolean", String(candidate));
    }
    if (typeof candidate === "number") {
      return scalarFingerprint(
        "number",
        Number.isNaN(candidate)
          ? "NaN"
          : candidate === Infinity
            ? "Infinity"
            : candidate === -Infinity
              ? "-Infinity"
              : Object.is(candidate, -0)
                ? "-0"
                : String(candidate),
      );
    }
    if (typeof candidate === "bigint") {
      return scalarFingerprint("bigint", candidate.toString());
    }
    if (typeof candidate === "undefined") {
      return { runtime_type: "undefined" };
    }
    if (typeof candidate === "symbol") {
      let description = "unreadable";
      try {
        description = candidate.description ?? "";
      } catch {
        // The sanitized unreadable sentinel is deterministic and exposes no error.
      }
      return scalarFingerprint("symbol", description);
    }
    if (typeof candidate === "function") {
      let source = "unreadable";
      try {
        source = Function.prototype.toString.call(candidate);
      } catch {
        // The sanitized unreadable sentinel is deterministic and exposes no error.
      }
      return scalarFingerprint("function", source);
    }
    if (typeof candidate !== "object") {
      return { runtime_type: "unsupported" };
    }

    const priorReference = seen.get(candidate);
    if (priorReference !== undefined) {
      return {
        runtime_type: "cycle_reference",
        reference: priorReference,
      };
    }
    const reference = nextReference;
    nextReference += 1;
    seen.set(candidate, reference);

    if (Array.isArray(candidate)) {
      let children: unknown[];
      try {
        children = candidate.map((child) => visit(child));
      } catch {
        children = [{ runtime_type: "unreadable_array" }];
      }
      return {
        runtime_type: "array",
        reference,
        children,
      };
    }

    let keys: string[];
    try {
      keys = Object.keys(candidate).sort((left, right) =>
        left.localeCompare(right),
      );
    } catch {
      return {
        runtime_type: "unreadable_object",
        reference,
      };
    }
    const properties: Array<{ key_digest: string; value: unknown }> = [];
    for (const key of keys) {
      let propertyValue: unknown;
      try {
        const descriptor = Object.getOwnPropertyDescriptor(candidate, key);
        propertyValue =
          descriptor && "value" in descriptor
            ? descriptor.value
            : { runtime_type: "accessor_not_invoked" };
      } catch {
        propertyValue = { runtime_type: "unreadable_property" };
      }
      properties.push({
        key_digest:
          marketContextDiagnosticContextSha256V1(`key:${key}`),
        value: visit(propertyValue),
      });
    }
    return {
      runtime_type: "object",
      reference,
      properties,
    };
  }

  return visit(value);
}

function observedDigest(namespace: string, value: unknown) {
  return marketContextDiagnosticContextSha256V1({
    provenance_version:
      MARKET_CONTEXT_DIAGNOSTIC_FAILURE_INPUT_PROVENANCE_V1,
    namespace,
    sanitized_observed_input: sanitizeObservedInput(value),
  });
}

function cloneForInternalUse(value: unknown) {
  try {
    return structuredClone(value);
  } catch {
    return null;
  }
}

function schemaVersion(value: unknown, keys: string[]) {
  for (const key of keys) {
    const property = ownDataProperty(value, key);
    if (property.found) {
      const version = safeVersion(property.value);
      if (version !== null) return version;
    }
  }
  return null;
}

function absentCapture(namespace: string, reason: string): ObservedInputCapture {
  const sentinel = {
    provenance_version:
      MARKET_CONTEXT_DIAGNOSTIC_FAILURE_INPUT_PROVENANCE_V1,
    section_namespace: namespace,
    disposition: "absent",
    sentinel: reason,
  };
  return {
    state: reason === "not_read" ? "not_read" : "absent",
    observed_digest:
      marketContextDiagnosticContextSha256V1(sentinel),
    schema_version: ABSENT_SCHEMA_VERSION,
    material: null,
    capture_reason: reason,
  };
}

function malformedCapture(
  namespace: string,
  value: unknown,
  reason: string,
): ObservedInputCapture {
  return {
    state: "malformed",
    observed_digest: observedDigest(namespace, value),
    schema_version: schemaVersion(value, [
      "registry_version",
      "handoff_version",
      "contract_version",
      "version",
    ]),
    material: cloneForInternalUse(value),
    capture_reason: reason,
  };
}

function exceptionCapture(
  namespace: string,
  operation: string,
): ObservedInputCapture {
  return {
    state: "lookup_exception",
    observed_digest:
      observedDigest(namespace, {
        sanitized_exception: true,
        operation,
      }),
    schema_version: null,
    material: null,
    capture_reason: "sanitized_lookup_exception",
  };
}

function observedCapture(
  namespace: string,
  value: unknown,
  schemaKeys: string[],
): ObservedInputCapture {
  const clone = cloneForInternalUse(value);
  if (clone === null) {
    return malformedCapture(
      namespace,
      value,
      "structured_clone_rejected",
    );
  }
  return {
    state: "observed",
    observed_digest: observedDigest(namespace, clone),
    schema_version: schemaVersion(clone, schemaKeys),
    material: clone,
    capture_reason: "observed",
  };
}

function captureResolution(
  namespace: string,
  value: unknown,
  payloadKey: "handoff" | "bundle",
) {
  const status = ownDataProperty(value, "status");
  if (status.found && status.value === "not_found") {
    return absentCapture(namespace, "authority_not_found");
  }
  if (status.found && status.value === "resolved") {
    const payload = ownDataProperty(value, payloadKey);
    if (payload.found) {
      return observedCapture(namespace, payload.value, [
        "handoff_version",
        "contract_version",
        "version",
      ]);
    }
  }
  return malformedCapture(
    namespace,
    value,
    "authority_resolution_malformed",
  );
}

function captureDecisionOpportunityEvaluator(
  outcome: ObservedInputCapture,
): ObservedInputCapture {
  if (outcome.state !== "observed" || outcome.material === null) {
    return absentCapture(
      "decision_opportunity_evaluator_handoff",
      "outcome_payload_not_observed",
    );
  }
  const projection = {
    handoff_version: ownDataProperty(
      outcome.material,
      "handoff_version",
    ).value,
    decision_identity: ownDataProperty(
      outcome.material,
      "decision_identity",
    ).value,
    opportunity_set: ownDataProperty(
      outcome.material,
      "opportunity_set",
    ).value,
    versions: ownDataProperty(outcome.material, "versions").value,
    evaluation: ownDataProperty(outcome.material, "evaluation").value,
    lineage: ownDataProperty(outcome.material, "lineage").value,
  };
  return observedCapture(
    "decision_opportunity_evaluator_handoff",
    projection,
    ["handoff_version"],
  );
}

function safeRegistryRecord(capture: ObservedInputCapture) {
  return capture.material !== null &&
    typeof capture.material === "object" &&
    !Array.isArray(capture.material)
    ? (capture.material as JsonRecord)
    : null;
}

function safeStringProperty(value: unknown, key: string) {
  const property = ownDataProperty(value, key);
  return property.found && typeof property.value === "string"
    ? property.value
    : null;
}

function nestedRecord(value: unknown, key: string) {
  const property = ownDataProperty(value, key);
  return property.found &&
    property.value !== null &&
    typeof property.value === "object" &&
    !Array.isArray(property.value)
    ? (property.value as JsonRecord)
    : null;
}

function expectedSectionDigest(
  registry: JsonRecord | null,
  mapKey: "context_handoff_digests" | "outcome_bundle_digests",
  identity: string,
) {
  const map = nestedRecord(registry, mapKey);
  return map === null ? null : safeStringProperty(map, identity);
}

function hasReason(
  reasons: string[],
  patterns: Array<string | RegExp>,
) {
  return reasons.some((reason) =>
    patterns.some((pattern) =>
      typeof pattern === "string"
        ? reason === pattern || reason.startsWith(pattern)
        : pattern.test(reason),
    ),
  );
}

function dispositionFor(
  namespace: MarketContextDiagnosticObservedInputSectionV1["section_namespace"],
  capture: ObservedInputCapture,
  base: MarketContextDiagnosticContextOutcomeJoinResultV1,
) {
  if (capture.state === "not_read" || capture.state === "absent") {
    return "absent" as const;
  }
  if (
    capture.state === "malformed" ||
    capture.state === "lookup_exception"
  ) {
    return "malformed" as const;
  }
  if (namespace === "registry_payload") {
    return base.authority_binding.verification_status === "verified"
      ? ("verified" as const)
      : ("rejected" as const);
  }
  if (namespace === "context_handoff_payload") {
    return hasReason(base.reason_codes, [
      "context_handoff_",
      "context_snapshot_content_",
      "context_snapshot_verifier_",
      "context_snapshot_registry_",
      "context_decision_",
      "context_latest_",
      "context_finalized_",
      "context_point_in_time_",
      "context_provider_",
    ])
      ? ("rejected" as const)
      : ("verified" as const);
  }
  if (namespace === "outcome_payload") {
    return hasReason(base.reason_codes, [
      "outcome_bundle_",
      "outcome_decision_identity_",
      "outcome_evaluator_",
      "outcome_window_invalid",
      "outcome_completion_evidence_",
      "outcome_evaluation_",
      "outcome_definitions_",
      "outcome_provider_",
      "outcome_membership_",
      "cost_slippage_",
      "explicit_instant_invalid:",
      "outcome_temporal_separation_invalid",
      "temporal_projection_unavailable",
    ])
      ? ("rejected" as const)
      : ("verified" as const);
  }
  return hasReason(base.reason_codes, [
    "decision_identity_",
    "instrument_identity_",
    "opportunity_set_",
    "instrument_missing_",
    "outcome_decision_identity_",
    "outcome_evaluator_",
  ])
    ? ("rejected" as const)
    : ("verified" as const);
}

function sectionReasons(
  namespace: MarketContextDiagnosticObservedInputSectionV1["section_namespace"],
  capture: ObservedInputCapture,
  disposition: ObservedInputDispositionV1,
  terminalReasons: string[],
) {
  const relevant = terminalReasons.filter((reason) => {
    if (namespace === "registry_payload") {
      return /authority|registry/.test(reason);
    }
    if (namespace === "context_handoff_payload") {
      return /context|finalized|provider_timestamp/.test(reason);
    }
    if (namespace === "outcome_payload") {
      return /outcome|temporal|cost_slippage|explicit_instant/.test(reason);
    }
    return /decision|instrument|opportunity|evaluator/.test(reason);
  });
  return [
    ...new Set([
      `observed_input_${disposition}`,
      `observed_input_capture:${capture.capture_reason}`,
      ...relevant,
    ]),
  ].sort();
}

function makeSection(
  namespace: MarketContextDiagnosticObservedInputSectionV1["section_namespace"],
  capture: ObservedInputCapture,
  base: MarketContextDiagnosticContextOutcomeJoinResultV1,
  expectedSection: string | null,
  verifierIdentity: string,
  verifierVersion: string | null,
): MarketContextDiagnosticObservedInputSectionV1 {
  const disposition = dispositionFor(namespace, capture, base);
  return {
    section_namespace: namespace,
    schema_version: capture.schema_version,
    observed_input_digest: capture.observed_digest,
    disposition,
    expected_authority_binding: {
      registry_identity: base.authority_binding.registry_identity,
      registry_version: base.authority_binding.registry_version,
      registry_digest: base.authority_binding.registry_digest,
      expected_section_digest: expectedSection,
    },
    verifier: {
      identity: verifierIdentity,
      version: verifierVersion,
    },
    reason_codes: sectionReasons(
      namespace,
      capture,
      disposition,
      base.reason_codes,
    ),
  };
}

function buildObservedInputProvenance(
  base: MarketContextDiagnosticContextOutcomeJoinResultV1,
  captures: {
    registry: ObservedInputCapture;
    context: ObservedInputCapture;
    outcome: ObservedInputCapture;
  },
) {
  const registry =
    base.authority_binding.verification_status === "verified"
      ? safeRegistryRecord(captures.registry)
      : null;
  const contextAuthority = nestedRecord(registry, "context_authority");
  const outcomeAuthority = nestedRecord(registry, "outcome_authority");
  const decisionCapture =
    captureDecisionOpportunityEvaluator(captures.outcome);
  const sections = {
    registry: makeSection(
      "registry_payload",
      captures.registry,
      base,
      base.authority_binding.registry_digest,
      "external_registry_anchor_verifier",
      base.authority_binding.authority_version,
    ),
    context_handoff: makeSection(
      "context_handoff_payload",
      captures.context,
      base,
      expectedSectionDigest(
        registry,
        "context_handoff_digests",
        base.request_identity.context_snapshot_identity,
      ),
      "context_snapshot_handoff_verifier",
      safeStringProperty(contextAuthority, "verifier_version"),
    ),
    outcome: makeSection(
      "outcome_payload",
      captures.outcome,
      base,
      expectedSectionDigest(
        registry,
        "outcome_bundle_digests",
        base.request_identity.outcome_identity,
      ),
      "diagnostic_outcome_bundle_verifier",
      safeStringProperty(outcomeAuthority, "verifier_version"),
    ),
    decision_opportunity_evaluator: makeSection(
      "decision_opportunity_evaluator_handoff",
      decisionCapture,
      base,
      expectedSectionDigest(
        registry,
        "outcome_bundle_digests",
        base.request_identity.outcome_identity,
      ),
      "decision_opportunity_evaluator_verifier",
      safeStringProperty(outcomeAuthority, "evaluator_version"),
    ),
  };
  const material = {
    provenance_version:
      MARKET_CONTEXT_DIAGNOSTIC_FAILURE_INPUT_PROVENANCE_V1,
    sections,
  };
  return {
    ...material,
    provenance_digest:
      marketContextDiagnosticContextSha256V1(material),
  };
}

function successorResult(
  base: MarketContextDiagnosticContextOutcomeJoinResultV1,
  provenance: MarketContextDiagnosticFailureInputProvenanceV1,
): MarketContextDiagnosticContextOutcomeJoinResultV2 {
  const {
    contract_version: predecessorContractVersion,
    result_digest: predecessorResultDigest,
    ...baseMaterial
  } = base;
  const failureIdentityMaterial =
    base.taxonomy === "joined"
      ? null
      : {
          contract_version:
            MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V2,
          predecessor_contract_version: predecessorContractVersion,
          predecessor_result_digest: predecessorResultDigest,
          taxonomy: base.taxonomy,
          request_identity: base.request_identity,
          expected_authority_binding: base.authority_binding,
          observed_input_provenance_digest:
            provenance.provenance_digest,
          reason_codes: base.reason_codes,
        };
  const material = {
    contract_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V2,
    predecessor_contract_version: predecessorContractVersion,
    predecessor_result_digest: predecessorResultDigest,
    ...baseMaterial,
    observed_input_provenance: provenance,
    failure_identity_digest:
      failureIdentityMaterial === null
        ? null
        : marketContextDiagnosticContextSha256V1(
            failureIdentityMaterial,
          ),
    independent_rebuild_version:
      MARKET_CONTEXT_DIAGNOSTIC_FAILURE_REBUILD_V1,
  };
  return {
    ...material,
    result_digest:
      marketContextDiagnosticContextSha256V1(material),
  };
}

function initialCaptures(reason: string) {
  return {
    registry: absentCapture("registry_payload", reason),
    context: absentCapture("context_handoff_payload", reason),
    outcome: absentCapture("outcome_payload", reason),
  };
}

export function createMarketContextDiagnosticContextOutcomeJoinV2(
  value: unknown,
  dependencies: MarketContextDiagnosticContextOutcomeJoinDependenciesV1,
): MarketContextDiagnosticContextOutcomeJoinResultV2 {
  if (!dependencies.enabled || dependencies.kill_switch) {
    const base =
      createMarketContextDiagnosticContextOutcomeJoinV1(
        value,
        dependencies,
      );
    const provenance = buildObservedInputProvenance(
      base,
      initialCaptures(
        dependencies.enabled ? "kill_switch_not_read" : "default_off_not_read",
      ),
    );
    return successorResult(base, provenance);
  }

  const captures = initialCaptures("not_read");
  const authority = dependencies.authority;
  const wrappedAuthority =
    authority === undefined
      ? undefined
      : {
          authority_version: authority.authority_version,
          expected_registry_anchor:
            authority.expected_registry_anchor,
          read_registry: () => {
            try {
              const observed = authority.read_registry();
              captures.registry = observedCapture(
                "registry_payload",
                observed,
                ["registry_version", "contract_version", "version"],
              );
              return observed;
            } catch {
              captures.registry = exceptionCapture(
                "registry_payload",
                "read_registry",
              );
              throw new Error("sanitized_registry_lookup_failure");
            }
          },
          read_context_handoff: (snapshotIdentity: string) => {
            try {
              const observed =
                authority.read_context_handoff(snapshotIdentity);
              captures.context = captureResolution(
                "context_handoff_payload",
                observed,
                "handoff",
              );
              return observed;
            } catch {
              captures.context = exceptionCapture(
                "context_handoff_payload",
                "read_context_handoff",
              );
              throw new Error("sanitized_context_lookup_failure");
            }
          },
          read_outcome_bundle: (outcomeIdentity: string) => {
            try {
              const observed =
                authority.read_outcome_bundle(outcomeIdentity);
              captures.outcome = captureResolution(
                "outcome_payload",
                observed,
                "bundle",
              );
              return observed;
            } catch {
              captures.outcome = exceptionCapture(
                "outcome_payload",
                "read_outcome_bundle",
              );
              throw new Error("sanitized_outcome_lookup_failure");
            }
          },
        };
  const base =
    createMarketContextDiagnosticContextOutcomeJoinV1(
      value,
      {
        enabled: true,
        kill_switch: false,
        authority: wrappedAuthority,
      },
    );
  return successorResult(
    base,
    buildObservedInputProvenance(base, captures),
  );
}

export function verifyMarketContextDiagnosticContextOutcomeJoinV2(
  candidate: MarketContextDiagnosticContextOutcomeJoinResultV2,
  value: unknown,
  dependencies: MarketContextDiagnosticContextOutcomeJoinDependenciesV1,
) {
  const rebuilt =
    createMarketContextDiagnosticContextOutcomeJoinV2(
      value,
      dependencies,
    );
  return (
    candidate.independent_rebuild_version ===
      MARKET_CONTEXT_DIAGNOSTIC_FAILURE_REBUILD_V1 &&
    stableMarketContextDiagnosticContextJsonV1(candidate) ===
      stableMarketContextDiagnosticContextJsonV1(rebuilt)
  );
}

export function createObservedInputAuthorityRegistryDigestV2(
  value: MarketContextDiagnosticContextOutcomeAuthorityRegistryV1,
) {
  return observedDigest("registry_payload", value);
}

export function createObservedInputPayloadDigestV2(
  namespace:
    | "context_handoff_payload"
    | "outcome_payload"
    | "decision_opportunity_evaluator_handoff",
  value: unknown,
) {
  return observedDigest(namespace, value);
}

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V2_COMPATIBILITY = {
  predecessor_contract:
    MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_JOIN_V1,
  external_authority_contract:
    MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_OUTCOME_AUTHORITY_V1,
  joined_projection_semantics_unchanged: true,
  predecessor_failure_results_implicitly_remediated: false,
  real_outcome_join_performed: false,
  canonical_binding_ready: false,
  automatic_model_input_allowed: false,
  live_ranking_effect: false,
} as const;
